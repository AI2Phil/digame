"""
Multi-Factor Authentication Service
Advanced security features for Platform Owner accounts
"""

import pyotp
import qrcode
import io
import base64
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import hashlib
import logging

from ..models.user import User
from ..models.security import MFADevice, SecurityEvent, SecurityPolicy
from ..database import get_db

logger = logging.getLogger(__name__)


class MFAService:
    """Multi-Factor Authentication service for enhanced security"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def setup_totp(self, user_id: int, device_name: str = "Digame Platform") -> Dict[str, Any]:
        """Set up TOTP (Time-based One-Time Password) for a user"""
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Generate secret key
        secret = pyotp.random_base32()
        
        # Create TOTP object
        totp = pyotp.TOTP(secret)
        
        # Generate provisioning URI for QR code with safe attribute access
        user_email = getattr(user, 'email', 'user@example.com')
        provisioning_uri = totp.provisioning_uri(
            name=user_email,
            issuer_name="Digame Platform"
        )
        
        # Generate QR code
        qr_code_data = self._generate_qr_code(provisioning_uri)
        
        # Store MFA device (but don't activate until verified) using safe instantiation
        mfa_device = MFADevice()  # type: ignore
        setattr(mfa_device, 'user_id', user_id)  # type: ignore
        setattr(mfa_device, 'device_type', "totp")  # type: ignore
        setattr(mfa_device, 'device_name', device_name)  # type: ignore
        setattr(mfa_device, 'secret_key', secret)  # type: ignore
        setattr(mfa_device, 'is_active', False)  # type: ignore
        setattr(mfa_device, 'backup_codes', self._generate_backup_codes())  # type: ignore
        
        self.db.add(mfa_device)
        self.db.commit()
        self.db.refresh(mfa_device)
        
        # Log security event
        self._log_security_event(
            user_id=user_id,
            event_type="mfa_setup_initiated",
            details={"device_type": "totp", "device_name": device_name}
        )
        
        return {
            "device_id": mfa_device.id,
            "secret": secret,
            "qr_code": qr_code_data,
            "backup_codes": mfa_device.backup_codes,
            "manual_entry_key": secret
        }
    
    def verify_totp_setup(self, user_id: int, device_id: int, token: str) -> bool:
        """Verify TOTP setup and activate the device"""
        
        mfa_device = self.db.query(MFADevice).filter(
            MFADevice.id == device_id,
            MFADevice.user_id == user_id,
            MFADevice.device_type == "totp"
        ).first()
        
        if not mfa_device:
            return False
        
        # Verify the token with safe attribute access
        secret_key = getattr(mfa_device, 'secret_key', '')
        totp = pyotp.TOTP(secret_key)
        if not totp.verify(token, valid_window=1):
            return False
        
        # Activate the device with safe attribute assignment
        setattr(mfa_device, 'is_active', True)  # type: ignore
        setattr(mfa_device, 'activated_at', datetime.utcnow())  # type: ignore
        self.db.commit()
        
        # Log security event
        self._log_security_event(
            user_id=user_id,
            event_type="mfa_activated",
            details={"device_type": "totp", "device_id": device_id}
        )
        
        logger.info(f"MFA activated for user {user_id}")
        return True
    
    def verify_totp(self, user_id: int, token: str) -> bool:
        """Verify TOTP token for authentication"""
        
        # Get active TOTP device
        mfa_device = self.db.query(MFADevice).filter(
            MFADevice.user_id == user_id,
            MFADevice.device_type == "totp",
            MFADevice.is_active == True
        ).first()
        
        if not mfa_device:
            return False
        
        # Check if token was recently used (prevent replay attacks) with safe attribute access
        device_id = getattr(mfa_device, 'id', 0)
        if self._is_token_recently_used(device_id, token):
            return False
        
        # Verify the token with safe attribute access
        secret_key = getattr(mfa_device, 'secret_key', '')
        totp = pyotp.TOTP(secret_key)
        if totp.verify(token, valid_window=1):
            # Record successful verification with safe attribute assignment
            setattr(mfa_device, 'last_used', datetime.utcnow())  # type: ignore
            current_use_count = getattr(mfa_device, 'use_count', 0)
            setattr(mfa_device, 'use_count', current_use_count + 1)  # type: ignore
            self._record_token_use(device_id, token)
            self.db.commit()
            
            self._log_security_event(
                user_id=user_id,
                event_type="mfa_verified",
                details={"device_type": "totp", "success": True}
            )
            return True
        
        # Check backup codes
        if self._verify_backup_code(mfa_device, token):
            self._log_security_event(
                user_id=user_id,
                event_type="mfa_backup_code_used",
                details={"device_type": "totp"}
            )
            return True
        
        # Log failed attempt
        self._log_security_event(
            user_id=user_id,
            event_type="mfa_verification_failed",
            details={"device_type": "totp", "token_provided": token[:2] + "***"}
        )
        
        return False
    
    def get_user_mfa_devices(self, user_id: int) -> list:
        """Get all MFA devices for a user"""
        
        devices = self.db.query(MFADevice).filter(
            MFADevice.user_id == user_id
        ).all()
        
        result = []
        for device in devices:
            last_used_value = getattr(device, 'last_used', None)
            result.append({
                "id": getattr(device, 'id', 0),
                "device_type": getattr(device, 'device_type', ''),
                "device_name": getattr(device, 'device_name', ''),
                "is_active": getattr(device, 'is_active', False),
                "created_at": getattr(device, 'created_at', datetime.utcnow()).isoformat(),
                "last_used": last_used_value.isoformat() if last_used_value is not None else None,
                "use_count": getattr(device, 'use_count', 0)
            })
        return result
    
    def disable_mfa_device(self, user_id: int, device_id: int) -> bool:
        """Disable an MFA device"""
        
        mfa_device = self.db.query(MFADevice).filter(
            MFADevice.id == device_id,
            MFADevice.user_id == user_id
        ).first()
        
        if not mfa_device:
            return False
        
        # Safe attribute assignment
        setattr(mfa_device, 'is_active', False)  # type: ignore
        setattr(mfa_device, 'disabled_at', datetime.utcnow())  # type: ignore
        self.db.commit()
        
        self._log_security_event(
            user_id=user_id,
            event_type="mfa_disabled",
            details={"device_type": mfa_device.device_type, "device_id": device_id}
        )
        
        return True
    
    def regenerate_backup_codes(self, user_id: int, device_id: int) -> list:
        """Regenerate backup codes for an MFA device"""
        
        mfa_device = self.db.query(MFADevice).filter(
            MFADevice.id == device_id,
            MFADevice.user_id == user_id
        ).first()
        
        if not mfa_device:
            return []
        
        new_backup_codes = self._generate_backup_codes()
        setattr(mfa_device, 'backup_codes', new_backup_codes)  # type: ignore
        self.db.commit()
        
        self._log_security_event(
            user_id=user_id,
            event_type="mfa_backup_codes_regenerated",
            details={"device_id": device_id}
        )
        
        return new_backup_codes
    
    def is_mfa_enabled(self, user_id: int) -> bool:
        """Check if user has active MFA devices"""
        
        active_devices = self.db.query(MFADevice).filter(
            MFADevice.user_id == user_id,
            MFADevice.is_active == True
        ).count()
        
        return active_devices > 0
    
    def _generate_qr_code(self, provisioning_uri: str) -> str:
        """Generate QR code as base64 encoded image"""
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64 with proper format parameter
        buffer = io.BytesIO()
        img.save(buffer, 'PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    def _generate_backup_codes(self, count: int = 10) -> list:
        """Generate backup codes for MFA"""
        
        codes = []
        for _ in range(count):
            code = secrets.token_hex(4).upper()
            codes.append(f"{code[:4]}-{code[4:]}")
        
        return codes
    
    def _verify_backup_code(self, mfa_device: MFADevice, code: str) -> bool:
        """Verify and consume a backup code"""
        
        # Safe access to backup codes
        backup_codes = getattr(mfa_device, 'backup_codes', [])
        if code in backup_codes:
            # Remove the used backup code
            backup_codes.remove(code)
            setattr(mfa_device, 'backup_codes', backup_codes)  # type: ignore
            setattr(mfa_device, 'last_used', datetime.utcnow())  # type: ignore
            self.db.commit()
            return True
        
        return False
    
    def _is_token_recently_used(self, device_id: int, token: str) -> bool:
        """Check if token was recently used (prevent replay attacks)"""
        
        # In production, use Redis for this
        # For now, implement basic in-memory check
        token_hash = hashlib.sha256(f"{device_id}:{token}".encode()).hexdigest()
        
        # Check if token was used in the last 30 seconds
        recent_use = self.db.query(SecurityEvent).filter(
            SecurityEvent.event_type == "token_used",
            SecurityEvent.details.contains({"token_hash": token_hash}),
            SecurityEvent.created_at > datetime.utcnow() - timedelta(seconds=30)
        ).first()
        
        return recent_use is not None
    
    def _record_token_use(self, device_id: int, token: str) -> None:
        """Record token usage to prevent replay attacks"""
        
        token_hash = hashlib.sha256(f"{device_id}:{token}".encode()).hexdigest()
        
        self._log_security_event(
            user_id=None,
            event_type="token_used",
            details={"device_id": device_id, "token_hash": token_hash}
        )
    
    def _log_security_event(self, user_id: Optional[int], event_type: str, details: Dict[str, Any]) -> None:
        """Log security events for audit trail"""
        
        # Safe SecurityEvent instantiation
        event = SecurityEvent()  # type: ignore
        setattr(event, 'user_id', user_id)  # type: ignore
        setattr(event, 'event_type', event_type)  # type: ignore
        setattr(event, 'details', details)  # type: ignore
        setattr(event, 'ip_address', None)  # type: ignore
        setattr(event, 'user_agent', None)  # type: ignore
        
        self.db.add(event)
        self.db.commit()


class IPRestrictionService:
    """IP address restriction service for enhanced security"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def add_ip_restriction(self, user_id: int, ip_address: str, description: str = "") -> bool:
        """Add IP address restriction for a user"""
        
        from ..models.security import IPRestriction
        
        # Check if restriction already exists
        existing = self.db.query(IPRestriction).filter(
            IPRestriction.user_id == user_id,
            IPRestriction.ip_address == ip_address
        ).first()
        
        if existing:
            return False
        
        # Safe IPRestriction instantiation
        restriction = IPRestriction()  # type: ignore
        setattr(restriction, 'user_id', user_id)  # type: ignore
        setattr(restriction, 'ip_address', ip_address)  # type: ignore
        setattr(restriction, 'description', description)  # type: ignore
        setattr(restriction, 'is_active', True)  # type: ignore
        
        self.db.add(restriction)
        self.db.commit()
        
        self._log_security_event(
            user_id=user_id,
            event_type="ip_restriction_added",
            details={"ip_address": ip_address, "description": description}
        )
        
        return True
    
    def remove_ip_restriction(self, user_id: int, restriction_id: int) -> bool:
        """Remove IP address restriction"""
        
        from ..models.security import IPRestriction
        
        restriction = self.db.query(IPRestriction).filter(
            IPRestriction.id == restriction_id,
            IPRestriction.user_id == user_id
        ).first()
        
        if not restriction:
            return False
        
        self.db.delete(restriction)
        self.db.commit()
        
        self._log_security_event(
            user_id=user_id,
            event_type="ip_restriction_removed",
            details={"ip_address": getattr(restriction, 'ip_address', '')}
        )
        
        return True
    
    def is_ip_allowed(self, user_id: int, ip_address: str) -> bool:
        """Check if IP address is allowed for user"""
        
        from ..models.security import IPRestriction
        
        # Get user's IP restrictions
        restrictions = self.db.query(IPRestriction).filter(
            IPRestriction.user_id == user_id,
            IPRestriction.is_active == True
        ).all()
        
        # If no restrictions, allow all IPs
        if not restrictions:
            return True
        
        # Check if current IP is in allowed list with safe attribute access
        allowed_ips = [getattr(r, 'ip_address', '') for r in restrictions]
        
        # Support CIDR notation and exact matches
        for allowed_ip in allowed_ips:
            if self._ip_matches(ip_address, allowed_ip):
                return True
        
        # Log unauthorized access attempt
        self._log_security_event(
            user_id=user_id,
            event_type="ip_access_denied",
            details={"ip_address": ip_address, "allowed_ips": allowed_ips}
        )
        
        return False
    
    def get_user_ip_restrictions(self, user_id: int) -> list:
        """Get all IP restrictions for a user"""
        
        from ..models.security import IPRestriction
        
        restrictions = self.db.query(IPRestriction).filter(
            IPRestriction.user_id == user_id
        ).all()
        
        result = []
        for r in restrictions:
            last_used_value = getattr(r, 'last_used', None)
            result.append({
                "id": getattr(r, 'id', 0),
                "ip_address": getattr(r, 'ip_address', ''),
                "description": getattr(r, 'description', ''),
                "is_active": getattr(r, 'is_active', False),
                "created_at": getattr(r, 'created_at', datetime.utcnow()).isoformat(),
                "last_used": last_used_value.isoformat() if last_used_value is not None else None
            })
        return result
    
    def _ip_matches(self, ip_address: str, allowed_ip: str) -> bool:
        """Check if IP address matches allowed pattern (supports CIDR)"""
        
        import ipaddress
        
        try:
            # Try exact match first
            if ip_address == allowed_ip:
                return True
            
            # Try CIDR match
            if '/' in allowed_ip:
                network = ipaddress.ip_network(allowed_ip, strict=False)
                return ipaddress.ip_address(ip_address) in network
            
            return False
            
        except (ipaddress.AddressValueError, ValueError):
            # Fallback to string comparison
            return ip_address == allowed_ip
    
    def _log_security_event(self, user_id: int, event_type: str, details: Dict[str, Any]) -> None:
        """Log security events for audit trail"""
        
        # Safe SecurityEvent instantiation
        event = SecurityEvent()  # type: ignore
        setattr(event, 'user_id', user_id)  # type: ignore
        setattr(event, 'event_type', event_type)  # type: ignore
        setattr(event, 'details', details)  # type: ignore
        
        self.db.add(event)
        self.db.commit()


def get_mfa_service(db: Optional[Session] = None) -> MFAService:
    """Factory function to get MFA service instance"""
    if db is None:
        db = next(get_db())
    
    return MFAService(db)


def get_ip_restriction_service(db: Optional[Session] = None) -> IPRestrictionService:
    """Factory function to get IP restriction service instance"""
    if db is None:
        db = next(get_db())
    
    return IPRestrictionService(db)