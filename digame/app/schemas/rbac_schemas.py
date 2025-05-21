from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Permission Schemas ---
class PermissionBase(BaseModel):
    name: str
    description: Optional[str] = None

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(PermissionBase): # If partial updates are allowed, make fields Optional
    name: Optional[str] = None
    description: Optional[str] = None

class PermissionResponse(PermissionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True # For SQLAlchemy model conversion

# --- Role Schemas ---
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase): # If partial updates are allowed, make fields Optional
    name: Optional[str] = None
    description: Optional[str] = None
    # permissions: Optional[List[int]] = None # For updating permissions by ID list

class RoleResponse(RoleBase):
    id: int
    created_at: datetime
    updated_at: datetime
    permissions: List[PermissionResponse] = [] # Show permissions associated with the role

    class Config:
        orm_mode = True

# --- Assignment Schemas ---
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

    class Config:
        orm_mode = True

class UserWithRolesResponse(UserMinimumResponse):
    roles: List[RoleResponse] = [] # Or List[RoleBase] if full permission details are not needed here

    class Config:
        orm_mode = True
