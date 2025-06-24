from fastapi import APIRouter, Depends, HTTPException, status

from ..auth.auth_dependencies import get_current_active_user
from ..models.user import User as UserModel
from ..services.meeting_insights_service import MeetingInsightsService, get_meeting_insights_service
from ..schemas import meeting_insights_schemas as schemas

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
    Analyzes the provided meeting text to generate a summary, key discussion points, action items,
    and optionally, a draft follow-up email.
    This feature must be enabled for the user's tenant, and the user
    must have a valid 'openai_api_key' in their API key settings.
    """
    try:
        # The service method now expects current_user_id instead of the full UserModel object
        analysis_result_dict = await service.get_meeting_analysis(
            current_user_id=current_user.id,
            meeting_text=request_data.meeting_text,
            generate_draft_email=request_data.generate_draft_email
        )
        # The service returns a dict, which matches MeetingAnalysisData structure
        response_data = {
            "original_text_length": len(request_data.meeting_text),
            "analysis": schemas.MeetingAnalysisData(**analysis_result_dict)
        }
        return schemas.MeetingAnalysisResponse(**response_data)
    except HTTPException as e:
        # Re-raise HTTPExceptions directly from the service
        raise e
    except Exception as e:
        # Log the error e in a real application
        # logger.error(f"Unexpected error in analyze_meeting_text_endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during meeting analysis: {str(e)}"
        )

@router.get("/health", status_code=status.HTTP_200_OK)
async def meeting_insights_health_check():
    return {"status": "healthy", "service": "AI - Meeting Insights & Summaries"}
