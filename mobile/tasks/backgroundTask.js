import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

// 1. Define the task name
export const MY_BACKGROUND_FETCH_TASK = 'my-app-background-fetch';

// 2. Define the task
// This must be at the top level of the module (not inside a React component or function).
TaskManager.defineTask(MY_BACKGROUND_FETCH_TASK, async () => {
  const now = new Date();
  console.log(`[${MY_BACKGROUND_FETCH_TASK}] task ran at: ${now.toISOString()}`);

  try {
    // --- Your background logic here ---
    // This is where you'd typically fetch new data, sync, etc.
    // For this basic implementation, we'll just log a message.
    // Example: Fetch mock data
    // const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    // const data = await response.json();
    // console.log(`[${MY_BACKGROUND_FETCH_TASK}] fetched data title:`, data.title); // Corrected to log a specific field

    console.log(`[${MY_BACKGROUND_FETCH_TASK}] Successfully completed background work (simulated).`);

    // Be sure to return the correct result type!
    // BackgroundFetch.BackgroundFetchResult.NewData - If new data was fetched
    // BackgroundFetch.BackgroundFetchResult.NoData - If no new data was available
    // BackgroundFetch.BackgroundFetchResult.Failed - If the task failed
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error(`[${MY_BACKGROUND_FETCH_TASK}] task failed:`, error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// 3. Helper function to register the task
export async function registerBackgroundFetchAsync() {
  console.log(`Attempting to register background task: ${MY_BACKGROUND_FETCH_TASK}`);
  try {
    await BackgroundFetch.registerTaskAsync(MY_BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes (iOS will treat this as advisory)
      stopOnTerminate: false,    // Android only: Continue task even if app is terminated
      startOnBoot: true,         // Android only: Start task when device boots
    });
    console.log(`Task ${MY_BACKGROUND_FETCH_TASK} registered successfully.`);
    return true;
  } catch (err) {
    console.error(`Failed to register task ${MY_BACKGROUND_FETCH_TASK}`, err);
    return false;
  }
}

// 4. Helper function to unregister the task
export async function unregisterBackgroundFetchAsync() {
  console.log(`Attempting to unregister background task: ${MY_BACKGROUND_FETCH_TASK}`);
  try {
    await BackgroundFetch.unregisterTaskAsync(MY_BACKGROUND_FETCH_TASK);
    console.log(`Task ${MY_BACKGROUND_FETCH_TASK} unregistered successfully.`);
    return true;
  } catch (err) {
    console.error(`Failed to unregister task ${MY_BACKGROUND_FETCH_TASK}`, err);
    return false;
  }
}

// 5. Helper function to check if task is registered
export async function isTaskRegisteredAsync() {
    return TaskManager.isTaskRegisteredAsync(MY_BACKGROUND_FETCH_TASK);
}
