"""
Webhook handler service for processing third-party integration webhooks
"""

import hmac
import hashlib
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import Request

from ..models.integration import IntegrationWebhook, IntegrationConnection, IntegrationSyncLog
from .third_party_api_service import ThirdPartyAPIService

logger = logging.getLogger(__name__)


class WebhookHandlerService:
    """
    Service for handling incoming webhooks from third-party integrations
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.api_service = ThirdPartyAPIService(db)
    
    async def process_webhook(
        self,
        webhook_id: int,
        request: Request,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process an incoming webhook
        """
        webhook = self.db.query(IntegrationWebhook).filter(
            IntegrationWebhook.id == webhook_id
        ).first()
        
        if not webhook:
            raise ValueError("Webhook not found")
        
        # Verify webhook signature if secret is configured
        if webhook.webhook_secret:
            if not await self._verify_webhook_signature(request, webhook.webhook_secret):
                raise ValueError("Invalid webhook signature")
        
        # Get the connection
        connection = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.id == webhook.connection_id
        ).first()
        
        if not connection:
            raise ValueError("Integration connection not found")
        
        # Process based on provider
        provider_name = self._get_provider_name(connection)
        
        try:
            result = await self._process_provider_webhook(
                provider_name, webhook, connection, payload
            )
            
            # Update webhook statistics
            webhook.successful_triggers += 1
            webhook.last_triggered_at = datetime.utcnow()
            
            self.db.commit()
            
            return {
                "success": True,
                "message": "Webhook processed successfully",
                "result": result
            }
            
        except Exception as e:
            logger.error(f"Webhook processing failed: {str(e)}")
            
            # Update webhook statistics
            webhook.failed_triggers += 1
            webhook.last_error = str(e)
            webhook.last_triggered_at = datetime.utcnow()
            
            self.db.commit()
            
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _verify_webhook_signature(
        self,
        request: Request,
        secret: str
    ) -> bool:
        """
        Verify webhook signature for security
        """
        try:
            # Get signature from headers (different providers use different header names)
            signature_header = None
            headers = request.headers
            
            # Check common signature header names
            for header_name in ['x-hub-signature-256', 'x-signature', 'x-slack-signature']:
                if header_name in headers:
                    signature_header = headers[header_name]
                    break
            
            if not signature_header:
                return False
            
            # Get request body
            body = await request.body()
            
            # Calculate expected signature
            if signature_header.startswith('sha256='):
                expected_signature = 'sha256=' + hmac.new(
                    secret.encode('utf-8'),
                    body,
                    hashlib.sha256
                ).hexdigest()
            else:
                expected_signature = hmac.new(
                    secret.encode('utf-8'),
                    body,
                    hashlib.sha256
                ).hexdigest()
            
            # Compare signatures
            return hmac.compare_digest(signature_header, expected_signature)
            
        except Exception as e:
            logger.error(f"Signature verification failed: {str(e)}")
            return False
    
    async def _process_provider_webhook(
        self,
        provider_name: str,
        webhook: IntegrationWebhook,
        connection: IntegrationConnection,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process webhook based on provider type
        """
        if provider_name == 'microsoft':
            return await self._process_microsoft_webhook(webhook, connection, payload)
        elif provider_name == 'google':
            return await self._process_google_webhook(webhook, connection, payload)
        elif provider_name == 'slack':
            return await self._process_slack_webhook(webhook, connection, payload)
        elif provider_name == 'github':
            return await self._process_github_webhook(webhook, connection, payload)
        elif provider_name == 'dropbox':
            return await self._process_dropbox_webhook(webhook, connection, payload)
        else:
            return await self._process_generic_webhook(webhook, connection, payload)
    
    async def _process_microsoft_webhook(
        self,
        webhook: IntegrationWebhook,
        connection: IntegrationConnection,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process Microsoft Graph webhook
        """
        # Handle different Microsoft Graph notification types
        if 'value' in payload:
            notifications = payload['value']
            results = []
            
            for notification in notifications:
                resource = notification.get('resource')
                change_type = notification.get('changeType')
                
                if 'driveItem' in resource:
                    # File change notification
                    result = await self._handle_file_change(
                        connection, resource, change_type
                    )
                elif 'message' in resource:
                    # Email notification
                    result = await self._handle_email_change(
                        connection, resource, change_type
                    )
                elif 'event' in resource:
                    # Calendar event notification
                    result = await self._handle_calendar_change(
                        connection, resource, change_type
                    )
                else:
                    result = {"type": "unknown", "resource": resource}
                
                results.append(result)
            
            return {"processed_notifications": len(results), "results": results}
        
        return {"message": "No notifications to process"}
    
    async def _process_google_webhook(
        self,
        webhook: IntegrationWebhook,
        connection: IntegrationConnection,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process Google webhook (Drive, Calendar, etc.)
        """
        # Google uses push notifications with different formats
        resource_id = payload.get('resourceId')
        resource_uri = payload.get('resourceUri')
        
        if 'drive' in resource_uri:
            # Google Drive change
            return await self._handle_google_drive_change(connection, payload)
        elif 'calendar' in resource_uri:
            # Google Calendar change
            return await self._handle_google_calendar_change(connection, payload)
        
        return {"message": "Processed Google webhook", "resource_id": resource_id}
    
    async def _process_slack_webhook(
        self,
        webhook: IntegrationWebhook,
        connection: IntegrationConnection,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process Slack webhook
        """
        event_type = payload.get('type')
        
        if event_type == 'url_verification':
            # Slack URL verification challenge
            return {"challenge": payload.get('challenge')}
        
        if 'event' in payload:
            event = payload['event']
            event_type = event.get('type')
            
            if event_type == 'message':
                return await self._handle_slack_message(connection, event)
            elif event_type == 'file_shared':
                return await self._handle_slack_file_share(connection, event)
            elif event_type == 'channel_created':
                return await self._handle_slack_channel_created(connection, event)
        
        return {"message": "Processed Slack webhook", "type": event_type}
    
    async def _process_github_webhook(
        self,
        webhook: IntegrationWebhook,
        connection: IntegrationConnection,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process GitHub webhook
        """
        event_type = payload.get('action')
        
        if 'repository' in payload:
            repo_name = payload['repository']['name']
            
            if 'commits' in payload:
                # Push event
                return await self._handle_github_push(connection, payload)
            elif 'pull_request' in payload:
                # Pull request event
                return await self._handle_github_pull_request(connection, payload)
            elif 'issue' in payload:
                # Issue event
                return await self._handle_github_issue(connection, payload)
        
        return {"message": "Processed GitHub webhook", "action": event_type}
    
    async def _process_dropbox_webhook(
        self,
        webhook: IntegrationWebhook,
        connection: IntegrationConnection,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process Dropbox webhook
        """
        # Dropbox sends account IDs that changed
        accounts = payload.get('list_folder', {}).get('accounts', [])
        
        results = []
        for account in accounts:
            # Sync changes for this account
            result = await self._sync_dropbox_changes(connection, account)
            results.append(result)
        
        return {"processed_accounts": len(results), "results": results}
    
    async def _process_generic_webhook(
        self,
        webhook: IntegrationWebhook,
        connection: IntegrationConnection,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process generic webhook for unknown providers
        """
        # Log the webhook for analysis
        sync_log = IntegrationSyncLog(
            connection_id=connection.id,
            sync_type="webhook",
            direction="inbound",
            operation="webhook_received",
            status="success",
            started_at=datetime.utcnow(),
            completed_at=datetime.utcnow(),
            records_processed=1,
            metadata=payload
        )
        
        self.db.add(sync_log)
        self.db.commit()
        
        return {"message": "Generic webhook processed", "payload_keys": list(payload.keys())}
    
    # Helper methods for specific event types
    async def _handle_file_change(
        self,
        connection: IntegrationConnection,
        resource: str,
        change_type: str
    ) -> Dict[str, Any]:
        """Handle file change notifications"""
        # Extract file ID from resource URL
        file_id = resource.split('/')[-1]
        
        # Sync the specific file
        try:
            file_data = await self.api_service.make_api_request(
                connection, 'GET', f'v1.0/me/drive/items/{file_id}'
            )
            
            return {
                "type": "file_change",
                "change_type": change_type,
                "file_id": file_id,
                "file_name": file_data.get('name'),
                "status": "synced"
            }
        except Exception as e:
            return {
                "type": "file_change",
                "change_type": change_type,
                "file_id": file_id,
                "status": "error",
                "error": str(e)
            }
    
    async def _handle_email_change(
        self,
        connection: IntegrationConnection,
        resource: str,
        change_type: str
    ) -> Dict[str, Any]:
        """Handle email change notifications"""
        return {
            "type": "email_change",
            "change_type": change_type,
            "resource": resource,
            "status": "logged"
        }
    
    async def _handle_calendar_change(
        self,
        connection: IntegrationConnection,
        resource: str,
        change_type: str
    ) -> Dict[str, Any]:
        """Handle calendar change notifications"""
        return {
            "type": "calendar_change",
            "change_type": change_type,
            "resource": resource,
            "status": "logged"
        }
    
    async def _handle_google_drive_change(
        self,
        connection: IntegrationConnection,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle Google Drive change notifications"""
        return {
            "type": "google_drive_change",
            "resource_id": payload.get('resourceId'),
            "status": "logged"
        }
    
    async def _handle_google_calendar_change(
        self,
        connection: IntegrationConnection,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle Google Calendar change notifications"""
        return {
            "type": "google_calendar_change",
            "resource_id": payload.get('resourceId'),
            "status": "logged"
        }
    
    async def _handle_slack_message(
        self,
        connection: IntegrationConnection,
        event: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle Slack message events"""
        return {
            "type": "slack_message",
            "channel": event.get('channel'),
            "user": event.get('user'),
            "text": event.get('text', '')[:100],  # Truncate for logging
            "status": "logged"
        }
    
    async def _handle_slack_file_share(
        self,
        connection: IntegrationConnection,
        event: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle Slack file share events"""
        return {
            "type": "slack_file_share",
            "file_id": event.get('file_id'),
            "user": event.get('user_id'),
            "status": "logged"
        }
    
    async def _handle_slack_channel_created(
        self,
        connection: IntegrationConnection,
        event: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle Slack channel creation events"""
        return {
            "type": "slack_channel_created",
            "channel": event.get('channel', {}).get('id'),
            "name": event.get('channel', {}).get('name'),
            "status": "logged"
        }
    
    async def _handle_github_push(
        self,
        connection: IntegrationConnection,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle GitHub push events"""
        commits = payload.get('commits', [])
        return {
            "type": "github_push",
            "repository": payload['repository']['name'],
            "commits_count": len(commits),
            "ref": payload.get('ref'),
            "status": "logged"
        }
    
    async def _handle_github_pull_request(
        self,
        connection: IntegrationConnection,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle GitHub pull request events"""
        pr = payload.get('pull_request', {})
        return {
            "type": "github_pull_request",
            "repository": payload['repository']['name'],
            "action": payload.get('action'),
            "pr_number": pr.get('number'),
            "status": "logged"
        }
    
    async def _handle_github_issue(
        self,
        connection: IntegrationConnection,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle GitHub issue events"""
        issue = payload.get('issue', {})
        return {
            "type": "github_issue",
            "repository": payload['repository']['name'],
            "action": payload.get('action'),
            "issue_number": issue.get('number'),
            "status": "logged"
        }
    
    async def _sync_dropbox_changes(
        self,
        connection: IntegrationConnection,
        account: str
    ) -> Dict[str, Any]:
        """Sync Dropbox changes for an account"""
        try:
            # Get list of changes
            changes = await self.api_service.make_api_request(
                connection, 'POST', '2/files/list_folder/continue',
                data={"cursor": account}
            )
            
            return {
                "type": "dropbox_sync",
                "account": account,
                "changes_count": len(changes.get('entries', [])),
                "status": "synced"
            }
        except Exception as e:
            return {
                "type": "dropbox_sync",
                "account": account,
                "status": "error",
                "error": str(e)
            }
    
    def _get_provider_name(self, connection: IntegrationConnection) -> str:
        """Get provider name from connection"""
        provider = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.id == connection.provider_id
        ).first()
        
        return provider.name if provider else "unknown"
    
    def register_webhook_endpoints(self, app):
        """
        Register webhook endpoints with the FastAPI app
        """
        @app.post("/webhooks/integration/{webhook_id}")
        async def handle_webhook(webhook_id: int, request: Request):
            try:
                # Parse JSON payload
                payload = await request.json()
                
                # Process webhook
                result = await self.process_webhook(webhook_id, request, payload)
                
                return result
                
            except Exception as e:
                logger.error(f"Webhook handling failed: {str(e)}")
                return {"success": False, "error": str(e)}