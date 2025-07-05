import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { TrendingUp, BarChart3, PieChart, Activity, Target, RefreshCw } from 'lucide-react';

export default function AdvancedAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Try to get backend service info first
      let backendUrl = 'http://localhost:8001'; // Default fallback
      try {
        const serviceResponse = await fetch('http://localhost:8001/service-info');
        if (serviceResponse.ok) {
          const serviceInfo = await serviceResponse.json();
          backendUrl = serviceInfo.url || `http://localhost:${serviceInfo.port}`;
        }
      } catch (serviceError) {
        console.log('Using default backend URL');
      }

      // Fetch multiple analytics endpoints
      const [webResponse, behavioralResponse, performanceResponse] = await Promise.all([
        fetch(`${backendUrl}/analytics/web?timeRange=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${backendUrl}/analytics/behavioral?timeRange=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${backendUrl}/analytics/performance?timeRange=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const webData = webResponse.ok ? await webResponse.json() : null;
      const behavioralData = behavioralResponse.ok ? await behavioralResponse.json() : null;
      const performanceData = performanceResponse.ok ? await performanceResponse.json() : null;

      if (webData?.success || behavioralData?.success || performanceData?.success) {
        setAnalyticsData({
          web: webData?.data,
          behavioral: behavioralData?.data,
          performance: performanceData?.data
        });
      } else {
        // Fall back to mock data
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback
  const mockData = {
    web: {
      overview: {
        totalVisitors: 24567,
        pageViews: 89234,
        avgSessionDuration: 222,
        bounceRate: 68.5,
        trends: {
          visitors: '+12.5%',
          pageViews: '+8.2%',
          sessionDuration: '-2.1%',
          bounceRate: '+15.3%'
        }
      }
    },
    behavioral: {
      overview: {
        engagementScore: 87.3,
        taskCompletion: 92.1,
        interactionDepth: 6.8,
        predictionAccuracy: 94.5
      }
    },
    performance: {
      application: {
        responseTime: 1.2,
        throughput: 1250,
        errorRate: 0.05,
        uptime: 99.97
      }
    }
  };

  const currentData = analyticsData || mockData;

  return (
    <>
      <Head>
        <title>Advanced Analytics - Digame</title>
        <meta name="description" content="Advanced analytics dashboard with deep insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="text-gray-600">Deep insights and advanced analytics dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button
                onClick={fetchAnalyticsData}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading analytics data...</span>
            </div>
          )}

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">
                  {currentData.web?.overview?.trends?.visitors || '+24.5%'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {currentData.web?.overview?.totalVisitors?.toLocaleString() || '24,567'}
              </h3>
              <p className="text-gray-600 text-sm">Total Visitors</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">
                  +{Math.round(currentData.behavioral?.overview?.taskCompletion || 92.1)}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {currentData.behavioral?.overview?.taskCompletion?.toFixed(1) || '92.1'}%
              </h3>
              <p className="text-gray-600 text-sm">Task Completion</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-blue-600 font-medium">
                  {currentData.behavioral?.overview?.engagementScore ?
                    `+${(currentData.behavioral.overview.engagementScore - 80).toFixed(1)}%` : '+7.3%'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {currentData.behavioral?.overview?.engagementScore?.toFixed(1) || '87.3'}
              </h3>
              <p className="text-gray-600 text-sm">Engagement Score</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">
                  {currentData.performance?.application?.uptime ?
                    `${currentData.performance.application.uptime.toFixed(1)}%` : '99.9%'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {currentData.performance?.application?.uptime?.toFixed(1) || '99.9'}%
              </h3>
              <p className="text-gray-600 text-sm">System Uptime</p>
            </div>
          </div>

          {/* Advanced Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Advanced revenue trend chart</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Behavior Flow</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">User behavior flow visualization</p>
              </div>
            </div>
          </div>

          {/* Cohort Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Analysis</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Cohort</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Users</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Week 1</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Week 2</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Week 4</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Week 8</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">Jan 2025</td>
                    <td className="py-3 px-4 text-gray-900">1,234</td>
                    <td className="py-3 px-4 text-green-600">85%</td>
                    <td className="py-3 px-4 text-green-600">72%</td>
                    <td className="py-3 px-4 text-yellow-600">58%</td>
                    <td className="py-3 px-4 text-red-600">42%</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">Dec 2024</td>
                    <td className="py-3 px-4 text-gray-900">1,567</td>
                    <td className="py-3 px-4 text-green-600">82%</td>
                    <td className="py-3 px-4 text-green-600">69%</td>
                    <td className="py-3 px-4 text-yellow-600">55%</td>
                    <td className="py-3 px-4 text-red-600">38%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Metrics */}
          {currentData.performance && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentData.performance.application?.responseTime?.toFixed(1) || '1.2'}s
                  </div>
                  <div className="text-sm text-gray-600">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentData.performance.application?.throughput?.toLocaleString() || '1,250'}
                  </div>
                  <div className="text-sm text-gray-600">Requests/min</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {currentData.performance.application?.errorRate?.toFixed(2) || '0.05'}%
                  </div>
                  <div className="text-sm text-gray-600">Error Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentData.performance.application?.uptime?.toFixed(2) || '99.97'}%
                  </div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
            </div>
          )}

          {/* Behavioral Insights */}
          {currentData.behavioral && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavioral Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Engagement Score</h4>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {currentData.behavioral.overview?.engagementScore?.toFixed(1) || '87.3'}
                  </div>
                  <p className="text-sm text-gray-600">Overall user engagement level</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Interaction Depth</h4>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {currentData.behavioral.overview?.interactionDepth?.toFixed(1) || '6.8'}
                  </div>
                  <p className="text-sm text-gray-600">Average actions per session</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Prediction Accuracy</h4>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {currentData.behavioral.overview?.predictionAccuracy?.toFixed(1) || '94.5'}%
                  </div>
                  <p className="text-sm text-gray-600">AI model accuracy</p>
                </div>
              </div>
            </div>
          )}

          {/* Data Source Indicator */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">
              {analyticsData ? '📊 Live Analytics Data' : '🎭 Demo Analytics Data'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Data Source</h4>
                <p className="text-blue-100">
                  {analyticsData
                    ? 'Connected to live backend analytics service with real-time data processing.'
                    : 'Using demonstration data. Connect to backend service for live analytics.'}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Time Range</h4>
                <p className="text-blue-100">
                  Currently showing data for the {timeRange === '24h' ? 'last 24 hours' :
                    timeRange === '7d' ? 'last 7 days' :
                    timeRange === '30d' ? 'last 30 days' : 'last 90 days'}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}