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
                api_key = api_keys_dict.get("openai_api_key") # Standardized key name
            except json.JSONDecodeError:
                logger.error(f"Failed to parse API keys JSON for user {user_id}")
                raise HTTPException(status_code=500, detail="Error parsing API key configuration.")

        if not api_key:
            logger.warning(f"Notification AI API key not configured for user_id: {user_id}")
            raise HTTPException(
                status_code=400,
                detail="OpenAI API key ('openai_api_key') not configured by user for Notification AI."
            )

        openai_api_base_url = "https://api.openai.com/v1"
        openai_endpoint = "chat/completions"

        system_prompt = """You are an AI assistant that helps optimize user notifications.
Given a user's behavior summary and current notifications, decide if a new notification is warranted,
suggest optimal timing, or rephrase an existing notification for better engagement.
Respond in JSON format. The top-level JSON should be an object with a key "suggestions",
which is a list of suggestion objects. Each suggestion object should have:
'action' (string, e.g., 'CREATE_NEW', 'ADJUST_EXISTING', 'DO_NOTHING'),
'user_id' (integer, the user_id this suggestion is for),
'title' (string, optional, for new or adjusted notifications),
'message' (string, optional, for new or adjusted notifications),
'type' (string, e.g., 'ai_optimized_suggestion', 'engagement_prompt'),
'reasoning' (string, explaining why this suggestion is made).
If 'action' is 'ADJUST_EXISTING', also include 'original_notification_id' (integer).
If no specific optimization is clear or no action is needed, provide a suggestion with action 'DO_NOTHING'.
Base your suggestions on the provided user_behavior_summary.
Example user_behavior_summary: {"last_active_at": "2023-10-26T10:00:00Z", "preferred_contact_hours": ["09:00-12:00", "14:00-17:00"], "completed_tasks_today": 2, "pending_high_priority_tasks": 1, "recent_app_usage_minutes": 15}
"""
        user_prompt_content = f"User ID: {user_id}. User behavior summary: {json.dumps(user_behavior_summary or {})}"

        ai_payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt_content}
            ],
            "response_format": {"type": "json_object"}
        }

        logger.debug(f"Calling OpenAI notification optimization for user {user_id} at {openai_api_base_url}/{openai_endpoint}")

        try:
            openai_response_data = await self.ai_integration_service.make_request(
                api_key=api_key,
                base_url=openai_api_base_url,
                endpoint=openai_endpoint,
                method="POST",
                payload=ai_payload,
            )

            if not openai_response_data.get("choices") or not openai_response_data["choices"][0].get("message") or not openai_response_data["choices"][0]["message"].get("content"):
                logger.error(f"Unexpected OpenAI response structure for user {user_id}: {openai_response_data}")
                raise HTTPException(status_code=500, detail="Notification AI service received an unexpected response format from AI provider.")

            content_str = openai_response_data["choices"][0]["message"]["content"]
            ai_suggestions_response = json.loads(content_str)

            logger.info(f"Successfully received and parsed AI notification suggestions for user {user_id}: {ai_suggestions_response}")

            processed_suggestions = []
            if ai_suggestions_response and "suggestions" in ai_suggestions_response:
                for suggestion in ai_suggestions_response["suggestions"]:
                    action = suggestion.get("action")
                    # Potentially create notifications in DB based on action 'CREATE_NEW'
                    if action == "CREATE_NEW" and suggestion.get("title") and suggestion.get("message"):
                        try:
                            created_notification = notification_crud.create_notification(
                                db=self.db,
                                notification=NotificationCreate(
                                    user_id=user_id, # Ensure suggestion.get("user_id") matches or use the one from context
                                    title=suggestion["title"],
                                    message=suggestion["message"],
                                    type=suggestion.get("type", "ai_optimized"),
                                    # status="pending" # Assuming a status field exists
                                )
                            )
                            processed_suggestions.append({
                                "created_notification_id": created_notification.id,
                                "details": suggestion
                            })
                        except Exception as e_crud:
                            logger.error(f"Failed to create notification from AI suggestion for user {user_id}: {e_crud}. Suggestion: {suggestion}")
                            processed_suggestions.append({"error_creating_notification": str(e_crud), "suggestion": suggestion})
                    else:
                        # For 'ADJUST_EXISTING' or 'DO_NOTHING', just pass along the suggestion for now
                        processed_suggestions.append({"action_taken": action, "details": suggestion})

            return {"success": True, "processed_suggestions": processed_suggestions, "raw_ai_response": ai_suggestions_response}

        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from OpenAI response content for user {user_id}: {content_str}")
            raise HTTPException(status_code=500, detail="Notification AI service failed to parse AI provider's response.")
        except HTTPException: # Re-raise HTTPExceptions
            raise
        except Exception as e:
            logger.error(f"Exception during AI notification optimization for user {user_id}: {e}")
            raise HTTPException(status_code=503, detail=f"Failed to optimize notifications via AI: {str(e)}")
