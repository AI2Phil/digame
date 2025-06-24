import { Platform, AppState, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';
const BACKGROUND_SYNC_TASK = 'background-sync-task';

class AdvancedMobileFeaturesService {
  constructor() {
    this.isInitialized = false;
    this.biometricSupported = false;
    this.biometricTypes = [];
    this.notificationToken = null;
    this.backgroundTasksRegistered = false;
    this.appStateSubscription = null;
    this.batterySubscription = null;
    this.networkSubscription = null;
    this.deviceInfo = {};
    this.securitySettings = {
      biometricEnabled: false,
      autoLockTimeout: 300000, // 5 minutes
      requireBiometricForSensitiveActions: true,
    };
    this.backgroundSyncQueue = [];
    this.notificationCategories = new Map();
  }

  async initialize() {
    try {
      // Initialize device information
      await this.initializeDeviceInfo();
      
      // Initialize biometric authentication
      await this.initializeBiometrics();
      
      // Initialize push notifications
      await this.initializePushNotifications();
      
      // Initialize background tasks
      await this.initializeBackgroundTasks();
      
      // Set up app state monitoring
      this.setupAppStateMonitoring();
      
      // Set up device monitoring
      await this.setupDeviceMonitoring();
      
      // Load security settings
      await this.loadSecuritySettings();
      
      this.isInitialized = true;
      console.log('Advanced Mobile Features Service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize advanced mobile features:', error);
      return false;
    }
  }

  async initializeDeviceInfo() {
    try {
      this.deviceInfo = {
        brand: Device.brand,
        manufacturer: Device.manufacturer,
        modelName: Device.modelName,
        modelId: Device.modelId,
        designName: Device.designName,
        productName: Device.productName,
        deviceYearClass: Device.deviceYearClass,
        totalMemory: Device.totalMemory,
        supportedCpuArchitectures: Device.supportedCpuArchitectures,
        osName: Device.osName,
        osVersion: Device.osVersion,
        osBuildId: Device.osBuildId,
        osInternalBuildId: Device.osInternalBuildId,
        platformApiLevel: Device.platformApiLevel,
        deviceType: Device.deviceType,
      };
      
      console.log('Device info initialized:', this.deviceInfo);
    } catch (error) {
      console.error('Failed to initialize device info:', error);
    }
  }

  async initializeBiometrics() {
    try {
      // Check if biometric authentication is available
      this.biometricSupported = await LocalAuthentication.hasHardwareAsync();
      
      if (this.biometricSupported) {
        // Check if biometric records are enrolled
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        if (isEnrolled) {
          // Get available biometric types
          this.biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
          console.log('Biometric types available:', this.biometricTypes);
        } else {
          console.log('No biometric records enrolled');
        }
      } else {
        console.log('Biometric authentication not supported');
      }
    } catch (error) {
      console.error('Failed to initialize biometrics:', error);
    }
  }

  async initializePushNotifications() {
    try {
      // Configure notification handling
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permission not granted');
        return;
      }

      // Get push notification token
      this.notificationToken = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push notification token:', this.notificationToken);

      // Set up notification categories
      await this.setupNotificationCategories();

    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  async setupNotificationCategories() {
    const categories = [
      {
        identifier: 'message',
        actions: [
          {
            identifier: 'reply',
            buttonTitle: 'Reply',
            textInput: { submitButtonTitle: 'Send', placeholder: 'Type a message...' },
          },
          {
            identifier: 'mark_read',
            buttonTitle: 'Mark as Read',
          },
        ],
      },
      {
        identifier: 'reminder',
        actions: [
          {
            identifier: 'complete',
            buttonTitle: 'Complete',
          },
          {
            identifier: 'snooze',
            buttonTitle: 'Snooze',
          },
        ],
      },
      {
        identifier: 'sync_complete',
        actions: [
          {
            identifier: 'view',
            buttonTitle: 'View',
          },
        ],
      },
    ];

    for (const category of categories) {
      await Notifications.setNotificationCategoryAsync(
        category.identifier,
        category.actions
      );
      this.notificationCategories.set(category.identifier, category);
    }
  }

  async initializeBackgroundTasks() {
    try {
      // Define background fetch task
      TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
        try {
          console.log('Background fetch task executed');
          
          // Perform background data sync
          await this.performBackgroundSync();
          
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error) {
          console.error('Background fetch task failed:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      // Define background sync task
      TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
        try {
          console.log('Background sync task executed');
          
          // Process sync queue
          await this.processBackgroundSyncQueue();
          
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error) {
          console.error('Background sync task failed:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      // Register background fetch
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });

      this.backgroundTasksRegistered = true;
      console.log('Background tasks registered');
    } catch (error) {
      console.error('Failed to initialize background tasks:', error);
    }
  }

  setupAppStateMonitoring() {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('App state changed to:', nextAppState);
      
      if (nextAppState === 'background') {
        this.handleAppBackground();
      } else if (nextAppState === 'active') {
        this.handleAppForeground();
      }
    });
  }

  async setupDeviceMonitoring() {
    try {
      // Monitor battery level
      this.batterySubscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
        console.log('Battery level:', batteryLevel);
        
        if (batteryLevel < 0.2) {
          this.handleLowBattery();
        }
      });

      // Monitor network state
      this.networkSubscription = Network.addNetworkStateListener((networkState) => {
        console.log('Network state:', networkState);
        
        if (networkState.isConnected && this.backgroundSyncQueue.length > 0) {
          this.processBackgroundSyncQueue();
        }
      });
    } catch (error) {
      console.error('Failed to setup device monitoring:', error);
    }
  }

  // Biometric Authentication
  async authenticateWithBiometrics(options = {}) {
    const {
      promptMessage = 'Authenticate to continue',
      cancelLabel = 'Cancel',
      fallbackLabel = 'Use Passcode',
      disableDeviceFallback = false,
    } = options;

    if (!this.biometricSupported) {
      throw new Error('Biometric authentication not supported');
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel,
        fallbackLabel,
        disableDeviceFallback,
      });

      if (result.success) {
        console.log('Biometric authentication successful');
        return { success: true, biometricType: result.biometricType };
      } else {
        console.log('Biometric authentication failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { success: false, error: error.message };
    }
  }

  async isBiometricAuthenticationRequired(action = 'default') {
    if (!this.securitySettings.biometricEnabled) return false;
    
    const sensitiveActions = ['payment', 'settings', 'data_export', 'account_deletion'];
    
    if (this.securitySettings.requireBiometricForSensitiveActions && 
        sensitiveActions.includes(action)) {
      return true;
    }
    
    // Check if auto-lock timeout has passed
    const lastActiveTime = await AsyncStorage.getItem('last_active_time');
    if (lastActiveTime) {
      const timeSinceLastActive = Date.now() - parseInt(lastActiveTime);
      return timeSinceLastActive > this.securitySettings.autoLockTimeout;
    }
    
    return false;
  }

  // Push Notifications
  async scheduleLocalNotification(notification) {
    const {
      title,
      body,
      data = {},
      trigger = null,
      categoryIdentifier = null,
      sound = true,
      badge = null,
    } = notification;

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: sound ? 'default' : false,
          badge,
          categoryIdentifier,
        },
        trigger,
      });

      console.log('Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
      throw error;
    }
  }

  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log('Badge count set to:', count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  // Background Processing
  async performBackgroundSync() {
    try {
      console.log('Performing background sync...');
      
      // Check network connectivity
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        console.log('No network connection, skipping background sync');
        return;
      }

      // Check battery level
      const batteryLevel = await Battery.getBatteryLevelAsync();
      if (batteryLevel < 0.2) {
        console.log('Low battery, skipping background sync');
        return;
      }

      // Perform actual sync operations
      // This would typically involve syncing data with your backend
      await this.syncCriticalData();
      
      // Send completion notification
      await this.scheduleLocalNotification({
        title: 'Sync Complete',
        body: 'Your data has been synchronized',
        categoryIdentifier: 'sync_complete',
      });

    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  async syncCriticalData() {
    // Implement your critical data sync logic here
    console.log('Syncing critical data...');
    
    // Example: sync offline changes, download important updates, etc.
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate sync
  }

  addToBackgroundSyncQueue(item) {
    this.backgroundSyncQueue.push({
      ...item,
      timestamp: Date.now(),
      retryCount: 0,
    });
    
    console.log('Item added to background sync queue:', item);
  }

  async processBackgroundSyncQueue() {
    if (this.backgroundSyncQueue.length === 0) return;
    
    console.log(`Processing ${this.backgroundSyncQueue.length} items in sync queue`);
    
    const processedItems = [];
    
    for (const item of this.backgroundSyncQueue) {
      try {
        await this.processSyncItem(item);
        processedItems.push(item);
      } catch (error) {
        console.error('Failed to process sync item:', error);
        
        item.retryCount++;
        if (item.retryCount >= 3) {
          console.log('Max retries reached for sync item, removing from queue');
          processedItems.push(item);
        }
      }
    }
    
    // Remove processed items from queue
    this.backgroundSyncQueue = this.backgroundSyncQueue.filter(
      item => !processedItems.includes(item)
    );
  }

  async processSyncItem(item) {
    // Implement your sync item processing logic here
    console.log('Processing sync item:', item);
    
    // Example: upload data, sync changes, etc.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
  }

  // App State Handling
  async handleAppBackground() {
    console.log('App moved to background');
    
    // Save current timestamp for auto-lock
    await AsyncStorage.setItem('last_active_time', Date.now().toString());
    
    // Schedule background sync if needed
    if (this.backgroundSyncQueue.length > 0) {
      await this.scheduleBackgroundSync();
    }
  }

  async handleAppForeground() {
    console.log('App moved to foreground');
    
    // Check if biometric authentication is required
    const requiresAuth = await this.isBiometricAuthenticationRequired();
    if (requiresAuth) {
      return this.authenticateWithBiometrics({
        promptMessage: 'Authenticate to unlock the app',
      });
    }
    
    return { success: true };
  }

  async scheduleBackgroundSync() {
    try {
      await this.scheduleLocalNotification({
        title: 'Syncing Data',
        body: 'Your data is being synchronized in the background',
        trigger: { seconds: 5 },
      });
    } catch (error) {
      console.error('Failed to schedule background sync notification:', error);
    }
  }

  // Device Monitoring
  handleLowBattery() {
    console.log('Low battery detected, enabling power saving mode');
    
    // Implement power saving measures
    this.enablePowerSavingMode();
  }

  enablePowerSavingMode() {
    // Reduce background activity
    // Disable non-essential features
    // Reduce animation frequency
    console.log('Power saving mode enabled');
  }

  disablePowerSavingMode() {
    // Re-enable full functionality
    console.log('Power saving mode disabled');
  }

  // Secure Storage
  async storeSecureData(key, value) {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
      console.log('Secure data stored:', key);
    } catch (error) {
      console.error('Failed to store secure data:', error);
      throw error;
    }
  }

  async getSecureData(key) {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Failed to get secure data:', error);
      return null;
    }
  }

  async deleteSecureData(key) {
    try {
      await SecureStore.deleteItemAsync(key);
      console.log('Secure data deleted:', key);
    } catch (error) {
      console.error('Failed to delete secure data:', error);
    }
  }

  // Settings Management
  async loadSecuritySettings() {
    try {
      const settings = await AsyncStorage.getItem('security_settings');
      if (settings) {
        this.securitySettings = { ...this.securitySettings, ...JSON.parse(settings) };
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    }
  }

  async saveSecuritySettings() {
    try {
      await AsyncStorage.setItem('security_settings', JSON.stringify(this.securitySettings));
    } catch (error) {
      console.error('Failed to save security settings:', error);
    }
  }

  updateSecuritySettings(newSettings) {
    this.securitySettings = { ...this.securitySettings, ...newSettings };
    this.saveSecuritySettings();
  }

  // Utility Methods
  getDeviceInfo() {
    return { ...this.deviceInfo };
  }

  getSecuritySettings() {
    return { ...this.securitySettings };
  }

  isBiometricSupported() {
    return this.biometricSupported;
  }

  getBiometricTypes() {
    return [...this.biometricTypes];
  }

  getNotificationToken() {
    return this.notificationToken;
  }

  isBackgroundTasksSupported() {
    return this.backgroundTasksRegistered;
  }

  // Cleanup
  cleanup() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    
    if (this.batterySubscription) {
      this.batterySubscription.remove();
    }
    
    if (this.networkSubscription) {
      this.networkSubscription.remove();
    }
    
    // Unregister background tasks
    if (this.backgroundTasksRegistered) {
      BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    }
  }
}

export default new AdvancedMobileFeaturesService();