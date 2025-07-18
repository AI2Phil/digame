import React, { useState, useEffect } from 'react';
import {
  Building, Users, Settings, Globe, ArrowRightLeft, Plus, Eye, Edit,
  BarChart3, Shield, Database, Activity, AlertTriangle, TrendingUp,
  Server, Clock, CheckCircle, XCircle, Cpu, HardDrive, Network
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';

const MultiTenantConsolePage = () => {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTenantSwitcher, setShowTenantSwitcher] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [resourceMetrics, setResourceMetrics] = useState({});
  const [tenantSettings, setTenantSettings] = useState({});

  useEffect(() => {
    fetchTenantData();
  }, []);

  const fetchTenantData = async () => {
    try {
      setLoading(true);
      // Fetch current tenant info and available tenants
      const [tenantResponse, usersResponse, metricsResponse, settingsResponse] = await Promise.all([
        fetch('/api/v1/enterprise/multi-tenant/current', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/v1/enterprise/multi-tenant/users', {
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
        fetch(`/api/v1/tenants/${currentTenant?.id}/settings/general`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false }))
      ]);

      if (!tenantResponse.ok || !usersResponse.ok) {
        throw new Error('Failed to fetch tenant data');
      }

      const tenantData = await tenantResponse.json();
      const usersData = await usersResponse.json();

      setCurrentTenant(tenantData.current_tenant);
      setAvailableTenants(tenantData.available_tenants || []);
      setTenantUsers(usersData.users || []);

      // Optional metrics and settings
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setResourceMetrics(metricsData.data || {});
      }

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setTenantSettings(settingsData || {});
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = async (tenantId) => {
    try {
      const response = await fetch('/api/v1/enterprise/multi-tenant/switch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tenant_id: tenantId })
      });

      if (!response.ok) {
        throw new Error('Failed to switch tenant');
      }

      // Refresh the page to update context
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'team': return 'bg-green-100 text-green-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Multi-Tenant Console...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchTenantData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Multi-Tenant Console</h1>
                <p className="text-sm text-gray-500">Manage multiple tenant environments</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Advanced Enterprise
            </Badge>
          </div>
        </div>
      </div>

      {/* Current Tenant Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentTenant?.name || 'No Tenant Selected'}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentTenant?.slug} • {currentTenant?.subscription_tier?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowTenantSwitcher(!showTenantSwitcher)}
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Switch Tenant
              </Button>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Tenant Settings
              </Button>
            </div>
          </div>

          {/* Tenant Switcher Dropdown */}
          {showTenantSwitcher && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Available Tenants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      currentTenant?.id === tenant.id ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
                    }`}
                    onClick={() => switchTenant(tenant.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-xs text-gray-500">{tenant.slug}</p>
                      </div>
                      <Badge className={`text-xs ${getTierBadgeColor(tenant.subscription_tier)}`}>
                        {tenant.subscription_tier?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tenant Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {currentTenant?.current_users || 0}
                </p>
                <p className="text-sm text-gray-500">
                  of {currentTenant?.max_users || 0} allowed
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Storage Used</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {currentTenant?.current_storage_gb || 0} GB
                </p>
                <p className="text-sm text-gray-500">
                  of {currentTenant?.max_storage_gb || 0} GB limit
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">API Calls</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {currentTenant?.current_api_calls_monthly || 0}
                </p>
                <p className="text-sm text-gray-500">
                  of {currentTenant?.max_api_calls_monthly || 0} monthly
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tenant Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="resources">Resource Monitoring</TabsTrigger>
            <TabsTrigger value="settings">Tenant Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TenantHealthCard currentTenant={currentTenant} resourceMetrics={resourceMetrics} />
              <TenantActivityCard />
            </div>
            <QuickActionsGrid />
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <TenantUsersSection tenantUsers={tenantUsers} currentTenant={currentTenant} />
          </TabsContent>

          {/* Resource Monitoring Tab */}
          <TabsContent value="resources" className="space-y-6">
            <ResourceMonitoringSection currentTenant={currentTenant} resourceMetrics={resourceMetrics} />
          </TabsContent>

          {/* Tenant Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <TenantSettingsSection currentTenant={currentTenant} tenantSettings={tenantSettings} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <TenantAnalyticsSection currentTenant={currentTenant} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Enhanced Component Sections

// Tenant Health Card Component
const TenantHealthCard = ({ currentTenant, resourceMetrics }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Tenant Health & Performance
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>User Utilization</span>
            <span>{currentTenant ? Math.round((currentTenant.current_users / currentTenant.max_users) * 100) : 0}%</span>
          </div>
          <Progress value={currentTenant ? (currentTenant.current_users / currentTenant.max_users) * 100 : 0} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Storage Usage</span>
            <span>{currentTenant ? Math.round((currentTenant.current_storage_gb / currentTenant.max_storage_gb) * 100) : 0}%</span>
          </div>
          <Progress value={currentTenant ? (currentTenant.current_storage_gb / currentTenant.max_storage_gb) * 100 : 0} className="h-2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>API Usage</span>
          <span>{currentTenant ? Math.round((currentTenant.current_api_calls_monthly / currentTenant.max_api_calls_monthly) * 100) : 0}%</span>
        </div>
        <Progress value={currentTenant ? (currentTenant.current_api_calls_monthly / currentTenant.max_api_calls_monthly) * 100 : 0} className="h-2" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm font-medium">Overall Health</span>
        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      </div>
    </CardContent>
  </Card>
);

// Tenant Activity Card Component
const TenantActivityCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Recent Activity
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[
          { action: 'User invited', user: 'john.doe@company.com', time: '5 minutes ago', type: 'success' },
          { action: 'Settings updated', user: 'admin@company.com', time: '1 hour ago', type: 'info' },
          { action: 'API key created', user: 'dev@company.com', time: '2 hours ago', type: 'info' },
          { action: 'Storage limit increased', user: 'System', time: '1 day ago', type: 'success' }
        ].map((activity, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${
              activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
            }`} />
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.action}</p>
              <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Quick Actions Grid Component
const QuickActionsGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
      <Settings className="h-6 w-6 mb-2" />
      <span className="text-sm">Tenant Settings</span>
    </Button>
    
    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
      <Users className="h-6 w-6 mb-2" />
      <span className="text-sm">User Management</span>
    </Button>
    
    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
      <Globe className="h-6 w-6 mb-2" />
      <span className="text-sm">Domain Settings</span>
    </Button>
    
    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
      <Building className="h-6 w-6 mb-2" />
      <span className="text-sm">Billing & Usage</span>
    </Button>
  </div>
);

// Tenant Users Section Component
const TenantUsersSection = ({ tenantUsers, currentTenant }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Tenant Users ({tenantUsers.length})</CardTitle>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenantUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user.name?.charAt(0) || user.email?.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className="text-xs bg-blue-100 text-blue-800">
                    {user.role || 'User'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`text-xs ${
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
);

// Resource Monitoring Section Component
const ResourceMonitoringSection = ({ currentTenant, resourceMetrics }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          Resource Allocation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Users</span>
              <span>{currentTenant?.current_users || 0} / {currentTenant?.max_users || 0}</span>
            </div>
            <Progress value={currentTenant ? (currentTenant.current_users / currentTenant.max_users) * 100 : 0} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Storage</span>
              <span>{currentTenant?.current_storage_gb || 0} GB / {currentTenant?.max_storage_gb || 0} GB</span>
            </div>
            <Progress value={currentTenant ? (currentTenant.current_storage_gb / currentTenant.max_storage_gb) * 100 : 0} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>API Calls (Monthly)</span>
              <span>{currentTenant?.current_api_calls_monthly || 0} / {currentTenant?.max_api_calls_monthly || 0}</span>
            </div>
            <Progress value={currentTenant ? (currentTenant.current_api_calls_monthly / currentTenant.max_api_calls_monthly) * 100 : 0} />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">99.9%</p>
            <p className="text-sm text-gray-600">Uptime</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">145ms</p>
            <p className="text-sm text-gray-600">Avg Response</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Network className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">1.2k</p>
            <p className="text-sm text-gray-600">Requests/min</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <HardDrive className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">0.1%</p>
            <p className="text-sm text-gray-600">Error Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Tenant Settings Section Component
const TenantSettingsSection = ({ currentTenant, tenantSettings }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          General Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
          <input
            type="text"
            value={currentTenant?.name || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={currentTenant?.slug || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Tier</label>
          <Badge className="bg-purple-100 text-purple-800">
            {currentTenant?.subscription_tier?.replace('_', ' ') || 'N/A'}
          </Badge>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Two-Factor Authentication</span>
          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">SSO Integration</span>
          <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">API Rate Limiting</span>
          <Badge className="bg-green-100 text-green-800">Active</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Audit Logging</span>
          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Tenant Analytics Section Component
const TenantAnalyticsSection = ({ currentTenant }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Usage Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">+15%</p>
            <p className="text-sm text-gray-500">User Growth (30d)</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>API Usage Growth</span>
              <span className="text-green-600">+8%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Storage Growth</span>
              <span className="text-blue-600">+12%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Active Users</span>
              <span className="text-purple-600">+5%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Feature Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>AI Features</span>
              <span>85%</span>
            </div>
            <Progress value={85} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Analytics</span>
              <span>72%</span>
            </div>
            <Progress value={72} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Integrations</span>
              <span>45%</span>
            </div>
            <Progress value={45} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Workflows</span>
              <span>63%</span>
            </div>
            <Progress value={63} />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <div>
              <p className="text-sm font-medium">Storage Warning</p>
              <p className="text-xs text-gray-500">85% of limit reached</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">Backup Completed</p>
              <p className="text-xs text-gray-500">Daily backup successful</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
            <Activity className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Performance Normal</p>
              <p className="text-xs text-gray-500">All systems operational</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default MultiTenantConsolePage;