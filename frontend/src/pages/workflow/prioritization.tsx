import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Target,
  Clock,
  AlertTriangle,
  TrendingUp,
  Filter,
  Search,
  Calendar,
  User,
  Flag,
  BarChart3,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  CheckCircle,
  Circle,
  Star,
  Zap,
  Brain,
  Settings,
  Plus,
  Eye,
  Edit3,
} from 'lucide-react';

// UI Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({
  children,
  className = '',
  size = 'default',
  variant = 'default',
  onClick,
  disabled,
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8',
  };
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className = '', variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 bg-white text-gray-700',
    destructive: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const Progress = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

const WorkflowPrioritization = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('matrix');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockData = {
    overview: {
      totalTasks: 156,
      highPriority: 23,
      mediumPriority: 89,
      lowPriority: 44,
      overdueTasks: 8,
      completedToday: 12,
    },
    matrix: {
      urgent_important: [
        {
          id: 1,
          title: 'Fix critical production bug',
          description: 'Database connection issues affecting 50% of users',
          assignee: 'Alex Johnson',
          dueDate: '2024-03-15',
          estimatedHours: 4,
          impact: 'High',
          effort: 'Medium',
          status: 'in_progress',
        },
        {
          id: 2,
          title: 'Complete security audit report',
          description: 'Quarterly security compliance review due today',
          assignee: 'Sarah Chen',
          dueDate: '2024-03-15',
          estimatedHours: 6,
          impact: 'High',
          effort: 'High',
          status: 'pending',
        },
      ],
      not_urgent_important: [
        {
          id: 3,
          title: 'Implement new authentication system',
          description: 'Upgrade to OAuth 2.0 for better security',
          assignee: 'Mike Rodriguez',
          dueDate: '2024-03-30',
          estimatedHours: 20,
          impact: 'High',
          effort: 'High',
          status: 'planning',
        },
        {
          id: 4,
          title: 'Performance optimization review',
          description: 'Analyze and improve application performance',
          assignee: 'Emily Davis',
          dueDate: '2024-04-05',
          estimatedHours: 12,
          impact: 'Medium',
          effort: 'Medium',
          status: 'pending',
        },
      ],
      urgent_not_important: [
        {
          id: 5,
          title: 'Update team meeting notes',
          description: 'Compile and distribute weekly meeting summary',
          assignee: 'Lisa Park',
          dueDate: '2024-03-16',
          estimatedHours: 1,
          impact: 'Low',
          effort: 'Low',
          status: 'pending',
        },
      ],
      not_urgent_not_important: [
        {
          id: 6,
          title: 'Organize development resources',
          description: 'Clean up shared drive and documentation',
          assignee: 'Tom Wilson',
          dueDate: '2024-04-15',
          estimatedHours: 3,
          impact: 'Low',
          effort: 'Low',
          status: 'pending',
        },
      ],
    },
    aiSuggestions: [
      {
        id: 1,
        type: 'priority_adjustment',
        title: 'Increase Priority: API Documentation',
        reason: 'Blocking 3 team members and external partners',
        confidence: 85,
        impact: 'Medium',
        recommendation: 'Move from Low to High priority',
      },
      {
        id: 2,
        type: 'resource_allocation',
        title: 'Reassign Database Migration',
        reason: 'Current assignee overloaded, better match available',
        confidence: 92,
        impact: 'High',
        recommendation: 'Reassign to Sarah Chen (database expertise)',
      },
      {
        id: 3,
        type: 'deadline_adjustment',
        title: 'Extend Frontend Redesign Deadline',
        reason: 'Scope increased by 40%, current timeline unrealistic',
        confidence: 78,
        impact: 'Medium',
        recommendation: 'Extend deadline by 1 week',
      },
    ],
    analytics: {
      priorityDistribution: {
        high: 23,
        medium: 89,
        low: 44,
      },
      completionRates: {
        high: 85,
        medium: 72,
        low: 45,
      },
      averageTimeToComplete: {
        high: '2.3 days',
        medium: '5.1 days',
        low: '12.8 days',
      },
      bottlenecks: [
        { area: 'Code Review', impact: 'High', tasks: 15 },
        { area: 'Testing', impact: 'Medium', tasks: 8 },
        { area: 'Deployment', impact: 'Low', tasks: 3 },
      ],
    },
    frameworks: [
      {
        id: 1,
        name: 'Eisenhower Matrix',
        description: 'Categorize tasks by urgency and importance',
        active: true,
        tasks: 156,
      },
      {
        id: 2,
        name: 'MoSCoW Method',
        description: "Must have, Should have, Could have, Won't have",
        active: false,
        tasks: 0,
      },
      {
        id: 3,
        name: 'Value vs Effort',
        description: 'Plot tasks on value/effort matrix',
        active: false,
        tasks: 0,
      },
      {
        id: 4,
        name: 'RICE Scoring',
        description: 'Reach, Impact, Confidence, Effort scoring',
        active: false,
        tasks: 0,
      },
    ],
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCurrentData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTaskAction = (taskId, action) => {
    console.log(`${action} task:`, taskId);
  };

  const handleApplySuggestion = suggestionId => {
    console.log('Applying AI suggestion:', suggestionId);
  };

  const handleFrameworkChange = frameworkId => {
    console.log('Switching to framework:', frameworkId);
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'planning':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuadrantTitle = quadrant => {
    switch (quadrant) {
      case 'urgent_important':
        return 'Urgent & Important (Do First)';
      case 'not_urgent_important':
        return 'Important, Not Urgent (Schedule)';
      case 'urgent_not_important':
        return 'Urgent, Not Important (Delegate)';
      case 'not_urgent_not_important':
        return 'Neither Urgent nor Important (Eliminate)';
      default:
        return '';
    }
  };

  const getQuadrantColor = quadrant => {
    switch (quadrant) {
      case 'urgent_important':
        return 'border-red-300 bg-red-50';
      case 'not_urgent_important':
        return 'border-blue-300 bg-blue-50';
      case 'urgent_not_important':
        return 'border-yellow-300 bg-yellow-50';
      case 'not_urgent_not_important':
        return 'border-gray-300 bg-gray-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Prioritization</h1>
            <p className="text-gray-600 mt-2">
              Organize and prioritize your work for maximum impact
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Framework
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {currentData.overview.totalTasks}
            </div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {currentData.overview.highPriority}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {currentData.overview.mediumPriority}
            </div>
            <div className="text-sm text-gray-600">Medium Priority</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {currentData.overview.lowPriority}
            </div>
            <div className="text-sm text-gray-600">Low Priority</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {currentData.overview.overdueTasks}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {currentData.overview.completedToday}
            </div>
            <div className="text-sm text-gray-600">Completed Today</div>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'matrix', label: 'Priority Matrix', icon: Target },
            { id: 'ai-suggestions', label: 'AI Suggestions', icon: Brain },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'frameworks', label: 'Frameworks', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
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

      {/* Content */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(currentData.matrix).map(([quadrant, tasks]) => (
            <Card key={quadrant} className={`${getQuadrantColor(quadrant)} border-2`}>
              <CardHeader>
                <CardTitle className="text-base">{getQuadrantTitle(quadrant)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No tasks in this quadrant</p>
                    </div>
                  ) : (
                    tasks.map(task => (
                      <div key={task.id} className="bg-white rounded-lg p-4 border shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{task.description}</p>

                            <div className="flex items-center gap-4 mt-3 text-xs">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-400" />
                                <span>{task.assignee}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span>{task.estimatedHours}h</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getPriorityColor(task.impact)} variant="outline">
                                Impact: {task.impact}
                              </Badge>
                              <Badge className={getStatusColor(task.status)}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleTaskAction(task.id, 'view')}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleTaskAction(task.id, 'edit')}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'ai-suggestions' && (
        <div className="space-y-4">
          {currentData.aiSuggestions.map(suggestion => (
            <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                        <p className="text-sm text-gray-600">{suggestion.reason}</p>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">{suggestion.type.replace('_', ' ')}</Badge>
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span>Confidence: {suggestion.confidence}%</span>
                        </div>
                        <Badge className={getPriorityColor(suggestion.impact)}>
                          {suggestion.impact} Impact
                        </Badge>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-blue-800">Recommendation:</div>
                        <div className="text-sm text-blue-700">{suggestion.recommendation}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApplySuggestion(suggestion.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Priority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {currentData.analytics.priorityDistribution.high}
                  </div>
                  <div className="text-sm text-gray-600">High Priority</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(
                      (currentData.analytics.priorityDistribution.high /
                        currentData.overview.totalTasks) *
                        100
                    )}
                    % of total
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {currentData.analytics.priorityDistribution.medium}
                  </div>
                  <div className="text-sm text-gray-600">Medium Priority</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(
                      (currentData.analytics.priorityDistribution.medium /
                        currentData.overview.totalTasks) *
                        100
                    )}
                    % of total
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {currentData.analytics.priorityDistribution.low}
                  </div>
                  <div className="text-sm text-gray-600">Low Priority</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(
                      (currentData.analytics.priorityDistribution.low /
                        currentData.overview.totalTasks) *
                        100
                    )}
                    % of total
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Completion Rates by Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">High Priority</span>
                    <span className="text-sm text-gray-600">
                      {currentData.analytics.completionRates.high}%
                    </span>
                  </div>
                  <Progress value={currentData.analytics.completionRates.high} className="h-3" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Medium Priority</span>
                    <span className="text-sm text-gray-600">
                      {currentData.analytics.completionRates.medium}%
                    </span>
                  </div>
                  <Progress value={currentData.analytics.completionRates.medium} className="h-3" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Low Priority</span>
                    <span className="text-sm text-gray-600">
                      {currentData.analytics.completionRates.low}%
                    </span>
                  </div>
                  <Progress value={currentData.analytics.completionRates.low} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottlenecks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Current Bottlenecks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentData.analytics.bottlenecks.map((bottleneck, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{bottleneck.area}</div>
                      <div className="text-sm text-gray-600">{bottleneck.tasks} tasks affected</div>
                    </div>
                    <Badge className={getPriorityColor(bottleneck.impact)}>
                      {bottleneck.impact} Impact
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Average Time to Complete */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Average Time to Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {currentData.analytics.averageTimeToComplete.high}
                  </div>
                  <div className="text-sm text-gray-600">High Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {currentData.analytics.averageTimeToComplete.medium}
                  </div>
                  <div className="text-sm text-gray-600">Medium Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentData.analytics.averageTimeToComplete.low}
                  </div>
                  <div className="text-sm text-gray-600">Low Priority</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'frameworks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentData.frameworks.map(framework => (
            <Card
              key={framework.id}
              className={`hover:shadow-md transition-shadow ${framework.active ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{framework.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{framework.description}</p>
                    </div>
                    {framework.active && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tasks using this framework:</span>
                    <span className="font-medium">{framework.tasks}</span>
                  </div>

                  <Button
                    className="w-full"
                    variant={framework.active ? 'outline' : 'default'}
                    onClick={() => handleFrameworkChange(framework.id)}
                    disabled={framework.active}
                  >
                    {framework.active ? 'Currently Active' : 'Switch to This Framework'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowPrioritization;
