from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# --- Document Summarization Schemas ---
class DocumentSummarizationRequest(BaseModel):
    document_text: str = Field(..., min_length=50, description="The text of the document to be summarized. Minimum 50 characters.")
    summary_length: Optional[str] = Field("medium", description="Desired summary length: 'short', 'medium', or 'long'.")
    # Potentially add output_format: 'paragraph' or 'bullet_points'

class DocumentSummarizationResponse(BaseModel):
    original_text_length: int
    summary: str
    model_provider: Optional[str] = None
    error_message: Optional[str] = None

# --- Multi-Document Synthesis Schemas ---
class SingleDocumentInput(BaseModel):
    identifier: Optional[str] = None # Optional name/ID for the document
    text_content: str = Field(..., min_length=50, description="Text content of one document.")

class MultiDocumentSynthesisRequest(BaseModel):
    documents: List[SingleDocumentInput] = Field(..., min_items=2, description="A list of documents to synthesize. Requires at least two documents.")
    synthesis_goal: Optional[str] = Field(
        "Provide a comprehensive overview highlighting common themes and key differences.",
        description="A specific instruction for the synthesis (e.g., 'compare methodologies', 'extract shared conclusions', 'identify conflicting information')."
    )
    output_format: Optional[str] = Field("paragraph", description="Desired output format: 'paragraph' or 'bullet_points'.")

class MultiDocumentSynthesisResponse(BaseModel):
    original_document_count: int
    synthesis_result: str
    model_provider: Optional[str] = None
    error_message: Optional[str] = None

# --- Document Action Item Extraction Schemas ---
class DocumentActionItemRequest(BaseModel):
    document_text: str = Field(..., min_length=20, description="The text of the document from which to extract action items. Minimum 20 characters.")

class DocumentActionItemResponse(BaseModel):
    original_text_length: int
    action_items: List[str]
    model_provider: Optional[str] = None
    error_message: Optional[str] = None

# General purpose error schema if needed for other responses
class DocumentProcessingErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
