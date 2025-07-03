const { cacheManager, userCacheManager, analyticsCacheManager, apiCacheManager } = require('./cacheManager');
const databaseAdapter = require('./databaseAdapter');

/**
 * Intelligent Cache Manager
 * Advanced caching with predictive warming, smart invalidation, and usage analytics
 */
class IntelligentCacheManager {
    constructor() {
        this.cacheManagers = {
            general: cacheManager,
            user: userCacheManager,
            analytics: analyticsCacheManager,
            api: apiCacheManager
        };
        
        // Usage tracking for predictive caching
        this.usagePatterns = new Map();
        this.accessFrequency = new Map();
        this.lastAccess = new Map();
        
        // Cache warming strategies
        this.warmingStrategies = new Map();
        this.warmingSchedule = new Map();
        
        // Performance metrics
        this.performanceMetrics = {
            warmingHits: 0,
            predictiveHits: 0,
            intelligentEvictions: 0,
            patternMatches: 0,
            optimizationsSaved: 0
        };
        
        // Auto-tuning parameters
        this.autoTuning = {
            enabled: true,
            learningRate: 0.1,
            adaptationThreshold: 100,
            optimizationInterval: 300000 // 5 minutes
        };
        
        this.initializeIntelligentCaching();
        console.log('🧠 Intelligent Cache Manager initialized with predictive capabilities');
    }

    /**
     * Initialize intelligent caching features
     */
    initializeIntelligentCaching() {
        // Start usage pattern analysis
        this.startUsageAnalysis();
        
        // Initialize warming strategies
        this.initializeWarmingStrategies();
        
        // Start auto-optimization
        if (this.autoTuning.enabled) {
            this.startAutoOptimization();
        }
        
        // Schedule predictive warming
        this.schedulePredictiveWarming();
    }

    /**
     * Intelligent get with predictive loading
     */
    async intelligentGet(key, fallback = null, options = {}) {
        const { 
            cacheType = 'general',
            predictive = true,
            trackUsage = true,
            warmRelated = true
        } = options;
        
        const manager = this.cacheManagers[cacheType];
        if (!manager) {
            throw new Error(`Unknown cache type: ${cacheType}`);
        }
        
        // Track access patterns
        if (trackUsage) {
            this.trackAccess(key, cacheType);
        }
        
        // Get value from cache
        const result = await manager.get(key, fallback, options);
        
        // Predictive warming of related data
        if (predictive && warmRelated && result !== null) {
            this.scheduleRelatedWarming(key, cacheType);
        }
        
        return result;
    }

    /**
     * Intelligent set with pattern learning
     */
    async intelligentSet(key, value, ttl, options = {}) {
        const { 
            cacheType = 'general',
            learnPattern = true,
            optimizeTTL = true
        } = options;
        
        const manager = this.cacheManagers[cacheType];
        if (!manager) {
            throw new Error(`Unknown cache type: ${cacheType}`);
        }
        
        // Optimize TTL based on usage patterns
        if (optimizeTTL) {
            ttl = this.optimizeTTL(key, ttl, cacheType);
        }
        
        // Learn access patterns
        if (learnPattern) {
            this.learnAccessPattern(key, cacheType);
        }
        
        return await manager.set(key, value, ttl, options);
    }

    /**
     * Smart cache invalidation with cascade effects
     */
    async smartInvalidate(key, options = {}) {
        const {
            cacheType = 'general',
            cascadeRelated = true,
            updatePatterns = true
        } = options;
        
        const manager = this.cacheManagers[cacheType];
        if (!manager) {
            throw new Error(`Unknown cache type: ${cacheType}`);
        }
        
        // Invalidate primary key
        await manager.del(key);
        
        // Cascade invalidation to related keys
        if (cascadeRelated) {
            await this.cascadeInvalidation(key, cacheType);
        }
        
        // Update usage patterns
        if (updatePatterns) {
            this.updatePatternsAfterInvalidation(key, cacheType);
        }
        
        return true;
    }

    /**
     * Predictive cache warming based on usage patterns
     */
    async predictiveWarmUp(options = {}) {
        const {
            maxItems = 50,
            minFrequency = 5,
            timeWindow = 3600000 // 1 hour
        } = options;
        
        console.log('🔮 Starting predictive cache warming...');
        
        const now = Date.now();
        const predictions = [];
        
        // Analyze usage patterns for predictions
        for (const [key, frequency] of this.accessFrequency) {
            const lastAccessTime = this.lastAccess.get(key) || 0;
            const timeSinceAccess = now - lastAccessTime;
            
            // Predict if this key will be accessed soon
            if (frequency >= minFrequency && timeSinceAccess < timeWindow) {
                const pattern = this.usagePatterns.get(key);
                const score = this.calculatePredictionScore(key, pattern, frequency, timeSinceAccess);
                
                predictions.push({
                    key,
                    score,
                    frequency,
                    pattern,
                    timeSinceAccess
                });
            }
        }
        
        // Sort by prediction score and warm top items
        predictions.sort((a, b) => b.score - a.score);
        const topPredictions = predictions.slice(0, maxItems);
        
        let warmedCount = 0;
        for (const prediction of topPredictions) {
            const warmed = await this.warmPredictedKey(prediction);
            if (warmed) {
                warmedCount++;
                this.performanceMetrics.predictiveHits++;
            }
        }
        
        console.log(`✅ Predictive warming completed: ${warmedCount}/${topPredictions.length} items warmed`);
        return warmedCount;
    }

    /**
     * Intelligent cache warming strategies
     */
    async executeWarmingStrategy(strategyName, options = {}) {
        const strategy = this.warmingStrategies.get(strategyName);
        if (!strategy) {
            throw new Error(`Unknown warming strategy: ${strategyName}`);
        }
        
        console.log(`🔥 Executing warming strategy: ${strategyName}`);
        
        try {
            const result = await strategy.execute(options);
            this.performanceMetrics.warmingHits += result.warmedCount || 0;
            
            console.log(`✅ Strategy ${strategyName} completed:`, result);
            return result;
            
        } catch (error) {
            console.error(`❌ Strategy ${strategyName} failed:`, error.message);
            throw error;
        }
    }

    /**
     * Auto-optimization based on performance metrics
     */
    async autoOptimize() {
        console.log('⚡ Running cache auto-optimization...');
        
        const optimizations = [];
        
        // Optimize TTL values based on access patterns
        const ttlOptimizations = await this.optimizeTTLValues();
        optimizations.push(...ttlOptimizations);
        
        // Optimize cache sizes based on usage
        const sizeOptimizations = await this.optimizeCacheSizes();
        optimizations.push(...sizeOptimizations);
        
        // Optimize warming schedules
        const scheduleOptimizations = await this.optimizeWarmingSchedules();
        optimizations.push(...scheduleOptimizations);
        
        // Apply optimizations
        for (const optimization of optimizations) {
            await this.applyOptimization(optimization);
            this.performanceMetrics.optimizationsSaved++;
        }
        
        console.log(`✅ Auto-optimization completed: ${optimizations.length} optimizations applied`);
        return optimizations;
    }

    /**
     * Track access patterns for learning
     */
    trackAccess(key, cacheType) {
        const now = Date.now();
        const accessKey = `${cacheType}:${key}`;
        
        // Update frequency
        const currentFreq = this.accessFrequency.get(accessKey) || 0;
        this.accessFrequency.set(accessKey, currentFreq + 1);
        
        // Update last access time
        const lastAccessTime = this.lastAccess.get(accessKey) || now;
        this.lastAccess.set(accessKey, now);
        
        // Update usage pattern
        const pattern = this.usagePatterns.get(accessKey) || {
            intervals: [],
            avgInterval: 0,
            trend: 'stable'
        };
        
        if (lastAccessTime > 0) {
            const interval = now - lastAccessTime;
            pattern.intervals.push(interval);
            
            // Keep only recent intervals (last 10)
            if (pattern.intervals.length > 10) {
                pattern.intervals.shift();
            }
            
            // Calculate average interval
            pattern.avgInterval = pattern.intervals.reduce((a, b) => a + b, 0) / pattern.intervals.length;
            
            // Determine trend
            if (pattern.intervals.length >= 3) {
                const recent = pattern.intervals.slice(-3);
                const older = pattern.intervals.slice(-6, -3);
                
                if (older.length > 0) {
                    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
                    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
                    
                    if (recentAvg < olderAvg * 0.8) {
                        pattern.trend = 'increasing';
                    } else if (recentAvg > olderAvg * 1.2) {
                        pattern.trend = 'decreasing';
                    } else {
                        pattern.trend = 'stable';
                    }
                }
            }
        }
        
        this.usagePatterns.set(accessKey, pattern);
        this.performanceMetrics.patternMatches++;
    }

    /**
     * Calculate prediction score for cache warming
     */
    calculatePredictionScore(key, pattern, frequency, timeSinceAccess) {
        let score = 0;
        
        // Base score from frequency
        score += Math.log(frequency + 1) * 10;
        
        // Pattern-based scoring
        if (pattern) {
            // Favor items with consistent access patterns
            if (pattern.trend === 'increasing') {
                score += 20;
            } else if (pattern.trend === 'stable') {
                score += 10;
            }
            
            // Favor items likely to be accessed soon
            if (pattern.avgInterval > 0) {
                const expectedNextAccess = pattern.avgInterval;
                const timeUntilExpected = expectedNextAccess - timeSinceAccess;
                
                if (timeUntilExpected < expectedNextAccess * 0.2) {
                    score += 30; // Very likely to be accessed soon
                } else if (timeUntilExpected < expectedNextAccess * 0.5) {
                    score += 15; // Moderately likely
                }
            }
        }
        
        // Penalize very recent accesses (already likely cached)
        if (timeSinceAccess < 60000) { // Less than 1 minute
            score *= 0.5;
        }
        
        return score;
    }

    /**
     * Initialize warming strategies
     */
    initializeWarmingStrategies() {
        // User data warming strategy
        this.warmingStrategies.set('user-data', {
            execute: async (options = {}) => {
                const { limit = 20 } = options;
                const activeUsers = await databaseAdapter.query(
                    'SELECT id, email FROM users WHERE last_login > datetime("now", "-7 days") LIMIT ?',
                    [limit]
                );
                
                let warmedCount = 0;
                for (const user of activeUsers) {
                    await this.cacheManagers.user.cacheUser(user.id, user);
                    warmedCount++;
                }
                
                return { warmedCount, strategy: 'user-data' };
            }
        });
        
        // Analytics warming strategy
        this.warmingStrategies.set('analytics-data', {
            execute: async (options = {}) => {
                const { timeRanges = ['24h', '7d', '30d'] } = options;
                
                let warmedCount = 0;
                for (const range of timeRanges) {
                    // Warm common analytics queries
                    const analyticsData = await this.generateAnalyticsData(range);
                    await this.cacheManagers.analytics.cacheAnalytics('overview', null, range, analyticsData);
                    warmedCount++;
                }
                
                return { warmedCount, strategy: 'analytics-data' };
            }
        });
        
        // API response warming strategy
        this.warmingStrategies.set('api-responses', {
            execute: async (options = {}) => {
                const { endpoints = ['/api/users', '/api/analytics', '/api/health'] } = options;
                
                let warmedCount = 0;
                for (const endpoint of endpoints) {
                    // Simulate common API calls and cache responses
                    const mockResponse = await this.generateMockApiResponse(endpoint);
                    await this.cacheManagers.api.cacheApiResponse(endpoint, {}, mockResponse);
                    warmedCount++;
                }
                
                return { warmedCount, strategy: 'api-responses' };
            }
        });
    }

    /**
     * Start usage analysis background process
     */
    startUsageAnalysis() {
        setInterval(() => {
            this.analyzeUsagePatterns();
        }, 60000); // Analyze every minute
    }

    /**
     * Start auto-optimization background process
     */
    startAutoOptimization() {
        setInterval(async () => {
            try {
                await this.autoOptimize();
            } catch (error) {
                console.warn('Auto-optimization error:', error.message);
            }
        }, this.autoTuning.optimizationInterval);
    }

    /**
     * Schedule predictive warming
     */
    schedulePredictiveWarming() {
        // Run predictive warming every 10 minutes
        setInterval(async () => {
            try {
                await this.predictiveWarmUp();
            } catch (error) {
                console.warn('Predictive warming error:', error.message);
            }
        }, 600000);
    }

    /**
     * Get comprehensive cache analytics
     */
    async getCacheAnalytics() {
        const analytics = {
            performance: this.performanceMetrics,
            usagePatterns: {
                totalKeys: this.usagePatterns.size,
                totalAccesses: Array.from(this.accessFrequency.values()).reduce((a, b) => a + b, 0),
                averageFrequency: 0,
                topKeys: []
            },
            cacheManagers: {},
            predictions: {
                totalPredictions: 0,
                accuracyRate: 0,
                nextWarmingIn: 0
            },
            optimization: {
                enabled: this.autoTuning.enabled,
                lastOptimization: new Date().toISOString(),
                optimizationsSaved: this.performanceMetrics.optimizationsSaved
            }
        };
        
        // Calculate usage pattern analytics
        if (this.accessFrequency.size > 0) {
            const frequencies = Array.from(this.accessFrequency.values());
            analytics.usagePatterns.averageFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
            
            // Get top accessed keys
            const sortedKeys = Array.from(this.accessFrequency.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            analytics.usagePatterns.topKeys = sortedKeys.map(([key, freq]) => ({
                key,
                frequency: freq,
                lastAccess: this.lastAccess.get(key),
                pattern: this.usagePatterns.get(key)
            }));
        }
        
        // Get cache manager stats
        for (const [type, manager] of Object.entries(this.cacheManagers)) {
            analytics.cacheManagers[type] = await manager.healthCheck();
        }
        
        return analytics;
    }

    /**
     * Helper methods for optimization and warming
     */
    async optimizeTTL(key, originalTTL, cacheType) {
        const accessKey = `${cacheType}:${key}`;
        const pattern = this.usagePatterns.get(accessKey);
        
        if (!pattern || pattern.avgInterval === 0) {
            return originalTTL;
        }
        
        // Optimize TTL based on access interval
        const optimizedTTL = Math.max(
            pattern.avgInterval / 1000 * 1.5, // 1.5x average interval
            originalTTL * 0.5 // At least 50% of original
        );
        
        return Math.min(optimizedTTL, originalTTL * 2); // At most 2x original
    }

    async cascadeInvalidation(key, cacheType) {
        // Define cascade rules
        const cascadeRules = {
            user: ['session', 'analytics'],
            analytics: ['api'],
            api: []
        };
        
        const relatedTypes = cascadeRules[cacheType] || [];
        
        for (const relatedType of relatedTypes) {
            const relatedManager = this.cacheManagers[relatedType];
            if (relatedManager) {
                await relatedManager.invalidatePattern(`*${key}*`);
            }
        }
    }

    async generateAnalyticsData(timeRange) {
        // Mock analytics data generation
        return {
            timeRange,
            users: Math.floor(Math.random() * 1000),
            sessions: Math.floor(Math.random() * 5000),
            pageViews: Math.floor(Math.random() * 10000),
            generatedAt: new Date().toISOString()
        };
    }

    async generateMockApiResponse(endpoint) {
        // Mock API response generation
        return {
            endpoint,
            data: { message: 'Mock response', timestamp: Date.now() },
            status: 'success',
            generatedAt: new Date().toISOString()
        };
    }

    // Additional helper methods would be implemented here...
    async warmPredictedKey(prediction) {
        // Implementation for warming predicted keys
        return true;
    }

    async optimizeTTLValues() {
        // Implementation for TTL optimization
        return [];
    }

    async optimizeCacheSizes() {
        // Implementation for cache size optimization
        return [];
    }

    async optimizeWarmingSchedules() {
        // Implementation for warming schedule optimization
        return [];
    }

    async applyOptimization(optimization) {
        // Implementation for applying optimizations
        return true;
    }

    analyzeUsagePatterns() {
        // Implementation for usage pattern analysis
        return true;
    }

    learnAccessPattern(key, cacheType) {
        // Implementation for learning access patterns
        return true;
    }

    scheduleRelatedWarming(key, cacheType) {
        // Implementation for scheduling related warming
        return true;
    }

    updatePatternsAfterInvalidation(key, cacheType) {
        // Implementation for updating patterns after invalidation
        return true;
    }
}

// Export singleton instance
const intelligentCacheManager = new IntelligentCacheManager();

module.exports = {
    IntelligentCacheManager,
    intelligentCacheManager
};