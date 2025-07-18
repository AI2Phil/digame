import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../../components/PageHeader';

const ReportAnalytics: React.FC = () => {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('usage');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/reports/analytics?timeRange=${timeRange}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportUsageStats = [
    {
      reportType: 'Performance Reports',
      generated: 1247,
      viewed: 3891,
      shared: 234,
      avgViewTime: '4m 32s',
      engagement: 87,
    },
    {
      reportType: 'Analytics Dashboards',
      generated: 892,
      viewed: 2156,
      shared: 178,
      avgViewTime: '6m 18s',
      engagement: 92,
    },
    {
      reportType: 'Custom Reports',
      generated: 634,
      viewed: 1543,
      shared: 89,
      avgViewTime: '3m 45s',
      engagement: 78,
    },
    {
      reportType: 'Scheduled Reports',
      generated: 2341,
      viewed: 4567,
      shared: 456,
      avgViewTime: '2m 12s',
      engagement: 65,
    },
  ];

  const topReports = [
    {
      id: 1,
      title: 'Monthly Performance Summary',
      category: 'Performance',
      views: 2341,
      shares: 156,
      rating: 4.8,
      lastGenerated: '2 hours ago',
    },
    {
      id: 2,
      title: 'Team Productivity Analysis',
      category: 'Analytics',
      views: 1987,
      shares: 134,
      rating: 4.6,
      lastGenerated: '5 hours ago',
    },
    {
      id: 3,
      title: 'Revenue Growth Trends',
      category: 'Business',
      views: 1654,
      shares: 98,
      rating: 4.9,
      lastGenerated: '1 day ago',
    },
    {
      id: 4,
      title: 'User Engagement Metrics',
      category: 'Analytics',
      views: 1432,
      shares: 87,
      rating: 4.5,
      lastGenerated: '3 hours ago',
    },
    {
      id: 5,
      title: 'Security Compliance Report',
      category: 'Security',
      views: 1298,
      shares: 76,
      rating: 4.7,
      lastGenerated: '6 hours ago',
    },
  ];

  const performanceMetrics = [
    { metric: 'Average Generation Time', value: '2.3s', change: '-15%', trend: 'down' },
    { metric: 'Report Accuracy', value: '98.7%', change: '+2.1%', trend: 'up' },
    { metric: 'User Satisfaction', value: '4.6/5', change: '+0.3', trend: 'up' },
    { metric: 'Error Rate', value: '0.8%', change: '-0.4%', trend: 'down' },
  ];

  const engagementTrends = [
    { date: '2024-01-01', views: 1200, shares: 45, downloads: 23 },
    { date: '2024-01-02', views: 1350, shares: 52, downloads: 28 },
    { date: '2024-01-03', views: 1180, shares: 38, downloads: 19 },
    { date: '2024-01-04', views: 1420, shares: 61, downloads: 34 },
    { date: '2024-01-05', views: 1580, shares: 73, downloads: 41 },
    { date: '2024-01-06', views: 1340, shares: 48, downloads: 26 },
    { date: '2024-01-07', views: 1650, shares: 82, downloads: 47 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Report Analytics"
        subtitle="Comprehensive analytics for report usage and performance"
        breadcrumbs={[
          { label: 'Reports', href: '/reports' },
          { label: 'Analytics', href: '/reports/analytics' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Export Analytics
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'usage', label: 'Usage Analytics' },
              { id: 'performance', label: 'Performance' },
              { id: 'engagement', label: 'Engagement' },
              { id: 'insights', label: 'Insights' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Usage Analytics Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Reports Generated</h3>
                <div className="text-3xl font-bold text-gray-900 mt-2">5,114</div>
                <div className="text-sm text-green-600 mt-1">+12.5% from last month</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
                <div className="text-3xl font-bold text-gray-900 mt-2">12,157</div>
                <div className="text-sm text-green-600 mt-1">+8.3% from last month</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Shares</h3>
                <div className="text-3xl font-bold text-gray-900 mt-2">957</div>
                <div className="text-sm text-green-600 mt-1">+15.7% from last month</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Avg Engagement</h3>
                <div className="text-3xl font-bold text-gray-900 mt-2">81%</div>
                <div className="text-sm text-green-600 mt-1">+3.2% from last month</div>
              </div>
            </div>

            {/* Report Usage Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Report Usage by Type</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Generated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Viewed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shared
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg View Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Engagement
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportUsageStats.map((stat, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stat.reportType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stat.generated.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stat.viewed.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stat.shared.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stat.avgViewTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${stat.engagement}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">{stat.engagement}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500">{metric.metric}</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</div>
                  <div
                    className={`text-sm mt-1 ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {metric.change} from last period
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trends</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-gray-600">Performance metrics visualization</p>
                  <p className="text-sm text-gray-500">
                    Chart showing generation time, accuracy, and satisfaction trends
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === 'engagement' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Top Performing Reports</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topReports.map(report => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {report.category}
                          </span>
                          <span>{report.views.toLocaleString()} views</span>
                          <span>{report.shares} shares</span>
                          <span>★ {report.rating}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{report.lastGenerated}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Trends</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-gray-600">Engagement trends visualization</p>
                  <p className="text-sm text-gray-500">
                    Chart showing views, shares, and downloads over time
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">📊 Peak Usage Times</h4>
                    <p className="text-blue-800 text-sm">
                      Reports are most frequently generated between 9-11 AM and 2-4 PM on weekdays.
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">🎯 High Engagement Content</h4>
                    <p className="text-green-800 text-sm">
                      Performance and analytics reports have 40% higher engagement than other types.
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">📱 Mobile Usage</h4>
                    <p className="text-purple-800 text-sm">
                      35% of report views happen on mobile devices, with shorter average view times.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-900 mb-2">⚡ Optimize Generation</h4>
                    <p className="text-orange-800 text-sm">
                      Pre-generate popular reports during off-peak hours to improve response times.
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">📱 Mobile Optimization</h4>
                    <p className="text-yellow-800 text-sm">
                      Create mobile-optimized report formats to improve engagement on smaller
                      screens.
                    </p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-medium text-indigo-900 mb-2">🔄 Automated Insights</h4>
                    <p className="text-indigo-800 text-sm">
                      Implement automated insight generation for frequently accessed reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportAnalytics;
