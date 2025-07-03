import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';

const EnterpriseDashboard = () => {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/enterprise/dashboard');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const enterpriseMetrics = [
    {
      title: 'Total Tenants',
      value: '247',
      change: '+12.5%',
      trend: 'up',
      icon: '🏢'
    },
    {
      title: 'Active Users',
      value: '15,432',
      change: '+8.3%',
      trend: 'up',
      icon: '👥'
    },
    {
      title: 'Monthly Revenue',
      value: '$2.4M',
      change: '+15.7%',
      trend: 'up',
      icon: '💰'
    },
    {
      title: 'System Uptime',
      value: '99.97%',
      change: '+0.02%',
      trend: 'up',
      icon: '⚡'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'tenant_created',
      message: 'New enterprise tenant "TechCorp Solutions" created',
      timestamp: '2 hours ago',
      severity: 'info'
    },
    {
      id: 2,
      type: 'integration_deployed',
      message: 'SSO integration deployed for "Global Industries"',
      timestamp: '4 hours ago',
      severity: 'success'
    },
    {
      id: 3,
      type: 'alert',
      message: 'High CPU usage detected on tenant "DataFlow Inc"',
      timestamp: '6 hours ago',
      severity: 'warning'
    },
    {
      id: 4,
      type: 'upgrade',
      message: 'Tenant "Innovation Labs" upgraded to Enterprise Plus',
      timestamp: '8 hours ago',
      severity: 'success'
    },
    {
      id: 5,
      type: 'maintenance',
      message: 'Scheduled maintenance completed for EU region',
      timestamp: '12 hours ago',
      severity: 'info'
    }
  ];

  const topTenants = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      users: 2341,
      revenue: '$45,600',
      growth: '+23%',
      status: 'active',
      tier: 'Enterprise Plus'
    },
    {
      id: 2,
      name: 'Global Industries',
      users: 1987,
      revenue: '$38,200',
      growth: '+18%',
      status: 'active',
      tier: 'Enterprise'
    },
    {
      id: 3,
      name: 'DataFlow Inc',
      users: 1654,
      revenue: '$32,100',
      growth: '+15%',
      status: 'warning',
      tier: 'Enterprise'
    },
    {
      id: 4,
      name: 'Innovation Labs',
      users: 1432,
      revenue: '$28,900',
      growth: '+12%',
      status: 'active',
      tier: 'Enterprise Plus'
    },
    {
      id: 5,
      name: 'Future Systems',
      users: 1298,
      revenue: '$25,400',
      growth: '+9%',
      status: 'active',
      tier: 'Enterprise'
    }
  ];

  const systemHealth = [
    { service: 'API Gateway', status: 'healthy', uptime: '99.98%', responseTime: '45ms' },
    { service: 'Database Cluster', status: 'healthy', uptime: '99.95%', responseTime: '12ms' },
    { service: 'Authentication Service', status: 'healthy', uptime: '99.99%', responseTime: '23ms' },
    { service: 'Analytics Engine', status: 'warning', uptime: '99.87%', responseTime: '156ms' },
    { service: 'File Storage', status: 'healthy', uptime: '99.96%', responseTime: '78ms' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Enterprise Dashboard"
        subtitle="Comprehensive enterprise platform management and analytics"
        breadcrumbs={[
          { label: 'Enterprise', href: '/enterprise' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/enterprise/tenants')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Manage Tenants
            </button>
            <button
              onClick={() => router.push('/enterprise/market-intel')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Market Intelligence
            </button>
            <button
              onClick={() => router.push('/enterprise/advanced-analytics')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Advanced Analytics
            </button>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Generate Report
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {enterpriseMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</div>
                  <div className={`text-sm mt-1 ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change} from last month
                  </div>
                </div>
                <div className="text-3xl">{metric.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'tenants', label: 'Top Tenants' },
              { id: 'health', label: 'System Health' },
              { id: 'activities', label: 'Recent Activities' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-gray-600">Revenue growth visualization</p>
                  <p className="text-sm text-gray-500">Monthly revenue trends across all tenants</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-gray-600">User growth visualization</p>
                  <p className="text-sm text-gray-500">Active user trends and projections</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Tenants Tab */}
        {activeTab === 'tenants' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Performing Tenants</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tenant.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.users.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.revenue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {tenant.growth}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {tenant.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tenant.status)}`}>
                          {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'health' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Health Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {systemHealth.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'healthy' ? 'bg-green-500' : 
                        service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{service.service}</h4>
                        <div className="text-sm text-gray-500">
                          Uptime: {service.uptime} • Response: {service.responseTime}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities Tab */}
        {activeTab === 'activities' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Platform Activities</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.severity === 'success' ? 'bg-green-500' :
                      activity.severity === 'warning' ? 'bg-yellow-500' :
                      activity.severity === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${getSeverityColor(activity.severity)}`}>
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseDashboard;