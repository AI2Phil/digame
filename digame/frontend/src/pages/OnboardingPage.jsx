import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import onboardingService from '../services/onboardingService';
import { Toast } from '../components/ui/Toast';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    // Check if onboarding is already completed
    checkOnboardingStatus();
  }, [navigate]);

  const checkOnboardingStatus = async () => {
    try {
      const status = await onboardingService.getOnboardingStatus();
      if (status.onboarding_completed) {
        // User has already completed onboarding, redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Continue with onboarding if we can't check status
    }
  };

  const handleOnboardingComplete = async (onboardingData) => {
    setIsLoading(true);
    
    try {
      // Track onboarding start
      await onboardingService.trackOnboardingEvent('onboarding_completed', {
        goals_count: onboardingData.goals.length,
        work_style: onboardingData.workStyle,
        skill_level: onboardingData.skillLevel,
        focus_areas_count: onboardingData.focusAreas.length
      });

      // Validate data before submission
      const validation = onboardingService.validateOnboardingData(onboardingData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Save onboarding data
      await onboardingService.saveOnboardingData(onboardingData);

      // Initialize behavioral model
      try {
        await onboardingService.initializeBehavioralModel(onboardingData);
      } catch (error) {
        console.warn('Behavioral model initialization failed:', error);
        // Continue even if this fails
      }

      // Create initial goals
      try {
        await onboardingService.createInitialGoals(onboardingData.goals);
      } catch (error) {
        console.warn('Initial goals creation failed:', error);
        // Continue even if this fails
      }

      // Generate dashboard configuration
      const dashboardConfig = onboardingService.generateDashboardConfig(onboardingData);
      localStorage.setItem('dashboard_config', JSON.stringify(dashboardConfig));

      // Get recommended content
      try {
        const recommendations = await onboardingService.getRecommendedContent(onboardingData);
        localStorage.setItem('initial_recommendations', JSON.stringify(recommendations));
      } catch (error) {
        console.warn('Failed to get recommendations:', error);
        // Continue even if this fails
      }

      // Show success message
      setToast({
        type: 'success',
        title: 'Welcome to Digame!',
        message: 'Your digital twin has been successfully configured.',
        duration: 3000
      });

      // Track completion
      await onboardingService.trackOnboardingEvent('onboarding_success', {
        completion_time: Date.now(),
        goals: onboardingData.goals,
        work_style: onboardingData.workStyle
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { 
            isNewUser: true, 
            onboardingData 
          } 
        });
      }, 2000);

    } catch (error) {
      console.error('Onboarding completion error:', error);
      
      // Track error
      await onboardingService.trackOnboardingEvent('onboarding_error', {
        error: error.message,
        step: 'completion'
      });

      setToast({
        type: 'error',
        title: 'Setup Error',
        message: 'There was an issue completing your setup. Please try again.',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingSkip = async () => {
    try {
      // Track skip event
      await onboardingService.trackOnboardingEvent('onboarding_skipped');

      // Set minimal default configuration
      const defaultData = {
        goals: ['productivity'],
        workStyle: 'flexible',
        skillLevel: 'intermediate',
        focusAreas: ['General'],
        preferences: {
          notifications: true,
          dataCollection: true,
          publicProfile: false
        }
      };

      // Save minimal onboarding data
      await onboardingService.saveOnboardingData(defaultData);

      // Generate basic dashboard configuration
      const dashboardConfig = onboardingService.generateDashboardConfig(defaultData);
      localStorage.setItem('dashboard_config', JSON.stringify(dashboardConfig));

      setToast({
        type: 'info',
        title: 'Setup Skipped',
        message: 'You can complete your profile setup anytime in settings.',
        duration: 3000
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { 
            isNewUser: true, 
            skippedOnboarding: true 
          } 
        });
      }, 1500);

    } catch (error) {
      console.error('Error skipping onboarding:', error);
      
      setToast({
        type: 'error',
        title: 'Error',
        message: 'Unable to skip setup. Please try again.',
        duration: 5000
      });
    }
  };

  const closeToast = () => {
    setToast(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Setting up your Digital Twin...</h2>
            <p className="text-gray-600">This will just take a moment</p>
          </div>
          <div className="space-y-1 text-sm text-gray-500">
            <p>✓ Saving your preferences</p>
            <p>✓ Initializing behavioral model</p>
            <p>✓ Creating personalized goals</p>
            <p>✓ Configuring your dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
      
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={closeToast}
        />
      )}
    </>
  );
};

export default OnboardingPage;