#!/usr/bin/env python3
"""
Seed script for AI/ML Dashboard data
Creates realistic ML models, predictions, insights, and automation rules
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
from decimal import Decimal
from sqlalchemy import text

from app.database import get_db
from app.models.analytics import AnalyticsModel, AnalyticsPrediction, ROICalculation, PerformanceMetric
from app.models.user import User
from app.models.tenant import Tenant

def seed_aiml_data():
    """Seed AI/ML dashboard data"""
    db = next(get_db())
    
    try:
        # Use raw SQL to check for existing data and create if needed
        # Check for existing tenant
        tenant_result = db.execute(text("SELECT id, name FROM tenants LIMIT 1")).fetchone()
        if tenant_result:
            tenant_id = tenant_result[0]
            print(f"Using existing tenant: {tenant_result[1]} (ID: {tenant_id})")
        else:
            # Create tenant with raw SQL to avoid schema issues
            db.execute(text("""
                INSERT INTO tenants (name, domain, is_active, admin_email, admin_name, created_at, updated_at)
                VALUES ('Demo Tenant', 'demo.digame.ai', 1, 'admin@demo.digame.ai', 'Demo Admin', datetime('now'), datetime('now'))
            """))
            db.commit()
            tenant_result = db.execute(text("SELECT id, name FROM tenants WHERE name = 'Demo Tenant'")).fetchone()
            tenant_id = tenant_result[0]
            print(f"Created tenant: {tenant_result[1]} (ID: {tenant_id})")
        
        # Check for existing user
        user_result = db.execute(text("SELECT id, email FROM users LIMIT 1")).fetchone()
        if user_result:
            user_id = user_result[0]
            print(f"Using existing user: {user_result[1]} (ID: {user_id})")
        else:
            # Create user with raw SQL
            db.execute(text("""
                INSERT INTO users (email, username, full_name, hashed_password, is_active, tenant_id, created_at, updated_at)
                VALUES ('admin@demo.digame.ai', 'admin', 'Demo Admin', 'hashed_password_here', 1, :tenant_id, datetime('now'), datetime('now'))
            """), {"tenant_id": tenant_id})
            db.commit()
            user_result = db.execute(text("SELECT id, email FROM users WHERE email = 'admin@demo.digame.ai'")).fetchone()
            user_id = user_result[0]
            print(f"Created user: {user_result[1]} (ID: {user_id})")
        
        # Create mock objects for the ORM operations below
        class MockTenant:
            def __init__(self, id):
                self.id = id
        
        class MockUser:
            def __init__(self, id):
                self.id = id
        
        tenant = MockTenant(tenant_id)
        user = MockUser(user_id)
        
        print(f"Using tenant: {tenant.id}, user: {user.id}")
        
        # Create ML Models
        models_data = [
            {
                'name': 'revenue_prediction_model',
                'display_name': 'Revenue Prediction Model',
                'description': 'Predicts monthly revenue based on user behavior and market trends',
                'model_type': 'regression',
                'category': 'predictive',
                'algorithm': 'random_forest_regressor',
                'features': ['user_growth', 'market_conditions', 'seasonal_factors', 'product_adoption'],
                'target_variable': 'monthly_revenue',
                'status': 'trained',
                'is_active': True,
                'is_production': True,
                'accuracy_score': 94.2,
                'r2_score': 0.89,
                'mae_score': 12500.0,
                'prediction_count': 1247,
                'last_trained_at': datetime.utcnow() - timedelta(days=1),
                'last_prediction_at': datetime.utcnow() - timedelta(hours=2),
                'hyperparameters': {'n_estimators': 100, 'max_depth': 10, 'random_state': 42},
                'training_data_source': 'revenue_metrics',
                'training_period_days': 365,
                'retrain_frequency_days': 30,
                'validation_split': 0.2
            },
            {
                'name': 'customer_churn_predictor',
                'display_name': 'Customer Churn Predictor',
                'description': 'Identifies customers at risk of churning within 30 days',
                'model_type': 'classification',
                'category': 'predictive',
                'algorithm': 'logistic_regression',
                'features': ['usage_decline', 'support_tickets', 'login_frequency', 'feature_adoption'],
                'target_variable': 'will_churn',
                'status': 'trained',
                'is_active': True,
                'is_production': True,
                'accuracy_score': 89.7,
                'precision_score': 0.87,
                'recall_score': 0.91,
                'f1_score': 0.89,
                'prediction_count': 856,
                'last_trained_at': datetime.utcnow() - timedelta(days=2),
                'last_prediction_at': datetime.utcnow() - timedelta(hours=1),
                'hyperparameters': {'C': 1.0, 'max_iter': 1000, 'random_state': 42},
                'training_data_source': 'user_behavior',
                'training_period_days': 180,
                'retrain_frequency_days': 14,
                'validation_split': 0.25
            },
            {
                'name': 'anomaly_detection_engine',
                'display_name': 'Anomaly Detection Engine',
                'description': 'Detects unusual patterns in system metrics and user behavior',
                'model_type': 'anomaly_detection',
                'category': 'descriptive',
                'algorithm': 'isolation_forest',
                'features': ['cpu_usage', 'memory_usage', 'request_rate', 'error_rate', 'response_time'],
                'target_variable': 'is_anomaly',
                'status': 'trained',
                'is_active': True,
                'is_production': True,
                'accuracy_score': 96.8,
                'precision_score': 0.95,
                'recall_score': 0.97,
                'f1_score': 0.96,
                'prediction_count': 2341,
                'last_trained_at': datetime.utcnow() - timedelta(days=3),
                'last_prediction_at': datetime.utcnow() - timedelta(minutes=15),
                'hyperparameters': {'contamination': 0.1, 'random_state': 42},
                'training_data_source': 'system_metrics',
                'training_period_days': 90,
                'retrain_frequency_days': 7,
                'validation_split': 0.2
            },
            {
                'name': 'sentiment_analysis_model',
                'display_name': 'Sentiment Analysis Model',
                'description': 'Analyzes customer feedback and support ticket sentiment',
                'model_type': 'nlp',
                'category': 'descriptive',
                'algorithm': 'transformer_bert',
                'features': ['text_content', 'word_count', 'sentiment_keywords'],
                'target_variable': 'sentiment_score',
                'status': 'training',
                'is_active': False,
                'is_production': False,
                'accuracy_score': None,
                'prediction_count': 0,
                'last_trained_at': None,
                'last_prediction_at': None,
                'hyperparameters': {'learning_rate': 0.001, 'batch_size': 32, 'epochs': 10},
                'training_data_source': 'support_tickets',
                'training_period_days': 180,
                'retrain_frequency_days': 30,
                'validation_split': 0.2
            }
        ]
        
        created_models = []
        for model_data in models_data:
            model = AnalyticsModel()
            setattr(model, 'model_uuid', str(uuid.uuid4()))
            setattr(model, 'tenant_id', tenant.id)
            setattr(model, 'created_by_user_id', user.id)
            setattr(model, 'created_at', datetime.utcnow())
            setattr(model, 'updated_at', datetime.utcnow())
            
            for key, value in model_data.items():
                setattr(model, key, value)
            
            db.add(model)
            db.commit()
            db.refresh(model)
            created_models.append(model)
            print(f"Created model: {model.display_name}")
        
        # Create Predictions
        predictions_data = [
            {
                'model_id': created_models[0].id,  # Revenue model
                'entity_type': 'tenant',
                'entity_id': tenant.id,
                'prediction_type': 'revenue',
                'input_features': {
                    'user_growth': 15.3,
                    'market_conditions': 'positive',
                    'seasonal_factors': 1.2,
                    'product_adoption': 0.78
                },
                'predicted_value': 2450000.0,
                'confidence_score': 0.92,
                'prediction_interval_lower': 2200000.0,
                'prediction_interval_upper': 2700000.0,
                'prediction_date': datetime.utcnow() - timedelta(hours=1),
                'status': 'completed',
                'raw_prediction_output': {
                    'revenue': 2450000,
                    'confidence_interval': [2200000, 2700000],
                    'feature_importance': {
                        'user_growth': 0.35,
                        'market_conditions': 0.28,
                        'seasonal_factors': 0.22,
                        'product_adoption': 0.15
                    }
                }
            },
            {
                'model_id': created_models[1].id,  # Churn model
                'entity_type': 'user',
                'entity_id': user.id,
                'prediction_type': 'churn',
                'input_features': {
                    'usage_decline': 45,
                    'support_tickets': 3,
                    'login_frequency': 2,
                    'feature_adoption': 0.3
                },
                'predicted_value': 0.87,
                'confidence_score': 0.89,
                'prediction_date': datetime.utcnow() - timedelta(minutes=30),
                'status': 'completed',
                'raw_prediction_output': {
                    'churn_probability': 0.87,
                    'risk_level': 'high',
                    'recommended_actions': ['retention_campaign', 'personal_outreach', 'feature_training']
                }
            },
            {
                'model_id': created_models[2].id,  # Anomaly model
                'entity_type': 'system',
                'entity_id': 1,
                'prediction_type': 'anomaly',
                'input_features': {
                    'cpu_usage': 95.2,
                    'memory_usage': 87.5,
                    'request_rate': 1250,
                    'error_rate': 0.05,
                    'response_time': 850
                },
                'predicted_value': 0.94,
                'confidence_score': 0.96,
                'prediction_date': datetime.utcnow() - timedelta(minutes=15),
                'status': 'completed',
                'raw_prediction_output': {
                    'anomaly_score': 0.94,
                    'is_anomaly': True,
                    'affected_metrics': ['cpu_usage', 'response_time'],
                    'severity': 'high'
                }
            }
        ]
        
        for pred_data in predictions_data:
            prediction = AnalyticsPrediction()
            setattr(prediction, 'prediction_uuid', str(uuid.uuid4()))
            setattr(prediction, 'tenant_id', tenant.id)
            setattr(prediction, 'created_by_user_id', user.id)
            setattr(prediction, 'created_at', datetime.utcnow())
            setattr(prediction, 'updated_at', datetime.utcnow())
            
            for key, value in pred_data.items():
                setattr(prediction, key, value)
            
            db.add(prediction)
            db.commit()
            db.refresh(prediction)
            print(f"Created prediction: {prediction.prediction_type}")
        
        # Create Performance Metrics for AI insights
        metrics_data = [
            {
                'metric_name': 'model_accuracy_trend',
                'display_name': 'Model Accuracy Trend',
                'metric_type': 'performance',
                'category': 'ai_performance',
                'entity_type': 'model',
                'entity_id': created_models[0].id,
                'measurement_unit': 'percentage',
                'calculation_method': 'average',
                'current_value': 94.2,
                'previous_value': 92.1,
                'target_value': 95.0,
                'trend_direction': 'increasing',
                'trend_percentage': 2.28,
                'trend_significance': 'minor',
                'period_start': datetime.utcnow() - timedelta(days=7),
                'period_end': datetime.utcnow(),
                'period_type': 'weekly',
                'alert_status': 'normal',
                'dimensions_values': {
                    'model_type': 'revenue_prediction',
                    'environment': 'production'
                }
            },
            {
                'metric_name': 'prediction_volume',
                'display_name': 'Daily Prediction Volume',
                'metric_type': 'usage',
                'category': 'ai_usage',
                'entity_type': 'tenant',
                'entity_id': tenant.id,
                'measurement_unit': 'count',
                'calculation_method': 'sum',
                'current_value': 4444.0,  # Sum of all model predictions
                'previous_value': 3890.0,
                'target_value': 5000.0,
                'trend_direction': 'increasing',
                'trend_percentage': 14.24,
                'trend_significance': 'significant',
                'period_start': datetime.utcnow() - timedelta(days=1),
                'period_end': datetime.utcnow(),
                'period_type': 'daily',
                'alert_status': 'normal',
                'dimensions_values': {
                    'metric_source': 'ai_predictions',
                    'aggregation_level': 'tenant'
                }
            }
        ]
        
        for metric_data in metrics_data:
            metric = PerformanceMetric()
            setattr(metric, 'metric_uuid', str(uuid.uuid4()))
            setattr(metric, 'tenant_id', tenant.id)
            setattr(metric, 'measured_by_user_id', user.id)
            setattr(metric, 'created_at', datetime.utcnow())
            setattr(metric, 'updated_at', datetime.utcnow())
            
            for key, value in metric_data.items():
                setattr(metric, key, value)
            
            db.add(metric)
            db.commit()
            db.refresh(metric)
            print(f"Created metric: {metric.display_name}")
        
        # Create ROI Calculation for AI investment
        roi_calc = ROICalculation()
        setattr(roi_calc, 'calculation_uuid', str(uuid.uuid4()))
        setattr(roi_calc, 'tenant_id', tenant.id)
        setattr(roi_calc, 'calculated_by_user_id', user.id)
        setattr(roi_calc, 'entity_type', 'ai_initiative')
        setattr(roi_calc, 'entity_id', 1)
        setattr(roi_calc, 'calculation_name', 'AI/ML Platform ROI')
        setattr(roi_calc, 'description', 'ROI calculation for AI/ML platform implementation')
        setattr(roi_calc, 'period_start', datetime.utcnow() - timedelta(days=365))
        setattr(roi_calc, 'period_end', datetime.utcnow())
        setattr(roi_calc, 'period_days', 365)
        setattr(roi_calc, 'initial_investment', Decimal('250000.00'))
        setattr(roi_calc, 'operational_costs', Decimal('120000.00'))
        setattr(roi_calc, 'technology_costs', Decimal('80000.00'))
        setattr(roi_calc, 'training_costs', Decimal('50000.00'))
        setattr(roi_calc, 'revenue_increase', Decimal('450000.00'))
        setattr(roi_calc, 'cost_savings', Decimal('180000.00'))
        setattr(roi_calc, 'productivity_gains', Decimal('120000.00'))
        setattr(roi_calc, 'efficiency_gains', Decimal('90000.00'))
        setattr(roi_calc, 'total_investment', Decimal('500000.00'))
        setattr(roi_calc, 'total_benefits', Decimal('840000.00'))
        setattr(roi_calc, 'roi_percentage', 68.0)
        setattr(roi_calc, 'roi_category', 'excellent')
        setattr(roi_calc, 'data_sources', ['model_performance', 'prediction_accuracy', 'cost_reduction'])
        setattr(roi_calc, 'created_at', datetime.utcnow())
        setattr(roi_calc, 'updated_at', datetime.utcnow())
        
        db.add(roi_calc)
        db.commit()
        db.refresh(roi_calc)
        print(f"Created ROI calculation: {roi_calc.calculation_name}")
        
        print(f"\n✅ Successfully seeded AI/ML data:")
        print(f"   - {len(created_models)} ML models")
        print(f"   - {len(predictions_data)} predictions")
        print(f"   - {len(metrics_data)} performance metrics")
        print(f"   - 1 ROI calculation")
        
    except Exception as e:
        print(f"❌ Error seeding AI/ML data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_aiml_data()