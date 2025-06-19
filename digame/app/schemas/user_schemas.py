from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Base User schema (shared properties)
class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True
    # New fields from User model
    skills: Optional[List[str]] = None
    learning_goals: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    current_projects: Optional[List[str]] = None  # Assuming list of strings for now
    is_seeking_mentor: Optional[bool] = None
    is_offering_mentorship: Optional[bool] = None

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
    # New fields from User model, also optional for update
    skills: Optional[List[str]] = None
    learning_goals: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    current_projects: Optional[List[str]] = None
    is_seeking_mentor: Optional[bool] = None
    is_offering_mentorship: Optional[bool] = None

# Additional properties to return via API
class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# User with roles information
class UserWithRoles(User):
    roles: List[str] = []

    class Config:
        orm_mode = True