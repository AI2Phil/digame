"""
Isolated UserRoleAssignment model to prevent SQLAlchemy registry conflicts.
This module should only be imported when UserRoleAssignment is explicitly needed.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


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
    
    # Relationships - simplified to resolve mapper conflicts
    user = relationship("app.models.user.User", foreign_keys=[user_id])
    role = relationship("app.models.rbac.Role")
    tenant = relationship("app.models.tenant.Tenant")  # Re-enabled without back_populates
    assigner = relationship("app.models.user.User", foreign_keys=[assigned_by])
    

    def __repr__(self):
        return f"<UserRole(id={self.id}, user_id={self.user_id}, role_id={self.role_id}, tenant_id={self.tenant_id})>"