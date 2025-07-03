const express = require('express');
const router = express.Router();

// Mock data for guest features
const mockData = {
  // Guest analytics and stats
  stats: {
    totalVisitors: 15847,
    conversionRate: 12.4,
    averageSessionTime: '4:32',
    topFeatures: ['Analytics', 'AI Tools', 'Digital Twin'],
    signupsToday: 23,
    activeTrials: 156,
    bounceRate: 23.5,
    pageViews: 45623,
    uniqueVisitors: 12847
  },

  // Featured capabilities for guests
  capabilities: [
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Get deep insights into your data with AI-powered analytics and visualization tools',
      benefits: ['Real-time dashboards', 'Predictive insights', 'Custom reports'],
      tier: 'Individual Pro',
      popular: true,
      demoUrl: '/demo/analytics',
      estimatedValue: '$500/month saved'
    },
    {
      id: 'digital-twin',
      title: 'Digital Twin AI',
      description: 'Create your personal AI assistant that learns and adapts to your work patterns',
      benefits: ['Personal AI assistant', 'Behavior modeling', 'Smart predictions'],
      tier: 'Individual Pro',
      popular: false,
      demoUrl: '/demo/digital-twin',
      estimatedValue: '40% productivity boost'
    },
    {
      id: 'automation',
      title: 'Workflow Automation',
      description: 'Automate repetitive tasks and streamline your workflows with intelligent automation',
      benefits: ['Task automation', 'Smart workflows', 'Time savings'],
      tier: 'Team',
      popular: false,
      demoUrl: '/demo/automation',
      estimatedValue: '15 hours/week saved'
    }
  ],

  // Testimonials
  testimonials: [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Product Manager',
      company: 'TechCorp',
      avatar: '/avatars/sarah.jpg',
      rating: 5,
      text: 'Digame transformed how our team works. The AI insights are incredible and have saved us hours every week.',
      tier: 'Team',
      verified: true,
      date: '2024-01-15T00:00:00Z'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Data Analyst',
      company: 'DataFlow Inc',
      avatar: '/avatars/michael.jpg',
      rating: 5,
      text: 'The analytics capabilities are outstanding. I can create complex reports in minutes instead of hours.',
      tier: 'Individual Pro',
      verified: true,
      date: '2024-01-20T00:00:00Z'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'CEO',
      company: 'StartupXYZ',
      avatar: '/avatars/emily.jpg',
      rating: 5,
      text: 'As a startup, we needed powerful tools without the enterprise price tag. Digame delivered exactly that.',
      tier: 'Enterprise',
      verified: true,
      date: '2024-01-25T00:00:00Z'
    }
  ],

  // Pricing tiers
  pricing: [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      features: ['Basic dashboard', 'Limited analytics', 'Community support'],
      limitations: ['5 reports/month', '1 user', 'Basic features only'],
      popular: false,
      trialDays: 0
    },
    {
      name: 'Individual Pro',
      price: 29,
      period: 'month',
      description: 'For professionals and power users',
      features: ['Advanced analytics', 'AI tools', 'Digital twin', 'Priority support'],
      limitations: ['1 user', 'Standard integrations'],
      popular: true,
      trialDays: 14
    },
    {
      name: 'Team',
      price: 99,
      period: 'month',
      description: 'For teams and small businesses',
      features: ['Everything in Pro', 'Team collaboration', 'Advanced workflows', 'Admin controls'],
      limitations: ['Up to 10 users', 'Standard SLA'],
      popular: false,
      trialDays: 14
    },
    {
      name: 'Enterprise',
      price: null,
      period: 'contact us',
      description: 'For large organizations',
      features: ['Everything in Team', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
      limitations: [],
      popular: false,
      trialDays: 30
    }
  ],

  // Demo tracking
  demos: [
    {
      id: 'analytics',
      name: 'Analytics Demo',
      views: 1247,
      completions: 892,
      conversionRate: 71.5,
      averageDuration: '3:45'
    },
    {
      id: 'digital-twin',
      name: 'Digital Twin Demo',
      views: 856,
      completions: 634,
      conversionRate: 74.1,
      averageDuration: '4:12'
    },
    {
      id: 'automation',
      name: 'Automation Demo',
      views: 623,
      completions: 445,
      conversionRate: 71.4,
      averageDuration: '3:28'
    }
  ],

  // Conversion funnel
  funnel: {
    visitors: 15847,
    signups: 1967,
    trials: 1456,
    conversions: 234,
    steps: [
      { name: 'Landing Page', visitors: 15847, conversionRate: 100 },
      { name: 'Feature Exploration', visitors: 8923, conversionRate: 56.3 },
      { name: 'Demo Interaction', visitors: 3456, conversionRate: 38.7 },
      { name: 'Sign Up', visitors: 1967, conversionRate: 56.9 },
      { name: 'Trial Start', visitors: 1456, conversionRate: 74.0 },
      { name: 'Paid Conversion', visitors: 234, conversionRate: 16.1 }
    ]
  },

  // Popular content
  popularContent: [
    {
      id: 1,
      title: 'Getting Started with AI Analytics',
      type: 'guide',
      views: 2847,
      engagement: 78.5,
      url: '/guides/ai-analytics'
    },
    {
      id: 2,
      title: 'Digital Twin Setup Tutorial',
      type: 'video',
      views: 1923,
      engagement: 82.1,
      url: '/tutorials/digital-twin'
    },
    {
      id: 3,
      title: 'Workflow Automation Best Practices',
      type: 'article',
      views: 1456,
      engagement: 75.3,
      url: '/articles/automation-best-practices'
    }
  ]
};

// Guest dashboard and overview
router.get('/stats', (req, res) => {
  res.json(mockData.stats);
});

router.get('/overview', (req, res) => {
  res.json({
    stats: mockData.stats,
    capabilities: mockData.capabilities.slice(0, 3), // Top 3 capabilities
    testimonials: mockData.testimonials.slice(0, 2), // Top 2 testimonials
    pricing: mockData.pricing
  });
});

// Featured capabilities
router.get('/capabilities', (req, res) => {
  const { popular } = req.query;
  let capabilities = [...mockData.capabilities];

  if (popular === 'true') {
    capabilities = capabilities.filter(cap => cap.popular);
  }

  res.json(capabilities);
});

router.get('/capabilities/:id', (req, res) => {
  const capability = mockData.capabilities.find(c => c.id === req.params.id);
  if (!capability) {
    return res.status(404).json({ error: 'Capability not found' });
  }
  res.json(capability);
});

// Testimonials
router.get('/testimonials', (req, res) => {
  const { tier, verified } = req.query;
  let testimonials = [...mockData.testimonials];

  if (tier && tier !== 'all') {
    testimonials = testimonials.filter(t => t.tier === tier);
  }

  if (verified === 'true') {
    testimonials = testimonials.filter(t => t.verified);
  }

  res.json(testimonials);
});

// Pricing information
router.get('/pricing', (req, res) => {
  res.json(mockData.pricing);
});

router.get('/pricing/:tier', (req, res) => {
  const tier = mockData.pricing.find(p => p.name.toLowerCase() === req.params.tier.toLowerCase());
  if (!tier) {
    return res.status(404).json({ error: 'Pricing tier not found' });
  }
  res.json(tier);
});

// Demo tracking
router.get('/demos', (req, res) => {
  res.json(mockData.demos);
});

router.post('/demos/:id/start', (req, res) => {
  const demo = mockData.demos.find(d => d.id === req.params.id);
  if (!demo) {
    return res.status(404).json({ error: 'Demo not found' });
  }

  // Track demo start
  const sessionId = Math.random().toString(36).substring(2, 15);
  
  res.json({
    sessionId,
    demoId: req.params.id,
    startedAt: new Date().toISOString(),
    estimatedDuration: demo.averageDuration
  });
});

router.post('/demos/:id/complete', (req, res) => {
  const { sessionId, duration } = req.body;
  const demo = mockData.demos.find(d => d.id === req.params.id);
  
  if (!demo) {
    return res.status(404).json({ error: 'Demo not found' });
  }

  // Track demo completion
  res.json({
    sessionId,
    demoId: req.params.id,
    completedAt: new Date().toISOString(),
    duration,
    nextSteps: [
      { action: 'signup', label: 'Start Free Trial', url: '/signup' },
      { action: 'contact', label: 'Contact Sales', url: '/contact' },
      { action: 'explore', label: 'Explore More Features', url: '/features' }
    ]
  });
});

// Conversion funnel
router.get('/funnel', (req, res) => {
  res.json(mockData.funnel);
});

// Popular content
router.get('/content', (req, res) => {
  const { type } = req.query;
  let content = [...mockData.popularContent];

  if (type && type !== 'all') {
    content = content.filter(c => c.type === type);
  }

  res.json(content);
});

// Lead capture
router.post('/leads', (req, res) => {
  const { email, name, company, interest, source } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Simulate lead capture
  const lead = {
    id: Math.random().toString(36).substring(2, 15),
    email,
    name: name || '',
    company: company || '',
    interest: interest || 'general',
    source: source || 'website',
    createdAt: new Date().toISOString(),
    status: 'new'
  };

  res.status(201).json({
    leadId: lead.id,
    message: 'Thank you for your interest! We\'ll be in touch soon.',
    nextSteps: [
      'Check your email for a welcome message',
      'Explore our getting started guide',
      'Schedule a demo with our team'
    ]
  });
});

// Trial signup
router.post('/trial', (req, res) => {
  const { email, name, tier, company } = req.body;

  if (!email || !tier) {
    return res.status(400).json({ error: 'Email and tier are required' });
  }

  const pricingTier = mockData.pricing.find(p => p.name.toLowerCase() === tier.toLowerCase());
  if (!pricingTier) {
    return res.status(400).json({ error: 'Invalid pricing tier' });
  }

  // Simulate trial creation
  const trial = {
    id: Math.random().toString(36).substring(2, 15),
    email,
    name: name || '',
    company: company || '',
    tier,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + pricingTier.trialDays * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    trialDays: pricingTier.trialDays
  };

  res.status(201).json({
    trialId: trial.id,
    message: `Your ${tier} trial has been activated!`,
    trialDays: pricingTier.trialDays,
    accessUrl: '/dashboard',
    setupUrl: '/onboarding/enhanced'
  });
});

// Contact sales
router.post('/contact', (req, res) => {
  const { email, name, company, message, tier } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  // Simulate contact request
  const contact = {
    id: Math.random().toString(36).substring(2, 15),
    email,
    name,
    company: company || '',
    message: message || '',
    tier: tier || 'Enterprise',
    createdAt: new Date().toISOString(),
    status: 'new'
  };

  res.status(201).json({
    contactId: contact.id,
    message: 'Thank you for contacting us! A sales representative will reach out within 24 hours.',
    expectedResponse: '24 hours',
    nextSteps: [
      'You\'ll receive a confirmation email shortly',
      'Our sales team will review your requirements',
      'We\'ll schedule a personalized demo'
    ]
  });
});

// Analytics for guest experience
router.get('/analytics', (req, res) => {
  const { period = '30d' } = req.query;
  
  res.json({
    period,
    visitors: mockData.stats.totalVisitors,
    conversionRate: mockData.stats.conversionRate,
    averageSessionTime: mockData.stats.averageSessionTime,
    bounceRate: mockData.stats.bounceRate,
    topFeatures: mockData.stats.topFeatures,
    funnel: mockData.funnel,
    demos: mockData.demos,
    popularContent: mockData.popularContent
  });
});

module.exports = router;