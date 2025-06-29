"""
WebSocket Event Publishers for Digital Twin Platform
Integrates real-time notifications with existing services
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import asyncio

from app.api.websocket_api import (
    broadcast_twin_update,
    broadcast_team_coordination_update,
    broadcast_analytics_update,
    broadcast_notification,
    broadcast_system_alert
)

logger = logging.getLogger(__name__)

class WebSocketEventPublisher:
    """
    Central event publisher for WebSocket notifications
    Integrates with all platform services to provide real-time updates
    """
    
    def __init__(self):
        self.event_queue = asyncio.Queue()
        self.is_running = False
    
    async def start_event_processor(self):
        """Start the background event processor"""
        self.is_running = True
        asyncio.create_task(self._process_events())
        logger.info("WebSocket event processor started")
    
    async def stop_event_processor(self):
        """Stop the background event processor"""
        self.is_running = False
        logger.info("WebSocket event processor stopped")
    
    async def _process_events(self):
        """Background task to process queued events"""
        while self.is_running:
            try:
                # Process events from queue with timeout
                event = await asyncio.wait_for(self.event_queue.get(), timeout=1.0)
                await self._handle_event(event)
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Error processing WebSocket event: {e}")
    
    async def _handle_event(self, event: Dict[str, Any]):
        """Handle individual event based on type"""
        event_type = event.get("type")
        data = event.get("data", {})
        
        try:
            if event_type == "twin_update":
                await broadcast_twin_update(
                    twin_id=data["twin_id"],
                    update_type=data["update_type"],
                    data=data["payload"]
                )
            elif event_type == "team_coordination":
                await broadcast_team_coordination_update(
                    team_id=data["team_id"],
                    coordination_id=data["coordination_id"],
                    status=data["status"],
                    data=data["payload"]
                )
            elif event_type == "analytics_update":
                await broadcast_analytics_update(
                    twin_id=data["twin_id"],
                    analytics_type=data["analytics_type"],
                    insights=data["insights"]
                )
            elif event_type == "notification":
                await broadcast_notification(
                    user_id=data["user_id"],
                    notification_type=data["notification_type"],
                    title=data["title"],
                    message=data["message"],
                    data=data.get("payload", {})
                )
            elif event_type == "system_alert":
                await broadcast_system_alert(
                    alert_type=data["alert_type"],
                    message=data["message"],
                    severity=data.get("severity", "info")
                )
            else:
                logger.warning(f"Unknown event type: {event_type}")
        
        except Exception as e:
            logger.error(f"Error handling event {event_type}: {e}")
    
    # Event Publishing Methods
    
    async def publish_twin_learning_progress(self, twin_id: str, progress_data: Dict[str, Any]):
        """Publish twin learning progress update"""
        await self.event_queue.put({
            "type": "twin_update",
            "data": {
                "twin_id": twin_id,
                "update_type": "learning_progress",
                "payload": {
                    "progress_percentage": progress_data.get("progress", 0),
                    "current_phase": progress_data.get("phase", "unknown"),
                    "insights_generated": progress_data.get("insights_count", 0),
                    "last_activity": datetime.utcnow().isoformat()
                }
            }
        })
    
    async def publish_twin_conversation_update(self, twin_id: str, conversation_data: Dict[str, Any]):
        """Publish twin conversation activity"""
        await self.event_queue.put({
            "type": "twin_update",
            "data": {
                "twin_id": twin_id,
                "update_type": "conversation_activity",
                "payload": {
                    "message_count": conversation_data.get("message_count", 0),
                    "sentiment_score": conversation_data.get("sentiment", 0.0),
                    "topics_discussed": conversation_data.get("topics", []),
                    "engagement_level": conversation_data.get("engagement", "medium")
                }
            }
        })
    
    async def publish_twin_pattern_recognition(self, twin_id: str, patterns: List[Dict[str, Any]]):
        """Publish new pattern recognition results"""
        await self.event_queue.put({
            "type": "analytics_update",
            "data": {
                "twin_id": twin_id,
                "analytics_type": "pattern_recognition",
                "insights": {
                    "patterns_found": len(patterns),
                    "patterns": patterns[:5],  # Send top 5 patterns
                    "confidence_scores": [p.get("confidence", 0) for p in patterns[:5]],
                    "analysis_timestamp": datetime.utcnow().isoformat()
                }
            }
        })
    
    async def publish_twin_prediction_update(self, twin_id: str, predictions: Dict[str, Any]):
        """Publish prediction engine results"""
        await self.event_queue.put({
            "type": "analytics_update",
            "data": {
                "twin_id": twin_id,
                "analytics_type": "predictions",
                "insights": {
                    "prediction_accuracy": predictions.get("accuracy", 0.0),
                    "future_trends": predictions.get("trends", []),
                    "risk_factors": predictions.get("risks", []),
                    "opportunities": predictions.get("opportunities", []),
                    "confidence_interval": predictions.get("confidence", 0.0)
                }
            }
        })
    
    async def publish_team_coordination_start(self, team_id: str, coordination_id: str, 
                                            coordination_type: str, participants: List[str]):
        """Publish team coordination start event"""
        await self.event_queue.put({
            "type": "team_coordination",
            "data": {
                "team_id": team_id,
                "coordination_id": coordination_id,
                "status": "started",
                "payload": {
                    "coordination_type": coordination_type,
                    "participant_count": len(participants),
                    "participants": participants,
                    "start_time": datetime.utcnow().isoformat()
                }
            }
        })
    
    async def publish_team_coordination_progress(self, team_id: str, coordination_id: str, 
                                               progress_data: Dict[str, Any]):
        """Publish team coordination progress update"""
        await self.event_queue.put({
            "type": "team_coordination",
            "data": {
                "team_id": team_id,
                "coordination_id": coordination_id,
                "status": "in_progress",
                "payload": {
                    "progress_percentage": progress_data.get("progress", 0),
                    "completed_tasks": progress_data.get("completed_tasks", []),
                    "active_participants": progress_data.get("active_participants", []),
                    "estimated_completion": progress_data.get("eta", None)
                }
            }
        })
    
    async def publish_team_coordination_complete(self, team_id: str, coordination_id: str, 
                                               results: Dict[str, Any]):
        """Publish team coordination completion"""
        await self.event_queue.put({
            "type": "team_coordination",
            "data": {
                "team_id": team_id,
                "coordination_id": coordination_id,
                "status": "completed",
                "payload": {
                    "success": results.get("success", True),
                    "completion_time": datetime.utcnow().isoformat(),
                    "performance_metrics": results.get("metrics", {}),
                    "optimization_results": results.get("optimization", {}),
                    "participant_feedback": results.get("feedback", [])
                }
            }
        })
    
    async def publish_user_notification(self, user_id: str, notification_type: str, 
                                       title: str, message: str, data: Optional[Dict[str, Any]] = None):
        """Publish user notification"""
        await self.event_queue.put({
            "type": "notification",
            "data": {
                "user_id": user_id,
                "notification_type": notification_type,
                "title": title,
                "message": message,
                "payload": data or {}
            }
        })
    
    async def publish_system_maintenance_alert(self, message: str, severity: str = "info"):
        """Publish system maintenance alert"""
        await self.event_queue.put({
            "type": "system_alert",
            "data": {
                "alert_type": "maintenance",
                "message": message,
                "severity": severity
            }
        })
    
    async def publish_performance_alert(self, metric_name: str, current_value: float, 
                                       threshold: float, severity: str = "warning"):
        """Publish performance monitoring alert"""
        await self.event_queue.put({
            "type": "system_alert",
            "data": {
                "alert_type": "performance",
                "message": f"Performance metric '{metric_name}' is {current_value}, exceeding threshold of {threshold}",
                "severity": severity
            }
        })

# Global event publisher instance
websocket_events = WebSocketEventPublisher()

# Integration Functions for Existing Services

async def integrate_with_twin_services():
    """Integration hooks for twin-related services"""
    
    # Phase 1A: Pattern Recognition Integration
    async def on_pattern_recognition_complete(twin_id: str, patterns: List[Dict[str, Any]]):
        await websocket_events.publish_twin_pattern_recognition(twin_id, patterns)
    
    # Phase 1B: Prediction Engine Integration
    async def on_prediction_update(twin_id: str, predictions: Dict[str, Any]):
        await websocket_events.publish_twin_prediction_update(twin_id, predictions)
    
    # Phase 1C: User Experience Integration
    async def on_conversation_activity(twin_id: str, conversation_data: Dict[str, Any]):
        await websocket_events.publish_twin_conversation_update(twin_id, conversation_data)
    
    # Phase 2: Advanced AI Features Integration
    async def on_learning_progress(twin_id: str, progress_data: Dict[str, Any]):
        await websocket_events.publish_twin_learning_progress(twin_id, progress_data)
    
    return {
        "pattern_recognition": on_pattern_recognition_complete,
        "prediction_update": on_prediction_update,
        "conversation_activity": on_conversation_activity,
        "learning_progress": on_learning_progress
    }

async def integrate_with_team_services():
    """Integration hooks for team coordination services"""
    
    # Phase 3: Team Coordination Integration
    async def on_coordination_start(team_id: str, coordination_id: str, 
                                   coordination_type: str, participants: List[str]):
        await websocket_events.publish_team_coordination_start(
            team_id, coordination_id, coordination_type, participants
        )
    
    async def on_coordination_progress(team_id: str, coordination_id: str, 
                                     progress_data: Dict[str, Any]):
        await websocket_events.publish_team_coordination_progress(
            team_id, coordination_id, progress_data
        )
    
    async def on_coordination_complete(team_id: str, coordination_id: str, 
                                     results: Dict[str, Any]):
        await websocket_events.publish_team_coordination_complete(
            team_id, coordination_id, results
        )
    
    return {
        "coordination_start": on_coordination_start,
        "coordination_progress": on_coordination_progress,
        "coordination_complete": on_coordination_complete
    }

async def integrate_with_platform_services():
    """Integration hooks for platform-wide services"""
    
    async def on_user_notification(user_id: str, notification_type: str, 
                                  title: str, message: str, data: Optional[Dict[str, Any]] = None):
        await websocket_events.publish_user_notification(
            user_id, notification_type, title, message, data
        )
    
    async def on_system_alert(alert_type: str, message: str, severity: str = "info"):
        await websocket_events.publish_system_maintenance_alert(message, severity)
    
    async def on_performance_alert(metric_name: str, current_value: float, 
                                  threshold: float, severity: str = "warning"):
        await websocket_events.publish_performance_alert(
            metric_name, current_value, threshold, severity
        )
    
    return {
        "user_notification": on_user_notification,
        "system_alert": on_system_alert,
        "performance_alert": on_performance_alert
    }

# Startup function to initialize WebSocket events
async def initialize_websocket_events():
    """Initialize WebSocket event system"""
    await websocket_events.start_event_processor()
    
    # Register integration hooks
    twin_hooks = await integrate_with_twin_services()
    team_hooks = await integrate_with_team_services()
    platform_hooks = await integrate_with_platform_services()
    
    logger.info("WebSocket event system initialized with service integrations")
    
    return {
        "twin_hooks": twin_hooks,
        "team_hooks": team_hooks,
        "platform_hooks": platform_hooks
    }