import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Redirect to existing career learning page
export default const LearningPaths: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the existing career learning page
    router.replace('/career/learning');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Learning Paths...</p>
      </div>
    </div>
  );
}