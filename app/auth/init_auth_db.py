"""
Authentication Database Initialization for Digame Platform

This script initializes the authentication system database with:
- Default roles and permissions
- Default admin user
- RBAC setup
"""

from sqlalchemy.orm import Session
from typing import List, Dict
import logging

from ..models.user import User
from ..models.rbac import Role, Permission
from ..crud.user_crud import create_user, get_user_by_email
from ..crud.rbac_crud import (
    create_role, create_permission, add_permission_to_role,
    assign_role_to_user, get_role_by_name, get_permission_by_name
)
from ..schemas.rbac_schemas import RoleCreate, PermissionCreate
from ..schemas.user_schemas import UserCreate
from .config import auth_settings, Permissions, Roles

# Configure logging
logger = logging.getLogger(__name__)

def create_default_permissions(db: Session) -> Dict[str, Permission]:
    """
    Create default permissions in the database
    
    Args:
        db: Database session
        
    Returns:
        Dictionary mapping permission names to Permission objects
    """
    logger.info("Creating default permissions...")
    
    permissions = {}
    permission_descriptions = {
        # User management
        Permissions.VIEW_USERS: "View user accounts",
        Permissions.CREATE_USERS: "Create new user accounts",
        Permissions.UPDATE_USERS: "Update user account information",
        Permissions.DELETE_USERS: "Delete user accounts",
        Permissions.MANAGE_USERS: "Full user management access",
        
        # Role and permission management
        Permissions.VIEW_ROLES: "View roles and their permissions",
        Permissions.CREATE_ROLES: "Create new roles",
        Permissions.UPDATE_ROLES: "Update existing roles",
        Permissions.DELETE_ROLES: "Delete roles",
        Permissions.MANAGE_ROLES: "Full role management access",
        
        Permissions.VIEW_PERMISSIONS: "View available permissions",
        Permissions.ASSIGN_PERMISSIONS: "Assign permissions to roles",
        Permissions.MANAGE_PERMISSIONS: "Full permission management access",
        
        # System administration
        Permissions.MANAGE_SYSTEM: "System administration access",
        Permissions.VIEW_SYSTEM_LOGS: "View system logs and audit trails",
        Permissions.MANAGE_SETTINGS: "Manage system settings and configuration",
        
        # Data access
        Permissions.VIEW_OWN_DATA: "View own data and information",
        Permissions.VIEW_ALL_DATA: "View all data in the system",
        Permissions.EXPORT_DATA: "Export data from the system",
        
        # Behavioral analysis
        Permissions.VIEW_BEHAVIORAL_MODELS: "View behavioral analysis models",
        Permissions.CREATE_BEHAVIORAL_MODELS: "Create new behavioral models",
        Permissions.UPDATE_BEHAVIORAL_MODELS: "Update behavioral models",
        Permissions.DELETE_BEHAVIORAL_MODELS: "Delete behavioral models",
        
        # Activity monitoring
        Permissions.VIEW_ACTIVITIES: "View activity logs and monitoring data",
        Permissions.CREATE_ACTIVITIES: "Create activity records",
        Permissions.UPDATE_ACTIVITIES: "Update activity information",
        Permissions.DELETE_ACTIVITIES: "Delete activity records",
        
        # Anomaly detection
        Permissions.VIEW_ANOMALIES: "View detected anomalies",
        Permissions.CREATE_ANOMALIES: "Create anomaly records",
        Permissions.UPDATE_ANOMALIES: "Update anomaly information",
        Permissions.DELETE_ANOMALIES: "Delete anomaly records",
        
        # Process notes
        Permissions.VIEW_PROCESS_NOTES: "View process notes and documentation",
        Permissions.CREATE_PROCESS_NOTES: "Create process notes",
        Permissions.UPDATE_PROCESS_NOTES: "Update process notes",
        Permissions.DELETE_PROCESS_NOTES: "Delete process notes",
    }
    
    for perm_name, description in permission_descriptions.items():
        # Check if permission already exists
        existing_perm = get_permission_by_name(db, perm_name)
        if not existing_perm:
            perm_create = PermissionCreate(name=perm_name, description=description)
            permission = create_permission(db, perm_create)
            permissions[perm_name] = permission
            logger.info(f"Created permission: {perm_name}")
        else:
            permissions[perm_name] = existing_perm
            logger.info(f"Permission already exists: {perm_name}")
    
    return permissions

def create_default_roles(db: Session, permissions: Dict[str, Permission]) -> Dict[str, Role]:
    """
    Create default roles and assign permissions
    
    Args:
        db: Database session
        permissions: Dictionary of available permissions
        
    Returns:
        Dictionary mapping role names to Role objects
    """
    logger.info("Creating default roles...")
    
    roles = {}
    role_descriptions = {
        Roles.SUPER_ADMIN: "Super Administrator with full system access",
        Roles.ADMINISTRATOR: "System Administrator with management privileges",
        Roles.MANAGER: "Manager with team and data oversight",
        Roles.ANALYST: "Data Analyst with analysis capabilities",
        Roles.USER: "Standard User with basic access",
        Roles.VIEWER: "Read-only access to own data",
    }
    
    for role_name, description in role_descriptions.items():
        # Check if role already exists
        existing_role = get_role_by_name(db, role_name)
        if not existing_role:
            role_create = RoleCreate(name=role_name, description=description)
            role = create_role(db, role_create)
            roles[role_name] = role
            logger.info(f"Created role: {role_name}")
        else:
            roles[role_name] = existing_role
            logger.info(f"Role already exists: {role_name}")
        
        # Assign permissions to role
        role_permissions = Roles.get_role_permissions(role_name)
        for perm_name in role_permissions:
            if perm_name in permissions:
                try:
                    add_permission_to_role(db, getattr(roles[role_name], 'id'), getattr(permissions[perm_name], 'id'))
                    logger.debug(f"Assigned permission {perm_name} to role {role_name}")
                except Exception as e:
                    # Permission might already be assigned
                    logger.debug(f"Permission {perm_name} already assigned to role {role_name}: {e}")
    
    return roles

def create_default_admin_user(db: Session, roles: Dict[str, Role]) -> User:
    """
    Create default admin user
    
    Args:
        db: Database session
        roles: Dictionary of available roles
        
    Returns:
        Created admin User object
    """
    logger.info("Creating default admin user...")
    
    # Check if admin user already exists
    admin_email = auth_settings.default_admin_email
    existing_admin = get_user_by_email(db, admin_email)
    
    if existing_admin:
        logger.info(f"Admin user already exists: {admin_email}")
        return existing_admin
    
    # Create admin user
    admin_data = UserCreate(
        username=auth_settings.default_admin_username,
        email=admin_email,
        password=auth_settings.default_admin_password,
        first_name="System",
        last_name="Administrator",
        is_active=True
    )
    
    admin_user = create_user(db, admin_data)
    
    # Assign admin role
    if Roles.SUPER_ADMIN in roles:
        assign_role_to_user(db, getattr(admin_user, 'id'), getattr(roles[Roles.SUPER_ADMIN], 'id'))
        logger.info(f"Assigned {Roles.SUPER_ADMIN} role to admin user")
    
    logger.info(f"Created default admin user: {admin_email}")
    logger.warning(f"Default admin password is '{auth_settings.default_admin_password}' - CHANGE THIS IN PRODUCTION!")
    
    return admin_user

def initialize_auth_database(db: Session) -> bool:
    """
    Initialize the authentication database with default data
    
    Args:
        db: Database session
        
    Returns:
        True if initialization was successful
    """
    try:
        logger.info("Starting authentication database initialization...")
        
        # Create default permissions
        permissions = create_default_permissions(db)
        
        # Create default roles and assign permissions
        roles = create_default_roles(db, permissions)
        
        # Create default admin user if enabled
        if auth_settings.create_default_admin:
            create_default_admin_user(db, roles)
        
        # Commit all changes
        db.commit()
        
        logger.info("Authentication database initialization completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Authentication database initialization failed: {str(e)}")
        db.rollback()
        return False

def verify_auth_setup(db: Session) -> Dict[str, bool]:
    """
    Verify that the authentication setup is correct
    
    Args:
        db: Database session
        
    Returns:
        Dictionary with verification results
    """
    logger.info("Verifying authentication setup...")
    
    results = {
        "permissions_created": False,
        "roles_created": False,
        "admin_user_created": False,
        "role_permissions_assigned": False
    }
    
    try:
        # Check permissions
        all_permissions = Permissions.get_all_permissions()
        existing_permissions = [
            get_permission_by_name(db, perm) for perm in all_permissions
        ]
        results["permissions_created"] = all(perm is not None for perm in existing_permissions)
        
        # Check roles
        all_roles = Roles.get_all_roles()
        existing_roles = [
            get_role_by_name(db, role) for role in all_roles
        ]
        results["roles_created"] = all(role is not None for role in existing_roles)
        
        # Check admin user
        admin_user = get_user_by_email(db, auth_settings.default_admin_email)
        results["admin_user_created"] = admin_user is not None
        
        # Check role-permission assignments (simplified check)
        admin_role = get_role_by_name(db, Roles.SUPER_ADMIN)
        if admin_role and hasattr(admin_role, 'permissions'):
            results["role_permissions_assigned"] = len(admin_role.permissions) > 0
        
        logger.info(f"Authentication setup verification: {results}")
        return results
        
    except Exception as e:
        logger.error(f"Authentication setup verification failed: {str(e)}")
        return results

def reset_auth_database(db: Session) -> bool:
    """
    Reset the authentication database (WARNING: This will delete all auth data!)
    
    Args:
        db: Database session
        
    Returns:
        True if reset was successful
    """
    logger.warning("RESETTING AUTHENTICATION DATABASE - ALL AUTH DATA WILL BE LOST!")
    
    try:
        # Delete all users (this will cascade to user_roles)
        db.query(User).delete()
        
        # Delete all role_permissions associations
        from ..models.rbac import role_permissions_table
        db.execute(role_permissions_table.delete())
        
        # Delete all roles
        db.query(Role).delete()
        
        # Delete all permissions
        db.query(Permission).delete()
        
        db.commit()
        
        logger.info("Authentication database reset completed")
        return True
        
    except Exception as e:
        logger.error(f"Authentication database reset failed: {str(e)}")
        db.rollback()
        return False

# CLI-style functions for manual execution
def main():
    """Main function for running auth database initialization"""
    from ..db import get_db
    
    # Get database session
    db = next(get_db())
    
    try:
        # Initialize authentication database
        success = initialize_auth_database(db)
        
        if success:
            # Verify setup
            verification = verify_auth_setup(db)
            
            print("Authentication Database Initialization Results:")
            print("=" * 50)
            print(f"Permissions created: {'✅' if verification['permissions_created'] else '❌'}")
            print(f"Roles created: {'✅' if verification['roles_created'] else '❌'}")
            print(f"Admin user created: {'✅' if verification['admin_user_created'] else '❌'}")
            print(f"Role permissions assigned: {'✅' if verification['role_permissions_assigned'] else '❌'}")
            print("=" * 50)
            
            if all(verification.values()):
                print("🎉 Authentication system initialized successfully!")
            else:
                print("⚠️  Some components may not have been initialized correctly.")
        else:
            print("❌ Authentication database initialization failed!")
            
    finally:
        db.close()

if __name__ == "__main__":
    main()