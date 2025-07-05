import React, { useState } from 'react';
import {
  Monitor, Clock, Database, Zap,
  TrendingUp, AlertTriangle, CheckCircle,
  Activity, BarChart3, Cpu, HardDrive,
  Wifi, Server, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Chart } from '../ui/Chart'; // Import the Chart component
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import {
  usePlatformPerformanceMetrics,
  useSystemResourceMetrics,
  useDatabasePerformanceMetrics,
  useNetworkMetrics,
  usePerformanceAlerts
} from '../../hooks/useAnalytics';

const PerformanceMonitoringSection = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState('response-time');

  // Backend data hooks
  const { data: performanceMetricsData, isLoading: performanceLoading, refetch: refetchPerformance } = usePlatformPerformanceMetrics();
  const { data: systemResourcesData, isLoading: systemLoading } = useSystemResourceMetrics();
  const { data: databaseMetricsData, isLoading: databaseLoading } = useDatabasePerformanceMetrics();
  const { data: networkMetricsData, isLoading: networkLoading } = useNetworkMetrics();
  const { data: alertsData, isLoading: alertsLoading } = usePerformanceAlerts();

  const loading = performanceLoading || systemLoading || databaseLoading || networkLoading;

  // Transform backend data to component format
  const performanceData = {
    responseTime: {
      current: performanceMetricsData?.avg_response_time || data?.avgResponseTime || 120,
      target: 200,
      trend: performanceMetricsData?.response_time_trend || -15,
      history: performanceMetricsData?.response_time_history || [145, 132, 128, 120, 115, 120, 118]
    },
    throughput: {
      current: performanceMetricsData?.throughput_rps || data?.requestsPerSecond || 156,
      target: 200,
      trend: performanceMetricsData?.throughput_trend || 23,
      history: performanceMetricsData?.throughput_history || [120, 135, 142, 150, 148, 156, 160]
    },
    errorRate: {
      current: performanceMetricsData?.error_rate || data?.errorRate || 0.1,
      target: 1.0,
      trend: performanceMetricsData?.error_rate_trend || -0.05,
      history: performanceMetricsData?.error_rate_history || [0.15, 0.12, 0.08, 0.1, 0.09, 0.1, 0.08]
    },
    uptime: {
      current: performanceMetricsData?.uptime_percentage || data?.uptime || 99.9,
      target: 99.5,
      trend: performanceMetricsData?.uptime_trend || 0.1,
      history: performanceMetricsData?.uptime_history || [99.8, 99.9, 99.9, 99.9, 99.8, 99.9, 99.9]
    }
  };

  const systemResources = {
    cpu: {
      usage: systemResourcesData?.cpu_usage || data?.cpuUsage || 45,
      cores: systemResourcesData?.cpu_cores || 8,
      load: systemResourcesData?.cpu_history || [42, 48, 45, 50, 43, 45, 47]
    },
    memory: {
      usage: systemResourcesData?.memory_usage || data?.memoryUsage || 62,
      total: systemResourcesData?.memory_total || '16 GB',
      available: systemResourcesData?.memory_available || '6.1 GB',
      load: systemResourcesData?.memory_history || [58, 60, 62, 65, 61, 62, 64]
    },
    disk: {
      usage: systemResourcesData?.disk_usage || data?.diskUsage || 34,
      total: systemResourcesData?.disk_total || '500 GB',
      available: systemResourcesData?.disk_available || '330 GB',
      load: systemResourcesData?.disk_history || [32, 33, 34, 35, 33, 34, 36]
    },
    network: {
      usage: systemResourcesData?.network_usage || data?.networkUsage || 28,
      bandwidth: systemResourcesData?.network_bandwidth || '1 Gbps',
      throughput: systemResourcesData?.network_throughput || '280 Mbps',
      load: systemResourcesData?.network_history || [25, 27, 28, 30, 26, 28, 29]
    }
  };

  const databaseMetrics = {
    connections: {
      active: databaseMetricsData?.active_connections || data?.dbConnections || 45,
      max: databaseMetricsData?.max_connections || 100,
      usage: databaseMetricsData?.connection_usage_percentage || 45
    },
    queryTime: {
      avg: databaseMetricsData?.avg_query_time || data?.avgQueryTime || 25,
      slow: databaseMetricsData?.slow_queries_count || data?.slowQueries || 3,
      trend: databaseMetricsData?.query_time_trend || -5
    },
    cacheHitRate: {
      rate: databaseMetricsData?.cache_hit_rate || data?.cacheHitRate || 94.5,
      trend: databaseMetricsData?.cache_hit_rate_trend || 2.1
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchPerformance(),
      // Add other refetch calls as needed
    ]);
  };

  const getStatusColor = (current, target, isLower = false) => {
    const ratio = current / target;
    if (isLower) {
      if (ratio <= 0.5) return 'text-green-600';
      if (ratio <= 0.8) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (ratio >= 0.9) return 'text-green-600';
      if (ratio >= 0.7) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  const getStatusBadge = (current, target, isLower = false) => {
    const ratio = current / target;
    if (isLower) {
      if (ratio <= 0.5) return <Badge variant="success">Excellent</Badge>;
      if (ratio <= 0.8) return <Badge variant="warning">Good</Badge>;
      return <Badge variant="destructive">Poor</Badge>;
    } else {
      if (ratio >= 0.9) return <Badge variant="success">Excellent</Badge>;
      if (ratio >= 0.7) return <Badge variant="warning">Good</Badge>;
      return <Badge variant="destructive">Poor</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Real-Time Performance Monitoring
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="ml-auto">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Monitor system performance, response times, and resource utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PerformanceMetricCard
              title="Response Time"
              value={`${performanceData.responseTime.current}ms`}
              target={`${performanceData.responseTime.target}ms`}
              trend={performanceData.responseTime.trend}
              icon={Clock}
              status={getStatusBadge(performanceData.responseTime.current, performanceData.responseTime.target, true)}
            />
            <PerformanceMetricCard
              title="Throughput"
              value={`${performanceData.throughput.current}/s`}
              target={`${performanceData.throughput.target}/s`}
              trend={performanceData.throughput.trend}
              icon={Zap}
              status={getStatusBadge(performanceData.throughput.current, performanceData.throughput.target)}
            />
            <PerformanceMetricCard
              title="Error Rate"
              value={`${performanceData.errorRate.current}%`}
              target={`<${performanceData.errorRate.target}%`}
              trend={performanceData.errorRate.trend}
              icon={AlertTriangle}
              status={getStatusBadge(performanceData.errorRate.current, performanceData.errorRate.target, true)}
            />
            <PerformanceMetricCard
              title="Uptime"
              value={`${performanceData.uptime.current}%`}
              target={`>${performanceData.uptime.target}%`}
              trend={performanceData.uptime.trend}
              icon={CheckCircle}
              status={getStatusBadge(performanceData.uptime.current, performanceData.uptime.target)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Performance Tabs */}
      <Tabs defaultValue="system-resources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system-resources">System Resources</TabsTrigger>
          <TabsTrigger value="database">Database Performance</TabsTrigger>
          <TabsTrigger value="network">Network Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Performance Alerts</TabsTrigger>
        </TabsList>

        {/* System Resources Tab */}
        <TabsContent value="system-resources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemResourceCard
              title="CPU Usage"
              icon={Cpu}
              usage={systemResources.cpu.usage}
              details={`${systemResources.cpu.cores} cores`}
              history={systemResources.cpu.load}
            />
            <SystemResourceCard
              title="Memory Usage"
              icon={HardDrive}
              usage={systemResources.memory.usage}
              details={`${systemResources.memory.available} of ${systemResources.memory.total} available`}
              history={systemResources.memory.load}
            />
            <SystemResourceCard
              title="Disk Usage"
              icon={Database}
              usage={systemResources.disk.usage}
              details={`${systemResources.disk.available} of ${systemResources.disk.total} available`}
              history={systemResources.disk.load}
            />
            <SystemResourceCard
              title="Network Usage"
              icon={Wifi}
              usage={systemResources.network.usage}
              details={`${systemResources.network.throughput} of ${systemResources.network.bandwidth}`}
              history={systemResources.network.load}
            />
          </div>
        </TabsContent>

        {/* Database Performance Tab */}
        <TabsContent value="database" className="space-y-6">
          <DatabasePerformanceSection metrics={databaseMetrics} />
        </TabsContent>

        {/* Network Metrics Tab */}
        <TabsContent value="network" className="space-y-6">
          <NetworkMetricsSection data={data} networkMetricsData={networkMetricsData} />
        </TabsContent>

        {/* Performance Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <PerformanceAlertsSection alertsData={alertsData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Performance Metric Card Component
const PerformanceMetricCard = ({ title, value, target, trend, icon: Icon, status }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        {status}
      </div>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Target: {target}</span>
          <div className={`flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}{typeof trend === 'number' && trend % 1 !== 0 ? 'ms' : trend > 1 ? '/s' : '%'}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// System Resource Card Component
const SystemResourceCard = ({ title, icon: Icon, usage, details, history }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Icon className="w-5 h-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Current Usage</span>
          <span className="font-medium">{usage}%</span>
        </div>
        <Progress value={usage} className="h-3" />
      </div>
      <p className="text-sm text-gray-600">{details}</p>
      <div className="space-y-2">
        <p className="text-sm font-medium">Trend (Last 7 periods)</p>
        {history && history.length > 0 ? (
          <Chart
            data={history}
            labels={history.map((_, i) => `${i+1}`)} // Simple numeric labels
            height={64} // Small height for sparkline-like chart
            className="h-16" // Ensure parent div respects this if Chart component doesn't set it directly
          />
        ) : (
          <div className="h-16 flex items-center justify-center text-xs text-gray-400">
            No trend data available.
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Database Performance Section Component
const DatabasePerformanceSection = ({ metrics }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Connections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Active Connections</span>
            <span>{metrics.connections.active} / {metrics.connections.max}</span>
          </div>
          <Progress value={metrics.connections.usage} className="h-2" />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{metrics.connections.active}</div>
          <p className="text-sm text-gray-600">Active Connections</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Query Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">Avg Query Time</span>
            <span className="font-medium">{metrics.queryTime.avg}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Slow Queries</span>
            <span className="font-medium text-red-600">{metrics.queryTime.slow}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Trend</span>
            <span className={`font-medium ${metrics.queryTime.trend < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.queryTime.trend}ms
            </span>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Cache Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{metrics.cacheHitRate.rate}%</div>
          <p className="text-sm text-gray-600">Cache Hit Rate</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Performance</span>
            <span className="text-green-600">+{metrics.cacheHitRate.trend}%</span>
          </div>
          <Progress value={metrics.cacheHitRate.rate} className="h-2" />
        </div>
      </CardContent>
    </Card>
  </div>
);

// Network Metrics Section Component
const NetworkMetricsSection = ({ data, networkMetricsData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          Network Throughput
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {networkMetricsData?.network_in || data?.networkIn || 125} MB/s
              </div>
              <p className="text-sm text-gray-600">Inbound</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {networkMetricsData?.network_out || data?.networkOut || 89} MB/s
              </div>
              <p className="text-sm text-gray-600">Outbound</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Bandwidth Utilization</span>
              <span>{networkMetricsData?.bandwidth_utilization || 28}%</span>
            </div>
            <Progress value={networkMetricsData?.bandwidth_utilization || 28} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Connection Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">Active Connections</span>
            <span className="font-medium">{networkMetricsData?.active_connections || data?.activeConnections || 1234}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Connection Pool</span>
            <span className="font-medium">{networkMetricsData?.connection_pool_usage || data?.connectionPool || 85}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Avg Latency</span>
            <span className="font-medium">{networkMetricsData?.avg_latency || data?.avgLatency || 45}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Packet Loss</span>
            <span className="font-medium text-green-600">{networkMetricsData?.packet_loss || data?.packetLoss || 0.01}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Performance Alerts Section Component
const PerformanceAlertsSection = ({ alertsData }) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Active Performance Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alertsData?.alerts?.length > 0 ? (
            alertsData.alerts.map((alert, index) => (
              <div key={index} className={`flex items-center gap-3 p-3 border rounded-lg ${
                alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                alert.severity === 'info' ? 'bg-blue-50 border-blue-200' :
                'bg-green-50 border-green-200'
              }`}>
                {alert.severity === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                {alert.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                {alert.severity === 'info' && <Activity className="w-5 h-5 text-blue-600" />}
                {alert.severity === 'resolved' && <CheckCircle className="w-5 h-5 text-green-600" />}
                <div className="flex-1">
                  <p className={`font-medium ${
                    alert.severity === 'critical' ? 'text-red-900' :
                    alert.severity === 'warning' ? 'text-yellow-900' :
                    alert.severity === 'info' ? 'text-blue-900' :
                    'text-green-900'
                  }`}>{alert.title}</p>
                  <p className={`text-sm ${
                    alert.severity === 'critical' ? 'text-red-700' :
                    alert.severity === 'warning' ? 'text-yellow-700' :
                    alert.severity === 'info' ? 'text-blue-700' :
                    'text-green-700'
                  }`}>{alert.description}</p>
                </div>
                <Badge variant={
                  alert.severity === 'critical' ? 'destructive' :
                  alert.severity === 'warning' ? 'warning' :
                  alert.severity === 'info' ? 'default' :
                  'success'
                }>
                  {alert.severity === 'critical' ? 'Critical' :
                   alert.severity === 'warning' ? 'Warning' :
                   alert.severity === 'info' ? 'Info' :
                   'Resolved'}
                </Badge>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">High Memory Usage</p>
                  <p className="text-sm text-yellow-700">Memory usage has exceeded 80% for the last 10 minutes</p>
                </div>
                <Badge variant="warning">Warning</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Response Time Improved</p>
                  <p className="text-sm text-green-700">Average response time decreased by 15ms in the last hour</p>
                </div>
                <Badge variant="success">Resolved</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Traffic Spike Detected</p>
                  <p className="text-sm text-blue-700">Request volume increased by 40% compared to usual patterns</p>
                </div>
                <Badge variant="default">Info</Badge>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default PerformanceMonitoringSection;