from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Base Project schema (shared properties)
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, example="New Community Platform")
    description: Optional[str] = None
    required_skills: Optional[List[str]] = Field(None, example=["python", "fastapi", "react"])

# Properties to receive via API on creation
class ProjectCreate(ProjectBase):
    # owner_id will likely be set based on the authenticated user creating the project,
    # or explicitly if an admin is creating it for someone else.
    # For now, not making it mandatory here, can be handled in router.
    owner_id: Optional[int] = None

# Properties to receive via API on update
class ProjectUpdate(ProjectBase):
    name: Optional[str] = None # Allow partial updates
    # owner_id could also be updatable, e.g., to transfer ownership
    owner_id: Optional[int] = None

# Additional properties to return via API
class Project(ProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None # Matches the added field in the model
    owner_id: Optional[int] = None

    # If we wanted to return full owner info, we'd need a User schema here:
    # from .user_schemas import User # Or a minimal UserInProject schema
    # owner: Optional[User] = None

    class Config:
        orm_mode = True

# Example of how you might want to list projects (e.g. with pagination)
class ProjectListResponse(BaseModel):
    projects: List[Project]
    total: int
