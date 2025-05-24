import React, { useState } from 'react';
import { 
  BarChart3, Zap, Clock, AlertTriangle, 
  CheckCircle, TrendingUp, Activity, Database,
  Globe, Key, Shield, RefreshCw, Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

const ApiAnalyticsSection = ({ data }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('all');

  // Mock API analytics data with realistic metrics
  const apiMetrics = {
    totalRequests: data?.totalRequests || 45678,
    requestsPerMinute: data?.requestsPerMinute || 156,
    avgResponseTime: data?.avgResponseTime || 120,
    errorRate: data?.errorRate || 0.8,
    successRate: data?.successRate || 99.2,
    uniqueApiKeys: data?.uniqueApiKeys || 234,
    rateLimitHits: data?.rateLimitHits || 12,
    bandwidth: data?.bandwidth || 2.4
  };

  const endpointMetrics = [
    {
      endpoint: '/api/auth/login',
      requests: 12456,
      avgResponseTime: 89,
      errorRate: 0.2,
      successRate: 99.8,
      p95ResponseTime: 145,
      status: 'healthy'
    },
    {
      endpoint: '/api/users/profile',
      requests: 8765,
      avgResponseTime: 156,
      errorRate: 0.5,
      successRate: 99.5,
      p95ResponseTime: 234,
      status: 'healthy'
    },
    {
      endpoint: '/api/analytics/data',
      requests: 5432,
      avgResponseTime: 234,
      errorRate: 1.2,
      successRate: 98.8,
      p95ResponseTime: 456,
      status: 'warning'
    },
    {
      endpoint: '/api/goals/create',
      requests: 3210,
      avgResponseTime: 178,
      errorRate: 0.8,
      successRate: 99.2,
      p95ResponseTime: 289,
      status: 'healthy'
    },
    {
      endpoint: '/api/admin/users',
      requests: 1987,
      avgResponseTime: 345,
      errorRate: 2.1,
      successRate: 97.9,
      p95ResponseTime: 567,
      status: 'critical'
    }
  ];

  const statusCodeBreakdown = [
    { code: '200', count: 42345, percentage: 92.7, color: 'bg-green-500' },
    { code: '201', count: 2134, percentage: 4.7, color: 'bg-blue-500' },
    { code: '400', count: 567, percentage: 1.2, color: 'bg-yellow-500' },
    { code: '401', count: 234, percentage: 0.5, color: 'bg-orange-500' },
    { code: '404', count: 189, percentage: 0.4, color: 'bg-red-400' },
    { code: '500', count: 209, percentage: 0.5, color: 'bg-red-600' }
  ];

  const apiKeyUsage = [
    { keyName: 'Production API', requests: 15678, quota: 20000, usage: 78.4, status: 'active' },
    { keyName: 'Development API', requests: 8765, quota: 10000, usage: 87.7, status: 'warning' },
    { keyName: 'Mobile App API', requests: 12345, quota: 15000, usage: 82.3, status: 'active' },
    { keyName: 'Analytics API', requests: 5432, quota: 8000, usage: 67.9, status: 'active' },
    { keyName: 'Test API', requests: 2109, quota: 5000, usage: 42.2, status: 'active' }
  ];

  const geographicApiUsage = [
    { region: 'North America', requests: 18234, percentage: 39.9, latency: 89 },
    { region: 'Europe', requests: 12456, percentage: 27.3, latency: 145 },
    { region: 'Asia Pacific', requests: 8765, percentage: 19.2, latency: 234 },
    { region: 'South America', requests: 4321, percentage: 9.5, latency: 178 },
    { region: 'Africa', requests: 1902, percentage: 4.1, latency: 267 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'healthy': return <Badge variant="success">Healthy</Badge>;
      case 'warning': return <Badge variant="warning">Warning</Badge>;
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* API Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            API Usage & Performance Analytics
          </CardTitle>
          <CardDescription>
            Monitor API performance, usage patterns, and endpoint health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ApiMetricCard
              title="Total Requests"
              value={apiMetrics.totalRequests.toLocaleString()}
              change="+23%"
              trend="up"
              icon={BarChart3}
              color="blue"
            />
            <ApiMetricCard
              title="Requests/Min"
              value={apiMetrics.requestsPerMinute}
              change="+15%"
              trend="up"
              icon={Zap}
              color="green"
            />
            <ApiMetricCard
              title="Avg Response"
              value={`${apiMetrics.avgResponseTime}ms`}
              change="-12ms"
              trend="down"
              icon={Clock}
              color="purple"
            />
            <ApiMetricCard
              title="Success Rate"
              value={`${apiMetrics.successRate}%`}
              change="+0.3%"
              trend="up"
              icon={CheckCircle}
              color="emerald"
            />
          </div>
        </CardContent>
      </Card>

      {/* API Analytics Tabs */}
      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">API Keys</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-6">
          <EndpointAnalyticsSection endpoints={endpointMetrics} />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <ApiPerformanceSection metrics={apiMetrics} />
        </TabsContent>

        {/* API Keys Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <ApiKeyUsageSection apiKeys={apiKeyUsage} />
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-6">
          <ErrorAnalyticsSection statusCodes={statusCodeBreakdown} />
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="geographic" className="space-y-6">
          <GeographicApiUsageSection regions={geographicApiUsage} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// API Metric Card Component
const ApiMetricCard = ({ title, value, change, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    emerald: 'text-emerald-600 bg-emerald-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className={`w-4 h-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change} from last period
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Endpoint Analytics Section Component
const EndpointAnalyticsSection = ({ endpoints }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Globe className="w-5 h-5" />
        Endpoint Performance Analysis
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Endpoint</th>
              <th className="text-right p-3">Requests</th>
              <th className="text-right p-3">Avg Response</th>
              <th className="text-right p-3">P95 Response</th>
              <th className="text-right p-3">Error Rate</th>
              <th className="text-right p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((endpoint, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {endpoint.endpoint}
                  </code>
                </td>
                <td className="p-3 text-right font-medium">
                  {endpoint.requests.toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  {endpoint.avgResponseTime}ms
                </td>
                <td className="p-3 text-right">
                  {endpoint.p95ResponseTime}ms
                </td>
                <td className="p-3 text-right">
                  <Badge variant={endpoint.errorRate < 1 ? 'success' : endpoint.errorRate < 2 ? 'warning' : 'destructive'}>
                    {endpoint.errorRate}%
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <Badge variant={endpoint.status === 'healthy' ? 'success' : endpoint.status === 'warning' ? 'warning' : 'destructive'}>
                    {endpoint.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

// API Performance Section Component
const ApiPerformanceSection = ({ metrics }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Response Time Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>&lt; 100ms</span>
            <span className="font-medium">65%</span>
          </div>
          <Progress value={65} className="h-2" />
          
          <div className="flex justify-between">
            <span>100-200ms</span>
            <span className="font-medium">25%</span>
          </div>
          <Progress value={25} className="h-2" />
          
          <div className="flex justify-between">
            <span>200-500ms</span>
            <span className="font-medium">8%</span>
          </div>
          <Progress value={8} className="h-2" />
          
          <div className="flex justify-between">
            <span>&gt; 500ms</span>
            <span className="font-medium">2%</span>
          </div>
          <Progress value={2} className="h-2" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          API Health Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.successRate}%</div>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{metrics.errorRate}%</div>
            <p className="text-sm text-gray-600">Error Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.bandwidth}GB</div>
            <p className="text-sm text-gray-600">Bandwidth Used</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.rateLimitHits}</div>
            <p className="text-sm text-gray-600">Rate Limit Hits</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// API Key Usage Section Component
const ApiKeyUsageSection = ({ apiKeys }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Key className="w-5 h-5" />
        API Key Usage Analytics
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {apiKeys.map((apiKey, index) => (
        <div key={index} className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium">{apiKey.keyName}</h4>
              <p className="text-sm text-gray-600">
                {apiKey.requests.toLocaleString()} / {apiKey.quota.toLocaleString()} requests
              </p>
            </div>
            <Badge variant={apiKey.status === 'active' ? 'success' : 'warning'}>
              {apiKey.status}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Usage</span>
              <span>{apiKey.usage}%</span>
            </div>
            <Progress 
              value={apiKey.usage} 
              className={`h-2 ${apiKey.usage > 90 ? 'bg-red-100' : apiKey.usage > 75 ? 'bg-yellow-100' : 'bg-green-100'}`}
            />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

// Error Analytics Section Component
const ErrorAnalyticsSection = ({ statusCodes }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          HTTP Status Code Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusCodes.map((status, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{status.code}</span>
              <span>{status.count.toLocaleString()} ({status.percentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${status.color}`}
                style={{ width: `${status.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Error Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-900">Critical Errors</span>
            </div>
            <p className="text-sm text-red-700">209 server errors (0.5%)</p>
          </div>
          
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-900">Client Errors</span>
            </div>
            <p className="text-sm text-yellow-700">990 client errors (2.1%)</p>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-900">Success Rate</span>
            </div>
            <p className="text-sm text-green-700">44,479 successful requests (97.4%)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Geographic API Usage Section Component
const GeographicApiUsageSection = ({ regions }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Globe className="w-5 h-5" />
        Geographic API Usage Distribution
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Region</th>
              <th className="text-right p-3">Requests</th>
              <th className="text-right p-3">Percentage</th>
              <th className="text-right p-3">Avg Latency</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{region.region}</td>
                <td className="p-3 text-right">{region.requests.toLocaleString()}</td>
                <td className="p-3 text-right">
                  <Badge variant="secondary">{region.percentage}%</Badge>
                </td>
                <td className="p-3 text-right">
                  <Badge variant={region.latency < 150 ? 'success' : region.latency < 250 ? 'warning' : 'destructive'}>
                    {region.latency}ms
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

export default ApiAnalyticsSection;