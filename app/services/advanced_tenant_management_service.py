"""
Advanced Multi-Tenant Management Service for Enterprise Feature Completion
Implements Priority 4A: Advanced Multi-Tenant Management
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta, timezone
import json
import secrets
from collections import defaultdict

from ..services.tenant_service import TenantService
from ..services.security_service import SecurityDashboardService
from ..models.tenant import Tenant, TenantSettings, TenantAuditLog
from ..models.user import User
from ..database import get_db


class AdvancedTenantManagementService:
    """Advanced multi-tenant management with enterprise features"""
    
    def __init__(self, db: Session):
        self.db = db
        self.tenant_service = TenantService(db)
        self.security_service = SecurityDashboardService(db)
    
    # Advanced Resource Allocation and Monitoring
    
    async def get_tenant_resource_allocation(self, tenant_id: int) -> Dict[str, Any]:
        """Get comprehensive tenant resource allocation and usage"""
        try:
            tenant = self.tenant_service.get_tenant_by_id(tenant_id)
            if not tenant:
                return {"error": "Tenant not found"}
            
            # Get current usage metrics
            current_users = self.db.query(User).filter(User.tenant_id == tenant_id).count()
            active_users_30d = self.db.query(User).filter(
                User.tenant_id == tenant_id,
                User.last_login >= datetime.now(timezone.utc) - timedelta(days=30)
            ).count()
            
            # Calculate storage usage (mock implementation)
            storage_used_gb = await self._calculate_storage_usage(tenant_id)
            
            # Get API usage metrics
            api_usage = await self._get_api_usage_metrics(tenant_id)
            
            # Calculate resource utilization percentages
            user_utilization = (current_users / getattr(tenant, 'max_users', 1)) * 100 if getattr(tenant, 'max_users', 0) > 0 else 0
            storage_utilization = (storage_used_gb / getattr(tenant, 'storage_limit_gb', 1)) * 100 if getattr(tenant, 'storage_limit_gb', 0) > 0 else 0
            api_utilization = (api_usage['current_period'] / getattr(tenant, 'api_rate_limit', 1)) * 100 if getattr(tenant, 'api_rate_limit', 0) > 0 else 0
            
            # Determine resource health status
            resource_health = self._calculate_resource_health(user_utilization, storage_utilization, api_utilization)
            
            # Get cost allocation
            cost_breakdown = await self._calculate_cost_allocation(tenant_id, tenant)
            
            return {
                "tenant_id": tenant_id,
                "tenant_name": getattr(tenant, 'name', 'Unknown'),
                "subscription_tier": getattr(tenant, 'subscription_tier', 'basic'),
                "resource_limits": {
                    "max_users": getattr(tenant, 'max_users', 0),
                    "storage_limit_gb": getattr(tenant, 'storage_limit_gb', 0),
                    "api_rate_limit": getattr(tenant, 'api_rate_limit', 0)
                },
                "current_usage": {
                    "users": current_users,
                    "active_users_30d": active_users_30d,
                    "storage_used_gb": storage_used_gb,
                    "api_calls_current_period": api_usage['current_period'],
                    "api_calls_daily_avg": api_usage['daily_average']
                },
                "utilization_percentages": {
                    "users": round(float(user_utilization), 2),
                    "storage": round(float(storage_utilization), 2),
                    "api": round(float(api_utilization), 2)
                },
                "resource_health": resource_health,
                "cost_allocation": cost_breakdown,
                "recommendations": self._generate_resource_recommendations(user_utilization, storage_utilization, api_utilization),
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            return {"error": f"Failed to get resource allocation: {str(e)}"}
    
    async def _calculate_storage_usage(self, tenant_id: int) -> float:
        """Calculate storage usage for tenant (mock implementation)"""
        # In production, this would integrate with actual storage systems
        # For now, return a calculated estimate based on user activity
        user_count = self.db.query(User).filter(User.tenant_id == tenant_id).count()
        # Estimate 50MB per user on average
        return round(user_count * 0.05, 2)
    
    async def _get_api_usage_metrics(self, tenant_id: int) -> Dict[str, int]:
        """Get API usage metrics for tenant"""
        # In production, this would query actual API logs
        # For now, return estimated usage based on user activity
        active_users = self.db.query(User).filter(
            User.tenant_id == tenant_id,
            User.last_login >= datetime.now(timezone.utc) - timedelta(days=7)
        ).count()
        
        # Estimate 100 API calls per active user per day
        daily_estimate = active_users * 100
        current_period = daily_estimate * 30  # Monthly estimate
        
        return {
            "current_period": current_period,
            "daily_average": daily_estimate
        }
    
    def _calculate_resource_health(self, user_util: float, storage_util: float, api_util: float) -> Dict[str, Any]:
        """Calculate overall resource health status"""
        utilizations = [user_util, storage_util, api_util]
        max_util = max(utilizations)
        avg_util = sum(utilizations) / len(utilizations)
        
        if max_util >= 90:
            status = "critical"
            message = "Resource usage is critically high"
        elif max_util >= 75:
            status = "warning"
            message = "Resource usage is approaching limits"
        elif avg_util >= 50:
            status = "healthy"
            message = "Resource usage is within normal range"
        else:
            status = "optimal"
            message = "Resource usage is optimal"
        
        return {
            "status": status,
            "message": message,
            "overall_utilization": round(avg_util, 2),
            "highest_utilization": round(max_util, 2)
        }
    
    def _generate_resource_recommendations(self, user_util: float, storage_util: float, api_util: float) -> List[str]:
        """Generate resource optimization recommendations"""
        recommendations = []
        
        if user_util >= 80:
            recommendations.append("Consider upgrading user limit or optimizing user management")
        if storage_util >= 80:
            recommendations.append("Storage usage is high - consider data archival or storage upgrade")
        if api_util >= 80:
            recommendations.append("API usage is high - consider rate limit optimization or upgrade")
        
        if user_util < 30 and storage_util < 30 and api_util < 30:
            recommendations.append("Resources are underutilized - consider downgrading to optimize costs")
        
        if not recommendations:
            recommendations.append("Resource usage is well-balanced")
        
        return recommendations
    
    async def _calculate_cost_allocation(self, tenant_id: int, tenant: Tenant) -> Dict[str, Any]:
        """Calculate cost allocation breakdown"""
        subscription_tier = getattr(tenant, 'subscription_tier', 'basic')
        
        # Base subscription costs (mock pricing)
        base_costs = {
            "basic": 29.99,
            "professional": 99.99,
            "enterprise": 299.99
        }
        
        base_cost = base_costs.get(subscription_tier, 29.99)
        
        # Calculate usage-based costs
        current_users = self.db.query(User).filter(User.tenant_id == tenant_id).count()
        max_users = getattr(tenant, 'max_users', 10)
        
        overage_users = max(0, current_users - max_users)
        overage_cost = overage_users * 5.0  # $5 per additional user
        
        total_cost = base_cost + overage_cost
        
        return {
            "base_subscription": base_cost,
            "user_overages": overage_cost,
            "total_monthly": total_cost,
            "cost_per_user": round(total_cost / max(current_users, 1), 2),
            "currency": "USD"
        }
    
    # Advanced Tenant Analytics and Reporting
    
    async def get_tenant_analytics(self, tenant_id: int, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive tenant analytics"""
        try:
            start_date = datetime.now(timezone.utc) - timedelta(days=days)
            
            # User activity analytics
            user_analytics = await self._get_user_activity_analytics(tenant_id, start_date)
            
            # Feature usage analytics
            feature_analytics = await self._get_feature_usage_analytics(tenant_id, start_date)
            
            # Performance analytics
            performance_analytics = await self._get_performance_analytics(tenant_id, start_date)
            
            # Security analytics
            security_analytics = await self._get_security_analytics(tenant_id, start_date)
            
            # Business metrics
            business_metrics = await self._get_business_metrics(tenant_id, start_date)
            
            return {
                "tenant_id": tenant_id,
                "analysis_period": {
                    "days": days,
                    "start_date": start_date.isoformat(),
                    "end_date": datetime.now(timezone.utc).isoformat()
                },
                "user_activity": user_analytics,
                "feature_usage": feature_analytics,
                "performance": performance_analytics,
                "security": security_analytics,
                "business_metrics": business_metrics,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            return {"error": f"Failed to generate analytics: {str(e)}"}
    
    async def _get_user_activity_analytics(self, tenant_id: int, start_date: datetime) -> Dict[str, Any]:
        """Get user activity analytics"""
        total_users = self.db.query(User).filter(User.tenant_id == tenant_id).count()
        active_users = self.db.query(User).filter(
            User.tenant_id == tenant_id,
            User.last_login >= start_date
        ).count()
        
        # Calculate daily active users (mock data)
        daily_active_users = []
        for i in range(7):  # Last 7 days
            date = datetime.now(timezone.utc) - timedelta(days=i)
            # Mock calculation - in production would query actual login logs
            dau = max(1, int(active_users * (0.7 + (i * 0.05))))
            daily_active_users.append({
                "date": date.date().isoformat(),
                "active_users": dau
            })
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "activation_rate": round((active_users / max(total_users, 1)) * 100, 2),
            "daily_active_users": daily_active_users,
            "user_growth": self._calculate_user_growth(tenant_id, start_date)
        }
    
    def _calculate_user_growth(self, tenant_id: int, start_date: datetime) -> Dict[str, Any]:
        """Calculate user growth metrics"""
        # Users created in the period
        new_users = self.db.query(User).filter(
            User.tenant_id == tenant_id,
            User.created_at >= start_date
        ).count()
        
        # Total users at start of period (mock calculation)
        total_users = self.db.query(User).filter(User.tenant_id == tenant_id).count()
        users_at_start = max(1, total_users - new_users)
        
        growth_rate = (new_users / users_at_start) * 100
        
        return {
            "new_users": new_users,
            "growth_rate": round(growth_rate, 2),
            "users_at_period_start": users_at_start,
            "users_at_period_end": total_users
        }
    
    async def _get_feature_usage_analytics(self, tenant_id: int, start_date: datetime) -> Dict[str, Any]:
        """Get feature usage analytics"""
        tenant = self.tenant_service.get_tenant_by_id(tenant_id)
        if not tenant:
            return {}
        
        features = getattr(tenant, 'features', {})
        enabled_features = [k for k, v in features.items() if v is True]
        
        # Mock feature usage data - in production would query actual usage logs
        feature_usage = {}
        for feature in enabled_features:
            usage_count = secrets.randbelow(1000) + 100  # Mock usage
            feature_usage[feature] = {
                "usage_count": usage_count,
                "unique_users": min(usage_count // 10, self.db.query(User).filter(User.tenant_id == tenant_id).count()),
                "avg_usage_per_user": round(usage_count / max(1, self.db.query(User).filter(User.tenant_id == tenant_id).count()), 2)
            }
        
        return {
            "enabled_features": len(enabled_features),
            "total_features": len(features),
            "feature_adoption_rate": round((len(enabled_features) / max(len(features), 1)) * 100, 2),
            "feature_usage": feature_usage,
            "most_used_features": sorted(feature_usage.items(), key=lambda x: x[1]["usage_count"], reverse=True)[:5]
        }
    
    async def _get_performance_analytics(self, tenant_id: int, start_date: datetime) -> Dict[str, Any]:
        """Get performance analytics"""
        # Mock performance data - in production would query actual metrics
        return {
            "avg_response_time_ms": 145.7,
            "uptime_percentage": 99.8,
            "error_rate": 0.2,
            "throughput_requests_per_minute": 1250,
            "peak_concurrent_users": 45,
            "database_performance": {
                "avg_query_time_ms": 23.4,
                "slow_queries": 2,
                "connection_pool_usage": 67.3
            }
        }
    
    async def _get_security_analytics(self, tenant_id: int, start_date: datetime) -> Dict[str, Any]:
        """Get security analytics"""
        # This would integrate with the security service
        security_summary = self.security_service.get_dashboard_summary()
        
        return {
            "security_score": security_summary.get("security_score", 85),
            "active_threats": security_summary.get("active_threats", 0),
            "failed_login_attempts": security_summary.get("failed_login_attempts_today", 0),
            "mfa_adoption_rate": security_summary.get("mfa_adoption_rate", 0),
            "policy_compliance": 95.2,  # Mock data
            "security_incidents": 0
        }
    
    async def _get_business_metrics(self, tenant_id: int, start_date: datetime) -> Dict[str, Any]:
        """Get business metrics"""
        tenant = self.tenant_service.get_tenant_by_id(tenant_id)
        if not tenant:
            return {}
        
        # Calculate business value metrics
        user_count = self.db.query(User).filter(User.tenant_id == tenant_id).count()
        subscription_tier = getattr(tenant, 'subscription_tier', 'basic')
        
        # Mock ROI calculation
        monthly_cost = {"basic": 29.99, "professional": 99.99, "enterprise": 299.99}.get(subscription_tier, 29.99)
        estimated_productivity_gain = user_count * 2.5  # Hours saved per user per month
        estimated_value = estimated_productivity_gain * 25  # $25 per hour value
        roi_percentage = ((estimated_value - monthly_cost) / monthly_cost) * 100
        
        return {
            "monthly_subscription_cost": monthly_cost,
            "estimated_productivity_hours_saved": estimated_productivity_gain,
            "estimated_monthly_value": estimated_value,
            "roi_percentage": round(roi_percentage, 2),
            "cost_per_user": round(monthly_cost / max(user_count, 1), 2),
            "value_per_user": round(estimated_value / max(user_count, 1), 2)
        }
    
    # Tenant Billing and Usage Tracking
    
    async def get_tenant_billing_info(self, tenant_id: int) -> Dict[str, Any]:
        """Get comprehensive tenant billing information"""
        try:
            tenant = self.tenant_service.get_tenant_by_id(tenant_id)
            if not tenant:
                return {"error": "Tenant not found"}
            
            # Get current billing period
            billing_period = self._get_current_billing_period()
            
            # Calculate usage-based charges
            usage_charges = await self._calculate_usage_charges(tenant_id, tenant)
            
            # Get subscription details
            subscription_details = self._get_subscription_details(tenant)
            
            # Calculate total bill
            total_bill = subscription_details["base_cost"] + usage_charges["total"]
            
            # Get payment history (mock)
            payment_history = self._get_payment_history(tenant_id)
            
            # Get upcoming charges
            upcoming_charges = self._get_upcoming_charges(tenant_id, tenant)
            
            return {
                "tenant_id": tenant_id,
                "billing_period": billing_period,
                "subscription": subscription_details,
                "usage_charges": usage_charges,
                "total_current_bill": total_bill,
                "payment_history": payment_history,
                "upcoming_charges": upcoming_charges,
                "billing_status": self._get_billing_status(tenant),
                "next_billing_date": self._get_next_billing_date(tenant),
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            return {"error": f"Failed to get billing info: {str(e)}"}
    
    def _get_current_billing_period(self) -> Dict[str, Any]:
        """Get current billing period dates"""
        now = datetime.now(timezone.utc)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Calculate end of month
        if now.month == 12:
            end_of_month = start_of_month.replace(year=now.year + 1, month=1) - timedelta(days=1)
        else:
            end_of_month = start_of_month.replace(month=now.month + 1) - timedelta(days=1)
        
        return {
            "start_date": start_of_month.isoformat(),
            "end_date": end_of_month.isoformat(),
            "days_remaining": (end_of_month - now).days
        }
    
    async def _calculate_usage_charges(self, tenant_id: int, tenant: Tenant) -> Dict[str, Any]:
        """Calculate usage-based charges"""
        breakdown = []
        user_overages = 0.0
        storage_overages = 0.0
        api_overages = 0.0
        
        # User overage charges
        current_users = self.db.query(User).filter(User.tenant_id == tenant_id).count()
        max_users = getattr(tenant, 'max_users', 10)
        if current_users > max_users:
            user_overage = current_users - max_users
            user_charge = user_overage * 5.0  # $5 per additional user
            user_overages = user_charge
            breakdown.append({
                "type": "user_overage",
                "quantity": user_overage,
                "rate": 5.0,
                "amount": user_charge
            })
        
        # Storage overage charges
        storage_used = await self._calculate_storage_usage(tenant_id)
        storage_limit = getattr(tenant, 'storage_limit_gb', 5)
        if storage_used > storage_limit:
            storage_overage = storage_used - storage_limit
            storage_charge = storage_overage * 2.0  # $2 per GB
            storage_overages = storage_charge
            breakdown.append({
                "type": "storage_overage",
                "quantity": storage_overage,
                "rate": 2.0,
                "amount": storage_charge
            })
        
        # API overage charges (if applicable)
        api_usage = await self._get_api_usage_metrics(tenant_id)
        api_limit = getattr(tenant, 'api_rate_limit', 1000)
        if api_usage['current_period'] > api_limit:
            api_overage = api_usage['current_period'] - api_limit
            api_charge = (api_overage / 1000) * 10.0  # $10 per 1000 additional calls
            api_overages = api_charge
            breakdown.append({
                "type": "api_overage",
                "quantity": api_overage,
                "rate": 0.01,
                "amount": api_charge
            })
        
        total = user_overages + storage_overages + api_overages
        
        return {
            "user_overages": user_overages,
            "storage_overages": storage_overages,
            "api_overages": api_overages,
            "total": total,
            "breakdown": breakdown
        }
    
    def _get_subscription_details(self, tenant: Tenant) -> Dict[str, Any]:
        """Get subscription details"""
        subscription_tier = getattr(tenant, 'subscription_tier', 'basic')
        
        tier_details = {
            "basic": {
                "name": "Basic Plan",
                "base_cost": 29.99,
                "billing_cycle": "monthly",
                "features": ["Basic analytics", "Standard support", "5GB storage"]
            },
            "professional": {
                "name": "Professional Plan",
                "base_cost": 99.99,
                "billing_cycle": "monthly",
                "features": ["Advanced analytics", "Priority support", "50GB storage", "API access"]
            },
            "enterprise": {
                "name": "Enterprise Plan",
                "base_cost": 299.99,
                "billing_cycle": "monthly",
                "features": ["Full analytics suite", "24/7 support", "500GB storage", "Unlimited API", "SSO"]
            }
        }
        
        return tier_details.get(subscription_tier, tier_details["basic"])
    
    def _get_payment_history(self, tenant_id: int) -> List[Dict[str, Any]]:
        """Get payment history (mock implementation)"""
        # Mock payment history
        return [
            {
                "date": "2024-12-01",
                "amount": 99.99,
                "status": "paid",
                "invoice_id": "INV-2024-12-001"
            },
            {
                "date": "2024-11-01", 
                "amount": 99.99,
                "status": "paid",
                "invoice_id": "INV-2024-11-001"
            }
        ]
    
    def _get_upcoming_charges(self, tenant_id: int, tenant: Tenant) -> Dict[str, Any]:
        """Get upcoming charges (mock implementation)"""
        subscription_details = self._get_subscription_details(tenant)
        return {
            "next_billing_date": "2025-01-01",
            "estimated_amount": subscription_details["base_cost"],
            "includes_overages": False
        }
    
    def _get_billing_status(self, tenant: Tenant) -> str:
        """Get billing status"""
        # Mock implementation
        return "current"
    
    def _get_next_billing_date(self, tenant: Tenant) -> str:
        """Get next billing date"""
        # Mock implementation
        next_month = datetime.now(timezone.utc).replace(day=1) + timedelta(days=32)
        return next_month.replace(day=1).date().isoformat()


def get_advanced_tenant_management_service(db: Session) -> AdvancedTenantManagementService:
    """Dependency to get AdvancedTenantManagementService instance"""
    return AdvancedTenantManagementService(db)