"""
Enterprise SSO models for SAML, OIDC, and LDAP integration
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class SSOProvider(Base):
    """SSO Provider configuration for enterprise authentication"""
    __tablename__ = "sso_providers"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    provider_type = Column(String(50), nullable=False)  # saml, oidc, ldap, azure_ad, google_workspace
    status = Column(String(20), default="active")  # active, inactive, testing
    
    # Provider Configuration
    configuration = Column(JSON, nullable=False)  # Provider-specific config
    metadata = Column(Text)  # SAML metadata or OIDC discovery document
    
    # Authentication Settings
    auto_provision_users = Column(Boolean, default=True)
    default_role = Column(String(50), default="user")
    attribute_mapping = Column(JSON)  # Map SSO attributes to user fields
    
    # Security Settings
    require_signed_assertions = Column(Boolean, default=True)
    encrypt_assertions = Column(Boolean, default=False)
    session_timeout_minutes = Column(Integer, default=480)  # 8 hours
    
    # Audit Fields
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_tested_at = Column(DateTime)
    
    # Relationships
    sso_sessions = relationship("SSOSession", back_populates="provider", cascade="all, delete-orphan")
    audit_logs = relationship("SSOAuditLog", back_populates="provider", cascade="all, delete-orphan")


class SSOSession(Base):
    """Active SSO sessions for tracking and management"""
    __tablename__ = "sso_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False, index=True)
    provider_id = Column(Integer, ForeignKey("sso_providers.id"), nullable=False)
    user_id = Column(Integer, nullable=False, index=True)
    
    # Session Details
    session_id = Column(String(255), unique=True, nullable=False, index=True)
    saml_session_index = Column(String(255))  # For SAML logout
    external_user_id = Column(String(255))  # User ID from SSO provider
    
    # Session Metadata
    login_method = Column(String(50))  # saml, oidc, ldap
    ip_address = Column(String(45))
    user_agent = Column(Text)
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow)
    last_activity_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    logout_reason = Column(String(100))  # timeout, manual, forced, provider_logout
    
    # Relationships
    provider = relationship("SSOProvider", back_populates="sso_sessions")


class SSOAuditLog(Base):
    """Audit logging for SSO activities"""
    __tablename__ = "sso_audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False, index=True)
    provider_id = Column(Integer, ForeignKey("sso_providers.id"))
    user_id = Column(Integer, index=True)
    
    # Event Details
    event_type = Column(String(50), nullable=False)  # login, logout, error, config_change
    event_category = Column(String(50), nullable=False)  # authentication, authorization, configuration
    event_description = Column(Text)
    
    # Context
    ip_address = Column(String(45))
    user_agent = Column(Text)
    session_id = Column(String(255))
    
    # Event Data
    event_data = Column(JSON)  # Additional event-specific data
    success = Column(Boolean, default=True)
    error_code = Column(String(50))
    error_message = Column(Text)
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    provider = relationship("SSOProvider", back_populates="audit_logs")


class TenantSSOConfiguration(Base):
    """Tenant-level SSO configuration and policies"""
    __tablename__ = "tenant_sso_configurations"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, unique=True, nullable=False, index=True)
    
    # SSO Enforcement
    enforce_sso = Column(Boolean, default=False)
    allow_local_login = Column(Boolean, default=True)
    require_mfa_for_local = Column(Boolean, default=False)
    
    # Default Provider
    default_provider_id = Column(Integer, ForeignKey("sso_providers.id"))
    
    # Session Management
    max_concurrent_sessions = Column(Integer, default=5)
    session_timeout_minutes = Column(Integer, default=480)
    idle_timeout_minutes = Column(Integer, default=60)
    
    # Security Policies
    require_fresh_login_for_admin = Column(Boolean, default=True)
    block_concurrent_sessions = Column(Boolean, default=False)
    
    # User Provisioning
    auto_create_users = Column(Boolean, default=True)
    auto_update_user_attributes = Column(Boolean, default=True)
    auto_assign_groups = Column(Boolean, default=False)
    
    # Compliance
    log_all_activities = Column(Boolean, default=True)
    retain_logs_days = Column(Integer, default=90)
    
    # Configuration
    custom_login_page_url = Column(String(500))
    custom_logout_redirect_url = Column(String(500))
    
    # Audit Fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer)


class SSOUserMapping(Base):
    """Mapping between SSO users and local users"""
    __tablename__ = "sso_user_mappings"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False, index=True)
    provider_id = Column(Integer, ForeignKey("sso_providers.id"), nullable=False)
    user_id = Column(Integer, nullable=False, index=True)
    
    # SSO Identity
    external_user_id = Column(String(255), nullable=False)
    external_username = Column(String(255))
    external_email = Column(String(255))
    
    # Mapping Details
    last_login_at = Column(DateTime)
    login_count = Column(Integer, default=0)
    
    # Attributes from SSO
    sso_attributes = Column(JSON)  # Store all attributes from SSO
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Audit Fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint on provider + external user
    __table_args__ = (
        {"schema": None}
    )