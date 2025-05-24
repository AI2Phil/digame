from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class CommunicationStyleAnalysisRequest(BaseModel):
    text_input: str = Field(..., min_length=10, description="Text to be analyzed for communication style. Minimum 10 characters.")
    # Future potential fields: context_type (e.g., 'email', 'chat', 'report')

class CommunicationStyleAnalysisResponse(BaseModel):
    original_text_length: int
    analysis: Dict[str, Any] = Field(..., description="Detailed analysis results from the NLP service.")
    # Example: {"style": "assertive", "confidence": 0.85, "keywords": ["asap", "urgent"]}
    error_message: Optional[str] = None
