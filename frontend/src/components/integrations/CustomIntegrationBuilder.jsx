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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Switch } from '../ui/Switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
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
  Workflow,
  Key,
  Webhook,
  Code,
  Monitor,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  RefreshCw,
  Filter,
  Search,
  Star,
  Heart,
  Eye,
  GitBranch,
  Layers,
  Link,
  ArrowRight,
  ArrowDown,
  Save,
  TestTube,
  Puzzle,
  Wrench,
  Target,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data for workflow builder - moved outside component to prevent recreation
const connectorTypes = [
  {
    id: 'trigger',
    name: 'Triggers',
    icon: Zap,
    color: 'text-yellow-500',
    items: [
      { id: 'webhook', name: 'Webhook Trigger', description: 'Trigger on incoming webhook' },
      { id: 'schedule', name: 'Schedule Trigger', description: 'Trigger on time schedule' },
      { id: 'email', name: 'Email Trigger', description: 'Trigger on email received' },
      { id: 'file', name: 'File Trigger', description: 'Trigger on file upload' },
      { id: 'database', name: 'Database Trigger', description: 'Trigger on data change' }
    ]
  },
  {
    id: 'action',
    name: 'Actions',
    icon: Activity,
    color: 'text-blue-500',
    items: [
      { id: 'send-email', name: 'Send Email', description: 'Send email notification' },
      { id: 'create-record', name: 'Create Record', description: 'Create database record' },
      { id: 'api-call', name: 'API Call', description: 'Make HTTP API request' },
      { id: 'transform-data', name: 'Transform Data', description: 'Transform data format' },
      { id: 'conditional', name: 'Conditional Logic', description: 'Add if/then logic' }
    ]
  },
  {
    id: 'integration',
    name: 'Integrations',
    icon: Puzzle,
    color: 'text-green-500',
    items: [
      { id: 'slack', name: 'Slack', description: 'Send Slack messages' },
      { id: 'salesforce', name: 'Salesforce', description: 'Sync with Salesforce CRM' },
      { id: 'github', name: 'GitHub', description: 'Manage GitHub repositories' },
      { id: 'google-sheets', name: 'Google Sheets', description: 'Update spreadsheets' },
      { id: 'trello', name: 'Trello', description: 'Manage Trello boards' }
    ]
  },
  {
    id: 'utility',
    name: 'Utilities',
    icon: Wrench,
    color: 'text-purple-500',
    items: [
      { id: 'delay', name: 'Delay', description: 'Add time delay' },
      { id: 'filter', name: 'Filter', description: 'Filter data conditions' },
      { id: 'loop', name: 'Loop', description: 'Repeat actions' },
      { id: 'merge', name: 'Merge Data', description: 'Combine data sources' },
      { id: 'split', name: 'Split Data', description: 'Split data streams' }
    ]
  }
];

const workflowTemplates = [
    {
      id: 'lead-nurturing',
      name: 'Lead Nurturing Automation',
      description: 'Automatically nurture leads through email sequences and CRM updates',
      category: 'marketing',
      complexity: 'intermediate',
      estimatedTime: '30 minutes',
      steps: 5,
      integrations: ['email', 'crm', 'analytics'],
      popularity: 4.8,
      uses: 1250
    },
    {
      id: 'project-sync',
      name: 'Project Management Sync',
      description: 'Sync tasks and updates between project management tools',
      category: 'productivity',
      complexity: 'beginner',
      estimatedTime: '15 minutes',
      steps: 3,
      integrations: ['trello', 'slack', 'github'],
      popularity: 4.6,
      uses: 890
    },
    {
      id: 'customer-onboarding',
      name: 'Customer Onboarding Flow',
      description: 'Automate customer onboarding with welcome emails and account setup',
      category: 'customer-success',
      complexity: 'advanced',
      estimatedTime: '45 minutes',
      steps: 8,
      integrations: ['email', 'crm', 'billing', 'support'],
      popularity: 4.9,
      uses: 2100
    },
    {
      id: 'data-backup',
      name: 'Automated Data Backup',
      description: 'Automatically backup important data to multiple storage locations',
      category: 'operations',
      complexity: 'intermediate',
      estimatedTime: '25 minutes',
      steps: 4,
      integrations: ['database', 'cloud-storage', 'monitoring'],
      popularity: 4.4,
      uses: 670
    },
    {
      id: 'social-monitoring',
      name: 'Social Media Monitoring',
      description: 'Monitor social media mentions and respond automatically',
      category: 'marketing',
      complexity: 'advanced',
      estimatedTime: '40 minutes',
      steps: 6,
      integrations: ['twitter', 'facebook', 'slack', 'analytics'],
      popularity: 4.3,
      uses: 540
    }
];

const existingWorkflows = [
    {
      id: 'wf-001',
      name: 'New User Welcome Sequence',
      description: 'Automated welcome email and account setup for new users',
      status: 'active',
      triggers: 12450,
      successRate: 98.5,
      lastRun: '2025-01-07T10:30:00Z',
      steps: 4,
      integrations: ['email', 'crm', 'analytics'],
      created: '2024-12-15T00:00:00Z'
    },
    {
      id: 'wf-002',
      name: 'Lead Scoring Automation',
      description: 'Automatically score and route leads based on behavior',
      status: 'active',
      triggers: 8920,
      successRate: 96.8,
      lastRun: '2025-01-07T10:25:00Z',
      steps: 6,
      integrations: ['crm', 'analytics', 'email'],
      created: '2024-12-10T00:00:00Z'
    },
    {
      id: 'wf-003',
      name: 'Support Ticket Routing',
      description: 'Route support tickets to appropriate team members',
      status: 'paused',
      triggers: 3450,
      successRate: 94.2,
      lastRun: '2025-01-06T15:20:00Z',
      steps: 3,
      integrations: ['support', 'slack', 'crm'],
      created: '2024-12-05T00:00:00Z'
    },
    {
      id: 'wf-004',
      name: 'Invoice Generation',
      description: 'Automatically generate and send invoices for completed projects',
      status: 'active',
      triggers: 1890,
      successRate: 99.1,
      lastRun: '2025-01-07T09:45:00Z',
      steps: 5,
      integrations: ['billing', 'email', 'accounting'],
      created: '2024-11-28T00:00:00Z'
    }
];

const workflowMetrics = [
  { name: 'Jan', workflows: 12, executions: 45000, success: 97.2 },
  { name: 'Feb', workflows: 15, executions: 52000, success: 97.8 },
  { name: 'Mar', workflows: 18, executions: 48000, success: 96.5 },
  { name: 'Apr', workflows: 22, executions: 61000, success: 98.1 },
  { name: 'May', workflows: 25, executions: 58000, success: 97.9 },
  { name: 'Jun', workflows: 28, executions: 67000, success: 98.4 }
];

const CustomIntegrationBuilder = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [availableConnectors, setAvailableConnectors] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [testResults, setTestResults] = useState({});
  const [deploymentStatus, setDeploymentStatus] = useState({});

  useEffect(() => {
    setWorkflows(existingWorkflows);
    setTemplates(workflowTemplates);
    setAvailableConnectors(connectorTypes);
  }, []); // Empty dependency array since all arrays are now defined outside component

  const handleCreateWorkflow = useCallback((template = null) => {
    if (template) {
      // Create workflow from template
      const newWorkflow = {
        id: `wf-${Date.now()}`,
        name: template.name,
        description: template.description,
        status: 'draft',
        steps: template.steps,
        integrations: template.integrations,
        created: new Date().toISOString()
      };
      setSelectedWorkflow(newWorkflow);
    } else {
      // Create blank workflow
      setSelectedWorkflow({
        id: `wf-${Date.now()}`,
        name: 'New Workflow',
        description: '',
        status: 'draft',
        steps: 0,
        integrations: [],
        created: new Date().toISOString()
      });
    }
    setIsBuilderOpen(true);
  }, []);

  const handleTestWorkflow = useCallback(async (workflowId) => {
    setTestResults(prev => ({ ...prev, [workflowId]: { status: 'running' } }));
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setTestResults(prev => ({
      ...prev,
      [workflowId]: {
        status: 'completed',
        success: Math.random() > 0.1,
        duration: Math.floor(Math.random() * 5000) + 1000,
        steps: Math.floor(Math.random() * 8) + 3
      }
    }));
  }, []);

  const handleDeployWorkflow = useCallback(async (workflowId) => {
    setDeploymentStatus(prev => ({ ...prev, [workflowId]: { status: 'deploying' } }));
    
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDeploymentStatus(prev => ({
      ...prev,
      [workflowId]: {
        status: 'deployed',
        timestamp: new Date().toISOString()
      }
    }));
    
    // Update workflow status
    setWorkflows(prev => prev.map(wf => 
      wf.id === workflowId ? { ...wf, status: 'active' } : wf
    ));
  }, []);

  const renderBuilderTab = () => (
    <div className="space-y-6">
      {/* Builder Header */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Builder</CardTitle>
          <CardDescription>Create custom integrations and automation workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button onClick={() => handleCreateWorkflow()}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Workflow
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('templates')}>
              <Lightbulb className="h-4 w-4 mr-2" />
              Browse Templates
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Workflow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Canvas */}
      {isBuilderOpen && selectedWorkflow && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Workflow Canvas</CardTitle>
                <CardDescription>Drag and drop components to build your workflow</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleTestWorkflow(selectedWorkflow.id)}>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test
                </Button>
                <Button size="sm" onClick={() => handleDeployWorkflow(selectedWorkflow.id)}>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Component Palette */}
              <div className="space-y-4">
                <h3 className="font-medium">Components</h3>
                {availableConnectors.map(category => {
                  const Icon = category.icon;
                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${category.color}`} />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="space-y-1 ml-6">
                        {category.items.map(item => (
                          <div
                            key={item.id}
                            className="p-2 border rounded cursor-pointer hover:bg-muted text-xs"
                            draggable
                          >
                            <div className="font-medium">{item.name}</div>
                            <div className="text-muted-foreground">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Canvas Area */}
              <div className="lg:col-span-3">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 min-h-96 bg-muted/10">
                  <div className="text-center text-muted-foreground">
                    <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Start Building Your Workflow</p>
                    <p className="text-sm">Drag components from the left panel to create your automation</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold">{workflows.filter(w => w.status === 'active').length}</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold">67K</p>
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
                <p className="text-2xl font-bold">98.4%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Execution Time</p>
                <p className="text-2xl font-bold">2.3s</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderWorkflowsTab = () => (
    <div className="space-y-6">
      {/* Workflows Header */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Management</CardTitle>
          <CardDescription>Manage and monitor your automation workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button onClick={() => handleCreateWorkflow()}>
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workflows List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Workflows</CardTitle>
          <CardDescription>All your automation workflows and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.map(workflow => {
              const testResult = testResults[workflow.id];
              const deployStatus = deploymentStatus[workflow.id];
              
              return (
                <div key={workflow.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-medium">{workflow.name}</h3>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={workflow.status === 'active' ? 'default' : 
                                     workflow.status === 'paused' ? 'secondary' : 'outline'}>
                        {workflow.status}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleTestWorkflow(workflow.id)}>
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Triggers</p>
                      <p className="font-medium">{workflow.triggers?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-medium">{workflow.successRate || 'N/A'}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Steps</p>
                      <p className="font-medium">{workflow.steps}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Run</p>
                      <p className="font-medium">
                        {workflow.lastRun ? new Date(workflow.lastRun).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {workflow.integrations?.map(integration => (
                        <Badge key={integration} variant="outline" className="text-xs">
                          {integration}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {testResult?.status === 'running' && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 animate-spin" />
                          <span>Testing...</span>
                        </div>
                      )}
                      {testResult?.status === 'completed' && (
                        <div className="flex items-center space-x-1 text-sm">
                          {testResult.success ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={testResult.success ? 'text-green-600' : 'text-red-600'}>
                            Test {testResult.success ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                      )}
                      {deployStatus?.status === 'deploying' && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 animate-spin" />
                          <span>Deploying...</span>
                        </div>
                      )}
                      {workflow.status === 'draft' && (
                        <Button size="sm" onClick={() => handleDeployWorkflow(workflow.id)}>
                          <Rocket className="h-4 w-4 mr-2" />
                          Deploy
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Performance</CardTitle>
          <CardDescription>Execution trends and success rates over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={workflowMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="executions" stroke="#3b82f6" name="Executions" />
              <Line yAxisId="right" type="monotone" dataKey="success" stroke="#10b981" name="Success Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      {/* Templates Header */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Templates</CardTitle>
          <CardDescription>Pre-built workflows to get you started quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search templates..." className="pl-10" />
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="customer-success">Customer Success</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Featured Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Templates</CardTitle>
          <CardDescription>Most popular and recommended workflow templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates
              .sort((a, b) => b.popularity - a.popularity)
              .slice(0, 6)
              .map(template => (
                <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{template.popularity}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Complexity: {template.complexity}</span>
                      <span>{template.estimatedTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{template.steps} steps</span>
                      <span>{template.uses} uses</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.integrations.slice(0, 3).map(integration => (
                      <Badge key={integration} variant="outline" className="text-xs">
                        {integration}
                      </Badge>
                    ))}
                    {template.integrations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.integrations.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" className="flex-1" onClick={() => handleCreateWorkflow(template)}>
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
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
                <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{workflows.length}</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Executions</p>
                <p className="text-2xl font-bold">67K</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Success Rate</p>
                <p className="text-2xl font-bold">98.4%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold">1,240h</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Execution Trends</CardTitle>
          <CardDescription>Monthly workflow executions and success rates</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={workflowMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="executions" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Workflows</CardTitle>
          <CardDescription>Workflows with highest execution rates and success</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows
              .sort((a, b) => (b.triggers || 0) - (a.triggers || 0))
              .slice(0, 5)
              .map((workflow, index) => (
                <div key={workflow.id} className="flex items-center space-x-4">
                  <div className="w-8 text-center">
                    <span className="text-sm font-medium">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{workflow.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {workflow.triggers?.toLocaleString() || 0} executions
                      </span>
                    </div>
                    <Progress value={workflow.successRate || 0} className="h-2" />
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{workflow.successRate || 0}%</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Usage</CardTitle>
          <CardDescription>Most used integrations across all workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {['email', 'crm', 'analytics', 'slack', 'github', 'billing', 'support', 'accounting']
              .map(integration => {
                const usage = workflows.filter(w => w.integrations?.includes(integration)).length;
                const percentage = (usage / workflows.length) * 100;
                
                return (
                  <div key={integration} className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-2">
                      {integration.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-medium capitalize">{integration}</h3>
                    <p className="text-sm text-muted-foreground">{usage} workflows</p>
                    <Progress value={percentage} className="mt-2" />
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
        <h1 className="text-3xl font-bold">Custom Integration Builder</h1>
        <p className="text-muted-foreground mt-2">
          Create custom workflows and automation with visual builder
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          {renderBuilderTab()}
        </TabsContent>

        <TabsContent value="workflows">
          {renderWorkflowsTab()}
        </TabsContent>

        <TabsContent value="templates">
          {renderTemplatesTab()}
        </TabsContent>

        <TabsContent value="analytics">
          {renderAnalyticsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

