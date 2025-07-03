import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';

const GuestAnalytics = () => {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/guest/analytics');
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockAnalyticsData = {
    overview: {
      totalVisitors: 15432,
      uniqueVisitors: 12890,
      pageViews: 45670,
      averageSessionDuration: '3m 45s',
      bounceRate: 34.2,
      conversionRate: 2.8
    },
    topPages: [
      { page: '/landing', views: 8934, uniqueViews: 7234, avgTime: '4m 12s' },
      { page: '/features', views: 6789, uniqueViews: 5432, avgTime: '3m 28s' },
      { page: '/pricing', views: 4567, uniqueViews: 3890, avgTime: '2m 56s' },
      { page: '/demo', views: 3456, uniqueViews: 2987, avgTime: '5m 34s' },
      { page: '/contact', views: 2345, uniqueViews: 2123, avgTime: '2m 15s' }
    ],
    conversionFunnel: [
      { stage: 'Landing Page Visit', visitors: 15432, percentage: 100 },
      { stage: 'Feature Exploration', visitors: 8934, percentage: 57.9 },
      { stage: 'Pricing Page View', visitors: 4567, percentage: 29.6 },
      { stage: 'Demo Request', visitors: 1234, percentage: 8.0 },
      { stage: 'Sign Up', visitors: 432, percentage: 2.8 }
    ],
    trafficSources: [
      { source: 'Organic Search', visitors: 6789, percentage: 44.0 },
      { source: 'Direct', visitors: 3456, percentage: 22.4 },
      { source: 'Social Media', visitors: 2345, percentage: 15.2 },
      { source: 'Referral', visitors: 1890, percentage: 12.2 },
      { source: 'Paid Ads', visitors: 952, percentage: 6.2 }
    ]
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
        title="Guest Analytics"
        subtitle="Anonymous visitor behavior and conversion tracking"
        breadcrumbs={[
          { label: 'Guest Features', href: '/guest' },
          { label: 'Analytics', href: '/guest/analytics' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Visitors</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {mockAnalyticsData.overview.totalVisitors.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 mt-1">+12.5% from last month</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Unique Visitors</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {mockAnalyticsData.overview.uniqueVisitors.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 mt-1">+8.3% from last month</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Page Views</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {mockAnalyticsData.overview.pageViews.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 mt-1">+15.7% from last month</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Avg Session Duration</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {mockAnalyticsData.overview.averageSessionDuration}
            </div>
            <div className="text-sm text-green-600 mt-1">+23s improvement</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Bounce Rate</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {mockAnalyticsData.overview.bounceRate}%
            </div>
            <div className="text-sm text-red-600 mt-1">-2.1% improvement</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {mockAnalyticsData.overview.conversionRate}%
            </div>
            <div className="text-sm text-green-600 mt-1">+0.4% improvement</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Pages */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Pages</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAnalyticsData.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{page.page}</div>
                      <div className="text-sm text-gray-500">
                        {page.views.toLocaleString()} views • {page.uniqueViews.toLocaleString()} unique
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{page.avgTime}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Traffic Sources</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAnalyticsData.trafficSources.map((source, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-900">{source.source}</span>
                      <span className="font-medium">{source.visitors.toLocaleString()} ({source.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Conversion Funnel</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockAnalyticsData.conversionFunnel.map((stage, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                    <div className="text-sm text-gray-500">
                      {stage.visitors.toLocaleString()} visitors ({stage.percentage}%)
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        index === 0 ? 'bg-blue-600' :
                        index === 1 ? 'bg-green-600' :
                        index === 2 ? 'bg-yellow-600' :
                        index === 3 ? 'bg-orange-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${stage.percentage}%` }}
                    ></div>
                  </div>
                  {index < mockAnalyticsData.conversionFunnel.length - 1 && (
                    <div className="absolute right-0 top-8 text-xs text-gray-400">
                      {((mockAnalyticsData.conversionFunnel[index + 1].visitors / stage.visitors) * 100).toFixed(1)}% conversion
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">🎯 High-Converting Pages</h4>
              <p className="text-blue-800 text-sm">
                Demo page has the highest conversion rate at 35.7%. Consider promoting demo access more prominently.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">📈 Traffic Growth</h4>
              <p className="text-green-800 text-sm">
                Organic search traffic increased 44% this month. SEO optimization efforts are paying off.
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Bounce Rate Alert</h4>
              <p className="text-yellow-800 text-sm">
                Pricing page has a 45% bounce rate. Consider A/B testing different pricing presentations.
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">🔮 Optimization Opportunity</h4>
              <p className="text-purple-800 text-sm">
                Social media traffic has low conversion. Improve landing page alignment with social campaigns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestAnalytics;