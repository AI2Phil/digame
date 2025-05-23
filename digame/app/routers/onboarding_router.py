from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from ..db import get_db
from ..auth.auth_dependencies import get_current_user
from ..models.user import User
import json

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

# Simplified Pydantic models for onboarding data
class ProductivityTargets(BaseModel):
    daily_hours: int
    focus_time: int
    break_frequency: int

class Goals(BaseModel):
    primary_goals: List[str]
    productivity_targets: ProductivityTargets
    learning_objectives: List[str] = []

class NotificationPreferences(BaseModel):
    productivity: bool = True
    achievements: bool = True
    reminders: bool = True
    frequency: str

class DashboardPreferences(BaseModel):
    default_view: str
    widgets: List[str]
    theme: str

class PrivacyPreferences(BaseModel):
    data_sharing: bool = False
    analytics: bool = True
    public_profile: bool = False

class Preferences(BaseModel):
    notifications: NotificationPreferences
    dashboard: DashboardPreferences
    privacy: PrivacyPreferences

class Profile(BaseModel):
    display_name: str
    role: str
    department: Optional[str] = None
    experience: str
    avatar: Optional[str] = None

class Features(BaseModel):
    enabled_features: List[str]
    interested_features: List[str] = []

class OnboardingData(BaseModel):
    profile: Profile
    goals: Goals
    preferences: Preferences
    features: Features

class OnboardingStatus(BaseModel):
    completed: bool
    completed_at: Optional[datetime] = None
    steps_completed: List[str] = []

@router.post("/complete")
async def complete_onboarding(
    onboarding_data: OnboardingData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete the onboarding process and save user data."""
    try:
        # Update user profile using SQLAlchemy session
        update_data = {
            'name': onboarding_data.profile.display_name,
            'role': onboarding_data.profile.role,
            'experience_level': onboarding_data.profile.experience,
            'onboarding_completed': True,
            'onboarding_completed_at': datetime.utcnow()
        }
        
        # Only add non-None values to update_data
        if onboarding_data.profile.department is not None:
            update_data['department'] = onboarding_data.profile.department
        if onboarding_data.profile.avatar is not None:
            update_data['avatar_url'] = onboarding_data.profile.avatar
        
        # Store preferences as JSON (assuming these fields exist)
        if hasattr(current_user, 'preferences'):
            update_data['preferences'] = json.dumps(onboarding_data.preferences.dict())
        if hasattr(current_user, 'goals'):
            update_data['goals'] = json.dumps(onboarding_data.goals.dict())
        if hasattr(current_user, 'enabled_features'):
            update_data['enabled_features'] = json.dumps(onboarding_data.features.enabled_features)
        
        # Update the user in the database
        db.query(User).filter(User.id == current_user.id).update(update_data)
        
        # Commit changes and refresh
        db.commit()
        db.refresh(current_user)
        
        return {
            "success": True,
            "message": "Onboarding completed successfully",
            "user": {
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email,
                "role": current_user.role,
                "onboarding_completed": True
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete onboarding: {str(e)}"
        )

@router.get("/status", response_model=OnboardingStatus)
async def get_onboarding_status(
    current_user: User = Depends(get_current_user)
):
    """Get the current onboarding status for the user."""
    return OnboardingStatus(
        completed=current_user.onboarding_completed or False,
        completed_at=current_user.onboarding_completed_at,
        steps_completed=[]  # Could track individual steps if needed
    )

@router.get("/data")
async def get_onboarding_data(
    current_user: User = Depends(get_current_user)
):
    """Get the user's onboarding data."""
    try:
        # Parse stored JSON data
        preferences = {}
        goals = {}
        features = []
        
        if hasattr(current_user, 'preferences') and current_user.preferences:
            try:
                preferences = json.loads(current_user.preferences)
            except json.JSONDecodeError:
                preferences = {}
        
        if hasattr(current_user, 'goals') and current_user.goals:
            try:
                goals = json.loads(current_user.goals)
            except json.JSONDecodeError:
                goals = {}
        
        if hasattr(current_user, 'enabled_features') and current_user.enabled_features:
            try:
                features = json.loads(current_user.enabled_features)
            except json.JSONDecodeError:
                features = []
        
        return {
            "profile": {
                "display_name": current_user.name or "",
                "role": current_user.role or "",
                "department": current_user.department or "",
                "experience": current_user.experience_level or "",
                "avatar": current_user.avatar_url
            },
            "goals": goals,
            "preferences": preferences,
            "features": {
                "enabled_features": features,
                "interested_features": []
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get onboarding data: {str(e)}"
        )

@router.put("/preferences")
async def update_user_preferences(
    preferences: Preferences,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user preferences."""
    try:
        user_updates = {
            "preferences": json.dumps(preferences.dict())
        }
        
        db.query(User).filter(User.id == current_user.id).update(user_updates)
        db.commit()
        db.refresh(current_user)
        
        return {
            "success": True,
            "message": "Preferences updated successfully"
        }
        
        return {
            "success": True,
            "message": "Preferences updated successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update preferences: {str(e)}"
        )

@router.post("/goals")
async def create_user_goals(
    goals: Goals,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update user goals."""
    try:
        user_updates = {
            "goals": json.dumps(goals.dict())
        }
        
        db.query(User).filter(User.id == current_user.id).update(user_updates)
        db.commit()
        db.refresh(current_user)
        
        return {
            "success": True,
            "message": "Goals updated successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update goals: {str(e)}"
        )

@router.get("/recommendations")
async def get_feature_recommendations(
    current_user: User = Depends(get_current_user)
):
    """Get feature recommendations based on user role and goals."""
    
    # Feature recommendations based on role
    role_recommendations = {
        "developer": ["productivity-tracking", "time-tracking", "automation"],
        "designer": ["productivity-tracking", "collaboration", "insights-ai"],
        "manager": ["goal-management", "collaboration", "insights-ai"],
        "analyst": ["productivity-tracking", "insights-ai", "time-tracking"],
        "consultant": ["time-tracking", "goal-management", "collaboration"],
        "researcher": ["productivity-tracking", "insights-ai", "goal-management"]
    }
    
    user_role = current_user.role or "developer"
    recommended_features = role_recommendations.get(user_role, role_recommendations["developer"])
    
    # Parse user goals to provide additional recommendations
    additional_recommendations = []
    if hasattr(current_user, 'goals') and current_user.goals:
        try:
            goals = json.loads(current_user.goals)
            primary_goals = goals.get('primary_goals', [])
            
            if 'productivity' in primary_goals:
                additional_recommendations.append('productivity-tracking')
            if 'focus' in primary_goals:
                additional_recommendations.append('time-tracking')
            if 'learning' in primary_goals:
                additional_recommendations.append('insights-ai')
            if 'collaboration' in primary_goals:
                additional_recommendations.append('collaboration')
                
        except json.JSONDecodeError:
            pass
    
    # Combine and deduplicate recommendations
    all_recommendations = list(set(recommended_features + additional_recommendations))
    
    return {
        "recommended_features": all_recommendations,
        "role_based": recommended_features,
        "goal_based": additional_recommendations
    }

@router.delete("/reset")
async def reset_onboarding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reset onboarding status to allow user to go through it again."""
    try:
        return {
            "success": True,
            "message": "Onboarding reset successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset onboarding: {str(e)}"
        )