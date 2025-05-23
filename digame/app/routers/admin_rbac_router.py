from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..crud import rbac_crud
from ..schemas import rbac_schemas
from ..models import user as user_model_sqla # SQLAlchemy model for User
from ..db import get_db # Import get_db from the new db module
# For now, we won't have current_user dependency as we are not protecting routes yet.
from ..auth.auth_dependencies import get_current_active_admin_user # Import the protection dependency

# --- Database Dependency ---
# We now import get_db from digame.app.db to avoid circular imports
# This is just a comment block explaining the dependency injection pattern
# The actual get_db function is imported from digame.app.db


router = APIRouter(
    tags=["Admin RBAC Management"],
    dependencies=[Depends(get_current_active_admin_user)], # Protect all routes in this router
)

# --- Roles Endpoints ---
# No changes needed for individual endpoint signatures regarding auth, router dependency handles it.
@router.post("/roles/", response_model=rbac_schemas.RoleResponse, status_code=status.HTTP_201_CREATED)
def create_new_role(role: rbac_schemas.RoleCreate, db: Session = Depends(get_db)):
    db_role = rbac_crud.get_role_by_name(db, role_name=role.name)
    if db_role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role with this name already exists")
    return rbac_crud.create_role(db=db, role=role)

@router.get("/roles/", response_model=List[rbac_schemas.RoleResponse])
def read_all_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    roles = rbac_crud.get_roles(db, skip=skip, limit=limit)
    return roles

@router.get("/roles/{role_id}", response_model=rbac_schemas.RoleResponse)
def read_single_role(role_id: int, db: Session = Depends(get_db)):
    db_role = rbac_crud.get_role(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    return db_role

@router.put("/roles/{role_id}", response_model=rbac_schemas.RoleResponse)
def update_existing_role(role_id: int, role: rbac_schemas.RoleUpdate, db: Session = Depends(get_db)):
    db_role = rbac_crud.get_role(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    # Check if new name conflicts with another existing role
    if role.name:
        existing_role_with_new_name = rbac_crud.get_role_by_name(db, role_name=role.name)
        if existing_role_with_new_name and existing_role_with_new_name.id != role_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Another role with this name already exists")
    return rbac_crud.update_role(db=db, role_id=role_id, role_update=role)

@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_role(role_id: int, db: Session = Depends(get_db)):
    success = rbac_crud.delete_role(db, role_id=role_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    return {"ok": True} # Or no content

# --- Permissions Endpoints ---
@router.post("/permissions/", response_model=rbac_schemas.PermissionResponse, status_code=status.HTTP_201_CREATED)
def create_new_permission(permission: rbac_schemas.PermissionCreate, db: Session = Depends(get_db)):
    db_permission = rbac_crud.get_permission_by_name(db, permission_name=permission.name)
    if db_permission:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Permission with this name already exists")
    return rbac_crud.create_permission(db=db, permission=permission)

@router.get("/permissions/", response_model=List[rbac_schemas.PermissionResponse])
def read_all_permissions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    permissions = rbac_crud.get_permissions(db, skip=skip, limit=limit)
    return permissions

@router.get("/permissions/{permission_id}", response_model=rbac_schemas.PermissionResponse)
def read_single_permission(permission_id: int, db: Session = Depends(get_db)):
    db_permission = rbac_crud.get_permission(db, permission_id=permission_id)
    if db_permission is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")
    return db_permission

# PUT and DELETE for permissions are less common if they are code-defined or migration-managed.
# If they are dynamically managed:
@router.put("/permissions/{permission_id}", response_model=rbac_schemas.PermissionResponse)
def update_existing_permission(permission_id: int, permission: rbac_schemas.PermissionUpdate, db: Session = Depends(get_db)):
    db_permission = rbac_crud.get_permission(db, permission_id=permission_id)
    if db_permission is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")
    if permission.name:
        existing_perm_with_new_name = rbac_crud.get_permission_by_name(db, permission_name=permission.name)
        if existing_perm_with_new_name and existing_perm_with_new_name.id != permission_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Another permission with this name already exists")
    return rbac_crud.update_permission(db=db, permission_id=permission_id, permission_update=permission)

@router.delete("/permissions/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_permission(permission_id: int, db: Session = Depends(get_db)):
    success = rbac_crud.delete_permission(db, permission_id=permission_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")
    return {"ok": True}


# --- Assignment Endpoints ---
# Using names for assignment as per schemas for user-friendliness

@router.post("/users/assign-role", response_model=rbac_schemas.UserWithRolesResponse) # Adjust response model as needed
def assign_role_to_user_endpoint(assignment: rbac_schemas.UserRoleAssignRequest, db: Session = Depends(get_db)):
    user = rbac_crud.assign_role_to_user_by_names(db, user_id=assignment.user_id, role_name=assignment.role_name)
    if user is None:
        # More specific error: user not found or role not found
        db_user = db.query(user_model_sqla.User).filter(user_model_sqla.User.id == assignment.user_id).first()
        if not db_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {assignment.user_id} not found.")
        db_role = rbac_crud.get_role_by_name(db, role_name=assignment.role_name)
        if not db_role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Role '{assignment.role_name}' not found.")
        # If both exist but assignment failed for other reasons (e.g. already assigned, though current crud handles it)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not assign role to user.")
    return user # This user object will have its roles loaded due to `assign_role_to_user_by_names`

@router.post("/users/remove-role", response_model=rbac_schemas.UserWithRolesResponse) # Adjust response model
def remove_role_from_user_endpoint(assignment: rbac_schemas.UserRoleRemoveRequest, db: Session = Depends(get_db)):
    user = rbac_crud.remove_role_from_user_by_names(db, user_id=assignment.user_id, role_name=assignment.role_name)
    if user is None:
        db_user = db.query(user_model_sqla.User).filter(user_model_sqla.User.id == assignment.user_id).first()
        if not db_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {assignment.user_id} not found.")
        db_role = rbac_crud.get_role_by_name(db, role_name=assignment.role_name)
        if not db_role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Role '{assignment.role_name}' not found.")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not remove role from user.")
    return user

@router.post("/roles/add-permission", response_model=rbac_schemas.RoleResponse)
def add_permission_to_role_endpoint(assignment: rbac_schemas.RolePermissionAssignRequest, db: Session = Depends(get_db)):
    role = rbac_crud.add_permission_to_role_by_names(db, role_name=assignment.role_name, permission_name=assignment.permission_name)
    if role is None:
        db_role = rbac_crud.get_role_by_name(db, role_name=assignment.role_name)
        if not db_role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Role '{assignment.role_name}' not found.")
        db_perm = rbac_crud.get_permission_by_name(db, permission_name=assignment.permission_name)
        if not db_perm:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Permission '{assignment.permission_name}' not found.")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not add permission to role.")
    return role

@router.post("/roles/remove-permission", response_model=rbac_schemas.RoleResponse)
def remove_permission_from_role_endpoint(assignment: rbac_schemas.RolePermissionRemoveRequest, db: Session = Depends(get_db)):
    role = rbac_crud.remove_permission_from_role_by_names(db, role_name=assignment.role_name, permission_name=assignment.permission_name)
    if role is None:
        db_role = rbac_crud.get_role_by_name(db, role_name=assignment.role_name)
        if not db_role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Role '{assignment.role_name}' not found.")
        db_perm = rbac_crud.get_permission_by_name(db, permission_name=assignment.permission_name)
        if not db_perm:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Permission '{assignment.permission_name}' not found.")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not remove permission from role.")
    return role

# Remember to include this router in your main FastAPI app (e.g., in main.py)
# from digame.app.routers import admin_rbac_router
# app.include_router(admin_rbac_router.router)

# Also, ensure that a proper `get_db` dependency that yields a SQLAlchemy session
# is available and used. The placeholder above will not work.
# For example, in a `digame/app/dependencies.py` or `digame/app/db/session.py`
# you would have the actual `get_db` implementation.
# from .dependencies import get_db (or similar)
# Then use that in Depends(get_db).
# The schemas import `from digame.app import crud, schemas` assumes that
# `digame/app/__init__.py` makes `crud` and `schemas` available, or you adjust the import paths.
# e.g., from digame.app.crud import rbac_crud
# e.g., from digame.app.schemas import rbac_schemas
# Corrected imports for crud and schemas:
# from digame.app.crud import rbac_crud
# from digame.app.schemas import rbac_schemas
# The `from digame.app import crud, schemas` might work if `digame/app/__init__.py` exports them.
# For clarity, direct imports are often better. I'll adjust the imports in the file to be direct.I've created `digame/app/routers/admin_rbac_router.py` with the initial set of unprotected RBAC management endpoints in the previous step. I also defined a placeholder `get_db` dependency within that file.

# Now, I will refine the imports in `admin_rbac_router.py` to be more direct and explicit, as noted at the end of the previous file creation.
# This improves clarity and avoids reliance on `__init__.py` files exporting modules.

# Specifically, I will change:
# `from digame.app import crud, schemas`
# to:
# `from digame.app.crud import rbac_crud`
# `from digame.app.schemas import rbac_schemas`
#
# And `from digame.app.models import user as user_model` to `from digame.app.models import user as user_model_sqla`
# (or similar to distinguish from Pydantic user models if they were in the same file, though here it's just for SQLAlchemy type hinting).
# The `schemas.rbac_schemas` and `crud.rbac_crud` will then be used directly.
