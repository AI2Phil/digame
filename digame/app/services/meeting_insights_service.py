import json
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends

from ..crud import user_crud, user_setting_crud, tenant_crud
from ..models.user import User as UserModel
from ..db import get_db
from .ai_integration_service import AIIntegrationService

logger = logging.getLogger(__name__)

class MeetingInsightsService:
    def __init__(self, db: Session, ai_integration_service: AIIntegrationService):
        self.db = db
        self.ai_integration_service = ai_integration_service

    async def get_meeting_analysis(self, current_user: UserModel, meeting_text: str) -> dict:
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

        if not tenant_features.get("meeting_insights"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Meeting Insights feature is not enabled for your tenant."
            )

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=current_user.id)
        if not user_settings or not user_settings.api_keys:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="API key for Meeting Insights not found. Please add 'openai_api_key' to your settings."
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
                detail="The 'openai_api_key' for Meeting Insights is missing from your API key settings. Please add it."
            )

        if not meeting_text.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Meeting text cannot be empty.")

        system_prompt = """
You are an AI assistant that generates insights from meeting text (notes or transcripts).
From the provided meeting text, extract the following:
1. A concise summary of the meeting (2-3 sentences).
2. A list of key discussion points (bullet points).
3. A list of identified action items, clearly stating who is responsible if mentioned (bullet points).

Respond in JSON format with the following keys: "summary" (string), "key_points" (list of strings), and "action_items" (list of strings).
Example:
User text: "Meeting Notes - Project Alpha - 2023-10-26. Discussed Q4 roadmap. John to finalize budget by next week. Alice presented marketing strategy. Team agreed on new UI design. Next meeting scheduled for Nov 2."
AI Response: {
  "summary": "The Project Alpha team discussed the Q4 roadmap, including budget finalization and marketing strategy. A new UI design was agreed upon, and the next meeting is set for November 2nd.",
  "key_points": [
    "Q4 roadmap discussion",
    "Alice's marketing strategy presentation",
    "Agreement on new UI design"
  ],
  "action_items": [
    "John to finalize budget by next week",
    "Schedule next meeting for Nov 2"
  ]
}
"""
        ai_payload = {
            "model": "gpt-3.5-turbo", # Or a newer/more suitable model
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": meeting_text}
            ],
            "response_format": {"type": "json_object"}
        }

        try:
            logger.info(f"Requesting meeting insights for user {current_user.id}")
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
                logger.error(f"Unexpected OpenAI response structure for meeting insights (user {current_user.id}): {openai_response_data}")
                raise HTTPException(status_code=500, detail="AI provider returned an unexpected response format for meeting insights.")

            content_str = openai_response_data["choices"][0]["message"]["content"]
            analysis_result = json.loads(content_str)

            required_keys = ["summary", "key_points", "action_items"]
            if not all(key in analysis_result for key in required_keys):
                logger.error(f"OpenAI response JSON missing required keys for meeting insights (user {current_user.id}): {analysis_result}")
                raise HTTPException(status_code=500, detail="AI provider's response missing required meeting insights fields.")

            logger.info(f"Successfully received meeting insights for user {current_user.id}")
            analysis_result["text_length"] = len(meeting_text)
            analysis_result["model_provider"] = "openai"
            return analysis_result

        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from OpenAI response for meeting insights (user {current_user.id}): {content_str if 'content_str' in locals() else 'N/A'}")
            raise HTTPException(status_code=500, detail="Failed to parse AI provider's response for meeting insights.")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during meeting insights generation for user {current_user.id}: {str(e)}")
            raise HTTPException(status_code=503, detail=f"Meeting insights request to AI provider failed: {str(e)}")

# Dependency injector function
def get_meeting_insights_service(
    db: Session = Depends(get_db),
    ai_integration_service: AIIntegrationService = Depends(AIIntegrationService)
) -> MeetingInsightsService:
    return MeetingInsightsService(db=db, ai_integration_service=ai_integration_service)
