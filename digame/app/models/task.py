from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

# Import Base from user.py to ensure all tables use the same metadata declaration
from .user import Base
# Import User and ProcessNote models for establishing relationships
from .user import User # Renamed to avoid potential confusion
from .process_notes import ProcessNote # Renamed

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    process_note_id = Column(Integer, ForeignKey("process_notes.id"), nullable=True, index=True) # Optional link

    description = Column(Text, nullable=False)
    source_type = Column(String(50), nullable=True) # e.g., 'system_generated', 'user_manual', 'prediction', 'process_note'
    source_identifier = Column(String(255), nullable=True) # e.g., stores process_note.id or a prediction model's internal ID
    
    priority_score = Column(Float, nullable=True, default=0.5)
    status = Column(String(50), nullable=False, default='suggested') # e.g., 'suggested', 'accepted', 'in_progress', 'completed', 'archived'
    
    notes = Column(Text, nullable=True)
    due_date_inferred = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship to User model
    user = relationship("User", back_populates="tasks")
    
    # Relationship to ProcessNote model (optional)
    process_note = relationship("ProcessNote", back_populates="generated_tasks")

    def __repr__(self):
        return f"<Task(id={self.id}, user_id={self.user_id}, description='{self.description[:30]}...', status='{self.status}')>"

# To complete the bi-directional relationships:
# User model (user.py) needs:
#   tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
# ProcessNote model (process_notes.py) needs:
#   generated_tasks = relationship("Task", back_populates="process_note", cascade="all, delete-orphan") # Or other cascade option
