class OnboardingService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }

  async saveOnboardingData(data) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      throw error;
    }
  }

  async getOnboardingStatus() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/api/onboarding/status`, {
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
      console.error('Failed to get onboarding status:', error);
      return { completed: false };
    }
  }

  async updateUserPreferences(preferences) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/api/user/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  async createUserGoals(goals) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/api/user/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(goals)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create user goals:', error);
      throw error;
    }
  }

  // Local storage helpers for offline support
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

  // Analytics helpers
  trackOnboardingStep(step, data = {}) {
    // Track onboarding progress for analytics
    console.log(`Onboarding step: ${step}`, data);
    
    // You can integrate with analytics services here
    if (window.gtag) {
      window.gtag('event', 'onboarding_step', {
        step_name: step,
        ...data
      });
    }
  }

  trackOnboardingCompletion(data) {
    console.log('Onboarding completed', data);
    
    if (window.gtag) {
      window.gtag('event', 'onboarding_complete', {
        goals_count: data.goals?.primaryGoals?.length || 0,
        features_enabled: data.features?.enabledFeatures?.length || 0,
        notification_frequency: data.preferences?.notifications?.frequency || 'moderate'
      });
    }
  }

  // Validation helpers
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

  // Default data generators
  getDefaultOnboardingData(user = {}) {
    return {
      profile: {
        displayName: user.name || '',
        role: '',
        department: '',
        experience: '',
        avatar: user.avatar || null
      },
      goals: {
        primaryGoals: [],
        productivityTargets: {
          dailyHours: 8,
          focusTime: 4,
          breakFrequency: 2
        },
        learningObjectives: []
      },
      preferences: {
        notifications: {
          productivity: true,
          achievements: true,
          reminders: true,
          frequency: 'moderate'
        },
        dashboard: {
          defaultView: 'overview',
          widgets: ['productivity', 'goals', 'insights'],
          theme: 'light'
        },
        privacy: {
          dataSharing: false,
          analytics: true,
          publicProfile: false
        }
      },
      features: {
        enabledFeatures: ['productivity-tracking', 'goal-management'],
        interestedFeatures: []
      }
    };
  }

  // Feature recommendations based on role
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
}

export default new OnboardingService();