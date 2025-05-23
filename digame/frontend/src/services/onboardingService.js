/**
 * Onboarding Service
 * Handles user onboarding flow data and API integration
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class OnboardingService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Save onboarding data to user profile
   * @param {Object} onboardingData - Complete onboarding data
   * @returns {Promise<Object>} API response
   */
  async saveOnboardingData(onboardingData) {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${this.baseURL}/auth/me/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          goals: onboardingData.goals,
          work_style: onboardingData.workStyle,
          skill_level: onboardingData.skillLevel,
          focus_areas: onboardingData.focusAreas,
          preferences: onboardingData.preferences,
          onboarding_completed: true,
          completed_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw error;
    }
  }

  /**
   * Get user's onboarding status
   * @returns {Promise<Object>} Onboarding status and data
   */
  async getOnboardingStatus() {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${this.baseURL}/auth/me/onboarding`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      throw error;
    }
  }

  /**
   * Initialize user's behavioral model based on onboarding data
   * @param {Object} onboardingData - Onboarding data
   * @returns {Promise<Object>} Behavioral model initialization response
   */
  async initializeBehavioralModel(onboardingData) {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${this.baseURL}/behavior/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          work_style: onboardingData.workStyle,
          skill_level: onboardingData.skillLevel,
          focus_areas: onboardingData.focusAreas,
          goals: onboardingData.goals
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error initializing behavioral model:', error);
      throw error;
    }
  }

  /**
   * Create initial goals based on onboarding selections
   * @param {Array} goals - Selected goal IDs
   * @returns {Promise<Object>} Goals creation response
   */
  async createInitialGoals(goals) {
    try {
      const token = localStorage.getItem('access_token');
      
      const goalTemplates = {
        'productivity': {
          title: 'Increase Daily Productivity',
          description: 'Improve focus time and task completion rate',
          target_value: 85,
          metric_type: 'percentage',
          deadline: this.getDateInDays(90)
        },
        'skills': {
          title: 'Develop New Skills',
          description: 'Complete learning modules and skill assessments',
          target_value: 3,
          metric_type: 'count',
          deadline: this.getDateInDays(180)
        },
        'leadership': {
          title: 'Build Leadership Skills',
          description: 'Improve team collaboration and communication',
          target_value: 80,
          metric_type: 'percentage',
          deadline: this.getDateInDays(120)
        },
        'collaboration': {
          title: 'Enhance Team Collaboration',
          description: 'Increase team interaction quality and frequency',
          target_value: 90,
          metric_type: 'percentage',
          deadline: this.getDateInDays(60)
        },
        'work-life': {
          title: 'Improve Work-Life Balance',
          description: 'Maintain healthy work hours and break patterns',
          target_value: 8,
          metric_type: 'hours',
          deadline: this.getDateInDays(30)
        },
        'career': {
          title: 'Advance Career Development',
          description: 'Complete career milestone objectives',
          target_value: 5,
          metric_type: 'count',
          deadline: this.getDateInDays(365)
        },
        'efficiency': {
          title: 'Optimize Workflow Efficiency',
          description: 'Reduce time spent on routine tasks',
          target_value: 25,
          metric_type: 'percentage',
          deadline: this.getDateInDays(90)
        },
        'networking': {
          title: 'Expand Professional Network',
          description: 'Connect with new professionals in your field',
          target_value: 20,
          metric_type: 'count',
          deadline: this.getDateInDays(180)
        }
      };

      const goalsToCreate = goals.map(goalId => goalTemplates[goalId]).filter(Boolean);

      const response = await fetch(`${this.baseURL}/goals/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ goals: goalsToCreate })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating initial goals:', error);
      throw error;
    }
  }

  /**
   * Generate personalized dashboard configuration
   * @param {Object} onboardingData - Complete onboarding data
   * @returns {Object} Dashboard configuration
   */
  generateDashboardConfig(onboardingData) {
    const config = {
      widgets: [],
      layout: 'default',
      theme: 'professional'
    };

    // Add widgets based on goals
    if (onboardingData.goals.includes('productivity')) {
      config.widgets.push({
        type: 'productivity-chart',
        position: { row: 1, col: 1, span: 2 },
        priority: 'high'
      });
    }

    if (onboardingData.goals.includes('skills')) {
      config.widgets.push({
        type: 'learning-progress',
        position: { row: 1, col: 3, span: 1 },
        priority: 'high'
      });
    }

    if (onboardingData.goals.includes('collaboration')) {
      config.widgets.push({
        type: 'team-insights',
        position: { row: 2, col: 1, span: 1 },
        priority: 'medium'
      });
    }

    // Add work style specific widgets
    if (onboardingData.workStyle === 'focused') {
      config.widgets.push({
        type: 'focus-time-tracker',
        position: { row: 2, col: 2, span: 1 },
        priority: 'high'
      });
    }

    if (onboardingData.workStyle === 'collaborative') {
      config.widgets.push({
        type: 'collaboration-metrics',
        position: { row: 2, col: 2, span: 1 },
        priority: 'high'
      });
    }

    // Always include essential widgets
    config.widgets.push(
      {
        type: 'goal-progress',
        position: { row: 3, col: 1, span: 2 },
        priority: 'high'
      },
      {
        type: 'recent-insights',
        position: { row: 3, col: 3, span: 1 },
        priority: 'medium'
      },
      {
        type: 'quick-actions',
        position: { row: 4, col: 1, span: 1 },
        priority: 'medium'
      }
    );

    return config;
  }

  /**
   * Track onboarding analytics
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  async trackOnboardingEvent(event, data = {}) {
    try {
      const token = localStorage.getItem('access_token');
      
      await fetch(`${this.baseURL}/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          event_type: 'onboarding',
          event_name: event,
          event_data: data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error tracking onboarding event:', error);
      // Don't throw error for analytics failures
    }
  }

  /**
   * Get recommended learning content based on onboarding data
   * @param {Object} onboardingData - Onboarding data
   * @returns {Promise<Array>} Recommended content
   */
  async getRecommendedContent(onboardingData) {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${this.baseURL}/recommendations/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          goals: onboardingData.goals,
          skill_level: onboardingData.skillLevel,
          focus_areas: onboardingData.focusAreas,
          work_style: onboardingData.workStyle
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recommended content:', error);
      // Return fallback recommendations
      return this.getFallbackRecommendations(onboardingData);
    }
  }

  /**
   * Get fallback recommendations when API is unavailable
   * @param {Object} onboardingData - Onboarding data
   * @returns {Array} Fallback recommendations
   */
  getFallbackRecommendations(onboardingData) {
    const recommendations = [];

    if (onboardingData.goals.includes('productivity')) {
      recommendations.push({
        type: 'article',
        title: 'Time Management Techniques for Professionals',
        description: 'Learn proven strategies to boost your daily productivity',
        estimated_time: '15 min read',
        priority: 'high'
      });
    }

    if (onboardingData.goals.includes('skills')) {
      recommendations.push({
        type: 'course',
        title: 'Professional Development Fundamentals',
        description: 'Essential skills for career advancement',
        estimated_time: '2 hours',
        priority: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Helper method to get date in specified number of days
   * @param {number} days - Number of days from now
   * @returns {string} ISO date string
   */
  getDateInDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Validate onboarding data before submission
   * @param {Object} data - Onboarding data to validate
   * @returns {Object} Validation result
   */
  validateOnboardingData(data) {
    const errors = [];

    if (!data.goals || data.goals.length === 0) {
      errors.push('At least one goal must be selected');
    }

    if (!data.workStyle) {
      errors.push('Work style must be selected');
    }

    if (!data.skillLevel) {
      errors.push('Skill level must be selected');
    }

    if (!data.focusAreas || data.focusAreas.length === 0) {
      errors.push('At least one focus area must be selected');
    }

    if (data.focusAreas && data.focusAreas.length > 5) {
      errors.push('Maximum 5 focus areas can be selected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new OnboardingService();