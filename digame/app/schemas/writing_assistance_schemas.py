from pydantic import BaseModel, Field
from typing import Optional

class WritingSuggestionRequest(BaseModel):
    text_input: str = Field(..., min_length=1, description="Text to get writing suggestions for.")
    # Potentially add other parameters like 'tone', 'style' in the future

class WritingSuggestionResponse(BaseModel):
    original_text: str
    suggestion: str
    # Potentially add 'confidence_score', 'alternative_suggestions' in the future
    error_message: Optional[str] = None # To pass along errors from the service if needed
