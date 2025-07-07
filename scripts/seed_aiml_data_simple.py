#!/usr/bin/env python3
"""
Simple seed script for AI/ML Dashboard data using raw SQL
Creates realistic ML models, predictions, insights, and automation rules
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from datetime import datetime, timedelta
import uuid
import json

from app.database import get_db

def seed_aiml_data():
    """Seed AI/ML dashboard data using raw SQL"""
    db = next(get_db())
    
    try:
        # Get existing tenant and user
        tenant_result = db.execute(text("SELECT id, name FROM tenants LIMIT 1")).fetchone()
        user_result = db.execute(text("SELECT id, email FROM users LIMIT 1")).fetchone()
        
        if not tenant_result or not user_result:
            print("❌ No tenant or user found. Please ensure basic data exists first.")
            return
        
        tenant_id = tenant_result[0]
        user_id = user_result[0]
        print(f"Using tenant: {tenant_result[1]} (ID: {tenant_id})")
        print(f"Using user: {user_result[1]} (ID: {user_id})")
        
        # Create ML Models
        models_data = [
            {
                'model_uuid': str(uuid.uuid4()),
                'tenant_id': tenant_id,
                'name': 'revenue_prediction_model',
                'display_name': 'Revenue Prediction Model',
                'description': 'Predicts monthly revenue based on user behavior and market trends',
                'model_type': 'regression',
                'category': 'predictive',
                'algorithm': 'random_forest_regressor',
                'features': json.dumps(['user_growth', 'market_conditions', 'seasonal_factors', 'product_adoption']),
                'target_variable': 'monthly_revenue',
                'status': 'trained',
                'is_active': True,
                'is_production': True,
                'accuracy_score': 94.2,
                'r2_score': 0.89,
                'mae_score': 12500.0,
                'precision_score': None,
                'recall_score': None,
                'f1_score': None,
                'prediction_count': 1247,
                'last_trained_at': (datetime.now() - timedelta(days=1)).isoformat(),
                'last_prediction_at': (datetime.now() - timedelta(hours=2)).isoformat(),
                'hyperparameters': json.dumps({'n_estimators': 100, 'max_depth': 10, 'random_state': 42}),
                'training_data_source': 'revenue_metrics',
                'training_period_days': 365,
                'retrain_frequency_days': 30,
                'validation_split': 0.2,
                'created_by_user_id': user_id,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            },
            {
                'model_uuid': str(uuid.uuid4()),
                'tenant_id': tenant_id,
                'name': 'customer_churn_predictor',
                'display_name': 'Customer Churn Predictor',
                'description': 'Identifies customers at risk of churning within 30 days',
                'model_type': 'classification',
                'category': 'predictive',
                'algorithm': 'logistic_regression',
                'features': json.dumps(['usage_decline', 'support_tickets', 'login_frequency', 'feature_adoption']),
                'target_variable': 'will_churn',
                'status': 'trained',
                'is_active': True,
                'is_production': True,
                'accuracy_score': 89.7,
                'precision_score': 0.87,
                'recall_score': 0.91,
                'f1_score': 0.89,
                'prediction_count': 856,
                'last_trained_at': (datetime.now() - timedelta(days=2)).isoformat(),
                'last_prediction_at': (datetime.now() - timedelta(hours=1)).isoformat(),
                'hyperparameters': json.dumps({'C': 1.0, 'max_iter': 1000, 'random_state': 42}),
                'training_data_source': 'user_behavior',
                'training_period_days': 180,
                'retrain_frequency_days': 14,
                'validation_split': 0.25,
                'created_by_user_id': user_id,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            },
            {
                'model_uuid': str(uuid.uuid4()),
                'tenant_id': tenant_id,
                'name': 'anomaly_detection_engine',
                'display_name': 'Anomaly Detection Engine',
                'description': 'Detects unusual patterns in system metrics and user behavior',
                'model_type': 'anomaly_detection',
                'category': 'descriptive',
                'algorithm': 'isolation_forest',
                'features': json.dumps(['cpu_usage', 'memory_usage', 'request_rate', 'error_rate', 'response_time']),
                'target_variable': 'is_anomaly',
                'status': 'trained',
                'is_active': True,
                'is_production': True,
                'accuracy_score': 96.8,
                'r2_score': None,
                'mae_score': None,
                'precision_score': 0.95,
                'recall_score': 0.97,
                'f1_score': 0.96,
                'prediction_count': 2341,
                'last_trained_at': (datetime.now() - timedelta(days=3)).isoformat(),
                'last_prediction_at': (datetime.now() - timedelta(minutes=15)).isoformat(),
                'hyperparameters': json.dumps({'contamination': 0.1, 'random_state': 42}),
                'training_data_source': 'system_metrics',
                'training_period_days': 90,
                'retrain_frequency_days': 7,
                'validation_split': 0.2,
                'created_by_user_id': user_id,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            },
            {
                'model_uuid': str(uuid.uuid4()),
                'tenant_id': tenant_id,
                'name': 'sentiment_analysis_model',
                'display_name': 'Sentiment Analysis Model',
                'description': 'Analyzes customer feedback and support ticket sentiment',
                'model_type': 'nlp',
                'category': 'descriptive',
                'algorithm': 'transformer_bert',
                'features': json.dumps(['text_content', 'word_count', 'sentiment_keywords']),
                'target_variable': 'sentiment_score',
                'status': 'training',
                'is_active': False,
                'is_production': False,
                'accuracy_score': None,
                'r2_score': None,
                'mae_score': None,
                'precision_score': None,
                'recall_score': None,
                'f1_score': None,
                'prediction_count': 0,
                'last_trained_at': None,
                'last_prediction_at': None,
                'hyperparameters': json.dumps({'learning_rate': 0.001, 'batch_size': 32, 'epochs': 10}),
                'training_data_source': 'support_tickets',
                'training_period_days': 180,
                'retrain_frequency_days': 30,
                'validation_split': 0.2,
                'created_by_user_id': user_id,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
        ]
        
        # Insert models
        for model_data in models_data:
            db.execute(text("""
                INSERT INTO analytics_models (
                    model_uuid, tenant_id, name, display_name, description, model_type, category, algorithm,
                    features, target_variable, status, is_active, is_production, accuracy_score, r2_score,
                    mae_score, precision_score, recall_score, f1_score, prediction_count, last_trained_at,
                    last_prediction_at, hyperparameters, training_data_source, training_period_days,
                    retrain_frequency_days, validation_split, created_by_user_id, created_at, updated_at
                ) VALUES (
                    :model_uuid, :tenant_id, :name, :display_name, :description, :model_type, :category, :algorithm,
                    :features, :target_variable, :status, :is_active, :is_production, :accuracy_score, :r2_score,
                    :mae_score, :precision_score, :recall_score, :f1_score, :prediction_count, :last_trained_at,
                    :last_prediction_at, :hyperparameters, :training_data_source, :training_period_days,
                    :retrain_frequency_days, :validation_split, :created_by_user_id, :created_at, :updated_at
                )
            """), model_data)
            print(f"Created model: {model_data['display_name']}")
        
        db.commit()
        
        # Get created model IDs
        model_ids = []
        for model_data in models_data:
            result = db.execute(text("SELECT id FROM analytics_models WHERE name = :name"), 
                              {"name": model_data['name']}).fetchone()
            if result:
                model_ids.append(result[0])
        
        # Create Predictions
        predictions_data = [
            {
                'prediction_uuid': str(uuid.uuid4()),
                'tenant_id': tenant_id,
                'model_id': model_ids[0] if model_ids else 1,
                'entity_type': 'tenant',
                'entity_id': tenant_id,
                'prediction_type': 'revenue',
                'input_features': json.dumps({
                    'user_growth': 15.3,
                    'market_conditions': 'positive',
                    'seasonal_factors': 1.2,
                    'product_adoption': 0.78
                }),
                'predicted_value': 2450000.0,
                'confidence_score': 0.92,
                'prediction_interval_lower': 2200000.0,
                'prediction_interval_upper': 2700000.0,
                'prediction_date': (datetime.now() - timedelta(hours=1)).isoformat(),
                'status': 'completed',
                'raw_prediction_output': json.dumps({
                    'revenue': 2450000,
                    'confidence_interval': [2200000, 2700000],
                    'feature_importance': {
                        'user_growth': 0.35,
                        'market_conditions': 0.28,
                        'seasonal_factors': 0.22,
                        'product_adoption': 0.15
                    }
                }),
                'created_by_user_id': user_id,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            },
            {
                'prediction_uuid': str(uuid.uuid4()),
                'tenant_id': tenant_id,
                'model_id': model_ids[1] if len(model_ids) > 1 else 1,
                'entity_type': 'user',
                'entity_id': user_id,
                'prediction_type': 'churn',
                'input_features': json.dumps({
                    'usage_decline': 45,
                    'support_tickets': 3,
                    'login_frequency': 2,
                    'feature_adoption': 0.3
                }),
                'predicted_value': 0.87,
                'confidence_score': 0.89,
                'prediction_date': (datetime.now() - timedelta(minutes=30)).isoformat(),
                'status': 'completed',
                'raw_prediction_output': json.dumps({
                    'churn_probability': 0.87,
                    'risk_level': 'high',
                    'recommended_actions': ['retention_campaign', 'personal_outreach', 'feature_training']
                }),
                'created_by_user_id': user_id,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            },
            {
                'prediction_uuid': str(uuid.uuid4()),
                'tenant_id': tenant_id,
                'model_id': model_ids[2] if len(model_ids) > 2 else 1,
                'entity_type': 'system',
                'entity_id': 1,
                'prediction_type': 'anomaly',
                'input_features': json.dumps({
                    'cpu_usage': 95.2,
                    'memory_usage': 87.5,
                    'request_rate': 1250,
                    'error_rate': 0.05,
                    'response_time': 850
                }),
                'predicted_value': 0.94,
                'confidence_score': 0.96,
                'prediction_date': (datetime.now() - timedelta(minutes=15)).isoformat(),
                'status': 'completed',
                'raw_prediction_output': json.dumps({
                    'anomaly_score': 0.94,
                    'is_anomaly': True,
                    'affected_metrics': ['cpu_usage', 'response_time'],
                    'severity': 'high'
                }),
                'created_by_user_id': user_id,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
        ]
        
        # Insert predictions
        for pred_data in predictions_data:
            db.execute(text("""
                INSERT INTO analytics_predictions (
                    prediction_uuid, tenant_id, model_id, entity_type, entity_id, prediction_type,
                    input_features, predicted_value, confidence_score, prediction_interval_lower,
                    prediction_interval_upper, prediction_date, status, raw_prediction_output,
                    created_by_user_id, created_at, updated_at
                ) VALUES (
                    :prediction_uuid, :tenant_id, :model_id, :entity_type, :entity_id, :prediction_type,
                    :input_features, :predicted_value, :confidence_score, :prediction_interval_lower,
                    :prediction_interval_upper, :prediction_date, :status, :raw_prediction_output,
                    :created_by_user_id, :created_at, :updated_at
                )
            """), pred_data)
            print(f"Created prediction: {pred_data['prediction_type']}")
        
        db.commit()
        
        print(f"\n✅ Successfully seeded AI/ML data:")
        print(f"   - {len(models_data)} ML models")
        print(f"   - {len(predictions_data)} predictions")
        
    except Exception as e:
        print(f"❌ Error seeding AI/ML data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_aiml_data()