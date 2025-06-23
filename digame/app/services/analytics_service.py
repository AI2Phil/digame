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
from ..models.comparative_benchmark import ComparativeBenchmark
from .. import schemas


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
            dimensions=model_data.get("dimensions", []),
            metrics=model_data.get("metrics", []),
            aggregation_types=model_data.get("aggregation_types", {}),
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

    def update_analytics_model(
        self,
        model_id: int,
        tenant_id: int,
        model_update_data: Dict[str, Any], # Simplified to avoid forward reference issues
        updated_by_user_id: int
    ) -> Optional[AnalyticsModel]:
        """Update an existing analytics model."""
        model = self.db.query(AnalyticsModel).filter(
            AnalyticsModel.id == model_id,
            AnalyticsModel.tenant_id == tenant_id
        ).first()

        if not model:
            return None

        update_data_dict = model_update_data.dict(exclude_unset=True)
        for key, value in update_data_dict.items():
            setattr(model, key, value)

        model.updated_at = datetime.utcnow()
        # model.updated_by_user_id = updated_by_user_id # Assuming model has this field

        self.db.commit()
        self.db.refresh(model)
        return model

    def delete_analytics_model(
        self,
        model_id: int,
        tenant_id: int
    ) -> bool:
        """Delete an analytics model."""
        model = self.db.query(AnalyticsModel).filter(
            AnalyticsModel.id == model_id,
            AnalyticsModel.tenant_id == tenant_id
        ).first()

        if not model:
            return False

        # Soft delete by marking as inactive, or hard delete
        # Option 1: Soft delete (if model has is_active field)
        # model.is_active = False
        # model.updated_at = datetime.utcnow()
        # self.db.commit()

        # Option 2: Hard delete
        self.db.delete(model)
        self.db.commit()
        return True

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
                "team_size": np.random.randint(3, 15, n_samples),
                "department": np.random.choice(["Eng", "Sales", "Marketing"], n_samples),
                "project_type": np.random.choice(["A", "B", "C"], n_samples)
            })
            # Performance score as target
            data["performance_score"] = (
                data["tasks_completed"] * 2 +
                data["hours_worked"] * 0.5 +
                data["experience_years"] * 1.5 +
                np.random.normal(0, 5, n_samples)
            )
            if "quality_score" in model.metrics: # Example for multi-metric
                 data["quality_score"] = np.random.uniform(60, 100, n_samples)

        elif model.model_type == "productivity":
            data.update({
                "focus_time_hours": np.random.normal(6, 2, n_samples),
                "interruptions_count": np.random.poisson(12, n_samples),
                "tools_used": np.random.randint(3, 10, n_samples),
                "collaboration_score": np.random.uniform(1, 10, n_samples),
                "workload_rating": np.random.randint(1, 11, n_samples),
                "location": np.random.choice(["Office", "Remote", "Hybrid"], n_samples)
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
                "risk_score": np.random.uniform(1, 10, n_samples),
                "quarter": np.random.choice(["Q1", "Q2", "Q3", "Q4"], n_samples)
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
            if model.target_variable:
                data[model.target_variable] = np.random.normal(75, 20, n_samples)
            # Add mock dimension data if specified
            for dim in model.dimensions:
                if dim not in data: # Avoid overwriting features if names clash
                    data[dim] = np.random.choice([f"{dim}_A", f"{dim}_B", f"{dim}_C"], n_samples)
            for met in model.metrics:
                 if met not in data: # Avoid overwriting features or target_variable
                    data[met] = np.random.normal(100, 20, n_samples)

        df = pd.DataFrame(data)
        # Ensure all specified features, dimensions, and metrics columns exist.
        # Start with features defined in the model
        for feature in model.features:
            if feature not in data:
                # Add generic random data if not specifically generated above
                data[feature] = np.random.normal(50, 15, n_samples)

        # Add dimension columns with sample categorical values
        for i, dim_name in enumerate(model.dimensions):
            if dim_name not in data: # Avoid overwriting if a feature has the same name
                # Create more varied sample values for dimensions
                num_categories = np.random.randint(2, 5) # 2 to 4 unique categories per dimension
                categories = [f"{dim_name}_Cat{j+1}" for j in range(num_categories)]
                data[dim_name] = np.random.choice(categories, n_samples)

        # Generate target variable if not already present (e.g. in performance type)
        if model.target_variable and model.target_variable not in data:
            # Generic target based on sum of some features (if available) or random
            if len(model.features) > 0:
                # Ensure features used here are numeric and exist
                numeric_features = [f for f in model.features if pd.api.types.is_numeric_dtype(pd.Series(data[f]))]
                if numeric_features:
                    base_target = pd.Series(data[numeric_features[0]]).fillna(0) * 0.5
                    if len(numeric_features) > 1:
                         base_target += pd.Series(data[numeric_features[1]]).fillna(0) * 0.3
                    data[model.target_variable] = base_target + np.random.normal(0, 10, n_samples)
                else:
                    data[model.target_variable] = np.random.normal(75, 20, n_samples) # Fallback if no numeric features
            else:
                data[model.target_variable] = np.random.normal(75, 20, n_samples)

        # Generate other metric columns if specified in model.metrics (for multi-output/multi-facet models)
        # These are treated as additional target-like variables or observed metrics alongside the main target.
        for metric_name in model.metrics:
            if metric_name not in data and metric_name != model.target_variable:
                # Similar generic generation as target_variable, potentially based on other features/dims
                if len(model.features) > 0:
                    numeric_features = [f for f in model.features if pd.api.types.is_numeric_dtype(pd.Series(data[f]))]
                    if numeric_features:
                        base_metric_val = pd.Series(data[numeric_features[0]]).fillna(0) * np.random.uniform(0.2, 0.6)
                        data[metric_name] = base_metric_val + np.random.normal(0, 5, n_samples)
                    else:
                        data[metric_name] = np.random.normal(50, 10, n_samples) # Fallback
                else:
                    data[metric_name] = np.random.normal(50, 10, n_samples)

        df = pd.DataFrame(data)

        # Final check for any column specified in model that might have been missed (e.g. complex interactions)
        # This should ideally not be needed if above logic is comprehensive
        all_model_cols = set(model.features) | set(model.dimensions) | set(model.metrics)
        if model.target_variable:
            all_model_cols.add(model.target_variable)
        for col_name in all_model_cols:
            if col_name not in df.columns:
                df[col_name] = 0 # Default fill for safety, though ideally all should be generated

        return df

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
        prediction_output = self._calculate_mock_prediction(model, input_features)
        confidence_score = np.random.uniform(0.7, 0.95)

        predicted_value_single = None
        predicted_values_multi_dim = None

        if isinstance(prediction_output, dict) and "multi_dim" in prediction_output:
            predicted_values_multi_dim = prediction_output["multi_dim"]
            # Optionally, derive a single representative value if appropriate
            # For example, average of multi-dim values, or a specific key's value
            if predicted_values_multi_dim and isinstance(predicted_values_multi_dim, list) and predicted_values_multi_dim[0].get("value"):
                 predicted_value_single = predicted_values_multi_dim[0]["value"] # Takes first value as representative
            elif predicted_values_multi_dim and isinstance(predicted_values_multi_dim, dict):
                 # If it's a dict, maybe take a primary metric or average
                 pass # Decide on logic for single value from dict
        elif isinstance(prediction_output, (float, int)):
            predicted_value_single = float(prediction_output)
        
        # Create prediction record
        prediction = AnalyticsPrediction(
            tenant_id=model.tenant_id,
            model_id=model_id,
            entity_type=entity_type,
            entity_id=entity_id,
            prediction_type=model.model_type,
            input_features=input_features,
            predicted_value=predicted_value_single,
            predicted_values_multi_dim=predicted_values_multi_dim,
            confidence_score=confidence_score,
            # Adjust intervals if multi-dim; this is a simplification
            prediction_interval_lower=predicted_value_single * 0.9 if predicted_value_single is not None else None,
            prediction_interval_upper=predicted_value_single * 1.1 if predicted_value_single is not None else None,
            prediction_horizon_days=prediction_horizon_days,
            expires_at=datetime.utcnow() + timedelta(days=7) if prediction_horizon_days else None,
            created_by_user_id=created_by_user_id,
            raw_prediction_output=prediction_output # Store the original output
        )
        
        self.db.add(prediction)
        self.db.commit()
        self.db.refresh(prediction)
        
        # Update model usage statistics
        model.prediction_count += 1
        model.last_prediction_at = datetime.utcnow()
        self.db.commit()
        
        return prediction

    def _calculate_mock_prediction(self, model: AnalyticsModel, input_features: Dict[str, Any]) -> Any:
        """
        Calculate mock prediction value.
        Can return a float or a dict for multi-dimensional predictions.
        Example multi-dim output: {"multi_dim": [{"dims": {"country": "US", "product": "A"}, "metric": "sales", "value": 100}, ...]}
        """
        # Try to use a couple of input features to influence the mock prediction
        feature_influence = 0
        if input_features:
            # Use first two numeric features found in input_features for some influence
            numeric_inputs = [v for v in input_features.values() if isinstance(v, (int, float))]
            if len(numeric_inputs) > 0:
                feature_influence += numeric_inputs[0] * 0.1
            if len(numeric_inputs) > 1:
                feature_influence += numeric_inputs[1] * 0.05

        # If model has dimensions and metrics, return a multi-dimensional mock prediction
        if model.dimensions and model.metrics:
            mock_multi_dim_results = []

            # Generate some sample dimension values dynamically
            # This creates a very limited set of combinations for mock purposes
            dim_value_options = {}
            for i, dim_name in enumerate(model.dimensions):
                # Create 1 or 2 sample categories for each dimension for the mock output
                num_mock_categories = 1 if len(model.dimensions) > 1 and i > 0 else 2 # More categories for the first dim
                dim_value_options[dim_name] = [f"{dim_name}_Sample{j+1}" for j in range(num_mock_categories)]

            # Create combinations (simple version for 1 or 2 dimensions)
            # For a more general solution, itertools.product could be used
            if len(model.dimensions) == 1:
                dim1_name = model.dimensions[0]
                for dim1_val in dim_value_options[dim1_name]:
                    current_dims = {dim1_name: dim1_val}
                    for metric_name in model.metrics:
                        base_metric_value = 50 + feature_influence + np.random.normal(0,10)
                        mock_multi_dim_results.append({
                            "dims": current_dims.copy(),
                            "metric": metric_name,
                            "value": round(base_metric_value + np.random.normal(0, 5) + (hash(dim1_val) % 10), 2) # Add slight variation per dim_val
                        })
            elif len(model.dimensions) >= 2:
                dim1_name = model.dimensions[0]
                dim2_name = model.dimensions[1]
                for dim1_val in dim_value_options[dim1_name]:
                    for dim2_val in dim_value_options[dim2_name]:
                        current_dims = {dim1_name: dim1_val, dim2_name: dim2_val}
                        # Include other dimensions with a fixed sample value if more than 2
                        for i in range(2, len(model.dimensions)):
                            other_dim_name = model.dimensions[i]
                            current_dims[other_dim_name] = dim_value_options[other_dim_name][0] # Use first sample category

                        for metric_name in model.metrics:
                            base_metric_value = 50 + feature_influence + np.random.normal(0,10)
                            mock_multi_dim_results.append({
                                "dims": current_dims.copy(),
                                "metric": metric_name,
                                "value": round(base_metric_value + np.random.normal(0, 5) + (hash(dim1_val+dim2_val) % 10), 2)
                            })

            if not mock_multi_dim_results and model.metrics: # Fallback if no dimensions or complex case not handled
                 for metric_name in model.metrics:
                    mock_multi_dim_results.append({
                        "dims": {}, # No specific dimensions
                        "metric": metric_name,
                        "value": round(50 + feature_influence + np.random.normal(0,15), 2)
                    })

            return {"multi_dim": mock_multi_dim_results}

        # Fallback to simple mock calculation based on model type (single value prediction)
        # This part now also incorporates feature_influence
        base_value_for_single = 50 + feature_influence # Generic base

        if model.model_type == "performance":
            base_score = 75.0 + feature_influence
            for feature_name, value in input_features.items(): # This specific logic remains if not multi-dim
                val = float(value) if value is not None else 0
                if "experience" in feature_name: base_score += val * 2
                elif "tasks" in feature_name: base_score += val * 1.5
                elif "hours" in feature_name: base_score += val * 0.5
            return max(0, min(100, base_score + np.random.normal(0, 5)))

        elif model.model_type == "productivity":
            base_index = 60.0 + feature_influence
            for feature_name, value in input_features.items():
                val = float(value) if value is not None else 0
                if "focus" in feature_name: base_index += val * 8
                elif "interruptions" in feature_name: base_index -= val * 1.5
                elif "collaboration" in feature_name: base_index += val * 2
            return max(0, base_index + np.random.normal(0, 8))

        elif model.model_type == "roi":
            base_roi = 15.0 + feature_influence
            for feature_name, value in input_features.items():
                val = float(value) if value is not None else 0
                if "investment" in feature_name and val > 0: base_roi += np.log(val) * 2
                elif "duration" in feature_name: base_roi -= val * 0.05
                elif "complexity" in feature_name: base_roi -= val * 2
            return base_roi + np.random.normal(0, 10)

        else:
            # Generic prediction
            return base_value_for_single + np.random.normal(0, 15)

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

    def get_prediction_by_id(self, prediction_id: int, tenant_id: int) -> Optional[AnalyticsPrediction]:
        """Get a specific analytics prediction by ID."""
        return self.db.query(AnalyticsPrediction).filter(
            AnalyticsPrediction.id == prediction_id,
            AnalyticsPrediction.tenant_id == tenant_id
        ).first()

    # ROI Calculations
    # The following create_roi_calculation is now the primary one,
    # incorporating logic for metric_links. The previous simpler version is removed.
    # def create_roi_calculation( ... ) - Simpler version removed.

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

    def get_roi_calculation_by_id(self, calculation_id: int, tenant_id: int) -> Optional[ROICalculation]:
        """Get a specific ROI calculation by ID."""
        return self.db.query(ROICalculation).filter(
            ROICalculation.id == calculation_id,
            ROICalculation.tenant_id == tenant_id
        ).first()

    def update_roi_calculation(
        self,
        calculation_id: int,
        tenant_id: int,
        roi_update_data: Dict[str, Any], # Simplified to avoid forward reference issues
        updated_by_user_id: int
    ) -> Optional[ROICalculation]:
        """Update an existing ROI calculation."""
        calculation = self.db.query(ROICalculation).filter(
            ROICalculation.id == calculation_id,
            ROICalculation.tenant_id == tenant_id
        ).first()

        if not calculation:
            return None

        update_data_dict = roi_update_data.dict(exclude_unset=True)
        needs_recalculation = False
        for key, value in update_data_dict.items():
            # Convert to Decimal if the field is a Decimal type in the model
            if hasattr(calculation, key) and isinstance(getattr(calculation, key), Decimal):
                setattr(calculation, key, Decimal(str(value)))
            else:
                setattr(calculation, key, value)

            # Check if any field that affects ROI calculation is changed
            if key in [
                "initial_investment", "operational_costs", "labor_costs",
                "technology_costs", "training_costs", "other_costs",
                "revenue_increase", "cost_savings", "productivity_gains",
                "efficiency_gains", "quality_improvements", "risk_reduction", "other_benefits"
            ]:
                needs_recalculation = True

        calculation.updated_at = datetime.utcnow()
        # calculation.updated_by_user_id = updated_by_user_id # If model has this field

        if needs_recalculation:
            calculation.update_totals()
            calculation.calculate_roi_metrics()

        self.db.commit()
        self.db.refresh(calculation)
        return calculation

    def delete_roi_calculation(
        self,
        calculation_id: int,
        tenant_id: int
    ) -> bool:
        """Delete an ROI calculation."""
        calculation = self.db.query(ROICalculation).filter(
            ROICalculation.id == calculation_id,
            ROICalculation.tenant_id == tenant_id
        ).first()

        if not calculation:
            return False

        self.db.delete(calculation)
        self.db.commit()
        return True

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
            measured_by_user_id=measured_by_user_id,
            dimensions_values=metric_data.get("dimensions_values"),
            predicted_by_model_id=metric_data.get("predicted_by_model_id")
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
            # Filter out models that might not have accuracy_score (e.g. if it's not applicable)
            relevant_models = [m for m in models if m.accuracy_score is not None]
            if relevant_models:
                avg_accuracy = sum(m.accuracy_score for m in relevant_models) / len(relevant_models)
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
            if len(roi_calcs) > 0 and positive_roi_count / len(roi_calcs) > 0.8 :
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

    # Comparative Benchmarking
    def add_benchmark_data(
        self,
        benchmark_data: Dict[str, Any],
        tenant_id: Optional[int] = None, # For tenant-specific benchmarks
        created_by_user_id: Optional[int] = None
    ) -> ComparativeBenchmark:
        """Add new benchmark data."""
        benchmark = ComparativeBenchmark(
            tenant_id=tenant_id,
            name=benchmark_data["name"],
            description=benchmark_data.get("description"),
            category=benchmark_data["category"],
            source=benchmark_data.get("source"),
            metric_name=benchmark_data["metric_name"],
            entity_type=benchmark_data.get("entity_type"),
            industry_segment=benchmark_data.get("industry_segment"),
            region=benchmark_data.get("region"),
            company_size=benchmark_data.get("company_size"),
            benchmark_value=benchmark_data["benchmark_value"],
            value_type=benchmark_data.get("value_type", "average"),
            unit=benchmark_data.get("unit"),
            period_start_date=benchmark_data.get("period_start_date"),
            period_end_date=benchmark_data.get("period_end_date"),
            data_freshness_date=benchmark_data.get("data_freshness_date", datetime.utcnow()),
            dimensions=benchmark_data.get("dimensions"),
            created_by_user_id=created_by_user_id
        )
        self.db.add(benchmark)
        self.db.commit()
        self.db.refresh(benchmark)
        return benchmark

    def get_benchmarks(
        self,
        metric_name: str,
        tenant_id: Optional[int] = None, # To fetch global and tenant-specific
        category: Optional[str] = None,
        industry_segment: Optional[str] = None,
        region: Optional[str] = None,
        company_size: Optional[str] = None
    ) -> List[ComparativeBenchmark]:
        """Get relevant benchmarks."""
        query = self.db.query(ComparativeBenchmark).filter(
            ComparativeBenchmark.metric_name == metric_name,
            ComparativeBenchmark.is_active == True,
            or_(ComparativeBenchmark.tenant_id == tenant_id, ComparativeBenchmark.tenant_id == None) # Global or tenant-specific
        )
        if category:
            query = query.filter(ComparativeBenchmark.category == category)
        if industry_segment:
            query = query.filter(ComparativeBenchmark.industry_segment == industry_segment)
        if region:
            query = query.filter(ComparativeBenchmark.region == region)
        if company_size:
            query = query.filter(ComparativeBenchmark.company_size == company_size)

        return query.order_by(desc(ComparativeBenchmark.data_freshness_date)).all()

    async def make_prediction_with_benchmark(
        self,
        model_id: int,
        entity_type: str,
        entity_id: int,
        input_features: Dict[str, Any],
        benchmark_params: Optional[Dict[str, Any]] = None, # Params to find relevant benchmark
        prediction_horizon_days: Optional[int] = None,
        created_by_user_id: Optional[int] = None
    ) -> AnalyticsPrediction:
        """Make a prediction and compare it against a relevant benchmark."""
        prediction = await self.make_prediction(
            model_id, entity_type, entity_id, input_features,
            prediction_horizon_days, created_by_user_id
        )

        if benchmark_params and prediction.predicted_value is not None:
            model = self.db.query(AnalyticsModel).filter(AnalyticsModel.id == model_id).first()
            if model:
                benchmarks = self.get_benchmarks(
                    metric_name=model.target_variable, # Assuming target variable is the metric to benchmark
                    tenant_id=model.tenant_id,
                    **benchmark_params
                )
                if benchmarks:
                    # For simplicity, use the first relevant benchmark found
                    relevant_benchmark = benchmarks[0]
                    prediction.benchmark_comparison_data = {
                        "benchmark_name": relevant_benchmark.name,
                        "benchmark_value": relevant_benchmark.benchmark_value,
                        "entity_value": prediction.predicted_value,
                        "difference": prediction.predicted_value - relevant_benchmark.benchmark_value,
                        "unit": relevant_benchmark.unit
                    }
                    self.db.commit()
                    self.db.refresh(prediction)
        return prediction

    def compare_performance_metric_with_benchmarks(
        self,
        performance_metric_id: int,
        tenant_id: int, # Explicit tenant_id for security/scoping
        # Allow specifying benchmark matching parameters, otherwise infer from metric
        benchmark_params: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Compares a given PerformanceMetric against relevant ComparativeBenchmark records.
        Returns a list of comparisons.
        """
        metric = self.db.query(PerformanceMetric).filter(
            PerformanceMetric.id == performance_metric_id,
            PerformanceMetric.tenant_id == tenant_id # Ensure metric belongs to the tenant
        ).first()

        if not metric:
            raise ValueError(f"PerformanceMetric with id {performance_metric_id} not found for tenant {tenant_id}")

        comparisons = []

        # Prepare parameters for get_benchmarks
        # Prioritize explicitly passed benchmark_params, then infer from metric
        effective_benchmark_params = {
            "metric_name": metric.metric_name,
            "category": benchmark_params.get("category", metric.category if metric.category else None), # Use metric's category if available
            # Infer more specific params from metric.dimensions_values if not in benchmark_params
            # This is an example; mapping from dimensions_values to benchmark fields might be complex
            "industry_segment": benchmark_params.get("industry_segment", metric.dimensions_values.get("industry_segment") if metric.dimensions_values else None),
            "region": benchmark_params.get("region", metric.dimensions_values.get("region") if metric.dimensions_values else None),
            "company_size": benchmark_params.get("company_size", metric.dimensions_values.get("company_size") if metric.dimensions_values else None),
        }
        # Remove None values from params to avoid issues with get_benchmarks query
        effective_benchmark_params = {k: v for k, v in effective_benchmark_params.items() if v is not None}

        if benchmark_params: # If explicit params are given, they take precedence
            effective_benchmark_params.update(benchmark_params)
            # Ensure metric_name is always from the metric itself for relevance
            effective_benchmark_params["metric_name"] = metric.metric_name


        benchmarks = self.get_benchmarks(
            tenant_id=tenant_id, # Pass tenant_id to get_benchmarks for global+tenant specific
            **effective_benchmark_params
        )

        for benchmark in benchmarks:
            comparison_data = {
                "performance_metric_name": metric.metric_name,
                "performance_metric_value": metric.current_value,
                "performance_metric_unit": metric.measurement_unit,
                "benchmark_name": benchmark.name,
                "benchmark_value": benchmark.benchmark_value,
                "benchmark_unit": benchmark.unit,
                "benchmark_value_type": benchmark.value_type,
                "difference": None,
                "comparison_unit": metric.measurement_unit # Assume comparison in metric's unit
            }
            # Ensure units are compatible for a meaningful difference calculation
            # This is a simplified check; real unit conversion might be needed.
            if metric.measurement_unit == benchmark.unit or (not metric.measurement_unit and not benchmark.unit):
                comparison_data["difference"] = metric.current_value - benchmark.benchmark_value
            else:
                # If units differ and no conversion logic, difference is not directly comparable
                comparison_data["difference_comment"] = f"Units differ: Metric ({metric.measurement_unit}), Benchmark ({benchmark.unit})"

            comparisons.append(comparison_data)

        return comparisons

    def get_benchmark_by_id(self, benchmark_id: int, tenant_id: Optional[int]) -> Optional[ComparativeBenchmark]:
        """
        Get a specific comparative benchmark by ID.
        Allows access if benchmark is global (tenant_id is None) or matches the provided tenant_id.
        """
        benchmark = self.db.query(ComparativeBenchmark).filter(ComparativeBenchmark.id == benchmark_id).first()
        if not benchmark:
            return None
        # Allow access if benchmark is global or belongs to the requesting tenant
        if benchmark.tenant_id is None or benchmark.tenant_id == tenant_id:
            return benchmark
        return None

    def update_benchmark(
        self,
        benchmark_id: int,
        benchmark_update_data: Dict[str, Any], # Simplified to avoid forward reference issues
        requesting_tenant_id: int, # Tenant ID of the user making the request
        updated_by_user_id: int
    ) -> Optional[ComparativeBenchmark]:
        """Update an existing comparative benchmark."""
        benchmark = self.db.query(ComparativeBenchmark).filter(ComparativeBenchmark.id == benchmark_id).first()

        if not benchmark:
            return None

        # Authorization: Only allow update if benchmark is global (requires admin logic not yet here)
        # or if it belongs to the requesting tenant.
        # For now, let's assume admin can update global, tenant user can update their own.
        is_global_benchmark = benchmark.tenant_id is None
        can_update = False
        if is_global_benchmark:
            # TODO: Add role check for admin if current_user object was available with roles
            # For now, let's prevent non-admin update of global benchmarks by requiring tenant match
            # This means global benchmarks can't be updated by this method without admin role check.
            # A simpler rule for now: if it's global, only specific admin user can update (not implemented)
            # Or, if we assume only tenant-specific benchmarks can be updated via this tenant-scoped endpoint:
            pass # Requires admin check logic for global benchmarks

        if benchmark.tenant_id == requesting_tenant_id:
            can_update = True

        # A simple protection: if benchmark is global, only an admin (not checked here) should update.
        # If it's tenant-specific, only that tenant's user (checked by requesting_tenant_id matching benchmark.tenant_id).
        if not (benchmark.tenant_id == requesting_tenant_id or is_global_benchmark): # Simplified: allow update if tenant matches, or if global (pending admin check)
             # If benchmark is global, this check `benchmark.tenant_id == requesting_tenant_id` will be false.
             # So, if it's global, it effectively can't be updated by a tenant user through this flow.
             # If it's tenant-specific, it must match.
            if not (benchmark.tenant_id == requesting_tenant_id):
                 return None # User's tenant does not match benchmark's tenant_id

        update_data_dict = benchmark_update_data.dict(exclude_unset=True)
        for key, value in update_data_dict.items():
            setattr(benchmark, key, value)

        benchmark.updated_at = datetime.utcnow()
        # benchmark.updated_by_user_id = updated_by_user_id # If model has this field

        self.db.commit()
        self.db.refresh(benchmark)
        return benchmark

    def delete_benchmark(
        self,
        benchmark_id: int,
        requesting_tenant_id: int # Tenant ID of the user making the request
    ) -> bool:
        """Delete a comparative benchmark."""
        benchmark = self.db.query(ComparativeBenchmark).filter(ComparativeBenchmark.id == benchmark_id).first()

        if not benchmark:
            return False

        # Authorization: Similar to update.
        # Allow delete if benchmark is global (admin only - not checked here) or belongs to the requesting tenant.
        if not (benchmark.tenant_id == requesting_tenant_id or benchmark.tenant_id is None):
            # This logic means a tenant user cannot delete a global benchmark.
            # And a tenant user cannot delete another tenant's benchmark.
            if benchmark.tenant_id is not None and benchmark.tenant_id != requesting_tenant_id:
                return False # No permission
            # If benchmark is global, and user is not admin (implicit), don't allow deletion.
            # This part needs an explicit admin role check to allow deletion of global benchmarks.
            # For now, only tenant-specific benchmarks can be deleted by their tenant.
            if benchmark.tenant_id is None: # Not allowing non-admins to delete global benchmarks
                 return False


        self.db.delete(benchmark)
        self.db.commit()
        return True

    # ROI Calculation Refinement
    def create_roi_calculation(
        self,
        tenant_id: int,
        roi_data: Dict[str, Any],
        calculated_by_user_id: int
    ) -> ROICalculation:
        """Create a new ROI calculation, potentially using performance metrics for costs/benefits."""

        # Potential: Fetch performance metrics data to inform costs/benefits
        metric_links = roi_data.pop("metric_links", []) # Remove from roi_data to prevent direct assignment to model

        for link in metric_links:
            roi_field_to_update = link.get("roi_field_to_update")
            source_type = link.get("source_type")
            source_id = link.get("source_id")
            value_path = link.get("value_path") # e.g. "predicted_value" or "current_value"
            multiplier = link.get("multiplier", 1.0)
            default_value = link.get("default_value", 0.0) # Value to use if source not found or path invalid

            if not all([roi_field_to_update, source_type, source_id, value_path]):
                # Log or raise warning about invalid link structure
                continue

            source_value = None
            if source_type == "performance_metric":
                metric = self.db.query(PerformanceMetric).filter(
                    PerformanceMetric.id == source_id,
                    PerformanceMetric.tenant_id == tenant_id # Ensure correct tenant
                ).first()
                if metric:
                    source_value = getattr(metric, value_path, None)

            elif source_type == "analytics_prediction":
                prediction = self.db.query(AnalyticsPrediction).filter(
                    AnalyticsPrediction.id == source_id,
                    AnalyticsPrediction.tenant_id == tenant_id # Ensure correct tenant
                ).first()
                if prediction:
                    # Handle simple attributes or JSON paths (simplified)
                    if isinstance(prediction.raw_prediction_output, dict) and value_path in prediction.raw_prediction_output:
                         source_value = prediction.raw_prediction_output.get(value_path)
                    else:
                         source_value = getattr(prediction, value_path, None)

            if source_value is not None:
                try:
                    # Ensure the value is numeric before multiplication
                    numeric_value = float(source_value)
                    roi_data[roi_field_to_update] = roi_data.get(roi_field_to_update, 0.0) + (numeric_value * multiplier)
                except (ValueError, TypeError):
                    # Log or handle error if source_value is not numeric
                    roi_data[roi_field_to_update] = roi_data.get(roi_field_to_update, 0.0) + default_value
            else:
                roi_data[roi_field_to_update] = roi_data.get(roi_field_to_update, 0.0) + default_value


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

        roi_calc.update_totals()
        roi_calc.calculate_roi_metrics()

        self.db.add(roi_calc)
        self.db.commit()
        self.db.refresh(roi_calc)

        return roi_calc

    def calculate_multi_dimensional_metrics(
        self,
        model_id: int,
        data: pd.DataFrame # Expects a DataFrame with dimensions and metrics
    ) -> List[Dict[str, Any]]:
        """
        Calculates and aggregates multi-dimensional metrics based on model config.
        This is a conceptual mock. Real implementation would be more complex.
        """
        model = self.db.query(AnalyticsModel).get(model_id)
        if not model or not model.dimensions or not model.metrics:
            return []

        # Example: Group by all dimensions and aggregate all metrics
        # Aggregation type can be specified per metric in model.aggregation_types

        grouped_data = data.groupby(model.dimensions)
        results = []

        for name, group in grouped_data:
            aggregated_metrics = {}
            for metric_col in model.metrics:
                agg_type = model.aggregation_types.get(metric_col, "sum") # Default to sum
                if agg_type == "sum":
                    aggregated_metrics[metric_col] = group[metric_col].sum()
                elif agg_type == "mean":
                    aggregated_metrics[metric_col] = group[metric_col].mean()
                # Add other aggregation types like count, min, max etc.

            # Ensure name is a tuple if multiple dimensions, otherwise it's a single value
            dim_values = name if isinstance(name, tuple) else (name,)

            results.append({
                "dimensions": dict(zip(model.dimensions, dim_values)),
                "metrics": aggregated_metrics
            })
        return results


def get_analytics_service(db: Session) -> AnalyticsService:
    """Get analytics service instance"""
    return AnalyticsService(db)