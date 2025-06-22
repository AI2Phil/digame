// Mock global fetch
global.fetch = jest.fn();

// Dynamically import the service module AFTER fetch has been mocked.
// advancedMobileService is imported using require because Jest hoists jest.mock calls automatically,
// which can interfere with the global.fetch mock if advancedMobileService was imported using ES6 import statement at the top.
// Using require ensures that the module is loaded after the mock is in place.
const advancedMobileService = require('../advancedMobileService').default;

describe('advancedMobileService', () => {
  const API_BASE_URL = 'http://localhost:8000/mobile-ai';

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    fetch.mockClear();
  });

  describe('transcribeAudio', () => {
    it('should call transcribe endpoint and return data on success', async () => {
      const mockTranscriptionResponse = { transcription: 'hello world from backend', engine: 'mock_engine_v1' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTranscriptionResponse,
      });

      const result = await advancedMobileService.transcribeAudio('file://dummyuri.m4a');

      expect(fetch).toHaveBeenCalledTimes(1);
      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toBe(`${API_BASE_URL}/voice/transcribe`);
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].body).toBeInstanceOf(FormData);

      // Check if FormData has the file
      const formData = fetchCall[1].body;
      const fileEntry = formData.get('audio_file');
      expect(fileEntry).toBeDefined();
      expect(fileEntry.uri).toBe('file://dummyuri.m4a');
      expect(fileEntry.type).toBe('audio/m4a');

      expect(result).toEqual(mockTranscriptionResponse);
    });

    it('should throw an error if transcribe endpoint call fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      });

      await expect(advancedMobileService.transcribeAudio('file://dummyuri.m4a'))
        .rejects.toThrow('Server error: 500 - Internal Server Error');
    });

    it('should reject if audioUri is not provided', async () => {
      // No fetch call should be made
      await expect(advancedMobileService.transcribeAudio(null))
        .rejects.toEqual({ error: 'audio_uri_missing' }); // Matching the specific rejection object
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('handleIntent', () => {
    const mockTranscriptionText = 'this is a test transcription';

    it('should call intent endpoint and return data on success', async () => {
      const mockIntentResponse = { intent: 'TEST_INTENT', confidence: 0.99 };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIntentResponse,
      });

      const result = await advancedMobileService.handleIntent(mockTranscriptionText);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/voice/intent`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: mockTranscriptionText }),
        })
      );
      expect(result).toEqual(mockIntentResponse);
    });

    it('should throw an error if intent endpoint call fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      });

      await expect(advancedMobileService.handleIntent(mockTranscriptionText))
        .rejects.toThrow('Server error: 400 - Bad Request');
    });

    it('should reject if transcription is invalid', async () => {
      await expect(advancedMobileService.handleIntent(' '))
        .rejects.toEqual({ error: 'invalid_transcription_for_intent' });
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('processAiNotifications', () => {
    it('should call personalize notifications endpoint and return data on success', async () => {
      const mockPersonalizationResponse = { status: 'success_mock', message: 'Personalized!' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPersonalizationResponse,
      });

      const result = await advancedMobileService.processAiNotifications();

      expect(fetch).toHaveBeenCalledTimes(1);
      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toBe(`${API_BASE_URL}/notifications/personalize`);
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].headers['Content-Type']).toBe('application/json');
      const body = JSON.parse(fetchCall[1].body);
      expect(body.user_id).toBe('mock_user_123'); // As per current service implementation
      expect(body.current_context).toBeDefined();

      expect(result).toEqual(mockPersonalizationResponse);
    });

    it('should throw an error if personalize notifications endpoint call fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => 'Service Unavailable'
      });

      await expect(advancedMobileService.processAiNotifications())
        .rejects.toThrow('Server error: 503 - Service Unavailable');
    });
  });
});
