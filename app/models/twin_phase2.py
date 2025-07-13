"""
Phase 2 Digital Twin Models for Advanced AI Features
Includes conversation storage, learning pipeline data, and analytics results
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Float, DECIMAL, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from enum import Enum
import uuid

from app.database import Base

class ConversationStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"

class LearningStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class TwinConversation(Base):  # type: ignore
    """
    Stores conversation sessions between users and their digital twins
    Provides persistent storage for conversation history and context
    """
    __tablename__ = "twin_conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)  # type: ignore
    conversation_id = Column(String, nullable=False, index=True)  # type: ignore  # Session identifier
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # type: ignore
    
    # Conversation metadata
    title = Column(String(255), nullable=True)  # type: ignore  # Auto-generated or user-defined title
    status = Column(String(50), default=ConversationStatus.ACTIVE.value, nullable=False)  # type: ignore
    message_count = Column(Integer, default=0, nullable=False)  # type: ignore
    
    # Conversation statistics
    total_queries = Column(Integer, default=0, nullable=False)  # type: ignore
    total_responses = Column(Integer, default=0, nullable=False)  # type: ignore
    avg_confidence = Column(DECIMAL(5, 2), nullable=True)  # type: ignore
    intent_distribution = Column(JSON, default={}, nullable=False)  # type: ignore  # {"intent": count}
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # type: ignore
    last_activity_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # type: ignore
    ended_at = Column(DateTime, nullable=True)  # type: ignore
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # type: ignore
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)  # type: ignore

    # Relationships
    twin = relationship("DigitalTwin")
    user = relationship("User")
    messages = relationship("TwinConversationMessage", back_populates="conversation", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_twin_conversations', 'twin_id', 'conversation_id'),
        Index('idx_conversation_activity', 'user_id', 'last_activity_at'),
        {'extend_existing': True}
    )

    def __repr__(self):
        return f"<TwinConversation(id={self.id}, twin_id={self.twin_id}, messages={self.message_count})>"

class TwinConversationMessage(Base):  # type: ignore
    """
    Individual messages within twin conversations
    Stores queries, responses, intents, and metadata for each interaction
    """
    __tablename__ = "twin_conversation_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    conversation_id = Column(String, ForeignKey("twin_conversations.id"), nullable=False, index=True)  # type: ignore
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)  # type: ignore
    
    # Message content
    message_type = Column(String(50), nullable=False)  # type: ignore  # 'query', 'response'
    content = Column(Text, nullable=False)  # type: ignore
    
    # NLP Analysis (for queries)
    intent = Column(String(100), nullable=True)  # type: ignore
    intent_confidence = Column(DECIMAL(5, 2), nullable=True)  # type: ignore
    entities = Column(JSON, default=[], nullable=False)  # type: ignore  # Extracted entities
    
    # Response metadata (for responses)
    response_confidence = Column(DECIMAL(5, 2), nullable=True)  # type: ignore
    processing_time_ms = Column(Integer, nullable=True)  # type: ignore
    template_used = Column(String(255), nullable=True)  # type: ignore
    context_factors = Column(JSON, default=[], nullable=False)  # type: ignore
    
    # Actions and follow-ups
    actions = Column(JSON, default=[], nullable=False)  # type: ignore  # Extracted actionable items
    user_feedback = Column(Integer, nullable=True)  # type: ignore  # 1-5 rating
    feedback_comment = Column(Text, nullable=True)  # type: ignore
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)  # type: ignore
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # type: ignore

    # Relationships
    conversation = relationship("TwinConversation", back_populates="messages")
    twin = relationship("DigitalTwin")

    # Indexes
    __table_args__ = (
        Index('idx_conversation_messages', 'conversation_id', 'timestamp'),
        Index('idx_twin_messages', 'twin_id', 'message_type', 'timestamp'),
        Index('idx_message_intent', 'intent', 'intent_confidence'),
        {'extend_existing': True}
    )

    def __repr__(self):
        return f"<TwinConversationMessage(id={self.id}, type={self.message_type}, intent={self.intent})>"

class LearningDataItem(Base):  # type: ignore
    """
    Individual learning data items in the continuous learning pipeline
    Stores data waiting to be processed or recently processed
    """
    __tablename__ = "learning_data_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)  # type: ignore
    
    # Learning data metadata
    data_type = Column(String(100), nullable=False, index=True)  # type: ignore  # productivity_data, activity_data, etc.
    model_type = Column(String(100), nullable=True, index=True)  # type: ignore  # pattern_recognition, productivity_prediction, etc.
    priority = Column(String(50), nullable=False, index=True)  # type: ignore  # low, medium, high, critical
    
    # Learning data content
    data = Column(JSON, nullable=False)  # type: ignore  # The actual learning data
    metadata = Column(JSON, default={}, nullable=False)  # type: ignore  # Additional metadata
    
    # Processing status
    status = Column(String(50), default=LearningStatus.PENDING.value, nullable=False, index=True)  # type: ignore
    processing_started_at = Column(DateTime, nullable=True)  # type: ignore
    processing_completed_at = Column(DateTime, nullable=True)  # type: ignore
    processing_duration_ms = Column(Integer, nullable=True)  # type: ignore
    
    # Learning results
    model_updated = Column(Boolean, default=False, nullable=False)  # type: ignore
    performance_improvement = Column(DECIMAL(5, 2), nullable=True)  # type: ignore  # Percentage improvement
    confidence_score = Column(DECIMAL(5, 2), nullable=True)  # type: ignore
    error_message = Column(Text, nullable=True)  # type: ignore
    
    # Sample weight and priority calculation
    sample_weight = Column(DECIMAL(5, 2), nullable=True)  # type: ignore
    calculated_priority = Column(DECIMAL(5, 2), nullable=True)  # type: ignore
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)  # type: ignore
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # type: ignore
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)  # type: ignore

    # Relationships
    twin = relationship("DigitalTwin")

    # Indexes
    __table_args__ = (
        Index('idx_learning_queue', 'status', 'priority', 'timestamp'),
        Index('idx_twin_learning_data', 'twin_id', 'data_type', 'status'),
        Index('idx_learning_processing', 'processing_started_at', 'status'),
        {'extend_existing': True}
    )

    def __repr__(self):
        return f"<LearningDataItem(id={self.id}, twin_id={self.twin_id}, type={self.data_type}, status={self.status})>"

class ModelPerformanceHistory(Base):  # type: ignore
    """
    Historical performance tracking for continuous learning models
    Stores performance metrics over time for each model
    """
    __tablename__ = "model_performance_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)  # type: ignore
    model_key = Column(String(255), nullable=False, index=True)  # type: ignore  # twin_id_model_type
    model_type = Column(String(100), nullable=False, index=True)  # type: ignore
    
    # Performance metrics
    accuracy = Column(DECIMAL(5, 2), nullable=False)  # type: ignore
    precision = Column(DECIMAL(5, 2), nullable=False)  # type: ignore
    recall = Column(DECIMAL(5, 2), nullable=False)  # type: ignore
    f1_score = Column(DECIMAL(5, 2), nullable=False)  # type: ignore
    confidence = Column(DECIMAL(5, 2), nullable=False)  # type: ignore
    
    # Training metadata
    training_samples = Column(Integer, nullable=False)  # type: ignore
    improvement = Column(DECIMAL(5, 2), nullable=False)  # type: ignore  # Percentage improvement from previous
    
    # Timestamps
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)  # type: ignore
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # type: ignore

    # Relationships
    twin = relationship("DigitalTwin")

    # Indexes
    __table_args__ = (
        Index('idx_model_performance', 'twin_id', 'model_type', 'recorded_at'),
        Index('idx_performance_tracking', 'model_key', 'recorded_at'),
        {'extend_existing': True}
    )

    def __repr__(self):
        return f"<ModelPerformanceHistory(id={self.id}, model_key={self.model_key}, accuracy={self.accuracy})>"

class AnalyticsResult(Base):  # type: ignore
    """
    Results from advanced analytics engine analysis
    Stores comprehensive analysis results, insights, and recommendations
    """
    __tablename__ = "analytics_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)  # type: ignore
    
    # Analysis metadata
    analysis_type = Column(String(100), nullable=False, index=True)  # type: ignore  # productivity_analysis, pattern_discovery, etc.
    analysis_name = Column(String(255), nullable=False)  # type: ignore
    
    # Analysis parameters
    time_range_start = Column(DateTime, nullable=False, index=True)  # type: ignore
    time_range_end = Column(DateTime, nullable=False, index=True)  # type: ignore
    data_points = Column(Integer, nullable=False)  # type: ignore
    
    # Analysis results
    insights = Column(JSON, default=[], nullable=False)  # type: ignore  # List of insights
    metrics = Column(JSON, default={}, nullable=False)  # type: ignore  # Calculated metrics
    recommendations = Column(JSON, default=[], nullable=False)  # type: ignore  # List of recommendations
    
    # Analysis quality
    confidence = Column(DECIMAL(5, 2), nullable=False)  # type: ignore
    data_quality_score = Column(DECIMAL(5, 2), nullable=True)  # type: ignore
    
    # Processing metadata
    processing_time_ms = Column(Integer, nullable=True)  # type: ignore
    cache_hit = Column(Boolean, default=False, nullable=False)  # type: ignore
    
    # Timestamps
    analyzed_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)  # type: ignore
    expires_at = Column(DateTime, nullable=True)  # type: ignore  # When analysis becomes stale
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # type: ignore

    # Relationships
    twin = relationship("DigitalTwin")

    # Indexes
    __table_args__ = (
        Index('idx_analytics_results', 'twin_id', 'analysis_type', 'analyzed_at'),
        Index('idx_analytics_timerange', 'time_range_start', 'time_range_end'),
        Index('idx_analytics_expiry', 'expires_at'),
        {'extend_existing': True}
    )

    def __repr__(self):
        return f"<AnalyticsResult(id={self.id}, twin_id={self.twin_id}, type={self.analysis_type})>"

class AnalyticsInsight(Base):  # type: ignore
    """
    Individual insights generated by the analytics engine
    Provides detailed tracking of insights with impact and actionability
    """
    __tablename__ = "analytics_insights"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    analytics_result_id = Column(String, ForeignKey("analytics_results.id"), nullable=False, index=True)  # type: ignore
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)  # type: ignore
    
    # Insight content
    title = Column(String(255), nullable=False)  # type: ignore
    description = Column(Text, nullable=False)  # type: ignore
    category = Column(String(100), nullable=False, index=True)  # type: ignore  # performance, improvement, warning, etc.
    
    # Insight metrics
    impact_score = Column(DECIMAL(5, 2), nullable=False)  # type: ignore
    confidence = Column(DECIMAL(5, 2), nullable=False)  # type: ignore
    actionable = Column(Boolean, nullable=False)  # type: ignore
    
    # Supporting data
    data_support = Column(JSON, default={}, nullable=False)  # type: ignore
    related_metrics = Column(JSON, default=[], nullable=False)  # type: ignore
    
    # User interaction
    viewed = Column(Boolean, default=False, nullable=False)  # type: ignore
    viewed_at = Column(DateTime, nullable=True)  # type: ignore
    user_rating = Column(Integer, nullable=True)  # type: ignore  # 1-5 rating
    user_feedback = Column(Text, nullable=True)  # type: ignore
    
    # Timestamps
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)  # type: ignore
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # type: ignore

    # Relationships
    analytics_result = relationship("AnalyticsResult")
    twin = relationship("DigitalTwin")

    # Indexes
    __table_args__ = (
        Index('idx_insights_twin', 'twin_id', 'category', 'generated_at'),
        Index('idx_insights_impact', 'impact_score', 'actionable'),
        Index('idx_insights_result', 'analytics_result_id'),
        {'extend_existing': True}
    )

    def __repr__(self):
        return f"<AnalyticsInsight(id={self.id}, title={self.title}, impact={self.impact_score})>"

class LearningPipelineStats(Base):  # type: ignore
    """
    Statistics and metrics for the continuous learning pipeline
    Tracks pipeline performance and learning effectiveness
    """
    __tablename__ = "learning_pipeline_stats"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=True, index=True)  # type: ignore  # Null for global stats
    
    # Pipeline statistics
    total_processed = Column(Integer, default=0, nullable=False)  # type: ignore
    successful_updates = Column(Integer, default=0, nullable=False)  # type: ignore
    failed_updates = Column(Integer, default=0, nullable=False)  # type: ignore
    models_improved = Column(Integer, default=0, nullable=False)  # type: ignore
    
    # Queue statistics
    queue_size = Column(Integer, default=0, nullable=False)  # type: ignore
    active_models = Column(Integer, default=0, nullable=False)  # type: ignore
    
    # Performance metrics
    avg_processing_time_ms = Column(Integer, nullable=True)  # type: ignore
    success_rate = Column(DECIMAL(5, 2), nullable=True)  # type: ignore
    improvement_rate = Column(DECIMAL(5, 2), nullable=True)  # type: ignore
    
    # Time period
    period_start = Column(DateTime, nullable=False, index=True)  # type: ignore
    period_end = Column(DateTime, nullable=False, index=True)  # type: ignore
    period_type = Column(String(50), nullable=False)  # type: ignore  # hourly, daily, weekly
    
    # Timestamps
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)  # type: ignore
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # type: ignore

    # Relationships
    twin = relationship("DigitalTwin")

    # Indexes
    __table_args__ = (
        Index('idx_pipeline_stats', 'twin_id', 'period_type', 'recorded_at'),
        Index('idx_pipeline_period', 'period_start', 'period_end'),
        {'extend_existing': True}
    )

    def __repr__(self):
        return f"<LearningPipelineStats(id={self.id}, twin_id={self.twin_id}, processed={self.total_processed})>"