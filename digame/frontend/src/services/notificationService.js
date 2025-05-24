/**
 * Notification Service for Smart Notifications
 * Handles notification display, preferences, and user interactions
 */

import { Toast } from '../components/ui/Toast';
import websocketService from './websocketService';
import apiService from './apiService';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.preferences = {
      desktop: true,
      sound: true,
      achievements: true,
      goalProgress: true,
      systemAlerts: true,
      socialActivity: false,
      emailDigest: true,
      pushNotifications: true
    };
    this.listeners = new Set();
    this.isInitialized = false;
    this.permission = 'default';
  }

  /**
   * Initialize notification service
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request desktop notification permission
      await this.requestPermission();
      
      // Load user preferences
      await this.loadPreferences();
      
      // Setup WebSocket listeners
      this.setupWebSocketListeners();
      
      // Setup service worker for push notifications
      await this.setupServiceWorker();
      
      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  /**
   * Request desktop notification permission
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      this.permission = 'denied';
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      this.permission = 'denied';
      return 'denied';
    }
  }

  /**
   * Load user notification preferences
   */
  async loadPreferences() {
    try {
      const userPreferences = await apiService.getNotificationPreferences();
      this.preferences = { ...this.preferences, ...userPreferences };
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(newPreferences) {
    try {
      this.preferences = { ...this.preferences, ...newPreferences };
      await apiService.updateNotificationPreferences(this.preferences);
      
      // Update WebSocket preferences
      websocketService.updateNotificationPreferences(this.preferences);
      
      this.emit('preferencesUpdated', this.preferences);
      Toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      Toast.error('Failed to update notification preferences');
    }
  }

  /**
   * Setup WebSocket listeners for real-time notifications
   */
  setupWebSocketListeners() {
    // Achievement notifications
    websocketService.subscribeToAchievements((data) => {
      if (this.preferences.achievements) {
        this.showAchievementNotification(data);
      }
    });

    // Goal progress notifications
    websocketService.subscribeToGoalProgress((data) => {
      if (this.preferences.goalProgress) {
        this.showGoalProgressNotification(data);
      }
    });

    // System alerts
    websocketService.subscribeToSystemAlerts((data) => {
      if (this.preferences.systemAlerts) {
        this.showSystemAlert(data);
      }
    });

    // General notifications
    websocketService.subscribeToNotifications((data) => {
      this.handleGeneralNotification(data);
    });

    // User activity notifications
    websocketService.subscribeToUserActivity((data) => {
      if (this.preferences.socialActivity) {
        this.showUserActivityNotification(data);
      }
    });
  }

  /**
   * Setup service worker for push notifications
   */
  async setupServiceWorker() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', registration);
      
      // Subscribe to push notifications if user has enabled them
      if (this.preferences.pushNotifications && this.permission === 'granted') {
        await this.subscribeToPushNotifications(registration);
      }
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPushNotifications(registration) {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      await apiService.subscribeToPushNotifications(subscription);
      console.log('Push notification subscription successful');
    } catch (error) {
      console.error('Push notification subscription failed:', error);
    }
  }

  /**
   * Show achievement notification
   */
  showAchievementNotification(data) {
    const { achievement, points, rarity } = data;
    
    const notification = {
      id: `achievement_${Date.now()}`,
      type: 'achievement',
      title: '🏆 Achievement Unlocked!',
      message: `You earned "${achievement.title}" (+${points} points)`,
      data: achievement,
      priority: 'high',
      timestamp: new Date(),
      actions: [
        { id: 'view', title: 'View Achievement', icon: '👁️' },
        { id: 'share', title: 'Share', icon: '📤' }
      ]
    };

    this.addNotification(notification);
    this.showDesktopNotification(notification);
    this.showToastNotification(notification, 'success');
    this.playNotificationSound('achievement');
  }

  /**
   * Show goal progress notification
   */
  showGoalProgressNotification(data) {
    const { goal, progress, milestone } = data;
    
    let message = `Goal "${goal.title}" is ${progress}% complete`;
    if (milestone) {
      message = `🎯 Milestone reached! ${milestone.description}`;
    }

    const notification = {
      id: `goal_${goal.id}_${Date.now()}`,
      type: 'goal_progress',
      title: 'Goal Progress Update',
      message,
      data: { goal, progress, milestone },
      priority: milestone ? 'high' : 'medium',
      timestamp: new Date(),
      actions: [
        { id: 'view_goal', title: 'View Goal', icon: '🎯' },
        { id: 'update_progress', title: 'Update Progress', icon: '📈' }
      ]
    };

    this.addNotification(notification);
    
    if (milestone) {
      this.showDesktopNotification(notification);
      this.showToastNotification(notification, 'success');
      this.playNotificationSound('milestone');
    } else {
      this.showToastNotification(notification, 'info');
    }
  }

  /**
   * Show system alert notification
   */
  showSystemAlert(data) {
    const { level, title, message, actionRequired } = data;
    
    const notification = {
      id: `system_${Date.now()}`,
      type: 'system_alert',
      title: title || 'System Alert',
      message,
      data,
      priority: level === 'critical' ? 'critical' : level === 'warning' ? 'high' : 'medium',
      timestamp: new Date(),
      persistent: actionRequired,
      actions: actionRequired ? [
        { id: 'acknowledge', title: 'Acknowledge', icon: '✅' },
        { id: 'view_details', title: 'View Details', icon: '🔍' }
      ] : []
    };

    this.addNotification(notification);
    this.showDesktopNotification(notification);
    
    const toastVariant = level === 'critical' ? 'destructive' : 
                        level === 'warning' ? 'warning' : 'info';
    this.showToastNotification(notification, toastVariant);
    
    if (level === 'critical') {
      this.playNotificationSound('alert');
    }
  }

  /**
   * Handle general notifications
   */
  handleGeneralNotification(data) {
    const { type, title, message, priority = 'medium', actions = [] } = data;
    
    const notification = {
      id: `general_${Date.now()}`,
      type,
      title,
      message,
      data,
      priority,
      timestamp: new Date(),
      actions
    };

    this.addNotification(notification);
    this.showToastNotification(notification, 'info');
    
    if (priority === 'high' || priority === 'critical') {
      this.showDesktopNotification(notification);
    }
  }

  /**
   * Show user activity notification
   */
  showUserActivityNotification(data) {
    const { user, activity, type } = data;
    
    const notification = {
      id: `activity_${Date.now()}`,
      type: 'user_activity',
      title: 'Social Activity',
      message: `${user.username} ${activity}`,
      data,
      priority: 'low',
      timestamp: new Date(),
      actions: [
        { id: 'view_profile', title: 'View Profile', icon: '👤' }
      ]
    };

    this.addNotification(notification);
    this.showToastNotification(notification, 'info');
  }

  /**
   * Show desktop notification
   */
  showDesktopNotification(notification) {
    if (!this.preferences.desktop || this.permission !== 'granted') {
      return;
    }

    try {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: notification.id,
        requireInteraction: notification.persistent,
        actions: notification.actions?.slice(0, 2) // Limit to 2 actions
      });

      desktopNotification.onclick = () => {
        this.handleNotificationClick(notification);
        desktopNotification.close();
      };

      // Auto-close after 5 seconds unless persistent
      if (!notification.persistent) {
        setTimeout(() => {
          desktopNotification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to show desktop notification:', error);
    }
  }

  /**
   * Show toast notification
   */
  showToastNotification(notification, variant = 'info') {
    const toastOptions = {
      title: notification.title,
      description: notification.message,
      variant,
      duration: notification.persistent ? 0 : 5000
    };

    if (notification.actions?.length > 0) {
      toastOptions.action = {
        altText: notification.actions[0].title,
        onClick: () => this.handleNotificationAction(notification, notification.actions[0])
      };
    }

    Toast.show(toastOptions);
  }

  /**
   * Play notification sound
   */
  playNotificationSound(type = 'default') {
    if (!this.preferences.sound) return;

    try {
      const audio = new Audio(`/sounds/notification-${type}.mp3`);
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.warn('Failed to play notification sound:', error);
      });
    } catch (error) {
      console.warn('Notification sound not available:', error);
    }
  }

  /**
   * Add notification to internal list
   */
  addNotification(notification) {
    this.notifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.emit('notificationAdded', notification);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      notification.readAt = new Date();
      
      // Notify server
      websocketService.markNotificationAsRead(notificationId);
      
      this.emit('notificationRead', notification);
    }
  }

  /**
   * Handle notification click
   */
  handleNotificationClick(notification) {
    this.markAsRead(notification.id);
    this.emit('notificationClicked', notification);
  }

  /**
   * Handle notification action
   */
  handleNotificationAction(notification, action) {
    this.markAsRead(notification.id);
    this.emit('notificationAction', { notification, action });
  }

  /**
   * Get all notifications
   */
  getNotifications(filter = {}) {
    let filtered = [...this.notifications];

    if (filter.unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }

    if (filter.type) {
      filtered = filtered.filter(n => n.type === filter.type);
    }

    if (filter.priority) {
      filtered = filtered.filter(n => n.priority === filter.priority);
    }

    return filtered;
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications = [];
    this.emit('notificationsCleared');
  }

  /**
   * Subscribe to notification events
   */
  on(event, callback) {
    this.listeners.add({ event, callback });
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from notification events
   */
  off(event, callback) {
    this.listeners.forEach(listener => {
      if (listener.event === event && listener.callback === callback) {
        this.listeners.delete(listener);
      }
    });
  }

  /**
   * Emit notification events
   */
  emit(event, data) {
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        try {
          listener.callback(data);
        } catch (error) {
          console.error('Error in notification event listener:', error);
        }
      }
    });
  }

  /**
   * Get notification statistics
   */
  getStats() {
    const total = this.notifications.length;
    const unread = this.notifications.filter(n => !n.read).length;
    const byType = this.notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});

    return { total, unread, byType };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;