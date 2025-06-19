from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .user import Base # Assuming Base is defined in user.py or a common base class file
from datetime import datetime

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=True)  # e.g., 'kudos', 'connection_request', 'connection_accepted'
    is_read = Column(Boolean, default=False, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    # updated_at is not strictly necessary for notifications unless they can be edited,
    # but good practice to have if is_read changes are considered "updates".
    # For simplicity, we'll rely on created_at for timestamping.

    # Relationship to User model (the user who receives the notification)
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, type='{self.type}', is_read={self.is_read})>"
