import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter } from 'next/router';

const OnboardingPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    interests: [],
    goals: [],
    experience: '',
    notifications: {
      email: true,
      push: true,
      marketing: false
    }
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const interests = [
    'Analytics & Data Science',
    'Artificial Intelligence',
    'Team Management',
    'Professional Development',
    'Digital Transformation',
    'Productivity Tools',
    'Social Networking',
    'Project Management',
    'Business Intelligence',
    'Automation'
  ];

  const goals = [
    'Improve team productivity',
    'Gain insights from data',
    'Enhance professional skills',
    'Build professional network',
    'Automate workflows',
    'Track performance metrics',
    'Collaborate more effectively',
    'Make data-driven decisions'
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner - New to digital tools' },
    { value: 'intermediate', label: 'Intermediate - Some experience' },
    { value: 'advanced', label: 'Advanced - Very experienced' },
    { value: 'expert', label: 'Expert - Industry professional' }
  ];

  const handleInterestToggle = (interest) => {
    setOnboardingData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleGoalToggle = (goal) => {
    setOnboardingData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleNotificationChange = (type) => {
    setOnboardingData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handleComplete = async () => {
    try {
      // Save onboarding data to user profile
      const success = await user?.updateProfile?.({
        onboardingCompleted: true,
        interests: onboardingData.interests,
        goals: onboardingData.goals,
        experienceLevel: onboardingData.experience,
        preferences: {
          ...user.preferences,
          ...onboardingData.notifications
        }
      });

      if (success) {
        router.push('/dashboard?welcome=true');
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      // Continue to dashboard even if profile update fails
      router.push('/dashboard?welcome=true');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-600 mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome to Digame, {user?.firstName}!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Let's personalize your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What are your interests?
              </h2>
              <p className="text-gray-600 mb-6">
                Select the areas you're most interested in to help us customize your experience.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      onboardingData.interests.includes(interest)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded border mr-3 ${
                        onboardingData.interests.includes(interest)
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-gray-300'
                      }`}>
                        {onboardingData.interests.includes(interest) && (
                          <svg className="w-3 h-3 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium">{interest}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What are your goals?
              </h2>
              <p className="text-gray-600 mb-6">
                Tell us what you want to achieve with Digame.
              </p>
              <div className="space-y-3">
                {goals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleGoalToggle(goal)}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      onboardingData.goals.includes(goal)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded border mr-3 ${
                        onboardingData.goals.includes(goal)
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-gray-300'
                      }`}>
                        {onboardingData.goals.includes(goal) && (
                          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium">{goal}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What's your experience level?
              </h2>
              <p className="text-gray-600 mb-6">
                This helps us provide the right level of guidance and features.
              </p>
              <div className="space-y-3">
                {experienceLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                      onboardingData.experience === level.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="experience"
                        value={level.value}
                        checked={onboardingData.experience === level.value}
                        onChange={(e) => setOnboardingData(prev => ({ ...prev, experience: e.target.value }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-3 font-medium text-gray-900">{level.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Notification preferences
              </h2>
              <p className="text-gray-600 mb-6">
                Choose how you'd like to stay updated.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Email notifications</h3>
                    <p className="text-sm text-gray-500">Get updates about your account and platform features</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('email')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      onboardingData.notifications.email ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      onboardingData.notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Push notifications</h3>
                    <p className="text-sm text-gray-500">Get real-time alerts in your browser</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('push')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      onboardingData.notifications.push ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      onboardingData.notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Marketing emails</h3>
                    <p className="text-sm text-gray-500">Receive tips, updates, and special offers</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('marketing')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      onboardingData.notifications.marketing ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      onboardingData.notifications.marketing ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Complete Setup
              </button>
            )}
          </div>

          {/* Skip Option */}
          <div className="text-center mt-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;