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
        
        # Generate provisioning URI for QR code
        provisioning_uri = totp.provisioning_uri(
            name=user.email,
            issuer_name="Digame Platform"
        )
        
        # Generate QR code
        qr_code_data = self._generate_qr_code(provisioning_uri)
        
        # Store MFA device (but don't activate until verified)
        mfa_device = MFADevice(
            user_id=user_id,
            device_type="totp",
            device_name=device_name,
            secret_key=secret,
            is_active=False,
            backup_codes=self._generate_backup_codes()
        )
        
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
        
        # Verify the token
        totp = pyotp.TOTP(mfa_device.secret_key)
        if not totp.verify(token, valid_window=1):
            return False
        
        # Activate the device
        mfa_device.is_active = True
        mfa_device.activated_at = datetime.utcnow()
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
        
        # Check if token was recently used (prevent replay attacks)
        if self._is_token_recently_used(mfa_device.id, token):
            return False
        
        # Verify the token
        totp = pyotp.TOTP(mfa_device.secret_key)
        if totp.verify(token, valid_window=1):
            # Record successful verification
            mfa_device.last_used = datetime.utcnow()
            mfa_device.use_count += 1
            self._record_token_use(mfa_device.id, token)
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
        
        return [
            {
                "id": device.id,
                "device_type": device.device_type,
                "device_name": device.device_name,
                "is_active": device.is_active,
                "created_at": device.created_at.isoformat(),
                "last_used": device.last_used.isoformat() if device.last_used else None,
                "use_count": device.use_count
            }
            for device in devices
        ]
    
    def disable_mfa_device(self, user_id: int, device_id: int) -> bool:
        """Disable an MFA device"""
        
        mfa_device = self.db.query(MFADevice).filter(
            MFADevice.id == device_id,
            MFADevice.user_id == user_id
        ).first()
        
        if not mfa_device:
            return False
        
        mfa_device.is_active = False
        mfa_device.disabled_at = datetime.utcnow()
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
        mfa_device.backup_codes = new_backup_codes
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
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
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
        
        if code in mfa_device.backup_codes:
            # Remove the used backup code
            mfa_device.backup_codes.remove(code)
            mfa_device.last_used = datetime.utcnow()
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
        
        event = SecurityEvent(
            user_id=user_id,
            event_type=event_type,
            details=details,
            ip_address=None,  # Will be set by middleware
            user_agent=None   # Will be set by middleware
        )
        
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
        
        restriction = IPRestriction(
            user_id=user_id,
            ip_address=ip_address,
            description=description,
            is_active=True
        )
        
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
            details={"ip_address": restriction.ip_address}
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
        
        # Check if current IP is in allowed list
        allowed_ips = [r.ip_address for r in restrictions]
        
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
        
        return [
            {
                "id": r.id,
                "ip_address": r.ip_address,
                "description": r.description,
                "is_active": r.is_active,
                "created_at": r.created_at.isoformat(),
                "last_used": r.last_used.isoformat() if r.last_used else None
            }
            for r in restrictions
        ]
    
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
        
        event = SecurityEvent(
            user_id=user_id,
            event_type=event_type,
            details=details
        )
        
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