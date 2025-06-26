from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any, Union # Added Union
from datetime import datetime # For potential timestamp fields

class EmailDataItem(BaseModel):
    id: Optional[str] = Field(None, description="Unique ID of the email, if available.")
    subject: Optional[str] = Field(None, description="Subject of the email.")
    sender: Optional[EmailStr] = Field(None, description="Sender's email address.")
    recipients_to: Optional[List[EmailStr]] = Field(default_factory=list, description="List of 'To' recipients.")
    recipients_cc: Optional[List[EmailStr]] = Field(default_factory=list, description="List of 'Cc' recipients.")
    timestamp: Optional[datetime] = Field(None, description="Timestamp of when the email was sent or received.")
    body_snippet: Optional[str] = Field(None, description="A short snippet of the email body (anonymized if necessary).")
    # Add other relevant fields as needed, e.g., labels, folder

class EmailAnalysisRequest(BaseModel):
    emails_data: List[EmailDataItem] = Field(..., min_items=1, description="List of email data items to be analyzed.")
    # analysis_preferences: Optional[Dict[str, Any]] = Field(None, description="Preferences for the type of analysis to run.")

class EmailAnalysisResponse(BaseModel):
    analysis_summary: Dict[str, Any] = Field(..., description="Summary of the email pattern analysis.")
    # Example structure for 'analysis_summary' from the service:
    # {
    #     "total_emails_analyzed": 10,
    #     "most_common_subject_keywords": [("report", 5), ("update", 3)],
    #     "analysis_type": "internal_basic"
    # }
    # OR for external:
    # {
    #     "total_emails_processed": 10,
    #     "sentiment_score": 0.75,
    #     "common_keywords": ["report", "meeting"],
    #     "peak_communication_time": "10:00-11:00 AM",
    #     "external_analysis_provider": "MockExternalProvider"
    # }
    error_message: Optional[str] = None
