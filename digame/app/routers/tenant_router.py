"""
Multi-tenant API router for the Digame platform
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

from ..database import get_db
from ..services.tenant_service import TenantService, UserService
from ..models.tenant import Tenant, User, TenantSettings

router = APIRouter(prefix="/api/v1/tenants", tags=["tenants"])


# Pydantic models for request/response
class TenantCreate(BaseModel):
    name: str
    domain: str
    subdomain: str
    subscription_tier: str = "basic"
    settings: Dict[str, Any] = {}
    admin_user: Dict[str, Any] = {}


class TenantResponse(BaseModel):
    id: int
    name: str
    domain: str
    subdomain: str
    subscription_tier: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: str = None
    last_name: str = None
    job_title: str = None
    department: str = None
    profile_data: Dict[str, Any] = {}
    preferences: Dict[str, Any] = {}


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    first_name: str = None
    last_name: str = None
    job_title: str = None
    department: str = None
    is_active: bool
    created_at: datetime
    last_login: datetime = None
    
    class Config:
        from_attributes = True


class TenantSettingsUpdate(BaseModel):
    logo_url: str = None
    primary_color: str = None
    secondary_color: str = None
    analytics_enabled: bool = None
    integrations_enabled: bool = None
    ai_features_enabled: bool = None
    workflow_automation_enabled: bool = None
    market_intelligence_enabled: bool = None
    email_notifications: bool = None
    session_timeout: int = None
    mfa_required: bool = None


class RoleAssignment(BaseModel):
    user_id: int
    role_id: int


@router.post("/", response_model=TenantResponse)
async def create_tenant(
    tenant_data: TenantCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new tenant with default settings and admin user
    """
    tenant_service = TenantService(db)
    
    try:
        tenant = tenant_service.create_tenant(tenant_data.dict())
        return tenant
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create tenant: {str(e)}"
        )


@router.get("/domain/{domain}", response_model=TenantResponse)
async def get_tenant_by_domain(
    domain: str,
    db: Session = Depends(get_db)
):
    """
    Get tenant information by domain
    """
    tenant_service = TenantService(db)
    tenant = tenant_service.get_tenant_by_domain(domain)
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return tenant


@router.get("/subdomain/{subdomain}", response_model=TenantResponse)
async def get_tenant_by_subdomain(
    subdomain: str,
    db: Session = Depends(get_db)
):
    """
    Get tenant information by subdomain
    """
    tenant_service = TenantService(db)
    tenant = tenant_service.get_tenant_by_subdomain(subdomain)
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return tenant


@router.put("/{tenant_id}/settings")
async def update_tenant_settings(
    tenant_id: int,
    settings_data: TenantSettingsUpdate,
    db: Session = Depends(get_db)
):
    """
    Update tenant settings
    """
    tenant_service = TenantService(db)
    
    try:
        settings = tenant_service.update_tenant_settings(
            tenant_id, 
            settings_data.dict(exclude_unset=True)
        )
        return {"message": "Settings updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update settings: {str(e)}"
        )


@router.get("/{tenant_id}/users", response_model=List[UserResponse])
async def get_tenant_users(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all users for a tenant
    """
    tenant_service = TenantService(db)
    users = tenant_service.get_tenant_users(tenant_id, skip, limit)
    return users


@router.post("/{tenant_id}/users", response_model=UserResponse)
async def create_user(
    tenant_id: int,
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new user within a tenant
    """
    tenant_service = TenantService(db)
    
    try:
        user = tenant_service.create_user(tenant_id, user_data.dict())
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create user: {str(e)}"
        )


@router.post("/{tenant_id}/roles/assign")
async def assign_role(
    tenant_id: int,
    assignment: RoleAssignment,
    db: Session = Depends(get_db)
):
    """
    Assign a role to a user
    """
    tenant_service = TenantService(db)
    
    try:
        user_role = tenant_service.assign_role(
            assignment.user_id,
            assignment.role_id,
            assignment.user_id  # For now, users assign roles to themselves
        )
        return {"message": "Role assigned successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to assign role: {str(e)}"
        )


@router.get("/users/{user_id}/permissions")
async def get_user_permissions(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all permissions for a user
    """
    tenant_service = TenantService(db)
    permissions = tenant_service.get_user_permissions(user_id)
    return {"permissions": permissions}


@router.get("/users/{user_id}/permissions/{permission}")
async def check_user_permission(
    user_id: int,
    permission: str,
    db: Session = Depends(get_db)
):
    """
    Check if a user has a specific permission
    """
    tenant_service = TenantService(db)
    has_permission = tenant_service.check_permission(user_id, permission)
    return {"has_permission": has_permission}


@router.post("/authenticate")
async def authenticate_user(
    username: str,
    password: str,
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """
    Authenticate a user within a specific tenant
    """
    user_service = UserService(db)
    user = user_service.authenticate_user(username, password, tenant_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    return {
        "user_id": user.id,
        "username": user.username,
        "tenant_id": user.tenant_id,
        "message": "Authentication successful"
    }


@router.put("/users/{user_id}/profile")
async def update_user_profile(
    user_id: int,
    profile_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Update user profile information
    """
    user_service = UserService(db)
    
    try:
        user = user_service.update_user_profile(user_id, profile_data)
        return {"message": "Profile updated successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.put("/users/{user_id}/password")
async def change_password(
    user_id: int,
    old_password: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    """
    Change user password
    """
    user_service = UserService(db)
    success = user_service.change_password(user_id, old_password, new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to change password. Check old password."
        )
    
    return {"message": "Password changed successfully"}


@router.delete("/users/{user_id}")
async def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Deactivate a user account
    """
    user_service = UserService(db)
    success = user_service.deactivate_user(user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User deactivated successfully"}


# Health check endpoint for tenant system
@router.get("/health")
async def tenant_health_check():
    """
    Health check for tenant system
    """
    return {
        "status": "healthy",
        "service": "multi-tenant",
        "timestamp": datetime.utcnow(),
        "features": [
            "tenant_management",
            "user_management", 
            "role_based_access_control",
            "tenant_settings",
            "authentication"
        ]
    }