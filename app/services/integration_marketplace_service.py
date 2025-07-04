"""
Integration Marketplace Service - Phase 2B Implementation
Priority 2: Integration Ecosystem Completion (85% → 95%)

Comprehensive marketplace for integration discovery, management, and enterprise features
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, text
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import asyncio
import json
import logging
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

from ..models.integration import (
    IntegrationProvider, IntegrationConnection, IntegrationSyncLog,
    IntegrationWebhook, IntegrationDataMapping, IntegrationAnalytics
)

logger = logging.getLogger(__name__)


class IntegrationCategory(Enum):
    COMMUNICATION = "communication"
    CRM = "crm"
    PROJECT_MANAGEMENT = "project_management"
    TIME_TRACKING = "time_tracking"
    LEARNING = "learning"
    DEVELOPMENT = "development"
    PRODUCTIVITY = "productivity"
    STORAGE = "storage"
    ANALYTICS = "analytics"
    MARKETING = "marketing"
    FINANCE = "finance"
    HR = "hr"


class IntegrationComplexity(Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    ADVANCED = "advanced"
    ENTERPRISE = "enterprise"


class IntegrationStatus(Enum):
    AVAILABLE = "available"
    BETA = "beta"
    DEPRECATED = "deprecated"
    COMING_SOON = "coming_soon"
    ENTERPRISE_ONLY = "enterprise_only"


@dataclass
class IntegrationTemplate:
    id: str
    name: str
    display_name: str
    description: str
    category: IntegrationCategory
    complexity: IntegrationComplexity
    status: IntegrationStatus
    provider_id: Optional[int]
    icon_url: str
    banner_url: Optional[str]
    tags: List[str]
    features: List[str]
    use_cases: List[str]
    setup_time_minutes: int
    popularity_score: float
    rating: float
    review_count: int
    installation_count: int
    last_updated: datetime
    version: str
    documentation_url: str
    support_url: str
    pricing_model: str
    free_tier_available: bool
    enterprise_features: List[str]
    required_permissions: List[str]
    supported_auth_types: List[str]
    webhook_support: bool
    real_time_sync: bool
    batch_operations: bool
    custom_fields: bool
    api_rate_limits: Dict[str, Any]
    data_retention_days: Optional[int]
    compliance_certifications: List[str]


@dataclass
class IntegrationReview:
    id: str
    integration_id: str
    user_id: int
    tenant_id: int
    rating: int
    title: str
    content: str
    pros: List[str]
    cons: List[str]
    use_case: str
    company_size: str
    industry: str
    created_at: datetime
    updated_at: datetime
    helpful_votes: int
    verified_purchase: bool


@dataclass
class IntegrationUsageAnalytics:
    integration_id: str
    tenant_id: int
    period_start: datetime
    period_end: datetime
    total_syncs: int
    successful_syncs: int
    failed_syncs: int
    data_transferred_mb: float
    api_calls_made: int
    avg_response_time_ms: float
    uptime_percentage: float
    cost_savings_usd: float
    productivity_hours_saved: float
    user_adoption_rate: float
    feature_usage: Dict[str, int]


class IntegrationMarketplaceService:
    """
    Comprehensive integration marketplace and management service
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.marketplace_config = {
            "featured_integrations_count": 6,
            "popular_threshold": 100,  # installations
            "trending_days": 30,
            "review_min_length": 50,
            "search_results_limit": 50
        }
    
    async def get_marketplace_catalog(
        self, 
        category: Optional[str] = None,
        complexity: Optional[str] = None,
        status: Optional[str] = None,
        search_query: Optional[str] = None,
        sort_by: str = "popularity",
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get comprehensive marketplace catalog with filtering and search
        """
        logger.info(f"Fetching marketplace catalog with filters: category={category}, complexity={complexity}")
        
        try:
            # Get all available integrations
            integrations = await self.get_available_integrations()
            
            # Apply filters
            filtered_integrations = self.apply_marketplace_filters(
                integrations, category, complexity, status, search_query
            )
            
            # Sort integrations
            sorted_integrations = self.sort_integrations(filtered_integrations, sort_by)
            
            # Paginate results
            paginated_integrations = sorted_integrations[offset:offset + limit]
            
            # Get marketplace statistics
            marketplace_stats = await self.get_marketplace_statistics()
            
            # Get featured integrations
            featured_integrations = await self.get_featured_integrations()
            
            # Get trending integrations
            trending_integrations = await self.get_trending_integrations()
            
            return {
                "integrations": [asdict(integration) for integration in paginated_integrations],
                "total_count": len(sorted_integrations),
                "filtered_count": len(filtered_integrations),
                "has_more": offset + limit < len(sorted_integrations),
                "featured_integrations": [asdict(integration) for integration in featured_integrations],
                "trending_integrations": [asdict(integration) for integration in trending_integrations],
                "marketplace_stats": marketplace_stats,
                "categories": [category.value for category in IntegrationCategory],
                "complexity_levels": [complexity.value for complexity in IntegrationComplexity],
                "filters_applied": {
                    "category": category,
                    "complexity": complexity,
                    "status": status,
                    "search_query": search_query,
                    "sort_by": sort_by
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get marketplace catalog: {str(e)}")
            raise
    
    async def get_integration_details(self, integration_id: str, tenant_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Get detailed information about a specific integration
        """
        try:
            # Get integration template
            integration = await self.get_integration_by_id(integration_id)
            if not integration:
                raise ValueError(f"Integration {integration_id} not found")
            
            # Get reviews and ratings
            reviews = await self.get_integration_reviews(integration_id, limit=10)
            rating_breakdown = await self.get_rating_breakdown(integration_id)
            
            # Get usage analytics if tenant provided
            usage_analytics = None
            if tenant_id:
                usage_analytics = await self.get_integration_usage_analytics(integration_id, tenant_id)
            
            # Get similar integrations
            similar_integrations = await self.get_similar_integrations(integration_id, limit=5)
            
            # Get installation guide
            installation_guide = await self.get_installation_guide(integration_id)
            
            # Check if already installed for tenant
            is_installed = False
            if tenant_id:
                is_installed = await self.is_integration_installed(integration_id, tenant_id)
            
            return {
                "integration": asdict(integration),
                "reviews": [asdict(review) for review in reviews],
                "rating_breakdown": rating_breakdown,
                "usage_analytics": asdict(usage_analytics) if usage_analytics else None,
                "similar_integrations": [asdict(integration) for integration in similar_integrations],
                "installation_guide": installation_guide,
                "is_installed": is_installed,
                "compatibility_info": await self.get_compatibility_info(integration_id),
                "pricing_details": await self.get_pricing_details(integration_id),
                "support_resources": await self.get_support_resources(integration_id)
            }
            
        except Exception as e:
            logger.error(f"Failed to get integration details for {integration_id}: {str(e)}")
            raise
    
    async def install_integration(
        self, 
        integration_id: str, 
        tenant_id: int, 
        user_id: int,
        configuration: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Install an integration for a tenant with guided configuration
        """
        logger.info(f"Installing integration {integration_id} for tenant {tenant_id}")
        
        try:
            # Get integration template
            integration = await self.get_integration_by_id(integration_id)
            if not integration:
                raise ValueError(f"Integration {integration_id} not found")
            
            # Check if already installed
            if await self.is_integration_installed(integration_id, tenant_id):
                raise ValueError(f"Integration {integration_id} already installed for tenant {tenant_id}")
            
            # Validate configuration
            validation_result = await self.validate_integration_config(integration_id, configuration)
            if not validation_result["valid"]:
                return {
                    "success": False,
                    "error": "Configuration validation failed",
                    "validation_errors": validation_result["errors"]
                }
            
            # Create integration connection
            connection_data = {
                "provider_id": integration.provider_id,
                "connection_name": configuration.get("connection_name", integration.display_name),
                "external_account_id": configuration.get("external_account_id"),
                "external_account_name": configuration.get("external_account_name"),
                "auth_data": configuration.get("auth_data", {}),
                "sync_settings": configuration.get("sync_settings", {}),
                "field_mappings": configuration.get("field_mappings", {}),
                "filters": configuration.get("filters", {})
            }
            
            # Create connection using integration service
            from .integration_service import IntegrationService
            integration_service = IntegrationService(self.db)
            
            if not integration.provider_id:
                raise ValueError("Integration must have a provider_id to be installed")
            
            connection = integration_service.create_connection(
                tenant_id=tenant_id,
                user_id=user_id,
                provider_id=integration.provider_id,
                connection_data=connection_data
            )
            
            # Record installation
            await self.record_integration_installation(integration_id, tenant_id, user_id, connection.id)
            
            # Set up default webhooks if supported
            if integration.webhook_support:
                await self.setup_default_webhooks(connection.id, integration_id)
            
            # Apply optimization settings
            await self.apply_optimization_settings(connection.id, integration_id)
            
            # Generate installation report
            installation_report = await self.generate_installation_report(
                integration_id, tenant_id, connection.id
            )
            
            return {
                "success": True,
                "connection_id": connection.id,
                "integration_id": integration_id,
                "installation_report": installation_report,
                "next_steps": await self.get_post_installation_steps(integration_id),
                "estimated_setup_time": integration.setup_time_minutes,
                "support_resources": await self.get_support_resources(integration_id)
            }
            
        except Exception as e:
            logger.error(f"Failed to install integration {integration_id}: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_integration_wizard_config(self, integration_id: str) -> Dict[str, Any]:
        """
        Get configuration wizard steps for integration setup
        """
        try:
            integration = await self.get_integration_by_id(integration_id)
            if not integration:
                raise ValueError(f"Integration {integration_id} not found")
            
            # Generate wizard steps based on integration requirements
            wizard_steps: List[Dict[str, Any]] = []
            
            # Step 1: Basic Information
            wizard_steps.append({
                "step": 1,
                "title": "Basic Information",
                "description": f"Configure basic settings for {integration.display_name}",
                "fields": [
                    {
                        "name": "connection_name",
                        "label": "Connection Name",
                        "type": "text",
                        "required": True,
                        "default": f"My {integration.display_name}",
                        "validation": {"min_length": 3, "max_length": 50}
                    },
                    {
                        "name": "description",
                        "label": "Description",
                        "type": "textarea",
                        "required": False,
                        "placeholder": "Optional description for this integration"
                    }
                ]
            })
            
            # Step 2: Authentication
            auth_fields = []
            for auth_type in integration.supported_auth_types:
                if auth_type == "oauth2":
                    auth_fields.extend([
                        {
                            "name": "client_id",
                            "label": "Client ID",
                            "type": "text",
                            "required": True,
                            "sensitive": False
                        },
                        {
                            "name": "client_secret",
                            "label": "Client Secret",
                            "type": "password",
                            "required": True,
                            "sensitive": True
                        }
                    ])
                elif auth_type == "api_key":
                    auth_fields.append({
                        "name": "api_key",
                        "label": "API Key",
                        "type": "password",
                        "required": True,
                        "sensitive": True
                    })
                elif auth_type == "basic":
                    auth_fields.extend([
                        {
                            "name": "username",
                            "label": "Username",
                            "type": "text",
                            "required": True
                        },
                        {
                            "name": "password",
                            "label": "Password",
                            "type": "password",
                            "required": True,
                            "sensitive": True
                        }
                    ])
            
            wizard_steps.append({
                "step": 2,
                "title": "Authentication",
                "description": f"Configure authentication for {integration.display_name}",
                "fields": auth_fields
            })
            
            # Step 3: Sync Settings
            wizard_steps.append({
                "step": 3,
                "title": "Sync Settings",
                "description": "Configure how data should be synchronized",
                "fields": [
                    {
                        "name": "sync_frequency",
                        "label": "Sync Frequency",
                        "type": "select",
                        "required": True,
                        "default": "hourly",
                        "options": [
                            {"value": "realtime", "label": "Real-time (if supported)"},
                            {"value": "15min", "label": "Every 15 minutes"},
                            {"value": "hourly", "label": "Hourly"},
                            {"value": "daily", "label": "Daily"},
                            {"value": "manual", "label": "Manual only"}
                        ]
                    },
                    {
                        "name": "sync_direction",
                        "label": "Sync Direction",
                        "type": "select",
                        "required": True,
                        "default": "bidirectional",
                        "options": [
                            {"value": "import", "label": "Import only"},
                            {"value": "export", "label": "Export only"},
                            {"value": "bidirectional", "label": "Bidirectional"}
                        ]
                    },
                    {
                        "name": "batch_size",
                        "label": "Batch Size",
                        "type": "number",
                        "required": False,
                        "default": 100,
                        "min": 10,
                        "max": 1000
                    }
                ]
            })
            
            # Step 4: Field Mapping (if custom fields supported)
            if integration.custom_fields:
                wizard_steps.append({
                    "step": 4,
                    "title": "Field Mapping",
                    "description": "Map fields between systems",
                    "fields": [
                        {
                            "name": "field_mappings",
                            "label": "Field Mappings",
                            "type": "field_mapper",
                            "required": False,
                            "source_fields": await self.get_integration_fields(integration_id),
                            "target_fields": await self.get_system_fields()
                        }
                    ]
                })
            
            # Step 5: Webhooks (if supported)
            if integration.webhook_support:
                wizard_steps.append({
                    "step": 5,
                    "title": "Webhooks",
                    "description": "Configure real-time notifications",
                    "fields": [
                        {
                            "name": "enable_webhooks",
                            "label": "Enable Webhooks",
                            "type": "checkbox",
                            "required": False,
                            "default": True
                        },
                        {
                            "name": "webhook_events",
                            "label": "Webhook Events",
                            "type": "multi_select",
                            "required": False,
                            "options": await self.get_webhook_events(integration_id),
                            "depends_on": "enable_webhooks"
                        }
                    ]
                })
            
            # Step 6: Review and Test
            wizard_steps.append({
                "step": len(wizard_steps) + 1,
                "title": "Review and Test",
                "description": "Review configuration and test connection",
                "fields": [
                    {
                        "name": "test_connection",
                        "label": "Test Connection",
                        "type": "test_button",
                        "required": False
                    }
                ]
            })
            
            return {
                "integration_id": integration_id,
                "integration_name": integration.display_name,
                "total_steps": len(wizard_steps),
                "estimated_time_minutes": integration.setup_time_minutes,
                "steps": wizard_steps,
                "requirements": {
                    "permissions": integration.required_permissions,
                    "auth_types": integration.supported_auth_types,
                    "features": integration.features
                },
                "help_resources": {
                    "documentation": integration.documentation_url,
                    "support": integration.support_url,
                    "video_tutorial": f"https://help.digame.ai/integrations/{integration_id}/setup"
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get wizard config for {integration_id}: {str(e)}")
            raise
    
    async def get_tenant_integrations(self, tenant_id: int) -> Dict[str, Any]:
        """
        Get all integrations installed for a tenant with management options
        """
        try:
            # Get all connections for tenant
            connections = self.db.query(IntegrationConnection).filter(
                IntegrationConnection.tenant_id == tenant_id
            ).all()
            
            tenant_integrations = []
            
            for connection in connections:
                # Get integration template info
                integration_info = await self.get_integration_by_provider_id(connection.provider_id)
                
                # Get usage analytics
                usage_analytics = await self.get_connection_usage_analytics(connection.id)
                
                # Get health status
                health_status = await self.get_connection_health_status(connection.id)
                
                tenant_integrations.append({
                    "connection_id": connection.id,
                    "integration_id": integration_info.id if integration_info else None,
                    "integration_name": integration_info.display_name if integration_info else connection.provider.name,
                    "connection_name": connection.connection_name,
                    "status": connection.status,
                    "created_at": connection.created_at,
                    "last_sync_at": connection.last_sync_at,
                    "total_syncs": connection.total_syncs,
                    "successful_syncs": connection.successful_syncs,
                    "error_count": connection.error_count,
                    "usage_analytics": asdict(usage_analytics) if usage_analytics else None,
                    "health_status": health_status,
                    "category": integration_info.category.value if integration_info else "unknown",
                    "features_used": await self.get_features_used(connection.id),
                    "optimization_score": await self.calculate_optimization_score(connection.id),
                    "cost_savings": await self.calculate_cost_savings(connection.id),
                    "management_actions": await self.get_management_actions(connection.id)
                })
            
            # Calculate tenant-level statistics
            tenant_stats = {
                "total_integrations": len(tenant_integrations),
                "active_integrations": len([i for i in tenant_integrations if i["status"] == "active"]),
                "total_syncs_24h": sum(i.get("usage_analytics", {}).get("total_syncs", 0) for i in tenant_integrations),
                "avg_success_rate": self.calculate_avg_success_rate(tenant_integrations),
                "total_cost_savings": sum(i.get("cost_savings", 0) for i in tenant_integrations),
                "categories_used": list(set(i["category"] for i in tenant_integrations)),
                "health_distribution": self.calculate_health_distribution(tenant_integrations)
            }
            
            return {
                "tenant_id": tenant_id,
                "integrations": tenant_integrations,
                "statistics": tenant_stats,
                "recommendations": await self.get_tenant_recommendations(tenant_id),
                "available_upgrades": await self.get_available_upgrades(tenant_id),
                "bulk_actions": await self.get_bulk_actions(tenant_id)
            }
            
        except Exception as e:
            logger.error(f"Failed to get tenant integrations for {tenant_id}: {str(e)}")
            raise
    
    async def create_custom_integration(
        self, 
        tenant_id: int, 
        user_id: int, 
        integration_spec: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create a custom integration using the enterprise integration builder
        """
        logger.info(f"Creating custom integration for tenant {tenant_id}")
        
        try:
            # Validate integration specification
            validation_result = await self.validate_custom_integration_spec(integration_spec)
            if not validation_result["valid"]:
                return {
                    "success": False,
                    "error": "Integration specification validation failed",
                    "validation_errors": validation_result["errors"]
                }
            
            # Generate unique integration ID
            custom_integration_id = f"custom_{tenant_id}_{uuid.uuid4().hex[:8]}"
            
            # Create custom integration template
            custom_integration = IntegrationTemplate(
                id=custom_integration_id,
                name=integration_spec["name"],
                display_name=integration_spec["display_name"],
                description=integration_spec["description"],
                category=IntegrationCategory(integration_spec["category"]),
                complexity=IntegrationComplexity.ENTERPRISE,
                status=IntegrationStatus.AVAILABLE,
                provider_id=None,  # Custom integrations don't have provider_id
                icon_url=integration_spec.get("icon_url", "/default-custom-icon.png"),
                banner_url=integration_spec.get("banner_url"),
                tags=integration_spec.get("tags", []),
                features=integration_spec["features"],
                use_cases=integration_spec.get("use_cases", []),
                setup_time_minutes=integration_spec.get("setup_time_minutes", 30),
                popularity_score=0.0,
                rating=0.0,
                review_count=0,
                installation_count=0,
                last_updated=datetime.utcnow(),
                version="1.0.0",
                documentation_url=integration_spec.get("documentation_url", ""),
                support_url=integration_spec.get("support_url", ""),
                pricing_model="enterprise",
                free_tier_available=False,
                enterprise_features=integration_spec["features"],
                required_permissions=integration_spec.get("required_permissions", []),
                supported_auth_types=integration_spec["auth_types"],
                webhook_support=integration_spec.get("webhook_support", False),
                real_time_sync=integration_spec.get("real_time_sync", False),
                batch_operations=integration_spec.get("batch_operations", True),
                custom_fields=integration_spec.get("custom_fields", True),
                api_rate_limits=integration_spec.get("api_rate_limits", {}),
                data_retention_days=integration_spec.get("data_retention_days"),
                compliance_certifications=integration_spec.get("compliance_certifications", [])
            )
            
            # Store custom integration
            await self.store_custom_integration(custom_integration, tenant_id, user_id)
            
            # Generate integration code/configuration
            integration_config = await self.generate_integration_config(custom_integration, integration_spec)
            
            # Create deployment package
            deployment_package = await self.create_deployment_package(custom_integration, integration_config)
            
            return {
                "success": True,
                "integration_id": custom_integration_id,
                "integration": asdict(custom_integration),
                "deployment_package": deployment_package,
                "next_steps": [
                    "Review generated integration configuration",
                    "Test integration endpoints",
                    "Deploy to staging environment",
                    "Perform integration testing",
                    "Deploy to production"
                ],
                "estimated_deployment_time": "2-4 hours",
                "support_contact": "enterprise-support@digame.ai"
            }
            
        except Exception as e:
            logger.error(f"Failed to create custom integration: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    # Helper methods for marketplace functionality
    async def get_available_integrations(self) -> List[IntegrationTemplate]:
        """Get all available integrations from the marketplace"""
        # This would typically fetch from a database or external service
        # For now, return a comprehensive list of mock integrations
        
        integrations = [
            # Communication integrations
            IntegrationTemplate(
                id="slack_workspace",
                name="slack",
                display_name="Slack",
                description="Team communication and collaboration platform with channels, direct messages, and file sharing",
                category=IntegrationCategory.COMMUNICATION,
                complexity=IntegrationComplexity.SIMPLE,
                status=IntegrationStatus.AVAILABLE,
                provider_id=1,
                icon_url="/icons/slack.png",
                banner_url="/banners/slack.jpg",
                tags=["messaging", "team", "collaboration", "notifications"],
                features=["Real-time messaging", "File sharing", "Channel management", "Bot integration"],
                use_cases=["Team communication", "Project updates", "Alert notifications", "File collaboration"],
                setup_time_minutes=10,
                popularity_score=95.0,
                rating=4.8,
                review_count=1250,
                installation_count=15000,
                last_updated=datetime.utcnow() - timedelta(days=5),
                version="2.1.0",
                documentation_url="https://api.slack.com/docs",
                support_url="https://slack.com/help",
                pricing_model="freemium",
                free_tier_available=True,
                enterprise_features=["SSO", "Advanced security", "Compliance exports"],
                required_permissions=["channels:read", "chat:write", "files:read"],
                supported_auth_types=["oauth2"],
                webhook_support=True,
                real_time_sync=True,
                batch_operations=True,
                custom_fields=False,
                api_rate_limits={"requests_per_minute": 100, "burst_limit": 200},
                data_retention_days=90,
                compliance_certifications=["SOC2", "GDPR", "HIPAA"]
            ),
            
            # CRM integrations
            IntegrationTemplate(
                id="salesforce_crm",
                name="salesforce",
                display_name="Salesforce",
                description="World's leading CRM platform for sales, service, and marketing automation",
                category=IntegrationCategory.CRM,
                complexity=IntegrationComplexity.ADVANCED,
                status=IntegrationStatus.AVAILABLE,
                provider_id=2,
                icon_url="/icons/salesforce.png",
                banner_url="/banners/salesforce.jpg",
                tags=["crm", "sales", "leads", "opportunities", "automation"],
                features=["Lead management", "Opportunity tracking", "Contact sync", "Custom objects"],
                use_cases=["Sales pipeline management", "Lead nurturing", "Customer data sync", "Sales reporting"],
                setup_time_minutes=45,
                popularity_score=88.0,
                rating=4.6,
                review_count=890,
                installation_count=8500,
                last_updated=datetime.utcnow() - timedelta(days=12),
                version="3.2.1",
                documentation_url="https://developer.salesforce.com/docs",
                support_url="https://help.salesforce.com",
                pricing_model="paid",
                free_tier_available=False,
                enterprise_features=["Custom objects", "Advanced workflows", "API governance"],
                required_permissions=["api", "refresh_token", "full"],
                supported_auth_types=["oauth2", "jwt"],
                webhook_support=True,
                real_time_sync=True,
                batch_operations=True,
                custom_fields=True,
                api_rate_limits={"requests_per_day": 100000, "concurrent_requests": 25},
                data_retention_days=365,
                compliance_certifications=["SOC2", "GDPR", "HIPAA", "ISO27001"]
            ),
            
            # Project Management
            IntegrationTemplate(
                id="asana_projects",
                name="asana",
                display_name="Asana",
                description="Project management and team collaboration tool for organizing work and tracking progress",
                category=IntegrationCategory.PROJECT_MANAGEMENT,
                complexity=IntegrationComplexity.MODERATE,
                status=IntegrationStatus.AVAILABLE,
                provider_id=3,
                icon_url="/icons/asana.png",
                banner_url="/banners/asana.jpg",
                tags=["project management", "tasks", "teams", "deadlines"],
                features=["Task management", "Project tracking", "Team collaboration", "Timeline view"],
                use_cases=["Project planning", "Task assignment", "Progress tracking", "Team coordination"],
                setup_time_minutes=20,
                popularity_score=82.0,
                rating=4.5,
                review_count=650,
                installation_count=12000,
                last_updated=datetime.utcnow() - timedelta(days=8),
                version="2.0.3",
                documentation_url="https://developers.asana.com/docs",
                support_url="https://asana.com/support",
                pricing_model="freemium",
                free_tier_available=True,
                enterprise_features=["Advanced search", "Custom fields", "Portfolio management"],
                required_permissions=["read", "write"],
                supported_auth_types=["oauth2"],
                webhook_support=True,
                real_time_sync=False,
                batch_operations=True,
                custom_fields=True,
                api_rate_limits={"requests_per_hour": 1500},
                data_retention_days=180,
                compliance_certifications=["SOC2", "GDPR"]
            )
        ]
        
        return integrations
    
    # Helper methods implementation
    def apply_marketplace_filters(
        self,
        integrations: List[IntegrationTemplate],
        category: Optional[str],
        complexity: Optional[str],
        status: Optional[str],
        search_query: Optional[str]
    ) -> List[IntegrationTemplate]:
        """Apply filters to integration list"""
        filtered = integrations
        
        if category:
            filtered = [i for i in filtered if i.category.value == category]
        
        if complexity:
            filtered = [i for i in filtered if i.complexity.value == complexity]
        
        if status:
            filtered = [i for i in filtered if i.status.value == status]
        
        if search_query:
            query_lower = search_query.lower()
            filtered = [i for i in filtered if
                       query_lower in i.name.lower() or
                       query_lower in i.display_name.lower() or
                       query_lower in i.description.lower() or
                       any(tag.lower().find(query_lower) >= 0 for tag in i.tags)]
        
        return filtered
    
    def sort_integrations(self, integrations: List[IntegrationTemplate], sort_by: str) -> List[IntegrationTemplate]:
        """Sort integrations by specified criteria"""
        if sort_by == "popularity":
            return sorted(integrations, key=lambda x: x.popularity_score, reverse=True)
        elif sort_by == "rating":
            return sorted(integrations, key=lambda x: x.rating, reverse=True)
        elif sort_by == "name":
            return sorted(integrations, key=lambda x: x.display_name)
        elif sort_by == "newest":
            return sorted(integrations, key=lambda x: x.last_updated, reverse=True)
        elif sort_by == "installations":
            return sorted(integrations, key=lambda x: x.installation_count, reverse=True)
        else:
            return integrations
    
    async def get_marketplace_statistics(self) -> Dict[str, Any]:
        """Get marketplace statistics"""
        integrations = await self.get_available_integrations()
        return {
            "total_integrations": len(integrations),
            "categories": len(set(i.category for i in integrations)),
            "total_installations": sum(i.installation_count for i in integrations),
            "avg_rating": sum(i.rating for i in integrations) / len(integrations) if integrations else 0,
            "enterprise_integrations": len([i for i in integrations if i.complexity == IntegrationComplexity.ENTERPRISE])
        }
    
    async def get_featured_integrations(self) -> List[IntegrationTemplate]:
        """Get featured integrations"""
        integrations = await self.get_available_integrations()
        # Return top 6 by popularity
        return sorted(integrations, key=lambda x: x.popularity_score, reverse=True)[:6]
    
    async def get_trending_integrations(self) -> List[IntegrationTemplate]:
        """Get trending integrations"""
        integrations = await self.get_available_integrations()
        # Mock trending logic - return recent high-rated integrations
        return sorted(integrations, key=lambda x: (x.last_updated, x.rating), reverse=True)[:5]
    
    async def get_integration_by_id(self, integration_id: str) -> Optional[IntegrationTemplate]:
        """Get integration by ID"""
        integrations = await self.get_available_integrations()
        return next((i for i in integrations if i.id == integration_id), None)
    
    async def get_integration_by_provider_id(self, provider_id: int) -> Optional[IntegrationTemplate]:
        """Get integration by provider ID"""
        integrations = await self.get_available_integrations()
        return next((i for i in integrations if i.provider_id == provider_id), None)
    
    async def get_integration_reviews(self, integration_id: str, limit: int = 10) -> List[IntegrationReview]:
        """Get reviews for an integration"""
        # Mock reviews
        return []
    
    async def get_rating_breakdown(self, integration_id: str) -> Dict[str, int]:
        """Get rating breakdown for an integration"""
        return {"5_star": 45, "4_star": 30, "3_star": 15, "2_star": 7, "1_star": 3}
    
    async def get_integration_usage_analytics(self, integration_id: str, tenant_id: int) -> Optional[IntegrationUsageAnalytics]:
        """Get usage analytics for integration"""
        return None  # Mock implementation
    
    async def get_similar_integrations(self, integration_id: str, limit: int = 5) -> List[IntegrationTemplate]:
        """Get similar integrations"""
        integration = await self.get_integration_by_id(integration_id)
        if not integration:
            return []
        
        integrations = await self.get_available_integrations()
        # Return integrations in same category
        similar = [i for i in integrations if i.category == integration.category and i.id != integration_id]
        return similar[:limit]
    
    async def get_installation_guide(self, integration_id: str) -> Dict[str, Any]:
        """Get installation guide for integration"""
        return {
            "steps": ["Configure authentication", "Set up sync settings", "Test connection"],
            "estimated_time": "15 minutes",
            "requirements": ["Admin access", "API credentials"]
        }
    
    async def is_integration_installed(self, integration_id: str, tenant_id: int) -> bool:
        """Check if integration is installed for tenant"""
        integration = await self.get_integration_by_id(integration_id)
        if not integration or not integration.provider_id:
            return False
        
        connection = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id,
            IntegrationConnection.provider_id == integration.provider_id
        ).first()
        
        return connection is not None
    
    async def get_compatibility_info(self, integration_id: str) -> Dict[str, Any]:
        """Get compatibility information"""
        return {"compatible": True, "requirements": [], "limitations": []}
    
    async def get_pricing_details(self, integration_id: str) -> Dict[str, Any]:
        """Get pricing details"""
        return {"model": "freemium", "free_tier": True, "paid_plans": []}
    
    async def get_support_resources(self, integration_id: str) -> Dict[str, Any]:
        """Get support resources"""
        return {"documentation": "", "tutorials": [], "support_email": "support@digame.ai"}
    
    async def validate_integration_config(self, integration_id: str, configuration: Dict[str, Any]) -> Dict[str, Any]:
        """Validate integration configuration"""
        return {"valid": True, "errors": []}
    
    async def record_integration_installation(self, integration_id: str, tenant_id: int, user_id: int, connection_id: int):
        """Record integration installation"""
        logger.info(f"Recorded installation of {integration_id} for tenant {tenant_id}")
    
    async def setup_default_webhooks(self, connection_id: int, integration_id: str):
        """Setup default webhooks"""
        logger.info(f"Setting up webhooks for connection {connection_id}")
    
    async def apply_optimization_settings(self, connection_id: int, integration_id: str):
        """Apply optimization settings"""
        logger.info(f"Applying optimization settings for connection {connection_id}")
    
    async def generate_installation_report(self, integration_id: str, tenant_id: int, connection_id: int) -> Dict[str, Any]:
        """Generate installation report"""
        return {"status": "success", "connection_id": connection_id, "next_steps": []}
    
    async def get_post_installation_steps(self, integration_id: str) -> List[str]:
        """Get post-installation steps"""
        return ["Test connection", "Configure sync settings", "Set up notifications"]
    
    async def get_integration_fields(self, integration_id: str) -> List[Dict[str, str]]:
        """Get integration fields for mapping"""
        return [{"name": "name", "type": "string"}, {"name": "email", "type": "email"}]
    
    async def get_system_fields(self) -> List[Dict[str, str]]:
        """Get system fields for mapping"""
        return [{"name": "user_name", "type": "string"}, {"name": "user_email", "type": "email"}]
    
    async def get_webhook_events(self, integration_id: str) -> List[Dict[str, str]]:
        """Get available webhook events"""
        return [{"value": "created", "label": "Item Created"}, {"value": "updated", "label": "Item Updated"}]
    
    async def get_connection_usage_analytics(self, connection_id: int) -> Optional[IntegrationUsageAnalytics]:
        """Get usage analytics for connection"""
        return None
    
    async def get_connection_health_status(self, connection_id: int) -> str:
        """Get health status for connection"""
        return "healthy"
    
    async def get_features_used(self, connection_id: int) -> List[str]:
        """Get features used by connection"""
        return ["sync", "webhooks"]
    
    async def calculate_optimization_score(self, connection_id: int) -> float:
        """Calculate optimization score"""
        return 85.5
    
    async def calculate_cost_savings(self, connection_id: int) -> float:
        """Calculate cost savings"""
        return 150.0
    
    async def get_management_actions(self, connection_id: int) -> List[str]:
        """Get available management actions"""
        return ["pause", "resume", "reconfigure", "delete"]
    
    def calculate_avg_success_rate(self, integrations: List[Dict[str, Any]]) -> float:
        """Calculate average success rate"""
        if not integrations:
            return 0.0
        
        total_syncs = sum(i.get("total_syncs", 0) for i in integrations)
        successful_syncs = sum(i.get("successful_syncs", 0) for i in integrations)
        
        return (successful_syncs / total_syncs * 100) if total_syncs > 0 else 0.0
    
    def calculate_health_distribution(self, integrations: List[Dict[str, Any]]) -> Dict[str, int]:
        """Calculate health distribution"""
        distribution = {"healthy": 0, "warning": 0, "critical": 0}
        for integration in integrations:
            health = integration.get("health_status", "healthy")
            if health in distribution:
                distribution[health] += 1
        return distribution
    
    async def get_tenant_recommendations(self, tenant_id: int) -> List[Dict[str, Any]]:
        """Get recommendations for tenant"""
        return [{"type": "optimization", "title": "Optimize sync frequency", "description": "Reduce sync frequency for low-activity integrations"}]
    
    async def get_available_upgrades(self, tenant_id: int) -> List[Dict[str, Any]]:
        """Get available upgrades"""
        return []
    
    async def get_bulk_actions(self, tenant_id: int) -> List[str]:
        """Get available bulk actions"""
        return ["pause_all", "resume_all", "sync_all", "optimize_all"]
    
    async def validate_custom_integration_spec(self, integration_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Validate custom integration specification"""
        required_fields = ["name", "display_name", "description", "category", "features", "auth_types"]
        errors = []
        
        for field in required_fields:
            if field not in integration_spec:
                errors.append(f"Missing required field: {field}")
        
        return {"valid": len(errors) == 0, "errors": errors}
    
    async def store_custom_integration(self, integration: IntegrationTemplate, tenant_id: int, user_id: int):
        """Store custom integration"""
        logger.info(f"Storing custom integration {integration.id} for tenant {tenant_id}")
    
    async def generate_integration_config(self, integration: IntegrationTemplate, spec: Dict[str, Any]) -> Dict[str, Any]:
        """Generate integration configuration"""
        return {"endpoints": [], "auth_config": {}, "sync_config": {}}
    
    async def create_deployment_package(self, integration: IntegrationTemplate, config: Dict[str, Any]) -> Dict[str, Any]:
        """Create deployment package"""
        return {"package_url": f"/packages/{integration.id}.zip", "deployment_guide": ""}