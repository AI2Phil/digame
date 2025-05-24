/**
 * Offline Data Synchronization and Conflict Resolution Service
 * Handles offline data storage, synchronization, and conflict resolution
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import { Platform } from 'react-native';
import apiService from './apiService';

class OfflineDataSync {
  constructor() {
    this.isOnline = true;
    this.syncQueue = [];
    this.conflictQueue = [];
    this.offlineData = new Map();
    this.syncInProgress = false;
    this.lastSyncTimestamp = null;
    this.conflictResolutionStrategy = 'server_wins'; // 'server_wins', 'client_wins', 'merge', 'manual'
    this.syncRetryAttempts = 3;
    this.syncRetryDelay = 5000; // 5 seconds
  }

  /**
   * Initialize offline data synchronization
   */
  async initialize() {
    try {
      // Setup network monitoring
      await this.setupNetworkMonitoring();
      
      // Load offline data from storage
      await this.loadOfflineData();
      
      // Load sync queue
      await this.loadSyncQueue();
      
      // Load conflict queue
      await this.loadConflictQueue();
      
      // Setup periodic sync
      this.setupPeriodicSync();
      
      console.log('Offline data sync initialized');
    } catch (error) {
      console.error('Failed to initialize offline data sync:', error);
      throw error;
    }
  }

  /**
   * Setup network monitoring for sync triggers
   */
  async setupNetworkMonitoring() {
    try {
      // Get initial network state
      const networkState = await NetInfo.fetch();
      this.isOnline = networkState.isConnected;

      // Subscribe to network changes
      NetInfo.addEventListener(state => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected;
        
        // Trigger sync when coming back online
        if (!wasOnline && this.isOnline) {
          this.onNetworkReconnected();
        } else if (wasOnline && !this.isOnline) {
          this.onNetworkDisconnected();
        }
      });

      console.log('Network monitoring for sync setup completed');
    } catch (error) {
      console.error('Failed to setup network monitoring:', error);
    }
  }

  /**
   * Store data offline with conflict detection
   */
  async storeOfflineData(key, data, metadata = {}) {
    try {
      const timestamp = Date.now();
      const offlineEntry = {
        key,
        data,
        metadata: {
          ...metadata,
          timestamp,
          version: metadata.version || 1,
          lastModified: timestamp,
          source: 'offline',
          deviceId: await this.getDeviceId()
        },
        syncStatus: 'pending',
        conflictStatus: 'none'
      };

      // Store in memory
      this.offlineData.set(key, offlineEntry);
      
      // Persist to storage
      await this.persistOfflineData();
      
      // Add to sync queue if online
      if (this.isOnline) {
        await this.addToSyncQueue(offlineEntry);
      }
      
      console.log('Data stored offline:', key);
      return offlineEntry;
    } catch (error) {
      console.error('Failed to store offline data:', error);
      throw error;
    }
  }

  /**
   * Retrieve data with offline fallback
   */
  async retrieveData(key, fetchFromServer = true) {
    try {
      // Try to get from offline storage first
      const offlineEntry = this.offlineData.get(key);
      
      if (this.isOnline && fetchFromServer) {
        try {
          // Fetch from server
          const serverData = await this.fetchFromServer(key);
          
          if (serverData) {
            // Check for conflicts
            const conflict = await this.detectConflict(offlineEntry, serverData);
            
            if (conflict) {
              // Handle conflict
              return this.handleDataConflict(key, offlineEntry, serverData);
            } else {
              // No conflict - update offline data with server data
              await this.updateOfflineData(key, serverData);
              return serverData;
            }
          }
        } catch (error) {
          console.warn('Failed to fetch from server, using offline data:', error);
        }
      }
      
      // Return offline data if available
      if (offlineEntry) {
        return offlineEntry.data;
      }
      
      // No data available
      return null;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      throw error;
    }
  }

  /**
   * Synchronize offline data with server
   */
  async synchronizeData() {
    if (this.syncInProgress || !this.isOnline) {
      console.log('Sync already in progress or offline');
      return;
    }

    try {
      this.syncInProgress = true;
      console.log('Starting data synchronization...');

      // Process sync queue
      await this.processSyncQueue();
      
      // Resolve conflicts
      await this.resolveConflicts();
      
      // Update last sync timestamp
      this.lastSyncTimestamp = Date.now();
      await AsyncStorage.setItem('last_sync_timestamp', this.lastSyncTimestamp.toString());
      
      console.log('Data synchronization completed');
    } catch (error) {
      console.error('Data synchronization failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Process sync queue
   */
  async processSyncQueue() {
    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const entry of queue) {
      try {
        await this.syncSingleEntry(entry);
      } catch (error) {
        console.error('Failed to sync entry:', entry.key, error);
        
        // Add back to queue for retry
        entry.retryCount = (entry.retryCount || 0) + 1;
        if (entry.retryCount < this.syncRetryAttempts) {
          this.syncQueue.push(entry);
        } else {
          console.error('Max retry attempts reached for:', entry.key);
          // Move to conflict queue for manual resolution
          this.conflictQueue.push({
            ...entry,
            conflictType: 'sync_failed',
            error: error.message
          });
        }
      }
    }

    // Persist updated queues
    await this.persistSyncQueue();
    await this.persistConflictQueue();
  }

  /**
   * Sync single entry with server
   */
  async syncSingleEntry(entry) {
    try {
      const { key, data, metadata } = entry;
      
      // Determine sync operation based on metadata
      let serverResponse;
      
      if (metadata.operation === 'create') {
        serverResponse = await this.createOnServer(key, data, metadata);
      } else if (metadata.operation === 'update') {
        serverResponse = await this.updateOnServer(key, data, metadata);
      } else if (metadata.operation === 'delete') {
        serverResponse = await this.deleteOnServer(key, metadata);
      } else {
        // Default to update
        serverResponse = await this.updateOnServer(key, data, metadata);
      }
      
      // Update offline data with server response
      if (serverResponse) {
        await this.updateOfflineData(key, serverResponse);
      }
      
      // Mark as synced
      entry.syncStatus = 'synced';
      entry.lastSyncTimestamp = Date.now();
      
      console.log('Successfully synced:', key);
    } catch (error) {
      console.error('Failed to sync entry:', key, error);
      throw error;
    }
  }

  /**
   * Detect conflicts between offline and server data
   */
  async detectConflict(offlineEntry, serverData) {
    if (!offlineEntry || !serverData) {
      return null;
    }

    const offlineTimestamp = offlineEntry.metadata.lastModified;
    const serverTimestamp = serverData.metadata?.lastModified || serverData.lastModified;
    
    // Check if both have been modified since last sync
    if (offlineTimestamp && serverTimestamp) {
      const lastSync = this.lastSyncTimestamp || 0;
      
      const offlineModifiedAfterSync = offlineTimestamp > lastSync;
      const serverModifiedAfterSync = serverTimestamp > lastSync;
      
      if (offlineModifiedAfterSync && serverModifiedAfterSync) {
        return {
          type: 'concurrent_modification',
          offlineTimestamp,
          serverTimestamp,
          offlineData: offlineEntry.data,
          serverData: serverData.data || serverData
        };
      }
    }
    
    // Check for data differences
    if (this.hasDataDifferences(offlineEntry.data, serverData.data || serverData)) {
      return {
        type: 'data_difference',
        offlineData: offlineEntry.data,
        serverData: serverData.data || serverData
      };
    }
    
    return null;
  }

  /**
   * Handle data conflicts
   */
  async handleDataConflict(key, offlineEntry, serverData) {
    const conflict = await this.detectConflict(offlineEntry, serverData);
    
    if (!conflict) {
      return serverData;
    }

    switch (this.conflictResolutionStrategy) {
      case 'server_wins':
        return this.resolveConflictServerWins(key, conflict, serverData);
      
      case 'client_wins':
        return this.resolveConflictClientWins(key, conflict, offlineEntry);
      
      case 'merge':
        return this.resolveConflictMerge(key, conflict, offlineEntry, serverData);
      
      case 'manual':
        return this.resolveConflictManual(key, conflict, offlineEntry, serverData);
      
      default:
        return this.resolveConflictServerWins(key, conflict, serverData);
    }
  }

  /**
   * Resolve conflict with server wins strategy
   */
  async resolveConflictServerWins(key, conflict, serverData) {
    console.log('Resolving conflict with server wins strategy:', key);
    
    // Update offline data with server data
    await this.updateOfflineData(key, serverData);
    
    // Log conflict resolution
    await this.logConflictResolution(key, 'server_wins', conflict);
    
    return serverData;
  }

  /**
   * Resolve conflict with client wins strategy
   */
  async resolveConflictClientWins(key, conflict, offlineEntry) {
    console.log('Resolving conflict with client wins strategy:', key);
    
    try {
      // Push offline data to server
      const serverResponse = await this.updateOnServer(key, offlineEntry.data, offlineEntry.metadata);
      
      // Update offline data with server response
      if (serverResponse) {
        await this.updateOfflineData(key, serverResponse);
        
        // Log conflict resolution
        await this.logConflictResolution(key, 'client_wins', conflict);
        
        return serverResponse;
      }
    } catch (error) {
      console.error('Failed to resolve conflict with client wins:', error);
      // Fallback to manual resolution
      return this.resolveConflictManual(key, conflict, offlineEntry, null);
    }
    
    return offlineEntry.data;
  }

  /**
   * Resolve conflict with merge strategy
   */
  async resolveConflictMerge(key, conflict, offlineEntry, serverData) {
    console.log('Resolving conflict with merge strategy:', key);
    
    try {
      // Attempt to merge data
      const mergedData = this.mergeData(conflict.offlineData, conflict.serverData);
      
      if (mergedData) {
        // Update server with merged data
        const serverResponse = await this.updateOnServer(key, mergedData, {
          ...offlineEntry.metadata,
          mergedFrom: ['offline', 'server'],
          mergeTimestamp: Date.now()
        });
        
        // Update offline data
        if (serverResponse) {
          await this.updateOfflineData(key, serverResponse);
          
          // Log conflict resolution
          await this.logConflictResolution(key, 'merge', conflict);
          
          return serverResponse;
        }
      }
    } catch (error) {
      console.error('Failed to merge data:', error);
    }
    
    // Fallback to manual resolution
    return this.resolveConflictManual(key, conflict, offlineEntry, serverData);
  }

  /**
   * Resolve conflict manually (add to conflict queue)
   */
  async resolveConflictManual(key, conflict, offlineEntry, serverData) {
    console.log('Adding conflict to manual resolution queue:', key);
    
    const conflictEntry = {
      key,
      conflict,
      offlineEntry,
      serverData,
      timestamp: Date.now(),
      status: 'pending_manual_resolution'
    };
    
    this.conflictQueue.push(conflictEntry);
    await this.persistConflictQueue();
    
    // Return offline data for now
    return offlineEntry ? offlineEntry.data : serverData;
  }

  /**
   * Merge data intelligently
   */
  mergeData(offlineData, serverData) {
    try {
      // Simple merge strategy - can be enhanced based on data structure
      if (typeof offlineData === 'object' && typeof serverData === 'object') {
        return {
          ...serverData,
          ...offlineData,
          _merged: true,
          _mergeTimestamp: Date.now()
        };
      }
      
      // For non-objects, prefer offline data
      return offlineData;
    } catch (error) {
      console.error('Failed to merge data:', error);
      return null;
    }
  }

  /**
   * Check if data has differences
   */
  hasDataDifferences(data1, data2) {
    try {
      return JSON.stringify(data1) !== JSON.stringify(data2);
    } catch (error) {
      console.error('Failed to compare data:', error);
      return true; // Assume differences if comparison fails
    }
  }

  /**
   * Add entry to sync queue
   */
  async addToSyncQueue(entry) {
    this.syncQueue.push(entry);
    await this.persistSyncQueue();
  }

  /**
   * Network reconnected handler
   */
  async onNetworkReconnected() {
    console.log('Network reconnected - triggering sync');
    
    // Wait a bit for network to stabilize
    setTimeout(() => {
      this.synchronizeData();
    }, 2000);
  }

  /**
   * Network disconnected handler
   */
  onNetworkDisconnected() {
    console.log('Network disconnected - entering offline mode');
    // Any cleanup needed when going offline
  }

  /**
   * Setup periodic sync
   */
  setupPeriodicSync() {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.synchronizeData();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Get device ID for conflict resolution
   */
  async getDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = this.generateDeviceId();
        await AsyncStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Failed to get device ID:', error);
      return 'unknown_device';
    }
  }

  /**
   * Generate unique device ID
   */
  generateDeviceId() {
    return `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Fetch data from server
   */
  async fetchFromServer(key) {
    try {
      // Extract endpoint from key
      const endpoint = this.keyToEndpoint(key);
      return await apiService.request(endpoint);
    } catch (error) {
      console.error('Failed to fetch from server:', error);
      throw error;
    }
  }

  /**
   * Create data on server
   */
  async createOnServer(key, data, metadata) {
    try {
      const endpoint = this.keyToEndpoint(key);
      return await apiService.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to create on server:', error);
      throw error;
    }
  }

  /**
   * Update data on server
   */
  async updateOnServer(key, data, metadata) {
    try {
      const endpoint = this.keyToEndpoint(key);
      return await apiService.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to update on server:', error);
      throw error;
    }
  }

  /**
   * Delete data on server
   */
  async deleteOnServer(key, metadata) {
    try {
      const endpoint = this.keyToEndpoint(key);
      return await apiService.request(endpoint, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete on server:', error);
      throw error;
    }
  }

  /**
   * Convert key to API endpoint
   */
  keyToEndpoint(key) {
    // Convert offline storage key to API endpoint
    // Example: "user_123_goals" -> "/users/123/goals"
    const parts = key.split('_');
    if (parts.length >= 3) {
      const [resource, id, subResource] = parts;
      return `/${resource}s/${id}/${subResource}`;
    }
    return `/${key}`;
  }

  /**
   * Update offline data
   */
  async updateOfflineData(key, data) {
    const timestamp = Date.now();
    const entry = {
      key,
      data,
      metadata: {
        timestamp,
        lastModified: timestamp,
        source: 'server',
        version: data.version || 1
      },
      syncStatus: 'synced',
      conflictStatus: 'none'
    };

    this.offlineData.set(key, entry);
    await this.persistOfflineData();
  }

  /**
   * Resolve conflicts in queue
   */
  async resolveConflicts() {
    const conflicts = [...this.conflictQueue];
    
    for (const conflict of conflicts) {
      try {
        if (conflict.status === 'pending_manual_resolution') {
          // Skip manual conflicts for now
          continue;
        }
        
        // Attempt to resolve conflict
        await this.handleDataConflict(conflict.key, conflict.offlineEntry, conflict.serverData);
        
        // Remove from conflict queue
        const index = this.conflictQueue.indexOf(conflict);
        if (index > -1) {
          this.conflictQueue.splice(index, 1);
        }
      } catch (error) {
        console.error('Failed to resolve conflict:', conflict.key, error);
      }
    }
    
    await this.persistConflictQueue();
  }

  /**
   * Log conflict resolution
   */
  async logConflictResolution(key, strategy, conflict) {
    try {
      const log = {
        key,
        strategy,
        conflict,
        timestamp: Date.now(),
        deviceId: await this.getDeviceId()
      };
      
      const logs = await this.getConflictLogs();
      logs.push(log);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      await AsyncStorage.setItem('conflict_resolution_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log conflict resolution:', error);
    }
  }

  /**
   * Get conflict resolution logs
   */
  async getConflictLogs() {
    try {
      const logs = await AsyncStorage.getItem('conflict_resolution_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to get conflict logs:', error);
      return [];
    }
  }

  /**
   * Persistence methods
   */
  async loadOfflineData() {
    try {
      const data = await AsyncStorage.getItem('offline_data');
      if (data) {
        const parsed = JSON.parse(data);
        this.offlineData = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  async persistOfflineData() {
    try {
      const data = Object.fromEntries(this.offlineData);
      await AsyncStorage.setItem('offline_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist offline data:', error);
    }
  }

  async loadSyncQueue() {
    try {
      const queue = await AsyncStorage.getItem('sync_queue');
      if (queue) {
        this.syncQueue = JSON.parse(queue);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  async persistSyncQueue() {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to persist sync queue:', error);
    }
  }

  async loadConflictQueue() {
    try {
      const queue = await AsyncStorage.getItem('conflict_queue');
      if (queue) {
        this.conflictQueue = JSON.parse(queue);
      }
    } catch (error) {
      console.error('Failed to load conflict queue:', error);
    }
  }

  async persistConflictQueue() {
    try {
      await AsyncStorage.setItem('conflict_queue', JSON.stringify(this.conflictQueue));
    } catch (error) {
      console.error('Failed to persist conflict queue:', error);
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      lastSyncTimestamp: this.lastSyncTimestamp,
      pendingSyncItems: this.syncQueue.length,
      pendingConflicts: this.conflictQueue.length,
      offlineDataCount: this.offlineData.size
    };
  }

  /**
   * Get pending conflicts for manual resolution
   */
  getPendingConflicts() {
    return this.conflictQueue.filter(conflict => 
      conflict.status === 'pending_manual_resolution'
    );
  }

  /**
   * Manually resolve conflict
   */
  async manuallyResolveConflict(conflictId, resolution, data) {
    try {
      const conflict = this.conflictQueue.find(c => c.key === conflictId);
      if (!conflict) {
        throw new Error('Conflict not found');
      }
      
      switch (resolution) {
        case 'use_offline':
          await this.updateOnServer(conflict.key, conflict.offlineEntry.data, conflict.offlineEntry.metadata);
          break;
        case 'use_server':
          await this.updateOfflineData(conflict.key, conflict.serverData);
          break;
        case 'use_custom':
          await this.updateOnServer(conflict.key, data, conflict.offlineEntry.metadata);
          await this.updateOfflineData(conflict.key, data);
          break;
      }
      
      // Remove from conflict queue
      const index = this.conflictQueue.indexOf(conflict);
      if (index > -1) {
        this.conflictQueue.splice(index, 1);
      }
      
      await this.persistConflictQueue();
      await this.logConflictResolution(conflictId, `manual_${resolution}`, conflict.conflict);
      
      console.log('Manually resolved conflict:', conflictId);
    } catch (error) {
      console.error('Failed to manually resolve conflict:', error);
      throw error;
    }
  }

  /**
   * Clear all offline data
   */
  async clearOfflineData() {
    try {
      this.offlineData.clear();
      this.syncQueue = [];
      this.conflictQueue = [];
      
      await AsyncStorage.multiRemove([
        'offline_data',
        'sync_queue',
        'conflict_queue'
      ]);
      
      console.log('Offline data cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const offlineDataSync = new OfflineDataSync();

export default offlineDataSync;