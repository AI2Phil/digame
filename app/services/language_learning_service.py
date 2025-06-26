import json
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from typing import Dict, Any, Optional

from ..crud import user_crud, user_setting_crud, tenant_crud
from ..models.user import User as UserModel
from ..db import get_db
from .ai_integration_service import AIIntegrationService

logger = logging.getLogger(__name__)

class LanguageLearningService:
    def __init__(self, db: Session, ai_integration_service: AIIntegrationService):
        self.db = db
        self.ai_integration_service = ai_integration_service

    async def _check_feature_and_get_key(self, current_user: UserModel) -> str:
        """
        Helper to check tenant feature enablement and retrieve OpenAI API key.
        Now common for both translate and define methods.
        """
        user_from_db = user_crud.get_user(self.db, user_id=current_user.id)
        if not user_from_db:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        # Use the fresh user object for subsequent checks

        tenant_id = getattr(user_from_db, 'tenant_id', None)
        if not tenant_id and hasattr(user_from_db, 'tenants') and user_from_db.tenants:
             user_tenant_link = user_from_db.tenants[0]
             tenant_id = getattr(user_tenant_link, 'tenant_id', None)

        if not tenant_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not associated with any tenant or tenant ID missing.")

        tenant = tenant_crud.get_tenant_by_id(self.db, tenant_id)
        if not tenant:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant information not found for user.")

        tenant_features = tenant.features
        if isinstance(tenant_features, str):
            try:
                tenant_features = json.loads(tenant_features or '{}')
            except json.JSONDecodeError:
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error parsing tenant features.")
        elif not isinstance(tenant_features, dict):
            tenant_features = {}

        if not tenant_features.get("language_learning_support"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Language Learning Support feature is not enabled for your tenant."
            )

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=user_from_db.id)
        if not user_settings or not user_settings.api_keys:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="API key for Language Learning not found. Please add 'openai_api_key' to your settings."
            )

        try:
            api_keys_dict = json.loads(user_settings.api_keys)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error parsing your API key settings."
            )

        openai_api_key = api_keys_dict.get("openai_api_key")
        if not openai_api_key:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="The 'openai_api_key' for Language Learning is missing from your API key settings. Please add it."
            )
        return openai_api_key

    async def translate_text(self, current_user: UserModel, text: str, target_language: str, source_language: Optional[str] = None) -> Dict[str, Any]:
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        openai_api_key = await self._check_feature_and_get_key(current_user)

        if not text.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text to translate cannot be empty.")
        if not target_language.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Target language cannot be empty.")

        source_lang_instruction = f"from {source_language}" if source_language else "from auto-detected language"
        system_prompt = f"""
You are an AI assistant that translates text.
Translate the user's text to {target_language} {source_lang_instruction}.
Respond in JSON format with the following keys: "original_text", "translated_text", "target_language", "detected_source_language" (the language code, e.g., "en", "es", or "unknown" if not confident).
Example:
User text: "Hello, how are you?" (assuming target is Spanish)
AI Response: {{
  "original_text": "Hello, how are you?",
  "translated_text": "Hola, ¿cómo estás?",
  "target_language": "Spanish",
  "detected_source_language": "en"
}}
"""
        ai_payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            "response_format": {"type": "json_object"}
        }

        try:
            logger.info(f"Requesting text translation for user {current_user.id} to {target_language}")
            openai_response_data = await self.ai_integration_service.make_request(
                api_key=openai_api_key,
                base_url="https://api.openai.com/v1",
                endpoint="chat/completions",
                method="POST",
                payload=ai_payload
            )

            if not openai_response_data.get("choices") or \
               not openai_response_data["choices"][0].get("message") or \
               not openai_response_data["choices"][0]["message"].get("content"):
                logger.error(f"Unexpected OpenAI response for translation (user {current_user.id}): {openai_response_data}")
                raise HTTPException(status_code=500, detail="AI provider returned an unexpected response format for translation.")

            content_str = openai_response_data["choices"][0]["message"]["content"]
            translation_result = json.loads(content_str)

            required_keys = ["original_text", "translated_text", "target_language", "detected_source_language"]
            if not all(key in translation_result for key in required_keys):
                 logger.error(f"OpenAI response JSON missing required keys for translation (user {current_user.id}): {translation_result}")
                 raise HTTPException(status_code=500, detail="AI provider's response missing required translation fields.")

            logger.info(f"Successfully received translation for user {current_user.id}")
            translation_result["model_provider"] = "openai"
            # Ensure the output matches the original mock structure's source_language field if needed
            translation_result["source_language"] = translation_result.pop("detected_source_language", source_language or "auto-detected")
            return translation_result

        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from OpenAI for translation (user {current_user.id}): {content_str if 'content_str' in locals() else 'N/A'}")
            raise HTTPException(status_code=500, detail="Failed to parse AI provider's response for translation.")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during translation for user {current_user.id}: {str(e)}")
            raise HTTPException(status_code=503, detail=f"Translation request to AI provider failed: {str(e)}")

    async def get_vocabulary_definition(self, current_user: UserModel, word: str, language: str) -> Dict[str, Any]:
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        openai_api_key = await self._check_feature_and_get_key(current_user)

        if not word.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Word to define cannot be empty.")
        if not language.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Language for definition cannot be empty.")

        system_prompt = f"""
You are an AI assistant that provides vocabulary definitions.
Provide a concise definition and a simple example sentence for the word "{word}" in {language}.
Respond in JSON format with the following keys: "word", "language", "definition", and "example_sentence".
Example for word "happy" in English:
AI Response: {{
  "word": "happy",
  "language": "English",
  "definition": "Feeling or showing pleasure or contentment.",
  "example_sentence": "She was very happy with her birthday gift."
}}
"""
        ai_payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt}
                # User message is implicitly the word and language in the system prompt
            ],
            "response_format": {"type": "json_object"}
        }

        try:
            logger.info(f"Requesting definition for '{word}' in {language} for user {current_user.id}")
            openai_response_data = await self.ai_integration_service.make_request(
                api_key=openai_api_key,
                base_url="https://api.openai.com/v1",
                endpoint="chat/completions",
                method="POST",
                payload=ai_payload
            )

            if not openai_response_data.get("choices") or \
               not openai_response_data["choices"][0].get("message") or \
               not openai_response_data["choices"][0]["message"].get("content"):
                logger.error(f"Unexpected OpenAI response for definition (user {current_user.id}): {openai_response_data}")
                raise HTTPException(status_code=500, detail="AI provider returned an unexpected response format for definition.")

            content_str = openai_response_data["choices"][0]["message"]["content"]
            definition_result = json.loads(content_str)

            required_keys = ["word", "language", "definition", "example_sentence"]
            if not all(key in definition_result for key in required_keys):
                 logger.error(f"OpenAI response JSON missing required keys for definition (user {current_user.id}): {definition_result}")
                 raise HTTPException(status_code=500, detail="AI provider's response missing required definition fields.")

            logger.info(f"Successfully received definition for user {current_user.id}")
            definition_result["model_provider"] = "openai"
            # Match original mock field name if necessary
            definition_result["example"] = definition_result.pop("example_sentence")
            return definition_result

        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from OpenAI for definition (user {current_user.id}): {content_str if 'content_str' in locals() else 'N/A'}")
            raise HTTPException(status_code=500, detail="Failed to parse AI provider's response for definition.")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during definition lookup for user {current_user.id}: {str(e)}")
            raise HTTPException(status_code=503, detail=f"Definition request to AI provider failed: {str(e)}")

# Dependency injector function
def get_language_learning_service(
    db: Session = Depends(get_db)
) -> LanguageLearningService:
    ai_integration_service = AIIntegrationService(db=db)
    return LanguageLearningService(db=db, ai_integration_service=ai_integration_service)
