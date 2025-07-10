import { EventEmitter } from 'events';

// Types for WebSocket service
export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  messageQueueSize: number;
  enableCompression: boolean;
  enableLogging: boolean;
}

export interface WebSocketMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
  roomId?: string;
}

export interface QueuedMessage extends WebSocketMessage {
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: number;
  currentRoom?: string;
  metadata?: any;
}

export interface TypingIndicator {
  userId: string;
  roomId: string;
  isTyping: boolean;
  timestamp: number;
}

export interface ConnectionStats {
  isConnected: boolean;
  reconnectAttempts: number;
  lastConnected: number;
  lastDisconnected: number;
  messagesSent: number;
  messagesReceived: number;
  averageLatency: number;
}

// Enhanced WebSocket Service Class
export class CollaborationWebSocket extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: QueuedMessage[] = [];
  private pendingMessages: Map<string, { resolve: Function; reject: Function; timestamp: number }> = new Map();
  private userPresence: Map<string, UserPresence> = new Map();
  private typingIndicators: Map<string, TypingIndicator> = new Map();
  private connectionStats: ConnectionStats;
  private currentRoom: string | null = null;
  private userId: string | null = null;
  private authToken: string | null = null;
  private isReconnecting: boolean = false;
  private lastPingTime: number = 0;

  constructor(config: Partial<WebSocketConfig> = {}) {
    super();
    
    this.config = {
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      messageQueueSize: 100,
      enableCompression: true,
      enableLogging: process.env.NODE_ENV === 'development',
      ...config
    };

    this.connectionStats = {
      isConnected: false,
      reconnectAttempts: 0,
      lastConnected: 0,
      lastDisconnected: 0,
      messagesSent: 0,
      messagesReceived: 0,
      averageLatency: 0,
    };

    this.setupNetworkListeners();
  }

  // Connection Management
  async connect(userId: string, authToken: string): Promise<void> {
    this.userId = userId;
    this.authToken = authToken;

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.config.url}?token=${authToken}&userId=${userId}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.handleConnectionOpen();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          this.handleConnectionClose(event);
        };

        this.ws.onerror = (error) => {
          this.handleConnectionError(error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.connectionStats.isConnected = false;
    this.connectionStats.lastDisconnected = Date.now();
    this.emit('disconnected');
  }

  // Message Sending
  async sendMessage(type: string, payload: any, options: {
    roomId?: string;
    priority?: 'high' | 'medium' | 'low';
    requireAck?: boolean;
    timeout?: number;
  } = {}): Promise<any> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type,
      payload,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      roomId: options.roomId || this.currentRoom || undefined,
    };

    if (!this.isConnected()) {
      return this.queueMessage(message, options.priority || 'medium');
    }

    if (options.requireAck) {
      return this.sendMessageWithAck(message, options.timeout || 5000);
    } else {
      this.sendMessageImmediate(message);
    }
  }

  private sendMessageImmediate(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.queueMessage(message, 'medium');
      return;
    }

    try {
      const messageString = JSON.stringify(message);
      this.ws.send(messageString);
      this.connectionStats.messagesSent++;
      
      if (this.config.enableLogging) {
        console.log('WebSocket message sent:', message);
      }
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      this.queueMessage(message, 'medium');
    }
  }

  private async sendMessageWithAck(message: WebSocketMessage, timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingMessages.delete(message.id);
        reject(new Error('Message acknowledgment timeout'));
      }, timeout);

      this.pendingMessages.set(message.id, {
        resolve: (response: any) => {
          clearTimeout(timeoutId);
          resolve(response);
        },
        reject: (error: any) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        timestamp: Date.now(),
      });

      this.sendMessageImmediate(message);
    });
  }

  // Message Queue Management
  private queueMessage(message: WebSocketMessage, priority: 'high' | 'medium' | 'low'): void {
    const queuedMessage: QueuedMessage = {
      ...message,
      retryCount: 0,
      priority,
    };

    // Remove oldest messages if queue is full
    if (this.messageQueue.length >= this.config.messageQueueSize) {
      this.messageQueue.shift();
    }

    // Insert based on priority
    if (priority === 'high') {
      this.messageQueue.unshift(queuedMessage);
    } else {
      this.messageQueue.push(queuedMessage);
    }
  }

  private processMessageQueue(): void {
    if (!this.isConnected() || this.messageQueue.length === 0) {
      return;
    }

    const messagesToSend = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messagesToSend) {
      if (message.retryCount < 3) {
        this.sendMessageImmediate(message);
      } else {
        console.warn('Message dropped after max retries:', message);
      }
    }
  }

  // Room Management
  async joinRoom(roomId: string): Promise<void> {
    this.currentRoom = roomId;
    await this.sendMessage('join_room', { roomId }, { requireAck: true });
    this.emit('room:joined', roomId);
  }

  async leaveRoom(roomId?: string): Promise<void> {
    const targetRoom = roomId || this.currentRoom;
    if (targetRoom) {
      await this.sendMessage('leave_room', { roomId: targetRoom }, { requireAck: true });
      if (targetRoom === this.currentRoom) {
        this.currentRoom = null;
      }
      this.emit('room:left', targetRoom);
    }
  }

  // Presence Management
  updatePresence(status: 'online' | 'away' | 'busy', metadata?: any): void {
    const presence: UserPresence = {
      userId: this.userId!,
      status,
      lastSeen: Date.now(),
      currentRoom: this.currentRoom || undefined,
      metadata,
    };

    this.sendMessage('presence_update', presence);
    this.userPresence.set(this.userId!, presence);
    this.emit('presence:updated', presence);
  }

  getUserPresence(userId: string): UserPresence | null {
    return this.userPresence.get(userId) || null;
  }

  getRoomPresence(roomId: string): UserPresence[] {
    return Array.from(this.userPresence.values())
      .filter(presence => presence.currentRoom === roomId);
  }

  // Typing Indicators
  startTyping(roomId?: string): void {
    const targetRoom = roomId || this.currentRoom;
    if (!targetRoom) return;

    const indicator: TypingIndicator = {
      userId: this.userId!,
      roomId: targetRoom,
      isTyping: true,
      timestamp: Date.now(),
    };

    this.sendMessage('typing_start', indicator);
    this.typingIndicators.set(`${this.userId}-${targetRoom}`, indicator);
    this.emit('typing:started', indicator);
  }

  stopTyping(roomId?: string): void {
    const targetRoom = roomId || this.currentRoom;
    if (!targetRoom) return;

    const indicator: TypingIndicator = {
      userId: this.userId!,
      roomId: targetRoom,
      isTyping: false,
      timestamp: Date.now(),
    };

    this.sendMessage('typing_stop', indicator);
    this.typingIndicators.delete(`${this.userId}-${targetRoom}`);
    this.emit('typing:stopped', indicator);
  }

  getTypingUsers(roomId: string): string[] {
    const now = Date.now();
    const typingUsers: string[] = [];

    this.typingIndicators.forEach((indicator, key) => {
      if (indicator.roomId === roomId && 
          indicator.isTyping && 
          indicator.userId !== this.userId &&
          now - indicator.timestamp < 5000) { // 5 second timeout
        typingUsers.push(indicator.userId);
      }
    });

    return typingUsers;
  }

  // Event Handlers
  private handleConnectionOpen(): void {
    this.connectionStats.isConnected = true;
    this.connectionStats.lastConnected = Date.now();
    this.connectionStats.reconnectAttempts = 0;
    this.isReconnecting = false;

    this.startHeartbeat();
    this.processMessageQueue();
    
    this.emit('connected');
    
    if (this.config.enableLogging) {
      console.log('WebSocket connected');
    }
  }

  private handleConnectionClose(event: CloseEvent): void {
    this.connectionStats.isConnected = false;
    this.connectionStats.lastDisconnected = Date.now();
    
    this.clearTimers();
    this.emit('disconnected', event);

    if (this.config.enableLogging) {
      console.log('WebSocket disconnected:', event.code, event.reason);
    }

    // Auto-reconnect if not a clean close
    if (event.code !== 1000 && !this.isReconnecting) {
      this.scheduleReconnect();
    }
  }

  private handleConnectionError(error: Event): void {
    console.error('WebSocket error:', error);
    this.emit('error', error);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.connectionStats.messagesReceived++;

      // Handle acknowledgments
      if (message.type === 'ack' && this.pendingMessages.has(message.id)) {
        const pending = this.pendingMessages.get(message.id)!;
        pending.resolve(message.payload);
        this.pendingMessages.delete(message.id);
        return;
      }

      // Handle heartbeat
      if (message.type === 'pong') {
        const latency = Date.now() - this.lastPingTime;
        this.updateLatencyStats(latency);
        return;
      }

      // Handle presence updates
      if (message.type === 'presence_update') {
        this.handlePresenceUpdate(message.payload);
        return;
      }

      // Handle typing indicators
      if (message.type === 'typing_start' || message.type === 'typing_stop') {
        this.handleTypingIndicator(message.payload);
        return;
      }

      // Emit the message for application handling
      this.emit('message', message);
      this.emit(`message:${message.type}`, message.payload, message);

      if (this.config.enableLogging) {
        console.log('WebSocket message received:', message);
      }

    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handlePresenceUpdate(presence: UserPresence): void {
    this.userPresence.set(presence.userId, presence);
    this.emit('presence:updated', presence);
  }

  private handleTypingIndicator(indicator: TypingIndicator): void {
    const key = `${indicator.userId}-${indicator.roomId}`;
    
    if (indicator.isTyping) {
      this.typingIndicators.set(key, indicator);
      this.emit('typing:started', indicator);
    } else {
      this.typingIndicators.delete(key);
      this.emit('typing:stopped', indicator);
    }
  }

  // Reconnection Logic
  private scheduleReconnect(): void {
    if (this.connectionStats.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.emit('reconnect:failed');
      return;
    }

    this.isReconnecting = true;
    this.connectionStats.reconnectAttempts++;

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.connectionStats.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    this.reconnectTimer = setTimeout(() => {
      if (this.userId && this.authToken) {
        this.connect(this.userId, this.authToken).catch(() => {
          this.scheduleReconnect();
        });
      }
    }, delay);

    this.emit('reconnect:scheduled', delay);
  }

  // Heartbeat Management
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.lastPingTime = Date.now();
        this.sendMessage('ping', { timestamp: this.lastPingTime });
      }
    }, this.config.heartbeatInterval);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Network Status Handling
  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (!this.isConnected() && this.userId && this.authToken) {
          this.connect(this.userId, this.authToken);
        }
      });

      window.addEventListener('offline', () => {
        this.emit('network:offline');
      });
    }
  }

  // Utility Methods
  private updateLatencyStats(latency: number): void {
    const currentAvg = this.connectionStats.averageLatency;
    const messageCount = this.connectionStats.messagesReceived;
    
    this.connectionStats.averageLatency = 
      (currentAvg * (messageCount - 1) + latency) / messageCount;
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public Utility Methods
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionStats(): ConnectionStats {
    return { ...this.connectionStats };
  }

  getQueueSize(): number {
    return this.messageQueue.length;
  }

  getCurrentRoom(): string | null {
    return this.currentRoom;
  }

  getUserId(): string | null {
    return this.userId;
  }

  clearMessageQueue(): void {
    this.messageQueue = [];
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.removeAllListeners();
    this.userPresence.clear();
    this.typingIndicators.clear();
    this.pendingMessages.clear();
    this.messageQueue = [];
  }
}

// Create singleton instance
export const collaborationSocket = new CollaborationWebSocket();

// Export convenience methods
export const websocket = {
  connect: (userId: string, authToken: string) => collaborationSocket.connect(userId, authToken),
  disconnect: () => collaborationSocket.disconnect(),
  sendMessage: (type: string, payload: any, options?: any) => 
    collaborationSocket.sendMessage(type, payload, options),
  joinRoom: (roomId: string) => collaborationSocket.joinRoom(roomId),
  leaveRoom: (roomId?: string) => collaborationSocket.leaveRoom(roomId),
  updatePresence: (status: any, metadata?: any) => 
    collaborationSocket.updatePresence(status, metadata),
  startTyping: (roomId?: string) => collaborationSocket.startTyping(roomId),
  stopTyping: (roomId?: string) => collaborationSocket.stopTyping(roomId),
  isConnected: () => collaborationSocket.isConnected(),
  getConnectionStats: () => collaborationSocket.getConnectionStats(),
  on: (event: string, listener: (...args: any[]) => void) => collaborationSocket.on(event, listener),
  off: (event: string, listener: (...args: any[]) => void) => collaborationSocket.off(event, listener),
};

export default collaborationSocket;