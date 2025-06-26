from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum

# Enums for security-related types
class MFAMethod(str, Enum):
    TOTP = "totp"
    SMS = "sms"
    EMAIL = "email"

class EventType(str, Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    MFA_SETUP = "mfa_setup"
    MFA_DISABLE = "mfa_disable"
    PASSWORD_CHANGE = "password_change"
    ACCOUNT_LOCKED = "account_locked"
    PERMISSION_CHANGE = "permission_change"
    DATA_ACCESS = "data_access"
    CONFIGURATION_CHANGE = "configuration_change"
    FAILED_LOGIN = "failed_login"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"

class EventCategory(str, Enum):
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    DATA_ACCESS = "data_access"
    CONFIGURATION = "configuration"
    SYSTEM = "system"

class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class PolicyType(str, Enum):
    PASSWORD = "password"
    SESSION = "session"
    ACCESS = "access"
    DATA = "data"
    MFA = "mfa"

class ThreatLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ThreatStatus(str, Enum):
    ACTIVE = "active"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"

class IncidentStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    CLOSED = "closed"

class AccessControlType(str, Enum):
    IP_WHITELIST = "ip_whitelist"
    TIME_BASED = "time_based"
    LOCATION_BASED = "location_based"
    DEVICE_BASED = "device_based"
    ROLE_BASED = "role_based"

# MFA Configuration Schemas
class MFAConfigBase(BaseModel):
    is_enabled: bool = False
    recovery_email: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_method: MFAMethod = MFAMethod.TOTP

class MFAConfigCreate(MFAConfigBase):
    user_id: int

class MFAConfigUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    recovery_email: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_method: Optional[MFAMethod] = None

class MFAConfigResponse(MFAConfigBase):
    id: int
    user_id: int
    has_backup_codes: bool = Field(..., description="Whether backup codes are configured")
    has_totp_secret: bool = Field(..., description="Whether TOTP secret is configured")
    created_at: datetime
    updated_at: datetime
    last_used_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class MFASetupRequest(BaseModel):
    method: MFAMethod
    recovery_email: Optional[str] = None
    phone_number: Optional[str] = None

class MFASetupResponse(BaseModel):
    qr_code_url: Optional[str] = Field(None, description="QR code URL for TOTP setup")
    backup_codes: List[str] = Field(..., description="One-time backup codes")
    secret_key: Optional[str] = Field(None, description="TOTP secret key for manual entry")

class MFAVerifyRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=8)
    method: Optional[MFAMethod] = None

# Security Audit Log Schemas
class SecurityAuditLogBase(BaseModel):
    event_type: EventType
    event_category: EventCategory
    severity: Severity
    description: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    session_id: Optional[str] = None
    resource_accessed: Optional[str] = None
    action_taken: Optional[str] = None
    result: str
    metadata: Optional[Dict[str, Any]] = None

class SecurityAuditLogCreate(SecurityAuditLogBase):
    user_id: Optional[int] = None

class SecurityAuditLogResponse(SecurityAuditLogBase):
    id: int
    user_id: Optional[int] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True

class SecurityAuditLogFilter(BaseModel):
    user_id: Optional[int] = None
    event_type: Optional[EventType] = None
    event_category: Optional[EventCategory] = None
    severity: Optional[Severity] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    ip_address: Optional[str] = None
    result: Optional[str] = None

# Security Policy Schemas
class SecurityPolicyBase(BaseModel):
    policy_name: str = Field(..., min_length=1, max_length=100)
    policy_type: PolicyType
    description: Optional[str] = None
    is_enabled: bool = True
    configuration: Dict[str, Any]
    applies_to: str = "all"

class SecurityPolicyCreate(SecurityPolicyBase):
    pass

class SecurityPolicyUpdate(BaseModel):
    policy_name: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    configuration: Optional[Dict[str, Any]] = None
    applies_to: Optional[str] = None

class SecurityPolicyResponse(SecurityPolicyBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: int
    
    class Config:
        from_attributes = True

# Threat Detection Schemas
class ThreatDetectionBase(BaseModel):
    detection_type: str
    threat_level: ThreatLevel
    source_ip: Optional[str] = None
    target_resource: Optional[str] = None
    detection_rule: str
    confidence_score: int = Field(..., description="Confidence score between 0-100")
    description: str
    evidence: Optional[Dict[str, Any]] = None

class ThreatDetectionCreate(ThreatDetectionBase):
    target_user_id: Optional[int] = None

class ThreatDetectionUpdate(BaseModel):
    status: Optional[ThreatStatus] = None
    mitigation_actions: Optional[Dict[str, Any]] = None
    resolved_by: Optional[int] = None

class ThreatDetectionResponse(ThreatDetectionBase):
    id: int
    target_user_id: Optional[int] = None
    status: ThreatStatus
    mitigation_actions: Optional[Dict[str, Any]] = None
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None
    
    class Config:
        from_attributes = True

# Security Incident Schemas
class SecurityIncidentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str
    severity: Severity
    category: str
    affected_users: Optional[List[int]] = None
    affected_systems: Optional[List[str]] = None

class SecurityIncidentCreate(SecurityIncidentBase):
    pass

class SecurityIncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[Severity] = None
    status: Optional[IncidentStatus] = None
    category: Optional[str] = None
    affected_users: Optional[List[int]] = None
    affected_systems: Optional[List[str]] = None
    timeline: Optional[List[Dict[str, Any]]] = None
    response_actions: Optional[List[Dict[str, Any]]] = None
    lessons_learned: Optional[str] = None
    assigned_to: Optional[int] = None

class SecurityIncidentResponse(SecurityIncidentBase):
    id: int
    incident_id: str
    status: IncidentStatus
    timeline: Optional[List[Dict[str, Any]]] = None
    response_actions: Optional[List[Dict[str, Any]]] = None
    lessons_learned: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    created_by: int
    assigned_to: Optional[int] = None
    
    class Config:
        from_attributes = True

# Access Control Schemas
class AccessControlBase(BaseModel):
    rule_name: str = Field(..., min_length=1, max_length=100)
    rule_type: AccessControlType
    is_enabled: bool = True
    priority: int = Field(100, description="Priority level (1-1000, lower = higher priority)")
    conditions: Dict[str, Any]
    actions: Dict[str, Any]
    applies_to: Optional[List[Union[int, str]]] = None
    exceptions: Optional[List[Union[int, str]]] = None
    description: Optional[str] = None

class AccessControlCreate(AccessControlBase):
    pass

class AccessControlUpdate(BaseModel):
    rule_name: Optional[str] = None
    is_enabled: Optional[bool] = None
    priority: Optional[int] = None
    conditions: Optional[Dict[str, Any]] = None
    actions: Optional[Dict[str, Any]] = None
    applies_to: Optional[List[Union[int, str]]] = None
    exceptions: Optional[List[Union[int, str]]] = None
    description: Optional[str] = None

class AccessControlResponse(AccessControlBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: int
    
    class Config:
        from_attributes = True

# Security Metrics Schemas
class SecurityMetricsBase(BaseModel):
    metric_name: str
    metric_type: str
    value: str
    unit: Optional[str] = None
    tags: Optional[Dict[str, str]] = None

class SecurityMetricsCreate(SecurityMetricsBase):
    pass

class SecurityMetricsResponse(SecurityMetricsBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Dashboard and Analytics Schemas
class SecurityDashboardSummary(BaseModel):
    """Summary statistics for security dashboard"""
    total_users_with_mfa: int
    mfa_adoption_rate: float
    active_threats: int
    resolved_threats_today: int
    open_incidents: int
    critical_incidents: int
    failed_login_attempts_today: int
    security_score: int = Field(..., description="Overall security score (0-100)")
    recent_events: List[SecurityAuditLogResponse]
    threat_trends: Dict[str, int]
    policy_compliance: Dict[str, float]

class SecurityAnalytics(BaseModel):
    """Detailed security analytics"""
    time_period: str
    login_success_rate: float
    mfa_usage_stats: Dict[str, int]
    threat_detection_stats: Dict[str, int]
    incident_resolution_time: float  # Average in hours
    top_threat_sources: List[Dict[str, Any]]
    security_events_timeline: List[Dict[str, Any]]
    compliance_metrics: Dict[str, float]

class ThreatIntelligence(BaseModel):
    """Threat intelligence summary"""
    active_threat_count: int
    threat_level_distribution: Dict[str, int]
    top_attack_vectors: List[Dict[str, Any]]
    geographic_threat_distribution: Dict[str, int]
    threat_trends: Dict[str, List[int]]  # Time series data
    recommended_actions: List[str]

# Bulk Operations
class BulkSecurityAction(BaseModel):
    action: str  # 'enable_mfa', 'disable_user', 'reset_password', etc.
    target_users: List[int]
    parameters: Optional[Dict[str, Any]] = None

class BulkSecurityResult(BaseModel):
    success_count: int
    failure_count: int
    results: List[Dict[str, Any]]

# Security Configuration
class SecurityConfiguration(BaseModel):
    """Overall security configuration"""
    password_policy: Dict[str, Any]
    session_policy: Dict[str, Any]
    mfa_policy: Dict[str, Any]
    access_control_rules: List[AccessControlResponse]
    threat_detection_rules: List[str]
    notification_settings: Dict[str, Any]

# Export/Import Schemas
class SecurityConfigExport(BaseModel):
    """Schema for exporting security configurations"""
    policies: List[SecurityPolicyResponse]
    access_controls: List[AccessControlResponse]
    export_timestamp: datetime
    export_version: str = "1.0"

class SecurityReportRequest(BaseModel):
    """Request for security reports"""
    report_type: str  # 'audit', 'compliance', 'threat_analysis', 'incident_summary'
    start_date: datetime
    end_date: datetime
    include_details: bool = True
    format: str = "pdf"  # 'pdf', 'csv', 'json'
    filters: Optional[Dict[str, Any]] = None