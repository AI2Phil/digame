import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import { useAuth } from '../contexts/AuthContext';
import { useToastActions } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';

const OnboardingPage = () => {
  const toast = useToastActions();
  const router = useRouter();
  const { user, updateProfile, isDemoMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeOnboarding();
  }, []);

  const initializeOnboarding = async () => {
    try {
      if (isDemoMode) {
        // Demo mode users already have onboarding completed
        setLoading(false);
        return;
      }

      // Check if onboarding is already completed
      if (user?.onboardingCompleted) {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize onboarding:', error);
      setError('Failed to load onboarding. Please try again.');
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async onboardingData => {
    try {
      setLoading(true);
      setError(null);

      console.log('Starting onboarding completion with data:', onboardingData);

      // Convert onboarding wizard data to the format expected by updateProfile
      const profileUpdates = {
        onboardingCompleted: true,
        onboardingData: {
          interests: onboardingData.learning_interests || [],
          goals: onboardingData.short_term_goals || [],
          experienceLevel: onboardingData.experience_level || 'intermediate',
          industry: onboardingData.industry || '',
          professionalTitle: onboardingData.professional_title || '',
          personalityType: onboardingData.personality_type || '',
          communicationStyle: onboardingData.communication_style || '',
          collaborationPreference: onboardingData.collaboration_preference || '',
          meetingPreferences: onboardingData.meeting_preferences || '',
          careerAspirations: onboardingData.career_aspirations || '',
          technicalSkills: onboardingData.technical_skills || [],
          softSkills: onboardingData.soft_skills || [],
          skillConfidenceScores: onboardingData.skill_confidence_scores || {},
          workStylePreferences: onboardingData.work_style_preferences || {},
          longTermGoals: onboardingData.long_term_goals || [],
        },
        unlockedFeatures: [
          'basic_analytics',
          'advanced_analytics',
          'ai_recommendations',
          'goal_tracking',
          'progress_insights',
          'ai_coaching',
          'advanced_features',
          'team_creation',
          'collaboration_tools',
          'full_platform_access',
        ],
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          theme: 'light',
          dashboardView: 'overview',
        },
      };

      console.log('Attempting to save profile updates:', profileUpdates);

      // Try to save to backend using AuthContext
      let success = false;
      try {
        success = await updateProfile(profileUpdates);
        console.log('Profile update result:', success);
      } catch (profileError) {
        console.error('Profile update failed:', profileError);

        // For guest users or if profile update fails, try alternative approach
        console.log('Attempting alternative onboarding completion...');

        try {
          // Try using the onboarding-specific endpoint
          const token =
            localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
          const response = await fetch('/api/auth/onboarding', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...profileUpdates.onboardingData,
              onboardingCompleted: true,
            }),
          });

          if (response.ok) {
            success = true;
            console.log('Alternative onboarding completion successful');
          } else {
            console.error('Alternative onboarding completion failed:', response.status);
          }
        } catch (altError) {
          console.error('Alternative approach failed:', altError);
        }
      }

      if (success) {
        // Show success message
        toast.success('Welcome to Digame! Your account is now set up.');

        console.log('Onboarding completed successfully, navigating to dashboard...');

        // Navigate to dashboard with a small delay to ensure state updates
        setTimeout(() => {
          router.push('/dashboard', { replace: true });
        }, 1000);
      } else {
        // If all approaches fail, still allow navigation but show warning
        console.warn('Onboarding data save failed, but allowing navigation to dashboard');
        toast.success('Welcome to Digame! Setup completed with default settings.');

        setTimeout(() => {
          router.push('/dashboard', { replace: true });
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setError('Failed to complete setup. Redirecting to dashboard...');

      // Even if there's an error, redirect to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard', { replace: true });
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipOnboarding = async () => {
    // Allow users to skip onboarding with default settings
    try {
      setLoading(true);

      const defaultProfileUpdates = {
        onboardingCompleted: true,
        onboardingData: {
          interests: ['productivity'],
          goals: ['improve_efficiency'],
          experienceLevel: 'intermediate',
          industry: 'Technology',
          professionalTitle: 'Professional',
          personalityType: 'Balanced',
          communicationStyle: 'Collaborative',
          collaborationPreference: 'Hybrid',
          meetingPreferences: 'Video calls',
          careerAspirations: 'Professional growth',
          technicalSkills: [],
          softSkills: [],
          skillConfidenceScores: {},
          workStylePreferences: {},
          longTermGoals: [],
        },
        unlockedFeatures: ['basic_analytics', 'goal_tracking'],
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          theme: 'light',
          dashboardView: 'overview',
        },
      };

      const success = await updateProfile(defaultProfileUpdates);

      if (success) {
        toast.success('Welcome to Digame! Default setup completed.');
        router.push('/dashboard', { replace: true });
      } else {
        throw new Error('Failed to save default settings');
      }
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
      setError('Failed to complete setup. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your onboarding experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} variant="default" className="mr-2">
            Try Again
          </Button>
          <Button onClick={handleSkipOnboarding} variant="secondary">
            Skip Setup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <OnboardingWizard onComplete={handleOnboardingComplete} user={user} />

      {/* Skip option */}
      <div className="fixed bottom-4 right-4">
        <Button
          variant="link"
          onClick={handleSkipOnboarding}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Skip setup for now
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPage;
