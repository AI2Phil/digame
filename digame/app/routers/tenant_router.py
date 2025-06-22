"""
Multi-tenant API router for the Digame platform
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request # Added Request for IP/User-Agent
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any # Dict, Any might not be needed if schemas are strict

from ..database import get_db
from ..services.tenant_service import TenantService, UserService
# Assuming User model is needed for type hinting current_user, adjust if defined elsewhere
from ..models.tenant import User as UserModel
from ..schemas import tenant_schemas # Import the new schemas module

router = APIRouter(
    prefix="/api/v1", # Prefixing all with /api/v1
    tags=["Tenant Management"]
)

# Placeholder for authentication - replace with actual dependency
async def get_current_active_user(request: Request, db: Session = Depends(get_db)) -> UserModel:
    # This is a placeholder. In a real app, this would validate a token
    # and return the current authenticated user model.
    # For now, let's assume it returns a mock admin user from the first tenant if needed.
    user = db.query(UserModel).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    # Simulate adding ip_address and user_agent to the request state for service layer
    request.state.ip_address = request.client.host if request.client else "unknown"
    request.state.user_agent = request.headers.get("user-agent", "unknown")
    return user

# Placeholder for admin user check - replace with actual permission check
async def get_admin_user(current_user: UserModel = Depends(get_current_active_user), tenant_service: TenantService = Depends(lambda db: TenantService(db=db))):
    # This is a placeholder. Check if user has admin privileges for the tenant.
    # For example, check if user has 'tenant:manage' permission for their tenant.
    # tenant_service = TenantService(db) # db needs to be passed correctly
    # has_perm = tenant_service.check_permission(current_user.id, "tenant:manage")
    # if not has_perm:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this action")
    return current_user


# --- Tenant Management Endpoints ---
@router.post("/tenants/", response_model=tenant_schemas.TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_new_tenant(
    tenant_data: tenant_schemas.TenantCreate,
    request: Request, # To get IP and User-Agent
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_user) # Assuming only admins can create tenants
):
    tenant_service = TenantService(db)
    try:
        # Pass IP and User-Agent from request state if set by middleware/dependency
        ip_address = request.state.ip_address if hasattr(request.state, "ip_address") else request.client.host
        user_agent = request.state.user_agent if hasattr(request.state, "user_agent") else request.headers.get("user-agent")

        tenant = tenant_service.create_tenant(
            tenant_data.model_dump(),
            current_user_id=current_user.id,
            ip_address=ip_address,
            user_agent=user_agent
            )
        return tenant
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create tenant.")

@router.get("/tenants/{tenant_id}", response_model=tenant_schemas.TenantResponse)
async def read_tenant_by_id(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user) # Basic auth to view
):
    # Permission check: current_user must belong to tenant_id or be a superadmin
    if current_user.tenant_id != tenant_id: # Simplified check
        # Add logic here for superadmin or cross-tenant access if applicable
        # Or check specific permission: tenant_service.check_permission(current_user.id, "tenant:view")
        pass # Assuming for now, if user is part of the tenant, they can view it.

    tenant = TenantService(db).get_tenant_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    return tenant

@router.put("/tenants/{tenant_id}", response_model=tenant_schemas.TenantResponse)
async def update_existing_tenant(
    tenant_id: int,
    tenant_update_data: tenant_schemas.TenantUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_user) # Assuming admin for updates
):
    # Permission check: current_user must be admin of tenant_id
    if current_user.tenant_id != tenant_id: # Simplified check
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this tenant")

    tenant_service = TenantService(db)
    ip_address = request.state.ip_address if hasattr(request.state, "ip_address") else request.client.host
    user_agent = request.state.user_agent if hasattr(request.state, "user_agent") else request.headers.get("user-agent")

    updated_tenant = tenant_service.update_tenant(
        tenant_id,
        tenant_update_data.model_dump(exclude_unset=True),
        current_user_id=current_user.id,
        ip_address=ip_address,
        user_agent=user_agent
    )
    if not updated_tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    return updated_tenant

# Add other tenant lookup methods if needed: by slug, domain, subdomain
@router.get("/tenants/slug/{slug}", response_model=tenant_schemas.TenantResponse)
async def read_tenant_by_slug(slug: str, db: Session = Depends(get_db)): # Public or semi-public
    tenant = TenantService(db).get_tenant_by_slug(slug)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    return tenant

# --- TenantSettings (Key-Value) Endpoints ---
@router.post("/tenants/{tenant_id}/settings", response_model=tenant_schemas.TenantSettingResponse)
async def create_or_update_tenant_setting(
    tenant_id: int,
    setting_data: tenant_schemas.TenantSettingCreateUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_user) # Admin of the tenant
):
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this tenant")

    tenant_service = TenantService(db)
    ip_address = request.state.ip_address if hasattr(request.state, "ip_address") else request.client.host
    user_agent = request.state.user_agent if hasattr(request.state, "user_agent") else request.headers.get("user-agent")
    
    try:
        setting = tenant_service.set_tenant_setting(
            tenant_id, setting_data.category, setting_data.key,
            setting_data.value, setting_data.value_type, setting_data.is_encrypted,
            current_user_id=current_user.id, ip_address=ip_address, user_agent=user_agent
        )
        return setting
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

@router.get("/tenants/{tenant_id}/settings/{category}/{key}", response_model=tenant_schemas.TenantSettingResponse)
async def read_tenant_setting(
    tenant_id: int, category: str, key: str, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)
):
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this tenant")
    setting = TenantService(db).get_tenant_setting(tenant_id, category, key)
    if not setting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Setting not found")
    return setting

@router.get("/tenants/{tenant_id}/settings/{category}", response_model=List[tenant_schemas.TenantSettingResponse])
async def read_tenant_settings_by_category(
    tenant_id: int, category: str, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)
):
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this tenant")
    settings = TenantService(db).get_tenant_settings_by_category(tenant_id, category)
    return settings

@router.delete("/tenants/{tenant_id}/settings/{category}/{key}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_tenant_setting(
    tenant_id: int, category: str, key: str, request: Request, db: Session = Depends(get_db), current_user: UserModel = Depends(get_admin_user)
):
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this tenant")
    
    tenant_service = TenantService(db)
    ip_address = request.state.ip_address if hasattr(request.state, "ip_address") else request.client.host
    user_agent = request.state.user_agent if hasattr(request.state, "user_agent") else request.headers.get("user-agent")

    if not tenant_service.delete_tenant_setting(tenant_id, category, key, current_user_id=current_user.id, ip_address=ip_address, user_agent=user_agent):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Setting not found")
    return None # For 204 response

# --- TenantInvitation Endpoints ---
# Note: Invitations are typically managed by tenant admins.
@router.post("/tenants/{tenant_id}/invitations", response_model=tenant_schemas.TenantInvitationResponse, status_code=status.HTTP_201_CREATED)
async def invite_user_to_tenant(
    tenant_id: int,
    invitation_data: tenant_schemas.TenantInvitationCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_user) # Inviter must be admin of the tenant
):
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to invite users to this tenant")

    tenant_service = TenantService(db)
    ip_address = request.state.ip_address if hasattr(request.state, "ip_address") else request.client.host
    user_agent = request.state.user_agent if hasattr(request.state, "user_agent") else request.headers.get("user-agent")
    try:
        invitation = tenant_service.create_invitation(
            tenant_id, current_user.id, invitation_data.email, invitation_data.role,
            ip_address=ip_address, user_agent=user_agent
        )
        return invitation
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

@router.post("/invitations/accept/{token}", response_model=tenant_schemas.TenantInvitationResponse)
async def accept_tenant_invitation(
    token: str,
    request: Request, # For IP/User-Agent
    # Assuming the user accepting is already authenticated in the system, or has just signed up.
    # The `accepting_user_id` should come from the authenticated context.
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    tenant_service = TenantService(db)
    ip_address = request.state.ip_address if hasattr(request.state, "ip_address") else request.client.host
    user_agent = request.state.user_agent if hasattr(request.state, "user_agent") else request.headers.get("user-agent")
    try:
        # Pass current_user.id as accepting_user_id
        invitation = tenant_service.accept_invitation(token, current_user.id, ip_address=ip_address, user_agent=user_agent)
        if not invitation: # Should be handled by exceptions in service, but as a safeguard
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation acceptance failed")
        return invitation
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

@router.get("/tenants/{tenant_id}/invitations", response_model=List[tenant_schemas.TenantInvitationResponse])
async def list_tenant_invitations(
    tenant_id: int,
    status: Optional[str] = None, # Query param: pending, accepted, expired
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_user) # Only admin can see all invitations
):
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this tenant")
    invitations = TenantService(db).list_invitations(tenant_id, status)
    return invitations

@router.get("/invitations/{token}", response_model=tenant_schemas.TenantInvitationResponse)
async def get_invitation_details_by_token(token: str, db: Session = Depends(get_db)):
    # This might be a public endpoint or require some form of auth if token is guessable.
    invitation = TenantService(db).get_invitation_by_token(token)
    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    return invitation

# --- TenantAuditLog Endpoints ---
@router.get("/tenants/{tenant_id}/audit-logs", response_model=List[tenant_schemas.TenantAuditLogResponse])
async def list_tenant_audit_logs(
    tenant_id: int,
    user_id_filter: Optional[int] = None, # Query param user_id
    action_filter: Optional[str] = None, # Query param action
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_user) # Only admin can see audit logs
):
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this tenant")
    logs = TenantService(db).list_audit_logs(tenant_id, user_id_filter, action_filter, limit, offset)
    return logs

# --- User Management under Tenant ---
# These endpoints were partially in the old router. Consolidating and ensuring tenant context.
@router.post("/tenants/{tenant_id}/users/", response_model=tenant_schemas.UserBasicResponse, status_code=status.HTTP_201_CREATED)
async def create_user_for_tenant(
    tenant_id: int,
    user_data: tenant_schemas.UserCreateForTenant,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: UserModel = Depends(get_admin_user) # Admin of the tenant
):
    if current_admin.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create users for this tenant")

    tenant_service = TenantService(db)
    ip_address = request.state.ip_address if hasattr(request.state, "ip_address") else request.client.host
    user_agent = request.state.user_agent if hasattr(request.state, "user_agent") else request.headers.get("user-agent")
    try:
        user = tenant_service.create_user(
            tenant_id,
            user_data.model_dump(),
            current_admin_id=current_admin.id,
            ip_address=ip_address,
            user_agent=user_agent
            )
        return user # Ensure UserBasicResponse is compatible with User model or map fields
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

@router.get("/tenants/{tenant_id}/users/", response_model=List[tenant_schemas.UserBasicResponse])
async def list_users_for_tenant(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user) # User in tenant can see other users
):
    if current_user.tenant_id != tenant_id: # Or specific permission check
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this tenant")
    users = TenantService(db).get_tenant_users(tenant_id, skip, limit)
    return users


# Placeholder for Tenant Usage - requires service layer implementation
@router.get("/tenants/{tenant_id}/usage", response_model=tenant_schemas.TenantUsageResponse)
async def get_tenant_usage_info(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_user)
):
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this tenant")
    
    tenant = TenantService(db).get_tenant_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    
    # Basic implementation:
    current_user_count = db.query(UserModel).filter(UserModel.tenant_id == tenant_id).count()
    return tenant_schemas.TenantUsageResponse(
        tenant_id=tenant_id,
        current_user_count=current_user_count,
        max_users=tenant.max_users
    )

# Health check (can be in a general router too)
@router.get("/tenants-health/", tags=["Health"])
async def tenant_system_health_check():
    return {"status": "healthy", "service": "Tenant Management System"}

# Ensure user-related endpoints from old router (profile, password change) are handled by a separate user_router
# or if they are tenant-specific, ensure they are correctly scoped and secured here.
# E.g. /users/{user_id}/profile should be in a user_router.
# If /tenants/{tenant_id}/users/{user_id}/profile, then it's tenant-scoped.
# The old router had /users/{user_id}/permissions - this logic would now use TenantService.get_user_permissions.
# The old /authenticate was global - it should probably be in an auth_router.

# Example: Get permissions for a user within their tenant
@router.get("/users/{user_id}/permissions", response_model=List[str])
async def get_user_permissions_in_tenant(
    user_id: int, # User whose permissions are being fetched
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user) # Authenticated user
):
    # Logic:
    # 1. Fetch the user_to_check = UserService(db).get_user_by_id(user_id)
    # 2. Permission: current_user must be admin of user_to_check.tenant_id OR current_user.id == user_id
    user_to_check = UserService(db).get_user_by_id(user_id)
    if not user_to_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Simplified permission check:
    if current_user.id != user_id and current_user.tenant_id != user_to_check.tenant_id:
         # Add more granular check if current_user is admin of user_to_check's tenant
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view these permissions")

    permissions = TenantService(db).get_user_permissions(user_id)
    return permissions

```
