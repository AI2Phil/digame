/**
 * Enhanced API Service for Digame Platform
 * Provides comprehensive API interaction methods for all backend endpoints
 */

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.token = localStorage.getItem('token');
  }

  // Helper method to get headers with authentication
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Helper method to make API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.auth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    const data = await this.handleResponse(response);
    
    if (data.tokens?.access_token) {
      this.token = data.tokens.access_token;
      localStorage.setItem('token', this.token);
      localStorage.setItem('refresh_token', data.tokens.refresh_token);
    }

    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      auth: false,
    });

    if (data.tokens?.access_token) {
      this.token = data.tokens.access_token;
      localStorage.setItem('token', this.token);
      localStorage.setItem('refresh_token', data.tokens.refresh_token);
    }

    return data;
  }

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          body: `refresh_token=${encodeURIComponent(refreshToken)}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${this.token}`,
          },
        });
      } catch (error) {
        console.warn('Logout request failed:', error);
      }
    }

    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const data = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
      auth: false,
    });

    if (data.access_token) {
      this.token = data.access_token;
      localStorage.setItem('token', this.token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
    }

    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async verifyToken() {
    return this.request('/auth/verify-token');
  }

  // Password management
  async changePassword(passwordData) {
    return this.request('/auth/password-change', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async requestPasswordReset(email) {
    return this.request('/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
      auth: false,
    });
  }

  async confirmPasswordReset(resetData) {
    return this.request('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify(resetData),
      auth: false,
    });
  }

  // Onboarding methods
  async getOnboardingStatus() {
    return this.request('/onboarding/');
  }

  async saveOnboardingData(onboardingData) {
    return this.request('/onboarding/', {
      method: 'POST',
      body: JSON.stringify(onboardingData),
    });
  }

  // User Settings / API Keys methods
  async getApiKeys() {
    return this.request('/settings/api-keys');
  }

  async updateApiKeys(apiKeys) {
    return this.request('/settings/api-keys', {
      method: 'POST',
      body: JSON.stringify({ api_keys: apiKeys }),
    });
  }

  async deleteApiKey(keyName) {
    return this.request(`/settings/api-keys/${keyName}`, {
      method: 'DELETE',
    });
  }

  // Analytics and Dashboard methods
  async getDashboardData() {
    return this.request('/api/dashboard');
  }

  async getAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/analytics${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  // Process Notes methods
  async getProcessNotes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/process-notes${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async createProcessNote(noteData) {
    return this.request('/process-notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async updateProcessNote(noteId, noteData) {
    return this.request(`/process-notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteProcessNote(noteId) {
    return this.request(`/process-notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // Behavioral Analysis methods
  async getBehaviorAnalysis(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/behavior/analysis${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getBehaviorPatterns() {
    return this.request('/behavior/patterns');
  }

  // Predictive Modeling methods
  async getPredictiveInsights(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/predictive/insights${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async trainPredictiveModel(modelData) {
    return this.request('/predictive/train', {
      method: 'POST',
      body: JSON.stringify(modelData),
    });
  }

  // Job/Task management methods
  async getJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/jobs${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async createJob(jobData) {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async getJobStatus(jobId) {
    return this.request(`/api/jobs/${jobId}`);
  }

  async cancelJob(jobId) {
    return this.request(`/api/jobs/${jobId}/cancel`, {
      method: 'POST',
    });
  }

  // Publishing methods
  async publishModel(modelData) {
    return this.request('/publish/model', {
      method: 'POST',
      body: JSON.stringify(modelData),
    });
  }

  async getPublishedModels() {
    return this.request('/publish/models');
  }

  // Admin methods (RBAC)
  async getRoles() {
    return this.request('/admin/rbac/roles');
  }

  async createRole(roleData) {
    return this.request('/admin/rbac/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async getPermissions() {
    return this.request('/admin/rbac/permissions');
  }

  async assignRoleToUser(userId, roleData) {
    return this.request(`/admin/rbac/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  // Health check methods
  async getHealthStatus() {
    return this.request('/health', { auth: false });
  }

  async getAuthHealthStatus() {
    return this.request('/auth/health', { auth: false });
  }

  async getOnboardingHealthStatus() {
    return this.request('/onboarding/health');
  }

  // Utility methods
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated() {
    return !!this.token;
  }

  // File upload helper
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    return this.handleResponse(response);
  }

  // Batch operations helper
  async batchRequest(requests) {
    const promises = requests.map(({ endpoint, options }) =>
      this.request(endpoint, options).catch(error => ({ error, endpoint }))
    );

    return Promise.all(promises);
  }

  // Admin-specific methods
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async performUserAction(userId, action, data = {}) {
    return this.request(`/admin/users/${userId}/${action}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSystemStats() {
    return this.request('/admin/system/stats');
  }

  async getAdminApiKeys() {
    return this.request('/admin/api-keys');
  }

  async createAdminApiKey(keyData) {
    return this.request('/admin/api-keys', {
      method: 'POST',
      body: JSON.stringify(keyData),
    });
  }

  async updateAdminApiKey(keyId, keyData) {
    return this.request(`/admin/api-keys/${keyId}`, {
      method: 'PUT',
      body: JSON.stringify(keyData),
    });
  }

  async deleteAdminApiKey(keyId) {
    return this.request(`/admin/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  async getOnboardingAnalytics() {
    return this.request('/admin/onboarding/analytics');
  }

  // User Profile Enhancement methods
  async updateUserProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadAvatar(formData) {
    const response = await fetch(`${this.baseURL}/auth/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  // Goals Management methods
  async getUserGoals() {
    return this.request('/goals');
  }

  async createGoal(goalData) {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async updateGoal(goalId, goalData) {
    return this.request(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  }

  async deleteGoal(goalId) {
    return this.request(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  }

  // Achievements methods
  async getUserAchievements() {
    return this.request('/achievements');
  }

  async getAchievementProgress() {
    return this.request('/achievements/progress');
  }

  // User Preferences methods
  async updateUserPreferences(preferences) {
    return this.request('/settings/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async getUserPreferences() {
    return this.request('/settings/preferences');
  }

  // Social Profile methods
  async getConnections() {
    return this.request('/social/connections');
  }

  async sendConnectionRequest(userId) {
    return this.request('/social/connect', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async updateSocialLinks(socialLinks) {
    return this.request('/social/links', {
      method: 'PUT',
      body: JSON.stringify(socialLinks),
    });
  }

  async getSocialActivity() {
    return this.request('/social/activity');
  }

  async likeActivity(activityId) {
    return this.request(`/social/activity/${activityId}/like`, {
      method: 'POST',
    });
  }

  async shareAchievement(achievementId) {
    return this.request(`/social/share/achievement/${achievementId}`, {
      method: 'POST',
    });
  }

  async shareGoal(goalId) {
    return this.request(`/social/share/goal/${goalId}`, {
      method: 'POST',
    });
  }

  // Performance Monitoring & Analytics methods
  async getPerformanceMetrics(timeRange = '24h') {
    return this.request(`/analytics/performance?range=${timeRange}`);
  }

  async getUserBehaviorAnalytics(timeRange = '24h') {
    return this.request(`/analytics/user-behavior?range=${timeRange}`);
  }

  async getApiUsageMetrics(timeRange = '24h') {
    return this.request(`/analytics/api-usage?range=${timeRange}`);
  }

  async getDatabaseMetrics(timeRange = '24h') {
    return this.request(`/analytics/database?range=${timeRange}`);
  }

  async getMobileAnalytics(timeRange = '24h') {
    return this.request(`/analytics/mobile?range=${timeRange}`);
  }

  async exportAnalyticsData(timeRange = '24h') {
    const response = await fetch(`${this.baseURL}/analytics/export?range=${timeRange}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
    
    return this.handleResponse(response);
  }

  // Real-time analytics methods
  async getRealtimeMetrics() {
    return this.request('/analytics/realtime');
  }

  async getSystemHealth() {
    return this.request('/analytics/system-health');
  }

  async getApiEndpointMetrics() {
    return this.request('/analytics/api-endpoints');
  }

  async getUserJourneyAnalytics() {
    return this.request('/analytics/user-journey');
  }

  async getConversionMetrics() {
    return this.request('/analytics/conversion');
  }

  async getGeographicAnalytics() {
    return this.request('/analytics/geographic');
  }

  async getDeviceAnalytics() {
    return this.request('/analytics/devices');
  }

  async getAppVersionAnalytics() {
    return this.request('/analytics/app-versions');
  }

  async getPerformanceAlerts() {
    return this.request('/analytics/alerts');
  }

  async acknowledgeAlert(alertId) {
    return this.request(`/analytics/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
  }

  // Custom analytics queries
  async runCustomQuery(query) {
    return this.request('/analytics/custom', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async saveAnalyticsDashboard(dashboardConfig) {
    return this.request('/analytics/dashboards', {
      method: 'POST',
      body: JSON.stringify(dashboardConfig),
    });
  }

  async getAnalyticsDashboards() {
    return this.request('/analytics/dashboards');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

export default apiService;

// Export the class for testing or custom instances
export { ApiService };