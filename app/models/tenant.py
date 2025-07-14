"""
Multi-tenant architecture models for the Digame platform
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base  # Use the same Base as User model
from typing import Optional, Dict, Any # Keep for type hinting if used elsewhere, though not directly in models
from datetime import datetime # Keep for type hinting if used elsewhere

# Import UserRoleAssignment to ensure it's available for relationship resolution
def _ensure_user_role_assignment_imported():
    try:
        from app.models.rbac_imports import UserRoleAssignment
        return UserRoleAssignment
    except ImportError:
        return None

# Call the import function to register the class
_ensure_user_role_assignment_imported()

class Tenant(Base):
    """
    Tenant model for multi-tenant architecture
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "tenants"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    tenant_uuid = Column(String(36), unique=True, nullable=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    domain = Column(String(255), unique=True, nullable=False, index=True)
    subdomain = Column(String(100), unique=True, nullable=False, index=True)
    
    settings = Column(JSON, default={})
    features = Column(JSON, default={})
    branding = Column(JSON, nullable=True, default={})

    # Subscription Information
    subscription_tier = Column(String(50), default="free")  # free, team, enterprise
    subscription_status = Column(String(50), default="trial")  # trial, active, suspended, cancelled
    subscription_expires = Column(DateTime, nullable=True)
    billing_email = Column(String(255), nullable=True)
    
    # Platform Owner Management
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # Tenant owner
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Platform Owner who created
    managed_by = Column(Integer, ForeignKey("users.id"), nullable=True)   # Assigned Platform Owner manager
    
    # Tenant Limits (based on subscription tier)
    max_users = Column(Integer, nullable=True, default=1)
    max_storage_gb = Column(Integer, nullable=True, default=1)
    max_api_calls_monthly = Column(Integer, nullable=True, default=1000)
    
    # Usage Tracking
    current_users = Column(Integer, default=0)
    current_storage_gb = Column(Float, default=0.0)
    current_api_calls_monthly = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    is_trial = Column(Boolean, default=True)
    trial_ends_at = Column(DateTime, nullable=True)

    # Audit Fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_activity = Column(DateTime, default=func.now())

    admin_email = Column(String(255), nullable=False)
    admin_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    
    # Relationships to User, Role, and UserRole models
    users = relationship("User", back_populates="tenant", foreign_keys="User.tenant_id")
    roles = relationship("Role", back_populates="tenant")
    user_roles = relationship("UserRoleAssignment")
    creator = relationship("User", foreign_keys=[created_by])
    manager = relationship("User", foreign_keys=[managed_by])
    
    # Other tenant-specific relationships
    tenant_configurations = relationship("TenantSettings", back_populates="tenant", cascade="all, delete-orphan")
    invitations = relationship("TenantInvitation", back_populates="tenant", cascade="all, delete-orphan")
    audit_logs = relationship("TenantAuditLog", back_populates="tenant", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Tenant(id={self.id}, name='{self.name}', domain='{self.domain}')>"

# Note: User and Role models are defined in user.py and rbac.py respectively
# The tenant relationships will be added to those existing models



class TenantSettings(Base):
    """
    Key-value store for tenant-specific configurations.
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "tenant_settings"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    key = Column(String(100), nullable=False, index=True)
    value = Column(Text, nullable=True)
    value_type = Column(String(20), nullable=True)
    is_encrypted = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tenant = relationship("Tenant", back_populates="tenant_configurations")

    def __repr__(self):
        return f"<TenantSettings(tenant_id={self.tenant_id}, category='{self.category}', key='{self.key}')>"


class TenantInvitation(Base):
    """
    Model for tenant user invitations.
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "tenant_invitations"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    role = Column(String(50), default='member')
    invited_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    invitation_token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tenant = relationship("Tenant", back_populates="invitations")
    # Note: User relationship will be handled in user.py
    # invited_by = relationship("User", foreign_keys=[invited_by_user_id], back_populates="sent_invitations")

    def __repr__(self):
        return f"<TenantInvitation(email='{self.email}', tenant_id={self.tenant_id})>"


class TenantAuditLog(Base):
    """
    Model for tenant audit logs.
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "tenant_audit_logs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    tenant = relationship("Tenant", back_populates="audit_logs")
    # Note: User relationship will be handled in user.py
    # user = relationship("User", foreign_keys=[user_id], back_populates="audit_log_entries")

    def __repr__(self):
        return f"<TenantAuditLog(action='{self.action}', tenant_id={self.tenant_id}, user_id={self.user_id})>"
