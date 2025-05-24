"""
Advanced Analytics service for predictive performance modeling and ROI measurement
"""

from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
import uuid
import json
import asyncio
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, r2_score, mean_absolute_error, mean_squared_error
import joblib
import pandas as pd
from decimal import Decimal

from ..models.analytics import (
    AnalyticsModel, AnalyticsPrediction, AnalyticsTrainingJob,
    ROICalculation, PerformanceMetric
)
from ..models.user import User
from ..models.tenant import Tenant


class AnalyticsService:
    """Service for advanced analytics and predictive modeling"""

    def __init__(self, db: Session):
        self.db = db
        self.supported_algorithms = {
            "linear_regression": LinearRegression,
            "logistic_regression": LogisticRegression,
            "random_forest_regressor": RandomForestRegressor,
            "random_forest_classifier": RandomForestClassifier
        }

    # Model Management
    def create_analytics_model(
        self,
        tenant_id: int,
        model_data: Dict[str, Any],
        created_by_user_id: int
    ) -> AnalyticsModel:
        """Create a new analytics model"""
        
        model = AnalyticsModel(
            tenant_id=tenant_id,
            name=model_data["name"],
            display_name=model_data["display_name"],
            description=model_data.get("description"),
            model_type=model_data["model_type"],
            category=model_data["category"],
            algorithm=model_data["algorithm"],
            features=model_data.get("features", []),
            target_variable=model_data["target_variable"],
            hyperparameters=model_data.get("hyperparameters", {}),
            training_data_source=model_data["training_data_source"],
            training_period_days=model_data.get("training_period_days", 90),
            retrain_frequency_days=model_data.get("retrain_frequency_days", 7),
            validation_split=model_data.get("validation_split", 0.2),
            created_by_user_id=created_by_user_id
        )
        
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        
        return model

    def get_analytics_models(
        self,
        tenant_id: int,
        model_type: Optional[str] = None,
        category: Optional[str] = None,
        active_only: bool = True
    ) -> List[AnalyticsModel]:
        """Get analytics models for tenant"""
        
        query = self.db.query(AnalyticsModel).filter(
            AnalyticsModel.tenant_id == tenant_id
        )
        
        if active_only:
            query = query.filter(AnalyticsModel.is_active == True)
        
        if model_type:
            query = query.filter(AnalyticsModel.model_type == model_type)
        
        if category:
            query = query.filter(AnalyticsModel.category == category)
        
        return query.order_by(desc(AnalyticsModel.created_at)).all()

    def get_model_by_id(self, model_id: int, tenant_id: int) -> Optional[AnalyticsModel]:
        """Get analytics model by ID"""
        
        return self.db.query(AnalyticsModel).filter(
            and_(
                AnalyticsModel.id == model_id,
                AnalyticsModel.tenant_id == tenant_id
            )
        ).first()

    # Model Training
    async def train_model(
        self,
        model_id: int,
        triggered_by: str = "manual",
        triggered_by_user_id: Optional[int] = None
    ) -> AnalyticsTrainingJob:
        """Train an analytics model"""
        
        model = self.db.query(AnalyticsModel).filter(
            AnalyticsModel.id == model_id
        ).first()
        
        if not model:
            raise ValueError("Model not found")
        
        # Create training job
        training_job = AnalyticsTrainingJob(
            tenant_id=model.tenant_id,
            model_id=model_id,
            job_type="retrain" if model.is_trained else "initial",
            training_config={
                "algorithm": model.algorithm,
                "features": model.features,
                "target_variable": model.target_variable,
                "hyperparameters": model.hyperparameters,
                "validation_split": model.validation_split
            },
            data_source_config={
                "source": model.training_data_source,
                "period_days": model.training_period_days
            },
            triggered_by=triggered_by,
            triggered_by_user_id=triggered_by_user_id
        )
        
        self.db.add(training_job)
        self.db.commit()
        self.db.refresh(training_job)
        
        # Start training in background
        asyncio.create_task(self._execute_training(training_job))
        
        return training_job

    async def _execute_training(self, training_job: AnalyticsTrainingJob):
        """Execute model training"""
        
        try:
            training_job.status = "running"
            training_job.started_at = datetime.utcnow()
            self.db.commit()
            
            # Get model
            model = self.db.query(AnalyticsModel).filter(
                AnalyticsModel.id == training_job.model_id
            ).first()
            
            # Generate mock training data
            training_data = self._generate_training_data(model)
            
            # Prepare features and target
            X = training_data[model.features]
            y = training_data[model.target_variable]
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=model.validation_split, random_state=42
            )
            
            # Initialize algorithm
            algorithm_class = self.supported_algorithms.get(model.algorithm)
            if not algorithm_class:
                raise ValueError(f"Unsupported algorithm: {model.algorithm}")
            
            # Create and train model
            ml_model = algorithm_class(**model.hyperparameters)
            ml_model.fit(X_train, y_train)
            
            # Make predictions
            y_pred = ml_model.predict(X_test)
            
            # Calculate metrics
            metrics = self._calculate_metrics(y_test, y_pred, model.algorithm)
            
            # Update training job
            training_job.training_samples = len(X_train)
            training_job.validation_samples = len(X_test)
            training_job.feature_count = len(model.features)
            training_job.final_metrics = metrics
            training_job.mark_completed(True, metrics)
            
            # Update model
            model.accuracy_score = metrics.get("accuracy")
            model.precision_score = metrics.get("precision")
            model.recall_score = metrics.get("recall")
            model.f1_score = metrics.get("f1")
            model.r2_score = metrics.get("r2")
            model.mae_score = metrics.get("mae")
            model.rmse_score = metrics.get("rmse")
            model.last_trained_at = datetime.utcnow()
            model.status = "trained"
            
            # Save model to disk (mock implementation)
            model_path = f"/tmp/model_{model.id}_{training_job.id}.joblib"
            joblib.dump(ml_model, model_path)
            
            self.db.commit()
            
        except Exception as e:
            training_job.status = "failed"
            training_job.error_message = str(e)
            training_job.mark_completed(False)
            self.db.commit()

    def _generate_training_data(self, model: AnalyticsModel) -> pd.DataFrame:
        """Generate mock training data for the model"""
        
        np.random.seed(42)
        n_samples = 1000
        
        data = {}
        
        # Generate feature data based on model type
        if model.model_type == "performance":
            data.update({
                "hours_worked": np.random.normal(40, 10, n_samples),
                "tasks_completed": np.random.poisson(15, n_samples),
                "meetings_attended": np.random.poisson(8, n_samples),
                "experience_years": np.random.uniform(0, 20, n_samples),
                "team_size": np.random.randint(3, 15, n_samples)
            })
            # Performance score as target
            data["performance_score"] = (
                data["tasks_completed"] * 2 +
                data["hours_worked"] * 0.5 +
                data["experience_years"] * 1.5 +
                np.random.normal(0, 5, n_samples)
            )
            
        elif model.model_type == "productivity":
            data.update({
                "focus_time_hours": np.random.normal(6, 2, n_samples),
                "interruptions_count": np.random.poisson(12, n_samples),
                "tools_used": np.random.randint(3, 10, n_samples),
                "collaboration_score": np.random.uniform(1, 10, n_samples),
                "workload_rating": np.random.randint(1, 11, n_samples)
            })
            # Productivity index as target
            data["productivity_index"] = (
                data["focus_time_hours"] * 10 -
                data["interruptions_count"] * 2 +
                data["collaboration_score"] * 3 +
                np.random.normal(0, 5, n_samples)
            )
            
        elif model.model_type == "roi":
            data.update({
                "investment_amount": np.random.uniform(1000, 100000, n_samples),
                "project_duration_days": np.random.randint(30, 365, n_samples),
                "team_size": np.random.randint(2, 20, n_samples),
                "complexity_score": np.random.uniform(1, 10, n_samples),
                "risk_score": np.random.uniform(1, 10, n_samples)
            })
            # ROI percentage as target
            data["roi_percentage"] = (
                (data["investment_amount"] * 0.3) / data["investment_amount"] * 100 +
                np.random.normal(0, 20, n_samples)
            )
            
        else:
            # Generic data
            for feature in model.features:
                data[feature] = np.random.normal(50, 15, n_samples)
            data[model.target_variable] = np.random.normal(75, 20, n_samples)
        
        return pd.DataFrame(data)

    def _calculate_metrics(self, y_true, y_pred, algorithm: str) -> Dict[str, float]:
        """Calculate model performance metrics"""
        
        metrics = {}
        
        # Regression metrics
        if "regressor" in algorithm or "regression" in algorithm:
            metrics["r2"] = float(r2_score(y_true, y_pred))
            metrics["mae"] = float(mean_absolute_error(y_true, y_pred))
            metrics["rmse"] = float(np.sqrt(mean_squared_error(y_true, y_pred)))
        
        # Classification metrics
        if "classifier" in algorithm or "classification" in algorithm:
            metrics["accuracy"] = float(accuracy_score(y_true, y_pred))
            metrics["precision"] = float(precision_score(y_true, y_pred, average='weighted'))
            metrics["recall"] = float(recall_score(y_true, y_pred, average='weighted'))
            metrics["f1"] = float(f1_score(y_true, y_pred, average='weighted'))
        
        return metrics

    # Predictions
    async def make_prediction(
        self,
        model_id: int,
        entity_type: str,
        entity_id: int,
        input_features: Dict[str, Any],
        prediction_horizon_days: Optional[int] = None,
        created_by_user_id: Optional[int] = None
    ) -> AnalyticsPrediction:
        """Make a prediction using a trained model"""
        
        model = self.db.query(AnalyticsModel).filter(
            AnalyticsModel.id == model_id
        ).first()
        
        if not model or not model.is_trained:
            raise ValueError("Model not found or not trained")
        
        # Mock prediction calculation
        predicted_value = self._calculate_mock_prediction(model, input_features)
        confidence_score = np.random.uniform(0.7, 0.95)
        
        # Create prediction record
        prediction = AnalyticsPrediction(
            tenant_id=model.tenant_id,
            model_id=model_id,
            entity_type=entity_type,
            entity_id=entity_id,
            prediction_type=model.model_type,
            input_features=input_features,
            predicted_value=predicted_value,
            confidence_score=confidence_score,
            prediction_interval_lower=predicted_value * 0.9,
            prediction_interval_upper=predicted_value * 1.1,
            prediction_horizon_days=prediction_horizon_days,
            expires_at=datetime.utcnow() + timedelta(days=7) if prediction_horizon_days else None,
            created_by_user_id=created_by_user_id
        )
        
        self.db.add(prediction)
        self.db.commit()
        self.db.refresh(prediction)
        
        # Update model usage statistics
        model.prediction_count += 1
        model.last_prediction_at = datetime.utcnow()
        self.db.commit()
        
        return prediction

    def _calculate_mock_prediction(self, model: AnalyticsModel, input_features: Dict[str, Any]) -> float:
        """Calculate mock prediction value"""
        
        # Simple mock calculation based on model type
        if model.model_type == "performance":
            base_score = 75.0
            for feature, value in input_features.items():
                if "experience" in feature:
                    base_score += float(value) * 2
                elif "tasks" in feature:
                    base_score += float(value) * 1.5
                elif "hours" in feature:
                    base_score += float(value) * 0.5
            return max(0, min(100, base_score + np.random.normal(0, 5)))
            
        elif model.model_type == "productivity":
            base_index = 60.0
            for feature, value in input_features.items():
                if "focus" in feature:
                    base_index += float(value) * 8
                elif "interruptions" in feature:
                    base_index -= float(value) * 1.5
                elif "collaboration" in feature:
                    base_index += float(value) * 2
            return max(0, base_index + np.random.normal(0, 8))
            
        elif model.model_type == "roi":
            base_roi = 15.0
            for feature, value in input_features.items():
                if "investment" in feature:
                    base_roi += np.log(float(value)) * 2
                elif "duration" in feature:
                    base_roi -= float(value) * 0.05
                elif "complexity" in feature:
                    base_roi -= float(value) * 2
            return base_roi + np.random.normal(0, 10)
            
        else:
            # Generic prediction
            return 50.0 + np.random.normal(0, 15)

    def get_predictions(
        self,
        tenant_id: int,
        model_id: Optional[int] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        limit: int = 50
    ) -> List[AnalyticsPrediction]:
        """Get predictions for tenant"""
        
        query = self.db.query(AnalyticsPrediction).filter(
            AnalyticsPrediction.tenant_id == tenant_id
        )
        
        if model_id:
            query = query.filter(AnalyticsPrediction.model_id == model_id)
        
        if entity_type:
            query = query.filter(AnalyticsPrediction.entity_type == entity_type)
        
        if entity_id:
            query = query.filter(AnalyticsPrediction.entity_id == entity_id)
        
        return query.order_by(desc(AnalyticsPrediction.prediction_date)).limit(limit).all()

    # ROI Calculations
    def create_roi_calculation(
        self,
        tenant_id: int,
        roi_data: Dict[str, Any],
        calculated_by_user_id: int
    ) -> ROICalculation:
        """Create a new ROI calculation"""
        
        roi_calc = ROICalculation(
            tenant_id=tenant_id,
            entity_type=roi_data["entity_type"],
            entity_id=roi_data["entity_id"],
            calculation_name=roi_data["calculation_name"],
            description=roi_data.get("description"),
            period_start=roi_data["period_start"],
            period_end=roi_data["period_end"],
            period_days=(roi_data["period_end"] - roi_data["period_start"]).days,
            initial_investment=Decimal(str(roi_data.get("initial_investment", 0))),
            operational_costs=Decimal(str(roi_data.get("operational_costs", 0))),
            labor_costs=Decimal(str(roi_data.get("labor_costs", 0))),
            technology_costs=Decimal(str(roi_data.get("technology_costs", 0))),
            training_costs=Decimal(str(roi_data.get("training_costs", 0))),
            other_costs=Decimal(str(roi_data.get("other_costs", 0))),
            revenue_increase=Decimal(str(roi_data.get("revenue_increase", 0))),
            cost_savings=Decimal(str(roi_data.get("cost_savings", 0))),
            productivity_gains=Decimal(str(roi_data.get("productivity_gains", 0))),
            efficiency_gains=Decimal(str(roi_data.get("efficiency_gains", 0))),
            quality_improvements=Decimal(str(roi_data.get("quality_improvements", 0))),
            risk_reduction=Decimal(str(roi_data.get("risk_reduction", 0))),
            other_benefits=Decimal(str(roi_data.get("other_benefits", 0))),
            calculation_method=roi_data.get("calculation_method", "simple"),
            discount_rate=roi_data.get("discount_rate", 0.1),
            assumptions=roi_data.get("assumptions", {}),
            data_sources=roi_data.get("data_sources", []),
            analytics_model_id=roi_data.get("analytics_model_id"),
            calculated_by_user_id=calculated_by_user_id
        )
        
        # Calculate totals and ROI metrics
        roi_calc.update_totals()
        roi_calc.calculate_roi_metrics()
        
        self.db.add(roi_calc)
        self.db.commit()
        self.db.refresh(roi_calc)
        
        return roi_calc

    def get_roi_calculations(
        self,
        tenant_id: int,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        limit: int = 50
    ) -> List[ROICalculation]:
        """Get ROI calculations for tenant"""
        
        query = self.db.query(ROICalculation).filter(
            ROICalculation.tenant_id == tenant_id
        )
        
        if entity_type:
            query = query.filter(ROICalculation.entity_type == entity_type)
        
        if entity_id:
            query = query.filter(ROICalculation.entity_id == entity_id)
        
        return query.order_by(desc(ROICalculation.created_at)).limit(limit).all()

    def calculate_portfolio_roi(self, tenant_id: int, entity_ids: List[int]) -> Dict[str, Any]:
        """Calculate portfolio ROI across multiple entities"""
        
        calculations = self.db.query(ROICalculation).filter(
            and_(
                ROICalculation.tenant_id == tenant_id,
                ROICalculation.entity_id.in_(entity_ids)
            )
        ).all()
        
        if not calculations:
            return {"error": "No ROI calculations found"}
        
        total_investment = sum(calc.total_investment for calc in calculations)
        total_benefits = sum(calc.total_benefits for calc in calculations)
        
        portfolio_roi = float((total_benefits - total_investment) / total_investment * 100) if total_investment > 0 else 0.0
        
        return {
            "portfolio_roi_percentage": portfolio_roi,
            "total_investment": float(total_investment),
            "total_benefits": float(total_benefits),
            "net_value": float(total_benefits - total_investment),
            "calculation_count": len(calculations),
            "entity_count": len(entity_ids),
            "average_roi": sum(calc.roi_percentage for calc in calculations) / len(calculations),
            "best_performing": max(calculations, key=lambda x: x.roi_percentage).entity_id,
            "worst_performing": min(calculations, key=lambda x: x.roi_percentage).entity_id
        }

    # Performance Metrics
    def record_performance_metric(
        self,
        tenant_id: int,
        metric_data: Dict[str, Any],
        measured_by_user_id: Optional[int] = None
    ) -> PerformanceMetric:
        """Record a performance metric"""
        
        metric = PerformanceMetric(
            tenant_id=tenant_id,
            metric_name=metric_data["metric_name"],
            display_name=metric_data["display_name"],
            description=metric_data.get("description"),
            metric_type=metric_data["metric_type"],
            category=metric_data["category"],
            entity_type=metric_data["entity_type"],
            entity_id=metric_data["entity_id"],
            measurement_unit=metric_data["measurement_unit"],
            calculation_method=metric_data["calculation_method"],
            current_value=metric_data["current_value"],
            previous_value=metric_data.get("previous_value"),
            baseline_value=metric_data.get("baseline_value"),
            target_value=metric_data.get("target_value"),
            period_start=metric_data["period_start"],
            period_end=metric_data["period_end"],
            period_type=metric_data["period_type"],
            warning_threshold=metric_data.get("warning_threshold"),
            critical_threshold=metric_data.get("critical_threshold"),
            data_completeness=metric_data.get("data_completeness", 1.0),
            data_accuracy=metric_data.get("data_accuracy", 1.0),
            confidence_score=metric_data.get("confidence_score", 1.0),
            measured_by_user_id=measured_by_user_id
        )
        
        # Calculate trend
        metric.calculate_trend()
        
        self.db.add(metric)
        self.db.commit()
        self.db.refresh(metric)
        
        return metric

    def get_performance_metrics(
        self,
        tenant_id: int,
        metric_type: Optional[str] = None,
        category: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        limit: int = 100
    ) -> List[PerformanceMetric]:
        """Get performance metrics for tenant"""
        
        query = self.db.query(PerformanceMetric).filter(
            PerformanceMetric.tenant_id == tenant_id
        )
        
        if metric_type:
            query = query.filter(PerformanceMetric.metric_type == metric_type)
        
        if category:
            query = query.filter(PerformanceMetric.category == category)
        
        if entity_type:
            query = query.filter(PerformanceMetric.entity_type == entity_type)
        
        if entity_id:
            query = query.filter(PerformanceMetric.entity_id == entity_id)
        
        return query.order_by(desc(PerformanceMetric.measurement_date)).limit(limit).all()

    # Analytics and Reporting
    def get_analytics_dashboard(self, tenant_id: int) -> Dict[str, Any]:
        """Get comprehensive analytics dashboard data"""
        
        # Model statistics
        total_models = self.db.query(AnalyticsModel).filter(
            AnalyticsModel.tenant_id == tenant_id
        ).count()
        
        active_models = self.db.query(AnalyticsModel).filter(
            and_(
                AnalyticsModel.tenant_id == tenant_id,
                AnalyticsModel.is_active == True
            )
        ).count()
        
        trained_models = self.db.query(AnalyticsModel).filter(
            and_(
                AnalyticsModel.tenant_id == tenant_id,
                AnalyticsModel.status == "trained"
            )
        ).count()
        
        # Prediction statistics
        total_predictions = self.db.query(AnalyticsPrediction).filter(
            AnalyticsPrediction.tenant_id == tenant_id
        ).count()
        
        recent_predictions = self.db.query(AnalyticsPrediction).filter(
            and_(
                AnalyticsPrediction.tenant_id == tenant_id,
                AnalyticsPrediction.prediction_date >= datetime.utcnow() - timedelta(days=7)
            )
        ).count()
        
        # ROI statistics
        total_roi_calculations = self.db.query(ROICalculation).filter(
            ROICalculation.tenant_id == tenant_id
        ).count()
        
        avg_roi = self.db.query(func.avg(ROICalculation.roi_percentage)).filter(
            ROICalculation.tenant_id == tenant_id
        ).scalar() or 0.0
        
        # Performance metrics statistics
        total_metrics = self.db.query(PerformanceMetric).filter(
            PerformanceMetric.tenant_id == tenant_id
        ).count()
        
        return {
            "models": {
                "total": total_models,
                "active": active_models,
                "trained": trained_models,
                "training_rate": (trained_models / total_models * 100) if total_models > 0 else 0
            },
            "predictions": {
                "total": total_predictions,
                "recent": recent_predictions,
                "daily_average": recent_predictions / 7 if recent_predictions > 0 else 0
            },
            "roi": {
                "total_calculations": total_roi_calculations,
                "average_roi": float(avg_roi),
                "roi_category": self._categorize_roi(float(avg_roi))
            },
            "metrics": {
                "total": total_metrics,
                "categories": self._get_metric_categories(tenant_id)
            },
            "trends": {
                "model_adoption": "increasing",
                "prediction_accuracy": "improving",
                "roi_performance": "stable"
            }
        }

    def _categorize_roi(self, roi_percentage: float) -> str:
        """Categorize ROI performance"""
        if roi_percentage >= 50:
            return "excellent"
        elif roi_percentage >= 25:
            return "good"
        elif roi_percentage >= 10:
            return "fair"
        elif roi_percentage >= 0:
            return "break_even"
        else:
            return "negative"

    def _get_metric_categories(self, tenant_id: int) -> Dict[str, int]:
        """Get metric counts by category"""
        
        categories = self.db.query(
            PerformanceMetric.category,
            func.count(PerformanceMetric.id).label("count")
        ).filter(
            PerformanceMetric.tenant_id == tenant_id
        ).group_by(PerformanceMetric.category).all()
        
        return {cat.category: cat.count for cat in categories}

    def generate_insights(self, tenant_id: int) -> List[Dict[str, Any]]:
        """Generate AI-powered insights from analytics data"""
        
        insights = []
        
        # Model performance insights
        models = self.get_analytics_models(tenant_id)
        if models:
            avg_accuracy = sum(m.accuracy_score or 0 for m in models) / len(models)
            if avg_accuracy > 0.85:
                insights.append({
                    "type": "positive",
                    "category": "model_performance",
                    "title": "High Model Accuracy",
                    "description": f"Your analytics models are performing well with an average accuracy of {avg_accuracy:.1%}",
                    "recommendation": "Consider deploying more models to production to leverage this high accuracy."
                })
        
        # ROI insights
        roi_calcs = self.get_roi_calculations(tenant_id)
        if roi_calcs:
            positive_roi_count = sum(1 for calc in roi_calcs if calc.roi_percentage > 0)
            if positive_roi_count / len(roi_calcs) > 0.8:
                insights.append({
                    "type": "positive",
                    "category": "roi_performance",
                    "title": "Strong ROI Performance",
                    "description": f"{positive_roi_count}/{len(roi_calcs)} projects show positive ROI",
                    "recommendation": "Scale successful project patterns to other initiatives."
                })
        
        # Prediction insights
        predictions = self.get_predictions(tenant_id, limit=100)
        if predictions:
            recent_predictions = [p for p in predictions if p.prediction_date >= datetime.utcnow() - timedelta(days=7)]
            if len(recent_predictions) > 20:
                insights.append({
                    "type": "info",
                    "category": "prediction_usage",
                    "title": "High Prediction Activity",
                    "description": f"{len(recent_predictions)} predictions made in the last week",
                    "recommendation": "Consider automating frequent predictions to improve efficiency."
                })
        
        return insights


def get_analytics_service(db: Session) -> AnalyticsService:
    """Get analytics service instance"""
    return AnalyticsService(db)