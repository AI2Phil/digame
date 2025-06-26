"""
Enhanced RBAC Service with Tenant Awareness
Provides tenant-scoped role and permission management
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta

from ..models.user import User
from ..models.rbac import Role, Permission, UserRole
from ..models.tenant import Tenant
from ..database import get_db


class RBACService:
    """Enhanced RBAC service with tenant awareness"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def assign_role_to_user(
        self, 
        user_id: int, 
        role_id: int, 
        tenant_id: Optional[int] = None,
        assigned_by: Optional[int] = None,
        expires_at: Optional[datetime] = None
    ) -> UserRole:
        """
        Assign role to user with optional tenant scoping
        
        Args:
            user_id: ID of the user to assign role to
            role_id: ID of the role to assign
            tenant_id: Optional tenant ID for tenant-scoped assignment
            assigned_by: Optional ID of user making the assignment
            expires_at: Optional expiration date for the role assignment
            
        Returns:
            UserRole: The created user role assignment
            
        Raises:
            ValueError: If user or role doesn't exist, or if assignment already exists
        """
        
        # Validate user exists
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        # Validate role exists
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise ValueError(f"Role with ID {role_id} not found")
        
        # Check if assignment already exists
        existing = self.db.query(UserRole).filter(
            and_(
                UserRole.user_id == user_id,
                UserRole.role_id == role_id,
                UserRole.tenant_id == tenant_id,
                UserRole.is_active == True
            )
        ).first()
        
        if existing:
            raise ValueError(f"User {user_id} already has role {role_id} in tenant {tenant_id}")
        
        # Create new role assignment
        user_role = UserRole(
            user_id=user_id,
            role_id=role_id,
            tenant_id=tenant_id,
            assigned_by=assigned_by,
            assigned_at=datetime.utcnow(),
            expires_at=expires_at,
            is_active=True
        )
        
        self.db.add(user_role)
        self.db.commit()
        self.db.refresh(user_role)
        
        return user_role
    
    def remove_role_from_user(
        self, 
        user_id: int, 
        role_id: int, 
        tenant_id: Optional[int] = None
    ) -> bool:
        """
        Remove role from user in specified tenant context
        
        Args:
            user_id: ID of the user
            role_id: ID of the role to remove
            tenant_id: Optional tenant ID for tenant-scoped removal
            
        Returns:
            bool: True if role was removed, False if assignment didn't exist
        """
        
        user_role = self.db.query(UserRole).filter(
            and_(
                UserRole.user_id == user_id,
                UserRole.role_id == role_id,
                UserRole.tenant_id == tenant_id,
                UserRole.is_active == True
            )
        ).first()
        
        if not user_role:
            return False
        
        user_role.is_active = False
        self.db.commit()
        
        return True
    
    def get_user_roles(
        self, 
        user_id: int, 
        tenant_id: Optional[int] = None,
        include_expired: bool = False
    ) -> List[UserRole]:
        """
        Get user roles, optionally filtered by tenant
        
        Args:
            user_id: ID of the user
            tenant_id: Optional tenant ID to filter by
            include_expired: Whether to include expired role assignments
            
        Returns:
            List[UserRole]: List of user role assignments
        """
        
        query = self.db.query(UserRole).filter(
            and_(
                UserRole.user_id == user_id,
                UserRole.is_active == True
            )
        )
        
        # Filter by tenant if specified
        if tenant_id is not None:
            query = query.filter(UserRole.tenant_id == tenant_id)
        
        # Filter out expired roles unless requested
        if not include_expired:
            query = query.filter(
                or_(
                    UserRole.expires_at.is_(None),
                    UserRole.expires_at > datetime.utcnow()
                )
            )
        
        return query.all()
    
    def get_user_permissions(
        self, 
        user_id: int, 
        tenant_id: Optional[int] = None
    ) -> List[str]:
        """
        Get all permissions for a user in a tenant context
        
        Args:
            user_id: ID of the user
            tenant_id: Optional tenant ID to filter by
            
        Returns:
            List[str]: List of permission names
        """
        
        # Get user roles
        user_roles = self.get_user_roles(user_id, tenant_id)
        
        if not user_roles:
            return []
        
        # Get all permissions from those roles
        role_ids = [ur.role_id for ur in user_roles]
        
        permissions = self.db.query(Permission).join(
            Permission.roles
        ).filter(
            Role.id.in_(role_ids)
        ).distinct().all()
        
        return [p.name for p in permissions]
    
    def check_permission(
        self, 
        user_id: int, 
        permission: str, 
        tenant_id: Optional[int] = None
    ) -> bool:
        """
        Check if user has permission, with tenant context
        
        Args:
            user_id: ID of the user
            permission: Permission name to check
            tenant_id: Optional tenant ID for context
            
        Returns:
            bool: True if user has the permission
        """
        
        user_permissions = self.get_user_permissions(user_id, tenant_id)
        return permission in user_permissions
    
    def get_tenant_users_with_role(
        self, 
        tenant_id: int, 
        role_name: str
    ) -> List[User]:
        """
        Get all users in a tenant with a specific role
        
        Args:
            tenant_id: ID of the tenant
            role_name: Name of the role
            
        Returns:
            List[User]: List of users with the role in the tenant
        """
        
        users = self.db.query(User).join(
            UserRole, User.id == UserRole.user_id
        ).join(
            Role, UserRole.role_id == Role.id
        ).filter(
            and_(
                UserRole.tenant_id == tenant_id,
                Role.name == role_name,
                UserRole.is_active == True,
                or_(
                    UserRole.expires_at.is_(None),
                    UserRole.expires_at > datetime.utcnow()
                )
            )
        ).distinct().all()
        
        return users
    
    def create_tenant_role(
        self, 
        name: str, 
        description: str, 
        tenant_id: int,
        permissions: Optional[List[str]] = None
    ) -> Role:
        """
        Create a tenant-specific role
        
        Args:
            name: Role name
            description: Role description
            tenant_id: ID of the tenant
            permissions: Optional list of permission names to assign
            
        Returns:
            Role: The created role
        """
        
        # Check if role already exists for this tenant
        existing = self.db.query(Role).filter(
            and_(
                Role.name == name,
                Role.tenant_id == tenant_id
            )
        ).first()
        
        if existing:
            raise ValueError(f"Role '{name}' already exists for tenant {tenant_id}")
        
        # Create role
        role = Role(
            name=name,
            description=description,
            tenant_id=tenant_id
        )
        
        self.db.add(role)
        self.db.flush()  # Get the ID
        
        # Assign permissions if provided
        if permissions:
            permission_objects = self.db.query(Permission).filter(
                Permission.name.in_(permissions)
            ).all()
            
            role.permissions.extend(permission_objects)
        
        self.db.commit()
        self.db.refresh(role)
        
        return role
    
    def cleanup_expired_roles(self) -> int:
        """
        Deactivate expired role assignments
        
        Returns:
            int: Number of role assignments deactivated
        """
        
        expired_roles = self.db.query(UserRole).filter(
            and_(
                UserRole.is_active == True,
                UserRole.expires_at.isnot(None),
                UserRole.expires_at <= datetime.utcnow()
            )
        ).all()
        
        count = len(expired_roles)
        
        for user_role in expired_roles:
            user_role.is_active = False
        
        self.db.commit()
        
        return count


def get_rbac_service(db: Optional[Session] = None) -> RBACService:
    """
    Factory function to get RBAC service instance
    
    Args:
        db: Optional database session, will create one if not provided
        
    Returns:
        RBACService: Configured RBAC service instance
    """
    if db is None:
        db = next(get_db())
    
    return RBACService(db)


# Backward compatibility functions for existing code
def user_has_permission(user, permission_name: str, tenant_id: Optional[int] = None) -> bool:
    """
    Backward compatibility function for checking user permissions
    
    Args:
        user: User object (SQLAlchemy model)
        permission_name: Name of the permission to check
        tenant_id: Optional tenant ID for context
        
    Returns:
        bool: True if user has the permission
    """
    # For mock users (used in auth_dependencies), check roles directly
    if hasattr(user, 'roles') and hasattr(user.roles[0] if user.roles else None, 'permissions'):
        # This is a mock user from auth_dependencies
        for role in user.roles:
            for permission in role.permissions:
                if permission.name == permission_name:
                    return True
        return False
    
    # For real database users, use the RBAC service
    try:
        db = next(get_db())
        rbac_service = RBACService(db)
        return rbac_service.check_permission(user.id, permission_name, tenant_id)
    except Exception:
        # Fallback for cases where database is not available
        return False


def get_user_roles(user, tenant_id: Optional[int] = None) -> List[str]:
    """
    Backward compatibility function for getting user roles
    
    Args:
        user: User object (SQLAlchemy model)
        tenant_id: Optional tenant ID for context
        
    Returns:
        List[str]: List of role names
    """
    # For mock users (used in auth_dependencies), get roles directly
    if hasattr(user, 'roles') and hasattr(user.roles[0] if user.roles else None, 'name'):
        return [role.name for role in user.roles]
    
    # For real database users, use the RBAC service
    try:
        db = next(get_db())
        rbac_service = RBACService(db)
        user_roles = rbac_service.get_user_roles(user.id, tenant_id)
        return [ur.role.name for ur in user_roles]
    except Exception:
        # Fallback for cases where database is not available
        return []


def get_user_permissions(user, tenant_id: Optional[int] = None) -> List[str]:
    """
    Backward compatibility function for getting user permissions
    
    Args:
        user: User object (SQLAlchemy model)
        tenant_id: Optional tenant ID for context
        
    Returns:
        List[str]: List of permission names
    """
    # For mock users (used in auth_dependencies), get permissions directly
    if hasattr(user, 'roles') and hasattr(user.roles[0] if user.roles else None, 'permissions'):
        permissions = set()
        for role in user.roles:
            for permission in role.permissions:
                permissions.add(permission.name)
        return list(permissions)
    
    # For real database users, use the RBAC service
    try:
        db = next(get_db())
        rbac_service = RBACService(db)
        return rbac_service.get_user_permissions(user.id, tenant_id)
    except Exception:
        # Fallback for cases where database is not available
        return []
