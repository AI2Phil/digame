import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import onboardingService from '../services/onboardingService';
import { Toast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeOnboarding();
  }, []);

  const initializeOnboarding = async () => {
    try {
      // Get user data from localStorage or API
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Check if onboarding is already completed
      const isCompleted = onboardingService.isOnboardingCompleted();
      if (isCompleted) {
        navigate('/dashboard');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize onboarding:', error);
      setError('Failed to load onboarding. Please try again.');
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (onboardingData) => {
    try {
      setLoading(true);

      // Validate the data
      const profileValidation = onboardingService.validateProfileData(onboardingData.profile);
      const goalsValidation = onboardingService.validateGoalsData(onboardingData.goals);

      if (!profileValidation.isValid) {
        setError(profileValidation.errors.join(', '));
        setLoading(false);
        return;
      }

      if (!goalsValidation.isValid) {
        setError(goalsValidation.errors.join(', '));
        setLoading(false);
        return;
      }

      // Track completion
      onboardingService.trackOnboardingCompletion(onboardingData);

      // Try to save to backend
      try {
        await onboardingService.saveOnboardingData(onboardingData);
        
        // Also save user preferences and goals separately
        await onboardingService.updateUserPreferences(onboardingData.preferences);
        await onboardingService.createUserGoals(onboardingData.goals);
        
      } catch (apiError) {
        console.warn('Failed to save to backend, saving locally:', apiError);
        // Fallback to local storage
        onboardingService.saveOnboardingDataLocally(onboardingData);
      }

      // Update user data in localStorage
      const updatedUser = {
        ...user,
        ...onboardingData.profile,
        onboarding_completed: true,
        preferences: onboardingData.preferences,
        goals: onboardingData.goals,
        features: onboardingData.features
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('onboardingCompleted', 'true');

      // Show success message
      Toast.success('Welcome to Digame! Your account is now set up.');

      // Navigate to dashboard
      navigate('/dashboard', { replace: true });

    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setError('Failed to complete setup. Please try again.');
      setLoading(false);
    }
  };

  const handleSkipOnboarding = () => {
    // Allow users to skip onboarding with default settings
    const defaultData = onboardingService.getDefaultOnboardingData(user);
    handleOnboardingComplete(defaultData);
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
          <Button
            onClick={() => window.location.reload()}
            variant="default"
            className="mr-2"
          >
            Try Again
          </Button>
          <Button
            onClick={handleSkipOnboarding}
            variant="secondary"
          >
            Skip Setup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <OnboardingWizard 
        onComplete={handleOnboardingComplete}
        user={user}
      />
      
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