from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .user import Base # Importing Base from user.py

class Experience(Base):
    __tablename__ = "experience_entries" # Changed table name to match relationship in User

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    jobTitle = Column(String, nullable=False)
    company = Column(String, nullable=True)
    duration = Column(String, nullable=True) # E.g., "May 2020 - Present" or "2 years"
    description = Column(Text, nullable=True)

    user = relationship("User", back_populates="experience_entries")

    def __repr__(self):
        return f"<Experience(id={self.id}, jobTitle='{self.jobTitle}', company='{self.company}', user_id={self.user_id})>"
