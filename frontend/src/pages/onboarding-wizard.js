// Redirect to existing onboarding page
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OnboardingWizardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the existing onboarding page
    router.replace('/onboarding');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to onboarding...</p>
      </div>
    </div>
  );
}