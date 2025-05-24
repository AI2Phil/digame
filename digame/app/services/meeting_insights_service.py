import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends

from digame.app.crud import user_setting_crud
from digame.app.models.user import User as UserModel
from digame.app.db import get_db # For the dependency injector

# Placeholder for an external NLP service client for meeting insights
class MockExternalMeetingInsightsClient:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("API key must be provided for external meeting insights service.")
        self.api_key = api_key

    def analyze_meeting_text(self, text: str) -> dict:
        if not text:
            return {"error": "Input meeting text cannot be empty."}
        
        summary = f"This is a mock summary of the meeting: {text[:100]}..."
        key_points = [
            f"Mock key point 1 from text: {text[10:50]}",
            f"Mock key point 2 from text: {text[50:90]}"
        ]
        action_items = [
            "Mock action item 1: Follow up on topic X.",
            "Mock action item 2: Schedule next meeting."
        ]

        if len(text) < 50: # Arbitrary condition for mock
             action_items.append("Consider providing more detailed meeting notes for better insights.")

        if self.api_key == "valid_meeting_key_premium":
            return {
                "summary": summary, 
                "key_points": key_points, 
                "action_items": action_items,
                "analysis_level": "premium",
                "text_length": len(text)
            }
        elif self.api_key == "valid_meeting_key_standard":
            return {
                "summary": summary, 
                "key_points": key_points[:1], # Fewer key points for standard
                "action_items": action_items[:1], # Fewer action items
                "analysis_level": "standard",
                "text_length": len(text)
            }
        elif self.api_key == "invalid_meeting_key":
            raise ValueError("Invalid API key provided to external meeting insights service.")
        
        return {
            "summary": f"Basic mock summary of: {text[:50]}...",
            "key_points": [key_points[0]],
            "action_items": [action_items[0]],
            "analysis_level": "basic_mock",
            "text_length": len(text)
        }

class MeetingInsightsService:
    def __init__(self, db: Session):
        self.db = db

    def get_meeting_analysis(self, current_user: UserModel, meeting_text: str) -> dict:
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        # Assuming current_user.tenants and current_user.tenants[0].tenant are valid.
        # Proper error handling for these relationships would be important in a real app.
        if not hasattr(current_user, 'tenants') or not current_user.tenants:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not associated with any tenant.")
        
        user_tenant_link = current_user.tenants[0] 
        if not hasattr(user_tenant_link, 'tenant'):
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Tenant linkage error for user.")
            
        tenant = user_tenant_link.tenant 
        
        if not tenant:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant information not found for user.")

        try:
            # Ensure tenant.features is parsed correctly, whether it's already a dict or a JSON string
            if isinstance(tenant.features, str):
                tenant_features = json.loads(tenant.features or '{}')
            elif isinstance(tenant.features, dict):
                tenant_features = tenant.features
            else: # Default to empty if it's None or some other unexpected type
                tenant_features = {}
        except json.JSONDecodeError:
            # Log error: Tenant features JSON is corrupted for tenant.id
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error reading tenant configuration.")

        if not tenant_features.get("meeting_insights"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Meeting Insights feature is not enabled for your tenant."
            )

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=current_user.id)
        if not user_settings or not user_settings.api_keys:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="API key for Meeting Insights not found in your settings. Please add it."
            )

        try:
            api_keys_dict = json.loads(user_settings.api_keys)
        except json.JSONDecodeError:
            # Log error: User API keys JSON is corrupted for user_settings.id
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error parsing your API key settings."
            )

        insights_service_key = api_keys_dict.get("meeting_insights_service_key")
        if not insights_service_key:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="The 'meeting_insights_service_key' is missing from your API key settings."
            )

        try:
            external_service_client = MockExternalMeetingInsightsClient(api_key=insights_service_key)
            analysis_result = external_service_client.analyze_meeting_text(text=meeting_text)
            
            if analysis_result.get("error"): # Handle errors from the mock client's response
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error from Meeting Insights service: {analysis_result['error']}"
                )
            return analysis_result
        except ValueError as e: # Catch API key validation errors from the mock client
            # Log the specific error e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error with Meeting Insights service API key: {str(e)}"
            )
        except Exception as e: 
            # Log the exception e (e.g., logger.error(f"Unexpected error: {e}"))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred while generating meeting insights."
            )

# Dependency injector function
def get_meeting_insights_service(db: Session = Depends(get_db)) -> MeetingInsightsService:
    """
    Factory function for FastAPI dependency injection.
    Provides an instance of MeetingInsightsService with a DB session.
    """
    return MeetingInsightsService(db)
