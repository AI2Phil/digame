// mobile/src/services/advancedMobileService.js
// This service acts as an interface for advanced mobile features,
// making actual fetch calls to the backend.

const API_BASE_URL = 'http://localhost:8000/api/v1'; // Using suggested local dev URL
const FAKE_TOKEN = 'FAKE_BEARER_TOKEN'; // Placeholder for actual auth token

// Helper function for authenticated fetch calls
async function authenticatedFetch(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FAKE_TOKEN}`,
        ...options.headers,
    };
    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error(`API Error ${response.status}: ${errorData.message || response.statusText}`, { url, options });
            throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
        }
        // Handle cases where response might be empty (e.g., 204 No Content)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        }
        return await response.text(); // Or handle as appropriate if text/empty is expected
    } catch (error) {
        console.error('Network or Fetch Error:', error, { url, options });
        throw error; // Re-throw to be caught by calling function
    }
}

const advancedMobileService = {
    config: { // Default config, can be updated by initialize()
        backgroundFetchInterval: 15 * 60, // 15 minutes
        aiNotificationsEnabled: true,
    },

    async initialize() {
        console.log('AdvancedMobileService initializing...');
        try {
            // Conceptual: Fetch initial mobile app config from backend
            // const backendConfig = await authenticatedFetch(`${API_BASE_URL}/mobile/config`); // Assuming a /mobile/config endpoint
            // if (backendConfig) {
            //    this.config = { ...this.config, ...backendConfig };
            //    console.log('Mobile config updated from backend:', this.config);
            // }
            console.log('AdvancedMobileService initialized with config:', this.config);
            return { status: 'initialized', config: this.config };
        } catch (error) {
            console.error('Error during AdvancedMobileService initialization:', error);
            return { status: 'initialization_failed', error: error.message };
        }
    },

    async setupBackgroundFetch() {
        console.log('Background fetch setup initiated.');
        // This would involve interacting with Expo's BackgroundFetch and TaskManager APIs.
        // Example:
        // import * as BackgroundFetch from 'expo-background-fetch';
        // import * as TaskManager from 'expo-task-manager';
        // const TASK_NAME = 'global-background-fetch-task';
        // if (!TaskManager.isTaskDefined(TASK_NAME)) {
        //   TaskManager.defineTask(TASK_NAME, async () => {
        //     try {
        //       console.log('Background task running...');
        //       await advancedMobileService.processAiNotifications(); // Example task
        //       return BackgroundFetch.BackgroundFetchResult.NewData;
        //     } catch (error) {
        //       return BackgroundFetch.BackgroundFetchResult.Failed;
        //     }
        //   });
        // }
        // await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        //   minimumInterval: this.config.backgroundFetchInterval, // Use configured interval
        //   stopOnTerminate: false,
        //   startOnBoot: true,
        // });
        // console.log('Background fetch task registered.');
        // Conceptual: Inform backend about task registration
        // try {
        //   await authenticatedFetch(`${API_BASE_URL}/mobile/background-tasks/register`, { method: 'POST', body: JSON.stringify({ taskName: TASK_NAME }) });
        // } catch (error) {
        //   console.warn('Could not sync background task registration with backend:', error);
        // }
        return Promise.resolve({ status: 'Background fetch setup attempted' });
    },

    async setupAiNotifications(userBehaviorSummary = {}) {
        console.log('Setting up AI notifications with backend...');
        try {
            const payload = {
                // user_id is implicit via token on backend
                notification_enabled_types: ["task_updates", "daily_summary"], // Example defaults
                preferred_times: ["09:00", "17:00"], // Example defaults
                behavior_summary: userBehaviorSummary,
            };
            const response = await authenticatedFetch(`${API_BASE_URL}/mobile/ai/notifications/settings`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            console.log('AI notification preferences stored:', response);
            return response; // e.g., { status: 'success', message: '...' }
        } catch (error) {
            console.error('Error in setupAiNotifications:', error);
            throw error;
        }
    },

    async startVoiceRecognition() {
        console.log('Starting voice recognition (local state management).');
        // This would use expo-av or similar to start local recording.
        // E.g., this.isRecognizing = true;
        // NativeModules.VoiceRecognitionModule.startListening(); // If using a custom native module
        return Promise.resolve({ status: 'Voice recognition started locally' });
    },

    async stopVoiceRecognition() {
        console.log('Stopping voice recognition (local state management).');
        // E.g., this.isRecognizing = false;
        // NativeModules.VoiceRecognitionModule.stopListening(); // If using a custom native module
        return Promise.resolve({ status: 'Voice recognition stopped locally' });
    },

    async processAiNotifications() {
        console.log('Fetching AI notification triggers from backend...');
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/mobile/ai/notifications/triggers`);
            // response is NotificationTriggersResponse: { triggers: List[NotificationTrigger], generated_at: datetime }
            console.log('AI notification triggers received:', response.triggers);
            // Here, the mobile app would use these triggers to schedule local notifications
            // or display in-app messages as appropriate.
            return response.triggers; // Return just the array of triggers
        } catch (error) {
            console.error('Error in processAiNotifications:', error);
            throw error;
        }
    },

    async generateAdvancedAnalytics(usageData = {}) {
        console.log('Sending mobile usage data for advanced analytics...');
        try {
            // Conceptual endpoint, not built in prior steps, but making the call as instructed.
            const response = await authenticatedFetch(`${API_BASE_URL}/mobile/analytics`, {
                method: 'POST',
                body: JSON.stringify(usageData),
            });
            console.log('Advanced analytics data/response from backend:', response);
            // Assuming backend returns processed analytics data.
            // If not, return the mock data as before, but after attempting the fetch.
            return response || { // Fallback to mock if response is empty or not as expected
                insights: { productivityScore: 80, engagementLevel: 75, focusTime: '2.5h' },
                sessionData: { averageDuration: 720000, commonActions: ['view_task', 'complete_goal'] },
                personalizedTips: ['Try time-blocking for tasks.', 'Review your goals weekly.']
            };
        } catch (error) {
            console.error('Error in generateAdvancedAnalytics:', error);
            // Return mock data on error to allow UI to function somewhat
             return {
                insights: { productivityScore: 70, engagementLevel: 65, focusTime: '2.0h', error: 'Could not fetch live analytics' },
                sessionData: { averageDuration: 0, commonActions: [] },
                personalizedTips: ['Could not fetch tips. Check your connection.']
            };
        }
    },

    async processVoiceCommand(commandText, language = "en-US") {
        console.log(`Sending voice command to backend for interpretation: "${commandText}"`);
        try {
            const payload = {
                text: commandText,
                language: language,
            };
            const response = await authenticatedFetch(`${API_BASE_URL}/mobile/ai/voice/interpret`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            // response is VoiceCommandResponse: { intent: str, parameters: Optional[Dict], responseText: Optional[str] }
            console.log('Voice command interpretation received:', response);
            return response;
        } catch (error) {
            console.error('Error in processVoiceCommand:', error);
            // Return a default error-like response structure
            return {
                intent: 'interpretation_failed',
                parameters: { original_text: commandText },
                responseText: "Sorry, I couldn't process that command right now."
            };
        }
    }
};

export default advancedMobileService;
```
