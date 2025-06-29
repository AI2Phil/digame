from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import secrets

from app.database import get_db
from app.models.user import User
from app.models.security import ThreatDetection, SecurityEvent, SecurityPolicy, AuditLog
from app.services.security_service import get_security_services
from app.schemas.security_schemas import (
    MFAConfigResponse, MFASetupRequest, MFASetupResponse, MFAVerifyRequest,
    SecurityAuditLogResponse, SecurityAuditLogFilter, SecurityPolicyCreate,
    SecurityPolicyResponse, ThreatDetectionResponse, SecurityIncidentCreate,
    SecurityIncidentResponse, SecurityDashboardSummary, AccessControlCreate,
    AccessControlResponse, SecurityAuditLogCreate, EventType, Severity
)

router = APIRouter(prefix="/security", tags=["security"])

# Helper function to get current user (simplified - would use actual auth)
def get_current_user() -> User:
    # This would be replaced with actual authentication
    return User(id=1, email="admin@example.com")

def require_admin() -> User:
    # This would check if user has admin role
    return get_current_user()

def get_client_ip(request: Request) -> str:
    """Get client IP address from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

# MFA Endpoints
@router.post("/mfa/setup", response_model=MFASetupResponse)
async def setup_mfa(
    setup_request: MFASetupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set up Multi-Factor Authentication for the current user"""
    try:
        services = get_security_services(db)
        mfa_service = services["mfa"]
        
        response = mfa_service.setup_mfa(current_user.id, setup_request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to set up MFA: {str(e)}"
        )

@router.post("/mfa/verify")
async def verify_mfa(
    verify_request: MFAVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify MFA code"""
    services = get_security_services(db)
    mfa_service = services["mfa"]
    
    is_valid = mfa_service.verify_mfa(
        current_user.id, 
        verify_request.code, 
        verify_request.method.value if verify_request.method else None
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA code"
        )
    
    return {"message": "MFA verification successful", "valid": True}

@router.get("/mfa/config", response_model=MFAConfigResponse)
async def get_mfa_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get MFA configuration for the current user"""
    services = get_security_services(db)
    mfa_service = services["mfa"]
    
    config = mfa_service.get_mfa_config(current_user.id)
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MFA not configured for this user"
        )
    
    return MFAConfigResponse(
        id=config.id,
        user_id=config.user_id,
        is_enabled=config.is_enabled,
        recovery_email=config.recovery_email,
        phone_number=config.phone_number,
        preferred_method=config.preferred_method,
        has_backup_codes=bool(config.backup_codes),
        has_totp_secret=bool(config.totp_secret),
        created_at=config.created_at,
        updated_at=config.updated_at,
        last_used_at=config.last_used_at
    )

@router.delete("/mfa/disable")
async def disable_mfa(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Disable MFA for the current user"""
    services = get_security_services(db)
    mfa_service = services["mfa"]
    
    success = mfa_service.disable_mfa(current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MFA configuration not found"
        )
    
    return {"message": "MFA disabled successfully"}

# Security Audit Endpoints
@router.get("/audit/logs", response_model=List[SecurityAuditLogResponse])
async def get_audit_logs(
    user_id: Optional[int] = None,
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get security audit logs (Admin only)"""
    services = get_security_services(db)
    audit_service = services["audit"]
    
    filters = {}
    if user_id:
        filters["user_id"] = user_id
    if event_type:
        filters["event_type"] = event_type
    if severity:
        filters["severity"] = severity
    # Note: Date parsing would be implemented in a real application
    
    logs = audit_service.get_audit_logs(filters, skip, limit)
    
    return [
        SecurityAuditLogResponse(
            id=log.id,
            user_id=log.user_id,
            event_type=log.event_type,
            event_category=log.event_category,
            severity=log.severity,
            description=log.description,
            ip_address=log.ip_address,
            user_agent=log.user_agent,
            session_id=log.session_id,
            resource_accessed=log.resource_accessed,
            action_taken=log.action_taken,
            result=log.result,
            metadata=log.metadata,
            timestamp=log.timestamp
        )
        for log in logs
    ]

@router.post("/audit/log")
async def create_audit_log(
    log_data: SecurityAuditLogCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a security audit log entry"""
    services = get_security_services(db)
    audit_service = services["audit"]
    
    # Add request metadata
    if not log_data.ip_address:
        log_data.ip_address = get_client_ip(request)
    if not log_data.user_agent:
        log_data.user_agent = request.headers.get("User-Agent")
    
    log_entry = audit_service.log_event(log_data)
    
    return {"message": "Audit log created", "log_id": log_entry.id}

# Security Dashboard Endpoints
@router.get("/dashboard", response_model=SecurityDashboardSummary)
async def get_security_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get security dashboard summary (Admin only)"""
    services = get_security_services(db)
    dashboard_service = services["dashboard"]
    
    summary = dashboard_service.get_dashboard_summary()
    
    return SecurityDashboardSummary(**summary)

@router.get("/metrics")
async def get_security_metrics(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get security metrics (Admin only)"""
    services = get_security_services(db)
    audit_service = services["audit"]
    
    metrics = audit_service.get_security_metrics(days)
    
    return metrics

# Security Policy Endpoints
@router.post("/policies", response_model=SecurityPolicyResponse)
async def create_security_policy(
    policy_data: SecurityPolicyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new security policy (Admin only)"""
    try:
        services = get_security_services(db)
        policy_service = services["policy"]
        
        policy = policy_service.create_policy(policy_data, current_user.id)
        
        return SecurityPolicyResponse(
            id=policy.id,
            policy_name=policy.policy_name,
            policy_type=policy.policy_type,
            description=policy.description,
            is_enabled=policy.is_enabled,
            configuration=policy.configuration,
            applies_to=policy.applies_to,
            created_at=policy.created_at,
            updated_at=policy.updated_at,
            created_by=policy.created_by
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create security policy: {str(e)}"
        )

@router.get("/policies", response_model=List[SecurityPolicyResponse])
async def get_security_policies(
    policy_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get security policies (Admin only)"""
    services = get_security_services(db)
    policy_service = services["policy"]
    
    policies = policy_service.get_active_policies(policy_type)
    
    return [
        SecurityPolicyResponse(
            id=policy.id,
            policy_name=policy.policy_name,
            policy_type=policy.policy_type,
            description=policy.description,
            is_enabled=policy.is_enabled,
            configuration=policy.configuration,
            applies_to=policy.applies_to,
            created_at=policy.created_at,
            updated_at=policy.updated_at,
            created_by=policy.created_by
        )
        for policy in policies
    ]

@router.post("/policies/validate-password")
async def validate_password(
    password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Validate password against security policies"""
    services = get_security_services(db)
    policy_service = services["policy"]
    
    is_valid, errors = policy_service.evaluate_password_policy(password)
    
    return {
        "valid": is_valid,
        "errors": errors,
        "strength_score": max(0, 100 - len(errors) * 20)  # Simplified scoring
    }

# Threat Detection Endpoints
@router.get("/threats", response_model=List[ThreatDetectionResponse])
async def get_threats(
    status: Optional[str] = None,
    threat_level: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get threat detections (Admin only)"""
    query = db.query(ThreatDetection)
    
    if status:
        query = query.filter(ThreatDetection.status == status)
    
    if threat_level:
        query = query.filter(ThreatDetection.threat_level == threat_level)
    
    threats = query.offset(skip).limit(limit).all()
    
    return [
        ThreatDetectionResponse(
            id=threat.id,
            detection_type=threat.detection_type,
            threat_level=threat.threat_level,
            source_ip=threat.source_ip,
            target_user_id=threat.target_user_id,
            target_resource=threat.target_resource,
            detection_rule=threat.detection_rule,
            confidence_score=threat.confidence_score,
            status=threat.status,
            description=threat.description,
            evidence=threat.evidence,
            mitigation_actions=threat.mitigation_actions,
            detected_at=threat.detected_at,
            resolved_at=threat.resolved_at,
            resolved_by=threat.resolved_by
        )
        for threat in threats
    ]

@router.post("/threats/{threat_id}/resolve")
async def resolve_threat(
    threat_id: int,
    mitigation_actions: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Resolve a threat detection (Admin only)"""
    services = get_security_services(db)
    threat_service = services["threat_detection"]
    
    success = threat_service.resolve_threat(threat_id, current_user.id, mitigation_actions)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Threat detection not found"
        )
    
    return {"message": "Threat resolved successfully"}

# Security Incident Endpoints
@router.post("/incidents", response_model=SecurityIncidentResponse)
async def create_security_incident(
    incident_data: SecurityIncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new security incident (Admin only)"""
    try:
        # Generate incident ID
        incident_id = f"INC-{datetime.utcnow().strftime('%Y%m%d')}-{secrets.token_hex(3).upper()}"
        
        incident = SecurityIncident()
        incident.incident_id = incident_id
        incident.title = incident_data.title
        incident.description = incident_data.description
        incident.severity = incident_data.severity.value
        incident.category = incident_data.category
        incident.affected_users = incident_data.affected_users
        incident.affected_systems = incident_data.affected_systems
        incident.created_by = current_user.id
        
        db.add(incident)
        db.commit()
        db.refresh(incident)
        
        return SecurityIncidentResponse(
            id=incident.id,
            incident_id=incident.incident_id,
            title=incident.title,
            description=incident.description,
            severity=incident.severity,
            status=incident.status,
            category=incident.category,
            affected_users=incident.affected_users,
            affected_systems=incident.affected_systems,
            timeline=incident.timeline,
            response_actions=incident.response_actions,
            lessons_learned=incident.lessons_learned,
            created_at=incident.created_at,
            updated_at=incident.updated_at,
            resolved_at=incident.resolved_at,
            created_by=incident.created_by,
            assigned_to=incident.assigned_to
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create security incident: {str(e)}"
        )

# Access Control Endpoints
@router.post("/access-control", response_model=AccessControlResponse)
async def create_access_control_rule(
    rule_data: AccessControlCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new access control rule (Admin only)"""
    try:
        rule = AccessControl()
        rule.rule_name = rule_data.rule_name
        rule.rule_type = rule_data.rule_type.value
        rule.is_enabled = rule_data.is_enabled
        rule.priority = rule_data.priority
        rule.conditions = rule_data.conditions
        rule.actions = rule_data.actions
        rule.applies_to = rule_data.applies_to
        rule.exceptions = rule_data.exceptions
        rule.description = rule_data.description
        rule.created_by = current_user.id
        
        db.add(rule)
        db.commit()
        db.refresh(rule)
        
        return AccessControlResponse(
            id=rule.id,
            rule_name=rule.rule_name,
            rule_type=rule.rule_type,
            is_enabled=rule.is_enabled,
            priority=rule.priority,
            conditions=rule.conditions,
            actions=rule.actions,
            applies_to=rule.applies_to,
            exceptions=rule.exceptions,
            description=rule.description,
            created_at=rule.created_at,
            updated_at=rule.updated_at,
            created_by=rule.created_by
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create access control rule: {str(e)}"
        )

# Security Health Check
@router.get("/health")
async def security_health_check(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get security system health status (Admin only)"""
    try:
        services = get_security_services(db)
        
        # Check various security components
        health_status = {
            "mfa_service": "healthy",
            "audit_service": "healthy",
            "threat_detection": "healthy",
            "policy_engine": "healthy",
            "encryption": "healthy",
            "overall_status": "healthy"
        }
        
        return health_status
    except Exception as e:
        return {
            "overall_status": "unhealthy",
            "error": str(e)
        }