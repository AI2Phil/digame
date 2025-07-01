/**
 * Demo Data Service - Isolated Mock Data for Demo Mode
 * This service provides ONLY mock data and has NO access to real user data
 * Used exclusively when isDemoMode = true
 */

class DemoDataService {
  constructor() {
    // Ensure this service can NEVER access real data
    this.DEMO_ONLY = true;
    this.mockData = this.initializeMockData();
  }

  // Verify demo mode before returning any data
  verifyDemoMode(isDemoMode) {
    if (!isDemoMode) {
      throw new Error('DemoDataService can only be used in demo mode');
    }
  }

  initializeMockData() {
    return {
      projects: [
        {
          id: 'demo_proj_1',
          name: "AI Analytics Dashboard",
          description: "Comprehensive analytics platform with machine learning insights",
          status: "Active",
          progress: 85,
          team: "Data Science Team",
          lastUpdated: "2 hours ago",
          technologies: ["React", "Python", "TensorFlow"],
          isDemoData: true
        },
        {
          id: 'demo_proj_2',
          name: "Mobile Productivity App",
          description: "Cross-platform mobile app for task management and productivity tracking",
          status: "In Progress",
          progress: 60,
          team: "Mobile Development",
          lastUpdated: "1 day ago",
          technologies: ["React Native", "Node.js", "MongoDB"],
          isDemoData: true
        },
        {
          id: 'demo_proj_3',
          name: "Blockchain Supply Chain",
          description: "Blockchain-based supply chain tracking system for transparency",
          status: "Completed",
          progress: 100,
          team: "Blockchain Team",
          lastUpdated: "1 week ago",
          technologies: ["Solidity", "Web3.js", "Ethereum"],
          isDemoData: true
        }
      ],

      analytics: {
        productivity: { current: 87, change: 5, trend: 'up' },
        focusTime: { current: 6.2, target: 8, change: 0.8 },
        collaboration: { current: 8.4, change: 2.1 },
        growthRate: { current: 12, change: 4 },
        weeklyData: [
          { day: 'Mon', productivity: 85, focus: 6.1 },
          { day: 'Tue', productivity: 92, focus: 7.2 },
          { day: 'Wed', productivity: 78, focus: 5.8 },
          { day: 'Thu', productivity: 89, focus: 6.5 },
          { day: 'Fri', productivity: 94, focus: 7.1 },
          { day: 'Sat', productivity: 76, focus: 5.2 },
          { day: 'Sun', productivity: 82, focus: 6.0 }
        ],
        isDemoData: true
      },

      teams: [
        {
          id: 'demo_team_1',
          name: "Data Science Team",
          description: "AI and machine learning specialists",
          members: 8,
          projects: 3,
          status: "Active",
          created: "3 months ago",
          isDemoData: true
        },
        {
          id: 'demo_team_2',
          name: "Mobile Development",
          description: "Cross-platform mobile app developers",
          members: 5,
          projects: 2,
          status: "Active",
          created: "2 months ago",
          isDemoData: true
        }
      ],

      integrations: [
        {
          id: 'demo_int_1',
          name: "Slack",
          description: "Team communication and notifications",
          status: "Connected",
          users: 120,
          lastSync: "5 minutes ago",
          isDemoData: true
        },
        {
          id: 'demo_int_2',
          name: "GitHub",
          description: "Code repository and version control",
          status: "Connected",
          users: 85,
          lastSync: "10 minutes ago",
          isDemoData: true
        },
        {
          id: 'demo_int_3',
          name: "Jira",
          description: "Project management and issue tracking",
          status: "Available",
          users: 0,
          lastSync: "Never",
          isDemoData: true
        }
      ],

      userStats: {
        totalProjects: 3,
        activeTeams: 2,
        completedTasks: 47,
        recentActivity: [
          {
            icon: '🚀',
            title: 'Completed AI Analytics Dashboard',
            timestamp: '2 hours ago',
            isDemoData: true
          },
          {
            icon: '👥',
            title: 'Joined React Development Team',
            timestamp: '1 day ago',
            isDemoData: true
          },
          {
            icon: '📊',
            title: 'Generated Weekly Performance Report',
            timestamp: '2 days ago',
            isDemoData: true
          }
        ],
        isDemoData: true
      }
    };
  }

  // Safe getter methods that verify demo mode
  getProjects(isDemoMode) {
    this.verifyDemoMode(isDemoMode);
    return this.mockData.projects;
  }

  getAnalytics(isDemoMode) {
    this.verifyDemoMode(isDemoMode);
    return this.mockData.analytics;
  }

  getTeams(isDemoMode) {
    this.verifyDemoMode(isDemoMode);
    return this.mockData.teams;
  }

  getIntegrations(isDemoMode) {
    this.verifyDemoMode(isDemoMode);
    return this.mockData.integrations;
  }

  getUserStats(isDemoMode) {
    this.verifyDemoMode(isDemoMode);
    return this.mockData.userStats;
  }

  // Utility method to add demo watermark to all data
  addDemoWatermark(data) {
    if (Array.isArray(data)) {
      return data.map(item => ({ ...item, isDemoData: true }));
    }
    return { ...data, isDemoData: true };
  }
}

// Export singleton instance
const demoDataService = new DemoDataService();
export default demoDataService;