/**
 * PWA Utilities for Digital Twin Platform
 * Handles service worker registration, installation prompts, and offline detection
 */

// Service Worker registration
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              showUpdateAvailableNotification();
            }
          });
        });
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    });
  }
};

// Handle messages from service worker
const handleServiceWorkerMessage = (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'BACKGROUND_SYNC_SUCCESS':
      showNotification('Sync Complete', `Request to ${data.url} completed successfully`);
      break;
    case 'WEBSOCKET_RECONNECT':
      // Trigger WebSocket reconnection in the app
      window.dispatchEvent(new CustomEvent('websocket-reconnect'));
      break;
    default:
      console.log('Unknown service worker message:', type, data);
  }
};

// PWA Installation
let deferredPrompt = null;

export const initializePWAInstallation = () => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showInstallPrompt();
  });
  
  // Listen for app installation
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    hideInstallPrompt();
    showNotification('App Installed', 'Digital Twin Platform is now installed on your device');
  });
};

// Show install prompt
const showInstallPrompt = () => {
  const installBanner = document.createElement('div');
  installBanner.id = 'pwa-install-banner';
  installBanner.className = 'pwa-install-banner';
  installBanner.innerHTML = `
    <div class="install-banner-content">
      <div class="install-banner-text">
        <h3>Install Digital Twin Platform</h3>
        <p>Get the full app experience with offline capabilities</p>
      </div>
      <div class="install-banner-actions">
        <button id="install-button" class="install-btn primary">Install</button>
        <button id="dismiss-install" class="install-btn secondary">Later</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(installBanner);
  
  // Add event listeners
  document.getElementById('install-button').addEventListener('click', installPWA);
  document.getElementById('dismiss-install').addEventListener('click', hideInstallPrompt);
  
  // Auto-hide after 10 seconds
  setTimeout(hideInstallPrompt, 10000);
};

// Install PWA
const installPWA = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    deferredPrompt = null;
    hideInstallPrompt();
  }
};

// Hide install prompt
const hideInstallPrompt = () => {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.remove();
  }
};

// Update notification
const showUpdateAvailableNotification = () => {
  const updateBanner = document.createElement('div');
  updateBanner.id = 'pwa-update-banner';
  updateBanner.className = 'pwa-update-banner';
  updateBanner.innerHTML = `
    <div class="update-banner-content">
      <div class="update-banner-text">
        <h3>Update Available</h3>
        <p>A new version of the app is available</p>
      </div>
      <div class="update-banner-actions">
        <button id="update-button" class="update-btn primary">Update</button>
        <button id="dismiss-update" class="update-btn secondary">Later</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(updateBanner);
  
  document.getElementById('update-button').addEventListener('click', () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  });
  
  document.getElementById('dismiss-update').addEventListener('click', () => {
    updateBanner.remove();
  });
};

// Offline/Online detection
export const initializeOfflineDetection = () => {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    document.body.classList.toggle('offline', !isOnline);
    
    if (isOnline) {
      showNotification('Back Online', 'Connection restored');
      // Trigger background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
          registration.sync.register('background-sync-requests');
        });
      }
    } else {
      showNotification('Offline', 'You are now offline. Some features may be limited.');
    }
  };
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial status
  updateOnlineStatus();
};

// Push notifications
export const initializePushNotifications = async () => {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
      });
      
      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
      
      console.log('Push notifications enabled');
      return subscription;
    }
  }
  
  return null;
};

// Utility function for VAPID key conversion
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
};

// Generic notification system
export const showNotification = (title, message, options = {}) => {
  const notification = document.createElement('div');
  notification.className = `pwa-notification ${options.type || 'info'}`;
  notification.innerHTML = `
    <div class="notification-content">
      <h4>${title}</h4>
      <p>${message}</p>
      <button class="notification-close">×</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
  
  // Manual close
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.remove();
  });
};

// App state management for PWA
export const getPWAState = () => {
  return {
    isInstalled: window.matchMedia('(display-mode: standalone)').matches,
    isOnline: navigator.onLine,
    hasServiceWorker: 'serviceWorker' in navigator,
    hasPushNotifications: 'Notification' in window && Notification.permission === 'granted',
    hasBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
  };
};

// Cache management
export const clearAppCache = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('App cache cleared');
  }
};

// Storage usage
export const getStorageUsage = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage,
      available: estimate.quota,
      percentage: Math.round((estimate.usage / estimate.quota) * 100)
    };
  }
  return null;
};

// Initialize all PWA features
export const initializePWA = () => {
  registerServiceWorker();
  initializePWAInstallation();
  initializeOfflineDetection();
  initializePushNotifications();
  
  console.log('PWA features initialized');
};

export default {
  registerServiceWorker,
  initializePWAInstallation,
  initializeOfflineDetection,
  initializePushNotifications,
  showNotification,
  getPWAState,
  clearAppCache,
  getStorageUsage,
  initializePWA
};