"""
Performance monitoring models for real-time dashboards and optimization tools
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, Float, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class CorePerformanceMetric(Base):  # type: ignore
    """Core performance metrics collection"""
    __tablename__ = "core_performance_metrics"
    
    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, nullable=False)  # type: ignore
    
    # Metric Identification
    metric_name = Column(String(255), nullable=False, index=True)  # type: ignore
    metric_category = Column(String(100), nullable=False, index=True)  # type: ignore  # system, database, api, user_experience
    metric_type = Column(String(50), nullable=False)  # type: ignore  # counter, gauge, histogram, timer
    
    # Metric Values
    value = Column(Float, nullable=False)  # type: ignore
    unit = Column(String(50))  # type: ignore  # ms, seconds, bytes, percentage, count
    
    # Context and Metadata
    source = Column(String(255))  # type: ignore  # service, endpoint, component that generated metric
    tags = Column(JSON)  # type: ignore  # Additional metadata tags
    dimensions = Column(JSON)  # type: ignore  # Dimensional data for grouping/filtering
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)  # type: ignore
    collection_interval = Column(Integer, default=60)  # type: ignore  # seconds
    
    # Aggregation Support
    aggregation_period = Column(String(20))  # type: ignore  # minute, hour, day
    sample_count = Column(Integer, default=1)  # type: ignore
    
    # Relationships
    alerts = relationship("PerformanceAlert", back_populates="metric", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_perf_metric_tenant_name_time', 'tenant_id', 'metric_name', 'timestamp'),
        Index('idx_perf_metric_category_time', 'metric_category', 'timestamp'),
        Index('idx_perf_metric_source_time', 'source', 'timestamp'),
    )


class SystemHealthCheck(Base):  # type: ignore
    """System health monitoring and status tracking"""
    __tablename__ = "system_health_checks"
    
    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, nullable=False)  # type: ignore
    
    # Health Check Details
    check_name = Column(String(255), nullable=False)  # type: ignore
    check_type = Column(String(100), nullable=False)  # type: ignore  # database, api, service, external
    component = Column(String(255), nullable=False)  # type: ignore  # Component being checked
    
    # Status
    status = Column(String(20), nullable=False)  # type: ignore  # healthy, warning, critical, unknown
    response_time_ms = Column(Float)  # type: ignore
    
    # Check Results
    success = Column(Boolean, nullable=False)  # type: ignore
    error_message = Column(Text)  # type: ignore
    details = Column(JSON)  # type: ignore  # Additional check details
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)  # type: ignore
    next_check_at = Column(DateTime)  # type: ignore
    
    # Configuration
    check_interval_seconds = Column(Integer, default=300)  # type: ignore  # 5 minutes
    timeout_seconds = Column(Integer, default=30)  # type: ignore
    
    # Relationships
    incidents = relationship("PerformanceIncident", back_populates="health_check", cascade="all, delete-orphan")


class QueryPerformance(Base):  # type: ignore
    """Database query performance tracking and optimization"""
    __tablename__ = "query_performance"
    
    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, nullable=False)  # type: ignore
    
    # Query Identification
    query_hash = Column(String(64), nullable=False, index=True)  # type: ignore  # Hash of normalized query
    query_text = Column(Text)  # type: ignore  # Actual query (may be truncated)
    query_type = Column(String(50))  # type: ignore  # SELECT, INSERT, UPDATE, DELETE
    
    # Performance Metrics
    execution_time_ms = Column(Float, nullable=False)  # type: ignore
    rows_examined = Column(Integer)  # type: ignore
    rows_returned = Column(Integer)  # type: ignore
    bytes_sent = Column(Integer)  # type: ignore
    
    # Resource Usage
    cpu_time_ms = Column(Float)  # type: ignore
    memory_usage_bytes = Column(Integer)  # type: ignore
    io_operations = Column(Integer)  # type: ignore
    
    # Context
    database_name = Column(String(255))  # type: ignore
    table_names = Column(JSON)  # type: ignore  # List of tables accessed
    endpoint = Column(String(500))  # type: ignore  # API endpoint that triggered query
    user_id = Column(Integer)  # type: ignore
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)  # type: ignore
    
    # Analysis
    is_slow_query = Column(Boolean, default=False, index=True)  # type: ignore
    optimization_suggestions = Column(JSON)  # type: ignore
    index_recommendations = Column(JSON)  # type: ignore
    
    # Indexes for performance analysis
    __table_args__ = (
        Index('idx_query_perf_hash_time', 'query_hash', 'timestamp'),
        Index('idx_query_perf_slow', 'is_slow_query', 'timestamp'),
        Index('idx_query_perf_execution_time', 'execution_time_ms'),
    )


class UserExperienceMetric(Base):  # type: ignore
    """User experience tracking and analytics"""
    __tablename__ = "user_experience_metrics"
    
    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, nullable=False)  # type: ignore
    user_id = Column(Integer, index=True)  # type: ignore
    session_id = Column(String(255), index=True)  # type: ignore
    
    # Page/Action Identification
    page_url = Column(String(1000))  # type: ignore
    action_type = Column(String(100))  # type: ignore  # page_load, click, form_submit, api_call
    component = Column(String(255))  # type: ignore  # UI component or feature
    
    # Performance Metrics
    load_time_ms = Column(Float)  # type: ignore
    first_contentful_paint_ms = Column(Float)  # type: ignore
    largest_contentful_paint_ms = Column(Float)  # type: ignore
    cumulative_layout_shift = Column(Float)  # type: ignore
    first_input_delay_ms = Column(Float)  # type: ignore
    
    # User Context
    device_type = Column(String(50))  # type: ignore  # desktop, mobile, tablet
    browser = Column(String(100))  # type: ignore
    operating_system = Column(String(100))  # type: ignore
    screen_resolution = Column(String(50))  # type: ignore
    connection_type = Column(String(50))  # type: ignore
    
    # Geographic Data
    country = Column(String(100))  # type: ignore
    region = Column(String(100))  # type: ignore
    city = Column(String(100))  # type: ignore
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)  # type: ignore
    
    # User Satisfaction
    user_rating = Column(Integer)  # type: ignore  # 1-5 rating if provided
    bounce = Column(Boolean, default=False)  # type: ignore  # Did user leave immediately
    conversion = Column(Boolean, default=False)  # type: ignore  # Did user complete desired action
    
    # Error Tracking
    error_occurred = Column(Boolean, default=False)  # type: ignore
    error_message = Column(Text)  # type: ignore
    error_stack = Column(Text)  # type: ignore
    
    # Indexes for analytics
    __table_args__ = (
        Index('idx_ux_metric_user_time', 'user_id', 'timestamp'),
        Index('idx_ux_metric_page_time', 'page_url', 'timestamp'),
        Index('idx_ux_metric_action_time', 'action_type', 'timestamp'),
    )


class PerformanceAlert(Base):  # type: ignore
    """Performance alerts and thresholds"""
    __tablename__ = "performance_alerts"
    
    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, nullable=False)  # type: ignore
    metric_id = Column(Integer, ForeignKey("core_performance_metrics.id"))  # type: ignore
    
    # Alert Configuration
    alert_name = Column(String(255), nullable=False)  # type: ignore
    alert_type = Column(String(50), nullable=False)  # type: ignore  # threshold, anomaly, trend
    severity = Column(String(20), nullable=False)  # type: ignore  # low, medium, high, critical
    
    # Threshold Configuration
    threshold_value = Column(Float)  # type: ignore
    threshold_operator = Column(String(10))  # type: ignore  # >, <, >=, <=, ==, !=
    threshold_duration_minutes = Column(Integer, default=5)  # type: ignore
    
    # Alert State
    status = Column(String(20), default="active")  # type: ignore  # active, suppressed, resolved
    triggered_at = Column(DateTime)  # type: ignore
    resolved_at = Column(DateTime)  # type: ignore
    last_notification_at = Column(DateTime)  # type: ignore
    
    # Notification Configuration
    notification_channels = Column(JSON)  # type: ignore  # email, slack, webhook, etc.
    notification_frequency_minutes = Column(Integer, default=60)  # type: ignore
    
    # Alert Details
    description = Column(Text)  # type: ignore
    current_value = Column(Float)  # type: ignore
    message = Column(Text)  # type: ignore
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow)  # type: ignore
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # type: ignore
    
    # Relationships
    metric = relationship("CorePerformanceMetric", back_populates="alerts")
    incidents = relationship("PerformanceIncident", back_populates="alert", cascade="all, delete-orphan")


class PerformanceIncident(Base):  # type: ignore
    """Performance incidents and issue tracking"""
    __tablename__ = "performance_incidents"
    
    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, nullable=False)  # type: ignore
    alert_id = Column(Integer, ForeignKey("performance_alerts.id"))  # type: ignore
    health_check_id = Column(Integer, ForeignKey("system_health_checks.id"))  # type: ignore
    
    # Incident Details
    title = Column(String(500), nullable=False)  # type: ignore
    description = Column(Text)  # type: ignore
    severity = Column(String(20), nullable=False)  # type: ignore  # low, medium, high, critical
    category = Column(String(100))  # type: ignore  # performance, availability, error_rate
    
    # Status Tracking
    status = Column(String(20), default="open")  # type: ignore  # open, investigating, resolved, closed
    priority = Column(String(20), default="medium")  # type: ignore  # low, medium, high, urgent
    
    # Impact Assessment
    affected_users_count = Column(Integer)  # type: ignore
    affected_components = Column(JSON)  # type: ignore
    business_impact = Column(String(20))  # type: ignore  # low, medium, high, critical
    
    # Resolution
    root_cause = Column(Text)  # type: ignore
    resolution_notes = Column(Text)  # type: ignore
    prevention_measures = Column(JSON)  # type: ignore
    
    # Timing
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # type: ignore
    detected_at = Column(DateTime)  # type: ignore
    acknowledged_at = Column(DateTime)  # type: ignore
    resolved_at = Column(DateTime)  # type: ignore
    closed_at = Column(DateTime)  # type: ignore
    
    # Assignment
    assigned_to = Column(Integer)  # type: ignore  # User ID
    escalated_to = Column(Integer)  # type: ignore  # User ID
    
    # Communication
    communication_log = Column(JSON)  # type: ignore  # Timeline of communications
    external_communication = Column(Text)  # type: ignore  # Public status page updates
    
    # Relationships
    alert = relationship("PerformanceAlert", back_populates="incidents")
    health_check = relationship("SystemHealthCheck", back_populates="incidents")


class PerformanceBaseline(Base):  # type: ignore
    """Performance baselines for comparison and anomaly detection"""
    __tablename__ = "performance_baselines"
    
    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, nullable=False)  # type: ignore
    
    # Baseline Identification
    metric_name = Column(String(255), nullable=False)  # type: ignore
    component = Column(String(255))  # type: ignore
    time_period = Column(String(50))  # type: ignore  # hourly, daily, weekly
    
    # Statistical Baselines
    mean_value = Column(Float)  # type: ignore
    median_value = Column(Float)  # type: ignore
    p95_value = Column(Float)  # type: ignore
    p99_value = Column(Float)  # type: ignore
    min_value = Column(Float)  # type: ignore
    max_value = Column(Float)  # type: ignore
    std_deviation = Column(Float)  # type: ignore
    
    # Baseline Metadata
    sample_count = Column(Integer)  # type: ignore
    confidence_level = Column(Float, default=0.95)  # type: ignore
    
    # Validity Period
    valid_from = Column(DateTime, nullable=False)  # type: ignore
    valid_until = Column(DateTime)  # type: ignore
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow)  # type: ignore
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # type: ignore
    
    # Indexes for baseline lookups
    __table_args__ = (
        Index('idx_baseline_metric_period', 'metric_name', 'time_period', 'valid_from'),
        Index('idx_baseline_component_time', 'component', 'valid_from'),
        {'extend_existing': True}
    )


class PerformanceOptimization(Base):  # type: ignore
    """Performance optimization recommendations and tracking"""
    __tablename__ = "performance_optimizations"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, nullable=False)  # type: ignore
    
    # Optimization Details
    optimization_type = Column(String(100), nullable=False)  # type: ignore  # query, index, caching, scaling
    component = Column(String(255), nullable=False)  # type: ignore
    title = Column(String(500), nullable=False)  # type: ignore
    description = Column(Text)  # type: ignore
    
    # Impact Assessment
    current_performance = Column(JSON)  # type: ignore  # Current metrics
    expected_improvement = Column(JSON)  # type: ignore  # Expected improvements
    effort_estimate = Column(String(20))  # type: ignore  # low, medium, high
    priority_score = Column(Float)  # type: ignore
    
    # Implementation
    implementation_steps = Column(JSON)  # type: ignore
    implementation_status = Column(String(20), default="pending")  # type: ignore  # pending, in_progress, completed, rejected
    implemented_at = Column(DateTime)  # type: ignore
    implemented_by = Column(Integer)  # type: ignore  # User ID
    
    # Results Tracking
    actual_improvement = Column(JSON)  # type: ignore  # Measured improvements after implementation
    success_metrics = Column(JSON)  # type: ignore
    rollback_plan = Column(Text)  # type: ignore
    
    # Timing
    identified_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # type: ignore
    target_completion = Column(DateTime)  # type: ignore
    
    # Relationships and Dependencies
    dependencies = Column(JSON)  # type: ignore  # Other optimizations this depends on
    related_incidents = Column(JSON)  # type: ignore  # Related incident IDs
    
    # Approval Workflow
    approval_status = Column(String(20), default="pending")  # type: ignore  # pending, approved, rejected
    approved_by = Column(Integer)  # type: ignore  # User ID
    approved_at = Column(DateTime)  # type: ignore
    rejection_reason = Column(Text)  # type: ignore