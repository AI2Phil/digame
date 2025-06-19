from fastapi import APIRouter, Depends, HTTPException, status

from digame.app.auth.auth_dependencies import get_current_active_user
from digame.app.models.user import User as UserModel
from digame.app.services.language_learning_service import LanguageLearningService, get_language_learning_service
from digame.app.schemas import language_learning_schemas as schemas

router = APIRouter(
    prefix="/ai/language",
    tags=["AI - Language Learning Support"],
)

@router.post("/translate", response_model=schemas.TranslationResponse)
def translate_text_endpoint(
    request_data: schemas.TranslationRequest,
    current_user: UserModel = Depends(get_current_active_user),
    service: LanguageLearningService = Depends(get_language_learning_service),
):
    """
    Translates the provided text to the target language.
    Requires the 'language_learning_support' feature to be enabled for the tenant
    and a valid 'language_learning_api_key' in user settings.
    """
    try:
        result = service.translate_text(
            current_user=current_user,
            text=request_data.text,
            target_language=request_data.target_language,
            source_language=request_data.source_language
        )
        # The service already returns a dict that should match the response schema fields
        return schemas.TranslationResponse(**result)
    except HTTPException as e:
        raise e
    except Exception as e:
        # Log error e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during translation: {str(e)}"
        )

@router.post("/define", response_model=schemas.DefinitionResponse)
def define_word_endpoint(
    request_data: schemas.DefinitionRequest,
    current_user: UserModel = Depends(get_current_active_user),
    service: LanguageLearningService = Depends(get_language_learning_service),
):
    """
    Provides a definition and example for the given word in the specified language.
    Requires the 'language_learning_support' feature to be enabled for the tenant
    and a valid 'language_learning_api_key' in user settings.
    """
    try:
        result = service.get_vocabulary_definition(
            current_user=current_user,
            word=request_data.word,
            language=request_data.language
        )
        # The service already returns a dict that should match the response schema fields
        return schemas.DefinitionResponse(**result)
    except HTTPException as e:
        raise e
    except Exception as e:
        # Log error e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching definition: {str(e)}"
        )

@router.get("/health", status_code=status.HTTP_200_OK)
async def language_learning_health_check():
    return {"status": "healthy", "service": "AI - Language Learning Support"}
