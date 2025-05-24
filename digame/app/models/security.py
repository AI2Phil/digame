"""
Advanced Security Controls models for enterprise features
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

# Use the existing Base from the project
try:
    from ..database import Base
except ImportError:
    # Fallback for development
    Base = declarative_base()

class SecurityPolicy(Base):
    """
    Security policies and rules for tenant-level security controls
    """
    __tablename__ = "security_policies"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    policy_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # Policy metadata
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)  # access, authentication, data, network
    severity = Column(String(50), default="medium")  # low, medium, high, critical
    
    # Policy configuration
    policy_type = Column(String(100), nullable=False)  # password, session, access, encryption, etc.
    policy_rules = Column(JSON, default={})  # Specific rules and parameters
    enforcement_mode = Column(String(50), default="enforce")  # monitor, warn, enforce
    
    # Scope and targeting
    applies_to = Column(JSON, default={})  # Users, roles, resources this policy applies to
    exceptions = Column(JSON, default=[])  # Exceptions to the policy
    
    # Status and lifecycle
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)  # System default policy
    priority = Column(Integer, default=100)  # Higher number = higher priority
    
    # Effectiveness tracking
    violations_count = Column(Integer, default=0)
    last_violation_at = Column(DateTime, nullable=True)
    compliance_score = Column(Float, nullable=True)  # 0.0 to 1.0
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    violations = relationship("SecurityViolation", back_populates="policy", cascade="all, delete-orphan")
    audit_logs = relationship("SecurityAuditLog", back_populates="policy", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<SecurityPolicy(id={self.id}, name='{self.name}', category='{self.category}')>"

    @property
    def violation_rate(self):
        """Calculate violation rate over time"""
        if self.violations_count == 0:
            return 0.0
        # This would calculate based on time period and total applicable events
        return min(self.violations_count / 1000.0, 1.0)  # Mock calculation

    def is_applicable_to_user(self, user_id: int, user_roles: list) -> bool:
        """Check if policy applies to a specific user"""
        applies_to = self.applies_to
        
        # Check user-specific targeting
        if "users" in applies_to and user_id in applies_to["users"]:
            return True
        
        # Check role-based targeting
        if "roles" in applies_to and any(role in applies_to["roles"] for role in user_roles):
            return True
        
        # Check if it's a global policy
        if not applies_to or applies_to.get("global", False):
            return True
        
        return False


class SecurityViolation(Base):
    """
    Security policy violations and incidents
    """
    __tablename__ = "security_violations"

    id = Column(Integer, primary_key=True, index=True)
    violation_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    policy_id = Column(Integer, ForeignKey("security_policies.id"), nullable=False, index=True)
    
    # Violation context
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    resource_type = Column(String(100), nullable=True)  # file, api, login, etc.
    resource_id = Column(String(255), nullable=True)
    action_attempted = Column(String(255), nullable=False)
    
    # Violation details
    violation_type = Column(String(100), nullable=False, index=True)
    severity = Column(String(50), nullable=False, index=True)  # low, medium, high, critical
    description = Column(Text, nullable=False)
    details = Column(JSON, default={})  # Additional violation context
    
    # Detection and response
    detected_by = Column(String(100), nullable=False)  # system, user, automated_scan, etc.
    detection_method = Column(String(100), nullable=True)  # rule_engine, ml_model, manual
    response_action = Column(String(100), nullable=True)  # block, warn, log, quarantine
    
    # Status and resolution
    status = Column(String(50), default="open")  # open, investigating, resolved, false_positive
    resolution = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Risk assessment
    risk_score = Column(Float, nullable=True)  # 0.0 to 10.0
    impact_level = Column(String(50), nullable=True)  # low, medium, high, critical
    
    # Network and system context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    session_id = Column(String(255), nullable=True)
    
    # Timing
    occurred_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    policy = relationship("SecurityPolicy", back_populates="violations")

    def __repr__(self):
        return f"<SecurityViolation(id={self.id}, type='{self.violation_type}', severity='{self.severity}')>"

    @property
    def is_critical(self):
        return self.severity == "critical"

    @property
    def age_hours(self):
        return (datetime.utcnow() - self.occurred_at).total_seconds() / 3600

    def escalate_severity(self):
        """Escalate violation severity"""
        severity_levels = ["low", "medium", "high", "critical"]
        current_index = severity_levels.index(self.severity)
        if current_index < len(severity_levels) - 1:
            self.severity = severity_levels[current_index + 1]


class SecurityScan(Base):
    """
    Security scans and assessments
    """
    __tablename__ = "security_scans"

    id = Column(Integer, primary_key=True, index=True)
    scan_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Scan metadata
    name = Column(String(255), nullable=False)
    scan_type = Column(String(100), nullable=False, index=True)  # vulnerability, compliance, penetration, etc.
    target_scope = Column(JSON, default={})  # What is being scanned
    
    # Scan configuration
    scan_config = Column(JSON, default={})  # Scan parameters and settings
    scheduled = Column(Boolean, default=False)
    schedule_config = Column(JSON, default={})  # Cron expression, frequency
    
    # Execution details
    status = Column(String(50), default="pending")  # pending, running, completed, failed, cancelled
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Results summary
    total_checks = Column(Integer, default=0)
    passed_checks = Column(Integer, default=0)
    failed_checks = Column(Integer, default=0)
    warnings_count = Column(Integer, default=0)
    critical_issues = Column(Integer, default=0)
    high_issues = Column(Integer, default=0)
    medium_issues = Column(Integer, default=0)
    low_issues = Column(Integer, default=0)
    
    # Scoring
    security_score = Column(Float, nullable=True)  # 0.0 to 100.0
    compliance_score = Column(Float, nullable=True)  # 0.0 to 100.0
    risk_score = Column(Float, nullable=True)  # 0.0 to 10.0
    
    # Results and reporting
    results_summary = Column(JSON, default={})
    detailed_results = Column(JSON, default={})
    recommendations = Column(JSON, default=[])
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    findings = relationship("SecurityFinding", back_populates="scan", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<SecurityScan(id={self.id}, name='{self.name}', type='{self.scan_type}')>"

    @property
    def is_completed(self):
        return self.status == "completed"

    @property
    def pass_rate(self):
        if self.total_checks == 0:
            return 0.0
        return (self.passed_checks / self.total_checks) * 100

    @property
    def overall_risk_level(self):
        if self.critical_issues > 0:
            return "critical"
        elif self.high_issues > 0:
            return "high"
        elif self.medium_issues > 0:
            return "medium"
        else:
            return "low"


class SecurityFinding(Base):
    """
    Individual security findings from scans
    """
    __tablename__ = "security_findings"

    id = Column(Integer, primary_key=True, index=True)
    finding_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(Integer, ForeignKey("security_scans.id"), nullable=False, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Finding classification
    finding_type = Column(String(100), nullable=False, index=True)  # vulnerability, misconfiguration, etc.
    category = Column(String(100), nullable=False, index=True)  # authentication, encryption, access_control
    severity = Column(String(50), nullable=False, index=True)  # low, medium, high, critical
    
    # Finding details
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    technical_details = Column(Text, nullable=True)
    affected_resource = Column(String(500), nullable=True)
    
    # Risk assessment
    risk_score = Column(Float, nullable=True)  # 0.0 to 10.0
    cvss_score = Column(Float, nullable=True)  # Common Vulnerability Scoring System
    exploitability = Column(String(50), nullable=True)  # low, medium, high
    impact = Column(String(50), nullable=True)  # low, medium, high
    
    # Remediation
    remediation_effort = Column(String(50), nullable=True)  # low, medium, high
    remediation_steps = Column(Text, nullable=True)
    remediation_priority = Column(Integer, default=5)  # 1-10 scale
    
    # Status tracking
    status = Column(String(50), default="open")  # open, in_progress, resolved, accepted_risk, false_positive
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    # Compliance mapping
    compliance_frameworks = Column(JSON, default=[])  # SOC2, ISO27001, PCI-DSS, etc.
    compliance_controls = Column(JSON, default=[])  # Specific control references
    
    # Evidence and proof
    evidence = Column(JSON, default={})  # Screenshots, logs, etc.
    proof_of_concept = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    scan = relationship("SecurityScan", back_populates="findings")

    def __repr__(self):
        return f"<SecurityFinding(id={self.id}, title='{self.title[:50]}...', severity='{self.severity}')>"

    @property
    def is_critical(self):
        return self.severity == "critical"

    @property
    def age_days(self):
        return (datetime.utcnow() - self.created_at).days

    @property
    def is_overdue(self):
        """Check if finding is overdue based on severity"""
        sla_days = {"critical": 1, "high": 7, "medium": 30, "low": 90}
        return self.age_days > sla_days.get(self.severity, 90)


class SecurityAuditLog(Base):
    """
    Security audit log for compliance and monitoring
    """
    __tablename__ = "security_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    policy_id = Column(Integer, ForeignKey("security_policies.id"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Event classification
    event_type = Column(String(100), nullable=False, index=True)  # policy_change, access_granted, etc.
    event_category = Column(String(50), nullable=False, index=True)  # security, compliance, access
    severity = Column(String(50), default="info")  # info, warning, error, critical
    
    # Event details
    action = Column(String(255), nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    
    # Context and metadata
    details = Column(JSON, default={})
    before_state = Column(JSON, default={})  # State before change
    after_state = Column(JSON, default={})  # State after change
    
    # Network context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    session_id = Column(String(255), nullable=True)
    
    # Compliance tracking
    compliance_relevant = Column(Boolean, default=False)
    retention_period_days = Column(Integer, default=2555)  # 7 years default
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    policy = relationship("SecurityPolicy", back_populates="audit_logs")

    def __repr__(self):
        return f"<SecurityAuditLog(id={self.id}, event_type='{self.event_type}', action='{self.action}')>"

    @property
    def is_critical_event(self):
        return self.severity == "critical"

    @property
    def retention_expires_at(self):
        return self.created_at + timedelta(days=self.retention_period_days)


class SecurityConfiguration(Base):
    """
    Global security configuration for tenants
    """
    __tablename__ = "security_configurations"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Password policies
    password_min_length = Column(Integer, default=8)
    password_require_uppercase = Column(Boolean, default=True)
    password_require_lowercase = Column(Boolean, default=True)
    password_require_numbers = Column(Boolean, default=True)
    password_require_symbols = Column(Boolean, default=True)
    password_history_count = Column(Integer, default=5)
    password_max_age_days = Column(Integer, default=90)
    
    # Session security
    session_timeout_minutes = Column(Integer, default=480)  # 8 hours
    session_absolute_timeout_hours = Column(Integer, default=24)
    max_concurrent_sessions = Column(Integer, default=5)
    require_fresh_auth_minutes = Column(Integer, default=60)
    
    # Access controls
    max_login_attempts = Column(Integer, default=5)
    lockout_duration_minutes = Column(Integer, default=30)
    require_mfa = Column(Boolean, default=False)
    allowed_ip_ranges = Column(JSON, default=[])
    blocked_ip_ranges = Column(JSON, default=[])
    
    # Data protection
    data_encryption_at_rest = Column(Boolean, default=True)
    data_encryption_in_transit = Column(Boolean, default=True)
    data_retention_days = Column(Integer, default=2555)  # 7 years
    data_backup_encryption = Column(Boolean, default=True)
    
    # Monitoring and alerting
    security_monitoring_enabled = Column(Boolean, default=True)
    real_time_alerts = Column(Boolean, default=True)
    alert_email_addresses = Column(JSON, default=[])
    alert_webhook_url = Column(String(500), nullable=True)
    
    # Compliance settings
    compliance_frameworks = Column(JSON, default=[])  # SOC2, ISO27001, etc.
    audit_log_retention_days = Column(Integer, default=2555)
    automated_compliance_checks = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    def __repr__(self):
        return f"<SecurityConfiguration(id={self.id}, tenant_id={self.tenant_id})>"

    def get_password_policy(self) -> dict:
        """Get password policy as dictionary"""
        return {
            "min_length": self.password_min_length,
            "require_uppercase": self.password_require_uppercase,
            "require_lowercase": self.password_require_lowercase,
            "require_numbers": self.password_require_numbers,
            "require_symbols": self.password_require_symbols,
            "history_count": self.password_history_count,
            "max_age_days": self.password_max_age_days
        }

    def is_ip_allowed(self, ip_address: str) -> bool:
        """Check if IP address is allowed"""
        # Implementation would check against allowed/blocked ranges
        return True  # Simplified for now