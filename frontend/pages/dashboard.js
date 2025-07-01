import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter } from 'next/router';
import ProgressiveOnboarding from '../src/components/onboarding/ProgressiveOnboarding';
import TeamManagement from '../src/components/team/TeamManagement';
import demoDataService from '../src/services/demoDataService';
import apiService from '../src/services/apiService';

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
      // SECURITY: Use isolated demo data service in demo mode
      if (isDemoMode) {
        console.log('[DEMO MODE] Loading mock user stats - NO real data access');
        const demoStats = demoDataService.getUserStats(isDemoMode);
        setUserStats(demoStats);
        return;
      }

      // SECURITY: Real API call ONLY for authenticated users
      console.log('[AUTHENTICATED MODE] Loading real user stats from backend');
      const response = await apiService.get('/auth/stats');

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
              <ProjectsSection hasFeatureAccess={hasFeatureAccess} isDemoMode={isDemoMode} />
            )}

            {activeSection === 'teams' && (
              <TeamManagement onTeamCreated={handleTeamCreated} />
            )}

            {activeSection === 'analytics' && (
              <AnalyticsSection hasFeatureAccess={hasFeatureAccess} isDemoMode={isDemoMode} />
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

  // Get personalized welcome message based on user's goals
  const getPersonalizedMessage = () => {
    const goals = user.onboardingData?.goals || [];
    if (goals.includes('productivity')) {
      return "Let's boost your productivity and optimize your workflows today.";
    } else if (goals.includes('team_performance')) {
      return "Ready to enhance your team's collaboration and performance?";
    } else if (goals.includes('data_insights')) {
      return "Time to dive into your data and discover valuable insights.";
    } else if (goals.includes('skill_development')) {
      return "Continue your learning journey and develop new professional skills.";
    }
    return "Welcome to your Digital Twin Platform dashboard. Let's build something amazing today.";
  };

  // Generate personalized quick actions based on user interests and goals
  const getPersonalizedActions = () => {
    const interests = user.onboardingData?.interests || [];
    const goals = user.onboardingData?.goals || [];
    const experienceLevel = user.onboardingData?.experienceLevel || 'intermediate';
    
    const allActions = [
      {
        id: 'create-project',
        title: 'Create Project',
        description: 'Start a new digital twin project',
        icon: '🚀',
        action: () => onNavigate('projects'),
        available: hasFeatureAccess('projects.create'),
        priority: goals.includes('productivity') ? 10 : 5
      },
      {
        id: 'view-analytics',
        title: 'View Analytics',
        description: 'Analyze your performance data',
        icon: '📊',
        action: () => onNavigate('analytics'),
        available: hasFeatureAccess('analytics.view'),
        priority: interests.includes('analytics') || goals.includes('data_insights') ? 10 : 3
      },
      {
        id: 'invite-team',
        title: 'Invite Team Members',
        description: 'Collaborate with your team',
        icon: '👥',
        action: () => onNavigate('teams'),
        available: hasFeatureAccess('team.invite'),
        priority: interests.includes('team') || goals.includes('team_performance') ? 10 : 4
      },
      {
        id: 'setup-integrations',
        title: 'Setup Integrations',
        description: 'Connect external tools',
        icon: '🔗',
        action: () => onNavigate('integrations'),
        available: hasFeatureAccess('integrations.setup'),
        priority: experienceLevel === 'advanced' || experienceLevel === 'expert' ? 8 : 2
      },
      {
        id: 'ai-coaching',
        title: 'AI Coaching Session',
        description: 'Get personalized AI recommendations',
        icon: '🤖',
        action: () => onNavigate('analytics'),
        available: interests.includes('ai') && hasFeatureAccess('analytics.view'),
        priority: interests.includes('ai') ? 9 : 0
      },
      {
        id: 'skill-development',
        title: 'Learning Path',
        description: 'Continue your skill development',
        icon: '📚',
        action: () => onNavigate('analytics'),
        available: interests.includes('learning') || goals.includes('skill_development'),
        priority: goals.includes('skill_development') ? 9 : 0
      },
      {
        id: 'networking',
        title: 'Professional Network',
        description: 'Connect with industry peers',
        icon: '🌐',
        action: () => onNavigate('teams'),
        available: interests.includes('networking') || goals.includes('network_building'),
        priority: goals.includes('network_building') ? 8 : 0
      },
      {
        id: 'productivity-tools',
        title: 'Productivity Tools',
        description: 'Optimize your workflows',
        icon: '⚡',
        action: () => onNavigate('integrations'),
        available: interests.includes('productivity') && hasFeatureAccess('integrations.view'),
        priority: interests.includes('productivity') ? 8 : 0
      }
    ];

    return allActions
      .filter(action => action.available && action.priority > 0)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 4); // Show top 4 personalized actions
  };

  const availableActions = getPersonalizedActions();

  // Get personalized insights based on user data
  const getPersonalizedInsights = () => {
    const interests = user.onboardingData?.interests || [];
    const goals = user.onboardingData?.goals || [];
    const insights = [];

    if (interests.includes('analytics') && stats.totalProjects === 0) {
      insights.push({
        type: 'suggestion',
        icon: '📊',
        title: 'Start with Analytics',
        message: 'Create your first project to begin tracking meaningful data and insights.'
      });
    }

    if (goals.includes('team_performance') && stats.activeTeams === 0) {
      insights.push({
        type: 'action',
        icon: '👥',
        title: 'Build Your Team',
        message: 'Invite team members to start collaborating and improving performance together.'
      });
    }

    if (interests.includes('ai') && user.subscriptionTier === 'free') {
      insights.push({
        type: 'upgrade',
        icon: '🤖',
        title: 'Unlock AI Features',
        message: 'Upgrade to access AI-powered coaching and advanced recommendations.'
      });
    }

    return insights;
  };

  const personalizedInsights = getPersonalizedInsights();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {user.firstName || user.username}!
        </h1>
        <p className="text-indigo-100 text-lg">
          {getPersonalizedMessage()}
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
          {user.onboardingData?.interests?.length > 0 && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {user.onboardingData.interests.length} Interest{user.onboardingData.interests.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Personalized Insights */}
      {personalizedInsights.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Personalized Insights</h2>
          <div className="space-y-3">
            {personalizedInsights.map((insight, index) => (
              <div key={index} className={`flex items-start space-x-3 p-4 rounded-lg ${
                insight.type === 'upgrade' ? 'bg-purple-50 border border-purple-200' :
                insight.type === 'action' ? 'bg-blue-50 border border-blue-200' :
                'bg-green-50 border border-green-200'
              }`}>
                <div className="text-2xl">{insight.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{insight.title}</h3>
                  <p className="text-sm text-gray-600">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

// Enhanced Projects section with secure demo data isolation
const ProjectsSection = ({ hasFeatureAccess, isDemoMode }) => {
  if (isDemoMode) {
    // SECURITY: Use isolated demo data service - NO real data access
    console.log('[DEMO MODE] Loading mock projects - NO real data access');
    const demoProjects = demoDataService.getProjects(isDemoMode);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">
            + New Project
          </button>
        </div>
        
        <div className="grid gap-6">
          {demoProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-gray-600 mt-1">{project.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'Active' ? 'bg-green-100 text-green-800' :
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Team: {project.team}</span>
                <span>Updated {project.lastUpdated}</span>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Demo CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to create your own projects?</h3>
              <p className="text-gray-600">Start with our free plan and build unlimited personal projects.</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 whitespace-nowrap">
              Start Free Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
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
};

const AnalyticsSection = ({ hasFeatureAccess, isDemoMode }) => {
  if (isDemoMode) {
    // SECURITY: Use isolated demo data service - NO real data access
    console.log('[DEMO MODE] Loading mock analytics - NO real data access');
    const demoAnalytics = demoDataService.getAnalytics(isDemoMode);
    const weeklyData = demoAnalytics.weeklyData;
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Export Report
            </button>
            <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Customize View
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productivity Score</p>
                <p className="text-2xl font-bold text-gray-900">{demoAnalytics.productivity.current}%</p>
              </div>
              <div className="text-green-600 text-sm font-medium">
                +{demoAnalytics.productivity.change}%
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">vs last week</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Focus Time</p>
                <p className="text-2xl font-bold text-gray-900">{demoAnalytics.focusTime.current}h</p>
              </div>
              <div className="text-green-600 text-sm font-medium">
                +{demoAnalytics.focusTime.change}h
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">Target: {demoAnalytics.focusTime.target}h</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collaboration</p>
                <p className="text-2xl font-bold text-gray-900">{demoAnalytics.collaboration.current}/10</p>
              </div>
              <div className="text-green-600 text-sm font-medium">
                +{demoAnalytics.collaboration.change}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">Team engagement</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">{demoAnalytics.growthRate.current}%</p>
              </div>
              <div className="text-green-600 text-sm font-medium">
                +{demoAnalytics.growthRate.change}%
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">Skill development</div>
          </div>
        </div>

        {/* Weekly Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance Trends</h3>
          <div className="grid grid-cols-7 gap-4">
            {weeklyData.map((day) => (
              <div key={day.day} className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">{day.day}</div>
                <div className="bg-indigo-100 rounded-lg p-3">
                  <div className="text-lg font-bold text-indigo-800">{day.productivity}%</div>
                  <div className="text-xs text-indigo-600">Productivity</div>
                </div>
                <div className="mt-2 text-xs text-gray-500">{day.focus}h focus</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI-Powered Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-600">💡</div>
              <div>
                <p className="font-medium text-gray-900">Peak Performance Pattern Detected</p>
                <p className="text-sm text-gray-600">Your productivity is 23% higher between 9-11 AM. Consider scheduling important tasks during this window.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <div className="text-green-600">📈</div>
              <div>
                <p className="font-medium text-gray-900">Collaboration Improvement</p>
                <p className="text-sm text-gray-600">Your team engagement has increased 21% this month. Great job on active participation!</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-600">🎯</div>
              <div>
                <p className="font-medium text-gray-900">Focus Time Recommendation</p>
                <p className="text-sm text-gray-600">Try the Pomodoro technique to reach your 8-hour focus goal. You're 78% of the way there!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo CTA */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Advanced Analytics</h3>
              <p className="text-gray-600">Get deeper insights, custom reports, and AI-powered recommendations with our free plan.</p>
            </div>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 whitespace-nowrap">
              Start Free Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
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
};

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

const SettingsSection = ({ user }) => {
  const [preferences, setPreferences] = useState({
    interests: user.onboardingData?.interests || [],
    goals: user.onboardingData?.goals || [],
    experienceLevel: user.onboardingData?.experienceLevel || 'intermediate',
    teamChoice: user.onboardingData?.teamChoice || 'individual',
    notifications: {
      email: user.preferences?.email !== false,
      push: user.preferences?.push !== false,
      marketing: user.preferences?.marketing === true
    }
  });

  const interestOptions = [
    { id: 'analytics', label: 'Data Analytics', icon: '📊' },
    { id: 'ai', label: 'Artificial Intelligence', icon: '🤖' },
    { id: 'team', label: 'Team Management', icon: '👥' },
    { id: 'productivity', label: 'Productivity', icon: '⚡' },
    { id: 'networking', label: 'Professional Networking', icon: '🌐' },
    { id: 'learning', label: 'Continuous Learning', icon: '📚' }
  ];

  const goalOptions = [
    { id: 'productivity', label: 'Increase Productivity' },
    { id: 'team_performance', label: 'Improve Team Performance' },
    { id: 'skill_development', label: 'Develop New Skills' },
    { id: 'data_insights', label: 'Gain Data Insights' },
    { id: 'network_building', label: 'Build Professional Network' },
    { id: 'career_advancement', label: 'Advance Career' }
  ];

  const toggleInterest = (interestId) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const toggleGoal = (goalId) => {
    setPreferences(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(id => id !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const updateNotification = (type, value) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
            <select
              value={preferences.experienceLevel}
              onChange={(e) => setPreferences(prev => ({ ...prev, experienceLevel: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interests & Preferences */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Interests</h3>
        <p className="text-sm text-gray-600 mb-4">These help us personalize your dashboard and recommendations.</p>
        <div className="grid md:grid-cols-2 gap-3">
          {interestOptions.map((interest) => (
            <label key={interest.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.interests.includes(interest.id)}
                onChange={() => toggleInterest(interest.id)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-lg">{interest.icon}</span>
              <span className="text-sm font-medium text-gray-700">{interest.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Goals</h3>
        <p className="text-sm text-gray-600 mb-4">Select your current professional goals to get relevant features and insights.</p>
        <div className="space-y-2">
          {goalOptions.map((goal) => (
            <label key={goal.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.goals.includes(goal.id)}
                onChange={() => toggleGoal(goal.id)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">{goal.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Email Notifications</span>
              <p className="text-xs text-gray-500">Receive updates about your progress and new features</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.email}
              onChange={(e) => updateNotification('email', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Push Notifications</span>
              <p className="text-xs text-gray-500">Get notified about important updates and reminders</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.push}
              onChange={(e) => updateNotification('push', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Marketing Communications</span>
              <p className="text-xs text-gray-500">Receive tips, best practices, and product updates</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.marketing}
              onChange={(e) => updateNotification('marketing', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Save Changes</h3>
            <p className="text-xs text-gray-500">Update your preferences to personalize your experience</p>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">
            Save Preferences
          </button>
        </div>
      </div>

      {/* Reset Onboarding */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-orange-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-orange-900">Reset Onboarding</h3>
            <p className="text-xs text-orange-700">Go through the setup process again to update your preferences</p>
          </div>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 text-sm">
            Restart Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;