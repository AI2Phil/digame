import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Brain, 
  Zap, 
  BarChart3, 
  ArrowLeft,
  Plus,
  Filter,
  RefreshCw,
  Target,
  TrendingUp
} from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/Select';

export default function TaskManagementPage({ isDemoMode, onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  // Mock data for demo
  const mockTasks = [
    {
      id: 1,
      description: "Consider automating or reviewing process: Daily Reporting",
      status: "suggested",
      priority_score: 0.85,
      source_type: "process_note",
      created_at: "2025-05-24T10:00:00Z",
      notes: "Based on process: Open Excel -> Run Macro -> Email Report\nOccurrences: 15, Last Seen: 2025-05-23 14:30"
    },
    {
      id: 2,
      description: "Consider automating or reviewing process: Client Onboarding",
      status: "acknowledged",
      priority_score: 0.72,
      source_type: "process_note",
      created_at: "2025-05-23T09:15:00Z",
      notes: "Based on process: Create Account -> Send Welcome Email -> Schedule Call\nOccurrences: 8, Last Seen: 2025-05-22 16:45"
    },
    {
      id: 3,
      description: "Consider automating or reviewing process: Bug Triage",
      status: "in_progress",
      priority_score: 0.91,
      source_type: "process_note",
      created_at: "2025-05-22T14:20:00Z",
      notes: "Based on process: Check Jira -> Reproduce Bug -> Assign Priority\nOccurrences: 22, Last Seen: 2025-05-24 11:15"
    }
  ];

  useEffect(() => {
    if (isDemoMode) {
      setTasks(mockTasks);
    } else {
      // TODO: Fetch real tasks from API
      // fetchTasks();
    }
  }, [isDemoMode]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'suggested': return 'bg-blue-100 text-blue-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'suggested': return <AlertCircle className="h-4 w-4" />;
      case 'acknowledged': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (score) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-orange-600';
    return 'text-green-600';
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const handleAcknowledgeTask = async (taskId) => {
    if (isDemoMode) {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'acknowledged' } : task
      ));
    } else {
      // TODO: Call API to acknowledge task
    }
  };

  const handleTriggerSuggestions = async () => {
    setLoading(true);
    if (isDemoMode) {
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        // Add a new mock suggestion
        const newTask = {
          id: Date.now(),
          description: "Consider automating or reviewing process: Weekly Status Updates",
          status: "suggested",
          priority_score: 0.68,
          source_type: "process_note",
          created_at: new Date().toISOString(),
          notes: "Based on process: Collect Data -> Format Report -> Send to Team\nOccurrences: 5, Last Seen: " + new Date().toISOString().split('T')[0] + " 09:30"
        };
        setTasks(prev => [newTask, ...prev]);
      }, 1500);
    } else {
      // TODO: Call API to trigger suggestions
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-gray-500">Active suggestions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(t => t.priority_score >= 0.8).length}
            </div>
            <p className="text-xs text-gray-500">Needs attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'in_progress').length}
            </div>
            <p className="text-xs text-gray-500">Being worked on</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.length > 0 ? (tasks.reduce((sum, t) => sum + t.priority_score, 0) / tasks.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-gray-500">Priority score</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={handleTriggerSuggestions}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          {loading ? 'Generating...' : 'Generate AI Suggestions'}
        </Button>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="border border-gray-300 rounded-md px-3 py-1 text-sm w-[180px]">
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="suggested">Suggested</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(task.priority_score)}>
                      Priority: {(task.priority_score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{task.description}</CardTitle>
                  <CardDescription className="mt-2">
                    {task.notes.split('\n')[0]}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {task.status === 'suggested' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleAcknowledgeTask(task.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Acknowledge
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        
        {filteredTasks.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? "No tasks have been generated yet. Click 'Generate AI Suggestions' to get started."
                  : `No tasks with status '${filter}' found.`
                }
              </p>
              {filter === 'all' && (
                <Button onClick={handleTriggerSuggestions} disabled={loading}>
                  Generate AI Suggestions
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderSuggestionsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Task Suggestions
        </CardTitle>
        <CardDescription>
          AI analyzes your process notes and suggests tasks for automation or optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• AI monitors your repeated processes and workflows</li>
              <li>• Identifies patterns that occur frequently (3+ times in 30 days)</li>
              <li>• Suggests automation opportunities based on complexity and frequency</li>
              <li>• Prioritizes suggestions based on potential time savings</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleTriggerSuggestions}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            {loading ? 'Analyzing Processes...' : 'Generate New Suggestions'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAutomationTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-600" />
          Process Automation
        </CardTitle>
        <CardDescription>
          Automate repetitive tasks and workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Zap className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Automation Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            We're building powerful automation tools to help you streamline your workflows.
          </p>
          <Button variant="outline">
            Get Notified When Available
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderInsightsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          Task Analytics
        </CardTitle>
        <CardDescription>
          Insights into your task patterns and productivity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            Detailed analytics and insights about your task management patterns.
          </p>
          <Button variant="outline">
            Get Notified When Available
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="digame-logo">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Task Management</span>
              </div>
              {isDemoMode && (
                <Badge variant="secondary">Demo Mode</Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Task Management</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let AI analyze your work patterns and suggest tasks for automation and optimization.
          </p>
        </div>

        {/* Task Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Suggestions</span>
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Automation</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="suggestions">
            {renderSuggestionsTab()}
          </TabsContent>

          <TabsContent value="automation">
            {renderAutomationTab()}
          </TabsContent>

          <TabsContent value="insights">
            {renderInsightsTab()}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}