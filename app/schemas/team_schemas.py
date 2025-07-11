from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# Enum for Team Roles, mirroring the one in models
class TeamRoleEnumSchema(str, Enum):
    MEMBER = "member"
    LEADER = "leader"
    COORDINATOR = "coordinator"
    ADMIN = "admin"

# Base Schemas
class TeamMemberBase(BaseModel):
    user_id: int
    role: TeamRoleEnumSchema = Field(default=TeamRoleEnumSchema.MEMBER)
    custom_attributes: Optional[Dict[str, Any]] = None

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberUpdate(BaseModel):
    role: Optional[TeamRoleEnumSchema] = None
    custom_attributes: Optional[Dict[str, Any]] = None

class TeamMember(TeamMemberBase):
    id: int
    team_id: int
    joined_at: datetime

    model_config = {"from_attributes": True}

class TeamBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class TeamCreate(TeamBase):
    created_by_user_id: Optional[int] = None # Can be set by the system or based on logged-in user
    initial_members: Optional[List[TeamMemberCreate]] = None

class TeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class Team(TeamBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by_user_id: Optional[int] = None
    members: List[TeamMember] = []
    # We can add performance_metrics, skill_gaps, workflows later if needed for full team object responses

    model_config = {"from_attributes": True}
class TeamPerformanceMetricBase(BaseModel):
    metric_name: str = Field(..., max_length=100)
    metric_value: Dict[str, Any] # Flexible JSON value
    notes: Optional[str] = Field(None, max_length=1000)

class TeamPerformanceMetricCreate(TeamPerformanceMetricBase):
    team_id: int

class TeamPerformanceMetricUpdate(BaseModel):
    metric_name: Optional[str] = Field(None, max_length=100)
    metric_value: Optional[Dict[str, Any]] = None
    notes: Optional[str] = Field(None, max_length=1000)

class TeamPerformanceMetric(TeamPerformanceMetricBase):
    id: int
    team_id: int
    recorded_at: datetime

    model_config = {"from_attributes": True}
class TeamSkillGapBase(BaseModel):
    skill_name: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[int] = Field(0, ge=0, le=2) # 0-low, 1-medium, 2-high
    suggested_development_plan: Optional[str] = Field(None, max_length=2000)

class TeamSkillGapCreate(TeamSkillGapBase):
    team_id: int

class TeamSkillGapUpdate(BaseModel):
    skill_name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[int] = Field(None, ge=0, le=2)
    suggested_development_plan: Optional[str] = Field(None, max_length=2000)

class TeamSkillGap(TeamSkillGapBase):
    id: int
    team_id: int
    identified_at: datetime

    model_config = {"from_attributes": True}
class TeamWorkflowBase(BaseModel):
    workflow_name: str = Field(..., max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    steps: Optional[List[Dict[str, Any]]] = None # List of steps, each step is a dict
    is_optimized: Optional[bool] = False # Changed from int to bool for clarity
    optimization_suggestions: Optional[List[Dict[str, Any]]] = None

class TeamWorkflowCreate(TeamWorkflowBase):
    team_id: int

class TeamWorkflowUpdate(BaseModel):
    workflow_name: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    steps: Optional[List[Dict[str, Any]]] = None
    is_optimized: Optional[bool] = None
    optimization_suggestions: Optional[List[Dict[str, Any]]] = None

class TeamWorkflow(TeamWorkflowBase):
    id: int
    team_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
class TeamCollaborationPattern(BaseModel):
    pattern_name: str
    description: str
    metrics: Dict[str, Any] # E.g., communication frequency, task overlap

class TeamAnalyticsDashboard(BaseModel):
    team_id: int
    overall_performance_score: Optional[float] = None
    key_metrics: List[TeamPerformanceMetric] = []
    collaboration_patterns: List[TeamCollaborationPattern] = []
    identified_skill_gaps: List[TeamSkillGap] = []
    workflow_optimizations_summary: List[TeamWorkflow] = [] # or a summary version
    team_development_progress: Optional[Dict[str, Any]] = None # E.g. progress on skill development plans

# For adding/removing members specifically
class TeamMemberAction(BaseModel):
    user_id: int
    role: Optional[TeamRoleEnumSchema] = TeamRoleEnumSchema.MEMBER # Role for adding

# Response for team with detailed members for specific endpoints
class TeamWithMembers(Team):
    members: List[TeamMember] = []

class TeamWithFullDetails(Team):
    members: List[TeamMember] = []
    performance_metrics: List[TeamPerformanceMetric] = []
    skill_gaps: List[TeamSkillGap] = []
    workflows: List[TeamWorkflow] = []
