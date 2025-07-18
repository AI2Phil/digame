import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Rocket, Brain, Target, Settings, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const DigitalTwinOnboarding: React.FC = () => {
  const router = useRouter();

const DigitalTwinOnboarding: React.FC = () => {

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    goals: [],
    workStyle: '',
    preferences: {},
    interests: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    {
      id: 1,
      title: 'Welcome to Your Digital Twin',
      description: 'Let\'s create your AI-powered professional companion',
      icon: <Rocket className="w-8 h-8 text-blue-600" />
    },
    {
      id: 2,
      title: 'Set Your Goals',
      description: 'Define what you want to achieve',
      icon: <Target className="w-8 h-8 text-green-600" />
    },
    {
      id: 3,
      title: 'Work Style Preferences',
      description: 'Help us understand how you work best',
      icon: <Brain className="w-8 h-8 text-purple-600" />
    },
    {
      id: 4,
      title: 'Final Configuration',
      description: 'Review and activate your digital twin',
      icon: <Settings className="w-8 h-8 text-orange-600" />
    }
  ];

  const goals = [
    'Increase Productivity',
    'Improve Work-Life Balance',
    'Develop New Skills',
    'Advance Career',
    'Better Time Management',
    'Enhance Creativity'
  ];

  const workStyles = [
    { id: 'focused', label: 'Deep Focus', description: 'Long periods of concentrated work' },
    { id: 'collaborative', label: 'Collaborative', description: 'Team-based and social work' },
    { id: 'flexible', label: 'Flexible', description: 'Adaptable to changing priorities' },
    { id: 'structured', label: 'Structured', description: 'Organized and systematic approach' }
  ];

  const handleGoalToggle = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if backend is available
      const backendAvailable = await fetch('/api/health').then(res => res.ok).catch(() => false);
      
      if (backendAvailable) {
        // Make real API call to save configuration
        const response = await fetch('/api/digital-twin/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token'}`
          },
          body: JSON.stringify({
            goals: formData.goals,
            workStyle: formData.workStyle,
            preferences: formData.preferences,
            interests: formData.interests,
            completedAt: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          alert('Digital Twin configured successfully! Redirecting to your twin dashboard...');
          // Use Next.js router for navigation
          router.push('/digital-twin/my-twin');
        } else {
          setError('Failed to save configuration. Please try again.');
        }
      } else {
        // Fallback behavior when backend unavailable
        alert('Digital Twin configured successfully! (Demo mode - configuration saved locally)');
        localStorage.setItem('digitalTwinConfig', JSON.stringify(formData));
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setError('Failed to save configuration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Digital Twin</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Your Digital Twin is an AI-powered companion that learns from your work patterns, 
              helps optimize your productivity, and provides personalized insights to help you achieve your goals.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">AI Learning</h3>
                <p className="text-sm text-gray-600">Continuously learns from your behavior patterns</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Goal Tracking</h3>
                <p className="text-sm text-gray-600">Helps you set and achieve professional goals</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <Settings className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Personalization</h3>
                <p className="text-sm text-gray-600">Adapts to your unique work style and preferences</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">What are your main goals?</h2>
            <p className="text-gray-600 mb-8 text-center">Select all that apply. Your Digital Twin will help you achieve these objectives.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {goals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleGoalToggle(goal)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    formData.goals.includes(goal)
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{goal}</span>
                    {formData.goals.includes(goal) && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">How do you work best?</h2>
            <p className="text-gray-600 mb-8 text-center">Choose the work style that best describes you.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {workStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setFormData(prev => ({ ...prev, workStyle: style.id }))}
                  className={`p-6 rounded-lg border-2 text-left transition-all ${
                    formData.workStyle === style.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{style.label}</h3>
                    {formData.workStyle === style.id && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{style.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuration Complete!</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Your Digital Twin is ready to start learning from your work patterns and helping you achieve your goals.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Your Configuration Summary:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Selected Goals:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {formData.goals.map((goal, index) => (
                      <li key={index}>• {goal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Work Style:</h4>
                  <p className="text-sm text-gray-600">
                    {workStyles.find(s => s.id === formData.workStyle)?.label || 'Not selected'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">🚀 What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-2 text-left">
                <li>• Your Digital Twin will start observing your work patterns</li>
                <li>• AI analysis will begin generating personalized insights</li>
                <li>• Goal tracking and progress monitoring will be activated</li>
                <li>• You'll receive your first insights within 24-48 hours</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Digital Twin Onboarding - Digame</title>
        <meta name="description" content="Set up your AI-powered digital twin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Digital Twin Onboarding"
          subtitle="Set up your AI-powered professional companion"
          icon={<Rocket className="w-6 h-6 text-blue-600" />}
          badge="SETUP"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Progress Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
              </h2>
              <p className="text-gray-600">{steps[currentStep - 1]?.description}</p>
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between max-w-4xl mx-auto">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Activating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Activate Digital Twin</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DigitalTwinOnboarding;
