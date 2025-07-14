"""
Platform Management Router
Platform Owner management API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from ..database import get_db
from ..models.user import User
from ..models.tenant import Tenant
from ..models.platform_roles import PlatformRole, UserPlatformRole
from ..models.platform_analytics import PlatformUsageMetric, PlatformHealthMetric, PlatformTenantAnalyticsSummary
from ..services.platform_auth_service import PlatformAuthService
from ..auth.auth_dependencies import get_current_user

router = APIRouter(prefix="/api/v1/platform", tags=["Platform Management"])


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


@router.get("/overview")
async def get_platform_overview(
    days: int = Query(30, ge=1, le=365, description="Number of days for analytics"),
    current_user: User = Depends(require_platform_permission("can_view_platform_analytics")),
    db: Session = Depends(get_db)
):
    """Get comprehensive platform overview and analytics"""
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Tenant Metrics
    total_tenants = db.query(Tenant).count()
    active_tenants = db.query(Tenant).filter(
        Tenant.last_activity >= start_date
    ).count()
    
    # User Metrics
    total_users = db.query(User).filter(User.is_platform_owner == False).count()
    active_users = db.query(User).filter(
        User.last_login >= start_date,
        User.is_platform_owner == False
    ).count()
    
    # Subscription Metrics
    from sqlalchemy import func
    subscription_breakdown = db.query(
        User.subscription_tier,
        func.count(User.id).label('count')
    ).filter(User.is_platform_owner == False).group_by(User.subscription_tier).all()
    
    # Revenue Metrics (estimated)
    tier_pricing = {"free": 0, "individual_pro": 19, "team": 49, "enterprise": 500}
    estimated_mrr = sum(
        tier_pricing.get(tier, 0) * count 
        for tier, count in subscription_breakdown
    )
    
    # Usage Metrics
    api_calls_today = db.query(func.sum(PlatformUsageMetric.metric_value)).filter(
        PlatformUsageMetric.metric_type == "api_calls",
        PlatformUsageMetric.recorded_at >= datetime.utcnow().date()
    ).scalar() or 0
    
    # Storage Usage
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
            "period_days": days,
            "generated_at": datetime.utcnow().isoformat()
        },
        "requested_by": current_user.email
    }


@router.get("/tenants")
async def list_all_tenants(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    subscription_tier: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(require_platform_permission("can_manage_all_tenants")),
    db: Session = Depends(get_db)
):
    """List all tenants with filtering options"""
    
    query = db.query(Tenant)
    
    if subscription_tier:
        query = query.filter(Tenant.subscription_tier == subscription_tier)
    
    if status:
        query = query.filter(Tenant.subscription_status == status)
    
    total = query.count()
    tenants = query.offset(skip).limit(limit).all()
    
    return {
        "success": True,
        "data": {
            "tenants": [
                {
                    "id": tenant.id,
                    "name": tenant.name,
                    "slug": tenant.slug,
                    "subscription_tier": tenant.subscription_tier,
                    "subscription_status": tenant.subscription_status,
                    "current_users": tenant.current_users,
                    "max_users": tenant.max_users,
                    "current_storage_gb": tenant.current_storage_gb,
                    "max_storage_gb": tenant.max_storage_gb,
                    "created_at": tenant.created_at,
                    "last_activity": tenant.last_activity
                }
                for tenant in tenants
            ],
            "total": total,
            "skip": skip,
            "limit": limit
        }
    }


@router.get("/tenants/{tenant_id}")
async def get_tenant_details(
    tenant_id: int,
    current_user: User = Depends(require_platform_permission("can_view_platform_analytics")),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific tenant"""
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Get tenant users
    tenant_users = db.query(User).filter(User.tenant_id == tenant_id).all()
    
    # Get recent analytics summary
    recent_summary = db.query(PlatformTenantAnalyticsSummary).filter(
        PlatformTenantAnalyticsSummary.tenant_id == tenant_id
    ).order_by(PlatformTenantAnalyticsSummary.summary_date.desc()).first()
    
    return {
        "success": True,
        "data": {
            "tenant_info": {
                "id": tenant.id,
                "name": tenant.name,
                "slug": tenant.slug,
                "subscription_tier": tenant.subscription_tier,
                "subscription_status": tenant.subscription_status,
                "created_at": tenant.created_at,
                "last_activity": tenant.last_activity,
                "admin_email": tenant.admin_email,
                "admin_name": tenant.admin_name
            },
            "usage_metrics": {
                "current_users": tenant.current_users,
                "max_users": tenant.max_users,
                "user_utilization": (tenant.current_users / tenant.max_users * 100) if tenant.max_users > 0 else 0,
                "current_storage_gb": tenant.current_storage_gb,
                "max_storage_gb": tenant.max_storage_gb,
                "storage_utilization": (tenant.current_storage_gb / tenant.max_storage_gb * 100) if tenant.max_storage_gb > 0 else 0,
                "current_api_calls": tenant.current_api_calls_monthly,
                "max_api_calls": tenant.max_api_calls_monthly,
                "api_utilization": (tenant.current_api_calls_monthly / tenant.max_api_calls_monthly * 100) if tenant.max_api_calls_monthly > 0 else 0
            },
            "users": [
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "subscription_tier": user.subscription_tier,
                    "last_login": user.last_login,
                    "created_at": user.created_at
                }
                for user in tenant_users
            ],
            "analytics_summary": {
                "total_users": recent_summary.total_users if recent_summary else 0,
                "active_users_daily": recent_summary.active_users_daily if recent_summary else 0,
                "monthly_revenue": recent_summary.monthly_revenue if recent_summary else 0,
                "feature_adoption_rate": recent_summary.feature_adoption_rate if recent_summary else 0,
                "summary_date": recent_summary.summary_date if recent_summary else None
            }
        }
    }


@router.post("/tenants")
async def create_tenant(
    tenant_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(require_platform_permission("can_create_tenants")),
    db: Session = Depends(get_db)
):
    """Create a new tenant organization"""
    
    # Validate required fields
    required_fields = ["name", "slug", "admin_email", "admin_name"]
    for field in required_fields:
        if field not in tenant_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Check if tenant slug is unique
    existing = db.query(Tenant).filter(Tenant.slug == tenant_data["slug"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tenant slug already exists")
    
    # Get tier limits
    def get_tier_limits(tier: str) -> Dict[str, int]:
        limits = {
            "free": {"max_users": 1, "max_storage_gb": 1, "max_api_calls_monthly": 1000},
            "team": {"max_users": 10, "max_storage_gb": 10, "max_api_calls_monthly": 10000},
            "enterprise": {"max_users": 100, "max_storage_gb": 100, "max_api_calls_monthly": 100000}
        }
        return limits.get(tier, limits["free"])
    
    subscription_tier = tenant_data.get("subscription_tier", "free")
    limits = get_tier_limits(subscription_tier)
    
    tenant = Tenant(
        name=tenant_data["name"],
        slug=tenant_data["slug"],
        domain=tenant_data.get("domain", f"{tenant_data['slug']}.digame.com"),
        subdomain=tenant_data["slug"],
        subscription_tier=subscription_tier,
        subscription_status="active",
        admin_email=tenant_data["admin_email"],
        admin_name=tenant_data["admin_name"],
        created_by=current_user.id,
        managed_by=current_user.id,
        max_users=limits["max_users"],
        max_storage_gb=limits["max_storage_gb"],
        max_api_calls_monthly=limits["max_api_calls_monthly"]
    )
    
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    
    # Record creation metric
    usage_metric = PlatformUsageMetric(
        metric_type="tenant_management",
        metric_category="platform_admin",
        metric_name="tenant_created",
        metric_value=1,
        subscription_tier=subscription_tier,
        user_id=current_user.id
    )
    db.add(usage_metric)
    db.commit()
    
    return {
        "success": True,
        "data": {
            "id": tenant.id,
            "name": tenant.name,
            "slug": tenant.slug,
            "subscription_tier": tenant.subscription_tier,
            "created_at": tenant.created_at
        },
        "message": f"Tenant '{tenant.name}' created successfully"
    }


@router.put("/tenants/{tenant_id}/subscription")
async def update_tenant_subscription(
    tenant_id: int,
    subscription_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(require_platform_permission("can_manage_all_tenants")),
    db: Session = Depends(get_db)
):
    """Update tenant subscription tier and limits"""
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    old_tier = tenant.subscription_tier
    
    # Update subscription
    if "subscription_tier" in subscription_data:
        tenant.subscription_tier = subscription_data["subscription_tier"]
    
    if "subscription_status" in subscription_data:
        tenant.subscription_status = subscription_data["subscription_status"]
    
    if "subscription_expires" in subscription_data:
        tenant.subscription_expires = datetime.fromisoformat(subscription_data["subscription_expires"])
    
    # Update limits based on new tier
    def get_tier_limits(tier: str) -> Dict[str, int]:
        limits = {
            "free": {"max_users": 1, "max_storage_gb": 1, "max_api_calls_monthly": 1000},
            "team": {"max_users": 10, "max_storage_gb": 10, "max_api_calls_monthly": 10000},
            "enterprise": {"max_users": 100, "max_storage_gb": 100, "max_api_calls_monthly": 100000}
        }
        return limits.get(tier, limits["free"])
    
    if "subscription_tier" in subscription_data:
        limits = get_tier_limits(subscription_data["subscription_tier"])
        tenant.max_users = limits["max_users"]
        tenant.max_storage_gb = limits["max_storage_gb"]
        tenant.max_api_calls_monthly = limits["max_api_calls_monthly"]
    
    db.commit()
    
    # Record subscription change
    usage_metric = PlatformUsageMetric(
        metric_type="subscription_management",
        metric_category="platform_admin",
        metric_name="tier_changed",
        metric_value=1,
        tenant_id=tenant_id,
        user_id=current_user.id
    )
    db.add(usage_metric)
    db.commit()
    
    return {
        "success": True,
        "data": {
            "id": tenant.id,
            "name": tenant.name,
            "old_tier": old_tier,
            "new_tier": tenant.subscription_tier,
            "subscription_status": tenant.subscription_status,
            "max_users": tenant.max_users,
            "max_storage_gb": tenant.max_storage_gb,
            "max_api_calls_monthly": tenant.max_api_calls_monthly
        },
        "message": f"Tenant subscription updated from {old_tier} to {tenant.subscription_tier}"
    }


@router.get("/users")
async def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    subscription_tier: Optional[str] = Query(None),
    tenant_id: Optional[int] = Query(None),
    current_user: User = Depends(require_platform_permission("can_manage_platform_users")),
    db: Session = Depends(get_db)
):
    """List all platform users with filtering"""
    
    query = db.query(User).filter(User.is_platform_owner == False)
    
    if subscription_tier:
        query = query.filter(User.subscription_tier == subscription_tier)
    
    if tenant_id:
        query = query.filter(User.tenant_id == tenant_id)
    
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    
    return {
        "success": True,
        "data": {
            "users": [
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "subscription_tier": user.subscription_tier,
                    "subscription_status": user.subscription_status,
                    "tenant_id": user.tenant_id,
                    "last_login": user.last_login,
                    "created_at": user.created_at,
                    "is_active": user.is_active
                }
                for user in users
            ],
            "total": total,
            "skip": skip,
            "limit": limit
        }
    }


@router.get("/health")
async def get_platform_health(
    current_user: User = Depends(require_platform_permission("can_view_platform_analytics")),
    db: Session = Depends(get_db)
):
    """Get platform health metrics and status"""
    
    # Get recent health metrics
    health_metrics = db.query(PlatformHealthMetric).filter(
        PlatformHealthMetric.measured_at >= datetime.utcnow() - timedelta(hours=1)
    ).all()
    
    # Calculate overall health score
    if health_metrics:
        critical_count = sum(1 for m in health_metrics if m.status == "critical")
        warning_count = sum(1 for m in health_metrics if m.status == "warning")
        healthy_count = sum(1 for m in health_metrics if m.status == "healthy")
        
        total_metrics = len(health_metrics)
        health_score = (healthy_count / total_metrics * 100) if total_metrics > 0 else 100
        
        overall_status = "healthy"
        if critical_count > 0:
            overall_status = "critical"
        elif warning_count > 0:
            overall_status = "warning"
    else:
        # No metrics available, assume healthy
        health_score = 100
        overall_status = "healthy"
        critical_count = warning_count = healthy_count = 0
        total_metrics = 0
    
    return {
        "success": True,
        "data": {
            "overall_status": overall_status,
            "health_score": health_score,
            "metrics_summary": {
                "healthy": healthy_count,
                "warning": warning_count,
                "critical": critical_count,
                "total": total_metrics
            },
            "detailed_metrics": [
                {
                    "metric_name": metric.metric_name,
                    "current_value": metric.current_value,
                    "status": metric.status,
                    "service_name": metric.service_name,
                    "measured_at": metric.measured_at
                }
                for metric in health_metrics
            ],
            "last_updated": datetime.utcnow().isoformat()
        }
    }


@router.get("/analytics/revenue")
async def get_revenue_analytics(
    period: str = Query("30d", regex="^(1d|7d|30d|90d|1y)$"),
    current_user: User = Depends(require_platform_permission("can_view_platform_analytics")),
    db: Session = Depends(get_db)
):
    """Get detailed revenue analytics and projections"""
    
    # Parse period
    period_days = {"1d": 1, "7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
    
    # Current MRR by tier
    from sqlalchemy import func, case
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
    
    return {
        "success": True,
        "data": {
            "summary": {
                "total_mrr": total_mrr,
                "total_subscribers": total_subscribers,
                "average_revenue_per_user": total_mrr / total_subscribers if total_subscribers > 0 else 0
            },
            "mrr_by_tier": [
                {
                    "tier": tier.subscription_tier,
                    "subscribers": tier.subscribers,
                    "mrr": float(tier.mrr or 0)
                }
                for tier in mrr_by_tier
            ],
            "period": period,
            "generated_at": datetime.utcnow().isoformat()
        }
    }