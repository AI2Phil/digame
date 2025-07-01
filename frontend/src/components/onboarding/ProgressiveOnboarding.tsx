import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  requiredFor: string[];
  unlocks: string[];
}

interface ProgressiveOnboardingProps {
  onComplete: () => void;
}

const ProgressiveOnboarding: React.FC<ProgressiveOnboardingProps> = ({ onComplete }) => {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>([]);
  const [onboardingData, setOnboardingData] = useState({
    interests: [],
    goals: [],
    experienceLevel: '',
    workStyle: '',
    teamSize: '',
    industry: '',
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    features: {
      analytics: false,
      aiTools: false,
      teamCollaboration: false,
      socialNetworking: false
    }
  });

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Digame!',
      description: 'Let\'s personalize your experience',
      component: WelcomeStep,
      requiredFor: [],
      unlocks: ['basic_analytics']
    },
    {
      id: 'interests',
      title: 'What interests you?',
      description: 'Help us customize your dashboard',
      component: InterestsStep,
      requiredFor: ['basic_analytics'],
      unlocks: ['advanced_analytics', 'ai_recommendations']
    },
    {
      id: 'goals',
      title: 'What are your goals?',
      description: 'We\'ll suggest relevant features',
      component: GoalsStep,
      requiredFor: ['advanced_analytics'],
      unlocks: ['goal_tracking', 'progress_insights']
    },
    {
      id: 'experience',
      title: 'Your experience level',
      description: 'Customize the interface complexity',
      component: ExperienceStep,
      requiredFor: ['ai_recommendations'],
      unlocks: ['ai_coaching', 'advanced_features']
    },
    {
      id: 'team_setup',
      title: 'Team collaboration',
      description: 'Set up your team workspace',
      component: TeamSetupStep,
      requiredFor: ['goal_tracking'],
      unlocks: ['team_creation', 'collaboration_tools']
    },
    {
      id: 'feature_discovery',
      title: 'Discover features',
      description: 'Explore what you\'ve unlocked',
      component: FeatureDiscoveryStep,
      requiredFor: ['team_creation'],
      unlocks: ['full_platform_access']
    }
  ];

  useEffect(() => {
    // Check which features should be unlocked based on completed steps
    const newUnlockedFeatures = [];
    completedSteps.forEach(stepId => {
      const step = onboardingSteps.find(s => s.id === stepId);
      if (step) {
        newUnlockedFeatures.push(...step.unlocks);
      }
    });
    setUnlockedFeatures(newUnlockedFeatures);
  }, [completedSteps]);

  const completeStep = (stepId: string, data: any) => {
    setCompletedSteps(prev => [...prev, stepId]);
    setOnboardingData(prev => ({ ...prev, ...data }));
    
    // Move to next step
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < onboardingSteps.length) {
      setCurrentStep(nextStepIndex);
    } else {
      handleOnboardingComplete();
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      // Save onboarding data to user profile
      await updateProfile({
        onboardingCompleted: true,
        onboardingData,
        unlockedFeatures,
        preferences: {
          ...user?.preferences,
          ...onboardingData.notifications
        }
      });

      onComplete();
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      onComplete(); // Continue anyway
    }
  };

  const currentStepData = onboardingSteps[currentStep];
  const CurrentStepComponent = currentStepData?.component;

  const progressPercentage = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Progress Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome, {user?.firstName}!
                </h1>
                <p className="text-sm text-gray-600">
                  Step {currentStep + 1} of {onboardingSteps.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700 mb-1">
                {Math.round(progressPercentage)}% Complete
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Unlocked Features Indicator */}
          {unlockedFeatures.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="text-green-600 mr-2">🎉</div>
                <div className="text-sm">
                  <span className="font-medium text-green-800">
                    New features unlocked: 
                  </span>
                  <span className="text-green-700 ml-1">
                    {unlockedFeatures.slice(-2).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {CurrentStepComponent && (
          <CurrentStepComponent
            data={onboardingData}
            onComplete={(data: any) => completeStep(currentStepData.id, data)}
            onSkip={() => completeStep(currentStepData.id, {})}
            unlockedFeatures={unlockedFeatures}
            user={user}
          />
        )}
      </div>
    </div>
  );
};

// Individual Step Components
const WelcomeStep: React.FC<any> = ({ onComplete, user }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="mb-6">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Your Digital Professional Twin!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Hi {user?.firstName}! We're excited to help you unlock your professional potential. 
          Let's set up your personalized experience in just a few steps.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-900">Analytics</h3>
          <p className="text-sm text-gray-600">Track your progress and insights</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-semibold text-gray-900">AI Tools</h3>
          <p className="text-sm text-gray-600">AI-powered recommendations</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-semibold text-gray-900">Collaboration</h3>
          <p className="text-sm text-gray-600">Connect with your team</p>
        </div>
      </div>

      <button
        onClick={() => onComplete({})}
        className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
      >
        Let's Get Started!
      </button>
    </div>
  );
};

const InterestsStep: React.FC<any> = ({ data, onComplete }) => {
  const [selectedInterests, setSelectedInterests] = useState(data.interests || []);

  const interests = [
    { id: 'analytics', label: 'Data Analytics', icon: '📊', unlocks: 'Advanced Analytics' },
    { id: 'ai', label: 'Artificial Intelligence', icon: '🤖', unlocks: 'AI Coaching' },
    { id: 'team', label: 'Team Management', icon: '👥', unlocks: 'Team Tools' },
    { id: 'productivity', label: 'Productivity', icon: '⚡', unlocks: 'Automation' },
    { id: 'networking', label: 'Professional Networking', icon: '🌐', unlocks: 'Social Features' },
    { id: 'learning', label: 'Continuous Learning', icon: '📚', unlocks: 'Learning Paths' }
  ];

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          What interests you most?
        </h2>
        <p className="text-gray-600">
          Select your areas of interest to unlock relevant features and personalized recommendations.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {interests.map((interest) => (
          <button
            key={interest.id}
            onClick={() => toggleInterest(interest.id)}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              selectedInterests.includes(interest.id)
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{interest.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{interest.label}</h3>
                  <p className="text-sm text-gray-600">Unlocks: {interest.unlocks}</p>
                </div>
              </div>
              {selectedInterests.includes(interest.id) && (
                <div className="text-indigo-600">✓</div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => onComplete({ interests: [] })}
          className="text-gray-500 hover:text-gray-700"
        >
          Skip for now
        </button>
        <button
          onClick={() => onComplete({ interests: selectedInterests })}
          disabled={selectedInterests.length === 0}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue ({selectedInterests.length} selected)
        </button>
      </div>
    </div>
  );
};

const GoalsStep: React.FC<any> = ({ data, onComplete }) => {
  const [selectedGoals, setSelectedGoals] = useState(data.goals || []);

  const goals = [
    { id: 'productivity', label: 'Increase Productivity', description: 'Optimize workflows and time management' },
    { id: 'team_performance', label: 'Improve Team Performance', description: 'Enhance collaboration and results' },
    { id: 'skill_development', label: 'Develop New Skills', description: 'Learn and grow professionally' },
    { id: 'data_insights', label: 'Gain Data Insights', description: 'Make data-driven decisions' },
    { id: 'network_building', label: 'Build Professional Network', description: 'Connect with industry peers' },
    { id: 'career_advancement', label: 'Advance Career', description: 'Achieve professional milestones' }
  ];

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          What are your main goals?
        </h2>
        <p className="text-gray-600">
          Tell us what you want to achieve so we can recommend the best features and tools.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedGoals.includes(goal.id)
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{goal.label}</h3>
                <p className="text-sm text-gray-600">{goal.description}</p>
              </div>
              {selectedGoals.includes(goal.id) && (
                <div className="text-indigo-600 text-xl">✓</div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => onComplete({ goals: [] })}
          className="text-gray-500 hover:text-gray-700"
        >
          Skip for now
        </button>
        <button
          onClick={() => onComplete({ goals: selectedGoals })}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const ExperienceStep: React.FC<any> = ({ data, onComplete }) => {
  const [experienceLevel, setExperienceLevel] = useState(data.experienceLevel || '');

  const levels = [
    {
      id: 'beginner',
      label: 'Beginner',
      description: 'New to digital tools and analytics',
      features: 'Guided tutorials, simplified interface'
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      description: 'Some experience with professional tools',
      features: 'Balanced interface, helpful tips'
    },
    {
      id: 'advanced',
      label: 'Advanced',
      description: 'Experienced with analytics and tools',
      features: 'Advanced features, minimal guidance'
    },
    {
      id: 'expert',
      label: 'Expert',
      description: 'Professional with extensive experience',
      features: 'Full feature access, expert mode'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          What's your experience level?
        </h2>
        <p className="text-gray-600">
          This helps us customize the interface and provide the right level of guidance.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setExperienceLevel(level.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              experienceLevel === level.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{level.label}</h3>
                <p className="text-sm text-gray-600 mb-1">{level.description}</p>
                <p className="text-xs text-indigo-600">{level.features}</p>
              </div>
              {experienceLevel === level.id && (
                <div className="text-indigo-600 text-xl">●</div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => onComplete({ experienceLevel: 'intermediate' })}
          className="text-gray-500 hover:text-gray-700"
        >
          Skip for now
        </button>
        <button
          onClick={() => onComplete({ experienceLevel })}
          disabled={!experienceLevel}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const TeamSetupStep: React.FC<any> = ({ data, onComplete, user }) => {
  const [teamChoice, setTeamChoice] = useState('');
  const [teamName, setTeamName] = useState('');

  const teamOptions = [
    {
      id: 'create',
      label: 'Create a new team',
      description: 'Start fresh with your own team workspace',
      icon: '🚀'
    },
    {
      id: 'join',
      label: 'Join an existing team',
      description: 'Connect with a team using an invitation',
      icon: '🤝'
    },
    {
      id: 'individual',
      label: 'Work individually for now',
      description: 'Focus on personal productivity first',
      icon: '👤'
    }
  ];

  const handleContinue = () => {
    const teamData = {
      teamChoice,
      teamName: teamChoice === 'create' ? teamName : '',
      teamSetupCompleted: true
    };
    onComplete(teamData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Team Collaboration Setup
        </h2>
        <p className="text-gray-600">
          Digame works great for both individual users and teams. How would you like to get started?
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {teamOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setTeamChoice(option.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              teamChoice === option.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-4">{option.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{option.label}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              {teamChoice === option.id && (
                <div className="ml-auto text-indigo-600 text-xl">●</div>
              )}
            </div>
          </button>
        ))}
      </div>

      {teamChoice === 'create' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter your team name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can always change this later and invite team members.
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => onComplete({ teamChoice: 'individual' })}
          className="text-gray-500 hover:text-gray-700"
        >
          Skip team setup
        </button>
        <button
          onClick={handleContinue}
          disabled={!teamChoice || (teamChoice === 'create' && !teamName.trim())}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const FeatureDiscoveryStep: React.FC<any> = ({ data, onComplete, unlockedFeatures }) => {
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const availableFeatures = [
    { id: 'analytics', label: 'Analytics Dashboard', description: 'Track your progress and insights', unlocked: true },
    { id: 'ai_tools', label: 'AI Tools', description: 'AI-powered recommendations and automation', unlocked: unlockedFeatures.includes('ai_coaching') },
    { id: 'team_tools', label: 'Team Collaboration', description: 'Work together with your team', unlocked: unlockedFeatures.includes('team_creation') },
    { id: 'social', label: 'Professional Networking', description: 'Connect with peers and mentors', unlocked: data.interests?.includes('networking') },
    { id: 'automation', label: 'Workflow Automation', description: 'Automate repetitive tasks', unlocked: data.interests?.includes('productivity') }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🎉 Discover Your Unlocked Features!
        </h2>
        <p className="text-gray-600">
          Based on your choices, you've unlocked these powerful features. Let's explore what's available!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {availableFeatures.map((feature) => (
          <div
            key={feature.id}
            className={`p-4 rounded-lg border-2 ${
              feature.unlocked
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{feature.label}</h3>
              {feature.unlocked ? (
                <span className="text-green-600 text-sm font-medium">✓ Unlocked</span>
              ) : (
                <span className="text-gray-400 text-sm">🔒 Locked</span>
              )}
            </div>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-indigo-900 mb-2">
          🚀 Ready to explore your Digital Professional Twin!
        </h3>
        <p className="text-indigo-800 text-sm">
          You've unlocked {availableFeatures.filter(f => f.unlocked).length} out of {availableFeatures.length} features. 
          Complete more activities and upgrade your subscription to unlock additional capabilities.
        </p>
      </div>

      <div className="text-center">
        <button
          onClick={() => onComplete({ featuresExplored: true })}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700"
        >
          Enter Your Dashboard
        </button>
      </div>
    </div>
  );
};

export default ProgressiveOnboarding;