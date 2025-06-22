// Advanced Mobile Service - Comprehensive implementation combining both approaches
import { Audio } from 'expo-av';
import { ApiService } from './ApiService'; // Fallback to ApiService for some operations

const API_BASE_URL = 'http://localhost:8000/mobile-ai'; // Using localhost for subtask environment

let recording = null;

const AdvancedMobileService = {
  initialize: () => {
    console.log("AdvancedMobileService initialized");
    return Promise.resolve();
  },

  setupBackgroundFetch: () => {
    console.log("Background fetch setup");
    return Promise.resolve();
  },

  setupAiNotifications: () => {
    console.log("AI notifications setup");
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

  // Legacy method for backward compatibility
  async processVoiceCommand(transcribedText) {
    console.log(`Processing voice command via backend: ${transcribedText}`);
    try {
      const payload = { text: transcribedText, language: "en-US" };
      const nluResponse = await ApiService.interpretVoice(payload);
      console.log("Backend NLU response:", nluResponse);
      return nluResponse;
    } catch (error) {
      console.error('Error interpreting voice command via backend:', error);
      throw error;
    }
  },

  generateAdvancedAnalytics: () => {
    console.log("Generating advanced analytics");
    return Promise.resolve({
      insights: { productivityScore: 88, engagementLevel: 90 },
      sessionData: { duration: 1200000, screenViews: { home: 10, profile: 5 } },
      mockData: true,
      timestamp: new Date().toISOString()
    });
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
};

export default AdvancedMobileService;
