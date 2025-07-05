import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TestZone from '../../src/components/platform-owner/TestZone';

export default function TestZonePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/auth');
          return;
        }

        // Verify token with backend
        const response = await fetch('http://localhost:8001/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          // Check if user is platform owner
          if (userData.user && (userData.user.isPlatformOwner || userData.user.is_platform_owner)) {
            setIsAuthenticated(true);
          } else {
            router.push('/dashboard');
          }
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.push('/auth');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Test Zone...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Platform owner access required.</p>
        </div>
      </div>
    );
  }

  return <TestZone />;
}