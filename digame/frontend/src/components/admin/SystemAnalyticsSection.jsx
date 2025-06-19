import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Activity, Database, 
  Clock, Users, Zap, AlertTriangle, CheckCircle,
  Calendar, Download, RefreshCw, Monitor
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';

const SystemAnalyticsSection = ({ systemStats }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const performanceMetrics = [
    {
      name: 'API Response Time',
      value: systemStats.avgResponseTime || 120,
      unit: 'ms',
      target: 200,
      status: 'good',
      trend: '+5%'
    },
    {
      name: 'Database Query Time',
      value: systemStats.dbQueryTime || 45,
      unit: 'ms',
      target: 100,
      status: 'excellent',
      trend: '-12%'
    },
    {
      name: 'Memory Usage',
      value: systemStats.memoryUsage || 62,
      unit: '%',
      target: 80,
      status: 'good',
      trend: '+3%'
    },
    {
      name: 'CPU Usage',
      value: systemStats.cpuUsage || 45,
      unit: '%',
      target: 70,
      status: 'excellent',
      trend: '-8%'
    }
  ];

  const apiEndpoints = [
    { endpoint: '/auth/login', requests: 1234, avgTime: 89, errors: 2 },
    { endpoint: '/api/dashboard', requests: 856, avgTime: 156, errors: 0 },
    { endpoint: '/api/users', requests: 432, avgTime: 234, errors: 1 },
    { endpoint: '/onboarding/', requests: 298, avgTime: 178, errors: 0 },
    { endpoint: '/settings/api-keys', requests: 167, avgTime: 145, errors: 0 }
  ];

  const errorLogs = [
    {
      timestamp: '2025-05-23 19:15:32',
      level: 'ERROR',
      message: 'Database connection timeout',
      endpoint: '/api/analytics',
      user: 'user123@example.com'
    },
    {
      timestamp: '2025-05-23 19:10:15',
      level: 'WARNING',
      message: 'High memory usage detected',
      endpoint: 'system',
      user: 'system'
    },
    {
      timestamp: '2025-05-23 19:05:42',
      level: 'ERROR',
      message: 'Authentication failed',
      endpoint: '/auth/login',
      user: 'suspicious@email.com'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                System Analytics
              </CardTitle>
              <CardDescription>
                Monitor system performance, API usage, and error tracking
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="px-3 py-2 border border-gray-300 rounded-md text-sm w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="api-usage">API Usage</TabsTrigger>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric, index) => (
              <PerformanceMetricCard key={index} metric={metric} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemResourcesCard systemStats={systemStats} />
            <ResponseTimeChart />
          </div>
        </TabsContent>

        {/* API Usage Tab */}
        <TabsContent value="api-usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {systemStats.totalRequests || '12,456'}
                </div>
                <p className="text-sm text-gray-500">+23% from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">99.8%</div>
                <p className="text-sm text-gray-500">+0.2% from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avg Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {systemStats.avgResponseTime || 120}ms
                </div>
                <p className="text-sm text-gray-500">-15ms from yesterday</p>
              </CardContent>
            </Card>
          </div>

          <ApiEndpointsTable endpoints={apiEndpoints} />
        </TabsContent>

        {/* Error Logs Tab */}
        <TabsContent value="errors" className="space-y-6">
          <ErrorLogsTable logs={errorLogs} />
        </TabsContent>

        {/* User Analytics Tab */}
        <TabsContent value="users" className="space-y-6">
          <UserAnalyticsSection systemStats={systemStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Performance Metric Card Component
const PerformanceMetricCard = ({ metric }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const progressValue = metric.unit === '%' ? metric.value : (metric.value / metric.target) * 100;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
          <Badge className={getStatusColor(metric.status)}>
            {metric.status}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{metric.value}</span>
            <span className="text-sm text-gray-500">{metric.unit}</span>
            <span className={`text-sm ${metric.trend.startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>
              {metric.trend}
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
          <p className="text-xs text-gray-500">Target: {metric.target}{metric.unit}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// System Resources Card Component
const SystemResourcesCard = ({ systemStats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Monitor className="w-5 h-5" />
        System Resources
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>CPU Usage</span>
          <span>{systemStats.cpuUsage || 45}%</span>
        </div>
        <Progress value={systemStats.cpuUsage || 45} className="h-2" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Memory Usage</span>
          <span>{systemStats.memoryUsage || 62}%</span>
        </div>
        <Progress value={systemStats.memoryUsage || 62} className="h-2" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Disk Usage</span>
          <span>{systemStats.diskUsage || 34}%</span>
        </div>
        <Progress value={systemStats.diskUsage || 34} className="h-2" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Network I/O</span>
          <span>{systemStats.networkIO || 28}%</span>
        </div>
        <Progress value={systemStats.networkIO || 28} className="h-2" />
      </div>
    </CardContent>
  </Card>
);

// Response Time Chart Component
const ResponseTimeChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Response Time Trend
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Chart visualization would go here</p>
          <p className="text-sm text-gray-400">Integration with charting library needed</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// API Endpoints Table Component
const ApiEndpointsTable = ({ endpoints }) => (
  <Card>
    <CardHeader>
      <CardTitle>API Endpoint Performance</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Endpoint</TableHead>
            <TableHead>Requests</TableHead>
            <TableHead>Avg Time</TableHead>
            <TableHead>Errors</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {endpoints.map((endpoint, index) => (
            <TableRow key={index}>
              <TableCell className="font-mono text-sm">{endpoint.endpoint}</TableCell>
              <TableCell>{endpoint.requests.toLocaleString()}</TableCell>
              <TableCell>{endpoint.avgTime}ms</TableCell>
              <TableCell>
                {endpoint.errors > 0 ? (
                  <span className="text-red-600">{endpoint.errors}</span>
                ) : (
                  <span className="text-green-600">0</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={endpoint.errors > 0 ? 'destructive' : 'success'}>
                  {endpoint.errors > 0 ? 'Issues' : 'Healthy'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// Error Logs Table Component
const ErrorLogsTable = ({ logs }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Recent Error Logs
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {logs.map((log, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={log.level === 'ERROR' ? 'destructive' : 'warning'}>
                    {log.level}
                  </Badge>
                  <span className="text-sm text-gray-500">{log.timestamp}</span>
                </div>
                <p className="font-medium text-gray-900 mb-1">{log.message}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Endpoint: {log.endpoint}</span>
                  <span>User: {log.user}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// User Analytics Section Component
const UserAnalyticsSection = ({ systemStats }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Active Users (24h)</span>
          <span className="font-bold">{systemStats.activeUsers24h || 234}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>New Registrations</span>
          <span className="font-bold">{systemStats.newRegistrations || 12}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Session Duration (avg)</span>
          <span className="font-bold">{systemStats.avgSessionDuration || '24m'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Bounce Rate</span>
          <span className="font-bold">{systemStats.bounceRate || '15%'}</span>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Feature Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Dashboard Views</span>
            <span>1,234</span>
          </div>
          <Progress value={85} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>API Key Management</span>
            <span>567</span>
          </div>
          <Progress value={65} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Onboarding Completion</span>
            <span>89</span>
          </div>
          <Progress value={45} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Settings Access</span>
            <span>234</span>
          </div>
          <Progress value={35} className="h-2" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export default SystemAnalyticsSection;