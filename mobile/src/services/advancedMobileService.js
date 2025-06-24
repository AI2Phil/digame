// Advanced Mobile Service - Comprehensive implementation combining both approaches
import { Audio } from 'expo-av';
import { ApiService } from './ApiService'; // Fallback to ApiService for some operations

const API_BASE_URL = 'http://localhost:8000/mobile-ai'; // Using localhost for subtask environment
const FAKE_TOKEN = 'FAKE_BEARER_TOKEN'; // Placeholder for actual auth token

let recording = null;

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

const AdvancedMobileService = {
  config: { // Default config, can be updated by initialize()
    backgroundFetchInterval: 15 * 60, // 15 minutes
    aiNotificationsEnabled: true,
  },

  initialize: () => {
    console.log("AdvancedMobileService initialized");
    return Promise.resolve({ status: 'initialized', config: AdvancedMobileService.config });
  },

  setupBackgroundFetch: () => {
    console.log("Background fetch setup");
    return Promise.resolve({ status: 'Background fetch setup attempted' });
  },

  setupAiNotifications: async (userBehaviorSummary = {}) => {
    console.log("AI notifications setup");
    try {
      const payload = {
        notification_enabled_types: ["task_updates", "daily_summary"],
        preferred_times: ["09:00", "17:00"],
        behavior_summary: userBehaviorSummary,
      };
      const response = await authenticatedFetch(`${API_BASE_URL}/mobile/ai/notifications/settings`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log('AI notification preferences stored:', response);
      return response;
    } catch (error) {
      console.error('Error in setupAiNotifications:', error);
      return Promise.resolve({ status: 'setup_attempted' });
    }
  },

  startVoiceRecognition: async () => {
    console.log("Attempting to start voice recognition");
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        recording = new Audio.Recording();
        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recording.startAsync();
        console.log("Voice recording started");
        return Promise.resolve({ status: 'recording_started' });
      } else {
        console.log("Audio recording permission denied");
        return Promise.reject({ error: 'permission_denied' });
      }
    } catch (error) {
      console.error("Failed to start voice recognition", error);
      return Promise.reject({ error: 'failed_to_start', details: error });
    }
  },

  stopVoiceRecognition: async () => {
    console.log("Attempting to stop voice recognition");
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log("Voice recording stopped. URI: " + uri);
        recording = null;
        if (!uri) {
          console.error("Recording URI is null after stopping.");
          return Promise.reject({ error: 'uri_null_after_stopping' });
        }
        return Promise.resolve({ status: 'recording_stopped', uri: uri });
      } catch (error) {
        console.error("Failed to stop voice recognition", error);
        recording = null;
        return Promise.reject({ error: 'failed_to_stop', details: error });
      }
    } else {
      console.log("No active recording to stop");
      return Promise.resolve({ status: 'not_recording' });
    }
  },

  // Legacy method for backward compatibility
  async processVoiceCommand(transcribedText, language = "en-US") {
    console.log(`Processing voice command via backend: ${transcribedText}`);
    try {
      const payload = { text: transcribedText, language: language };
      const nluResponse = await ApiService.interpretVoice(payload);
      console.log("Backend NLU response:", nluResponse);
      return nluResponse;
    } catch (error) {
      console.error('Error interpreting voice command via backend:', error);
      // Return a default error-like response structure
      return {
        intent: 'interpretation_failed',
        parameters: { original_text: transcribedText },
        responseText: "Sorry, I couldn't process that command right now."
      };
    }
  },

  generateAdvancedAnalytics: async (usageData = {}) => {
    console.log("Generating advanced analytics");
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/mobile/analytics`, {
        method: 'POST',
        body: JSON.stringify(usageData),
      });
      console.log('Advanced analytics data/response from backend:', response);
      return response || {
        insights: { productivityScore: 88, engagementLevel: 90 },
        sessionData: { duration: 1200000, screenViews: { home: 10, profile: 5 } },
        mockData: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in generateAdvancedAnalytics:', error);
      return {
        insights: { productivityScore: 70, engagementLevel: 65, focusTime: '2.0h', error: 'Could not fetch live analytics' },
        sessionData: { averageDuration: 0, commonActions: [] },
        personalizedTips: ['Could not fetch tips. Check your connection.']
      };
    }
  },

  processAiNotifications: async () => {
    console.log('Processing AI notifications via backend.');
    const requestData = {
      user_id: 'mock_user_123',
      current_context: {
        app_state: 'active',
        current_screen: 'AdvancedMobileFeatures',
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/personalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Notification Personalization API error:', response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Backend AI notification personalization response:', data);
      return data;
    } catch (error) {
      console.error('Error during AI notification personalization API call:', error);
      throw error;
    }
  },

  transcribeAudio: async (audioUri) => {
    console.log('Sending audio for transcription to backend:', audioUri);
    if (!audioUri) {
      console.error('Audio URI is null or undefined');
      return Promise.reject({ error: 'audio_uri_missing' });
    }

    const formData = new FormData();
    formData.append('audio_file', {
      uri: audioUri,
      name: `recording-${Date.now()}.m4a`,
      type: 'audio/m4a',
    });

    try {
      const response = await fetch(`${API_BASE_URL}/voice/transcribe`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Transcription API error:', response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('Backend transcription received:', data);
      return data;
    } catch (error) {
      console.error('Error during transcription API call:', error);
      throw error;
    }
  },

  handleIntent: async (transcription) => {
    console.log('Sending transcription to backend for intent recognition:', transcription);
    if (typeof transcription !== 'string' || !transcription.trim()) {
        console.error('Invalid transcription text provided for intent recognition.');
        return Promise.reject({ error: 'invalid_transcription_for_intent' });
    }
    try {
      const response = await fetch(`${API_BASE_URL}/voice/intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcription }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Intent API error:', response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('Backend intent received:', data);
      return data;
    } catch (error) {
      console.error('Error during intent API call:', error);
      throw error;
    }
  },

  logUserActivity: async (activityData) => {
    console.log('Logging user activity to backend:', activityData);
    if (!activityData || typeof activityData !== 'object' || Object.keys(activityData).length === 0) {
      console.warn('logUserActivity called with invalid or empty data');
      return Promise.resolve({ status: 'no_data_logged' });
    }
    try {
      // Assuming a new endpoint for logging user activity for notification optimization
      // The actual endpoint might be different based on backend implementation.
      const response = await authenticatedFetch(`${API_BASE_URL}/user-activity/log`, {
        method: 'POST',
        body: JSON.stringify(activityData),
      });
      console.log('User activity logged successfully:', response);
      return response;
    } catch (error) {
      console.error('Error logging user activity:', error);
      // It's important not to let activity logging errors break critical app flows.
      // So, we catch the error and resolve, rather than rejecting.
      return Promise.resolve({ status: 'logging_failed', error: error.message });
    }
  },

  getPersonalizedNotificationSchedule: async () => {
    console.log('Fetching personalized notification schedule from backend.');
    try {
      const schedule = await authenticatedFetch(`${API_BASE_URL}/notifications/schedule`);
      console.log('Personalized notification schedule received:', schedule);
      // Expected schedule format: { optimal_times: ["HH:MM", "HH:MM"], preferences: {...} }
      // or { dynamic_triggers: [{type: "...", conditions: {...}}], ... }
      return schedule;
    } catch (error) {
      console.error('Error fetching personalized notification schedule:', error);
      // Fallback to a default schedule or empty if critical
      return { optimal_times: [], preferences: {}, error: error.message };
    }
  },

  getInsightsDashboardData: async () => {
    console.log('Fetching insights dashboard data from backend.');
    try {
      // Assume this endpoint returns a comprehensive object with personalized recommendations,
      // predictive analytics, AI-generated suggestions, and any current contextual insights.
      const dashboardData = await authenticatedFetch(`${API_BASE_URL}/insights/dashboard`);
      console.log('Insights dashboard data received:', dashboardData);
      // Example expected structure:
      // {
      //   personalizedRecommendations: [ {id: "rec1", title: "...", description: "...", type: "productivity"} ],
      //   predictiveAnalytics: { productivityScoreForecast: 85, focusTimeNextWeek: "10h" },
      //   aiSuggestions: [ {id: "sug1", text: "Consider breaking down large tasks.", relatedGoalId: "goalX"} ],
      //   contextualInsights: [ {id: "ctx1", message: "You often complete tasks like this in the morning."} ]
      // }
      return dashboardData;
    } catch (error) {
      console.error('Error fetching insights dashboard data:', error);
      // Return a structured error or a default/empty state
      return {
        error: error.message,
        personalizedRecommendations: [],
        predictiveAnalytics: {},
        aiSuggestions: [],
        contextualInsights: []
      };
    }
  },
};

export default AdvancedMobileService;
