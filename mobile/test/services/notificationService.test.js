import NotificationService from '../../src/services/notificationService';
import * as Notifications from 'expo-notifications';
import AdvancedMobileService from '../../src/services/advancedMobileService'; // To mock its methods

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'mock-expo-push-token' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined), // For Android
}));

// Mock AdvancedMobileService methods used by NotificationService
jest.mock('../../src/services/advancedMobileService', () => ({
  // Mock any methods from AdvancedMobileService that notificationService calls
  getPersonalizedNotificationSchedule: jest.fn(),
  logUserActivity: jest.fn(),
  // Keep other properties/methods if needed, or default mock them
  config: {
    // Add any config properties that might be accessed
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue('mock-auth-token'), // Default mock for getAuthToken helper
  setItem: jest.fn().mockResolvedValue(undefined),
}));


describe('NotificationService', () => {
  let notificationServiceInstance;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create a new instance for each test to ensure isolation
    // Note: NotificationService is exported as `new NotificationService()`.
    // To test it cleanly, it's better if the class itself is exported,
    // and we instantiate it here. For now, we'll have to re-import or reset its state.
    // For simplicity, we'll assume the default export is an instance.
    // This means state from previous tests might linger if not handled in constructor or methods.
    // The provided notificationService.js already exports an instance.
    // Let's try to get a fresh instance for testing if possible, or be mindful of shared state.
    // Re-requiring can sometimes provide a fresh instance in Jest if modules are not heavily cached or have side effects.
    // jest.resetModules(); // This can be too broad.
    // notificationServiceInstance = require('../../src/services/notificationService').default;
    // For now, we'll use the imported instance and be careful.
    notificationServiceInstance = NotificationService; // Using the direct import which is an instance

    // Default successful personalized schedule
    AdvancedMobileService.getPersonalizedNotificationSchedule.mockResolvedValue({
        optimal_times: ["09:00", "15:30"],
        preferences: { enabled: true }
    });
    AdvancedMobileService.logUserActivity.mockResolvedValue({ status: 'logged' });
  });

  describe('initialize', () => {
    it('should register for push notifications and set up listeners', async () => {
      // Spy on methods that should be called if NotificationService was a class we instantiate
      // For an existing instance, we check mocks of dependencies.
      const mockToken = 'mock-expo-push-token';
      Notifications.getExpoPushTokenAsync.mockResolvedValueOnce({ data: mockToken });

      // Spy on applyAdaptiveSchedule if it's part of the class, or ensure it's called
      // Since applyAdaptiveSchedule is a method of the instance, we can spy on it.
      const applyAdaptiveScheduleSpy = jest.spyOn(notificationServiceInstance, 'applyAdaptiveSchedule').mockResolvedValueOnce(undefined);

      await notificationServiceInstance.initialize();

      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled();
      expect(notificationServiceInstance.expoPushToken).toBe(mockToken);
      expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
      expect(applyAdaptiveScheduleSpy).toHaveBeenCalled();
      applyAdaptiveScheduleSpy.mockRestore();
    });

    it('should fallback to default reminders if applyAdaptiveSchedule fails', async () => {
        const applyAdaptiveScheduleSpy = jest.spyOn(notificationServiceInstance, 'applyAdaptiveSchedule').mockRejectedValueOnce(new Error("Failed to apply"));
        const scheduleProductivityRemindersSpy = jest.spyOn(notificationServiceInstance, 'scheduleProductivityReminders').mockResolvedValueOnce(undefined);

        await notificationServiceInstance.initialize();

        expect(applyAdaptiveScheduleSpy).toHaveBeenCalled();
        // Ensure scheduleProductivityReminders is called as a fallback
        // This requires scheduleProductivityReminders to be callable and potentially spied upon.
        // The current implementation of initialize's catch block calls this.scheduleProductivityReminders()
        // Wait for promises to settle
        await Promise.resolve(); // Or use jest.runAllTimers() if timers are involved

        expect(scheduleProductivityRemindersSpy).toHaveBeenCalled();

        applyAdaptiveScheduleSpy.mockRestore();
        scheduleProductivityRemindersSpy.mockRestore();
    });
  });

  describe('scheduleLocalNotification', () => {
    it('should call Notifications.scheduleNotificationAsync with correct parameters', async () => {
      const title = 'Test Title';
      const body = 'Test Body';
      const data = { testData: 'value' };
      const trigger = { seconds: 5 };
      const notificationId = 'custom-id-123';

      await notificationServiceInstance.scheduleLocalNotification(title, body, data, trigger, notificationId);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        identifier: notificationId,
        content: { title, body, data, sound: 'default' },
        trigger,
      });
    });
  });

  describe('applyAdaptiveSchedule', () => {
    it('should fetch schedule, cancel all, and schedule new notifications for optimal_times', async () => {
      const mockSchedule = { optimal_times: ['10:00', '17:30'] };
      AdvancedMobileService.getPersonalizedNotificationSchedule.mockResolvedValueOnce(mockSchedule);

      // Spy on scheduleLocalNotification to verify calls
      const scheduleSpy = jest.spyOn(notificationServiceInstance, 'scheduleLocalNotification').mockResolvedValue('new-mock-id');

      await notificationServiceInstance.applyAdaptiveSchedule();

      expect(AdvancedMobileService.getPersonalizedNotificationSchedule).toHaveBeenCalledTimes(1);
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);

      expect(scheduleSpy).toHaveBeenCalledTimes(mockSchedule.optimal_times.length);
      expect(scheduleSpy).toHaveBeenCalledWith(
        expect.any(String), // title
        expect.any(String), // body
        expect.objectContaining({ type: 'adaptive_reminder', time: '10:00', adaptive: true }),
        { hour: 10, minute: 0, repeats: true },
        'adaptive_10_0'
      );
      expect(scheduleSpy).toHaveBeenCalledWith(
        expect.any(String), // title
        expect.any(String), // body
        expect.objectContaining({ type: 'adaptive_reminder', time: '17:30', adaptive: true }),
        { hour: 17, minute: 30, repeats: true },
        'adaptive_17_30'
      );
      expect(notificationServiceInstance.isAdaptiveScheduleApplied).toBe(true);
      scheduleSpy.mockRestore();
    });

    it('should call scheduleProductivityReminders if no optimal_times are returned', async () => {
      AdvancedMobileService.getPersonalizedNotificationSchedule.mockResolvedValueOnce({ optimal_times: [] });
      const scheduleProductivityRemindersSpy = jest.spyOn(notificationServiceInstance, 'scheduleProductivityReminders').mockResolvedValueOnce(undefined);

      await notificationServiceInstance.applyAdaptiveSchedule();

      expect(scheduleProductivityRemindersSpy).toHaveBeenCalled();
      expect(notificationServiceInstance.isAdaptiveScheduleApplied).toBe(false); // Should not be set true
      scheduleProductivityRemindersSpy.mockRestore();
    });

     it('should call scheduleProductivityReminders if fetching schedule fails', async () => {
      AdvancedMobileService.getPersonalizedNotificationSchedule.mockRejectedValueOnce(new Error("API Error"));
      const scheduleProductivityRemindersSpy = jest.spyOn(notificationServiceInstance, 'scheduleProductivityReminders').mockResolvedValueOnce(undefined);

      await notificationServiceInstance.applyAdaptiveSchedule();

      expect(scheduleProductivityRemindersSpy).toHaveBeenCalled();
      expect(notificationServiceInstance.isAdaptiveScheduleApplied).toBe(false);
      scheduleProductivityRemindersSpy.mockRestore();
    });
  });

  describe('Notification Event Handling and Logging', () => {
    it('handleNotificationReceived should log activity via AdvancedMobileService', () => {
      const mockNotification = {
        request: {
          identifier: 'notif-id-recv',
          content: {
            title: 'Received Title',
            body: 'Received Body',
            data: { custom: 'data' },
          },
          trigger: { type: 'daily' },
        },
      };
      notificationServiceInstance.handleNotificationReceived(mockNotification);
      expect(AdvancedMobileService.logUserActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'notification_received',
          notificationId: 'notif-id-recv',
          contentTitle: 'Received Title',
        })
      );
    });

    it('handleNotificationResponse should log activity via AdvancedMobileService', () => {
      const mockResponse = {
        actionIdentifier: Notifications.DEFAULT_ACTION_IDENTIFIER,
        notification: {
          request: {
            identifier: 'notif-id-resp',
            content: {
              title: 'Response Title',
              body: 'Response Body',
              data: { link: 'screen' },
            },
            trigger: { type: 'calendar' },
          },
        },
        userText: undefined,
      };
      notificationServiceInstance.handleNotificationResponse(mockResponse);
      expect(AdvancedMobileService.logUserActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'notification_tapped',
          notificationId: 'notif-id-resp',
          contentTitle: 'Response Title',
        })
      );
    });
  });

  describe('scheduleProductivityReminders', () => {
    it('should schedule default reminders if adaptive schedule is not applied', async () => {
      notificationServiceInstance.isAdaptiveScheduleApplied = false;
      const scheduleSpy = jest.spyOn(notificationServiceInstance, 'scheduleLocalNotification');

      await notificationServiceInstance.scheduleProductivityReminders();

      expect(scheduleSpy).toHaveBeenCalledTimes(3); // Morning, Afternoon, Evening
      expect(scheduleSpy).toHaveBeenCalledWith(expect.any(String), expect.any(String), expect.objectContaining({adaptive: false}), expect.any(Object), 'default_morning');
      scheduleSpy.mockRestore();
    });

    it('should not schedule default reminders if adaptive schedule is applied', async () => {
      notificationServiceInstance.isAdaptiveScheduleApplied = true;
      const scheduleSpy = jest.spyOn(notificationServiceInstance, 'scheduleLocalNotification');

      await notificationServiceInstance.scheduleProductivityReminders();

      expect(scheduleSpy).not.toHaveBeenCalled();
      scheduleSpy.mockRestore();
    });
  });

});
