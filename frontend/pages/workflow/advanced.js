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
  Brain, 
  GitBranch, 
  Layers, 
  Code, 
  Database, 
  Webhook, 
  Settings,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  Plus,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Filter,
  Search,
  BarChart3,
  Users,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';

const AdvancedWorkflows = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('builder');
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);

  useEffect(() => {
    fetchAdvancedWorkflows();
  }, []);

  const fetchAdvancedWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflow/advanced', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      }
    } catch (error) {
      console.error('Error fetching advanced workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockWorkflows = [
    {
      id: 1,
      name: 'AI-Powered Lead Processing',
      description: 'Complex workflow with AI decision making and multi-path execution',
      type: 'advanced',
      status: 'active',
      complexity: 'high',
      nodes: 15,
      branches: 4,
      integrations: ['Salesforce', 'HubSpot', 'Slack', 'OpenAI'],
      lastModified: '2024-01-10',
      performance: {
        successRate: 94.2,
        avgExecutionTime: 180,
        totalExecutions: 1247
      },
      flowNodes: [
        { id: 'start', type: 'trigger', label: 'New Lead', x: 100, y: 100 },
        { id: 'ai_score', type: 'ai', label: 'AI Lead Scoring', x: 300, y: 100 },
        { id: 'decision', type: 'condition', label: 'Score > 80?', x: 500, y: 100 },
        { id: 'high_priority', type: 'action', label: 'High Priority Path', x: 700, y: 50 },
        { id: 'standard', type: 'action', label: 'Standard Path', x: 700, y: 150 }
      ]
    },
    {
      id: 2,
      name: 'Multi-Channel Campaign Orchestration',
      description: 'Coordinate campaigns across email, social media, and SMS',
      type: 'advanced',
      status: 'active',
      complexity: 'high',
      nodes: 22,
      branches: 6,
      integrations: ['Mailchimp', 'Twitter', 'Facebook', 'Twilio'],
      lastModified: '2024-01-09',
      performance: {
        successRate: 89.7,
        avgExecutionTime: 320,
        totalExecutions: 856
      }
    },
    {
      id: 3,
      name: 'Dynamic Content Personalization',
      description: 'Real-time content adaptation based on user behavior',
      type: 'advanced',
      status: 'draft',
      complexity: 'medium',
      nodes: 12,
      branches: 3,
      integrations: ['Analytics', 'CMS', 'CDN'],
      lastModified: '2024-01-08',
      performance: {
        successRate: 0,
        avgExecutionTime: 0,
        totalExecutions: 0
      }
    }
  ];

  const nodeTypes = [
    {
      type: 'trigger',
      label: 'Trigger',
      icon: <Zap className="h-4 w-4" />,
      color: 'bg-green-100 border-green-300',
      description: 'Start point for workflow execution'
    },
    {
      type: 'action',
      label: 'Action',
      icon: <Settings className="h-4 w-4" />,
      color: 'bg-blue-100 border-blue-300',
      description: 'Perform an operation or task'
    },
    {
      type: 'condition',
      label: 'Condition',
      icon: <GitBranch className="h-4 w-4" />,
      color: 'bg-yellow-100 border-yellow-300',
      description: 'Decision point with multiple paths'
    },
    {
      type: 'ai',
      label: 'AI Processing',
      icon: <Brain className="h-4 w-4" />,
      color: 'bg-purple-100 border-purple-300',
      description: 'AI-powered analysis or decision'
    },
    {
      type: 'integration',
      label: 'Integration',
      icon: <Webhook className="h-4 w-4" />,
      color: 'bg-orange-100 border-orange-300',
      description: 'Connect to external services'
    },
    {
      type: 'data',
      label: 'Data Operation',
      icon: <Database className="h-4 w-4" />,
      color: 'bg-gray-100 border-gray-300',
      description: 'Database or data manipulation'
    }
  ];

  const currentWorkflows = workflows.length > 0 ? workflows : mockWorkflows;

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'paused': return 'outline';
      default: return 'destructive';
    }
  };

  const handleNodeDrag = (nodeType) => {
    setDraggedNode(nodeType);
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (draggedNode) {
      // Add node to canvas at drop position
      console.log('Adding node:', draggedNode, 'at position:', e.clientX, e.clientY);
      setDraggedNode(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Advanced Workflows"
        subtitle="Build complex, AI-powered workflows with conditional logic and integrations"
        icon={<Brain className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Workflow', href: '/workflow' },
          { label: 'Advanced', href: '/workflow/advanced' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'builder'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Code className="h-4 w-4 inline mr-2" />
          Workflow Builder
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'workflows'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Layers className="h-4 w-4 inline mr-2" />
          My Workflows
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

      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Node Palette */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Node Palette</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nodeTypes.map((nodeType) => (
                <div
                  key={nodeType.type}
                  draggable
                  onDragStart={() => handleNodeDrag(nodeType)}
                  className={`p-3 rounded-lg border-2 border-dashed cursor-move hover:shadow-md transition-shadow ${nodeType.color}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {nodeType.icon}
                    <span className="text-sm font-medium">{nodeType.label}</span>
                  </div>
                  <p className="text-xs text-gray-600">{nodeType.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Canvas */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm">Workflow Canvas</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className="w-full h-[500px] bg-gray-50 relative overflow-hidden"
                onDrop={handleCanvasDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Sample Workflow Nodes */}
                {selectedWorkflow?.flowNodes && selectedWorkflow.flowNodes.map((node) => (
                  <div
                    key={node.id}
                    className="absolute bg-white border-2 border-blue-300 rounded-lg p-3 shadow-md cursor-move"
                    style={{ left: node.x, top: node.y }}
                  >
                    <div className="flex items-center gap-2">
                      {nodeTypes.find(t => t.type === node.type)?.icon}
                      <span className="text-sm font-medium">{node.label}</span>
                    </div>
                  </div>
                ))}

                {/* Placeholder when no workflow selected */}
                {!selectedWorkflow && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Drag nodes here to build your workflow</p>
                      <p className="text-sm">Or select an existing workflow to edit</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                  <Layers className="h-8 w-8 text-blue-600" />
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
                    <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(currentWorkflows.reduce((acc, w) => acc + w.performance.successRate, 0) / currentWorkflows.length).toFixed(1)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Executions</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {currentWorkflows.reduce((acc, w) => acc + w.performance.totalExecutions, 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflows List */}
          <div className="space-y-4">
            {currentWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">{workflow.name}</h3>
                        <Badge variant={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                        <Badge variant={getComplexityColor(workflow.complexity)}>
                          {workflow.complexity} complexity
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{workflow.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Nodes:</span>
                          <p className="font-medium">{workflow.nodes}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Branches:</span>
                          <p className="font-medium">{workflow.branches}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Success Rate:</span>
                          <p className="font-medium text-green-600">{workflow.performance.successRate}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg Duration:</span>
                          <p className="font-medium">{workflow.performance.avgExecutionTime}s</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWorkflow(workflow)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Integrations */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Integrations</h4>
                    <div className="flex flex-wrap gap-2">
                      {workflow.integrations.map((integration, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {integration}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="border-t pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{workflow.performance.successRate}%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{workflow.performance.avgExecutionTime}s</div>
                        <div className="text-sm text-gray-600">Avg Duration</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{workflow.performance.totalExecutions}</div>
                        <div className="text-sm text-gray-600">Total Runs</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Complex Workflows</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Decisions</p>
                    <p className="text-2xl font-bold text-blue-600">1,247</p>
                  </div>
                  <GitBranch className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Integrations</p>
                    <p className="text-2xl font-bold text-green-600">47</p>
                  </div>
                  <Webhook className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Time Saved</p>
                    <p className="text-2xl font-bold text-orange-600">342h</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Complexity Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Workflow Complexity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {currentWorkflows.filter(w => w.complexity === 'high').length}
                  </div>
                  <div className="text-sm text-gray-600">High Complexity</div>
                  <div className="text-xs text-gray-500 mt-1">15+ nodes, 4+ branches</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {currentWorkflows.filter(w => w.complexity === 'medium').length}
                  </div>
                  <div className="text-sm text-gray-600">Medium Complexity</div>
                  <div className="text-xs text-gray-500 mt-1">8-14 nodes, 2-3 branches</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {currentWorkflows.filter(w => w.complexity === 'low').length}
                  </div>
                  <div className="text-sm text-gray-600">Low Complexity</div>
                  <div className="text-xs text-gray-500 mt-1">3-7 nodes, 1-2 branches</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Complex Workflows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performing Complex Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentWorkflows
                  .filter(w => w.complexity === 'high')
                  .sort((a, b) => b.performance.successRate - a.performance.successRate)
                  .map((workflow, index) => (
                    <div key={workflow.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <h4 className="font-medium">{workflow.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{workflow.nodes} nodes</Badge>
                            <Badge variant="outline" className="text-xs">{workflow.branches} branches</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{workflow.performance.successRate}%</div>
                        <div className="text-sm text-gray-500">{workflow.performance.totalExecutions} runs</div>
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

export default AdvancedWorkflows;