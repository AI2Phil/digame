const express = require('express');
const router = express.Router();

// Mock data for admin endpoints
const mockAdminData = {
  dashboard: {
    totalUsers: 1247,
    usersTrend: 8.5,
    activeSessions: 342,
    sessionsTrend: -2.1,
    systemLoad: '45%',
    loadTrend: 12.3,
    securityScore: 87,
    securityTrend: 3.2
  },
  alerts: [
    {
      id: 1,
      title: "High Memory Usage",
      description: "System memory usage has exceeded 85% threshold",
      severity: "warning",
      timestamp: "2024-01-15 14:30:25",
      service: "Web Server"
    },
    {
      id: 2,
      title: "Failed Login Attempts",
      description: "Multiple failed login attempts detected from IP 192.168.1.100",
      severity: "critical",
      timestamp: "2024-01-15 14:25:10",
      service: "Authentication"
    },
    {
      id: 3,
      title: "Database Connection Pool",
      description: "Database connection pool is running low",
      severity: "warning",
      timestamp: "2024-01-15 14:20:05",
      service: "Database"
    }
  ],
  activity: [
    {
      id: 1,
      description: "User john.doe@company.com logged in",
      timestamp: "5 minutes ago",
      type: "user"
    },
    {
      id: 2,
      description: "System backup completed successfully",
      timestamp: "15 minutes ago",
      type: "system"
    },
    {
      id: 3,
      description: "Security scan initiated",
      timestamp: "30 minutes ago",
      type: "security"
    },
    {
      id: 4,
      description: "New user registered: jane.smith@company.com",
      timestamp: "1 hour ago",
      type: "user"
    }
  ],
  config: {
    appName: "Digame Platform",
    environment: "production",
    debugMode: false,
    maxRequestSize: 50,
    requestTimeout: 30,
    workerProcesses: 4,
    memoryLimit: 512,
    cpuLimit: 80,
    dbHost: "localhost",
    dbPort: 5432,
    dbName: "digame_prod",
    maxConnections: 100,
    minConnections: 10,
    connectionTimeout: 5000,
    backupFrequency: "daily",
    retentionPeriod: 30,
    backupLocation: "s3",
    sessionDuration: 8,
    maxLoginAttempts: 5,
    requireMFA: false,
    minPasswordLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    encryptionAlgorithm: "aes-256",
    keyRotation: 90,
    smtpHost: "smtp.digame.com",
    smtpPort: 587,
    fromEmail: "noreply@digame.com",
    useTLS: true,
    enablePushNotifications: true,
    pushProvider: "firebase",
    apiVersion: "v1",
    rateLimit: 10000,
    enableApiDocs: true,
    webhookTimeout: 30,
    webhookMaxRetries: 3,
    requireHttps: true,
    storageProvider: "s3",
    maxFileSize: 100,
    allowedFileTypes: "jpg,png,pdf,doc,docx",
    cacheProvider: "redis",
    cacheTTL: 3600,
    maxCacheSize: 512,
    tempFileCleanup: 24,
    logRetention: 90
  },
  users: [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Admin",
      status: "active",
      lastLogin: "2024-01-15 14:30:25",
      createdAt: "2024-01-01",
      department: "Engineering",
      phone: "+1-555-0123",
      location: "San Francisco, CA",
      avatar: null,
      mfaEnabled: true,
      passwordChanged: "2024-01-10",
      failedLogins: 0,
      loginCount: 156
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "Manager",
      status: "active",
      lastLogin: "2024-01-15 13:45:12",
      createdAt: "2024-01-05",
      department: "Marketing",
      phone: "+1-555-0124",
      location: "New York, NY",
      avatar: null,
      mfaEnabled: false,
      passwordChanged: "2024-01-05",
      failedLogins: 1,
      loginCount: 89
    },
    {
      id: 3,
      name: "Bob Wilson",
      email: "bob.wilson@company.com",
      role: "User",
      status: "pending",
      lastLogin: null,
      createdAt: "2024-01-15",
      department: "Sales",
      phone: "+1-555-0125",
      location: "Chicago, IL",
      avatar: null,
      mfaEnabled: false,
      passwordChanged: null,
      failedLogins: 0,
      loginCount: 0
    }
  ],
  userStats: {
    totalUsers: 1247,
    activeUsers: 1089,
    pendingUsers: 45,
    onlineUsers: 234
  },
  roles: [
    {
      id: 1,
      name: "Platform Owner",
      level: "system",
      description: "Full platform access and control",
      userCount: 2,
      permissionCount: 156,
      createdAt: "2024-01-01",
      status: "active"
    },
    {
      id: 2,
      name: "Administrator",
      level: "admin",
      description: "Administrative access to platform features",
      userCount: 8,
      permissionCount: 89,
      createdAt: "2024-01-01",
      status: "active"
    },
    {
      id: 3,
      name: "Manager",
      level: "manager",
      description: "Team and project management capabilities",
      userCount: 45,
      permissionCount: 34,
      createdAt: "2024-01-01",
      status: "active"
    },
    {
      id: 4,
      name: "User",
      level: "user",
      description: "Standard user access",
      userCount: 1192,
      permissionCount: 12,
      createdAt: "2024-01-01",
      status: "active"
    }
  ],
  permissions: [
    {
      id: 1,
      name: "user.create",
      description: "Create new users",
      category: "user",
      riskLevel: "high",
      roleCount: 2
    },
    {
      id: 2,
      name: "user.read",
      description: "View user information",
      category: "user",
      riskLevel: "low",
      roleCount: 4
    },
    {
      id: 3,
      name: "user.update",
      description: "Update user information",
      category: "user",
      riskLevel: "medium",
      roleCount: 3
    },
    {
      id: 4,
      name: "user.delete",
      description: "Delete users",
      category: "user",
      riskLevel: "high",
      roleCount: 2
    },
    {
      id: 5,
      name: "system.config",
      description: "Modify system configuration",
      category: "system",
      riskLevel: "high",
      roleCount: 1
    },
    {
      id: 6,
      name: "content.create",
      description: "Create content",
      category: "content",
      riskLevel: "low",
      roleCount: 4
    },
    {
      id: 7,
      name: "security.audit",
      description: "Access security audit logs",
      category: "security",
      riskLevel: "medium",
      roleCount: 2
    }
  ],
  monitoring: {
    metrics: {
      cpuUsage: 45,
      memoryUsage: 67,
      diskUsage: 23,
      networkUsage: 34,
      activeUsers: 234,
      requestsPerSecond: 125,
      avgResponseTime: 145,
      errorRate: 0.8,
      uptime: "99.9%",
      dbConnections: 45,
      avgQueryTime: "12ms",
      slowQueries: 3,
      cacheHitRate: "94.2%",
      totalRequests: "1.2M",
      successfulRequests: "1.18M",
      failedRequests: "24K",
      uniqueVisitors: "45K"
    },
    services: [
      {
        id: 1,
        name: "Web Server",
        type: "web",
        description: "Main application server",
        status: "healthy",
        uptime: "99.9%",
        responseTime: "12ms",
        lastCheck: "1 minute ago",
        version: "v2.1.0"
      },
      {
        id: 2,
        name: "Database",
        type: "database",
        description: "PostgreSQL database server",
        status: "healthy",
        uptime: "99.8%",
        responseTime: "8ms",
        lastCheck: "1 minute ago",
        version: "15.3"
      },
      {
        id: 3,
        name: "Cache Layer",
        type: "cache",
        description: "Redis cache server",
        status: "warning",
        uptime: "98.5%",
        responseTime: "2ms",
        lastCheck: "1 minute ago",
        version: "7.0"
      },
      {
        id: 4,
        name: "Queue System",
        type: "queue",
        description: "Background job processing",
        status: "healthy",
        uptime: "99.7%",
        responseTime: "5ms",
        lastCheck: "1 minute ago",
        version: "v1.8"
      },
      {
        id: 5,
        name: "File Storage",
        type: "storage",
        description: "S3 compatible storage",
        status: "healthy",
        uptime: "99.2%",
        responseTime: "45ms",
        lastCheck: "1 minute ago",
        version: "latest"
      }
    ],
    alerts: [
      {
        id: 1,
        title: "High Memory Usage",
        description: "Web server memory usage exceeded 80% threshold",
        severity: "warning",
        timestamp: "2024-01-15 14:30:25",
        service: "Web Server"
      },
      {
        id: 2,
        title: "Database Connection Pool",
        description: "Database connection pool is running low",
        severity: "critical",
        timestamp: "2024-01-15 14:25:10",
        service: "Database"
      }
    ]
  }
};

// Dashboard Routes
router.get('/dashboard', (req, res) => {
  const { timeRange = '24h' } = req.query;
  
  res.json({
    success: true,
    data: mockAdminData.dashboard
  });
});

router.get('/alerts', (req, res) => {
  const { severity, limit = 10 } = req.query;
  
  let alerts = mockAdminData.alerts;
  
  if (severity && severity !== 'all') {
    alerts = alerts.filter(alert => alert.severity === severity);
  }
  
  alerts = alerts.slice(0, parseInt(limit));
  
  res.json({
    success: true,
    data: alerts
  });
});

router.get('/activity', (req, res) => {
  const { type, limit = 20 } = req.query;
  
  let activity = mockAdminData.activity;
  
  if (type && type !== 'all') {
    activity = activity.filter(item => item.type === type);
  }
  
  activity = activity.slice(0, parseInt(limit));
  
  res.json({
    success: true,
    data: activity
  });
});

// Configuration Routes
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: mockAdminData.config
  });
});

router.put('/config/:section', (req, res) => {
  const { section } = req.params;
  const updates = req.body;
  
  // Simulate updating configuration
  Object.assign(mockAdminData.config, updates);
  
  res.json({
    success: true,
    message: `${section} configuration updated successfully`,
    data: {
      section,
      updates,
      updatedAt: new Date().toISOString()
    }
  });
});

router.post('/config/:section/reset', (req, res) => {
  const { section } = req.params;
  
  res.json({
    success: true,
    message: `${section} configuration reset to defaults`,
    data: {
      section,
      resetAt: new Date().toISOString()
    }
  });
});

// User Management Routes
router.get('/users', (req, res) => {
  const { status, role, search, page = 1, limit = 50 } = req.query;
  
  let users = mockAdminData.users;
  
  // Apply filters
  if (status && status !== 'all') {
    users = users.filter(user => user.status === status);
  }
  
  if (role && role !== 'all') {
    users = users.filter(user => user.role.toLowerCase() === role.toLowerCase());
  }
  
  if (search) {
    users = users.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = users.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedUsers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: users.length,
      pages: Math.ceil(users.length / limit)
    }
  });
});

router.get('/users/stats', (req, res) => {
  res.json({
    success: true,
    data: mockAdminData.userStats
  });
});

router.post('/users', (req, res) => {
  const { firstName, lastName, email, role, department, sendWelcome } = req.body;
  
  const newUser = {
    id: Date.now(),
    name: `${firstName} ${lastName}`,
    email,
    role,
    department,
    status: 'pending',
    lastLogin: null,
    createdAt: new Date().toISOString().split('T')[0],
    mfaEnabled: false,
    passwordChanged: null,
    failedLogins: 0,
    loginCount: 0
  };
  
  res.json({
    success: true,
    message: 'User created successfully',
    data: newUser
  });
});

router.post('/users/:userId/activate', (req, res) => {
  const { userId } = req.params;
  
  res.json({
    success: true,
    message: 'User activated successfully',
    data: {
      userId,
      status: 'active',
      activatedAt: new Date().toISOString()
    }
  });
});

router.post('/users/:userId/suspend', (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  
  res.json({
    success: true,
    message: 'User suspended successfully',
    data: {
      userId,
      status: 'suspended',
      reason,
      suspendedAt: new Date().toISOString()
    }
  });
});

router.post('/users/:userId/delete', (req, res) => {
  const { userId } = req.params;
  
  res.json({
    success: true,
    message: 'User deleted successfully',
    data: {
      userId,
      deletedAt: new Date().toISOString()
    }
  });
});

router.post('/users/bulk/:action', (req, res) => {
  const { action } = req.params;
  const { userIds } = req.body;
  
  res.json({
    success: true,
    message: `Bulk ${action} completed successfully`,
    data: {
      action,
      userIds,
      processedAt: new Date().toISOString(),
      affectedUsers: userIds.length
    }
  });
});

// RBAC Routes
router.get('/rbac/roles', (req, res) => {
  const { level, search } = req.query;
  
  let roles = mockAdminData.roles;
  
  if (level && level !== 'all') {
    roles = roles.filter(role => role.level === level);
  }
  
  if (search) {
    roles = roles.filter(role => 
      role.name.toLowerCase().includes(search.toLowerCase()) ||
      role.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    data: roles,
    total: roles.length
  });
});

router.get('/rbac/permissions', (req, res) => {
  const { category, riskLevel } = req.query;
  
  let permissions = mockAdminData.permissions;
  
  if (category && category !== 'all') {
    permissions = permissions.filter(permission => permission.category === category);
  }
  
  if (riskLevel && riskLevel !== 'all') {
    permissions = permissions.filter(permission => permission.riskLevel === riskLevel);
  }
  
  res.json({
    success: true,
    data: permissions,
    total: permissions.length
  });
});

router.get('/rbac/users', (req, res) => {
  const { role } = req.query;
  
  let users = mockAdminData.users.map(user => ({
    ...user,
    roleName: user.role,
    roleLevel: user.role.toLowerCase(),
    roleId: mockAdminData.roles.find(r => r.name === user.role)?.id || 1
  }));
  
  if (role && role !== 'all') {
    users = users.filter(user => user.roleId == role);
  }
  
  res.json({
    success: true,
    data: users
  });
});

router.post('/rbac/roles', (req, res) => {
  const { name, level, description, permissions } = req.body;
  
  const newRole = {
    id: Date.now(),
    name,
    level,
    description,
    permissions: permissions || [],
    userCount: 0,
    permissionCount: permissions?.length || 0,
    createdAt: new Date().toISOString().split('T')[0],
    status: 'active'
  };
  
  res.json({
    success: true,
    message: 'Role created successfully',
    data: newRole
  });
});

router.delete('/rbac/roles/:roleId', (req, res) => {
  const { roleId } = req.params;
  
  res.json({
    success: true,
    message: 'Role deleted successfully',
    data: {
      roleId,
      deletedAt: new Date().toISOString()
    }
  });
});

router.post('/rbac/users/:userId/assign-role', (req, res) => {
  const { userId } = req.params;
  const { roleId } = req.body;
  
  res.json({
    success: true,
    message: 'Role assigned successfully',
    data: {
      userId,
      roleId,
      assignedAt: new Date().toISOString()
    }
  });
});

// Monitoring Routes
router.get('/monitoring/metrics', (req, res) => {
  const { timeRange = '1h' } = req.query;
  
  res.json({
    success: true,
    data: mockAdminData.monitoring.metrics
  });
});

router.get('/monitoring/services', (req, res) => {
  const { type, status } = req.query;
  
  let services = mockAdminData.monitoring.services;
  
  if (type && type !== 'all') {
    services = services.filter(service => service.type === type);
  }
  
  if (status && status !== 'all') {
    services = services.filter(service => service.status === status);
  }
  
  res.json({
    success: true,
    data: services
  });
});

router.get('/monitoring/alerts', (req, res) => {
  const { severity, service } = req.query;
  
  let alerts = mockAdminData.monitoring.alerts;
  
  if (severity && severity !== 'all') {
    alerts = alerts.filter(alert => alert.severity === severity);
  }
  
  if (service) {
    alerts = alerts.filter(alert => alert.service === service);
  }
  
  res.json({
    success: true,
    data: alerts
  });
});

router.post('/monitoring/services/:serviceId/restart', (req, res) => {
  const { serviceId } = req.params;
  
  res.json({
    success: true,
    message: 'Service restart initiated',
    data: {
      serviceId,
      status: 'restarting',
      restartedAt: new Date().toISOString()
    }
  });
});

router.post('/monitoring/alerts/:alertId/acknowledge', (req, res) => {
  const { alertId } = req.params;
  
  res.json({
    success: true,
    message: 'Alert acknowledged',
    data: {
      alertId,
      acknowledgedAt: new Date().toISOString()
    }
  });
});

router.post('/monitoring/alerts/:alertId/dismiss', (req, res) => {
  const { alertId } = req.params;
  
  res.json({
    success: true,
    message: 'Alert dismissed',
    data: {
      alertId,
      dismissedAt: new Date().toISOString()
    }
  });
});

// System Maintenance Routes
router.post('/maintenance/backup', (req, res) => {
  res.json({
    success: true,
    message: 'System backup initiated',
    data: {
      backupId: `backup_${Date.now()}`,
      status: 'running',
      startedAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    }
  });
});

router.post('/maintenance/cleanup', (req, res) => {
  const { type } = req.body;
  
  res.json({
    success: true,
    message: `${type} cleanup completed`,
    data: {
      type,
      itemsRemoved: Math.floor(Math.random() * 1000),
      spaceFreed: `${Math.floor(Math.random() * 500)}MB`,
      completedAt: new Date().toISOString()
    }
  });
});

router.post('/maintenance/restart', (req, res) => {
  const { service } = req.body;
  
  res.json({
    success: true,
    message: `${service} restart scheduled`,
    data: {
      service,
      scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      estimatedDowntime: '2-3 minutes'
    }
  });
});

module.exports = router;