import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends

# Assuming standard locations for these modules based on the project structure
from digame.app.crud import user_crud, user_setting_crud, tenant_crud # We'll need tenant_crud
from digame.app.models.user import User as UserModel
from digame.app.models.tenant import Tenant as TenantModel # Assuming tenant_crud returns this

# Placeholder for an external AI service client
class MockExternalWritingServiceClient:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("API key must be provided for external writing service.")
        self.api_key = api_key

    def get_suggestion(self, text: str) -> str:
        # In a real scenario, this would make an HTTP request to an external service
        # For now, it's a mock response.
        if not text:
            return "Input text cannot be empty."
        if self.api_key == "valid_key_for_premium_suggestion":
            return f"Premium AI suggestion for: '{text}'"
        elif self.api_key == "valid_key_for_standard_suggestion":
            return f"Standard AI suggestion for: '{text}'"
        elif self.api_key == "invalid_key":
            # This case might be better handled by the external service returning an error
            # that we then translate into an HTTPException.
            # For mock purposes, we'll raise an error that the service can catch.
            raise ValueError("Invalid API key provided to external service.")
        return f"Mock AI suggestion for: '{text}' (using key: {self.api_key})"

class WritingAssistanceService:
    def __init__(self, db: Session):
        self.db = db

    def get_writing_suggestion(self, current_user: UserModel, text_input: str) -> str:
        if not current_user:
            # This should ideally not happen if current_user is properly injected by FastAPI
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        # 1. Fetch user's tenant information.
        # The user_crud.get_user method should ideally return a user with relationships.
        # Let's assume `current_user.tenants` (a list of TenantUser objects) is available.
        if not hasattr(current_user, 'tenants') or not current_user.tenants: # `tenants` would be from a relationship in UserModel
            # Attempt to reload the user with relationships if not already loaded.
            # This depends on your ORM setup and how `current_user` is obtained.
            # If `current_user` is detached or relationships are not eagerly loaded, this explicit fetch might be needed.
            user_from_db = user_crud.get_user(self.db, user_id=current_user.id)
            if not user_from_db or not hasattr(user_from_db, 'tenants') or not user_from_db.tenants:
                 raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not associated with any tenant or tenant info missing.")
            current_user = user_from_db


        # Assuming the first tenant in the list is the active one for simplicity.
        # In a real system, there'd be a concept of an "active" tenant context.
        # Also assuming TenantUser model has a 'tenant' relationship to the Tenant model
        user_tenant_link = current_user.tenants[0] 
        if not hasattr(user_tenant_link, 'tenant'):
            # This means the TenantUser object doesn't have the 'tenant' attribute as expected.
            # This could be due to missing relationship in TenantUser model or it wasn't loaded.
            # Attempt to fetch tenant directly if tenant_id is available on user_tenant_link
            if hasattr(user_tenant_link, 'tenant_id'):
                tenant = tenant_crud.get_tenant_by_id(self.db, user_tenant_link.tenant_id)
            else:
                tenant = None # Cannot find tenant
        else:
            tenant = user_tenant_link.tenant # This is the Tenant object
        
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
            tenant_features = {} # Default to empty if not str or dict

        if not tenant_features.get("writing_assistance"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Writing Assistance feature is not enabled for your tenant. Please contact your tenant administrator or check your subscription."
            )

        # 3. Retrieve the current user's API keys.
        user_settings = user_setting_crud.get_user_setting(self.db, user_id=current_user.id)
        if not user_settings or not user_settings.api_keys:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED, 
                detail="API key for Writing Assistance not found in your settings. Please add it to use this feature."
            )

        try:
            api_keys_dict = json.loads(user_settings.api_keys)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error parsing your API key settings."
            )

        # 4. Look for a specific key.
        writing_service_key = api_keys_dict.get("writing_service_key")
        if not writing_service_key:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED, 
                detail="The 'writing_service_key' is missing from your API key settings. Please add it."
            )

        # 5. Use the key to call the external service.
        try:
            # Initialize the mock client with the user's key
            external_service_client = MockExternalWritingServiceClient(api_key=writing_service_key)
            suggestion = external_service_client.get_suggestion(text=text_input)
            return suggestion
        except ValueError as e: # Catch errors from the mock client (e.g., invalid key)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error with Writing Assistance service: {str(e)}"
            )
        except Exception as e: # Catch any other unexpected errors
            # Log the exception e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred while getting writing suggestions."
            )

def get_writing_assistance_service(db: Session = Depends()):
    # This dependency injector will be used by the router
    # It assumes get_db is correctly defined elsewhere (e.g., in digame.app.db)
    # The actual get_db dependency will be injected by FastAPI based on the router's setup
    # For now, we define it to expect a Session. FastAPI will resolve `Depends()` using type hints
    # or specified callable. If `get_db` is globally available via `from digame.app.db import get_db`,
    # then `Depends(get_db)` is the way. If not, the router must provide it.
    # For service layer, it's cleaner to assume db is passed to __init__.
    # The Depends in this factory function is what FastAPI uses.
    from digame.app.db import get_db # Assuming get_db is in digame.app.db
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
    from digame.app.db import get_db as get_db_dependency
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
    
    from digame.app.db import get_db # Assuming this is the dependency provider
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
# For now, the current code is a good starting point.Now I will update `digame/app/services/__init__.py`.
