import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  CogIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  Cog6ToothIcon,
  BellIcon,
  DocumentTextIcon,
  ServerIcon,
  DatabaseIcon,
  GlobeAltIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({});
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls
      const [dashboardRes, alertsRes, activityRes] = await Promise.all([
        fetch(`/api/admin/dashboard?timeRange=${timeRange}`),
        fetch('/api/admin/alerts'),
        fetch('/api/admin/activity')
      ]);
      
      const dashboardData = await dashboardRes.json();
      const alertsData = await alertsRes.json();
      const activityData = await activityRes.json();
      
      setDashboardData(dashboardData.data || {});
      setSystemAlerts(alertsData.data || []);
      setRecentActivity(activityData.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    } else if (trend < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
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
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CogIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">System overview and administrative controls</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
                <button 
                  onClick={fetchDashboardData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.totalUsers || 0}</p>
                  {getTrendIcon(dashboardData.usersTrend)}
                  <span className={`ml-1 text-sm ${dashboardData.usersTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(dashboardData.usersTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.activeSessions || 0}</p>
                  {getTrendIcon(dashboardData.sessionsTrend)}
                  <span className={`ml-1 text-sm ${dashboardData.sessionsTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(dashboardData.sessionsTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ServerIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">System Load</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.systemLoad || '0%'}</p>
                  {getTrendIcon(dashboardData.loadTrend)}
                  <span className={`ml-1 text-sm ${dashboardData.loadTrend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.abs(dashboardData.loadTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.securityScore || 0}%</p>
                  {getTrendIcon(dashboardData.securityTrend)}
                  <span className={`ml-1 text-sm ${dashboardData.securityTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(dashboardData.securityTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { name: 'Web Server', status: 'healthy', uptime: '99.9%', icon: ServerIcon },
                  { name: 'Database', status: 'healthy', uptime: '99.8%', icon: DatabaseIcon },
                  { name: 'Cache Layer', status: 'warning', uptime: '98.5%', icon: DatabaseIcon },
                  { name: 'External APIs', status: 'healthy', uptime: '99.2%', icon: GlobeAltIcon },
                  { name: 'Background Jobs', status: 'healthy', uptime: '99.7%', icon: Cog6ToothIcon }
                ].map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <service.icon className="h-5 w-5 text-gray-600 mr-3" />
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{service.uptime}</span>
                      <div className="flex items-center">
                        {service.status === 'healthy' ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                        )}
                        <span className={`ml-1 px-2 py-1 text-xs font-medium rounded-full ${
                          service.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {systemAlerts.length > 0 ? (
                  systemAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {getAlertIcon(alert.severity)}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs mt-1">{alert.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No active alerts</h3>
                    <p className="mt-1 text-sm text-gray-500">All systems are operating normally.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'user' ? 'bg-blue-500' :
                          activity.type === 'system' ? 'bg-green-500' :
                          activity.type === 'security' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          activity.type === 'user' ? 'bg-blue-100 text-blue-800' :
                          activity.type === 'system' ? 'bg-green-100 text-green-800' :
                          activity.type === 'security' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                    <p className="mt-1 text-sm text-gray-500">Activity will appear here as it happens.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => router.push('/admin/users')}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <UserGroupIcon className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Manage Users</h4>
                  <p className="text-sm text-gray-600">View and manage user accounts</p>
                </button>

                <button 
                  onClick={() => router.push('/admin/config')}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <Cog6ToothIcon className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-medium text-gray-900">System Config</h4>
                  <p className="text-sm text-gray-600">Configure system settings</p>
                </button>

                <button 
                  onClick={() => router.push('/admin/rbac')}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <KeyIcon className="h-6 w-6 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">RBAC</h4>
                  <p className="text-sm text-gray-600">Manage roles and permissions</p>
                </button>

                <button 
                  onClick={() => router.push('/admin/monitoring')}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <ChartBarIcon className="h-6 w-6 text-orange-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Monitoring</h4>
                  <p className="text-sm text-gray-600">View system metrics</p>
                </button>

                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                  <BellIcon className="h-6 w-6 text-red-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Alerts</h4>
                  <p className="text-sm text-gray-600">Configure alert settings</p>
                </button>

                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                  <DocumentTextIcon className="h-6 w-6 text-indigo-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Audit Logs</h4>
                  <p className="text-sm text-gray-600">Review system audit logs</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}