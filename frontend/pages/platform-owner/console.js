import React from 'react';
import Head from 'next/head';
import { Crown, Server, Users, Building, TrendingUp, Activity, Settings, Code, AlertTriangle, CheckCircle } from 'lucide-react';

export default function PlatformConsole() {
  return (
    <>
      <Head>
        <title>Platform Console - Digame</title>
        <meta name="description" content="Platform Owner exclusive management console" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Platform Console</h1>
                <p className="text-gray-600">Comprehensive platform management and oversight</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Crown className="w-3 h-3 mr-1" />
                  PLATFORM OWNER EXCLUSIVE
                </span>
              </div>
            </div>
          </div>

          {/* Platform Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">24,567</h3>
              <p className="text-gray-600 text-sm">Total Users</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+8.2%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">147</h3>
              <p className="text-gray-600 text-sm">Active Tenants</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+18.7%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">$847K</h3>
              <p className="text-gray-600 text-sm">Monthly Revenue</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">99.9%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Healthy</h3>
              <p className="text-gray-600 text-sm">System Status</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Manage Users</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Building className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Tenant Overview</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Revenue Analytics</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <Settings className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-900">Platform Settings</span>
              </button>
            </div>
          </div>

          {/* System Health Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Database</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">API Services</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Background Jobs</span>
                  </div>
                  <span className="text-yellow-600 text-sm font-medium">Degraded</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">File Storage</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Operational</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Platform Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">New tenant registered</div>
                    <div className="text-sm text-gray-600">Acme Corp joined the platform</div>
                  </div>
                  <div className="text-xs text-gray-500">5 min ago</div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Revenue milestone reached</div>
                    <div className="text-sm text-gray-600">Monthly revenue exceeded $800K</div>
                  </div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Server className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">System update deployed</div>
                    <div className="text-sm text-gray-600">Version 2.4.1 successfully deployed</div>
                  </div>
                  <div className="text-xs text-gray-500">1 day ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Analytics Summary */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">🏆 Platform Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Growth Metrics</h4>
                <p className="text-yellow-100">User base grew 12.5% this month with 147 active tenants generating $847K in revenue.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">System Reliability</h4>
                <p className="text-yellow-100">99.9% uptime maintained with all critical services operational and responsive.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Strategic Insights</h4>
                <p className="text-yellow-100">Enterprise tier adoption increased 18.7%, indicating strong market demand for advanced features.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}