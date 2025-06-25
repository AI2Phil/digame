from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON # Using JSON type for technologiesUsed
from .user import Base # Importing Base from user.py

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer(), primary_key=True, index=True)
    user_id = Column(Integer(), ForeignKey("users.id"), nullable=False)
    owner_id = Column(Integer(), ForeignKey("users.id"), nullable=True)  # Additional owner field from WIP

    title = Column(String(), nullable=False)
    name = Column(String(), index=True, nullable=True)  # Additional name field from WIP
    description = Column(Text(), nullable=True)
    url = Column(String(), nullable=True)
    technologiesUsed = Column(JSON, nullable=True)  # Storing list[str] as JSON
    required_skills = Column(JSON, nullable=True)  # Additional field from WIP
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)  # Additional field from WIP

    user = relationship("User", back_populates="projects", foreign_keys=[user_id])
    owner = relationship("User", foreign_keys=[owner_id])  # Additional relationship from WIP

    def __repr__(self):
        return f"<Project(id={self.id}, title='{self.title}', user_id={self.user_id})>"
