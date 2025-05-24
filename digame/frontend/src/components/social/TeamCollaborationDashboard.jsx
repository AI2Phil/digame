import React, { useState, useEffect } from 'react';
import { 
  Users, BarChart3, Target, TrendingUp, Clock, CheckCircle,
  MessageCircle, Calendar, FileText, GitBranch, Award,
  Activity, Zap, Globe, Settings, Plus, Filter,
  PieChart, LineChart, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

const TeamCollaborationDashboard = ({ teamId, userRole, onTeamAction }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [selectedTeam, setSelectedTeam] = useState('all');

  const [teamData, setTeamData] = useState({
    currentTeam: {
      id: 1,
      name: "Frontend Development Team",
      members: 8,
      projects: 3,
      efficiency: 92,
      collaborationScore: 94,
      completedTasks: 156,
      activeProjects: 3
    },
    allTeams: [
      { id: 1, name: "Frontend Development", members: 8, efficiency: 92, projects: 3, status: 'active' },
      { id: 2, name: "AI Research Group", members: 5, efficiency: 87, projects: 2, status: 'active' },
      { id: 3, name: "Mobile Development", members: 6, efficiency: 89, projects: 4, status: 'active' },
      { id: 4, name: "DevOps & Infrastructure", members: 4, efficiency: 95, projects: 2, status: 'active' }
    ],
    collaborationMetrics: {
      totalCollaborations: 156,
      successfulProjects: 23,
      averageTeamSize: 6.3,
      crossTeamProjects: 8,
      communicationFrequency: 4.2,
      knowledgeSharing: 87
    },
    performanceMetrics: {
      productivity: 89,
      quality: 94,
      delivery: 91,
      innovation: 86,
      satisfaction: 92
    }
  });

  const [realtimeActivity, setRealtimeActivity] = useState([
    { id: 1, user: 'Sarah Chen', action: 'completed task', project: 'UI Redesign', time: '2 min ago', type: 'completion' },
    { id: 2, user: 'Mike Johnson', action: 'started code review', project: 'API Integration', time: '5 min ago', type: 'review' },
    { id: 3, user: 'Emily Davis', action: 'shared knowledge', project: 'ML Pipeline', time: '8 min ago', type: 'knowledge' },
    { id: 4, user: 'Alex Brown', action: 'joined meeting', project: 'Sprint Planning', time: '12 min ago', type: 'meeting' }
  ]);

  const [projectAnalytics, setProjectAnalytics] = useState([
    {
      id: 1,
      name: "E-commerce Platform Redesign",
      progress: 78,
      team: 6,
      deadline: "2025-07-15",
      status: "on-track",
      collaborationScore: 94,
      tasksCompleted: 45,
      totalTasks: 58,
      riskLevel: "low"
    },
    {
      id: 2,
      name: "Mobile App Development",
      progress: 45,
      team: 4,
      deadline: "2025-08-30",
      status: "at-risk",
      collaborationScore: 87,
      tasksCompleted: 23,
      totalTasks: 51,
      riskLevel: "medium"
    },
    {
      id: 3,
      name: "AI Integration Module",
      progress: 92,
      team: 5,
      deadline: "2025-06-10",
      status: "ahead",
      collaborationScore: 96,
      tasksCompleted: 47,
      totalTasks: 51,
      riskLevel: "low"
    }
  ]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRealtimeActivity(prev => {
        const newActivity = {
          id: Date.now(),
          user: ['Sarah Chen', 'Mike Johnson', 'Emily Davis', 'Alex Brown'][Math.floor(Math.random() * 4)],
          action: ['completed task', 'started review', 'shared update', 'joined discussion'][Math.floor(Math.random() * 4)],
          project: ['UI Redesign', 'API Integration', 'ML Pipeline'][Math.floor(Math.random() * 3)],
          time: 'just now',
          type: ['completion', 'review', 'knowledge', 'meeting'][Math.floor(Math.random() * 4)]
        };
        return [newActivity, ...prev.slice(0, 9)];
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Team Overview Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Collaboration Dashboard
              </CardTitle>
              <CardDescription>
                Real-time analytics and insights for team performance and collaboration
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <select 
                className="border rounded px-3 py-2"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="all">All Teams</option>
                {teamData.allTeams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <select 
                className="border rounded px-3 py-2"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <p className="text-sm font-medium">Team Members</p>
              <p className="text-lg font-bold text-blue-600">{teamData.currentTeam.members}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Target className="w-6 h-6 mx-auto mb-1 text-green-600" />
              <p className="text-sm font-medium">Active Projects</p>
              <p className="text-lg font-bold text-green-600">{teamData.currentTeam.activeProjects}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-1 text-purple-600" />
              <p className="text-sm font-medium">Efficiency</p>
              <p className="text-lg font-bold text-purple-600">{teamData.currentTeam.efficiency}%</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Activity className="w-6 h-6 mx-auto mb-1 text-orange-600" />
              <p className="text-sm font-medium">Collaboration</p>
              <p className="text-lg font-bold text-orange-600">{teamData.currentTeam.collaborationScore}%</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <CheckCircle className="w-6 h-6 mx-auto mb-1 text-red-600" />
              <p className="text-sm font-medium">Tasks Done</p>
              <p className="text-lg font-bold text-red-600">{teamData.currentTeam.completedTasks}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Award className="w-6 h-6 mx-auto mb-1 text-gray-600" />
              <p className="text-sm font-medium">Success Rate</p>
              <p className="text-lg font-bold text-gray-600">94%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RealtimeActivityFeed activities={realtimeActivity} />
            <TeamPerformanceOverview teamData={teamData} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CollaborationMetricsCard metrics={teamData.collaborationMetrics} />
            <TeamHealthIndicators teamData={teamData} />
            <QuickActionsPanel onTeamAction={onTeamAction} />
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <ProjectAnalyticsSection projects={projectAnalytics} />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <PerformanceAnalyticsSection 
            metrics={teamData.performanceMetrics}
            teams={teamData.allTeams}
          />
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration" className="space-y-6">
          <CollaborationAnalyticsSection 
            metrics={teamData.collaborationMetrics}
            activities={realtimeActivity}
          />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <TeamInsightsSection teamData={teamData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const RealtimeActivityFeed = ({ activities }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Real-time Team Activity
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
            <div className={`w-2 h-2 rounded-full ${
              activity.type === 'completion' ? 'bg-green-500' :
              activity.type === 'review' ? 'bg-blue-500' :
              activity.type === 'knowledge' ? 'bg-purple-500' : 'bg-orange-500'
            }`}></div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span> {activity.action} in{' '}
                <span className="text-blue-600">{activity.project}</span>
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const TeamPerformanceOverview = ({ teamData }) => (
  <Card>
    <CardHeader>
      <CardTitle>Team Performance Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Overall Efficiency</span>
            <span>{teamData.currentTeam.efficiency}%</span>
          </div>
          <Progress value={teamData.currentTeam.efficiency} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Collaboration Score</span>
            <span>{teamData.currentTeam.collaborationScore}%</span>
          </div>
          <Progress value={teamData.currentTeam.collaborationScore} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Project Success Rate</span>
            <span>94%</span>
          </div>
          <Progress value={94} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Knowledge Sharing</span>
            <span>87%</span>
          </div>
          <Progress value={87} className="h-2" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const CollaborationMetricsCard = ({ metrics }) => (
  <Card>
    <CardHeader>
      <CardTitle>Collaboration Metrics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm">Total Collaborations</span>
          <span className="font-semibold">{metrics.totalCollaborations}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Cross-team Projects</span>
          <span className="font-semibold">{metrics.crossTeamProjects}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Avg Team Size</span>
          <span className="font-semibold">{metrics.averageTeamSize}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Communication Freq</span>
          <span className="font-semibold">{metrics.communicationFrequency}/day</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TeamHealthIndicators = ({ teamData }) => (
  <Card>
    <CardHeader>
      <CardTitle>Team Health</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Workload Balance</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Healthy</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Team Morale</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">High</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Skill Coverage</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium">Good</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Communication</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Excellent</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const QuickActionsPanel = ({ onTeamAction }) => (
  <Card>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Button size="sm" className="w-full justify-start" onClick={() => onTeamAction('schedule-meeting')}>
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Team Meeting
        </Button>
        <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => onTeamAction('create-project')}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Project
        </Button>
        <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => onTeamAction('share-knowledge')}>
          <FileText className="w-4 h-4 mr-2" />
          Share Knowledge
        </Button>
        <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => onTeamAction('team-settings')}>
          <Settings className="w-4 h-4 mr-2" />
          Team Settings
        </Button>
      </div>
    </CardContent>
  </Card>
);

const ProjectAnalyticsSection = ({ projects }) => (
  <Card>
    <CardHeader>
      <CardTitle>Project Analytics</CardTitle>
      <CardDescription>
        Detailed analytics for all active team projects
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {projects.map((project, index) => (
          <ProjectAnalyticsCard key={index} project={project} />
        ))}
      </div>
    </CardContent>
  </Card>
);

const ProjectAnalyticsCard = ({ project }) => (
  <div className="p-4 border rounded-lg">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h5 className="font-medium">{project.name}</h5>
        <p className="text-sm text-gray-600">{project.team} team members • Due {new Date(project.deadline).toLocaleDateString()}</p>
      </div>
      <Badge variant={
        project.status === 'on-track' ? 'success' :
        project.status === 'ahead' ? 'success' : 'warning'
      }>
        {project.status}
      </Badge>
    </div>
    
    <div className="grid grid-cols-3 gap-4 mb-3">
      <div>
        <p className="text-xs text-gray-500">Progress</p>
        <div className="flex items-center gap-2">
          <Progress value={project.progress} className="flex-1 h-2" />
          <span className="text-sm font-medium">{project.progress}%</span>
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500">Tasks</p>
        <p className="text-sm font-medium">{project.tasksCompleted}/{project.totalTasks}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Collaboration</p>
        <p className="text-sm font-medium">{project.collaborationScore}%</p>
      </div>
    </div>
    
    <div className="flex justify-between items-center">
      <Badge variant={project.riskLevel === 'low' ? 'success' : project.riskLevel === 'medium' ? 'warning' : 'destructive'}>
        {project.riskLevel} risk
      </Badge>
      <Button size="sm" variant="outline">
        View Details
      </Button>
    </div>
  </div>
);

const PerformanceAnalyticsSection = ({ metrics, teams }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Performance Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium capitalize">{key}</p>
              <p className="text-lg font-bold">{value}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle>Team Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teams.map((team, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{team.name}</p>
                <p className="text-sm text-gray-600">{team.members} members • {team.projects} projects</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{team.efficiency}%</p>
                <p className="text-xs text-gray-500">efficiency</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const CollaborationAnalyticsSection = ({ metrics, activities }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Collaboration Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Advanced collaboration analytics coming soon...</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const TeamInsightsSection = ({ teamData }) => (
  <Card>
    <CardHeader>
      <CardTitle>AI-Powered Team Insights</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-blue-800 mb-2">Productivity Insight</h5>
          <p className="text-sm text-blue-700">Your team's productivity has increased by 15% this month. The main drivers are improved collaboration and better task distribution.</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h5 className="font-medium text-green-800 mb-2">Collaboration Strength</h5>
          <p className="text-sm text-green-700">Cross-functional collaboration is at an all-time high. Consider leveraging this for more complex projects.</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg">
          <h5 className="font-medium text-orange-800 mb-2">Growth Opportunity</h5>
          <p className="text-sm text-orange-700">Adding a senior developer to the team could boost overall efficiency by an estimated 12%.</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default TeamCollaborationDashboard;