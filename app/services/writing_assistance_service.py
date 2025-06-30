import json
import logging
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends

# Assuming standard locations for these modules based on the project structure
from ..database import get_db
from ..crud import user_crud, user_setting_crud, tenant_crud # We'll need tenant_crud
from ..models.user import User as UserModel
from ..models.tenant import Tenant as TenantModel # Assuming tenant_crud returns this
from .ai_integration_service import AIIntegrationService # Added

logger = logging.getLogger(__name__) # Added

class WritingAssistanceService:
    def __init__(self, db: Session):
        self.db = db
        self.ai_integration_service = AIIntegrationService(db=self.db)
        self.openai_api_url = "https://api.openai.com/v1" # Ideally from settings
        self.openai_model = "gpt-3.5-turbo" # Ideally from settings

    async def _get_user_and_api_key(self, current_user_id: int, feature_name: str) -> str:
        """Helper to get user, check tenant feature, and retrieve API key."""
        # This is a simplified version of the helper used in other services.
        # In a real scenario, this would be robustly implemented.
        user_from_db = user_crud.get_user(self.db, user_id=current_user_id)
        if not user_from_db:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        tenant_id = getattr(user_from_db, 'tenant_id', None)  # type: ignore
        if not tenant_id and hasattr(user_from_db, 'tenants'):
            user_tenants = getattr(user_from_db, 'tenants', [])  # type: ignore
            if user_tenants:
                user_tenant_link = user_tenants[0]
                tenant_id = getattr(user_tenant_link, 'tenant_id', None)  # type: ignore

        if not tenant_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not associated with a tenant.")

        tenant = tenant_crud.get_tenant_by_id(self.db, tenant_id)
        if not tenant:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant information not found.")

        tenant_features = getattr(tenant, 'features', None)  # type: ignore
        if isinstance(tenant_features, str):
            try:
                tenant_features = json.loads(tenant_features or '{}')
            except json.JSONDecodeError:
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error parsing tenant features.")
        elif not isinstance(tenant_features, dict):
            tenant_features = {}

        if not tenant_features.get(feature_name, False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Feature '{feature_name}' is not enabled for your tenant."
            )

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=current_user_id)
        if not user_settings or not getattr(user_settings, 'api_keys', None):  # type: ignore
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"API key for '{feature_name}' not found. Please add 'openai_api_key' to your settings."
            )
        try:
            api_keys_str = getattr(user_settings, 'api_keys', '{}')  # type: ignore
            api_keys_dict = json.loads(api_keys_str)
            openai_api_key = api_keys_dict.get("openai_api_key")
        except json.JSONDecodeError:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error parsing API key settings.")

        if not openai_api_key:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"The 'openai_api_key' for '{feature_name}' is missing. Please add it."
            )
        return openai_api_key

    async def get_writing_suggestion(
        self,
        current_user_id: int, # Changed to pass ID
        text_input: str,
        context_type: Optional[str] = None,
        related_data: Optional[Dict[str, Any]] = None,
        language: Optional[str] = "en" # Default to English
    ) -> str:

        openai_api_key = await self._get_user_and_api_key(current_user_id, "writing_assistance")

        system_prompt = "You are a helpful writing assistant."
        user_prompt_detail = "Given the user's text, provide a concise suggestion to improve it. This could be a rephrased version, a correction, or advice on style/tone."

        if context_type == "email_reply":
            system_prompt = "You are an assistant helping to draft polite and professional email replies."
            original_subject = related_data.get("subject", "N/A") if related_data else "N/A"
            original_sender = related_data.get("sender", "N/A") if related_data else "N/A"
            original_body_snippet = related_data.get("body_snippet", "N/A") if related_data else "N/A" # Add if available
            user_prompt_detail = (
                f"The user is replying to an email.\n"
                f"Original Email Subject: '{original_subject}'\n"
                f"Original Email Sender: '{original_sender}'\n"
                f"Original Email Snippet: '{original_body_snippet}'\n\n"
                f"User's draft reply is: '{text_input}'\n\n"
                f"Suggest improvements, complete the draft reply appropriately, or offer a rephrased version. "
                f"Ensure the reply is polite and professional. If the draft is good, you can affirm it."
            )
        elif context_type == "task_description":
            system_prompt = "You are an assistant helping to write clear and actionable task descriptions."
            user_prompt_detail = (
                f"The user is writing a task description: '{text_input}'\n\n"
                f"Improve this task description to be clear, specific, and actionable. "
                f"Ensure it includes a clear objective. If it's already good, suggest minor improvements or affirm it."
            )
        elif context_type == "performance_review_feedback":
            system_prompt = "You are an assistant skilled in crafting constructive and professional performance review feedback."
            feedback_recipient_role = related_data.get("recipient_role", "team member") if related_data else "team member"
            user_prompt_detail = (
                f"The user is writing performance review feedback for a {feedback_recipient_role}: '{text_input}'\n\n"
                f"Refine this feedback to be constructive, specific, balanced, and professional. "
                f"Focus on actionable advice and maintain a supportive tone where appropriate."
            )
        # Add more context_types here as needed...
        else: # Default/fallback prompt
            if context_type: # Unrecognized context_type
                logger.warning(f"Unrecognized context_type '{context_type}' for writing assistance. Using default prompt.")
            system_prompt = "You are a helpful writing assistant."
            user_prompt_detail = (
                 "Given the user's text, provide a concise suggestion to improve it. "
                 "This could be a rephrased version, a correction, or advice on style/tone. "
                 "If the input text is good, you can say so."
            )

        final_user_prompt = (
            f"{user_prompt_detail}\n\n"
            f"Respond in JSON format with a single key \"suggestion_text\" containing your suggested improvement, the improved text, or affirmation. "
            f"If suggesting a rephrase, provide the full rephrased text. Language: {language}."
        )

        ai_payload = {
            "model": self.openai_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": final_user_prompt} # User's text is now part of the detailed prompt
            ],
            "response_format": {"type": "json_object"}
        }

        try:
            openai_response_data = await self.ai_integration_service.make_request(
                api_key=openai_api_key,
                base_url=self.openai_api_url,
                endpoint="chat/completions",
                method="POST",
                payload=ai_payload
            )

            if not openai_response_data.get("choices") or \
               not openai_response_data["choices"][0].get("message") or \
               not openai_response_data["choices"][0]["message"].get("content"):
                logger.error(f"Unexpected OpenAI response structure for writing assistance (user {current_user_id}): {openai_response_data}")
                raise HTTPException(status_code=500, detail="Writing assistance received an unexpected response format from AI provider.")

            content_str = openai_response_data["choices"][0]["message"]["content"]
            suggestion_json = json.loads(content_str)

            suggestion_text = suggestion_json.get("suggestion_text")
            if suggestion_text is None:
                logger.error(f"OpenAI response JSON missing 'suggestion_text' for writing assistance (user {current_user_id}): {suggestion_json}")
                raise HTTPException(status_code=500, detail="Writing assistance AI provider's response missing suggestion text.")

            logger.info(f"Successfully received writing suggestion for user {current_user_id}")
            return suggestion_text

        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from OpenAI response for writing assistance (user {current_user_id}): {content_str if 'content_str' in locals() else 'N/A'}")
            raise HTTPException(status_code=500, detail="Writing assistance failed to parse AI provider's response.")
        except HTTPException: # Re-raise HTTPExceptions
            raise
        except Exception as e:
            logger.error(f"Error calling OpenAI for writing assistance (user {current_user_id}): {str(e)}")
            raise HTTPException(status_code=503, detail=f"Writing assistance request to AI provider failed: {str(e)}")


def get_writing_assistance_service(db: Session = Depends(get_db)):
    return WritingAssistanceService(db)


class WritingAssistanceServiceExtended(WritingAssistanceService):
    def _build_template_prompt(self, template_type: str, input_data: Dict[str, Any], tone: str, language: str) -> Tuple[str, str]:
        """
        Internal helper to construct system and user prompts for smart templates.
        Returns (system_prompt, user_prompt_content)
        """
        system_prompt = "You are an expert writing assistant, skilled in generating structured documents from templates and key information."
        user_prompt_content = ""

        if template_type == "project_update_summary":
            system_prompt = f"You are an assistant helping users draft concise and informative project updates for stakeholders, with a {tone} tone, in {language}."
            project_name = input_data.get("project_name", "N/A")
            completed_tasks = input_data.get("completed_tasks", [])
            upcoming_milestones = input_data.get("upcoming_milestones", [])
            blockers = input_data.get("blockers", [])

            completed_str = "- " + "\n- ".join(completed_tasks) if completed_tasks else "None."
            upcoming_str = "- " + "\n- ".join(upcoming_milestones) if upcoming_milestones else "None."
            blockers_str = "- " + "\n- ".join(blockers) if blockers else "None."

            user_prompt_content = (
                f"Generate a project update summary for '{project_name}'.\n"
                f"Completed tasks this period:\n{completed_str}\n\n"
                f"Upcoming milestones:\n{upcoming_str}\n\n"
                f"Current blockers or challenges:\n{blockers_str}\n\n"
                f"The desired tone is {tone}. Please write the update in {language}."
            )

        elif template_type == "meeting_minutes_outline":
            system_prompt = f"You are an assistant that generates structured meeting minutes outlines, with a {tone} tone, in {language}."
            meeting_title = input_data.get("meeting_title", "Meeting")
            date = input_data.get("date", "N/A")
            attendees = input_data.get("attendees", [])
            agenda_items = input_data.get("agenda_items", []) # Expected to be list of strings or dicts with 'topic' and 'discussion_summary'
            decisions = input_data.get("decisions_made", []) # List of strings
            action_items = input_data.get("action_items", []) # List of dicts: {'action': str, 'assignee': str, 'due_date': str}

            attendees_str = ", ".join(attendees) if attendees else "Not specified."
            agenda_str = ""
            for i, item in enumerate(agenda_items):
                if isinstance(item, str):
                    agenda_str += f"\n{i+1}. {item}"
                elif isinstance(item, dict):
                    agenda_str += f"\n{i+1}. {item.get('topic', 'N/A')}:\n   - Discussion: {item.get('discussion_summary', 'N/A')}"

            decisions_str = "- " + "\n- ".join(decisions) if decisions else "None made or noted."
            action_items_str = ""
            if action_items:
                for item in action_items:
                    action_items_str += f"\n- Action: {item.get('action', 'N/A')}\n  Assigned to: {item.get('assignee', 'N/A')}\n  Due: {item.get('due_date', 'N/A')}"
            else:
                action_items_str = "None assigned."

            user_prompt_content = (
                f"Generate meeting minutes for: {meeting_title}\n"
                f"Date: {date}\n"
                f"Attendees: {attendees_str}\n\n"
                f"Agenda & Discussion Points:{agenda_str}\n\n"
                f"Decisions Made:\n{decisions_str}\n\n"
                f"Action Items:{action_items_str}\n\n"
                f"The tone should be {tone}. Please write the minutes in {language}."
            )

        elif template_type == "formal_request_email":
            system_prompt = f"You are an AI assistant skilled in drafting formal emails for requests, ensuring a {tone} tone and written in {language}."
            recipient_name = input_data.get("recipient_name", "Hiring Manager") # Default or example
            sender_name = input_data.get("sender_name", "[Your Name]")
            request_subject = input_data.get("request_subject", "Formal Request")
            request_details = input_data.get("request_details", "I am writing to request...")
            desired_outcome = input_data.get("desired_outcome", "I hope for a positive response.")

            user_prompt_content = (
                f"Draft a formal email with the following details:\n"
                f"Recipient: {recipient_name}\n"
                f"Sender: {sender_name}\n"
                f"Subject: {request_subject}\n"
                f"Body Content Hint: {request_details}\n"
                f"Desired Outcome/Call to Action: {desired_outcome}\n\n"
                f"Ensure the email is formal, polite, and clearly states the request. The tone is {tone}. Language: {language}."
            )

        else: # Fallback for unknown template_type
            logger.warning(f"Unknown template_type '{template_type}'. Using a generic generation prompt.")
            system_prompt = f"You are a versatile writing assistant. Generate text based on the provided inputs, with a {tone} tone, in {language}."
            user_prompt_content = (
                f"Generate a document based on the following information:\n{json.dumps(input_data, indent=2)}\n"
                f"The desired tone is {tone}. Language: {language}."
            )

        return system_prompt, user_prompt_content

    async def generate_text_from_template(
        self,
        current_user_id: int,
        template_type: str,
        input_data: Dict[str, Any],
        tone: str = "professional",
        language: str = "en"
    ) -> Dict[str, Any]:

        # Assuming "smart_templates" is the feature flag name
        openai_api_key = await self._get_user_and_api_key(current_user_id, "smart_templates")

        system_prompt, user_prompt = self._build_template_prompt(template_type, input_data, tone, language)

        ai_payload = {
            "model": self.openai_model, # Consider allowing model choice per template or globally
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7, # Often good for creative/generative tasks
            "max_tokens": 1000  # Adjust based on expected output length
        }

        try:
            logger.info(f"Requesting text generation for template '{template_type}' for user {current_user_id}")
            openai_response_data = await self.ai_integration_service.make_request(
                api_key=openai_api_key,
                base_url=self.openai_api_url,
                endpoint="chat/completions",
                method="POST",
                payload=ai_payload
            )

            generated_text = openai_response_data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            if not generated_text:
                logger.warning(f"OpenAI returned empty text for template '{template_type}' for user {current_user_id}")
                generated_text = "Could not generate text for this template."

            return {
                "template_type": template_type,
                "generated_text": generated_text,
                "model_provider": "openai"
            }
        except Exception as e:
            logger.error(f"Error generating text from template '{template_type}' for user {current_user_id}: {e}")
            # Consider returning a more structured error in the dict if preferred by consuming code
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Smart template generation failed: {e}")
