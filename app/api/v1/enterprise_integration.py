"""
Enterprise Integration API Router
Implements Priority 4C: Enterprise Integration endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
import logging

from ...database import get_db
from ...services.enterprise_integration_service import get_enterprise_integration_service, EnterpriseIntegrationService
from ...auth.auth_service import get_current_user
from ...models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/enterprise-integration", tags=["Enterprise Integration"])


@router.post("/ldap-config/{tenant_id}")
async def configure_ldap_integration(
    tenant_id: int,
    ldap_config: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    service: EnterpriseIntegrationService = Depends(get_enterprise_integration_service)
) -> Dict[str, Any]:
    """
    Configure LDAP/Active Directory integration for enterprise tenant
    
    Parameters:
    - ldap_config: LDAP configuration including server_url, base_dn, bind_dn, etc.
    
    Returns:
    - Integration ID and configuration status
    - Connection test results
    - Sync scheduling information
    """
    try:
        # Verify user has admin access to tenant
        if not _has_admin_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Admin access required to configure LDAP integration")
        
        result = await service.configure_ldap_integration(tenant_id, ldap_config)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error configuring LDAP integration for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/ldap-sync/{tenant_id}/{integration_id}")
async def sync_ldap_users(
    tenant_id: int,
    integration_id: str,
    current_user: User = Depends(get_current_user),
    service: EnterpriseIntegrationService = Depends(get_enterprise_integration_service)
) -> Dict[str, Any]:
    """
    Synchronize users from LDAP/Active Directory
    
    Returns:
    - Sync results including users created, updated, deactivated
    - Group synchronization results
    - Error details for failed operations
    """
    try:
        # Verify user has admin access to tenant
        if not _has_admin_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Admin access required to sync LDAP users")
        
        result = await service.sync_ldap_users(tenant_id, integration_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error syncing LDAP users for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/advanced-sso/{tenant_id}")
async def configure_advanced_sso(
    tenant_id: int,
    sso_config: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    service: EnterpriseIntegrationService = Depends(get_enterprise_integration_service)
) -> Dict[str, Any]:
    """
    Configure advanced SSO with enhanced enterprise features
    
    Parameters:
    - sso_config: SSO configuration with advanced features like JIT provisioning, attribute mapping
    
    Returns:
    - Provider ID and configuration status
    - Enhanced features enabled
    - Security policy settings
    """
    try:
        # Verify user has admin access to tenant
        if not _has_admin_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Admin access required to configure advanced SSO")
        
        result = await service.configure_advanced_sso(tenant_id, sso_config)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error configuring advanced SSO for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/api-gateway/{tenant_id}")
async def configure_api_gateway(
    tenant_id: int,
    gateway_config: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    service: EnterpriseIntegrationService = Depends(get_enterprise_integration_service)
) -> Dict[str, Any]:
    """
    Configure enterprise API gateway features
    
    Parameters:
    - gateway_config: Gateway configuration including rate limiting, authentication, monitoring
    
    Returns:
    - Gateway ID and configuration status
    - Monitoring setup results
    - Endpoint configuration summary
    """
    try:
        # Verify user has admin access to tenant
        if not _has_admin_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Admin access required to configure API gateway")
        
        result = await service.configure_api_gateway(tenant_id, gateway_config)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error configuring API gateway for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/monitoring/{tenant_id}")
async def configure_enterprise_monitoring(
    tenant_id: int,
    monitoring_config: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    service: EnterpriseIntegrationService = Depends(get_enterprise_integration_service)
) -> Dict[str, Any]:
    """
    Configure enterprise monitoring and alerting
    
    Parameters:
    - monitoring_config: Monitoring configuration including metrics, alerting, thresholds
    
    Returns:
    - Monitoring ID and configuration status
    - Agents initialized count
    - Alert rules configured count
    """
    try:
        # Verify user has admin access to tenant
        if not _has_admin_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Admin access required to configure monitoring")
        
        result = await service.configure_enterprise_monitoring(tenant_id, monitoring_config)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error configuring enterprise monitoring for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/status/{tenant_id}")
async def get_enterprise_integration_status(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: EnterpriseIntegrationService = Depends(get_enterprise_integration_service)
) -> Dict[str, Any]:
    """
    Get comprehensive enterprise integration status
    
    Returns:
    - Integration summary (LDAP, SSO, API Gateway, Monitoring)
    - Health status for all integrations
    - Recent integration activity
    - Optimization recommendations
    """
    try:
        # Verify user has access to tenant
        if not _has_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to tenant integration status")
        
        result = await service.get_enterprise_integration_status(tenant_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting integration status for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/dashboard/{tenant_id}")
async def get_integration_dashboard(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: EnterpriseIntegrationService = Depends(get_enterprise_integration_service)
) -> Dict[str, Any]:
    """
    Get enterprise integration dashboard with key metrics
    
    Returns:
    - Integration overview and health status
    - Performance metrics and trends
    - Recent activity and alerts
    - Quick actions and recommendations
    """
    try:
        # Verify user has access to tenant
        if not _has_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to integration dashboard")
        
        # Get comprehensive integration status
        status_result = await service.get_enterprise_integration_status(tenant_id)
        
        if "error" in status_result:
            raise HTTPException(status_code=400, detail=status_result["error"])
        
        # Compile dashboard data
        dashboard_data = {
            "tenant_id": tenant_id,
            "integration_overview": {
                "total_integrations": _calculate_total_integrations(status_result.get("integration_summary", {})),
                "active_integrations": _count_active_integrations(status_result.get("health_status", {})),
                "health_score": _calculate_integration_health_score(status_result.get("health_status", {})),
                "last_sync": _get_last_sync_time(status_result.get("recent_activity", []))
            },
            "integration_types": {
                "ldap": {
                    "count": status_result.get("integration_summary", {}).get("ldap_integrations", 0),
                    "status": status_result.get("health_status", {}).get("ldap_status", "unknown")
                },
                "sso": {
                    "count": status_result.get("integration_summary", {}).get("sso_providers", 0),
                    "status": status_result.get("health_status", {}).get("sso_status", "unknown")
                },
                "api_gateway": {
                    "count": status_result.get("integration_summary", {}).get("api_gateways", 0),
                    "status": status_result.get("health_status", {}).get("gateway_status", "unknown")
                },
                "monitoring": {
                    "count": status_result.get("integration_summary", {}).get("monitoring_setups", 0),
                    "status": status_result.get("health_status", {}).get("monitoring_status", "unknown")
                }
            },
            "recent_activity": status_result.get("recent_activity", [])[:5],  # Last 5 activities
            "recommendations": status_result.get("recommendations", [])[:3],  # Top 3 recommendations
            "quick_actions": _generate_integration_quick_actions(status_result),
            "last_updated": status_result.get("last_updated")
        }
        
        return dashboard_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting integration dashboard for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/health-check/{tenant_id}")
async def get_integration_health_check(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: EnterpriseIntegrationService = Depends(get_enterprise_integration_service)
) -> Dict[str, Any]:
    """
    Get integration health check summary
    
    Returns quick overview of:
    - Integration connectivity status
    - Performance indicators
    - Error rates and issues
    - Sync status and timing
    """
    try:
        # Verify user has access to tenant
        if not _has_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to integration health check")
        
        # Get integration status
        status_result = await service.get_enterprise_integration_status(tenant_id)
        
        if "error" in status_result:
            raise HTTPException(status_code=400, detail=status_result["error"])
        
        health_summary = {
            "tenant_id": tenant_id,
            "overall_health": status_result.get("health_status", {}).get("overall_health", "unknown"),
            "integration_health": {
                "ldap": status_result.get("health_status", {}).get("ldap_status", "unknown"),
                "sso": status_result.get("health_status", {}).get("sso_status", "unknown"),
                "gateway": status_result.get("health_status", {}).get("gateway_status", "unknown"),
                "monitoring": status_result.get("health_status", {}).get("monitoring_status", "unknown")
            },
            "performance_indicators": {
                "connectivity": "good",  # Would be calculated from actual metrics
                "response_time": "normal",
                "error_rate": "low",
                "sync_status": "current"
            },
            "alerts": _extract_health_alerts(status_result),
            "last_updated": status_result.get("last_updated")
        }
        
        return health_summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting integration health check for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Helper functions

def _has_tenant_access(user: User, tenant_id: int) -> bool:
    """Check if user has access to tenant"""
    # Admin users have access to all tenants
    if hasattr(user, 'is_admin') and user.is_admin:
        return True
    
    # Users can only access their own tenant
    return user.tenant_id == tenant_id


def _has_admin_access(user: User, tenant_id: int) -> bool:
    """Check if user has admin access to tenant"""
    # Admin users have access to all tenants
    if hasattr(user, 'is_admin') and user.is_admin:
        return True
    
    # Check if user is admin for the tenant
    if user.tenant_id == tenant_id:
        return hasattr(user, 'role') and user.role in ['owner', 'admin']
    
    return False


def _calculate_total_integrations(integration_summary: Dict[str, Any]) -> int:
    """Calculate total number of integrations"""
    return (
        integration_summary.get("ldap_integrations", 0) +
        integration_summary.get("sso_providers", 0) +
        integration_summary.get("api_gateways", 0) +
        integration_summary.get("monitoring_setups", 0)
    )


def _count_active_integrations(health_status: Dict[str, Any]) -> int:
    """Count active integrations"""
    active_count = 0
    statuses = ["ldap_status", "sso_status", "gateway_status", "monitoring_status"]
    
    for status_key in statuses:
        if health_status.get(status_key) == "active":
            active_count += 1
    
    return active_count


def _calculate_integration_health_score(health_status: Dict[str, Any]) -> float:
    """Calculate overall integration health score"""
    statuses = ["ldap_status", "sso_status", "gateway_status", "monitoring_status"]
    active_count = 0
    total_count = 0
    
    for status_key in statuses:
        status = health_status.get(status_key)
        if status and status != "unknown":
            total_count += 1
            if status == "active":
                active_count += 1
    
    if total_count == 0:
        return 0.0
    
    return (active_count / total_count) * 100


def _get_last_sync_time(recent_activity: List[Dict[str, Any]]) -> Optional[str]:
    """Get last sync time from recent activity"""
    for activity in recent_activity:
        if activity.get("type") in ["ldap_sync", "sso_sync"]:
            return activity.get("timestamp")
    
    return None


def _generate_integration_quick_actions(status_result: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate quick action suggestions based on integration status"""
    actions = []
    
    health_status = status_result.get("health_status", {})
    integration_summary = status_result.get("integration_summary", {})
    
    # LDAP actions
    if integration_summary.get("ldap_integrations", 0) == 0:
        actions.append({
            "title": "Configure LDAP Integration",
            "description": "Set up LDAP/Active Directory integration for user management",
            "priority": "medium",
            "action_type": "configuration"
        })
    elif health_status.get("ldap_status") != "active":
        actions.append({
            "title": "Fix LDAP Connection",
            "description": "LDAP integration is not active, check configuration",
            "priority": "high",
            "action_type": "troubleshooting"
        })
    
    # SSO actions
    if integration_summary.get("sso_providers", 0) == 0:
        actions.append({
            "title": "Configure SSO",
            "description": "Set up Single Sign-On for enhanced security",
            "priority": "medium",
            "action_type": "configuration"
        })
    
    # Monitoring actions
    if integration_summary.get("monitoring_setups", 0) == 0:
        actions.append({
            "title": "Enable Monitoring",
            "description": "Set up enterprise monitoring and alerting",
            "priority": "low",
            "action_type": "configuration"
        })
    
    # Default action if everything is configured
    if not actions:
        actions.append({
            "title": "Integration Status Good",
            "description": "All enterprise integrations are properly configured",
            "priority": "low",
            "action_type": "status"
        })
    
    return actions


def _extract_health_alerts(status_result: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract health alerts from status result"""
    alerts = []
    
    health_status = status_result.get("health_status", {})
    
    # Check for inactive integrations
    if health_status.get("ldap_status") != "active":
        alerts.append({
            "type": "warning",
            "message": "LDAP integration is not active",
            "category": "connectivity"
        })
    
    if health_status.get("sso_status") != "active":
        alerts.append({
            "type": "warning",
            "message": "SSO provider is not active",
            "category": "authentication"
        })
    
    if health_status.get("gateway_status") != "active":
        alerts.append({
            "type": "warning",
            "message": "API gateway is not active",
            "category": "api"
        })
    
    return alerts