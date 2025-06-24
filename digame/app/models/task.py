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

    id = Column(Integer(), primary_key=True, index=True, autoincrement=True)
    
    user_id = Column(Integer(), ForeignKey("users.id"), nullable=False, index=True)
    process_note_id = Column(Integer(), ForeignKey("process_notes.id"), nullable=True, index=True) # Optional link

    description = Column(Text(), nullable=False)
    source_type = Column(String(50), nullable=True) # e.g., 'system_generated', 'user_manual', 'prediction', 'process_note'
    source_identifier = Column(String(255), nullable=True) # e.g., stores process_note.id or a prediction model's internal ID
    
    priority_score = Column(Float(), nullable=True, default=0.5)
    status = Column(String(50), nullable=False, default='suggested') # e.g., 'suggested', 'accepted', 'in_progress', 'completed', 'archived'
    
    notes = Column(Text(), nullable=True)
    due_date_inferred = Column(DateTime(), nullable=True)
    
    created_at = Column(DateTime(), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Temporarily commented out to resolve SQLAlchemy mapper issues
    # # Relationship to User model
    # user = relationship("User", back_populates="tasks")
    
    # Relationship to ProcessNote model (optional)
    process_note = relationship("ProcessNote", back_populates="generated_tasks")

    # New fields for Smart Scheduling & Calendar Management
    estimated_effort_hours = Column(Float(), nullable=True)
    deadline = Column(DateTime(), nullable=True) # Specific deadline, complements due_date_inferred
    dependencies = Column(JSON, nullable=True, default=[]) # List of task IDs this task depends on
    assigned_resource_id = Column(Integer(), ForeignKey("users.id"), nullable=True, index=True) # Optional explicit assignment
    calendar_event_id = Column(String(255), nullable=True) # External calendar event ID

    # Relationship for assigned resource (can be the same as user_id or different if tasks can be assigned by others)
    assigned_resource = relationship("User", foreign_keys=[assigned_resource_id])


    def __repr__(self):
        return f"<Task(id={self.id}, user_id={self.user_id}, description='{self.description[:30]}...', status='{self.status}')>"

# To complete the bi-directional relationships:
# User model (user.py) needs:
#   tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan", foreign_keys="[Task.user_id]")
#   assigned_tasks = relationship("Task", back_populates="assigned_resource", foreign_keys="[Task.assigned_resource_id]")
# ProcessNote model (process_notes.py) needs:
#   generated_tasks = relationship("Task", back_populates="process_note", cascade="all, delete-orphan") # Or other cascade option
