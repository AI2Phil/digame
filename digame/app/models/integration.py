"""
Integration API models for third-party productivity tools and services
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
from typing import Optional, Dict, Any
from datetime import datetime
import enum


class IntegrationStatus(enum.Enum):
    """Integration connection status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"
    EXPIRED = "expired"


class SyncStatus(enum.Enum):
    """Data synchronization status"""
    SUCCESS = "success"
    FAILED = "failed"
    IN_PROGRESS = "in_progress"
    PARTIAL = "partial"
    SKIPPED = "skipped"


class IntegrationProvider(Base):
    """
    Third-party service providers available for integration
    """
    __tablename__ = "integration_providers"

    id = Column(Integer, primary_key=True, index=True)
    
    # Provider information
    name = Column(String(100), nullable=False, unique=True, index=True)
    display_name = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False, index=True)  # communication, project_management, storage, etc.
    
    # Provider configuration
    base_url = Column(String(500))
    auth_type = Column(String(50), nullable=False)  # oauth2, api_key, basic_auth
    auth_config = Column(JSON, default={})
    
    # API capabilities
    supported_operations = Column(JSON, default=[])  # read, write, webhook, real_time
    rate_limits = Column(JSON, default={})
    data_formats = Column(JSON, default=["json"])
    
    # Provider metadata
    logo_url = Column(String(500))
    documentation_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    version = Column(String(20), default="1.0")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    connections = relationship("IntegrationConnection", back_populates="provider", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<IntegrationProvider(id={self.id}, name='{self.name}', category='{self.category}')>"


class IntegrationConnection(Base):
    """
    User connections to third-party services
    """
    __tablename__ = "integration_connections"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    provider_id = Column(Integer, ForeignKey("integration_providers.id"), nullable=False, index=True)
    
    # Connection details
    connection_name = Column(String(200), nullable=False)
    external_account_id = Column(String(255))
    external_account_name = Column(String(255))
    
    # Authentication data (encrypted in production)
    auth_data = Column(JSON, default={})  # tokens, keys, etc.
    refresh_token = Column(String(500))
    token_expires_at = Column(DateTime(timezone=True))
    
    # Connection configuration
    sync_settings = Column(JSON, default={})
    field_mappings = Column(JSON, default={})
    filters = Column(JSON, default={})
    
    # Status and health
    status = Column(String(20), default="pending")
    last_sync_at = Column(DateTime(timezone=True))
    last_error = Column(Text)
    error_count = Column(Integer, default=0)
    
    # Performance metrics
    total_syncs = Column(Integer, default=0)
    successful_syncs = Column(Integer, default=0)
    avg_sync_duration = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant")
    user = relationship("User")
    provider = relationship("IntegrationProvider", back_populates="connections")
    sync_logs = relationship("IntegrationSyncLog", back_populates="connection", cascade="all, delete-orphan")
    webhooks = relationship("IntegrationWebhook", back_populates="connection", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<IntegrationConnection(id={self.id}, provider='{self.provider.name}', user_id={self.user_id})>"


class IntegrationSyncLog(Base):
    """
    Synchronization history and logs
    """
    __tablename__ = "integration_sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(Integer, ForeignKey("integration_connections.id"), nullable=False, index=True)
    
    # Sync details
    sync_type = Column(String(50), nullable=False)  # manual, scheduled, webhook, real_time
    direction = Column(String(20), nullable=False)  # inbound, outbound, bidirectional
    operation = Column(String(50), nullable=False)  # full_sync, incremental, specific_resource
    
    # Sync results
    status = Column(String(20), nullable=False)
    records_processed = Column(Integer, default=0)
    records_created = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_deleted = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    
    # Performance and metadata
    duration_seconds = Column(Float)
    data_size_bytes = Column(Integer)
    api_calls_made = Column(Integer, default=0)
    
    # Error handling
    error_message = Column(Text)
    error_details = Column(JSON)
    retry_count = Column(Integer, default=0)
    
    # Sync metadata
    sync_metadata = Column(JSON, default={})
    checkpoint_data = Column(JSON, default={})  # For incremental syncs
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    connection = relationship("IntegrationConnection", back_populates="sync_logs")
    
    def __repr__(self):
        return f"<IntegrationSyncLog(id={self.id}, connection_id={self.connection_id}, status='{self.status}')>"


class IntegrationWebhook(Base):
    """
    Webhook configurations for real-time data updates
    """
    __tablename__ = "integration_webhooks"

    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(Integer, ForeignKey("integration_connections.id"), nullable=False, index=True)
    
    # Webhook configuration
    webhook_url = Column(String(500), nullable=False)
    webhook_secret = Column(String(255))
    events = Column(JSON, default=[])  # List of events to listen for
    
    # External webhook details
    external_webhook_id = Column(String(255))
    external_webhook_url = Column(String(500))
    
    # Status and health
    is_active = Column(Boolean, default=True)
    last_triggered_at = Column(DateTime(timezone=True))
    total_triggers = Column(Integer, default=0)
    successful_triggers = Column(Integer, default=0)
    failed_triggers = Column(Integer, default=0)
    
    # Configuration
    retry_config = Column(JSON, default={})
    timeout_seconds = Column(Integer, default=30)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    connection = relationship("IntegrationConnection", back_populates="webhooks")
    
    def __repr__(self):
        return f"<IntegrationWebhook(id={self.id}, connection_id={self.connection_id}, active={self.is_active})>"


class IntegrationDataMapping(Base):
    """
    Field mappings between external systems and internal data structures
    """
    __tablename__ = "integration_data_mappings"

    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(Integer, ForeignKey("integration_connections.id"), nullable=False, index=True)
    
    # Mapping configuration
    resource_type = Column(String(100), nullable=False)  # task, project, user, etc.
    external_field = Column(String(200), nullable=False)
    internal_field = Column(String(200), nullable=False)
    
    # Transformation rules
    transformation_type = Column(String(50), default="direct")  # direct, computed, lookup, conditional
    transformation_config = Column(JSON, default={})
    
    # Validation rules
    validation_rules = Column(JSON, default={})
    is_required = Column(Boolean, default=False)
    default_value = Column(String(500))
    
    # Metadata
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    connection = relationship("IntegrationConnection")
    
    def __repr__(self):
        return f"<IntegrationDataMapping(id={self.id}, resource='{self.resource_type}', external='{self.external_field}')>"


class IntegrationAnalytics(Base):
    """
    Analytics and metrics for integration usage and performance
    """
    __tablename__ = "integration_analytics"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    connection_id = Column(Integer, ForeignKey("integration_connections.id"), nullable=True, index=True)
    
    # Analytics period
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    period_type = Column(String(20), nullable=False)  # daily, weekly, monthly
    
    # Usage metrics
    api_calls_made = Column(Integer, default=0)
    data_transferred_bytes = Column(Integer, default=0)
    sync_operations = Column(Integer, default=0)
    webhook_triggers = Column(Integer, default=0)
    
    # Performance metrics
    avg_response_time_ms = Column(Float, default=0.0)
    success_rate = Column(Float, default=0.0)
    error_rate = Column(Float, default=0.0)
    uptime_percentage = Column(Float, default=0.0)
    
    # Business metrics
    records_synchronized = Column(Integer, default=0)
    unique_users_active = Column(Integer, default=0)
    cost_savings_estimated = Column(Float, default=0.0)
    productivity_gain_hours = Column(Float, default=0.0)
    
    # Detailed metrics
    metrics_data = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    tenant = relationship("Tenant")
    connection = relationship("IntegrationConnection")
    
    def __repr__(self):
        return f"<IntegrationAnalytics(id={self.id}, tenant_id={self.tenant_id}, date='{self.date}')>"