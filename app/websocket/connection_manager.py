"""
WebSocket Connection Manager for Digital Twin Platform
Handles real-time connections for twin updates, team coordination, and notifications
"""

import asyncio
import json
import logging
from typing import Dict, List, Set, Optional, Any
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
from enum import Enum
import uuid

logger = logging.getLogger(__name__)

class MessageType(str, Enum):
    # Twin Updates
    TWIN_UPDATE = "twin_update"
    TWIN_STATUS_CHANGE = "twin_status_change"
    TWIN_LEARNING_UPDATE = "twin_learning_update"
    
    # Team Coordination
    TEAM_COORDINATION_START = "team_coordination_start"
    TEAM_COORDINATION_UPDATE = "team_coordination_update"
    TEAM_COORDINATION_COMPLETE = "team_coordination_complete"
    TEAM_MEMBER_UPDATE = "team_member_update"
    
    # Analytics and Insights
    ANALYTICS_UPDATE = "analytics_update"
    INSIGHT_GENERATED = "insight_generated"
    PERFORMANCE_ALERT = "performance_alert"
    
    # Notifications
    NOTIFICATION = "notification"
    SYSTEM_ALERT = "system_alert"
    
    # Connection Management
    CONNECTION_ACK = "connection_ack"
    HEARTBEAT = "heartbeat"
    ERROR = "error"

class ConnectionType(str, Enum):
    TWIN_OWNER = "twin_owner"
    TEAM_MEMBER = "team_member"
    PLATFORM_ADMIN = "platform_admin"
    GUEST = "guest"

class WebSocketConnection:
    """Individual WebSocket connection wrapper"""
    
    def __init__(self, websocket: WebSocket, connection_id: str, user_id: str, 
                 connection_type: ConnectionType, metadata: Optional[Dict[str, Any]] = None):
        self.websocket = websocket
        self.connection_id = connection_id
        self.user_id = user_id
        self.connection_type = connection_type
        self.metadata = metadata or {}
        self.connected_at = datetime.utcnow()
        self.last_heartbeat = datetime.utcnow()
        self.subscriptions: Set[str] = set()
        
    async def send_message(self, message_type: MessageType, data: Dict[str, Any]):
        """Send a message to this connection"""
        try:
            message = {
                "type": message_type.value,
                "data": data,
                "timestamp": datetime.utcnow().isoformat(),
                "connection_id": self.connection_id
            }
            await self.websocket.send_text(json.dumps(message))
            return True
        except Exception as e:
            logger.error(f"Failed to send message to {self.connection_id}: {e}")
            return False
    
    def subscribe(self, channel: str):
        """Subscribe to a channel"""
        self.subscriptions.add(channel)
    
    def unsubscribe(self, channel: str):
        """Unsubscribe from a channel"""
        self.subscriptions.discard(channel)
    
    def is_subscribed(self, channel: str) -> bool:
        """Check if subscribed to a channel"""
        return channel in self.subscriptions

class ConnectionManager:
    """
    Manages WebSocket connections for the Digital Twin Platform
    Handles real-time updates, team coordination, and notifications
    """
    
    def __init__(self):
        # Connection storage
        self.connections: Dict[str, WebSocketConnection] = {}
        self.user_connections: Dict[str, List[str]] = {}  # user_id -> [connection_ids]
        self.team_connections: Dict[str, List[str]] = {}  # team_id -> [connection_ids]
        self.twin_connections: Dict[str, List[str]] = {}  # twin_id -> [connection_ids]
        
        # Channel subscriptions
        self.channel_subscribers: Dict[str, Set[str]] = {}  # channel -> {connection_ids}
        
        # Background tasks
        self.heartbeat_task: Optional[asyncio.Task] = None
        self.cleanup_task: Optional[asyncio.Task] = None
        
        # Statistics
        self.connection_stats = {
            "total_connections": 0,
            "active_connections": 0,
            "messages_sent": 0,
            "messages_failed": 0
        }
    
    async def connect(self, websocket: WebSocket, user_id: str, 
                     connection_type: ConnectionType = ConnectionType.TWIN_OWNER,
                     metadata: Optional[Dict[str, Any]] = None) -> str:
        """Accept a new WebSocket connection"""
        await websocket.accept()
        
        connection_id = str(uuid.uuid4())
        connection = WebSocketConnection(
            websocket=websocket,
            connection_id=connection_id,
            user_id=user_id,
            connection_type=connection_type,
            metadata=metadata
        )
        
        # Store connection
        self.connections[connection_id] = connection
        
        # Index by user
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(connection_id)
        
        # Update statistics
        self.connection_stats["total_connections"] += 1
        self.connection_stats["active_connections"] = len(self.connections)
        
        # Send connection acknowledgment
        await connection.send_message(MessageType.CONNECTION_ACK, {
            "connection_id": connection_id,
            "user_id": user_id,
            "connection_type": connection_type.value,
            "server_time": datetime.utcnow().isoformat()
        })
        
        # Start background tasks if not running
        if not self.heartbeat_task:
            self.heartbeat_task = asyncio.create_task(self._heartbeat_loop())
        if not self.cleanup_task:
            self.cleanup_task = asyncio.create_task(self._cleanup_loop())
        
        logger.info(f"WebSocket connection established: {connection_id} for user {user_id}")
        return connection_id
    
    async def disconnect(self, connection_id: str):
        """Disconnect a WebSocket connection"""
        if connection_id not in self.connections:
            return
        
        connection = self.connections[connection_id]
        user_id = connection.user_id
        
        # Remove from user connections
        if user_id in self.user_connections:
            self.user_connections[user_id] = [
                cid for cid in self.user_connections[user_id] if cid != connection_id
            ]
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        # Remove from team connections
        for team_id, conn_ids in self.team_connections.items():
            if connection_id in conn_ids:
                self.team_connections[team_id] = [
                    cid for cid in conn_ids if cid != connection_id
                ]
        
        # Remove from twin connections
        for twin_id, conn_ids in self.twin_connections.items():
            if connection_id in conn_ids:
                self.twin_connections[twin_id] = [
                    cid for cid in conn_ids if cid != connection_id
                ]
        
        # Remove from channel subscriptions
        for channel, subscribers in self.channel_subscribers.items():
            subscribers.discard(connection_id)
        
        # Remove connection
        del self.connections[connection_id]
        
        # Update statistics
        self.connection_stats["active_connections"] = len(self.connections)
        
        logger.info(f"WebSocket connection closed: {connection_id} for user {user_id}")
    
    async def send_to_user(self, user_id: str, message_type: MessageType, data: Dict[str, Any]):
        """Send a message to all connections for a specific user"""
        if user_id not in self.user_connections:
            return 0
        
        sent_count = 0
        failed_connections = []
        
        for connection_id in self.user_connections[user_id]:
            if connection_id in self.connections:
                success = await self.connections[connection_id].send_message(message_type, data)
                if success:
                    sent_count += 1
                    self.connection_stats["messages_sent"] += 1
                else:
                    failed_connections.append(connection_id)
                    self.connection_stats["messages_failed"] += 1
        
        # Clean up failed connections
        for connection_id in failed_connections:
            await self.disconnect(connection_id)
        
        return sent_count
    
    async def send_to_team(self, team_id: str, message_type: MessageType, data: Dict[str, Any]):
        """Send a message to all team members"""
        if team_id not in self.team_connections:
            return 0
        
        sent_count = 0
        failed_connections = []
        
        for connection_id in self.team_connections[team_id]:
            if connection_id in self.connections:
                success = await self.connections[connection_id].send_message(message_type, data)
                if success:
                    sent_count += 1
                    self.connection_stats["messages_sent"] += 1
                else:
                    failed_connections.append(connection_id)
                    self.connection_stats["messages_failed"] += 1
        
        # Clean up failed connections
        for connection_id in failed_connections:
            await self.disconnect(connection_id)
        
        return sent_count
    
    async def send_to_twin(self, twin_id: str, message_type: MessageType, data: Dict[str, Any]):
        """Send a message to all connections for a specific twin"""
        if twin_id not in self.twin_connections:
            return 0
        
        sent_count = 0
        failed_connections = []
        
        for connection_id in self.twin_connections[twin_id]:
            if connection_id in self.connections:
                success = await self.connections[connection_id].send_message(message_type, data)
                if success:
                    sent_count += 1
                    self.connection_stats["messages_sent"] += 1
                else:
                    failed_connections.append(connection_id)
                    self.connection_stats["messages_failed"] += 1
        
        # Clean up failed connections
        for connection_id in failed_connections:
            await self.disconnect(connection_id)
        
        return sent_count
    
    async def broadcast_to_channel(self, channel: str, message_type: MessageType, data: Dict[str, Any]):
        """Broadcast a message to all subscribers of a channel"""
        if channel not in self.channel_subscribers:
            return 0
        
        sent_count = 0
        failed_connections = []
        
        for connection_id in self.channel_subscribers[channel].copy():
            if connection_id in self.connections:
                success = await self.connections[connection_id].send_message(message_type, data)
                if success:
                    sent_count += 1
                    self.connection_stats["messages_sent"] += 1
                else:
                    failed_connections.append(connection_id)
                    self.connection_stats["messages_failed"] += 1
        
        # Clean up failed connections
        for connection_id in failed_connections:
            await self.disconnect(connection_id)
        
        return sent_count
    
    def subscribe_to_channel(self, connection_id: str, channel: str):
        """Subscribe a connection to a channel"""
        if connection_id not in self.connections:
            return False
        
        if channel not in self.channel_subscribers:
            self.channel_subscribers[channel] = set()
        
        self.channel_subscribers[channel].add(connection_id)
        self.connections[connection_id].subscribe(channel)
        return True
    
    def unsubscribe_from_channel(self, connection_id: str, channel: str):
        """Unsubscribe a connection from a channel"""
        if connection_id not in self.connections:
            return False
        
        if channel in self.channel_subscribers:
            self.channel_subscribers[channel].discard(connection_id)
        
        self.connections[connection_id].unsubscribe(channel)
        return True
    
    def register_twin_connection(self, connection_id: str, twin_id: str):
        """Register a connection for twin-specific updates"""
        if twin_id not in self.twin_connections:
            self.twin_connections[twin_id] = []
        
        if connection_id not in self.twin_connections[twin_id]:
            self.twin_connections[twin_id].append(connection_id)
    
    def register_team_connection(self, connection_id: str, team_id: str):
        """Register a connection for team-specific updates"""
        if team_id not in self.team_connections:
            self.team_connections[team_id] = []
        
        if connection_id not in self.team_connections[team_id]:
            self.team_connections[team_id].append(connection_id)
    
    async def handle_message(self, connection_id: str, message: str):
        """Handle incoming message from a WebSocket connection"""
        if connection_id not in self.connections:
            return
        
        try:
            data = json.loads(message)
            message_type = data.get("type")
            payload = data.get("data", {})
            
            if message_type == "heartbeat":
                self.connections[connection_id].last_heartbeat = datetime.utcnow()
                await self.connections[connection_id].send_message(MessageType.HEARTBEAT, {
                    "server_time": datetime.utcnow().isoformat()
                })
            
            elif message_type == "subscribe":
                channel = payload.get("channel")
                if channel:
                    self.subscribe_to_channel(connection_id, channel)
            
            elif message_type == "unsubscribe":
                channel = payload.get("channel")
                if channel:
                    self.unsubscribe_from_channel(connection_id, channel)
            
            elif message_type == "register_twin":
                twin_id = payload.get("twin_id")
                if twin_id:
                    self.register_twin_connection(connection_id, twin_id)
            
            elif message_type == "register_team":
                team_id = payload.get("team_id")
                if team_id:
                    self.register_team_connection(connection_id, team_id)
            
        except json.JSONDecodeError:
            await self.connections[connection_id].send_message(MessageType.ERROR, {
                "error": "Invalid JSON message"
            })
        except Exception as e:
            logger.error(f"Error handling message from {connection_id}: {e}")
            await self.connections[connection_id].send_message(MessageType.ERROR, {
                "error": "Internal server error"
            })
    
    async def _heartbeat_loop(self):
        """Background task to send heartbeats and detect dead connections"""
        while True:
            try:
                await asyncio.sleep(30)  # Send heartbeat every 30 seconds
                
                current_time = datetime.utcnow()
                dead_connections = []
                
                for connection_id, connection in self.connections.items():
                    # Check if connection is still alive (last heartbeat within 2 minutes)
                    if (current_time - connection.last_heartbeat).total_seconds() > 120:
                        dead_connections.append(connection_id)
                    else:
                        # Send heartbeat
                        await connection.send_message(MessageType.HEARTBEAT, {
                            "server_time": current_time.isoformat()
                        })
                
                # Clean up dead connections
                for connection_id in dead_connections:
                    await self.disconnect(connection_id)
                
            except Exception as e:
                logger.error(f"Error in heartbeat loop: {e}")
    
    async def _cleanup_loop(self):
        """Background task to clean up empty channels and optimize memory"""
        while True:
            try:
                await asyncio.sleep(300)  # Clean up every 5 minutes
                
                # Remove empty channels
                empty_channels = [
                    channel for channel, subscribers in self.channel_subscribers.items()
                    if not subscribers
                ]
                for channel in empty_channels:
                    del self.channel_subscribers[channel]
                
                # Remove empty team connections
                empty_teams = [
                    team_id for team_id, conn_ids in self.team_connections.items()
                    if not conn_ids
                ]
                for team_id in empty_teams:
                    del self.team_connections[team_id]
                
                # Remove empty twin connections
                empty_twins = [
                    twin_id for twin_id, conn_ids in self.twin_connections.items()
                    if not conn_ids
                ]
                for twin_id in empty_twins:
                    del self.twin_connections[twin_id]
                
            except Exception as e:
                logger.error(f"Error in cleanup loop: {e}")
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        return {
            **self.connection_stats,
            "active_users": len(self.user_connections),
            "active_teams": len(self.team_connections),
            "active_twins": len(self.twin_connections),
            "active_channels": len(self.channel_subscribers)
        }
    
    def get_user_connections(self, user_id: str) -> List[str]:
        """Get all connection IDs for a user"""
        return self.user_connections.get(user_id, [])
    
    def is_user_online(self, user_id: str) -> bool:
        """Check if a user has any active connections"""
        return user_id in self.user_connections and len(self.user_connections[user_id]) > 0

# Global connection manager instance
connection_manager = ConnectionManager()