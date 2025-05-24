"""
Integration API router for third-party productivity tools and services
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

from ..database import get_db
from ..services.integration_service import IntegrationService, IntegrationProviderService
from ..models.integration import (
    IntegrationProvider, IntegrationConnection, IntegrationSyncLog,
    IntegrationWebhook, IntegrationDataMapping, IntegrationAnalytics
)

router = APIRouter(prefix="/api/v1/integrations", tags=["integrations"])


# Pydantic models for request/response
class IntegrationProviderResponse(BaseModel):
    id: int
    name: str
    display_name: str
    description: str = None
    category: str
    auth_type: str
    supported_operations: List[str]
    logo_url: str = None
    is_active: bool
    
    class Config:
        from_attributes = True


class IntegrationConnectionCreate(BaseModel):
    provider_id: int
    connection_name: str
    external_account_id: str = None
    external_account_name: str = None
    auth_data: Dict[str, Any] = {}
    sync_settings: Dict[str, Any] = {}
    field_mappings: Dict[str, Any] = {}
    filters: Dict[str, Any] = {}


class IntegrationConnectionResponse(BaseModel):
    id: int
    provider_id: int
    connection_name: str
    external_account_name: str = None
    status: str
    last_sync_at: datetime = None
    total_syncs: int
    successful_syncs: int
    error_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class IntegrationSyncRequest(BaseModel):
    sync_type: str = "manual"
    operation: str = "full_sync"


class IntegrationSyncResponse(BaseModel):
    id: int
    sync_type: str
    direction: str
    operation: str
    status: str
    records_processed: int
    records_created: int
    records_updated: int
    records_failed: int
    duration_seconds: float = None
    started_at: datetime
    completed_at: datetime = None
    
    class Config:
        from_attributes = True


class IntegrationWebhookCreate(BaseModel):
    webhook_url: str
    webhook_secret: str = None
    events: List[str] = []
    timeout_seconds: int = 30


class IntegrationWebhookResponse(BaseModel):
    id: int
    webhook_url: str
    events: List[str]
    is_active: bool
    total_triggers: int
    successful_triggers: int
    failed_triggers: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class IntegrationDataMappingCreate(BaseModel):
    resource_type: str
    external_field: str
    internal_field: str
    transformation_type: str = "direct"
    transformation_config: Dict[str, Any] = {}
    validation_rules: Dict[str, Any] = {}
    is_required: bool = False
    default_value: str = None
    description: str = None


class IntegrationDataMappingResponse(BaseModel):
    id: int
    resource_type: str
    external_field: str
    internal_field: str
    transformation_type: str
    is_required: bool
    is_active: bool
    
    class Config:
        from_attributes = True


class IntegrationAnalyticsResponse(BaseModel):
    date: datetime
    period_type: str
    api_calls_made: int
    data_transferred_bytes: int
    sync_operations: int
    webhook_triggers: int
    success_rate: float
    error_rate: float
    records_synchronized: int
    unique_users_active: int
    cost_savings_estimated: float
    productivity_gain_hours: float
    
    class Config:
        from_attributes = True


# Provider endpoints
@router.get("/providers", response_model=List[IntegrationProviderResponse])
async def get_integration_providers(
    category: Optional[str] = None,
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    """
    Get available integration providers
    """
    integration_service = IntegrationService(db)
    providers = integration_service.get_providers(category=category, is_active=is_active)
    return providers


@router.post("/providers/initialize")
async def initialize_default_providers(db: Session = Depends(get_db)):
    """
    Initialize default integration providers
    """
    provider_service = IntegrationProviderService(db)
    provider_service.initialize_default_providers()
    return {"message": "Default providers initialized successfully"}


# Connection endpoints
@router.post("/connections/{tenant_id}", response_model=IntegrationConnectionResponse)
async def create_integration_connection(
    tenant_id: int,
    user_id: int,
    connection_data: IntegrationConnectionCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new integration connection
    """
    integration_service = IntegrationService(db)
    
    try:
        connection = integration_service.create_connection(
            tenant_id=tenant_id,
            user_id=user_id,
            provider_id=connection_data.provider_id,
            connection_data=connection_data.dict()
        )
        return connection
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create integration connection: {str(e)}"
        )


@router.get("/connections/{tenant_id}", response_model=List[IntegrationConnectionResponse])
async def get_integration_connections(
    tenant_id: int,
    user_id: Optional[int] = None,
    provider_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get integration connections for a tenant
    """
    integration_service = IntegrationService(db)
    connections = integration_service.get_connections(
        tenant_id=tenant_id,
        user_id=user_id,
        provider_id=provider_id,
        status=status_filter
    )
    return connections


@router.put("/connections/{connection_id}/status")
async def update_connection_status(
    connection_id: int,
    status: str,
    error_message: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Update connection status
    """
    integration_service = IntegrationService(db)
    success = integration_service.update_connection_status(
        connection_id=connection_id,
        status=status,
        error_message=error_message
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    return {"message": "Connection status updated successfully"}


# Synchronization endpoints
@router.post("/connections/{connection_id}/sync", response_model=IntegrationSyncResponse)
async def sync_integration_connection(
    connection_id: int,
    sync_request: IntegrationSyncRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Perform data synchronization for a connection
    """
    integration_service = IntegrationService(db)
    
    try:
        sync_log = integration_service.sync_connection(
            connection_id=connection_id,
            sync_type=sync_request.sync_type,
            operation=sync_request.operation
        )
        return sync_log
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to sync connection: {str(e)}"
        )


@router.get("/connections/{connection_id}/sync-logs", response_model=List[IntegrationSyncResponse])
async def get_sync_logs(
    connection_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get synchronization logs for a connection
    """
    sync_logs = db.query(IntegrationSyncLog).filter(
        IntegrationSyncLog.connection_id == connection_id
    ).order_by(IntegrationSyncLog.started_at.desc()).offset(skip).limit(limit).all()
    
    return sync_logs


# Webhook endpoints
@router.post("/connections/{connection_id}/webhooks", response_model=IntegrationWebhookResponse)
async def create_webhook(
    connection_id: int,
    webhook_data: IntegrationWebhookCreate,
    db: Session = Depends(get_db)
):
    """
    Create a webhook for real-time updates
    """
    integration_service = IntegrationService(db)
    
    try:
        webhook = integration_service.create_webhook(
            connection_id=connection_id,
            webhook_data=webhook_data.dict()
        )
        return webhook
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create webhook: {str(e)}"
        )


@router.get("/connections/{connection_id}/webhooks", response_model=List[IntegrationWebhookResponse])
async def get_webhooks(
    connection_id: int,
    db: Session = Depends(get_db)
):
    """
    Get webhooks for a connection
    """
    webhooks = db.query(IntegrationWebhook).filter(
        IntegrationWebhook.connection_id == connection_id
    ).all()
    
    return webhooks


@router.post("/webhooks/{webhook_id}/process")
async def process_webhook(
    webhook_id: int,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Process incoming webhook data
    """
    integration_service = IntegrationService(db)
    
    # In a real implementation, you'd extract headers from the request
    headers = {}
    
    success = integration_service.process_webhook(
        webhook_id=webhook_id,
        payload=payload,
        headers=headers
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to process webhook"
        )
    
    return {"message": "Webhook processed successfully"}


# Data mapping endpoints
@router.post("/connections/{connection_id}/mappings", response_model=IntegrationDataMappingResponse)
async def create_data_mapping(
    connection_id: int,
    mapping_data: IntegrationDataMappingCreate,
    db: Session = Depends(get_db)
):
    """
    Create field mapping between external and internal data
    """
    integration_service = IntegrationService(db)
    
    try:
        mapping = integration_service.create_data_mapping(
            connection_id=connection_id,
            mapping_data=mapping_data.dict()
        )
        return mapping
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create data mapping: {str(e)}"
        )


@router.get("/connections/{connection_id}/mappings", response_model=List[IntegrationDataMappingResponse])
async def get_data_mappings(
    connection_id: int,
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get data mappings for a connection
    """
    query = db.query(IntegrationDataMapping).filter(
        IntegrationDataMapping.connection_id == connection_id
    )
    
    if resource_type:
        query = query.filter(IntegrationDataMapping.resource_type == resource_type)
    
    mappings = query.all()
    return mappings


# Analytics endpoints
@router.get("/analytics/{tenant_id}", response_model=List[IntegrationAnalyticsResponse])
async def get_integration_analytics(
    tenant_id: int,
    connection_id: Optional[int] = None,
    period_type: str = "daily",
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """
    Get integration analytics and metrics
    """
    integration_service = IntegrationService(db)
    analytics = integration_service.get_analytics(
        tenant_id=tenant_id,
        connection_id=connection_id,
        period_type=period_type,
        start_date=start_date,
        end_date=end_date
    )
    return analytics


@router.post("/analytics/{tenant_id}/generate", response_model=IntegrationAnalyticsResponse)
async def generate_analytics(
    tenant_id: int,
    date: datetime,
    period_type: str = "daily",
    db: Session = Depends(get_db)
):
    """
    Generate analytics for a specific period
    """
    integration_service = IntegrationService(db)
    
    try:
        analytics = integration_service.generate_analytics(
            tenant_id=tenant_id,
            date=date,
            period_type=period_type
        )
        return analytics
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate analytics: {str(e)}"
        )


# Utility endpoints
@router.get("/categories")
async def get_integration_categories():
    """
    Get available integration categories
    """
    categories = [
        {
            "name": "communication",
            "display_name": "Communication",
            "description": "Team communication and messaging platforms",
            "icon": "💬"
        },
        {
            "name": "project_management",
            "display_name": "Project Management",
            "description": "Project planning and task management tools",
            "icon": "📋"
        },
        {
            "name": "development",
            "display_name": "Development",
            "description": "Code repositories and development tools",
            "icon": "💻"
        },
        {
            "name": "productivity",
            "display_name": "Productivity",
            "description": "Office suites and productivity applications",
            "icon": "📊"
        },
        {
            "name": "storage",
            "display_name": "Cloud Storage",
            "description": "File storage and sharing services",
            "icon": "☁️"
        },
        {
            "name": "crm",
            "display_name": "Customer Relationship Management",
            "description": "Customer and sales management platforms",
            "icon": "👥"
        },
        {
            "name": "analytics",
            "display_name": "Analytics",
            "description": "Data analytics and business intelligence tools",
            "icon": "📈"
        },
        {
            "name": "marketing",
            "display_name": "Marketing",
            "description": "Marketing automation and campaign management",
            "icon": "📢"
        }
    ]
    return categories


@router.get("/health")
async def integration_health_check():
    """
    Health check for integration system
    """
    return {
        "status": "healthy",
        "service": "integration_apis",
        "timestamp": datetime.utcnow(),
        "features": [
            "third_party_connections",
            "data_synchronization",
            "webhook_processing",
            "field_mapping",
            "integration_analytics",
            "provider_management",
            "real_time_updates",
            "oauth_authentication"
        ],
        "supported_providers": [
            "slack",
            "trello",
            "github",
            "google_workspace",
            "microsoft_teams"
        ]
    }


# OAuth callback endpoint (placeholder)
@router.get("/oauth/callback/{provider_name}")
async def oauth_callback(
    provider_name: str,
    code: str,
    state: str = None,
    db: Session = Depends(get_db)
):
    """
    Handle OAuth callback from third-party providers
    """
    # This would implement actual OAuth flow completion
    # For now, return a placeholder response
    return {
        "message": f"OAuth callback received for {provider_name}",
        "code": code,
        "state": state,
        "next_step": "Complete connection setup in the application"
    }


# Batch operations
@router.post("/connections/batch-sync")
async def batch_sync_connections(
    tenant_id: int,
    connection_ids: List[int],
    sync_type: str = "scheduled",
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Perform batch synchronization for multiple connections
    """
    integration_service = IntegrationService(db)
    results = []
    
    for connection_id in connection_ids:
        try:
            sync_log = integration_service.sync_connection(
                connection_id=connection_id,
                sync_type=sync_type,
                operation="incremental"
            )
            results.append({
                "connection_id": connection_id,
                "status": "success",
                "sync_log_id": sync_log.id
            })
        except Exception as e:
            results.append({
                "connection_id": connection_id,
                "status": "failed",
                "error": str(e)
            })
    
    return {
        "message": f"Batch sync completed for {len(connection_ids)} connections",
        "results": results
    }
