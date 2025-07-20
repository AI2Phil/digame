import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import {
import { apiClient, replaceApiUrl } from '../../lib/api-config';

  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  MessageSquare,
  Target,
  BarChart3,
  Calendar,
  Star,
  Award,
  Activity,
  Zap,
  AlertTriangle,
  Plus,
  Settings,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';

const TeamDashboard: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchTeamData();
  }, [timeRange]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);

      // Try to get backend service info first
      let backendUrl = '${replaceApiUrl("")}'; // Default fallback
      try {
        const serviceResponse = await fetch('${replaceApiUrl("")}/service-info');
        if (serviceResponse.ok) {
          const serviceInfo = await serviceResponse.json();
          backendUrl = serviceInfo.url || `http://localhost:${serviceInfo.port}`;
        }
      } catch (serviceError) {
        console.log('Using default backend URL');
      }

      const response = await fetch(`${backendUrl}/team/dashboard?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTeamData(result.data);
        } else {
          console.error('API returned error:', result.message);
          // Fall back to mock data if API fails
          setTeamData(null);
        }
      } else {
        console.error('Failed to fetch team data:', response.status);
        // Fall back to mock data if API fails
        setTeamData(null);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      // Fall back to mock data if API fails
      setTeamData(null);
    } finally {
      setLoading(false);
    }
  };

  const mockTeamData = {
    overview: {
      totalMembers: 12,
      activeMembers: 10,
      teamProductivity: 87.3,
      completedTasks: 156,
      ongoingProjects: 4,
      teamSatisfaction: 4.2,
      collaborationScore: 92.1,
      trends: {
        productivity: '+12.5%',
        tasks: '+8.7%',
        satisfaction: '+0.3',
        collaboration: '+5.2%',
      },
    },
    members: [
      {
        id: 1,
        name: 'Sarah Johnson',
        role: 'Team Lead',
        avatar: 'SJ',
        status: 'online',
        productivity: 94.2,
        tasksCompleted: 23,
        currentTasks: 5,
        lastActive: 'now',
        skills: ['Leadership', 'Project Management', 'Strategy'],
        workload: 85,
        satisfaction: 4.5,
      },
      {
        id: 2,
        name: 'Mike Chen',
        role: 'Senior Developer',
        avatar: 'MC',
        status: 'online',
        productivity: 91.7,
        tasksCompleted: 28,
        currentTasks: 4,
        lastActive: '5 min ago',
        skills: ['React', 'Node.js', 'Database'],
        workload: 92,
        satisfaction: 4.3,
      },
      {
        id: 3,
        name: 'Lisa Brown',
        role: 'UX Designer',
        avatar: 'LB',
        status: 'away',
        productivity: 88.4,
        tasksCompleted: 19,
        currentTasks: 3,
        lastActive: '1 hour ago',
        skills: ['UI/UX', 'Figma', 'User Research'],
        workload: 78,
        satisfaction: 4.1,
      },
      {
        id: 4,
        name: 'David Wilson',
        role: 'QA Engineer',
        avatar: 'DW',
        status: 'offline',
        productivity: 85.9,
        tasksCompleted: 21,
        currentTasks: 6,
        lastActive: '3 hours ago',
        skills: ['Testing', 'Automation', 'Quality Assurance'],
        workload: 88,
        satisfaction: 4.0,
      },
      {
        id: 5,
        name: 'Emma Garcia',
        role: 'Marketing Specialist',
        avatar: 'EG',
        status: 'online',
        productivity: 89.2,
        tasksCompleted: 17,
        currentTasks: 4,
        lastActive: '10 min ago',
        skills: ['Digital Marketing', 'Content', 'Analytics'],
        workload: 75,
        satisfaction: 4.4,
      },
    ],
    projects: [
      {
        id: 1,
        name: 'Website Redesign',
        progress: 68,
        status: 'on_track',
        dueDate: '2024-02-15',
        teamMembers: 4,
        tasksCompleted: 16,
        totalTasks: 24,
        priority: 'high',
      },
      {
        id: 2,
        name: 'Mobile App',
        progress: 23,
        status: 'on_track',
        dueDate: '2024-06-30',
        teamMembers: 3,
        tasksCompleted: 8,
        totalTasks: 35,
        priority: 'medium',
      },
      {
        id: 3,
        name: 'API Integration',
        progress: 89,
        status: 'ahead',
        dueDate: '2024-01-20',
        teamMembers: 2,
        tasksCompleted: 17,
        totalTasks: 19,
        priority: 'high',
      },
      {
        id: 4,
        name: 'Marketing Campaign',
        progress: 45,
        status: 'at_risk',
        dueDate: '2024-01-31',
        teamMembers: 3,
        tasksCompleted: 9,
        totalTasks: 20,
        priority: 'medium',
      },
    ],
    activities: [
      {
        id: 1,
        type: 'task_completed',
        user: 'Mike Chen',
        action: 'completed task',
        target: 'User Authentication Module',
        timestamp: '5 minutes ago',
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      },
      {
        id: 2,
        type: 'project_update',
        user: 'Sarah Johnson',
        action: 'updated project',
        target: 'Website Redesign',
        timestamp: '15 minutes ago',
        icon: <Activity className="h-4 w-4 text-blue-600" />,
      },
      {
        id: 3,
        type: 'comment',
        user: 'Lisa Brown',
        action: 'commented on',
        target: 'Design Review Task',
        timestamp: '1 hour ago',
        icon: <MessageSquare className="h-4 w-4 text-purple-600" />,
      },
      {
        id: 4,
        type: 'milestone',
        user: 'David Wilson',
        action: 'reached milestone',
        target: 'Testing Phase Complete',
        timestamp: '2 hours ago',
        icon: <Award className="h-4 w-4 text-orange-600" />,
      },
    ],
    metrics: {
      weeklyStats: {
        tasksCompleted: [12, 15, 18, 22, 19, 16, 14],
        productivity: [85, 87, 89, 91, 88, 86, 87],
        collaboration: [78, 82, 85, 88, 90, 87, 92],
      },
      topPerformers: [
        { name: 'Sarah Johnson', score: 94.2, improvement: '+2.1%' },
        { name: 'Mike Chen', score: 91.7, improvement: '+1.8%' },
        { name: 'Emma Garcia', score: 89.2, improvement: '+3.2%' },
      ],
    },
  };

  const currentData = teamData || mockTeamData;

  const getStatusColor = status => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getProjectStatusColor = status => {
    switch (status) {
      case 'on_track':
        return 'default';
      case 'ahead':
        return 'secondary';
      case 'at_risk':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getWorkloadColor = workload => {
    if (workload >= 90) return 'text-red-600';
    if (workload >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Team Dashboard"
        subtitle="Monitor team performance, collaboration, and project progress"
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
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'members'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Team Members
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'projects'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Projects
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'activity'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Activity className="h-4 w-4 inline mr-2" />
          Activity
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
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-2xl font-bold">{currentData.overview.totalMembers}</p>
                    <p className="text-xs text-green-600">
                      {currentData.overview.activeMembers} active
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Productivity</p>
                    <p className="text-2xl font-bold text-green-600">
                      {currentData.overview.teamProductivity}
                    </p>
                    <p className="text-xs text-green-600">
                      {currentData.overview.trends.productivity} this period
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {currentData.overview.completedTasks}
                    </p>
                    <p className="text-xs text-green-600">
                      {currentData.overview.trends.tasks} this period
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Collaboration Score</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {currentData.overview.collaborationScore}
                    </p>
                    <p className="text-xs text-green-600">
                      {currentData.overview.trends.collaboration} this period
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-600" />
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
                    <p className="text-sm font-medium text-gray-600">Ongoing Projects</p>
                    <p className="text-2xl font-bold">{currentData.overview.ongoingProjects}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Satisfaction</p>
                    <p className="text-2xl font-bold text-green-600">
                      {currentData.overview.teamSatisfaction}/5
                    </p>
                    <p className="text-xs text-green-600">
                      {currentData.overview.trends.satisfaction} this period
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Now</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currentData.overview.activeMembers}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.metrics.topPerformers.map((performer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                      <div>
                        <h4 className="font-medium">{performer.name}</h4>
                        <p className="text-sm text-gray-600">Productivity Score</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{performer.score}</div>
                      <div className="text-sm text-green-600">{performer.improvement}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentData.members.map(member => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {member.avatar}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                      ></div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Productivity Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Productivity</span>
                      <span className="font-medium">{member.productivity}%</span>
                    </div>
                    <Progress value={member.productivity} className="h-2" />
                  </div>

                  {/* Tasks */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-green-50 p-2 rounded">
                      <div className="text-lg font-bold text-green-600">
                        {member.tasksCompleted}
                      </div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-lg font-bold text-blue-600">{member.currentTasks}</div>
                      <div className="text-xs text-gray-600">Current</div>
                    </div>
                  </div>

                  {/* Workload */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Workload</span>
                      <span className={`font-medium ${getWorkloadColor(member.workload)}`}>
                        {member.workload}%
                      </span>
                    </div>
                    <Progress value={member.workload} className="h-2" />
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-sm font-medium mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Last Active */}
                  <div className="text-xs text-gray-500 border-t pt-2">
                    Last active: {member.lastActive}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentData.projects.map(project => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getProjectStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getPriorityColor(project.priority)}>{project.priority}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{project.teamMembers}</div>
                      <div className="text-xs text-gray-600">Members</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {project.tasksCompleted}
                      </div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-600">{project.totalTasks}</div>
                      <div className="text-xs text-gray-600">Total Tasks</div>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Team Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData.activities.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="p-1 bg-gray-100 rounded">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-gray-600"> {activity.action} </span>
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamDashboard;
