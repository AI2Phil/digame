from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProcessNoteBase(BaseModel):
    inferred_task_name: Optional[str] = None
    process_steps_description: str
    source_activity_ids: Optional[List[int]] = Field(default_factory=list)
    occurrence_count: int
    user_feedback: Optional[str] = None
    user_tags: Optional[List[str]] = Field(default_factory=list)

class ProcessNoteResponse(ProcessNoteBase):
    id: int
    user_id: int # Assuming User.id is an integer
    first_observed_at: datetime
    last_observed_at: datetime

    class Config:
        orm_mode = True

# Schema for the trigger response
class ProcessDiscoveryResponse(BaseModel):
    message: str
    user_id: int
    new_notes_created: Optional[int] = None # Optional: service could return this
    notes_updated: Optional[int] = None     # Optional: service could return this

# Schema for updating feedback and tags on a ProcessNote
class ProcessNoteFeedbackUpdate(BaseModel):
    user_feedback: Optional[str] = None
    user_tags: Optional[List[str]] = None

    # Allow at least one field to be present for an update
    @classmethod
    def validate_at_least_one_field(cls, values):
        if not any(values.values()):
            raise ValueError("At least one field (user_feedback or user_tags) must be provided for update.")
        return values
