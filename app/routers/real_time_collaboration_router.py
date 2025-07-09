"""
Real-Time Collaboration Router
Provides comprehensive real-time collaboration endpoints for workspace management, messaging, and communication
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
import logging
import json

from ..database import get_db
from ..auth.auth_service import get_current_user
from ..models.user import User
from ..crud import collaboration_crud
from ..models.collaboration_models import ChannelType, MessageType, SessionType, UserStatus

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/workspace")
async def get_collaboration_workspace(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive collaboration workspace data including channels, members, and settings
    """
    try:
        # Get current user's tenant for workspace context
        tenant_id = getattr(current_user, 'tenant_id', 1)
        current_user_id = getattr(current_user, 'id', 1)
        
        # Get user's workspaces
        user_workspaces = collaboration_crud.get_user_workspaces(db, current_user_id, limit=1)
        
        if not user_workspaces:
            # If no workspace found, return empty workspace structure
            return {
                "workspace": {
                    "id": str(tenant_id),
                    "name": "No Workspace",
                    "description": "No workspace found for user",
                    "channels": [],
                    "members": [],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "settings": {
                        "allow_guests": True,
                        "require_approval": False,
                        "message_retention": 90,
                        "file_sharing": True
                    }
                },
                "online_users": [],
                "active_sessions": [],
                "data_source": "database"
            }
        
        workspace = user_workspaces[0]
        
        # Get workspace members with user details
        workspace_id = getattr(workspace, 'id')
        workspace_members = collaboration_crud.get_workspace_members(db, workspace_id)
        members_data = []
        
        for member in workspace_members:
            user = member.user
            # Get user presence
            presence = collaboration_crud.get_user_presence(db, user.id)
            
            if presence:
                status = presence.status.value
                last_seen = presence.last_seen.isoformat() if presence.last_seen else datetime.now(timezone.utc).isoformat()
            else:
                status = 'offline'
                last_seen = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
            
            members_data.append({
                "id": str(user.id),
                "name": f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip() or getattr(user, 'username', 'Unknown'),
                "email": getattr(user, 'email'),
                "status": status,
                "role": member.role,
                "last_seen": last_seen
            })
        
        # Get workspace channels
        channels = collaboration_crud.get_workspace_channels(db, workspace_id, current_user_id)
        channels_data = []
        
        for channel in channels:
            # Get last message for channel
            channel_id = getattr(channel, 'id')
            last_messages = collaboration_crud.get_channel_messages(db, channel_id, limit=1)
            last_message = None
            
            if last_messages:
                msg = last_messages[0]
                last_message = {
                    "id": str(msg.id),
                    "user_id": str(msg.user_id) if msg.user_id else "system",
                    "user_name": msg.user.username if msg.user else "System",
                    "content": msg.content,
                    "type": msg.type.value,
                    "timestamp": msg.timestamp.isoformat(),
                    "reactions": []
                }
                
                # Get reactions for last message
                reactions = collaboration_crud.get_message_reactions(db, msg.id)
                if reactions:
                    reaction_groups = {}
                    for reaction in reactions:
                        emoji = reaction.emoji
                        if emoji not in reaction_groups:
                            reaction_groups[emoji] = {"emoji": emoji, "users": [], "count": 0}
                        reaction_groups[emoji]["users"].append(str(reaction.user_id))
                        reaction_groups[emoji]["count"] += 1
                    last_message["reactions"] = list(reaction_groups.values())
            
            channels_data.append({
                "id": str(channel_id),
                "name": channel.name,
                "description": channel.description,
                "type": channel.type.value,
                "members": channel.members if channel.type == ChannelType.PRIVATE else [],
                "created_at": channel.created_at.isoformat(),
                "unread_count": 0,  # TODO: Implement unread count logic
                "is_muted": channel.is_muted,
                "is_archived": channel.is_archived,
                "last_message": last_message
            })
        
        # Get active sessions
        active_sessions_db = collaboration_crud.get_active_sessions(db, workspace_id)
        active_sessions = []
        
        for session in active_sessions_db:
            participants = []
            for user_id in session.participants:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    participants.append({
                        "id": str(user.id),
                        "name": f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip() or getattr(user, 'username', 'Unknown'),
                        "email": getattr(user, 'email'),
                        "status": "online",
                        "role": "member"
                    })
            
            active_sessions.append({
                "id": str(session.id),
                "type": session.type.value,
                "channel_id": str(session.channel_id) if session.channel_id else None,
                "participants": participants,
                "started_at": session.started_at.isoformat() if session.started_at else None,
                "is_recording": session.is_recording
            })
        
        workspace_data = {
            "id": str(workspace_id),
            "name": workspace.name,
            "description": workspace.description,
            "channels": channels_data,
            "members": members_data,
            "created_at": workspace.created_at.isoformat(),
            "settings": workspace.settings
        }
        
        # Get online users
        online_users = [m for m in members_data if m["status"] in ["online", "away", "busy"]]
        
        return {
            "workspace": workspace_data,
            "online_users": online_users,
            "active_sessions": active_sessions,
            "data_source": "database"
        }
        
    except Exception as e:
        logger.error(f"Error getting collaboration workspace: {str(e)}")
        # Enhanced fallback data
        return {
            "workspace": {
                "id": "1",
                "name": "Demo Team Workspace",
                "description": "Real-time collaboration workspace for team communication and coordination",
                "channels": [
                    {
                        "id": "1",
                        "name": "general",
                        "description": "General team discussions and announcements",
                        "type": "public",
                        "members": ["1", "2", "3", "4", "5"],
                        "created_at": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
                        "unread_count": 3,
                        "is_muted": False,
                        "is_archived": False
                    },
                    {
                        "id": "2",
                        "name": "development",
                        "description": "Development team coordination and code reviews",
                        "type": "public",
                        "members": ["1", "2", "3"],
                        "created_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat(),
                        "unread_count": 7,
                        "is_muted": False,
                        "is_archived": False
                    },
                    {
                        "id": "3",
                        "name": "design",
                        "description": "Design discussions, reviews, and creative collaboration",
                        "type": "public",
                        "members": ["1", "4", "5"],
                        "created_at": (datetime.now(timezone.utc) - timedelta(days=15)).isoformat(),
                        "unread_count": 0,
                        "is_muted": True,
                        "is_archived": False
                    }
                ],
                "members": [
                    {
                        "id": "1",
                        "name": "John Doe",
                        "email": "john@demo.com",
                        "status": "online",
                        "role": "admin",
                        "last_seen": datetime.now(timezone.utc).isoformat()
                    },
                    {
                        "id": "2",
                        "name": "Jane Smith",
                        "email": "jane@demo.com",
                        "status": "online",
                        "role": "moderator",
                        "last_seen": (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
                    },
                    {
                        "id": "3",
                        "name": "Mike Johnson",
                        "email": "mike@demo.com",
                        "status": "away",
                        "role": "member",
                        "last_seen": (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat()
                    }
                ],
                "created_at": (datetime.now(timezone.utc) - timedelta(days=60)).isoformat(),
                "settings": {
                    "allow_guests": True,
                    "require_approval": False,
                    "message_retention": 90,
                    "file_sharing": True
                }
            },
            "online_users": [
                {
                    "id": "1",
                    "name": "John Doe",
                    "email": "john@demo.com",
                    "status": "online",
                    "role": "admin",
                    "last_seen": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": "2",
                    "name": "Jane Smith",
                    "email": "jane@demo.com",
                    "status": "online",
                    "role": "moderator",
                    "last_seen": (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
                }
            ],
            "active_sessions": [
                {
                    "id": "session_1",
                    "type": "video",
                    "channel_id": "2",
                    "participants": [
                        {
                            "id": "1",
                            "name": "John Doe",
                            "email": "john@demo.com",
                            "status": "online",
                            "role": "admin",
                            "last_seen": datetime.now(timezone.utc).isoformat()
                        },
                        {
                            "id": "2",
                            "name": "Jane Smith",
                            "email": "jane@demo.com",
                            "status": "online",
                            "role": "moderator",
                            "last_seen": (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
                        }
                    ],
                    "started_at": (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat(),
                    "is_recording": False
                }
            ],
            "data_source": "enhanced_fallback",
            "error": str(e)
        }

@router.get("/channels/{channel_id}/messages")
async def get_channel_messages(
    channel_id: str,
    limit: int = Query(50, description="Number of messages to retrieve"),
    before: Optional[str] = Query(None, description="Get messages before this timestamp"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get messages for a specific channel
    """
    try:
        # Get messages from database
        before_datetime = None
        if before:
            try:
                before_datetime = datetime.fromisoformat(before.replace('Z', '+00:00'))
            except ValueError:
                pass
        
        messages = collaboration_crud.get_channel_messages(
            db, int(channel_id), limit=limit, before=before_datetime
        )
        
        messages_data = []
        for message in messages:
            # Get message reactions
            reactions = collaboration_crud.get_message_reactions(db, getattr(message, 'id'))
            
            # Group reactions by emoji
            reaction_groups = {}
            for reaction in reactions:
                emoji = reaction.emoji
                if emoji not in reaction_groups:
                    reaction_groups[emoji] = {"emoji": emoji, "users": [], "count": 0}
                reaction_groups[emoji]["users"].append(str(reaction.user_id))
                reaction_groups[emoji]["count"] += 1
            
            message_data = {
                "id": str(getattr(message, 'id')),
                "user_id": str(getattr(message, 'user_id')) if getattr(message, 'user_id') else "system",
                "user_name": message.user.username if message.user else "System",
                "content": getattr(message, 'content'),
                "type": getattr(message, 'type').value,
                "timestamp": getattr(message, 'timestamp').isoformat(),
                "reactions": list(reaction_groups.values()),
                "is_pinned": getattr(message, 'is_pinned', False),
                "is_edited": getattr(message, 'is_edited', False)
            }
            
            # Add thread info if applicable
            if getattr(message, 'thread_id'):
                message_data["thread_id"] = str(getattr(message, 'thread_id'))
            
            # Add attachments if any
            attachments = collaboration_crud.get_message_attachments(db, getattr(message, 'id'))
            if attachments:
                message_data["attachments"] = [
                    {
                        "id": str(getattr(att, 'id')),
                        "name": getattr(att, 'filename'),
                        "size": getattr(att, 'file_size'),
                        "type": getattr(att, 'mime_type'),
                        "url": getattr(att, 'file_url')
                    }
                    for att in attachments
                ]
            
            messages_data.append(message_data)
        
        return {
            "messages": messages_data,
            "channel_id": channel_id,
            "has_more": len(messages) == limit,
            "data_source": "database"
        }
        
    except Exception as e:
        logger.error(f"Error getting channel messages: {str(e)}")
        return {
            "messages": [
                {
                    "id": "fallback_1",
                    "user_id": "1",
                    "user_name": "Demo User",
                    "content": "This is a demo message for testing purposes.",
                    "type": "text",
                    "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat(),
                    "reactions": []
                }
            ],
            "channel_id": channel_id,
            "has_more": False,
            "data_source": "enhanced_fallback",
            "error": str(e)
        }

@router.post("/channels/{channel_id}/messages")
async def send_message(
    channel_id: str,
    message_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message to a channel
    """
    try:
        current_user_id = getattr(current_user, 'id', 1)
        
        # Determine message type
        msg_type = MessageType.TEXT
        if message_data.get("type") == "file":
            msg_type = MessageType.FILE
        elif message_data.get("type") == "image":
            msg_type = MessageType.IMAGE
        elif message_data.get("type") == "code":
            msg_type = MessageType.CODE
        
        # Create message in database
        message = collaboration_crud.create_message(
            db=db,
            channel_id=int(channel_id),
            user_id=current_user_id,
            content=message_data.get("content", ""),
            message_type=msg_type,
            thread_id=message_data.get("thread_id"),
            attachments=message_data.get("attachments", []),
            mentions=message_data.get("mentions", [])
        )
        
        user_name = f"{getattr(current_user, 'first_name', '')} {getattr(current_user, 'last_name', '')}".strip() or getattr(current_user, 'username', 'User')
        
        return {
            "success": True,
            "message": {
                "id": str(getattr(message, 'id')),
                "user_id": str(current_user_id),
                "user_name": user_name,
                "content": getattr(message, 'content'),
                "type": getattr(message, 'type').value,
                "timestamp": getattr(message, 'timestamp').isoformat(),
                "reactions": []
            }
        }
        
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/channels/{channel_id}/messages/{message_id}/reactions")
async def add_reaction(
    channel_id: str,
    message_id: str,
    reaction_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add or remove a reaction to a message
    """
    try:
        current_user_id = getattr(current_user, 'id', 1)
        emoji = reaction_data.get("emoji", "👍")
        add_reaction_flag = reaction_data.get("add", True)
        
        if add_reaction_flag:
            # Add reaction
            collaboration_crud.add_reaction(
                db=db,
                message_id=int(message_id),
                user_id=current_user_id,
                emoji=emoji
            )
            action = "added"
        else:
            # Remove reaction
            collaboration_crud.remove_reaction(
                db=db,
                message_id=int(message_id),
                user_id=current_user_id,
                emoji=emoji
            )
            action = "removed"
        
        return {
            "success": True,
            "message": f"Reaction {emoji} {action}"
        }
        
    except Exception as e:
        logger.error(f"Error adding reaction: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sessions/active")
async def get_active_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get active collaboration sessions (calls, screen shares, etc.)
    """
    try:
        # Get active sessions from database
        sessions = collaboration_crud.get_active_sessions(db)
        
        active_sessions = []
        for session in sessions:
            participants = []
            for user_id in getattr(session, 'participants', []):
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    participants.append({
                        "id": str(user.id),
                        "name": f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip() or getattr(user, 'username', 'Unknown'),
                        "email": getattr(user, 'email'),
                        "status": "online",
                        "role": "member"
                    })
            
            active_sessions.append({
                "id": str(getattr(session, 'id')),
                "type": getattr(session, 'type').value,
                "channel_id": str(getattr(session, 'channel_id')) if getattr(session, 'channel_id') else None,
                "participants": participants,
                "started_at": getattr(session, 'started_at').isoformat() if getattr(session, 'started_at') else None,
                "is_recording": getattr(session, 'is_recording', False)
            })
        
        return {
            "active_sessions": active_sessions,
            "data_source": "database"
        }
        
    except Exception as e:
        logger.error(f"Error getting active sessions: {str(e)}")
        return {
            "active_sessions": [],
            "data_source": "enhanced_fallback",
            "error": str(e)
        }

@router.post("/sessions/start")
async def start_session(
    session_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start a new collaboration session (voice/video call, screen share)
    """
    try:
        current_user_id = getattr(current_user, 'id', 1)
        session_type_str = session_data.get("type", "voice")
        channel_id = session_data.get("channel_id")
        
        # Convert string to SessionType enum
        session_type = SessionType.VOICE
        if session_type_str == "video":
            session_type = SessionType.VIDEO
        elif session_type_str == "screen_share":
            session_type = SessionType.SCREEN_SHARE
        
        # Get user's workspace (assuming first workspace for now)
        user_workspaces = collaboration_crud.get_user_workspaces(db, current_user_id, limit=1)
        if not user_workspaces:
            raise HTTPException(status_code=400, detail="No workspace found for user")
        
        workspace_id = getattr(user_workspaces[0], 'id')
        
        # Create session in database
        session = collaboration_crud.create_session(
            db=db,
            workspace_id=workspace_id,
            session_type=session_type,
            created_by=current_user_id,
            channel_id=int(channel_id) if channel_id else None,
            title=session_data.get("title", f"{session_type_str.title()} Call")
        )
        
        user_name = f"{getattr(current_user, 'first_name', '')} {getattr(current_user, 'last_name', '')}".strip() or getattr(current_user, 'username', 'User')
        
        return {
            "success": True,
            "session": {
                "id": str(getattr(session, 'id')),
                "type": getattr(session, 'type').value,
                "channel_id": str(getattr(session, 'channel_id')) if getattr(session, 'channel_id') else None,
                "participants": [
                    {
                        "id": str(current_user_id),
                        "name": user_name,
                        "email": getattr(current_user, 'email'),
                        "status": "online",
                        "role": "member"
                    }
                ],
                "started_at": getattr(session, 'started_at').isoformat() if getattr(session, 'started_at') else None,
                "is_recording": getattr(session, 'is_recording', False)
            }
        }
        
    except Exception as e:
        logger.error(f"Error starting session: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/workspace/settings")
async def update_workspace_settings(
    settings_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update workspace settings
    """
    try:
        current_user_id = getattr(current_user, 'id', 1)
        
        # Get user's workspace (assuming first workspace for now)
        user_workspaces = collaboration_crud.get_user_workspaces(db, current_user_id, limit=1)
        if not user_workspaces:
            raise HTTPException(status_code=404, detail="No workspace found for user")
        
        workspace_id = getattr(user_workspaces[0], 'id')
        
        # Update workspace settings
        updated_workspace = collaboration_crud.update_workspace_settings(
            db=db,
            workspace_id=workspace_id,
            settings=settings_data
        )
        
        if not updated_workspace:
            raise HTTPException(status_code=404, detail="Workspace not found")
        
        return {
            "success": True,
            "message": "Workspace settings updated successfully",
            "settings": getattr(updated_workspace, 'settings')
        }
        
    except Exception as e:
        logger.error(f"Error updating workspace settings: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))