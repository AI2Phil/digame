from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc, or_
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta, timezone
import secrets
import qrcode
import io
import base64
import pyotp
from cryptography.fernet import Fernet
import os
import hashlib
import ipaddress
import json
from collections import defaultdict

from app.models.security import (
    MFADevice, SecurityEvent, SecurityPolicy, ThreatDetection,
    AuditLog, IPRestriction, SessionToken
)
from app.schemas.security_schemas import (
    MFAConfigCreate, MFAConfigUpdate, MFASetupRequest, MFASetupResponse,
    SecurityAuditLogCreate, ThreatDetectionCreate, SecurityIncidentCreate,
    SecurityPolicyCreate, AccessControlCreate, EventType, Severity,
    ThreatLevel, ThreatStatus, IncidentStatus
)

class SecurityEncryptionService:
    """Service for encrypting/decrypting security-sensitive data"""
    
    def __init__(self):
        key = os.getenv('SECURITY_ENCRYPTION_KEY')
        if not key:
            key = Fernet.generate_key()
            print(f"Generated new security encryption key: {key.decode()}")
            print("Please set SECURITY_ENCRYPTION_KEY environment variable")
        else:
            key = key.encode()
        
        self.cipher_suite = Fernet(key)
    
    def encrypt(self, data: str) -> str:
        return self.cipher_suite.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        return self.cipher_suite.decrypt(encrypted_data.encode()).decode()

# Initialize encryption service
security_encryption = SecurityEncryptionService()

class MFAService:
    """Multi-Factor Authentication service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def setup_mfa(self, user_id: int, setup_request: MFASetupRequest) -> MFASetupResponse:
        """Set up MFA for a user"""
        # Check if MFA already exists
        existing_mfa = self.db.query(MFADevice).filter(MFADevice.user_id == user_id).first()
        
        if existing_mfa:
            # Update existing configuration
            mfa_config = existing_mfa
        else:
            # Create new configuration
            mfa_config = MFADevice()  # type: ignore
            setattr(mfa_config, 'user_id', user_id)  # type: ignore
            self.db.add(mfa_config)
        
        # Generate TOTP secret
        totp_secret = pyotp.random_base32()
        encrypted_secret = security_encryption.encrypt(totp_secret)
        
        # Generate backup codes
        backup_codes = [secrets.token_hex(4).upper() for _ in range(10)]
        encrypted_backup_codes = [security_encryption.encrypt(code) for code in backup_codes]
        
        # Update MFA configuration
        setattr(mfa_config, 'secret_key', encrypted_secret)  # type: ignore
        setattr(mfa_config, 'backup_codes', encrypted_backup_codes)  # type: ignore
        setattr(mfa_config, 'phone_number', getattr(setup_request, 'phone_number', None))  # type: ignore
        setattr(mfa_config, 'device_type', getattr(setup_request, 'method', 'totp').value if hasattr(getattr(setup_request, 'method', None), 'value') else str(getattr(setup_request, 'method', 'totp')))  # type: ignore
        setattr(mfa_config, 'device_name', f"{getattr(setup_request, 'method', 'totp')}_device")  # type: ignore
        setattr(mfa_config, 'is_active', True)  # type: ignore
        setattr(mfa_config, 'is_verified', True)  # type: ignore
        
        self.db.commit()
        
        # Generate QR code for TOTP
        qr_code_url = None
        if getattr(setup_request, 'method', None) == "totp":
            totp_uri = pyotp.totp.TOTP(totp_secret).provisioning_uri(
                name=f"user_{user_id}",
                issuer_name="Digame"
            )
            
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(totp_uri)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            qr_code_data = base64.b64encode(buffer.getvalue()).decode()
            qr_code_url = f"data:image/png;base64,{qr_code_data}"
        
        # Log the setup
        self.log_security_event(
            user_id=user_id,
            event_type=EventType.MFA_SETUP,
            description=f"MFA setup completed with method: {getattr(setup_request, 'method', 'unknown')}",
            severity=Severity.MEDIUM
        )
        
        return MFASetupResponse(
            qr_code_url=qr_code_url,
            backup_codes=backup_codes,
            secret_key=totp_secret if getattr(setup_request, 'method', None) == "totp" else None
        )
    
    def verify_mfa(self, user_id: int, code: str, method: Optional[str] = None) -> bool:
        """Verify MFA code"""
        mfa_config = self.db.query(MFADevice).filter(MFADevice.user_id == user_id).first()
        
        if not mfa_config or not getattr(mfa_config, 'is_active', False):
            return False
        
        # Try TOTP verification
        secret_key = getattr(mfa_config, 'secret_key', None)
        if secret_key and (not method or method == "totp"):
            try:
                decrypted_secret = security_encryption.decrypt(secret_key)
                totp = pyotp.TOTP(decrypted_secret)
                if totp.verify(code, valid_window=1):
                    setattr(mfa_config, 'last_used_at', datetime.now(timezone.utc))  # type: ignore
                    self.db.commit()
                    return True
            except Exception as e:
                print(f"TOTP verification failed: {e}")
        
        # Try backup code verification
        backup_codes = getattr(mfa_config, 'backup_codes', None)
        if backup_codes:
            try:
                decrypted_codes = [security_encryption.decrypt(enc_code) for enc_code in backup_codes]
                if code.upper() in decrypted_codes:
                    # Remove used backup code
                    used_code_encrypted = security_encryption.encrypt(code.upper())
                    backup_codes.remove(used_code_encrypted)
                    setattr(mfa_config, 'backup_codes', backup_codes)  # type: ignore
                    setattr(mfa_config, 'last_used_at', datetime.now(timezone.utc))  # type: ignore
                    self.db.commit()
                    return True
            except Exception as e:
                print(f"Backup code verification failed: {e}")
        
        return False
    
    def disable_mfa(self, user_id: int) -> bool:
        """Disable MFA for a user"""
        mfa_config = self.db.query(MFADevice).filter(MFADevice.user_id == user_id).first()
        
        if not mfa_config:
            return False
        
        setattr(mfa_config, 'is_active', False)  # type: ignore
        setattr(mfa_config, 'secret_key', None)  # type: ignore
        setattr(mfa_config, 'backup_codes', None)  # type: ignore
        self.db.commit()
        
        # Log the disable action
        self.log_security_event(
            user_id=user_id,
            event_type=EventType.MFA_DISABLE,
            description="MFA disabled by user",
            severity=Severity.MEDIUM
        )
        
        return True
    
    def get_mfa_config(self, user_id: int) -> Optional[MFADevice]:
        """Get MFA configuration for a user"""
        return self.db.query(MFADevice).filter(MFADevice.user_id == user_id).first()
    
    def log_security_event(self, user_id: Optional[int], event_type: EventType, 
                          description: str, severity: Severity, **kwargs):
        """Log a security event"""
        log_entry = SecurityEvent()  # type: ignore
        setattr(log_entry, 'user_id', user_id)  # type: ignore
        setattr(log_entry, 'event_type', event_type.value)  # type: ignore
        setattr(log_entry, 'event_category', "authentication")  # type: ignore
        setattr(log_entry, 'severity', severity.value)  # type: ignore
        setattr(log_entry, 'description', description)  # type: ignore
        setattr(log_entry, 'result', "success")  # type: ignore
        for key, value in kwargs.items():
            setattr(log_entry, key, value)
        self.db.add(log_entry)
        self.db.commit()

class ThreatDetectionService:
    """Advanced threat detection service"""
    
    def __init__(self, db: Session):
        self.db = db
        self.detection_rules = self._load_detection_rules()
    
    def _load_detection_rules(self) -> Dict[str, Dict]:
        """Load threat detection rules"""
        return {
            "brute_force": {
                "threshold": 5,
                "time_window": 300,  # 5 minutes
                "confidence": 85
            },
            "anomalous_access": {
                "threshold": 3,
                "time_window": 3600,  # 1 hour
                "confidence": 70
            },
            "suspicious_ip": {
                "known_bad_ips": [],  # Would be populated from threat intelligence
                "confidence": 95
            },
            "data_exfiltration": {
                "data_threshold": 1000000,  # 1MB
                "time_window": 300,
                "confidence": 80
            }
        }
    
    def detect_brute_force(self, ip_address: str, user_id: Optional[int] = None) -> Optional[ThreatDetection]:
        """Detect brute force attacks"""
        rule = self.detection_rules["brute_force"]
        time_threshold = datetime.now(timezone.utc) - timedelta(seconds=rule["time_window"])
        
        # Count failed login attempts from this IP
        failed_attempts = self.db.query(SecurityEvent).filter(
            and_(
                SecurityEvent.ip_address == ip_address,
                SecurityEvent.event_type == EventType.FAILED_LOGIN.value,
                SecurityEvent.created_at >= time_threshold
            )
        ).count()
        
        if failed_attempts >= rule["threshold"]:
            return self._create_threat_detection(
                detection_type="brute_force",
                threat_level=ThreatLevel.HIGH,
                source_ip=ip_address,
                target_user_id=user_id,
                detection_rule="brute_force_login",
                confidence_score=rule["confidence"],
                description=f"Brute force attack detected: {failed_attempts} failed login attempts from {ip_address}",
                evidence={
                    "failed_attempts": failed_attempts,
                    "time_window": rule["time_window"],
                    "threshold": rule["threshold"]
                }
            )
        
        return None
    
    def detect_anomalous_access(self, user_id: int, ip_address: str, user_agent: str) -> Optional[ThreatDetection]:
        """Detect anomalous access patterns"""
        # Check for unusual location (simplified - would use GeoIP in production)
        recent_ips = self.db.query(SecurityEvent.ip_address).filter(
            and_(
                SecurityEvent.user_id == user_id,
                SecurityEvent.event_type == EventType.LOGIN.value,
                SecurityEvent.created_at >= datetime.now(timezone.utc) - timedelta(days=30)
            )
        ).distinct().all()
        
        known_ips = [ip[0] for ip in recent_ips]
        
        if ip_address not in known_ips:
            return self._create_threat_detection(
                detection_type="anomalous_access",
                threat_level=ThreatLevel.MEDIUM,
                source_ip=ip_address,
                target_user_id=user_id,
                detection_rule="new_location_access",
                confidence_score=70,
                description=f"Access from new location detected for user {user_id}",
                evidence={
                    "new_ip": ip_address,
                    "known_ips": known_ips[:5],  # Limit for privacy
                    "user_agent": user_agent
                }
            )
        
        return None
    
    def _create_threat_detection(self, **kwargs) -> ThreatDetection:
        """Create a new threat detection record"""
        threat = ThreatDetection()  # type: ignore
        for key, value in kwargs.items():
            setattr(threat, key, value)  # type: ignore
        self.db.add(threat)
        self.db.commit()
        self.db.refresh(threat)
        return threat
    
    def resolve_threat(self, threat_id: int, resolved_by: int, mitigation_actions: Dict[str, Any]) -> bool:
        """Resolve a threat detection"""
        threat = self.db.query(ThreatDetection).filter(ThreatDetection.id == threat_id).first()
        
        if not threat:
            return False
        
        setattr(threat, 'status', ThreatStatus.RESOLVED.value)  # type: ignore
        setattr(threat, 'resolved_at', datetime.now(timezone.utc))  # type: ignore
        setattr(threat, 'resolved_by', resolved_by)  # type: ignore
        setattr(threat, 'mitigation_actions', mitigation_actions)  # type: ignore
        
        self.db.commit()
        return True

class SecurityAuditService:
    """Security audit and logging service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def log_event(self, log_data: SecurityAuditLogCreate) -> AuditLog:
        """Log a security event"""
        log_entry = AuditLog()  # type: ignore
        for key, value in log_data.model_dump().items():
            setattr(log_entry, key, value)  # type: ignore
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        return log_entry
    
    def get_audit_logs(self, filters: Dict[str, Any], skip: int = 0, limit: int = 100) -> List[AuditLog]:
        """Get audit logs with filters"""
        query = self.db.query(AuditLog)
        
        if filters.get("user_id"):
            query = query.filter(AuditLog.user_id == filters["user_id"])
        
        if filters.get("event_type"):
            query = query.filter(AuditLog.action == filters["event_type"])
        
        if filters.get("start_date"):
            query = query.filter(AuditLog.created_at >= filters["start_date"])
        
        if filters.get("end_date"):
            query = query.filter(AuditLog.created_at <= filters["end_date"])
        
        if filters.get("ip_address"):
            query = query.filter(AuditLog.ip_address == filters["ip_address"])
        
        return query.order_by(desc(AuditLog.created_at)).offset(skip).limit(limit).all()
    
    def get_security_metrics(self, days: int = 30) -> Dict[str, Any]:
        """Get security metrics for dashboard"""
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Total events
        total_events = self.db.query(AuditLog).filter(
            AuditLog.created_at >= start_date
        ).count()
        
        # Events by action type (simplified)
        action_counts = self.db.query(
            AuditLog.action,
            func.count(AuditLog.id)
        ).filter(
            AuditLog.created_at >= start_date
        ).group_by(AuditLog.action).all()
        
        # Failed login attempts (simplified)
        failed_logins = self.db.query(AuditLog).filter(
            and_(
                AuditLog.action.like('%failed%'),
                AuditLog.created_at >= start_date
            )
        ).count()
        
        # Successful logins (simplified)
        successful_logins = self.db.query(AuditLog).filter(
            and_(
                AuditLog.action.like('%login%'),
                AuditLog.created_at >= start_date
            )
        ).count()
        
        return {
            "total_events": total_events,
            "action_distribution": dict(action_counts),
            "failed_logins": failed_logins,
            "successful_logins": successful_logins,
            "login_success_rate": successful_logins / (successful_logins + failed_logins) if (successful_logins + failed_logins) > 0 else 0
        }

class SecurityPolicyService:
    """Security policy management service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_policy(self, policy_data: SecurityPolicyCreate, created_by: int) -> SecurityPolicy:
        """Create a new security policy"""
        policy = SecurityPolicy()  # type: ignore
        for key, value in policy_data.model_dump().items():
            setattr(policy, key, value)  # type: ignore
        setattr(policy, 'created_by', created_by)  # type: ignore
        self.db.add(policy)
        self.db.commit()
        self.db.refresh(policy)
        return policy
    
    def get_active_policies(self, policy_type: Optional[str] = None) -> List[SecurityPolicy]:
        """Get active security policies"""
        query = self.db.query(SecurityPolicy).filter(SecurityPolicy.is_active == True)
        
        if policy_type:
            query = query.filter(SecurityPolicy.policy_type == policy_type)
        
        return query.all()
    
    def evaluate_password_policy(self, password: str) -> Tuple[bool, List[str]]:
        """Evaluate password against security policies"""
        password_policies = self.get_active_policies("password")
        errors = []
        
        for policy in password_policies:
            config = policy.config
            
            if config.get("min_length") and len(password) < config["min_length"]:
                errors.append(f"Password must be at least {config['min_length']} characters long")
            
            if config.get("require_uppercase") and not any(c.isupper() for c in password):
                errors.append("Password must contain at least one uppercase letter")
            
            if config.get("require_lowercase") and not any(c.islower() for c in password):
                errors.append("Password must contain at least one lowercase letter")
            
            if config.get("require_numbers") and not any(c.isdigit() for c in password):
                errors.append("Password must contain at least one number")
            
            if config.get("require_special") and not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
                errors.append("Password must contain at least one special character")
        
        return len(errors) == 0, errors

class SecurityDashboardService:
    """Security dashboard and analytics service"""
    
    def __init__(self, db: Session):
        self.db = db
        self.mfa_service = MFAService(db)
        self.audit_service = SecurityAuditService(db)
        self.threat_service = ThreatDetectionService(db)
    
    def get_dashboard_summary(self) -> Dict[str, Any]:
        """Get security dashboard summary"""
        # MFA statistics
        total_users = self.db.query(func.count(MFADevice.user_id)).scalar() or 0
        mfa_enabled_users = self.db.query(func.count(MFADevice.user_id)).filter(
            MFADevice.is_active == True
        ).scalar() or 0
        
        mfa_adoption_rate = (mfa_enabled_users / total_users * 100) if total_users > 0 else 0
        
        # Threat statistics
        active_threats = self.db.query(func.count(ThreatDetection.id)).filter(
            ThreatDetection.status == ThreatStatus.ACTIVE.value
        ).scalar() or 0
        
        resolved_threats_today = self.db.query(func.count(ThreatDetection.id)).filter(
            and_(
                ThreatDetection.status == ThreatStatus.RESOLVED.value,
                ThreatDetection.resolved_at >= datetime.now(timezone.utc).date()
            )
        ).scalar() or 0
        
        # Incident statistics
        # Simplified incident tracking using threat detections
        open_incidents = self.db.query(func.count(ThreatDetection.id)).filter(
            ThreatDetection.status == "detected"
        ).scalar() or 0
        
        critical_incidents = self.db.query(func.count(ThreatDetection.id)).filter(
            and_(
                ThreatDetection.threat_level == "critical",
                ThreatDetection.status == "detected"
            )
        ).scalar() or 0
        
        # Security metrics
        metrics = self.audit_service.get_security_metrics()
        
        # Calculate security score (simplified)
        security_score = min(100, max(0, 
            int(mfa_adoption_rate * 0.3 + 
                metrics["login_success_rate"] * 100 * 0.4 + 
                (100 - min(active_threats * 10, 100)) * 0.3)
        ))
        
        return {
            "total_users_with_mfa": mfa_enabled_users,
            "mfa_adoption_rate": round(float(mfa_adoption_rate), 2),
            "active_threats": active_threats,
            "resolved_threats_today": resolved_threats_today,
            "open_incidents": open_incidents,
            "critical_incidents": critical_incidents,
            "failed_login_attempts_today": metrics["failed_logins"],
            "security_score": security_score,
            "recent_events": [],  # Would be populated with recent audit logs
            "threat_trends": {},  # Would be populated with threat trend data
            "policy_compliance": {}  # Would be populated with policy compliance data
        }

# Utility function to get service instances
def get_security_services(db: Session) -> Dict[str, Any]:
    """Get all security service instances"""
    return {
        "mfa": MFAService(db),
        "threat_detection": ThreatDetectionService(db),
        "audit": SecurityAuditService(db),
        "policy": SecurityPolicyService(db),
        "dashboard": SecurityDashboardService(db)
    }