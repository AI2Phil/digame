import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/Card';
import { Input } from '../src/components/ui/Input';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import apiService from '../src/services/apiService';

export default function AuthPage() {
  const router = useRouter();
  const { login, logout, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    // Only redirect if user is authenticated AND not loading
    // This prevents immediate redirect when tokens are being validated
    if (isAuthenticated && !authLoading) {
      // Small delay to allow user to see they're already signed in
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear API error
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation (for registration)
    if (!isLoginMode) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!isLoginMode && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation (for registration)
    if (!isLoginMode) {
      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');

    try {
      if (isLoginMode) {
        // Use AuthContext login method
        const success = await login({
          email: formData.username.includes('@') ? formData.username : undefined,
          username: !formData.username.includes('@') ? formData.username : undefined,
          password: formData.password,
          rememberMe: formData.rememberMe
        });

        if (success) {
          // AuthContext will handle token storage and state management
          // The useEffect will handle the redirect based on user role
          // No need to redirect here as useEffect will handle it
        } else {
          setApiError('Invalid credentials. Please try again.');
        }
      } else {
        // Handle registration separately since AuthContext doesn't have register method
        const payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
        };

        const response = await apiService.post('/auth/register', payload);
        const data = await response.json();

        if (response.ok) {
          // After successful registration, use AuthContext login
          const loginSuccess = await login({
            email: formData.email,
            password: formData.password
          });

          if (loginSuccess) {
            // Check if onboarding is needed
            if (data.user && !data.user.onboardingCompleted) {
              router.push('/onboarding-wizard');
            } else {
              // The useEffect will handle the redirect based on user role
              // No need to redirect here as useEffect will handle it
            }
          } else {
            setApiError('Registration successful, but login failed. Please try signing in.');
          }
        } else {
          // Handle API errors
          if (data.detail) {
            setApiError(data.detail);
          } else if (data.message) {
            setApiError(data.message);
          } else {
            setApiError('Registration failed. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    setApiError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      rememberMe: false,
    });
  };

  // Show already signed in message if user is authenticated
  if (isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Floating Glassmorphic Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-2xl border border-white/20">
                  <span className="text-white font-bold text-2xl">D</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 animate-pulse"></div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Digame</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Welcome Back!
            </h1>
            <p className="text-gray-300 text-lg">
              You're already signed in as <span className="text-cyan-400 font-medium">{user?.fullName || user?.username}</span>
            </p>
          </div>

          <Card className="shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
            <CardContent className="space-y-6 relative z-10 p-8">
              <div className="text-center space-y-4">
                <p className="text-gray-200">
                  Redirecting you to your dashboard in a moment...
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full h-14 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Continue to Dashboard
                </Button>
                
                <Button
                  onClick={async () => {
                    await logout();
                    setIsLoginMode(true);
                  }}
                  variant="outline"
                  className="w-full h-14 border-2 border-white/20 text-white hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-300"
                >
                  Sign Out & Use Different Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Floating Glassmorphic Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-600/15 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-l from-teal-400/15 to-cyan-600/15 rounded-full blur-2xl animate-pulse delay-700"></div>
      </div>

      {/* Inspirational Quote Section */}
      <div className="relative z-10 w-full max-w-2xl mb-8">
        <div className="backdrop-blur-xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="text-center space-y-3">
            <blockquote className="text-lg md:text-xl font-medium bg-gradient-to-r from-cyan-200 via-white to-purple-200 bg-clip-text text-transparent leading-relaxed">
              "Your digital twin is not just a reflection of who you are—it's a catalyst for who you can become. Every data point is a stepping stone to your extraordinary future."
            </blockquote>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent flex-1"></div>
              <cite className="text-cyan-300/80 text-sm font-medium px-3">
                — Nex 🎸
              </cite>
              <div className="h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent flex-1"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-2xl border border-white/20">
                <span className="text-white font-bold text-2xl">D</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 animate-pulse"></div>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Digame</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-300 text-lg">
            {isLoginMode
              ? 'Sign in to access your digital twin platform'
              : 'Join the future of professional development'
            }
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
          <CardHeader className="space-y-1 relative z-10">
            <CardTitle className="text-3xl text-center font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              {isLoginMode ? 'Sign In' : 'Sign Up'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10">
            {/* API Error Alert */}
            {apiError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 backdrop-blur-sm">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">{apiError}</p>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-200">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <Input
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`pl-12 h-14 bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl backdrop-blur-sm focus:bg-white/10 focus:border-white/30 transition-all duration-200 ${errors.username ? 'border-red-400 focus:border-red-400' : ''}`}
                    required
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-red-400">{errors.username}</p>
                )}
              </div>

              {/* Email Field (Registration only) */}
              {!isLoginMode && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-200">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`pl-12 h-14 bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl backdrop-blur-sm focus:bg-white/10 focus:border-white/30 transition-all duration-200 ${errors.email ? 'border-red-400 focus:border-red-400' : ''}`}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email}</p>
                  )}
                </div>
              )}

              {/* Name Fields (Registration only) */}
              {!isLoginMode && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-200">First Name</label>
                    <Input
                      name="firstName"
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="h-14 bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl backdrop-blur-sm focus:bg-white/10 focus:border-white/30 transition-all duration-200"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-200">Last Name</label>
                    <Input
                      name="lastName"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="h-14 bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl backdrop-blur-sm focus:bg-white/10 focus:border-white/30 transition-all duration-200"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-200">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-12 pr-12 h-14 bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl backdrop-blur-sm focus:bg-white/10 focus:border-white/30 transition-all duration-200 ${errors.password ? 'border-red-400 focus:border-red-400' : ''}`}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field (Registration only) */}
              {!isLoginMode && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-200">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`pl-12 pr-12 h-14 bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl backdrop-blur-sm focus:bg-white/10 focus:border-white/30 transition-all duration-200 ${errors.confirmPassword ? 'border-red-400 focus:border-red-400' : ''}`}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-4 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Remember Me Checkbox (Login only) */}
              {isLoginMode && (
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-cyan-500 bg-white/10 border-white/20 rounded focus:ring-cyan-500 focus:ring-2 backdrop-blur-sm"
                    disabled={isLoading}
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-200 cursor-pointer">
                    Remember me for 30 days
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{isLoginMode ? 'Signing In...' : 'Creating Account...'}</span>
                  </span>
                ) : (
                  isLoginMode ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center">
              <p className="text-gray-300">
                {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                <Button
                  type="button"
                  variant="link"
                  onClick={toggleMode}
                  className="ml-2 font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoginMode ? 'Create one' : 'Sign in'}
                </Button>
              </p>
            </div>

            {/* Demo Note */}
            <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-gray-200">
                <strong className="text-cyan-400">Demo:</strong> Want to try without signing up?
                <Button
                  type="button"
                  variant="link"
                  onClick={() => router.push('/demo')}
                  className="ml-1 text-cyan-400 hover:text-cyan-300 p-0 h-auto transition-colors duration-200"
                  disabled={isLoading}
                >
                  Launch Demo
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}