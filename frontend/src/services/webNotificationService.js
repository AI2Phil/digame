class WebNotificationService {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.registration = null;
    this.vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'your-vapid-public-key';
  }

  async initialize() {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker for push notifications
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', this.registration);
      }

      // Request permission if not already granted
      if (this.permission === 'default') {
        this.permission = await Notification.requestPermission();
      }

      if (this.permission === 'granted') {
        await this.subscribeToPushNotifications();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to initialize web notifications:', error);
      return false;
    }
  }

  async subscribeToPushNotifications() {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Send subscription to backend
      await this.sendSubscriptionToBackend(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  async sendSubscriptionToBackend(subscription) {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to backend');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send subscription to backend:', error);
      throw error;
    }
  }

  async showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted');
      return;
    }

    const defaultOptions = {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icon-view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icon-dismiss.png'
        }
      ]
    };

    const notificationOptions = { ...defaultOptions, ...options };

    if (this.registration) {
      // Use service worker to show notification
      return this.registration.showNotification(title, notificationOptions);
    } else {
      // Fallback to basic notification
      return new Notification(title, notificationOptions);
    }
  }

  async scheduleProductivityReminders() {
    // Schedule daily productivity reminders
    const reminders = [
      {
        time: '09:00',
        title: 'Good Morning! 🌅',
        body: 'Ready to boost your productivity today?',
        tag: 'morning-motivation'
      },
      {
        time: '14:00',
        title: 'Afternoon Check-in 📊',
        body: 'How\'s your productivity going? Check your dashboard!',
        tag: 'afternoon-checkin'
      },
      {
        time: '18:00',
        title: 'Daily Review 🎯',
        body: 'Time to review your achievements and plan tomorrow!',
        tag: 'daily-review'
      }
    ];

    for (const reminder of reminders) {
      await this.scheduleNotification(reminder);
    }
  }

  async scheduleNotification(notification) {
    // For web, we'll use setTimeout for demo purposes
    // In production, you'd want to use a more robust scheduling system
    const now = new Date();
    const [hours, minutes] = notification.time.split(':');
    const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      this.showNotification(notification.title, {
        body: notification.body,
        tag: notification.tag,
        requireInteraction: true
      });
    }, delay);
  }

  async showProductivityAlert(data) {
    const title = 'Productivity Alert';
    const options = {
      body: data.message,
      icon: '/icon-productivity.png',
      tag: 'productivity-alert',
      data: data,
      requireInteraction: true
    };

    return this.showNotification(title, options);
  }

  async showGoalAchievement(goal) {
    const title = '🎉 Goal Achieved!';
    const options = {
      body: `Congratulations! You've completed: ${goal.name}`,
      icon: '/icon-achievement.png',
      tag: 'goal-achievement',
      data: { goalId: goal.id },
      requireInteraction: true,
      actions: [
        {
          action: 'view-progress',
          title: 'View Progress',
          icon: '/icon-progress.png'
        },
        {
          action: 'set-new-goal',
          title: 'Set New Goal',
          icon: '/icon-goal.png'
        }
      ]
    };

    return this.showNotification(title, options);
  }

  async showBreakReminder() {
    const title = '☕ Time for a Break!';
    const options = {
      body: 'You\'ve been working hard. Take a 5-minute break to recharge.',
      icon: '/icon-break.png',
      tag: 'break-reminder',
      requireInteraction: false,
      actions: [
        {
          action: 'start-break',
          title: 'Start Break',
          icon: '/icon-play.png'
        },
        {
          action: 'snooze',
          title: 'Snooze 10min',
          icon: '/icon-snooze.png'
        }
      ]
    };

    return this.showNotification(title, options);
  }

  async requestPermission() {
    if (!this.isSupported) {
      return 'denied';
    }

    this.permission = await Notification.requestPermission();
    return this.permission;
  }

  isPermissionGranted() {
    return this.permission === 'granted';
  }

  async unsubscribe() {
    if (!this.registration) {
      return;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify backend
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint
          })
        });
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Handle notification clicks
  setupNotificationHandlers() {
    if (!this.registration) return;

    // Listen for notification clicks
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        this.handleNotificationClick(event.data);
      }
    });
  }

  handleNotificationClick(data) {
    const { action, notification } = data;

    switch (action) {
      case 'view':
        window.open('/dashboard', '_blank');
        break;
      case 'view-progress':
        window.open('/analytics', '_blank');
        break;
      case 'set-new-goal':
        window.open('/goals', '_blank');
        break;
      case 'start-break':
        this.startBreakTimer();
        break;
      case 'snooze':
        this.snoozeBreakReminder(10);
        break;
      default:
        // Default action - focus the app
        window.focus();
    }
  }

  startBreakTimer() {
    // Implement break timer logic
    console.log('Starting break timer...');
    // You could integrate with a break timer component
  }

  snoozeBreakReminder(minutes) {
    setTimeout(() => {
      this.showBreakReminder();
    }, minutes * 60 * 1000);
  }

  // Analytics and tracking
  trackNotificationInteraction(action, notificationTag) {
    // Track notification interactions for analytics
    if (window.gtag) {
      window.gtag('event', 'notification_interaction', {
        action: action,
        notification_tag: notificationTag
      });
    }
  }
}

export default new WebNotificationService();