from sqlalchemy import Column, Integer, String, DateTime, Table, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy
# Import Base from .user to ensure all models use the same Base instance
from app.database import Base
from datetime import datetime

# Note: The old user_roles table has been replaced by the UserRoleAssignment model
# for enhanced tenant-aware RBAC functionality

# Association Table: role_permissions
# Connects Roles and Permissions (Many-to-Many)
role_permissions_table = Table('role_permissions', Base.metadata,
    Column('role_id', Integer(), ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', Integer(), ForeignKey('permissions.id'), primary_key=True),
    extend_existing=True
)

class Role(Base):
    __tablename__ = "roles"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer(), primary_key=True, index=True)
    name = Column(String(), unique=True, index=True, nullable=False)
    description = Column(String(), nullable=True)

    # Tenant support
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)

    created_at = Column(DateTime(), default=datetime.utcnow)
    updated_at = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Enhanced relationships for tenant-aware RBAC
    user_roles = relationship("app.models.rbac.UserRoleAssignment", back_populates="role")
    users = association_proxy("user_roles", "user")  # Maintains backward compatibility
    
    # Tenant relationship
    tenant = relationship("app.models.tenant.Tenant", back_populates="roles")

    # Many-to-Many relationship with Permission (unchanged)
    permissions = relationship(
        "Permission",
        secondary=role_permissions_table, # Reference the table object directly
        back_populates="roles" # Corresponds to the 'roles' attribute in the Permission model
    )

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}', tenant_id={self.tenant_id})>"

class Permission(Base):
    __tablename__ = "permissions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer(), primary_key=True, index=True)
    name = Column(String(), unique=True, index=True, nullable=False) # e.g., "view_own_activity_logs"
    description = Column(String(), nullable=True)

    created_at = Column(DateTime(), default=datetime.utcnow)
    updated_at = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Many-to-Many relationship with Role
    roles = relationship(
        "Role",
        secondary=role_permissions_table, # Reference the table object directly
        back_populates="permissions" # Corresponds to the 'permissions' attribute in Role
    )

    def __repr__(self):
        return f"<Permission(id={self.id}, name='{self.name}')>"


class UserRoleAssignment(Base):
    """
    Enhanced UserRole model for tenant-aware role assignments
    Replaces the simple many-to-many table approach
    """
    __tablename__ = "user_role_assignments"
    __table_args__ = (
        UniqueConstraint('user_id', 'role_id', 'tenant_id', name='unique_user_role_tenant'),
        {'extend_existing': True}
    )
    
    # Add a unique registry key to prevent SQLAlchemy conflicts
    __mapper_args__ = {
        'polymorphic_identity': 'digame_user_role_assignment',  # More unique identifier
        'confirm_deleted_rows': False,  # Helps with test isolation
        'eager_defaults': True  # Helps with test isolation
    }

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, index=True)
    
    # Tenant support
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)
    
    # Assignment tracking
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("app.models.user.User", foreign_keys=[user_id], back_populates="user_roles")
    role = relationship("app.models.rbac.Role", back_populates="user_roles")
    tenant = relationship("app.models.tenant.Tenant", back_populates="user_roles")
    assigner = relationship("app.models.user.User", foreign_keys=[assigned_by])
    

    def __repr__(self):
        return f"<UserRole(id={self.id}, user_id={self.user_id}, role_id={self.role_id}, tenant_id={self.tenant_id})>"
