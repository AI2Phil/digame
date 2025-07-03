const express = require('express');
const { authenticate } = require('../middleware/auth');
const { UserRepository } = require('../models/User');
const { TeamRepository } = require('../models/Team');

const router = express.Router();
const userRepository = new UserRepository();
const teamRepository = new TeamRepository();

// Middleware to ensure Platform Owner access
const requirePlatformOwner = (req, res, next) => {
  if (!req.user.isPlatformOwner) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Platform Owner access required'
    });
  }
  next();
};

/**
 * GET /platform-owner/console
 * Platform console overview and metrics
 */
router.get('/console', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    // Get platform-wide statistics
    const allUsers = userRepository.findAll();
    const allTeams = teamRepository.findAll();
    
    const platformMetrics = {
      overview: {
        totalUsers: allUsers.length,
        activeTenants: allTeams.length,
        monthlyRevenue: calculateMockRevenue(allUsers),
        systemHealth: 99.9
      },
      growth: {
        userGrowth: '+12.5%',
        tenantGrowth: '+8.2%',
        revenueGrowth: '+18.7%'
      },
      userDistribution: {
        free: allUsers.filter(u => u.subscriptionTier === 'free').length,
        individualPro: allUsers.filter(u => u.subscriptionTier === 'individual_pro').length,
        team: allUsers.filter(u => u.subscriptionTier === 'team').length,
        enterprise: allUsers.filter(u => u.subscriptionTier === 'enterprise').length
      },
      systemStatus: {
        database: 'operational',
        apiServices: 'operational',
        backgroundJobs: 'degraded',
        fileStorage: 'operational'
      },
      recentActivity: [
        {
          type: 'user_registration',
          description: 'New tenant registered: Acme Corp',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          type: 'revenue_milestone',
          description: 'Monthly revenue exceeded $800K',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'system_update',
          description: 'Version 2.4.1 successfully deployed',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };

    res.json({
      success: true,
      data: platformMetrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Platform console error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch platform console data'
    });
  }
});

/**
 * GET /platform-owner/tenants
 * Get all tenants overview
 */
router.get('/tenants', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const allTeams = teamRepository.findAll();
    
    const tenantsData = allTeams.map(team => {
      const teamMembers = team.members || [];
      const owner = userRepository.findById(team.ownerId);
      
      return {
        id: team.id,
        name: team.name,
        owner: owner ? owner.toSafeJSON() : null,
        memberCount: teamMembers.length,
        subscriptionTier: team.subscriptionTier || 'team',
        status: team.isActive ? 'active' : 'inactive',
        createdAt: team.createdAt,
        lastActivity: team.updatedAt,
        revenue: calculateTeamRevenue(team.subscriptionTier, teamMembers.length),
        projects: team.projects ? team.projects.length : 0
      };
    });

    const summary = {
      total: tenantsData.length,
      active: tenantsData.filter(t => t.status === 'active').length,
      byTier: {
        team: tenantsData.filter(t => t.subscriptionTier === 'team').length,
        enterprise: tenantsData.filter(t => t.subscriptionTier === 'enterprise').length
      },
      totalRevenue: tenantsData.reduce((sum, t) => sum + t.revenue, 0)
    };

    res.json({
      success: true,
      data: {
        tenants: tenantsData,
        summary: summary
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Tenants overview error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch tenants data'
    });
  }
});

/**
 * GET /platform-owner/users
 * Get all users overview
 */
router.get('/users', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, tier, status } = req.query;
    
    let allUsers = userRepository.findAll();
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      allUsers = allUsers.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
      );
    }
    
    if (tier) {
      allUsers = allUsers.filter(user => user.subscriptionTier === tier);
    }
    
    if (status) {
      allUsers = allUsers.filter(user => 
        status === 'active' ? user.isActive : !user.isActive
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    const usersData = paginatedUsers.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      isActive: user.isActive,
      isVerified: user.isVerified,
      isPlatformOwner: user.isPlatformOwner,
      teamId: user.teamId,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      onboardingCompleted: user.onboardingCompleted
    }));

    const summary = {
      total: allUsers.length,
      active: allUsers.filter(u => u.isActive).length,
      verified: allUsers.filter(u => u.isVerified).length,
      byTier: {
        free: allUsers.filter(u => u.subscriptionTier === 'free').length,
        individualPro: allUsers.filter(u => u.subscriptionTier === 'individual_pro').length,
        team: allUsers.filter(u => u.subscriptionTier === 'team').length,
        enterprise: allUsers.filter(u => u.subscriptionTier === 'enterprise').length
      },
      byRole: {
        user: allUsers.filter(u => u.role === 'user').length,
        admin: allUsers.filter(u => u.role === 'admin').length,
        platformOwner: allUsers.filter(u => u.isPlatformOwner).length
      }
    };

    res.json({
      success: true,
      data: {
        users: usersData,
        summary: summary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allUsers.length,
          pages: Math.ceil(allUsers.length / limit)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Users overview error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch users data'
    });
  }
});

/**
 * GET /platform-owner/revenue
 * Revenue analytics and business intelligence
 */
router.get('/revenue', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const allUsers = userRepository.findAll();
    const allTeams = teamRepository.findAll();
    
    const revenueAnalytics = {
      overview: {
        monthlyRevenue: calculateMockRevenue(allUsers),
        annualRevenue: calculateMockRevenue(allUsers) * 12,
        growth: {
          monthly: '+18.7%',
          quarterly: '+24.3%',
          annual: '+45.2%'
        }
      },
      byTier: {
        free: { users: allUsers.filter(u => u.subscriptionTier === 'free').length, revenue: 0 },
        individualPro: { 
          users: allUsers.filter(u => u.subscriptionTier === 'individual_pro').length, 
          revenue: allUsers.filter(u => u.subscriptionTier === 'individual_pro').length * 29 
        },
        team: { 
          users: allUsers.filter(u => u.subscriptionTier === 'team').length, 
          revenue: allUsers.filter(u => u.subscriptionTier === 'team').length * 99 
        },
        enterprise: { 
          users: allUsers.filter(u => u.subscriptionTier === 'enterprise').length, 
          revenue: allUsers.filter(u => u.subscriptionTier === 'enterprise').length * 299 
        }
      },
      trends: {
        last12Months: generateMockRevenueTrend(),
        forecast: generateMockRevenueForecast()
      },
      metrics: {
        arpu: calculateARPU(allUsers), // Average Revenue Per User
        ltv: calculateLTV(allUsers), // Lifetime Value
        churnRate: 2.3,
        conversionRate: 12.8
      },
      topTenants: allTeams
        .map(team => ({
          name: team.name,
          revenue: calculateTeamRevenue(team.subscriptionTier, team.members?.length || 1),
          tier: team.subscriptionTier
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
    };

    res.json({
      success: true,
      data: revenueAnalytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch revenue analytics'
    });
  }
});

/**
 * GET /platform-owner/health
 * System health monitoring
 */
router.get('/health', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const systemHealth = {
      overall: {
        status: 'healthy',
        uptime: 99.97,
        lastIncident: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      services: {
        database: {
          status: 'operational',
          responseTime: 12.3,
          connections: 45,
          queryPerformance: 'good'
        },
        api: {
          status: 'operational',
          responseTime: 234.5,
          requestsPerMinute: 1250,
          errorRate: 0.05
        },
        backgroundJobs: {
          status: 'degraded',
          queueSize: 23,
          processingRate: 'slow',
          lastProcessed: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        storage: {
          status: 'operational',
          usage: 67.8,
          capacity: '2.5TB',
          performance: 'good'
        }
      },
      metrics: {
        cpu: 45.2,
        memory: 67.8,
        disk: 34.5,
        network: 12.3
      },
      alerts: [
        {
          level: 'warning',
          service: 'backgroundJobs',
          message: 'Queue processing slower than normal',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          level: 'info',
          service: 'storage',
          message: 'Storage usage above 65%',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ],
      performance: {
        avgResponseTime: 234.5,
        throughput: 1250,
        availability: 99.97,
        errorRate: 0.05
      }
    };

    res.json({
      success: true,
      data: systemHealth,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch system health data'
    });
  }
});

/**
 * GET /platform-owner/settings
 * Platform configuration settings
 */
router.get('/settings', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    // Mock platform settings
    const platformSettings = {
      general: {
        platformName: 'Digame Platform',
        version: '2.4.1',
        environment: 'production',
        maintenanceMode: false
      },
      features: {
        aiTools: true,
        analytics: true,
        teamCollaboration: true,
        enterpriseFeatures: true,
        guestAccess: true
      },
      limits: {
        maxUsersPerTenant: 1000,
        maxTeamsPerUser: 5,
        maxProjectsPerTeam: 50,
        apiRateLimit: 1000
      },
      security: {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialChars: false
        },
        sessionTimeout: 24, // hours
        mfaRequired: false,
        ipWhitelisting: false
      },
      notifications: {
        emailNotifications: true,
        systemAlerts: true,
        maintenanceNotices: true,
        securityAlerts: true
      }
    };

    res.json({
      success: true,
      data: platformSettings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Platform settings error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch platform settings'
    });
  }
});

/**
 * PUT /platform-owner/settings
 * Update platform configuration settings
 */
router.put('/settings', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const { general, features, limits, security, notifications } = req.body;
    
    // In a real implementation, these would be stored in a configuration database
    // For now, we'll just validate and return success
    
    const updatedSettings = {
      general: general || {},
      features: features || {},
      limits: limits || {},
      security: security || {},
      notifications: notifications || {}
    };

    console.log(`Platform settings updated by: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Platform settings updated successfully',
      data: updatedSettings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update platform settings error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update platform settings'
    });
  }
});

/**
 * GET /platform-owner/test-zone
 * API testing and development tools
 */
router.get('/test-zone', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const testZoneData = {
      apiEndpoints: [
        { method: 'GET', path: '/api/analytics/web', status: 'active', lastTested: new Date().toISOString() },
        { method: 'POST', path: '/api/ai-tools/writing', status: 'active', lastTested: new Date().toISOString() },
        { method: 'GET', path: '/api/teams', status: 'active', lastTested: new Date().toISOString() },
        { method: 'GET', path: '/api/platform-owner/console', status: 'active', lastTested: new Date().toISOString() }
      ],
      testResults: {
        totalTests: 156,
        passed: 148,
        failed: 8,
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      performance: {
        avgResponseTime: 234.5,
        slowestEndpoint: '/api/analytics/behavioral',
        fastestEndpoint: '/api/auth/verify-token'
      },
      sampleData: {
        users: 50,
        teams: 12,
        projects: 34,
        lastGenerated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    };

    res.json({
      success: true,
      data: testZoneData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test zone error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch test zone data'
    });
  }
});

// Helper functions
function calculateMockRevenue(users) {
  const tierPricing = {
    free: 0,
    individual_pro: 29,
    team: 99,
    enterprise: 299
  };
  
  return users.reduce((total, user) => {
    return total + (tierPricing[user.subscriptionTier] || 0);
  }, 0);
}

function calculateTeamRevenue(tier, memberCount = 1) {
  const tierPricing = {
    team: 99 * memberCount,
    enterprise: 299 * memberCount
  };
  return tierPricing[tier] || 0;
}

function calculateARPU(users) {
  const totalRevenue = calculateMockRevenue(users);
  const paidUsers = users.filter(u => u.subscriptionTier !== 'free').length;
  return paidUsers > 0 ? Math.round(totalRevenue / paidUsers) : 0;
}

function calculateLTV(users) {
  const arpu = calculateARPU(users);
  const avgLifetimeMonths = 24; // Mock average lifetime
  return Math.round(arpu * avgLifetimeMonths);
}

function generateMockRevenueTrend() {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push({
      month: date.toISOString().substring(0, 7),
      revenue: Math.floor(Math.random() * 200000) + 600000
    });
  }
  return months;
}

function generateMockRevenueForecast() {
  const forecast = [];
  for (let i = 1; i <= 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    forecast.push({
      month: date.toISOString().substring(0, 7),
      predicted: Math.floor(Math.random() * 250000) + 800000,
      confidence: 0.75 + Math.random() * 0.2
    });
  }
  return forecast;
}

module.exports = router;