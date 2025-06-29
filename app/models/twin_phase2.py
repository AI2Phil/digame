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

from .user import Base

class ConversationStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"

class LearningStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class TwinConversation(Base):
    """
    Stores conversation sessions between users and their digital twins
    Provides persistent storage for conversation history and context
    """
    __tablename__ = "twin_conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    conversation_id = Column(String, nullable=False, index=True)  # Session identifier
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Conversation metadata
    title = Column(String(255), nullable=True)  # Auto-generated or user-defined title
    status = Column(String(50), default=ConversationStatus.ACTIVE.value, nullable=False)
    message_count = Column(Integer, default=0, nullable=False)
    
    # Conversation statistics
    total_queries = Column(Integer, default=0, nullable=False)
    total_responses = Column(Integer, default=0, nullable=False)
    avg_confidence = Column(DECIMAL(5, 2), nullable=True)
    intent_distribution = Column(JSON, default={}, nullable=False)  # {"intent": count}
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_activity_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    twin = relationship("DigitalTwin")
    user = relationship("User")
    messages = relationship("TwinConversationMessage", back_populates="conversation", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_twin_conversations', 'twin_id', 'conversation_id'),
        Index('idx_conversation_activity', 'user_id', 'last_activity_at'),
    )

    def __repr__(self):
        return f"<TwinConversation(id={self.id}, twin_id={self.twin_id}, messages={self.message_count})>"

class TwinConversationMessage(Base):
    """
    Individual messages within twin conversations
    Stores queries, responses, intents, and metadata for each interaction
    """
    __tablename__ = "twin_conversation_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("twin_conversations.id"), nullable=False, index=True)
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    
    # Message content
    message_type = Column(String(50), nullable=False)  # 'query', 'response'
    content = Column(Text, nullable=False)
    
    # NLP Analysis (for queries)
    intent = Column(String(100), nullable=True)
    intent_confidence = Column(DECIMAL(5, 2), nullable=True)
    entities = Column(JSON, default=[], nullable=False)  # Extracted entities
    
    # Response metadata (for responses)
    response_confidence = Column(DECIMAL(5, 2), nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    template_used = Column(String(255), nullable=True)
    context_factors = Column(JSON, default=[], nullable=False)
    
    # Actions and follow-ups
    actions = Column(JSON, default=[], nullable=False)  # Extracted actionable items
    user_feedback = Column(Integer, nullable=True)  # 1-5 rating
    feedback_comment = Column(Text, nullable=True)
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    conversation = relationship("TwinConversation", back_populates="messages")
    twin = relationship("DigitalTwin")

    # Indexes
    __table_args__ = (
        Index('idx_conversation_messages', 'conversation_id', 'timestamp'),
        Index('idx_twin_messages', 'twin_id', 'message_type', 'timestamp'),
        Index('idx_message_intent', 'intent', 'intent_confidence'),
    )

    def __repr__(self):
        return f"<TwinConversationMessage(id={self.id}, type={self.message_type}, intent={self.intent})>"

class LearningDataItem(Base):
    """
    Individual learning data items in the continuous learning pipeline
    Stores data waiting to be processed or recently processed
    """
    __tablename__ = "learning_data_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    
    # Learning data metadata
    data_type = Column(String(100), nullable=False, index=True)  # productivity_data, activity_data, etc.
    model_type = Column(String(100), nullable=True, index=True)  # pattern_recognition, productivity_prediction, etc.
    priority = Column(String(50), nullable=False, index=True)  # low, medium, high, critical
    
    # Learning data content
    data = Column(JSON, nullable=False)  # The actual learning data
    metadata = Column(JSON, default={}, nullable=False)  # Additional metadata
    
    # Processing status
    status = Column(String(50), default=LearningStatus.PENDING.value, nullable=False, index=True)
    processing_started_at = Column(DateTime, nullable=True)
    processing_completed_at = Column(DateTime, nullable=True)
    processing_duration_ms = Column(Integer, nullable=True)
    
    # Learning results
    model_updated = Column(Boolean, default=False, nullable=False)
    performance_improvement = Column(DECIMAL(5, 2), nullable=True)  # Percentage improvement
    confidence_score = Column(DECIMAL(5, 2), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Sample weight and priority calculation
    sample_weight = Column(DECIMAL(5, 2), nullable=True)
    calculated_priority = Column(DECIMAL(5, 2), nullable=True)
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    twin = relationship("DigitalTwin")

    # Indexes
    __table_args__ = (
        Index('idx_learning_queue', 'status', 'priority', 'timestamp'),
        Index('idx_twin_learning_data', 'twin_id', 'data_type', 'status'),
        Index('idx_learning_processing', 'processing_started_at', 'status'),
    )

    def __repr__(self):
        return f"<LearningDataItem(id={self.id}, twin_id={self.twin_id}, type={self.data_type}, status={self.status})>"

class ModelPerformanceHistory(Base):
    """
    Historical performance tracking for continuous learning models
    Stores performance metrics over time for each model
    """
    __tablename__ = "model_performance_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    model_key = Column(String(255), nullable=False, index=True)  # twin_id_model_type
    model_type = Column(String(100), nullable=False, index=True)
    
    # Performance metrics
    accuracy = Column(DECIMAL(5, 2), nullable=False)
    precision = Column(DECIMAL(5, 2), nullable=False)
    recall = Column(DECIMAL(5, 2), nullable=False)
    f1_score = Column(DECIMAL(5, 2), nullable=False)
    confidence = Column(DECIMAL(5, 2), nullable=False)
    
    # Training metadata
    training_samples = Column(Integer, nullable=False)
    improvement = Column(DECIMAL(5, 2), nullable=False)  # Percentage improvement from previous
    
    # Timestamps
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    twin = relationship("DigitalTwin")

    # Indexes
    __table_args__ = (
        Index('idx_model_performance', 'twin_id', 'model_type', 'recorded_at'),
        Index('idx_performance_tracking', 'model_key', 'recorded_at'),
    )

    def __repr__(self):
        return f"<ModelPerformanceHistory(id={self.id}, model_key={self.model_key}, accuracy={self.accuracy})>"

class AnalyticsResult(Base):
    """
    Results from advanced analytics engine analysis
    Stores comprehensive analysis results, insights, and recommendations
    """
    __tablename__ = "analytics_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    
    # Analysis metadata
    analysis_type = Column(String(100), nullable=False, index=True)  # productivity_analysis, pattern_discovery, etc.
    analysis_name = Column(String(255), nullable=False)
    
    # Analysis parameters
    time_range_start = Column(DateTime, nullable=False, index=True)
    time_range_end = Column(DateTime, nullable=False, index=True)
    data_points = Column(Integer, nullable=False)
    
    # Analysis results
    insights = Column(JSON, default=[], nullable=False)  # List of insights
    metrics = Column(JSON, default={}, nullable=False)  # Calculated metrics
    recommendations = Column(JSON, default=[], nullable=False)  # List of recommendations
    
    # Analysis quality
    confidence = Column(DECIMAL(5, 2), nullable=False)
    data_quality_score = Column(DECIMAL(5, 2), nullable=True)
    
    # Processing metadata
    processing_time_ms = Column(Integer, nullable=True)
    cache_hit = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    analyzed_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=True)  # When analysis becomes stale
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    twin = relationship("DigitalTwin")

    # Indexes
    __table_args__ = (
        Index('idx_analytics_results', 'twin_id', 'analysis_type', 'analyzed_at'),
        Index('idx_analytics_timerange', 'time_range_start', 'time_range_end'),
        Index('idx_analytics_expiry', 'expires_at'),
    )

    def __repr__(self):
        return f"<AnalyticsResult(id={self.id}, twin_id={self.twin_id}, type={self.analysis_type})>"

class AnalyticsInsight(Base):
    """
    Individual insights generated by the analytics engine
    Provides detailed tracking of insights with impact and actionability
    """
    __tablename__ = "analytics_insights"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    analytics_result_id = Column(String, ForeignKey("analytics_results.id"), nullable=False, index=True)
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    
    # Insight content
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)  # performance, improvement, warning, etc.
    
    # Insight metrics
    impact_score = Column(DECIMAL(5, 2), nullable=False)
    confidence = Column(DECIMAL(5, 2), nullable=False)
    actionable = Column(Boolean, nullable=False)
    
    # Supporting data
    data_support = Column(JSON, default={}, nullable=False)
    related_metrics = Column(JSON, default=[], nullable=False)
    
    # User interaction
    viewed = Column(Boolean, default=False, nullable=False)
    viewed_at = Column(DateTime, nullable=True)
    user_rating = Column(Integer, nullable=True)  # 1-5 rating
    user_feedback = Column(Text, nullable=True)
    
    # Timestamps
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    analytics_result = relationship("AnalyticsResult")
    twin = relationship("DigitalTwin")

    # Indexes
    __table_args__ = (
        Index('idx_insights_twin', 'twin_id', 'category', 'generated_at'),
        Index('idx_insights_impact', 'impact_score', 'actionable'),
        Index('idx_insights_result', 'analytics_result_id'),
    )

    def __repr__(self):
        return f"<AnalyticsInsight(id={self.id}, title={self.title}, impact={self.impact_score})>"

class LearningPipelineStats(Base):
    """
    Statistics and metrics for the continuous learning pipeline
    Tracks pipeline performance and learning effectiveness
    """
    __tablename__ = "learning_pipeline_stats"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=True, index=True)  # Null for global stats
    
    # Pipeline statistics
    total_processed = Column(Integer, default=0, nullable=False)
    successful_updates = Column(Integer, default=0, nullable=False)
    failed_updates = Column(Integer, default=0, nullable=False)
    models_improved = Column(Integer, default=0, nullable=False)
    
    # Queue statistics
    queue_size = Column(Integer, default=0, nullable=False)
    active_models = Column(Integer, default=0, nullable=False)
    
    # Performance metrics
    avg_processing_time_ms = Column(Integer, nullable=True)
    success_rate = Column(DECIMAL(5, 2), nullable=True)
    improvement_rate = Column(DECIMAL(5, 2), nullable=True)
    
    # Time period
    period_start = Column(DateTime, nullable=False, index=True)
    period_end = Column(DateTime, nullable=False, index=True)
    period_type = Column(String(50), nullable=False)  # hourly, daily, weekly
    
    # Timestamps
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    twin = relationship("DigitalTwin")

    # Indexes
    __table_args__ = (
        Index('idx_pipeline_stats', 'twin_id', 'period_type', 'recorded_at'),
        Index('idx_pipeline_period', 'period_start', 'period_end'),
    )

    def __repr__(self):
        return f"<LearningPipelineStats(id={self.id}, twin_id={self.twin_id}, processed={self.total_processed})>"