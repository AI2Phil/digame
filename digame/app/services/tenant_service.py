"""
Multi-tenant service layer for the Digame platform
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import secrets
import string

from ..models.tenant import Tenant, User, Role, UserRole, TenantSettings
from ..database import get_db
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TenantService:
    """
    Service for managing multi-tenant operations
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_tenant(self, tenant_data: Dict[str, Any]) -> Tenant:
        """
        Create a new tenant with default settings and admin user
        """
        # Create tenant
        tenant = Tenant(
            name=tenant_data["name"],
            domain=tenant_data["domain"],
            subdomain=tenant_data["subdomain"],
            subscription_tier=tenant_data.get("subscription_tier", "basic"),
            settings=tenant_data.get("settings", {}),
            features_enabled=self._get_default_features(tenant_data.get("subscription_tier", "basic"))
        )
        
        self.db.add(tenant)
        self.db.flush()  # Get the tenant ID
        
        # Create default tenant settings
        settings = TenantSettings(
            tenant_id=tenant.id,
            analytics_enabled=True,
            integrations_enabled=True,
            ai_features_enabled=True,
            workflow_automation_enabled=tenant_data.get("subscription_tier") in ["enterprise", "premium"],
            market_intelligence_enabled=tenant_data.get("subscription_tier") == "enterprise"
        )
        self.db.add(settings)
        
        # Create default roles
        self._create_default_roles(tenant.id)
        
        # Create admin user if provided
        if "admin_user" in tenant_data:
            self._create_admin_user(tenant.id, tenant_data["admin_user"])
        
        self.db.commit()
        return tenant
    
    def get_tenant_by_domain(self, domain: str) -> Optional[Tenant]:
        """
        Get tenant by domain name
        """
        return self.db.query(Tenant).filter(Tenant.domain == domain).first()
    
    def get_tenant_by_subdomain(self, subdomain: str) -> Optional[Tenant]:
        """
        Get tenant by subdomain
        """
        return self.db.query(Tenant).filter(Tenant.subdomain == subdomain).first()
    
    def update_tenant_settings(self, tenant_id: int, settings_data: Dict[str, Any]) -> TenantSettings:
        """
        Update tenant settings
        """
        settings = self.db.query(TenantSettings).filter(
            TenantSettings.tenant_id == tenant_id
        ).first()
        
        if not settings:
            settings = TenantSettings(tenant_id=tenant_id)
            self.db.add(settings)
        
        # Update settings
        for key, value in settings_data.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        
        settings.updated_at = datetime.utcnow()
        self.db.commit()
        return settings
    
    def get_tenant_users(self, tenant_id: int, skip: int = 0, limit: int = 100) -> List[User]:
        """
        Get all users for a tenant
        """
        return self.db.query(User).filter(
            User.tenant_id == tenant_id
        ).offset(skip).limit(limit).all()
    
    def create_user(self, tenant_id: int, user_data: Dict[str, Any]) -> User:
        """
        Create a new user within a tenant
        """
        # Hash password
        hashed_password = pwd_context.hash(user_data["password"])
        
        user = User(
            tenant_id=tenant_id,
            username=user_data["username"],
            email=user_data["email"],
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
            hashed_password=hashed_password,
            job_title=user_data.get("job_title"),
            department=user_data.get("department"),
            profile_data=user_data.get("profile_data", {}),
            preferences=user_data.get("preferences", {})
        )
        
        self.db.add(user)
        self.db.flush()
        
        # Assign default role
        default_role = self.db.query(Role).filter(
            and_(Role.tenant_id == tenant_id, Role.name == "User")
        ).first()
        
        if default_role:
            user_role = UserRole(
                user_id=user.id,
                role_id=default_role.id
            )
            self.db.add(user_role)
        
        self.db.commit()
        return user
    
    def assign_role(self, user_id: int, role_id: int, assigned_by: int) -> UserRole:
        """
        Assign a role to a user
        """
        # Check if assignment already exists
        existing = self.db.query(UserRole).filter(
            and_(UserRole.user_id == user_id, UserRole.role_id == role_id)
        ).first()
        
        if existing:
            return existing
        
        user_role = UserRole(
            user_id=user_id,
            role_id=role_id,
            assigned_by=assigned_by
        )
        
        self.db.add(user_role)
        self.db.commit()
        return user_role
    
    def get_user_permissions(self, user_id: int) -> List[str]:
        """
        Get all permissions for a user across all their roles
        """
        permissions = set()
        
        user_roles = self.db.query(UserRole).filter(UserRole.user_id == user_id).all()
        
        for user_role in user_roles:
            role = self.db.query(Role).filter(Role.id == user_role.role_id).first()
            if role and role.permissions:
                permissions.update(role.permissions)
        
        return list(permissions)
    
    def check_permission(self, user_id: int, permission: str) -> bool:
        """
        Check if a user has a specific permission
        """
        permissions = self.get_user_permissions(user_id)
        return permission in permissions
    
    def _get_default_features(self, subscription_tier: str) -> Dict[str, bool]:
        """
        Get default features based on subscription tier
        """
        features = {
            "basic": {
                "analytics": True,
                "integrations": False,
                "ai_features": False,
                "workflow_automation": False,
                "market_intelligence": False,
                "advanced_security": False
            },
            "premium": {
                "analytics": True,
                "integrations": True,
                "ai_features": True,
                "workflow_automation": True,
                "market_intelligence": False,
                "advanced_security": True
            },
            "enterprise": {
                "analytics": True,
                "integrations": True,
                "ai_features": True,
                "workflow_automation": True,
                "market_intelligence": True,
                "advanced_security": True
            }
        }
        
        return features.get(subscription_tier, features["basic"])
    
    def _create_default_roles(self, tenant_id: int):
        """
        Create default roles for a new tenant
        """
        default_roles = [
            {
                "name": "Admin",
                "description": "Full administrative access",
                "permissions": [
                    "tenant.manage",
                    "users.manage",
                    "roles.manage",
                    "analytics.view",
                    "integrations.manage",
                    "workflows.manage",
                    "settings.manage"
                ]
            },
            {
                "name": "Manager",
                "description": "Team management access",
                "permissions": [
                    "users.view",
                    "analytics.view",
                    "workflows.view",
                    "team.manage"
                ]
            },
            {
                "name": "User",
                "description": "Standard user access",
                "permissions": [
                    "profile.manage",
                    "analytics.view_own",
                    "workflows.view_own"
                ]
            }
        ]
        
        for role_data in default_roles:
            role = Role(
                tenant_id=tenant_id,
                name=role_data["name"],
                description=role_data["description"],
                permissions=role_data["permissions"],
                is_system_role=True
            )
            self.db.add(role)
    
    def _create_admin_user(self, tenant_id: int, admin_data: Dict[str, Any]):
        """
        Create the initial admin user for a tenant
        """
        # Create admin user
        admin_user = self.create_user(tenant_id, admin_data)
        
        # Assign admin role
        admin_role = self.db.query(Role).filter(
            and_(Role.tenant_id == tenant_id, Role.name == "Admin")
        ).first()
        
        if admin_role:
            self.assign_role(admin_user.id, admin_role.id, admin_user.id)
        
        return admin_user


class UserService:
    """
    Service for user management operations
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def authenticate_user(self, username: str, password: str, tenant_id: int) -> Optional[User]:
        """
        Authenticate a user within a specific tenant
        """
        user = self.db.query(User).filter(
            and_(
                User.username == username,
                User.tenant_id == tenant_id,
                User.is_active == True
            )
        ).first()
        
        if user and pwd_context.verify(password, user.hashed_password):
            # Update last login
            user.last_login = datetime.utcnow()
            self.db.commit()
            return user
        
        return None
    
    def update_user_profile(self, user_id: int, profile_data: Dict[str, Any]) -> User:
        """
        Update user profile information
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Update basic fields
        for field in ["first_name", "last_name", "job_title", "department"]:
            if field in profile_data:
                setattr(user, field, profile_data[field])
        
        # Update profile data
        if "profile_data" in profile_data:
            user.profile_data = {**user.profile_data, **profile_data["profile_data"]}
        
        # Update preferences
        if "preferences" in profile_data:
            user.preferences = {**user.preferences, **profile_data["preferences"]}
        
        user.updated_at = datetime.utcnow()
        self.db.commit()
        return user
    
    def change_password(self, user_id: int, old_password: str, new_password: str) -> bool:
        """
        Change user password
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        # Verify old password
        if not pwd_context.verify(old_password, user.hashed_password):
            return False
        
        # Update password
        user.hashed_password = pwd_context.hash(new_password)
        user.updated_at = datetime.utcnow()
        self.db.commit()
        return True
    
    def deactivate_user(self, user_id: int) -> bool:
        """
        Deactivate a user account
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        user.is_active = False
        user.updated_at = datetime.utcnow()
        self.db.commit()
        return True