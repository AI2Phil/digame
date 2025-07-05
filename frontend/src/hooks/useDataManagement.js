/**
 * Data Management React Hook
 * ==========================
 * 
 * Custom React hook for managing data operations including mock data generation,
 * cleanup, backup, health monitoring, and performance optimization.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import dataManagementApi from '../services/dataManagementApi';

export const useDataManagement = () => {
  const [state, setState] = useState({
    overview: null,
    health: null,
    performance: null,
    operations: [],
    backups: [],
    loading: false,
    error: null,
    lastUpdated: null
  });

  const [operationStatus, setOperationStatus] = useState({
    type: null,
    status: 'idle', // 'idle', 'running', 'success', 'error'
    progress: 0,
    message: null,
    result: null
  });

  const abortControllerRef = useRef(null);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchOverview = useCallback(async () => {
    try {
      const response = await dataManagementApi.getDataOverview();
      const formattedData = dataManagementApi.formatResponse(response, 'overview');
      
      setState(prev => ({
        ...prev,
        overview: formattedData,
        lastUpdated: new Date().toISOString(),
        error: null
      }));
      
      return formattedData;
    } catch (error) {
      const errorInfo = dataManagementApi.handleError(error);
      setState(prev => ({ ...prev, error: errorInfo }));
      throw error;
    }
  }, []);

  const fetchHealth = useCallback(async (comprehensive = false) => {
    try {
      const response = comprehensive 
        ? await dataManagementApi.getComprehensiveHealthCheck()
        : await dataManagementApi.getDataHealth();
      
      const formattedData = dataManagementApi.formatResponse(response, 'health');
      
      setState(prev => ({
        ...prev,
        health: formattedData,
        lastUpdated: new Date().toISOString(),
        error: null
      }));
      
      return formattedData;
    } catch (error) {
      const errorInfo = dataManagementApi.handleError(error);
      setState(prev => ({ ...prev, error: errorInfo }));
      throw error;
    }
  }, []);

  const fetchPerformance = useCallback(async () => {
    try {
      const response = await dataManagementApi.getPerformanceMetrics();
      const formattedData = dataManagementApi.formatResponse(response, 'performance');
      
      setState(prev => ({
        ...prev,
        performance: formattedData,
        lastUpdated: new Date().toISOString(),
        error: null
      }));
      
      return formattedData;
    } catch (error) {
      const errorInfo = dataManagementApi.handleError(error);
      setState(prev => ({ ...prev, error: errorInfo }));
      throw error;
    }
  }, []);

  const fetchOperations = useCallback(async (params = {}) => {
    try {
      const response = await dataManagementApi.getOperationsHistory(params);
      const formattedData = dataManagementApi.formatResponse(response, 'operations');
      
      setState(prev => ({
        ...prev,
        operations: formattedData.operations,
        lastUpdated: new Date().toISOString(),
        error: null
      }));
      
      return formattedData;
    } catch (error) {
      const errorInfo = dataManagementApi.handleError(error);
      setState(prev => ({ ...prev, error: errorInfo }));
      throw error;
    }
  }, []);

  const fetchBackups = useCallback(async () => {
    try {
      const response = await dataManagementApi.getBackupHistory();
      
      setState(prev => ({
        ...prev,
        backups: response.data.backups || [],
        lastUpdated: new Date().toISOString(),
        error: null
      }));
      
      return response.data.backups;
    } catch (error) {
      const errorInfo = dataManagementApi.handleError(error);
      setState(prev => ({ ...prev, error: errorInfo }));
      throw error;
    }
  }, []);

  // ============================================================================
  // DATA OPERATIONS
  // ============================================================================

  const executeOperation = useCallback(async (operationType, operationFn, options = {}) => {
    // Cancel any existing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setOperationStatus({
      type: operationType,
      status: 'running',
      progress: 0,
      message: `Starting ${operationType} operation...`,
      result: null
    });

    try {
      // Validate operation
      await dataManagementApi.validateOperation(operationType, options);

      // Execute operation with progress tracking
      const result = await operationFn();

      setOperationStatus({
        type: operationType,
        status: 'success',
        progress: 100,
        message: `${operationType} operation completed successfully`,
        result
      });

      // Refresh relevant data
      if (['seed', 'cleanup', 'reset'].includes(operationType)) {
        await fetchOverview();
      }
      if (['backup', 'restore'].includes(operationType)) {
        await fetchBackups();
      }
      if (['optimize'].includes(operationType)) {
        await fetchPerformance();
      }

      return result;

    } catch (error) {
      const errorInfo = dataManagementApi.handleError(error);
      
      setOperationStatus({
        type: operationType,
        status: 'error',
        progress: 0,
        message: errorInfo.message,
        result: null
      });

      throw error;
    }
  }, [fetchOverview, fetchBackups, fetchPerformance]);

  const seedMockData = useCallback(async (options = {}) => {
    return executeOperation('seed', () => dataManagementApi.seedMockData(options), options);
  }, [executeOperation]);

  const cleanupMockData = useCallback(async (options = {}) => {
    return executeOperation('cleanup', () => dataManagementApi.cleanupMockData(options), options);
  }, [executeOperation]);

  const resetAllData = useCallback(async (confirmationCode, preserveUsers = true) => {
    return executeOperation('reset', () => 
      dataManagementApi.resetAllData(confirmationCode, preserveUsers), 
      { confirmationCode, preserveUsers }
    );
  }, [executeOperation]);

  const createBackup = useCallback(async (options = {}) => {
    return executeOperation('backup', () => dataManagementApi.createBackup(options), options);
  }, [executeOperation]);

  const restoreBackup = useCallback(async (backupId, confirmationCode, options = {}) => {
    return executeOperation('restore', () => 
      dataManagementApi.restoreBackup(backupId, confirmationCode, options),
      { backupId, confirmationCode, ...options }
    );
  }, [executeOperation]);

  const optimizePerformance = useCallback(async (options = {}) => {
    return executeOperation('optimize', () => dataManagementApi.optimizePerformance(options), options);
  }, [executeOperation]);

  const exportData = useCallback(async (options = {}) => {
    return executeOperation('export', () => dataManagementApi.exportData(options), options);
  }, [executeOperation]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const refreshAll = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await Promise.all([
        fetchOverview(),
        fetchHealth(),
        fetchPerformance(),
        fetchOperations(),
        fetchBackups()
      ]);
    } catch (error) {
      // Individual fetch functions handle their own errors
      console.error('Error refreshing data:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchOverview, fetchHealth, fetchPerformance, fetchOperations, fetchBackups]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearOperationStatus = useCallback(() => {
    setOperationStatus({
      type: null,
      status: 'idle',
      progress: 0,
      message: null,
      result: null
    });
  }, []);

  const cancelOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setOperationStatus({
        type: null,
        status: 'idle',
        progress: 0,
        message: 'Operation cancelled',
        result: null
      });
    }
  }, []);

  const checkBackendAvailability = useCallback(async () => {
    try {
      const available = await dataManagementApi.checkBackendAvailability();
      return available;
    } catch (error) {
      return false;
    }
  }, []);

  const getSystemStatus = useCallback(async () => {
    try {
      const status = await dataManagementApi.getSystemStatus();
      return status;
    } catch (error) {
      return {
        available: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isOperationRunning = operationStatus.status === 'running';
  const hasError = state.error !== null;
  const isLoading = state.loading;
  const lastUpdated = state.lastUpdated;

  const summary = {
    totalRecords: state.overview?.summary?.totalRecords || 0,
    mockRecords: state.overview?.summary?.mockRecords || 0,
    realRecords: state.overview?.summary?.realRecords || 0,
    mockPercentage: state.overview?.summary?.mockPercentage || 0,
    healthStatus: state.health?.overallStatus || 'unknown',
    backupCount: state.backups?.length || 0,
    recentOperations: state.operations?.slice(0, 5) || []
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // State
    state,
    operationStatus,
    summary,
    isOperationRunning,
    hasError,
    isLoading,
    lastUpdated,

    // Data fetching
    fetchOverview,
    fetchHealth,
    fetchPerformance,
    fetchOperations,
    fetchBackups,
    refreshAll,

    // Data operations
    seedMockData,
    cleanupMockData,
    resetAllData,
    createBackup,
    restoreBackup,
    optimizePerformance,
    exportData,

    // Utility functions
    clearError,
    clearOperationStatus,
    cancelOperation,
    checkBackendAvailability,
    getSystemStatus,

    // Direct API access (for advanced use cases)
    api: dataManagementApi
  };
};

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for monitoring data health
 */
export const useDataHealth = (autoRefresh = false, interval = 30000) => {
  const { fetchHealth, state } = useDataManagement();
  const [refreshing, setRefreshing] = useState(false);

  const refreshHealth = useCallback(async (comprehensive = false) => {
    setRefreshing(true);
    try {
      await fetchHealth(comprehensive);
    } finally {
      setRefreshing(false);
    }
  }, [fetchHealth]);

  useEffect(() => {
    if (autoRefresh) {
      const intervalId = setInterval(() => {
        refreshHealth(false);
      }, interval);

      return () => clearInterval(intervalId);
    }
  }, [autoRefresh, interval, refreshHealth]);

  return {
    health: state.health,
    refreshing,
    refreshHealth,
    error: state.error
  };
};

/**
 * Hook for backup operations
 */
export const useBackupOperations = () => {
  const { 
    state, 
    operationStatus, 
    createBackup, 
    restoreBackup, 
    fetchBackups 
  } = useDataManagement();

  const [scheduleConfig, setScheduleConfig] = useState(null);

  const fetchScheduleConfig = useCallback(async () => {
    try {
      const response = await dataManagementApi.getBackupSchedule();
      setScheduleConfig(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch backup schedule:', error);
      return null;
    }
  }, []);

  const updateScheduleConfig = useCallback(async (config) => {
    try {
      const response = await dataManagementApi.configureBackupSchedule(config);
      setScheduleConfig(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update backup schedule:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchScheduleConfig();
  }, [fetchScheduleConfig]);

  return {
    backups: state.backups,
    scheduleConfig,
    operationStatus,
    createBackup,
    restoreBackup,
    fetchBackups,
    fetchScheduleConfig,
    updateScheduleConfig
  };
};

/**
 * Hook for performance monitoring
 */
export const usePerformanceMonitoring = (autoRefresh = false, interval = 60000) => {
  const { fetchPerformance, optimizePerformance, state, operationStatus } = useDataManagement();
  const [refreshing, setRefreshing] = useState(false);

  const refreshPerformance = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPerformance();
    } finally {
      setRefreshing(false);
    }
  }, [fetchPerformance]);

  const clearCache = useCallback(async () => {
    try {
      await dataManagementApi.clearPerformanceCache();
      await refreshPerformance();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }, [refreshPerformance]);

  useEffect(() => {
    if (autoRefresh) {
      const intervalId = setInterval(refreshPerformance, interval);
      return () => clearInterval(intervalId);
    }
  }, [autoRefresh, interval, refreshPerformance]);

  return {
    performance: state.performance,
    refreshing,
    operationStatus,
    refreshPerformance,
    optimizePerformance,
    clearCache,
    error: state.error
  };
};

export default useDataManagement;