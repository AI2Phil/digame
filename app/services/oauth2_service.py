"""
OAuth2 service for handling third-party authentication flows
"""

import secrets
import base64
import hashlib
import json
from typing import Dict, Any, Optional, Tuple
from urllib.parse import urlencode, parse_qs, urlparse
from datetime import datetime, timedelta
import aiohttp
import asyncio
from sqlalchemy.orm import Session

from ..models.integration import IntegrationProvider, IntegrationConnection


class OAuth2Service:
    """
    OAuth2 authentication service for third-party integrations
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.state_storage = {}  # In production, use Redis or database
    
    def generate_authorization_url(
        self, 
        provider_id: int, 
        tenant_id: int,
        redirect_uri: str,
        scopes: Optional[list] = None
    ) -> Tuple[str, str]:
        """
        Generate OAuth2 authorization URL with PKCE
        """
        provider = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.id == provider_id
        ).first()
        
        if not provider:
            raise ValueError("Provider not found")
        
        auth_config = provider.auth_config
        
        # Generate PKCE parameters
        code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode('utf-8')).digest()
        ).decode('utf-8').rstrip('=')
        
        # Generate state parameter
        state = secrets.token_urlsafe(32)
        
        # Store state and code_verifier for later verification
        self.state_storage[state] = {
            'provider_id': provider_id,
            'tenant_id': tenant_id,
            'code_verifier': code_verifier,
            'redirect_uri': redirect_uri,
            'created_at': datetime.utcnow()
        }
        
        # Build authorization URL
        auth_params = {
            'response_type': 'code',
            'client_id': auth_config.get('client_id'),
            'redirect_uri': redirect_uri,
            'scope': ' '.join(scopes or auth_config.get('default_scopes', [])),
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }
        
        # Add provider-specific parameters
        if provider.name == 'microsoft':
            auth_params['response_mode'] = 'query'
        elif provider.name == 'google':
            auth_params['access_type'] = 'offline'
            auth_params['prompt'] = 'consent'
        
        auth_url = f"{auth_config['authorization_endpoint']}?{urlencode(auth_params)}"
        
        return auth_url, state
    
    async def exchange_code_for_tokens(
        self, 
        code: str, 
        state: str
    ) -> Dict[str, Any]:
        """
        Exchange authorization code for access tokens
        """
        if state not in self.state_storage:
            raise ValueError("Invalid or expired state parameter")
        
        state_data = self.state_storage[state]
        provider_id = state_data['provider_id']
        code_verifier = state_data['code_verifier']
        redirect_uri = state_data['redirect_uri']
        
        # Clean up state
        del self.state_storage[state]
        
        provider = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.id == provider_id
        ).first()
        
        auth_config = provider.auth_config
        
        # Prepare token request
        token_data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': auth_config['client_id'],
            'client_secret': auth_config['client_secret'],
            'code_verifier': code_verifier
        }
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                auth_config['token_endpoint'],
                data=token_data,
                headers=headers
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise ValueError(f"Token exchange failed: {error_text}")
                
                tokens = await response.json()
                
                # Add metadata
                tokens['provider_id'] = provider_id
                tokens['tenant_id'] = state_data['tenant_id']
                tokens['obtained_at'] = datetime.utcnow().isoformat()
                
                if 'expires_in' in tokens:
                    expires_at = datetime.utcnow() + timedelta(seconds=tokens['expires_in'])
                    tokens['expires_at'] = expires_at.isoformat()
                
                return tokens
    
    async def refresh_access_token(
        self, 
        connection: IntegrationConnection
    ) -> Dict[str, Any]:
        """
        Refresh access token using refresh token
        """
        provider = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.id == connection.provider_id
        ).first()
        
        auth_config = provider.auth_config
        auth_data = connection.auth_data
        
        if 'refresh_token' not in auth_data:
            raise ValueError("No refresh token available")
        
        token_data = {
            'grant_type': 'refresh_token',
            'refresh_token': auth_data['refresh_token'],
            'client_id': auth_config['client_id'],
            'client_secret': auth_config['client_secret']
        }
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                auth_config['token_endpoint'],
                data=token_data,
                headers=headers
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise ValueError(f"Token refresh failed: {error_text}")
                
                tokens = await response.json()
                
                # Update connection with new tokens
                connection.auth_data.update({
                    'access_token': tokens['access_token'],
                    'token_type': tokens.get('token_type', 'Bearer'),
                    'obtained_at': datetime.utcnow().isoformat()
                })
                
                if 'expires_in' in tokens:
                    expires_at = datetime.utcnow() + timedelta(seconds=tokens['expires_in'])
                    connection.token_expires_at = expires_at
                    connection.auth_data['expires_at'] = expires_at.isoformat()
                
                if 'refresh_token' in tokens:
                    connection.auth_data['refresh_token'] = tokens['refresh_token']
                    connection.refresh_token = tokens['refresh_token']
                
                connection.status = "active"
                connection.last_error = None
                connection.updated_at = datetime.utcnow()
                
                self.db.commit()
                
                return tokens
    
    async def validate_token(
        self, 
        connection: IntegrationConnection
    ) -> bool:
        """
        Validate if access token is still valid
        """
        if not connection.auth_data.get('access_token'):
            return False
        
        # Check expiration
        if connection.token_expires_at and connection.token_expires_at <= datetime.utcnow():
            return False
        
        provider = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.id == connection.provider_id
        ).first()
        
        # Test token with a simple API call
        try:
            headers = {
                'Authorization': f"Bearer {connection.auth_data['access_token']}",
                'Accept': 'application/json'
            }
            
            # Provider-specific validation endpoints
            validation_endpoints = {
                'microsoft': 'https://graph.microsoft.com/v1.0/me',
                'google': 'https://www.googleapis.com/oauth2/v1/userinfo',
                'slack': 'https://slack.com/api/auth.test',
                'github': 'https://api.github.com/user',
                'dropbox': 'https://api.dropboxapi.com/2/users/get_current_account'
            }
            
            validation_url = validation_endpoints.get(provider.name)
            if not validation_url:
                return True  # Assume valid if no validation endpoint
            
            async with aiohttp.ClientSession() as session:
                async with session.get(validation_url, headers=headers) as response:
                    return response.status == 200
                    
        except Exception:
            return False
    
    async def revoke_token(
        self, 
        connection: IntegrationConnection
    ) -> bool:
        """
        Revoke access token
        """
        provider = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.id == connection.provider_id
        ).first()
        
        auth_config = provider.auth_config
        revoke_endpoint = auth_config.get('revoke_endpoint')
        
        if not revoke_endpoint:
            return True  # No revoke endpoint, consider it revoked
        
        try:
            token_data = {
                'token': connection.auth_data.get('access_token'),
                'client_id': auth_config['client_id'],
                'client_secret': auth_config['client_secret']
            }
            
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    revoke_endpoint,
                    data=token_data,
                    headers=headers
                ) as response:
                    return response.status in [200, 204]
                    
        except Exception:
            return False
    
    def get_provider_config(self, provider_name: str) -> Dict[str, Any]:
        """
        Get OAuth2 configuration for a provider
        """
        configs = {
            'microsoft': {
                'authorization_endpoint': 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
                'token_endpoint': 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
                'revoke_endpoint': 'https://login.microsoftonline.com/common/oauth2/v2.0/logout',
                'default_scopes': ['https://graph.microsoft.com/User.Read', 'https://graph.microsoft.com/Files.ReadWrite']
            },
            'google': {
                'authorization_endpoint': 'https://accounts.google.com/o/oauth2/v2/auth',
                'token_endpoint': 'https://oauth2.googleapis.com/token',
                'revoke_endpoint': 'https://oauth2.googleapis.com/revoke',
                'default_scopes': ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/drive']
            },
            'slack': {
                'authorization_endpoint': 'https://slack.com/oauth/v2/authorize',
                'token_endpoint': 'https://slack.com/api/oauth.v2.access',
                'default_scopes': ['channels:read', 'chat:write', 'users:read']
            },
            'github': {
                'authorization_endpoint': 'https://github.com/login/oauth/authorize',
                'token_endpoint': 'https://github.com/login/oauth/access_token',
                'default_scopes': ['user', 'repo']
            },
            'dropbox': {
                'authorization_endpoint': 'https://www.dropbox.com/oauth2/authorize',
                'token_endpoint': 'https://api.dropboxapi.com/oauth2/token',
                'default_scopes': ['files.content.read', 'files.content.write']
            }
        }
        
        return configs.get(provider_name, {})
    
    def cleanup_expired_states(self):
        """
        Clean up expired state parameters
        """
        cutoff_time = datetime.utcnow() - timedelta(minutes=10)
        expired_states = [
            state for state, data in self.state_storage.items()
            if data['created_at'] < cutoff_time
        ]
        
        for state in expired_states:
            del self.state_storage[state]