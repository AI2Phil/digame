const redisService = require('./redis');

/**
 * Multi-Layer Cache Manager
 * Implements intelligent caching with memory and Redis layers
 */
class CacheManager {
    constructor() {
        this.memoryCache = new Map();
        this.maxMemoryItems = 1000;
        this.defaultTTL = 3600; // 1 hour
        this.memoryTTL = 300; // 5 minutes for memory cache
        
        // Cache statistics
        this.stats = {
            hits: 0,
            misses: 0,
            memoryHits: 0,
            redisHits: 0,
            sets: 0,
            evictions: 0
        };
        
        // Start cleanup interval
        this.startCleanupInterval();
        
        console.log('🧠 Multi-layer cache manager initialized');
    }

    /**
     * Get value from cache with fallback function
     */
    async get(key, fallback = null, options = {}) {
        const { ttl = this.defaultTTL, useMemory = true, useRedis = true } = options;
        
        try {
            // Try memory cache first
            if (useMemory && this.memoryCache.has(key)) {
                const item = this.memoryCache.get(key);
                if (item.expires > Date.now()) {
                    this.stats.hits++;
                    this.stats.memoryHits++;
                    return item.value;
                } else {
                    // Expired, remove from memory cache
                    this.memoryCache.delete(key);
                }
            }

            // Try Redis cache
            if (useRedis) {
                const value = await redisService.get(key);
                if (value !== null) {
                    this.stats.hits++;
                    this.stats.redisHits++;
                    
                    // Store in memory cache for faster access
                    if (useMemory) {
                        this.setMemoryCache(key, value, Math.min(ttl, this.memoryTTL));
                    }
                    
                    return value;
                }
            }

            // Cache miss - execute fallback if provided
            this.stats.misses++;
            
            if (fallback && typeof fallback === 'function') {
                const result = await fallback();
                
                // Cache the result
                await this.set(key, result, ttl, { useMemory, useRedis });
                
                return result;
            }

            return null;
            
        } catch (error) {
            console.warn('Cache get error:', error.message);
            
            // If cache fails, try fallback
            if (fallback && typeof fallback === 'function') {
                return await fallback();
            }
            
            return null;
        }
    }

    /**
     * Set value in cache
     */
    async set(key, value, ttl = this.defaultTTL, options = {}) {
        const { useMemory = true, useRedis = true } = options;
        
        try {
            this.stats.sets++;
            
            // Set in Redis
            if (useRedis) {
                await redisService.set(key, value, ttl);
            }

            // Set in memory cache
            if (useMemory) {
                this.setMemoryCache(key, value, Math.min(ttl, this.memoryTTL));
            }

            return true;
            
        } catch (error) {
            console.warn('Cache set error:', error.message);
            return false;
        }
    }

    /**
     * Delete value from cache
     */
    async del(key) {
        try {
            // Remove from memory cache
            this.memoryCache.delete(key);
            
            // Remove from Redis
            await redisService.del(key);
            
            return true;
            
        } catch (error) {
            console.warn('Cache delete error:', error.message);
            return false;
        }
    }

    /**
     * Invalidate cache pattern
     */
    async invalidatePattern(pattern) {
        try {
            // Invalidate memory cache entries matching pattern
            const regex = new RegExp(pattern.replace('*', '.*'));
            for (const [key] of this.memoryCache) {
                if (regex.test(key)) {
                    this.memoryCache.delete(key);
                }
            }
            
            // Invalidate Redis pattern
            await redisService.invalidatePattern(pattern);
            
            return true;
            
        } catch (error) {
            console.warn('Cache pattern invalidation error:', error.message);
            return false;
        }
    }

    /**
     * Set value in memory cache
     */
    setMemoryCache(key, value, ttl) {
        // Evict oldest items if at capacity
        if (this.memoryCache.size >= this.maxMemoryItems) {
            const firstKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(firstKey);
            this.stats.evictions++;
        }

        this.memoryCache.set(key, {
            value,
            expires: Date.now() + (ttl * 1000),
            createdAt: Date.now()
        });
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100).toFixed(2) : 0;
        const memoryHitRate = this.stats.hits > 0 ? (this.stats.memoryHits / this.stats.hits * 100).toFixed(2) : 0;
        
        return {
            ...this.stats,
            totalRequests,
            hitRate: `${hitRate}%`,
            memoryHitRate: `${memoryHitRate}%`,
            memorySize: this.memoryCache.size,
            memoryCapacity: this.maxMemoryItems
        };
    }

    /**
     * Clear all caches
     */
    async clear() {
        try {
            // Clear memory cache
            this.memoryCache.clear();
            
            // Clear Redis cache (if available)
            if (redisService.client) {
                await redisService.client.flushdb();
            }
            
            // Reset stats
            this.stats = {
                hits: 0,
                misses: 0,
                memoryHits: 0,
                redisHits: 0,
                sets: 0,
                evictions: 0
            };
            
            console.log('🧹 All caches cleared');
            return true;
            
        } catch (error) {
            console.warn('Cache clear error:', error.message);
            return false;
        }
    }

    /**
     * Warm up cache with frequently accessed data
     */
    async warmUp(warmUpData) {
        console.log('🔥 Warming up cache...');
        
        try {
            let warmedCount = 0;
            
            for (const item of warmUpData) {
                await this.set(item.key, item.value, item.ttl || this.defaultTTL);
                warmedCount++;
            }
            
            console.log(`✅ Cache warmed up with ${warmedCount} items`);
            return warmedCount;
            
        } catch (error) {
            console.warn('Cache warm-up error:', error.message);
            return 0;
        }
    }

    /**
     * Start cleanup interval for expired memory cache items
     */
    startCleanupInterval() {
        setInterval(() => {
            this.cleanupMemoryCache();
        }, 60000); // Clean up every minute
    }

    /**
     * Clean up expired memory cache items
     */
    cleanupMemoryCache() {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [key, item] of this.memoryCache) {
            if (item.expires <= now) {
                this.memoryCache.delete(key);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} expired cache items`);
        }
    }

    /**
     * Get memory cache info
     */
    getMemoryCacheInfo() {
        const items = Array.from(this.memoryCache.entries()).map(([key, item]) => ({
            key,
            size: JSON.stringify(item.value).length,
            expiresIn: Math.max(0, item.expires - Date.now()),
            age: Date.now() - item.createdAt
        }));

        return {
            totalItems: this.memoryCache.size,
            capacity: this.maxMemoryItems,
            utilizationRate: `${(this.memoryCache.size / this.maxMemoryItems * 100).toFixed(2)}%`,
            items: items.sort((a, b) => b.age - a.age) // Sort by age, newest first
        };
    }

    /**
     * Cache health check
     */
    async healthCheck() {
        try {
            const testKey = 'cache_health_test';
            const testValue = { timestamp: Date.now(), test: true };
            
            // Test memory cache
            this.setMemoryCache(testKey, testValue, 60);
            const memoryResult = this.memoryCache.get(testKey);
            const memoryHealthy = memoryResult && memoryResult.value.test === true;
            
            // Test Redis cache
            const redisHealthy = await redisService.healthCheck();
            
            // Clean up test data
            this.memoryCache.delete(testKey);
            await redisService.del(testKey);
            
            const stats = this.getStats();
            
            return {
                status: memoryHealthy ? 'healthy' : 'degraded',
                memory: {
                    status: memoryHealthy ? 'healthy' : 'unhealthy',
                    size: this.memoryCache.size,
                    capacity: this.maxMemoryItems
                },
                redis: redisHealthy,
                performance: {
                    hitRate: stats.hitRate,
                    totalRequests: stats.totalRequests,
                    memoryHits: stats.memoryHits,
                    redisHits: stats.redisHits
                }
            };
            
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }
}

// Specialized cache managers for different data types

/**
 * User Cache Manager
 * Specialized caching for user data
 */
class UserCacheManager extends CacheManager {
    constructor() {
        super();
        this.userTTL = 3600; // 1 hour for user data
    }

    async cacheUser(userId, userData) {
        const key = `user:${userId}`;
        return await this.set(key, userData, this.userTTL);
    }

    async getCachedUser(userId) {
        const key = `user:${userId}`;
        return await this.get(key);
    }

    async invalidateUser(userId) {
        await this.del(`user:${userId}`);
        await this.invalidatePattern(`user:${userId}:*`);
    }

    async cacheUserSession(userId, sessionData) {
        const key = `session:${userId}`;
        return await this.set(key, sessionData, 30 * 24 * 60 * 60); // 30 days
    }

    async getCachedUserSession(userId) {
        const key = `session:${userId}`;
        return await this.get(key);
    }
}

/**
 * Analytics Cache Manager
 * Specialized caching for analytics data
 */
class AnalyticsCacheManager extends CacheManager {
    constructor() {
        super();
        this.analyticsTTL = 900; // 15 minutes for analytics
    }

    async cacheAnalytics(type, userId, timeRange, data) {
        const key = `analytics:${type}:${userId || 'all'}:${timeRange}`;
        return await this.set(key, data, this.analyticsTTL);
    }

    async getCachedAnalytics(type, userId, timeRange) {
        const key = `analytics:${type}:${userId || 'all'}:${timeRange}`;
        return await this.get(key);
    }

    async invalidateAnalytics(type = '*', userId = '*') {
        const pattern = `analytics:${type}:${userId}:*`;
        return await this.invalidatePattern(pattern);
    }
}

/**
 * API Response Cache Manager
 * Specialized caching for API responses
 */
class ApiCacheManager extends CacheManager {
    constructor() {
        super();
        this.apiTTL = 300; // 5 minutes for API responses
    }

    async cacheApiResponse(endpoint, params, response) {
        const key = `api:${endpoint}:${this.hashParams(params)}`;
        return await this.set(key, response, this.apiTTL);
    }

    async getCachedApiResponse(endpoint, params) {
        const key = `api:${endpoint}:${this.hashParams(params)}`;
        return await this.get(key);
    }

    hashParams(params) {
        return Buffer.from(JSON.stringify(params || {})).toString('base64');
    }
}

// Export singleton instances
const cacheManager = new CacheManager();
const userCacheManager = new UserCacheManager();
const analyticsCacheManager = new AnalyticsCacheManager();
const apiCacheManager = new ApiCacheManager();

module.exports = {
    CacheManager,
    cacheManager,
    userCacheManager,
    analyticsCacheManager,
    apiCacheManager
};