import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Workflow, Clock, TrendingUp, Zap, AlertCircle, CheckCircle,
  BarChart3, Settings, Home, Download, Play, Pause, RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Chart } from '../components/ui/Chart';

const WorkflowOptimizationPage = ({ isDemoMode = false, onLogout }) => {
  const navigate = useNavigate();
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Use prop if provided, otherwise fallback to localStorage
  const isDemo = isDemoMode || localStorage.getItem('demo_mode') === 'true';

  const handleHomeClick = () => {
    navigate(isDemo ? '/dashboard' : '/');
  };

  // Mock workflow metrics
  const workflowMetrics = {
    totalWorkflows: 12,
    activeWorkflows: 8,
    avgEfficiency: 78,
    timeSaved: 156,
    automationRate: 65,
    bottlenecks: 3
  };

  // Mock workflow efficiency data over time
  const efficiencyData = [
    { name: 'Week 1', efficiency: 65, automation: 45, timeSaved: 20 },
    { name: 'Week 2', efficiency: 68, automation: 50, timeSaved: 35 },
    { name: 'Week 3', efficiency: 72, automation: 55, timeSaved: 45 },
    { name: 'Week 4', efficiency: 75, automation: 60, timeSaved: 60 },
    { name: 'Week 5', efficiency: 78, automation: 65, timeSaved: 80 },
    { name: 'Week 6', efficiency: 78, automation: 65, timeSaved: 95 }
  ];

  // Mock workflow processes
  const workflows = [
    {
      id: 1,
      name: 'Code Review Process',
      category: 'Development',
      status: 'active',
      efficiency: 85,
      avgTime: '2.5 hours',
      bottlenecks: 1,
      automationLevel: 70,
      steps: [
        { name: 'Code Submission', duration: 5, automated: true, status: 'optimized' },
        { name: 'Automated Testing', duration: 15, automated: true, status: 'optimized' },
        { name: 'Peer Review', duration: 120, automated: false, status: 'bottleneck' },
        { name: 'Approval & Merge', duration: 10, automated: true, status: 'optimized' }
      ],
      suggestions: [
        'Implement AI-assisted code review',
        'Set up automated review assignment',
        'Add review time limits'
      ]
    },
    {
      id: 2,
      name: 'Bug Triage Workflow',
      category: 'Quality Assurance',
      status: 'active',
      efficiency: 65,
      avgTime: '4.2 hours',
      bottlenecks: 2,
      automationLevel: 45,
      steps: [
        { name: 'Bug Report', duration: 10, automated: false, status: 'manual' },
        { name: 'Initial Assessment', duration: 60, automated: false, status: 'bottleneck' },
        { name: 'Priority Assignment', duration: 30, automated: false, status: 'bottleneck' },
        { name: 'Developer Assignment', duration: 15, automated: true, status: 'optimized' },
        { name: 'Resolution Tracking', duration: 120, automated: true, status: 'optimized' }
      ],
      suggestions: [
        'Auto-categorize bugs using ML',
        'Implement priority scoring algorithm',
        'Add automated severity detection'
      ]
    },
    {
      id: 3,
      name: 'Feature Request Pipeline',
      category: 'Product Management',
      status: 'active',
      efficiency: 72,
      avgTime: '6.8 hours',
      bottlenecks: 1,
      automationLevel: 55,
      steps: [
        { name: 'Request Submission', duration: 15, automated: true, status: 'optimized' },
        { name: 'Stakeholder Review', duration: 180, automated: false, status: 'bottleneck' },
        { name: 'Technical Assessment', duration: 120, automated: false, status: 'manual' },
        { name: 'Roadmap Planning', duration: 90, automated: true, status: 'optimized' },
        { name: 'Development Queue', duration: 5, automated: true, status: 'optimized' }
      ],
      suggestions: [
        'Implement automated impact scoring',
        'Add stakeholder notification system',
        'Create feature complexity estimation'
      ]
    },
    {
      id: 4,
      name: 'Deployment Pipeline',
      category: 'DevOps',
      status: 'active',
      efficiency: 92,
      avgTime: '45 minutes',
      bottlenecks: 0,
      automationLevel: 95,
      steps: [
        { name: 'Build Process', duration: 10, automated: true, status: 'optimized' },
        { name: 'Automated Testing', duration: 20, automated: true, status: 'optimized' },
        { name: 'Security Scan', duration: 8, automated: true, status: 'optimized' },
        { name: 'Staging Deployment', duration: 5, automated: true, status: 'optimized' },
        { name: 'Production Release', duration: 2, automated: true, status: 'optimized' }
      ],
      suggestions: [
        'Add performance monitoring',
        'Implement rollback automation',
        'Enhance security scanning'
      ]
    }
  ];

  // Mock optimization opportunities
  const optimizationOpportunities = [
    {
      id: 1,
      title: 'Automate Bug Priority Assignment',
      impact: 'High',
      effort: 'Medium',
      timeSavings: '8 hours/week',
      description: 'Use ML to automatically assign bug priorities based on severity, affected users, and business impact.',
      estimatedROI: '300%'
    },
    {
      id: 2,
      title: 'Streamline Code Review Process',
      impact: 'Medium',
      effort: 'Low',
      timeSavings: '5 hours/week',
      description: 'Implement automated reviewer assignment and review time tracking.',
      estimatedROI: '200%'
    },
    {
      id: 3,
      title: 'Feature Request Auto-Categorization',
      impact: 'Medium',
      effort: 'High',
      timeSavings: '12 hours/week',
      description: 'Automatically categorize and route feature requests to appropriate teams.',
      estimatedROI: '250%'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'paused':
        return <Badge variant="warning">Paused</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStepStatusIcon = (status) => {
    switch (status) {
      case 'optimized':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'bottleneck':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'manual':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'High':
        return <Badge variant="destructive">High Impact</Badge>;
      case 'Medium':
        return <Badge variant="warning">Medium Impact</Badge>;
      case 'Low':
        return <Badge variant="secondary">Low Impact</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getEffortBadge = (effort) => {
    switch (effort) {
      case 'High':
        return <Badge variant="destructive">High Effort</Badge>;
      case 'Medium':
        return <Badge variant="warning">Medium Effort</Badge>;
      case 'Low':
        return <Badge variant="success">Low Effort</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workflow Optimization</h1>
          <p className="text-muted-foreground">Analyze and optimize team workflows for maximum efficiency</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleHomeClick}>
            <Home className="mr-2 h-4 w-4" />
            {isDemo ? 'Back to Dashboard' : 'Home'}
          </Button>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{workflowMetrics.totalWorkflows}</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{workflowMetrics.activeWorkflows}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Efficiency</p>
                <p className="text-2xl font-bold">{workflowMetrics.avgEfficiency}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold">{workflowMetrics.timeSaved}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Automation</p>
                <p className="text-2xl font-bold">{workflowMetrics.automationRate}%</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bottlenecks</p>
                <p className="text-2xl font-bold text-red-600">{workflowMetrics.bottlenecks}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Efficiency Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Efficiency Trends</CardTitle>
            <CardDescription>
              Track efficiency, automation, and time savings over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              data={efficiencyData.map(d => d.efficiency)}
              secondaryData={efficiencyData.map(d => d.automation)}
              labels={efficiencyData.map(d => d.name)}
              height={320}
              lineColor="#3b82f6"
              secondaryLineColor="#10b981"
            />
          </CardContent>
        </Card>

        {/* Optimization Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle>Optimization Opportunities</CardTitle>
            <CardDescription>
              High-impact improvements to consider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizationOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{opportunity.title}</h4>
                    <div className="flex items-center space-x-2">
                      {getImpactBadge(opportunity.impact)}
                      {getEffortBadge(opportunity.effort)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium text-green-600">Saves:</span> {opportunity.timeSavings}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-blue-600">ROI:</span> {opportunity.estimatedROI}
                    </div>
                  </div>
                  
                  <Button size="sm" className="w-full mt-3">
                    <Zap className="mr-2 h-4 w-4" />
                    Implement
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Details */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of current workflows and bottlenecks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold">{workflow.name}</h3>
                    <Badge variant="outline">{workflow.category}</Badge>
                    {getStatusBadge(workflow.status)}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Efficiency</div>
                      <div className="font-semibold">{workflow.efficiency}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Avg Time</div>
                      <div className="font-semibold">{workflow.avgTime}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Automation</div>
                      <div className="font-semibold">{workflow.automationLevel}%</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Workflow Steps</div>
                  <div className="space-y-2">
                    {workflow.steps.map((step, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          {getStepStatusIcon(step.status)}
                          <span className="font-medium">{step.name}</span>
                          {step.automated && <Badge variant="success" size="sm">Automated</Badge>}
                        </div>
                        <div className="text-sm text-gray-600">
                          {step.duration} min
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {workflow.bottlenecks > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">
                        {workflow.bottlenecks} Bottleneck{workflow.bottlenecks > 1 ? 's' : ''} Identified
                      </span>
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="text-sm text-gray-600 mb-2">Optimization Suggestions</div>
                  <div className="flex flex-wrap gap-2">
                    {workflow.suggestions.map((suggestion, index) => (
                      <Badge key={index} variant="outline">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <Button size="sm" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Optimize
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowOptimizationPage;