import json
import logging
from typing import Dict, Any, Optional, List
from enum import Enum
from dataclasses import dataclass
from sqlalchemy.orm import Session

from .ai_integration_service import AIIntegrationService
from ..crud import user_setting_crud

logger = logging.getLogger(__name__)

class AIProvider(str, Enum):
    """Supported AI providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    DEEPSEEK = "deepseek"
    GOOGLE = "google"
    COHERE = "cohere"
    MISTRAL = "mistral"

@dataclass
class ProviderConfig:
    """Configuration for AI providers"""
    name: str
    base_url: str
    auth_scheme: str
    key_format: str
    test_endpoint: str
    models: List[str]
    capabilities: List[str]
    
    def validate_key_format(self, api_key: str) -> bool:
        """Validate API key format for this provider"""
        if self.name == AIProvider.OPENAI:
            return api_key.startswith("sk-") and len(api_key) >= 40
        elif self.name == AIProvider.ANTHROPIC:
            return api_key.startswith("sk-ant-")
        elif self.name == AIProvider.DEEPSEEK:
            return len(api_key) >= 20  # Basic length check
        elif self.name == AIProvider.GOOGLE:
            return api_key.startswith("AIza") and len(api_key) >= 30
        elif self.name == AIProvider.COHERE:
            return len(api_key) >= 20  # Basic length check
        elif self.name == AIProvider.MISTRAL:
            return len(api_key) >= 20  # Basic length check
        return False

class AIProviderService:
    """Enhanced AI service with multi-provider support"""
    
    def __init__(self, db: Session):
        self.db = db
        self.ai_integration_service = AIIntegrationService(db)
        self.providers = self._initialize_providers()
    
    def _initialize_providers(self) -> Dict[str, ProviderConfig]:
        """Initialize provider configurations"""
        return {
            AIProvider.OPENAI: ProviderConfig(
                name=AIProvider.OPENAI,
                base_url="https://api.openai.com/v1",
                auth_scheme="Bearer",
                key_format="sk-*",
                test_endpoint="models",
                models=["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo"],
                capabilities=["chat", "completion", "embedding", "image_generation", "speech"]
            ),
            AIProvider.ANTHROPIC: ProviderConfig(
                name=AIProvider.ANTHROPIC,
                base_url="https://api.anthropic.com/v1",
                auth_scheme="x-api-key",
                key_format="sk-ant-*",
                test_endpoint="messages",
                models=["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
                capabilities=["chat", "completion", "analysis"]
            ),
            AIProvider.DEEPSEEK: ProviderConfig(
                name=AIProvider.DEEPSEEK,
                base_url="https://api.deepseek.com/v1",
                auth_scheme="Bearer",
                key_format="*",
                test_endpoint="models",
                models=["deepseek-chat", "deepseek-coder"],
                capabilities=["chat", "completion", "code_generation"]
            ),
            AIProvider.GOOGLE: ProviderConfig(
                name=AIProvider.GOOGLE,
                base_url="https://generativelanguage.googleapis.com/v1",
                auth_scheme="key",
                key_format="AIza*",
                test_endpoint="models",
                models=["gemini-pro", "gemini-pro-vision"],
                capabilities=["chat", "completion", "multimodal"]
            ),
            AIProvider.COHERE: ProviderConfig(
                name=AIProvider.COHERE,
                base_url="https://api.cohere.ai/v1",
                auth_scheme="Bearer",
                key_format="*",
                test_endpoint="models",
                models=["command", "command-light", "command-nightly"],
                capabilities=["chat", "completion", "embedding", "rerank"]
            ),
            AIProvider.MISTRAL: ProviderConfig(
                name=AIProvider.MISTRAL,
                base_url="https://api.mistral.ai/v1",
                auth_scheme="Bearer",
                key_format="*",
                test_endpoint="models",
                models=["mistral-tiny", "mistral-small", "mistral-medium"],
                capabilities=["chat", "completion", "multilingual"]
            )
        }
    
    async def get_user_api_key(self, user_id: int, provider: str) -> Optional[str]:
        """Get user's API key for specific provider"""
        user_settings = user_setting_crud.get_user_setting(self.db, user_id=user_id)
        if not user_settings or not getattr(user_settings, 'api_keys', None):
            return None
        
        try:
            api_keys_str = getattr(user_settings, 'api_keys', '{}')
            api_keys_dict = json.loads(api_keys_str)
            key_name = f"{provider}_api_key"
            return api_keys_dict.get(key_name)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse API keys JSON for user {user_id}")
            return None
    
    async def get_available_providers(self, user_id: int) -> List[Dict[str, Any]]:
        """Get list of providers with user's key status"""
        available_providers = []
        
        for provider_name, config in self.providers.items():
            api_key = await self.get_user_api_key(user_id, provider_name)
            
            available_providers.append({
                "name": provider_name,
                "display_name": provider_name.title(),
                "has_key": bool(api_key),
                "models": config.models,
                "capabilities": config.capabilities,
                "base_url": config.base_url
            })
        
        return available_providers
    
    async def validate_api_key(self, provider: str, api_key: str) -> Dict[str, Any]:
        """Validate API key for specific provider"""
        if provider not in self.providers:
            return {"valid": False, "error": f"Unsupported provider: {provider}"}
        
        config = self.providers[provider]
        
        # Format validation
        if not config.validate_key_format(api_key):
            return {"valid": False, "error": f"Invalid key format for {provider}"}
        
        # API validation
        try:
            if provider == AIProvider.OPENAI:
                response = await self.ai_integration_service.make_request(
                    api_key=api_key,
                    base_url=config.base_url,
                    endpoint="models",
                    method="GET"
                )
                return {"valid": True, "models": [model.get("id") for model in response.get("data", [])]}
            
            elif provider == AIProvider.ANTHROPIC:
                # Test with a minimal message
                test_payload = {
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 10,
                    "messages": [{"role": "user", "content": "Hi"}]
                }
                response = await self.ai_integration_service.make_request(
                    api_key=api_key,
                    base_url=config.base_url,
                    endpoint="messages",
                    method="POST",
                    payload=test_payload,
                    custom_headers={"anthropic-version": "2023-06-01"},
                    auth_scheme="x-api-key"
                )
                return {"valid": True, "response": "Key validated successfully"}
            
            elif provider == AIProvider.GOOGLE:
                # Google AI uses query parameter for API key
                response = await self.ai_integration_service.make_request(
                    api_key="",  # Empty for Google as it uses query param
                    base_url=config.base_url,
                    endpoint=f"models?key={api_key}",
                    method="GET",
                    auth_scheme=""  # No auth header needed
                )
                return {"valid": True, "models": [model.get("name") for model in response.get("models", [])]}
            
            else:
                # For other providers, try to list models
                response = await self.ai_integration_service.make_request(
                    api_key=api_key,
                    base_url=config.base_url,
                    endpoint="models",
                    method="GET"
                )
                return {"valid": True, "response": "Key validated successfully"}
                
        except Exception as e:
            logger.error(f"API key validation failed for {provider}: {str(e)}")
            return {"valid": False, "error": str(e)}
    
    async def make_ai_request(
        self,
        user_id: int,
        provider: str,
        endpoint: str,
        payload: Dict[str, Any],
        method: str = "POST"
    ) -> Dict[str, Any]:
        """Make AI request using user's preferred provider"""
        
        # Get user's API key for the provider
        api_key = await self.get_user_api_key(user_id, provider)
        if not api_key:
            raise ValueError(f"No API key found for provider {provider}")
        
        if provider not in self.providers:
            raise ValueError(f"Unsupported provider: {provider}")
        
        config = self.providers[provider]
        
        # Provider-specific request handling
        if provider == AIProvider.ANTHROPIC:
            # Anthropic requires specific headers
            custom_headers = {"anthropic-version": "2023-06-01"}
            auth_scheme = "x-api-key"
        elif provider == AIProvider.GOOGLE:
            # Google AI uses query parameter
            endpoint = f"{endpoint}?key={api_key}"
            api_key = ""  # Clear API key since it's in query param
            auth_scheme = ""
            custom_headers = {}
        else:
            custom_headers = {}
            auth_scheme = config.auth_scheme
        
        return await self.ai_integration_service.make_request(
            api_key=api_key,
            base_url=config.base_url,
            endpoint=endpoint,
            method=method,
            payload=payload,
            custom_headers=custom_headers,
            auth_scheme=auth_scheme
        )
    
    async def get_preferred_provider(
        self,
        user_id: int,
        capability: str = "chat",
        fallback_providers: Optional[List[str]] = None
    ) -> Optional[str]:
        """Get user's preferred provider for a capability with fallback"""
        
        # TODO: Implement user preferences storage
        # For now, use a simple priority order
        priority_order = [
            AIProvider.OPENAI,
            AIProvider.ANTHROPIC,
            AIProvider.DEEPSEEK,
            AIProvider.GOOGLE,
            AIProvider.COHERE,
            AIProvider.MISTRAL
        ]
        
        if fallback_providers:
            priority_order = fallback_providers + [p for p in priority_order if p not in fallback_providers]
        
        # Find first provider with available key and capability
        for provider in priority_order:
            if provider in self.providers:
                config = self.providers[provider]
                if capability in config.capabilities:
                    api_key = await self.get_user_api_key(user_id, provider)
                    if api_key:
                        return provider
        
        return None
    
    def get_provider_info(self, provider: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific provider"""
        if provider not in self.providers:
            return None
        
        config = self.providers[provider]
        return {
            "name": provider,
            "display_name": provider.title(),
            "base_url": config.base_url,
            "models": config.models,
            "capabilities": config.capabilities,
            "key_format": config.key_format
        }
    
    def list_all_providers(self) -> List[Dict[str, Any]]:
        """List all supported providers"""
        providers = []
        for provider in self.providers.keys():
            info = self.get_provider_info(provider)
            if info:
                providers.append(info)
        return providers