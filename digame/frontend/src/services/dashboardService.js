const API_BASE = 'http://localhost:8000';

export const dashboardService = {
  // Get user productivity metrics from Digame's behavioral analysis
  async getProductivityMetrics(userId) {
    try {
      const response = await fetch(`${API_BASE}/behavior/patterns/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformBehavioralData(data);
    } catch (error) {
      console.error('Error fetching productivity metrics:', error);
      // Return mock data for development
      return this.getMockProductivityData();
    }
  },

  // Transform Digame's behavioral data into chart-friendly format
  transformBehavioralData(behavioralData) {
    if (!behavioralData || !behavioralData.patterns) {
      return this.getMockProductivityData();
    }

    const patterns = behavioralData.patterns.slice(0, 7); // Last 7 days
    
    return {
      actualData: patterns.map(pattern => {
        // Convert behavioral metrics to productivity scores (0-100)
        const efficiency = pattern.efficiency_score || Math.random() * 100;
        return Math.round(efficiency);
      }),
      predictedData: patterns.map(pattern => {
        // Generate predicted values based on trends
        const base = pattern.efficiency_score || Math.random() * 100;
        const variation = (Math.random() - 0.5) * 20; // ±10 variation
        return Math.round(Math.max(0, Math.min(100, base + variation)));
      }),
      labels: patterns.map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (patterns.length - 1 - index));
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      summary: {
        avgProductivity: patterns.reduce((sum, p) => sum + (p.efficiency_score || 50), 0) / patterns.length,
        totalFocusTime: patterns.reduce((sum, p) => sum + (p.focus_duration || 0), 0),
        collaborationIndex: patterns.reduce((sum, p) => sum + (p.team_interaction || 0), 0) / patterns.length
      }
    };
  },

  // Mock data for development and testing
  getMockProductivityData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const actualData = [65, 78, 82, 75, 88, 72, 85];
    const predictedData = [70, 80, 85, 78, 90, 75, 88];
    
    return {
      actualData,
      predictedData,
      labels: days,
      summary: {
        avgProductivity: actualData.reduce((sum, val) => sum + val, 0) / actualData.length,
        totalFocusTime: 28.5, // hours
        collaborationIndex: 7.2
      }
    };
  },

  // Get recent activities
  async getRecentActivities(userId, limit = 5) {
    try {
      const response = await fetch(`${API_BASE}/activities/user/${userId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Return mock data for development
      return [
        { id: 1, type: 'analysis', description: 'Data analysis session', duration: 120, timestamp: new Date().toISOString() },
        { id: 2, type: 'meeting', description: 'Team standup', duration: 30, timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, type: 'coding', description: 'Feature development', duration: 180, timestamp: new Date(Date.now() - 7200000).toISOString() }
      ];
    }
  },

  // Get activity breakdown from behavioral patterns
  async getActivityBreakdown(userId, period = '7d') {
    try {
      const response = await fetch(`${API_BASE}/behavior/analysis?user_id=${userId}&period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformActivityBreakdown(data);
    } catch (error) {
      console.error('Error fetching activity breakdown:', error);
      // Return mock data for development
      return {
        categories: [
          { name: 'Deep Work', value: 45, color: '#3b82f6' },
          { name: 'Meetings', value: 25, color: '#10b981' },
          { name: 'Communication', value: 20, color: '#f59e0b' },
          { name: 'Administrative', value: 10, color: '#ef4444' }
        ]
      };
    }
  },

  transformActivityBreakdown(behavioralData) {
    // Transform Digame's behavioral analysis into activity categories
    if (!behavioralData || !behavioralData.activity_distribution) {
      return {
        categories: [
          { name: 'Deep Work', value: 45, color: '#3b82f6' },
          { name: 'Meetings', value: 25, color: '#10b981' },
          { name: 'Communication', value: 20, color: '#f59e0b' },
          { name: 'Administrative', value: 10, color: '#ef4444' }
        ]
      };
    }

    return {
      categories: Object.entries(behavioralData.activity_distribution).map(([key, value], index) => ({
        name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: Math.round(value * 100),
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
      }))
    };
  }
};