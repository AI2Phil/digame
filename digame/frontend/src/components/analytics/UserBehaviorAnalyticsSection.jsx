import React, { useState } from 'react';
import { 
  Users, Eye, Clock, MousePointer, 
  TrendingUp, Target, MapPin, Smartphone,
  Monitor, Globe, Calendar, Activity,
  BarChart3, PieChart, LineChart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

const UserBehaviorAnalyticsSection = ({ data }) => {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock user behavior data with realistic analytics
  const userMetrics = {
    totalUsers: data?.totalUsers || 12456,
    activeUsers: data?.activeUsers || 3421,
    newUsers: data?.newUsers || 234,
    returningUsers: data?.returningUsers || 3187,
    sessionDuration: data?.avgSessionDuration || 24.5,
    bounceRate: data?.bounceRate || 15.2,
    pageViews: data?.totalPageViews || 45678,
    conversionRate: data?.conversionRate || 3.4
  };

  const userSegments = [
    { name: 'New Users', count: 234, percentage: 6.8, color: 'bg-blue-500' },
    { name: 'Returning Users', count: 3187, percentage: 93.2, color: 'bg-green-500' },
    { name: 'Power Users', count: 456, percentage: 13.3, color: 'bg-purple-500' },
    { name: 'Inactive Users', count: 789, percentage: 23.1, color: 'bg-gray-400' }
  ];

  const deviceBreakdown = [
    { device: 'Desktop', users: 1825, percentage: 53.4, icon: Monitor },
    { device: 'Mobile', users: 1368, percentage: 40.0, icon: Smartphone },
    { device: 'Tablet', users: 228, percentage: 6.6, icon: Monitor }
  ];

  const topPages = [
    { page: '/dashboard', views: 12456, uniqueViews: 8234, avgTime: '3:45', bounceRate: 12.3 },
    { page: '/profile', views: 8765, uniqueViews: 6543, avgTime: '2:30', bounceRate: 18.7 },
    { page: '/analytics', views: 5432, uniqueViews: 4321, avgTime: '4:12', bounceRate: 8.9 },
    { page: '/settings', views: 3210, uniqueViews: 2876, avgTime: '1:45', bounceRate: 25.4 },
    { page: '/goals', views: 2987, uniqueViews: 2543, avgTime: '3:20', bounceRate: 14.2 }
  ];

  const userJourney = [
    { step: 'Landing Page', users: 1000, dropOff: 0, conversionRate: 100 },
    { step: 'Sign Up', users: 850, dropOff: 150, conversionRate: 85 },
    { step: 'Onboarding', users: 765, dropOff: 85, conversionRate: 76.5 },
    { step: 'First Goal', users: 612, dropOff: 153, conversionRate: 61.2 },
    { step: 'Active User', users: 534, dropOff: 78, conversionRate: 53.4 }
  ];

  const geographicData = [
    { country: 'United States', users: 1245, percentage: 36.4 },
    { country: 'United Kingdom', users: 567, percentage: 16.6 },
    { country: 'Canada', users: 432, percentage: 12.6 },
    { country: 'Germany', users: 321, percentage: 9.4 },
    { country: 'France', users: 234, percentage: 6.8 },
    { country: 'Others', users: 622, percentage: 18.2 }
  ];

  return (
    <div className="space-y-6">
      {/* User Behavior Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Behavior Analytics
          </CardTitle>
          <CardDescription>
            Comprehensive insights into user engagement, behavior patterns, and conversion metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UserMetricCard
              title="Total Users"
              value={userMetrics.totalUsers.toLocaleString()}
              change="+12%"
              trend="up"
              icon={Users}
              color="blue"
            />
            <UserMetricCard
              title="Active Users"
              value={userMetrics.activeUsers.toLocaleString()}
              change="+8%"
              trend="up"
              icon={Activity}
              color="green"
            />
            <UserMetricCard
              title="Avg Session"
              value={`${userMetrics.sessionDuration}m`}
              change="+23%"
              trend="up"
              icon={Clock}
              color="purple"
            />
            <UserMetricCard
              title="Bounce Rate"
              value={`${userMetrics.bounceRate}%`}
              change="-5%"
              trend="down"
              icon={TrendingUp}
              color="orange"
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="user-journey">User Journey</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserSegmentationCard segments={userSegments} />
            <DeviceBreakdownCard devices={deviceBreakdown} />
          </div>
          <EngagementMetricsCard metrics={userMetrics} />
        </TabsContent>

        {/* User Journey Tab */}
        <TabsContent value="user-journey" className="space-y-6">
          <UserJourneyAnalysis journey={userJourney} />
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GeographicDistribution data={geographicData} />
            <UserActivityHeatmap />
          </div>
        </TabsContent>

        {/* Content Analytics Tab */}
        <TabsContent value="content" className="space-y-6">
          <ContentAnalyticsSection pages={topPages} />
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion" className="space-y-6">
          <ConversionAnalyticsSection data={userMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// User Metric Card Component
const UserMetricCard = ({ title, value, change, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
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

// User Segmentation Card Component
const UserSegmentationCard = ({ segments }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <PieChart className="w-5 h-5" />
        User Segmentation
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {segments.map((segment, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{segment.name}</span>
            <span>{segment.count.toLocaleString()} ({segment.percentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${segment.color}`}
              style={{ width: `${segment.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

// Device Breakdown Card Component
const DeviceBreakdownCard = ({ devices }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Monitor className="w-5 h-5" />
        Device Breakdown
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {devices.map((device, index) => {
        const Icon = device.icon;
        return (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">{device.device}</p>
                <p className="text-sm text-gray-600">{device.users.toLocaleString()} users</p>
              </div>
            </div>
            <Badge variant="secondary">{device.percentage}%</Badge>
          </div>
        );
      })}
    </CardContent>
  </Card>
);

// Engagement Metrics Card Component
const EngagementMetricsCard = ({ metrics }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Engagement Metrics
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{metrics.pageViews.toLocaleString()}</div>
          <p className="text-sm text-gray-600">Page Views</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{metrics.sessionDuration}m</div>
          <p className="text-sm text-gray-600">Avg Session Duration</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{metrics.bounceRate}%</div>
          <p className="text-sm text-gray-600">Bounce Rate</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{metrics.conversionRate}%</div>
          <p className="text-sm text-gray-600">Conversion Rate</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// User Journey Analysis Component
const UserJourneyAnalysis = ({ journey }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="w-5 h-5" />
        User Journey Funnel Analysis
      </CardTitle>
      <CardDescription>
        Track user progression through key conversion steps
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {journey.map((step, index) => (
          <div key={index} className="relative">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium">{step.step}</h4>
                  <p className="text-sm text-gray-600">{step.users.toLocaleString()} users</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{step.conversionRate}%</div>
                {step.dropOff > 0 && (
                  <p className="text-sm text-red-600">-{step.dropOff} dropped off</p>
                )}
              </div>
            </div>
            {index < journey.length - 1 && (
              <div className="flex justify-center my-2">
                <div className="w-px h-4 bg-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Geographic Distribution Component
const GeographicDistribution = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Globe className="w-5 h-5" />
        Geographic Distribution
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {data.map((country, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{country.country}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{country.users.toLocaleString()}</span>
            <Badge variant="secondary">{country.percentage}%</Badge>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

// User Activity Heatmap Component
const UserActivityHeatmap = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Activity Heatmap
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <p className="text-sm text-gray-600">Peak activity hours (UTC)</p>
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 24 }, (_, hour) => {
            const intensity = Math.random() * 100;
            const getIntensityColor = (value) => {
              if (value > 80) return 'bg-blue-600';
              if (value > 60) return 'bg-blue-500';
              if (value > 40) return 'bg-blue-400';
              if (value > 20) return 'bg-blue-300';
              return 'bg-blue-100';
            };
            
            return (
              <div
                key={hour}
                className={`h-8 rounded text-xs flex items-center justify-center text-white font-medium ${getIntensityColor(intensity)}`}
                title={`${hour}:00 - ${Math.round(intensity)}% activity`}
              >
                {hour}
              </div>
            );
          })}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Content Analytics Section Component
const ContentAnalyticsSection = ({ pages }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Content Performance Analytics
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Page</th>
              <th className="text-right p-2">Views</th>
              <th className="text-right p-2">Unique Views</th>
              <th className="text-right p-2">Avg Time</th>
              <th className="text-right p-2">Bounce Rate</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{page.page}</td>
                <td className="p-2 text-right">{page.views.toLocaleString()}</td>
                <td className="p-2 text-right">{page.uniqueViews.toLocaleString()}</td>
                <td className="p-2 text-right">{page.avgTime}</td>
                <td className="p-2 text-right">
                  <Badge variant={page.bounceRate < 15 ? 'success' : page.bounceRate < 25 ? 'warning' : 'destructive'}>
                    {page.bounceRate}%
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

// Conversion Analytics Section Component
const ConversionAnalyticsSection = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Conversion Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Overall Conversion Rate</span>
            <span className="font-bold text-green-600">{data.conversionRate}%</span>
          </div>
          <div className="flex justify-between">
            <span>Goal Completion Rate</span>
            <span className="font-bold">78.5%</span>
          </div>
          <div className="flex justify-between">
            <span>User Retention (7-day)</span>
            <span className="font-bold">65.2%</span>
          </div>
          <div className="flex justify-between">
            <span>Feature Adoption Rate</span>
            <span className="font-bold">42.8%</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="w-5 h-5" />
          Conversion Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">+23%</div>
            <p className="text-sm text-gray-600">Conversion improvement this month</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>This Month</span>
              <span>3.4%</span>
            </div>
            <Progress value={68} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Last Month</span>
              <span>2.8%</span>
            </div>
            <Progress value={56} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default UserBehaviorAnalyticsSection;