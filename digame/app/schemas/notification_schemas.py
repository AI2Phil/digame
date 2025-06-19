from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class NotificationBase(BaseModel):
    message: str
    type: str

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
