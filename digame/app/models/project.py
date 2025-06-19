from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

# Import Base from the central location
from digame.app.database import Base
# Import User for relationship typing if not using string types, but string types are safer for circularity
# from .user import User # This could cause circular import if User also imports Project directly for typing

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    required_skills = Column(JSON, nullable=True)  # Stores a list of strings

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) # Good practice

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True) # A project might not have an individual owner initially

    # Relationship to User model
    # Using string "User" to avoid direct import issues at load time
    owner = relationship("User", back_populates="projects")

    def __repr__(self):
        return f"<Project(id={self.id}, name='{self.name}')>"
