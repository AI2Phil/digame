from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from digame.app.models.user import User
from digame.app.models.rbac import Role, Permission
from digame.app.schemas.rbac_schemas import RoleCreate, RoleUpdate, PermissionCreate, PermissionUpdate

# --- Role CRUD Operations ---

def get_role(db: Session, role_id: int) -> Optional[Role]:
    return db.query(Role).options(joinedload(Role.permissions)).filter(Role.id == role_id).first()

def get_role_by_name(db: Session, role_name: str) -> Optional[Role]:
    return db.query(Role).options(joinedload(Role.permissions)).filter(Role.name == role_name).first()

def get_roles(db: Session, skip: int = 0, limit: int = 100) -> List[Role]:
    return db.query(Role).options(joinedload(Role.permissions)).offset(skip).limit(limit).all()

def create_role(db: Session, role: RoleCreate) -> Role:
    db_role = Role(name=role.name, description=role.description)
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def update_role(db: Session, role_id: int, role_update: RoleUpdate) -> Optional[Role]:
    db_role = get_role(db, role_id)
    if db_role:
        if role_update.name is not None:
            db_role.name = role_update.name
        if role_update.description is not None:
            db_role.description = role_update.description
        # Note: Updating permissions list directly here would require more logic (e.g., fetching Permission objects by ID)
        # This basic update only handles name and description.
        db.commit()
        db.refresh(db_role)
    return db_role

def delete_role(db: Session, role_id: int) -> bool:
    db_role = get_role(db, role_id)
    if db_role:
        # Consider implications: what if users have this role?
        # Depending on DB constraints, this might fail or orphan user_role entries if not handled.
        # For simplicity, direct delete. Add cascading deletes or checks as needed.
        db.delete(db_role)
        db.commit()
        return True
    return False

# --- Permission CRUD Operations ---

def get_permission(db: Session, permission_id: int) -> Optional[Permission]:
    return db.query(Permission).filter(Permission.id == permission_id).first()

def get_permission_by_name(db: Session, permission_name: str) -> Optional[Permission]:
    return db.query(Permission).filter(Permission.name == permission_name).first()

def get_permissions(db: Session, skip: int = 0, limit: int = 100) -> List[Permission]:
    return db.query(Permission).offset(skip).limit(limit).all()

def create_permission(db: Session, permission: PermissionCreate) -> Permission:
    db_permission = Permission(name=permission.name, description=permission.description)
    db.add(db_permission)
    db.commit()
    db.refresh(db_permission)
    return db_permission

def update_permission(db: Session, permission_id: int, permission_update: PermissionUpdate) -> Optional[Permission]:
    db_permission = get_permission(db, permission_id)
    if db_permission:
        if permission_update.name is not None:
            db_permission.name = permission_update.name
        if permission_update.description is not None:
            db_permission.description = permission_update.description
        db.commit()
        db.refresh(db_permission)
    return db_permission
    
def delete_permission(db: Session, permission_id: int) -> bool:
    db_permission = get_permission(db, permission_id)
    if db_permission:
        # Similar to roles, consider implications for roles that have this permission.
        db.delete(db_permission)
        db.commit()
        return True
    return False

# --- Assignment Operations ---

def assign_role_to_user(db: Session, user_id: int, role_id: int) -> Optional[User]:
    user = db.query(User).options(joinedload(User.roles)).filter(User.id == user_id).first()
    role = get_role(db, role_id)
    if user and role:
        if role not in user.roles:
            user.roles.append(role)
            db.commit()
            db.refresh(user)
        return user
    return None

def remove_role_from_user(db: Session, user_id: int, role_id: int) -> Optional[User]:
    user = db.query(User).options(joinedload(User.roles)).filter(User.id == user_id).first()
    role = get_role(db, role_id) # Fetch the role to ensure it exists
    if user and role:
        if role in user.roles:
            user.roles.remove(role)
            db.commit()
            db.refresh(user)
        return user
    return None

def add_permission_to_role(db: Session, role_id: int, permission_id: int) -> Optional[Role]:
    role = get_role(db, role_id) # This already loads role.permissions due to joinedload in get_role
    permission = get_permission(db, permission_id)
    if role and permission:
        if permission not in role.permissions:
            role.permissions.append(permission)
            db.commit()
            db.refresh(role) # Refresh to see updated role.permissions list immediately
        return role
    return None

def remove_permission_from_role(db: Session, role_id: int, permission_id: int) -> Optional[Role]:
    role = get_role(db, role_id) # Loads role.permissions
    permission = get_permission(db, permission_id)
    if role and permission:
        if permission in role.permissions:
            role.permissions.remove(permission)
            db.commit()
            db.refresh(role)
        return role
    return None

# Helper for assigning by name (used by endpoints that take names)
def assign_role_to_user_by_names(db: Session, user_id: int, role_name: str) -> Optional[User]:
    user = db.query(User).options(joinedload(User.roles)).filter(User.id == user_id).first()
    role = get_role_by_name(db, role_name)
    if user and role:
        if role not in user.roles:
            user.roles.append(role)
            db.commit()
            db.refresh(user)
        return user
    return None

def remove_role_from_user_by_names(db: Session, user_id: int, role_name: str) -> Optional[User]:
    user = db.query(User).options(joinedload(User.roles)).filter(User.id == user_id).first()
    role = get_role_by_name(db, role_name)
    if user and role:
        if role in user.roles:
            user.roles.remove(role)
            db.commit()
            db.refresh(user)
        return user
    return None

def add_permission_to_role_by_names(db: Session, role_name: str, permission_name: str) -> Optional[Role]:
    role = get_role_by_name(db, role_name)
    permission = get_permission_by_name(db, permission_name)
    if role and permission:
        if permission not in role.permissions:
            role.permissions.append(permission)
            db.commit()
            db.refresh(role)
        return role
    return None

def remove_permission_from_role_by_names(db: Session, role_name: str, permission_name: str) -> Optional[Role]:
    role = get_role_by_name(db, role_name)
    permission = get_permission_by_name(db, permission_name)
    if role and permission:
        if permission in role.permissions:
            role.permissions.remove(permission)
            db.commit()
            db.refresh(role)
        return role
    return None
