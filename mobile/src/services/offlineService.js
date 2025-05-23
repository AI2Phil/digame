import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

class OfflineService {
  constructor() {
    this.isOnline = true;
    this.db = null;
    this.syncQueue = [];
    this.listeners = [];
    this.syncInProgress = false;
  }

  async initialize() {
    try {
      // Initialize SQLite database
      this.db = SQLite.openDatabase('digame_offline.db');
      
      // Create tables for offline storage
      await this.createTables();
      
      // Load sync queue from storage
      await this.loadSyncQueue();
      
      // Set up network listener
      this.setupNetworkListener();
      
      // Check initial network state
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected;
      
      // If online, attempt to sync
      if (this.isOnline) {
        this.syncData();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
      return false;
    }
  }

  createTables() {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          // Activities table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS activities (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER,
              activity_type TEXT,
              timestamp TEXT,
              details TEXT,
              synced INTEGER DEFAULT 0,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // Analytics data table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS analytics_cache (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              endpoint TEXT,
              data TEXT,
              timestamp TEXT,
              expires_at TEXT
            );
          `);

          // Sync queue table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS sync_queue (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              action TEXT,
              endpoint TEXT,
              method TEXT,
              data TEXT,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP,
              retry_count INTEGER DEFAULT 0
            );
          `);

          // User preferences table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS user_preferences (
              key TEXT PRIMARY KEY,
              value TEXT,
              synced INTEGER DEFAULT 0
            );
          `);
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected;
      
      // Notify listeners about network state change
      this.notifyListeners({
        isOnline: this.isOnline,
        wasOnline,
        connectionType: state.type,
      });
      
      // If we just came online, sync data
      if (!wasOnline && this.isOnline) {
        console.log('Network restored, starting sync...');
        this.syncData();
      }
    });
  }

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

  async cacheData(endpoint, data, expirationMinutes = 60) {
    try {
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString();
      
      return new Promise((resolve, reject) => {
        this.db.transaction(
          (tx) => {
            tx.executeSql(
              'INSERT OR REPLACE INTO analytics_cache (endpoint, data, timestamp, expires_at) VALUES (?, ?, ?, ?)',
              [endpoint, JSON.stringify(data), new Date().toISOString(), expiresAt],
              () => resolve(true),
              (_, error) => reject(error)
            );
          }
        );
      });
    } catch (error) {
      console.error('Failed to cache data:', error);
      return false;
    }
  }

  async getCachedData(endpoint) {
    try {
      return new Promise((resolve, reject) => {
        this.db.transaction(
          (tx) => {
            tx.executeSql(
              'SELECT data, expires_at FROM analytics_cache WHERE endpoint = ? AND expires_at > datetime("now")',
              [endpoint],
              (_, { rows }) => {
                if (rows.length > 0) {
                  resolve(JSON.parse(rows.item(0).data));
                } else {
                  resolve(null);
                }
              },
              (_, error) => reject(error)
            );
          }
        );
      });
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  async storeOfflineActivity(activity) {
    try {
      return new Promise((resolve, reject) => {
        this.db.transaction(
          (tx) => {
            tx.executeSql(
              'INSERT INTO activities (user_id, activity_type, timestamp, details) VALUES (?, ?, ?, ?)',
              [activity.user_id, activity.activity_type, activity.timestamp, JSON.stringify(activity.details)],
              (_, result) => resolve(result.insertId),
              (_, error) => reject(error)
            );
          }
        );
      });
    } catch (error) {
      console.error('Failed to store offline activity:', error);
      return null;
    }
  }

  async addToSyncQueue(action, endpoint, method, data) {
    try {
      const queueItem = {
        action,
        endpoint,
        method,
        data: JSON.stringify(data),
        created_at: new Date().toISOString(),
        retry_count: 0,
      };

      // Add to memory queue
      this.syncQueue.push(queueItem);

      // Add to database
      return new Promise((resolve, reject) => {
        this.db.transaction(
          (tx) => {
            tx.executeSql(
              'INSERT INTO sync_queue (action, endpoint, method, data, created_at, retry_count) VALUES (?, ?, ?, ?, ?, ?)',
              [queueItem.action, queueItem.endpoint, queueItem.method, queueItem.data, queueItem.created_at, queueItem.retry_count],
              (_, result) => {
                queueItem.id = result.insertId;
                resolve(result.insertId);
              },
              (_, error) => reject(error)
            );
          }
        );
      });
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      return null;
    }
  }

  async loadSyncQueue() {
    try {
      return new Promise((resolve, reject) => {
        this.db.transaction(
          (tx) => {
            tx.executeSql(
              'SELECT * FROM sync_queue ORDER BY created_at ASC',
              [],
              (_, { rows }) => {
                this.syncQueue = [];
                for (let i = 0; i < rows.length; i++) {
                  const item = rows.item(i);
                  this.syncQueue.push({
                    ...item,
                    data: JSON.parse(item.data),
                  });
                }
                resolve(this.syncQueue.length);
              },
              (_, error) => reject(error)
            );
          }
        );
      });
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      return 0;
    }
  }

  async syncData() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log(`Starting sync with ${this.syncQueue.length} items in queue`);

    try {
      const itemsToSync = [...this.syncQueue];
      
      for (const item of itemsToSync) {
        try {
          await this.syncItem(item);
          await this.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error('Failed to sync item:', error);
          await this.incrementRetryCount(item.id);
        }
      }

      // Sync unsynced activities
      await this.syncUnsyncedActivities();

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncItem(item) {
    const { endpoint, method, data } = item;
    
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`,
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async syncUnsyncedActivities() {
    try {
      return new Promise((resolve, reject) => {
        this.db.transaction(
          (tx) => {
            tx.executeSql(
              'SELECT * FROM activities WHERE synced = 0',
              [],
              async (_, { rows }) => {
                for (let i = 0; i < rows.length; i++) {
                  const activity = rows.item(i);
                  try {
                    await this.syncActivity(activity);
                    await this.markActivitySynced(activity.id);
                  } catch (error) {
                    console.error('Failed to sync activity:', error);
                  }
                }
                resolve();
              },
              (_, error) => reject(error)
            );
          }
        );
      });
    } catch (error) {
      console.error('Failed to sync unsynced activities:', error);
    }
  }

  async syncActivity(activity) {
    const response = await fetch('http://localhost:8000/activities/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`,
      },
      body: JSON.stringify({
        user_id: activity.user_id,
        activity_type: activity.activity_type,
        timestamp: activity.timestamp,
        details: JSON.parse(activity.details),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync activity: ${response.status}`);
    }

    return await response.json();
  }

  async markActivitySynced(activityId) {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'UPDATE activities SET synced = 1 WHERE id = ?',
            [activityId],
            () => resolve(),
            (_, error) => reject(error)
          );
        }
      );
    });
  }

  async removeFromSyncQueue(itemId) {
    // Remove from memory
    this.syncQueue = this.syncQueue.filter(item => item.id !== itemId);

    // Remove from database
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'DELETE FROM sync_queue WHERE id = ?',
            [itemId],
            () => resolve(),
            (_, error) => reject(error)
          );
        }
      );
    });
  }

  async incrementRetryCount(itemId) {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?',
            [itemId],
            () => resolve(),
            (_, error) => reject(error)
          );
        }
      );
    });
  }

  async getAuthToken() {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  async clearCache() {
    try {
      return new Promise((resolve, reject) => {
        this.db.transaction(
          (tx) => {
            tx.executeSql('DELETE FROM analytics_cache', [], () => resolve(), (_, error) => reject(error));
          }
        );
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      syncQueueLength: this.syncQueue.length,
      syncInProgress: this.syncInProgress,
    };
  }
}

export default new OfflineService();