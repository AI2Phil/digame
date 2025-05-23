import logging
import os
import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from torch.utils.data import DataLoader, TensorDataset

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Default directory for saving models if only a filename is provided
DEFAULT_MODEL_DIR = "digame/app/models"
os.makedirs(DEFAULT_MODEL_DIR, exist_ok=True)

# Default path for the primary model, used by core functions.
PRIMARY_MODEL_PATH = "models/predictive_model.pth"

# --- Model Definition ---
class PredictiveModel(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim, num_layers=1, dropout_prob=0.2):
        super(PredictiveModel, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True, dropout=dropout_prob if num_layers > 1 else 0)
        self.fc = nn.Linear(hidden_dim, output_dim)
        self.dropout = nn.Dropout(dropout_prob)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).to(x.device)
        out, _ = self.lstm(x, (h0, c0))
        out = self.dropout(out[:, -1, :])
        out = self.fc(out)
        return out

# --- Data Preparation ---
def prepare_sequences(df, sequence_length=10):
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(by=['user_id', 'timestamp'])
    all_features = []
    all_targets = []
    activity_encoder = LabelEncoder()
    df['activity_type_encoded'] = activity_encoder.fit_transform(df['activity_type'])
    user_encoder = LabelEncoder()

    if 'cluster_label' not in df.columns:
        logger.warning("Missing 'cluster_label' in data, using 'activity_type_encoded' as target.")
        df['cluster_label'] = df['activity_type_encoded'] 
    if not pd.api.types.is_numeric_dtype(df['cluster_label']):
        cluster_encoder = LabelEncoder()
        df['cluster_label'] = cluster_encoder.fit_transform(df['cluster_label'])
    else:
        cluster_encoder = None

    df['hour_of_day'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    features_to_scale = ['hour_of_day'] 
    scaler = StandardScaler()
    df[features_to_scale] = scaler.fit_transform(df[features_to_scale])

    for user_id, group in df.groupby('user_id'):
        if len(group) < sequence_length + 1:
            continue
        user_features = group[['activity_type_encoded', 'hour_of_day']].values
        user_targets = group['cluster_label'].values 
        for i in range(len(user_features) - sequence_length):
            all_features.append(user_features[i:i + sequence_length])
            all_targets.append(user_targets[i + sequence_length])
            
    if not all_features: 
        logger.warning("No sequences were generated. Check sequence_length and data availability.")
        return np.empty((0, sequence_length, 2)), np.empty((0,)), {'activity_encoder': activity_encoder, 'user_encoder': user_encoder, 'cluster_encoder': cluster_encoder, 'scaler': scaler}
    return np.array(all_features), np.array(all_targets), {'activity_encoder': activity_encoder, 'user_encoder': user_encoder, 'cluster_encoder': cluster_encoder, 'scaler': scaler}

# --- Model Training ---
def train_predictive_model(df_train, sequence_length=10, hidden_dim=50, num_layers=2, output_dim=None,
                           epochs=20, batch_size=32, learning_rate=0.001, dropout_prob=0.2, model_path=PRIMARY_MODEL_PATH):
    X_train, y_train, encoders_scalers = prepare_sequences(df_train, sequence_length)
    if X_train.size == 0:
        logger.error("Training data is empty after sequence preparation. Aborting training.")
        return None, None
    input_dim = X_train.shape[2] 
    if output_dim is None:
        output_dim = len(np.unique(y_train))
        if output_dim <= 1 and len(y_train) > 0: 
             logger.warning(f"Target variable has only {output_dim} unique value(s). Model might not learn effectively.")
             output_dim = max(2, output_dim) 
    X_train_tensor = torch.tensor(X_train, dtype=torch.float32)
    y_train_tensor = torch.tensor(y_train, dtype=torch.long) 
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    model = PredictiveModel(input_dim, hidden_dim, output_dim, num_layers, dropout_prob)
    criterion = nn.CrossEntropyLoss() 
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    logger.info(f"Starting training: epochs={epochs}, batch_size={batch_size}, lr={learning_rate}")
    logger.info(f"Model parameters: input_dim={input_dim}, hidden_dim={hidden_dim}, output_dim={output_dim}, num_layers={num_layers}")
    for epoch in range(epochs):
        model.train()
        epoch_loss = 0
        for batch_X, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
        avg_epoch_loss = epoch_loss / len(train_loader)
        logger.info(f"Epoch [{epoch+1}/{epochs}], Loss: {avg_epoch_loss:.4f}")
    model_params_to_save = {
        'input_dim': input_dim, 'hidden_dim': hidden_dim, 'output_dim': output_dim,
        'num_layers': num_layers, 'sequence_length': sequence_length, 'dropout_prob': dropout_prob
    }
    save_model(model, optimizer, encoders_scalers, model_params_to_save, model_path)
    logger.info("Training complete.")
    return model, encoders_scalers

# --- Model Saving ---
def save_model(model, optimizer, encoders_scalers, model_params, file_path=PRIMARY_MODEL_PATH):
    # If a plain filename (no directory part) is given, save it into DEFAULT_MODEL_DIR.
    # Otherwise, use the provided path as is (e.g., "models/predictive_model.pth").
    if os.path.dirname(file_path) == "" and DEFAULT_MODEL_DIR:
        file_path = os.path.join(DEFAULT_MODEL_DIR, file_path)
    
    model_dir = os.path.dirname(file_path)
    os.makedirs(model_dir, exist_ok=True)
    state = {
        'model_state_dict': model.state_dict(), 'optimizer_state_dict': optimizer.state_dict(),
        'model_params': model_params,
    }
    torch.save(state, file_path)
    scaler = encoders_scalers.pop('scaler', None) 
    joblib.dump(encoders_scalers.get('activity_encoder'), os.path.join(model_dir, 'activity_encoder.joblib'))
    if encoders_scalers.get('user_encoder'):
        joblib.dump(encoders_scalers.get('user_encoder'), os.path.join(model_dir, 'user_encoder.joblib'))
    if encoders_scalers.get('cluster_encoder'):
        joblib.dump(encoders_scalers.get('cluster_encoder'), os.path.join(model_dir, 'cluster_encoder.joblib'))
    if scaler:
        joblib.dump(scaler, os.path.join(model_dir, 'scaler.joblib'))
    logger.info(f"Model and preprocessors saved to {model_dir}")

# --- Model Loading ---
def load_model_components(model_path=PRIMARY_MODEL_PATH):
    # Resolve path: if plain filename, use DEFAULT_MODEL_DIR. Otherwise, use as is.
    if os.path.dirname(model_path) == "" and DEFAULT_MODEL_DIR:
        model_path = os.path.join(DEFAULT_MODEL_DIR, model_path)

    if not os.path.exists(model_path):
        logger.error(f"Model file not found at {model_path}")
        return None, None, None, None, None
    model_dir = os.path.dirname(model_path)
    try:
        state = torch.load(model_path) 
        model_params = state['model_params']
        loaded_model = PredictiveModel( 
            input_dim=model_params['input_dim'], hidden_dim=model_params['hidden_dim'],
            output_dim=model_params['output_dim'], num_layers=model_params['num_layers'],
            dropout_prob=model_params.get('dropout_prob', 0.2)
        )
        loaded_model.load_state_dict(state['model_state_dict'])
        optimizer = optim.Adam(loaded_model.parameters()) 
        optimizer.load_state_dict(state['optimizer_state_dict'])
        activity_encoder = joblib.load(os.path.join(model_dir, 'activity_encoder.joblib')) if os.path.exists(os.path.join(model_dir, 'activity_encoder.joblib')) else None
        user_encoder = joblib.load(os.path.join(model_dir, 'user_encoder.joblib')) if os.path.exists(os.path.join(model_dir, 'user_encoder.joblib')) else None
        cluster_encoder = joblib.load(os.path.join(model_dir, 'cluster_encoder.joblib')) if os.path.exists(os.path.join(model_dir, 'cluster_encoder.joblib')) else None
        scaler = joblib.load(os.path.join(model_dir, 'scaler.joblib')) if os.path.exists(os.path.join(model_dir, 'scaler.joblib')) else None
        encoders = {'activity_encoder': activity_encoder, 'user_encoder': user_encoder, 'cluster_encoder': cluster_encoder}
        logger.info(f"Model and preprocessors loaded from {model_dir}")
        return loaded_model, optimizer, encoders, scaler, model_params
    except Exception as e:
        logger.error(f"Error loading model from {model_path}: {e}")
        return None, None, None, None, None

# --- Prediction/Inference ---
_cached_model_assets = None

# Wrapper function for compatibility with router imports
def load_model(model_path_base=PRIMARY_MODEL_PATH):
    """
    Wrapper function to maintain compatibility with router imports.
    Loads a model and its associated components from the specified path.
    
    Args:
        model_path_base: Base path for the model file (without .pth extension)
        
    Returns:
        Tuple of (model, optimizer, encoders, scaler, model_params)
    """
    # Ensure .pth extension is added if not present
    if not model_path_base.endswith('.pth'):
        model_path = model_path_base + '.pth'
    else:
        model_path = model_path_base
        
    return load_model_components(model_path)

def get_loaded_model_assets(model_path=PRIMARY_MODEL_PATH):
    global _cached_model_assets
    
    # Determine the effective path (resolving via DEFAULT_MODEL_DIR if path is a plain filename)
    effective_model_path = model_path
    if os.path.dirname(effective_model_path) == "" and DEFAULT_MODEL_DIR:
        effective_model_path = os.path.join(DEFAULT_MODEL_DIR, effective_model_path)

    # Cache validation: if model path changed or cache empty
    if _cached_model_assets is None or _cached_model_assets.get("model_path") != effective_model_path:
        logger.info(f"Loading model assets from: {effective_model_path}")
        loaded_model, _, loaded_encoders, loaded_scaler, model_params = load_model_components(effective_model_path)
        if loaded_model and loaded_encoders and loaded_scaler and model_params: # Ensure model_params is also checked
            loaded_model.eval()
            _cached_model_assets = {
                "model": loaded_model, "encoders": loaded_encoders, "scaler": loaded_scaler,
                "sequence_length": model_params.get('sequence_length', 10), # Correctly from model_params
                "model_path": effective_model_path # Store resolved path for cache validation
            }
        else:
            logger.error(f"Failed to load model assets from {effective_model_path}. Predictions cannot be made.")
            _cached_model_assets = None # Ensure cache is cleared on failure
            return None # Explicitly return None on failure
    return _cached_model_assets

# Function to prepare data for predictive modeling
def prepare_predictive_data(df, sequence_length=10):
    """
    Prepares data for predictive modeling by creating sequences from activity data.
    This is a simplified version of prepare_sequences that focuses on prediction preparation.
    
    Args:
        df: DataFrame containing activity data
        sequence_length: Length of sequences to create
        
    Returns:
        Processed DataFrame ready for prediction
    """
    # This is a simplified implementation - in a real system, this would do more processing
    processed_df = df.copy()
    
    # Ensure timestamp is datetime
    if 'timestamp' in processed_df.columns:
        processed_df['timestamp'] = pd.to_datetime(processed_df['timestamp'])
    
    # Add time-based features
    if 'timestamp' in processed_df.columns:
        processed_df['hour_of_day'] = processed_df['timestamp'].dt.hour
        processed_df['day_of_week'] = processed_df['timestamp'].dt.dayofweek
    
    return processed_df

def predict_next_action(user_id, current_sequence_df, model_path=PRIMARY_MODEL_PATH):
    model_assets = get_loaded_model_assets(model_path)
    if not model_assets:
        return None, None
    model = model_assets["model"]
    encoders = model_assets["encoders"]
    scaler = model_assets["scaler"]
    sequence_length = model_assets["sequence_length"]
    processed_sequence_df = current_sequence_df.copy()
    if 'activity_encoder' in encoders and encoders['activity_encoder']:
        processed_sequence_df['activity_type_encoded'] = encoders['activity_encoder'].transform(processed_sequence_df['activity_type'])
    else:
        logger.error("Activity encoder not found or not fitted for prediction.")
        return None, None
    processed_sequence_df['hour_of_day'] = pd.to_datetime(processed_sequence_df['timestamp']).dt.hour
    processed_sequence_df['day_of_week'] = pd.to_datetime(processed_sequence_df['timestamp']).dt.dayofweek
    features_to_scale = ['hour_of_day']
    if scaler:
        processed_sequence_df[features_to_scale] = scaler.transform(processed_sequence_df[features_to_scale])
    else:
        logger.error("Scaler not found or not fitted for prediction.")
        return None, None
    sequence_features = processed_sequence_df[['activity_type_encoded', 'hour_of_day']].values
    if len(sequence_features) < sequence_length:
        logger.warning(f"Input sequence for user {user_id} is shorter ({len(sequence_features)}) than required ({sequence_length}).")
        return None, None
    sequence_to_predict = sequence_features[-sequence_length:]
    sequence_tensor = torch.tensor([sequence_to_predict], dtype=torch.float32).to(next(model.parameters()).device)
    with torch.no_grad():
        output = model(sequence_tensor)
        probabilities = torch.softmax(output, dim=1)
        predicted_label = torch.argmax(probabilities, dim=1).item()
    original_prediction = predicted_label
    if encoders.get('cluster_encoder') and encoders['cluster_encoder'] is not None:
        try:
            original_prediction = encoders['cluster_encoder'].inverse_transform([predicted_label])[0]
        except Exception as e:
            logger.error(f"Error inverse transforming prediction: {e}. Predicted label was {predicted_label}")
    return original_prediction, probabilities

# --- Example Usage (Illustrative) ---
if __name__ == '__main__':
    num_samples = 200
    data = {
        'user_id': np.random.choice(['user1', 'user2', 'user3'], num_samples),
        'timestamp': pd.to_datetime(np.random.randint(1609459200, 1640995200, num_samples), unit='s'),
        'activity_type': np.random.choice(['login', 'logout', 'view_page', 'edit_document', 'send_email'], num_samples),
        'description': ['sample description'] * num_samples,
        'cluster_label': np.random.randint(0, 5, num_samples) 
    }
    df = pd.DataFrame(data)

    logger.info("Starting dummy training process using PRIMARY_MODEL_PATH...")
    # Example training, saving to the PRIMARY_MODEL_PATH
    trained_model, _ = train_predictive_model(
        df, sequence_length=5, hidden_dim=64, num_layers=2, epochs=5, 
        batch_size=16, learning_rate=0.005, model_path=PRIMARY_MODEL_PATH # Explicitly using PRIMARY_MODEL_PATH
    )

    if trained_model:
        logger.info(f"Dummy training finished. Model saved to {PRIMARY_MODEL_PATH}")
        user_to_predict = 'user1'
        user_data_for_prediction = df[df['user_id'] == user_to_predict].tail(10)
        
        if len(user_data_for_prediction) < 5: # Check against known training sequence length
             logger.warning(f"Not enough data for user {user_to_predict} to form a sequence of length 5.")
        else:
            logger.info(f"Making prediction for user: {user_to_predict} using model from: {PRIMARY_MODEL_PATH}")
            # Prediction will use PRIMARY_MODEL_PATH by default from predict_next_action
            predicted_action_label, action_probabilities = predict_next_action(
                user_id=user_to_predict,
                current_sequence_df=user_data_for_prediction
            )
            if predicted_action_label is not None:
                logger.info(f"Predicted next action for {user_to_predict}: {predicted_action_label}")
                if action_probabilities is not None:
                     logger.info(f"Probabilities: {action_probabilities.numpy()}")
            else:
                logger.warning(f"Prediction failed for user {user_to_predict}.")
    else:
        logger.error(f"Dummy training failed or did not produce a model for {PRIMARY_MODEL_PATH}.")

    logger.info("\nStarting dummy training process using DEFAULT_MODEL_DIR for a custom model name...")
    example_model_filename_only = "example_custom_model.pth"
    trained_model_custom, _ = train_predictive_model(
        df, sequence_length=7, hidden_dim=32, num_layers=1, epochs=3,
        batch_size=16, learning_rate=0.01, model_path=example_model_filename_only # Pass filename only
    )
    if trained_model_custom:
        expected_custom_path = os.path.join(DEFAULT_MODEL_DIR, example_model_filename_only)
        logger.info(f"Dummy training finished. Model saved to {expected_custom_path}")
        user_to_predict_custom = 'user2' # Changed variable name to avoid conflict
        user_data_for_prediction_custom = df[df['user_id'] == user_to_predict_custom].tail(15)

        if len(user_data_for_prediction_custom) < 7: # Check against known training sequence length
            logger.warning(f"Not enough data for user {user_to_predict_custom} to form a sequence of length 7.")
        else:
            logger.info(f"Making prediction for user: {user_to_predict_custom} using model: {example_model_filename_only}")
            predicted_action_label_custom, _ = predict_next_action(
                user_id=user_to_predict_custom,
                current_sequence_df=user_data_for_prediction_custom,
                model_path=example_model_filename_only # Pass filename only, will be resolved by get_loaded_model_assets
            )
            if predicted_action_label_custom is not None:
                logger.info(f"Predicted next action for {user_to_predict_custom} (custom model): {predicted_action_label_custom}")
            else:
                logger.warning(f"Prediction failed for user {user_to_predict_custom} (custom model).")
    else:
        logger.error(f"Dummy training for custom model {example_model_filename_only} failed.")
