import React, { useEffect, useState } from 'react';
import StepWelcome from './StepWelcome';
import StepProfileInfo from './StepProfileInfo';
import StepGoalSetting from './StepGoalSetting';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useEnhancedOnboarding } from '../hooks/useEnhancedOnboarding';
import FeatureHubShowcase from '../../../components/onboarding/FeatureHubShowcase';
import { conversionTrackingService } from '../../../services/conversionTrackingService';
import { featureHubService } from '../../../services/featureHubService';
import { ExternalLink, Star, Sparkles } from 'lucide-react';

// Enhanced step component for preferences
const StepPreferences: React.FC<{
  onNext: (data: any) => void;
  onPrevious: () => void;
  initialData?: any;
}> = ({ onNext, onPrevious, initialData }) => {
  const [preferences, setPreferences] = useState({
    notifications: {
      frequency: 'moderate',
      types: ['progress', 'reminders']
    },
    privacy: {
      analytics: true,
      dataSharing: false
    },
    interface: {
      theme: 'auto',
      language: 'en'
    },
    ...initialData
  });

  const handleSubmit = () => {
    onNext(preferences);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Customize Your Experience</CardTitle>
        <CardDescription>Set your preferences to personalize Digame</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3">Notifications</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="frequency"
                value="minimal"
                checked={preferences.notifications.frequency === 'minimal'}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, frequency: e.target.value }
                }))}
              />
              <span>Minimal - Only critical updates</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="frequency"
                value="moderate"
                checked={preferences.notifications.frequency === 'moderate'}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, frequency: e.target.value }
                }))}
              />
              <span>Moderate - Important updates and tips</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="frequency"
                value="frequent"
                checked={preferences.notifications.frequency === 'frequent'}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, frequency: e.target.value }
                }))}
              />
              <span>Frequent - All updates and insights</span>
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Privacy</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preferences.privacy.analytics}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, analytics: e.target.checked }
                }))}
              />
              <span>Help improve Digame with anonymous usage analytics</span>
            </label>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button onClick={handleSubmit}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced step component for features
const StepFeatures: React.FC<{
  onNext: (data: any) => void;
  onPrevious: () => void;
  recommendedFeatures?: string[];
  initialData?: any;
}> = ({ onNext, onPrevious, recommendedFeatures = [], initialData }) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    initialData?.enabledFeatures || recommendedFeatures
  );

  const availableFeatures = [
    { id: 'productivity-tracking', name: 'Productivity Tracking', description: 'Monitor your daily productivity patterns' },
    { id: 'goal-management', name: 'Goal Management', description: 'Set and track your personal and professional goals' },
    { id: 'time-tracking', name: 'Time Tracking', description: 'Track time spent on different activities' },
    { id: 'collaboration', name: 'Collaboration Tools', description: 'Work together with your team' },
    { id: 'insights-ai', name: 'AI Insights', description: 'Get personalized insights powered by AI' },
    { id: 'automation', name: 'Automation', description: 'Automate repetitive tasks and workflows' }
  ];

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleSubmit = () => {
    onNext({ enabledFeatures: selectedFeatures });
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Choose Your Features</CardTitle>
        <CardDescription>Select the features you'd like to enable</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendedFeatures.length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ✨ Based on your role, we recommend: {recommendedFeatures.join(', ')}
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          {availableFeatures.map(feature => (
            <label key={feature.id} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <input
                type="checkbox"
                checked={selectedFeatures.includes(feature.id)}
                onChange={() => toggleFeature(feature.id)}
                className="mt-1"
              />
              <div>
                <div className="font-medium">{feature.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button onClick={handleSubmit}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Final summary step
const StepFinalSummary: React.FC<{
  onComplete: (data: any) => void;
  onPrevious: () => void;
  onboardingData: any;
}> = ({ onComplete, onPrevious, onboardingData }) => {
  const [feedback, setFeedback] = useState({
    rating: 5,
    comments: ''
  });

  const handleComplete = () => {
    onComplete({
      feedback,
      completedAt: new Date().toISOString()
    });
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>You're All Set! 🎉</CardTitle>
        <CardDescription>Review your setup and provide feedback</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Setup Summary</h4>
          <div className="text-sm space-y-1">
            <p><strong>Profile:</strong> {onboardingData?.profile?.fullName} ({onboardingData?.profile?.role})</p>
            <p><strong>Primary Goal:</strong> {onboardingData?.goals?.primaryGoal}</p>
            <p><strong>Features:</strong> {onboardingData?.features?.enabledFeatures?.length || 0} enabled</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">How was your onboarding experience?</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Rating (1-5 stars)</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                    className={`text-2xl ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Comments (optional)</label>
              <textarea
                value={feedback.comments}
                onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Tell us about your experience..."
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
            Complete Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const EnhancedGuidedSetupWizard: React.FC = () => {
  const {
    onboardingStatus,
    userMetrics,
    dashboardData,
    isLoading,
    error,
    updateOnboardingStep,
    updateUserPreferences,
    completeOnboarding,
    saveUserFeedback,
    fetchOnboardingStatus,
    getCurrentStepInfo,
    getRecommendedFeatures,
    trackClick,
    trackFormSubmission,
    trackError,
    STEP_SEQUENCE
  } = useEnhancedOnboarding();

  // Local state for collecting data across steps
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [localCurrentStep, setLocalCurrentStep] = useState<string | null>(null);

  // Get current step info
  const stepInfo = getCurrentStepInfo();
  const currentStep = localCurrentStep || stepInfo?.currentStepId || 'welcome';

  useEffect(() => {
    // Track page view analytics
    if (currentStep) {
      trackClick();
    }
  }, [currentStep, trackClick]);

  const handleStepSubmit = async (stepId: string, stepData: any) => {
    try {
      trackFormSubmission();
      
      // Store data locally for summary
      setCollectedData(prev => ({
        ...prev,
        [stepId]: stepData
      }));

      // Submit to backend
      await updateOnboardingStep(stepId, stepData);
      
      // Move to next step locally
      const currentIndex = STEP_SEQUENCE.indexOf(stepId);
      if (currentIndex < STEP_SEQUENCE.length - 1) {
        setLocalCurrentStep(STEP_SEQUENCE[currentIndex + 1]);
      }
    } catch (error) {
      trackError(`Failed to submit ${stepId}: ${error}`);
      throw error;
    }
  };

  const handleWelcomeNext = async () => {
    await handleStepSubmit('welcome', { startedAt: new Date().toISOString() });
  };

  const handleProfileSubmit = async (data: { fullName: string; role: string }) => {
    await handleStepSubmit('profile_info', data);
  };

  const handleGoalSubmit = async (data: { primaryGoal: string }) => {
    await handleStepSubmit('goal_setting', data);
  };

  const handlePreferencesSubmit = async (data: any) => {
    try {
      // Update preferences separately
      await updateUserPreferences(data);
      await handleStepSubmit('preferences', data);
    } catch (error) {
      trackError(`Failed to submit preferences: ${error}`);
      throw error;
    }
  };

  const handleFeaturesSubmit = async (data: any) => {
    await handleStepSubmit('features', data);
  };

  const handleFinalComplete = async (data: any) => {
    try {
      // Save feedback
      if (data.feedback) {
        await saveUserFeedback(
          data.feedback.rating,
          data.feedback.comments,
          'final_summary'
        );
      }

      // Complete onboarding
      await completeOnboarding({
        ...collectedData,
        finalData: data,
        completedAt: new Date().toISOString()
      });

      setLocalCurrentStep('completed');
    } catch (error) {
      trackError(`Failed to complete onboarding: ${error}`);
      throw error;
    }
  };

  const handlePrevious = (targetStep: string) => {
    setLocalCurrentStep(targetStep);
  };

  if (isLoading && !onboardingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your onboarding experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Oops! Something went wrong</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={fetchOnboardingStatus}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Progress indicator
  const progress = stepInfo ? stepInfo.progress : 0;
  const stepIndex = stepInfo ? stepInfo.currentStepIndex + 1 : 1;
  const totalSteps = STEP_SEQUENCE.length;

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <StepWelcome onNext={handleWelcomeNext} />;
      
      case 'profile_info':
        return (
          <StepProfileInfo
            onNext={handleProfileSubmit}
            onPrevious={() => handlePrevious('welcome')}
          />
        );
      
      case 'goal_setting':
        return (
          <StepGoalSetting
            onComplete={handleGoalSubmit}
            onPrevious={() => handlePrevious('profile_info')}
          />
        );
      
      case 'preferences':
        return (
          <StepPreferences
            onNext={handlePreferencesSubmit}
            onPrevious={() => handlePrevious('goal_setting')}
            initialData={collectedData.preferences}
          />
        );
      
      case 'features':
        const userRole = collectedData.profile_info?.role;
        const recommendedFeatures = userRole ? getRecommendedFeatures(userRole) : [];
        
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Discover Platform Features</h2>
              <p className="text-lg text-gray-600">
                Explore our complete feature set and see what's possible with Digame
              </p>
              <div className="flex justify-center space-x-4">
                <Badge variant="outline" className="bg-blue-50">
                  <Star className="w-3 h-3 mr-1" />
                  100% Complete Platform
                </Badge>
                <Badge variant="outline" className="bg-purple-50">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered Features
                </Badge>
              </div>
            </div>

            <FeatureHubShowcase
              selectedRole={userRole || 'developer'}
              onFeatureExplored={(feature) => {
                conversionTrackingService.trackEvent('ONBOARDING_FEATURE_EXPLORED', {
                  featureId: feature.id,
                  featureName: feature.title,
                  step: 'features',
                  userRole
                });
              }}
              onHubPageNavigation={(path, featureName) => {
                conversionTrackingService.trackEvent('ONBOARDING_HUB_PAGE_VISITED', {
                  path,
                  featureName,
                  step: 'features',
                  userRole
                });
                // Open in new tab to keep onboarding active
                window.open(path, '_blank');
              }}
              exploredFeatures={collectedData.features?.exploredFeatures || []}
            />

            <StepFeatures
              onNext={handleFeaturesSubmit}
              onPrevious={() => handlePrevious('preferences')}
              recommendedFeatures={recommendedFeatures}
              initialData={collectedData.features}
            />
          </div>
        );
      
      case 'final_summary':
        return (
          <StepFinalSummary
            onComplete={handleFinalComplete}
            onPrevious={() => handlePrevious('features')}
            onboardingData={collectedData}
          />
        );
      
      case 'completed':
        return (
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <CardTitle className="text-green-600">🎉 Welcome to Digame!</CardTitle>
              <CardDescription>Your setup is complete and your journey begins now</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-green-800 dark:text-green-200">
                  Thank you for completing the enhanced onboarding! All your preferences have been saved.
                </p>
              </div>
              
              {userMetrics && (
                <div className="text-left">
                  <h4 className="font-semibold mb-2">Your Progress</h4>
                  <div className="text-sm space-y-1">
                    <p>Completion: {userMetrics.completion_percentage}%</p>
                    <p>Steps completed: {userMetrics.completed_steps}/{userMetrics.total_steps}</p>
                    {userMetrics.time_to_complete && (
                      <p>Time taken: {Math.round(userMetrics.time_to_complete / 60)} minutes</p>
                    )}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        );
      
      default:
        return (
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Determining your current step...</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Progress bar */}
      {currentStep !== 'completed' && (
        <div className="w-full max-w-lg mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Step {stepIndex} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Saving your progress...</span>
          </div>
        </div>
      )}

      {/* Current step */}
      {renderStep()}
    </div>
  );
};

export default EnhancedGuidedSetupWizard;