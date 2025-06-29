import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Activity, TrendingUp, TrendingDown, Zap,
  Database, Server, Clock, AlertTriangle,
  CheckCircle, XCircle, BarChart3, LineChart,
  Cpu, HardDrive, Wifi, Globe, Monitor,
  RefreshCw, Download, Settings, Filter,
  Play, Pause, RotateCcw, Eye, Calendar, Plus
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
  threshold_warning: number;
  threshold_critical: number;
  last_updated: string;
  historical_data: Array<{
    timestamp: string;
    value: number;
  }>;
}

interface SystemHealth {
  overall_status: 'healthy' | 'degraded' | 'critical';
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_latency: number;
  active_connections: number;
  uptime: number;
  last_restart: string;
  services: Array<{
    name: string;
    status: 'running' | 'stopped' | 'error';
    cpu_usage: number;
    memory_usage: number;
    response_time: number;
  }>;
}

interface CacheMetrics {
  hit_rate: number;
  miss_rate: number;
  eviction_rate: number;
  memory_usage: number;
  total_keys: number;
  expired_keys: number;
  operations_per_second: number;
  average_ttl: number;
  cache_types: Array<{
    type: string;
    hit_rate: number;
    size: number;
    operations: number;
  }>;
}

interface DatabaseMetrics {
  query_performance: {
    average_response_time: number;
    slow_queries_count: number;
    queries_per_second: number;
    active_connections: number;
    connection_pool_usage: number;
  };
  storage: {
    total_size: number;
    used_size: number;
    index_size: number;
    fragmentation_percentage: number;
  };
  replication: {
    lag: number;
    status: 'healthy' | 'warning' | 'error';
    replicas_count: number;
  };
  slow_queries: Array<{
    query: string;
    execution_time: number;
    frequency: number;
    last_executed: string;
    optimization_suggestion: string;
  }>;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notification_channels: string[];
  created_at: string;
  triggered_count: number;
  last_triggered: string;
}

export const PerformanceMonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null);
  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics | null>(null);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'system' | 'cache' | 'database' | 'alerts'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchPerformanceData, refreshInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      const [metricsRes, healthRes, cacheRes, dbRes, alertsRes] = await Promise.all([
        fetch(`/api/performance/metrics?timeRange=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/performance/system-health', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/performance/cache-metrics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/performance/database-metrics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/performance/alert-rules', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.metrics || []);
      }

      if (healthRes.ok) {
        const data = await healthRes.json();
        setSystemHealth(data);
      }

      if (cacheRes.ok) {
        const data = await cacheRes.json();
        setCacheMetrics(data);
      }

      if (dbRes.ok) {
        const data = await dbRes.json();
        setDatabaseMetrics(data);
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlertRules(data.rules || []);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleAlertToggle = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/performance/alert-rules/${ruleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        await fetchPerformanceData();
      }
    } catch (err) {
      console.error('Failed to toggle alert rule:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'healthy':
      case 'running': return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'error':
      case 'stopped': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
      case 'healthy':
      case 'running': return CheckCircle;
      case 'warning':
      case 'degraded': return AlertTriangle;
      case 'critical':
      case 'error':
      case 'stopped': return XCircle;
      default: return Clock;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.slice(0, 4).map((metric) => {
          const StatusIcon = getStatusIcon(metric.status);
          const TrendIcon = getTrendIcon(metric.trend);
          
          return (
            <Card key={metric.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                  <StatusIcon className={`h-4 w-4 ${getStatusColor(metric.status).split(' ')[0]}`} />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value.toLocaleString()}{metric.unit}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`} />
                      <span className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                        {Math.abs(metric.change_percentage)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle>System Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 relative">
                  <div className="w-full h-full rounded-full bg-gray-200">
                    <div 
                      className={`w-full h-full rounded-full ${systemHealth.cpu_usage > 80 ? 'bg-red-500' : systemHealth.cpu_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ 
                        background: `conic-gradient(${systemHealth.cpu_usage > 80 ? '#ef4444' : systemHealth.cpu_usage > 60 ? '#eab308' : '#22c55e'} ${systemHealth.cpu_usage * 3.6}deg, #e5e7eb 0deg)`
                      }}
                    />
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <Cpu className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">CPU Usage</p>
                <p className="text-lg font-bold text-gray-900">{systemHealth.cpu_usage}%</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 relative">
                  <div className="w-full h-full rounded-full bg-gray-200">
                    <div 
                      className={`w-full h-full rounded-full ${systemHealth.memory_usage > 80 ? 'bg-red-500' : systemHealth.memory_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ 
                        background: `conic-gradient(${systemHealth.memory_usage > 80 ? '#ef4444' : systemHealth.memory_usage > 60 ? '#eab308' : '#22c55e'} ${systemHealth.memory_usage * 3.6}deg, #e5e7eb 0deg)`
                      }}
                    />
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <Monitor className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">Memory Usage</p>
                <p className="text-lg font-bold text-gray-900">{systemHealth.memory_usage}%</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 relative">
                  <div className="w-full h-full rounded-full bg-gray-200">
                    <div 
                      className={`w-full h-full rounded-full ${systemHealth.disk_usage > 80 ? 'bg-red-500' : systemHealth.disk_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ 
                        background: `conic-gradient(${systemHealth.disk_usage > 80 ? '#ef4444' : systemHealth.disk_usage > 60 ? '#eab308' : '#22c55e'} ${systemHealth.disk_usage * 3.6}deg, #e5e7eb 0deg)`
                      }}
                    />
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <HardDrive className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">Disk Usage</p>
                <p className="text-lg font-bold text-gray-900">{systemHealth.disk_usage}%</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wifi className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Network Latency</p>
                <p className="text-lg font-bold text-gray-900">{systemHealth.network_latency}ms</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Uptime:</span>
                  <span className="ml-2 font-medium">{formatDuration(systemHealth.uptime)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Active Connections:</span>
                  <span className="ml-2 font-medium">{systemHealth.active_connections.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Last Restart:</span>
                  <span className="ml-2 font-medium">{new Date(systemHealth.last_restart).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertRules.filter(rule => rule.triggered_count > 0).slice(0, 5).map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${rule.severity === 'critical' ? 'bg-red-500' : rule.severity === 'high' ? 'bg-orange-500' : rule.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                  <div>
                    <h4 className="font-medium text-gray-900">{rule.name}</h4>
                    <p className="text-sm text-gray-600">
                      Triggered {rule.triggered_count} times • Last: {new Date(rule.last_triggered).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={rule.severity === 'critical' ? 'error' : rule.severity === 'high' ? 'warning' : 'info'} 
                  size="sm"
                  icon={null}
                  onRemove={() => {}}
                >
                  {rule.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      {systemHealth && (
        <>
          {/* Services Status */}
          <Card>
            <CardHeader>
              <CardTitle>Services Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemHealth.services.map((service, index) => {
                  const StatusIcon = getStatusIcon(service.status);
                  
                  return (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <Badge 
                            variant={service.status === 'running' ? 'success' : service.status === 'error' ? 'error' : 'warning'} 
                            size="sm"
                            icon={null}
                            onRemove={() => {}}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {service.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">CPU:</span>
                            <span className="font-medium">{service.cpu_usage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Memory:</span>
                            <span className="font-medium">{service.memory_usage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Response Time:</span>
                            <span className="font-medium">{service.response_time}ms</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Resource Usage Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Resource usage chart would be rendered here</p>
                  <p className="text-sm text-gray-500">Integration with Chart.js or similar charting library</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderCacheTab = () => (
    <div className="space-y-6">
      {cacheMetrics && (
        <>
          {/* Cache Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hit Rate</p>
                    <p className="text-2xl font-bold text-green-600">{cacheMetrics.hit_rate}%</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Operations/sec</p>
                    <p className="text-2xl font-bold text-blue-600">{cacheMetrics.operations_per_second.toLocaleString()}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                    <p className="text-2xl font-bold text-orange-600">{formatBytes(cacheMetrics.memory_usage)}</p>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <HardDrive className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Keys</p>
                    <p className="text-2xl font-bold text-purple-600">{cacheMetrics.total_keys.toLocaleString()}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Database className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cache Types Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Types Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cacheMetrics.cache_types.map((cache, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{cache.type}</h4>
                      <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                        {cache.hit_rate}% hit rate
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <span className="ml-2 font-medium">{formatBytes(cache.size)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Operations:</span>
                        <span className="ml-2 font-medium">{cache.operations.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Hit Rate:</span>
                        <span className="ml-2 font-medium">{cache.hit_rate}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${cache.hit_rate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderDatabaseTab = () => (
    <div className="space-y-6">
      {databaseMetrics && (
        <>
          {/* Database Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-blue-600">{databaseMetrics.query_performance.average_response_time}ms</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Queries/sec</p>
                    <p className="text-2xl font-bold text-green-600">{databaseMetrics.query_performance.queries_per_second}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Slow Queries</p>
                    <p className="text-2xl font-bold text-red-600">{databaseMetrics.query_performance.slow_queries_count}</p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Storage Used</p>
                    <p className="text-2xl font-bold text-purple-600">{formatBytes(databaseMetrics.storage.used_size)}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <HardDrive className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Slow Queries */}
          <Card>
            <CardHeader>
              <CardTitle>Slow Queries Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {databaseMetrics.slow_queries.map((query, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <code className="text-sm bg-gray-100 p-2 rounded block mb-2 overflow-x-auto">
                          {query.query}
                        </code>
                        <p className="text-sm text-blue-600 mb-2">
                          <strong>Optimization Suggestion:</strong> {query.optimization_suggestion}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Execution Time:</span>
                        <span className="ml-2 font-medium text-red-600">{query.execution_time}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Frequency:</span>
                        <span className="ml-2 font-medium">{query.frequency} times</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Executed:</span>
                        <span className="ml-2 font-medium">{new Date(query.last_executed).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Storage and Replication */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Storage Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Total Size:</span>
                    <span className="font-medium">{formatBytes(databaseMetrics.storage.total_size)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(databaseMetrics.storage.used_size / databaseMetrics.storage.total_size) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Used:</span>
                    <span className="ml-2 font-medium">{formatBytes(databaseMetrics.storage.used_size)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Index Size:</span>
                    <span className="ml-2 font-medium">{formatBytes(databaseMetrics.storage.index_size)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fragmentation:</span>
                    <span className="ml-2 font-medium">{databaseMetrics.storage.fragmentation_percentage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Replication Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge
                    variant={databaseMetrics.replication.status === 'healthy' ? 'success' : databaseMetrics.replication.status === 'warning' ? 'warning' : 'error'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {databaseMetrics.replication.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Lag:</span>
                    <span className="ml-2 font-medium">{databaseMetrics.replication.lag}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Replicas:</span>
                    <span className="ml-2 font-medium">{databaseMetrics.replication.replicas_count}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  const renderAlertsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Alert Rules</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Alert Rule
        </Button>
      </div>

      <div className="space-y-4">
        {alertRules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{rule.name}</h4>
                    <Badge
                      variant={rule.severity === 'critical' ? 'error' : rule.severity === 'high' ? 'warning' : 'info'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {rule.severity}
                    </Badge>
                    <Badge
                      variant={rule.enabled ? 'success' : 'outline'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    Alert when <strong>{rule.metric}</strong> is <strong>{rule.condition.replace('_', ' ')}</strong> <strong>{rule.threshold}</strong>
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Triggered:</span>
                      <span className="ml-2 font-medium">{rule.triggered_count} times</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Triggered:</span>
                      <span className="ml-2 font-medium">
                        {rule.last_triggered ? new Date(rule.last_triggered).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 font-medium">{new Date(rule.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Channels:</span>
                      <span className="ml-2 font-medium">{rule.notification_channels.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant={rule.enabled ? 'outline' : 'primary'}
                    onClick={() => handleAlertToggle(rule.id, !rule.enabled)}
                  >
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Performance Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchPerformanceData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Performance Monitoring</h1>
              <p className="text-gray-600">Monitor system performance, cache metrics, and database health</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={autoRefresh ? 'primary' : 'outline'}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  {autoRefresh ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                  Auto Refresh
                </Button>
                
                <Button size="sm" variant="outline" onClick={fetchPerformanceData}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'system', label: 'System Health', icon: Server },
                { id: 'cache', label: 'Cache Performance', icon: Zap },
                { id: 'database', label: 'Database Metrics', icon: Database },
                { id: 'alerts', label: 'Alert Rules', icon: AlertTriangle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'system' && renderSystemTab()}
          {activeTab === 'cache' && renderCacheTab()}
          {activeTab === 'database' && renderDatabaseTab()}
          {activeTab === 'alerts' && renderAlertsTab()}
        </div>
      </div>
    </div>
  );
};