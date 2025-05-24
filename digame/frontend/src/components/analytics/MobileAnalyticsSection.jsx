import React, { useState } from 'react';
import { 
  Smartphone, Monitor, Tablet, Users, 
  TrendingUp, Clock, Download, Star,
  Battery, Wifi, MapPin, Activity,
  AlertTriangle, CheckCircle, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

const MobileAnalyticsSection = ({ data }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  // Mock mobile analytics data with realistic metrics
  const mobileMetrics = {
    totalMobileUsers: data?.totalMobileUsers || 8456,
    dailyActiveUsers: data?.dailyActiveUsers || 2134,
    sessionDuration: data?.avgSessionDuration || 18.5,
    crashRate: data?.crashRate || 0.12,
    appStoreRating: data?.appStoreRating || 4.7,
    retentionRate: data?.retentionRate || 68.5,
    loadTime: data?.avgLoadTime || 2.3,
    offlineUsage: data?.offlineUsage || 15.2
  };

  const platformBreakdown = [
    { 
      platform: 'iOS', 
      users: 4823, 
      percentage: 57.0, 
      version: '17.2', 
      crashRate: 0.08,
      rating: 4.8,
      icon: Smartphone 
    },
    { 
      platform: 'Android', 
      users: 3633, 
      percentage: 43.0, 
      version: '14.0', 
      crashRate: 0.15,
      rating: 4.6,
      icon: Smartphone 
    }
  ];

  const deviceMetrics = [
    { device: 'iPhone 15 Pro', users: 1245, percentage: 14.7, performance: 95 },
    { device: 'iPhone 14', users: 987, percentage: 11.7, performance: 92 },
    { device: 'Samsung Galaxy S24', users: 876, percentage: 10.4, performance: 89 },
    { device: 'iPhone 13', users: 765, percentage: 9.0, performance: 88 },
    { device: 'Google Pixel 8', users: 543, percentage: 6.4, performance: 91 },
    { device: 'Others', users: 4040, percentage: 47.8, performance: 85 }
  ];

  const appVersions = [
    { version: '2.1.0', users: 3456, percentage: 40.9, crashRate: 0.08, adoption: 'current' },
    { version: '2.0.5', users: 2134, percentage: 25.2, crashRate: 0.12, adoption: 'previous' },
    { version: '2.0.4', users: 1567, percentage: 18.5, crashRate: 0.15, adoption: 'legacy' },
    { version: '1.9.8', users: 876, percentage: 10.4, crashRate: 0.22, adoption: 'legacy' },
    { version: 'Others', users: 423, percentage: 5.0, crashRate: 0.35, adoption: 'legacy' }
  ];

  const performanceMetrics = {
    appLaunchTime: { avg: 2.3, p95: 4.1, target: 3.0 },
    screenLoadTime: { avg: 1.8, p95: 3.2, target: 2.5 },
    apiResponseTime: { avg: 156, p95: 289, target: 200 },
    memoryUsage: { avg: 145, peak: 234, limit: 300 },
    batteryImpact: { score: 8.2, rating: 'Good' },
    networkUsage: { avg: 2.4, peak: 5.1, unit: 'MB/session' }
  };

  const userEngagement = {
    sessionFrequency: { daily: 2.3, weekly: 8.7, monthly: 24.5 },
    featureUsage: [
      { feature: 'Dashboard', usage: 89.5, sessions: 7234 },
      { feature: 'Goals', usage: 76.2, sessions: 6123 },
      { feature: 'Profile', usage: 68.9, sessions: 5543 },
      { feature: 'Analytics', usage: 45.3, sessions: 3654 },
      { feature: 'Settings', usage: 34.7, sessions: 2789 }
    ],
    pushNotifications: {
      delivered: 12456,
      opened: 3567,
      openRate: 28.6,
      optInRate: 72.3
    }
  };

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
      {/* Mobile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile Application Analytics
          </CardTitle>
          <CardDescription>
            Comprehensive mobile app performance, user engagement, and platform analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MobileMetricCard
              title="Mobile Users"
              value={mobileMetrics.totalMobileUsers.toLocaleString()}
              change="+18%"
              trend="up"
              icon={Users}
              color="blue"
            />
            <MobileMetricCard
              title="Daily Active"
              value={mobileMetrics.dailyActiveUsers.toLocaleString()}
              change="+12%"
              trend="up"
              icon={Activity}
              color="green"
            />
            <MobileMetricCard
              title="Session Duration"
              value={`${mobileMetrics.sessionDuration}m`}
              change="+8%"
              trend="up"
              icon={Clock}
              color="purple"
            />
            <MobileMetricCard
              title="App Rating"
              value={mobileMetrics.appStoreRating}
              change="+0.2"
              trend="up"
              icon={Star}
              color="yellow"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile Analytics Tabs */}
      <Tabs defaultValue="platforms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="versions">App Versions</TabsTrigger>
        </TabsList>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <PlatformAnalyticsSection platforms={platformBreakdown} />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <MobilePerformanceSection metrics={performanceMetrics} />
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <UserEngagementSection engagement={userEngagement} />
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <DeviceAnalyticsSection devices={deviceMetrics} />
        </TabsContent>

        {/* App Versions Tab */}
        <TabsContent value="versions" className="space-y-6">
          <AppVersionAnalyticsSection versions={appVersions} />
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
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Device</th>
              <th className="text-right p-3">Users</th>
              <th className="text-right p-3">Percentage</th>
              <th className="text-right p-3">Performance Score</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{device.device}</td>
                <td className="p-3 text-right">{device.users.toLocaleString()}</td>
                <td className="p-3 text-right">
                  <Badge variant="secondary">{device.percentage}%</Badge>
                </td>
                <td className="p-3 text-right">
                  <Badge variant={device.performance >= 90 ? 'success' : device.performance >= 80 ? 'warning' : 'destructive'}>
                    {device.performance}/100
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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