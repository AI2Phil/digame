const express = require('express');
const router = express.Router();

// Mock data for security endpoints
const mockSecurityData = {
  overview: {
    securityScore: 87,
    activeThreats: 3,
    resolvedThreats: 156,
    lastScan: new Date().toISOString(),
    complianceStatus: 94,
    vulnerabilities: {
      critical: 0,
      high: 2,
      medium: 8,
      low: 15
    }
  },
  mfa: {
    overview: {
      mfaEnabled: true,
      totalUsers: 1247,
      mfaEnabledUsers: 1089,
      mfaCoverage: 87.3,
      methodsConfigured: 3,
      lastPolicyUpdate: new Date().toISOString(),
      securityScore: 92
    },
    methods: [
      {
        id: 1,
        name: "Authenticator App",
        type: "totp",
        enabled: true,
        users: 856,
        coverage: 68.7,
        reliability: 99.2,
        description: "Time-based one-time passwords via mobile apps"
      },
      {
        id: 2,
        name: "SMS Verification",
        type: "sms",
        enabled: true,
        users: 423,
        coverage: 33.9,
        reliability: 94.8,
        description: "Text message verification codes"
      }
    ]
  },
  accessControl: {
    overview: {
      totalUsers: 1247,
      activeUsers: 1089,
      roles: 8,
      permissions: 156,
      lastPolicyUpdate: new Date().toISOString(),
      accessViolations: 3,
      pendingRequests: 12
    },
    roles: [
      {
        id: 1,
        name: "Platform Owner",
        description: "Full platform access and control",
        users: 2,
        permissions: 156,
        level: "system"
      },
      {
        id: 2,
        name: "Administrator",
        description: "Administrative access to platform features",
        users: 8,
        permissions: 89,
        level: "admin"
      }
    ]
  },
  auditLogs: {
    overview: {
      totalLogs: 45672,
      todayLogs: 1234,
      criticalEvents: 8,
      warningEvents: 156,
      infoEvents: 1070,
      retentionPeriod: 365,
      storageUsed: "2.4 GB"
    },
    logs: [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        category: "Authentication",
        severity: "warning",
        event: "Failed Login Attempt",
        user: "john.doe@company.com",
        ipAddress: "192.168.1.100",
        location: "San Francisco, CA",
        details: "Multiple failed login attempts detected"
      }
    ]
  },
  compliance: {
    overview: {
      overallScore: 87,
      totalFrameworks: 6,
      compliantFrameworks: 4,
      pendingActions: 23,
      lastAssessment: new Date().toISOString(),
      nextAudit: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      certificationsActive: 8
    },
    frameworks: [
      {
        id: 1,
        name: "GDPR",
        fullName: "General Data Protection Regulation",
        description: "EU data protection and privacy regulation",
        status: "compliant",
        score: 94,
        requirements: 156,
        compliantRequirements: 147,
        pendingActions: 3,
        riskLevel: "low"
      },
      {
        id: 2,
        name: "SOX",
        fullName: "Sarbanes-Oxley Act",
        description: "Financial reporting and corporate governance",
        status: "compliant",
        score: 91,
        requirements: 89,
        compliantRequirements: 81,
        pendingActions: 2,
        riskLevel: "low"
      }
    ]
  }
};

// Security Overview Routes
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    data: mockSecurityData.overview
  });
});

router.post('/scan', (req, res) => {
  res.json({
    success: true,
    message: 'Security scan initiated',
    data: {
      scanId: `scan_${Date.now()}`,
      status: 'running',
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    }
  });
});

// Multi-Factor Authentication Routes
router.get('/mfa/overview', (req, res) => {
  res.json({
    success: true,
    data: mockSecurityData.mfa.overview
  });
});

router.get('/mfa/methods', (req, res) => {
  res.json({
    success: true,
    data: mockSecurityData.mfa.methods
  });
});

router.post('/mfa/methods/:methodId/toggle', (req, res) => {
  const { methodId } = req.params;
  
  res.json({
    success: true,
    message: 'MFA method status updated',
    data: {
      methodId,
      enabled: !mockSecurityData.mfa.methods.find(m => m.id == methodId)?.enabled,
      updatedAt: new Date().toISOString()
    }
  });
});

router.post('/mfa/policies', (req, res) => {
  const { enforcementLevel, gracePeriod, backupMethods } = req.body;
  
  res.json({
    success: true,
    message: 'MFA policies updated',
    data: {
      enforcementLevel,
      gracePeriod,
      backupMethods,
      updatedAt: new Date().toISOString()
    }
  });
});

router.post('/mfa/backup-codes/generate', (req, res) => {
  const backupCodes = Array.from({ length: 8 }, () => 
    Math.random().toString(36).substr(2, 4).toUpperCase() + '-' +
    Math.random().toString(36).substr(2, 4).toUpperCase() + '-' +
    Math.random().toString(36).substr(2, 4).toUpperCase()
  );
  
  res.json({
    success: true,
    message: 'Backup codes generated',
    data: {
      codes: backupCodes,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

// Individual MFA User Management Routes (for E2E tests)
router.get('/mfa/status', (req, res) => {
  // Mock user MFA status
  const userMfaStatus = {
    mfa_enabled: false,
    methods: [
      {
        id: 'totp_1',
        type: 'totp',
        name: 'Authenticator App',
        description: 'Time-based one-time passwords via mobile apps',
        icon: 'smartphone',
        enabled: false,
        primary: false,
        created_at: new Date().toISOString(),
        last_used: null
      },
      {
        id: 'sms_1',
        type: 'sms',
        name: 'SMS Verification',
        description: 'Text message verification codes',
        icon: 'mail',
        enabled: false,
        primary: false,
        created_at: null,
        last_used: null
      }
    ]
  };

  res.json({
    success: true,
    data: userMfaStatus
  });
});

router.get('/mfa/stats', (req, res) => {
  // Mock MFA statistics for organization
  const mfaStats = {
    total_users: 1247,
    mfa_enabled_users: 1089,
    adoption_rate: 87.3,
    method_distribution: {
      totp: 856,
      sms: 423,
      email: 210
    }
  };

  res.json({
    success: true,
    data: mfaStats
  });
});

router.post('/mfa/setup', (req, res) => {
  const { method, phone_number, recovery_email } = req.body;
  
  // Mock MFA setup response
  const setupResponse = {
    method,
    qr_code_url: method === 'totp' ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' : null,
    secret_key: method === 'totp' ? 'JBSWY3DPEHPK3PXP' : null,
    backup_codes: [
      'ABCD-1234-EFGH',
      'IJKL-5678-MNOP',
      'QRST-9012-UVWX',
      'YZAB-3456-CDEF',
      'GHIJ-7890-KLMN',
      'OPQR-1234-STUV',
      'WXYZ-5678-ABCD',
      'EFGH-9012-IJKL'
    ],
    recovery_email,
    phone_number
  };

  res.json({
    success: true,
    message: 'MFA setup initiated successfully',
    data: setupResponse
  });
});

router.post('/mfa/verify', (req, res) => {
  const { code, method } = req.body;
  
  // Mock verification - accept any 6-digit code for testing
  if (!code || code.length !== 6) {
    return res.status(400).json({
      success: false,
      detail: 'Invalid verification code format'
    });
  }

  // For testing, accept specific codes or any 6-digit number
  const validCodes = ['123456', '654321', '000000'];
  if (!validCodes.includes(code) && !/^\d{6}$/.test(code)) {
    return res.status(400).json({
      success: false,
      detail: 'Invalid verification code'
    });
  }

  res.json({
    success: true,
    message: 'MFA verified successfully',
    data: {
      method,
      verified_at: new Date().toISOString(),
      backup_codes: [
        'ABCD-1234-EFGH',
        'IJKL-5678-MNOP',
        'QRST-9012-UVWX',
        'YZAB-3456-CDEF',
        'GHIJ-7890-KLMN',
        'OPQR-1234-STUV',
        'WXYZ-5678-ABCD',
        'EFGH-9012-IJKL'
      ]
    }
  });
});

router.post('/mfa/disable/:methodId', (req, res) => {
  const { methodId } = req.params;
  
  res.json({
    success: true,
    message: 'MFA method disabled successfully',
    data: {
      method_id: methodId,
      disabled_at: new Date().toISOString()
    }
  });
});

// Security Dashboard API (for E2E tests)
router.get('/dashboard', (req, res) => {
  const dashboardData = {
    security_score: 87,
    security_metrics: {
      active_threats: 3,
      resolved_threats: 156,
      vulnerability_count: 25,
      compliance_score: 94,
      mfa_adoption: 87.3,
      last_scan: new Date().toISOString()
    },
    total_users: 1247,
    active_users: 1089,
    mfa_enabled_users: 1089,
    active_sessions: 234,
    recent_activities: [
      {
        id: 1,
        type: 'login',
        user: 'john.doe@company.com',
        timestamp: new Date().toISOString(),
        ip_address: '192.168.1.100'
      }
    ]
  };

  res.json({
    success: true,
    data: dashboardData
  });
});

// Access Control Routes
router.get('/access/overview', (req, res) => {
  res.json({
    success: true,
    data: mockSecurityData.accessControl.overview
  });
});

router.get('/access/roles', (req, res) => {
  const { level, search } = req.query;
  
  let roles = mockSecurityData.accessControl.roles;
  
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

router.post('/access/roles', (req, res) => {
  const { name, description, level, permissions } = req.body;
  
  const newRole = {
    id: Date.now(),
    name,
    description,
    level,
    permissions: permissions || [],
    users: 0,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Role created successfully',
    data: newRole
  });
});

router.put('/access/roles/:roleId', (req, res) => {
  const { roleId } = req.params;
  const { name, description, permissions } = req.body;
  
  res.json({
    success: true,
    message: 'Role updated successfully',
    data: {
      roleId,
      name,
      description,
      permissions,
      lastModified: new Date().toISOString()
    }
  });
});

router.delete('/access/roles/:roleId', (req, res) => {
  const { roleId } = req.params;
  
  res.json({
    success: true,
    message: 'Role deleted successfully',
    data: { roleId }
  });
});

router.get('/access/permissions', (req, res) => {
  const permissions = [
    {
      id: 1,
      name: "user.create",
      description: "Create new users",
      category: "User Management",
      level: "admin",
      riskLevel: "high"
    },
    {
      id: 2,
      name: "user.read",
      description: "View user information",
      category: "User Management",
      level: "user",
      riskLevel: "low"
    }
  ];
  
  res.json({
    success: true,
    data: permissions
  });
});

router.get('/access/requests', (req, res) => {
  const requests = [
    {
      id: 1,
      user: "john.doe@company.com",
      requestedRole: "Team Lead",
      currentRole: "Developer",
      reason: "Promotion to team leadership position",
      requestedAt: new Date().toISOString(),
      status: "pending",
      priority: "medium"
    }
  ];
  
  res.json({
    success: true,
    data: requests
  });
});

router.post('/access/requests/:requestId/approve', (req, res) => {
  const { requestId } = req.params;
  
  res.json({
    success: true,
    message: 'Access request approved',
    data: {
      requestId,
      status: 'approved',
      approvedAt: new Date().toISOString()
    }
  });
});

router.post('/access/requests/:requestId/deny', (req, res) => {
  const { requestId } = req.params;
  const { reason } = req.body;
  
  res.json({
    success: true,
    message: 'Access request denied',
    data: {
      requestId,
      status: 'denied',
      reason,
      deniedAt: new Date().toISOString()
    }
  });
});

// Audit Logs Routes
router.get('/audit/overview', (req, res) => {
  res.json({
    success: true,
    data: mockSecurityData.auditLogs.overview
  });
});

router.get('/audit/logs', (req, res) => {
  const { 
    category, 
    severity, 
    dateRange, 
    search, 
    page = 1, 
    limit = 50 
  } = req.query;
  
  let logs = mockSecurityData.auditLogs.logs;
  
  // Apply filters
  if (category && category !== 'all') {
    logs = logs.filter(log => log.category === category);
  }
  
  if (severity && severity !== 'all') {
    logs = logs.filter(log => log.severity === severity);
  }
  
  if (search) {
    logs = logs.filter(log => 
      log.event.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedLogs = logs.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedLogs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: logs.length,
      pages: Math.ceil(logs.length / limit)
    }
  });
});

router.get('/audit/logs/:logId', (req, res) => {
  const { logId } = req.params;
  
  const log = mockSecurityData.auditLogs.logs.find(l => l.id == logId);
  
  if (!log) {
    return res.status(404).json({
      success: false,
      message: 'Log entry not found'
    });
  }
  
  res.json({
    success: true,
    data: log
  });
});

router.post('/audit/export', (req, res) => {
  const { format, dateRange, categories } = req.body;
  
  res.json({
    success: true,
    message: 'Audit log export initiated',
    data: {
      exportId: `export_${Date.now()}`,
      format,
      status: 'processing',
      estimatedCompletion: new Date(Date.now() + 2 * 60 * 1000).toISOString()
    }
  });
});

router.get('/audit/analytics', (req, res) => {
  const analytics = {
    categories: [
      { name: "Authentication", count: 15420, percentage: 33.8 },
      { name: "Access Control", count: 12340, percentage: 27.0 },
      { name: "Data Access", count: 8950, percentage: 19.6 }
    ],
    timeDistribution: {
      "00-06": 234,
      "06-12": 1890,
      "12-18": 2340,
      "18-24": 1456
    },
    riskDistribution: {
      low: 3456,
      medium: 1234,
      high: 567,
      critical: 89
    }
  };
  
  res.json({
    success: true,
    data: analytics
  });
});

// Compliance Routes
router.get('/compliance/overview', (req, res) => {
  res.json({
    success: true,
    data: mockSecurityData.compliance.overview
  });
});

router.get('/compliance/frameworks', (req, res) => {
  const { status, region, mandatory } = req.query;
  
  let frameworks = mockSecurityData.compliance.frameworks;
  
  if (status && status !== 'all') {
    frameworks = frameworks.filter(f => f.status === status);
  }
  
  if (region) {
    frameworks = frameworks.filter(f => f.region === region);
  }
  
  if (mandatory !== undefined) {
    frameworks = frameworks.filter(f => f.mandatory === (mandatory === 'true'));
  }
  
  res.json({
    success: true,
    data: frameworks,
    total: frameworks.length
  });
});

router.get('/compliance/frameworks/:frameworkId', (req, res) => {
  const { frameworkId } = req.params;
  
  const framework = mockSecurityData.compliance.frameworks.find(f => f.id == frameworkId);
  
  if (!framework) {
    return res.status(404).json({
      success: false,
      message: 'Framework not found'
    });
  }
  
  res.json({
    success: true,
    data: framework
  });
});

router.post('/compliance/frameworks/:frameworkId/assess', (req, res) => {
  const { frameworkId } = req.params;
  
  res.json({
    success: true,
    message: 'Compliance assessment initiated',
    data: {
      frameworkId,
      assessmentId: `assessment_${Date.now()}`,
      status: 'running',
      estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    }
  });
});

router.post('/compliance/frameworks/:frameworkId/report', (req, res) => {
  const { frameworkId } = req.params;
  const { type = 'standard' } = req.body;
  
  res.json({
    success: true,
    message: 'Compliance report generation initiated',
    data: {
      frameworkId,
      reportId: `report_${Date.now()}`,
      type,
      status: 'generating',
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    }
  });
});

router.get('/compliance/actions', (req, res) => {
  const { framework, priority, status } = req.query;
  
  const actions = [
    {
      id: 1,
      framework: "PCI DSS",
      title: "Implement Network Segmentation",
      description: "Isolate cardholder data environment from other networks",
      priority: "high",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: "Security Team",
      status: "in_progress",
      estimatedEffort: "40 hours"
    }
  ];
  
  let filteredActions = actions;
  
  if (framework) {
    filteredActions = filteredActions.filter(a => a.framework === framework);
  }
  
  if (priority) {
    filteredActions = filteredActions.filter(a => a.priority === priority);
  }
  
  if (status) {
    filteredActions = filteredActions.filter(a => a.status === status);
  }
  
  res.json({
    success: true,
    data: filteredActions
  });
});

router.put('/compliance/actions/:actionId', (req, res) => {
  const { actionId } = req.params;
  const { status, notes } = req.body;
  
  res.json({
    success: true,
    message: 'Compliance action updated',
    data: {
      actionId,
      status,
      notes,
      updatedAt: new Date().toISOString()
    }
  });
});

router.get('/compliance/reports', (req, res) => {
  const reports = [
    {
      id: 1,
      name: "GDPR Compliance Report Q1 2024",
      framework: "GDPR",
      type: "quarterly",
      generatedDate: new Date().toISOString(),
      status: "completed",
      score: 94,
      fileSize: "2.4 MB"
    }
  ];
  
  res.json({
    success: true,
    data: reports
  });
});

router.get('/compliance/analytics', (req, res) => {
  const analytics = {
    complianceHistory: [
      { month: "Jan", score: 82 },
      { month: "Feb", score: 85 },
      { month: "Mar", score: 87 }
    ],
    frameworkScores: [
      { framework: "GDPR", score: 94, trend: "up" },
      { framework: "SOX", score: 91, trend: "stable" },
      { framework: "ISO 27001", score: 89, trend: "up" }
    ],
    riskDistribution: {
      low: 4,
      medium: 2,
      high: 1,
      critical: 0
    }
  };
  
  res.json({
    success: true,
    data: analytics
  });
});

module.exports = router;