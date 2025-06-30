import json
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from typing import List, Dict, Any, Optional, cast
from collections import Counter
import re

from ..crud import user_crud, user_setting_crud, tenant_crud
from ..models.user import User as UserModel
from ..db import get_db
from .ai_integration_service import AIIntegrationService

logger = logging.getLogger(__name__)

class EmailAnalysisService:
    def __init__(self, db: Session, ai_integration_service: AIIntegrationService):
        self.db = db
        self.ai_integration_service = ai_integration_service

    def _perform_internal_analysis(self, emails_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not emails_data:
            # Return a specific structure for no data, rather than an error string
            return {
                "total_emails_analyzed": 0,
                "most_common_subject_keywords": [],
                "analysis_type": "internal_basic_no_data"
            }

        num_emails = len(emails_data)
        subjects = [email.get("subject", "").lower() for email in emails_data if email.get("subject")]

        subject_keywords = Counter()
        for subj in subjects:
            words = re.findall(r'\b\w{3,}\b', subj)
            subject_keywords.update(words)

        return {
            "total_emails_analyzed": num_emails,
            "most_common_subject_keywords": subject_keywords.most_common(5) if subject_keywords else [],
            "analysis_type": "internal_basic"
        }

    async def analyze_email_data(self, current_user: UserModel, emails_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        current_user_id = getattr(current_user, 'id', None)  # type: ignore
        user_from_db = user_crud.get_user(self.db, user_id=cast(int, current_user_id))
        if not user_from_db:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        current_user = user_from_db

        tenant_id = getattr(current_user, 'tenant_id', None)  # type: ignore
        if not tenant_id and hasattr(current_user, 'tenants'):
            user_tenants = getattr(current_user, 'tenants', [])  # type: ignore
            if user_tenants:
                user_tenant_link = user_tenants[0]
                tenant_id = getattr(user_tenant_link, 'tenant_id', None)  # type: ignore

        if not tenant_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not associated with any tenant or tenant ID missing.")

        tenant = tenant_crud.get_tenant_by_id(self.db, tenant_id)
        if not tenant:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant information not found for user.")

        tenant_features = getattr(tenant, 'features', None)  # type: ignore
        if isinstance(tenant_features, str):
            try:
                tenant_features = json.loads(tenant_features or '{}')
            except json.JSONDecodeError:
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error parsing tenant features.")
        elif not isinstance(tenant_features, dict):
            tenant_features = {}

        if not tenant_features.get("email_pattern_analysis"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email Pattern Analysis feature is not enabled for your tenant."
            )

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=cast(int, current_user_id))
        api_keys_dict: Optional[Dict[str, str]] = None
        if user_settings and getattr(user_settings, 'api_keys', None):  # type: ignore
            try:
                api_keys_str = getattr(user_settings, 'api_keys', '{}')  # type: ignore
                api_keys_dict = json.loads(api_keys_str)
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse API keys JSON for user {current_user_id}")
                api_keys_dict = None

        openai_api_key = api_keys_dict.get("openai_api_key") if api_keys_dict else None

        if not emails_data: # Handle empty email list early
             logger.info(f"No email data provided for analysis by user {current_user_id}. Performing basic internal summary.")
             return self._perform_internal_analysis(emails_data)


        if openai_api_key:
            # Prepare a summary of email subjects for OpenAI if the data is too large
            # For this example, let's assume we send a sample of subjects or a concatenated string
            # A more robust solution would handle token limits carefully.
            email_subjects_sample = [email.get("subject", "") for email in emails_data[:20]] # Sample first 20 subjects
            email_content_for_prompt = "Analyze the following email subjects for common themes and overall sentiment:\n" + "\n".join(filter(None, email_subjects_sample))

            if len(email_content_for_prompt) > 3500: # Rough character limit to avoid overly long prompts
                email_content_for_prompt = email_content_for_prompt[:3500] + "... (truncated)"

            system_prompt = """
You are an AI assistant that analyzes a list of email subjects to identify patterns.
Based on the provided list of email subjects:
1. Identify up to 5 common themes or topics.
2. Provide an overall sentiment (e.g., Positive, Negative, Neutral, Mixed).
3. Suggest 1-2 potential productivity insights based on these themes/sentiments (e.g., "Frequent discussions about 'project X' might indicate a bottleneck or high priority").

Respond in JSON format with the following keys: "common_themes" (list of strings), "overall_sentiment" (string), "sentiment_confidence" (float 0.0-1.0), and "productivity_insights" (list of strings).
Example:
User text (list of subjects): ["Project Alpha Update", "Urgent: Review Q3 Report", "Meeting Reminder: Project Alpha", "Feedback needed on proposal"]
AI Response: {
  "common_themes": ["Project Alpha", "Reports/Reviews", "Proposals"],
  "overall_sentiment": "Neutral",
  "sentiment_confidence": 0.7,
  "productivity_insights": [
    "High frequency of 'Project Alpha' suggests it's a key focus or requires significant attention.",
    "Multiple requests for reviews and feedback might indicate a need for streamlined approval processes."
  ]
}
"""
            ai_payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": email_content_for_prompt}
                ],
                "response_format": {"type": "json_object"}
            }

            try:
                logger.info(f"Requesting email pattern analysis (OpenAI) for user {current_user_id}")
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
                    logger.error(f"Unexpected OpenAI response for email analysis (user {current_user_id}): {openai_response_data}")
                    # Fallback to internal analysis on unexpected AI response format
                    logger.warning(f"Falling back to internal email analysis for user {current_user_id} due to AI response error.")
                    return self._perform_internal_analysis(emails_data)

                content_str = openai_response_data["choices"][0]["message"]["content"]
                analysis_result = json.loads(content_str)

                required_keys = ["common_themes", "overall_sentiment", "sentiment_confidence", "productivity_insights"]
                if not all(key in analysis_result for key in required_keys):
                    logger.error(f"OpenAI response JSON missing required keys for email analysis (user {current_user_id}): {analysis_result}")
                    logger.warning(f"Falling back to internal email analysis for user {current_user_id} due to AI key missing in response.")
                    return self._perform_internal_analysis(emails_data)

                logger.info(f"Successfully received email pattern analysis (OpenAI) for user {current_user_id}")
                analysis_result["total_emails_processed_by_ai_prompt"] = len(email_subjects_sample)
                analysis_result["total_emails_provided_by_user"] = len(emails_data)
                analysis_result["analysis_type"] = "openai_assisted"
                analysis_result["model_provider"] = "openai"
                return analysis_result

            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from OpenAI (email analysis, user {current_user_id}): {content_str if 'content_str' in locals() else 'N/A'}. Falling back.")
                return self._perform_internal_analysis(emails_data)
            except HTTPException as e: # If make_request itself raises an HTTPException (e.g. API key error for other service)
                logger.error(f"HTTPException during OpenAI email analysis (user {current_user_id}): {e.detail}. Falling back.")
                return self._perform_internal_analysis(emails_data)
            except Exception as e:
                logger.error(f"Generic error during OpenAI email analysis (user {current_user_id}): {str(e)}. Falling back.")
                return self._perform_internal_analysis(emails_data)
        else:
            logger.info(f"No OpenAI API key for user {current_user_id}. Performing internal email analysis.")
            return self._perform_internal_analysis(emails_data)

# Dependency injector function
def get_email_analysis_service(
    db: Session = Depends(get_db)
) -> EmailAnalysisService:
    ai_integration_service = AIIntegrationService(db=db)
    return EmailAnalysisService(db=db, ai_integration_service=ai_integration_service)
