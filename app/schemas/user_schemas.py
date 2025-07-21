import json # Added for validator
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional
from datetime import datetime

from .project_schemas import ProjectSchema, ProjectCreate
from .experience_schemas import ExperienceSchema, ExperienceCreate
from .education_schemas import EducationSchema, EducationCreate

# Schema for contact information
class ContactInfoSchema(BaseModel):
    linkedin: Optional[str] = None
    website: Optional[str] = None
    professionalEmail: Optional[EmailStr] = None

# Base User schema (shared properties)
class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True
    # New profile fields
    detailed_bio: Optional[str] = None
    contact_info: Optional[ContactInfoSchema] = None
    skills: Optional[List[str]] = Field(default_factory=list)

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    # New profile fields for update
    detailed_bio: Optional[str] = None
    contact_info: Optional[ContactInfoSchema] = None # Assuming contact_info can be updated as a whole object
    skills: Optional[List[str]] = None
    # For creating/updating nested profile items
    projects: Optional[List[ProjectCreate]] = None
    experience: Optional[List[ExperienceCreate]] = None # field name 'experience' to match common update patterns
    education: Optional[List[EducationCreate]] = None # field name 'education' to match common update patterns


# Additional properties to return via API
class UserResponse(UserBase): # UserBase already includes detailed_bio, contact_info, skills
    id: int
    created_at: datetime
    updated_at: datetime
    kudos_count: Optional[int] = 0
    onboarding_completed: bool = False
    
    # Platform Owner fields
    is_platform_owner: bool = False
    platform_owner_level: Optional[int] = 0
    
    # Subscription fields
    subscription_tier: str = "free"
    subscription_status: str = "active"
    subscription_expires: Optional[datetime] = None
    is_founding_member: bool = False
    founding_member_enrolled_at: Optional[datetime] = None
    founding_member_discount_percent: Optional[int] = None
    founding_member_monthly_price: Optional[float] = None
    subscription_updated_at: Optional[datetime] = None
    
    # Security fields
    last_login: Optional[datetime] = None
    failed_login_attempts: int = 0
    account_locked_until: Optional[datetime] = None
    password_changed_at: Optional[datetime] = None
    
    # Email verification
    email_verified: bool = False
    email_verification_sent_at: Optional[datetime] = None
    
    # Account upgrade tracking
    upgraded_from_guest: bool = False
    upgrade_date: Optional[datetime] = None
    
    # Guest user support
    is_guest: bool = False
    guest_expires_at: Optional[datetime] = None
    
    # Tenant support
    tenant_id: Optional[int] = None

    # Relationships
    projects: List[ProjectSchema] = Field(default_factory=list)
    experience_entries: List[ExperienceSchema] = Field(default_factory=list) # Matches model relationship name
    education_entries: List[EducationSchema] = Field(default_factory=list) # Matches model relationship name

    model_config = {"from_attributes": True}

    @field_validator('contact_info', mode='before')
    @classmethod
    def parse_contact_info(cls, value):
        if isinstance(value, str):
            if not value: # Handle empty string case
                return None
            try:
                # Ensure the loaded dict is then passed to ContactInfoSchema constructor
                loaded_value = json.loads(value)
                return ContactInfoSchema(**loaded_value) if loaded_value else None
            except json.JSONDecodeError:
                # Consider logging this error
                return None # Or raise ValueError("Invalid JSON string for contact_info")
        # If it's already a dict, Pydantic will try to coerce it to ContactInfoSchema.
        # If it's already ContactInfoSchema, it will pass.
        return value

    @field_validator('skills', mode='before')
    @classmethod
    def parse_skills(cls, value):
        if isinstance(value, str):
            if not value: # Handle empty string case for skills
                return []
            try:
                parsed_value = json.loads(value)
                if not isinstance(parsed_value, list):
                    # Consider logging this error or raising ValueError
                    return []
                return parsed_value
            except json.JSONDecodeError:
                # Consider logging this error
                return [] # Or raise ValueError("Invalid JSON string for skills")
        return value

# User with roles information
class UserWithRoles(UserResponse):
    roles: List[str] = []

    model_config = {"from_attributes": True}