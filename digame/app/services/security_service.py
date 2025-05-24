"""
Enhanced security service layer for the Digame platform
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import hashlib
import secrets
import re
import pyotp
import qrcode
import io
import base64
from passlib.context import CryptContext
import ipaddress

from ..models.security import (
    SecurityEvent, SecurityPolicy, UserSecurityProfile, 
    ApiKey, SecurityAlert, ComplianceLog
)
from ..models.tenant import User
from ..database import get_db

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SecurityService:
    """
    Core security service for managing security policies and events
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def log_security_event(
        self, 
        tenant_id: int, 
        event_type: str, 
        user_id: Optional[int] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        endpoint: Optional[str] = None,
        method: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> SecurityEvent:
        """
        Log a security event for audit trail
        """
        # Determine risk level based on event type
        risk_level = self._assess_event_risk(event_type, success, metadata)
        
        event = SecurityEvent(
            tenant_id=tenant_id,
            user_id=user_id,
            event_type=event_type,
            event_description=self._generate_event_description(event_type, success, metadata),
            risk_level=risk_level,
            ip_address=ip_address,
            user_agent=user_agent,
            endpoint=endpoint,
            method=method,
            success=success,
            error_message=error_message,
            metadata=metadata or {}
        )
        
        self.db.add(event)
        self.db.commit()
        
        # Check if this event should trigger an alert
        self._check_for_security_alerts(event)
        
        return event
    
    def get_security_policy(self, tenant_id: int) -> Optional[SecurityPolicy]:
        """
        Get security policy for a tenant
        """
        return self.db.query(SecurityPolicy).filter(
            SecurityPolicy.tenant_id == tenant_id
        ).first()
    
    def create_security_policy(self, tenant_id: int, policy_data: Dict[str, Any]) -> SecurityPolicy:
        """
        Create or update security policy for a tenant
        """
        existing_policy = self.get_security_policy(tenant_id)
        
        if existing_policy:
            # Update existing policy
            for key, value in policy_data.items():
                if hasattr(existing_policy, key):
                    setattr(existing_policy, key, value)
            existing_policy.updated_at = datetime.utcnow()
            self.db.commit()
            return existing_policy
        else:
            # Create new policy
            policy = SecurityPolicy(tenant_id=tenant_id, **policy_data)
            self.db.add(policy)
            self.db.commit()
            return policy
    
    def validate_password(self, password: str, tenant_id: int) -> Tuple[bool, List[str]]:
        """
        Validate password against tenant security policy
        """
        policy = self.get_security_policy(tenant_id)
        if not policy:
            # Default validation
            policy = SecurityPolicy()
        
        errors = []
        
        # Length check
        if len(password) < policy.min_password_length:
            errors.append(f"Password must be at least {policy.min_password_length} characters long")
        
        # Character requirements
        if policy.require_uppercase and not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        if policy.require_lowercase and not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        if policy.require_numbers and not re.search(r'\d', password):
            errors.append("Password must contain at least one number")
        
        if policy.require_special_chars and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character")
        
        return len(errors) == 0, errors
    
    def check_account_lockout(self, user_id: int) -> Tuple[bool, Optional[datetime]]:
        """
        Check if user account is locked and when it will be unlocked
        """
        profile = self.get_user_security_profile(user_id)
        if not profile:
            return False, None
        
        if profile.is_locked:
            if profile.locked_until and datetime.utcnow() > profile.locked_until:
                # Auto-unlock expired lockout
                self.unlock_user_account(user_id)
                return False, None
            return True, profile.locked_until
        
        return False, None
    
    def record_login_attempt(self, user_id: int, success: bool, ip_address: str) -> bool:
        """
        Record login attempt and handle account lockout
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        profile = self.get_user_security_profile(user_id)
        if not profile:
            profile = self.create_user_security_profile(user_id)
        
        policy = self.get_security_policy(user.tenant_id)
        if not policy:
            policy = SecurityPolicy()
        
        if success:
            # Reset failed attempts on successful login
            profile.failed_login_attempts = 0
            profile.last_login_ip = ip_address
            profile.is_locked = False
            profile.locked_until = None
            
            # Update user last login
            user.last_login = datetime.utcnow()
        else:
            # Increment failed attempts
            profile.failed_login_attempts += 1
            profile.last_failed_login = datetime.utcnow()
            
            # Check if account should be locked
            if profile.failed_login_attempts >= policy.max_login_attempts:
                profile.is_locked = True
                if policy.auto_unlock:
                    profile.locked_until = datetime.utcnow() + timedelta(
                        minutes=policy.lockout_duration_minutes
                    )
                
                # Log security event
                self.log_security_event(
                    tenant_id=user.tenant_id,
                    user_id=user_id,
                    event_type="account_locked",
                    ip_address=ip_address,
                    metadata={"failed_attempts": profile.failed_login_attempts}
                )
        
        self.db.commit()
        return True
    
    def get_user_security_profile(self, user_id: int) -> Optional[UserSecurityProfile]:
        """
        Get user security profile
        """
        return self.db.query(UserSecurityProfile).filter(
            UserSecurityProfile.user_id == user_id
        ).first()
    
    def create_user_security_profile(self, user_id: int) -> UserSecurityProfile:
        """
        Create user security profile
        """
        profile = UserSecurityProfile(user_id=user_id)
        self.db.add(profile)
        self.db.commit()
        return profile
    
    def unlock_user_account(self, user_id: int) -> bool:
        """
        Manually unlock user account
        """
        profile = self.get_user_security_profile(user_id)
        if not profile:
            return False
        
        profile.is_locked = False
        profile.locked_until = None
        profile.failed_login_attempts = 0
        self.db.commit()
        return True
    
    def assess_user_risk(self, user_id: int) -> float:
        """
        Assess user risk score based on various factors
        """
        profile = self.get_user_security_profile(user_id)
        if not profile:
            return 0.0
        
        risk_score = 0.0
        risk_factors = []
        
        # Failed login attempts
        if profile.failed_login_attempts > 0:
            risk_score += min(profile.failed_login_attempts * 0.1, 0.3)
            risk_factors.append("failed_login_attempts")
        
        # Account lockout history
        if profile.is_locked:
            risk_score += 0.4
            risk_factors.append("account_locked")
        
        # Password age
        if profile.password_last_changed:
            days_since_change = (datetime.utcnow() - profile.password_last_changed).days
            if days_since_change > 90:
                risk_score += 0.2
                risk_factors.append("old_password")
        
        # MFA status
        if not profile.mfa_enabled:
            risk_score += 0.1
            risk_factors.append("no_mfa")
        
        # Unusual activity
        if profile.unusual_activity_detected:
            risk_score += 0.3
            risk_factors.append("unusual_activity")
        
        # Update profile
        profile.risk_score = min(risk_score, 1.0)
        profile.risk_factors = risk_factors
        profile.last_risk_assessment = datetime.utcnow()
        self.db.commit()
        
        return profile.risk_score
    
    def _assess_event_risk(self, event_type: str, success: bool, metadata: Optional[Dict]) -> str:
        """
        Assess risk level of a security event
        """
        high_risk_events = [
            "account_locked", "suspicious_activity", "permission_denied",
            "export_data", "mfa_disabled"
        ]
        
        medium_risk_events = [
            "login_failure", "password_change", "api_access"
        ]
        
        if event_type in high_risk_events:
            return "high"
        elif event_type in medium_risk_events:
            return "medium"
        elif not success:
            return "medium"
        else:
            return "low"
    
    def _generate_event_description(self, event_type: str, success: bool, metadata: Optional[Dict]) -> str:
        """
        Generate human-readable event description
        """
        descriptions = {
            "login_success": "User successfully logged in",
            "login_failure": "Failed login attempt",
            "password_change": "User changed password",
            "permission_denied": "Access denied due to insufficient permissions",
            "data_access": "User accessed sensitive data",
            "suspicious_activity": "Suspicious activity detected",
            "account_locked": "User account locked due to failed login attempts",
            "mfa_enabled": "Multi-factor authentication enabled",
            "mfa_disabled": "Multi-factor authentication disabled",
            "api_access": "API access attempt",
            "export_data": "Data export operation"
        }
        
        base_description = descriptions.get(event_type, f"Security event: {event_type}")
        
        if not success:
            base_description = f"Failed: {base_description}"
        
        return base_description
    
    def _check_for_security_alerts(self, event: SecurityEvent):
        """
        Check if a security event should trigger an alert
        """
        # Check for multiple failed logins
        if event.event_type == "login_failure":
            recent_failures = self.db.query(SecurityEvent).filter(
                and_(
                    SecurityEvent.tenant_id == event.tenant_id,
                    SecurityEvent.user_id == event.user_id,
                    SecurityEvent.event_type == "login_failure",
                    SecurityEvent.created_at >= datetime.utcnow() - timedelta(minutes=15)
                )
            ).count()
            
            if recent_failures >= 3:
                self._create_security_alert(
                    tenant_id=event.tenant_id,
                    user_id=event.user_id,
                    alert_type="multiple_failed_logins",
                    title="Multiple Failed Login Attempts",
                    description=f"User has {recent_failures} failed login attempts in the last 15 minutes",
                    severity="high",
                    source_event_id=event.id
                )
    
    def _create_security_alert(
        self,
        tenant_id: int,
        alert_type: str,
        title: str,
        description: str,
        severity: str = "medium",
        user_id: Optional[int] = None,
        source_event_id: Optional[int] = None
    ) -> SecurityAlert:
        """
        Create a security alert
        """
        alert = SecurityAlert(
            tenant_id=tenant_id,
            user_id=user_id,
            alert_type=alert_type,
            title=title,
            description=description,
            severity=severity,
            source_event_id=source_event_id
        )
        
        self.db.add(alert)
        self.db.commit()
        return alert


class MFAService:
    """
    Multi-Factor Authentication service
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def setup_totp(self, user_id: int) -> Tuple[str, str]:
        """
        Setup TOTP (Time-based One-Time Password) for user
        Returns secret and QR code data URL
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        profile = self.db.query(UserSecurityProfile).filter(
            UserSecurityProfile.user_id == user_id
        ).first()
        
        if not profile:
            profile = UserSecurityProfile(user_id=user_id)
            self.db.add(profile)
        
        # Generate secret
        secret = pyotp.random_base32()
        
        # Create TOTP URI
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name="Digame Platform"
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        qr_code_data = base64.b64encode(img_buffer.getvalue()).decode()
        qr_code_url = f"data:image/png;base64,{qr_code_data}"
        
        # Store encrypted secret (in production, use proper encryption)
        profile.mfa_secret = secret  # Should be encrypted
        self.db.commit()
        
        return secret, qr_code_url
    
    def verify_totp(self, user_id: int, token: str) -> bool:
        """
        Verify TOTP token
        """
        profile = self.db.query(UserSecurityProfile).filter(
            UserSecurityProfile.user_id == user_id
        ).first()
        
        if not profile or not profile.mfa_secret:
            return False
        
        totp = pyotp.TOTP(profile.mfa_secret)
        return totp.verify(token, valid_window=1)
    
    def enable_mfa(self, user_id: int, verification_token: str) -> bool:
        """
        Enable MFA after verifying setup token
        """
        if not self.verify_totp(user_id, verification_token):
            return False
        
        profile = self.db.query(UserSecurityProfile).filter(
            UserSecurityProfile.user_id == user_id
        ).first()
        
        if profile:
            profile.mfa_enabled = True
            
            # Generate backup codes
            backup_codes = [secrets.token_hex(4) for _ in range(10)]
            profile.backup_codes = backup_codes  # Should be encrypted
            
            self.db.commit()
            return True
        
        return False
    
    def disable_mfa(self, user_id: int) -> bool:
        """
        Disable MFA for user
        """
        profile = self.db.query(UserSecurityProfile).filter(
            UserSecurityProfile.user_id == user_id
        ).first()
        
        if profile:
            profile.mfa_enabled = False
            profile.mfa_secret = None
            profile.backup_codes = []
            self.db.commit()
            return True
        
        return False


class ApiKeyService:
    """
    API Key management service
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_api_key(
        self,
        tenant_id: int,
        user_id: int,
        name: str,
        permissions: List[str] = None,
        scopes: List[str] = None,
        expires_in_days: Optional[int] = None
    ) -> Tuple[str, ApiKey]:
        """
        Create a new API key
        Returns the actual key and the stored record
        """
        # Generate API key
        key = f"dgm_{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        key_prefix = key[:8]
        
        # Set expiration
        expires_at = None
        if expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
        
        api_key = ApiKey(
            tenant_id=tenant_id,
            user_id=user_id,
            name=name,
            key_hash=key_hash,
            key_prefix=key_prefix,
            permissions=permissions or [],
            scopes=scopes or [],
            expires_at=expires_at
        )
        
        self.db.add(api_key)
        self.db.commit()
        
        return key, api_key
    
    def validate_api_key(self, key: str) -> Optional[ApiKey]:
        """
        Validate API key and return associated record
        """
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        
        api_key = self.db.query(ApiKey).filter(
            and_(
                ApiKey.key_hash == key_hash,
                ApiKey.is_active == True,
                or_(
                    ApiKey.expires_at.is_(None),
                    ApiKey.expires_at > datetime.utcnow()
                )
            )
        ).first()
        
        if api_key:
            # Update usage tracking
            api_key.last_used = datetime.utcnow()
            api_key.usage_count += 1
            self.db.commit()
        
        return api_key
    
    def revoke_api_key(self, api_key_id: int) -> bool:
        """
        Revoke an API key
        """
        api_key = self.db.query(ApiKey).filter(ApiKey.id == api_key_id).first()
        if api_key:
            api_key.is_active = False
            self.db.commit()
            return True
        return False