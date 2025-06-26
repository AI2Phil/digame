from fastapi import APIRouter, Depends, HTTPException, status

from ..auth.auth_dependencies import get_current_active_user
from ..models.user import User as UserModel
from ..services.writing_assistance_service import WritingAssistanceService, get_writing_assistance_service
from ..schemas import writing_assistance_schemas as schemas

router = APIRouter(
    prefix="/ai/writing-assistance",
    tags=["AI - Writing Assistance"],
)

@router.post("/suggest", response_model=schemas.WritingSuggestionResponse)
async def get_writing_suggestion_endpoint(
    request_data: schemas.WritingSuggestionRequest,
    current_user: UserModel = Depends(get_current_active_user),
    service: WritingAssistanceService = Depends(get_writing_assistance_service),
):
    """
    Provides AI-powered writing suggestions for the given text input, optionally using context.
    This feature must be enabled for the user's tenant ('writing_assistance' flag),
    and the user must have a valid 'openai_api_key' in their API key settings.
    """
    try:
        suggestion_text = await service.get_writing_suggestion(
            current_user_id=current_user.id,
            text_input=request_data.text_input,
            context_type=request_data.context_type,
            related_data=request_data.related_data,
            language=request_data.language
        )
        suggestion_data = {
            "original_text": request_data.text_input,
            "suggestion": suggestion_text
        }
        return schemas.WritingSuggestionResponse(**suggestion_data)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while getting writing suggestions: {str(e)}"
        )

@router.post("/generate-from-template", response_model=schemas.GenerateTextResponse)
async def generate_text_from_template_endpoint(
    request_data: schemas.GenerateTextRequest,
    current_user: UserModel = Depends(get_current_active_user),
    service: WritingAssistanceService = Depends(get_writing_assistance_service),
):
    """
    Generates text based on a specified template type and input data.
    Requires the 'smart_templates' feature to be enabled for the user's tenant,
    and a valid 'openai_api_key' in user settings.
    """
    try:
        result = await service.generate_text_from_template(
            current_user_id=current_user.id,
            template_type=request_data.template_type,
            input_data=request_data.input_data,
            tone=request_data.tone,
            language=request_data.language
        )
        # The service method returns a dict that matches GenerateTextResponse structure
        return schemas.GenerateTextResponse(**result)
    except HTTPException as e:
        raise e
    except Exception as e:
        # Log e for detailed error diagnosis
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during template generation: {str(e)}"
        )

# Health check for the router (optional, but good practice)
@router.get("/health", status_code=status.HTTP_200_OK)
async def writing_assistance_health_check():
    return {"status": "healthy", "service": "AI - Writing Assistance"}
