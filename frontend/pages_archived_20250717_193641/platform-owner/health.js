import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Activity, Server, Database, Cpu, HardDrive, Network, AlertTriangle, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function SystemHealth() {
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const systemStatus = {
    overall: 'healthy',
    uptime: '99.97%',
    lastIncident: '2024-01-15T08:30:00Z',
    services: [
      {
        name: 'API Gateway',
        status: 'healthy',
        uptime: '99.99%',
        responseTime: 45,
        lastCheck: new Date().toISOString(),
        details: 'All endpoints responding normally'
      },
      {
        name: 'Database Cluster',
        status: 'healthy',
        uptime: '99.95%',
        responseTime: 12,
        lastCheck: new Date().toISOString(),
        details: 'Primary and replica nodes operational'
      },
      {
        name: 'Authentication Service',
        status: 'healthy',
        uptime: '99.98%',
        responseTime: 23,
        lastCheck: new Date().toISOString(),
        details: 'JWT validation and user sessions active'
      },
      {
        name: 'File Storage',
        status: 'degraded',
        uptime: '99.87%',
        responseTime: 156,
        lastCheck: new Date().toISOString(),
        details: 'Slower response times due to high load'
      },
      {
        name: 'Background Jobs',
        status: 'warning',
        uptime: '98.45%',
        responseTime: 234,
        lastCheck: new Date().toISOString(),
        details: 'Queue backlog detected, processing delayed'
      },
      {
        name: 'CDN Network',
        status: 'healthy',
        uptime: '99.99%',
        responseTime: 8,
        lastCheck: new Date().toISOString(),
        details: 'Global edge locations operational'
      }
    ],
    infrastructure: {
      cpu: {
        usage: 67,
        cores: 32,
        load: 2.4,
        status: 'normal'
      },
      memory: {
        usage: 78,
        total: '128 GB',
        available: '28 GB',
        status: 'normal'
      },
      storage: {
        usage: 45,
        total: '2 TB',
        available: '1.1 TB',
        status: 'normal'
      },
      network: {
        inbound: '2.3 Gbps',
        outbound: '1.8 Gbps',
        latency: 12,
        status: 'normal'
      }
    },
    metrics: {
      requestsPerSecond: 1247,
      activeUsers: 3456,
      errorRate: 0.02,
      averageResponseTime: 89
    },
    alerts: [
      {
        id: 1,
        severity: 'warning',
        title: 'High Background Job Queue',
        description: 'Background job queue has 1,247 pending items',
        timestamp: '2024-01-30T14:30:00Z',
        service: 'Background Jobs',
        acknowledged: false
      },
      {
        id: 2,
        severity: 'info',
        title: 'Storage Usage Increasing',
        description: 'Storage usage has increased by 15% in the last 7 days',
        timestamp: '2024-01-30T12:15:00Z',
        service: 'File Storage',
        acknowledged: true
      },
      {
        id: 3,
        severity: 'warning',
        title: 'Slow File Storage Response',
        description: 'File storage response times above normal threshold',
        timestamp: '2024-01-30T11:45:00Z',
        service: 'File Storage',
        acknowledged: false
      }
    ],
    incidents: [
      {
        id: 1,
        title: 'Database Connection Pool Exhaustion',
        status: 'resolved',
        severity: 'major',
        startTime: '2024-01-15T08:30:00Z',
        endTime: '2024-01-15T09:15:00Z',
        duration: '45 minutes',
        affectedServices: ['API Gateway', 'Database Cluster'],
        description: 'Database connection pool reached maximum capacity causing API timeouts'
      },
      {
        id: 2,
        title: 'CDN Edge Server Maintenance',
        status: 'resolved',
        severity: 'minor',
        startTime: '2024-01-10T02:00:00Z',
        endTime: '2024-01-10T04:00:00Z',
        duration: '2 hours',
        affectedServices: ['CDN Network'],
        description: 'Scheduled maintenance on European edge servers'
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'major': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUsageColor = (usage) => {
    if (usage >= 90) return 'bg-red-500';
    if (usage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <>
      <Head>
        <title>System Health - Platform Owner - Digame</title>
        <meta name="description" content="Real-time system health monitoring and alerts" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="System Health"
          subtitle="Real-time system health monitoring and alerts"
          icon={<Activity className="w-6 h-6 text-green-600" />}
          badge="PLATFORM OWNER"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Auto-refresh Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Auto-refresh:</span>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Overall Status */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Overall System Status</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemStatus.overall)}`}>
                {getStatusIcon(systemStatus.overall)}
                <span className="ml-2 capitalize">{systemStatus.overall}</span>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemStatus.uptime}</div>
                <div className="text-sm text-gray-600">Uptime (30 days)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemStatus.metrics.requestsPerSecond}</div>
                <div className="text-sm text-gray-600">Requests/sec</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemStatus.metrics.activeUsers.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
            </div>
          </div>

          {/* Infrastructure Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">CPU Usage</span>
                </div>
                <span className="text-sm text-gray-600">{systemStatus.infrastructure.cpu.cores} cores</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usage</span>
                  <span>{systemStatus.infrastructure.cpu.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(systemStatus.infrastructure.cpu.usage)}`}
                    style={{ width: `${systemStatus.infrastructure.cpu.usage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">Load: {systemStatus.infrastructure.cpu.load}</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Memory</span>
                </div>
                <span className="text-sm text-gray-600">{systemStatus.infrastructure.memory.total}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usage</span>
                  <span>{systemStatus.infrastructure.memory.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(systemStatus.infrastructure.memory.usage)}`}
                    style={{ width: `${systemStatus.infrastructure.memory.usage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">Available: {systemStatus.infrastructure.memory.available}</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Storage</span>
                </div>
                <span className="text-sm text-gray-600">{systemStatus.infrastructure.storage.total}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usage</span>
                  <span>{systemStatus.infrastructure.storage.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(systemStatus.infrastructure.storage.usage)}`}
                    style={{ width: `${systemStatus.infrastructure.storage.usage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">Available: {systemStatus.infrastructure.storage.available}</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Network className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-900">Network</span>
                </div>
                <span className="text-sm text-gray-600">{systemStatus.infrastructure.network.latency}ms</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Inbound</span>
                  <span>{systemStatus.infrastructure.network.inbound}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Outbound</span>
                  <span>{systemStatus.infrastructure.network.outbound}</span>
                </div>
                <div className="text-xs text-gray-500">Latency: {systemStatus.infrastructure.network.latency}ms</div>
              </div>
            </div>
          </div>

          {/* Service Status */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemStatus.services.map((service, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Server className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)}
                      <span className="ml-1 capitalize">{service.status}</span>
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-medium">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-medium">{service.responseTime}ms</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{service.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Alerts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Alerts</h3>
              <div className="space-y-4">
                {systemStatus.alerts.filter(alert => !alert.acknowledged).map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="font-medium text-gray-900">{alert.title}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Acknowledge
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Service: {alert.service}</span>
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {systemStatus.alerts.filter(alert => !alert.acknowledged).length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-500">No active alerts</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Incidents */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Incidents</h3>
              <div className="space-y-4">
                {systemStatus.incidents.map((incident) => (
                  <div key={incident.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-900">{incident.title}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div>Duration: {incident.duration}</div>
                      <div>Affected: {incident.affectedServices.join(', ')}</div>
                      <div>Resolved: {new Date(incident.endTime).toLocaleString()}</div>
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