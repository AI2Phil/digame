"""
Security & Compliance Models for Database-Driven Implementation
SQLAlchemy 2.0 models for comprehensive security monitoring and compliance tracking
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, Dict, Any, List
from app.database import Base

class AuditEvent(Base):
    """Comprehensive audit trail for all system activities"""
    __tablename__ = 'audit_events'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)  # Nullable for system events
    
    # Event classification
    event_type = Column(String(100), nullable=False, index=True)  # login, logout, create, update, delete, access, etc.
    event_category = Column(String(50), nullable=False, index=True)  # authentication, data_access, system, admin, etc.
    event_severity = Column(String(20), default='info')  # info, warning, error, critical
    
    # Resource information
    resource_type = Column(String(100))  # user, team, report, model, etc.
    resource_id = Column(String(100))  # ID of the affected resource
    resource_name = Column(String(255))  # Human-readable resource name
    
    # Event details
    action_performed = Column(String(255), nullable=False)  # Description of action
    details_json = Column(JSON)  # Additional event details
    outcome = Column(String(50), default='success')  # success, failure, partial
    
    # Context information
    ip_address = Column(String(45))  # IPv4 or IPv6
    user_agent = Column(Text)
    session_id = Column(String(255))
    request_id = Column(String(255))
    
    # Metadata
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    processed_at = Column(DateTime(timezone=True))
    retention_until = Column(DateTime(timezone=True))  # Data retention policy
    
    __table_args__ = (
        Index('idx_audit_events_user_timestamp', 'user_id', 'timestamp'),
        Index('idx_audit_events_type_category', 'event_type', 'event_category'),
        Index('idx_audit_events_severity_timestamp', 'event_severity', 'timestamp'),
        Index('idx_audit_events_resource', 'resource_type', 'resource_id'),
    )

class SecurityEvent(Base):
    """Security-specific events and threat detection"""
    __tablename__ = 'security_events'
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Event classification
    event_type = Column(String(100), nullable=False, index=True)  # failed_login, suspicious_activity, malware_detected, etc.
    threat_category = Column(String(50), nullable=False)  # authentication, malware, data_breach, ddos, etc.
    severity = Column(String(20), nullable=False, index=True)  # low, medium, high, critical
    risk_score = Column(Float, default=0.0)  # 0.0 to 10.0 risk scoring
    
    # Source information
    source_ip = Column(String(45), nullable=False, index=True)
    source_country = Column(String(2))  # ISO country code
    source_asn = Column(String(20))  # Autonomous System Number
    user_agent = Column(Text)
    
    # Attack details
    attack_vector = Column(String(100))  # web, email, network, physical, etc.
    attack_signature = Column(String(255))  # Pattern or signature detected
    payload_hash = Column(String(64))  # SHA-256 hash of malicious payload
    
    # Detection information
    detection_method = Column(String(100))  # rule_based, ml_model, anomaly_detection, etc.
    detection_confidence = Column(Float, default=0.0)  # 0.0 to 1.0 confidence score
    false_positive_probability = Column(Float, default=0.0)
    
    # Response information
    response_action = Column(String(100))  # blocked, quarantined, monitored, escalated
    response_status = Column(String(50), default='pending')  # pending, in_progress, resolved, false_positive
    assigned_to = Column(Integer, ForeignKey('users.id'))
    
    # Event details
    description = Column(Text, nullable=False)
    details_json = Column(JSON)  # Technical details, logs, etc.
    affected_systems = Column(JSON)  # List of affected systems/services
    
    # Metadata
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    first_seen = Column(DateTime(timezone=True))
    last_seen = Column(DateTime(timezone=True))
    resolved_at = Column(DateTime(timezone=True))
    
    __table_args__ = (
        Index('idx_security_events_severity_timestamp', 'severity', 'timestamp'),
        Index('idx_security_events_type_status', 'event_type', 'response_status'),
        Index('idx_security_events_source_ip', 'source_ip'),
        Index('idx_security_events_risk_score', 'risk_score'),
    )

class ComplianceCheck(Base):
    """Compliance monitoring and assessment results"""
    __tablename__ = 'compliance_checks'
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Check identification
    check_type = Column(String(100), nullable=False, index=True)  # gdpr, hipaa, sox, pci_dss, iso27001, etc.
    check_category = Column(String(50), nullable=False)  # data_protection, access_control, encryption, etc.
    check_name = Column(String(255), nullable=False)
    check_description = Column(Text)
    
    # Compliance framework
    framework = Column(String(50), nullable=False)  # GDPR, HIPAA, SOX, PCI-DSS, ISO27001, etc.
    control_id = Column(String(50))  # Framework-specific control identifier
    requirement_level = Column(String(20), default='required')  # required, recommended, optional
    
    # Assessment results
    status = Column(String(50), nullable=False, index=True)  # compliant, non_compliant, partial, not_applicable
    score = Column(Float, default=0.0)  # 0.0 to 100.0 compliance score
    max_score = Column(Float, default=100.0)
    pass_threshold = Column(Float, default=80.0)
    
    # Check details
    details_json = Column(JSON)  # Detailed check results
    evidence_json = Column(JSON)  # Supporting evidence
    findings = Column(JSON)  # List of findings/issues
    recommendations = Column(JSON)  # Remediation recommendations
    
    # Assessment metadata
    assessed_by = Column(Integer, ForeignKey('users.id'))
    assessment_method = Column(String(100))  # automated, manual, hybrid
    assessment_tool = Column(String(100))  # Tool used for assessment
    
    # Timing
    checked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    next_check_due = Column(DateTime(timezone=True))
    remediation_deadline = Column(DateTime(timezone=True))
    
    # Status tracking
    remediation_status = Column(String(50), default='pending')  # pending, in_progress, completed, deferred
    remediation_assigned_to = Column(Integer, ForeignKey('users.id'))
    remediation_completed_at = Column(DateTime(timezone=True))
    
    __table_args__ = (
        Index('idx_compliance_checks_framework_status', 'framework', 'status'),
        Index('idx_compliance_checks_type_score', 'check_type', 'score'),
        Index('idx_compliance_checks_checked_at', 'checked_at'),
        Index('idx_compliance_checks_next_due', 'next_check_due'),
    )

class Vulnerability(Base):
    """Vulnerability tracking and management"""
    __tablename__ = 'vulnerabilities'
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Vulnerability identification
    cve_id = Column(String(20), unique=True, index=True)  # CVE-2023-12345
    vulnerability_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    # Severity assessment
    severity = Column(String(20), nullable=False, index=True)  # critical, high, medium, low
    cvss_score = Column(Float)  # 0.0 to 10.0 CVSS score
    cvss_vector = Column(String(255))  # CVSS vector string
    exploitability_score = Column(Float)  # 0.0 to 10.0
    impact_score = Column(Float)  # 0.0 to 10.0
    
    # Affected systems
    affected_systems = Column(JSON, nullable=False)  # List of affected systems/components
    affected_versions = Column(JSON)  # Affected software versions
    platform_impact = Column(JSON)  # Impact on different platforms
    
    # Vulnerability details
    vulnerability_type = Column(String(100))  # buffer_overflow, sql_injection, xss, etc.
    attack_vector = Column(String(50))  # network, adjacent, local, physical
    attack_complexity = Column(String(20))  # low, high
    privileges_required = Column(String(20))  # none, low, high
    user_interaction = Column(String(20))  # none, required
    
    # Discovery and disclosure
    discovered_at = Column(DateTime(timezone=True), nullable=False)
    disclosed_at = Column(DateTime(timezone=True))
    published_at = Column(DateTime(timezone=True))
    discovered_by = Column(String(255))  # Person/organization who discovered
    
    # Status and remediation
    status = Column(String(50), nullable=False, default='open', index=True)  # open, in_progress, resolved, wont_fix
    remediation_status = Column(String(50), default='pending')  # pending, in_progress, completed, deferred
    remediation_priority = Column(String(20), default='medium')  # critical, high, medium, low
    
    # Remediation details
    patch_available = Column(Boolean, default=False)
    patch_url = Column(String(500))
    workaround_available = Column(Boolean, default=False)
    workaround_description = Column(Text)
    
    # Assignment and tracking
    assigned_to = Column(Integer, ForeignKey('users.id'))
    remediation_deadline = Column(DateTime(timezone=True))
    resolved_at = Column(DateTime(timezone=True))
    resolution_notes = Column(Text)
    
    # References
    references_json = Column(JSON)  # External references, advisories
    exploit_available = Column(Boolean, default=False)
    exploit_maturity = Column(String(50))  # unproven, proof_of_concept, functional, weaponized
    
    __table_args__ = (
        Index('idx_vulnerabilities_severity_status', 'severity', 'status'),
        Index('idx_vulnerabilities_cvss_score', 'cvss_score'),
        Index('idx_vulnerabilities_discovered_at', 'discovered_at'),
        Index('idx_vulnerabilities_assigned_to', 'assigned_to'),
    )

class RiskAssessment(Base):
    """Risk assessment and management"""
    __tablename__ = 'risk_assessments'
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Assessment identification
    assessment_name = Column(String(255), nullable=False)
    assessment_type = Column(String(100), nullable=False)  # security, operational, financial, compliance
    asset_type = Column(String(100), nullable=False, index=True)  # system, data, process, facility
    asset_name = Column(String(255), nullable=False)
    asset_description = Column(Text)
    
    # Risk scoring
    risk_score = Column(Float, nullable=False, index=True)  # 0.0 to 10.0 overall risk score
    likelihood_score = Column(Float, nullable=False)  # 0.0 to 10.0 probability of occurrence
    impact_score = Column(Float, nullable=False)  # 0.0 to 10.0 impact severity
    risk_level = Column(String(20), nullable=False, index=True)  # critical, high, medium, low
    
    # Risk categorization
    risk_category = Column(String(100), nullable=False)  # cyber, operational, financial, regulatory
    risk_subcategory = Column(String(100))
    business_impact = Column(String(100))  # revenue, reputation, operations, compliance
    
    # Threat analysis
    threats_json = Column(JSON, nullable=False)  # List of identified threats
    threat_actors = Column(JSON)  # Potential threat actors
    attack_scenarios = Column(JSON)  # Possible attack scenarios
    
    # Vulnerability analysis
    vulnerabilities_json = Column(JSON)  # Associated vulnerabilities
    existing_controls = Column(JSON)  # Current security controls
    control_effectiveness = Column(Float, default=0.0)  # 0.0 to 1.0
    
    # Mitigation planning
    mitigations_json = Column(JSON, nullable=False)  # Planned mitigation measures
    mitigation_cost = Column(Float)  # Estimated cost of mitigation
    mitigation_timeline = Column(String(100))  # Timeline for implementation
    residual_risk_score = Column(Float)  # Risk score after mitigation
    
    # Assessment metadata
    assessed_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    assessment_method = Column(String(100))  # quantitative, qualitative, hybrid
    assessment_framework = Column(String(100))  # NIST, ISO27005, FAIR, etc.
    
    # Timing and review
    assessed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    review_due_date = Column(DateTime(timezone=True))
    last_reviewed_at = Column(DateTime(timezone=True))
    next_review_date = Column(DateTime(timezone=True))
    
    # Status tracking
    status = Column(String(50), default='active', index=True)  # active, under_review, archived
    approval_status = Column(String(50), default='pending')  # pending, approved, rejected
    approved_by = Column(Integer, ForeignKey('users.id'))
    approved_at = Column(DateTime(timezone=True))
    
    __table_args__ = (
        Index('idx_risk_assessments_risk_level', 'risk_level'),
        Index('idx_risk_assessments_category', 'risk_category'),
        Index('idx_risk_assessments_assessed_at', 'assessed_at'),
        Index('idx_risk_assessments_review_due', 'review_due_date'),
    )

class SecurityIncident(Base):
    """Security incident tracking and response management"""
    __tablename__ = 'security_incidents'
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Incident identification
    incident_id = Column(String(50), unique=True, nullable=False, index=True)  # INC-2023-001
    incident_title = Column(String(255), nullable=False)
    incident_description = Column(Text, nullable=False)
    
    # Classification
    incident_type = Column(String(100), nullable=False, index=True)  # data_breach, malware, ddos, insider_threat, etc.
    incident_category = Column(String(50), nullable=False)  # security, privacy, availability, integrity
    severity = Column(String(20), nullable=False, index=True)  # critical, high, medium, low
    priority = Column(String(20), nullable=False, index=True)  # urgent, high, medium, low
    
    # Impact assessment
    impact_scope = Column(String(100))  # internal, external, customer_facing, public
    affected_systems = Column(JSON)  # List of affected systems
    affected_users_count = Column(Integer, default=0)
    data_compromised = Column(Boolean, default=False)
    data_types_affected = Column(JSON)  # Types of data potentially compromised
    
    # Financial impact
    estimated_cost = Column(Float, default=0.0)
    actual_cost = Column(Float)
    business_impact = Column(Text)
    
    # Timeline
    detected_at = Column(DateTime(timezone=True), nullable=False)
    reported_at = Column(DateTime(timezone=True), nullable=False)
    acknowledged_at = Column(DateTime(timezone=True))
    contained_at = Column(DateTime(timezone=True))
    resolved_at = Column(DateTime(timezone=True))
    
    # Status and workflow
    status = Column(String(50), nullable=False, default='open', index=True)  # open, investigating, contained, resolved, closed
    workflow_stage = Column(String(50), default='detection')  # detection, analysis, containment, eradication, recovery, lessons_learned
    
    # Assignment and responsibility
    assigned_to = Column(Integer, ForeignKey('users.id'))
    incident_commander = Column(Integer, ForeignKey('users.id'))
    response_team = Column(JSON)  # List of team members involved
    
    # Investigation details
    root_cause = Column(Text)
    investigation_findings = Column(JSON)
    evidence_collected = Column(JSON)
    forensic_analysis = Column(JSON)
    
    # Response actions
    containment_actions = Column(JSON)  # Actions taken to contain the incident
    eradication_actions = Column(JSON)  # Actions to eliminate the threat
    recovery_actions = Column(JSON)  # Actions to restore normal operations
    
    # Communication and reporting
    stakeholders_notified = Column(JSON)  # List of notified stakeholders
    external_reporting_required = Column(Boolean, default=False)
    regulatory_notifications = Column(JSON)  # Regulatory bodies notified
    customer_notification_sent = Column(Boolean, default=False)
    
    # Lessons learned
    lessons_learned = Column(Text)
    recommendations = Column(JSON)  # Recommendations for improvement
    follow_up_actions = Column(JSON)  # Actions to prevent recurrence
    
    # Metadata
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_security_incidents_type_severity', 'incident_type', 'severity'),
        Index('idx_security_incidents_status_priority', 'status', 'priority'),
        Index('idx_security_incidents_detected_at', 'detected_at'),
        Index('idx_security_incidents_assigned_to', 'assigned_to'),
    )

class SecurityMetric(Base):
    """Security metrics and KPIs tracking"""
    __tablename__ = 'security_metrics'
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Metric identification
    metric_name = Column(String(100), nullable=False, index=True)
    metric_category = Column(String(50), nullable=False, index=True)  # vulnerability, incident, compliance, awareness
    metric_type = Column(String(50), nullable=False)  # count, percentage, ratio, score, time
    
    # Metric values
    metric_value = Column(Float, nullable=False)
    target_value = Column(Float)
    threshold_warning = Column(Float)
    threshold_critical = Column(Float)
    
    # Calculation details
    calculation_method = Column(String(255))
    data_source = Column(String(100))
    calculation_period = Column(String(50))  # daily, weekly, monthly, quarterly
    
    # Context and metadata
    business_unit = Column(String(100))
    system_component = Column(String(100))
    measurement_date = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Trend analysis
    previous_value = Column(Float)
    trend_direction = Column(String(20))  # improving, declining, stable
    variance_percentage = Column(Float)
    
    # Metadata
    collected_by = Column(String(100))  # System or person collecting the metric
    collected_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        Index('idx_security_metrics_name_date', 'metric_name', 'measurement_date'),
        Index('idx_security_metrics_category_date', 'metric_category', 'measurement_date'),
    )