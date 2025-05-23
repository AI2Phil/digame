import React from 'react';
import ProductivityChart from '../components/dashboard/ProductivityChart';

export default function DashboardPage({ isDemoMode, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Digame</span>
              </div>
              {isDemoMode && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Demo Mode
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-blue-600 font-medium">Dashboard</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Analytics</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Goals</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Reports</a>
              </nav>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm">👤</span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  {isDemoMode ? 'Exit Demo' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Digital Twin
          </h1>
          <p className="text-gray-600">
            {isDemoMode 
              ? 'Exploring with sample data - see how your professional insights would look!'
              : 'Here\'s your personalized professional development dashboard'
            }
          </p>
        </div>

        {/* Demo Banner */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    You're in Demo Mode!
                  </h3>
                  <p className="text-gray-600">
                    All data shown is sample data. Create an account to track your real professional metrics.
                  </p>
                </div>
              </div>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productivity Score</p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
                <p className="text-sm text-green-600">+5% from last week</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Focus Time</p>
                <p className="text-2xl font-bold text-gray-900">6.2h</p>
                <p className="text-sm text-green-600">+0.8h from yesterday</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collaboration</p>
                <p className="text-2xl font-bold text-gray-900">8.4</p>
                <p className="text-sm text-blue-600">Optimal range</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">🤝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">+12%</p>
                <p className="text-sm text-green-600">Above average</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Productivity Chart - Full Width on Large Screens */}
          <div className="lg:col-span-2">
            <ProductivityChart userId={1} />
          </div>
          
          {/* Side Panel */}
          <div className="space-y-6">
            {/* Recent Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Peak productivity detected
                    </p>
                    <p className="text-xs text-gray-600">
                      Your best work happens between 9-11 AM
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Collaboration improvement
                    </p>
                    <p className="text-xs text-gray-600">
                      Team interactions up 15% this week
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Skill development opportunity
                    </p>
                    <p className="text-xs text-gray-600">
                      Consider learning data visualization
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📝</span>
                    <span className="text-sm font-medium text-gray-900">Log Activity</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🎯</span>
                    <span className="text-sm font-medium text-gray-900">Set Goal</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📊</span>
                    <span className="text-sm font-medium text-gray-900">View Report</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Components Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Activity Breakdown Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Activity Breakdown
              </h3>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-600 mb-2">Activity Breakdown Chart</p>
              <p className="text-sm text-gray-500">
                Coming in Phase 1 expansion
              </p>
            </div>
          </div>
          
          {/* Recent Activities Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activities
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                View all
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">💻</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Code Review Session</p>
                  <p className="text-xs text-gray-600">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">📞</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Team Standup</p>
                  <p className="text-xs text-gray-600">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">📚</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Learning Session</p>
                  <p className="text-xs text-gray-600">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="text-blue-500">
              <span className="text-2xl">🚀</span>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-blue-900">
                Phase 1 Integration Complete
              </h4>
              <p className="text-blue-700">
                ProductivityChart successfully integrated from DigitalTwinPro. 
                {isDemoMode 
                  ? ' Currently showing sample data for demonstration.'
                  : ' Connected to your behavioral analysis data.'
                }
              </p>
            </div>
            <div className="text-sm text-blue-600">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}