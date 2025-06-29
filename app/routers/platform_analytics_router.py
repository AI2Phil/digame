"""
Platform Analytics Router
Comprehensive analytics API endpoints for Platform Owner insights
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from ..database import get_db
from ..models.user import User
from ..models.tenant import Tenant
from ..models.platform_analytics import PlatformUsageMetric, PlatformHealthMetric, TenantAnalyticsSummary
from ..services.platform_auth_service import PlatformAuthService
from ..auth.auth_dependencies import get_current_user

router = APIRouter(prefix="/api/v1/platform/analytics", tags=["Platform Analytics"])


# Platform Owner Authentication Dependency
async def get_platform_owner(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure current user is a platform owner"""
    if not current_user.is_platform_owner:
        raise HTTPException(status_code=403, detail="Platform owner access required")
    return current_user


# Permission-based dependencies
def require_platform_permission(permission: str):
    """Decorator factory for platform permission requirements"""
    async def permission_checker(
        current_user: User = Depends(get_platform_owner),
        db: Session = Depends(get_db)
    ) -> User:
        auth_service = PlatformAuthService(db)
        if not auth_service.has_platform_permission(current_user, permission):
            raise HTTPException(
                status_code=403, 
                detail=f"Platform permission '{permission}' required"
            )
        return current_user
    return permission_checker


@router.get("/dashboard")
async def get_analytics_dashboard(
    period: str = Query("30d", regex="^(1d|7d|30d|90d|1y)$", description="Analytics period"),
    current_user: User = Depends(require_platform_permission("can_view_platform_analytics")),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics dashboard data"""
    
    # Parse period
    period_days = {"1d": 1, "7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
    start_date = datetime.utcnow() - timedelta(days=period_days)
    
    # Core metrics
    total_tenants = db.query(Tenant).count()
    active_tenants = db.query(Tenant).filter(
        Tenant.last_activity >= start_date
    ).count()
    
    total_users = db.query(User).filter(User.is_platform_owner == False).count()
    active_users = db.query(User).filter(
        User.last_login >= start_date,
        User.is_platform_owner == False
    ).count()
    
    # Subscription breakdown
    subscription_breakdown = db.query(
        User.subscription_tier,
        func.count(User.id).label('count')
    ).filter(User.is_platform_owner == False).group_by(User.subscription_tier).all()
    
    # Revenue calculation
    tier_pricing = {"free": 0, "individual_pro": 19, "team": 49, "enterprise": 500}
    estimated_mrr = sum(
        tier_pricing.get(tier, 0) * count 
        for tier, count in subscription_breakdown
    )
    
    # Growth trends
    growth_data = []
    for i in range(period_days):
        date = start_date + timedelta(days=i)
        daily_signups = db.query(User).filter(
            func.date(User.created_at) == date.date(),
            User.is_platform_owner == False
        ).count()
        growth_data.append({
            "date": date.date().isoformat(),
            "signups": daily_signups
        })
    
    # API usage today
    api_calls_today = db.query(func.sum(PlatformUsageMetric.metric_value)).filter(
        PlatformUsageMetric.metric_type == "api_calls",
        PlatformUsageMetric.recorded_at >= datetime.utcnow().date()
    ).scalar() or 0
    
    # Storage usage
    total_storage = db.query(func.sum(Tenant.current_storage_gb)).scalar() or 0
    
    return {
        "success": True,
        "data": {
            "overview": {
                "total_tenants": total_tenants,
                "active_tenants": active_tenants,
                "total_users": total_users,
                "active_users": active_users,
                "estimated_mrr": estimated_mrr,
                "total_storage_gb": total_storage,
                "api_calls_today": api_calls_today
            },
            "subscription_breakdown": dict(subscription_breakdown),
            "growth_trends": growth_data,
            "period": period,
            "generated_at": datetime.utcnow().isoformat()
        },
        "requested_by": current_user.email
    }


@router.get("/revenue")
async def get_revenue_analytics(
    period: str = Query("30d", regex="^(1d|7d|30d|90d|1y)$"),
    breakdown: str = Query("daily", regex="^(daily|weekly|monthly)$"),
    current_user: User = Depends(require_platform_permission("can_view_platform_analytics")),
    db: Session = Depends(get_db)
):
    """Get detailed revenue analytics and projections"""
    
    period_days = {"1d": 1, "7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
    
    # Current MRR by tier
    mrr_by_tier = db.query(
        User.subscription_tier,
        func.count(User.id).label('subscribers'),
        func.sum(
            case(
                (User.subscription_tier == "individual_pro", 19),
                (User.subscription_tier == "team", 49),
                (User.subscription_tier == "enterprise", 500),
                else_=0
            )
        ).label('mrr')
    ).filter(
        User.is_platform_owner == False,
        User.subscription_status == "active"
    ).group_by(User.subscription_tier).all()
    
    total_mrr = sum(float(tier.mrr or 0) for tier in mrr_by_tier)
    total_subscribers = sum(tier.subscribers for tier in mrr_by_tier)
    
    # Revenue trends (simplified)
    start_date = datetime.utcnow() - timedelta(days=period_days)
    revenue_trends = []
    
    if breakdown == "daily":
        for i in range(min(period_days, 30)):  # Limit to 30 days for daily
            date = start_date + timedelta(days=i)
            # Simplified: assume current MRR distributed daily
            daily_revenue = total_mrr / 30
            revenue_trends.append({
                "date": date.date().isoformat(),
                "revenue": daily_revenue
            })
    
    # Churn analysis (simplified)
    cancelled_users = db.query(User).filter(
        User.subscription_status == "cancelled",
        User.updated_at >= start_date
    ).count()
    
    churn_rate = (cancelled_users / total_subscribers * 100) if total_subscribers > 0 else 0
    
    return {
        "success": True,
        "data": {
            "summary": {
                "total_mrr": total_mrr,
                "total_subscribers": total_subscribers,
                "average_revenue_per_user": total_mrr / total_subscribers if total_subscribers > 0 else 0,
                "churn_rate": churn_rate
            },
            "mrr_by_tier": [
                {
                    "tier": tier.subscription_tier,
                    "subscribers": tier.subscribers,
                    "mrr": float(tier.mrr or 0)
                }
                for tier in mrr_by_tier
            ],
            "revenue_trends": revenue_trends,
            "churn_analysis": {
                "cancelled_users": cancelled_users,
                "churn_rate": churn_rate
            },
            "period": period,
            "breakdown": breakdown,
            "generated_at": datetime.utcnow().isoformat()
        }
    }


@router.get("/usage")
async def get_usage_analytics(
    metric_type: Optional[str] = Query(None, description="Filter by metric type"),
    tenant_id: Optional[int] = Query(None, description="Filter by tenant ID"),
    period: str = Query("30d", regex="^(1d|7d|30d|90d|1y)$"),
    current_user: User = Depends(require_platform_permission("can_view_platform_analytics")),
    db: Session = Depends(get_db)
):
    """Get detailed usage analytics across the platform"""
    
    period_days = {"1d": 1, "7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
    start_date = datetime.utcnow() - timedelta(days=period_days)
    
    query = db.query(PlatformUsageMetric).filter(
        PlatformUsageMetric.recorded_at >= start_date
    )
    
    if metric_type:
        query = query.filter(PlatformUsageMetric.metric_type == metric_type)
    
    if tenant_id:
        query = query.filter(PlatformUsageMetric.tenant_id == tenant_id)
    
    # Aggregate by metric type
    usage_summary = query.with_entities(
        PlatformUsageMetric.metric_type,
        PlatformUsageMetric.metric_name,
        func.count(PlatformUsageMetric.id).label('count'),
        func.sum(PlatformUsageMetric.metric_value).label('total_value'),
        func.avg(PlatformUsageMetric.metric_value).label('avg_value')
    ).group_by(
        PlatformUsageMetric.metric_type,
        PlatformUsageMetric.metric_name
    ).all()
    
    # Top features by usage
    top_features = db.query(
        PlatformUsageMetric.feature_name,
        func.count(PlatformUsageMetric.id).label('usage_count'),
        func.count(func.distinct(PlatformUsageMetric.tenant_id)).label('tenant_count')
    ).filter(
        PlatformUsageMetric.recorded_at >= start_date,
        PlatformUsageMetric.feature_name.isnot(None)
    ).group_by(PlatformUsageMetric.feature_name).order_by(
        func.count(PlatformUsageMetric.id).desc()
    ).limit(20).all()
    
    return {
        "success": True,
        "data": {
            "usage_summary": [
                {
                    "metric_type": usage.metric_type,
                    "metric_name": usage.metric_name,
                    "count": usage.count,
                    "total_value": float(usage.total_value or 0),
                    "avg_value": float(usage.avg_value or 0)
                }
                for usage in usage_summary
            ],
            "top_features": [
                {
                    "feature_name": feature.feature_name,
                    "usage_count": feature.usage_count,
                    "tenant_count": feature.tenant_count
                }
                for feature in top_features
            ],
            "period": period,
            "filters": {
                "metric_type": metric_type,
                "tenant_id": tenant_id
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    }


@router.get("/growth")
async def get_growth_analytics(
    period: str = Query("30d", regex="^(1d|7d|30d|90d|1y)$"),
    current_user: User = Depends(require_platform_permission("can_view_platform_analytics")),
    db: Session = Depends(get_db)
):
    """Get growth metrics and trends"""
    
    period_days = {"1d": 1, "7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
    start_date = datetime.utcnow() - timedelta(days=period_days)
    
    # User growth
    user_growth = []
    tenant_growth = []
    
    for i in range(min(period_days, 30)):  # Limit to 30 data points
        date = start_date + timedelta(days=i)
        
        daily_users = db.query(User).filter(
            func.date(User.created_at) == date.date(),
            User.is_platform_owner == False
        ).count()
        
        daily_tenants = db.query(Tenant).filter(
            func.date(Tenant.created_at) == date.date()
        ).count()
        
        user_growth.append({
            "date": date.date().isoformat(),
            "new_users": daily_users
        })
        
        tenant_growth.append({
            "date": date.date().isoformat(),
            "new_tenants": daily_tenants
        })
    
    # Calculate growth rates
    total_users_period = sum(day["new_users"] for day in user_growth)
    total_tenants_period = sum(day["new_tenants"] for day in tenant_growth)
    
    # Previous period for comparison
    prev_start = start_date - timedelta(days=period_days)
    prev_users = db.query(User).filter(
        User.created_at >= prev_start,
        User.created_at < start_date,
        User.is_platform_owner == False
    ).count()
    
    user_growth_rate = ((total_users_period - prev_users) / prev_users * 100) if prev_users > 0 else 0
    
    return {
        "success": True,
        "data": {
            "summary": {
                "total_new_users": total_users_period,
                "total_new_tenants": total_tenants_period,
                "user_growth_rate": user_growth_rate,
                "period": period
            },
            "user_growth": user_growth,
            "tenant_growth": tenant_growth,
            "generated_at": datetime.utcnow().isoformat()
        }
    }


@router.get("/churn")
async def get_churn_analysis(
    period: str = Query("30d", regex="^(1d|7d|30d|90d|1y)$"),
    current_user: User = Depends(require_platform_permission("can_view_platform_analytics")),
    db: Session = Depends(get_db)
):
    """Get churn analysis and predictions"""
    
    period_days = {"1d": 1, "7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
    start_date = datetime.utcnow() - timedelta(days=period_days)
    
    # Churn by subscription tier
    churn_by_tier = db.query(
        User.subscription_tier,
        func.count(case((User.subscription_status == "cancelled", 1))).label('churned'),
        func.count(User.id).label('total')
    ).filter(
        User.is_platform_owner == False,
        User.created_at < start_date  # Only users who existed before the period
    ).group_by(User.subscription_tier).all()
    
    # Recent churned users
    recent_churn = db.query(User).filter(
        User.subscription_status == "cancelled",
        User.updated_at >= start_date,
        User.is_platform_owner == False
    ).count()
    
    # Active users for churn rate calculation
    active_users = db.query(User).filter(
        User.subscription_status == "active",
        User.is_platform_owner == False
    ).count()
    
    churn_rate = (recent_churn / (active_users + recent_churn) * 100) if (active_users + recent_churn) > 0 else 0
    
    return {
        "success": True,
        "data": {
            "summary": {
                "total_churned": recent_churn,
                "churn_rate": churn_rate,
                "active_users": active_users,
                "period": period
            },
            "churn_by_tier": [
                {
                    "tier": tier.subscription_tier,
                    "churned": tier.churned,
                    "total": tier.total,
                    "churn_rate": (tier.churned / tier.total * 100) if tier.total > 0 else 0
                }
                for tier in churn_by_tier
            ],
            "generated_at": datetime.utcnow().isoformat()
        }
    }