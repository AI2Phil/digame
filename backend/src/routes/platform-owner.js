const express = require('express');
const router = express.Router();

// Mock data for platform owner features
const mockData = {
  // Console data
  console: {
    stats: {
      totalUsers: 15847,
      activeUsers: 12456,
      totalRevenue: 2847392,
      monthlyGrowth: 23.5,
      systemHealth: 'excellent',
      uptime: '99.97%'
    },
    recentActivity: [
      {
        id: 1,
        type: 'user_registration',
        description: 'New enterprise user registered',
        timestamp: new Date().toISOString(),
        severity: 'info'
      },
      {
        id: 2,
        type: 'payment_processed',
        description: 'Payment of $2,500 processed successfully',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        severity: 'success'
      }
    ]
  },

  // Tenant management data
  tenants: [
    {
      id: 1,
      name: 'Acme Corporation',
      domain: 'acme.digame.com',
      tier: 'Enterprise',
      status: 'active',
      users: 2847,
      revenue: 89400,
      growth: 23.5,
      createdAt: '2023-06-15T00:00:00Z',
      lastActivity: new Date().toISOString(),
      features: ['SSO', 'Custom Branding', 'API Access', 'Priority Support'],
      settings: {
        customBranding: true,
        ssoEnabled: true,
        apiAccess: true,
        storageLimit: '1TB'
      }
    },
    {
      id: 2,
      name: 'TechStart Inc',
      domain: 'techstart.digame.com',
      tier: 'Professional',
      status: 'active',
      users: 456,
      revenue: 12800,
      growth: 45.2,
      createdAt: '2023-08-20T00:00:00Z',
      lastActivity: new Date(Date.now() - 3600000).toISOString(),
      features: ['API Access', 'Advanced Analytics'],
      settings: {
        customBranding: false,
        ssoEnabled: false,
        apiAccess: true,
        storageLimit: '100GB'
      }
    }
  ],

  // User management data
  users: [
    {
      id: 1,
      email: 'admin@acme.com',
      name: 'John Admin',
      role: 'admin',
      tenant: 'Acme Corporation',
      tier: 'Enterprise',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: '2023-06-15T00:00:00Z',
      permissions: ['read', 'write', 'admin']
    },
    {
      id: 2,
      email: 'user@techstart.com',
      name: 'Jane User',
      role: 'user',
      tenant: 'TechStart Inc',
      tier: 'Professional',
      status: 'active',
      lastLogin: new Date(Date.now() - 7200000).toISOString(),
      createdAt: '2023-08-20T00:00:00Z',
      permissions: ['read', 'write']
    }
  ],

  // Revenue analytics data
  revenue: {
    overview: {
      totalRevenue: 2847392,
      monthlyRecurring: 234567,
      annualRecurring: 2814804,
      growth: 23.5,
      churnRate: 2.1,
      averageRevenuePer: {
        user: 89.50,
        tenant: 15678.90
      }
    },
    trends: [
      { month: 'Jan', revenue: 180000, users: 1200, tenants: 45 },
      { month: 'Feb', revenue: 195000, users: 1350, tenants: 48 },
      { month: 'Mar', revenue: 210000, users: 1500, tenants: 52 },
      { month: 'Apr', revenue: 225000, users: 1650, tenants: 55 },
      { month: 'May', revenue: 240000, users: 1800, tenants: 58 },
      { month: 'Jun', revenue: 255000, users: 1950, tenants: 62 }
    ],
    forecasts: [
      { month: 'Jul', predicted: 270000, confidence: 85 },
      { month: 'Aug', predicted: 285000, confidence: 82 },
      { month: 'Sep', predicted: 300000, confidence: 78 }
    ]
  },

  // System health data
  health: {
    overall: 'healthy',
    uptime: '99.97%',
    services: [
      {
        name: 'API Gateway',
        status: 'healthy',
        uptime: '99.99%',
        responseTime: 45,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'Database Cluster',
        status: 'healthy',
        uptime: '99.95%',
        responseTime: 12,
        lastCheck: new Date().toISOString()
      }
    ],
    infrastructure: {
      cpu: { usage: 67, cores: 32, status: 'normal' },
      memory: { usage: 78, total: '128 GB', status: 'normal' },
      storage: { usage: 45, total: '2 TB', status: 'normal' },
      network: { inbound: '2.3 Gbps', outbound: '1.8 Gbps', status: 'normal' }
    }
  },

  // Security data
  security: {
    overview: {
      score: 94,
      vulnerabilities: { critical: 0, high: 2, medium: 5, low: 12 },
      compliance: {
        gdpr: 'compliant',
        hipaa: 'compliant',
        sox: 'compliant',
        iso27001: 'in-progress'
      }
    },
    auditLogs: [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        user: 'admin@platform.com',
        action: 'User Role Modified',
        resource: 'User Management',
        severity: 'medium',
        category: 'user_management'
      }
    ]
  },

  // Integration data
  integrations: {
    stats: {
      totalIntegrations: 24,
      activeConnections: 18,
      apiCalls: 1247892,
      webhookEvents: 45623
    },
    ssoProviders: [
      {
        id: 1,
        name: 'Google Workspace',
        provider: 'google',
        status: 'active',
        users: 1234,
        lastSync: new Date().toISOString()
      }
    ],
    apiKeys: [
      {
        id: 1,
        name: 'Production API Key',
        key: 'pk_live_1234567890abcdef',
        permissions: ['read', 'write', 'admin'],
        lastUsed: new Date().toISOString(),
        status: 'active'
      }
    ]
  },

  // Enterprise data
  enterprise: {
    stats: {
      totalTenants: 156,
      enterpriseClients: 23,
      totalRevenue: 2847392,
      marketShare: 12.4,
      growthRate: 34.2
    },
    features: [
      {
        id: 1,
        name: 'White Label Solution',
        description: 'Complete branding customization for enterprise clients',
        status: 'active',
        usage: 89,
        clients: 12
      }
    ],
    marketIntelligence: {
      competitors: [
        {
          name: 'CompetitorA',
          marketShare: 28.5,
          pricing: '$49/user',
          features: 85,
          customerSat: 4.2,
          trend: 'up'
        }
      ]
    }
  }
};

// Console endpoints
router.get('/console/stats', (req, res) => {
  res.json(mockData.console.stats);
});

router.get('/console/activity', (req, res) => {
  res.json(mockData.console.recentActivity);
});

// Tenant management endpoints
router.get('/tenants', (req, res) => {
  const { tier, status, search } = req.query;
  let tenants = [...mockData.tenants];

  if (tier && tier !== 'all') {
    tenants = tenants.filter(tenant => tenant.tier === tier);
  }

  if (status && status !== 'all') {
    tenants = tenants.filter(tenant => tenant.status === status);
  }

  if (search) {
    tenants = tenants.filter(tenant => 
      tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.domain.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json({
    tenants,
    total: tenants.length,
    stats: {
      total: mockData.tenants.length,
      active: mockData.tenants.filter(t => t.status === 'active').length,
      enterprise: mockData.tenants.filter(t => t.tier === 'Enterprise').length
    }
  });
});

router.get('/tenants/:id', (req, res) => {
  const tenant = mockData.tenants.find(t => t.id === parseInt(req.params.id));
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }
  res.json(tenant);
});

router.put('/tenants/:id', (req, res) => {
  const tenantIndex = mockData.tenants.findIndex(t => t.id === parseInt(req.params.id));
  if (tenantIndex === -1) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  mockData.tenants[tenantIndex] = {
    ...mockData.tenants[tenantIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json(mockData.tenants[tenantIndex]);
});

router.delete('/tenants/:id', (req, res) => {
  const tenantIndex = mockData.tenants.findIndex(t => t.id === parseInt(req.params.id));
  if (tenantIndex === -1) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  mockData.tenants.splice(tenantIndex, 1);
  res.json({ message: 'Tenant deleted successfully' });
});

// User management endpoints
router.get('/users', (req, res) => {
  const { role, tier, status, search } = req.query;
  let users = [...mockData.users];

  if (role && role !== 'all') {
    users = users.filter(user => user.role === role);
  }

  if (tier && tier !== 'all') {
    users = users.filter(user => user.tier === tier);
  }

  if (status && status !== 'all') {
    users = users.filter(user => user.status === status);
  }

  if (search) {
    users = users.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json({
    users,
    total: users.length,
    stats: {
      total: mockData.users.length,
      active: mockData.users.filter(u => u.status === 'active').length,
      admins: mockData.users.filter(u => u.role === 'admin').length
    }
  });
});

router.get('/users/:id', (req, res) => {
  const user = mockData.users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

router.put('/users/:id', (req, res) => {
  const userIndex = mockData.users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  mockData.users[userIndex] = {
    ...mockData.users[userIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json(mockData.users[userIndex]);
});

// Revenue analytics endpoints
router.get('/revenue/overview', (req, res) => {
  res.json(mockData.revenue.overview);
});

router.get('/revenue/trends', (req, res) => {
  const { period = '6m' } = req.query;
  res.json({
    trends: mockData.revenue.trends,
    forecasts: mockData.revenue.forecasts,
    period
  });
});

// System health endpoints
router.get('/health/overview', (req, res) => {
  res.json(mockData.health);
});

router.get('/health/services', (req, res) => {
  res.json(mockData.health.services);
});

router.get('/health/infrastructure', (req, res) => {
  res.json(mockData.health.infrastructure);
});

// Security endpoints
router.get('/security/overview', (req, res) => {
  res.json(mockData.security.overview);
});

router.get('/security/audit-logs', (req, res) => {
  const { category = 'all', severity = 'all' } = req.query;
  let logs = [...mockData.security.auditLogs];

  if (category !== 'all') {
    logs = logs.filter(log => log.category === category);
  }

  if (severity !== 'all') {
    logs = logs.filter(log => log.severity === severity);
  }

  res.json(logs);
});

// Integration endpoints
router.get('/integrations/overview', (req, res) => {
  res.json(mockData.integrations.stats);
});

router.get('/integrations/sso', (req, res) => {
  res.json(mockData.integrations.ssoProviders);
});

router.get('/integrations/api-keys', (req, res) => {
  res.json(mockData.integrations.apiKeys);
});

router.post('/integrations/api-keys', (req, res) => {
  const newKey = {
    id: mockData.integrations.apiKeys.length + 1,
    name: req.body.name,
    key: `pk_${req.body.environment}_${Math.random().toString(36).substring(2, 15)}`,
    permissions: req.body.permissions || ['read'],
    created: new Date().toISOString(),
    status: 'active',
    usage: 0
  };

  mockData.integrations.apiKeys.push(newKey);
  res.status(201).json(newKey);
});

// Enterprise endpoints
router.get('/enterprise/overview', (req, res) => {
  res.json(mockData.enterprise.stats);
});

router.get('/enterprise/features', (req, res) => {
  res.json(mockData.enterprise.features);
});

router.get('/enterprise/market-intelligence', (req, res) => {
  res.json(mockData.enterprise.marketIntelligence);
});

// Export data endpoint
router.post('/export', (req, res) => {
  const { type, format } = req.body;
  
  // Simulate export process
  const exportId = Math.random().toString(36).substring(2, 15);
  
  res.json({
    exportId,
    status: 'processing',
    type,
    format,
    created: new Date().toISOString(),
    estimatedCompletion: new Date(Date.now() + 300000).toISOString()
  });
});

module.exports = router;