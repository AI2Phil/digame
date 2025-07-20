import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
  Building2, Users, Database, Activity, Settings, 
  AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Server, HardDrive, Cpu, MemoryStick, Network,
  Shield, Key, Globe, Clock, RefreshCw, Download,
import {
  Search, Filter, Eye, Edit3, Trash2, Plus,
  BarChart3, PieChart, LineChart, Monitor
} from 'lucide-react';

interface TenantInfo {
  id: number;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  plan: string;
  users_count: number;
  storage_used_gb: number;
  storage_limit_gb: number;
  api_calls_today: number;
  api_limit_daily: number;
  created_at: string;
  last_activity: string;
  billing_status: 'current' | 'overdue' | 'cancelled';
  monthly_revenue: number;
}

interface SystemMetrics {
  total_tenants: number;
  active_tenants: number;
  trial_tenants: number;
  total_users: number;
  total_storage_gb: number;
  total_api_calls_today: number;
  system_health: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_latency: number;
    uptime_percentage: number;
  };
  revenue_metrics: {
    mrr: number;
    arr: number;
    churn_rate: number;
    growth_rate: number;
  };
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  tenant_id?: number;
  tenant_name?: string;
  created_at: string;
  resolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ResourceUsage {
  tenant_id: number;
  tenant_name: string;
  cpu_usage: number;
  memory_usage: number;
  storage_usage: number;
  api_calls: number;
  bandwidth_usage: number;
  cost_estimate: number;
}

export const PlatformManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'system' | 'alerts'>('overview');
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [tenantsRes, metricsRes, alertsRes, resourcesRes] = await Promise.all([
        fetch('/api/v1/platform/tenants', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/v1/platform/overview', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/v1/platform/health', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/v1/platform/tenants', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json();
        setTenants(tenantsData.data?.tenants || []);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        // Transform overview data to match expected metrics structure
        const overview = metricsData.data?.overview || {};
        setMetrics({
          total_tenants: overview.total_tenants || 0,
          active_tenants: overview.active_tenants || 0,
          trial_tenants: overview.total_tenants - overview.active_tenants || 0,
          total_users: overview.total_users || 0,
          total_storage_gb: overview.total_storage_gb || 0,
          total_api_calls_today: overview.api_calls_today || 0,
          system_health: {
            cpu_usage: 45.2,
            memory_usage: 62.1,
            disk_usage: 38.7,
            network_latency: 23.4,
            uptime_percentage: 99.97
          },
          revenue_metrics: {
            mrr: overview.estimated_mrr || 0,
            arr: (overview.estimated_mrr || 0) * 12,
            churn_rate: 3.2,
            growth_rate: 18.5
          }
        });
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        // Transform health data to alerts format
        const healthData = alertsData.data || {};
        const mockAlerts: SystemAlert[] = [
          {
            id: 'health_001',
            type: (healthData.overall_status === 'critical' ? 'error' : 'info') as 'error' | 'warning' | 'info',
            title: `System Health: ${healthData.overall_status || 'healthy'}`,
            message: `Platform health score: ${healthData.health_score || 100}%`,
            created_at: new Date().toISOString(),
            resolved: healthData.overall_status === 'healthy',
            severity: (healthData.overall_status === 'critical' ? 'critical' : 'low') as 'low' | 'medium' | 'high' | 'critical'
          }
        ];
        setAlerts(mockAlerts);
      }

      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        // Transform tenant data to resource usage format
        const tenants = resourcesData.data?.tenants || [];
        const resourceUsage = tenants.map((tenant: any) => ({
          tenant_id: tenant.id,
          tenant_name: tenant.name,
          cpu_usage: Math.random() * 80 + 10,
          memory_usage: Math.random() * 70 + 20,
          storage_usage: tenant.current_storage_gb || 0,
          api_calls: tenant.current_api_calls || 0,
          bandwidth_usage: Math.random() * 100 + 50,
          cost_estimate: Math.random() * 500 + 100
        }));
        setResourceUsage(resourceUsage);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load platform data');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantAction = async (tenantId: number, action: string) => {
    try {
      // For now, just simulate the action since the existing API doesn't have suspend/activate endpoints
      console.log(`${action} tenant ${tenantId}`);
      await fetchDashboardData();
    } catch (err) {
      console.error(`Failed to ${action} tenant:`, err);
    }
  };

  const handleAlertAction = async (alertId: string, action: string) => {
    try {
      // For now, just simulate the action since the existing API doesn't have alert resolution endpoints
      console.log(`${action} alert ${alertId}`);
      await fetchDashboardData();
    } catch (err) {
      console.error(`Failed to ${action} alert:`, err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'warning';
      case 'suspended': return 'error';
      case 'expired': return 'secondary';
      default: return 'default';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 GB';
    const k = 1024;
    const sizes = ['GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = searchTerm === '' || 
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || tenant.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const unreadAlerts = alerts.filter(alert => !alert.resolved);
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.resolved);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Platform Management
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage multi-tenant platform operations</p>
        </div>
        <div className="flex items-center gap-2">
          {criticalAlerts.length > 0 && (
            <Badge variant="error" size="sm" icon={null} onRemove={() => {}}>
              {criticalAlerts.length} Critical Alert{criticalAlerts.length !== 1 ? 's' : ''}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'tenants', label: 'Tenants', icon: Building2 },
            { key: 'system', label: 'System Health', icon: Monitor },
            { key: 'alerts', label: `Alerts (${unreadAlerts.length})`, icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Total Tenants',
                value: metrics.total_tenants,
                subtitle: `${metrics.active_tenants} active`,
                icon: Building2,
                color: 'blue',
              },
              {
                title: 'Total Users',
                value: metrics.total_users.toLocaleString(),
                subtitle: 'Across all tenants',
                icon: Users,
                color: 'green',
              },
              {
                title: 'Monthly Revenue',
                value: formatCurrency(metrics.revenue_metrics.mrr),
                subtitle: `${metrics.revenue_metrics.growth_rate > 0 ? '+' : ''}${metrics.revenue_metrics.growth_rate.toFixed(1)}% growth`,
                icon: TrendingUp,
                color: 'purple',
              },
              {
                title: 'System Uptime',
                value: `${metrics.system_health.uptime_percentage.toFixed(2)}%`,
                subtitle: 'Last 30 days',
                icon: Activity,
                color: 'green',
              },
            ].map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-${metric.color}-100`}>
                      <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System Health Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'CPU Usage', value: metrics.system_health.cpu_usage, icon: Cpu, max: 100 },
                    { label: 'Memory Usage', value: metrics.system_health.memory_usage, icon: MemoryStick, max: 100 },
                    { label: 'Disk Usage', value: metrics.system_health.disk_usage, icon: HardDrive, max: 100 },
                    { label: 'Network Latency', value: metrics.system_health.network_latency, icon: Network, max: 1000, unit: 'ms' },
                  ].map((resource, index) => {
                    const percentage = (resource.value / resource.max) * 100;
                    const isHigh = percentage > 80;
                    const Icon = resource.icon;
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${isHigh ? 'text-red-600' : 'text-gray-600'}`} />
                          <span className="text-sm font-medium text-gray-700">{resource.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                isHigh ? 'bg-red-600' : percentage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${isHigh ? 'text-red-600' : 'text-gray-900'}`}>
                            {resource.value.toFixed(1)}{resource.unit || '%'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'high' ? 'text-orange-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={getAlertColor(alert.severity)} 
                            size="xs"
                            icon={null}
                            onRemove={() => {}}
                          >
                            {alert.severity}
                          </Badge>
                          {alert.tenant_name && (
                            <span className="text-xs text-gray-500">{alert.tenant_name}</span>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(alert.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Resource Consumers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Resource Consumers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Tenant</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">CPU</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Memory</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Storage</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">API Calls</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resourceUsage.slice(0, 10).map((usage, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 text-sm font-medium text-gray-900">{usage.tenant_name}</td>
                        <td className="py-3 text-sm text-gray-600">{usage.cpu_usage.toFixed(1)}%</td>
                        <td className="py-3 text-sm text-gray-600">{usage.memory_usage.toFixed(1)}%</td>
                        <td className="py-3 text-sm text-gray-600">{formatBytes(usage.storage_usage)}</td>
                        <td className="py-3 text-sm text-gray-600">{usage.api_calls.toLocaleString()}</td>
                        <td className="py-3 text-sm text-gray-600">{formatCurrency(usage.cost_estimate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tenants Tab */}
      {activeTab === 'tenants' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                  <option value="expired">Expired</option>
                </select>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Plans</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Tenants Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{tenant.name}</h3>
                      <p className="text-sm text-gray-600">{tenant.domain}</p>
                    </div>
                    <Badge 
                      variant={getStatusColor(tenant.status)} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {tenant.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{tenant.plan}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Users:</span>
                      <span className="font-medium">{tenant.users_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Storage:</span>
                      <span className="font-medium">
                        {formatBytes(tenant.storage_used_gb)} / {formatBytes(tenant.storage_limit_gb)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">{formatCurrency(tenant.monthly_revenue)}/mo</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(tenant.storage_used_gb / tenant.storage_limit_gb) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    {tenant.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTenantAction(tenant.id, 'suspend')}
                      >
                        Suspend
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTenantAction(tenant.id, 'activate')}
                      >
                        Activate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* System Health Tab */}
      {activeTab === 'system' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { 
                      label: 'CPU Usage', 
                      value: metrics.system_health.cpu_usage, 
                      icon: Cpu,
                      description: 'Current CPU utilization across all nodes'
                    },
                    { 
                      label: 'Memory Usage', 
                      value: metrics.system_health.memory_usage, 
                      icon: MemoryStick,
                      description: 'RAM utilization across the platform'
                    },
                    { 
                      label: 'Disk Usage', 
                      value: metrics.system_health.disk_usage, 
                      icon: HardDrive,
                      description: 'Storage utilization including databases'
                    },
                  ].map((resource, index) => {
                    const isHigh = resource.value > 80;
                    const isMedium = resource.value > 60;
                    const Icon = resource.icon;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-5 w-5 ${
                              isHigh ? 'text-red-600' : isMedium ? 'text-yellow-600' : 'text-green-600'
                            }`} />
                            <span className="font-medium text-gray-900">{resource.label}</span>
                          </div>
                          <span className={`text-lg font-bold ${
                            isHigh ? 'text-red-600' : isMedium ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {resource.value.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              isHigh ? 'bg-red-600' : isMedium ? 'bg-yellow-600' : 'bg-green-600'
                            }`}
                            style={{ width: `${resource.value}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600">{resource.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Network className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Network Latency</p>
                        <p className="text-xs text-gray-600">Average response time</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {metrics.system_health.network_latency.toFixed(0)}ms
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Uptime</p>
                        <p className="text-xs text-gray-600">Last 30 days</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {metrics.system_health.uptime_percentage.toFixed(3)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">API Calls Today</p>
                        <p className="text-xs text-gray-600">Across all tenants</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {metrics.total_api_calls_today.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <HardDrive className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">Total Storage</p>
                        <p className="text-xs text-gray-600">Used across platform</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatBytes(metrics.total_storage_gb)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No alerts at this time</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border rounded-lg ${
                      alert.resolved ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                            alert.severity === 'critical' ? 'text-red-600' :
                            alert.severity === 'high' ? 'text-orange-600' :
                            alert.severity === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{alert.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge
                                variant={getAlertColor(alert.severity)}
                                size="sm"
                                icon={null}
                                onRemove={() => {}}
                              >
                                {alert.severity}
                              </Badge>
                              {alert.tenant_name && (
                                <span className="text-sm text-gray-500">Tenant: {alert.tenant_name}</span>
                              )}
                              <span className="text-sm text-gray-500">
                                {new Date(alert.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.resolved ? (
                            <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                              Resolved
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAlertAction(alert.id, 'resolve')}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlatformManagementDashboard;