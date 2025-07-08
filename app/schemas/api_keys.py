from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class APIKeyCreate(BaseModel):
    """Schema for creating an API key"""
    provider: str = Field(..., description="AI provider name (openai, anthropic, etc.)")
    api_key: str = Field(..., description="The API key value")
    name: Optional[str] = Field(None, description="Optional name for the API key")

class APIKeyUpdate(BaseModel):
    """Schema for updating an API key"""
    api_key: Optional[str] = Field(None, description="New API key value")
    name: Optional[str] = Field(None, description="Updated name for the API key")

class APIKeyResponse(BaseModel):
    """Schema for API key response (with masked key)"""
    provider: str
    provider_name: str
    masked_key: str
    key_format: str
    status: str
    created_at: Optional[datetime] = None
    last_used: Optional[datetime] = None

class APIKeyTestResponse(BaseModel):
    """Schema for API key test response"""
    provider: str
    valid: bool
    error: Optional[str] = None
    details: Optional[Any] = None
    tested_at: Optional[datetime] = None

class APIKeyUsageResponse(BaseModel):
    """Schema for API key usage statistics"""
    provider: str
    provider_name: str
    requests_count: int
    tokens_used: int
    cost_usd: float
    period_days: int
    last_request: Optional[datetime] = None

class ProviderInfo(BaseModel):
    """Schema for AI provider information"""
    name: str
    display_name: str
    has_key: bool
    models: List[str]
    capabilities: List[str]
    base_url: str