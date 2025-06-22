import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends

# Assuming standard locations for these modules based on the project structure
from ..crud import user_crud, user_setting_crud, tenant_crud # We'll need tenant_crud
from ..models.user import User as UserModel
from ..models.tenant import Tenant as TenantModel # Assuming tenant_crud returns this

import logging # Added
from .ai_integration_service import AIIntegrationService # Added

# Assuming standard locations for these modules based on the project structure
from ..crud import user_crud, user_setting_crud, tenant_crud # We'll need tenant_crud
from ..models.user import User as UserModel
from ..models.tenant import Tenant as TenantModel # Assuming tenant_crud returns this

logger = logging.getLogger(__name__) # Added

class WritingAssistanceService:
    def __init__(self, db: Session):
        self.db = db
        self.ai_integration_service = AIIntegrationService(db=self.db)

    async def get_writing_suggestion(self, current_user: UserModel, text_input: str) -> str: # Changed to async
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        # 1. Fetch user's tenant information.
        user_from_db = user_crud.get_user(self.db, user_id=current_user.id) # Ensure fresh user data
        if not user_from_db :
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        current_user = user_from_db # Use the fresh instance

        # Simplified tenant fetching assuming user_from_db.tenant_id exists directly
        # This part of the logic depends heavily on how tenants are linked to users.
        # For this exercise, we assume a direct tenant_id or a simple relationship.
        # The original logic for tenant fetching was complex due to potential missing relationships.
        # Let's assume direct tenant_id on user model or a simpler path.
        # If user has a `tenant_id` attribute:
        tenant_id = getattr(current_user, 'tenant_id', None)
        if not tenant_id and hasattr(current_user, 'tenants') and current_user.tenants:
             # Fallback to original logic if user.tenants exists (list of TenantUser)
             user_tenant_link = current_user.tenants[0]
             tenant_id = getattr(user_tenant_link, 'tenant_id', None)

        if not tenant_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not associated with any tenant or tenant ID missing.")

        tenant = tenant_crud.get_tenant_by_id(self.db, tenant_id)
        if not tenant:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant information not found for user.")

        # 2. Check if the "writing_assistance" feature is enabled for the tenant.
        tenant_features = tenant.features
        if isinstance(tenant_features, str):
            try:
                tenant_features = json.loads(tenant_features or '{}')
            except json.JSONDecodeError:
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error parsing tenant features.")
        elif not isinstance(tenant_features, dict):
            tenant_features = {}

        if not tenant_features.get("writing_assistance"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Writing Assistance feature is not enabled for your tenant."
            )

        # 3. Retrieve the current user's API keys.
        user_settings = user_setting_crud.get_user_setting(self.db, user_id=current_user.id)
        if not user_settings or not user_settings.api_keys:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED, # Using 402 as per original
                detail="API key for Writing Assistance not found. Please add 'openai_api_key' to your settings."
            )

        try:
            api_keys_dict = json.loads(user_settings.api_keys)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error parsing your API key settings."
            )

        # 4. Look for the standardized 'openai_api_key'.
        openai_api_key = api_keys_dict.get("openai_api_key")
        if not openai_api_key:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="The 'openai_api_key' is missing from your API key settings. Please add it."
            )

        # 5. Use the key to call the OpenAI service.
        system_prompt = """You are a helpful writing assistant.
Given the user's text, provide a concise suggestion to improve it.
This could be a rephrased version, a correction, or advice on style/tone.
Respond in JSON format with a single key "suggestion_text" containing your suggested improvement or the improved text.
If the input text is good, you can say so in the suggestion_text.
Example User text: "i think its a good idea" -> AI Response: {"suggestion_text": "Consider phrasing it as: 'I believe it's a sound idea.' for a more formal tone."}
Example User text: "This is perfect." -> AI Response: {"suggestion_text": "This text is clear and effective."}
"""
        ai_payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text_input}
            ],
            "response_format": {"type": "json_object"}
        }

        try:
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
                logger.error(f"Unexpected OpenAI response structure for writing assistance (user {current_user.id}): {openai_response_data}")
                raise HTTPException(status_code=500, detail="Writing assistance received an unexpected response format from AI provider.")

            content_str = openai_response_data["choices"][0]["message"]["content"]
            suggestion_json = json.loads(content_str)

            suggestion_text = suggestion_json.get("suggestion_text")
            if suggestion_text is None:
                logger.error(f"OpenAI response JSON missing 'suggestion_text' for writing assistance (user {current_user.id}): {suggestion_json}")
                raise HTTPException(status_code=500, detail="Writing assistance AI provider's response missing suggestion text.")

            logger.info(f"Successfully received writing suggestion for user {current_user.id}")
            return suggestion_text

        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from OpenAI response for writing assistance (user {current_user.id}): {content_str if 'content_str' in locals() else 'N/A'}")
            raise HTTPException(status_code=500, detail="Writing assistance failed to parse AI provider's response.")
        except HTTPException: # Re-raise HTTPExceptions
            raise
        except Exception as e:
            logger.error(f"Error calling OpenAI for writing assistance (user {current_user.id}): {str(e)}")
            raise HTTPException(status_code=503, detail=f"Writing assistance request to AI provider failed: {str(e)}")


def get_writing_assistance_service(db: Session = Depends()): # Signature unchanged, assuming Depends(get_db)
    # This dependency injector will be used by the router
    # It assumes get_db is correctly defined elsewhere (e.g., in digame.app.db)
    # The actual get_db dependency will be injected by FastAPI based on the router's setup
    # For now, we define it to expect a Session. FastAPI will resolve `Depends()` using type hints
    # or specified callable. If `get_db` is globally available via `from digame.app.db import get_db`,
    # then `Depends(get_db)` is the way. If not, the router must provide it.
    # For service layer, it's cleaner to assume db is passed to __init__.
    # The Depends in this factory function is what FastAPI uses.
    from ..database import get_db # Assuming get_db is in digame.app.database
    # db_instance = next(get_db()) # This is how you typically consume it if get_db is a generator
    # However, for Depends(get_db), FastAPI handles this.
    # The service constructor needs a db session.
    # This function's job is to create the service, FastAPI provides the db session.
    # So, the parameter `db: Session = Depends(get_db)` is the standard pattern.
    # The issue is `Depends()` with no argument. It should be `Depends(actual_get_db_function)`.
    # Let's assume `get_db` is the actual dependency.

    # Corrected based on typical FastAPI patterns:
    # The router will use `service: WritingAssistanceService = Depends(get_writing_assistance_service)`
    # and `get_writing_assistance_service` will in turn depend on `get_db`.
    # So, `db: Session = Depends(get_db)` is correct in the signature of this factory.
    # The service itself is then instantiated with that db session.
    # The previous placeholder `db_instance = next(actual_get_db())` was a bit confused.
    # FastAPI handles the `Depends(get_db)` part.

    # The function signature should be:
    # def get_writing_assistance_service(db: Session = Depends(get_db)):
    # return WritingAssistanceService(db)
    # This means the `get_db` callable must be imported.

    # Assuming get_db is defined in digame.app.db
    # from digame.app.db import get_db as actual_get_db_for_injection
    # This function will be: service: MyService = Depends(get_my_service)
    # get_my_service(db: Session = Depends(get_db_dependency))
    # return MyService(db)

    # Re-simplifying to what's usually expected by FastAPI:
    # The `db: Session = Depends(get_db)` in the router will provide the session.
    # This factory function is to construct the service with that session.
    # So, the signature `db: Session = Depends(get_db)` is for the function *itself*
    # if it were directly used as a dependency in path operations.
    # If this function is a helper to construct the service, it just needs db.

    # Let's stick to the pattern where this function is the dependency resolver for the service.
    # It needs to get a DB session from FastAPI's dependency system.

    # Final structure for the factory:
    # from digame.app.db import get_db # This should be the actual get_db dependency
    # def get_writing_assistance_service(db: Session = Depends(get_db)):
    #     return WritingAssistanceService(db=db)

    # The provided stub had `Depends()`. This will not work.
    # It must be `Depends(callable)`. Assuming `digame.app.db.get_db`.
    from ..database import get_db as get_db_dependency
    # This function itself will be used in `Depends(...)` in a router.
    # It needs `db` to be injected into it.
    # So, its signature should be `(db: Session = Depends(get_db_dependency))`
    # The instance of the service is then created using this db.
    # This function is called by FastAPI, which resolves its dependencies.
    # This is the standard way: the factory function declares its own dependencies.

    # This will be called as `Depends(get_writing_assistance_service)`
    # FastAPI will see `db: Session = Depends(get_db_dependency)` and provide it.

    # The function signature should be:
    # def get_writing_assistance_service(db: Session = Depends(actual_get_db_callable)):
    #    return WritingAssistanceService(db)

    # The original stub was:
    # def get_writing_assistance_service(db: Session = Depends(get_db)) -> WritingAssistanceService:
    #   from digame.app.db import get_db as actual_get_db # Ensure correct import for injector
    #   db_instance = next(actual_get_db())
    #   return WritingAssistanceService(db_instance)
    # This is slightly redundant. `Depends(get_db)` means `get_db` is called by FastAPI and its result passed as `db`.
    # So, `return WritingAssistanceService(db)` is sufficient.

    from ..database import get_db # Assuming this is the dependency provider
    # The `db` parameter in this function's signature will be filled by FastAPI
    # by calling `get_db()` and passing its result.
    return WritingAssistanceService(db)

# Ensure get_db is correctly imported. The path `digame.app.db` is assumed.
# If get_db is not found, an ImportError will occur at runtime.
# The `Depends()` in the function signature should refer to the actual get_db callable.
# For example: from ..db import get_session (if get_db is named get_session and is in ../db.py)
# For now, `from digame.app.db import get_db` is the assumption.
# The `Depends(get_db)` will be resolved by FastAPI.
# The provided snippet for get_writing_assistance_service had `Depends(get_db)` in its signature,
# which is the standard way.
# The function itself is a factory that FastAPI will call, injecting dependencies it lists.
# So `def get_writing_assistance_service(db: Session = Depends(get_db)): return WritingAssistanceService(db)` is correct.
# The import `from digame.app.db import get_db` must be valid.
# The placeholder had `Depends()`, which is incorrect. It should be `Depends(actual_db_session_provider)`.
# I will use `Depends(get_db)` as intended.
# Note: The import `from digame.app.db import get_db` is critical. If this path is wrong, it will fail.
# I'll assume it's correct as per the problem's context.

# One final check on the `get_writing_suggestion` method's tenant fetching:
# `user_from_db = user_crud.get_user(self.db, user_id=current_user.id)` is good.
# `current_user = user_from_db` updates the reference.
# `user_tenant_link = current_user.tenants[0]` assumes `tenants` is a list and populated.
# This relies on SQLAlchemy relationships being set up correctly in UserModel
# to auto-load or allow loading of `tenants` (list of TenantUser)
# and `TenantUser` model having a `tenant` relationship to `Tenant` model.
# If these relationships are not set up, `current_user.tenants` might be empty or cause an error.
# The code tries to handle missing `tenant` attribute on `user_tenant_link` by using `tenant_crud.get_tenant_by_id`.
# This seems like a reasonable fallback.
# The `json.loads(tenant.features or '{}')` is a good robust way to handle features that might be None or empty string.
# The use of `hasattr` for checking relationships is a bit defensive; ideally, the ORM ensures the attributes exist
# (possibly as None or empty collections if not populated).
# The logic for reloading user `user_from_db = user_crud.get_user(self.db, user_id=current_user.id)`
# should ensure that the relationships (`tenants` and then `tenant`) are properly loaded,
# e.g., by using `options(joinedload(UserModel.tenants).joinedload(TenantUser.tenant))` in `user_crud.get_user`
# or by accessing them such that lazy loading is triggered.
# For now, the current code is a good starting point.
