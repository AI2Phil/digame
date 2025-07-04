import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

/**
 * Mobile Analytics Cache Manager
 * Handles intelligent caching, offline storage, and sync for analytics data
 * Optimized for mobile performance and battery life
 */
class MobileAnalyticsCacheManager {
  constructor() {
    this.cachePrefix = 'mobile_analytics_';
    this.syncQueueKey = 'analytics_sync_queue';
    this.metadataKey = 'analytics_cache_metadata';
    this.maxCacheSize = 50 * 1024 * 1024; // 50MB max cache size
    this.defaultTTL = 3600; // 1 hour default TTL
    this.isOnline = true;
    this.syncInProgress = false;
    
    // Initialize network monitoring
    this.initializeNetworkMonitoring();
  }

  /**
   * Initialize network state monitoring
   */
  async initializeNetworkMonitoring() {
    try {
      // Get initial network state
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected && netInfo.isInternetReachable;

      // Subscribe to network state changes
      NetInfo.addEventListener(state => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected && state.isInternetReachable;
        
        // If we just came online, trigger sync
        if (!wasOnline && this.isOnline) {
          this.processSyncQueue();
        }
      });
    } catch (error) {
      console.error('Network monitoring initialization failed:', error);
    }
  }

  /**
   * Generate cache key with prefix
   */
  getCacheKey(key) {
    return `${this.cachePrefix}${key}`;
  }

  /**
   * Store data in cache with metadata
   */
  async set(key, data, options = {}) {
    try {
      const {
        ttl = this.defaultTTL,
        priority = 'normal', // 'high', 'normal', 'low'
        tags = [],
        compress = false
      } = options;

      const cacheKey = this.getCacheKey(key);
      const timestamp = Date.now();
      const expiresAt = timestamp + (ttl * 1000);

      const cacheEntry = {
        data,
        metadata: {
          key,
          timestamp,
          expiresAt,
          ttl,
          priority,
          tags,
          compressed: compress,
          size: JSON.stringify(data).length,
          accessCount: 0,
          lastAccessed: timestamp
        }
      };

      // Compress data if requested and beneficial
      if (compress && cacheEntry.metadata.size > 1024) {
        // In a real implementation, you'd use a compression library
        // For now, we'll just mark it as compressed
        cacheEntry.metadata.compressed = true;
      }

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      await this.updateCacheMetadata(key, cacheEntry.metadata);

      // Check cache size and cleanup if needed
      await this.cleanupCacheIfNeeded();

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Retrieve data from cache
   */
  async get(key, options = {}) {
    try {
      const { 
        updateAccessTime = true,
        fallbackToExpired = false 
      } = options;

      const cacheKey = this.getCacheKey(key);
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (!cachedData) {
        return null;
      }

      const cacheEntry = JSON.parse(cachedData);
      const now = Date.now();

      // Check if expired
      if (now > cacheEntry.metadata.expiresAt) {
        if (!fallbackToExpired) {
          await this.remove(key);
          return null;
        }
        // Return expired data but mark it as stale
        cacheEntry.metadata.stale = true;
      }

      // Update access metadata
      if (updateAccessTime) {
        cacheEntry.metadata.accessCount++;
        cacheEntry.metadata.lastAccessed = now;
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
        await this.updateCacheMetadata(key, cacheEntry.metadata);
      }

      return {
        data: cacheEntry.data,
        metadata: cacheEntry.metadata
      };
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Remove item from cache
   */
  async remove(key) {
    try {
      const cacheKey = this.getCacheKey(key);
      await AsyncStorage.removeItem(cacheKey);
      await this.removeCacheMetadata(key);
      return true;
    } catch (error) {
      console.error('Cache remove error:', error);
      return false;
    }
  }

  /**
   * Clear all cache data
   */
  async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
      
      await AsyncStorage.removeItem(this.metadataKey);
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      const metadata = await this.getCacheMetadata();
      const keys = Object.keys(metadata);
      
      let totalSize = 0;
      let expiredCount = 0;
      let highPriorityCount = 0;
      const now = Date.now();

      keys.forEach(key => {
        const meta = metadata[key];
        totalSize += meta.size || 0;
        if (now > meta.expiresAt) expiredCount++;
        if (meta.priority === 'high') highPriorityCount++;
      });

      return {
        totalItems: keys.length,
        totalSize,
        expiredItems: expiredCount,
        highPriorityItems: highPriorityCount,
        cacheHitRate: this.calculateHitRate(metadata),
        lastCleanup: await AsyncStorage.getItem(`${this.cachePrefix}last_cleanup`),
        isOnline: this.isOnline
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        expiredItems: 0,
        highPriorityItems: 0,
        cacheHitRate: 0,
        lastCleanup: null,
        isOnline: this.isOnline
      };
    }
  }

  /**
   * Calculate cache hit rate
   */
  calculateHitRate(metadata) {
    const keys = Object.keys(metadata);
    if (keys.length === 0) return 0;

    const totalAccess = keys.reduce((sum, key) => {
      return sum + (metadata[key].accessCount || 0);
    }, 0);

    return totalAccess > 0 ? (keys.length / totalAccess) * 100 : 0;
  }

  /**
   * Intelligent cache cleanup
   */
  async cleanupCacheIfNeeded() {
    try {
      const stats = await this.getStats();
      
      // Cleanup if cache is too large or has too many expired items
      if (stats.totalSize > this.maxCacheSize || stats.expiredItems > 10) {
        await this.performCleanup();
      }
    } catch (error) {
      console.error('Cache cleanup check error:', error);
    }
  }

  /**
   * Perform cache cleanup using LRU and priority-based eviction
   */
  async performCleanup() {
    try {
      const metadata = await this.getCacheMetadata();
      const keys = Object.keys(metadata);
      const now = Date.now();

      // Sort by priority and last accessed time
      const sortedKeys = keys.sort((a, b) => {
        const metaA = metadata[a];
        const metaB = metadata[b];

        // First, remove expired items
        if (now > metaA.expiresAt && now <= metaB.expiresAt) return -1;
        if (now <= metaA.expiresAt && now > metaB.expiresAt) return 1;

        // Then by priority (low priority first)
        const priorityOrder = { low: 0, normal: 1, high: 2 };
        const priorityDiff = priorityOrder[metaA.priority] - priorityOrder[metaB.priority];
        if (priorityDiff !== 0) return priorityDiff;

        // Finally by last accessed (oldest first)
        return metaA.lastAccessed - metaB.lastAccessed;
      });

      // Remove items until we're under the size limit
      let currentSize = Object.values(metadata).reduce((sum, meta) => sum + (meta.size || 0), 0);
      const targetSize = this.maxCacheSize * 0.8; // Clean to 80% of max size
      
      for (const key of sortedKeys) {
        if (currentSize <= targetSize) break;
        
        const meta = metadata[key];
        await this.remove(key);
        currentSize -= (meta.size || 0);
      }

      await AsyncStorage.setItem(`${this.cachePrefix}last_cleanup`, Date.now().toString());
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  /**
   * Add item to sync queue for when online
   */
  async addToSyncQueue(operation, key, data = null) {
    try {
      const queue = await this.getSyncQueue();
      const syncItem = {
        id: `${Date.now()}_${Math.random()}`,
        operation, // 'fetch', 'update', 'delete'
        key,
        data,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 3
      };

      queue.push(syncItem);
      await AsyncStorage.setItem(this.syncQueueKey, JSON.stringify(queue));
      
      // Process immediately if online
      if (this.isOnline) {
        this.processSyncQueue();
      }

      return syncItem.id;
    } catch (error) {
      console.error('Sync queue add error:', error);
      return null;
    }
  }

  /**
   * Get sync queue
   */
  async getSyncQueue() {
    try {
      const queueData = await AsyncStorage.getItem(this.syncQueueKey);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Sync queue get error:', error);
      return [];
    }
  }

  /**
   * Process sync queue when online
   */
  async processSyncQueue() {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    try {
      this.syncInProgress = true;
      const queue = await this.getSyncQueue();
      
      if (queue.length === 0) {
        this.syncInProgress = false;
        return;
      }

      const processedItems = [];
      const failedItems = [];

      for (const item of queue) {
        try {
          const success = await this.processSyncItem(item);
          if (success) {
            processedItems.push(item.id);
          } else {
            item.retryCount++;
            if (item.retryCount >= item.maxRetries) {
              processedItems.push(item.id); // Remove after max retries
            } else {
              failedItems.push(item);
            }
          }
        } catch (error) {
          console.error('Sync item processing error:', error);
          item.retryCount++;
          if (item.retryCount < item.maxRetries) {
            failedItems.push(item);
          }
        }
      }

      // Update queue with failed items only
      await AsyncStorage.setItem(this.syncQueueKey, JSON.stringify(failedItems));
      
    } catch (error) {
      console.error('Sync queue processing error:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Process individual sync item
   */
  async processSyncItem(item) {
    // This would integrate with your actual API service
    // For now, we'll simulate the operations
    try {
      switch (item.operation) {
        case 'fetch':
          // Fetch fresh data and update cache
          console.log(`Syncing fetch for key: ${item.key}`);
          return true;
        case 'update':
          // Send cached data to server
          console.log(`Syncing update for key: ${item.key}`);
          return true;
        case 'delete':
          // Delete from server and cache
          console.log(`Syncing delete for key: ${item.key}`);
          await this.remove(item.key);
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error('Sync item error:', error);
      return false;
    }
  }

  /**
   * Cache metadata management
   */
  async getCacheMetadata() {
    try {
      const metadata = await AsyncStorage.getItem(this.metadataKey);
      return metadata ? JSON.parse(metadata) : {};
    } catch (error) {
      console.error('Cache metadata get error:', error);
      return {};
    }
  }

  async updateCacheMetadata(key, metadata) {
    try {
      const allMetadata = await this.getCacheMetadata();
      allMetadata[key] = metadata;
      await AsyncStorage.setItem(this.metadataKey, JSON.stringify(allMetadata));
    } catch (error) {
      console.error('Cache metadata update error:', error);
    }
  }

  async removeCacheMetadata(key) {
    try {
      const allMetadata = await this.getCacheMetadata();
      delete allMetadata[key];
      await AsyncStorage.setItem(this.metadataKey, JSON.stringify(allMetadata));
    } catch (error) {
      console.error('Cache metadata remove error:', error);
    }
  }

  /**
   * Batch operations for efficiency
   */
  async batchSet(items) {
    const results = [];
    for (const { key, data, options } of items) {
      const result = await this.set(key, data, options);
      results.push({ key, success: result });
    }
    return results;
  }

  async batchGet(keys, options = {}) {
    const results = {};
    for (const key of keys) {
      results[key] = await this.get(key, options);
    }
    return results;
  }

  /**
   * Cache warming - preload important data
   */
  async warmCache(keys) {
    try {
      // Add high-priority fetch operations to sync queue
      for (const key of keys) {
        await this.addToSyncQueue('fetch', key);
      }
      
      // Process immediately if online
      if (this.isOnline) {
        await this.processSyncQueue();
      }
    } catch (error) {
      console.error('Cache warming error:', error);
    }
  }

  /**
   * Export cache data for debugging or backup
   */
  async exportCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      const cacheData = {};

      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          cacheData[key] = JSON.parse(data);
        }
      }

      return {
        timestamp: Date.now(),
        version: '1.0.0',
        cache: cacheData,
        metadata: await this.getCacheMetadata(),
        stats: await this.getStats()
      };
    } catch (error) {
      console.error('Cache export error:', error);
      return null;
    }
  }
}

// Create singleton instance
const mobileAnalyticsCacheManager = new MobileAnalyticsCacheManager();

export default mobileAnalyticsCacheManager;
export { MobileAnalyticsCacheManager };