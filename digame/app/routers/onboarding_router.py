from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
import logging

from ..auth.auth_dependencies import get_current_active_user
from ..db import get_db
from ..schemas import onboarding_schemas # Import new onboarding schemas
from ..crud import onboarding_crud # Import new onboarding CRUD
from ..models.user import User

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/onboarding",
    tags=["Onboarding"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=onboarding_schemas.OnboardingDataResponse, status_code=status.HTTP_200_OK)
async def save_onboarding_data(
    onboarding_data_update: onboarding_schemas.OnboardingDataUpdate, # Use new schema for request body
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> onboarding_schemas.OnboardingDataResponse:
    """
    Save or update user onboarding data using structured Pydantic models.
    """
    try:
        user_id = getattr(current_user, 'id')
        updated_onboarding_data = onboarding_crud.update_onboarding_data(
            db=db, user_id=user_id, data_update=onboarding_data_update
        )
        if not updated_onboarding_data: # Should be handled by CRUD if user not found, but as a safeguard
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found, cannot update onboarding data.")
        return updated_onboarding_data
    except ValueError as ve: # Catch specific error from CRUD if user not found
        logger.error(f"Error saving onboarding data for user {current_user.id}: {str(ve)}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        logger.error(f"Error saving onboarding data for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save onboarding data"
        )

@router.get("/", response_model=onboarding_schemas.OnboardingDataResponse, status_code=status.HTTP_200_OK)
async def get_onboarding_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> onboarding_schemas.OnboardingDataResponse:
    """
    Get user onboarding status and data using structured Pydantic models.
    """
    try:
        user_id = getattr(current_user, 'id')
        onboarding_data_response = onboarding_crud.get_onboarding_data(db=db, user_id=user_id)
        if not onboarding_data_response:
            # This case should ideally be handled by get_onboarding_data returning a default structure
            # or raising an error if user is not found, which it should not if current_user is valid.
            # If get_onboarding_data returns None only if user itself not found by user_crud.get_user
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found, cannot retrieve onboarding data.")
        return onboarding_data_response
    except Exception as e:
        logger.error(f"Error getting onboarding status for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get onboarding status"
        )

# Health check endpoint
@router.get("/health", status_code=status.HTTP_200_OK)
async def onboarding_health_check() -> Dict[str, str]:
    """
    Onboarding service health check
    """
    return {"status": "healthy", "service": "onboarding"}