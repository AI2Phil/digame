import OfflineService from './offlineService'; // Assuming OfflineService is default export
// If OfflineService is a class you instantiate:
// import OfflineServiceInstance from './offlineService'; // const offlineService = OfflineServiceInstance;

// For direct access if OfflineService methods are static or it's a singleton
const offlineService = OfflineService; // If it's already an instance (singleton pattern)

class VoiceProcessingService {
  constructor() {
    // API endpoint for online NLU
    this.onlineNluEndpoint = 'http://localhost:8000/api/v1/mobile/ai/voice/interpret'; // Replace with actual/config
  }

  /**
   * Main function to process voice input.
   * It tries online processing first, then falls back to local STT/NLU if offline.
   * @param {string} audioFilePath - Path to the recorded audio file (simulated for localSTT).
   * @param {string} language - Language code (e.g., "en-US").
   * @returns {Promise<object|null>} - The NLU response object or null if all attempts fail.
   */
  async processVoiceInput(audioFilePath, language = "en-US") {
    const isOnline = offlineService.getNetworkStatus().isOnline; // Get current network status

    // --- STT Phase ---
    // In a real app, online path might use a dedicated online STT service.
    // For this simulation, we'll use the offlineService's localSTT for both paths,
    // differentiating behavior based on the 'isOnline' flag for NLU.
    const transcribedText = await offlineService.localSTT(audioFilePath, language);

    if (!transcribedText) {
      console.error("STT failed (simulated or local). Cannot proceed with NLU.");
      return {
        intent: "stt_failed",
        parameters: { audioFilePath, language },
        responseText: "Sorry, I couldn't understand your speech.",
        source: isOnline ? "simulated_online_stt_failed" : "local_stt_failed"
      };
    }
    console.log(`STT Result (for NLU processing): "${transcribedText}" (Audio: ${audioFilePath})`);

    // --- NLU Phase ---
    if (isOnline) {
      try {
        console.log("Attempting online NLU processing...");
        const authToken = await offlineService.getAuthToken();
        const backendNluResponse = await fetch(this.onlineNluEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ text: transcribedText, language: language }),
        });

        if (backendNluResponse.ok) {
          const nluData = await backendNluResponse.json();
          console.log("Online NLU successful:", nluData);
          return { ...nluData, source: "online_nlu", transcribed_text: transcribedText };
        } else {
          console.warn("Online NLU call failed, status:", backendNluResponse.status, ". Falling back to local NLU.");
          // Fall through to local NLU
        }
      } catch (error) {
        console.warn("Online NLU processing failed with error, falling back to local. Error:", error.message);
        // Fall through to local NLU
      }
    }

    // Fallback to local NLU processing (if offline or if online NLU failed)
    console.log("Attempting local NLU processing (fallback)...");
    const localNluResult = await offlineService.localNLU(transcribedText, language);

    if (localNluResult && localNluResult.intent !== "unknown_command") { // Check if local NLU was successful
      console.log("Local NLU successful:", localNluResult);
      // Optionally, queue the local NLU result for server-side logging/analytics when back online
      // This assumes the result structure is compatible or a specific endpoint exists for offline logs.
      /*
      await offlineService.addToSyncQueue('LOG_OFFLINE_NLU_INTERACTION', '/api/v1/mobile/ai/log-offline-interaction', 'POST',
        {
          timestamp: new Date().toISOString(),
          language,
          transcribed_text: transcribedText,
          nlu_intent: localNluResult.intent,
          nlu_parameters: localNluResult.parameters
        });
      */
      return { ...localNluResult, transcribed_text: transcribedText }; // Ensure localNluResult includes source: "local_nlu"
    }

    console.error("All NLU attempts (online fallback to local) failed for text:", transcribedText);
    return {
      intent: "nlu_failed_completely",
      parameters: { original_text: transcribedText, language },
      responseText: "Sorry, I'm having trouble understanding that right now.",
      source: "system_error",
      transcribed_text: transcribedText
    };
  }
}

// Export an instance (singleton) or the class itself
export default new VoiceProcessingService();
// export { VoiceProcessingService }; // If you want to allow multiple instances
