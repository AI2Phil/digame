"""
Isolated UserRoleAssignment model to prevent SQLAlchemy registry conflicts.
This module should only be imported when UserRoleAssignment is explicitly needed.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

# Import Tenant directly to avoid string resolution issues
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.tenant import Tenant


class UserRoleAssignment(Base):
    """
    Enhanced UserRole model for tenant-aware role assignments
    Replaces the simple many-to-many table approach
    """
    __tablename__ = "user_role_assignments"
    __table_args__ = (
        UniqueConstraint('user_id', 'role_id', 'tenant_id', name='unique_user_role_tenant'),
        Index('ix_user_role_assignments_user_id', 'user_id'),
        Index('ix_user_role_assignments_role_id', 'role_id'),
        Index('ix_user_role_assignments_tenant_id', 'tenant_id'),
        Index('ix_user_role_assignments_active', 'is_active'),
        Index('ix_user_role_assignments_user_tenant', 'user_id', 'tenant_id'),
        {'extend_existing': True}
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    
    # Tenant support
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    
    # Assignment tracking
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships - re-enabled as part of REENABLE.md plan
    user = relationship("app.models.user.User", foreign_keys=[user_id], back_populates="user_roles")
    role = relationship("app.models.rbac.Role", overlaps="user_roles")
    # Tenant relationship - using fully qualified path to avoid registry conflicts
    tenant = relationship("app.models.tenant.Tenant", foreign_keys=[tenant_id], overlaps="user_roles", lazy="select")
    assigner = relationship("app.models.user.User", foreign_keys=[assigned_by], overlaps="user_roles")
    

    def __repr__(self):
        return f"<UserRole(id={self.id}, user_id={self.user_id}, role_id={self.role_id}, tenant_id={self.tenant_id})>"