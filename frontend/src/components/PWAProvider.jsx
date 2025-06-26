import React, { createContext, useContext, useEffect, useState } from 'react';
import webNotificationService from '../services/webNotificationService';
import webOfflineService from '../services/webOfflineService';

const PWAContext = createContext();

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

export const PWAProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    inProgress: false,
    queueLength: 0,
    lastSync: null
  });
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    initializePWA();
  }, []);

  const initializePWA = async () => {
    try {
      // Initialize offline service
      const offlineInitialized = await webOfflineService.initialize();
      console.log('Offline service initialized:', offlineInitialized);

      // Initialize notification service
      const notificationsInitialized = await webNotificationService.initialize();
      setNotificationsEnabled(notificationsInitialized);
      console.log('Notifications initialized:', notificationsInitialized);

      // Set up network listener
      const removeNetworkListener = webOfflineService.addNetworkListener((status) => {
        setIsOnline(status.isOnline);
        setSyncStatus(prev => ({
          ...prev,
          inProgress: webOfflineService.syncInProgress,
          queueLength: status.syncQueueLength || 0
        }));
      });

      // Set up install prompt listener
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setInstallPrompt(e);
      });

      // Check if app is already installed
      window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        setInstallPrompt(null);
      });

      // Check if running as PWA
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }

      // Schedule productivity reminders
      if (notificationsInitialized) {
        await webNotificationService.scheduleProductivityReminders();
      }

      // Cleanup function
      return () => {
        removeNetworkListener();
      };

    } catch (error) {
      console.error('Failed to initialize PWA features:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await webNotificationService.requestPermission();
      const enabled = permission === 'granted';
      setNotificationsEnabled(enabled);
      
      if (enabled) {
        await webNotificationService.scheduleProductivityReminders();
      }
      
      return enabled;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  };

  const showNotification = async (title, options = {}) => {
    if (!notificationsEnabled) {
      console.warn('Notifications not enabled');
      return;
    }

    try {
      return await webNotificationService.showNotification(title, options);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  };

  const showProductivityAlert = async (message) => {
    return showNotification('Productivity Alert', {
      body: message,
      icon: '/icon-productivity.png',
      tag: 'productivity-alert',
      requireInteraction: true
    });
  };

  const showGoalAchievement = async (goalName) => {
    return showNotification('🎉 Goal Achieved!', {
      body: `Congratulations! You've completed: ${goalName}`,
      icon: '/icon-achievement.png',
      tag: 'goal-achievement',
      requireInteraction: true,
      actions: [
        {
          action: 'view-progress',
          title: 'View Progress',
          icon: '/icon-progress.png'
        }
      ]
    });
  };

  const showBreakReminder = async () => {
    return showNotification('☕ Time for a Break!', {
      body: 'You\'ve been working hard. Take a 5-minute break to recharge.',
      icon: '/icon-break.png',
      tag: 'break-reminder',
      actions: [
        {
          action: 'start-break',
          title: 'Start Break',
          icon: '/icon-play.png'
        },
        {
          action: 'snooze',
          title: 'Snooze 10min',
          icon: '/icon-snooze.png'
        }
      ]
    });
  };

  const cacheData = async (key, data, expirationMinutes = 60) => {
    return webOfflineService.cacheData(key, data, expirationMinutes);
  };

  const getCachedData = async (key) => {
    return webOfflineService.getCachedData(key);
  };

  const addToSyncQueue = async (action, url, method, data) => {
    return webOfflineService.addToSyncQueue(action, url, method, data);
  };

  const syncData = async () => {
    if (!isOnline) {
      console.warn('Cannot sync: device is offline');
      return false;
    }

    try {
      setSyncStatus(prev => ({ ...prev, inProgress: true }));
      await webOfflineService.syncData();
      setSyncStatus(prev => ({ 
        ...prev, 
        inProgress: false, 
        lastSync: new Date(),
        queueLength: 0
      }));
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus(prev => ({ ...prev, inProgress: false }));
      return false;
    }
  };

  const clearCache = async () => {
    return webOfflineService.clearCache();
  };

  const installApp = async () => {
    if (!installPrompt) {
      return false;
    }

    try {
      const result = await installPrompt.prompt();
      const outcome = await result.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to install app:', error);
      return false;
    }
  };

  const enhancedFetch = async (url, options = {}) => {
    return webOfflineService.enhancedFetch(url, options);
  };

  const getNetworkStatus = () => {
    return {
      isOnline,
      ...webOfflineService.getNetworkStatus()
    };
  };

  const value = {
    // Network status
    isOnline,
    syncStatus,
    
    // Notifications
    notificationsEnabled,
    requestNotificationPermission,
    showNotification,
    showProductivityAlert,
    showGoalAchievement,
    showBreakReminder,
    
    // Offline capabilities
    cacheData,
    getCachedData,
    addToSyncQueue,
    syncData,
    clearCache,
    enhancedFetch,
    getNetworkStatus,
    
    // PWA installation
    installPrompt,
    isInstalled,
    installApp,
    
    // Utility functions
    webNotificationService,
    webOfflineService
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};

// Hook for easy access to PWA features
export const useNotifications = () => {
  const { 
    notificationsEnabled, 
    requestNotificationPermission, 
    showNotification,
    showProductivityAlert,
    showGoalAchievement,
    showBreakReminder
  } = usePWA();
  
  return {
    enabled: notificationsEnabled,
    requestPermission: requestNotificationPermission,
    show: showNotification,
    showProductivityAlert,
    showGoalAchievement,
    showBreakReminder
  };
};

export const useOffline = () => {
  const { 
    isOnline, 
    syncStatus, 
    cacheData, 
    getCachedData, 
    addToSyncQueue, 
    syncData, 
    clearCache,
    enhancedFetch,
    getNetworkStatus
  } = usePWA();
  
  return {
    isOnline,
    syncStatus,
    cacheData,
    getCachedData,
    addToSyncQueue,
    syncData,
    clearCache,
    enhancedFetch,
    getNetworkStatus
  };
};

export const useInstall = () => {
  const { installPrompt, isInstalled, installApp } = usePWA();
  
  return {
    canInstall: !!installPrompt,
    isInstalled,
    install: installApp
  };
};

export default PWAProvider;