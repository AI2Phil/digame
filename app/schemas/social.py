"""
Social Networking Pydantic Schemas
Data validation and serialization schemas for social features.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class EngagementLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ActivityType(str, Enum):
    CONNECTION = "connection"
    MENTORSHIP = "mentorship"
    LEARNING = "learning"
    ACHIEVEMENT = "achievement"


class ConnectionStatus(str, Enum):
    PENDING = "pending"
    CONNECTED = "connected"
    DECLINED = "declined"
    BLOCKED = "blocked"


# Base Schemas
class SocialMetricsBase(BaseModel):
    total_connections: int = Field(default=0, description="Total number of connections")
    active_mentorships: int = Field(default=0, description="Number of active mentorship relationships")
    learning_partnerships: int = Field(default=0, description="Number of learning partnerships")
    knowledge_shared: int = Field(default=0, description="Number of knowledge sharing sessions")
    collaboration_score: int = Field(default=0, description="Collaboration score out of 100")
    network_growth_rate: float = Field(description="Network growth rate percentage")
    engagement_level: EngagementLevel = Field(description="User engagement level")


class SocialMetricsResponse(SocialMetricsBase):
    last_calculated: datetime = Field(description="When metrics were last calculated")

    model_config = {"from_attributes": True}


class RecentActivityBase(BaseModel):
    type: ActivityType = Field(description="Type of activity")
    title: str = Field(max_length=255, description="Activity title")
    description: str = Field(max_length=500, description="Activity description")
    timestamp: datetime = Field(description="When the activity occurred")


class RecentActivityResponse(RecentActivityBase):
    id: str = Field(description="Activity ID")
    user_name: Optional[str] = Field(None, description="Name of related user")
    user_avatar: Optional[str] = Field(None, description="Avatar URL of related user")

    model_config = {"from_attributes": True}


class PeerSuggestionBase(BaseModel):
    name: str = Field(max_length=255, description="Peer's name")
    title: str = Field(max_length=255, description="Peer's job title")
    company: str = Field(max_length=255, description="Peer's company")
    compatibility_score: float = Field(default=0.0, description="Compatibility score")
    shared_skills: List[str] = Field(default=[], description="Skills in common")


class PeerSuggestionResponse(PeerSuggestionBase):
    id: str = Field(description="Suggestion ID")
    user_id: str = Field(description="Peer's user ID")
    avatar: Optional[str] = Field(None, description="Peer's avatar URL")

    model_config = {"from_attributes": True}


class UserConnectionBase(BaseModel):
    connection_type: str = Field(default="professional", description="Type of connection")
    status: ConnectionStatus = Field(description="Connection status")


class UserConnectionCreate(UserConnectionBase):
    connected_user_id: int = Field(description="ID of user to connect with")


class UserConnectionResponse(UserConnectionBase):
    id: int = Field(description="Connection ID")
    user_id: int = Field(description="ID of user who initiated connection")
    connected_user_id: int = Field(description="ID of connected user")
    initiated_by: int = Field(description="ID of user who initiated connection")
    connected_at: Optional[datetime] = Field(None, description="When connection was established")
    created_at: datetime = Field(description="When connection request was created")

    model_config = {"from_attributes": True}


class PeerMatchBase(BaseModel):
    compatibility_score: float = Field(default=0.0, description="Compatibility score")
    match_factors: Optional[Dict[str, Any]] = Field(None, description="Factors that contributed to the match")
    status: str = Field(default="suggested", description="Match status")


class PeerMatchResponse(PeerMatchBase):
    id: int = Field(description="Match ID")
    user_id: int = Field(description="User ID")
    matched_user_id: int = Field(description="Matched user ID")
    viewed_at: Optional[datetime] = Field(None, description="When match was viewed")
    responded_at: Optional[datetime] = Field(None, description="When user responded to match")
    created_at: datetime = Field(description="When match was created")

    model_config = {"from_attributes": True}


class UserSkillBase(BaseModel):
    skill_name: str = Field(max_length=100, description="Name of the skill")
    proficiency_level: str = Field(description="Proficiency level (beginner, intermediate, advanced, expert)")
    years_experience: Optional[int] = Field(default=None, description="Years of experience with this skill")
    is_seeking_mentorship: bool = Field(default=False, description="Whether seeking mentorship in this skill")
    is_offering_mentorship: bool = Field(default=False, description="Whether offering mentorship in this skill")


class UserSkillCreate(UserSkillBase):
    pass


class UserSkillUpdate(BaseModel):
    proficiency_level: Optional[str] = None
    years_experience: Optional[int] = Field(default=None)
    is_seeking_mentorship: Optional[bool] = None
    is_offering_mentorship: Optional[bool] = None


class UserSkillResponse(UserSkillBase):
    id: int = Field(description="Skill ID")
    user_id: int = Field(description="User ID")
    created_at: datetime = Field(description="When skill was added")
    updated_at: datetime = Field(description="When skill was last updated")

    model_config = {"from_attributes": True}
class SocialDashboardResponse(BaseModel):
    metrics: SocialMetricsResponse = Field(description="User's social metrics")
    recent_activity: List[RecentActivityResponse] = Field(description="Recent social activities")
    peer_suggestions: List[PeerSuggestionResponse] = Field(description="Suggested peer connections")

    model_config = {"from_attributes": True}
class ConnectToPeerRequest(BaseModel):
    user_id: int = Field(description="ID of user to connect with")
    connection_type: str = Field(default="professional", description="Type of connection")
    message: Optional[str] = Field(None, max_length=500, description="Optional connection message")


class RespondToPeerMatchRequest(BaseModel):
    match_id: int = Field(description="ID of peer match")
    response: str = Field(description="Response to match (accept, decline, maybe)")
    message: Optional[str] = Field(None, max_length=500, description="Optional response message")


# Analytics Schemas
class NetworkAnalytics(BaseModel):
    total_connections: int = Field(description="Total connections")
    connections_this_month: int = Field(description="New connections this month")
    connection_growth_rate: float = Field(description="Monthly growth rate percentage")
    top_connection_sources: List[Dict[str, Any]] = Field(description="Top sources of connections")
    engagement_trends: List[Dict[str, Any]] = Field(description="Engagement trends over time")

    model_config = {"from_attributes": True}


class CollaborationInsights(BaseModel):
    collaboration_score: int = Field(default=0, description="Overall collaboration score")
    active_collaborations: int = Field(description="Number of active collaborations")
    knowledge_sharing_sessions: int = Field(description="Knowledge sharing sessions completed")
    mentorship_impact: Dict[str, Any] = Field(description="Impact of mentorship activities")
    skill_development_progress: List[Dict[str, Any]] = Field(description="Progress in skill development")

    class Config:
        from_attributes = True