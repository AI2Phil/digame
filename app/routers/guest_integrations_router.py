"""
Guest Integrations Router
Phase 4: External Integrations and Mobile-Responsive Features API
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
from datetime import datetime

from ..database import get_db
from ..services.guest_integrations_service import GuestIntegrationsService
from ..auth.auth_dependencies import get_current_user
from ..models.user import User

router = APIRouter(prefix="/api/v1/integrations", tags=["Guest Integrations"])


@router.post("/sync/{user_id}", response_model=Dict[str, Any])
async def sync_user_to_external_platforms(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sync user data to external platforms
    
    Features:
    - CRM integration (HubSpot, Salesforce)
    - Email marketing platforms (Mailchimp, SendGrid)
    - Analytics platforms (Google Analytics, Mixpanel)
    - Social media platforms
    """
    try:
        integrations_service = GuestIntegrationsService(db)
        sync_result = await integrations_service.sync_user_data_to_external_platforms(user_id)
        
        if not sync_result["success"]:
            raise HTTPException(status_code=404, detail=sync_result["error"])
        
        return {
            "success": True,
            "data": sync_result,
            "message": "User data synced to external platforms successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync user data: {str(e)}")


@router.get("/mobile-onboarding/{user_id}", response_model=Dict[str, Any])
async def get_mobile_onboarding_config(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get mobile-optimized onboarding flow configuration
    
    Features:
    - Responsive step layouts
    - Touch-friendly interactions
    - Progressive disclosure
    - Offline capability indicators
    """
    try:
        integrations_service = GuestIntegrationsService(db)
        mobile_config = await integrations_service.get_mobile_optimized_onboarding_flow(user_id)
        
        if not mobile_config["success"]:
            raise HTTPException(status_code=404, detail=mobile_config["error"])
        
        return {
            "success": True,
            "data": mobile_config,
            "message": "Mobile onboarding configuration retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get mobile config: {str(e)}")


@router.post("/track-event", response_model=Dict[str, Any])
async def track_integration_event(
    event_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Track integration-related events for analytics"""
    try:
        if "user_id" not in event_data or "event_type" not in event_data:
            raise HTTPException(status_code=400, detail="Missing required fields: user_id, event_type")
        
        integrations_service = GuestIntegrationsService(db)
        tracking_result = await integrations_service.track_integration_events(
            event_data["user_id"],
            event_data["event_type"],
            event_data.get("data", {})
        )
        
        if not tracking_result["success"]:
            raise HTTPException(status_code=500, detail=tracking_result["error"])
        
        return {
            "success": True,
            "data": tracking_result,
            "message": "Integration event tracked successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track event: {str(e)}")


@router.get("/status/{user_id}", response_model=Dict[str, Any])
async def get_integration_status(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get status of all integrations for a user"""
    try:
        integrations_service = GuestIntegrationsService(db)
        status_result = await integrations_service.get_integration_status(user_id)
        
        if not status_result["success"]:
            raise HTTPException(status_code=404, detail=status_result["error"])
        
        return {
            "success": True,
            "data": status_result["data"],
            "message": "Integration status retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get integration status: {str(e)}")


@router.post("/webhooks/configure", response_model=Dict[str, Any])
async def configure_webhook(
    webhook_config: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Configure webhook endpoints for real-time integrations"""
    try:
        if "user_id" not in webhook_config:
            raise HTTPException(status_code=400, detail="Missing required field: user_id")
        
        integrations_service = GuestIntegrationsService(db)
        webhook_result = await integrations_service.configure_webhook_endpoints(
            webhook_config["user_id"],
            webhook_config
        )
        
        if not webhook_result["success"]:
            raise HTTPException(status_code=400, detail=webhook_result["error"])
        
        return {
            "success": True,
            "data": webhook_result,
            "message": "Webhook configured successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to configure webhook: {str(e)}")


@router.get("/platforms", response_model=Dict[str, Any])
async def get_available_platforms(
    current_user: User = Depends(get_current_user)
):
    """Get list of available integration platforms"""
    try:
        platforms = {
            "crm": [
                {
                    "name": "HubSpot",
                    "description": "Customer relationship management platform",
                    "features": ["Contact management", "Lead tracking", "Sales pipeline"],
                    "status": "available"
                },
                {
                    "name": "Salesforce",
                    "description": "Enterprise CRM solution",
                    "features": ["Advanced analytics", "Custom workflows", "Enterprise security"],
                    "status": "coming_soon"
                }
            ],
            "email_marketing": [
                {
                    "name": "Mailchimp",
                    "description": "Email marketing and automation platform",
                    "features": ["Email campaigns", "Audience segmentation", "Analytics"],
                    "status": "available"
                },
                {
                    "name": "SendGrid",
                    "description": "Email delivery service",
                    "features": ["Transactional emails", "Email validation", "Analytics"],
                    "status": "available"
                }
            ],
            "analytics": [
                {
                    "name": "Google Analytics",
                    "description": "Web analytics service",
                    "features": ["User behavior tracking", "Conversion analysis", "Custom events"],
                    "status": "available"
                },
                {
                    "name": "Mixpanel",
                    "description": "Product analytics platform",
                    "features": ["Event tracking", "User journey analysis", "A/B testing"],
                    "status": "coming_soon"
                }
            ],
            "social_media": [
                {
                    "name": "Facebook Ads",
                    "description": "Social media advertising platform",
                    "features": ["Lookalike audiences", "Custom audiences", "Campaign management"],
                    "status": "available"
                },
                {
                    "name": "LinkedIn Ads",
                    "description": "Professional network advertising",
                    "features": ["Professional targeting", "Lead generation", "Account-based marketing"],
                    "status": "coming_soon"
                }
            ]
        }
        
        return {
            "success": True,
            "data": platforms,
            "message": "Available integration platforms retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get platforms: {str(e)}")


@router.get("/mobile/responsive-config", response_model=Dict[str, Any])
async def get_responsive_configuration(
    device_type: str = Query("mobile", description="Device type: mobile, tablet, desktop"),
    current_user: User = Depends(get_current_user)
):
    """Get responsive configuration for different device types"""
    try:
        responsive_configs = {
            "mobile": {
                "breakpoint": "max-width: 768px",
                "layout": {
                    "columns": 1,
                    "spacing": "16px",
                    "padding": "12px"
                },
                "typography": {
                    "scale": 0.9,
                    "line_height": 1.6,
                    "font_size_base": "14px"
                },
                "interactions": {
                    "touch_targets": "44px",
                    "swipe_enabled": True,
                    "haptic_feedback": True
                },
                "navigation": {
                    "type": "bottom_tabs",
                    "sticky_header": True,
                    "collapsible_sidebar": True
                }
            },
            "tablet": {
                "breakpoint": "max-width: 1024px",
                "layout": {
                    "columns": 2,
                    "spacing": "20px",
                    "padding": "16px"
                },
                "typography": {
                    "scale": 1.0,
                    "line_height": 1.5,
                    "font_size_base": "16px"
                },
                "interactions": {
                    "touch_targets": "40px",
                    "swipe_enabled": True,
                    "haptic_feedback": False
                },
                "navigation": {
                    "type": "side_tabs",
                    "sticky_header": True,
                    "collapsible_sidebar": False
                }
            },
            "desktop": {
                "breakpoint": "min-width: 1025px",
                "layout": {
                    "columns": 3,
                    "spacing": "24px",
                    "padding": "20px"
                },
                "typography": {
                    "scale": 1.1,
                    "line_height": 1.4,
                    "font_size_base": "16px"
                },
                "interactions": {
                    "touch_targets": "32px",
                    "swipe_enabled": False,
                    "haptic_feedback": False
                },
                "navigation": {
                    "type": "top_nav",
                    "sticky_header": False,
                    "collapsible_sidebar": False
                }
            }
        }
        
        config = responsive_configs.get(device_type, responsive_configs["mobile"])
        
        return {
            "success": True,
            "data": {
                "device_type": device_type,
                "config": config,
                "accessibility": {
                    "screen_reader_support": True,
                    "keyboard_navigation": True,
                    "high_contrast_mode": True,
                    "reduced_motion": True
                }
            },
            "message": f"Responsive configuration for {device_type} retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get responsive config: {str(e)}")


@router.get("/health", response_model=Dict[str, Any])
async def get_integrations_health():
    """Get health status of all integration services"""
    try:
        # Simulate health checks for various integration services
        health_status = {
            "overall_status": "healthy",
            "services": {
                "crm_service": {
                    "status": "healthy",
                    "response_time": "120ms",
                    "last_check": datetime.utcnow().isoformat()
                },
                "email_service": {
                    "status": "healthy",
                    "response_time": "85ms",
                    "last_check": datetime.utcnow().isoformat()
                },
                "analytics_service": {
                    "status": "healthy",
                    "response_time": "95ms",
                    "last_check": datetime.utcnow().isoformat()
                },
                "social_media_service": {
                    "status": "degraded",
                    "response_time": "450ms",
                    "last_check": datetime.utcnow().isoformat(),
                    "issues": ["High response time"]
                }
            },
            "metrics": {
                "total_syncs_today": 1247,
                "successful_syncs": 1198,
                "failed_syncs": 49,
                "success_rate": 96.1
            }
        }
        
        return {
            "success": True,
            "data": health_status,
            "message": "Integration services health status retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get health status: {str(e)}")