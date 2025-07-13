"""
Real-Time Collaboration Models for Database-Driven Implementation
SQLAlchemy 2.0 models for workspace management, messaging, and real-time communication
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey, Index, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, Dict, Any, List
import enum
from app.database import Base

class ChannelType(enum.Enum):
    """Channel types for collaboration"""
    PUBLIC = "public"
    PRIVATE = "private"
    DIRECT = "direct"
    ANNOUNCEMENT = "announcement"

class MessageType(enum.Enum):
    """Message types for collaboration"""
    TEXT = "text"
    FILE = "file"
    IMAGE = "image"
    SYSTEM = "system"
    CODE = "code"

class SessionType(enum.Enum):
    """Collaboration session types"""
    VOICE = "voice"
    VIDEO = "video"
    SCREEN_SHARE = "screen_share"
    WHITEBOARD = "whiteboard"

class UserStatus(enum.Enum):
    """User presence status"""
    ONLINE = "online"
    AWAY = "away"
    BUSY = "busy"
    OFFLINE = "offline"

class Workspace(Base):
    """Collaboration workspaces for team communication"""
    __tablename__ = 'workspaces'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=False, index=True)
    
    # Workspace settings
    settings = Column(JSON, default={
        "allow_guests": True,
        "require_approval": False,
        "message_retention": 90,
        "file_sharing": True,
        "max_file_size": 100,  # MB
        "allowed_file_types": ["image", "document", "video", "audio"]
    })
    
    # Metadata
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    is_archived = Column(Boolean, default=False)
    
    # Relationships
    channels = relationship("Channel", back_populates="workspace", cascade="all, delete-orphan")
    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")
    sessions = relationship("CollaborationSession", back_populates="workspace", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_workspaces_tenant_active', 'tenant_id', 'is_active'),
        Index('idx_workspaces_created_by', 'created_by'),
        {'extend_existing': True}
    )

class WorkspaceMember(Base):
    """Workspace membership with roles and permissions"""
    __tablename__ = 'workspace_members'

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey('workspaces.id'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Role and permissions
    role = Column(String(50), nullable=False, default='member')  # admin, moderator, member, guest
    permissions = Column(JSON, default={
        "can_create_channels": True,
        "can_invite_members": False,
        "can_manage_workspace": False,
        "can_delete_messages": False,
        "can_moderate": False
    })
    
    # Status
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    notification_settings = Column(JSON, default={
        "email_notifications": True,
        "push_notifications": True,
        "mention_notifications": True,
        "channel_notifications": "mentions_only"
    })
    
    # Relationships
    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User")
    
    __table_args__ = (
        Index('idx_workspace_members_workspace_user', 'workspace_id', 'user_id'),
        Index('idx_workspace_members_role', 'role'),
        {'extend_existing': True}
    )

class Channel(Base):
    """Communication channels within workspaces"""
    __tablename__ = 'channels'

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey('workspaces.id'), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    type = Column(Enum(ChannelType), nullable=False, default=ChannelType.PUBLIC)
    
    # Channel settings
    topic = Column(String(500))
    is_archived = Column(Boolean, default=False)
    is_muted = Column(Boolean, default=False)
    is_read_only = Column(Boolean, default=False)
    
    # Member management
    members = Column(JSON, default=[])  # List of user IDs for private channels
    member_count = Column(Integer, default=0)
    
    # Message statistics
    message_count = Column(Integer, default=0)
    last_message_at = Column(DateTime(timezone=True))
    last_message_id = Column(Integer, ForeignKey('collaboration_messages.id'), nullable=True)
    
    # Metadata
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workspace = relationship("Workspace", back_populates="channels")
    messages = relationship("app.models.collaboration_models.Message", back_populates="channel", cascade="all, delete-orphan", foreign_keys="app.models.collaboration_models.Message.channel_id")
    last_message = relationship("app.models.collaboration_models.Message", foreign_keys=[last_message_id], post_update=True)
    
    __table_args__ = (
        Index('idx_channels_workspace_type', 'workspace_id', 'type'),
        Index('idx_channels_name', 'name'),
        Index('idx_channels_last_message', 'last_message_at'),
        {'extend_existing': True}
    )

class Message(Base):
    """Messages within channels"""
    __tablename__ = 'collaboration_messages'

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(Integer, ForeignKey('channels.id'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Message content
    content = Column(Text, nullable=False)
    type = Column(Enum(MessageType), nullable=False, default=MessageType.TEXT)
    
    # Message metadata
    thread_id = Column(Integer, ForeignKey('collaboration_messages.id'), nullable=True)  # For threaded replies
    reply_count = Column(Integer, default=0)
    is_pinned = Column(Boolean, default=False)
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    
    # Timestamps
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    edited_at = Column(DateTime(timezone=True))
    deleted_at = Column(DateTime(timezone=True))
    
    # Rich content
    attachments = Column(JSON, default=[])  # File attachments
    mentions = Column(JSON, default=[])  # User mentions
    message_metadata = Column(JSON, default={})  # Additional message data
    
    # Relationships
    channel = relationship("Channel", back_populates="messages", foreign_keys=[channel_id])
    user = relationship("User")
    reactions = relationship("MessageReaction", back_populates="message", cascade="all, delete-orphan")
    thread_replies = relationship("app.models.collaboration_models.Message", backref="parent_message", remote_side=[id])
    
    __table_args__ = (
        Index('idx_messages_channel_timestamp', 'channel_id', 'timestamp'),
        Index('idx_messages_user_timestamp', 'user_id', 'timestamp'),
        Index('idx_messages_thread', 'thread_id'),
        Index('idx_messages_type', 'type'),
        {'extend_existing': True}
    )

class MessageReaction(Base):
    """Reactions to messages"""
    __tablename__ = 'message_reactions'

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey('collaboration_messages.id'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Reaction details
    emoji = Column(String(50), nullable=False)
    emoji_unicode = Column(String(20))  # Unicode representation
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    message = relationship("app.models.collaboration_models.Message", back_populates="reactions")
    user = relationship("User")
    
    __table_args__ = (
        Index('idx_message_reactions_message_emoji', 'message_id', 'emoji'),
        Index('idx_message_reactions_user_message', 'user_id', 'message_id'),
        {'extend_existing': True}
    )

class UserPresence(Base):
    """User presence and activity status"""
    __tablename__ = 'user_presence'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True, index=True)
    workspace_id = Column(Integer, ForeignKey('workspaces.id'), nullable=True, index=True)
    
    # Presence status
    status = Column(Enum(UserStatus), nullable=False, default=UserStatus.OFFLINE)
    custom_status = Column(String(100))  # Custom status message
    status_emoji = Column(String(50))  # Status emoji
    
    # Activity tracking
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    current_channel_id = Column(Integer, ForeignKey('channels.id'), nullable=True)
    
    # Typing indicators
    is_typing = Column(Boolean, default=False)
    typing_in_channel_id = Column(Integer, ForeignKey('channels.id'), nullable=True)
    typing_started_at = Column(DateTime(timezone=True))
    
    # Device and connection info
    device_info = Column(JSON, default={})
    connection_id = Column(String(255))  # WebSocket connection ID
    
    # Metadata
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    workspace = relationship("Workspace")
    current_channel = relationship("Channel", foreign_keys=[current_channel_id])
    typing_channel = relationship("Channel", foreign_keys=[typing_in_channel_id])
    
    __table_args__ = (
        Index('idx_user_presence_status', 'status'),
        Index('idx_user_presence_workspace', 'workspace_id', 'status'),
        Index('idx_user_presence_last_activity', 'last_activity'),
        {'extend_existing': True}
    )

class CollaborationSession(Base):
    """Active collaboration sessions (calls, screen shares, etc.)"""
    __tablename__ = 'collaboration_sessions'

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey('workspaces.id'), nullable=False, index=True)
    channel_id = Column(Integer, ForeignKey('channels.id'), nullable=True, index=True)
    
    # Session details
    type = Column(Enum(SessionType), nullable=False)
    title = Column(String(255))
    description = Column(Text)
    
    # Session configuration
    is_recording = Column(Boolean, default=False)
    is_public = Column(Boolean, default=True)
    max_participants = Column(Integer, default=50)
    require_approval = Column(Boolean, default=False)
    
    # Session data
    participants = Column(JSON, default=[])  # List of participant user IDs
    participant_count = Column(Integer, default=0)
    session_data = Column(JSON, default={})  # Session-specific data
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True))
    scheduled_at = Column(DateTime(timezone=True))
    
    # Status
    status = Column(String(50), default='active')  # active, ended, scheduled, cancelled
    
    # Metadata
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    workspace = relationship("Workspace", back_populates="sessions")
    channel = relationship("Channel")
    creator = relationship("User")
    
    __table_args__ = (
        Index('idx_collaboration_sessions_workspace_status', 'workspace_id', 'status'),
        Index('idx_collaboration_sessions_type', 'type'),
        Index('idx_collaboration_sessions_started_at', 'started_at'),
        {'extend_existing': True}
    )

class MessageAttachment(Base):
    """File attachments for messages"""
    __tablename__ = 'message_attachments'

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey('collaboration_messages.id'), nullable=False, index=True)
    
    # File details
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)  # Size in bytes
    mime_type = Column(String(100), nullable=False)
    file_url = Column(String(500), nullable=False)
    
    # File metadata
    file_hash = Column(String(64))  # SHA-256 hash for deduplication
    thumbnail_url = Column(String(500))  # For images/videos
    duration = Column(Integer)  # For audio/video files in seconds
    dimensions = Column(JSON)  # For images: {"width": 1920, "height": 1080}
    
    # Upload details
    uploaded_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Status
    is_processed = Column(Boolean, default=False)
    is_virus_scanned = Column(Boolean, default=False)
    scan_result = Column(String(50))  # clean, infected, pending
    
    # Relationships
    message = relationship("app.models.collaboration_models.Message")
    uploader = relationship("User")
    
    __table_args__ = (
        Index('idx_message_attachments_message', 'message_id'),
        Index('idx_message_attachments_hash', 'file_hash'),
        Index('idx_message_attachments_uploader', 'uploaded_by'),
        {'extend_existing': True}
    )