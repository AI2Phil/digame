const express = require('express');
const router = express.Router();

// Mock data for onboarding
const mockData = {
  // Basic onboarding data
  basicData: {
    steps: [
      {
        id: 1,
        title: 'Welcome & Account Setup',
        description: 'Complete your profile and basic account information',
        status: 'completed',
        progress: 100,
        estimatedTime: '5 minutes',
        completedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        title: 'Platform Tour',
        description: 'Explore key features and navigation',
        status: 'completed',
        progress: 100,
        estimatedTime: '10 minutes',
        completedAt: '2024-01-15T10:45:00Z'
      },
      {
        id: 3,
        title: 'Team Setup',
        description: 'Invite team members and configure collaboration',
        status: 'in_progress',
        progress: 60,
        estimatedTime: '15 minutes',
        completedAt: null
      },
      {
        id: 4,
        title: 'Integration Configuration',
        description: 'Connect your existing tools and services',
        status: 'pending',
        progress: 0,
        estimatedTime: '20 minutes',
        completedAt: null
      },
      {
        id: 5,
        title: 'First Project',
        description: 'Create your first project and workflow',
        status: 'pending',
        progress: 0,
        estimatedTime: '25 minutes',
        completedAt: null
      }
    ],
    overallProgress: 40,
    completedSteps: 2,
    totalSteps: 5,
    estimatedTimeRemaining: '60 minutes'
  },

  // Enhanced onboarding data
  enhancedData: {
    userProfile: {
      completionRate: 85,
      missingFields: ['phone', 'timezone', 'avatar'],
      recommendations: [
        'Add a profile photo to help team members recognize you',
        'Set your timezone for accurate scheduling',
        'Add your phone number for important notifications'
      ]
    },
    teamSetup: {
      invitesSent: 3,
      invitesAccepted: 1,
      pendingInvites: 2,
      suggestedRoles: ['Project Manager', 'Developer', 'Designer'],
      teamTemplates: [
        { name: 'Software Development', members: 5, roles: ['PM', 'Dev', 'QA', 'Designer'] },
        { name: 'Marketing Team', members: 4, roles: ['Manager', 'Content', 'Design', 'Analytics'] },
        { name: 'Consulting Team', members: 6, roles: ['Lead', 'Senior', 'Junior', 'Admin'] }
      ]
    },
    integrations: {
      available: 25,
      connected: 2,
      recommended: [
        { name: 'Slack', category: 'Communication', priority: 'high' },
        { name: 'Google Calendar', category: 'Productivity', priority: 'high' },
        { name: 'Jira', category: 'Development', priority: 'medium' },
        { name: 'GitHub', category: 'Development', priority: 'medium' }
      ],
      popular: [
        { name: 'Slack', usage: '89%', category: 'Communication' },
        { name: 'Google Workspace', usage: '76%', category: 'Productivity' },
        { name: 'Microsoft Teams', usage: '65%', category: 'Communication' },
        { name: 'Jira', usage: '54%', category: 'Development' }
      ]
    },
    projectTemplates: [
      {
        id: 'software-dev',
        name: 'Software Development',
        description: 'Agile development workflow with sprints and releases',
        tasks: 15,
        estimatedSetup: '10 minutes',
        popular: true
      },
      {
        id: 'marketing-campaign',
        name: 'Marketing Campaign',
        description: 'Campaign planning, execution, and analysis',
        tasks: 12,
        estimatedSetup: '8 minutes',
        popular: true
      },
      {
        id: 'product-launch',
        name: 'Product Launch',
        description: 'End-to-end product launch coordination',
        tasks: 20,
        estimatedSetup: '15 minutes',
        popular: false
      }
    ],
    personalizedTips: [
      {
        category: 'productivity',
        tip: 'Use keyboard shortcuts (Ctrl+K) for quick navigation',
        impact: 'Save 2-3 minutes per hour'
      },
      {
        category: 'collaboration',
        tip: 'Set up @mentions in comments for better team communication',
        impact: 'Reduce response time by 40%'
      },
      {
        category: 'automation',
        tip: 'Create task templates for recurring work',
        impact: 'Save 15 minutes per project setup'
      }
    ]
  },

  // Getting started content
  gettingStartedContent: {
    sections: [
      {
        id: 'overview',
        title: 'Platform Overview',
        estimatedTime: '5 min',
        completed: false,
        content: {
          keyFeatures: ['Project Management', 'Team Collaboration', 'Analytics', 'Integrations'],
          benefits: ['Increased productivity', 'Better collaboration', 'Data-driven insights'],
          quickWins: ['Create first project', 'Invite team member', 'Set up integration']
        }
      },
      {
        id: 'navigation',
        title: 'Navigation Guide',
        estimatedTime: '3 min',
        completed: false,
        content: {
          mainSections: ['Dashboard', 'Projects', 'Team', 'Analytics', 'Settings'],
          shortcuts: ['Ctrl+K: Quick search', 'Ctrl+N: New task', 'Ctrl+/: Help'],
          tips: ['Use breadcrumbs for navigation', 'Bookmark frequently used pages']
        }
      },
      {
        id: 'projects',
        title: 'Creating Projects',
        estimatedTime: '7 min',
        completed: false,
        content: {
          steps: ['Choose template', 'Set basic info', 'Configure team', 'Add initial tasks'],
          bestPractices: ['Use descriptive names', 'Set clear objectives', 'Define success metrics'],
          templates: ['Software Development', 'Marketing Campaign', 'Product Launch']
        }
      }
    ],
    overallProgress: 0,
    estimatedTotalTime: '45 minutes'
  }
};

// Basic onboarding data
router.get('/', (req, res) => {
  res.json(mockData.basicData);
});

// Enhanced onboarding data
router.get('/enhanced', (req, res) => {
  const { section } = req.query;
  
  if (section) {
    // Return specific section
    const sectionData = mockData.enhancedData[section];
    if (!sectionData) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(sectionData);
  } else {
    // Return all enhanced data
    res.json(mockData.enhancedData);
  }
});

// Wizard setup endpoint
router.post('/wizard', (req, res) => {
  const {
    firstName,
    lastName,
    jobTitle,
    company,
    industry,
    teamSize,
    primaryGoals,
    useCases,
    currentTools,
    challenges,
    teamMembers,
    workspaceSettings,
    selectedIntegrations,
    customIntegrations,
    preferences
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !company || !industry || !teamSize) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['firstName', 'lastName', 'company', 'industry', 'teamSize']
    });
  }

  if (!primaryGoals || primaryGoals.length === 0) {
    return res.status(400).json({ error: 'At least one primary goal is required' });
  }

  if (!useCases || useCases.length === 0) {
    return res.status(400).json({ error: 'At least one use case is required' });
  }

  if (!workspaceSettings || !workspaceSettings.name) {
    return res.status(400).json({ error: 'Workspace name is required' });
  }

  // Simulate onboarding completion
  const onboardingResult = {
    id: Math.random().toString(36).substring(2, 15),
    userId: Math.random().toString(36).substring(2, 15),
    completedAt: new Date().toISOString(),
    profile: {
      firstName,
      lastName,
      jobTitle,
      company,
      industry,
      teamSize
    },
    goals: {
      primary: primaryGoals,
      useCases,
      challenges: challenges || []
    },
    workspace: {
      id: Math.random().toString(36).substring(2, 15),
      name: workspaceSettings.name,
      description: workspaceSettings.description || '',
      visibility: workspaceSettings.visibility || 'private',
      createdAt: new Date().toISOString()
    },
    team: {
      invitesSent: teamMembers ? teamMembers.length : 0,
      pendingInvites: teamMembers || []
    },
    integrations: {
      selected: selectedIntegrations || [],
      custom: customIntegrations || [],
      setupRequired: (selectedIntegrations || []).length > 0
    },
    preferences: preferences || {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: true
    },
    recommendations: {
      nextSteps: [
        'Create your first project',
        'Set up key integrations',
        'Invite team members',
        'Explore analytics features'
      ],
      suggestedTemplates: [
        'Software Development',
        'Marketing Campaign',
        'Product Launch'
      ].filter(template => {
        // Suggest templates based on industry and use cases
        if (industry === 'Technology' && useCases.includes('Project tracking')) {
          return template === 'Software Development';
        }
        if (industry === 'Marketing' && useCases.includes('Team communication')) {
          return template === 'Marketing Campaign';
        }
        return true;
      }),
      priorityIntegrations: (currentTools || []).filter(tool => 
        ['Slack', 'Google Workspace', 'Microsoft Teams', 'Jira'].includes(tool)
      )
    },
    analytics: {
      setupTime: Math.floor(Math.random() * 300) + 600, // 10-15 minutes
      completionRate: 100,
      skippedSteps: 0,
      userType: teamSize === '1-5' ? 'small_team' : teamSize === '6-10' ? 'medium_team' : 'large_team'
    }
  };

  res.status(201).json({
    message: 'Onboarding completed successfully!',
    onboarding: onboardingResult,
    redirectUrl: '/dashboard?onboarding=completed',
    welcomeMessage: `Welcome to your new workspace, ${firstName}! Your ${workspaceSettings.name} workspace is ready.`
  });
});

// Getting started content
router.get('/getting-started', (req, res) => {
  const { section } = req.query;
  
  if (section) {
    const sectionContent = mockData.gettingStartedContent.sections.find(s => s.id === section);
    if (!sectionContent) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(sectionContent);
  } else {
    res.json(mockData.gettingStartedContent);
  }
});

// Update section completion
router.post('/getting-started/:sectionId/complete', (req, res) => {
  const { sectionId } = req.params;
  const { timeSpent, feedback } = req.body;

  const section = mockData.gettingStartedContent.sections.find(s => s.id === sectionId);
  if (!section) {
    return res.status(404).json({ error: 'Section not found' });
  }

  // Mark section as completed
  section.completed = true;
  
  // Update overall progress
  const completedSections = mockData.gettingStartedContent.sections.filter(s => s.completed).length;
  const totalSections = mockData.gettingStartedContent.sections.length;
  mockData.gettingStartedContent.overallProgress = Math.round((completedSections / totalSections) * 100);

  res.json({
    sectionId,
    completed: true,
    overallProgress: mockData.gettingStartedContent.overallProgress,
    completedSections,
    totalSections,
    timeSpent: timeSpent || null,
    feedback: feedback || null,
    nextSection: completedSections < totalSections ? 
      mockData.gettingStartedContent.sections.find(s => !s.completed)?.id : null,
    congratulations: completedSections === totalSections ? 
      'Congratulations! You\'ve completed the getting started guide.' : null
  });
});

// Onboarding progress tracking
router.get('/progress', (req, res) => {
  const progress = {
    overall: mockData.basicData.overallProgress,
    steps: mockData.basicData.steps.map(step => ({
      id: step.id,
      title: step.title,
      status: step.status,
      progress: step.progress,
      completedAt: step.completedAt
    })),
    gettingStarted: {
      progress: mockData.gettingStartedContent.overallProgress,
      completedSections: mockData.gettingStartedContent.sections.filter(s => s.completed).length,
      totalSections: mockData.gettingStartedContent.sections.length
    },
    recommendations: [
      'Complete your profile setup',
      'Create your first project',
      'Invite team members',
      'Set up key integrations'
    ],
    estimatedTimeRemaining: mockData.basicData.estimatedTimeRemaining
  };

  res.json(progress);
});

// Skip onboarding step
router.post('/steps/:stepId/skip', (req, res) => {
  const { stepId } = req.params;
  const { reason } = req.body;

  const step = mockData.basicData.steps.find(s => s.id === parseInt(stepId));
  if (!step) {
    return res.status(404).json({ error: 'Step not found' });
  }

  // Mark step as skipped
  step.status = 'skipped';
  step.skippedAt = new Date().toISOString();
  step.skipReason = reason || 'User skipped';

  // Update overall progress
  const completedOrSkipped = mockData.basicData.steps.filter(s => 
    s.status === 'completed' || s.status === 'skipped'
  ).length;
  mockData.basicData.overallProgress = Math.round((completedOrSkipped / mockData.basicData.totalSteps) * 100);

  res.json({
    stepId: parseInt(stepId),
    status: 'skipped',
    overallProgress: mockData.basicData.overallProgress,
    message: 'Step skipped successfully. You can return to complete it later.',
    canReturnLater: true
  });
});

// Reset onboarding
router.post('/reset', (req, res) => {
  // Reset all steps to pending
  mockData.basicData.steps.forEach(step => {
    if (step.id > 2) { // Keep first 2 steps completed
      step.status = 'pending';
      step.progress = 0;
      step.completedAt = null;
    }
  });

  // Reset getting started progress
  mockData.gettingStartedContent.sections.forEach(section => {
    section.completed = false;
  });
  mockData.gettingStartedContent.overallProgress = 0;

  // Reset overall progress
  mockData.basicData.overallProgress = 40; // 2 out of 5 steps
  mockData.basicData.completedSteps = 2;

  res.json({
    message: 'Onboarding progress has been reset',
    overallProgress: mockData.basicData.overallProgress,
    resetAt: new Date().toISOString()
  });
});

module.exports = router;