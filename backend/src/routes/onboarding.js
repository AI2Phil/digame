const express = require('express');
const router = express.Router();

// Mock data for onboarding
const mockData = {
  // Onboarding steps configuration
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Digame',
      subtitle: 'Let\'s personalize your experience',
      required: false,
      estimatedTime: '1 minute'
    },
    {
      id: 'role',
      title: 'Tell us about yourself',
      subtitle: 'Help us understand your role and responsibilities',
      required: true,
      estimatedTime: '2 minutes'
    },
    {
      id: 'goals',
      title: 'What are your goals?',
      subtitle: 'Select your primary objectives with Digame',
      required: true,
      estimatedTime: '2 minutes'
    },
    {
      id: 'features',
      title: 'Choose your features',
      subtitle: 'Select the features you\'re most interested in',
      required: false,
      estimatedTime: '3 minutes'
    },
    {
      id: 'workflow',
      title: 'Workflow preferences',
      subtitle: 'Tell us about your work style and data needs',
      required: false,
      estimatedTime: '2 minutes'
    },
    {
      id: 'preferences',
      title: 'Customize your experience',
      subtitle: 'Set your notification and display preferences',
      required: false,
      estimatedTime: '2 minutes'
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      subtitle: 'Your personalized Digame experience is ready',
      required: false,
      estimatedTime: '1 minute'
    }
  ],

  // Role options
  roles: [
    {
      id: 'executive',
      label: 'Executive/Manager',
      description: 'Leading teams and making strategic decisions',
      recommendedFeatures: ['analytics', 'reporting', 'team-collaboration'],
      defaultDashboard: 'executive'
    },
    {
      id: 'analyst',
      label: 'Data Analyst',
      description: 'Working with data and creating insights',
      recommendedFeatures: ['analytics', 'digital-twin', 'reporting'],
      defaultDashboard: 'analytics'
    },
    {
      id: 'developer',
      label: 'Developer/Engineer',
      description: 'Building and maintaining technical solutions',
      recommendedFeatures: ['automation', 'integrations', 'ai-tools'],
      defaultDashboard: 'technical'
    },
    {
      id: 'marketer',
      label: 'Marketing Professional',
      description: 'Driving growth and customer engagement',
      recommendedFeatures: ['analytics', 'automation', 'reporting'],
      defaultDashboard: 'marketing'
    },
    {
      id: 'consultant',
      label: 'Consultant',
      description: 'Providing expertise to clients and organizations',
      recommendedFeatures: ['reporting', 'analytics', 'collaboration'],
      defaultDashboard: 'consultant'
    },
    {
      id: 'entrepreneur',
      label: 'Entrepreneur',
      description: 'Building and growing your own business',
      recommendedFeatures: ['analytics', 'automation', 'team-collaboration'],
      defaultDashboard: 'business'
    },
    {
      id: 'student',
      label: 'Student/Researcher',
      description: 'Learning and conducting research',
      recommendedFeatures: ['analytics', 'digital-twin', 'ai-tools'],
      defaultDashboard: 'research'
    },
    {
      id: 'other',
      label: 'Other',
      description: 'Something else entirely',
      recommendedFeatures: ['analytics', 'ai-tools'],
      defaultDashboard: 'general'
    }
  ],

  // Goal options
  goals: [
    {
      id: 'productivity',
      label: 'Increase Productivity',
      description: 'Streamline workflows and save time',
      recommendedFeatures: ['automation', 'ai-tools', 'workflow'],
      weight: 1.0
    },
    {
      id: 'insights',
      label: 'Gain Data Insights',
      description: 'Better understand your data and metrics',
      recommendedFeatures: ['analytics', 'reporting', 'digital-twin'],
      weight: 1.0
    },
    {
      id: 'automation',
      label: 'Automate Workflows',
      description: 'Reduce manual work and repetitive tasks',
      recommendedFeatures: ['automation', 'workflow', 'ai-tools'],
      weight: 0.9
    },
    {
      id: 'collaboration',
      label: 'Improve Team Collaboration',
      description: 'Enhance team communication and coordination',
      recommendedFeatures: ['team-collaboration', 'workflow', 'reporting'],
      weight: 0.8
    },
    {
      id: 'decision-making',
      label: 'Better Decision Making',
      description: 'Make informed decisions with better data',
      recommendedFeatures: ['analytics', 'digital-twin', 'reporting'],
      weight: 0.9
    },
    {
      id: 'efficiency',
      label: 'Streamline Operations',
      description: 'Optimize processes and reduce waste',
      recommendedFeatures: ['automation', 'analytics', 'workflow'],
      weight: 0.8
    }
  ],

  // Feature options
  features: [
    {
      id: 'analytics',
      label: 'Advanced Analytics',
      description: 'Deep insights and data visualization',
      tier: 'Individual Pro',
      category: 'Analytics',
      setupTime: '5 minutes'
    },
    {
      id: 'digital-twin',
      label: 'Digital Twin AI',
      description: 'Personal AI assistant and behavior modeling',
      tier: 'Individual Pro',
      category: 'AI',
      setupTime: '10 minutes'
    },
    {
      id: 'automation',
      label: 'Workflow Automation',
      description: 'Automate repetitive tasks and processes',
      tier: 'Team',
      category: 'Productivity',
      setupTime: '15 minutes'
    },
    {
      id: 'collaboration',
      label: 'Team Collaboration',
      description: 'Enhanced team communication and project management',
      tier: 'Team',
      category: 'Collaboration',
      setupTime: '8 minutes'
    },
    {
      id: 'reporting',
      label: 'Custom Reporting',
      description: 'Create and share custom reports and dashboards',
      tier: 'Individual Pro',
      category: 'Analytics',
      setupTime: '12 minutes'
    },
    {
      id: 'integrations',
      label: 'Third-party Integrations',
      description: 'Connect with your existing tools and services',
      tier: 'Individual Pro',
      category: 'Integration',
      setupTime: '20 minutes'
    }
  ],

  // Workflow types
  workflowTypes: [
    {
      id: 'structured',
      label: 'Structured & Planned',
      description: 'I prefer organized, step-by-step processes',
      dashboardLayout: 'structured',
      defaultWidgets: ['calendar', 'tasks', 'progress', 'analytics']
    },
    {
      id: 'flexible',
      label: 'Flexible & Adaptive',
      description: 'I like to adapt and change direction as needed',
      dashboardLayout: 'flexible',
      defaultWidgets: ['quick-actions', 'insights', 'recent-activity', 'suggestions']
    },
    {
      id: 'collaborative',
      label: 'Collaborative & Social',
      description: 'I work best with team input and feedback',
      dashboardLayout: 'collaborative',
      defaultWidgets: ['team-activity', 'shared-projects', 'messages', 'collaboration']
    },
    {
      id: 'independent',
      label: 'Independent & Focused',
      description: 'I prefer to work autonomously with minimal interruptions',
      dashboardLayout: 'focused',
      defaultWidgets: ['focus-mode', 'personal-analytics', 'goals', 'achievements']
    }
  ],

  // Onboarding sessions (mock user data)
  sessions: [
    {
      id: 'session_123',
      userId: 'user_456',
      startedAt: '2024-01-30T10:00:00Z',
      completedAt: null,
      currentStep: 'goals',
      progress: 42,
      data: {
        role: 'analyst',
        primaryGoals: ['insights', 'productivity'],
        interestedFeatures: ['analytics', 'digital-twin'],
        workflowType: 'structured'
      }
    }
  ]
};

// Get onboarding configuration
router.get('/config', (req, res) => {
  res.json({
    steps: mockData.steps,
    totalSteps: mockData.steps.length,
    estimatedTotalTime: '13 minutes'
  });
});

// Get step configuration
router.get('/steps/:stepId', (req, res) => {
  const step = mockData.steps.find(s => s.id === req.params.stepId);
  if (!step) {
    return res.status(404).json({ error: 'Step not found' });
  }

  let stepData = { ...step };

  // Add step-specific data
  switch (req.params.stepId) {
    case 'role':
      stepData.options = mockData.roles;
      break;
    case 'goals':
      stepData.options = mockData.goals;
      break;
    case 'features':
      stepData.options = mockData.features;
      break;
    case 'workflow':
      stepData.options = mockData.workflowTypes;
      break;
  }

  res.json(stepData);
});

// Start onboarding session
router.post('/start', (req, res) => {
  const { userId, tier } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const sessionId = `session_${Math.random().toString(36).substring(2, 15)}`;
  const session = {
    id: sessionId,
    userId,
    tier: tier || 'Individual Pro',
    startedAt: new Date().toISOString(),
    completedAt: null,
    currentStep: 'welcome',
    progress: 0,
    data: {},
    recommendations: []
  };

  mockData.sessions.push(session);

  res.status(201).json({
    sessionId,
    currentStep: 'welcome',
    progress: 0,
    nextStepUrl: '/onboarding/steps/welcome'
  });
});

// Get onboarding session
router.get('/sessions/:sessionId', (req, res) => {
  const session = mockData.sessions.find(s => s.id === req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json(session);
});

// Update onboarding session
router.put('/sessions/:sessionId', (req, res) => {
  const sessionIndex = mockData.sessions.findIndex(s => s.id === req.params.sessionId);
  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { currentStep, data, progress } = req.body;
  
  mockData.sessions[sessionIndex] = {
    ...mockData.sessions[sessionIndex],
    currentStep: currentStep || mockData.sessions[sessionIndex].currentStep,
    data: { ...mockData.sessions[sessionIndex].data, ...data },
    progress: progress !== undefined ? progress : mockData.sessions[sessionIndex].progress,
    updatedAt: new Date().toISOString()
  };

  res.json(mockData.sessions[sessionIndex]);
});

// Complete onboarding session
router.post('/sessions/:sessionId/complete', (req, res) => {
  const sessionIndex = mockData.sessions.findIndex(s => s.id === req.params.sessionId);
  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = mockData.sessions[sessionIndex];
  
  // Generate recommendations based on onboarding data
  const recommendations = generateRecommendations(session.data);
  
  // Generate personalized dashboard configuration
  const dashboardConfig = generateDashboardConfig(session.data);

  mockData.sessions[sessionIndex] = {
    ...session,
    completedAt: new Date().toISOString(),
    currentStep: 'complete',
    progress: 100,
    recommendations,
    dashboardConfig
  };

  res.json({
    sessionId: req.params.sessionId,
    completedAt: mockData.sessions[sessionIndex].completedAt,
    recommendations,
    dashboardConfig,
    nextSteps: [
      { action: 'dashboard', label: 'Go to Dashboard', url: '/dashboard' },
      { action: 'setup', label: 'Set Up Features', url: '/setup' },
      { action: 'tour', label: 'Take a Tour', url: '/tour' }
    ]
  });
});

// Get recommendations based on onboarding data
router.post('/recommendations', (req, res) => {
  const { role, goals, features, workflowType } = req.body;
  
  const recommendations = generateRecommendations({
    role,
    primaryGoals: goals,
    interestedFeatures: features,
    workflowType
  });

  res.json(recommendations);
});

// Get personalized setup checklist
router.post('/checklist', (req, res) => {
  const { role, goals, features } = req.body;
  
  const checklist = generateSetupChecklist({
    role,
    primaryGoals: goals,
    interestedFeatures: features
  });

  res.json(checklist);
});

// Helper function to generate recommendations
function generateRecommendations(onboardingData) {
  const recommendations = [];
  
  // Role-based recommendations
  if (onboardingData.role) {
    const role = mockData.roles.find(r => r.id === onboardingData.role);
    if (role) {
      recommendations.push({
        type: 'features',
        title: 'Recommended Features for Your Role',
        description: `Based on your role as ${role.label}, we recommend these features`,
        items: role.recommendedFeatures,
        priority: 'high'
      });
    }
  }

  // Goal-based recommendations
  if (onboardingData.primaryGoals && onboardingData.primaryGoals.length > 0) {
    const goalFeatures = new Set();
    onboardingData.primaryGoals.forEach(goalId => {
      const goal = mockData.goals.find(g => g.id === goalId);
      if (goal) {
        goal.recommendedFeatures.forEach(feature => goalFeatures.add(feature));
      }
    });

    recommendations.push({
      type: 'setup',
      title: 'Quick Setup for Your Goals',
      description: 'Get started quickly with these recommended configurations',
      items: Array.from(goalFeatures),
      priority: 'medium'
    });
  }

  // Workflow-based recommendations
  if (onboardingData.workflowType) {
    const workflow = mockData.workflowTypes.find(w => w.id === onboardingData.workflowType);
    if (workflow) {
      recommendations.push({
        type: 'dashboard',
        title: 'Personalized Dashboard Layout',
        description: `We've configured your dashboard for ${workflow.label.toLowerCase()} work style`,
        items: workflow.defaultWidgets,
        priority: 'low'
      });
    }
  }

  return recommendations;
}

// Helper function to generate dashboard configuration
function generateDashboardConfig(onboardingData) {
  const config = {
    layout: 'default',
    widgets: [],
    theme: 'light',
    notifications: true
  };

  // Set layout based on workflow type
  if (onboardingData.workflowType) {
    const workflow = mockData.workflowTypes.find(w => w.id === onboardingData.workflowType);
    if (workflow) {
      config.layout = workflow.dashboardLayout;
      config.widgets = workflow.defaultWidgets;
    }
  }

  // Add role-specific widgets
  if (onboardingData.role) {
    const role = mockData.roles.find(r => r.id === onboardingData.role);
    if (role) {
      config.defaultDashboard = role.defaultDashboard;
    }
  }

  // Set preferences
  if (onboardingData.preferences) {
    config.theme = onboardingData.preferences.theme || 'light';
    config.notifications = onboardingData.preferences.notifications !== false;
  }

  return config;
}

// Helper function to generate setup checklist
function generateSetupChecklist(onboardingData) {
  const checklist = [];

  // Basic setup items
  checklist.push({
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your photo and contact information',
    completed: false,
    estimatedTime: '2 minutes',
    priority: 'high'
  });

  // Feature-specific setup
  if (onboardingData.interestedFeatures) {
    onboardingData.interestedFeatures.forEach(featureId => {
      const feature = mockData.features.find(f => f.id === featureId);
      if (feature) {
        checklist.push({
          id: `setup-${featureId}`,
          title: `Set Up ${feature.label}`,
          description: feature.description,
          completed: false,
          estimatedTime: feature.setupTime,
          priority: 'medium'
        });
      }
    });
  }

  // Goal-specific setup
  if (onboardingData.primaryGoals && onboardingData.primaryGoals.includes('collaboration')) {
    checklist.push({
      id: 'invite-team',
      title: 'Invite Team Members',
      description: 'Add your team to start collaborating',
      completed: false,
      estimatedTime: '5 minutes',
      priority: 'medium'
    });
  }

  return checklist;
}

module.exports = router;