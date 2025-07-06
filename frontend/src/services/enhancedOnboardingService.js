/**
 * Enhanced Onboarding Service - Frontend integration with new backend APIs
 * Connects to the enhanced onboarding backend with database persistence and analytics
 */

class EnhancedOnboardingService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.apiPrefix = '/api/v1/onboarding';
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Handle API responses with error handling
   */
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Get user onboarding status with database persistence
   */
  async getOnboardingStatus() {
    try {
      const response = await fetch(`${this.baseURL}${this.apiPrefix}/status`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to get onboarding status:', error);
      // Fallback to simplified endpoint for testing
      try {
        const userId = this.getCurrentUserId();
        const fallbackResponse = await fetch(`${this.baseURL}${this.apiPrefix}/simple/status?user_id=${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        return await this.handleResponse(fallbackResponse);
      } catch (fallbackError) {
        console.error('Fallback request also failed:', fallbackError);
        return this.getDefaultOnboardingStatus();
      }
    }
  }

  /**
   * Update onboarding step with analytics tracking
   */
  async updateOnboardingStep(stepId, stepData = null, analyticsData = null) {
    const payload = {
      step_id: stepId,
      data: stepData
    };

    try {
      const response = await fetch(`${this.baseURL}${this.apiPrefix}/step`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          step_update: payload,
          analytics_data: analyticsData
        })
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to update onboarding step:', error);
      // Fallback to simplified endpoint
      try {
        const userId = this.getCurrentUserId();
        const fallbackResponse = await fetch(`${this.baseURL}${this.apiPrefix}/simple/step`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            step_update: payload
          })
        });
        return await this.handleResponse(fallbackResponse);
      } catch (fallbackError) {
        console.error('Fallback step update failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * Update user preferences during onboarding
   */
  async updateUserPreferences(preferences) {
    const payload = {
      preferences: preferences
    };

    try {
      const response = await fetch(`${this.baseURL}${this.apiPrefix}/preferences`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  /**
   * Get user completion metrics
   */
  async getUserMetrics() {
    try {
      const response = await fetch(`${this.baseURL}${this.apiPrefix}/metrics`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to get user metrics:', error);
      return {
        user_id: this.getCurrentUserId(),
        completion_percentage: 0,
        completed_steps: 0,
        total_steps: 6,
        is_completed: false,
        time_to_complete: null
      };
    }
  }

  /**
   * Get comprehensive dashboard data for onboarding integration
   */
  async getDashboardData() {
    try {
      const response = await fetch(`${this.baseURL}${this.apiPrefix}/dashboard-data`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      // Fallback to simplified endpoint
      try {
        const userId = this.getCurrentUserId();
        const fallbackResponse = await fetch(`${this.baseURL}${this.apiPrefix}/simple/dashboard-data?user_id=${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        return await this.handleResponse(fallbackResponse);
      } catch (fallbackError) {
        console.error('Fallback dashboard data failed:', fallbackError);
        return this.getDefaultDashboardData();
      }
    }
  }

  /**
   * Save user feedback for onboarding experience
   */
  async saveUserFeedback(rating, feedbackText = null, stepId = null, feedbackCategories = {}) {
    const payload = {
      rating: rating,
      feedback_text: feedbackText,
      step_id: stepId,
      ...feedbackCategories
    };

    try {
      const response = await fetch(`${this.baseURL}${this.apiPrefix}/feedback`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to save user feedback:', error);
      throw error;
    }
  }

  /**
   * Track analytics for onboarding interactions
   */
  trackStepAnalytics(stepId, analyticsData = {}) {
    const defaultAnalytics = {
      clicks_count: 0,
      form_submissions: 0,
      help_requests: 0,
      skip_actions: 0,
      device_type: this.getDeviceType(),
      browser_info: this.getBrowserInfo(),
      screen_resolution: this.getScreenResolution(),
      interaction_data: {},
      errors_encountered: []
    };

    return {
      ...defaultAnalytics,
      ...analyticsData,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Complete onboarding process
   */
  async completeOnboarding(finalData) {
    try {
      // Update final step
      await this.updateOnboardingStep('final_summary', finalData);
      
      // Get final status
      const status = await this.getOnboardingStatus();
      
      // Track completion analytics
      this.trackOnboardingCompletion(finalData);
      
      return status;
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  }

  /**
   * Get analytics for the current user
   */
  async getOnboardingAnalytics(periodDays = 30) {
    try {
      const response = await fetch(`${this.baseURL}${this.apiPrefix}/analytics?period_days=${periodDays}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to get onboarding analytics:', error);
      return {
        period_days: periodDays,
        total_steps_attempted: 0,
        total_steps_completed: 0,
        overall_completion_rate: 0,
        average_time_per_step_seconds: 0,
        step_metrics: {},
        user_count: 1
      };
    }
  }

  // Utility methods
  getCurrentUserId() {
    // Try to get user ID from token or localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user_id || payload.sub || 1;
      } catch (e) {
        console.warn('Failed to parse token for user ID');
      }
    }
    return 1; // Default fallback
  }

  getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  getBrowserInfo() {
    return navigator.userAgent;
  }

  getScreenResolution() {
    return `${screen.width}x${screen.height}`;
  }

  getDefaultOnboardingStatus() {
    return {
      user_id: this.getCurrentUserId().toString(),
      current_step_id: 'welcome',
      completed_all: false,
      last_updated: new Date().toISOString(),
      steps: [
        { step_id: 'welcome', completed: false, data: null },
        { step_id: 'profile_info', completed: false, data: null },
        { step_id: 'goal_setting', completed: false, data: null },
        { step_id: 'preferences', completed: false, data: null },
        { step_id: 'features', completed: false, data: null },
        { step_id: 'final_summary', completed: false, data: null }
      ],
      preferences: {}
    };
  }

  getDefaultDashboardData() {
    return {
      user_insights: {
        onboarding_status: 'not_started',
        completion_percentage: 0,
        current_step: 'welcome',
        time_spent_total: 0,
        steps_completed: 0,
        total_steps: 6,
        user_preferences: {},
        completion_date: null,
        started_date: null
      },
      platform_insights: {
        overall_completion_rate: 0.75,
        average_completion_time: 15,
        most_challenging_step: 'goal_setting',
        user_satisfaction: 4.2
      },
      recommendations: [
        'Start your onboarding journey to unlock all platform features'
      ],
      next_actions: [
        'Begin onboarding process'
      ]
    };
  }

  // Analytics helpers (compatible with existing onboardingService.js)
  trackOnboardingStep(step, data = {}) {
    console.log(`Onboarding step: ${step}`, data);
    
    if (typeof window !== 'undefined' && /** @type {any} */ (window).gtag) {
      /** @type {any} */ (window).gtag('event', 'onboarding_step', {
        step_name: step,
        ...data
      });
    }
  }

  trackOnboardingCompletion(data) {
    console.log('Onboarding completed', data);
    
    if (typeof window !== 'undefined' && /** @type {any} */ (window).gtag) {
      /** @type {any} */ (window).gtag('event', 'onboarding_complete', {
        goals_count: data.goals?.primaryGoals?.length || 0,
        features_enabled: data.features?.enabledFeatures?.length || 0,
        notification_frequency: data.preferences?.notifications?.frequency || 'moderate'
      });
    }
  }

  // Validation helpers (compatible with existing onboardingService.js)
  validateProfileData(profile) {
    const errors = [];
    
    if (!profile.displayName || profile.displayName.trim().length < 2) {
      errors.push('Display name must be at least 2 characters long');
    }
    
    if (!profile.role) {
      errors.push('Please select your role');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateGoalsData(goals) {
    const errors = [];
    
    if (!goals.primaryGoals || goals.primaryGoals.length === 0) {
      errors.push('Please select at least one primary goal');
    }
    
    if (goals.productivityTargets) {
      const { dailyHours, focusTime, breakFrequency } = goals.productivityTargets;
      
      if (dailyHours < 1 || dailyHours > 16) {
        errors.push('Daily work hours must be between 1 and 16');
      }
      
      if (focusTime < 1 || focusTime > dailyHours) {
        errors.push('Focus time must be between 1 and your daily work hours');
      }
      
      if (breakFrequency < 1 || breakFrequency > 10) {
        errors.push('Break frequency must be between 1 and 10');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Feature recommendations based on role (compatible with existing onboardingService.js)
  getRecommendedFeatures(role) {
    const recommendations = {
      developer: ['productivity-tracking', 'time-tracking', 'automation'],
      designer: ['productivity-tracking', 'collaboration', 'insights-ai'],
      manager: ['goal-management', 'collaboration', 'insights-ai'],
      analyst: ['productivity-tracking', 'insights-ai', 'time-tracking'],
      consultant: ['time-tracking', 'goal-management', 'collaboration'],
      researcher: ['productivity-tracking', 'insights-ai', 'goal-management'],
      default: ['productivity-tracking', 'goal-management']
    };

    return recommendations[role] || recommendations.default;
  }

  // Local storage helpers for offline support (compatible with existing onboardingService.js)
  saveOnboardingDataLocally(data) {
    try {
      localStorage.setItem('onboardingData', JSON.stringify(data));
      localStorage.setItem('onboardingCompleted', 'true');
      return true;
    } catch (error) {
      console.error('Failed to save onboarding data locally:', error);
      return false;
    }
  }

  getLocalOnboardingData() {
    try {
      const data = localStorage.getItem('onboardingData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get local onboarding data:', error);
      return null;
    }
  }

  isOnboardingCompleted() {
    return localStorage.getItem('onboardingCompleted') === 'true';
  }

  clearOnboardingData() {
    localStorage.removeItem('onboardingData');
    localStorage.removeItem('onboardingCompleted');
  }
}

export default new EnhancedOnboardingService();