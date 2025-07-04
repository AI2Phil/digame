import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8000'; // Update this for production

/**
 * Advanced Analytics Service
 * Provides ML-powered analytics, predictions, and insights for mobile app
 * Integrates with backend advanced_analytics_router.py endpoints
 */
class AdvancedAnalyticsService {
  
  /**
   * Get authentication headers with JWT token
   */
  static async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Handle API errors with detailed logging
   */
  static async handleApiError(response, context) {
    const errorText = await response.text();
    console.error(`${context} error:`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    
    let errorMessage = `${context} failed`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      // Use default message if JSON parsing fails
    }
    
    throw new Error(errorMessage);
  }

  /**
   * User Behavior Analysis with ML clustering
   * @param {number|null} userId - Specific user ID or null for all users
   * @param {number} days - Number of days to analyze (1-365)
   */
  static async getUserBehaviorAnalysis(userId = null, days = 30) {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams({
        days: days.toString(),
        ...(userId && { user_id: userId.toString() })
      });
      
      const response = await fetch(
        `${API_BASE_URL}/advanced-analytics/user-behavior?${params}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        await this.handleApiError(response, 'User behavior analysis');
      }

      return await response.json();
    } catch (error) {
      console.error('User behavior analysis error:', error);
      throw error;
    }
  }

  /**
   * Anomaly Detection using ML models
   * @param {string} metric - Metric to analyze ('user_activity', 'revenue', etc.)
   * @param {number} days - Number of days to analyze (7-90)
   */
  static async getAnomalyDetection(metric = 'user_activity', days = 30) {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams({
        metric,
        days: days.toString()
      });
      
      const response = await fetch(
        `${API_BASE_URL}/advanced-analytics/anomaly-detection?${params}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        await this.handleApiError(response, 'Anomaly detection');
      }

      return await response.json();
    } catch (error) {
      console.error('Anomaly detection error:', error);
      throw error;
    }
  }

  /**
   * Revenue Prediction using ML models
   * @param {number} daysAhead - Days ahead to predict (1-365)
   */
  static async getRevenuePrediction(daysAhead = 30) {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams({
        days_ahead: daysAhead.toString()
      });
      
      const response = await fetch(
        `${API_BASE_URL}/advanced-analytics/revenue-prediction?${params}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        await this.handleApiError(response, 'Revenue prediction');
      }

      return await response.json();
    } catch (error) {
      console.error('Revenue prediction error:', error);
      throw error;
    }
  }

  /**
   * Churn Prediction with risk assessment
   * @param {number|null} userId - Specific user ID or null for all users
   */
  static async getChurnPrediction(userId = null) {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams({
        ...(userId && { user_id: userId.toString() })
      });
      
      const response = await fetch(
        `${API_BASE_URL}/advanced-analytics/churn-prediction?${params}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        await this.handleApiError(response, 'Churn prediction');
      }

      return await response.json();
    } catch (error) {
      console.error('Churn prediction error:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive insights report
   * @param {number} days - Number of days to analyze (7-90)
   */
  static async getInsightsReport(days = 30) {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams({
        days: days.toString()
      });
      
      const response = await fetch(
        `${API_BASE_URL}/advanced-analytics/insights-report?${params}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        await this.handleApiError(response, 'Insights report generation');
      }

      return await response.json();
    } catch (error) {
      console.error('Insights report error:', error);
      throw error;
    }
  }

  /**
   * Get platform performance metrics
   */
  static async getPerformanceMetrics() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(
        `${API_BASE_URL}/advanced-analytics/performance-metrics`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        await this.handleApiError(response, 'Performance metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Performance metrics error:', error);
      throw error;
    }
  }

  /**
   * Get ML models status and capabilities
   */
  static async getMLModelsStatus() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(
        `${API_BASE_URL}/advanced-analytics/ml-models/status`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        await this.handleApiError(response, 'ML models status');
      }

      return await response.json();
    } catch (error) {
      console.error('ML models status error:', error);
      throw error;
    }
  }

  /**
   * Configure analytics settings
   * @param {Object} config - Configuration object
   */
  static async configureAnalytics(config) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(
        `${API_BASE_URL}/advanced-analytics/configure`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(config),
        }
      );

      if (!response.ok) {
        await this.handleApiError(response, 'Analytics configuration');
      }

      return await response.json();
    } catch (error) {
      console.error('Analytics configuration error:', error);
      throw error;
    }
  }

  /**
   * Health check for analytics services
   */
  static async getHealthCheck() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(
        `${API_BASE_URL}/advanced-analytics/health`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        await this.handleApiError(response, 'Analytics health check');
      }

      return await response.json();
    } catch (error) {
      console.error('Analytics health check error:', error);
      throw error;
    }
  }

  /**
   * Cache management for offline analytics
   */
  static async cacheAnalyticsData(key, data, ttl = 3600) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: ttl * 1000, // Convert to milliseconds
      };
      
      await AsyncStorage.setItem(
        `analytics_cache_${key}`, 
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Analytics cache error:', error);
    }
  }

  /**
   * Retrieve cached analytics data
   */
  static async getCachedAnalyticsData(key) {
    try {
      const cachedData = await AsyncStorage.getItem(`analytics_cache_${key}`);
      
      if (!cachedData) {
        return null;
      }

      const { data, timestamp, ttl } = JSON.parse(cachedData);
      
      // Check if cache is still valid
      if (Date.now() - timestamp > ttl) {
        await AsyncStorage.removeItem(`analytics_cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Analytics cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Clear all analytics cache
   */
  static async clearAnalyticsCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const analyticsKeys = keys.filter(key => key.startsWith('analytics_cache_'));
      
      if (analyticsKeys.length > 0) {
        await AsyncStorage.multiRemove(analyticsKeys);
      }
    } catch (error) {
      console.error('Analytics cache clear error:', error);
    }
  }

  /**
   * Batch analytics data loading with caching
   * @param {Object} requests - Object with request configurations
   */
  static async batchLoadAnalytics(requests) {
    const results = {};
    const promises = [];

    for (const [key, config] of Object.entries(requests)) {
      // Check cache first
      const cachedData = await this.getCachedAnalyticsData(key);
      
      if (cachedData && !config.forceRefresh) {
        results[key] = cachedData;
        continue;
      }

      // Create API request promise
      let promise;
      switch (config.type) {
        case 'userBehavior':
          promise = this.getUserBehaviorAnalysis(config.userId, config.days);
          break;
        case 'anomalies':
          promise = this.getAnomalyDetection(config.metric, config.days);
          break;
        case 'revenuePrediction':
          promise = this.getRevenuePrediction(config.daysAhead);
          break;
        case 'churnPrediction':
          promise = this.getChurnPrediction(config.userId);
          break;
        case 'insightsReport':
          promise = this.getInsightsReport(config.days);
          break;
        case 'performanceMetrics':
          promise = this.getPerformanceMetrics();
          break;
        case 'mlModelsStatus':
          promise = this.getMLModelsStatus();
          break;
        default:
          console.warn(`Unknown analytics request type: ${config.type}`);
          continue;
      }

      promises.push(
        promise
          .then(data => {
            results[key] = data;
            // Cache the result
            this.cacheAnalyticsData(key, data, config.cacheTtl || 3600);
            return data;
          })
          .catch(error => {
            console.error(`Analytics request ${key} failed:`, error);
            results[key] = null;
            return null;
          })
      );
    }

    // Wait for all requests to complete
    await Promise.allSettled(promises);
    
    return results;
  }

  /**
   * Get analytics summary for dashboard
   * @param {number} days - Number of days to analyze
   */
  static async getAnalyticsSummary(days = 7) {
    try {
      const cacheKey = `summary_${days}d`;
      const cached = await this.getCachedAnalyticsData(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Load essential analytics data
      const [userBehavior, anomalies, performanceMetrics] = await Promise.allSettled([
        this.getUserBehaviorAnalysis(null, days),
        this.getAnomalyDetection('user_activity', days),
        this.getPerformanceMetrics(),
      ]);

      const summary = {
        timestamp: new Date().toISOString(),
        period_days: days,
        user_behavior: userBehavior.status === 'fulfilled' ? userBehavior.value : null,
        anomalies_count: anomalies.status === 'fulfilled' ? anomalies.value.length : 0,
        critical_anomalies: anomalies.status === 'fulfilled' 
          ? anomalies.value.filter(a => a.severity === 'high').length 
          : 0,
        performance_status: performanceMetrics.status === 'fulfilled' 
          ? 'healthy' 
          : 'unknown',
        ml_available: false, // Will be updated by ML status check
      };

      // Cache summary for 30 minutes
      await this.cacheAnalyticsData(cacheKey, summary, 1800);
      
      return summary;
    } catch (error) {
      console.error('Analytics summary error:', error);
      throw error;
    }
  }

  /**
   * Export analytics data for offline use
   * @param {string} format - Export format ('json', 'csv')
   * @param {Object} options - Export options
   */
  static async exportAnalyticsData(format = 'json', options = {}) {
    try {
      const { days = 30, includeRawData = false } = options;
      
      const exportData = await this.batchLoadAnalytics({
        userBehavior: { type: 'userBehavior', days },
        anomalies: { type: 'anomalies', metric: 'user_activity', days },
        insightsReport: { type: 'insightsReport', days },
        performanceMetrics: { type: 'performanceMetrics' },
      });

      const exportPackage = {
        export_timestamp: new Date().toISOString(),
        export_format: format,
        period_days: days,
        data: exportData,
        metadata: {
          app_version: '1.0.0', // Should come from app config
          platform: 'mobile',
          include_raw_data: includeRawData,
        },
      };

      if (format === 'csv') {
        // Convert to CSV format (simplified)
        return this.convertToCSV(exportPackage);
      }

      return exportPackage;
    } catch (error) {
      console.error('Analytics export error:', error);
      throw error;
    }
  }

  /**
   * Convert analytics data to CSV format
   * @param {Object} data - Analytics data to convert
   */
  static convertToCSV(data) {
    // Simplified CSV conversion - in production, use a proper CSV library
    const csvLines = [];
    csvLines.push('timestamp,metric,value,type');
    
    // Add user behavior data
    if (data.data.userBehavior?.data?.activity_trend) {
      data.data.userBehavior.data.activity_trend.forEach((value, index) => {
        csvLines.push(`${new Date().toISOString()},activity_trend,${value},user_behavior`);
      });
    }

    // Add anomalies data
    if (data.data.anomalies) {
      data.data.anomalies.forEach(anomaly => {
        csvLines.push(`${anomaly.timestamp},${anomaly.metric_name},${anomaly.value},anomaly`);
      });
    }

    return csvLines.join('\n');
  }
}

export { AdvancedAnalyticsService };