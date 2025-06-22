import json
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..services.ai_integration_service import AIIntegrationService
from ..crud import user_setting_crud
from ..models.user_setting import UserSetting

logger = logging.getLogger(__name__)

class VoiceNLUService:
    def __init__(self, db: Session):
        self.db = db
        self.ai_integration_service = AIIntegrationService(db=self.db)

    async def interpret_voice_command(
        self, user_id: int, transcribed_text: str, language: str = "en-US"
    ) -> Dict[str, Any]:
        logger.debug(f"User {user_id} attempting to interpret text: '{transcribed_text}'")

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=user_id)
        api_key = None
        if user_settings and user_settings.api_keys:
            try:
                api_keys_dict = json.loads(user_settings.api_keys)
                api_key = api_keys_dict.get("openai_api_key") # Standardized key name
            except json.JSONDecodeError:
                logger.error(f"Failed to parse API keys for user {user_id}.")
                raise HTTPException(status_code=500, detail="Error parsing API key settings.")

        if not api_key:
            logger.warning(f"NLU service API key not configured for user {user_id}.")
            raise HTTPException(
                status_code=400,
                detail="OpenAI API key ('openai_api_key') not configured for NLU service. Please set it in your user settings."
            )

        openai_api_base_url = "https://api.openai.com/v1"
        openai_endpoint = "chat/completions"

        system_prompt = """You are an NLU assistant. Extract intent and entities from the user's command.
Respond in JSON format with 'intent' (string) and 'entities' (object) fields.
Example intents: 'CREATE_TASK', 'GET_WEATHER', 'SEND_MESSAGE', 'PLAY_MUSIC', 'UNKNOWN'.
Example entities: {'task_name': 'buy groceries', 'location': 'London', 'recipient': 'Alice', 'artist_name': 'Beatles'}.
If the intent is unclear or not supported, respond with intent 'UNKNOWN' and empty entities.
Supported intents:
- CREATE_TASK: User wants to create a task. Entities: {'task_name': 'description of task', 'due_date': 'optional due date in YYYY-MM-DD', 'priority': 'optional priority high/medium/low'}
- GET_PROFILE_INFO: User wants to retrieve some profile information. Entities: {'info_type': 'e.g., email, username, full_name'}
- SET_REMINDER: User wants to set a reminder. Entities: {'reminder_text': 'text for reminder', 'reminder_time': 'time for reminder e.g., tomorrow 10am'}
"""

        nlu_payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": transcribed_text}
            ],
            "response_format": {"type": "json_object"}
        }

        try:
            openai_response_data = await self.ai_integration_service.make_request(
                api_key=api_key,
                base_url=openai_api_base_url,
                endpoint=openai_endpoint,
                method="POST",
                payload=nlu_payload
            )

            if not openai_response_data.get("choices") or not openai_response_data["choices"][0].get("message") or not openai_response_data["choices"][0]["message"].get("content"):
                logger.error(f"Unexpected OpenAI response structure for user {user_id}: {openai_response_data}")
                raise HTTPException(status_code=500, detail="NLU service received an unexpected response format from AI provider.")

            content_str = openai_response_data["choices"][0]["message"]["content"]
            nlu_result = json.loads(content_str)

            logger.info(f"Successfully received and parsed NLU result for user {user_id}: {nlu_result}")
            return nlu_result

        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from OpenAI response content for user {user_id}: {content_str}")
            raise HTTPException(status_code=500, detail="NLU service failed to parse AI provider's response.")
        except HTTPException: # Re-raise HTTPExceptions directly (e.g. from ai_integration_service or earlier checks)
            raise
        except Exception as e:
            logger.error(f"Error calling OpenAI NLU service for user {user_id}: {str(e)}")
            raise HTTPException(status_code=503, detail=f"Voice NLU service request to AI provider failed: {str(e)}")
