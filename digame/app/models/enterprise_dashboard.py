"""
Enterprise Dashboard models for unified enterprise feature management
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
from typing import Optional, Dict, Any, List
from datetime import datetime
import enum


class DashboardWidgetType(enum.Enum):
    """Types of dashboard widgets"""
    CHART = "chart"
    METRIC = "metric"
    TABLE = "table"
    REPORT = "report"
    WORKFLOW = "workflow"
    SECURITY = "security"
    INTEGRATION = "integration"
    ANALYTICS = "analytics"
    MARKET_INTELLIGENCE = "market_intelligence"


class DashboardLayout(enum.Enum):
    """Dashboard layout types"""
    GRID = "grid"
    FLEX = "flex"
    CUSTOM = "custom"


class EnterpriseDashboard(Base):
    """
    Enterprise dashboard configurations for unified feature access
    """
    __tablename__ = "enterprise_dashboards"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Dashboard information
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    dashboard_type = Column(String(50), default="enterprise")  # enterprise, executive, operational
    
    # Layout configuration
    layout_type = Column(String(20), default="grid")
    layout_config = Column(JSON, default={})  # Grid configuration, widget positions
    
    # Dashboard settings
    is_default = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    auto_refresh = Column(Boolean, default=True)
    refresh_interval = Column(Integer, default=300)  # seconds
    
    # Access control
    allowed_roles = Column(JSON, default=[])  # Role-based access
    allowed_users = Column(JSON, default=[])  # User-specific access
    
    # Dashboard metadata
    theme = Column(String(50), default="light")
    color_scheme = Column(JSON, default={})
    custom_css = Column(Text)
    
    # Usage tracking
    view_count = Column(Integer, default=0)
    last_viewed = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant")
    creator = relationship("User")
    widgets = relationship("DashboardWidget", back_populates="dashboard", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<EnterpriseDashboard(id={self.id}, name='{self.name}', type='{self.dashboard_type}')>"


class DashboardWidget(Base):
    """
    Individual widgets within enterprise dashboards
    """
    __tablename__ = "dashboard_widgets"

    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey("enterprise_dashboards.id"), nullable=False, index=True)
    
    # Widget identification
    widget_id = Column(String(100), nullable=False)  # Unique within dashboard
    widget_name = Column(String(200), nullable=False)
    widget_type = Column(String(50), nullable=False)
    
    # Widget configuration
    data_source = Column(String(100), nullable=False)  # analytics, reporting, security, etc.
    query_config = Column(JSON, default={})  # Data query configuration
    display_config = Column(JSON, default={})  # Visual display settings
    
    # Layout positioning
    position_x = Column(Integer, default=0)
    position_y = Column(Integer, default=0)
    width = Column(Integer, default=4)
    height = Column(Integer, default=3)
    z_index = Column(Integer, default=1)
    
    # Widget settings
    title = Column(String(200))
    subtitle = Column(String(500))
    is_visible = Column(Boolean, default=True)
    is_resizable = Column(Boolean, default=True)
    is_movable = Column(Boolean, default=True)
    
    # Data refresh
    auto_refresh = Column(Boolean, default=True)
    refresh_interval = Column(Integer, default=300)  # seconds
    last_refreshed = Column(DateTime(timezone=True))
    
    # Performance tracking
    load_time_ms = Column(Float, default=0.0)
    error_count = Column(Integer, default=0)
    last_error = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    dashboard = relationship("EnterpriseDashboard", back_populates="widgets")
    
    def __repr__(self):
        return f"<DashboardWidget(id={self.id}, name='{self.widget_name}', type='{self.widget_type}')>"


class EnterpriseMetric(Base):
    """
    Enterprise-level metrics aggregated from all features
    """
    __tablename__ = "enterprise_metrics"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Metric identification
    metric_name = Column(String(100), nullable=False, index=True)
    metric_category = Column(String(50), nullable=False, index=True)  # security, analytics, workflow, etc.
    metric_type = Column(String(50), nullable=False)  # counter, gauge, histogram
    
    # Metric data
    value = Column(Float, nullable=False)
    previous_value = Column(Float)
    target_value = Column(Float)
    threshold_warning = Column(Float)
    threshold_critical = Column(Float)
    
    # Metric metadata
    unit = Column(String(20))  # percentage, count, seconds, etc.
    description = Column(Text)
    calculation_method = Column(Text)
    
    # Time series data
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    granularity = Column(String(20), default="daily")  # hourly, daily, weekly, monthly
    
    # Status and alerts
    status = Column(String(20), default="normal")  # normal, warning, critical
    trend = Column(String(20))  # increasing, decreasing, stable
    change_percentage = Column(Float)
    
    # Data quality
    confidence_score = Column(Float, default=1.0)
    data_completeness = Column(Float, default=1.0)
    last_calculated = Column(DateTime(timezone=True), server_default=func.now())
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant")
    
    def __repr__(self):
        return f"<EnterpriseMetric(id={self.id}, name='{self.metric_name}', value={self.value})>"


class DashboardAlert(Base):
    """
    Dashboard alerts for enterprise monitoring
    """
    __tablename__ = "dashboard_alerts"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Alert identification
    alert_name = Column(String(200), nullable=False)
    alert_type = Column(String(50), nullable=False)  # metric, security, workflow, system
    severity = Column(String(20), default="medium")  # low, medium, high, critical
    
    # Alert configuration
    source_metric = Column(String(100))
    condition = Column(String(100), nullable=False)  # greater_than, less_than, equals, etc.
    threshold_value = Column(Float, nullable=False)
    
    # Alert status
    is_active = Column(Boolean, default=True)
    is_triggered = Column(Boolean, default=False)
    trigger_count = Column(Integer, default=0)
    last_triggered = Column(DateTime(timezone=True))
    
    # Alert details
    message = Column(Text, nullable=False)
    description = Column(Text)
    recommended_action = Column(Text)
    
    # Notification settings
    notification_channels = Column(JSON, default=[])  # email, slack, webhook
    notification_frequency = Column(String(20), default="immediate")
    suppress_duration = Column(Integer, default=3600)  # seconds
    
    # Resolution tracking
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(Integer, ForeignKey("users.id"))
    acknowledged_at = Column(DateTime(timezone=True))
    resolution_notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant")
    creator = relationship("User", foreign_keys=[created_by])
    acknowledger = relationship("User", foreign_keys=[acknowledged_by])
    
    def __repr__(self):
        return f"<DashboardAlert(id={self.id}, name='{self.alert_name}', severity='{self.severity}')>"


class EnterpriseFeatureUsage(Base):
    """
    Track usage of enterprise features for analytics and billing
    """
    __tablename__ = "enterprise_feature_usage"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Feature identification
    feature_name = Column(String(100), nullable=False, index=True)
    feature_category = Column(String(50), nullable=False, index=True)
    action = Column(String(100), nullable=False)  # view, create, execute, export, etc.
    
    # Usage data
    session_id = Column(String(100))
    duration_seconds = Column(Float)
    resource_consumption = Column(JSON, default={})  # CPU, memory, storage used
    
    # Context information
    ip_address = Column(String(45))
    user_agent = Column(Text)
    referrer = Column(String(500))
    
    # Performance metrics
    response_time_ms = Column(Float)
    success = Column(Boolean, default=True)
    error_message = Column(Text)
    
    # Business metrics
    business_value = Column(Float)  # Estimated business value generated
    cost_center = Column(String(100))
    project_code = Column(String(100))
    
    # Timestamps
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    tenant = relationship("Tenant")
    user = relationship("User")
    
    def __repr__(self):
        return f"<EnterpriseFeatureUsage(id={self.id}, feature='{self.feature_name}', action='{self.action}')>"


class DashboardExport(Base):
    """
    Dashboard export configurations and history
    """
    __tablename__ = "dashboard_exports"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    dashboard_id = Column(Integer, ForeignKey("enterprise_dashboards.id"), nullable=False, index=True)
    
    # Export configuration
    export_name = Column(String(200), nullable=False)
    export_format = Column(String(20), nullable=False)  # pdf, excel, csv, json, png
    export_scope = Column(String(20), default="full")  # full, widgets, data_only
    
    # Export settings
    include_charts = Column(Boolean, default=True)
    include_data = Column(Boolean, default=True)
    include_metadata = Column(Boolean, default=False)
    page_orientation = Column(String(20), default="landscape")
    
    # Scheduling
    is_scheduled = Column(Boolean, default=False)
    schedule_cron = Column(String(100))
    next_execution = Column(DateTime(timezone=True))
    
    # Export status
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    file_path = Column(String(500))
    file_size_bytes = Column(Integer)
    
    # Performance tracking
    generation_time_seconds = Column(Float)
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    
    # Access control
    is_public = Column(Boolean, default=False)
    access_token = Column(String(100))
    expires_at = Column(DateTime(timezone=True))
    download_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant")
    dashboard = relationship("EnterpriseDashboard")
    creator = relationship("User")
    
    def __repr__(self):
        return f"<DashboardExport(id={self.id}, name='{self.export_name}', format='{self.export_format}')>"