"""
Performance & Monitoring Database Models
Enhanced database schemas for Performance & Monitoring Components
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, JSON, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class UserSession(Base):
    """User session tracking for UX analytics"""
    __tablename__ = 'user_sessions'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    session_id = Column(String, unique=True, nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    duration = Column(Integer)  # in seconds
    page_views = Column(Integer, default=0)
    interactions = Column(Integer, default=0)
    device_type = Column(String)  # desktop, mobile, tablet
    browser = Column(String)
    os = Column(String)
    location = Column(String)
    ip_address = Column(String)
    user_agent = Column(Text)
    bounce_rate = Column(Float)
    conversion_events = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    page_views_rel = relationship("PageView", back_populates="session")
    web_vitals = relationship("WebVital", back_populates="session")
    
    # Indexes
    __table_args__ = (
        Index('idx_user_sessions_user_id', 'user_id'),
        Index('idx_user_sessions_start_time', 'start_time'),
        Index('idx_user_sessions_device_type', 'device_type'),
    )

class PageView(Base):
    """Individual page view tracking"""
    __tablename__ = 'page_views'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey('user_sessions.id'), nullable=False)
    page_path = Column(String, nullable=False)
    page_title = Column(String)
    referrer = Column(String)
    load_time = Column(Float)  # in milliseconds
    time_on_page = Column(Integer)  # in seconds
    scroll_depth = Column(Float)  # percentage
    exit_page = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("UserSession", back_populates="page_views_rel")
    
    # Indexes
    __table_args__ = (
        Index('idx_page_views_session_id', 'session_id'),
        Index('idx_page_views_page_path', 'page_path'),
        Index('idx_page_views_timestamp', 'timestamp'),
    )

class WebVital(Base):
    """Core Web Vitals tracking"""
    __tablename__ = 'web_vitals'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey('user_sessions.id'), nullable=False)
    page_path = Column(String, nullable=False)
    metric_name = Column(String, nullable=False)  # FCP, LCP, FID, CLS, TTI
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String)  # ms, s, or empty for CLS
    rating = Column(String)  # good, needs-improvement, poor
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("UserSession", back_populates="web_vitals")
    
    # Indexes
    __table_args__ = (
        Index('idx_web_vitals_session_id', 'session_id'),
        Index('idx_web_vitals_metric_name', 'metric_name'),
        Index('idx_web_vitals_timestamp', 'timestamp'),
        Index('idx_web_vitals_page_path', 'page_path'),
    )

class DatabaseQuery(Base):
    """Database query performance tracking"""
    __tablename__ = 'database_queries'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    query_hash = Column(String, nullable=False)  # MD5 hash of normalized query
    query_text = Column(Text, nullable=False)
    database_name = Column(String, nullable=False)
    table_name = Column(String)
    query_type = Column(String)  # SELECT, INSERT, UPDATE, DELETE
    execution_time = Column(Float, nullable=False)  # in milliseconds
    rows_examined = Column(Integer)
    rows_returned = Column(Integer)
    index_used = Column(Boolean, default=False)
    cache_hit = Column(Boolean, default=False)
    user_id = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Indexes
    __table_args__ = (
        Index('idx_database_queries_hash', 'query_hash'),
        Index('idx_database_queries_database', 'database_name'),
        Index('idx_database_queries_execution_time', 'execution_time'),
        Index('idx_database_queries_timestamp', 'timestamp'),
    )

class QueryOptimization(Base):
    """Query optimization recommendations"""
    __tablename__ = 'query_optimizations'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    query_hash = Column(String, nullable=False)
    optimization_type = Column(String, nullable=False)  # index, query_rewrite, caching, partitioning
    priority = Column(String, nullable=False)  # high, medium, low
    description = Column(Text, nullable=False)
    estimated_improvement = Column(String)
    effort_level = Column(String)  # low, medium, high
    implementation_steps = Column(JSON)
    status = Column(String, default='pending')  # pending, implemented, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexes
    __table_args__ = (
        Index('idx_query_optimizations_hash', 'query_hash'),
        Index('idx_query_optimizations_priority', 'priority'),
        Index('idx_query_optimizations_status', 'status'),
    )

class BundleAsset(Base):
    """Bundle asset tracking"""
    __tablename__ = 'bundle_assets'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    build_id = Column(String, nullable=False)
    asset_name = Column(String, nullable=False)
    asset_type = Column(String, nullable=False)  # js, css, image, font, other
    file_size = Column(Integer, nullable=False)  # in bytes
    gzip_size = Column(Integer)
    brotli_size = Column(Integer)
    chunks = Column(JSON)  # array of chunk names
    modules = Column(JSON)  # array of module names
    is_entry = Column(Boolean, default=False)
    is_initial = Column(Boolean, default=False)
    optimization_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    optimizations = relationship("AssetOptimization", back_populates="asset")
    
    # Indexes
    __table_args__ = (
        Index('idx_bundle_assets_build_id', 'build_id'),
        Index('idx_bundle_assets_type', 'asset_type'),
        Index('idx_bundle_assets_size', 'file_size'),
    )

class AssetOptimization(Base):
    """Asset optimization recommendations"""
    __tablename__ = 'asset_optimizations'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id = Column(String, ForeignKey('bundle_assets.id'), nullable=False)
    optimization_type = Column(String, nullable=False)  # code_splitting, tree_shaking, compression, lazy_loading, asset_optimization
    priority = Column(String, nullable=False)  # high, medium, low
    title = Column(String, nullable=False)
    description = Column(Text)
    impact_description = Column(String)
    effort_level = Column(String)  # low, medium, high
    estimated_savings = Column(Integer)  # in bytes
    implementation_steps = Column(JSON)
    status = Column(String, default='pending')  # pending, implemented, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    asset = relationship("BundleAsset", back_populates="optimizations")
    
    # Indexes
    __table_args__ = (
        Index('idx_asset_optimizations_asset_id', 'asset_id'),
        Index('idx_asset_optimizations_priority', 'priority'),
        Index('idx_asset_optimizations_type', 'optimization_type'),
    )

class PerformanceMetric(Base):
    """General performance metrics tracking"""
    __tablename__ = 'performance_metrics'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String)
    category = Column(String)  # frontend, backend, database, infrastructure
    component = Column(String)  # specific component or service
    status = Column(String)  # good, warning, critical
    threshold_warning = Column(Float)
    threshold_critical = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Indexes
    __table_args__ = (
        Index('idx_performance_metrics_name', 'metric_name'),
        Index('idx_performance_metrics_category', 'category'),
        Index('idx_performance_metrics_timestamp', 'timestamp'),
        Index('idx_performance_metrics_status', 'status'),
    )

class PerformanceAlert(Base):
    """Performance alerts and notifications"""
    __tablename__ = 'performance_alerts'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_type = Column(String, nullable=False)  # performance, error, resource, security
    severity = Column(String, nullable=False)  # low, medium, high, critical
    title = Column(String, nullable=False)
    description = Column(Text)
    component = Column(String)
    metric_name = Column(String)
    metric_value = Column(Float)
    threshold_value = Column(Float)
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime)
    resolved_by = Column(String)
    actions_taken = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexes
    __table_args__ = (
        Index('idx_performance_alerts_type', 'alert_type'),
        Index('idx_performance_alerts_severity', 'severity'),
        Index('idx_performance_alerts_resolved', 'resolved'),
        Index('idx_performance_alerts_created_at', 'created_at'),
    )

class SystemHealth(Base):
    """System health metrics"""
    __tablename__ = 'system_health'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    server_id = Column(String, nullable=False)
    cpu_usage = Column(Float)  # percentage
    memory_usage = Column(Float)  # percentage
    disk_usage = Column(Float)  # percentage
    network_io = Column(Float)  # MB/s
    active_connections = Column(Integer)
    response_time = Column(Float)  # milliseconds
    error_rate = Column(Float)  # percentage
    uptime = Column(Float)  # percentage
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Indexes
    __table_args__ = (
        Index('idx_system_health_server_id', 'server_id'),
        Index('idx_system_health_timestamp', 'timestamp'),
    )