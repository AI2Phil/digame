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


class EnterpriseDashboard(Base):  # type: ignore
    """
    Enterprise dashboard configurations for unified feature access
    """
    __tablename__ = "enterprise_dashboards"

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    
    # Dashboard information
    name = Column(String(200), nullable=False, index=True)  # type: ignore
    description = Column(Text)  # type: ignore
    dashboard_type = Column(String(50), default="enterprise")  # type: ignore  # enterprise, executive, operational
    
    # Layout configuration
    layout_type = Column(String(20), default="grid")  # type: ignore
    layout_config = Column(JSON, default={})  # type: ignore  # Grid configuration, widget positions
    
    # Dashboard settings
    is_default = Column(Boolean, default=False)  # type: ignore
    is_public = Column(Boolean, default=False)  # type: ignore
    auto_refresh = Column(Boolean, default=True)  # type: ignore
    refresh_interval = Column(Integer, default=300)  # type: ignore  # seconds
    
    # Access control
    allowed_roles = Column(JSON, default=[])  # type: ignore  # Role-based access
    allowed_users = Column(JSON, default=[])  # type: ignore  # User-specific access
    
    # Dashboard metadata
    theme = Column(String(50), default="light")  # type: ignore
    color_scheme = Column(JSON, default={})  # type: ignore
    custom_css = Column(Text)  # type: ignore
    
    # Usage tracking
    view_count = Column(Integer, default=0)  # type: ignore
    last_viewed = Column(DateTime(timezone=True))  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  # type: ignore
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)  # type: ignore
    
    # Relationships
    tenant = relationship("Tenant")
    creator = relationship("User")
    widgets = relationship("DashboardWidget", back_populates="dashboard", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<EnterpriseDashboard(id={self.id}, name='{self.name}', type='{self.dashboard_type}')>"


class DashboardWidget(Base):  # type: ignore
    """
    Individual widgets within enterprise dashboards
    """
    __tablename__ = "dashboard_widgets"

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    dashboard_id = Column(Integer, ForeignKey("enterprise_dashboards.id"), nullable=False, index=True)  # type: ignore
    
    # Widget identification
    widget_id = Column(String(100), nullable=False)  # type: ignore  # Unique within dashboard
    widget_name = Column(String(200), nullable=False)  # type: ignore
    widget_type = Column(String(50), nullable=False)  # type: ignore
    
    # Widget configuration
    data_source = Column(String(100), nullable=False)  # type: ignore  # analytics, reporting, security, etc.
    query_config = Column(JSON, default={})  # type: ignore  # Data query configuration
    display_config = Column(JSON, default={})  # type: ignore  # Visual display settings
    
    # Layout positioning
    position_x = Column(Integer, default=0)  # type: ignore
    position_y = Column(Integer, default=0)  # type: ignore
    width = Column(Integer, default=4)  # type: ignore
    height = Column(Integer, default=3)  # type: ignore
    z_index = Column(Integer, default=1)  # type: ignore
    
    # Widget settings
    title = Column(String(200))  # type: ignore
    subtitle = Column(String(500))  # type: ignore
    is_visible = Column(Boolean, default=True)  # type: ignore
    is_resizable = Column(Boolean, default=True)  # type: ignore
    is_movable = Column(Boolean, default=True)  # type: ignore
    
    # Data refresh
    auto_refresh = Column(Boolean, default=True)  # type: ignore
    refresh_interval = Column(Integer, default=300)  # type: ignore  # seconds
    last_refreshed = Column(DateTime(timezone=True))  # type: ignore
    
    # Performance tracking
    load_time_ms = Column(Float, default=0.0)  # type: ignore
    error_count = Column(Integer, default=0)  # type: ignore
    last_error = Column(Text)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  # type: ignore
    
    # Relationships
    dashboard = relationship("EnterpriseDashboard", back_populates="widgets")
    
    def __repr__(self):
        return f"<DashboardWidget(id={self.id}, name='{self.widget_name}', type='{self.widget_type}')>"


class EnterpriseMetric(Base):  # type: ignore
    """
    Enterprise-level metrics aggregated from all features
    """
    __tablename__ = "enterprise_metrics"

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    
    # Metric identification
    metric_name = Column(String(100), nullable=False, index=True)  # type: ignore
    metric_category = Column(String(50), nullable=False, index=True)  # type: ignore  # security, analytics, workflow, etc.
    metric_type = Column(String(50), nullable=False)  # type: ignore  # counter, gauge, histogram
    
    # Metric data
    value = Column(Float, nullable=False)  # type: ignore
    previous_value = Column(Float)  # type: ignore
    target_value = Column(Float)  # type: ignore
    threshold_warning = Column(Float)  # type: ignore
    threshold_critical = Column(Float)  # type: ignore
    
    # Metric metadata
    unit = Column(String(20))  # type: ignore  # percentage, count, seconds, etc.
    description = Column(Text)  # type: ignore
    calculation_method = Column(Text)  # type: ignore
    
    # Time series data
    period_start = Column(DateTime(timezone=True), nullable=False)  # type: ignore
    period_end = Column(DateTime(timezone=True), nullable=False)  # type: ignore
    granularity = Column(String(20), default="daily")  # type: ignore  # hourly, daily, weekly, monthly
    
    # Status and alerts
    status = Column(String(20), default="normal")  # type: ignore  # normal, warning, critical
    trend = Column(String(20))  # type: ignore  # increasing, decreasing, stable
    change_percentage = Column(Float)  # type: ignore
    
    # Data quality
    confidence_score = Column(Float, default=1.0)  # type: ignore
    data_completeness = Column(Float, default=1.0)  # type: ignore
    last_calculated = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  # type: ignore
    
    # Relationships
    tenant = relationship("Tenant")
    
    def __repr__(self):
        return f"<EnterpriseMetric(id={self.id}, name='{self.metric_name}', value={self.value})>"


class DashboardAlert(Base):  # type: ignore
    """
    Dashboard alerts for enterprise monitoring
    """
    __tablename__ = "dashboard_alerts"

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    
    # Alert identification
    alert_name = Column(String(200), nullable=False)  # type: ignore
    alert_type = Column(String(50), nullable=False)  # type: ignore  # metric, security, workflow, system
    severity = Column(String(20), default="medium")  # type: ignore  # low, medium, high, critical
    
    # Alert configuration
    source_metric = Column(String(100))  # type: ignore
    condition = Column(String(100), nullable=False)  # type: ignore  # greater_than, less_than, equals, etc.
    threshold_value = Column(Float, nullable=False)  # type: ignore
    
    # Alert status
    is_active = Column(Boolean, default=True)  # type: ignore
    is_triggered = Column(Boolean, default=False)  # type: ignore
    trigger_count = Column(Integer, default=0)  # type: ignore
    last_triggered = Column(DateTime(timezone=True))  # type: ignore
    
    # Alert details
    message = Column(Text, nullable=False)  # type: ignore
    description = Column(Text)  # type: ignore
    recommended_action = Column(Text)  # type: ignore
    
    # Notification settings
    notification_channels = Column(JSON, default=[])  # type: ignore  # email, slack, webhook
    notification_frequency = Column(String(20), default="immediate")  # type: ignore
    suppress_duration = Column(Integer, default=3600)  # type: ignore  # seconds
    
    # Resolution tracking
    is_acknowledged = Column(Boolean, default=False)  # type: ignore
    acknowledged_by = Column(Integer, ForeignKey("users.id"))  # type: ignore
    acknowledged_at = Column(DateTime(timezone=True))  # type: ignore
    resolution_notes = Column(Text)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  # type: ignore
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)  # type: ignore
    
    # Relationships
    tenant = relationship("Tenant")
    creator = relationship("User", foreign_keys=[created_by])
    acknowledger = relationship("User", foreign_keys=[acknowledged_by])
    
    def __repr__(self):
        return f"<DashboardAlert(id={self.id}, name='{self.alert_name}', severity='{self.severity}')>"


class EnterpriseFeatureUsage(Base):  # type: ignore
    """
    Track usage of enterprise features for analytics and billing
    """
    __tablename__ = "enterprise_feature_usage"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # type: ignore
    
    # Feature identification
    feature_name = Column(String(100), nullable=False, index=True)  # type: ignore
    feature_category = Column(String(50), nullable=False, index=True)  # type: ignore
    action = Column(String(100), nullable=False)  # type: ignore  # view, create, execute, export, etc.
    
    # Usage data
    session_id = Column(String(100))  # type: ignore
    duration_seconds = Column(Float)  # type: ignore
    resource_consumption = Column(JSON, default={})  # type: ignore  # CPU, memory, storage used
    
    # Context information
    ip_address = Column(String(45))  # type: ignore
    user_agent = Column(Text)  # type: ignore
    referrer = Column(String(500))  # type: ignore
    
    # Performance metrics
    response_time_ms = Column(Float)  # type: ignore
    success = Column(Boolean, default=True)  # type: ignore
    error_message = Column(Text)  # type: ignore
    
    # Business metrics
    business_value = Column(Float)  # type: ignore  # Estimated business value generated
    cost_center = Column(String(100))  # type: ignore
    project_code = Column(String(100))  # type: ignore
    
    # Timestamps
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # type: ignore
    
    # Relationships
    tenant = relationship("Tenant")
    user = relationship("User")
    
    def __repr__(self):
        return f"<EnterpriseFeatureUsage(id={self.id}, feature='{self.feature_name}', action='{self.action}')>"


class DashboardExport(Base):  # type: ignore
    """
    Dashboard export configurations and history
    """
    __tablename__ = "dashboard_exports"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    dashboard_id = Column(Integer, ForeignKey("enterprise_dashboards.id"), nullable=False, index=True)  # type: ignore
    
    # Export configuration
    export_name = Column(String(200), nullable=False)  # type: ignore
    export_format = Column(String(20), nullable=False)  # type: ignore  # pdf, excel, csv, json, png
    export_scope = Column(String(20), default="full")  # type: ignore  # full, widgets, data_only
    
    # Export settings
    include_charts = Column(Boolean, default=True)  # type: ignore
    include_data = Column(Boolean, default=True)  # type: ignore
    include_metadata = Column(Boolean, default=False)  # type: ignore
    page_orientation = Column(String(20), default="landscape")  # type: ignore
    
    # Scheduling
    is_scheduled = Column(Boolean, default=False)  # type: ignore
    schedule_cron = Column(String(100))  # type: ignore
    next_execution = Column(DateTime(timezone=True))  # type: ignore
    
    # Export status
    status = Column(String(20), default="pending")  # type: ignore  # pending, processing, completed, failed
    file_path = Column(String(500))  # type: ignore
    file_size_bytes = Column(Integer)  # type: ignore
    
    # Performance tracking
    generation_time_seconds = Column(Float)  # type: ignore
    error_message = Column(Text)  # type: ignore
    retry_count = Column(Integer, default=0)  # type: ignore
    
    # Access control
    is_public = Column(Boolean, default=False)  # type: ignore
    access_token = Column(String(100))  # type: ignore
    expires_at = Column(DateTime(timezone=True))  # type: ignore
    download_count = Column(Integer, default=0)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  # type: ignore
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)  # type: ignore
    
    # Relationships
    tenant = relationship("Tenant")
    dashboard = relationship("EnterpriseDashboard")
    creator = relationship("User")
    
    def __repr__(self):
        return f"<DashboardExport(id={self.id}, name='{self.export_name}', format='{self.export_format}')>"