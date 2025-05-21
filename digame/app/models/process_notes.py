from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # For server_default=func.now()

# Import Base from user.py to ensure all tables use the same metadata declaration
from .user import Base 
# Assuming User model is also in .user or accessible via this Base
from .user import User as UserModel # For establishing relationship

class ProcessNote(Base):
    __tablename__ = "process_notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Assuming User.id is Integer. If it's String/UUID, this type needs to match.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    inferred_task_name = Column(String, nullable=True)
    process_steps_description = Column(Text, nullable=False) # Using Text for longer descriptions or JSON string
    # Alternatively, if the DB supports JSON type natively and it's preferred:
    # process_steps_description_json = Column(JSON, nullable=False) 
    
    source_activity_ids = Column(JSON, nullable=True) # Array of integers
    
    occurrence_count = Column(Integer, default=1, nullable=False)
    
    first_observed_at = Column(DateTime, server_default=func.now(), nullable=False)
    last_observed_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    user_feedback = Column(String, nullable=True) # e.g., "accurate", "inaccurate"
    user_tags = Column(JSON, nullable=True) # Array of strings

    # Relationship to User model
    # This allows accessing the User object from a ProcessNote instance
    user = relationship("UserModel", back_populates="process_notes")

    # Relationship to Task model (one-to-many: one ProcessNote can generate multiple Tasks)
    generated_tasks = relationship(
        "Task", # String reference to the Task class
        back_populates="process_note", # Corresponds to the 'process_note' attribute in Task
        cascade="all, delete-orphan" # If a ProcessNote is deleted, related tasks are also deleted.
                                     # Adjust cascade as needed, e.g., "save-update, merge" if tasks should remain but be de-linked.
    )

    def __repr__(self):
        return f"<ProcessNote(id={self.id}, user_id={self.user_id}, task_name='{self.inferred_task_name}')>"

# To complete the bi-directional relationship, the User model in user.py would need:
# from .process_notes import ProcessNote # Or a forward reference if using string for relationship
# process_notes = relationship("ProcessNote", back_populates="user", cascade="all, delete-orphan")
# (The cascade options depend on desired behavior when a User is deleted)
