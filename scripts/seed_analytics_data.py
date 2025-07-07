"""
Analytics Data Seeding Script
Populates database with realistic sample data for Phase 1 testing
"""

import sys
import os
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User, Base
from app.models.tenant import Tenant
from app.models.platform_analytics import PlatformUsageMetric, PlatformHealthMetric, TenantAnalyticsSummary
from app.models.analytics import AnalyticsModel, AnalyticsPrediction, ROICalculation, PerformanceMetric
from app.models.performance_monitoring import UserExperienceMetric, QueryPerformance

def create_tables():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)

def seed_tenants_and_users(db: Session):
    """Seed tenants and users"""
    print("Seeding tenants and users...")
    
    # Create sample tenants
    tenants_data = [
        {
            "name": "Acme Corporation",
            "slug": "acme-corp",
            "domain": "acme-corp.digame.com",
            "subdomain": "acme-corp",
            "subscription_tier": "enterprise",
            
            "admin_email": "admin@acme-corp.com",
            "admin_name": "John Smith",
            "max_users": 100,
            "max_storage_gb": 100,
            "max_api_calls_monthly": 100000,
            "is_active": True,
            "is_trial": False
        },
        {
            "name": "TechStart Inc",
            "slug": "techstart",
            "domain": "techstart.digame.com",
            "subdomain": "techstart",
            "subscription_tier": "team",
            
            "admin_email": "admin@techstart.com",
            "admin_name": "Sarah Johnson",
            "max_users": 10,
            "max_storage_gb": 10,
            "max_api_calls_monthly": 10000,
            "is_active": True,
            "is_trial": False
        },
        {
            "name": "Solo Freelancer",
            "slug": "solo-freelancer",
            "domain": "solo-freelancer.digame.com",
            "subdomain": "solo-freelancer",
            "subscription_tier": "individual_pro",
            
            "admin_email": "freelancer@example.com",
            "admin_name": "Mike Wilson",
            "max_users": 1,
            "max_storage_gb": 5,
            "max_api_calls_monthly": 5000,
            "is_active": True,
            "is_trial": True
        }
    ]
    
    tenants = []
    for tenant_data in tenants_data:
        tenant = Tenant(
            name=tenant_data["name"],
            slug=tenant_data["slug"],
            domain=tenant_data["domain"],
            subdomain=tenant_data["subdomain"],
            subscription_tier=tenant_data["subscription_tier"],
            admin_email=tenant_data["admin_email"],
            admin_name=tenant_data["admin_name"],
            max_users=tenant_data["max_users"],
            is_active=tenant_data["is_active"],
            is_trial=tenant_data["is_trial"]
        )
        db.add(tenant)
        tenants.append(tenant)
    
    db.commit()
    
    # Create sample users
    users_data = [
        {"username": "john_smith", "email": "john@acme-corp.com", "first_name": "John", "last_name": "Smith", "tenant_id": 1},
        {"username": "jane_doe", "email": "jane@acme-corp.com", "first_name": "Jane", "last_name": "Doe", "tenant_id": 1},
        {"username": "bob_wilson", "email": "bob@acme-corp.com", "first_name": "Bob", "last_name": "Wilson", "tenant_id": 1},
        {"username": "sarah_johnson", "email": "sarah@techstart.com", "first_name": "Sarah", "last_name": "Johnson", "tenant_id": 2},
        {"username": "mike_brown", "email": "mike@techstart.com", "first_name": "Mike", "last_name": "Brown", "tenant_id": 2},
        {"username": "freelancer", "email": "freelancer@example.com", "first_name": "Mike", "last_name": "Wilson", "tenant_id": 3},
    ]
    
    for user_data in users_data:
        user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password="hashed_password_here",  # In real app, this would be properly hashed
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            tenant_id=user_data["tenant_id"],
            subscription_tier="enterprise" if user_data["tenant_id"] == 1 else "team" if user_data["tenant_id"] == 2 else "individual_pro",
            last_login=datetime.utcnow() - timedelta(hours=random.randint(1, 72))
        )
        db.add(user)
    
    db.commit()
    print(f"Created {len(tenants)} tenants and {len(users_data)} users")

def seed_platform_usage_metrics(db: Session):
    """Seed platform usage metrics"""
    print("Seeding platform usage metrics...")
    
    features = [
        "Dashboard Overview", "Analytics Reports", "User Management", "Security Monitoring",
        "Workflow Automation", "Advanced Exports", "API Testing", "Custom Reports",
        "Real-time Collaboration", "Advanced Search", "PWA Features"
    ]
    
    metric_types = ["feature_usage", "api_calls", "page_views", "user_activity"]
    
    # Generate metrics for the last 30 days
    metrics = []
    for days_ago in range(30):
        date = datetime.utcnow() - timedelta(days=days_ago)
        
        for tenant_id in [1, 2, 3]:
            for _ in range(random.randint(10, 50)):  # Random number of metrics per day per tenant
                metric = PlatformUsageMetric(
                    metric_type=random.choice(metric_types),
                    metric_category="user_engagement",
                    metric_name=f"{random.choice(metric_types)}_count",
                    metric_value=random.uniform(1, 100),
                    tenant_id=tenant_id,
                    user_id=random.randint(1, 6),
                    feature_name=random.choice(features) if random.random() > 0.3 else None,
                    recorded_at=date
                )
                metrics.append(metric)
    
    db.add_all(metrics)
    db.commit()
    print(f"Created {len(metrics)} platform usage metrics")

def seed_user_experience_metrics(db: Session):
    """Seed user experience metrics"""
    print("Seeding user experience metrics...")
    
    pages = ["/dashboard", "/analytics", "/users", "/settings", "/reports", "/workflows"]
    devices = ["desktop", "mobile", "tablet"]
    browsers = ["Chrome", "Firefox", "Safari", "Edge"]
    countries = ["United States", "United Kingdom", "Germany", "Canada", "Australia"]
    cities = ["New York", "London", "San Francisco", "Toronto", "Berlin"]
    
    metrics = []
    for days_ago in range(30):
        date = datetime.utcnow() - timedelta(days=days_ago)
        
        for tenant_id in [1, 2, 3]:
            for _ in range(random.randint(20, 100)):  # Random sessions per day
                metric = UserExperienceMetric(
                    tenant_id=tenant_id,
                    user_id=random.randint(1, 6),
                    session_id=f"session_{random.randint(1000, 9999)}",
                    page_url=random.choice(pages),
                    action_type=random.choice(["page_load", "click", "form_submit"]),
                    load_time_ms=random.uniform(200, 3000),
                    device_type=random.choice(devices),
                    browser=random.choice(browsers),
                    country=random.choice(countries),
                    city=random.choice(cities),
                    bounce=random.random() < 0.25,  # 25% bounce rate
                    error_occurred=random.random() < 0.05,  # 5% error rate
                    timestamp=date
                )
                metrics.append(metric)
    
    db.add_all(metrics)
    db.commit()
    print(f"Created {len(metrics)} user experience metrics")

def seed_query_performance(db: Session):
    """Seed query performance data"""
    print("Seeding query performance data...")
    
    queries = [
        "SELECT * FROM users WHERE tenant_id = ?",
        "SELECT COUNT(*) FROM analytics_metrics WHERE date >= ?",
        "UPDATE user_activity SET last_seen = ? WHERE user_id = ?",
        "INSERT INTO platform_usage (metric_type, value) VALUES (?, ?)",
        "SELECT * FROM performance_metrics ORDER BY timestamp DESC LIMIT 100"
    ]
    
    endpoints = ["/api/users", "/api/analytics", "/api/dashboard", "/api/metrics", "/api/reports"]
    
    metrics = []
    for days_ago in range(30):
        date = datetime.utcnow() - timedelta(days=days_ago)
        
        for tenant_id in [1, 2, 3]:
            for _ in range(random.randint(50, 200)):  # Random queries per day
                metric = QueryPerformance(
                    tenant_id=tenant_id,
                    query_hash=f"hash_{random.randint(1000, 9999)}",
                    query_text=random.choice(queries),
                    execution_time_ms=random.uniform(10, 1000),
                    rows_examined=random.randint(1, 10000),
                    rows_returned=random.randint(1, 1000),
                    endpoint=random.choice(endpoints),
                    user_id=random.randint(1, 6),
                    is_slow_query=random.random() < 0.1,  # 10% slow queries
                    timestamp=date
                )
                metrics.append(metric)
    
    db.add_all(metrics)
    db.commit()
    print(f"Created {len(metrics)} query performance metrics")

def seed_analytics_models(db: Session):
    """Seed analytics models"""
    print("Seeding analytics models...")
    
    models_data = [
        {
            "name": "user_performance_predictor",
            "display_name": "User Performance Predictor",
            "description": "Predicts user performance based on activity patterns",
            "model_type": "performance",
            "category": "predictive",
            "algorithm": "random_forest_regressor",
            "target_variable": "performance_score",
            "status": "trained",
            "accuracy_score": 0.87,
            "r2_score": 0.82,
            "prediction_count": 1250
        },
        {
            "name": "productivity_optimizer",
            "display_name": "Productivity Optimizer",
            "description": "Analyzes productivity patterns and suggests optimizations",
            "model_type": "productivity",
            "category": "prescriptive",
            "algorithm": "linear_regression",
            "target_variable": "productivity_index",
            "status": "trained",
            "accuracy_score": 0.79,
            "r2_score": 0.75,
            "prediction_count": 890
        },
        {
            "name": "churn_predictor",
            "display_name": "Churn Predictor",
            "description": "Predicts user churn probability",
            "model_type": "churn",
            "category": "predictive",
            "algorithm": "logistic_regression",
            "target_variable": "churn_probability",
            "status": "training",
            "accuracy_score": 0.91,
            "precision_score": 0.88,
            "prediction_count": 567
        }
    ]
    
    models = []
    for model_data in models_data:
        for tenant_id in [1, 2, 3]:
            model = AnalyticsModel(
                tenant_id=tenant_id,
                name=model_data["name"],
                display_name=model_data["display_name"],
                description=model_data["description"],
                model_type=model_data["model_type"],
                category=model_data["category"],
                algorithm=model_data["algorithm"],
                target_variable=model_data["target_variable"],
                status=model_data["status"],
                is_active=True,
                is_production=model_data["status"] == "trained",
                accuracy_score=model_data.get("accuracy_score"),
                precision_score=model_data.get("precision_score"),
                r2_score=model_data.get("r2_score"),
                prediction_count=model_data["prediction_count"],
                last_trained_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                created_by_user_id=1
            )
            models.append(model)
    
    db.add_all(models)
    db.commit()
    print(f"Created {len(models)} analytics models")

def seed_predictions(db: Session):
    """Seed analytics predictions"""
    print("Seeding analytics predictions...")
    
    predictions = []
    for days_ago in range(30):
        date = datetime.utcnow() - timedelta(days=days_ago)
        
        for model_id in range(1, 10):  # 9 models total (3 per tenant)
            for _ in range(random.randint(5, 20)):  # Random predictions per day per model
                # Generate values first
                predicted_value = random.uniform(0.1, 1.0)
                actual_value = random.uniform(0.1, 1.0) if random.random() < 0.3 else None
                prediction_error = None
                if actual_value:
                    prediction_error = actual_value - predicted_value
                
                prediction = AnalyticsPrediction(
                    tenant_id=((model_id - 1) // 3) + 1,  # Distribute across tenants
                    model_id=model_id,
                    entity_type="user",
                    entity_id=random.randint(1, 6),
                    prediction_type=random.choice(["performance", "productivity", "churn"]),
                    predicted_value=predicted_value,
                    confidence_score=random.uniform(0.7, 0.95),
                    prediction_date=date,
                    is_validated=random.random() < 0.3,  # 30% validated
                    actual_value=actual_value,
                    prediction_error=prediction_error
                )
                
                predictions.append(prediction)
    
    db.add_all(predictions)
    db.commit()
    print(f"Created {len(predictions)} predictions")

def seed_roi_calculations(db: Session):
    """Seed ROI calculations"""
    print("Seeding ROI calculations...")
    
    calculations = []
    for tenant_id in [1, 2, 3]:
        for i in range(random.randint(3, 8)):  # 3-8 ROI calculations per tenant
            initial_investment = Decimal(random.uniform(10000, 100000))
            operational_costs = Decimal(random.uniform(5000, 20000))
            total_investment = initial_investment + operational_costs
            
            revenue_increase = Decimal(random.uniform(15000, 150000))
            cost_savings = Decimal(random.uniform(5000, 30000))
            total_benefits = revenue_increase + cost_savings
            
            roi_percentage = float((total_benefits - total_investment) / total_investment * 100)
            
            calculation = ROICalculation(
                tenant_id=tenant_id,
                entity_type="project",
                entity_id=i + 1,
                calculation_name=f"Project ROI Analysis {i + 1}",
                period_start=datetime.utcnow() - timedelta(days=90),
                period_end=datetime.utcnow(),
                period_days=90,
                initial_investment=initial_investment,
                operational_costs=operational_costs,
                total_investment=total_investment,
                revenue_increase=revenue_increase,
                cost_savings=cost_savings,
                total_benefits=total_benefits,
                roi_percentage=roi_percentage,
                calculated_by_user_id=1
            )
            calculations.append(calculation)
    
    db.add_all(calculations)
    db.commit()
    print(f"Created {len(calculations)} ROI calculations")

def seed_performance_metrics(db: Session):
    """Seed performance metrics"""
    print("Seeding performance metrics...")
    
    metric_types = ["productivity", "performance", "efficiency", "engagement"]
    entities = ["user", "project", "team", "system"]
    
    metrics = []
    for days_ago in range(30):
        date = datetime.utcnow() - timedelta(days=days_ago)
        
        for tenant_id in [1, 2, 3]:
            for _ in range(random.randint(10, 30)):  # Random metrics per day
                current_value = random.uniform(50, 100)
                previous_value = random.uniform(40, 95)
                
                metric = PerformanceMetric(
                    tenant_id=tenant_id,
                    metric_name=f"{random.choice(metric_types)}_score",
                    display_name=f"{random.choice(metric_types).title()} Score",
                    metric_type=random.choice(metric_types),
                    category=random.choice(entities),
                    entity_type=random.choice(entities),
                    entity_id=random.randint(1, 10),
                    measurement_unit="%",
                    calculation_method="average",
                    current_value=current_value,
                    previous_value=previous_value,
                    baseline_value=random.uniform(60, 80),
                    target_value=random.uniform(80, 95),
                    measurement_date=date,
                    period_start=date - timedelta(days=7),
                    period_end=date,
                    period_type="weekly",
                    measured_by_user_id=random.randint(1, 6)
                )
                
                # Calculate trend
                if previous_value:
                    change = current_value - previous_value
                    trend_percentage = (change / previous_value) * 100
                    
                    if abs(trend_percentage) < 1:
                        trend_direction = "stable"
                    elif trend_percentage > 0:
                        trend_direction = "increasing"
                    else:
                        trend_direction = "decreasing"
                    
                    # Note: trend values would be calculated in the service layer
                    pass
                
                metrics.append(metric)
    
    db.add_all(metrics)
    db.commit()
    print(f"Created {len(metrics)} performance metrics")

def main():
    """Main seeding function"""
    print("Starting analytics data seeding...")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Create tables
        create_tables()
        
        # Seed data in order (respecting foreign key constraints)
        seed_tenants_and_users(db)
        seed_platform_usage_metrics(db)
        seed_user_experience_metrics(db)
        seed_query_performance(db)
        seed_analytics_models(db)
        seed_predictions(db)
        seed_roi_calculations(db)
        seed_performance_metrics(db)
        
        print("\n✅ Analytics data seeding completed successfully!")
        print("\nSeeded data summary:")
        print(f"- Tenants: {db.query(Tenant).count()}")
        print(f"- Users: {db.query(User).count()}")
        print(f"- Platform Usage Metrics: {db.query(PlatformUsageMetric).count()}")
        print(f"- User Experience Metrics: {db.query(UserExperienceMetric).count()}")
        print(f"- Query Performance Records: {db.query(QueryPerformance).count()}")
        print(f"- Analytics Models: {db.query(AnalyticsModel).count()}")
        print(f"- Predictions: {db.query(AnalyticsPrediction).count()}")
        print(f"- ROI Calculations: {db.query(ROICalculation).count()}")
        print(f"- Performance Metrics: {db.query(PerformanceMetric).count()}")
        
    except Exception as e:
        print(f"❌ Error during seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()