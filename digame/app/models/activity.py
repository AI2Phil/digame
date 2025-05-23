from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

# Import Base from user.py to ensure all tables use the same metadata declaration
from .user import Base 
from .user import User # For establishing relationship

class Activity(Base):
    __tablename__ = "digital_activities" # As per problem description context

    id = Column(Integer(), primary_key=True, index=True, autoincrement=True)
    
    # Assuming User.id is Integer.
    user_id = Column(Integer(), ForeignKey("users.id"), nullable=False, index=True)
    
    activity_type = Column(String(), nullable=False, index=True) # e.g., "opened_email_client", "read_email"
    timestamp = Column(DateTime(), server_default=func.now(), nullable=False, index=True)
    
    # Optional field for more details about the activity
    details = Column(JSON(), nullable=True)
    
    # Relationship to User model (optional, but good practice)
    # This allows accessing the User object from an Activity instance
    user = relationship("User", back_populates="activities")

    # One-to-one relationship with ActivityEnrichedFeature
    # `uselist=False` makes this a scalar attribute (one-to-one)
    # `cascade="all, delete-orphan"` means if an Activity is deleted, its associated ActivityEnrichedFeature is also deleted.
    enriched_feature = relationship(
        "ActivityEnrichedFeature", 
        uselist=False, 
        back_populates="activity", 
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Activity(id={self.id}, user_id={self.user_id}, type='{self.activity_type}', time='{self.timestamp}')>"

# To complete the bi-directional relationship, the User model in user.py would need:
# from .activity import Activity # Or a forward reference if using string for relationship
# activities = relationship("Activity", back_populates="user", cascade="all, delete-orphan")
# (The cascade options depend on desired behavior when a User is deleted)
