"""
Platform Owner Notification Service
Handles creation, delivery, and management of notifications
"""

from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from datetime import datetime, timedelta
import logging
import json

from ..models.notifications import (
    Notification, NotificationTemplate, NotificationPreference, NotificationLog,
    NotificationType, NotificationPriority, NotificationStatus
)
from ..models.user import User
from ..models.tenant import Tenant
from ..database import get_db

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing Platform Owner notifications"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_notification(
        self,
        recipient_id: int,
        title: str,
        message: str,
        notification_type: NotificationType,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        tenant_id: Optional[int] = None,
        user_context_id: Optional[int] = None,
        context_data: Optional[Dict[str, Any]] = None,
        action_url: Optional[str] = None,
        action_text: Optional[str] = None,
        delivery_channels: Optional[List[str]] = None,
        scheduled_for: Optional[datetime] = None,
        expires_at: Optional[datetime] = None
    ) -> Notification:
        """Create a new notification"""
        
        notification = Notification(
            recipient_id=recipient_id,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            tenant_id=tenant_id,
            user_context_id=user_context_id,
            context_data=context_data,
            action_url=action_url,
            action_text=action_text,
            delivery_channels=delivery_channels or ["in_app"],
            scheduled_for=scheduled_for,
            expires_at=expires_at
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        # Send immediately if not scheduled
        if not scheduled_for:
            self._deliver_notification(notification)
        
        logger.info(f"Created notification {notification.id} for user {recipient_id}")
        return notification
    
    def create_from_template(
        self,
        template_name: str,
        recipient_id: int,
        template_vars: Dict[str, Any],
        tenant_id: Optional[int] = None,
        user_context_id: Optional[int] = None,
        context_data: Optional[Dict[str, Any]] = None,
        scheduled_for: Optional[datetime] = None
    ) -> Optional[Notification]:
        """Create notification from template"""
        
        template = self.db.query(NotificationTemplate).filter(
            NotificationTemplate.name == template_name,
            NotificationTemplate.is_active == True
        ).first()
        
        if not template:
            logger.error(f"Template '{template_name}' not found or inactive")
            return None
        
        # Render template
        try:
            title = template.title_template.format(**template_vars)
            message = template.message_template.format(**template_vars)
            action_text = template.action_text_template.format(**template_vars) if template.action_text_template else None
            action_url = template.action_url_template.format(**template_vars) if template.action_url_template else None
        except KeyError as e:
            logger.error(f"Template variable missing: {e}")
            return None
        
        # Calculate expiry
        expires_at = None
        if template.auto_dismiss_hours:
            expires_at = datetime.utcnow() + timedelta(hours=template.auto_dismiss_hours)
        
        return self.create_notification(
            recipient_id=recipient_id,
            title=title,
            message=message,
            notification_type=template.notification_type,
            priority=template.priority,
            tenant_id=tenant_id,
            user_context_id=user_context_id,
            context_data=context_data,
            action_url=action_url,
            action_text=action_text,
            delivery_channels=template.delivery_channels,
            scheduled_for=scheduled_for,
            expires_at=expires_at
        )
    
    def get_notifications(
        self,
        recipient_id: int,
        status: Optional[NotificationStatus] = None,
        notification_type: Optional[NotificationType] = None,
        priority: Optional[NotificationPriority] = None,
        limit: int = 50,
        offset: int = 0,
        include_expired: bool = False
    ) -> List[Notification]:
        """Get notifications for a user"""
        
        query = self.db.query(Notification).filter(
            Notification.recipient_id == recipient_id
        )
        
        if status:
            query = query.filter(Notification.status == status)
        
        if notification_type:
            query = query.filter(Notification.notification_type == notification_type)
        
        if priority:
            query = query.filter(Notification.priority == priority)
        
        if not include_expired:
            query = query.filter(
                or_(
                    Notification.expires_at.is_(None),
                    Notification.expires_at > datetime.utcnow()
                )
            )
        
        return query.order_by(desc(Notification.created_at)).offset(offset).limit(limit).all()
    
    def mark_as_read(self, notification_id: int, user_id: int) -> bool:
        """Mark notification as read"""
        
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.recipient_id == user_id
        ).first()
        
        if not notification:
            return False
        
        notification.status = NotificationStatus.READ
        notification.read_at = datetime.utcnow()
        self.db.commit()
        
        logger.info(f"Marked notification {notification_id} as read")
        return True
    
    def dismiss_notification(self, notification_id: int, user_id: int) -> bool:
        """Dismiss notification"""
        
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.recipient_id == user_id
        ).first()
        
        if not notification:
            return False
        
        notification.status = NotificationStatus.DISMISSED
        notification.dismissed_at = datetime.utcnow()
        self.db.commit()
        
        logger.info(f"Dismissed notification {notification_id}")
        return True
    
    def get_unread_count(self, user_id: int) -> int:
        """Get count of unread notifications"""
        
        return self.db.query(Notification).filter(
            Notification.recipient_id == user_id,
            Notification.status.in_([NotificationStatus.PENDING, NotificationStatus.SENT]),
            or_(
                Notification.expires_at.is_(None),
                Notification.expires_at > datetime.utcnow()
            )
        ).count()
    
    def _deliver_notification(self, notification: Notification) -> None:
        """Deliver notification through configured channels"""
        
        # Get user preferences
        preferences = self.db.query(NotificationPreference).filter(
            NotificationPreference.user_id == notification.recipient_id
        ).first()
        
        # Check if notification type is enabled
        if preferences and not self._is_notification_type_enabled(preferences, notification.notification_type):
            logger.info(f"Notification type {notification.notification_type} disabled for user {notification.recipient_id}")
            return
        
        # Check priority filter
        if preferences and self._is_below_min_priority(preferences, notification.priority):
            logger.info(f"Notification priority {notification.priority} below minimum for user {notification.recipient_id}")
            return
        
        # Deliver through each channel
        for channel in notification.delivery_channels:
            if self._is_channel_enabled(preferences, channel):
                self._deliver_to_channel(notification, channel, preferences)
        
        # Update notification status
        notification.status = NotificationStatus.SENT
        notification.sent_at = datetime.utcnow()
        self.db.commit()
    
    def _is_notification_type_enabled(self, preferences: NotificationPreference, notification_type: NotificationType) -> bool:
        """Check if notification type is enabled in preferences"""
        
        type_mapping = {
            NotificationType.SECURITY_ALERT: preferences.security_alerts_enabled,
            NotificationType.SYSTEM_HEALTH: preferences.system_health_enabled,
            NotificationType.BUSINESS_ALERT: preferences.business_alerts_enabled,
            NotificationType.REVENUE_ALERT: preferences.revenue_alerts_enabled,
            NotificationType.USER_ACTIVITY: preferences.user_activity_enabled,
            NotificationType.TENANT_ACTIVITY: preferences.tenant_activity_enabled,
        }
        
        return type_mapping.get(notification_type, True)
    
    def _is_below_min_priority(self, preferences: NotificationPreference, priority: NotificationPriority) -> bool:
        """Check if notification priority is below minimum"""
        
        priority_levels = {
            NotificationPriority.LOW: 1,
            NotificationPriority.MEDIUM: 2,
            NotificationPriority.HIGH: 3,
            NotificationPriority.CRITICAL: 4
        }
        
        min_level = priority_levels.get(preferences.min_priority, 1)
        notification_level = priority_levels.get(priority, 1)
        
        return notification_level < min_level
    
    def _is_channel_enabled(self, preferences: Optional[NotificationPreference], channel: str) -> bool:
        """Check if delivery channel is enabled"""
        
        if not preferences:
            return channel == "in_app"  # Default to in-app only
        
        channel_mapping = {
            "in_app": preferences.in_app_enabled,
            "email": preferences.email_enabled,
            "sms": preferences.sms_enabled,
            "webhook": preferences.webhook_enabled,
        }
        
        return channel_mapping.get(channel, False)
    
    def _deliver_to_channel(self, notification: Notification, channel: str, preferences: Optional[NotificationPreference]) -> None:
        """Deliver notification to specific channel"""
        
        log_entry = NotificationLog(
            notification_id=notification.id,
            channel=channel,
            status="pending",
            attempted_at=datetime.utcnow()
        )
        
        try:
            if channel == "in_app":
                # In-app notifications are stored in database (already done)
                log_entry.status = "success"
                log_entry.delivered_at = datetime.utcnow()
                
            elif channel == "email":
                self._send_email_notification(notification, preferences, log_entry)
                
            elif channel == "sms":
                self._send_sms_notification(notification, preferences, log_entry)
                
            elif channel == "webhook":
                self._send_webhook_notification(notification, preferences, log_entry)
                
        except Exception as e:
            log_entry.status = "failed"
            log_entry.error_message = str(e)
            logger.error(f"Failed to deliver notification {notification.id} via {channel}: {e}")
        
        self.db.add(log_entry)
        self.db.commit()
    
    def _send_email_notification(self, notification: Notification, preferences: Optional[NotificationPreference], log_entry: NotificationLog) -> None:
        """Send email notification (placeholder implementation)"""
        
        # Get email address
        email = preferences.email_address if preferences and preferences.email_address else notification.recipient.email
        log_entry.recipient_address = email
        
        # TODO: Implement actual email sending
        # For now, just mark as success
        log_entry.status = "success"
        log_entry.delivered_at = datetime.utcnow()
        log_entry.provider = "placeholder"
        
        logger.info(f"Email notification sent to {email} (placeholder)")
    
    def _send_sms_notification(self, notification: Notification, preferences: Optional[NotificationPreference], log_entry: NotificationLog) -> None:
        """Send SMS notification (placeholder implementation)"""
        
        if not preferences or not preferences.phone_number:
            raise ValueError("No phone number configured")
        
        log_entry.recipient_address = preferences.phone_number
        
        # TODO: Implement actual SMS sending
        # For now, just mark as success
        log_entry.status = "success"
        log_entry.delivered_at = datetime.utcnow()
        log_entry.provider = "placeholder"
        
        logger.info(f"SMS notification sent to {preferences.phone_number} (placeholder)")
    
    def _send_webhook_notification(self, notification: Notification, preferences: Optional[NotificationPreference], log_entry: NotificationLog) -> None:
        """Send webhook notification (placeholder implementation)"""
        
        if not preferences or not preferences.webhook_url:
            raise ValueError("No webhook URL configured")
        
        log_entry.recipient_address = preferences.webhook_url
        
        # TODO: Implement actual webhook sending
        # For now, just mark as success
        log_entry.status = "success"
        log_entry.delivered_at = datetime.utcnow()
        log_entry.provider = "webhook"
        
        logger.info(f"Webhook notification sent to {preferences.webhook_url} (placeholder)")
    
    def process_scheduled_notifications(self) -> int:
        """Process notifications scheduled for delivery"""
        
        scheduled_notifications = self.db.query(Notification).filter(
            Notification.status == NotificationStatus.PENDING,
            Notification.scheduled_for <= datetime.utcnow()
        ).all()
        
        count = 0
        for notification in scheduled_notifications:
            self._deliver_notification(notification)
            count += 1
        
        logger.info(f"Processed {count} scheduled notifications")
        return count
    
    def cleanup_expired_notifications(self) -> int:
        """Clean up expired notifications"""
        
        expired_notifications = self.db.query(Notification).filter(
            Notification.expires_at <= datetime.utcnow(),
            Notification.status != NotificationStatus.DISMISSED
        ).all()
        
        count = 0
        for notification in expired_notifications:
            notification.status = NotificationStatus.DISMISSED
            notification.dismissed_at = datetime.utcnow()
            count += 1
        
        self.db.commit()
        logger.info(f"Cleaned up {count} expired notifications")
        return count


# Convenience functions for common notification types
def notify_security_alert(
    db: Session,
    recipient_id: int,
    title: str,
    message: str,
    tenant_id: Optional[int] = None,
    user_context_id: Optional[int] = None,
    context_data: Optional[Dict[str, Any]] = None
) -> Notification:
    """Create security alert notification"""
    
    service = NotificationService(db)
    return service.create_notification(
        recipient_id=recipient_id,
        title=title,
        message=message,
        notification_type=NotificationType.SECURITY_ALERT,
        priority=NotificationPriority.HIGH,
        tenant_id=tenant_id,
        user_context_id=user_context_id,
        context_data=context_data,
        delivery_channels=["in_app", "email"]
    )


def notify_system_health(
    db: Session,
    recipient_id: int,
    title: str,
    message: str,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    context_data: Optional[Dict[str, Any]] = None
) -> Notification:
    """Create system health notification"""
    
    service = NotificationService(db)
    return service.create_notification(
        recipient_id=recipient_id,
        title=title,
        message=message,
        notification_type=NotificationType.SYSTEM_HEALTH,
        priority=priority,
        context_data=context_data,
        delivery_channels=["in_app", "email"] if priority in [NotificationPriority.HIGH, NotificationPriority.CRITICAL] else ["in_app"]
    )


def notify_business_alert(
    db: Session,
    recipient_id: int,
    title: str,
    message: str,
    tenant_id: Optional[int] = None,
    context_data: Optional[Dict[str, Any]] = None,
    action_url: Optional[str] = None,
    action_text: Optional[str] = None
) -> Notification:
    """Create business alert notification"""
    
    service = NotificationService(db)
    return service.create_notification(
        recipient_id=recipient_id,
        title=title,
        message=message,
        notification_type=NotificationType.BUSINESS_ALERT,
        priority=NotificationPriority.MEDIUM,
        tenant_id=tenant_id,
        context_data=context_data,
        action_url=action_url,
        action_text=action_text,
        delivery_channels=["in_app", "email"]
    )


def notify_revenue_alert(
    db: Session,
    recipient_id: int,
    title: str,
    message: str,
    priority: NotificationPriority = NotificationPriority.HIGH,
    context_data: Optional[Dict[str, Any]] = None
) -> Notification:
    """Create revenue alert notification"""
    
    service = NotificationService(db)
    return service.create_notification(
        recipient_id=recipient_id,
        title=title,
        message=message,
        notification_type=NotificationType.REVENUE_ALERT,
        priority=priority,
        context_data=context_data,
        delivery_channels=["in_app", "email"]
    )


def get_notification_service(db: Optional[Session] = None) -> NotificationService:
    """Factory function to get notification service instance"""
    if db is None:
        db = next(get_db())
    
    return NotificationService(db)
