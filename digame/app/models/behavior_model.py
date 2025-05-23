from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, Float, ForeignKey, Boolean, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

# Import Base from user.py to ensure all tables use the same metadata declaration
from .user import Base 
from .user import User

class BehavioralModel(Base):
    """
    Stores trained behavioral models for users.
    This includes clustering models and their parameters.
    """
    __tablename__ = "behavioral_models"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Model metadata
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Model parameters
    algorithm = Column(String, nullable=False)  # "kmeans", "dbscan", "hierarchical"
    parameters = Column(JSON, nullable=False)  # Store algorithm parameters
    
    # Model performance metrics
    silhouette_score = Column(Float, nullable=True)
    num_clusters = Column(Integer, nullable=True)
    
    # The serialized model itself
    model_data = Column(LargeBinary, nullable=True)  # Serialized model (pickle or joblib)
    
    # Relationship to User model
    user = relationship("User", back_populates="behavioral_models")
    
    # Relationship to BehavioralPattern model
    patterns = relationship("BehavioralPattern", back_populates="model", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<BehavioralModel(id={self.id}, user_id={self.user_id}, algorithm='{self.algorithm}', version='{self.version}')>"


class BehavioralPattern(Base):
    """
    Stores identified behavioral patterns from clustering models.
    Each pattern represents a cluster or a significant grouping of activities.
    """
    __tablename__ = "behavioral_patterns"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    model_id = Column(Integer, ForeignKey("behavioral_models.id"), nullable=False, index=True)
    
    # Pattern metadata
    pattern_label = Column(Integer, nullable=False)  # Cluster label or pattern identifier
    name = Column(String, nullable=True)  # Optional human-readable name
    description = Column(Text, nullable=True)  # Human-readable description
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    # Pattern characteristics
    size = Column(Integer, nullable=False)  # Number of activities in this pattern
    centroid = Column(JSON, nullable=True)  # Centroid coordinates (for K-means)
    representative_activities = Column(JSON, nullable=True)  # Sample activity IDs that represent this pattern
    
    # Pattern features
    temporal_distribution = Column(JSON, nullable=True)  # Time of day/week distribution
    activity_distribution = Column(JSON, nullable=True)  # Types of activities in this pattern
    context_features = Column(JSON, nullable=True)  # Common contextual features
    
    # Relationship to BehavioralModel
    model = relationship("BehavioralModel", back_populates="patterns")
    
    def __repr__(self):
        return f"<BehavioralPattern(id={self.id}, model_id={self.model_id}, pattern_label={self.pattern_label})>"


# To complete the bi-directional relationship, the User model in user.py would need:
# from .behavior_model import BehavioralModel
# behavioral_models = relationship("BehavioralModel", back_populates="user", cascade="all, delete-orphan")