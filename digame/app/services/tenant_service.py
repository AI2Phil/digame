"""
Multi-tenant service layer for the Digame platform
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone # Added timezone
import secrets
import json # For TenantSettings value handling

# Updated model imports
from ..models.tenant import Tenant, User, Role, UserRole, TenantSettings, TenantInvitation, TenantAuditLog
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
        """
        Create and save a TenantAuditLog entry.
        """
        audit_log_entry = TenantAuditLog(
            tenant_id=tenant_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.add(audit_log_entry)
        self.db.flush()
        return audit_log_entry

    def create_tenant(self, tenant_data: Dict[str, Any], current_user_id: Optional[int] = None, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> Tenant:
        required_fields = ["name", "slug", "admin_email", "admin_name"]
        for field in required_fields:
            if field not in tenant_data or not tenant_data[field]:
                raise ValueError(f"Missing required field: {field}")

        tenant = Tenant(
            name=tenant_data["name"],
            slug=tenant_data["slug"],
            admin_email=tenant_data["admin_email"],
            admin_name=tenant_data["admin_name"],
            domain=tenant_data.get("domain"),
            subdomain=tenant_data.get("subdomain"),
            tenant_uuid=secrets.token_hex(16),
            subscription_tier=tenant_data.get("subscription_tier", "basic"),
            settings=tenant_data.get("settings", {}),
            features=self._get_enhanced_features(tenant_data.get("subscription_tier", "basic")),
            max_users=tenant_data.get("max_users", 10),
            storage_limit_gb=tenant_data.get("storage_limit_gb", 5),
            api_rate_limit=tenant_data.get("api_rate_limit", 1000),
            is_trial=tenant_data.get("is_trial", True),
            trial_ends_at=tenant_data.get("trial_ends_at", datetime.now(timezone.utc) + timedelta(days=30)) if tenant_data.get("is_trial", True) else None,
            branding=tenant_data.get("branding", {}),
            phone=tenant_data.get("phone"),
            address=tenant_data.get("address")
        )
        
        self.db.add(tenant)
        self.db.flush()
        
        self._create_default_roles(tenant.id)
        
        if "admin_user_password" in tenant_data and tenant_data["admin_user_password"]:
            admin_user_data = {
                "username": tenant_data["admin_email"],
                "email": tenant_data["admin_email"],
                "password": tenant_data["admin_user_password"],
                "first_name": tenant_data["admin_name"].split(" ")[0] if tenant_data["admin_name"] else "Admin",
                "last_name": " ".join(tenant_data["admin_name"].split(" ")[1:]) if " " in tenant_data["admin_name"] else "",
            }
            # Ensure _create_admin_user uses the tenant_id correctly
            created_admin_user = self._create_admin_user(tenant.id, admin_user_data, ip_address=ip_address, user_agent=user_agent)
            admin_user_id_for_log = created_admin_user.id
        else:
            admin_user_id_for_log = None # No admin user created here, maybe an external process

        self.db.commit()

        self._log_audit_event(
            tenant_id=tenant.id,
            user_id=current_user_id if current_user_id else admin_user_id_for_log,
            action="tenant_created",
            resource_type="tenant",
            resource_id=str(tenant.id),
            details={"name": tenant.name, "slug": tenant.slug, "subscription_tier": tenant.subscription_tier},
            ip_address=ip_address,
            user_agent=user_agent
        )
        return tenant

    def get_tenant_by_id(self, tenant_id: int) -> Optional[Tenant]:
        return self.db.query(Tenant).filter(Tenant.id == tenant_id).first()

    def get_tenant_by_slug(self, slug: str) -> Optional[Tenant]:
        return self.db.query(Tenant).filter(Tenant.slug == slug).first()
    
    def get_tenant_by_domain(self, domain: str) -> Optional[Tenant]:
        return self.db.query(Tenant).filter(Tenant.domain == domain).first()
    
    def get_tenant_by_subdomain(self, subdomain: str) -> Optional[Tenant]:
        return self.db.query(Tenant).filter(Tenant.subdomain == subdomain).first()

    def update_tenant(self, tenant_id: int, updates: Dict[str, Any], current_user_id: Optional[int] = None, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> Optional[Tenant]:
        tenant = self.get_tenant_by_id(tenant_id)
        if not tenant:
            return None

        original_data = {}
        changes = {}

        allowed_fields = [
            "name", "slug", "domain", "subdomain", "subscription_tier",
            "settings", "features", "branding", "is_active", "is_trial", "trial_ends_at",
            "max_users", "storage_limit_gb", "api_rate_limit",
            "admin_email", "admin_name", "phone", "address"
        ]

        if "subscription_tier" in updates and tenant.subscription_tier != updates["subscription_tier"]:
            new_tier = updates["subscription_tier"]
            original_data["subscription_tier"] = tenant.subscription_tier
            changes["subscription_tier"] = new_tier
            tenant.subscription_tier = new_tier
            current_features = tenant.features if isinstance(tenant.features, dict) else {}
            tier_specific_features = self._get_enhanced_features(new_tier)
            current_features.update(tier_specific_features)
            tenant.features = current_features

        for key, value in updates.items():
            if key in allowed_fields and hasattr(tenant, key): # Ensure key is an attribute of Tenant
                old_value = getattr(tenant, key)
                if old_value != value:
                    original_data[key] = old_value
                    changes[key] = value
                    setattr(tenant, key, value)

        if changes:
            tenant.updated_at = datetime.now(timezone.utc)
            # self.db.add(tenant) # Not strictly necessary if already persistent and tracked
            self.db.commit()
            self.db.refresh(tenant)
            self._log_audit_event(
                tenant_id=tenant.id,
                user_id=current_user_id,
                action="tenant_updated",
                resource_type="tenant",
                resource_id=str(tenant.id),
                details={"changes": changes, "original_data": original_data},
                ip_address=ip_address,
                user_agent=user_agent
            )
        return tenant

    def get_tenant_setting(self, tenant_id: int, category: str, key: str) -> Optional[TenantSettings]:
        return self.db.query(TenantSettings).filter(
            TenantSettings.tenant_id == tenant_id,
            TenantSettings.category == category,
            TenantSettings.key == key
        ).first()

    def get_tenant_settings_by_category(self, tenant_id: int, category: str) -> List[TenantSettings]:
        return self.db.query(TenantSettings).filter(
            TenantSettings.tenant_id == tenant_id,
            TenantSettings.category == category
        ).all()

    def set_tenant_setting(self, tenant_id: int, category: str, key: str, value: Any, value_type: str,
                           is_encrypted: bool = False, current_user_id: Optional[int] = None,
                           ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> TenantSettings:
        setting_value = ""
        if value_type == "json":
            setting_value = json.dumps(value)
        elif value_type == "integer":
            setting_value = str(int(value))
        elif value_type == "boolean":
            setting_value = "true" if bool(value) else "false"
        else: # string or text
            setting_value = str(value)

        setting = self.get_tenant_setting(tenant_id, category, key)
        action = "tenant_setting_updated"
        if not setting:
            action = "tenant_setting_created"
            setting = TenantSettings(
                tenant_id=tenant_id,
                category=category,
                key=key
            )
            self.db.add(setting)

        setting.value = setting_value
        setting.value_type = value_type
        setting.is_encrypted = is_encrypted
        setting.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(setting)

        self._log_audit_event(
            tenant_id=tenant_id, user_id=current_user_id, action=action,
            resource_type="tenant_setting", resource_id=f"{category}:{key}",
            details={"value_type": value_type, "is_encrypted": is_encrypted}, # Not logging value itself for security
            ip_address=ip_address, user_agent=user_agent
        )
        return setting

    def delete_tenant_setting(self, tenant_id: int, category: str, key: str,
                              current_user_id: Optional[int] = None,
                              ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> bool:
        setting = self.get_tenant_setting(tenant_id, category, key)
        if setting:
            self.db.delete(setting)
            self.db.commit()
            self._log_audit_event(
                tenant_id=tenant_id, user_id=current_user_id, action="tenant_setting_deleted",
                resource_type="tenant_setting", resource_id=f"{category}:{key}",
                ip_address=ip_address, user_agent=user_agent
            )
            return True
        return False

    def create_invitation(self, tenant_id: int, invited_by_user_id: int, email: str, role: str,
                          ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> TenantInvitation:
        inviter = self.db.query(User).filter(User.id == invited_by_user_id, User.tenant_id == tenant_id).first()
        if not inviter:
            raise ValueError("Inviter does not belong to the tenant or does not exist.")

        existing_invitation = self.db.query(TenantInvitation).filter(
            TenantInvitation.tenant_id == tenant_id,
            TenantInvitation.email == email,
            TenantInvitation.expires_at > datetime.now(timezone.utc),
            TenantInvitation.accepted_at == None
        ).first()
        if existing_invitation:
            raise ValueError(f"Active invitation already exists for {email}")

        invitation = TenantInvitation(
            tenant_id=tenant_id,
            invited_by_user_id=invited_by_user_id,
            email=email,
            role=role,
            invitation_token=secrets.token_urlsafe(32),
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        self.db.add(invitation)
        self.db.commit()
        self.db.refresh(invitation)

        self._log_audit_event(
            tenant_id=tenant_id, user_id=invited_by_user_id, action="tenant_invitation_created",
            resource_type="tenant_invitation", resource_id=str(invitation.id),
            details={"email": email, "role": role, "expires_at": invitation.expires_at.isoformat()},
            ip_address=ip_address, user_agent=user_agent
        )
        return invitation

    def accept_invitation(self, token: str, accepting_user_id: int,
                          ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> Optional[TenantInvitation]:
        invitation = self.get_invitation_by_token(token)
        if not invitation:
            raise ValueError("Invalid or non-existent invitation token.")
        if invitation.expires_at < datetime.now(timezone.utc):
            raise ValueError("Invitation has expired.")
        if invitation.accepted_at is not None:
            raise ValueError("Invitation has already been accepted.")

        invitation.accepted_at = datetime.now(timezone.utc)

        # User provisioning/linking logic would go here.
        # For example, if user identified by 'accepting_user_id' needs to be formally associated
        # with 'invitation.tenant_id' and assigned 'invitation.role'.
        # This might involve creating a UserRole entry.
        user_to_associate = self.db.query(User).filter(User.id == accepting_user_id).first()
        if user_to_associate:
            if user_to_associate.tenant_id != invitation.tenant_id:
                # This logic depends on whether a user can switch tenants or belong to multiple.
                # For now, we'll assume the user might be new to this tenant or role.
                pass # Potentially update user.tenant_id or add to a TenantUser mapping table.

            # Assign the role from invitation
            role_to_assign = self.db.query(Role).filter(Role.tenant_id == invitation.tenant_id, Role.name == invitation.role).first()
            if role_to_assign:
                existing_user_role = self.db.query(UserRole).filter(UserRole.user_id == accepting_user_id, UserRole.role_id == role_to_assign.id).first()
                if not existing_user_role:
                    new_user_role = UserRole(user_id=accepting_user_id, role_id=role_to_assign.id, assigned_by=invitation.invited_by_user_id)
                    self.db.add(new_user_role)
        
        self.db.commit()
        self.db.refresh(invitation)

        self._log_audit_event(
            tenant_id=invitation.tenant_id, user_id=accepting_user_id, action="tenant_invitation_accepted",
            resource_type="tenant_invitation", resource_id=str(invitation.id),
            details={"email": invitation.email, "accepted_by_user_id": accepting_user_id},
            ip_address=ip_address, user_agent=user_agent
        )
        return invitation

    def get_invitation_by_token(self, token: str) -> Optional[TenantInvitation]:
        return self.db.query(TenantInvitation).filter(TenantInvitation.invitation_token == token).first()

    def list_invitations(self, tenant_id: int, status: Optional[str] = None) -> List[TenantInvitation]:
        query = self.db.query(TenantInvitation).filter(TenantInvitation.tenant_id == tenant_id)
        now = datetime.now(timezone.utc)
        if status == "pending":
            query = query.filter(TenantInvitation.accepted_at == None, TenantInvitation.expires_at > now)
        elif status == "accepted":
            query = query.filter(TenantInvitation.accepted_at != None)
        elif status == "expired":
            query = query.filter(TenantInvitation.expires_at <= now, TenantInvitation.accepted_at == None)
        return query.order_by(TenantInvitation.created_at.desc()).all()

    def list_audit_logs(self, tenant_id: int, user_id: Optional[int] = None,
                        action: Optional[str] = None, limit: int = 100, offset: int = 0) -> List[TenantAuditLog]:
        query = self.db.query(TenantAuditLog).filter(TenantAuditLog.tenant_id == tenant_id)
        if user_id:
            query = query.filter(TenantAuditLog.user_id == user_id)
        if action:
            query = query.filter(TenantAuditLog.action == action)
        return query.order_by(TenantAuditLog.created_at.desc()).limit(limit).offset(offset).all()
    
    def get_tenant_users(self, tenant_id: int, skip: int = 0, limit: int = 100) -> List[User]:
        return self.db.query(User).filter(User.tenant_id == tenant_id).offset(skip).limit(limit).all()
    
    def create_user(self, tenant_id: int, user_data: Dict[str, Any],
                    current_admin_id: Optional[int] = None,
                    ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> User:
        tenant = self.get_tenant_by_id(tenant_id)
        if not tenant:
            raise ValueError(f"Tenant {tenant_id} not found.")

        if tenant.max_users is not None:
            current_user_count = self.db.query(User).filter(User.tenant_id == tenant_id).count()
            if current_user_count >= tenant.max_users:
                raise ValueError(f"User limit ({tenant.max_users}) reached for tenant {tenant.name} (ID: {tenant_id}).")

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
        
        default_role_name = user_data.get("default_role", "User")
        default_role = self.db.query(Role).filter(
            Role.tenant_id == tenant_id, Role.name == default_role_name
        ).first()
        
        assigned_role_id_for_log = None
        if default_role:
            user_role = UserRole(
                user_id=user.id,
                role_id=default_role.id,
                assigned_by=current_admin_id
            )
            self.db.add(user_role)
            assigned_role_id_for_log = default_role.id
        
        # Commit happens after user and potentially UserRole are added
        # self.db.commit() # Deferred to allow _create_admin_user to commit once.

        self._log_audit_event(
            tenant_id=tenant_id, user_id=current_admin_id, action="user_created",
            resource_type="user", resource_id=str(user.id),
            details={"username": user.username, "email": user.email, "assigned_role_id": assigned_role_id_for_log},
            ip_address=ip_address, user_agent=user_agent
        )
        return user
    
    def assign_role(self, user_id: int, role_id: int, assigned_by_user_id: int,
                    ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> UserRole:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found.")
        role_to_assign = self.db.query(Role).filter(Role.id == role_id, Role.tenant_id == user.tenant_id).first()
        if not role_to_assign:
            raise ValueError("Role not found or does not belong to the user's tenant.")

        existing = self.db.query(UserRole).filter(
            UserRole.user_id == user_id, UserRole.role_id == role_id
        ).first()
        
        if existing:
            return existing
        
        user_role = UserRole(
            user_id=user_id,
            role_id=role_id,
            assigned_by=assigned_by_user_id
        )
        
        self.db.add(user_role)
        self.db.commit()

        self._log_audit_event(
            tenant_id=user.tenant_id, user_id=assigned_by_user_id, action="user_role_assigned",
            resource_type="user_role", resource_id=f"user:{user_id},role:{role_id}",
            details={"user_id": user_id, "role_id": role_id, "role_name": role_to_assign.name},
            ip_address=ip_address, user_agent=user_agent
        )
        return user_role
    
    def get_user_permissions(self, user_id: int) -> List[str]:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        permissions = set()
        user_roles = self.db.query(UserRole).join(Role).filter(UserRole.user_id == user_id).options(relationship(Role.permissions)).all()
        
        for ur in user_roles:
            if ur.role and isinstance(ur.role.permissions, list): # ur.role should be eagerly loaded if using options correctly
                permissions.update(ur.role.permissions)
        
        return list(permissions)
    
    def check_permission(self, user_id: int, permission: str) -> bool:
        permissions = self.get_user_permissions(user_id)
        return permission in permissions
    
    def _get_enhanced_features(self, subscription_tier: str) -> Dict[str, bool]:
        base_features = {
            "analytics": True, "social_collaboration": True, "basic_reporting": True,
            "api_access": False, "sso": False, "audit_logs_access": False,
            "ai_insights": False, "advanced_reporting": False, "writing_assistance": False,
            "integrations_basic": True, "integrations_premium": False,
            "ai_features_standard": False, "workflow_automation_simple": False,
            "market_intelligence_overview": False, "advanced_security_options": False
        }
        if subscription_tier == "professional": # Example, align with actual tier names
            base_features.update({
                "api_access": True, "ai_insights": True, "writing_assistance": True,
                "integrations_premium": True, "ai_features_standard": True,
                "workflow_automation_simple": True, "advanced_security_options": True
            })
        elif subscription_tier == "enterprise":
            base_features.update({
                "api_access": True, "sso": True, "audit_logs_access": True,
                "ai_insights": True, "advanced_reporting": True, "writing_assistance": True,
                "integrations_premium": True, "ai_features_standard": True,
                "workflow_automation_simple": True,
                "market_intelligence_overview": True,
                "advanced_security_options": True
            })
        return base_features
    
    def _create_default_roles(self, tenant_id: int):
        default_roles_data = [
            {"name": "Admin", "description": "Full administrative access", "permissions": ["tenant:manage", "users:manage", "roles:manage", "settings:manage", "billing:manage"]},
            {"name": "Manager", "description": "Team management and operational oversight", "permissions": ["users:view", "team:manage"]},
            {"name": "User", "description": "Standard user access", "permissions": ["profile:manage_own", "content:view"]}
        ]
        
        for role_data in default_roles_data:
            role = Role(
                tenant_id=tenant_id,
                name=role_data["name"],
                description=role_data["description"],
                permissions=role_data["permissions"],
                is_system_role=True
            )
            self.db.add(role)
        self.db.flush()

    def _create_admin_user(self, tenant_id: int, admin_user_data: Dict[str, Any], ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> User:
        # Called from create_tenant, tenant context is established.
        # The create_user method handles limit checks and its own audit log.
        # Pass current_admin_id as None as this is the first admin.
        admin_user = self.create_user(tenant_id, admin_user_data, current_admin_id=None, ip_address=ip_address, user_agent=user_agent)
        
        admin_role = self.db.query(Role).filter(
            Role.tenant_id == tenant_id, Role.name == "Admin"
        ).first()
        
        if admin_role:
            # assign_role handles its own audit log. Admin user is implicitly assigning to self.
            self.assign_role(admin_user.id, admin_role.id, assigned_by_user_id=admin_user.id, ip_address=ip_address, user_agent=user_agent)
        
        # Important: create_tenant will do the final commit.
        return admin_user

class UserService:
    """
    Service for user management operations not strictly tied to TenantService instance.
    """
    def __init__(self, db: Session):
        self.db = db
    
    def authenticate_user(self, username: str, password: str, tenant_id: Optional[int] = None) -> Optional[User]:
        query = self.db.query(User).filter(User.username == username, User.is_active == True)
        if tenant_id is not None: # Scope to tenant if ID provided
            query = query.filter(User.tenant_id == tenant_id)

        user = query.first()
        
        if user and pwd_context.verify(password, user.hashed_password):
            user.last_login = datetime.now(timezone.utc)
            self.db.commit()
            # Consider how to call TenantService._log_audit_event here if needed
            # For example: TenantService(self.db)._log_audit_event(user.tenant_id, user.id, "user_login", ...)
            return user
        return None
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def update_user_profile(self, user_id: int, profile_data: Dict[str, Any],
                            current_user_id: int,
                            ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> User:
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        changes = {}
        original_data = {}
        allowed_fields = ["first_name", "last_name", "job_title", "department", "profile_data", "preferences"]

        for field, value in profile_data.items():
            if field in allowed_fields and hasattr(user, field):
                old_value = getattr(user, field)
                if old_value != value:
                    if isinstance(old_value, dict) and isinstance(value, dict):
                        merged_value = {**old_value, **value}
                        if merged_value != old_value:
                            original_data[field] = dict(old_value) # Ensure copy for dicts
                            changes[field] = dict(merged_value)
                            setattr(user, field, merged_value)
                    else:
                        original_data[field] = old_value
                        changes[field] = value
                        setattr(user, field, value)

        if changes:
            user.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(user)
            # TenantService(self.db)._log_audit_event(user.tenant_id, current_user_id, "user_profile_updated", "user", str(user.id), {"changes": changes}, ip_address, user_agent)
        return user
    
    def change_password(self, user_id: int, old_password: str, new_password: str,
                        current_user_id: int,
                        ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> bool:
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        if not pwd_context.verify(old_password, user.hashed_password):
            # TenantService(self.db)._log_audit_event(user.tenant_id, current_user_id, "user_change_password_failed_old_password", "user", str(user.id), ip_address=ip_address, user_agent=user_agent)
            return False
        
        user.hashed_password = pwd_context.hash(new_password)
        user.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        # TenantService(self.db)._log_audit_event(user.tenant_id, current_user_id, "user_password_changed", "user", str(user.id), ip_address=ip_address, user_agent=user_agent)
        return True
    
    def deactivate_user(self, user_id: int, current_admin_id: int,
                        ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> bool:
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        if not user.is_active:
            return True

        user.is_active = False
        user.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        # TenantService(self.db)._log_audit_event(user.tenant_id, current_admin_id, "user_deactivated", "user", str(user.id), ip_address=ip_address, user_agent=user_agent)
        return True

    def activate_user(self, user_id: int, current_admin_id: int,
                      ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> bool:
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if user.is_active:
            return True

        user.is_active = True
        user.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        # TenantService(self.db)._log_audit_event(user.tenant_id, current_admin_id, "user_activated", "user", str(user.id), ip_address=ip_address, user_agent=user_agent)
        return True

```
