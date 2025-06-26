"""
Communication schemas for message and conversation management
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Minimal User schema for embedding in Message
class MessageUser(BaseModel):
    id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    receiver_id: int

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    receiver_id: int
    timestamp: datetime
    is_read: bool
    sender: Optional[MessageUser] = None # Include sender details in the response

    class Config:
        from_attributes = True # For Pydantic V2 to work with ORM objects

class ConversationResponse(BaseModel):
    peer_user: MessageUser # Details of the other user in the conversation
    messages: list[MessageResponse]
    last_message_timestamp: Optional[datetime] = None
    unread_count: int = 0