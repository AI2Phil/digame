const express = require('express');
const router = express.Router();

// Mock data for integration endpoints
const mockIntegrationData = {
  overview: {
    totalIntegrations: 12,
    activeIntegrations: 9,
    apiCallsToday: 15420,
    webhookEvents: 2340,
    guestIntegrations: 3,
    ssoProviders: 2,
    apiEndpoints: 45,
    webhooks: 8,
    dataSources: 5
  },
  integrations: [
    {
      id: 1,
      name: "Azure AD SSO",
      description: "Single sign-on integration with Azure Active Directory",
      type: "sso",
      status: "active",
      lastSync: "2 hours ago",
      provider: "Microsoft"
    },
    {
      id: 2,
      name: "Slack Notifications",
      description: "Send notifications to Slack channels",
      type: "webhook",
      status: "active",
      lastSync: "15 minutes ago",
      provider: "Slack"
    }
  ],
  guest: {
    overview: {
      totalGuests: 45,
      activeGuests: 32,
      expiringSoon: 8,
      securityScore: 87
    },
    users: [
      {
        id: 1,
        name: "John External",
        email: "john@external.com",
        accessLevel: "Read Only",
        expiresAt: "2024-02-15",
        status: "active",
        lastActive: "2 hours ago",
        invitedBy: "admin@company.com"
      },
      {
        id: 2,
        name: "Sarah Partner",
        email: "sarah@partner.com",
        accessLevel: "Contributor",
        expiresAt: "2024-03-01",
        status: "active",
        lastActive: "1 day ago",
        invitedBy: "manager@company.com"
      }
    ]
  },
  sso: {
    overview: {
      totalProviders: 3,
      activeProviders: 2,
      ssoUsers: 1247,
      successRate: 98.5
    },
    providers: [
      {
        id: 1,
        name: "Azure AD",
        type: "saml",
        status: "active",
        userCount: 856,
        lastSync: "1 hour ago",
        successRate: 98.7,
        description: "Corporate Azure Active Directory"
      },
      {
        id: 2,
        name: "Google Workspace",
        type: "oauth",
        status: "active",
        userCount: 391,
        lastSync: "30 minutes ago",
        successRate: 97.2,
        description: "Google Workspace for contractors"
      }
    ]
  },
  api: {
    overview: {
      totalKeys: 15,
      totalEndpoints: 45,
      requestsToday: 25670,
      successRate: 99.2
    },
    keys: [
      {
        id: 1,
        name: "Production API Key",
        description: "Main production environment key",
        value: "pk_live_1234567890abcdef1234567890abcdef",
        permissions: ["read", "write"],
        requestsToday: 1250,
        rateLimit: 10000,
        status: "active",
        expiresAt: null,
        createdAt: "2024-01-01"
      },
      {
        id: 2,
        name: "Development Key",
        description: "Development and testing key",
        value: "pk_test_abcdef1234567890abcdef1234567890",
        permissions: ["read"],
        requestsToday: 340,
        rateLimit: 1000,
        status: "active",
        expiresAt: "2024-12-31",
        createdAt: "2024-01-15"
      }
    ],
    endpoints: [
      {
        id: 1,
        method: "GET",
        path: "/api/v1/users",
        description: "Retrieve list of users",
        status: "active",
        requestsToday: 5420,
        avgResponseTime: 145,
        successRate: 99.8,
        authRequired: true
      },
      {
        id: 2,
        method: "POST",
        path: "/api/v1/users",
        description: "Create a new user",
        status: "active",
        requestsToday: 234,
        avgResponseTime: 280,
        successRate: 98.9,
        authRequired: true
      }
    ]
  },
  webhooks: {
    overview: {
      totalWebhooks: 8,
      activeWebhooks: 6,
      eventsToday: 2340,
      successRate: 97.8
    },
    webhooks: [
      {
        id: 1,
        name: "User Management Hook",
        description: "Handles user lifecycle events",
        url: "https://app.example.com/webhooks/users",
        events: ["user.created", "user.updated", "user.deleted"],
        status: "active",
        deliveriesToday: 45,
        successRate: 98.9,
        lastDelivery: "5 minutes ago",
        hasSecret: true,
        maxRetries: 3,
        timeout: 30
      },
      {
        id: 2,
        name: "Project Notifications",
        description: "Project status change notifications",
        url: "https://notifications.example.com/projects",
        events: ["project.created", "project.completed"],
        status: "active",
        deliveriesToday: 23,
        successRate: 96.7,
        lastDelivery: "1 hour ago",
        hasSecret: true,
        maxRetries: 5,
        timeout: 15
      }
    ],
    events: [
      {
        id: 1,
        name: "user.created",
        description: "Triggered when a new user is created",
        category: "User Events",
        payload: {
          id: "string",
          email: "string",
          name: "string",
          created_at: "datetime"
        }
      },
      {
        id: 2,
        name: "project.completed",
        description: "Triggered when a project is marked as completed",
        category: "Project Events",
        payload: {
          id: "string",
          name: "string",
          completed_at: "datetime",
          completed_by: "string"
        }
      }
    ]
  },
  data: {
    overview: {
      totalSources: 5,
      connectedSources: 4,
      recordsSynced: 125670,
      lastSync: "30 min ago"
    },
    sources: [
      {
        id: 1,
        name: "Customer Database",
        description: "Main customer data from CRM system",
        type: "database",
        status: "connected",
        recordCount: 15420,
        lastSync: "1 hour ago",
        syncFrequency: "hourly",
        connectionString: "postgresql://***"
      },
      {
        id: 2,
        name: "Product Catalog",
        description: "E-commerce product information",
        type: "api",
        status: "connected",
        recordCount: 8950,
        lastSync: "30 minutes ago",
        syncFrequency: "daily",
        connectionString: "https://api.ecommerce.com/v1"
      }
    ],
    syncJobs: [
      {
        id: 1,
        sourceName: "Customer Database",
        sourceType: "database",
        jobType: "full_sync",
        status: "completed",
        recordsProcessed: 15420,
        totalRecords: 15420,
        duration: "2.3 min",
        startedAt: "2024-01-15 14:30:00",
        completedAt: "2024-01-15 14:32:18"
      },
      {
        id: 2,
        sourceName: "Product Catalog",
        sourceType: "api",
        jobType: "incremental",
        status: "running",
        recordsProcessed: 2340,
        totalRecords: 3450,
        duration: "1.2 min",
        startedAt: "2024-01-15 14:45:00",
        completedAt: null
      }
    ]
  }
};

// Integration Overview Routes
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: mockIntegrationData.overview
  });
});

router.get('/list', (req, res) => {
  const { type, status } = req.query;
  
  let integrations = mockIntegrationData.integrations;
  
  if (type && type !== 'all') {
    integrations = integrations.filter(integration => integration.type === type);
  }
  
  if (status && status !== 'all') {
    integrations = integrations.filter(integration => integration.status === status);
  }
  
  res.json({
    success: true,
    data: integrations,
    total: integrations.length
  });
});

// Guest Access Routes
router.get('/guest/stats', (req, res) => {
  res.json({
    success: true,
    data: mockIntegrationData.guest.overview
  });
});

router.get('/guest/users', (req, res) => {
  const { status, search } = req.query;
  
  let users = mockIntegrationData.guest.users;
  
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
    success: true,
    data: users,
    total: users.length
  });
});

router.post('/guest/invite', (req, res) => {
  const { email, accessLevel, duration, message } = req.body;
  
  const newGuest = {
    id: Date.now(),
    email,
    accessLevel,
    duration,
    message,
    status: 'pending',
    invitedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
  };
  
  res.json({
    success: true,
    message: 'Guest invitation sent successfully',
    data: newGuest
  });
});

router.post('/guest/users/:userId/revoke', (req, res) => {
  const { userId } = req.params;
  
  res.json({
    success: true,
    message: 'Guest access revoked successfully',
    data: { userId, revokedAt: new Date().toISOString() }
  });
});

router.post('/guest/users/:userId/extend', (req, res) => {
  const { userId } = req.params;
  const { duration } = req.body;
  
  res.json({
    success: true,
    message: 'Guest access extended successfully',
    data: {
      userId,
      newExpirationDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
      extendedAt: new Date().toISOString()
    }
  });
});

router.get('/guest/settings', (req, res) => {
  const settings = {
    defaultDuration: 14,
    maxDuration: 90,
    requireEmailVerification: true,
    enableSessionTimeout: true,
    sessionTimeout: 480,
    ipRestriction: false,
    allowedIPs: []
  };
  
  res.json({
    success: true,
    data: settings
  });
});

// SSO Routes
router.get('/sso/stats', (req, res) => {
  res.json({
    success: true,
    data: mockIntegrationData.sso.overview
  });
});

router.get('/sso/providers', (req, res) => {
  const { type, status } = req.query;
  
  let providers = mockIntegrationData.sso.providers;
  
  if (type && type !== 'all') {
    providers = providers.filter(provider => provider.type === type);
  }
  
  if (status && status !== 'all') {
    providers = providers.filter(provider => provider.status === status);
  }
  
  res.json({
    success: true,
    data: providers,
    total: providers.length
  });
});

router.post('/sso/providers', (req, res) => {
  const { name, type, description, configuration } = req.body;
  
  const newProvider = {
    id: Date.now(),
    name,
    type,
    description,
    configuration,
    status: 'pending',
    userCount: 0,
    successRate: 0,
    createdAt: new Date().toISOString(),
    lastSync: null
  };
  
  res.json({
    success: true,
    message: 'SSO provider created successfully',
    data: newProvider
  });
});

router.post('/sso/providers/:providerId/test', (req, res) => {
  const { providerId } = req.params;
  
  res.json({
    success: true,
    message: 'SSO provider test completed',
    data: {
      providerId,
      testResult: 'success',
      responseTime: '245ms',
      testedAt: new Date().toISOString()
    }
  });
});

router.post('/sso/providers/:providerId/toggle', (req, res) => {
  const { providerId } = req.params;
  const { enabled } = req.body;
  
  res.json({
    success: true,
    message: `SSO provider ${enabled ? 'enabled' : 'disabled'} successfully`,
    data: {
      providerId,
      status: enabled ? 'active' : 'inactive',
      updatedAt: new Date().toISOString()
    }
  });
});

router.get('/sso/settings', (req, res) => {
  const settings = {
    defaultProvider: 'azure',
    sessionTimeout: 480,
    forceSSO: false,
    allowLocalFallback: true,
    autoProvisionUsers: true,
    attributeMapping: {
      email: 'email',
      firstName: 'given_name',
      lastName: 'family_name',
      department: 'department',
      role: 'role'
    }
  };
  
  res.json({
    success: true,
    data: settings
  });
});

// API Management Routes
router.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: mockIntegrationData.api.overview
  });
});

router.get('/api/keys', (req, res) => {
  const { status, search } = req.query;
  
  let keys = mockIntegrationData.api.keys;
  
  if (status && status !== 'all') {
    keys = keys.filter(key => key.status === status);
  }
  
  if (search) {
    keys = keys.filter(key => 
      key.name.toLowerCase().includes(search.toLowerCase()) ||
      key.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    data: keys,
    total: keys.length
  });
});

router.post('/api/keys', (req, res) => {
  const { name, description, permissions, rateLimit, expiresAt } = req.body;
  
  const newKey = {
    id: Date.now(),
    name,
    description,
    value: `pk_${Math.random().toString(36).substr(2, 32)}`,
    permissions,
    rateLimit,
    expiresAt,
    status: 'active',
    requestsToday: 0,
    createdAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'API key generated successfully',
    data: newKey
  });
});

router.post('/api/keys/:keyId/revoke', (req, res) => {
  const { keyId } = req.params;
  
  res.json({
    success: true,
    message: 'API key revoked successfully',
    data: {
      keyId,
      status: 'revoked',
      revokedAt: new Date().toISOString()
    }
  });
});

router.get('/api/endpoints', (req, res) => {
  const { method, search } = req.query;
  
  let endpoints = mockIntegrationData.api.endpoints;
  
  if (method && method !== 'all') {
    endpoints = endpoints.filter(endpoint => endpoint.method === method);
  }
  
  if (search) {
    endpoints = endpoints.filter(endpoint => 
      endpoint.path.toLowerCase().includes(search.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    data: endpoints,
    total: endpoints.length
  });
});

// Webhooks Routes
router.get('/webhooks/stats', (req, res) => {
  res.json({
    success: true,
    data: mockIntegrationData.webhooks.overview
  });
});

router.get('/webhooks/list', (req, res) => {
  const { status, search } = req.query;
  
  let webhooks = mockIntegrationData.webhooks.webhooks;
  
  if (status && status !== 'all') {
    webhooks = webhooks.filter(webhook => webhook.status === status);
  }
  
  if (search) {
    webhooks = webhooks.filter(webhook => 
      webhook.name.toLowerCase().includes(search.toLowerCase()) ||
      webhook.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    data: webhooks,
    total: webhooks.length
  });
});

router.post('/webhooks', (req, res) => {
  const { name, description, url, events, secret } = req.body;
  
  const newWebhook = {
    id: Date.now(),
    name,
    description,
    url,
    events,
    secret,
    status: 'active',
    deliveriesToday: 0,
    successRate: 100,
    lastDelivery: null,
    hasSecret: !!secret,
    maxRetries: 3,
    timeout: 30,
    createdAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Webhook created successfully',
    data: newWebhook
  });
});

router.post('/webhooks/:webhookId/test', (req, res) => {
  const { webhookId } = req.params;
  
  res.json({
    success: true,
    message: 'Webhook test completed',
    data: {
      webhookId,
      testResult: 'success',
      responseCode: 200,
      responseTime: '156ms',
      testedAt: new Date().toISOString()
    }
  });
});

router.post('/webhooks/:webhookId/toggle', (req, res) => {
  const { webhookId } = req.params;
  const { enabled } = req.body;
  
  res.json({
    success: true,
    message: `Webhook ${enabled ? 'enabled' : 'disabled'} successfully`,
    data: {
      webhookId,
      status: enabled ? 'active' : 'paused',
      updatedAt: new Date().toISOString()
    }
  });
});

router.get('/webhooks/events', (req, res) => {
  res.json({
    success: true,
    data: mockIntegrationData.webhooks.events
  });
});

// Data Integration Routes
router.get('/data/stats', (req, res) => {
  res.json({
    success: true,
    data: mockIntegrationData.data.overview
  });
});

router.get('/data/sources', (req, res) => {
  const { type, status } = req.query;
  
  let sources = mockIntegrationData.data.sources;
  
  if (type && type !== 'all') {
    sources = sources.filter(source => source.type === type);
  }
  
  if (status && status !== 'all') {
    sources = sources.filter(source => source.status === status);
  }
  
  res.json({
    success: true,
    data: sources,
    total: sources.length
  });
});

router.post('/data/sources', (req, res) => {
  const { name, description, type, connectionString, syncFrequency } = req.body;
  
  const newSource = {
    id: Date.now(),
    name,
    description,
    type,
    connectionString,
    syncFrequency,
    status: 'pending',
    recordCount: 0,
    lastSync: null,
    createdAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Data source created successfully',
    data: newSource
  });
});

router.post('/data/sources/:sourceId/test', (req, res) => {
  const { sourceId } = req.params;
  
  res.json({
    success: true,
    message: 'Data source connection test completed',
    data: {
      sourceId,
      testResult: 'success',
      connectionTime: '89ms',
      recordsFound: 15420,
      testedAt: new Date().toISOString()
    }
  });
});

router.post('/data/sources/:sourceId/sync', (req, res) => {
  const { sourceId } = req.params;
  
  res.json({
    success: true,
    message: 'Data sync initiated',
    data: {
      sourceId,
      jobId: `job_${Date.now()}`,
      status: 'running',
      startedAt: new Date().toISOString()
    }
  });
});

router.post('/data/sources/:sourceId/toggle', (req, res) => {
  const { sourceId } = req.params;
  const { enabled } = req.body;
  
  res.json({
    success: true,
    message: `Data source ${enabled ? 'enabled' : 'disabled'} successfully`,
    data: {
      sourceId,
      status: enabled ? 'connected' : 'disconnected',
      updatedAt: new Date().toISOString()
    }
  });
});

router.get('/data/sync-jobs', (req, res) => {
  const { status, sourceId } = req.query;
  
  let jobs = mockIntegrationData.data.syncJobs;
  
  if (status && status !== 'all') {
    jobs = jobs.filter(job => job.status === status);
  }
  
  if (sourceId) {
    jobs = jobs.filter(job => job.sourceId === sourceId);
  }
  
  res.json({
    success: true,
    data: jobs,
    total: jobs.length
  });
});

module.exports = router;