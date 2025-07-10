const { EventEmitter } = require('events');
const WebSocket = require('ws');
const { performance } = require('perf_hooks');
const databaseService = require('./database');
const { intelligentCacheManager } = require('./intelligentCacheManager');

/**
 * Event Streaming Service
 * Real-time event streaming and WebSocket management for Platform Owner features
 */
class EventStreamingService extends EventEmitter {
    constructor() {
        super();
        this.eventBus = new EventEmitter();
        this.streamProcessors = new Map();
        this.eventBuffer = new Map();
        this.processingQueues = new Map();
        this.websocketClients = new Map();
        this.subscriptions = new Map();
        this.streamMetrics = new Map();
        
        // Performance tracking
        this.performanceMetrics = {
            eventsStreamed: 0,
            clientsConnected: 0,
            averageLatency: 0,
            throughput: 0,
            errorRate: 0
        };
        
        // Configuration
        this.config = {
            bufferSize: 5000,
            flushInterval: 1000, // 1 second
            maxClients: 10000,
            heartbeatInterval: 30000, // 30 seconds
            compressionThreshold: 1024, // 1KB
            rateLimitPerSecond: 100
        };
        
        this.initializeStreamProcessors();
        this.startEventProcessing();
        this.startHeartbeat();
        
        console.log('🌊 EventStreamingService initialized with real-time streaming capabilities');
    }

    /**
     * Initialize stream processors for different event types
     */
    initializeStreamProcessors() {
        // Platform metrics processor
        this.streamProcessors.set('platform_metrics', {
            process: async (event) => {
                return await this.processPlatformMetricsEvent(event);
            },
            subscribers: new Set(),
            rateLimits: new Map()
        });

        // User activity processor
        this.streamProcessors.set('user_activity', {
            process: async (event) => {
                return await this.processUserActivityEvent(event);
            },
            subscribers: new Set(),
            rateLimits: new Map()
        });

        // System alerts processor
        this.streamProcessors.set('system_alerts', {
            process: async (event) => {
                return await this.processSystemAlertsEvent(event);
            },
            subscribers: new Set(),
            rateLimits: new Map()
        });

        // Security events processor
        this.streamProcessors.set('security_events', {
            process: async (event) => {
                return await this.processSecurityEvent(event);
            },
            subscribers: new Set(),
            rateLimits: new Map()
        });

        // Business intelligence processor
        this.streamProcessors.set('business_intelligence', {
            process: async (event) => {
                return await this.processBusinessIntelligenceEvent(event);
            },
            subscribers: new Set(),
            rateLimits: new Map()
        });
    }

    /**
     * Stream platform-wide events
     */
    async streamPlatformEvent(eventType, eventData, options = {}) {
        const startTime = performance.now();
        
        try {
            const enrichedEvent = {
                ...eventData,
                eventId: this.generateEventId(),
                eventType,
                timestamp: new Date().toISOString(),
                platformContext: await this.getPlatformContext(),
                metadata: {
                    source: options.source || 'platform',
                    priority: options.priority || 'normal',
                    tags: options.tags || []
                }
            };

            // Immediate processing for critical events
            if (this.isCriticalEvent(eventType, enrichedEvent)) {
                await this.processCriticalEvent(eventType, enrichedEvent);
            }

            // Stream to real-time processors
            await this.processStreamEvent(eventType, enrichedEvent);
            
            // Buffer for batch processing
            this.bufferEvent(eventType, enrichedEvent);
            
            // Stream to WebSocket clients
            await this.streamToClients(eventType, enrichedEvent);
            
            // Update performance metrics
            const latency = performance.now() - startTime;
            this.updateStreamingMetrics(eventType, latency, true);
            
            // Emit processed event
            this.emit('event_streamed', {
                eventType,
                eventId: enrichedEvent.eventId,
                latency,
                clientCount: this.getSubscriberCount(eventType)
            });

            return enrichedEvent;

        } catch (error) {
            const latency = performance.now() - startTime;
            this.updateStreamingMetrics(eventType, latency, false);
            
            console.error(`Error streaming ${eventType} event:`, error);
            this.emit('streaming_error', { eventType, error: error.message });
            
            throw error;
        }
    }

    /**
     * Process stream events through registered processors
     */
    async processStreamEvent(eventType, event) {
        const processor = this.streamProcessors.get(eventType);
        if (!processor) {
            console.warn(`No processor found for event type: ${eventType}`);
            return;
        }

        try {
            const processedEvent = await processor.process(event);
            
            // Update stream metrics
            this.updateProcessorMetrics(eventType, processedEvent);
            
            // Emit to event bus
            this.eventBus.emit(eventType, processedEvent);
            
            return processedEvent;

        } catch (error) {
            console.error(`Error processing ${eventType} event:`, error);
            throw error;
        }
    }

    /**
     * Stream to WebSocket clients
     */
    async streamToClients(eventType, event) {
        const processor = this.streamProcessors.get(eventType);
        if (!processor || processor.subscribers.size === 0) {
            return;
        }

        const message = {
            type: 'event_update',
            eventType,
            data: await this.optimizeForTransmission(event),
            timestamp: new Date().toISOString()
        };

        const messageStr = JSON.stringify(message);
        const shouldCompress = messageStr.length > this.config.compressionThreshold;

        // Stream to all subscribers
        for (const clientId of processor.subscribers) {
            const client = this.websocketClients.get(clientId);
            if (client && client.ws.readyState === WebSocket.OPEN) {
                try {
                    // Check rate limits
                    if (this.checkRateLimit(clientId, eventType)) {
                        if (shouldCompress) {
                            // Send compressed data for large messages
                            client.ws.send(await this.compressMessage(messageStr));
                        } else {
                            client.ws.send(messageStr);
                        }
                        
                        client.lastActivity = Date.now();
                        client.messagesSent++;
                    }
                } catch (error) {
                    console.error(`Error sending to client ${clientId}:`, error);
                    this.removeClient(clientId);
                }
            }
        }
    }

    /**
     * Real-time dashboard updates
     */
    async streamToDashboard(dashboardType, data, options = {}) {
        const eventType = `dashboard_${dashboardType}`;
        
        try {
            const optimizedData = await this.optimizeForTransmission(data);
            const clients = this.getWebSocketClients(dashboardType);
            
            const message = {
                type: 'dashboard_update',
                dashboardType,
                data: optimizedData,
                timestamp: new Date().toISOString(),
                metadata: {
                    updateId: this.generateUpdateId(),
                    priority: options.priority || 'normal',
                    partial: options.partial || false
                }
            };

            const messageStr = JSON.stringify(message);
            let successCount = 0;
            let errorCount = 0;

            for (const client of clients) {
                try {
                    if (client.ws.readyState === WebSocket.OPEN) {
                        client.ws.send(messageStr);
                        successCount++;
                        client.lastActivity = Date.now();
                    }
                } catch (error) {
                    errorCount++;
                    console.error(`Error streaming to dashboard client:`, error);
                }
            }

            // Update metrics
            this.performanceMetrics.eventsStreamed++;
            
            return {
                dashboardType,
                clientsReached: successCount,
                errors: errorCount,
                dataSize: messageStr.length
            };

        } catch (error) {
            console.error(`Error streaming to ${dashboardType} dashboard:`, error);
            throw error;
        }
    }

    /**
     * WebSocket client management
     */
    addWebSocketClient(ws, clientInfo = {}) {
        const clientId = this.generateClientId();
        
        const client = {
            id: clientId,
            ws,
            subscriptions: new Set(),
            lastActivity: Date.now(),
            connectedAt: Date.now(),
            messagesSent: 0,
            messagesReceived: 0,
            userAgent: clientInfo.userAgent,
            ipAddress: clientInfo.ipAddress,
            userId: clientInfo.userId,
            dashboardType: clientInfo.dashboardType
        };

        this.websocketClients.set(clientId, client);
        this.performanceMetrics.clientsConnected++;

        // Set up WebSocket event handlers
        ws.on('message', (message) => {
            this.handleClientMessage(clientId, message);
        });

        ws.on('close', () => {
            this.removeClient(clientId);
        });

        ws.on('error', (error) => {
            console.error(`WebSocket error for client ${clientId}:`, error);
            this.removeClient(clientId);
        });

        // Send welcome message
        this.sendToClient(clientId, {
            type: 'connection_established',
            clientId,
            timestamp: new Date().toISOString(),
            availableStreams: Array.from(this.streamProcessors.keys())
        });

        console.log(`WebSocket client ${clientId} connected`);
        return clientId;
    }

    /**
     * Remove WebSocket client
     */
    removeClient(clientId) {
        const client = this.websocketClients.get(clientId);
        if (!client) return;

        // Remove from all subscriptions
        for (const eventType of client.subscriptions) {
            const processor = this.streamProcessors.get(eventType);
            if (processor) {
                processor.subscribers.delete(clientId);
            }
        }

        // Remove from client map
        this.websocketClients.delete(clientId);
        this.performanceMetrics.clientsConnected--;

        console.log(`WebSocket client ${clientId} disconnected`);
    }

    /**
     * Handle client messages (subscriptions, unsubscriptions, etc.)
     */
    handleClientMessage(clientId, message) {
        const client = this.websocketClients.get(clientId);
        if (!client) return;

        try {
            const data = JSON.parse(message);
            client.messagesReceived++;
            client.lastActivity = Date.now();

            switch (data.type) {
                case 'subscribe':
                    this.subscribeClient(clientId, data.eventType);
                    break;
                case 'unsubscribe':
                    this.unsubscribeClient(clientId, data.eventType);
                    break;
                case 'ping':
                    this.sendToClient(clientId, { type: 'pong', timestamp: new Date().toISOString() });
                    break;
                case 'get_metrics':
                    this.sendToClient(clientId, { 
                        type: 'metrics_response', 
                        metrics: this.getClientMetrics(clientId) 
                    });
                    break;
                default:
                    console.warn(`Unknown message type from client ${clientId}:`, data.type);
            }

        } catch (error) {
            console.error(`Error handling message from client ${clientId}:`, error);
        }
    }

    /**
     * Subscribe client to event stream
     */
    subscribeClient(clientId, eventType) {
        const client = this.websocketClients.get(clientId);
        const processor = this.streamProcessors.get(eventType);
        
        if (!client || !processor) {
            console.warn(`Cannot subscribe client ${clientId} to ${eventType}`);
            return;
        }

        client.subscriptions.add(eventType);
        processor.subscribers.add(clientId);

        this.sendToClient(clientId, {
            type: 'subscription_confirmed',
            eventType,
            timestamp: new Date().toISOString()
        });

        console.log(`Client ${clientId} subscribed to ${eventType}`);
    }

    /**
     * Unsubscribe client from event stream
     */
    unsubscribeClient(clientId, eventType) {
        const client = this.websocketClients.get(clientId);
        const processor = this.streamProcessors.get(eventType);
        
        if (!client || !processor) return;

        client.subscriptions.delete(eventType);
        processor.subscribers.delete(clientId);

        this.sendToClient(clientId, {
            type: 'unsubscription_confirmed',
            eventType,
            timestamp: new Date().toISOString()
        });

        console.log(`Client ${clientId} unsubscribed from ${eventType}`);
    }

    /**
     * Send message to specific client
     */
    sendToClient(clientId, message) {
        const client = this.websocketClients.get(clientId);
        if (!client || client.ws.readyState !== WebSocket.OPEN) {
            return false;
        }

        try {
            client.ws.send(JSON.stringify(message));
            client.messagesSent++;
            return true;
        } catch (error) {
            console.error(`Error sending to client ${clientId}:`, error);
            this.removeClient(clientId);
            return false;
        }
    }

    /**
     * Event processing methods
     */
    async processPlatformMetricsEvent(event) {
        return {
            ...event,
            processed: true,
            processingTime: Date.now(),
            enrichments: {
                trend: await this.calculateMetricTrend(event),
                anomaly: await this.detectMetricAnomaly(event),
                forecast: await this.generateMetricForecast(event)
            }
        };
    }

    async processUserActivityEvent(event) {
        return {
            ...event,
            processed: true,
            processingTime: Date.now(),
            enrichments: {
                sessionContext: await this.getSessionContext(event.userId),
                behaviorPattern: await this.analyzeBehaviorPattern(event),
                engagementScore: await this.calculateEngagementScore(event)
            }
        };
    }

    async processSystemAlertsEvent(event) {
        return {
            ...event,
            processed: true,
            processingTime: Date.now(),
            enrichments: {
                severity: this.calculateAlertSeverity(event),
                escalationPath: await this.determineEscalationPath(event),
                similarIncidents: await this.findSimilarIncidents(event)
            }
        };
    }

    async processSecurityEvent(event) {
        return {
            ...event,
            processed: true,
            processingTime: Date.now(),
            enrichments: {
                riskScore: await this.calculateSecurityRisk(event),
                threatIntelligence: await this.checkThreatIntelligence(event),
                responseActions: await this.generateResponseActions(event)
            }
        };
    }

    async processBusinessIntelligenceEvent(event) {
        return {
            ...event,
            processed: true,
            processingTime: Date.now(),
            enrichments: {
                businessImpact: await this.assessBusinessImpact(event),
                kpiImpact: await this.calculateKPIImpact(event),
                recommendations: await this.generateBusinessRecommendations(event)
            }
        };
    }

    /**
     * Utility methods
     */
    bufferEvent(eventType, event) {
        let buffer = this.eventBuffer.get(eventType);
        if (!buffer) {
            buffer = [];
            this.eventBuffer.set(eventType, buffer);
        }

        buffer.push(event);

        // Limit buffer size
        if (buffer.length > this.config.bufferSize) {
            buffer.shift();
        }
    }

    async optimizeForTransmission(data) {
        // Remove unnecessary fields for transmission
        const optimized = { ...data };
        delete optimized.internalMetadata;
        delete optimized.debugInfo;
        
        // Compress large arrays
        if (optimized.timeSeries && optimized.timeSeries.length > 100) {
            optimized.timeSeries = this.compressTimeSeries(optimized.timeSeries);
        }
        
        return optimized;
    }

    compressTimeSeries(timeSeries) {
        // Simple compression: keep every nth point for large datasets
        const compressionRatio = Math.ceil(timeSeries.length / 100);
        return timeSeries.filter((_, index) => index % compressionRatio === 0);
    }

    async compressMessage(message) {
        // Placeholder for message compression
        return message;
    }

    checkRateLimit(clientId, eventType) {
        const processor = this.streamProcessors.get(eventType);
        if (!processor) return false;

        const now = Date.now();
        const rateLimitKey = `${clientId}:${eventType}`;
        
        let rateLimit = processor.rateLimits.get(rateLimitKey);
        if (!rateLimit) {
            rateLimit = { count: 0, resetTime: now + 1000 };
            processor.rateLimits.set(rateLimitKey, rateLimit);
        }

        if (now > rateLimit.resetTime) {
            rateLimit.count = 0;
            rateLimit.resetTime = now + 1000;
        }

        if (rateLimit.count >= this.config.rateLimitPerSecond) {
            return false;
        }

        rateLimit.count++;
        return true;
    }

    getWebSocketClients(dashboardType) {
        const clients = [];
        for (const client of this.websocketClients.values()) {
            if (!dashboardType || client.dashboardType === dashboardType) {
                clients.push(client);
            }
        }
        return clients;
    }

    getSubscriberCount(eventType) {
        const processor = this.streamProcessors.get(eventType);
        return processor ? processor.subscribers.size : 0;
    }

    isCriticalEvent(eventType, event) {
        return event.metadata?.priority === 'critical' || 
               eventType === 'system_alerts' ||
               eventType === 'security_events';
    }

    async processCriticalEvent(eventType, event) {
        // Immediate processing for critical events
        console.log(`Processing critical event: ${eventType}`, event.eventId);
        
        // Store immediately
        await this.storeCriticalEvent(event);
        
        // Trigger immediate notifications
        await this.triggerCriticalNotifications(event);
    }

    startEventProcessing() {
        setInterval(async () => {
            await this.flushEventBuffers();
        }, this.config.flushInterval);
    }

    startHeartbeat() {
        setInterval(() => {
            this.sendHeartbeat();
            this.cleanupInactiveClients();
        }, this.config.heartbeatInterval);
    }

    sendHeartbeat() {
        const heartbeatMessage = {
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
            serverMetrics: this.getServerMetrics()
        };

        for (const client of this.websocketClients.values()) {
            if (client.ws.readyState === WebSocket.OPEN) {
                try {
                    client.ws.send(JSON.stringify(heartbeatMessage));
                } catch (error) {
                    console.error(`Error sending heartbeat to client ${client.id}:`, error);
                }
            }
        }
    }

    cleanupInactiveClients() {
        const now = Date.now();
        const inactivityThreshold = 5 * 60 * 1000; // 5 minutes

        for (const [clientId, client] of this.websocketClients) {
            if (now - client.lastActivity > inactivityThreshold) {
                console.log(`Removing inactive client: ${clientId}`);
                this.removeClient(clientId);
            }
        }
    }

    updateStreamingMetrics(eventType, latency, success) {
        this.performanceMetrics.eventsStreamed++;
        
        // Update average latency
        const currentAvg = this.performanceMetrics.averageLatency;
        const count = this.performanceMetrics.eventsStreamed;
        this.performanceMetrics.averageLatency = 
            (currentAvg * (count - 1) + latency) / count;

        // Update error rate
        if (!success) {
            this.performanceMetrics.errorRate = 
                (this.performanceMetrics.errorRate * 0.9) + (0.1 * 1);
        } else {
            this.performanceMetrics.errorRate = 
                this.performanceMetrics.errorRate * 0.99;
        }
    }

    updateProcessorMetrics(eventType, event) {
        let metrics = this.streamMetrics.get(eventType);
        if (!metrics) {
            metrics = {
                eventsProcessed: 0,
                lastProcessed: null,
                averageSize: 0
            };
            this.streamMetrics.set(eventType, metrics);
        }

        metrics.eventsProcessed++;
        metrics.lastProcessed = new Date().toISOString();
        
        const eventSize = JSON.stringify(event).length;
        metrics.averageSize = (metrics.averageSize * (metrics.eventsProcessed - 1) + eventSize) / metrics.eventsProcessed;
    }

    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateUpdateId() {
        return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async getPlatformContext() {
        return {
            platformVersion: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            region: process.env.REGION || 'us-east-1',
            timestamp: new Date().toISOString()
        };
    }

    getClientMetrics(clientId) {
        const client = this.websocketClients.get(clientId);
        if (!client) return null;

        return {
            clientId,
            connectedAt: client.connectedAt,
            lastActivity: client.lastActivity,
            messagesSent: client.messagesSent,
            messagesReceived: client.messagesReceived,
            subscriptions: Array.from(client.subscriptions),
            connectionDuration: Date.now() - client.connectedAt
        };
    }

    getServerMetrics() {
        return {
            connectedClients: this.websocketClients.size,
            eventsStreamed: this.performanceMetrics.eventsStreamed,
            averageLatency: this.performanceMetrics.averageLatency,
            errorRate: this.performanceMetrics.errorRate,
            activeProcessors: this.streamProcessors.size,
            uptime: process.uptime()
        };
    }

    /**
     * Get streaming service performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            connectedClients: this.websocketClients.size,
            activeStreams: this.streamProcessors.size,
            bufferedEvents: Array.from(this.eventBuffer.values()).reduce((sum, buffer) => sum + buffer.length, 0),
            streamMetrics: Object.fromEntries(this.streamMetrics)
        };
    }

    // Placeholder methods for specific processing logic
    async calculateMetricTrend(event) { return 'stable'; }
    async detectMetricAnomaly(event) { return false; }
    async generateMetricForecast(event) { return null; }
    async getSessionContext(userId) { return {}; }
    async analyzeBehaviorPattern(event) { return 'normal'; }
    async calculateEngagementScore(event) { return 0.75; }
    calculateAlertSeverity(event) { return 'medium'; }
    async determineEscalationPath(event) { return []; }
    async findSimilarIncidents(event) { return []; }
    async calculateSecurityRisk(event) { return 0.3; }
    async checkThreatIntelligence(event) { return {}; }
    async generateResponseActions(event) { return []; }
    async assessBusinessImpact(event) { return 'low'; }
    async calculateKPIImpact(event) { return {}; }
    async generateBusinessRecommendations(event) { return []; }
    async storeCriticalEvent(event) { /* Store in database */ }
    async triggerCriticalNotifications(event) { /* Send notifications */ }
    async flushEventBuffers() { /* Flush buffered events */ }
}

// Export singleton instance
const eventStreamingService = new EventStreamingService();

module.exports = {
    EventStreamingService,
    eventStreamingService
};