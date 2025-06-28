"""
ACO (Automated Customer Operations) Router

Provides endpoints for subscription management, revenue tracking,
and founding member program management.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Any
from datetime import datetime

from ..db import get_db
from ..auth.platform_decorators import require_platform_owner_level
from ..services.aco_integration_service import ACOIntegrationService
from ..models.user import User
from ..auth.jwt_handler import get_current_user_from_token

router = APIRouter(prefix="/api/v1/aco", tags=["ACO Integration"])

@router.get("/subscription/limits/check")
async def check_subscription_limits(
    action: str = Query(..., description="Action to check (create_tenant, add_user, etc.)"),
    tenant_id: Optional[int] = Query(None, description="Tenant ID for tenant-specific actions"),
    file_size_gb: Optional[float] = Query(None, description="File size in GB for storage actions"),
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    Check if user can perform an action based on their subscription tier limits
    """
    try:
        aco_service = ACOIntegrationService(db)
        
        kwargs = {}
        if tenant_id:
            kwargs['tenant_id'] = tenant_id
        if file_size_gb:
            kwargs['file_size_gb'] = file_size_gb
        
        allowed, reason = await aco_service.enforce_subscription_limits(
            current_user.id, action, **kwargs
        )
        
        return {
            "allowed": allowed,
            "reason": reason,
            "action": action,
            "user_tier": current_user.subscription_tier,
            "checked_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking subscription limits: {str(e)}")

@router.get("/revenue/metrics")
@require_platform_owner_level(1)  # Admin level required
async def get_revenue_metrics(
    period_days: int = Query(30, description="Number of days to analyze"),
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive revenue metrics for Platform Owners
    """
    try:
        aco_service = ACOIntegrationService(db)
        metrics = await aco_service.calculate_revenue_metrics(period_days)
        
        return {
            "success": True,
            "data": metrics,
            "requested_by": current_user.id,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating revenue metrics: {str(e)}")

@router.get("/subscription/analytics")
@require_platform_owner_level(1)  # Admin level required
async def get_subscription_analytics(
    days: int = Query(30, description="Number of days to analyze"),
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive subscription analytics for Platform Owners
    """
    try:
        aco_service = ACOIntegrationService(db)
        analytics = await aco_service.get_subscription_analytics(days)
        
        return {
            "success": True,
            "data": analytics,
            "requested_by": current_user.id,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting subscription analytics: {str(e)}")

@router.post("/subscription/upgrade")
async def upgrade_subscription(
    new_tier: str,
    target_user_id: Optional[int] = None,  # For Platform Owners to upgrade other users
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    Upgrade subscription tier for user or another user (if Platform Owner)
    """
    try:
        aco_service = ACOIntegrationService(db)
        
        # Determine target user
        user_to_upgrade = target_user_id if target_user_id else current_user.id
        platform_owner_initiated = target_user_id is not None
        
        # Check permissions for upgrading other users
        if platform_owner_initiated:
            if not current_user.is_platform_owner or current_user.platform_owner_level < 1:
                raise HTTPException(
                    status_code=403, 
                    detail="Only Platform Owners can upgrade other users' subscriptions"
                )
        
        result = await aco_service.upgrade_subscription_tier(
            user_to_upgrade, new_tier, platform_owner_initiated
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return {
            "success": True,
            "data": result,
            "initiated_by": current_user.id,
            "upgraded_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error upgrading subscription: {str(e)}")

@router.get("/founding-member/eligibility")
async def check_founding_member_eligibility(
    target_user_id: Optional[int] = Query(None, description="User ID to check (Platform Owners only)"),
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    Check founding member program eligibility
    """
    try:
        aco_service = ACOIntegrationService(db)
        
        # Determine target user
        user_to_check = target_user_id if target_user_id else current_user.id
        
        # Check permissions for checking other users
        if target_user_id and target_user_id != current_user.id:
            if not current_user.is_platform_owner or current_user.platform_owner_level < 1:
                raise HTTPException(
                    status_code=403, 
                    detail="Only Platform Owners can check other users' founding member eligibility"
                )
        
        result = await aco_service.manage_founding_member_program(
            'check_eligibility', user_to_check
        )
        
        return {
            "success": True,
            "data": result,
            "checked_by": current_user.id,
            "checked_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking founding member eligibility: {str(e)}")

@router.post("/founding-member/enroll")
async def enroll_founding_member(
    target_user_id: Optional[int] = None,  # For Platform Owners to enroll other users
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    Enroll user in founding member program
    """
    try:
        aco_service = ACOIntegrationService(db)
        
        # Determine target user
        user_to_enroll = target_user_id if target_user_id else current_user.id
        
        # Check permissions for enrolling other users
        if target_user_id and target_user_id != current_user.id:
            if not current_user.is_platform_owner or current_user.platform_owner_level < 2:
                raise HTTPException(
                    status_code=403, 
                    detail="Only Super Admin Platform Owners can enroll other users in founding member program"
                )
        
        result = await aco_service.manage_founding_member_program(
            'enroll', user_to_enroll
        )
        
        if not result.get('success', False):
            raise HTTPException(status_code=400, detail=result.get('error', 'Enrollment failed'))
        
        return {
            "success": True,
            "data": result,
            "enrolled_by": current_user.id,
            "enrolled_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enrolling in founding member program: {str(e)}")

@router.get("/founding-member/benefits")
async def get_founding_member_benefits(
    target_user_id: Optional[int] = Query(None, description="User ID to check (Platform Owners only)"),
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    Get founding member benefits for user
    """
    try:
        aco_service = ACOIntegrationService(db)
        
        # Determine target user
        user_to_check = target_user_id if target_user_id else current_user.id
        
        # Check permissions for checking other users
        if target_user_id and target_user_id != current_user.id:
            if not current_user.is_platform_owner or current_user.platform_owner_level < 1:
                raise HTTPException(
                    status_code=403, 
                    detail="Only Platform Owners can check other users' founding member benefits"
                )
        
        result = await aco_service.manage_founding_member_program(
            'get_benefits', user_to_check
        )
        
        return {
            "success": True,
            "data": result,
            "requested_by": current_user.id,
            "retrieved_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting founding member benefits: {str(e)}")

@router.get("/founding-member/list")
@require_platform_owner_level(1)  # Admin level required
async def list_founding_members(
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    List all founding members (Platform Owners only)
    """
    try:
        aco_service = ACOIntegrationService(db)
        result = await aco_service.manage_founding_member_program('list_members')
        
        return {
            "success": True,
            "data": result,
            "requested_by": current_user.id,
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing founding members: {str(e)}")

@router.get("/founding-member/stats")
@require_platform_owner_level(2)  # Super Admin level required
async def get_founding_member_stats(
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    Get founding member program statistics (Super Admin Platform Owners only)
    """
    try:
        aco_service = ACOIntegrationService(db)
        result = await aco_service.manage_founding_member_program('get_program_stats')
        
        return {
            "success": True,
            "data": result,
            "requested_by": current_user.id,
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting founding member stats: {str(e)}")

@router.get("/tier-limits")
async def get_tier_limits(
    tier: Optional[str] = Query(None, description="Specific tier to get limits for"),
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    Get subscription tier limits and pricing information
    """
    try:
        aco_service = ACOIntegrationService(db)
        
        if tier:
            if tier not in aco_service.tier_limits:
                raise HTTPException(status_code=404, detail=f"Tier '{tier}' not found")
            
            return {
                "success": True,
                "data": {
                    "tier": tier,
                    "limits": aco_service.tier_limits[tier],
                    "pricing": float(aco_service.tier_pricing[tier])
                },
                "requested_by": current_user.id,
                "retrieved_at": datetime.now().isoformat()
            }
        else:
            # Return all tiers
            all_tiers = {}
            for tier_name in aco_service.tier_limits.keys():
                all_tiers[tier_name] = {
                    "limits": aco_service.tier_limits[tier_name],
                    "pricing": float(aco_service.tier_pricing[tier_name])
                }
            
            return {
                "success": True,
                "data": {
                    "tiers": all_tiers,
                    "current_user_tier": current_user.subscription_tier
                },
                "requested_by": current_user.id,
                "retrieved_at": datetime.now().isoformat()
            }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting tier limits: {str(e)}")

@router.get("/health")
async def aco_health_check():
    """
    Health check endpoint for ACO integration
    """
    return {
        "status": "healthy",
        "service": "aco-integration",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "subscription_limits_enforcement",
            "revenue_analytics",
            "founding_member_program",
            "tier_management",
            "usage_tracking"
        ]
    }