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
import { Select } from '../ui/Select';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';

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
      }
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

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

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isCurrent 
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-12 h-0.5 mx-2 transition-colors
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader className="text-center">
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
              onNext={nextStep}
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
              onClick={onSkip}
              className="text-gray-500"
            >
              Skip for now
            </Button>
            
            <Button
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight className="w-4 h-4" />
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
            <Switch
              checked={data.user_preferences.notifications.email}
              onCheckedChange={(checked) => updatePreference('notifications', 'email', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-500">Get real-time alerts</p>
            </div>
            <Switch
              checked={data.user_preferences.notifications.push}
              onCheckedChange={(checked) => updatePreference('notifications', 'push', checked)}
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
          <div className="flex items-center justify-between">
            <div>
              <Label>Analytics</Label>
              <p className="text-sm text-gray-500">Help improve Digame with usage data</p>
            </div>
            <Switch
              checked={data.user_preferences.privacy.analytics}
              onCheckedChange={(checked) => updatePreference('privacy', 'analytics', checked)}
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
            <Label>Theme</Label>
            <Select
              value={data.user_preferences.appearance.theme}
              onValueChange={(value) => updatePreference('appearance', 'theme', value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalsStep = ({ data, updateData }) => {
  const updateGoal = (key, value) => {
    updateData({
      goals: {
        ...data.goals,
        [key]: value
      }
    });
  };

  const focusAreas = [
    'Time Management', 'Deep Work', 'Communication', 'Learning',
    'Health & Wellness', 'Team Collaboration', 'Innovation', 'Leadership'
  ];

  const toggleFocusArea = (area) => {
    const current = data.goals.focus_areas || [];
    const updated = current.includes(area)
      ? current.filter(a => a !== area)
      : [...current, area];
    updateGoal('focus_areas', updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="primary-goal">What's your primary professional goal?</Label>
        <Input
          id="primary-goal"
          placeholder="e.g., Improve productivity, Better work-life balance, Learn new skills"
          value={data.goals.primary_goal}
          onChange={(e) => updateGoal('primary_goal', e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <Label>Productivity Target</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {['gentle', 'moderate', 'ambitious'].map((level) => (
            <Button
              key={level}
              variant={data.goals.productivity_target === level ? 'default' : 'outline'}
              onClick={() => updateGoal('productivity_target', level)}
              className="capitalize"
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>Focus Areas (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {focusAreas.map((area) => (
            <Button
              key={area}
              variant={(data.goals.focus_areas || []).includes(area) ? 'default' : 'outline'}
              onClick={() => toggleFocusArea(area)}
              size="sm"
            >
              {area}
            </Button>
          ))}
        </div>
      </div>
    </div>
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