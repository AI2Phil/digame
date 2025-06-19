import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button'; // Will be used for non-submit buttons
// Input from '../ui/Input' is no longer needed directly, FormInput will be used.
import { Card } from '../ui/Card';
import { Toast } from '../ui/Toast';
import { Form, FormField, FormLabel, FormInput, FormSubmitButton } from '../ui/Form';

const AuthForm = ({ onLogin, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // formData state is still needed for defaultValues and for fields not directly part of the form schema at all times (like confirmPassword)
  // Or, more cleanly, defaultValues can be set directly in the <Form> component.
  // For simplicity, we'll keep formData for initializing defaultValues.
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  // handleInputChange is no longer needed as FormInput handles its own state via context.

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Define validation schema for the Form component
  const authValidationSchema = useMemo(() => {
    const schema = {
      username: { required: 'Username is required' },
      password: {
        required: 'Password is required',
        minLength: 6 // Assuming Form.jsx supports minLength like this
      },
    };
    if (!isLogin) {
      schema.email = {
        required: 'Email is required',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Assuming Form.jsx supports pattern like this
        patternMessage: 'Please enter a valid email address'
      };
      schema.confirmPassword = {
        required: 'Confirm Password is required',
        validate: (value, values) => value === values.password || 'Passwords do not match'
      };
      // firstName and lastName are optional, so no validation unless specified
    }
    return schema;
  }, [isLogin]);


  // handleSubmit now receives values from the Form component
  const handleSubmit = async (values) => {
    // validateForm() is handled by the Form component via the validation schema.
    // e.preventDefault() is handled by the Form component.
    setIsLoading(true);

    try {
      if (isLogin) {
        await handleLogin(values);
      } else {
        await handleRegister(values);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setToast({
        type: 'error',
        title: isLogin ? 'Login Failed' : 'Registration Failed',
        message: error.message || 'An unexpected error occurred',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (values) => {
    const loginData = new FormData();
    loginData.append('username', values.username);
    loginData.append('password', values.password);

    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      body: loginData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    
    setToast({
      type: 'success',
      title: 'Login Successful',
      message: `Welcome back, ${data.user.username}!`,
      duration: 3000
    });

    // Call the onLogin callback with user data and tokens
    setTimeout(() => {
      onLogin(data.user, data.tokens);
    }, 1000);
  };

  const handleRegister = async (values) => {
    const registerData = {
      username: values.username,
      email: values.email,
      password: values.password,
      first_name: values.firstName || null,
      last_name: values.lastName || null
    };

    const response = await fetch('http://localhost:8000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    const data = await response.json();
    
    setToast({
      type: 'success',
      title: 'Registration Successful',
      message: `Welcome to Digame, ${data.user.username}!`,
      duration: 3000
    });

    // Call the onLogin callback with user data and tokens
    setTimeout(() => {
      onLogin(data.user, data.tokens);
    }, 1000);
  };

  const closeToast = () => {
    setToast(null);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md p-6 relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="digame-logo">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Digame</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLogin 
                ? 'Sign in to access your digital twin' 
                : 'Join the future of professional development'
              }
            </p>
          </div>

          {/* Form */}
          <Form
            onSubmit={handleSubmit}
            className="space-y-4"
            defaultValues={formData}
            validation={authValidationSchema}
          >
            <FormField name="username" className="space-y-1">
              <FormLabel htmlFor="username">Username</FormLabel>
              <FormInput
                id="username"
                type="text"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </FormField>

            {!isLogin && (
              <FormField name="email" className="space-y-1">
                <FormLabel htmlFor="email">Email Address</FormLabel>
                <FormInput
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </FormField>
            )}

            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <FormField name="firstName" className="space-y-1">
                  <FormLabel htmlFor="firstName">First Name</FormLabel>
                  <FormInput
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    disabled={isLoading}
                  />
                </FormField>
                <FormField name="lastName" className="space-y-1">
                  <FormLabel htmlFor="lastName">Last Name</FormLabel>
                  <FormInput
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    disabled={isLoading}
                  />
                </FormField>
              </div>
            )}

            <FormField name="password" className="space-y-1">
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormInput
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </FormField>

            {!isLogin && (
              <FormField name="confirmPassword" className="space-y-1">
                <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                <FormInput
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                />
              </FormField>
            )}

            <FormSubmitButton className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </FormSubmitButton>
          </Form>

          {/* Toggle between login and register */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <Button
                type="button"
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-medium" // text-blue-600 hover:text-blue-700 is handled by variant="link"
                disabled={isLoading}
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </Button>
            </p>
          </div>

          {/* Demo note */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Demo Users:</strong> You can create a test account or use the demo mode to explore the platform.
            </p>
          </div>
        </Card>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={closeToast}
        />
      )}
    </>
  );
};

export default AuthForm;