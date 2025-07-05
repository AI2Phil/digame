const express = require('express');
const router = express.Router();
const databaseService = require('../services/database');
const databaseAdapter = require('../services/databaseAdapter');
const DatabaseMigrator = require('../utils/databaseMigrator');
const redisService = require('../services/redis');
const performanceMonitor = require('../services/performance');
const { cacheManager, userCacheManager, analyticsCacheManager } = require('../services/cacheManager');
const fs = require('fs');
const path = require('path');

// Initialize services
const dbService = databaseService;
// Use the singleton instance
const dbAdapter = databaseAdapter;
const migrator = new DatabaseMigrator();

/**
 * Comprehensive system health endpoint
 */
router.get('/', async (req, res) => {
    try {
        const healthData = await performanceMonitor.getHealthCheck();
        const dbHealth = await dbService.getHealthStatus();
        const cacheHealth = await cacheManager.healthCheck();
        
        res.json({
            status: healthData.status,
            message: 'Digame Backend Server is running',
            timestamp: healthData.timestamp,
            version: '2.0.0',
            port: process.env.RUNTIME_PORT || 'unknown',
            uptime: healthData.uptime,
            performance: healthData.performance,
            database: {
                ...healthData.database,
                ...dbHealth,
                adapter: dbAdapter.getConnectionInfo()
            },
            cache: cacheHealth,
            redis: healthData.redis,
            alerts: healthData.alerts,
            features: {
                authentication: true,
                rbac: true,
                teamCollaboration: true,
                jwtTokens: true,
                dynamicPortDetection: true,
                extendedSchema: true,
                performanceMonitoring: true,
                redisIntegration: healthData.redis.status !== 'disabled',
                databaseAdapter: true,
                multiLayerCache: true,
                migrationTools: true
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Database health and schema status
 */
router.get('/database', async (req, res) => {
    try {
        const startTime = Date.now();
        const dbHealth = await dbService.getHealthStatus();
        const adapterInfo = dbAdapter.getConnectionInfo();
        const queryTime = Date.now() - startTime;

        res.json({
            status: dbHealth.status,
            queryTime: `${queryTime}ms`,
            adapter: adapterInfo,
            schema: {
                extended: dbHealth.extendedSchema,
                totalTables: dbHealth.totalTables,
                healthyTables: dbHealth.healthyTables,
                tableStatus: dbHealth.tableStatus
            },
            performance: {
                databaseSize: dbHealth.databaseSize,
                connectivity: dbHealth.connectivity
            },
            migration: {
                available: true,
                sourceType: adapterInfo.type,
                targetType: adapterInfo.type === 'sqlite' ? 'postgresql' : 'sqlite'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Performance metrics endpoint
 */
router.get('/performance', async (req, res) => {
    try {
        const summary = performanceMonitor.getPerformanceSummary();
        const cacheStats = cacheManager.getStats();
        const memoryInfo = cacheManager.getMemoryCacheInfo();
        
        res.json({
            ...summary,
            cache: {
                stats: cacheStats,
                memory: memoryInfo
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get performance metrics',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Redis health and cache status
 */
router.get('/redis', async (req, res) => {
    try {
        const redisHealth = await redisService.healthCheck();
        const cacheHealth = await cacheManager.healthCheck();
        
        res.json({
            redis: redisHealth,
            cache: cacheHealth,
            managers: {
                main: await cacheManager.healthCheck(),
                user: await userCacheManager.healthCheck(),
                analytics: await analyticsCacheManager.healthCheck()
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Cache statistics and management
 */
router.get('/cache', async (req, res) => {
    try {
        const mainStats = cacheManager.getStats();
        const userStats = userCacheManager.getStats();
        const analyticsStats = analyticsCacheManager.getStats();
        const memoryInfo = cacheManager.getMemoryCacheInfo();
        
        res.json({
            status: 'healthy',
            managers: {
                main: mainStats,
                user: userStats,
                analytics: analyticsStats
            },
            memory: memoryInfo,
            redis: await redisService.healthCheck(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Clear all caches
 */
router.post('/cache/clear', async (req, res) => {
    try {
        await cacheManager.clear();
        await userCacheManager.clear();
        await analyticsCacheManager.clear();
        
        res.json({
            status: 'success',
            message: 'All caches cleared',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Database migration status and tools
 */
router.get('/migration', async (req, res) => {
    try {
        const adapterInfo = dbAdapter.getConnectionInfo();
        const canMigrate = process.env.DATABASE_URL ? true : false;
        
        res.json({
            status: 'available',
            current: {
                type: adapterInfo.type,
                status: adapterInfo.status,
                features: adapterInfo.features
            },
            migration: {
                available: canMigrate,
                source: adapterInfo.type,
                target: adapterInfo.type === 'sqlite' ? 'postgresql' : 'sqlite',
                tools: ['export', 'import', 'test', 'migrate']
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Test database migration (dry run)
 */
router.post('/migration/test', async (req, res) => {
    try {
        const result = await migrator.testMigration();
        
        res.json({
            status: result.success ? 'success' : 'failed',
            message: result.success ? 'Migration test passed' : 'Migration test failed',
            details: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Export database data
 */
router.post('/migration/export', async (req, res) => {
    try {
        const data = await migrator.exportSQLiteData();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `database_export_${timestamp}.json`;
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/json');
        res.json(data);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * System information endpoint
 */
router.get('/system', async (req, res) => {
    try {
        const memory = process.memoryUsage();
        const uptime = process.uptime();
        const cpuUsage = process.cpuUsage();
        
        // Get database file size (if SQLite)
        let databaseSize = 'N/A';
        if (dbAdapter.getConnectionInfo().type === 'sqlite') {
            try {
                const dbPath = path.join(__dirname, '../../data/digame.db');
                const stats = fs.statSync(dbPath);
                databaseSize = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
            } catch (error) {
                databaseSize = 'Unknown';
            }
        }
        
        res.json({
            status: 'healthy',
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                uptime: `${Math.floor(uptime)}s`,
                pid: process.pid
            },
            memory: {
                rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system
            },
            database: {
                type: dbAdapter.getConnectionInfo().type,
                size: databaseSize,
                adapter: 'DatabaseAdapter v2.0'
            },
            environment: {
                nodeEnv: process.env.NODE_ENV || 'development',
                port: process.env.RUNTIME_PORT || 'unknown',
                redisConfigured: !!process.env.REDIS_URL,
                postgresConfigured: !!process.env.DATABASE_URL
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Feature status endpoint
 */
router.get('/features', async (req, res) => {
    try {
        const dbHealth = await dbService.getHealthStatus();
        const redisHealth = await redisService.healthCheck();
        const cacheHealth = await cacheManager.healthCheck();
        
        const features = {
            core: {
                authentication: { status: 'active', description: 'JWT-based authentication system' },
                userManagement: { status: 'active', description: 'Complete user CRUD operations' },
                rbac: { status: 'active', description: 'Role-based access control' },
                onboarding: { status: 'active', description: 'User onboarding flow' }
            },
            database: {
                extendedSchema: { 
                    status: dbHealth.extendedSchema ? 'active' : 'inactive', 
                    description: 'Extended database schema with 15+ tables',
                    tables: dbHealth.totalTables,
                    healthy: dbHealth.healthyTables
                },
                adapter: { 
                    status: 'active', 
                    description: 'Database abstraction layer',
                    type: dbAdapter.getConnectionInfo().type
                },
                migration: { 
                    status: 'active', 
                    description: 'Database migration tools' 
                }
            },
            performance: {
                monitoring: { status: 'active', description: 'Real-time performance monitoring' },
                caching: { 
                    status: cacheHealth.status, 
                    description: 'Multi-layer caching system',
                    hitRate: cacheManager.getStats().hitRate
                },
                redis: { 
                    status: redisHealth.status, 
                    description: 'Redis caching and session management' 
                }
            },
            platform: {
                teamCollaboration: { status: 'active', description: 'Team management and collaboration' },
                analytics: { status: 'active', description: 'Analytics and intelligence features' },
                aiTools: { status: 'active', description: 'AI-powered tools and automation' },
                workflows: { status: 'active', description: 'Workflow automation system' },
                security: { status: 'active', description: 'Security and compliance features' }
            }
        };
        
        // Count active features
        const allFeatures = Object.values(features).flatMap(category => Object.values(category));
        const activeFeatures = allFeatures.filter(feature => feature.status === 'active').length;
        const totalFeatures = allFeatures.length;
        
        res.json({
            status: 'healthy',
            summary: {
                totalFeatures,
                activeFeatures,
                coverage: `${((activeFeatures / totalFeatures) * 100).toFixed(1)}%`
            },
            features,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Export performance metrics
 */
router.get('/export/metrics', async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `performance_metrics_${timestamp}.json`;
        
        const metrics = {
            timestamp: new Date().toISOString(),
            performance: performanceMonitor.getPerformanceSummary(),
            cache: cacheManager.getStats(),
            database: await dbService.getHealthStatus(),
            redis: await redisService.healthCheck(),
            system: {
                memory: process.memoryUsage(),
                uptime: process.uptime(),
                cpu: process.cpuUsage()
            }
        };
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/json');
        res.json(metrics);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;