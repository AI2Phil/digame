class WebOfflineService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.db = null;
    this.dbName = 'DigameOfflineDB';
    this.dbVersion = 1;
    this.syncQueue = [];
    this.listeners = [];
    this.syncInProgress = false;
  }

  async initialize() {
    try {
      // Initialize IndexedDB
      await this.initializeDB();
      
      // Set up network listeners
      this.setupNetworkListeners();
      
      // Load pending sync queue
      await this.loadSyncQueue();
      
      // If online, attempt to sync
      if (this.isOnline) {
        this.syncData();
      }
      
      // Register background sync if supported
      this.registerBackgroundSync();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
      return false;
    }
  }

  async initializeDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('activities')) {
          const activitiesStore = db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
          activitiesStore.createIndex('timestamp', 'timestamp', { unique: false });
          activitiesStore.createIndex('synced', 'synced', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('pendingSync')) {
          const syncStore = db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('userPreferences')) {
          const prefsStore = db.createObjectStore('userPreferences', { keyPath: 'key' });
        }
      };
    });
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      const wasOffline = !this.isOnline;
      this.isOnline = true;
      
      this.notifyListeners({
        isOnline: true,
        wasOffline,
        connectionType: this.getConnectionType()
      });
      
      if (wasOffline) {
        console.log('Network restored, starting sync...');
        this.syncData();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      
      this.notifyListeners({
        isOnline: false,
        wasOffline: false,
        connectionType: 'none'
      });
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

  getConnectionType() {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  async cacheData(key, data, expirationMinutes = 60) {
    if (!this.db) return false;

    try {
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
      
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      await new Promise((resolve, reject) => {
        const request = store.put({
          key,
          data,
          timestamp: new Date(),
          expiresAt
        });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to cache data:', error);
      return false;
    }
  }

  async getCachedData(key) {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      
      const result = await new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (result && result.expiresAt > new Date()) {
        return result.data;
      } else if (result) {
        // Remove expired data
        this.removeCachedData(key);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  async removeCachedData(key) {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      store.delete(key);
    } catch (error) {
      console.error('Failed to remove cached data:', error);
    }
  }

  async storeOfflineActivity(activity) {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction(['activities'], 'readwrite');
      const store = transaction.objectStore('activities');
      
      const activityData = {
        ...activity,
        timestamp: new Date(),
        synced: false
      };
      
      const result = await new Promise((resolve, reject) => {
        const request = store.add(activityData);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      return result;
    } catch (error) {
      console.error('Failed to store offline activity:', error);
      return null;
    }
  }

  async addToSyncQueue(action, url, method, data) {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction(['pendingSync'], 'readwrite');
      const store = transaction.objectStore('pendingSync');
      
      const syncItem = {
        action,
        url,
        method,
        data,
        timestamp: new Date(),
        retryCount: 0,
        token: localStorage.getItem('token')
      };
      
      const result = await new Promise((resolve, reject) => {
        const request = store.add(syncItem);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      // Add to memory queue as well
      this.syncQueue.push({ ...syncItem, id: result });
      
      return result;
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      return null;
    }
  }

  async loadSyncQueue() {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['pendingSync'], 'readonly');
      const store = transaction.objectStore('pendingSync');
      
      const items = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      this.syncQueue = items;
      console.log(`Loaded ${items.length} items in sync queue`);
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  async syncData() {
    if (this.syncInProgress || !this.isOnline || !this.db) {
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
    const response = await fetch(item.url, {
      method: item.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${item.token}`,
      },
      body: item.method !== 'GET' ? JSON.stringify(item.data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async syncUnsyncedActivities() {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['activities'], 'readonly');
      const store = transaction.objectStore('activities');
      const index = store.index('synced');
      
      const unsyncedActivities = await new Promise((resolve, reject) => {
        const request = index.getAll(false);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      for (const activity of unsyncedActivities) {
        try {
          await this.syncActivity(activity);
          await this.markActivitySynced(activity.id);
        } catch (error) {
          console.error('Failed to sync activity:', error);
        }
      }
    } catch (error) {
      console.error('Failed to sync unsynced activities:', error);
    }
  }

  async syncActivity(activity) {
    const response = await fetch('/api/activities/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        user_id: activity.user_id,
        activity_type: activity.activity_type,
        timestamp: activity.timestamp,
        details: activity.details,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync activity: ${response.status}`);
    }

    return await response.json();
  }

  async markActivitySynced(activityId) {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['activities'], 'readwrite');
      const store = transaction.objectStore('activities');
      
      const activity = await new Promise((resolve, reject) => {
        const request = store.get(activityId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (activity) {
        activity.synced = true;
        store.put(activity);
      }
    } catch (error) {
      console.error('Failed to mark activity as synced:', error);
    }
  }

  async removeFromSyncQueue(itemId) {
    if (!this.db) return;

    try {
      // Remove from memory
      this.syncQueue = this.syncQueue.filter(item => item.id !== itemId);

      // Remove from database
      const transaction = this.db.transaction(['pendingSync'], 'readwrite');
      const store = transaction.objectStore('pendingSync');
      store.delete(itemId);
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
    }
  }

  async incrementRetryCount(itemId) {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['pendingSync'], 'readwrite');
      const store = transaction.objectStore('pendingSync');
      
      const item = await new Promise((resolve, reject) => {
        const request = store.get(itemId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (item) {
        item.retryCount = (item.retryCount || 0) + 1;
        
        // Remove items that have failed too many times
        if (item.retryCount > 5) {
          store.delete(itemId);
          this.syncQueue = this.syncQueue.filter(i => i.id !== itemId);
        } else {
          store.put(item);
          const memoryItem = this.syncQueue.find(i => i.id === itemId);
          if (memoryItem) {
            memoryItem.retryCount = item.retryCount;
          }
        }
      }
    } catch (error) {
      console.error('Failed to increment retry count:', error);
    }
  }

  async clearCache() {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  async clearAllData() {
    if (!this.db) return false;

    try {
      const storeNames = ['activities', 'cache', 'pendingSync', 'userPreferences'];
      const transaction = this.db.transaction(storeNames, 'readwrite');
      
      for (const storeName of storeNames) {
        const store = transaction.objectStore(storeName);
        store.clear();
      }
      
      this.syncQueue = [];
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('background-sync');
      }).catch((error) => {
        console.error('Background sync registration failed:', error);
      });
    }
  }

  getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      syncQueueLength: this.syncQueue.length,
      syncInProgress: this.syncInProgress,
      connectionType: this.getConnectionType()
    };
  }

  // Enhanced fetch with offline support
  async enhancedFetch(url, options = {}) {
    const cacheKey = `${options.method || 'GET'}_${url}`;
    
    try {
      if (this.isOnline) {
        const response = await fetch(url, options);
        
        if (response.ok && options.method === 'GET') {
          // Cache successful GET requests
          const data = await response.clone().json();
          await this.cacheData(cacheKey, data, 30); // Cache for 30 minutes
        }
        
        return response;
      } else {
        // Offline - try to get from cache or add to sync queue
        if (options.method === 'GET') {
          const cachedData = await this.getCachedData(cacheKey);
          if (cachedData) {
            return new Response(JSON.stringify(cachedData), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } else {
          // Add non-GET requests to sync queue
          await this.addToSyncQueue('api_call', url, options.method, options.body ? JSON.parse(options.body) : null);
          
          // Return a success response for offline operations
          return new Response(JSON.stringify({ success: true, offline: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        throw new Error('No cached data available and device is offline');
      }
    } catch (error) {
      console.error('Enhanced fetch failed:', error);
      throw error;
    }
  }
}

export default new WebOfflineService();