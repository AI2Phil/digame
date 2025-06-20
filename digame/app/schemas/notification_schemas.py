from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    message: str
    scheduled_at: Optional[datetime] = None
    user_id: int

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    message: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    is_read: Optional[bool] = None

class Notification(NotificationBase):
    id: int
    created_at: datetime
    is_read: bool

    class Config:
        from_attributes = True # Pydantic V2 uses from_attributes instead of orm_mode
