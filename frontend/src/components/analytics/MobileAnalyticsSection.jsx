import React, { useState, useEffect } from 'react';
import {
  Smartphone, Monitor, Tablet, Users,
  TrendingUp, Clock, Download, Star,
  Battery, Wifi, MapPin, Activity,
  AlertTriangle, CheckCircle, BarChart3, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import { useToast } from '../ui/Toast';

const MobileAnalyticsSection = () => {
  // Toast hook for notifications
  const { toast } = useToast();
  
  // State management for database-driven data
  const [mobileMetrics, setMobileMetrics] = useState({});
  const [platformBreakdown, setPlatformBreakdown] = useState([]);
  const [deviceMetrics, setDeviceMetrics] = useState([]);
  const [appVersions, setAppVersions] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [userEngagement, setUserEngagement] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Fetch mobile analytics data from API
  const fetchMobileAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8001/api/admin/mobile/analytics/detailed?time_range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data || result;
      
      setMobileMetrics(data.mobileMetrics || {});
      setPlatformBreakdown(data.platformBreakdown || []);
      setDeviceMetrics(data.deviceMetrics || []);
      setAppVersions(data.appVersions || []);
      setPerformanceMetrics(data.performanceMetrics || {});
      setUserEngagement(data.userEngagement || {});
      
    } catch (err) {
      console.error('Error fetching mobile analytics:', err);
      setError(err.message);
      // Fallback to enhanced sample data
      generateEnhancedSampleData();
      // Show notification that fallback data is being used
      toast.warning('API Unavailable', 'Using sample data - API endpoints not accessible');
    } finally {
      setLoading(false);
    }
  };

  // Generate enhanced sample data as fallback
  const generateEnhancedSampleData = () => {
    // Generate realistic mobile metrics
    const enhancedMobileMetrics = {
      totalMobileUsers: Math.round(Math.random() * 2000 + 7500), // 7.5k-9.5k
      dailyActiveUsers: Math.round(Math.random() * 500 + 1900), // 1.9k-2.4k
      avgSessionDuration: Math.round((Math.random() * 7 + 15) * 10) / 10, // 15-22 minutes
      crashRate: Math.round((Math.random() * 0.1 + 0.08) * 100) / 100, // 0.08-0.18%
      appStoreRating: Math.round((Math.random() * 0.4 + 4.5) * 10) / 10, // 4.5-4.9
      retentionRate: Math.round((Math.random() * 10 + 65) * 10) / 10, // 65-75%
      avgLoadTime: Math.round((Math.random() * 1 + 2) * 10) / 10, // 2-3 seconds
      offlineUsage: Math.round((Math.random() * 6 + 12) * 10) / 10 // 12-18%
    };
    
    setMobileMetrics(enhancedMobileMetrics);
    
    // Generate enhanced platform breakdown
    const enhancedPlatforms = [
      {
        platform: 'iOS',
        users: Math.round(enhancedMobileMetrics.totalMobileUsers * 0.57),
        percentage: 57.0,
        version: '17.2',
        crashRate: Math.round((Math.random() * 0.04 + 0.06) * 100) / 100,
        rating: Math.round((Math.random() * 0.2 + 4.7) * 10) / 10,
        icon: Smartphone
      },
      {
        platform: 'Android',
        users: Math.round(enhancedMobileMetrics.totalMobileUsers * 0.43),
        percentage: 43.0,
        version: '14.0',
        crashRate: Math.round((Math.random() * 0.06 + 0.12) * 100) / 100,
        rating: Math.round((Math.random() * 0.2 + 4.5) * 10) / 10,
        icon: Smartphone
      }
    ];
    
    setPlatformBreakdown(enhancedPlatforms);
    
    // Generate enhanced device metrics
    const enhancedDevices = [
      { device: 'iPhone 15 Pro', users: Math.round(enhancedMobileMetrics.totalMobileUsers * 0.147), percentage: 14.7, performance: Math.round(Math.random() * 4 + 93) },
      { device: 'iPhone 14', users: Math.round(enhancedMobileMetrics.totalMobileUsers * 0.117), percentage: 11.7, performance: Math.round(Math.random() * 4 + 90) },
      { device: 'Samsung Galaxy S24', users: Math.round(enhancedMobileMetrics.totalMobileUsers * 0.104), percentage: 10.4, performance: Math.round(Math.random() * 4 + 87) },
      { device: 'iPhone 13', users: Math.round(enhancedMobileMetrics.totalMobileUsers * 0.090), percentage: 9.0, performance: Math.round(Math.random() * 4 + 86) },
      { device: 'Google Pixel 8', users: Math.round(enhancedMobileMetrics.totalMobileUsers * 0.064), percentage: 6.4, performance: Math.round(Math.random() * 4 + 89) },
      { device: 'Others', users: Math.round(enhancedMobileMetrics.totalMobileUsers * 0.478), percentage: 47.8, performance: Math.round(Math.random() * 4 + 83) }
    ];
    
    setDeviceMetrics(enhancedDevices);
    
    // Generate enhanced app versions
    const enhancedVersions = [
      { version: '2.1.0', users: Math.round(enhancedMobileMetrics.totalMobileUsers * 0.409), percentage: 40.9, crashRate: Math.round((Math.random() * 0.04 + 0.06) * 100) / 100, adoption: 'current' },
      { version: '2.0.5', users: Math.round(enhancedMobileMetrics.totalMobileUsers * 0.252), percentage: 25.2, crashRate: Math.round((Math.random() * 0.04 + 0.10) * 100) / 100, adoption: 'previous' },
      { version: '2.0.4', users: Math.round(enhancedMobileMetrics.totalMobileUsers * 0.185), percentage: 18.5, crashRate: Math.round((Math.random() * 0.04 + 0.13) * 100) / 100, adoption: 'legacy' },
      { version: '1.9.8', users: Math.round(enhancedMobileMetrics.totalMobileUsers * 0.104), percentage: 10.4, crashRate: Math.round((Math.random() * 0.05 + 0.20) * 100) / 100, adoption: 'legacy' },
      { version: 'Others', users: Math.round(enhancedMobileMetrics.totalMobileUsers * 0.050), percentage: 5.0, crashRate: Math.round((Math.random() * 0.10 + 0.30) * 100) / 100, adoption: 'legacy' }
    ];
    
    setAppVersions(enhancedVersions);
    
    // Generate enhanced performance metrics
    const enhancedPerformance = {
      appLaunchTime: { avg: Math.round((Math.random() * 0.8 + 2.0) * 10) / 10, p95: Math.round((Math.random() * 0.7 + 3.8) * 10) / 10, target: 3.0 },
      screenLoadTime: { avg: Math.round((Math.random() * 0.7 + 1.5) * 10) / 10, p95: Math.round((Math.random() * 0.7 + 2.8) * 10) / 10, target: 2.5 },
      apiResponseTime: { avg: Math.round(Math.random() * 40 + 140), p95: Math.round(Math.random() * 70 + 250), target: 200 },
      memoryUsage: { avg: Math.round(Math.random() * 30 + 130), peak: Math.round(Math.random() * 30 + 220), limit: 300 },
      batteryImpact: { score: Math.round((Math.random() * 0.7 + 7.8) * 10) / 10, rating: 'Good' },
      networkUsage: { avg: Math.round((Math.random() * 0.8 + 2.0) * 10) / 10, peak: Math.round((Math.random() * 1.0 + 4.5) * 10) / 10, unit: 'MB/session' }
    };
    
    setPerformanceMetrics(enhancedPerformance);
    
    // Generate enhanced user engagement
    const enhancedEngagement = {
      sessionFrequency: {
        daily: Math.round((Math.random() * 0.6 + 2.0) * 10) / 10,
        weekly: Math.round((Math.random() * 1.5 + 8.0) * 10) / 10,
        monthly: Math.round((Math.random() * 3.0 + 23.0) * 10) / 10
      },
      featureUsage: [
        { feature: 'Dashboard', usage: Math.round((Math.random() * 7 + 85) * 10) / 10, sessions: Math.round(Math.random() * 700 + 6800) },
        { feature: 'Goals', usage: Math.round((Math.random() * 8 + 72) * 10) / 10, sessions: Math.round(Math.random() * 600 + 5800) },
        { feature: 'Profile', usage: Math.round((Math.random() * 7 + 65) * 10) / 10, sessions: Math.round(Math.random() * 600 + 5200) },
        { feature: 'Analytics', usage: Math.round((Math.random() * 6 + 42) * 10) / 10, sessions: Math.round(Math.random() * 500 + 3400) },
        { feature: 'Settings', usage: Math.round((Math.random() * 6 + 32) * 10) / 10, sessions: Math.round(Math.random() * 400 + 2600) }
      ],
      pushNotifications: {
        delivered: Math.round(Math.random() * 2000 + 11500),
        opened: Math.round(Math.random() * 700 + 3200),
        openRate: Math.round((Math.random() * 5 + 26) * 10) / 10,
        optInRate: Math.round((Math.random() * 5 + 70) * 10) / 10
      }
    };
    
    setUserEngagement(enhancedEngagement);
  };

  // Load data on component mount and when time range changes
  useEffect(() => {
    fetchMobileAnalytics();
  }, [timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMobileAnalytics();
    setRefreshing(false);
  };

  // Use safe defaults to prevent errors
  const safeMobileMetrics = mobileMetrics || {};
  const safePlatformBreakdown = platformBreakdown || [];
  const safeDeviceMetrics = deviceMetrics || [];
  const safeAppVersions = appVersions || [];
  const safePerformanceMetrics = performanceMetrics || {};
  const safeUserEngagement = userEngagement || {};

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-lg">Loading mobile analytics...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error && Object.keys(safeMobileMetrics).length === 0) {
    return (
      <div className="space-y-6">
        <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Mobile Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPerformanceColor = (value, target, isLower = false) => {
    const ratio = value / target;
    if (isLower) {
      if (ratio <= 0.8) return 'text-green-600';
      if (ratio <= 1.0) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (ratio >= 1.2) return 'text-green-600';
      if (ratio >= 1.0) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Mobile Application Analytics
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Comprehensive mobile app performance, user engagement, and platform analytics
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="px-3 py-2 border border-gray-300 rounded-md text-sm w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MobileMetricCard
              title="Mobile Users"
              value={safeMobileMetrics.totalMobileUsers?.toLocaleString() || 'N/A'}
              change="+18%"
              trend="up"
              icon={Users}
              color="blue"
            />
            <MobileMetricCard
              title="Daily Active"
              value={safeMobileMetrics.dailyActiveUsers?.toLocaleString() || 'N/A'}
              change="+12%"
              trend="up"
              icon={Activity}
              color="green"
            />
            <MobileMetricCard
              title="Session Duration"
              value={safeMobileMetrics.avgSessionDuration ? `${safeMobileMetrics.avgSessionDuration}m` : 'N/A'}
              change="+8%"
              trend="up"
              icon={Clock}
              color="purple"
            />
            <MobileMetricCard
              title="App Rating"
              value={safeMobileMetrics.appStoreRating || 'N/A'}
              change="+0.2"
              trend="up"
              icon={Star}
              color="yellow"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile Analytics Tabs */}
      <Tabs defaultValue="platforms" className="space-y-6 dark:text-gray-300">
        <TabsList className="grid w-full grid-cols-5 dark:bg-gray-800">
          <TabsTrigger value="platforms" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Platforms</TabsTrigger>
          <TabsTrigger value="performance" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Performance</TabsTrigger>
          <TabsTrigger value="engagement" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Engagement</TabsTrigger>
          <TabsTrigger value="devices" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Devices</TabsTrigger>
          <TabsTrigger value="versions" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">App Versions</TabsTrigger>
        </TabsList>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <PlatformAnalyticsSection platforms={safePlatformBreakdown} />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <MobilePerformanceSection metrics={safePerformanceMetrics} />
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <UserEngagementSection engagement={safeUserEngagement} />
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <DeviceAnalyticsSection devices={safeDeviceMetrics} />
        </TabsContent>

        {/* App Versions Tab */}
        <TabsContent value="versions" className="space-y-6">
          <AppVersionAnalyticsSection versions={safeAppVersions} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Mobile Metric Card Component
const MobileMetricCard = ({ title, value, change, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    yellow: 'text-yellow-600 bg-yellow-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className={`w-4 h-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
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

// Platform Analytics Section Component
const PlatformAnalyticsSection = ({ platforms }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {platforms.map((platform, index) => (
      <Card key={index}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <platform.icon className="w-5 h-5" />
            {platform.platform}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {platform.users.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Users</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {platform.percentage}%
              </div>
              <p className="text-sm text-gray-600">Market Share</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">OS Version</span>
              <span className="font-medium">{platform.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Crash Rate</span>
              <Badge variant={platform.crashRate < 0.1 ? 'success' : platform.crashRate < 0.2 ? 'warning' : 'destructive'}>
                {platform.crashRate}%
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">App Store Rating</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium">{platform.rating}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Mobile Performance Section Component
const MobilePerformanceSection = ({ metrics }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          App Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">App Launch Time</span>
            <span className="font-medium">{metrics.appLaunchTime.avg}s</span>
          </div>
          <Progress value={(metrics.appLaunchTime.target / metrics.appLaunchTime.avg) * 100} className="h-2" />
          
          <div className="flex justify-between">
            <span className="text-sm">Screen Load Time</span>
            <span className="font-medium">{metrics.screenLoadTime.avg}s</span>
          </div>
          <Progress value={(metrics.screenLoadTime.target / metrics.screenLoadTime.avg) * 100} className="h-2" />
          
          <div className="flex justify-between">
            <span className="text-sm">API Response Time</span>
            <span className="font-medium">{metrics.apiResponseTime.avg}ms</span>
          </div>
          <Progress value={(metrics.apiResponseTime.target / metrics.apiResponseTime.avg) * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Battery className="w-5 h-5" />
          Resource Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">Memory Usage</span>
            <span className="font-medium">{metrics.memoryUsage.avg}MB</span>
          </div>
          <Progress value={(metrics.memoryUsage.avg / metrics.memoryUsage.limit) * 100} className="h-2" />
          
          <div className="flex justify-between">
            <span className="text-sm">Battery Impact</span>
            <Badge variant="success">{metrics.batteryImpact.rating}</Badge>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm">Network Usage</span>
            <span className="font-medium">{metrics.networkUsage.avg} {metrics.networkUsage.unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// User Engagement Section Component
const UserEngagementSection = ({ engagement }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Session Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {engagement.sessionFrequency.daily}
              </div>
              <p className="text-sm text-gray-600">Daily Sessions</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {engagement.sessionFrequency.weekly}
              </div>
              <p className="text-sm text-gray-600">Weekly Sessions</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {engagement.sessionFrequency.monthly}
              </div>
              <p className="text-sm text-gray-600">Monthly Sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Delivered</span>
              <span className="font-medium">{engagement.pushNotifications.delivered.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Opened</span>
              <span className="font-medium">{engagement.pushNotifications.opened.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Open Rate</span>
              <Badge variant="success">{engagement.pushNotifications.openRate}%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Opt-in Rate</span>
              <Badge variant="success">{engagement.pushNotifications.optInRate}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Feature Usage Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {engagement.featureUsage.map((feature, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{feature.feature}</span>
                <span>{feature.usage}% ({feature.sessions.toLocaleString()} sessions)</span>
              </div>
              <Progress value={feature.usage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Device Analytics Section Component
const DeviceAnalyticsSection = ({ devices }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Monitor className="w-5 h-5" />
        Device Distribution & Performance
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="text-left p-3">Device</TableHead>
              <TableHead className="text-right p-3">Users</TableHead>
              <TableHead className="text-right p-3">Percentage</TableHead>
              <TableHead className="text-right p-3">Performance Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device, index) => (
              <TableRow key={index} className="border-b hover:bg-gray-50">
                <TableCell className="p-3 font-medium">{device.device}</TableCell>
                <TableCell className="p-3 text-right">{device.users.toLocaleString()}</TableCell>
                <TableCell className="p-3 text-right">
                  <Badge variant="secondary">{device.percentage}%</Badge>
                </TableCell>
                <TableCell className="p-3 text-right">
                  <Badge variant={device.performance >= 90 ? 'success' : device.performance >= 80 ? 'warning' : 'destructive'}>
                    {device.performance}/100
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);

// App Version Analytics Section Component
const AppVersionAnalyticsSection = ({ versions }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Download className="w-5 h-5" />
        App Version Distribution
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {versions.map((version, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium">Version {version.version}</h4>
                <p className="text-sm text-gray-600">
                  {version.users.toLocaleString()} users ({version.percentage}%)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  version.adoption === 'current' ? 'success' : 
                  version.adoption === 'previous' ? 'warning' : 'secondary'
                }>
                  {version.adoption}
                </Badge>
                <Badge variant={version.crashRate < 0.1 ? 'success' : version.crashRate < 0.2 ? 'warning' : 'destructive'}>
                  {version.crashRate}% crashes
                </Badge>
              </div>
            </div>
            <Progress value={version.percentage} className="h-2" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default MobileAnalyticsSection;