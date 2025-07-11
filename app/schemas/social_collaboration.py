"""
Pydantic schemas for Social Collaboration features
"""
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Peer Matching Schemas ---
class PeerMatchBase(BaseModel):
    skills: List[str]
    interests: List[str]
    learning_goals: Optional[List[str]] = []
    mentorship_preferences: Optional[Dict[str, Any]] = {}

class PeerMatchCreate(PeerMatchBase):
    pass

class PeerMatchUpdate(BaseModel):
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    learning_goals: Optional[List[str]] = None
    mentorship_preferences: Optional[Dict[str, Any]] = None

class PeerMatchResponse(PeerMatchBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
class ProjectMatchBase(BaseModel):
    project_type: str
    required_skills: List[str]
    description: str
    collaboration_type: str  # "mentor", "peer", "team"

class ProjectMatchCreate(ProjectMatchBase):
    pass

class ProjectMatchUpdate(BaseModel):
    project_type: Optional[str] = None
    required_skills: Optional[List[str]] = None
    description: Optional[str] = None
    collaboration_type: Optional[str] = None

class ProjectMatchResponse(ProjectMatchBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
class CollaborationRequestBase(BaseModel):
    message: str
    collaboration_type: str

class CollaborationRequestCreate(CollaborationRequestBase):
    target_user_id: int

class CollaborationRequestResponse(CollaborationRequestBase):
    id: int
    requester_id: int
    target_user_id: int
    status: str  # "pending", "accepted", "declined"
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True