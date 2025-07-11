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
    # New fields from model
    estimated_effort_hours: Optional[float] = None
    deadline: Optional[datetime] = None
    dependencies: Optional[List[int]] = Field(default_factory=list) # List of task IDs
    assigned_resource_id: Optional[int] = None
    calendar_event_id: Optional[str] = None

class TaskCreate(TaskBase):
    # user_id will be set based on the authenticated user or path parameter, not directly in payload
    process_note_id: Optional[int] = None
    # assigned_resource_id is already in TaskBase, so it can be set on creation

class TaskUpdate(BaseModel):
    description: Optional[str] = None
    priority_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    status: Optional[str] = None
    notes: Optional[str] = None
    due_date_inferred: Optional[datetime] = None
    # New fields for update
    estimated_effort_hours: Optional[float] = None
    deadline: Optional[datetime] = None
    dependencies: Optional[List[int]] = None # Allow updating dependencies
    assigned_resource_id: Optional[int] = None # Allow re-assigning
    calendar_event_id: Optional[str] = None # Allow updating calendar link
    
    # Ensure at least one field is provided for update
    # Pydantic v2: model_validator
    # from pydantic import model_validator
    # @model_validator(mode='before')
    # def validate_at_least_one_field(cls, values):
    #     if not values: # If the input dict is empty
    #         raise ValueError("At least one field must be provided for update.")
    #     return values
    # For Pydantic v1 style:
    # class Config:
    #     validate_assignment = True # This is not for this purpose
    # The previous root_validator or classmethod validator is more appropriate if needed.
    # However, FastAPI typically handles empty request bodies gracefully (422).
    # A model-level validation for "at least one field" is often complex with Pydantic's partial updates.
    # It's often handled at the service/router layer if strictness beyond "all fields optional" is needed.
    # For now, let's assume the FastAPI default behavior for partial updates is acceptable.


class TaskResponse(TaskBase):
    id: int
    user_id: int
    process_note_id: Optional[int] = None
    
    # Overriding fields from TaskBase that have defaults, to ensure they are always present in response
    status: str 
    priority_score: Optional[float]

    # Ensure new fields are also in the response
    estimated_effort_hours: Optional[float] = None
    deadline: Optional[datetime] = None
    dependencies: Optional[List[int]] = Field(default_factory=list)
    assigned_resource_id: Optional[int] = None
    calendar_event_id: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
