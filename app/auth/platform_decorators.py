"""
Platform Owner Authorization Decorators
Enhanced authorization with Platform Owner permissions
"""

from functools import wraps
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Optional, Callable, Any

from ..database import get_db
from ..models.user import User
from ..services.platform_auth_service import PlatformAuthService
from ..auth.auth_dependencies import get_current_user

security = HTTPBearer()


def require_platform_owner(permission: Optional[str] = None):
    """Decorator to require platform owner access with optional specific permission"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract current user from dependencies
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            if not current_user.is_platform_owner:
                raise HTTPException(status_code=403, detail="Platform owner access required")
            
            if permission:
                db = kwargs.get('db')
                if not db:
                    raise HTTPException(status_code=500, detail="Database session required")
                
                auth_service = PlatformAuthService(db)
                if not auth_service.has_platform_permission(current_user, permission):
                    raise HTTPException(
                        status_code=403, 
                        detail=f"Platform owner permission '{permission}' required"
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_tenant_access(allow_platform_owner: bool = True):
    """Decorator to require tenant access or platform owner override"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            tenant_id = kwargs.get('tenant_id')
            
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            # Platform owners can access any tenant
            if allow_platform_owner and current_user.is_platform_owner:
                return await func(*args, **kwargs)
            
            # Regular users must belong to the tenant
            if current_user.tenant_id != tenant_id:
                raise HTTPException(status_code=403, detail="Tenant access denied")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_subscription_tier(required_tier: str):
    """Decorator to require specific subscription tier"""
    tier_hierarchy = {
        "free": 0,
        "individual_pro": 1,
        "team": 2,
        "enterprise": 3,
        "platform_owner": 999
    }
    
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            # Platform owners bypass subscription requirements
            if current_user.is_platform_owner:
                return await func(*args, **kwargs)
            
            # Founding members get Individual Pro equivalent
            user_tier = current_user.subscription_tier
            if current_user.is_founding_member and user_tier == "free":
                user_tier = "individual_pro"
            
            # Ensure user_tier is a string for dict.get()
            user_tier_str = str(user_tier) if user_tier else "free"
            user_tier_level = tier_hierarchy.get(user_tier_str, 0)
            required_tier_level = tier_hierarchy.get(required_tier, 0)
            
            if user_tier_level < required_tier_level:
                raise HTTPException(
                    status_code=402, 
                    detail=f"Subscription tier '{required_tier}' or higher required"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


# Enhanced dependency functions
async def get_platform_owner(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure current user is a platform owner"""
    if not current_user.is_platform_owner:
        raise HTTPException(status_code=403, detail="Platform owner access required")
    return current_user


async def get_tenant_context(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tenant context with access validation"""
    # Import Tenant locally to avoid registry conflicts
    from ..models.tenant import Tenant
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Platform owners can access any tenant
    if current_user.is_platform_owner:
        return tenant
    
    # Regular users must belong to the tenant
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Tenant access denied")
    
    return tenant


class PlatformPermissionChecker:
    """Dependency class for checking platform permissions"""
    
    def __init__(self, required_permission: str):
        self.required_permission = required_permission
    
    async def __call__(
        self,
        current_user: User = Depends(get_platform_owner),
        db: Session = Depends(get_db)
    ) -> User:
        auth_service = PlatformAuthService(db)
        if not auth_service.has_platform_permission(current_user, self.required_permission):
            raise HTTPException(
                status_code=403,
                detail=f"Platform permission '{self.required_permission}' required"
            )
        return current_user


class SubscriptionTierChecker:
    """Dependency class for checking subscription tier requirements"""
    
    def __init__(self, required_tier: str):
        self.required_tier = required_tier
        self.tier_hierarchy = {
            "free": 0,
            "individual_pro": 1,
            "team": 2,
            "enterprise": 3,
            "platform_owner": 999
        }
    
    async def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        # Platform owners bypass subscription requirements
        if current_user.is_platform_owner:
            return current_user
        
        # Founding members get Individual Pro equivalent
        user_tier = current_user.subscription_tier
        if current_user.is_founding_member and user_tier == "free":
            user_tier = "individual_pro"
        
        # Ensure user_tier is a string for dict.get()
        user_tier_str = str(user_tier) if user_tier else "free"
        user_tier_level = self.tier_hierarchy.get(user_tier_str, 0)
        required_tier_level = self.tier_hierarchy.get(self.required_tier, 0)
        
        if user_tier_level < required_tier_level:
            raise HTTPException(
                status_code=402,
                detail=f"Subscription tier '{self.required_tier}' or higher required"
            )
        
        return current_user


# Convenience functions for common permission checks
def require_analytics_access():
    """Require platform analytics access"""
    return PlatformPermissionChecker("can_view_platform_analytics")


def require_tenant_management():
    """Require tenant management access"""
    return PlatformPermissionChecker("can_manage_all_tenants")


def require_user_management():
    """Require user management access"""
    return PlatformPermissionChecker("can_manage_platform_users")


def require_platform_settings():
    """Require platform settings access"""
    return PlatformPermissionChecker("can_modify_platform_settings")


def require_team_tier():
    """Require Team subscription tier or higher"""
    return SubscriptionTierChecker("team")


def require_enterprise_tier():
    """Require Enterprise subscription tier"""
    return SubscriptionTierChecker("enterprise")