from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from app.database import Base # Assuming Base is defined in user.py or a shared models.base

class DirectMessage(Base):
    __table_args__ = {'extend_existing': True}
    __tablename__ = "messages"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False, nullable=False)

    # User relationships - temporarily disabled to resolve registry conflicts
    # sender = relationship("app.models.user.User", foreign_keys=[sender_id])
    # receiver = relationship("app.models.user.User", foreign_keys=[receiver_id])

    def __repr__(self):
        return f"<DirectMessage(id={self.id}, from={self.sender_id}, to={self.receiver_id}, read={self.is_read})>"