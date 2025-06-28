import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdvancedAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeframe, setTimeframe] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/analytics/dashboard?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      setAnalyticsData(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const userAcquisitionChartData = {
    labels: analyticsData?.user_acquisition?.daily_breakdown?.map(d => 
      new Date(d.date).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: 'New Users',
        data: analyticsData?.user_acquisition?.daily_breakdown?.map(d => d.count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const conversionFunnelData = {
    labels: analyticsData?.conversion_funnel?.funnel_stages?.map(stage => stage.stage) || [],
    datasets: [
      {
        label: 'Users',
        data: analyticsData?.conversion_funnel?.funnel_stages?.map(stage => stage.count) || [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const engagementDistributionData = {
    labels: ['High Engagement', 'Medium Engagement', 'Low Engagement'],
    datasets: [
      {
        data: [
          analyticsData?.engagement_metrics?.engagement_distribution?.high || 0,
          analyticsData?.engagement_metrics?.engagement_distribution?.medium || 0,
          analyticsData?.engagement_metrics?.engagement_distribution?.low || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights into user behavior and platform performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>
            <button
              onClick={fetchAnalyticsData}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData?.user_acquisition?.total_registrations || 0}
              </p>
              <p className="text-sm text-green-600">
                +{analyticsData?.user_acquisition?.growth_rate?.toFixed(1) || 0}% growth
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData?.conversion_funnel?.overall_conversion_rate?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-gray-500">Guest to user</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData?.engagement_metrics?.active_users || 0}
              </p>
              <p className="text-sm text-gray-500">This {timeframe}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Session</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData?.engagement_metrics?.average_session_duration || 0}m
              </p>
              <p className="text-sm text-gray-500">Duration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Acquisition Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Acquisition Trend</h3>
          <div className="h-64">
            <Line 
              data={userAcquisitionChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: false
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="h-64">
            <Bar 
              data={conversionFunnelData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: false
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Engagement Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={engagementDistributionData} 
              options={{
                ...doughnutOptions,
                plugins: {
                  ...doughnutOptions.plugins,
                  title: {
                    display: false
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Onboarding Performance */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Completion Rate</span>
              <span className="text-sm font-semibold text-gray-900">
                {analyticsData?.onboarding_analytics?.completion_rate?.toFixed(1) || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${analyticsData?.onboarding_analytics?.completion_rate || 0}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Avg Completion Time</span>
              <span className="text-sm font-semibold text-gray-900">
                {analyticsData?.onboarding_analytics?.average_completion_time?.toFixed(1) || 0} min
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total Started</span>
              <span className="text-sm font-semibold text-gray-900">
                {analyticsData?.onboarding_analytics?.total_started || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictive Insights */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Insights</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">High Conversion Likelihood</p>
                <p className="text-xs text-green-600">Users likely to upgrade</p>
              </div>
              <span className="text-lg font-bold text-green-800">
                {analyticsData?.predictive_insights?.conversion_predictions?.high_likelihood || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-yellow-800">At Risk Users</p>
                <p className="text-xs text-yellow-600">May churn soon</p>
              </div>
              <span className="text-lg font-bold text-yellow-800">
                {analyticsData?.predictive_insights?.at_risk_users?.total_at_risk || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">LTV/CAC Ratio</span>
              <span className="text-sm font-semibold text-gray-900">
                {analyticsData?.performance_metrics?.ltv_cac_ratio?.toFixed(1) || 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Time to Value</span>
              <span className="text-sm font-semibold text-gray-900">
                {analyticsData?.performance_metrics?.time_to_value?.toFixed(1) || 0}h
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Satisfaction Score</span>
              <span className="text-sm font-semibold text-gray-900">
                {analyticsData?.performance_metrics?.user_satisfaction_score?.toFixed(1) || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Optimization Recommendations */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            {analyticsData?.predictive_insights?.optimization_recommendations?.slice(0, 3).map((rec, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">{rec.recommendation}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-blue-600">Impact: {rec.impact}</span>
                  <span className="text-xs text-blue-600">Effort: {rec.effort}</span>
                </div>
              </div>
            )) || []}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;