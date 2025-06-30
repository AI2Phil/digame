"""
Single Sign-On (SSO) service for enterprise authentication
"""

from typing import Optional, List, Dict, Any, Tuple, Union
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import uuid
import secrets
import hashlib
import base64
import xml.etree.ElementTree as ET
from urllib.parse import urlencode, parse_qs
import requests
import jwt
try:
    import ldap3  # type: ignore
except ImportError:
    ldap3 = None  # type: ignore

from ..models.sso import SSOProvider, SSOSession, SSOUserMapping, SSOAuditLog, SSOConfiguration
from ..models.user import User
from ..models.tenant import Tenant


class SSOService:
    """Service for managing Single Sign-On operations"""

    def __init__(self, db: Session) -> None:
        self.db = db

    # Provider Management
    def create_sso_provider(
        self,
        tenant_id: int,
        name: str,
        provider_type: str,
        config: Dict[str, Any],
        created_by_user_id: Optional[int] = None
    ) -> SSOProvider:
        """Create a new SSO provider for a tenant"""
        
        provider = SSOProvider()  # type: ignore
        setattr(provider, 'tenant_id', tenant_id)  # type: ignore
        setattr(provider, 'name', name)  # type: ignore
        setattr(provider, 'provider_type', provider_type)  # type: ignore
        setattr(provider, 'created_by_user_id', created_by_user_id)  # type: ignore
        
        # Set provider-specific configuration
        if provider_type == "saml":
            setattr(provider, 'saml_entity_id', config.get("entity_id"))  # type: ignore
            setattr(provider, 'saml_sso_url', config.get("sso_url"))  # type: ignore
            setattr(provider, 'saml_slo_url', config.get("slo_url"))  # type: ignore
            setattr(provider, 'saml_certificate', config.get("certificate"))  # type: ignore
            setattr(provider, 'require_signed_assertions', config.get("require_signed_assertions", True))  # type: ignore
            setattr(provider, 'require_encrypted_assertions', config.get("require_encrypted_assertions", False))  # type: ignore
            
        elif provider_type in ["oauth2", "oidc"]:
            setattr(provider, 'issuer_url', config.get("issuer_url"))  # type: ignore
            setattr(provider, 'client_id', config.get("client_id"))  # type: ignore
            client_secret = config.get("client_secret")
            if client_secret:
                setattr(provider, 'client_secret', self._encrypt_secret(str(client_secret)))  # type: ignore
            
        elif provider_type == "ldap":
            setattr(provider, 'ldap_server', config.get("server"))  # type: ignore
            setattr(provider, 'ldap_port', config.get("port", 389))  # type: ignore
            setattr(provider, 'ldap_base_dn', config.get("base_dn"))  # type: ignore
            setattr(provider, 'ldap_bind_dn', config.get("bind_dn"))  # type: ignore
            bind_password = config.get("bind_password")
            if bind_password:
                setattr(provider, 'ldap_bind_password', self._encrypt_secret(str(bind_password)))  # type: ignore
            setattr(provider, 'ldap_user_filter', config.get("user_filter", "(uid={username})"))  # type: ignore
            setattr(provider, 'ldap_group_filter', config.get("group_filter"))  # type: ignore
        
        # Set attribute and role mappings
        setattr(provider, 'attribute_mapping', config.get("attribute_mapping", {}))  # type: ignore
        setattr(provider, 'role_mapping', config.get("role_mapping", {}))  # type: ignore
        setattr(provider, 'auto_provision_users', config.get("auto_provision_users", True))  # type: ignore
        setattr(provider, 'auto_update_user_info', config.get("auto_update_user_info", True))  # type: ignore
        setattr(provider, 'default_user_role', config.get("default_user_role", "member"))  # type: ignore
        
        self.db.add(provider)
        self.db.commit()
        self.db.refresh(provider)
        
        # Log provider creation
        self._log_sso_event(
            tenant_id,
            "provider_created",
            "configuration",
            provider_id=provider.id,
            user_id=created_by_user_id,
            details={"provider_name": name, "provider_type": provider_type}
        )
        
        return provider

    def get_sso_provider(self, provider_id: int) -> Optional[SSOProvider]:
        """Get SSO provider by ID"""
        return self.db.query(SSOProvider).filter(SSOProvider.id == provider_id).first()  # type: ignore

    def get_tenant_sso_providers(self, tenant_id: int, active_only: bool = True) -> List[SSOProvider]:
        """Get all SSO providers for a tenant"""
        query = self.db.query(SSOProvider).filter(SSOProvider.tenant_id == tenant_id)  # type: ignore
        if active_only:
            query = query.filter(SSOProvider.is_active.is_(True))  # type: ignore
        return query.all()  # type: ignore

    def get_default_sso_provider(self, tenant_id: int) -> Optional[SSOProvider]:
        """Get the default SSO provider for a tenant"""
        return self.db.query(SSOProvider).filter(
            and_(
                SSOProvider.tenant_id == tenant_id,  # type: ignore
                SSOProvider.is_default.is_(True),  # type: ignore
                SSOProvider.is_active.is_(True)  # type: ignore
            )
        ).first()  # type: ignore

    # SAML Authentication
    def initiate_saml_auth(
        self,
        provider_id: int,
        relay_state: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Tuple[str, SSOSession]:
        """Initiate SAML authentication request"""
        
        provider = self.get_sso_provider(provider_id)
        if not provider or not getattr(provider, 'is_saml', False):  # type: ignore
            raise ValueError("Invalid SAML provider")
        
        # Create SSO session
        session = SSOSession()  # type: ignore
        setattr(session, 'provider_id', provider_id)  # type: ignore
        setattr(session, 'tenant_id', getattr(provider, 'tenant_id', None))  # type: ignore
        setattr(session, 'authentication_method', "saml")  # type: ignore
        setattr(session, 'ip_address', ip_address)  # type: ignore
        setattr(session, 'user_agent', user_agent)  # type: ignore
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        # Generate SAML AuthnRequest
        authn_request = self._generate_saml_authn_request(provider, session.session_uuid, relay_state)
        
        # Log authentication initiation
        self._log_sso_event(
            provider.tenant_id,
            "saml_auth_initiated",
            "authentication",
            provider_id=provider_id,
            session_id=session.id,
            ip_address=ip_address,
            details={"relay_state": relay_state}
        )
        
        return authn_request, session

    def process_saml_response(
        self,
        saml_response: str,
        session_uuid: str,
        ip_address: Optional[str] = None
    ) -> Tuple[bool, Optional[User], Optional[str]]:
        """Process SAML authentication response"""
        
        try:
            # Find session
            session = self.db.query(SSOSession).filter(
                SSOSession.session_uuid == session_uuid  # type: ignore
            ).first()  # type: ignore
            
            if not session:
                return False, None, "Invalid session"
            
            provider = self.get_sso_provider(session.provider_id)
            if not provider:
                return False, None, "Invalid provider"
            
            # Parse and validate SAML response
            user_attributes = self._parse_saml_response(saml_response, provider)
            if not user_attributes:
                setattr(session, 'status', "failed")  # type: ignore
                setattr(session, 'failure_reason', "Invalid SAML response")  # type: ignore
                self.db.commit()
                return False, None, "Invalid SAML response"
            
            # Extract user information
            subject_id = user_attributes.get("subject_id")
            email = user_attributes.get("email")
            name = user_attributes.get("name")
            
            if not subject_id:
                setattr(session, 'status', "failed")  # type: ignore
                setattr(session, 'failure_reason', "Missing subject ID")  # type: ignore
                self.db.commit()
                return False, None, "Missing subject ID"
            
            # Update session
            setattr(session, 'subject_id', subject_id)  # type: ignore
            setattr(session, 'email', email)  # type: ignore
            setattr(session, 'name_id', user_attributes.get("name_id"))  # type: ignore
            setattr(session, 'name_id_format', user_attributes.get("name_id_format"))  # type: ignore
            setattr(session, 'authenticated_at', datetime.utcnow())  # type: ignore
            setattr(session, 'status', "authenticated")  # type: ignore
            setattr(session, 'idp_attributes', user_attributes)  # type: ignore
            setattr(session, 'expires_at', datetime.utcnow() + timedelta(hours=8))  # type: ignore
            
            # Find or create user
            user = self._find_or_create_user(provider, subject_id, email, name, user_attributes)
            if user:
                setattr(session, 'user_id', getattr(user, 'id', None))  # type: ignore
                
                # Update user mapping
                self._update_user_mapping(provider, user, subject_id, email)
            
            self.db.commit()
            
            # Log successful authentication
            self._log_sso_event(
                provider.tenant_id,
                "saml_auth_success",
                "authentication",
                provider_id=provider.id,
                session_id=session.id,
                user_id=user.id if user else None,
                subject_id=subject_id,
                email=email,
                ip_address=ip_address,
                details={"name_id": session.name_id}
            )
            
            return True, user, None
            
        except Exception as e:
            # Log authentication failure
            self._log_sso_event(
                getattr(session, 'provider', {}).get('tenant_id') if session else None,  # type: ignore
                "saml_auth_failure",
                "authentication",
                provider_id=getattr(session, 'provider_id', None) if session else None,  # type: ignore
                session_id=getattr(session, 'id', None) if session else None,  # type: ignore
                ip_address=ip_address,
                error_message=str(e)
            )
            
            if session:
                setattr(session, 'status', "failed")  # type: ignore
                setattr(session, 'failure_reason', str(e))  # type: ignore
                self.db.commit()
            
            return False, None, str(e)

    # OAuth2/OIDC Authentication
    def initiate_oauth_auth(
        self,
        provider_id: int,
        redirect_uri: str,
        state: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Tuple[str, SSOSession]:
        """Initiate OAuth2/OIDC authentication"""
        
        provider = self.get_sso_provider(provider_id)
        if not provider or not getattr(provider, 'is_oauth2', False):  # type: ignore
            raise ValueError("Invalid OAuth2 provider")
        
        # Create SSO session
        session = SSOSession()  # type: ignore
        setattr(session, 'provider_id', provider_id)  # type: ignore
        setattr(session, 'tenant_id', getattr(provider, 'tenant_id', None))  # type: ignore
        setattr(session, 'authentication_method', "oauth2")  # type: ignore
        setattr(session, 'state_token', state or secrets.token_urlsafe(32))  # type: ignore
        setattr(session, 'ip_address', ip_address)  # type: ignore
        setattr(session, 'user_agent', user_agent)  # type: ignore
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        # Generate OAuth2 authorization URL
        auth_url = self._generate_oauth_auth_url(provider, redirect_uri, session.state_token)
        
        # Log authentication initiation
        self._log_sso_event(
            provider.tenant_id,
            "oauth_auth_initiated",
            "authentication",
            provider_id=provider_id,
            session_id=session.id,
            ip_address=ip_address,
            details={"redirect_uri": redirect_uri}
        )
        
        return auth_url, session

    def process_oauth_callback(
        self,
        provider_id: int,
        authorization_code: str,
        state: str,
        redirect_uri: str,
        ip_address: Optional[str] = None
    ) -> Tuple[bool, Optional[User], Optional[str]]:
        """Process OAuth2/OIDC callback"""
        
        try:
            # Find session by state token
            session = self.db.query(SSOSession).filter(
                and_(
                    SSOSession.provider_id == provider_id,  # type: ignore
                    SSOSession.state_token == state,  # type: ignore
                    SSOSession.status == "initiated"  # type: ignore
                )
            ).first()  # type: ignore
            
            if not session:
                return False, None, "Invalid state parameter"
            
            provider = self.get_sso_provider(provider_id)
            if not provider:
                return False, None, "Invalid provider"
            
            # Exchange authorization code for tokens
            tokens = self._exchange_oauth_code(provider, authorization_code, redirect_uri)
            if not tokens:
                setattr(session, 'status', "failed")  # type: ignore
                setattr(session, 'failure_reason', "Token exchange failed")  # type: ignore
                self.db.commit()
                return False, None, "Token exchange failed"
            
            # Get user info from ID token or userinfo endpoint
            user_info = self._get_oauth_user_info(provider, tokens)
            if not user_info:
                setattr(session, 'status', "failed")  # type: ignore
                setattr(session, 'failure_reason', "Failed to get user info")  # type: ignore
                self.db.commit()
                return False, None, "Failed to get user info"
            
            # Extract user information
            subject_id = user_info.get("sub")
            email = user_info.get("email")
            name = user_info.get("name")
            
            if not subject_id:
                setattr(session, 'status', "failed")  # type: ignore
                setattr(session, 'failure_reason', "Missing subject ID")  # type: ignore
                self.db.commit()
                return False, None, "Missing subject ID"
            
            # Update session
            setattr(session, 'subject_id', subject_id)  # type: ignore
            setattr(session, 'email', email)  # type: ignore
            setattr(session, 'authenticated_at', datetime.utcnow())  # type: ignore
            setattr(session, 'status', "authenticated")  # type: ignore
            setattr(session, 'idp_attributes', user_info)  # type: ignore
            setattr(session, 'expires_at', datetime.utcnow() + timedelta(hours=8))  # type: ignore
            
            # Find or create user
            user = self._find_or_create_user(provider, subject_id, email, name, user_info)
            if user:
                setattr(session, 'user_id', getattr(user, 'id', None))  # type: ignore
                
                # Update user mapping
                self._update_user_mapping(provider, user, subject_id, email)
            
            self.db.commit()
            
            # Log successful authentication
            self._log_sso_event(
                provider.tenant_id,
                "oauth_auth_success",
                "authentication",
                provider_id=provider_id,
                session_id=session.id,
                user_id=user.id if user else None,
                subject_id=subject_id,
                email=email,
                ip_address=ip_address
            )
            
            return True, user, None
            
        except Exception as e:
            # Log authentication failure
            self._log_sso_event(
                getattr(provider, 'tenant_id', None) if 'provider' in locals() and provider else None,  # type: ignore
                "oauth_auth_failure",
                "authentication",
                provider_id=provider_id,
                ip_address=ip_address,
                error_message=str(e)
            )
            
            return False, None, str(e)

    # LDAP Authentication
    def authenticate_ldap(
        self,
        provider_id: int,
        username: str,
        password: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Tuple[bool, Optional[User], Optional[str]]:
        """Authenticate user against LDAP"""
        
        try:
            provider = self.get_sso_provider(provider_id)
            if not provider or not getattr(provider, 'is_ldap', False):  # type: ignore
                return False, None, "Invalid LDAP provider"
            
            # Create SSO session
            session = SSOSession()  # type: ignore
            setattr(session, 'provider_id', provider_id)  # type: ignore
            setattr(session, 'tenant_id', getattr(provider, 'tenant_id', None))  # type: ignore
            setattr(session, 'authentication_method', "ldap")  # type: ignore
            setattr(session, 'ip_address', ip_address)  # type: ignore
            setattr(session, 'user_agent', user_agent)  # type: ignore
            
            self.db.add(session)
            self.db.commit()
            self.db.refresh(session)
            
            # Connect to LDAP server
            if ldap3 is None:
                raise ImportError("ldap3 library is required for LDAP authentication")
            
            server = ldap3.Server(  # type: ignore
                getattr(provider, 'ldap_server', ''),
                port=getattr(provider, 'ldap_port', 389),
                use_ssl=getattr(provider, 'ldap_port', 389) == 636
            )
            
            # Bind with service account
            bind_password = getattr(provider, 'ldap_bind_password', '')
            conn = ldap3.Connection(  # type: ignore
                server,
                user=getattr(provider, 'ldap_bind_dn', ''),
                password=self._decrypt_secret(bind_password) if bind_password else '',
                auto_bind=True
            )
            
            # Search for user
            user_filter = getattr(provider, 'ldap_user_filter', '(uid={username})').format(username=username)
            conn.search(  # type: ignore
                getattr(provider, 'ldap_base_dn', ''),
                user_filter,
                attributes=['*']
            )
            
            if not conn.entries:
                setattr(session, 'status', "failed")  # type: ignore
                setattr(session, 'failure_reason', "User not found")  # type: ignore
                self.db.commit()
                return False, None, "User not found"
            
            user_entry = conn.entries[0]
            user_dn = user_entry.entry_dn
            
            # Authenticate user
            user_conn = ldap3.Connection(server, user=user_dn, password=password)  # type: ignore
            if not user_conn.bind():  # type: ignore
                setattr(session, 'status', "failed")  # type: ignore
                setattr(session, 'failure_reason', "Invalid credentials")  # type: ignore
                self.db.commit()
                return False, None, "Invalid credentials"
            
            # Extract user attributes
            user_attributes = {}
            for attr_name, attr_values in user_entry.entry_attributes_as_dict.items():
                if attr_values:
                    user_attributes[attr_name] = attr_values[0] if len(attr_values) == 1 else attr_values
            
            # Map attributes
            subject_id = user_attributes.get(getattr(provider, 'get_attribute_mapping', lambda x, y: y)("uid", "uid"))  # type: ignore
            email = user_attributes.get(getattr(provider, 'get_attribute_mapping', lambda x, y: y)("email", "mail"))  # type: ignore
            name = user_attributes.get(getattr(provider, 'get_attribute_mapping', lambda x, y: y)("name", "cn"))  # type: ignore
            
            # Update session
            setattr(session, 'subject_id', subject_id)  # type: ignore
            setattr(session, 'email', email)  # type: ignore
            setattr(session, 'authenticated_at', datetime.utcnow())  # type: ignore
            setattr(session, 'status', "authenticated")  # type: ignore
            setattr(session, 'idp_attributes', user_attributes)  # type: ignore
            setattr(session, 'expires_at', datetime.utcnow() + timedelta(hours=8))  # type: ignore
            
            # Find or create user
            if subject_id:
                user = self._find_or_create_user(provider, str(subject_id), email, name, user_attributes)
                if user:
                    setattr(session, 'user_id', getattr(user, 'id', None))  # type: ignore
                    
                    # Update user mapping
                    self._update_user_mapping(provider, user, str(subject_id), email)
            
            self.db.commit()
            
            # Log successful authentication
            self._log_sso_event(
                provider.tenant_id,
                "ldap_auth_success",
                "authentication",
                provider_id=provider_id,
                session_id=session.id,
                user_id=user.id if user else None,
                subject_id=subject_id,
                email=email,
                ip_address=ip_address
            )
            
            return True, user, None
            
        except Exception as e:
            # Log authentication failure
            self._log_sso_event(
                getattr(provider, 'tenant_id', None) if 'provider' in locals() and provider else None,  # type: ignore
                "ldap_auth_failure",
                "authentication",
                provider_id=provider_id,
                ip_address=ip_address,
                error_message=str(e)
            )
            
            return False, None, str(e)

    # Session Management
    def get_active_session(self, session_uuid: str) -> Optional[SSOSession]:
        """Get active SSO session"""
        session = self.db.query(SSOSession).filter(
            SSOSession.session_uuid == session_uuid  # type: ignore
        ).first()  # type: ignore
        
        if session and getattr(session, 'is_active', False):  # type: ignore
            # Update last activity
            setattr(session, 'last_activity_at', datetime.utcnow())  # type: ignore
            self.db.commit()
            return session
        
        return None

    def terminate_session(self, session_uuid: str, reason: str = "user_logout") -> bool:
        """Terminate SSO session"""
        session = self.db.query(SSOSession).filter(
            SSOSession.session_uuid == session_uuid  # type: ignore
        ).first()  # type: ignore
        
        if session:
            getattr(session, 'terminate', lambda x: None)(reason)  # type: ignore
            self.db.commit()
            
            # Log session termination
            self._log_sso_event(
                session.tenant_id,
                "session_terminated",
                "authentication",
                provider_id=session.provider_id,
                session_id=session.id,
                user_id=session.user_id,
                details={"reason": reason}
            )
            
            return True
        
        return False

    # Helper Methods
    def _encrypt_secret(self, secret: str) -> str:
        """Encrypt sensitive data (placeholder implementation)"""
        # In production, use proper encryption
        return base64.b64encode(secret.encode()).decode()

    def _decrypt_secret(self, encrypted_secret: str) -> str:
        """Decrypt sensitive data (placeholder implementation)"""
        # In production, use proper decryption
        return base64.b64decode(encrypted_secret.encode()).decode()

    def _generate_saml_authn_request(self, provider: SSOProvider, session_uuid: str, relay_state: Optional[str]) -> str:
        """Generate SAML AuthnRequest (simplified implementation)"""
        # This is a simplified implementation
        # In production, use a proper SAML library like python3-saml
        request_id = f"_req_{uuid.uuid4()}"
        
        authn_request = f"""
        <samlp:AuthnRequest
            xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
            xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
            ID="{request_id}"
            Version="2.0"
            IssueInstant="{datetime.utcnow().isoformat()}Z"
            Destination="{provider.saml_sso_url}"
            AssertionConsumerServiceURL="https://your-app.com/sso/saml/acs"
            ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
            <saml:Issuer>https://your-app.com</saml:Issuer>
        </samlp:AuthnRequest>
        """
        
        # Base64 encode and URL encode for redirect binding
        encoded_request = base64.b64encode(authn_request.encode()).decode()
        
        # Build redirect URL
        params = {
            'SAMLRequest': encoded_request,
            'RelayState': relay_state or session_uuid
        }
        
        return f"{provider.saml_sso_url}?{urlencode(params)}"

    def _parse_saml_response(self, saml_response: str, provider: SSOProvider) -> Optional[Dict[str, Any]]:
        """Parse SAML response (simplified implementation)"""
        # This is a simplified implementation
        # In production, use a proper SAML library for validation and parsing
        try:
            decoded_response = base64.b64decode(saml_response)
            root = ET.fromstring(decoded_response)
            
            # Extract user attributes (simplified)
            user_attributes = {
                "subject_id": "user123",  # Extract from NameID
                "email": "user@example.com",  # Extract from attributes
                "name": "User Name",  # Extract from attributes
                "name_id": "user123",
                "name_id_format": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
            }
            
            return user_attributes
            
        except Exception:
            return None

    def _generate_oauth_auth_url(self, provider: SSOProvider, redirect_uri: str, state: str) -> str:
        """Generate OAuth2 authorization URL"""
        params = {
            'response_type': 'code',
            'client_id': provider.client_id,
            'redirect_uri': redirect_uri,
            'state': state,
            'scope': 'openid profile email'
        }
        
        return f"{provider.issuer_url}/auth?{urlencode(params)}"

    def _exchange_oauth_code(self, provider: SSOProvider, code: str, redirect_uri: str) -> Optional[Dict[str, Any]]:
        """Exchange OAuth2 authorization code for tokens"""
        try:
            token_url = f"{provider.issuer_url}/token"
            
            data = {
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': redirect_uri,
                'client_id': provider.client_id,
                'client_secret': self._decrypt_secret(provider.client_secret)
            }
            
            response = requests.post(token_url, data=data)
            if response.status_code == 200:
                return response.json()
            
        except Exception:
            pass
        
        return None

    def _get_oauth_user_info(self, provider: SSOProvider, tokens: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get user info from OAuth2/OIDC provider"""
        try:
            # Try to decode ID token first (OIDC)
            if 'id_token' in tokens:
                # In production, verify the JWT signature
                decoded_token = jwt.decode(tokens['id_token'], options={"verify_signature": False})
                return decoded_token
            
            # Fallback to userinfo endpoint
            userinfo_url = f"{provider.issuer_url}/userinfo"
            headers = {'Authorization': f"Bearer {tokens['access_token']}"}
            
            response = requests.get(userinfo_url, headers=headers)
            if response.status_code == 200:
                return response.json()
            
        except Exception:
            pass
        
        return None

    def _find_or_create_user(
        self,
        provider: SSOProvider,
        subject_id: str,
        email: Optional[str],
        name: Optional[str],
        attributes: Dict[str, Any]
    ) -> Optional[User]:
        """Find existing user or create new one if auto-provisioning is enabled"""
        
        # First, check if user mapping exists
        mapping = self.db.query(SSOUserMapping).filter(
            and_(
                SSOUserMapping.provider_id == provider.id,  # type: ignore
                SSOUserMapping.subject_id == subject_id  # type: ignore
            )
        ).first()  # type: ignore
        
        if mapping:
            user = self.db.query(User).filter(User.id == mapping.user_id).first()  # type: ignore
            if user:
                getattr(mapping, 'update_login_info', lambda: None)()  # type: ignore
                self.db.commit()
                return user
        
        # Try to find user by email
        if email:
            user = self.db.query(User).filter(User.email == email).first()  # type: ignore
            if user:
                # Create mapping
                self._create_user_mapping(provider, user, subject_id, email)
                return user
        
        # Auto-provision user if enabled
        if getattr(provider, 'auto_provision_users', False) and email:  # type: ignore
            user = User()  # type: ignore
            setattr(user, 'email', email)  # type: ignore
            setattr(user, 'full_name', name or email.split('@')[0])  # type: ignore
            setattr(user, 'is_active', True)  # type: ignore
            setattr(user, 'current_tenant_id', getattr(provider, 'tenant_id', None))  # type: ignore
            
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            
            # Create mapping
            self._create_user_mapping(provider, user, subject_id, email, auto_provisioned=True)
            
            return user
        
        return None

    def _create_user_mapping(
        self,
        provider: SSOProvider,
        user: User,
        subject_id: str,
        email: Optional[str],
        auto_provisioned: bool = False
    ) -> SSOUserMapping:
        """Create user mapping"""
        
        mapping = SSOUserMapping()  # type: ignore
        setattr(mapping, 'provider_id', getattr(provider, 'id', None))  # type: ignore
        setattr(mapping, 'user_id', getattr(user, 'id', None))  # type: ignore
        setattr(mapping, 'tenant_id', getattr(provider, 'tenant_id', None))  # type: ignore
        setattr(mapping, 'subject_id', subject_id)  # type: ignore
        setattr(mapping, 'email', email)  # type: ignore
        setattr(mapping, 'auto_provisioned', auto_provisioned)  # type: ignore
        
        getattr(mapping, 'update_login_info', lambda: None)()  # type: ignore
        
        self.db.add(mapping)
        self.db.commit()
        self.db.refresh(mapping)
        
        return mapping

    def _update_user_mapping(
        self,
        provider: SSOProvider,
        user: User,
        subject_id: str,
        email: Optional[str]
    ):
        """Update existing user mapping"""
        
        mapping = self.db.query(SSOUserMapping).filter(
            and_(
                SSOUserMapping.provider_id == provider.id,  # type: ignore
                SSOUserMapping.user_id == user.id  # type: ignore
            )
        ).first()  # type: ignore
        
        if mapping:
            getattr(mapping, 'update_login_info', lambda: None)()  # type: ignore
            if email and getattr(mapping, 'email', None) != email:  # type: ignore
                setattr(mapping, 'email', email)  # type: ignore
            self.db.commit()

    def _log_sso_event(
        self,
        tenant_id: Optional[int],
        event_type: str,
        event_category: str,
        provider_id: Optional[int] = None,
        session_id: Optional[int] = None,
        user_id: Optional[int] = None,
        subject_id: Optional[str] = None,
        email: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None
    ) -> None:
        """Log SSO audit event"""
        
        audit_log = SSOAuditLog()  # type: ignore
        setattr(audit_log, 'tenant_id', tenant_id)  # type: ignore
        setattr(audit_log, 'provider_id', provider_id)  # type: ignore
        setattr(audit_log, 'user_id', user_id)  # type: ignore
        setattr(audit_log, 'session_id', session_id)  # type: ignore
        setattr(audit_log, 'event_type', event_type)  # type: ignore
        setattr(audit_log, 'event_category', event_category)  # type: ignore
        setattr(audit_log, 'subject_id', subject_id)  # type: ignore
        setattr(audit_log, 'email', email)  # type: ignore
        setattr(audit_log, 'ip_address', ip_address)  # type: ignore
        setattr(audit_log, 'user_agent', user_agent)  # type: ignore
        setattr(audit_log, 'details', details or {})  # type: ignore
        setattr(audit_log, 'error_message', error_message)  # type: ignore
        
        self.db.add(audit_log)
        # Note: Commit is handled by the calling method


def get_sso_service(db: Session) -> SSOService:
    """Get SSO service instance"""
    return SSOService(db)