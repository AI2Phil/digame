import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Monitor, Activity, AlertTriangle, CheckCircle, TrendingUp, Clock, Server, Zap } from 'lucide-react';

export default function ConfigurationMonitoring() {
  const [monitoringData, setMonitoringData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const response = await fetch('/api/admin/config/monitoring', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setMonitoringData(result.data);
      } else {
        setMonitoringData(getMockData());
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      setMonitoringData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => ({
    systemHealth: {
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '120ms',
      errorRate: '0.1%'
    },
    alerts: [
      {
        id: 1,
        type: 'warning',
        title: 'High Memory Usage',
        description: 'System memory usage is above 85%',
        timestamp: '2024-01-05T10:30:00Z',
        resolved: false
      },
      {
        id: 2,
        type: 'info',
        title: 'Configuration Updated',
        description: 'Database connection pool settings were modified',
        timestamp: '2024-01-05T09:15:00Z',
        resolved: true
      }
    ],
    metrics: [
      { name: 'CPU Usage', value: 45, unit: '%', status: 'normal' },
      { name: 'Memory Usage', value: 78, unit: '%', status: 'warning' },
      { name: 'Disk Usage', value: 32, unit: '%', status: 'normal' },
      { name: 'Network I/O', value: 156, unit: 'MB/s', status: 'normal' }
    ],
    recentActivity: [
      {
        event: 'Config Change',
        description: 'Authentication timeout updated',
        timestamp: '2024-01-05T10:30:00Z',
        user: 'admin@company.com'
      },
      {
        event: 'System Alert',
        description: 'Memory usage threshold exceeded',
        timestamp: '2024-01-05T10:25:00Z',
        user: 'system'
      },
      {
        event: 'Backup Created',
        description: 'Automated daily backup completed',
        timestamp: '2024-01-05T02:00:00Z',
        user: 'system'
      }
    ]
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'normal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Configuration Monitoring - Admin - Digame</title>
        <meta name="description" content="Monitor configuration changes and system health" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link href="/admin/config" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to System Configuration</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuration Monitoring</h1>
              <p className="text-gray-600">Monitor configuration changes and system health</p>
            </div>
          </div>

          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Healthy</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{monitoringData?.systemHealth?.uptime}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{monitoringData?.systemHealth?.responseTime}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{monitoringData?.systemHealth?.errorRate}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {monitoringData?.metrics?.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="mb-2">
                    <div className={`text-2xl font-bold ${
                      metric.status === 'normal' ? 'text-green-600' :
                      metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {metric.value}{metric.unit}
                    </div>
                    <div className="text-sm text-gray-600">{metric.name}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Alerts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
              <div className="space-y-3">
                {monitoringData?.alerts?.filter(alert => !alert.resolved).map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{alert.title}</div>
                      <div className="text-sm text-gray-600">{alert.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(alert.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                {monitoringData?.alerts?.filter(alert => !alert.resolved).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>No active alerts</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {monitoringData?.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{activity.event}</div>
                      <div className="text-sm text-gray-600">{activity.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(activity.timestamp)} • by {activity.user}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}