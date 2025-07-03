import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { BarChart3, Users, TrendingUp, Activity, Bot, CheckCircle, Calendar, Bell, Crown, Menu } from 'lucide-react';
import ComprehensiveNavigation from '../src/components/navigation/ComprehensiveNavigation';

export default function Dashboard() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(true);

  // Mock Platform Owner user for demonstration
  const mockPlatformOwner = {
    name: 'Platform Owner',
    role: 'platform_owner',
    is_platform_owner: true,
    subscription_tier: 'enterprise',
    tenant_id: 1,
    tenant_name: 'Digame Platform',
    permissions: ['read', 'write', 'admin', 'platform_owner']
  };

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
      icon: <CheckCircle className="w-4 h-4 text-green-600" />
    },
    {
      type: 'ai',
      title: 'AI insight generated',
      description: 'New productivity optimization suggestion',
      time: '4 hours ago',
      icon: <Bot className="w-4 h-4 text-blue-600" />
    },
    {
      type: 'analytics',
      title: 'Weekly report ready',
      description: 'Performance analytics summary available',
      time: '1 day ago',
      icon: <BarChart3 className="w-4 h-4 text-purple-600" />
    }
  ];

  const handleLogout = () => {
    console.log('Logout clicked');
    // Add logout logic here
  };

  const toggleNavigation = () => {
    setIsNavigationOpen(!isNavigationOpen);
  };

  return (
    <>
      <Head>
        <title>Platform Owner Dashboard - Digame</title>
        <meta name="description" content="Platform Owner comprehensive dashboard with full feature access" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="flex h-screen bg-gray-50">
        {/* Comprehensive Navigation Sidebar */}
        <ComprehensiveNavigation
          isDemoMode={false}
          onLogout={handleLogout}
          currentUser={mockPlatformOwner}
          isOpen={isNavigationOpen}
          onToggle={toggleNavigation}
          showAllFeatures={true}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleNavigation}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Platform Owner Dashboard</h1>
                  <p className="text-sm text-gray-600">Complete access to all 16 sections with 92 features</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <Crown className="w-3 h-3 mr-1" />
                  Platform Owner
                </span>
              </div>
            </div>
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              {/* Welcome Section */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Welcome back, Platform Owner!</h2>
                      <p className="text-blue-100">You have complete access to all platform features and management tools.</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">16</div>
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

              {/* Platform Owner Quick Actions */}
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
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{activity.title}</div>
                          <div className="text-sm text-gray-600">{activity.description}</div>
                          <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Owner Insights */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <Crown className="w-5 h-5 inline mr-2 text-yellow-600" />
                    Platform Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="font-medium text-yellow-900 mb-2">Platform Performance</div>
                      <p className="text-sm text-yellow-800">All systems operational. 99.9% uptime maintained this month.</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-900 mb-2">User Growth</div>
                      <p className="text-sm text-blue-800">Platform user base grew by 15% this quarter. Enterprise adoption increasing.</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-900 mb-2">Revenue Trends</div>
                      <p className="text-sm text-green-800">Monthly recurring revenue up 23%. Team tier showing strong conversion.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Access Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Complete Feature Access</h3>
                  <span className="text-sm text-gray-600">16 sections • 92 features</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">4</div>
                    <div className="text-xs text-blue-800">Core Platform</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">9</div>
                    <div className="text-xs text-purple-800">Analytics & AI</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">7</div>
                    <div className="text-xs text-green-800">Digital Twin</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">9</div>
                    <div className="text-xs text-orange-800">AI Tools</div>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">6</div>
                    <div className="text-xs text-indigo-800">Workflow</div>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-lg">
                    <div className="text-lg font-bold text-pink-600">6</div>
                    <div className="text-xs text-pink-800">Team & Career</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-600">12</div>
                    <div className="text-xs text-red-800">Enterprise</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-lg font-bold text-yellow-600">7</div>
                    <div className="text-xs text-yellow-800">Platform Owner</div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}