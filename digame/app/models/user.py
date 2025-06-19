from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

# Removed: from .user_setting import UserSetting # This caused a circular import

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer(), primary_key=True, index=True)
    username = Column(String(), unique=True, index=True, nullable=False)
    email = Column(String(), unique=True, index=True, nullable=False)
    hashed_password = Column(String(), nullable=False)
    
    first_name = Column(String(), nullable=True)
    last_name = Column(String(), nullable=True)
    
    created_at = Column(DateTime(), default=datetime.utcnow)
    updated_at = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    is_active = Column(Integer(), default=True) # Using Integer for broader DB compatibility (e.g. 0 or 1)
    
    # Onboarding fields
    onboarding_completed = Column(Boolean(), default=False)
    onboarding_data = Column(Text(), nullable=True)  # JSON string for onboarding data

    # Relationship to Role via user_roles_table
    # The 'secondary' argument refers to the __tablename__ of the association table.
    # This table (user_roles) will be defined in rbac.py.
    roles = relationship(
        "Role",
        secondary="user_roles", 
        back_populates="users"  # Corresponds to the 'users' attribute in the Role model
    )

    # Relationship to ProcessNote model
    # This allows accessing all process notes associated with a user.
    process_notes = relationship(
        "ProcessNote", # String reference to the ProcessNote class
        back_populates="user", # Corresponds to the 'user' attribute in ProcessNote
        cascade="all, delete-orphan" # If a user is deleted, their process notes are also deleted.
    )

    # Relationship to Activity model
    # Allows accessing all activities associated with a user.
    activities = relationship(
        "Activity", # String reference to the Activity class
        back_populates="user", # Corresponds to the 'user' attribute in Activity
        cascade="all, delete-orphan" # If a user is deleted, their activities are also deleted.
    )

    # Relationship to DetectedAnomaly model
    # Allows accessing all anomalies detected for a user.
    anomalies = relationship(
        "DetectedAnomaly", # String reference to the DetectedAnomaly class
        back_populates="user", # Corresponds to the 'user' attribute in DetectedAnomaly
        cascade="all, delete-orphan" # If a user is deleted, their anomalies are also deleted.
    )

    # Relationship to Task model
    # Allows accessing all tasks assigned to or created by a user.
    tasks = relationship(
        "Task", # String reference to the Task class
        back_populates="user", # Corresponds to the 'user' attribute in Task
        cascade="all, delete-orphan" # If a user is deleted, their tasks are also deleted.
    )
    
    # Relationship to BehavioralModel model
    # Allows accessing all behavioral models created for a user.
    behavioral_models = relationship(
        "BehavioralModel", # String reference to the BehavioralModel class
        back_populates="user", # Corresponds to the 'user' attribute in BehavioralModel
        cascade="all, delete-orphan" # If a user is deleted, their behavioral models are also deleted.
    )

    # Relationship to UserSetting model
    # This allows accessing the user's settings.
    settings = relationship(
        "UserSetting",
        back_populates="user",
        uselist=False, # One-to-one relationship
        cascade="all, delete-orphan" # If a user is deleted, their settings are also deleted.
    )

    # Relationships for ConnectionRequest
    # Using string "ConnectionRequest" to avoid circular imports
    sent_connection_requests = relationship(
        "ConnectionRequest",
        foreign_keys="[ConnectionRequest.requester_id]", # Use string for foreign_keys
        back_populates="requester",
        cascade="all, delete-orphan"
    )

    received_connection_requests = relationship(
        "ConnectionRequest",
        foreign_keys="[ConnectionRequest.approver_id]", # Use string for foreign_keys
        back_populates="approver",
        cascade="all, delete-orphan"
    )

    # Relationship to Notification model
    # Allows accessing all notifications for a user.
    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(Notification.created_at)" # Optional: order notifications by creation date
    )

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"
