"""
Notification Models for Platform Owner Alerts
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from enum import Enum as PyEnum
from datetime import datetime


class NotificationType(PyEnum):
    """Notification types"""
    SECURITY_ALERT = "security_alert"
    SYSTEM_HEALTH = "system_health"
    BUSINESS_ALERT = "business_alert"
    REVENUE_ALERT = "revenue_alert"
    USER_ACTIVITY = "user_activity"
    TENANT_ACTIVITY = "tenant_activity"


class NotificationPriority(PyEnum):
    """Notification priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class NotificationStatus(PyEnum):
    """Notification status"""
    PENDING = "pending"
    SENT = "sent"
    READ = "read"
    DISMISSED = "dismissed"
    FAILED = "failed"


class Notification(Base):
    """
    Platform Owner notification model
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "notifications"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Notification Details
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False, index=True)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.MEDIUM, index=True)
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING, index=True)
    
    # Recipients
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Context
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)
    user_context_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # User the notification is about
    
    # Metadata
    context_data = Column(JSON, nullable=True)  # Additional context data
    action_url = Column(String(500), nullable=True)  # URL for action button
    action_text = Column(String(100), nullable=True)  # Text for action button
    
    # Delivery
    delivery_channels = Column(JSON, default=["in_app"])  # in_app, email, sms, webhook
    email_sent = Column(Boolean, default=False)
    email_sent_at = Column(DateTime, nullable=True)
    
    # Timing
    created_at = Column(DateTime, default=func.now(), index=True)
    scheduled_for = Column(DateTime, nullable=True, index=True)  # For scheduled notifications
    sent_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    dismissed_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)  # Auto-dismiss after this time
    
    # Relationships
    recipient = relationship("User", foreign_keys=[recipient_id])
    # tenant = relationship("Tenant")  # Temporarily disabled due to registry conflicts
    user_context = relationship("User", foreign_keys=[user_context_id])
    
    def __repr__(self):
        return f"<Notification(id={self.id}, type='{self.notification_type}', priority='{self.priority}')>"


class NotificationTemplate(Base):
    """
    Notification templates for consistent messaging
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "notification_templates"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Template Details
    name = Column(String(100), unique=True, nullable=False, index=True)
    notification_type = Column(Enum(NotificationType), nullable=False, index=True)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.MEDIUM)
    
    # Template Content
    title_template = Column(String(255), nullable=False)
    message_template = Column(Text, nullable=False)
    action_text_template = Column(String(100), nullable=True)
    action_url_template = Column(String(500), nullable=True)
    
    # Configuration
    delivery_channels = Column(JSON, default=["in_app"])
    is_active = Column(Boolean, default=True)
    auto_dismiss_hours = Column(Integer, nullable=True)  # Auto-dismiss after X hours
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    def __repr__(self):
        return f"<NotificationTemplate(id={self.id}, name='{self.name}', type='{self.notification_type}')>"


class NotificationPreference(Base):
    """
    User notification preferences
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "notification_preferences"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Notification Type Preferences
    security_alerts_enabled = Column(Boolean, default=True)
    system_health_enabled = Column(Boolean, default=True)
    business_alerts_enabled = Column(Boolean, default=True)
    revenue_alerts_enabled = Column(Boolean, default=True)
    user_activity_enabled = Column(Boolean, default=False)
    tenant_activity_enabled = Column(Boolean, default=True)
    
    # Delivery Channel Preferences
    in_app_enabled = Column(Boolean, default=True)
    email_enabled = Column(Boolean, default=True)
    email_address = Column(String(255), nullable=True)  # Override email
    sms_enabled = Column(Boolean, default=False)
    phone_number = Column(String(20), nullable=True)
    webhook_enabled = Column(Boolean, default=False)
    webhook_url = Column(String(500), nullable=True)
    
    # Timing Preferences
    quiet_hours_start = Column(String(5), nullable=True)  # HH:MM format
    quiet_hours_end = Column(String(5), nullable=True)    # HH:MM format
    timezone = Column(String(50), default="UTC")
    
    # Priority Filters
    min_priority = Column(Enum(NotificationPriority), default=NotificationPriority.LOW)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<NotificationPreference(id={self.id}, user_id={self.user_id})>"


class NotificationLog(Base):
    """
    Log of notification delivery attempts
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "notification_logs"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    notification_id = Column(Integer, ForeignKey("notifications.id"), nullable=False, index=True)
    
    # Delivery Details
    channel = Column(String(20), nullable=False)  # in_app, email, sms, webhook
    status = Column(String(20), nullable=False)   # success, failed, pending
    
    # Delivery Metadata
    recipient_address = Column(String(255), nullable=True)  # email, phone, webhook URL
    provider = Column(String(50), nullable=True)  # email provider, SMS provider, etc.
    provider_message_id = Column(String(255), nullable=True)
    
    # Error Information
    error_code = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Timing
    attempted_at = Column(DateTime, default=func.now(), index=True)
    delivered_at = Column(DateTime, nullable=True)
    
    # Relationships
    notification = relationship("Notification")
    
    def __repr__(self):
        return f"<NotificationLog(id={self.id}, notification_id={self.notification_id}, channel='{self.channel}', status='{self.status}')>"