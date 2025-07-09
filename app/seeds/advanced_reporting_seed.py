"""
Advanced Reporting Database Seeding Script
Creates comprehensive seed data for reporting models with realistic business intelligence patterns
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.reporting_models import (
    ReportTemplate, ReportExecution, DataSource, VisualizationMetric,
    PredictiveModel, ModelPrediction, ReportSchedule, ReportInsight
)
import json
import random

def seed_advanced_reporting_data():
    """Seed comprehensive advanced reporting data"""
    db = next(get_db())
    
    try:
        # Clear existing data
        db.query(ReportInsight).delete()
        db.query(ModelPrediction).delete()
        db.query(PredictiveModel).delete()
        db.query(ReportSchedule).delete()
        db.query(ReportExecution).delete()
        db.query(VisualizationMetric).delete()
        db.query(ReportTemplate).delete()
        db.query(DataSource).delete()
        
        # Seed Data Sources
        data_sources = [
            DataSource(
                name="Analytics Database",
                source_type="database",
                connection_config={
                    "host": "analytics-db.company.com",
                    "database": "analytics",
                    "schema": "public"
                },
                status="active",
                last_sync=datetime.utcnow() - timedelta(hours=1),
                record_count=1250000,
                created_by="system"
            ),
            DataSource(
                name="User Behavior API",
                source_type="api",
                connection_config={
                    "endpoint": "https://api.company.com/behavior",
                    "auth_type": "bearer",
                    "rate_limit": 1000
                },
                status="active",
                last_sync=datetime.utcnow() - timedelta(minutes=30),
                record_count=850000,
                created_by="system"
            ),
            DataSource(
                name="Sales CRM",
                source_type="integration",
                connection_config={
                    "provider": "salesforce",
                    "instance": "company.salesforce.com",
                    "api_version": "v52.0"
                },
                status="active",
                last_sync=datetime.utcnow() - timedelta(hours=2),
                record_count=450000,
                created_by="system"
            ),
            DataSource(
                name="Financial Data Warehouse",
                source_type="database",
                connection_config={
                    "host": "finance-dw.company.com",
                    "database": "finance",
                    "schema": "reporting"
                },
                status="active",
                last_sync=datetime.utcnow() - timedelta(hours=6),
                record_count=2100000,
                created_by="system"
            ),
            DataSource(
                name="Marketing Automation",
                source_type="api",
                connection_config={
                    "endpoint": "https://api.marketo.com/rest",
                    "auth_type": "oauth2",
                    "client_id": "marketing_client"
                },
                status="active",
                last_sync=datetime.utcnow() - timedelta(hours=4),
                record_count=680000,
                created_by="system"
            )
        ]
        
        for ds in data_sources:
            db.add(ds)
        db.flush()
        
        # Seed Report Templates
        report_templates = [
            ReportTemplate(
                name="Executive Dashboard",
                description="High-level KPIs and metrics for executive leadership",
                report_type="dashboard",
                category="executive",
                template_config={
                    "layout": "grid",
                    "refresh_interval": 300,
                    "widgets": [
                        {"type": "kpi", "metric": "revenue", "position": {"x": 0, "y": 0}},
                        {"type": "chart", "chart_type": "line", "metric": "growth", "position": {"x": 1, "y": 0}},
                        {"type": "table", "data_source": "sales", "position": {"x": 0, "y": 1}}
                    ]
                },
                data_sources=[data_sources[0].id, data_sources[2].id],
                created_by="admin",
                is_public=True
            ),
            ReportTemplate(
                name="User Engagement Analysis",
                description="Detailed analysis of user behavior and engagement patterns",
                report_type="analytics",
                category="product",
                template_config={
                    "time_range": "30d",
                    "segments": ["new_users", "returning_users", "power_users"],
                    "metrics": ["session_duration", "page_views", "conversion_rate"],
                    "visualizations": [
                        {"type": "funnel", "stages": ["signup", "activation", "retention"]},
                        {"type": "cohort", "period": "weekly"},
                        {"type": "heatmap", "dimension": "feature_usage"}
                    ]
                },
                data_sources=[data_sources[1].id],
                created_by="product_manager",
                is_public=False
            ),
            ReportTemplate(
                name="Financial Performance Report",
                description="Comprehensive financial metrics and forecasting",
                report_type="financial",
                category="finance",
                template_config={
                    "sections": ["revenue", "expenses", "profitability", "forecasts"],
                    "comparison_periods": ["month_over_month", "year_over_year"],
                    "drill_down": ["department", "product_line", "region"],
                    "charts": [
                        {"type": "waterfall", "metric": "revenue_breakdown"},
                        {"type": "variance", "actual_vs_budget": True},
                        {"type": "trend", "forecast_periods": 6}
                    ]
                },
                data_sources=[data_sources[3].id],
                created_by="finance_director",
                is_public=False
            ),
            ReportTemplate(
                name="Marketing Campaign Performance",
                description="ROI and effectiveness analysis of marketing campaigns",
                report_type="marketing",
                category="marketing",
                template_config={
                    "campaigns": "all_active",
                    "attribution_model": "multi_touch",
                    "metrics": ["impressions", "clicks", "conversions", "roi", "cac"],
                    "breakdowns": ["channel", "campaign", "audience", "creative"],
                    "visualizations": [
                        {"type": "attribution", "model": "time_decay"},
                        {"type": "performance", "comparison": "benchmark"},
                        {"type": "optimization", "recommendations": True}
                    ]
                },
                data_sources=[data_sources[4].id],
                created_by="marketing_manager",
                is_public=False
            ),
            ReportTemplate(
                name="Operational Efficiency Dashboard",
                description="Real-time operational metrics and performance indicators",
                report_type="operational",
                category="operations",
                template_config={
                    "real_time": True,
                    "alert_thresholds": {"response_time": 500, "error_rate": 0.01},
                    "metrics": ["throughput", "latency", "availability", "resource_utilization"],
                    "monitoring": [
                        {"type": "system_health", "components": ["api", "database", "cache"]},
                        {"type": "performance", "sla_tracking": True},
                        {"type": "capacity", "forecasting": True}
                    ]
                },
                data_sources=[data_sources[0].id, data_sources[1].id],
                created_by="ops_manager",
                is_public=True
            )
        ]
        
        for rt in report_templates:
            db.add(rt)
        db.flush()
        
        # Seed Report Executions
        base_time = datetime.utcnow()
        for i in range(50):
            execution_time = base_time - timedelta(days=random.randint(0, 30), 
                                                 hours=random.randint(0, 23),
                                                 minutes=random.randint(0, 59))
            
            execution = ReportExecution(
                template_id=random.choice(report_templates).id,
                executed_by=random.choice(["admin", "user1", "user2", "manager", "analyst"]),
                execution_time=execution_time,
                status=random.choice(["completed", "completed", "completed", "failed", "running"]),
                parameters={
                    "date_range": f"{random.randint(7, 90)}d",
                    "filters": {"department": random.choice(["sales", "marketing", "product", "engineering"])},
                    "format": random.choice(["dashboard", "pdf", "excel", "csv"])
                },
                execution_duration=random.randint(500, 5000),
                data_points_processed=random.randint(1000, 100000),
                file_size=random.randint(1024, 10485760) if random.random() > 0.3 else None,
                error_message="Timeout connecting to data source" if random.random() < 0.1 else None
            )
            db.add(execution)
        
        # Seed Visualization Metrics
        chart_types = ["line", "bar", "pie", "area", "scatter", "heatmap", "funnel", "gauge"]
        for i in range(30):
            metric = VisualizationMetric(
                chart_type=random.choice(chart_types),
                data_points=random.randint(10, 10000),
                render_time=random.randint(50, 2000),
                load_time=random.randint(100, 3000),
                optimization_score=random.randint(60, 100),
                performance_recommendations=[
                    "Consider data aggregation for large datasets",
                    "Use virtual scrolling for table components",
                    "Implement chart caching for frequently accessed data",
                    "Optimize query performance with proper indexing",
                    "Use progressive loading for complex visualizations"
                ][:random.randint(1, 3)],
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 7))
            )
            db.add(metric)
        
        # Seed Predictive Models
        models = [
            PredictiveModel(
                name="Revenue Forecasting Model",
                model_type="time_series",
                algorithm="LSTM",
                target_metric="monthly_revenue",
                features=["historical_revenue", "seasonality", "marketing_spend", "user_growth", "economic_indicators"],
                accuracy_score=0.91,
                precision_score=0.89,
                recall_score=0.93,
                f1_score=0.91,
                training_data_size=125000,
                last_trained=datetime.utcnow() - timedelta(days=7),
                model_config={
                    "lookback_window": 12,
                    "forecast_horizon": 6,
                    "seasonality_components": ["monthly", "quarterly"],
                    "external_factors": ["marketing_budget", "product_launches"]
                },
                status="active",
                created_by="data_scientist"
            ),
            PredictiveModel(
                name="User Churn Prediction",
                model_type="classification",
                algorithm="Random Forest",
                target_metric="user_churn",
                features=["usage_frequency", "feature_adoption", "support_tickets", "payment_history", "engagement_score"],
                accuracy_score=0.88,
                precision_score=0.85,
                recall_score=0.91,
                f1_score=0.88,
                training_data_size=85000,
                last_trained=datetime.utcnow() - timedelta(days=3),
                model_config={
                    "prediction_window": "30_days",
                    "feature_importance": {
                        "usage_frequency": 0.35,
                        "engagement_score": 0.28,
                        "feature_adoption": 0.22,
                        "support_tickets": 0.15
                    },
                    "threshold": 0.7
                },
                status="active",
                created_by="ml_engineer"
            ),
            PredictiveModel(
                name="Performance Optimization Model",
                model_type="regression",
                algorithm="Gradient Boosting",
                target_metric="system_performance",
                features=["cpu_usage", "memory_usage", "network_latency", "request_volume", "cache_hit_rate"],
                accuracy_score=0.83,
                precision_score=0.81,
                recall_score=0.85,
                f1_score=0.83,
                training_data_size=200000,
                last_trained=datetime.utcnow() - timedelta(days=1),
                model_config={
                    "optimization_target": "response_time",
                    "constraints": {"max_cpu": 80, "max_memory": 85},
                    "prediction_interval": "hourly",
                    "alert_thresholds": {"critical": 0.9, "warning": 0.7}
                },
                status="active",
                created_by="devops_engineer"
            )
        ]
        
        for model in models:
            db.add(model)
        db.flush()
        
        # Seed Model Predictions
        for model in models:
            for i in range(20):
                prediction_time = datetime.utcnow() - timedelta(days=random.randint(0, 14),
                                                              hours=random.randint(0, 23))
                
                if model.model_type == "time_series":
                    predicted_value = random.uniform(200000, 350000)  # Revenue
                elif model.model_type == "classification":
                    predicted_value = random.uniform(0.1, 0.9)  # Churn probability
                else:
                    predicted_value = random.uniform(150, 300)  # Performance metric
                
                prediction = ModelPrediction(
                    model_id=model.id,
                    prediction_time=prediction_time,
                    predicted_value=predicted_value,
                    confidence_score=random.uniform(0.7, 0.95),
                    actual_value=predicted_value * random.uniform(0.85, 1.15) if random.random() > 0.3 else None,
                    feature_values={
                        "feature_1": random.uniform(0, 100),
                        "feature_2": random.uniform(0, 100),
                        "feature_3": random.uniform(0, 100)
                    },
                    prediction_metadata={
                        "model_version": "1.2.0",
                        "prediction_id": f"pred_{model.id}_{i}",
                        "batch_id": f"batch_{random.randint(1000, 9999)}"
                    }
                )
                db.add(prediction)
        
        # Seed Report Schedules
        schedules = [
            ReportSchedule(
                template_id=report_templates[0].id,  # Executive Dashboard
                schedule_name="Daily Executive Summary",
                frequency="daily",
                schedule_config={
                    "time": "08:00",
                    "timezone": "UTC",
                    "weekdays_only": True
                },
                recipients=["ceo@company.com", "cfo@company.com", "coo@company.com"],
                output_format="pdf",
                is_active=True,
                created_by="admin",
                last_run=datetime.utcnow() - timedelta(days=1),
                next_run=datetime.utcnow() + timedelta(days=1)
            ),
            ReportSchedule(
                template_id=report_templates[1].id,  # User Engagement
                schedule_name="Weekly Product Metrics",
                frequency="weekly",
                schedule_config={
                    "day_of_week": "monday",
                    "time": "09:00",
                    "timezone": "UTC"
                },
                recipients=["product@company.com", "analytics@company.com"],
                output_format="dashboard",
                is_active=True,
                created_by="product_manager",
                last_run=datetime.utcnow() - timedelta(weeks=1),
                next_run=datetime.utcnow() + timedelta(days=7)
            ),
            ReportSchedule(
                template_id=report_templates[2].id,  # Financial Performance
                schedule_name="Monthly Financial Report",
                frequency="monthly",
                schedule_config={
                    "day_of_month": 1,
                    "time": "10:00",
                    "timezone": "UTC"
                },
                recipients=["finance@company.com", "board@company.com"],
                output_format="excel",
                is_active=True,
                created_by="finance_director",
                last_run=datetime.utcnow() - timedelta(days=30),
                next_run=datetime.utcnow() + timedelta(days=30)
            )
        ]
        
        for schedule in schedules:
            db.add(schedule)
        
        # Seed Report Insights
        insights = [
            ReportInsight(
                insight_type="performance",
                title="Revenue Growth Acceleration",
                description="Monthly revenue growth has increased by 23% compared to the previous quarter, driven primarily by new customer acquisition and improved retention rates.",
                priority="high",
                action_required=True,
                recommended_actions=[
                    "Increase marketing budget allocation to high-performing channels",
                    "Expand customer success team to maintain retention momentum",
                    "Consider premium tier pricing optimization"
                ],
                confidence_score=0.92,
                data_sources=["sales_data", "customer_analytics"],
                generated_by="revenue_model",
                expires_at=datetime.utcnow() + timedelta(days=30)
            ),
            ReportInsight(
                insight_type="optimization",
                title="API Performance Bottleneck Detected",
                description="The user authentication API is experiencing 15% higher latency during peak hours (9-11 AM), potentially impacting user experience and conversion rates.",
                priority="medium",
                action_required=True,
                recommended_actions=[
                    "Implement caching layer for authentication tokens",
                    "Scale API infrastructure during peak hours",
                    "Optimize database queries for user lookup operations"
                ],
                confidence_score=0.87,
                data_sources=["performance_logs", "user_analytics"],
                generated_by="performance_model",
                expires_at=datetime.utcnow() + timedelta(days=14)
            ),
            ReportInsight(
                insight_type="trend",
                title="Mobile Usage Trend Shift",
                description="Mobile app usage has increased by 45% over the past month, now representing 68% of total user sessions. Desktop usage continues to decline.",
                priority="medium",
                action_required=False,
                recommended_actions=[
                    "Prioritize mobile-first feature development",
                    "Optimize mobile user experience and performance",
                    "Consider mobile-specific monetization strategies"
                ],
                confidence_score=0.94,
                data_sources=["user_behavior", "session_analytics"],
                generated_by="trend_analysis",
                expires_at=datetime.utcnow() + timedelta(days=45)
            ),
            ReportInsight(
                insight_type="anomaly",
                title="Unusual Spike in Support Tickets",
                description="Support ticket volume increased by 180% in the last 48 hours, primarily related to login issues and payment processing errors.",
                priority="high",
                action_required=True,
                recommended_actions=[
                    "Investigate authentication service stability",
                    "Check payment gateway integration status",
                    "Increase support team capacity temporarily",
                    "Prepare customer communication about known issues"
                ],
                confidence_score=0.98,
                data_sources=["support_system", "error_logs"],
                generated_by="anomaly_detection",
                expires_at=datetime.utcnow() + timedelta(days=7)
            ),
            ReportInsight(
                insight_type="prediction",
                title="Projected Q1 Revenue Target Achievement",
                description="Based on current trends and pipeline analysis, there's an 85% probability of achieving Q1 revenue targets, with potential for 12% over-performance.",
                priority="low",
                action_required=False,
                recommended_actions=[
                    "Maintain current sales velocity",
                    "Focus on high-value deal closure",
                    "Prepare for potential capacity scaling needs"
                ],
                confidence_score=0.85,
                data_sources=["sales_pipeline", "revenue_history"],
                generated_by="revenue_forecast",
                expires_at=datetime.utcnow() + timedelta(days=90)
            )
        ]
        
        for insight in insights:
            db.add(insight)
        
        db.commit()
        print("✅ Advanced reporting data seeded successfully!")
        print(f"   - {len(data_sources)} data sources")
        print(f"   - {len(report_templates)} report templates")
        print(f"   - 50 report executions")
        print(f"   - 30 visualization metrics")
        print(f"   - {len(models)} predictive models")
        print(f"   - 60 model predictions")
        print(f"   - {len(schedules)} report schedules")
        print(f"   - {len(insights)} report insights")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding advanced reporting data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_advanced_reporting_data()