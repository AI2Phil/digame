"""
Enterprise SSO service for SAML, OIDC, and LDAP integration
"""

import json
import base64
import secrets
import hashlib
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import xml.etree.ElementTree as ET
from urllib.parse import urlencode, parse_qs
import requests
import jwt
from cryptography.fernet import Fernet

from ..models.enterprise_sso import (
    SSOProvider, SSOSession, SSOAuditLog, 
    TenantSSOConfiguration, SSOUserMapping
)
from ..database import get_db


class EnterpriseSSOService:
    """Service for managing enterprise SSO authentication"""
    
    def __init__(self, db: Session):
        self.db = db
        self.encryption_key = self._get_encryption_key()
        self.cipher_suite = Fernet(self.encryption_key)
    
    def _get_encryption_key(self) -> bytes:
        """Get or generate encryption key for sensitive data"""
        # In production, this should come from environment variables or key management
        return base64.urlsafe_b64encode(b"your-32-byte-key-here-for-encryption!")
    
    def _encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive configuration data"""
        return self.cipher_suite.encrypt(data.encode()).decode()
    
    def _decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive configuration data"""
        return self.cipher_suite.decrypt(encrypted_data.encode()).decode()
    
    # SSO Provider Management
    
    def create_sso_provider(
        self, 
        tenant_id: int, 
        created_by: int,
        provider_data: Dict[str, Any]
    ) -> SSOProvider:
        """Create a new SSO provider configuration"""
        
        # Encrypt sensitive configuration data
        config = provider_data.get("configuration", {})
        if "client_secret" in config:
            config["client_secret"] = self._encrypt_sensitive_data(config["client_secret"])
        if "private_key" in config:
            config["private_key"] = self._encrypt_sensitive_data(config["private_key"])
        
        provider = SSOProvider()
        setattr(provider, 'tenant_id', tenant_id)  # type: ignore
        setattr(provider, 'name', provider_data["name"])  # type: ignore
        setattr(provider, 'provider_type', provider_data["provider_type"])  # type: ignore
        setattr(provider, 'configuration', config)  # type: ignore
        setattr(provider, 'metadata', provider_data.get("metadata"))  # type: ignore
        setattr(provider, 'auto_provision_users', provider_data.get("auto_provision_users", True))  # type: ignore
        setattr(provider, 'default_role', provider_data.get("default_role", "user"))  # type: ignore
        setattr(provider, 'attribute_mapping', provider_data.get("attribute_mapping", {}))  # type: ignore
        setattr(provider, 'require_signed_assertions', provider_data.get("require_signed_assertions", True))  # type: ignore
        setattr(provider, 'encrypt_assertions', provider_data.get("encrypt_assertions", False))  # type: ignore
        setattr(provider, 'session_timeout_minutes', provider_data.get("session_timeout_minutes", 480))  # type: ignore
        setattr(provider, 'created_by', created_by)  # type: ignore
        
        self.db.add(provider)
        self.db.commit()
        self.db.refresh(provider)
        
        # Log the creation
        self._log_sso_event(
            tenant_id=tenant_id,
            provider_id=getattr(provider, 'id', None),
            user_id=created_by,
            event_type="provider_created",
            event_category="configuration",
            event_description=f"SSO provider '{getattr(provider, 'name', '')}' created",
            event_data={"provider_type": getattr(provider, 'provider_type', '')}
        )
        
        return provider
    
    def get_sso_providers(
        self, 
        tenant_id: int, 
        status: Optional[str] = None
    ) -> List[SSOProvider]:
        """Get SSO providers for a tenant"""
        query = self.db.query(SSOProvider).filter(SSOProvider.tenant_id == tenant_id)
        
        if status:
            query = query.filter(SSOProvider.status == status)
        
        return query.order_by(SSOProvider.created_at.desc()).all()
    
    def update_sso_provider(
        self, 
        provider_id: int, 
        tenant_id: int,
        updated_by: int,
        update_data: Dict[str, Any]
    ) -> Optional[SSOProvider]:
        """Update SSO provider configuration"""
        provider = self.db.query(SSOProvider).filter(
            and_(
                SSOProvider.id == provider_id,
                SSOProvider.tenant_id == tenant_id
            )
        ).first()
        
        if not provider:
            return None
        
        # Handle sensitive data encryption
        if "configuration" in update_data:
            config = update_data["configuration"]
            if "client_secret" in config:
                config["client_secret"] = self._encrypt_sensitive_data(config["client_secret"])
            if "private_key" in config:
                config["private_key"] = self._encrypt_sensitive_data(config["private_key"])
        
        # Update fields
        for field, value in update_data.items():
            if hasattr(provider, field):
                setattr(provider, field, value)
        
        setattr(provider, 'updated_at', datetime.utcnow())  # type: ignore
        self.db.commit()
        
        # Log the update
        self._log_sso_event(
            tenant_id=tenant_id,
            provider_id=getattr(provider, 'id', None),
            user_id=updated_by,
            event_type="provider_updated",
            event_category="configuration",
            event_description=f"SSO provider '{getattr(provider, 'name', '')}' updated",
            event_data={"updated_fields": list(update_data.keys())}
        )
        
        return provider
    
    def test_sso_provider(
        self, 
        provider_id: int, 
        tenant_id: int,
        test_user_id: int
    ) -> Dict[str, Any]:
        """Test SSO provider configuration"""
        provider = self.db.query(SSOProvider).filter(
            and_(
                SSOProvider.id == provider_id,
                SSOProvider.tenant_id == tenant_id
            )
        ).first()
        
        if not provider:
            return {"success": False, "error": "Provider not found"}
        
        try:
            provider_type = getattr(provider, 'provider_type', '')
            if provider_type == "saml":
                result = self._test_saml_provider(provider)
            elif provider_type == "oidc":
                result = self._test_oidc_provider(provider)
            elif provider_type == "ldap":
                result = self._test_ldap_provider(provider)
            else:
                result = {"success": False, "error": "Unsupported provider type"}
            
            # Update last tested timestamp
            setattr(provider, 'last_tested_at', datetime.utcnow())  # type: ignore
            self.db.commit()
            
            # Log the test
            self._log_sso_event(
                tenant_id=tenant_id,
                provider_id=getattr(provider, 'id', None),
                user_id=test_user_id,
                event_type="provider_tested",
                event_category="configuration",
                event_description=f"SSO provider '{getattr(provider, 'name', '')}' tested",
                event_data=result,
                success=bool(result.get("success", False))
            )
            
            return result
            
        except Exception as e:
            error_result = {"success": False, "error": str(e)}
            
            # Log the error
            self._log_sso_event(
                tenant_id=tenant_id,
                provider_id=getattr(provider, 'id', None),
                user_id=test_user_id,
                event_type="provider_test_failed",
                event_category="configuration",
                event_description=f"SSO provider '{getattr(provider, 'name', '')}' test failed",
                event_data=error_result,
                success=False,
                error_message=str(e)
            )
            
            return error_result
    
    # SSO Authentication Flow
    
    def initiate_sso_login(
        self, 
        provider_id: int, 
        tenant_id: int,
        return_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Initiate SSO login flow"""
        provider = self.db.query(SSOProvider).filter(
            and_(
                SSOProvider.id == provider_id,
                SSOProvider.tenant_id == tenant_id,
                SSOProvider.status == "active"
            )
        ).first()
        
        if not provider:
            return {"success": False, "error": "Provider not found or inactive"}
        
        try:
            provider_type = getattr(provider, 'provider_type', '')
            if provider_type == "saml":
                return self._initiate_saml_login(provider, return_url)
            elif provider_type == "oidc":
                return self._initiate_oidc_login(provider, return_url)
            else:
                return {"success": False, "error": "Unsupported provider type for web login"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def handle_sso_callback(
        self, 
        provider_id: int, 
        tenant_id: int,
        callback_data: Dict[str, Any],
        ip_address: str,
        user_agent: str
    ) -> Dict[str, Any]:
        """Handle SSO authentication callback"""
        provider = self.db.query(SSOProvider).filter(
            and_(
                SSOProvider.id == provider_id,
                SSOProvider.tenant_id == tenant_id,
                SSOProvider.status == "active"
            )
        ).first()
        
        if not provider:
            return {"success": False, "error": "Provider not found or inactive"}
        
        try:
            provider_type = getattr(provider, 'provider_type', '')
            if provider_type == "saml":
                auth_result = self._handle_saml_callback(provider, callback_data)
            elif provider_type == "oidc":
                auth_result = self._handle_oidc_callback(provider, callback_data)
            else:
                return {"success": False, "error": "Unsupported provider type"}
            
            if auth_result["success"]:
                # Create or update user mapping
                user_mapping = self._create_or_update_user_mapping(
                    provider, auth_result["user_info"]
                )
                
                # Create SSO session
                session = self._create_sso_session(
                    provider, user_mapping, auth_result, ip_address, user_agent
                )
                
                # Log successful login
                self._log_sso_event(
                    tenant_id=tenant_id,
                    provider_id=getattr(provider, 'id', None),
                    user_id=getattr(user_mapping, 'user_id', None),
                    event_type="login_success",
                    event_category="authentication",
                    event_description=f"Successful SSO login via {getattr(provider, 'name', '')}",
                    event_data={
                        "session_id": getattr(session, 'session_id', None),
                        "external_user_id": auth_result["user_info"]["external_user_id"]
                    },
                    ip_address=ip_address,
                    user_agent=user_agent,
                    session_id=getattr(session, 'session_id', None)
                )
                
                return {
                    "success": True,
                    "user_id": user_mapping.user_id,
                    "session_id": session.session_id,
                    "user_info": auth_result["user_info"]
                }
            else:
                # Log failed login
                self._log_sso_event(
                    tenant_id=tenant_id,
                    provider_id=getattr(provider, 'id', None),
                    event_type="login_failed",
                    event_category="authentication",
                    event_description=f"Failed SSO login via {getattr(provider, 'name', '')}",
                    event_data=auth_result,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                    error_message=auth_result.get("error", "Unknown error")
                )
                
                return auth_result
                
        except Exception as e:
            # Log exception
            self._log_sso_event(
                tenant_id=tenant_id,
                provider_id=getattr(provider, 'id', None),
                event_type="login_error",
                event_category="authentication",
                event_description=f"SSO login error via {getattr(provider, 'name', '')}",
                event_data={"error": str(e)},
                ip_address=ip_address,
                user_agent=user_agent,
                success=False,
                error_message=str(e)
            )
            
            return {"success": False, "error": str(e)}
    
    def logout_sso_session(
        self, 
        session_id: str, 
        tenant_id: int,
        logout_reason: str = "manual"
    ) -> Dict[str, Any]:
        """Logout SSO session"""
        session = self.db.query(SSOSession).filter(
            and_(
                SSOSession.session_id == session_id,
                SSOSession.tenant_id == tenant_id,
                SSOSession.is_active == True
            )
        ).first()
        
        if not session:
            return {"success": False, "error": "Session not found"}
        
        # Deactivate session
        setattr(session, 'is_active', False)  # type: ignore
        setattr(session, 'logout_reason', logout_reason)  # type: ignore
        self.db.commit()
        
        # Log logout
        self._log_sso_event(
            tenant_id=tenant_id,
            provider_id=getattr(session, 'provider_id', None),
            user_id=getattr(session, 'user_id', None),
            event_type="logout",
            event_category="authentication",
            event_description=f"SSO session logged out: {logout_reason}",
            event_data={"logout_reason": logout_reason},
            session_id=session_id
        )
        
        # If SAML, initiate SLO if supported
        if session.provider.provider_type == "saml" and session.saml_session_index:
            slo_url = self._initiate_saml_slo(session)
            return {"success": True, "slo_url": slo_url}
        
        return {"success": True}
    
    # Session Management
    
    def get_active_sessions(
        self, 
        tenant_id: int, 
        user_id: Optional[int] = None
    ) -> List[SSOSession]:
        """Get active SSO sessions"""
        query = self.db.query(SSOSession).filter(
            and_(
                SSOSession.tenant_id == tenant_id,
                SSOSession.is_active == True,
                SSOSession.expires_at > datetime.utcnow()
            )
        )
        
        if user_id:
            query = query.filter(SSOSession.user_id == user_id)
        
        return query.order_by(SSOSession.last_activity_at.desc()).all()
    
    def cleanup_expired_sessions(self, tenant_id: int) -> int:
        """Clean up expired SSO sessions"""
        expired_sessions = self.db.query(SSOSession).filter(
            and_(
                SSOSession.tenant_id == tenant_id,
                SSOSession.is_active == True,
                SSOSession.expires_at <= datetime.utcnow()
            )
        ).all()
        
        count = 0
        for session in expired_sessions:
            setattr(session, 'is_active', False)  # type: ignore
            setattr(session, 'logout_reason', "timeout")  # type: ignore
            count += 1
            
            # Log timeout
            self._log_sso_event(
                tenant_id=tenant_id,
                provider_id=getattr(session, 'provider_id', None),
                user_id=getattr(session, 'user_id', None),
                event_type="session_timeout",
                event_category="authentication",
                event_description="SSO session timed out",
                session_id=getattr(session, 'session_id', None)
            )
        
        if count > 0:
            self.db.commit()
        
        return count
    
    # Tenant Configuration
    
    def get_tenant_sso_config(self, tenant_id: int) -> Optional[TenantSSOConfiguration]:
        """Get tenant SSO configuration"""
        return self.db.query(TenantSSOConfiguration).filter(
            TenantSSOConfiguration.tenant_id == tenant_id
        ).first()
    
    def update_tenant_sso_config(
        self, 
        tenant_id: int, 
        updated_by: int,
        config_data: Dict[str, Any]
    ) -> TenantSSOConfiguration:
        """Update tenant SSO configuration"""
        config = self.get_tenant_sso_config(tenant_id)
        
        if not config:
            config = TenantSSOConfiguration()
            setattr(config, 'tenant_id', tenant_id)  # type: ignore
            self.db.add(config)
        
        # Update fields
        for field, value in config_data.items():
            if hasattr(config, field):
                setattr(config, field, value)
        
        setattr(config, 'updated_at', datetime.utcnow())  # type: ignore
        setattr(config, 'updated_by', updated_by)  # type: ignore
        
        self.db.commit()
        self.db.refresh(config)
        
        return config
    
    # Audit and Reporting
    
    def get_sso_audit_logs(
        self, 
        tenant_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        event_type: Optional[str] = None,
        user_id: Optional[int] = None,
        limit: int = 100
    ) -> List[SSOAuditLog]:
        """Get SSO audit logs with filtering"""
        query = self.db.query(SSOAuditLog).filter(
            SSOAuditLog.tenant_id == tenant_id
        )
        
        if start_date:
            query = query.filter(SSOAuditLog.timestamp >= start_date)
        if end_date:
            query = query.filter(SSOAuditLog.timestamp <= end_date)
        if event_type:
            query = query.filter(SSOAuditLog.event_type == event_type)
        if user_id:
            query = query.filter(SSOAuditLog.user_id == user_id)
        
        return query.order_by(SSOAuditLog.timestamp.desc()).limit(limit).all()
    
    def get_sso_analytics(self, tenant_id: int, days: int = 30) -> Dict[str, Any]:
        """Get SSO usage analytics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get login statistics
        login_logs = self.db.query(SSOAuditLog).filter(
            and_(
                SSOAuditLog.tenant_id == tenant_id,
                SSOAuditLog.event_type == "login_success",
                SSOAuditLog.timestamp >= start_date
            )
        ).all()
        
        # Get active sessions
        active_sessions = self.get_active_sessions(tenant_id)
        
        # Get providers
        providers = self.get_sso_providers(tenant_id, status="active")
        
        # Calculate metrics
        total_logins = len(login_logs)
        unique_users = len(set(getattr(log, 'user_id', None) for log in login_logs if getattr(log, 'user_id', None)))
        
        provider_usage = {}
        for log in login_logs:
            log_provider_id = getattr(log, 'provider_id', None)
            if log_provider_id:
                provider_name = next(
                    (getattr(p, 'name', 'Unknown') for p in providers if getattr(p, 'id', None) == log_provider_id),
                    "Unknown"
                )
                provider_usage[provider_name] = provider_usage.get(provider_name, 0) + 1
        
        return {
            "period_days": days,
            "total_logins": total_logins,
            "unique_users": unique_users,
            "active_sessions": len(active_sessions),
            "active_providers": len(providers),
            "provider_usage": provider_usage,
            "average_logins_per_day": total_logins / days if days > 0 else 0
        }
    
    # Private Helper Methods
    
    def _log_sso_event(
        self,
        tenant_id: int,
        event_type: str,
        event_category: str,
        event_description: str,
        provider_id: Optional[int] = None,
        user_id: Optional[int] = None,
        event_data: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        session_id: Optional[str] = None,
        success: bool = True,
        error_code: Optional[str] = None,
        error_message: Optional[str] = None
    ):
        """Log SSO event for audit purposes"""
        log_entry = SSOAuditLog()
        setattr(log_entry, 'tenant_id', tenant_id)  # type: ignore
        setattr(log_entry, 'provider_id', provider_id)  # type: ignore
        setattr(log_entry, 'user_id', user_id)  # type: ignore
        setattr(log_entry, 'event_type', event_type)  # type: ignore
        setattr(log_entry, 'event_category', event_category)  # type: ignore
        setattr(log_entry, 'event_description', event_description)  # type: ignore
        setattr(log_entry, 'ip_address', ip_address)  # type: ignore
        setattr(log_entry, 'user_agent', user_agent)  # type: ignore
        setattr(log_entry, 'session_id', session_id)  # type: ignore
        setattr(log_entry, 'event_data', event_data)  # type: ignore
        setattr(log_entry, 'success', success)  # type: ignore
        setattr(log_entry, 'error_code', error_code)  # type: ignore
        setattr(log_entry, 'error_message', error_message)  # type: ignore
        
        self.db.add(log_entry)
        self.db.commit()
    
    def _test_saml_provider(self, provider: SSOProvider) -> Dict[str, Any]:
        """Test SAML provider configuration"""
        try:
            # Validate metadata
            metadata = getattr(provider, 'metadata', None)
            if not metadata:
                return {"success": False, "error": "No SAML metadata configured"}
            
            # Parse metadata XML
            root = ET.fromstring(metadata)
            
            # Check for required elements
            sso_service = root.find(".//{urn:oasis:names:tc:SAML:2.0:metadata}SingleSignOnService")
            if sso_service is None:
                return {"success": False, "error": "No SingleSignOnService found in metadata"}
            
            sso_url = sso_service.get("Location")
            if not sso_url:
                return {"success": False, "error": "No SSO URL found in metadata"}
            
            # Test connectivity
            response = requests.head(sso_url, timeout=10)
            if response.status_code >= 400:
                return {
                    "success": False, 
                    "error": f"SSO endpoint returned {response.status_code}"
                }
            
            return {
                "success": True,
                "sso_url": sso_url,
                "binding": sso_service.get("Binding"),
                "message": "SAML provider configuration is valid"
            }
            
        except ET.ParseError as e:
            return {"success": False, "error": f"Invalid SAML metadata XML: {str(e)}"}
        except requests.RequestException as e:
            return {"success": False, "error": f"Cannot reach SSO endpoint: {str(e)}"}
        except Exception as e:
            return {"success": False, "error": f"SAML test failed: {str(e)}"}
    
    def _test_oidc_provider(self, provider: SSOProvider) -> Dict[str, Any]:
        """Test OIDC provider configuration"""
        try:
            config = getattr(provider, 'configuration', {})
            
            # Get discovery document
            discovery_url = config.get("discovery_url")
            if not discovery_url:
                return {"success": False, "error": "No discovery URL configured"}
            
            response = requests.get(discovery_url, timeout=10)
            if response.status_code != 200:
                return {
                    "success": False, 
                    "error": f"Discovery endpoint returned {response.status_code}"
                }
            
            discovery_doc = response.json()
            
            # Validate required endpoints
            required_endpoints = ["authorization_endpoint", "token_endpoint"]
            for endpoint in required_endpoints:
                if endpoint not in discovery_doc:
                    return {
                        "success": False, 
                        "error": f"Missing {endpoint} in discovery document"
                    }
            
            return {
                "success": True,
                "authorization_endpoint": discovery_doc["authorization_endpoint"],
                "token_endpoint": discovery_doc["token_endpoint"],
                "issuer": discovery_doc.get("issuer"),
                "message": "OIDC provider configuration is valid"
            }
            
        except requests.RequestException as e:
            return {"success": False, "error": f"Cannot reach discovery endpoint: {str(e)}"}
        except json.JSONDecodeError as e:
            return {"success": False, "error": f"Invalid discovery document JSON: {str(e)}"}
        except Exception as e:
            return {"success": False, "error": f"OIDC test failed: {str(e)}"}
    
    def _test_ldap_provider(self, provider: SSOProvider) -> Dict[str, Any]:
        """Test LDAP provider configuration"""
        try:
            # This would require python-ldap or ldap3 library
            # For now, return a basic validation
            config = getattr(provider, 'configuration', {})
            
            required_fields = ["server", "base_dn"]
            for field in required_fields:
                if not config.get(field):
                    return {"success": False, "error": f"Missing required field: {field}"}
            
            return {
                "success": True,
                "server": config["server"],
                "base_dn": config["base_dn"],
                "message": "LDAP provider configuration appears valid"
            }
            
        except Exception as e:
            return {"success": False, "error": f"LDAP test failed: {str(e)}"}
    
    def _initiate_saml_login(self, provider: SSOProvider, return_url: Optional[str]) -> Dict[str, Any]:
        """Initiate SAML login flow"""
        # This would generate a SAML AuthnRequest
        # For now, return basic structure
        request_id = secrets.token_urlsafe(32)
        
        # Parse metadata to get SSO URL
        metadata = getattr(provider, 'metadata', '')
        root = ET.fromstring(metadata)
        sso_service = root.find(".//{urn:oasis:names:tc:SAML:2.0:metadata}SingleSignOnService")
        sso_url = sso_service.get("Location") if sso_service is not None else None
        
        # Build redirect URL with SAML request
        params = {
            "SAMLRequest": base64.b64encode(f"<saml:AuthnRequest ID='{request_id}' />".encode()).decode(),
            "RelayState": return_url or ""
        }
        
        redirect_url = f"{sso_url}?{urlencode(params)}"
        
        return {
            "success": True,
            "redirect_url": redirect_url,
            "request_id": request_id
        }
    
    def _initiate_oidc_login(self, provider: SSOProvider, return_url: Optional[str]) -> Dict[str, Any]:
        """Initiate OIDC login flow"""
        config = getattr(provider, 'configuration', {})
        
        # Generate state and nonce
        state = secrets.token_urlsafe(32)
        nonce = secrets.token_urlsafe(32)
        
        # Build authorization URL
        params = {
            "response_type": "code",
            "client_id": config["client_id"],
            "redirect_uri": config["redirect_uri"],
            "scope": config.get("scope", "openid profile email"),
            "state": state,
            "nonce": nonce
        }
        
        auth_url = config["authorization_endpoint"]
        redirect_url = f"{auth_url}?{urlencode(params)}"
        
        return {
            "success": True,
            "redirect_url": redirect_url,
            "state": state,
            "nonce": nonce
        }
    
    def _handle_saml_callback(self, provider: SSOProvider, callback_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle SAML authentication callback"""
        # This would parse and validate SAML response
        # For now, return mock successful authentication
        saml_response = callback_data.get("SAMLResponse")
        if not saml_response:
            return {"success": False, "error": "No SAML response received"}
        
        # Mock user info extraction
        return {
            "success": True,
            "user_info": {
                "external_user_id": "saml_user_123",
                "email": "user@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "attributes": {}
            },
            "session_index": "saml_session_123"
        }
    
    def _handle_oidc_callback(self, provider: SSOProvider, callback_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle OIDC authentication callback"""
        # This would exchange code for tokens and validate
        # For now, return mock successful authentication
        code = callback_data.get("code")
        if not code:
            return {"success": False, "error": "No authorization code received"}
        
        # Mock user info extraction
        return {
            "success": True,
            "user_info": {
                "external_user_id": "oidc_user_123",
                "email": "user@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "attributes": {}
            }
        }
    
    def _create_or_update_user_mapping(
        self, 
        provider: SSOProvider, 
        user_info: Dict[str, Any]
    ) -> SSOUserMapping:
        """Create or update SSO user mapping"""
        external_user_id = user_info["external_user_id"]
        
        mapping = self.db.query(SSOUserMapping).filter(
            and_(
                SSOUserMapping.provider_id == getattr(provider, 'id', None),
                SSOUserMapping.external_user_id == external_user_id
            )
        ).first()
        
        if not mapping:
            # Create new mapping (would need to create/find local user)
            mapping = SSOUserMapping(
                tenant_id=provider.tenant_id,
                provider_id=provider.id,
                user_id=1,  # Mock user ID
                external_user_id=external_user_id,
                external_username=user_info.get("username"),
                external_email=user_info.get("email"),
                sso_attributes=user_info.get("attributes", {})
            )
            self.db.add(mapping)
        else:
            # Update existing mapping
            setattr(mapping, 'external_username', user_info.get("username"))  # type: ignore
            setattr(mapping, 'external_email', user_info.get("email"))  # type: ignore
            setattr(mapping, 'sso_attributes', user_info.get("attributes", {}))  # type: ignore
            setattr(mapping, 'updated_at', datetime.utcnow())  # type: ignore
        
        setattr(mapping, 'last_login_at', datetime.utcnow())  # type: ignore
        current_count = getattr(mapping, 'login_count', 0)
        setattr(mapping, 'login_count', current_count + 1)  # type: ignore
        
        self.db.commit()
        self.db.refresh(mapping)
        
        return mapping
    
    def _create_sso_session(
        self, 
        provider: SSOProvider, 
        user_mapping: SSOUserMapping,
        auth_result: Dict[str, Any],
        ip_address: str,
        user_agent: str
    ) -> SSOSession:
        """Create new SSO session"""
        session_id = secrets.token_urlsafe(32)
        timeout_minutes = getattr(provider, 'session_timeout_minutes', 480)
        expires_at = datetime.utcnow() + timedelta(minutes=int(timeout_minutes))
        
        session = SSOSession()
        setattr(session, 'tenant_id', getattr(provider, 'tenant_id', None))  # type: ignore
        setattr(session, 'provider_id', getattr(provider, 'id', None))  # type: ignore
        setattr(session, 'user_id', getattr(user_mapping, 'user_id', None))  # type: ignore
        setattr(session, 'session_id', session_id)  # type: ignore
        setattr(session, 'saml_session_index', auth_result.get("session_index"))  # type: ignore
        setattr(session, 'external_user_id', getattr(user_mapping, 'external_user_id', None))  # type: ignore
        setattr(session, 'login_method', getattr(provider, 'provider_type', ''))  # type: ignore
        setattr(session, 'ip_address', ip_address)  # type: ignore
        setattr(session, 'user_agent', user_agent)  # type: ignore
        setattr(session, 'expires_at', expires_at)  # type: ignore
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        return session
    
    def _initiate_saml_slo(self, session: SSOSession) -> Optional[str]:
        """Initiate SAML Single Logout"""
        # This would generate a SAML LogoutRequest
        # For now, return None to indicate no SLO URL
        return None


def get_enterprise_sso_service(db: Session) -> EnterpriseSSOService:
    """Dependency to get EnterpriseSSOService instance"""
    return EnterpriseSSOService(db)