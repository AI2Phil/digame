from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles" # Changed table name to plural
    __table_args__ = {'extend_existing': True}

    id = Column(Integer(), primary_key=True)
    user_id = Column(Integer(), ForeignKey("users.id"), unique=True, nullable=False)

    skills = Column(JSON, nullable=True)
    learning_goals = Column(Text(), nullable=True) # Using Text for flexibility
    interests = Column(JSON, nullable=True)
    mentorship_preferences = Column(JSON, nullable=True)

    bio = Column(Text(), nullable=True)
    location = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)

    updated_at = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to User (One-to-One)
    user = relationship("app.models.user.User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<UserProfile(id={self.id}, user_id={self.user_id})>"