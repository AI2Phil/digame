"""
Enhanced JWT Service
JWT tokens with Platform Owner context and tenant information
"""

from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from ..models.user import User
from ..models.tenant import Tenant
from ..auth.config import auth_settings
from .platform_auth_service import PlatformAuthService

SECRET_KEY = auth_settings.secret_key
ALGORITHM = auth_settings.algorithm


class EnhancedJWTService:
    """Enhanced JWT service with Platform Owner and tenant context"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_access_token(self, user: User, tenant_context: Optional[Tenant] = None) -> str:
        """Create JWT token with platform owner and tenant context"""
        
        # Get platform permissions if platform owner
        platform_permissions = {}
        if user.is_platform_owner:
            auth_service = PlatformAuthService(self.db)
            platform_permissions = auth_service.get_platform_owner_permissions(user)
        
        # Get tenant-specific permissions
        tenant_permissions = {}
        if tenant_context:
            tenant_permissions = self.get_tenant_permissions(user, tenant_context)
        
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
            
            # Platform Owner Context
            "is_platform_owner": user.is_platform_owner,
            "platform_owner_level": user.platform_owner_level,
            "platform_permissions": platform_permissions,
            
            # Tenant Context
            "tenant_id": user.tenant_id,
            "tenant_context": tenant_context.id if tenant_context else None,
            "tenant_permissions": tenant_permissions,
            
            # Subscription Context
            "subscription_tier": user.subscription_tier,
            "subscription_status": user.subscription_status,
            "is_founding_member": user.is_founding_member,
            
            # Token Metadata
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=auth_settings.access_token_expire_minutes),
            "token_type": "access"
        }
        
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    def create_refresh_token(self, user: User) -> str:
        """Create refresh token for token renewal"""
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "token_type": "refresh",
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(days=auth_settings.refresh_token_expire_days)
        }
        
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    def decode_token(self, token: str) -> Dict[str, Any]:
        """Decode and validate JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except JWTError:
            raise ValueError("Invalid token")
    
    def get_tenant_permissions(self, user: User, tenant: Tenant) -> Dict[str, Any]:
        """Get tenant-specific permissions for user"""
        # This would integrate with existing RBAC system
        # For now, return basic permissions structure
        return {
            "can_read": True,
            "can_write": user.tenant_id == tenant.id,
            "can_admin": False  # Would check user roles in tenant
        }
    
    def validate_platform_access(self, token_payload: Dict[str, Any], required_permission: str) -> bool:
        """Validate platform owner access from token payload"""
        if not token_payload.get("is_platform_owner", False):
            return False
        
        platform_permissions = token_payload.get("platform_permissions", {})
        return platform_permissions.get(required_permission, False)
    
    def validate_tenant_access(self, token_payload: Dict[str, Any], tenant_id: int) -> bool:
        """Validate tenant access from token payload"""
        # Platform owners can access any tenant
        if token_payload.get("is_platform_owner", False):
            return True
        
        # Regular users must belong to the tenant
        return token_payload.get("tenant_id") == tenant_id
    
    def validate_subscription_tier(self, token_payload: Dict[str, Any], required_tier: str) -> bool:
        """Validate subscription tier access from token payload"""
        tier_hierarchy = {
            "free": 0,
            "individual_pro": 1,
            "team": 2,
            "enterprise": 3,
            "platform_owner": 999
        }
        
        # Platform owners bypass subscription requirements
        if token_payload.get("is_platform_owner", False):
            return True
        
        # Founding members get Individual Pro equivalent
        user_tier = token_payload.get("subscription_tier", "free")
        if token_payload.get("is_founding_member", False) and user_tier == "free":
            user_tier = "individual_pro"
        
        user_tier_level = tier_hierarchy.get(user_tier, 0)
        required_tier_level = tier_hierarchy.get(required_tier, 0)
        
        return user_tier_level >= required_tier_level