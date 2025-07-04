"""
Performance Optimization API Router
Implements Priority 5: Performance & Scalability Optimization endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

from ...database import get_db
from ...services.performance_optimization_service import get_performance_optimization_service, PerformanceOptimizationService
from ...auth.auth_service import get_current_user
from ...models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/performance", tags=["Performance Optimization"])


@router.post("/database-optimization/{tenant_id}")
async def optimize_database_performance(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: PerformanceOptimizationService = Depends(get_performance_optimization_service)
) -> Dict[str, Any]:
    """
    Perform comprehensive database optimization
    
    Returns:
    - Query optimization results
    - Index optimization analysis
    - Connection pooling optimization
    - Performance monitoring setup
    - Overall improvement metrics
    """
    try:
        # Verify user has admin access to tenant
        if not _has_admin_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Admin access required for database optimization")
        
        result = await service.optimize_database_performance(tenant_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error optimizing database performance for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/caching-optimization/{tenant_id}")
async def optimize_caching_strategy(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: PerformanceOptimizationService = Depends(get_performance_optimization_service)
) -> Dict[str, Any]:
    """
    Optimize caching strategy
    
    Returns:
    - Redis caching optimization
    - Application-level caching improvements
    - CDN integration analysis
    - Cache invalidation strategy
    - Overall cache hit rate improvements
    """
    try:
        # Verify user has admin access to tenant
        if not _has_admin_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Admin access required for caching optimization")
        
        result = await service.optimize_caching_strategy(tenant_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error optimizing caching strategy for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/api-optimization/{tenant_id}")
async def optimize_api_performance(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: PerformanceOptimizationService = Depends(get_performance_optimization_service)
) -> Dict[str, Any]:
    """
    Optimize API performance
    
    Returns:
    - Response time optimization results
    - Rate limiting optimization
    - API compression improvements
    - Monitoring enhancements
    - Overall performance score
    """
    try:
        # Verify user has admin access to tenant
        if not _has_admin_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Admin access required for API optimization")
        
        result = await service.optimize_api_performance(tenant_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error optimizing API performance for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/frontend-optimization/{tenant_id}")
async def optimize_frontend_performance(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: PerformanceOptimizationService = Depends(get_performance_optimization_service)
) -> Dict[str, Any]:
    """
    Optimize frontend performance
    
    Returns:
    - Bundle size optimization
    - Lazy loading implementation
    - Progressive Web App enhancements
    - Performance monitoring setup
    - Lighthouse score improvements
    """
    try:
        # Verify user has admin access to tenant
        if not _has_admin_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Admin access required for frontend optimization")
        
        result = await service.optimize_frontend_performance(tenant_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error optimizing frontend performance for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/dashboard/{tenant_id}")
async def get_performance_dashboard(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: PerformanceOptimizationService = Depends(get_performance_optimization_service)
) -> Dict[str, Any]:
    """
    Get comprehensive performance dashboard
    
    Returns:
    - Performance overview with overall score
    - Database, API, frontend, and caching performance metrics
    - Real-time performance indicators
    - Optimization opportunities
    - Performance trends and analytics
    """
    try:
        # Verify user has access to tenant
        if not _has_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to performance dashboard")
        
        result = await service.get_performance_dashboard(tenant_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting performance dashboard for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/metrics/{tenant_id}")
async def get_performance_metrics(
    tenant_id: int,
    metric_type: Optional[str] = Query(None, description="Specific metric type (database, api, frontend, caching)"),
    current_user: User = Depends(get_current_user),
    service: PerformanceOptimizationService = Depends(get_performance_optimization_service)
) -> Dict[str, Any]:
    """
    Get detailed performance metrics
    
    Parameters:
    - metric_type: Optional filter for specific metric category
    
    Returns:
    - Detailed performance metrics
    - Historical performance data
    - Benchmark comparisons
    - Performance alerts and recommendations
    """
    try:
        # Verify user has access to tenant
        if not _has_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to performance metrics")
        
        # Get comprehensive dashboard data
        dashboard_result = await service.get_performance_dashboard(tenant_id)
        
        if "error" in dashboard_result:
            raise HTTPException(status_code=400, detail=dashboard_result["error"])
        
        # Filter by metric type if specified
        if metric_type:
            if metric_type not in ["database", "api", "frontend", "caching"]:
                raise HTTPException(status_code=400, detail="Invalid metric type")
            
            filtered_metrics = {
                "tenant_id": tenant_id,
                "metric_type": metric_type,
                "metrics": dashboard_result.get("performance_overview", {}).get(f"{metric_type}_performance", {}),
                "real_time_data": dashboard_result.get("real_time_metrics", {}),
                "optimization_opportunities": [
                    opp for opp in dashboard_result.get("optimization_opportunities", [])
                    if opp.get("category") == metric_type
                ],
                "last_updated": dashboard_result.get("last_updated")
            }
            return filtered_metrics
        
        # Return all metrics
        return {
            "tenant_id": tenant_id,
            "all_metrics": dashboard_result.get("performance_overview", {}),
            "real_time_metrics": dashboard_result.get("real_time_metrics", {}),
            "optimization_opportunities": dashboard_result.get("optimization_opportunities", []),
            "performance_trends": dashboard_result.get("performance_trends", {}),
            "last_updated": dashboard_result.get("last_updated")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting performance metrics for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/health-check/{tenant_id}")
async def get_performance_health_check(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: PerformanceOptimizationService = Depends(get_performance_optimization_service)
) -> Dict[str, Any]:
    """
    Get performance health check summary
    
    Returns quick overview of:
    - Overall performance score
    - Critical performance issues
    - System resource utilization
    - Performance alerts and warnings
    """
    try:
        # Verify user has access to tenant
        if not _has_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to performance health check")
        
        # Get dashboard data for health summary
        dashboard_result = await service.get_performance_dashboard(tenant_id)
        
        if "error" in dashboard_result:
            raise HTTPException(status_code=400, detail=dashboard_result["error"])
        
        performance_overview = dashboard_result.get("performance_overview", {})
        real_time_metrics = dashboard_result.get("real_time_metrics", {})
        
        health_summary = {
            "tenant_id": tenant_id,
            "overall_health": _calculate_performance_health(performance_overview),
            "performance_score": performance_overview.get("overall_score", 0),
            "critical_issues": _identify_critical_issues(performance_overview, real_time_metrics),
            "system_status": {
                "database": _get_component_status(performance_overview.get("database_performance", {})),
                "api": _get_component_status(performance_overview.get("api_performance", {})),
                "frontend": _get_component_status(performance_overview.get("frontend_performance", {})),
                "caching": _get_component_status(performance_overview.get("caching_performance", {}))
            },
            "resource_utilization": {
                "response_time": real_time_metrics.get("current_response_time", 0),
                "active_connections": real_time_metrics.get("active_connections", 0),
                "cache_hit_rate": real_time_metrics.get("cache_hit_rate", 0),
                "error_rate": real_time_metrics.get("error_rate", 0)
            },
            "quick_actions": _generate_performance_quick_actions(performance_overview),
            "last_updated": dashboard_result.get("last_updated")
        }
        
        return health_summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting performance health check for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/optimize-all/{tenant_id}")
async def optimize_all_performance(
    tenant_id: int,
    optimization_config: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_user),
    service: PerformanceOptimizationService = Depends(get_performance_optimization_service)
) -> Dict[str, Any]:
    """
    Run comprehensive performance optimization across all areas
    
    Parameters:
    - optimization_config: Optional configuration for optimization preferences
    
    Returns:
    - Comprehensive optimization results
    - Performance improvements across all areas
    - Detailed recommendations and next steps
    """
    try:
        # Verify user has admin access to tenant
        if not _has_admin_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Admin access required for comprehensive optimization")
        
        # Run all optimization processes
        optimization_results = {
            "tenant_id": tenant_id,
            "optimization_timestamp": datetime.now().isoformat(),
            "database_optimization": await service.optimize_database_performance(tenant_id),
            "caching_optimization": await service.optimize_caching_strategy(tenant_id),
            "api_optimization": await service.optimize_api_performance(tenant_id),
            "frontend_optimization": await service.optimize_frontend_performance(tenant_id),
            "overall_improvement": 0.0,
            "summary": {}
        }
        
        # Calculate overall improvement
        optimization_results["overall_improvement"] = _calculate_overall_improvement(optimization_results)
        
        # Generate optimization summary
        optimization_results["summary"] = _generate_optimization_summary(optimization_results)
        
        return optimization_results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running comprehensive optimization for tenant {tenant_id}: {str(e)}")
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


def _calculate_performance_health(performance_overview: Dict[str, Any]) -> str:
    """Calculate overall performance health status"""
    overall_score = performance_overview.get("overall_score", 0)
    
    if overall_score >= 90:
        return "excellent"
    elif overall_score >= 80:
        return "good"
    elif overall_score >= 70:
        return "fair"
    elif overall_score >= 60:
        return "poor"
    else:
        return "critical"


def _identify_critical_issues(performance_overview: Dict[str, Any], real_time_metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Identify critical performance issues"""
    issues = []
    
    # Check response time
    response_time = real_time_metrics.get("current_response_time", 0)
    if response_time > 1000:  # > 1 second
        issues.append({
            "type": "high_response_time",
            "severity": "critical",
            "message": f"Response time is {response_time}ms, exceeding 1000ms threshold",
            "recommendation": "Optimize database queries and enable caching"
        })
    
    # Check error rate
    error_rate = real_time_metrics.get("error_rate", 0)
    if error_rate > 5:  # > 5%
        issues.append({
            "type": "high_error_rate",
            "severity": "critical",
            "message": f"Error rate is {error_rate}%, exceeding 5% threshold",
            "recommendation": "Investigate and fix application errors"
        })
    
    # Check cache hit rate
    cache_hit_rate = real_time_metrics.get("cache_hit_rate", 0)
    if cache_hit_rate < 70:  # < 70%
        issues.append({
            "type": "low_cache_hit_rate",
            "severity": "warning",
            "message": f"Cache hit rate is {cache_hit_rate}%, below 70% threshold",
            "recommendation": "Optimize caching strategy and cache key design"
        })
    
    return issues


def _get_component_status(component_data: Dict[str, Any]) -> str:
    """Get status for a performance component"""
    if not component_data:
        return "unknown"
    
    # Simple heuristic based on available metrics
    if "lighthouse_score" in component_data:
        score = component_data["lighthouse_score"]
        return "healthy" if score >= 80 else "warning" if score >= 60 else "critical"
    elif "avg_response_time" in component_data:
        response_time = component_data["avg_response_time"]
        return "healthy" if response_time <= 500 else "warning" if response_time <= 1000 else "critical"
    elif "hit_rate" in component_data:
        hit_rate = component_data["hit_rate"]
        return "healthy" if hit_rate >= 80 else "warning" if hit_rate >= 60 else "critical"
    else:
        return "healthy"  # Default to healthy if no specific metrics


def _generate_performance_quick_actions(performance_overview: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate quick action suggestions based on performance data"""
    actions = []
    
    overall_score = performance_overview.get("overall_score", 0)
    
    if overall_score < 80:
        actions.append({
            "title": "Run Performance Optimization",
            "description": "Overall performance score is below 80%, run comprehensive optimization",
            "priority": "high",
            "action_type": "optimization"
        })
    
    # Database-specific actions
    db_performance = performance_overview.get("database_performance", {})
    if db_performance.get("slow_queries", 0) > 0:
        actions.append({
            "title": "Optimize Database Queries",
            "description": f"Found {db_performance['slow_queries']} slow queries that need optimization",
            "priority": "medium",
            "action_type": "database"
        })
    
    # Caching-specific actions
    cache_performance = performance_overview.get("caching_performance", {})
    if cache_performance.get("hit_rate", 100) < 80:
        actions.append({
            "title": "Improve Cache Strategy",
            "description": "Cache hit rate is below optimal, review caching strategy",
            "priority": "medium",
            "action_type": "caching"
        })
    
    # Default action if performance is good
    if not actions:
        actions.append({
            "title": "Performance Status Good",
            "description": "System performance is within acceptable ranges",
            "priority": "low",
            "action_type": "monitoring"
        })
    
    return actions


def _calculate_overall_improvement(optimization_results: Dict[str, Any]) -> float:
    """Calculate overall performance improvement"""
    improvements = []
    
    # Database improvement
    db_result = optimization_results.get("database_optimization", {})
    if "overall_improvement" in db_result:
        improvements.append(db_result["overall_improvement"])
    
    # API improvement
    api_result = optimization_results.get("api_optimization", {})
    if "overall_performance_score" in api_result:
        improvements.append(api_result["overall_performance_score"] - 70)  # Assume baseline of 70
    
    # Frontend improvement
    frontend_result = optimization_results.get("frontend_optimization", {})
    if "lighthouse_score" in frontend_result:
        improvements.append(frontend_result["lighthouse_score"] - 80)  # Assume baseline of 80
    
    return sum(improvements) / len(improvements) if improvements else 0.0


def _generate_optimization_summary(optimization_results: Dict[str, Any]) -> Dict[str, Any]:
    """Generate optimization summary"""
    return {
        "total_optimizations": sum([
            len(optimization_results.get("database_optimization", {}).get("recommendations", [])),
            len(optimization_results.get("caching_optimization", {}).get("recommendations", [])),
            len(optimization_results.get("api_optimization", {}).get("recommendations", [])),
            len(optimization_results.get("frontend_optimization", {}).get("recommendations", []))
        ]),
        "performance_improvement": optimization_results.get("overall_improvement", 0),
        "areas_optimized": [
            area for area in ["database", "caching", "api", "frontend"]
            if f"{area}_optimization" in optimization_results
        ],
        "next_steps": [
            "Monitor performance metrics for 24-48 hours",
            "Review optimization recommendations",
            "Schedule regular performance reviews"
        ]
    }