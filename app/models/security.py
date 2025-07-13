"""
Security Models for Advanced Authentication Features
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime


class MFADevice(Base):
    """
    Multi-Factor Authentication device model
    """
    __tablename__ = "mfa_devices"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Device Information
    device_type = Column(String(20), nullable=False)  # totp, sms, email, hardware
    device_name = Column(String(100), nullable=False)
    secret_key = Column(String(255), nullable=True)  # For TOTP
    phone_number = Column(String(20), nullable=True)  # For SMS
    
    # Status
    is_active = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    
    # Backup codes
    backup_codes = Column(JSON, default=[])
    
    # Usage tracking
    use_count = Column(Integer, default=0)
    last_used = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), index=True)
    activated_at = Column(DateTime, nullable=True)
    disabled_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<MFADevice(id={self.id}, user_id={self.user_id}, type='{self.device_type}')>"


class SecurityEvent(Base):
    """
    Security event logging for audit trail
    """
    __tablename__ = "security_events"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Event Information
    event_type = Column(String(50), nullable=False, index=True)
    event_category = Column(String(30), default="authentication")  # authentication, authorization, security
    severity = Column(String(20), default="info")  # info, warning, error, critical
    
    # Event Details
    description = Column(Text, nullable=True)
    details = Column(JSON, nullable=True)
    
    # Request Context
    ip_address = Column(String(45), nullable=True, index=True)
    user_agent = Column(Text, nullable=True)
    request_path = Column(String(500), nullable=True)
    request_method = Column(String(10), nullable=True)
    
    # Response Information
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    
    # Geolocation (optional)
    country = Column(String(2), nullable=True)
    city = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), index=True)
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<SecurityEvent(id={self.id}, type='{self.event_type}', user_id={self.user_id})>"


class IPRestriction(Base):
    """
    IP address restrictions for enhanced security
    """
    __tablename__ = "ip_restrictions"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # IP Information
    ip_address = Column(String(45), nullable=False, index=True)  # Supports IPv4 and IPv6
    ip_range = Column(String(50), nullable=True)  # CIDR notation
    description = Column(String(255), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Usage tracking
    last_used = Column(DateTime, nullable=True)
    use_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<IPRestriction(id={self.id}, user_id={self.user_id}, ip='{self.ip_address}')>"


class SecurityPolicy(Base):
    """
    Security policies for platform configuration
    """
    __tablename__ = "security_policies"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Policy Information
    policy_name = Column(String(100), unique=True, nullable=False, index=True)
    policy_type = Column(String(50), nullable=False)  # password, session, mfa, ip_restriction
    description = Column(Text, nullable=True)
    
    # Policy Configuration
    config = Column(JSON, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    
    # Scope
    applies_to = Column(String(50), default="all")  # all, platform_owners, regular_users
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    def __repr__(self):
        return f"<SecurityPolicy(id={self.id}, name='{self.policy_name}', type='{self.policy_type}')>"


class SessionToken(Base):
    """
    Active session tokens for enhanced session management
    """
    __tablename__ = "session_tokens"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Token Information
    token_hash = Column(String(255), unique=True, nullable=False, index=True)
    token_type = Column(String(20), default="access")  # access, refresh
    
    # Session Information
    session_id = Column(String(255), nullable=True, index=True)
    device_fingerprint = Column(String(255), nullable=True)
    
    # Request Context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_revoked = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    last_used = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<SessionToken(id={self.id}, user_id={self.user_id}, type='{self.token_type}')>"


class ThreatDetection(Base):
    """
    Threat detection and suspicious activity tracking
    """
    __tablename__ = "threat_detections"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Threat Information
    threat_type = Column(String(50), nullable=False, index=True)  # brute_force, suspicious_login, etc.
    threat_level = Column(String(20), default="low")  # low, medium, high, critical
    confidence_score = Column(Integer, default=0)  # 0-100
    
    # Detection Details
    description = Column(Text, nullable=True)
    indicators = Column(JSON, nullable=True)  # IOCs and evidence
    
    # Context
    ip_address = Column(String(45), nullable=True, index=True)
    user_agent = Column(Text, nullable=True)
    request_pattern = Column(JSON, nullable=True)
    
    # Status
    status = Column(String(20), default="detected")  # detected, investigating, resolved, false_positive
    is_blocked = Column(Boolean, default=False)
    
    # Response
    action_taken = Column(String(100), nullable=True)
    response_details = Column(JSON, nullable=True)
    
    # Timestamps
    detected_at = Column(DateTime, default=func.now(), index=True)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<ThreatDetection(id={self.id}, type='{self.threat_type}', level='{self.threat_level}')>"


class AuditLog(Base):
    """
    Comprehensive audit logging for compliance
    """
    __tablename__ = "audit_logs"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Action Information
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(100), nullable=True)
    
    # Change Details
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    changes = Column(JSON, nullable=True)
    
    # Request Context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    request_id = Column(String(255), nullable=True)
    
    # Compliance
    compliance_tags = Column(JSON, default=[])  # GDPR, SOX, HIPAA, etc.
    retention_period_days = Column(Integer, default=2555)  # 7 years default
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), index=True)
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', user_id={self.user_id})>"