import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter } from 'next/router';
import ProgressiveOnboarding from '../src/components/onboarding/ProgressiveOnboarding';
import TeamManagement from '../src/components/team/TeamManagement';

const Dashboard = () => {
  const { user, logout, hasFeatureAccess, isDemoMode, isLoading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userStats, setUserStats] = useState({
    totalProjects: 0,
    activeTeams: 0,
    completedTasks: 0,
    recentActivity: []
  });

  useEffect(() => {
    // Don't redirect if still loading auth state
    if (isLoading) {
      return;
    }

    // If not authenticated and not in demo mode, redirect to auth
    if (!user && !isDemoMode) {
      router.push('/auth');
      return;
    }

    // If we have a user, check if they need onboarding
    if (user && !user.onboardingCompleted && !isDemoMode) {
      setShowOnboarding(true);
    }

    loadUserStats();
  }, [user, isDemoMode, isLoading, router]);

  const loadUserStats = async () => {
    try {
      // Use mock data in demo mode
      if (isDemoMode) {
        setUserStats({
          totalProjects: 3,
          activeTeams: 2,
          completedTasks: 47,
          recentActivity: [
            {
              icon: '🚀',
              title: 'Completed AI Analytics Dashboard',
              timestamp: '2 hours ago'
            },
            {
              icon: '👥',
              title: 'Joined React Development Team',
              timestamp: '1 day ago'
            },
            {
              icon: '📊',
              title: 'Generated Weekly Performance Report',
              timestamp: '2 days ago'
            }
          ]
        });
        return;
      }

      // Real API call for authenticated users
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${apiUrl}/auth/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data.stats || {
          totalProjects: 0,
          activeTeams: 0,
          completedTasks: 0,
          recentActivity: []
        });
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    loadUserStats(); // Refresh stats after onboarding
  };

  const handleTeamCreated = (team) => {
    loadUserStats(); // Refresh stats when team is created
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading || (!user && !isDemoMode)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProgressiveOnboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: '📊', available: true },
    { id: 'projects', label: 'Projects', icon: '📁', available: hasFeatureAccess('projects.view') },
    { id: 'teams', label: 'Teams', icon: '👥', available: hasFeatureAccess('team.view') },
    { id: 'analytics', label: 'Analytics', icon: '📈', available: hasFeatureAccess('analytics.view') },
    { id: 'integrations', label: 'Integrations', icon: '🔗', available: hasFeatureAccess('integrations.view') },
    { id: 'settings', label: 'Settings', icon: '⚙️', available: true }
  ];

  const availableNavItems = navigationItems.filter(item => item.available);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Digame Digital Twin Platform
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName?.[0] || user.username[0]}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.subscriptionTier} • {user.email}
                  </div>
                </div>
              </div>

              {/* Subscription Badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.subscriptionTier === 'enterprise' 
                  ? 'bg-purple-100 text-purple-800'
                  : user.subscriptionTier === 'team'
                  ? 'bg-blue-100 text-blue-800'
                  : user.subscriptionTier === 'individual_pro'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.subscriptionTier.replace('_', ' ').toUpperCase()}
              </span>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 mr-8">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-2">
                {availableNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-md text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Projects</span>
                  <span className="text-sm font-medium text-gray-900">{userStats.totalProjects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Teams</span>
                  <span className="text-sm font-medium text-gray-900">{userStats.activeTeams}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tasks</span>
                  <span className="text-sm font-medium text-gray-900">{userStats.completedTasks}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === 'overview' && (
              <DashboardOverview 
                user={user} 
                stats={userStats} 
                hasFeatureAccess={hasFeatureAccess}
                onNavigate={setActiveSection}
              />
            )}

            {activeSection === 'projects' && (
              <ProjectsSection hasFeatureAccess={hasFeatureAccess} />
            )}

            {activeSection === 'teams' && (
              <TeamManagement onTeamCreated={handleTeamCreated} />
            )}

            {activeSection === 'analytics' && (
              <AnalyticsSection hasFeatureAccess={hasFeatureAccess} />
            )}

            {activeSection === 'integrations' && (
              <IntegrationsSection hasFeatureAccess={hasFeatureAccess} />
            )}

            {activeSection === 'settings' && (
              <SettingsSection user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ user, stats, hasFeatureAccess, onNavigate }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      id: 'create-project',
      title: 'Create Project',
      description: 'Start a new digital twin project',
      icon: '🚀',
      action: () => onNavigate('projects'),
      available: hasFeatureAccess('projects.create')
    },
    {
      id: 'invite-team',
      title: 'Invite Team Members',
      description: 'Collaborate with your team',
      icon: '👥',
      action: () => onNavigate('teams'),
      available: hasFeatureAccess('team.invite')
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Analyze your performance',
      icon: '📊',
      action: () => onNavigate('analytics'),
      available: hasFeatureAccess('analytics.view')
    },
    {
      id: 'setup-integrations',
      title: 'Setup Integrations',
      description: 'Connect external tools',
      icon: '🔗',
      action: () => onNavigate('integrations'),
      available: hasFeatureAccess('integrations.setup')
    }
  ];

  const availableActions = quickActions.filter(action => action.available);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {user.firstName || user.username}!
        </h1>
        <p className="text-indigo-100 text-lg">
          Welcome to your Digital Twin Platform dashboard. Let's build something amazing today.
        </p>
        <div className="mt-4 flex items-center space-x-4">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
            {user.subscriptionTier.replace('_', ' ').toUpperCase()} Plan
          </span>
          {user.isVerified && (
            <span className="bg-green-500/20 px-3 py-1 rounded-full text-sm">
              ✓ Verified Account
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📁</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Teams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeTeams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all text-left"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {stats.recentActivity?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-lg">{activity.icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-gray-600">No recent activity. Start by creating your first project!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Placeholder sections for other features
const ProjectsSection = ({ hasFeatureAccess }) => (
  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
    <div className="text-6xl mb-4">🚀</div>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Projects</h2>
    <p className="text-gray-600 mb-6">
      Create and manage your digital twin projects here.
    </p>
    {hasFeatureAccess('projects.create') ? (
      <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700">
        Create Your First Project
      </button>
    ) : (
      <div className="text-sm text-gray-500">
        Upgrade your plan to access project features
      </div>
    )}
  </div>
);

const AnalyticsSection = ({ hasFeatureAccess }) => (
  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
    <div className="text-6xl mb-4">📈</div>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
    <p className="text-gray-600 mb-6">
      Advanced analytics and insights for your digital twin projects.
    </p>
    {hasFeatureAccess('analytics.view') ? (
      <div className="text-sm text-gray-500">
        Analytics dashboard coming soon!
      </div>
    ) : (
      <div className="text-sm text-gray-500">
        Upgrade to Individual Pro or higher to access analytics
      </div>
    )}
  </div>
);

const IntegrationsSection = ({ hasFeatureAccess }) => (
  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
    <div className="text-6xl mb-4">🔗</div>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Integrations</h2>
    <p className="text-gray-600 mb-6">
      Connect with external tools and services to enhance your workflow.
    </p>
    {hasFeatureAccess('integrations.setup') ? (
      <div className="text-sm text-gray-500">
        Integration marketplace coming soon!
      </div>
    ) : (
      <div className="text-sm text-gray-500">
        Upgrade to Team or Enterprise to access integrations
      </div>
    )}
  </div>
);

const SettingsSection = ({ user }) => (
  <div className="bg-white rounded-lg shadow-sm p-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
        <input
          type="text"
          value={user.username}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={user.email}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subscription</label>
        <input
          type="text"
          value={user.subscriptionTier.replace('_', ' ').toUpperCase()}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
        />
      </div>
      <div className="pt-4">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">
          Update Profile
        </button>
      </div>
    </div>
  </div>
);

export default Dashboard;