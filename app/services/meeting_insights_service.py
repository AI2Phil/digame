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
        self.openai_api_url = "https://api.openai.com/v1" # Should ideally come from config.settings
        self.openai_model = "gpt-3.5-turbo" # Should ideally come from config.settings

    async def _get_user_and_api_key(self, current_user_id: int, feature_name: str) -> str:
        """Helper to get user, check tenant feature, and retrieve API key."""
        user_from_db = user_crud.get_user(self.db, user_id=current_user_id)
        if not user_from_db:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        tenant_id = getattr(user_from_db, 'tenant_id', None)
        if not tenant_id and hasattr(user_from_db, 'tenants') and user_from_db.tenants:
             user_tenant_link = user_from_db.tenants[0]
             tenant_id = getattr(user_tenant_link, 'tenant_id', None)

        if not tenant_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not associated with a tenant.")

        tenant = tenant_crud.get_tenant_by_id(self.db, tenant_id)
        if not tenant:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant information not found.")

        tenant_features = getattr(tenant, 'features', {})
        if isinstance(tenant_features, str):
            try:
                tenant_features = json.loads(tenant_features or '{}')
            except json.JSONDecodeError:
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error parsing tenant features.")
        elif not isinstance(tenant_features, dict): # Ensure it's a dict
            tenant_features = {}

        if not tenant_features.get(feature_name, False): # Default to False if feature key missing
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Feature '{feature_name}' is not enabled for your tenant."
            )

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=current_user_id)
        if not user_settings or not getattr(user_settings, 'api_keys', None):
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"API key for '{feature_name}' not found. Please add 'openai_api_key' to your settings."
            )
        try:
            api_keys_dict = json.loads(getattr(user_settings, 'api_keys', '{}'))
            openai_api_key = api_keys_dict.get("openai_api_key")
        except json.JSONDecodeError:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error parsing API key settings.")

        if not openai_api_key:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"The 'openai_api_key' for '{feature_name}' is missing. Please add it."
            )
        return openai_api_key

    async def get_meeting_analysis(self, current_user_id: int, meeting_text: str, generate_draft_email: bool = False) -> dict:
        openai_api_key = await self._get_user_and_api_key(current_user_id, "meeting_insights")

        if not meeting_text.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Meeting text cannot be empty.")

        system_prompt = """
You are an AI assistant that generates insights from meeting text (notes or transcripts).
From the provided meeting text, extract the following:
1. A concise summary of the meeting (2-3 sentences).
2. A list of key discussion points (bullet points).
3. A list of identified action items. Each action item should be an object with 'action' (string), 'assignee' (string, or null if unassigned), and 'due_text' (string, textual reference to deadline, or null if not mentioned).

Respond in JSON format with the following keys: "summary" (string), "key_points" (list of strings), and "action_items" (list of objects, where each object has "action", "assignee", "due_text").
Example for action_items: [{"action": "John to finalize budget", "assignee": "John", "due_text": "by next week"}, {"action": "Schedule follow-up", "assignee": null, "due_text": "Nov 2"}]
If no action items are found, "action_items" should be an empty list.
"""
        ai_payload = {
            "model": self.openai_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": meeting_text}
            ],
            "response_format": {"type": "json_object"}
        }

        try:
            logger.info(f"Requesting meeting insights for user {current_user_id}")
            openai_response_data = await self.ai_integration_service.make_request(
                api_key=openai_api_key,
                base_url=self.openai_api_url,
                endpoint="chat/completions",
                method="POST",
                payload=ai_payload
            )

            choices = openai_response_data.get("choices", [])
            if not choices or not choices[0].get("message") or not choices[0]["message"].get("content"):
                logger.error(f"Unexpected OpenAI response structure for meeting insights (user {current_user_id}): {openai_response_data}")
                raise HTTPException(status_code=getattr(status, 'HTTP_500_INTERNAL_SERVER_ERROR', 500), detail="AI provider returned an unexpected response format for meeting insights.")

            choices = openai_response_data.get("choices", [])
            message = choices[0].get("message", {}) if choices else {}
            content_str = message.get("content", "")
            analysis_result = json.loads(content_str)

            required_keys = ["summary", "key_points", "action_items"]
            if not all(key in analysis_result for key in required_keys) or not isinstance(analysis_result.get("action_items"), list):
                logger.error(f"OpenAI response JSON missing required keys or action_items not a list (user {current_user_id}): {analysis_result}")
                raise HTTPException(status_code=getattr(status, 'HTTP_500_INTERNAL_SERVER_ERROR', 500), detail="AI provider's response missing required meeting insights fields or invalid action_items format.")

            # Validate structure of action items
            validated_action_items = []
            action_items_list = analysis_result.get("action_items", [])
            for item in action_items_list:
                if isinstance(item, dict) and "action" in item:
                    validated_action_items.append({
                        "action": item.get("action"),
                        "assignee": item.get("assignee"), # Will be None if missing
                        "due_text": item.get("due_text")  # Will be None if missing
                    })
                else:
                    logger.warning(f"Invalid action item structure found for user {current_user_id}: {item}")
            analysis_result["action_items"] = validated_action_items


            logger.info(f"Successfully received meeting insights for user {current_user_id}")
            analysis_result["text_length"] = len(meeting_text)
            analysis_result["model_provider"] = "openai"

            draft_email_text = None
            if generate_draft_email:
                # Pass validated_action_items to ensure consistent structure
                draft_email_text = await self._generate_draft_email_from_analysis(
                    openai_api_key=openai_api_key,
                    summary=analysis_result["summary"],
                    key_points=analysis_result["key_points"],
                    action_items=validated_action_items # Use the validated list
                )
            analysis_result["draft_email"] = draft_email_text

            return analysis_result

        except json.JSONDecodeError:
            content_str_safe = content_str if 'content_str' in locals() else 'N/A'
            logger.error(f"Failed to parse JSON from OpenAI response for meeting insights (user {current_user_id}): {content_str_safe}")
            raise HTTPException(status_code=getattr(status, 'HTTP_500_INTERNAL_SERVER_ERROR', 500), detail="Failed to parse AI provider's response for meeting insights.")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during meeting insights generation for user {current_user_id}: {str(e)}")
            raise HTTPException(status_code=getattr(status, 'HTTP_503_SERVICE_UNAVAILABLE', 503), detail=f"Meeting insights request to AI provider failed: {str(e)}")

    async def _generate_draft_email_from_analysis(
        self, openai_api_key:str, summary: str, key_points: list, action_items: list # action_items are List[Dict]
    ) -> str:
        """
        Generates a draft follow-up email based on meeting analysis components.
        """
        action_items_str = ""
        if action_items:
            action_items_str = "\n\nKey Action Items:\n"
            for item in action_items:
                assignee = item.get('assignee') if isinstance(item, dict) else None
                due_text = item.get('due_text') if isinstance(item, dict) else None
                action = item.get('action', 'N/A') if isinstance(item, dict) else 'N/A'
                
                assignee_part = f" (Assigned to: {assignee})" if assignee else ""
                due_part = f" (Due: {due_text})" if due_text else ""
                action_items_str += f"- {action}{assignee_part}{due_part}\n"
        else:
            action_items_str = "\n\nNo specific action items were identified in this pass."

        key_points_str = ""
        if key_points:
            key_points_str = "\nKey Discussion Points:\n"
            for point in key_points:
                key_points_str += f"- {point}\n"

        email_prompt = f"""
Subject: Meeting Follow-up

Hi team,

Here's a summary of our recent meeting:

{summary}
{key_points_str}
{action_items_str}

Please review the action items and ensure they are clear. Let me know if there are any corrections or additions.

Best regards,

[Your Name]
"""
        # This is a template. We want OpenAI to draft it more naturally.
        system_instruction_for_email = "You are an AI assistant that drafts professional follow-up emails based on meeting notes."
        user_instruction_for_email = f"""
Based on the following meeting analysis:
Summary: {summary}
Key Points: {key_points_str}
Action Items: {action_items_str}

Draft a concise and professional follow-up email to the team.
The email should include the summary, key points, and action items.
Use a friendly but professional tone.
Start with a subject line like "Meeting Follow-up: [Brief Topic if inferable, else General]" or "Meeting Summary".
End with a generic closing like "Best regards,". Do not add a sender name.
"""

        ai_payload = {
            "model": self.openai_model,
            "messages": [
                {"role": "system", "content": system_instruction_for_email},
                {"role": "user", "content": user_instruction_for_email}
            ],
            "temperature": 0.7,
            "max_tokens": 500 # Allow for a decent length email
        }

        try:
            logger.info("Requesting draft follow-up email generation.")
            openai_response_data = await self.ai_integration_service.make_request(
                api_key=openai_api_key,
                base_url=self.openai_api_url,
                endpoint="chat/completions",
                method="POST",
                payload=ai_payload
            )
            choices = openai_response_data.get("choices", [])
            message = choices[0].get("message", {}) if choices else {}
            draft_email = message.get("content", "").strip()
            return draft_email
        except Exception as e:
            logger.error(f"Error generating draft email via OpenAI: {e}")
            return "Could not generate draft email due to an error."


# Dependency injector function
def get_meeting_insights_service(
    db: Session = Depends(get_db)
) -> MeetingInsightsService:
    ai_integration_service = AIIntegrationService(db=db)
    return MeetingInsightsService(db=db, ai_integration_service=ai_integration_service)
