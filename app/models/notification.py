from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey  # type: ignore
from sqlalchemy.orm import relationship  # type: ignore
from sqlalchemy.sql import func  # type: ignore
from ..database import Base

class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer(), primary_key=True, index=True)
    user_id = Column(Integer(), ForeignKey("users.id"), index=True, nullable=False)
    message = Column(String(), nullable=False)
    type = Column(String(), index=True, nullable=False)
    is_read = Column(Boolean(), default=False, nullable=False, index=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Define relationship to User model
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, message='{self.message[:20]}...', is_read={self.is_read}, scheduled_at={self.scheduled_at})>"
