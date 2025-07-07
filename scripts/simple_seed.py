"""
Simple Analytics Data Seeding Script
Populates database with basic test data for Phase 1 testing
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import SessionLocal, engine

def seed_basic_data():
    """Seed basic data using raw SQL to avoid model mismatches"""
    print("Starting basic data seeding...")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Insert tenants directly
        print("Seeding tenants...")
        tenants_data = [
            {'name': 'Acme Corporation', 'slug': 'acme-corp', 'domain': 'acme-corp.digame.com', 'subdomain': 'acme-corp', 'subscription_tier': 'enterprise', 'admin_email': 'admin@acme-corp.com', 'admin_name': 'John Smith', 'max_users': 100, 'is_active': True, 'is_trial': False},
            {'name': 'TechStart Inc', 'slug': 'techstart', 'domain': 'techstart.digame.com', 'subdomain': 'techstart', 'subscription_tier': 'team', 'admin_email': 'admin@techstart.com', 'admin_name': 'Sarah Johnson', 'max_users': 10, 'is_active': True, 'is_trial': False},
            {'name': 'Solo Freelancer', 'slug': 'solo-freelancer', 'domain': 'solo-freelancer.digame.com', 'subdomain': 'solo-freelancer', 'subscription_tier': 'individual_pro', 'admin_email': 'freelancer@example.com', 'admin_name': 'Mike Wilson', 'max_users': 1, 'is_active': True, 'is_trial': True}
        ]
        
        tenant_sql = """
        INSERT INTO tenants (name, slug, domain, subdomain, subscription_tier, admin_email, admin_name, max_users, is_active, is_trial)
        VALUES (:name, :slug, :domain, :subdomain, :subscription_tier, :admin_email, :admin_name, :max_users, :is_active, :is_trial)
        """
        
        for tenant_data in tenants_data:
            db.execute(text(tenant_sql), tenant_data)
        
        # Insert users directly
        print("Seeding users...")
        users_data = [
            {'username': 'john_smith', 'email': 'john@acme-corp.com', 'hashed_password': 'hashed_password_here', 'first_name': 'John', 'last_name': 'Smith', 'tenant_id': 1, 'subscription_tier': 'enterprise'},
            {'username': 'jane_doe', 'email': 'jane@acme-corp.com', 'hashed_password': 'hashed_password_here', 'first_name': 'Jane', 'last_name': 'Doe', 'tenant_id': 1, 'subscription_tier': 'enterprise'},
            {'username': 'bob_wilson', 'email': 'bob@acme-corp.com', 'hashed_password': 'hashed_password_here', 'first_name': 'Bob', 'last_name': 'Wilson', 'tenant_id': 1, 'subscription_tier': 'enterprise'},
            {'username': 'sarah_johnson', 'email': 'sarah@techstart.com', 'hashed_password': 'hashed_password_here', 'first_name': 'Sarah', 'last_name': 'Johnson', 'tenant_id': 2, 'subscription_tier': 'team'},
            {'username': 'mike_brown', 'email': 'mike@techstart.com', 'hashed_password': 'hashed_password_here', 'first_name': 'Mike', 'last_name': 'Brown', 'tenant_id': 2, 'subscription_tier': 'team'},
            {'username': 'freelancer', 'email': 'freelancer@example.com', 'hashed_password': 'hashed_password_here', 'first_name': 'Mike', 'last_name': 'Wilson', 'tenant_id': 3, 'subscription_tier': 'individual_pro'},
        ]
        
        user_sql = """
        INSERT INTO users (username, email, hashed_password, first_name, last_name, tenant_id, subscription_tier)
        VALUES (:username, :email, :hashed_password, :first_name, :last_name, :tenant_id, :subscription_tier)
        """
        
        for user_data in users_data:
            db.execute(text(user_sql), user_data)
        
        # Insert platform usage metrics
        print("Seeding platform usage metrics...")
        usage_sql = """
        INSERT INTO platform_usage_metrics (metric_type, metric_category, metric_name, metric_value, tenant_id, user_id, feature_name, recorded_at)
        VALUES (:metric_type, :metric_category, :metric_name, :metric_value, :tenant_id, :user_id, :feature_name, :recorded_at)
        """
        
        features = ['Dashboard Overview', 'Analytics Reports', 'User Management', 'Security Monitoring']
        metric_types = ['feature_usage', 'api_calls', 'page_views', 'user_activity']
        
        # Generate 100 sample metrics
        for i in range(100):
            date = datetime.utcnow() - timedelta(days=random.randint(0, 30))
            metric_data = {
                'metric_type': random.choice(metric_types),
                'metric_category': 'user_engagement',
                'metric_name': f"{random.choice(metric_types)}_count",
                'metric_value': random.uniform(1, 100),
                'tenant_id': random.randint(1, 3),
                'user_id': random.randint(1, 6),
                'feature_name': random.choice(features),
                'recorded_at': date
            }
            db.execute(text(usage_sql), metric_data)
        
        db.commit()
        # Insert digital activities for testing ProductivityMetricCard
        print("Seeding digital activities...")
        activity_sql = """
        INSERT INTO digital_activities (user_id, activity_type, timestamp, details)
        VALUES (:user_id, :activity_type, :timestamp, :details)
        """
        
        activity_types = [
            'email_check', 'document_edit', 'meeting_join', 'code_review',
            'task_complete', 'research', 'planning', 'communication',
            'file_upload', 'data_analysis', 'report_generation', 'testing'
        ]
        
        # Generate activities for the last 7 days for users 1-3
        from datetime import datetime, timedelta
        import json
        
        for user_id in range(1, 4):  # Users 1, 2, 3
            for day_offset in range(7):  # Last 7 days
                target_date = datetime.utcnow() - timedelta(days=day_offset)
                
                # Generate 3-8 activities per day per user
                import random
                daily_activities = random.randint(3, 8)
                
                for activity_num in range(daily_activities):
                    # Spread activities throughout the day
                    hour = random.randint(8, 18)  # 8 AM to 6 PM
                    minute = random.randint(0, 59)
                    
                    activity_time = target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                    activity_type = random.choice(activity_types)
                    
                    # Create some details for the activity
                    details = {
                        "duration_minutes": random.randint(5, 120),
                        "productivity_score": round(random.uniform(0.3, 1.0), 2),
                        "focus_level": random.choice(["low", "medium", "high"]),
                        "context": f"User {user_id} {activity_type} activity"
                    }
                    
                    activity_data = {
                        'user_id': user_id,
                        'activity_type': activity_type,
                        'timestamp': activity_time,
                        'details': json.dumps(details)
                    }
                    
                    db.execute(text(activity_sql), activity_data)
        
        db.commit()
        print("✅ Basic data seeding completed successfully!")
        print("Created:")
        print("- 3 tenants")
        print("- 6 users")
        print("- 100 platform usage metrics")
        print("- ~150 digital activities (last 7 days)")
        
    except Exception as e:
        print(f"❌ Error during seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_basic_data()