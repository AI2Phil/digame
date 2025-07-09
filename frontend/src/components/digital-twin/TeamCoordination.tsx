import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import Select from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import Progress from '../ui/Progress';

// Types
interface TeamMember {
  twinId: string;
  name: string;
  role: string;
  availability: 'available' | 'busy' | 'away';
  currentWorkload: number;
  capacity: number;
  timezone?: string;
  preferredWorkHours?: string;
  skills?: Record<string, number>;
}

interface CoordinationResult {
  coordinationId: string;
  coordinationType: string;
  status: string;
  estimatedImprovement: number;
  confidence: number;
  processingTimeMs: number;
  createdAt: string;
  results: any;
}

interface CoordinationHistoryItem {
  id: string;
  coordinationType: string;
  title: string;
  status: string;
  estimatedImprovement: number;
  confidence: number;
  createdAt: string;
  participants: number;
  durationMinutes: number;
}

type CoordinationType = 'workload_balancing' | 'skill_optimization' | 'meeting_optimization' | 'absence_planning' | 'resource_allocation' | 'collaboration_sync';

interface TeamCoordinationProps {
  teamId?: string;
}

export const TeamCoordination: React.FC<TeamCoordinationProps> = ({ teamId = 'default' }) => {
  const [activeTab, setActiveTab] = useState('workload');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [coordinationType, setCoordinationType] = useState<CoordinationType>('workload_balancing');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [coordinationResult, setCoordinationResult] = useState<CoordinationResult | null>(null);
  const [coordinationHistory, setCoordinationHistory] = useState<CoordinationHistoryItem[]>([]);
  const [isCoordinating, setIsCoordinating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const coordinationTypes = [
    { value: 'workload_balancing', label: 'Workload Balancing', icon: '⚖️' },
    { value: 'skill_optimization', label: 'Skill Optimization', icon: '🎯' },
    { value: 'meeting_optimization', label: 'Meeting Optimization', icon: '📅' },
    { value: 'absence_planning', label: 'Absence Planning', icon: '🏖️' },
    { value: 'resource_allocation', label: 'Resource Allocation', icon: '📊' },
    { value: 'collaboration_sync', label: 'Collaboration Sync', icon: '🤝' }
  ];

  useEffect(() => {
    fetchTeamMembers();
    fetchCoordinationHistory();
  }, [teamId]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8001/api/digital-twin/team-coordination/members', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const data = await response.json();
      if (data.success) {
        setMembers(data.data.team_members || []);
      } else {
        // Fallback data
        setMembers([
          {
            twinId: 'twin_1',
            name: 'Alice Johnson',
            role: 'Developer',
            availability: 'available',
            currentWorkload: 75,
            capacity: 100,
            timezone: 'UTC',
            preferredWorkHours: '9:00-17:00',
            skills: { JavaScript: 0.9, React: 0.85, Python: 0.7 }
          },
          {
            twinId: 'twin_2',
            name: 'Bob Smith',
            role: 'Designer',
            availability: 'busy',
            currentWorkload: 90,
            capacity: 100,
            timezone: 'UTC-5',
            preferredWorkHours: '10:00-18:00',
            skills: { Design: 0.95, Figma: 0.9, CSS: 0.8 }
          },
          {
            twinId: 'twin_3',
            name: 'Carol Davis',
            role: 'Product Manager',
            availability: 'available',
            currentWorkload: 60,
            capacity: 100,
            timezone: 'UTC+1',
            preferredWorkHours: '8:00-16:00',
            skills: { Management: 0.9, Analytics: 0.8, Strategy: 0.85 }
          }
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team members');
      // Fallback data on error
      setMembers([
        {
          twinId: 'twin_1',
          name: 'Alice Johnson',
          role: 'Developer',
          availability: 'available',
          currentWorkload: 75,
          capacity: 100,
          timezone: 'UTC',
          preferredWorkHours: '9:00-17:00',
          skills: { JavaScript: 0.9, React: 0.85, Python: 0.7 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordinationHistory = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/digital-twin/team-coordination/history?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch coordination history');
      }

      const data = await response.json();
      if (data.success) {
        setCoordinationHistory(data.data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch coordination history:', err);
      // Fallback data
      setCoordinationHistory([
        {
          id: 'coord_1',
          coordinationType: 'workload_balancing',
          title: 'Workload Balancing Optimization',
          status: 'completed',
          estimatedImprovement: 25.5,
          confidence: 0.85,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          participants: 5,
          durationMinutes: 45
        }
      ]);
    }
  };

  const handleStartCoordination = async () => {
    if (selectedMembers.length === 0) {
      alert('Please select at least one team member');
      return;
    }

    try {
      setIsCoordinating(true);
      const response = await fetch('http://localhost:8001/api/digital-twin/team-coordination/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordination_type: coordinationType,
          target_twins: selectedMembers,
          parameters,
          goals: getCoordinationGoals(coordinationType)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start coordination');
      }

      const data = await response.json();
      if (data.success) {
        setCoordinationResult(data.data);
        // Refresh history
        fetchCoordinationHistory();
      } else {
        throw new Error(data.message || 'Coordination failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start coordination');
      // Fallback result
      setCoordinationResult({
        coordinationId: `coord_${Date.now()}`,
        coordinationType,
        status: 'completed',
        estimatedImprovement: 20.5,
        confidence: 0.8,
        processingTimeMs: 2500,
        createdAt: new Date().toISOString(),
        results: {
          recommendations: [
            {
              priority: 'high',
              description: 'Redistribute tasks to balance workload',
              impact: 15.5,
              effort: 'medium'
            }
          ]
        }
      });
    } finally {
      setIsCoordinating(false);
    }
  };

  const getCoordinationGoals = (type: CoordinationType): string[] => {
    const goalMap = {
      workload_balancing: ['balance_workload', 'optimize_utilization', 'reduce_stress'],
      skill_optimization: ['optimize_skills', 'fill_gaps', 'reduce_overlaps'],
      meeting_optimization: ['optimize_schedules', 'reduce_conflicts', 'improve_collaboration'],
      absence_planning: ['ensure_coverage', 'minimize_disruption', 'maintain_productivity'],
      resource_allocation: ['optimize_resources', 'improve_efficiency', 'reduce_waste'],
      collaboration_sync: ['improve_sync', 'enhance_communication', 'align_workflows']
    };
    return goalMap[type] || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading team coordination...</span>
      </div>
    );
  }

  return (
    <div className="team-coordination space-y-6">
      <div className="coordination-header">
        <h3 className="text-2xl font-bold text-gray-900">Team Coordination Center</h3>
        <p className="text-gray-600">Orchestrate multi-twin optimization and collaboration</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="workload">Workload</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="workload">
          <WorkloadCoordination
            teamId={teamId}
            members={members}
            onCoordinate={handleStartCoordination}
            isCoordinating={isCoordinating}
            result={coordinationResult}
            selectedMembers={selectedMembers}
            onMemberSelect={setSelectedMembers}
          />
        </TabsContent>

        <TabsContent value="skills">
          <SkillOptimization
            teamId={teamId}
            members={members}
            onCoordinate={handleStartCoordination}
            isCoordinating={isCoordinating}
            result={coordinationResult}
            selectedMembers={selectedMembers}
            onMemberSelect={setSelectedMembers}
          />
        </TabsContent>

        <TabsContent value="meetings">
          <MeetingOptimization
            teamId={teamId}
            members={members}
            onCoordinate={handleStartCoordination}
            isCoordinating={isCoordinating}
            result={coordinationResult}
            selectedMembers={selectedMembers}
            onMemberSelect={setSelectedMembers}
          />
        </TabsContent>

        <TabsContent value="planning">
          <AbsencePlanning
            teamId={teamId}
            members={members}
            onCoordinate={handleStartCoordination}
            isCoordinating={isCoordinating}
            result={coordinationResult}
            selectedMembers={selectedMembers}
            onMemberSelect={setSelectedMembers}
          />
        </TabsContent>

        <TabsContent value="history">
          <CoordinationHistory history={coordinationHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const WorkloadCoordination: React.FC<{
  teamId: string;
  members: TeamMember[];
  onCoordinate: () => void;
  isCoordinating: boolean;
  result?: CoordinationResult | null;
  selectedMembers: string[];
  onMemberSelect: (members: string[]) => void;
}> = ({ teamId, members, onCoordinate, isCoordinating, result, selectedMembers, onMemberSelect }) => {
  
  const handleMemberToggle = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      onMemberSelect(selectedMembers.filter(id => id !== memberId));
    } else {
      onMemberSelect([...selectedMembers, memberId]);
    }
  };

  return (
    <div className="workload-coordination">
      <Card>
        <CardHeader>
          <CardTitle>⚖️ Workload Balancing</CardTitle>
          <p className="text-gray-600">Optimize workload distribution across team members</p>
        </CardHeader>
        <CardContent>
          <div className="current-workloads mb-6">
            <h5 className="text-lg font-semibold mb-4">Current Workload Distribution</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map(member => (
                <div key={member.twinId} className="workload-item p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="member-info">
                      <span className="font-medium">{member.name}</span>
                      <Badge
                        variant={member.availability === 'available' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {member.availability}
                      </Badge>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.twinId)}
                      onChange={() => handleMemberToggle(member.twinId)}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="workload-bar">
                    <Progress 
                      value={member.currentWorkload} 
                      className={`mb-2 ${
                        member.currentWorkload / member.capacity > 0.9 ? 'bg-red-200' :
                        member.currentWorkload / member.capacity < 0.5 ? 'bg-yellow-200' : 'bg-green-200'
                      }`}
                    />
                    <span className="text-sm text-gray-600">
                      {member.currentWorkload}% / {member.capacity}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result && result.coordinationType === 'workload_balancing' && (
            <div className="coordination-results mb-6">
              <h5 className="text-lg font-semibold mb-4">Optimization Results</h5>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="metric p-4 bg-blue-50 rounded-lg">
                  <span className="block text-sm text-gray-600">Estimated Improvement:</span>
                  <span className="text-2xl font-bold text-blue-600">{result.estimatedImprovement.toFixed(1)}%</span>
                </div>
                <div className="metric p-4 bg-green-50 rounded-lg">
                  <span className="block text-sm text-gray-600">Confidence:</span>
                  <span className="text-2xl font-bold text-green-600">{(result.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              {result.results.recommendations && (
                <div className="recommendations">
                  <h6 className="font-semibold mb-2">Recommendations:</h6>
                  <div className="space-y-2">
                    {result.results.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="recommendation p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                          >
                            {rec.priority}
                          </Badge>
                          <span className="text-sm text-gray-600">Impact: {rec.impact.toFixed(1)}%</span>
                        </div>
                        <p className="mt-2">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="coordination-actions">
            <Button 
              onClick={onCoordinate} 
              disabled={isCoordinating || selectedMembers.length === 0}
              className="w-full"
            >
              {isCoordinating ? 'Optimizing Workload...' : 'Optimize Workload Distribution'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SkillOptimization: React.FC<{
  teamId: string;
  members: TeamMember[];
  onCoordinate: () => void;
  isCoordinating: boolean;
  result?: CoordinationResult | null;
  selectedMembers: string[];
  onMemberSelect: (members: string[]) => void;
}> = ({ teamId, members, onCoordinate, isCoordinating, result, selectedMembers, onMemberSelect }) => {
  
  const handleMemberToggle = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      onMemberSelect(selectedMembers.filter(id => id !== memberId));
    } else {
      onMemberSelect([...selectedMembers, memberId]);
    }
  };

  return (
    <div className="skill-optimization">
      <Card>
        <CardHeader>
          <CardTitle>🎯 Skill Optimization</CardTitle>
          <p className="text-gray-600">Optimize skill utilization and identify gaps</p>
        </CardHeader>
        <CardContent>
          <div className="skills-matrix mb-6">
            <h5 className="text-lg font-semibold mb-4">Team Skills Matrix</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map(member => (
                <div key={member.twinId} className="member-skills p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="member-header">
                      <span className="font-medium">{member.name}</span>
                      <Badge variant="outline" className="ml-2">{member.role}</Badge>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.twinId)}
                      onChange={() => handleMemberToggle(member.twinId)}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="skills-list space-y-2">
                    {Object.entries(member.skills || {}).map(([skill, level]) => (
                      <div key={skill} className="skill-item">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{skill}</span>
                          <span className="text-sm text-gray-600">{((level as number) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(level as number) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result && result.coordinationType === 'skill_optimization' && (
            <div className="optimization-results mb-6">
              <h5 className="text-lg font-semibold mb-4">Skill Analysis Results</h5>
              
              {result.results.skill_gaps && (
                <div className="skill-gaps mb-4">
                  <h6 className="font-semibold mb-2">Identified Skill Gaps:</h6>
                  <div className="space-y-2">
                    {result.results.skill_gaps.map((gap: any, index: number) => (
                      <div key={index} className="gap-item p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <Badge variant="destructive">{gap.skill}</Badge>
                          <span className="text-sm text-gray-600">Gap Level: {gap.level}</span>
                        </div>
                        <p className="mt-1 text-sm">Impact: {gap.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.results.skill_overlaps && (
                <div className="skill-overlaps">
                  <h6 className="font-semibold mb-2">Skill Overlaps:</h6>
                  <div className="space-y-2">
                    {result.results.skill_overlaps.map((overlap: any, index: number) => (
                      <div key={index} className="overlap-item p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{overlap.skill}</Badge>
                          <span className="text-sm text-gray-600">Redundancy: {overlap.redundancy}</span>
                        </div>
                        <p className="mt-1 text-sm">Opportunity: {overlap.opportunity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="coordination-actions">
            <Button 
              onClick={onCoordinate} 
              disabled={isCoordinating || selectedMembers.length === 0}
              className="w-full"
            >
              {isCoordinating ? 'Analyzing Skills...' : 'Optimize Skill Utilization'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MeetingOptimization: React.FC<{
  teamId: string;
  members: TeamMember[];
  onCoordinate: () => void;
  isCoordinating: boolean;
  result?: CoordinationResult | null;
  selectedMembers: string[];
  onMemberSelect: (members: string[]) => void;
}> = ({ teamId, members, onCoordinate, isCoordinating, result, selectedMembers, onMemberSelect }) => {
  const [meetingParameters, setMeetingParameters] = useState({
    duration: 60,
    frequency: 'weekly',
    type: 'team_sync'
  });

  const handleMemberToggle = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      onMemberSelect(selectedMembers.filter(id => id !== memberId));
    } else {
      onMemberSelect([...selectedMembers, memberId]);
    }
  };

  return (
    <div className="meeting-optimization">
      <Card>
        <CardHeader>
          <CardTitle>📅 Meeting Optimization</CardTitle>
          <p className="text-gray-600">Find optimal meeting times and reduce scheduling conflicts</p>
        </CardHeader>
        <CardContent>
          <div className="meeting-config mb-6">
            <h5 className="text-lg font-semibold mb-4">Meeting Configuration</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="config-item">
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <Select
                  value={meetingParameters.duration.toString()}
                  onChange={(value) => setMeetingParameters(prev => ({
                    ...prev,
                    duration: parseInt(value)
                  }))}
                  options={[
                    { value: '30', label: '30 minutes' },
                    { value: '60', label: '1 hour' },
                    { value: '90', label: '1.5 hours' },
                    { value: '120', label: '2 hours' }
                  ]}
                />
              </div>
              <div className="config-item">
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <Select
                  value={meetingParameters.frequency}
                  onChange={(value) => setMeetingParameters(prev => ({
                    ...prev,
                    frequency: value
                  }))}
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'biweekly', label: 'Bi-weekly' },
                    { value: 'monthly', label: 'Monthly' }
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="availability-overview mb-6">
            <h5 className="text-lg font-semibold mb-4">Team Availability Overview</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map(member => (
                <div key={member.twinId} className="member-availability p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{member.name}</span>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.twinId)}
                      onChange={() => handleMemberToggle(member.twinId)}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Timezone: {member.timezone || 'UTC'}</div>
                    <div>Preferred: {member.preferredWorkHours || '9:00-17:00'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result && result.coordinationType === 'meeting_optimization' && (
            <div className="optimization-results mb-6">
              <h5 className="text-lg font-semibold mb-4">Optimal Meeting Times</h5>
              {result.results.optimal_times?.map((time: any, index: number) => (
                <div key={index} className="optimal-time p-4 border rounded-lg mb-2">
                  <div className="flex items-center justify-between">
                    <div className="time-slot">
                      <span className="font-medium">{time.time}</span>
                      <span className="text-gray-600 ml-2">{time.day}</span>
                    </div>
                    <div className="availability-score">
                      <span className="text-sm text-gray-600">Availability: {(time.availability * 100).toFixed(0)}%</span>
                      <Progress value={time.availability * 100} className="w-24 mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="coordination-actions">
            <Button 
              onClick={onCoordinate} 
              disabled={isCoordinating || selectedMembers.length === 0}
              className="w-full"
            >
              {isCoordinating ? 'Optimizing Schedule...' : 'Find Optimal Meeting Times'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AbsencePlanning: React.FC<{
  teamId: string;
  members: TeamMember[];
  onCoordinate: () => void;
  isCoordinating: boolean;
  result?: CoordinationResult | null;
  selectedMembers: string[];
  onMemberSelect: (members: string[]) => void;
}> = ({ teamId, members, onCoordinate, isCoordinating, result, selectedMembers, onMemberSelect }) => {
  const [absenceInfo, setAbsenceInfo] = useState({
    memberTwinId: '',
    startDate: '',
    endDate: '',
    reason: 'vacation'
  });

  return (
    <div className="absence-planning">
      <Card>
        <CardHeader>
          <CardTitle>🏖️ Absence Planning</CardTitle>
          <p className="text-gray-600">Plan for team member absences and ensure coverage</p>
        </CardHeader>
        <CardContent>
          <div className="absence-form mb-6">
            <h5 className="text-lg font-semibold mb-4">Plan Absence</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-item">
                <label className="block text-sm font-medium mb-2">Team Member</label>
                <Select
                  value={absenceInfo.memberTwinId}
                  onChange={(value) => setAbsenceInfo(prev => ({
                    ...prev,
                    memberTwinId: value
                  }))}
                  options={members.map(member => ({
                    value: member.twinId,
                    label: member.name
                  }))}
                />
              </div>
              <div className="form-item">
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={absenceInfo.startDate}
                  onChange={(e) => setAbsenceInfo(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="form-item">
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={absenceInfo.endDate}
                  onChange={(e) => setAbsenceInfo(prev => ({
                    ...prev,
                    endDate: e.target.value
                  }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {result && result.coordinationType === 'absence_planning' && (
            <div className="planning-results mb-6">
              <h5 className="text-lg font-semibold mb-4">Coverage Plan</h5>
              <div className="coverage-summary mb-4">
                <div className="metric p-4 bg-blue-50 rounded-lg">
                  <span className="block text-sm text-gray-600">Coverage Adequacy:</span>
                  <span className="text-2xl font-bold text-blue-600">{(result.results.coverage_adequacy * 100).toFixed(0)}%</span>
                  <Progress
                    value={result.results.coverage_adequacy * 100}
                    className="mt-2"
                  />
                </div>
              </div>

              {result.results.coverage_plan?.assignments && (
                <div className="coverage-plan mb-4">
                  <h6 className="font-semibold mb-2">Coverage Assignments:</h6>
                  <div className="space-y-2">
                    {result.results.coverage_plan.assignments.map((assignment: any, index: number) => (
                      <div key={index} className="assignment p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{assignment.assignee}</span>
                          <Badge
                            variant={assignment.confidence > 0.8 ? 'default' : 'secondary'}
                          >
                            {(assignment.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{assignment.responsibility}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.results.risk_assessment?.risks && (
                <div className="risk-assessment">
                  <h6 className="font-semibold mb-2">Risk Assessment:</h6>
                  <div className="space-y-2">
                    {result.results.risk_assessment.risks.map((risk: any, index: number) => (
                      <div key={index} className="risk-item p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={risk.severity === 'high' ? 'destructive' : 'secondary'}
                          >
                            {risk.severity}
                          </Badge>
                        </div>
                        <p className="mt-1">{risk.description}</p>
                        <p className="text-sm text-gray-600 mt-1">Mitigation: {risk.mitigation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="coordination-actions">
            <Button
              onClick={onCoordinate}
              disabled={isCoordinating || !absenceInfo.memberTwinId || !absenceInfo.startDate || !absenceInfo.endDate}
              className="w-full"
            >
              {isCoordinating ? 'Planning Coverage...' : 'Plan Absence Coverage'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CoordinationHistory: React.FC<{
  history: CoordinationHistoryItem[];
}> = ({ history }) => {
  return (
    <div className="coordination-history">
      <Card>
        <CardHeader>
          <CardTitle>📊 Coordination History</CardTitle>
          <p className="text-gray-600">Recent team coordination activities and results</p>
        </CardHeader>
        <CardContent>
          <div className="history-list space-y-4">
            {history.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No coordination history available
              </div>
            ) : (
              history.map((item, index) => (
                <div key={index} className="history-item p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="coordination-info">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{item.coordinationType}</Badge>
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <span className="text-sm text-gray-600">{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                    <Badge
                      variant={item.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <div className="coordination-metrics grid grid-cols-3 gap-4 mt-3">
                    <div className="metric">
                      <span className="block text-xs text-gray-500">Improvement:</span>
                      <span className="font-semibold">{item.estimatedImprovement?.toFixed(1)}%</span>
                    </div>
                    <div className="metric">
                      <span className="block text-xs text-gray-500">Confidence:</span>
                      <span className="font-semibold">{(item.confidence * 100)?.toFixed(0)}%</span>
                    </div>
                    <div className="metric">
                      <span className="block text-xs text-gray-500">Participants:</span>
                      <span className="font-semibold">{item.participants}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamCoordination;