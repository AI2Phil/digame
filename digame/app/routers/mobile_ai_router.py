from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas.mobile_ai_schemas import (
    UserNotificationPrefsRequest,
    NotificationPrefsResponse,
    NotificationTrigger,
    NotificationTriggersResponse,
    VoiceCommandRequest,  # Added
    VoiceCommandResponse  # Added
)
from ..services.mobile_ai_service import MobileAIService
from ..models.user import User as UserModel

async def get_current_active_user(db: Session = Depends(get_db)) -> UserModel:
    user = db.query(UserModel).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user

router = APIRouter(
    prefix="/api/v1/mobile/ai",
    tags=["Mobile AI Features"] # Broadened tag
)

def get_mobile_ai_service(db: Session = Depends(get_db)) -> MobileAIService:
    return MobileAIService(db=db)

@router.post("/notifications/settings", response_model=NotificationPrefsResponse)
async def configure_ai_notification_settings(
    prefs_request: UserNotificationPrefsRequest,
    current_user: UserModel = Depends(get_current_active_user),
    service: MobileAIService = Depends(get_mobile_ai_service)
):
    try:
        success = await service.save_user_notification_preferences(
            user_id=current_user.id,
            prefs=prefs_request
        )
        if success:
            return NotificationPrefsResponse(message="Notification preferences saved successfully.")
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save notification preferences."
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/notifications/triggers", response_model=NotificationTriggersResponse)
async def fetch_ai_notification_triggers(
    current_user: UserModel = Depends(get_current_active_user),
    service: MobileAIService = Depends(get_mobile_ai_service)
):
    try:
        triggers = await service.get_ai_notification_triggers(user_id=current_user.id)
        return NotificationTriggersResponse(triggers=triggers)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching notification triggers: {str(e)}"
        )

@router.post("/voice/interpret", response_model=VoiceCommandResponse)
async def interpret_voice_command_endpoint(
    command_request: VoiceCommandRequest,
    current_user: UserModel = Depends(get_current_active_user),
    service: MobileAIService = Depends(get_mobile_ai_service)
):
    """
    Receives transcribed voice text from the mobile app, interprets it using simulated NLU,
    and returns a structured intent and parameters.
    """
    try:
        response = await service.interpret_voice_command(
            user_id=current_user.id,
            command_request=command_request
        )
        return response
    except Exception as e:
        # Log the exception e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during voice command interpretation: {str(e)}"
        )

```
