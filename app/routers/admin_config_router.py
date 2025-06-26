from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.auth.dependencies import get_current_user, require_admin
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
        db_config = admin_service.create_api_key_config(config, current_user.id)
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
    active_count = len([config for config in configs if config.is_active])
    
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
    user_id = request.user_id if current_user.role == "admin" else current_user.id
    
    response = admin_service.get_fallback_api_key(
        request.service_name, 
        user_id, 
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
        user_id=current_user.id,
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
    if current_user.role != "admin" and current_user.id != user_id:
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
        db_config = admin_service.create_system_config(config, current_user.id)
        
        return AdminSystemConfigResponse(
            id=db_config.id,
            config_key=db_config.config_key,
            config_value=db_config.config_value if not db_config.is_sensitive else None,
            config_value_masked=admin_service.get_masked_system_config_value(db_config) if db_config.is_sensitive else None,
            config_type=db_config.config_type,
            description=db_config.description,
            is_sensitive=db_config.is_sensitive,
            category=db_config.category,
            created_at=db_config.created_at,
            updated_at=db_config.updated_at,
            created_by=db_config.created_by
        )
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
        configs = admin_service.db.query(admin_service.db.models.AdminSystemConfig).filter(
            admin_service.db.models.AdminSystemConfig.category == category
        ).offset(skip).limit(limit).all()
    else:
        configs = admin_service.db.query(admin_service.db.models.AdminSystemConfig).offset(skip).limit(limit).all()
    
    config_responses = []
    categories = set()
    
    for config in configs:
        categories.add(config.category)
        config_responses.append(AdminSystemConfigResponse(
            id=config.id,
            config_key=config.config_key,
            config_value=config.config_value if not config.is_sensitive else None,
            config_value_masked=admin_service.get_masked_system_config_value(config) if config.is_sensitive else None,
            config_type=config.config_type,
            description=config.description,
            is_sensitive=config.is_sensitive,
            category=config.category,
            created_at=config.created_at,
            updated_at=config.updated_at,
            created_by=config.created_by
        ))
    
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
    active_api_configs = [config for config in api_configs if config.is_active]
    
    # Get system configs
    system_configs = admin_service.db.query(admin_service.db.models.AdminSystemConfig).all()
    
    # Get usage stats
    today_stats = admin_service.get_usage_stats(days=1)
    month_stats = admin_service.get_usage_stats(days=30)
    
    # Top services
    top_services = []
    for service in ServiceName:
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