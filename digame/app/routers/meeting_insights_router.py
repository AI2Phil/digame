from fastapi import APIRouter, Depends, HTTPException, status

from digame.app.auth.auth_dependencies import get_current_active_user
from digame.app.models.user import User as UserModel
from digame.app.services.meeting_insights_service import MeetingInsightsService, get_meeting_insights_service
from digame.app.schemas import meeting_insights_schemas as schemas

router = APIRouter(
    prefix="/ai/meeting-insights",
    tags=["AI - Meeting Insights & Summaries"],
)

@router.post("/analyze", response_model=schemas.MeetingAnalysisResponse)
def analyze_meeting_text_endpoint(
    request_data: schemas.MeetingAnalysisRequest,
    current_user: UserModel = Depends(get_current_active_user),
    service: MeetingInsightsService = Depends(get_meeting_insights_service),
):
    """
    Analyzes the provided meeting text to generate a summary, key discussion points, and action items.
    This feature must be enabled for the user's tenant, and the user
    must have a valid 'meeting_insights_service_key' in their API key settings.
    """
    try:
        analysis_result = service.get_meeting_analysis(
            current_user=current_user,
            meeting_text=request_data.meeting_text
        )
        return schemas.MeetingAnalysisResponse(
            original_text_length=len(request_data.meeting_text),
            analysis=analysis_result
        )
    except HTTPException as e:
        # Re-raise HTTPExceptions directly from the service
        raise e
    except Exception as e:
        # Log the error e in a real application
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during meeting analysis: {str(e)}"
        )

@router.get("/health", status_code=status.HTTP_200_OK)
async def meeting_insights_health_check():
    return {"status": "healthy", "service": "AI - Meeting Insights & Summaries"}
