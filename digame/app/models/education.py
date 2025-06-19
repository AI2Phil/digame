from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .user import Base # Importing Base from user.py

class Education(Base):
    __tablename__ = "education_entries" # Changed table name to match relationship in User

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    institution = Column(String, nullable=False)
    degree = Column(String, nullable=True)
    fieldOfStudy = Column(String, nullable=True)
    graduationYear = Column(String, nullable=True) # E.g., "2019" or "Expected 2025"

    user = relationship("User", back_populates="education_entries")

    def __repr__(self):
        return f"<Education(id={self.id}, institution='{self.institution}', degree='{self.degree}', user_id={self.user_id})>"
