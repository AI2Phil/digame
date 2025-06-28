"""
ACO (Automated Customer Operations) Integration Service

This service handles subscription tier enforcement, revenue tracking,
and founding member program capabilities for the Platform Owner ecosystem.
"""

from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
import logging

from ..models.user import User
from ..models.tenant import Tenant
from ..models.platform_analytics import PlatformUsageMetrics, PlatformHealthMetric
from ..models.platform_roles import PlatformRole
from ..services.platform_auth_service import PlatformAuthService

logger = logging.getLogger(__name__)

class ACOIntegrationService:
    """
    Automated Customer Operations Integration Service
    
    Handles subscription management, revenue tracking, and automated
    customer lifecycle operations for the Platform Owner ecosystem.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.platform_auth = PlatformAuthService(db)
        
        # Subscription tier pricing (monthly)
        self.tier_pricing = {
            'free': Decimal('0.00'),
            'basic': Decimal('29.99'),
            'professional': Decimal('99.99'),
            'enterprise': Decimal('299.99'),
            'platform_owner': Decimal('999.99')
        }
        
        # Feature limits by tier
        self.tier_limits = {
            'free': {
                'max_tenants': 1,
                'max_users_per_tenant': 5,
                'max_storage_gb': 1,
                'max_api_calls_per_month': 1000,
                'advanced_analytics': False,
                'priority_support': False,
                'custom_integrations': False
            },
            'basic': {
                'max_tenants': 3,
                'max_users_per_tenant': 25,
                'max_storage_gb': 10,
                'max_api_calls_per_month': 10000,
                'advanced_analytics': True,
                'priority_support': False,
                'custom_integrations': False
            },
            'professional': {
                'max_tenants': 10,
                'max_users_per_tenant': 100,
                'max_storage_gb': 100,
                'max_api_calls_per_month': 100000,
                'advanced_analytics': True,
                'priority_support': True,
                'custom_integrations': True
            },
            'enterprise': {
                'max_tenants': 50,
                'max_users_per_tenant': 500,
                'max_storage_gb': 1000,
                'max_api_calls_per_month': 1000000,
                'advanced_analytics': True,
                'priority_support': True,
                'custom_integrations': True
            },
            'platform_owner': {
                'max_tenants': -1,  # Unlimited
                'max_users_per_tenant': -1,  # Unlimited
                'max_storage_gb': -1,  # Unlimited
                'max_api_calls_per_month': -1,  # Unlimited
                'advanced_analytics': True,
                'priority_support': True,
                'custom_integrations': True
            }
        }

    async def enforce_subscription_limits(self, user_id: int, action: str, **kwargs) -> Tuple[bool, Optional[str]]:
        """
        Enforce subscription tier limits for user actions
        
        Args:
            user_id: User performing the action
            action: Action being performed (create_tenant, add_user, etc.)
            **kwargs: Additional parameters for the action
            
        Returns:
            Tuple of (allowed: bool, reason: Optional[str])
        """
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return False, "User not found"
            
            tier = user.subscription_tier or 'free'
            limits = self.tier_limits.get(tier, self.tier_limits['free'])
            
            if action == 'create_tenant':
                return await self._check_tenant_limit(user, limits)
            elif action == 'add_user_to_tenant':
                tenant_id = kwargs.get('tenant_id')
                return await self._check_user_limit(user, tenant_id, limits)
            elif action == 'upload_file':
                file_size_gb = kwargs.get('file_size_gb', 0)
                return await self._check_storage_limit(user, file_size_gb, limits)
            elif action == 'api_call':
                return await self._check_api_limit(user, limits)
            elif action == 'access_advanced_analytics':
                return limits['advanced_analytics'], None if limits['advanced_analytics'] else "Advanced analytics not available in your tier"
            elif action == 'request_priority_support':
                return limits['priority_support'], None if limits['priority_support'] else "Priority support not available in your tier"
            elif action == 'create_custom_integration':
                return limits['custom_integrations'], None if limits['custom_integrations'] else "Custom integrations not available in your tier"
            
            return True, None
            
        except Exception as e:
            logger.error(f"Error enforcing subscription limits: {e}")
            return False, "Internal error checking subscription limits"

    async def _check_tenant_limit(self, user: User, limits: Dict) -> Tuple[bool, Optional[str]]:
        """Check if user can create more tenants"""
        max_tenants = limits['max_tenants']
        if max_tenants == -1:  # Unlimited
            return True, None
            
        current_tenants = self.db.query(func.count(Tenant.id)).filter(
            Tenant.owner_id == user.id
        ).scalar()
        
        if current_tenants >= max_tenants:
            return False, f"Tenant limit reached ({current_tenants}/{max_tenants}). Upgrade your subscription to create more tenants."
        
        return True, None

    async def _check_user_limit(self, user: User, tenant_id: int, limits: Dict) -> Tuple[bool, Optional[str]]:
        """Check if tenant can add more users"""
        max_users = limits['max_users_per_tenant']
        if max_users == -1:  # Unlimited
            return True, None
            
        # Count users in the specific tenant
        current_users = self.db.query(func.count(User.id)).filter(
            User.tenant_id == tenant_id
        ).scalar()
        
        if current_users >= max_users:
            return False, f"User limit reached for this tenant ({current_users}/{max_users}). Upgrade your subscription to add more users."
        
        return True, None

    async def _check_storage_limit(self, user: User, file_size_gb: float, limits: Dict) -> Tuple[bool, Optional[str]]:
        """Check if user can upload more files"""
        max_storage = limits['max_storage_gb']
        if max_storage == -1:  # Unlimited
            return True, None
            
        # Get current storage usage for user's tenants
        user_tenants = self.db.query(Tenant).filter(Tenant.owner_id == user.id).all()
        current_storage = sum(tenant.storage_used_gb or 0 for tenant in user_tenants)
        
        if current_storage + file_size_gb > max_storage:
            return False, f"Storage limit exceeded ({current_storage + file_size_gb:.2f}/{max_storage} GB). Upgrade your subscription for more storage."
        
        return True, None

    async def _check_api_limit(self, user: User, limits: Dict) -> Tuple[bool, Optional[str]]:
        """Check if user has API calls remaining this month"""
        max_calls = limits['max_api_calls_per_month']
        if max_calls == -1:  # Unlimited
            return True, None
            
        # Get current month's API usage
        start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        current_calls = self.db.query(func.count(PlatformUsageMetrics.id)).filter(
            PlatformUsageMetrics.user_id == user.id,
            PlatformUsageMetrics.timestamp >= start_of_month,
            PlatformUsageMetrics.metric_type == 'api_call'
        ).scalar()
        
        if current_calls >= max_calls:
            return False, f"API call limit reached ({current_calls}/{max_calls} this month). Upgrade your subscription for more API calls."
        
        return True, None

    async def calculate_revenue_metrics(self, period_days: int = 30) -> Dict[str, Any]:
        """
        Calculate comprehensive revenue metrics for the platform
        
        Args:
            period_days: Number of days to analyze
            
        Returns:
            Dictionary containing revenue analytics
        """
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=period_days)
            
            # Get all active subscriptions
            active_users = self.db.query(User).filter(
                and_(
                    User.subscription_tier.isnot(None),
                    User.subscription_tier != 'free',
                    User.is_active == True
                )
            ).all()
            
            # Calculate MRR by tier
            mrr_by_tier = {}
            total_mrr = Decimal('0.00')
            
            for tier, price in self.tier_pricing.items():
                if tier == 'free':
                    continue
                    
                tier_users = [u for u in active_users if u.subscription_tier == tier]
                tier_mrr = price * len(tier_users)
                mrr_by_tier[tier] = {
                    'tier': tier,
                    'subscribers': len(tier_users),
                    'mrr': float(tier_mrr),
                    'price_per_user': float(price)
                }
                total_mrr += tier_mrr
            
            # Calculate growth metrics
            previous_period_start = start_date - timedelta(days=period_days)
            previous_active_users = self.db.query(func.count(User.id)).filter(
                and_(
                    User.subscription_tier.isnot(None),
                    User.subscription_tier != 'free',
                    User.is_active == True,
                    User.created_at < start_date,
                    User.created_at >= previous_period_start
                )
            ).scalar()
            
            current_active_users = len(active_users)
            growth_rate = 0.0
            if previous_active_users > 0:
                growth_rate = ((current_active_users - previous_active_users) / previous_active_users) * 100
            
            # Calculate churn rate
            churned_users = self.db.query(func.count(User.id)).filter(
                and_(
                    User.subscription_tier.isnot(None),
                    User.subscription_tier != 'free',
                    User.is_active == False,
                    User.updated_at >= start_date
                )
            ).scalar()
            
            churn_rate = 0.0
            if current_active_users > 0:
                churn_rate = (churned_users / current_active_users) * 100
            
            # Calculate LTV (simplified)
            avg_monthly_revenue = total_mrr / max(current_active_users, 1)
            avg_customer_lifespan_months = 12  # Assumption
            ltv = float(avg_monthly_revenue * avg_customer_lifespan_months)
            
            return {
                'total_mrr': float(total_mrr),
                'mrr_by_tier': list(mrr_by_tier.values()),
                'total_subscribers': current_active_users,
                'growth_rate': growth_rate,
                'churn_rate': churn_rate,
                'ltv': ltv,
                'period_days': period_days,
                'calculated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating revenue metrics: {e}")
            return {
                'total_mrr': 0.0,
                'mrr_by_tier': [],
                'total_subscribers': 0,
                'growth_rate': 0.0,
                'churn_rate': 0.0,
                'ltv': 0.0,
                'period_days': period_days,
                'calculated_at': datetime.now().isoformat(),
                'error': str(e)
            }

    async def manage_founding_member_program(self, action: str, user_id: Optional[int] = None, **kwargs) -> Dict[str, Any]:
        """
        Manage the founding member program for early Platform Owner adopters
        
        Args:
            action: Action to perform (enroll, check_eligibility, get_benefits, etc.)
            user_id: User ID for user-specific actions
            **kwargs: Additional parameters
            
        Returns:
            Dictionary containing action results
        """
        try:
            if action == 'check_eligibility':
                return await self._check_founding_member_eligibility(user_id)
            elif action == 'enroll':
                return await self._enroll_founding_member(user_id)
            elif action == 'get_benefits':
                return await self._get_founding_member_benefits(user_id)
            elif action == 'list_members':
                return await self._list_founding_members()
            elif action == 'get_program_stats':
                return await self._get_founding_member_stats()
            
            return {'success': False, 'error': f'Unknown action: {action}'}
            
        except Exception as e:
            logger.error(f"Error managing founding member program: {e}")
            return {'success': False, 'error': str(e)}

    async def _check_founding_member_eligibility(self, user_id: int) -> Dict[str, Any]:
        """Check if user is eligible for founding member program"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {'eligible': False, 'reason': 'User not found'}
        
        # Eligibility criteria
        criteria = {
            'early_adopter': user.created_at < datetime(2025, 12, 31),  # Before end of 2025
            'platform_owner': user.is_platform_owner,
            'active_subscription': user.subscription_tier not in [None, 'free'],
            'good_standing': user.is_active and not user.account_locked
        }
        
        eligible = all(criteria.values())
        
        return {
            'eligible': eligible,
            'criteria': criteria,
            'user_id': user_id,
            'checked_at': datetime.now().isoformat()
        }

    async def _enroll_founding_member(self, user_id: int) -> Dict[str, Any]:
        """Enroll user in founding member program"""
        eligibility = await self._check_founding_member_eligibility(user_id)
        if not eligibility['eligible']:
            return {'success': False, 'error': 'User not eligible for founding member program'}
        
        user = self.db.query(User).filter(User.id == user_id).first()
        
        # Add founding member flag and benefits
        user.is_founding_member = True
        user.founding_member_enrolled_at = datetime.now()
        
        # Apply founding member benefits (50% discount for life)
        if user.subscription_tier in self.tier_pricing:
            original_price = self.tier_pricing[user.subscription_tier]
            user.founding_member_discount_percent = 50
            user.founding_member_monthly_price = float(original_price * Decimal('0.5'))
        
        self.db.commit()
        
        return {
            'success': True,
            'user_id': user_id,
            'enrolled_at': user.founding_member_enrolled_at.isoformat(),
            'discount_percent': user.founding_member_discount_percent,
            'monthly_price': user.founding_member_monthly_price
        }

    async def _get_founding_member_benefits(self, user_id: int) -> Dict[str, Any]:
        """Get founding member benefits for user"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_founding_member:
            return {'is_founding_member': False}
        
        benefits = {
            'is_founding_member': True,
            'enrolled_at': user.founding_member_enrolled_at.isoformat() if user.founding_member_enrolled_at else None,
            'discount_percent': user.founding_member_discount_percent or 0,
            'monthly_price': user.founding_member_monthly_price or 0,
            'lifetime_benefits': [
                '50% discount on all subscription tiers',
                'Priority customer support',
                'Early access to new features',
                'Founding member badge and recognition',
                'Exclusive founding member community access',
                'Direct feedback channel to product team'
            ],
            'savings_per_month': 0
        }
        
        if user.subscription_tier in self.tier_pricing:
            original_price = float(self.tier_pricing[user.subscription_tier])
            discounted_price = user.founding_member_monthly_price or 0
            benefits['savings_per_month'] = original_price - discounted_price
        
        return benefits

    async def _list_founding_members(self) -> Dict[str, Any]:
        """List all founding members"""
        founding_members = self.db.query(User).filter(
            User.is_founding_member == True
        ).order_by(User.founding_member_enrolled_at).all()
        
        members_data = []
        for member in founding_members:
            members_data.append({
                'user_id': member.id,
                'email': member.email,
                'subscription_tier': member.subscription_tier,
                'enrolled_at': member.founding_member_enrolled_at.isoformat() if member.founding_member_enrolled_at else None,
                'discount_percent': member.founding_member_discount_percent or 0,
                'monthly_price': member.founding_member_monthly_price or 0
            })
        
        return {
            'total_founding_members': len(members_data),
            'members': members_data,
            'retrieved_at': datetime.now().isoformat()
        }

    async def _get_founding_member_stats(self) -> Dict[str, Any]:
        """Get founding member program statistics"""
        total_members = self.db.query(func.count(User.id)).filter(
            User.is_founding_member == True
        ).scalar()
        
        total_revenue_impact = self.db.query(
            func.sum(User.founding_member_monthly_price)
        ).filter(
            User.is_founding_member == True,
            User.is_active == True
        ).scalar() or 0
        
        # Calculate potential full-price revenue
        founding_members = self.db.query(User).filter(
            User.is_founding_member == True,
            User.is_active == True
        ).all()
        
        potential_revenue = 0
        for member in founding_members:
            if member.subscription_tier in self.tier_pricing:
                potential_revenue += float(self.tier_pricing[member.subscription_tier])
        
        discount_impact = potential_revenue - float(total_revenue_impact)
        
        return {
            'total_founding_members': total_members,
            'active_founding_members': len(founding_members),
            'monthly_revenue_from_founding_members': float(total_revenue_impact),
            'monthly_discount_impact': discount_impact,
            'average_discount_per_member': discount_impact / max(len(founding_members), 1),
            'program_stats_calculated_at': datetime.now().isoformat()
        }

    async def upgrade_subscription_tier(self, user_id: int, new_tier: str, platform_owner_initiated: bool = False) -> Dict[str, Any]:
        """
        Upgrade user's subscription tier with ACO automation
        
        Args:
            user_id: User to upgrade
            new_tier: Target subscription tier
            platform_owner_initiated: Whether upgrade was initiated by Platform Owner
            
        Returns:
            Dictionary containing upgrade results
        """
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return {'success': False, 'error': 'User not found'}
            
            if new_tier not in self.tier_pricing:
                return {'success': False, 'error': f'Invalid subscription tier: {new_tier}'}
            
            old_tier = user.subscription_tier or 'free'
            old_price = self.tier_pricing.get(old_tier, Decimal('0.00'))
            new_price = self.tier_pricing[new_tier]
            
            # Apply founding member discount if applicable
            final_price = new_price
            if user.is_founding_member and user.founding_member_discount_percent:
                discount_multiplier = Decimal('1.0') - (Decimal(user.founding_member_discount_percent) / Decimal('100'))
                final_price = new_price * discount_multiplier
                user.founding_member_monthly_price = float(final_price)
            
            # Update user subscription
            user.subscription_tier = new_tier
            user.subscription_updated_at = datetime.now()
            
            # Log the upgrade for analytics
            self._log_subscription_change(user_id, old_tier, new_tier, platform_owner_initiated)
            
            self.db.commit()
            
            return {
                'success': True,
                'user_id': user_id,
                'old_tier': old_tier,
                'new_tier': new_tier,
                'old_price': float(old_price),
                'new_price': float(new_price),
                'final_price': float(final_price),
                'is_founding_member': user.is_founding_member,
                'platform_owner_initiated': platform_owner_initiated,
                'upgraded_at': user.subscription_updated_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error upgrading subscription tier: {e}")
            return {'success': False, 'error': str(e)}

    def _log_subscription_change(self, user_id: int, old_tier: str, new_tier: str, platform_owner_initiated: bool):
        """Log subscription change for analytics"""
        try:
            # Create usage metric for subscription change
            metric = PlatformUsageMetrics(
                user_id=user_id,
                metric_type='subscription_change',
                metric_value=1,
                metric_metadata={
                    'old_tier': old_tier,
                    'new_tier': new_tier,
                    'platform_owner_initiated': platform_owner_initiated,
                    'change_type': 'upgrade' if self.tier_pricing[new_tier] > self.tier_pricing.get(old_tier, Decimal('0.00')) else 'downgrade'
                },
                timestamp=datetime.now()
            )
            self.db.add(metric)
            
        except Exception as e:
            logger.error(f"Error logging subscription change: {e}")

    async def get_subscription_analytics(self, days: int = 30) -> Dict[str, Any]:
        """
        Get comprehensive subscription analytics for Platform Owners
        
        Args:
            days: Number of days to analyze
            
        Returns:
            Dictionary containing subscription analytics
        """
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Get subscription distribution
            tier_distribution = {}
            for tier in self.tier_pricing.keys():
                count = self.db.query(func.count(User.id)).filter(
                    User.subscription_tier == tier,
                    User.is_active == True
                ).scalar()
                tier_distribution[tier] = count
            
            # Get subscription changes in period
            subscription_changes = self.db.query(PlatformUsageMetrics).filter(
                PlatformUsageMetrics.metric_type == 'subscription_change',
                PlatformUsageMetrics.timestamp >= start_date
            ).all()
            
            upgrades = len([c for c in subscription_changes if c.metric_metadata and c.metric_metadata.get('change_type') == 'upgrade'])
            downgrades = len([c for c in subscription_changes if c.metric_metadata and c.metric_metadata.get('change_type') == 'downgrade'])
            
            # Calculate revenue metrics
            revenue_metrics = await self.calculate_revenue_metrics(days)
            
            # Get founding member metrics
            founding_member_stats = await self._get_founding_member_stats()
            
            return {
                'period_days': days,
                'tier_distribution': tier_distribution,
                'subscription_changes': {
                    'total_changes': len(subscription_changes),
                    'upgrades': upgrades,
                    'downgrades': downgrades,
                    'net_upgrades': upgrades - downgrades
                },
                'revenue_metrics': revenue_metrics,
                'founding_member_stats': founding_member_stats,
                'calculated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting subscription analytics: {e}")
            return {
                'error': str(e),
                'calculated_at': datetime.now().isoformat()
            }