/**
 * WebSocket Service for Real-time Notifications
 * Handles WebSocket connections, message routing, and real-time updates
 */

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.token = null;
    this.userId = null;
  }

  /**
   * Initialize WebSocket connection
   */
  connect(token, userId) {
    this.token = token;
    this.userId = userId;
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
    const url = `${wsUrl}?token=${token}&user_id=${userId}`;

    try {
      this.socket = new WebSocket(url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    this.socket.onopen = (event) => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', { timestamp: new Date() });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.emit('disconnected', { code: event.code, reason: event.reason });
      
      if (!event.wasClean) {
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    const { type, payload, timestamp } = data;
    
    console.log('WebSocket message received:', type, payload);
    
    // Emit to specific listeners
    this.emit(type, { ...payload, timestamp });
    
    // Emit to general message listeners
    this.emit('message', data);
  }

  /**
   * Send message through WebSocket
   */
  send(type, payload) {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket not connected, cannot send message');
      return false;
    }

    try {
      const message = {
        type,
        payload,
        timestamp: new Date().toISOString(),
        user_id: this.userId
      };
      
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  /**
   * Subscribe to specific message types
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    
    return () => this.off(eventType, callback);
  }

  /**
   * Unsubscribe from message types
   */
  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  /**
   * Emit events to listeners
   */
  emit(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event listener:', error);
        }
      });
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected && this.token && this.userId) {
        this.connect(this.token, this.userId);
      }
    }, delay);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.socket ? this.socket.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(callback) {
    return this.on('notification', callback);
  }

  /**
   * Subscribe to achievement notifications
   */
  subscribeToAchievements(callback) {
    return this.on('achievement_unlocked', callback);
  }

  /**
   * Subscribe to goal progress updates
   */
  subscribeToGoalProgress(callback) {
    return this.on('goal_progress', callback);
  }

  /**
   * Subscribe to system alerts
   */
  subscribeToSystemAlerts(callback) {
    return this.on('system_alert', callback);
  }

  /**
   * Subscribe to user activity updates
   */
  subscribeToUserActivity(callback) {
    return this.on('user_activity', callback);
  }

  /**
   * Send heartbeat to keep connection alive
   */
  sendHeartbeat() {
    return this.send('heartbeat', { timestamp: new Date().toISOString() });
  }

  /**
   * Request notification preferences update
   */
  updateNotificationPreferences(preferences) {
    return this.send('update_notification_preferences', preferences);
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId) {
    return this.send('mark_notification_read', { notification_id: notificationId });
  }

  /**
   * Request real-time analytics updates
   */
  subscribeToAnalytics(callback) {
    return this.on('analytics_update', callback);
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

// Setup heartbeat interval
let heartbeatInterval;

websocketService.on('connected', () => {
  // Send heartbeat every 30 seconds
  heartbeatInterval = setInterval(() => {
    websocketService.sendHeartbeat();
  }, 30000);
});

websocketService.on('disconnected', () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
});

export default websocketService;