"""
Multi-tenancy service for enterprise features
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import uuid
import secrets
import hashlib

# Import from the actual models - the Pyrefly errors are just type checking issues
# and don't affect runtime performance
from ..models.tenant import Tenant, TenantSetting, TenantUser, TenantInvitation, TenantAuditLog
from ..models.user import User


class TenantService:
    """Service for managing multi-tenant operations"""

    def __init__(self, db: Session):
        self.db = db

    def create_tenant(
        self,
        name: str,
        admin_email: str,
        admin_name: str,
        subscription_tier: str = "basic",
        domain: Optional[str] = None
    ) -> Tenant:
        """Create a new tenant with admin user"""
        
        # Generate unique slug from name
        slug = self._generate_slug(name)
        
        # Create tenant
        tenant = Tenant()
        tenant.name = name
        tenant.slug = slug
        tenant.domain = domain
        tenant.admin_email = admin_email
        tenant.admin_name = admin_name
        tenant.subscription_tier = subscription_tier
        tenant.trial_ends_at = datetime.utcnow() + timedelta(days=30)  # 30-day trial
        tenant.settings = {
            "timezone": "UTC",
            "date_format": "YYYY-MM-DD",
            "currency": "USD",
            "language": "en"
        }
        tenant.features = {
            "analytics": True,
            "social_collaboration": True,
            "ai_insights": subscription_tier in ["professional", "enterprise"],
            "advanced_reporting": subscription_tier == "enterprise",
            "api_access": subscription_tier in ["professional", "enterprise"],
            "sso": subscription_tier == "enterprise",
            "audit_logs": subscription_tier == "enterprise",
            "writing_assistance": subscription_tier in ["professional", "enterprise"],
            "communication_style_analysis": subscription_tier in ["professional", "enterprise"],
            "meeting_insights": subscription_tier in ["professional", "enterprise"],
            "email_pattern_analysis": subscription_tier in ["professional", "enterprise"]
        }
        
        self.db.add(tenant)
        self.db.commit()
        self.db.refresh(tenant)
        
        # Log tenant creation
        self._log_audit_event(
            tenant.id,
            None,
            "tenant_created",
            "tenant",
            str(tenant.id),
            {"name": name, "subscription_tier": subscription_tier}
        )
        
        return tenant

    def get_tenant_by_id(self, tenant_id: int) -> Optional[Tenant]:
        """Get tenant by ID"""
        return self.db.query(Tenant).filter(Tenant.id == tenant_id).first()

    def get_tenant_by_slug(self, slug: str) -> Optional[Tenant]:
        """Get tenant by slug"""
        return self.db.query(Tenant).filter(Tenant.slug == slug).first()

    def get_tenant_by_domain(self, domain: str) -> Optional[Tenant]:
        """Get tenant by custom domain"""
        return self.db.query(Tenant).filter(Tenant.domain == domain).first()

    def update_tenant(self, tenant_id: int, updates: Dict[str, Any], user_id: Optional[int] = None) -> Optional[Tenant]:
        """Update tenant information"""
        tenant = self.get_tenant_by_id(tenant_id)
        if not tenant:
            return None

        # Track changes for audit log
        changes = {}

        # Handle subscription_tier change and its impact on features
        if "subscription_tier" in updates:
            new_tier = updates["subscription_tier"]
            if tenant.subscription_tier != new_tier:
                if not isinstance(tenant.features, dict): # ensure features is a dict
                    tenant.features = {}
                tenant.features["writing_assistance"] = new_tier in ["professional", "enterprise"]
                tenant.features["communication_style_analysis"] = new_tier in ["professional", "enterprise"]
                tenant.features["meeting_insights"] = new_tier in ["professional", "enterprise"]
                tenant.features["email_pattern_analysis"] = new_tier in ["professional", "enterprise"]
                # Potentially re-evaluate other features as well if the logic requires

        # Handle direct features update
        if "features" in updates:
            if isinstance(updates["features"], dict):
                current_tier = updates.get("subscription_tier", tenant.subscription_tier)
                if not isinstance(tenant.features, dict): # ensure features is a dict
                    tenant.features = {}

                # Start with existing features, apply updates, then set flags based on tier if not in direct update
                _features = tenant.features.copy()
                _features.update(updates["features"])

                if "writing_assistance" not in updates["features"]:
                    _features["writing_assistance"] = current_tier in ["professional", "enterprise"]
                if "communication_style_analysis" not in updates["features"]:
                    _features["communication_style_analysis"] = current_tier in ["professional", "enterprise"]
                if "meeting_insights" not in updates["features"]:
                    _features["meeting_insights"] = current_tier in ["professional", "enterprise"]
                if "email_pattern_analysis" not in updates["features"]:
                    _features["email_pattern_analysis"] = current_tier in ["professional", "enterprise"]

                updates["features"] = _features # Ensure updates["features"] has the correct flags

            elif isinstance(tenant.features, dict): # if updates["features"] is not a dict, but tenant.features is
                # This case might indicate an attempt to clear features or set to non-dict.
                # We'll ensure feature flags are based on tier.
                current_tier = updates.get("subscription_tier", tenant.subscription_tier)
                tenant.features["writing_assistance"] = current_tier in ["professional", "enterprise"]
                tenant.features["communication_style_analysis"] = current_tier in ["professional", "enterprise"]
                tenant.features["meeting_insights"] = current_tier in ["professional", "enterprise"]
                tenant.features["email_pattern_analysis"] = current_tier in ["professional", "enterprise"]

        elif "subscription_tier" in updates: # features not in updates, but tier changed
             if isinstance(tenant.features, dict):
                current_tier = updates.get("subscription_tier", tenant.subscription_tier)
                tenant.features["writing_assistance"] = current_tier in ["professional", "enterprise"]
                tenant.features["communication_style_analysis"] = current_tier in ["professional", "enterprise"]
                tenant.features["meeting_insights"] = current_tier in ["professional", "enterprise"]
                tenant.features["email_pattern_analysis"] = current_tier in ["professional", "enterprise"]


        for key, value in updates.items():
            if hasattr(tenant, key) and getattr(tenant, key) != value:
                changes[key] = {"old": getattr(tenant, key), "new": value}
                setattr(tenant, key, value)
            elif key == "features" and isinstance(tenant.features, dict) and isinstance(value, dict):
                # Special handling for features dictionary to capture deep changes if necessary
                # For now, simple setattr is used which replaces the whole dict.
                # If granular changes within features dict are needed for audit, this needs enhancement.
                if tenant.features != value:
                    changes[key] = {"old": tenant.features, "new": value}
                    setattr(tenant, key, value)


        tenant.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(tenant)

        # Log changes
        if changes:
            self._log_audit_event(
                tenant_id,
                user_id,
                "tenant_updated",
                "tenant",
                str(tenant_id),
                {"changes": changes}
            )

        return tenant

    def add_user_to_tenant(
        self,
        tenant_id: int,
        user_id: int,
        role: str = "member",
        permissions: Optional[Dict[str, bool]] = None
    ) -> Optional[TenantUser]:
        """Add user to tenant with specific role"""
        
        # Check if user is already in tenant
        existing = self.db.query(TenantUser).filter(
            and_(TenantUser.tenant_id == tenant_id, TenantUser.user_id == user_id)
        ).first()
        
        if existing:
            return existing

        tenant_user = TenantUser()
        tenant_user.tenant_id = tenant_id
        tenant_user.user_id = user_id
        tenant_user.role = role
        tenant_user.permissions = permissions or {}
        
        self.db.add(tenant_user)
        self.db.commit()
        self.db.refresh(tenant_user)

        # Log user addition
        self._log_audit_event(
            tenant_id,
            user_id,
            "user_added_to_tenant",
            "tenant_user",
            str(tenant_user.id),
            {"role": role, "permissions": permissions}
        )

        return tenant_user

    def invite_user_to_tenant(
        self,
        tenant_id: int,
        email: str,
        role: str,
        invited_by_user_id: int,
        expires_in_days: int = 7
    ) -> TenantInvitation:
        """Create invitation for user to join tenant"""
        
        invitation_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
        
        invitation = TenantInvitation(
            tenant_id=tenant_id,
            email=email,
            role=role,
            invited_by_user_id=invited_by_user_id,
            invitation_token=invitation_token,
            expires_at=expires_at
        )
        
        self.db.add(invitation)
        self.db.commit()
        self.db.refresh(invitation)

        # Log invitation
        self._log_audit_event(
            tenant_id,
            invited_by_user_id,
            "user_invited",
            "tenant_invitation",
            str(invitation.id),
            {"email": email, "role": role}
        )

        return invitation

    def accept_invitation(self, invitation_token: str, user_id: int) -> Optional[TenantUser]:
        """Accept tenant invitation"""
        
        invitation = self.db.query(TenantInvitation).filter(
            TenantInvitation.invitation_token == invitation_token
        ).first()
        
        if not invitation or invitation.is_expired or invitation.is_accepted:
            return None

        # Add user to tenant
        tenant_user = self.add_user_to_tenant(
            invitation.tenant_id,
            user_id,
            invitation.role
        )

        # Mark invitation as accepted
        invitation.accepted_at = datetime.utcnow()
        self.db.commit()

        # Log acceptance
        self._log_audit_event(
            invitation.tenant_id,
            user_id,
            "invitation_accepted",
            "tenant_invitation",
            str(invitation.id),
            {"email": invitation.email}
        )

        return tenant_user

    def get_user_tenants(self, user_id: int) -> List[Dict[str, Any]]:
        """Get all tenants for a user"""
        
        tenant_users = self.db.query(TenantUser).filter(
            and_(TenantUser.user_id == user_id, TenantUser.is_active == True)
        ).all()
        
        result = []
        for tenant_user in tenant_users:
            tenant = self.get_tenant_by_id(tenant_user.tenant_id)
            if tenant and tenant.is_active:
                result.append({
                    "tenant": tenant,
                    "role": tenant_user.role,
                    "permissions": tenant_user.permissions,
                    "joined_at": tenant_user.joined_at
                })
        
        return result

    def get_tenant_users(self, tenant_id: int) -> List[Dict[str, Any]]:
        """Get all users for a tenant"""
        
        tenant_users = self.db.query(TenantUser).filter(
            and_(TenantUser.tenant_id == tenant_id, TenantUser.is_active == True)
        ).all()
        
        result = []
        for tenant_user in tenant_users:
            user = self.db.query(User).filter(User.id.is_(tenant_user.user_id)).first()
            if user:
                result.append({
                    "user": user,
                    "role": tenant_user.role,
                    "permissions": tenant_user.permissions,
                    "joined_at": tenant_user.joined_at,
                    "last_active_at": tenant_user.last_active_at
                })
        
        return result

    def set_tenant_setting(
        self,
        tenant_id: int,
        category: str,
        key: str,
        value: Any,
        value_type: str = "string",
        is_encrypted: bool = False
    ) -> TenantSetting:
        """Set tenant-specific setting"""
        
        # Check if setting already exists
        existing = self.db.query(TenantSetting).filter(
            and_(
                TenantSetting.tenant_id == tenant_id,
                TenantSetting.category == category,
                TenantSetting.key == key
            )
        ).first()
        
        if existing:
            existing.value = str(value)
            existing.value_type = value_type
            existing.is_encrypted = is_encrypted
            existing.updated_at = datetime.utcnow()
            setting = existing
        else:
            setting = TenantSetting()
            setting.tenant_id = tenant_id
            setting.category = category
            setting.key = key
            setting.value = str(value)
            setting.value_type = value_type
            setting.is_encrypted = is_encrypted
            self.db.add(setting)
        
        self.db.commit()
        self.db.refresh(setting)
        
        return setting

    def get_tenant_setting(
        self,
        tenant_id: int,
        category: str,
        key: str,
        default: Any = None
    ) -> Any:
        """Get tenant-specific setting"""
        
        setting = self.db.query(TenantSetting).filter(
            and_(
                TenantSetting.tenant_id == tenant_id,
                TenantSetting.category == category,
                TenantSetting.key == key
            )
        ).first()
        
        if not setting:
            return default
        
        return setting.parsed_value

    def check_tenant_limits(self, tenant_id: int) -> Dict[str, Any]:
        """Check tenant usage against limits"""
        
        tenant = self.get_tenant_by_id(tenant_id)
        if not tenant:
            return {"error": "Tenant not found"}

        # Count current users
        user_count = self.db.query(TenantUser).filter(
            and_(TenantUser.tenant_id == tenant_id, TenantUser.is_active == True)
        ).count()

        # Calculate storage usage (placeholder - would integrate with actual storage)
        storage_used_gb = 0  # TODO: Implement actual storage calculation

        # Calculate API usage (placeholder - would integrate with actual API metrics)
        api_requests_today = 0  # TODO: Implement actual API usage tracking

        return {
            "users": {
                "current": user_count,
                "limit": tenant.max_users,
                "percentage": (user_count / tenant.max_users) * 100 if tenant.max_users > 0 else 0
            },
            "storage": {
                "used_gb": storage_used_gb,
                "limit_gb": tenant.storage_limit_gb,
                "percentage": (storage_used_gb / tenant.storage_limit_gb) * 100 if tenant.storage_limit_gb > 0 else 0
            },
            "api": {
                "requests_today": api_requests_today,
                "daily_limit": tenant.api_rate_limit,
                "percentage": (api_requests_today / tenant.api_rate_limit) * 100 if tenant.api_rate_limit > 0 else 0
            },
            "trial": {
                "is_trial": tenant.is_trial,
                "days_remaining": tenant.days_remaining_in_trial,
                "expires_at": tenant.trial_ends_at
            }
        }

    def _generate_slug(self, name: str) -> str:
        """Generate unique slug from tenant name"""
        base_slug = name.lower().replace(" ", "-").replace("_", "-")
        # Remove special characters
        import re
        base_slug = re.sub(r'[^a-z0-9-]', '', base_slug)
        
        # Ensure uniqueness
        counter = 1
        slug = base_slug
        while self.db.query(Tenant).filter(Tenant.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug

    def _log_audit_event(
        self,
        tenant_id: int,
        user_id: Optional[int],
        action: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log audit event for tenant"""
        
        audit_log = TenantAuditLog(
            tenant_id=tenant_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {}
        )
        audit_log.ip_address = ip_address or ""
        audit_log.user_agent = user_agent or ""
        
        self.db.add(audit_log)
        # Note: Commit is handled by the calling method


def get_tenant_service(db: Session) -> TenantService:
    """Get tenant service instance"""
    return TenantService(db)