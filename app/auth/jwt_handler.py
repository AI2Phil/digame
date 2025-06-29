"""
Enhanced JWT Handler for Digame Platform
Provides comprehensive JWT token management with platform context
"""

import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import secrets
import hashlib
from passlib.context import CryptContext

from .config import auth_settings
from ..models.user import User
from ..models.tenant import Tenant
from ..database import get_db

security = HTTPBearer()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class TokenHandler:
    """Enhanced JWT token handler with platform context"""
    
    def __init__(self):
        self.secret_key = auth_settings.secret_key
        self.algorithm = auth_settings.algorithm
        self.access_token_expire_minutes = auth_settings.access_token_expire_minutes
        self.refresh_token_expire_days = auth_settings.refresh_token_expire_days
        self._blacklisted_tokens = set()  # In production, use Redis
    
    def create_access_token(
        self, 
        user: User, 
        tenant_context: Optional[Tenant] = None,
        additional_claims: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create JWT access token with comprehensive platform context"""
        
        # Base token data
        token_data: Dict[str, Any] = {
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes),
            "token_type": "access"
        }
        
        # Platform Owner Context
        if user.is_platform_owner:
            token_data.update({
                "is_platform_owner": True,
                "platform_owner_level": user.platform_owner_level,
                "platform_permissions": self._get_platform_permissions(user)
            })
        else:
            token_data["is_platform_owner"] = False
        
        # Tenant Context
        if user.tenant_id:
            token_data["tenant_id"] = user.tenant_id
            if tenant_context:
                token_data["tenant_context"] = {
                    "id": tenant_context.id,
                    "name": tenant_context.name,
                    "subscription_tier": tenant_context.subscription_tier,
                    "subscription_status": tenant_context.subscription_status
                }
        
        # Subscription Context
        token_data.update({
            "subscription_tier": user.subscription_tier,
            "subscription_status": user.subscription_status,
            "is_founding_member": user.is_founding_member
        })
        
        # Subscription Limits
        token_data["subscription_limits"] = self._get_subscription_limits(user, tenant_context)
        
        # Feature Flags
        token_data["feature_flags"] = self._get_feature_flags(user)
        
        # Session Metadata
        token_data["session_metadata"] = {
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "failed_attempts": user.failed_login_attempts,
            "account_locked": bool(user.account_locked_until and user.account_locked_until > datetime.utcnow())
        }
        
        # Add any additional claims
        if additional_claims:
            token_data.update(additional_claims)
        
        return jwt.encode(token_data, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, user: User) -> str:
        """Create refresh token"""
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(days=self.refresh_token_expire_days),
            "token_type": "refresh"
        }
        
        return jwt.encode(token_data, self.secret_key, algorithm=self.algorithm)
    
    def create_token_pair(
        self,
        user: User,
        tenant_context: Optional[Tenant] = None
    ) -> Dict[str, Any]:
        """Create both access and refresh tokens"""
        access_token = self.create_access_token(user, tenant_context)
        refresh_token = self.create_refresh_token(user)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": self.access_token_expire_minutes * 60
        }
    
    def verify_token(self, token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            # Check if token is blacklisted
            if self._is_token_blacklisted(token):
                return None
            
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Verify token type
            if payload.get("token_type") != token_type:
                return None
            
            # Check expiration
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
                return None
            
            return payload
            
        except jwt.InvalidTokenError:
            return None
    
    def blacklist_token(self, token: str) -> None:
        """Add token to blacklist"""
        # In production, store in Redis with expiration
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        self._blacklisted_tokens.add(token_hash)
    
    def _is_token_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted"""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        return token_hash in self._blacklisted_tokens
    
    def _get_platform_permissions(self, user: User) -> Dict[str, bool]:
        """Get platform permissions for Platform Owner"""
        if not user.is_platform_owner:
            return {}
        
        # Default permissions based on platform owner level
        permissions = {
            "can_create_tenants": False,
            "can_manage_all_tenants": False,
            "can_access_all_data": False,
            "can_modify_platform_settings": False,
            "can_view_platform_analytics": False,
            "can_manage_platform_users": False,
        }
        
        # Level-based permissions
        if user.platform_owner_level >= 1:  # Platform Admin
            permissions["can_view_platform_analytics"] = True
        
        if user.platform_owner_level >= 2:  # Platform Super Admin
            permissions.update({
                "can_manage_platform_users": True,
                "can_create_tenants": True,
                "can_manage_all_tenants": True,
                "can_access_all_data": True
            })
        
        if user.platform_owner_level >= 3:  # Platform Owner
            permissions["can_modify_platform_settings"] = True
        
        return permissions
    
    def _get_subscription_limits(self, user: User, tenant_context: Optional[Tenant] = None) -> Dict[str, Any]:
        """Get subscription limits for the user/tenant"""
        
        # Default limits by tier
        tier_limits: Dict[str, Dict[str, Any]] = {
            "free": {
                "max_users": 1,
                "max_storage_gb": 1,
                "max_api_calls_monthly": 1000,
                "features": ["basic_analytics", "basic_support"]
            },
            "individual_pro": {
                "max_users": 1,
                "max_storage_gb": 10,
                "max_api_calls_monthly": 10000,
                "features": ["advanced_analytics", "priority_support", "integrations"]
            },
            "team": {
                "max_users": 10,
                "max_storage_gb": 50,
                "max_api_calls_monthly": 50000,
                "features": ["team_collaboration", "advanced_analytics", "priority_support", "integrations", "custom_workflows"]
            },
            "enterprise": {
                "max_users": 100,
                "max_storage_gb": 500,
                "max_api_calls_monthly": 500000,
                "features": ["all_features", "dedicated_support", "custom_integrations", "sla"]
            },
            "platform_owner": {
                "max_users": -1,  # Unlimited
                "max_storage_gb": -1,
                "max_api_calls_monthly": -1,
                "features": ["all_features"]
            }
        }
        
        # Get user's effective tier
        effective_tier = str(user.subscription_tier)
        
        # Founding members get Individual Pro equivalent if on free tier
        if user.is_founding_member and effective_tier == "free":
            effective_tier = "individual_pro"
        
        # Use tenant limits if available and user is not platform owner
        if tenant_context and not user.is_platform_owner:
            tenant_tier = str(tenant_context.subscription_tier)
            tenant_tier_data = tier_limits[tenant_tier] if tenant_tier in tier_limits else tier_limits["free"]
            return {
                "max_users": tenant_context.max_users,
                "max_storage_gb": tenant_context.max_storage_gb,
                "max_api_calls_monthly": tenant_context.max_api_calls_monthly,
                "current_users": tenant_context.current_users,
                "current_storage_gb": tenant_context.current_storage_gb,
                "current_api_calls": tenant_context.current_api_calls_monthly,
                "features": tenant_tier_data.get("features", [])
            }
        
        return tier_limits[effective_tier] if effective_tier in tier_limits else tier_limits["free"]
    
    def _get_feature_flags(self, user: User) -> Dict[str, bool]:
        """Get feature flags for the user"""
        
        # Base feature flags
        flags = {
            "advanced_analytics": False,
            "team_collaboration": False,
            "custom_integrations": False,
            "ai_insights": False,
            "priority_support": False,
            "custom_workflows": False,
            "api_access": True,
            "export_data": False,
            "white_label": False
        }
        
        # Platform owners get all features
        if user.is_platform_owner:
            return {key: True for key in flags.keys()}
        
        # Feature flags based on subscription tier
        tier_features = {
            "free": ["api_access"],
            "individual_pro": ["api_access", "advanced_analytics", "priority_support", "export_data"],
            "team": ["api_access", "advanced_analytics", "team_collaboration", "priority_support", "export_data", "custom_workflows"],
            "enterprise": ["api_access", "advanced_analytics", "team_collaboration", "custom_integrations", "ai_insights", "priority_support", "export_data", "custom_workflows", "white_label"]
        }
        
        # Get user's effective tier
        effective_tier = str(user.subscription_tier)
        if user.is_founding_member and effective_tier == "free":
            effective_tier = "individual_pro"
        
        # Enable features based on tier
        enabled_features = tier_features[effective_tier] if effective_tier in tier_features else tier_features["free"]
        for feature in enabled_features:
            if feature in flags:
                flags[feature] = True
        
        return flags


class PasswordHandler:
    """Password handling utilities"""
    
    def __init__(self):
        self.pwd_context = pwd_context
    
    def hash_password(self, password: str) -> str:
        """Hash a password"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def generate_password_reset_token(self, email: str) -> str:
        """Generate a password reset token"""
        token_data = {
            "email": email,
            "exp": datetime.utcnow() + timedelta(hours=1),  # 1 hour expiry
            "token_type": "password_reset",
            "nonce": secrets.token_urlsafe(32)
        }
        
        return jwt.encode(token_data, auth_settings.secret_key, algorithm=auth_settings.algorithm)
    
    def verify_password_reset_token(self, token: str) -> Optional[str]:
        """Verify password reset token and return email"""
        try:
            payload = jwt.decode(token, auth_settings.secret_key, algorithms=[auth_settings.algorithm])
            
            if payload.get("token_type") != "password_reset":
                return None
            
            return payload.get("email")
            
        except jwt.InvalidTokenError:
            return None


def get_token_expiry_info(token: str) -> Optional[Dict[str, Any]]:
    """Get token expiry information without verification"""
    try:
        # Decode without verification to get expiry info
        payload = jwt.decode(token, options={"verify_signature": False})
        
        exp = payload.get("exp")
        if exp:
            exp_datetime = datetime.fromtimestamp(exp)
            time_remaining = exp_datetime - datetime.utcnow()
            
            return {
                "expires_at": exp_datetime.isoformat(),
                "time_remaining_seconds": max(0, int(time_remaining.total_seconds())),
                "is_expired": time_remaining.total_seconds() <= 0
            }
        
        return None
        
    except jwt.InvalidTokenError:
        return None


# Create singleton instances
token_handler = TokenHandler()
password_handler = PasswordHandler()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency to get the current authenticated user from JWT token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify the token
        payload = token_handler.verify_token(credentials.credentials, "access")
        if payload is None:
            raise credentials_exception
        
        # Extract user ID from token
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Get user from database
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise credentials_exception
        
        # Check if account is locked
        if user.account_locked_until and user.account_locked_until > datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account is temporarily locked"
            )
        
        return user
        
    except ValueError:
        raise credentials_exception
    except Exception:
        raise credentials_exception


async def get_current_platform_owner(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    FastAPI dependency to ensure current user is a platform owner
    """
    if not current_user.is_platform_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform owner access required"
        )
    return current_user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    FastAPI dependency to ensure current user is active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user