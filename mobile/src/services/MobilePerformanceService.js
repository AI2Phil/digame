/**
 * Mobile Performance Optimization Service
 * Optimizes mobile API calls, implements progressive loading, and manages battery/memory
 * Features: Intelligent caching, request batching, performance monitoring
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import * as Battery from 'expo-battery';
import { AppState, InteractionManager } from 'react-native';

class MobilePerformanceService {
  constructor() {
    this.requestQueue = [];
    this.cacheManager = new IntelligentCacheManager();
    this.batchProcessor = new RequestBatchProcessor();
    this.performanceMonitor = new PerformanceMonitor();
    this.memoryManager = new MemoryManager();
    this.batteryOptimizer = new BatteryOptimizer();
    
    // Performance configuration
    this.config = {
      api_optimization: {
        batch_size: 5,
        batch_delay: 1000, // 1 second
        retry_attempts: 3,
        timeout: 10000, // 10 seconds
        compression_enabled: true
      },
      caching: {
        max_cache_size: 50 * 1024 * 1024, // 50MB
        cache_ttl: 3600000, // 1 hour
        aggressive_caching: false,
        cache_compression: true
      },
      progressive_loading: {
        enabled: true,
        chunk_size: 20,
        load_delay: 100,
        priority_loading: true
      },
      battery_optimization: {
        enabled: true,
        low_battery_threshold: 0.2,
        background_sync_limit: 5,
        reduce_animations: true
      },
      memory_management: {
        enabled: true,
        gc_threshold: 0.8,
        image_cache_limit: 20,
        data_cleanup_interval: 300000 // 5 minutes
      }
    };

    this.initializePerformanceOptimization();
  }

  async initializePerformanceOptimization() {
    try {
      // Initialize performance monitoring
      await this.performanceMonitor.initialize();
      
      // Setup memory management
      await this.memoryManager.initialize();
      
      // Initialize battery optimization
      await this.batteryOptimizer.initialize();
      
      // Setup app state monitoring
      this.setupAppStateMonitoring();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();

      await this.logPerformanceEvent('performance_service_initialized', 'info');
    } catch (error) {
      console.error('Failed to initialize performance service:', error);
    }
  }

  // ==================== API OPTIMIZATION ====================

  /**
   * Optimized API request with intelligent batching and caching
   */
  async optimizedRequest(url, options = {}) {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(url, options);
      const cachedResponse = await this.cacheManager.get(cacheKey);
      
      if (cachedResponse && !options.bypassCache) {
        await this.logPerformanceEvent('cache_hit', 'info', { url });
        return cachedResponse;
      }

      // Check if request should be batched
      if (this.shouldBatchRequest(options)) {
        return await this.addToBatch(url, options);
      }

      // Execute single request with optimization
      const response = await this.executeOptimizedRequest(url, options);
      
      // Cache response if appropriate
      if (this.shouldCacheResponse(response, options)) {
        await this.cacheManager.set(cacheKey, response, options.cacheTTL);
      }

      return response;
    } catch (error) {
      await this.logPerformanceEvent('api_request_failed', 'error', {
        url,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Execute optimized API request
   */
  async executeOptimizedRequest(url, options) {
    const startTime = Date.now();
    
    try {
      // Apply request optimizations
      const optimizedOptions = await this.optimizeRequestOptions(options);
      
      // Execute request with timeout and retry logic
      const response = await this.requestWithRetry(url, optimizedOptions);
      
      // Monitor performance
      const duration = Date.now() - startTime;
      await this.performanceMonitor.recordAPICall(url, duration, response.status);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.performanceMonitor.recordAPICall(url, duration, 'error');
      throw error;
    }
  }

  /**
   * Request with retry logic and exponential backoff
   */
  async requestWithRetry(url, options, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.api_optimization.timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok && attempt < this.config.api_optimization.retry_attempts) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.requestWithRetry(url, options, attempt + 1);
      }
      
      return response;
    } catch (error) {
      if (attempt < this.config.api_optimization.retry_attempts) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.requestWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Batch multiple requests for efficiency
   */
  async addToBatch(url, options) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        url,
        options,
        resolve,
        reject,
        timestamp: Date.now()
      });

      // Process batch if queue is full or after delay
      if (this.requestQueue.length >= this.config.api_optimization.batch_size) {
        this.processBatch();
      } else {
        setTimeout(() => {
          if (this.requestQueue.length > 0) {
            this.processBatch();
          }
        }, this.config.api_optimization.batch_delay);
      }
    });
  }

  /**
   * Process batched requests
   */
  async processBatch() {
    if (this.requestQueue.length === 0) return;

    const batch = this.requestQueue.splice(0, this.config.api_optimization.batch_size);
    
    try {
      const results = await this.batchProcessor.processBatch(batch);
      
      // Resolve individual promises
      batch.forEach((request, index) => {
        if (results[index].success) {
          request.resolve(results[index].data);
        } else {
          request.reject(new Error(results[index].error));
        }
      });

      await this.logPerformanceEvent('batch_processed', 'info', {
        batch_size: batch.length,
        success_count: results.filter(r => r.success).length
      });
    } catch (error) {
      // Reject all promises in batch
      batch.forEach(request => request.reject(error));
      
      await this.logPerformanceEvent('batch_failed', 'error', {
        batch_size: batch.length,
        error: error.message
      });
    }
  }

  // ==================== PROGRESSIVE LOADING ====================

  /**
   * Load data progressively with priority-based loading
   */
  async loadDataProgressively(dataSource, options = {}) {
    try {
      const {
        chunkSize = this.config.progressive_loading.chunk_size,
        loadDelay = this.config.progressive_loading.load_delay,
        priorityItems = [],
        onChunkLoaded = () => {}
      } = options;

      const results = [];
      let loadedCount = 0;

      // Load priority items first
      if (priorityItems.length > 0) {
        const priorityData = await this.loadPriorityItems(priorityItems);
        results.push(...priorityData);
        onChunkLoaded(priorityData, 'priority');
      }

      // Load remaining data in chunks
      const remainingData = dataSource.filter(item => 
        !priorityItems.some(priority => priority.id === item.id)
      );

      for (let i = 0; i < remainingData.length; i += chunkSize) {
        const chunk = remainingData.slice(i, i + chunkSize);
        
        // Wait for interaction to complete before loading next chunk
        await InteractionManager.runAfterInteractions();
        
        const chunkData = await this.loadDataChunk(chunk);
        results.push(...chunkData);
        loadedCount += chunkData.length;
        
        onChunkLoaded(chunkData, 'chunk', {
          loaded: loadedCount,
          total: remainingData.length
        });

        // Add delay between chunks to prevent blocking UI
        if (i + chunkSize < remainingData.length) {
          await new Promise(resolve => setTimeout(resolve, loadDelay));
        }
      }

      await this.logPerformanceEvent('progressive_loading_completed', 'info', {
        total_items: results.length,
        chunks_loaded: Math.ceil(remainingData.length / chunkSize)
      });

      return results;
    } catch (error) {
      await this.logPerformanceEvent('progressive_loading_failed', 'error', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Load priority items first
   */
  async loadPriorityItems(priorityItems) {
    const promises = priorityItems.map(item => this.loadSingleItem(item));
    return await Promise.all(promises);
  }

  /**
   * Load a chunk of data
   */
  async loadDataChunk(chunk) {
    const promises = chunk.map(item => this.loadSingleItem(item));
    return await Promise.all(promises);
  }

  /**
   * Load a single data item
   */
  async loadSingleItem(item) {
    // Implementation would depend on data type
    return item;
  }

  // ==================== BATTERY OPTIMIZATION ====================

  /**
   * Optimize operations based on battery level
   */
  async optimizeForBattery() {
    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      const batteryState = await Battery.getBatteryStateAsync();
      
      const optimizations = await this.batteryOptimizer.getOptimizations(
        batteryLevel,
        batteryState
      );

      // Apply optimizations
      await this.applyBatteryOptimizations(optimizations);

      await this.logPerformanceEvent('battery_optimization_applied', 'info', {
        battery_level: batteryLevel,
        optimizations: optimizations.length
      });

      return optimizations;
    } catch (error) {
      console.error('Battery optimization failed:', error);
      return [];
    }
  }

  /**
   * Apply battery optimizations
   */
  async applyBatteryOptimizations(optimizations) {
    for (const optimization of optimizations) {
      switch (optimization.type) {
        case 'reduce_api_frequency':
          this.config.api_optimization.batch_delay *= 2;
          break;
        case 'disable_background_sync':
          this.config.battery_optimization.background_sync_limit = 0;
          break;
        case 'reduce_cache_operations':
          this.config.caching.aggressive_caching = false;
          break;
        case 'limit_animations':
          this.config.battery_optimization.reduce_animations = true;
          break;
      }
    }
  }

  // ==================== MEMORY MANAGEMENT ====================

  /**
   * Monitor and optimize memory usage
   */
  async optimizeMemoryUsage() {
    try {
      const memoryInfo = await this.memoryManager.getMemoryInfo();
      
      if (memoryInfo.usage_ratio > this.config.memory_management.gc_threshold) {
        await this.performMemoryCleanup();
      }

      await this.logPerformanceEvent('memory_optimization_check', 'info', memoryInfo);
      
      return memoryInfo;
    } catch (error) {
      console.error('Memory optimization failed:', error);
      return null;
    }
  }

  /**
   * Perform memory cleanup
   */
  async performMemoryCleanup() {
    try {
      // Clear old cache entries
      await this.cacheManager.cleanup();
      
      // Clear image cache
      await this.memoryManager.clearImageCache();
      
      // Clear old logs
      await this.clearOldLogs();
      
      // Force garbage collection (if available)
      if (global.gc) {
        global.gc();
      }

      await this.logPerformanceEvent('memory_cleanup_performed', 'info');
    } catch (error) {
      console.error('Memory cleanup failed:', error);
    }
  }

  // ==================== PERFORMANCE MONITORING ====================

  /**
   * Start continuous performance monitoring
   */
  startPerformanceMonitoring() {
    // Monitor API performance
    setInterval(async () => {
      await this.performanceMonitor.collectMetrics();
    }, 30000); // Every 30 seconds

    // Monitor memory usage
    setInterval(async () => {
      await this.optimizeMemoryUsage();
    }, this.config.memory_management.data_cleanup_interval);

    // Monitor battery optimization
    setInterval(async () => {
      await this.optimizeForBattery();
    }, 60000); // Every minute
  }

  /**
   * Setup app state monitoring for performance optimization
   */
  setupAppStateMonitoring() {
    AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'background') {
        await this.handleAppBackground();
      } else if (nextAppState === 'active') {
        await this.handleAppForeground();
      }
    });
  }

  /**
   * Handle app going to background
   */
  async handleAppBackground() {
    try {
      // Reduce background operations
      this.config.api_optimization.batch_delay *= 3;
      this.config.battery_optimization.background_sync_limit = 2;
      
      // Perform cleanup
      await this.performMemoryCleanup();

      await this.logPerformanceEvent('app_backgrounded', 'info');
    } catch (error) {
      console.error('Failed to handle app background:', error);
    }
  }

  /**
   * Handle app coming to foreground
   */
  async handleAppForeground() {
    try {
      // Restore normal operations
      this.config.api_optimization.batch_delay = 1000;
      this.config.battery_optimization.background_sync_limit = 5;
      
      // Check for pending operations
      if (this.requestQueue.length > 0) {
        await this.processBatch();
      }

      await this.logPerformanceEvent('app_foregrounded', 'info');
    } catch (error) {
      console.error('Failed to handle app foreground:', error);
    }
  }

  // ==================== UTILITY METHODS ====================

  generateCacheKey(url, options) {
    const keyData = {
      url,
      method: options.method || 'GET',
      body: options.body,
      params: options.params
    };
    return btoa(JSON.stringify(keyData));
  }

  shouldBatchRequest(options) {
    return options.batchable !== false && 
           (options.method || 'GET') === 'GET' &&
           !options.urgent;
  }

  shouldCacheResponse(response, options) {
    return response.ok && 
           (options.method || 'GET') === 'GET' &&
           options.cacheable !== false;
  }

  async optimizeRequestOptions(options) {
    const optimized = { ...options };
    
    // Add compression if enabled
    if (this.config.api_optimization.compression_enabled) {
      optimized.headers = {
        ...optimized.headers,
        'Accept-Encoding': 'gzip, deflate'
      };
    }
    
    return optimized;
  }

  async clearOldLogs() {
    try {
      const logKeys = [
        'performance_logs',
        'mobile_ai_logs',
        'offline_service_logs',
        'workflow_logs'
      ];

      for (const key of logKeys) {
        const logs = await AsyncStorage.getItem(key);
        if (logs) {
          const parsedLogs = JSON.parse(logs);
          if (parsedLogs.length > 50) {
            const recentLogs = parsedLogs.slice(-50);
            await AsyncStorage.setItem(key, JSON.stringify(recentLogs));
          }
        }
      }
    } catch (error) {
      console.error('Failed to clear old logs:', error);
    }
  }

  async logPerformanceEvent(event_type, level, details = {}) {
    try {
      const logEntry = {
        event_type,
        level,
        details,
        timestamp: new Date().toISOString(),
        service: 'MobilePerformanceService'
      };

      const existingLogs = await AsyncStorage.getItem('performance_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logEntry);
      
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      await AsyncStorage.setItem('performance_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log performance event:', error);
    }
  }

  // ==================== PUBLIC API ====================

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    return await this.performanceMonitor.getMetrics();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await this.cacheManager.getStats();
  }

  /**
   * Configure performance settings
   */
  async configurePerformance(newConfig) {
    this.config = { ...this.config, ...newConfig };
    await AsyncStorage.setItem('performance_config', JSON.stringify(this.config));
    
    await this.logPerformanceEvent('performance_configured', 'info', newConfig);
  }

  /**
   * Clear all caches
   */
  async clearAllCaches() {
    await this.cacheManager.clearAll();
    await this.logPerformanceEvent('caches_cleared', 'info');
  }

  /**
   * Get performance status
   */
  async getPerformanceStatus() {
    const [metrics, cacheStats, memoryInfo] = await Promise.all([
      this.getPerformanceMetrics(),
      this.getCacheStats(),
      this.memoryManager.getMemoryInfo()
    ]);

    return {
      api_performance: metrics,
      cache_performance: cacheStats,
      memory_usage: memoryInfo,
      battery_optimization: await this.batteryOptimizer.getStatus(),
      config: this.config
    };
  }
}

// ==================== SUPPORTING CLASSES ====================

class IntelligentCacheManager {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      size: 0
    };
  }

  async get(key) {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      if (entry.expires > Date.now()) {
        this.stats.hits++;
        return entry.data;
      } else {
        this.cache.delete(key);
      }
    }
    this.stats.misses++;
    return null;
  }

  async set(key, data, ttl = 3600000) {
    const entry = {
      data,
      expires: Date.now() + ttl,
      size: JSON.stringify(data).length
    };
    
    this.cache.set(key, entry);
    this.stats.sets++;
    this.stats.size += entry.size;
  }

  async cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires <= now) {
        this.cache.delete(key);
        this.stats.size -= entry.size;
      }
    }
  }

  async clearAll() {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, sets: 0, size: 0 };
  }

  async getStats() {
    return {
      ...this.stats,
      hit_rate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      entry_count: this.cache.size
    };
  }
}

class RequestBatchProcessor {
  async processBatch(batch) {
    // Group requests by domain/endpoint for optimization
    const grouped = this.groupRequests(batch);
    const results = [];

    for (const group of grouped) {
      try {
        const groupResults = await this.processGroup(group);
        results.push(...groupResults);
      } catch (error) {
        // Add error results for failed group
        group.forEach(() => {
          results.push({ success: false, error: error.message });
        });
      }
    }

    return results;
  }

  groupRequests(batch) {
    const groups = new Map();
    
    batch.forEach(request => {
      const domain = new URL(request.url).hostname;
      if (!groups.has(domain)) {
        groups.set(domain, []);
      }
      groups.get(domain).push(request);
    });

    return Array.from(groups.values());
  }

  async processGroup(group) {
    const promises = group.map(request => 
      fetch(request.url, request.options)
        .then(response => ({ success: true, data: response }))
        .catch(error => ({ success: false, error: error.message }))
    );

    return await Promise.all(promises);
  }
}

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      api_calls: [],
      response_times: [],
      error_rates: [],
      cache_performance: {}
    };
  }

  async initialize() {
    // Initialize performance monitoring
  }

  async recordAPICall(url, duration, status) {
    this.metrics.api_calls.push({
      url,
      duration,
      status,
      timestamp: Date.now()
    });

    // Keep only last 100 API calls
    if (this.metrics.api_calls.length > 100) {
      this.metrics.api_calls.shift();
    }
  }

  async collectMetrics() {
    const recentCalls = this.metrics.api_calls.filter(
      call => Date.now() - call.timestamp < 300000 // Last 5 minutes
    );

    return {
      average_response_time: this.calculateAverageResponseTime(recentCalls),
      error_rate: this.calculateErrorRate(recentCalls),
      calls_per_minute: recentCalls.length / 5,
      slowest_endpoints: this.getSlowestEndpoints(recentCalls)
    };
  }

  calculateAverageResponseTime(calls) {
    if (calls.length === 0) return 0;
    const total = calls.reduce((sum, call) => sum + call.duration, 0);
    return total / calls.length;
  }

  calculateErrorRate(calls) {
    if (calls.length === 0) return 0;
    const errors = calls.filter(call => call.status === 'error' || call.status >= 400);
    return errors.length / calls.length;
  }

  getSlowestEndpoints(calls) {
    return calls
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(call => ({ url: call.url, duration: call.duration }));
  }

  async getMetrics() {
    return await this.collectMetrics();
  }
}

class MemoryManager {
  constructor() {
    this.imageCache = new Map();
  }

  async initialize() {
    // Initialize memory management
  }

  async getMemoryInfo() {
    // Mock implementation - would use actual memory monitoring
    return {
      used_memory: 45 * 1024 * 1024, // 45MB
      total_memory: 100 * 1024 * 1024, // 100MB
      usage_ratio: 0.45,
      image_cache_size: this.imageCache.size
    };
  }

  async clearImageCache() {
    this.imageCache.clear();
  }
}

class BatteryOptimizer {
  constructor() {
    this.optimizations = [];
  }

  async initialize() {
    // Initialize battery optimization
  }

  async getOptimizations(batteryLevel, batteryState) {
    const optimizations = [];

    if (batteryLevel < 0.2) {
      optimizations.push(
        { type: 'reduce_api_frequency', priority: 'high' },
        { type: 'disable_background_sync', priority: 'high' },
        { type: 'limit_animations', priority: 'medium' }
      );
    } else if (batteryLevel < 0.5) {
      optimizations.push(
        { type: 'reduce_cache_operations', priority: 'medium' }
      );
    }

    return optimizations;
  }

  async getStatus() {
    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      return {
        battery_level: batteryLevel,
        optimizations_active: this.optimizations.length,
        power_save_mode: batteryLevel < 0.2
      };
    } catch (error) {
      return { battery_level: 1, optimizations_active: 0, power_save_mode: false };
    }
  }
}

export default MobilePerformanceService;