import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

class EnhancedOfflineService {
  constructor() {
    this.db = null;
    this.isOnline = true;
    this.syncQueue = [];
    this.conflictResolutionStrategy = 'client-wins'; // 'client-wins', 'server-wins', 'merge'
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.listeners = new Set();
    this.syncInProgress = false;
    this.lastSyncTime = null;
    this.offlineCapabilities = {
      analytics: true,
      userProfile: true,
      settings: true,
      workflows: true,
      notifications: true,
      cache: true
    };
  }

  async initialize() {
    try {
      console.log('Initializing Enhanced Offline Service...');
      
      // Initialize SQLite database
      await this.initializeDatabase();
      
      // Setup network monitoring
      await this.setupNetworkMonitoring();
      
      // Load offline data
      await this.loadOfflineData();
      
      // Setup periodic sync
      this.setupPeriodicSync();
      
      console.log('Enhanced Offline Service initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to initialize Enhanced Offline Service:', error);
      return { success: false, error: error.message };
    }
  }

  async initializeDatabase() {
    try {
      this.db = SQLite.openDatabase('digame_offline.db');
      
      // Create tables for offline data
      await this.createTables();
      
      console.log('Offline database initialized');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async createTables() {
    const tables = [
      // User data table
      `CREATE TABLE IF NOT EXISTS user_data (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        last_modified INTEGER NOT NULL,
        sync_status TEXT DEFAULT 'pending'
      )`,
      
      // Analytics data table
      `CREATE TABLE IF NOT EXISTS analytics_data (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        sync_status TEXT DEFAULT 'pending'
      )`,
      
      // Workflow data table
      `CREATE TABLE IF NOT EXISTS workflow_data (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        data TEXT NOT NULL,
        last_modified INTEGER NOT NULL,
        sync_status TEXT DEFAULT 'pending'
      )`,
      
      // Settings table
      `CREATE TABLE IF NOT EXISTS settings_data (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        last_modified INTEGER NOT NULL,
        sync_status TEXT DEFAULT 'pending'
      )`,
      
      // Sync queue table
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        operation TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        retry_count INTEGER DEFAULT 0
      )`,
      
      // Cache table
      `CREATE TABLE IF NOT EXISTS cache_data (
        key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      )`
    ];

    for (const tableSQL of tables) {
      await this.executeSQL(tableSQL);
    }
  }

  async executeSQL(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  async setupNetworkMonitoring() {
    // Monitor network connectivity
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;
      
      console.log('Network status changed:', {
        isOnline: this.isOnline,
        wasOnline,
        type: state.type
      });
      
      // Notify listeners
      this.notifyListeners('networkChange', {
        isOnline: this.isOnline,
        wasOnline,
        connectionType: state.type
      });
      
      // Auto-sync when coming back online
      if (!wasOnline && this.isOnline) {
        this.syncData();
      }
    });
    
    // Get initial network state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected && state.isInternetReachable;
  }

  async loadOfflineData() {
    try {
      // Load last sync time
      const lastSync = await AsyncStorage.getItem('lastSyncTime');
      this.lastSyncTime = lastSync ? new Date(lastSync) : null;
      
      // Load pending sync queue
      const queueResult = await this.executeSQL(
        'SELECT * FROM sync_queue ORDER BY timestamp ASC'
      );
      
      this.syncQueue = queueResult.rows._array || [];
      
      console.log(`Loaded ${this.syncQueue.length} pending sync operations`);
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  setupPeriodicSync() {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncData();
      }
    }, 5 * 60 * 1000);
  }

  // Data storage methods
  async storeUserData(userId, data) {
    try {
      const timestamp = Date.now();
      const serializedData = JSON.stringify(data);
      
      await this.executeSQL(
        `INSERT OR REPLACE INTO user_data (id, data, last_modified, sync_status) 
         VALUES (?, ?, ?, ?)`,
        [userId, serializedData, timestamp, 'pending']
      );
      
      // Add to sync queue if offline
      if (!this.isOnline) {
        await this.addToSyncQueue('update', 'user_data', userId, data);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to store user data:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserData(userId) {
    try {
      const result = await this.executeSQL(
        'SELECT data FROM user_data WHERE id = ?',
        [userId]
      );
      
      if (result.rows.length > 0) {
        return JSON.parse(result.rows.item(0).data);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  async storeAnalyticsData(type, data) {
    try {
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = Date.now();
      const serializedData = JSON.stringify(data);
      
      await this.executeSQL(
        `INSERT INTO analytics_data (id, type, data, timestamp, sync_status) 
         VALUES (?, ?, ?, ?, ?)`,
        [id, type, serializedData, timestamp, 'pending']
      );
      
      // Add to sync queue if offline
      if (!this.isOnline) {
        await this.addToSyncQueue('create', 'analytics_data', id, { type, data, timestamp });
      }
      
      return { success: true, id };
    } catch (error) {
      console.error('Failed to store analytics data:', error);
      return { success: false, error: error.message };
    }
  }

  async getAnalyticsData(type, limit = 100) {
    try {
      const result = await this.executeSQL(
        'SELECT * FROM analytics_data WHERE type = ? ORDER BY timestamp DESC LIMIT ?',
        [type, limit]
      );
      
      return result.rows._array.map(row => ({
        id: row.id,
        type: row.type,
        data: JSON.parse(row.data),
        timestamp: row.timestamp,
        syncStatus: row.sync_status
      }));
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      return [];
    }
  }

  async storeWorkflowData(workflowId, data) {
    try {
      const timestamp = Date.now();
      const serializedData = JSON.stringify(data);
      
      await this.executeSQL(
        `INSERT OR REPLACE INTO workflow_data (id, workflow_id, data, last_modified, sync_status) 
         VALUES (?, ?, ?, ?, ?)`,
        [workflowId, workflowId, serializedData, timestamp, 'pending']
      );
      
      // Add to sync queue if offline
      if (!this.isOnline) {
        await this.addToSyncQueue('update', 'workflow_data', workflowId, data);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to store workflow data:', error);
      return { success: false, error: error.message };
    }
  }

  async getWorkflowData(workflowId) {
    try {
      const result = await this.executeSQL(
        'SELECT data FROM workflow_data WHERE workflow_id = ?',
        [workflowId]
      );
      
      if (result.rows.length > 0) {
        return JSON.parse(result.rows.item(0).data);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get workflow data:', error);
      return null;
    }
  }

  async storeSetting(key, value) {
    try {
      const timestamp = Date.now();
      const serializedValue = JSON.stringify(value);
      
      await this.executeSQL(
        `INSERT OR REPLACE INTO settings_data (key, value, last_modified, sync_status) 
         VALUES (?, ?, ?, ?)`,
        [key, serializedValue, timestamp, 'pending']
      );
      
      // Add to sync queue if offline
      if (!this.isOnline) {
        await this.addToSyncQueue('update', 'settings_data', key, value);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to store setting:', error);
      return { success: false, error: error.message };
    }
  }

  async getSetting(key, defaultValue = null) {
    try {
      const result = await this.executeSQL(
        'SELECT value FROM settings_data WHERE key = ?',
        [key]
      );
      
      if (result.rows.length > 0) {
        return JSON.parse(result.rows.item(0).value);
      }
      
      return defaultValue;
    } catch (error) {
      console.error('Failed to get setting:', error);
      return defaultValue;
    }
  }

  // Cache methods
  async setCache(key, data, ttl = 3600000) { // Default 1 hour TTL
    try {
      const now = Date.now();
      const expiresAt = now + ttl;
      const serializedData = JSON.stringify(data);
      
      await this.executeSQL(
        `INSERT OR REPLACE INTO cache_data (key, data, expires_at, created_at) 
         VALUES (?, ?, ?, ?)`,
        [key, serializedData, expiresAt, now]
      );
      
      return { success: true };
    } catch (error) {
      console.error('Failed to set cache:', error);
      return { success: false, error: error.message };
    }
  }

  async getCache(key) {
    try {
      const now = Date.now();
      const result = await this.executeSQL(
        'SELECT data, expires_at FROM cache_data WHERE key = ? AND expires_at > ?',
        [key, now]
      );
      
      if (result.rows.length > 0) {
        return JSON.parse(result.rows.item(0).data);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  }

  async clearExpiredCache() {
    try {
      const now = Date.now();
      await this.executeSQL(
        'DELETE FROM cache_data WHERE expires_at <= ?',
        [now]
      );
      
      console.log('Expired cache cleared');
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }

  // Sync queue methods
  async addToSyncQueue(operation, tableName, recordId, data) {
    try {
      const id = `${operation}_${tableName}_${recordId}_${Date.now()}`;
      const timestamp = Date.now();
      const serializedData = JSON.stringify(data);
      
      await this.executeSQL(
        `INSERT INTO sync_queue (id, operation, table_name, record_id, data, timestamp, retry_count) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, operation, tableName, recordId, serializedData, timestamp, 0]
      );
      
      this.syncQueue.push({
        id,
        operation,
        table_name: tableName,
        record_id: recordId,
        data: serializedData,
        timestamp,
        retry_count: 0
      });
      
      console.log(`Added to sync queue: ${operation} ${tableName} ${recordId}`);
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  async syncData() {
    if (this.syncInProgress || !this.isOnline) {
      return { success: false, reason: 'Sync already in progress or offline' };
    }
    
    try {
      this.syncInProgress = true;
      console.log('Starting data synchronization...');
      
      // Clear expired cache first
      await this.clearExpiredCache();
      
      // Process sync queue
      const results = await this.processSyncQueue();
      
      // Update last sync time
      this.lastSyncTime = new Date();
      await AsyncStorage.setItem('lastSyncTime', this.lastSyncTime.toISOString());
      
      // Notify listeners
      this.notifyListeners('syncComplete', {
        success: true,
        processed: results.processed,
        failed: results.failed,
        timestamp: this.lastSyncTime
      });
      
      console.log('Data synchronization completed:', results);
      return { success: true, results };
      
    } catch (error) {
      console.error('Data synchronization failed:', error);
      
      this.notifyListeners('syncError', {
        error: error.message,
        timestamp: new Date()
      });
      
      return { success: false, error: error.message };
    } finally {
      this.syncInProgress = false;
    }
  }

  async processSyncQueue() {
    let processed = 0;
    let failed = 0;
    
    for (const item of this.syncQueue) {
      try {
        const success = await this.syncItem(item);
        if (success) {
          processed++;
          await this.removeFromSyncQueue(item.id);
        } else {
          failed++;
          await this.incrementRetryCount(item.id);
        }
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        failed++;
        await this.incrementRetryCount(item.id);
      }
    }
    
    // Reload sync queue
    await this.loadOfflineData();
    
    return { processed, failed };
  }

  async syncItem(item) {
    try {
      // This would make actual API calls to sync data
      // For now, we'll simulate the sync process
      
      console.log(`Syncing ${item.operation} ${item.table_name} ${item.record_id}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mark as synced in local database
      await this.markAsSynced(item.table_name, item.record_id);
      
      return true;
    } catch (error) {
      console.error(`Failed to sync item:`, error);
      return false;
    }
  }

  async markAsSynced(tableName, recordId) {
    try {
      const updateSQL = `UPDATE ${tableName} SET sync_status = 'synced' WHERE id = ?`;
      await this.executeSQL(updateSQL, [recordId]);
    } catch (error) {
      console.error('Failed to mark as synced:', error);
    }
  }

  async removeFromSyncQueue(id) {
    try {
      await this.executeSQL('DELETE FROM sync_queue WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
    }
  }

  async incrementRetryCount(id) {
    try {
      await this.executeSQL(
        'UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?',
        [id]
      );
      
      // Remove items that have exceeded max retries
      await this.executeSQL(
        'DELETE FROM sync_queue WHERE retry_count > ?',
        [this.maxRetries]
      );
    } catch (error) {
      console.error('Failed to increment retry count:', error);
    }
  }

  // Utility methods
  async getOfflineStatus() {
    return {
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      pendingSync: this.syncQueue.length,
      syncInProgress: this.syncInProgress,
      capabilities: this.offlineCapabilities
    };
  }

  async clearOfflineData() {
    try {
      const tables = ['user_data', 'analytics_data', 'workflow_data', 'settings_data', 'sync_queue', 'cache_data'];
      
      for (const table of tables) {
        await this.executeSQL(`DELETE FROM ${table}`);
      }
      
      this.syncQueue = [];
      this.lastSyncTime = null;
      await AsyncStorage.removeItem('lastSyncTime');
      
      console.log('Offline data cleared');
      return { success: true };
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      return { success: false, error: error.message };
    }
  }

  async exportOfflineData() {
    try {
      const data = {
        userData: await this.executeSQL('SELECT * FROM user_data'),
        analyticsData: await this.executeSQL('SELECT * FROM analytics_data'),
        workflowData: await this.executeSQL('SELECT * FROM workflow_data'),
        settingsData: await this.executeSQL('SELECT * FROM settings_data'),
        syncQueue: await this.executeSQL('SELECT * FROM sync_queue'),
        cacheData: await this.executeSQL('SELECT * FROM cache_data'),
        exportTime: new Date().toISOString()
      };
      
      const exportPath = `${FileSystem.documentDirectory}offline_data_export.json`;
      await FileSystem.writeAsStringAsync(exportPath, JSON.stringify(data, null, 2));
      
      return { success: true, path: exportPath };
    } catch (error) {
      console.error('Failed to export offline data:', error);
      return { success: false, error: error.message };
    }
  }

  // Event listeners
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Listener callback error:', error);
      }
    });
  }

  async toggle() {
    // This would toggle offline mode capabilities
    return {
      enabled: !this.isOnline,
      status: this.isOnline ? 'Online' : 'Offline'
    };
  }

  async hasValidSession() {
    try {
      const sessionData = await this.getSetting('userSession');
      return sessionData && sessionData.token && sessionData.expiresAt > Date.now();
    } catch (error) {
      return false;
    }
  }
}

export default new EnhancedOfflineService();