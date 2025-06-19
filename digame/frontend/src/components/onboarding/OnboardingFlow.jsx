import React, { useState } from 'react';
import { Progress } from '../../ui/Progress'; // Path corrected
import Button from '../../ui/Button';       // Path corrected
import { Card } from '../../ui/Card';         // Path corrected
import Input from '../../ui/Input';        // Path corrected
import { Badge } from '../../ui/Badge';       // Path corrected
import { Switch } from '../../ui/Switch';   // Added import
import { Label } from '../../ui/Label';     // Added import

const OnboardingFlow = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    goals: [],
    workStyle: '',
    skillLevel: '',
    focusAreas: [],
    preferences: {
      notifications: true,
      dataCollection: true,
      publicProfile: false
    }
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Digame',
      subtitle: 'Your Digital Professional Twin Platform',
      component: WelcomeStep
    },
    {
      id: 'goals',
      title: 'Set Your Goals',
      subtitle: 'What do you want to achieve?',
      component: GoalsStep
    },
    {
      id: 'workstyle',
      title: 'Work Style Assessment',
      subtitle: 'Help us understand how you work best',
      component: WorkStyleStep
    },
    {
      id: 'skills',
      title: 'Skill Level & Focus Areas',
      subtitle: 'Tell us about your expertise',
      component: SkillsStep
    },
    {
      id: 'preferences',
      title: 'Privacy & Preferences',
      subtitle: 'Customize your experience',
      component: PreferencesStep
    },
    {
      id: 'complete',
      title: 'Setup Complete!',
      subtitle: 'Your digital twin is ready',
      component: CompletionStep
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = (stepData = {}) => {
    setUserData(prev => ({ ...prev, ...stepData }));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(userData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="digame-logo">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Digame Setup</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip Setup
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-600">
              {steps[currentStep].subtitle}
            </p>
          </div>

          <CurrentStepComponent
            data={userData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoBack={currentStep > 0}
            isLastStep={currentStep === steps.length - 1}
          />
        </Card>

        {/* Step Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`w-3 h-3 rounded-full transition-colors ${
                index <= currentStep 
                  ? 'bg-blue-500' 
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Welcome Step Component
const WelcomeStep = ({ onNext }) => {
  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
        <span className="text-4xl text-white">🚀</span>
      </div>
      
      <div className="space-y-4">
        <p className="text-lg text-gray-700">
          Welcome to your Digital Professional Twin! We'll help you set up a personalized experience 
          that adapts to your work style and goals.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-semibold text-gray-900">Smart Analysis</h3>
            <p className="text-sm text-gray-600">AI-powered insights into your work patterns</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-semibold text-gray-900">Growth Tracking</h3>
            <p className="text-sm text-gray-600">Monitor your professional development</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900">Goal Achievement</h3>
            <p className="text-sm text-gray-600">Reach your career objectives faster</p>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Button onClick={() => onNext()} size="lg" className="w-full md:w-auto">
          Let's Get Started
        </Button>
      </div>
    </div>
  );
};

// Goals Step Component
const GoalsStep = ({ data, onNext, onPrevious, canGoBack }) => {
  const [selectedGoals, setSelectedGoals] = useState(data.goals || []);

  const goalOptions = [
    { id: 'productivity', label: 'Increase Productivity', icon: '⚡', color: 'blue' },
    { id: 'skills', label: 'Develop New Skills', icon: '🎓', color: 'green' },
    { id: 'leadership', label: 'Build Leadership Skills', icon: '👑', color: 'purple' },
    { id: 'collaboration', label: 'Improve Team Collaboration', icon: '🤝', color: 'orange' },
    { id: 'work-life', label: 'Better Work-Life Balance', icon: '⚖️', color: 'pink' },
    { id: 'career', label: 'Advance My Career', icon: '🚀', color: 'indigo' },
    { id: 'efficiency', label: 'Optimize Workflows', icon: '⚙️', color: 'gray' },
    { id: 'networking', label: 'Expand Professional Network', icon: '🌐', color: 'teal' }
  ];

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleNext = () => {
    onNext({ goals: selectedGoals });
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-center">
        Select the goals that matter most to you. We'll personalize your experience based on these priorities.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {goalOptions.map((goal) => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedGoals.includes(goal.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{goal.icon}</span>
              <div>
                <h3 className="font-medium text-gray-900">{goal.label}</h3>
              </div>
              {selectedGoals.includes(goal.id) && (
                <div className="ml-auto">
                  <Badge variant="default" className="bg-blue-500">Selected</Badge>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        {canGoBack && (
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
        )}
        <Button 
          onClick={handleNext} 
          disabled={selectedGoals.length === 0}
          className={!canGoBack ? 'ml-auto' : ''}
        >
          Continue ({selectedGoals.length} selected)
        </Button>
      </div>
    </div>
  );
};

// Work Style Step Component
const WorkStyleStep = ({ data, onNext, onPrevious, canGoBack }) => {
  const [workStyle, setWorkStyle] = useState(data.workStyle || '');

  const workStyles = [
    {
      id: 'focused',
      title: 'Deep Focus Worker',
      description: 'I prefer long, uninterrupted work sessions',
      icon: '🎯',
      traits: ['Long focus sessions', 'Minimal interruptions', 'Detailed planning']
    },
    {
      id: 'collaborative',
      title: 'Collaborative Team Player',
      description: 'I thrive in team environments and frequent interactions',
      icon: '🤝',
      traits: ['Team meetings', 'Brainstorming', 'Social interaction']
    },
    {
      id: 'flexible',
      title: 'Flexible Multitasker',
      description: 'I adapt quickly and handle multiple tasks efficiently',
      icon: '🔄',
      traits: ['Task switching', 'Adaptability', 'Quick decisions']
    },
    {
      id: 'structured',
      title: 'Structured Planner',
      description: 'I work best with clear schedules and organized processes',
      icon: '📋',
      traits: ['Detailed schedules', 'Process-oriented', 'Systematic approach']
    }
  ];

  const handleNext = () => {
    onNext({ workStyle });
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-center">
        Understanding your work style helps us provide better insights and recommendations.
      </p>

      <div className="space-y-4">
        {workStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => setWorkStyle(style.id)}
            className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
              workStyle === style.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start space-x-4">
              <span className="text-3xl">{style.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{style.title}</h3>
                <p className="text-gray-600 mb-3">{style.description}</p>
                <div className="flex flex-wrap gap-2">
                  {style.traits.map((trait, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
              {workStyle === style.id && (
                <div className="text-blue-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!workStyle}>
          Continue
        </Button>
      </div>
    </div>
  );
};

// Skills Step Component
const SkillsStep = ({ data, onNext, onPrevious, canGoBack }) => {
  const [skillLevel, setSkillLevel] = useState(data.skillLevel || '');
  const [focusAreas, setFocusAreas] = useState(data.focusAreas || []);

  const skillLevels = [
    { id: 'beginner', label: 'Beginner', description: '0-2 years experience' },
    { id: 'intermediate', label: 'Intermediate', description: '2-5 years experience' },
    { id: 'advanced', label: 'Advanced', description: '5-10 years experience' },
    { id: 'expert', label: 'Expert', description: '10+ years experience' }
  ];

  const focusAreaOptions = [
    'Software Development', 'Data Science', 'Project Management', 'Design',
    'Marketing', 'Sales', 'Operations', 'Finance', 'HR', 'Leadership',
    'Communication', 'Analytics', 'Strategy', 'Innovation'
  ];

  const toggleFocusArea = (area) => {
    setFocusAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleNext = () => {
    onNext({ skillLevel, focusAreas });
  };

  return (
    <div className="space-y-8">
      {/* Skill Level */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What's your overall professional experience level?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skillLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setSkillLevel(level.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                skillLevel === level.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <h4 className="font-medium text-gray-900">{level.label}</h4>
              <p className="text-sm text-gray-600">{level.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Focus Areas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Which areas do you want to focus on? (Select up to 5)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {focusAreaOptions.map((area) => (
            <button
              key={area}
              onClick={() => toggleFocusArea(area)}
              disabled={!focusAreas.includes(area) && focusAreas.length >= 5}
              className={`p-3 rounded-lg border transition-all text-sm ${
                focusAreas.includes(area)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
              } ${
                !focusAreas.includes(area) && focusAreas.length >= 5
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {area}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {focusAreas.length}/5 areas selected
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!skillLevel || focusAreas.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

// Preferences Step Component
const PreferencesStep = ({ data, onNext, onPrevious, canGoBack }) => {
  const [preferences, setPreferences] = useState(data.preferences || {
    notifications: true,
    dataCollection: true,
    publicProfile: false
  });

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    onNext({ preferences });
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-center">
        Customize your privacy settings and preferences. You can change these anytime in your settings.
      </p>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <Label className="font-medium text-gray-900">Smart Notifications</Label>
            <p className="text-sm text-gray-600 mt-1">
              Receive insights, reminders, and achievement notifications
            </p>
          </div>
          <Switch
            checked={preferences.notifications}
            onCheckedChange={(isChecked) => updatePreference('notifications', isChecked)}
            aria-label="Smart Notifications toggle"
          />
        </div>

        {/* Data Collection */}
        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <Label className="font-medium text-gray-900">Enhanced Analytics</Label>
            <p className="text-sm text-gray-600 mt-1">
              Allow detailed activity tracking for better insights and recommendations
            </p>
          </div>
          <Switch
            checked={preferences.dataCollection}
            onCheckedChange={(isChecked) => updatePreference('dataCollection', isChecked)}
            aria-label="Enhanced Analytics toggle"
          />
        </div>

        {/* Public Profile */}
        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <Label className="font-medium text-gray-900">Public Profile</Label>
            <p className="text-sm text-gray-600 mt-1">
              Make your achievements and progress visible to other users for networking
            </p>
          </div>
          <Switch
            checked={preferences.publicProfile}
            onCheckedChange={(isChecked) => updatePreference('publicProfile', isChecked)}
            aria-label="Public Profile toggle"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-blue-500 text-lg">🔒</span>
          <div>
            <h4 className="font-medium text-blue-900">Privacy First</h4>
            <p className="text-sm text-blue-700">
              Your data is always encrypted and secure. You have full control over what's collected and shared.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};

// Completion Step Component
const CompletionStep = ({ data, onNext }) => {
  const getGoalLabels = () => {
    const goalMap = {
      'productivity': 'Increase Productivity',
      'skills': 'Develop New Skills',
      'leadership': 'Build Leadership Skills',
      'collaboration': 'Improve Team Collaboration',
      'work-life': 'Better Work-Life Balance',
      'career': 'Advance My Career',
      'efficiency': 'Optimize Workflows',
      'networking': 'Expand Professional Network'
    };
    return data.goals?.map(id => goalMap[id]) || [];
  };

  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
        <span className="text-4xl text-white">🎉</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Digital Twin is Ready!
        </h2>
        <p className="text-gray-600">
          We've personalized your experience based on your preferences. Here's what we've set up:
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-left space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Your Goals</h3>
          <div className="flex flex-wrap gap-2">
            {getGoalLabels().map((goal, index) => (
              <Badge key={index} variant="secondary">{goal}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Work Style</h3>
          <Badge variant="default" className="capitalize">
            {data.workStyle?.replace('-', ' ')} Worker
          </Badge>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Focus Areas</h3>
          <div className="flex flex-wrap gap-2">
            {data.focusAreas?.map((area, index) => (
              <Badge key={index} variant="outline">{area}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
        <ul className="text-sm text-blue-700 space-y-1 text-left">
          <li>• Start tracking your daily activities</li>
          <li>• Explore your personalized dashboard</li>
          <li>• Set up your first learning goals</li>
          <li>• Connect with team members</li>
        </ul>
      </div>

      <Button onClick={() => onNext()} size="lg" className="w-full md:w-auto">
        Enter Your Dashboard
      </Button>
    </div>
  );
};

export default OnboardingFlow;