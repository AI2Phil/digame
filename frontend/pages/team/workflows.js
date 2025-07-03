import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../src/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/avatar';
import { Progress } from '../../src/components/ui/progress';
import { 
  Workflow, 
  Play, 
  Pause, 
  Square, 
  Users, 
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Copy,
  Trash2,
  MoreHorizontal,
  ArrowRight,
  ArrowDown,
  GitBranch,
  Zap,
  Target,
  Calendar,
  Activity,
  FileText,
  MessageSquare,
  Bell,
  Share2,
  Download,
  Upload,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  StopCircle,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack
} from 'lucide-react';

const TeamWorkflows = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');
  const [workflowsData, setWorkflowsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchWorkflowsData();
  }, []);

  const fetchWorkflowsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team/workflows', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkflowsData(data);
      }
    } catch (error) {
      console.error('Error fetching workflows data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockWorkflowsData = {
    overview: {
      totalWorkflows: 24,
      activeWorkflows: 18,
      completedToday: 156,
      averageExecutionTime: '2.3 min',
      successRate: 94.7,
      totalExecutions: 1247,
      automationSavings: '45.2 hours',
      errorRate: 2.1
    },
    categories: [
      { id: 'development', name: 'Development', count: 8, color: 'blue' },
      { id: 'deployment', name: 'Deployment', count: 6, color: 'green' },
      { id: 'testing', name: 'Testing', count: 4, color: 'purple' },
      { id: 'communication', name: 'Communication', count: 3, color: 'orange' },
      { id: 'monitoring', name: 'Monitoring', count: 3, color: 'red' }
    ],
    workflows: [
      {
        id: 1,
        name: 'Code Review Process',
        description: 'Automated code review workflow with quality checks and notifications',
        category: 'development',
        status: 'active',
        trigger: 'Pull Request',
        owner: 'Mike Chen',
        team: ['Sarah Johnson', 'Alex Rodriguez', 'Tom Wilson'],
        created: '2024-01-10',
        lastRun: '2024-01-15 14:30',
        executions: 89,
        successRate: 96.6,
        avgDuration: '3.2 min',
        steps: [
          { id: 1, name: 'Code Analysis', type: 'automated', status: 'completed' },
          { id: 2, name: 'Security Scan', type: 'automated', status: 'completed' },
          { id: 3, name: 'Assign Reviewers', type: 'automated', status: 'completed' },
          { id: 4, name: 'Send Notifications', type: 'automated', status: 'completed' },
          { id: 5, name: 'Manual Review', type: 'manual', status: 'pending' }
        ],
        metrics: {
          timesSaved: '12.4 hours',
          errorReduction: '34%',
          teamSatisfaction: 4.7
        }
      },
      {
        id: 2,
        name: 'Daily Standup Automation',
        description: 'Collects updates from team members and generates standup reports',
        category: 'communication',
        status: 'active',
        trigger: 'Schedule (Daily 9 AM)',
        owner: 'Sarah Johnson',
        team: ['Mike Chen', 'Lisa Brown', 'David Wilson', 'Emma Garcia'],
        created: '2024-01-05',
        lastRun: '2024-01-15 09:00',
        executions: 156,
        successRate: 98.1,
        avgDuration: '1.8 min',
        steps: [
          { id: 1, name: 'Collect Updates', type: 'automated', status: 'completed' },
          { id: 2, name: 'Generate Report', type: 'automated', status: 'completed' },
          { id: 3, name: 'Send to Team', type: 'automated', status: 'completed' },
          { id: 4, name: 'Schedule Meeting', type: 'automated', status: 'completed' }
        ],
        metrics: {
          timesSaved: '8.7 hours',
          participationRate: '94%',
          teamSatisfaction: 4.5
        }
      },
      {
        id: 3,
        name: 'Bug Triage Workflow',
        description: 'Automatically categorizes and assigns bugs based on severity and type',
        category: 'development',
        status: 'active',
        trigger: 'Bug Report',
        owner: 'David Wilson',
        team: ['Mike Chen', 'Alex Rodriguez'],
        created: '2024-01-08',
        lastRun: '2024-01-15 11:45',
        executions: 67,
        successRate: 91.0,
        avgDuration: '2.1 min',
        steps: [
          { id: 1, name: 'Analyze Bug Report', type: 'automated', status: 'completed' },
          { id: 2, name: 'Categorize Severity', type: 'automated', status: 'completed' },
          { id: 3, name: 'Assign to Developer', type: 'automated', status: 'completed' },
          { id: 4, name: 'Create Tracking Ticket', type: 'automated', status: 'completed' },
          { id: 5, name: 'Notify Stakeholders', type: 'automated', status: 'completed' }
        ],
        metrics: {
          timesSaved: '15.2 hours',
          resolutionTime: '-23%',
          accuracy: '91%'
        }
      },
      {
        id: 4,
        name: 'Deployment Pipeline',
        description: 'Complete CI/CD pipeline with testing, building, and deployment',
        category: 'deployment',
        status: 'running',
        trigger: 'Git Push to Main',
        owner: 'Mike Chen',
        team: ['Sarah Johnson', 'David Wilson'],
        created: '2024-01-12',
        lastRun: '2024-01-15 16:20',
        executions: 34,
        successRate: 88.2,
        avgDuration: '8.5 min',
        steps: [
          { id: 1, name: 'Run Tests', type: 'automated', status: 'completed' },
          { id: 2, name: 'Build Application', type: 'automated', status: 'completed' },
          { id: 3, name: 'Security Scan', type: 'automated', status: 'running' },
          { id: 4, name: 'Deploy to Staging', type: 'automated', status: 'pending' },
          { id: 5, name: 'Run Integration Tests', type: 'automated', status: 'pending' },
          { id: 6, name: 'Deploy to Production', type: 'manual', status: 'pending' }
        ],
        metrics: {
          deploymentFrequency: '+45%',
          leadTime: '-32%',
          failureRate: '11.8%'
        }
      },
      {
        id: 5,
        name: 'Performance Monitoring',
        description: 'Monitors application performance and alerts on issues',
        category: 'monitoring',
        status: 'paused',
        trigger: 'Performance Threshold',
        owner: 'Lisa Brown',
        team: ['Mike Chen', 'David Wilson'],
        created: '2024-01-14',
        lastRun: '2024-01-15 12:15',
        executions: 23,
        successRate: 95.7,
        avgDuration: '1.2 min',
        steps: [
          { id: 1, name: 'Check Metrics', type: 'automated', status: 'completed' },
          { id: 2, name: 'Analyze Trends', type: 'automated', status: 'completed' },
          { id: 3, name: 'Generate Alerts', type: 'automated', status: 'completed' },
          { id: 4, name: 'Notify Team', type: 'automated', status: 'completed' }
        ],
        metrics: {
          issuesDetected: '12',
          responseTime: '2.3 min',
          uptime: '99.7%'
        }
      },
      {
        id: 6,
        name: 'Weekly Report Generation',
        description: 'Generates comprehensive weekly team performance reports',
        category: 'communication',
        status: 'scheduled',
        trigger: 'Schedule (Weekly Friday)',
        owner: 'Sarah Johnson',
        team: ['Mike Chen', 'Lisa Brown', 'David Wilson', 'Emma Garcia'],
        created: '2024-01-11',
        lastRun: '2024-01-12 17:00',
        executions: 3,
        successRate: 100.0,
        avgDuration: '4.7 min',
        steps: [
          { id: 1, name: 'Collect Data', type: 'automated', status: 'pending' },
          { id: 2, name: 'Generate Charts', type: 'automated', status: 'pending' },
          { id: 3, name: 'Create Report', type: 'automated', status: 'pending' },
          { id: 4, name: 'Send to Stakeholders', type: 'automated', status: 'pending' }
        ],
        metrics: {
          reportAccuracy: '100%',
          timesSaved: '3.2 hours',
          stakeholderSatisfaction: 4.8
        }
      }
    ],
    templates: [
      {
        id: 1,
        name: 'Code Review Template',
        description: 'Standard code review workflow template',
        category: 'development',
        uses: 15,
        rating: 4.8,
        steps: 5
      },
      {
        id: 2,
        name: 'Bug Tracking Template',
        description: 'Template for bug reporting and tracking',
        category: 'development',
        uses: 12,
        rating: 4.6,
        steps: 4
      },
      {
        id: 3,
        name: 'Deployment Template',
        description: 'CI/CD deployment pipeline template',
        category: 'deployment',
        uses: 8,
        rating: 4.9,
        steps: 6
      }
    ],
    analytics: {
      executionTrends: [45, 52, 48, 61, 55, 67, 72],
      successRates: [94, 96, 93, 95, 97, 94, 95],
      categories: {
        development: 45,
        deployment: 25,
        testing: 15,
        communication: 10,
        monitoring: 5
      }
    }
  };

  const currentData = workflowsData || mockWorkflowsData;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <PlayCircle className="h-4 w-4 text-green-600" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'paused': return <PauseCircle className="h-4 w-4 text-yellow-600" />;
      case 'scheduled': return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <StopCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStepStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'pending': return 'text-gray-400';
      case 'error': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      development: 'bg-blue-100 text-blue-800',
      deployment: 'bg-green-100 text-green-800',
      testing: 'bg-purple-100 text-purple-800',
      communication: 'bg-orange-100 text-orange-800',
      monitoring: 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredWorkflows = currentData.workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || workflow.category === selectedCategory;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && ['active', 'running'].includes(workflow.status)) ||
                      (activeTab === 'paused' && workflow.status === 'paused') ||
                      (activeTab === 'scheduled' && workflow.status === 'scheduled');
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleWorkflowAction = async (workflowId, action) => {
    try {
      const response = await fetch(`/api/team/workflows/${workflowId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchWorkflowsData();
      }
    } catch (error) {
      console.error(`Error ${action} workflow:`, error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Team Workflows"
        subtitle="Automate and optimize team processes and collaboration"
        icon={<Workflow className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Team', href: '/team' },
          { label: 'Workflows', href: '/team/workflows' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <PlayCircle className="h-4 w-4 inline mr-2" />
          Active
        </button>
        <button
          onClick={() => setActiveTab('paused')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'paused'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <PauseCircle className="h-4 w-4 inline mr-2" />
          Paused
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'scheduled'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Scheduled
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
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

      {activeTab !== 'templates' && activeTab !== 'analytics' && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                    <p className="text-2xl font-bold text-blue-600">{currentData.overview.totalWorkflows}</p>
                  </div>
                  <Workflow className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                    <p className="text-2xl font-bold text-green-600">{currentData.overview.activeWorkflows}</p>
                  </div>
                  <PlayCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{currentData.overview.successRate}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Time Saved</p>
                    <p className="text-2xl font-bold text-orange-600">{currentData.overview.automationSavings}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {currentData.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Workflows Grid */}
          <div className="space-y-4">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded">
                        {getStatusIcon(workflow.status)}
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">{workflow.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <Badge className={getCategoryColor(workflow.category)}>
                            {workflow.category}
                          </Badge>
                          <span>Owner: {workflow.owner}</span>
                          <span>Trigger: {workflow.trigger}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Workflow Steps */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Workflow Steps</p>
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                            step.status === 'completed' ? 'bg-green-100 text-green-800' :
                            step.status === 'running' ? 'bg-blue-100 text-blue-800' :
                            step.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {step.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                            {step.status === 'running' && <Activity className="h-3 w-3" />}
                            {step.status === 'pending' && <Clock className="h-3 w-3" />}
                            {step.status === 'error' && <AlertTriangle className="h-3 w-3" />}
                            <span>{step.name}</span>
                          </div>
                          {index < workflow.steps.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{workflow.executions}</div>
                      <div className="text-xs text-gray-600">Executions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{workflow.successRate}%</div>
                      <div className="text-xs text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{workflow.avgDuration}</div>
                      <div className="text-xs text-gray-600">Avg Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{workflow.team.length}</div>
                      <div className="text-xs text-gray-600">Team Members</div>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Team:</span>
                      <div className="flex -space-x-2">
                        {workflow.team.slice(0, 3).map((member, index) => (
                          <Avatar key={index} className="h-6 w-6 border-2 border-white">
                            <AvatarFallback className="text-xs">
                              {member.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {workflow.team.length > 3 && (
                          <div className="h-6 w-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{workflow.team.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {workflow.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleWorkflowAction(workflow.id, 'pause')}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      {workflow.status === 'paused' && (
                        <Button 
                          size="sm"
                          onClick={() => handleWorkflowAction(workflow.id, 'resume')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-2 text-right">
                    Last run: {workflow.lastRun}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{template.uses}</div>
                    <div className="text-xs text-gray-600">Uses</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{template.steps}</div>
                    <div className="text-xs text-gray-600">Steps</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">{template.rating}</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </div>

                <Button className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Executions</p>
                    <p className="text-2xl font-bold text-blue-600">{currentData.overview.totalExecutions}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Execution Time</p>
                    <p className="text-2xl font-bold text-green-600">{currentData.overview.averageExecutionTime}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold text-red-600">{currentData.overview.errorRate}%</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Today</p>
                    <p className="text-2xl font-bold text-purple-600">{currentData.overview.completedToday}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getCategoryColor(category.id)}>
                        {category.name}
                      </Badge>
                      <span className="text-sm text-gray-600">{category.count} workflows</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(category.count / currentData.overview.totalWorkflows) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round((category.count / currentData.overview.totalWorkflows) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Execution Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Execution Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {currentData.analytics.executionTrends.map((value, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div
                      className="bg-blue-500 rounded-t"
                      style={{
                        height: `${(value / Math.max(...currentData.analytics.executionTrends)) * 200}px`,
                        width: '40px'
                      }}
                    ></div>
                    <span className="text-xs text-gray-600">Day {index + 1}</span>
                    <span className="text-xs font-medium">{value}</span>
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

export default TeamWorkflows;