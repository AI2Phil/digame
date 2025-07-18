import React, { useState, useEffect } from 'react';
import {
  Building,
  Users,
  DollarSign,
  Settings,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Server,
  Database,
  Globe,
  Shield,
  RefreshCw,
  Download,
  Upload,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/Dialog';

const PlatformOwnerTenantsPage = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showTenantDetails, setShowTenantDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [tenantMetrics, setTenantMetrics] = useState({});

  useEffect(() => {
    fetchTenants();
  }, [filterTier, filterStatus]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterTier) params.append('subscription_tier', filterTier);
      if (filterStatus) params.append('status', filterStatus);

      const [tenantsResponse, metricsResponse] = await Promise.all([
        fetch(`/api/v1/platform/tenants?${params}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/v1/platform/overview', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => ({ ok: false })),
      ]);

      if (!tenantsResponse.ok) {
        throw new Error('Failed to fetch tenants');
      }

      const tenantsData = await tenantsResponse.json();
      setTenants(tenantsData.data.tenants || []);

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setTenantMetrics(metricsData.data || {});
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(
    tenant =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierBadgeColor = tier => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'team':
        return 'bg-green-100 text-green-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusBadgeColor = status => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'trial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTenantAction = async (tenantId, action) => {
    try {
      const response = await fetch(`/api/v1/platform/tenants/${tenantId}/${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} tenant`);
      }

      fetchTenants(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const viewTenantDetails = async tenant => {
    try {
      const response = await fetch(`/api/v1/platform/tenants/${tenant.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedTenant(data.data);
        setShowTenantDetails(true);
      }
    } catch (err) {
      console.error('Failed to fetch tenant details:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
                <p className="text-sm text-gray-500">
                  Manage all platform tenants and organizations
                </p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Tenant
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tenants..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterTier}
              onChange={e => setFilterTier(e.target.value)}
            >
              <option value="">All Tiers</option>
              <option value="free">Free</option>
              <option value="individual_pro">Individual Pro</option>
              <option value="team">Team</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
            </select>

            <Button variant="outline" onClick={fetchTenants}>
              <Filter className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Enhanced Tenant Management */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list">Tenant List</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="billing">Billing Overview</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          </TabsList>

          {/* Tenant List Tab */}
          <TabsContent value="list" className="space-y-6">
            <TenantListSection
              tenants={filteredTenants}
              loading={loading}
              error={error}
              onRefresh={fetchTenants}
              onViewDetails={viewTenantDetails}
              onTenantAction={handleTenantAction}
              getTierBadgeColor={getTierBadgeColor}
              getStatusBadgeColor={getStatusBadgeColor}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <TenantAnalyticsSection tenants={tenants} tenantMetrics={tenantMetrics} />
          </TabsContent>

          {/* Billing Overview Tab */}
          <TabsContent value="billing" className="space-y-6">
            <TenantBillingSection tenants={tenants} />
          </TabsContent>

          {/* Bulk Operations Tab */}
          <TabsContent value="bulk" className="space-y-6">
            <BulkOperationsSection tenants={tenants} onRefresh={fetchTenants} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Tenant</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tenant name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tenant-slug"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Tier
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="free">Free</option>
                  <option value="team">Team</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Tenant</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenant Details Dialog */}
      <Dialog open={showTenantDetails} onOpenChange={setShowTenantDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tenant Details</DialogTitle>
            <DialogDescription>Comprehensive tenant information and management</DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <TenantDetailsDialog
              tenant={selectedTenant}
              onAction={handleTenantAction}
              onClose={() => setShowTenantDetails(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Enhanced Component Sections

// Tenant List Section Component
const TenantListSection = ({
  tenants,
  loading,
  error,
  onRefresh,
  onViewDetails,
  onTenantAction,
  getTierBadgeColor,
  getStatusBadgeColor,
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Tenants ({tenants.length})</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tenants...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={onRefresh} className="mt-4">
            Retry
          </Button>
        </div>
      ) : (
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
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health
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
              {tenants.map(tenant => (
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
                    <div className="flex flex-col space-y-1">
                      <Badge className={`text-xs ${getTierBadgeColor(tenant.subscription_tier)}`}>
                        {tenant.subscription_tier?.replace('_', ' ')}
                      </Badge>
                      <Badge
                        className={`text-xs ${getStatusBadgeColor(tenant.subscription_status)}`}
                      >
                        {tenant.subscription_status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        <span>
                          {tenant.current_users}/{tenant.max_users}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Database className="h-4 w-4 text-gray-400 mr-1" />
                        <span>
                          {tenant.current_storage_gb}/{tenant.max_storage_gb} GB
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Healthy</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tenant.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => onViewDetails(tenant)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTenantAction(tenant.id, 'edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onTenantAction(tenant.id, 'suspend')}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardContent>
  </Card>
);

// Tenant Analytics Section Component
const TenantAnalyticsSection = ({ tenants, tenantMetrics }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Tenant Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{tenants.length}</p>
            <p className="text-sm text-gray-500">Total Tenants</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Active</span>
              <span className="text-green-600">
                {tenants.filter(t => t.subscription_status === 'active').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Trial</span>
              <span className="text-yellow-600">
                {tenants.filter(t => t.subscription_status === 'trial').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Suspended</span>
              <span className="text-red-600">
                {tenants.filter(t => t.subscription_status === 'suspended').length}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Growth Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">+12%</p>
            <p className="text-sm text-gray-500">Monthly Growth</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>New This Month</span>
              <span>8</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Churned</span>
              <span>2</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Net Growth</span>
              <span className="text-green-600">+6</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Resource Utilization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Average User Utilization</span>
              <span>68%</span>
            </div>
            <Progress value={68} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Average Storage Usage</span>
              <span>45%</span>
            </div>
            <Progress value={45} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>API Usage</span>
              <span>72%</span>
            </div>
            <Progress value={72} />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Tenant Billing Section Component
const TenantBillingSection = ({ tenants }) => {
  const tierPricing = { free: 0, team: 49, enterprise: 500 };
  const totalMRR = tenants.reduce(
    (sum, tenant) => sum + (tierPricing[tenant.subscription_tier] || 0),
    0
  );

  return (
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
              <p className="text-3xl font-bold text-green-600">${totalMRR}</p>
              <p className="text-sm text-gray-500">Monthly Recurring Revenue</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average Revenue Per Tenant</span>
                <span>${tenants.length > 0 ? Math.round(totalMRR / tenants.length) : 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Paying Tenants</span>
                <span>{tenants.filter(t => t.subscription_tier !== 'free').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Free Tenants</span>
                <span>{tenants.filter(t => t.subscription_tier === 'free').length}</span>
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
            {Object.entries(tierPricing).map(([tier, price]) => {
              const count = tenants.filter(t => t.subscription_tier === tier).length;
              const revenue = count * price;
              return (
                <div key={tier}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{tier.replace('_', ' ')}</span>
                    <span>${revenue}</span>
                  </div>
                  <Progress value={totalMRR > 0 ? (revenue / totalMRR) * 100 : 0} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Bulk Operations Section Component
const BulkOperationsSection = ({ tenants, onRefresh }) => {
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  const handleBulkAction = async () => {
    if (!bulkAction || selectedTenants.length === 0) return;

    try {
      await Promise.all(
        selectedTenants.map(tenantId =>
          fetch(`/api/v1/platform/tenants/${tenantId}/${bulkAction}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          })
        )
      );

      setSelectedTenants([]);
      setBulkAction('');
      onRefresh();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Bulk Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <select
              value={bulkAction}
              onChange={e => setBulkAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Action</option>
              <option value="suspend">Suspend Tenants</option>
              <option value="activate">Activate Tenants</option>
              <option value="upgrade">Upgrade Tier</option>
              <option value="export">Export Data</option>
            </select>

            <Button
              onClick={handleBulkAction}
              disabled={!bulkAction || selectedTenants.length === 0}
            >
              Execute ({selectedTenants.length} selected)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import/Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Upload className="h-6 w-6 mb-2" />
              <span className="text-sm">Import Tenants</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Download className="h-6 w-6 mb-2" />
              <span className="text-sm">Export All Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Tenant Details Dialog Component
const TenantDetailsDialog = ({ tenant, onAction, onClose }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tenant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="text-sm text-gray-900">{tenant.tenant_info?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <p className="text-sm text-gray-900">{tenant.tenant_info?.slug}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Admin</label>
            <p className="text-sm text-gray-900">{tenant.tenant_info?.admin_name}</p>
            <p className="text-xs text-gray-500">{tenant.tenant_info?.admin_email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <Badge className="bg-green-100 text-green-800">
              {tenant.tenant_info?.subscription_status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Users</span>
              <span>
                {tenant.usage_metrics?.current_users}/{tenant.usage_metrics?.max_users}
              </span>
            </div>
            <Progress value={tenant.usage_metrics?.user_utilization || 0} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Storage</span>
              <span>
                {tenant.usage_metrics?.current_storage_gb}/{tenant.usage_metrics?.max_storage_gb} GB
              </span>
            </div>
            <Progress value={tenant.usage_metrics?.storage_utilization || 0} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>API Calls</span>
              <span>
                {tenant.usage_metrics?.current_api_calls}/{tenant.usage_metrics?.max_api_calls}
              </span>
            </div>
            <Progress value={tenant.usage_metrics?.api_utilization || 0} />
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Tenant Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {(tenant.users || []).map(user => (
            <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Badge
                className={
                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <div className="flex justify-end space-x-3">
      <Button variant="outline" onClick={onClose}>
        Close
      </Button>
      <Button onClick={() => onAction(tenant.tenant_info?.id, 'edit')}>Edit Tenant</Button>
    </div>
  </div>
);

export default PlatformOwnerTenantsPage;
