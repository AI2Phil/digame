const Redis = require('ioredis');

class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.initialize();
    }

    initialize() {
        try {
            // Only initialize Redis if REDIS_URL is provided (Docker environment)
            if (process.env.REDIS_URL) {
                console.log('🔗 Initializing Redis connection...');
                this.client = new Redis(process.env.REDIS_URL, {
                    retryDelayOnFailover: 100,
                    enableReadyCheck: true,
                    maxRetriesPerRequest: 3,
                    lazyConnect: true
                });

                this.client.on('connect', () => {
                    console.log('✅ Redis connected successfully');
                    this.isConnected = true;
                });

                this.client.on('error', (error) => {
                    console.warn('⚠️ Redis connection error:', error.message);
                    this.isConnected = false;
                });

                this.client.on('close', () => {
                    console.log('🔌 Redis connection closed');
                    this.isConnected = false;
                });
            } else {
                console.log('ℹ️ Redis not configured - running without cache layer');
            }
        } catch (error) {
            console.warn('⚠️ Redis initialization failed:', error.message);
            this.client = null;
            this.isConnected = false;
        }
    }

    async get(key) {
        if (!this.isConnected || !this.client) return null;
        
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.warn('Redis GET error:', error.message);
            return null;
        }
    }

    async set(key, value, ttl = 3600) {
        if (!this.isConnected || !this.client) return false;
        
        try {
            const serialized = JSON.stringify(value);
            if (ttl > 0) {
                await this.client.setex(key, ttl, serialized);
            } else {
                await this.client.set(key, serialized);
            }
            return true;
        } catch (error) {
            console.warn('Redis SET error:', error.message);
            return false;
        }
    }

    async del(key) {
        if (!this.isConnected || !this.client) return false;
        
        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.warn('Redis DEL error:', error.message);
            return false;
        }
    }

    async invalidatePattern(pattern) {
        if (!this.isConnected || !this.client) return false;
        
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(...keys);
            }
            return true;
        } catch (error) {
            console.warn('Redis pattern invalidation error:', error.message);
            return false;
        }
    }

    // Session management
    async setSession(userId, sessionData, ttl = 30 * 24 * 60 * 60) { // 30 days default
        return await this.set(`session:${userId}`, sessionData, ttl);
    }

    async getSession(userId) {
        return await this.get(`session:${userId}`);
    }

    async deleteSession(userId) {
        return await this.del(`session:${userId}`);
    }

    // User data caching
    async cacheUser(userId, userData, ttl = 60 * 60) { // 1 hour default
        return await this.set(`user:${userId}`, userData, ttl);
    }

    async getCachedUser(userId) {
        return await this.get(`user:${userId}`);
    }

    async invalidateUserCache(userId) {
        await this.del(`user:${userId}`);
        await this.invalidatePattern(`user:${userId}:*`);
    }

    // Analytics caching
    async cacheAnalytics(key, data, ttl = 15 * 60) { // 15 minutes default
        return await this.set(`analytics:${key}`, data, ttl);
    }

    async getCachedAnalytics(key) {
        return await this.get(`analytics:${key}`);
    }

    // Rate limiting
    async checkRateLimit(key, limit, window) {
        if (!this.isConnected || !this.client) return { allowed: true, remaining: limit };
        
        try {
            const current = await this.client.incr(key);
            if (current === 1) {
                await this.client.expire(key, window);
            }
            
            const remaining = Math.max(0, limit - current);
            return {
                allowed: current <= limit,
                remaining,
                resetTime: await this.client.ttl(key)
            };
        } catch (error) {
            console.warn('Redis rate limit error:', error.message);
            return { allowed: true, remaining: limit };
        }
    }

    // Health check
    async healthCheck() {
        if (!this.client) {
            return {
                status: 'disabled',
                message: 'Redis not configured'
            };
        }

        try {
            const start = Date.now();
            await this.client.ping();
            const responseTime = Date.now() - start;
            
            const info = await this.client.info('memory');
            const memoryUsage = this.parseRedisInfo(info);
            
            return {
                status: 'healthy',
                connected: this.isConnected,
                responseTime: `${responseTime}ms`,
                memoryUsage: memoryUsage.used_memory_human || 'unknown'
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                connected: false,
                error: error.message
            };
        }
    }

    parseRedisInfo(info) {
        const lines = info.split('\r\n');
        const result = {};
        
        lines.forEach(line => {
            if (line.includes(':')) {
                const [key, value] = line.split(':');
                result[key] = value;
            }
        });
        
        return result;
    }

    async close() {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
        }
    }
}

// Export singleton instance
const redisService = new RedisService();
module.exports = redisService;