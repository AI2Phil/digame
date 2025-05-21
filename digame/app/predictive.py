import torch
import torch.nn as nn
import torch.optim as optim
import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from typing import List, Tuple, Dict, Any, Optional
import json # For saving/loading encoders and params

# Assuming Activity and ActivityEnrichedFeature models are accessible
from .models.activity import Activity
from .models.activity_features import ActivityEnrichedFeature
from sqlalchemy.orm import Session, joinedload

# --- Constants ---
# Define file paths for encoders and model parameters, relative to where model.pth is saved.
# These will be saved in the same directory as the model.
ENCODER_FILE_PATH_TEMPLATE = "{model_dir}/encoders.json"
MODEL_PARAMS_FILE_PATH_TEMPLATE = "{model_dir}/model_params.json"
DEFAULT_MODEL_DIR = "digame/app/models" # Default directory for predictive models

# --- Data Preparation ---

# Define categorical and numerical features to be used
CATEGORICAL_FEATURES = ['activity_type', 'app_category', 'project_context', 'website_category']
NUMERICAL_FEATURES = ['hour_of_day', 'day_of_week', 'is_context_switch_numeric'] # is_context_switch will be converted to numeric

def prepare_predictive_data(
    db: Session,
    user_id: int,
    sequence_length: int = 5,
    fit_encoders: bool = False,
    encoders: Optional[Dict[str, LabelEncoder]] = None,
    scaler: Optional[StandardScaler] = None,
    fitted_categories: Optional[Dict[str, List[Any]]] = None
) -> Tuple[Optional[torch.Tensor], Optional[torch.Tensor], Optional[Dict[str, LabelEncoder]], Optional[StandardScaler], Optional[Dict[str, List[Any]]], Optional[int]]:
    """
    Prepares sequential data for LSTM model using Activity and ActivityEnrichedFeature.
    
    Args:
        db: SQLAlchemy session.
        user_id: ID of the user.
        sequence_length: Length of input sequences.
        fit_encoders: If True, fits new LabelEncoders and StandardScaler. Otherwise, uses provided ones.
        encoders: Pre-fitted LabelEncoders (if fit_encoders=False).
        scaler: Pre-fitted StandardScaler (if fit_encoders=False).
        fitted_categories: Categories for each LabelEncoder (used if fit_encoders=False to handle unseen labels).

    Returns:
        A tuple: (sequences_tensor, targets_tensor, fitted_encoders, fitted_scaler, all_fitted_categories, num_features)
        Returns (None, None, None, None, None, None) if data is insufficient.
    """
    query = (
        db.query(Activity, ActivityEnrichedFeature)
        .outerjoin(ActivityEnrichedFeature, Activity.id == ActivityEnrichedFeature.activity_id)
        .filter(Activity.user_id == user_id)
        .order_by(Activity.timestamp.asc()) # Important for sequence generation
    )
    results = query.all()

    if len(results) < sequence_length + 1: # Need enough data for at least one sequence and target
        return None, None, None, None, None, None

    activities_data = []
    for activity, feature in results:
        record = {
            "activity_id": activity.id,
            "activity_type": activity.activity_type,
            "timestamp": activity.timestamp,
            "app_category": feature.app_category if feature else "Missing_AppCategory",
            "project_context": feature.project_context if feature else "Missing_ProjectContext",
            "website_category": feature.website_category if feature else "Missing_WebsiteCategory",
            "is_context_switch": feature.is_context_switch if feature else False,
        }
        activities_data.append(record)
    
    raw_df = pd.DataFrame(activities_data)
    if raw_df.empty:
        return None, None, None, None, None, None

    # Feature Engineering
    raw_df["hour_of_day"] = raw_df["timestamp"].dt.hour
    raw_df["day_of_week"] = raw_df["timestamp"].dt.dayofweek
    raw_df["is_context_switch_numeric"] = raw_df["is_context_switch"].astype(int)

    # Initialize or use provided encoders/scaler
    if fit_encoders:
        encoders = {col: LabelEncoder() for col in CATEGORICAL_FEATURES}
        scaler = StandardScaler()
        all_fitted_categories = {} # To store categories for each encoder
    elif encoders is None or scaler is None or fitted_categories is None:
        # This case should ideally not happen if fit_encoders=False.
        # Raise error or handle by attempting to fit, though that's not the intent of fit_encoders=False.
        raise ValueError("Encoders, scaler, and fitted_categories must be provided if fit_encoders is False.")

    # Apply Label Encoding for categorical features
    for col in CATEGORICAL_FEATURES:
        if fit_encoders:
            raw_df[col] = encoders[col].fit_transform(raw_df[col].astype(str)) # Ensure string type
            all_fitted_categories[col] = list(encoders[col].classes_)
        else:
            # Handle unseen labels during transform: map to a special "unknown" index or use a default.
            # For simplicity, map unseen to a new category index (len(classes_)).
            # More robust: Add "Unknown" to classes_ during fit if possible, or handle missing keys.
            current_categories = fitted_categories.get(col, [])
            raw_df[col] = raw_df[col].astype(str).apply(
                lambda x: current_categories.index(x) if x in current_categories else len(current_categories) 
            )
            # Note: If len(current_categories) is used for unseen, the model's embedding layer needs to account for this extra index.

    # Target variable: next activity_type (encoded)
    # We use the 'activity_type' column *after* it has been label encoded by the loop above.
    # This means the target is also an integer.
    raw_df['target_activity_type_encoded'] = raw_df['activity_type'].shift(-1)
    raw_df.dropna(subset=['target_activity_type_encoded'], inplace=True) # Remove last row where target is NaN
    
    if raw_df.empty: # After removing NaN target, check if still valid
        return None, None, encoders, scaler, fitted_categories if not fit_encoders else all_fitted_categories, None


    # Select features for LSTM input
    feature_columns = NUMERICAL_FEATURES + CATEGORICAL_FEATURES 
    features_df = raw_df[feature_columns]

    # Normalize numerical features
    if fit_encoders:
        features_df[NUMERICAL_FEATURES] = scaler.fit_transform(features_df[NUMERICAL_FEATURES])
    else:
        features_df[NUMERICAL_FEATURES] = scaler.transform(features_df[NUMERICAL_FEATURES])
    
    num_features = features_df.shape[1]

    # Create sequences
    sequences, targets = [], []
    for i in range(len(features_df) - sequence_length):
        sequences.append(features_df.iloc[i:i+sequence_length].values)
        # Target is the encoded 'activity_type' of the activity immediately following the sequence
        targets.append(raw_df['target_activity_type_encoded'].iloc[i+sequence_length-1]) # Target corresponds to last element of sequence's next step

    if not sequences:
        return None, None, encoders, scaler, fitted_categories if not fit_encoders else all_fitted_categories, num_features

    sequences_tensor = torch.tensor(np.array(sequences), dtype=torch.float32)
    targets_tensor = torch.tensor(np.array(targets), dtype=torch.long) # Assuming classification target

    return sequences_tensor, targets_tensor, encoders, scaler, fitted_categories if not fit_encoders else all_fitted_categories, num_features


# --- Model Definition ---
class PredictiveModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, output_size, num_embeddings_map: Optional[Dict[str, int]] = None):
        super(PredictiveModel, self).__init__()
        self.input_size = input_size # This will be the total number of features after encoding and scaling
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.output_size = output_size # Number of unique activity_types to predict

        # If using embeddings for categorical features (more advanced, not implemented in current data prep)
        # self.num_embeddings_map = num_embeddings_map if num_embeddings_map else {}
        # self.embeddings = nn.ModuleDict()
        # current_input_size = 0
        # for feature_name, num_categories in self.num_embeddings_map.items():
        #     embedding_dim = max(1, num_categories // 2) # Example heuristic
        #     self.embeddings[feature_name] = nn.Embedding(num_categories, embedding_dim)
        #     current_input_size += embedding_dim
        # current_input_size += (input_size - len(self.num_embeddings_map)) # Add numerical features count

        self.lstm = nn.LSTM(self.input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size) # Output layer predicts next activity_type

    def forward(self, x):
        # x shape: (batch_size, sequence_length, input_size)
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        out, _ = self.lstm(x, (h0, c0)) # out shape: (batch_size, sequence_length, hidden_size)
        out = self.fc(out[:, -1, :]) # Use output of last time step for prediction, shape: (batch_size, output_size)
        return out

# --- Training Logic ---
def train_predictive_model(
    db: Session, # Added db session
    user_id: int, # Added user_id
    model_path: str, # Path to save the final model and related artifacts
    num_epochs: int = 10, 
    learning_rate: float = 0.001,
    sequence_length: int = 5,
    hidden_size: int = 128, # Added hyperparameter
    num_layers: int = 2     # Added hyperparameter
):
    model_dir = os.path.dirname(model_path)
    os.makedirs(model_dir, exist_ok=True) # Ensure model directory exists

    # Prepare data
    sequences, targets, encoders, scaler, fitted_categories, num_features = prepare_predictive_data(
        db, user_id, sequence_length=sequence_length, fit_encoders=True
    )

    if sequences is None or targets is None or num_features is None:
        print(f"Not enough data to train model for user {user_id}.")
        return None # Or raise an error

    # Determine output_size (number of unique activity_types)
    # This should come from the label encoder for 'activity_type'
    output_size = len(encoders['activity_type'].classes_) if 'activity_type' in encoders else 0
    if output_size == 0:
        print("Error: Could not determine output size (number of activity types).")
        return None

    # Instantiate model
    model = PredictiveModel(input_size=num_features, hidden_size=hidden_size, num_layers=num_layers, output_size=output_size)
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    criterion = nn.CrossEntropyLoss() # Suitable for multi-class classification (predicting next activity_type)

    # Create DataLoader
    dataset = torch.utils.data.TensorDataset(sequences, targets)
    train_loader = torch.utils.data.DataLoader(dataset, batch_size=32, shuffle=True)

    print(f"Starting training for {num_epochs} epochs... Input features: {num_features}, Output classes: {output_size}")
    model.train()
    for epoch in range(num_epochs):
        for batch_idx, (data_batch, target_batch) in enumerate(train_loader):
            optimizer.zero_grad()
            output = model(data_batch)
            loss = criterion(output, target_batch)
            loss.backward()
            optimizer.step()
            if batch_idx % 10 == 0: # Log every 10 batches
                print(f"Epoch {epoch+1}/{num_epochs}, Batch {batch_idx}/{len(train_loader)}, Loss: {loss.item()}")
    print("Training complete.")

    # Save model, encoders, scaler, and model parameters
    model_params_to_save = {
        "input_size": num_features,
        "hidden_size": hidden_size,
        "num_layers": num_layers,
        "output_size": output_size,
        "sequence_length": sequence_length,
        "fitted_categories": fitted_categories # Save categories for each label encoder
    }
    save_model(model, optimizer, encoders, scaler, model_params_to_save, model_path)
    
    return model # Return trained model

# --- Model Saving/Loading ---
def save_model(
    model: PredictiveModel, 
    optimizer: optim.Optimizer, 
    encoders: Dict[str, LabelEncoder], 
    scaler: StandardScaler,
    model_params: Dict[str, Any],
    file_path: str = "models/predictive_model.pth" # Path to the .pth file
):
    model_dir = os.path.dirname(file_path)
    if not model_dir: # If file_path is just a filename, use default model dir
        model_dir = DEFAULT_MODEL_DIR
    os.makedirs(model_dir, exist_ok=True)
    
    actual_model_path = os.path.join(model_dir, os.path.basename(file_path))
    encoder_file = ENCODER_FILE_PATH_TEMPLATE.format(model_dir=model_dir)
    model_params_file = MODEL_PARAMS_FILE_PATH_TEMPLATE.format(model_dir=model_dir)

    # Save model state
    torch.save({
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
    }, actual_model_path)

    # Save encoders (their classes_) and scaler (mean_, scale_)
    # LabelEncoder stores classes in `classes_` (a numpy array)
    encoders_serializable = {key: list(le.classes_) for key, le in encoders.items()}
    scaler_params = {
        'mean_': scaler.mean_.tolist() if scaler.mean_ is not None else None,
        'scale_': scaler.scale_.tolist() if scaler.scale_ is not None else None,
    }
    with open(encoder_file, 'w') as f:
        json.dump({'encoders': encoders_serializable, 'scaler': scaler_params}, f)

    # Save model parameters (input_size, output_size, etc.)
    with open(model_params_file, 'w') as f:
        json.dump(model_params, f)
        
    print(f"Model, encoders, and params saved to directory: {model_dir}")

def load_model(
    model_path_base: str = "models/predictive_model" # Base path, e.g., "models/user_1_model" (no .pth)
                                                      # Or full path to .pth file, then derive dir
) -> Tuple[Optional[PredictiveModel], Optional[optim.Optimizer], Optional[Dict[str, LabelEncoder]], Optional[StandardScaler], Optional[Dict[str, Any]]]:
    
    if model_path_base.endswith(".pth"):
        actual_model_path = model_path_base
        model_dir = os.path.dirname(model_path_base)
    else: # Assume it's a base name and default .pth is used
        model_dir = os.path.dirname(model_path_base) if os.path.dirname(model_path_base) else DEFAULT_MODEL_DIR
        actual_model_path = os.path.join(model_dir, os.path.basename(model_path_base) + ".pth")
        if not os.path.exists(actual_model_path) and not model_path_base.startswith(DEFAULT_MODEL_DIR):
             # Try with default dir if path was just a name like "predictive_model"
            actual_model_path = os.path.join(DEFAULT_MODEL_DIR, os.path.basename(model_path_base) + ".pth")


    encoder_file = ENCODER_FILE_PATH_TEMPLATE.format(model_dir=model_dir)
    model_params_file = MODEL_PARAMS_FILE_PATH_TEMPLATE.format(model_dir=model_dir)

    if not os.path.exists(actual_model_path) or not os.path.exists(encoder_file) or not os.path.exists(model_params_file):
        print(f"Error: Model artifacts not found in directory {model_dir}. Searched for {actual_model_path}, {encoder_file}, {model_params_file}")
        return None, None, None, None, None

    # Load model parameters first
    with open(model_params_file, 'r') as f:
        model_params = json.load(f)

    # Instantiate model and optimizer
    model = PredictiveModel(
        input_size=model_params['input_size'],
        hidden_size=model_params['hidden_size'],
        num_layers=model_params['num_layers'],
        output_size=model_params['output_size']
    )
    optimizer = optim.Adam(model.parameters()) # LR is not saved in state_dict, set again if needed

    # Load model and optimizer state
    checkpoint = torch.load(actual_model_path)
    model.load_state_dict(checkpoint['model_state_dict'])
    if 'optimizer_state_dict' in checkpoint: # Make it optional if optimizer state not always needed
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
    
    # Load encoders and scaler
    with open(encoder_file, 'r') as f:
        encoder_scaler_data = json.load(f)
    
    loaded_encoders = {}
    for key, classes_list in encoder_scaler_data['encoders'].items():
        le = LabelEncoder()
        le.classes_ = np.array(classes_list)
        loaded_encoders[key] = le
        
    loaded_scaler = StandardScaler()
    scaler_params = encoder_scaler_data['scaler']
    loaded_scaler.mean_ = np.array(scaler_params['mean_']) if scaler_params['mean_'] is not None else None
    loaded_scaler.scale_ = np.array(scaler_params['scale_']) if scaler_params['scale_'] is not None else None
    
    print(f"Model, encoders, and params loaded from directory: {model_dir}")
    return model, optimizer, loaded_encoders, loaded_scaler, model_params
