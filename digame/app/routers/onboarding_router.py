from fastapi import APIRouter, Depends, HTTPException
from typing import Dict

from digame.app.models.onboarding_models import UserOnboardingStatus, OnboardingStepUpdate, OnboardingPreferencesUpdate
from digame.app.services.onboarding_service import OnboardingService, get_onboarding_service

# Placeholder for auth - reuse from dashboard_router or a common auth module
async def get_current_user_id() -> str:
    return "user123" # Dummy user ID for now

router = APIRouter(
    prefix="/api/v1/onboarding",
    tags=["onboarding"],
    # dependencies=[Depends(get_current_active_user)] # Add actual auth later
)

@router.get("/status", response_model=UserOnboardingStatus)
async def get_onboarding_status(
    current_user_id: str = Depends(get_current_user_id),
    service: OnboardingService = Depends(get_onboarding_service)
):
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await service.get_user_onboarding_status(user_id=current_user_id)

@router.post("/step", response_model=UserOnboardingStatus)
async def update_onboarding_step_api(
    step_update: OnboardingStepUpdate,
    current_user_id: str = Depends(get_current_user_id),
    service: OnboardingService = Depends(get_onboarding_service)
):
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await service.update_onboarding_step(user_id=current_user_id, step_update=step_update)

@router.post("/preferences", response_model=UserOnboardingStatus)
async def update_onboarding_preferences_api(
    preferences_update: OnboardingPreferencesUpdate,
    current_user_id: str = Depends(get_current_user_id),
    service: OnboardingService = Depends(get_onboarding_service)
):
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await service.update_user_preferences(user_id=current_user_id, preferences_update=preferences_update)