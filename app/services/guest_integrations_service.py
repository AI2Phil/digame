"""
Guest Integrations Service
Phase 4: External Integrations and Mobile-Responsive Features
"""

import json
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import httpx
import logging

from ..models.user import User
from ..models.guest_onboarding import GuestOnboardingProgress, DigitalTwinProfile

logger = logging.getLogger(__name__)


class GuestIntegrationsService:
    """Service for managing external integrations and mobile-responsive features"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def sync_user_data_to_external_platforms(self, user_id: int) -> Dict[str, Any]:
        """
        Sync user data to external platforms and services
        
        Features:
        - CRM integration (HubSpot, Salesforce)
        - Email marketing platforms (Mailchimp, SendGrid)
        - Analytics platforms (Google Analytics, Mixpanel)
        - Social media platforms
        """
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"success": False, "error": "User not found"}
            
            profile = self.db.query(DigitalTwinProfile).filter(
                DigitalTwinProfile.user_id == user_id
            ).first()
            
            sync_results = {}
            
            # CRM Integration
            crm_result = await self._sync_to_crm(user, profile)
            sync_results["crm"] = crm_result
            
            # Email Marketing Integration
            email_result = await self._sync_to_email_platform(user, profile)
            sync_results["email_marketing"] = email_result
            
            # Analytics Integration
            analytics_result = await self._sync_to_analytics(user, profile)
            sync_results["analytics"] = analytics_result
            
            # Social Media Integration
            social_result = await self._sync_to_social_platforms(user, profile)
            sync_results["social_media"] = social_result
            
            return {
                "success": True,
                "user_id": user_id,
                "sync_results": sync_results,
                "synced_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to sync user data: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _sync_to_crm(self, user: User, profile: Optional[DigitalTwinProfile]) -> Dict[str, Any]:
        """Sync user data to CRM platforms"""
        try:
            # Simulate CRM API call
            crm_data = {
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "user_type": "guest" if user.is_guest else "full",
                "registration_date": user.created_at.isoformat(),
                "email_verified": user.email_verified,
                "profile_completeness": profile.profile_completeness_score if profile else 0,
                "skills": profile.technical_skills if profile else [],
                "goals": profile.short_term_goals if profile else [],
                "personality_type": profile.personality_type if profile else None
            }
            
            # Simulate API call delay
            await asyncio.sleep(0.1)
            
            return {
                "platform": "HubSpot",
                "status": "success",
                "contact_id": f"hubspot_{user.id}",
                "data_synced": crm_data,
                "synced_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "platform": "HubSpot",
                "status": "error",
                "error": str(e)
            }
    
    async def _sync_to_email_platform(self, user: User, profile: Optional[DigitalTwinProfile]) -> Dict[str, Any]:
        """Sync user data to email marketing platforms"""
        try:
            # Determine email segments based on user data
            segments = []
            if user.is_guest:
                segments.append("guest_users")
            if user.email_verified:
                segments.append("verified_users")
            if profile and profile.profile_completeness_score > 80:
                segments.append("high_engagement")
            
            email_data = {
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "segments": segments,
                "custom_fields": {
                    "registration_date": user.created_at.isoformat(),
                    "user_type": "guest" if user.is_guest else "full",
                    "profile_score": profile.profile_completeness_score if profile else 0,
                    "onboarding_completed": profile.profile_completeness_score >= 100 if profile else False
                }
            }
            
            # Simulate API call
            await asyncio.sleep(0.1)
            
            return {
                "platform": "Mailchimp",
                "status": "success",
                "subscriber_id": f"mailchimp_{user.id}",
                "segments": segments,
                "data_synced": email_data,
                "synced_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "platform": "Mailchimp",
                "status": "error",
                "error": str(e)
            }
    
    async def _sync_to_analytics(self, user: User, profile: Optional[DigitalTwinProfile]) -> Dict[str, Any]:
        """Sync user events to analytics platforms"""
        try:
            # Create analytics events
            events = [
                {
                    "event": "user_registered",
                    "user_id": str(user.id),
                    "timestamp": user.created_at.isoformat(),
                    "properties": {
                        "user_type": "guest" if user.is_guest else "full",
                        "email_verified": user.email_verified
                    }
                }
            ]
            
            if profile:
                events.append({
                    "event": "profile_created",
                    "user_id": str(user.id),
                    "timestamp": profile.created_at.isoformat(),
                    "properties": {
                        "completeness_score": str(profile.profile_completeness_score),
                        "personality_type": profile.personality_type or "",
                        "skills_count": str(len(profile.technical_skills) if profile.technical_skills else 0)
                    }
                })
            
            # Simulate API call
            await asyncio.sleep(0.1)
            
            return {
                "platform": "Google Analytics",
                "status": "success",
                "events_sent": len(events),
                "events": events,
                "synced_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "platform": "Google Analytics",
                "status": "error",
                "error": str(e)
            }
    
    async def _sync_to_social_platforms(self, user: User, profile: Optional[DigitalTwinProfile]) -> Dict[str, Any]:
        """Sync user data to social media platforms for lookalike audiences"""
        try:
            # Create social media audience data
            audience_data = {
                "email_hash": f"hash_{user.email}",  # In real implementation, use proper hashing
                "user_attributes": {
                    "registration_date": user.created_at.isoformat(),
                    "user_type": "guest" if user.is_guest else "full",
                    "engagement_level": "high" if profile and profile.profile_completeness_score > 70 else "medium"
                }
            }
            
            # Simulate API call
            await asyncio.sleep(0.1)
            
            return {
                "platform": "Facebook Ads",
                "status": "success",
                "audience_id": f"fb_audience_{user.id}",
                "data_synced": audience_data,
                "synced_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "platform": "Facebook Ads",
                "status": "error",
                "error": str(e)
            }
    
    async def get_mobile_optimized_onboarding_flow(self, user_id: int) -> Dict[str, Any]:
        """
        Get mobile-optimized onboarding flow configuration
        
        Features:
        - Responsive step layouts
        - Touch-friendly interactions
        - Progressive disclosure
        - Offline capability indicators
        """
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"success": False, "error": "User not found"}
            
            progress = self.db.query(GuestOnboardingProgress).filter(
                GuestOnboardingProgress.user_id == user_id
            ).first()
            
            mobile_config = {
                "flow_id": f"mobile_onboarding_{user_id}",
                "user_id": user_id,
                "responsive_breakpoints": {
                    "mobile": "max-width: 768px",
                    "tablet": "max-width: 1024px",
                    "desktop": "min-width: 1025px"
                },
                "steps": self._get_mobile_optimized_steps(progress),
                "ui_config": {
                    "touch_targets": {
                        "min_size": "44px",
                        "spacing": "8px"
                    },
                    "typography": {
                        "mobile_scale": 0.9,
                        "line_height": 1.6
                    },
                    "navigation": {
                        "type": "bottom_tabs",
                        "sticky_progress": True
                    },
                    "animations": {
                        "enabled": True,
                        "duration": "300ms",
                        "easing": "ease-in-out"
                    }
                },
                "offline_support": {
                    "enabled": True,
                    "cache_duration": "24h",
                    "sync_on_reconnect": True
                },
                "accessibility": {
                    "screen_reader_support": True,
                    "high_contrast_mode": True,
                    "keyboard_navigation": True
                }
            }
            
            return {
                "success": True,
                "mobile_config": mobile_config,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get mobile onboarding config: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _get_mobile_optimized_steps(self, progress: Optional[GuestOnboardingProgress]) -> List[Dict[str, Any]]:
        """Get mobile-optimized onboarding steps"""
        base_steps = [
            {
                "id": 1,
                "name": "profile_setup",
                "title": "Welcome!",
                "subtitle": "Let's get started",
                "mobile_layout": "single_column",
                "estimated_time": "2 min",
                "completed": progress.profile_setup_completed if progress else False
            },
            {
                "id": 2,
                "name": "skills_assessment",
                "title": "Your Skills",
                "subtitle": "Tell us what you know",
                "mobile_layout": "card_grid",
                "estimated_time": "3 min",
                "completed": progress.skills_assessment_completed if progress else False
            },
            {
                "id": 3,
                "name": "personality_profile",
                "title": "Personality",
                "subtitle": "Discover your type",
                "mobile_layout": "quiz_format",
                "estimated_time": "4 min",
                "completed": progress.personality_profile_completed if progress else False
            },
            {
                "id": 4,
                "name": "work_style",
                "title": "Work Style",
                "subtitle": "How do you work best?",
                "mobile_layout": "slider_inputs",
                "estimated_time": "2 min",
                "completed": progress.work_style_completed if progress else False
            },
            {
                "id": 5,
                "name": "goals_setup",
                "title": "Your Goals",
                "subtitle": "What do you want to achieve?",
                "mobile_layout": "list_selection",
                "estimated_time": "3 min",
                "completed": progress.goals_setup_completed if progress else False
            },
            {
                "id": 6,
                "name": "twin_preview",
                "title": "Your Digital Twin",
                "subtitle": "See your profile",
                "mobile_layout": "preview_card",
                "estimated_time": "1 min",
                "completed": progress.twin_preview_completed if progress else False
            }
        ]
        
        # Add mobile-specific optimizations
        for step in base_steps:
            step.update({
                "mobile_optimizations": {
                    "swipe_navigation": True,
                    "auto_save": True,
                    "progress_indicator": True,
                    "skip_option": int(step["id"]) > 2,  # Allow skipping after first 2 steps
                    "touch_feedback": True
                },
                "responsive_elements": {
                    "form_fields": {
                        "mobile_keyboard": "optimized",
                        "input_size": "large",
                        "label_position": "top"
                    },
                    "buttons": {
                        "size": "large",
                        "full_width": True,
                        "spacing": "comfortable"
                    },
                    "images": {
                        "lazy_loading": True,
                        "responsive_sizes": True,
                        "webp_support": True
                    }
                }
            })
        
        return base_steps
    
    async def track_integration_events(self, user_id: int, event_type: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Track integration-related events for analytics"""
        try:
            event_record = {
                "user_id": user_id,
                "event_type": event_type,
                "event_data": event_data,
                "timestamp": datetime.utcnow().isoformat(),
                "source": "integrations_service"
            }
            
            # In a real implementation, you would store this in a dedicated events table
            # For now, we'll simulate the tracking
            
            return {
                "success": True,
                "event_id": f"event_{user_id}_{int(datetime.utcnow().timestamp())}",
                "tracked_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to track integration event: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_integration_status(self, user_id: int) -> Dict[str, Any]:
        """Get status of all integrations for a user"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"success": False, "error": "User not found"}
            
            # Simulate checking integration statuses
            integration_status = {
                "user_id": user_id,
                "integrations": {
                    "crm": {
                        "platform": "HubSpot",
                        "status": "connected",
                        "last_sync": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                        "sync_frequency": "hourly"
                    },
                    "email_marketing": {
                        "platform": "Mailchimp",
                        "status": "connected",
                        "last_sync": (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
                        "sync_frequency": "real-time"
                    },
                    "analytics": {
                        "platform": "Google Analytics",
                        "status": "connected",
                        "last_sync": datetime.utcnow().isoformat(),
                        "sync_frequency": "real-time"
                    },
                    "social_media": {
                        "platform": "Facebook Ads",
                        "status": "connected",
                        "last_sync": (datetime.utcnow() - timedelta(hours=6)).isoformat(),
                        "sync_frequency": "daily"
                    }
                },
                "overall_health": "healthy",
                "last_updated": datetime.utcnow().isoformat()
            }
            
            return {
                "success": True,
                "data": integration_status
            }
            
        except Exception as e:
            logger.error(f"Failed to get integration status: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def configure_webhook_endpoints(self, user_id: int, webhook_config: Dict[str, Any]) -> Dict[str, Any]:
        """Configure webhook endpoints for real-time integrations"""
        try:
            # Validate webhook configuration
            required_fields = ["url", "events", "secret"]
            if not all(field in webhook_config for field in required_fields):
                return {"success": False, "error": "Missing required webhook configuration fields"}
            
            # Simulate webhook registration
            webhook_id = f"webhook_{user_id}_{int(datetime.utcnow().timestamp())}"
            
            webhook_record = {
                "webhook_id": webhook_id,
                "user_id": user_id,
                "url": webhook_config["url"],
                "events": webhook_config["events"],
                "secret": webhook_config["secret"],
                "status": "active",
                "created_at": datetime.utcnow().isoformat()
            }
            
            return {
                "success": True,
                "webhook": webhook_record,
                "message": "Webhook configured successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to configure webhook: {str(e)}")
            return {"success": False, "error": str(e)}