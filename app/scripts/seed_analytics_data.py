"""
Comprehensive data seeding script for analytics database
Populates historical user behavior, performance metrics, and analytics data
"""

import asyncio
import random
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List, Dict, Any
import uuid

from sqlalchemy.orm import Session
from sqlalchemy import select, func, text

from ..database import SessionLocal, engine, Base
from ..models import (
    AnalyticsModel, AnalyticsPrediction, PerformanceMetric,
    ROICalculation, User, Activity, Tenant
)
from ..models.user import UserProfile
from ..models.analytics import AnalyticsDashboard, DashboardWidgetConfig


class AnalyticsDataSeeder:
    """Comprehensive analytics data seeder with realistic historical patterns"""
    
    def __init__(self):
        self.db = SessionLocal()
        self.tenant_id = 1  # Default tenant for seeding
        self.user_ids = []
        self.model_ids = []
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.db.close()
    
    async def seed_all_data(self):
        """Seed all analytics data with proper relationships"""
        print("🌱 Starting comprehensive analytics data seeding...")
        
        # Create tables if they don't exist - skip for now to avoid foreign key issues
        # Base.metadata.create_all(bind=engine)
        print("⚠️  Skipping table creation - using existing database schema")
        
        # Seed in proper order due to foreign key relationships
        await self.seed_tenant_and_users()
        await self.seed_user_activities()
        await self.seed_analytics_models()
        await self.seed_performance_metrics()
        await self.seed_analytics_predictions()
        await self.seed_roi_calculations()
        await self.seed_analytics_dashboards()
        
        self.db.commit()
        print("✅ Analytics data seeding completed successfully!")
    
    async def seed_tenant_and_users(self):
        """Seed tenant and users for analytics data"""
        print("👥 Seeding tenant and users...")
        
        # Check if tenant exists
        # Skip tenant creation for now - using existing database
        tenant = None
        # stmt = select(Tenant).where(Tenant.id == self.tenant_id)
        # tenant = self.db.execute(stmt).scalar_one_or_none()
        if not tenant:
            tenant = Tenant(
                id=self.tenant_id,
                tenant_uuid=str(uuid.uuid4()),
                name="Digame Analytics Demo",
                slug="digame-demo",
                domain="demo.digame.ai",
                subdomain="demo",
                subscription_tier="enterprise",
                subscription_status="active",
                admin_email="admin@digame.ai",
                admin_name="Demo Admin",
                max_users=100,
                current_users=25
            )
            self.db.add(tenant)
            self.db.flush()
        
        # Seed demo users with realistic profiles
        demo_users = [
            {"username": "sarah_chen", "email": "sarah.chen@digame.ai", "first_name": "Sarah", "last_name": "Chen", "role": "Product Manager"},
            {"username": "mike_rodriguez", "email": "mike.rodriguez@digame.ai", "first_name": "Mike", "last_name": "Rodriguez", "role": "Senior Developer"},
            {"username": "emily_watson", "email": "emily.watson@digame.ai", "first_name": "Emily", "last_name": "Watson", "role": "UX Designer"},
            {"username": "david_kim", "email": "david.kim@digame.ai", "first_name": "David", "last_name": "Kim", "role": "Data Analyst"},
            {"username": "lisa_johnson", "email": "lisa.johnson@digame.ai", "first_name": "Lisa", "last_name": "Johnson", "role": "Marketing Lead"},
            {"username": "alex_brown", "email": "alex.brown@digame.ai", "first_name": "Alex", "last_name": "Brown", "role": "DevOps Engineer"},
            {"username": "maria_garcia", "email": "maria.garcia@digame.ai", "first_name": "Maria", "last_name": "Garcia", "role": "QA Engineer"},
            {"username": "james_wilson", "email": "james.wilson@digame.ai", "first_name": "James", "last_name": "Wilson", "role": "Sales Manager"},
        ]
        
        for user_data in demo_users:
            # Skip user creation for now - using existing database
            existing_user = None
            # stmt = select(User).where(User.email == user_data["email"])
            # existing_user = self.db.execute(stmt).scalar_one_or_none()
            if not existing_user:
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    hashed_password="$2b$12$demo_hash",  # Demo password hash
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"],
                    tenant_id=self.tenant_id,
                    is_active=True,
                    subscription_tier="team",
                    created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(30, 365))
                )
                self.db.add(user)
                self.db.flush()
                
                # Add user profile
                profile = UserProfile(
                    user_id=user.id,
                    bio=f"Experienced {user_data['role']} with expertise in digital transformation and analytics.",
                    skills=self._generate_skills_for_role(user_data['role']),
                    interests=["Analytics", "Digital Transformation", "Team Collaboration"],
                    location=random.choice(["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Remote"])
                )
                self.db.add(profile)
                self.user_ids.append(user.id)
            else:
                self.user_ids.append(existing_user.id)
    
    def _generate_skills_for_role(self, role: str) -> List[str]:
        """Generate realistic skills based on role"""
        skill_sets = {
            "Product Manager": ["Product Strategy", "User Research", "Analytics", "Agile", "Roadmapping"],
            "Senior Developer": ["Python", "JavaScript", "React", "FastAPI", "Database Design"],
            "UX Designer": ["User Experience", "Figma", "Prototyping", "User Research", "Design Systems"],
            "Data Analyst": ["SQL", "Python", "Data Visualization", "Statistics", "Machine Learning"],
            "Marketing Lead": ["Digital Marketing", "Content Strategy", "SEO", "Analytics", "Campaign Management"],
            "DevOps Engineer": ["Docker", "Kubernetes", "CI/CD", "AWS", "Infrastructure as Code"],
            "QA Engineer": ["Test Automation", "Quality Assurance", "Bug Tracking", "Performance Testing"],
            "Sales Manager": ["Sales Strategy", "CRM", "Lead Generation", "Customer Relations", "Negotiation"]
        }
        return skill_sets.get(role, ["General Skills", "Communication", "Problem Solving"])
    
    async def seed_user_activities(self):
        """Seed realistic user activities for behavior analytics"""
        print("📊 Seeding user activities...")
        
        activity_types = [
            "login", "logout", "page_view", "feature_usage", "document_created", 
            "document_edited", "collaboration_session", "search_query", "export_data",
            "dashboard_view", "report_generated", "settings_changed", "profile_updated"
        ]
        
        # Generate activities for the last 90 days
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=90)
        
        for user_id in self.user_ids:
            # Generate 50-200 activities per user with realistic patterns
            activity_count = random.randint(50, 200)
            
            for _ in range(activity_count):
                # Create realistic timestamp patterns (more activity during work hours)
                days_ago = random.randint(0, 90)
                hour = random.choices(
                    range(24), 
                    weights=[1, 1, 1, 1, 1, 2, 3, 5, 8, 10, 10, 8, 6, 8, 10, 10, 8, 6, 4, 3, 2, 2, 1, 1]
                )[0]
                
                activity_time = end_date - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
                
                activity = Activity(
                    user_id=user_id,
                    activity_type=random.choice(activity_types),
                    timestamp=activity_time,
                    details={
                        "session_duration": random.randint(60, 3600),  # 1 minute to 1 hour
                        "page_path": f"/app/{random.choice(['dashboard', 'analytics', 'projects', 'settings', 'profile'])}",
                        "device_type": random.choice(["desktop", "mobile", "tablet"]),
                        "browser": random.choice(["Chrome", "Firefox", "Safari", "Edge"]),
                        "location": random.choice(["US", "CA", "UK", "DE", "FR"])
                    }
                )
                self.db.add(activity)
    
    async def seed_analytics_models(self):
        """Seed analytics models for predictions and insights"""
        print("🤖 Seeding analytics models...")
        
        models_config = [
            {
                "name": "user_engagement_predictor",
                "display_name": "User Engagement Prediction",
                "description": "Predicts user engagement levels based on activity patterns",
                "model_type": "engagement",
                "algorithm": "random_forest",
                "features": ["login_frequency", "session_duration", "feature_usage_count", "collaboration_score"],
                "target_variable": "engagement_score"
            },
            {
                "name": "churn_risk_model",
                "display_name": "Churn Risk Assessment",
                "description": "Identifies users at risk of churning based on behavior patterns",
                "model_type": "churn",
                "algorithm": "gradient_boosting",
                "features": ["days_since_last_login", "activity_decline_rate", "support_tickets", "feature_adoption"],
                "target_variable": "churn_probability"
            },
            {
                "name": "productivity_optimizer",
                "display_name": "Productivity Optimization",
                "description": "Analyzes and predicts productivity improvements",
                "model_type": "productivity",
                "algorithm": "neural_network",
                "features": ["task_completion_rate", "collaboration_frequency", "tool_usage_efficiency"],
                "target_variable": "productivity_score"
            },
            {
                "name": "revenue_forecaster",
                "display_name": "Revenue Forecasting",
                "description": "Forecasts revenue based on user behavior and subscription patterns",
                "model_type": "revenue",
                "algorithm": "time_series",
                "features": ["user_growth_rate", "subscription_upgrades", "feature_usage_trends"],
                "target_variable": "monthly_revenue"
            }
        ]
        
        for model_config in models_config:
            model = AnalyticsModel(
                model_uuid=str(uuid.uuid4()),
                tenant_id=self.tenant_id,
                name=model_config["name"],
                display_name=model_config["display_name"],
                description=model_config["description"],
                model_type=model_config["model_type"],
                category="predictive",
                algorithm=model_config["algorithm"],
                features=model_config["features"],
                target_variable=model_config["target_variable"],
                training_data_source="user_activities",
                status="deployed",
                is_active=True,
                is_production=True,
                accuracy_score=random.uniform(0.75, 0.95),
                precision_score=random.uniform(0.70, 0.90),
                recall_score=random.uniform(0.65, 0.85),
                f1_score=random.uniform(0.70, 0.88),
                last_trained_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30)),
                prediction_count=random.randint(100, 1000),
                created_by_user_id=self.user_ids[0] if self.user_ids else 1
            )
            self.db.add(model)
            self.db.flush()
            self.model_ids.append(model.id)
    
    async def seed_performance_metrics(self):
        """Seed historical performance metrics with realistic trends"""
        print("📈 Seeding performance metrics...")
        
        metrics_config = [
            {
                "name": "user_engagement_rate",
                "display_name": "User Engagement Rate",
                "type": "engagement",
                "unit": "percentage",
                "baseline": 65.0,
                "target": 80.0
            },
            {
                "name": "daily_active_users",
                "display_name": "Daily Active Users",
                "type": "usage",
                "unit": "count",
                "baseline": 150.0,
                "target": 200.0
            },
            {
                "name": "feature_adoption_rate",
                "display_name": "Feature Adoption Rate",
                "type": "adoption",
                "unit": "percentage",
                "baseline": 45.0,
                "target": 70.0
            },
            {
                "name": "customer_satisfaction",
                "display_name": "Customer Satisfaction Score",
                "type": "satisfaction",
                "unit": "score",
                "baseline": 7.2,
                "target": 8.5
            },
            {
                "name": "task_completion_rate",
                "display_name": "Task Completion Rate",
                "type": "productivity",
                "unit": "percentage",
                "baseline": 78.0,
                "target": 90.0
            }
        ]
        
        # Generate metrics for the last 90 days
        end_date = datetime.now(timezone.utc)
        
        for metric_config in metrics_config:
            for days_ago in range(90):
                metric_date = end_date - timedelta(days=days_ago)
                
                # Create realistic trends with seasonal variations
                trend_factor = 1 + (0.1 * random.random() - 0.05)  # ±5% random variation
                seasonal_factor = 1 + 0.1 * math.sin(2 * math.pi * days_ago / 30)  # Monthly cycle
                
                current_value = float(metric_config["baseline"]) * trend_factor * seasonal_factor
                previous_value = current_value * (1 + random.uniform(-0.1, 0.1))
                
                metric = PerformanceMetric(
                    metric_uuid=str(uuid.uuid4()),
                    tenant_id=self.tenant_id,
                    metric_name=metric_config["name"],
                    display_name=metric_config["display_name"],
                    metric_type=metric_config["type"],
                    category="system",
                    entity_type="tenant",
                    entity_id=self.tenant_id,
                    measurement_unit=metric_config["unit"],
                    calculation_method="average",
                    current_value=current_value,
                    previous_value=previous_value,
                    baseline_value=metric_config["baseline"],
                    target_value=metric_config["target"],
                    measurement_date=metric_date,
                    period_start=metric_date.replace(hour=0, minute=0, second=0),
                    period_end=metric_date.replace(hour=23, minute=59, second=59),
                    period_type="daily",
                    data_completeness=random.uniform(0.85, 1.0),
                    confidence_score=random.uniform(0.80, 0.95)
                )
                
                # Calculate trend
                metric.calculate_trend()
                self.db.add(metric)
    
    async def seed_analytics_predictions(self):
        """Seed analytics predictions for each model"""
        print("🔮 Seeding analytics predictions...")
        
        for model_id in self.model_ids:
            model = self.db.get(AnalyticsModel, model_id)
            if not model:
                continue
                
            # Generate predictions for each user
            for user_id in self.user_ids:
                # Generate 5-15 predictions per user per model
                prediction_count = random.randint(5, 15)
                
                for _ in range(prediction_count):
                    prediction_date = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))
                    
                    # Generate realistic prediction values based on model type
                    if model.model_type == "engagement":
                        predicted_value = random.uniform(0.3, 0.95)
                        confidence = random.uniform(0.70, 0.90)
                    elif model.model_type == "churn":
                        predicted_value = random.uniform(0.05, 0.40)
                        confidence = random.uniform(0.75, 0.95)
                    elif model.model_type == "productivity":
                        predicted_value = random.uniform(60.0, 95.0)
                        confidence = random.uniform(0.65, 0.85)
                    elif model.model_type == "revenue":
                        predicted_value = random.uniform(1000.0, 5000.0)
                        confidence = random.uniform(0.60, 0.80)
                    else:
                        predicted_value = random.uniform(0.0, 100.0)
                        confidence = random.uniform(0.70, 0.90)
                    
                    prediction = AnalyticsPrediction(
                        prediction_uuid=str(uuid.uuid4()),
                        tenant_id=self.tenant_id,
                        model_id=model_id,
                        entity_type="user",
                        entity_id=user_id,
                        prediction_type=model.model_type,
                        input_features={
                            "feature_1": random.uniform(0, 100),
                            "feature_2": random.uniform(0, 100),
                            "feature_3": random.uniform(0, 100)
                        },
                        predicted_value=predicted_value,
                        confidence_score=confidence,
                        prediction_interval_lower=predicted_value * 0.8,
                        prediction_interval_upper=predicted_value * 1.2,
                        prediction_date=prediction_date,
                        expires_at=prediction_date + timedelta(days=30)
                    )
                    self.db.add(prediction)
    
    async def seed_roi_calculations(self):
        """Seed ROI calculations for different initiatives"""
        print("💰 Seeding ROI calculations...")
        
        roi_scenarios = [
            {
                "name": "Analytics Platform Implementation",
                "entity_type": "project",
                "initial_investment": 50000,
                "operational_costs": 5000,
                "revenue_increase": 75000,
                "cost_savings": 25000
            },
            {
                "name": "User Experience Optimization",
                "entity_type": "project", 
                "initial_investment": 30000,
                "operational_costs": 3000,
                "revenue_increase": 45000,
                "productivity_gains": 15000
            },
            {
                "name": "Automation Implementation",
                "entity_type": "feature",
                "initial_investment": 25000,
                "operational_costs": 2000,
                "cost_savings": 40000,
                "efficiency_gains": 20000
            }
        ]
        
        for i, scenario in enumerate(roi_scenarios):
            period_start = datetime.now(timezone.utc) - timedelta(days=90)
            period_end = datetime.now(timezone.utc)
            
            roi_calc = ROICalculation(
                calculation_uuid=str(uuid.uuid4()),
                tenant_id=self.tenant_id,
                entity_type=scenario["entity_type"],
                entity_id=i + 1,
                calculation_name=scenario["name"],
                description=f"ROI analysis for {scenario['name']} initiative",
                period_start=period_start,
                period_end=period_end,
                period_days=90,
                initial_investment=Decimal(str(scenario["initial_investment"])),
                operational_costs=Decimal(str(scenario["operational_costs"])),
                revenue_increase=Decimal(str(scenario.get("revenue_increase", 0))),
                cost_savings=Decimal(str(scenario.get("cost_savings", 0))),
                productivity_gains=Decimal(str(scenario.get("productivity_gains", 0))),
                efficiency_gains=Decimal(str(scenario.get("efficiency_gains", 0))),
                calculated_by_user_id=self.user_ids[0] if self.user_ids else 1,
                confidence_level=random.uniform(0.75, 0.95)
            )
            
            # Calculate totals and ROI metrics
            roi_calc.update_totals()
            roi_calc.calculate_roi_metrics()
            
            self.db.add(roi_calc)
    
    async def seed_analytics_dashboards(self):
        """Seed sample analytics dashboards"""
        print("📊 Seeding analytics dashboards...")
        
        dashboard_configs = [
            {
                "name": "Executive Overview",
                "description": "High-level metrics and KPIs for executive team",
                "widgets": [
                    {"type": "kpi_card", "title": "Monthly Revenue", "data_source": "revenue_metrics"},
                    {"type": "line_chart", "title": "User Growth Trend", "data_source": "user_growth"},
                    {"type": "bar_chart", "title": "Feature Adoption", "data_source": "feature_usage"},
                    {"type": "gauge", "title": "Customer Satisfaction", "data_source": "satisfaction_score"}
                ]
            },
            {
                "name": "User Behavior Analytics",
                "description": "Detailed user behavior and engagement analytics",
                "widgets": [
                    {"type": "heatmap", "title": "User Activity Heatmap", "data_source": "activity_patterns"},
                    {"type": "funnel", "title": "User Journey Funnel", "data_source": "conversion_funnel"},
                    {"type": "table", "title": "Top Users by Engagement", "data_source": "user_rankings"},
                    {"type": "pie_chart", "title": "Device Usage Distribution", "data_source": "device_analytics"}
                ]
            }
        ]
        
        for dashboard_config in dashboard_configs:
            dashboard = AnalyticsDashboard(
                dashboard_uuid=str(uuid.uuid4()),
                tenant_id=self.tenant_id,
                user_id=self.user_ids[0] if self.user_ids else 1,
                name=dashboard_config["name"],
                description=dashboard_config["description"],
                tags=["analytics", "dashboard", "metrics"],
                layout=[]
            )
            self.db.add(dashboard)
            self.db.flush()
            
            # Add widgets to dashboard
            widgets = dashboard_config.get("widgets", [])
            if isinstance(widgets, list):
                for i, widget_config in enumerate(widgets):
                    widget = DashboardWidgetConfig(
                    widget_uuid=str(uuid.uuid4()),
                    dashboard_id=dashboard.id,
                    tenant_id=self.tenant_id,
                    widget_type=widget_config["type"],
                    title=widget_config["title"],
                    data_source_config={
                        "type": widget_config["data_source"],
                        "params": {"time_range": "last_30_days"}
                    },
                    display_options={
                        "color_scheme": "blue",
                        "show_legend": True,
                        "animation": True
                    }
                    )
                    self.db.add(widget)
                    
                    # Update dashboard layout
                    dashboard.layout.append({
                        "widget_id": widget.id,
                        "x": (i % 2) * 6,
                        "y": (i // 2) * 4,
                        "w": 6,
                        "h": 4
                    })


# Import math for seasonal calculations
import math


async def seed_analytics_database():
    """Main function to seed analytics database"""
    async with AnalyticsDataSeeder() as seeder:
        await seeder.seed_all_data()


if __name__ == "__main__":
    asyncio.run(seed_analytics_database())