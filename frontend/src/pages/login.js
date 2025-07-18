import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Redirect /login to /LoginPage to maintain routing consistency
const LoginRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/LoginPage');
  }, [router]);

  return null; // No UI needed, just redirect
};

export default LoginRedirect;
