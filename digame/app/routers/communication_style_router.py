from fastapi import APIRouter, Depends, HTTPException, status

from digame.app.auth.auth_dependencies import get_current_active_user
from digame.app.models.user import User as UserModel
from digame.app.services.communication_style_service import CommunicationStyleService, get_communication_style_service
from digame.app.schemas import communication_style_schemas as schemas

router = APIRouter(
    prefix="/ai/communication-style",
    tags=["AI - Communication Style Analysis"],
)

@router.post("/analyze", response_model=schemas.CommunicationStyleAnalysisResponse)
def analyze_communication_style_endpoint(
    request_data: schemas.CommunicationStyleAnalysisRequest,
    current_user: UserModel = Depends(get_current_active_user),
    service: CommunicationStyleService = Depends(get_communication_style_service),
):
    """
    Analyzes the provided text to determine its communication style.
    This feature must be enabled for the user's tenant, and the user
    must have a valid 'communication_style_service_key' in their API key settings.
    """
    try:
        analysis_result = service.get_communication_style_analysis(
            current_user=current_user,
            text_input=request_data.text_input
        )
        return schemas.CommunicationStyleAnalysisResponse(
            original_text_length=len(request_data.text_input),
            analysis=analysis_result
        )
    except HTTPException as e:
        # Re-raise HTTPExceptions directly from the service
        raise e
    except Exception as e:
        # Log the error e in a real application
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during communication style analysis: {str(e)}"
        )

@router.get("/health", status_code=status.HTTP_200_OK)
async def communication_style_health_check():
    return {"status": "healthy", "service": "AI - Communication Style Analysis"}
