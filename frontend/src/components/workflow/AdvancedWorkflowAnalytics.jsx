import React, { useState, useEffect, useCallback } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Brain,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Filter,
  Search,
  Lightbulb,
  Rocket,
  Network,
  Target,
  Award,
  Star,
  Users,
  Calendar,
  Database,
  Cpu,
  Memory,
  HardDrive,
  Wifi,
  Server,
  Monitor,
  Gauge,
  LineChart,
  PieChart
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  Treemap
} from 'recharts';

const AdvancedWorkflowAnalytics = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedWorkflow, setSelectedWorkflow] = useState('all');
  const [workflowMetrics, setWorkflowMetrics] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [bottleneckAnalysis, setBottleneckAnalysis] = useState([]);
  const [resourceUtilization, setResourceUtilization] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock workflow performance data
  const workflowPerformanceData = [
    { time: '00:00', executions: 45, success: 42, failed: 3, avgDuration: 2.3, throughput: 18.5 },
    { time: '04:00', executions: 38, success: 36, failed: 2, avgDuration: 2.1, throughput: 17.2 },
    { time: '08:00', executions: 67, success: 63, failed: 4, avgDuration: 2.8, throughput: 23.9 },
    { time: '12:00', executions: 89, success: 84, failed: 5, avgDuration: 3.2, throughput: 27.8 },
    { time: '16:00', executions: 76, success: 71, failed: 5, avgDuration: 2.9, throughput: 26.2 },
    { time: '20:00', executions: 54, success: 51, failed: 3, avgDuration: 2.4, throughput: 22.5 }
  ];

  const bottleneckData = [
    {
      id: 'workflow-001',
      name: 'User Onboarding Flow',
      avgDuration: 4.2,
      bottleneckStep: 'Email Verification',
      stepDuration: 2.8,
      impact: 'High',
      suggestions: [
        'Implement async email verification',
        'Add SMS backup verification',
        'Optimize email template loading'
      ],
      confidence: 0.94,
      frequency: 156,
      trend: 'increasing'
    },
    {
      id: 'workflow-002',
      name: 'Data Processing Pipeline',
      avgDuration: 6.7,
      bottleneckStep: 'Data Validation',
      stepDuration: 4.1,
      impact: 'High',
      suggestions: [
        'Implement parallel validation',
        'Cache validation rules',
        'Optimize database queries'
      ],
      confidence: 0.89,
      frequency: 89,
      trend: 'stable'
    },
    {
      id: 'workflow-003',
      name: 'Report Generation',
      avgDuration: 3.8,
      bottleneckStep: 'PDF Creation',
      stepDuration: 2.2,
      impact: 'Medium',
      suggestions: [
        'Use PDF generation service',
        'Implement template caching',
        'Optimize image processing'
      ],
      confidence: 0.87,
      frequency: 234,
      trend: 'decreasing'
    }
  ];

  const resourceUtilizationData = [
    { resource: 'CPU', current: 68, average: 72, peak: 89, trend: 'stable' },
    { resource: 'Memory', current: 74, average: 71, peak: 92, trend: 'increasing' },
    { resource: 'Database', current: 45, average: 52, peak: 78, trend: 'decreasing' },
    { resource: 'Network', current: 34, average: 41, peak: 67, trend: 'stable' },
    { resource: 'Storage', current: 28, average: 31, peak: 45, trend: 'stable' }
  ];

  const workflowSuccessRates = [
    { name: 'User Onboarding', success: 94.2, total: 1247, category: 'User Management' },
    { name: 'Data Processing', success: 91.7, total: 856, category: 'Data Operations' },
    { name: 'Report Generation', success: 96.8, total: 2341, category: 'Reporting' },
    { name: 'Email Campaigns', success: 89.3, total: 567, category: 'Marketing' },
    { name: 'Backup Operations', success: 98.1, total: 145, category: 'System' },
    { name: 'Integration Sync', success: 87.6, total: 423, category: 'Integrations' }
  ];

  const realTimeMetrics = {
    activeWorkflows: 23,
    queuedExecutions: 156,
    avgExecutionTime: 2.8,
    successRate: 93.4,
    throughput: 245,
    errorRate: 6.6,
    resourceEfficiency: 87.2,
    costPerExecution: 0.034
  };

  useEffect(() => {
    setWorkflowMetrics(workflowPerformanceData);
    setPerformanceData(workflowPerformanceData);
    setBottleneckAnalysis(bottleneckData);
    setResourceUtilization(resourceUtilizationData);
    loadWorkflowAnalytics();
  }, [selectedTimeRange, selectedWorkflow]);

  const loadWorkflowAnalytics = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const refreshAnalytics = useCallback(async () => {
    setIsLoading(true);
    // Simulate real-time data refresh
    setTimeout(() => {
      setIsLoading(false);
      // Update metrics with slight variations
      setWorkflowMetrics(prev => prev.map(metric => ({
        ...metric,
        executions: metric.executions + Math.floor(Math.random() * 10 - 5),
        throughput: metric.throughput + Math.random() * 4 - 2
      })));
    }, 1000);
  }, []);

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Real-time Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold">{realTimeMetrics.activeWorkflows}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{realTimeMetrics.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Execution Time</p>
                <p className="text-2xl font-bold">{realTimeMetrics.avgExecutionTime}s</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Throughput</p>
                <p className="text-2xl font-bold">{realTimeMetrics.throughput}/min</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Execution Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Execution Trends</CardTitle>
          <CardDescription>Real-time workflow performance metrics and execution patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="executions" fill="#8884d8" name="Total Executions" />
              <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#82ca9d" strokeWidth={2} name="Throughput (exec/min)" />
              <Line yAxisId="right" type="monotone" dataKey="avgDuration" stroke="#ffc658" strokeWidth={2} name="Avg Duration (s)" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Success Rate Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Success Rate Analysis</CardTitle>
          <CardDescription>Success rates and execution volumes by workflow type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSuccessRates.map((workflow, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{workflow.name}</h3>
                    <p className="text-sm text-muted-foreground">{workflow.category} • {workflow.total} executions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">{workflow.success}%</p>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </div>
                  <Progress value={workflow.success} className="w-20" />
                  <Badge variant={workflow.success > 95 ? 'default' : workflow.success > 90 ? 'secondary' : 'destructive'}>
                    {workflow.success > 95 ? 'Excellent' : workflow.success > 90 ? 'Good' : 'Needs Attention'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBottleneckTab = () => (
    <div className="space-y-6">
      {/* Bottleneck Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Identified Bottlenecks</p>
                <p className="text-2xl font-bold">{bottleneckAnalysis.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Impact Reduction</p>
                <p className="text-2xl font-bold">34.2%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Confidence</p>
                <p className="text-2xl font-bold">90.0%</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Optimization Potential</p>
                <p className="text-2xl font-bold">2.8s</p>
              </div>
              <Rocket className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Bottleneck Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Bottleneck Analysis</CardTitle>
          <CardDescription>Intelligent identification of workflow inefficiencies and optimization recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bottleneckAnalysis.map(bottleneck => (
              <div key={bottleneck.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{bottleneck.name}</h3>
                      <p className="text-sm text-muted-foreground">Bottleneck: {bottleneck.bottleneckStep}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={bottleneck.impact === 'High' ? 'destructive' : 'secondary'}>
                      {bottleneck.impact} Impact
                    </Badge>
                    <Badge variant="outline">
                      {(bottleneck.confidence * 100).toFixed(1)}% confidence
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground">Avg Duration</p>
                    <p className="font-medium">{bottleneck.avgDuration}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Step Duration</p>
                    <p className="font-medium">{bottleneck.stepDuration}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Frequency</p>
                    <p className="font-medium">{bottleneck.frequency} times</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Trend</p>
                    <p className="font-medium flex items-center">
                      {bottleneck.trend === 'increasing' ? (
                        <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
                      ) : bottleneck.trend === 'decreasing' ? (
                        <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <Activity className="h-3 w-3 mr-1 text-blue-500" />
                      )}
                      {bottleneck.trend}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Brain className="h-4 w-4 mr-1 text-purple-500" />
                    AI Optimization Suggestions:
                  </h4>
                  <ul className="space-y-1">
                    {bottleneck.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center">
                        <Lightbulb className="h-3 w-3 mr-2 text-yellow-500" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between pt-3 mt-3 border-t">
                  <div className="text-sm">
                    <span className="font-medium">Potential Time Savings:</span> {(bottleneck.stepDuration * 0.6).toFixed(1)}s per execution
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm">
                      <Rocket className="h-4 w-4 mr-2" />
                      Apply Optimization
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResourceTab = () => (
    <div className="space-y-6">
      {/* Resource Utilization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resource Efficiency</p>
                <p className="text-2xl font-bold">{realTimeMetrics.resourceEfficiency}%</p>
              </div>
              <Gauge className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost per Execution</p>
                <p className="text-2xl font-bold">${realTimeMetrics.costPerExecution}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Queued Executions</p>
                <p className="text-2xl font-bold">{realTimeMetrics.queuedExecutions}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{realTimeMetrics.errorRate}%</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Utilization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Utilization Monitoring</CardTitle>
          <CardDescription>Real-time monitoring of workflow resource consumption and optimization opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resourceUtilization.map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {resource.resource === 'CPU' && <Cpu className="h-6 w-6 text-blue-600" />}
                    {resource.resource === 'Memory' && <Memory className="h-6 w-6 text-blue-600" />}
                    {resource.resource === 'Database' && <Database className="h-6 w-6 text-blue-600" />}
                    {resource.resource === 'Network' && <Wifi className="h-6 w-6 text-blue-600" />}
                    {resource.resource === 'Storage' && <HardDrive className="h-6 w-6 text-blue-600" />}
                  </div>
                  <div>
                    <h3 className="font-medium">{resource.resource}</h3>
                    <p className="text-sm text-muted-foreground">
                      Avg: {resource.average}% • Peak: {resource.peak}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">{resource.current}%</p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      {resource.trend === 'increasing' ? (
                        <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
                      ) : resource.trend === 'decreasing' ? (
                        <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <Activity className="h-3 w-3 mr-1 text-blue-500" />
                      )}
                      {resource.trend}
                    </p>
                  </div>
                  <Progress value={resource.current} className="w-24" />
                  <Badge variant={resource.current > 80 ? 'destructive' : resource.current > 60 ? 'secondary' : 'default'}>
                    {resource.current > 80 ? 'High' : resource.current > 60 ? 'Medium' : 'Low'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Resource Optimization</CardTitle>
          <CardDescription>Intelligent recommendations for resource efficiency improvements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Memory Optimization Opportunity</h3>
                    <p className="text-sm text-muted-foreground">Confidence: 92.4%</p>
                  </div>
                </div>
                <Badge variant="default">High Impact</Badge>
              </div>
              <p className="text-sm mb-3">
                AI analysis indicates memory usage can be reduced by 23% through workflow step consolidation and caching optimization.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Estimated Savings:</span> $127/month in infrastructure costs
                </div>
                <Button size="sm">
                  <Rocket className="h-4 w-4 mr-2" />
                  Apply Optimization
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Database Query Optimization</h3>
                    <p className="text-sm text-muted-foreground">Confidence: 87.8%</p>
                  </div>
                </div>
                <Badge variant="secondary">Medium Impact</Badge>
              </div>
              <p className="text-sm mb-3">
                Database utilization can be improved by implementing query result caching and optimizing join operations in workflow steps.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Performance Gain:</span> 34% faster query execution
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* AI Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Insights Generated</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Optimization Applied</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">89.7%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance Gain</p>
                <p className="text-2xl font-bold">+28.4%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Predictive Workflow Analytics</CardTitle>
          <CardDescription>AI-powered predictions and trend analysis for workflow optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Workflow Load Prediction</h3>
                    <p className="text-sm text-muted-foreground">Next 7 days forecast</p>
                  </div>
                </div>
                <Badge variant="default">94.2% Confidence</Badge>
              </div>
              <p className="text-sm mb-3">
                AI predicts a 34% increase in workflow executions during peak hours (2-4 PM) next week. Recommend scaling resources proactively.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Recommended Action:</span> Scale up 2 additional workers
                </div>
                <Button size="sm">
                  <Rocket className="h-4 w-4 mr-2" />
                  Auto-Scale
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Performance Trend Analysis</h3>
                    <p className="text-sm text-muted-foreground">30-day trend projection</p>
                  </div>
                </div>
                <Badge variant="secondary">87.8% Confidence</Badge>
              </div>
              <p className="text-sm mb-3">
                Current optimization trends suggest 15% improvement in overall workflow efficiency by month-end with continued AI-driven optimizations.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Projected Savings:</span> $2,340/month in operational costs
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Projection
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Workflow Analytics</h1>
          <p className="text-muted-foreground">
            Real-time workflow performance metrics, bottleneck analysis, and AI-powered optimization insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
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
          <Button onClick={refreshAnalytics} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {renderPerformanceTab()}
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          {renderBottleneckTab()}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {renderResourceTab()}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {renderInsightsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

