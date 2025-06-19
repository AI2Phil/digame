from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserBasicOut(BaseModel):
    id: int
    full_name: Optional[str] = "N/A" # Default to N/A if not available
    email: str

    class Config:
        orm_mode = True # For FastAPI to work with SQLAlchemy models

class ConnectionRequestBase(BaseModel):
    requester_id: int
    approver_id: int
    status: str

class ConnectionRequestCreate(BaseModel):
    # Typically, the requester_id would come from the current_user
    # and approver_id (receiver_user_id) from the path parameter.
    # This schema might be more useful if the request body contained more data.
    # For now, it's minimal.
    pass # No specific fields needed in body for POST /connections/request/{receiver_user_id}

class ConnectionRequestOut(BaseModel):
    id: int
    requester: UserBasicOut
    approver: UserBasicOut
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class ConnectionStatusUpdate(BaseModel):
    status: str # Could be an Enum in a more complex setup

    class Config:
        orm_mode = True
