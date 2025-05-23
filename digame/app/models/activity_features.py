from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

# Import Base from user.py to ensure all tables use the same metadata declaration
from .user import Base 
# Import Activity model for establishing the relationship
# from .activity import Activity # This will be used as a string reference to avoid circular imports if needed

class ActivityEnrichedFeature(Base):
    __tablename__ = "activity_enriched_features"

    id = Column(Integer(), primary_key=True, index=True, autoincrement=True)
    
    # One-to-one relationship with digital_activities table:
    # ActivityEnrichedFeature will have one entry per Activity, and each Activity can have one EnrichedFeature.
    # The ForeignKey points to digital_activities.id.
    # The unique=True constraint on activity_id ensures the one-to-one nature from this side.
    activity_id = Column(Integer(), ForeignKey("digital_activities.id"), unique=True, nullable=False, index=True)
    
    app_category = Column(String(), nullable=True)
    project_context = Column(String(), nullable=True)
    website_category = Column(String(), nullable=True)
    is_context_switch = Column(Boolean(), nullable=True, default=False) # Defaulting to False seems reasonable

    # Relationship to Activity model
    # This allows accessing the Activity object from an ActivityEnrichedFeature instance.
    # `uselist=False` is not needed here as this is the "many" side of a one-to-one if viewed from Activity.
    # Or rather, this is the "one" side that points *to* Activity.
    # The "Activity" model will have the `uselist=False`.
    activity = relationship("Activity", back_populates="enriched_feature")

    def __repr__(self):
        return f"<ActivityEnrichedFeature(id={self.id}, activity_id={self.activity_id}, app_category='{self.app_category}')>"

# To complete the bi-directional one-to-one relationship, the Activity model in activity.py would need:
# from .activity_features import ActivityEnrichedFeature # Or a forward reference
# enriched_feature = relationship("ActivityEnrichedFeature", uselist=False, back_populates="activity", cascade="all, delete-orphan")
