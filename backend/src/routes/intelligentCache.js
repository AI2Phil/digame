const express = require('express');
const router = express.Router();
const { intelligentCacheManager } = require('../services/intelligentCacheManager');
const { cacheWarmingStrategies } = require('../services/cacheWarmingStrategies');

/**
 * Intelligent Cache Management Routes
 * Advanced cache operations, analytics, and warming strategies
 */

/**
 * GET /api/intelligent-cache/analytics
 * Get comprehensive cache analytics and performance metrics
 */
router.get('/analytics', async (req, res) => {
    try {
        const analytics = await intelligentCacheManager.getCacheAnalytics();
        
        res.json({
            status: 'success',
            data: analytics,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Cache analytics error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve cache analytics',
            error: error.message
        });
    }
});

/**
 * GET /api/intelligent-cache/health
 * Comprehensive health check for intelligent cache system
 */
router.get('/health', async (req, res) => {
    try {
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            components: {}
        };

        // Check all cache managers
        for (const [type, manager] of Object.entries(intelligentCacheManager.cacheManagers)) {
            try {
                const health = await manager.healthCheck();
                healthData.components[`cache_${type}`] = health;
            } catch (error) {
                healthData.components[`cache_${type}`] = {
                    status: 'unhealthy',
                    error: error.message
                };
                healthData.status = 'degraded';
            }
        }

        // Check warming strategies
        try {
            const strategyStatus = cacheWarmingStrategies.getStrategyStatus();
            healthData.components.warming_strategies = {
                status: 'healthy',
                totalStrategies: strategyStatus.totalStrategies,
                performanceMetrics: strategyStatus.performanceMetrics
            };
        } catch (error) {
            healthData.components.warming_strategies = {
                status: 'unhealthy',
                error: error.message
            };
            healthData.status = 'degraded';
        }

        // Check intelligent features
        healthData.components.intelligent_features = {
            status: 'healthy',
            usagePatterns: intelligentCacheManager.usagePatterns.size,
            accessFrequency: intelligentCacheManager.accessFrequency.size,
            autoTuning: intelligentCacheManager.autoTuning.enabled,
            performanceMetrics: intelligentCacheManager.performanceMetrics
        };

        res.json(healthData);
        
    } catch (error) {
        console.error('Intelligent cache health check error:', error);
        res.status(500).json({
            status: 'unhealthy',
            message: 'Health check failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/intelligent-cache/warm
 * Execute cache warming strategy
 */
router.post('/warm', async (req, res) => {
    try {
        const { strategy, options = {} } = req.body;
        
        if (!strategy) {
            return res.status(400).json({
                status: 'error',
                message: 'Strategy name is required'
            });
        }

        const result = await cacheWarmingStrategies.executeStrategy(strategy, options);
        
        res.json({
            status: 'success',
            message: `Warming strategy '${strategy}' executed successfully`,
            data: result,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Cache warming error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to execute warming strategy',
            error: error.message
        });
    }
});

/**
 * GET /api/intelligent-cache/strategies
 * Get available warming strategies and their status
 */
router.get('/strategies', async (req, res) => {
    try {
        const strategyStatus = cacheWarmingStrategies.getStrategyStatus();
        
        res.json({
            status: 'success',
            data: strategyStatus,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Strategy status error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve strategy status',
            error: error.message
        });
    }
});

/**
 * POST /api/intelligent-cache/predictive-warm
 * Execute predictive cache warming
 */
router.post('/predictive-warm', async (req, res) => {
    try {
        const options = req.body || {};
        const result = await intelligentCacheManager.predictiveWarmUp(options);
        
        res.json({
            status: 'success',
            message: 'Predictive warming completed',
            data: {
                warmedCount: result,
                options,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Predictive warming error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to execute predictive warming',
            error: error.message
        });
    }
});

/**
 * POST /api/intelligent-cache/optimize
 * Execute auto-optimization
 */
router.post('/optimize', async (req, res) => {
    try {
        const optimizations = await intelligentCacheManager.autoOptimize();
        
        res.json({
            status: 'success',
            message: 'Auto-optimization completed',
            data: {
                optimizations,
                count: optimizations.length,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Auto-optimization error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to execute auto-optimization',
            error: error.message
        });
    }
});

/**
 * GET /api/intelligent-cache/patterns
 * Get usage patterns and access analytics
 */
router.get('/patterns', async (req, res) => {
    try {
        const { limit = 50, sortBy = 'frequency' } = req.query;
        
        // Get usage patterns
        const patterns = Array.from(intelligentCacheManager.usagePatterns.entries())
            .map(([key, pattern]) => ({
                key,
                pattern,
                frequency: intelligentCacheManager.accessFrequency.get(key) || 0,
                lastAccess: intelligentCacheManager.lastAccess.get(key) || 0
            }));

        // Sort patterns
        if (sortBy === 'frequency') {
            patterns.sort((a, b) => b.frequency - a.frequency);
        } else if (sortBy === 'recent') {
            patterns.sort((a, b) => b.lastAccess - a.lastAccess);
        }

        const limitedPatterns = patterns.slice(0, parseInt(limit));
        
        res.json({
            status: 'success',
            data: {
                patterns: limitedPatterns,
                totalPatterns: patterns.length,
                sortBy,
                limit: parseInt(limit),
                summary: {
                    totalKeys: intelligentCacheManager.usagePatterns.size,
                    totalAccesses: Array.from(intelligentCacheManager.accessFrequency.values())
                        .reduce((a, b) => a + b, 0),
                    averageFrequency: patterns.length > 0 
                        ? patterns.reduce((sum, p) => sum + p.frequency, 0) / patterns.length 
                        : 0
                }
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Usage patterns error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve usage patterns',
            error: error.message
        });
    }
});

/**
 * POST /api/intelligent-cache/invalidate
 * Smart cache invalidation with cascade effects
 */
router.post('/invalidate', async (req, res) => {
    try {
        const { key, cacheType = 'general', cascadeRelated = true } = req.body;
        
        if (!key) {
            return res.status(400).json({
                status: 'error',
                message: 'Cache key is required'
            });
        }

        const result = await intelligentCacheManager.smartInvalidate(key, {
            cacheType,
            cascadeRelated,
            updatePatterns: true
        });
        
        res.json({
            status: 'success',
            message: 'Smart invalidation completed',
            data: {
                key,
                cacheType,
                cascadeRelated,
                result,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Smart invalidation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to execute smart invalidation',
            error: error.message
        });
    }
});

/**
 * GET /api/intelligent-cache/performance
 * Get real-time performance metrics
 */
router.get('/performance', async (req, res) => {
    try {
        const performance = {
            intelligent: intelligentCacheManager.performanceMetrics,
            warming: cacheWarmingStrategies.performanceMetrics,
            cacheManagers: {}
        };

        // Get performance from all cache managers
        for (const [type, manager] of Object.entries(intelligentCacheManager.cacheManagers)) {
            performance.cacheManagers[type] = manager.getStats();
        }

        // Calculate overall metrics
        const totalHits = Object.values(performance.cacheManagers)
            .reduce((sum, stats) => sum + stats.hits, 0);
        const totalMisses = Object.values(performance.cacheManagers)
            .reduce((sum, stats) => sum + stats.misses, 0);
        const totalRequests = totalHits + totalMisses;
        
        performance.overall = {
            totalRequests,
            totalHits,
            totalMisses,
            overallHitRate: totalRequests > 0 ? `${(totalHits / totalRequests * 100).toFixed(2)}%` : '0%',
            intelligentFeatures: {
                warmingHits: performance.intelligent.warmingHits,
                predictiveHits: performance.intelligent.predictiveHits,
                patternMatches: performance.intelligent.patternMatches,
                optimizationsSaved: performance.intelligent.optimizationsSaved
            }
        };

        res.json({
            status: 'success',
            data: performance,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Performance metrics error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve performance metrics',
            error: error.message
        });
    }
});

/**
 * POST /api/intelligent-cache/clear
 * Clear all intelligent cache data
 */
router.post('/clear', async (req, res) => {
    try {
        const { cacheType, clearPatterns = false, clearMetrics = false } = req.body;
        
        const results = {};
        
        if (cacheType) {
            // Clear specific cache type
            const manager = intelligentCacheManager.cacheManagers[cacheType];
            if (manager) {
                results[cacheType] = await manager.clear();
            } else {
                return res.status(400).json({
                    status: 'error',
                    message: `Unknown cache type: ${cacheType}`
                });
            }
        } else {
            // Clear all cache types
            for (const [type, manager] of Object.entries(intelligentCacheManager.cacheManagers)) {
                results[type] = await manager.clear();
            }
        }

        // Clear usage patterns if requested
        if (clearPatterns) {
            intelligentCacheManager.usagePatterns.clear();
            intelligentCacheManager.accessFrequency.clear();
            intelligentCacheManager.lastAccess.clear();
            results.patterns = 'cleared';
        }

        // Clear performance metrics if requested
        if (clearMetrics) {
            intelligentCacheManager.performanceMetrics = {
                warmingHits: 0,
                predictiveHits: 0,
                intelligentEvictions: 0,
                patternMatches: 0,
                optimizationsSaved: 0
            };
            results.metrics = 'cleared';
        }

        res.json({
            status: 'success',
            message: 'Cache clearing completed',
            data: {
                results,
                cacheType: cacheType || 'all',
                clearPatterns,
                clearMetrics,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Cache clear error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to clear cache',
            error: error.message
        });
    }
});

module.exports = router;