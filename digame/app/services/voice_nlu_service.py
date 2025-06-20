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
                api_key = api_keys_dict.get("nlu_service_provider_key")
            except json.JSONDecodeError:
                logger.error(f"Failed to parse API keys for user {user_id}.")
                raise HTTPException(status_code=500, detail="Error parsing API key settings.")

        if not api_key:
            logger.warning(f"NLU service API key not configured for user {user_id}.")
            raise HTTPException(
                status_code=400,
                detail="NLU service API key not configured. Please set it in your user settings."
            )

        hypothetical_nlu_service_url = "https://api.nlu-provider.com/v1" # Example URL
        endpoint = "interpret"
        payload = {"text": transcribed_text, "language": language}

        try:
            nlu_response = await self.ai_integration_service.make_request(
                api_key=api_key,
                base_url=hypothetical_nlu_service_url,
                endpoint=endpoint,
                method="POST",
                payload=payload
            )
            logger.info(f"Successfully received NLU response for user {user_id}: {nlu_response}")
            return nlu_response
        except Exception as e:
            logger.error(f"Error calling NLU service for user {user_id}: {str(e)}")
            # Re-raise as HTTPException or a more specific custom exception
            if isinstance(e, HTTPException): # If make_request raised an HTTPException
                raise
            raise HTTPException(status_code=503, detail=f"Voice NLU service request failed: {str(e)}")
