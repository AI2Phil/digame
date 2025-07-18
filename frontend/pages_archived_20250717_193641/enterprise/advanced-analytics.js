import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';

const AdvancedAnalytics = () => {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('revenue');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/enterprise/advanced-analytics?timeRange=${timeRange}`);
      const data = await response.json();
      setAnalyticsData(data.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockAnalyticsData = {
    summary: {
      totalRevenue: 2400000,
      revenueGrowth: 15.7,
      userGrowth: 8.3,
      churnRate: 2.1,
      averageRevenuePerUser: 155.42
    },
    revenueAnalytics: {
      monthly: [
        { month: 'Jan', revenue: 2100000, growth: 12.3, forecast: 2050000 },
        { month: 'Feb', revenue: 2200000, growth: 4.8, forecast: 2150000 },
        { month: 'Mar', revenue: 2350000, growth: 6.8, forecast: 2300000 },
        { month: 'Apr', revenue: 2400000, growth: 2.1, forecast: 2380000 },
        { month: 'May', revenue: null, growth: null, forecast: 2520000 },
        { month: 'Jun', revenue: null, growth: null, forecast: 2650000 }
      ],
      byTenant: [
        { tenant: 'TechCorp Solutions', revenue: 456000, percentage: 19.0, growth: 23.5 },
        { tenant: 'Global Industries', revenue: 382000, percentage: 15.9, growth: 18.2 },
        { tenant: 'DataFlow Inc', revenue: 321000, percentage: 13.4, growth: 12.8 },
        { tenant: 'Innovation Labs', revenue: 289000, percentage: 12.0, growth: 28.1 },
        { tenant: 'Future Systems', revenue: 254000, percentage: 10.6, growth: 15.7 }
      ]
    },
    userAnalytics: {
      acquisition: {
        organic: 45,
        referral: 23,
        paid: 18,
        direct: 14
      },
      engagement: {
        dailyActiveUsers: 8234,
        weeklyActiveUsers: 12456,
        monthlyActiveUsers: 15432,
        averageSessionDuration: '24m 35s',
        pageViewsPerSession: 8.7,
        bounceRate: 23.4
      },
      retention: {
        day1: 89,
        day7: 67,
        day30: 45,
        day90: 32
      }
    },
    performanceMetrics: {
      systemPerformance: {
        averageResponseTime: 245,
        uptime: 99.97,
        errorRate: 0.03,
        throughput: 15420
      },
      featureUsage: [
        { feature: 'Analytics Dashboard', usage: 92, trend: 'up' },
        { feature: 'AI Tools', usage: 78, trend: 'up' },
        { feature: 'Team Collaboration', usage: 85, trend: 'stable' },
        { feature: 'Workflow Automation', usage: 67, trend: 'up' },
        { feature: 'Custom Reports', usage: 54, trend: 'down' },
        { feature: 'API Integration', usage: 71, trend: 'up' }
      ]
    },
    predictiveAnalytics: {
      revenueForcast: [
        { month: 'May', predicted: 2520000, confidence: 87, range: [2450000, 2590000] },
        { month: 'Jun', predicted: 2650000, confidence: 82, range: [2570000, 2730000] },
        { month: 'Jul', predicted: 2780000, confidence: 78, range: [2680000, 2880000] },
        { month: 'Aug', predicted: 2920000, confidence: 74, range: [2800000, 3040000] }
      ],
      churnPrediction: {
        highRisk: 23,
        mediumRisk: 45,
        lowRisk: 179,
        factors: ['Payment Issues', 'Low Engagement', 'Support Tickets', 'Feature Usage']
      }
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

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
        title="Advanced Analytics"
        subtitle="Enterprise-grade analytics and business intelligence"
        breadcrumbs={[
          { label: 'Enterprise', href: '/enterprise' },
          { label: 'Advanced Analytics', href: '/enterprise/advanced-analytics' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Compare Periods
            </button>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Export Data
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Create Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              ${(mockAnalyticsData.summary.totalRevenue / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-green-600 mt-1">+{mockAnalyticsData.summary.revenueGrowth}%</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">User Growth</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">{mockAnalyticsData.summary.userGrowth}%</div>
            <div className="text-sm text-green-600 mt-1">Month over month</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Churn Rate</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">{mockAnalyticsData.summary.churnRate}%</div>
            <div className="text-sm text-red-600 mt-1">-0.3% improvement</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">ARPU</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">${mockAnalyticsData.summary.averageRevenuePerUser}</div>
            <div className="text-sm text-green-600 mt-1">+$12.50 increase</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {(mockAnalyticsData.userAnalytics.engagement.monthlyActiveUsers / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-green-600 mt-1">+8.3% growth</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'revenue', label: 'Revenue Analytics' },
              { id: 'users', label: 'User Analytics' },
              { id: 'performance', label: 'Performance' },
              { id: 'predictive', label: 'Predictive Analytics' }
            ].map((tab) => (
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

        {/* Revenue Analytics Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <p className="text-gray-600">Revenue trends visualization</p>
                    <p className="text-sm text-gray-500">Monthly revenue with forecasting</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Tenant</h3>
                <div className="space-y-3">
                  {mockAnalyticsData.revenueAnalytics.byTenant.map((tenant, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-900">{tenant.tenant}</span>
                          <span className="font-medium">${tenant.revenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${tenant.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {tenant.percentage}% of total • +{tenant.growth}% growth
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Forecast</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actual Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Forecasted Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Growth Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockAnalyticsData.revenueAnalytics.monthly.map((month, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {month.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {month.revenue ? `$${(month.revenue / 1000000).toFixed(2)}M` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${(month.forecast / 1000000).toFixed(2)}M
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {month.growth ? `${month.growth}%` : 'Projected'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Analytics Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Acquisition</h3>
                <div className="space-y-4">
                  {Object.entries(mockAnalyticsData.userAnalytics.acquisition).map(([channel, percentage]) => (
                    <div key={channel}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-gray-900">{channel}</span>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Retention</h3>
                <div className="space-y-4">
                  {Object.entries(mockAnalyticsData.userAnalytics.retention).map(([period, percentage]) => (
                    <div key={period}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-900">{period.replace('day', 'Day ')}</span>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            percentage > 70 ? 'bg-green-500' : 
                            percentage > 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {mockAnalyticsData.userAnalytics.engagement.dailyActiveUsers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Daily Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {mockAnalyticsData.userAnalytics.engagement.averageSessionDuration}
                  </div>
                  <div className="text-sm text-gray-500">Avg Session Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {mockAnalyticsData.userAnalytics.engagement.pageViewsPerSession}
                  </div>
                  <div className="text-sm text-gray-500">Pages per Session</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(mockAnalyticsData.performanceMetrics.systemPerformance).map(([metric, value]) => (
                <div key={metric} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 capitalize">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    {typeof value === 'number' ? 
                      (metric.includes('Time') ? `${value}ms` : 
                       metric.includes('Rate') ? `${value}%` : 
                       metric.includes('uptime') ? `${value}%` : value.toLocaleString()) 
                      : value}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Usage Analytics</h3>
              <div className="space-y-4">
                {mockAnalyticsData.performanceMetrics.featureUsage.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{feature.feature}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${getTrendColor(feature.trend)}`}>
                            {getTrendIcon(feature.trend)}
                          </span>
                          <span className="text-sm font-medium">{feature.usage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${feature.usage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Predictive Analytics Tab */}
        {activeTab === 'predictive' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Forecast</h3>
                <div className="space-y-4">
                  {mockAnalyticsData.predictiveAnalytics.revenueForcast.map((forecast, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{forecast.month}</span>
                        <span className="text-sm text-gray-500">{forecast.confidence}% confidence</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        ${(forecast.predicted / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-sm text-gray-500">
                        Range: ${(forecast.range[0] / 1000000).toFixed(2)}M - ${(forecast.range[1] / 1000000).toFixed(2)}M
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Churn Risk Analysis</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">
                        {mockAnalyticsData.predictiveAnalytics.churnPrediction.highRisk}
                      </div>
                      <div className="text-sm text-red-800">High Risk</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {mockAnalyticsData.predictiveAnalytics.churnPrediction.mediumRisk}
                      </div>
                      <div className="text-sm text-yellow-800">Medium Risk</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {mockAnalyticsData.predictiveAnalytics.churnPrediction.lowRisk}
                      </div>
                      <div className="text-sm text-green-800">Low Risk</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Risk Factors</h4>
                    <div className="space-y-2">
                      {mockAnalyticsData.predictiveAnalytics.churnPrediction.factors.map((factor, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI-Powered Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🎯 Revenue Optimization</h4>
                  <p className="text-blue-800 text-sm">
                    Focus on Enterprise Plus upsells. 67% of current Enterprise customers show high upgrade propensity based on usage patterns.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">📈 Growth Opportunity</h4>
                  <p className="text-green-800 text-sm">
                    AI Tools feature adoption correlates with 34% higher retention. Recommend targeted onboarding campaigns.
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ Risk Alert</h4>
                  <p className="text-yellow-800 text-sm">
                    DataFlow Inc shows declining engagement patterns. Recommend immediate customer success intervention.
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">🔮 Market Prediction</h4>
                  <p className="text-purple-800 text-sm">
                    Q3 market expansion expected. Prepare for 25% increase in enterprise inquiries based on industry trends.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;