import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo = '/dashboard' }) => {
  const [formData, setFormData] = useState({
    identifier: '', // Can be username or email
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMode, setLoginMode] = useState<'credentials' | 'demo'>('credentials');

  const { login, enterDemoMode } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        password: formData.password
      };

      const success = await login(credentials);
      
      if (success) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
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
        router.push(redirectTo);
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
    setFormData({ identifier, password });
    setLoginMode('credentials');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-600">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Digame
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digital Professional Twin Platform
          </p>
        </div>

        {/* Login Mode Selector */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setLoginMode('credentials')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginMode === 'credentials'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login with Credentials
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('demo')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginMode === 'demo'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Demo Mode
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Authentication Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {loginMode === 'credentials' ? (
          <form className="mt-8 space-y-6" onSubmit={handleCredentialsLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="identifier" className="sr-only">
                  Username or Email
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username or Email"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {/* Quick Login Options */}
            <div className="mt-6">
              <div className="text-center text-sm text-gray-600 mb-3">
                Quick login options:
              </div>
              <div className="grid grid-cols-1 gap-2">
                {demoUsers.map((user, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => quickLogin(user.identifier, user.password)}
                    className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {user.identifier}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {user.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Experience the full platform with demo data and all features enabled.
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Demo Mode Features:
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Full access to all platform features</li>
                <li>• Pre-populated demo data and analytics</li>
                <li>• Team collaboration simulation</li>
                <li>• AI tools and advanced analytics</li>
                <li>• No registration required</li>
              </ul>
            </div>
          </div>
        )}

        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up here
            </button>
          </p>
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-indigo-600 hover:text-indigo-500">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;