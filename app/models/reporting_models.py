"""
Advanced Reporting Models for Database-Driven Implementation
SQLAlchemy 2.0 models for comprehensive reporting and analytics
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, Dict, Any, List

Base = declarative_base()

class ReportTemplate(Base):
    """Report templates for custom report generation"""
    __tablename__ = 'report_templates'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    category = Column(String(100), nullable=False, index=True)
    report_type = Column(String(50), nullable=False)  # table, chart, dashboard, pivot, summary
    
    # Configuration
    data_source_config = Column(JSON)  # Data source configuration
    filter_config = Column(JSON)  # Filter definitions
    column_config = Column(JSON)  # Column settings
    visualization_config = Column(JSON)  # Chart/visualization settings
    schedule_config = Column(JSON)  # Scheduling configuration
    
    # Metadata
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)
    
    # Relationships
    executions = relationship("ReportExecution", back_populates="template")
    
    __table_args__ = (
        Index('idx_report_templates_category_type', 'category', 'report_type'),
        Index('idx_report_templates_created_by', 'created_by'),
    )

class ReportExecution(Base):
    """Report execution history and results"""
    __tablename__ = 'report_executions'
    
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey('report_templates.id'), nullable=False)
    
    # Execution details
    execution_status = Column(String(50), nullable=False)  # pending, running, completed, failed
    execution_time = Column(Float)  # Execution time in milliseconds
    data_points_processed = Column(Integer)
    result_size = Column(Integer)  # Size of result in bytes
    
    # Parameters and results
    execution_parameters = Column(JSON)  # Runtime parameters
    result_data = Column(JSON)  # Execution results (for small datasets)
    result_file_path = Column(String(500))  # Path to result file (for large datasets)
    error_message = Column(Text)
    
    # Metadata
    executed_by = Column(Integer, ForeignKey('users.id'))
    executed_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    template = relationship("ReportTemplate", back_populates="executions")
    
    __table_args__ = (
        Index('idx_report_executions_template_status', 'template_id', 'execution_status'),
        Index('idx_report_executions_executed_by', 'executed_by'),
        Index('idx_report_executions_executed_at', 'executed_at'),
    )

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
    predictions = relationship("ModelPrediction", back_populates="model")
    
    __table_args__ = (
        Index('idx_predictive_models_type_status', 'model_type', 'status'),
        Index('idx_predictive_models_created_by', 'created_by'),
        Index('idx_predictive_models_last_trained', 'last_trained'),
    )

class ModelPrediction(Base):
    """Model predictions and forecasts"""
    __tablename__ = 'model_predictions'
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey('predictive_models.id'), nullable=False)
    
    # Prediction details
    prediction_date = Column(DateTime(timezone=True), nullable=False)
    predicted_value = Column(JSON)  # Can be numeric, categorical, or complex
    confidence_score = Column(Float)
    prediction_interval = Column(JSON)  # Confidence intervals
    
    # Input features
    input_features = Column(JSON)  # Features used for prediction
    feature_importance = Column(JSON)  # Feature importance for this prediction
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    prediction_type = Column(String(50))  # forecast, classification, anomaly, etc.
    
    # Relationships
    model = relationship("PredictiveModel", back_populates="predictions")
    
    __table_args__ = (
        Index('idx_model_predictions_model_date', 'model_id', 'prediction_date'),
        Index('idx_model_predictions_type', 'prediction_type'),
    )

class ReportSchedule(Base):
    """Scheduled report executions"""
    __tablename__ = 'report_schedules'
    
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey('report_templates.id'), nullable=False)
    
    # Schedule configuration
    schedule_name = Column(String(255), nullable=False)
    frequency = Column(String(50), nullable=False)  # hourly, daily, weekly, monthly
    schedule_config = Column(JSON)  # Cron expression, specific times, etc.
    
    # Delivery configuration
    delivery_method = Column(String(50))  # email, webhook, file_system, dashboard
    delivery_config = Column(JSON)  # Delivery parameters
    
    # Status
    is_active = Column(Boolean, default=True)
    last_execution = Column(DateTime(timezone=True))
    next_execution = Column(DateTime(timezone=True))
    execution_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    
    # Metadata
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_report_schedules_template_active', 'template_id', 'is_active'),
        Index('idx_report_schedules_next_execution', 'next_execution'),
    )

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