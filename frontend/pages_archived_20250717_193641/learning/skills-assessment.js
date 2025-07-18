import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Redirect to existing career skills page
export default function SkillsAssessment() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the existing career skills page
    router.replace('/career/skills');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Skills Assessment...</p>
      </div>
    </div>
  );
}