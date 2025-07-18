import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Eye, EyeOff, Mail, Lock, Github, Chrome } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const router = useRouter();
  const { login, enterDemoMode, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Ensure client-side rendering for form interactions
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Platform owner credentials
      const platformOwner = {
        email: 'philip.a.oshea@gmail.com',
        password: 'Dalk3y1306',
      };

      // Demo user credentials validation
      const demoCredentials = [
        { username: 'demo', password: 'demo' },
        { username: 'sarah_demo', password: 'demo123' },
        { username: 'alex_demo', password: 'demo123' },
        { username: 'guest', password: 'guest' },
      ];

      // Check platform owner credentials first
      const isPlatformOwner =
        formData.email === platformOwner.email && formData.password === platformOwner.password;

      // Check if credentials match any demo user (using username or email)
      const isValidDemo = demoCredentials.some(
        cred =>
          (formData.email === cred.username ||
            formData.email === `${cred.username}@digame.com` ||
            formData.email === `${cred.username}@example.com`) &&
          formData.password === cred.password
      );

      if (isPlatformOwner || isValidDemo) {
        // Use AuthContext login function
        const loginSuccess = await login({
          username: formData.email,
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        });

        if (loginSuccess) {
          console.log('Login successful via AuthContext');
          // Redirect based on user type
          if (isPlatformOwner) {
            router.push('/platform-owner');
          } else {
            router.push('/dashboard');
          }
        } else {
          setError('Login failed. Please check your credentials and try again.');
        }
      } else {
        console.log('Login failed - credentials:', {
          email: formData.email,
          password: formData.password,
        });
        setError(
          'Invalid credentials. Please use your platform owner account or one of the demo accounts shown above.'
        );
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle direct demo user login using AuthContext
  const handleDemoLogin = async demoUser => {
    if (!isClient) return;
    setIsLoading(true);

    try {
      console.log('Demo login initiated for:', demoUser);

      // Use AuthContext enterDemoMode function
      await enterDemoMode();

      console.log('Demo mode activated successfully');

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = provider => {
    if (!isClient) return;
    setIsLoading(true);
    // Simulate social login
    setTimeout(() => {
      setIsLoading(false);
      alert(`${provider} login would be implemented here`);
    }, 1000);
  };

  const handleForgotPassword = () => {
    if (!isClient) return;
    alert('Password reset functionality would be implemented here');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Digame</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
          {/* Demo Credentials Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                🧪 Test User Credentials
              </CardTitle>
              <CardDescription className="text-blue-600">
                Use these demo accounts to explore the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 text-sm">
                <button
                  onClick={() => handleDemoLogin('demo')}
                  disabled={isLoading}
                  className="flex justify-between items-center p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <div>
                    <span className="font-medium text-gray-900">demo</span>
                    <span className="text-gray-500 ml-2">/ demo</span>
                  </div>
                  <Badge variant="success" className="text-xs">
                    Fully Onboarded
                  </Badge>
                </button>
                <button
                  onClick={() => handleDemoLogin('sarah_demo')}
                  disabled={isLoading}
                  className="flex justify-between items-center p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <div>
                    <span className="font-medium text-gray-900">sarah_demo</span>
                    <span className="text-gray-500 ml-2">/ demo123</span>
                  </div>
                  <Badge variant="default" className="text-xs">
                    Product Manager
                  </Badge>
                </button>
                <button
                  onClick={() => handleDemoLogin('alex_demo')}
                  disabled={isLoading}
                  className="flex justify-between items-center p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <div>
                    <span className="font-medium text-gray-900">alex_demo</span>
                    <span className="text-gray-500 ml-2">/ demo123</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    New User
                  </Badge>
                </button>
                <button
                  onClick={() => handleDemoLogin('guest')}
                  disabled={isLoading}
                  className="flex justify-between items-center p-2 bg-white rounded border hover:bg-green-50 hover:border-green-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <div>
                    <span className="font-medium text-gray-900">guest</span>
                    <span className="text-gray-500 ml-2">/ No Auth Required</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Guest Access
                  </Badge>
                </button>
              </div>
              <div className="text-center text-xs text-blue-600 mt-2">
                👆 Click any demo user above for instant access
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
              <br />
              <span className="text-sm text-blue-600">
                Or use demo accounts above for instant access
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                  {isClient && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || authLoading}
              >
                {isLoading || authLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('GitHub')}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full border-t border-gray-300" />
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button className="text-blue-600 hover:text-blue-500 font-medium">
                Sign up for free
              </button>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            By signing in, you agree to our{' '}
            <button className="text-blue-600 hover:text-blue-500 underline">
              Terms of Service
            </button>{' '}
            and{' '}
            <button className="text-blue-600 hover:text-blue-500 underline">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
