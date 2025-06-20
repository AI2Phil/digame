import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8000'; // Update this for production

class ApiService {
  static async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Dashboard Analytics
  static async getDashboardData() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      return await response.json();
    } catch (error) {
      console.error('Dashboard data error:', error);
      throw error;
    }
  }

  // Productivity Analytics
  static async getProductivityData(timeRange = '7d') {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/analytics/productivity?time_range=${timeRange}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch productivity data');
      }

      return await response.json();
    } catch (error) {
      console.error('Productivity data error:', error);
      throw error;
    }
  }

  // Activity Analytics
  static async getActivityBreakdown(timeRange = '7d') {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/analytics/activity-breakdown?time_range=${timeRange}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity breakdown');
      }

      return await response.json();
    } catch (error) {
      console.error('Activity breakdown error:', error);
      throw error;
    }
  }

  // Anomaly Detection
  static async getAnomalies() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/anomalies/`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch anomalies');
      }

      return await response.json();
    } catch (error) {
      console.error('Anomalies error:', error);
      throw error;
    }
  }

  // Process Notes
  static async getProcessNotes() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/process-notes/`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch process notes');
      }

      return await response.json();
    } catch (error) {
      console.error('Process notes error:', error);
      throw error;
    }
  }

  // Tasks
  static async getTasks() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      return await response.json();
    } catch (error) {
      console.error('Tasks error:', error);
      throw error;
    }
  }

  // Update Task
  static async updateTask(taskId, updates) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      return await response.json();
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  }

  // Behavioral Patterns
  static async getBehavioralPatterns() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/behavior/patterns`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch behavioral patterns');
      }

      return await response.json();
    } catch (error) {
      console.error('Behavioral patterns error:', error);
      throw error;
    }
  }

  // User Profile
  static async updateProfile(profileData) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // API Key Settings
  static async getApiKeys() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/settings/api-keys`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Get API keys raw error:', errorData);
        throw new Error(`Failed to get API keys. Status: ${response.status}. ${errorData}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get API keys error:', error);
      throw error;
    }
  }

  static async updateApiKeys(data) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/settings/api-keys`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Update API keys raw error:', errorData);
        throw new Error(`Failed to update API keys. Status: ${response.status}. ${errorData}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Update API keys error:', error);
      throw error;
    }
  }

  // AI Notification Optimization
  static async optimizeNotificationsAI(data) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications/optimize-ai`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Optimize notifications AI raw error:', errorData);
        throw new Error(`Failed to optimize notifications via AI. Status: ${response.status}. ${errorData}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Optimize notifications AI error:', error);
      throw error;
    }
  }

  // Voice NLU Interpretation
  static async interpretVoice(data) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/voice/interpret`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Interpret voice raw error:', errorData);
        throw new Error(`Failed to interpret voice command. Status: ${response.status}. ${errorData}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Interpret voice error:', error);
      throw error;
    }
  }
}

export { ApiService };