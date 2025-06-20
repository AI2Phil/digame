import aiohttp
import json
import logging
from typing import Dict, Any, Optional

from sqlalchemy.orm import Session
# Assuming user_setting_crud and UserSetting model will be imported where this service is used
# For now, this service will focus on the API call mechanism.
# Retrieval of API key from UserSetting will be the responsibility of the calling service.

logger = logging.getLogger(__name__)

class AIIntegrationService:
    def __init__(self, db: Optional[Session] = None):
        # db session might be needed in the future for more complex logic,
        # but not strictly for a simple API call with a provided key.
        self.db = db

    async def make_request(
        self,
        api_key: str,
        base_url: str,
        endpoint: str,
        method: str = "POST",
        payload: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        custom_headers: Optional[Dict[str, str]] = None,
        auth_scheme: str = "Bearer"
    ) -> Dict[str, Any]:
        """
        Makes an authenticated API request to an AI service using an API key.

        Args:
            api_key: The API key for authentication.
            base_url: The base URL of the AI service.
            endpoint: The specific API endpoint.
            method: HTTP method (e.g., "POST", "GET").
            payload: JSON payload for POST/PUT/PATCH requests.
            params: URL parameters for GET requests.
            custom_headers: Any additional custom headers.
            auth_scheme: The authentication scheme (e.g., "Bearer", "ApiKey").
        """
        if not api_key:
            logger.error("API key not provided for AI service request.")
            raise ValueError("API key is required to make AI service requests.")

        full_url = f"{base_url.rstrip('/')}/{endpoint.lstrip('/')}"

        headers = {
            "Authorization": f"{auth_scheme} {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        if custom_headers:
            headers.update(custom_headers)

        logger.debug(f"Making {method} request to {full_url} with headers: {headers.keys()} and params: {params}")
        if payload:
            logger.debug(f"Payload: {json.dumps(payload)[:200]}...") # Log snippet of payload

        try:
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method=method.upper(),
                    url=full_url,
                    json=payload if method.upper() in ["POST", "PUT", "PATCH"] and payload else None,
                    params=params,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=60)  # 60 seconds timeout
                ) as response:

                    response_data: Dict[str, Any] = {}
                    response_text = await response.text()

                    if response.status == 429:  # Rate limited
                        retry_after = int(response.headers.get("Retry-After", 60))
                        logger.warning(f"Rate limited by AI service ({full_url}). Retry after {retry_after} seconds. Response: {response_text}")
                        raise Exception(f"AI service rate limited. Retry after {retry_after} seconds.") # Or a custom exception

                    # Try to parse JSON, if not, return raw text or handle error
                    try:
                        response_data = await response.json()
                    except aiohttp.ContentTypeError:
                        logger.warning(f"Response from {full_url} was not JSON. Status: {response.status}. Response: {response_text[:200]}...")
                        if 200 <= response.status < 300:
                             response_data = {"non_json_response": response_text, "status_code": response.status}
                        else:
                            # For error statuses with non-JSON response, include text in error
                            raise Exception(f"AI service request failed with status {response.status}. Response: {response_text}")


                    if not (200 <= response.status < 300):
                        logger.error(f"AI service request to {full_url} failed with status {response.status}. Response: {response_data}")
                        # Include response data in the exception if available
                        raise Exception(f"AI service request failed with status {response.status}. Details: {json.dumps(response_data)}")

                    logger.debug(f"Successfully received response from {full_url}. Status: {response.status}")
                    return response_data

        except aiohttp.ClientError as e:
            logger.error(f"AIOHTTP client error for AI service request ({full_url}): {str(e)}")
            raise Exception(f"AI service communication error: {str(e)}")
        except Exception as e:
            logger.error(f"Generic error during AI service request ({full_url}): {str(e)}")
            raise # Re-raise other exceptions after logging

# Example of how a calling service would retrieve an API key:
# This part is illustrative and would typically reside in the service *using* AIIntegrationService.
async def get_api_key_from_user_settings(
    db: Session,
    user_id: int,
    key_name: str = "openai_api_key" # Example key name
) -> Optional[str]:
    """
    Illustrative function to retrieve a specific API key from UserSetting.
    In a real scenario, this logic would be part of the service that *uses* AIIntegrationService.
    It requires access to user_setting_crud and the UserSetting model.

    Args:
        db: SQLAlchemy Session.
        user_id: ID of the user.
        key_name: The name of the key to retrieve from the api_keys JSON.
                  (e.g., "openai_api_key", "cohere_api_key")

    Returns:
        The API key string if found, else None.
    """
    # from ..crud import user_setting_crud # Actual import would be here
    # from ..models.user_setting import UserSetting # Actual import

    # Placeholder for actual CRUD call
    # user_settings_model = user_setting_crud.get_user_setting(db, user_id=user_id)

    # Mocked retrieval for illustration:
    class MockUserSetting:
        api_keys: Optional[str] = None

    user_settings_model = MockUserSetting()
    # Simulate finding a user setting with a key
    # In a real case: user_settings_model = user_setting_crud.get_user_setting(db, user_id=user_id)

    if user_id == 1: # Mock: User 1 has OpenAI key
         user_settings_model.api_keys = json.dumps({"openai_api_key": "sk-12345", "other_key": "abc"})
    elif user_id == 2: # Mock: User 2 has Cohere key
         user_settings_model.api_keys = json.dumps({"cohere_api_key": "co-67890"})
    # else: user_settings_model will have api_keys = None (user has no settings or no keys)

    if user_settings_model and user_settings_model.api_keys:
        try:
            api_keys_dict = json.loads(user_settings_model.api_keys)
            return api_keys_dict.get(key_name)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse API keys JSON for user {user_id}")
            return None
    return None
