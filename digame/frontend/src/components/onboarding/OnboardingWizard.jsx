import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Form } from '../ui/Form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { 
  User, 
  Target, 
  Settings, 
  BarChart3, 
  Bell, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Clock,
  Brain
} from 'lucide-react';

const OnboardingWizard = ({ onComplete, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    profile: {
      displayName: user?.name || '',
      role: '',
      department: '',
      experience: '',
      avatar: null
    },
    goals: {
      primaryGoals: [],
      productivityTargets: {
        dailyHours: 8,
        focusTime: 4,
        breakFrequency: 2
      },
      learningObjectives: []
    },
    preferences: {
      notifications: {
        productivity: true,
        achievements: true,
        reminders: true,
        frequency: 'moderate'
      },
      dashboard: {
        defaultView: 'overview',
        widgets: ['productivity', 'goals', 'insights'],
        theme: 'light'
      },
      privacy: {
        dataSharing: false,
        analytics: true,
        publicProfile: false
      }
    },
    features: {
      enabledFeatures: [],
      interestedFeatures: []
    }
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Digame',
      subtitle: 'Your Digital Professional Twin',
      icon: Sparkles,
      description: 'Let\'s set up your personalized productivity experience'
    },
    {
      id: 'profile',
      title: 'Build Your Profile',
      subtitle: 'Tell us about yourself',
      icon: User,
      description: 'Help us understand your professional background'
    },
    {
      id: 'goals',
      title: 'Set Your Goals',
      subtitle: 'Define what success looks like',
      icon: Target,
      description: 'Establish your productivity and learning objectives'
    },
    {
      id: 'preferences',
      title: 'Customize Experience',
      subtitle: 'Tailor Digame to your needs',
      icon: Settings,
      description: 'Configure notifications, dashboard, and privacy settings'
    },
    {
      id: 'features',
      title: 'Explore Features',
      subtitle: 'Discover what Digame can do',
      icon: BarChart3,
      description: 'Learn about key features and enable what interests you'
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      subtitle: 'Ready to boost your productivity',
      icon: CheckCircle,
      description: 'Your personalized Digame experience is ready'
    }
  ];

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const updateOnboardingData = (section, data) => {
    setOnboardingData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
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

const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-white" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Digame</h2>
        <p className="text-xl text-gray-600 mb-4">Your Digital Professional Twin</p>
        <p className="text-gray-500 max-w-md mx-auto">
          Digame helps you track, analyze, and optimize your professional productivity 
          through intelligent insights and personalized recommendations.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="p-4">
          <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h3 className="font-semibold">Track Progress</h3>
          <p className="text-sm text-gray-600">Monitor your productivity patterns</p>
        </Card>
        <Card className="p-4">
          <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <h3 className="font-semibold">Get Insights</h3>
          <p className="text-sm text-gray-600">Receive AI-powered recommendations</p>
        </Card>
        <Card className="p-4">
          <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h3 className="font-semibold">Achieve Goals</h3>
          <p className="text-sm text-gray-600">Reach your professional objectives</p>
        </Card>
      </div>
    </div>
  );

  const renderProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Build Your Profile</h2>
        <p className="text-gray-600">Help us understand your professional background</p>
      </div>
      
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex justify-center mb-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={onboardingData.profile.avatar} />
            <AvatarFallback className="text-lg">
              {onboardingData.profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>

        <Form>
          <div className="space-y-4">
            <Input
              label="Display Name"
              value={onboardingData.profile.displayName}
              onChange={(e) => updateOnboardingData('profile', { displayName: e.target.value })}
              placeholder="How should we address you?"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={onboardingData.profile.role}
                onChange={(e) => updateOnboardingData('profile', { role: e.target.value })}
              >
                <option value="">Select your role</option>
                <option value="developer">Software Developer</option>
                <option value="designer">Designer</option>
                <option value="manager">Manager</option>
                <option value="analyst">Data Analyst</option>
                <option value="consultant">Consultant</option>
                <option value="researcher">Researcher</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Input
              label="Department"
              value={onboardingData.profile.department}
              onChange={(e) => updateOnboardingData('profile', { department: e.target.value })}
              placeholder="Engineering, Marketing, Sales..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={onboardingData.profile.experience}
                onChange={(e) => updateOnboardingData('profile', { experience: e.target.value })}
              >
                <option value="">Select experience level</option>
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (6-10 years)</option>
                <option value="lead">Lead/Principal (10+ years)</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );

  const renderGoalsStep = () => {
    const goalOptions = [
      { id: 'productivity', label: 'Increase Productivity', icon: TrendingUp },
      { id: 'focus', label: 'Improve Focus', icon: Target },
      { id: 'learning', label: 'Accelerate Learning', icon: Brain },
      { id: 'balance', label: 'Work-Life Balance', icon: Clock },
      { id: 'collaboration', label: 'Better Collaboration', icon: User },
      { id: 'efficiency', label: 'Process Efficiency', icon: Settings }
    ];

    const toggleGoal = (goalId) => {
      const currentGoals = onboardingData.goals.primaryGoals;
      const updatedGoals = currentGoals.includes(goalId)
        ? currentGoals.filter(g => g !== goalId)
        : [...currentGoals, goalId];
      
      updateOnboardingData('goals', { primaryGoals: updatedGoals });
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Goals</h2>
          <p className="text-gray-600">What would you like to achieve with Digame?</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Primary Goals (Select all that apply)</h3>
            <div className="grid grid-cols-2 gap-3">
              {goalOptions.map((goal) => {
                const Icon = goal.icon;
                const isSelected = onboardingData.goals.primaryGoals.includes(goal.id);
                
                return (
                  <Card 
                    key={goal.id}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleGoal(goal.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                        {goal.label}
                      </span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 ml-auto" />}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Productivity Targets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Work Hours
                </label>
                <Input
                  type="number"
                  min="1"
                  max="16"
                  value={onboardingData.goals.productivityTargets.dailyHours}
                  onChange={(e) => updateOnboardingData('goals', {
                    productivityTargets: {
                      ...onboardingData.goals.productivityTargets,
                      dailyHours: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deep Focus Hours
                </label>
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={onboardingData.goals.productivityTargets.focusTime}
                  onChange={(e) => updateOnboardingData('goals', {
                    productivityTargets: {
                      ...onboardingData.goals.productivityTargets,
                      focusTime: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breaks per Day
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={onboardingData.goals.productivityTargets.breakFrequency}
                  onChange={(e) => updateOnboardingData('goals', {
                    productivityTargets: {
                      ...onboardingData.goals.productivityTargets,
                      breakFrequency: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save onboarding data to backend
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(onboardingData)
      });

      if (response.ok) {
        onComplete(onboardingData);
      } else {
        throw new Error('Failed to save onboarding data');
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      // Still complete onboarding locally
      onComplete(onboardingData);
    }
const renderPreferencesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Experience</h2>
        <p className="text-gray-600">Configure Digame to work the way you do</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Preferences
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'productivity', label: 'Productivity insights and tips' },
                  { key: 'achievements', label: 'Goal achievements and milestones' },
                  { key: 'reminders', label: 'Break and focus reminders' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={onboardingData.preferences.notifications[item.key]}
                      onChange={(e) => updateOnboardingData('preferences', {
                        notifications: {
                          ...onboardingData.preferences.notifications,
                          [item.key]: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                ))}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Frequency
                  </label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={onboardingData.preferences.notifications.frequency}
                    onChange={(e) => updateOnboardingData('preferences', {
                      notifications: {
                        ...onboardingData.preferences.notifications,
                        frequency: e.target.value
                      }
                    })}
                  >
                    <option value="minimal">Minimal</option>
                    <option value="moderate">Moderate</option>
                    <option value="frequent">Frequent</option>
                  </select>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="dashboard" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Dashboard Layout</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default View
                  </label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={onboardingData.preferences.dashboard.defaultView}
                    onChange={(e) => updateOnboardingData('preferences', {
                      dashboard: {
                        ...onboardingData.preferences.dashboard,
                        defaultView: e.target.value
                      }
                    })}
                  >
                    <option value="overview">Overview</option>
                    <option value="analytics">Analytics</option>
                    <option value="goals">Goals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={onboardingData.preferences.dashboard.theme}
                    onChange={(e) => updateOnboardingData('preferences', {
                      dashboard: {
                        ...onboardingData.preferences.dashboard,
                        theme: e.target.value
                      }
                    })}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Privacy Settings
              </h3>
              <div className="space-y-3">
                {[
                  { 
                    key: 'analytics', 
                    label: 'Help improve Digame with usage analytics',
                    description: 'Anonymous usage data to enhance features'
                  },
                  { 
                    key: 'dataSharing', 
                    label: 'Share insights with team members',
                    description: 'Allow team visibility of your productivity metrics'
                  },
                  { 
                    key: 'publicProfile', 
                    label: 'Make profile discoverable',
                    description: 'Allow others to find and connect with you'
                  }
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={onboardingData.preferences.privacy[item.key]}
                      onChange={(e) => updateOnboardingData('preferences', {
                        privacy: {
                          ...onboardingData.preferences.privacy,
                          [item.key]: e.target.checked
                        }
                      })}
                      className="rounded mt-1"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  const renderFeaturesStep = () => {
    const features = [
      {
        id: 'productivity-tracking',
        name: 'Productivity Tracking',
        description: 'Monitor your daily productivity patterns and trends',
        icon: TrendingUp,
        category: 'Analytics'
      },
      {
        id: 'goal-management',
        name: 'Goal Management',
        description: 'Set, track, and achieve your professional objectives',
        icon: Target,
        category: 'Planning'
      },
      {
        id: 'insights-ai',
        name: 'AI Insights',
        description: 'Get personalized recommendations based on your data',
        icon: Brain,
        category: 'Intelligence'
      },
      {
        id: 'time-tracking',
        name: 'Time Tracking',
        description: 'Understand how you spend your time throughout the day',
        icon: Clock,
        category: 'Analytics'
      },
      {
        id: 'collaboration',
        name: 'Team Collaboration',
        description: 'Share insights and collaborate with team members',
        icon: User,
        category: 'Social'
      },
      {
        id: 'automation',
        name: 'Smart Automation',
        description: 'Automate routine tasks and workflows',
        icon: Settings,
        category: 'Efficiency'
      }
    ];

    const toggleFeature = (featureId) => {
      const currentFeatures = onboardingData.features.enabledFeatures;
      const updatedFeatures = currentFeatures.includes(featureId)
        ? currentFeatures.filter(f => f !== featureId)
        : [...currentFeatures, featureId];
      
      updateOnboardingData('features', { enabledFeatures: updatedFeatures });
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore Features</h2>
          <p className="text-gray-600">Choose the features you'd like to enable</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isEnabled = onboardingData.features.enabledFeatures.includes(feature.id);
              
              return (
                <Card 
                  key={feature.id}
                  className={`p-4 cursor-pointer transition-all ${
                    isEnabled ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleFeature(feature.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-6 h-6 mt-1 ${isEnabled ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${isEnabled ? 'text-blue-900' : 'text-gray-900'}`}>
                          {feature.name}
                        </h3>
                        <Badge variant={isEnabled ? 'default' : 'secondary'} className="text-xs">
                          {feature.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                      {isEnabled && (
                        <div className="flex items-center mt-2">
                          <CheckCircle className="w-4 h-4 text-blue-600 mr-1" />
                          <span className="text-xs text-blue-600 font-medium">Enabled</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-white" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">You're All Set!</h2>
        <p className="text-xl text-gray-600 mb-4">Welcome to your personalized Digame experience</p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-lg font-semibold mb-4">Your Setup Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <h4 className="font-medium text-gray-900">Profile</h4>
              <p className="text-sm text-gray-600">
                {onboardingData.profile.displayName} • {onboardingData.profile.role}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Goals</h4>
              <p className="text-sm text-gray-600">
                {onboardingData.goals.primaryGoals.length} primary goals selected
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Features</h4>
              <p className="text-sm text-gray-600">
                {onboardingData.features.enabledFeatures.length} features enabled
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Notifications</h4>
              <p className="text-sm text-gray-600">
                {onboardingData.preferences.notifications.frequency} frequency
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600">
          Your Digame dashboard is now personalized based on your preferences. 
          You can always update these settings later.
        </p>
        <Button onClick={handleComplete} size="lg" className="px-8">
          Enter Digame Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'welcome': return renderWelcomeStep();
      case 'profile': return renderProfileStep();
      case 'goals': return renderGoalsStep();
      case 'preferences': return renderPreferencesStep();
      case 'features': return renderFeaturesStep();
      case 'complete': return renderCompleteStep();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Digame</span>
          </div>
          <Progress value={progressPercentage} className="w-full max-w-md mx-auto" />
          <p className="text-sm text-gray-500 mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${isActive ? 'bg-blue-600 text-white' : 
                      isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>

          {/* Navigation */}
          <div className="flex justify-between items-center p-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-500">
              {steps[currentStep].description}
            </div>

            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep} className="flex items-center">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="flex items-center">
                Complete Setup
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingWizard;