from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
from cryptography.fernet import Fernet
import os

from app.models.admin_config import AdminAPIKeyConfig, APIKeyUsageLog, AdminSystemConfig
from app.schemas.admin_config_schemas import (
    AdminAPIKeyConfigCreate, AdminAPIKeyConfigUpdate, AdminAPIKeyConfigResponse,
    APIKeyUsageLogCreate, AdminSystemConfigCreate, AdminSystemConfigUpdate,
    ServiceName, ResponseStatus, ConfigType, FallbackAPIKeyResponse
)

class EncryptionService:
    """Service for encrypting/decrypting sensitive configuration data"""
    
    def __init__(self):
        # Get encryption key from environment or generate one
        key = os.getenv('ADMIN_CONFIG_ENCRYPTION_KEY')
        if not key:
            # Generate a new key (in production, this should be stored securely)
            key = Fernet.generate_key()
            print(f"Generated new encryption key: {key.decode()}")
            print("Please set ADMIN_CONFIG_ENCRYPTION_KEY environment variable")
        else:
            key = key.encode()
        
        self.cipher_suite = Fernet(key)
    
    def encrypt(self, data: str) -> str:
        """Encrypt sensitive data"""
        return self.cipher_suite.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        return self.cipher_suite.decrypt(encrypted_data.encode()).decode()
    
    def mask_api_key(self, api_key: str) -> str:
        """Mask API key for display purposes"""
        if len(api_key) <= 8:
            return "*" * len(api_key)
        return api_key[:4] + "*" * (len(api_key) - 8) + api_key[-4:]

# Initialize encryption service
encryption_service = EncryptionService()

class AdminConfigService:
    """Service for managing admin configurations and fallback API keys"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # API Key Configuration Methods
    def create_api_key_config(self, config: AdminAPIKeyConfigCreate, created_by: int) -> AdminAPIKeyConfig:
        """Create a new admin API key configuration"""
        # Encrypt the API key
        encrypted_api_key = encryption_service.encrypt(config.api_key)
        
        db_config = AdminAPIKeyConfig(
            service_name=config.service_name.value,
            api_key=encrypted_api_key,
            description=config.description,
            is_active=config.is_active,
            usage_limit_per_user=config.usage_limit_per_user,
            allowed_endpoints=config.allowed_endpoints,
            created_by=created_by
        )
        
        self.db.add(db_config)
        self.db.commit()
        self.db.refresh(db_config)
        return db_config
    
    def get_api_key_config(self, config_id: int) -> Optional[AdminAPIKeyConfig]:
        """Get admin API key configuration by ID"""
        return self.db.query(AdminAPIKeyConfig).filter(AdminAPIKeyConfig.id == config_id).first()
    
    def get_api_key_config_by_service(self, service_name: ServiceName) -> Optional[AdminAPIKeyConfig]:
        """Get active admin API key configuration by service name"""
        return self.db.query(AdminAPIKeyConfig).filter(
            and_(
                AdminAPIKeyConfig.service_name == service_name.value,
                AdminAPIKeyConfig.is_active == True
            )
        ).first()
    
    def get_all_api_key_configs(self, skip: int = 0, limit: int = 100) -> List[AdminAPIKeyConfig]:
        """Get all admin API key configurations"""
        return self.db.query(AdminAPIKeyConfig).offset(skip).limit(limit).all()
    
    def update_api_key_config(self, config_id: int, config_update: AdminAPIKeyConfigUpdate) -> Optional[AdminAPIKeyConfig]:
        """Update admin API key configuration"""
        db_config = self.db.query(AdminAPIKeyConfig).filter(AdminAPIKeyConfig.id == config_id).first()
        if not db_config:
            return None
        
        update_data = config_update.dict(exclude_unset=True)
        
        # Encrypt API key if provided
        if 'api_key' in update_data and update_data['api_key']:
            update_data['api_key'] = encryption_service.encrypt(update_data['api_key'])
        
        for field, value in update_data.items():
            setattr(db_config, field, value)
        
        self.db.commit()
        self.db.refresh(db_config)
        return db_config
    
    def delete_api_key_config(self, config_id: int) -> bool:
        """Delete admin API key configuration"""
        db_config = self.db.query(AdminAPIKeyConfig).filter(AdminAPIKeyConfig.id == config_id).first()
        if not db_config:
            return False
        
        self.db.delete(db_config)
        self.db.commit()
        return True
    
    def get_decrypted_api_key(self, service_name: ServiceName) -> Optional[str]:
        """Get decrypted API key for a service"""
        config = self.get_api_key_config_by_service(service_name)
        if not config:
            return None
        
        try:
            return encryption_service.decrypt(config.api_key)
        except Exception as e:
            print(f"Failed to decrypt API key for {service_name}: {e}")
            return None
    
    def get_masked_api_key(self, config: AdminAPIKeyConfig) -> str:
        """Get masked API key for display"""
        try:
            decrypted_key = encryption_service.decrypt(config.api_key)
            return encryption_service.mask_api_key(decrypted_key)
        except Exception:
            return "***ENCRYPTED***"
    
    def get_api_key_config_response(self, config: AdminAPIKeyConfig) -> AdminAPIKeyConfigResponse:
        """Convert AdminAPIKeyConfig to response schema with masked API key"""
        return AdminAPIKeyConfigResponse(
            id=config.id,
            service_name=ServiceName(config.service_name),
            api_key_masked=self.get_masked_api_key(config),
            description=config.description,
            is_active=config.is_active,
            usage_limit_per_user=config.usage_limit_per_user,
            allowed_endpoints=config.allowed_endpoints,
            created_at=config.created_at,
            updated_at=config.updated_at,
            created_by=config.created_by
        )
    
    # Fallback API Key Methods
    def get_fallback_api_key(self, service_name: ServiceName, user_id: int, endpoint: str) -> FallbackAPIKeyResponse:
        """Get fallback API key for a service if user is allowed to use it"""
        config = self.get_api_key_config_by_service(service_name)
        
        if not config or not config.is_active:
            return FallbackAPIKeyResponse(
                api_key=None,
                usage_limit_remaining=None,
                allowed=False,
                message=f"No active fallback API key configured for {service_name.value}"
            )
        
        # Check usage limits
        usage_count = 0
        usage_limit_remaining = None
        
        if config.usage_limit_per_user:
            usage_count = self.get_user_usage_count(user_id, service_name)
            usage_limit_remaining = max(0, config.usage_limit_per_user - usage_count)
            
            if usage_count >= config.usage_limit_per_user:
                return FallbackAPIKeyResponse(
                    api_key=None,
                    usage_limit_remaining=0,
                    allowed=False,
                    message=f"Monthly usage limit ({config.usage_limit_per_user}) exceeded for {service_name.value}"
                )
        
        # Check allowed endpoints
        if config.allowed_endpoints and endpoint not in config.allowed_endpoints:
            return FallbackAPIKeyResponse(
                api_key=None,
                usage_limit_remaining=usage_limit_remaining,
                allowed=False,
                message=f"Endpoint '{endpoint}' not allowed for {service_name.value}"
            )
        
        # Get decrypted API key
        api_key = self.get_decrypted_api_key(service_name)
        if not api_key:
            return FallbackAPIKeyResponse(
                api_key=None,
                usage_limit_remaining=usage_limit_remaining,
                allowed=False,
                message=f"Failed to decrypt API key for {service_name.value}"
            )
        
        return FallbackAPIKeyResponse(
            api_key=api_key,
            usage_limit_remaining=usage_limit_remaining,
            allowed=True,
            message=f"Fallback API key provided for {service_name.value}"
        )
    
    # Usage Logging Methods
    def log_api_key_usage(
        self, 
        service_name: ServiceName, 
        user_id: int, 
        endpoint: str,
        tokens_used: Optional[int] = None,
        cost_estimate: Optional[str] = None,
        response_status: ResponseStatus = ResponseStatus.SUCCESS,
        error_message: Optional[str] = None
    ) -> Optional[APIKeyUsageLog]:
        """Log API key usage"""
        config = self.get_api_key_config_by_service(service_name)
        if not config:
            return None
        
        db_log = APIKeyUsageLog(
            config_id=config.id,
            user_id=user_id,
            service_name=service_name.value,
            endpoint=endpoint,
            tokens_used=tokens_used,
            cost_estimate=cost_estimate,
            response_status=response_status.value,
            error_message=error_message
        )
        
        self.db.add(db_log)
        self.db.commit()
        self.db.refresh(db_log)
        return db_log
    
    def get_user_usage_count(self, user_id: int, service_name: ServiceName, days: int = 30) -> int:
        """Get usage count for a specific user and service"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        return self.db.query(APIKeyUsageLog).filter(
            and_(
                APIKeyUsageLog.user_id == user_id,
                APIKeyUsageLog.service_name == service_name.value,
                APIKeyUsageLog.request_timestamp >= start_date,
                APIKeyUsageLog.response_status == ResponseStatus.SUCCESS.value
            )
        ).count()
    
    def get_usage_stats(
        self, 
        service_name: Optional[ServiceName] = None,
        user_id: Optional[int] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get usage statistics for API keys"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = self.db.query(APIKeyUsageLog).filter(APIKeyUsageLog.request_timestamp >= start_date)
        
        if service_name:
            query = query.filter(APIKeyUsageLog.service_name == service_name.value)
        
        if user_id:
            query = query.filter(APIKeyUsageLog.user_id == user_id)
        
        logs = query.all()
        
        total_requests = len(logs)
        successful_requests = len([log for log in logs if log.response_status == ResponseStatus.SUCCESS.value])
        failed_requests = total_requests - successful_requests
        total_tokens = sum([log.tokens_used or 0 for log in logs])
        
        # Calculate cost estimate
        total_cost = sum([float(log.cost_estimate or "0") for log in logs])
        
        # Top users
        user_usage = {}
        for log in logs:
            user_usage[log.user_id] = user_usage.get(log.user_id, 0) + 1
        top_users = [{"user_id": uid, "requests": count} for uid, count in 
                    sorted(user_usage.items(), key=lambda x: x[1], reverse=True)[:10]]
        
        # Usage by endpoint
        endpoint_usage = {}
        for log in logs:
            endpoint_usage[log.endpoint] = endpoint_usage.get(log.endpoint, 0) + 1
        
        # Usage by day
        day_usage = {}
        for log in logs:
            day_key = log.request_timestamp.strftime('%Y-%m-%d')
            day_usage[day_key] = day_usage.get(day_key, 0) + 1
        
        return {
            "total_requests": total_requests,
            "successful_requests": successful_requests,
            "failed_requests": failed_requests,
            "total_tokens": total_tokens,
            "total_cost_estimate": f"${total_cost:.4f}",
            "top_users": top_users,
            "usage_by_endpoint": endpoint_usage,
            "usage_by_day": day_usage
        }
    
    # System Configuration Methods
    def create_system_config(self, config: AdminSystemConfigCreate, created_by: int) -> AdminSystemConfig:
        """Create a new admin system configuration"""
        config_value = config.config_value
        
        # Encrypt sensitive values
        if config.is_sensitive:
            config_value = encryption_service.encrypt(config_value)
        
        db_config = AdminSystemConfig(
            config_key=config.config_key,
            config_value=config_value,
            config_type=config.config_type.value,
            description=config.description,
            is_sensitive=config.is_sensitive,
            category=config.category.value,
            created_by=created_by
        )
        
        self.db.add(db_config)
        self.db.commit()
        self.db.refresh(db_config)
        return db_config
    
    def get_system_config(self, config_id: int) -> Optional[AdminSystemConfig]:
        """Get admin system configuration by ID"""
        return self.db.query(AdminSystemConfig).filter(AdminSystemConfig.id == config_id).first()
    
    def get_system_config_by_key(self, config_key: str) -> Optional[AdminSystemConfig]:
        """Get admin system configuration by key"""
        return self.db.query(AdminSystemConfig).filter(AdminSystemConfig.config_key == config_key).first()
    
    def get_system_config_value(self, config_key: str, default: Any = None) -> Any:
        """Get decrypted configuration value by key"""
        config = self.get_system_config_by_key(config_key)
        if not config:
            return default
        
        value = config.config_value
        
        # Decrypt if sensitive
        if config.is_sensitive:
            try:
                value = encryption_service.decrypt(value)
            except Exception as e:
                print(f"Failed to decrypt config {config_key}: {e}")
                return default
        
        # Convert to appropriate type
        if config.config_type == ConfigType.INTEGER.value:
            try:
                return int(value)
            except ValueError:
                return default
        elif config.config_type == ConfigType.BOOLEAN.value:
            return value.lower() in ('true', '1', 'yes', 'on')
        elif config.config_type == ConfigType.JSON.value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return default
        
        return value
    
    def update_system_config(self, config_id: int, config_update: AdminSystemConfigUpdate) -> Optional[AdminSystemConfig]:
        """Update admin system configuration"""
        db_config = self.db.query(AdminSystemConfig).filter(AdminSystemConfig.id == config_id).first()
        if not db_config:
            return None
        
        update_data = config_update.dict(exclude_unset=True)
        
        # Encrypt sensitive values
        if 'config_value' in update_data and db_config.is_sensitive:
            update_data['config_value'] = encryption_service.encrypt(update_data['config_value'])
        
        for field, value in update_data.items():
            setattr(db_config, field, value)
        
        self.db.commit()
        self.db.refresh(db_config)
        return db_config
    
    def delete_system_config(self, config_id: int) -> bool:
        """Delete admin system configuration"""
        db_config = self.db.query(AdminSystemConfig).filter(AdminSystemConfig.id == config_id).first()
        if not db_config:
            return False
        
        self.db.delete(db_config)
        self.db.commit()
        return True
    
    def get_masked_system_config_value(self, config: AdminSystemConfig) -> Optional[str]:
        """Get masked value for sensitive configurations"""
        if not config.is_sensitive:
            return config.config_value
        
        try:
            decrypted_value = encryption_service.decrypt(config.config_value)
            if len(decrypted_value) <= 8:
                return "*" * len(decrypted_value)
            return decrypted_value[:2] + "*" * (len(decrypted_value) - 4) + decrypted_value[-2:]
        except Exception:
            return "***ENCRYPTED***"

# Utility function to get service instance
def get_admin_config_service(db: Session) -> AdminConfigService:
    """Get AdminConfigService instance"""
    return AdminConfigService(db)