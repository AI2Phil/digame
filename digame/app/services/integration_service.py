"""
Integration service layer for third-party productivity tools and services
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import asyncio
import aiohttp
import json
import hashlib
import hmac
import base64
from urllib.parse import urlencode

from ..models.integration import (
    IntegrationProvider, IntegrationConnection, IntegrationSyncLog,
    IntegrationWebhook, IntegrationDataMapping, IntegrationAnalytics
)
from ..database import get_db


class IntegrationService:
    """
    Core integration service for managing third-party connections
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_providers(self, category: Optional[str] = None, is_active: bool = True) -> List[IntegrationProvider]:
        """
        Get available integration providers
        """
        query = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.is_active == is_active
        )
        
        if category:
            query = query.filter(IntegrationProvider.category == category)
        
        return query.order_by(IntegrationProvider.display_name).all()
    
    def create_provider(self, provider_data: Dict[str, Any]) -> IntegrationProvider:
        """
        Create a new integration provider
        """
        provider = IntegrationProvider(
            name=provider_data["name"],
            display_name=provider_data["display_name"],
            description=provider_data.get("description"),
            category=provider_data["category"],
            base_url=provider_data.get("base_url"),
            auth_type=provider_data["auth_type"],
            auth_config=provider_data.get("auth_config", {}),
            supported_operations=provider_data.get("supported_operations", []),
            rate_limits=provider_data.get("rate_limits", {}),
            data_formats=provider_data.get("data_formats", ["json"]),
            logo_url=provider_data.get("logo_url"),
            documentation_url=provider_data.get("documentation_url"),
            version=provider_data.get("version", "1.0")
        )
        
        self.db.add(provider)
        self.db.commit()
        return provider
    
    def create_connection(
        self,
        tenant_id: int,
        user_id: int,
        provider_id: int,
        connection_data: Dict[str, Any]
    ) -> IntegrationConnection:
        """
        Create a new integration connection
        """
        connection = IntegrationConnection(
            tenant_id=tenant_id,
            user_id=user_id,
            provider_id=provider_id,
            connection_name=connection_data["connection_name"],
            external_account_id=connection_data.get("external_account_id"),
            external_account_name=connection_data.get("external_account_name"),
            auth_data=connection_data.get("auth_data", {}),
            refresh_token=connection_data.get("refresh_token"),
            token_expires_at=connection_data.get("token_expires_at"),
            sync_settings=connection_data.get("sync_settings", {}),
            field_mappings=connection_data.get("field_mappings", {}),
            filters=connection_data.get("filters", {})
        )
        
        self.db.add(connection)
        self.db.commit()
        
        # Test the connection
        self._test_connection(connection)
        
        return connection
    
    def get_connections(
        self,
        tenant_id: int,
        user_id: Optional[int] = None,
        provider_id: Optional[int] = None,
        status: Optional[str] = None
    ) -> List[IntegrationConnection]:
        """
        Get integration connections for a tenant
        """
        query = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id
        )
        
        if user_id:
            query = query.filter(IntegrationConnection.user_id == user_id)
        
        if provider_id:
            query = query.filter(IntegrationConnection.provider_id == provider_id)
        
        if status:
            query = query.filter(IntegrationConnection.status == status)
        
        return query.order_by(IntegrationConnection.created_at.desc()).all()
    
    def update_connection_status(
        self,
        connection_id: int,
        status: str,
        error_message: Optional[str] = None
    ) -> bool:
        """
        Update connection status
        """
        connection = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.id == connection_id
        ).first()
        
        if not connection:
            return False
        
        connection.status = status
        if error_message:
            connection.last_error = error_message
            connection.error_count += 1
        else:
            connection.last_error = None
        
        connection.updated_at = datetime.utcnow()
        self.db.commit()
        return True
    
    def sync_connection(
        self,
        connection_id: int,
        sync_type: str = "manual",
        operation: str = "full_sync"
    ) -> IntegrationSyncLog:
        """
        Perform data synchronization for a connection
        """
        connection = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.id == connection_id
        ).first()
        
        if not connection:
            raise ValueError("Connection not found")
        
        # Create sync log
        sync_log = IntegrationSyncLog(
            connection_id=connection_id,
            sync_type=sync_type,
            direction="inbound",  # Default to inbound
            operation=operation,
            status="in_progress"
        )
        
        self.db.add(sync_log)
        self.db.flush()
        
        try:
            # Perform the actual sync
            sync_result = self._perform_sync(connection, sync_log)
            
            # Update sync log with results
            sync_log.status = "success" if sync_result["success"] else "failed"
            sync_log.records_processed = sync_result.get("records_processed", 0)
            sync_log.records_created = sync_result.get("records_created", 0)
            sync_log.records_updated = sync_result.get("records_updated", 0)
            sync_log.records_failed = sync_result.get("records_failed", 0)
            sync_log.duration_seconds = sync_result.get("duration_seconds", 0)
            sync_log.api_calls_made = sync_result.get("api_calls_made", 0)
            sync_log.completed_at = datetime.utcnow()
            
            if not sync_result["success"]:
                sync_log.error_message = sync_result.get("error_message")
                sync_log.error_details = sync_result.get("error_details", {})
            
            # Update connection metrics
            connection.total_syncs += 1
            if sync_result["success"]:
                connection.successful_syncs += 1
            connection.last_sync_at = datetime.utcnow()
            
            # Update average sync duration
            if connection.total_syncs > 0:
                total_duration = (connection.avg_sync_duration * (connection.total_syncs - 1)) + sync_log.duration_seconds
                connection.avg_sync_duration = total_duration / connection.total_syncs
            
        except Exception as e:
            sync_log.status = "failed"
            sync_log.error_message = str(e)
            sync_log.completed_at = datetime.utcnow()
            
            connection.error_count += 1
            connection.last_error = str(e)
        
        self.db.commit()
        return sync_log
    
    def create_webhook(
        self,
        connection_id: int,
        webhook_data: Dict[str, Any]
    ) -> IntegrationWebhook:
        """
        Create a webhook for real-time updates
        """
        webhook = IntegrationWebhook(
            connection_id=connection_id,
            webhook_url=webhook_data["webhook_url"],
            webhook_secret=webhook_data.get("webhook_secret"),
            events=webhook_data.get("events", []),
            external_webhook_id=webhook_data.get("external_webhook_id"),
            external_webhook_url=webhook_data.get("external_webhook_url"),
            retry_config=webhook_data.get("retry_config", {}),
            timeout_seconds=webhook_data.get("timeout_seconds", 30)
        )
        
        self.db.add(webhook)
        self.db.commit()
        return webhook
    
    def process_webhook(
        self,
        webhook_id: int,
        payload: Dict[str, Any],
        headers: Dict[str, str]
    ) -> bool:
        """
        Process incoming webhook data
        """
        webhook = self.db.query(IntegrationWebhook).filter(
            IntegrationWebhook.id == webhook_id
        ).first()
        
        if not webhook or not webhook.is_active:
            return False
        
        # Verify webhook signature if secret is configured
        if webhook.webhook_secret:
            if not self._verify_webhook_signature(payload, headers, webhook.webhook_secret):
                return False
        
        try:
            # Process the webhook payload
            self._process_webhook_payload(webhook, payload)
            
            # Update webhook metrics
            webhook.total_triggers += 1
            webhook.successful_triggers += 1
            webhook.last_triggered_at = datetime.utcnow()
            
            self.db.commit()
            return True
            
        except Exception as e:
            webhook.failed_triggers += 1
            self.db.commit()
            return False
    
    def create_data_mapping(
        self,
        connection_id: int,
        mapping_data: Dict[str, Any]
    ) -> IntegrationDataMapping:
        """
        Create field mapping between external and internal data
        """
        mapping = IntegrationDataMapping(
            connection_id=connection_id,
            resource_type=mapping_data["resource_type"],
            external_field=mapping_data["external_field"],
            internal_field=mapping_data["internal_field"],
            transformation_type=mapping_data.get("transformation_type", "direct"),
            transformation_config=mapping_data.get("transformation_config", {}),
            validation_rules=mapping_data.get("validation_rules", {}),
            is_required=mapping_data.get("is_required", False),
            default_value=mapping_data.get("default_value"),
            description=mapping_data.get("description")
        )
        
        self.db.add(mapping)
        self.db.commit()
        return mapping
    
    def get_analytics(
        self,
        tenant_id: int,
        connection_id: Optional[int] = None,
        period_type: str = "daily",
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[IntegrationAnalytics]:
        """
        Get integration analytics and metrics
        """
        query = self.db.query(IntegrationAnalytics).filter(
            IntegrationAnalytics.tenant_id == tenant_id,
            IntegrationAnalytics.period_type == period_type
        )
        
        if connection_id:
            query = query.filter(IntegrationAnalytics.connection_id == connection_id)
        
        if start_date:
            query = query.filter(IntegrationAnalytics.date >= start_date)
        
        if end_date:
            query = query.filter(IntegrationAnalytics.date <= end_date)
        
        return query.order_by(IntegrationAnalytics.date.desc()).all()
    
    def generate_analytics(
        self,
        tenant_id: int,
        date: datetime,
        period_type: str = "daily"
    ) -> IntegrationAnalytics:
        """
        Generate analytics for a specific period
        """
        # Calculate date range based on period type
        if period_type == "daily":
            start_date = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = start_date + timedelta(days=1)
        elif period_type == "weekly":
            start_date = date - timedelta(days=date.weekday())
            end_date = start_date + timedelta(days=7)
        elif period_type == "monthly":
            start_date = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            next_month = start_date.replace(month=start_date.month + 1) if start_date.month < 12 else start_date.replace(year=start_date.year + 1, month=1)
            end_date = next_month
        else:
            raise ValueError("Invalid period_type")
        
        # Aggregate sync logs for the period
        sync_stats = self.db.query(
            func.count(IntegrationSyncLog.id).label("total_syncs"),
            func.sum(IntegrationSyncLog.api_calls_made).label("total_api_calls"),
            func.sum(IntegrationSyncLog.data_size_bytes).label("total_data_bytes"),
            func.sum(IntegrationSyncLog.records_processed).label("total_records"),
            func.avg(IntegrationSyncLog.duration_seconds).label("avg_duration")
        ).join(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id,
            IntegrationSyncLog.started_at >= start_date,
            IntegrationSyncLog.started_at < end_date
        ).first()
        
        # Calculate success rate
        successful_syncs = self.db.query(func.count(IntegrationSyncLog.id)).join(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id,
            IntegrationSyncLog.status == "success",
            IntegrationSyncLog.started_at >= start_date,
            IntegrationSyncLog.started_at < end_date
        ).scalar()
        
        total_syncs = sync_stats.total_syncs or 0
        success_rate = (successful_syncs / total_syncs * 100) if total_syncs > 0 else 0
        
        # Count webhook triggers
        webhook_triggers = self.db.query(func.sum(IntegrationWebhook.total_triggers)).join(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id,
            IntegrationWebhook.last_triggered_at >= start_date,
            IntegrationWebhook.last_triggered_at < end_date
        ).scalar() or 0
        
        # Count unique active users
        unique_users = self.db.query(func.count(func.distinct(IntegrationConnection.user_id))).filter(
            IntegrationConnection.tenant_id == tenant_id,
            IntegrationConnection.last_sync_at >= start_date,
            IntegrationConnection.last_sync_at < end_date
        ).scalar() or 0
        
        # Create analytics record
        analytics = IntegrationAnalytics(
            tenant_id=tenant_id,
            date=date,
            period_type=period_type,
            api_calls_made=sync_stats.total_api_calls or 0,
            data_transferred_bytes=sync_stats.total_data_bytes or 0,
            sync_operations=total_syncs,
            webhook_triggers=webhook_triggers,
            avg_response_time_ms=(sync_stats.avg_duration * 1000) if sync_stats.avg_duration else 0,
            success_rate=success_rate,
            error_rate=100 - success_rate,
            uptime_percentage=95.0,  # Placeholder - would be calculated from actual uptime data
            records_synchronized=sync_stats.total_records or 0,
            unique_users_active=unique_users,
            cost_savings_estimated=self._calculate_cost_savings(sync_stats.total_records or 0),
            productivity_gain_hours=self._calculate_productivity_gain(sync_stats.total_records or 0)
        )
        
        self.db.add(analytics)
        self.db.commit()
        return analytics
    
    def _test_connection(self, connection: IntegrationConnection) -> bool:
        """
        Test an integration connection
        """
        try:
            # This would implement actual connection testing logic
            # For now, we'll simulate a successful test
            connection.status = "active"
            self.db.commit()
            return True
        except Exception as e:
            connection.status = "error"
            connection.last_error = str(e)
            self.db.commit()
            return False
    
    def _perform_sync(self, connection: IntegrationConnection, sync_log: IntegrationSyncLog) -> Dict[str, Any]:
        """
        Perform actual data synchronization
        """
        start_time = datetime.utcnow()
        
        try:
            # This would implement actual sync logic based on the provider
            # For now, we'll simulate a successful sync
            
            # Simulate processing time
            import time
            time.sleep(0.1)
            
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            return {
                "success": True,
                "records_processed": 100,
                "records_created": 20,
                "records_updated": 75,
                "records_failed": 5,
                "duration_seconds": duration,
                "api_calls_made": 5
            }
            
        except Exception as e:
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            return {
                "success": False,
                "error_message": str(e),
                "duration_seconds": duration,
                "api_calls_made": 1
            }
    
    def _verify_webhook_signature(
        self,
        payload: Dict[str, Any],
        headers: Dict[str, str],
        secret: str
    ) -> bool:
        """
        Verify webhook signature for security
        """
        try:
            signature = headers.get("X-Hub-Signature-256", "")
            if not signature:
                return False
            
            payload_bytes = json.dumps(payload, sort_keys=True).encode()
            expected_signature = "sha256=" + hmac.new(
                secret.encode(),
                payload_bytes,
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(signature, expected_signature)
        except Exception:
            return False
    
    def _process_webhook_payload(self, webhook: IntegrationWebhook, payload: Dict[str, Any]):
        """
        Process webhook payload and trigger appropriate actions
        """
        # This would implement actual webhook processing logic
        # For now, we'll just log the webhook event
        pass
    
    def _calculate_cost_savings(self, records_processed: int) -> float:
        """
        Calculate estimated cost savings from automation
        """
        # Estimate: $0.10 per record processed manually
        return records_processed * 0.10
    
    def _calculate_productivity_gain(self, records_processed: int) -> float:
        """
        Calculate estimated productivity gain in hours
        """
        # Estimate: 1 minute saved per record processed
        return records_processed / 60.0


class IntegrationProviderService:
    """
    Service for managing integration provider configurations
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def initialize_default_providers(self):
        """
        Initialize default integration providers
        """
        default_providers = [
            {
                "name": "slack",
                "display_name": "Slack",
                "description": "Team communication and collaboration platform",
                "category": "communication",
                "base_url": "https://slack.com/api",
                "auth_type": "oauth2",
                "auth_config": {
                    "authorization_url": "https://slack.com/oauth/v2/authorize",
                    "token_url": "https://slack.com/api/oauth.v2.access",
                    "scopes": ["channels:read", "chat:write", "users:read"]
                },
                "supported_operations": ["read", "write", "webhook"],
                "rate_limits": {"requests_per_minute": 100},
                "logo_url": "https://a.slack-edge.com/80588/img/icons/app-256.png"
            },
            {
                "name": "trello",
                "display_name": "Trello",
                "description": "Visual project management with boards and cards",
                "category": "project_management",
                "base_url": "https://api.trello.com/1",
                "auth_type": "oauth2",
                "auth_config": {
                    "authorization_url": "https://trello.com/1/authorize",
                    "token_url": "https://trello.com/1/OAuthGetAccessToken",
                    "scopes": ["read", "write"]
                },
                "supported_operations": ["read", "write", "webhook"],
                "rate_limits": {"requests_per_second": 10},
                "logo_url": "https://d2k1ftgv7pobq7.cloudfront.net/meta/c/p/res/images/trello-header-logos/167dc7b9900a5b241b15ba21f8037cf8/trello-logo-blue.svg"
            },
            {
                "name": "github",
                "display_name": "GitHub",
                "description": "Code repository and development collaboration",
                "category": "development",
                "base_url": "https://api.github.com",
                "auth_type": "oauth2",
                "auth_config": {
                    "authorization_url": "https://github.com/login/oauth/authorize",
                    "token_url": "https://github.com/login/oauth/access_token",
                    "scopes": ["repo", "user"]
                },
                "supported_operations": ["read", "write", "webhook"],
                "rate_limits": {"requests_per_hour": 5000},
                "logo_url": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
            },
            {
                "name": "google_workspace",
                "display_name": "Google Workspace",
                "description": "Gmail, Drive, Calendar, and Contacts integration",
                "category": "productivity",
                "base_url": "https://www.googleapis.com",
                "auth_type": "oauth2",
                "auth_config": {
                    "authorization_url": "https://accounts.google.com/o/oauth2/auth",
                    "token_url": "https://oauth2.googleapis.com/token",
                    "scopes": ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/drive.readonly"]
                },
                "supported_operations": ["read", "write"],
                "rate_limits": {"requests_per_day": 1000000},
                "logo_url": "https://developers.google.com/workspace/images/workspace-logo.svg"
            },
            {
                "name": "microsoft_teams",
                "display_name": "Microsoft Teams",
                "description": "Team collaboration and communication platform",
                "category": "communication",
                "base_url": "https://graph.microsoft.com/v1.0",
                "auth_type": "oauth2",
                "auth_config": {
                    "authorization_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
                    "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                    "scopes": ["https://graph.microsoft.com/Team.ReadBasic.All", "https://graph.microsoft.com/Chat.Read"]
                },
                "supported_operations": ["read", "write", "webhook"],
                "rate_limits": {"requests_per_second": 10},
                "logo_url": "https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg"
            }
        ]
        
        for provider_data in default_providers:
            existing = self.db.query(IntegrationProvider).filter(
                IntegrationProvider.name == provider_data["name"]
            ).first()
            
            if not existing:
                provider = IntegrationProvider(**provider_data)
                self.db.add(provider)
        
        self.db.commit()