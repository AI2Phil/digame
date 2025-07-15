"""
CRUD operations for Real-Time Collaboration models
Comprehensive database operations for workspaces, channels, messages, and sessions
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone

from app.models.collaboration_models import (
    Workspace, WorkspaceMember, Channel, CollaborationMessage, MessageReaction,
    UserPresence, CollaborationSession, MessageAttachment,
    ChannelType, MessageType, SessionType, UserStatus
)

# Alias for backward compatibility in this file
Message = CollaborationMessage
from app.models.user import User

# Workspace CRUD Operations
def create_workspace(db: Session, name: str, description: str, tenant_id: int, created_by: int, settings: Optional[Dict[str, Any]] = None) -> Workspace:
    """Create a new workspace"""
    db_workspace = Workspace(
        name=name,
        description=description,
        tenant_id=tenant_id,
        created_by=created_by,
        settings=settings or {}
    )
    db.add(db_workspace)
    db.commit()
    db.refresh(db_workspace)
    return db_workspace

def get_workspace(db: Session, workspace_id: int) -> Optional[Workspace]:
    """Get workspace by ID with relationships"""
    return db.query(Workspace).filter(Workspace.id == workspace_id).first()

def get_workspaces_by_tenant(db: Session, tenant_id: int, skip: int = 0, limit: int = 100) -> List[Workspace]:
    """Get all workspaces for a tenant"""
    return db.query(Workspace).filter(
        and_(Workspace.tenant_id == tenant_id, Workspace.is_active == True)
    ).offset(skip).limit(limit).all()

def get_user_workspaces(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Workspace]:
    """Get workspaces where user is a member"""
    return db.query(Workspace).join(WorkspaceMember).filter(
        and_(
            WorkspaceMember.user_id == user_id,
            WorkspaceMember.is_active == True,
            Workspace.is_active == True
        )
    ).offset(skip).limit(limit).all()

def update_workspace_settings(db: Session, workspace_id: int, settings: Dict[str, Any]) -> Optional[Workspace]:
    """Update workspace settings"""
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if workspace:
        workspace.settings = settings
        workspace.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(workspace)
    return workspace

# Workspace Member CRUD Operations
def add_workspace_member(db: Session, workspace_id: int, user_id: int, role: str = "member", permissions: Optional[Dict[str, Any]] = None) -> WorkspaceMember:
    """Add a member to workspace"""
    db_member = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=user_id,
        role=role,
        permissions=permissions or {}
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

def get_workspace_members(db: Session, workspace_id: int, include_inactive: bool = False) -> List[WorkspaceMember]:
    """Get all members of a workspace"""
    query = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id
    )
    if not include_inactive:
        query = query.filter(WorkspaceMember.is_active == True)
    return query.all()

def update_member_role(db: Session, workspace_id: int, user_id: int, role: str, permissions: Optional[Dict[str, Any]] = None) -> Optional[WorkspaceMember]:
    """Update workspace member role and permissions"""
    member = db.query(WorkspaceMember).filter(
        and_(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.user_id == user_id)
    ).first()
    if member:
        member.role = role
        if permissions:
            member.permissions = permissions
        db.commit()
        db.refresh(member)
    return member

def remove_workspace_member(db: Session, workspace_id: int, user_id: int) -> bool:
    """Remove member from workspace"""
    member = db.query(WorkspaceMember).filter(
        and_(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.user_id == user_id)
    ).first()
    if member:
        member.is_active = False
        db.commit()
        return True
    return False

# Channel CRUD Operations
def create_channel(db: Session, workspace_id: int, name: str, description: str, channel_type: ChannelType, created_by: int, members: Optional[List[int]] = None) -> Channel:
    """Create a new channel"""
    db_channel = Channel(
        workspace_id=workspace_id,
        name=name,
        description=description,
        type=channel_type,
        created_by=created_by,
        members=members or []
    )
    db.add(db_channel)
    db.commit()
    db.refresh(db_channel)
    return db_channel

def get_channel(db: Session, channel_id: int) -> Optional[Channel]:
    """Get channel by ID"""
    return db.query(Channel).filter(Channel.id == channel_id).first()

def get_workspace_channels(db: Session, workspace_id: int, user_id: Optional[int] = None) -> List[Channel]:
    """Get channels in workspace (filtered by user access if provided)"""
    query = db.query(Channel).filter(
        and_(Channel.workspace_id == workspace_id, Channel.is_archived == False)
    )
    
    if user_id:
        # Filter channels user has access to
        query = query.filter(
            or_(
                Channel.type == ChannelType.PUBLIC,
                Channel.members.contains([user_id])
            )
        )
    
    return query.order_by(Channel.created_at).all()

def update_channel(db: Session, channel_id: int, **kwargs) -> Optional[Channel]:
    """Update channel properties"""
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if channel:
        for key, value in kwargs.items():
            if hasattr(channel, key):
                setattr(channel, key, value)
        channel.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(channel)
    return channel

def add_channel_member(db: Session, channel_id: int, user_id: int) -> bool:
    """Add user to private channel"""
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if channel and channel.type == ChannelType.PRIVATE:
        if user_id not in channel.members:
            channel.members.append(user_id)
            channel.member_count = len(channel.members)
            db.commit()
            return True
    return False

# Message CRUD Operations
def create_message(db: Session, channel_id: int, user_id: int, content: str, message_type = MessageType.TEXT,
                  thread_id: Optional[int] = None, attachments: Optional[List[Dict]] = None, mentions: Optional[List[int]] = None) -> Message:
    """Create a new message"""
    db_message = Message(
        channel_id=channel_id,
        user_id=user_id,
        content=content,
        type=message_type,
        thread_id=thread_id,
        attachments=attachments or [],
        mentions=mentions or []
    )
    db.add(db_message)
    
    # Update channel last message
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if channel:
        channel.last_message_at = datetime.now(timezone.utc)
        channel.message_count += 1
    
    db.commit()
    db.refresh(db_message)
    return db_message

def get_channel_messages(db: Session, channel_id: int, limit: int = 50, before: Optional[datetime] = None, thread_id: Optional[int] = None) -> List[Message]:
    """Get messages from a channel"""
    query = db.query(Message).filter(
        and_(Message.channel_id == channel_id, Message.is_deleted == False)
    )
    
    if thread_id:
        query = query.filter(Message.thread_id == thread_id)
    else:
        query = query.filter(Message.thread_id.is_(None))
    
    if before:
        query = query.filter(Message.timestamp < before)
    
    return query.order_by(desc(Message.timestamp)).limit(limit).all()

def get_message(db: Session, message_id: int) -> Optional[Message]:
    """Get message by ID"""
    return db.query(Message).filter(Message.id == message_id).first()

def update_message(db: Session, message_id: int, content: str) -> Optional[Message]:
    """Update message content"""
    message = db.query(Message).filter(Message.id == message_id).first()
    if message:
        message.content = content
        message.is_edited = True
        message.edited_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(message)
    return message

def delete_message(db: Session, message_id: int) -> bool:
    """Soft delete a message"""
    message = db.query(Message).filter(Message.id == message_id).first()
    if message:
        message.is_deleted = True
        message.deleted_at = datetime.now(timezone.utc)
        db.commit()
        return True
    return False

def pin_message(db: Session, message_id: int, pin: bool = True) -> Optional[Message]:
    """Pin or unpin a message"""
    message = db.query(Message).filter(Message.id == message_id).first()
    if message:
        message.is_pinned = pin
        db.commit()
        db.refresh(message)
    return message

# Message Reaction CRUD Operations
def add_reaction(db: Session, message_id: int, user_id: int, emoji: str) -> MessageReaction:
    """Add reaction to message"""
    # Check if reaction already exists
    existing = db.query(MessageReaction).filter(
        and_(
            MessageReaction.message_id == message_id,
            MessageReaction.user_id == user_id,
            MessageReaction.emoji == emoji
        )
    ).first()
    
    if existing:
        return existing
    
    db_reaction = MessageReaction(
        message_id=message_id,
        user_id=user_id,
        emoji=emoji
    )
    db.add(db_reaction)
    db.commit()
    db.refresh(db_reaction)
    return db_reaction

def remove_reaction(db: Session, message_id: int, user_id: int, emoji: str) -> bool:
    """Remove reaction from message"""
    reaction = db.query(MessageReaction).filter(
        and_(
            MessageReaction.message_id == message_id,
            MessageReaction.user_id == user_id,
            MessageReaction.emoji == emoji
        )
    ).first()
    
    if reaction:
        db.delete(reaction)
        db.commit()
        return True
    return False

def get_message_reactions(db: Session, message_id: int) -> List[MessageReaction]:
    """Get all reactions for a message"""
    return db.query(MessageReaction).filter(
        MessageReaction.message_id == message_id
    ).all()

# User Presence CRUD Operations
def update_user_presence(db: Session, user_id: int, status: UserStatus, workspace_id: Optional[int] = None,
                        custom_status: Optional[str] = None, current_channel_id: Optional[int] = None) -> UserPresence:
    """Update or create user presence"""
    presence = db.query(UserPresence).filter(UserPresence.user_id == user_id).first()
    
    if not presence:
        presence = UserPresence(user_id=user_id)
        db.add(presence)
    
    setattr(presence, 'status', status)
    setattr(presence, 'last_activity', datetime.now(timezone.utc))
    
    if workspace_id:
        setattr(presence, 'workspace_id', workspace_id)
    if custom_status is not None:
        setattr(presence, 'custom_status', custom_status)
    if current_channel_id:
        setattr(presence, 'current_channel_id', current_channel_id)
    
    db.commit()
    db.refresh(presence)
    return presence

def get_user_presence(db: Session, user_id: int) -> Optional[UserPresence]:
    """Get user presence"""
    return db.query(UserPresence).filter(UserPresence.user_id == user_id).first()

def get_workspace_online_users(db: Session, workspace_id: int) -> List[UserPresence]:
    """Get online users in workspace"""
    return db.query(UserPresence).filter(
        and_(
            UserPresence.workspace_id == workspace_id,
            UserPresence.status.in_([UserStatus.ONLINE, UserStatus.AWAY, UserStatus.BUSY])
        )
    ).all()

def set_typing_status(db: Session, user_id: int, channel_id: int, is_typing: bool) -> Optional[UserPresence]:
    """Set user typing status in channel"""
    presence = db.query(UserPresence).filter(UserPresence.user_id == user_id).first()
    if presence:
        presence.is_typing = is_typing
        presence.typing_in_channel_id = channel_id if is_typing else None
        presence.typing_started_at = datetime.now(timezone.utc) if is_typing else None
        db.commit()
        db.refresh(presence)
    return presence

# Collaboration Session CRUD Operations
def create_session(db: Session, workspace_id: int, session_type, created_by: int,
                  channel_id: Optional[int] = None, title: Optional[str] = None, max_participants: int = 50) -> CollaborationSession:
    """Create a new collaboration session"""
    db_session = CollaborationSession(
        workspace_id=workspace_id,
        channel_id=channel_id,
        type=session_type,
        title=title,
        created_by=created_by,
        max_participants=max_participants,
        participants=[created_by]
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_active_sessions(db: Session, workspace_id: Optional[int] = None, channel_id: Optional[int] = None) -> List[CollaborationSession]:
    """Get active collaboration sessions"""
    query = db.query(CollaborationSession).filter(CollaborationSession.status == 'active')
    
    if workspace_id:
        query = query.filter(CollaborationSession.workspace_id == workspace_id)
    if channel_id:
        query = query.filter(CollaborationSession.channel_id == channel_id)
    
    return query.all()

def join_session(db: Session, session_id: int, user_id: int) -> Optional[CollaborationSession]:
    """Add user to collaboration session"""
    session = db.query(CollaborationSession).filter(CollaborationSession.id == session_id).first()
    if session and user_id not in session.participants:
        session.participants.append(user_id)
        session.participant_count = len(session.participants)
        db.commit()
        db.refresh(session)
    return session

def leave_session(db: Session, session_id: int, user_id: int) -> Optional[CollaborationSession]:
    """Remove user from collaboration session"""
    session = db.query(CollaborationSession).filter(CollaborationSession.id == session_id).first()
    if session and user_id in session.participants:
        session.participants.remove(user_id)
        session.participant_count = len(session.participants)
        
        # End session if no participants left
        if session.participant_count == 0:
            session.status = 'ended'
            session.ended_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(session)
    return session

def end_session(db: Session, session_id: int) -> Optional[CollaborationSession]:
    """End a collaboration session"""
    session = db.query(CollaborationSession).filter(CollaborationSession.id == session_id).first()
    if session:
        session.status = 'ended'
        session.ended_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(session)
    return session

# Message Attachment CRUD Operations
def create_attachment(db: Session, message_id: int, filename: str, file_size: int, 
                     mime_type: str, file_url: str, uploaded_by: int, **kwargs) -> MessageAttachment:
    """Create message attachment record"""
    db_attachment = MessageAttachment(
        message_id=message_id,
        filename=filename,
        original_filename=kwargs.get('original_filename', filename),
        file_size=file_size,
        mime_type=mime_type,
        file_url=file_url,
        uploaded_by=uploaded_by,
        **{k: v for k, v in kwargs.items() if hasattr(MessageAttachment, k)}
    )
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment

def get_message_attachments(db: Session, message_id: int) -> List[MessageAttachment]:
    """Get all attachments for a message"""
    return db.query(MessageAttachment).filter(MessageAttachment.message_id == message_id).all()

# Utility Functions
def get_workspace_statistics(db: Session, workspace_id: int) -> Dict[str, Any]:
    """Get workspace statistics"""
    member_count = db.query(WorkspaceMember).filter(
        and_(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.is_active == True)
    ).count()
    
    channel_count = db.query(Channel).filter(
        and_(Channel.workspace_id == workspace_id, Channel.is_archived == False)
    ).count()
    
    message_count = db.query(Message).join(Channel).filter(
        and_(Channel.workspace_id == workspace_id, Message.is_deleted == False)
    ).count()
    
    active_sessions = db.query(CollaborationSession).filter(
        and_(CollaborationSession.workspace_id == workspace_id, CollaborationSession.status == 'active')
    ).count()
    
    return {
        "member_count": member_count,
        "channel_count": channel_count,
        "message_count": message_count,
        "active_sessions": active_sessions
    }

def search_messages(db: Session, workspace_id: int, query: str, limit: int = 50) -> List[Message]:
    """Search messages in workspace"""
    return db.query(Message).join(Channel).filter(
        and_(
            Channel.workspace_id == workspace_id,
            Message.content.ilike(f"%{query}%"),
            Message.is_deleted == False
        )
    ).order_by(desc(Message.timestamp)).limit(limit).all()