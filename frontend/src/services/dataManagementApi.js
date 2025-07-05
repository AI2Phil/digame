/**
 * Data Management API Client
 * ==========================
 * 
 * Provides a comprehensive API client for all data management operations
 * including mock data generation, cleanup, backup, health monitoring,
 * and performance optimization.
 */

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/api' 
  : '/api';

class DataManagementApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'DataManagementApiError';
    this.status = status;
    this.response = response;
  }
}

class DataManagementApi {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/data-management`;
  }

  /**
   * Make authenticated API request
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new DataManagementApiError(
          data.message || 'API request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof DataManagementApiError) {
        throw error;
      }
      throw new DataManagementApiError(
        `Network error: ${error.message}`,
        0,
        null
      );
    }
  }

  // ============================================================================
  // DATA OVERVIEW & STATISTICS
  // ============================================================================

  /**
   * Get comprehensive data overview
   */
  async getDataOverview() {
    return this.makeRequest('/overview');
  }

  /**
   * Get detailed data statistics
   */
  async getDataStatistics() {
    return this.makeRequest('/statistics');
  }

  /**
   * Get basic data health metrics
   */
  async getDataHealth() {
    return this.makeRequest('/health');
  }

  /**
   * Get data management operations history
   */
  async getOperationsHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/operations${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // ============================================================================
  // MOCK DATA OPERATIONS
  // ============================================================================

  /**
   * Generate mock data
   */
  async seedMockData(options = {}) {
    const defaultOptions = {
      userCount: 50,
      teamCount: 10,
      projectCount: 25,
      taskCount: 200,
      analyticsEventCount: 1000,
      category: 'demo'
    };

    return this.makeRequest('/seed', {
      method: 'POST',
      body: JSON.stringify({ ...defaultOptions, ...options })
    });
  }

  /**
   * Cleanup mock data
   */
  async cleanupMockData(options = {}) {
    const defaultOptions = {
      categories: ['demo', 'test', 'development'],
      tables: null,
      dryRun: false
    };

    return this.makeRequest('/cleanup', {
      method: 'POST',
      body: JSON.stringify({ ...defaultOptions, ...options })
    });
  }

  /**
   * Complete data reset (nuclear option)
   */
  async resetAllData(confirmationCode, preserveUsers = true) {
    return this.makeRequest('/reset', {
      method: 'POST',
      body: JSON.stringify({
        confirmationCode,
        preserveUsers
      })
    });
  }

  /**
   * Export data for backup
   */
  async exportData(options = {}) {
    const defaultOptions = {
      tables: null,
      format: 'json',
      includeSchema: true
    };

    return this.makeRequest('/export', {
      method: 'POST',
      body: JSON.stringify({ ...defaultOptions, ...options })
    });
  }

  // ============================================================================
  // ADVANCED HEALTH MONITORING
  // ============================================================================

  /**
   * Get comprehensive health check
   */
  async getComprehensiveHealthCheck() {
    return this.makeRequest('/health/comprehensive');
  }

  /**
   * Get health trends over time
   */
  async getHealthTrends(days = 7) {
    return this.makeRequest(`/health/trends?days=${days}`);
  }

  // ============================================================================
  // BACKUP OPERATIONS
  // ============================================================================

  /**
   * Get backup history
   */
  async getBackupHistory() {
    return this.makeRequest('/backups');
  }

  /**
   * Create a comprehensive backup
   */
  async createBackup(options = {}) {
    const defaultOptions = {
      name: `Backup_${new Date().toISOString().split('T')[0]}`,
      description: 'Manual backup created via API',
      includeFiles: false,
      compression: 'gzip',
      encryption: false
    };

    return this.makeRequest('/backup/create', {
      method: 'POST',
      body: JSON.stringify({ ...defaultOptions, ...options })
    });
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId, confirmationCode, options = {}) {
    return this.makeRequest('/backup/restore', {
      method: 'POST',
      body: JSON.stringify({
        backupId,
        confirmationCode,
        options
      })
    });
  }

  /**
   * Get backup schedule configuration
   */
  async getBackupSchedule() {
    return this.makeRequest('/backup/schedule');
  }

  /**
   * Configure backup schedule
   */
  async configureBackupSchedule(config = {}) {
    const defaultConfig = {
      enabled: true,
      frequency: 'daily',
      retentionDays: 30,
      options: {}
    };

    return this.makeRequest('/backup/schedule', {
      method: 'POST',
      body: JSON.stringify({ ...defaultConfig, ...config })
    });
  }

  // ============================================================================
  // PERFORMANCE OPTIMIZATION
  // ============================================================================

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    return this.makeRequest('/performance/metrics');
  }

  /**
   * Optimize database performance
   */
  async optimizePerformance(options = {}) {
    const defaultOptions = {
      includeIndexes: true,
      vacuum: false
    };

    return this.makeRequest('/performance/optimize', {
      method: 'POST',
      body: JSON.stringify({ ...defaultOptions, ...options })
    });
  }

  /**
   * Clear performance cache
   */
  async clearPerformanceCache() {
    return this.makeRequest('/performance/cache/clear', {
      method: 'POST'
    });
  }

  // ============================================================================
  // ADVANCED DATA OPERATIONS
  // ============================================================================

  /**
   * Perform batch insert operation
   */
  async batchInsert(tableName, records, batchSize = 1000) {
    return this.makeRequest('/batch/insert', {
      method: 'POST',
      body: JSON.stringify({
        tableName,
        records,
        batchSize
      })
    });
  }

  /**
   * Execute paginated query
   */
  async paginatedQuery(params = {}) {
    const defaultParams = {
      table: 'users',
      page: 1,
      pageSize: 100,
      orderBy: 'id',
      orderDirection: 'ASC',
      where: null
    };

    const queryParams = { ...defaultParams, ...params };
    const queryString = new URLSearchParams(queryParams).toString();
    
    return this.makeRequest(`/query/paginated?${queryString}`);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if backend is available
   */
  async checkBackendAvailability() {
    try {
      await this.getDataHealth();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get system status summary
   */
  async getSystemStatus() {
    try {
      const [overview, health, performance] = await Promise.all([
        this.getDataOverview(),
        this.getComprehensiveHealthCheck(),
        this.getPerformanceMetrics()
      ]);

      return {
        available: true,
        overview: overview.data,
        health: health.data,
        performance: performance.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Validate operation before execution
   */
  async validateOperation(operationType, options = {}) {
    // This could be extended to call a validation endpoint
    // For now, perform basic client-side validation
    
    const validations = {
      seed: () => {
        if (options.userCount && options.userCount > 1000) {
          throw new Error('User count too high for seeding operation');
        }
        return true;
      },
      cleanup: () => {
        if (!options.categories || options.categories.length === 0) {
          throw new Error('At least one category must be specified for cleanup');
        }
        return true;
      },
      reset: () => {
        if (!options.confirmationCode || options.confirmationCode !== 'RESET_ALL_DATA') {
          throw new Error('Invalid confirmation code for reset operation');
        }
        return true;
      },
      backup: () => {
        if (options.name && options.name.length < 3) {
          throw new Error('Backup name must be at least 3 characters long');
        }
        return true;
      }
    };

    const validator = validations[operationType];
    if (validator) {
      return validator();
    }

    return true;
  }

  /**
   * Format API response for UI consumption
   */
  formatResponse(response, type = 'default') {
    const formatters = {
      overview: (data) => ({
        summary: data.summary,
        statistics: data.statistics,
        healthMetrics: data.healthMetrics,
        recentOperations: data.recentOperations || []
      }),
      
      health: (data) => ({
        overallStatus: data.overall_status,
        checks: data.checks || {},
        alerts: data.alerts || [],
        recommendations: data.recommendations || [],
        metrics: data.metrics || {}
      }),
      
      performance: (data) => ({
        cache: data.cache || {},
        queries: data.queries || {},
        batchOperations: data.batch_operations || {}
      }),
      
      operations: (data) => ({
        operations: data.operations || [],
        pagination: data.pagination || {}
      }),
      
      default: (data) => data
    };

    const formatter = formatters[type] || formatters.default;
    return formatter(response.data || response);
  }

  /**
   * Handle API errors with user-friendly messages
   */
  handleError(error) {
    const errorMessages = {
      400: 'Invalid request. Please check your input and try again.',
      401: 'Authentication required. Please log in.',
      403: 'Access denied. Platform Owner privileges required.',
      404: 'Resource not found. The requested data may have been deleted.',
      409: 'Conflict. The operation cannot be completed due to a data conflict.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Server error. Please try again later or contact support.',
      503: 'Service unavailable. The system may be under maintenance.'
    };

    if (error instanceof DataManagementApiError) {
      const userMessage = errorMessages[error.status] || error.message;
      return {
        message: userMessage,
        technical: error.message,
        status: error.status,
        response: error.response
      };
    }

    return {
      message: 'An unexpected error occurred. Please try again.',
      technical: error.message,
      status: 0,
      response: null
    };
  }
}

// Create singleton instance
const dataManagementApi = new DataManagementApi();

export default dataManagementApi;
export { DataManagementApi, DataManagementApiError };