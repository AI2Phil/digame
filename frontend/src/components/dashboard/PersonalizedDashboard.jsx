import React from 'react';
import ProductivityMetricCard from './ProductivityMetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const PersonalizedDashboard = ({ userId = 1 }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Your Personalized Dashboard
        </h2>
        <p className="text-gray-600">
          Track your productivity metrics and digital activities in real-time.
        </p>
      </div>

      {/* Productivity Metrics Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Productivity Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Activities Today Card - This is the Phase 1 component being integrated */}
          <ProductivityMetricCard userId={userId} />
          
          {/* Placeholder cards for future metrics */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Focus Hours</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-gray-900">6.2</p>
                    <div className="flex items-center space-x-1 text-green-600">
                      <span className="text-sm font-medium">+12%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">from yesterday</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-xl">⏰</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Tasks Completed</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-gray-900">18</p>
                    <div className="flex items-center space-x-1 text-green-600">
                      <span className="text-sm font-medium">+3</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">from yesterday</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-purple-600 text-xl">✅</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <Card>
          <CardHeader>
            <CardTitle>Digital Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Meeting joined</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Document edited</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Code review completed</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 text-lg">📊</span>
              </div>
              <p className="text-sm font-medium text-gray-900">View Analytics</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 text-lg">📝</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Create Task</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 text-lg">📈</span>
              </div>
              <p className="text-sm font-medium text-gray-900">View Reports</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 text-lg">⚙️</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Settings</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedDashboard;