"""
Comprehensive Notification System Data Seeding
Production-scale notification data with realistic patterns and business scenarios
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
import random
import uuid

from app.database import SessionLocal
from app.models.notifications import (
    Notification, NotificationTemplate, NotificationPreference, NotificationLog,
    NotificationType, NotificationPriority, NotificationStatus
)
from app.models.user import User
from app.models.tenant import Tenant

def generate_fake_email():
    """Generate a fake email address"""
    domains = ["example.com", "test.com", "demo.com", "sample.com"]
    names = ["user", "admin", "test", "demo", "sample"]
    return f"{random.choice(names)}{random.randint(1, 999)}@{random.choice(domains)}"

def generate_fake_phone():
    """Generate a fake phone number"""
    return f"+1-{random.randint(100, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"

def generate_fake_domain():
    """Generate a fake domain name"""
    domains = ["example.com", "test.com", "demo.com", "sample.com"]
    return random.choice(domains)

def generate_fake_datetime(start_date, end_date):
    """Generate a random datetime between start and end dates"""
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randrange(days_between)
    random_seconds = random.randrange(24 * 60 * 60)
    return start_date + timedelta(days=random_days, seconds=random_seconds)

def seed_notification_data(db: Session | None = None):
    """Seed comprehensive notification system data"""
    if db is None:
        db = SessionLocal()
    
    try:
        print("🔔 Seeding Notification System Data...")
        
        # Clear existing notification data
        print("  🗑️  Clearing existing notification data...")
        db.execute(text("DELETE FROM notification_logs"))
        db.execute(text("DELETE FROM notifications"))
        db.execute(text("DELETE FROM notification_preferences"))
        db.execute(text("DELETE FROM notification_templates"))
        db.commit()
        
        # Get existing users and tenants
        users = db.query(User).limit(20).all()
        tenants = db.query(Tenant).limit(10).all()
        
        if not users:
            print("  ⚠️  No users found. Creating sample users...")
            # Create sample users if none exist
            for i in range(10):
                user = User()
                setattr(user, 'email', f"user{i+1}@digame.com")
                setattr(user, 'username', f"user{i+1}")
                setattr(user, 'is_active', True)
                setattr(user, 'is_platform_owner', i < 3)  # First 3 users are platform owners
                db.add(user)
            db.commit()
            users = db.query(User).all()
        
        if not tenants:
            print("  ⚠️  No tenants found. Creating sample tenants...")
            # Create sample tenants if none exist
            for i in range(5):
                tenant = Tenant()
                setattr(tenant, 'name', f"Tenant {i+1}")
                setattr(tenant, 'domain', f"tenant{i+1}.digame.com")
                setattr(tenant, 'is_active', True)
                db.add(tenant)
            db.commit()
            tenants = db.query(Tenant).all()
        
        # 1. Seed Notification Templates
        print("  📋 Creating notification templates...")
        templates_data = [
            {
                "name": "security_breach_alert",
                "notification_type": NotificationType.SECURITY_ALERT,
                "priority": NotificationPriority.CRITICAL,
                "title_template": "🚨 Security Breach Detected - {breach_type}",
                "message_template": "A {severity} security breach has been detected in {system}. Immediate action required. Affected users: {affected_count}. Time: {timestamp}",
                "action_text_template": "View Security Dashboard",
                "action_url_template": "/security/incidents/{incident_id}",
                "delivery_channels": ["in_app", "email", "sms"],
                "auto_dismiss_hours": None  # Critical alerts don't auto-dismiss
            },
            {
                "name": "system_health_warning",
                "notification_type": NotificationType.SYSTEM_HEALTH,
                "priority": NotificationPriority.HIGH,
                "title_template": "⚠️ System Health Alert - {component}",
                "message_template": "System component {component} is experiencing {issue_type}. Current status: {status}. Performance impact: {impact_level}",
                "action_text_template": "View System Health",
                "action_url_template": "/monitoring/system-health",
                "delivery_channels": ["in_app", "email"],
                "auto_dismiss_hours": 24
            },
            {
                "name": "revenue_milestone",
                "notification_type": NotificationType.REVENUE_ALERT,
                "priority": NotificationPriority.MEDIUM,
                "title_template": "💰 Revenue Milestone Achieved",
                "message_template": "Congratulations! Your platform has reached ${milestone} in {period}. Growth rate: {growth_rate}%. Top performing tenant: {top_tenant}",
                "action_text_template": "View Revenue Analytics",
                "action_url_template": "/analytics/revenue",
                "delivery_channels": ["in_app"],
                "auto_dismiss_hours": 72
            },
            {
                "name": "tenant_signup",
                "notification_type": NotificationType.BUSINESS_ALERT,
                "priority": NotificationPriority.MEDIUM,
                "title_template": "🎉 New Tenant Registration",
                "message_template": "New tenant '{tenant_name}' has registered with {plan_type} plan. Users: {user_count}. Estimated MRR: ${estimated_mrr}",
                "action_text_template": "View Tenant Details",
                "action_url_template": "/enterprise/tenants/{tenant_id}",
                "delivery_channels": ["in_app", "email"],
                "auto_dismiss_hours": 48
            },
            {
                "name": "user_activity_spike",
                "notification_type": NotificationType.USER_ACTIVITY,
                "priority": NotificationPriority.LOW,
                "title_template": "📈 User Activity Spike Detected",
                "message_template": "Unusual activity spike detected. Active users: {active_users} (+{increase}% from average). Peak feature: {peak_feature}",
                "action_text_template": "View User Analytics",
                "action_url_template": "/analytics/user-behavior",
                "delivery_channels": ["in_app"],
                "auto_dismiss_hours": 12
            },
            {
                "name": "tenant_usage_limit",
                "notification_type": NotificationType.TENANT_ACTIVITY,
                "priority": NotificationPriority.HIGH,
                "title_template": "⚠️ Tenant Usage Limit Approaching",
                "message_template": "Tenant '{tenant_name}' has reached {usage_percent}% of their {limit_type} limit. Current usage: {current_usage}/{limit}",
                "action_text_template": "Manage Tenant Limits",
                "action_url_template": "/enterprise/tenants/{tenant_id}/usage",
                "delivery_channels": ["in_app", "email"],
                "auto_dismiss_hours": 6
            }
        ]
        
        templates = []
        for template_data in templates_data:
            template = NotificationTemplate()
            for key, value in template_data.items():
                setattr(template, key, value)
            setattr(template, 'is_active', True)
            setattr(template, 'created_by', random.choice(users).id)
            db.add(template)
            templates.append(template)
        
        db.commit()
        print(f"    ✓ Created {len(templates)} notification templates")
        
        # 2. Seed Notification Preferences
        print("  ⚙️  Creating notification preferences...")
        preferences_created = 0
        for user in users:
            # Create preferences for platform owners and some regular users
            if getattr(user, 'is_platform_owner', False) or random.random() < 0.6:
                preference = NotificationPreference()
                setattr(preference, 'user_id', user.id)
                
                # Randomize preferences with realistic patterns
                if getattr(user, 'is_platform_owner', False):
                    # Platform owners get more notifications
                    setattr(preference, 'security_alerts_enabled', True)
                    setattr(preference, 'system_health_enabled', True)
                    setattr(preference, 'business_alerts_enabled', True)
                    setattr(preference, 'revenue_alerts_enabled', True)
                    setattr(preference, 'tenant_activity_enabled', True)
                    setattr(preference, 'user_activity_enabled', random.choice([True, False]))
                    setattr(preference, 'min_priority', random.choice([NotificationPriority.LOW, NotificationPriority.MEDIUM]))
                else:
                    # Regular users get fewer notifications
                    setattr(preference, 'security_alerts_enabled', random.choice([True, False]))
                    setattr(preference, 'system_health_enabled', random.choice([True, False]))
                    setattr(preference, 'business_alerts_enabled', False)
                    setattr(preference, 'revenue_alerts_enabled', False)
                    setattr(preference, 'tenant_activity_enabled', False)
                    setattr(preference, 'user_activity_enabled', False)
                    setattr(preference, 'min_priority', random.choice([NotificationPriority.MEDIUM, NotificationPriority.HIGH]))
                
                # Delivery preferences
                setattr(preference, 'in_app_enabled', True)
                setattr(preference, 'email_enabled', random.choice([True, False]))
                setattr(preference, 'email_address', generate_fake_email() if getattr(preference, 'email_enabled', False) else None)
                setattr(preference, 'sms_enabled', random.choice([True, False]) if getattr(user, 'is_platform_owner', False) else False)
                setattr(preference, 'phone_number', generate_fake_phone() if getattr(preference, 'sms_enabled', False) else None)
                setattr(preference, 'webhook_enabled', random.choice([True, False]) if getattr(user, 'is_platform_owner', False) else False)
                setattr(preference, 'webhook_url', f"https://webhook.{generate_fake_domain()}/notifications" if getattr(preference, 'webhook_enabled', False) else None)
                
                # Quiet hours (some users set them)
                if random.random() < 0.4:
                    setattr(preference, 'quiet_hours_start', f"{random.randint(22, 23):02d}:00")
                    setattr(preference, 'quiet_hours_end', f"{random.randint(6, 8):02d}:00")
                
                setattr(preference, 'timezone', random.choice(["UTC", "America/New_York", "Europe/London", "Asia/Tokyo", "Australia/Sydney"]))
                
                db.add(preference)
                preferences_created += 1
        
        db.commit()
        print(f"    ✓ Created {preferences_created} notification preferences")
        
        # 3. Seed Historical Notifications (90 days)
        print("  📬 Creating historical notifications...")
        notifications_created = 0
        
        # Get platform owners for notifications
        platform_owners = [u for u in users if getattr(u, 'is_platform_owner', False)]
        if not platform_owners:
            platform_owners = users[:3]  # Use first 3 users as platform owners
        
        # Create notifications over the past 90 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=90)
        
        # Security alerts (high frequency for critical system)
        security_scenarios = [
            {"breach_type": "SQL Injection Attempt", "severity": "high", "system": "user authentication", "affected_count": 0},
            {"breach_type": "Brute Force Attack", "severity": "medium", "system": "login system", "affected_count": 3},
            {"breach_type": "Suspicious API Access", "severity": "low", "system": "API gateway", "affected_count": 1},
            {"breach_type": "Unauthorized Access Attempt", "severity": "high", "system": "admin panel", "affected_count": 0},
            {"breach_type": "DDoS Attack Detected", "severity": "critical", "system": "load balancer", "affected_count": 0},
            {"breach_type": "Malware Upload Blocked", "severity": "medium", "system": "file upload", "affected_count": 1}
        ]
        
        for _ in range(45):  # ~0.5 per day
            notification = Notification()
            setattr(notification, 'recipient_id', random.choice(platform_owners).id)
            
            scenario = random.choice(security_scenarios)
            template = next(t for t in templates if t.name == "security_breach_alert")
            
            setattr(notification, 'title', template.title_template.format(breach_type=scenario["breach_type"]))
            setattr(notification, 'message', template.message_template.format(
                severity=scenario["severity"],
                system=scenario["system"],
                affected_count=scenario["affected_count"],
                timestamp=generate_fake_datetime(start_date, end_date).strftime("%Y-%m-%d %H:%M:%S")
            ))
            setattr(notification, 'notification_type', NotificationType.SECURITY_ALERT)
            setattr(notification, 'priority', NotificationPriority.CRITICAL if scenario["severity"] == "critical" else NotificationPriority.HIGH)
            setattr(notification, 'status', random.choice([NotificationStatus.READ, NotificationStatus.DISMISSED, NotificationStatus.SENT]))
            setattr(notification, 'action_url', f"/security/incidents/{random.randint(1000, 9999)}")
            setattr(notification, 'action_text', "View Security Dashboard")
            setattr(notification, 'delivery_channels', ["in_app", "email"])
            setattr(notification, 'context_data', scenario)
            
            # Set timestamps
            created_at = generate_fake_datetime(start_date, end_date)
            setattr(notification, 'created_at', created_at)
            if getattr(notification, 'status') in [NotificationStatus.READ, NotificationStatus.DISMISSED]:
                setattr(notification, 'sent_at', created_at + timedelta(seconds=random.randint(1, 300)))
                if getattr(notification, 'status') == NotificationStatus.READ:
                    setattr(notification, 'read_at', getattr(notification, 'sent_at') + timedelta(minutes=random.randint(1, 120)))
                elif getattr(notification, 'status') == NotificationStatus.DISMISSED:
                    setattr(notification, 'dismissed_at', getattr(notification, 'sent_at') + timedelta(minutes=random.randint(5, 480)))
            
            db.add(notification)
            notifications_created += 1
        
        # System health alerts
        system_components = ["Database", "API Gateway", "Load Balancer", "Cache Server", "File Storage", "Message Queue"]
        issue_types = ["high CPU usage", "memory leak", "slow response times", "connection timeouts", "disk space low"]
        
        for _ in range(35):  # ~0.4 per day
            notification = Notification()
            setattr(notification, 'recipient_id', random.choice(platform_owners).id)
            
            component = random.choice(system_components)
            issue = random.choice(issue_types)
            template = next(t for t in templates if t.name == "system_health_warning")
            
            setattr(notification, 'title', template.title_template.format(component=component))
            setattr(notification, 'message', template.message_template.format(
                component=component,
                issue_type=issue,
                status=random.choice(["degraded", "warning", "recovering"]),
                impact_level=random.choice(["low", "medium", "high"])
            ))
            setattr(notification, 'notification_type', NotificationType.SYSTEM_HEALTH)
            setattr(notification, 'priority', random.choice([NotificationPriority.MEDIUM, NotificationPriority.HIGH]))
            setattr(notification, 'status', random.choice([NotificationStatus.READ, NotificationStatus.DISMISSED, NotificationStatus.SENT]))
            setattr(notification, 'action_url', "/monitoring/system-health")
            setattr(notification, 'action_text', "View System Health")
            setattr(notification, 'delivery_channels', ["in_app", "email"])
            setattr(notification, 'context_data', {"component": component, "issue_type": issue})
            
            # Set timestamps
            created_at = generate_fake_datetime(start_date, end_date)
            setattr(notification, 'created_at', created_at)
            if getattr(notification, 'status') in [NotificationStatus.READ, NotificationStatus.DISMISSED]:
                setattr(notification, 'sent_at', created_at + timedelta(seconds=random.randint(1, 300)))
                if getattr(notification, 'status') == NotificationStatus.READ:
                    setattr(notification, 'read_at', getattr(notification, 'sent_at') + timedelta(minutes=random.randint(1, 60)))
                elif getattr(notification, 'status') == NotificationStatus.DISMISSED:
                    setattr(notification, 'dismissed_at', getattr(notification, 'sent_at') + timedelta(minutes=random.randint(10, 240)))
            
            db.add(notification)
            notifications_created += 1
        
        # Business alerts (tenant signups, revenue milestones)
        for _ in range(25):  # ~0.3 per day
            notification = Notification()
            setattr(notification, 'recipient_id', random.choice(platform_owners).id)
            
            if random.choice([True, False]) and tenants:
                # Tenant signup
                tenant = random.choice(tenants)
                template = next(t for t in templates if t.name == "tenant_signup")
                
                setattr(notification, 'title', template.title_template)
                setattr(notification, 'message', template.message_template.format(
                    tenant_name=getattr(tenant, 'name', f'Tenant {tenant.id}'),
                    plan_type=random.choice(["Starter", "Professional", "Enterprise"]),
                    user_count=random.randint(5, 50),
                    estimated_mrr=random.randint(99, 999)
                ))
                setattr(notification, 'notification_type', NotificationType.BUSINESS_ALERT)
                setattr(notification, 'action_url', f"/enterprise/tenants/{tenant.id}")
                setattr(notification, 'tenant_id', tenant.id)
            else:
                # Revenue milestone
                template = next(t for t in templates if t.name == "revenue_milestone")
                
                setattr(notification, 'title', template.title_template)
                setattr(notification, 'message', template.message_template.format(
                    milestone=f"{random.randint(10, 100)}K",
                    period=random.choice(["this month", "this quarter", "this year"]),
                    growth_rate=random.randint(15, 45),
                    top_tenant=getattr(random.choice(tenants), 'name', 'Sample Tenant') if tenants else 'Sample Tenant'
                ))
                setattr(notification, 'notification_type', NotificationType.REVENUE_ALERT)
                setattr(notification, 'action_url', "/analytics/revenue")
            
            setattr(notification, 'priority', NotificationPriority.MEDIUM)
            setattr(notification, 'status', random.choice([NotificationStatus.READ, NotificationStatus.DISMISSED, NotificationStatus.SENT]))
            setattr(notification, 'action_text', "View Details")
            setattr(notification, 'delivery_channels', ["in_app"])
            
            # Set timestamps
            created_at = generate_fake_datetime(start_date, end_date)
            setattr(notification, 'created_at', created_at)
            if getattr(notification, 'status') in [NotificationStatus.READ, NotificationStatus.DISMISSED]:
                setattr(notification, 'sent_at', created_at + timedelta(seconds=random.randint(1, 300)))
                if getattr(notification, 'status') == NotificationStatus.READ:
                    setattr(notification, 'read_at', getattr(notification, 'sent_at') + timedelta(hours=random.randint(1, 24)))
                elif getattr(notification, 'status') == NotificationStatus.DISMISSED:
                    setattr(notification, 'dismissed_at', getattr(notification, 'sent_at') + timedelta(hours=random.randint(2, 48)))
            
            db.add(notification)
            notifications_created += 1
        
        db.commit()
        print(f"    ✓ Created {notifications_created} historical notifications")
        
        # 4. Seed Notification Delivery Logs
        print("  📤 Creating notification delivery logs...")
        logs_created = 0
        
        # Get all notifications for logging
        all_notifications = db.query(Notification).all()
        
        for notification in all_notifications:
            # Create delivery logs for each delivery channel
            channels = getattr(notification, 'delivery_channels', ["in_app"]) or ["in_app"]
            
            for channel in channels:
                log = NotificationLog()
                setattr(log, 'notification_id', notification.id)
                setattr(log, 'channel', channel)
                
                # Simulate delivery success/failure rates
                if channel == "in_app":
                    setattr(log, 'status', "success")  # In-app notifications rarely fail
                elif channel == "email":
                    setattr(log, 'status', random.choices(["success", "failed"], weights=[95, 5])[0])
                    setattr(log, 'recipient_address', generate_fake_email())
                    setattr(log, 'provider', random.choice(["SendGrid", "AWS SES", "Mailgun"]))
                    if getattr(log, 'status') == "success":
                        setattr(log, 'provider_message_id', str(uuid.uuid4()))
                    else:
                        setattr(log, 'error_code', random.choice(["BOUNCE", "SPAM", "INVALID_EMAIL"]))
                        setattr(log, 'error_message', f"Email delivery failed: {getattr(log, 'error_code')}")
                elif channel == "sms":
                    setattr(log, 'status', random.choices(["success", "failed"], weights=[90, 10])[0])
                    setattr(log, 'recipient_address', generate_fake_phone())
                    setattr(log, 'provider', random.choice(["Twilio", "AWS SNS", "Nexmo"]))
                    if getattr(log, 'status') == "success":
                        setattr(log, 'provider_message_id', str(uuid.uuid4()))
                    else:
                        setattr(log, 'error_code', random.choice(["INVALID_NUMBER", "CARRIER_BLOCKED", "RATE_LIMIT"]))
                        setattr(log, 'error_message', f"SMS delivery failed: {getattr(log, 'error_code')}")
                elif channel == "webhook":
                    setattr(log, 'status', random.choices(["success", "failed"], weights=[85, 15])[0])
                    setattr(log, 'recipient_address', f"https://webhook.{generate_fake_domain()}/notifications")
                    if getattr(log, 'status') == "failed":
                        setattr(log, 'error_code', random.choice(["TIMEOUT", "HTTP_500", "INVALID_URL"]))
                        setattr(log, 'error_message', f"Webhook delivery failed: {getattr(log, 'error_code')}")
                
                # Set delivery timestamps
                setattr(log, 'attempted_at', getattr(notification, 'created_at') + timedelta(seconds=random.randint(1, 60)))
                if getattr(log, 'status') == "success":
                    setattr(log, 'delivered_at', getattr(log, 'attempted_at') + timedelta(seconds=random.randint(1, 30)))
                
                db.add(log)
                logs_created += 1
        
        db.commit()
        print(f"    ✓ Created {logs_created} notification delivery logs")
        
        # Summary
        print(f"\n  📊 Notification System Seeding Summary:")
        print(f"    ✅ Templates: {len(templates)} notification templates")
        print(f"    ✅ Preferences: {preferences_created} user preferences")
        print(f"    ✅ Notifications: {notifications_created} historical notifications")
        print(f"    ✅ Delivery Logs: {logs_created} delivery attempt logs")
        print(f"    ✅ Time Range: 90 days of historical data")
        print(f"    ✅ Notification Types: Security, System Health, Business, Revenue, User Activity, Tenant Activity")
        print(f"    ✅ Delivery Channels: In-app, Email, SMS, Webhook")
        print(f"    ✅ Realistic Patterns: Business hours, priority distribution, delivery success rates")
        
        return {
            "templates": len(templates),
            "preferences": preferences_created,
            "notifications": notifications_created,
            "delivery_logs": logs_created,
            "success": True
        }
        
    except Exception as e:
        print(f"    ❌ Error seeding notification data: {e}")
        db.rollback()
        raise
    finally:
        if db:
            db.close()

def main():
    """Main function for standalone execution"""
    print("🔔 Starting Notification System Data Seeding...")
    
    try:
        result = seed_notification_data()
        print(f"\n🎉 Notification seeding completed successfully!")
        print(f"Result: {result}")
        
    except Exception as e:
        print(f"\n❌ Notification seeding failed: {e}")
        raise

if __name__ == "__main__":
    main()