/**
 * Conversion Tracking Service
 * Tracks user interactions and conversion events throughout the guest journey
 */

class ConversionTrackingService {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
    this.isEnabled = true;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Track conversion events
  trackEvent(eventType, data = {}) {
    if (!this.isEnabled) return;

    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      eventType,
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionDuration: Date.now() - this.startTime.getTime()
      }
    };

    this.events.push(event);
    this.sendToAnalytics(event);
    this.updateLocalStorage();

    // Log for development
    console.log('🎯 Conversion Event:', event);
  }

  generateEventId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Send event to analytics backend
  async sendToAnalytics(event) {
    try {
      // In production, this would send to your analytics service
      // For now, we'll use a mock endpoint or local storage
      
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/analytics/conversion-events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event)
        });
      }
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  // Update local storage for persistence
  updateLocalStorage() {
    try {
      const storageData = {
        sessionId: this.sessionId,
        events: this.events.slice(-50), // Keep last 50 events
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('digame_conversion_tracking', JSON.stringify(storageData));
    } catch (error) {
      console.warn('Failed to update local storage:', error);
    }
  }

  // Get conversion metrics
  getConversionMetrics() {
    const totalEvents = this.events.length;
    const uniqueEventTypes = [...new Set(this.events.map(e => e.eventType))];
    const sessionDuration = Date.now() - this.startTime.getTime();
    
    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore();
    
    // Get conversion funnel data
    const funnelData = this.getFunnelData();
    
    return {
      sessionId: this.sessionId,
      totalEvents,
      uniqueEventTypes: uniqueEventTypes.length,
      sessionDuration,
      engagementScore,
      funnelData,
      events: this.events
    };
  }

  calculateEngagementScore() {
    const weights = {
      'GUEST_JOURNEY_START': 10,
      'ROLE_SELECTED': 20,
      'FEATURE_EXPLORED': 15,
      'HUB_PAGE_VISITED': 25,
      'CONVERSION_POINT_REACHED': 30,
      'SIGNUP_INITIATED': 50,
      'SIGNUP_COMPLETED': 100
    };

    let score = 0;
    this.events.forEach(event => {
      score += weights[event.eventType] || 5;
    });

    // Normalize to 0-100 scale
    return Math.min(100, Math.round(score / 10));
  }

  getFunnelData() {
    const funnelSteps = [
      'GUEST_JOURNEY_START',
      'ROLE_SELECTED',
      'FEATURE_EXPLORED',
      'HUB_PAGE_VISITED',
      'CONVERSION_POINT_REACHED',
      'SIGNUP_INITIATED',
      'SIGNUP_COMPLETED'
    ];

    const funnelData = {};
    funnelSteps.forEach(step => {
      funnelData[step] = this.events.filter(e => e.eventType === step).length;
    });

    return funnelData;
  }

  // Get feature exploration analytics
  getFeatureAnalytics() {
    const featureEvents = this.events.filter(e => e.eventType === 'FEATURE_EXPLORED');
    const hubPageEvents = this.events.filter(e => e.eventType === 'HUB_PAGE_VISITED');
    
    const exploredFeatures = featureEvents.map(e => ({
      featureId: e.data.featureId,
      featureName: e.data.featureName,
      timestamp: e.timestamp,
      roleContext: e.data.roleContext
    }));

    const visitedPages = hubPageEvents.map(e => ({
      path: e.data.path,
      featureName: e.data.featureName,
      timestamp: e.timestamp,
      roleContext: e.data.roleContext
    }));

    return {
      exploredFeatures,
      visitedPages,
      totalFeatureInteractions: featureEvents.length,
      totalPageVisits: hubPageEvents.length,
      averageTimePerFeature: this.calculateAverageTimePerFeature()
    };
  }

  calculateAverageTimePerFeature() {
    const featureEvents = this.events.filter(e => e.eventType === 'FEATURE_EXPLORED');
    if (featureEvents.length < 2) return 0;

    let totalTime = 0;
    for (let i = 1; i < featureEvents.length; i++) {
      const timeDiff = new Date(featureEvents[i].timestamp) - new Date(featureEvents[i-1].timestamp);
      totalTime += timeDiff;
    }

    return Math.round(totalTime / (featureEvents.length - 1) / 1000); // Return in seconds
  }

  // Get conversion probability
  getConversionProbability() {
    const metrics = this.getConversionMetrics();
    const featureAnalytics = this.getFeatureAnalytics();
    
    let probability = 0;
    
    // Base probability factors
    if (metrics.funnelData.ROLE_SELECTED > 0) probability += 20;
    if (featureAnalytics.totalFeatureInteractions >= 3) probability += 25;
    if (featureAnalytics.totalFeatureInteractions >= 5) probability += 20;
    if (featureAnalytics.totalPageVisits >= 2) probability += 15;
    if (metrics.sessionDuration > 300000) probability += 10; // 5+ minutes
    if (metrics.funnelData.CONVERSION_POINT_REACHED > 0) probability += 10;
    
    return Math.min(100, probability);
  }

  // Load previous session data
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('digame_conversion_tracking');
      if (stored) {
        const data = JSON.parse(stored);
        // Only load if session is recent (within 24 hours)
        const lastUpdated = new Date(data.lastUpdated);
        const now = new Date();
        const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          this.sessionId = data.sessionId;
          this.events = data.events || [];
        }
      }
    } catch (error) {
      console.warn('Failed to load from storage:', error);
    }
  }

  // Export data for analysis
  exportData() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      metrics: this.getConversionMetrics(),
      featureAnalytics: this.getFeatureAnalytics(),
      conversionProbability: this.getConversionProbability(),
      events: this.events
    };
  }

  // Clear tracking data
  clearData() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
    localStorage.removeItem('digame_conversion_tracking');
  }

  // Disable tracking
  disable() {
    this.isEnabled = false;
  }

  // Enable tracking
  enable() {
    this.isEnabled = true;
  }
}

// Create singleton instance
const conversionTrackingService = new ConversionTrackingService();

// Load previous session data on initialization
conversionTrackingService.loadFromStorage();

export { conversionTrackingService };
export default conversionTrackingService;