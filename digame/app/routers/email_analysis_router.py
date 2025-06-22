from fastapi import APIRouter, Depends, HTTPException, status
from typing import List # Not strictly needed here but often useful in routers

from digame.app.auth.auth_dependencies import get_current_active_user
from digame.app.models.user import User as UserModel
from digame.app.services.email_analysis_service import EmailAnalysisService, get_email_analysis_service
from digame.app.schemas import email_analysis_schemas as schemas

router = APIRouter(
    prefix="/ai/email-analysis",
    tags=["AI - Email Pattern Analysis"],
)

@router.post("/analyze", response_model=schemas.EmailAnalysisResponse)
def analyze_email_patterns_endpoint(
    request_data: schemas.EmailAnalysisRequest,
    current_user: UserModel = Depends(get_current_active_user),
    service: EmailAnalysisService = Depends(get_email_analysis_service),
):
    """
    Analyzes provided email data to identify patterns and insights.
    This feature must be enabled for the user's tenant. If an external analysis
    service is used, the user must have a valid 'email_analysis_service_key'
    in their API key settings. Otherwise, basic internal analysis is performed.
    """
    try:
        analysis_result = service.analyze_email_data(
            current_user=current_user,
            emails_data=request_data.emails_data
        )
        return schemas.EmailAnalysisResponse(
            analysis_summary=analysis_result
        )
    except HTTPException as e:
        # Re-raise HTTPExceptions directly from the service
        raise e
    except Exception as e:
        # Log the error e in a real application
        # import logging
        # logging.exception("Error in email analysis endpoint")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during email pattern analysis: {str(e)}"
        )

@router.get("/health", status_code=status.HTTP_200_OK)
async def email_analysis_health_check():
    return {"status": "healthy", "service": "AI - Email Pattern Analysis"}
