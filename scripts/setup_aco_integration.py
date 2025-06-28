"""
ACO Integration Setup Script

This script sets up the ACO (Automated Customer Operations) integration
including subscription tiers, founding member program, and initial data.
"""

import sys
import os
from pathlib import Path

# Add the app directory to the Python path
app_dir = Path(__file__).parent.parent / "app"
sys.path.insert(0, str(app_dir))

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from decimal import Decimal

from db import get_db
from models.user import User
from models.tenant import Tenant
from models.platform_analytics import PlatformUsageMetrics
from services.aco_integration_service import ACOIntegrationService

def setup_aco_integration():
    """
    Set up ACO integration with initial data and configuration
    """
    print("🚀 Setting up ACO Integration...")
    
    try:
        # Get database session
        db = next(get_db())
        aco_service = ACOIntegrationService(db)
        
        print("📊 Setting up subscription tiers and pricing...")
        
        # Update existing users with proper subscription tiers
        users_updated = 0
        users = db.query(User).all()
        
        for user in users:
            if not user.subscription_tier or user.subscription_tier == "":
                user.subscription_tier = "free"
                users_updated += 1
            
            # Set subscription_updated_at if not set
            if not user.subscription_updated_at:
                user.subscription_updated_at = user.created_at or datetime.now()
        
        db.commit()
        print(f"✅ Updated {users_updated} users with default subscription tiers")
        
        # Set up Platform Owners with appropriate tiers
        platform_owners = db.query(User).filter(User.is_platform_owner == True).all()
        po_updated = 0
        
        for po in platform_owners:
            if po.subscription_tier in ['free', 'basic', 'professional']:
                po.subscription_tier = 'platform_owner'
                po.subscription_updated_at = datetime.now()
                po_updated += 1
        
        db.commit()
        print(f"✅ Updated {po_updated} Platform Owners with platform_owner tier")
        
        # Set up tenant ownership
        tenants_updated = 0
        tenants = db.query(Tenant).all()
        
        for tenant in tenants:
            if not tenant.owner_id:
                # Find the first admin user for this tenant or create ownership
                admin_user = db.query(User).filter(
                    User.tenant_id == tenant.id,
                    User.is_active == True
                ).first()
                
                if admin_user:
                    tenant.owner_id = admin_user.id
                    tenants_updated += 1
        
        db.commit()
        print(f"✅ Set up ownership for {tenants_updated} tenants")
        
        # Create sample usage metrics for demonstration
        print("📈 Creating sample usage metrics...")
        
        sample_metrics = []
        for user in users[:5]:  # First 5 users
            # API call metrics
            for i in range(10):
                metric = PlatformUsageMetrics(
                    user_id=user.id,
                    tenant_id=user.tenant_id,
                    metric_type='api_call',
                    metric_value=1,
                    metric_metadata={'endpoint': '/api/v1/analytics', 'method': 'GET'},
                    timestamp=datetime.now() - timedelta(days=i)
                )
                sample_metrics.append(metric)
        
        db.add_all(sample_metrics)
        db.commit()
        print(f"✅ Created {len(sample_metrics)} sample usage metrics")
        
        # Set up founding member eligibility for early users
        print("🏆 Setting up founding member program...")
        
        early_users = db.query(User).filter(
            User.created_at < datetime(2025, 12, 31),
            User.is_active == True,
            User.subscription_tier != 'free'
        ).limit(10).all()
        
        founding_members_enrolled = 0
        for user in early_users:
            if not user.is_founding_member:
                result = await aco_service.manage_founding_member_program('enroll', user.id)
                if result.get('success'):
                    founding_members_enrolled += 1
        
        print(f"✅ Enrolled {founding_members_enrolled} users in founding member program")
        
        # Generate initial revenue metrics
        print("💰 Calculating initial revenue metrics...")
        
        revenue_metrics = await aco_service.calculate_revenue_metrics(30)
        print(f"✅ Total MRR: ${revenue_metrics['total_mrr']}")
        print(f"✅ Total Subscribers: {revenue_metrics['total_subscribers']}")
        print(f"✅ Growth Rate: {revenue_metrics['growth_rate']:.1f}%")
        
        # Display subscription analytics
        print("📊 Generating subscription analytics...")
        
        subscription_analytics = await aco_service.get_subscription_analytics(30)
        tier_distribution = subscription_analytics['tier_distribution']
        
        print("✅ Subscription Tier Distribution:")
        for tier, count in tier_distribution.items():
            print(f"   - {tier.title()}: {count} users")
        
        # Display tier limits and pricing
        print("💳 Subscription Tier Configuration:")
        for tier, limits in aco_service.tier_limits.items():
            price = aco_service.tier_pricing[tier]
            print(f"   - {tier.title()}: ${price}/month")
            print(f"     Max Tenants: {limits['max_tenants'] if limits['max_tenants'] != -1 else 'Unlimited'}")
            print(f"     Max Users per Tenant: {limits['max_users_per_tenant'] if limits['max_users_per_tenant'] != -1 else 'Unlimited'}")
            print(f"     Storage: {limits['max_storage_gb'] if limits['max_storage_gb'] != -1 else 'Unlimited'} GB")
            print(f"     API Calls: {limits['max_api_calls_per_month'] if limits['max_api_calls_per_month'] != -1 else 'Unlimited'}/month")
            print()
        
        db.close()
        
        print("🎉 ACO Integration setup completed successfully!")
        print("\n📋 Summary:")
        print(f"   - Updated {users_updated} users with subscription tiers")
        print(f"   - Updated {po_updated} Platform Owners")
        print(f"   - Set up {tenants_updated} tenant ownerships")
        print(f"   - Created {len(sample_metrics)} usage metrics")
        print(f"   - Enrolled {founding_members_enrolled} founding members")
        print(f"   - Total MRR: ${revenue_metrics['total_mrr']}")
        
        print("\n🔗 Available ACO Endpoints:")
        print("   - GET /api/v1/aco/subscription/limits/check")
        print("   - GET /api/v1/aco/revenue/metrics")
        print("   - GET /api/v1/aco/subscription/analytics")
        print("   - POST /api/v1/aco/subscription/upgrade")
        print("   - GET /api/v1/aco/founding-member/eligibility")
        print("   - POST /api/v1/aco/founding-member/enroll")
        print("   - GET /api/v1/aco/founding-member/benefits")
        print("   - GET /api/v1/aco/founding-member/list")
        print("   - GET /api/v1/aco/founding-member/stats")
        print("   - GET /api/v1/aco/tier-limits")
        print("   - GET /api/v1/aco/health")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up ACO integration: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Main setup function"""
    success = setup_aco_integration()
    if success:
        print("\n✅ ACO Integration is ready for use!")
        print("🚀 You can now use subscription management, revenue tracking, and founding member features.")
    else:
        print("\n❌ ACO Integration setup failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())