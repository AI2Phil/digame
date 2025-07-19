import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';

const MobileResponsiveOnboarding = ({ userId }) => {
  const [mobileConfig, setMobileConfig] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceType, setDeviceType] = useState('mobile');

  useEffect(() => {
    detectDeviceType();
    fetchMobileConfig();
  }, [userId, fetchMobileConfig, detectDeviceType]);

  const detectDeviceType = () => {
    const width = window.innerWidth;
    if (width <= 768) {
      setDeviceType('mobile');
    } else if (width <= 1024) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  };

  const fetchMobileConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/integrations/mobile-onboarding/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mobile configuration');
      }

      const data = await response.json();
      setMobileConfig(data.data.mobile_config);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, setLoading, response, setMobileConfig, data, setError, err]);

  const handleStepChange = (stepIndex) => {
    setCurrentStep(stepIndex);

    // Track step navigation
    trackEvent('step_navigation', {
      from_step: currentStep,
      to_step: stepIndex,
      device_type: deviceType
    });
  };

  const handleNext = () => {
    if (currentStep < mobileConfig.steps.length - 1) {
      handleStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  };

  const handleSkip = () => {
    const currentStepData = mobileConfig.steps[currentStep];
    if (currentStepData.mobile_optimizations.skip_option) {
      handleNext();
      trackEvent('step_skipped', {
        step: currentStep,
        step_name: currentStepData.name
      });
    }
  };

  const trackEvent = async (eventType, eventData) => {
    try {
      await fetch('/api/v1/integrations/track-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: userId,
          event_type: eventType,
          data: eventData
        })
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);

  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading onboarding</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchMobileConfig}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700">

                Retry
              </button>
            </div>
          </div>
        </div>
      </div>);

  }

  const currentStepData = mobileConfig.steps[currentStep];
  const progressPercentage = (currentStep + 1) / mobileConfig.steps.length * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Step {currentStep + 1} of {mobileConfig.steps.length}</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progressPercentage}%` }}>
              </div>
            </div>
          </div>

          {/* Step title */}
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900">{currentStepData.title}</h1>
            <p className="text-sm text-gray-600">{currentStepData.subtitle}</p>
            <p className="text-xs text-gray-500 mt-1">
              Estimated time: {currentStepData.estimated_time}
            </p>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="px-4 py-6">
        <div className={`max-w-md mx-auto ${currentStepData.mobile_layout === 'single_column' ? 'space-y-4' : ''}`}>
          {/* Step completion indicator */}
          {currentStepData.completed &&
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Step completed!</span>
              </div>
            </div>
          }

          {/* Dynamic step content based on layout */}
          {currentStepData.mobile_layout === 'single_column' &&
          <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-medium text-gray-900 mb-4">
                  {currentStepData.name.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Complete this step to continue building your digital twin profile.
                </p>
                
                {/* Form elements would go here based on step type */}
                <div className="space-y-3">
                  <input
                  type="text"
                  placeholder="Enter information..."
                  className="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />

                  <textarea
                  placeholder="Additional details..."
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500">
                </textarea>
                </div>
              </div>
            </div>
          }

          {currentStepData.mobile_layout === 'card_grid' &&
          <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((item) =>
            <div key={item} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">{item}</span>
                  </div>
                  <p className="text-xs text-gray-600">Option {item}</p>
                </div>
            )}
            </div>
          }

          {currentStepData.mobile_layout === 'quiz_format' &&
          <div className="space-y-3">
              {['Option A', 'Option B', 'Option C', 'Option D'].map((option, index) =>
            <button
              key={index}
              className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">

                  <span className="text-sm font-medium text-gray-900">{option}</span>
                </button>
            )}
            </div>
          }

          {currentStepData.mobile_layout === 'slider_inputs' &&
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              {['Preference 1', 'Preference 2', 'Preference 3'].map((pref, index) =>
            <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{pref}</label>
                  <input
                type="range"
                min="0"
                max="100"
                defaultValue="50"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />

                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
            )}
            </div>
          }

          {currentStepData.mobile_layout === 'list_selection' &&
          <div className="space-y-2">
              {['Goal 1', 'Goal 2', 'Goal 3', 'Goal 4', 'Goal 5'].map((goal, index) =>
            <label key={index} className="flex items-center bg-white border border-gray-200 rounded-lg p-4">
                  <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />

                  <span className="ml-3 text-sm text-gray-900">{goal}</span>
                </label>
            )}
            </div>
          }

          {currentStepData.mobile_layout === 'preview_card' &&
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-blue-600 text-xl font-bold">DT</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Your Digital Twin</h3>
                <p className="text-sm text-gray-600">Profile completion: 85%</p>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Skills:</span>
                  <span className="text-gray-900">12 identified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Personality:</span>
                  <span className="text-gray-900">Analytical</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Goals:</span>
                  <span className="text-gray-900">5 set</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      {/* Mobile-optimized navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
            currentStep === 0 ?
            'text-gray-400 cursor-not-allowed' :
            'text-gray-700 hover:bg-gray-50'}`
            }>

            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Previous
          </button>

          {currentStepData.mobile_optimizations.skip_option &&
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700">

              Skip
            </button>
          }

          <button
            onClick={handleNext}
            disabled={currentStep === mobileConfig.steps.length - 1}
            className={`flex items-center px-6 py-2 rounded-md text-sm font-medium ${
            currentStep === mobileConfig.steps.length - 1 ?
            'bg-green-600 text-white' :
            'bg-blue-600 text-white hover:bg-blue-700'}`
            }>

            {currentStep === mobileConfig.steps.length - 1 ? 'Complete' : 'Next'}
            {currentStep < mobileConfig.steps.length - 1 &&
            <ChevronRightIcon className="h-4 w-4 ml-1" />
            }
          </button>
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>);

};

export default MobileResponsiveOnboarding;