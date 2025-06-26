from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class JobBase(BaseModel):
    """Base schema for job data."""
    job_type: str
    status: str = "pending"
    progress: float = 0.0
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class JobCreate(JobBase):
    """Schema for creating a new job."""
    pass


class JobUpdate(BaseModel):
    """Schema for updating a job."""
    status: Optional[str] = None
    progress: Optional[float] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class Job(JobBase):
    """Schema for job response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class JobResponse(BaseModel):
    """Schema for job response with additional metadata."""
    job: Job
    message: str = "Job created successfully"