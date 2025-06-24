from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ServiceName(str, Enum):
    """Supported AI service providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    AZURE_OPENAI = "azure_openai"
    HUGGINGFACE = "huggingface"
    COHERE = "cohere"

class ResponseStatus(str, Enum):
    """API response status types"""
    SUCCESS = "success"
    ERROR = "error"
    RATE_LIMITED = "rate_limited"
    UNAUTHORIZED = "unauthorized"

class ConfigType(str, Enum):
    """Configuration value types"""
    STRING = "string"
    INTEGER = "integer"
    BOOLEAN = "boolean"
    JSON = "json"
    ENCRYPTED = "encrypted"

class ConfigCategory(str, Enum):
    """Configuration categories"""
    AI_SERVICES = "ai_services"
    SECURITY = "security"
    FEATURES = "features"
    BILLING = "billing"
    NOTIFICATIONS = "notifications"
    PERFORMANCE = "performance"

# Admin API Key Configuration Schemas
class AdminAPIKeyConfigBase(BaseModel):
    service_name: ServiceName
    description: Optional[str] = None
    is_active: bool = True
    usage_limit_per_user: Optional[int] = Field(None, description="Monthly usage limit per user")
    allowed_endpoints: Optional[List[str]] = Field(None, description="List of allowed API endpoints")

class AdminAPIKeyConfigCreate(AdminAPIKeyConfigBase):
    api_key: str = Field(..., min_length=10, description="The API key (will be encrypted)")
    
    @validator('api_key')
    def validate_api_key(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('API key must be at least 10 characters long')
        return v.strip()

class AdminAPIKeyConfigUpdate(BaseModel):
    api_key: Optional[str] = Field(None, min_length=10)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    usage_limit_per_user: Optional[int] = None
    allowed_endpoints: Optional[List[str]] = None
    
    @validator('api_key')
    def validate_api_key(cls, v):
        if v is not None and len(v.strip()) < 10:
            raise ValueError('API key must be at least 10 characters long')
        return v.strip() if v else v

class AdminAPIKeyConfigResponse(AdminAPIKeyConfigBase):
    id: int
    api_key_masked: str = Field(..., description="Masked API key for display")
    created_at: datetime
    updated_at: datetime
    created_by: int
    
    class Config:
        from_attributes = True

class AdminAPIKeyConfigList(BaseModel):
    configs: List[AdminAPIKeyConfigResponse]
    total: int
    active_count: int

# API Key Usage Log Schemas
class APIKeyUsageLogBase(BaseModel):
    endpoint: str
    tokens_used: Optional[int] = None
    cost_estimate: Optional[str] = None
    response_status: ResponseStatus
    error_message: Optional[str] = None

class APIKeyUsageLogCreate(APIKeyUsageLogBase):
    config_id: int
    user_id: int
    service_name: ServiceName

class APIKeyUsageLogResponse(APIKeyUsageLogBase):
    id: int
    config_id: int
    user_id: int
    service_name: ServiceName
    request_timestamp: datetime
    
    class Config:
        from_attributes = True

class APIKeyUsageStats(BaseModel):
    """Usage statistics for API keys"""
    total_requests: int
    successful_requests: int
    failed_requests: int
    total_tokens: int
    total_cost_estimate: str
    top_users: List[Dict[str, Any]]
    usage_by_endpoint: Dict[str, int]
    usage_by_day: Dict[str, int]

# Admin System Configuration Schemas
class AdminSystemConfigBase(BaseModel):
    config_key: str = Field(..., min_length=1, max_length=100)
    config_value: str
    config_type: ConfigType
    description: Optional[str] = None
    is_sensitive: bool = False
    category: ConfigCategory

class AdminSystemConfigCreate(AdminSystemConfigBase):
    @validator('config_key')
    def validate_config_key(cls, v):
        # Ensure config key follows naming convention
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Config key must contain only alphanumeric characters, underscores, and hyphens')
        return v.lower()

class AdminSystemConfigUpdate(BaseModel):
    config_value: Optional[str] = None
    config_type: Optional[ConfigType] = None
    description: Optional[str] = None
    is_sensitive: Optional[bool] = None
    category: Optional[ConfigCategory] = None

class AdminSystemConfigResponse(AdminSystemConfigBase):
    id: int
    config_value_masked: Optional[str] = Field(None, description="Masked value for sensitive configs")
    created_at: datetime
    updated_at: datetime
    created_by: int
    
    class Config:
        from_attributes = True

class AdminSystemConfigList(BaseModel):
    configs: List[AdminSystemConfigResponse]
    total: int
    categories: List[str]

# Fallback API Key Request/Response
class FallbackAPIKeyRequest(BaseModel):
    service_name: ServiceName
    user_id: int
    endpoint: str
    
class FallbackAPIKeyResponse(BaseModel):
    api_key: Optional[str] = Field(None, description="The fallback API key if available")
    usage_limit_remaining: Optional[int] = Field(None, description="Remaining usage for this user")
    allowed: bool = Field(..., description="Whether the user is allowed to use this service")
    message: Optional[str] = Field(None, description="Additional information or restrictions")

# Admin Dashboard Summary
class AdminDashboardSummary(BaseModel):
    """Summary statistics for admin dashboard"""
    total_api_configs: int
    active_api_configs: int
    total_system_configs: int
    total_api_usage_today: int
    total_api_usage_month: int
    top_services: List[Dict[str, Any]]
    recent_errors: List[Dict[str, Any]]
    cost_summary: Dict[str, str]

# Bulk Operations
class BulkAPIKeyConfigUpdate(BaseModel):
    config_ids: List[int]
    updates: AdminAPIKeyConfigUpdate

class BulkOperationResult(BaseModel):
    success_count: int
    error_count: int
    errors: List[Dict[str, str]]

# Export/Import Schemas
class AdminConfigExport(BaseModel):
    """Schema for exporting admin configurations"""
    api_key_configs: List[AdminAPIKeyConfigResponse]
    system_configs: List[AdminSystemConfigResponse]
    export_timestamp: datetime
    export_version: str = "1.0"

class AdminConfigImport(BaseModel):
    """Schema for importing admin configurations"""
    api_key_configs: Optional[List[AdminAPIKeyConfigCreate]] = None
    system_configs: Optional[List[AdminSystemConfigCreate]] = None
    overwrite_existing: bool = False