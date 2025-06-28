"""
Platform Analytics Models
Comprehensive analytics and monitoring for Platform Owner insights
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Text, JSON, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .user import Base


class PlatformUsageMetric(Base):
    """
    Platform-wide usage metrics for comprehensive analytics
    """
    __tablename__ = "platform_usage_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Metric Information
    metric_type = Column(String, nullable=False)  # user_activity, api_calls, storage_usage, etc.
    metric_category = Column(String, nullable=False)  # authentication, features, performance, etc.
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String, nullable=True)  # requests, GB, users, etc.
    
    # Context
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)  # Null for platform-wide
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Dimensions
    subscription_tier = Column(String, nullable=True)
    feature_name = Column(String, nullable=True)
    endpoint_path = Column(String, nullable=True)
    
    # Temporal
    recorded_at = Column(DateTime, default=func.now(), index=True)
    period_start = Column(DateTime, nullable=True)
    period_end = Column(DateTime, nullable=True)
    
    # Relationships
    tenant = relationship("Tenant")
    user = relationship("User")

    def __repr__(self):
        return f"<PlatformUsageMetric(id={self.id}, metric_type='{self.metric_type}', metric_name='{self.metric_name}')>"


class PlatformHealthMetric(Base):
    """
    Platform health and performance monitoring
    """
    __tablename__ = "platform_health_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Health Indicators
    metric_name = Column(String, nullable=False)  # response_time, error_rate, uptime, etc.
    current_value = Column(Float, nullable=False)
    threshold_warning = Column(Float, nullable=True)
    threshold_critical = Column(Float, nullable=True)
    status = Column(String, default="healthy")  # healthy, warning, critical
    
    # Service Context
    service_name = Column(String, nullable=True)
    component_name = Column(String, nullable=True)
    
    # Temporal
    measured_at = Column(DateTime, default=func.now(), index=True)

    def __repr__(self):
        return f"<PlatformHealthMetric(id={self.id}, metric_name='{self.metric_name}', status='{self.status}')>"


class TenantAnalyticsSummary(Base):
    """
    Daily analytics summary for each tenant
    """
    __tablename__ = "tenant_analytics_summary"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    
    # User Metrics
    total_users = Column(Integer, default=0)
    active_users_daily = Column(Integer, default=0)
    active_users_weekly = Column(Integer, default=0)
    active_users_monthly = Column(Integer, default=0)
    
    # Usage Metrics
    total_api_calls = Column(Integer, default=0)
    total_storage_gb = Column(Float, default=0.0)
    total_features_used = Column(Integer, default=0)
    
    # Engagement Metrics
    avg_session_duration = Column(Float, default=0.0)
    total_logins = Column(Integer, default=0)
    feature_adoption_rate = Column(Float, default=0.0)
    
    # Financial Metrics
    monthly_revenue = Column(Float, default=0.0)
    lifetime_value = Column(Float, default=0.0)
    
    # Temporal
    summary_date = Column(Date, default=func.current_date(), index=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    tenant = relationship("Tenant")

    def __repr__(self):
        return f"<TenantAnalyticsSummary(id={self.id}, tenant_id={self.tenant_id}, summary_date={self.summary_date})>"


class PlatformUsageMetrics(Base):
    """
    Platform usage metrics for tracking user activity and API usage
    """
    __tablename__ = "platform_usage_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)
    
    metric_type = Column(String(100), nullable=False, index=True)  # api_call, subscription_change, etc.
    metric_value = Column(Float, default=1.0)
    metric_metadata = Column(JSON, nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<PlatformUsageMetrics(id={self.id}, type='{self.metric_type}', user_id={self.user_id})>"