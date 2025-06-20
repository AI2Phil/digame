// Mock implementation for AdvancedMobileService
import { Audio } from 'expo-av';

const API_BASE_URL = 'http://localhost:8000/mobile-ai'; // Using localhost for subtask environment

let recording = null;

const AdvancedMobileService = {
  initialize: () => {
    console.log("AdvancedMobileService initialized");
    return Promise.resolve();
  },

  setupBackgroundFetch: () => {
    console.log("Background fetch setup (mock)");
    return Promise.resolve();
  },

  setupAiNotifications: () => {
    console.log("AI notifications setup (mock)");
    return Promise.resolve();
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

  generateAdvancedAnalytics: () => {
    console.log("Generating advanced analytics (mock)");
    return Promise.resolve({ mockData: true, timestamp: new Date().toISOString() });
  },

  processAiNotifications: async () => {
    console.log('Attempting to process AI notifications via backend.');
    const requestData = {
      user_id: 'mock_user_123', // Replace with actual user ID retrieval logic if available
      current_context: {
        app_state: 'active',
        current_screen: 'AdvancedMobileFeatures', // Example
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/personalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if your endpoint is protected
          // 'Authorization': `Bearer ${your_auth_token}`,
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
      // Expected response: { status: "...", personalized_schedule: {...}, message: "..." }
      return data;
    } catch (error) {
      console.error('Error during AI notification personalization API call:', error);
      throw error; // Re-throw to be caught by the caller
    }
  },

  transcribeAudio: async (audioUri) => {
    console.log('Attempting to send audio for transcription to backend:', audioUri);
    if (!audioUri) {
      console.error('Audio URI is null or undefined');
      return Promise.reject({ error: 'audio_uri_missing' });
    }

    const formData = new FormData();
    formData.append('audio_file', {
      uri: audioUri,
      name: `recording-${Date.now()}.m4a`, // Or determine actual format if possible, .m4a is common for expo-av
      type: 'audio/m4a', // Adjust MIME type if necessary
    });

    try {
      const response = await fetch(`${API_BASE_URL}/voice/transcribe`, {
        method: 'POST',
        body: formData,
        headers: {
          // 'Content-Type': 'multipart/form-data' is usually set automatically by fetch with FormData
          // Add Authorization header if your endpoint is protected
          // 'Authorization': `Bearer ${your_auth_token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Transcription API error:', response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('Backend transcription received:', data);
      return data; // Should be like { transcription: "...", engine: "..." }
    } catch (error) {
      console.error('Error during transcription API call:', error);
      throw error; // Re-throw to be caught by the caller
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
          // Add Authorization header if your endpoint is protected
          // 'Authorization': `Bearer ${your_auth_token}`,
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
      return data; // Should be like { intent: "...", confidence: 0.9, ... }
    } catch (error) {
      console.error('Error during intent API call:', error);
      throw error; // Re-throw
    }
  },
};

export default AdvancedMobileService;
