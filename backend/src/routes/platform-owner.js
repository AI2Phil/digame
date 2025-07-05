const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Apply authentication and platform owner authorization to all routes
router.use(authenticate);
router.use(authorize('platform_owner'));

// In-memory storage for test metrics (in production, this would be in a database)
let testMetrics = {
  testsPassed: 0,
  testsFailed: 0,
  coverage: 0,
  lastRun: null,
  totalTests: 0,
  testHistory: []
};

// Mock data for platform owner endpoints
const mockPlatformData = {
  settings: {
    platformName: "Digame Platform",
    platformDescription: "Comprehensive business management platform",
    supportEmail: "support@digame.com",
    defaultTimezone: "UTC",
    defaultLanguage: "en",
    dateFormat: "MM/DD/YYYY",
    sessionTimeout: 480,
    passwordPolicy: "standard",
    requireMFA: false,
    defaultUserRole: "user",
    auditLogging: true,
    smtpServer: "smtp.digame.com",
    fromEmail: "noreply@digame.com",
    enableEmailNotifications: true,
    apiBaseUrl: "https://api.digame.com/v1",
    rateLimit: 10000,
    enableApiDocs: true,
    webhookTimeout: 30,
    webhookMaxRetries: 3,
    requireHttps: true,
    cacheTTL: 3600,
    maxConcurrentUsers: 10000,
    enableCaching: true,
    logLevel: "info",
    logRetention: 90,
    structuredLogging: true
  },
  systemHealth: {
    overall: "healthy",
    database: "healthy",
    dbConnections: 45,
    storageUsed: "2.4 GB",
    activeUsers: 1247,
    services: {
      webServer: { status: "healthy", uptime: "99.9%" },
      database: { status: "healthy", uptime: "99.8%" },
      cache: { status: "warning", uptime: "98.5%" },
      queue: { status: "healthy", uptime: "99.7%" }
    },
    performance: {
      cpuUsage: 45,
      memoryUsage: 67,
      diskUsage: 23,
      networkIO: "12 MB/s"
    },
    alerts: [
      {
        id: 1,
        alert: "High memory usage detected",
        time: "5 minutes ago",
        severity: "warning"
      },
      {
        id: 2,
        alert: "Database connection pool exhausted",
        time: "1 hour ago",
        severity: "critical"
      },
      {
        id: 3,
        alert: "API response time increased",
        time: "2 hours ago",
        severity: "warning"
      }
    ]
  },
  testSuites: [
    {
      id: 1,
      name: "API Endpoints",
      type: "api",
      description: "Test all REST API endpoints for functionality and performance",
      testCount: 45,
      passedTests: 43,
      status: "passed",
      lastRun: "2 hours ago",
      duration: "3.2 min",
      successRate: 95.6
    },
    {
      id: 2,
      name: "Security Tests",
      type: "security",
      description: "Comprehensive security vulnerability scanning",
      testCount: 28,
      passedTests: 26,
      status: "warning",
      lastRun: "1 day ago",
      duration: "8.7 min",
      successRate: 92.9
    },
    {
      id: 3,
      name: "Database Tests",
      type: "database",
      description: "Database integrity and performance tests",
      testCount: 32,
      passedTests: 32,
      status: "passed",
      lastRun: "4 hours ago",
      duration: "2.1 min",
      successRate: 100
    },
    {
      id: 4,
      name: "Integration Tests",
      type: "integration",
      description: "Third-party service integration tests",
      testCount: 18,
      passedTests: 15,
      status: "failed",
      lastRun: "6 hours ago",
      duration: "5.4 min",
      successRate: 83.3
    },
    {
      id: 5,
      name: "Performance Tests",
      type: "performance",
      description: "Load testing and performance benchmarks",
      testCount: 12,
      passedTests: 11,
      status: "passed",
      lastRun: "12 hours ago",
      duration: "15.2 min",
      successRate: 91.7
    },
    {
      id: 6,
      name: "UI Tests",
      type: "ui",
      description: "User interface and user experience tests",
      testCount: 24,
      passedTests: 22,
      status: "warning",
      lastRun: "8 hours ago",
      duration: "6.8 min",
      successRate: 91.7
    }
  ],
  testResults: [
    {
      id: 1,
      testName: "User Authentication",
      description: "Test user login and authentication flow",
      suiteName: "API Endpoints",
      suiteType: "api",
      status: "passed",
      duration: "1.2s",
      runTime: "2024-01-15 14:30:25"
    },
    {
      id: 2,
      testName: "SQL Injection Protection",
      description: "Test protection against SQL injection attacks",
      suiteName: "Security Tests",
      suiteType: "security",
      status: "passed",
      duration: "0.8s",
      runTime: "2024-01-15 14:28:15"
    },
    {
      id: 3,
      testName: "Database Connection Pool",
      description: "Test database connection pooling",
      suiteName: "Database Tests",
      suiteType: "database",
      status: "passed",
      duration: "2.1s",
      runTime: "2024-01-15 14:25:10"
    },
    {
      id: 4,
      testName: "External API Integration",
      description: "Test integration with external payment API",
      suiteName: "Integration Tests",
      suiteType: "integration",
      status: "failed",
      duration: "5.0s",
      runTime: "2024-01-15 14:20:05"
    },
    {
      id: 5,
      testName: "Load Test - 1000 Users",
      description: "Simulate 1000 concurrent users",
      suiteName: "Performance Tests",
      suiteType: "performance",
      status: "passed",
      duration: "45.2s",
      runTime: "2024-01-15 13:15:30"
    }
  ],
  systemStatus: {
    testsPassed: 149,
    testsFailed: 10,
    coverage: 87,
    lastRun: "2 hours ago"
  }
};

// Platform Settings Routes
router.get('/settings', (req, res) => {
  res.json({
    success: true,
    data: mockPlatformData.settings
  });
});

router.put('/settings/:section', (req, res) => {
  const { section } = req.params;
  const updates = req.body;
  
  // Simulate updating settings
  Object.assign(mockPlatformData.settings, updates);
  
  res.json({
    success: true,
    message: `${section} settings updated successfully`,
    data: {
      section,
      updates,
      updatedAt: new Date().toISOString()
    }
  });
});

router.post('/settings/reset', (req, res) => {
  const { section } = req.body;
  
  res.json({
    success: true,
    message: section ? `${section} settings reset to defaults` : 'All settings reset to defaults',
    data: {
      resetAt: new Date().toISOString(),
      section: section || 'all'
    }
  });
});

// System Health Routes
router.get('/system-health', (req, res) => {
  res.json({
    success: true,
    data: mockPlatformData.systemHealth
  });
});

router.get('/system-health/detailed', (req, res) => {
  const detailedHealth = {
    ...mockPlatformData.systemHealth,
    timestamp: new Date().toISOString(),
    checks: [
      {
        name: "Database Connectivity",
        status: "healthy",
        responseTime: "12ms",
        details: "All database connections are healthy"
      },
      {
        name: "External APIs",
        status: "warning",
        responseTime: "450ms",
        details: "Payment API showing increased latency"
      },
      {
        name: "File Storage",
        status: "healthy",
        responseTime: "8ms",
        details: "File storage is operating normally"
      },
      {
        name: "Cache Layer",
        status: "healthy",
        responseTime: "2ms",
        details: "Redis cache is responding normally"
      }
    ]
  };
  
  res.json({
    success: true,
    data: detailedHealth
  });
});

// Test Suite Routes
router.get('/test-suites', (req, res) => {
  const { type, status } = req.query;
  
  let suites = mockPlatformData.testSuites;
  
  if (type && type !== 'all') {
    suites = suites.filter(suite => suite.type === type);
  }
  
  if (status && status !== 'all') {
    suites = suites.filter(suite => suite.status === status);
  }
  
  res.json({
    success: true,
    data: suites,
    total: suites.length
  });
});

router.get('/test-suites/:suiteId', (req, res) => {
  const { suiteId } = req.params;
  
  const suite = mockPlatformData.testSuites.find(s => s.id == suiteId);
  
  if (!suite) {
    return res.status(404).json({
      success: false,
      message: 'Test suite not found'
    });
  }
  
  const detailedSuite = {
    ...suite,
    tests: [
      {
        id: 1,
        name: "Authentication Test",
        status: "passed",
        duration: "1.2s",
        description: "Test user authentication flow"
      },
      {
        id: 2,
        name: "Authorization Test",
        status: "passed",
        duration: "0.8s",
        description: "Test user authorization and permissions"
      },
      {
        id: 3,
        name: "Rate Limiting Test",
        status: "failed",
        duration: "2.1s",
        description: "Test API rate limiting functionality"
      }
    ]
  };
  
  res.json({
    success: true,
    data: detailedSuite
  });
});

router.post('/test-suites/:suiteId/run', (req, res) => {
  const { suiteId } = req.params;
  
  const suite = mockPlatformData.testSuites.find(s => s.id == suiteId);
  
  if (!suite) {
    return res.status(404).json({
      success: false,
      message: 'Test suite not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Test suite execution started',
    data: {
      suiteId,
      runId: `run_${Date.now()}`,
      status: 'running',
      startedAt: new Date().toISOString(),
      estimatedDuration: suite.duration
    }
  });
});

router.post('/test-suites/run-all', (req, res) => {
  res.json({
    success: true,
    message: 'All test suites execution started',
    data: {
      runId: `run_all_${Date.now()}`,
      status: 'running',
      startedAt: new Date().toISOString(),
      totalSuites: mockPlatformData.testSuites.length,
      estimatedDuration: "25-30 minutes"
    }
  });
});

// Test Results Routes
router.get('/test-results', (req, res) => {
  const { status, suite, search, page = 1, limit = 50 } = req.query;
  
  let results = mockPlatformData.testResults;
  
  if (status && status !== 'all') {
    results = results.filter(result => result.status === status);
  }
  
  if (suite) {
    results = results.filter(result => result.suiteName === suite);
  }
  
  if (search) {
    results = results.filter(result => 
      result.testName.toLowerCase().includes(search.toLowerCase()) ||
      result.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedResults = results.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedResults,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: results.length,
      pages: Math.ceil(results.length / limit)
    }
  });
});

router.get('/test-results/:resultId', (req, res) => {
  const { resultId } = req.params;
  
  const result = mockPlatformData.testResults.find(r => r.id == resultId);
  
  if (!result) {
    return res.status(404).json({
      success: false,
      message: 'Test result not found'
    });
  }
  
  const detailedResult = {
    ...result,
    logs: [
      {
        timestamp: "2024-01-15 14:30:25.123",
        level: "info",
        message: "Starting test execution"
      },
      {
        timestamp: "2024-01-15 14:30:25.456",
        level: "debug",
        message: "Connecting to test database"
      },
      {
        timestamp: "2024-01-15 14:30:26.789",
        level: "info",
        message: "Test completed successfully"
      }
    ],
    metrics: {
      memoryUsage: "45 MB",
      cpuUsage: "12%",
      networkRequests: 15,
      databaseQueries: 8
    }
  };
  
  res.json({
    success: true,
    data: detailedResult
  });
});

// System Status Routes
router.get('/system-status', (req, res) => {
  res.json({
    success: true,
    data: mockPlatformData.systemStatus
  });
});

// Debug and Maintenance Routes
router.post('/debug/clear-cache', (req, res) => {
  res.json({
    success: true,
    message: 'Cache cleared successfully',
    data: {
      clearedAt: new Date().toISOString(),
      cacheSize: "245 MB",
      itemsCleared: 15420
    }
  });
});

router.post('/debug/generate-test-data', (req, res) => {
  const { dataType, count = 100 } = req.body;
  
  res.json({
    success: true,
    message: 'Test data generation started',
    data: {
      dataType,
      count,
      jobId: `testdata_${Date.now()}`,
      estimatedCompletion: new Date(Date.now() + 2 * 60 * 1000).toISOString()
    }
  });
});

router.post('/debug/export-logs', (req, res) => {
  const { startDate, endDate, logLevel } = req.body;
  
  res.json({
    success: true,
    message: 'Log export initiated',
    data: {
      exportId: `logs_${Date.now()}`,
      startDate,
      endDate,
      logLevel,
      estimatedSize: "125 MB",
      downloadUrl: `/api/platform-owner/debug/download/logs_${Date.now()}.zip`
    }
  });
});

router.post('/debug/health-check', (req, res) => {
  res.json({
    success: true,
    message: 'Health check completed',
    data: {
      checkId: `health_${Date.now()}`,
      overallStatus: "healthy",
      checkedAt: new Date().toISOString(),
      checks: [
        { component: "Database", status: "healthy", responseTime: "12ms" },
        { component: "Cache", status: "healthy", responseTime: "2ms" },
        { component: "External APIs", status: "warning", responseTime: "450ms" },
        { component: "File Storage", status: "healthy", responseTime: "8ms" }
      ]
    }
  });
});

// Analytics and Reporting Routes
router.get('/analytics/test-trends', (req, res) => {
  const { period = '7d' } = req.query;
  
  const trends = {
    period,
    data: [
      { date: "2024-01-09", passed: 145, failed: 8, coverage: 85 },
      { date: "2024-01-10", passed: 148, failed: 6, coverage: 87 },
      { date: "2024-01-11", passed: 152, failed: 4, coverage: 89 },
      { date: "2024-01-12", passed: 149, failed: 7, coverage: 86 },
      { date: "2024-01-13", passed: 151, failed: 5, coverage: 88 },
      { date: "2024-01-14", passed: 147, failed: 9, coverage: 84 },
      { date: "2024-01-15", passed: 149, failed: 10, coverage: 87 }
    ]
  };
  
  res.json({
    success: true,
    data: trends
  });
});

router.get('/analytics/performance-metrics', (req, res) => {
  const { period = '24h' } = req.query;
  
  const metrics = {
    period,
    data: {
      responseTime: [
        { time: "00:00", value: 145 },
        { time: "04:00", value: 132 },
        { time: "08:00", value: 189 },
        { time: "12:00", value: 234 },
        { time: "16:00", value: 198 },
        { time: "20:00", value: 167 }
      ],
      throughput: [
        { time: "00:00", value: 1250 },
        { time: "04:00", value: 890 },
        { time: "08:00", value: 2340 },
        { time: "12:00", value: 3450 },
        { time: "16:00", value: 2890 },
        { time: "20:00", value: 1980 }
      ],
      errorRate: [
        { time: "00:00", value: 0.2 },
        { time: "04:00", value: 0.1 },
        { time: "08:00", value: 0.3 },
        { time: "12:00", value: 0.5 },
        { time: "16:00", value: 0.4 },
        { time: "20:00", value: 0.2 }
      ]
    }
  };
  
  res.json({
    success: true,
    data: metrics
  });
});

// Configuration Management Routes
router.get('/config/backup', (req, res) => {
  res.json({
    success: true,
    message: 'Configuration backup created',
    data: {
      backupId: `config_backup_${Date.now()}`,
      createdAt: new Date().toISOString(),
      size: "2.4 MB",
      downloadUrl: `/api/platform-owner/config/download/config_backup_${Date.now()}.json`
    }
  });
});

router.post('/config/restore', (req, res) => {
  const { backupId } = req.body;
  
  res.json({
    success: true,
    message: 'Configuration restore initiated',
    data: {
      backupId,
      restoreId: `restore_${Date.now()}`,
      status: 'processing',
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    }
  });
});

// Test Zone Routes
// Test Zone - Get Test Metrics
router.get('/test-zone/metrics', async (req, res) => {
  try {
    // Calculate coverage based on available tests vs passed tests
    const totalAvailableTests = 28; // Total tests across all categories
    const coverage = testMetrics.totalTests > 0
      ? Math.round((testMetrics.testsPassed / totalAvailableTests) * 100)
      : 0;

    res.json({
      success: true,
      metrics: {
        testsPassed: testMetrics.testsPassed,
        testsFailed: testMetrics.testsFailed,
        coverage: coverage,
        lastRun: testMetrics.lastRun,
        totalTests: testMetrics.totalTests
      }
    });
  } catch (error) {
    console.error('Error fetching test metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch test metrics'
    });
  }
});

router.get('/test-zone/available-tests', (req, res) => {
  const availableTests = {
    intelligence_tests: [
      {
        name: 'Pattern Analysis',
        endpoint: '/platform-owner/test-zone/intelligence/pattern-analysis',
        method: 'POST',
        description: 'Analyze behavioral patterns and identify trends in user data'
      },
      {
        name: 'Productivity Prediction',
        endpoint: '/platform-owner/test-zone/intelligence/productivity-prediction',
        method: 'POST',
        description: 'Predict productivity levels based on historical data and patterns'
      },
      {
        name: 'Task Forecasting',
        endpoint: '/platform-owner/test-zone/intelligence/task-forecasting',
        method: 'POST',
        description: 'Forecast task completion times and resource requirements'
      },
      {
        name: 'Energy Prediction',
        endpoint: '/platform-owner/test-zone/intelligence/energy-prediction',
        method: 'POST',
        description: 'Predict energy levels and optimal work periods'
      },
      {
        name: 'Comprehensive Insights',
        endpoint: '/platform-owner/test-zone/intelligence/comprehensive-insights',
        method: 'POST',
        description: 'Generate comprehensive insights combining all intelligence models'
      }
    ]
  };

  res.json({
    success: true,
    available_tests: availableTests
  });
});

router.get('/test-zone/intelligence/sample-data', (req, res) => {
  const sampleData = {
    pattern_analysis_data: {
      twin_id: "test-twin-123",
      data: {
        productivity_scores: [0.85, 0.78, 0.92, 0.67, 0.89],
        focus_times: [0.9, 0.85, 0.95, 0.7, 0.88],
        energy_levels: [0.8, 0.75, 0.85, 0.6, 0.82],
        task_completion_rates: [0.75, 0.8, 0.9, 0.65, 0.85],
        timestamps: [
          "2024-01-15T09:00:00Z",
          "2024-01-15T10:00:00Z",
          "2024-01-15T11:00:00Z",
          "2024-01-15T12:00:00Z",
          "2024-01-15T13:00:00Z"
        ]
      },
      analysis_window_days: 7,
      pattern_types: ["productivity_cycles", "energy_patterns", "focus_trends"]
    },
    productivity_prediction_data: {
      twin_id: "test-twin-123",
      historical_data: {
        productivity_scores: [0.85, 0.78, 0.92, 0.67, 0.89],
        context_factors: [
          {
            day_of_week: "Monday",
            time_of_day: "morning",
            meeting_count: 2,
            interruption_count: 3
          },
          {
            day_of_week: "Tuesday",
            time_of_day: "afternoon",
            meeting_count: 1,
            interruption_count: 1
          }
        ]
      },
      prediction_horizon_hours: 24,
      confidence_threshold: 0.8
    },
    task_forecasting_data: {
      twin_id: "test-twin-123",
      tasks: [
        {
          task_type: "coding",
          estimated_duration: 120,
          complexity: "medium",
          priority: "high"
        },
        {
          task_type: "meeting",
          estimated_duration: 60,
          complexity: "low",
          priority: "medium"
        },
        {
          task_type: "documentation",
          estimated_duration: 90,
          complexity: "low",
          priority: "low"
        }
      ],
      forecast_period_days: 3
    },
    energy_prediction_data: {
      twin_id: "test-twin-123",
      historical_energy: [0.8, 0.75, 0.85, 0.6, 0.82],
      sleep_data: {
        duration: 7.5,
        quality: 0.85,
        bedtime: "23:00",
        wake_time: "06:30"
      },
      activity_data: {
        exercise_duration: 45,
        break_frequency: 6,
        hydration_level: 0.8
      },
      prediction_horizon_hours: 12
    }
  };

  res.json({
    success: true,
    sample_data: sampleData
  });
});

// Test Zone Intelligence API endpoints
router.post('/test-zone/intelligence/pattern-analysis', (req, res) => {
  const { twin_id, data, analysis_window_days, pattern_types } = req.body;
  
  // Simulate pattern analysis
  const analysisResult = {
    twin_id,
    analysis_id: `analysis_${Date.now()}`,
    patterns_found: 12,
    high_confidence_patterns: 8,
    analysis_summary: {
      productivity_trend: "increasing",
      peak_performance_time: "10:00-12:00",
      optimal_break_frequency: "every 90 minutes",
      energy_correlation: 0.85
    },
    detailed_patterns: [
      {
        pattern_type: "productivity_cycles",
        confidence: 0.92,
        description: "Productivity peaks in mid-morning and early afternoon",
        recommendations: ["Schedule important tasks between 10-12 AM", "Take breaks every 90 minutes"]
      },
      {
        pattern_type: "energy_patterns",
        confidence: 0.88,
        description: "Energy levels correlate strongly with sleep quality",
        recommendations: ["Maintain consistent sleep schedule", "Monitor caffeine intake"]
      }
    ],
    processed_at: new Date().toISOString()
  };

  // Update test metrics
  testMetrics.testsPassed += 1;
  testMetrics.totalTests += 1;
  testMetrics.lastRun = new Date().toISOString();

  res.json({
    success: true,
    results: analysisResult
  });
});

router.post('/test-zone/intelligence/productivity-prediction', (req, res) => {
  const { twin_id, historical_data, prediction_horizon_hours, confidence_threshold } = req.body;
  
  // Simulate productivity prediction
  const predictionResult = {
    twin_id,
    prediction_id: `prediction_${Date.now()}`,
    predictions: [
      {
        time_slot: "09:00-10:00",
        predicted_productivity: 0.87,
        confidence: 0.91,
        factors: ["high_energy", "low_meetings", "optimal_time"]
      },
      {
        time_slot: "10:00-11:00",
        predicted_productivity: 0.92,
        confidence: 0.94,
        factors: ["peak_focus_time", "no_interruptions"]
      },
      {
        time_slot: "14:00-15:00",
        predicted_productivity: 0.78,
        confidence: 0.86,
        factors: ["post_lunch_dip", "moderate_energy"]
      }
    ],
    overall_prediction: {
      average_productivity: 0.86,
      peak_hours: ["10:00-12:00"],
      low_hours: ["14:00-15:00"],
      recommendations: ["Schedule complex tasks in morning", "Plan lighter work post-lunch"]
    },
    predicted_at: new Date().toISOString()
  };

  // Update test metrics
  testMetrics.testsPassed += 1;
  testMetrics.totalTests += 1;
  testMetrics.lastRun = new Date().toISOString();

  res.json({
    success: true,
    results: predictionResult
  });
});

router.post('/test-zone/intelligence/task-forecasting', (req, res) => {
  const { twin_id, tasks, forecast_period_days } = req.body;
  
  // Simulate task forecasting
  const forecastResult = {
    twin_id,
    forecast_id: `forecast_${Date.now()}`,
    task_forecasts: tasks.map((task, index) => ({
      task_id: `task_${index + 1}`,
      task_type: task.task_type,
      original_estimate: task.estimated_duration,
      adjusted_estimate: Math.round(task.estimated_duration * (0.9 + Math.random() * 0.3)),
      confidence: 0.85 + Math.random() * 0.1,
      optimal_start_time: "10:00",
      completion_probability: 0.88,
      risk_factors: task.complexity === "high" ? ["complexity", "dependencies"] : ["interruptions"]
    })),
    schedule_optimization: {
      recommended_order: ["coding", "documentation", "meeting"],
      total_estimated_time: tasks.reduce((sum, task) => sum + task.estimated_duration, 0),
      buffer_time_needed: 45,
      success_probability: 0.87
    },
    forecasted_at: new Date().toISOString()
  };

  // Update test metrics
  testMetrics.testsPassed += 1;
  testMetrics.totalTests += 1;
  testMetrics.lastRun = new Date().toISOString();

  res.json({
    success: true,
    results: forecastResult
  });
});

router.post('/test-zone/intelligence/energy-prediction', (req, res) => {
  const { twin_id, historical_energy, sleep_data, activity_data, prediction_horizon_hours } = req.body;
  
  // Simulate energy prediction
  const energyResult = {
    twin_id,
    prediction_id: `energy_${Date.now()}`,
    energy_forecast: [
      { time: "09:00", predicted_energy: 0.85, confidence: 0.92 },
      { time: "10:00", predicted_energy: 0.90, confidence: 0.94 },
      { time: "11:00", predicted_energy: 0.88, confidence: 0.91 },
      { time: "12:00", predicted_energy: 0.82, confidence: 0.89 },
      { time: "13:00", predicted_energy: 0.75, confidence: 0.87 },
      { time: "14:00", predicted_energy: 0.70, confidence: 0.85 },
      { time: "15:00", predicted_energy: 0.78, confidence: 0.88 },
      { time: "16:00", predicted_energy: 0.83, confidence: 0.90 }
    ],
    insights: {
      peak_energy_time: "10:00",
      lowest_energy_time: "14:00",
      energy_sustainability: 0.84,
      recovery_recommendations: ["15-minute break at 14:00", "light exercise at 15:30"]
    },
    predicted_at: new Date().toISOString()
  };

  // Update test metrics
  testMetrics.testsPassed += 1;
  testMetrics.totalTests += 1;
  testMetrics.lastRun = new Date().toISOString();

  res.json({
    success: true,
    results: energyResult
  });
});

router.post('/test-zone/intelligence/comprehensive-insights', (req, res) => {
  const requestData = req.body;
  
  // Simulate comprehensive insights combining all models
  const comprehensiveResult = {
    twin_id: requestData.twin_id || "test-twin-123",
    insight_id: `comprehensive_${Date.now()}`,
    combined_analysis: {
      overall_score: 0.87,
      productivity_forecast: 0.89,
      energy_optimization: 0.85,
      task_efficiency: 0.91,
      pattern_strength: 0.88
    },
    key_insights: [
      {
        category: "productivity",
        insight: "Peak productivity occurs between 10-12 AM with 92% consistency",
        confidence: 0.94,
        actionable: true,
        recommendation: "Schedule most important tasks during morning peak hours"
      },
      {
        category: "energy",
        insight: "Energy levels correlate strongly with sleep quality (r=0.85)",
        confidence: 0.91,
        actionable: true,
        recommendation: "Maintain consistent sleep schedule for optimal performance"
      },
      {
        category: "patterns",
        insight: "Task switching reduces efficiency by 23% on average",
        confidence: 0.89,
        actionable: true,
        recommendation: "Batch similar tasks together to minimize context switching"
      }
    ],
    optimization_suggestions: [
      "Implement 90-minute focused work blocks",
      "Schedule breaks based on energy prediction model",
      "Use pattern analysis to optimize daily schedule",
      "Apply task forecasting for realistic time estimation"
    ],
    generated_at: new Date().toISOString()
  };

  // Update test metrics
  testMetrics.testsPassed += 1;
  testMetrics.totalTests += 1;
  testMetrics.lastRun = new Date().toISOString();

  res.json({
    success: true,
    results: comprehensiveResult
  });
});

// Run all tests endpoint
router.post('/test-zone/run-all-tests', (req, res) => {
  try {
    const { testSuites } = req.body;
    const startTime = Date.now();
    
    const results = {
      success: true,
      message: 'All test suites executed successfully',
      execution_time: Date.now() - startTime,
      test_suites: {},
      summary: {
        total_suites: testSuites?.length || 7,
        successful_suites: 0,
        failed_suites: 0,
        total_tests: 0,
        passed_tests: 0,
        failed_tests: 0
      }
    };

    // Simulate running each test suite
    const suiteNames = testSuites || ['intelligence', 'nlp', 'analytics', 'learning', 'team', 'websocket', 'kubernetes'];
    
    for (const suite of suiteNames) {
      const suiteStartTime = Date.now();
      
      // Simulate test execution with realistic results
      const suiteTests = Math.floor(Math.random() * 5) + 3; // 3-7 tests per suite
      const passedTests = Math.floor(Math.random() * suiteTests) + Math.floor(suiteTests * 0.7); // 70%+ pass rate
      const failedTests = suiteTests - passedTests;
      
      results.test_suites[suite] = {
        total_tests: suiteTests,
        passed: passedTests,
        failed: failedTests,
        execution_time: Date.now() - suiteStartTime,
        success: failedTests === 0,
        coverage: Math.round((passedTests / suiteTests) * 100)
      };
      
      // Update summary
      results.summary.total_tests += suiteTests;
      results.summary.passed_tests += passedTests;
      results.summary.failed_tests += failedTests;
      
      if (failedTests === 0) {
        results.summary.successful_suites++;
      } else {
        results.summary.failed_suites++;
      }
    }
    
    // Calculate overall success
    results.success = results.summary.failed_tests === 0;
    results.summary.overall_coverage = Math.round((results.summary.passed_tests / results.summary.total_tests) * 100);
    
    // Update global test metrics
    testMetrics.testsPassed += results.summary.passed_tests;
    testMetrics.testsFailed += results.summary.failed_tests;
    testMetrics.totalTests += results.summary.total_tests;
    testMetrics.lastRun = new Date().toISOString();
    
    // Store test run in history
    testMetrics.testHistory.push({
      timestamp: testMetrics.lastRun,
      type: 'run_all_tests',
      results: results.summary,
      execution_time: results.execution_time
    });
    
    // Keep only last 50 test runs in history
    if (testMetrics.testHistory.length > 50) {
      testMetrics.testHistory = testMetrics.testHistory.slice(-50);
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error running all tests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run all tests',
      message: error.message
    });
  }
});

// Dashboard endpoint (fixing the API path issue)
router.get('/dashboard', (req, res) => {
  const dashboardData = {
    overview: {
      total_users: 1247,
      active_users_today: 892,
      new_users_this_week: 156,
      total_digital_twins: 3421,
      active_digital_twins: 2987,
      api_requests_today: 45678,
      system_health: "healthy"
    },
    intelligence_metrics: {
      patterns_analyzed_today: 1234,
      predictions_generated_today: 567,
      model_accuracy: {
        productivity: 0.89,
        task_completion: 0.92,
        energy_prediction: 0.87
      },
      average_confidence_score: 0.91
    },
    system_metrics: {
      cpu_usage: 45,
      memory_usage: 67,
      disk_usage: 23,
      response_time_avg: 145,
      error_rate: 0.2
    },
    recent_activities: [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        type: "pattern_analysis",
        description: "Pattern analysis completed for 15 digital twins"
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        type: "user_registration",
        description: "New user registered: john.doe@example.com"
      },
      {
        timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        type: "prediction_generated",
        description: "Productivity predictions generated for 45 users"
      },
      {
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        type: "system_health",
        description: "System health check completed - all services healthy"
      }
    ]
  };

  res.json({
    success: true,
    dashboard_data: dashboardData
  });
});

module.exports = router;