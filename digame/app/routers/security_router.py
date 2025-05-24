"""
Enhanced security API router for the Digame platform
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

from ..database import get_db
from ..services.security_service import SecurityService, MFAService, ApiKeyService
from ..models.security import SecurityEvent, SecurityPolicy, UserSecurityProfile, SecurityAlert

router = APIRouter(prefix="/api/v1/security", tags=["security"])


# Pydantic models for request/response
class SecurityPolicyCreate(BaseModel):
    min_password_length: int = 8
    require_uppercase: bool = True
    require_lowercase: bool = True
    require_numbers: bool = True
    require_special_chars: bool = True
    password_expiry_days: int = 90
    password_history_count: int = 5
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 30
    auto_unlock: bool = True
    session_timeout_minutes: int = 60
    concurrent_sessions_limit: int = 3
    require_mfa: bool = False
    data_retention_days: int = 365
    enable_audit_logging: bool = True
    alert_on_suspicious_activity: bool = True
    risk_threshold: str = "medium"


class SecurityEventResponse(BaseModel):
    id: int
    event_type: str
    event_description: str
    risk_level: str
    ip_address: str = None
    success: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class SecurityAlertResponse(BaseModel):
    id: int
    alert_type: str
    title: str
    description: str
    severity: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class PasswordValidationRequest(BaseModel):
    password: str
    tenant_id: int


class MFASetupResponse(BaseModel):
    secret: str
    qr_code_url: str
    backup_codes: List[str] = []


class MFAVerificationRequest(BaseModel):
    token: str


class ApiKeyCreateRequest(BaseModel):
    name: str
    permissions: List[str] = []
    scopes: List[str] = []
    expires_in_days: Optional[int] = None


class ApiKeyResponse(BaseModel):
    id: int
    name: str
    key_prefix: str
    permissions: List[str]
    scopes: List[str]
    is_active: bool
    created_at: datetime
    last_used: datetime = None
    usage_count: int
    
    class Config:
        from_attributes = True


@router.post("/events/log")
async def log_security_event(
    tenant_id: int,
    event_type: str,
    user_id: Optional[int] = None,
    success: bool = True,
    error_message: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Log a security event for audit trail
    """
    security_service = SecurityService(db)
    
    # Extract request information
    ip_address = None
    user_agent = None
    endpoint = None
    method = None
    
    if request:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        endpoint = str(request.url.path)
        method = request.method
    
    try:
        event = security_service.log_security_event(
            tenant_id=tenant_id,
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            endpoint=endpoint,
            method=method,
            success=success,
            error_message=error_message,
            metadata=metadata
        )
        return {"message": "Security event logged", "event_id": event.id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to log security event: {str(e)}"
        )


@router.get("/events/{tenant_id}", response_model=List[SecurityEventResponse])
async def get_security_events(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    event_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get security events for a tenant
    """
    query = db.query(SecurityEvent).filter(SecurityEvent.tenant_id == tenant_id)
    
    if event_type:
        query = query.filter(SecurityEvent.event_type == event_type)
    
    if risk_level:
        query = query.filter(SecurityEvent.risk_level == risk_level)
    
    events = query.order_by(SecurityEvent.created_at.desc()).offset(skip).limit(limit).all()
    return events


@router.post("/policies/{tenant_id}")
async def create_security_policy(
    tenant_id: int,
    policy_data: SecurityPolicyCreate,
    db: Session = Depends(get_db)
):
    """
    Create or update security policy for a tenant
    """
    security_service = SecurityService(db)
    
    try:
        policy = security_service.create_security_policy(
            tenant_id, 
            policy_data.dict()
        )
        return {"message": "Security policy created/updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create security policy: {str(e)}"
        )


@router.get("/policies/{tenant_id}")
async def get_security_policy(
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """
    Get security policy for a tenant
    """
    security_service = SecurityService(db)
    policy = security_service.get_security_policy(tenant_id)
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Security policy not found"
        )
    
    return policy


@router.post("/password/validate")
async def validate_password(
    validation_request: PasswordValidationRequest,
    db: Session = Depends(get_db)
):
    """
    Validate password against tenant security policy
    """
    security_service = SecurityService(db)
    
    is_valid, errors = security_service.validate_password(
        validation_request.password,
        validation_request.tenant_id
    )
    
    return {
        "is_valid": is_valid,
        "errors": errors
    }


@router.get("/users/{user_id}/lockout-status")
async def check_account_lockout(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Check if user account is locked
    """
    security_service = SecurityService(db)
    is_locked, unlock_time = security_service.check_account_lockout(user_id)
    
    return {
        "is_locked": is_locked,
        "unlock_time": unlock_time
    }


@router.post("/users/{user_id}/unlock")
async def unlock_user_account(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Manually unlock user account
    """
    security_service = SecurityService(db)
    success = security_service.unlock_user_account(user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User account unlocked successfully"}


@router.get("/users/{user_id}/risk-assessment")
async def assess_user_risk(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Assess user risk score
    """
    security_service = SecurityService(db)
    risk_score = security_service.assess_user_risk(user_id)
    
    return {
        "user_id": user_id,
        "risk_score": risk_score,
        "risk_level": "high" if risk_score > 0.7 else "medium" if risk_score > 0.3 else "low"
    }


@router.get("/alerts/{tenant_id}", response_model=List[SecurityAlertResponse])
async def get_security_alerts(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get security alerts for a tenant
    """
    query = db.query(SecurityAlert).filter(SecurityAlert.tenant_id == tenant_id)
    
    if status_filter:
        query = query.filter(SecurityAlert.status == status_filter)
    
    if severity:
        query = query.filter(SecurityAlert.severity == severity)
    
    alerts = query.order_by(SecurityAlert.created_at.desc()).offset(skip).limit(limit).all()
    return alerts


# MFA Endpoints
@router.post("/mfa/{user_id}/setup", response_model=MFASetupResponse)
async def setup_mfa(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Setup MFA for a user
    """
    mfa_service = MFAService(db)
    
    try:
        secret, qr_code_url = mfa_service.setup_totp(user_id)
        return MFASetupResponse(
            secret=secret,
            qr_code_url=qr_code_url
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to setup MFA: {str(e)}"
        )


@router.post("/mfa/{user_id}/verify")
async def verify_mfa_token(
    user_id: int,
    verification_request: MFAVerificationRequest,
    db: Session = Depends(get_db)
):
    """
    Verify MFA token
    """
    mfa_service = MFAService(db)
    is_valid = mfa_service.verify_totp(user_id, verification_request.token)
    
    return {"is_valid": is_valid}


@router.post("/mfa/{user_id}/enable")
async def enable_mfa(
    user_id: int,
    verification_request: MFAVerificationRequest,
    db: Session = Depends(get_db)
):
    """
    Enable MFA after verifying setup token
    """
    mfa_service = MFAService(db)
    success = mfa_service.enable_mfa(user_id, verification_request.token)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    return {"message": "MFA enabled successfully"}


@router.post("/mfa/{user_id}/disable")
async def disable_mfa(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Disable MFA for a user
    """
    mfa_service = MFAService(db)
    success = mfa_service.disable_mfa(user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "MFA disabled successfully"}


# API Key Management Endpoints
@router.post("/api-keys/{tenant_id}")
async def create_api_key(
    tenant_id: int,
    user_id: int,
    key_request: ApiKeyCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new API key
    """
    api_key_service = ApiKeyService(db)
    
    try:
        key, api_key_record = api_key_service.create_api_key(
            tenant_id=tenant_id,
            user_id=user_id,
            name=key_request.name,
            permissions=key_request.permissions,
            scopes=key_request.scopes,
            expires_in_days=key_request.expires_in_days
        )
        
        return {
            "api_key": key,  # Only returned once
            "key_info": ApiKeyResponse.from_orm(api_key_record)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create API key: {str(e)}"
        )


@router.get("/api-keys/{tenant_id}", response_model=List[ApiKeyResponse])
async def get_api_keys(
    tenant_id: int,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get API keys for a tenant
    """
    from ..models.security import ApiKey
    
    query = db.query(ApiKey).filter(ApiKey.tenant_id == tenant_id)
    
    if user_id:
        query = query.filter(ApiKey.user_id == user_id)
    
    api_keys = query.all()
    return api_keys


@router.delete("/api-keys/{api_key_id}")
async def revoke_api_key(
    api_key_id: int,
    db: Session = Depends(get_db)
):
    """
    Revoke an API key
    """
    api_key_service = ApiKeyService(db)
    success = api_key_service.revoke_api_key(api_key_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    return {"message": "API key revoked successfully"}


@router.post("/api-keys/validate")
async def validate_api_key(
    api_key: str,
    db: Session = Depends(get_db)
):
    """
    Validate an API key
    """
    api_key_service = ApiKeyService(db)
    key_record = api_key_service.validate_api_key(api_key)
    
    if not key_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired API key"
        )
    
    return {
        "valid": True,
        "tenant_id": key_record.tenant_id,
        "user_id": key_record.user_id,
        "permissions": key_record.permissions,
        "scopes": key_record.scopes
    }


# Health check endpoint for security system
@router.get("/health")
async def security_health_check():
    """
    Health check for security system
    """
    return {
        "status": "healthy",
        "service": "enhanced_security",
        "timestamp": datetime.utcnow(),
        "features": [
            "security_event_logging",
            "security_policies",
            "account_lockout_protection",
            "multi_factor_authentication",
            "api_key_management",
            "risk_assessment",
            "security_alerts",
            "compliance_logging"
        ]
    }