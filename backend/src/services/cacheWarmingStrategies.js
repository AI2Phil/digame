const databaseAdapter = require('./databaseAdapter');
const { intelligentCacheManager } = require('./intelligentCacheManager');

/**
 * Advanced Cache Warming Strategies
 * Implements intelligent warming patterns based on usage analytics and predictions
 */
class CacheWarmingStrategies {
    constructor() {
        this.strategies = new Map();
        this.warmingSchedules = new Map();
        this.warmingHistory = [];
        this.performanceMetrics = {
            totalWarmings: 0,
            successfulWarmings: 0,
            averageWarmingTime: 0,
            cacheHitImprovement: 0
        };
        
        this.initializeStrategies();
        console.log('🔥 Advanced Cache Warming Strategies initialized');
    }

    /**
     * Initialize all warming strategies
     */
    initializeStrategies() {
        // Critical data warming - highest priority data
        this.strategies.set('critical-data', {
            priority: 1,
            frequency: 300000, // 5 minutes
            execute: this.warmCriticalData.bind(this),
            description: 'Warm critical system data and active user sessions'
        });

        // User behavior prediction warming
        this.strategies.set('user-behavior', {
            priority: 2,
            frequency: 600000, // 10 minutes
            execute: this.warmUserBehaviorData.bind(this),
            description: 'Warm data based on predicted user behavior patterns'
        });

        // Analytics and reporting warming
        this.strategies.set('analytics-reports', {
            priority: 3,
            frequency: 900000, // 15 minutes
            execute: this.warmAnalyticsData.bind(this),
            description: 'Warm frequently accessed analytics and reports'
        });

        // API endpoint warming
        this.strategies.set('api-endpoints', {
            priority: 4,
            frequency: 1200000, // 20 minutes
            execute: this.warmApiEndpoints.bind(this),
            description: 'Warm popular API endpoint responses'
        });

        // Predictive content warming
        this.strategies.set('predictive-content', {
            priority: 5,
            frequency: 1800000, // 30 minutes
            execute: this.warmPredictiveContent.bind(this),
            description: 'Warm content based on ML predictions and trends'
        });

        // Time-based warming (peak hours preparation)
        this.strategies.set('peak-hours', {
            priority: 6,
            frequency: 3600000, // 1 hour
            execute: this.warmPeakHoursData.bind(this),
            description: 'Prepare cache for peak usage hours'
        });
    }

    /**
     * Execute warming strategy by name
     */
    async executeStrategy(strategyName, options = {}) {
        const strategy = this.strategies.get(strategyName);
        if (!strategy) {
            throw new Error(`Unknown warming strategy: ${strategyName}`);
        }

        const startTime = Date.now();
        console.log(`🔥 Executing warming strategy: ${strategyName}`);

        try {
            const result = await strategy.execute(options);
            const duration = Date.now() - startTime;
            
            // Record warming history
            this.recordWarmingHistory(strategyName, result, duration, true);
            
            // Update performance metrics
            this.updatePerformanceMetrics(duration, true);
            
            console.log(`✅ Strategy ${strategyName} completed in ${duration}ms:`, result);
            return result;
            
        } catch (error) {
            const duration = Date.now() - startTime;
            this.recordWarmingHistory(strategyName, { error: error.message }, duration, false);
            this.updatePerformanceMetrics(duration, false);
            
            console.error(`❌ Strategy ${strategyName} failed:`, error.message);
            throw error;
        }
    }

    /**
     * Warm critical system data
     */
    async warmCriticalData(options = {}) {
        const { maxUsers = 50, maxSessions = 100 } = options;
        let warmedCount = 0;
        const results = [];

        try {
            // Warm active user data
            const activeUsers = await databaseAdapter.query(`
                SELECT id, email, role, preferences, updatedAt
                FROM users
                WHERE updatedAt > datetime('now', '-24 hours')
                ORDER BY updatedAt DESC
                LIMIT ?
            `, [maxUsers]);

            for (const user of activeUsers) {
                await intelligentCacheManager.intelligentSet(
                    `user:${user.id}`, 
                    user, 
                    3600, // 1 hour TTL
                    { cacheType: 'user', learnPattern: true }
                );
                warmedCount++;
            }
            results.push({ type: 'users', count: activeUsers.length });

            // Warm user preferences (since we don't have sessions table)
            const userPreferences = await databaseAdapter.query(`
                SELECT id, preferences, metadata
                FROM users
                WHERE preferences IS NOT NULL AND preferences != '{}'
                ORDER BY updatedAt DESC
                LIMIT ?
            `, [maxSessions]);

            for (const user of userPreferences) {
                await intelligentCacheManager.intelligentSet(
                    `user_prefs:${user.id}`,
                    user.preferences,
                    7200, // 2 hours TTL
                    { cacheType: 'user', learnPattern: true }
                );
                warmedCount++;
            }
            results.push({ type: 'user_preferences', count: userPreferences.length });

            // Warm recent analytics events (since we don't have system_config table)
            const recentAnalytics = await databaseAdapter.query(`
                SELECT eventType, eventData
                FROM analytics_events
                WHERE timestamp > datetime('now', '-1 hour')
                GROUP BY eventType
                LIMIT 10
            `);

            for (const analytics of recentAnalytics) {
                await intelligentCacheManager.intelligentSet(
                    `analytics:${analytics.eventType}`,
                    analytics.eventData,
                    3600, // 1 hour TTL
                    { cacheType: 'analytics', learnPattern: true }
                );
                warmedCount++;
            }
            results.push({ type: 'analytics', count: recentAnalytics.length });

            return {
                strategy: 'critical-data',
                warmedCount,
                results,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Critical data warming error:', error.message);
            throw error;
        }
    }

    /**
     * Warm data based on user behavior predictions
     */
    async warmUserBehaviorData(options = {}) {
        const { predictionWindow = 3600000, maxPredictions = 100 } = options; // 1 hour window
        let warmedCount = 0;
        const results = [];

        try {
            // Analyze user access patterns
            const userPatterns = await this.analyzeUserAccessPatterns();
            
            // Predict likely user actions
            const predictions = await this.predictUserActions(userPatterns, predictionWindow);
            
            // Warm predicted data
            const topPredictions = predictions.slice(0, maxPredictions);
            
            for (const prediction of topPredictions) {
                const warmed = await this.warmPredictedUserData(prediction);
                if (warmed) {
                    warmedCount++;
                }
            }
            
            results.push({ 
                type: 'user-behavior-predictions', 
                count: warmedCount,
                totalPredictions: predictions.length,
                accuracy: this.calculatePredictionAccuracy()
            });

            // Warm team data (using existing teams table)
            const teamData = await databaseAdapter.query(`
                SELECT t.id, t.name, t.description, COUNT(tm.userId) as member_count
                FROM teams t
                LEFT JOIN team_members tm ON t.id = tm.teamId
                GROUP BY t.id, t.name, t.description
                ORDER BY member_count DESC
                LIMIT 10
            `);

            for (const team of teamData) {
                await intelligentCacheManager.intelligentSet(
                    `team:${team.id}`,
                    team,
                    1800, // 30 minutes TTL
                    { cacheType: 'user', learnPattern: true }
                );
                warmedCount++;
            }
            results.push({ type: 'team-data', count: teamData.length });

            return {
                strategy: 'user-behavior',
                warmedCount,
                results,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('User behavior warming error:', error.message);
            throw error;
        }
    }

    /**
     * Warm analytics and reporting data
     */
    async warmAnalyticsData(options = {}) {
        const { timeRanges = ['1h', '24h', '7d', '30d'], maxQueries = 50 } = options;
        let warmedCount = 0;
        const results = [];

        try {
            // Warm common analytics queries
            for (const range of timeRanges) {
                // User analytics
                const userAnalytics = await this.generateUserAnalytics(range);
                await intelligentCacheManager.intelligentSet(
                    `analytics:users:${range}`, 
                    userAnalytics, 
                    this.getTTLForRange(range),
                    { cacheType: 'analytics', learnPattern: true }
                );
                warmedCount++;

                // Session analytics
                const sessionAnalytics = await this.generateSessionAnalytics(range);
                await intelligentCacheManager.intelligentSet(
                    `analytics:sessions:${range}`, 
                    sessionAnalytics, 
                    this.getTTLForRange(range),
                    { cacheType: 'analytics', learnPattern: true }
                );
                warmedCount++;

                // Performance analytics
                const performanceAnalytics = await this.generatePerformanceAnalytics(range);
                await intelligentCacheManager.intelligentSet(
                    `analytics:performance:${range}`, 
                    performanceAnalytics, 
                    this.getTTLForRange(range),
                    { cacheType: 'analytics', learnPattern: true }
                );
                warmedCount++;
            }

            results.push({ 
                type: 'analytics-ranges', 
                count: timeRanges.length * 3,
                ranges: timeRanges 
            });

            // Warm dashboard widgets
            const dashboardWidgets = await this.generateDashboardWidgets();
            for (const [widgetId, widgetData] of Object.entries(dashboardWidgets)) {
                await intelligentCacheManager.intelligentSet(
                    `dashboard:widget:${widgetId}`, 
                    widgetData, 
                    900, // 15 minutes TTL
                    { cacheType: 'analytics', learnPattern: true }
                );
                warmedCount++;
            }
            results.push({ type: 'dashboard-widgets', count: Object.keys(dashboardWidgets).length });

            return {
                strategy: 'analytics-reports',
                warmedCount,
                results,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Analytics warming error:', error.message);
            throw error;
        }
    }

    /**
     * Warm API endpoint responses
     */
    async warmApiEndpoints(options = {}) {
        const { endpoints = [], maxResponses = 100 } = options;
        let warmedCount = 0;
        const results = [];

        try {
            // Default popular endpoints if none specified
            const popularEndpoints = endpoints.length > 0 ? endpoints : [
                { path: '/api/users', method: 'GET', params: {} },
                { path: '/api/analytics/overview', method: 'GET', params: { range: '24h' } },
                { path: '/api/health', method: 'GET', params: {} },
                { path: '/api/dashboard/widgets', method: 'GET', params: {} },
                { path: '/api/users/preferences', method: 'GET', params: {} }
            ];

            for (const endpoint of popularEndpoints) {
                const response = await this.generateApiResponse(endpoint);
                const cacheKey = `api:${endpoint.method}:${endpoint.path}:${this.hashParams(endpoint.params)}`;
                
                await intelligentCacheManager.intelligentSet(
                    cacheKey, 
                    response, 
                    300, // 5 minutes TTL
                    { cacheType: 'api', learnPattern: true }
                );
                warmedCount++;
            }

            results.push({ 
                type: 'api-endpoints', 
                count: popularEndpoints.length,
                endpoints: popularEndpoints.map(e => `${e.method} ${e.path}`)
            });

            return {
                strategy: 'api-endpoints',
                warmedCount,
                results,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('API endpoints warming error:', error.message);
            throw error;
        }
    }

    /**
     * Warm predictive content based on trends
     */
    async warmPredictiveContent(options = {}) {
        const { maxItems = 50, trendWindow = 86400000 } = options; // 24 hours
        let warmedCount = 0;
        const results = [];

        try {
            // Analyze content access trends
            const contentTrends = await this.analyzeContentTrends(trendWindow);
            
            // Predict trending content
            const predictedContent = await this.predictTrendingContent(contentTrends);
            
            // Warm predicted content
            for (const content of predictedContent.slice(0, maxItems)) {
                await intelligentCacheManager.intelligentSet(
                    `content:${content.id}`, 
                    content, 
                    1800, // 30 minutes TTL
                    { cacheType: 'general', learnPattern: true }
                );
                warmedCount++;
            }

            results.push({ 
                type: 'predictive-content', 
                count: warmedCount,
                totalPredictions: predictedContent.length
            });

            return {
                strategy: 'predictive-content',
                warmedCount,
                results,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Predictive content warming error:', error.message);
            throw error;
        }
    }

    /**
     * Warm data for peak hours
     */
    async warmPeakHoursData(options = {}) {
        const { peakHours = [9, 10, 11, 14, 15, 16], maxItems = 200 } = options;
        let warmedCount = 0;
        const results = [];

        try {
            const currentHour = new Date().getHours();
            const isPeakHour = peakHours.includes(currentHour);
            const nextPeakHour = this.getNextPeakHour(currentHour, peakHours);

            if (isPeakHour || this.isPrePeakHour(currentHour, nextPeakHour)) {
                // Warm high-traffic data
                const highTrafficData = await this.getHighTrafficData();
                
                for (const data of highTrafficData.slice(0, maxItems)) {
                    await intelligentCacheManager.intelligentSet(
                        data.key, 
                        data.value, 
                        data.ttl || 3600,
                        { cacheType: data.type || 'general', learnPattern: true }
                    );
                    warmedCount++;
                }

                results.push({ 
                    type: 'peak-hours-data', 
                    count: warmedCount,
                    currentHour,
                    isPeakHour,
                    nextPeakHour
                });
            }

            return {
                strategy: 'peak-hours',
                warmedCount,
                results,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Peak hours warming error:', error.message);
            throw error;
        }
    }

    /**
     * Get warming strategy status
     */
    getStrategyStatus() {
        const strategies = Array.from(this.strategies.entries()).map(([name, strategy]) => ({
            name,
            priority: strategy.priority,
            frequency: strategy.frequency,
            description: strategy.description,
            lastExecution: this.getLastExecution(name),
            nextExecution: this.getNextExecution(name),
            successRate: this.getSuccessRate(name)
        }));

        return {
            totalStrategies: strategies.length,
            strategies: strategies.sort((a, b) => a.priority - b.priority),
            performanceMetrics: this.performanceMetrics,
            warmingHistory: this.warmingHistory.slice(-10) // Last 10 executions
        };
    }

    /**
     * Helper methods for data generation and analysis
     */
    async analyzeUserAccessPatterns() {
        // Mock implementation - would analyze real user access patterns
        return {
            patterns: [],
            trends: {},
            predictions: []
        };
    }

    async predictUserActions(patterns, window) {
        // Mock implementation - would use ML to predict user actions
        return [];
    }

    async warmPredictedUserData(prediction) {
        // Mock implementation - would warm specific user data
        return true;
    }

    calculatePredictionAccuracy() {
        // Mock implementation - would calculate actual prediction accuracy
        return 0.85; // 85% accuracy
    }

    async generateUserAnalytics(range) {
        const analytics = await databaseAdapter.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN last_login > datetime('now', '-${range}') THEN 1 END) as active_users
            FROM users
        `);
        
        return {
            range,
            ...analytics[0],
            generatedAt: new Date().toISOString()
        };
    }

    async generateSessionAnalytics(range) {
        const analytics = await databaseAdapter.query(`
            SELECT 
                COUNT(*) as total_sessions,
                AVG(CAST((julianday(expires_at) - julianday(created_at)) * 24 * 60 AS INTEGER)) as avg_duration_minutes
            FROM user_sessions 
            WHERE created_at > datetime('now', '-${range}')
        `);
        
        return {
            range,
            ...analytics[0],
            generatedAt: new Date().toISOString()
        };
    }

    async generatePerformanceAnalytics(range) {
        return {
            range,
            avgResponseTime: Math.random() * 100 + 50, // Mock data
            errorRate: Math.random() * 0.05,
            throughput: Math.random() * 1000 + 500,
            generatedAt: new Date().toISOString()
        };
    }

    async generateDashboardWidgets() {
        return {
            'user-count': { count: 1250, change: '+5.2%' },
            'session-count': { count: 3420, change: '+12.1%' },
            'error-rate': { rate: '0.02%', change: '-0.01%' },
            'response-time': { time: '85ms', change: '-5ms' }
        };
    }

    async generateApiResponse(endpoint) {
        return {
            endpoint: `${endpoint.method} ${endpoint.path}`,
            data: { mock: true, timestamp: Date.now() },
            status: 200,
            generatedAt: new Date().toISOString()
        };
    }

    hashParams(params) {
        return Buffer.from(JSON.stringify(params || {})).toString('base64');
    }

    getTTLForRange(range) {
        const ttlMap = {
            '1h': 300,    // 5 minutes
            '24h': 900,   // 15 minutes
            '7d': 1800,   // 30 minutes
            '30d': 3600   // 1 hour
        };
        return ttlMap[range] || 900;
    }

    async analyzeContentTrends(window) {
        // Mock implementation
        return [];
    }

    async predictTrendingContent(trends) {
        // Mock implementation
        return [];
    }

    getNextPeakHour(currentHour, peakHours) {
        const nextPeaks = peakHours.filter(hour => hour > currentHour);
        return nextPeaks.length > 0 ? nextPeaks[0] : peakHours[0] + 24;
    }

    isPrePeakHour(currentHour, nextPeakHour) {
        return (nextPeakHour - currentHour) <= 1;
    }

    async getHighTrafficData() {
        // Mock implementation - would return actual high-traffic data
        return [];
    }

    recordWarmingHistory(strategy, result, duration, success) {
        this.warmingHistory.push({
            strategy,
            result,
            duration,
            success,
            timestamp: new Date().toISOString()
        });

        // Keep only last 100 entries
        if (this.warmingHistory.length > 100) {
            this.warmingHistory.shift();
        }
    }

    updatePerformanceMetrics(duration, success) {
        this.performanceMetrics.totalWarmings++;
        if (success) {
            this.performanceMetrics.successfulWarmings++;
        }

        // Update average warming time
        const totalTime = this.performanceMetrics.averageWarmingTime * (this.performanceMetrics.totalWarmings - 1) + duration;
        this.performanceMetrics.averageWarmingTime = totalTime / this.performanceMetrics.totalWarmings;
    }

    getLastExecution(strategyName) {
        const executions = this.warmingHistory.filter(h => h.strategy === strategyName);
        return executions.length > 0 ? executions[executions.length - 1].timestamp : null;
    }

    getNextExecution(strategyName) {
        const strategy = this.strategies.get(strategyName);
        const lastExecution = this.getLastExecution(strategyName);
        
        if (!lastExecution || !strategy) return null;
        
        const nextTime = new Date(lastExecution).getTime() + strategy.frequency;
        return new Date(nextTime).toISOString();
    }

    getSuccessRate(strategyName) {
        const executions = this.warmingHistory.filter(h => h.strategy === strategyName);
        if (executions.length === 0) return 0;
        
        const successful = executions.filter(h => h.success).length;
        return (successful / executions.length * 100).toFixed(2);
    }
}

// Export singleton instance
const cacheWarmingStrategies = new CacheWarmingStrategies();

module.exports = {
    CacheWarmingStrategies,
    cacheWarmingStrategies
};