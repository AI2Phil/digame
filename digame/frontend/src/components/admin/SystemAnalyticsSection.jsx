import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Activity, Database, 
  Clock, Users, Zap, AlertTriangle, CheckCircle,
  Calendar, Download, RefreshCw, Monitor, Server, Cpu, MemoryStick, HardDrive, Network
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';

const SystemAnalyticsSection = ({ stats: systemStats }) => { // Renamed prop for clarity if it comes from a general 'stats' object
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);

  // Use a default object for systemStats if it's undefined to prevent errors
  const safeSystemStats = systemStats || {
    avgResponseTime: 0, dbQueryTime: 0, memoryUsage: 0, cpuUsage: 0,
    totalRequests: 0, activeUsers24h: 0, newRegistrations: 0,
    avgSessionDuration: '0m', bounceRate: '0%', diskUsage: 0, networkIO: '0%'
  };

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
              <CardDescription className="dark:text-gray-400">
                Monitor system performance, API usage, and error tracking.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 sm:mt-0">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-gray-200">
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
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
      <Tabs defaultValue="performance" className="space-y-6 dark:text-gray-300">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 dark:bg-gray-800">
          <TabsTrigger value="performance" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Performance</TabsTrigger>
          <TabsTrigger value="api-usage" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">API Usage</TabsTrigger>
          <TabsTrigger value="errors" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Error Logs</TabsTrigger>
          <TabsTrigger value="users" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">User Analytics</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {performanceMetrics.map((metric, index) => (
              <PerformanceMetricCard key={index} metric={metric} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <SystemResourcesCard systemStats={safeSystemStats} />
            <ResponseTimeChart />
          </div>
        </TabsContent>

        {/* API Usage Tab */}
        <TabsContent value="api-usage" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg dark:text-gray-100">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {safeSystemStats.totalRequests?.toLocaleString() || 'N/A'}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">+23% from yesterday</p>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg dark:text-gray-100">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">99.8%</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">+0.2% from yesterday</p>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg dark:text-gray-100">Avg Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {safeSystemStats.avgResponseTime || 'N/A'}ms
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">-15ms from yesterday</p>
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
          <UserAnalyticsSection systemStats={safeSystemStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Performance Metric Card Component
const PerformanceMetricCard = ({ metric }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'good': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/30';
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  const progressValue = metric.unit === '%' ? metric.value : (metric.value / metric.target) * 100;

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{metric.name}</h3>
          <Badge className={`${getStatusColor(metric.status)} px-2 py-0.5 text-xs`}>
            {metric.status}
          </Badge>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold dark:text-white">{metric.value}</span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{metric.unit}</span>
            <span className={`text-xs sm:text-sm ${metric.trend.startsWith('+') ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
              {metric.trend}
            </span>
          </div>
          <Progress value={Math.min(100, progressValue)} className={`h-1.5 sm:h-2 ${getProgressColor(metric.status)} dark:bg-opacity-50`} />
          <p className="text-xs text-gray-500 dark:text-gray-400">Target: {metric.target}{metric.unit}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// System Resources Card Component
const SystemResourcesCard = ({ systemStats }) => {
  const resources = [
    { name: 'CPU Usage', value: systemStats.cpuUsage || 0, icon: Cpu, color: 'blue' },
    { name: 'Memory Usage', value: systemStats.memoryUsage || 0, icon: MemoryStick, color: 'green' },
    { name: 'Disk Usage', value: systemStats.diskUsage || 0, icon: HardDrive, color: 'yellow' },
    { name: 'Network I/O', value: parseFloat(systemStats.networkIO) || 0, icon: Network, unit: '%', color: 'purple' }, // Assuming networkIO is a percentage string like "28%"
  ];

  return (
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 dark:text-gray-100">
        <Server className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        System Resources
      </CardTitle>
      <CardDescription className="dark:text-gray-400">Overview of key server resource utilization.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {resources.map(resource => {
        const ResourceIcon = resource.icon;
        const progressColor = `bg-${resource.color}-500`;
        return (
          <div key={resource.name} className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <ResourceIcon className={`w-4 h-4 text-${resource.color}-500 dark:text-${resource.color}-400`} />
                {resource.name}
              </span>
              <span className="font-medium dark:text-white">{resource.value}{resource.unit || '%'}</span>
            </div>
            <Progress value={resource.value} className={`h-2 ${progressColor} dark:bg-opacity-50`} />
          </div>
        );
      })}
    </CardContent>
  </Card>
  );
};

// Response Time Chart Component
const ResponseTimeChart = () => (
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 dark:text-gray-100">
        <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Response Time Trend
      </CardTitle>
      <CardDescription className="dark:text-gray-400">API response times over the selected period.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-60 sm:h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
        <div className="text-center">
          <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Chart visualization placeholder</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Integrate with a charting library here.</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// API Endpoints Table Component
const ApiEndpointsTable = ({ endpoints }) => (
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="dark:text-gray-100">API Endpoint Performance</CardTitle>
      <CardDescription className="dark:text-gray-400">Breakdown of requests, average time, and errors per endpoint.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="dark:bg-gray-700/50">
            <TableRow className="dark:border-gray-600">
              <TableHead className="p-3 font-medium dark:text-gray-300">Endpoint</TableHead>
              <TableHead className="p-3 font-medium dark:text-gray-300">Requests</TableHead>
              <TableHead className="p-3 font-medium dark:text-gray-300">Avg Time (ms)</TableHead>
              <TableHead className="p-3 font-medium dark:text-gray-300">Errors</TableHead>
              <TableHead className="p-3 font-medium dark:text-gray-300">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpoints.map((endpoint, index) => (
              <TableRow key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <TableCell className="p-3 font-mono text-xs sm:text-sm dark:text-gray-200">{endpoint.endpoint}</TableCell>
                <TableCell className="p-3 dark:text-gray-300">{endpoint.requests.toLocaleString()}</TableCell>
                <TableCell className="p-3 dark:text-gray-300">{endpoint.avgTime}</TableCell>
                <TableCell className="p-3">
                  {endpoint.errors > 0 ? (
                    <span className="text-red-500 dark:text-red-400">{endpoint.errors}</span>
                  ) : (
                    <span className="text-green-500 dark:text-green-400">0</span>
                  )}
                </TableCell>
                <TableCell className="p-3">
                  <Badge variant={endpoint.errors > 0 ? 'destructive' : 'success'} className="text-xs">
                    {endpoint.errors > 0 ? 'Issues' : 'Healthy'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);

// Error Logs Table Component
const ErrorLogsTable = ({ logs }) => (
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 dark:text-gray-100">
        <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
        Recent Error Logs
      </CardTitle>
      <CardDescription className="dark:text-gray-400">Summary of recent system errors and warnings.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {logs.map((log, index) => (
          <div key={index} className="p-3 sm:p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:shadow-sm">
            <div className="flex flex-col sm:flex-row items-start justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant={log.level === 'ERROR' ? 'destructive' : 'warning'} className="text-xs">
                    {log.level}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{log.timestamp}</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">{log.message}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>Endpoint: <span className="font-mono">{log.endpoint}</span></span>
                  <span>User: <span className="font-mono">{log.user}</span></span>
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
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          User Activity
        </CardTitle>
        <CardDescription className="dark:text-gray-400">Key metrics related to user engagement.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { label: "Active Users (24h)", value: systemStats.activeUsers24h?.toLocaleString() || 'N/A' },
          { label: "New Registrations", value: systemStats.newRegistrations?.toLocaleString() || 'N/A' },
          { label: "Session Duration (avg)", value: systemStats.avgSessionDuration || 'N/A' },
          { label: "Bounce Rate", value: systemStats.bounceRate || 'N/A' },
        ].map(metric => (
          <div key={metric.label} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <span className="text-gray-600 dark:text-gray-300">{metric.label}</span>
            <span className="font-semibold dark:text-white">{metric.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400" />
          Feature Usage
        </CardTitle>
        <CardDescription className="dark:text-gray-400">Popularity of key platform features.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { name: 'Dashboard Views', value: 85, count: 1234, color: 'blue' },
          { name: 'API Key Management', value: 65, count: 567, color: 'purple' },
          { name: 'Onboarding Completion', value: 45, count: 89, color: 'green' },
          { name: 'Settings Access', value: 35, count: 234, color: 'yellow' },
        ].map(feature => (
          <div key={feature.name} className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
              <span className="font-medium dark:text-white">{feature.count?.toLocaleString()} views</span>
            </div>
            <Progress value={feature.value} className={`h-2 bg-${feature.color}-500 dark:bg-opacity-50`} />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default SystemAnalyticsSection;