"""
Performance monitoring models for real-time dashboards and optimization tools
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, Float, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class PerformanceMetric(Base):
    """Core performance metrics collection"""
    __tablename__ = "performance_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False, index=True)
    
    # Metric Identification
    metric_name = Column(String(255), nullable=False, index=True)
    metric_category = Column(String(100), nullable=False, index=True)  # system, database, api, user_experience
    metric_type = Column(String(50), nullable=False)  # counter, gauge, histogram, timer
    
    # Metric Values
    value = Column(Float, nullable=False)
    unit = Column(String(50))  # ms, seconds, bytes, percentage, count
    
    # Context and Metadata
    source = Column(String(255))  # service, endpoint, component that generated metric
    tags = Column(JSON)  # Additional metadata tags
    dimensions = Column(JSON)  # Dimensional data for grouping/filtering
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    collection_interval = Column(Integer, default=60)  # seconds
    
    # Aggregation Support
    aggregation_period = Column(String(20))  # minute, hour, day
    sample_count = Column(Integer, default=1)
    
    # Relationships
    alerts = relationship("PerformanceAlert", back_populates="metric", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_perf_metric_tenant_name_time', 'tenant_id', 'metric_name', 'timestamp'),
        Index('idx_perf_metric_category_time', 'metric_category', 'timestamp'),
        Index('idx_perf_metric_source_time', 'source', 'timestamp'),
    )


class SystemHealthCheck(Base):
    """System health monitoring and status tracking"""
    __tablename__ = "system_health_checks"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False, index=True)
    
    # Health Check Details
    check_name = Column(String(255), nullable=False)
    check_type = Column(String(100), nullable=False)  # database, api, service, external
    component = Column(String(255), nullable=False)  # Component being checked
    
    # Status
    status = Column(String(20), nullable=False)  # healthy, warning, critical, unknown
    response_time_ms = Column(Float)
    
    # Check Results
    success = Column(Boolean, nullable=False)
    error_message = Column(Text)
    details = Column(JSON)  # Additional check details
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    next_check_at = Column(DateTime)
    
    # Configuration
    check_interval_seconds = Column(Integer, default=300)  # 5 minutes
    timeout_seconds = Column(Integer, default=30)
    
    # Relationships
    incidents = relationship("PerformanceIncident", back_populates="health_check", cascade="all, delete-orphan")


class QueryPerformance(Base):
    """Database query performance tracking and optimization"""
    __tablename__ = "query_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False, index=True)
    
    # Query Identification
    query_hash = Column(String(64), nullable=False, index=True)  # Hash of normalized query
    query_text = Column(Text)  # Actual query (may be truncated)
    query_type = Column(String(50))  # SELECT, INSERT, UPDATE, DELETE
    
    # Performance Metrics
    execution_time_ms = Column(Float, nullable=False)
    rows_examined = Column(Integer)
    rows_returned = Column(Integer)
    bytes_sent = Column(Integer)
    
    # Resource Usage
    cpu_time_ms = Column(Float)
    memory_usage_bytes = Column(Integer)
    io_operations = Column(Integer)
    
    # Context
    database_name = Column(String(255))
    table_names = Column(JSON)  # List of tables accessed
    endpoint = Column(String(500))  # API endpoint that triggered query
    user_id = Column(Integer)
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Analysis
    is_slow_query = Column(Boolean, default=False, index=True)
    optimization_suggestions = Column(JSON)
    index_recommendations = Column(JSON)
    
    # Indexes for performance analysis
    __table_args__ = (
        Index('idx_query_perf_hash_time', 'query_hash', 'timestamp'),
        Index('idx_query_perf_slow', 'is_slow_query', 'timestamp'),
        Index('idx_query_perf_execution_time', 'execution_time_ms'),
    )


class UserExperienceMetric(Base):
    """User experience tracking and analytics"""
    __tablename__ = "user_experience_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, index=True)
    session_id = Column(String(255), index=True)
    
    # Page/Action Identification
    page_url = Column(String(1000))
    action_type = Column(String(100))  # page_load, click, form_submit, api_call
    component = Column(String(255))  # UI component or feature
    
    # Performance Metrics
    load_time_ms = Column(Float)
    first_contentful_paint_ms = Column(Float)
    largest_contentful_paint_ms = Column(Float)
    cumulative_layout_shift = Column(Float)
    first_input_delay_ms = Column(Float)
    
    # User Context
    device_type = Column(String(50))  # desktop, mobile, tablet
    browser = Column(String(100))
    operating_system = Column(String(100))
    screen_resolution = Column(String(50))
    connection_type = Column(String(50))
    
    # Geographic Data
    country = Column(String(100))
    region = Column(String(100))
    city = Column(String(100))
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # User Satisfaction
    user_rating = Column(Integer)  # 1-5 rating if provided
    bounce = Column(Boolean, default=False)  # Did user leave immediately
    conversion = Column(Boolean, default=False)  # Did user complete desired action
    
    # Error Tracking
    error_occurred = Column(Boolean, default=False)
    error_message = Column(Text)
    error_stack = Column(Text)
    
    # Indexes for analytics
    __table_args__ = (
        Index('idx_ux_metric_user_time', 'user_id', 'timestamp'),
        Index('idx_ux_metric_page_time', 'page_url', 'timestamp'),
        Index('idx_ux_metric_action_time', 'action_type', 'timestamp'),
    )


class PerformanceAlert(Base):
    """Performance alerts and thresholds"""
    __tablename__ = "performance_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False, index=True)
    metric_id = Column(Integer, ForeignKey("performance_metrics.id"))
    
    # Alert Configuration
    alert_name = Column(String(255), nullable=False)
    alert_type = Column(String(50), nullable=False)  # threshold, anomaly, trend
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    
    # Threshold Configuration
    threshold_value = Column(Float)
    threshold_operator = Column(String(10))  # >, <, >=, <=, ==, !=
    threshold_duration_minutes = Column(Integer, default=5)
    
    # Alert State
    status = Column(String(20), default="active")  # active, suppressed, resolved
    triggered_at = Column(DateTime)
    resolved_at = Column(DateTime)
    last_notification_at = Column(DateTime)
    
    # Notification Configuration
    notification_channels = Column(JSON)  # email, slack, webhook, etc.
    notification_frequency_minutes = Column(Integer, default=60)
    
    # Alert Details
    description = Column(Text)
    current_value = Column(Float)
    message = Column(Text)
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    metric = relationship("PerformanceMetric", back_populates="alerts")
    incidents = relationship("PerformanceIncident", back_populates="alert", cascade="all, delete-orphan")


class PerformanceIncident(Base):
    """Performance incidents and issue tracking"""
    __tablename__ = "performance_incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False, index=True)
    alert_id = Column(Integer, ForeignKey("performance_alerts.id"))
    health_check_id = Column(Integer, ForeignKey("system_health_checks.id"))
    
    # Incident Details
    title = Column(String(500), nullable=False)
    description = Column(Text)
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    category = Column(String(100))  # performance, availability, error_rate
    
    # Status Tracking
    status = Column(String(20), default="open")  # open, investigating, resolved, closed
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    
    # Impact Assessment
    affected_users_count = Column(Integer)
    affected_components = Column(JSON)
    business_impact = Column(String(20))  # low, medium, high, critical
    
    # Resolution
    root_cause = Column(Text)
    resolution_notes = Column(Text)
    prevention_measures = Column(JSON)
    
    # Timing
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    detected_at = Column(DateTime)
    acknowledged_at = Column(DateTime)
    resolved_at = Column(DateTime)
    closed_at = Column(DateTime)
    
    # Assignment
    assigned_to = Column(Integer)  # User ID
    escalated_to = Column(Integer)  # User ID
    
    # Communication
    communication_log = Column(JSON)  # Timeline of communications
    external_communication = Column(Text)  # Public status page updates
    
    # Relationships
    alert = relationship("PerformanceAlert", back_populates="incidents")
    health_check = relationship("SystemHealthCheck", back_populates="incidents")


class PerformanceBaseline(Base):
    """Performance baselines for comparison and anomaly detection"""
    __tablename__ = "performance_baselines"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False, index=True)
    
    # Baseline Identification
    metric_name = Column(String(255), nullable=False)
    component = Column(String(255))
    time_period = Column(String(50))  # hourly, daily, weekly
    
    # Statistical Baselines
    mean_value = Column(Float)
    median_value = Column(Float)
    p95_value = Column(Float)
    p99_value = Column(Float)
    min_value = Column(Float)
    max_value = Column(Float)
    std_deviation = Column(Float)
    
    # Baseline Metadata
    sample_count = Column(Integer)
    confidence_level = Column(Float, default=0.95)
    
    # Validity Period
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime)
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexes for baseline lookups
    __table_args__ = (
        Index('idx_baseline_metric_period', 'metric_name', 'time_period', 'valid_from'),
        Index('idx_baseline_component_time', 'component', 'valid_from'),
    )


class PerformanceOptimization(Base):
    """Performance optimization recommendations and tracking"""
    __tablename__ = "performance_optimizations"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False, index=True)
    
    # Optimization Details
    optimization_type = Column(String(100), nullable=False)  # query, index, caching, scaling
    component = Column(String(255), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    
    # Impact Assessment
    current_performance = Column(JSON)  # Current metrics
    expected_improvement = Column(JSON)  # Expected improvements
    effort_estimate = Column(String(20))  # low, medium, high
    priority_score = Column(Float)
    
    # Implementation
    implementation_steps = Column(JSON)
    implementation_status = Column(String(20), default="pending")  # pending, in_progress, completed, rejected
    implemented_at = Column(DateTime)
    implemented_by = Column(Integer)  # User ID
    
    # Results Tracking
    actual_improvement = Column(JSON)  # Measured improvements after implementation
    success_metrics = Column(JSON)
    rollback_plan = Column(Text)
    
    # Timing
    identified_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    target_completion = Column(DateTime)
    
    # Relationships and Dependencies
    dependencies = Column(JSON)  # Other optimizations this depends on
    related_incidents = Column(JSON)  # Related incident IDs
    
    # Approval Workflow
    approval_status = Column(String(20), default="pending")  # pending, approved, rejected
    approved_by = Column(Integer)  # User ID
    approved_at = Column(DateTime)
    rejection_reason = Column(Text)