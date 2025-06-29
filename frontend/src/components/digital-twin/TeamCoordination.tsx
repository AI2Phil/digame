import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import Select from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import Progress from '../ui/Progress';
import { useTeamCoordination } from '../../hooks/useTeamCoordination';
import { CoordinationType, TeamMember, CoordinationResult } from '../../types/team';

interface TeamCoordinationProps {
  teamId: string;
  members: TeamMember[];
}

export const TeamCoordination: React.FC<TeamCoordinationProps> = ({ teamId, members }) => {
  const [activeTab, setActiveTab] = useState('workload');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [coordinationType, setCoordinationType] = useState<CoordinationType>('workload_balancing');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  
  const { 
    startCoordination, 
    coordinationResult, 
    isCoordinating, 
    coordinationHistory 
  } = useTeamCoordination(teamId);

  const coordinationTypes = [
    { value: 'workload_balancing', label: 'Workload Balancing', icon: '⚖️' },
    { value: 'skill_optimization', label: 'Skill Optimization', icon: '🎯' },
    { value: 'meeting_optimization', label: 'Meeting Optimization', icon: '📅' },
    { value: 'absence_planning', label: 'Absence Planning', icon: '🏖️' },
    { value: 'resource_allocation', label: 'Resource Allocation', icon: '📊' },
    { value: 'collaboration_sync', label: 'Collaboration Sync', icon: '🤝' }
  ];

  const handleStartCoordination = async () => {
    if (selectedMembers.length === 0) {
      alert('Please select at least one team member');
      return;
    }

    await startCoordination({
      coordinationType,
      targetTwins: selectedMembers,
      parameters,
      goals: getCoordinationGoals(coordinationType)
    });
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

  return (
    <div className="team-coordination">
      <div className="coordination-header">
        <h3>Team Coordination Center</h3>
        <p>Orchestrate multi-twin optimization and collaboration</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
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
          />
        </TabsContent>

        <TabsContent value="skills">
          <SkillOptimization
            teamId={teamId}
            members={members}
            onCoordinate={handleStartCoordination}
            isCoordinating={isCoordinating}
            result={coordinationResult}
          />
        </TabsContent>

        <TabsContent value="meetings">
          <MeetingOptimization
            teamId={teamId}
            members={members}
            onCoordinate={handleStartCoordination}
            isCoordinating={isCoordinating}
            result={coordinationResult}
          />
        </TabsContent>

        <TabsContent value="planning">
          <AbsencePlanning
            teamId={teamId}
            members={members}
            onCoordinate={handleStartCoordination}
            isCoordinating={isCoordinating}
            result={coordinationResult}
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
  result?: CoordinationResult;
}> = ({ teamId, members, onCoordinate, isCoordinating, result }) => {
  return (
    <div className="workload-coordination">
      <Card>
        <CardHeader>
          <CardTitle>⚖️ Workload Balancing</CardTitle>
          <p>Optimize workload distribution across team members</p>
        </CardHeader>
        <CardContent>
          <div className="current-workloads">
            <h5>Current Workload Distribution</h5>
            <div className="workload-grid">
              {members.map(member => (
                <div key={member.twinId} className="workload-item">
                  <div className="member-info">
                    <span className="member-name">{member.name}</span>
                    <Badge
                      variant={member.availability === 'available' ? 'success' : 'warning'}
                      icon={null}
                      onRemove={() => {}}
                    >
                      {member.availability}
                    </Badge>
                  </div>
                  <div className="workload-bar">
                    <Progress 
                      value={member.currentWorkload} 
                      max={member.capacity}
                      className={`workload-progress ${
                        member.currentWorkload / member.capacity > 0.9 ? 'overloaded' :
                        member.currentWorkload / member.capacity < 0.5 ? 'underutilized' : 'balanced'
                      }`}
                    />
                    <span className="workload-text">
                      {member.currentWorkload}% / {member.capacity}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result && result.coordinationType === 'workload_balancing' && (
            <div className="coordination-results">
              <h5>Optimization Results</h5>
              <div className="results-summary">
                <div className="metric">
                  <span className="label">Estimated Improvement:</span>
                  <span className="value">{result.estimatedImprovement.toFixed(1)}%</span>
                </div>
                <div className="metric">
                  <span className="label">Confidence:</span>
                  <span className="value">{(result.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="recommendations">
                <h6>Recommendations:</h6>
                {result.results.recommendations?.map((rec: any, index: number) => (
                  <div key={index} className="recommendation">
                    <Badge
                      variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                      icon={null}
                      onRemove={() => {}}
                    >
                      {rec.priority}
                    </Badge>
                    <span>{rec.description}</span>
                    <span className="impact">Impact: {rec.impact.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="coordination-actions">
            <Button 
              onClick={onCoordinate} 
              loading={isCoordinating}
              className="coordinate-btn"
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
  result?: CoordinationResult;
}> = ({ teamId, members, onCoordinate, isCoordinating, result }) => {
  return (
    <div className="skill-optimization">
      <Card>
        <CardHeader>
          <CardTitle>🎯 Skill Optimization</CardTitle>
          <p>Optimize skill utilization and identify gaps</p>
        </CardHeader>
        <CardContent>
          <div className="skills-matrix">
            <h5>Team Skills Matrix</h5>
            <div className="skills-grid">
              {members.map(member => (
                <div key={member.twinId} className="member-skills">
                  <div className="member-header">
                    <span className="member-name">{member.name}</span>
                    <span className="role-badge">{member.role}</span>
                  </div>
                  <div className="skills-list">
                    {Object.entries(member.skills || {}).map(([skill, level]) => (
                      <div key={skill} className="skill-item">
                        <span className="skill-name">{skill}</span>
                        <Progress value={level * 100} max={100} className="skill-progress" />
                        <span className="skill-level">{(level * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result && result.coordinationType === 'skill_optimization' && (
            <div className="optimization-results">
              <h5>Skill Analysis Results</h5>
              
              <div className="skill-gaps">
                <h6>Identified Skill Gaps:</h6>
                {result.results.skillGaps?.map((gap: any, index: number) => (
                  <div key={index} className="gap-item">
                    <Badge variant="destructive" icon={null} onRemove={() => {}}>{gap.skill}</Badge>
                    <span>Gap Level: {gap.level}</span>
                    <span>Impact: {gap.impact}</span>
                  </div>
                ))}
              </div>

              <div className="skill-overlaps">
                <h6>Skill Overlaps:</h6>
                {result.results.skillOverlaps?.map((overlap: any, index: number) => (
                  <div key={index} className="overlap-item">
                    <Badge variant="secondary" icon={null} onRemove={() => {}}>{overlap.skill}</Badge>
                    <span>Redundancy: {overlap.redundancy}</span>
                    <span>Optimization Opportunity: {overlap.opportunity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="coordination-actions">
            <Button 
              onClick={onCoordinate} 
              loading={isCoordinating}
              className="coordinate-btn"
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
  result?: CoordinationResult;
}> = ({ teamId, members, onCoordinate, isCoordinating, result }) => {
  const [meetingParameters, setMeetingParameters] = useState({
    duration: 60,
    frequency: 'weekly',
    type: 'team_sync'
  });

  return (
    <div className="meeting-optimization">
      <Card>
        <CardHeader>
          <CardTitle>📅 Meeting Optimization</CardTitle>
          <p>Find optimal meeting times and reduce scheduling conflicts</p>
        </CardHeader>
        <CardContent>
          <div className="meeting-config">
            <h5>Meeting Configuration</h5>
            <div className="config-grid">
              <div className="config-item">
                <label>Duration (minutes)</label>
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
                <label>Frequency</label>
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

          <div className="availability-overview">
            <h5>Team Availability Overview</h5>
            <div className="availability-grid">
              {members.map(member => (
                <div key={member.twinId} className="member-availability">
                  <span className="member-name">{member.name}</span>
                  <div className="timezone">
                    <span>Timezone: {member.timezone || 'UTC'}</span>
                  </div>
                  <div className="preferred-hours">
                    <span>Preferred: {member.preferredWorkHours || '9:00-17:00'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result && result.coordinationType === 'meeting_optimization' && (
            <div className="optimization-results">
              <h5>Optimal Meeting Times</h5>
              {result.results.optimalTimes?.map((time: any, index: number) => (
                <div key={index} className="optimal-time">
                  <div className="time-slot">
                    <span className="time">{time.time}</span>
                    <span className="day">{time.day}</span>
                  </div>
                  <div className="availability-score">
                    <span>Availability: {(time.availability * 100).toFixed(0)}%</span>
                    <Progress value={time.availability * 100} max={100} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="coordination-actions">
            <Button 
              onClick={onCoordinate} 
              loading={isCoordinating}
              className="coordinate-btn"
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
  result?: CoordinationResult;
}> = ({ teamId, members, onCoordinate, isCoordinating, result }) => {
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
          <p>Plan for team member absences and ensure coverage</p>
        </CardHeader>
        <CardContent>
          <div className="absence-form">
            <h5>Plan Absence</h5>
            <div className="form-grid">
              <div className="form-item">
                <label>Team Member</label>
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
                <label>Start Date</label>
                <input
                  type="date"
                  value={absenceInfo.startDate}
                  onChange={(e) => setAbsenceInfo(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }))}
                />
              </div>
              <div className="form-item">
                <label>End Date</label>
                <input
                  type="date"
                  value={absenceInfo.endDate}
                  onChange={(e) => setAbsenceInfo(prev => ({
                    ...prev,
                    endDate: e.target.value
                  }))}
                />
              </div>
            </div>
          </div>

          {result && result.coordinationType === 'absence_planning' && (
            <div className="planning-results">
              <h5>Coverage Plan</h5>
              <div className="coverage-summary">
                <div className="metric">
                  <span className="label">Coverage Adequacy:</span>
                  <span className="value">{(result.results.coverageAdequacy * 100).toFixed(0)}%</span>
                </div>
                <Progress 
                  value={result.results.coverageAdequacy * 100} 
                  max={100}
                  className="coverage-progress"
                />
              </div>

              <div className="coverage-plan">
                <h6>Coverage Assignments:</h6>
                {result.results.coveragePlan?.assignments?.map((assignment: any, index: number) => (
                  <div key={index} className="assignment">
                    <span className="assignee">{assignment.assignee}</span>
                    <span className="responsibility">{assignment.responsibility}</span>
                    <Badge
                      variant={assignment.confidence > 0.8 ? 'success' : 'warning'}
                      icon={null}
                      onRemove={() => {}}
                    >
                      {(assignment.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="risk-assessment">
                <h6>Risk Assessment:</h6>
                {result.results.riskAssessment?.risks?.map((risk: any, index: number) => (
                  <div key={index} className="risk-item">
                    <Badge
                      variant={risk.severity === 'high' ? 'destructive' : 'secondary'}
                      icon={null}
                      onRemove={() => {}}
                    >
                      {risk.severity}
                    </Badge>
                    <span>{risk.description}</span>
                    <span className="mitigation">{risk.mitigation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="coordination-actions">
            <Button 
              onClick={onCoordinate} 
              loading={isCoordinating}
              className="coordinate-btn"
              disabled={!absenceInfo.memberTwinId || !absenceInfo.startDate || !absenceInfo.endDate}
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
  history: any[];
}> = ({ history }) => {
  return (
    <div className="coordination-history">
      <Card>
        <CardHeader>
          <CardTitle>📊 Coordination History</CardTitle>
          <p>Recent team coordination activities and results</p>
        </CardHeader>
        <CardContent>
          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-item">
                <div className="coordination-info">
                  <div className="type-badge">
                    <Badge variant="outline" icon={null} onRemove={() => {}}>{item.coordinationType}</Badge>
                  </div>
                  <div className="coordination-details">
                    <span className="title">{item.title}</span>
                    <span className="timestamp">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="coordination-metrics">
                  <div className="metric">
                    <span className="label">Status:</span>
                    <Badge
                      variant={item.status === 'completed' ? 'success' : 'secondary'}
                      icon={null}
                      onRemove={() => {}}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <div className="metric">
                    <span className="label">Improvement:</span>
                    <span className="value">{item.estimatedImprovement?.toFixed(1)}%</span>
                  </div>
                  <div className="metric">
                    <span className="label">Confidence:</span>
                    <span className="value">{(item.confidence * 100)?.toFixed(0)}%</span>
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

export default TeamCoordination;