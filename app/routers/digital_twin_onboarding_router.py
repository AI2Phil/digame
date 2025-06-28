"""
Digital Twin Onboarding Router
Phase 2: Guided Twin Setup and Skills Assessment API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from ..database import get_db
from ..services.digital_twin_onboarding_service import DigitalTwinOnboardingService, get_digital_twin_onboarding_service
from ..auth.auth_dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/onboarding/digital-twin", tags=["digital-twin-onboarding"])


# Pydantic schemas for onboarding
class StepDataRequest(BaseModel):
    step_number: int
    data: Dict[str, Any]


class ProfileSetupData(BaseModel):
    professional_title: Optional[str] = None
    industry: Optional[str] = None
    experience_level: Optional[str] = None


class SkillsAssessmentData(BaseModel):
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    skill_confidence_scores: Dict[str, int] = {}


class PersonalityProfileData(BaseModel):
    personality_type: Optional[str] = None
    communication_style: Optional[str] = None
    work_style_preferences: Dict[str, str] = {}


class WorkStyleData(BaseModel):
    collaboration_preference: Optional[str] = None
    meeting_preferences: Optional[str] = None


class GoalsSetupData(BaseModel):
    short_term_goals: List[str] = []
    long_term_goals: List[str] = []
    learning_interests: List[str] = []
    career_aspirations: Optional[str] = None


@router.get("/status", response_model=Dict[str, Any])
async def get_onboarding_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    onboarding_service = DigitalTwinOnboardingService(db)
    """
    Get current onboarding status for the authenticated user
    
    Returns:
    - Current step and progress
    - Completion percentage
    - Step information and estimated time
    """
    try:
        status_data = onboarding_service.get_onboarding_status(current_user.id)
        
        return {
            "success": True,
            "message": "Onboarding status retrieved",
            "data": status_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve onboarding status"
        )


@router.get("/step/{step_number}", response_model=Dict[str, Any])
async def get_step_data(
    step_number: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    onboarding_service = DigitalTwinOnboardingService(db)
    """
    Get data and options for a specific onboarding step
    
    Features:
    - Step-specific form fields and options
    - Current user data for the step
    - Validation rules and requirements
    """
    try:
        if step_number < 1 or step_number > 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Step number must be between 1 and 6"
            )
        
        step_data = onboarding_service.get_step_data(current_user.id, step_number)
        
        return {
            "success": True,
            "message": f"Step {step_number} data retrieved",
            "data": step_data
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve step data"
        )


@router.post("/step/{step_number}", response_model=Dict[str, Any])
async def save_step_data(
    step_number: int,
    step_data: StepDataRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    onboarding_service = DigitalTwinOnboardingService(db)
    """
    Save data for a specific onboarding step
    
    Features:
    - Validates and saves step data
    - Updates progress tracking
    - Calculates completion percentage
    - Advances to next step
    """
    try:
        if step_number != step_data.step_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Step number mismatch"
            )
        
        if step_number < 1 or step_number > 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Step number must be between 1 and 6"
            )
        
        result = onboarding_service.save_step_data(
            current_user.id,
            step_number,
            step_data.data
        )
        
        return {
            "success": True,
            "message": f"Step {step_number} completed successfully",
            "data": result
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save step data"
        )


@router.post("/step/1/profile", response_model=Dict[str, Any])
async def save_profile_setup(
    profile_data: ProfileSetupData,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    onboarding_service = DigitalTwinOnboardingService(db)
    """Save profile setup data (Step 1)"""
    try:
        data = profile_data.dict(exclude_none=True)
        result = onboarding_service.save_step_data(current_user.id, 1, data)
        
        return {
            "success": True,
            "message": "Profile setup completed",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save profile setup"
        )


@router.post("/step/2/skills", response_model=Dict[str, Any])
async def save_skills_assessment(
    skills_data: SkillsAssessmentData,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    onboarding_service = DigitalTwinOnboardingService(db)
    """Save skills assessment data (Step 2)"""
    try:
        data = skills_data.dict()
        result = onboarding_service.save_step_data(current_user.id, 2, data)
        
        return {
            "success": True,
            "message": "Skills assessment completed",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save skills assessment"
        )


@router.post("/step/3/personality", response_model=Dict[str, Any])
async def save_personality_profile(
    personality_data: PersonalityProfileData,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    onboarding_service = DigitalTwinOnboardingService(db)
    """Save personality profile data (Step 3)"""
    try:
        data = personality_data.dict(exclude_none=True)
        result = onboarding_service.save_step_data(current_user.id, 3, data)
        
        return {
            "success": True,
            "message": "Personality profile completed",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save personality profile"
        )


@router.post("/step/4/workstyle", response_model=Dict[str, Any])
async def save_work_style(
    workstyle_data: WorkStyleData,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    onboarding_service = DigitalTwinOnboardingService(db)
    """Save work style data (Step 4)"""
    try:
        data = workstyle_data.dict(exclude_none=True)
        result = onboarding_service.save_step_data(current_user.id, 4, data)
        
        return {
            "success": True,
            "message": "Work style completed",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save work style"
        )


@router.post("/step/5/goals", response_model=Dict[str, Any])
async def save_goals_setup(
    goals_data: GoalsSetupData,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    onboarding_service = DigitalTwinOnboardingService(db)
    """Save goals setup data (Step 5)"""
    try:
        data = goals_data.dict()
        result = onboarding_service.save_step_data(current_user.id, 5, data)
        
        return {
            "success": True,
            "message": "Goals setup completed",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save goals setup"
        )


@router.post("/generate-summary", response_model=Dict[str, Any])
async def generate_twin_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    onboarding_service = DigitalTwinOnboardingService(db)
    """
    Generate AI summary of the digital twin profile (Step 6)
    
    Features:
    - Creates personalized twin summary
    - Calculates accuracy scores
    - Provides improvement recommendations
    """
    try:
        summary_data = onboarding_service.generate_twin_summary(current_user.id)
        
        # Mark step 6 as completed
        onboarding_service.save_step_data(current_user.id, 6, {
            "ai_generated_summary": summary_data["summary"]
        })
        
        return {
            "success": True,
            "message": "Digital twin summary generated",
            "data": summary_data
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate twin summary"
        )


@router.get("/options", response_model=Dict[str, Any])
async def get_onboarding_options():
    """
    Get all available options for onboarding steps
    
    Returns:
    - Industry options
    - Experience levels
    - Skill categories
    - Personality types
    - Work style options
    """
    from ..database import get_db
    db = next(get_db())
    service = DigitalTwinOnboardingService(db)
    
    return {
        "success": True,
        "message": "Onboarding options retrieved",
        "data": {
            "industries": service.industries,
            "experience_levels": service.experience_levels,
            "skill_categories": service.skill_categories,
            "personality_types": service.personality_types,
            "steps": service.onboarding_steps
        }
    }


# Health check endpoint
@router.get("/health", response_model=Dict[str, Any])
async def onboarding_health_check():
    """Health check for digital twin onboarding system"""
    return {
        "success": True,
        "message": "Digital twin onboarding system is healthy",
        "features": {
            "guided_setup": True,
            "skills_assessment": True,
            "personality_profiling": True,
            "work_style_analysis": True,
            "goals_tracking": True,
            "ai_summary_generation": True,
            "progress_tracking": True,
            "completion_scoring": True
        }
    }