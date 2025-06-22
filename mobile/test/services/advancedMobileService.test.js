import advancedMobileService from '../../src/services/advancedMobileService';

// Mock global.fetch for testing API calls
global.fetch = jest.fn();

describe('advancedMobileService', () => {
  const API_BASE_URL = 'http://localhost:8000/api/v1'; // Should match the service
  const FAKE_TOKEN = 'FAKE_BEARER_TOKEN'; // Should match the service

  beforeEach(() => {
    fetch.mockClear();
  });

  describe('initialize', () => {
    it('should log initialization and resolve with status', async () => {
      // For now, initialize doesn't make a fetch call in the provided implementation
      const result = await advancedMobileService.initialize();
      expect(result.status).toBe('initialized');
      // If it were to fetch config:
      // fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ someConfig: true }) });
      // const result = await advancedMobileService.initialize();
      // expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/mobile/config`, expect.any(Object));
      // expect(result.config.someConfig).toBe(true);
    });
  });

  describe('setupAiNotifications', () => {
    it('should POST to /mobile/ai/notifications/settings with summary and resolve with response', async () => {
      const mockUserBehaviorSummary = { avgSessionDuration: 300 };
      const mockResponse = { status: 'success', message: 'Preferences saved' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({'Content-Type': 'application/json'}),
      });

      const result = await advancedMobileService.setupAiNotifications(mockUserBehaviorSummary);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/mobile/ai/notifications/settings`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${FAKE_TOKEN}`,
          },
          body: JSON.stringify({
            notification_enabled_types: ["task_updates", "daily_summary"],
            preferred_times: ["09:00", "17:00"],
            behavior_summary: mockUserBehaviorSummary,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle error if fetch fails for setupAiNotifications', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(advancedMobileService.setupAiNotifications({})).rejects.toThrow('Network error');
    });
  });

  describe('processAiNotifications', () => {
    it('should GET /mobile/ai/notifications/triggers and resolve with triggers', async () => {
      const mockTriggers = [{ trigger_type: 'daily', message_template: 'Hello!' }];
      const mockResponse = { triggers: mockTriggers, generated_at: new Date().toISOString() };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({'Content-Type': 'application/json'}),
      });

      const result = await advancedMobileService.processAiNotifications();

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/mobile/ai/notifications/triggers`,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${FAKE_TOKEN}`,
          },
        })
      );
      expect(result).toEqual(mockTriggers);
    });
  });

  describe('generateAdvancedAnalytics', () => {
    it('should POST to /mobile/analytics with usageData and return response or fallback', async () => {
      const mockUsageData = { screenTime: 1000 };
      const mockBackendResponse = { insights: { score: 90 } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendResponse,
        headers: new Headers({'Content-Type': 'application/json'}),
      });

      const result = await advancedMobileService.generateAdvancedAnalytics(mockUsageData);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/mobile/analytics`, // Conceptual endpoint from service file
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${FAKE_TOKEN}`,
          },
          body: JSON.stringify(mockUsageData),
        })
      );
      expect(result).toEqual(mockBackendResponse);
    });

    it('should return fallback mock data if fetch fails for generateAdvancedAnalytics', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));
        const result = await advancedMobileService.generateAdvancedAnalytics({});
        expect(result.insights.error).toBe('Could not fetch live analytics');
      });
  });

  describe('processVoiceCommand', () => {
    it('should POST to /mobile/ai/voice/interpret with text and language, and resolve with interpretation', async () => {
      const commandText = 'Show my dashboard';
      const language = 'en-GB';
      const mockInterpretation = { intent: 'navigate', parameters: { screen: 'Dashboard' } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockInterpretation,
        headers: new Headers({'Content-Type': 'application/json'}),
      });

      const result = await advancedMobileService.processVoiceCommand(commandText, language);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/mobile/ai/voice/interpret`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${FAKE_TOKEN}`,
          },
          body: JSON.stringify({
            text: commandText,
            language: language,
          }),
        })
      );
      expect(result).toEqual(mockInterpretation);
    });

    it('should return fallback error response if fetch fails for processVoiceCommand', async () => {
        const commandText = 'Test command';
        fetch.mockRejectedValueOnce(new Error('NLU service unavailable'));
        const result = await advancedMobileService.processVoiceCommand(commandText);
        expect(result.intent).toBe('interpretation_failed');
        expect(result.responseText).toContain("Sorry, I couldn't process that command right now.");
      });
  });

  // Simple tests for local state/placeholder functions
  describe('local state functions', () => {
    it('startVoiceRecognition should resolve with status', async () => {
      const result = await advancedMobileService.startVoiceRecognition();
      expect(result.status).toBe('Voice recognition started locally');
    });

    it('stopVoiceRecognition should resolve with status', async () => {
      const result = await advancedMobileService.stopVoiceRecognition();
      expect(result.status).toBe('Voice recognition stopped locally');
    });

    it('setupBackgroundFetch should resolve with status', async () => {
        // This test doesn't mock expo-background-fetch, just checks the service function's promise
        const result = await advancedMobileService.setupBackgroundFetch();
        expect(result.status).toBe('Background fetch setup attempted');
      });
  });
});
```
