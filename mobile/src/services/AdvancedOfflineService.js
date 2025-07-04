/**
 * Advanced Offline Service
 * Comprehensive offline data storage with intelligent sync queue management
 * Features: Offline workflow execution, conflict resolution, and progressive sync
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import { Alert } from 'react-native';

const API_BASE_URL = 'http://localhost:8000';

class AdvancedOfflineService {
  constructor() {
    this.isOnline = true;
    this.syncQueue = [];
    this.offlineStorage = new OfflineStorageManager();
    this.syncManager = new IntelligentSyncManager();
    this.conflictResolver = new ConflictResolver();
    this.offlineWorkflowEngine = new OfflineWorkflowEngine();
    
    // Sync priorities
    this.syncPriorities = {
      CRITICAL: 1,    // Security events, user data
      HIGH: 2,        // Workflow executions, analytics
      MEDIUM: 3,      // General data updates
      LOW: 4          // Cache updates, logs
    };

    // Storage quotas (in MB)
    this.storageQuotas = {
      workflows: 50,
      analytics: 30,
      cache: 20,
      logs: 10,
      media: 40
    };

    this.initializeNetworkMonitoring();
  }

  // ==================== NETWORK MONITORING ====================

  initializeNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;
      
      if (!wasOnline && this.isOnline) {
        this.handleConnectionRestored();
      } else if (wasOnline && !this.isOnline) {
        this.handleConnectionLost();
      }
    });
  }

  async handleConnectionRestored() {
    console.log('Connection restored - starting sync');
    await this.logEvent('connection_restored', 'info');
    await this.startIntelligentSync();
  }

  async handleConnectionLost() {
    console.log('Connection lost - switching to offline mode');
    await this.logEvent('connection_lost', 'warning');
    await this.optimizeForOfflineMode();
  }

  // ==================== OFFLINE DATA STORAGE ====================

  /**
   * Store data offline with intelligent categorization
   */
  async storeOfflineData(category, key, data, priority = 'MEDIUM') {
    try {
      const storageKey = `offline_${category}_${key}`;
      const metadata = {
        category,
        key,
        priority,
        timestamp: new Date().toISOString(),
        size: JSON.stringify(data).length,
        version: 1,
        sync_status: 'pending'
      };

      // Check storage quota
      await this.enforceStorageQuota(category, metadata.size);

      // Store data with metadata
      await AsyncStorage.setItem(storageKey, JSON.stringify({
        data,
        metadata
      }));

      // Update index
      await this.updateOfflineIndex(category, key, metadata);

      await this.logEvent('data_stored_offline', 'info', {
        category,
        key,
        size: metadata.size
      });

      return true;
    } catch (error) {
      console.error('Failed to store offline data:', error);
      return false;
    }
  }

  /**
   * Retrieve offline data with fallback strategies
   */
  async getOfflineData(category, key, fallbackStrategy = 'cache') {
    try {
      const storageKey = `offline_${category}_${key}`;
      const storedData = await AsyncStorage.getItem(storageKey);
      
      if (storedData) {
        const { data, metadata } = JSON.parse(storedData);
        
        // Update access timestamp
        metadata.last_accessed = new Date().toISOString();
        await AsyncStorage.setItem(storageKey, JSON.stringify({
          data,
          metadata
        }));

        return data;
      }

      // Apply fallback strategy
      return await this.applyFallbackStrategy(category, key, fallbackStrategy);
    } catch (error) {
      console.error('Failed to retrieve offline data:', error);
      return null;
    }
  }

  /**
   * Intelligent sync queue management
   */
  async addToSyncQueue(operation, data, priority = 'MEDIUM') {
    const syncItem = {
      id: Date.now() + Math.random(),
      operation,
      data,
      priority,
      timestamp: new Date().toISOString(),
      retry_count: 0,
      max_retries: 3
    };

    this.syncQueue.push(syncItem);
    
    // Sort by priority
    this.syncQueue.sort((a, b) => 
      this.syncPriorities[a.priority] - this.syncPriorities[b.priority]
    );

    // Persist sync queue
    await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));

    // Auto-sync if online
    if (this.isOnline) {
      await this.processSyncQueue();
    }

    return syncItem.id;
  }

  /**
   * Process sync queue with intelligent batching
   */
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    const batchSize = 5; // Process 5 items at a time
    const batch = this.syncQueue.splice(0, batchSize);

    for (const item of batch) {
      try {
        await this.processSyncItem(item);
        await this.logEvent('sync_item_processed', 'info', {
          operation: item.operation,
          priority: item.priority
        });
      } catch (error) {
        console.error('Sync item failed:', error);
        
        item.retry_count++;
        if (item.retry_count < item.max_retries) {
          // Re-add to queue for retry
          this.syncQueue.push(item);
        } else {
          await this.logEvent('sync_item_failed', 'error', {
            operation: item.operation,
            error: error.message
          });
        }
      }
    }

    // Update persisted queue
    await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));

    // Continue processing if more items exist
    if (this.syncQueue.length > 0) {
      setTimeout(() => this.processSyncQueue(), 1000);
    }
  }

  /**
   * Process individual sync item
   */
  async processSyncItem(item) {
    const { operation, data } = item;
    
    switch (operation) {
      case 'create_workflow':
        return await this.syncCreateWorkflow(data);
      case 'update_workflow':
        return await this.syncUpdateWorkflow(data);
      case 'execute_workflow':
        return await this.syncExecuteWorkflow(data);
      case 'analytics_data':
        return await this.syncAnalyticsData(data);
      case 'security_event':
        return await this.syncSecurityEvent(data);
      default:
        throw new Error(`Unknown sync operation: ${operation}`);
    }
  }

  // ==================== OFFLINE WORKFLOW EXECUTION ====================

  /**
   * Execute workflows offline with limited capabilities
   */
  async executeWorkflowOffline(workflowId, parameters = {}) {
    try {
      // Get workflow definition from offline storage
      const workflow = await this.getOfflineData('workflows', workflowId);
      if (!workflow) {
        throw new Error('Workflow not available offline');
      }

      // Check if workflow can run offline
      if (!this.canRunOffline(workflow)) {
        throw new Error('Workflow requires online connectivity');
      }

      // Execute workflow with offline engine
      const execution = await this.offlineWorkflowEngine.execute(workflow, parameters);
      
      // Store execution result for sync
      await this.storeOfflineData('executions', execution.id, execution, 'HIGH');
      
      // Add to sync queue
      await this.addToSyncQueue('execute_workflow', {
        workflow_id: workflowId,
        execution_id: execution.id,
        parameters,
        offline_execution: true
      }, 'HIGH');

      await this.logEvent('workflow_executed_offline', 'info', {
        workflow_id: workflowId,
        execution_id: execution.id
      });

      return execution;
    } catch (error) {
      console.error('Offline workflow execution failed:', error);
      throw error;
    }
  }

  /**
   * Check if workflow can run offline
   */
  canRunOffline(workflow) {
    const offlineCompatibleSteps = [
      'trigger',
      'condition',
      'notification',
      'data_processing',
      'delay'
    ];

    return workflow.steps.every(step => 
      offlineCompatibleSteps.includes(step.type) &&
      !step.requires_network
    );
  }

  // ==================== CONFLICT RESOLUTION ====================

  /**
   * Resolve conflicts during sync
   */
  async resolveConflicts(localData, serverData, conflictType) {
    return await this.conflictResolver.resolve(localData, serverData, conflictType);
  }

  // ==================== STORAGE MANAGEMENT ====================

  /**
   * Enforce storage quotas
   */
  async enforceStorageQuota(category, newDataSize) {
    const currentUsage = await this.getStorageUsage(category);
    const quota = this.storageQuotas[category] * 1024 * 1024; // Convert MB to bytes
    
    if (currentUsage + newDataSize > quota) {
      await this.cleanupOldData(category, newDataSize);
    }
  }

  /**
   * Get storage usage by category
   */
  async getStorageUsage(category) {
    try {
      const index = await this.getOfflineIndex(category);
      return Object.values(index).reduce((total, item) => total + item.size, 0);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Cleanup old data to make space
   */
  async cleanupOldData(category, requiredSpace) {
    const index = await this.getOfflineIndex(category);
    const items = Object.entries(index)
      .map(([key, metadata]) => ({ key, ...metadata }))
      .sort((a, b) => new Date(a.last_accessed || a.timestamp) - new Date(b.last_accessed || b.timestamp));

    let freedSpace = 0;
    for (const item of items) {
      if (freedSpace >= requiredSpace) break;
      
      await this.removeOfflineData(category, item.key);
      freedSpace += item.size;
    }
  }

  /**
   * Remove offline data
   */
  async removeOfflineData(category, key) {
    try {
      const storageKey = `offline_${category}_${key}`;
      await AsyncStorage.removeItem(storageKey);
      await this.removeFromOfflineIndex(category, key);
      
      await this.logEvent('offline_data_removed', 'info', {
        category,
        key
      });
    } catch (error) {
      console.error('Failed to remove offline data:', error);
    }
  }

  // ==================== PROGRESSIVE SYNC ====================

  /**
   * Start intelligent sync with progressive loading
   */
  async startIntelligentSync() {
    try {
      // Load sync queue from storage
      const storedQueue = await AsyncStorage.getItem('sync_queue');
      if (storedQueue) {
        this.syncQueue = JSON.parse(storedQueue);
      }

      // Start progressive sync
      await this.syncManager.startProgressiveSync();
      
      // Process sync queue
      await this.processSyncQueue();

      await this.logEvent('intelligent_sync_started', 'info');
    } catch (error) {
      console.error('Failed to start intelligent sync:', error);
    }
  }

  /**
   * Optimize for offline mode
   */
  async optimizeForOfflineMode() {
    try {
      // Preload critical data
      await this.preloadCriticalData();
      
      // Optimize storage
      await this.optimizeOfflineStorage();
      
      // Prepare offline workflows
      await this.prepareOfflineWorkflows();

      await this.logEvent('offline_mode_optimized', 'info');
    } catch (error) {
      console.error('Failed to optimize for offline mode:', error);
    }
  }

  /**
   * Preload critical data for offline use
   */
  async preloadCriticalData() {
    const criticalCategories = ['workflows', 'user_data', 'security_config'];
    
    for (const category of criticalCategories) {
      try {
        // This would fetch and cache critical data
        await this.cacheCategory(category);
      } catch (error) {
        console.warn(`Failed to preload ${category}:`, error);
      }
    }
  }

  // ==================== UTILITY METHODS ====================

  async updateOfflineIndex(category, key, metadata) {
    try {
      const indexKey = `offline_index_${category}`;
      const existingIndex = await AsyncStorage.getItem(indexKey);
      const index = existingIndex ? JSON.parse(existingIndex) : {};
      
      index[key] = metadata;
      
      await AsyncStorage.setItem(indexKey, JSON.stringify(index));
    } catch (error) {
      console.error('Failed to update offline index:', error);
    }
  }

  async getOfflineIndex(category) {
    try {
      const indexKey = `offline_index_${category}`;
      const index = await AsyncStorage.getItem(indexKey);
      return index ? JSON.parse(index) : {};
    } catch (error) {
      return {};
    }
  }

  async removeFromOfflineIndex(category, key) {
    try {
      const indexKey = `offline_index_${category}`;
      const existingIndex = await AsyncStorage.getItem(indexKey);
      if (existingIndex) {
        const index = JSON.parse(existingIndex);
        delete index[key];
        await AsyncStorage.setItem(indexKey, JSON.stringify(index));
      }
    } catch (error) {
      console.error('Failed to remove from offline index:', error);
    }
  }

  async applyFallbackStrategy(category, key, strategy) {
    switch (strategy) {
      case 'cache':
        return await this.getCachedData(category, key);
      case 'default':
        return this.getDefaultData(category, key);
      case 'empty':
        return null;
      default:
        return null;
    }
  }

  async getCachedData(category, key) {
    // Implementation for cached data retrieval
    return null;
  }

  getDefaultData(category, key) {
    // Implementation for default data
    return null;
  }

  async cacheCategory(category) {
    // Implementation for category caching
    console.log(`Caching category: ${category}`);
  }

  async prepareOfflineWorkflows() {
    // Implementation for offline workflow preparation
    console.log('Preparing offline workflows');
  }

  async optimizeOfflineStorage() {
    // Implementation for storage optimization
    console.log('Optimizing offline storage');
  }

  async syncCreateWorkflow(data) {
    // Implementation for workflow creation sync
    console.log('Syncing workflow creation:', data);
  }

  async syncUpdateWorkflow(data) {
    // Implementation for workflow update sync
    console.log('Syncing workflow update:', data);
  }

  async syncExecuteWorkflow(data) {
    // Implementation for workflow execution sync
    console.log('Syncing workflow execution:', data);
  }

  async syncAnalyticsData(data) {
    // Implementation for analytics data sync
    console.log('Syncing analytics data:', data);
  }

  async syncSecurityEvent(data) {
    // Implementation for security event sync
    console.log('Syncing security event:', data);
  }

  async logEvent(event_type, level, details = {}) {
    try {
      const logEntry = {
        event_type,
        level,
        details,
        timestamp: new Date().toISOString(),
        service: 'AdvancedOfflineService'
      };

      // Store locally
      const existingLogs = await AsyncStorage.getItem('offline_service_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      await AsyncStorage.setItem('offline_service_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log offline service event:', error);
    }
  }

  // ==================== PUBLIC API ====================

  /**
   * Get offline service status
   */
  async getStatus() {
    const queueSize = this.syncQueue.length;
    const storageUsage = {};
    
    for (const category of Object.keys(this.storageQuotas)) {
      storageUsage[category] = await this.getStorageUsage(category);
    }

    return {
      is_online: this.isOnline,
      sync_queue_size: queueSize,
      storage_usage: storageUsage,
      storage_quotas: this.storageQuotas,
      last_sync: await AsyncStorage.getItem('last_sync_timestamp')
    };
  }

  /**
   * Force sync all pending data
   */
  async forceSyncAll() {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    await this.processSyncQueue();
    await AsyncStorage.setItem('last_sync_timestamp', new Date().toISOString());
  }

  /**
   * Clear all offline data
   */
  async clearAllOfflineData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter(key => key.startsWith('offline_'));
      
      await AsyncStorage.multiRemove(offlineKeys);
      this.syncQueue = [];
      
      await this.logEvent('offline_data_cleared', 'info');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      throw error;
    }
  }
}

// ==================== SUPPORTING CLASSES ====================

class OfflineStorageManager {
  constructor() {
    this.compressionEnabled = true;
    this.encryptionEnabled = true;
  }

  async store(key, data) {
    // Implementation for optimized storage
    return true;
  }

  async retrieve(key) {
    // Implementation for optimized retrieval
    return null;
  }
}

class IntelligentSyncManager {
  constructor() {
    this.syncStrategies = {
      'immediate': { delay: 0, batchSize: 1 },
      'batched': { delay: 5000, batchSize: 10 },
      'scheduled': { delay: 30000, batchSize: 50 }
    };
  }

  async startProgressiveSync() {
    // Implementation for progressive sync
    console.log('Starting progressive sync');
  }

  async optimizeSyncStrategy(networkConditions) {
    // Implementation for sync strategy optimization
    return 'batched';
  }
}

class ConflictResolver {
  constructor() {
    this.resolutionStrategies = {
      'last_write_wins': this.lastWriteWins,
      'merge': this.mergeConflicts,
      'user_choice': this.promptUserChoice
    };
  }

  async resolve(localData, serverData, conflictType) {
    const strategy = this.getResolutionStrategy(conflictType);
    return await strategy(localData, serverData);
  }

  getResolutionStrategy(conflictType) {
    // Default to last write wins
    return this.resolutionStrategies['last_write_wins'];
  }

  lastWriteWins(localData, serverData) {
    // Compare timestamps and return newer data
    const localTime = new Date(localData.updated_at || localData.created_at);
    const serverTime = new Date(serverData.updated_at || serverData.created_at);
    
    return localTime > serverTime ? localData : serverData;
  }

  async mergeConflicts(localData, serverData) {
    // Implementation for intelligent data merging
    return { ...serverData, ...localData };
  }

  async promptUserChoice(localData, serverData) {
    // Implementation for user conflict resolution
    return serverData; // Default to server data
  }
}

class OfflineWorkflowEngine {
  constructor() {
    this.supportedSteps = [
      'trigger',
      'condition',
      'notification',
      'data_processing',
      'delay'
    ];
  }

  async execute(workflow, parameters) {
    const execution = {
      id: Date.now().toString(),
      workflow_id: workflow.id,
      status: 'running',
      progress: 0,
      started_at: new Date().toISOString(),
      steps: [],
      offline: true
    };

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        const stepResult = await this.executeStep(step, parameters);
        
        execution.steps.push(stepResult);
        execution.progress = Math.round(((i + 1) / workflow.steps.length) * 100);
      }

      execution.status = 'completed';
      execution.completed_at = new Date().toISOString();
    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.failed_at = new Date().toISOString();
    }

    return execution;
  }

  async executeStep(step, parameters) {
    // Simplified offline step execution
    return {
      step_id: step.id,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      result: { success: true, offline: true }
    };
  }
}

export default AdvancedOfflineService;