"""
Enhanced onboarding router with database persistence and analytics
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Optional, Any
from sqlalchemy.orm import Session

from app.models.onboarding_models import (
    UserOnboardingStatus, 
    OnboardingStepUpdate, 
    OnboardingPreferencesUpdate
)
from app.services.enhanced_onboarding_service import EnhancedOnboardingService
from app.database import get_db
from app.auth.auth_service import get_current_user  # Assuming this exists


router = APIRouter(
    prefix="/api/v1/onboarding",
    tags=["enhanced-onboarding"],
)


@router.get("/status", response_model=UserOnboardingStatus)
async def get_onboarding_status(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user onboarding status with database persistence"""
    service = EnhancedOnboardingService(db)
    return await service.get_user_onboarding_status(current_user.id)


@router.post("/step", response_model=UserOnboardingStatus)
async def update_onboarding_step(
    step_update: OnboardingStepUpdate,
    analytics_data: Optional[Dict[str, Any]] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update onboarding step with analytics tracking"""
    service = EnhancedOnboardingService(db)
    return await service.update_onboarding_step(
        user_id=current_user.id,
        step_update=step_update,
        analytics_data=analytics_data
    )


@router.post("/preferences", response_model=UserOnboardingStatus)
async def update_onboarding_preferences(
    preferences_update: OnboardingPreferencesUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user preferences during onboarding"""
    service = EnhancedOnboardingService(db)
    return await service.update_user_preferences(
        user_id=current_user.id,
        preferences_update=preferences_update
    )


@router.get("/analytics")
async def get_onboarding_analytics(
    period_days: int = Query(30, description="Number of days to analyze"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get onboarding analytics and metrics"""
    service = EnhancedOnboardingService(db)
    return await service.get_onboarding_analytics(
        user_id=current_user.id,
        period_days=period_days
    )


@router.get("/metrics")
async def get_user_completion_metrics(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get completion metrics for current user"""
    service = EnhancedOnboardingService(db)
    return await service.get_user_completion_metrics(current_user.id)


@router.post("/feedback")
async def save_user_feedback(
    rating: int,
    feedback_text: Optional[str] = None,
    step_id: Optional[str] = None,
    ease_of_use: Optional[int] = None,
    clarity: Optional[int] = None,
    usefulness: Optional[int] = None,
    suggested_improvements: Optional[str] = None,
    would_recommend: Optional[bool] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save user feedback for onboarding experience"""
    service = EnhancedOnboardingService(db)
    
    feedback_categories = {
        'ease_of_use': ease_of_use,
        'clarity': clarity,
        'usefulness': usefulness,
        'suggested_improvements': suggested_improvements,
        'would_recommend': would_recommend
    }
    
    return await service.save_user_feedback(
        user_id=current_user.id,
        rating=rating,
        feedback_text=feedback_text,
        step_id=step_id,
        feedback_categories=feedback_categories
    )


@router.get("/dashboard-data")
async def get_dashboard_integration_data(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard data for onboarding integration"""
    service = EnhancedOnboardingService(db)
    return await service.get_dashboard_integration_data(current_user.id)


# Admin endpoints for analytics (require admin role)
@router.get("/admin/analytics")
async def get_platform_analytics(
    period_days: int = Query(30, description="Number of days to analyze"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get platform-wide onboarding analytics (admin only)"""
    # TODO: Add admin role check
    service = EnhancedOnboardingService(db)
    return await service.get_onboarding_analytics(
        user_id=None,  # Platform-wide analytics
        period_days=period_days
    )


@router.post("/admin/calculate-metrics")
async def calculate_onboarding_metrics(
    period_type: str = "daily",
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate and store onboarding metrics (admin only)"""
    # TODO: Add admin role check
    import datetime
    
    service = EnhancedOnboardingService(db)
    
    # Calculate metrics for the last period
    if period_type == "daily":
        period_start = datetime.datetime.utcnow() - datetime.timedelta(days=1)
        period_end = datetime.datetime.utcnow()
    elif period_type == "weekly":
        period_start = datetime.datetime.utcnow() - datetime.timedelta(weeks=1)
        period_end = datetime.datetime.utcnow()
    elif period_type == "monthly":
        period_start = datetime.datetime.utcnow() - datetime.timedelta(days=30)
        period_end = datetime.datetime.utcnow()
    else:
        raise HTTPException(status_code=400, detail="Invalid period_type")
    
    try:
        metrics = await service.calculate_onboarding_metrics(
            period_start=period_start,
            period_end=period_end,
            period_type=period_type
        )
        return {"message": "Metrics calculated successfully", "metrics_id": metrics.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate metrics: {str(e)}")


# Simplified endpoints that work with current auth system
@router.get("/simple/status")
async def get_simple_onboarding_status(
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Get user onboarding status (simplified for testing)"""
    service = EnhancedOnboardingService(db)
    try:
        return await service.get_user_onboarding_status(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get onboarding status: {str(e)}")


@router.post("/simple/step")
async def update_simple_onboarding_step(
    user_id: int,
    step_update: OnboardingStepUpdate,
    db: Session = Depends(get_db)
):
    """Update onboarding step (simplified for testing)"""
    service = EnhancedOnboardingService(db)
    try:
        return await service.update_onboarding_step(
            user_id=user_id,
            step_update=step_update
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update onboarding step: {str(e)}")


@router.get("/simple/dashboard-data")
async def get_simple_dashboard_data(
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Get dashboard integration data (simplified for testing)"""
    service = EnhancedOnboardingService(db)
    try:
        return await service.get_dashboard_integration_data(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {str(e)}")