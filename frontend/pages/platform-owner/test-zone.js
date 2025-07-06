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
      console.log('🔍 Test Zone Debug - Starting authentication check');
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        console.log('🔍 Test Zone Debug - Token found:', !!token);
        console.log('🔍 Test Zone Debug - Token source:', token ? (localStorage.getItem('accessToken') ? 'localStorage' : 'sessionStorage') : 'none');
        if (!token) {
          console.log('🔍 Test Zone Debug - No token, redirecting to login');
          router.push('/login');
          return;
        }

        // Verify token with backend
        console.log('🔍 Test Zone Debug - Verifying token with backend');
        const response = await fetch('http://localhost:8001/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('🔍 Test Zone Debug - Backend response status:', response.status);
        if (response.ok) {
          const userData = await response.json();
          console.log('🔍 Test Zone Debug - User data received:', userData);
          // Check if user is platform owner
          const isPlatformOwner = userData.user && (userData.user.isPlatformOwner || userData.user.is_platform_owner);
          console.log('🔍 Test Zone Debug - Is platform owner:', isPlatformOwner);
          
          if (isPlatformOwner) {
            console.log('🔍 Test Zone Debug - Authentication successful, setting authenticated');
            setIsAuthenticated(true);
          } else {
            console.log('🔍 Test Zone Debug - Not platform owner, redirecting to dashboard');
            router.push('/dashboard');
          }
        } else {
          console.log('🔍 Test Zone Debug - Backend response not ok, clearing tokens and redirecting to login');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          router.push('/login');
        }
      } catch (error) {
        console.error('🔍 Test Zone Debug - Auth check failed:', error);
        router.push('/login');
      } finally {
        console.log('🔍 Test Zone Debug - Setting loading to false');
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