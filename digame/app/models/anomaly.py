from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # For server_default=func.now()

# Import Base from user.py to ensure all tables use the same metadata declaration
from .user import Base 
# Import User model for establishing relationship
from .user import User as UserModel # Renamed to avoid potential confusion if UserModel was also a Pydantic model

class DetectedAnomaly(Base):
    __tablename__ = "detected_anomalies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Assuming User.id is Integer based on existing User model.
    # If User.id were String/UUID, this Column type and ForeignKey target would change.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    timestamp = Column(DateTime, server_default=func.now(), nullable=False)
    anomaly_type = Column(String, nullable=False, index=True) # e.g., "UnusualActivitySequence", "HighErrorRate"
    description = Column(Text, nullable=False) # Human-readable description
    severity_score = Column(Float, nullable=True) # 0.0 to 1.0
    related_activity_ids = Column(JSON, nullable=True) # Array of integers (IDs from digital_activity)
    status = Column(String, default="new", nullable=False, index=True) # e.g., "new", "acknowledged", "resolved"

    # Relationship to User model
    # This allows accessing the User object from a DetectedAnomaly instance
    user = relationship("UserModel", back_populates="anomalies")

    def __repr__(self):
        return f"<DetectedAnomaly(id={self.id}, user_id={self.user_id}, type='{self.anomaly_type}', status='{self.status}')>"

# To complete the bi-directional relationship, the User model in user.py would need:
# from .anomaly import DetectedAnomaly # Or a forward reference if using string for relationship
# anomalies = relationship("DetectedAnomaly", back_populates="user", cascade="all, delete-orphan")
# (The cascade options depend on desired behavior when a User is deleted)
