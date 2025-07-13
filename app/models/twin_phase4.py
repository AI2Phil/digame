"""
Database models for Phase 4: Advanced Frontend Features
WebSocket connections, PWA data, and real-time event storage
"""

from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

# Use the existing Base from the project
from ..database import Base

class WebSocketConnection(Base):
    """Track active WebSocket connections"""
    __tablename__ = "websocket_connections"
    __table_args__ = {'extend_existing': True}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    connection_id = Column(String(255), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    connection_type = Column(String(50), nullable=False)  # twin_owner, team_member, platform_admin, guest
    endpoint = Column(String(255), nullable=False)  # /ws/twin/{id}, /ws/team/{id}, /ws/platform
    connection_metadata = Column(JSON, nullable=True)  # Additional connection data
    
    # Connection lifecycle
    connected_at = Column(DateTime(timezone=True), server_default=func.now())
    last_heartbeat = Column(DateTime(timezone=True), server_default=func.now())
    disconnected_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Performance metrics
    messages_sent = Column(Integer, default=0)
    messages_received = Column(Integer, default=0)
    bytes_sent = Column(Integer, default=0)
    bytes_received = Column(Integer, default=0)
    
    def __repr__(self):
        return f"<WebSocketConnection(id={self.connection_id}, type={self.connection_type}, active={self.is_active})>"

class WebSocketMessage(Base):
    """Store WebSocket messages for debugging and analytics"""
    __tablename__ = "websocket_messages"
    __table_args__ = {'extend_existing': True}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    connection_id = Column(String(255), ForeignKey('websocket_connections.connection_id'), nullable=False, index=True)
    message_type = Column(String(100), nullable=False, index=True)
    direction = Column(String(10), nullable=False)  # 'inbound' or 'outbound'
    
    # Message content
    message_data = Column(JSON, nullable=False)
    message_size = Column(Integer, nullable=False)
    
    # Timing and performance
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    processing_time_ms = Column(Integer, nullable=True)
    
    # Status and error handling
    status = Column(String(20), default='sent', nullable=False)  # sent, delivered, failed, queued
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    
    def __repr__(self):
        return f"<WebSocketMessage(type={self.message_type}, direction={self.direction}, status={self.status})>"

class WebSocketChannel(Base):
    """Track WebSocket channels and subscriptions"""
    __tablename__ = "websocket_channels"
    __table_args__ = {'extend_existing': True}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    channel_name = Column(String(255), unique=True, nullable=False, index=True)
    channel_type = Column(String(50), nullable=False)  # twin, team, platform, user
    description = Column(Text, nullable=True)
    
    # Channel configuration
    is_active = Column(Boolean, default=True, nullable=False)
    max_subscribers = Column(Integer, default=1000)
    message_retention_hours = Column(Integer, default=24)
    
    # Statistics
    total_subscribers = Column(Integer, default=0)
    total_messages = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<WebSocketChannel(name={self.channel_name}, type={self.channel_type}, subscribers={self.total_subscribers})>"

class WebSocketSubscription(Base):
    """Track user subscriptions to WebSocket channels"""
    __tablename__ = "websocket_subscriptions"
    __table_args__ = {'extend_existing': True}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    connection_id = Column(String(255), ForeignKey('websocket_connections.connection_id'), nullable=False, index=True)
    channel_name = Column(String(255), ForeignKey('websocket_channels.channel_name'), nullable=False, index=True)
    
    # Subscription details
    subscribed_at = Column(DateTime(timezone=True), server_default=func.now())
    unsubscribed_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Subscription preferences
    message_filters = Column(JSON, nullable=True)  # Filter criteria for messages
    priority_level = Column(String(20), default='normal')  # high, normal, low
    
    def __repr__(self):
        return f"<WebSocketSubscription(connection={self.connection_id}, channel={self.channel_name}, active={self.is_active})>"

class PWAInstallation(Base):
    """Track PWA installations and usage"""
    __tablename__ = "pwa_installations"
    __table_args__ = {'extend_existing': True}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    installation_id = Column(String(255), unique=True, nullable=False)  # Unique per device/browser
    
    # Installation details
    platform = Column(String(50), nullable=False)  # android, ios, windows, macos, linux
    browser = Column(String(50), nullable=False)  # chrome, firefox, safari, edge
    device_type = Column(String(20), nullable=False)  # mobile, tablet, desktop
    
    # PWA features
    supports_offline = Column(Boolean, default=False)
    supports_push = Column(Boolean, default=False)
    supports_background_sync = Column(Boolean, default=False)
    
    # Installation lifecycle
    installed_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), server_default=func.now())
    uninstalled_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Usage statistics
    total_sessions = Column(Integer, default=0)
    total_offline_usage_minutes = Column(Integer, default=0)
    push_notifications_enabled = Column(Boolean, default=False)
    
    def __repr__(self):
        return f"<PWAInstallation(user={self.user_id}, platform={self.platform}, active={self.is_active})>"

class PWANotification(Base):
    """Track PWA push notifications"""
    __tablename__ = "pwa_notifications"
    __table_args__ = {'extend_existing': True}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    installation_id = Column(String(255), ForeignKey('pwa_installations.installation_id'), nullable=False, index=True)
    
    # Notification content
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    icon = Column(String(255), nullable=True)
    badge = Column(String(255), nullable=True)
    
    # Notification configuration
    notification_type = Column(String(50), nullable=False)  # twin_update, team_alert, system_notification
    priority = Column(String(20), default='normal')  # high, normal, low
    require_interaction = Column(Boolean, default=False)
    
    # Delivery tracking
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    clicked_at = Column(DateTime(timezone=True), nullable=True)
    dismissed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Status
    status = Column(String(20), default='sent')  # sent, delivered, clicked, dismissed, failed
    error_message = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<PWANotification(user={self.user_id}, type={self.notification_type}, status={self.status})>"

class OfflineAction(Base):
    """Store actions performed while offline for background sync"""
    __tablename__ = "offline_actions"
    __table_args__ = {'extend_existing': True}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    installation_id = Column(String(255), ForeignKey('pwa_installations.installation_id'), nullable=False, index=True)
    
    # Action details
    action_type = Column(String(100), nullable=False)  # api_call, data_update, file_upload
    endpoint = Column(String(255), nullable=False)
    http_method = Column(String(10), nullable=False)
    request_data = Column(JSON, nullable=True)
    
    # Sync status
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    synced_at = Column(DateTime(timezone=True), nullable=True)
    is_synced = Column(Boolean, default=False, nullable=False)
    sync_attempts = Column(Integer, default=0)
    
    # Error handling
    last_error = Column(Text, nullable=True)
    max_retry_attempts = Column(Integer, default=3)
    next_retry_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<OfflineAction(user={self.user_id}, type={self.action_type}, synced={self.is_synced})>"

class RealTimeEvent(Base):
    """Store real-time events for analytics and debugging"""
    __tablename__ = "realtime_events"
    __table_args__ = {'extend_existing': True}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(100), nullable=False, index=True)
    source_type = Column(String(50), nullable=False)  # twin, team, platform, user
    source_id = Column(String(255), nullable=False, index=True)
    
    # Event data
    event_data = Column(JSON, nullable=False)
    event_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Processing status
    processed = Column(Boolean, default=False, nullable=False)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    
    # Distribution tracking
    total_recipients = Column(Integer, default=0)
    successful_deliveries = Column(Integer, default=0)
    failed_deliveries = Column(Integer, default=0)
    
    def __repr__(self):
        return f"<RealTimeEvent(type={self.event_type}, source={self.source_type}:{self.source_id}, processed={self.processed})>"

class ConnectionStatistics(Base):
    """Aggregate WebSocket connection statistics"""
    __tablename__ = "connection_statistics"
    __table_args__ = {'extend_existing': True}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    hour = Column(Integer, nullable=False)  # 0-23
    
    # Connection metrics
    total_connections = Column(Integer, default=0)
    peak_concurrent_connections = Column(Integer, default=0)
    average_connection_duration_minutes = Column(Float, default=0.0)
    
    # Message metrics
    total_messages_sent = Column(Integer, default=0)
    total_messages_received = Column(Integer, default=0)
    average_message_size_bytes = Column(Float, default=0.0)
    
    # Performance metrics
    average_response_time_ms = Column(Float, default=0.0)
    error_rate_percentage = Column(Float, default=0.0)
    reconnection_rate_percentage = Column(Float, default=0.0)
    
    # By connection type
    twin_connections = Column(Integer, default=0)
    team_connections = Column(Integer, default=0)
    platform_connections = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<ConnectionStatistics(date={self.date}, total={self.total_connections}, peak={self.peak_concurrent_connections})>"