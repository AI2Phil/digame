import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BarChart3, Users, TrendingUp, Activity, Bot, CheckCircle, Calendar, Bell, Crown, Menu, Home, LogOut } from 'lucide-react';
import NextJSComprehensiveNavigation from '../src/components/navigation/NextJSComprehensiveNavigation';
import NavigationHubFooter from '../src/components/layout/NavigationHubFooter';
import { useAuth } from '../src/contexts/AuthContext';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [isNavigationOpen, setIsNavigationOpen] = useState(true);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  const quickActions = [
    { title: 'My Digital Twin', icon: <Bot className="w-5 h-5" />, path: '/digital-twin/my-twin', color: 'blue' },
    { title: 'Task Management', icon: <CheckCircle className="w-5 h-5" />, path: '/tasks', color: 'green' },
    { title: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, path: '/analytics/web', color: 'purple' },
    { title: 'AI Tools', icon: <Bot className="w-5 h-5" />, path: '/ai-tools', color: 'orange' }
  ];

  const recentActivity = [
    {
      type: 'task',
      title: 'Task completed',
      description: 'Q1 Performance Review finalized',
      time: '2 hours ago',
      icon: <CheckCircle className="w-4 h-4 text-green-600" />,
      path: '/tasks'
    },
    {
      type: 'ai',
      title: 'AI insight generated',
      description: 'New productivity optimization suggestion',
      time: '4 hours ago',
      icon: <Bot className="w-4 h-4 text-blue-600" />,
      path: '/ai-tools'
    },
    {
      type: 'analytics',
      title: 'Weekly report ready',
      description: 'Performance analytics summary available',
      time: '1 day ago',
      icon: <BarChart3 className="w-4 h-4 text-purple-600" />,
      path: '/analytics/web'
    }
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const toggleNavigation = () => {
    setIsNavigationOpen(!isNavigationOpen);
  };

  // Debug: Log user object to console
  React.useEffect(() => {
    if (user) {
      console.log('Dashboard - Current user object:', user);
      console.log('Dashboard - isPlatformOwner:', user.isPlatformOwner);
      console.log('Dashboard - role:', user.role);
      console.log('Dashboard - subscriptionTier:', user.subscriptionTier);
    }
  }, [user]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Platform Owner Dashboard - Digame</title>
        <meta name="description" content="Platform Owner comprehensive dashboard with full feature access" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="flex min-h-screen bg-gray-50">
        {/* Comprehensive Navigation Sidebar */}
        <NextJSComprehensiveNavigation
          isDemoMode={user?.isDemoMode || false}
          onLogout={handleLogout}
          currentUser={{
            name: user?.fullName || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username,
            role: user?.role,
            is_platform_owner: user?.isPlatformOwner,
            subscription_tier: user?.subscriptionTier,
            tenant_id: user?.teamId,
            tenant_name: user?.teamId ? `Team ${user?.teamId}` : 'Individual',
            permissions: user?.permissions || []
          }}
          isOpen={isNavigationOpen}
          onToggle={toggleNavigation}
          showAllFeatures={true}
        />

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isNavigationOpen ? 'ml-0' : 'ml-0'
        }`}>
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleNavigation}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                  title={isNavigationOpen ? 'Collapse Menu' : 'Expand Menu'}
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user?.isPlatformOwner ? 'Platform Owner Dashboard' : 'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {user?.isPlatformOwner
                      ? 'Complete access to all 14 sections with 95+ features'
                      : 'Your personal productivity dashboard'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link href="/">
                  <button className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow" title="Return to Home">
                    <Home className="w-5 h-5 text-gray-600" />
                  </button>
                </Link>
                <button className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
                {user?.subscriptionTier && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 capitalize">
                    {user.subscriptionTier.replace('_', ' ')}
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1">
            <div className="container mx-auto px-6 py-8">
              {/* Debug Section - Temporary */}
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info (Temporary)</h3>
                <div className="text-xs text-yellow-700 space-y-1">
                  <div>User ID: {user?.id}</div>
                  <div>Username: {user?.username}</div>
                  <div>Role: {user?.role}</div>
                  <div>Subscription Tier: {user?.subscriptionTier}</div>
                  <div>Is Platform Owner: {user?.isPlatformOwner ? 'YES' : 'NO'}</div>
                  <div>Is Demo Mode: {user?.isDemoMode ? 'YES' : 'NO'}</div>
                  <div>Permissions: {user?.permissions?.join(', ')}</div>
                </div>
              </div>

              {/* Welcome Section */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Welcome back, {user?.firstName || user?.name || user?.username || 'User'}!
                      </h2>
                      <p className="text-blue-100">
                        {user?.isPlatformOwner
                          ? 'You have complete access to all platform features and management tools.'
                          : 'Access your personalized dashboard and productivity tools.'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        {user?.isPlatformOwner ? '14' : '12'}
                      </div>
                      <div className="text-sm text-blue-200">Feature Sections</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics - Clickable Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link href="/tasks">
                  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm text-green-600 font-medium">+12%</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">24</h3>
                    <p className="text-gray-600 text-sm">Tasks Completed</p>
                  </div>
                </Link>

                <Link href="/analytics/performance">
                  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-sm text-green-600 font-medium">+8%</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">87%</h3>
                    <p className="text-gray-600 text-sm">Productivity Score</p>
                  </div>
                </Link>

                <Link href="/digital-twin/my-twin">
                  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-sm text-blue-600 font-medium">Active</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">94%</h3>
                    <p className="text-gray-600 text-sm">AI Twin Accuracy</p>
                  </div>
                </Link>

                <Link href="/analytics/behavioral">
                  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="text-sm text-green-600 font-medium">+15%</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">6.2h</h3>
                    <p className="text-gray-600 text-sm">Focus Time Today</p>
                  </div>
                </Link>
              </div>

              {/* Platform Owner Quick Actions - Only show for platform owners */}
              {user?.isPlatformOwner && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <Crown className="w-5 h-5 inline mr-2 text-yellow-600" />
                    Platform Owner Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/platform-owner/console">
                      <div className="p-4 rounded-lg border-2 border-transparent hover:border-yellow-200 hover:bg-yellow-50 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                          <Crown className="w-5 h-5 text-yellow-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">Platform Console</h4>
                        <p className="text-xs text-gray-600 mt-1">Manage entire platform</p>
                      </div>
                    </Link>
                    <Link href="/platform-owner/users">
                      <div className="p-4 rounded-lg border-2 border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">User Management</h4>
                        <p className="text-xs text-gray-600 mt-1">All platform users</p>
                      </div>
                    </Link>
                    <Link href="/platform-owner/revenue">
                      <div className="p-4 rounded-lg border-2 border-transparent hover:border-green-200 hover:bg-green-50 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">Revenue Analytics</h4>
                        <p className="text-xs text-gray-600 mt-1">Business intelligence</p>
                      </div>
                    </Link>
                    <Link href="/platform-owner/health">
                      <div className="p-4 rounded-lg border-2 border-transparent hover:border-purple-200 hover:bg-purple-50 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                          <Activity className="w-5 h-5 text-purple-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">System Health</h4>
                        <p className="text-xs text-gray-600 mt-1">Platform monitoring</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}

              {/* Regular Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.path}>
                      <div className={`p-4 rounded-lg border-2 border-transparent hover:border-${action.color}-200 hover:bg-${action.color}-50 transition-all cursor-pointer`}>
                        <div className={`w-10 h-10 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                          {action.icon}
                        </div>
                        <h4 className="font-medium text-gray-900">{action.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <Link key={index} href={activity.path}>
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-200">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            {activity.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{activity.title}</div>
                            <div className="text-sm text-gray-600">{activity.description}</div>
                            <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Platform Owner Insights or Personal Insights */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {user?.isPlatformOwner ? (
                      <>
                        <Crown className="w-5 h-5 inline mr-2 text-yellow-600" />
                        Platform Insights
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5 inline mr-2 text-blue-600" />
                        Personal Insights
                      </>
                    )}
                  </h3>
                  <div className="space-y-4">
                    {user?.isPlatformOwner ? (
                      <>
                        <Link href="/platform-owner/health">
                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-yellow-300">
                            <div className="font-medium text-yellow-900 mb-2">Platform Performance</div>
                            <p className="text-sm text-yellow-800">All systems operational. 99.9% uptime maintained this month.</p>
                          </div>
                        </Link>
                        <Link href="/platform-owner/users">
                          <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-200">
                            <div className="font-medium text-blue-900 mb-2">User Growth</div>
                            <p className="text-sm text-blue-800">Platform user base grew by 15% this quarter. Enterprise adoption increasing.</p>
                          </div>
                        </Link>
                        <Link href="/platform-owner/revenue">
                          <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-green-200">
                            <div className="font-medium text-green-900 mb-2">Revenue Trends</div>
                            <p className="text-sm text-green-800">Monthly recurring revenue up 23%. Team tier showing strong conversion.</p>
                          </div>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/analytics/performance">
                          <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-200">
                            <div className="font-medium text-blue-900 mb-2">Productivity Trends</div>
                            <p className="text-sm text-blue-800">Your productivity has increased by 15% this week. Great progress!</p>
                          </div>
                        </Link>
                        <Link href="/tasks">
                          <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-green-200">
                            <div className="font-medium text-green-900 mb-2">Goal Progress</div>
                            <p className="text-sm text-green-800">You're 80% towards your monthly goals. Keep up the excellent work!</p>
                          </div>
                        </Link>
                        <Link href="/ai-tools">
                          <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-purple-200">
                            <div className="font-medium text-purple-900 mb-2">AI Recommendations</div>
                            <p className="text-sm text-purple-800">Based on your patterns, consider scheduling focused work blocks in the morning.</p>
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Navigation Hub Footer */}
          <NavigationHubFooter />
        </div>
      </div>
    </>
  );
}