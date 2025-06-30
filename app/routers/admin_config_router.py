from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.auth.auth_dependencies import get_current_user

# Create a simple admin check function since require_admin import is not available
def require_admin(current_user: "User" = Depends(get_current_user)) -> "User":
    if getattr(current_user, 'role', None) != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
from app.models.user import User
from app.services.admin_config_service import get_admin_config_service, AdminConfigService
from app.schemas.admin_config_schemas import (
    AdminAPIKeyConfigCreate, AdminAPIKeyConfigUpdate, AdminAPIKeyConfigResponse,
    AdminAPIKeyConfigList, AdminSystemConfigCreate, AdminSystemConfigUpdate,
    AdminSystemConfigResponse, AdminSystemConfigList, FallbackAPIKeyRequest,
    FallbackAPIKeyResponse, APIKeyUsageStats, AdminDashboardSummary,
    ServiceName, ResponseStatus
)

router = APIRouter(prefix="/admin/config", tags=["admin-config"])

# API Key Configuration Endpoints
@router.post("/api-keys", response_model=AdminAPIKeyConfigResponse)
async def create_api_key_config(
    config: AdminAPIKeyConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new admin API key configuration (Admin only)"""
    try:
        admin_service = get_admin_config_service(db)
        db_config = admin_service.create_api_key_config(config, getattr(current_user, 'id', 0))
        return admin_service.get_api_key_config_response(db_config)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create API key configuration: {str(e)}"
        )

@router.get("/api-keys", response_model=AdminAPIKeyConfigList)
async def get_api_key_configs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all admin API key configurations (Admin only)"""
    admin_service = get_admin_config_service(db)
    configs = admin_service.get_all_api_key_configs(skip, limit)
    
    config_responses = [admin_service.get_api_key_config_response(config) for config in configs]
    active_count = len([config for config in configs if getattr(config, 'is_active', False)])
    
    return AdminAPIKeyConfigList(
        configs=config_responses,
        total=len(configs),
        active_count=active_count
    )

@router.get("/api-keys/{config_id}", response_model=AdminAPIKeyConfigResponse)
async def get_api_key_config(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get admin API key configuration by ID (Admin only)"""
    admin_service = get_admin_config_service(db)
    config = admin_service.get_api_key_config(config_id)
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key configuration not found"
        )
    
    return admin_service.get_api_key_config_response(config)

@router.put("/api-keys/{config_id}", response_model=AdminAPIKeyConfigResponse)
async def update_api_key_config(
    config_id: int,
    config_update: AdminAPIKeyConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update admin API key configuration (Admin only)"""
    admin_service = get_admin_config_service(db)
    updated_config = admin_service.update_api_key_config(config_id, config_update)
    
    if not updated_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key configuration not found"
        )
    
    return admin_service.get_api_key_config_response(updated_config)

@router.delete("/api-keys/{config_id}")
async def delete_api_key_config(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete admin API key configuration (Admin only)"""
    admin_service = get_admin_config_service(db)
    success = admin_service.delete_api_key_config(config_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key configuration not found"
        )
    
    return {"message": "API key configuration deleted successfully"}

# Fallback API Key Endpoints
@router.post("/fallback-api-key", response_model=FallbackAPIKeyResponse)
async def get_fallback_api_key(
    request: FallbackAPIKeyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get fallback API key for a service (Authenticated users)"""
    admin_service = get_admin_config_service(db)
    
    # Use current user's ID if not provided or if not admin
    user_id = request.user_id if getattr(current_user, 'role', None) == "admin" else getattr(current_user, 'id', 0)
    
    response = admin_service.get_fallback_api_key(
        request.service_name, 
        user_id if isinstance(user_id, int) else getattr(current_user, 'id', 0),
        request.endpoint
    )
    
    # Log the request
    if response.allowed and response.api_key:
        admin_service.log_api_key_usage(
            request.service_name,
            user_id,
            request.endpoint,
            response_status=ResponseStatus.SUCCESS
        )
    
    return response

@router.post("/log-usage")
async def log_api_key_usage(
    service_name: ServiceName,
    endpoint: str,
    tokens_used: Optional[int] = None,
    cost_estimate: Optional[str] = None,
    response_status: ResponseStatus = ResponseStatus.SUCCESS,
    error_message: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Log API key usage (Authenticated users)"""
    admin_service = get_admin_config_service(db)
    
    usage_log = admin_service.log_api_key_usage(
        service_name=service_name,
        user_id=getattr(current_user, 'id', 0),
        endpoint=endpoint,
        tokens_used=tokens_used,
        cost_estimate=cost_estimate,
        response_status=response_status,
        error_message=error_message
    )
    
    if not usage_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No configuration found for service {service_name.value}"
        )
    
    return {"message": "Usage logged successfully", "log_id": usage_log.id}

# Usage Statistics Endpoints
@router.get("/usage-stats", response_model=APIKeyUsageStats)
async def get_usage_stats(
    service_name: Optional[ServiceName] = None,
    user_id: Optional[int] = None,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get API key usage statistics (Admin only)"""
    admin_service = get_admin_config_service(db)
    stats = admin_service.get_usage_stats(service_name, user_id, days)
    
    return APIKeyUsageStats(**stats)

@router.get("/usage-stats/user/{user_id}")
async def get_user_usage_stats(
    user_id: int,
    service_name: Optional[ServiceName] = None,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get usage statistics for a specific user"""
    # Users can only see their own stats unless they're admin
    if getattr(current_user, 'role', None) != "admin" and getattr(current_user, 'id', 0) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view other users' statistics"
        )
    
    admin_service = get_admin_config_service(db)
    stats = admin_service.get_usage_stats(service_name, user_id, days)
    
    return APIKeyUsageStats(**stats)

# System Configuration Endpoints
@router.post("/system", response_model=AdminSystemConfigResponse)
async def create_system_config(
    config: AdminSystemConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new admin system configuration (Admin only)"""
    try:
        admin_service = get_admin_config_service(db)
        db_config = admin_service.create_system_config(config, getattr(current_user, 'id', 0))
        
        response = AdminSystemConfigResponse()  # type: ignore
        setattr(response, 'id', getattr(db_config, 'id', 0))  # type: ignore
        setattr(response, 'config_key', getattr(db_config, 'config_key', ''))  # type: ignore
        setattr(response, 'config_value', getattr(db_config, 'config_value', None) if not getattr(db_config, 'is_sensitive', False) else None)  # type: ignore
        setattr(response, 'config_value_masked', admin_service.get_masked_system_config_value(db_config) if getattr(db_config, 'is_sensitive', False) else None)  # type: ignore
        setattr(response, 'config_type', getattr(db_config, 'config_type', ''))  # type: ignore
        setattr(response, 'description', getattr(db_config, 'description', None))  # type: ignore
        setattr(response, 'is_sensitive', getattr(db_config, 'is_sensitive', False))  # type: ignore
        setattr(response, 'category', getattr(db_config, 'category', ''))  # type: ignore
        setattr(response, 'created_at', getattr(db_config, 'created_at', None))  # type: ignore
        setattr(response, 'updated_at', getattr(db_config, 'updated_at', None))  # type: ignore
        setattr(response, 'created_by', getattr(db_config, 'created_by', 0))  # type: ignore
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create system configuration: {str(e)}"
        )

@router.get("/system", response_model=AdminSystemConfigList)
async def get_system_configs(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all admin system configurations (Admin only)"""
    admin_service = get_admin_config_service(db)
    
    if category:
        from app.models.admin_config import AdminSystemConfig
        configs = admin_service.db.query(AdminSystemConfig).filter(
            AdminSystemConfig.category == category
        ).offset(skip).limit(limit).all()
    else:
        from app.models.admin_config import AdminSystemConfig
        configs = admin_service.db.query(AdminSystemConfig).offset(skip).limit(limit).all()
    
    config_responses = []
    categories = set()
    
    for config in configs:
        categories.add(config.category)
        response = AdminSystemConfigResponse()  # type: ignore
        setattr(response, 'id', getattr(config, 'id', 0))  # type: ignore
        setattr(response, 'config_key', getattr(config, 'config_key', ''))  # type: ignore
        setattr(response, 'config_value', getattr(config, 'config_value', None) if not getattr(config, 'is_sensitive', False) else None)  # type: ignore
        setattr(response, 'config_value_masked', admin_service.get_masked_system_config_value(config) if getattr(config, 'is_sensitive', False) else None)  # type: ignore
        setattr(response, 'config_type', getattr(config, 'config_type', ''))  # type: ignore
        setattr(response, 'description', getattr(config, 'description', None))  # type: ignore
        setattr(response, 'is_sensitive', getattr(config, 'is_sensitive', False))  # type: ignore
        setattr(response, 'category', getattr(config, 'category', ''))  # type: ignore
        setattr(response, 'created_at', getattr(config, 'created_at', None))  # type: ignore
        setattr(response, 'updated_at', getattr(config, 'updated_at', None))  # type: ignore
        setattr(response, 'created_by', getattr(config, 'created_by', 0))  # type: ignore
        config_responses.append(response)
    
    return AdminSystemConfigList(
        configs=config_responses,
        total=len(configs),
        categories=list(categories)
    )

@router.get("/system/{config_key}/value")
async def get_system_config_value(
    config_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get system configuration value by key (Admin only)"""
    admin_service = get_admin_config_service(db)
    value = admin_service.get_system_config_value(config_key)
    
    if value is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System configuration not found"
        )
    
    return {"config_key": config_key, "value": value}

# Dashboard Summary Endpoint
@router.get("/dashboard", response_model=AdminDashboardSummary)
async def get_admin_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get admin dashboard summary (Admin only)"""
    admin_service = get_admin_config_service(db)
    
    # Get API key configs
    api_configs = admin_service.get_all_api_key_configs()
    active_api_configs = [config for config in api_configs if getattr(config, 'is_active', False)]
    
    # Get system configs
    from app.models.admin_config import AdminSystemConfig
    system_configs = admin_service.db.query(AdminSystemConfig).all()
    
    # Get usage stats
    today_stats = admin_service.get_usage_stats(days=1)
    month_stats = admin_service.get_usage_stats(days=30)
    
    # Top services
    top_services = []
    # Get all enum values safely
    service_names = [ServiceName.OPENAI, ServiceName.ANTHROPIC] if hasattr(ServiceName, 'OPENAI') else []
    for service in service_names:
        service_stats = admin_service.get_usage_stats(service_name=service, days=30)
        if service_stats["total_requests"] > 0:
            top_services.append({
                "service": service.value,
                "requests": service_stats["total_requests"],
                "cost": service_stats["total_cost_estimate"]
            })
    
    top_services.sort(key=lambda x: x["requests"], reverse=True)
    
    return AdminDashboardSummary(
        total_api_configs=len(api_configs),
        active_api_configs=len(active_api_configs),
        total_system_configs=len(system_configs),
        total_api_usage_today=today_stats["total_requests"],
        total_api_usage_month=month_stats["total_requests"],
        top_services=top_services[:5],
        recent_errors=[],  # Could be implemented with error logging
        cost_summary={
            "today": today_stats["total_cost_estimate"],
            "month": month_stats["total_cost_estimate"]
        }
    )