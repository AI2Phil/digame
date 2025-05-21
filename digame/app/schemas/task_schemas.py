from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Task Schemas ---

class TaskBase(BaseModel):
    description: str
    source_type: Optional[str] = None
    source_identifier: Optional[str] = None
    priority_score: Optional[float] = Field(default=0.5, ge=0.0, le=1.0) # Constrain priority
    status: str = Field(default='suggested')
    notes: Optional[str] = None
    due_date_inferred: Optional[datetime] = None

class TaskCreate(TaskBase):
    # user_id will be set based on the authenticated user or path parameter, not directly in payload
    # process_note_id might be set if task is derived from a process note
    process_note_id: Optional[int] = None 
    # If tasks can be created manually without linking to a process note, this is fine.

class TaskUpdate(BaseModel):
    description: Optional[str] = None
    priority_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    status: Optional[str] = None # Could add validation for allowed status values
    notes: Optional[str] = None
    due_date_inferred: Optional[datetime] = None
    
    # Ensure at least one field is provided for update
    @classmethod
    def validate_at_least_one_field(cls, values):
        if not any(field is not None for field in values.values()): # Check if any field is not None
            raise ValueError("At least one field must be provided for update.")
        return values

class TaskResponse(TaskBase):
    id: int
    user_id: int # Assuming User.id is an integer
    process_note_id: Optional[int] = None
    
    # Overriding fields from TaskBase that have defaults, to ensure they are always present in response
    status: str 
    priority_score: Optional[float] # Keep as Optional if it can be None in DB, or provide default if not

    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
