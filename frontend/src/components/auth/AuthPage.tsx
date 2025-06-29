import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react';
import Alert from '../ui/Alert';
import Label from '../ui/Label';

interface AuthPageProps {
  onLogin?: (credentials: LoginCredentials) => void;
  onRegister?: (userData: RegisterData) => void;
  isLoading?: boolean;
  error?: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  company?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onRegister,
  isLoading = false,
  error = null
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!loginData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(loginData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!loginData.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0 && onLogin) {
      onLogin(loginData);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!registerData.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!registerData.lastName) {
      errors.lastName = 'Last name is required';
    }

    if (!registerData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(registerData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!registerData.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(registerData.password)) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!registerData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0 && onRegister) {
      onRegister(registerData);
    }
  };

  const handleLoginInputChange = (field: keyof LoginCredentials, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegisterInputChange = (field: keyof RegisterData, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Digame
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your Digital Twin Platform
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">Get Started</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50" variant="destructive">
                {error}
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => handleLoginInputChange('email', e.target.value)}
                        className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => handleLoginInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-sm text-red-600">{validationErrors.password}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-firstName"
                          type="text"
                          placeholder="First name"
                          value={registerData.firstName}
                          onChange={(e) => handleRegisterInputChange('firstName', e.target.value)}
                          className={`pl-10 ${validationErrors.firstName ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                      </div>
                      {validationErrors.firstName && (
                        <p className="text-sm text-red-600">{validationErrors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-lastName">Last Name</Label>
                      <Input
                        id="register-lastName"
                        type="text"
                        placeholder="Last name"
                        value={registerData.lastName}
                        onChange={(e) => handleRegisterInputChange('lastName', e.target.value)}
                        className={validationErrors.lastName ? 'border-red-500' : ''}
                        disabled={isLoading}
                      />
                      {validationErrors.lastName && (
                        <p className="text-sm text-red-600">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                        className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-company">Company (Optional)</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-company"
                        type="text"
                        placeholder="Company name"
                        value={registerData.company}
                        onChange={(e) => handleRegisterInputChange('company', e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-sm text-red-600">{validationErrors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;