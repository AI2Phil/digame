"""
Authentication Configuration for Digame Platform

This module provides configuration management for the authentication system.
"""

import os
from typing import List, Optional
from pydantic import BaseModel, field_validator
from datetime import timedelta

class AuthSettings(BaseModel):
    """Authentication settings configuration"""
    
    # JWT Configuration
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # Password Configuration
    password_min_length: int = 8
    password_require_uppercase: bool = True
    password_require_lowercase: bool = True
    password_require_numbers: bool = True
    password_require_special: bool = True
    
    # Rate Limiting
    rate_limit_enabled: bool = True
    rate_limit_calls: int = 100
    rate_limit_period: int = 60  # seconds
    
    # CORS Configuration
    cors_enabled: bool = True
    cors_origins: List[str] = ["*"]
    cors_credentials: bool = True
    cors_methods: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    cors_headers: List[str] = [
        "Accept", "Accept-Language", "Content-Language", 
        "Content-Type", "Authorization"
    ]
    
    # Security Headers
    security_headers_enabled: bool = True
    
    # Request Logging
    request_logging_enabled: bool = True
    log_request_body: bool = False
    
    # Token Validation
    token_validation_enabled: bool = True
    
    # API Versioning
    api_versioning_enabled: bool = True
    api_version: str = "v1"
    supported_versions: List[str] = ["v1"]
    
    # Authentication Middleware
    auth_middleware_enabled: bool = True
    auth_exempt_paths: List[str] = [
        "/docs", "/redoc", "/openapi.json", "/health",
        "/auth/login", "/auth/register", "/auth/password-reset"
    ]
    
    # Default Roles and Permissions
    default_user_role: str = "User"
    admin_role: str = "Administrator"
    
    # Email Configuration (for password reset)
    email_enabled: bool = False
    smtp_server: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_use_tls: bool = True
    
    # Database Configuration
    create_default_roles: bool = True
    create_default_admin: bool = True
    default_admin_email: str = "admin@digame.com"
    default_admin_username: str = "admin"
    default_admin_password: str = "admin123"  # Change in production!
    
    @field_validator('secret_key')
    @classmethod
    def validate_secret_key(cls, v):
        if v == "your-super-secret-key-change-in-production":
            import warnings
            warnings.warn(
                "Using default secret key! Change this in production!",
                UserWarning
            )
        if len(v) < 32:
            raise ValueError("Secret key must be at least 32 characters long")
        return v
    
    @field_validator('cors_origins')
    @classmethod
    def validate_cors_origins(cls, v):
        if "*" in v and len(v) > 1:
            raise ValueError("Cannot use '*' with other specific origins")
        return v
    
    @field_validator('access_token_expire_minutes')
    @classmethod
    def validate_access_token_expire(cls, v):
        if v < 1 or v > 1440:  # 1 minute to 24 hours
            raise ValueError("Access token expiry must be between 1 and 1440 minutes")
        return v
    
    @field_validator('refresh_token_expire_days')
    @classmethod
    def validate_refresh_token_expire(cls, v):
        if v < 1 or v > 30:  # 1 day to 30 days
            raise ValueError("Refresh token expiry must be between 1 and 30 days")
        return v
    
    class Config:
        env_prefix = "DIGAME_AUTH_"
        case_sensitive = False
        env_file = ".env"

# Create settings instance
auth_settings = AuthSettings()

# Permission definitions
class Permissions:
    """Standard permission definitions"""
    
    # User management
    VIEW_USERS = "view_users"
    CREATE_USERS = "create_users"
    UPDATE_USERS = "update_users"
    DELETE_USERS = "delete_users"
    MANAGE_USERS = "manage_users"
    
    # Role and permission management
    VIEW_ROLES = "view_roles"
    CREATE_ROLES = "create_roles"
    UPDATE_ROLES = "update_roles"
    DELETE_ROLES = "delete_roles"
    MANAGE_ROLES = "manage_roles"
    
    VIEW_PERMISSIONS = "view_permissions"
    ASSIGN_PERMISSIONS = "assign_permissions"
    MANAGE_PERMISSIONS = "manage_permissions"
    
    # System administration
    MANAGE_SYSTEM = "manage_system"
    VIEW_SYSTEM_LOGS = "view_system_logs"
    MANAGE_SETTINGS = "manage_settings"
    
    # Data access
    VIEW_OWN_DATA = "view_own_data"
    VIEW_ALL_DATA = "view_all_data"
    EXPORT_DATA = "export_data"
    
    # Behavioral analysis
    VIEW_BEHAVIORAL_MODELS = "view_behavioral_models"
    CREATE_BEHAVIORAL_MODELS = "create_behavioral_models"
    UPDATE_BEHAVIORAL_MODELS = "update_behavioral_models"
    DELETE_BEHAVIORAL_MODELS = "delete_behavioral_models"
    
    # Activity monitoring
    VIEW_ACTIVITIES = "view_activities"
    CREATE_ACTIVITIES = "create_activities"
    UPDATE_ACTIVITIES = "update_activities"
    DELETE_ACTIVITIES = "delete_activities"
    
    # Anomaly detection
    VIEW_ANOMALIES = "view_anomalies"
    CREATE_ANOMALIES = "create_anomalies"
    UPDATE_ANOMALIES = "update_anomalies"
    DELETE_ANOMALIES = "delete_anomalies"
    
    # Process notes
    VIEW_PROCESS_NOTES = "view_process_notes"
    CREATE_PROCESS_NOTES = "create_process_notes"
    UPDATE_PROCESS_NOTES = "update_process_notes"
    DELETE_PROCESS_NOTES = "delete_process_notes"
    
    @classmethod
    def get_all_permissions(cls) -> List[str]:
        """Get all defined permissions"""
        return [
            getattr(cls, attr) for attr in dir(cls)
            if not attr.startswith('_') and isinstance(getattr(cls, attr), str)
            and attr != 'get_all_permissions'
        ]

class Roles:
    """Standard role definitions"""
    
    SUPER_ADMIN = "Super Administrator"
    ADMINISTRATOR = "Administrator"
    MANAGER = "Manager"
    ANALYST = "Analyst"
    USER = "User"
    VIEWER = "Viewer"
    
    @classmethod
    def get_role_permissions(cls, role: str) -> List[str]:
        """Get permissions for a specific role"""
        role_permissions = {
            cls.SUPER_ADMIN: Permissions.get_all_permissions(),
            
            cls.ADMINISTRATOR: [
                Permissions.MANAGE_USERS,
                Permissions.MANAGE_ROLES,
                Permissions.VIEW_PERMISSIONS,
                Permissions.VIEW_SYSTEM_LOGS,
                Permissions.MANAGE_SETTINGS,
                Permissions.VIEW_ALL_DATA,
                Permissions.EXPORT_DATA,
                Permissions.VIEW_BEHAVIORAL_MODELS,
                Permissions.CREATE_BEHAVIORAL_MODELS,
                Permissions.UPDATE_BEHAVIORAL_MODELS,
                Permissions.DELETE_BEHAVIORAL_MODELS,
                Permissions.VIEW_ACTIVITIES,
                Permissions.VIEW_ANOMALIES,
                Permissions.VIEW_PROCESS_NOTES,
            ],
            
            cls.MANAGER: [
                Permissions.VIEW_USERS,
                Permissions.UPDATE_USERS,
                Permissions.VIEW_ROLES,
                Permissions.VIEW_ALL_DATA,
                Permissions.EXPORT_DATA,
                Permissions.VIEW_BEHAVIORAL_MODELS,
                Permissions.CREATE_BEHAVIORAL_MODELS,
                Permissions.UPDATE_BEHAVIORAL_MODELS,
                Permissions.VIEW_ACTIVITIES,
                Permissions.CREATE_ACTIVITIES,
                Permissions.UPDATE_ACTIVITIES,
                Permissions.VIEW_ANOMALIES,
                Permissions.CREATE_ANOMALIES,
                Permissions.VIEW_PROCESS_NOTES,
                Permissions.CREATE_PROCESS_NOTES,
                Permissions.UPDATE_PROCESS_NOTES,
            ],
            
            cls.ANALYST: [
                Permissions.VIEW_OWN_DATA,
                Permissions.VIEW_BEHAVIORAL_MODELS,
                Permissions.CREATE_BEHAVIORAL_MODELS,
                Permissions.VIEW_ACTIVITIES,
                Permissions.CREATE_ACTIVITIES,
                Permissions.VIEW_ANOMALIES,
                Permissions.CREATE_ANOMALIES,
                Permissions.VIEW_PROCESS_NOTES,
                Permissions.CREATE_PROCESS_NOTES,
            ],
            
            cls.USER: [
                Permissions.VIEW_OWN_DATA,
                Permissions.VIEW_ACTIVITIES,
                Permissions.CREATE_ACTIVITIES,
                Permissions.VIEW_PROCESS_NOTES,
                Permissions.CREATE_PROCESS_NOTES,
            ],
            
            cls.VIEWER: [
                Permissions.VIEW_OWN_DATA,
                Permissions.VIEW_ACTIVITIES,
                Permissions.VIEW_PROCESS_NOTES,
            ]
        }
        
        return role_permissions.get(role, [])
    
    @classmethod
    def get_all_roles(cls) -> List[str]:
        """Get all defined roles"""
        return [
            getattr(cls, attr) for attr in dir(cls)
            if not attr.startswith('_') and isinstance(getattr(cls, attr), str)
            and attr not in ['get_role_permissions', 'get_all_roles']
        ]

def get_middleware_config() -> dict:
    """Get middleware configuration from settings"""
    return {
        "enable_versioning": auth_settings.api_versioning_enabled,
        "api_version": auth_settings.api_version,
        "supported_versions": auth_settings.supported_versions,
        
        "enable_token_validation": auth_settings.token_validation_enabled,
        
        "enable_cors": auth_settings.cors_enabled,
        "cors_origins": auth_settings.cors_origins,
        "cors_credentials": auth_settings.cors_credentials,
        "cors_methods": auth_settings.cors_methods,
        "cors_headers": auth_settings.cors_headers,
        
        "enable_auth_middleware": auth_settings.auth_middleware_enabled,
        "auth_exempt_paths": auth_settings.auth_exempt_paths,
        
        "enable_rate_limiting": auth_settings.rate_limit_enabled,
        "rate_limit_calls": auth_settings.rate_limit_calls,
        "rate_limit_period": auth_settings.rate_limit_period,
        
        "enable_request_logging": auth_settings.request_logging_enabled,
        "log_request_body": auth_settings.log_request_body,
        
        "enable_security_headers": auth_settings.security_headers_enabled,
    }

def validate_password(password: str) -> tuple[bool, List[str]]:
    """
    Validate password against configured requirements
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []
    
    if len(password) < auth_settings.password_min_length:
        errors.append(f"Password must be at least {auth_settings.password_min_length} characters long")
    
    if auth_settings.password_require_uppercase and not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter")
    
    if auth_settings.password_require_lowercase and not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter")
    
    if auth_settings.password_require_numbers and not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one number")
    
    if auth_settings.password_require_special and not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        errors.append("Password must contain at least one special character")
    
    return len(errors) == 0, errors