"""
Platform Owner Authentication Service
Enhanced authentication with Platform Owner hierarchy and security
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException

from ..models.user import User
from ..models.platform_roles import PlatformRole, UserPlatformRole
from ..auth.config import auth_settings
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


class PlatformAuthService:
    """Enhanced authentication service for Platform Owner management"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def authenticate_platform_owner(self, email: str, password: str) -> Optional[User]:
        """Authenticate platform owner with enhanced security"""
        user = self.db.query(User).filter(
            User.email == email,
            User.is_platform_owner == True
        ).first()
        
        if not user:
            return None
            
        # Check if account is locked
        account_locked_until = getattr(user, 'account_locked_until', None)
        if account_locked_until and account_locked_until > datetime.utcnow():
            raise HTTPException(status_code=423, detail="Account temporarily locked")
            
        # Verify password
        if not verify_password(password, getattr(user, 'hashed_password', '')):
            setattr(user, 'failed_login_attempts', getattr(user, 'failed_login_attempts', 0) + 1)
            if getattr(user, 'failed_login_attempts', 0) >= 5:
                setattr(user, 'account_locked_until', datetime.utcnow() + timedelta(minutes=30))
            self.db.commit()
            return None
            
        # Reset failed attempts on successful login
        setattr(user, 'failed_login_attempts', 0)
        setattr(user, 'last_login', datetime.utcnow())
        setattr(user, 'account_locked_until', None)
        self.db.commit()
        
        return user
    
    def get_platform_owner_permissions(self, user: User) -> Dict[str, bool]:
        """Get comprehensive platform owner permissions"""
        if not getattr(user, 'is_platform_owner', False):
            return {}
            
        platform_roles = self.db.query(PlatformRole).join(UserPlatformRole).filter(
            UserPlatformRole.user_id == user.id
        ).all()
        
        permissions = {
            "can_create_tenants": False,
            "can_manage_all_tenants": False,
            "can_access_all_data": False,
            "can_modify_platform_settings": False,
            "can_view_platform_analytics": False,
            "can_manage_platform_users": False,
        }
        
        for role in platform_roles:
            for permission in permissions.keys():
                if getattr(role, permission, False):
                    permissions[permission] = True
                    
        return permissions
    
    def create_platform_owner(self, email: str, password: str, level: int = 3) -> User:
        """Create new platform owner (only by existing platform owner)"""
        hashed_password = get_password_hash(password)
        
        user = User(**{
            'email': email,
            'username': email.split('@')[0],
            'hashed_password': hashed_password,
            'is_platform_owner': True,
            'platform_owner_level': level,
            'tenant_id': None,  # Platform owners don't belong to tenants
            'subscription_tier': "platform_owner",
            'subscription_status': "active"
        })
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        # Assign platform role
        platform_role = self.db.query(PlatformRole).filter(
            PlatformRole.level == level
        ).first()
        
        if platform_role:
            user_role = UserPlatformRole(**{
                'user_id': getattr(user, 'id', 0),
                'platform_role_id': getattr(platform_role, 'id', 0),
                'assigned_by': getattr(user, 'id', 0)  # Self-assigned for first platform owner
            })
            self.db.add(user_role)
            self.db.commit()
            
        return user
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate regular user with enhanced security"""
        user = self.db.query(User).filter(User.email == email).first()
        
        if not user:
            return None
            
        # Check if account is locked
        account_locked_until = getattr(user, 'account_locked_until', None)
        if account_locked_until and account_locked_until > datetime.utcnow():
            raise HTTPException(status_code=423, detail="Account temporarily locked")
            
        # Check subscription status
        if getattr(user, 'subscription_status', None) == "suspended":
            raise HTTPException(status_code=402, detail="Account suspended")
            
        # Verify password
        if not verify_password(password, getattr(user, 'hashed_password', '')):
            setattr(user, 'failed_login_attempts', getattr(user, 'failed_login_attempts', 0) + 1)
            if getattr(user, 'failed_login_attempts', 0) >= 5:
                setattr(user, 'account_locked_until', datetime.utcnow() + timedelta(minutes=30))
            self.db.commit()
            return None
            
        # Reset failed attempts on successful login
        setattr(user, 'failed_login_attempts', 0)
        setattr(user, 'last_login', datetime.utcnow())
        setattr(user, 'account_locked_until', None)
        self.db.commit()
        
        return user
    
    def has_platform_permission(self, user: User, permission: str) -> bool:
        """Check if user has specific platform permission"""
        if not getattr(user, 'is_platform_owner', False):
            return False
            
        permissions = self.get_platform_owner_permissions(user)
        return permissions.get(permission, False)
    
    def get_user_subscription_tier_level(self, user: User) -> int:
        """Get numeric level for subscription tier"""
        tier_hierarchy = {
            "free": 0,
            "individual_pro": 1,
            "team": 2,
            "enterprise": 3,
            "platform_owner": 999
        }
        
        user_tier = getattr(user, 'subscription_tier', 'free')
        
        # Founding members get Individual Pro equivalent
        if getattr(user, 'is_founding_member', False) and user_tier == "free":
            user_tier = "individual_pro"
            
        return tier_hierarchy.get(str(user_tier), 0)
    
    def can_access_tenant(self, user: User, tenant_id: int) -> bool:
        """Check if user can access specific tenant"""
        # Platform owners can access any tenant
        if getattr(user, 'is_platform_owner', False):
            return True
            
        # Regular users can only access their own tenant
        return bool(user.tenant_id == tenant_id)