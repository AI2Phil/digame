import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Activity, Database, 
  Clock, Users, Zap, AlertTriangle, CheckCircle,
  Monitor, Smartphone, Globe, RefreshCw,
  Download, Filter, Calendar, Eye, Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Toast } from '../components/ui/Toast';
import { Select } from '../components/ui/Select'; // Added import
import apiService from '../services/apiService';
import PerformanceMonitoringSection from '../components/analytics/PerformanceMonitoringSection';
import UserBehaviorAnalyticsSection from '../components/analytics/UserBehaviorAnalyticsSection';
import ApiAnalyticsSection from '../components/analytics/ApiAnalyticsSection';
import MobileAnalyticsSection from '../components/analytics/MobileAnalyticsSection';

const AnalyticsDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [
        performanceData,
        userBehaviorData,
        apiMetricsData,
        databaseMetricsData,
        mobileAnalyticsData
      ] = await Promise.all([
        apiService.getPerformanceMetrics(timeRange),
        apiService.getUserBehaviorAnalytics(timeRange),
        apiService.getApiUsageMetrics(timeRange),
        apiService.getDatabaseMetrics(timeRange),
        apiService.getMobileAnalytics(timeRange)
      ]);

      setAnalyticsData({
        performance: performanceData,
        userBehavior: userBehaviorData,
        apiMetrics: apiMetricsData,
        database: databaseMetricsData,
        mobile: mobileAnalyticsData
      });
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      Toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
    Toast.success('Analytics data refreshed');
  };

  const handleExport = async () => {
    try {
      await apiService.exportAnalyticsData(timeRange);
      Toast.success('Analytics data exported successfully');
    } catch (error) {
      Toast.error('Failed to export analytics data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Real-time performance monitoring and user behavior analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={timeRange}
                onChange={setTimeRange}
                options={[
                  { value: '1h', label: 'Last Hour' },
                  { value: '24h', label: 'Last 24 Hours' },
                  { value: '7d', label: 'Last 7 Days' },
                  { value: '30d', label: 'Last 30 Days' },
                  { value: '90d', label: 'Last 90 Days' },
                ]}
                className="text-sm min-w-[150px]" // Added min-w for better default appearance
              />
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Response Time"
            value={`${analyticsData.performance?.avgResponseTime || 120}ms`}
            change="-15ms"
            trend="down"
            icon={Clock}
            color="blue"
          />
          <MetricCard
            title="Active Users"
            value={analyticsData.userBehavior?.activeUsers || 1234}
            change="+12%"
            trend="up"
            icon={Users}
            color="green"
          />
          <MetricCard
            title="API Requests"
            value={analyticsData.apiMetrics?.totalRequests || 45678}
            change="+23%"
            trend="up"
            icon={BarChart3}
            color="purple"
          />
          <MetricCard
            title="System Health"
            value="99.9%"
            change="Stable"
            trend="stable"
            icon={CheckCircle}
            color="emerald"
          />
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="users">User Behavior</TabsTrigger>
            <TabsTrigger value="api">API Analytics</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewSection analyticsData={analyticsData} />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceMonitoringSection data={analyticsData.performance} />
          </TabsContent>

          {/* User Behavior Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserBehaviorAnalyticsSection data={analyticsData.userBehavior} />
          </TabsContent>

          {/* API Analytics Tab */}
          <TabsContent value="api" className="space-y-6">
            <ApiAnalyticsSection data={analyticsData.apiMetrics} />
          </TabsContent>

          {/* Mobile Analytics Tab */}
          <TabsContent value="mobile" className="space-y-6">
            <MobileAnalyticsSection data={analyticsData.mobile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    emerald: 'text-emerald-600 bg-emerald-100'
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon()}
              <span className={`text-sm ${getTrendColor()}`}>
                {change} from last period
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Overview Section Component
const OverviewSection = ({ analyticsData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SystemHealthOverview data={analyticsData} />
      <RealTimeMetrics data={analyticsData} />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <TopPagesCard />
      <AlertsAndIssuesCard />
      <QuickInsightsCard />
    </div>
  </div>
);

// System Health Overview Component
const SystemHealthOverview = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Monitor className="w-5 h-5" />
        System Health Overview
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>CPU Usage</span>
          <span>{data.performance?.cpuUsage || 45}%</span>
        </div>
        <Progress value={data.performance?.cpuUsage || 45} className="h-2" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Memory Usage</span>
          <span>{data.performance?.memoryUsage || 62}%</span>
        </div>
        <Progress value={data.performance?.memoryUsage || 62} className="h-2" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Database Load</span>
          <span>{data.database?.load || 38}%</span>
        </div>
        <Progress value={data.database?.load || 38} className="h-2" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>API Response Time</span>
          <span>{data.performance?.avgResponseTime || 120}ms</span>
        </div>
        <Progress value={75} className="h-2" />
      </div>
    </CardContent>
  </Card>
);

// Real Time Metrics Component
const RealTimeMetrics = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Real-Time Metrics
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.userBehavior?.activeUsers || 1234}
          </div>
          <p className="text-sm text-gray-600">Active Users</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.apiMetrics?.requestsPerMinute || 156}
          </div>
          <p className="text-sm text-gray-600">Requests/min</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.performance?.avgResponseTime || 120}ms
          </div>
          <p className="text-sm text-gray-600">Avg Response</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {data.apiMetrics?.errorRate || 0.1}%
          </div>
          <p className="text-sm text-gray-600">Error Rate</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Top Pages Card Component
const TopPagesCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Eye className="w-5 h-5" />
        Top Pages
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[
          { page: '/dashboard', views: 1234, change: '+12%' },
          { page: '/profile', views: 856, change: '+8%' },
          { page: '/analytics', views: 432, change: '+15%' },
          { page: '/settings', views: 298, change: '+5%' }
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-medium">{item.page}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{item.views}</span>
              <Badge variant="success" className="text-xs">{item.change}</Badge>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Alerts and Issues Card Component
const AlertsAndIssuesCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Alerts & Issues
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <div>
            <p className="text-sm font-medium">High Memory Usage</p>
            <p className="text-xs text-gray-500">Database server at 85%</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm font-medium">All Systems Operational</p>
            <p className="text-xs text-gray-500">No critical issues detected</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Quick Insights Card Component
const QuickInsightsCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Zap className="w-5 h-5" />
        Quick Insights
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">Peak Usage</p>
          <p className="text-xs text-blue-700">Traffic peaks at 2-4 PM daily</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-900">Performance</p>
          <p className="text-xs text-green-700">Response times improved 15%</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="text-sm font-medium text-purple-900">User Engagement</p>
          <p className="text-xs text-purple-700">Session duration up 23%</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AnalyticsDashboardPage;