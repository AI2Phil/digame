"""
Third-party API client service for handling various productivity tool integrations
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging

from ..models.integration import IntegrationProvider, IntegrationConnection
from .oauth2_service import OAuth2Service

logger = logging.getLogger(__name__)


class ThirdPartyAPIService:
    """
    Service for interacting with third-party productivity APIs
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.oauth2_service = OAuth2Service(db)
        self.rate_limits = {}  # Track rate limits per provider
    
    async def make_api_request(
        self,
        connection: IntegrationConnection,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Make an authenticated API request to a third-party service
        """
        provider = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.id == connection.provider_id
        ).first()
        
        if not provider:
            raise ValueError("Provider not found")
        
        # Check and refresh token if needed
        if not await self.oauth2_service.validate_token(connection):
            if connection.refresh_token:
                await self.oauth2_service.refresh_access_token(connection)
            else:
                raise ValueError("Token expired and no refresh token available")
        
        # Build request headers
        request_headers = {
            'Authorization': f"Bearer {connection.auth_data.get('access_token')}",
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        if headers:
            request_headers.update(headers)
        
        # Add provider-specific headers
        if provider.name == 'microsoft':
            request_headers['ConsistencyLevel'] = 'eventual'
        elif provider.name == 'slack':
            request_headers['Content-Type'] = 'application/x-www-form-urlencoded'
        
        # Build full URL
        base_url = provider.base_url or self._get_default_base_url(provider.name)
        url = f"{base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        
        # Check rate limits
        await self._check_rate_limit(provider.name)
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method=method.upper(),
                    url=url,
                    json=data if method.upper() in ['POST', 'PUT', 'PATCH'] else None,
                    params=params,
                    headers=request_headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    # Update rate limit tracking
                    self._update_rate_limit_tracking(provider.name, response.headers)
                    
                    if response.status == 429:  # Rate limited
                        retry_after = int(response.headers.get('Retry-After', 60))
                        raise Exception(f"Rate limited. Retry after {retry_after} seconds")
                    
                    response.raise_for_status()
                    
                    # Handle different response types
                    content_type = response.headers.get('Content-Type', '')
                    if 'application/json' in content_type:
                        return await response.json()
                    else:
                        text_content = await response.text()
                        return {'content': text_content, 'content_type': content_type}
                        
        except aiohttp.ClientError as e:
            logger.error(f"API request failed for {provider.name}: {str(e)}")
            raise Exception(f"API request failed: {str(e)}")
    
    async def sync_user_data(self, connection: IntegrationConnection) -> Dict[str, Any]:
        """
        Sync user profile data from third-party service
        """
        provider = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.id == connection.provider_id
        ).first()
        
        if provider.name == 'microsoft':
            return await self._sync_microsoft_user(connection)
        elif provider.name == 'google':
            return await self._sync_google_user(connection)
        elif provider.name == 'slack':
            return await self._sync_slack_user(connection)
        elif provider.name == 'github':
            return await self._sync_github_user(connection)
        else:
            raise ValueError(f"User sync not implemented for {provider.name}")
    
    async def sync_files(self, connection: IntegrationConnection, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Sync files from third-party storage services
        """
        provider = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.id == connection.provider_id
        ).first()
        
        if provider.name == 'microsoft':
            return await self._sync_onedrive_files(connection, limit)
        elif provider.name == 'google':
            return await self._sync_google_drive_files(connection, limit)
        elif provider.name == 'dropbox':
            return await self._sync_dropbox_files(connection, limit)
        else:
            raise ValueError(f"File sync not implemented for {provider.name}")
    
    async def sync_calendar_events(self, connection: IntegrationConnection, days: int = 30) -> List[Dict[str, Any]]:
        """
        Sync calendar events from third-party services
        """
        provider = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.id == connection.provider_id
        ).first()
        
        start_date = datetime.utcnow().isoformat() + 'Z'
        end_date = (datetime.utcnow() + timedelta(days=days)).isoformat() + 'Z'
        
        if provider.name == 'microsoft':
            return await self._sync_outlook_calendar(connection, start_date, end_date)
        elif provider.name == 'google':
            return await self._sync_google_calendar(connection, start_date, end_date)
        else:
            raise ValueError(f"Calendar sync not implemented for {provider.name}")
    
    async def sync_tasks(self, connection: IntegrationConnection) -> List[Dict[str, Any]]:
        """
        Sync tasks from project management tools
        """
        provider = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.id == connection.provider_id
        ).first()
        
        if provider.name == 'asana':
            return await self._sync_asana_tasks(connection)
        elif provider.name == 'trello':
            return await self._sync_trello_tasks(connection)
        elif provider.name == 'jira':
            return await self._sync_jira_tasks(connection)
        else:
            raise ValueError(f"Task sync not implemented for {provider.name}")
    
    # Microsoft/Office 365 integrations
    async def _sync_microsoft_user(self, connection: IntegrationConnection) -> Dict[str, Any]:
        """Sync Microsoft user profile"""
        response = await self.make_api_request(connection, 'GET', 'v1.0/me')
        return {
            'id': response.get('id'),
            'email': response.get('mail') or response.get('userPrincipalName'),
            'name': response.get('displayName'),
            'first_name': response.get('givenName'),
            'last_name': response.get('surname'),
            'job_title': response.get('jobTitle'),
            'department': response.get('department'),
            'office_location': response.get('officeLocation'),
            'phone': response.get('businessPhones', [None])[0],
            'mobile': response.get('mobilePhone')
        }
    
    async def _sync_onedrive_files(self, connection: IntegrationConnection, limit: int) -> List[Dict[str, Any]]:
        """Sync OneDrive files"""
        response = await self.make_api_request(
            connection, 'GET', 'v1.0/me/drive/root/children',
            params={'$top': limit, '$select': 'id,name,size,createdDateTime,lastModifiedDateTime,webUrl'}
        )
        
        files = []
        for item in response.get('value', []):
            files.append({
                'id': item.get('id'),
                'name': item.get('name'),
                'size': item.get('size'),
                'created_at': item.get('createdDateTime'),
                'modified_at': item.get('lastModifiedDateTime'),
                'web_url': item.get('webUrl'),
                'type': 'folder' if 'folder' in item else 'file'
            })
        
        return files
    
    async def _sync_outlook_calendar(self, connection: IntegrationConnection, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Sync Outlook calendar events"""
        response = await self.make_api_request(
            connection, 'GET', 'v1.0/me/events',
            params={
                '$filter': f"start/dateTime ge '{start_date}' and end/dateTime le '{end_date}'",
                '$select': 'id,subject,start,end,location,attendees,organizer,isAllDay'
            }
        )
        
        events = []
        for event in response.get('value', []):
            events.append({
                'id': event.get('id'),
                'title': event.get('subject'),
                'start_time': event.get('start', {}).get('dateTime'),
                'end_time': event.get('end', {}).get('dateTime'),
                'location': event.get('location', {}).get('displayName'),
                'is_all_day': event.get('isAllDay'),
                'organizer': event.get('organizer', {}).get('emailAddress', {}).get('address'),
                'attendees': [att.get('emailAddress', {}).get('address') for att in event.get('attendees', [])]
            })
        
        return events
    
    # Google Workspace integrations
    async def _sync_google_user(self, connection: IntegrationConnection) -> Dict[str, Any]:
        """Sync Google user profile"""
        response = await self.make_api_request(connection, 'GET', 'oauth2/v1/userinfo')
        return {
            'id': response.get('id'),
            'email': response.get('email'),
            'name': response.get('name'),
            'first_name': response.get('given_name'),
            'last_name': response.get('family_name'),
            'picture': response.get('picture'),
            'verified_email': response.get('verified_email')
        }
    
    async def _sync_google_drive_files(self, connection: IntegrationConnection, limit: int) -> List[Dict[str, Any]]:
        """Sync Google Drive files"""
        response = await self.make_api_request(
            connection, 'GET', 'drive/v3/files',
            params={
                'pageSize': limit,
                'fields': 'files(id,name,size,createdTime,modifiedTime,webViewLink,mimeType)'
            }
        )
        
        files = []
        for item in response.get('files', []):
            files.append({
                'id': item.get('id'),
                'name': item.get('name'),
                'size': item.get('size'),
                'created_at': item.get('createdTime'),
                'modified_at': item.get('modifiedTime'),
                'web_url': item.get('webViewLink'),
                'mime_type': item.get('mimeType'),
                'type': 'folder' if item.get('mimeType') == 'application/vnd.google-apps.folder' else 'file'
            })
        
        return files
    
    async def _sync_google_calendar(self, connection: IntegrationConnection, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Sync Google Calendar events"""
        response = await self.make_api_request(
            connection, 'GET', 'calendar/v3/calendars/primary/events',
            params={
                'timeMin': start_date,
                'timeMax': end_date,
                'singleEvents': 'true',
                'orderBy': 'startTime'
            }
        )
        
        events = []
        for event in response.get('items', []):
            start = event.get('start', {})
            end = event.get('end', {})
            
            events.append({
                'id': event.get('id'),
                'title': event.get('summary'),
                'start_time': start.get('dateTime') or start.get('date'),
                'end_time': end.get('dateTime') or end.get('date'),
                'location': event.get('location'),
                'description': event.get('description'),
                'attendees': [att.get('email') for att in event.get('attendees', [])],
                'organizer': event.get('organizer', {}).get('email')
            })
        
        return events
    
    # Slack integrations
    async def _sync_slack_user(self, connection: IntegrationConnection) -> Dict[str, Any]:
        """Sync Slack user profile"""
        response = await self.make_api_request(connection, 'GET', 'users.profile.get')
        
        if not response.get('ok'):
            raise Exception(f"Slack API error: {response.get('error')}")
        
        profile = response.get('profile', {})
        return {
            'id': profile.get('id'),
            'email': profile.get('email'),
            'name': profile.get('real_name'),
            'display_name': profile.get('display_name'),
            'title': profile.get('title'),
            'phone': profile.get('phone'),
            'avatar': profile.get('image_192'),
            'status': profile.get('status_text')
        }
    
    # GitHub integrations
    async def _sync_github_user(self, connection: IntegrationConnection) -> Dict[str, Any]:
        """Sync GitHub user profile"""
        response = await self.make_api_request(connection, 'GET', 'user')
        return {
            'id': response.get('id'),
            'username': response.get('login'),
            'name': response.get('name'),
            'email': response.get('email'),
            'bio': response.get('bio'),
            'company': response.get('company'),
            'location': response.get('location'),
            'avatar': response.get('avatar_url'),
            'public_repos': response.get('public_repos'),
            'followers': response.get('followers'),
            'following': response.get('following')
        }
    
    # Dropbox integrations
    async def _sync_dropbox_files(self, connection: IntegrationConnection, limit: int) -> List[Dict[str, Any]]:
        """Sync Dropbox files"""
        data = {
            'path': '',
            'recursive': False,
            'include_media_info': False,
            'include_deleted': False,
            'include_has_explicit_shared_members': False,
            'limit': limit
        }
        
        response = await self.make_api_request(
            connection, 'POST', '2/files/list_folder',
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        
        files = []
        for item in response.get('entries', []):
            files.append({
                'id': item.get('id'),
                'name': item.get('name'),
                'path': item.get('path_display'),
                'size': item.get('size'),
                'modified_at': item.get('server_modified'),
                'type': item.get('.tag')  # 'file' or 'folder'
            })
        
        return files
    
    # Project management integrations
    async def _sync_asana_tasks(self, connection: IntegrationConnection) -> List[Dict[str, Any]]:
        """Sync Asana tasks"""
        # Get user's workspaces first
        workspaces_response = await self.make_api_request(connection, 'GET', '1.0/workspaces')
        
        tasks = []
        for workspace in workspaces_response.get('data', []):
            workspace_id = workspace.get('gid')
            
            # Get tasks for this workspace
            tasks_response = await self.make_api_request(
                connection, 'GET', '1.0/tasks',
                params={
                    'workspace': workspace_id,
                    'assignee': 'me',
                    'completed_since': 'now',
                    'opt_fields': 'name,notes,completed,due_on,created_at,modified_at'
                }
            )
            
            for task in tasks_response.get('data', []):
                tasks.append({
                    'id': task.get('gid'),
                    'name': task.get('name'),
                    'notes': task.get('notes'),
                    'completed': task.get('completed'),
                    'due_date': task.get('due_on'),
                    'created_at': task.get('created_at'),
                    'modified_at': task.get('modified_at'),
                    'workspace_id': workspace_id,
                    'workspace_name': workspace.get('name')
                })
        
        return tasks
    
    async def _sync_trello_tasks(self, connection: IntegrationConnection) -> List[Dict[str, Any]]:
        """Sync Trello cards (tasks)"""
        # Get user's boards
        boards_response = await self.make_api_request(connection, 'GET', '1/members/me/boards')
        
        tasks = []
        for board in boards_response:
            board_id = board.get('id')
            
            # Get cards for this board
            cards_response = await self.make_api_request(
                connection, 'GET', f'1/boards/{board_id}/cards',
                params={'fields': 'name,desc,due,dateLastActivity,closed,url'}
            )
            
            for card in cards_response:
                tasks.append({
                    'id': card.get('id'),
                    'name': card.get('name'),
                    'description': card.get('desc'),
                    'due_date': card.get('due'),
                    'last_activity': card.get('dateLastActivity'),
                    'completed': card.get('closed'),
                    'url': card.get('url'),
                    'board_id': board_id,
                    'board_name': board.get('name')
                })
        
        return tasks
    
    async def _sync_jira_tasks(self, connection: IntegrationConnection) -> List[Dict[str, Any]]:
        """Sync Jira issues (tasks)"""
        response = await self.make_api_request(
            connection, 'GET', 'rest/api/3/search',
            params={
                'jql': 'assignee = currentUser() AND resolution = Unresolved',
                'fields': 'summary,description,status,priority,created,updated,duedate'
            }
        )
        
        tasks = []
        for issue in response.get('issues', []):
            fields = issue.get('fields', {})
            tasks.append({
                'id': issue.get('id'),
                'key': issue.get('key'),
                'summary': fields.get('summary'),
                'description': fields.get('description'),
                'status': fields.get('status', {}).get('name'),
                'priority': fields.get('priority', {}).get('name'),
                'created_at': fields.get('created'),
                'updated_at': fields.get('updated'),
                'due_date': fields.get('duedate')
            })
        
        return tasks
    
    def _get_default_base_url(self, provider_name: str) -> str:
        """Get default base URL for a provider"""
        base_urls = {
            'microsoft': 'https://graph.microsoft.com',
            'google': 'https://www.googleapis.com',
            'slack': 'https://slack.com/api',
            'github': 'https://api.github.com',
            'dropbox': 'https://api.dropboxapi.com',
            'asana': 'https://app.asana.com/api',
            'trello': 'https://api.trello.com',
            'jira': 'https://your-domain.atlassian.net'  # This would need to be configured per tenant
        }
        return base_urls.get(provider_name, '')
    
    async def _check_rate_limit(self, provider_name: str):
        """Check if we're within rate limits for a provider"""
        if provider_name not in self.rate_limits:
            return
        
        rate_limit_info = self.rate_limits[provider_name]
        if rate_limit_info.get('reset_time', 0) < datetime.utcnow().timestamp():
            # Reset the rate limit
            self.rate_limits[provider_name] = {}
            return
        
        if rate_limit_info.get('remaining', 1) <= 0:
            reset_time = rate_limit_info.get('reset_time', 0)
            wait_time = max(0, reset_time - datetime.utcnow().timestamp())
            if wait_time > 0:
                await asyncio.sleep(wait_time)
    
    def _update_rate_limit_tracking(self, provider_name: str, headers: Dict[str, str]):
        """Update rate limit tracking based on response headers"""
        # Different providers use different header names
        rate_limit_headers = {
            'microsoft': {
                'remaining': 'X-RateLimit-Remaining',
                'reset': 'X-RateLimit-Reset'
            },
            'github': {
                'remaining': 'X-RateLimit-Remaining',
                'reset': 'X-RateLimit-Reset'
            },
            'slack': {
                'remaining': 'X-Rate-Limit-Remaining',
                'reset': 'X-Rate-Limit-Reset'
            }
        }
        
        provider_headers = rate_limit_headers.get(provider_name, {})
        if not provider_headers:
            return
        
        remaining = headers.get(provider_headers.get('remaining'))
        reset_time = headers.get(provider_headers.get('reset'))
        
        if remaining is not None and reset_time is not None:
            self.rate_limits[provider_name] = {
                'remaining': int(remaining),
                'reset_time': int(reset_time)
            }