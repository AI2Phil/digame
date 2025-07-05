const express = require('express');
const { authenticate } = require('../middleware/auth');
const MockDataService = require('../services/mockDataService');
const BackupService = require('../services/backupService');
const DataHealthMonitor = require('../services/dataHealthMonitor');
const PerformanceOptimizer = require('../services/performanceOptimizer');
const database = require('../services/database');

const router = express.Router();

// Initialize services
const mockDataService = new MockDataService(database.db);
const backupService = new BackupService(database.db);
const healthMonitor = new DataHealthMonitor(database.db);
const performanceOptimizer = new PerformanceOptimizer(database.db);

/**
 * Middleware to check Platform Owner access
 */
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
 * GET /data-management/overview
 * Get comprehensive data statistics and health metrics
 */
router.get('/overview', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const statistics = await mockDataService.getDataStatistics();
    
    // Calculate summary metrics
    const totalRecords = Object.values(statistics.total).reduce((sum, count) => sum + count, 0);
    const totalMockRecords = Object.values(statistics.mock).reduce((sum, count) => sum + count, 0);
    const totalRealRecords = Object.values(statistics.real).reduce((sum, count) => sum + count, 0);
    
    const mockPercentage = totalRecords > 0 ? ((totalMockRecords / totalRecords) * 100).toFixed(1) : 0;
    
    // Get recent operations
    const recentOperations = database.db.prepare(`
      SELECT * FROM data_management_operations 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all();

    // Parse JSON fields
    recentOperations.forEach(op => {
      try {
        op.entity_types = JSON.parse(op.entity_types || '[]');
        op.metadata = JSON.parse(op.metadata || '{}');
      } catch (error) {
        op.entity_types = [];
        op.metadata = {};
      }
    });

    const overview = {
      summary: {
        totalRecords,
        mockRecords: totalMockRecords,
        realRecords: totalRealRecords,
        mockPercentage: parseFloat(mockPercentage)
      },
      statistics,
      recentOperations,
      healthMetrics: {
        dataIntegrity: totalRecords > 0 ? 'healthy' : 'warning',
        mockDataRatio: parseFloat(mockPercentage),
        lastOperation: recentOperations[0]?.created_at || null
      }
    };

    res.json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Data overview error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch data overview'
    });
  }
});

/**
 * GET /data-management/statistics
 * Get detailed data statistics
 */
router.get('/statistics', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const statistics = await mockDataService.getDataStatistics();

    res.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Data statistics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch data statistics'
    });
  }
});

/**
 * POST /data-management/seed
 * Seed database with mock data
 */
router.post('/seed', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const {
      userCount = 50,
      teamCount = 10,
      projectCount = 25,
      taskCount = 200,
      analyticsEventCount = 1000,
      category = 'demo'
    } = req.body;

    const result = await mockDataService.generateMockData({
      userCount,
      teamCount,
      projectCount,
      taskCount,
      analyticsEventCount,
      category
    });

    res.json({
      success: true,
      data: result,
      message: `Successfully generated ${result.totalRecords} mock records`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mock data seeding error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to seed mock data',
      details: error.message
    });
  }
});

/**
 * POST /data-management/cleanup
 * Remove mock data or data by criteria
 */
router.post('/cleanup', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const {
      categories = ['demo', 'test', 'development'],
      tables = null,
      dryRun = false
    } = req.body;

    const result = await mockDataService.cleanupMockData({
      categories,
      tables,
      dryRun
    });

    res.json({
      success: true,
      data: result,
      message: dryRun 
        ? `Dry run: Would delete ${result.totalDeleted} records`
        : `Successfully deleted ${result.totalDeleted} mock records`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Data cleanup error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to cleanup data',
      details: error.message
    });
  }
});

/**
 * POST /data-management/reset
 * Complete data reset (nuclear option)
 */
router.post('/reset', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const { confirmationCode, preserveUsers = true } = req.body;

    // Require confirmation code for safety
    if (confirmationCode !== 'RESET_ALL_DATA') {
      return res.status(400).json({
        error: 'Invalid confirmation',
        message: 'Confirmation code required for data reset'
      });
    }

    const allTables = [
      'notifications', 'notification_settings', 'tasks', 'projects',
      'teams', 'team_members', 'skills', 'user_skills', 'mentorship_relationships',
      'workflows', 'analytics_events', 'audit_logs', 'api_keys', 'webhooks',
      'reports', 'platform_metrics', 'tenants'
    ];

    // Add users to reset list if not preserving
    if (!preserveUsers) {
      allTables.unshift('users');
    }

    const result = await mockDataService.cleanupMockData({
      categories: ['demo', 'test', 'development', 'production'], // All categories
      tables: allTables,
      dryRun: false
    });

    res.json({
      success: true,
      data: result,
      message: `Data reset completed. Deleted ${result.totalDeleted} records.`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Data reset error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to reset data',
      details: error.message
    });
  }
});

/**
 * GET /data-management/operations
 * Get data management operation history
 */
router.get('/operations', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status = null } = req.query;

    let query = 'SELECT * FROM data_management_operations';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const operations = database.db.prepare(query).all(...params);

    // Parse JSON fields
    operations.forEach(op => {
      try {
        op.entity_types = JSON.parse(op.entity_types || '[]');
        op.metadata = JSON.parse(op.metadata || '{}');
      } catch (error) {
        op.entity_types = [];
        op.metadata = {};
      }
    });

    // Get total count
    const countQuery = status 
      ? 'SELECT COUNT(*) as total FROM data_management_operations WHERE status = ?'
      : 'SELECT COUNT(*) as total FROM data_management_operations';
    const countParams = status ? [status] : [];
    const { total } = database.db.prepare(countQuery).get(...countParams);

    res.json({
      success: true,
      data: {
        operations,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Operations history error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch operations history'
    });
  }
});

/**
 * GET /data-management/backups
 * Get backup history and management
 */
router.get('/backups', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const backups = database.db.prepare(`
      SELECT * FROM data_backups 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all();

    // Parse JSON fields
    backups.forEach(backup => {
      try {
        backup.entity_counts = JSON.parse(backup.entity_counts || '{}');
      } catch (error) {
        backup.entity_counts = {};
      }
    });

    res.json({
      success: true,
      data: { backups },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Backups error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch backup history'
    });
  }
});

/**
 * POST /data-management/export
 * Export data for backup
 */
router.post('/export', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const { tables = null, format = 'json', includeSchema = true } = req.body;

    // This is a simplified export - in production, you'd want more robust export functionality
    const allTables = [
      'users', 'notifications', 'notification_settings', 'tasks', 'projects',
      'teams', 'team_members', 'skills', 'user_skills', 'mentorship_relationships',
      'workflows', 'analytics_events', 'audit_logs', 'api_keys', 'webhooks',
      'reports', 'platform_metrics', 'tenants'
    ];

    const tablesToExport = tables || allTables;
    const exportData = {};

    for (const table of tablesToExport) {
      try {
        const data = database.db.prepare(`SELECT * FROM ${table}`).all();
        exportData[table] = data;
      } catch (error) {
        console.warn(`Error exporting ${table}:`, error.message);
        exportData[table] = [];
      }
    }

    const exportResult = {
      timestamp: new Date().toISOString(),
      format,
      includeSchema,
      tables: tablesToExport,
      data: exportData,
      recordCounts: Object.keys(exportData).reduce((acc, table) => {
        acc[table] = exportData[table].length;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: exportResult,
      message: `Exported data from ${tablesToExport.length} tables`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to export data',
      details: error.message
    });
  }
});

/**
 * GET /data-management/health
 * Get data health metrics
 */
router.get('/health', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const statistics = await mockDataService.getDataStatistics();
    
    const totalRecords = Object.values(statistics.total).reduce((sum, count) => sum + count, 0);
    const totalMockRecords = Object.values(statistics.mock).reduce((sum, count) => sum + count, 0);
    
    // Check for data integrity issues
    const healthChecks = {
      dataExists: totalRecords > 0,
      mockDataFlagged: totalMockRecords > 0,
      balancedData: totalMockRecords < totalRecords * 0.9, // Less than 90% mock data
      recentActivity: true // Would check for recent operations
    };

    const healthScore = Object.values(healthChecks).filter(Boolean).length / Object.keys(healthChecks).length;
    const healthStatus = healthScore >= 0.8 ? 'healthy' : healthScore >= 0.6 ? 'warning' : 'critical';

    res.json({
      success: true,
      data: {
        healthStatus,
        healthScore: Math.round(healthScore * 100),
        healthChecks,
        statistics: {
          totalRecords,
          mockRecords: totalMockRecords,
          realRecords: totalRecords - totalMockRecords,
          mockPercentage: totalRecords > 0 ? ((totalMockRecords / totalRecords) * 100).toFixed(1) : 0
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Data health error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to check data health'
    });
  }
});

/**
 * POST /data-management/backup/create
 * Create a comprehensive backup
 */
router.post('/backup/create', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const {
      name,
      description,
      includeFiles = false,
      compression = 'gzip',
      encryption = false
    } = req.body;

    const result = await backupService.createBackup({
      name: name || `Backup_${new Date().toISOString().split('T')[0]}`,
      description: description || 'Manual backup created via API',
      includeFiles,
      compression,
      encryption
    });

    res.json({
      success: true,
      data: result,
      message: `Backup created successfully: ${result.backup_id}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Backup creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create backup',
      details: error.message
    });
  }
});

/**
 * POST /data-management/backup/restore
 * Restore from a backup
 */
router.post('/backup/restore', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const { backupId, confirmationCode, options = {} } = req.body;

    // Require confirmation code for safety
    if (confirmationCode !== 'RESTORE_FROM_BACKUP') {
      return res.status(400).json({
        error: 'Invalid confirmation',
        message: 'Confirmation code required for backup restoration'
      });
    }

    const result = await backupService.restoreBackup(backupId, options);

    res.json({
      success: true,
      data: result,
      message: `Backup restored successfully from ${backupId}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Backup restoration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to restore backup',
      details: error.message
    });
  }
});

/**
 * GET /data-management/backup/schedule
 * Get backup schedule configuration
 */
router.get('/backup/schedule', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const schedule = await backupService.getBackupSchedule();

    res.json({
      success: true,
      data: schedule,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Backup schedule error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get backup schedule'
    });
  }
});

/**
 * POST /data-management/backup/schedule
 * Configure backup schedule
 */
router.post('/backup/schedule', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const { enabled, frequency, retentionDays, options } = req.body;

    const result = await backupService.configureSchedule({
      enabled: enabled !== false,
      frequency: frequency || 'daily',
      retentionDays: retentionDays || 30,
      options: options || {}
    });

    res.json({
      success: true,
      data: result,
      message: 'Backup schedule configured successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Backup schedule configuration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to configure backup schedule',
      details: error.message
    });
  }
});

/**
 * GET /data-management/health/comprehensive
 * Get comprehensive health check report
 */
router.get('/health/comprehensive', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const healthReport = await healthMonitor.performHealthCheck();

    res.json({
      success: true,
      data: healthReport,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Comprehensive health check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to perform comprehensive health check',
      details: error.message
    });
  }
});

/**
 * GET /data-management/health/trends
 * Get health trends over time
 */
router.get('/health/trends', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const trends = await healthMonitor.getHealthTrends(parseInt(days));

    res.json({
      success: true,
      data: trends,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health trends error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get health trends'
    });
  }
});

/**
 * POST /data-management/performance/optimize
 * Optimize database performance
 */
router.post('/performance/optimize', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const { includeIndexes = true, vacuum = false } = req.body;
    const results = {};

    if (includeIndexes) {
      results.indexOptimization = await performanceOptimizer.optimizeIndexes();
    }

    if (vacuum) {
      results.vacuum = await performanceOptimizer.vacuumDatabase();
    }

    res.json({
      success: true,
      data: results,
      message: 'Performance optimization completed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Performance optimization error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to optimize performance',
      details: error.message
    });
  }
});

/**
 * GET /data-management/performance/metrics
 * Get performance metrics
 */
router.get('/performance/metrics', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const metrics = performanceOptimizer.getPerformanceMetrics();

    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get performance metrics'
    });
  }
});

/**
 * POST /data-management/performance/cache/clear
 * Clear performance cache
 */
router.post('/performance/cache/clear', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    performanceOptimizer.clearCache();

    res.json({
      success: true,
      message: 'Performance cache cleared successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to clear cache'
    });
  }
});

/**
 * POST /data-management/batch/insert
 * Perform batch insert operation
 */
router.post('/batch/insert', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const { tableName, records, batchSize } = req.body;

    if (!tableName || !records || !Array.isArray(records)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'tableName and records array are required'
      });
    }

    const result = await performanceOptimizer.batchInsert(tableName, records, {
      batchSize: batchSize || 1000
    });

    res.json({
      success: true,
      data: result,
      message: `Batch insert completed: ${result.inserted} records`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch insert error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to perform batch insert',
      details: error.message
    });
  }
});

/**
 * GET /data-management/query/paginated
 * Execute paginated query
 */
router.get('/query/paginated', authenticate, requirePlatformOwner, async (req, res) => {
  try {
    const {
      table,
      page = 1,
      pageSize = 100,
      orderBy = 'id',
      orderDirection = 'ASC',
      where = null
    } = req.query;

    if (!table) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'table parameter is required'
      });
    }

    let sql = `SELECT * FROM ${table}`;
    const params = [];

    if (where) {
      sql += ` WHERE ${where}`;
    }

    sql += ` ORDER BY ${orderBy} ${orderDirection}`;

    const result = await performanceOptimizer.paginatedQuery(
      sql,
      params,
      parseInt(page),
      parseInt(pageSize)
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Paginated query error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to execute paginated query',
      details: error.message
    });
  }
});

module.exports = router;