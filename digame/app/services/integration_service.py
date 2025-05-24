"""
Integration APIs service for third-party productivity tools and services
"""

from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
import uuid
import json
import asyncio
import aiohttp
import hashlib
import hmac
from urllib.parse import urlencode
import base64

from ..models.integration import (
    IntegrationProvider, IntegrationConnection, IntegrationSyncLog,
    IntegrationDataMapping, IntegrationWebhook
)
from ..models.user import User
from ..models.tenant import Tenant


class IntegrationService:
    """Service for managing third-party integrations"""

    def __init__(self, db: Session):
        self.db = db
        self.supported_providers = {
            "slack": SlackIntegration,
            "microsoft_teams": TeamsIntegration,
            "google_workspace": GoogleWorkspaceIntegration,
            "trello": TrelloIntegration,
            "asana": AsanaIntegration,
            "jira": JiraIntegration,
            "github": GitHubIntegration,
            "dropbox": DropboxIntegration,
            "salesforce": SalesforceIntegration,
            "hubspot": HubSpotIntegration
        }

    # Provider Management
    def get_available_providers(self, category: Optional[str] = None) -> List[IntegrationProvider]:
        """Get available integration providers"""
        
        query = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.is_active == True
        )
        
        if category:
            query = query.filter(IntegrationProvider.category == category)
        
        return query.order_by(IntegrationProvider.display_name).all()

    def get_provider_by_name(self, provider_name: str) -> Optional[IntegrationProvider]:
        """Get provider by name"""
        
        return self.db.query(IntegrationProvider).filter(
            and_(
                IntegrationProvider.name == provider_name,
                IntegrationProvider.is_active == True
            )
        ).first()

    def create_provider(self, provider_data: Dict[str, Any]) -> IntegrationProvider:
        """Create a new integration provider"""
        
        provider = IntegrationProvider(
            name=provider_data["name"],
            display_name=provider_data["display_name"],
            description=provider_data.get("description"),
            category=provider_data["category"],
            provider_type=provider_data["provider_type"],
            base_url=provider_data.get("base_url"),
            api_version=provider_data.get("api_version"),
            documentation_url=provider_data.get("documentation_url"),
            auth_config=provider_data.get("auth_config", {}),
            required_scopes=provider_data.get("required_scopes", []),
            optional_scopes=provider_data.get("optional_scopes", []),
            supported_features=provider_data.get("supported_features", []),
            rate_limits=provider_data.get("rate_limits", {}),
            webhook_support=provider_data.get("webhook_support", False),
            real_time_sync=provider_data.get("real_time_sync", False)
        )
        
        self.db.add(provider)
        self.db.commit()
        self.db.refresh(provider)
        
        return provider

    # Connection Management
    def create_connection(
        self,
        tenant_id: int,
        user_id: int,
        provider_name: str,
        connection_name: str,
        auth_data: Dict[str, Any],
        sync_settings: Dict[str, Any] = None
    ) -> IntegrationConnection:
        """Create a new integration connection"""
        
        provider = self.get_provider_by_name(provider_name)
        if not provider:
            raise ValueError(f"Provider '{provider_name}' not found")
        
        # Encrypt sensitive auth data
        encrypted_auth = self._encrypt_auth_data(auth_data)
        
        connection = IntegrationConnection(
            tenant_id=tenant_id,
            user_id=user_id,
            provider_id=provider.id,
            connection_name=connection_name,
            auth_type=auth_data.get("auth_type", "oauth2"),
            access_token=encrypted_auth.get("access_token"),
            refresh_token=encrypted_auth.get("refresh_token"),
            token_expires_at=auth_data.get("expires_at"),
            api_key=encrypted_auth.get("api_key"),
            granted_scopes=auth_data.get("scopes", []),
            sync_settings=sync_settings or {},
            external_user_id=auth_data.get("external_user_id"),
            external_username=auth_data.get("external_username"),
            external_email=auth_data.get("external_email"),
            external_profile=auth_data.get("external_profile", {})
        )
        
        self.db.add(connection)
        self.db.commit()
        self.db.refresh(connection)
        
        # Update provider statistics
        provider.total_connections += 1
        provider.active_connections += 1
        self.db.commit()
        
        return connection

    def get_user_connections(
        self,
        tenant_id: int,
        user_id: int,
        provider_name: Optional[str] = None,
        active_only: bool = True
    ) -> List[IntegrationConnection]:
        """Get user's integration connections"""
        
        query = self.db.query(IntegrationConnection).filter(
            and_(
                IntegrationConnection.tenant_id == tenant_id,
                IntegrationConnection.user_id == user_id
            )
        )
        
        if active_only:
            query = query.filter(IntegrationConnection.status == "active")
        
        if provider_name:
            provider = self.get_provider_by_name(provider_name)
            if provider:
                query = query.filter(IntegrationConnection.provider_id == provider.id)
        
        return query.order_by(desc(IntegrationConnection.created_at)).all()

    def test_connection(self, connection_id: int) -> Dict[str, Any]:
        """Test an integration connection"""
        
        connection = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.id == connection_id
        ).first()
        
        if not connection:
            raise ValueError("Connection not found")
        
        provider_class = self.supported_providers.get(connection.provider.name)
        if not provider_class:
            raise ValueError(f"Provider '{connection.provider.name}' not supported")
        
        integration = provider_class(connection)
        
        try:
            result = integration.test_connection()
            
            if result["success"]:
                connection.status = "active"
                connection.last_error = None
                connection.error_count = 0
            else:
                connection.status = "error"
                connection.last_error = result.get("error", "Connection test failed")
                connection.error_count += 1
            
            connection.last_used_at = datetime.utcnow()
            self.db.commit()
            
            return result
            
        except Exception as e:
            connection.status = "error"
            connection.last_error = str(e)
            connection.error_count += 1
            self.db.commit()
            
            return {
                "success": False,
                "error": str(e),
                "connection_id": connection_id
            }

    def refresh_connection_token(self, connection_id: int) -> bool:
        """Refresh OAuth token for a connection"""
        
        connection = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.id == connection_id
        ).first()
        
        if not connection or not connection.refresh_token:
            return False
        
        provider_class = self.supported_providers.get(connection.provider.name)
        if not provider_class:
            return False
        
        integration = provider_class(connection)
        
        try:
            new_tokens = integration.refresh_token()
            
            if new_tokens:
                # Encrypt and store new tokens
                encrypted_tokens = self._encrypt_auth_data(new_tokens)
                connection.access_token = encrypted_tokens.get("access_token")
                connection.refresh_token = encrypted_tokens.get("refresh_token")
                connection.token_expires_at = new_tokens.get("expires_at")
                connection.status = "active"
                connection.last_error = None
                
                self.db.commit()
                return True
                
        except Exception as e:
            connection.status = "error"
            connection.last_error = f"Token refresh failed: {str(e)}"
            self.db.commit()
        
        return False

    # Data Synchronization
    async def sync_data(
        self,
        connection_id: int,
        sync_type: str = "incremental",
        operations: List[str] = None
    ) -> IntegrationSyncLog:
        """Synchronize data with external service"""
        
        connection = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.id == connection_id
        ).first()
        
        if not connection:
            raise ValueError("Connection not found")
        
        # Create sync log
        sync_log = IntegrationSyncLog(
            tenant_id=connection.tenant_id,
            connection_id=connection_id,
            provider_id=connection.provider_id,
            sync_type=sync_type,
            sync_direction="bidirectional",
            operation="sync_data",
            triggered_by="manual",
            user_id=connection.user_id
        )
        
        self.db.add(sync_log)
        self.db.commit()
        self.db.refresh(sync_log)
        
        provider_class = self.supported_providers.get(connection.provider.name)
        if not provider_class:
            sync_log.status = "failed"
            sync_log.error_message = f"Provider '{connection.provider.name}' not supported"
            sync_log.mark_completed(False)
            self.db.commit()
            return sync_log
        
        integration = provider_class(connection)
        
        try:
            # Execute synchronization
            sync_results = await integration.sync_data(sync_type, operations or [])
            
            # Update sync log with results
            sync_log.records_processed = sync_results.get("records_processed", 0)
            sync_log.records_created = sync_results.get("records_created", 0)
            sync_log.records_updated = sync_results.get("records_updated", 0)
            sync_log.records_deleted = sync_results.get("records_deleted", 0)
            sync_log.records_skipped = sync_results.get("records_skipped", 0)
            sync_log.records_failed = sync_results.get("records_failed", 0)
            sync_log.data_sent_bytes = sync_results.get("data_sent_bytes", 0)
            sync_log.data_received_bytes = sync_results.get("data_received_bytes", 0)
            sync_log.api_calls_made = sync_results.get("api_calls_made", 0)
            sync_log.last_sync_cursor = sync_results.get("last_cursor")
            
            sync_log.mark_completed(True)
            
            # Update connection statistics
            connection.total_syncs += 1
            connection.successful_syncs += 1
            connection.last_sync_at = datetime.utcnow()
            connection.data_transferred_bytes += sync_log.data_sent_bytes + sync_log.data_received_bytes
            
        except Exception as e:
            sync_log.status = "failed"
            sync_log.error_message = str(e)
            sync_log.mark_completed(False)
            
            # Update connection error statistics
            connection.failed_syncs += 1
            connection.last_error = str(e)
            connection.error_count += 1
        
        self.db.commit()
        return sync_log

    def get_sync_history(
        self,
        connection_id: int,
        limit: int = 50,
        status: Optional[str] = None
    ) -> List[IntegrationSyncLog]:
        """Get synchronization history for a connection"""
        
        query = self.db.query(IntegrationSyncLog).filter(
            IntegrationSyncLog.connection_id == connection_id
        )
        
        if status:
            query = query.filter(IntegrationSyncLog.status == status)
        
        return query.order_by(desc(IntegrationSyncLog.started_at)).limit(limit).all()

    # Data Mapping Management
    def create_data_mapping(
        self,
        connection_id: int,
        tenant_id: int,
        entity_type: str,
        mapping_name: str,
        field_mappings: Dict[str, str],
        created_by_user_id: int,
        **kwargs
    ) -> IntegrationDataMapping:
        """Create data field mapping"""
        
        mapping = IntegrationDataMapping(
            connection_id=connection_id,
            tenant_id=tenant_id,
            entity_type=entity_type,
            mapping_name=mapping_name,
            description=kwargs.get("description"),
            internal_fields=kwargs.get("internal_fields", {}),
            external_fields=kwargs.get("external_fields", {}),
            field_mappings=field_mappings,
            transformations=kwargs.get("transformations", {}),
            validation_rules=kwargs.get("validation_rules", {}),
            default_values=kwargs.get("default_values", {}),
            sync_direction=kwargs.get("sync_direction", "bidirectional"),
            conflict_resolution=kwargs.get("conflict_resolution", "latest_wins"),
            created_by_user_id=created_by_user_id
        )
        
        self.db.add(mapping)
        self.db.commit()
        self.db.refresh(mapping)
        
        return mapping

    def get_connection_mappings(self, connection_id: int) -> List[IntegrationDataMapping]:
        """Get data mappings for a connection"""
        
        return self.db.query(IntegrationDataMapping).filter(
            and_(
                IntegrationDataMapping.connection_id == connection_id,
                IntegrationDataMapping.is_active == True
            )
        ).order_by(IntegrationDataMapping.entity_type).all()

    # Webhook Management
    def create_webhook(
        self,
        connection_id: int,
        tenant_id: int,
        webhook_url: str,
        events: List[str],
        webhook_secret: Optional[str] = None
    ) -> IntegrationWebhook:
        """Create webhook configuration"""
        
        webhook = IntegrationWebhook(
            tenant_id=tenant_id,
            connection_id=connection_id,
            webhook_url=webhook_url,
            webhook_secret=webhook_secret,
            events=events
        )
        
        self.db.add(webhook)
        self.db.commit()
        self.db.refresh(webhook)
        
        return webhook

    def handle_webhook(
        self,
        provider_name: str,
        webhook_data: Dict[str, Any],
        headers: Dict[str, str]
    ) -> Dict[str, Any]:
        """Handle incoming webhook from external service"""
        
        provider_class = self.supported_providers.get(provider_name)
        if not provider_class:
            return {"success": False, "error": "Provider not supported"}
        
        try:
            # Verify webhook signature
            if not self._verify_webhook_signature(provider_name, webhook_data, headers):
                return {"success": False, "error": "Invalid webhook signature"}
            
            # Process webhook
            result = provider_class.handle_webhook(webhook_data, headers)
            
            # Log webhook trigger
            webhook_id = result.get("webhook_id")
            if webhook_id:
                webhook = self.db.query(IntegrationWebhook).filter(
                    IntegrationWebhook.id == webhook_id
                ).first()
                
                if webhook:
                    webhook.record_trigger(result["success"], result.get("error"))
                    self.db.commit()
            
            return result
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    # Analytics and Reporting
    def get_integration_analytics(self, tenant_id: int) -> Dict[str, Any]:
        """Get integration analytics for tenant"""
        
        # Connection statistics
        total_connections = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id
        ).count()
        
        active_connections = self.db.query(IntegrationConnection).filter(
            and_(
                IntegrationConnection.tenant_id == tenant_id,
                IntegrationConnection.status == "active"
            )
        ).count()
        
        # Sync statistics
        recent_syncs = self.db.query(IntegrationSyncLog).filter(
            and_(
                IntegrationSyncLog.tenant_id == tenant_id,
                IntegrationSyncLog.started_at >= datetime.utcnow() - timedelta(days=30)
            )
        ).count()
        
        successful_syncs = self.db.query(IntegrationSyncLog).filter(
            and_(
                IntegrationSyncLog.tenant_id == tenant_id,
                IntegrationSyncLog.status == "completed",
                IntegrationSyncLog.started_at >= datetime.utcnow() - timedelta(days=30)
            )
        ).count()
        
        # Provider usage
        provider_usage = self.db.query(
            IntegrationProvider.name,
            func.count(IntegrationConnection.id).label("connection_count")
        ).join(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id
        ).group_by(IntegrationProvider.name).all()
        
        return {
            "total_connections": total_connections,
            "active_connections": active_connections,
            "connection_health_rate": (active_connections / total_connections * 100) if total_connections > 0 else 0,
            "recent_syncs": recent_syncs,
            "successful_syncs": successful_syncs,
            "sync_success_rate": (successful_syncs / recent_syncs * 100) if recent_syncs > 0 else 0,
            "provider_usage": {usage.name: usage.connection_count for usage in provider_usage},
            "data_volume": self._get_data_volume_stats(tenant_id),
            "trends": self._get_integration_trends(tenant_id)
        }

    def _get_data_volume_stats(self, tenant_id: int) -> Dict[str, int]:
        """Get data volume statistics"""
        
        result = self.db.query(
            func.sum(IntegrationSyncLog.data_sent_bytes).label("total_sent"),
            func.sum(IntegrationSyncLog.data_received_bytes).label("total_received"),
            func.sum(IntegrationSyncLog.records_processed).label("total_records")
        ).filter(
            and_(
                IntegrationSyncLog.tenant_id == tenant_id,
                IntegrationSyncLog.started_at >= datetime.utcnow() - timedelta(days=30)
            )
        ).first()
        
        return {
            "bytes_sent": result.total_sent or 0,
            "bytes_received": result.total_received or 0,
            "records_processed": result.total_records or 0
        }

    def _get_integration_trends(self, tenant_id: int) -> Dict[str, str]:
        """Get integration trend analysis"""
        
        # Simple trend analysis (mock implementation)
        return {
            "connections_trend": "increasing",
            "sync_frequency_trend": "stable",
            "error_rate_trend": "decreasing",
            "data_volume_trend": "increasing"
        }

    # Utility Methods
    def _encrypt_auth_data(self, auth_data: Dict[str, Any]) -> Dict[str, str]:
        """Encrypt sensitive authentication data"""
        
        # Mock encryption - in production, use proper encryption
        encrypted = {}
        
        for key in ["access_token", "refresh_token", "api_key"]:
            if key in auth_data and auth_data[key]:
                # Simple base64 encoding as mock encryption
                encrypted[key] = base64.b64encode(str(auth_data[key]).encode()).decode()
        
        return encrypted

    def _decrypt_auth_data(self, encrypted_data: Dict[str, str]) -> Dict[str, str]:
        """Decrypt authentication data"""
        
        # Mock decryption - in production, use proper decryption
        decrypted = {}
        
        for key, value in encrypted_data.items():
            if value:
                try:
                    decrypted[key] = base64.b64decode(value.encode()).decode()
                except:
                    decrypted[key] = value
        
        return decrypted

    def _verify_webhook_signature(
        self,
        provider_name: str,
        webhook_data: Dict[str, Any],
        headers: Dict[str, str]
    ) -> bool:
        """Verify webhook signature"""
        
        # Mock signature verification - implement per provider
        signature_header = headers.get("X-Signature") or headers.get("X-Hub-Signature-256")
        
        if not signature_header:
            return False
        
        # In production, implement proper HMAC verification per provider
        return True


# Provider-specific integration classes
class BaseIntegration:
    """Base class for provider integrations"""
    
    def __init__(self, connection: IntegrationConnection):
        self.connection = connection
        self.provider = connection.provider
        
    def test_connection(self) -> Dict[str, Any]:
        """Test connection to external service"""
        raise NotImplementedError
    
    def refresh_token(self) -> Optional[Dict[str, Any]]:
        """Refresh OAuth token"""
        raise NotImplementedError
    
    async def sync_data(self, sync_type: str, operations: List[str]) -> Dict[str, Any]:
        """Synchronize data with external service"""
        raise NotImplementedError
    
    @staticmethod
    def handle_webhook(webhook_data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
        """Handle webhook from external service"""
        raise NotImplementedError


class SlackIntegration(BaseIntegration):
    """Slack integration implementation"""
    
    def test_connection(self) -> Dict[str, Any]:
        # Mock Slack API test
        return {
            "success": True,
            "provider": "slack",
            "user_info": {
                "id": "U123456",
                "name": "Test User",
                "team": "Test Team"
            }
        }
    
    async def sync_data(self, sync_type: str, operations: List[str]) -> Dict[str, Any]:
        # Mock Slack data sync
        await asyncio.sleep(1)  # Simulate API calls
        
        return {
            "records_processed": 50,
            "records_created": 10,
            "records_updated": 30,
            "records_deleted": 5,
            "records_skipped": 5,
            "records_failed": 0,
            "data_sent_bytes": 1024,
            "data_received_bytes": 2048,
            "api_calls_made": 5
        }


class TeamsIntegration(BaseIntegration):
    """Microsoft Teams integration implementation"""
    
    def test_connection(self) -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "microsoft_teams",
            "user_info": {
                "id": "user123",
                "displayName": "Test User",
                "mail": "test@example.com"
            }
        }
    
    async def sync_data(self, sync_type: str, operations: List[str]) -> Dict[str, Any]:
        await asyncio.sleep(1.5)
        
        return {
            "records_processed": 75,
            "records_created": 15,
            "records_updated": 45,
            "records_deleted": 10,
            "records_skipped": 5,
            "records_failed": 0,
            "data_sent_bytes": 2048,
            "data_received_bytes": 4096,
            "api_calls_made": 8
        }


class GoogleWorkspaceIntegration(BaseIntegration):
    """Google Workspace integration implementation"""
    
    def test_connection(self) -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "google_workspace",
            "user_info": {
                "id": "google123",
                "name": "Test User",
                "email": "test@gmail.com"
            }
        }
    
    async def sync_data(self, sync_type: str, operations: List[str]) -> Dict[str, Any]:
        await asyncio.sleep(2)
        
        return {
            "records_processed": 100,
            "records_created": 20,
            "records_updated": 60,
            "records_deleted": 15,
            "records_skipped": 5,
            "records_failed": 0,
            "data_sent_bytes": 3072,
            "data_received_bytes": 6144,
            "api_calls_made": 12
        }


# Additional provider classes would be implemented similarly
class TrelloIntegration(BaseIntegration):
    """Trello integration implementation"""
    
    def test_connection(self) -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "trello",
            "user_info": {
                "id": "trello123",
                "username": "testuser",
                "fullName": "Test User",
                "email": "test@example.com"
            }
        }
    
    async def sync_data(self, sync_type: str, operations: List[str]) -> Dict[str, Any]:
        await asyncio.sleep(1.2)
        
        return {
            "records_processed": 35,
            "records_created": 8,
            "records_updated": 22,
            "records_deleted": 3,
            "records_skipped": 2,
            "records_failed": 0,
            "data_sent_bytes": 1536,
            "data_received_bytes": 3072,
            "api_calls_made": 7
        }

class AsanaIntegration(BaseIntegration):
    """Asana integration implementation"""
    
    def test_connection(self) -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "asana",
            "user_info": {
                "gid": "asana456",
                "name": "Test User",
                "email": "test@example.com"
            }
        }
    
    async def sync_data(self, sync_type: str, operations: List[str]) -> Dict[str, Any]:
        await asyncio.sleep(1.8)
        
        return {
            "records_processed": 65,
            "records_created": 12,
            "records_updated": 40,
            "records_deleted": 8,
            "records_skipped": 5,
            "records_failed": 0,
            "data_sent_bytes": 2560,
            "data_received_bytes": 5120,
            "api_calls_made": 10
        }

class JiraIntegration(BaseIntegration):
    """Jira integration implementation"""
    
    def test_connection(self) -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "jira",
            "user_info": {
                "accountId": "jira789",
                "displayName": "Test User",
                "emailAddress": "test@example.com"
            }
        }
    
    async def sync_data(self, sync_type: str, operations: List[str]) -> Dict[str, Any]:
        await asyncio.sleep(2.5)
        
        return {
            "records_processed": 85,
            "records_created": 18,
            "records_updated": 55,
            "records_deleted": 7,
            "records_skipped": 5,
            "records_failed": 0,
            "data_sent_bytes": 4096,
            "data_received_bytes": 8192,
            "api_calls_made": 15
        }

class GitHubIntegration(BaseIntegration):
    """GitHub integration implementation"""
    
    def test_connection(self) -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "github",
            "user_info": {
                "id": 12345,
                "login": "testuser",
                "name": "Test User",
                "email": "test@example.com"
            }
        }
    
    async def sync_data(self, sync_type: str, operations: List[str]) -> Dict[str, Any]:
        await asyncio.sleep(1.5)
        
        return {
            "records_processed": 45,
            "records_created": 10,
            "records_updated": 28,
            "records_deleted": 4,
            "records_skipped": 3,
            "records_failed": 0,
            "data_sent_bytes": 2048,
            "data_received_bytes": 4096,
            "api_calls_made": 8
        }

class DropboxIntegration(BaseIntegration):
    """Dropbox integration implementation"""
    
    def test_connection(self) -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "dropbox",
            "user_info": {
                "account_id": "dbx123",
                "name": {
                    "display_name": "Test User"
                },
                "email": "test@example.com"
            }
        }
    
    async def sync_data(self, sync_type: str, operations: List[str]) -> Dict[str, Any]:
        await asyncio.sleep(2.2)
        
        return {
            "records_processed": 120,
            "records_created": 25,
            "records_updated": 80,
            "records_deleted": 10,
            "records_skipped": 5,
            "records_failed": 0,
            "data_sent_bytes": 10240,
            "data_received_bytes": 20480,
            "api_calls_made": 20
        }

class SalesforceIntegration(BaseIntegration):
    """Salesforce integration implementation"""
    
    def test_connection(self) -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "salesforce",
            "user_info": {
                "Id": "sf123456",
                "Name": "Test User",
                "Email": "test@example.com",
                "Username": "test@company.com"
            }
        }
    
    async def sync_data(self, sync_type: str, operations: List[str]) -> Dict[str, Any]:
        await asyncio.sleep(3.0)
        
        return {
            "records_processed": 200,
            "records_created": 40,
            "records_updated": 130,
            "records_deleted": 20,
            "records_skipped": 10,
            "records_failed": 0,
            "data_sent_bytes": 8192,
            "data_received_bytes": 16384,
            "api_calls_made": 25
        }

class HubSpotIntegration(BaseIntegration):
    """HubSpot integration implementation"""
    
    def test_connection(self) -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "hubspot",
            "user_info": {
                "user": "hubspot789",
                "firstName": "Test",
                "lastName": "User",
                "email": "test@example.com"
            }
        }
    
    async def sync_data(self, sync_type: str, operations: List[str]) -> Dict[str, Any]:
        await asyncio.sleep(2.8)
        
        return {
            "records_processed": 150,
            "records_created": 30,
            "records_updated": 95,
            "records_deleted": 15,
            "records_skipped": 10,
            "records_failed": 0,
            "data_sent_bytes": 6144,
            "data_received_bytes": 12288,
            "api_calls_made": 18
        }


def get_integration_service(db: Session) -> IntegrationService:
    """Get integration service instance"""
    return IntegrationService(db)