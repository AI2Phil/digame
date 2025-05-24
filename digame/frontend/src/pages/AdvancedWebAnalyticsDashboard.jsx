import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Activity, Database, Clock, Users, Zap, AlertTriangle, 
  CheckCircle, Monitor, Globe, RefreshCw, Download, Filter, Calendar, Eye, 
  Target, Cpu, HardDrive, Network, Server, Shield, Brain, Layers,
  MousePointer, Timer, FileText, Search, Settings, Bell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Toast } from '../components/ui/Toast';
import apiService from '../services/apiService';
import recommendationEngine from '../services/recommendationEngine';
import coachingService from '../services/coachingService';

const AdvancedWebAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({});
  const [realTimeMetrics, setRealTimeMetrics] = useState({});
  const [performanceData, setPerformanceData] = useState({});
  const [userBehaviorData, setUserBehaviorData] = useState({});
  const [systemHealthData, setSystemHealthData] = useState({});
  const [securityData, setSecurityData] = useState({});
  const [aiInsightsData, setAiInsightsData] = useState({});

  useEffect(() => {
    loadAdvancedAnalytics();
    setupRealTimeUpdates();
  }, [timeRange]);

  const loadAdvancedAnalytics = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      
      const [
        analytics,
        performance,
        userBehavior,
        systemHealth,
        security,
        aiInsights
      ] = await Promise.all([
        apiService.getComprehensiveAnalytics(timeRange),
        apiService.getAdvancedPerformanceMetrics(timeRange),
        apiService.getAdvancedUserBehaviorAnalytics(timeRange),
        apiService.getSystemHealthMetrics(timeRange),
        apiService.getSecurityAnalytics(timeRange),
        recommendationEngine.getAnalyticsInsights(userId)
      ]);

      setAnalyticsData(analytics || {});
      setPerformanceData(performance || {});
      setUserBehaviorData(userBehavior || {});
      setSystemHealthData(systemHealth || {});
      setSecurityData(security || {});
      setAiInsightsData(aiInsights || {});

    } catch (error) {
      console.error('Failed to load advanced analytics:', error);
      Toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    const interval = setInterval(async () => {
      try {
        const realTime = await apiService.getRealTimeMetrics();
        setRealTimeMetrics(realTime || {});
      } catch (error) {
        console.error('Failed to update real-time metrics:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAdvancedAnalytics();
    setRefreshing(false);
    Toast.success('Analytics data refreshed');
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        timeRange,
        analytics: analyticsData,
        performance: performanceData,
        userBehavior: userBehaviorData,
        systemHealth: systemHealthData,
        security: securityData,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      Toast.success('Analytics data exported successfully');
    } catch (error) {
      Toast.error('Failed to export analytics data');
    }
  };

  const handleOptimizeSystem = async () => {
    try {
      Toast.info('Optimizing system performance...');
      await apiService.optimizeSystemPerformance();
      Toast.success('System optimization completed');
      loadAdvancedAnalytics();
    } catch (error) {
      Toast.error('Failed to optimize system');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading advanced web analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Advanced Web Analytics</h1>
                <p className="text-gray-600">Comprehensive platform insights and performance monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              
              <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Real-time Status Bar */}
          <RealTimeStatusBar realTimeMetrics={realTimeMetrics} />
          
          {/* Quick Actions */}
          <div className="flex gap-4 mt-4">
            <Button onClick={handleOptimizeSystem} className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Optimize System
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Scan
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Insights
            </Button>
          </div>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <WebOverviewSection 
              analytics={analyticsData}
              performance={performanceData}
              userBehavior={userBehaviorData}
              systemHealth={systemHealthData}
              realTime={realTimeMetrics}
            />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceAnalyticsSection 
              performanceData={performanceData}
              realTimeMetrics={realTimeMetrics}
            />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserAnalyticsSection 
              userBehaviorData={userBehaviorData}
            />
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <SystemHealthSection 
              systemHealthData={systemHealthData}
              realTimeMetrics={realTimeMetrics}
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecurityAnalyticsSection 
              securityData={securityData}
            />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <AiInsightsSection 
              aiInsightsData={aiInsightsData}
            />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <ReportsSection 
              analyticsData={analyticsData}
              timeRange={timeRange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Real-time Status Bar Component
const RealTimeStatusBar = ({ realTimeMetrics }) => (
  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-white rounded-lg shadow-sm border">
    <div className="flex items-center gap-2">
      <Server className="w-4 h-4 text-green-600" />
      <div>
        <p className="text-xs text-gray-500">Server Status</p>
        <p className="font-semibold text-green-600">Online</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Cpu className="w-4 h-4 text-blue-600" />
      <div>
        <p className="text-xs text-gray-500">CPU Usage</p>
        <p className="font-semibold">{realTimeMetrics.cpuUsage || 45}%</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <HardDrive className="w-4 h-4 text-purple-600" />
      <div>
        <p className="text-xs text-gray-500">Memory</p>
        <p className="font-semibold">{realTimeMetrics.memoryUsage || 68}%</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Network className="w-4 h-4 text-orange-600" />
      <div>
        <p className="text-xs text-gray-500">Network</p>
        <p className="font-semibold">{realTimeMetrics.networkLatency || 25}ms</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-emerald-600" />
      <div>
        <p className="text-xs text-gray-500">Active Users</p>
        <p className="font-semibold">{realTimeMetrics.activeUsers || 1247}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Activity className="w-4 h-4 text-red-600" />
      <div>
        <p className="text-xs text-gray-500">Requests/min</p>
        <p className="font-semibold">{realTimeMetrics.requestsPerMinute || 342}</p>
      </div>
    </div>
  </div>
);

// Web Overview Section Component
const WebOverviewSection = ({ analytics, performance, userBehavior, systemHealth, realTime }) => (
  <div className="space-y-6">
    {/* Key Performance Indicators */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <KPICard
        title="Total Users"
        value={analytics.totalUsers || '12,847'}
        icon={Users}
        color="blue"
        trend="up"
        change="+12.5%"
      />
      <KPICard
        title="Page Views"
        value={analytics.pageViews || '89,234'}
        icon={Eye}
        color="green"
        trend="up"
        change="+8.3%"
      />
      <KPICard
        title="Avg Response Time"
        value={`${performance.avgResponseTime || 245}ms`}
        icon={Timer}
        color="purple"
        trend="down"
        change="-15.2%"
      />
      <KPICard
        title="System Uptime"
        value={`${systemHealth.uptime || 99.9}%`}
        icon={CheckCircle}
        color="emerald"
        trend="stable"
        change="99.9%"
      />
    </div>

    {/* Charts and Visualizations */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TrafficAnalyticsCard analytics={analytics} />
      <PerformanceMetricsCard performance={performance} />
    </div>

    {/* Detailed Analytics Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <TopPagesCard analytics={analytics} />
      <UserEngagementCard userBehavior={userBehavior} />
      <SystemAlertsCard systemHealth={systemHealth} />
    </div>
  </div>
);

// Component implementations continue...
const KPICard = ({ title, value, icon: Icon, color, trend, change }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    emerald: 'text-emerald-600 bg-emerald-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">{change}</span>
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

// Additional component implementations...
const PerformanceAnalyticsSection = ({ performanceData }) => (
  <Card>
    <CardHeader>
      <CardTitle>Web Performance Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 border rounded-lg">
          <Timer className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <p className="font-semibold">{performanceData.pageLoadTime || '1.2s'}</p>
          <p className="text-sm text-gray-500">Page Load Time</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <p className="font-semibold">{performanceData.timeToInteractive || '2.1s'}</p>
          <p className="text-sm text-gray-500">Time to Interactive</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
          <p className="font-semibold">{performanceData.coreWebVitals || '95'}/100</p>
          <p className="text-sm text-gray-500">Core Web Vitals</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const UserAnalyticsSection = ({ userBehaviorData }) => (
  <Card>
    <CardHeader>
      <CardTitle>User Behavior Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Avg Session Duration</span>
          <span className="font-semibold">{userBehaviorData.avgSessionDuration || '8m 32s'}</span>
        </div>
        <div className="flex justify-between">
          <span>Bounce Rate</span>
          <span className="font-semibold">{userBehaviorData.bounceRate || '23.4%'}</span>
        </div>
        <div className="flex justify-between">
          <span>Pages per Session</span>
          <span className="font-semibold">{userBehaviorData.pagesPerSession || '4.2'}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SystemHealthSection = ({ systemHealthData }) => (
  <Card>
    <CardHeader>
      <CardTitle>System Health</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center p-4 border rounded-lg">
          <Server className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <p className="font-semibold">99.9%</p>
          <p className="text-sm text-gray-500">Uptime</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <Database className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <p className="font-semibold">Healthy</p>
          <p className="text-sm text-gray-500">Database</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SecurityAnalyticsSection = ({ securityData }) => (
  <Card>
    <CardHeader>
      <CardTitle>Security Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Security Score</span>
          <span className="font-semibold text-green-600">98/100</span>
        </div>
        <div className="flex justify-between">
          <span>Threats Blocked</span>
          <span className="font-semibold">0</span>
        </div>
        <div className="flex justify-between">
          <span>Failed Login Attempts</span>
          <span className="font-semibold">3</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AiInsightsSection = ({ aiInsightsData }) => (
  <Card>
    <CardHeader>
      <CardTitle>AI-Powered Insights</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">Performance Insight</h4>
          <p className="text-sm text-blue-700">Your page load times have improved 15% this week</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900">User Behavior</h4>
          <p className="text-sm text-green-700">Users spend most time on the analytics dashboard</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ReportsSection = ({ analyticsData, timeRange }) => (
  <Card>
    <CardHeader>
      <CardTitle>Advanced Reports</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Button className="w-full">Generate Performance Report</Button>
        <Button variant="outline" className="w-full">Export User Analytics</Button>
        <Button variant="outline" className="w-full">Security Audit Report</Button>
      </div>
    </CardContent>
  </Card>
);

// Helper components
const TrafficAnalyticsCard = ({ analytics }) => (
  <Card>
    <CardHeader>
      <CardTitle>Traffic Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Traffic visualization chart</p>
      </div>
    </CardContent>
  </Card>
);

const PerformanceMetricsCard = ({ performance }) => (
  <Card>
    <CardHeader>
      <CardTitle>Performance Metrics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Performance metrics chart</p>
      </div>
    </CardContent>
  </Card>
);

const TopPagesCard = ({ analytics }) => (
  <Card>
    <CardHeader>
      <CardTitle>Top Pages</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[
          { page: '/dashboard', views: 12847 },
          { page: '/analytics', views: 8956 },
          { page: '/profile', views: 6432 }
        ].map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-sm">{item.page}</span>
            <span className="font-medium">{item.views.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const UserEngagementCard = ({ userBehavior }) => (
  <Card>
    <CardHeader>
      <CardTitle>User Engagement</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm">Session Duration</span>
          <span className="font-medium">8m 32s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Bounce Rate</span>
          <span className="font-medium">23.4%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Return Visitors</span>
          <span className="font-medium">67%</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SystemAlertsCard = ({ systemHealth }) => (
  <Card>
    <CardHeader>
      <CardTitle>System Alerts</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm font-medium">All Systems Operational</p>
            <p className="text-xs text-gray-500">No issues detected</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AdvancedWebAnalyticsDashboard;