import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Database,
  Globe,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Users,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  Memory,
  Network,
  Eye,
  AlertCircle,
  Target,
  Gauge
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts';

const IntegrationAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [analyticsData, setAnalyticsData] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [usageStats, setUsageStats] = useState({});
  const [realTimeData, setRealTimeData] = useState({});

  // Mock analytics data
  const performanceData = [
    { name: 'Mon', responseTime: 145, throughput: 1250, errors: 12, uptime: 99.8 },
    { name: 'Tue', responseTime: 138, throughput: 1340, errors: 8, uptime: 99.9 },
    { name: 'Wed', responseTime: 142, throughput: 1420, errors: 15, uptime: 99.7 },
    { name: 'Thu', responseTime: 135, throughput: 1580, errors: 6, uptime: 99.9 },
    { name: 'Fri', responseTime: 128, throughput: 1720, errors: 4, uptime: 100 },
    { name: 'Sat', responseTime: 132, throughput: 1890, errors: 9, uptime: 99.8 },
    { name: 'Sun', responseTime: 125, throughput: 1650, errors: 3, uptime: 100 }
  ];

  const usageByProvider = [
    { name: 'Slack', value: 2340, color: '#4A154B', percentage: 28.5 },
    { name: 'Salesforce', value: 1890, color: '#00A1E0', percentage: 23.1 },
    { name: 'GitHub', value: 1560, color: '#181717', percentage: 19.0 },
    { name: 'Google Workspace', value: 1230, color: '#4285F4', percentage: 15.0 },
    { name: 'Trello', value: 890, color: '#0079BF', percentage: 10.9 },
    { name: 'Others', value: 290, color: '#6B7280', percentage: 3.5 }
  ];

  const errorAnalysis = [
    { category: 'Authentication', count: 45, percentage: 32.1, trend: 'down' },
    { category: 'Rate Limiting', count: 38, percentage: 27.1, trend: 'up' },
    { category: 'Network Timeout', count: 28, percentage: 20.0, trend: 'stable' },
    { category: 'Invalid Data', count: 18, percentage: 12.9, trend: 'down' },
    { category: 'Server Error', count: 11, percentage: 7.9, trend: 'down' }
  ];

  const integrationHealth = [
    { id: 'slack', name: 'Slack', status: 'healthy', uptime: 99.9, responseTime: 125, lastCheck: '2025-01-07T10:30:00Z' },
    { id: 'salesforce', name: 'Salesforce', status: 'healthy', uptime: 99.7, responseTime: 156, lastCheck: '2025-01-07T10:29:00Z' },
    { id: 'github', name: 'GitHub', status: 'warning', uptime: 98.5, responseTime: 234, lastCheck: '2025-01-07T10:28:00Z' },
    { id: 'google', name: 'Google Workspace', status: 'healthy', uptime: 99.8, responseTime: 98, lastCheck: '2025-01-07T10:27:00Z' },
    { id: 'trello', name: 'Trello', status: 'healthy', uptime: 99.6, responseTime: 167, lastCheck: '2025-01-07T10:26:00Z' },
    { id: 'hubspot', name: 'HubSpot', status: 'error', uptime: 95.2, responseTime: 456, lastCheck: '2025-01-07T10:25:00Z' }
  ];

  const apiEndpointMetrics = [
    { endpoint: '/api/integrations/sync', calls: 15420, avgTime: 145, errors: 23, successRate: 99.85 },
    { endpoint: '/api/webhooks/handler', calls: 12340, avgTime: 89, errors: 12, successRate: 99.90 },
    { endpoint: '/api/auth/token', calls: 8950, avgTime: 67, errors: 8, successRate: 99.91 },
    { endpoint: '/api/data/transform', calls: 6780, avgTime: 234, errors: 45, successRate: 99.34 },
    { endpoint: '/api/notifications/send', calls: 5670, avgTime: 123, errors: 15, successRate: 99.74 }
  ];

  const geographicUsage = [
    { region: 'North America', users: 4520, percentage: 45.2, growth: 12.5 },
    { region: 'Europe', users: 2890, percentage: 28.9, growth: 8.3 },
    { region: 'Asia Pacific', users: 1670, percentage: 16.7, growth: 23.1 },
    { region: 'South America', users: 560, percentage: 5.6, growth: 15.7 },
    { region: 'Africa', users: 360, percentage: 3.6, growth: 18.9 }
  ];

  useEffect(() => {
    loadAnalyticsData();
    loadPerformanceMetrics();
    loadUsageStats();
    loadRealTimeData();
    
    // Set up real-time updates
    const interval = setInterval(loadRealTimeData, 30000);
    return () => clearInterval(interval);
  }, [timeRange, selectedProvider]);

  const loadAnalyticsData = async () => {
    setAnalyticsData({
      totalIntegrations: 42,
      activeConnections: 1247,
      totalApiCalls: 156780,
      avgResponseTime: 142,
      successRate: 99.2,
      dataTransferred: '2.4TB',
      uptime: 99.8,
      errorRate: 0.8
    });
  };

  const loadPerformanceMetrics = async () => {
    setPerformanceMetrics({
      peakThroughput: 2890,
      avgThroughput: 1580,
      peakResponseTime: 456,
      avgResponseTime: 142,
      totalErrors: 140,
      criticalErrors: 12,
      systemLoad: 68,
      memoryUsage: 72
    });
  };

  const loadUsageStats = async () => {
    setUsageStats({
      dailyActiveUsers: 1247,
      monthlyActiveUsers: 8950,
      topIntegration: 'Slack',
      mostUsedEndpoint: '/api/integrations/sync',
      peakUsageHour: '14:00',
      averageSessionDuration: 485
    });
  };

  const loadRealTimeData = async () => {
    setRealTimeData({
      currentUsers: 342,
      requestsPerMinute: 156,
      currentResponseTime: 125,
      activeConnections: 89,
      queueSize: 23,
      lastUpdated: new Date().toISOString()
    });
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Integrations</p>
                <p className="text-2xl font-bold">{analyticsData.totalIntegrations}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Calls</p>
                <p className="text-2xl font-bold">{analyticsData.totalApiCalls?.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.5% from last week
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{analyticsData.successRate}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.3% improvement
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{analyticsData.avgResponseTime}ms</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -15ms improvement
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Status</CardTitle>
          <CardDescription>Live integration performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{realTimeData.currentUsers}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{realTimeData.requestsPerMinute}</div>
              <div className="text-sm text-muted-foreground">Requests/min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{realTimeData.currentResponseTime}ms</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{realTimeData.activeConnections}</div>
              <div className="text-sm text-muted-foreground">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{realTimeData.queueSize}</div>
              <div className="text-sm text-muted-foreground">Queue Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{analyticsData.uptime}%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Integration performance over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="throughput" fill="#3b82f6" name="Throughput" />
              <Line yAxisId="right" type="monotone" dataKey="responseTime" stroke="#10b981" name="Response Time (ms)" />
              <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#ef4444" name="Errors" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Usage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage by Provider</CardTitle>
            <CardDescription>API calls distribution across integration providers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={usageByProvider}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {usageByProvider.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Analysis</CardTitle>
            <CardDescription>Error distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {errorAnalysis.map(error => (
                <div key={error.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {error.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : error.trend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 bg-gray-400 rounded-full" />
                      )}
                      <span className="font-medium">{error.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium">{error.count}</div>
                      <div className="text-sm text-muted-foreground">{error.percentage}%</div>
                    </div>
                    <Progress value={error.percentage} className="w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peak Throughput</p>
                <p className="text-2xl font-bold">{performanceMetrics.peakThroughput}</p>
                <p className="text-xs text-muted-foreground">requests/min</p>
              </div>
              <Gauge className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Load</p>
                <p className="text-2xl font-bold">{performanceMetrics.systemLoad}%</p>
                <Progress value={performanceMetrics.systemLoad} className="mt-2" />
              </div>
              <Cpu className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
                <p className="text-2xl font-bold">{performanceMetrics.memoryUsage}%</p>
                <Progress value={performanceMetrics.memoryUsage} className="mt-2" />
              </div>
              <Memory className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Errors</p>
                <p className="text-2xl font-bold">{performanceMetrics.criticalErrors}</p>
                <p className="text-xs text-red-600">Requires attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Health Status</CardTitle>
          <CardDescription>Real-time health monitoring for all integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrationHealth.map(integration => (
              <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    integration.status === 'healthy' ? 'bg-green-500' :
                    integration.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <h3 className="font-medium">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Last checked: {new Date(integration.lastCheck).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{integration.uptime}%</div>
                    <div className="text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{integration.responseTime}ms</div>
                    <div className="text-muted-foreground">Response</div>
                  </div>
                  <Badge variant={
                    integration.status === 'healthy' ? 'default' :
                    integration.status === 'warning' ? 'secondary' : 'destructive'
                  }>
                    {integration.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Endpoint Performance */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Performance</CardTitle>
          <CardDescription>Performance metrics for top API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiEndpointMetrics.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium font-mono text-sm">{endpoint.endpoint}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span>{endpoint.calls.toLocaleString()} calls</span>
                    <span>{endpoint.avgTime}ms avg</span>
                    <span>{endpoint.errors} errors</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">{endpoint.successRate}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <Progress value={endpoint.successRate} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsageTab = () => (
    <div className="space-y-6">
      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Active Users</p>
                <p className="text-2xl font-bold">{usageStats.dailyActiveUsers?.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Active Users</p>
                <p className="text-2xl font-bold">{usageStats.monthlyActiveUsers?.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Integration</p>
                <p className="text-2xl font-bold">{usageStats.topIntegration}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peak Usage Hour</p>
                <p className="text-2xl font-bold">{usageStats.peakUsageHour}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Usage Distribution</CardTitle>
          <CardDescription>Integration usage by geographic region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {geographicUsage.map(region => (
              <div key={region.region} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{region.region}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">{region.users.toLocaleString()} users</div>
                    <div className="text-sm text-green-600">+{region.growth}% growth</div>
                  </div>
                  <Progress value={region.percentage} className="w-24" />
                  <span className="text-sm text-muted-foreground w-12">{region.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Usage Patterns</CardTitle>
          <CardDescription>Integration usage throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="throughput" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Create custom analytics reports for your integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select defaultValue="performance">
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance Report</SelectItem>
                  <SelectItem value="usage">Usage Report</SelectItem>
                  <SelectItem value="errors">Error Analysis</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="time-range">Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="format">Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated analytics reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Weekly Performance Report', type: 'Performance', date: '2025-01-07', format: 'PDF', size: '2.4 MB' },
              { name: 'Monthly Usage Analysis', type: 'Usage', date: '2025-01-01', format: 'Excel', size: '1.8 MB' },
              { name: 'Error Analysis Report', type: 'Errors', date: '2024-12-28', format: 'CSV', size: '856 KB' },
              { name: 'Q4 Comprehensive Report', type: 'Comprehensive', date: '2024-12-31', format: 'PDF', size: '5.2 MB' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • Generated on {report.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">{report.format}</div>
                    <div className="text-sm text-muted-foreground">{report.size}</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Pre-configured report templates for common use cases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Executive Summary', description: 'High-level overview for executives', icon: BarChart3 },
              { name: 'Technical Performance', description: 'Detailed technical metrics and analysis', icon: Gauge },
              { name: 'Usage Analytics', description: 'User behavior and usage patterns', icon: Users },
              { name: 'Error Analysis', description: 'Comprehensive error tracking and analysis', icon: AlertTriangle },
              { name: 'SLA Compliance', description: 'Service level agreement compliance report', icon: Shield },
              { name: 'Cost Analysis', description: 'Integration costs and optimization opportunities', icon: TrendingUp }
            ].map((template, index) => {
              const Icon = template.icon;
              return (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3 mb-3">
                    <Icon className="h-8 w-8 text-blue-500" />
                    <h3 className="font-medium">{template.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <Button size="sm" className="w-full">
                    Use Template
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integration Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive performance monitoring and usage analytics for all integrations
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="salesforce">Salesforce</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="google">Google Workspace</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={loadRealTimeData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="performance">
          {renderPerformanceTab()}
        </TabsContent>

        <TabsContent value="usage">
          {renderUsageTab()}
        </TabsContent>

        <TabsContent value="reports">
          {renderReportsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationAnalytics;