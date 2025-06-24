import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Activity, TrendingUp, Clock, AlertTriangle, CheckCircle, 
  XCircle, Pause, Play, RefreshCw, Search, Filter,
  BarChart3, PieChart, Calendar, Download, Eye,
  Zap, Users, Database, Settings
} from 'lucide-react';
import { 
  workflowAutomationApi, 
  WorkflowInstance, 
  AutomationRule, 
  WorkflowAnalytics,
  WorkflowStepExecution 
} from '../../services/api/workflowAutomation';

interface MonitoringDashboardProps {
  refreshInterval?: number;
}

interface DashboardStats {
  totalInstances: number;
  activeInstances: number;
  completedInstances: number;
  failedInstances: number;
  totalRules: number;
  activeRules: number;
  avgExecutionTime: number;
  successRate: number;
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-blue-100 text-blue-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

const STATUS_ICONS = {
  draft: <Clock className="h-4 w-4" />,
  active: <Play className="h-4 w-4" />,
  paused: <Pause className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  failed: <XCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />
};

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  refreshInterval = 30000 // 30 seconds default
}) => {
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [analytics, setAnalytics] = useState<WorkflowAnalytics | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalInstances: 0,
    activeInstances: 0,
    completedInstances: 0,
    failedInstances: 0,
    totalRules: 0,
    activeRules: 0,
    avgExecutionTime: 0,
    successRate: 0
  });
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [instanceSteps, setInstanceSteps] = useState<WorkflowStepExecution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    if (selectedInstance) {
      loadInstanceSteps(selectedInstance.id);
    }
  }, [selectedInstance]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [instancesData, rulesData, analyticsData] = await Promise.all([
        workflowAutomationApi.getWorkflowInstances(),
        workflowAutomationApi.getAutomationRules(),
        workflowAutomationApi.getWorkflowAnalytics()
      ]);

      setInstances(instancesData);
      setRules(rulesData);
      setAnalytics(analyticsData);
      calculateStats(instancesData, rulesData, analyticsData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInstanceSteps = async (instanceId: number) => {
    try {
      const steps = await workflowAutomationApi.getWorkflowInstanceSteps(instanceId);
      setInstanceSteps(steps);
    } catch (err) {
      console.error('Error loading instance steps:', err);
    }
  };

  const calculateStats = (
    instancesData: WorkflowInstance[], 
    rulesData: AutomationRule[], 
    analyticsData: WorkflowAnalytics
  ) => {
    const totalInstances = instancesData.length;
    const activeInstances = instancesData.filter(i => i.status === 'active').length;
    const completedInstances = instancesData.filter(i => i.status === 'completed').length;
    const failedInstances = instancesData.filter(i => i.status === 'failed').length;
    const totalRules = rulesData.length;
    const activeRules = rulesData.filter(r => r.is_active).length;

    setStats({
      totalInstances,
      activeInstances,
      completedInstances,
      failedInstances,
      totalRules,
      activeRules,
      avgExecutionTime: analyticsData.performance.avg_execution_duration_minutes,
      successRate: analyticsData.workflow_instances.success_rate
    });
  };

  const handleExecuteInstance = async (instanceId: number) => {
    try {
      await workflowAutomationApi.executeWorkflowInstance(instanceId);
      await loadDashboardData();
    } catch (err) {
      setError('Failed to execute workflow instance');
      console.error('Error executing instance:', err);
    }
  };

  const filteredInstances = instances.filter(instance => {
    const matchesSearch = instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (instance.description && instance.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || instance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  if (isLoading && instances.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading monitoring dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workflow Monitoring</h1>
          <p className="text-gray-600">Real-time monitoring and analytics for workflow automation</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" onClick={loadDashboardData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Instances</p>
                <p className="text-2xl font-bold">{stats.totalInstances}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {stats.activeInstances} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {stats.completedInstances} completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold">{stats.avgExecutionTime.toFixed(1)}m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Per workflow
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold">{stats.activeRules}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              of {stats.totalRules} total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="instances">Instances</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Instances */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Workflow Instances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {instances.slice(0, 5).map(instance => (
                    <div key={instance.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {STATUS_ICONS[instance.status]}
                        <div>
                          <p className="font-medium">{instance.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(instance.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={STATUS_COLORS[instance.status]}
                          icon={STATUS_ICONS[instance.status]}
                          onRemove={() => {}}
                        >
                          {instance.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInstance(instance)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Active Automation Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rules.filter(r => r.is_active).slice(0, 5).map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-gray-600">
                          {rule.trigger_type} • {rule.total_executions} executions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{rule.success_rate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">success rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="instances" className="space-y-6">
          {/* Filters */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search instances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Instances Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInstances.map(instance => (
                      <tr key={instance.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {instance.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {instance.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant="outline" 
                            className={STATUS_COLORS[instance.status]}
                            icon={STATUS_ICONS[instance.status]}
                            onRemove={() => {}}
                          >
                            {instance.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(instance.progress_percentage)}`}
                              style={{ width: `${instance.progress_percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {instance.steps_completed}/{instance.steps_total} steps
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {instance.execution_duration ? formatDuration(instance.execution_duration) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(instance.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInstance(instance)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {instance.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExecuteInstance(instance.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map(rule => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-gray-600">{rule.trigger_type}</p>
                      </div>
                      <Badge 
                        variant={rule.is_active ? 'success' : 'secondary'}
                        icon={rule.is_active ? <CheckCircle className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                        onRemove={() => {}}
                      >
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Executions</p>
                        <p className="font-medium">{rule.total_executions}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Success Rate</p>
                        <p className="font-medium">{rule.success_rate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Duration</p>
                        <p className="font-medium">{rule.avg_execution_time.toFixed(1)}s</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Execution</p>
                        <p className="font-medium">
                          {rule.last_execution ? formatDateTime(rule.last_execution) : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Instances:</span>
                      <span className="font-medium">{analytics.workflow_instances.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-medium text-green-600">{analytics.workflow_instances.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span className="font-medium text-red-600">{analytics.workflow_instances.failed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">{analytics.workflow_instances.success_rate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Automation Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Executions:</span>
                      <span className="font-medium">{analytics.automation_rules.total_executions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Successful:</span>
                      <span className="font-medium text-green-600">{analytics.automation_rules.successful_executions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">{analytics.automation_rules.success_rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Duration:</span>
                      <span className="font-medium">{analytics.performance.avg_execution_duration_minutes.toFixed(1)}m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Instance Detail Modal */}
      {selectedInstance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{selectedInstance.name}</h2>
              <Button variant="outline" onClick={() => setSelectedInstance(null)}>
                ×
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium mb-2">Instance Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge 
                      variant="outline" 
                      className={STATUS_COLORS[selectedInstance.status]}
                      icon={STATUS_ICONS[selectedInstance.status]}
                      onRemove={() => {}}
                    >
                      {selectedInstance.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Progress:</span>
                    <span>{selectedInstance.progress_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Steps:</span>
                    <span>{selectedInstance.steps_completed}/{selectedInstance.steps_total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{selectedInstance.execution_duration ? formatDuration(selectedInstance.execution_duration) : '-'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Execution Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{formatDateTime(selectedInstance.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Started:</span>
                    <span>{selectedInstance.execution_start_time ? formatDateTime(selectedInstance.execution_start_time) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Errors:</span>
                    <span>{selectedInstance.error_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retries:</span>
                    <span>{selectedInstance.retry_count}/{selectedInstance.max_retries}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step Executions */}
            <div>
              <h3 className="font-medium mb-4">Step Executions</h3>
              <div className="space-y-2">
                {instanceSteps.map(step => (
                  <div key={step.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{step.step_name}</p>
                        <p className="text-sm text-gray-600">{step.step_type}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={STATUS_COLORS[step.status] || 'bg-gray-100 text-gray-800'}
                          icon={STATUS_ICONS[step.status] || <Clock className="h-4 w-4" />}
                          onRemove={() => {}}
                        >
                          {step.status}
                        </Badge>
                        {step.execution_duration && (
                          <span className="text-sm text-gray-600">
                            {formatDuration(step.execution_duration)}
                          </span>
                        )}
                      </div>
                    </div>
                    {step.error_message && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        {step.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringDashboard;