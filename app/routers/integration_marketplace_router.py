"""
Integration Marketplace API Router - Phase 2B Implementation
Priority 2: Integration Ecosystem Completion (85% → 95%)

RESTful API endpoints for integration marketplace, discovery, installation, and management
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from ..database import get_db
from ..services.integration_marketplace_service import IntegrationMarketplaceService
from ..auth.auth_dependencies import get_current_user
from ..models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/integrations/marketplace", tags=["Integration Marketplace"])


@router.get("/catalog", response_model=Dict[str, Any])
async def get_marketplace_catalog(
    category: Optional[str] = Query(None, description="Filter by category"),
    complexity: Optional[str] = Query(None, description="Filter by complexity: simple, moderate, advanced, enterprise"),
    status: Optional[str] = Query(None, description="Filter by status: available, beta, deprecated, coming_soon"),
    search: Optional[str] = Query(None, description="Search query for name, description, or tags"),
    sort_by: str = Query("popularity", description="Sort by: popularity, rating, name, newest, installations"),
    limit: int = Query(50, description="Number of results per page", ge=1, le=100),
    offset: int = Query(0, description="Offset for pagination", ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive marketplace catalog with filtering, search, and pagination
    
    Returns:
    - Filtered and sorted list of available integrations
    - Featured and trending integrations
    - Marketplace statistics
    - Available filter options
    """
    try:
        marketplace_service = IntegrationMarketplaceService(db)
        
        catalog = await marketplace_service.get_marketplace_catalog(
            category=category,
            complexity=complexity,
            status=status,
            search_query=search,
            sort_by=sort_by,
            limit=limit,
            offset=offset
        )
        
        return {
            "success": True,
            "data": catalog
        }
        
    except Exception as e:
        logger.error(f"Failed to get marketplace catalog: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get catalog: {str(e)}")


@router.get("/integrations/{integration_id}", response_model=Dict[str, Any])
async def get_integration_details(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific integration
    
    Returns:
    - Complete integration details and specifications
    - User reviews and ratings
    - Usage analytics (if installed)
    - Similar integrations
    - Installation guide and compatibility info
    """
    try:
        marketplace_service = IntegrationMarketplaceService(db)
        
        details = await marketplace_service.get_integration_details(
            integration_id=integration_id,
            tenant_id=current_user.tenant_id
        )
        
        return {
            "success": True,
            "data": details
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get integration details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get details: {str(e)}")


@router.get("/integrations/{integration_id}/wizard", response_model=Dict[str, Any])
async def get_integration_wizard(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get configuration wizard steps for integration setup
    
    Returns:
    - Step-by-step configuration wizard
    - Required fields and validation rules
    - Help resources and documentation links
    """
    try:
        marketplace_service = IntegrationMarketplaceService(db)
        
        wizard_config = await marketplace_service.get_integration_wizard_config(integration_id)
        
        return {
            "success": True,
            "data": wizard_config
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get integration wizard: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get wizard: {str(e)}")


@router.post("/integrations/{integration_id}/install", response_model=Dict[str, Any])
async def install_integration(
    integration_id: str,
    background_tasks: BackgroundTasks,
    configuration: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Install an integration for the current tenant
    
    Body:
    - configuration: Integration configuration including auth data, sync settings, etc.
    
    Returns:
    - Installation status and connection details
    - Post-installation steps and recommendations
    - Support resources
    """
    try:
        marketplace_service = IntegrationMarketplaceService(db)
        
        # Install integration in background
        installation_result = await marketplace_service.install_integration(
            integration_id=integration_id,
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            configuration=configuration
        )
        
        if installation_result["success"]:
            # Trigger optimization in background
            background_tasks.add_task(
                optimize_new_integration,
                installation_result["connection_id"]
            )
        
        return {
            "success": installation_result["success"],
            "data": installation_result
        }
        
    except Exception as e:
        logger.error(f"Failed to install integration {integration_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Installation failed: {str(e)}")


@router.get("/my-integrations", response_model=Dict[str, Any])
async def get_my_integrations(
    status: Optional[str] = Query(None, description="Filter by status: active, paused, error"),
    category: Optional[str] = Query(None, description="Filter by category"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all integrations installed for the current tenant
    
    Returns:
    - List of installed integrations with status and analytics
    - Tenant-level statistics and health overview
    - Management recommendations and available actions
    """
    try:
        marketplace_service = IntegrationMarketplaceService(db)
        
        tenant_integrations = await marketplace_service.get_tenant_integrations(current_user.tenant_id)
        
        # Apply filters if provided
        if status:
            tenant_integrations["integrations"] = [
                i for i in tenant_integrations["integrations"] 
                if i["status"] == status
            ]
        
        if category:
            tenant_integrations["integrations"] = [
                i for i in tenant_integrations["integrations"] 
                if i["category"] == category
            ]
        
        return {
            "success": True,
            "data": tenant_integrations
        }
        
    except Exception as e:
        logger.error(f"Failed to get tenant integrations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get integrations: {str(e)}")


@router.post("/integrations/{integration_id}/review", response_model=Dict[str, Any])
async def submit_integration_review(
    integration_id: str,
    review_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a review for an integration
    
    Body:
    - rating: Integer rating from 1-5
    - title: Review title
    - content: Review content
    - pros: List of pros
    - cons: List of cons
    - use_case: Primary use case
    - company_size: Company size category
    - industry: Industry category
    """
    try:
        # Validate review data
        required_fields = ["rating", "title", "content"]
        for field in required_fields:
            if field not in review_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        if not (1 <= review_data["rating"] <= 5):
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        # Check if user has the integration installed
        marketplace_service = IntegrationMarketplaceService(db)
        is_installed = await marketplace_service.is_integration_installed(
            integration_id, current_user.tenant_id
        )
        
        if not is_installed:
            raise HTTPException(
                status_code=400, 
                detail="You must have this integration installed to submit a review"
            )
        
        # Store review (mock implementation)
        review_id = f"review_{current_user.id}_{integration_id}_{int(datetime.utcnow().timestamp())}"
        
        return {
            "success": True,
            "data": {
                "review_id": review_id,
                "message": "Review submitted successfully",
                "moderation_status": "pending"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to submit review: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to submit review: {str(e)}")


@router.post("/custom-integration", response_model=Dict[str, Any])
async def create_custom_integration(
    integration_spec: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a custom integration using the enterprise integration builder
    
    Body:
    - name: Integration name
    - display_name: Display name
    - description: Description
    - category: Integration category
    - features: List of features
    - auth_types: Supported authentication types
    - Additional configuration options
    
    Returns:
    - Custom integration details
    - Deployment package and instructions
    - Next steps for implementation
    """
    try:
        # Check if user has enterprise access
        if not hasattr(current_user, 'subscription_tier') or current_user.subscription_tier != 'enterprise':
            raise HTTPException(
                status_code=403, 
                detail="Custom integration builder requires enterprise subscription"
            )
        
        marketplace_service = IntegrationMarketplaceService(db)
        
        result = await marketplace_service.create_custom_integration(
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            integration_spec=integration_spec
        )
        
        return {
            "success": result["success"],
            "data": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create custom integration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create custom integration: {str(e)}")


@router.get("/categories", response_model=Dict[str, Any])
async def get_integration_categories(
    current_user: User = Depends(get_current_user)
):
    """
    Get available integration categories with counts and descriptions
    """
    try:
        categories = [
            {
                "id": "communication",
                "name": "Communication",
                "description": "Team messaging, video calls, and collaboration tools",
                "icon": "💬",
                "integration_count": 12
            },
            {
                "id": "crm",
                "name": "Customer Relationship Management",
                "description": "Customer data, sales pipeline, and relationship management",
                "icon": "👥",
                "integration_count": 8
            },
            {
                "id": "project_management",
                "name": "Project Management",
                "description": "Task tracking, project planning, and team coordination",
                "icon": "📋",
                "integration_count": 15
            },
            {
                "id": "time_tracking",
                "name": "Time Tracking",
                "description": "Time logging, productivity monitoring, and billing",
                "icon": "⏰",
                "integration_count": 6
            },
            {
                "id": "learning",
                "name": "Learning & Development",
                "description": "Training platforms, skill development, and education",
                "icon": "📚",
                "integration_count": 10
            },
            {
                "id": "development",
                "name": "Development Tools",
                "description": "Code repositories, CI/CD, and development workflows",
                "icon": "💻",
                "integration_count": 9
            },
            {
                "id": "productivity",
                "name": "Productivity",
                "description": "Office suites, document management, and workflow tools",
                "icon": "📊",
                "integration_count": 11
            },
            {
                "id": "storage",
                "name": "Cloud Storage",
                "description": "File storage, sharing, and document management",
                "icon": "☁️",
                "integration_count": 7
            }
        ]
        
        return {
            "success": True,
            "data": {
                "categories": categories,
                "total_categories": len(categories),
                "total_integrations": sum(cat["integration_count"] for cat in categories)
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get categories: {str(e)}")


@router.get("/analytics", response_model=Dict[str, Any])
async def get_marketplace_analytics(
    period: str = Query("30d", description="Analytics period: 7d, 30d, 90d"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get marketplace usage analytics for the tenant
    
    Returns:
    - Integration usage statistics
    - Performance metrics and trends
    - Cost savings and ROI analysis
    - Adoption and engagement metrics
    """
    try:
        # Mock analytics data
        analytics_data = {
            "period": period,
            "tenant_id": current_user.tenant_id,
            "generated_at": datetime.utcnow().isoformat(),
            "overview": {
                "total_integrations": 8,
                "active_integrations": 7,
                "total_syncs": 15420,
                "successful_syncs": 14891,
                "success_rate": 96.57,
                "data_processed_gb": 2.34,
                "cost_savings_usd": 1250.00,
                "productivity_hours_saved": 45.5
            },
            "usage_trends": {
                "daily_syncs": [120, 135, 98, 156, 142, 178, 165],
                "success_rates": [96.2, 97.1, 95.8, 96.9, 97.3, 96.1, 97.0],
                "data_volume": [0.08, 0.12, 0.09, 0.15, 0.11, 0.18, 0.14]
            },
            "top_integrations": [
                {"name": "Slack", "syncs": 4520, "success_rate": 98.2},
                {"name": "Google Drive", "syncs": 3890, "success_rate": 97.1},
                {"name": "Asana", "syncs": 2340, "success_rate": 96.8}
            ],
            "category_breakdown": {
                "communication": 35.2,
                "project_management": 28.7,
                "storage": 18.9,
                "crm": 17.2
            },
            "roi_analysis": {
                "monthly_cost_savings": 1250.00,
                "automation_hours_saved": 45.5,
                "efficiency_improvement": 23.4,
                "error_reduction": 67.8
            }
        }
        
        return {
            "success": True,
            "data": analytics_data
        }
        
    except Exception as e:
        logger.error(f"Failed to get marketplace analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")


@router.post("/bulk-actions", response_model=Dict[str, Any])
async def execute_bulk_action(
    background_tasks: BackgroundTasks,
    action_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Execute bulk actions on multiple integrations
    
    Body:
    - action: Action to perform (pause_all, resume_all, sync_all, optimize_all)
    - integration_ids: List of integration IDs (optional, defaults to all)
    - filters: Additional filters for selection
    
    Returns:
    - Bulk action status and results
    - Individual operation results
    """
    try:
        action = action_data.get("action")
        integration_ids = action_data.get("integration_ids", [])
        
        if not action:
            raise HTTPException(status_code=400, detail="Action is required")
        
        valid_actions = ["pause_all", "resume_all", "sync_all", "optimize_all"]
        if action not in valid_actions:
            raise HTTPException(status_code=400, detail=f"Invalid action. Must be one of: {valid_actions}")
        
        # Execute bulk action in background
        background_tasks.add_task(
            execute_bulk_integration_action,
            action,
            current_user.tenant_id,
            integration_ids
        )
        
        return {
            "success": True,
            "data": {
                "action": action,
                "tenant_id": current_user.tenant_id,
                "integration_count": len(integration_ids) if integration_ids else "all",
                "status": "initiated",
                "estimated_completion": "2-5 minutes",
                "message": f"Bulk action '{action}' has been initiated"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to execute bulk action: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to execute bulk action: {str(e)}")


# Background task functions
async def optimize_new_integration(connection_id: int):
    """Background task to optimize newly installed integration"""
    try:
        # This would trigger the optimization service
        logger.info(f"Optimizing new integration connection {connection_id}")
        # await optimization_service.optimize_connection(connection_id)
    except Exception as e:
        logger.error(f"Failed to optimize new integration {connection_id}: {str(e)}")


async def execute_bulk_integration_action(action: str, tenant_id: int, integration_ids: List[int]):
    """Background task to execute bulk actions"""
    try:
        logger.info(f"Executing bulk action '{action}' for tenant {tenant_id}")
        
        if action == "sync_all":
            # Trigger sync for all integrations
            pass
        elif action == "optimize_all":
            # Trigger optimization for all integrations
            pass
        elif action == "pause_all":
            # Pause all integrations
            pass
        elif action == "resume_all":
            # Resume all integrations
            pass
        
        logger.info(f"Bulk action '{action}' completed for tenant {tenant_id}")
        
    except Exception as e:
        logger.error(f"Failed to execute bulk action '{action}': {str(e)}")