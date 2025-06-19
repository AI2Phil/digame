import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Github, Chrome } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label as UiLabel } from '../components/ui/Label'; // Alias to avoid conflict
import { Checkbox } from '../components/ui/Checkbox';
import { Separator } from '../components/ui/Separator';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Form, FormField, FormInput, FormLabel, FormSubmitButton, FormCheckbox } from '../components/ui/Form';
import { Badge } from '../components/ui/Badge';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // handleSubmit now receives form values from the Form component
  const handleSubmit = async (values) => {
    // e.preventDefault() is handled by the Form component internally
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use 'values' from the Form component, not the local formData state
      if (values.email === 'demo@digame.com' && values.password === 'demo123') {
        // Successful login - redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError('Invalid email or password. Try demo@digame.com / demo123');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    // Simulate social login
    setTimeout(() => {
      setIsLoading(false);
      alert(`${provider} login would be implemented here`);
    }, 1000);
  };

  const handleForgotPassword = () => {
    alert('Password reset functionality would be implemented here');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Digame</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
          <Badge variant="secondary" className="mt-2">
            Demo: demo@digame.com / demo123
          </Badge>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <Form
              onSubmit={handleSubmit}
              className="space-y-4"
              defaultValues={{ email: formData.email, password: formData.password, rememberMe: formData.rememberMe }}
              // Optional: Add validation schema if defined in Form.jsx's capabilities
              // validation={{
              //   email: { required: 'Email is required', pattern: /^\S+@\S+\.\S+$/, patternMessage: 'Invalid email format' },
              //   password: { required: 'Password is required', minLength: 6 }
              // }}
            >
              {/* Email Field */}
              <FormField name="email" className="space-y-2">
                <FormLabel htmlFor="email">Email Address</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <FormInput
                    id="email"
                    name="email" // FormInput uses name from FormField, but explicit doesn't hurt
                    type="email"
                    placeholder="Enter your email"
                    // value={formData.email} // Handled by Form context
                    // onChange={handleInputChange} // Handled by Form context
                    className="pl-10"
                    required // HTML5 required, Form component handles its own 'required' via validation prop
                    disabled={isLoading}
                  />
                </div>
              </FormField>

              {/* Password Field */}
              <FormField name="password" className="space-y-2">
                <FormLabel htmlFor="password">Password</FormLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <FormInput
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    // value={formData.password} // Handled by Form context
                    // onChange={handleInputChange} // Handled by Form context
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <FormField name="rememberMe" className="flex items-center space-x-2">
                  <FormCheckbox
                    id="rememberMe"
                    name="rememberMe"
                    // checked={formData.rememberMe} // Handled by Form context
                    // onCheckedChange handled by Form context
                    label="Remember me"
                    disabled={isLoading}
                    className="text-sm" // Applied to the label span inside FormCheckbox
                  />
                  {/* UiLabel is removed as FormCheckbox handles its own label */}
                </FormField>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  Forgot password?
                </Button>
              </div>

              {/* Sign In Button */}
              <FormSubmitButton className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </FormSubmitButton>
            </Form>

            {/* Separator */}
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 text-xs text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('Google')}
                disabled={isLoading}
                className="w-full"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('GitHub')}
                disabled={isLoading}
                className="w-full"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Separator />
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Button variant="link" className="px-0 text-sm">
                Sign up for free
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            By signing in, you agree to our{' '}
            <Button variant="link" className="px-0 text-xs">
              Terms of Service
            </Button>{' '}
            and{' '}
            <Button variant="link" className="px-0 text-xs">
              Privacy Policy
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;