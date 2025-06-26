from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from ..auth.auth_dependencies import get_current_active_user # Assuming this provides UserModel directly or compatible
from ..models.user import User as UserModel # Ensure this is the correct User model for dependency
from ..services.document_processing_service import DocumentProcessingService, get_document_processing_service
from ..schemas import document_processing_schemas as schemas # Alias for clarity

router = APIRouter(
    prefix="/ai/document-processing",
    tags=["AI - Document Processing"],
)

@router.post("/summarize", response_model=schemas.DocumentSummarizationResponse)
async def summarize_document_endpoint(
    request_data: schemas.DocumentSummarizationRequest,
    current_user: UserModel = Depends(get_current_active_user),
    service: DocumentProcessingService = Depends(get_document_processing_service),
):
    """
    Summarizes the provided document text.
    Requires the 'document_summarization' feature to be enabled for the user's tenant
    and a valid 'openai_api_key' in user settings.
    """
    try:
        result = await service.summarize_document(
            current_user_id=current_user.id,
            document_text=request_data.document_text,
            summary_length_preference=request_data.summary_length
        )
        return schemas.DocumentSummarizationResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        # Log e for detailed error diagnosis
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Summarization failed: {str(e)}")

@router.post("/extract-action-items", response_model=schemas.DocumentActionItemResponse)
async def extract_action_items_endpoint(
    request_data: schemas.DocumentActionItemRequest,
    current_user: UserModel = Depends(get_current_active_user),
    service: DocumentProcessingService = Depends(get_document_processing_service),
):
    """
    Extracts action items from the provided document text.
    Requires the 'document_action_items' feature to be enabled for the user's tenant
    and a valid 'openai_api_key' in user settings.
    """
    try:
        result = await service.extract_action_items_from_document(
            current_user_id=current_user.id,
            document_text=request_data.document_text
        )
        return schemas.DocumentActionItemResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Action item extraction failed: {str(e)}")

@router.post("/synthesize", response_model=schemas.MultiDocumentSynthesisResponse)
async def synthesize_documents_endpoint(
    request_data: schemas.MultiDocumentSynthesisRequest,
    current_user: UserModel = Depends(get_current_active_user),
    service: DocumentProcessingService = Depends(get_document_processing_service),
):
    """
    Synthesizes information from multiple documents based on a specified goal.
    Requires the 'document_synthesis' feature to be enabled for the user's tenant
    and a valid 'openai_api_key' in user settings.
    """
    try:
        # Convert Pydantic models to dicts for service layer if needed, or pass as is if service expects Pydantic
        documents_data = [doc.model_dump() for doc in request_data.documents]

        result = await service.synthesize_documents(
            current_user_id=current_user.id,
            documents=documents_data, # Pass as list of dicts
            synthesis_goal=request_data.synthesis_goal,
            output_format=request_data.output_format
        )
        return schemas.MultiDocumentSynthesisResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Document synthesis failed: {str(e)}")

@router.get("/health", status_code=status.HTTP_200_OK)
async def document_processing_health_check():
    return {"status": "healthy", "service": "AI - Document Processing"}
