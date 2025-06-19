import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from typing import List, Dict, Any, Optional
from collections import Counter
import re # For simple pattern matching if needed

from digame.app.crud import user_setting_crud
from digame.app.models.user import User as UserModel
from digame.app.db import get_db # For the dependency injector

# Placeholder for an external NLP service client for email analysis
class MockExternalEmailAnalysisClient:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("API key must be provided for external email analysis service.")
        self.api_key = api_key

    def analyze_emails(self, emails: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not emails:
            return {"error": "Email data cannot be empty."}

        num_emails = len(emails)
        # Example analysis
        analysis = {
            "total_emails_processed": num_emails,
            "sentiment_score": 0.75, # Mocked
            "common_keywords": ["report", "meeting", "update"], # Mocked
            "peak_communication_time": "10:00-11:00 AM", # Mocked
            "external_analysis_provider": "MockExternalProvider"
        }
        if self.api_key == "invalid_email_key":
            raise ValueError("Invalid API key for external email analysis.")
        return analysis

class EmailAnalysisService:
    def __init__(self, db: Session):
        self.db = db

    def _perform_internal_analysis(self, emails: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not emails:
            return {"error": "No email data to analyze."}

        num_emails = len(emails)
        subjects = [email.get("subject", "").lower() for email in emails if email.get("subject")]

        subject_keywords = Counter()
        for subj in subjects:
            words = re.findall(r'\b\w{3,}\b', subj) # Basic word tokenization (3+ chars), fixed regex
            subject_keywords.update(words)

        # This is a very basic internal analysis
        return {
            "total_emails_analyzed": num_emails,
            "most_common_subject_keywords": subject_keywords.most_common(5) if subject_keywords else [],
            "analysis_type": "internal_basic"
        }

    def analyze_email_data(self, current_user: UserModel, emails_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        if not hasattr(current_user, 'tenants') or not current_user.tenants: # Check for attribute and if list is empty
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not associated with any tenant.")

        user_tenant_link = current_user.tenants[0]
        if not hasattr(user_tenant_link, 'tenant'): # Check if the link object has a tenant attribute
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Tenant linkage error for user.")

        tenant = user_tenant_link.tenant

        if not tenant: # Should be redundant if the above checks are fine
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant information not found for user.")

        try:
            tenant_features = tenant.features if isinstance(tenant.features, dict) else json.loads(tenant.features or '{}')
        except json.JSONDecodeError:
            # Log error: Tenant features JSON is corrupted for tenant.id
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error reading tenant configuration.")

        if not tenant_features.get("email_pattern_analysis"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email Pattern Analysis feature is not enabled for your tenant."
            )

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=current_user.id)
        api_keys_dict: Optional[Dict[str, str]] = None
        if user_settings and user_settings.api_keys:
            try:
                api_keys_dict = json.loads(user_settings.api_keys)
            except json.JSONDecodeError:
                # Log this error (e.g., logger.warning("Failed to parse API keys for user %s", current_user.id))
                api_keys_dict = None

        email_analysis_service_key = api_keys_dict.get("email_analysis_service_key") if api_keys_dict else None

        if email_analysis_service_key:
            # User has provided a key, attempt to use external service
            try:
                external_client = MockExternalEmailAnalysisClient(api_key=email_analysis_service_key)
                analysis_result = external_client.analyze_emails(emails=emails_data)

                if analysis_result.get("error"): # Check for errors from the mock client itself
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Error from Email Analysis service: {analysis_result['error']}"
                    )
                return analysis_result
            except ValueError as e: # From Mock client API key validation or other ValueErrors
                # Log the specific error e
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error with Email Analysis service API key or data: {str(e)}"
                )
            except Exception as e:
                # Log the exception e (e.g., logger.error(f"Unexpected external service error: {e}"))
                # Fallback to internal analysis or raise error depending on policy
                # For now, let's raise an error if external service fails with a key
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"External Email Analysis service failed: {str(e)}. Please try again later."
                )
        else:
            # No specific API key provided by the user for this service, perform internal analysis
            # This path can be expanded or made conditional (e.g. only if tenant allows internal processing for this feature)
            return self._perform_internal_analysis(emails=emails_data)

# Dependency injector function
def get_email_analysis_service(db: Session = Depends(get_db)) -> EmailAnalysisService:
    """
    Factory function for FastAPI dependency injection.
    Provides an instance of EmailAnalysisService with a DB session.
    """
    return EmailAnalysisService(db)
