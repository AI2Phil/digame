import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Loading...</h2>
            <p className="text-gray-600">Checking authentication status</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle redirects with useEffect
  useEffect(() => {
    if (!isLoading) {
      // Redirect if authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Redirect if authentication is not required but user is authenticated
      if (!requireAuth && isAuthenticated) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isLoading, requireAuth, isAuthenticated, redirectTo, router]);

  // Don't render children if we need to redirect
  if (!isLoading) {
    if (requireAuth && !isAuthenticated) {
      return null;
    }
    if (!requireAuth && isAuthenticated) {
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;