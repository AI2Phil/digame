import React, { useState } from 'react';
import Head from 'next/head';
import { ChevronRight, ChevronLeft, CheckCircle, Users, BarChart3, Zap, Target, Settings, Sparkles, ArrowRight } from 'lucide-react';
import PageHeader from '../../src/components/navigation/PageHeader';

export default function EnhancedOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    role: '',
    teamSize: '',
    primaryGoals: [],
    industryType: '',
    experienceLevel: '',
    interestedFeatures: [],
    workflowType: '',
    dataTypes: [],
    integrationNeeds: [],
    preferences: {
      notifications: true,
      emailUpdates: true,
      weeklyReports: false,
      theme: 'light'
    }
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Digame',
      subtitle: 'Let\'s personalize your experience',
      icon: Sparkles,
      component: 'WelcomeStep'
    },
    {
      id: 'role',
      title: 'Tell us about yourself',
      subtitle: 'Help us understand your role and responsibilities',
      icon: Users,
      component: 'RoleStep'
    },
    {
      id: 'goals',
      title: 'What are your goals?',
      subtitle: 'Select your primary objectives with Digame',
      icon: Target,
      component: 'GoalsStep'
    },
    {
      id: 'features',
      title: 'Choose your features',
      subtitle: 'Select the features you\'re most interested in',
      icon: Zap,
      component: 'FeaturesStep'
    },
    {
      id: 'workflow',
      title: 'Workflow preferences',
      subtitle: 'Tell us about your work style and data needs',
      icon: BarChart3,
      component: 'WorkflowStep'
    },
    {
      id: 'preferences',
      title: 'Customize your experience',
      subtitle: 'Set your notification and display preferences',
      icon: Settings,
      component: 'PreferencesStep'
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      subtitle: 'Your personalized Digame experience is ready',
      icon: CheckCircle,
      component: 'CompleteStep'
    }
  ];

  const roleOptions = [
    { id: 'executive', label: 'Executive/Manager', description: 'Leading teams and making strategic decisions' },
    { id: 'analyst', label: 'Data Analyst', description: 'Working with data and creating insights' },
    { id: 'developer', label: 'Developer/Engineer', description: 'Building and maintaining technical solutions' },
    { id: 'marketer', label: 'Marketing Professional', description: 'Driving growth and customer engagement' },
    { id: 'consultant', label: 'Consultant', description: 'Providing expertise to clients and organizations' },
    { id: 'entrepreneur', label: 'Entrepreneur', description: 'Building and growing your own business' },
    { id: 'student', label: 'Student/Researcher', description: 'Learning and conducting research' },
    { id: 'other', label: 'Other', description: 'Something else entirely' }
  ];

  const goalOptions = [
    { id: 'productivity', label: 'Increase Productivity', icon: Zap },
    { id: 'insights', label: 'Gain Data Insights', icon: BarChart3 },
    { id: 'automation', label: 'Automate Workflows', icon: Settings },
    { id: 'collaboration', label: 'Improve Team Collaboration', icon: Users },
    { id: 'decision-making', label: 'Better Decision Making', icon: Target },
    { id: 'efficiency', label: 'Streamline Operations', icon: ArrowRight }
  ];

  const featureOptions = [
    { id: 'analytics', label: 'Advanced Analytics', description: 'Deep insights and data visualization' },
    { id: 'digital-twin', label: 'Digital Twin AI', description: 'Personal AI assistant and behavior modeling' },
    { id: 'automation', label: 'Workflow Automation', description: 'Automate repetitive tasks and processes' },
    { id: 'collaboration', label: 'Team Collaboration', description: 'Enhanced team communication and project management' },
    { id: 'reporting', label: 'Custom Reporting', description: 'Create and share custom reports and dashboards' },
    { id: 'integrations', label: 'Third-party Integrations', description: 'Connect with your existing tools and services' }
  ];

  const workflowTypes = [
    { id: 'structured', label: 'Structured & Planned', description: 'I prefer organized, step-by-step processes' },
    { id: 'flexible', label: 'Flexible & Adaptive', description: 'I like to adapt and change direction as needed' },
    { id: 'collaborative', label: 'Collaborative & Social', description: 'I work best with team input and feedback' },
    { id: 'independent', label: 'Independent & Focused', description: 'I prefer to work autonomously with minimal interruptions' }
  ];

  const updateData = (field, value) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleArrayValue = (field, value) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    // In a real implementation, this would save the onboarding data and redirect to the dashboard
    alert('Onboarding completed! Redirecting to your personalized dashboard...');
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.component) {
      case 'WelcomeStep':
        return (
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Digame!</h2>
            <p className="text-xl text-gray-600 mb-8">
              We'll help you set up your account and personalize your experience in just a few minutes.
            </p>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">What you'll get:</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Personalized dashboard based on your role</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Customized feature recommendations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Optimized workflows for your goals</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Smart notifications and insights</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'RoleStep':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What best describes your role?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  onClick={() => updateData('role', role.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    onboardingData.role === role.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{role.label}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'GoalsStep':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What are your primary goals? (Select all that apply)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goalOptions.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleArrayValue('primaryGoals', goal.id)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    onboardingData.primaryGoals.includes(goal.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <goal.icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{goal.label}</h3>
                </button>
              ))}
            </div>
          </div>
        );

      case 'FeaturesStep':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Which features interest you most?</h2>
            <div className="space-y-4">
              {featureOptions.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => toggleArrayValue('interestedFeatures', feature.id)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    onboardingData.interestedFeatures.includes(feature.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.label}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'WorkflowStep':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How do you prefer to work?</h2>
            <div className="space-y-4">
              {workflowTypes.map((workflow) => (
                <button
                  key={workflow.id}
                  onClick={() => updateData('workflowType', workflow.id)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    onboardingData.workflowType === workflow.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{workflow.label}</h3>
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'PreferencesStep':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customize your preferences</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={onboardingData.preferences.notifications}
                      onChange={(e) => updateData('preferences', {
                        ...onboardingData.preferences,
                        notifications: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">Enable push notifications</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={onboardingData.preferences.emailUpdates}
                      onChange={(e) => updateData('preferences', {
                        ...onboardingData.preferences,
                        emailUpdates: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">Receive email updates</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={onboardingData.preferences.weeklyReports}
                      onChange={(e) => updateData('preferences', {
                        ...onboardingData.preferences,
                        weeklyReports: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">Weekly summary reports</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Theme</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => updateData('preferences', {
                      ...onboardingData.preferences,
                      theme: 'light'
                    })}
                    className={`px-4 py-2 border rounded-lg ${
                      onboardingData.preferences.theme === 'light'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => updateData('preferences', {
                      ...onboardingData.preferences,
                      theme: 'dark'
                    })}
                    className={`px-4 py-2 border rounded-lg ${
                      onboardingData.preferences.theme === 'dark'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => updateData('preferences', {
                      ...onboardingData.preferences,
                      theme: 'auto'
                    })}
                    className={`px-4 py-2 border rounded-lg ${
                      onboardingData.preferences.theme === 'auto'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    Auto
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'CompleteStep':
        return (
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">You're all set!</h2>
            <p className="text-xl text-gray-600 mb-8">
              Your personalized Digame experience is ready. We've customized your dashboard and features based on your preferences.
            </p>
            <div className="bg-green-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">What's next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Explore your dashboard</h4>
                    <p className="text-sm text-gray-600">See your personalized insights and recommendations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Try key features</h4>
                    <p className="text-sm text-gray-600">Start with the features you selected</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Connect your data</h4>
                    <p className="text-sm text-gray-600">Import or connect your existing data sources</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Get help when needed</h4>
                    <p className="text-sm text-gray-600">Access our help center and support resources</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={completeOnboarding}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Enhanced Onboarding - Digame</title>
        <meta name="description" content="Personalize your Digame experience with our enhanced onboarding wizard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Enhanced Onboarding"
          subtitle="Personalize your Digame experience"
          icon={<Sparkles className="w-6 h-6 text-blue-600" />}
        />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 overflow-x-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= currentStep
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={completeOnboarding}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <span>Complete Setup</span>
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}