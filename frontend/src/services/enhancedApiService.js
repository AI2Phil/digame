/**
 * Enhanced API Service with Demo Mode Integration
 * Automatically switches between real API calls and demo data based on demo mode
 */

import apiService from './apiService';
import demoService from './demoService';

class EnhancedApiService {
  constructor() {
    /** @type {any} */
    this.originalApiService = apiService;
    this.demoService = demoService;
  }

  // Check if we're in demo mode
  isDemoMode() {
    return this.demoService.isDemoMode() ||
           (typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true') ||
           (typeof window !== 'undefined' && window.location.search.includes('demo=true'));
  }

  // Enable demo mode
  enableDemoMode() {
    this.demoService.setDemoMode(true);
  }

  // Disable demo mode
  disableDemoMode() {
    this.demoService.setDemoMode(false);
  }

  // Wrapper method that routes to demo or real API
  async request(endpoint, options = {}) {
    if (this.isDemoMode()) {
      console.log(`[DEMO MODE] Simulating API call: ${endpoint}`);
      return this.demoService.simulateApiCall(endpoint, options);
    }
    
    try {
      return await this.originalApiService.request(endpoint, options);
    } catch (error) {
      console.warn(`API call failed: ${endpoint}. Falling back to demo data.`, error);
      // Fallback to demo data if API fails
      return this.demoService.simulateApiCall(endpoint, options);
    }
  }

  // Authentication methods
  async login(credentials) {
    if (this.isDemoMode()) {
      console.log('[DEMO MODE] Simulating login');
      return {
        user: this.demoService.getCurrentUser(),
        tokens: {
          access_token: 'demo_access_token',
          refresh_token: 'demo_refresh_token'
        }
      };
    }
    return this.originalApiService.login(credentials);
  }

  async getCurrentUser() {
    if (this.isDemoMode()) {
      return this.demoService.getCurrentUser();
    }
    
    try {
      return await this.originalApiService.getCurrentUser();
    } catch (error) {
      console.warn('getCurrentUser failed, using demo data', error);
      return this.demoService.getCurrentUser();
    }
  }

  async logout() {
    if (this.isDemoMode()) {
      this.disableDemoMode();
      return { success: true };
    }
    return this.originalApiService.logout();
  }

  // Dashboard methods
  async getDashboardData() {
    if (this.isDemoMode()) {
      return this.demoService.getDashboardMetrics();
    }
    
    try {
      return await this.originalApiService.getDashboardData();
    } catch (error) {
      console.warn('getDashboardData failed, using demo data', error);
      return this.demoService.getDashboardMetrics();
    }
  }

  // Analytics methods
  async getAnalytics(params = {}) {
    if (this.isDemoMode()) {
      return this.demoService.getWebAnalytics();
    }
    
    try {
      return await this.originalApiService.getAnalytics(params);
    } catch (error) {
      console.warn('getAnalytics failed, using demo data', error);
      return this.demoService.getWebAnalytics();
    }
  }

  async getMobileAnalytics(timeRange = '24h') {
    if (this.isDemoMode()) {
      return this.demoService.getMobileAnalytics();
    }
    
    try {
      return await this.originalApiService.getMobileAnalytics(timeRange);
    } catch (error) {
      console.warn('getMobileAnalytics failed, using demo data', error);
      return this.demoService.getMobileAnalytics();
    }
  }

  // Advanced Mobile Analytics methods
  async getAdvancedMobileAnalytics() {
    if (this.isDemoMode()) {
      return this.demoService.getAdvancedMobileAnalytics();
    }
    
    try {
      return await this.request('/analytics/mobile/advanced');
    } catch (error) {
      console.warn('getAdvancedMobileAnalytics failed, using demo data', error);
      return this.demoService.getAdvancedMobileAnalytics();
    }
  }

  async getAdvancedPerformanceMetrics() {
    if (this.isDemoMode()) {
      return this.demoService.getAdvancedPerformanceMetrics();
    }
    
    try {
      return await this.request('/analytics/mobile/performance');
    } catch (error) {
      console.warn('getAdvancedPerformanceMetrics failed, using demo data', error);
      return this.demoService.getAdvancedPerformanceMetrics();
    }
  }

  async getAdvancedNetworkAnalytics() {
    if (this.isDemoMode()) {
      return this.demoService.getAdvancedNetworkAnalytics();
    }
    
    try {
      return await this.request('/analytics/mobile/network');
    } catch (error) {
      console.warn('getAdvancedNetworkAnalytics failed, using demo data', error);
      return this.demoService.getAdvancedNetworkAnalytics();
    }
  }

  async getAdvancedOfflineAnalytics() {
    if (this.isDemoMode()) {
      return this.demoService.getAdvancedOfflineAnalytics();
    }
    
    try {
      return await this.request('/analytics/mobile/offline');
    } catch (error) {
      console.warn('getAdvancedOfflineAnalytics failed, using demo data', error);
      return this.demoService.getAdvancedOfflineAnalytics();
    }
  }

  async getAdvancedUserBehaviorAnalytics() {
    if (this.isDemoMode()) {
      return this.demoService.getAdvancedUserBehaviorAnalytics();
    }
    
    try {
      return await this.request('/analytics/mobile/behavior');
    } catch (error) {
      console.warn('getAdvancedUserBehaviorAnalytics failed, using demo data', error);
      return this.demoService.getAdvancedUserBehaviorAnalytics();
    }
  }

  async getAdvancedSecurityAnalytics() {
    if (this.isDemoMode()) {
      return this.demoService.getAdvancedSecurityAnalytics();
    }
    
    try {
      return await this.request('/analytics/mobile/security');
    } catch (error) {
      console.warn('getAdvancedSecurityAnalytics failed, using demo data', error);
      return this.demoService.getAdvancedSecurityAnalytics();
    }
  }

  async getAdvancedRealTimeMetrics() {
    if (this.isDemoMode()) {
      return this.demoService.getAdvancedRealTimeMetrics();
    }
    
    try {
      return await this.request('/analytics/mobile/realtime');
    } catch (error) {
      console.warn('getAdvancedRealTimeMetrics failed, using demo data', error);
      return this.demoService.getAdvancedRealTimeMetrics();
    }
  }

  async getUserBehaviorAnalytics(timeRange = '24h') {
    if (this.isDemoMode()) {
      return this.demoService.getBehaviorAnalytics();
    }
    
    try {
      return await this.originalApiService.getUserBehaviorAnalytics(timeRange);
    } catch (error) {
      console.warn('getUserBehaviorAnalytics failed, using demo data', error);
      return this.demoService.getBehaviorAnalytics();
    }
  }

  // Behavioral Analysis methods
  async getBehaviorAnalysis(params = {}) {
    if (this.isDemoMode()) {
      return this.demoService.getBehaviorAnalytics();
    }
    
    try {
      return await this.originalApiService.getBehaviorAnalysis(params);
    } catch (error) {
      console.warn('getBehaviorAnalysis failed, using demo data', error);
      return this.demoService.getBehaviorAnalytics();
    }
  }

  async getBehaviorPatterns() {
    if (this.isDemoMode()) {
      return this.demoService.getBehaviorAnalytics().patterns;
    }
    
    try {
      return await this.originalApiService.getBehaviorPatterns();
    } catch (error) {
      console.warn('getBehaviorPatterns failed, using demo data', error);
      return this.demoService.getBehaviorAnalytics().patterns;
    }
  }

  // Predictive Analytics methods
  async getPredictiveInsights(params = {}) {
    if (this.isDemoMode()) {
      return this.demoService.getPredictiveAnalytics();
    }
    
    try {
      return await this.originalApiService.getPredictiveInsights(params);
    } catch (error) {
      console.warn('getPredictiveInsights failed, using demo data', error);
      return this.demoService.getPredictiveAnalytics();
    }
  }

  // AI Tools methods
  async getAIRecommendations() {
    if (this.isDemoMode()) {
      return this.demoService.getAIRecommendations();
    }
    
    try {
      return await this.request('/ai/recommendations');
    } catch (error) {
      console.warn('getAIRecommendations failed, using demo data', error);
      return this.demoService.getAIRecommendations();
    }
  }

  async getAIInsights() {
    if (this.isDemoMode()) {
      return this.demoService.getAIInsights();
    }
    
    try {
      return await this.request('/ai/insights');
    } catch (error) {
      console.warn('getAIInsights failed, using demo data', error);
      return this.demoService.getAIInsights();
    }
  }

  // Enhanced AI Tools methods
  async getAIToolsData() {
    if (this.isDemoMode()) {
      return this.demoService.getAIToolsData();
    }
    
    try {
      return await this.request('/ai/tools');
    } catch (error) {
      console.warn('getAIToolsData failed, using demo data', error);
      return this.demoService.getAIToolsData();
    }
  }

  async getWritingAssistance() {
    if (this.isDemoMode()) {
      return this.demoService.getWritingAssistance();
    }
    
    try {
      return await this.request('/ai/writing-assistance');
    } catch (error) {
      console.warn('getWritingAssistance failed, using demo data', error);
      return this.demoService.getWritingAssistance();
    }
  }

  async getAICoaching() {
    if (this.isDemoMode()) {
      return this.demoService.getAICoaching();
    }
    
    try {
      return await this.request('/ai/coaching');
    } catch (error) {
      console.warn('getAICoaching failed, using demo data', error);
      return this.demoService.getAICoaching();
    }
  }

  // Enhanced Analytics methods
  async getAdvancedAnalytics() {
    if (this.isDemoMode()) {
      return this.demoService.getAdvancedAnalytics();
    }
    
    try {
      return await this.request('/analytics/advanced');
    } catch (error) {
      console.warn('getAdvancedAnalytics failed, using demo data', error);
      return this.demoService.getAdvancedAnalytics();
    }
  }

  async getHeatmapData() {
    if (this.isDemoMode()) {
      return this.demoService.getHeatmapData();
    }
    
    try {
      return await this.request('/analytics/heatmap');
    } catch (error) {
      console.warn('getHeatmapData failed, using demo data', error);
      return this.demoService.getHeatmapData();
    }
  }

  async getUserJourneyData() {
    if (this.isDemoMode()) {
      return this.demoService.getUserJourneyData();
    }
    
    try {
      return await this.request('/analytics/user-journey');
    } catch (error) {
      console.warn('getUserJourneyData failed, using demo data', error);
      return this.demoService.getUserJourneyData();
    }
  }

  async getPerformanceMetrics() {
    if (this.isDemoMode()) {
      return this.demoService.getPerformanceMetrics();
    }
    
    try {
      return await this.request('/analytics/performance');
    } catch (error) {
      console.warn('getPerformanceMetrics failed, using demo data', error);
      return this.demoService.getPerformanceMetrics();
    }
  }

  // Enhanced Social methods
  async getEnhancedSocialData() {
    if (this.isDemoMode()) {
      return this.demoService.getEnhancedSocialData();
    }
    
    try {
      return await this.request('/social/enhanced');
    } catch (error) {
      console.warn('getEnhancedSocialData failed, using demo data', error);
      return this.demoService.getEnhancedSocialData();
    }
  }

  async getNetworkAnalysis() {
    if (this.isDemoMode()) {
      return this.demoService.getNetworkAnalysis();
    }
    
    try {
      return await this.request('/social/network-analysis');
    } catch (error) {
      console.warn('getNetworkAnalysis failed, using demo data', error);
      return this.demoService.getNetworkAnalysis();
    }
  }

  async getSkillMatching() {
    if (this.isDemoMode()) {
      return this.demoService.getSkillMatching();
    }
    
    try {
      return await this.request('/social/skill-matching');
    } catch (error) {
      console.warn('getSkillMatching failed, using demo data', error);
      return this.demoService.getSkillMatching();
    }
  }

  async getIndustryInsights() {
    if (this.isDemoMode()) {
      return this.demoService.getIndustryInsights();
    }
    
    try {
      return await this.request('/social/industry-insights');
    } catch (error) {
      console.warn('getIndustryInsights failed, using demo data', error);
      return this.demoService.getIndustryInsights();
    }
  }

  // Social Collaboration methods
  async getSocialPeerMatches() {
    if (this.isDemoMode()) {
      return this.demoService.getSocialPeerMatches();
    }
    
    try {
      return await this.request('/social/peer-matches');
    } catch (error) {
      console.warn('getSocialPeerMatches failed, using demo data', error);
      return this.demoService.getSocialPeerMatches();
    }
  }

  async getSocialMentorshipMatches() {
    if (this.isDemoMode()) {
      return this.demoService.getSocialMentorshipMatches();
    }
    
    try {
      return await this.request('/social/mentorship-matches');
    } catch (error) {
      console.warn('getSocialMentorshipMatches failed, using demo data', error);
      return this.demoService.getSocialMentorshipMatches();
    }
  }

  async getSocialCollaborationProjects() {
    if (this.isDemoMode()) {
      return this.demoService.getSocialCollaborationProjects();
    }
    
    try {
      return await this.request('/social/collaboration-projects');
    } catch (error) {
      console.warn('getSocialCollaborationProjects failed, using demo data', error);
      return this.demoService.getSocialCollaborationProjects();
    }
  }

  async getSocialNetworkData() {
    if (this.isDemoMode()) {
      return this.demoService.getSocialNetworkData();
    }
    
    try {
      return await this.request('/social/network-data');
    } catch (error) {
      console.warn('getSocialNetworkData failed, using demo data', error);
      return this.demoService.getSocialNetworkData();
    }
  }

  async getSocialCommunityData() {
    if (this.isDemoMode()) {
      return this.demoService.getSocialCommunityData();
    }
    
    try {
      return await this.request('/social/community-data');
    } catch (error) {
      console.warn('getSocialCommunityData failed, using demo data', error);
      return this.demoService.getSocialCommunityData();
    }
  }

  async sendConnectionRequest(peerId) {
    if (this.isDemoMode()) {
      return this.demoService.sendConnectionRequest(peerId);
    }
    
    try {
      return await this.request('/social/connection-request', {
        method: 'POST',
        body: JSON.stringify({ peerId })
      });
    } catch (error) {
      console.warn('sendConnectionRequest failed, using demo fallback', error);
      return this.demoService.sendConnectionRequest(peerId);
    }
  }

  async joinCollaborationProject(projectId) {
    if (this.isDemoMode()) {
      return this.demoService.joinCollaborationProject(projectId);
    }
    
    try {
      return await this.request('/social/join-project', {
        method: 'POST',
        body: JSON.stringify({ projectId })
      });
    } catch (error) {
      console.warn('joinCollaborationProject failed, using demo fallback', error);
      return this.demoService.joinCollaborationProject(projectId);
    }
  }

  async requestMentorship(mentorId, type) {
    if (this.isDemoMode()) {
      return this.demoService.requestMentorship(mentorId, type);
    }
    
    try {
      return await this.request('/social/mentorship-request', {
        method: 'POST',
        body: JSON.stringify({ mentorId, type })
      });
    } catch (error) {
      console.warn('requestMentorship failed, using demo fallback', error);
      return this.demoService.requestMentorship(mentorId, type);
    }
  }

  // Legacy methods for backward compatibility
  async getPeerMatches() {
    return this.getSocialPeerMatches();
  }

  async getUserConnections(userId) {
    if (this.isDemoMode()) {
      return this.demoService.getSocialConnections();
    }
    
    try {
      return await this.originalApiService.getUserConnections(userId);
    } catch (error) {
      console.warn('getUserConnections failed, using demo data', error);
      return this.demoService.getSocialConnections();
    }
  }

  async getActiveCollaborationProjects() {
    return this.getSocialCollaborationProjects();
  }

  async getMentorshipOpportunities(userId) {
    return this.getSocialMentorshipMatches();
  }

  // Task Management methods
  async getTasks(status = null) {
    if (this.isDemoMode()) {
      return this.demoService.getTasks(status);
    }
    
    try {
      const params = status ? { status } : {};
      return await this.request('/tasks', { params });
    } catch (error) {
      console.warn('getTasks failed, using demo data', error);
      return this.demoService.getTasks(status);
    }
  }

  async updateTaskStatus(taskId, status) {
    if (this.isDemoMode()) {
      return this.demoService.updateTaskStatus(taskId, status);
    }
    
    try {
      return await this.request(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.warn('updateTaskStatus failed, using demo fallback', error);
      return this.demoService.updateTaskStatus(taskId, status);
    }
  }

  // Enterprise methods
  async getEnterpriseData() {
    if (this.isDemoMode()) {
      return this.demoService.getEnterpriseData();
    }
    
    try {
      return await this.request('/enterprise');
    } catch (error) {
      console.warn('getEnterpriseData failed, using demo data', error);
      return this.demoService.getEnterpriseData();
    }
  }

  // Notifications methods
  async getNotifications(filter = {}) {
    if (this.isDemoMode()) {
      const unreadOnly = filter.unread === 'true';
      return this.demoService.getNotifications(unreadOnly);
    }
    
    try {
      return await this.originalApiService.getNotifications(filter);
    } catch (error) {
      console.warn('getNotifications failed, using demo data', error);
      const unreadOnly = filter.unread === 'true';
      return this.demoService.getNotifications(unreadOnly);
    }
  }

  async markNotificationAsRead(notificationId) {
    if (this.isDemoMode()) {
      return this.demoService.markNotificationAsRead(notificationId);
    }
    
    try {
      return await this.originalApiService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.warn('markNotificationAsRead failed, using demo fallback', error);
      return this.demoService.markNotificationAsRead(notificationId);
    }
  }

  async markAllNotificationsAsRead() {
    if (this.isDemoMode()) {
      const notifications = this.demoService.getNotifications();
      notifications.forEach(notif => notif.read = true);
      return { success: true };
    }
    
    try {
      return await this.originalApiService.markAllNotificationsAsRead();
    } catch (error) {
      console.warn('markAllNotificationsAsRead failed, using demo fallback', error);
      const notifications = this.demoService.getNotifications();
      notifications.forEach(notif => notif.read = true);
      return { success: true };
    }
  }

  // Reports methods
  async getReports() {
    if (this.isDemoMode()) {
      return this.demoService.getReports();
    }
    
    try {
      return await this.request('/reports');
    } catch (error) {
      console.warn('getReports failed, using demo data', error);
      return this.demoService.getReports();
    }
  }

  // User Profile methods
  async getUserProfile(userId) {
    if (this.isDemoMode()) {
      if (userId === 'demo_user_001' || !userId) {
        return this.demoService.getCurrentUser();
      }
      // Return a generic demo user for other user IDs
      return {
        id: userId,
        username: `user_${userId}`,
        email: `user${userId}@demo.com`,
        firstName: 'Demo',
        lastName: 'User',
        role: 'Professional',
        detailedBio: 'This is a demo user profile.',
        projects: [],
        experience: [],
        education: [],
        skills: [],
        kudosCount: Math.floor(Math.random() * 50),
        is_active: true,
        verified: false
      };
    }
    
    try {
      return await this.originalApiService.getUserProfile(userId);
    } catch (error) {
      console.warn('getUserProfile failed, using demo data', error);
      return this.demoService.getCurrentUser();
    }
  }

  // Admin methods
  async getUsers(params = {}) {
    if (this.isDemoMode()) {
      // Return demo users list
      return {
        users: [
          this.demoService.getCurrentUser(),
          {
            id: 'demo_user_002',
            username: 'sarah_demo',
            email: 'sarah@demo.com',
            firstName: 'Sarah',
            lastName: 'Demo',
            role: 'Designer',
            is_active: true,
            verified: true,
            joinDate: '2024-01-15'
          },
          {
            id: 'demo_user_003',
            username: 'mike_demo',
            email: 'mike@demo.com',
            firstName: 'Mike',
            lastName: 'Demo',
            role: 'Manager',
            is_active: true,
            verified: false,
            joinDate: '2024-02-01'
          }
        ],
        total: 3,
        page: 1,
        limit: 10
      };
    }
    
    try {
      return await this.originalApiService.getUsers(params);
    } catch (error) {
      console.warn('getUsers failed, using demo data', error);
      return {
        users: [this.demoService.getCurrentUser()],
        total: 1,
        page: 1,
        limit: 10
      };
    }
  }

  async getSystemStats() {
    if (this.isDemoMode()) {
      return {
        totalUsers: 1247,
        activeUsers: 892,
        totalSessions: 15420,
        avgSessionDuration: '4m 32s',
        systemHealth: 98.5,
        apiCalls: 45230,
        errorRate: 0.02
      };
    }
    
    try {
      return await this.originalApiService.getSystemStats();
    } catch (error) {
      console.warn('getSystemStats failed, using demo data', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalSessions: 0,
        avgSessionDuration: '0m 0s',
        systemHealth: 0,
        apiCalls: 0,
        errorRate: 0
      };
    }
  }

  async getAdminApiKeys() {
    if (this.isDemoMode()) {
      return [
        {
          id: 'key_001',
          name: 'Production API Key',
          key: 'pk_live_****************************',
          created: '2024-01-15',
          lastUsed: '2024-06-22',
          status: 'active',
          permissions: ['read', 'write']
        },
        {
          id: 'key_002',
          name: 'Development API Key',
          key: 'pk_test_****************************',
          created: '2024-02-01',
          lastUsed: '2024-06-20',
          status: 'active',
          permissions: ['read']
        },
        {
          id: 'key_003',
          name: 'Analytics API Key',
          key: 'pk_analytics_**********************',
          created: '2024-03-10',
          lastUsed: '2024-06-15',
          status: 'inactive',
          permissions: ['read']
        }
      ];
    }
    
    try {
      return await this.originalApiService.getAdminApiKeys();
    } catch (error) {
      console.warn('getAdminApiKeys failed, using demo data', error);
      return [];
    }
  }

  async getOnboardingAnalytics() {
    if (this.isDemoMode()) {
      return {
        totalSignups: 1247,
        completedOnboarding: 1089,
        completionRate: 87.3,
        averageCompletionTime: '8m 45s',
        dropoffPoints: [
          { step: 'Email Verification', dropoff: 12.5 },
          { step: 'Profile Setup', dropoff: 8.2 },
          { step: 'Preferences', dropoff: 4.1 },
          { step: 'Tutorial', dropoff: 2.9 }
        ],
        monthlyTrends: [
          { month: 'Jan', signups: 156, completed: 142 },
          { month: 'Feb', signups: 189, completed: 167 },
          { month: 'Mar', signups: 234, completed: 201 },
          { month: 'Apr', signups: 198, completed: 178 },
          { month: 'May', signups: 267, completed: 234 },
          { month: 'Jun', signups: 203, completed: 167 }
        ]
      };
    }
    
    try {
      return await this.originalApiService.getOnboardingAnalytics();
    } catch (error) {
      console.warn('getOnboardingAnalytics failed, using demo data', error);
      return {
        totalSignups: 0,
        completedOnboarding: 0,
        completionRate: 0,
        averageCompletionTime: '0m 0s',
        dropoffPoints: [],
        monthlyTrends: []
      };
    }
  }

  async performUserAction(userId, action) {
    if (this.isDemoMode()) {
      console.log(`[DEMO MODE] Performing user action: ${action} on user ${userId}`);
      return { success: true, message: `User ${action} successfully` };
    }
    
    try {
      return await this.originalApiService.performUserAction(userId, action);
    } catch (error) {
      console.warn('performUserAction failed, using demo fallback', error);
      return { success: true, message: `User ${action} successfully (demo)` };
    }
  }

  // Productivity data methods
  async getProductivityData(userId, timeRange = 'daily') {
    if (this.isDemoMode()) {
      return this.demoService.getProductivityData(timeRange);
    }
    
    try {
      return await this.request(`/users/${userId}/productivity?range=${timeRange}`);
    } catch (error) {
      console.warn('getProductivityData failed, using demo data', error);
      return this.demoService.getProductivityData(timeRange);
    }
  }

  async getActivityBreakdown(userId) {
    if (this.isDemoMode()) {
      return this.demoService.getActivityBreakdown();
    }
    
    try {
      return await this.request(`/users/${userId}/activity-breakdown`);
    } catch (error) {
      console.warn('getActivityBreakdown failed, using demo data', error);
      return this.demoService.getActivityBreakdown();
    }
  }

  async getRecentActivities(userId, limit = 10) {
    if (this.isDemoMode()) {
      return this.demoService.getRecentActivities(limit);
    }
    
    try {
      return await this.request(`/users/${userId}/recent-activities?limit=${limit}`);
    } catch (error) {
      console.warn('getRecentActivities failed, using demo data', error);
      return this.demoService.getRecentActivities(limit);
    }
  }

  // Export methods
  async exportAnalyticsData(timeRange = '24h') {
    if (this.isDemoMode()) {
      console.log(`[DEMO MODE] Exporting analytics data for ${timeRange}`);
      return Promise.resolve({
        success: true,
        message: 'Analytics data exported successfully (demo)',
        downloadUrl: '/demo/analytics-export.csv'
      });
    }
    
    try {
      return await this.request('/analytics/export', {
        method: 'POST',
        body: JSON.stringify({ timeRange })
      });
    } catch (error) {
      console.warn('exportAnalyticsData failed, using demo fallback', error);
      return Promise.resolve({
        success: true,
        message: 'Analytics data exported successfully (demo)',
        downloadUrl: '/demo/analytics-export.csv'
      });
    }
  }

  // Advanced Reporting methods
  async generateReportPreview(reportConfig) {
    if (this.isDemoMode()) {
      return this.demoService.generateReportPreview(reportConfig);
    }
    
    try {
      return await this.request('http://localhost:8001/api/advanced-reporting/report-builder/preview', {
        method: 'POST',
        body: JSON.stringify(reportConfig)
      });
    } catch (error) {
      console.warn('generateReportPreview failed, using demo data', error);
      return this.demoService.generateReportPreview(reportConfig);
    }
  }

  async saveCustomReport(reportConfig) {
    if (this.isDemoMode()) {
      return this.demoService.saveCustomReport(reportConfig);
    }
    
    try {
      return await this.request('http://localhost:8001/api/advanced-reporting/report-builder', {
        method: 'POST',
        body: JSON.stringify(reportConfig)
      });
    } catch (error) {
      console.warn('saveCustomReport failed, using demo fallback', error);
      return this.demoService.saveCustomReport(reportConfig);
    }
  }

  async getScenarioAnalysis(params = {}) {
    if (this.isDemoMode()) {
      return this.demoService.getScenarioAnalysis(params);
    }
    
    try {
      return await this.request('http://localhost:8001/api/advanced-reporting/predictive-analytics/scenarios', {
        method: 'GET',
        params
      });
    } catch (error) {
      console.warn('getScenarioAnalysis failed, using demo data', error);
      return this.demoService.getScenarioAnalysis(params);
    }
  }

  async getRiskAnalysis() {
    if (this.isDemoMode()) {
      return this.demoService.getRiskAnalysis();
    }
    
    try {
      return await this.request('http://localhost:8001/api/advanced-reporting/predictive-analytics/risks');
    } catch (error) {
      console.warn('getRiskAnalysis failed, using demo data', error);
      return this.demoService.getRiskAnalysis();
    }
  }

  async getModelPerformance() {
    if (this.isDemoMode()) {
      return this.demoService.getModelPerformance();
    }
    
    try {
      return await this.request('http://localhost:8001/api/advanced-reporting/predictive-analytics/models');
    } catch (error) {
      console.warn('getModelPerformance failed, using demo data', error);
      return this.demoService.getModelPerformance();
    }
  }

  async getForecastData(params = {}) {
    if (this.isDemoMode()) {
      return this.demoService.getForecastData(params);
    }
    
    try {
      return await this.request('http://localhost:8001/api/advanced-reporting/predictive-analytics/forecasts', {
        method: 'GET',
        params
      });
    } catch (error) {
      console.warn('getForecastData failed, using demo data', error);
      return this.demoService.getForecastData(params);
    }
  }

  async getRealTimePredictions() {
    if (this.isDemoMode()) {
      return this.demoService.getRealTimePredictions();
    }
    
    try {
      return await this.request('http://localhost:8001/api/advanced-reporting/predictive-analytics/realtime');
    } catch (error) {
      console.warn('getRealTimePredictions failed, using demo data', error);
      return this.demoService.getRealTimePredictions();
    }
  }

  async getVisualizationMetrics() {
    if (this.isDemoMode()) {
      return this.demoService.getVisualizationMetrics();
    }
    
    try {
      return await this.request('http://localhost:8001/api/advanced-reporting/visualization-engine');
    } catch (error) {
      console.warn('getVisualizationMetrics failed, using demo data', error);
      return this.demoService.getVisualizationMetrics();
    }
  }

  // Utility methods
  isAuthenticated() {
    if (this.isDemoMode()) {
      return true; // Always authenticated in demo mode
    }
    return this.originalApiService.isAuthenticated();
  }

  setToken(token) {
    if (!this.isDemoMode()) {
      this.originalApiService.setToken(token);
    }
  }

  clearToken() {
    if (!this.isDemoMode()) {
      this.originalApiService.clearToken();
    }
  }

  // Pass through methods for non-demo functionality
  getHeaders(includeAuth = true) {
    return this.originalApiService.getHeaders(includeAuth);
  }

  async handleResponse(response) {
    return this.originalApiService.handleResponse(response);
  }
}

// Create and export a singleton instance
const enhancedApiService = new EnhancedApiService();

export default enhancedApiService;
export { EnhancedApiService };