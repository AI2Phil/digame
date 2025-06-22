"""
Pydantic schemas for Mobile AI features, including notifications and voice commands.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Notification Schemas ---

class UserNotificationPrefsRequest(BaseModel):
    notification_enabled_types: List[str] = Field(default_factory=list, examples=[["task_updates", "daily_summary"]])
    preferred_times: Optional[List[str]] = Field(default=None, examples=[["09:00", "17:00"]]) # e.g., "HH:MM"
    behavior_summary: Optional[Dict[str, Any]] = Field(default=None, examples=[{"avg_tasks_completed_daily": 5}])

class NotificationPrefsResponse(BaseModel):
    status: str = "success"
    message: str

class NotificationTrigger(BaseModel):
    trigger_type: str
    message_template: str
    absolute_scheduled_time_utc: Optional[datetime] = None
    relative_schedule_info: Optional[Dict[str, Any]] = Field(default=None, examples=[{"type": "daily_at", "time": "09:00"}])
    condition: Optional[Dict[str, Any]] = Field(default=None)
    presentation_options: Optional[Dict[str, Any]] = Field(default=None)

class NotificationTriggersResponse(BaseModel):
    triggers: List[NotificationTrigger]
    generated_at: datetime = Field(default_factory=datetime.utcnow)

# --- Voice Command Schemas ---

class VoiceCommandRequest(BaseModel):
    text: str = Field(..., examples=["go to my dashboard", "create a new task called Buy Groceries"])
    language: Optional[str] = Field("en-US", examples=["en-US", "es-ES"])
    # Optional context from the mobile app that might help interpretation
    # current_screen: Optional[str] = Field(default=None, examples=["HomeScreen", "TaskListScreen"])
    # session_id: Optional[str] = Field(default=None, description="To maintain conversational context if needed")

class VoiceCommandResponse(BaseModel):
    intent: str = Field(..., examples=["navigate_to_screen", "create_task", "unknown_command"])
    parameters: Optional[Dict[str, Any]] = Field(default=None, examples=[{"screen_name": "Dashboard"}, {"task_title": "Buy Groceries"}])
    responseText: Optional[str] = Field(default=None, description="Text to speak back to the user or display", examples=["Navigating to Dashboard.", "OK. What are the details for 'Buy Groceries'?"])
    # Optional: follow_up_prompt: Optional[str] = Field(default=None, description="If further interaction is needed")
    # Optional: confidence_score: Optional[float] = Field(default=None, description="NLU confidence in the interpretation")

```
