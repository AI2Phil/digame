import React, { useState, useEffect, useCallback } from 'react';
import { apiClient, replaceApiUrl } from '../../lib/api-config';

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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import { useToast } from '../ui/Toast';

const ApiAnalyticsSection = () => {
  // Toast hook for notifications
  const { toast } = useToast();
  
  // State management for database-driven data
  const [apiMetrics, setApiMetrics] = useState({});
  const [endpointMetrics, setEndpointMetrics] = useState([]);
  const [statusCodeBreakdown, setStatusCodeBreakdown] = useState([]);
  const [apiKeyUsage, setApiKeyUsage] = useState([]);
  const [geographicApiUsage, setGeographicApiUsage] = useState([]);
  const [responseTimeDistribution, setResponseTimeDistribution] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Fetch API analytics data from backend
  const fetchApiAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${replaceApiUrl("")}/api/admin/api/analytics/detailed?time_range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data || result;
      
      setApiMetrics(data.apiMetrics || {});
      setEndpointMetrics(data.endpointMetrics || []);
      setStatusCodeBreakdown(data.statusCodeBreakdown || []);
      setApiKeyUsage(data.apiKeyUsage || []);
      setGeographicApiUsage(data.geographicApiUsage || []);
      setResponseTimeDistribution(data.responseTimeDistribution || {});
      
    } catch (err) {
      console.error('Error fetching API analytics:', err);
      setError(err.message);
      // Fallback to enhanced sample data
      generateEnhancedSampleData();
      // Show notification that fallback data is being used
      toast.warning('API Unavailable', 'Using sample data - API endpoints not accessible');
    } finally {
      setLoading(false);
    }
  }, [timeRange, toast]);

  // Generate enhanced sample data as fallback
  const generateEnhancedSampleData = () => {
    // Generate realistic API metrics
    const enhancedApiMetrics = {
      totalRequests: Math.round(Math.random() * 10000 + 40000), // 40k-50k
      requestsPerMinute: Math.round(Math.random() * 50 + 130), // 130-180
      avgResponseTime: Math.round(Math.random() * 50 + 100), // 100-150ms
      errorRate: Math.round((Math.random() * 0.7 + 0.5) * 10) / 10, // 0.5-1.2%
      successRate: Math.round((Math.random() * 1.0 + 98.5) * 10) / 10, // 98.5-99.5%
      uniqueApiKeys: Math.round(Math.random() * 50 + 200), // 200-250
      rateLimitHits: Math.round(Math.random() * 7 + 8), // 8-15
      bandwidth: Math.round((Math.random() * 1.0 + 2.0) * 10) / 10 // 2.0-3.0 GB
    };
    
    setApiMetrics(enhancedApiMetrics);

    // Generate realistic endpoint metrics
    const endpoints = [
      '/api/v1/users', '/api/v1/auth/login', '/api/v1/data/analytics',
      '/api/v1/reports', '/api/v1/settings', '/api/v1/notifications',
      '/api/v1/files/upload', '/api/v1/search', '/api/v1/dashboard'
    ];
    
    const enhancedEndpointMetrics = endpoints.map(endpoint => ({
      endpoint,
      requests: Math.round(Math.random() * 5000 + 1000),
      avgResponseTime: Math.round(Math.random() * 100 + 50),
      errorRate: Math.round((Math.random() * 1.5) * 10) / 10,
      successRate: Math.round((Math.random() * 2.0 + 97.5) * 10) / 10,
      bandwidth: Math.round((Math.random() * 0.5 + 0.1) * 100) / 100
    }));
    
    setEndpointMetrics(enhancedEndpointMetrics);

    // Generate status code breakdown
    const enhancedStatusCodes = [
      { code: '200', count: Math.round(Math.random() * 5000 + 35000), percentage: 85.2 },
      { code: '201', count: Math.round(Math.random() * 1000 + 3000), percentage: 8.1 },
      { code: '400', count: Math.round(Math.random() * 200 + 800), percentage: 2.4 },
      { code: '401', count: Math.round(Math.random() * 150 + 600), percentage: 1.8 },
      { code: '404', count: Math.round(Math.random() * 100 + 400), percentage: 1.2 },
      { code: '500', count: Math.round(Math.random() * 50 + 200), percentage: 0.6 },
      { code: '503', count: Math.round(Math.random() * 30 + 100), percentage: 0.3 }
    ];
    
    setStatusCodeBreakdown(enhancedStatusCodes);

    // Generate API key usage data
    const enhancedApiKeyUsage = Array.from({ length: 8 }, (_, i) => ({
      keyId: `key_${String(i + 1).padStart(3, '0')}`,
      name: `API Key ${i + 1}`,
      requests: Math.round(Math.random() * 3000 + 1000),
      lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      rateLimitHits: Math.round(Math.random() * 5)
    }));
    
    setApiKeyUsage(enhancedApiKeyUsage);

    // Generate geographic usage data
    const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia', 'Japan', 'Brazil'];
    const enhancedGeographicUsage = countries.map(country => ({
      country,
      requests: Math.round(Math.random() * 3000 + 500),
      percentage: Math.round((Math.random() * 15 + 5) * 10) / 10,
      avgResponseTime: Math.round(Math.random() * 100 + 80)
    }));
    
    setGeographicApiUsage(enhancedGeographicUsage);

    // Generate response time distribution
    const enhancedResponseTimeDistribution = {
      '0-50ms': Math.round(Math.random() * 10 + 25),
      '50-100ms': Math.round(Math.random() * 15 + 35),
      '100-200ms': Math.round(Math.random() * 10 + 20),
      '200-500ms': Math.round(Math.random() * 5 + 10),
      '500ms+': Math.round(Math.random() * 3 + 2)
    };
    
    setResponseTimeDistribution(enhancedResponseTimeDistribution);
  };

  // Initial data fetch
  useEffect(() => {
    fetchApiAnalytics();
  }, [fetchApiAnalytics]);

  // Refresh data function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchApiAnalytics();
    setRefreshing(false);
    toast.success('Data Refreshed', 'API analytics data has been updated');
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">API Analytics</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate derived metrics from state data
  const topEndpoints = endpointMetrics
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 5);

  const slowestEndpoints = endpointMetrics
    .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
    .slice(0, 5);

  const errorProneEndpoints = endpointMetrics
    .filter(endpoint => endpoint.errorRate > 0.5)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 5);

  const filteredEndpoints = selectedEndpoint === 'all'
    ? endpointMetrics
    : endpointMetrics.filter(endpoint => endpoint.endpoint.includes(selectedEndpoint));

  const totalBandwidth = endpointMetrics.reduce((sum, endpoint) => sum + endpoint.bandwidth, 0);

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
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Analytics</h2>
          <p className="text-gray-600">Monitor API performance, usage patterns, and endpoint health metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
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
              value={apiMetrics.totalRequests ? apiMetrics.totalRequests.toLocaleString() : '0'}
              change="+23%"
              trend="up"
              icon={BarChart3}
              color="blue"
            />
            <ApiMetricCard
              title="Requests/Min"
              value={apiMetrics.requestsPerMinute || '0'}
              change="+15%"
              trend="up"
              icon={Zap}
              color="green"
            />
            <ApiMetricCard
              title="Avg Response"
              value={`${apiMetrics.avgResponseTime || '0'}ms`}
              change="-12ms"
              trend="down"
              icon={Clock}
              color="purple"
            />
            <ApiMetricCard
              title="Success Rate"
              value={`${apiMetrics.successRate || '0'}%`}
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead align="left">Endpoint</TableHead>
            <TableHead align="right">Requests</TableHead>
            <TableHead align="right">Avg Response</TableHead>
            <TableHead align="right">P95 Response</TableHead>
            <TableHead align="right">Error Rate</TableHead>
            <TableHead align="right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {endpoints.map((endpoint, index) => (
            <TableRow key={index}>
              <TableCell>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {endpoint.endpoint}
                </code>
              </TableCell>
              <TableCell align="right" className="font-medium">
                {endpoint.requests.toLocaleString()}
              </TableCell>
              <TableCell align="right">
                {endpoint.avgResponseTime}ms
              </TableCell>
              <TableCell align="right">
                {endpoint.p95ResponseTime}ms
              </TableCell>
              <TableCell align="right">
                <Badge variant={endpoint.errorRate < 1 ? 'success' : endpoint.errorRate < 2 ? 'warning' : 'destructive'}>
                  {endpoint.errorRate}%
                </Badge>
              </TableCell>
              <TableCell align="right">
                <Badge variant={endpoint.status === 'healthy' ? 'success' : endpoint.status === 'warning' ? 'warning' : 'destructive'}>
                  {endpoint.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead align="left">Region</TableHead>
            <TableHead align="right">Requests</TableHead>
            <TableHead align="right">Percentage</TableHead>
            <TableHead align="right">Avg Latency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regions.map((region, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {region.region || region.country || 'Unknown'}
              </TableCell>
              <TableCell align="right">{region.requests?.toLocaleString() || '0'}</TableCell>
              <TableCell align="right">
                <Badge variant="secondary">{region.percentage || '0'}%</Badge>
              </TableCell>
              <TableCell align="right">
                <Badge variant={
                  (region.latency || region.avgResponseTime || 0) < 150 ? 'success' :
                  (region.latency || region.avgResponseTime || 0) < 250 ? 'warning' : 'destructive'
                }>
                  {region.latency || region.avgResponseTime || '0'}ms
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default ApiAnalyticsSection;