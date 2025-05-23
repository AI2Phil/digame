// Service Worker for Push Notifications and Offline Capability
const CACHE_NAME = 'digame-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Ensure the new service worker takes control immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'Digame Notification',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'default',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-dismiss.png'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  // Handle different actions
  let url = '/';
  
  switch (action) {
    case 'view':
      url = data.url || '/dashboard';
      break;
    case 'dismiss':
      // Just close the notification
      return;
    default:
      // Default click action
      url = data.url || '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }

        // If no existing window/tab, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
      .then(() => {
        // Send message to client about notification click
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              action: action,
              notification: event.notification.data
            });
          });
        });
      })
  );
});

// Background sync event (for offline data sync)
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Get pending sync data from IndexedDB
    const pendingData = await getPendingSyncData();
    
    if (pendingData.length > 0) {
      console.log('Syncing', pendingData.length, 'pending items');
      
      for (const item of pendingData) {
        try {
          await syncDataItem(item);
          await removePendingSyncData(item.id);
        } catch (error) {
          console.error('Failed to sync item:', item.id, error);
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingSyncData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DigameOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingSync'], 'readonly');
      const store = transaction.objectStore('pendingSync');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingSync')) {
        const store = db.createObjectStore('pendingSync', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function syncDataItem(item) {
  const response = await fetch(item.url, {
    method: item.method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${item.token}`
    },
    body: item.data ? JSON.stringify(item.data) : undefined
  });

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function removePendingSyncData(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DigameOfflineDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingSync'], 'readwrite');
      const store = transaction.objectStore('pendingSync');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync triggered:', event.tag);

  if (event.tag === 'content-sync') {
    event.waitUntil(doPeriodicSync());
  }
});

async function doPeriodicSync() {
  try {
    // Sync critical data periodically
    console.log('Performing periodic sync...');
    
    // You can implement periodic data fetching here
    // For example, sync user preferences, goals, etc.
    
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

console.log('Service Worker loaded');