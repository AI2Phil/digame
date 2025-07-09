"""
Machine Learning Data Seeding
Production-scale ML models, training jobs, and predictions
"""

import random
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.models.ml_models import (
    MLModel, TrainingJob, ModelPrediction, ModelEvaluation,
    ModelDeployment, DatasetMetadata, ExperimentRun,
    ModelType, ModelStatus, TrainingStatus
)
from app.models.user import User

def seed_ml_data(db: Session) -> Dict[str, int]:
    """
    Seed comprehensive ML data including models, training jobs, predictions, and deployments
    """
    print("🤖 Seeding ML data...")
    
    # Get existing users for foreign key relationships
    users = db.query(User).all()
    if not users:
        print("❌ No users found. Please seed users first.")
        return {"error": 0}
    
    user_ids = [user.id for user in users]
    
    # Clear existing ML data
    print("🧹 Clearing existing ML data...")
    db.query(ModelPrediction).delete()
    db.query(ModelEvaluation).delete()
    db.query(ModelDeployment).delete()
    db.query(TrainingJob).delete()
    db.query(ExperimentRun).delete()
    db.query(DatasetMetadata).delete()
    db.query(MLModel).delete()
    db.commit()
    
    # Seed datasets first
    datasets = seed_datasets(db, user_ids)
    
    # Seed ML models
    models = seed_ml_models(db, user_ids)
    
    # Seed training jobs
    training_jobs = seed_training_jobs(db, models, user_ids)
    
    # Seed model evaluations
    evaluations = seed_model_evaluations(db, models, user_ids)
    
    # Seed model predictions
    predictions = seed_model_predictions(db, models, user_ids)
    
    # Seed model deployments
    deployments = seed_model_deployments(db, models, user_ids)
    
    print("✅ ML data seeding completed!")
    
    return {
        "datasets": len(datasets),
        "models": len(models),
        "training_jobs": len(training_jobs),
        "evaluations": len(evaluations),
        "predictions": len(predictions),
        "deployments": len(deployments)
    }

def seed_datasets(db: Session, user_ids: List[int]) -> List[DatasetMetadata]:
    """Seed dataset metadata"""
    print("📊 Creating datasets...")
    
    dataset_configs = [
        {
            "name": "Customer Churn Dataset",
            "description": "Historical customer data for churn prediction",
            "format": "csv",
            "row_count": 50000,
            "column_count": 15,
            "file_path": "/data/datasets/customer_churn.csv"
        },
        {
            "name": "Sales Forecasting Data",
            "description": "Time series sales data for forecasting models",
            "format": "parquet",
            "row_count": 120000,
            "column_count": 8,
            "file_path": "/data/datasets/sales_timeseries.parquet"
        },
        {
            "name": "Product Recommendation Dataset",
            "description": "User-item interaction data for recommendation systems",
            "format": "json",
            "row_count": 1000000,
            "column_count": 12,
            "file_path": "/data/datasets/product_recommendations.json"
        },
        {
            "name": "Fraud Detection Dataset",
            "description": "Transaction data for fraud detection models",
            "format": "csv",
            "row_count": 284807,
            "column_count": 31,
            "file_path": "/data/datasets/fraud_detection.csv"
        }
    ]
    
    datasets = []
    for config in dataset_configs:
        dataset = DatasetMetadata(
            name=config["name"],
            description=config["description"],
            file_path=config["file_path"],
            file_size_bytes=random.randint(10_000_000, 500_000_000),
            format=config["format"],
            row_count=config["row_count"],
            column_count=config["column_count"],
            column_info={
                "columns": [f"feature_{i}" for i in range(int(config["column_count"]))],
                "types": ["numeric", "categorical", "text", "datetime"]
            },
            missing_values_count=random.randint(0, int(config["row_count"]) // 100),
            duplicate_rows_count=random.randint(0, int(config["row_count"]) // 1000),
            data_quality_score=random.uniform(0.85, 0.98),
            created_by=random.choice(user_ids),
            created_at=datetime.utcnow() - timedelta(days=random.randint(30, 365))
        )
        datasets.append(dataset)
    
    db.add_all(datasets)
    db.commit()
    
    for dataset in datasets:
        db.refresh(dataset)
    
    print(f"📊 Created {len(datasets)} datasets")
    return datasets

def seed_ml_models(db: Session, user_ids: List[int]) -> List[MLModel]:
    """Seed ML models with realistic configurations"""
    print("🧠 Creating ML models...")
    
    model_configs = [
        {
            "name": "Customer Churn Predictor",
            "description": "Random Forest model to predict customer churn probability",
            "model_type": ModelType.CLASSIFICATION,
            "algorithm": "RandomForestClassifier",
            "hyperparameters": {
                "n_estimators": 100,
                "max_depth": 10,
                "min_samples_split": 5,
                "random_state": 42
            },
            "feature_columns": ["tenure", "monthly_charges", "total_charges", "contract_type", "payment_method"],
            "target_column": "churn"
        },
        {
            "name": "Sales Forecasting Model",
            "description": "LSTM neural network for sales forecasting",
            "model_type": ModelType.TIME_SERIES,
            "algorithm": "LSTM",
            "hyperparameters": {
                "sequence_length": 30,
                "hidden_units": 64,
                "dropout": 0.2,
                "learning_rate": 0.001
            },
            "feature_columns": ["sales", "marketing_spend", "seasonality", "promotions"],
            "target_column": "future_sales"
        },
        {
            "name": "Product Recommendation Engine",
            "description": "Collaborative filtering model for product recommendations",
            "model_type": ModelType.NEURAL_NETWORK,
            "algorithm": "CollaborativeFiltering",
            "hyperparameters": {
                "embedding_dim": 50,
                "regularization": 0.01,
                "learning_rate": 0.001
            },
            "feature_columns": ["user_id", "product_id", "rating", "category"],
            "target_column": "recommendation_score"
        },
        {
            "name": "Fraud Detection System",
            "description": "Gradient boosting model for fraud detection",
            "model_type": ModelType.CLASSIFICATION,
            "algorithm": "XGBoost",
            "hyperparameters": {
                "n_estimators": 200,
                "max_depth": 6,
                "learning_rate": 0.1,
                "subsample": 0.8
            },
            "feature_columns": ["amount", "time", "v1", "v2", "v3", "v4", "v5"],
            "target_column": "is_fraud"
        },
        {
            "name": "Price Optimization Model",
            "description": "Regression model for optimal pricing strategies",
            "model_type": ModelType.REGRESSION,
            "algorithm": "LinearRegression",
            "hyperparameters": {
                "fit_intercept": True,
                "normalize": True,
                "alpha": 0.1
            },
            "feature_columns": ["cost", "demand", "competition_price", "seasonality"],
            "target_column": "optimal_price"
        }
    ]
    
    models = []
    for i, config in enumerate(model_configs):
        # Determine model status based on creation order
        if i < 2:
            status = ModelStatus.DEPLOYED
            accuracy = random.uniform(0.85, 0.95)
            precision = random.uniform(0.80, 0.92)
            recall = random.uniform(0.78, 0.90)
            f1_score = 2 * (precision * recall) / (precision + recall)
            last_trained = datetime.utcnow() - timedelta(days=random.randint(1, 30))
            deployed_at = last_trained + timedelta(days=random.randint(1, 7))
        elif i < 4:
            status = ModelStatus.TRAINED
            accuracy = random.uniform(0.75, 0.88)
            precision = random.uniform(0.70, 0.85)
            recall = random.uniform(0.68, 0.83)
            f1_score = 2 * (precision * recall) / (precision + recall)
            last_trained = datetime.utcnow() - timedelta(days=random.randint(1, 15))
            deployed_at = None
        else:
            status = ModelStatus.TRAINING
            accuracy = None
            precision = None
            recall = None
            f1_score = None
            last_trained = None
            deployed_at = None
        
        model = MLModel(
            name=config["name"],
            description=config["description"],
            model_type=config["model_type"],
            algorithm=config["algorithm"],
            version=f"{random.randint(1, 3)}.{random.randint(0, 9)}.{random.randint(0, 9)}",
            status=status,
            hyperparameters=config["hyperparameters"],
            feature_columns=config["feature_columns"],
            target_column=config["target_column"],
            accuracy_score=accuracy,
            precision_score=precision,
            recall_score=recall,
            f1_score=f1_score,
            mse_score=random.uniform(0.1, 0.5) if config["model_type"] == ModelType.REGRESSION else None,
            mae_score=random.uniform(0.05, 0.3) if config["model_type"] == ModelType.REGRESSION else None,
            r2_score=random.uniform(0.7, 0.95) if config["model_type"] == ModelType.REGRESSION else None,
            model_path=f"/models/{str(config['name']).lower().replace(' ', '_')}/model.pkl",
            model_size_bytes=random.randint(1_000_000, 100_000_000),
            created_by=random.choice(user_ids),
            created_at=datetime.utcnow() - timedelta(days=random.randint(7, 180)),
            last_trained_at=last_trained,
            deployed_at=deployed_at
        )
        models.append(model)
    
    db.add_all(models)
    db.commit()
    
    for model in models:
        db.refresh(model)
    
    print(f"🧠 Created {len(models)} ML models")
    return models

def seed_training_jobs(db: Session, models: List[MLModel], user_ids: List[int]) -> List[TrainingJob]:
    """Seed training jobs for models"""
    print("🏋️ Creating training jobs...")
    
    training_jobs = []
    
    for model in models:
        # Create 1-2 training jobs per model
        num_jobs = random.randint(1, 2)
        
        for job_num in range(num_jobs):
            # Determine job status
            if job_num == 0 and model.status in [ModelStatus.TRAINED, ModelStatus.DEPLOYED]:
                status = TrainingStatus.COMPLETED
                progress = 100.0
                current_epoch = random.randint(10, 50)
                total_epochs = current_epoch
                started_at = model.created_at + timedelta(hours=random.randint(1, 24))
                completed_at = started_at + timedelta(hours=random.randint(1, 12))
                duration = int((completed_at - started_at).total_seconds())
                training_accuracy = random.uniform(0.75, 0.95)
                validation_accuracy = random.uniform(0.70, 0.90)
                training_loss = random.uniform(0.1, 0.5)
                validation_loss = training_loss + random.uniform(0.01, 0.1)
            elif model.status == ModelStatus.TRAINING and job_num == num_jobs - 1:
                status = TrainingStatus.RUNNING
                progress = random.uniform(20, 80)
                current_epoch = random.randint(5, 30)
                total_epochs = random.randint(30, 100)
                started_at = datetime.utcnow() - timedelta(hours=random.randint(1, 48))
                completed_at = None
                duration = None
                training_accuracy = random.uniform(0.60, 0.85)
                validation_accuracy = random.uniform(0.55, 0.80)
                training_loss = random.uniform(0.2, 0.8)
                validation_loss = training_loss + random.uniform(0.05, 0.2)
            else:
                status = TrainingStatus.COMPLETED
                progress = 100.0
                current_epoch = random.randint(10, 50)
                total_epochs = current_epoch
                started_at = model.created_at + timedelta(days=random.randint(1, 60))
                completed_at = started_at + timedelta(hours=random.randint(2, 24))
                duration = int((completed_at - started_at).total_seconds())
                training_accuracy = random.uniform(0.70, 0.90)
                validation_accuracy = random.uniform(0.65, 0.85)
                training_loss = random.uniform(0.15, 0.6)
                validation_loss = training_loss + random.uniform(0.02, 0.15)
            
            job = TrainingJob(
                model_id=model.id,
                job_name=f"{model.name} Training Job {job_num + 1}",
                status=status,
                training_config={
                    "batch_size": random.choice([16, 32, 64, 128]),
                    "learning_rate": random.choice([0.001, 0.01, 0.1]),
                    "epochs": total_epochs,
                    "optimizer": random.choice(["adam", "sgd", "rmsprop"]),
                    "validation_split": 0.2
                },
                dataset_path=f"/data/training/{model.name.lower().replace(' ', '_')}_train.csv",
                dataset_size=random.randint(10000, 100000),
                current_epoch=current_epoch,
                total_epochs=total_epochs,
                progress_percentage=progress,
                training_loss=training_loss,
                validation_loss=validation_loss,
                training_accuracy=training_accuracy,
                validation_accuracy=validation_accuracy,
                started_at=started_at,
                completed_at=completed_at,
                duration_seconds=duration,
                cpu_usage_percent=random.uniform(60, 95),
                memory_usage_mb=random.uniform(2000, 8000),
                gpu_usage_percent=random.uniform(70, 100) if random.random() < 0.7 else None,
                created_by=random.choice(user_ids),
                created_at=started_at - timedelta(minutes=random.randint(5, 60))
            )
            training_jobs.append(job)
    
    db.add_all(training_jobs)
    db.commit()
    
    for job in training_jobs:
        db.refresh(job)
    
    print(f"🏋️ Created {len(training_jobs)} training jobs")
    return training_jobs

def seed_model_evaluations(db: Session, models: List[MLModel], user_ids: List[int]) -> List[ModelEvaluation]:
    """Seed model evaluations"""
    print("📈 Creating model evaluations...")
    
    evaluations = []
    
    for model in models:
        if model.status in [ModelStatus.TRAINED, ModelStatus.DEPLOYED]:
            evaluation = ModelEvaluation(
                model_id=model.id,
                evaluation_name=f"{model.name} Evaluation",
                test_dataset_path=f"/data/test/{model.name.lower().replace(' ', '_')}_test.csv",
                test_dataset_size=random.randint(5000, 25000),
                evaluation_config={
                    "test_split": 0.2,
                    "cross_validation": True,
                    "cv_folds": 5,
                    "metrics": ["accuracy", "precision", "recall", "f1"]
                },
                accuracy=model.accuracy_score + random.uniform(-0.05, 0.02) if model.accuracy_score else random.uniform(0.75, 0.90),
                precision=model.precision_score + random.uniform(-0.03, 0.02) if model.precision_score else random.uniform(0.70, 0.88),
                recall=model.recall_score + random.uniform(-0.03, 0.02) if model.recall_score else random.uniform(0.68, 0.86),
                f1_score=model.f1_score + random.uniform(-0.03, 0.02) if model.f1_score else random.uniform(0.72, 0.87),
                auc_score=random.uniform(0.80, 0.95) if model.model_type == ModelType.CLASSIFICATION else None,
                mse=model.mse_score + random.uniform(-0.05, 0.02) if model.mse_score else None,
                mae=model.mae_score + random.uniform(-0.02, 0.01) if model.mae_score else None,
                r2_score=model.r2_score + random.uniform(-0.03, 0.02) if model.r2_score else None,
                confusion_matrix=[[85, 15], [12, 88]] if model.model_type == ModelType.CLASSIFICATION else None,
                classification_report={
                    "0": {"precision": 0.85, "recall": 0.85, "f1-score": 0.85},
                    "1": {"precision": 0.88, "recall": 0.88, "f1-score": 0.88}
                } if model.model_type == ModelType.CLASSIFICATION else None,
                feature_importance={
                    feature: random.uniform(0.05, 0.25) 
                    for feature in model.feature_columns[:5]
                } if model.feature_columns else None,
                evaluated_by=random.choice(user_ids),
                evaluated_at=model.last_trained_at + timedelta(days=random.randint(1, 7)) if model.last_trained_at else datetime.utcnow()
            )
            evaluations.append(evaluation)
    
    db.add_all(evaluations)
    db.commit()
    
    for evaluation in evaluations:
        db.refresh(evaluation)
    
    print(f"📈 Created {len(evaluations)} model evaluations")
    return evaluations

def seed_model_predictions(db: Session, models: List[MLModel], user_ids: List[int]) -> List[ModelPrediction]:
    """Seed model predictions"""
    print("🔮 Creating model predictions...")
    
    predictions = []
    
    # Only create predictions for trained/deployed models
    trained_models = [m for m in models if m.status in [ModelStatus.TRAINED, ModelStatus.DEPLOYED]]
    
    for model in trained_models:
        # Create 20-50 predictions per model
        num_predictions = random.randint(20, 50)
        
        for _ in range(num_predictions):
            # Generate realistic input data based on model type
            if model.model_type == ModelType.CLASSIFICATION:
                input_data = {f"feature_{i}": random.uniform(0, 100) for i in range(5)}
                predicted_value = random.choice(["class_a", "class_b", "class_c"])
                confidence = random.uniform(0.6, 0.95)
            elif model.model_type == ModelType.REGRESSION:
                input_data = {f"feature_{i}": random.uniform(0, 100) for i in range(4)}
                predicted_value = random.uniform(10, 1000)
                confidence = random.uniform(0.7, 0.95)
            elif model.model_type == ModelType.TIME_SERIES:
                input_data = {
                    "historical_values": [random.uniform(100, 1000) for _ in range(30)],
                    "seasonality": random.choice(["high", "medium", "low"]),
                    "trend": random.choice(["increasing", "decreasing", "stable"])
                }
                predicted_value = [random.uniform(100, 1000) for _ in range(7)]  # 7-day forecast
                confidence = random.uniform(0.65, 0.85)
            else:
                input_data = {f"feature_{i}": random.uniform(0, 100) for i in range(3)}
                predicted_value = {"result": random.uniform(0, 1)}
                confidence = random.uniform(0.6, 0.9)
            
            # Determine if we have actual value for feedback (30% chance)
            actual_value = None
            is_correct = None
            feedback_score = None
            
            if random.random() < 0.3:
                if model.model_type == ModelType.CLASSIFICATION:
                    actual_value = predicted_value if random.random() < 0.8 else random.choice(["class_a", "class_b", "class_c"])
                    is_correct = predicted_value == actual_value
                    feedback_score = random.uniform(3.5, 5.0) if is_correct else random.uniform(1.0, 3.0)
                elif model.model_type == ModelType.REGRESSION:
                    if isinstance(predicted_value, (int, float)):
                        actual_value = float(predicted_value) + random.uniform(-50, 50)
                    else:
                        actual_value = predicted_value
                    feedback_score = random.uniform(3.0, 5.0)
                else:
                    feedback_score = random.uniform(3.0, 4.5)
            
            prediction = ModelPrediction(
                model_id=model.id,
                prediction_id=str(uuid.uuid4()),
                input_data=input_data,
                predicted_value=predicted_value,
                confidence_score=confidence,
                prediction_time_ms=random.randint(10, 500),
                model_version=model.version,
                actual_value=actual_value,
                feedback_score=feedback_score,
                is_correct=is_correct,
                created_by=random.choice(user_ids),
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
            )
            predictions.append(prediction)
    
    db.add_all(predictions)
    db.commit()
    
    for prediction in predictions:
        db.refresh(prediction)
    
    print(f"🔮 Created {len(predictions)} model predictions")
    return predictions

def seed_model_deployments(db: Session, models: List[MLModel], user_ids: List[int]) -> List[ModelDeployment]:
    """Seed model deployments"""
    print("🚀 Creating model deployments...")
    
    deployments = []
    
    # Only create deployments for deployed models
    deployed_models = [m for m in models if m.status == ModelStatus.DEPLOYED]
    
    for model in deployed_models:
        deployment = ModelDeployment(
            model_id=model.id,
            deployment_name=f"{model.name} Production Deployment",
            endpoint_url=f"https://api.example.com/models/{model.id}/predict",
            deployment_config={
                "replicas": random.randint(2, 5),
                "cpu_limit": "2000m",
                "memory_limit": "4Gi",
                "auto_scaling": True,
                "max_replicas": 10
            },
            environment="production",
            is_active=True,
            health_status=random.choice(["healthy", "degraded"]),
            request_count=random.randint(1000, 50000),
            avg_response_time_ms=random.uniform(50, 200),
            error_rate=random.uniform(0.001, 0.05),
            uptime_percentage=random.uniform(99.0, 99.9),
            cpu_usage=random.uniform(30, 80),
            memory_usage=random.uniform(40, 85),
            deployed_by=random.choice(user_ids),
            deployed_at=model.deployed_at if model.deployed_at else datetime.utcnow(),
            last_health_check=datetime.utcnow() - timedelta(minutes=random.randint(1, 30))
        )
        deployments.append(deployment)
    
    db.add_all(deployments)
    db.commit()
    
    for deployment in deployments:
        db.refresh(deployment)
    
    print(f"🚀 Created {len(deployments)} model deployments")
    return deployments