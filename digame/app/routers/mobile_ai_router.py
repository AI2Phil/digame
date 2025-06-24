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
    VoiceCommandResponse,  # Added
    AIModelListResponse, # Added
    AIModelMetadataResponse # Added (though not directly returned, used by AIModelListResponse)
)
from ..services.mobile_ai_service import MobileAIService
from ..models.user import User as UserModel
from fastapi.responses import FileResponse # Added for file downloads
from pathlib import Path # Added

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
            return NotificationPrefsResponse()
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
        response = NotificationTriggersResponse()
        response.triggers = triggers
        return response
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

# --- AI Model Management Routes ---

@router.get("/models", response_model=AIModelListResponse)
async def list_ai_models_for_download(
    current_user: UserModel = Depends(get_current_active_user), # Ensure authenticated access
    service: MobileAIService = Depends(get_mobile_ai_service)
):
    """
    Provides a list of AI models available for download to the mobile client.
    """
    try:
        models_response = await service.list_available_ai_models()
        return models_response
    except HTTPException:
        raise # Re-raise HTTPExceptions from the service layer
    except Exception as e:
        # Log the exception e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while listing AI models: {str(e)}"
        )

@router.get("/models/download/{file_name}")
async def download_ai_model_file(
    file_name: str = Path(..., description="The name of the model file to download, e.g., voice_rec_en_v1.0.0.model"),
    current_user: UserModel = Depends(get_current_active_user), # Ensure authenticated access
    service: MobileAIService = Depends(get_mobile_ai_service)
):
    """
    Allows authenticated users to download a specific AI model file.
    The `file_name` should correspond to one of the files listed by the `/models` endpoint.
    """
    try:
        # Basic validation to prevent path traversal, though service layer should be robust
        if ".." in file_name or "/" in file_name or "\\" in file_name:
            raise HTTPException(status_code=400, detail="Invalid file name.")

        response = await service.get_ai_model_file(file_name)
        return response
    except HTTPException:
        raise # Re-raise HTTPExceptions from the service layer (e.g., 404 Not Found)
    except Exception as e:
        # Log the exception e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while attempting to download the model: {str(e)}"
        )
