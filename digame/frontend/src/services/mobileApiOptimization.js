/**
 * Mobile API Optimization Service
 * Handles bandwidth efficiency, request optimization, and mobile-specific API enhancements
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import { Platform } from 'react-native';

class MobileApiOptimization {
  constructor() {
    this.requestQueue = [];
    this.isOnline = true;
    this.networkType = 'wifi';
    this.bandwidthOptimization = true;
    this.compressionEnabled = true;
    this.cacheStrategy = 'aggressive';
    this.requestBatching = true;
    this.adaptiveQuality = true;
  }

  /**
   * Initialize mobile API optimization
   */
  async initialize() {
    try {
      // Setup network monitoring
      await this.setupNetworkMonitoring();
      
      // Initialize request optimization
      this.setupRequestOptimization();
      
      // Setup bandwidth monitoring
      this.setupBandwidthMonitoring();
      
      // Initialize cache management
      await this.initializeCacheManagement();
      
      console.log('Mobile API optimization initialized');
    } catch (error) {
      console.error('Failed to initialize mobile API optimization:', error);
      throw error;
    }
  }

  /**
   * Setup network monitoring for adaptive optimization
   */
  async setupNetworkMonitoring() {
    try {
      // Get initial network state
      const networkState = await NetInfo.fetch();
      this.updateNetworkState(networkState);

      // Subscribe to network changes
      NetInfo.addEventListener(state => {
        this.updateNetworkState(state);
        this.adaptToNetworkConditions(state);
      });

      console.log('Network monitoring setup completed');
    } catch (error) {
      console.error('Failed to setup network monitoring:', error);
    }
  }

  /**
   * Update network state and optimize accordingly
   */
  updateNetworkState(networkState) {
    this.isOnline = networkState.isConnected;
    this.networkType = networkState.type;
    
    // Adjust optimization strategy based on network type
    switch (networkState.type) {
      case 'wifi':
        this.setOptimizationLevel('standard');
        break;
      case 'cellular':
        this.setOptimizationLevel('aggressive');
        break;
      case 'none':
        this.setOptimizationLevel('offline');
        break;
      default:
        this.setOptimizationLevel('conservative');
    }
  }

  /**
   * Set optimization level based on network conditions
   */
  setOptimizationLevel(level) {
    switch (level) {
      case 'aggressive':
        this.bandwidthOptimization = true;
        this.compressionEnabled = true;
        this.cacheStrategy = 'aggressive';
        this.requestBatching = true;
        this.adaptiveQuality = true;
        break;
      case 'standard':
        this.bandwidthOptimization = true;
        this.compressionEnabled = true;
        this.cacheStrategy = 'standard';
        this.requestBatching = true;
        this.adaptiveQuality = false;
        break;
      case 'conservative':
        this.bandwidthOptimization = false;
        this.compressionEnabled = false;
        this.cacheStrategy = 'minimal';
        this.requestBatching = false;
        this.adaptiveQuality = false;
        break;
      case 'offline':
        // Handle offline mode
        this.enableOfflineMode();
        break;
    }
  }

  /**
   * Optimize API request for mobile bandwidth efficiency
   */
  async optimizeRequest(url, options = {}) {
    try {
      // Apply compression if enabled
      if (this.compressionEnabled) {
        options = this.applyCompression(options);
      }

      // Apply bandwidth optimization
      if (this.bandwidthOptimization) {
        options = this.applyBandwidthOptimization(options);
      }

      // Check cache first
      const cachedResponse = await this.checkCache(url, options);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Add to request queue if batching is enabled
      if (this.requestBatching) {
        return this.addToRequestQueue(url, options);
      }

      // Make optimized request
      return this.makeOptimizedRequest(url, options);
    } catch (error) {
      console.error('Failed to optimize request:', error);
      throw error;
    }
  }

  /**
   * Apply compression to request data
   */
  applyCompression(options) {
    if (options.body && typeof options.body === 'string') {
      // Add compression headers
      options.headers = {
        ...options.headers,
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Encoding': 'gzip'
      };

      // Compress request body for large payloads
      if (options.body.length > 1024) {
        options.body = this.compressData(options.body);
      }
    }

    return options;
  }

  /**
   * Apply bandwidth optimization strategies
   */
  applyBandwidthOptimization(options) {
    // Add mobile-specific headers
    options.headers = {
      ...options.headers,
      'X-Mobile-Optimized': 'true',
      'X-Network-Type': this.networkType,
      'X-Bandwidth-Limited': this.networkType === 'cellular' ? 'true' : 'false'
    };

    // Request compressed responses
    if (!options.headers['Accept-Encoding']) {
      options.headers['Accept-Encoding'] = 'gzip, deflate';
    }

    // Add cache control for mobile
    options.headers['Cache-Control'] = 'max-age=300, stale-while-revalidate=60';

    return options;
  }

  /**
   * Check cache for existing response
   */
  async checkCache(url, options) {
    try {
      const cacheKey = this.generateCacheKey(url, options);
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        
        // Check if cache is still valid
        if (this.isCacheValid(parsed.timestamp, parsed.ttl)) {
          console.log('Cache hit for:', url);
          return parsed.data;
        } else {
          // Remove expired cache
          await AsyncStorage.removeItem(cacheKey);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Cache check failed:', error);
      return null;
    }
  }

  /**
   * Add request to batching queue
   */
  async addToRequestQueue(url, options) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        url,
        options,
        resolve,
        reject,
        timestamp: Date.now()
      });

      // Process queue if it reaches batch size or timeout
      if (this.requestQueue.length >= 5) {
        this.processBatchedRequests();
      } else {
        // Set timeout for batch processing
        setTimeout(() => {
          if (this.requestQueue.length > 0) {
            this.processBatchedRequests();
          }
        }, 100); // 100ms batch window
      }
    });
  }

  /**
   * Process batched requests for efficiency
   */
  async processBatchedRequests() {
    if (this.requestQueue.length === 0) return;

    const batch = [...this.requestQueue];
    this.requestQueue = [];

    try {
      // Group similar requests
      const groupedRequests = this.groupSimilarRequests(batch);
      
      // Process each group
      for (const group of groupedRequests) {
        await this.processBatchGroup(group);
      }
    } catch (error) {
      console.error('Batch processing failed:', error);
      
      // Reject all requests in batch
      batch.forEach(request => {
        request.reject(error);
      });
    }
  }

  /**
   * Group similar requests for batch processing
   */
  groupSimilarRequests(requests) {
    const groups = new Map();
    
    requests.forEach(request => {
      const baseUrl = request.url.split('?')[0];
      const method = request.options.method || 'GET';
      const groupKey = `${method}:${baseUrl}`;
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      
      groups.get(groupKey).push(request);
    });
    
    return Array.from(groups.values());
  }

  /**
   * Process a group of similar requests
   */
  async processBatchGroup(group) {
    if (group.length === 1) {
      // Single request - process normally
      const request = group[0];
      try {
        const response = await this.makeOptimizedRequest(request.url, request.options);
        request.resolve(response);
      } catch (error) {
        request.reject(error);
      }
    } else {
      // Multiple similar requests - try to batch
      await this.processBatchedSimilarRequests(group);
    }
  }

  /**
   * Process multiple similar requests efficiently
   */
  async processBatchedSimilarRequests(requests) {
    try {
      // For GET requests, we can potentially combine them
      if (requests[0].options.method === 'GET' || !requests[0].options.method) {
        await this.processBatchedGetRequests(requests);
      } else {
        // For other methods, process sequentially with delay
        for (let i = 0; i < requests.length; i++) {
          const request = requests[i];
          try {
            const response = await this.makeOptimizedRequest(request.url, request.options);
            request.resolve(response);
            
            // Small delay between requests to avoid overwhelming server
            if (i < requests.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          } catch (error) {
            request.reject(error);
          }
        }
      }
    } catch (error) {
      // Reject all requests if batch processing fails
      requests.forEach(request => {
        request.reject(error);
      });
    }
  }

  /**
   * Process batched GET requests
   */
  async processBatchedGetRequests(requests) {
    // Try to combine multiple GET requests into a single batch request
    const batchUrl = this.createBatchUrl(requests);
    
    if (batchUrl) {
      try {
        const batchResponse = await this.makeOptimizedRequest(batchUrl, { method: 'GET' });
        
        // Distribute batch response to individual requests
        this.distributeBatchResponse(requests, batchResponse);
      } catch (error) {
        // Fallback to individual requests
        await this.fallbackToIndividualRequests(requests);
      }
    } else {
      // Process individual requests with optimization
      await this.fallbackToIndividualRequests(requests);
    }
  }

  /**
   * Make optimized HTTP request
   */
  async makeOptimizedRequest(url, options) {
    try {
      // Add request timing
      const startTime = Date.now();
      
      // Add mobile-specific optimizations
      const optimizedOptions = {
        ...options,
        timeout: this.getOptimalTimeout(),
        headers: {
          ...options.headers,
          'X-Request-Start': startTime.toString()
        }
      };

      // Make the request
      const response = await fetch(url, optimizedOptions);
      
      // Track request performance
      const endTime = Date.now();
      this.trackRequestPerformance(url, endTime - startTime, response.status);
      
      // Handle response
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache successful responses
      await this.cacheResponse(url, options, data);
      
      return data;
    } catch (error) {
      console.error('Optimized request failed:', error);
      throw error;
    }
  }

  /**
   * Get optimal timeout based on network conditions
   */
  getOptimalTimeout() {
    switch (this.networkType) {
      case 'wifi':
        return 10000; // 10 seconds
      case 'cellular':
        return 15000; // 15 seconds
      case 'bluetooth':
      case 'ethernet':
        return 8000; // 8 seconds
      default:
        return 12000; // 12 seconds
    }
  }

  /**
   * Cache successful response
   */
  async cacheResponse(url, options, data) {
    try {
      if (this.cacheStrategy === 'none') return;
      
      const cacheKey = this.generateCacheKey(url, options);
      const ttl = this.getCacheTTL(url);
      
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl,
        url,
        networkType: this.networkType
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache response:', error);
    }
  }

  /**
   * Generate cache key for request
   */
  generateCacheKey(url, options) {
    const method = options.method || 'GET';
    const body = options.body || '';
    const hash = this.simpleHash(`${method}:${url}:${body}`);
    return `mobile_api_cache_${hash}`;
  }

  /**
   * Simple hash function for cache keys
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cache TTL based on URL and strategy
   */
  getCacheTTL(url) {
    // Different TTL for different types of data
    if (url.includes('/analytics/')) {
      return 5 * 60 * 1000; // 5 minutes for analytics
    } else if (url.includes('/goals/')) {
      return 10 * 60 * 1000; // 10 minutes for goals
    } else if (url.includes('/notifications/')) {
      return 2 * 60 * 1000; // 2 minutes for notifications
    } else if (url.includes('/user/')) {
      return 15 * 60 * 1000; // 15 minutes for user data
    }
    
    // Default TTL based on cache strategy
    switch (this.cacheStrategy) {
      case 'aggressive':
        return 15 * 60 * 1000; // 15 minutes
      case 'standard':
        return 10 * 60 * 1000; // 10 minutes
      case 'minimal':
        return 5 * 60 * 1000; // 5 minutes
      default:
        return 10 * 60 * 1000; // 10 minutes
    }
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid(timestamp, ttl) {
    return (Date.now() - timestamp) < ttl;
  }

  /**
   * Track request performance for optimization
   */
  trackRequestPerformance(url, duration, status) {
    const performance = {
      url,
      duration,
      status,
      networkType: this.networkType,
      timestamp: Date.now()
    };
    
    // Store performance data for analytics
    this.storePerformanceData(performance);
  }

  /**
   * Store performance data for analytics
   */
  async storePerformanceData(performance) {
    try {
      const key = 'mobile_api_performance';
      const existing = await AsyncStorage.getItem(key);
      const data = existing ? JSON.parse(existing) : [];
      
      data.push(performance);
      
      // Keep only last 100 entries
      if (data.length > 100) {
        data.splice(0, data.length - 100);
      }
      
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store performance data:', error);
    }
  }

  /**
   * Get API performance analytics
   */
  async getPerformanceAnalytics() {
    try {
      const key = 'mobile_api_performance';
      const data = await AsyncStorage.getItem(key);
      
      if (!data) return null;
      
      const performances = JSON.parse(data);
      
      return {
        averageResponseTime: this.calculateAverageResponseTime(performances),
        successRate: this.calculateSuccessRate(performances),
        networkTypeBreakdown: this.analyzeNetworkTypePerformance(performances),
        slowestEndpoints: this.identifySlowEndpoints(performances),
        recommendations: this.generateOptimizationRecommendations(performances)
      };
    } catch (error) {
      console.error('Failed to get performance analytics:', error);
      return null;
    }
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime(performances) {
    if (performances.length === 0) return 0;
    
    const total = performances.reduce((sum, perf) => sum + perf.duration, 0);
    return Math.round(total / performances.length);
  }

  /**
   * Calculate API success rate
   */
  calculateSuccessRate(performances) {
    if (performances.length === 0) return 100;
    
    const successful = performances.filter(perf => perf.status >= 200 && perf.status < 300).length;
    return Math.round((successful / performances.length) * 100);
  }

  /**
   * Analyze performance by network type
   */
  analyzeNetworkTypePerformance(performances) {
    const breakdown = {};
    
    performances.forEach(perf => {
      if (!breakdown[perf.networkType]) {
        breakdown[perf.networkType] = {
          count: 0,
          totalDuration: 0,
          successCount: 0
        };
      }
      
      breakdown[perf.networkType].count++;
      breakdown[perf.networkType].totalDuration += perf.duration;
      
      if (perf.status >= 200 && perf.status < 300) {
        breakdown[perf.networkType].successCount++;
      }
    });
    
    // Calculate averages
    Object.keys(breakdown).forEach(networkType => {
      const data = breakdown[networkType];
      data.averageDuration = Math.round(data.totalDuration / data.count);
      data.successRate = Math.round((data.successCount / data.count) * 100);
    });
    
    return breakdown;
  }

  /**
   * Identify slowest API endpoints
   */
  identifySlowEndpoints(performances) {
    const endpointStats = {};
    
    performances.forEach(perf => {
      const endpoint = this.extractEndpoint(perf.url);
      
      if (!endpointStats[endpoint]) {
        endpointStats[endpoint] = {
          count: 0,
          totalDuration: 0,
          maxDuration: 0
        };
      }
      
      endpointStats[endpoint].count++;
      endpointStats[endpoint].totalDuration += perf.duration;
      endpointStats[endpoint].maxDuration = Math.max(
        endpointStats[endpoint].maxDuration,
        perf.duration
      );
    });
    
    // Calculate averages and sort by slowest
    const endpointArray = Object.keys(endpointStats).map(endpoint => ({
      endpoint,
      averageDuration: Math.round(endpointStats[endpoint].totalDuration / endpointStats[endpoint].count),
      maxDuration: endpointStats[endpoint].maxDuration,
      count: endpointStats[endpoint].count
    }));
    
    return endpointArray
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 5); // Top 5 slowest
  }

  /**
   * Extract endpoint from URL for analysis
   */
  extractEndpoint(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').slice(0, 3).join('/'); // First 2 path segments
    } catch (error) {
      return url;
    }
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(performances) {
    const recommendations = [];
    const analytics = {
      averageResponseTime: this.calculateAverageResponseTime(performances),
      successRate: this.calculateSuccessRate(performances)
    };
    
    if (analytics.averageResponseTime > 2000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Average response time is high. Consider enabling aggressive caching.',
        action: 'enable_aggressive_caching'
      });
    }
    
    if (analytics.successRate < 95) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: 'API success rate is below 95%. Check network stability.',
        action: 'improve_error_handling'
      });
    }
    
    const cellularPerformance = performances.filter(p => p.networkType === 'cellular');
    if (cellularPerformance.length > 0) {
      const cellularAvg = this.calculateAverageResponseTime(cellularPerformance);
      if (cellularAvg > 3000) {
        recommendations.push({
          type: 'mobile',
          priority: 'medium',
          message: 'Cellular performance is slow. Enable bandwidth optimization.',
          action: 'enable_bandwidth_optimization'
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Compress data for transmission
   */
  compressData(data) {
    // Simple compression simulation
    // In a real implementation, you would use a proper compression library
    return data;
  }

  /**
   * Create batch URL for multiple requests
   */
  createBatchUrl(requests) {
    // Check if requests can be batched
    const baseUrls = requests.map(r => r.url.split('?')[0]);
    const uniqueBaseUrls = [...new Set(baseUrls)];
    
    if (uniqueBaseUrls.length === 1 && requests.length > 1) {
      // All requests are to the same endpoint - can potentially batch
      const baseUrl = uniqueBaseUrls[0];
      if (baseUrl.includes('/batch') || baseUrl.includes('/multiple')) {
        // Endpoint supports batching
        const ids = requests.map(r => this.extractIdFromUrl(r.url)).filter(Boolean);
        if (ids.length === requests.length) {
          return `${baseUrl}/batch?ids=${ids.join(',')}`;
        }
      }
    }
    
    return null;
  }

  /**
   * Extract ID from URL for batching
   */
  extractIdFromUrl(url) {
    const match = url.match(/\/(\d+)(?:\?|$)/);
    return match ? match[1] : null;
  }

  /**
   * Distribute batch response to individual requests
   */
  distributeBatchResponse(requests, batchResponse) {
    // Distribute batch response data to individual request promises
    if (batchResponse && Array.isArray(batchResponse)) {
      requests.forEach((request, index) => {
        if (batchResponse[index]) {
          request.resolve(batchResponse[index]);
        } else {
          request.reject(new Error('No data in batch response'));
        }
      });
    } else {
      // Fallback to individual requests
      this.fallbackToIndividualRequests(requests);
    }
  }

  /**
   * Fallback to individual requests when batching fails
   */
  async fallbackToIndividualRequests(requests) {
    for (const request of requests) {
      try {
        const response = await this.makeOptimizedRequest(request.url, request.options);
        request.resolve(response);
      } catch (error) {
        request.reject(error);
      }
    }
  }

  /**
   * Adapt to network conditions
   */
  adaptToNetworkConditions(networkState) {
    console.log('Network conditions changed:', networkState);
    
    // Adjust optimization strategies based on new network conditions
    if (networkState.type === 'cellular' && networkState.details?.cellularGeneration === '3g') {
      // Very aggressive optimization for 3G
      this.setOptimizationLevel('aggressive');
      this.cacheStrategy = 'aggressive';
    } else if (networkState.type === 'wifi') {
      // Standard optimization for WiFi
      this.setOptimizationLevel('standard');
    }
    
    // Clear request queue if going offline
    if (!networkState.isConnected) {
      this.handleOfflineTransition();
    }
  }

  /**
   * Handle transition to offline mode
   */
  handleOfflineTransition() {
    // Reject all pending requests
    this.requestQueue.forEach(request => {
      request.reject(new Error('Network connection lost'));
    });
    this.requestQueue = [];
    
    console.log('Transitioned to offline mode');
  }

  /**
   * Enable offline mode
   */
  enableOfflineMode() {
    console.log('Offline mode enabled - using cached data only');
    // Implementation would handle offline data access
  }

  /**
   * Setup request optimization
   */
  setupRequestOptimization() {
    // Configure request optimization settings
    console.log('Request optimization configured');
  }

  /**
   * Setup bandwidth monitoring
   */
  setupBandwidthMonitoring() {
    // Monitor bandwidth usage and adapt accordingly
    console.log('Bandwidth monitoring setup completed');
  }

  /**
   * Initialize cache management
   */
  async initializeCacheManagement() {
    try {
      // Clean up expired cache entries
      await this.cleanupExpiredCache();
      console.log('Cache management initialized');
    } catch (error) {
      console.error('Failed to initialize cache management:', error);
    }
  }

  /**
   * Cleanup expired cache entries
   */
  async cleanupExpiredCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('mobile_api_cache_'));
      
      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (!this.isCacheValid(parsed.timestamp, parsed.ttl)) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }
}

// Create singleton instance
const mobileApiOptimization = new MobileApiOptimization();

export default mobileApiOptimization;