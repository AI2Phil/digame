import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Progress } from '../../src/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Zap, 
  Server, 
  Database,
  Cpu,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const PerformanceAnalytics = () => {
  const router = useRouter();
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/performance?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockPerformanceData = {
    overview: {
      uptime: 99.97,
      responseTime: 245,
      throughput: 1250,
      errorRate: 0.03
    },
    systemMetrics: {
      cpu: { usage: 68, trend: 'stable' },
      memory: { usage: 72, trend: 'increasing' },
      disk: { usage: 45, trend: 'stable' },
      network: { usage: 34, trend: 'decreasing' }
    },
    endpoints: [
      { path: '/api/analytics/web', avgResponseTime: 120, requests: 15420, errors: 2 },
      { path: '/api/ai-tools/writing', avgResponseTime: 890, requests: 8930, errors: 12 },
      { path: '/api/digital-twin/predictions', avgResponseTime: 1240, requests: 3450, errors: 1 },
      { path: '/api/workflow/automation', avgResponseTime: 340, requests: 6780, errors: 5 }
    ],
    alerts: [
      { type: 'warning', message: 'Memory usage above 70%', timestamp: '2 minutes ago' },
      { type: 'info', message: 'Database connection pool optimized', timestamp: '15 minutes ago' }
    ]
  };

  const data = performanceData || mockPerformanceData;

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (value, thresholds) => {
    if (value >= thresholds.critical) return <XCircle className="h-4 w-4 text-red-600" />;
    if (value >= thresholds.warning) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Performance Analytics"
        subtitle="Monitor system performance, response times, and resource utilization"
        icon={<Activity className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Analytics', href: '/analytics' },
          { label: 'Performance', href: '/analytics/performance' }
        ]}
        actions={
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <Button onClick={fetchPerformanceData}>
              Refresh
            </Button>
          </div>
        }
      />

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-green-600">{data.overview.uptime}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">{data.overview.responseTime}ms</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Throughput</p>
                <p className="text-2xl font-bold">{data.overview.throughput.toLocaleString()}</p>
                <p className="text-xs text-gray-500">requests/hour</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-green-600">{data.overview.errorRate}%</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* System Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getStatusColor(data.systemMetrics.cpu.usage, { warning: 70, critical: 90 })}`}>
                    {data.systemMetrics.cpu.usage}%
                  </span>
                  {getStatusIcon(data.systemMetrics.cpu.usage, { warning: 70, critical: 90 })}
                </div>
              </div>
              <Progress value={data.systemMetrics.cpu.usage} className="h-2" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Memory Usage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getStatusColor(data.systemMetrics.memory.usage, { warning: 70, critical: 85 })}`}>
                    {data.systemMetrics.memory.usage}%
                  </span>
                  {getStatusIcon(data.systemMetrics.memory.usage, { warning: 70, critical: 85 })}
                </div>
              </div>
              <Progress value={data.systemMetrics.memory.usage} className="h-2" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  <span className="text-sm font-medium">Disk Usage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getStatusColor(data.systemMetrics.disk.usage, { warning: 80, critical: 95 })}`}>
                    {data.systemMetrics.disk.usage}%
                  </span>
                  {getStatusIcon(data.systemMetrics.disk.usage, { warning: 80, critical: 95 })}
                </div>
              </div>
              <Progress value={data.systemMetrics.disk.usage} className="h-2" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  <span className="text-sm font-medium">Network Usage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getStatusColor(data.systemMetrics.network.usage, { warning: 70, critical: 90 })}`}>
                    {data.systemMetrics.network.usage}%
                  </span>
                  {getStatusIcon(data.systemMetrics.network.usage, { warning: 70, critical: 90 })}
                </div>
              </div>
              <Progress value={data.systemMetrics.network.usage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  {alert.type === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoint Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Endpoint</th>
                  <th className="text-left py-3 px-4 font-medium">Avg Response Time</th>
                  <th className="text-left py-3 px-4 font-medium">Requests</th>
                  <th className="text-left py-3 px-4 font-medium">Errors</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.endpoints.map((endpoint, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{endpoint.path}</td>
                    <td className="py-3 px-4">
                      <span className={endpoint.avgResponseTime > 1000 ? 'text-red-600' : endpoint.avgResponseTime > 500 ? 'text-yellow-600' : 'text-green-600'}>
                        {endpoint.avgResponseTime}ms
                      </span>
                    </td>
                    <td className="py-3 px-4">{endpoint.requests.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={endpoint.errors > 10 ? 'text-red-600' : endpoint.errors > 0 ? 'text-yellow-600' : 'text-green-600'}>
                        {endpoint.errors}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={endpoint.errors > 10 ? 'destructive' : endpoint.errors > 0 ? 'secondary' : 'default'}>
                        {endpoint.errors > 10 ? 'Critical' : endpoint.errors > 0 ? 'Warning' : 'Healthy'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceAnalytics;