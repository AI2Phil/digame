"""
Enhanced security framework models for the Digame platform
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import enum


class SecurityEventType(enum.Enum):
    """Security event types"""
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    PASSWORD_CHANGE = "password_change"
    PERMISSION_DENIED = "permission_denied"
    DATA_ACCESS = "data_access"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    ACCOUNT_LOCKED = "account_locked"
    MFA_ENABLED = "mfa_enabled"
    MFA_DISABLED = "mfa_disabled"
    API_ACCESS = "api_access"
    EXPORT_DATA = "export_data"


class RiskLevel(enum.Enum):
    """Risk assessment levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SecurityEvent(Base):
    """
    Security event logging for audit trails
    """
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Event details
    event_type = Column(String(50), nullable=False, index=True)
    event_description = Column(Text)
    risk_level = Column(String(20), default="low")
    
    # Context information
    ip_address = Column(String(45))  # IPv6 compatible
    user_agent = Column(Text)
    session_id = Column(String(255))
    endpoint = Column(String(500))
    method = Column(String(10))
    
    # Additional metadata
    metadata = Column(JSON, default={})
    success = Column(Boolean, default=True)
    error_message = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    tenant = relationship("Tenant")
    user = relationship("User")
    
    def __repr__(self):
        return f"<SecurityEvent(id={self.id}, type='{self.event_type}', user_id={self.user_id})>"


class SecurityPolicy(Base):
    """
    Tenant-specific security policies
    """
    __tablename__ = "security_policies"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, unique=True)
    
    # Password policies
    min_password_length = Column(Integer, default=8)
    require_uppercase = Column(Boolean, default=True)
    require_lowercase = Column(Boolean, default=True)
    require_numbers = Column(Boolean, default=True)
    require_special_chars = Column(Boolean, default=True)
    password_expiry_days = Column(Integer, default=90)
    password_history_count = Column(Integer, default=5)
    
    # Account lockout policies
    max_login_attempts = Column(Integer, default=5)
    lockout_duration_minutes = Column(Integer, default=30)
    auto_unlock = Column(Boolean, default=True)
    
    # Session policies
    session_timeout_minutes = Column(Integer, default=60)
    concurrent_sessions_limit = Column(Integer, default=3)
    require_mfa = Column(Boolean, default=False)
    
    # Data access policies
    data_retention_days = Column(Integer, default=365)
    export_restrictions = Column(JSON, default={})
    ip_whitelist = Column(JSON, default=[])
    
    # Monitoring settings
    enable_audit_logging = Column(Boolean, default=True)
    alert_on_suspicious_activity = Column(Boolean, default=True)
    risk_threshold = Column(String(20), default="medium")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant", backref="security_policy")
    
    def __repr__(self):
        return f"<SecurityPolicy(tenant_id={self.tenant_id})>"


class UserSecurityProfile(Base):
    """
    User-specific security information and risk assessment
    """
    __tablename__ = "user_security_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Authentication status
    is_locked = Column(Boolean, default=False)
    failed_login_attempts = Column(Integer, default=0)
    last_failed_login = Column(DateTime(timezone=True))
    locked_until = Column(DateTime(timezone=True))
    
    # MFA settings
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(255))  # Encrypted TOTP secret
    backup_codes = Column(JSON, default=[])  # Encrypted backup codes
    
    # Password management
    password_last_changed = Column(DateTime(timezone=True))
    password_expires_at = Column(DateTime(timezone=True))
    password_history = Column(JSON, default=[])  # Hashed previous passwords
    
    # Risk assessment
    risk_score = Column(Float, default=0.0)
    risk_factors = Column(JSON, default=[])
    last_risk_assessment = Column(DateTime(timezone=True))
    
    # Activity tracking
    last_login_ip = Column(String(45))
    last_login_location = Column(String(255))
    unusual_activity_detected = Column(Boolean, default=False)
    
    # Security preferences
    security_notifications = Column(Boolean, default=True)
    login_notifications = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="security_profile")
    
    def __repr__(self):
        return f"<UserSecurityProfile(user_id={self.user_id}, risk_score={self.risk_score})>"


class ApiKey(Base):
    """
    API key management for secure API access
    """
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Key details
    name = Column(String(255), nullable=False)
    key_hash = Column(String(255), nullable=False, unique=True)  # Hashed API key
    key_prefix = Column(String(20), nullable=False)  # First few chars for identification
    
    # Permissions and scope
    permissions = Column(JSON, default=[])
    scopes = Column(JSON, default=[])
    rate_limit = Column(Integer, default=1000)  # Requests per hour
    
    # Status and lifecycle
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True))
    last_used = Column(DateTime(timezone=True))
    usage_count = Column(Integer, default=0)
    
    # Security tracking
    allowed_ips = Column(JSON, default=[])
    referrer_restrictions = Column(JSON, default=[])
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant")
    user = relationship("User")
    
    def __repr__(self):
        return f"<ApiKey(id={self.id}, name='{self.name}', user_id={self.user_id})>"


class SecurityAlert(Base):
    """
    Security alerts and notifications
    """
    __tablename__ = "security_alerts"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Alert details
    alert_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    severity = Column(String(20), default="medium")
    
    # Status and resolution
    status = Column(String(20), default="open")  # open, investigating, resolved, false_positive
    resolved_by = Column(Integer, ForeignKey("users.id"))
    resolved_at = Column(DateTime(timezone=True))
    resolution_notes = Column(Text)
    
    # Context and metadata
    source_event_id = Column(Integer, ForeignKey("security_events.id"))
    metadata = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant")
    user = relationship("User", foreign_keys=[user_id])
    resolver = relationship("User", foreign_keys=[resolved_by])
    source_event = relationship("SecurityEvent")
    
    def __repr__(self):
        return f"<SecurityAlert(id={self.id}, type='{self.alert_type}', severity='{self.severity}')>"


class ComplianceLog(Base):
    """
    Compliance and regulatory logging
    """
    __tablename__ = "compliance_logs"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Compliance details
    regulation_type = Column(String(50), nullable=False)  # GDPR, HIPAA, SOX, etc.
    action_type = Column(String(50), nullable=False)
    resource_type = Column(String(50))
    resource_id = Column(String(255))
    
    # Action details
    action_description = Column(Text)
    data_subject = Column(String(255))  # For GDPR compliance
    legal_basis = Column(String(100))
    
    # Audit trail
    before_state = Column(JSON)
    after_state = Column(JSON)
    justification = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    tenant = relationship("Tenant")
    user = relationship("User")
    
    def __repr__(self):
        return f"<ComplianceLog(id={self.id}, regulation='{self.regulation_type}', action='{self.action_type}')>"