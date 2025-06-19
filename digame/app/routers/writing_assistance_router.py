from fastapi import APIRouter, Depends, HTTPException, status
# sqlalchemy.orm.Session is not directly used here but service might need it via get_db

from digame.app.auth.auth_dependencies import get_current_active_user
from digame.app.models.user import User as UserModel
from digame.app.services.writing_assistance_service import WritingAssistanceService, get_writing_assistance_service
from digame.app.schemas import writing_assistance_schemas as schemas

router = APIRouter(
    prefix="/ai/writing-assistance",
    tags=["AI - Writing Assistance"],
)

@router.post("/suggest", response_model=schemas.WritingSuggestionResponse)
def get_writing_suggestion_endpoint(
    request_data: schemas.WritingSuggestionRequest,
    current_user: UserModel = Depends(get_current_active_user),
    service: WritingAssistanceService = Depends(get_writing_assistance_service),
):
    """
    Provides AI-powered writing suggestions for the given text input.
    This feature must be enabled for the user's tenant, and the user
    must have a valid 'writing_service_key' in their API key settings.
    """
    try:
        suggestion_text = service.get_writing_suggestion(
            current_user=current_user,
            text_input=request_data.text_input
        )
        return schemas.WritingSuggestionResponse(
            original_text=request_data.text_input,
            suggestion=suggestion_text
        )
    except HTTPException as e:
        # Re-raise HTTPExceptions directly if they are from the service
        raise e
    except Exception as e:
        # Catch any other unexpected errors from the service
        # Remember to log the error e in a real application
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

# Health check for the router (optional, but good practice)
@router.get("/health", status_code=status.HTTP_200_OK)
async def writing_assistance_health_check():
    return {"status": "healthy", "service": "AI - Writing Assistance"}
