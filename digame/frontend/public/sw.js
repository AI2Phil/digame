/**
 * Service Worker for Push Notifications
 * Handles background push notifications and notification interactions
 */

const CACHE_NAME = 'digame-notifications-v1';
const urlsToCache = [
  '/icons/notification-icon.png',
  '/icons/badge-icon.png',
  '/sounds/notification-default.mp3',
  '/sounds/notification-achievement.mp3',
  '/sounds/notification-milestone.mp3',
  '/sounds/notification-alert.mp3'
];

// Install event - cache notification assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache notification assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
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
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'Digame Notification',
    body: 'You have a new notification',
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    tag: 'default',
    requireInteraction: false,
    actions: []
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Failed to parse push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // Customize notification based on type
  if (notificationData.type) {
    switch (notificationData.type) {
      case 'achievement':
        notificationData.icon = '/icons/achievement-icon.png';
        notificationData.badge = '/icons/trophy-badge.png';
        notificationData.tag = 'achievement';
        notificationData.requireInteraction = true;
        notificationData.actions = [
          {
            action: 'view',
            title: 'View Achievement',
            icon: '/icons/view-icon.png'
          },
          {
            action: 'share',
            title: 'Share',
            icon: '/icons/share-icon.png'
          }
        ];
        break;

      case 'goal_progress':
        notificationData.icon = '/icons/goal-icon.png';
        notificationData.badge = '/icons/target-badge.png';
        notificationData.tag = 'goal_progress';
        notificationData.actions = [
          {
            action: 'view_goal',
            title: 'View Goal',
            icon: '/icons/view-icon.png'
          },
          {
            action: 'update_progress',
            title: 'Update Progress',
            icon: '/icons/edit-icon.png'
          }
        ];
        break;

      case 'system_alert':
        notificationData.icon = '/icons/alert-icon.png';
        notificationData.badge = '/icons/warning-badge.png';
        notificationData.tag = 'system_alert';
        notificationData.requireInteraction = true;
        notificationData.actions = [
          {
            action: 'acknowledge',
            title: 'Acknowledge',
            icon: '/icons/check-icon.png'
          },
          {
            action: 'view_details',
            title: 'View Details',
            icon: '/icons/details-icon.png'
          }
        ];
        break;

      case 'social_activity':
        notificationData.icon = '/icons/social-icon.png';
        notificationData.badge = '/icons/users-badge.png';
        notificationData.tag = 'social_activity';
        notificationData.actions = [
          {
            action: 'view_profile',
            title: 'View Profile',
            icon: '/icons/profile-icon.png'
          }
        ];
        break;
    }
  }

  // Show notification
  const notificationPromise = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: notificationData.data || {},
      timestamp: Date.now(),
      vibrate: notificationData.vibrate || [200, 100, 200],
      silent: notificationData.silent || false
    }
  );

  event.waitUntil(notificationPromise);
});

// Notification click event - handle user interactions
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  // Handle different actions
  let urlToOpen = '/';

  if (action) {
    switch (action) {
      case 'view':
      case 'view_achievement':
        urlToOpen = '/profile?tab=achievements';
        if (data.achievement_id) {
          urlToOpen += `&highlight=${data.achievement_id}`;
        }
        break;

      case 'view_goal':
        urlToOpen = '/profile?tab=goals';
        if (data.goal_id) {
          urlToOpen += `&highlight=${data.goal_id}`;
        }
        break;

      case 'update_progress':
        urlToOpen = '/profile?tab=goals';
        if (data.goal_id) {
          urlToOpen += `&edit=${data.goal_id}`;
        }
        break;

      case 'acknowledge':
        // Send acknowledgment to server
        if (data.alert_id) {
          fetch('/api/notifications/system-alerts/' + data.alert_id + '/acknowledge', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + (data.token || ''),
              'Content-Type': 'application/json'
            }
          }).catch(error => {
            console.error('Failed to acknowledge alert:', error);
          });
        }
        return; // Don't open a window

      case 'view_details':
        urlToOpen = '/admin?tab=alerts';
        if (data.alert_id) {
          urlToOpen += `&highlight=${data.alert_id}`;
        }
        break;

      case 'view_profile':
        urlToOpen = '/social';
        if (data.user_id) {
          urlToOpen += `?user=${data.user_id}`;
        }
        break;

      case 'share':
        // Handle sharing
        if (navigator.share && data.share_data) {
          navigator.share(data.share_data).catch(error => {
            console.error('Failed to share:', error);
          });
        }
        return; // Don't open a window

      default:
        // Default action based on notification type
        switch (notification.tag) {
          case 'achievement':
            urlToOpen = '/profile?tab=achievements';
            break;
          case 'goal_progress':
            urlToOpen = '/profile?tab=goals';
            break;
          case 'system_alert':
            urlToOpen = '/admin';
            break;
          case 'social_activity':
            urlToOpen = '/social';
            break;
        }
    }
  } else {
    // No specific action, use default based on type
    switch (notification.tag) {
      case 'achievement':
        urlToOpen = '/profile?tab=achievements';
        break;
      case 'goal_progress':
        urlToOpen = '/profile?tab=goals';
        break;
      case 'system_alert':
        urlToOpen = '/admin';
        break;
      case 'social_activity':
        urlToOpen = '/social';
        break;
    }
  }

  // Open or focus the app window
  const openWindow = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((clientList) => {
    // Check if there's already a window open
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.url.includes(self.location.origin)) {
        // Focus existing window and navigate
        client.focus();
        return client.navigate(urlToOpen);
      }
    }

    // Open new window
    return clients.openWindow(urlToOpen);
  });

  event.waitUntil(openWindow);
});

// Notification close event - track dismissals
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);

  const notification = event.notification;
  const data = notification.data || {};

  // Track notification dismissal
  if (data.track_dismissal) {
    fetch('/api/notifications/track-dismissal', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + (data.token || ''),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notification_id: data.notification_id,
        type: notification.tag,
        dismissed_at: new Date().toISOString()
      })
    }).catch(error => {
      console.error('Failed to track notification dismissal:', error);
    });
  }
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Sync notifications when back online
async function syncNotifications() {
  try {
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const notifications = await response.json();
      
      // Show any missed notifications
      notifications.forEach(notification => {
        self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/icons/notification-icon.png',
          badge: notification.badge || '/icons/badge-icon.png',
          tag: notification.tag || 'sync',
          data: notification.data || {}
        });
      });
    }
  } catch (error) {
    console.error('Failed to sync notifications:', error);
  }
}

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);

  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;

    case 'CLEAR_NOTIFICATIONS':
      // Clear all notifications
      self.registration.getNotifications().then(notifications => {
        notifications.forEach(notification => notification.close());
      });
      break;

    case 'SHOW_TEST_NOTIFICATION':
      self.registration.showNotification('Test Notification', {
        body: 'This is a test notification from Digame',
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: 'test'
      });
      break;

    default:
      console.log('Unknown message type:', type);
  }
});