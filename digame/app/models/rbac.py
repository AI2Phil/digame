from sqlalchemy import Column, Integer, String, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
# Import Base from .user to ensure all models use the same Base instance
from .user import Base 
from datetime import datetime

# Association Table: user_roles
# Connects Users and Roles (Many-to-Many)
user_roles_table = Table('user_roles', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True)
)

# Association Table: role_permissions
# Connects Roles and Permissions (Many-to-Many)
role_permissions_table = Table('role_permissions', Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), primary_key=True)
)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Many-to-Many relationship with User
    users = relationship(
        "User", # Target model class name as a string
        secondary=user_roles_table, # Reference the table object directly
        back_populates="roles" # Corresponds to the 'roles' attribute in the User model
    )

    # Many-to-Many relationship with Permission
    permissions = relationship(
        "Permission",
        secondary=role_permissions_table, # Reference the table object directly
        back_populates="roles" # Corresponds to the 'roles' attribute in the Permission model
    )

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False) # e.g., "view_own_activity_logs"
    description = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Many-to-Many relationship with Role
    roles = relationship(
        "Role",
        secondary=role_permissions_table, # Reference the table object directly
        back_populates="permissions" # Corresponds to the 'permissions' attribute in Role
    )

    def __repr__(self):
        return f"<Permission(id={self.id}, name='{self.name}')>"
