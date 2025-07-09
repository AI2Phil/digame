import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { teamApi } from '../../services/api/teamApi';
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
import { Switch } from '../ui/Switch';
import {
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Target,
  Award,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Brain,
  Zap,
  MessageSquare,
  Calendar,
  FileText,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Filter,
  Search,
  Lightbulb,
  Rocket,
  Shield,
  Heart,
  ThumbsUp,
  Coffee,
  Briefcase,
  GraduationCap,
  Network,
  Globe,
  Smartphone,
  Monitor,
  Headphones,
  Camera,
  Video,
  Mic,
  Bell,
  Mail,
  Phone,
  MapPin,
  Home,
  Building,
  Car,
  Plane,
  Ship,
  Truck,
  Bike,
  Walk
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
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter
} from 'recharts';

const AdvancedTeamAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');
  const [teams, setTeams] = useState([]);
  const [teamMetrics, setTeamMetrics] = useState([]);
  const [collaborationData, setCollaborationData] = useState([]);
  const [performanceInsights, setPerformanceInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock team data
  const teamData = [
    {
      id: 'team-001',
      name: 'Product Development',
      members: 12,
      lead: 'Sarah Johnson',
      department: 'Engineering',
      productivity: 94.2,
      collaboration: 87.6,
      satisfaction: 4.6,
      velocity: 89.3,
      burnout_risk: 'Low',
      active_projects: 8,
      completed_tasks: 247,
      avg_response_time: '2.3h',
      meeting_efficiency: 78.4,
      knowledge_sharing: 92.1,
      innovation_score: 85.7
    },
    {
      id: 'team-002',
      name: 'Data Science',
      members: 8,
      lead: 'Dr. Michael Chen',
      department: 'Analytics',
      productivity: 91.8,
      collaboration: 94.2,
      satisfaction: 4.8,
      velocity: 92.7,
      burnout_risk: 'Low',
      active_projects: 5,
      completed_tasks: 189,
      avg_response_time: '1.8h',
      meeting_efficiency: 85.2,
      knowledge_sharing: 96.3,
      innovation_score: 94.1
    },
    {
      id: 'team-003',
      name: 'Marketing',
      members: 15,
      lead: 'Emma Rodriguez',
      department: 'Marketing',
      productivity: 88.4,
      collaboration: 82.1,
      satisfaction: 4.2,
      velocity: 76.8,
      burnout_risk: 'Medium',
      active_projects: 12,
      completed_tasks: 324,
      avg_response_time: '3.1h',
      meeting_efficiency: 71.6,
      knowledge_sharing: 79.4,
      innovation_score: 73.2
    },
    {
      id: 'team-004',
      name: 'Customer Success',
      members: 10,
      lead: 'David Kim',
      department: 'Support',
      productivity: 96.1,
      collaboration: 89.7,
      satisfaction: 4.7,
      velocity: 94.5,
      burnout_risk: 'Low',
      active_projects: 6,
      completed_tasks: 412,
      avg_response_time: '1.2h',
      meeting_efficiency: 82.9,
      knowledge_sharing: 88.6,
      innovation_score: 79.3
    },
    {
      id: 'team-005',
      name: 'Design',
      members: 6,
      lead: 'Lisa Wang',
      department: 'Design',
      productivity: 89.7,
      collaboration: 91.4,
      satisfaction: 4.5,
      velocity: 87.2,
      burnout_risk: 'Low',
      active_projects: 9,
      completed_tasks: 156,
      avg_response_time: '2.7h',
      meeting_efficiency: 79.8,
      knowledge_sharing: 85.1,
      innovation_score: 91.6
    }
  ];

  const collaborationMetrics = [
    { name: 'Mon', messages: 234, meetings: 12, collaborations: 45, efficiency: 78 },
    { name: 'Tue', messages: 267, meetings: 15, collaborations: 52, efficiency: 82 },
    { name: 'Wed', messages: 298, meetings: 18, collaborations: 48, efficiency: 85 },
    { name: 'Thu', messages: 312, meetings: 14, collaborations: 56, efficiency: 88 },
    { name: 'Fri', messages: 289, meetings: 11, collaborations: 41, efficiency: 84 },
    { name: 'Sat', messages: 156, meetings: 3, collaborations: 18, efficiency: 72 },
    { name: 'Sun', messages: 98, meetings: 1, collaborations: 12, efficiency: 68 }
  ];

  const productivityTrends = [
    { name: 'Week 1', productivity: 85, velocity: 78, satisfaction: 4.2 },
    { name: 'Week 2', productivity: 88, velocity: 82, satisfaction: 4.3 },
    { name: 'Week 3', productivity: 91, velocity: 85, satisfaction: 4.4 },
    { name: 'Week 4', productivity: 89, velocity: 88, satisfaction: 4.6 },
    { name: 'Week 5', productivity: 93, velocity: 91, satisfaction: 4.5 },
    { name: 'Week 6', productivity: 95, velocity: 89, satisfaction: 4.7 },
    { name: 'Week 7', productivity: 92, velocity: 93, satisfaction: 4.8 }
  ];

  const teamPerformanceRadar = [
    { metric: 'Productivity', value: 92, fullMark: 100 },
    { metric: 'Collaboration', value: 88, fullMark: 100 },
    { metric: 'Innovation', value: 85, fullMark: 100 },
    { metric: 'Efficiency', value: 91, fullMark: 100 },
    { metric: 'Satisfaction', value: 89, fullMark: 100 },
    { metric: 'Knowledge Sharing', value: 87, fullMark: 100 }
  ];

  const skillDistribution = [
    { name: 'Technical Skills', value: 35, color: '#3b82f6' },
    { name: 'Communication', value: 25, color: '#10b981' },
    { name: 'Leadership', value: 20, color: '#f59e0b' },
    { name: 'Problem Solving', value: 15, color: '#ef4444' },
    { name: 'Creativity', value: 5, color: '#8b5cf6' }
  ];

  const teamInsights = [
    {
      type: 'Performance Boost',
      insight: 'Data Science team shows 23% productivity increase after implementing pair programming sessions.',
      confidence: 0.94,
      impact: 'High',
      actionItems: ['Expand pair programming to other teams', 'Create best practices guide', 'Track implementation results'],
      trend: 'up',
      team: 'Data Science'
    },
    {
      type: 'Collaboration Gap',
      insight: 'Marketing team has 34% lower cross-functional collaboration compared to engineering teams.',
      confidence: 0.89,
      impact: 'Medium',
      actionItems: ['Schedule cross-team workshops', 'Implement collaboration tools', 'Create shared project spaces'],
      trend: 'down',
      team: 'Marketing'
    },
    {
      type: 'Innovation Opportunity',
      insight: 'Design team shows highest innovation scores but limited knowledge sharing with development.',
      confidence: 0.92,
      impact: 'High',
      actionItems: ['Create design-dev sync meetings', 'Implement design system collaboration', 'Share innovation methodologies'],
      trend: 'up',
      team: 'Design'
    },
    {
      type: 'Burnout Prevention',
      insight: 'Customer Success team maintains high performance with optimal work-life balance indicators.',
      confidence: 0.96,
      impact: 'High',
      actionItems: ['Document success practices', 'Apply model to other teams', 'Monitor sustainability metrics'],
      trend: 'up',
      team: 'Customer Success'
    }
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTeam]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Load teams from database
      const teamsFromDb = await teamApi.getTeams();
      setTeams(teamsFromDb.length > 0 ? teamsFromDb.map(team => ({
        id: team.id,
        name: team.name,
        members: team.statistics?.totalMembers || 0,
        lead: 'Team Lead', // This would come from team data
        department: 'Department', // This would come from team data
        productivity: Math.random() * 20 + 80, // This would come from analytics
        collaboration: Math.random() * 20 + 80,
        satisfaction: Math.random() * 1 + 4,
        velocity: Math.random() * 20 + 80,
        burnout_risk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        active_projects: team.statistics?.activeProjects || 0,
        completed_tasks: Math.floor(Math.random() * 200 + 100),
        avg_response_time: `${(Math.random() * 2 + 1).toFixed(1)}h`,
        meeting_efficiency: Math.random() * 20 + 70,
        knowledge_sharing: Math.random() * 20 + 80,
        innovation_score: Math.random() * 20 + 70
      })) : teamData);

      // Load analytics for selected team if available
      if (selectedTeam && selectedTeam !== 'all') {
        try {
          const analytics = await teamApi.getTeamAnalytics(selectedTeam);
          // Process analytics data here
          console.log('Team analytics loaded:', analytics);
        } catch (error) {
          console.log('Analytics not available for team:', selectedTeam);
        }
      }

      // Set fallback data for demo purposes
      setTeamMetrics(productivityTrends);
      setCollaborationData(collaborationMetrics);
      setPerformanceInsights(teamInsights);
      
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      // Fallback to mock data
      setTeams(teamData);
      setTeamMetrics(productivityTrends);
      setCollaborationData(collaborationMetrics);
      setPerformanceInsights(teamInsights);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = useCallback(() => {
    loadAnalyticsData();
  }, []);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Team Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Teams</p>
                <p className="text-2xl font-bold">{teams.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Productivity</p>
                <p className="text-2xl font-bold">92.4%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collaboration Score</p>
                <p className="text-2xl font-bold">88.8%</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Satisfaction</p>
                <p className="text-2xl font-bold">4.6/5.0</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Overview</CardTitle>
          <CardDescription>Comprehensive performance metrics for all teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teams.map(team => (
              <div key={team.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <h3 className="font-medium">{team.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {team.members} members
                    </Badge>
                    <Badge variant={team.burnout_risk === 'Low' ? 'default' : 
                                   team.burnout_risk === 'Medium' ? 'secondary' : 'destructive'}>
                      {team.burnout_risk} Risk
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Lead: {team.lead}</span>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground">Productivity</p>
                    <p className="font-medium">{team.productivity}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Collaboration</p>
                    <p className="font-medium">{team.collaboration}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Satisfaction</p>
                    <p className="font-medium">{team.satisfaction}/5.0</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Velocity</p>
                    <p className="font-medium">{team.velocity}%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Active Projects</p>
                    <p className="font-medium">{team.active_projects}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed Tasks</p>
                    <p className="font-medium">{team.completed_tasks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Response Time</p>
                    <p className="font-medium">{team.avg_response_time}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Innovation Score</p>
                    <p className="font-medium">{team.innovation_score}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Trends</CardTitle>
          <CardDescription>Team productivity, velocity, and satisfaction over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={teamMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="productivity" fill="#3b82f6" name="Productivity %" />
              <Line yAxisId="left" type="monotone" dataKey="velocity" stroke="#10b981" name="Velocity %" />
              <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#f59e0b" name="Satisfaction" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderCollaborationTab = () => (
    <div className="space-y-6">
      {/* Collaboration Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Messages</p>
                <p className="text-2xl font-bold">1,654</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Meetings</p>
                <p className="text-2xl font-bold">74</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collaborations</p>
                <p className="text-2xl font-bold">272</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efficiency Score</p>
                <p className="text-2xl font-bold">81.2%</p>
              </div>
              <Target className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collaboration Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Collaboration Activity</CardTitle>
          <CardDescription>Daily collaboration metrics and efficiency trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={collaborationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="messages" fill="#3b82f6" name="Messages" />
              <Bar yAxisId="left" dataKey="meetings" fill="#10b981" name="Meetings" />
              <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#f59e0b" name="Efficiency %" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Team Performance Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Radar</CardTitle>
          <CardDescription>Multi-dimensional team performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={teamPerformanceRadar}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cross-Team Collaboration Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Team Collaboration</CardTitle>
          <CardDescription>Collaboration frequency between different teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 text-sm">
            <div className="font-medium">Team</div>
            <div className="font-medium text-center">Product</div>
            <div className="font-medium text-center">Data Sci</div>
            <div className="font-medium text-center">Marketing</div>
            <div className="font-medium text-center">Design</div>
            
            {teams.slice(0, 4).map((team, i) => (
              <React.Fragment key={team.id}>
                <div className="font-medium">{team.name.split(' ')[0]}</div>
                {[0, 1, 2, 3].map(j => (
                  <div key={j} className="text-center">
                    <div className={`w-8 h-8 rounded mx-auto flex items-center justify-center text-xs font-medium ${
                      i === j ? 'bg-gray-200 text-gray-500' :
                      Math.random() > 0.7 ? 'bg-green-100 text-green-700' :
                      Math.random() > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {i === j ? '-' : Math.floor(Math.random() * 50 + 10)}
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Performers</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Velocity</p>
                <p className="text-2xl font-bold">87.9%</p>
              </div>
              <Rocket className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Innovation Index</p>
                <p className="text-2xl font-bold">84.7</p>
              </div>
              <Lightbulb className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Team Skill Distribution</CardTitle>
          <CardDescription>Distribution of skills across all team members</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={skillDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {skillDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Benchmarks</CardTitle>
          <CardDescription>Team performance against industry standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { metric: 'Code Quality', current: 94, benchmark: 85, status: 'above' },
              { metric: 'Delivery Speed', current: 87, benchmark: 90, status: 'below' },
              { metric: 'Customer Satisfaction', current: 92, benchmark: 88, status: 'above' },
              { metric: 'Team Retention', current: 96, benchmark: 82, status: 'above' },
              { metric: 'Innovation Rate', current: 78, benchmark: 75, status: 'above' },
              { metric: 'Knowledge Sharing', current: 89, benchmark: 80, status: 'above' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'above' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium">{item.metric}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.current}%</p>
                    <p className="text-xs text-muted-foreground">Current</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.benchmark}%</p>
                    <p className="text-xs text-muted-foreground">Benchmark</p>
                  </div>
                  <Progress value={(item.current / item.benchmark) * 100} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* AI Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Insights Generated</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actionable Items</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confidence Score</p>
                <p className="text-2xl font-bold">92.8%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Team Insights</CardTitle>
          <CardDescription>Machine learning analysis of team performance and collaboration patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceInsights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      insight.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <h3 className="font-medium">{insight.type}</h3>
                    <Badge variant={insight.impact === 'High' ? 'default' : 'secondary'}>
                      {insight.impact} Impact
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {insight.team}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {(insight.confidence * 100).toFixed(1)}% confidence
                    </Badge>
                    {insight.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{insight.insight}</p>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {insight.actionItems.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Predictive Team Analytics</CardTitle>
          <CardDescription>AI predictions for team performance and potential issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">Performance Predictions</h4>
              <div className="space-y-3">
                {[
                  { metric: 'Productivity Next Month', prediction: '+12%', confidence: 0.87, trend: 'up' },
                  { metric: 'Collaboration Score', prediction: '+8%', confidence: 0.92, trend: 'up' },
                  { metric: 'Team Satisfaction', prediction: 'Stable', confidence: 0.94, trend: 'stable' },
                  { metric: 'Innovation Output', prediction: '+15%', confidence: 0.79, trend: 'up' }
                ].map((pred, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        pred.trend === 'up' ? 'bg-green-500' :
                        pred.trend === 'down' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-sm">{pred.metric}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{pred.prediction}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(pred.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Risk Assessment</h4>
              <div className="space-y-3">
                {[
                  { risk: 'Burnout Risk', level: 'Low', probability: 0.15, team: 'All Teams' },
                  { risk: 'Skill Gap', level: 'Medium', probability: 0.34, team: 'Marketing' },
                  { risk: 'Collaboration Decline', level: 'Low', probability: 0.12, team: 'Design' },
                  { risk: 'Productivity Drop', level: 'Very Low', probability: 0.08, team: 'Data Science' }
                ].map((risk, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="text-sm font-medium">{risk.risk}</span>
                      <div className="text-xs text-muted-foreground">{risk.team}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={risk.level === 'Low' || risk.level === 'Very Low' ? 'default' :
                                     risk.level === 'Medium' ? 'secondary' : 'destructive'}>
                        {risk.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(risk.probability * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Advanced Team Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Enhanced team performance insights and collaboration metrics
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={refreshData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="collaboration">
          {renderCollaborationTab()}
        </TabsContent>

        <TabsContent value="performance">
          {renderPerformanceTab()}
        </TabsContent>

        <TabsContent value="insights">
          {renderInsightsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};


export default AdvancedTeamAnalytics;
