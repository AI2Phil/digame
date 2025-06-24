import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

const AI_MODELS_DIR = `${FileSystem.documentDirectory}ai_models/`;

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
      // Ensure AI models directory exists
      await FileSystem.makeDirectoryAsync(AI_MODELS_DIR, { intermediates: true });

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

          // AI Models table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS ai_models (
              model_name TEXT PRIMARY KEY,
              version TEXT,
              file_path TEXT,
              downloaded_at TEXT,
              metadata TEXT
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
    console.log('Starting intelligent data synchronization...');

    try {
      // 1. Prioritize AI Model Updates
      await this.syncAIModelUpdates();

      // 2. Process regular sync queue (including offline-generated AI data if queued)
      console.log(`Processing general sync queue with ${this.syncQueue.length} items.`);
      const itemsToSync = [...this.syncQueue]; // Process a snapshot
      for (const item of itemsToSync) {
        try {
          // TODO: Add specific handling for different action types if needed
          // For example, AI data might have specific endpoints or error handling.
          // if (item.action === 'SYNC_OFFLINE_AI_RESULT') { ... }

          console.log(`Syncing item: ${item.action} to ${item.endpoint}`);
          await this.syncItem(item);
          await this.removeFromSyncQueue(item.id); // Remove from queue on success
          console.log(`Successfully synced item ID: ${item.id}`);
        } catch (error) {
          console.error(`Failed to sync item ID: ${item.id}. Error:`, error);
          // Increment retry count for this specific item
          await this.incrementRetryCount(item.id);
          // TODO: Implement more sophisticated retry logic (e.g., exponential backoff, max retries)
          // For now, it will be retried on the next sync cycle if not exceeding a simple count.
        }
      }

      // 3. Sync other specific unsynced data types (like activities)
      // This demonstrates handling different data types separately if not part of the generic queue.
      await this.syncUnsyncedActivities();

      // TODO: Add conflict resolution logic here if necessary.
      // This could involve fetching latest versions of data before pushing changes,
      // or having the server resolve conflicts. For now, it's a placeholder.
      console.log('Conflict resolution check (placeholder)...');

    } catch (error) {
      console.error('Intelligent sync process failed:', error);
    } finally {
      this.syncInProgress = false;
      console.log('Intelligent data synchronization finished.');
    }
  }

  async syncAIModelUpdates() {
    if (!this.isOnline) return;
    console.log('Checking for AI model updates...');
    try {
      const cachedModels = await this.listCachedModels();
      const serverModelsResponse = await fetch('http://localhost:8000/api/v1/mobile/ai/models', { // Replace with actual API URL
        headers: { 'Authorization': `Bearer ${await this.getAuthToken()}` }
      });

      if (!serverModelsResponse.ok) {
        console.error('Failed to fetch list of server models:', serverModelsResponse.status);
        return;
      }
      const serverModelsList = await serverModelsResponse.json();
      const serverModels = serverModelsList.models;

      for (const cachedModel of cachedModels) {
        const serverEquivalent = serverModels.find(sm => sm.model_name === cachedModel.model_name && sm.language === cachedModel.language);

        if (serverEquivalent && serverEquivalent.version > cachedModel.version) {
          console.log(`Update found for model ${cachedModel.model_name} (Local: ${cachedModel.version}, Server: ${serverEquivalent.version}). Downloading...`);
          // Construct the full download URL if relative
          const downloadUrl = serverEquivalent.download_url.startsWith('http') ? serverEquivalent.download_url : `http://localhost:8000${serverEquivalent.download_url}`;

          const updatedModel = await this.downloadAndCacheModel(
            serverEquivalent.model_name,
            downloadUrl, // This should be the absolute URL from server response
            serverEquivalent.version,
            serverEquivalent.metadata
          );
          if (updatedModel) {
            console.log(`Model ${cachedModel.model_name} updated to version ${serverEquivalent.version} successfully.`);
            // Optionally, remove the old version if storage is a concern,
            // but downloadAndCacheModel (with INSERT OR REPLACE) handles the DB record.
            // Need to ensure old model *file* is deleted if versions are different and paths change.
            // Current downloadAndCacheModel overwrites if filename is the same.
            // If filenames include version, old files might remain.
            // For simplicity, assume downloadAndCacheModel handles replacement or new file.
          } else {
            console.error(`Failed to update model ${cachedModel.model_name} to version ${serverEquivalent.version}.`);
            // TODO: Add to a specific model update retry queue or handle error more gracefully.
          }
        }
      }
    } catch (error) {
      console.error('Error during AI model update check/sync:', error);
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

  // --- AI Model Caching Methods ---

  async downloadAndCacheModel(modelName, modelUrl, version, metadata = {}) {
    if (!this.isOnline) {
      console.warn('Cannot download model: device is offline.');
      return null;
    }

    const fileName = `${modelName}_${version}.model`; // Example file naming
    const localPath = `${AI_MODELS_DIR}${fileName}`;

    try {
      console.log(`Downloading AI model ${modelName} (version ${version}) from ${modelUrl} to ${localPath}`);
      const downloadResult = await FileSystem.downloadAsync(modelUrl, localPath);

      if (downloadResult.status !== 200) {
        console.error(`Failed to download model ${modelName}. Status: ${downloadResult.status}`);
        await FileSystem.deleteAsync(localPath, { idempotent: true }); // Clean up partial download
        return null;
      }

      console.log(`Model ${modelName} downloaded successfully. Size: ${downloadResult.headers['Content-Length']} bytes.`);

      return new Promise((resolve, reject) => {
        this.db.transaction(
          (tx) => {
            tx.executeSql(
              'INSERT OR REPLACE INTO ai_models (model_name, version, file_path, downloaded_at, metadata) VALUES (?, ?, ?, ?, ?)',
              [modelName, version, localPath, new Date().toISOString(), JSON.stringify(metadata)],
              () => {
                console.log(`Model ${modelName} (version ${version}) cached successfully in DB.`);
                resolve({ modelName, version, filePath: localPath, metadata });
              },
              (_, error) => {
                console.error(`Failed to cache model ${modelName} in DB:`, error);
                reject(error);
              }
            );
          }
        );
      });
    } catch (error) {
      console.error(`Error downloading or caching model ${modelName}:`, error);
      await FileSystem.deleteAsync(localPath, { idempotent: true }); // Clean up on error
      return null;
    }
  }

  async getCachedModel(modelName, version = null) {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          let query = 'SELECT * FROM ai_models WHERE model_name = ?';
          const params = [modelName];
          if (version) {
            query += ' AND version = ?';
            params.push(version);
          }
          query += ' ORDER BY downloaded_at DESC LIMIT 1'; // Get the latest if no version specified

          tx.executeSql(
            query,
            params,
            async (_, { rows }) => {
              if (rows.length > 0) {
                const modelRecord = rows.item(0);
                // Verify file exists
                const fileInfo = await FileSystem.getInfoAsync(modelRecord.file_path);
                if (fileInfo.exists) {
                  console.log(`Found cached model ${modelName} (version ${modelRecord.version}) at ${modelRecord.file_path}`);
                  resolve({
                    ...modelRecord,
                    metadata: JSON.parse(modelRecord.metadata || '{}'),
                  });
                } else {
                  console.warn(`Cached model ${modelName} file not found at ${modelRecord.file_path}. Removing DB record.`);
                  await this.removeCachedModel(modelName, modelRecord.version);
                  resolve(null);
                }
              } else {
                console.log(`No cached model found for ${modelName}` + (version ? ` (version ${version})` : ''));
                resolve(null);
              }
            },
            (_, error) => {
              console.error(`Error fetching cached model ${modelName} from DB:`, error);
              reject(error);
            }
          );
        }
      );
    });
  }

  async removeCachedModel(modelName, version) {
    const model = await this.getCachedModel(modelName, version);
    if (model && model.file_path) {
      try {
        await FileSystem.deleteAsync(model.file_path, { idempotent: true });
        console.log(`Deleted model file ${model.file_path}`);
      } catch (error) {
        console.error(`Error deleting model file ${model.file_path}:`, error);
      }
    }

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'DELETE FROM ai_models WHERE model_name = ? AND version = ?',
            [modelName, version],
            () => {
              console.log(`Removed model ${modelName} (version ${version}) from DB.`);
              resolve(true);
            },
            (_, error) => {
              console.error(`Error removing model ${modelName} (version ${version}) from DB:`, error);
              reject(error);
            }
          );
        }
      );
    });
  }

  async listCachedModels() {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT model_name, version, file_path, downloaded_at, metadata FROM ai_models ORDER BY model_name, downloaded_at DESC',
            [],
            (_, { rows }) => {
              const models = [];
              for (let i = 0; i < rows.length; i++) {
                models.push({
                  ...rows.item(i),
                  metadata: JSON.parse(rows.item(i).metadata || '{}'),
                });
              }
              resolve(models);
            },
            (_, error) => {
              console.error('Error listing cached models from DB:', error);
              reject(error);
            }
          );
        }
      );
    });
  }

  async checkForModelUpdates(modelName, currentVersion) {
    // This would typically involve an API call to check for newer versions
    // For now, this is a placeholder.
    // Simulating an API response that a new version is available.
    if (this.isOnline) {
      console.log(`Checking for updates for model ${modelName} (current version: ${currentVersion})`);
      // const response = await fetch(`/api/models/${modelName}/latest`);
      // const latestVersionInfo = await response.json();
      // if (latestVersionInfo.version > currentVersion) {
      //   return latestVersionInfo; // { name, version, url, metadata }
      // }
    }
    return null; // No update found or offline
  }
}

export default new OfflineService();