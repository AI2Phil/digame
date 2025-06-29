export type CoordinationType = 
  | 'workload_balancing'
  | 'skill_optimization'
  | 'meeting_optimization'
  | 'absence_planning'
  | 'resource_allocation'
  | 'collaboration_sync';

export type CoordinationPriority = 'low' | 'medium' | 'high' | 'critical';

export type CoordinationStatus = 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';

export interface TeamMember {
  twinId: string;
  name: string;
  role: string;
  status: string;
  availability: string;
  currentWorkload: number;
  capacity: number;
  skills: Record<string, number>;
  specializations: string[];
  timezone?: string;
  preferredWorkHours?: string;
}

export interface Team {
  teamId: string;
  name: string;
  description?: string;
  status: string;
  memberCount: number;
  teamLeadTwinId: string;
  members: TeamMember[];
  metrics: TeamMetrics;
  createdAt: string;
  lastCoordinationAt?: string;
}

export interface TeamMetrics {
  productivityScore: number;
  collaborationScore: number;
  workloadBalance: number;
  skillCoverage: number;
  availabilityRate: number;
}

export interface TeamCoordinationRequest {
  coordinationType: CoordinationType;
  targetTwins: string[];
  parameters?: Record<string, any>;
  goals?: string[];
  priority?: CoordinationPriority;
}

export interface CoordinationResult {
  coordinationId: string;
  teamId: string;
  coordinationType: CoordinationType;
  status: CoordinationStatus;
  confidence: number;
  estimatedImprovement: number;
  results: Record<string, any>;
  executionTimeMs?: number;
  completedAt?: string;
}

export interface WorkloadBalance {
  twinId: string;
  currentWorkload: number;
  capacity: number;
  utilization: number;
  skills: Record<string, number>;
  availability: string;
}

export interface WorkloadRecommendation {
  twinId: string;
  type: 'workload_adjustment';
  currentWorkload: number;
  recommendedWorkload: number;
  adjustment: number;
  impact: number;
  priority: 'low' | 'medium' | 'high';
  description: string;
}

export interface SkillGap {
  skill: string;
  level: number;
  impact: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SkillOverlap {
  skill: string;
  redundancy: number;
  opportunity: string;
  members: string[];
}

export interface OptimalMeetingTime {
  time: string;
  day: string;
  availability: number;
  conflicts: number;
  timezone: string;
}

export interface MeetingRecommendation {
  type: 'schedule_change' | 'conflict_resolution' | 'duration_adjustment';
  description: string;
  impact: number;
  priority: 'low' | 'medium' | 'high';
  optimalTime?: OptimalMeetingTime;
}

export interface AbsenceInfo {
  memberTwinId: string;
  startDate: string;
  endDate: string;
  reason: string;
  impact: 'low' | 'medium' | 'high';
}

export interface CoverageAssignment {
  assignee: string;
  responsibility: string;
  confidence: number;
  workloadIncrease: number;
}

export interface CoveragePlan {
  assignments: CoverageAssignment[];
  gaps: CoverageGap[];
  adequacy: number;
}

export interface CoverageGap {
  area: string;
  severity: number;
  impact: string;
  mitigation?: string;
}

export interface RiskAssessment {
  risks: Risk[];
  overallRisk: 'low' | 'medium' | 'high';
  mitigationStrategies: string[];
}

export interface Risk {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  probability: number;
  impact: string;
  mitigation: string;
}

export interface CoordinationHistory {
  coordinationId: string;
  coordinationType: CoordinationType;
  title: string;
  status: CoordinationStatus;
  confidence: number;
  estimatedImprovement: number;
  createdAt: string;
  completedAt?: string;
  results?: Record<string, any>;
}

export interface TeamAnalytics {
  teamId: string;
  analysisPeriodDays: number;
  teamMetrics: TeamMetrics;
  memberPerformance: MemberPerformance[];
  coordinationHistory: CoordinationHistory[];
  performanceTrends: PerformanceTrends;
  recommendations: TeamRecommendation[];
  generatedAt: string;
}

export interface MemberPerformance {
  twinId: string;
  role: string;
  workloadUtilization: number;
  skillCount: number;
  availability: string;
  contributionScore: number;
  collaborationRating: number;
}

export interface PerformanceTrends {
  productivityTrend: 'improving' | 'stable' | 'declining';
  collaborationTrend: 'improving' | 'stable' | 'declining';
  workloadTrend: 'balanced' | 'unbalanced' | 'improving';
}

export interface TeamRecommendation {
  type: 'workload_optimization' | 'skill_development' | 'collaboration_improvement' | 'meeting_optimization';
  description: string;
  priority: 'low' | 'medium' | 'high';
  impact: 'low' | 'moderate' | 'high';
  estimatedImprovement?: number;
  actionItems?: string[];
}

export interface ResourceAllocation {
  resourceType: string;
  currentAllocation: Record<string, number>;
  optimalAllocation: Record<string, number>;
  efficiency: number;
}

export interface ResourceRecommendation {
  type: 'reallocation' | 'acquisition' | 'optimization';
  resource: string;
  description: string;
  impact: number;
  priority: 'low' | 'medium' | 'high';
  estimatedCost?: number;
  estimatedBenefit?: number;
}

export interface CollaborationData {
  pairwiseCollaborations: PairwiseCollaboration[];
  communicationPatterns: CommunicationPattern[];
  knowledgeSharing: KnowledgeSharing[];
  syncScore: number;
}

export interface PairwiseCollaboration {
  twinAId: string;
  twinBId: string;
  collaborationType: string;
  frequency: number;
  effectiveness: number;
  lastInteraction: string;
}

export interface CommunicationPattern {
  pattern: string;
  frequency: number;
  effectiveness: number;
  participants: string[];
}

export interface KnowledgeSharing {
  sharedBy: string;
  sharedWith: string[];
  topic: string;
  impact: number;
  timestamp: string;
}

export interface SyncOpportunity {
  type: 'knowledge_sharing' | 'workflow_alignment' | 'communication_improvement';
  description: string;
  participants: string[];
  impact: number;
  effort: number;
}

export interface SyncPlan {
  actions: SyncAction[];
  timeline: string;
  expectedImprovement: number;
  resources: string[];
}

export interface SyncAction {
  type: string;
  description: string;
  participants: string[];
  timeline: string;
  priority: 'low' | 'medium' | 'high';
}

// API Response types
export interface TeamCreateResponse {
  teamId: string;
  name: string;
  description?: string;
  status: string;
  memberCount: number;
  createdAt: string;
}

export interface TeamMemberResponse {
  success: boolean;
  member: {
    memberId: string;
    teamId: string;
    twinId: string;
    role: string;
    status: string;
    skills: Record<string, number>;
    specializations: string[];
    joinedAt: string;
  };
  message: string;
}

export interface CoordinationStatusResponse {
  coordinationId: string;
  status: CoordinationStatus;
  progress: number;
  confidence: number;
  estimatedImprovement: number;
  results: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

export interface Phase3StatusResponse {
  phase: string;
  status: string;
  components: {
    teamManagement: {
      status: string;
      features: string[];
    };
    coordinationEngine: {
      status: string;
      coordinationTypes: CoordinationType[];
      activeCoordinations: number;
    };
    analyticsEngine: {
      status: string;
      features: string[];
    };
  };
  capabilities: Record<string, boolean>;
  timestamp: string;
}