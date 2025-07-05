import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

// Add CSS for the Digame logo
const logoStyles = `
  .digame-logo {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo = '/dashboard' }) => {
  const [formData, setFormData] = useState({
    identifier: '', // Can be username or email
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMode, setLoginMode] = useState<'credentials' | 'demo'>('credentials');

  const { login, enterDemoMode } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Determine if identifier is email or username
      const isEmail = formData.identifier.includes('@');
      const credentials = {
        [isEmail ? 'email' : 'username']: formData.identifier,
        password: formData.password,
        rememberMe: formData.rememberMe
      };

      console.log('LoginForm: Current formData state:', formData);
      console.log('LoginForm: Sending credentials with rememberMe:', credentials.rememberMe);

      const success = await login(credentials);
      
      if (success) {
        if (onSuccess) {
          onSuccess();
        } else {
          // The login function updates the auth context, so we can access the user data
          // We need to wait a moment for the auth context to update
          setTimeout(async () => {
            try {
              // Get fresh user data from the auth context
              const response = await fetch('/api/auth/profile', {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                const userData = data.user;
                
                // Determine redirect based on user role and platform owner status
                let redirectPath = redirectTo;
                
                if (userData.isPlatformOwner || userData.is_platform_owner) {
                  redirectPath = '/platform-owner/dashboard';
                  console.log('LoginForm: Platform owner detected, redirecting to:', redirectPath);
                } else if (userData.role === 'admin') {
                  redirectPath = '/admin/dashboard';
                  console.log('LoginForm: Admin user detected, redirecting to:', redirectPath);
                } else {
                  redirectPath = '/dashboard';
                  console.log('LoginForm: Regular user, redirecting to:', redirectPath);
                }
                
                router.push(redirectPath);
              } else {
                // Fallback to default redirect if profile fetch fails
                console.log('LoginForm: Profile fetch failed, using default redirect');
                router.push(redirectTo);
              }
            } catch (error) {
              console.error('LoginForm: Error fetching user profile for redirect:', error);
              router.push(redirectTo);
            }
          }, 200);
        }
      } else {
        setError('Invalid credentials. Please check your username/email and password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      await enterDemoMode();
      if (onSuccess) {
        onSuccess();
      } else {
        // Demo mode creates an admin user, so redirect to regular dashboard
        // Demo users are not platform owners by default
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setError('Failed to enter demo mode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = [
    {
      identifier: 'admin',
      password: 'admin123',
      description: 'Platform Administrator - Full access to all features'
    },
    {
      identifier: 'demo',
      password: 'demo123',
      description: 'Demo User - Enterprise tier with comprehensive features'
    },
    {
      identifier: 'teamlead',
      password: 'team123',
      description: 'Team Lead - Team management and collaboration features'
    },
    {
      identifier: 'prouser',
      password: 'pro123',
      description: 'Professional User - Individual pro features'
    },
    {
      identifier: 'freeuser',
      password: 'free123',
      description: 'Free User - Basic features only'
    }
  ];

  const quickLogin = (identifier: string, password: string) => {
    setFormData(prev => ({ ...prev, identifier, password })); // Preserve rememberMe state
    setLoginMode('credentials');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: logoStyles }} />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="digame-logo">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-white">Digame</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Welcome Back
          </h2>
          <p className="text-gray-300 mt-2">
            Sign in to access your digital twin platform
          </p>
        </div>

        {/* Login Mode Selector */}
        <div className="flex rounded-lg bg-white/10 backdrop-blur-sm p-1">
          <button
            type="button"
            onClick={() => setLoginMode('credentials')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginMode === 'credentials'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Login with Credentials
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('demo')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginMode === 'demo'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Demo Mode
          </button>
        </div>

        {/* Main Card Container */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="text-sm text-red-200">
                {error}
              </div>
            </div>
          )}

          {loginMode === 'credentials' ? (
            <form className="space-y-4" onSubmit={handleCredentialsLogin}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="identifier" className="block text-sm font-medium text-gray-200 mb-1">
                    Username or Email
                  </label>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your username or email"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-200">
                    Remember me for 30 days
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-300 hover:text-blue-200">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Quick Login Options */}
              <div className="mt-6">
                <div className="text-center text-sm text-gray-300 mb-3">
                  Quick login options:
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {demoUsers.map((user, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => quickLogin(user.identifier, user.password)}
                      className="text-left p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                      disabled={isLoading}
                    >
                      <div className="font-medium text-sm text-white">
                        {user.identifier}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        {user.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-300 mb-4">
                  Experience the full platform with demo data and all features enabled.
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Entering Demo Mode...
                    </div>
                  ) : (
                    <>
                      <span className="mr-2">🎮</span>
                      Enter Demo Mode
                    </>
                  )}
                </button>
              </div>

              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-200 mb-2">
                  Demo Mode Features:
                </h4>
                <ul className="text-xs text-blue-300 space-y-1">
                  <li>• Full access to all platform features</li>
                  <li>• Pre-populated demo data and analytics</li>
                  <li>• Team collaboration simulation</li>
                  <li>• AI tools and advanced analytics</li>
                  <li>• No registration required</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-300">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="font-medium text-blue-300 hover:text-blue-200"
            >
              Sign up here
            </button>
          </p>
          <p className="text-xs text-gray-400">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-blue-300 hover:text-blue-200">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-300 hover:text-blue-200">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default LoginForm;