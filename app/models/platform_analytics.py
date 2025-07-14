"""
Platform Analytics Models
Comprehensive analytics and monitoring for Platform Owner insights
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Text, JSON, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class PlatformUsageMetric(Base):  # type: ignore
    """
    Platform-wide usage metrics for comprehensive analytics
    """
    __tablename__ = "platform_usage_metrics"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    
    # Metric Information
    metric_type = Column(String, nullable=False)  # type: ignore  # user_activity, api_calls, storage_usage, etc.
    metric_category = Column(String, nullable=False)  # type: ignore  # authentication, features, performance, etc.
    metric_name = Column(String, nullable=False)  # type: ignore
    metric_value = Column(Float, nullable=False)  # type: ignore
    metric_unit = Column(String, nullable=True)  # type: ignore  # requests, GB, users, etc.
    
    # Context
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)  # type: ignore  # Null for platform-wide
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # type: ignore
    
    # Dimensions
    subscription_tier = Column(String, nullable=True)  # type: ignore
    feature_name = Column(String, nullable=True)  # type: ignore
    endpoint_path = Column(String, nullable=True)  # type: ignore
    
    # Temporal
    recorded_at = Column(DateTime, default=func.now(), index=True)  # type: ignore
    period_start = Column(DateTime, nullable=True)  # type: ignore
    period_end = Column(DateTime, nullable=True)  # type: ignore
    
    # Relationships
    tenant = relationship("Tenant")
    user = relationship("User")

    def __repr__(self):
        return f"<PlatformUsageMetric(id={self.id}, metric_type='{self.metric_type}', metric_name='{self.metric_name}')>"


class PlatformHealthMetric(Base):  # type: ignore
    """
    Platform health and performance monitoring
    """
    __tablename__ = "platform_health_metrics"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    
    # Health Indicators
    metric_name = Column(String, nullable=False)  # type: ignore  # response_time, error_rate, uptime, etc.
    current_value = Column(Float, nullable=False)  # type: ignore
    threshold_warning = Column(Float, nullable=True)  # type: ignore
    threshold_critical = Column(Float, nullable=True)  # type: ignore
    status = Column(String, default="healthy")  # type: ignore  # healthy, warning, critical
    
    # Service Context
    service_name = Column(String, nullable=True)  # type: ignore
    component_name = Column(String, nullable=True)  # type: ignore
    
    # Temporal
    measured_at = Column(DateTime, default=func.now(), index=True)  # type: ignore

    def __repr__(self):
        return f"<PlatformHealthMetric(id={self.id}, metric_name='{self.metric_name}', status='{self.status}')>"


class PlatformTenantAnalyticsSummary(Base):  # type: ignore
    """
    Daily analytics summary for each tenant
    """
    __tablename__ = "tenant_analytics_summary"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)  # type: ignore
    
    # User Metrics
    total_users = Column(Integer, default=0)  # type: ignore
    active_users_daily = Column(Integer, default=0)  # type: ignore
    active_users_weekly = Column(Integer, default=0)  # type: ignore
    active_users_monthly = Column(Integer, default=0)  # type: ignore
    
    # Usage Metrics
    total_api_calls = Column(Integer, default=0)  # type: ignore
    total_storage_gb = Column(Float, default=0.0)  # type: ignore
    total_features_used = Column(Integer, default=0)  # type: ignore
    
    # Engagement Metrics
    avg_session_duration = Column(Float, default=0.0)  # type: ignore
    total_logins = Column(Integer, default=0)  # type: ignore
    feature_adoption_rate = Column(Float, default=0.0)  # type: ignore
    
    # Financial Metrics
    monthly_revenue = Column(Float, default=0.0)  # type: ignore
    lifetime_value = Column(Float, default=0.0)  # type: ignore
    
    # Temporal
    summary_date = Column(Date, default=func.current_date(), index=True)  # type: ignore
    created_at = Column(DateTime, default=func.now())  # type: ignore
    
    # Relationships
    tenant = relationship("Tenant")

    def __repr__(self):
        return f"<TenantAnalyticsSummary(id={self.id}, tenant_id={self.tenant_id}, summary_date={self.summary_date})>"


class PlatformUsageMetrics(Base):  # type: ignore
    """
    Platform usage metrics for tracking user activity and API usage
    """
    __tablename__ = "platform_usage_tracking"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)  # type: ignore
    
    metric_type = Column(String(100), nullable=False, index=True)  # type: ignore  # api_call, subscription_change, etc.
    metric_value = Column(Float, default=1.0)  # type: ignore
    metric_metadata = Column(JSON, nullable=True)  # type: ignore
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # type: ignore
    
    def __repr__(self):
        return f"<PlatformUsageMetrics(id={self.id}, type='{self.metric_type}', user_id={self.user_id})>"