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
}

export { ApiService };