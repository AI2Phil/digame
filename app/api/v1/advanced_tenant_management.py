"""
Advanced Tenant Management API Router
Implements Priority 4A: Advanced Multi-Tenant Management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
import logging

from ...database import get_db
from ...services.advanced_tenant_management_service import get_advanced_tenant_management_service, AdvancedTenantManagementService
from ...auth.auth_service import get_current_user
from ...models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/advanced-tenant", tags=["Advanced Tenant Management"])


@router.get("/resource-allocation/{tenant_id}")
async def get_tenant_resource_allocation(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: AdvancedTenantManagementService = Depends(get_advanced_tenant_management_service)
) -> Dict[str, Any]:
    """
    Get comprehensive tenant resource allocation and usage metrics
    
    Returns:
    - Resource limits and current usage
    - Utilization percentages
    - Resource health status
    - Cost allocation breakdown
    - Optimization recommendations
    """
    try:
        # Verify user has access to tenant data
        if not _has_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to tenant data")
        
        result = await service.get_tenant_resource_allocation(tenant_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting resource allocation for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/analytics/{tenant_id}")
async def get_tenant_analytics(
    tenant_id: int,
    days: int = Query(30, ge=1, le=365, description="Number of days for analytics period"),
    current_user: User = Depends(get_current_user),
    service: AdvancedTenantManagementService = Depends(get_advanced_tenant_management_service)
) -> Dict[str, Any]:
    """
    Get comprehensive tenant analytics and reporting
    
    Parameters:
    - days: Analysis period in days (1-365)
    
    Returns:
    - User activity analytics
    - Feature usage analytics
    - Performance metrics
    - Security analytics
    - Business metrics
    """
    try:
        # Verify user has access to tenant data
        if not _has_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to tenant data")
        
        result = await service.get_tenant_analytics(tenant_id, days)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting analytics for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/billing/{tenant_id}")
async def get_tenant_billing_info(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: AdvancedTenantManagementService = Depends(get_advanced_tenant_management_service)
) -> Dict[str, Any]:
    """
    Get comprehensive tenant billing information
    
    Returns:
    - Current billing period details
    - Subscription information
    - Usage-based charges
    - Payment history
    - Upcoming charges
    - Billing status
    """
    try:
        # Verify user has access to tenant billing data
        if not _has_billing_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to billing data")
        
        result = await service.get_tenant_billing_info(tenant_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting billing info for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/health-check/{tenant_id}")
async def get_tenant_health_check(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: AdvancedTenantManagementService = Depends(get_advanced_tenant_management_service)
) -> Dict[str, Any]:
    """
    Get tenant health check summary
    
    Returns quick overview of:
    - Resource utilization status
    - Performance indicators
    - Security status
    - Billing status
    """
    try:
        # Verify user has access to tenant data
        if not _has_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to tenant data")
        
        # Get resource allocation for health metrics
        resource_data = await service.get_tenant_resource_allocation(tenant_id)
        if "error" in resource_data:
            raise HTTPException(status_code=400, detail=resource_data["error"])
        
        # Get analytics for performance indicators
        analytics_data = await service.get_tenant_analytics(tenant_id, 7)  # Last 7 days
        if "error" in analytics_data:
            raise HTTPException(status_code=400, detail=analytics_data["error"])
        
        # Get billing status
        billing_data = await service.get_tenant_billing_info(tenant_id)
        if "error" in billing_data:
            raise HTTPException(status_code=400, detail=billing_data["error"])
        
        # Compile health summary
        health_summary = {
            "tenant_id": tenant_id,
            "overall_health": _calculate_overall_health(resource_data, analytics_data, billing_data),
            "resource_health": resource_data.get("resource_health", {}),
            "performance_indicators": {
                "uptime": analytics_data.get("performance", {}).get("uptime_percentage", 0),
                "response_time": analytics_data.get("performance", {}).get("avg_response_time_ms", 0),
                "error_rate": analytics_data.get("performance", {}).get("error_rate", 0)
            },
            "security_status": {
                "security_score": analytics_data.get("security", {}).get("security_score", 0),
                "active_threats": analytics_data.get("security", {}).get("active_threats", 0)
            },
            "billing_status": billing_data.get("billing_status", "unknown"),
            "last_updated": resource_data.get("last_updated")
        }
        
        return health_summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting health check for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/dashboard-summary/{tenant_id}")
async def get_tenant_dashboard_summary(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: AdvancedTenantManagementService = Depends(get_advanced_tenant_management_service)
) -> Dict[str, Any]:
    """
    Get tenant dashboard summary with key metrics
    
    Returns condensed view of:
    - Key performance indicators
    - Resource usage highlights
    - Recent activity summary
    - Important alerts or notifications
    """
    try:
        # Verify user has access to tenant data
        if not _has_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to tenant data")
        
        # Get resource allocation
        resource_data = await service.get_tenant_resource_allocation(tenant_id)
        if "error" in resource_data:
            raise HTTPException(status_code=400, detail=resource_data["error"])
        
        # Get recent analytics
        analytics_data = await service.get_tenant_analytics(tenant_id, 7)
        if "error" in analytics_data:
            raise HTTPException(status_code=400, detail=analytics_data["error"])
        
        # Compile dashboard summary
        dashboard_summary = {
            "tenant_id": tenant_id,
            "tenant_name": resource_data.get("tenant_name"),
            "subscription_tier": resource_data.get("subscription_tier"),
            "key_metrics": {
                "total_users": analytics_data.get("user_activity", {}).get("total_users", 0),
                "active_users": analytics_data.get("user_activity", {}).get("active_users", 0),
                "resource_utilization": resource_data.get("utilization_percentages", {}),
                "monthly_cost": resource_data.get("cost_allocation", {}).get("total_monthly", 0)
            },
            "alerts": _generate_dashboard_alerts(resource_data, analytics_data),
            "recent_activity": {
                "user_growth": analytics_data.get("user_activity", {}).get("user_growth", {}),
                "feature_adoption": analytics_data.get("feature_usage", {}).get("feature_adoption_rate", 0),
                "performance_trend": "stable"  # Would be calculated from historical data
            },
            "quick_actions": _generate_quick_actions(resource_data, analytics_data),
            "last_updated": resource_data.get("last_updated")
        }
        
        return dashboard_summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dashboard summary for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Helper functions

def _has_tenant_access(user: User, tenant_id: int) -> bool:
    """Check if user has access to tenant data"""
    # Admin users have access to all tenants
    if hasattr(user, 'is_admin') and user.is_admin:
        return True
    
    # Users can only access their own tenant data
    return user.tenant_id == tenant_id


def _has_billing_access(user: User, tenant_id: int) -> bool:
    """Check if user has access to billing data"""
    # Only admin users or tenant owners can access billing
    if hasattr(user, 'is_admin') and user.is_admin:
        return True
    
    # Check if user is tenant owner/admin
    if user.tenant_id == tenant_id:
        return hasattr(user, 'role') and user.role in ['owner', 'admin']
    
    return False


def _calculate_overall_health(resource_data: Dict, analytics_data: Dict, billing_data: Dict) -> Dict[str, Any]:
    """Calculate overall tenant health score"""
    health_factors = []
    
    # Resource health factor
    resource_health = resource_data.get("resource_health", {})
    resource_status = resource_health.get("status", "unknown")
    resource_score = {
        "optimal": 100,
        "healthy": 80,
        "warning": 60,
        "critical": 30,
        "unknown": 50
    }.get(resource_status, 50)
    health_factors.append(resource_score)
    
    # Performance factor
    performance = analytics_data.get("performance", {})
    uptime = performance.get("uptime_percentage", 95)
    error_rate = performance.get("error_rate", 1)
    performance_score = min(100, uptime - (error_rate * 10))
    health_factors.append(performance_score)
    
    # Security factor
    security = analytics_data.get("security", {})
    security_score = security.get("security_score", 85)
    active_threats = security.get("active_threats", 0)
    adjusted_security_score = max(0, security_score - (active_threats * 20))
    health_factors.append(adjusted_security_score)
    
    # Billing factor
    billing_status = billing_data.get("billing_status", "current")
    billing_score = 100 if billing_status == "current" else 50
    health_factors.append(billing_score)
    
    # Calculate overall score
    overall_score = sum(health_factors) / len(health_factors)
    
    # Determine status
    if overall_score >= 90:
        status = "excellent"
    elif overall_score >= 75:
        status = "good"
    elif overall_score >= 60:
        status = "fair"
    else:
        status = "needs_attention"
    
    return {
        "score": round(overall_score, 1),
        "status": status,
        "factors": {
            "resource_health": resource_score,
            "performance": performance_score,
            "security": adjusted_security_score,
            "billing": billing_score
        }
    }


def _generate_dashboard_alerts(resource_data: Dict, analytics_data: Dict) -> List[Dict[str, Any]]:
    """Generate dashboard alerts based on tenant data"""
    alerts = []
    
    # Resource utilization alerts
    utilization = resource_data.get("utilization_percentages", {})
    for resource, percentage in utilization.items():
        if percentage >= 90:
            alerts.append({
                "type": "critical",
                "category": "resource",
                "message": f"{resource.title()} utilization is critically high ({percentage}%)",
                "action": "Consider upgrading or optimizing usage"
            })
        elif percentage >= 75:
            alerts.append({
                "type": "warning",
                "category": "resource",
                "message": f"{resource.title()} utilization is high ({percentage}%)",
                "action": "Monitor usage and plan for potential upgrade"
            })
    
    # Security alerts
    security = analytics_data.get("security", {})
    active_threats = security.get("active_threats", 0)
    if active_threats > 0:
        alerts.append({
            "type": "critical",
            "category": "security",
            "message": f"{active_threats} active security threat(s) detected",
            "action": "Review security dashboard immediately"
        })
    
    # Performance alerts
    performance = analytics_data.get("performance", {})
    uptime = performance.get("uptime_percentage", 100)
    if uptime < 99:
        alerts.append({
            "type": "warning",
            "category": "performance",
            "message": f"Uptime is below target ({uptime}%)",
            "action": "Check system status and recent incidents"
        })
    
    return alerts


def _generate_quick_actions(resource_data: Dict, analytics_data: Dict) -> List[Dict[str, Any]]:
    """Generate quick action suggestions"""
    actions = []
    
    # Resource optimization actions
    utilization = resource_data.get("utilization_percentages", {})
    max_utilization = max(utilization.values()) if utilization else 0
    
    if max_utilization >= 80:
        actions.append({
            "title": "Optimize Resources",
            "description": "Review resource usage and consider upgrades",
            "priority": "high",
            "category": "optimization"
        })
    
    # User engagement actions
    user_activity = analytics_data.get("user_activity", {})
    activation_rate = user_activity.get("activation_rate", 0)
    
    if activation_rate < 70:
        actions.append({
            "title": "Improve User Engagement",
            "description": "User activation rate is below optimal",
            "priority": "medium",
            "category": "engagement"
        })
    
    # Feature adoption actions
    feature_usage = analytics_data.get("feature_usage", {})
    adoption_rate = feature_usage.get("feature_adoption_rate", 0)
    
    if adoption_rate < 60:
        actions.append({
            "title": "Increase Feature Adoption",
            "description": "Many features are underutilized",
            "priority": "medium",
            "category": "features"
        })
    
    return actions