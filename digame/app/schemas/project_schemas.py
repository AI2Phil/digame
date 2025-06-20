from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    required_skills: List[str] = []

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class ProjectMatch(BaseModel):
    project: Project
    matching_skills: List[str]
    missing_skills: List[str]

class ProjectMatchResponse(BaseModel):
    matches: List[ProjectMatch]
    total: int
