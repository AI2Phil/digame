const redisService = require('./redis');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            requests: new Map(),
            database: new Map(),
            memory: [],
            errors: []
        };
        this.startTime = Date.now();
        this.requestCount = 0;
        this.errorCount = 0;
        
        // Start periodic collection
        this.startPeriodicCollection();
    }

    // Middleware for request monitoring
    requestMonitor() {
        return (req, res, next) => {
            const startTime = Date.now();
            const startMemory = process.memoryUsage();
            
            // Track request
            this.requestCount++;
            const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Override res.end to capture response metrics
            const originalEnd = res.end;
            res.end = (...args) => {
                const duration = Date.now() - startTime;
                const endMemory = process.memoryUsage();
                
                // Record metrics
                this.recordRequest({
                    id: requestId,
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    duration,
                    memoryDelta: {
                        rss: endMemory.rss - startMemory.rss,
                        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                        heapTotal: endMemory.heapTotal - startMemory.heapTotal
                    },
                    userAgent: req.get('User-Agent'),
                    ip: req.ip || req.connection.remoteAddress,
                    timestamp: new Date().toISOString()
                });
                
                // Alert on slow requests
                if (duration > 1000) {
                    console.warn(`🐌 Slow request detected: ${req.method} ${req.url} - ${duration}ms`);
                }
                
                // Alert on high memory usage
                if (endMemory.heapUsed > 100 * 1024 * 1024) { // 100MB
                    console.warn(`🧠 High memory usage: ${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
                }
                
                originalEnd.apply(res, args);
            };
            
            next();
        };
    }

    // Database query monitoring
    async monitorDatabaseQuery(queryName, queryFunction) {
        const startTime = Date.now();
        let error = null;
        let result = null;
        
        try {
            result = await queryFunction();
        } catch (err) {
            error = err;
            this.errorCount++;
            throw err;
        } finally {
            const duration = Date.now() - startTime;
            
            this.recordDatabaseQuery({
                queryName,
                duration,
                success: !error,
                error: error?.message,
                timestamp: new Date().toISOString()
            });
            
            // Alert on slow queries
            if (duration > 500) {
                console.warn(`🗃️ Slow database query: ${queryName} - ${duration}ms`);
            }
        }
        
        return result;
    }

    // Record request metrics
    recordRequest(metrics) {
        const minute = Math.floor(Date.now() / 60000);
        
        if (!this.metrics.requests.has(minute)) {
            this.metrics.requests.set(minute, []);
        }
        
        this.metrics.requests.get(minute).push(metrics);
        
        // Keep only last 60 minutes
        const cutoff = minute - 60;
        for (const [key] of this.metrics.requests) {
            if (key < cutoff) {
                this.metrics.requests.delete(key);
            }
        }
        
        // Cache metrics in Redis if available
        this.cacheMetrics('requests', metrics);
    }

    // Record database query metrics
    recordDatabaseQuery(metrics) {
        const minute = Math.floor(Date.now() / 60000);
        
        if (!this.metrics.database.has(minute)) {
            this.metrics.database.set(minute, []);
        }
        
        this.metrics.database.get(minute).push(metrics);
        
        // Keep only last 60 minutes
        const cutoff = minute - 60;
        for (const [key] of this.metrics.database) {
            if (key < cutoff) {
                this.metrics.database.delete(key);
            }
        }
        
        // Cache metrics in Redis if available
        this.cacheMetrics('database', metrics);
    }

    // Cache metrics in Redis
    async cacheMetrics(type, metrics) {
        try {
            const key = `metrics:${type}:${Date.now()}`;
            await redisService.set(key, metrics, 3600); // 1 hour TTL
        } catch (error) {
            // Silently fail if Redis is not available
        }
    }

    // Get performance summary
    getPerformanceSummary() {
        const now = Date.now();
        const uptime = now - this.startTime;
        const memory = process.memoryUsage();
        
        // Calculate request metrics
        const recentRequests = Array.from(this.metrics.requests.values()).flat();
        const avgResponseTime = recentRequests.length > 0 
            ? recentRequests.reduce((sum, req) => sum + req.duration, 0) / recentRequests.length 
            : 0;
        
        const errorRate = this.requestCount > 0 
            ? (this.errorCount / this.requestCount) * 100 
            : 0;
        
        // Calculate database metrics
        const recentQueries = Array.from(this.metrics.database.values()).flat();
        const avgQueryTime = recentQueries.length > 0 
            ? recentQueries.reduce((sum, query) => sum + query.duration, 0) / recentQueries.length 
            : 0;
        
        const dbErrorRate = recentQueries.length > 0 
            ? (recentQueries.filter(q => !q.success).length / recentQueries.length) * 100 
            : 0;
        
        return {
            system: {
                uptime: Math.floor(uptime / 1000), // seconds
                memory: {
                    rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
                    heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                    heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                    external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`
                },
                cpu: process.cpuUsage()
            },
            requests: {
                total: this.requestCount,
                recent: recentRequests.length,
                avgResponseTime: Math.round(avgResponseTime),
                errorRate: errorRate.toFixed(2),
                requestsPerMinute: this.getRequestsPerMinute()
            },
            database: {
                totalQueries: recentQueries.length,
                avgQueryTime: Math.round(avgQueryTime),
                errorRate: dbErrorRate.toFixed(2),
                slowQueries: recentQueries.filter(q => q.duration > 500).length
            },
            alerts: this.getActiveAlerts()
        };
    }

    // Get requests per minute
    getRequestsPerMinute() {
        const currentMinute = Math.floor(Date.now() / 60000);
        const requests = this.metrics.requests.get(currentMinute) || [];
        return requests.length;
    }

    // Get active alerts
    getActiveAlerts() {
        const alerts = [];
        const memory = process.memoryUsage();
        
        // Memory alerts
        if (memory.heapUsed > 200 * 1024 * 1024) { // 200MB
            alerts.push({
                type: 'memory',
                level: 'warning',
                message: `High memory usage: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB`
            });
        }
        
        // Error rate alerts
        const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
        if (errorRate > 5) {
            alerts.push({
                type: 'error_rate',
                level: 'warning',
                message: `High error rate: ${errorRate.toFixed(2)}%`
            });
        }
        
        // Response time alerts
        const recentRequests = Array.from(this.metrics.requests.values()).flat();
        const avgResponseTime = recentRequests.length > 0 
            ? recentRequests.reduce((sum, req) => sum + req.duration, 0) / recentRequests.length 
            : 0;
        
        if (avgResponseTime > 1000) {
            alerts.push({
                type: 'response_time',
                level: 'warning',
                message: `Slow average response time: ${Math.round(avgResponseTime)}ms`
            });
        }
        
        return alerts;
    }

    // Start periodic metric collection
    startPeriodicCollection() {
        // Collect memory metrics every minute
        setInterval(() => {
            const memory = process.memoryUsage();
            this.metrics.memory.push({
                timestamp: new Date().toISOString(),
                ...memory
            });
            
            // Keep only last 60 entries (1 hour)
            if (this.metrics.memory.length > 60) {
                this.metrics.memory = this.metrics.memory.slice(-60);
            }
        }, 60000);
        
        // Log performance summary every 5 minutes
        setInterval(() => {
            const summary = this.getPerformanceSummary();
            console.log('📊 Performance Summary:', {
                uptime: `${summary.system.uptime}s`,
                memory: summary.system.memory.heapUsed,
                requests: `${summary.requests.total} total, ${summary.requests.avgResponseTime}ms avg`,
                database: `${summary.database.avgQueryTime}ms avg query`,
                alerts: summary.alerts.length
            });
        }, 5 * 60000);
    }

    // Export metrics to file
    async exportMetrics(filePath) {
        const summary = this.getPerformanceSummary();
        const exportData = {
            timestamp: new Date().toISOString(),
            summary,
            rawMetrics: {
                requests: Array.from(this.metrics.requests.entries()),
                database: Array.from(this.metrics.database.entries()),
                memory: this.metrics.memory
            }
        };
        
        try {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
            console.log(`📁 Metrics exported to: ${filePath}`);
        } catch (error) {
            console.error('Failed to export metrics:', error.message);
        }
    }

    // Health check endpoint data
    async getHealthCheck() {
        const summary = this.getPerformanceSummary();
        const redisHealth = await redisService.healthCheck();
        
        return {
            status: summary.alerts.length === 0 ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: summary.system.uptime,
            performance: {
                avgResponseTime: summary.requests.avgResponseTime,
                requestsPerMinute: summary.requests.requestsPerMinute,
                errorRate: parseFloat(summary.requests.errorRate),
                memoryUsage: summary.system.memory.heapUsed
            },
            database: {
                avgQueryTime: summary.database.avgQueryTime,
                errorRate: parseFloat(summary.database.errorRate)
            },
            redis: redisHealth,
            alerts: summary.alerts
        };
    }
}

// Export singleton instance
const performanceMonitor = new PerformanceMonitor();
module.exports = performanceMonitor;