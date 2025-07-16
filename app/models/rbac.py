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

    # Enhanced relationships for tenant-aware RBAC - re-enabled as part of REENABLE.md plan
    user_roles = relationship("app.models.user_role_assignment.UserRoleAssignment", back_populates="role")
    users = association_proxy("user_roles", "user")  # Maintains backward compatibility
    
    # Tenant relationship - re-enabled as part of REENABLE.md plan
    tenant = relationship("app.models.tenant.Tenant")

    # Many-to-Many relationship with Permission - re-enabled as part of REENABLE.md plan
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

    # Many-to-Many relationship with Role - re-enabled as part of REENABLE.md plan
    roles = relationship(
        "Role",
        secondary=role_permissions_table, # Reference the table object directly
        back_populates="permissions" # Corresponds to the 'permissions' attribute in Role
    )

    def __repr__(self):
        return f"<Permission(id={self.id}, name='{self.name}')>"


# UserRoleAssignment class moved to app.models.user_role_assignment to prevent SQLAlchemy registry conflicts
# Import UserRoleAssignment through app.models.rbac_imports when needed
