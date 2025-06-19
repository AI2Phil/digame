import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from typing import Dict, Any, Optional

from digame.app.crud import user_setting_crud
from digame.app.models.user import User as UserModel
from digame.app.db import get_db # For the dependency injector

# Placeholder for an external Language Learning API client
class MockExternalLanguageClient:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("API key must be provided for the external language service.")
        self.api_key = api_key

    def translate(self, text: str, target_language: str, source_language: Optional[str] = None) -> Dict[str, Any]:
        if not text or not target_language:
            return {"error": "Text and target language are required for translation."}

        # Mock translation
        translation = f"Mock translated '{text}' to {target_language.upper()}"
        if source_language:
            translation += f" from {source_language.upper()}"

        if self.api_key == "invalid_lang_key":
            raise ValueError("Invalid API key for external language service.")

        return {
            "original_text": text,
            "translated_text": translation,
            "target_language": target_language,
            "source_language": source_language or "auto-detected (mock)",
            "provider": "MockExternalLanguageProvider"
        }

    def define_word(self, word: str, language: str) -> Dict[str, Any]:
        if not word or not language:
            return {"error": "Word and language are required for definition."}

        # Mock definition
        definition = f"Mock definition for '{word}' in {language.upper()}: A sequence of sounds or letters that expresses a meaning."
        example = f"Example: Use '{word}' in a sentence."

        if self.api_key == "invalid_lang_key":
            raise ValueError("Invalid API key for external language service.")

        return {
            "word": word,
            "language": language,
            "definition": definition,
            "example": example,
            "provider": "MockExternalLanguageProvider"
        }

class LanguageLearningService:
    def __init__(self, db: Session):
        self.db = db

    def _check_feature_enabled_and_get_api_key(self, current_user: UserModel, required_key_name: str) -> str:
        if not hasattr(current_user, 'tenants') or not current_user.tenants:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not associated with any tenant.")

        user_tenant_link = current_user.tenants[0]
        if not hasattr(user_tenant_link, 'tenant'):
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Tenant linkage error for user.")

        tenant = user_tenant_link.tenant

        if not tenant: # Should be redundant
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant information not found for user.")

        try:
            tenant_features = tenant.features if isinstance(tenant.features, dict) else json.loads(tenant.features or '{}')
        except json.JSONDecodeError:
            # Log error: Tenant features JSON is corrupted for tenant.id
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error reading tenant configuration.")

        if not tenant_features.get("language_learning_support"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Language Learning Support feature is not enabled for your tenant."
            )

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=current_user.id)
        if not user_settings or not user_settings.api_keys:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"API key '{required_key_name}' not found in your settings for Language Learning."
            )

        try:
            api_keys_dict = json.loads(user_settings.api_keys)
        except json.JSONDecodeError:
            # Log error: User API keys JSON is corrupted for user_settings.id
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error parsing your API key settings."
            )

        service_api_key = api_keys_dict.get(required_key_name)
        if not service_api_key:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"The '{required_key_name}' is missing from your API key settings for Language Learning."
            )
        return service_api_key

    def translate_text(self, current_user: UserModel, text: str, target_language: str, source_language: Optional[str] = None) -> Dict[str, Any]:
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        api_key = self._check_feature_enabled_and_get_api_key(current_user, "language_learning_api_key")

        try:
            external_client = MockExternalLanguageClient(api_key=api_key)
            translation_result = external_client.translate(text, target_language, source_language)

            if translation_result.get("error"): # Check for errors from the mock client's response
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error from Language Learning service: {translation_result['error']}"
                )
            return translation_result
        except ValueError as e:
            # Log the specific error e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error with Language Learning service: {str(e)}"
            )
        except Exception as e:
            # Log the exception e (e.g., logger.error(f"Unexpected external service error: {e}"))
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"External Language Learning service failed: {str(e)}. Please try again later."
            )

    def get_vocabulary_definition(self, current_user: UserModel, word: str, language: str) -> Dict[str, Any]:
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        api_key = self._check_feature_enabled_and_get_api_key(current_user, "language_learning_api_key")

        try:
            external_client = MockExternalLanguageClient(api_key=api_key)
            definition_result = external_client.define_word(word, language)

            if definition_result.get("error"): # Check for errors from the mock client's response
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error from Language Learning service: {definition_result['error']}"
                )
            return definition_result
        except ValueError as e:
            # Log the specific error e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error with Language Learning service: {str(e)}"
            )
        except Exception as e:
            # Log the exception e
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"External Language Learning service failed: {str(e)}. Please try again later."
            )

# Dependency injector function
def get_language_learning_service(db: Session = Depends(get_db)) -> LanguageLearningService:
    """
    Factory function for FastAPI dependency injection.
    Provides an instance of LanguageLearningService with a DB session.
    """
    return LanguageLearningService(db)
