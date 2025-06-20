import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications'; // Added import

const BACKGROUND_FETCH_TASK = 'background-fetch-notification-task';

// 1. Define the task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now();
  console.log(`[${new Date(now).toISOString()}] Got background fetch call for notifications`);

  const API_URL = 'http://localhost:8000/api'; // Standard API base URL
  const USER_ID = 1; // Hardcoded user_id for now as per subtask instructions

  try {
    // Optional: Configure the notification handler for how notifications are presented
    // This might be better placed in App.js for foreground notifications,
    // but setting it here ensures it's configured if the task runs while app is killed.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true, // Play sound for new notifications
        shouldSetBadge: true, // Update badge count
      }),
    });

    // Fetch new notifications
    // The endpoint is /api/notifications/new?user_id={USER_ID}
    // Limit can be adjusted if needed, e.g., limit=5 to avoid too many notifications at once
    const response = await fetch(`${API_URL}/notifications/new?user_id=${USER_ID}&limit=5`);

    if (!response.ok) {
      const responseText = await response.text(); // Get more details on error
      console.error(`[${new Date().toISOString()}] API request failed: ${response.status}. Body: ${responseText}`);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    const newNotifications = await response.json();

    if (newNotifications && newNotifications.length > 0) {
      console.log(`[${new Date().toISOString()}] Fetched ${newNotifications.length} new notifications.`);

      // Schedule a local notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Digame: New Notifications!",
          body: `You have ${newNotifications.length} new update(s). Open Digame to see them.`,
          data: { newNotifications }, // Pass notifications data to the app
        },
        trigger: null, // Send immediately
      });
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      console.log(`[${new Date().toISOString()}] No new notifications found.`);
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  } catch (error) {
    // Check if it's a network error or other type of error
    if (error instanceof TypeError && error.message === 'Network request failed') {
        console.error(`[${new Date().toISOString()}] Background fetch failed: Network request failed. API URL: ${API_URL}. Ensure the server is running and accessible.`);
    } else {
        console.error(`[${new Date().toISOString()}] Background fetch failed:`, error);
    }
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// 2. Register the task
async function registerBackgroundFetchAsync() {
  console.log('Registering background fetch task...');
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes (900 seconds)
      stopOnTerminate: false, // Android only: keep task running even if app is terminated
      startOnBoot: true,      // Android only: start task when device boots
    });
    console.log('Background fetch task registered successfully.');
  } catch (error) {
    console.error('Failed to register background fetch task:', error);
  }
}

// 3. Unregister (optional, for development/testing)
async function unregisterBackgroundFetchAsync() {
  console.log('Unregistering background fetch task...');
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('Background fetch task unregistered successfully.');
  } catch (error) {
    console.error('Failed to unregister background fetch task:', error);
  }
}

// Export functions for use in your app
export { registerBackgroundFetchAsync, unregisterBackgroundFetchAsync, BACKGROUND_FETCH_TASK };

// Reminder:
// - Call registerBackgroundFetchAsync() in your App.js or a relevant entry point.
// - Request notification permissions in App.js using Notifications.requestPermissionsAsync().
// - Ensure the API at http://localhost:8000 is accessible from the device/emulator,
//   potentially using a tunnel (like ngrok) or by deploying the backend.
