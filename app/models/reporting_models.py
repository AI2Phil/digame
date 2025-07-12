"""
Advanced Reporting Models for Database-Driven Implementation
SQLAlchemy 2.0 models for comprehensive reporting and analytics
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, Dict, Any, List
from app.database import Base

# Import the ReportTemplate and ReportExecution from the main reporting module to avoid conflicts
from .reporting import ReportTemplate, ReportExecution

class DataSource(Base):
    """Data sources for report generation"""
    __tablename__ = 'data_sources'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    source_type = Column(String(50), nullable=False)  # database, api, file, warehouse
    
    # Connection details
    connection_config = Column(JSON)  # Connection parameters
    authentication_config = Column(JSON)  # Auth details (encrypted)
    schema_config = Column(JSON)  # Available tables/fields
    
    # Status and performance
    status = Column(String(50), default='active')  # active, inactive, error, syncing
    last_sync_at = Column(DateTime(timezone=True))
    sync_frequency = Column(String(50))  # hourly, daily, weekly, manual
    avg_response_time = Column(Float)
    success_rate = Column(Float, default=1.0)
    
    # Metadata
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    __table_args__ = (
        Index('idx_data_sources_type_status', 'source_type', 'status'),
        Index('idx_data_sources_created_by', 'created_by'),
    )

class VisualizationMetric(Base):
    """Visualization engine performance metrics"""
    __tablename__ = 'visualization_metrics'
    
    id = Column(Integer, primary_key=True, index=True)
    chart_type = Column(String(50), nullable=False, index=True)
    
    # Performance metrics
    usage_count = Column(Integer, default=0)
    avg_render_time = Column(Float)  # Average render time in milliseconds
    min_render_time = Column(Float)
    max_render_time = Column(Float)
    success_rate = Column(Float, default=1.0)
    
    # Data handling
    avg_data_points = Column(Integer)
    max_data_points = Column(Integer)
    data_size_category = Column(String(20))  # small, medium, large, xlarge
    
    # Theme and configuration
    theme_usage = Column(JSON)  # Theme usage statistics
    animation_usage = Column(JSON)  # Animation usage patterns
    
    # Metadata
    date = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_visualization_metrics_chart_type_date', 'chart_type', 'date'),
        Index('idx_visualization_metrics_data_size', 'data_size_category'),
    )

class PredictiveModel(Base):
    """Predictive analytics models"""
    __tablename__ = 'predictive_models'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    model_type = Column(String(50), nullable=False)  # regression, classification, clustering, time_series, anomaly_detection
    algorithm = Column(String(100), nullable=False)
    
    # Model configuration
    model_config = Column(JSON)  # Model parameters and settings
    feature_config = Column(JSON)  # Feature definitions and importance
    training_config = Column(JSON)  # Training parameters
    
    # Performance metrics
    accuracy_score = Column(Float)
    precision_score = Column(Float)
    recall_score = Column(Float)
    f1_score = Column(Float)
    confidence_interval = Column(Float)
    
    # Training details
    training_data_source = Column(String(255))
    training_data_size = Column(Integer)
    training_duration = Column(Float)  # Training time in seconds
    last_trained = Column(DateTime(timezone=True))
    next_training = Column(DateTime(timezone=True))
    
    # Status
    status = Column(String(50), default='active')  # active, training, inactive, error
    version = Column(String(50))
    
    # Metadata
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    predictions = relationship("ModelPrediction", back_populates="predictive_model")
    
    __table_args__ = (
        Index('idx_predictive_models_type_status', 'model_type', 'status'),
        Index('idx_predictive_models_created_by', 'created_by'),
        Index('idx_predictive_models_last_trained', 'last_trained'),
    )

# Import ModelPrediction from ml_models to avoid conflicts
from .ml_models import ModelPrediction

# Import ReportSchedule from the main reporting module to avoid conflicts
from .reporting import ReportSchedule

class ReportInsight(Base):
    """AI-generated insights from reports"""
    __tablename__ = 'report_insights'
    
    id = Column(Integer, primary_key=True, index=True)
    report_execution_id = Column(Integer, ForeignKey('report_executions.id'))
    
    # Insight details
    insight_type = Column(String(50), nullable=False)  # trend, anomaly, correlation, recommendation
    title = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Analysis
    confidence_score = Column(Float)
    impact_level = Column(String(20))  # low, medium, high, critical
    priority = Column(String(20))  # low, medium, high
    
    # Supporting data
    supporting_data = Column(JSON)  # Data that supports the insight
    recommendations = Column(JSON)  # Actionable recommendations
    
    # Metadata
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    is_actionable = Column(Boolean, default=False)
    is_reviewed = Column(Boolean, default=False)
    
    __table_args__ = (
        Index('idx_report_insights_type_impact', 'insight_type', 'impact_level'),
        Index('idx_report_insights_execution', 'report_execution_id'),
    )