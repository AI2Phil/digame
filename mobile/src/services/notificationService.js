import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  async initialize() {
    try {
      // Register for push notifications
      this.expoPushToken = await this.registerForPushNotificationsAsync();
      
      // Listen for incoming notifications
      this.notificationListener = Notifications.addNotificationReceivedListener(
        this.handleNotificationReceived
      );

      // Listen for notification responses (when user taps notification)
      this.responseListener = Notifications.addNotificationResponseReceivedListener(
        this.handleNotificationResponse
      );

      return this.expoPushToken;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return null;
    }
  }

  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return null;
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  handleNotificationReceived = (notification) => {
    console.log('Notification received:', notification);
    // Handle notification when app is in foreground
    // You can update app state, show custom UI, etc.
  };

  handleNotificationResponse = (response) => {
    console.log('Notification response:', response);
    // Handle notification tap
    // Navigate to specific screen based on notification data
    const data = response.notification.request.content.data;
    if (data?.screen) {
      // Navigate to specific screen
      // This would be handled by your navigation service
    }
  };

  async scheduleLocalNotification(title, body, data = {}, trigger = null) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: trigger || { seconds: 1 },
      });
      return id;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  // Send push token to backend
  async registerTokenWithBackend(token, userId) {
    try {
      // This would send the token to your backend
      const response = await fetch(`${API_BASE_URL}/notifications/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({
          token,
          userId,
          platform: Platform.OS,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to register token with backend');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to register token with backend:', error);
      throw error;
    }
  }

  // Schedule productivity reminders
  async scheduleProductivityReminders() {
    // Morning motivation
    await this.scheduleLocalNotification(
      'Good Morning! 🌅',
      'Ready to boost your productivity today?',
      { type: 'morning_motivation' },
      {
        hour: 9,
        minute: 0,
        repeats: true,
      }
    );

    // Afternoon check-in
    await this.scheduleLocalNotification(
      'Afternoon Check-in 📊',
      'How\'s your productivity going? Check your dashboard!',
      { type: 'afternoon_checkin', screen: 'Dashboard' },
      {
        hour: 14,
        minute: 0,
        repeats: true,
      }
    );

    // End of day review
    await this.scheduleLocalNotification(
      'Daily Review 🎯',
      'Time to review your achievements and plan tomorrow!',
      { type: 'daily_review', screen: 'Analytics' },
      {
        hour: 18,
        minute: 0,
        repeats: true,
      }
    );
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Helper function to get auth token (implement based on your auth system)
async function getAuthToken() {
  // This should get the token from your auth service
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return await AsyncStorage.getItem('authToken');
}

// API base URL (should be configured based on environment)
const API_BASE_URL = 'http://localhost:8000'; // Update this for production
// Import AdvancedMobileService to fetch personalized schedules
// Note: This might create a circular dependency if AdvancedMobileService imports NotificationService.
// If that's the case, dependency injection or a mediating service might be needed.
// For now, assuming direct import is fine or will be refactored if issues arise.
import AdvancedMobileService from './advancedMobileService';


class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isAdaptiveScheduleApplied = false; // Track if adaptive schedule is active
  }

  async initialize() {
    try {
      // Register for push notifications
      this.expoPushToken = await this.registerForPushNotificationsAsync();

      // Listen for incoming notifications
      this.notificationListener = Notifications.addNotificationReceivedListener(
        this.handleNotificationReceived
      );

      // Listen for notification responses (when user taps notification)
      this.responseListener = Notifications.addNotificationResponseReceivedListener(
        this.handleNotificationResponse
      );

      // Attempt to apply adaptive schedule on initialization
      // This could also be triggered by a user setting or after login.
      this.applyAdaptiveSchedule().catch(err => {
        console.warn("Failed to apply adaptive schedule on init, will use defaults:", err);
        // Fallback to default reminders if adaptive fails initially
        if (!this.isAdaptiveScheduleApplied) {
          this.scheduleProductivityReminders();
        }
      });

      return this.expoPushToken;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      // Fallback to default reminders if init fails critically before adaptive scheduling
      if (!this.isAdaptiveScheduleApplied) {
        this.scheduleProductivityReminders();
      }
      return null;
    }
  }

  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        // Changed from alert to console.warn for less intrusive failure
        console.warn('Permission for notifications not granted.');
        return null;
      }

      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
    } else {
      // Changed from alert to console.info
      console.info('Push Notifications require a physical device.');
    }

    return token;
  }

  handleNotificationReceived = (notification) => {
    console.log('Notification received:', notification);
    const activityData = {
      type: 'notification_received',
      notificationId: notification.request.identifier,
      contentTitle: notification.request.content.title,
      contentBody: notification.request.content.body,
      triggerType: notification.request.trigger?.type, // e.g., 'calendar', 'timeInterval', 'daily', 'weekly', 'monthly'
      timestamp: new Date().toISOString(),
      notificationData: notification.request.content.data, // Custom data sent with notification
    };
    if (AdvancedMobileService && typeof AdvancedMobileService.logUserActivity === 'function') {
      AdvancedMobileService.logUserActivity(activityData)
        .catch(err => console.warn("Failed to log notification_received activity:", err));
    } else {
      console.warn("AdvancedMobileService.logUserActivity not available for notification_received.");
    }
  };

  handleNotificationResponse = (response) => {
    console.log('Notification response (tapped):', response);
    const notification = response.notification;
    const activityData = {
      type: 'notification_tapped',
      actionIdentifier: response.actionIdentifier, // e.g., Notifications.DEFAULT_ACTION_IDENTIFIER or custom actions
      notificationId: notification.request.identifier,
      contentTitle: notification.request.content.title,
      contentBody: notification.request.content.body,
      triggerType: notification.request.trigger?.type,
      timestamp: new Date().toISOString(),
      notificationData: notification.request.content.data,
      userText: response.userText, // If the notification had a text input action
    };

    if (AdvancedMobileService && typeof AdvancedMobileService.logUserActivity === 'function') {
      AdvancedMobileService.logUserActivity(activityData)
        .catch(err => console.warn("Failed to log notification_tapped activity:", err));
    } else {
      console.warn("AdvancedMobileService.logUserActivity not available for notification_tapped.");
    }

    const data = notification.request.content.data;
    if (data?.screen) {
      // Navigation logic should be handled by a dedicated navigation service passed in or via events.
      console.log(`Navigation requested to screen: ${data.screen}`);
      // Example: navigationService.navigate(data.screen, data.params);
    }
  };

  async scheduleLocalNotification(title, body, data = {}, trigger = null, notificationId = undefined) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        identifier: notificationId, // Allow specifying an ID for updates/cancellation
        content: {
          title,
          body,
          data, // Ensure data is passed here for tracking and interaction
          sound: 'default', // Consider making sound configurable
        },
        trigger: trigger || { seconds: 1 }, // Default to immediate if no trigger
      });
      console.log(`Notification scheduled: ${id} - ${title}`);
      return id;
    } catch (error) {
      console.error('Failed to schedule notification:', error, { title, body, trigger });
      return null;
    }
  }

  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Notification cancelled: ${notificationId}`);
    } catch (error) {
      console.error('Failed to cancel notification:', error, { notificationId });
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All scheduled notifications cancelled.');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  // Send push token to backend
  async registerTokenWithBackend(token, userId) {
    // This check is important because AdvancedMobileService might not be fully initialized
    // or available in all contexts where NotificationService is used.
    if (!AdvancedMobileService || !AdvancedMobileService.config) {
        console.warn("AdvancedMobileService not available for registerTokenWithBackend");
        // Decide if this is a critical failure or can be retried.
        // Potentially use a getter for FAKE_TOKEN if it's managed by AuthService.
        return;
    }
    const authToken = await getAuthToken(); // Assuming getAuthToken is reliable
    if (!authToken) {
        console.warn("No auth token available for registerTokenWithBackend");
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/register`, { // Ensure API_BASE_URL is correct for this context
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          token,
          userId, // Ensure userId is correctly obtained
          platform: Platform.OS,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to register token with backend: ${response.status} ${errorBody}`);
      }

      console.log('Push token registered with backend.');
      return await response.json();
    } catch (error) {
      console.error('Failed to register token with backend:', error);
      // Do not re-throw, allow app to function without push token registration if backend is down.
    }
  }

  // Default static reminders
  async scheduleProductivityReminders() {
    if (this.isAdaptiveScheduleApplied) {
      console.log("Adaptive schedule is active, skipping default productivity reminders.");
      return;
    }
    console.log("Scheduling default productivity reminders.");
    // Morning motivation
    await this.scheduleLocalNotification(
      'Good Morning! 🌅',
      'Ready to boost your productivity today?',
      { type: 'default_morning_motivation', adaptive: false },
      { hour: 9, minute: 0, repeats: true, },
      'default_morning'
    );

    // Afternoon check-in
    await this.scheduleLocalNotification(
      'Afternoon Check-in 📊',
      'How\'s your productivity going? Check your dashboard!',
      { type: 'default_afternoon_checkin', screen: 'Dashboard', adaptive: false },
      { hour: 14, minute: 0, repeats: true, },
      'default_afternoon'
    );

    // End of day review
    await this.scheduleLocalNotification(
      'Daily Review 🎯',
      'Time to review your achievements and plan tomorrow!',
      { type: 'default_daily_review', screen: 'Analytics', adaptive: false },
      { hour: 18, minute: 0, repeats: true, },
      'default_evening'
    );
  }

  async applyAdaptiveSchedule() {
    console.log("Attempting to apply adaptive notification schedule...");
    if (!AdvancedMobileService || typeof AdvancedMobileService.getPersonalizedNotificationSchedule !== 'function') {
      console.warn("AdvancedMobileService or getPersonalizedNotificationSchedule not available. Using default reminders.");
      await this.scheduleProductivityReminders(); // Fallback to default
      return;
    }

    try {
      const scheduleData = await AdvancedMobileService.getPersonalizedNotificationSchedule();

      if (scheduleData && scheduleData.optimal_times && scheduleData.optimal_times.length > 0) {
        await this.cancelAllNotifications(); // Clear any existing (e.g., default) notifications

        console.log("Applying personalized notification schedule:", scheduleData.optimal_times);

        for (const timeStr of scheduleData.optimal_times) {
          const [hour, minute] = timeStr.split(':').map(Number);
          if (isNaN(hour) || isNaN(minute)) {
            console.warn(`Invalid time format in schedule: ${timeStr}`);
            continue;
          }

          // Customize notification content based on time or backend data
          let title = "Personalized Reminder ✨";
          let body = "This is a good time for you to check in!";
          let data = { type: 'adaptive_reminder', time: timeStr, adaptive: true };

          // Example: Customize content based on time of day
          if (hour < 12) {
            title = "Your Smart Morning Nudge ☀️";
            body = "Looks like a great time to plan your day or tackle a key task!";
            data.screen = "Dashboard"; // Suggest a relevant screen
          } else if (hour < 17) {
            title = "Adaptive Afternoon Prompt 💡";
            body = "Consider reviewing your progress or taking a short break.";
            data.screen = "Analytics";
          } else {
            title = "Evening Insight Reminder 🌙";
            body = "A good moment to reflect on your day and prepare for tomorrow.";
            data.screen = "Goals"; // Or a 'Review' screen if it exists
          }

          // Add a unique identifier for each adaptive notification for potential tracking/modification
          const notificationId = `adaptive_${hour}_${minute}`;

          await this.scheduleLocalNotification(
            title,
            body,
            data,
            { hour, minute, repeats: true }, // Assuming daily repeats at these optimal times
            notificationId
          );
        }
        this.isAdaptiveScheduleApplied = true;
        console.log("Adaptive notification schedule applied successfully.");
      } else if (scheduleData && scheduleData.error) {
        console.warn("Failed to fetch personalized schedule, using default reminders. Error:", scheduleData.error);
        await this.scheduleProductivityReminders(); // Fallback to default
      }
       else {
        console.log("No personalized notification times returned or empty schedule. Using default reminders.");
        await this.scheduleProductivityReminders(); // Fallback to default
      }
    } catch (error) {
      console.error("Error applying adaptive schedule:", error);
      // Fallback to default reminders in case of any error during adaptive scheduling
      if (!this.isAdaptiveScheduleApplied) {
         await this.scheduleProductivityReminders();
      }
    }
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    console.log("Notification listeners cleaned up.");
  }
}

// Helper function to get auth token (implement based on your auth system)
async function getAuthToken() {
  // This should get the token from your auth service
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  // Ensure a consistent key is used for storing and retrieving the token.
  // This key should match what's used in your AuthService.
  return await AsyncStorage.getItem('userToken'); // Example key 'userToken'
}


export default new NotificationService();