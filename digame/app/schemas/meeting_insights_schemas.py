from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class MeetingAnalysisRequest(BaseModel):
    meeting_text: str = Field(..., min_length=50, description="Full text of the meeting notes or transcript. Minimum 50 characters.")
    # Future: Could include meeting_date, attendees, etc.

class MeetingAnalysisResponse(BaseModel):
    original_text_length: int
    analysis: Dict[str, Any] = Field(..., description="Structured analysis including summary, key points, and action items.")
    # Example structure for 'analysis' from the mock client:
    # {
    #     "summary": "This is a mock summary...",
    #     "key_points": ["Mock key point 1...", "Mock key point 2..."],
    #     "action_items": ["Mock action item 1...", "Mock action item 2..."],
    #     "analysis_level": "premium",
    #     "text_length": 123
    # }
    error_message: Optional[str] = None
