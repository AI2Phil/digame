from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from digame.app.database import Base

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
