import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../src/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Input } from '../../src/components/ui/input';
import { Textarea } from '../../src/components/ui/textarea';
import { Progress } from '../../src/components/ui/progress';
import { 
  Zap, 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Users,
  Calendar,
  ArrowRight,
  Copy,
  Download,
  Upload,
  Filter,
  Search,
  TrendingUp,
  Activity
} from 'lucide-react';

const WorkflowAutomation = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('workflows');
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflow/automation', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const runWorkflow = async (workflowId) => {
    try {
      const response = await fetch(`/api/workflow/automation/${workflowId}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchWorkflows(); // Refresh the list
      }
    } catch (error) {
      console.error('Error running workflow:', error);
    }
  };

  const mockWorkflows = [
    {
      id: 1,
      name: 'Daily Report Generation',
      description: 'Automatically generate and send daily performance reports',
      status: 'active',
      trigger: 'schedule',
      schedule: 'Daily at 9:00 AM',
      lastRun: '2024-01-10 09:00:00',
      nextRun: '2024-01-11 09:00:00',
      successRate: 98.5,
      totalRuns: 247,
      avgDuration: 45,
      steps: [
        { id: 1, type: 'data_collection', name: 'Collect Analytics Data', status: 'completed' },
        { id: 2, type: 'processing', name: 'Process Metrics', status: 'completed' },
        { id: 3, type: 'report_generation', name: 'Generate Report', status: 'completed' },
        { id: 4, type: 'email', name: 'Send Email', status: 'completed' }
      ]
    },
    {
      id: 2,
      name: 'New User Onboarding',
      description: 'Automated onboarding sequence for new users',
      status: 'active',
      trigger: 'event',
      schedule: 'On user registration',
      lastRun: '2024-01-10 14:30:00',
      nextRun: 'On next registration',
      successRate: 94.2,
      totalRuns: 156,
      avgDuration: 120,
      steps: [
        { id: 1, type: 'welcome_email', name: 'Send Welcome Email', status: 'completed' },
        { id: 2, type: 'account_setup', name: 'Setup Account', status: 'completed' },
        { id: 3, type: 'tutorial', name: 'Start Tutorial', status: 'running' },
        { id: 4, type: 'follow_up', name: 'Schedule Follow-up', status: 'pending' }
      ]
    },
    {
      id: 3,
      name: 'Task Assignment Automation',
      description: 'Automatically assign tasks based on team capacity and skills',
      status: 'paused',
      trigger: 'event',
      schedule: 'On task creation',
      lastRun: '2024-01-09 16:45:00',
      nextRun: 'Paused',
      successRate: 87.3,
      totalRuns: 89,
      avgDuration: 15,
      steps: [
        { id: 1, type: 'analysis', name: 'Analyze Task Requirements', status: 'completed' },
        { id: 2, type: 'matching', name: 'Match Team Members', status: 'failed' },
        { id: 3, type: 'assignment', name: 'Assign Task', status: 'pending' },
        { id: 4, type: 'notification', name: 'Send Notifications', status: 'pending' }
      ]
    },
    {
      id: 4,
      name: 'Data Backup & Sync',
      description: 'Regular backup and synchronization of critical data',
      status: 'active',
      trigger: 'schedule',
      schedule: 'Every 6 hours',
      lastRun: '2024-01-10 18:00:00',
      nextRun: '2024-01-11 00:00:00',
      successRate: 99.8,
      totalRuns: 1456,
      avgDuration: 30,
      steps: [
        { id: 1, type: 'backup', name: 'Create Backup', status: 'completed' },
        { id: 2, type: 'validation', name: 'Validate Backup', status: 'completed' },
        { id: 3, type: 'sync', name: 'Sync to Cloud', status: 'completed' },
        { id: 4, type: 'cleanup', name: 'Cleanup Old Backups', status: 'completed' }
      ]
    }
  ];

  const workflowTemplates = [
    {
      id: 'email_campaign',
      name: 'Email Campaign',
      description: 'Automated email marketing campaign',
      category: 'Marketing',
      steps: 4,
      estimatedTime: '2 hours'
    },
    {
      id: 'lead_scoring',
      name: 'Lead Scoring',
      description: 'Automatically score and qualify leads',
      category: 'Sales',
      steps: 6,
      estimatedTime: '30 minutes'
    },
    {
      id: 'invoice_processing',
      name: 'Invoice Processing',
      description: 'Automated invoice generation and sending',
      category: 'Finance',
      steps: 5,
      estimatedTime: '1 hour'
    },
    {
      id: 'content_approval',
      name: 'Content Approval',
      description: 'Content review and approval workflow',
      category: 'Content',
      steps: 3,
      estimatedTime: '45 minutes'
    }
  ];

  const currentWorkflows = workflows.length > 0 ? workflows : mockWorkflows;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStepStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStepStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Workflow Automation"
        subtitle="Create, manage, and monitor automated workflows"
        icon={<Zap className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Workflow', href: '/workflow' },
          { label: 'Automation', href: '/workflow/automation' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'workflows'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap className="h-4 w-4 inline mr-2" />
          Active Workflows
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Copy className="h-4 w-4 inline mr-2" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Analytics
        </button>
      </div>

      {activeTab === 'workflows' && (
        <div className="space-y-6">
          {/* Workflow Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                    <p className="text-2xl font-bold">{currentWorkflows.length}</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {currentWorkflows.filter(w => w.status === 'active').length}
                    </p>
                  </div>
                  <Play className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(currentWorkflows.reduce((acc, w) => acc + w.successRate, 0) / currentWorkflows.length).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Runs</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {currentWorkflows.reduce((acc, w) => acc + w.totalRuns, 0).toLocaleString()}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflows List */}
          <div className="space-y-4">
            {currentWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">{workflow.name}</h3>
                        <Badge variant={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{workflow.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Trigger:</span>
                          <p className="font-medium capitalize">{workflow.trigger}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Schedule:</span>
                          <p className="font-medium">{workflow.schedule}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Success Rate:</span>
                          <p className="font-medium text-green-600">{workflow.successRate}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg Duration:</span>
                          <p className="font-medium">{workflow.avgDuration}s</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runWorkflow(workflow.id)}
                        disabled={workflow.status === 'paused'}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Workflow Steps */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Workflow Steps</h4>
                    <div className="flex items-center space-x-4 overflow-x-auto">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-2 flex-shrink-0">
                          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 min-w-[200px]">
                            {getStepStatusIcon(step.status)}
                            <span className={`text-sm font-medium ${getStepStatusColor(step.status)}`}>
                              {step.name}
                            </span>
                          </div>
                          {index < workflow.steps.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Execution Info */}
                  <div className="border-t pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Last Run:</span>
                        <p className="font-medium">{new Date(workflow.lastRun).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Next Run:</span>
                        <p className="font-medium">{workflow.nextRun === 'Paused' ? workflow.nextRun : new Date(workflow.nextRun).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Runs:</span>
                        <p className="font-medium">{workflow.totalRuns.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{template.name}</span>
                  <Badge variant="outline">{template.category}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{template.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Steps:</span>
                    <span className="font-medium">{template.steps}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Setup Time:</span>
                    <span className="font-medium">{template.estimatedTime}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    Use Template
                  </Button>
                  <Button variant="outline">
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Executions Today</p>
                    <p className="text-2xl font-bold">247</p>
                  </div>
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">96.8%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                    <p className="text-2xl font-bold text-purple-600">52s</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Time Saved</p>
                    <p className="text-2xl font-bold text-orange-600">127h</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Workflows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Performing Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentWorkflows
                  .sort((a, b) => b.successRate - a.successRate)
                  .slice(0, 5)
                  .map((workflow, index) => (
                    <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <h4 className="font-medium">{workflow.name}</h4>
                          <p className="text-sm text-gray-600">{workflow.totalRuns} runs</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{workflow.successRate}%</div>
                        <div className="text-sm text-gray-500">success rate</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkflowAutomation;