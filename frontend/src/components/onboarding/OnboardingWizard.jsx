import React, { useState } from 'react';
import {
  ChevronRight, ChevronLeft, Check, User, Settings,
  Target, Zap, Bell, Shield, Palette
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { Badge } from '../ui/Badge';
import { Stepper, StepItem } from '../ui/Stepper'; // Import Stepper
import {
  Form,
  FormField,
  FormLabel,
  FormInput,
  FormSelect,
  // FormCheckbox, // Using Switch for now, so not importing FormCheckbox
  // FormSubmitButton // Using existing Buttons for next/prev logic
} from '../ui/Form';

const OnboardingWizard = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    current_step_id: 'welcome',
    completed_steps: [],
    user_preferences: {
      notifications: {
        email: true,
        push: true,
        frequency: 'normal'
      },
      privacy: {
        analytics: true,
        data_sharing: false
      },
      appearance: {
        theme: 'system',
        language: 'en'
      }
    },
    goals: {
      primary_goal: '',
      productivity_target: 'moderate',
      focus_areas: []
    },
    feature_exploration: {},
    is_completed: false
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Digame',
      description: 'Your Digital Professional Twin Platform',
      icon: User,
      component: WelcomeStep
    },
    {
      id: 'preferences',
      title: 'Set Your Preferences',
      description: 'Customize your experience',
      icon: Settings,
      component: PreferencesStep
    },
    {
      id: 'goals',
      title: 'Define Your Goals',
      description: 'What do you want to achieve?',
      icon: Target,
      component: GoalsStep
    },
    {
      id: 'features',
      title: 'Explore Features',
      description: 'Discover what Digame can do',
      icon: Zap,
      component: FeaturesStep
    },
    {
      id: 'complete',
      title: 'All Set!',
      description: 'You\'re ready to start',
      icon: Check,
      component: CompleteStep
    }
  ];

  const updateOnboardingData = (updates) => {
    setOnboardingData(prev => ({
      ...prev,
      ...updates,
      current_step_id: steps[currentStep].id
    }));
  };

  const markStepCompleted = (stepId) => {
    const completedStep = {
      step_id: stepId,
      completed_at: new Date().toISOString()
    };

    setOnboardingData(prev => ({
      ...prev,
      completed_steps: [
        ...prev.completed_steps.filter(step => step.step_id !== stepId),
        completedStep
      ]
    }));
  };

  const nextStep = () => {
    markStepCompleted(steps[currentStep].id);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    const finalData = {
      ...onboardingData,
      is_completed: true,
      current_step_id: 'complete'
    };

    // Check if we're in demo mode
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    
    if (isDemoMode) {
      // In demo mode, redirect to CTA page instead of completing onboarding
      console.log('Demo mode: Redirecting to Call-to-Action page');
      // Redirect to pricing page with demo completion context
      window.location.href = '/pricing?demo_completed=true';
      return;
    }

    try {
      const response = await fetch('/onboarding/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(finalData)
      });

      if (response.ok) {
        onComplete && onComplete(finalData);
      } else {
        // If API fails, still complete the onboarding for better UX
        console.warn('Onboarding API failed, completing locally');
        onComplete && onComplete(finalData);
      }
    } catch (error) {
      console.warn('Failed to save onboarding data, completing locally:', error);
      // Still complete the onboarding even if API fails
      onComplete && onComplete(finalData);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  const handleStepChange = (newStepIndex) => {
    // If moving backwards, no need to mark completed
    if (newStepIndex < currentStep) {
      setCurrentStep(newStepIndex);
      return;
    }
    // If moving forwards, mark current step as completed before changing
    markStepCompleted(steps[currentStep].id);
    setCurrentStep(newStepIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Digame
          </h1>
          <p className="text-gray-600">
            Let's set up your digital professional twin in just a few steps
          </p>
        </div>

        {/* Stepper Component */}
        <div className="mb-8 px-4 md:px-0">
          <Stepper
            initialStep={currentStep}
            onStepChange={handleStepChange}
            isClickable={true} // Allow users to click on previous steps
            orientation="horizontal"
            className="mb-6"
          >
            {steps.map((step, index) => (
              <StepItem
                key={step.id}
                label={step.title}
                icon={React.createElement(step.icon, { className: "w-5 h-5" })}
                isCompleted={onboardingData.completed_steps.some(cs => cs.step_id === step.id) || currentStep > index}
              >
                {/* Content for each step is rendered below by CurrentStepComponent */}
              </StepItem>
            ))}
          </Stepper>
        </div>

        {/* Main Content based on CurrentStepComponent */}
        {/* The Stepper itself doesn't render content; we do it here based on its state */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            {/* Title and description are now part of the StepItem label,
                but we can keep a general header or remove it if redundant */}
            <CardTitle className="flex items-center justify-center gap-2">
               {React.createElement(steps[currentStep].icon, { className: "w-6 h-6" })}
               {steps[currentStep].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              data={onboardingData}
              updateData={updateOnboardingData}
              onNext={nextStep} // This component might trigger nextStep
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onSkip} // Assuming onSkip is passed from OnboardingPage
              className="text-gray-500"
            >
              Skip for now
            </Button>
            
            <Button
              onClick={nextStep} // This button triggers the main nextStep logic
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next Step'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              {currentStep === steps.length - 1 && <Check className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const WelcomeStep = ({ data, updateData }) => (
  <div className="text-center space-y-6">
    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
      <User className="w-12 h-12 text-blue-600" />
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-2">
        Welcome to Your Digital Professional Twin
      </h3>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Digame helps you understand your work patterns, boost productivity, and achieve your professional goals 
        through intelligent behavioral analysis and personalized insights.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <div className="p-4 bg-blue-50 rounded-lg">
        <Bell className="w-8 h-8 text-blue-600 mb-2" />
        <h4 className="font-medium">Smart Notifications</h4>
        <p className="text-sm text-gray-600">Get timely reminders and insights</p>
      </div>
      <div className="p-4 bg-green-50 rounded-lg">
        <Target className="w-8 h-8 text-green-600 mb-2" />
        <h4 className="font-medium">Goal Tracking</h4>
        <p className="text-sm text-gray-600">Monitor your progress and achievements</p>
      </div>
      <div className="p-4 bg-purple-50 rounded-lg">
        <Zap className="w-8 h-8 text-purple-600 mb-2" />
        <h4 className="font-medium">AI Insights</h4>
        <p className="text-sm text-gray-600">Discover patterns in your work</p>
      </div>
    </div>
  </div>
);

const PreferencesStep = ({ data, updateData, onNext }) => {
  const handleSwitchChange = (category, key, checked) => {
    updateData({
      user_preferences: {
        ...data.user_preferences,
        [category]: {
          ...data.user_preferences[category],
          [key]: checked
        }
      }
    });
  };

  // Form's onSubmit will call this, then the main "Next" button handles step progression
  const handleFormSubmit = (formDataFromFormContext) => {
    // formDataFromFormContext here will only contain fields managed by FormInput, FormSelect etc.
    // So, we merge it with the existing user_preferences which holds switch values.
    updateData({
      user_preferences: {
        ...data.user_preferences, // keep existing values like those from switches
        appearance: { // Assuming 'appearance.theme' is the only field managed by FormSelect here
            ...data.user_preferences.appearance,
            theme: formDataFromFormContext['appearance.theme']
        }
      }
    });
    // Actual step progression is handled by the main "Next" button in OnboardingWizard
  };

  return (
    <Form
      onSubmit={handleFormSubmit}
      defaultValues={{
        'appearance.theme': data.user_preferences.appearance.theme
      }} // Only fields for FormSelect/FormInput
      // Add validation if needed, e.g.
      // validation={{ 'appearance.theme': { required: 'Theme is required' } }}
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </h3>
          <div className="space-y-4">
            {/* Email Notifications Switch */}
            <div className="flex items-center justify-between">
              <div>
                <FormLabel htmlFor="notifications.email">Email Notifications</FormLabel>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <Switch
                id="notifications.email"
                checked={data.user_preferences.notifications.email}
                onCheckedChange={(checked) => handleSwitchChange('notifications', 'email', checked)}
              />
            </div>
            {/* Push Notifications Switch */}
            <div className="flex items-center justify-between">
              <div>
                <FormLabel htmlFor="notifications.push">Push Notifications</FormLabel>
                <p className="text-sm text-gray-500">Get real-time alerts</p>
              </div>
              <Switch
                id="notifications.push"
                checked={data.user_preferences.notifications.push}
                onCheckedChange={(checked) => handleSwitchChange('notifications', 'push', checked)}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Settings
          </h3>
          <div className="space-y-4">
            {/* Analytics Switch */}
            <div className="flex items-center justify-between">
              <div>
                <FormLabel htmlFor="privacy.analytics">Analytics</FormLabel>
                <p className="text-sm text-gray-500">Help improve Digame with usage data</p>
              </div>
              <Switch
                id="privacy.analytics"
                checked={data.user_preferences.privacy.analytics}
                onCheckedChange={(checked) => handleSwitchChange('privacy', 'analytics', checked)}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </h3>
          <div className="space-y-4">
            <div>
              <FormLabel htmlFor="appearance.theme">Theme</FormLabel>
              <FormField name="appearance.theme">
                <FormSelect
                  name="appearance.theme" // Name for Form context
                  id="appearance.theme"   // For label association
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' },
                  ]}
                  placeholder="Select a theme..."
                  // value and onChange are handled by FormContext
                  className="mt-1"
                />
              </FormField>
            </div>
          </div>
        </div>
      </div>
      {/* The main "Next" button of the wizard will implicitly trigger form validation if mode is onSubmit */}
      {/* Or validation happens onChange/onBlur based on Form settings */}
    </Form>
  );
};

const GoalsStep = ({ data, updateData, onNext }) => {
  // This function will be called by the Form's onSubmit
  const handleFormSubmit = (formDataFromFormContext) => {
    // formDataFromFormContext will contain 'primary_goal'
    // We merge it with existing goals data (productivity_target, focus_areas)
    updateData({
      goals: {
        ...data.goals, // Preserve existing target and focus areas
        primary_goal: formDataFromFormContext.primary_goal,
      }
    });
    // Actual step progression is handled by the main "Next" button
  };

  const goalValidationRules = {
    primary_goal: {
      required: 'Primary professional goal is required.',
      minLength: 5 // Example validation
    },
    // productivity_target and focus_areas are handled by buttons, not direct form inputs for validation here
  };

  const focusAreasOptions = [
    'Time Management', 'Deep Work', 'Communication', 'Learning',
    'Health & Wellness', 'Team Collaboration', 'Innovation', 'Leadership'
  ];

  // Handler for focus areas, separate from Form context
  const toggleFocusArea = (area) => {
    const currentFocusAreas = data.goals.focus_areas || [];
    const updatedFocusAreas = currentFocusAreas.includes(area)
      ? currentFocusAreas.filter(a => a !== area)
      : [...currentFocusAreas, area];
    updateData({ goals: { ...data.goals, focus_areas: updatedFocusAreas } });
  };

  // Handler for productivity target, separate from Form context
  const updateProductivityTarget = (level) => {
    updateData({ goals: { ...data.goals, productivity_target: level } });
  };

  return (
    <Form
      onSubmit={handleFormSubmit}
      defaultValues={{ primary_goal: data.goals.primary_goal || '' }}
      validation={goalValidationRules}
      mode="onChange" // Or onBlur/onSubmit
    >
      <div className="space-y-6">
        <div>
          <FormLabel htmlFor="primary_goal" required>What's your primary professional goal?</FormLabel>
          <FormField name="primary_goal">
            <FormInput
              name="primary_goal" // Critical for Form context
              id="primary-goal"   // For label association
              placeholder="e.g., Improve productivity, Better work-life balance, Learn new skills"
              className="mt-1"    // FormLabel has mb-1, so input gets mt-1
            />
          </FormField>
        </div>

        <div>
          <FormLabel>Productivity Target</FormLabel>
          <div className="grid grid-cols-3 gap-3 mt-1">
            {['gentle', 'moderate', 'ambitious'].map((level) => (
              <Button
                type="button" // Important: prevent default form submission
                key={level}
                variant={data.goals.productivity_target === level ? 'default' : 'outline'}
                onClick={() => updateProductivityTarget(level)}
                className="capitalize"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <FormLabel>Focus Areas (select all that apply)</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1"> {/* Adjusted grid for better layout */}
            {focusAreasOptions.map((area) => (
              <Button
                type="button" // Important: prevent default form submission
                key={area}
                variant={(data.goals.focus_areas || []).includes(area) ? 'default' : 'outline'}
                onClick={() => toggleFocusArea(area)}
                size="sm" // Keep size small for these buttons
              >
                {area}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {/* Main "Next" button outside this component will trigger form submission/validation */}
    </Form>
  );
};

const FeaturesStep = ({ data, updateData }) => {
  const features = [
    {
      id: 'dashboard',
      name: 'Analytics Dashboard',
      description: 'View your productivity metrics and trends',
      icon: '📊'
    },
    {
      id: 'goals',
      name: 'Goal Tracking',
      description: 'Set and monitor your professional objectives',
      icon: '🎯'
    },
    {
      id: 'insights',
      name: 'AI Insights',
      description: 'Get personalized recommendations',
      icon: '🧠'
    },
    {
      id: 'notifications',
      name: 'Smart Notifications',
      description: 'Receive timely productivity reminders',
      icon: '🔔'
    }
  ];

  const markFeatureExplored = (featureId) => {
    updateData({
      feature_exploration: {
        ...data.feature_exploration,
        [featureId]: true
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Explore Key Features</h3>
        <p className="text-gray-600">Click on each feature to learn more</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => {
          const isExplored = data.feature_exploration[feature.id];
          
          return (
            <Card
              key={feature.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isExplored ? 'ring-2 ring-green-500 bg-green-50' : ''
              }`}
              onClick={() => markFeatureExplored(feature.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium flex items-center gap-2">
                      {feature.name}
                      {isExplored && <Check className="w-4 h-4 text-green-600" />}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Badge variant="secondary">
          {Object.keys(data.feature_exploration).length} of {features.length} features explored
        </Badge>
      </div>
    </div>
  );
};

const CompleteStep = ({ data }) => (
  <div className="text-center space-y-6">
    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
      <Check className="w-12 h-12 text-green-600" />
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-2">You're All Set!</h3>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Your Digame profile is now configured. You can always update your preferences 
        in the settings later.
      </p>
    </div>
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-medium mb-2">What's Next?</h4>
      <ul className="text-sm text-gray-600 space-y-1">
        <li>• Explore your personalized dashboard</li>
        <li>• Set up your first productivity goals</li>
        <li>• Connect your tools and apps</li>
        <li>• Start tracking your professional growth</li>
      </ul>
    </div>
  </div>
);

export default OnboardingWizard;