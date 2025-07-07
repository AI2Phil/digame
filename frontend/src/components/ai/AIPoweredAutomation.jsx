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
  TrendingDown,
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
  Eye,
  Target,
  Lightbulb,
  Cpu,
  Network,
  Layers,
  GitBranch,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  Star,
  Heart,
  Bookmark,
  MousePointer,
  Navigation,
  Smartphone,
  Monitor,
  Tablet,
  Watch,
  Headphones,
  Gauge,
  LineChart,
  PieChart,
  BarChart,
  Workflow,
  Rocket,
  TestTube,
  Bot,
  Cog,
  Magic,
  Sparkles,
  Wand2,
  Automation,
  Timer,
  Bell,
  Mail,
  Slack,
  Github,
  Database as DatabaseIcon
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
  ComposedChart
} from 'recharts';

const AIPoweredAutomation = () => {
  const [activeTab, setActiveTab] = useState('automations');
  const [selectedAutomation, setSelectedAutomation] = useState('all');
  const [automationStatus, setAutomationStatus] = useState('all');
  const [automations, setAutomations] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [actions, setActions] = useState([]);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [performance, setPerformance] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  // Mock automation data
  const aiAutomations = [
    {
      id: 'smart-onboarding',
      name: 'Smart User Onboarding',
      description: 'AI-driven personalized onboarding flow based on user behavior',
      category: 'user-experience',
      status: 'active',
      trigger: 'User Registration',
      aiModel: 'User Segmentation ML',
      executions: 1247,
      successRate: 94.2,
      avgExecutionTime: 2.3,
      lastRun: '2025-01-07T10:30:00Z',
      created: '2024-12-15T00:00:00Z',
      actions: [
        'Analyze user profile',
        'Predict user segment',
        'Customize onboarding flow',
        'Send personalized welcome email',
        'Schedule follow-up tasks'
      ]
    },
    {
      id: 'predictive-support',
      name: 'Predictive Support Routing',
      description: 'Automatically route support tickets using AI sentiment analysis',
      category: 'customer-support',
      status: 'active',
      trigger: 'Support Ticket Created',
      aiModel: 'Sentiment Analysis NLP',
      executions: 892,
      successRate: 91.7,
      avgExecutionTime: 1.8,
      lastRun: '2025-01-07T10:25:00Z',
      created: '2024-12-10T00:00:00Z',
      actions: [
        'Analyze ticket sentiment',
        'Extract key topics',
        'Predict urgency level',
        'Route to specialist',
        'Set priority flags'
      ]
    },
    {
      id: 'churn-prevention',
      name: 'Intelligent Churn Prevention',
      description: 'Proactively engage at-risk users with personalized interventions',
      category: 'retention',
      status: 'active',
      trigger: 'Churn Risk Detected',
      aiModel: 'Churn Prediction ML',
      executions: 456,
      successRate: 87.3,
      avgExecutionTime: 4.1,
      lastRun: '2025-01-07T09:45:00Z',
      created: '2024-11-28T00:00:00Z',
      actions: [
        'Calculate churn probability',
        'Identify risk factors',
        'Generate intervention strategy',
        'Send personalized offer',
        'Schedule check-in call'
      ]
    },
    {
      id: 'content-optimization',
      name: 'AI Content Optimization',
      description: 'Automatically optimize content based on user engagement patterns',
      category: 'content',
      status: 'active',
      trigger: 'Content Performance Analysis',
      aiModel: 'Engagement Prediction ML',
      executions: 234,
      successRate: 89.6,
      avgExecutionTime: 3.7,
      lastRun: '2025-01-07T08:15:00Z',
      created: '2024-11-15T00:00:00Z',
      actions: [
        'Analyze content performance',
        'Predict engagement metrics',
        'Generate optimization suggestions',
        'A/B test variations',
        'Update content automatically'
      ]
    },
    {
      id: 'smart-notifications',
      name: 'Smart Notification Timing',
      description: 'AI-optimized notification delivery based on user activity patterns',
      category: 'engagement',
      status: 'paused',
      trigger: 'Notification Scheduled',
      aiModel: 'Activity Pattern ML',
      executions: 3421,
      successRate: 92.8,
      avgExecutionTime: 0.9,
      lastRun: '2025-01-06T15:20:00Z',
      created: '2024-10-20T00:00:00Z',
      actions: [
        'Analyze user activity patterns',
        'Predict optimal send time',
        'Personalize notification content',
        'Schedule delivery',
        'Track engagement metrics'
      ]
    }
  ];

  const automationTriggers = [
    {
      id: 'user-behavior',
      name: 'User Behavior Triggers',
      description: 'Triggers based on user actions and behavior patterns',
      types: ['Page Visit', 'Feature Usage', 'Session Duration', 'Inactivity'],
      aiEnhanced: true,
      count: 12
    },
    {
      id: 'data-events',
      name: 'Data Event Triggers',
      description: 'Triggers based on data changes and thresholds',
      types: ['Data Update', 'Threshold Breach', 'Anomaly Detection', 'Pattern Change'],
      aiEnhanced: true,
      count: 8
    },
    {
      id: 'time-based',
      name: 'Time-Based Triggers',
      description: 'Scheduled and time-based automation triggers',
      types: ['Scheduled', 'Recurring', 'Deadline', 'Time Zone'],
      aiEnhanced: false,
      count: 15
    },
    {
      id: 'external-events',
      name: 'External Event Triggers',
      description: 'Triggers from external systems and APIs',
      types: ['Webhook', 'API Call', 'Email', 'Integration'],
      aiEnhanced: true,
      count: 6
    }
  ];

  const automationActions = [
    {
      id: 'communication',
      name: 'Communication Actions',
      description: 'AI-enhanced communication and messaging',
      actions: ['Send Email', 'Push Notification', 'In-App Message', 'SMS'],
      aiFeatures: ['Content Personalization', 'Timing Optimization', 'Channel Selection'],
      count: 18
    },
    {
      id: 'data-processing',
      name: 'Data Processing Actions',
      description: 'Intelligent data manipulation and analysis',
      actions: ['Update Records', 'Generate Reports', 'Data Enrichment', 'Analytics'],
      aiFeatures: ['Smart Categorization', 'Predictive Filling', 'Anomaly Detection'],
      count: 14
    },
    {
      id: 'workflow',
      name: 'Workflow Actions',
      description: 'Advanced workflow and process automation',
      actions: ['Create Task', 'Assign User', 'Update Status', 'Route Request'],
      aiFeatures: ['Smart Assignment', 'Priority Prediction', 'Workload Balancing'],
      count: 22
    },
    {
      id: 'integration',
      name: 'Integration Actions',
      description: 'AI-powered third-party integrations',
      actions: ['API Call', 'Sync Data', 'Create Record', 'Update System'],
      aiFeatures: ['Error Prediction', 'Retry Logic', 'Data Mapping'],
      count: 16
    }
  ];

  const executionMetrics = [
    { name: 'Mon', executions: 1240, success: 1156, errors: 84, avgTime: 2.3 },
    { name: 'Tue', executions: 1340, success: 1251, errors: 89, avgTime: 2.1 },
    { name: 'Wed', executions: 1420, success: 1334, errors: 86, avgTime: 2.4 },
    { name: 'Thu', executions: 1580, success: 1489, errors: 91, avgTime: 2.2 },
    { name: 'Fri', executions: 1720, success: 1628, errors: 92, avgTime: 2.0 },
    { name: 'Sat', executions: 890, success: 845, errors: 45, avgTime: 1.9 },
    { name: 'Sun', executions: 780, success: 742, errors: 38, avgTime: 1.8 }
  ];

  const recentExecutions = [
    {
      id: 'exec-001',
      automation: 'Smart User Onboarding',
      trigger: 'User Registration',
      status: 'success',
      duration: 2.1,
      timestamp: '2025-01-07T10:30:00Z',
      aiDecision: 'Classified as power user, applied advanced onboarding'
    },
    {
      id: 'exec-002',
      automation: 'Predictive Support Routing',
      trigger: 'Support Ticket #12847',
      status: 'success',
      duration: 1.8,
      timestamp: '2025-01-07T10:28:00Z',
      aiDecision: 'High urgency detected, routed to senior specialist'
    },
    {
      id: 'exec-003',
      automation: 'Churn Prevention',
      trigger: 'High Churn Risk',
      status: 'success',
      duration: 4.3,
      timestamp: '2025-01-07T10:25:00Z',
      aiDecision: 'Sent personalized retention offer based on usage patterns'
    },
    {
      id: 'exec-004',
      automation: 'Content Optimization',
      trigger: 'Low Engagement Alert',
      status: 'failed',
      duration: 0.5,
      timestamp: '2025-01-07T10:20:00Z',
      aiDecision: 'Failed to generate optimization suggestions - insufficient data'
    },
    {
      id: 'exec-005',
      automation: 'Smart Notifications',
      trigger: 'Scheduled Notification',
      status: 'success',
      duration: 0.9,
      timestamp: '2025-01-07T10:15:00Z',
      aiDecision: 'Optimal send time predicted: 2:30 PM based on user activity'
    }
  ];

  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    try {
      await Promise.all([
        loadWorkflowTemplates(),
        loadWorkflowInstances(),
        loadAutomationRules(),
        loadWorkflowActions(),
        loadWorkflowAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading automation data:', error);
      // Fallback to mock data on error
      setAutomations(aiAutomations);
      setTriggers(automationTriggers);
      setActions(automationActions);
      setExecutionLogs(recentExecutions);
      loadFallbackPerformanceData();
    }
  };

  const loadWorkflowTemplates = async () => {
    try {
      const response = await fetch('/api/workflow-automation/templates?tenant_id=1');
      if (!response.ok) throw new Error('Failed to fetch workflow templates');
      
      const templates = await response.json();
      
      // Transform templates to automation format
      const transformedAutomations = templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category || 'general',
        status: template.is_active ? 'active' : 'paused',
        trigger: 'Manual Trigger', // Default for templates
        aiModel: 'Workflow Engine',
        executions: 0, // Will be updated from instances
        successRate: 95.0, // Default
        avgExecutionTime: template.estimated_duration || 2.5,
        lastRun: template.updated_at || template.created_at,
        created: template.created_at,
        actions: template.workflow_definition?.steps?.map(step => step.name) || []
      }));
      
      setAutomations(transformedAutomations);
    } catch (error) {
      console.error('Error loading workflow templates:', error);
      throw error;
    }
  };

  const loadWorkflowInstances = async () => {
    try {
      const response = await fetch('/api/workflow-automation/instances?tenant_id=1');
      if (!response.ok) throw new Error('Failed to fetch workflow instances');
      
      const instances = await response.json();
      
      // Transform instances to execution logs format
      const transformedLogs = instances.slice(0, 10).map(instance => ({
        id: `exec-${instance.id}`,
        automation: instance.name,
        trigger: instance.triggered_by || 'Manual',
        status: instance.status === 'completed' ? 'success' :
                instance.status === 'failed' ? 'failed' : 'running',
        duration: instance.execution_duration || 0,
        timestamp: instance.created_at,
        aiDecision: `Workflow executed with ${instance.progress_percentage || 0}% completion`
      }));
      
      setExecutionLogs(transformedLogs);
    } catch (error) {
      console.error('Error loading workflow instances:', error);
      throw error;
    }
  };

  const loadAutomationRules = async () => {
    try {
      const response = await fetch('/api/workflow-automation/automation-rules?tenant_id=1');
      if (!response.ok) throw new Error('Failed to fetch automation rules');
      
      const rules = await response.json();
      
      // Transform rules to triggers format
      const transformedTriggers = [
        {
          id: 'ai-behavior',
          name: 'AI Behavior Triggers',
          description: 'AI-enhanced triggers based on user behavior patterns',
          types: rules.filter(r => r.trigger_type === 'user_behavior').map(r => r.name),
          aiEnhanced: true,
          count: rules.filter(r => r.trigger_type === 'user_behavior').length
        },
        {
          id: 'data-events',
          name: 'Data Event Triggers',
          description: 'Triggers based on data changes and AI anomaly detection',
          types: rules.filter(r => r.trigger_type === 'data_change').map(r => r.name),
          aiEnhanced: true,
          count: rules.filter(r => r.trigger_type === 'data_change').length
        },
        {
          id: 'time-based',
          name: 'Smart Time-Based Triggers',
          description: 'AI-optimized scheduled triggers',
          types: rules.filter(r => r.trigger_type === 'scheduled').map(r => r.name),
          aiEnhanced: true,
          count: rules.filter(r => r.trigger_type === 'scheduled').length
        },
        {
          id: 'external-events',
          name: 'External Event Triggers',
          description: 'AI-powered external system integrations',
          types: rules.filter(r => r.trigger_type === 'webhook').map(r => r.name),
          aiEnhanced: true,
          count: rules.filter(r => r.trigger_type === 'webhook').length
        }
      ];
      
      setTriggers(transformedTriggers);
    } catch (error) {
      console.error('Error loading automation rules:', error);
      throw error;
    }
  };

  const loadWorkflowActions = async () => {
    try {
      const response = await fetch('/api/workflow-automation/actions?tenant_id=1');
      if (!response.ok) throw new Error('Failed to fetch workflow actions');
      
      const workflowActions = await response.json();
      
      // Transform actions to component format
      const transformedActions = [
        {
          id: 'ai-communication',
          name: 'AI Communication Actions',
          description: 'AI-enhanced communication and messaging',
          actions: workflowActions.filter(a => a.category === 'communication').map(a => a.name),
          aiFeatures: ['Content Personalization', 'Timing Optimization', 'Channel Selection'],
          count: workflowActions.filter(a => a.category === 'communication').length
        },
        {
          id: 'intelligent-processing',
          name: 'Intelligent Data Processing',
          description: 'AI-powered data manipulation and analysis',
          actions: workflowActions.filter(a => a.category === 'data_processing').map(a => a.name),
          aiFeatures: ['Smart Categorization', 'Predictive Filling', 'Anomaly Detection'],
          count: workflowActions.filter(a => a.category === 'data_processing').length
        },
        {
          id: 'smart-workflow',
          name: 'Smart Workflow Actions',
          description: 'AI-optimized workflow and process automation',
          actions: workflowActions.filter(a => a.category === 'workflow').map(a => a.name),
          aiFeatures: ['Smart Assignment', 'Priority Prediction', 'Workload Balancing'],
          count: workflowActions.filter(a => a.category === 'workflow').length
        },
        {
          id: 'ai-integration',
          name: 'AI Integration Actions',
          description: 'Intelligent third-party integrations',
          actions: workflowActions.filter(a => a.category === 'integration').map(a => a.name),
          aiFeatures: ['Error Prediction', 'Retry Logic', 'Data Mapping'],
          count: workflowActions.filter(a => a.category === 'integration').length
        }
      ];
      
      setActions(transformedActions);
    } catch (error) {
      console.error('Error loading workflow actions:', error);
      throw error;
    }
  };

  const loadWorkflowAnalytics = async () => {
    try {
      const response = await fetch('/api/workflow-automation/analytics?tenant_id=1');
      if (!response.ok) throw new Error('Failed to fetch workflow analytics');
      
      const analytics = await response.json();
      
      setPerformance({
        totalAutomations: analytics.workflow_instances?.total || 0,
        activeAutomations: analytics.workflow_instances?.completed || 0,
        totalExecutions: analytics.automation_rules?.total_executions || 0,
        successRate: analytics.workflow_instances?.success_rate || 0,
        avgExecutionTime: analytics.performance?.avg_execution_duration || 0,
        aiEnhancedActions: 67, // Static for now
        timeSaved: Math.round((analytics.performance?.avg_execution_duration_minutes || 0) * 10)
      });
    } catch (error) {
      console.error('Error loading workflow analytics:', error);
      throw error;
    }
  };

  const loadFallbackPerformanceData = () => {
    setPerformance({
      totalAutomations: aiAutomations.length,
      activeAutomations: aiAutomations.filter(a => a.status === 'active').length,
      totalExecutions: 8927,
      successRate: 91.4,
      avgExecutionTime: 2.2,
      aiEnhancedActions: 67,
      timeSaved: 1247
    });
  };

  const toggleAutomation = useCallback(async (automationId) => {
    try {
      // Find the automation to get current status
      const automation = automations.find(a => a.id === automationId);
      if (!automation) return;
      
      const newStatus = automation.status === 'active' ? 'paused' : 'active';
      
      // Update via API (assuming template activation/deactivation)
      const response = await fetch(`/api/workflow-automation/templates/${automationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: newStatus === 'active'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update automation status');
      }
      
      // Update local state
      setAutomations(prev => prev.map(automation =>
        automation.id === automationId
          ? { ...automation, status: newStatus }
          : automation
      ));
      
    } catch (error) {
      console.error('Error toggling automation:', error);
      // Fallback: update local state only
      setAutomations(prev => prev.map(automation =>
        automation.id === automationId
          ? { ...automation, status: automation.status === 'active' ? 'paused' : 'active' }
          : automation
      ));
    }
  }, [automations]);

  const renderAutomationsTab = () => (
    <div className="space-y-6">
      {/* Automation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Automations</p>
                <p className="text-2xl font-bold">{performance.activeAutomations}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{performance.successRate}%</p>
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
                <p className="text-2xl font-bold">{performance.avgExecutionTime}s</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold">{performance.timeSaved}h</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Automations</CardTitle>
          <CardDescription>Intelligent automation workflows with AI decision making</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automations.map(automation => (
              <div key={automation.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      automation.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                    <h3 className="font-medium">{automation.name}</h3>
                    <Badge variant={automation.category === 'user-experience' ? 'default' :
                                   automation.category === 'customer-support' ? 'secondary' :
                                   automation.category === 'retention' ? 'outline' : 'destructive'}>
                      {automation.category.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Brain className="h-3 w-3 mr-1" />
                      {automation.aiModel}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={automation.status === 'active'} 
                      onCheckedChange={() => toggleAutomation(automation.id)}
                    />
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{automation.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground">Executions</p>
                    <p className="font-medium">{automation.executions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-medium">{automation.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Time</p>
                    <p className="font-medium">{automation.avgExecutionTime}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Run</p>
                    <p className="font-medium">{new Date(automation.lastRun).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>Trigger: {automation.trigger}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Metrics</CardTitle>
          <CardDescription>Automation execution trends and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={executionMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="executions" fill="#3b82f6" name="Total Executions" />
              <Line yAxisId="right" type="monotone" dataKey="avgTime" stroke="#10b981" name="Avg Time (s)" />
              <Bar yAxisId="left" dataKey="errors" fill="#ef4444" name="Errors" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderTriggersTab = () => (
    <div className="space-y-6">
      {/* Trigger Categories */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Enhanced Triggers</CardTitle>
          <CardDescription>Intelligent triggers that adapt based on AI insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {triggers.map(trigger => (
              <div key={trigger.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{trigger.name}</h3>
                  <div className="flex items-center space-x-2">
                    {trigger.aiEnhanced && (
                      <Badge variant="default" className="text-xs">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Enhanced
                      </Badge>
                    )}
                    <Badge variant="outline">{trigger.count} triggers</Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{trigger.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {trigger.types.map(type => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Trigger Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Trigger Configuration</CardTitle>
          <CardDescription>AI-powered trigger optimization and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                trigger: 'User Inactivity Detection',
                aiFeature: 'Predictive Timing',
                description: 'AI predicts optimal intervention timing based on user patterns',
                improvement: '+23% engagement',
                status: 'active'
              },
              {
                trigger: 'Anomaly-Based Alerts',
                aiFeature: 'Pattern Recognition',
                description: 'Machine learning detects unusual patterns in user behavior',
                improvement: '+45% early detection',
                status: 'active'
              },
              {
                trigger: 'Sentiment-Based Triggers',
                aiFeature: 'NLP Analysis',
                description: 'Natural language processing analyzes user feedback sentiment',
                improvement: '+67% accuracy',
                status: 'beta'
              },
              {
                trigger: 'Predictive Churn Triggers',
                aiFeature: 'Risk Scoring',
                description: 'AI calculates churn probability and triggers interventions',
                improvement: '+34% retention',
                status: 'active'
              }
            ].map((config, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{config.trigger}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant={config.status === 'active' ? 'default' : 'secondary'}>
                      {config.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-green-600">
                      {config.improvement}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">{config.aiFeature}</span>
                </div>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActionsTab = () => (
    <div className="space-y-6">
      {/* Action Categories */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Enhanced Actions</CardTitle>
          <CardDescription>Intelligent actions that leverage AI for better outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actions.map(action => (
              <div key={action.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{action.name}</h3>
                  <Badge variant="outline">{action.count} actions</Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Available Actions:</h4>
                    <div className="flex flex-wrap gap-1">
                      {action.actions.map(act => (
                        <Badge key={act} variant="secondary" className="text-xs">
                          {act}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Brain className="h-4 w-4 mr-1 text-purple-500" />
                      AI Features:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {action.aiFeatures.map(feature => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Action Examples */}
      <Card>
        <CardHeader>
          <CardTitle>AI Action Examples</CardTitle>
          <CardDescription>Real-world examples of AI-enhanced automation actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: 'Personalized Email Generation',
                aiCapability: 'Natural Language Generation',
                example: 'AI generates personalized email content based on user behavior and preferences',
                metrics: '89% open rate, 34% click-through rate',
                icon: Mail
              },
              {
                action: 'Smart Task Assignment',
                aiCapability: 'Workload Optimization',
                example: 'AI assigns tasks to team members based on skills, availability, and workload',
                metrics: '67% faster completion, 23% better quality',
                icon: Users
              },
              {
                action: 'Intelligent Content Curation',
                aiCapability: 'Recommendation Engine',
                example: 'AI curates and recommends relevant content based on user interests',
                metrics: '78% engagement increase, 45% time on page',
                icon: FileText
              },
              {
                action: 'Predictive Notification Timing',
                aiCapability: 'Behavioral Analysis',
                example: 'AI determines optimal notification timing for maximum engagement',
                metrics: '56% higher open rates, 89% less unsubscribes',
                icon: Bell
              }
            ].map((example, index) => {
              const Icon = example.icon;
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <Icon className="h-8 w-8 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{example.action}</h3>
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {example.aiCapability}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{example.example}</p>
                      <div className="text-sm text-green-600 font-medium">{example.metrics}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLogsTab = () => (
    <div className="space-y-6">
      {/* Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>Latest automation executions with AI decision details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {executionLogs.map(log => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <h3 className="font-medium">{log.automation}</h3>
                    <Badge variant="outline" className="text-xs">
                      {log.trigger}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">{log.duration}s</span>
                    <span className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Brain className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium">AI Decision: </span>
                    <span className="text-sm text-muted-foreground">{log.aiDecision}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Performance</CardTitle>
          <CardDescription>Performance analytics for automation executions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">91.4%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">2.2s</div>
              <div className="text-sm text-muted-foreground">Avg Execution Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">8,927</div>
              <div className="text-sm text-muted-foreground">Total Executions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Error Analysis</CardTitle>
          <CardDescription>Common errors and AI-powered resolution suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                error: 'Insufficient Data for AI Decision',
                frequency: 34,
                impact: 'Medium',
                aiSuggestion: 'Implement data enrichment pipeline to gather missing user context',
                status: 'investigating'
              },
              {
                error: 'API Rate Limit Exceeded',
                frequency: 18,
                impact: 'High',
                aiSuggestion: 'Implement intelligent retry logic with exponential backoff',
                status: 'resolved'
              },
              {
                error: 'Model Prediction Confidence Too Low',
                frequency: 12,
                impact: 'Low',
                aiSuggestion: 'Retrain model with additional features or use ensemble method',
                status: 'planned'
              },
              {
                error: 'External Service Timeout',
                frequency: 8,
                impact: 'Medium',
                aiSuggestion: 'Implement circuit breaker pattern with fallback actions',
                status: 'resolved'
              }
            ].map((error, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{error.error}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{error.frequency} occurrences</Badge>
                    <Badge variant={error.impact === 'High' ? 'destructive' :
                                   error.impact === 'Medium' ? 'secondary' : 'default'}>
                      {error.impact} impact
                    </Badge>
                  </div>
                </div>
                <div className="flex items-start space-x-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{error.aiSuggestion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={error.status === 'resolved' ? 'default' :
                                 error.status === 'investigating' ? 'secondary' : 'outline'}>
                    {error.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Rocket className="h-4 w-4 mr-2" />
                    Apply Fix
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI-Powered Automation</h1>
        <p className="text-muted-foreground mt-2">
          Intelligent automation features with AI decision making
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Select value={selectedAutomation} onValueChange={setSelectedAutomation}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select automation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Automations</SelectItem>
                {automations.map(automation => (
                  <SelectItem key={automation.id} value={automation.id}>
                    {automation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={automationStatus} onValueChange={setAutomationStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => setIsCreating(true)}>
              <Bot className="h-4 w-4 mr-2" />
              Create Automation
            </Button>
            
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="triggers">Smart Triggers</TabsTrigger>
          <TabsTrigger value="actions">AI Actions</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="automations">
          {renderAutomationsTab()}
        </TabsContent>

        <TabsContent value="triggers">
          {renderTriggersTab()}
        </TabsContent>

        <TabsContent value="actions">
          {renderActionsTab()}
        </TabsContent>

        <TabsContent value="logs">
          {renderLogsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIPoweredAutomation;

