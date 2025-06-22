import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends

# Assuming standard locations for these modules
from digame.app.crud import user_setting_crud
from digame.app.models.user import User as UserModel
from digame.app.db import get_db # For the dependency injector

# Placeholder for an external NLP service client for communication style
class MockExternalCommunicationStyleClient:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("API key must be provided for external communication style service.")
        self.api_key = api_key

    def analyze_style(self, text: str) -> dict:
        # In a real scenario, this would make an HTTP request to an external NLP service
        # For now, it's a mock response.
        if not text:
            return {"error": "Input text cannot be empty."}

        # Example mock analysis based on keywords or key
        if "please" in text.lower() or "could you" in text.lower():
            style = "polite"
        elif "urgent" in text.lower() or "asap" in text.lower():
            style = "assertive"
        elif "perhaps" in text.lower() or "maybe" in text.lower():
            style = "tentative"
        else:
            style = "neutral"

        if self.api_key == "valid_comm_key_premium":
            return {"style": style, "confidence": 0.95, "model_type": "premium", "raw_text_length": len(text)}
        elif self.api_key == "valid_comm_key_standard":
            return {"style": style, "confidence": 0.75, "model_type": "standard", "raw_text_length": len(text)}
        elif self.api_key == "invalid_comm_key":
            raise ValueError("Invalid API key provided to external communication style service.")

        return {"style": style, "confidence": 0.6, "model_type": "basic_mock", "raw_text_length": len(text)}

class CommunicationStyleService:
    def __init__(self, db: Session):
        self.db = db

    def get_communication_style_analysis(self, current_user: UserModel, text_input: str) -> dict:
        if not current_user:
            # This should ideally not happen if current_user is properly injected by FastAPI
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        # 1. Fetch user's tenant information.
        # Assuming current_user.tenants[0].tenant relationship exists as established in previous feature.
        if not hasattr(current_user, 'tenants') or not current_user.tenants:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not associated with any tenant.")

        user_tenant_link = current_user.tenants[0]
        if not hasattr(user_tenant_link, 'tenant'):
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Tenant linkage error for user.")

        tenant = user_tenant_link.tenant

        if not tenant:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant information not found for user.")

        # 2. Check if the "communication_style_analysis" feature is enabled for the tenant.
        try:
            if isinstance(tenant.features, str):
                tenant_features = json.loads(tenant.features or '{}')
            elif isinstance(tenant.features, dict):
                tenant_features = tenant.features
            else:
                tenant_features = {}
        except json.JSONDecodeError:
            # Log error: Tenant features JSON is corrupted for tenant.id
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error reading tenant configuration.")

        if not tenant_features.get("communication_style_analysis"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Communication Style Analysis feature is not enabled for your tenant."
            )

        # 3. Retrieve the current user's API keys.
        user_settings = user_setting_crud.get_user_setting(self.db, user_id=current_user.id)
        if not user_settings or not user_settings.api_keys:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="API key for Communication Style Analysis not found in your settings. Please add it."
            )

        try:
            api_keys_dict = json.loads(user_settings.api_keys)
        except json.JSONDecodeError:
            # Log error: User API keys JSON is corrupted for user_settings.id
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error parsing your API key settings."
            )

        # 4. Look for a specific key.
        communication_service_key = api_keys_dict.get("communication_style_service_key")
        if not communication_service_key:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="The 'communication_style_service_key' is missing from your API key settings."
            )

        # 5. Use the key to call the external service.
        try:
            external_service_client = MockExternalCommunicationStyleClient(api_key=communication_service_key)
            analysis_result = external_service_client.analyze_style(text=text_input)

            if analysis_result.get("error"): # Handle errors from the mock client's response
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error from Communication Style service: {analysis_result['error']}"
                )
            return analysis_result
        except ValueError as e: # Catch API key validation errors from the mock client
            # Log the specific error e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error with Communication Style service API key: {str(e)}"
            )
        except Exception as e:
            # Log the exception e (e.g., logger.error(f"Unexpected error: {e}"))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred while analyzing communication style."
            )

# Dependency injector function
def get_communication_style_service(db: Session = Depends(get_db)) -> CommunicationStyleService:
    """
    Factory function for FastAPI dependency injection.
    Provides an instance of CommunicationStyleService with a DB session.
    """
    return CommunicationStyleService(db)
