"""
Integration service layer for third-party productivity tools and services
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta, timezone
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
            IntegrationProvider.is_active == is_active  # type: ignore
        )
        
        if category:
            query = query.filter(IntegrationProvider.category == category)  # type: ignore
        
        return query.order_by(IntegrationProvider.display_name).all()  # type: ignore
    
    def create_provider(self, provider_data: Dict[str, Any]) -> IntegrationProvider:
        """
        Create a new integration provider
        """
        provider = IntegrationProvider()
        setattr(provider, 'name', provider_data["name"])  # type: ignore
        setattr(provider, 'display_name', provider_data["display_name"])  # type: ignore
        setattr(provider, 'description', provider_data.get("description"))  # type: ignore
        setattr(provider, 'category', provider_data["category"])  # type: ignore
        setattr(provider, 'base_url', provider_data.get("base_url"))  # type: ignore
        setattr(provider, 'auth_type', provider_data["auth_type"])  # type: ignore
        setattr(provider, 'auth_config', provider_data.get("auth_config", {}))  # type: ignore
        setattr(provider, 'supported_operations', provider_data.get("supported_operations", []))  # type: ignore
        setattr(provider, 'rate_limits', provider_data.get("rate_limits", {}))  # type: ignore
        setattr(provider, 'data_formats', provider_data.get("data_formats", ["json"]))  # type: ignore
        setattr(provider, 'logo_url', provider_data.get("logo_url"))  # type: ignore
        setattr(provider, 'documentation_url', provider_data.get("documentation_url"))  # type: ignore
        setattr(provider, 'version', provider_data.get("version", "1.0"))  # type: ignore
        
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
        connection = IntegrationConnection()
        setattr(connection, 'tenant_id', tenant_id)  # type: ignore
        setattr(connection, 'user_id', user_id)  # type: ignore
        setattr(connection, 'provider_id', provider_id)  # type: ignore
        setattr(connection, 'connection_name', connection_data["connection_name"])  # type: ignore
        setattr(connection, 'external_account_id', connection_data.get("external_account_id"))  # type: ignore
        setattr(connection, 'external_account_name', connection_data.get("external_account_name"))  # type: ignore
        setattr(connection, 'auth_data', connection_data.get("auth_data", {}))  # type: ignore
        setattr(connection, 'refresh_token', connection_data.get("refresh_token"))  # type: ignore
        setattr(connection, 'token_expires_at', connection_data.get("token_expires_at"))  # type: ignore
        setattr(connection, 'sync_settings', connection_data.get("sync_settings", {}))  # type: ignore
        setattr(connection, 'field_mappings', connection_data.get("field_mappings", {}))  # type: ignore
        setattr(connection, 'filters', connection_data.get("filters", {}))  # type: ignore
        
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
            IntegrationConnection.tenant_id == tenant_id  # type: ignore
        )
        
        if user_id:
            query = query.filter(IntegrationConnection.user_id == user_id)  # type: ignore
        
        if provider_id:
            query = query.filter(IntegrationConnection.provider_id == provider_id)  # type: ignore
        
        if status:
            query = query.filter(IntegrationConnection.status == status)  # type: ignore
        
        return query.order_by(IntegrationConnection.created_at.desc()).all()  # type: ignore
    
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
            IntegrationConnection.id == connection_id  # type: ignore
        ).first()  # type: ignore
        
        if not connection:
            return False
        
        setattr(connection, 'status', status)  # type: ignore
        if error_message:
            setattr(connection, 'last_error', error_message)  # type: ignore
            current_count = getattr(connection, 'error_count', 0)
            setattr(connection, 'error_count', current_count + 1)  # type: ignore
        else:
            setattr(connection, 'last_error', None)  # type: ignore
        
        setattr(connection, 'updated_at', datetime.now(timezone.utc))  # type: ignore
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
            IntegrationConnection.id == connection_id  # type: ignore
        ).first()  # type: ignore
        
        if not connection:
            raise ValueError("Connection not found")
        
        # Create sync log
        sync_log = IntegrationSyncLog()
        setattr(sync_log, 'connection_id', connection_id)  # type: ignore
        setattr(sync_log, 'sync_type', sync_type)  # type: ignore
        setattr(sync_log, 'direction', "inbound")  # type: ignore
        setattr(sync_log, 'operation', operation)  # type: ignore
        setattr(sync_log, 'status', "in_progress")  # type: ignore
        
        self.db.add(sync_log)
        self.db.flush()
        
        try:
            # Perform the actual sync
            sync_result = self._perform_sync(connection, sync_log)
            
            # Update sync log with results
            setattr(sync_log, 'status', "success" if sync_result["success"] else "failed")  # type: ignore
            setattr(sync_log, 'records_processed', sync_result.get("records_processed", 0))  # type: ignore
            setattr(sync_log, 'records_created', sync_result.get("records_created", 0))  # type: ignore
            setattr(sync_log, 'records_updated', sync_result.get("records_updated", 0))  # type: ignore
            setattr(sync_log, 'records_failed', sync_result.get("records_failed", 0))  # type: ignore
            setattr(sync_log, 'duration_seconds', sync_result.get("duration_seconds", 0))  # type: ignore
            setattr(sync_log, 'api_calls_made', sync_result.get("api_calls_made", 0))  # type: ignore
            setattr(sync_log, 'completed_at', datetime.now(timezone.utc))  # type: ignore
            
            if not sync_result["success"]:
                setattr(sync_log, 'error_message', sync_result.get("error_message"))  # type: ignore
                setattr(sync_log, 'error_details', sync_result.get("error_details", {}))  # type: ignore
            
            # Update connection metrics
            current_total = getattr(connection, 'total_syncs', 0)
            setattr(connection, 'total_syncs', current_total + 1)  # type: ignore
            if sync_result["success"]:
                current_successful = getattr(connection, 'successful_syncs', 0)
                setattr(connection, 'successful_syncs', current_successful + 1)  # type: ignore
            setattr(connection, 'last_sync_at', datetime.now(timezone.utc))  # type: ignore
            
            # Update average sync duration
            total_syncs = getattr(connection, 'total_syncs', 0)
            if total_syncs > 0:
                avg_duration = getattr(connection, 'avg_sync_duration', 0)
                duration_seconds = getattr(sync_log, 'duration_seconds', 0)
                total_duration = (avg_duration * (total_syncs - 1)) + duration_seconds
                setattr(connection, 'avg_sync_duration', total_duration / total_syncs)  # type: ignore
            
        except Exception as e:
            setattr(sync_log, 'status', "failed")  # type: ignore
            setattr(sync_log, 'error_message', str(e))  # type: ignore
            setattr(sync_log, 'completed_at', datetime.now(timezone.utc))  # type: ignore
            
            current_error_count = getattr(connection, 'error_count', 0)
            setattr(connection, 'error_count', current_error_count + 1)  # type: ignore
            setattr(connection, 'last_error', str(e))  # type: ignore
        
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
        webhook = IntegrationWebhook()
        setattr(webhook, 'connection_id', connection_id)  # type: ignore
        setattr(webhook, 'webhook_url', webhook_data["webhook_url"])  # type: ignore
        setattr(webhook, 'webhook_secret', webhook_data.get("webhook_secret"))  # type: ignore
        setattr(webhook, 'events', webhook_data.get("events", []))  # type: ignore
        setattr(webhook, 'external_webhook_id', webhook_data.get("external_webhook_id"))  # type: ignore
        setattr(webhook, 'external_webhook_url', webhook_data.get("external_webhook_url"))  # type: ignore
        setattr(webhook, 'retry_config', webhook_data.get("retry_config", {}))  # type: ignore
        setattr(webhook, 'timeout_seconds', webhook_data.get("timeout_seconds", 30))  # type: ignore
        
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
            IntegrationWebhook.id == webhook_id  # type: ignore
        ).first()  # type: ignore
        
        if not webhook or not getattr(webhook, 'is_active', True):
            return False
        
        # Verify webhook signature if secret is configured
        webhook_secret = getattr(webhook, 'webhook_secret', None)
        if webhook_secret:
            if not self._verify_webhook_signature(payload, headers, webhook_secret):
                return False
        
        try:
            # Process the webhook payload
            self._process_webhook_payload(webhook, payload)
            
            # Update webhook metrics
            current_total = getattr(webhook, 'total_triggers', 0)
            setattr(webhook, 'total_triggers', current_total + 1)  # type: ignore
            current_successful = getattr(webhook, 'successful_triggers', 0)
            setattr(webhook, 'successful_triggers', current_successful + 1)  # type: ignore
            setattr(webhook, 'last_triggered_at', datetime.now(timezone.utc))  # type: ignore
            
            self.db.commit()
            return True
            
        except Exception as e:
            current_failed = getattr(webhook, 'failed_triggers', 0)
            setattr(webhook, 'failed_triggers', current_failed + 1)  # type: ignore
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
        mapping = IntegrationDataMapping()
        setattr(mapping, 'connection_id', connection_id)  # type: ignore
        setattr(mapping, 'resource_type', mapping_data["resource_type"])  # type: ignore
        setattr(mapping, 'external_field', mapping_data["external_field"])  # type: ignore
        setattr(mapping, 'internal_field', mapping_data["internal_field"])  # type: ignore
        setattr(mapping, 'transformation_type', mapping_data.get("transformation_type", "direct"))  # type: ignore
        setattr(mapping, 'transformation_config', mapping_data.get("transformation_config", {}))  # type: ignore
        setattr(mapping, 'validation_rules', mapping_data.get("validation_rules", {}))  # type: ignore
        setattr(mapping, 'is_required', mapping_data.get("is_required", False))  # type: ignore
        setattr(mapping, 'default_value', mapping_data.get("default_value"))  # type: ignore
        setattr(mapping, 'description', mapping_data.get("description"))  # type: ignore
        
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
            IntegrationAnalytics.tenant_id == tenant_id,  # type: ignore
            IntegrationAnalytics.period_type == period_type  # type: ignore
        )
        
        if connection_id:
            query = query.filter(IntegrationAnalytics.connection_id == connection_id)  # type: ignore
        
        if start_date:
            query = query.filter(IntegrationAnalytics.date >= start_date)  # type: ignore
        
        if end_date:
            query = query.filter(IntegrationAnalytics.date <= end_date)  # type: ignore
        
        return query.order_by(IntegrationAnalytics.date.desc()).all()  # type: ignore
    
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
            IntegrationConnection.tenant_id == tenant_id,  # type: ignore
            IntegrationSyncLog.started_at >= start_date,  # type: ignore
            IntegrationSyncLog.started_at < end_date  # type: ignore
        ).first()  # type: ignore
        
        # Calculate success rate
        successful_syncs = self.db.query(func.count(IntegrationSyncLog.id)).join(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id,  # type: ignore
            IntegrationSyncLog.status == "success",  # type: ignore
            IntegrationSyncLog.started_at >= start_date,  # type: ignore
            IntegrationSyncLog.started_at < end_date  # type: ignore
        ).scalar()
        
        total_syncs = sync_stats.total_syncs or 0
        success_rate = (successful_syncs / total_syncs * 100) if total_syncs > 0 else 0
        
        # Count webhook triggers
        webhook_triggers = self.db.query(func.sum(IntegrationWebhook.total_triggers)).join(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id,  # type: ignore
            IntegrationWebhook.last_triggered_at >= start_date,  # type: ignore
            IntegrationWebhook.last_triggered_at < end_date  # type: ignore
        ).scalar() or 0
        
        # Count unique active users
        unique_users = self.db.query(func.count(func.distinct(IntegrationConnection.user_id))).filter(
            IntegrationConnection.tenant_id == tenant_id,  # type: ignore
            IntegrationConnection.last_sync_at >= start_date,  # type: ignore
            IntegrationConnection.last_sync_at < end_date  # type: ignore
        ).scalar() or 0
        
        # Create analytics record
        analytics = IntegrationAnalytics()
        setattr(analytics, 'tenant_id', tenant_id)  # type: ignore
        setattr(analytics, 'date', date)  # type: ignore
        setattr(analytics, 'period_type', period_type)  # type: ignore
        setattr(analytics, 'api_calls_made', sync_stats.total_api_calls or 0)  # type: ignore
        setattr(analytics, 'data_transferred_bytes', sync_stats.total_data_bytes or 0)  # type: ignore
        setattr(analytics, 'sync_operations', total_syncs)  # type: ignore
        setattr(analytics, 'webhook_triggers', webhook_triggers)  # type: ignore
        setattr(analytics, 'avg_response_time_ms', (sync_stats.avg_duration * 1000) if sync_stats.avg_duration else 0)  # type: ignore
        setattr(analytics, 'success_rate', success_rate)  # type: ignore
        setattr(analytics, 'error_rate', 100 - success_rate)  # type: ignore
        setattr(analytics, 'uptime_percentage', 95.0)  # type: ignore
        setattr(analytics, 'records_synchronized', sync_stats.total_records or 0)  # type: ignore
        setattr(analytics, 'unique_users_active', unique_users)  # type: ignore
        setattr(analytics, 'cost_savings_estimated', self._calculate_cost_savings(sync_stats.total_records or 0))  # type: ignore
        setattr(analytics, 'productivity_gain_hours', self._calculate_productivity_gain(sync_stats.total_records or 0))  # type: ignore
        
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
            setattr(connection, 'status', "active")  # type: ignore
            self.db.commit()
            return True
        except Exception as e:
            setattr(connection, 'status', "error")  # type: ignore
            setattr(connection, 'last_error', str(e))  # type: ignore
            self.db.commit()
            return False
    
    def _perform_sync(self, connection: IntegrationConnection, sync_log: IntegrationSyncLog) -> Dict[str, Any]:
        """
        Perform actual data synchronization
        """
        start_time = datetime.now(timezone.utc)
        
        try:
            # This would implement actual sync logic based on the provider
            # For now, we'll simulate a successful sync
            
            # Simulate processing time
            import time
            time.sleep(0.1)
            
            end_time = datetime.now(timezone.utc)
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
            end_time = datetime.now(timezone.utc)
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
    
from ..models.integration import DEFAULT_PROVIDERS as JOB_BOARD_PROVIDERS
from .extended_integration_providers import EXTENDED_INTEGRATION_PROVIDERS


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
        # Existing default providers
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
                IntegrationProvider.name == provider_data["name"]  # type: ignore
            ).first()  # type: ignore
            
            if not existing:
                provider = IntegrationProvider()
                for key, value in provider_data.items():
                    setattr(provider, key, value)  # type: ignore
                self.db.add(provider)

        # Add job board providers
        for provider_data in JOB_BOARD_PROVIDERS:
            existing = self.db.query(IntegrationProvider).filter(
                IntegrationProvider.name == provider_data["name"]  # type: ignore
            ).first()  # type: ignore

            if not existing:
                provider = IntegrationProvider()
                for key, value in provider_data.items():
                    setattr(provider, key, value)  # type: ignore
                self.db.add(provider)

        # Add extended integration providers
        for provider_data in EXTENDED_INTEGRATION_PROVIDERS:
            existing = self.db.query(IntegrationProvider).filter(
                IntegrationProvider.name == provider_data["name"]  # type: ignore
            ).first()  # type: ignore

            if not existing:
                provider = IntegrationProvider()
                for key, value in provider_data.items():
                    setattr(provider, key, value)  # type: ignore
                self.db.add(provider)
        
        self.db.commit()