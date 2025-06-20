from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Base schema for common attributes
class NotificationBase(BaseModel):
    message: str
    scheduled_at: Optional[datetime] = None

# Schema for creating a notification (inherits from Base)
# user_id will typically be derived from the authenticated user or path parameter in the API,
# rather than being part of this specific creation payload schema.
class NotificationCreate(NotificationBase):
    # If user_id needs to be part of the creation payload for some specific use cases:
    # user_id: int
    pass

# Schema for updating a notification (all fields optional)
class NotificationUpdate(BaseModel):
    message: Optional[str] = None
    is_read: Optional[bool] = None
    scheduled_at: Optional[datetime] = None # Allow updating scheduled_at
    # Setting scheduled_at to None can be used to unschedule/send immediately if logic supports.

# Schema for reading/returning a notification (includes all model fields)
class Notification(NotificationBase):
    id: int
    user_id: int
    created_at: datetime
    is_read: bool

    class Config:
        from_attributes = True # For Pydantic v2 (preferred for new development)
        # orm_mode = True # For Pydantic v1

# You might also want a schema for listing multiple notifications, e.g.,
# class NotificationList(BaseModel):
#     notifications: List[Notification]
#     total: int
# This is optional based on API design for listing. For now, focusing on individual schemas.
