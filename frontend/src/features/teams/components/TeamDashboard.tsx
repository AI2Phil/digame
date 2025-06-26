import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tabs';
import { useTeamManagement } from '../hooks/useTeamManagement.ts';
import { teamService } from '../services/teamService.ts';

interface TeamPerformanceMetric {
  id: number;
  team_id: number;
  metric_name: string;
  metric_value: number;
  metric_type: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

interface TeamSkillGap {
  id: number;
  team_id: number;
  skill_name: string;
  current_level: number;
  required_level: number;
  gap_severity: string;
  identified_at: string;
}

interface TeamWorkflow {
  id: number;
  team_id: number;
  workflow_name: string;
  workflow_data: any;
  efficiency_score: number;
  created_at: string;
  updated_at: string;
}

const TeamDashboard: React.FC = () => {
  const { teams, selectedTeam, setSelectedTeam, fetchTeams } = useTeamManagement();
  const [performanceMetrics, setPerformanceMetrics] = useState<TeamPerformanceMetric[]>([]);
  const [skillGaps, setSkillGaps] = useState<TeamSkillGap[]>([]);
  const [workflows, setWorkflows] = useState<TeamWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamData(selectedTeam.id);
    }
  }, [selectedTeam]);

  const fetchTeamData = async (teamId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const [performance, gaps, workflowData] = await Promise.all([
        teamService.getTeamPerformance(teamId),
        teamService.getTeamSkillGaps(teamId),
        teamService.getTeamWorkflows(teamId)
      ]);
      
      setPerformanceMetrics(performance || []);
      setSkillGaps(gaps || []);
      setWorkflows(workflowData || []);
    } catch (err) {
      setError('Failed to fetch team data');
      console.error('Error fetching team data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricTrend = (metric: TeamPerformanceMetric) => {
    // Simple trend calculation - in a real app, this would compare with previous periods
    if (metric.metric_value > 75) return 'up';
    if (metric.metric_value < 50) return 'down';
    return 'stable';
  };

  const getSkillGapSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatMetricValue = (value: number, type: string) => {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'hours':
        return `${value.toFixed(1)}h`;
      case 'count':
        return Math.round(value).toString();
      default:
        return value.toFixed(2);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading team dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Dashboard</h1>
        <div className="flex space-x-2">
          <select
            value={selectedTeam?.id || ''}
            onChange={(e) => {
              const teamId = parseInt(e.target.value);
              const team = teams.find(t => t.id === teamId);
              setSelectedTeam(team || null);
            }}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Select a team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <Button onClick={() => selectedTeam && fetchTeamData(selectedTeam.id)}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {selectedTeam ? (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="skills">Skill Gaps</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Team Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Team Name</p>
                      <p className="font-medium">{selectedTeam.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Members</p>
                      <p className="font-medium">{selectedTeam.member_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">
                        {new Date(selectedTeam.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceMetrics.slice(0, 3).map((metric) => (
                      <div key={metric.id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{metric.metric_name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {formatMetricValue(metric.metric_value, metric.metric_type)}
                          </span>
                          <span className={`text-xs ${
                            getMetricTrend(metric) === 'up' ? 'text-green-600' :
                            getMetricTrend(metric) === 'down' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {getMetricTrend(metric) === 'up' ? '↗' :
                             getMetricTrend(metric) === 'down' ? '↘' : '→'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {performanceMetrics.length === 0 && (
                      <p className="text-gray-500 text-sm">No performance data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Skill Gaps Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Critical Skill Gaps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {skillGaps.filter(gap => gap.gap_severity === 'critical').slice(0, 3).map((gap) => (
                      <div key={gap.id} className="flex justify-between items-center">
                        <span className="text-sm">{gap.skill_name}</span>
                        <Badge 
                          variant={getSkillGapSeverityColor(gap.gap_severity)}
                          icon={null}
                          onRemove={() => {}}
                        >
                          {gap.gap_severity}
                        </Badge>
                      </div>
                    ))}
                    {skillGaps.filter(gap => gap.gap_severity === 'critical').length === 0 && (
                      <p className="text-gray-500 text-sm">No critical skill gaps</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.map((metric) => (
                      <div key={metric.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{metric.metric_name}</h4>
                          <Badge 
                            variant={getMetricTrend(metric) === 'up' ? 'success' : 
                                   getMetricTrend(metric) === 'down' ? 'error' : 'default'}
                            icon={null}
                            onRemove={() => {}}
                          >
                            {getMetricTrend(metric)}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {formatMetricValue(metric.metric_value, metric.metric_type)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Period: {new Date(metric.period_start).toLocaleDateString()} - {new Date(metric.period_end).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {performanceMetrics.length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        No performance metrics available. Metrics will appear here as team activity is tracked.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-500">Performance trend visualization will be displayed here.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      This will show charts and graphs of team performance over time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skill Gap Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillGaps.map((gap) => (
                    <div key={gap.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">{gap.skill_name}</h4>
                        <Badge 
                          variant={getSkillGapSeverityColor(gap.gap_severity)}
                          icon={null}
                          onRemove={() => {}}
                        >
                          {gap.gap_severity}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Current Level</p>
                          <p className="font-medium">{gap.current_level}/10</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Required Level</p>
                          <p className="font-medium">{gap.required_level}/10</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Gap</p>
                          <p className="font-medium text-red-600">
                            -{(gap.required_level - gap.current_level)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(gap.current_level / gap.required_level) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {skillGaps.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No skill gaps identified. This is great! Your team appears to have all required skills.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows">
            <Card>
              <CardHeader>
                <CardTitle>Team Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">{workflow.workflow_name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Efficiency:</span>
                          <Badge 
                            variant={workflow.efficiency_score >= 80 ? 'success' : 
                                   workflow.efficiency_score >= 60 ? 'warning' : 'error'}
                            icon={null}
                            onRemove={() => {}}
                          >
                            {workflow.efficiency_score.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        Last updated: {new Date(workflow.updated_at).toLocaleDateString()}
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm">
                          Workflow data: {JSON.stringify(workflow.workflow_data, null, 2).slice(0, 100)}...
                        </p>
                      </div>
                    </div>
                  ))}
                  {workflows.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No workflows configured. Set up workflows to track and optimize team processes.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Select a team to view dashboard</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamDashboard;