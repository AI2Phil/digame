import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ChevronLeft, Check, User, Settings, 
  Target, Zap, Bell, Shield, Palette, Globe 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Switch } from '../ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import { LayoutDashboard, ListChecks, Lightbulb } from 'lucide-react'; // Added for FeaturesStep

const OnboardingWizard = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    current_step_id: 'welcome',
    completed_steps: [], // Array of { step_id: string, completed_at: string }
    user_preferences: {
      notifications: { email: true, push: true, frequency: 'normal' },
      privacy: { analytics: true, data_sharing: false },
      appearance: { theme: 'system', language: 'en' }
    },
    goals: { primary_goal: '', productivity_target: 'moderate', focus_areas: [] },
    feature_exploration: {}, // { dashboard: true, goals: false, ... }
    is_completed: false
  });

  // Effect to apply theme based on user preference
  useEffect(() => {
    const root = window.document.documentElement;
    const theme = onboardingData.user_preferences.appearance.theme;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else { // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [onboardingData.user_preferences.appearance.theme]);


  const steps = [
    { id: 'welcome', title: 'Welcome', description: 'Get started with Digame', icon: User, component: WelcomeStep },
    { id: 'preferences', title: 'Preferences', description: 'Customize your experience', icon: Settings, component: PreferencesStep },
    { id: 'goals', title: 'Goals', description: 'Define your objectives', icon: Target, component: GoalsStep },
    { id: 'features', title: 'Features', description: 'Discover key functionalities', icon: Zap, component: FeaturesStep },
    { id: 'complete', title: 'Complete', description: 'You\'re ready to go!', icon: Check, component: CompleteStep }
  ];

  const updateOnboardingData = (updates) => {
    setOnboardingData(prev => {
      const newState = { ...prev, ...updates };
      if (updates.user_preferences || updates.goals || updates.feature_exploration) {
        newState.current_step_id = steps[currentStep].id; // Ensure current_step_id is updated with other data
      }
      return newState;
    });
  };

  const markStepCompleted = (stepId) => {
    setOnboardingData(prev => {
      const existingStep = prev.completed_steps.find(s => s.step_id === stepId);
      if (existingStep) return prev; // Already completed

      return {
        ...prev,
        completed_steps: [
          ...prev.completed_steps,
          { step_id: stepId, completed_at: new Date().toISOString() }
        ]
      };
    });
  };


  const nextStep = () => {
    markStepCompleted(steps[currentStep].id);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setOnboardingData(prev => ({ ...prev, current_step_id: steps[currentStep + 1].id }));
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setOnboardingData(prev => ({ ...prev, current_step_id: steps[currentStep - 1].id }));
    }
  };

  const completeOnboarding = async () => {
    markStepCompleted(steps[currentStep].id); // Mark the final step as completed
    const finalData = {
      ...onboardingData,
      is_completed: true,
      current_step_id: 'complete', // Ensure this is set
       // Ensure all steps up to the current one are in completed_steps if not already
      completed_steps: steps.slice(0, steps.length).map(s => ({ // Mark all steps as completed
        step_id: s.id,
        completed_at: onboardingData.completed_steps.find(cs => cs.step_id === s.id)?.completed_at || new Date().toISOString()
      }))
    };
    setOnboardingData(finalData); // Update local state immediately for UI consistency

    try {
      // Simulate API call
      // const response = await fetch('/onboarding/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      //   body: JSON.stringify(finalData)
      // });
      // if (response.ok) {
      //   onComplete && onComplete(finalData);
      // } else {
      //   console.error('Failed to save onboarding data, server responded with:', response.status);
      // }
      console.log("Submitting onboarding data:", finalData);
      onComplete && onComplete(finalData); // For now, directly call onComplete
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
    }
  };

  const progress = ((currentStep) / (steps.length -1)) * 100; // More accurate progress
  const CurrentStepComponent = steps[currentStep].component;
  const isStepCompleted = (stepId) => onboardingData.completed_steps.some(s => s.step_id === stepId);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-slate-200 dark:from-gray-900 dark:to-slate-800 flex items-center justify-center p-4 sm:p-6 md:p-8 transition-colors duration-300">
      <div className="w-full max-w-2xl lg:max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Welcome to Digame
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Let's set up your digital professional twin in just a few steps.
          </p>
        </div>

        {/* Progress Bar and Step Text */}
        <div className="mb-6 md:mb-8 px-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Step Indicators (Mobile Optimized) */}
         <div className="sm:hidden flex items-center justify-around mb-6 md:mb-8 space-x-1 px-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const completed = isStepCompleted(step.id);
            const isCurrent = index === currentStep;
            return (
              <div
                key={`mobile-${step.id}`}
                className={`
                  flex flex-col items-center p-1 rounded-md transition-all duration-300
                  ${isCurrent ? 'bg-blue-500 text-white scale-110' : completed ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                `}
                style={{ flexBasis: `${100 / steps.length}%` }} // Distribute width equally
              >
                <Icon className={`w-4 h-4 ${isCurrent || completed ? '' : 'opacity-70'}`} />
                 <span className="text-[10px] mt-0.5 truncate">{isCurrent ? step.title : ''}</span>
              </div>
            );
          })}
        </div>


        {/* Step Indicators (Desktop) */}
        <div className="hidden sm:flex items-center justify-center mb-6 md:mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const completed = isStepCompleted(step.id);
            const isCurrent = index === currentStep;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center text-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                    ${completed && !isCurrent
                      ? 'bg-green-500 border-green-600 text-white shadow-lg'
                      : isCurrent
                        ? 'bg-blue-500 border-blue-600 text-white shadow-lg scale-110'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                    }
                  `}>
                    {completed && !isCurrent ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <p className={`
                    mt-2 text-xs font-medium transition-colors duration-300 truncate max-w-[70px] sm:max-w-[90px]
                    ${isCurrent ? 'text-blue-600 dark:text-blue-400' : completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}
                  `}>{step.title}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-2 transition-colors duration-300
                    ${completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
                  `} />
                )}
              </React.Fragment>
            );
          })}
        </div>


        {/* Main Content Card */}
        <Card className="mb-6 md:mb-8 shadow-xl dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="text-center border-b dark:border-gray-700 pb-4 pt-5">
            <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-2 border border-blue-200 dark:border-blue-700">
              {React.createElement(steps[currentStep].icon, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" })}
            </div>
            <CardTitle className="text-xl sm:text-2xl text-gray-800 dark:text-gray-100">
              {steps[currentStep].title}
            </CardTitle>
            {steps[currentStep].description && (
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {steps[currentStep].description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <CurrentStepComponent 
              data={onboardingData}
              updateData={updateOnboardingData}
              // onNext prop removed as it's not used by step components directly
            />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            {currentStep < steps.length -1 && (
                 <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="w-full sm:w-auto text-gray-500 dark:text-gray-400 dark:hover:bg-gray-700/50"
                 >
                    Skip for now
                 </Button>
            )}
            
            <Button
              onClick={nextStep}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next Step'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components (Refactored for clarity, maintainability, and styling)

const WelcomeStep = ({ data, updateData }) => {
  const keyAreas = [
    {
      title: "Personalized Dashboard",
      description: "View your tailored productivity metrics and insights at a glance.",
      icon: LayoutDashboard, // Example icon
      color: "blue"
    },
    {
      title: "Behavioral Analysis",
      description: "Understand your work patterns and get AI-driven feedback.",
      icon: Lightbulb, // Example icon
      color: "purple"
    },
    {
      title: "Goal Setting & Tracking",
      description: "Define, track, and achieve your professional objectives.",
      icon: ListChecks, // Example icon
      color: "green"
    }
  ];

  return (
    <div className="text-center space-y-8 py-4">
      {/* Existing Welcome Content */}
      <div className="space-y-6">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto shadow-lg border border-blue-200 dark:border-blue-700">
          <User className="w-10 h-10 md:w-12 md:h-12 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Welcome to Your Digital Professional Twin
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base px-2">
            Digame helps you understand work patterns, boost productivity, and achieve professional goals
            through intelligent behavioral analysis and personalized insights.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {[
            { icon: Bell, title: "Smart Notifications", desc: "Get timely reminders & insights", color: "blue" },
            { icon: Target, title: "Goal Tracking", desc: "Monitor progress & achievements", color: "green" },
            { icon: Zap, title: "AI Insights", desc: "Discover patterns in your work", color: "purple" },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={`p-4 bg-${item.color}-50 dark:bg-${item.color}-900/30 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-${item.color}-100 dark:border-${item.color}-800`}>
                <Icon className={`w-7 h-7 md:w-8 md:h-8 text-${item.color}-600 dark:text-${item.color}-400 mb-2 mx-auto sm:mx-0`} />
                <h4 className={`font-medium text-sm md:text-base text-${item.color}-700 dark:text-${item.color}-300`}>{item.title}</h4>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* New "Discover Key Platform Areas" Section */}
      <div className="pt-6">
        <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Discover Key Platform Areas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {keyAreas.map(area => {
            const AreaIcon = area.icon;
            return (
              <Card key={area.title} className={`text-left bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow border dark:border-gray-700`}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-full bg-${area.color}-100 dark:bg-${area.color}-900/50`}>
                      <AreaIcon className={`w-6 h-6 text-${area.color}-600 dark:text-${area.color}-400`} />
                    </div>
                    <CardTitle className={`text-md font-semibold text-${area.color}-700 dark:text-${area.color}-300`}>{area.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{area.description}</p>
                  <Button variant="outline" size="sm" className={`w-full dark:text-${area.color}-400 dark:border-${area.color}-500 dark:hover:bg-${area.color}-700/50 text-${area.color}-600 border-${area.color}-300`}>
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PreferencesStep = ({ data, updateData }) => {
  const updatePreference = (category, key, value) => {
    updateData({
      user_preferences: {
        ...data.user_preferences,
        [category]: {
          ...data.user_preferences[category],
          [key]: value
        }
      }
    });
  };

  const preferenceCategories = [
    {
      id: "notifications", title: "Notification Preferences", icon: Bell,
      description: "Control how and when you receive notifications from Digame.",
      items: [
        { key: "email", label: "Email Notifications", desc: "Receive updates and summaries via email." },
        { key: "push", label: "Push Notifications", desc: "Get real-time alerts on your devices." },
      ],
      extraSettings: [ // For settings not fitting the Switch pattern, like Select
        {
          type: 'select',
          key: 'frequency',
          label: 'Notification Frequency',
          desc: 'Choose how often you want to receive non-critical notifications.',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'High' },
          ]
        }
      ]
    },
    {
      id: "privacy", title: "Privacy Settings", icon: Shield,
      description: "Manage your data privacy and how it's used within the platform.",
      items: [
        { key: "analytics", label: "Usage Analytics", desc: "Allow us to collect anonymous usage data to improve Digame." },
        { key: "data_sharing", label: "Anonymized Data Sharing", desc: "Permit sharing of anonymized data for research and platform insights." },
      ]
    },
    {
      id: "appearance", title: "Appearance", icon: Palette,
      description: "Customize the look and feel of the Digame interface.",
      items: [], // Theme and Language handled separately below
      extraSettings: [
        {
          type: 'select',
          key: 'theme',
          label: 'Theme',
          desc: 'Select your preferred color scheme for the interface.',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System Default' },
          ]
        },
        {
          type: 'select',
          key: 'language',
          label: 'Language',
          desc: 'Choose your preferred language for the platform.',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
          ]
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 py-2">
      {preferenceCategories.map(category => (
        <div key={category.id} className="p-4 border dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800/30">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <category.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {category.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 ml-7">{category.description}</p>

          {category.items.length > 0 && (
            <div className="space-y-3 sm:space-y-4 pl-1">
              {category.items.map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                  <div>
                    <Label htmlFor={`${category.id}-${item.key}`} className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                  <Switch
                    id={`${category.id}-${item.key}`}
                    checked={data.user_preferences[category.id]?.[item.key] || false}
                    onCheckedChange={(checked) => updatePreference(category.id, item.key, checked)}
                    className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {category.extraSettings && category.extraSettings.length > 0 && (
            <div className="space-y-4 pl-1 mt-4">
              {category.extraSettings.map(setting => {
                if (setting.type === 'select') {
                  return (
                    <div key={setting.key} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                      <Label htmlFor={`${category.id}-${setting.key}-select`} className="block text-sm font-medium text-gray-700 dark:text-gray-200">{setting.label}</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{setting.desc}</p>
                      <Select
                        value={data.user_preferences[category.id]?.[setting.key]}
                        onValueChange={(value) => updatePreference(category.id, setting.key, value)}
                        id={`${category.id}-${setting.key}-select`}
                      >
                        <SelectTrigger className="w-full dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                          <SelectValue placeholder={`Select ${setting.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:text-gray-200 border-gray-600">
                          {setting.options.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const GoalsStep = ({ data, updateData }) => {
  const MAX_FOCUS_AREAS = 3;

  const updateGoal = (key, value) => {
    updateData({
      goals: {
        ...data.goals,
        [key]: value
      }
    });
  };

  const focusAreasList = [
    'Time Management', 'Deep Work', 'Communication', 'Learning',
    'Health & Wellness', 'Team Collaboration', 'Innovation', 'Leadership',
    'Project Management', 'Public Speaking', 'Networking', 'Career Growth',
    'Stress Management', 'Work-Life Balance', 'Technical Skills'
  ].sort();

  const selectedFocusAreas = data.goals.focus_areas || [];

  const toggleFocusArea = (area) => {
    const currentSelected = [...selectedFocusAreas];
    if (currentSelected.includes(area)) {
      updateGoal('focus_areas', currentSelected.filter(a => a !== area));
    } else {
      if (currentSelected.length < MAX_FOCUS_AREAS) {
        updateGoal('focus_areas', [...currentSelected, area]);
      }
    }
  };

  const canSelectMoreFocusAreas = selectedFocusAreas.length < MAX_FOCUS_AREAS;

  return (
    <div className="space-y-6 md:space-y-8 py-2">
      <div>
        <Label htmlFor="primary-goal" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
          What's your primary professional goal for using Digame?
        </Label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">This helps us tailor your experience (e.g., "Improve productivity by 20%", "Master a new skill for career change", "Better work-life balance").</p>
        <Input
          id="primary-goal"
          placeholder="Be specific and actionable if possible"
          value={data.goals.primary_goal}
          onChange={(e) => updateGoal('primary_goal', e.target.value)}
          className="mt-1 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        />
      </div>

      <div>
        <Label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Productivity Target</Label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Select how ambitious you want your initial productivity goals to be within the platform.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-2">
          {['gentle', 'moderate', 'ambitious'].map((level) => (
            <Button
              key={level}
              variant={data.goals.productivity_target === level ? 'default' : 'outline'}
              onClick={() => updateGoal('productivity_target', level)}
              className={`capitalize w-full
                          ${data.goals.productivity_target === level
                            ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                            : 'dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700/50'}`}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Focus Areas</Label>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            {selectedFocusAreas.length}/{MAX_FOCUS_AREAS} selected
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Choose up to {MAX_FOCUS_AREAS} areas you want to improve or concentrate on. This will help Digame personalize your insights.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
          {focusAreasList.map((area) => {
            const isSelected = selectedFocusAreas.includes(area);
            const isDisabled = !isSelected && !canSelectMoreFocusAreas;
            return (
              <Button
                key={area}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => toggleFocusArea(area)}
                size="sm"
                disabled={isDisabled}
                className={`w-full text-xs sm:text-sm transition-opacity
                            ${isSelected
                              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                              : `dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700/50 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`
                            }`}
              >
                {area}
              </Button>
            );
          })}
        </div>
        {!canSelectMoreFocusAreas && selectedFocusAreas.length === MAX_FOCUS_AREAS && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-2 text-center sm:text-left">
            You've reached the maximum of {MAX_FOCUS_AREAS} focus areas. To select a new one, please deselect an existing area first.
          </p>
        )}
      </div>
    </div>
  );
};

const FeaturesStep = ({ data, updateData }) => {
  const features = [
    {
      id: 'dashboard',
      name: 'Analytics Dashboard',
      description: 'View your productivity metrics and trends.',
      detailed_description: 'Our Analytics Dashboard provides a comprehensive overview of your work patterns, task completion rates, and focus times. Visualize your progress with interactive charts and identify areas for improvement.',
      lucideIcon: LayoutDashboard,
      color: 'blue'
    },
    {
      id: 'goals',
      name: 'Goal Tracking',
      description: 'Set and monitor your professional objectives.',
      detailed_description: 'Define clear, measurable goals and track your progress directly within Digame. Break down large objectives into smaller tasks and celebrate your achievements along the way.',
      lucideIcon: ListChecks,
      color: 'green'
    },
    {
      id: 'insights',
      name: 'AI Insights',
      description: 'Get personalized recommendations.',
      detailed_description: 'Leverage the power of AI to receive personalized insights based on your unique work style. Discover your peak productivity times, common distractions, and actionable tips to enhance your focus.',
      lucideIcon: Lightbulb,
      color: 'purple'
    },
    {
      id: 'notifications',
      name: 'Smart Notifications',
      description: 'Receive timely productivity reminders.',
      detailed_description: 'Stay on track with intelligent reminders for tasks, breaks, and upcoming deadlines. Customize your notification preferences to fit your workflow and minimize disruptions.',
      lucideIcon: Bell,
      color: 'orange'
    }
  ];

  const markFeatureExplored = (featureId) => {
    updateData({
      feature_exploration: {
        ...data.feature_exploration,
        [featureId]: !data.feature_exploration[featureId] // Toggle exploration
      }
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 py-2">
      <div className="text-center">
        <h3 className="text-lg md:text-xl font-semibold mb-1 text-gray-800 dark:text-gray-100">Interactive Feature Exploration</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Click on each feature to learn more and mark it as explored.</p>
      </div>

      <div className="space-y-4">
        {features.map((feature) => {
          const isExplored = data.feature_exploration[feature.id];
          
          return (
            <Card
              key={feature.id}
              className={`cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl dark:border-gray-600
                          ${isExplored
                            ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-green-500 bg-green-50 dark:bg-green-900/30 dark:ring-green-400 shadow-lg'
                            : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50 shadow-md'
                          }`}
              onClick={() => markFeatureExplored(feature.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-full bg-${feature.color}-100 dark:bg-${feature.color}-900/50 mt-1`}>
                    <feature.lucideIcon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-md text-gray-800 dark:text-gray-100">
                        {feature.name}
                      </h4>
                      {isExplored && <Check className="w-5 h-5 text-green-600 dark:text-green-400" />}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {feature.description}
                    </p>
                    {isExplored && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-300 leading-relaxed">
                          {feature.detailed_description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="text-center mt-6">
        <Badge variant="secondary" className="dark:bg-gray-600 dark:text-gray-200">
          {Object.values(data.feature_exploration).filter(Boolean).length} of {features.length} features explored
        </Badge>
      </div>
    </div>
  );
};

const CompleteStep = ({ data }) => (
  <div className="text-center space-y-6 py-4">
    <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto shadow-lg border border-green-200 dark:border-green-700">
      <Check className="w-10 h-10 md:w-12 md:h-12 text-green-600 dark:text-green-400" />
    </div>
    <div>
      <h3 className="text-xl md:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">You're All Set!</h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base px-2">
        Your Digame profile is now configured. You can always update your preferences 
        in the settings later.
      </p>
    </div>
    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 sm:p-6 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800">
      <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300 text-base md:text-lg">What's Next?</h4>
      <ul className="text-sm md:text-base text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside text-left max-w-md mx-auto">
        <li>Explore your personalized dashboard.</li>
        <li>Set up your first productivity goals.</li>
        <li>Connect your tools and apps (coming soon).</li>
        <li>Start tracking your professional growth!</li>
      </ul>
    </div>
  </div>
);

export default OnboardingWizard;