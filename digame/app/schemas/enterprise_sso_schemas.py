"""
Enterprise SSO schemas for API requests and responses
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime


# Base schemas
class SSOProviderBase(BaseModel):
    name: str = Field(..., description="Provider name")
    provider_type: str = Field(..., description="Provider type (saml, oidc, ldap, azure_ad, google_workspace)")
    configuration: Dict[str, Any] = Field(..., description="Provider-specific configuration")
    metadata: Optional[str] = Field(None, description="SAML metadata or OIDC discovery document")
    auto_provision_users: bool = Field(True, description="Automatically provision users")
    default_role: str = Field("user", description="Default role for new users")
    attribute_mapping: Optional[Dict[str, str]] = Field(None, description="Map SSO attributes to user fields")
    require_signed_assertions: bool = Field(True, description="Require signed SAML assertions")
    encrypt_assertions: bool = Field(False, description="Encrypt SAML assertions")
    session_timeout_minutes: int = Field(480, description="Session timeout in minutes")


class SSOProviderCreate(SSOProviderBase):
    """Schema for creating SSO provider"""
    pass


class SSOProviderUpdate(BaseModel):
    """Schema for updating SSO provider"""
    name: Optional[str] = None
    provider_type: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None
    metadata: Optional[str] = None
    auto_provision_users: Optional[bool] = None
    default_role: Optional[str] = None
    attribute_mapping: Optional[Dict[str, str]] = None
    require_signed_assertions: Optional[bool] = None
    encrypt_assertions: Optional[bool] = None
    session_timeout_minutes: Optional[int] = None
    status: Optional[str] = None


class SSOProviderResponse(SSOProviderBase):
    """Schema for SSO provider response"""
    id: int
    tenant_id: int
    status: str
    created_by: int
    created_at: datetime
    updated_at: datetime
    last_tested_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SSOProviderSummary(BaseModel):
    """Summary schema for SSO provider listing"""
    id: int
    name: str
    provider_type: str
    status: str
    created_at: datetime
    last_tested_at: Optional[datetime] = None
    active_sessions_count: int = 0

    class Config:
        from_attributes = True


# SSO Session schemas
class SSOSessionResponse(BaseModel):
    """Schema for SSO session response"""
    id: int
    tenant_id: int
    provider_id: int
    user_id: int
    session_id: str
    external_user_id: Optional[str] = None
    login_method: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    last_activity_at: datetime
    expires_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


# SSO Configuration schemas
class TenantSSOConfigurationBase(BaseModel):
    enforce_sso: bool = Field(False, description="Enforce SSO for all users")
    allow_local_login: bool = Field(True, description="Allow local password login")
    require_mfa_for_local: bool = Field(False, description="Require MFA for local login")
    default_provider_id: Optional[int] = Field(None, description="Default SSO provider")
    max_concurrent_sessions: int = Field(5, description="Maximum concurrent sessions per user")
    session_timeout_minutes: int = Field(480, description="Default session timeout")
    idle_timeout_minutes: int = Field(60, description="Idle timeout")
    require_fresh_login_for_admin: bool = Field(True, description="Require fresh login for admin actions")
    block_concurrent_sessions: bool = Field(False, description="Block concurrent sessions")
    auto_create_users: bool = Field(True, description="Auto-create users from SSO")
    auto_update_user_attributes: bool = Field(True, description="Auto-update user attributes")
    auto_assign_groups: bool = Field(False, description="Auto-assign groups")
    log_all_activities: bool = Field(True, description="Log all SSO activities")
    retain_logs_days: int = Field(90, description="Log retention period")
    custom_login_page_url: Optional[str] = Field(None, description="Custom login page URL")
    custom_logout_redirect_url: Optional[str] = Field(None, description="Custom logout redirect URL")


class TenantSSOConfigurationUpdate(TenantSSOConfigurationBase):
    """Schema for updating tenant SSO configuration"""
    pass


class TenantSSOConfigurationResponse(TenantSSOConfigurationBase):
    """Schema for tenant SSO configuration response"""
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True


# SSO Authentication schemas
class SSOLoginInitiateRequest(BaseModel):
    """Schema for initiating SSO login"""
    provider_id: int
    return_url: Optional[str] = None


class SSOLoginInitiateResponse(BaseModel):
    """Schema for SSO login initiation response"""
    success: bool
    redirect_url: Optional[str] = None
    state: Optional[str] = None
    nonce: Optional[str] = None
    request_id: Optional[str] = None
    error: Optional[str] = None


class SSOCallbackRequest(BaseModel):
    """Schema for SSO authentication callback"""
    provider_id: int
    callback_data: Dict[str, Any]
    ip_address: str
    user_agent: str


class SSOCallbackResponse(BaseModel):
    """Schema for SSO callback response"""
    success: bool
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    user_info: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class SSOLogoutRequest(BaseModel):
    """Schema for SSO logout"""
    session_id: str
    logout_reason: str = "manual"


class SSOLogoutResponse(BaseModel):
    """Schema for SSO logout response"""
    success: bool
    slo_url: Optional[str] = None
    error: Optional[str] = None


# SSO Testing schemas
class SSOProviderTestRequest(BaseModel):
    """Schema for testing SSO provider"""
    provider_id: int


class SSOProviderTestResponse(BaseModel):
    """Schema for SSO provider test response"""
    success: bool
    message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


# SSO Audit schemas
class SSOAuditLogResponse(BaseModel):
    """Schema for SSO audit log response"""
    id: int
    tenant_id: int
    provider_id: Optional[int] = None
    user_id: Optional[int] = None
    event_type: str
    event_category: str
    event_description: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    session_id: Optional[str] = None
    event_data: Optional[Dict[str, Any]] = None
    success: bool
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class SSOAuditLogFilter(BaseModel):
    """Schema for filtering SSO audit logs"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    event_type: Optional[str] = None
    event_category: Optional[str] = None
    user_id: Optional[int] = None
    provider_id: Optional[int] = None
    success: Optional[bool] = None
    limit: int = Field(100, ge=1, le=1000)


# SSO Analytics schemas
class SSOAnalyticsResponse(BaseModel):
    """Schema for SSO analytics response"""
    period_days: int
    total_logins: int
    unique_users: int
    active_sessions: int
    active_providers: int
    provider_usage: Dict[str, int]
    average_logins_per_day: float
    success_rate: float
    most_active_hours: List[int]
    login_trends: Dict[str, int]


class SSOUserMappingResponse(BaseModel):
    """Schema for SSO user mapping response"""
    id: int
    tenant_id: int
    provider_id: int
    user_id: int
    external_user_id: str
    external_username: Optional[str] = None
    external_email: Optional[str] = None
    last_login_at: Optional[datetime] = None
    login_count: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Bulk operations schemas
class SSOBulkOperationRequest(BaseModel):
    """Schema for bulk SSO operations"""
    operation: str  # deactivate_sessions, update_mappings, etc.
    filters: Dict[str, Any]
    parameters: Optional[Dict[str, Any]] = None


class SSOBulkOperationResponse(BaseModel):
    """Schema for bulk SSO operation response"""
    success: bool
    operation: str
    affected_count: int
    details: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


# SSO Provider configuration templates
class SSOProviderTemplate(BaseModel):
    """Schema for SSO provider configuration templates"""
    name: str
    provider_type: str
    description: str
    configuration_template: Dict[str, Any]
    required_fields: List[str]
    optional_fields: List[str]
    setup_instructions: str


class SSOProviderTemplateResponse(BaseModel):
    """Schema for SSO provider template response"""
    templates: List[SSOProviderTemplate]
    categories: Dict[str, List[str]]


# SSO Health check schemas
class SSOHealthCheckResponse(BaseModel):
    """Schema for SSO health check response"""
    status: str
    providers_status: Dict[str, str]
    active_sessions_count: int
    recent_errors_count: int
    last_successful_login: Optional[datetime] = None
    system_health: Dict[str, Any]


# SSO Migration schemas
class SSOMigrationRequest(BaseModel):
    """Schema for SSO migration operations"""
    source_provider_id: int
    target_provider_id: int
    migration_type: str  # users, sessions, configuration
    options: Optional[Dict[str, Any]] = None


class SSOMigrationResponse(BaseModel):
    """Schema for SSO migration response"""
    success: bool
    migration_id: str
    status: str
    migrated_count: int
    failed_count: int
    details: Optional[Dict[str, Any]] = None
    error: Optional[str] = None