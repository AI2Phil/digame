import pytest
import os
import torch
from fastapi.testclient import TestClient

# Assuming PredictiveModel, save_model, load_model are in digame.app.predictive
# and the router is defined in digame.app.routers.predictive
from app.predictive import PredictiveModel, save_model, load_model
from app.routers.predictive import TrainRequest, PredictRequest # For request body models

# Fixtures like `client`, `dummy_model_and_optimizer`, `temp_model_path`, 
# and `patched_model_path` are expected to be in conftest.py

def test_train_endpoint_saves_model(client: TestClient, patched_model_path, dummy_model_and_optimizer):
    """
    Tests that the /predictive/train endpoint successfully trains (mocked) and saves a model.
    Requirement 2.
    """
    # patched_model_path fixture already patches the MODEL_FILE_PATH in the router
    # The path to the model file is patched_model_path (which is a string path here)
    
    # Action: Call the /predictive/train endpoint
    train_payload = TrainRequest(num_epochs=1, learning_rate=0.01).model_dump()
    response = client.post("/predictive/train", json=train_payload)

    # Verification:
    assert response.status_code == 200, \
        f"Expected status code 200, got {response.status_code}. Response: {response.json()}"
    assert response.json() == {"message": "Model trained and saved successfully."}
    
    # Verify that the model file was created at the patched path
    assert os.path.exists(patched_model_path), \
        f"Model file was not created at the patched path: {patched_model_path}"

    # Optionally, load and verify the saved model's integrity
    # Create new model and optimizer instances to load into
    model_params = {
        "input_size": dummy_model_and_optimizer[0].lstm.input_size,
        "hidden_size": dummy_model_and_optimizer[0].hidden_size,
        "num_layers": dummy_model_and_optimizer[0].num_layers,
        "output_size": dummy_model_and_optimizer[0].fc.out_features
    }
    loaded_model = PredictiveModel(**model_params)
    loaded_optimizer = torch.optim.Adam(loaded_model.parameters()) # Fresh optimizer

    try:
        # Use the new load_model function signature
        returned_model, returned_optimizer, encoders, scaler, model_params = load_model(patched_model_path)
        if returned_model is None:
            pytest.fail("Failed to load the model saved by the /train endpoint")
        loaded_model = returned_model
    except Exception as e:
        pytest.fail(f"Failed to load the model saved by the /train endpoint: {e}")
    
    # A simple check: ensure model is in training mode by default after loading (if not set to eval)
    # Or check some parameter values if they are deterministic from the dummy training
    # For now, just successful loading is a good sign.
    if loaded_model is not None:
        assert loaded_model.training, "Loaded model should be in training mode by default after load_model (unless specified otherwise)."


def test_predict_endpoint_loads_model(client: TestClient, patched_model_path, dummy_model_and_optimizer):
    """
    Tests that the /predictive/predict endpoint successfully loads a pre-saved model and makes a prediction.
    Requirement 3.
    """
    model_to_save, optimizer_to_save = dummy_model_and_optimizer
    
    # Setup: Save a dummy model to the patched_model_path so /predict can load it
    # Create dummy encoders_scalers and model_params for testing
    dummy_encoders_scalers = {
        'activity_encoder': None,
        'user_encoder': None,
        'cluster_encoder': None,
        'scaler': None
    }
    dummy_model_params = {
        'input_dim': model_to_save.lstm.input_size,
        'hidden_dim': model_to_save.hidden_dim,
        'output_dim': model_to_save.fc.out_features,
        'num_layers': model_to_save.num_layers,
        'sequence_length': 10,
        'dropout_prob': 0.2
    }
    save_model(model_to_save, optimizer_to_save, dummy_encoders_scalers, dummy_model_params, str(patched_model_path))
    assert os.path.exists(str(patched_model_path)), "Pre-saved model file does not exist for predict test."

    # Action: Call the /predictive/predict endpoint
    # The dummy_predict_data in routers.predictive.py is a tensor of shape (1, 5, INPUT_SIZE)
    # For this test, the actual content of PredictRequest might not matter if using global dummy data
    predict_payload = PredictRequest().model_dump() 
    response = client.post("/predictive/predict", json=predict_payload)

    # Verification:
    assert response.status_code == 200, \
        f"Expected status code 200, got {response.status_code}. Response: {response.json()}"
    
    response_data = response.json()
    assert "prediction" in response_data, "Response JSON should contain a 'prediction' key."
    assert isinstance(response_data["prediction"], list), "Prediction should be a list."
    # The dummy model in routers/predictive.py produces output of shape (1, OUTPUT_SIZE)
    # OUTPUT_SIZE is 1 in conftest.py's dummy model, so prediction list should contain one sublist with one item.
    assert len(response_data["prediction"]) == 1, "Prediction list should have one element (batch size 1)."
    assert len(response_data["prediction"][0]) == dummy_model_and_optimizer[0].fc.out_features, \
        f"Prediction output features should match model's output_size ({dummy_model_and_optimizer[0].fc.out_features})."


def test_predict_endpoint_handles_missing_model(client: TestClient, patched_model_path):
    """
    Tests that the /predictive/predict endpoint returns a 409 error if the model file is missing.
    Requirement 4.
    """
    # Ensure no model file exists at the patched_model_path
    if os.path.exists(str(patched_model_path)):
        os.remove(str(patched_model_path))
    
    assert not os.path.exists(str(patched_model_path)), "Model file should not exist for this test."

    # Action: Call the /predictive/predict endpoint
    predict_payload = PredictRequest().model_dump()
    response = client.post("/predictive/predict", json=predict_payload)

    # Verification:
    assert response.status_code == 409, \
        f"Expected status code 409, got {response.status_code}. Response: {response.json()}"
    
    response_data = response.json()
    assert "detail" in response_data, "Response JSON should contain a 'detail' key."
    assert "Model not trained yet" in response_data["detail"] or \
           "Model file not found" in response_data["detail"], \
           "Response detail did not contain the expected error message."

# Note: The dummy_train_loader and dummy_predict_data are defined globally in
# digame.app.routers.predictive.py. For more robust unit tests,
# these could also be injected or patched if they were to change or involve external sources.
# The current tests rely on these global dummies for the router's internal logic.
# The INPUT_SIZE, HIDDEN_SIZE etc. in routers.predictive should match or be compatible with
# the dummy_model_and_optimizer fixture from conftest.py if direct model state comparison
# were done after loading from a /train call. The current test_train_endpoint_saves_model
# re-instantiates a model using fixture params for loading.
