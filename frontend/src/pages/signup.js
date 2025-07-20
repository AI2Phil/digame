// Redirect to existing auth/login page with signup mode
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SignupRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page with signup parameter
    router.replace('/auth/login?mode=signup');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to signup...</p>
      </div>
    </div>
  );
}