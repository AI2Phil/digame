from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from ..database import Base # Correct path as Base is in digame/app/database.py

# Using string reference 'User' for relationship is safer initially to avoid circular dependencies.
# class User is defined in digame/app/models/user.py

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), index=True, nullable=False) # Assuming users table name is 'users'
    message = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=True) # For scheduling notifications

    # Define relationship to User model
    # Assumes User model (in digame.app.models.user.User) will have a 'notifications' back-populating relationship
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, message='{self.message[:20]}...', is_read={self.is_read}, scheduled_at={self.scheduled_at})>"
