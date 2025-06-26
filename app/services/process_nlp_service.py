import logging
from typing import List, Optional, Dict, Any

from app.services.ai_integration_service import AIIntegrationService
from app.config import settings  # Assuming OpenAI API URL is in settings

logger = logging.getLogger(__name__)

class ProcessNLPService:
    def __init__(self, ai_integration_service: AIIntegrationService):
        self.ai_integration_service = ai_integration_service
        self.openai_api_url = settings.OPENAI_API_BASE_URL # e.g., "https://api.openai.com/v1"

    async def generate_enhanced_task_name(self, description: str, user_api_key: str) -> str:
        """
        Generates a more descriptive task name or summary for a process description.
        """
        if not user_api_key:
            logger.warning("OpenAI API key not provided for generating enhanced task name. Falling back to original description.")
            return f"Process: {description[:50]}" # Fallback

        prompt = (
            f"Given the following sequence of activities representing a user's process: "
            f"'{description}'\n\n"
            f"Generate a concise and descriptive task name or a very brief summary for this process. "
            f"The name should be suitable for a task management system. "
            f"For example, if the process is 'Open App -> Navigate to Settings -> Update Profile', "
            f"a good name might be 'Update User Profile' or 'Process for Updating Profile'. "
            f"If the process is 'Copy Text -> Open Document -> Paste Text -> Save Document', "
            f"a good name might be 'Save Copied Text to Document'.\n\n"
            f"Generated Name/Summary:"
        )

        payload = {
            "model": settings.OPENAI_MODEL_NAME, # e.g., "gpt-3.5-turbo"
            "messages": [
                {"role": "system", "content": "You are an expert in understanding user workflows and naming processes concisely."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 30, # Keep it short
            "temperature": 0.5,
        }

        try:
            response = await self.ai_integration_service.make_request(
                api_key=user_api_key,
                base_url=self.openai_api_url,
                endpoint="chat/completions",
                method="POST",
                payload=payload
            )
            enhanced_name = response.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            if enhanced_name:
                # Basic cleaning: remove quotes if AI wraps output in quotes
                if enhanced_name.startswith('"') and enhanced_name.endswith('"'):
                    enhanced_name = enhanced_name[1:-1]
                return enhanced_name
            else:
                logger.warning(f"OpenAI did not return content for task name generation. Description: {description}")
        except Exception as e:
            logger.error(f"Error generating enhanced task name via OpenAI for '{description}': {e}")

        return f"Process: {description[:50]}" # Fallback to simple name

    async def suggest_tags(self, description: str, user_api_key: str, existing_tags: Optional[List[str]] = None) -> List[str]:
        """
        Suggests relevant tags for a process description using OpenAI.
        Merges with existing tags, avoiding duplicates.
        """
        if not user_api_key:
            logger.warning("OpenAI API key not provided for suggesting tags. Returning existing or empty list.")
            return existing_tags or []

        current_tags_str = f" Current tags are: {', '.join(existing_tags)}." if existing_tags else ""
        prompt = (
            f"Analyze the following user process description: '{description}'.{current_tags_str}\n\n"
            f"Suggest 3-5 relevant keywords or tags (lowercase, single or two words) that categorize this process. "
            f"Consider the actions, potential tools involved, or the overall goal. "
            f"For example, if the process is 'Open App -> Click Button X -> Submit Form', tags might be ['form submission', 'app interaction', 'data entry']. "
            f"If the process is 'Copy Text -> Open Document -> Paste Text -> Save Document', tags might be ['document management', 'text editing', 'saving files'].\n\n"
            f"Return the suggested tags as a comma-separated list. Do not include the existing tags in your response, only new suggestions."
        )

        payload = {
            "model": settings.OPENAI_MODEL_NAME,
            "messages": [
                {"role": "system", "content": "You are an expert in keyword extraction and process categorization."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 50,
            "temperature": 0.6,
        }

        suggested_tags: List[str] = []
        try:
            response = await self.ai_integration_service.make_request(
                api_key=user_api_key,
                base_url=self.openai_api_url,
                endpoint="chat/completions",
                method="POST",
                payload=payload
            )
            raw_suggestions = response.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            if raw_suggestions:
                # Process comma-separated string into a list of clean tags
                suggested_tags = [tag.strip().lower() for tag in raw_suggestions.split(',') if tag.strip()]
                # Remove any empty strings that might result from splitting
                suggested_tags = [tag for tag in suggested_tags if tag]

        except Exception as e:
            logger.error(f"Error suggesting tags via OpenAI for '{description}': {e}")
            # In case of error, return original tags
            return existing_tags or []

        # Merge and deduplicate
        final_tags = list(existing_tags or [])
        for tag in suggested_tags:
            if tag not in final_tags:
                final_tags.append(tag)

        return final_tags

    async def extract_keywords(self, description: str, user_api_key: str) -> List[str]:
        """
        Extracts keywords from a process description using OpenAI.
        (This is an example and might overlap with suggest_tags; choose based on specific needs)
        """
        if not user_api_key:
            logger.warning("OpenAI API key not provided for extracting keywords. Returning empty list.")
            return []

        prompt = (
            f"Extract the most important keywords (nouns, verbs, key concepts) from the following process description: "
            f"'{description}'.\n\n"
            f"Return the keywords as a comma-separated list. Focus on terms that best describe the process steps and goals."
        )
        payload = {
            "model": settings.OPENAI_MODEL_NAME,
            "messages": [
                {"role": "system", "content": "You are an expert in information extraction and identifying key terms in text."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 60,
            "temperature": 0.4,
        }
        keywords: List[str] = []
        try:
            response = await self.ai_integration_service.make_request(
                api_key=user_api_key,
                base_url=self.openai_api_url,
                endpoint="chat/completions",
                method="POST",
                payload=payload
            )
            raw_keywords = response.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            if raw_keywords:
                keywords = [kw.strip().lower() for kw in raw_keywords.split(',') if kw.strip()]
                keywords = [kw for kw in keywords if kw]
        except Exception as e:
            logger.error(f"Error extracting keywords via OpenAI for '{description}': {e}")

        return keywords

# Example of how settings might be structured in digame/app/config.py
# class Settings:
#     OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY") # This might be per-user now
#     OPENAI_API_BASE_URL: str = "https://api.openai.com/v1"
#     OPENAI_MODEL_NAME: str = "gpt-3.5-turbo"
# settings = Settings()
#
# Ensure `digame.app.config` exists and has these settings.
# For this service, OPENAI_API_KEY is passed per user.
# OPENAI_API_BASE_URL and OPENAI_MODEL_NAME can come from global settings.
# If not, they might need to be passed or configured differently.
# For now, assuming they are available via `digame.app.config.settings`.
# If settings.py doesn't exist, these will need to be hardcoded or handled differently.

# Need to create/check digame/app/config.py
# For now, I'll assume it exists and provides OPENAI_API_BASE_URL and OPENAI_MODEL_NAME.
# If not, the service will fail at runtime, which will need to be addressed.
# Alternatively, pass these as __init__ params if preferred.
# For now, I will add placeholder values if settings cannot be imported.

try:
    from app.config import settings
except ImportError:
    logger.warning("Could not import 'settings' from 'digame.app.config'. Using placeholder values for OpenAI URL and model.")
    class PlaceholderSettings:
        OPENAI_API_BASE_URL: str = "https://api.openai.com/v1"
        OPENAI_MODEL_NAME: str = "gpt-3.5-turbo" # Or another default model
    settings = PlaceholderSettings()

logger.info(f"ProcessNLPService initialized. OpenAI Base URL: {settings.OPENAI_API_BASE_URL}, Model: {settings.OPENAI_MODEL_NAME}")

# Update __init__.py in services
# from .process_nlp_service import ProcessNLPService
# __all__ = [..., "ProcessNLPService"]
