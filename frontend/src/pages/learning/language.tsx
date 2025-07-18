import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Redirect to existing AI tools language learning page
export default const LanguageLearning: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the existing AI tools language learning page
    router.replace('/ai-tools/language');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Language Learning...</p>
      </div>
    </div>
  );
}