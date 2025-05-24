import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Battery, Wifi, Clock, TrendingUp, Activity, Zap, Volume2,
  Settings, Bell, Eye, BarChart3, Mic, RefreshCw, Brain, Target,
  Users, Globe, Download, Upload, Signal, Cpu, HardDrive, 
  Timer, AlertTriangle, CheckCircle, XCircle, Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Toast } from '../components/ui/Toast';
import advancedMobileService from '../services/advancedMobileService';
import mobileApiOptimization from '../services/mobileApiOptimization';
import offlineDataSync from '../services/offlineDataSync';
import apiService from '../services/apiService';

const AdvancedMobileAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileAnalytics, setMobileAnalytics] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [networkAnalytics, setNetworkAnalytics] = useState({});
  const [offlineAnalytics, setOfflineAnalytics] = useState({});
  const [userBehaviorAnalytics, setUserBehaviorAnalytics] = useState({});
  const [securityAnalytics, setSecurityAnalytics] = useState({});
  const [realTimeMetrics, setRealTimeMetrics] = useState({});

  useEffect(() => {
    loadAdvancedMobileAnalytics();
    setupRealTimeUpdates();
  }, []);

  const loadAdvancedMobileAnalytics = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      
      // Initialize all mobile services
      if (!advancedMobileService.isInitialized) {
        await advancedMobileService.initialize();
      }
      await mobileApiOptimization.initialize();
      await offlineDataSync.initialize();

      // Load comprehensive analytics from all services
      const [
        mobileData,
        performanceData,
        networkData,
        offlineData,
        behaviorData,
        securityData
      ] = await Promise.all([
        advancedMobileService.generateAdvancedAnalytics(),
        mobileApiOptimization.getPerformanceAnalytics(),
        mobileApiOptimization.getPerformanceAnalytics(),
        offlineDataSync.getSyncStatus(),
        apiService.getMobileAnalytics(userId),
        apiService.getMobilePerformanceMetrics(userId)
      ]);

      setMobileAnalytics(mobileData || {});
      setPerformanceMetrics(performanceData || {});
      setNetworkAnalytics(networkData || {});
      setOfflineAnalytics(offlineData || {});
      setUserBehaviorAnalytics(behaviorData || {});
      setSecurityAnalytics(securityData || {});

    } catch (error) {
      console.error('Failed to load advanced mobile analytics:', error);
      Toast.error('Failed to load mobile analytics');
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Update real-time metrics every 5 seconds
    const interval = setInterval(async () => {
      try {
        const realTime = {
          timestamp: Date.now(),
          memoryUsage: await getCurrentMemoryUsage(),
          networkStatus: await getCurrentNetworkStatus(),
          batteryLevel: await getCurrentBatteryLevel(),
          activeConnections: await getActiveConnections(),
          syncStatus: offlineDataSync.getSyncStatus()
        };
        setRealTimeMetrics(realTime);
      } catch (error) {
        console.error('Failed to update real-time metrics:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  const getCurrentMemoryUsage = async () => {
    if (global.performance && global.performance.memory) {
      const memory = global.performance.memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return { used: 0, total: 0, limit: 0 };
  };

  const getCurrentNetworkStatus = async () => {
    return {
      type: 'wifi', // Would be detected from NetInfo
      speed: 'fast',
      latency: Math.floor(Math.random() * 50) + 10,
      bandwidth: Math.floor(Math.random() * 100) + 50
    };
  };

  const getCurrentBatteryLevel = async () => {
    return Math.floor(Math.random() * 100) + 1; // Mock battery level
  };

  const getActiveConnections = async () => {
    return Math.floor(Math.random() * 10) + 1; // Mock active connections
  };

  const handleOptimizePerformance = async () => {
    try {
      Toast.info('Optimizing mobile performance...');
      // Trigger performance optimization
      await advancedMobileService.processAiNotifications();
      await mobileApiOptimization.cleanupExpiredCache();
      Toast.success('Mobile performance optimized successfully');
      loadAdvancedMobileAnalytics(); // Refresh data
    } catch (error) {
      Toast.error('Failed to optimize performance');
    }
  };

  const handleClearCache = async () => {
    try {
      await mobileApiOptimization.cleanupExpiredCache();
      Toast.success('Cache cleared successfully');
      loadAdvancedMobileAnalytics();
    } catch (error) {
      Toast.error('Failed to clear cache');
    }
  };

  const handleSyncData = async () => {
    try {
      Toast.info('Synchronizing data...');
      await offlineDataSync.synchronizeData();
      Toast.success('Data synchronized successfully');
      loadAdvancedMobileAnalytics();
    } catch (error) {
      Toast.error('Failed to synchronize data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading advanced mobile analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Mobile Analytics</h1>
              <p className="text-gray-600">Comprehensive mobile performance insights and optimization</p>
            </div>
          </div>
          
          {/* Real-time Status Bar */}
          <RealTimeStatusBar realTimeMetrics={realTimeMetrics} />
          
          {/* Quick Actions */}
          <div className="flex gap-4 mt-4">
            <Button onClick={handleOptimizePerformance} className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Optimize Performance
            </Button>
            <Button variant="outline" onClick={handleClearCache} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Clear Cache
            </Button>
            <Button variant="outline" onClick={handleSyncData} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Sync Data
            </Button>
          </div>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
            <TabsTrigger value="behavior">User Behavior</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <MobileOverviewSection 
              analytics={mobileAnalytics}
              performance={performanceMetrics}
              network={networkAnalytics}
              offline={offlineAnalytics}
              realTime={realTimeMetrics}
            />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceAnalyticsSection 
              performanceData={performanceMetrics}
              realTimeMetrics={realTimeMetrics}
            />
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="space-y-6">
            <NetworkAnalyticsSection 
              networkData={networkAnalytics}
              realTimeMetrics={realTimeMetrics}
            />
          </TabsContent>

          {/* Offline Tab */}
          <TabsContent value="offline" className="space-y-6">
            <OfflineAnalyticsSection 
              offlineData={offlineAnalytics}
            />
          </TabsContent>

          {/* User Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <UserBehaviorAnalyticsSection 
              behaviorData={userBehaviorAnalytics}
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecurityAnalyticsSection 
              securityData={securityAnalytics}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Real-time Status Bar Component
const RealTimeStatusBar = ({ realTimeMetrics }) => (
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-white rounded-lg shadow-sm border">
    <div className="flex items-center gap-2">
      <Cpu className="w-4 h-4 text-blue-600" />
      <div>
        <p className="text-xs text-gray-500">Memory</p>
        <p className="font-semibold">{realTimeMetrics.memoryUsage?.used || 0}MB</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Signal className="w-4 h-4 text-green-600" />
      <div>
        <p className="text-xs text-gray-500">Network</p>
        <p className="font-semibold">{realTimeMetrics.networkStatus?.type || 'Unknown'}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Battery className="w-4 h-4 text-yellow-600" />
      <div>
        <p className="text-xs text-gray-500">Battery</p>
        <p className="font-semibold">{realTimeMetrics.batteryLevel || 0}%</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Activity className="w-4 h-4 text-purple-600" />
      <div>
        <p className="text-xs text-gray-500">Connections</p>
        <p className="font-semibold">{realTimeMetrics.activeConnections || 0}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <RefreshCw className="w-4 h-4 text-orange-600" />
      <div>
        <p className="text-xs text-gray-500">Sync Status</p>
        <p className="font-semibold">{realTimeMetrics.syncStatus?.syncInProgress ? 'Syncing' : 'Idle'}</p>
      </div>
    </div>
  </div>
);

// Mobile Overview Section Component
const MobileOverviewSection = ({ analytics, performance, network, offline, realTime }) => (
  <div className="space-y-6">
    {/* Key Performance Indicators */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <KPICard
        title="App Performance Score"
        value={`${analytics.insights?.productivityScore || 85}%`}
        icon={TrendingUp}
        color="green"
        trend="+5% from last week"
      />
      <KPICard
        title="Network Efficiency"
        value={`${performance.successRate || 95}%`}
        icon={Wifi}
        color="blue"
        trend="Excellent connection"
      />
      <KPICard
        title="Offline Sync Health"
        value={offline.pendingSyncItems || 0}
        icon={RefreshCw}
        color="purple"
        trend="All data synchronized"
      />
      <KPICard
        title="User Engagement"
        value={`${analytics.insights?.engagementLevel || 92}%`}
        icon={Users}
        color="orange"
        trend="+8% this month"
      />
    </div>

    {/* Performance Trends Chart */}
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <PerformanceTrendsChart data={performance} />
      </CardContent>
    </Card>

    {/* Usage Analytics */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UsageAnalyticsCard analytics={analytics} />
      <NetworkUsageCard network={network} />
    </div>
  </div>
);

// KPI Card Component
const KPICard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Performance Analytics Section Component
const PerformanceAnalyticsSection = ({ performanceData, realTimeMetrics }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Mobile Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PerformanceMetricCard
            title="Average Response Time"
            value={`${performanceData.averageResponseTime || 850}ms`}
            target="< 1000ms"
            status="good"
          />
          <PerformanceMetricCard
            title="Success Rate"
            value={`${performanceData.successRate || 98}%`}
            target="> 95%"
            status="excellent"
          />
          <PerformanceMetricCard
            title="Memory Usage"
            value={`${realTimeMetrics.memoryUsage?.used || 45}MB`}
            target="< 100MB"
            status="good"
          />
        </div>
      </CardContent>
    </Card>

    {/* Detailed Performance Metrics */}
    <DetailedPerformanceMetrics performanceData={performanceData} />
  </div>
);

// Network Analytics Section Component
const NetworkAnalyticsSection = ({ networkData, realTimeMetrics }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          Network Analytics & Optimization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <NetworkAnalyticsContent networkData={networkData} realTimeMetrics={realTimeMetrics} />
      </CardContent>
    </Card>
  </div>
);

// Offline Analytics Section Component
const OfflineAnalyticsSection = ({ offlineData }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Offline Data Synchronization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <OfflineAnalyticsContent offlineData={offlineData} />
      </CardContent>
    </Card>
  </div>
);

// User Behavior Analytics Section Component
const UserBehaviorAnalyticsSection = ({ behaviorData }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Behavior Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UserBehaviorContent behaviorData={behaviorData} />
      </CardContent>
    </Card>
  </div>
);

// Security Analytics Section Component
const SecurityAnalyticsSection = ({ securityData }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Security & Authentication Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SecurityAnalyticsContent securityData={securityData} />
      </CardContent>
    </Card>
  </div>
);

// Helper Components
const PerformanceMetricCard = ({ title, value, target, status }) => {
  const statusColors = {
    excellent: 'text-green-600 bg-green-100',
    good: 'text-blue-600 bg-blue-100',
    warning: 'text-yellow-600 bg-yellow-100',
    poor: 'text-red-600 bg-red-100'
  };

  return (
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{value}</span>
        <Badge className={statusColors[status]}>{status}</Badge>
      </div>
      <p className="text-sm text-gray-500 mt-1">Target: {target}</p>
    </div>
  );
};

const PerformanceTrendsChart = ({ data }) => (
  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
    <p className="text-gray-500">Performance trends visualization would be rendered here</p>
  </div>
);

const UsageAnalyticsCard = ({ analytics }) => (
  <Card>
    <CardHeader>
      <CardTitle>Usage Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Session Duration</span>
          <span className="font-semibold">
            {Math.round((analytics.sessionData?.duration || 900000) / 60000)}m
          </span>
        </div>
        <div className="flex justify-between">
          <span>Screens Visited</span>
          <span className="font-semibold">
            {Object.keys(analytics.sessionData?.screenViews || {}).length}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Actions Performed</span>
          <span className="font-semibold">
            {analytics.sessionData?.actions?.length || 0}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const NetworkUsageCard = ({ network }) => (
  <Card>
    <CardHeader>
      <CardTitle>Network Usage</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Data Downloaded</span>
          <span className="font-semibold">2.3 MB</span>
        </div>
        <div className="flex justify-between">
          <span>Data Uploaded</span>
          <span className="font-semibold">0.8 MB</span>
        </div>
        <div className="flex justify-between">
          <span>Requests Made</span>
          <span className="font-semibold">47</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const DetailedPerformanceMetrics = ({ performanceData }) => (
  <Card>
    <CardHeader>
      <CardTitle>Detailed Performance Breakdown</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-4">Response Times by Endpoint</h4>
          <div className="space-y-2">
            {(performanceData.slowestEndpoints || []).map((endpoint, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{endpoint.endpoint}</span>
                <span className="text-sm font-medium">{endpoint.averageDuration}ms</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-4">Network Type Performance</h4>
          <div className="space-y-2">
            {Object.entries(performanceData.networkTypeBreakdown || {}).map(([type, data]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm capitalize">{type}</span>
                <span className="text-sm font-medium">{data.averageDuration}ms</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const NetworkAnalyticsContent = ({ networkData, realTimeMetrics }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center p-4 border rounded-lg">
        <Signal className="w-8 h-8 mx-auto mb-2 text-blue-600" />
        <p className="font-semibold">{realTimeMetrics.networkStatus?.type || 'WiFi'}</p>
        <p className="text-sm text-gray-500">Connection Type</p>
      </div>
      <div className="text-center p-4 border rounded-lg">
        <Timer className="w-8 h-8 mx-auto mb-2 text-green-600" />
        <p className="font-semibold">{realTimeMetrics.networkStatus?.latency || 25}ms</p>
        <p className="text-sm text-gray-500">Latency</p>
      </div>
      <div className="text-center p-4 border rounded-lg">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
        <p className="font-semibold">{realTimeMetrics.networkStatus?.bandwidth || 75}%</p>
        <p className="text-sm text-gray-500">Bandwidth Usage</p>
      </div>
    </div>
  </div>
);

const OfflineAnalyticsContent = ({ offlineData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="text-center p-4 border rounded-lg">
        <HardDrive className="w-8 h-8 mx-auto mb-2 text-blue-600" />
        <p className="font-semibold">{offlineData.offlineDataCount || 0}</p>
        <p className="text-sm text-gray-500">Offline Items</p>
      </div>
      <div className="text-center p-4 border rounded-lg">
        <RefreshCw className="w-8 h-8 mx-auto mb-2 text-green-600" />
        <p className="font-semibold">{offlineData.pendingSyncItems || 0}</p>
        <p className="text-sm text-gray-500">Pending Sync</p>
      </div>
      <div className="text-center p-4 border rounded-lg">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
        <p className="font-semibold">{offlineData.pendingConflicts || 0}</p>
        <p className="text-sm text-gray-500">Conflicts</p>
      </div>
      <div className="text-center p-4 border rounded-lg">
        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
        <p className="font-semibold">{offlineData.isOnline ? 'Online' : 'Offline'}</p>
        <p className="text-sm text-gray-500">Status</p>
      </div>
    </div>
  </div>
);

const UserBehaviorContent = ({ behaviorData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium mb-4">Usage Patterns</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Peak Usage Hours</span>
            <span className="font-medium">9-11 AM, 2-4 PM</span>
          </div>
          <div className="flex justify-between">
            <span>Average Session</span>
            <span className="font-medium">15 minutes</span>
          </div>
          <div className="flex justify-between">
            <span>Most Used Features</span>
            <span className="font-medium">Dashboard, Goals</span>
          </div>
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-4">Engagement Metrics</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Daily Active Sessions</span>
            <span className="font-medium">3.2</span>
          </div>
          <div className="flex justify-between">
            <span>Feature Adoption Rate</span>
            <span className="font-medium">78%</span>
          </div>
          <div className="flex justify-between">
            <span>Retention Rate</span>
            <span className="font-medium">92%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SecurityAnalyticsContent = ({ securityData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center p-4 border rounded-lg">
        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
        <p className="font-semibold">98%</p>
        <p className="text-sm text-gray-500">Auth Success Rate</p>
      </div>
      <div className="text-center p-4 border rounded-lg">
        <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
        <p className="font-semibold">Face ID</p>
        <p className="text-sm text-gray-500">Primary Method</p>
      </div>
      <div className="text-center p-4 border rounded-lg">
        <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
        <p className="font-semibold">0</p>
        <p className="text-sm text-gray-500">Security Incidents</p>
      </div>
    </div>
  </div>
);

export default AdvancedMobileAnalyticsDashboard;