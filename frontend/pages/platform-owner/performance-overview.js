import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { usePlatformOwnerAccess, hasPermission, getAccessLevel } from '../../src/utils/platformOwnerAuth';
import { Gauge, TrendingUp, Users, Clock, AlertTriangle, CheckCircle, Shield, Download, RefreshCw, Settings } from 'lucide-react';

export default function PlatformPerformanceOverview() {
  const { hasAccess, loading: authLoading, userRole, userPermissions } = usePlatformOwnerAccess();
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const accessLevel = getAccessLevel(userRole, userPermissions);

  useEffect(() => {
    // Simulate loading performance data
    setTimeout(() => {
      setPerformanceData({
        responseTime: 245,
        throughput: 1250,
        errorRate: 0.02,
        userSatisfaction: 94.5,
        uptime: 99.97
      });
      setLoading(false);
    }, 1000);
  }, []);

  // Show auth loading first
  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying Platform Owner access...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Check access control
  if (!hasAccess) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
              <p className="text-gray-600 mb-6">
                You don't have permission to access Platform Owner performance analytics.
              </p>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <span>Platform Owner</span>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">Platform Performance Dashboard</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Gauge className="w-8 h-8 text-blue-600 mr-3" />
                  Platform Performance Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Comprehensive platform-wide performance metrics, response times, and user satisfaction scores
                </p>
                <div className="mt-2 flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${accessLevel.color}-100 text-${accessLevel.color}-800`}>
                    {accessLevel.level}
                  </span>
                  <span className="text-xs text-gray-500">
                    Authenticated as: {userRole}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {hasPermission('analytics_access', userPermissions) && (
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </button>
                )}
                <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </button>
                {hasPermission('system_administration', userPermissions) && (
                  <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Response Time Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceData.responseTime}ms</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>12% improvement from last week</span>
                  </div>
                </div>
              </div>

              {/* Throughput Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Requests/Second</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceData.throughput.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-blue-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>8% increase from last week</span>
                  </div>
                </div>
              </div>

              {/* Error Rate Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{(performanceData.errorRate * 100).toFixed(2)}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Within acceptable range</span>
                  </div>
                </div>
              </div>

              {/* User Satisfaction Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">User Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceData.userSatisfaction}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>2% improvement this month</span>
                  </div>
                </div>
              </div>

              {/* Uptime Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Platform Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceData.uptime}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Exceeding SLA targets</span>
                  </div>
                </div>
              </div>

              {/* Coming Soon Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 border-2 border-dashed border-blue-200">
                <div className="text-center">
                  <Gauge className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
                  <p className="text-sm text-gray-600 mb-4">Real-time performance insights, predictive analytics, and automated optimization recommendations coming soon.</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Backend Integration In Progress
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}