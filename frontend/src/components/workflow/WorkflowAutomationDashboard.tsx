import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
  Play, Pause, Square, Settings, Plus, Edit3, Trash2,
  Clock, CheckCircle, AlertCircle, Activity, Users,
  Zap, BarChart3, Calendar, Filter, Search, Download,
  RefreshCw, Eye, ArrowRight, Copy, Share2
} from 'lucide-react';
import { WorkflowVisualDesigner } from './WorkflowVisualDesigner';
import {
  workflowAutomationApi,
  WorkflowTemplate,
  WorkflowInstance,
  WorkflowAnalytics,
  WorkflowDefinition,
  WorkflowStep
} from '../../services/api/workflowAutomation';
import { useToastHelpers } from '../ui/Toaster';

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
  const [executions, setExecutions] = useState<WorkflowInstance[]>([]);
  const [analytics, setAnalytics] = useState<WorkflowAnalytics | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ExtendedWorkflowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dataSource, setDataSource] = useState<'api' | 'fallback'>('fallback');
  
  const { success, error: showError, info } = useToastHelpers();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch data from the database-driven API
      const [templatesData, instancesData, analyticsData] = await Promise.all([
        workflowAutomationApi.getWorkflowTemplates().catch(() => null),
        workflowAutomationApi.getWorkflowInstances().catch(() => null),
        workflowAutomationApi.getWorkflowAnalytics().catch(() => null)
      ]);

      if (templatesData && instancesData && analyticsData) {
        // Successfully fetched from API
        setWorkflows(templatesData);
        setExecutions(instancesData);
        setAnalytics(analyticsData);
        setDataSource('api');
        success('Workflow data loaded successfully');
      } else {
        // Fallback to enhanced sample data
        const fallbackData = generateEnhancedFallbackData();
        setWorkflows(fallbackData.templates);
        setExecutions(fallbackData.instances);
        setAnalytics(fallbackData.analytics);
        setDataSource('fallback');
        info('Using demo workflow data - API unavailable');
      }
    } catch (err) {
      // Generate enhanced fallback data
      const fallbackData = generateEnhancedFallbackData();
      setWorkflows(fallbackData.templates);
      setExecutions(fallbackData.instances);
      setAnalytics(fallbackData.analytics);
      setDataSource('fallback');
      setError(err instanceof Error ? err.message : 'Failed to load workflow data');
      showError('Failed to load workflow data, using demo data');
    } finally {
      setLoading(false);
    }
  };

  const generateEnhancedFallbackData = () => {
    const templates: WorkflowTemplate[] = [
      {
        id: 1,
        tenant_id: 1,
        name: 'Employee Onboarding',
        description: 'Comprehensive employee onboarding workflow with document collection and training',
        category: 'hr',
        version: '2.1',
        workflow_definition: {
          start_step: 'welcome',
          steps: [
            { id: 'welcome', name: 'Welcome Email', type: 'notification', config: {}, connections: ['documents'] },
            { id: 'documents', name: 'Document Collection', type: 'human_task', config: {}, connections: ['training'] },
            { id: 'training', name: 'Training Assignment', type: 'action', config: {}, connections: ['completion'] },
            { id: 'completion', name: 'Onboarding Complete', type: 'notification', config: {} }
          ]
        },
        input_schema: {},
        output_schema: {},
        complexity_level: 'medium',
        estimated_duration: 2880, // 48 hours
        tags: ['hr', 'onboarding', 'automation'],
        is_public: true,
        is_active: true,
        requires_approval: false,
        usage_count: 47,
        success_rate: 94.5,
        avg_execution_time: 2640, // 44 hours
        created_at: '2024-12-15T10:00:00Z',
        updated_at: '2025-01-05T14:30:00Z',
        created_by: 1
      },
      {
        id: 2,
        tenant_id: 1,
        name: 'Invoice Processing',
        description: 'Automated invoice processing with approval workflow and payment scheduling',
        category: 'finance',
        version: '1.8',
        workflow_definition: {
          start_step: 'validate',
          steps: [
            { id: 'validate', name: 'Invoice Validation', type: 'action', config: {}, connections: ['approval'] },
            { id: 'approval', name: 'Manager Approval', type: 'approval', config: {}, connections: ['payment'] },
            { id: 'payment', name: 'Schedule Payment', type: 'action', config: {}, connections: ['notification'] },
            { id: 'notification', name: 'Completion Notice', type: 'notification', config: {} }
          ]
        },
        input_schema: {},
        output_schema: {},
        complexity_level: 'simple',
        estimated_duration: 720, // 12 hours
        tags: ['finance', 'approval', 'payment'],
        is_public: false,
        is_active: true,
        requires_approval: true,
        usage_count: 156,
        success_rate: 98.2,
        avg_execution_time: 680, // 11.3 hours
        created_at: '2024-11-20T09:15:00Z',
        updated_at: '2025-01-07T11:45:00Z',
        created_by: 2
      },
      {
        id: 3,
        tenant_id: 1,
        name: 'Customer Support Ticket',
        description: 'Intelligent customer support ticket routing and escalation workflow',
        category: 'support',
        version: '3.0',
        workflow_definition: {
          start_step: 'categorize',
          steps: [
            { id: 'categorize', name: 'Auto-Categorize', type: 'action', config: {}, connections: ['assign'] },
            { id: 'assign', name: 'Agent Assignment', type: 'condition', config: {}, connections: ['resolve', 'escalate'] },
            { id: 'resolve', name: 'Resolution', type: 'human_task', config: {}, connections: ['feedback'] },
            { id: 'escalate', name: 'Escalation', type: 'action', config: {}, connections: ['resolve'] },
            { id: 'feedback', name: 'Customer Feedback', type: 'notification', config: {} }
          ]
        },
        input_schema: {},
        output_schema: {},
        complexity_level: 'complex',
        estimated_duration: 480, // 8 hours
        tags: ['support', 'escalation', 'ai'],
        is_public: true,
        is_active: true,
        requires_approval: false,
        usage_count: 89,
        success_rate: 91.7,
        avg_execution_time: 520, // 8.7 hours
        created_at: '2024-12-01T16:20:00Z',
        updated_at: '2025-01-06T09:10:00Z',
        created_by: 3
      }
    ];

    const instances: WorkflowInstance[] = [
      {
        id: 1,
        tenant_id: 1,
        template_id: 1,
        name: 'John Doe Onboarding',
        description: 'Onboarding workflow for new developer John Doe',
        status: 'active',
        input_data: { employee_name: 'John Doe', department: 'Engineering' },
        output_data: {},
        context_data: { start_date: '2025-01-08' },
        current_step_id: 'training',
        progress_percentage: 75,
        steps_completed: 3,
        steps_total: 4,
        execution_start_time: '2025-01-08T09:00:00Z',
        execution_duration: 1800, // 30 minutes so far
        error_count: 0,
        retry_count: 0,
        max_retries: 3,
        triggered_by: 'hr_system',
        priority: 5,
        created_at: '2025-01-08T09:00:00Z',
        updated_at: '2025-01-08T14:30:00Z'
      },
      {
        id: 2,
        tenant_id: 1,
        template_id: 2,
        name: 'Invoice #INV-2025-001',
        description: 'Processing invoice from Acme Corp',
        status: 'completed',
        input_data: { invoice_number: 'INV-2025-001', amount: 2500.00 },
        output_data: { payment_scheduled: true, payment_date: '2025-01-15' },
        context_data: { vendor: 'Acme Corp' },
        current_step_id: 'notification',
        progress_percentage: 100,
        steps_completed: 4,
        steps_total: 4,
        execution_start_time: '2025-01-07T10:15:00Z',
        execution_end_time: '2025-01-07T16:45:00Z',
        execution_duration: 23400, // 6.5 hours
        error_count: 0,
        retry_count: 0,
        max_retries: 3,
        triggered_by: 'accounting_system',
        priority: 7,
        created_at: '2025-01-07T10:15:00Z',
        updated_at: '2025-01-07T16:45:00Z'
      },
      {
        id: 3,
        tenant_id: 1,
        template_id: 3,
        name: 'Support Ticket #12345',
        description: 'Customer inquiry about billing issue',
        status: 'failed',
        input_data: { ticket_id: '12345', priority: 'high' },
        output_data: {},
        context_data: { customer_id: 'CUST-789' },
        current_step_id: 'assign',
        progress_percentage: 25,
        steps_completed: 1,
        steps_total: 5,
        execution_start_time: '2025-01-08T11:30:00Z',
        execution_duration: 900, // 15 minutes
        error_count: 2,
        last_error: 'Agent assignment failed - no available agents',
        retry_count: 2,
        max_retries: 3,
        triggered_by: 'support_system',
        priority: 8,
        created_at: '2025-01-08T11:30:00Z',
        updated_at: '2025-01-08T11:45:00Z'
      }
    ];

    const analytics: WorkflowAnalytics = {
      period: {
        start_date: '2025-01-01T00:00:00Z',
        end_date: '2025-01-08T23:59:59Z'
      },
      workflow_instances: {
        total: 47,
        completed: 42,
        failed: 3,
        success_rate: 89.4
      },
      automation_rules: {
        total_executions: 156,
        successful_executions: 147,
        success_rate: 94.2
      },
      performance: {
        avg_execution_duration: 1680, // 28 minutes
        avg_execution_duration_minutes: 28
      }
    };

    return { templates, instances, analytics };
  };

  const handleWorkflowAction = async (workflowId: string, action: string) => {
    try {
      if (dataSource === 'fallback') {
        info(`Demo mode: Would ${action} workflow ${workflowId}`);
        return;
      }

      // Use the workflowAutomation API service
      if (action === 'run') {
        const instance = await workflowAutomationApi.createWorkflowInstance(
          parseInt(workflowId),
          {
            name: `Manual execution ${new Date().toISOString()}`,
            description: 'Manually triggered workflow execution',
            input_data: {},
            context_data: {}
          },
          'manual'
        );
        
        // Execute the instance
        await workflowAutomationApi.executeWorkflowInstance(instance.id);
        success(`Workflow ${workflowId} started successfully`);
      }
      
      await fetchDashboardData();
    } catch (err) {
      console.error(`Failed to ${action} workflow:`, err);
      showError(`Failed to ${action} workflow`);
    }
  };

  const handleExecutionAction = async (executionId: string, action: string) => {
    try {
      if (dataSource === 'fallback') {
        info(`Demo mode: Would ${action} execution ${executionId}`);
        return;
      }

      // For now, show info messages since the API doesn't have direct instance control methods
      // In a real implementation, these would be separate API endpoints
      if (action === 'pause') {
        info(`Execution ${executionId} pause requested`);
      } else if (action === 'resume') {
        info(`Execution ${executionId} resume requested`);
      } else if (action === 'stop') {
        info(`Execution ${executionId} stop requested`);
      }
      
      await fetchDashboardData();
    } catch (err) {
      console.error(`Failed to ${action} execution:`, err);
      showError(`Failed to ${action} execution`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'paused': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
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
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Total Workflows',
                value: workflows.length,
                icon: Settings,
                color: 'blue',
              },
              {
                title: 'Active Workflows',
                value: workflows.filter(w => w.is_active).length,
                icon: Activity,
                color: 'green',
              },
              {
                title: 'Total Executions',
                value: analytics.automation_rules.total_executions,
                icon: Play,
                color: 'purple',
              },
              {
                title: 'Success Rate',
                value: `${analytics.workflow_instances.success_rate.toFixed(1)}%`,
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
                  {workflows.slice(0, 5).map((template, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{template.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(template.usage_count / Math.max(...workflows.map(t => t.usage_count))) * 100}%`
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
                            execution.status === 'active' ? 'text-yellow-600' :
                            'text-gray-600'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{execution.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(execution.execution_start_time).toLocaleString()}
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
                      {workflow.complexity_level}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{workflow.workflow_definition.steps.length} steps</span>
                    <span>{workflow.usage_count} uses</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleWorkflowAction(String(workflow.id), 'run')}>
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
                  <option value="active">Active</option>
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
                              <p className="font-medium text-gray-900">{execution.name}</p>
                              <p className="text-xs text-gray-500">ID: {String(execution.id).slice(0, 8)}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`h-4 w-4 ${
                                execution.status === 'completed' ? 'text-green-600' :
                                execution.status === 'failed' ? 'text-red-600' :
                                execution.status === 'active' ? 'text-yellow-600' :
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
                                  style={{ width: `${execution.progress_percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{execution.progress_percentage}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {execution.execution_duration ? formatDuration(execution.execution_duration) : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(execution.execution_start_time).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              {execution.status === 'active' && (
                                <Button variant="outline" size="sm" onClick={() => handleExecutionAction(String(execution.id), 'pause')}>
                                  <Pause className="h-3 w-3" />
                                </Button>
                              )}
                              {execution.status === 'paused' && (
                                <Button variant="outline" size="sm" onClick={() => handleExecutionAction(String(execution.id), 'resume')}>
                                  <Play className="h-3 w-3" />
                                </Button>
                              )}
                              {(execution.status === 'active' || execution.status === 'paused') && (
                                <Button variant="outline" size="sm" onClick={() => handleExecutionAction(String(execution.id), 'stop')}>
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