"""
Pydantic schemas for Tenant management
"""
from pydantic import BaseModel, EmailStr, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Tenant Schemas ---
class TenantBase(BaseModel):
    name: str
    slug: str
    domain: Optional[str] = None
    subdomain: Optional[str] = None
    subscription_tier: Optional[str] = "basic"
    admin_email: EmailStr
    admin_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    settings: Optional[Dict[str, Any]] = {} # For Tenant.settings JSON blob
    features: Optional[Dict[str, Any]] = {}
    branding: Optional[Dict[str, Any]] = {}
    max_users: Optional[int] = 10
    storage_limit_gb: Optional[int] = 5
    api_rate_limit: Optional[int] = 1000
    is_trial: Optional[bool] = True
    trial_ends_at: Optional[datetime] = None

class TenantCreate(TenantBase):
    admin_user_password: Optional[str] = None # Password for the initial admin user

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    domain: Optional[str] = None
    subdomain: Optional[str] = None
    subscription_tier: Optional[str] = None
    admin_email: Optional[EmailStr] = None
    admin_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    features: Optional[Dict[str, Any]] = None
    branding: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    is_trial: Optional[bool] = None
    trial_ends_at: Optional[datetime] = None
    max_users: Optional[int] = None
    storage_limit_gb: Optional[int] = None
    api_rate_limit: Optional[int] = None

class TenantResponse(TenantBase):
    id: int
    tenant_uuid: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True # Replaces orm_mode = True

# --- TenantSettings (Key-Value) Schemas ---
class TenantSettingBase(BaseModel):
    category: str
    key: str
    value: Any # Will be serialized based on value_type
    value_type: str # E.g., 'string', 'integer', 'boolean', 'json'
    is_encrypted: Optional[bool] = False

class TenantSettingCreateUpdate(TenantSettingBase):
    pass

class TenantSettingResponse(TenantSettingBase):
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- TenantInvitation Schemas ---
class TenantInvitationCreate(BaseModel):
    email: EmailStr
    role: str = "User" # Default role for invitation

class TenantInvitationResponse(BaseModel):
    id: int
    tenant_id: int
    email: EmailStr
    role: str
    invitation_token: str # Usually not exposed widely after creation, but good for response
    expires_at: datetime
    accepted_at: Optional[datetime] = None
    created_at: datetime
    invited_by_user_id: int

    class Config:
        from_attributes = True

class AcceptInvitationRequest(BaseModel):
    # User accepting the invitation is typically the authenticated user.
    # Token is part of the URL path.
    # No specific body needed unless additional info is required.
    pass

# --- TenantAuditLog Schemas ---
class TenantAuditLogResponse(BaseModel):
    id: int
    tenant_id: int
    user_id: Optional[int] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- User Schemas (simplified for router context, full user schemas might be elsewhere) ---
class UserBasicResponse(BaseModel): # For representing users within tenant context
    id: int
    username: str
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True

class UserCreateForTenant(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    default_role: Optional[str] = "User" # Role to assign upon creation

# --- Tenant Usage Schema ---
class TenantUsageResponse(BaseModel):
    tenant_id: int
    current_user_count: int
    max_users: Optional[int]
    # Add other usage metrics as needed e.g. storage_used_gb, storage_limit_gb
    # api_calls_current_cycle, api_rate_limit

# --- General Purpose Schemas ---
class MessageResponse(BaseModel):
    message: str
