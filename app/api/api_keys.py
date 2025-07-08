import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..crud import user_setting_crud
from ..services.ai_provider_service import AIProviderService
from ..auth.auth_dependencies import get_current_user
from ..schemas.api_keys import (
    APIKeyCreate,
    APIKeyUpdate,
    APIKeyResponse,
    APIKeyTestResponse,
    APIKeyUsageResponse,
    ProviderInfo
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/settings/api-keys", tags=["API Keys"])

@router.get("/providers", response_model=List[ProviderInfo])
async def list_providers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all supported AI providers with user's key status"""
    provider_service = AIProviderService(db)
    providers = await provider_service.get_available_providers(current_user.id)
    return providers

@router.get("/", response_model=List[APIKeyResponse])
async def list_user_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's API keys (masked for security)"""
    user_settings = user_setting_crud.get_user_setting(db, user_id=current_user.id)
    
    if not user_settings or not getattr(user_settings, 'api_keys', None):
        return []
    
    try:
        api_keys_str = getattr(user_settings, 'api_keys', '{}')
        api_keys_dict = json.loads(api_keys_str)
        
        provider_service = AIProviderService(db)
        api_keys = []
        
        for key_name, key_value in api_keys_dict.items():
            if key_name.endswith('_api_key'):
                provider = key_name.replace('_api_key', '')
                provider_info = provider_service.get_provider_info(provider)
                
                # Mask the API key for security
                masked_key = f"{key_value[:8]}...{key_value[-4:]}" if len(key_value) > 12 else "***"
                
                api_keys.append({
                    "provider": provider,
                    "provider_name": provider.title(),
                    "masked_key": masked_key,
                    "key_format": provider_info.get("key_format", "*") if provider_info else "*",
                    "status": "active",  # TODO: Implement actual status checking
                    "created_at": None,  # TODO: Add timestamp tracking
                    "last_used": None   # TODO: Add usage tracking
                })
        
        return api_keys
        
    except json.JSONDecodeError:
        logger.error(f"Failed to parse API keys JSON for user {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error parsing API key settings"
        )

@router.post("/", response_model=APIKeyResponse)
async def add_api_key(
    api_key_data: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add or update an API key for a provider"""
    provider_service = AIProviderService(db)
    
    # Validate provider
    if api_key_data.provider not in [p["name"] for p in provider_service.list_all_providers()]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider: {api_key_data.provider}"
        )
    
    # Validate API key format and functionality
    validation_result = await provider_service.validate_api_key(
        api_key_data.provider, 
        api_key_data.api_key
    )
    
    if not validation_result.get("valid"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid API key: {validation_result.get('error', 'Unknown error')}"
        )
    
    # Get or create user settings
    user_settings = user_setting_crud.get_user_setting(db, user_id=current_user.id)
    
    if user_settings:
        # Update existing settings
        try:
            api_keys_str = getattr(user_settings, 'api_keys', '{}')
            api_keys_dict = json.loads(api_keys_str)
        except json.JSONDecodeError:
            api_keys_dict = {}
    else:
        # Create new settings
        api_keys_dict = {}
    
    # Add/update the API key
    key_name = f"{api_key_data.provider}_api_key"
    api_keys_dict[key_name] = api_key_data.api_key
    
    # Save to database
    if user_settings:
        from ..schemas.user_setting_schemas import UserSettingUpdate
        update_data = UserSettingUpdate(api_keys=api_keys_dict)
        user_setting_crud.update_user_setting(db, current_user.id, update_data)
    else:
        from ..schemas.user_setting_schemas import UserSettingCreate
        create_data = UserSettingCreate(api_keys=api_keys_dict)
        user_setting_crud.create_user_setting(db, current_user.id, create_data)
    
    # Return response
    provider_info = provider_service.get_provider_info(api_key_data.provider)
    masked_key = f"{api_key_data.api_key[:8]}...{api_key_data.api_key[-4:]}" if len(api_key_data.api_key) > 12 else "***"
    
    return {
        "provider": api_key_data.provider,
        "provider_name": api_key_data.provider.title(),
        "masked_key": masked_key,
        "key_format": provider_info.get("key_format", "*") if provider_info else "*",
        "status": "active",
        "created_at": None,
        "last_used": None
    }

@router.put("/{provider}", response_model=APIKeyResponse)
async def update_api_key(
    provider: str,
    api_key_data: APIKeyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing API key for a provider"""
    provider_service = AIProviderService(db)
    
    # Validate provider
    if provider not in [p["name"] for p in provider_service.list_all_providers()]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider: {provider}"
        )
    
    # Get user settings
    user_settings = user_setting_crud.get_user_setting(db, user_id=current_user.id)
    if not user_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No API keys found for user"
        )
    
    try:
        api_keys_str = getattr(user_settings, 'api_keys', '{}')
        api_keys_dict = json.loads(api_keys_str)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error parsing API key settings"
        )
    
    key_name = f"{provider}_api_key"
    if key_name not in api_keys_dict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No API key found for provider: {provider}"
        )
    
    # Validate new API key if provided
    if api_key_data.api_key:
        validation_result = await provider_service.validate_api_key(provider, api_key_data.api_key)
        if not validation_result.get("valid"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid API key: {validation_result.get('error', 'Unknown error')}"
            )
        
        # Update the API key
        api_keys_dict[key_name] = api_key_data.api_key
        
        # Save to database
        from ..schemas.user_setting_schemas import UserSettingUpdate
        update_data = UserSettingUpdate(api_keys=api_keys_dict)
        user_setting_crud.update_user_setting(db, current_user.id, update_data)
    
    # Return response
    provider_info = provider_service.get_provider_info(provider)
    current_key = api_keys_dict[key_name]
    masked_key = f"{current_key[:8]}...{current_key[-4:]}" if len(current_key) > 12 else "***"
    
    return {
        "provider": provider,
        "provider_name": provider.title(),
        "masked_key": masked_key,
        "key_format": provider_info.get("key_format", "*") if provider_info else "*",
        "status": "active",
        "created_at": None,
        "last_used": None
    }

@router.delete("/{provider}")
async def delete_api_key(
    provider: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an API key for a provider"""
    # Get user settings
    user_settings = user_setting_crud.get_user_setting(db, user_id=current_user.id)
    if not user_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No API keys found for user"
        )
    
    try:
        api_keys_str = getattr(user_settings, 'api_keys', '{}')
        api_keys_dict = json.loads(api_keys_str)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error parsing API key settings"
        )
    
    key_name = f"{provider}_api_key"
    if key_name not in api_keys_dict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No API key found for provider: {provider}"
        )
    
    # Remove the API key
    del api_keys_dict[key_name]
    
    # Save to database
    from ..schemas.user_setting_schemas import UserSettingUpdate
    update_data = UserSettingUpdate(api_keys=api_keys_dict)
    user_setting_crud.update_user_setting(db, current_user.id, update_data)
    
    return {"message": f"API key for {provider} deleted successfully"}

@router.post("/{provider}/test", response_model=APIKeyTestResponse)
async def test_api_key(
    provider: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test an API key for a provider"""
    provider_service = AIProviderService(db)
    
    # Get user's API key
    api_key = await provider_service.get_user_api_key(current_user.id, provider)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No API key found for provider: {provider}"
        )
    
    # Test the API key
    validation_result = await provider_service.validate_api_key(provider, api_key)
    
    return {
        "provider": provider,
        "valid": validation_result.get("valid", False),
        "error": validation_result.get("error"),
        "details": validation_result.get("response") or validation_result.get("models"),
        "tested_at": None  # TODO: Add timestamp
    }

@router.get("/usage", response_model=List[APIKeyUsageResponse])
async def get_api_key_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = 30
):
    """Get usage statistics for user's API keys"""
    # TODO: Implement actual usage tracking
    # For now, return mock data
    provider_service = AIProviderService(db)
    providers = await provider_service.get_available_providers(current_user.id)
    
    usage_data = []
    for provider in providers:
        if provider["has_key"]:
            usage_data.append({
                "provider": provider["name"],
                "provider_name": provider["display_name"],
                "requests_count": 0,  # TODO: Implement actual tracking
                "tokens_used": 0,     # TODO: Implement actual tracking
                "cost_usd": 0.0,      # TODO: Implement actual tracking
                "period_days": days,
                "last_request": None  # TODO: Implement actual tracking
            })
    
    return usage_data