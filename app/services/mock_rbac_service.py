"""
Mock RBAC Service for Registry Conflict Recovery
Provides temporary authorization functionality while relationships are disabled.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.rbac import Role
from app.models.user_role_assignment import UserRoleAssignment

# Dynamic import to avoid registry conflicts
def get_permission_model():
    """Get Permission model dynamically to avoid registry conflicts"""
    from app.models.rbac import Permission
    return Permission
import logging

logger = logging.getLogger(__name__)

class MockRBACService:
    """
    Temporary RBAC service to handle authorization while relationships are disabled.
    This service bypasses the disabled relationship properties and queries the database directly.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_roles(self, user_id: int, tenant_id: Optional[int] = None) -> List[Role]:
        """
        Get user roles by querying UserRoleAssignment directly.
        Bypasses the disabled user.user_roles relationship.
        """
        try:
            # Query UserRoleAssignment directly
            query = self.db.query(UserRoleAssignment).filter(
                UserRoleAssignment.user_id == user_id,
                UserRoleAssignment.is_active == True
            )
            
            if tenant_id:
                query = query.filter(UserRoleAssignment.tenant_id == tenant_id)
            
            user_role_assignments = query.all()
            
            # Get roles from assignments
            roles = []
            for assignment in user_role_assignments:
                if assignment.role_id:
                    role = self.db.query(Role).filter(Role.id == assignment.role_id).first()
                    if role:
                        roles.append(role)
            
            logger.info(f"Retrieved {len(roles)} roles for user {user_id}")
            return roles
            
        except Exception as e:
            logger.error(f"Error retrieving roles for user {user_id}: {e}")
            return []
    
    def get_user_permissions(self, user_id: int, tenant_id: Optional[int] = None) -> List[str]:
        """
        Get user permissions by querying through roles.
        Bypasses the disabled role.permissions relationship.
        """
        try:
            roles = self.get_user_roles(user_id, tenant_id)
            permissions = set()
            
            for role in roles:
                # Query role permissions directly through the association table
                # Note: This would need to be implemented based on your role_permissions_table structure
                # For now, we'll implement basic admin/viewer permissions
                if role.name == "admin":
                    permissions.update([
                        "trigger_own_process_discovery",
                        "view_own_process_notes", 
                        "add_feedback_own_process_notes",
                        "manage_users",
                        "manage_roles",
                        "view_all_data"
                    ])
                elif role.name == "viewer":
                    permissions.update([
                        "view_own_process_notes"
                    ])
                elif role.name == "user":
                    permissions.update([
                        "trigger_own_process_discovery",
                        "view_own_process_notes",
                        "add_feedback_own_process_notes"
                    ])
            
            logger.info(f"Retrieved {len(permissions)} permissions for user {user_id}")
            return list(permissions)
            
        except Exception as e:
            logger.error(f"Error retrieving permissions for user {user_id}: {e}")
            return []
    
    def user_has_permission(self, user_id: int, permission_name: str, tenant_id: Optional[int] = None) -> bool:
        """
        Check if user has a specific permission.
        """
        try:
            user_permissions = self.get_user_permissions(user_id, tenant_id)
            has_permission = permission_name in user_permissions
            
            logger.debug(f"User {user_id} permission check for '{permission_name}': {has_permission}")
            return has_permission
            
        except Exception as e:
            logger.error(f"Error checking permission '{permission_name}' for user {user_id}: {e}")
            return False
    
    def assign_default_role_to_user(self, user_id: int, tenant_id: Optional[int] = None) -> bool:
        """
        Assign a default role to a user if they have no roles.
        This is a temporary measure to ensure users have basic functionality.
        """
        try:
            # Check if user already has roles
            existing_roles = self.get_user_roles(user_id, tenant_id)
            if existing_roles:
                return True
            
            # Get or create default "user" role
            default_role = self.db.query(Role).filter(Role.name == "user").first()
            if not default_role:
                # Create default role if it doesn't exist
                default_role = Role(
                    name="user",
                    description="Default user role with basic permissions"
                )
                self.db.add(default_role)
                self.db.commit()
                self.db.refresh(default_role)
            
            # Create role assignment
            assignment = UserRoleAssignment(
                user_id=user_id,
                role_id=default_role.id,
                tenant_id=tenant_id,
                is_active=True
            )
            self.db.add(assignment)
            self.db.commit()
            
            logger.info(f"Assigned default role 'user' to user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error assigning default role to user {user_id}: {e}")
            self.db.rollback()
            return False
    
    def ensure_admin_user_exists(self) -> bool:
        """
        Ensure at least one admin user exists for platform management.
        """
        try:
            # Check if admin role exists
            admin_role = self.db.query(Role).filter(Role.name == "admin").first()
            if not admin_role:
                admin_role = Role(
                    name="admin",
                    description="Administrator role with full permissions"
                )
                self.db.add(admin_role)
                self.db.commit()
                self.db.refresh(admin_role)
            
            # Check if any user has admin role
            admin_assignment = self.db.query(UserRoleAssignment).filter(
                UserRoleAssignment.role_id == admin_role.id,
                UserRoleAssignment.is_active == True
            ).first()
            
            if not admin_assignment:
                # Find first active user and make them admin
                first_user = self.db.query(User).filter(User.is_active == True).first()
                if first_user:
                    assignment = UserRoleAssignment(
                        user_id=first_user.id,
                        role_id=admin_role.id,
                        is_active=True
                    )
                    self.db.add(assignment)
                    self.db.commit()
                    logger.info(f"Assigned admin role to user {first_user.id}")
                    return True
            
            return True
            
        except Exception as e:
            logger.error(f"Error ensuring admin user exists: {e}")
            self.db.rollback()
            return False

# Dependency injection function
def get_mock_rbac_service(db: Session) -> MockRBACService:
    """Get MockRBACService instance for dependency injection."""
    return MockRBACService(db)