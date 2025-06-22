import json # Added for validator
from typing import List, Optional
from pydantic import BaseModel, field_validator # Added field_validator
from datetime import datetime

class ProjectBase(BaseModel):
    title: str  # Keep title from HEAD
    name: Optional[str] = None  # Add name from WIP for compatibility
    description: str
    url: Optional[str] = None
    technologiesUsed: List[str] = []  # Keep from HEAD
    required_skills: List[str] = []  # Add from WIP for matching functionality

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    name: Optional[str] = None  # Add name support
    description: Optional[str] = None
    url: Optional[str] = None
    technologiesUsed: Optional[List[str]] = None
    required_skills: Optional[List[str]] = None  # Add required_skills support

class ProjectInDBBase(ProjectBase):
    id: int
    user_id: int  # Keep user_id from HEAD
    owner_id: Optional[int] = None  # Add owner_id from WIP for compatibility
    created_at: Optional[datetime] = None  # Add created_at from WIP

    class Config:
        from_attributes = True  # Use Pydantic v2 syntax

class Project(ProjectInDBBase):
    pass

class ProjectSchema(ProjectInDBBase):
    @field_validator('technologiesUsed', mode='before')
    @classmethod
    def parse_technologies(cls, value):
        if isinstance(value, str):
            if not value: # Handle empty string case
                return []
            try:
                parsed_value = json.loads(value)
                if not isinstance(parsed_value, list):
                    # Consider logging or raising error
                    return []
                return parsed_value
            except json.JSONDecodeError:
                # Consider logging or raising error
                return []
        return value

# Project matching schemas from WIP
class ProjectMatch(BaseModel):
    project: Project
    matching_skills: List[str]
    missing_skills: List[str]

class ProjectMatchResponse(BaseModel):
    matches: List[ProjectMatch]
    total: int
