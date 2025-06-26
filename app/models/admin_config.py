from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base

class AdminAPIKeyConfig(Base):
    """
    Admin configuration for default/fallback API keys for AI services.
    These keys are used when users haven't configured their own API keys.
    """
    __tablename__ = "admin_api_key_configs"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(100), unique=True, nullable=False, index=True)  # e.g., 'openai', 'anthropic', 'google'
    api_key = Column(Text, nullable=False)  # Encrypted API key
    description = Column(Text, nullable=True)  # Description of the service
    is_active = Column(Boolean, default=True, nullable=False)  # Whether this config is active
    usage_limit_per_user = Column(Integer, nullable=True)  # Optional usage limit per user per month
    allowed_endpoints = Column(JSON, nullable=True)  # List of allowed endpoints/features
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, nullable=False)  # Admin user ID who created this config
    
    def __repr__(self):
        return f"<AdminAPIKeyConfig(service_name='{self.service_name}', is_active={self.is_active})>"

class APIKeyUsageLog(Base):
    """
    Log of API key usage for monitoring and billing purposes.
    """
    __tablename__ = "api_key_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    config_id = Column(Integer, nullable=False, index=True)  # Reference to AdminAPIKeyConfig
    user_id = Column(Integer, nullable=False, index=True)  # User who used the API key
    service_name = Column(String(100), nullable=False, index=True)
    endpoint = Column(String(200), nullable=False)  # Which endpoint was called
    tokens_used = Column(Integer, nullable=True)  # Number of tokens consumed
    cost_estimate = Column(String(20), nullable=True)  # Estimated cost in USD
    request_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    response_status = Column(String(20), nullable=False)  # 'success', 'error', 'rate_limited'
    error_message = Column(Text, nullable=True)  # Error details if any
    
    def __repr__(self):
        return f"<APIKeyUsageLog(service_name='{self.service_name}', user_id={self.user_id}, status='{self.response_status}')>"

class AdminSystemConfig(Base):
    """
    General admin system configuration settings.
    """
    __tablename__ = "admin_system_configs"

    id = Column(Integer, primary_key=True, index=True)
    config_key = Column(String(100), unique=True, nullable=False, index=True)
    config_value = Column(Text, nullable=False)
    config_type = Column(String(50), nullable=False)  # 'string', 'integer', 'boolean', 'json'
    description = Column(Text, nullable=True)
    is_sensitive = Column(Boolean, default=False, nullable=False)  # Whether to encrypt this value
    category = Column(String(50), nullable=False, index=True)  # 'ai_services', 'security', 'features', etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, nullable=False)
    
    def __repr__(self):
        return f"<AdminSystemConfig(config_key='{self.config_key}', category='{self.category}')>"