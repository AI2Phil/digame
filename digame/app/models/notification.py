from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from digame.app.db.base_class import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True) # Assuming it links to a user
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    scheduled_at = Column(DateTime, nullable=True, index=True)
    is_read = Column(Boolean, default=False, nullable=False)

    # If you have a User model and want to define a relationship, you can add:
    # owner = relationship("User", back_populates="notifications")
    # Ensure "User" model is imported and has a "notifications" relationship attribute.
    # For now, user_id is kept as a simple Integer field.
