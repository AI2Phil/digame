from typing import Optional
from pydantic import BaseModel

class EducationBase(BaseModel):
    institution: str
    degree: str
    fieldOfStudy: Optional[str] = None
    graduationYear: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class EducationUpdate(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    fieldOfStudy: Optional[str] = None
    graduationYear: Optional[str] = None

class EducationInDBBase(EducationBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}

class EducationSchema(EducationInDBBase):
    pass
