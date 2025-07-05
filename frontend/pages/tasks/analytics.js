import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Progress } from '../../src/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Target, 
  Calendar,
  Users,
  Zap,
  AlertTriangle,
  Star,
  Filter,
  Download,
  RefreshCw,
  PieChart,
  Activity,
  Award,
  Timer
} from 'lucide-react';

const TaskAnalytics = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchTaskAnalytics();
  }, [timeRange]);

  const fetchTaskAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching task analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockAnalyticsData = {
    overview: {
      totalTasks: 247,
      completedTasks: 189,
      overdueTasks: 12,
      avgCompletionTime: 2.4, // days
      productivityScore: 87.3,
      completionRate: 76.5,
      onTimeRate: 94.2,
      trends: {
        tasksCreated: '+15.2%',
        tasksCompleted: '+12.8%',
        productivity: '+8.7%',
        onTime: '+3.2%'
      }
    },
    performance: {
      dailyCompletion: [
        { date: '2024-01-01', completed: 8, created: 12 },
        { date: '2024-01-02', completed: 12, created: 10 },
        { date: '2024-01-03', completed: 6, created: 8 },
        { date: '2024-01-04', completed: 15, created: 14 },
        { date: '2024-01-05', completed: 9, created: 11 },
        { date: '2024-01-06', completed: 11, created: 9 },
        { date: '2024-01-07', completed: 13, created: 15 }
      ],
      weeklyTrends: {
        thisWeek: { completed: 74, created: 79, productivity: 93.7 },
        lastWeek: { completed: 68, created: 82, productivity: 82.9 },
        change: { completed: '+8.8%', created: '-3.7%', productivity: '+13.0%' }
      }
    },
    categories: [
      { name: 'Development', tasks: 89, completed: 72, completionRate: 80.9, avgTime: 3.2 },
      { name: 'Design', tasks: 45, completed: 38, completionRate: 84.4, avgTime: 2.1 },
      { name: 'Marketing', tasks: 34, completed: 29, completionRate: 85.3, avgTime: 1.8 },
      { name: 'Research', tasks: 28, completed: 22, completionRate: 78.6, avgTime: 4.1 },
      { name: 'Admin', tasks: 51, completed: 48, completionRate: 94.1, avgTime: 0.8 }
    ],
    priorities: {
      high: { total: 67, completed: 58, overdue: 5, avgTime: 1.9 },
      medium: { total: 124, completed: 95, overdue: 4, avgTime: 2.8 },
      low: { total: 56, completed: 36, overdue: 3, avgTime: 4.2 }
    },
    timeAnalysis: {
      peakHours: [9, 10, 11, 14, 15, 16],
      peakDays: ['Tuesday', 'Wednesday', 'Thursday'],
      avgSessionLength: 45, // minutes
      focusTime: 6.2, // hours per day
      distractionRate: 18.5 // percentage
    },
    teamComparison: {
      userRank: 3,
      totalMembers: 12,
      userScore: 87.3,
      teamAverage: 78.9,
      topPerformers: [
        { name: 'Sarah Johnson', score: 94.2, completionRate: 89.1 },
        { name: 'Mike Chen', score: 91.7, completionRate: 85.6 },
        { name: 'You', score: 87.3, completionRate: 76.5 },
        { name: 'Lisa Brown', score: 84.1, completionRate: 78.2 }
      ]
    },
    insights: [
      {
        type: 'productivity',
        title: 'Peak Performance Window',
        description: 'You complete 40% more tasks between 9-11 AM. Consider scheduling important work during this time.',
        impact: 'high',
        actionable: true
      },
      {
        type: 'efficiency',
        title: 'Task Batching Opportunity',
        description: 'Grouping similar admin tasks could reduce completion time by 25%.',
        impact: 'medium',
        actionable: true
      },
      {
        type: 'planning',
        title: 'Deadline Buffer',
        description: 'Adding 1-day buffer to high-priority tasks could reduce overdue rate by 60%.',
        impact: 'high',
        actionable: true
      }
    ],
    achievements: [
      { id: 1, name: 'Streak Master', description: '7-day completion streak', earned: true, date: 'Today' },
      { id: 2, name: 'Speed Demon', description: 'Completed 10 tasks in one day', earned: true, date: '3 days ago' },
      { id: 3, name: 'Consistency King', description: 'Meet daily goals for 30 days', earned: false, progress: 23 },
      { id: 4, name: 'Team Player', description: 'Help 5 team members with tasks', earned: false, progress: 3 }
    ]
  };

  const currentData = analyticsData || mockAnalyticsData;

  const getCompletionColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Task Analytics"
        subtitle="Comprehensive insights into your task performance and productivity patterns"
        icon={<BarChart3 className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Tasks', href: '/tasks' },
          { label: 'Analytics', href: '/tasks/analytics' }
        ]}
        actions={
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <Button variant="outline" onClick={fetchTaskAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'performance'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="h-4 w-4 inline mr-2" />
          Performance
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'insights'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Insights
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'team'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Team Comparison
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold">{currentData.overview.totalTasks}</p>
                    <p className="text-xs text-green-600">{currentData.overview.trends.tasksCreated} this period</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{currentData.overview.completedTasks}</p>
                    <p className="text-xs text-green-600">{currentData.overview.trends.tasksCompleted} this period</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Productivity Score</p>
                    <p className="text-2xl font-bold text-purple-600">{currentData.overview.productivityScore}</p>
                    <p className="text-xs text-green-600">{currentData.overview.trends.productivity} this period</p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                    <p className="text-2xl font-bold text-red-600">{currentData.overview.overdueTasks}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold">{currentData.overview.completionRate}%</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                    <p className="text-2xl font-bold text-green-600">{currentData.overview.onTimeRate}%</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Completion Time</p>
                    <p className="text-2xl font-bold">{currentData.overview.avgCompletionTime}d</p>
                  </div>
                  <Timer className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Task Categories Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.categories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.name}</span>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${getCompletionColor(category.completionRate)}`}>
                          {category.completionRate.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({category.completed}/{category.tasks})
                        </span>
                      </div>
                    </div>
                    <Progress value={category.completionRate} className="h-2" />
                    <div className="text-xs text-gray-500">
                      Avg completion time: {category.avgTime} days
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Priority Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Priority Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(currentData.priorities).map(([priority, data]) => (
                  <div key={priority} className="text-center p-4 bg-gray-50 rounded-lg">
                    <Badge variant={getPriorityColor(priority)} className="mb-2 capitalize">
                      {priority} Priority
                    </Badge>
                    <div className="space-y-2">
                      <div>
                        <div className="text-2xl font-bold">{data.completed}/{data.total}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div>
                        <div className="text-lg font-medium text-red-600">{data.overdue}</div>
                        <div className="text-sm text-gray-600">Overdue</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{data.avgTime}d</div>
                        <div className="text-xs text-gray-500">Avg Time</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Weekly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{currentData.performance.weeklyTrends.thisWeek.completed}</div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                  <div className="text-xs text-green-600 mt-1">{currentData.performance.weeklyTrends.change.completed} vs last week</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{currentData.performance.weeklyTrends.thisWeek.created}</div>
                  <div className="text-sm text-gray-600">Tasks Created</div>
                  <div className="text-xs text-red-600 mt-1">{currentData.performance.weeklyTrends.change.created} vs last week</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{currentData.performance.weeklyTrends.thisWeek.productivity}</div>
                  <div className="text-sm text-gray-600">Productivity Score</div>
                  <div className="text-xs text-green-600 mt-1">{currentData.performance.weeklyTrends.change.productivity} vs last week</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium mb-4">Peak Performance Hours</h4>
                  <div className="space-y-2">
                    {currentData.timeAnalysis.peakHours.map((hour) => (
                      <div key={hour} className="flex items-center gap-2">
                        <span className="text-sm font-medium w-12">{hour}:00</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 80 + 20}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Session Length</span>
                      <span className="font-medium">{currentData.timeAnalysis.avgSessionLength} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Daily Focus Time</span>
                      <span className="font-medium">{currentData.timeAnalysis.focusTime}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Distraction Rate</span>
                      <span className="font-medium text-red-600">{currentData.timeAnalysis.distractionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Peak Days</span>
                      <span className="font-medium">{currentData.timeAnalysis.peakDays.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentData.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 border rounded-lg text-center ${
                      achievement.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {achievement.earned ? '🏆' : '🔒'}
                    </div>
                    <h4 className="font-medium text-sm">{achievement.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                    {achievement.earned ? (
                      <p className="text-xs text-green-600 mt-2">Earned {achievement.date}</p>
                    ) : (
                      <div className="mt-2">
                        <Progress value={(achievement.progress / (achievement.name.includes('30') ? 30 : 10)) * 100} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">{achievement.progress} / {achievement.name.includes('30') ? 30 : achievement.name.includes('10') ? 10 : 5}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.insights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{insight.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {insight.type}
                      </Badge>
                      {insight.actionable && (
                        <Badge variant="default" className="text-xs">
                          Actionable
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Schedule Optimization</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Block your calendar from 9-11 AM for high-priority tasks to maximize your peak performance window.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Task Batching</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Group similar admin tasks together on Fridays to reduce context switching and improve efficiency.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900">Deadline Management</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Add 1-day buffers to high-priority tasks to reduce stress and improve quality of work.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Team Ranking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Performance Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.teamComparison.topPerformers.map((member, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                    member.name === 'You' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-gray-600">Completion Rate: {member.completionRate}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{member.score}</div>
                      <div className="text-sm text-gray-500">Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">#{currentData.teamComparison.userRank}</div>
                  <div className="text-sm text-gray-600">Your Rank</div>
                  <div className="text-xs text-gray-500 mt-1">out of {currentData.teamComparison.totalMembers} members</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{currentData.teamComparison.userScore}</div>
                  <div className="text-sm text-gray-600">Your Score</div>
                  <div className="text-xs text-green-500 mt-1">+{(currentData.teamComparison.userScore - currentData.teamComparison.teamAverage).toFixed(1)} vs team avg</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{currentData.teamComparison.teamAverage}</div>
                  <div className="text-sm text-gray-600">Team Average</div>
                  <div className="text-xs text-gray-500 mt-1">Baseline performance</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAnalytics;