"""
Pydantic schemas for job search related data.
"""

from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime

class JobSearchQuery(BaseModel):
    """
    Schema for job search query parameters.
    """
    query: str
    location: Optional[str] = None
    limit: int = 25
    # Add other common search parameters like radius, job_type, experience_level etc. as needed.
    # Example:
    # radius_miles: Optional[int] = None
    # job_type: Optional[str] = None # e.g., "fulltime", "contract", "internship"
    # experience_level: Optional[str] = None # e.g., "entry_level", "mid_level", "senior_level"

class JobSchema(BaseModel):
    """
    Schema representing a job posting.
    """
    id: str # Provider specific job ID
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None # Or 'summary' / 'snippet'
    url: HttpUrl
    posted_date: Optional[datetime] = None
    source: str # e.g., "Indeed", "LinkedIn", "Glassdoor"
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = None
    salary_period: Optional[str] = None # e.g., "hourly", "yearly"
    # Add other relevant fields as needed
    # Example:
    # company_logo_url: Optional[HttpUrl] = None
    # skills: Optional[List[str]] = None
    # employment_type: Optional[str] = None # e.g., "Full-time", "Part-time"

    model_config = {"from_attributes": True}

class JobSearchResponse(BaseModel):
    """
    Schema for the response of a job search.
    """
    query: JobSearchQuery
    results: List[JobSchema]
    total_results: Optional[int] = None # If available from the API
    page: Optional[int] = None # If pagination is supported
    provider: str # The name of the job board provider
