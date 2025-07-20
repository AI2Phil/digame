import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Settings, Database, Shield, Monitor, Server, FileText, History, Zap, ArrowLeft, AlertCircle } from 'lucide-react';

export default function SystemConfiguration() {
  const [configData, setConfigData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConfigData();
  }, []);

  const fetchConfigData = async () => {
    try {
      const response = await fetch('/api/admin/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setConfigData(result.data);
      } else {
        setConfigData(getMockData());
      }
    } catch (error) {
      console.error('Error fetching config data:', error);
      setConfigData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => ({
    systemHealth: {
      status: 'healthy',
      uptime: '99.9%',
      lastBackup: '2 hours ago',
      activeConfigs: 24
    },
    recentChanges: [
      {
        category: 'Security',
        change: 'Updated authentication timeout settings',
        user: 'admin@company.com',
        timestamp: '2024-01-05T10:30:00Z'
      },
      {
        category: 'Database',
        change: 'Optimized connection pool settings',
        user: 'admin@company.com',
        timestamp: '2024-01-05T09:15:00Z'
      },
      {
        category: 'API',
        change: 'Updated rate limiting configuration',
        user: 'admin@company.com',
        timestamp: '2024-01-05T08:45:00Z'
      }
    ]
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const configSections = [
    {
      title: 'Configuration Categories',
      description: 'Organize and manage configuration settings by category',
      icon: <Settings className="w-6 h-6" />,
      path: '/admin/config/categories',
      color: 'blue',
      status: 'active'
    },
    {
      title: 'Configuration Backups',
      description: 'Backup and restore system configuration settings',
      icon: <Database className="w-6 h-6" />,
      path: '/admin/config/backups',
      color: 'green',
      status: 'active'
    },
    {
      title: 'Configuration Monitoring',
      description: 'Monitor configuration changes and system health',
      icon: <Monitor className="w-6 h-6" />,
      path: '/admin/config/monitoring',
      color: 'purple',
      status: 'active'
    },
    {
      title: 'Environment Management',
      description: 'Manage different environment configurations',
      icon: <Server className="w-6 h-6" />,
      path: '/admin/config/environments',
      color: 'orange',
      status: 'active'
    },
    {
      title: 'Configuration Templates',
      description: 'Create and manage configuration templates',
      icon: <FileText className="w-6 h-6" />,
      path: '/admin/config/templates',
      color: 'indigo',
      status: 'active'
    },
    {
      title: 'Audit Trail',
      description: 'Track all configuration changes and access logs',
      icon: <History className="w-6 h-6" />,
      path: '/admin/config/audit',
      color: 'red',
      status: 'active'
    },
    {
      title: 'Configuration API',
      description: 'Programmatic access to configuration management',
      icon: <Zap className="w-6 h-6" />,
      path: '/admin/config/api',
      color: 'yellow',
      status: 'active'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      green: 'bg-green-100 text-green-600 hover:bg-green-200',
      purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
      red: 'bg-red-100 text-red-600 hover:bg-red-200',
      indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
      yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
    };
    return colors[color] || colors.blue;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <Head>
        <title>System Configuration - Admin - Digame</title>
        <meta name="description" content="Advanced system configuration and management dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Return to Admin Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Return to Admin Dashboard</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
                <p className="text-gray-600">Advanced configuration management and system settings</p>
              </div>
              <div className="ml-auto">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(configData?.systemHealth?.status || 'healthy')}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  SYSTEM {(configData?.systemHealth?.status || 'healthy').toUpperCase()}
                </span>
              </div>
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
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-600">
                  <Monitor className="w-4 h-4 mr-1" />
                  All systems operational
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{configData?.systemHealth?.uptime || '99.9%'}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Server className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-blue-600">
                  <Zap className="w-4 h-4 mr-1" />
                  Last 30 days
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Backup</p>
                  <p className="text-2xl font-bold text-gray-900">{configData?.systemHealth?.lastBackup || '2h ago'}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-purple-600">
                  <History className="w-4 h-4 mr-1" />
                  Auto-backup enabled
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Configs</p>
                  <p className="text-2xl font-bold text-gray-900">{configData?.systemHealth?.activeConfigs || 24}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Settings className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-orange-600">
                  <FileText className="w-4 h-4 mr-1" />
                  Configurations loaded
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {configSections.map((section, index) => (
              <Link key={index} href={section.path}>
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${getColorClasses(section.color)}`}>
                    {section.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(section.status)}`}>
                      {section.status}
                    </span>
                    <span className="text-xs text-gray-500">Configure →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Configuration Changes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Configuration Changes</h3>
            <div className="space-y-3">
              {configData?.recentChanges?.length > 0 ? (
                configData.recentChanges.map((change, index) => {
                  const formatTimeAgo = (timestamp) => {
                    const now = new Date();
                    const changeTime = new Date(timestamp);
                    const diffMs = now.getTime() - changeTime.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    
                    if (diffMins < 60) return `${diffMins} min ago`;
                    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                    return changeTime.toLocaleDateString();
                  };

                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Settings className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{change.category} Configuration</div>
                        <div className="text-sm text-gray-600">{change.change}</div>
                        <div className="text-xs text-gray-500">by {change.user}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimeAgo(change.timestamp)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>No recent configuration changes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}