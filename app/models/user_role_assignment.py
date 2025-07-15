"""
Isolated UserRoleAssignment model to prevent SQLAlchemy registry conflicts.
This module should only be imported when UserRoleAssignment is explicitly needed.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, UniqueConstraint, Index
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
        Index('ix_user_role_assignments_user_id', 'user_id'),
        Index('ix_user_role_assignments_role_id', 'role_id'),
        Index('ix_user_role_assignments_tenant_id', 'tenant_id'),
        Index('ix_user_role_assignments_active', 'is_active'),
        Index('ix_user_role_assignments_user_tenant', 'user_id', 'tenant_id'),
        Index('ix_user_role_assignments_expires_at', 'expires_at'),
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
    expires_at = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships - re-enabled for testing
    user = relationship("User", foreign_keys=[user_id], back_populates="user_roles")
    role = relationship("Role", foreign_keys=[role_id], overlaps="user_roles")
    tenant = relationship("Tenant", foreign_keys=[tenant_id], overlaps="user_roles")
    assigner = relationship("User", foreign_keys=[assigned_by], overlaps="user_roles")
    

    def __repr__(self):
        return f"<UserRole(id={self.id}, user_id={self.user_id}, role_id={self.role_id}, tenant_id={self.tenant_id})>"