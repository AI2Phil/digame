from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # For server_default=func.now()

# Import Base from database to avoid circular imports
from app.database import Base

class ProcessNote(Base):
    __tablename__ = "process_notes"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer(), primary_key=True, index=True, autoincrement=True)
    
    # Assuming User.id is Integer. If it's String/UUID, this type needs to match.
    user_id = Column(Integer(), ForeignKey("users.id"), nullable=False, index=True)
    
    inferred_task_name = Column(String(), nullable=True)
    process_steps_description = Column(Text(), nullable=False) # Using Text for longer descriptions or JSON string
    # Alternatively, if the DB supports JSON type natively and it's preferred:
    # process_steps_description_json = Column(JSON(), nullable=False)
    
    source_activity_ids = Column(JSON(), nullable=True) # Array of integers
    
    occurrence_count = Column(Integer(), default=1, nullable=False)
    
    first_observed_at = Column(DateTime(), server_default=func.now(), nullable=False)
    last_observed_at = Column(DateTime(), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    user_feedback = Column(String(), nullable=True) # e.g., "accurate", "inaccurate"
    user_tags = Column(JSON(), nullable=True) # Array of strings

    # Relationship to User model - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # user = relationship("User")

    # Task relationship - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # generated_tasks = relationship(
    #     "Task", # String reference to the Task class
    #     cascade="all, delete-orphan" # If a ProcessNote is deleted, related tasks are also deleted.
    # )

    def __repr__(self):
        return f"<ProcessNote(id={self.id}, user_id={self.user_id}, task_name='{self.inferred_task_name}')>"

# To complete the bi-directional relationship, the User model in user.py would need:
# from .process_notes import ProcessNote # Or a forward reference if using string for relationship
# process_notes = relationship("ProcessNote", back_populates="user", cascade="all, delete-orphan")
# (The cascade options depend on desired behavior when a User is deleted)
