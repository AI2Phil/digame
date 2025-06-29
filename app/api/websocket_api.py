"""
WebSocket API endpoints for Digital Twin Platform
Provides real-time communication for twin updates, team coordination, and notifications
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from typing import Optional, Dict, Any
import logging
import json
from datetime import datetime

from app.websocket.connection_manager import connection_manager, ConnectionType, MessageType
from app.auth.auth_dependencies import get_current_user_websocket
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["WebSocket"])

@router.websocket("/twin/{twin_id}")
async def websocket_twin_endpoint(
    websocket: WebSocket,
    twin_id: str,
    token: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint for real-time twin updates
    Provides live updates for twin status, learning progress, and insights
    """
    connection_id = None
    try:
        # Authenticate user (simplified for WebSocket)
        user_id = await authenticate_websocket_user(token, db)
        if not user_id:
            await websocket.close(code=4001, reason="Authentication failed")
            return
        
        # Establish connection
        connection_id = await connection_manager.connect(
            websocket=websocket,
            user_id=user_id,
            connection_type=ConnectionType.TWIN_OWNER,
            metadata={"twin_id": twin_id}
        )
        
        # Register for twin-specific updates
        connection_manager.register_twin_connection(connection_id, twin_id)
        
        # Subscribe to relevant channels
        connection_manager.subscribe_to_channel(connection_id, f"twin:{twin_id}")
        connection_manager.subscribe_to_channel(connection_id, f"user:{user_id}")
        
        logger.info(f"Twin WebSocket connected: {connection_id} for twin {twin_id}")
        
        # Listen for messages
        while True:
            try:
                message = await websocket.receive_text()
                await connection_manager.handle_message(connection_id, message)
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error handling twin WebSocket message: {e}")
                await connection_manager.connections[connection_id].send_message(
                    MessageType.ERROR,
                    {"error": "Message processing failed"}
                )
    
    except WebSocketDisconnect:
        logger.info(f"Twin WebSocket disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"Twin WebSocket error: {e}")
    finally:
        if connection_id:
            await connection_manager.disconnect(connection_id)

@router.websocket("/team/{team_id}")
async def websocket_team_endpoint(
    websocket: WebSocket,
    team_id: str,
    token: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint for real-time team coordination updates
    Provides live updates for team coordination, member status, and analytics
    """
    connection_id = None
    try:
        # Authenticate user
        user_id = await authenticate_websocket_user(token, db)
        if not user_id:
            await websocket.close(code=4001, reason="Authentication failed")
            return
        
        # Establish connection
        connection_id = await connection_manager.connect(
            websocket=websocket,
            user_id=user_id,
            connection_type=ConnectionType.TEAM_MEMBER,
            metadata={"team_id": team_id}
        )
        
        # Register for team-specific updates
        connection_manager.register_team_connection(connection_id, team_id)
        
        # Subscribe to relevant channels
        connection_manager.subscribe_to_channel(connection_id, f"team:{team_id}")
        connection_manager.subscribe_to_channel(connection_id, f"user:{user_id}")
        connection_manager.subscribe_to_channel(connection_id, "team_coordination")
        
        logger.info(f"Team WebSocket connected: {connection_id} for team {team_id}")
        
        # Listen for messages
        while True:
            try:
                message = await websocket.receive_text()
                await connection_manager.handle_message(connection_id, message)
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error handling team WebSocket message: {e}")
                await connection_manager.connections[connection_id].send_message(
                    MessageType.ERROR,
                    {"error": "Message processing failed"}
                )
    
    except WebSocketDisconnect:
        logger.info(f"Team WebSocket disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"Team WebSocket error: {e}")
    finally:
        if connection_id:
            await connection_manager.disconnect(connection_id)

@router.websocket("/platform")
async def websocket_platform_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint for platform-wide updates
    Provides system notifications, alerts, and global updates
    """
    connection_id = None
    try:
        # Authenticate user
        user_id = await authenticate_websocket_user(token, db)
        if not user_id:
            await websocket.close(code=4001, reason="Authentication failed")
            return
        
        # Establish connection
        connection_id = await connection_manager.connect(
            websocket=websocket,
            user_id=user_id,
            connection_type=ConnectionType.PLATFORM_ADMIN,
            metadata={"scope": "platform"}
        )
        
        # Subscribe to platform channels
        connection_manager.subscribe_to_channel(connection_id, f"user:{user_id}")
        connection_manager.subscribe_to_channel(connection_id, "platform_notifications")
        connection_manager.subscribe_to_channel(connection_id, "system_alerts")
        
        logger.info(f"Platform WebSocket connected: {connection_id}")
        
        # Listen for messages
        while True:
            try:
                message = await websocket.receive_text()
                await connection_manager.handle_message(connection_id, message)
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error handling platform WebSocket message: {e}")
                await connection_manager.connections[connection_id].send_message(
                    MessageType.ERROR,
                    {"error": "Message processing failed"}
                )
    
    except WebSocketDisconnect:
        logger.info(f"Platform WebSocket disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"Platform WebSocket error: {e}")
    finally:
        if connection_id:
            await connection_manager.disconnect(connection_id)

# WebSocket Event Broadcasting Functions

async def broadcast_twin_update(twin_id: str, update_type: str, data: Dict[str, Any]):
    """Broadcast twin update to all connected clients"""
    await connection_manager.send_to_twin(
        twin_id=twin_id,
        message_type=MessageType.TWIN_UPDATE,
        data={
            "twin_id": twin_id,
            "update_type": update_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

async def broadcast_team_coordination_update(team_id: str, coordination_id: str, 
                                           status: str, data: Dict[str, Any]):
    """Broadcast team coordination update to all team members"""
    await connection_manager.send_to_team(
        team_id=team_id,
        message_type=MessageType.TEAM_COORDINATION_UPDATE,
        data={
            "team_id": team_id,
            "coordination_id": coordination_id,
            "status": status,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

async def broadcast_analytics_update(twin_id: str, analytics_type: str, insights: Dict[str, Any]):
    """Broadcast analytics update to twin owner"""
    await connection_manager.send_to_twin(
        twin_id=twin_id,
        message_type=MessageType.ANALYTICS_UPDATE,
        data={
            "twin_id": twin_id,
            "analytics_type": analytics_type,
            "insights": insights,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

async def broadcast_notification(user_id: str, notification_type: str, 
                                title: str, message: str, data: Dict[str, Any] = None):
    """Send notification to specific user"""
    await connection_manager.send_to_user(
        user_id=user_id,
        message_type=MessageType.NOTIFICATION,
        data={
            "notification_type": notification_type,
            "title": title,
            "message": message,
            "data": data or {},
            "timestamp": datetime.utcnow().isoformat()
        }
    )

async def broadcast_system_alert(alert_type: str, message: str, severity: str = "info"):
    """Broadcast system alert to all platform users"""
    await connection_manager.broadcast_to_channel(
        channel="system_alerts",
        message_type=MessageType.SYSTEM_ALERT,
        data={
            "alert_type": alert_type,
            "message": message,
            "severity": severity,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# Helper Functions

async def authenticate_websocket_user(token: Optional[str], db: AsyncSession) -> Optional[str]:
    """Authenticate WebSocket user with token"""
    if not token:
        return None
    
    try:
        # Simplified authentication - in production, use proper JWT validation
        # For now, return a mock user ID
        return "user_123"  # This would be replaced with actual JWT validation
    except Exception as e:
        logger.error(f"WebSocket authentication error: {e}")
        return None

# WebSocket Management Endpoints

@router.get("/connections/stats")
async def get_connection_stats():
    """Get WebSocket connection statistics"""
    try:
        stats = connection_manager.get_connection_stats()
        return {
            "success": True,
            "stats": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting connection stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get connection stats")

@router.get("/connections/user/{user_id}")
async def get_user_connections(user_id: str):
    """Get active connections for a specific user"""
    try:
        connections = connection_manager.get_user_connections(user_id)
        is_online = connection_manager.is_user_online(user_id)
        
        return {
            "success": True,
            "user_id": user_id,
            "is_online": is_online,
            "connection_count": len(connections),
            "connections": connections,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting user connections: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user connections")

@router.post("/broadcast/test")
async def test_broadcast(
    message_type: str,
    channel: str,
    data: Dict[str, Any]
):
    """Test endpoint for broadcasting messages"""
    try:
        message_type_enum = MessageType(message_type)
        sent_count = await connection_manager.broadcast_to_channel(
            channel=channel,
            message_type=message_type_enum,
            data=data
        )
        
        return {
            "success": True,
            "message": f"Broadcast sent to {sent_count} connections",
            "channel": channel,
            "message_type": message_type,
            "timestamp": datetime.utcnow().isoformat()
        }
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid message type: {message_type}")
    except Exception as e:
        logger.error(f"Error in test broadcast: {e}")
        raise HTTPException(status_code=500, detail="Failed to send broadcast")