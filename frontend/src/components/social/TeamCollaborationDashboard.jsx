import React, { useState, useEffect } from 'react';
import { 
  Users, BarChart3, Target, TrendingUp, Clock, CheckCircle,
  MessageCircle, Calendar, FileText, GitBranch, Award,
  Activity, Zap, Globe, Settings, Plus, Filter,
  PieChart, LineChart, ArrowUp, ArrowDown, Minus, AlertTriangle, Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

// Assuming an ApiService might be used later for more structured API calls
// import { ApiService } from '../../services/ApiService';

const TeamCollaborationDashboard = ({ teamId, userRole, onTeamAction }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');

  const [dashboardData, setDashboardData] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for realtime activity - this could be replaced by WebSockets later
  const [realtimeActivity, setRealtimeActivity] = useState([
    { id: 1, user: 'Sarah Chen', action: 'completed task', project: 'UI Redesign', time: '2 min ago', type: 'completion' },
    { id: 2, user: 'Mike Johnson', action: 'started code review', project: 'API Integration', time: '5 min ago', type: 'review' },
  ]);

  // Mock data for project analytics - this needs a dedicated API or different data structure from backend
  const [projectAnalyticsData, setProjectAnalyticsData] = useState([
    {
      id: 1,
      name: "E-commerce Platform Redesign",
      progress: 78,
      teamMembersCount: 6,
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
      teamMembersCount: 4,
      deadline: "2025-08-30",
      status: "at-risk",
      collaborationScore: 87,
      tasksCompleted: 23,
      totalTasks: 51,
      riskLevel: "medium"
    },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!teamId) {
        setError("Team ID is not provided.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const analyticsResponse = await fetch(`/api/teams/${teamId}/analytics?time_range=${selectedTimeRange}`);
        if (!analyticsResponse.ok) {
          const errorData = await analyticsResponse.json();
          throw new Error(errorData.detail || `HTTP error! status: ${analyticsResponse.status} fetching analytics`);
        }
        const analyticsApiData = await analyticsResponse.json();
        setDashboardData(analyticsApiData);

        const teamDetailsResponse = await fetch(`/api/teams/${teamId}`);
        if (!teamDetailsResponse.ok) {
            const errorData = await teamDetailsResponse.json();
            throw new Error(errorData.detail || `HTTP error! status: ${teamDetailsResponse.status} fetching team details`);
        }
        const teamInfo = await teamDetailsResponse.json();
        setTeamDetails(teamInfo);

      } catch (err) {
        console.error("Failed to fetch team dashboard data:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Simulate real-time activity updates (can be replaced with WebSocket later)
    const activityInterval = setInterval(() => {
      setRealtimeActivity(prev => {
        const newActivity = {
          id: Date.now(),
          user: ['Ken Adams', 'Laura Bell', 'Chris York', 'Diana Ross'][Math.floor(Math.random() * 4)],
          action: ['pushed commit', 'commented on issue', 'deployed new version', 'started a discussion thread'][Math.floor(Math.random() * 4)],
          project: ['Core Platform', 'Mobile UI', 'Data Pipeline', 'Security Module'][Math.floor(Math.random() * 4)],
          time: 'just now',
          type: ['completion', 'review', 'knowledge', 'meeting'][Math.floor(Math.random() * 4)]
        };
        return [newActivity, ...prev.slice(0, 5)];
      });
    }, 30000);

    return () => clearInterval(activityInterval);
  }, [teamId, selectedTimeRange]);

  // Loading, Error, and No Data states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="ml-4 text-lg">Loading Team Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500 bg-red-50 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600 dark:text-red-400">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Error Loading Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <Button onClick={() => { setIsLoading(true); setError(null); /* Trigger useEffect again */ }} className="mt-4">Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData || !teamDetails) {
    return (
      <div className="text-center py-10">
        <p>No data available for this team or dashboard is still loading.</p>
      </div>
    );
  }

  // Helper to get a specific metric value from dashboardData.key_metrics
  const getMetricValue = (metricName, defaultValue = "N/A") => {
    const metric = dashboardData?.key_metrics?.find(m => m.metric_name?.toLowerCase() === metricName?.toLowerCase());
    if (metric && metric.metric_value) {
        if (typeof metric.metric_value.value !== 'undefined') return `${metric.metric_value.value}${metric.metric_value.unit || ''}`;
        if (typeof metric.metric_value.count !== 'undefined') return metric.metric_value.count;
        if (typeof metric.metric_value.score !== 'undefined') return `${metric.metric_value.score}${metric.metric_value.unit || '%'}`; // For scores like collaboration
        if (typeof metric.metric_value.percentage !== 'undefined') return `${metric.metric_value.percentage}%`;
        return JSON.stringify(metric.metric_value);
    }
    return defaultValue;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {teamDetails.name || "Team"} Collaboration Dashboard
              </CardTitle>
              <CardDescription>
                Real-time analytics for team {teamDetails.name || "performance"} for {selectedTimeRange}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <select 
                className="border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium">Team Members</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-300">{teamDetails.members?.length || getMetricValue("Team Members Count", 0)}</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
              <Target className="w-6 h-6 mx-auto mb-1 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium">Active Projects</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-300">{getMetricValue("Active Projects Count", projectAnalyticsData.length)}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
              <p className="text-sm font-medium">Efficiency</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-300">{getMetricValue("Overall Efficiency", "0%")}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/50 rounded-lg">
              <Activity className="w-6 h-6 mx-auto mb-1 text-orange-600 dark:text-orange-400" />
              <p className="text-sm font-medium">Collaboration</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-300">{getMetricValue("Collaboration Score", "0%")}</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/50 rounded-lg">
              <CheckCircle className="w-6 h-6 mx-auto mb-1 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium">Tasks Done</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-300">{getMetricValue("Tasks Completed", 0)}</p>
            </div>
            <div className="text-center p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <Award className="w-6 h-6 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
              <p className="text-sm font-medium">Success Rate</p>
              <p className="text-lg font-bold text-gray-600 dark:text-gray-300">{getMetricValue("Project Success Rate", "0%")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RealtimeActivityFeed activities={realtimeActivity} />
            <TeamPerformanceOverview dashboardData={dashboardData} teamDetails={teamDetails} getMetricValue={getMetricValue} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CollaborationMetricsCard dashboardData={dashboardData} teamDetails={teamDetails} getMetricValue={getMetricValue} />
            <TeamHealthIndicators dashboardData={dashboardData} />
            <QuickActionsPanel onTeamAction={onTeamAction} />
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ProjectAnalyticsSection projects={projectAnalyticsData /* Using mock for now, actual data source TBD */} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceAnalyticsSection dashboardData={dashboardData} getMetricValue={getMetricValue} />
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <CollaborationAnalyticsSection 
            collaborationPatterns={dashboardData.collaboration_patterns || []}
            skillGaps={dashboardData.identified_skill_gaps || []}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <TeamInsightsSection dashboardData={dashboardData} />
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
        {activities && activities.length > 0 ? activities.map((activity, index) => (
          <div key={activity.id || index} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded">
            <div className={`w-2 h-2 rounded-full ${
              activity.type === 'completion' ? 'bg-green-500' :
              activity.type === 'review' ? 'bg-blue-500' :
              activity.type === 'knowledge' ? 'bg-purple-500' : 'bg-orange-500'
            }`}></div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span> {activity.action} in{' '}
                <span className="text-blue-600 dark:text-blue-400">{activity.project}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
            </div>
          </div>
        )) : <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity.</p>}
      </div>
    </CardContent>
  </Card>
);

const TeamPerformanceOverview = ({ dashboardData, teamDetails, getMetricValue }) => {
  const efficiency = parseFloat(getMetricValue("Overall Efficiency", "0").replace('%','')) || parseFloat(getMetricValue("Efficiency", "0").replace('%','')) || 0;
  const collaborationScore = parseFloat(getMetricValue("Collaboration Score", "0").replace('%','')) || 0;
  const projectSuccessRate = parseFloat(getMetricValue("Project Success Rate", "0").replace('%','')) || 0;
  const knowledgeSharing = parseFloat(getMetricValue("Knowledge Sharing Score", "0").replace('%','')) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Overall Efficiency</span>
              <span>{efficiency.toFixed(0)}%</span>
            </div>
            <Progress value={efficiency} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Collaboration Score</span>
              <span>{collaborationScore.toFixed(0)}%</span>
            </div>
            <Progress value={collaborationScore} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Project Success Rate</span>
              <span>{projectSuccessRate.toFixed(0)}%</span>
            </div>
            <Progress value={projectSuccessRate} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Knowledge Sharing</span>
              <span>{knowledgeSharing.toFixed(0)}%</span>
            </div>
            <Progress value={knowledgeSharing} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CollaborationMetricsCard = ({ dashboardData, teamDetails, getMetricValue }) => {
  return (
  <Card>
    <CardHeader>
      <CardTitle>Collaboration Metrics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm">Total Collaborations</span>
          <span className="font-semibold">{getMetricValue("Total Collaborations", 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Cross-team Projects</span>
          <span className="font-semibold">{getMetricValue("Cross-team Projects Count", 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Avg Team Size</span>
          <span className="font-semibold">{teamDetails?.members?.length || getMetricValue("Average Team Size", "N/A")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Communication Freq.</span>
          <span className="font-semibold">{getMetricValue("Communication Frequency", "0/day")}</span>
        </div>
      </div>
    </CardContent>
  </Card>
  );
};

const TeamHealthIndicators = ({ dashboardData }) => {
  const getHealthStatus = (indicatorName, defaultValue = { text: "N/A", color: "gray" }) => {
    // This is still mock data. Backend should provide these based on actual analysis.
    const healthData = {
        "Workload Balance": { text: "Healthy", color: "green"},
        "Team Morale": { text: "High", color: "green"},
        "Skill Coverage": { text: "Good", color: "yellow"},
        "Communication Quality": { text: "Excellent", color: "green"}
    };
    // Example: const backendIndicator = dashboardData?.health_indicators?.find(i => i.name === indicatorName);
    // if (backendIndicator) return { text: backendIndicator.status, color: backendIndicator.color_code };
    return healthData[indicatorName] || defaultValue;
  }

  return (
  <Card>
    <CardHeader>
      <CardTitle>Team Health</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {["Workload Balance", "Team Morale", "Skill Coverage", "Communication Quality"].map(indicator => {
          const status = getHealthStatus(indicator);
          let bgColorClass = 'bg-gray-500';
          if (status.color === 'green') bgColorClass = 'bg-green-500';
          else if (status.color === 'yellow') bgColorClass = 'bg-yellow-500';
          else if (status.color === 'red') bgColorClass = 'bg-red-500';

          return (
            <div key={indicator} className="flex items-center justify-between">
              <span className="text-sm">{indicator}</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 ${bgColorClass} rounded-full`}></div>
                <span className="text-sm font-medium">{status.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
  );
};

const QuickActionsPanel = ({ onTeamAction }) => (
  <Card>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Button size="sm" className="w-full justify-start" onClick={() => onTeamAction('schedule-meeting')}>
          <Calendar className="w-4 h-4 mr-2" /> Schedule Meeting
        </Button>
        <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => onTeamAction('create-project')}>
          <Plus className="w-4 h-4 mr-2" /> Create New Project
        </Button>
        <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => onTeamAction('share-knowledge')}>
          <FileText className="w-4 h-4 mr-2" /> Share Document
        </Button>
        <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => onTeamAction('team-settings')}>
          <Settings className="w-4 h-4 mr-2" /> Team Settings
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
        Detailed analytics for all active team projects (currently mock data)
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {projects && projects.length > 0 ? projects.map((project, index) => (
          <ProjectAnalyticsCard key={project.id || index} project={project} />
        )) : <p className="text-sm text-gray-500 dark:text-gray-400">No projects to display. Project data may need a separate API call.</p>}
      </div>
    </CardContent>
  </Card>
);

const ProjectAnalyticsCard = ({ project }) => (
  <div className="p-4 border dark:border-gray-700 rounded-lg">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h5 className="font-medium">{project.name}</h5>
        <p className="text-sm text-gray-600 dark:text-gray-400">{project.teamMembersCount || 'N/A'} members • Due {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</p>
      </div>
      <Badge variant={
        project.status === 'on-track' ? 'default' :
        project.status === 'ahead' ? 'success' :
        project.status === 'at-risk' ? 'warning' :
        project.status === 'delayed' ? 'destructive' : 'outline'
      }>
        {project.status || 'Unknown'}
      </Badge>
    </div>
    <div className="grid grid-cols-3 gap-4 mb-3">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
        <div className="flex items-center gap-2">
          <Progress value={project.progress || 0} className="flex-1 h-2" />
          <span className="text-sm font-medium">{project.progress || 0}%</span>
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Tasks</p>
        <p className="text-sm font-medium">{project.tasksCompleted || 0}/{project.totalTasks || 0}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Collaboration</p>
        <p className="text-sm font-medium">{project.collaborationScore || 0}%</p>
      </div>
    </div>
    <div className="flex justify-between items-center">
      <Badge variant={project.riskLevel === 'low' ? 'success' : project.riskLevel === 'medium' ? 'warning' : project.riskLevel === 'high' ? 'destructive': 'outline'}>
        {project.riskLevel || 'Unknown'} risk
      </Badge>
      <Button size="sm" variant="outline"> View Details </Button>
    </div>
  </div>
);

const PerformanceAnalyticsSection = ({ dashboardData, getMetricValue }) => {
  const relevantMetricNames = ["Overall Efficiency", "Collaboration Score", "Project Success Rate", "Tasks Completed", "Productivity", "Quality", "Delivery Rate"];
  const performanceMetrics = dashboardData?.key_metrics?.filter(
    m => relevantMetricNames.includes(m.metric_name)
  ) || [];

  return (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Key Performance Indicators</CardTitle>
      </CardHeader>
      <CardContent>
        {performanceMetrics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric) => (
              <div key={metric.metric_name} className="text-center p-3 bg-gray-50 dark:bg-gray-700/60 rounded-lg">
                <p className="text-sm font-medium capitalize">{metric.metric_name}</p>
                <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  {getMetricValue(metric.metric_name, 'N/A')}
                </p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gray-500 dark:text-gray-400">No specific performance indicators available.</p>}
      </CardContent>
    </Card>
    {/* Team Comparison placeholder could go here if data becomes available */}
  </div>
  );
};

const CollaborationAnalyticsSection = ({ collaborationPatterns, skillGaps }) => {
  return (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Collaboration Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        {collaborationPatterns && collaborationPatterns.length > 0 ? (
          collaborationPatterns.map((pattern, index) => (
            <div key={index} className="mb-4 p-3 border dark:border-gray-700 rounded-lg">
              <h5 className="font-semibold text-md mb-1">{pattern.pattern_name}</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{pattern.description}</p>
              {pattern.metrics && Object.entries(pattern.metrics).length > 0 && (
                <div className="text-xs bg-gray-50 dark:bg-gray-700/60 p-2 rounded">
                  <strong>Metrics:</strong>
                  {Object.entries(pattern.metrics).map(([key, value]) => (
                    <p key={key}><span className="capitalize">{key.replace(/_/g, ' ')}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="text-gray-600 dark:text-gray-400">No collaboration patterns identified yet.</p>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">Backend analysis pending or no patterns found.</p>
          </div>
        )}
      </CardContent>
    </Card>

    <Card>
        <CardHeader><CardTitle>Identified Skill Gaps</CardTitle></CardHeader>
        <CardContent>
            {skillGaps && skillGaps.length > 0 ? (
                skillGaps.map((gap, index) => (
                    <div key={gap.id || index} className="mb-3 p-3 border dark:border-gray-700 rounded-lg">
                        <h5 className="font-semibold">{gap.skill_name} <Badge variant={gap.priority === 2 ? "destructive" : gap.priority === 1 ? "warning" : "outline"}>Priority: {gap.priority === 2 ? "High" : gap.priority === 1 ? "Medium" : "Low"}</Badge></h5>
                        {gap.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{gap.description}</p>}
                        {gap.suggested_development_plan && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Suggestion: {gap.suggested_development_plan}</p>}
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No specific skill gaps identified for this team.</p>
            )}
        </CardContent>
    </Card>
  </div>
  );
};

const TeamInsightsSection = ({ dashboardData }) => {
  const performanceScore = dashboardData?.overall_performance_score;
  const devProgress = dashboardData?.team_development_progress;

  let insights = [];
  if (performanceScore) {
    insights.push({
        title: "Overall Performance",
        text: `The team's overall performance score is ${performanceScore.toFixed(1)} out of 10.`,
        type: performanceScore > 7 ? "positive" : performanceScore > 4 ? "neutral" : "opportunity"
    });
  }
  if (dashboardData?.collaboration_patterns?.find(p => p.pattern_name?.toLowerCase().includes("high centralization"))) {
    insights.push({ title: "Collaboration Insight", text: "Data suggests communication might be centralized. Consider promoting broader interaction.", type: "opportunity" });
  } else if (dashboardData?.collaboration_patterns?.length > 0) {
    insights.push({ title: "Collaboration Strength", text: "Team shows diverse collaboration patterns. Continue fostering open communication.", type: "positive" });
  }

  if (devProgress) {
    Object.entries(devProgress).forEach(([key, value]) => {
        if(key.endsWith("_progress") && value) {
            insights.push({ title: `Skill Development: ${key.replace(/_/g, ' ').replace(' progress','')}`, text: `Progress on team goal '${key.replace(/_/g, ' ').replace(' progress','')}' is at ${value}.`, type: "info"});
        }
    });
  }

  if (insights.length === 0 && dashboardData) { // Check if dashboardData is loaded but no specific insights generated
    insights.push({title: "Data Analysis Insights", text: "Key metrics and patterns are available. AI is processing deeper insights which will appear here soon.", type: "neutral"});
  } else if (insights.length === 0) {
     insights.push({title: "Data Analysis Pending", text: "AI insights will be generated once sufficient data is processed by the backend.", type: "neutral"});
  }

  return (
  <Card>
    <CardHeader>
      <CardTitle>AI-Powered Team Insights</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {insights.length > 0 ? (
            insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg ${
                insight.type === 'positive' ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                insight.type === 'opportunity' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                insight.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                'bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-300'
              }`}>
                <h5 className="font-medium mb-1">{insight.title}</h5>
                <p className="text-sm ">{insight.text}</p>
              </div>
            ))
        ) : null}
      </div>
    </CardContent>
  </Card>
  );
};

export default TeamCollaborationDashboard;