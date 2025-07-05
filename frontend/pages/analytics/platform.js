import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Progress } from '../../src/components/ui/progress';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Globe, 
  Activity,
  UserCheck,
  Building,
  Zap,
  Target,
  PieChart,
  LineChart
} from 'lucide-react';

const PlatformAnalytics = () => {
  const router = useRouter();
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  useEffect(() => {
    fetchPlatformData();
  }, [timeRange]);

  const fetchPlatformData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/platform?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlatformData(data);
      }
    } catch (error) {
      console.error('Error fetching platform data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockPlatformData = {
    overview: {
      totalUsers: 15420,
      activeUsers: 8930,
      totalTenants: 145,
      activeTenants: 132,
      totalRevenue: 245000,
      monthlyGrowth: 12.5,
      churnRate: 2.3,
      conversionRate: 8.7
    },
    userMetrics: {
      byTier: {
        free: { count: 8420, percentage: 54.6 },
        individual: { count: 4230, percentage: 27.4 },
        team: { count: 2100, percentage: 13.6 },
        enterprise: { count: 670, percentage: 4.4 }
      },
      engagement: {
        dailyActive: 3420,
        weeklyActive: 6780,
        monthlyActive: 8930,
        averageSessionTime: 24.5
      }
    },
    tenantMetrics: {
      bySize: {
        small: { count: 89, users: 1245 },
        medium: { count: 42, users: 3420 },
        large: { count: 14, users: 4265 }
      },
      topTenants: [
        { name: 'TechCorp Inc', users: 450, revenue: 15000, growth: 23.5 },
        { name: 'Innovation Labs', users: 320, revenue: 12000, growth: 18.2 },
        { name: 'Digital Solutions', users: 280, revenue: 9500, growth: 15.7 },
        { name: 'Future Systems', users: 245, revenue: 8200, growth: 12.3 }
      ]
    },
    featureUsage: {
      analytics: { usage: 78, trend: 'up' },
      aiTools: { usage: 65, trend: 'up' },
      digitalTwin: { usage: 52, trend: 'stable' },
      workflow: { usage: 71, trend: 'up' },
      teamCollaboration: { usage: 43, trend: 'down' },
      careerDevelopment: { usage: 38, trend: 'stable' }
    },
    revenueMetrics: {
      monthly: [
        { month: 'Jan', revenue: 198000, users: 12400 },
        { month: 'Feb', revenue: 215000, users: 13200 },
        { month: 'Mar', revenue: 232000, users: 14100 },
        { month: 'Apr', revenue: 245000, users: 15420 }
      ],
      byTier: {
        individual: 89000,
        team: 126000,
        enterprise: 30000
      }
    }
  };

  const data = platformData || mockPlatformData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Platform Analytics"
        subtitle="Comprehensive platform-wide metrics and insights for Platform Owners"
        icon={<BarChart3 className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Analytics', href: '/analytics' },
          { label: 'Platform', href: '/analytics/platform' }
        ]}
        actions={
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <Button onClick={fetchPlatformData}>
              Refresh
            </Button>
          </div>
        }
      />

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{formatPercentage(data.overview.monthlyGrowth)} this month</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{data.overview.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{formatPercentage((data.overview.activeUsers / data.overview.totalUsers) * 100)} of total</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</p>
                <p className="text-xs text-green-600">+{formatPercentage(data.overview.monthlyGrowth)} MoM</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                <p className="text-2xl font-bold">{data.overview.activeTenants}</p>
                <p className="text-xs text-gray-500">of {data.overview.totalTenants} total</p>
              </div>
              <Building className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-green-600">{formatPercentage(data.overview.conversionRate)}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold text-red-600">{formatPercentage(data.overview.churnRate)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session Time</p>
                <p className="text-2xl font-bold">{data.userMetrics.engagement.averageSessionTime}m</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Active</p>
                <p className="text-2xl font-bold">{data.userMetrics.engagement.dailyActive.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Distribution by Tier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              User Distribution by Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.userMetrics.byTier).map(([tier, stats]) => (
                <div key={tier} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{tier}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold">{stats.count.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 ml-2">({formatPercentage(stats.percentage)})</span>
                    </div>
                  </div>
                  <Progress value={stats.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Feature Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.featureUsage).map(([feature, stats]) => (
                <div key={feature} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{stats.usage}%</span>
                      <Badge variant={stats.trend === 'up' ? 'default' : stats.trend === 'down' ? 'destructive' : 'secondary'}>
                        {stats.trend}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={stats.usage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Tenants */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Top Performing Tenants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Tenant</th>
                  <th className="text-left py-3 px-4 font-medium">Users</th>
                  <th className="text-left py-3 px-4 font-medium">Monthly Revenue</th>
                  <th className="text-left py-3 px-4 font-medium">Growth Rate</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.tenantMetrics.topTenants.map((tenant, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{tenant.name}</td>
                    <td className="py-3 px-4">{tenant.users.toLocaleString()}</td>
                    <td className="py-3 px-4">{formatCurrency(tenant.revenue)}</td>
                    <td className="py-3 px-4">
                      <span className="text-green-600">+{formatPercentage(tenant.growth)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Breakdown by Tier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(data.revenueMetrics.byTier).map(([tier, revenue]) => (
              <div key={tier} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 capitalize">{tier}</p>
                <p className="text-2xl font-bold">{formatCurrency(revenue)}</p>
                <p className="text-xs text-gray-500">
                  {formatPercentage((revenue / Object.values(data.revenueMetrics.byTier).reduce((a, b) => a + b, 0)) * 100)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformAnalytics;