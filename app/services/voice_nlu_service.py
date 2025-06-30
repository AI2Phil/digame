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
        self, user_id: int, transcribed_text: str, language: str = "en-US",
        conversation_context: Optional[Dict[str, Any]] = None # Added context parameter
    ) -> Dict[str, Any]:
        logger.debug(f"User {user_id} attempting to interpret text: '{transcribed_text}' with context: {conversation_context}")

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=user_id)
        api_key = None
        if user_settings and getattr(user_settings, 'api_keys', None):  # type: ignore
            try:
                api_keys_str = getattr(user_settings, 'api_keys', '{}')  # type: ignore
                api_keys_dict = json.loads(api_keys_str)
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
- EDIT_TASK: User wants to modify an existing task. Entities: {'task_identifier_keywords': 'keywords to find the task', 'new_description': 'optional new task description', 'new_due_date': 'optional new due date in YYYY-MM-DD', 'new_priority': 'optional new priority high/medium/low', 'new_status': 'optional new status e.g., completed, in_progress'}
- COMPLETE_TASK: User wants to mark a task as completed. Entities: {'task_identifier_keywords': 'keywords to find the task'}
- FIND_TASK: User wants to find a specific task or list tasks. Entities: {'task_identifier_keywords': 'keywords to find the task'}
- GET_PROFILE_INFO: User wants to retrieve some profile information. Entities: {'info_type': 'e.g., email, username, full_name'}
- SET_REMINDER: User wants to set a reminder. Entities: {'reminder_text': 'text for reminder', 'reminder_time': 'time for reminder e.g., tomorrow 10am'}

If conversation context is provided, use it to resolve ambiguities or understand follow-up commands.
For example, if the context indicates tasks were recently listed, a command like "complete the first one" should refer to that list.
Contextual references: "the first one", "the second task", "that item", "cancel that".
When referring to a list from context (e.g. "the first one"), try to identify the specific item ID if available in context, or use keywords from the item's description.
If context includes 'clarification_needed_for_tasks', the user might be responding to that.
"""
        context_summary_for_prompt = ""
        if conversation_context:
            context_parts = []
            if "last_intent" in conversation_context:
                context_parts.append(f"Previously, the intent was '{conversation_context['last_intent']}'.")
            if "last_entities" in conversation_context:
                context_parts.append(f"Recognized entities were: {json.dumps(conversation_context['last_entities'])}.")
            if "last_action_result" in conversation_context:
                # Summarize complex results like lists of tasks
                last_result = conversation_context['last_action_result']
                if "tasks_summary" in last_result and last_result["tasks_summary"]:
                    summary = ", ".join([f"'{t.get('description', 'Unnamed task')}' (ID: {t.get('id')})" for t in last_result["tasks_summary"][:3]]) # Show first 3
                    context_parts.append(f"Last action found tasks: [{summary}{', ...' if len(last_result['tasks_summary']) > 3 else ''}].")
                elif "task_id" in last_result:
                     context_parts.append(f"Last action involved task ID {last_result['task_id']}.")
            if "clarification_needed_for_tasks" in conversation_context:
                tasks_for_clarification = conversation_context["clarification_needed_for_tasks"]
                summary = ", ".join([f"'{t.get('description', 'Unnamed task')}' (ID: {t.get('id')})" for t in tasks_for_clarification[:3]])
                context_parts.append(f"User was asked for clarification among these tasks: [{summary}{', ...' if len(tasks_for_clarification) > 3 else ''}].")

            if context_parts:
                context_summary_for_prompt = "CONVERSATION CONTEXT:\n" + "\n".join(context_parts) + "\n\nCURRENT USER COMMAND:"
            else:
                context_summary_for_prompt = "CURRENT USER COMMAND:"
        else:
            context_summary_for_prompt = "CURRENT USER COMMAND:"

        # The user's current transcribed text is the main content for the "user" message
        user_content = f"{context_summary_for_prompt}\n{transcribed_text}"

        nlu_payload = {
            "model": "gpt-3.5-turbo", # Consider making this configurable
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
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
