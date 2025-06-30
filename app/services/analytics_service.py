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
try:
    import numpy as np  # type: ignore
    from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier  # type: ignore
    from sklearn.linear_model import LinearRegression, LogisticRegression  # type: ignore
    from sklearn.model_selection import train_test_split  # type: ignore
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, r2_score, mean_absolute_error, mean_squared_error  # type: ignore
    import joblib  # type: ignore
    import pandas as pd  # type: ignore
except ImportError:
    # Handle missing dependencies gracefully
    np = None  # type: ignore
    RandomForestRegressor = None  # type: ignore
    RandomForestClassifier = None  # type: ignore
    LinearRegression = None  # type: ignore
    LogisticRegression = None  # type: ignore
    train_test_split = None  # type: ignore
    accuracy_score = None  # type: ignore
    precision_score = None  # type: ignore
    recall_score = None  # type: ignore
    f1_score = None  # type: ignore
    r2_score = None  # type: ignore
    mean_absolute_error = None  # type: ignore
    mean_squared_error = None  # type: ignore
    joblib = None  # type: ignore
    pd = None  # type: ignore
from decimal import Decimal
from pydantic import BaseModel # Import BaseModel

from ..models.analytics import (
    AnalyticsModel, AnalyticsPrediction, AnalyticsTrainingJob,
    ROICalculation, PerformanceMetric, AnalyticsDashboard, DashboardWidgetConfig # Import new models
)
from ..models.user import User
from ..models.tenant import Tenant
from ..models.comparative_benchmark import ComparativeBenchmark
from ..schemas import analytics_schemas


class AnalyticsService:
    """Service for advanced analytics and predictive modeling"""

    def __init__(self, db: Session) -> None:
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
        
        model = AnalyticsModel()
        setattr(model, 'tenant_id', tenant_id)  # type: ignore
        setattr(model, 'name', model_data["name"])  # type: ignore
        setattr(model, 'display_name', model_data["display_name"])  # type: ignore
        setattr(model, 'description', model_data.get("description"))  # type: ignore
        setattr(model, 'model_type', model_data["model_type"])  # type: ignore
        setattr(model, 'category', model_data["category"])  # type: ignore
        setattr(model, 'algorithm', model_data["algorithm"])  # type: ignore
        setattr(model, 'features', model_data.get("features", []))  # type: ignore
        setattr(model, 'target_variable', model_data["target_variable"])  # type: ignore
        setattr(model, 'hyperparameters', model_data.get("hyperparameters", {}))  # type: ignore
        setattr(model, 'dimensions', model_data.get("dimensions", []))  # type: ignore
        setattr(model, 'metrics', model_data.get("metrics", []))  # type: ignore
        setattr(model, 'aggregation_types', model_data.get("aggregation_types", {}))  # type: ignore
        setattr(model, 'training_data_source', model_data["training_data_source"])  # type: ignore
        setattr(model, 'training_period_days', model_data.get("training_period_days", 90))  # type: ignore
        setattr(model, 'retrain_frequency_days', model_data.get("retrain_frequency_days", 7))  # type: ignore
        setattr(model, 'validation_split', model_data.get("validation_split", 0.2))  # type: ignore
        setattr(model, 'created_by_user_id', created_by_user_id)  # type: ignore
        
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
            AnalyticsModel.tenant_id == tenant_id  # type: ignore
        )
        
        if active_only:
            query = query.filter(AnalyticsModel.is_active == True)  # type: ignore
        
        if model_type:
            query = query.filter(AnalyticsModel.model_type == model_type)  # type: ignore
        
        if category:
            query = query.filter(AnalyticsModel.category == category)  # type: ignore
        
        return query.order_by(desc(AnalyticsModel.created_at)).all()  # type: ignore

    def get_model_by_id(self, model_id: int, tenant_id: int) -> Optional[AnalyticsModel]:
        """Get analytics model by ID"""
        
        return self.db.query(AnalyticsModel).filter(
            AnalyticsModel.id == model_id,  # type: ignore
            AnalyticsModel.tenant_id == tenant_id  # type: ignore
        ).first()  # type: ignore

    def update_analytics_model(
        self,
        model_id: int,
        tenant_id: int,
        model_update_data: Dict[str, Any], # Simplified to avoid forward reference issues
        updated_by_user_id: int
    ) -> Optional[AnalyticsModel]:
        """Update an existing analytics model."""
        model = self.db.query(AnalyticsModel).filter(
            AnalyticsModel.id == model_id,  # type: ignore
            AnalyticsModel.tenant_id == tenant_id  # type: ignore
        ).first()  # type: ignore

        if not model:
            return None

        # Safe model update with proper type handling
        try:
            update_data_dict = model_update_data if isinstance(model_update_data, dict) else model_update_data.model_dump(exclude_unset=True)
        except AttributeError:
            update_data_dict = model_update_data if isinstance(model_update_data, dict) else {}
        
        for key, value in update_data_dict.items():
            setattr(model, key, value)  # type: ignore

        setattr(model, 'updated_at', datetime.utcnow())  # type: ignore
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
            AnalyticsModel.id == model_id,  # type: ignore
            AnalyticsModel.tenant_id == tenant_id  # type: ignore
        ).first()  # type: ignore

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
            AnalyticsModel.id == model_id  # type: ignore
        ).first()  # type: ignore
        
        if not model:
            raise ValueError("Model not found")
        
        # Create training job
        training_job = AnalyticsTrainingJob()
        setattr(training_job, 'tenant_id', getattr(model, 'tenant_id', None))  # type: ignore
        setattr(training_job, 'model_id', model_id)  # type: ignore
        setattr(training_job, 'job_type', "retrain" if getattr(model, 'is_trained', False) else "initial")  # type: ignore
        setattr(training_job, 'training_config', {  # type: ignore
            "algorithm": getattr(model, 'algorithm', ''),
            "features": getattr(model, 'features', []),
            "target_variable": getattr(model, 'target_variable', ''),
            "hyperparameters": getattr(model, 'hyperparameters', {}),
            "validation_split": getattr(model, 'validation_split', 0.2)
        })
        setattr(training_job, 'data_source_config', {  # type: ignore
            "source": getattr(model, 'training_data_source', ''),
            "period_days": getattr(model, 'training_period_days', 90)
        })
        setattr(training_job, 'triggered_by', triggered_by)  # type: ignore
        setattr(training_job, 'triggered_by_user_id', triggered_by_user_id)  # type: ignore
        
        self.db.add(training_job)
        self.db.commit()
        self.db.refresh(training_job)
        
        # Start training in background
        asyncio.create_task(self._execute_training(training_job))
        
        return training_job

    async def _execute_training(self, training_job: AnalyticsTrainingJob):
        """Execute model training"""
        
        try:
            setattr(training_job, 'status', "running")
            setattr(training_job, 'started_at', datetime.utcnow())
            self.db.commit()
            
            # Get model
            model = self.db.query(AnalyticsModel).filter(
                AnalyticsModel.id == getattr(training_job, 'model_id', None)  # type: ignore
            ).first()  # type: ignore
            
            if not model:
                raise ValueError("Model not found during training")
            
            # Generate mock training data
            if pd is None:
                raise ImportError("pandas is required for training data generation")
            training_data = self._generate_training_data(model)  # pd.DataFrame
            
            # --- Preprocessing ---
            # Identify categorical features from model.features that are in training_data
            model_features = getattr(model, 'features', [])
            categorical_features = [
                col for col in model_features
                if col in training_data.columns and training_data[col].dtype == 'object'
            ]

            # Apply one-hot encoding to categorical features
            # Other features are assumed numeric or will be handled by the model if it supports them
            if categorical_features:
                X_processed = pd.get_dummies(training_data[model_features], columns=categorical_features, dummy_na=False)
            else:
                X_processed = training_data[model_features].copy()

            # Store processed feature names for prediction consistency
            processed_feature_names = X_processed.columns.tolist()

            # Target variable
            model_target_variable = getattr(model, 'target_variable', None)
            if not model_target_variable or model_target_variable not in training_data.columns:
                raise ValueError(f"Target variable '{model_target_variable}' not found in training data.")
            y = training_data[model_target_variable]

            # Ensure target is numeric if a regressor is used
            model_algorithm = getattr(model, 'algorithm', '')
            if "regressor" in model_algorithm.lower() or "regression" in model_algorithm.lower():
                if not pd.api.types.is_numeric_dtype(y):
                    try:
                        y = pd.to_numeric(y)
                    except ValueError:
                        raise ValueError(f"Target variable '{model_target_variable}' must be numeric for regression algorithms.")
            
            # Handle NaN values in features (simple imputation: fill with mean for numeric, mode for categorical - already handled by get_dummies for object type)
            # Handle NaN values in features - ensure we're working with DataFrame
            if isinstance(X_processed, pd.DataFrame):
                for col in X_processed.columns:
                    col_series = X_processed[col]
                    if pd.isna(col_series).any():
                        if pd.api.types.is_numeric_dtype(col_series):
                            X_processed[col] = col_series.fillna(col_series.mean())
                        else: # Should be one-hot encoded columns (0/1)
                            X_processed[col] = col_series.fillna(0) # Fill NaN in dummy columns with 0


            # Split data
            model_validation_split = getattr(model, 'validation_split', 0.2)
            if train_test_split is None:
                raise ImportError("sklearn is required for train_test_split")
            X_train, X_test, y_train, y_test = train_test_split(  # type: ignore
                X_processed, y, test_size=model_validation_split, random_state=42
            )
            
            # Initialize algorithm
            algorithm_class = self.supported_algorithms.get(model_algorithm)
            if not algorithm_class:
                raise ValueError(f"Unsupported algorithm: {model_algorithm}")
            
            # Create and train model
            model_hyperparameters = getattr(model, 'hyperparameters', {})
            ml_model = algorithm_class(**model_hyperparameters)
            ml_model.fit(X_train, y_train)
            
            # Make predictions
            y_pred = ml_model.predict(X_test)
            
            # Calculate metrics
            metrics = self._calculate_metrics(y_test, y_pred, model_algorithm)
            
            # Update training job
            setattr(training_job, 'training_samples', len(X_train))
            setattr(training_job, 'validation_samples', len(X_test))
            setattr(training_job, 'feature_count', len(model_features))
            setattr(training_job, 'final_metrics', metrics)
            # Safe method call with error handling
            try:
                training_job.mark_completed(True, metrics)
            except AttributeError:
                # Handle case where method doesn't exist
                setattr(training_job, 'status', 'completed')  # type: ignore
                setattr(training_job, 'completed_at', datetime.utcnow())  # type: ignore
            
            # Update model
            setattr(model, 'accuracy_score', metrics.get("accuracy"))
            setattr(model, 'precision_score', metrics.get("precision"))
            setattr(model, 'recall_score', metrics.get("recall"))
            setattr(model, 'f1_score', metrics.get("f1"))
            setattr(model, 'r2_score', metrics.get("r2"))
            setattr(model, 'mae_score', metrics.get("mae"))
            setattr(model, 'rmse_score', metrics.get("rmse"))
            setattr(model, 'last_trained_at', datetime.utcnow())
            setattr(model, 'status', "trained")
            
            # Save model to disk (mock implementation)
            model_uuid = getattr(model, 'model_uuid', 'unknown')
            model_version = getattr(model, 'version', '1.0')
            job_uuid = getattr(training_job, 'job_uuid', 'unknown')
            model_filename = f"model_{model_uuid}_v{model_version.replace('.', '_')}_job{job_uuid}.joblib"
            # In a real scenario, use a configurable, persistent storage path e.g. /mnt/models/
            model_path = f"/tmp/{model_filename}"
            if joblib is None:
                raise ImportError("joblib is required for model saving")
            joblib.dump(ml_model, model_path)  # type: ignore

            setattr(model, 'model_path', model_path)
            setattr(model, 'training_metadata', {
                "feature_columns": processed_feature_names,
                "categorical_features_original": categorical_features, # Original cat feature names before dummifying
                "target_variable_type": str(getattr(y, 'dtype', type(y).__name__))
                # Could add more metadata like label encodings if target is categorical and encoded
            })
            
            self.db.commit()
            
        except Exception as e:
            setattr(training_job, 'status', "failed")
            setattr(training_job, 'error_message', str(e))
            # Safe method call with error handling
            try:
                training_job.mark_completed(False)
            except AttributeError:
                # Handle case where method doesn't exist
                setattr(training_job, 'status', 'failed')  # type: ignore
                setattr(training_job, 'completed_at', datetime.utcnow())  # type: ignore
            self.db.commit()

    def _generate_training_data(self, model: AnalyticsModel):  # type: ignore
        """Generate mock training data for the model"""
        
        if np is None:
            raise ImportError("numpy is required for training data generation")
        np.random.seed(42)  # type: ignore
        n_samples = 1000
        
        data = {}
        
        # Generate feature data based on model type
        if getattr(model, 'model_type', None) == "performance":
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
                np.array(data["tasks_completed"]) * 2 +
                np.array(data["hours_worked"]) * 0.5 +
                np.array(data["experience_years"]) * 1.5 +
                np.random.normal(0, 5, n_samples)
            )
            if "quality_score" in getattr(model, 'metrics', []): # Example for multi-metric
                 data["quality_score"] = np.random.uniform(60, 100, n_samples)

        elif getattr(model, 'model_type', None) == "productivity":
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
                np.array(data["focus_time_hours"]) * 10 -
                np.array(data["interruptions_count"]) * 2 +
                np.array(data["collaboration_score"]) * 3 +
                np.random.normal(0, 5, n_samples)
            )

        elif getattr(model, 'model_type', None) == "roi":
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
                (np.array(data["investment_amount"]) * 0.3) / np.array(data["investment_amount"]) * 100 +
                np.random.normal(0, 20, n_samples)
            )

        else:
            # Generic data
            for feature in getattr(model, 'features', []):
                data[feature] = np.random.normal(50, 15, n_samples)
            target_var = getattr(model, 'target_variable', None)
            if target_var:
                data[target_var] = np.random.normal(75, 20, n_samples)  # type: ignore
            # Add mock dimension data if specified
            for dim in getattr(model, 'dimensions', []):
                if dim not in data: # Avoid overwriting features if names clash
                    data[dim] = np.random.choice([f"{dim}_A", f"{dim}_B", f"{dim}_C"], n_samples)
            for met in getattr(model, 'metrics', []):
                 if met not in data: # Avoid overwriting features or target_variable
                    data[met] = np.random.normal(100, 20, n_samples)

        if pd is None:
            raise ImportError("pandas is required for DataFrame creation")
        df = pd.DataFrame(data)  # type: ignore
        # Ensure all specified features, dimensions, and metrics columns exist.
        # Start with features defined in the model
        for feature in getattr(model, 'features', []):
            if feature not in data:
                # Add generic random data if not specifically generated above
                data[feature] = np.random.normal(50, 15, n_samples)

        # Add dimension columns with sample categorical values
        for i, dim_name in enumerate(getattr(model, 'dimensions', [])):
            if dim_name not in data: # Avoid overwriting if a feature has the same name
                # Create more varied sample values for dimensions
                num_categories = np.random.randint(2, 5) # 2 to 4 unique categories per dimension
                categories = [f"{dim_name}_Cat{j+1}" for j in range(num_categories)]
                data[dim_name] = np.random.choice(categories, n_samples)

        # Generate target variable if not already present (e.g. in performance type)
        target_var = getattr(model, 'target_variable', None)
        if target_var and target_var not in data:
            # Generic target based on sum of some features (if available) or random
            model_features = getattr(model, 'features', [])
            if len(model_features) > 0:
                # Ensure features used here are numeric and exist
                numeric_features = [f for f in model_features if pd.api.types.is_numeric_dtype(pd.Series(data[f]))]  # type: ignore
                if numeric_features:
                    base_target = pd.Series(data[numeric_features[0]]).fillna(0) * 0.5  # type: ignore
                    if len(numeric_features) > 1:
                         base_target += pd.Series(data[numeric_features[1]]).fillna(0) * 0.3  # type: ignore
                    data[target_var] = base_target + np.random.normal(0, 10, n_samples)  # type: ignore
                else:
                    data[target_var] = np.random.normal(75, 20, n_samples)  # type: ignore # Fallback if no numeric features
            else:
                data[target_var] = np.random.normal(75, 20, n_samples)  # type: ignore

        # Generate other metric columns if specified in model.metrics (for multi-output/multi-facet models)
        # These are treated as additional target-like variables or observed metrics alongside the main target.
        for metric_name in getattr(model, 'metrics', []):
            if metric_name not in data and metric_name != target_var:
                # Similar generic generation as target_variable, potentially based on other features/dims
                if len(model_features) > 0:
                    numeric_features = [f for f in model_features if pd.api.types.is_numeric_dtype(pd.Series(data[f]))]  # type: ignore
                    if numeric_features:
                        base_metric_val = pd.Series(data[numeric_features[0]]).fillna(0) * np.random.uniform(0.2, 0.6)  # type: ignore
                        data[metric_name] = base_metric_val + np.random.normal(0, 5, n_samples)  # type: ignore
                    else:
                        data[metric_name] = np.random.normal(50, 10, n_samples)  # type: ignore # Fallback
                else:
                    data[metric_name] = np.random.normal(50, 10, n_samples)  # type: ignore

        df = pd.DataFrame(data)  # type: ignore

        # Final check for any column specified in model that might have been missed (e.g. complex interactions)
        # This should ideally not be needed if above logic is comprehensive
        all_model_cols = set(getattr(model, 'features', [])) | set(getattr(model, 'dimensions', [])) | set(getattr(model, 'metrics', []))
        if target_var:
            all_model_cols.add(target_var)
        for col_name in all_model_cols:
            if col_name not in df.columns:
                df[col_name] = 0 # Default fill for safety, though ideally all should be generated

        return df

    def _calculate_metrics(self, y_true, y_pred, algorithm: str) -> Dict[str, float]:
        """Calculate model performance metrics"""
        
        metrics = {}
        
        # Regression metrics
        if "regressor" in algorithm or "regression" in algorithm:
            if r2_score is None or mean_absolute_error is None or mean_squared_error is None or np is None:
                raise ImportError("sklearn and numpy are required for regression metrics")
            metrics["r2"] = float(r2_score(y_true, y_pred))  # type: ignore
            metrics["mae"] = float(mean_absolute_error(y_true, y_pred))  # type: ignore
            metrics["rmse"] = float(np.sqrt(mean_squared_error(y_true, y_pred)))  # type: ignore
        
        # Classification metrics
        if "classifier" in algorithm or "classification" in algorithm:
            if accuracy_score is None or precision_score is None or recall_score is None or f1_score is None:
                raise ImportError("sklearn is required for classification metrics")
            metrics["accuracy"] = float(accuracy_score(y_true, y_pred))  # type: ignore
            metrics["precision"] = float(precision_score(y_true, y_pred, average='weighted'))  # type: ignore
            metrics["recall"] = float(recall_score(y_true, y_pred, average='weighted'))  # type: ignore
            metrics["f1"] = float(f1_score(y_true, y_pred, average='weighted'))  # type: ignore
        
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
            AnalyticsModel.id == model_id  # type: ignore
        ).first()  # type: ignore
        
        if not model:
            raise ValueError("Model not found")
        if not getattr(model, 'is_trained', False):
            raise ValueError("Model is not trained yet")
        if not getattr(model, 'model_path', None) or not getattr(model, 'training_metadata', None):
            raise ValueError("Model is not properly configured for prediction (missing path or metadata). Please retrain.")

        # Actual prediction using the trained model and pipeline
        prediction_output, confidence_score = self._execute_prediction_pipeline(model, input_features)

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
        prediction = AnalyticsPrediction()
        setattr(prediction, 'tenant_id', getattr(model, 'tenant_id', None))  # type: ignore
        setattr(prediction, 'model_id', model_id)  # type: ignore
        setattr(prediction, 'entity_type', entity_type)  # type: ignore
        setattr(prediction, 'entity_id', entity_id)  # type: ignore
        setattr(prediction, 'prediction_type', getattr(model, 'model_type', None))  # type: ignore
        setattr(prediction, 'input_features', input_features)  # type: ignore
        setattr(prediction, 'predicted_value', predicted_value_single)  # type: ignore
        setattr(prediction, 'predicted_values_multi_dim', predicted_values_multi_dim)  # type: ignore
        setattr(prediction, 'confidence_score', confidence_score)  # type: ignore
        setattr(prediction, 'prediction_interval_lower', predicted_value_single * 0.9 if predicted_value_single is not None else None)  # type: ignore
        setattr(prediction, 'prediction_interval_upper', predicted_value_single * 1.1 if predicted_value_single is not None else None)  # type: ignore
        setattr(prediction, 'prediction_horizon_days', prediction_horizon_days)  # type: ignore
        setattr(prediction, 'expires_at', datetime.utcnow() + timedelta(days=7) if prediction_horizon_days else None)  # type: ignore
        setattr(prediction, 'created_by_user_id', created_by_user_id)  # type: ignore
        setattr(prediction, 'raw_prediction_output', prediction_output)  # type: ignore
        
        self.db.add(prediction)
        self.db.commit()
        self.db.refresh(prediction)
        
        # Update model usage statistics
        current_count = getattr(model, 'prediction_count', 0)
        setattr(model, 'prediction_count', current_count + 1)  # type: ignore
        setattr(model, 'last_prediction_at', datetime.utcnow())  # type: ignore
        self.db.commit()
        
        return prediction

    def _execute_prediction_pipeline(self, model: AnalyticsModel, input_features: Dict[str, Any]) -> Tuple[Any, Optional[float]]:  # type: ignore
        """
        Loads a trained model and executes the prediction pipeline including preprocessing.
        Returns a tuple: (prediction_output, confidence_score)
        """
        try:
            if joblib is None:
                raise ImportError("joblib is required for model loading")
            model_path = getattr(model, 'model_path', None)
            if not model_path:
                raise ValueError("Model path not found")
            ml_model = joblib.load(model_path)  # type: ignore
        except FileNotFoundError:
            raise ValueError(f"Model file not found at {model.model_path}. Please retrain the model.")
        except Exception as e:
            raise ValueError(f"Error loading model: {str(e)}")

        training_meta = getattr(model, 'training_metadata', None)
        if not training_meta or "feature_columns" not in training_meta:
            raise ValueError("Training metadata (feature_columns) not found. Please retrain the model.")

        trained_feature_columns = training_meta["feature_columns"]
        original_categorical_features = training_meta.get("categorical_features_original", [])

        # Prepare input DataFrame from input_features dict
        # Ensure it's a DataFrame with a single row
        if pd is None:
            raise ImportError("pandas is required for prediction pipeline")
        input_df = pd.DataFrame([input_features])  # type: ignore

        # Preprocess input_df similar to training data
        # 1. Apply one-hot encoding for original categorical features
        if original_categorical_features:
            input_df_processed = pd.get_dummies(input_df, columns=original_categorical_features, dummy_na=False)  # type: ignore
        else:
            input_df_processed = input_df.copy()

        # 2. Align columns with the training set (add missing, remove extra, reorder)
        # Add missing columns (that were present in training) and fill with 0 (for dummy variables)
        for col in trained_feature_columns:
            if col not in input_df_processed.columns:
                input_df_processed[col] = 0

        # Ensure order of columns is the same as during training
        # Also, drop any columns in input_df_processed not in trained_feature_columns
        input_df_aligned = input_df_processed.reindex(columns=trained_feature_columns, fill_value=0)

        # 3. Handle NaN values (consistent with training)
        # Assuming simple mean imputation for numeric and 0 for dummies (already done by reindex fill_value=0 for new cols)
        for col in input_df_aligned.columns:
            if input_df_aligned[col].isnull().any():
                # This relies on training_meta potentially storing imputation values if more complex strategy was used
                # For now, if a column that was numeric in training still has NaN, we'd need its mean from training.
                # This part might need refinement if NaNs are expected in raw input_features for non-dummy vars.
                # For simplicity, if a value for an original feature was null/missing and it became a set of dummies,
                # those dummies would be 0. If an original numeric feature is NaN, it needs imputation.
                # The get_dummies + reindex approach handles many cases.
                # Fallback for any remaining NaNs in numeric columns after alignment:
                if pd.api.types.is_numeric_dtype(input_df_aligned[col]):
                     # A more robust solution would store training time means in training_metadata
                    print(f"Warning: NaN found in numeric feature '{col}' for prediction. Filling with 0. Consider storing training means.")
                    input_df_aligned[col] = input_df_aligned[col].fillna(0)


        # Make prediction
        try:
            if hasattr(ml_model, "predict_proba"):
                # Classification model
                probabilities = ml_model.predict_proba(input_df_aligned)
                # Assuming binary classification for simplicity, take prob of positive class
                # For multi-class, this logic would need to be adapted based on what 'predicted_value' should represent
                prediction_result = probabilities[0][1] # Probability of class 1
                confidence = float(max(probabilities[0])) # Confidence is the max probability for the predicted class
            elif hasattr(ml_model, "predict"):
                # Regression model or classifier without predict_proba
                prediction_result = ml_model.predict(input_df_aligned)[0]
                confidence = None # Confidence scores might not be directly available for all regressors
            else:
                raise ValueError("Loaded model does not have predict() or predict_proba() method.")
        except Exception as e:
            raise ValueError(f"Error during model prediction: {str(e)}")

        # For now, the raw prediction_result from the model is returned.
        # Mapping this to a multi-dimensional structure (if model.dimensions is set)
        # would be a separate step, potentially based on model.metrics.
        # This step assumes the model's direct output is what's desired or will be post-processed.
        # If model.dimensions and model.metrics are set, this is where one might construct
        # the {"multi_dim": [...]} structure if the model doesn't output it directly.
        # For this iteration, we'll keep it simple: prediction_result is the direct model output.

        # Example of how one might structure for multi-dim if model.metrics are defined (conceptual)
        if getattr(model, 'dimensions', None) and getattr(model, 'metrics', None) and not isinstance(prediction_result, dict):
            # This is a placeholder. Real multi-output models or custom logic would be needed.
            # If the model predicts a single value, and we need to assign it to multiple metrics
            # across dimensions, that's a complex mapping not handled here.
            # For now, assume prediction_result is the primary target or needs to be wrapped.
            # If `model.metrics` has one item, we can assume `prediction_result` corresponds to it.
            model_metrics = getattr(model, 'metrics', [])
            if len(model_metrics) == 1:
                 # This is a simplified interpretation for a single predicted metric value
                 # that might be presented in a multi-dimensional context later.
                 # The current `AnalyticsPrediction.predicted_values_multi_dim` is for when the *model itself*
                 # or a post-processing step generates multiple distinct values per dimension combination.
                 # Here, we are just returning the model's direct output.
                 pass # No change to prediction_result, it's handled by the caller.

        return prediction_result, confidence


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
            AnalyticsPrediction.tenant_id == tenant_id  # type: ignore
        )
        
        if model_id:
            query = query.filter(AnalyticsPrediction.model_id == model_id)  # type: ignore
        
        if entity_type:
            query = query.filter(AnalyticsPrediction.entity_type == entity_type)  # type: ignore
        
        if entity_id:
            query = query.filter(AnalyticsPrediction.entity_id == entity_id)  # type: ignore
        
        return query.order_by(desc(AnalyticsPrediction.prediction_date)).limit(limit).all()  # type: ignore

    def get_prediction_by_id(self, prediction_id: int, tenant_id: int) -> Optional[AnalyticsPrediction]:
        """Get a specific analytics prediction by ID."""
        return self.db.query(AnalyticsPrediction).filter(
            AnalyticsPrediction.id == prediction_id,  # type: ignore
            AnalyticsPrediction.tenant_id == tenant_id  # type: ignore
        ).first()  # type: ignore

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

        # Safe ROI update with proper type handling
        try:
            update_data_dict = roi_update_data if isinstance(roi_update_data, dict) else roi_update_data.model_dump(exclude_unset=True)
        except AttributeError:
            update_data_dict = roi_update_data if isinstance(roi_update_data, dict) else {}
        needs_recalculation = False

        # Handle metric_links if provided in the update
        if "metric_links" in update_data_dict and update_data_dict["metric_links"] is not None:
            # If metric_links are updated, it implies a potential change in underlying values.
            # We might need to reset relevant cost/benefit fields before applying new links,
            # or the linking logic should be additive/idempotent if desired.
            # For simplicity, let's assume new links might override or add to values.
            # This part could be complex depending on how updates to links should behave.
            # A simple approach: re-evaluate all linked values.
            # To do this cleanly, we might need a helper or re-use parts of create_roi_calculation's link processing.

            # For now, let's just note that if metric_links are changed, a full re-evaluation is implied.
            # We'll set needs_recalculation to True. The actual processing of updated
            # metric_links to update the Decimal fields on `calculation` object before `update_totals`
            # would require iterating through them similar to `create_roi_calculation`.

            # Simplified: Assume the values linked by metric_links are directly updated in other fields
            # of roi_update_data if they change due to metric_links.
            # The current `create_roi_calculation` modifies `roi_data` (which becomes `update_data_dict` here).
            # So, if `metric_links` are passed, we should process them to update the numeric fields.

            # Process metric_links to update numeric fields in update_data_dict itself
            # This is a conceptual placement; the actual update of `calculation` fields happens below.
            # What we need is for `update_data_dict` to reflect values derived from new `metric_links`.
            # The `create_roi_calculation` has this logic. We can extract it.

            # Let's assume for now that if `metric_links` are in `update_data_dict`,
            # the caller has already resolved them into the respective cost/benefit fields within `update_data_dict`.
            # A more robust implementation would re-process metric_links here.
            # For this iteration, we'll rely on direct field updates triggering recalculation.
            if update_data_dict.get("metric_links"): # If new links are explicitly passed
                 needs_recalculation = True # Signal that a full recalculation is likely needed.
                                           # The actual application of these new links to fields is complex if not done by caller.

        for key, value in update_data_dict.items():
            if key == "metric_links": # metric_links themselves are not a direct column on ROICalculation model
                # Storing the raw metric_links definition could be done if the model had a field for it, e.g., `raw_metric_links_definition = Column(JSON)`
                # For now, we assume they are processed and affect other numeric fields.
                continue

            # Convert to Decimal if the field is a Decimal type in the model
            # Safe attribute setting with type checking
            if hasattr(calculation, key) and isinstance(getattr(calculation, key, None), Decimal):
                if value is not None: # Ensure value is not None before Decimal conversion
                    setattr(calculation, key, Decimal(str(value)))  # type: ignore
                else:
                    setattr(calculation, key, None)  # type: ignore # Allow setting Decimal fields to None if applicable
            else:
                setattr(calculation, key, value)  # type: ignore

            # Check if any field that affects ROI calculation is changed
            if key in [
                "initial_investment", "operational_costs", "labor_costs",
                "technology_costs", "training_costs", "other_costs",
                "revenue_increase", "cost_savings", "productivity_gains",
                "efficiency_gains", "quality_improvements", "risk_reduction", "other_benefits"
            ]:
                needs_recalculation = True

        setattr(calculation, 'updated_at', datetime.utcnow())  # type: ignore
        # calculation.updated_by_user_id = updated_by_user_id # If model has this field

        if needs_recalculation:
            # Safe method calls with error handling
            try:
                calculation.update_totals() # This sums up the Decimal fields
                calculation.calculate_roi_metrics() # This calculates percentages etc. from totals
            except AttributeError as e:
                # Handle case where methods don't exist
                pass

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
            ROICalculation.tenant_id == tenant_id,  # type: ignore
            ROICalculation.entity_id.in_(entity_ids)  # type: ignore
        ).all()
        
        if not calculations:
            return {"error": "No ROI calculations found"}
        
        # Safe attribute access for calculations
        total_investment = sum(getattr(calc, 'total_investment', 0) for calc in calculations)
        total_benefits = sum(getattr(calc, 'total_benefits', 0) for calc in calculations)
        
        portfolio_roi = float((total_benefits - total_investment) / total_investment * 100) if total_investment > 0 else 0.0
        
        return {
            "portfolio_roi_percentage": portfolio_roi,
            "total_investment": float(total_investment),
            "total_benefits": float(total_benefits),
            "net_value": float(total_benefits - total_investment),
            "calculation_count": len(calculations),
            "entity_count": len(entity_ids),
            "average_roi": sum(getattr(calc, 'roi_percentage', 0) for calc in calculations) / len(calculations),
            "best_performing": getattr(max(calculations, key=lambda x: getattr(x, 'roi_percentage', 0)), 'entity_id', None),
            "worst_performing": getattr(min(calculations, key=lambda x: getattr(x, 'roi_percentage', 0)), 'entity_id', None)
        }

    # Performance Metrics
    def record_performance_metric(
        self,
        tenant_id: int,
        metric_data: Dict[str, Any],
        measured_by_user_id: Optional[int] = None
    ) -> PerformanceMetric:
        """Record a performance metric"""
        
        metric = PerformanceMetric()
        setattr(metric, 'tenant_id', tenant_id)
        setattr(metric, 'metric_name', metric_data["metric_name"])
        setattr(metric, 'display_name', metric_data["display_name"])
        setattr(metric, 'description', metric_data.get("description"))
        setattr(metric, 'metric_type', metric_data["metric_type"])
        setattr(metric, 'category', metric_data["category"])
        setattr(metric, 'entity_type', metric_data["entity_type"])
        setattr(metric, 'entity_id', metric_data["entity_id"])
        setattr(metric, 'measurement_unit', metric_data["measurement_unit"])
        setattr(metric, 'calculation_method', metric_data["calculation_method"])
        setattr(metric, 'current_value', metric_data["current_value"])
        setattr(metric, 'previous_value', metric_data.get("previous_value"))
        setattr(metric, 'baseline_value', metric_data.get("baseline_value"))
        setattr(metric, 'target_value', metric_data.get("target_value"))
        setattr(metric, 'period_start', metric_data["period_start"])
        setattr(metric, 'period_end', metric_data["period_end"])
        setattr(metric, 'period_type', metric_data["period_type"])
        setattr(metric, 'warning_threshold', metric_data.get("warning_threshold"))
        setattr(metric, 'critical_threshold', metric_data.get("critical_threshold"))
        setattr(metric, 'data_completeness', metric_data.get("data_completeness", 1.0))
        setattr(metric, 'data_accuracy', metric_data.get("data_accuracy", 1.0))
        setattr(metric, 'confidence_score', metric_data.get("confidence_score", 1.0))
        setattr(metric, 'measured_by_user_id', measured_by_user_id)
        setattr(metric, 'dimensions_values', metric_data.get("dimensions_values"))
        setattr(metric, 'predicted_by_model_id', metric_data.get("predicted_by_model_id"))
        
        # Calculate trend
        # Safe method call with error handling
        try:
            metric.calculate_trend()
        except AttributeError:
            # Handle case where method doesn't exist
            pass
        
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
        limit: int = 100,
        dimension_filters: Optional[Dict[str, Any]] = None
    ) -> List[PerformanceMetric]:
        """Get performance metrics for tenant, with optional dimension filtering."""
        
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

        if dimension_filters:
            for key, value in dimension_filters.items():
                # Assuming PostgreSQL JSONB @> operator for contains.
                # For other databases, JSON functions might differ (e.g., func.json_extract)
                # This checks if the dimensions_values JSON contains a specific key-value pair.
                query = query.filter(PerformanceMetric.dimensions_values.has_key(key)) # Check if key exists first for some DBs
                query = query.filter(PerformanceMetric.dimensions_values[key].astext == str(value))

        return query.order_by(desc(PerformanceMetric.measurement_date)).limit(limit).all()

    # Analytics and Reporting
    def get_analytics_dashboard(self, tenant_id: int) -> Dict[str, Any]:
        """Get comprehensive analytics dashboard data"""
        
        # Model statistics
        total_models = self.db.query(AnalyticsModel).filter(
            AnalyticsModel.tenant_id == tenant_id
        ).count()
        
        active_models = self.db.query(AnalyticsModel).filter(
            AnalyticsModel.tenant_id == tenant_id,  # type: ignore
            AnalyticsModel.is_active == True  # type: ignore
        ).count()
        
        trained_models = self.db.query(AnalyticsModel).filter(
            AnalyticsModel.tenant_id == tenant_id,  # type: ignore
            AnalyticsModel.status == "trained"  # type: ignore
        ).count()
        
        # Prediction statistics
        total_predictions = self.db.query(AnalyticsPrediction).filter(
            AnalyticsPrediction.tenant_id == tenant_id
        ).count()
        
        recent_predictions = self.db.query(AnalyticsPrediction).filter(
            AnalyticsPrediction.tenant_id == tenant_id,  # type: ignore
            AnalyticsPrediction.prediction_date >= datetime.utcnow() - timedelta(days=7)  # type: ignore
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
            relevant_models = [m for m in models if getattr(m, 'accuracy_score', None) is not None]
            if relevant_models:
                avg_accuracy = sum(getattr(m, 'accuracy_score', 0) for m in relevant_models) / len(relevant_models)
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
            positive_roi_count = sum(1 for calc in roi_calcs if getattr(calc, 'roi_percentage', 0) > 0)
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
            recent_predictions = [p for p in predictions if getattr(p, 'prediction_date', datetime.utcnow()) >= datetime.utcnow() - timedelta(days=7)]
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
        benchmark = ComparativeBenchmark()
        setattr(benchmark, 'tenant_id', tenant_id)
        setattr(benchmark, 'name', benchmark_data["name"])
        setattr(benchmark, 'description', benchmark_data.get("description"))
        setattr(benchmark, 'category', benchmark_data["category"])
        setattr(benchmark, 'source', benchmark_data.get("source"))
        setattr(benchmark, 'metric_name', benchmark_data["metric_name"])
        setattr(benchmark, 'entity_type', benchmark_data.get("entity_type"))
        setattr(benchmark, 'industry_segment', benchmark_data.get("industry_segment"))
        setattr(benchmark, 'region', benchmark_data.get("region"))
        setattr(benchmark, 'company_size', benchmark_data.get("company_size"))
        setattr(benchmark, 'benchmark_value', benchmark_data["benchmark_value"])
        setattr(benchmark, 'value_type', benchmark_data.get("value_type", "average"))
        setattr(benchmark, 'unit', benchmark_data.get("unit"))
        setattr(benchmark, 'period_start_date', benchmark_data.get("period_start_date"))
        setattr(benchmark, 'period_end_date', benchmark_data.get("period_end_date"))
        setattr(benchmark, 'data_freshness_date', benchmark_data.get("data_freshness_date", datetime.utcnow()))
        setattr(benchmark, 'dimensions', benchmark_data.get("dimensions"))
        setattr(benchmark, 'created_by_user_id', created_by_user_id)
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
        # Build query with separate conditions to avoid SQLAlchemy type issues
        base_query = self.db.query(ComparativeBenchmark).filter(
            ComparativeBenchmark.metric_name == metric_name,
            ComparativeBenchmark.is_active == True
        )
        
        # Get tenant-specific benchmarks
        tenant_query = base_query.filter(ComparativeBenchmark.tenant_id == tenant_id)
        # Get global benchmarks
        global_query = base_query.filter(ComparativeBenchmark.tenant_id.is_(None))
        
        # Union the results
        query = tenant_query.union(global_query)
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

        predicted_value = getattr(prediction, 'predicted_value', None)
        if benchmark_params and predicted_value is not None:
            model = self.db.query(AnalyticsModel).filter(AnalyticsModel.id == model_id).first()
            if model:
                target_variable = getattr(model, 'target_variable', '')
                tenant_id = getattr(model, 'tenant_id', None)
                benchmarks = self.get_benchmarks(
                    metric_name=target_variable, # Assuming target variable is the metric to benchmark
                    tenant_id=tenant_id,
                    **benchmark_params
                )
                if benchmarks:
                    # For simplicity, use the first relevant benchmark found
                    relevant_benchmark = benchmarks[0]
                    setattr(prediction, 'benchmark_comparison_data', {  # type: ignore
                        "benchmark_name": getattr(relevant_benchmark, 'name', ''),
                        "benchmark_value": getattr(relevant_benchmark, 'benchmark_value', 0),
                        "entity_value": getattr(prediction, 'predicted_value', 0),
                        "difference": getattr(prediction, 'predicted_value', 0) - getattr(relevant_benchmark, 'benchmark_value', 0),
                        "unit": getattr(relevant_benchmark, 'unit', '')
                    })
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
        metric_name = getattr(metric, 'metric_name', '')
        metric_category = getattr(metric, 'category', None)
        dimensions_values = getattr(metric, 'dimensions_values', None) or {}
        
        effective_benchmark_params = {
            "metric_name": metric_name,
            "category": (benchmark_params or {}).get("category", metric_category if metric_category else None), # Use metric's category if available
            # Infer more specific params from metric.dimensions_values if not in benchmark_params
            # This is an example; mapping from dimensions_values to benchmark fields might be complex
            "industry_segment": (benchmark_params or {}).get("industry_segment", dimensions_values.get("industry_segment") if dimensions_values else None),
            "region": (benchmark_params or {}).get("region", dimensions_values.get("region") if dimensions_values else None),
            "company_size": (benchmark_params or {}).get("company_size", dimensions_values.get("company_size") if dimensions_values else None),
        }
        # Remove None values from params to avoid issues with get_benchmarks query
        effective_benchmark_params = {k: v for k, v in effective_benchmark_params.items() if v is not None}

        if benchmark_params: # If explicit params are given, they take precedence
            effective_benchmark_params.update(benchmark_params)
            # Ensure metric_name is always from the metric itself for relevance
            effective_benchmark_params["metric_name"] = metric_name


        benchmarks = self.get_benchmarks(
            tenant_id=tenant_id, # Pass tenant_id to get_benchmarks for global+tenant specific
            **effective_benchmark_params
        )

        for benchmark in benchmarks:
            current_value = getattr(metric, 'current_value', 0)
            measurement_unit = getattr(metric, 'measurement_unit', '')
            benchmark_name = getattr(benchmark, 'name', '')
            benchmark_value = getattr(benchmark, 'benchmark_value', 0)
            benchmark_unit = getattr(benchmark, 'unit', '')
            benchmark_value_type = getattr(benchmark, 'value_type', '')
            
            comparison_data = {
                "performance_metric_name": metric_name,
                "performance_metric_value": current_value,
                "performance_metric_unit": measurement_unit,
                "benchmark_name": benchmark_name,
                "benchmark_value": benchmark_value,
                "benchmark_unit": benchmark_unit,
                "benchmark_value_type": benchmark_value_type,
                "difference": None,
                "comparison_unit": measurement_unit # Assume comparison in metric's unit
            }
            # Ensure units are compatible for a meaningful difference calculation
            # This is a simplified check; real unit conversion might be needed.
            if measurement_unit == benchmark_unit or (not measurement_unit and not benchmark_unit):
                comparison_data["difference"] = current_value - benchmark_value
            else:
                # If units differ and no conversion logic, difference is not directly comparable
                comparison_data["difference_comment"] = f"Units differ: Metric ({measurement_unit}), Benchmark ({benchmark_unit})"

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
        benchmark_tenant_id = getattr(benchmark, 'tenant_id', None)
        if benchmark_tenant_id is None or benchmark_tenant_id == tenant_id:
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
        benchmark_tenant_id = getattr(benchmark, 'tenant_id', None)
        is_global_benchmark = benchmark_tenant_id is None
        can_update = False
        if is_global_benchmark:
            # TODO: Add role check for admin if current_user object was available with roles
            # For now, let's prevent non-admin update of global benchmarks by requiring tenant match
            # This means global benchmarks can't be updated by this method without admin role check.
            # A simpler rule for now: if it's global, only specific admin user can update (not implemented)
            # Or, if we assume only tenant-specific benchmarks can be updated via this tenant-scoped endpoint:
            pass # Requires admin check logic for global benchmarks

        if benchmark_tenant_id == requesting_tenant_id:
            can_update = True

        # A simple protection: if benchmark is global, only an admin (not checked here) should update.
        # If it's tenant-specific, only that tenant's user (checked by requesting_tenant_id matching benchmark.tenant_id).
        if is_global_benchmark:
            # For now, prevent non-admin updates of global benchmarks through this flow.
            # An admin-specific endpoint or role check would be needed.
            # This effectively means only tenant-specific benchmarks can be updated here.
            # Or, if an admin *is* using this and their tenant_id is passed as requesting_tenant_id,
            # that wouldn't make sense for a global benchmark.
            # Simplest for now: if global, deny unless specific admin check (not present).
            # To allow admin updates via a generic endpoint, we'd need user roles.
            # For this iteration, let's assume this endpoint is primarily for tenant users managing their own benchmarks.
            print(f"Warning: Update attempt on global benchmark {benchmark_id} by tenant {requesting_tenant_id}. Requires admin privileges not checked here.")
            return None
        elif benchmark_tenant_id != requesting_tenant_id:
            # Benchmark is tenant-specific, but user's tenant does not match.
            return None

        update_data_dict = benchmark_update_data if isinstance(benchmark_update_data, dict) else benchmark_update_data.model_dump(exclude_unset=True)
        for key, value in update_data_dict.items():
            setattr(benchmark, key, value)

        setattr(benchmark, 'updated_at', datetime.utcnow())  # type: ignore
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
        benchmark_tenant_id = getattr(benchmark, 'tenant_id', None)
        is_global_benchmark = benchmark_tenant_id is None

        if is_global_benchmark:
            # For now, prevent non-admin deletion of global benchmarks through this flow.
            # Requires admin role check.
            print(f"Warning: Delete attempt on global benchmark {benchmark_id} by tenant {requesting_tenant_id}. Requires admin privileges not checked here.")
            return False
        elif benchmark_tenant_id != requesting_tenant_id:
            # Benchmark is tenant-specific, but user's tenant does not match.
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


        roi_calc = ROICalculation()
        setattr(roi_calc, 'tenant_id', tenant_id)
        setattr(roi_calc, 'entity_type', roi_data["entity_type"])
        setattr(roi_calc, 'entity_id', roi_data["entity_id"])
        setattr(roi_calc, 'calculation_name', roi_data["calculation_name"])
        setattr(roi_calc, 'description', roi_data.get("description"))
        setattr(roi_calc, 'period_start', roi_data["period_start"])
        setattr(roi_calc, 'period_end', roi_data["period_end"])
        setattr(roi_calc, 'period_days', (roi_data["period_end"] - roi_data["period_start"]).days)
        setattr(roi_calc, 'initial_investment', Decimal(str(roi_data.get("initial_investment", 0))))
        setattr(roi_calc, 'operational_costs', Decimal(str(roi_data.get("operational_costs", 0))))
        setattr(roi_calc, 'labor_costs', Decimal(str(roi_data.get("labor_costs", 0))))
        setattr(roi_calc, 'technology_costs', Decimal(str(roi_data.get("technology_costs", 0))))
        setattr(roi_calc, 'training_costs', Decimal(str(roi_data.get("training_costs", 0))))
        setattr(roi_calc, 'other_costs', Decimal(str(roi_data.get("other_costs", 0))))
        setattr(roi_calc, 'revenue_increase', Decimal(str(roi_data.get("revenue_increase", 0))))
        setattr(roi_calc, 'cost_savings', Decimal(str(roi_data.get("cost_savings", 0))))
        setattr(roi_calc, 'productivity_gains', Decimal(str(roi_data.get("productivity_gains", 0))))
        setattr(roi_calc, 'efficiency_gains', Decimal(str(roi_data.get("efficiency_gains", 0))))
        setattr(roi_calc, 'quality_improvements', Decimal(str(roi_data.get("quality_improvements", 0))))
        setattr(roi_calc, 'risk_reduction', Decimal(str(roi_data.get("risk_reduction", 0))))
        setattr(roi_calc, 'other_benefits', Decimal(str(roi_data.get("other_benefits", 0))))
        setattr(roi_calc, 'calculation_method', roi_data.get("calculation_method", "simple"))
        setattr(roi_calc, 'discount_rate', roi_data.get("discount_rate", 0.1))
        setattr(roi_calc, 'assumptions', roi_data.get("assumptions", {}))
        setattr(roi_calc, 'data_sources', roi_data.get("data_sources", []))
        setattr(roi_calc, 'analytics_model_id', roi_data.get("analytics_model_id"))
        setattr(roi_calc, 'calculated_by_user_id', calculated_by_user_id)

        roi_calc.update_totals()
        roi_calc.calculate_roi_metrics()

        self.db.add(roi_calc)
        self.db.commit()
        self.db.refresh(roi_calc)

        return roi_calc

    def calculate_multi_dimensional_metrics(
        self,
        model_id: int,
        data_records: List[Dict[str, Any]] # Expects a list of records (dicts)
    ) -> List[Dict[str, Any]]:
        """
        Calculates and aggregates multi-dimensional metrics based on model config.
        Input data_records is a list of dictionaries, which will be converted to a DataFrame.
        """
        model = self.db.query(AnalyticsModel).filter(AnalyticsModel.id == model_id).first()
        if not model:
            raise ValueError(f"AnalyticsModel with id {model_id} not found.")

        model_dimensions = getattr(model, 'dimensions', None)
        if not model_dimensions:
            # Not a multi-dimensional model configuration, or dimensions not specified
            # Depending on requirements, could return empty, error, or process as single dimension
            return [] # Or raise ValueError("Model does not have dimensions specified.")

        model_metrics = getattr(model, 'metrics', None)
        if not model_metrics:
            return [] # Or raise ValueError("Model does not have metrics specified for aggregation.")

        if not data_records:
            return []

        if pd is None:
            raise ImportError("pandas is required for multi-dimensional metrics")
        data_df = pd.DataFrame(data_records)  # type: ignore

        # Validate that all specified dimensions and metrics exist in the DataFrame
        for dim in model_dimensions:
            if dim not in data_df.columns:
                raise ValueError(f"Dimension '{dim}' specified in model not found in provided data.")
        for met in model_metrics:
            if met not in data_df.columns:
                raise ValueError(f"Metric '{met}' specified in model not found in provided data.")
            # Ensure metric column is numeric for aggregation
            if not pd.api.types.is_numeric_dtype(data_df[met]):  # type: ignore
                try:
                    data_df[met] = pd.to_numeric(data_df[met])  # type: ignore
                except ValueError:
                    raise ValueError(f"Metric column '{met}' could not be converted to numeric type for aggregation.")

        # Perform groupby and aggregation
        try:
            grouped_data = data_df.groupby(model_dimensions)
        except KeyError as e:
            # This might happen if a dimension in model.dimensions is not in data_df columns,
            # though the check above should catch it.
            raise ValueError(f"Error grouping data by dimensions: {e}. Ensure all dimensions are in data.")

        results = []
        for name, group in grouped_data:
            aggregated_metrics = {}
            for metric_col in model.metrics:
                # Ensure metric_col is valid and numeric (already checked)
                aggregation_types = getattr(model, 'aggregation_types', {})
                agg_type = aggregation_types.get(metric_col, "sum").lower() # Default to sum

                if agg_type == "sum":
                    aggregated_metrics[metric_col] = group[metric_col].sum()
                elif agg_type == "mean":
                    aggregated_metrics[metric_col] = group[metric_col].mean()
                elif agg_type == "count":
                    aggregated_metrics[metric_col] = group[metric_col].count()
                elif agg_type == "min":
                    aggregated_metrics[metric_col] = group[metric_col].min()
                elif agg_type == "max":
                    aggregated_metrics[metric_col] = group[metric_col].max()
                elif agg_type == "median":
                    aggregated_metrics[metric_col] = group[metric_col].median()
                elif agg_type == "std":
                    aggregated_metrics[metric_col] = group[metric_col].std()
                elif agg_type == "var":
                    aggregated_metrics[metric_col] = group[metric_col].var()
                else:
                    # Log a warning for unsupported aggregation type and default to sum
                    print(f"Warning: Unsupported aggregation type '{agg_type}' for metric '{metric_col}'. Defaulting to 'sum'.")
                    aggregated_metrics[metric_col] = group[metric_col].sum()

            # Ensure name is a tuple if multiple dimensions, otherwise it's a single value
            dim_values_tuple = name if isinstance(name, tuple) else (name,)

            # Handle cases where a dimension value might be NaN (common after groupby if original data had NaNs in dimension columns)
            # Convert NaN dimension values to None (or a string like "N/A") for JSON serialization
            cleaned_dim_values = []
            for val in dim_values_tuple:
                if pd.isna(val):  # type: ignore
                    cleaned_dim_values.append(None) # Or "N/A"
                else:
                    cleaned_dim_values.append(val)

            results.append({
                "dimensions": dict(zip(model_dimensions, cleaned_dim_values)),
                "metrics": aggregated_metrics
            })
        return results

    # Dashboard and Widget Configuration Services

    def create_dashboard(self, tenant_id: int, user_id: int, dashboard_data: analytics_schemas.DashboardCreate) -> AnalyticsDashboard:
        """Creates a new analytics dashboard and its initial widgets."""
        db_dashboard = AnalyticsDashboard()
        setattr(db_dashboard, 'tenant_id', tenant_id)
        setattr(db_dashboard, 'user_id', user_id)
        setattr(db_dashboard, 'name', dashboard_data.name)
        setattr(db_dashboard, 'description', dashboard_data.description)
        setattr(db_dashboard, 'tags', dashboard_data.tags)
        setattr(db_dashboard, 'layout', []) # Layout will be built based on created widgets
        self.db.add(db_dashboard)
        self.db.flush() # Flush to get db_dashboard.id for widgets and layout

        created_widgets = []
        layout_items = []
        if dashboard_data.widgets:
            for i, widget_create_data in enumerate(dashboard_data.widgets):
                db_widget = DashboardWidgetConfig()
                setattr(db_widget, 'dashboard_id', db_dashboard.id)
                setattr(db_widget, 'tenant_id', tenant_id) # Ensure widget tenant matches dashboard
                setattr(db_widget, 'widget_type', widget_create_data.widget_type)
                setattr(db_widget, 'title', widget_create_data.title)
                setattr(db_widget, 'data_source_config', widget_create_data.data_source_config.model_dump())
                setattr(db_widget, 'display_options', widget_create_data.display_options)
                self.db.add(db_widget)
                self.db.flush() # Get ID for layout
                created_widgets.append(db_widget)

                # Use layout from input if provided and matches index, else default placement
                if dashboard_data.layout and i < len(dashboard_data.layout) and dashboard_data.layout[i].widget_config_id == 0: # Placeholder ID
                    # This matching is tricky if widget_config_id in input layout isn't predictable.
                    # A better way for DashboardCreate: layout items might not have widget_config_id yet,
                    # or they refer to the order of widgets in the `widgets` list.
                    # For now, let's assume layout in DashboardCreate might be conceptual or handled by default.
                    # Default placement:
                    layout_item = analytics_schemas.LayoutItem()
                    setattr(layout_item, 'widget_config_id', db_widget.id)
                    setattr(layout_item, 'x', (i % 4) * 3)
                    setattr(layout_item, 'y', (i // 4) * 2)
                    setattr(layout_item, 'w', 3)
                    setattr(layout_item, 'h', 2)
                    layout_items.append(layout_item.model_dump())
                else: # Default layout if not specified or mismatched
                    layout_item = analytics_schemas.LayoutItem()
                    setattr(layout_item, 'widget_config_id', db_widget.id)
                    setattr(layout_item, 'x', (i % 4) * 3)
                    setattr(layout_item, 'y', (i // 4) * 2)
                    setattr(layout_item, 'w', 3)
                    setattr(layout_item, 'h', 2)
                    layout_items.append(layout_item.model_dump())


        setattr(db_dashboard, 'layout', layout_items)  # type: ignore
        self.db.commit()
        self.db.refresh(db_dashboard)
        # To ensure widgets are loaded in the returned object if accessed:
        self.db.refresh(db_dashboard)
        for widget in created_widgets: # Ensure created widgets are also refreshed if needed
            self.db.refresh(widget)
        return db_dashboard

    def get_dashboard(self, dashboard_id: int, tenant_id: int, user_id: int) -> Optional[AnalyticsDashboard]:
        """Gets a specific dashboard by ID, ensuring tenant and user ownership."""
        # Add user_id check for ownership or sharing rules later
        return self.db.query(AnalyticsDashboard).filter(
            AnalyticsDashboard.id == dashboard_id,
            AnalyticsDashboard.tenant_id == tenant_id,
            # AnalyticsDashboard.user_id == user_id # Uncomment for strict ownership
        ).first()

    def get_dashboards_by_user(self, tenant_id: int, user_id: int, skip: int = 0, limit: int = 100) -> List[AnalyticsDashboard]:
        """Gets all dashboards for a specific user within a tenant."""
        return self.db.query(AnalyticsDashboard).filter(
            AnalyticsDashboard.tenant_id == tenant_id,
            AnalyticsDashboard.user_id == user_id
        ).order_by(AnalyticsDashboard.name).offset(skip).limit(limit).all()

    def update_dashboard(self, dashboard_id: int, tenant_id: int, user_id: int, dashboard_update_data: analytics_schemas.DashboardUpdate) -> Optional[AnalyticsDashboard]:
        """Updates an existing dashboard's properties (name, description, tags, layout)."""
        db_dashboard = self.get_dashboard(dashboard_id, tenant_id, user_id)
        if not db_dashboard:
            return None

        update_data = dashboard_update_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if key == "layout" and value is not None: # Ensure layout items are dicts
                setattr(db_dashboard, key, [item.model_dump() if isinstance(item, BaseModel) else item for item in value])
            else:
                setattr(db_dashboard, key, value)

        setattr(db_dashboard, 'updated_at', datetime.utcnow())  # type: ignore
        self.db.commit()
        self.db.refresh(db_dashboard)
        return db_dashboard

    def update_dashboard_layout(self, dashboard_id: int, tenant_id: int, user_id: int, layout_data: List[analytics_schemas.LayoutItem]) -> Optional[AnalyticsDashboard]:
        """Updates only the layout of a dashboard."""
        db_dashboard = self.get_dashboard(dashboard_id, tenant_id, user_id)
        if not db_dashboard:
            return None

        # Validate widget_config_ids in layout_data belong to this dashboard
        existing_widget_ids = {widget.id for widget in db_dashboard.widgets}
        for item in layout_data:
            if item.widget_config_id not in existing_widget_ids:
                raise ValueError(f"Widget with config_id {item.widget_config_id} not found in dashboard {dashboard_id}.")

        setattr(db_dashboard, 'layout', [item.model_dump() for item in layout_data])  # type: ignore
        setattr(db_dashboard, 'updated_at', datetime.utcnow())  # type: ignore
        self.db.commit()
        self.db.refresh(db_dashboard)
        return db_dashboard


    def delete_dashboard(self, dashboard_id: int, tenant_id: int, user_id: int) -> bool:
        """Deletes a dashboard and its associated widgets."""
        db_dashboard = self.get_dashboard(dashboard_id, tenant_id, user_id)
        if not db_dashboard:
            return False

        self.db.delete(db_dashboard) # Cascade should delete widgets
        self.db.commit()
        return True

    def add_widget_to_dashboard(self, dashboard_id: int, tenant_id: int, user_id: int, widget_data: analytics_schemas.WidgetConfigCreate) -> Optional[DashboardWidgetConfig]:
        """Adds a new widget configuration to a dashboard."""
        db_dashboard = self.get_dashboard(dashboard_id, tenant_id, user_id)
        if not db_dashboard:
            # Or raise HTTPException if called from router directly
            return None

        db_widget = DashboardWidgetConfig()
        setattr(db_widget, 'dashboard_id', db_dashboard.id)
        setattr(db_widget, 'tenant_id', tenant_id) # From dashboard's tenant
        setattr(db_widget, 'widget_type', widget_data.widget_type)
        setattr(db_widget, 'title', widget_data.title)
        setattr(db_widget, 'data_source_config', widget_data.data_source_config.model_dump())
        setattr(db_widget, 'display_options', widget_data.display_options)
        self.db.add(db_widget)

        # Add to dashboard's layout with default position if not specified elsewhere
        # This assumes client will call update_dashboard_layout separately or dashboard handles new widget placement.
        # For simplicity, new widgets might need explicit placement via update_dashboard_layout.
        # Or, we can try a default placement:
        self.db.flush() # to get db_widget.id

        new_layout_item = analytics_schemas.LayoutItem()
        setattr(new_layout_item, 'widget_config_id', db_widget.id)
        setattr(new_layout_item, 'x', 0)
        setattr(new_layout_item, 'y', 99)
        setattr(new_layout_item, 'w', 3)
        setattr(new_layout_item, 'h', 2) # Default pos (e.g., bottom)
        if getattr(db_dashboard, 'layout', None) is None:
            setattr(db_dashboard, 'layout', [])  # type: ignore # Ensure layout is a list
        db_dashboard.layout.append(new_layout_item.model_dump())
        setattr(db_dashboard, 'updated_at', datetime.utcnow())  # type: ignore

        self.db.commit()
        self.db.refresh(db_widget)
        self.db.refresh(db_dashboard) # Refresh dashboard to reflect layout change
        return db_widget

    def get_widget_config(self, widget_id: int, tenant_id: int) -> Optional[DashboardWidgetConfig]:
        """Helper to get a widget config, ensuring tenant match."""
        return self.db.query(DashboardWidgetConfig).filter(
            DashboardWidgetConfig.id == widget_id,
            DashboardWidgetConfig.tenant_id == tenant_id
        ).first()

    def update_widget_on_dashboard(self, widget_id: int, tenant_id: int, user_id: int, widget_update_data: analytics_schemas.WidgetConfigUpdate) -> Optional[DashboardWidgetConfig]:
        """Updates an existing widget configuration."""
        # user_id check implies checking dashboard ownership first
        db_widget = self.get_widget_config(widget_id, tenant_id)
        if not db_widget:
            return None

        # Check if user owns the dashboard this widget belongs to
        dashboard_owner_check = self.get_dashboard(getattr(db_widget, 'dashboard_id', 0), tenant_id, user_id)  # type: ignore
        if not dashboard_owner_check:
            return None # User does not own the parent dashboard

        update_data = widget_update_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if key == "data_source_config" and value is not None:
                 setattr(db_widget, key, value.model_dump() if isinstance(value, BaseModel) else value)
            else:
                setattr(db_widget, key, value)

        setattr(db_widget, 'updated_at', datetime.utcnow())  # type: ignore
        self.db.commit()
        self.db.refresh(db_widget)
        return db_widget

    def remove_widget_from_dashboard(self, widget_id: int, tenant_id: int, user_id: int) -> bool:
        """Removes a widget configuration from a dashboard."""
        db_widget = self.get_widget_config(widget_id, tenant_id)
        if not db_widget:
            return False

        # Check if user owns the dashboard this widget belongs to
        db_dashboard = self.get_dashboard(getattr(db_widget, 'dashboard_id', 0), tenant_id, user_id)  # type: ignore
        if not db_dashboard:
            return False # User does not own the parent dashboard

        # Remove from dashboard's layout
        if db_dashboard.layout:
            current_layout = getattr(db_dashboard, 'layout', [])
            setattr(db_dashboard, 'layout', [item for item in current_layout if item.get("widget_config_id") != widget_id])  # type: ignore
            setattr(db_dashboard, 'updated_at', datetime.utcnow())  # type: ignore

        self.db.delete(db_widget)
        self.db.commit()
        return True


def get_analytics_service(db: Session) -> AnalyticsService:
    """Get analytics service instance"""
    return AnalyticsService(db)