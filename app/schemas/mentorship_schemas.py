"""
Mentorship Program Platform Schemas
Pydantic models for mentorship system API requests and responses
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum


class MentorshipProgramType(str, Enum):
    """Types of mentorship programs available"""
    CAREER_DEVELOPMENT = "career_development"
    SKILL_BUILDING = "skill_building"
    LEADERSHIP = "leadership"
    TECHNICAL_EXPERTISE = "technical_expertise"
    ENTREPRENEURSHIP = "entrepreneurship"
    INDUSTRY_TRANSITION = "industry_transition"


class MentorshipProgramCreate(BaseModel):
    """Schema for creating a new mentorship program"""
    name: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=1000)
    program_type: str
    max_participants: int = Field(default=20, ge=1, le=100)
    duration_weeks: Optional[int] = Field(default=12, ge=4, le=52)


class MentorshipProgramResponse(BaseModel):
    """Schema for mentorship program response"""
    id: str
    name: str
    description: str
    program_type: str
    duration_weeks: int
    meeting_frequency: str
    milestones: List[Dict[str, Any]]
    recommended_activities: List[str]
    max_participants: int
    created_at: datetime

    model_config = {"from_attributes": True}


class MentorApplicationCreate(BaseModel):
    """Schema for mentor application"""
    program_types: List[str] = Field(..., min_items=1)
    experience_description: str = Field(..., min_length=50, max_length=2000)
    availability: Optional[Dict[str, Any]] = None
    preferred_mentee_level: Optional[str] = None
    mentoring_philosophy: Optional[str] = None


class MentorApplicationResponse(BaseModel):
    """Schema for mentor application response"""
    application_id: str
    user_id: int
    program_types: List[str]
    experience_description: str
    qualification_score: int
    status: str  # pending_review, approved, rejected
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MentorshipMatchResponse(BaseModel):
    """Schema for mentor-mentee match response"""
    mentor_id: int
    mentor_name: str
    mentor_bio: str
    match_score: int
    match_reasons: List[str]
    mentor_skills: List[str]
    mentor_experience: str
    available_programs: List[str]


class MentorshipProgressUpdate(BaseModel):
    """Schema for updating mentorship progress"""
    milestone_completed: Optional[str] = None
    progress_percentage: int = Field(..., ge=0, le=100)
    notes: Optional[str] = None
    next_meeting_date: Optional[datetime] = None
    goals_status: Optional[str] = None  # on_track, behind, ahead, completed


class MentorshipAnalytics(BaseModel):
    """Schema for mentorship analytics response"""
    total_connections: int
    active_connections: int
    completed_connections: int
    success_rate: float
    average_duration_days: float
    program_type_distribution: Dict[str, int]
    monthly_new_connections: List[Dict[str, Any]]
    satisfaction_score: float
    generated_at: datetime


class MentorQualificationCreate(BaseModel):
    """Schema for mentor qualification assessment"""
    user_id: int
    program_types: List[str]
    experience_years: Optional[int] = None
    certifications: Optional[List[str]] = None
    previous_mentoring_experience: Optional[str] = None


class MentorQualificationResponse(BaseModel):
    """Schema for mentor qualification response"""
    user_id: int
    qualification_score: int
    is_qualified: bool
    recommendations: List[str]
    strengths: List[str]
    evaluated_at: datetime

    model_config = {"from_attributes": True}


class MentorshipConnectionCreate(BaseModel):
    """Schema for creating mentorship connection"""
    mentor_id: int
    mentee_id: int
    program_type: str
    goals: Optional[str] = None
    duration_months: Optional[int] = Field(default=3, ge=1, le=12)
    meeting_frequency: Optional[str] = "bi-weekly"


class MentorshipConnectionResponse(BaseModel):
    """Schema for mentorship connection response"""
    id: int
    mentor_id: int
    mentee_id: int
    focus_areas: List[str]
    goals: Optional[str] = None
    duration_months: Optional[int] = None
    meeting_frequency: Optional[str] = None
    status: str
    started_at: datetime
    ended_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MentorshipSessionCreate(BaseModel):
    """Schema for creating mentorship session"""
    connection_id: int
    session_date: datetime
    duration_minutes: int = Field(..., ge=15, le=180)
    topics_discussed: List[str]
    action_items: Optional[List[str]] = None
    mentor_notes: Optional[str] = None
    mentee_notes: Optional[str] = None


class MentorshipSessionResponse(BaseModel):
    """Schema for mentorship session response"""
    id: int
    connection_id: int
    session_date: datetime
    duration_minutes: int
    topics_discussed: List[str]
    action_items: Optional[List[str]] = None
    mentor_notes: Optional[str] = None
    mentee_notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MentorshipFeedbackCreate(BaseModel):
    """Schema for mentorship feedback"""
    connection_id: int
    rating: int = Field(..., ge=1, le=5)
    feedback_text: Optional[str] = None
    areas_of_improvement: Optional[List[str]] = None
    would_recommend: bool = True


class MentorshipFeedbackResponse(BaseModel):
    """Schema for mentorship feedback response"""
    id: int
    connection_id: int
    rating: int
    feedback_text: Optional[str] = None
    areas_of_improvement: Optional[List[str]] = None
    would_recommend: bool
    submitted_at: datetime

    class Config:
        from_attributes = True