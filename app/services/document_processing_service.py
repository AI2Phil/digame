import json
import logging
from typing import List, Dict, Any, Optional

try:
    from sqlalchemy.orm import Session
except ImportError:
    Session = None  # type: ignore

try:
    from fastapi import HTTPException, status, Depends
except ImportError:
    HTTPException = None  # type: ignore
    status = None  # type: ignore
    Depends = None  # type: ignore

from ..crud import user_crud, user_setting_crud, tenant_crud
from ..models.user import User as UserModel
from ..db import get_db
from .ai_integration_service import AIIntegrationService
from ..config import settings # For OpenAI model name and base URL

logger = logging.getLogger(__name__)

class DocumentProcessingService:
    def __init__(self, db: Session, ai_integration_service: AIIntegrationService):
        self.db = db
        self.ai_integration_service = ai_integration_service
        self.openai_api_url = settings.OPENAI_API_BASE_URL
        self.openai_model = settings.OPENAI_MODEL_NAME

    async def _get_user_and_api_key(self, current_user_id: int, feature_name: str) -> str:
        """Helper to get user, check tenant feature, and retrieve API key."""
        user_from_db = user_crud.get_user(self.db, user_id=current_user_id)
        if not user_from_db:
            if HTTPException and status:
                raise HTTPException(status_code=getattr(status, 'HTTP_404_NOT_FOUND', 404), detail="User not found.")
            else:
                raise ValueError("User not found.")

        tenant_id = getattr(user_from_db, 'tenant_id', None)
        if not tenant_id and hasattr(user_from_db, 'tenants') and user_from_db.tenants:
             user_tenant_link = user_from_db.tenants[0]
             tenant_id = getattr(user_tenant_link, 'tenant_id', None)

        if not tenant_id:
            if HTTPException:
                status_code = getattr(status, 'HTTP_403_FORBIDDEN', 403) if status else 403
                raise HTTPException(status_code=status_code, detail="User not associated with a tenant.")
            else:
                raise ValueError("User not associated with a tenant.")

        tenant = tenant_crud.get_tenant_by_id(self.db, tenant_id)
        if not tenant:
            if HTTPException:
                status_code = getattr(status, 'HTTP_403_FORBIDDEN', 403) if status else 403
                raise HTTPException(status_code=status_code, detail="Tenant information not found.")
            else:
                raise ValueError("Tenant information not found.")

        tenant_features = getattr(tenant, 'features', {})
        if isinstance(tenant_features, str):
            try:
                tenant_features = json.loads(tenant_features or '{}')
            except json.JSONDecodeError:
                 if HTTPException:
                     status_code = getattr(status, 'HTTP_500_INTERNAL_SERVER_ERROR', 500) if status else 500
                     raise HTTPException(status_code=status_code, detail="Error parsing tenant features.")
                 else:
                     raise ValueError("Error parsing tenant features.")
        elif not isinstance(tenant_features, dict): # Ensure it's a dict
            tenant_features = {}

        # Assume feature names like 'document_summarization', 'document_synthesis', 'document_action_items'
        if not tenant_features.get(feature_name, False): # Default to False if feature key missing
            if HTTPException and status:
                raise HTTPException(
                    status_code=getattr(status, 'HTTP_403_FORBIDDEN', 403),
                    detail=f"Feature '{feature_name}' is not enabled for your tenant."
                )
            else:
                raise ValueError(f"Feature '{feature_name}' is not enabled for your tenant.")

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=current_user_id)
        if not user_settings or not getattr(user_settings, 'api_keys', None):
            if HTTPException and status:
                raise HTTPException(
                    status_code=getattr(status, 'HTTP_402_PAYMENT_REQUIRED', 402),
                    detail=f"API key for '{feature_name}' not found. Please add 'openai_api_key' to your settings."
                )
            else:
                raise ValueError(f"API key for '{feature_name}' not found. Please add 'openai_api_key' to your settings.")
        try:
            api_keys_dict = json.loads(getattr(user_settings, 'api_keys', '{}'))
            openai_api_key = api_keys_dict.get("openai_api_key")
        except json.JSONDecodeError:
            if HTTPException:
                status_code = getattr(status, 'HTTP_500_INTERNAL_SERVER_ERROR', 500) if status else 500
                raise HTTPException(status_code=status_code, detail="Error parsing API key settings.")
            else:
                raise ValueError("Error parsing API key settings.")

        if not openai_api_key:
            if HTTPException and status:
                raise HTTPException(
                    status_code=getattr(status, 'HTTP_402_PAYMENT_REQUIRED', 402),
                    detail=f"The 'openai_api_key' for '{feature_name}' is missing. Please add it."
                )
            else:
                raise ValueError(f"The 'openai_api_key' for '{feature_name}' is missing. Please add it.")
        return openai_api_key

    async def summarize_document(self, current_user_id: int, document_text: str, summary_length_preference: str = "medium") -> Dict[str, Any]:
        openai_api_key = await self._get_user_and_api_key(current_user_id, "document_summarization")

        if not document_text.strip():
            if HTTPException:
                status_code = getattr(status, 'HTTP_400_BAD_REQUEST', 400) if status else 400
                raise HTTPException(status_code=status_code, detail="Document text cannot be empty.")
            else:
                raise ValueError("Document text cannot be empty.")

        length_instructions = {
            "short": "a very concise summary (1-2 sentences).",
            "medium": "a moderate summary (3-5 sentences).",
            "long": "a more detailed summary (5-7 sentences, or key bullet points if appropriate)."
        }
        length_prompt = length_instructions.get(summary_length_preference.lower(), length_instructions["medium"])

        system_prompt = f"""
You are an AI assistant skilled at summarizing documents.
Provide {length_prompt}
Focus on the main ideas and key information.
Respond ONLY with the summary text, no other conversational text or pleasantries.
"""
        ai_payload = {
            "model": self.openai_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": document_text}
            ],
            "temperature": 0.5,
            # max_tokens can be adjusted based on summary_length_preference if needed
        }

        try:
            logger.info(f"Requesting document summarization for user {current_user_id}")
            openai_response = await self.ai_integration_service.make_request(
                api_key=openai_api_key, base_url=self.openai_api_url, endpoint="chat/completions", payload=ai_payload
            )
            summary = openai_response.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            if not summary:
                 logger.warning(f"OpenAI returned empty summary for user {current_user_id}")
                 summary = "Could not generate summary." # Fallback or raise error

            return {
                "original_text_length": len(document_text),
                "summary": summary,
                "model_provider": "openai"
            }
        except Exception as e:
            logger.error(f"Error during document summarization for user {current_user_id}: {e}")
            if HTTPException:
                status_code = getattr(status, 'HTTP_503_SERVICE_UNAVAILABLE', 503) if status else 503
                raise HTTPException(status_code=status_code, detail=f"Summarization request failed: {e}")
            else:
                raise Exception(f"Summarization request failed: {e}")

    async def extract_action_items_from_document(self, current_user_id: int, document_text: str) -> Dict[str, Any]:
        openai_api_key = await self._get_user_and_api_key(current_user_id, "document_action_items")

        if not document_text.strip():
            if HTTPException:
                status_code = getattr(status, 'HTTP_400_BAD_REQUEST', 400) if status else 400
                raise HTTPException(status_code=status_code, detail="Document text cannot be empty.")
            else:
                raise ValueError("Document text cannot be empty.")

        system_prompt = """
You are an AI assistant that extracts action items from text.
Identify any tasks, assignments, commitments, or clear next steps mentioned in the document.
List each action item clearly. If a responsible person or a deadline is mentioned, include it.
Respond in JSON format with a single key "action_items" which is a list of strings.
Example: User text: "Team meeting notes... Alex needs to update the slides by Friday. We should also schedule a follow-up with the client."
AI Response: { "action_items": ["Alex to update slides by Friday", "Schedule a follow-up with the client"] }
If no action items are found, return an empty list.
"""
        ai_payload = {
            "model": self.openai_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": document_text}
            ],
            "response_format": {"type": "json_object"}
        }
        try:
            logger.info(f"Requesting action item extraction for user {current_user_id}")
            openai_response = await self.ai_integration_service.make_request(
                api_key=openai_api_key, base_url=self.openai_api_url, endpoint="chat/completions", payload=ai_payload
            )
            content_str = openai_response.get("choices", [{}])[0].get("message", {}).get("content", "")
            result = json.loads(content_str)
            action_items = result.get("action_items", [])
            if not isinstance(action_items, list): # Basic validation
                logger.error(f"OpenAI returned non-list for action_items for user {current_user_id}: {action_items}")
                action_items = ["Error: AI response for action items was not a list."]


            return {
                "original_text_length": len(document_text),
                "action_items": action_items,
                "model_provider": "openai"
            }
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from OpenAI for action items (user {current_user_id})")
            if HTTPException:
                status_code = getattr(status, 'HTTP_500_INTERNAL_SERVER_ERROR', 500) if status else 500
                raise HTTPException(status_code=status_code, detail="AI provider returned invalid JSON for action items.")
            else:
                raise ValueError("AI provider returned invalid JSON for action items.")
        except Exception as e:
            logger.error(f"Error extracting action items for user {current_user_id}: {e}")
            if HTTPException:
                status_code = getattr(status, 'HTTP_503_SERVICE_UNAVAILABLE', 503) if status else 503
                raise HTTPException(status_code=status_code, detail=f"Action item extraction failed: {e}")
            else:
                raise Exception(f"Action item extraction failed: {e}")

    async def synthesize_documents(self, current_user_id: int, documents: List[Dict[str, str]], synthesis_goal: str, output_format: str) -> Dict[str, Any]:
        openai_api_key = await self._get_user_and_api_key(current_user_id, "document_synthesis")

        if not documents or len(documents) < 2:
            if HTTPException:
                status_code = getattr(status, 'HTTP_400_BAD_REQUEST', 400) if status else 400
                raise HTTPException(status_code=status_code, detail="At least two documents are required for synthesis.")
            else:
                raise ValueError("At least two documents are required for synthesis.")

        # Simple concatenation for now. For very long documents, pre-summarization of each might be needed.
        # This could hit token limits quickly.
        combined_text = ""
        for i, doc_input in enumerate(documents):
            doc_text = doc_input.get("text_content", "")
            doc_id = doc_input.get("identifier", f"Document {i+1}")
            if not doc_text.strip():
                if HTTPException:
                    status_code = getattr(status, 'HTTP_400_BAD_REQUEST', 400) if status else 400
                    raise HTTPException(status_code=status_code, detail=f"{doc_id} text cannot be empty.")
                else:
                    raise ValueError(f"{doc_id} text cannot be empty.")
            combined_text += f"--- START OF {doc_id} ---\n{doc_text}\n--- END OF {doc_id} ---\n\n"

        # Basic check for combined length (very rough estimate)
        # A more robust solution would use tiktoken to count tokens.
        if len(combined_text) > 100000: # Arbitrary limit, actual token limit is much lower
            logger.warning(f"Combined document length for synthesis is very large for user {current_user_id}. May hit token limits.")


        format_instruction = "Provide the synthesis as a well-structured paragraph."
        if output_format == "bullet_points":
            format_instruction = "Provide the synthesis as a list of key bullet points."

        system_prompt = f"""
You are an AI assistant that synthesizes information from multiple documents.
The user has provided {len(documents)} documents.
Your goal is to: {synthesis_goal}.
{format_instruction}
Analyze the content of all provided documents and generate a unified response based on the goal.
Respond ONLY with the synthesized text.
"""
        ai_payload = {
            "model": self.openai_model, # Potentially a model better suited for long context if available & configured
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": combined_text}
            ],
            "temperature": 0.7,
        }

        try:
            logger.info(f"Requesting document synthesis for user {current_user_id} with goal: {synthesis_goal}")
            openai_response = await self.ai_integration_service.make_request(
                api_key=openai_api_key, base_url=self.openai_api_url, endpoint="chat/completions", payload=ai_payload
            )
            synthesis_result = openai_response.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            if not synthesis_result:
                 logger.warning(f"OpenAI returned empty synthesis for user {current_user_id}")
                 synthesis_result = "Could not generate synthesis."

            return {
                "original_document_count": len(documents),
                "synthesis_result": synthesis_result,
                "model_provider": "openai"
            }
        except Exception as e:
            logger.error(f"Error during document synthesis for user {current_user_id}: {e}")
            if HTTPException:
                status_code = getattr(status, 'HTTP_503_SERVICE_UNAVAILABLE', 503) if status else 503
                raise HTTPException(status_code=status_code, detail=f"Document synthesis request failed: {e}")
            else:
                raise Exception(f"Document synthesis request failed: {e}")


# Dependency injector function
def get_document_processing_service(
    db: Session = getattr(Depends, '__call__', lambda x: x)(get_db) if Depends else get_db  # type: ignore
) -> DocumentProcessingService:
    ai_integration_service = AIIntegrationService(db=db)
    return DocumentProcessingService(db=db, ai_integration_service=ai_integration_service)
