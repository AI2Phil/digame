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

// Add CSS for the Digame logo with glassmorphic effects
const logoStyles = `
  .digame-logo {
    width: 3rem;
    height: 3rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }
  
  .digame-logo:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
  }
  
  .glassmorphic-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  .glassmorphic-input {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }
  
  .glassmorphic-input:focus {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
  }
`;

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
        // For Platform Owner and demo users, use AuthContext login function
        // This will make API calls to the backend for authentication
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
    <>
      <style dangerouslySetInnerHTML={{ __html: logoStyles }} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header with Digame Logo */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="digame-logo">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-2xl font-bold text-white">Digame</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-gray-300">Sign in to access your digital twin platform</p>
          {/* Demo Credentials Card */}
          <Card className="glassmorphic-card border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                🧪 Test User Credentials
              </CardTitle>
              <CardDescription className="text-gray-300">
                Use these demo accounts to explore the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 text-sm">
                <button
                  onClick={() => setFormData({ email: 'philip.a.oshea@gmail.com', password: 'Dalk3y1306', rememberMe: false })}
                  disabled={isLoading}
                  className="flex justify-between items-center p-3 glassmorphic-input rounded-lg hover:bg-white/20 transition-all cursor-pointer disabled:opacity-50 border-2 border-yellow-400/30"
                >
                  <div>
                    <span className="font-medium text-white">philip.a.oshea@gmail.com</span>
                    <span className="text-gray-300 ml-2">/ Dalk3y1306</span>
                  </div>
                  <Badge variant="default" className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                    Platform Owner
                  </Badge>
                </button>
                <button
                  onClick={() => handleDemoLogin('demo')}
                  disabled={isLoading}
                  className="flex justify-between items-center p-3 glassmorphic-input rounded-lg hover:bg-white/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <div>
                    <span className="font-medium text-white">demo</span>
                    <span className="text-gray-300 ml-2">/ demo</span>
                  </div>
                  <Badge variant="success" className="text-xs bg-green-500/20 text-green-300 border-green-400/30">
                    Fully Onboarded
                  </Badge>
                </button>
                <button
                  onClick={() => handleDemoLogin('sarah_demo')}
                  disabled={isLoading}
                  className="flex justify-between items-center p-3 glassmorphic-input rounded-lg hover:bg-white/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <div>
                    <span className="font-medium text-white">sarah_demo</span>
                    <span className="text-gray-300 ml-2">/ demo123</span>
                  </div>
                  <Badge variant="default" className="text-xs bg-blue-500/20 text-blue-300 border-blue-400/30">
                    Product Manager
                  </Badge>
                </button>
                <button
                  onClick={() => handleDemoLogin('alex_demo')}
                  disabled={isLoading}
                  className="flex justify-between items-center p-3 glassmorphic-input rounded-lg hover:bg-white/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <div>
                    <span className="font-medium text-white">alex_demo</span>
                    <span className="text-gray-300 ml-2">/ demo123</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                    New User
                  </Badge>
                </button>
                <button
                  onClick={() => handleDemoLogin('guest')}
                  disabled={isLoading}
                  className="flex justify-between items-center p-3 glassmorphic-input rounded-lg hover:bg-white/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <div>
                    <span className="font-medium text-white">guest</span>
                    <span className="text-gray-300 ml-2">/ No Auth Required</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-500/20 text-gray-300 border-gray-400/30">
                    Guest Access
                  </Badge>
                </button>
              </div>
              <div className="text-center text-xs text-gray-300 mt-2">
                👆 Click any demo user above for instant access
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login Card */}
        <Card className="glassmorphic-card shadow-2xl border-white/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-white">Sign In</CardTitle>
            <CardDescription className="text-center text-gray-300">
              Enter your credentials to access your account
              <br />
              <span className="text-sm text-blue-300">
                Or use demo accounts above for instant access
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-200">
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
                    className="glassmorphic-input w-full pl-10 pr-3 py-3 rounded-lg text-white placeholder-gray-300 focus:outline-none"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-200">
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
                    className="glassmorphic-input w-full pl-10 pr-10 py-3 rounded-lg text-white placeholder-gray-300 focus:outline-none"
                    required
                    disabled={isLoading}
                  />
                  {isClient && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors"
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
                    className="h-4 w-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-200">
                    Remember me for 30 days
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                disabled={isLoading || authLoading}
              >
                {isLoading || authLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-2 text-gray-300">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                disabled={isLoading}
                className="glassmorphic-input w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('GitHub')}
                disabled={isLoading}
                className="glassmorphic-input w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full border-t border-white/20" />
            <div className="text-center text-sm text-gray-300">
              Don't have an account?{' '}
              <button className="text-blue-300 hover:text-blue-200 font-medium transition-colors">
                Sign up for free
              </button>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400">
          <p>
            By signing in, you agree to our{' '}
            <button className="text-blue-300 hover:text-blue-200 underline transition-colors">
              Terms of Service
            </button>{' '}
            and{' '}
            <button className="text-blue-300 hover:text-blue-200 underline transition-colors">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default LoginPage;