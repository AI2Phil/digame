import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Play, Pause, Square, Settings, Plus, Edit3, Trash2,
  Clock, CheckCircle, AlertCircle, Activity, Users,
  Zap, BarChart3, Calendar, Filter, Search, Download,
  RefreshCw, Eye, ArrowRight, Copy, Share2
} from 'lucide-react';
import { WorkflowVisualDesigner } from './WorkflowVisualDesigner';
import { WorkflowDefinition, WorkflowStep } from '../../services/api/workflowAutomation';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  steps_count: number;
  usage_count: number;
  created_at: string;
  created_by: string;
  is_public: boolean;
  tags: string[];
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  started_at: string;
  completed_at?: string;
  duration?: number;
  current_step?: string;
  progress: number;
  error_message?: string;
  triggered_by: string;
  context: Record<string, any>;
}

interface WorkflowMetrics {
  total_workflows: number;
  active_workflows: number;
  total_executions_today: number;
  successful_executions: number;
  failed_executions: number;
  average_execution_time: number;
  most_used_templates: Array<{
    template_id: string;
    name: string;
    usage_count: number;
  }>;
  execution_trends: Array<{
    date: string;
    executions: number;
    success_rate: number;
  }>;
}

interface ExtendedWorkflowDefinition extends WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: string;
    config: Record<string, any>;
  };
  variables: Record<string, any>;
  settings: {
    timeout: number;
    retry_count: number;
    notification_settings: Record<string, any>;
  };
}

export const WorkflowAutomationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'executions' | 'designer'>('overview');
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ExtendedWorkflowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [workflowsRes, executionsRes, metricsRes] = await Promise.all([
        fetch('/api/workflow/templates', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/workflow/executions?limit=50', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/workflow/metrics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (workflowsRes.ok) {
        const workflowsData = await workflowsRes.json();
        setWorkflows(workflowsData.templates || []);
      }

      if (executionsRes.ok) {
        const executionsData = await executionsRes.json();
        setExecutions(executionsData.executions || []);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowAction = async (workflowId: string, action: string) => {
    try {
      const response = await fetch(`/api/workflow/${workflowId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error(`Failed to ${action} workflow:`, err);
    }
  };

  const handleExecutionAction = async (executionId: string, action: string) => {
    try {
      const response = await fetch(`/api/workflow/executions/${executionId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error(`Failed to ${action} execution:`, err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'paused': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return Activity;
      case 'completed': return CheckCircle;
      case 'failed': return AlertCircle;
      case 'paused': return Pause;
      default: return Clock;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = searchTerm === '' || 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredExecutions = executions.filter(execution => {
    const matchesStatus = filterStatus === 'all' || execution.status === filterStatus;
    return matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            Workflow Automation
          </h1>
          <p className="text-gray-600 mt-1">Design, deploy, and monitor automated workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setActiveTab('designer')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'templates', label: 'Templates', icon: Settings },
            { key: 'executions', label: 'Executions', icon: Activity },
            { key: 'designer', label: 'Designer', icon: Edit3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Total Workflows',
                value: metrics.total_workflows,
                icon: Settings,
                color: 'blue',
              },
              {
                title: 'Active Workflows',
                value: metrics.active_workflows,
                icon: Activity,
                color: 'green',
              },
              {
                title: 'Executions Today',
                value: metrics.total_executions_today,
                icon: Play,
                color: 'purple',
              },
              {
                title: 'Success Rate',
                value: `${((metrics.successful_executions / (metrics.successful_executions + metrics.failed_executions)) * 100).toFixed(1)}%`,
                icon: CheckCircle,
                color: 'green',
              },
            ].map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-${metric.color}-100`}>
                      <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Most Used Templates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Used Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.most_used_templates.map((template, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{template.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(template.usage_count / Math.max(...metrics.most_used_templates.map(t => t.usage_count))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{template.usage_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {executions.slice(0, 5).map((execution) => {
                    const StatusIcon = getStatusIcon(execution.status);
                    return (
                      <div key={execution.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`h-4 w-4 ${
                            execution.status === 'completed' ? 'text-green-600' :
                            execution.status === 'failed' ? 'text-red-600' :
                            execution.status === 'running' ? 'text-yellow-600' :
                            'text-gray-600'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{execution.workflow_name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(execution.started_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={getStatusColor(execution.status)}
                          size="sm"
                          icon={null}
                          onRemove={() => {}}
                        >
                          {execution.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search workflows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="data_processing">Data Processing</option>
                  <option value="notifications">Notifications</option>
                  <option value="integrations">Integrations</option>
                  <option value="approvals">Approvals</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{workflow.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{workflow.description}</p>
                    </div>
                    {workflow.is_public && (
                      <Badge variant="info" size="xs" icon={null} onRemove={() => {}}>
                        Public
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" size="xs" icon={null} onRemove={() => {}}>
                      {workflow.category}
                    </Badge>
                    <Badge variant="outline" size="xs" icon={null} onRemove={() => {}}>
                      {workflow.trigger_type}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{workflow.steps_count} steps</span>
                    <span>{workflow.usage_count} uses</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleWorkflowAction(workflow.id, 'run')}>
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('designer')}>
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Executions Tab */}
      {activeTab === 'executions' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="paused">Paused</option>
                </select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Executions Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Workflow</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Progress</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Duration</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Started</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExecutions.map((execution) => {
                      const StatusIcon = getStatusIcon(execution.status);
                      return (
                        <tr key={execution.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{execution.workflow_name}</p>
                              <p className="text-xs text-gray-500">ID: {execution.id.slice(0, 8)}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`h-4 w-4 ${
                                execution.status === 'completed' ? 'text-green-600' :
                                execution.status === 'failed' ? 'text-red-600' :
                                execution.status === 'running' ? 'text-yellow-600' :
                                'text-gray-600'
                              }`} />
                              <Badge 
                                variant={getStatusColor(execution.status)}
                                size="sm"
                                icon={null}
                                onRemove={() => {}}
                              >
                                {execution.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-24">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    execution.status === 'completed' ? 'bg-green-600' :
                                    execution.status === 'failed' ? 'bg-red-600' :
                                    'bg-blue-600'
                                  }`}
                                  style={{ width: `${execution.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{execution.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {execution.duration ? formatDuration(execution.duration) : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(execution.started_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              {execution.status === 'running' && (
                                <Button variant="outline" size="sm" onClick={() => handleExecutionAction(execution.id, 'pause')}>
                                  <Pause className="h-3 w-3" />
                                </Button>
                              )}
                              {execution.status === 'paused' && (
                                <Button variant="outline" size="sm" onClick={() => handleExecutionAction(execution.id, 'resume')}>
                                  <Play className="h-3 w-3" />
                                </Button>
                              )}
                              {(execution.status === 'running' || execution.status === 'paused') && (
                                <Button variant="outline" size="sm" onClick={() => handleExecutionAction(execution.id, 'stop')}>
                                  <Square className="h-3 w-3" />
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Designer Tab */}
      {activeTab === 'designer' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Designer</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedWorkflow ? (
                <WorkflowVisualDesigner
                  workflowDefinition={{
                    start_step: selectedWorkflow.start_step,
                    steps: selectedWorkflow.steps,
                    variables: selectedWorkflow.variables,
                    settings: selectedWorkflow.settings
                  }}
                  onWorkflowChange={(definition) => {
                    setSelectedWorkflow({
                      ...selectedWorkflow,
                      start_step: definition.start_step,
                      steps: definition.steps,
                      variables: definition.variables || {},
                      settings: {
                        timeout: (definition.settings as any)?.timeout || 3600,
                        retry_count: (definition.settings as any)?.retry_count || 3,
                        notification_settings: (definition.settings as any)?.notification_settings || {}
                      }
                    });
                  }}
                  className="h-96"
                />
              ) : (
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Workflow</h3>
                  <p className="text-gray-600 mb-4">Start building your automated workflow</p>
                  <Button onClick={() => setSelectedWorkflow({
                    id: 'new',
                    name: 'New Workflow',
                    description: '',
                    trigger: { type: 'manual', config: {} },
                    start_step: '',
                    steps: [],
                    variables: {},
                    settings: {
                      timeout: 3600,
                      retry_count: 3,
                      notification_settings: {}
                    }
                  })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start Building
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowAutomationDashboard;