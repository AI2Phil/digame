import React, { useState, useEffect } from 'react';
import {
  Crown, Users, Building, DollarSign, Activity, AlertTriangle, TrendingUp, Server,
  Shield, Database, Settings, BarChart3, Globe, Clock, CheckCircle, XCircle,
  Cpu, HardDrive, Network, Zap, Eye, Edit, Trash2, Plus, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';

const PlatformOwnerConsolePage = () => {
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [platformHealth, setPlatformHealth] = useState({});
  const [revenueData, setRevenueData] = useState({});
  const [allTenants, setAllTenants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchPlatformOverview();
  }, []);

  const fetchPlatformOverview = async () => {
    try {
      setLoading(true);
      const [overviewResponse, healthResponse, revenueResponse, tenantsResponse, usersResponse] = await Promise.all([
        fetch('/api/v1/platform/overview', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/v1/platform/health', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false })),
        fetch('/api/v1/platform/analytics/revenue', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false })),
        fetch('/api/v1/platform/tenants?limit=10', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false })),
        fetch('/api/v1/platform/users?limit=10', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false }))
      ]);

      if (!overviewResponse.ok) {
        throw new Error('Failed to fetch platform overview');
      }

      const overviewData = await overviewResponse.json();
      setPlatformData(overviewData.data);

      // Optional data fetching
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setPlatformHealth(healthData.data || {});
      }

      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        setRevenueData(revenueData.data || {});
      }

      if (tenantsResponse.ok) {
        const tenantsData = await tenantsResponse.json();
        setAllTenants(tenantsData.data?.tenants || []);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setAllUsers(usersData.data?.users || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Platform Console...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Console</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchPlatformOverview}>Retry</Button>
        </div>
      </div>
    );
  }

  const overview = platformData?.overview || {};
  const subscriptionBreakdown = platformData?.subscription_breakdown || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Platform Owner Console</h1>
                <p className="text-sm text-gray-500">Comprehensive platform management and analytics</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Crown className="w-3 h-3 mr-1" />
              Platform Owner Access
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Tenants"
            value={overview.total_tenants || 0}
            subtitle={`${overview.active_tenants || 0} active`}
            icon={Building}
            color="blue"
          />
          <MetricCard
            title="Total Users"
            value={overview.total_users || 0}
            subtitle={`${overview.active_users || 0} active`}
            icon={Users}
            color="green"
          />
          <MetricCard
            title="Estimated MRR"
            value={`$${overview.estimated_mrr || 0}`}
            subtitle="Monthly Recurring Revenue"
            icon={DollarSign}
            color="purple"
          />
          <MetricCard
            title="API Calls Today"
            value={overview.api_calls_today || 0}
            subtitle={`${overview.total_storage_gb || 0} GB storage used`}
            icon={Activity}
            color="orange"
          />
        </div>

        {/* Enhanced Platform Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tenants">Tenant Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SubscriptionBreakdownCard subscriptionBreakdown={subscriptionBreakdown} />
              <QuickActionsCard />
            </div>
            <PlatformStatusCard platformHealth={platformHealth} />
          </TabsContent>

          {/* Tenant Management Tab */}
          <TabsContent value="tenants" className="space-y-6">
            <TenantManagementSection tenants={allTenants} onRefresh={fetchPlatformOverview} />
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserManagementSection users={allUsers} onRefresh={fetchPlatformOverview} />
          </TabsContent>

          {/* Revenue Analytics Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <RevenueAnalyticsSection revenueData={revenueData} subscriptionBreakdown={subscriptionBreakdown} />
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <SystemHealthSection platformHealth={platformHealth} />
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <SystemConfigurationSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Enhanced Component Sections

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Subscription Breakdown Card Component
const SubscriptionBreakdownCard = ({ subscriptionBreakdown }) => (
  <Card>
    <CardHeader>
      <CardTitle>Subscription Breakdown</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {Object.entries(subscriptionBreakdown || {}).map(([tier, count]) => (
          <div key={tier} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                tier === 'free' ? 'bg-gray-400' :
                tier === 'individual_pro' ? 'bg-blue-500' :
                tier === 'team' ? 'bg-green-500' :
                'bg-purple-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {tier.replace('_', ' ')}
              </span>
            </div>
            <span className="text-sm text-gray-600">{count} users</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Quick Actions Card Component
const QuickActionsCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center"
          onClick={() => window.location.href = '/platform-owner/tenants'}
        >
          <Building className="h-6 w-6 mb-2" />
          <span className="text-sm">Manage Tenants</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center"
          onClick={() => window.location.href = '/platform-owner/users'}
        >
          <Users className="h-6 w-6 mb-2" />
          <span className="text-sm">Manage Users</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center"
          onClick={() => window.location.href = '/platform-owner/revenue'}
        >
          <TrendingUp className="h-6 w-6 mb-2" />
          <span className="text-sm">Revenue Analytics</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center"
          onClick={() => window.location.href = '/platform-owner/health'}
        >
          <Server className="h-6 w-6 mb-2" />
          <span className="text-sm">System Health</span>
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Platform Status Card Component
const PlatformStatusCard = ({ platformHealth }) => (
  <Card>
    <CardHeader>
      <CardTitle>Platform Status</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <h4 className="text-sm font-medium text-gray-900">System Health</h4>
          <p className="text-xs text-gray-500">
            {platformHealth.overall_status === 'healthy' ? 'All systems operational' : 'Issues detected'}
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="text-sm font-medium text-gray-900">API Performance</h4>
          <p className="text-xs text-gray-500">Average response: 245ms</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Server className="w-6 h-6 text-purple-600" />
          </div>
          <h4 className="text-sm font-medium text-gray-900">Infrastructure</h4>
          <p className="text-xs text-gray-500">99.9% uptime</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Tenant Management Section Component
const TenantManagementSection = ({ tenants, onRefresh }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium text-gray-900">Recent Tenants</h3>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button onClick={() => window.location.href = '/platform-owner/tenants'}>
          <Plus className="w-4 h-4 mr-2" />
          Create Tenant
        </Button>
      </div>
    </div>
    
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className="bg-purple-100 text-purple-800">
                      {tenant.subscription_tier?.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.current_users}/{tenant.max_users}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tenant.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

// User Management Section Component
const UserManagementSection = ({ users, onRefresh }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
      <Button variant="outline" onClick={onRefresh}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
    </div>
    
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-green-600">
                            {user.username?.charAt(0) || user.email?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className="bg-blue-100 text-blue-800">
                      {user.subscription_tier?.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Revenue Analytics Section Component
const RevenueAnalyticsSection = ({ revenueData, subscriptionBreakdown }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Revenue Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">${revenueData.summary?.total_mrr || 0}</p>
            <p className="text-sm text-gray-500">Monthly Recurring Revenue</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Subscribers</span>
              <span>{revenueData.summary?.total_subscribers || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>ARPU</span>
              <span>${revenueData.summary?.average_revenue_per_user || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Growth Rate</span>
              <span className="text-green-600">+12%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Revenue by Tier
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(revenueData.mrr_by_tier || []).map((tier) => (
            <div key={tier.tier}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize">{tier.tier.replace('_', ' ')}</span>
                <span>${tier.mrr}</span>
              </div>
              <Progress value={(tier.mrr / (revenueData.summary?.total_mrr || 1)) * 100} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// System Health Section Component
const SystemHealthSection = ({ platformHealth }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          System Health Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
              platformHealth.overall_status === 'healthy' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {platformHealth.overall_status === 'healthy' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {platformHealth.health_score || 100}%
            </p>
            <p className="text-sm text-gray-500">Overall Health Score</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Healthy Services</span>
              <span className="text-green-600">{platformHealth.metrics_summary?.healthy || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Warning Services</span>
              <span className="text-yellow-600">{platformHealth.metrics_summary?.warning || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Critical Services</span>
              <span className="text-red-600">{platformHealth.metrics_summary?.critical || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          Infrastructure Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Cpu className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">45%</p>
            <p className="text-sm text-gray-600">CPU Usage</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <HardDrive className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">62%</p>
            <p className="text-sm text-gray-600">Memory</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">38%</p>
            <p className="text-sm text-gray-600">Database Load</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Network className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">120ms</p>
            <p className="text-sm text-gray-600">Response Time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// System Configuration Section Component
const SystemConfigurationSection = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Platform Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Maintenance Mode</span>
          <Badge className="bg-green-100 text-green-800">Disabled</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Auto-scaling</span>
          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Backup Schedule</span>
          <Badge className="bg-blue-100 text-blue-800">Daily</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">SSL Certificate</span>
          <Badge className="bg-green-100 text-green-800">Valid</Badge>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Global Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">CDN Status</span>
          <Badge className="bg-green-100 text-green-800">Active</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Rate Limiting</span>
          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">API Versioning</span>
          <Badge className="bg-blue-100 text-blue-800">v1.0</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Monitoring</span>
          <Badge className="bg-green-100 text-green-800">Active</Badge>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default PlatformOwnerConsolePage;