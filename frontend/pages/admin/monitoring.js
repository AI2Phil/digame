import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  ChartBarIcon, 
  ServerIcon, 
  DatabaseIcon, 
  CpuChipIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  Cog6ToothIcon,
  BellIcon,
  DocumentTextIcon,
  CloudIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function AdminMonitoring() {
  const router = useRouter();
  const [metrics, setMetrics] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchMonitoringData = async () => {
    try {
      // Simulate API calls
      const [metricsRes, alertsRes, servicesRes] = await Promise.all([
        fetch(`/api/admin/monitoring/metrics?timeRange=${timeRange}`),
        fetch('/api/admin/monitoring/alerts'),
        fetch('/api/admin/monitoring/services')
      ]);
      
      const metricsData = await metricsRes.json();
      const alertsData = await alertsRes.json();
      const servicesData = await servicesRes.json();
      
      setMetrics(metricsData.data || {});
      setAlerts(alertsData.data || []);
      setServices(servicesData.data || []);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceIcon = (type) => {
    const iconClass = "h-6 w-6";
    switch (type) {
      case 'web':
        return <GlobeAltIcon className={`${iconClass} text-blue-600`} />;
      case 'database':
        return <DatabaseIcon className={`${iconClass} text-green-600`} />;
      case 'cache':
        return <ServerIcon className={`${iconClass} text-purple-600`} />;
      case 'queue':
        return <ClockIcon className={`${iconClass} text-orange-600`} />;
      case 'storage':
        return <CloudIcon className={`${iconClass} text-indigo-600`} />;
      default:
        return <ServerIcon className={`${iconClass} text-gray-600`} />;
    }
  };

  const getMetricColor = (value, thresholds) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
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
                <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
                  <p className="text-sm text-gray-600">Real-time system performance and health monitoring</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="5m">Last 5 minutes</option>
                  <option value="1h">Last hour</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                </select>
                <button 
                  onClick={fetchMonitoringData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
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
                <CpuChipIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                <p className={`text-2xl font-bold ${getMetricColor(metrics.cpuUsage || 0, { warning: 70, critical: 90 })}`}>
                  {metrics.cpuUsage || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ServerIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                <p className={`text-2xl font-bold ${getMetricColor(metrics.memoryUsage || 0, { warning: 80, critical: 95 })}`}>
                  {metrics.memoryUsage || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DatabaseIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disk Usage</p>
                <p className={`text-2xl font-bold ${getMetricColor(metrics.diskUsage || 0, { warning: 80, critical: 95 })}`}>
                  {metrics.diskUsage || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monitoring Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                { id: 'services', name: 'Services', icon: ServerIcon },
                { id: 'performance', name: 'Performance', icon: CpuChipIcon },
                { id: 'alerts', name: 'Alerts', icon: BellIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Resource Utilization</h4>
                      <div className="space-y-4">
                        {[
                          { name: 'CPU', value: metrics.cpuUsage || 0, max: 100, color: 'bg-blue-500' },
                          { name: 'Memory', value: metrics.memoryUsage || 0, max: 100, color: 'bg-green-500' },
                          { name: 'Disk', value: metrics.diskUsage || 0, max: 100, color: 'bg-purple-500' },
                          { name: 'Network', value: metrics.networkUsage || 0, max: 100, color: 'bg-orange-500' }
                        ].map((resource, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 w-16">{resource.name}</span>
                            <div className="flex-1 mx-4">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${resource.color}`}
                                  style={{ width: `${resource.value}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-12">{resource.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Request Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Requests/sec:</span>
                          <span className="text-sm font-medium text-gray-900">{metrics.requestsPerSecond || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Avg Response Time:</span>
                          <span className="text-sm font-medium text-gray-900">{metrics.avgResponseTime || 0}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Error Rate:</span>
                          <span className="text-sm font-medium text-gray-900">{metrics.errorRate || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Uptime:</span>
                          <span className="text-sm font-medium text-gray-900">{metrics.uptime || '99.9%'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Recent Events</h4>
                  <div className="space-y-3">
                    {[
                      { event: 'System backup completed', time: '5 minutes ago', type: 'info' },
                      { event: 'High memory usage detected', time: '15 minutes ago', type: 'warning' },
                      { event: 'Database connection restored', time: '1 hour ago', type: 'success' },
                      { event: 'Scheduled maintenance completed', time: '2 hours ago', type: 'info' }
                    ].map((event, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            event.type === 'success' ? 'bg-green-500' :
                            event.type === 'warning' ? 'bg-yellow-500' :
                            event.type === 'error' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}></div>
                          <span className="text-sm text-gray-900">{event.event}</span>
                        </div>
                        <span className="text-xs text-gray-500">{event.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Service Health</h3>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Restart All Services
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="bg-gray-50 rounded-lg p-6 border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          {getServiceIcon(service.type)}
                          <div className="ml-3">
                            <h4 className="text-lg font-medium text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(service.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                            {service.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Uptime:</span>
                          <span className="font-medium">{service.uptime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Response Time:</span>
                          <span className="font-medium">{service.responseTime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Check:</span>
                          <span className="font-medium">{service.lastCheck}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Version: {service.version}
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Restart
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                            Logs
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Response Time Trends</h4>
                      <div className="space-y-3">
                        {[
                          { endpoint: '/api/users', time: '145ms', trend: 'up' },
                          { endpoint: '/api/projects', time: '89ms', trend: 'down' },
                          { endpoint: '/api/tasks', time: '234ms', trend: 'up' },
                          { endpoint: '/api/auth', time: '67ms', trend: 'stable' }
                        ].map((endpoint, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                            <code className="text-sm font-mono">{endpoint.endpoint}</code>
                            <div className="flex items-center">
                              <span className="text-sm font-medium mr-2">{endpoint.time}</span>
                              <div className={`w-2 h-2 rounded-full ${
                                endpoint.trend === 'up' ? 'bg-red-500' :
                                endpoint.trend === 'down' ? 'bg-green-500' :
                                'bg-gray-500'
                              }`}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Database Performance</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between bg-white rounded-lg p-3">
                          <span className="text-sm text-gray-600">Active Connections:</span>
                          <span className="text-sm font-medium">{metrics.dbConnections || 45}</span>
                        </div>
                        <div className="flex justify-between bg-white rounded-lg p-3">
                          <span className="text-sm text-gray-600">Query Time (avg):</span>
                          <span className="text-sm font-medium">{metrics.avgQueryTime || '12ms'}</span>
                        </div>
                        <div className="flex justify-between bg-white rounded-lg p-3">
                          <span className="text-sm text-gray-600">Slow Queries:</span>
                          <span className="text-sm font-medium">{metrics.slowQueries || 3}</span>
                        </div>
                        <div className="flex justify-between bg-white rounded-lg p-3">
                          <span className="text-sm text-gray-600">Cache Hit Rate:</span>
                          <span className="text-sm font-medium">{metrics.cacheHitRate || '94.2%'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Traffic Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{metrics.totalRequests || '1.2M'}</p>
                      <p className="text-sm text-gray-600">Total Requests</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{metrics.successfulRequests || '1.18M'}</p>
                      <p className="text-sm text-gray-600">Successful</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-red-600">{metrics.failedRequests || '24K'}</p>
                      <p className="text-sm text-gray-600">Failed</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">{metrics.uniqueVisitors || '45K'}</p>
                      <p className="text-sm text-gray-600">Unique Visitors</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Severities</option>
                      <option value="critical">Critical</option>
                      <option value="warning">Warning</option>
                      <option value="info">Info</option>
                    </select>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                      Configure Alerts
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <div key={alert.id} className={`rounded-lg p-4 border-l-4 ${
                        alert.severity === 'critical' ? 'bg-red-50 border-red-400' :
                        alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                        'bg-blue-50 border-blue-400'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              {getStatusIcon(alert.severity)}
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                              <div className="flex items-center mt-2 space-x-4">
                                <span className="text-xs text-gray-500">Service: {alert.service}</span>
                                <span className="text-xs text-gray-500">Time: {alert.timestamp}</span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.severity)}`}>
                                  {alert.severity}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Acknowledge
                            </button>
                            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No active alerts</h3>
                      <p className="mt-1 text-sm text-gray-500">All systems are operating normally.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}