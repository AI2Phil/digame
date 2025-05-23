from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .user import Base

class Job(Base):
    """
    Model for tracking background jobs.
    
    This model is used to track the status and progress of long-running
    background tasks such as model training, pattern recognition, and
    visualization data generation.
    """
    __tablename__ = "jobs"
    
    id = Column(Integer(), primary_key=True, index=True)
    user_id = Column(Integer(), ForeignKey("users.id"), nullable=False, index=True)
    job_type = Column(String(), nullable=False, index=True)  # e.g., "model_training", "pattern_recognition"
    status = Column(String(), nullable=False, index=True)  # "pending", "running", "completed", "failed"
    progress = Column(Float(), nullable=False, default=0.0)  # 0-100
    result = Column(JSON(), nullable=True)  # Store any result data
    error = Column(Text(), nullable=True)  # Store error message if job fails
    created_at = Column(DateTime(), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="jobs")
    
    def __repr__(self):
        return f"<Job(id={self.id}, user_id={self.user_id}, job_type={self.job_type}, status={self.status})>"