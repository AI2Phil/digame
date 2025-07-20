import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Settings,
  Activity,
  TrendingUp,
  Zap,
  Shield,
  Database,
  Globe,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  BarChart3,
  Brain,
  Workflow
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data for 40+ integration providers - moved outside component to prevent re-creation
const integrationProviders = [
  // Communication Tools
  { id: 'slack', name: 'Slack', category: 'communication', status: 'active', tests: 15, passed: 14, failed: 1 },
  { id: 'teams', name: 'Microsoft Teams', category: 'communication', status: 'active', tests: 12, passed: 11, failed: 1 },
  { id: 'discord', name: 'Discord', category: 'communication', status: 'active', tests: 10, passed: 10, failed: 0 },
  { id: 'zoom', name: 'Zoom', category: 'communication', status: 'active', tests: 8, passed: 7, failed: 1 },
  { id: 'webex', name: 'Cisco Webex', category: 'communication', status: 'active', tests: 9, passed: 8, failed: 1 },
  { id: 'mattermost', name: 'Mattermost', category: 'communication', status: 'active', tests: 11, passed: 10, failed: 1 },

  // CRM Systems
  { id: 'salesforce', name: 'Salesforce', category: 'crm', status: 'active', tests: 20, passed: 18, failed: 2 },
  { id: 'hubspot', name: 'HubSpot', category: 'crm', status: 'active', tests: 18, passed: 17, failed: 1 },
  { id: 'pipedrive', name: 'Pipedrive', category: 'crm', status: 'active', tests: 14, passed: 13, failed: 1 },
  { id: 'zoho', name: 'Zoho CRM', category: 'crm', status: 'active', tests: 16, passed: 15, failed: 1 },
  { id: 'freshworks', name: 'Freshworks CRM', category: 'crm', status: 'active', tests: 15, passed: 14, failed: 1 },
  { id: 'airtable', name: 'Airtable', category: 'crm', status: 'active', tests: 12, passed: 11, failed: 1 },
  { id: 'copper', name: 'Copper', category: 'crm', status: 'active', tests: 13, passed: 12, failed: 1 },

  // Project Management
  { id: 'trello', name: 'Trello', category: 'project', status: 'active', tests: 14, passed: 13, failed: 1 },
  { id: 'asana', name: 'Asana', category: 'project', status: 'active', tests: 16, passed: 15, failed: 1 },
  { id: 'monday', name: 'Monday.com', category: 'project', status: 'active', tests: 18, passed: 17, failed: 1 },
  { id: 'jira', name: 'Atlassian Jira', category: 'project', status: 'active', tests: 22, passed: 20, failed: 2 },
  { id: 'notion', name: 'Notion', category: 'project', status: 'active', tests: 15, passed: 14, failed: 1 },
  { id: 'clickup', name: 'ClickUp', category: 'project', status: 'active', tests: 17, passed: 16, failed: 1 },
  { id: 'basecamp', name: 'Basecamp', category: 'project', status: 'active', tests: 12, passed: 11, failed: 1 },
  { id: 'wrike', name: 'Wrike', category: 'project', status: 'active', tests: 14, passed: 13, failed: 1 },

  // Time Tracking
  { id: 'toggl', name: 'Toggl Track', category: 'time', status: 'active', tests: 10, passed: 9, failed: 1 },
  { id: 'harvest', name: 'Harvest', category: 'time', status: 'active', tests: 12, passed: 11, failed: 1 },
  { id: 'clockify', name: 'Clockify', category: 'time', status: 'active', tests: 9, passed: 8, failed: 1 },
  { id: 'rescuetime', name: 'RescueTime', category: 'time', status: 'active', tests: 8, passed: 7, failed: 1 },
  { id: 'timely', name: 'Timely', category: 'time', status: 'active', tests: 11, passed: 10, failed: 1 },
  { id: 'timedoctor', name: 'Time Doctor', category: 'time', status: 'active', tests: 10, passed: 9, failed: 1 },
  { id: 'hubstaff', name: 'Hubstaff', category: 'time', status: 'active', tests: 9, passed: 8, failed: 1 },

  // Learning Platforms
  { id: 'coursera', name: 'Coursera', category: 'learning', status: 'active', tests: 13, passed: 12, failed: 1 },
  { id: 'udemy', name: 'Udemy', category: 'learning', status: 'active', tests: 11, passed: 10, failed: 1 },
  { id: 'linkedin', name: 'LinkedIn Learning', category: 'learning', status: 'active', tests: 14, passed: 13, failed: 1 },
  { id: 'pluralsight', name: 'Pluralsight', category: 'learning', status: 'active', tests: 12, passed: 11, failed: 1 },
  { id: 'skillshare', name: 'Skillshare', category: 'learning', status: 'active', tests: 10, passed: 9, failed: 1 },
  { id: 'udacity', name: 'Udacity', category: 'learning', status: 'active', tests: 13, passed: 12, failed: 1 },
  { id: 'edx', name: 'edX', category: 'learning', status: 'active', tests: 12, passed: 11, failed: 1 },
  { id: 'khan', name: 'Khan Academy', category: 'learning', status: 'active', tests: 9, passed: 8, failed: 1 },

  // Development & Productivity
  { id: 'github', name: 'GitHub', category: 'development', status: 'active', tests: 18, passed: 17, failed: 1 },
  { id: 'gitlab', name: 'GitLab', category: 'development', status: 'active', tests: 16, passed: 15, failed: 1 },
  { id: 'bitbucket', name: 'Bitbucket', category: 'development', status: 'active', tests: 14, passed: 13, failed: 1 },
  { id: 'google', name: 'Google Workspace', category: 'productivity', status: 'active', tests: 20, passed: 19, failed: 1 },
  { id: 'microsoft', name: 'Microsoft 365', category: 'productivity', status: 'active', tests: 22, passed: 21, failed: 1 }
];

const IntegrationTestingSuite = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState({});
  const [runningTests, setRunningTests] = useState(new Set());
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [testFilter, setTestFilter] = useState('all');
  const [testProgress, setTestProgress] = useState(0);
  const [optimizationResults, setOptimizationResults] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});

  const testCategories = [
    { id: 'authentication', name: 'Authentication', icon: Shield, tests: 156, passed: 148, failed: 8 },
    { id: 'connectivity', name: 'Connectivity', icon: Globe, tests: 234, passed: 225, failed: 9 },
    { id: 'data_sync', name: 'Data Sync', icon: Database, tests: 312, passed: 298, failed: 14 },
    { id: 'performance', name: 'Performance', icon: Zap, tests: 189, passed: 182, failed: 7 },
    { id: 'security', name: 'Security', icon: Shield, tests: 145, passed: 140, failed: 5 },
    { id: 'webhooks', name: 'Webhooks', icon: Activity, tests: 98, passed: 94, failed: 4 }
  ];

  const performanceData = [
    { name: 'Jan', responseTime: 245, throughput: 1250, errorRate: 0.8 },
    { name: 'Feb', responseTime: 230, throughput: 1340, errorRate: 0.6 },
    { name: 'Mar', responseTime: 220, throughput: 1420, errorRate: 0.4 },
    { name: 'Apr', responseTime: 210, throughput: 1580, errorRate: 0.3 },
    { name: 'May', responseTime: 195, throughput: 1720, errorRate: 0.2 },
    { name: 'Jun', responseTime: 185, throughput: 1890, errorRate: 0.1 }
  ];

  const optimizationMetrics = [
    { category: 'Communication', before: 245, after: 185, improvement: 24.5 },
    { category: 'CRM', before: 320, after: 220, improvement: 31.3 },
    { category: 'Project Mgmt', before: 280, after: 195, improvement: 30.4 },
    { category: 'Time Tracking', before: 150, after: 120, improvement: 20.0 },
    { category: 'Learning', before: 200, after: 160, improvement: 20.0 },
    { category: 'Development', before: 180, after: 140, improvement: 22.2 }
  ];

  const loadTestResults = useCallback(async () => {
    // Simulate loading test results
    const results = {};
    integrationProviders.forEach(provider => {
      results[provider.id] = {
        overall: provider.passed / provider.tests,
        categories: {
          authentication: Math.random() > 0.1,
          connectivity: Math.random() > 0.05,
          data_sync: Math.random() > 0.15,
          performance: Math.random() > 0.08,
          security: Math.random() > 0.03,
          webhooks: Math.random() > 0.12
        },
        lastRun: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        responseTime: 150 + Math.random() * 200,
        throughput: 800 + Math.random() * 1000,
        errorRate: Math.random() * 2
      };
    });
    setTestResults(results);
  }, []);

  const loadPerformanceMetrics = useCallback(async () => {
    setPerformanceMetrics({
      totalTests: 1134,
      passedTests: 1087,
      failedTests: 47,
      successRate: 95.9,
      avgResponseTime: 198,
      totalThroughput: 15420,
      avgErrorRate: 0.3
    });
  }, []);

  const loadOptimizationResults = useCallback(async () => {
    setOptimizationResults({
      totalOptimizations: 156,
      performanceGains: 26.8,
      errorReduction: 45.2,
      throughputIncrease: 34.7
    });
  }, []);

  useEffect(() => {
    loadTestResults();
    loadPerformanceMetrics();
    loadOptimizationResults();
  }, [loadTestResults, loadPerformanceMetrics, loadOptimizationResults]);

  const runAllTests = useCallback(async () => {
    setTestProgress(0);
    const providers = selectedProvider === 'all' ? integrationProviders : integrationProviders.filter(p => p.id === selectedProvider);
    
    for (let i = 0; i < providers.length; i++) {
      setRunningTests(prev => new Set([...prev, providers[i].id]));
      
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(providers[i].id);
        return newSet;
      });
      
      setTestProgress(((i + 1) / providers.length) * 100);
    }
    
    await loadTestResults();
  }, [selectedProvider, loadTestResults]);

  const runOptimization = useCallback(async () => {
    setTestProgress(0);
    
    // Simulate optimization process
    for (let i = 0; i <= 100; i += 10) {
      setTestProgress(i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    await loadOptimizationResults();
    await loadPerformanceMetrics();
  }, [loadOptimizationResults, loadPerformanceMetrics]);

  const filteredProviders = useMemo(() => {
    return integrationProviders.filter(provider => {
      if (selectedProvider !== 'all' && provider.id !== selectedProvider) return false;
      if (testFilter === 'passed' && provider.failed > 0) return false;
      if (testFilter === 'failed' && provider.failed === 0) return false;
      return true;
    });
  }, [selectedProvider, testFilter]);

  const overallStats = useMemo(() => {
    const totalTests = integrationProviders.reduce((sum, p) => sum + p.tests, 0);
    const totalPassed = integrationProviders.reduce((sum, p) => sum + p.passed, 0);
    const totalFailed = integrationProviders.reduce((sum, p) => sum + p.failed, 0);
    
    return {
      totalProviders: integrationProviders.length,
      totalTests,
      totalPassed,
      totalFailed,
      successRate: (totalPassed / totalTests) * 100
    };
  }, []);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Providers</p>
                <p className="text-2xl font-bold">{overallStats.totalProviders}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{overallStats.successRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{overallStats.totalTests.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{performanceMetrics.avgResponseTime}ms</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Test Categories Overview</CardTitle>
          <CardDescription>Performance across different test categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testCategories.map(category => {
              const Icon = category.icon;
              const successRate = (category.passed / category.tests) * 100;
              
              return (
                <div key={category.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Icon className="h-8 w-8 text-blue-500" />
                  <div className="flex-1">
                    <h3 className="font-medium">{category.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Progress value={successRate} className="flex-1" />
                      <span className="text-sm text-muted-foreground">{successRate.toFixed(1)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.passed}/{category.tests} tests passed
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Integration performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke="#3b82f6" name="Response Time (ms)" />
              <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#10b981" name="Throughput (req/min)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderTestingTab = () => (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Execution Controls</CardTitle>
          <CardDescription>Run comprehensive tests across integration providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="provider-select">Select Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {integrationProviders.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="filter-select">Filter Results</Label>
              <Select value={testFilter} onValueChange={setTestFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter tests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tests</SelectItem>
                  <SelectItem value="passed">Passed Only</SelectItem>
                  <SelectItem value="failed">Failed Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end space-x-2">
              <Button onClick={runAllTests} disabled={runningTests.size > 0}>
                <Play className="h-4 w-4 mr-2" />
                Run Tests
              </Button>
              <Button variant="outline" onClick={loadTestResults}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {testProgress > 0 && testProgress < 100 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Running Tests...</span>
                <span className="text-sm text-muted-foreground">{testProgress.toFixed(0)}%</span>
              </div>
              <Progress value={testProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Test Results</CardTitle>
          <CardDescription>Detailed test results for each integration provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProviders.map(provider => {
              const result = testResults[provider.id];
              const isRunning = runningTests.has(provider.id);
              const successRate = (provider.passed / provider.tests) * 100;
              
              return (
                <div key={provider.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{provider.name}</h3>
                        <Badge variant={provider.category === 'communication' ? 'default' : 
                                      provider.category === 'crm' ? 'secondary' :
                                      provider.category === 'project' ? 'outline' : 'destructive'}>
                          {provider.category}
                        </Badge>
                      </div>
                      {isRunning && <Clock className="h-4 w-4 animate-spin text-blue-500" />}
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{successRate.toFixed(1)}% Success</p>
                        <p className="text-xs text-muted-foreground">
                          {provider.passed}/{provider.tests} tests
                        </p>
                      </div>
                      {provider.failed === 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <Progress value={successRate} className="mb-3" />
                  
                  {result && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                      {Object.entries(result.categories).map(([category, passed]) => (
                        <div key={category} className="flex items-center space-x-1">
                          {passed ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className="capitalize">{category.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOptimizationTab = () => (
    <div className="space-y-6">
      {/* Optimization Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Optimization</CardTitle>
          <CardDescription>Optimize integration performance and reduce errors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Button onClick={runOptimization} disabled={testProgress > 0 && testProgress < 100}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Run Optimization
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          {testProgress > 0 && testProgress < 100 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Optimizing Performance...</span>
                <span className="text-sm text-muted-foreground">{testProgress.toFixed(0)}%</span>
              </div>
              <Progress value={testProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Optimizations</p>
                <p className="text-2xl font-bold">{optimizationResults.totalOptimizations}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance Gains</p>
                <p className="text-2xl font-bold">+{optimizationResults.performanceGains}%</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Reduction</p>
                <p className="text-2xl font-bold">-{optimizationResults.errorReduction}%</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Throughput Increase</p>
                <p className="text-2xl font-bold">+{optimizationResults.throughputIncrease}%</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Optimization Results */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Results by Category</CardTitle>
          <CardDescription>Performance improvements across integration categories</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={optimizationMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="before" fill="#ef4444" name="Before (ms)" />
              <Bar dataKey="after" fill="#10b981" name="After (ms)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Integrations</p>
                <p className="text-2xl font-bold">{integrationProviders.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Synced</p>
                <p className="text-2xl font-bold">2.4M</p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Calls</p>
                <p className="text-2xl font-bold">156K</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">99.8%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Usage Analytics</CardTitle>
          <CardDescription>Performance and usage metrics across all integrations</CardDescription>
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

      {/* Provider Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Integrations</CardTitle>
          <CardDescription>Best performing integration providers by success rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrationProviders
              .sort((a, b) => (b.passed / b.tests) - (a.passed / a.tests))
              .slice(0, 10)
              .map((provider, index) => {
                const successRate = (provider.passed / provider.tests) * 100;
                return (
                  <div key={provider.id} className="flex items-center space-x-4">
                    <div className="w-8 text-center">
                      <span className="text-sm font-medium">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{provider.name}</span>
                        <span className="text-sm text-muted-foreground">{successRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={successRate} className="h-2" />
                    </div>
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
        <h1 className="text-3xl font-bold">Integration Testing Suite</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive testing and optimization for 40+ integration providers
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="testing">
          {renderTestingTab()}
        </TabsContent>

        <TabsContent value="optimization">
          {renderOptimizationTab()}
        </TabsContent>

        <TabsContent value="analytics">
          {renderAnalyticsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

