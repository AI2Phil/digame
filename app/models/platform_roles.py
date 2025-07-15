"""
Platform Owner Role System
Enhanced hierarchical roles for Platform Owner management
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime


class PlatformRole(Base):
    """
    Platform-level roles for hierarchical Platform Owner management
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "platform_roles"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    level = Column(Integer, nullable=False)  # 1=admin, 2=super_admin, 3=platform_owner
    description = Column(Text, nullable=True)
    
    # Permissions
    can_create_tenants = Column(Boolean, default=False)
    can_manage_all_tenants = Column(Boolean, default=False)
    can_access_all_data = Column(Boolean, default=False)
    can_modify_platform_settings = Column(Boolean, default=False)
    can_view_platform_analytics = Column(Boolean, default=False)
    can_manage_platform_users = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<PlatformRole(id={self.id}, name='{self.name}', level={self.level})>"


class UserPlatformRole(Base):
    """
    Association table for User-PlatformRole relationships
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "user_platform_roles"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform_role_id = Column(Integer, ForeignKey("platform_roles.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime, default=func.now())
    
    user = relationship("app.models.user.User", foreign_keys=[user_id])
    platform_role = relationship("PlatformRole")
    assigner = relationship("app.models.user.User", foreign_keys=[assigned_by])

    def __repr__(self):
        return f"<UserPlatformRole(id={self.id}, user_id={self.user_id}, platform_role_id={self.platform_role_id})>"