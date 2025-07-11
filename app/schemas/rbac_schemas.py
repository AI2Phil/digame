from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Permission Schemas ---
class PermissionBase(BaseModel):
    name: str
    description: Optional[str] = None

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(BaseModel): # Don't inherit from PermissionBase to avoid type conflicts
    name: Optional[str] = None
    description: Optional[str] = None

class PermissionResponse(PermissionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# --- Role Schemas ---
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel): # Don't inherit from RoleBase to avoid type conflicts
    name: Optional[str] = None
    description: Optional[str] = None
    # permissions: Optional[List[int]] = None # For updating permissions by ID list

class RoleResponse(RoleBase):
    id: int
    created_at: datetime
    updated_at: datetime
    permissions: List[PermissionResponse] = [] # Show permissions associated with the role

    model_config = {"from_attributes": True}
class UserRoleAssignRequest(BaseModel):
    user_id: int
    role_name: str # Using name for role assignment might be more user-friendly than ID

class UserRoleRemoveRequest(BaseModel): # Similar to assign for consistency
    user_id: int
    role_name: str

class RolePermissionAssignRequest(BaseModel):
    role_name: str
    permission_name: str # Using names for assignment

class RolePermissionRemoveRequest(BaseModel): # Similar to assign
    role_name: str
    permission_name: str

# --- Response for User with Roles (example, can be in user_schemas.py) ---
# This is just to illustrate how a User response might include roles.
# Actual User schemas should be in a dedicated user_schemas.py file.
class UserMinimumResponse(BaseModel): # A very basic User representation
    id: int
    username: str
    is_active: bool

    model_config = {"from_attributes": True}
class RoleBasicResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class UserWithRolesResponse(UserMinimumResponse):
    roles: List[RoleBasicResponse] = [] # Use simplified role response to avoid deep nesting
    
    @classmethod
    def from_user(cls, user):
        """Custom factory method to safely serialize User with roles"""
        return cls(
            id=user.id,
            username=user.username,
            is_active=user.is_active,
            roles=[
                RoleBasicResponse(
                    id=role.id,
                    name=role.name,
                    description=role.description,
                    created_at=role.created_at,
                    updated_at=role.updated_at
                ) for role in user.get_roles()
            ]
        )
