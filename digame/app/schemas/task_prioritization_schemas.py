from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime # For due_date_inferred

class PrioritizationRequest(BaseModel):
    apply_changes: bool = Field(default=False, description="If True, suggested priorities will be saved to the database.")
    # We might add filters here in the future, e.g., specific task IDs, projects, etc.
    # For now, it operates on all active tasks for the user.

class PrioritizedTaskDetail(BaseModel):
    id: int
    description: str
    status: str
    due_date_inferred: Optional[datetime] = None
    original_priority_score: Optional[float] = None
    suggested_priority_score: float

class PrioritizationResponse(BaseModel):
    message: str
    processed_task_count: int
    prioritized_tasks: List[PrioritizedTaskDetail]
    changes_applied: bool
