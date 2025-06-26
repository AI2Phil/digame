from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class WritingSuggestionRequest(BaseModel):
    text_input: str = Field(..., min_length=1, description="Text to get writing suggestions for.")
    context_type: Optional[str] = Field(None, description="Type of content being written (e.g., 'email_reply', 'task_description', 'performance_review_feedback').")
    related_data: Optional[Dict[str, Any]] = Field(None, description="Additional data related to the context (e.g., original email for an 'email_reply').")
    language: Optional[str] = Field("en", description="Language of the text input (e.g., 'en', 'es').")
    # Potentially add other parameters like 'tone', 'style' in the future. Tone will be added for templates.

class WritingSuggestionResponse(BaseModel):
    original_text: str
    suggestion: str
    # Potentially add 'confidence_score', 'alternative_suggestions' in the future
    error_message: Optional[str] = None # To pass along errors from the service if needed


# --- Smart Template Schemas ---
class GenerateTextRequest(BaseModel):
    template_type: str = Field(..., description="Type of template to generate (e.g., 'project_update_summary', 'meeting_minutes_outline').")
    input_data: Dict[str, Any] = Field(..., description="Key-value pairs of data to populate the template.")
    tone: Optional[str] = Field("professional", description="Desired tone for the generated text (e.g., 'professional', 'casual', 'friendly').")
    language: Optional[str] = Field("en", description="Language for the generated text (e.g., 'en', 'es').")

class GenerateTextResponse(BaseModel):
    template_type: str
    generated_text: str
    provider: Optional[str] = None
    error_message: Optional[str] = None
