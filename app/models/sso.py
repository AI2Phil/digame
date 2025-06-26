"""
Single Sign-On (SSO) models for enterprise authentication
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

# Use the existing Base from the project
try:
    from ..database import Base
except ImportError:
    # Fallback for development
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()

class SSOProvider(Base):
    """
    SSO Provider configuration for tenants
    Supports SAML, OAuth2, OpenID Connect, and LDAP
    """
    __tablename__ = "sso_providers"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    provider_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # Provider configuration
    name = Column(String(255), nullable=False)  # Display name
    provider_type = Column(String(50), nullable=False)  # saml, oauth2, oidc, ldap
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)  # Default provider for tenant
    
    # Connection details
    issuer_url = Column(String(500), nullable=True)  # Identity provider URL
    client_id = Column(String(255), nullable=True)  # OAuth2/OIDC client ID
    client_secret = Column(Text, nullable=True)  # Encrypted client secret
    
    # SAML specific
    saml_entity_id = Column(String(500), nullable=True)
    saml_sso_url = Column(String(500), nullable=True)
    saml_slo_url = Column(String(500), nullable=True)  # Single Logout URL
    saml_certificate = Column(Text, nullable=True)  # X.509 certificate
    
    # LDAP specific
    ldap_server = Column(String(255), nullable=True)
    ldap_port = Column(Integer, nullable=True)
    ldap_base_dn = Column(String(500), nullable=True)
    ldap_bind_dn = Column(String(500), nullable=True)
    ldap_bind_password = Column(Text, nullable=True)  # Encrypted
    ldap_user_filter = Column(String(500), nullable=True)
    ldap_group_filter = Column(String(500), nullable=True)
    
    # Attribute mapping
    attribute_mapping = Column(JSON, default={})  # Map IdP attributes to user fields
    role_mapping = Column(JSON, default={})  # Map IdP groups/roles to tenant roles
    
    # Security settings
    require_signed_assertions = Column(Boolean, default=True)
    require_encrypted_assertions = Column(Boolean, default=False)
    signature_algorithm = Column(String(100), default="RSA-SHA256")
    
    # Provisioning settings
    auto_provision_users = Column(Boolean, default=True)
    auto_update_user_info = Column(Boolean, default=True)
    default_user_role = Column(String(50), default="member")
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, nullable=True)
    
    # Relationships
    sso_sessions = relationship("SSOSession", back_populates="provider", cascade="all, delete-orphan")
    sso_user_mappings = relationship("SSOUserMapping", back_populates="provider", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<SSOProvider(id={self.id}, name='{self.name}', type='{self.provider_type}')>"

    @property
    def is_saml(self):
        return self.provider_type == "saml"

    @property
    def is_oauth2(self):
        return self.provider_type in ["oauth2", "oidc"]

    @property
    def is_ldap(self):
        return self.provider_type == "ldap"

    def get_attribute_mapping(self, attribute: str, default: str = None):
        """Get mapped attribute name for IdP attribute"""
        return self.attribute_mapping.get(attribute, default or attribute)

    def get_role_mapping(self, idp_role: str):
        """Get tenant role for IdP role/group"""
        return self.role_mapping.get(idp_role, self.default_user_role)


class SSOSession(Base):
    """
    SSO Session tracking for security and audit purposes
    """
    __tablename__ = "sso_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    provider_id = Column(Integer, ForeignKey("sso_providers.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Session details
    idp_session_id = Column(String(255), nullable=True, index=True)  # IdP session identifier
    saml_session_index = Column(String(255), nullable=True)  # SAML SessionIndex
    state_token = Column(String(255), nullable=True)  # OAuth2 state parameter
    
    # Authentication details
    subject_id = Column(String(255), nullable=False, index=True)  # IdP user identifier
    email = Column(String(255), nullable=True, index=True)
    name_id = Column(String(255), nullable=True)  # SAML NameID
    name_id_format = Column(String(255), nullable=True)  # SAML NameID format
    
    # Session lifecycle
    initiated_at = Column(DateTime, default=datetime.utcnow, index=True)
    authenticated_at = Column(DateTime, nullable=True)
    last_activity_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    terminated_at = Column(DateTime, nullable=True)
    
    # Security tracking
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    authentication_method = Column(String(50), nullable=True)  # saml, oauth2, ldap
    
    # Status
    status = Column(String(50), default="initiated")  # initiated, authenticated, expired, terminated
    failure_reason = Column(String(255), nullable=True)
    
    # Attributes received from IdP
    idp_attributes = Column(JSON, default={})
    
    # Relationships
    provider = relationship("SSOProvider", back_populates="sso_sessions")

    def __repr__(self):
        return f"<SSOSession(id={self.id}, subject_id='{self.subject_id}', status='{self.status}')>"

    @property
    def is_active(self):
        """Check if session is currently active"""
        if self.status != "authenticated":
            return False
        if self.expires_at and datetime.utcnow() > self.expires_at:
            return False
        return True

    @property
    def is_expired(self):
        """Check if session has expired"""
        return self.expires_at and datetime.utcnow() > self.expires_at

    def terminate(self, reason: str = None):
        """Terminate the SSO session"""
        self.status = "terminated"
        self.terminated_at = datetime.utcnow()
        if reason:
            self.failure_reason = reason


class SSOUserMapping(Base):
    """
    Mapping between IdP users and local users
    """
    __tablename__ = "sso_user_mappings"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("sso_providers.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # IdP identifiers
    subject_id = Column(String(255), nullable=False, index=True)  # IdP user identifier
    name_id = Column(String(255), nullable=True)  # SAML NameID
    email = Column(String(255), nullable=True, index=True)
    
    # Mapping metadata
    first_login_at = Column(DateTime, default=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
    login_count = Column(Integer, default=0)
    
    # User provisioning info
    auto_provisioned = Column(Boolean, default=False)
    last_attribute_sync_at = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    provider = relationship("SSOProvider", back_populates="sso_user_mappings")

    def __repr__(self):
        return f"<SSOUserMapping(id={self.id}, subject_id='{self.subject_id}', user_id={self.user_id})>"

    def update_login_info(self):
        """Update login tracking information"""
        self.last_login_at = datetime.utcnow()
        self.login_count += 1


class SSOAuditLog(Base):
    """
    Audit log for SSO activities
    """
    __tablename__ = "sso_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    provider_id = Column(Integer, ForeignKey("sso_providers.id"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    session_id = Column(Integer, ForeignKey("sso_sessions.id"), nullable=True, index=True)
    
    # Event details
    event_type = Column(String(100), nullable=False, index=True)  # login_attempt, login_success, login_failure, logout, etc.
    event_category = Column(String(50), nullable=False, index=True)  # authentication, authorization, configuration
    
    # Context
    subject_id = Column(String(255), nullable=True, index=True)
    email = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Event data
    details = Column(JSON, default={})
    error_message = Column(Text, nullable=True)
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<SSOAuditLog(id={self.id}, event_type='{self.event_type}', tenant_id={self.tenant_id})>"


class SSOConfiguration(Base):
    """
    Global SSO configuration settings
    """
    __tablename__ = "sso_configurations"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Global SSO settings
    sso_enabled = Column(Boolean, default=False)
    enforce_sso = Column(Boolean, default=False)  # Disable local login when true
    allow_local_fallback = Column(Boolean, default=True)  # Allow local login as fallback
    
    # Session settings
    session_timeout_minutes = Column(Integer, default=480)  # 8 hours
    max_concurrent_sessions = Column(Integer, default=5)
    require_fresh_auth_minutes = Column(Integer, default=60)  # For sensitive operations
    
    # Security settings
    require_mfa_for_sso = Column(Boolean, default=False)
    allowed_clock_skew_seconds = Column(Integer, default=300)  # 5 minutes
    
    # User provisioning
    auto_create_users = Column(Boolean, default=True)
    auto_update_user_attributes = Column(Boolean, default=True)
    auto_assign_groups = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, nullable=True)

    def __repr__(self):
        return f"<SSOConfiguration(id={self.id}, tenant_id={self.tenant_id}, sso_enabled={self.sso_enabled})>"