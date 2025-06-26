import json
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends

from ..crud import user_crud, user_setting_crud, tenant_crud
from ..models.user import User as UserModel
from ..db import get_db
from .ai_integration_service import AIIntegrationService

logger = logging.getLogger(__name__)

class CommunicationStyleService:
    def __init__(self, db: Session, ai_integration_service: AIIntegrationService):
        self.db = db
        self.ai_integration_service = ai_integration_service

    async def get_communication_style_analysis(self, current_user: UserModel, text_input: str) -> dict:
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        user_from_db = user_crud.get_user(self.db, user_id=current_user.id)
        if not user_from_db:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        current_user = user_from_db

        tenant_id = getattr(current_user, 'tenant_id', None)
        if not tenant_id and hasattr(current_user, 'tenants') and current_user.tenants:
             user_tenant_link = current_user.tenants[0]
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

        if not tenant_features.get("communication_style_analysis"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Communication Style Analysis feature is not enabled for your tenant."
            )

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=current_user.id)
        if not user_settings or not user_settings.api_keys:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="API key for Communication Style Analysis not found. Please add 'openai_api_key' to your settings."
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
                detail="The 'openai_api_key' for Communication Style Analysis is missing from your API key settings. Please add it."
            )

        if not text_input.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Input text cannot be empty.")

        system_prompt = """
You are an AI assistant that analyzes communication style.
Analyze the provided text and identify its primary communication style (e.g., Assertive, Passive, Aggressive, Passive-Aggressive, Analytical, Diplomatic, Friendly, Formal, Informal).
Provide a brief explanation for your analysis.
Respond in JSON format with the following keys: "identified_style", "confidence_score" (0.0 to 1.0), and "explanation".
Example:
User text: "We need to get this done by Friday, no excuses."
AI Response: {"identified_style": "Assertive", "confidence_score": 0.85, "explanation": "The language is direct, states needs clearly, and sets a firm deadline."}
User text: "Maybe we could try to finish it sometime next week, if that's okay?"
AI Response: {"identified_style": "Passive", "confidence_score": 0.90, "explanation": "The language is hesitant, uses softening words, and avoids direct demands."}
"""
        ai_payload = {
            "model": "gpt-3.5-turbo", # Or a newer/more suitable model
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text_input}
            ],
            "response_format": {"type": "json_object"}
        }

        try:
            logger.info(f"Requesting communication style analysis for user {current_user.id}")
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
                logger.error(f"Unexpected OpenAI response structure for comm style (user {current_user.id}): {openai_response_data}")
                raise HTTPException(status_code=500, detail="AI provider returned an unexpected response format.")

            content_str = openai_response_data["choices"][0]["message"]["content"]
            analysis_result = json.loads(content_str)

            # Validate expected keys in the parsed JSON
            required_keys = ["identified_style", "confidence_score", "explanation"]
            if not all(key in analysis_result for key in required_keys):
                logger.error(f"OpenAI response JSON missing required keys for comm style (user {current_user.id}): {analysis_result}")
                raise HTTPException(status_code=500, detail="AI provider's response missing required analysis fields.")

            logger.info(f"Successfully received communication style analysis for user {current_user.id}")
            # Add original text length for consistency with old mock, if desired by API contract
            analysis_result["raw_text_length"] = len(text_input)
            analysis_result["model_provider"] = "openai" # Indicate the provider
            return analysis_result

        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from OpenAI response for comm style (user {current_user.id}): {content_str if 'content_str' in locals() else 'N/A'}")
            raise HTTPException(status_code=500, detail="Failed to parse AI provider's response.")
        except HTTPException: # Re-raise HTTPExceptions (e.g., from tenant/key checks)
            raise
        except Exception as e:
            logger.error(f"Error during communication style analysis for user {current_user.id}: {str(e)}")
            raise HTTPException(status_code=503, detail=f"Communication style analysis request to AI provider failed: {str(e)}")

# Dependency injector function
def get_communication_style_service(
    db: Session = Depends(get_db)
) -> CommunicationStyleService:
    ai_integration_service = AIIntegrationService(db=db)
    return CommunicationStyleService(db=db, ai_integration_service=ai_integration_service)
