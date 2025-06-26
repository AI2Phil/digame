from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class MFAConfig(Base):
    """Multi-Factor Authentication configuration for users"""
    __tablename__ = "mfa_configs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    is_enabled = Column(Boolean, default=False, nullable=False)
    backup_codes = Column(JSON, nullable=True)  # Encrypted backup codes
    totp_secret = Column(Text, nullable=True)  # Encrypted TOTP secret
    recovery_email = Column(String(255), nullable=True)
    phone_number = Column(String(20), nullable=True)
    preferred_method = Column(String(20), default="totp", nullable=False)  # 'totp', 'sms', 'email'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="mfa_config")
    
    def __repr__(self):
        return f"<MFAConfig(user_id={self.user_id}, enabled={self.is_enabled}, method='{self.preferred_method}')>"

class SecurityAuditLog(Base):
    """Security audit log for tracking security events"""
    __tablename__ = "security_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    event_type = Column(String(50), nullable=False, index=True)  # 'login', 'logout', 'mfa_setup', 'password_change', etc.
    event_category = Column(String(30), nullable=False, index=True)  # 'authentication', 'authorization', 'data_access', 'configuration'
    severity = Column(String(20), nullable=False, index=True)  # 'low', 'medium', 'high', 'critical'
    description = Column(Text, nullable=False)
    ip_address = Column(String(45), nullable=True, index=True)  # IPv4 or IPv6
    user_agent = Column(Text, nullable=True)
    session_id = Column(String(255), nullable=True, index=True)
    resource_accessed = Column(String(255), nullable=True)
    action_taken = Column(String(100), nullable=True)
    result = Column(String(20), nullable=False)  # 'success', 'failure', 'blocked'
    event_metadata = Column(JSON, nullable=True)  # Additional event-specific data
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationship
    user = relationship("User", back_populates="security_logs")
    
    def __repr__(self):
        return f"<SecurityAuditLog(event_type='{self.event_type}', severity='{self.severity}', result='{self.result}')>"

class SecurityPolicy(Base):
    """Security policies and configurations"""
    __tablename__ = "security_policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_name = Column(String(100), nullable=False, unique=True, index=True)
    policy_type = Column(String(50), nullable=False, index=True)  # 'password', 'session', 'access', 'data'
    description = Column(Text, nullable=True)
    is_enabled = Column(Boolean, default=True, nullable=False)
    configuration = Column(JSON, nullable=False)  # Policy-specific configuration
    applies_to = Column(String(20), default="all", nullable=False)  # 'all', 'admin', 'user', 'guest'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationship
    creator = relationship("User", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<SecurityPolicy(name='{self.policy_name}', type='{self.policy_type}', enabled={self.is_enabled})>"

class ThreatDetection(Base):
    """Threat detection events and analysis"""
    __tablename__ = "threat_detections"

    id = Column(Integer, primary_key=True, index=True)
    detection_type = Column(String(50), nullable=False, index=True)  # 'brute_force', 'anomalous_access', 'data_exfiltration', etc.
    threat_level = Column(String(20), nullable=False, index=True)  # 'low', 'medium', 'high', 'critical'
    source_ip = Column(String(45), nullable=True, index=True)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    target_resource = Column(String(255), nullable=True)
    detection_rule = Column(String(100), nullable=False)
    confidence_score = Column(Integer, nullable=False)  # 0-100
    status = Column(String(20), default="active", nullable=False)  # 'active', 'investigating', 'resolved', 'false_positive'
    description = Column(Text, nullable=False)
    evidence = Column(JSON, nullable=True)  # Supporting evidence and data
    mitigation_actions = Column(JSON, nullable=True)  # Actions taken to mitigate
    detected_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    target_user = relationship("User", foreign_keys=[target_user_id], back_populates="threat_detections")
    resolver = relationship("User", foreign_keys=[resolved_by])
    
    def __repr__(self):
        return f"<ThreatDetection(type='{self.detection_type}', level='{self.threat_level}', status='{self.status}')>"

class SecurityIncident(Base):
    """Security incidents for tracking and response"""
    __tablename__ = "security_incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(50), nullable=False, unique=True, index=True)  # Human-readable ID
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False, index=True)  # 'low', 'medium', 'high', 'critical'
    status = Column(String(20), default="open", nullable=False, index=True)  # 'open', 'investigating', 'resolved', 'closed'
    category = Column(String(50), nullable=False, index=True)  # 'data_breach', 'unauthorized_access', 'malware', etc.
    affected_users = Column(JSON, nullable=True)  # List of affected user IDs
    affected_systems = Column(JSON, nullable=True)  # List of affected systems/resources
    timeline = Column(JSON, nullable=True)  # Incident timeline events
    response_actions = Column(JSON, nullable=True)  # Response and remediation actions
    lessons_learned = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    assignee = relationship("User", foreign_keys=[assigned_to])
    
    def __repr__(self):
        return f"<SecurityIncident(id='{self.incident_id}', severity='{self.severity}', status='{self.status}')>"

class AccessControl(Base):
    """Advanced access control rules and permissions"""
    __tablename__ = "access_controls"

    id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String(100), nullable=False, index=True)
    rule_type = Column(String(30), nullable=False, index=True)  # 'ip_whitelist', 'time_based', 'location_based', 'device_based'
    is_enabled = Column(Boolean, default=True, nullable=False)
    priority = Column(Integer, default=100, nullable=False)  # Lower number = higher priority
    conditions = Column(JSON, nullable=False)  # Rule conditions
    actions = Column(JSON, nullable=False)  # Actions to take (allow, deny, require_mfa, etc.)
    applies_to = Column(JSON, nullable=True)  # User IDs, roles, or groups this applies to
    exceptions = Column(JSON, nullable=True)  # Exceptions to the rule
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationship
    creator = relationship("User", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<AccessControl(name='{self.rule_name}', type='{self.rule_type}', enabled={self.is_enabled})>"

class SecurityMetrics(Base):
    """Security metrics and KPIs for monitoring"""
    __tablename__ = "security_metrics"

    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False, index=True)
    metric_type = Column(String(30), nullable=False, index=True)  # 'counter', 'gauge', 'histogram'
    value = Column(String(50), nullable=False)  # Stored as string to handle different data types
    unit = Column(String(20), nullable=True)  # 'count', 'percentage', 'seconds', etc.
    tags = Column(JSON, nullable=True)  # Additional metadata tags
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<SecurityMetrics(name='{self.metric_name}', value='{self.value}', timestamp={self.timestamp})>"