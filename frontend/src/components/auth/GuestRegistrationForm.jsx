import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Alert, AlertDescription } from '../ui/Alert';
import { Badge } from '../ui/Badge';

const GuestRegistrationForm = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    skipEmailVerification: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkEmailAvailability = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailAvailable(null);
      return;
    }

    setCheckingEmail(true);
    try {
      const response = await fetch(`http://localhost:8001/auth/guest/check-email/${encodeURIComponent(email)}`);
      const data = await response.json();
      setEmailAvailable(data.available);
    } catch (error) {
      console.error('Error checking email availability:', error);
      setEmailAvailable(null);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Check email availability with debounce
    if (name === 'email') {
      setEmailAvailable(null);
      clearTimeout(window.emailCheckTimeout);
      window.emailCheckTimeout = setTimeout(() => {
        checkEmailAvailability(value);
      }, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (emailAvailable === false) {
      setErrors({ email: 'This email is already registered' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8001/auth/guest/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName || null,
          last_name: formData.lastName || null,
          skip_email_verification: formData.skipEmailVerification
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      // Success! Call the onSuccess callback with the registration data
      onSuccess({
        user: data.data.user,
        onboarding: data.data.onboarding,
        requiresEmailVerification: data.data.requires_email_verification,
        verificationToken: data.data.verification_token
      });

    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        submit: error.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEmailStatusIcon = () => {
    if (checkingEmail) {
      return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
    if (emailAvailable === true) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (emailAvailable === false) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Create Guest Account</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
          </div>
          <CardDescription>
            Start exploring Digame with a 30-day guest account
          </CardDescription>
          <Badge variant="secondary" className="w-fit">
            🚀 Quick Setup - 2 minutes
          </Badge>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 ${errors.email ? 'border-red-500' : ''} ${emailAvailable === true ? 'border-green-500' : ''} ${emailAvailable === false ? 'border-red-500' : ''}`}
                  required
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-3">
                  {getEmailStatusIcon()}
                </div>
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
              {emailAvailable === false && (
                <p className="text-sm text-red-500">This email is already registered</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Skip Email Verification Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="skipEmailVerification"
                name="skipEmailVerification"
                checked={formData.skipEmailVerification}
                onChange={handleInputChange}
                className="rounded border-gray-300"
                disabled={isLoading}
              />
              <Label htmlFor="skipEmailVerification" className="text-sm">
                Skip email verification (for demo purposes)
              </Label>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || emailAvailable === false}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Guest Account'
              )}
            </Button>

            {/* Guest Account Benefits */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Guest Account Benefits:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• 30-day full platform access</li>
                <li>• Complete digital twin setup</li>
                <li>• All productivity features</li>
                <li>• Upgrade to full account anytime</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestRegistrationForm;