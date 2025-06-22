from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON # Using JSON type for technologiesUsed
from .user import Base # Importing Base from user.py

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String, nullable=True)
    technologiesUsed = Column(JSON, nullable=True)  # Storing list[str] as JSON

    user = relationship("User", back_populates="projects")

    def __repr__(self):
        return f"<Project(id={self.id}, title='{self.title}', user_id={self.user_id})>"
