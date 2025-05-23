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

export default new NotificationService();