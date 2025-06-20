import json
import logging
from typing import Optional, Dict, Any

from sqlalchemy.orm import Session
from fastapi import HTTPException

from .ai_integration_service import AIIntegrationService
from ..crud import user_setting_crud, notification_crud
from ..models.user_setting import UserSetting
from ..schemas.notification_schemas import NotificationCreate, Notification

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.ai_integration_service = AIIntegrationService(db=db)

    async def optimize_user_notifications_with_ai(
        self,
        user_id: int,
        user_behavior_summary: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Optimizes user notification settings using an AI service.
        """
        logger.info(f"Attempting to optimize notifications for user_id: {user_id}")

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=user_id)
        api_key = None
        if user_settings and user_settings.api_keys:
            try:
                api_keys_dict = json.loads(user_settings.api_keys)
                api_key = api_keys_dict.get("notification_ai_provider_key")
            except json.JSONDecodeError:
                logger.error(f"Failed to parse API keys JSON for user {user_id}")
                raise HTTPException(status_code=500, detail="Error parsing API key configuration.")

        if not api_key:
            logger.warning(f"Notification AI API key not configured for user_id: {user_id}")
            raise HTTPException(
                status_code=400,
                detail="Notification AI API key ('notification_ai_provider_key') not configured by user."
            )

        hypothetical_ai_service_url = "https://api.ai-notifications.com/v1"
        endpoint = "optimize"

        payload = {
            "user_id": str(user_id),
            "user_behavior_summary": user_behavior_summary or {}
        }

        logger.debug(f"Calling AI notification optimization for user {user_id} at {hypothetical_ai_service_url}/{endpoint}")

        try:
            ai_response = await self.ai_integration_service.make_request(
                api_key=api_key,
                base_url=hypothetical_ai_service_url,
                endpoint=endpoint,
                method="POST",
                payload=payload,
                # auth_scheme can be specified if not Bearer, e.g., "ApiKey My-Custom-Header-Name"
                # For this example, assuming Bearer is fine or handled by make_request default
            )
            logger.info(f"Successfully received AI response for user {user_id}: {ai_response}")

            # For now, we are not creating/updating notifications in the DB.
            # This logic would be added here in a real implementation.
            # Example:
            # if ai_response.get("suggestions"):
            #     for suggestion in ai_response["suggestions"]:
            #         notification_crud.create_notification(
            #             db=self.db,
            #             notification=NotificationCreate(
            #                 user_id=user_id,
            #                 title=suggestion.get("title", "AI Optimized Alert"),
            #                 message=suggestion.get("message", "Consider this update."),
            #                 type="ai_optimized"
            #             )
            #         )

            return {"success": True, "ai_response": ai_response}

        except ValueError as ve: # Handles missing API key from make_request itself
            logger.error(f"ValueError during AI request for user {user_id}: {ve}")
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            logger.error(f"Exception during AI notification optimization for user {user_id}: {e}")
            # Check if the exception from make_request already includes status details
            if "AI service request failed with status" in str(e) or "AI service rate limited" in str(e):
                 # Attempt to parse out a status code if possible, otherwise default
                status_code = 503 # Service Unavailable as a default for upstream errors
                try:
                    if "status" in str(e): # Very basic parsing
                        parts = str(e).split("status ")
                        if len(parts) > 1:
                             status_code = int(parts[1].split(".")[0]) # e.g. "status 429. Details: ..."
                except:
                    pass # Keep default status_code
                raise HTTPException(status_code=status_code, detail=f"AI service error: {e}")

            raise HTTPException(status_code=503, detail=f"Failed to optimize notifications via AI: {e}")
