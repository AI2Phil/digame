import json # Added for validator
from typing import List, Optional
from pydantic import BaseModel, validator # Added validator

class ProjectBase(BaseModel):
    title: str
    description: str
    url: Optional[str] = None
    technologiesUsed: List[str] = []

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    technologiesUsed: Optional[List[str]] = None

class ProjectInDBBase(ProjectBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

class ProjectSchema(ProjectInDBBase):
    @validator('technologiesUsed', pre=True, allow_reuse=True)
    def parse_technologies(cls, value):
        if isinstance(value, str):
            if not value: # Handle empty string case
                return []
            try:
                parsed_value = json.loads(value)
                if not isinstance(parsed_value, list):
                    # Consider logging or raising error
                    return []
                return parsed_value
            except json.JSONDecodeError:
                # Consider logging or raising error
                return []
        return value
