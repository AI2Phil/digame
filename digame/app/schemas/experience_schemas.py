from typing import Optional
from pydantic import BaseModel

class ExperienceBase(BaseModel):
    jobTitle: str
    company: str
    duration: Optional[str] = None
    description: Optional[str] = None

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(BaseModel):
    jobTitle: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None

class ExperienceInDBBase(ExperienceBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

class ExperienceSchema(ExperienceInDBBase):
    pass
