"""
Digital Twin Models for the DigiMe platform
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Float, DECIMAL, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import text
from datetime import datetime
from enum import Enum
from .user import Base

class TwinStatus(str, Enum):
    INITIALIZING = "initializing"
    LEARNING = "learning"
    ACTIVE = "active"
    PAUSED = "paused"
    ERROR = "error"

class DigitalTwin(Base):
    """Core Digital Twin model representing a user's productivity twin"""
    __tablename__ = "digital_twins"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    status = Column(String(50), default=TwinStatus.INITIALIZING.value, nullable=False)
    learning_progress = Column(DECIMAL(5, 2), default=0.00)
    accuracy_score = Column(DECIMAL(5, 2), default=0.00)
    model_version = Column(String(50), nullable=True)
    last_training_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="digital_twins")
    activity_patterns = relationship("ActivityPattern", back_populates="twin", cascade="all, delete-orphan")
    behavioral_learning = relationship("BehavioralLearning", back_populates="twin", cascade="all, delete-orphan")
    prediction_models = relationship("PredictionModel", back_populates="twin", cascade="all, delete-orphan")
    simulation_results = relationship("SimulationResult", back_populates="twin", cascade="all, delete-orphan")
    twin_interactions = relationship("TwinInteraction", back_populates="twin", cascade="all, delete-orphan")
    activity_stream = relationship("ActivityStream", back_populates="twin", cascade="all, delete-orphan")
    twin_knowledge = relationship("TwinKnowledge", back_populates="twin", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<DigitalTwin(id={self.id}, user_id={self.user_id}, name='{self.name}', status='{self.status}')>"

class ActivityPattern(Base):
    """Stores discovered activity patterns for digital twins"""
    __tablename__ = "activity_patterns"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    pattern_type = Column(String(100), nullable=False)
    pattern_data = Column(JSON, nullable=False)
    confidence_score = Column(DECIMAL(5, 2), nullable=True)
    frequency_score = Column(DECIMAL(5, 2), nullable=True)
    impact_score = Column(DECIMAL(5, 2), nullable=True)
    discovered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    validated_at = Column(DateTime, nullable=True)

    # Relationships
    twin = relationship("DigitalTwin", back_populates="activity_patterns")

    # Indexes
    __table_args__ = (
        Index('idx_twin_patterns', 'twin_id', 'pattern_type'),
    )

    def __repr__(self):
        return f"<ActivityPattern(id={self.id}, twin_id={self.twin_id}, type='{self.pattern_type}')>"

class BehavioralLearning(Base):
    """Stores behavioral learning data for continuous improvement"""
    __tablename__ = "behavioral_learning"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    behavior_category = Column(String(100), nullable=False)
    learning_data = Column(JSON, nullable=False)
    confidence_level = Column(DECIMAL(5, 2), nullable=True)
    learning_iteration = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    twin = relationship("DigitalTwin", back_populates="behavioral_learning")

    # Indexes
    __table_args__ = (
        Index('idx_twin_behavior', 'twin_id', 'behavior_category'),
    )

    def __repr__(self):
        return f"<BehavioralLearning(id={self.id}, twin_id={self.twin_id}, category='{self.behavior_category}')>"

class PredictionModel(Base):
    """Stores prediction models and their metadata"""
    __tablename__ = "prediction_models"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    model_type = Column(String(100), nullable=False)
    model_parameters = Column(JSON, nullable=False)
    training_data_hash = Column(String(64), nullable=True)
    accuracy_metrics = Column(JSON, nullable=True)
    version = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=False, nullable=False)
    trained_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    twin = relationship("DigitalTwin", back_populates="prediction_models")

    # Indexes
    __table_args__ = (
        Index('idx_twin_models', 'twin_id', 'model_type', 'is_active'),
    )

    def __repr__(self):
        return f"<PredictionModel(id={self.id}, twin_id={self.twin_id}, type='{self.model_type}', active={self.is_active})>"

class SimulationResult(Base):
    """Stores results from twin simulations"""
    __tablename__ = "simulation_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    simulation_type = Column(String(100), nullable=False)
    input_parameters = Column(JSON, nullable=False)
    simulation_results = Column(JSON, nullable=False)
    confidence_score = Column(DECIMAL(5, 2), nullable=True)
    execution_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    twin = relationship("DigitalTwin", back_populates="simulation_results")

    # Indexes
    __table_args__ = (
        Index('idx_twin_simulations', 'twin_id', 'simulation_type'),
    )

    def __repr__(self):
        return f"<SimulationResult(id={self.id}, twin_id={self.twin_id}, type='{self.simulation_type}')>"

class TwinInteraction(Base):
    """Logs interactions between users and their digital twins"""
    __tablename__ = "twin_interactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    interaction_type = Column(String(100), nullable=False)
    input_data = Column(JSON, nullable=True)
    response_data = Column(JSON, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    user_feedback = Column(Integer, nullable=True)  # 1-5 rating
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    twin = relationship("DigitalTwin", back_populates="twin_interactions")

    # Indexes
    __table_args__ = (
        Index('idx_twin_interactions', 'twin_id', 'interaction_type', 'created_at'),
    )

    def __repr__(self):
        return f"<TwinInteraction(id={self.id}, twin_id={self.twin_id}, type='{self.interaction_type}')>"

class ActivityStream(Base):
    """Real-time activity stream for digital twins"""
    __tablename__ = "activity_stream"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    activity_type = Column(String(100), nullable=False)
    activity_data = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    processed = Column(Boolean, default=False, nullable=False)

    # Relationships
    twin = relationship("DigitalTwin", back_populates="activity_stream")

    # Indexes
    __table_args__ = (
        Index('idx_twin_activity_stream', 'twin_id', 'timestamp', 'processed'),
    )

    def __repr__(self):
        return f"<ActivityStream(id={self.id}, twin_id={self.twin_id}, type='{self.activity_type}', processed={self.processed})>"

class TwinKnowledge(Base):
    """Knowledge base for digital twins"""
    __tablename__ = "twin_knowledge"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    knowledge_type = Column(String(100), nullable=False)
    knowledge_data = Column(JSON, nullable=False)
    confidence_score = Column(DECIMAL(5, 2), nullable=True)
    source = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    twin = relationship("DigitalTwin", back_populates="twin_knowledge")

    # Indexes
    __table_args__ = (
        Index('idx_twin_knowledge', 'twin_id', 'knowledge_type'),
    )

    def __repr__(self):
        return f"<TwinKnowledge(id={self.id}, twin_id={self.twin_id}, type='{self.knowledge_type}')>"

# Import uuid for default values
import uuid