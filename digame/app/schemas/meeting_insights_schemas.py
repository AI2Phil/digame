from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class MeetingAnalysisRequest(BaseModel):
    meeting_text: str = Field(..., min_length=50, description="Full text of the meeting notes or transcript. Minimum 50 characters.")
    generate_draft_email: Optional[bool] = Field(False, description="If true, a draft follow-up email will be generated.")
    # Future: Could include meeting_date, attendees, etc.

class StructuredActionItem(BaseModel):
    action: str = Field(..., description="The description of the action item.")
    assignee: Optional[str] = Field(None, description="Person or entity responsible for the action item.")
    due_text: Optional[str] = Field(None, description="Textual reference to the due date or deadline if mentioned (e.g., 'next Friday', 'by EOD').")

class MeetingAnalysisData(BaseModel):
    summary: str
    key_points: List[str]
    action_items: List[StructuredActionItem] # Changed from List[str]
    draft_email: Optional[str] = None
    # Retaining for flexibility, though specific fields are now defined
    # additional_details: Optional[Dict[str, Any]] = None
    text_length: Optional[int] = None # Can be populated by the service
    model_provider: Optional[str] = None # Can be populated by the service


class MeetingAnalysisResponse(BaseModel):
    original_text_length: int
    analysis: MeetingAnalysisData # Using a structured Pydantic model for 'analysis'
    error_message: Optional[str] = None
