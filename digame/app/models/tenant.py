"""
Multi-tenant architecture models for the Digame platform
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
from typing import Optional, Dict, Any
from datetime import datetime


class Tenant(Base):
    """
    Tenant model for multi-tenant architecture
    """
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    domain = Column(String(255), unique=True, nullable=False, index=True)
    subdomain = Column(String(100), unique=True, nullable=False, index=True)
    
    # Tenant configuration
    settings = Column(JSON, default={})
    features_enabled = Column(JSON, default={})
    subscription_tier = Column(String(50), default="basic")
    
    # Status and metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="tenant", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Tenant(id={self.id}, name='{self.name}', domain='{self.domain}')>"


class User(Base):
    """
    Enhanced user model with multi-tenant support
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Basic user information
    username = Column(String(100), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    
    # Authentication
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Professional information
    job_title = Column(String(200))
    department = Column(String(100))
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Profile data
    profile_data = Column(JSON, default={})
    preferences = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    manager = relationship("User", remote_side=[id], backref="direct_reports")
    
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
    description = Column(Text)
    permissions = Column(JSON, default=[])
    
    # Role metadata
    is_system_role = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
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
    
    # Assignment metadata
    assigned_by = Column(Integer, ForeignKey("users.id"))
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="roles", foreign_keys=[user_id])
    role = relationship("Role", back_populates="user_roles")
    assigner = relationship("User", foreign_keys=[assigned_by])
    
    def __repr__(self):
        return f"<UserRole(user_id={self.user_id}, role_id={self.role_id})>"


class TenantSettings(Base):
    """
    Detailed tenant configuration and settings
    """
    __tablename__ = "tenant_settings"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, unique=True)
    
    # Branding and customization
    logo_url = Column(String(500))
    primary_color = Column(String(7))  # Hex color
    secondary_color = Column(String(7))
    custom_css = Column(Text)
    
    # Feature toggles
    analytics_enabled = Column(Boolean, default=True)
    integrations_enabled = Column(Boolean, default=True)
    ai_features_enabled = Column(Boolean, default=True)
    workflow_automation_enabled = Column(Boolean, default=False)
    market_intelligence_enabled = Column(Boolean, default=False)
    
    # Security settings
    password_policy = Column(JSON, default={})
    session_timeout = Column(Integer, default=3600)  # seconds
    mfa_required = Column(Boolean, default=False)
    
    # Notification settings
    email_notifications = Column(Boolean, default=True)
    slack_webhook_url = Column(String(500))
    teams_webhook_url = Column(String(500))
    
    # Data retention
    data_retention_days = Column(Integer, default=365)
    backup_enabled = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant", backref="settings")
    
    def __repr__(self):
        return f"<TenantSettings(tenant_id={self.tenant_id})>"