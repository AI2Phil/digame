"""
Multi-tenant architecture models for the Digame platform
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base # Assuming Base is in a directory above the current models directory
from typing import Optional, Dict, Any # Keep for type hinting if used elsewhere, though not directly in models
from datetime import datetime # Keep for type hinting if used elsewhere

class Tenant(Base):
    """
    Tenant model for multi-tenant architecture
    """
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    tenant_uuid = Column(String(36), unique=True, nullable=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    domain = Column(String(255), unique=True, nullable=False, index=True)
    subdomain = Column(String(100), unique=True, nullable=False, index=True)
    
    settings = Column(JSON, default={})
    features = Column(JSON, default={})
    branding = Column(JSON, nullable=True, default={})

    subscription_tier = Column(String(50), default="basic")
    max_users = Column(Integer, nullable=True, default=10)
    storage_limit_gb = Column(Integer, nullable=True, default=5)
    api_rate_limit = Column(Integer, nullable=True, default=1000)
    
    is_active = Column(Boolean, default=True)
    is_trial = Column(Boolean, default=True)
    trial_ends_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    admin_email = Column(String(255), nullable=False)
    admin_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="tenant", cascade="all, delete-orphan")
    tenant_configurations = relationship("TenantSettings", back_populates="tenant", cascade="all, delete-orphan")
    invitations = relationship("TenantInvitation", back_populates="tenant", cascade="all, delete-orphan")
    audit_logs = relationship("TenantAuditLog", back_populates="tenant", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Tenant(id={self.id}, name='{self.name}', domain='{self.domain}')>"


class User(Base):
    """
    Enhanced user model with multi-tenant support
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    username = Column(String(100), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    job_title = Column(String(200), nullable=True)
    department = Column(String(100), nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    profile_data = Column(JSON, default={})
    preferences = Column(JSON, default={})
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    tenant = relationship("Tenant", back_populates="users")
    roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    manager = relationship("User", remote_side=[id], backref="direct_reports")
    
    # Using list of strings for foreign_keys as per some SQLAlchemy examples for forward refs
    sent_invitations = relationship("TenantInvitation", foreign_keys=["TenantInvitation.invited_by_user_id"], back_populates="invited_by", cascade="all, delete-orphan")
    audit_log_entries = relationship("TenantAuditLog", foreign_keys=["TenantAuditLog.user_id"], back_populates="user", cascade="all, delete-orphan")
    assigned_user_roles = relationship("UserRole", foreign_keys=["UserRole.assigned_by"], back_populates="assigner", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', tenant_id={self.tenant_id})>"


class Role(Base):
    """
    Role-based access control for multi-tenant system
    """
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    permissions = Column(JSON, default=[])
    
    is_system_role = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    tenant = relationship("Tenant", back_populates="roles")
    user_roles = relationship("UserRole", back_populates="role", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}', tenant_id={self.tenant_id})>"


class UserRole(Base):
    """
    Many-to-many relationship between users and roles
    """
    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    user = relationship("User", foreign_keys=[user_id], back_populates="roles") # This UserRole.user links to User.roles
    role = relationship("Role", back_populates="user_roles")
    # This UserRole.assigner links to User.assigned_user_roles
    assigner = relationship("User", foreign_keys=[assigned_by], back_populates="assigned_user_roles")
    
    def __repr__(self):
        return f"<UserRole(user_id={self.user_id}, role_id={self.role_id})>"


class TenantSettings(Base):
    """
    Key-value store for tenant-specific configurations.
    """
    __tablename__ = "tenant_settings"

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
    __tablename__ = "tenant_invitations"

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
    invited_by = relationship("User", foreign_keys=[invited_by_user_id], back_populates="sent_invitations")

    def __repr__(self):
        return f"<TenantInvitation(email='{self.email}', tenant_id={self.tenant_id})>"


class TenantAuditLog(Base):
    """
    Model for tenant audit logs.
    """
    __tablename__ = "tenant_audit_logs"

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
    user = relationship("User", foreign_keys=[user_id], back_populates="audit_log_entries")

    def __repr__(self):
        return f"<TenantAuditLog(action='{self.action}', tenant_id={self.tenant_id}, user_id={self.user_id})>"
