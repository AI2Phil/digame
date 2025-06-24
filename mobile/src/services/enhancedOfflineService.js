import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import DeviceInfo from 'react-native-device-info';

// High-performance storage for frequently accessed data
const storage = new MMKV({
  id: 'digame-cache',
  encryptionKey: 'digame-encryption-key-2024'
});

// Offline-first storage with intelligent caching and sync
class EnhancedOfflineService {
  constructor() {
    this.isOnline = true;
    this.db = null;
    this.syncQueue = [];
    this.listeners = [];
    this.syncInProgress = false;
    this.deviceInfo = {};
    this.cacheStrategy = 'adaptive'; // adaptive, aggressive, conservative
    this.compressionEnabled = true;
    this.encryptionEnabled = true;
  }

  async initialize() {
    try {
      // Get device information for optimization
      this.deviceInfo = {
        totalMemory: await DeviceInfo.getTotalMemory(),
        usedMemory: await DeviceInfo.getUsedMemory(),
        batteryLevel: await DeviceInfo.getBatteryLevel(),
        isLowPowerMode: await DeviceInfo.isPowerSaveMode(),
        deviceType: await DeviceInfo.getDeviceType(),
        systemVersion: await DeviceInfo.getSystemVersion(),
      };

      // Adjust cache strategy based on device capabilities
      this.adjustCacheStrategy();

      // Initialize SQLite database with optimizations
      this.db = SQLite.openDatabase('digame_enhanced.db');
      await this.createOptimizedTables();
      
      // Set up intelligent sync queue
      await this.loadSyncQueue();
      
      // Initialize network monitoring
      this.setupIntelligentNetworkListener();
      
      // Check initial network state
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected;
      
      // Preload critical data
      await this.preloadCriticalData();
      
      // Start background optimization
      this.startBackgroundOptimization();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize enhanced offline service:', error);
      return false;
    }
  }

  adjustCacheStrategy() {
    const { totalMemory, batteryLevel, isLowPowerMode } = this.deviceInfo;
    
    if (isLowPowerMode || batteryLevel < 0.2) {
      this.cacheStrategy = 'conservative';
      this.compressionEnabled = true;
    } else if (totalMemory > 4000000000) { // 4GB+
      this.cacheStrategy = 'aggressive';
      this.compressionEnabled = false;
    } else {
      this.cacheStrategy = 'adaptive';
      this.compressionEnabled = true;
    }
    
    console.log(`Cache strategy set to: ${this.cacheStrategy}`);
  }

  async createOptimizedTables() {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          // Enhanced activities table with indexing
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS activities_v2 (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER,
              activity_type TEXT,
              timestamp TEXT,
              details TEXT,
              synced INTEGER DEFAULT 0,
              priority INTEGER DEFAULT 1,
              retry_count INTEGER DEFAULT 0,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP,
              updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // Create indexes for performance
          tx.executeSql(`
            CREATE INDEX IF NOT EXISTS idx_activities_user_timestamp 
            ON activities_v2(user_id, timestamp);
          `);
          
          tx.executeSql(`
            CREATE INDEX IF NOT EXISTS idx_activities_synced 
            ON activities_v2(synced);
          `);

          // Enhanced analytics cache with compression support
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS analytics_cache_v2 (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              endpoint TEXT,
              data BLOB,
              compressed INTEGER DEFAULT 0,
              timestamp TEXT,
              expires_at TEXT,
              access_count INTEGER DEFAULT 0,
              last_accessed TEXT DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // Smart sync queue with priority and batching
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS sync_queue_v2 (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              action TEXT,
              endpoint TEXT,
              method TEXT,
              data BLOB,
              priority INTEGER DEFAULT 1,
              batch_id TEXT,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP,
              retry_count INTEGER DEFAULT 0,
              max_retries INTEGER DEFAULT 3,
              next_retry_at TEXT
            );
          `);

          // User preferences with encryption support
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS user_preferences_v2 (
              key TEXT PRIMARY KEY,
              value BLOB,
              encrypted INTEGER DEFAULT 0,
              synced INTEGER DEFAULT 0,
              updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // Enhanced AI models table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS ai_models_v2 (
              model_name TEXT,
              version TEXT,
              language TEXT DEFAULT 'en',
              file_path TEXT,
              file_size INTEGER,
              checksum TEXT,
              downloaded_at TEXT,
              last_used TEXT,
              usage_count INTEGER DEFAULT 0,
              metadata TEXT,
              PRIMARY KEY (model_name, version, language)
            );
          `);

          // Performance metrics table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS performance_metrics (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              metric_type TEXT,
              value REAL,
              timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
              device_info TEXT
            );
          `);
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  setupIntelligentNetworkListener() {
    NetInfo.addEventListener((state) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected;
      
      const networkInfo = {
        isOnline: this.isOnline,
        wasOnline,
        connectionType: state.type,
        isWiFi: state.type === 'wifi',
        isMetered: state.details?.isConnectionExpensive || false,
        strength: state.details?.strength || 0,
      };
      
      // Notify listeners
      this.notifyListeners(networkInfo);
      
      // Intelligent sync based on connection quality
      if (!wasOnline && this.isOnline) {
        this.scheduleIntelligentSync(networkInfo);
      }
    });
  }

  async scheduleIntelligentSync(networkInfo) {
    const { isWiFi, isMetered, strength } = networkInfo;
    
    // Delay sync based on connection quality
    let syncDelay = 0;
    if (!isWiFi && isMetered) {
      syncDelay = 5000; // Wait 5 seconds on metered connections
    } else if (strength < 3) {
      syncDelay = 2000; // Wait 2 seconds on weak connections
    }
    
    setTimeout(() => {
      this.intelligentSync(networkInfo);
    }, syncDelay);
  }

  // High-performance caching with MMKV
  async cacheDataFast(key, data, expirationMinutes = 60) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + (expirationMinutes * 60 * 1000),
        accessCount: 0,
      };
      
      const serialized = this.compressionEnabled 
        ? this.compressData(JSON.stringify(cacheItem))
        : JSON.stringify(cacheItem);
      
      storage.set(key, serialized);
      return true;
    } catch (error) {
      console.error('Failed to cache data fast:', error);
      return false;
    }
  }

  async getCachedDataFast(key) {
    try {
      const cached = storage.getString(key);
      if (!cached) return null;
      
      const cacheItem = JSON.parse(
        this.compressionEnabled ? this.decompressData(cached) : cached
      );
      
      // Check expiration
      if (Date.now() > cacheItem.expiresAt) {
        storage.delete(key);
        return null;
      }
      
      // Update access count
      cacheItem.accessCount++;
      const serialized = this.compressionEnabled 
        ? this.compressData(JSON.stringify(cacheItem))
        : JSON.stringify(cacheItem);
      storage.set(key, serialized);
      
      return cacheItem.data;
    } catch (error) {
      console.error('Failed to get cached data fast:', error);
      return null;
    }
  }

  // Intelligent sync with batching and prioritization
  async intelligentSync(networkInfo = {}) {
    if (this.syncInProgress || !this.isOnline) return;
    
    this.syncInProgress = true;
    console.log('Starting intelligent sync...');
    
    try {
      // Prioritize sync items based on network conditions
      const prioritizedQueue = this.prioritizeSyncQueue(networkInfo);
      
      // Batch sync items for efficiency
      const batches = this.createSyncBatches(prioritizedQueue);
      
      for (const batch of batches) {
        await this.processSyncBatch(batch, networkInfo);
        
        // Pause between batches on slow connections
        if (networkInfo.strength < 3) {
          await this.delay(1000);
        }
      }
      
      // Clean up old cache entries
      await this.cleanupCache();
      
    } catch (error) {
      console.error('Intelligent sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  prioritizeSyncQueue(networkInfo) {
    return this.syncQueue.sort((a, b) => {
      // Higher priority first
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // On slow connections, prioritize smaller payloads
      if (networkInfo.strength < 3) {
        const sizeA = JSON.stringify(a.data).length;
        const sizeB = JSON.stringify(b.data).length;
        return sizeA - sizeB;
      }
      
      // Default to creation time
      return new Date(a.created_at) - new Date(b.created_at);
    });
  }

  createSyncBatches(items, maxBatchSize = 10) {
    const batches = [];
    for (let i = 0; i < items.length; i += maxBatchSize) {
      batches.push(items.slice(i, i + maxBatchSize));
    }
    return batches;
  }

  async processSyncBatch(batch, networkInfo) {
    const promises = batch.map(item => this.syncItemWithRetry(item));
    
    // Use different concurrency based on network quality
    const concurrency = networkInfo.isWiFi ? 5 : 2;
    
    for (let i = 0; i < promises.length; i += concurrency) {
      const chunk = promises.slice(i, i + concurrency);
      await Promise.allSettled(chunk);
    }
  }

  async syncItemWithRetry(item, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.syncItem(item);
        await this.removeFromSyncQueue(item.id);
        return;
      } catch (error) {
        console.error(`Sync attempt ${attempt} failed for item ${item.id}:`, error);
        
        if (attempt === maxRetries) {
          await this.handleSyncFailure(item, error);
        } else {
          // Exponential backoff
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }
  }

  async handleSyncFailure(item, error) {
    // Update retry count and schedule next retry
    const nextRetryAt = new Date(Date.now() + (60000 * Math.pow(2, item.retry_count)));
    
    await new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'UPDATE sync_queue_v2 SET retry_count = retry_count + 1, next_retry_at = ? WHERE id = ?',
            [nextRetryAt.toISOString(), item.id],
            () => resolve(),
            (_, error) => reject(error)
          );
        }
      );
    });
  }

  // Performance monitoring
  async recordPerformanceMetric(metricType, value) {
    try {
      await new Promise((resolve, reject) => {
        this.db.transaction(
          (tx) => {
            tx.executeSql(
              'INSERT INTO performance_metrics (metric_type, value, device_info) VALUES (?, ?, ?)',
              [metricType, value, JSON.stringify(this.deviceInfo)],
              () => resolve(),
              (_, error) => reject(error)
            );
          }
        );
      });
    } catch (error) {
      console.error('Failed to record performance metric:', error);
    }
  }

  // Background optimization
  startBackgroundOptimization() {
    // Clean up old data every hour
    setInterval(() => {
      this.cleanupCache();
      this.optimizeDatabase();
    }, 3600000);
    
    // Monitor performance every 5 minutes
    setInterval(() => {
      this.monitorPerformance();
    }, 300000);
  }

  async cleanupCache() {
    try {
      // Clean up expired MMKV cache
      const allKeys = storage.getAllKeys();
      for (const key of allKeys) {
        const cached = storage.getString(key);
        if (cached) {
          try {
            const cacheItem = JSON.parse(
              this.compressionEnabled ? this.decompressData(cached) : cached
            );
            if (Date.now() > cacheItem.expiresAt) {
              storage.delete(key);
            }
          } catch (error) {
            // Invalid cache item, remove it
            storage.delete(key);
          }
        }
      }
      
      // Clean up old SQLite cache entries
      await new Promise((resolve, reject) => {
        this.db.transaction(
          (tx) => {
            tx.executeSql(
              'DELETE FROM analytics_cache_v2 WHERE expires_at < datetime("now")',
              [],
              () => resolve(),
              (_, error) => reject(error)
            );
          }
        );
      });
      
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  async optimizeDatabase() {
    try {
      await new Promise((resolve, reject) => {
        this.db.transaction(
          (tx) => {
            // Vacuum database to reclaim space
            tx.executeSql('VACUUM', [], () => resolve(), (_, error) => reject(error));
          }
        );
      });
    } catch (error) {
      console.error('Database optimization failed:', error);
    }
  }

  async monitorPerformance() {
    try {
      const memoryUsage = await DeviceInfo.getUsedMemory();
      const batteryLevel = await DeviceInfo.getBatteryLevel();
      
      await this.recordPerformanceMetric('memory_usage', memoryUsage);
      await this.recordPerformanceMetric('battery_level', batteryLevel);
      
      // Adjust cache strategy if needed
      if (batteryLevel < 0.15 && this.cacheStrategy !== 'conservative') {
        this.cacheStrategy = 'conservative';
        this.compressionEnabled = true;
        console.log('Switched to conservative cache strategy due to low battery');
      }
      
    } catch (error) {
      console.error('Performance monitoring failed:', error);
    }
  }

  // Utility methods
  compressData(data) {
    // Simple compression simulation - in real app, use a proper compression library
    return data;
  }

  decompressData(data) {
    // Simple decompression simulation
    return data;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Preload critical data for offline use
  async preloadCriticalData() {
    try {
      if (this.isOnline) {
        // Preload user preferences
        await this.preloadUserPreferences();
        
        // Preload recent analytics data
        await this.preloadAnalyticsData();
        
        // Preload AI models if needed
        await this.preloadAIModels();
      }
    } catch (error) {
      console.error('Failed to preload critical data:', error);
    }
  }

  async preloadUserPreferences() {
    // Implementation for preloading user preferences
    console.log('Preloading user preferences...');
  }

  async preloadAnalyticsData() {
    // Implementation for preloading analytics data
    console.log('Preloading analytics data...');
  }

  async preloadAIModels() {
    // Implementation for preloading AI models
    console.log('Preloading AI models...');
  }

  // Public API methods
  addNetworkListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners(networkState) {
    this.listeners.forEach(listener => {
      try {
        listener(networkState);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      syncQueueLength: this.syncQueue.length,
      syncInProgress: this.syncInProgress,
      cacheStrategy: this.cacheStrategy,
      deviceInfo: this.deviceInfo,
    };
  }

  // Legacy compatibility methods
  async cacheData(endpoint, data, expirationMinutes = 60) {
    return this.cacheDataFast(`cache_${endpoint}`, data, expirationMinutes);
  }

  async getCachedData(endpoint) {
    return this.getCachedDataFast(`cache_${endpoint}`);
  }

  async syncData() {
    return this.intelligentSync();
  }

  async clearCache() {
    try {
      storage.clearAll();
      await this.cleanupCache();
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }
}

export default new EnhancedOfflineService();