// Redirect to existing auth/login page
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoginPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the proper login page
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}