"""
Pydantic schemas for UserProfile and related responses
"""
from pydantic import BaseModel, EmailStr, HttpUrl # Added EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# Forward reference for User schema if defined in user_schemas.py
# This helps avoid circular imports if User schema itself references UserProfileResponse later
# from ..schemas.user_schemas import User as UserSchema # Example, adjust path as needed

# Temporarily define a minimal UserBaseSchema for UserWithProfileResponse
# In a real setup, this would be imported from user_schemas.py
class MinimalUserBase(BaseModel):
    id: int
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfileBase(BaseModel):
    skills: Optional[List[Dict[str, str]]] = None # e.g., [{"skill": "Python", "proficiency": "Advanced"}]
    learning_goals: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    mentorship_preferences: Optional[Dict[str, Any]] = None # e.g., {"willing_to_mentor": True, "topics": ["API"]}
    bio: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[HttpUrl] = None
    github_url: Optional[HttpUrl] = None

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# New schema combining User and UserProfile information
class UserWithProfileResponse(MinimalUserBase): # Inherits from MinimalUserBase defined above
    profile: Optional[UserProfileResponse] = None

    # If you want to flatten profile fields into the main response:
    # skills: Optional[List[Dict[str, str]]] = Field(None, alias="profile.skills") # Example if flattening
    # This requires Pydantic v2 and careful aliasing, or manual construction in the router.
    # For now, a nested 'profile' object is simpler.

    class Config:
        from_attributes = True
```
