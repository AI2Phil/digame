import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, Target, Clock, Award, BarChart3,
  Activity, Calendar, Home, Download, Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { Progress } from '../components/ui/Progress';
import { Chart } from '../components/ui/Chart';

const TeamDashboardPage = ({ isDemoMode = false, onLogout }) => {
  const navigate = useNavigate();

  // Use prop if provided, otherwise fallback to localStorage
  const isDemo = isDemoMode || localStorage.getItem('demo_mode') === 'true';

  const handleHomeClick = () => {
    navigate(isDemo ? '/dashboard' : '/');
  };

  // Mock team performance data
  const teamMetrics = {
    totalMembers: 5,
    activeMembers: 4,
    avgProductivity: 87,
    completedProjects: 12,
    ongoingProjects: 3,
    totalHours: 1247,
    teamEfficiency: 92
  };

  // Mock team performance over time
  const performanceData = [
    { name: 'Week 1', productivity: 82, efficiency: 78, collaboration: 85 },
    { name: 'Week 2', productivity: 85, efficiency: 82, collaboration: 88 },
    { name: 'Week 3', productivity: 88, efficiency: 85, collaboration: 90 },
    { name: 'Week 4', productivity: 87, efficiency: 92, collaboration: 89 },
    { name: 'Week 5', productivity: 90, efficiency: 89, collaboration: 92 },
    { name: 'Week 6', productivity: 89, efficiency: 91, collaboration: 94 }
  ];

  // Mock project data
  const activeProjects = [
    {
      id: 1,
      name: 'Mobile App Redesign',
      progress: 75,
      dueDate: '2025-01-15',
      team: ['SJ', 'MC', 'ER'],
      status: 'on-track',
      priority: 'high'
    },
    {
      id: 2,
      name: 'API Integration',
      progress: 45,
      dueDate: '2025-01-30',
      team: ['MC', 'LW'],
      status: 'at-risk',
      priority: 'medium'
    },
    {
      id: 3,
      name: 'User Research Study',
      progress: 90,
      dueDate: '2025-01-10',
      team: ['ER', 'DK'],
      status: 'ahead',
      priority: 'high'
    }
  ];

  // Mock team members with recent activity
  const teamMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Team Lead',
      avatar: isDemo ? 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=SJ' : '/api/placeholder/40/40',
      productivity: 92,
      hoursThisWeek: 38,
      tasksCompleted: 8,
      status: 'active'
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Senior Developer',
      avatar: isDemo ? 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=MC' : '/api/placeholder/40/40',
      productivity: 88,
      hoursThisWeek: 42,
      tasksCompleted: 12,
      status: 'active'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Product Manager',
      avatar: isDemo ? 'https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=ER' : '/api/placeholder/40/40',
      productivity: 95,
      hoursThisWeek: 35,
      tasksCompleted: 6,
      status: 'active'
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'Designer',
      avatar: isDemo ? 'https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=DK' : '/api/placeholder/40/40',
      productivity: 76,
      hoursThisWeek: 20,
      tasksCompleted: 3,
      status: 'inactive'
    },
    {
      id: '5',
      name: 'Lisa Wang',
      role: 'Developer',
      avatar: isDemo ? 'https://via.placeholder.com/40x40/EF4444/FFFFFF?text=LW' : '/api/placeholder/40/40',
      productivity: 85,
      hoursThisWeek: 40,
      tasksCompleted: 9,
      status: 'active'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'on-track':
        return <Badge variant="success">On Track</Badge>;
      case 'at-risk':
        return <Badge variant="warning">At Risk</Badge>;
      case 'ahead':
        return <Badge variant="info">Ahead</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team Dashboard</h1>
          <p className="text-muted-foreground">Monitor team performance and project progress</p>
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
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Productivity</p>
                <p className="text-2xl font-bold">{teamMetrics.avgProductivity}%</p>
                <p className="text-xs text-green-600">+5% from last week</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{teamMetrics.ongoingProjects}</p>
                <p className="text-xs text-blue-600">{teamMetrics.completedProjects} completed</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Efficiency</p>
                <p className="text-2xl font-bold">{teamMetrics.teamEfficiency}%</p>
                <p className="text-xs text-purple-600">Excellent performance</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{teamMetrics.totalHours}h</p>
                <p className="text-xs text-orange-600">This month</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Trends</CardTitle>
            <CardDescription>
              Weekly productivity, efficiency, and collaboration metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              data={performanceData.map(d => d.productivity)}
              secondaryData={performanceData.map(d => d.efficiency)}
              labels={performanceData.map(d => d.name)}
              height={320}
              lineColor="#3b82f6"
              secondaryLineColor="#10b981"
            />
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>
              Current project status and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{project.name}</h4>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(project.priority)}
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Due: {project.dueDate}</span>
                    </div>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  
                  <Progress value={project.progress} className="mb-2" />
                  
                  <div className="flex items-center space-x-1">
                    {project.team.map((member, index) => (
                      <div key={index} className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">{member}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Member Performance</CardTitle>
          <CardDescription>
            Individual productivity and activity metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.role}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Productivity</div>
                    <div className="font-semibold">{member.productivity}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Hours</div>
                    <div className="font-semibold">{member.hoursThisWeek}h</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Tasks</div>
                    <div className="font-semibold">{member.tasksCompleted}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant={member.status === 'active' ? 'success' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamDashboardPage;