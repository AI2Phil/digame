import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/Dialog';
import { useTeamManagement } from '../hooks/useTeamManagement';
import { teamService } from '../services/teamService';

interface TeamSkillGap {
  id: number;
  team_id: number;
  skill_name: string;
  current_level: number;
  required_level: number;
  gap_severity: string;
  identified_at: string;
}

interface SkillAnalysis {
  skill_name: string;
  team_average: number;
  required_level: number;
  gap: number;
  severity: string;
  members_needing_training: number;
  recommended_actions: string[];
}

const SkillGapVisualization: React.FC = () => {
  const { teams, selectedTeam, setSelectedTeam } = useTeamManagement();
  const [skillGaps, setSkillGaps] = useState<TeamSkillGap[]>([]);
  const [skillAnalysis, setSkillAnalysis] = useState<SkillAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddSkillDialog, setShowAddSkillDialog] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    current_level: 1,
    required_level: 5
  });

  useEffect(() => {
    if (selectedTeam) {
      fetchSkillGaps(selectedTeam.id);
    }
  }, [selectedTeam]);

  const fetchSkillGaps = async (teamId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const gaps = await teamService.getTeamSkillGaps(teamId);
      setSkillGaps(gaps || []);
      
      // Generate skill analysis
      const analysis = generateSkillAnalysis(gaps || []);
      setSkillAnalysis(analysis);
    } catch (err) {
      setError('Failed to fetch skill gaps');
      console.error('Error fetching skill gaps:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSkillAnalysis = (gaps: TeamSkillGap[]): SkillAnalysis[] => {
    const skillMap = new Map<string, TeamSkillGap[]>();
    
    // Group gaps by skill name
    gaps.forEach(gap => {
      if (!skillMap.has(gap.skill_name)) {
        skillMap.set(gap.skill_name, []);
      }
      skillMap.get(gap.skill_name)!.push(gap);
    });

    // Generate analysis for each skill
    return Array.from(skillMap.entries()).map(([skillName, skillGaps]) => {
      const avgCurrent = skillGaps.reduce((sum, gap) => sum + gap.current_level, 0) / skillGaps.length;
      const maxRequired = Math.max(...skillGaps.map(gap => gap.required_level));
      const gap = maxRequired - avgCurrent;
      
      let severity = 'low';
      if (gap >= 3) severity = 'critical';
      else if (gap >= 2) severity = 'high';
      else if (gap >= 1) severity = 'medium';

      const membersNeedingTraining = skillGaps.filter(gap => gap.current_level < gap.required_level).length;

      const recommendedActions = generateRecommendations(gap, severity, membersNeedingTraining);

      return {
        skill_name: skillName,
        team_average: avgCurrent,
        required_level: maxRequired,
        gap,
        severity,
        members_needing_training: membersNeedingTraining,
        recommended_actions: recommendedActions
      };
    }).sort((a, b) => b.gap - a.gap); // Sort by gap size, largest first
  };

  const generateRecommendations = (gap: number, severity: string, membersCount: number): string[] => {
    const recommendations: string[] = [];
    
    if (gap >= 3) {
      recommendations.push('Immediate training program required');
      recommendations.push('Consider hiring external experts');
      recommendations.push('Pair programming with senior team members');
    } else if (gap >= 2) {
      recommendations.push('Structured learning path needed');
      recommendations.push('Mentorship program');
      recommendations.push('Online courses and certifications');
    } else if (gap >= 1) {
      recommendations.push('Regular practice sessions');
      recommendations.push('Knowledge sharing sessions');
      recommendations.push('Code reviews and feedback');
    } else {
      recommendations.push('Maintain current skill level');
      recommendations.push('Advanced topics exploration');
    }

    if (membersCount > 1) {
      recommendations.push(`Focus on ${membersCount} team members`);
    }

    return recommendations;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getGapPercentage = (current: number, required: number) => {
    return Math.max(0, (current / required) * 100);
  };

  const handleAddSkill = async () => {
    if (!selectedTeam || !newSkill.skill_name.trim()) return;

    try {
      // In a real implementation, this would call an API to add a skill gap
      console.log('Adding skill gap:', newSkill);
      setNewSkill({ skill_name: '', current_level: 1, required_level: 5 });
      setShowAddSkillDialog(false);
      // Refresh data
      fetchSkillGaps(selectedTeam.id);
    } catch (error) {
      console.error('Failed to add skill gap:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading skill gap analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Skill Gap Analysis</h1>
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
          {selectedTeam && (
            <Dialog open={showAddSkillDialog} onOpenChange={setShowAddSkillDialog}>
              <DialogTrigger asChild>
                <Button>Add Skill Assessment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Skill Assessment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Skill Name</label>
                    <Input
                      value={newSkill.skill_name}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, skill_name: e.target.value }))}
                      placeholder="e.g., React, Python, Project Management"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Level (1-10)</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newSkill.current_level}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, current_level: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Required Level (1-10)</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newSkill.required_level}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, required_level: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddSkillDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSkill}>Add Assessment</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
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
        <div className="space-y-6">
          {/* Skill Analysis Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Skills Assessed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {skillAnalysis.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Critical Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {skillAnalysis.filter(s => s.severity === 'critical').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Members Needing Training</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {skillAnalysis.reduce((sum, s) => sum + s.members_needing_training, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Skill Analysis */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Detailed Analysis</h2>
            {skillAnalysis.map((analysis, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{analysis.skill_name}</CardTitle>
                    <Badge 
                      variant={getSeverityColor(analysis.severity)}
                      icon={null}
                      onRemove={() => {}}
                    >
                      {analysis.severity} priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Skill Level Visualization */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Team Average</p>
                        <div className="flex items-center space-x-2">
                          <div className="text-2xl font-bold text-blue-600">
                            {analysis.team_average.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-500">/ 10</div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Required Level</p>
                        <div className="flex items-center space-x-2">
                          <div className="text-2xl font-bold text-green-600">
                            {analysis.required_level}
                          </div>
                          <div className="text-sm text-gray-500">/ 10</div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Gap</p>
                        <div className="flex items-center space-x-2">
                          <div className="text-2xl font-bold text-red-600">
                            {analysis.gap.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-500">levels</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Current Progress</span>
                        <span>{getGapPercentage(analysis.team_average, analysis.required_level).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            analysis.severity === 'critical' ? 'bg-red-500' :
                            analysis.severity === 'high' ? 'bg-orange-500' :
                            analysis.severity === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${getGapPercentage(analysis.team_average, analysis.required_level)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium mb-2">Recommended Actions</h4>
                      <ul className="space-y-1">
                        {analysis.recommended_actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start space-x-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span className="text-sm text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Members Needing Training */}
                    {analysis.members_needing_training > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-orange-800">
                          <strong>{analysis.members_needing_training}</strong> team member(s) need training in this skill
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {skillAnalysis.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 mb-4">No skill assessments found for this team.</p>
                  <p className="text-sm text-gray-400">
                    Add skill assessments to identify gaps and create development plans.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Select a team to view skill gap analysis</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillGapVisualization;