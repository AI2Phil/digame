from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
from cryptography.fernet import Fernet
import os
import base64

from app.models.admin_config import AdminAPIKeyConfig, APIKeyUsageLog, AdminSystemConfig
from app.schemas.admin_config_schemas import (
    AdminAPIKeyConfigCreate, AdminAPIKeyConfigUpdate,
    APIKeyUsageLogCreate, AdminSystemConfigCreate, AdminSystemConfigUpdate,
    ServiceName, ResponseStatus, ConfigType
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

class AdminAPIKeyConfigCRUD:
    """CRUD operations for admin API key configurations"""
    
    @staticmethod
    def create(db: Session, config: AdminAPIKeyConfigCreate, created_by: int) -> AdminAPIKeyConfig:
        """Create a new admin API key configuration"""
        # Encrypt the API key
        encrypted_api_key = encryption_service.encrypt(config.api_key)
        
        db_config = AdminAPIKeyConfig()
        setattr(db_config, 'service_name', config.service_name.value)  # type: ignore
        setattr(db_config, 'api_key', encrypted_api_key)  # type: ignore
        setattr(db_config, 'description', config.description)  # type: ignore
        setattr(db_config, 'is_active', config.is_active)  # type: ignore
        setattr(db_config, 'usage_limit_per_user', config.usage_limit_per_user)  # type: ignore
        setattr(db_config, 'allowed_endpoints', config.allowed_endpoints)  # type: ignore
        setattr(db_config, 'created_by', created_by)  # type: ignore
        
        db.add(db_config)
        db.commit()
        db.refresh(db_config)
        return db_config
    
    @staticmethod
    def get(db: Session, config_id: int) -> Optional[AdminAPIKeyConfig]:
        """Get admin API key configuration by ID"""
        return db.query(AdminAPIKeyConfig).filter(AdminAPIKeyConfig.id == config_id).first()
    
    @staticmethod
    def get_by_service(db: Session, service_name: ServiceName) -> Optional[AdminAPIKeyConfig]:
        """Get active admin API key configuration by service name"""
        return db.query(AdminAPIKeyConfig).filter(
            and_(
                AdminAPIKeyConfig.service_name == service_name.value,
                AdminAPIKeyConfig.is_active == True
            )
        ).first()
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[AdminAPIKeyConfig]:
        """Get all admin API key configurations"""
        return db.query(AdminAPIKeyConfig).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_active(db: Session) -> List[AdminAPIKeyConfig]:
        """Get all active admin API key configurations"""
        return db.query(AdminAPIKeyConfig).filter(AdminAPIKeyConfig.is_active == True).all()
    
    @staticmethod
    def update(db: Session, config_id: int, config_update: AdminAPIKeyConfigUpdate) -> Optional[AdminAPIKeyConfig]:
        """Update admin API key configuration"""
        db_config = db.query(AdminAPIKeyConfig).filter(AdminAPIKeyConfig.id == config_id).first()
        if not db_config:
            return None
        
        update_data = config_update.dict(exclude_unset=True)
        
        # Encrypt API key if provided
        if 'api_key' in update_data and update_data['api_key']:
            update_data['api_key'] = encryption_service.encrypt(update_data['api_key'])
        
        for field, value in update_data.items():
            setattr(db_config, field, value)
        
        db.commit()
        db.refresh(db_config)
        return db_config
    
    @staticmethod
    def delete(db: Session, config_id: int) -> bool:
        """Delete admin API key configuration"""
        db_config = db.query(AdminAPIKeyConfig).filter(AdminAPIKeyConfig.id == config_id).first()
        if not db_config:
            return False
        
        db.delete(db_config)
        db.commit()
        return True
    
    @staticmethod
    def get_decrypted_api_key(db: Session, service_name: ServiceName) -> Optional[str]:
        """Get decrypted API key for a service"""
        config = AdminAPIKeyConfigCRUD.get_by_service(db, service_name)
        if not config:
            return None
        
        try:
            api_key = getattr(config, 'api_key', '')
            return encryption_service.decrypt(api_key)
        except Exception as e:
            print(f"Failed to decrypt API key for {service_name}: {e}")
            return None
    
    @staticmethod
    def get_masked_api_key(config: AdminAPIKeyConfig) -> str:
        """Get masked API key for display"""
        try:
            api_key = getattr(config, 'api_key', '')
            decrypted_key = encryption_service.decrypt(api_key)
            return encryption_service.mask_api_key(decrypted_key)
        except Exception:
            return "***ENCRYPTED***"

class APIKeyUsageLogCRUD:
    """CRUD operations for API key usage logs"""
    
    @staticmethod
    def create(db: Session, usage_log: APIKeyUsageLogCreate) -> APIKeyUsageLog:
        """Create a new API key usage log entry"""
        db_log = APIKeyUsageLog()
        for key, value in usage_log.dict().items():
            setattr(db_log, key, value)  # type: ignore
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log
    
    @staticmethod
    def get_usage_stats(
        db: Session, 
        service_name: Optional[ServiceName] = None,
        user_id: Optional[int] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get usage statistics for API keys"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = db.query(APIKeyUsageLog).filter(APIKeyUsageLog.request_timestamp >= start_date)
        
        if service_name:
            query = query.filter(APIKeyUsageLog.service_name == service_name.value)
        
        if user_id:
            query = query.filter(APIKeyUsageLog.user_id == user_id)
        
        logs = query.all()
        
        total_requests = len(logs)
        successful_requests = len([log for log in logs if getattr(log, 'response_status', '') == ResponseStatus.SUCCESS.value])
        failed_requests = total_requests - successful_requests
        total_tokens = sum([getattr(log, 'tokens_used', 0) or 0 for log in logs])
        
        # Calculate cost estimate
        total_cost = sum([float(getattr(log, 'cost_estimate', '0') or "0") for log in logs])
        
        # Top users
        user_usage = {}
        for log in logs:
            user_id = getattr(log, 'user_id', None)
            if user_id:
                user_usage[user_id] = user_usage.get(user_id, 0) + 1
        top_users = [{"user_id": uid, "requests": count} for uid, count in
                    sorted(user_usage.items(), key=lambda x: x[1], reverse=True)[:10]]
        
        # Usage by endpoint
        endpoint_usage = {}
        for log in logs:
            endpoint = getattr(log, 'endpoint', 'unknown')
            endpoint_usage[endpoint] = endpoint_usage.get(endpoint, 0) + 1
        
        # Usage by day
        day_usage = {}
        for log in logs:
            timestamp = getattr(log, 'request_timestamp', datetime.utcnow())
            day_key = timestamp.strftime('%Y-%m-%d')
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
    
    @staticmethod
    def get_user_usage_count(db: Session, user_id: int, service_name: ServiceName, days: int = 30) -> int:
        """Get usage count for a specific user and service"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        return db.query(APIKeyUsageLog).filter(
            and_(
                APIKeyUsageLog.user_id == user_id,
                APIKeyUsageLog.service_name == service_name.value,
                APIKeyUsageLog.request_timestamp >= start_date,
                APIKeyUsageLog.response_status == ResponseStatus.SUCCESS.value
            )
        ).count()

class AdminSystemConfigCRUD:
    """CRUD operations for admin system configurations"""
    
    @staticmethod
    def create(db: Session, config: AdminSystemConfigCreate, created_by: int) -> AdminSystemConfig:
        """Create a new admin system configuration"""
        config_value = config.config_value
        
        # Encrypt sensitive values
        if config.is_sensitive:
            config_value = encryption_service.encrypt(config_value)
        
        db_config = AdminSystemConfig()
        setattr(db_config, 'config_key', config.config_key)  # type: ignore
        setattr(db_config, 'config_value', config_value)  # type: ignore
        setattr(db_config, 'config_type', config.config_type.value)  # type: ignore
        setattr(db_config, 'description', config.description)  # type: ignore
        setattr(db_config, 'is_sensitive', config.is_sensitive)  # type: ignore
        setattr(db_config, 'category', config.category.value)  # type: ignore
        setattr(db_config, 'created_by', created_by)  # type: ignore
        
        db.add(db_config)
        db.commit()
        db.refresh(db_config)
        return db_config
    
    @staticmethod
    def get(db: Session, config_id: int) -> Optional[AdminSystemConfig]:
        """Get admin system configuration by ID"""
        return db.query(AdminSystemConfig).filter(AdminSystemConfig.id == config_id).first()
    
    @staticmethod
    def get_by_key(db: Session, config_key: str) -> Optional[AdminSystemConfig]:
        """Get admin system configuration by key"""
        return db.query(AdminSystemConfig).filter(AdminSystemConfig.config_key == config_key).first()
    
    @staticmethod
    def get_by_category(db: Session, category: str) -> List[AdminSystemConfig]:
        """Get admin system configurations by category"""
        return db.query(AdminSystemConfig).filter(AdminSystemConfig.category == category).all()
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[AdminSystemConfig]:
        """Get all admin system configurations"""
        return db.query(AdminSystemConfig).offset(skip).limit(limit).all()
    
    @staticmethod
    def update(db: Session, config_id: int, config_update: AdminSystemConfigUpdate) -> Optional[AdminSystemConfig]:
        """Update admin system configuration"""
        db_config = db.query(AdminSystemConfig).filter(AdminSystemConfig.id == config_id).first()
        if not db_config:
            return None
        
        update_data = config_update.dict(exclude_unset=True)
        
        # Encrypt sensitive values
        if 'config_value' in update_data and getattr(db_config, 'is_sensitive', False):
            update_data['config_value'] = encryption_service.encrypt(update_data['config_value'])
        
        for field, value in update_data.items():
            setattr(db_config, field, value)
        
        db.commit()
        db.refresh(db_config)
        return db_config
    
    @staticmethod
    def delete(db: Session, config_id: int) -> bool:
        """Delete admin system configuration"""
        db_config = db.query(AdminSystemConfig).filter(AdminSystemConfig.id == config_id).first()
        if not db_config:
            return False
        
        db.delete(db_config)
        db.commit()
        return True
    
    @staticmethod
    def get_config_value(db: Session, config_key: str, default: Any = None) -> Any:
        """Get decrypted configuration value by key"""
        config = AdminSystemConfigCRUD.get_by_key(db, config_key)
        if not config:
            return default
        
        value = getattr(config, 'config_value', '')
        
        # Decrypt if sensitive
        if getattr(config, 'is_sensitive', False):
            try:
                value = encryption_service.decrypt(value)
            except Exception as e:
                print(f"Failed to decrypt config {config_key}: {e}")
                return default
        
        # Convert to appropriate type
        config_type = getattr(config, 'config_type', '')
        if config_type == ConfigType.INTEGER.value:
            try:
                return int(value)
            except ValueError:
                return default
        elif config_type == ConfigType.BOOLEAN.value:
            return str(value).lower() in ('true', '1', 'yes', 'on')
        elif config_type == ConfigType.JSON.value:
            try:
                return json.loads(str(value))
            except json.JSONDecodeError:
                return default
        
        return value
    
    @staticmethod
    def get_masked_value(config: AdminSystemConfig) -> Optional[str]:
        """Get masked value for sensitive configurations"""
        if not getattr(config, 'is_sensitive', False):
            return getattr(config, 'config_value', '')
        
        try:
            config_value = getattr(config, 'config_value', '')
            decrypted_value = encryption_service.decrypt(config_value)
            if len(decrypted_value) <= 8:
                return "*" * len(decrypted_value)
            return decrypted_value[:2] + "*" * (len(decrypted_value) - 4) + decrypted_value[-2:]
        except Exception:
            return "***ENCRYPTED***"

# Utility functions for fallback API key management
def get_fallback_api_key(db: Session, service_name: ServiceName, user_id: int, endpoint: str) -> Optional[str]:
    """Get fallback API key for a service if user is allowed to use it"""
    config = AdminAPIKeyConfigCRUD.get_by_service(db, service_name)
    if not config or not getattr(config, 'is_active', False):
        return None
    
    # Check usage limits
    usage_limit = getattr(config, 'usage_limit_per_user', None)
    if usage_limit:
        usage_count = APIKeyUsageLogCRUD.get_user_usage_count(db, user_id, service_name)
        if usage_count >= usage_limit:
            return None
    
    # Check allowed endpoints
    allowed_endpoints = getattr(config, 'allowed_endpoints', None)
    if allowed_endpoints and endpoint not in allowed_endpoints:
        return None
    
    return AdminAPIKeyConfigCRUD.get_decrypted_api_key(db, service_name)

def log_api_key_usage(
    db: Session, 
    config_id: int, 
    user_id: int, 
    service_name: ServiceName, 
    endpoint: str,
    tokens_used: Optional[int] = None,
    cost_estimate: Optional[str] = None,
    response_status: ResponseStatus = ResponseStatus.SUCCESS,
    error_message: Optional[str] = None
) -> APIKeyUsageLog:
    """Log API key usage"""
    usage_log = APIKeyUsageLogCreate(
        config_id=config_id,
        user_id=user_id,
        service_name=service_name,
        endpoint=endpoint,
        tokens_used=tokens_used,
        cost_estimate=cost_estimate,
        response_status=response_status,
        error_message=error_message
    )
    
    return APIKeyUsageLogCRUD.create(db, usage_log)