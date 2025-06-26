from fastapi import APIRouter, HTTPException, Body, Depends, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
import torch
import os
import numpy as np # For predict endpoint processing
import pandas as pd # For DataFrame operations
from typing import List, Dict, Any, Optional

# Import specific functions to avoid circular imports
from ..predictive import train_predictive_model as service_train_model
from ..predictive import load_model as service_load_model
from ..predictive import prepare_predictive_data

# Define model paths directly to avoid circular imports
MODEL_PATH_BASE = "models/predictive_model"
from ..auth.auth_dependencies import PermissionChecker, get_current_active_user
from ..models.user import User as SQLAlchemyUser # For current_user type hint
from ..db import get_db # Import get_db from the shared db module
from ..models.activity import Activity
from ..models.activity_features import ActivityEnrichedFeature

router = APIRouter(
    tags=["Predictive Modeling"]
)

# Define constants for feature columns
NUMERICAL_FEATURES = ["hour_of_day", "day_of_week", "is_context_switch_numeric"]
CATEGORICAL_FEATURES = ["activity_type", "app_category", "project_context", "website_category"]

# --- Schemas ---
class TrainRequest(BaseModel):
    user_id: int # Specify for which user to train
    num_epochs: int = 10
    learning_rate: float = 0.001
    sequence_length: int = 5
    hidden_size: int = 128
    num_layers: int = 2
    # model_path_base: str = "models/predictive_model" # Base path for model artifacts

class ActivityInput(BaseModel):
    """Represents a single activity event for prediction input."""
    activity_type: str
    # Timestamp is not strictly needed if sequence order is preserved by list and features are pre-generated
    # but might be useful if fetching features on the fly requires it.
    # For now, assuming features are derived from activity_type and its context.
    # Enriched features can be passed if available, or fetched by the endpoint.
    # If not passed, the endpoint will need to fetch/generate them.
    # Let's assume for now the endpoint expects basic activity_type and will fetch/generate features.
    # details: Optional[Dict[str, Any]] = None # If needed to generate features for prediction

class PredictRequest(BaseModel):
    user_id: int # For whom to make prediction / whose model to use
    # Input sequence of basic activities (e.g., list of activity_type strings or more detailed objects)
    # The length of this list should ideally be `sequence_length` used during training.
    # For simplicity, let's assume it's a list of activity_type strings.
    # The API will need to convert these to full feature vectors.
    recent_activity_types: List[str]
    # model_path_base: str = "models/predictive_model" # Base path for model artifacts

class PredictResponse(BaseModel):
    predicted_next_activity_type: str
    confidence: Optional[float] = None # If model outputs probabilities

# --- Global/Configurable ---
# Path where models are saved. This should match what's used in predictive.py's train/save.
# It might be user-specific if models are per user.
# For now, let's make it a template that can include user_id.
DEFAULT_MODEL_PATH_TEMPLATE = "digame/app/models/user_{user_id}_predictive_model"

# --- Endpoints ---

@router.post("/train", 
             dependencies=[Depends(PermissionChecker("train_own_predictive_model"))]) # Placeholder permission
async def train_model_endpoint(
    request_body: TrainRequest, 
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Trains the predictive model for a user using their activities and enriched features.
    Requires 'train_own_predictive_model' permission.
    User can only train their own model.
    """
    if current_user.id != request_body.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to train model for this user.")

    model_path_base = DEFAULT_MODEL_PATH_TEMPLATE.format(user_id=request_body.user_id)
    # The .pth extension is typically added by save_model itself if model_path_base is a dir/name stub.
    # Let's ensure service_train_model handles this consistently.
    # If model_path_base is "path/to/model_name" (without .pth), save_model might append it.
    # If it's "path/to/model_name.pth", save_model should use it as is.
    # For consistency, let's assume `model_path_base` is the name without extension, and .pth is standard.
    
    try:
        # Create a DataFrame for training
        activities = db.query(Activity).filter(Activity.user_id == request_body.user_id).all()
        if not activities:
            raise HTTPException(status_code=404, detail=f"No activities found for user {request_body.user_id}")
            
        # Convert activities to DataFrame
        activities_data = []
        for activity in activities:
            activities_data.append({
                'user_id': activity.user_id,
                'timestamp': activity.timestamp,
                'activity_type': activity.activity_type,
            })
        
        df_train = pd.DataFrame(activities_data)
        
        trained_model = service_train_model(
            df_train=df_train,
            sequence_length=request_body.sequence_length,
            hidden_dim=request_body.hidden_size,
            num_layers=request_body.num_layers,
            epochs=request_body.num_epochs,
            learning_rate=request_body.learning_rate,
            model_path=model_path_base + ".pth" # Pass the full .pth path for clarity
        )
        if trained_model is None:
            raise HTTPException(status_code=500, detail="Model training failed or not enough data.")
        return {"message": f"Model training initiated/completed for user {request_body.user_id}. Artifacts at ~{model_path_base}"}
    except Exception as e:
        # Log e
        raise HTTPException(status_code=500, detail=f"Error during model training: {str(e)}")


@router.post("/predict", 
             response_model=PredictResponse,
             dependencies=[Depends(PermissionChecker("run_own_prediction"))]) # Placeholder permission
async def predict_endpoint(
    request_body: PredictRequest, 
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Predicts the next activity for a user based on a sequence of recent activities.
    Requires 'run_own_prediction' permission.
    User can only get predictions for themselves.
    """
    if current_user.id != request_body.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to make predictions for this user.")

    user_id = request_body.user_id
    model_path_base = DEFAULT_MODEL_PATH_TEMPLATE.format(user_id=user_id)
    
    # 1. Load model, encoders, scaler, and model parameters
    model, _, encoders, scaler, model_params = service_load_model(model_path_base=model_path_base)
    
    if model is None or encoders is None or scaler is None or model_params is None:
        raise HTTPException(status_code=404, detail=f"Model for user {user_id} not found or artifacts incomplete. Please train the model first.")

    sequence_length = model_params.get("sequence_length", 5) # Get from loaded params
    fitted_categories = model_params.get("fitted_categories", {})

    # 2. Ensure input sequence length matches model's expected sequence_length
    #    The API expects `recent_activity_types`. We need to convert this to a sequence of Activities
    #    and then fetch/generate their features. This is complex for an API.
    #    Simpler: assume `recent_activity_types` is the *exact* sequence of types for feature generation,
    #    and it must match `sequence_length`.
    
    # The current `prepare_predictive_data` expects actual Activity records from DB to build features.
    # This endpoint receives `activity_type` strings. This implies we either:
    #    a) Have a way to map these `activity_type` strings directly to feature vectors (if features are simple).
    #    b) Create temporary/mock Activity objects from these strings, then run them through a simplified
    #       feature engineering pipeline that doesn't require DB lookup for *these specific inputs*.
    #       This is tricky because features like app_category, project_context depend on details not present
    #       in just an activity_type string.
    #
    # Option C (Most Realistic for this setup):
    # The input `recent_activity_types` is used to fetch the *actual last N activities* from the DB,
    # then features are derived from those. This means the API input is more of a "trigger" than raw data.
    # This is not what the current `PredictRequest` implies.
    #
    # Option D (Compromise for this task, assuming input is sufficient to derive/mock features):
    # Create mock Activity objects from `recent_activity_types` and then run a simplified feature prep.
    # This is what `prepare_predictive_data` would need to support.
    # For now, `prepare_predictive_data` uses DB. We need a non-DB version for arbitrary sequences.
    #
    # Let's adjust `prepare_predictive_data` or create a variant:
    # `prepare_input_sequence_for_prediction(input_types: List[str], encoders, scaler, model_params)`
    # This is a major change to `prepare_predictive_data` not covered by Step 1.
    #
    # For this subtask, let's assume the API needs to construct a DataFrame similar to what
    # `prepare_predictive_data` uses, then process it with loaded encoders/scaler.

    if len(request_body.recent_activity_types) != sequence_length:
        raise HTTPException(
            status_code=400,
            detail=f"Input sequence length must be {sequence_length}."
        )

    # Create a DataFrame from the input activity types.
    # This is a simplified representation. We need to fetch actual activities or mock them
    # to get consistent features (app_category, project_context, etc.).
    # For now, this will be very basic and likely not match training data accurately.
    
    # This part needs careful thought: How to get enriched features for arbitrary input types?
    # The model was trained on features from Activity + ActivityEnrichedFeature.
    # Simplification: Assume for prediction, we only have activity_type and time features.
    # This would require the model to be trained only on those, or this prediction will be inaccurate.
    #
    # Correct approach: Fetch last `sequence_length` activities from DB for the user,
    # then use `prepare_predictive_data` (or a variant) on them.
    # This means `recent_activity_types` in request is more of a "signal" or not used.
    # Let's assume we need to fetch user's latest activities to form the input sequence.

    # Fetch user's latest `sequence_length` activities from DB
    latest_activities_with_features = (
        db.query(Activity, ActivityEnrichedFeature)
        .outerjoin(ActivityEnrichedFeature, Activity.id == ActivityEnrichedFeature.activity_id)
        .filter(Activity.user_id == user_id)
        .order_by(Activity.timestamp.desc()) # Get latest first
        .limit(sequence_length)
        .all()
    )
    
    if len(latest_activities_with_features) < sequence_length:
        raise HTTPException(status_code=400, detail=f"Not enough activity data for user {user_id} to form a sequence of length {sequence_length}.")

    # Results are latest first, reverse to get chronological order for sequence
    latest_activities_with_features.reverse() 
    
    activities_records = []
    for activity, feature in latest_activities_with_features:
        activities_records.append({
            "activity_type": activity.activity_type, "timestamp": activity.timestamp,
            "app_category": feature.app_category if feature else "Missing_AppCategory",
            "project_context": feature.project_context if feature else "Missing_ProjectContext",
            "website_category": feature.website_category if feature else "Missing_WebsiteCategory",
            "is_context_switch": feature.is_context_switch if feature else False,
        })
    
    input_df = pd.DataFrame(activities_records)
    input_df["hour_of_day"] = input_df["timestamp"].dt.hour
    input_df["day_of_week"] = input_df["timestamp"].dt.dayofweek
    input_df["is_context_switch_numeric"] = input_df["is_context_switch"].astype(int)

    for col in CATEGORICAL_FEATURES: # CATEGORICAL_FEATURES defined in predictive.py
        input_df[col] = input_df[col].astype(str).apply(
            lambda x: fitted_categories[col].index(x) if x in fitted_categories[col] else len(fitted_categories[col])
        )
    
    input_df[NUMERICAL_FEATURES] = scaler.transform(input_df[NUMERICAL_FEATURES]) # NUMERICAL_FEATURES from predictive.py
    
    feature_columns = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
    processed_input_features = input_df[feature_columns].values
    
    sequence_tensor = torch.tensor(np.array([processed_input_features]), dtype=torch.float32) # Batch size of 1

    # 3. Make prediction
    model.eval() # Set model to evaluation mode
    with torch.no_grad():
        try:
            output_logits = model(sequence_tensor)
            # output_probs = torch.softmax(output_logits, dim=1) # If confidence is needed
            # confidence, predicted_idx = torch.max(output_probs, dim=1)
            predicted_idx = torch.argmax(output_logits, dim=1).item()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error during prediction: {str(e)}"
            )

    # 4. Decode prediction
    # The `activity_type` encoder is needed here.
    activity_type_encoder = encoders.get('activity_encoder')  # Changed from 'activity_type' to match predictive.py
    if not activity_type_encoder:
        raise HTTPException(status_code=500, detail="Activity type encoder not found with the model.")

    predicted_activity_type_str = "unknown_activity_type"
    try:
        if hasattr(activity_type_encoder, 'classes_') and predicted_idx < len(activity_type_encoder.classes_):
            predicted_activity_type_str = activity_type_encoder.classes_[predicted_idx]
        elif isinstance(activity_type_encoder, dict) and str(predicted_idx) in activity_type_encoder:
            predicted_activity_type_str = activity_type_encoder[str(predicted_idx)]
        else:
            print(f"Warning: Predicted index {predicted_idx} is out of bounds for known activity types.")
    except Exception as e:
        print(f"Error decoding prediction: {str(e)}")

    return PredictResponse(
        predicted_next_activity_type=predicted_activity_type_str
        # confidence=confidence.item() if confidence is not None else None
    )
