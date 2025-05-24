"""
Multi-tenancy models for enterprise features
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

# Use declarative_base directly since database module doesn't exist
Base = declarative_base()

class Tenant(Base):
    """
    Tenant model for multi-tenancy support
    Each tenant represents an organization/company using the platform
    """
    __tablename__ = "tenants"

    id = Column(Integer(), primary_key=True, index=True)
    tenant_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    domain = Column(String(255), unique=True, nullable=True, index=True)
    
    # Subscription and billing
    subscription_tier = Column(String(50), default="basic")  # basic, professional, enterprise
    max_users = Column(Integer(), default=10)
    storage_limit_gb = Column(Integer(), default=5)
    api_rate_limit = Column(Integer(), default=1000)  # requests per hour
    
    # Configuration
    settings = Column(JSON, default={})
    branding = Column(JSON, default={})  # logo, colors, custom domain
    features = Column(JSON, default={})  # enabled features per tenant
    
    # Status and metadata
    is_active = Column(Boolean(), default=True)
    is_trial = Column(Boolean(), default=True)
    trial_ends_at = Column(DateTime(), nullable=True)
    created_at = Column(DateTime(), default=datetime.utcnow)
    updated_at = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Contact information
    admin_email = Column(String(255), nullable=False)
    admin_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    address = Column(Text(), nullable=True)
    
    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    tenant_settings = relationship("TenantSetting", back_populates="tenant", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Tenant(id={self.id}, name='{self.name}', slug='{self.slug}')>"

    @property
    def is_trial_expired(self):
        """Check if trial period has expired"""
        if not self.is_trial or not self.trial_ends_at:
            return False
        return datetime.utcnow() > self.trial_ends_at

    @property
    def days_remaining_in_trial(self):
        """Get number of days remaining in trial"""
        if not self.is_trial or not self.trial_ends_at:
            return 0
        delta = self.trial_ends_at - datetime.utcnow()
        return max(0, delta.days)

    def get_feature_enabled(self, feature_name: str) -> bool:
        """Check if a specific feature is enabled for this tenant"""
        return self.features.get(feature_name, False)

    def get_setting(self, setting_name: str, default=None):
        """Get a tenant-specific setting"""
        return self.settings.get(setting_name, default)


class TenantSetting(Base):
    """
    Tenant-specific settings and configurations
    """
    __tablename__ = "tenant_settings"

    id = Column(Integer(), primary_key=True, index=True)
    tenant_id = Column(Integer(), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # security, branding, features, etc.
    key = Column(String(100), nullable=False, index=True)
    value = Column(Text(), nullable=True)
    value_type = Column(String(20), default="string")  # string, integer, boolean, json
    is_encrypted = Column(Boolean(), default=False)
    created_at = Column(DateTime(), default=datetime.utcnow)
    updated_at = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="tenant_settings")

    def __repr__(self):
        return f"<TenantSetting(tenant_id={self.tenant_id}, key='{self.key}')>"

    @property
    def parsed_value(self):
        """Parse value based on value_type"""
        if self.value is None:
            return None
        
        if self.value_type == "boolean":
            return self.value.lower() in ("true", "1", "yes", "on")
        elif self.value_type == "integer":
            try:
                return int(self.value)
            except ValueError:
                return 0
        elif self.value_type == "json":
            try:
                import json
                return json.loads(self.value)
            except (json.JSONDecodeError, TypeError):
                return {}
        else:
            return self.value


class TenantUser(Base):
    """
    Association table for tenant-user relationships with roles
    """
    __tablename__ = "tenant_users"

    id = Column(Integer(), primary_key=True, index=True)
    tenant_id = Column(Integer(), nullable=False, index=True)
    user_id = Column(Integer(), nullable=False, index=True)
    role = Column(String(50), default="member")  # admin, manager, member, viewer
    permissions = Column(JSON, default={})
    is_active = Column(Boolean(), default=True)
    joined_at = Column(DateTime(), default=datetime.utcnow)
    last_active_at = Column(DateTime(), nullable=True)

    def __repr__(self):
        return f"<TenantUser(tenant_id={self.tenant_id}, user_id={self.user_id}, role='{self.role}')>"

    def has_permission(self, permission: str) -> bool:
        """Check if user has specific permission in this tenant"""
        return self.permissions.get(permission, False)


class TenantInvitation(Base):
    """
    Invitations for users to join tenants
    """
    __tablename__ = "tenant_invitations"

    id = Column(Integer(), primary_key=True, index=True)
    tenant_id = Column(Integer(), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    role = Column(String(50), default="member")
    invited_by_user_id = Column(Integer(), nullable=False)
    invitation_token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(), nullable=False)
    accepted_at = Column(DateTime(), nullable=True)
    created_at = Column(DateTime(), default=datetime.utcnow)

    def __repr__(self):
        return f"<TenantInvitation(tenant_id={self.tenant_id}, email='{self.email}')>"

    @property
    def is_expired(self):
        """Check if invitation has expired"""
        return datetime.utcnow() > self.expires_at

    @property
    def is_accepted(self):
        """Check if invitation has been accepted"""
        return self.accepted_at is not None


class TenantAuditLog(Base):
    """
    Audit log for tenant activities
    """
    __tablename__ = "tenant_audit_logs"

    id = Column(Integer(), primary_key=True, index=True)
    tenant_id = Column(Integer(), nullable=False, index=True)
    user_id = Column(Integer(), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, default={})
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text(), nullable=True)
    created_at = Column(DateTime(), default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<TenantAuditLog(tenant_id={self.tenant_id}, action='{self.action}')>"