import pytest
import os
import torch
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

# Assuming PredictiveModel, save_model, load_model are in digame.app.predictive
# and the router is defined in digame.app.routers.predictive
from app.predictive import PredictiveModel, save_model, load_model
from app.routers.predictive import TrainRequest, PredictRequest # For request body models
from app.main import app
from app.auth.auth_dependencies import get_current_active_user
from app.db import get_db
from app.models.activity import Activity

# Fixtures like `client`, `dummy_model_and_optimizer`, `temp_model_path`,
# and `patched_model_path` are expected to be in conftest.py

def test_train_endpoint_saves_model(client: TestClient, patched_model_path, dummy_model_and_optimizer, test_admin_user, db_session):
    """
    Tests that the /predictive/train endpoint successfully trains (mocked) and saves a model.
    Requirement 2.
    """
    # Override authentication and database dependencies
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    app.dependency_overrides[get_db] = lambda: db_session
    
    try:
        # Create test activities for the user
        base_time = datetime.now() - timedelta(days=1)
        activity_types = ["login", "browse", "edit", "save", "logout"]
        test_activities = [
            Activity(
                user_id=test_admin_user.id,
                activity_type=activity_types[i % len(activity_types)],
                timestamp=base_time + timedelta(minutes=i*10),
                details={"test": True}
            )
            for i in range(10)  # Create 10 test activities
        ]
        
        # Add activities to database
        for activity in test_activities:
            db_session.add(activity)
        db_session.commit()
        
        # patched_model_path fixture already patches the MODEL_FILE_PATH in the router
        # The path to the model file is patched_model_path (which is a string path here)
        
        # Action: Call the /predictive/train endpoint
        train_payload = TrainRequest(user_id=test_admin_user.id, num_epochs=1, learning_rate=0.01).model_dump()
        response = client.post("/predictive/train", json=train_payload)
    finally:
        # Clean up overrides
        if get_current_active_user in app.dependency_overrides:
            del app.dependency_overrides[get_current_active_user]
        if get_db in app.dependency_overrides:
            del app.dependency_overrides[get_db]

    # Verification:
    assert response.status_code == 200, \
        f"Expected status code 200, got {response.status_code}. Response: {response.json()}"
    
    response_data = response.json()
    assert "message" in response_data, "Response should contain a 'message' key"
    assert "Model training initiated/completed for user" in response_data["message"], \
        f"Response message should indicate successful training. Got: {response_data['message']}"
    assert str(test_admin_user.id) in response_data["message"], \
        f"Response message should include user ID {test_admin_user.id}"
    
    # Verify that the model file was created at the patched path
    assert os.path.exists(patched_model_path), \
        f"Model file was not created at the patched path: {patched_model_path}"

    # Optionally, load and verify the saved model's integrity
    # Create new model and optimizer instances to load into
    model_params = {
        "input_dim": dummy_model_and_optimizer[0].lstm.input_size,
        "hidden_dim": dummy_model_and_optimizer[0].hidden_dim,
        "num_layers": dummy_model_and_optimizer[0].num_layers,
        "output_dim": dummy_model_and_optimizer[0].fc.out_features
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


def test_predict_endpoint_loads_model(client: TestClient, patched_model_path, dummy_model_and_optimizer, test_admin_user, db_session):
    """
    Tests that the /predictive/predict endpoint successfully loads a pre-saved model and makes a prediction.
    Requirement 3.
    """
    # Override authentication and database dependencies
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    app.dependency_overrides[get_db] = lambda: db_session
    
    try:
        # Create test activities for the user (needed for prediction)
        base_time = datetime.now() - timedelta(days=1)
        activity_types = ["login", "browse", "edit", "save", "logout"]
        test_activities = [
            Activity(
                user_id=test_admin_user.id,
                activity_type=activity_types[i % len(activity_types)],
                timestamp=base_time + timedelta(minutes=i*10),
                details={"test": True}
            )
            for i in range(10)  # Create 10 test activities
        ]
        
        # Add activities to database
        for activity in test_activities:
            db_session.add(activity)
        db_session.commit()
        
        model_to_save, optimizer_to_save = dummy_model_and_optimizer
        
        # Setup: Save a dummy model to the patched_model_path so /predict can load it
        # Create dummy encoders_scalers and model_params for testing
        from sklearn.preprocessing import LabelEncoder, StandardScaler
        import numpy as np
        
        # Create dummy encoders with some test data
        activity_encoder = LabelEncoder()
        activity_encoder.fit(['login', 'browse', 'edit', 'save', 'logout'])
        
        scaler = StandardScaler()
        scaler.fit(np.random.rand(10, 3))  # Dummy data for 3 numerical features
        
        dummy_encoders_scalers = {
            'activity_encoder': activity_encoder,
            'user_encoder': None,
            'cluster_encoder': None,
            'scaler': scaler
        }
        dummy_model_params = {
            'input_dim': model_to_save.lstm.input_size,
            'hidden_dim': model_to_save.hidden_dim,
            'output_dim': model_to_save.fc.out_features,
            'num_layers': model_to_save.num_layers,
            'sequence_length': 5,  # Match the default sequence length
            'dropout_prob': 0.2,
            'fitted_categories': {
                'activity_type': ['login', 'browse', 'edit', 'save', 'logout'],
                'app_category': ['Missing_AppCategory'],
                'project_context': ['Missing_ProjectContext'],
                'website_category': ['Missing_WebsiteCategory']
            }
        }
        save_model(model_to_save, optimizer_to_save, dummy_encoders_scalers, dummy_model_params, str(patched_model_path))
        assert os.path.exists(str(patched_model_path)), "Pre-saved model file does not exist for predict test."

        # Action: Call the /predictive/predict endpoint
        # The dummy_predict_data in routers.predictive.py is a tensor of shape (1, 5, INPUT_SIZE)
        # For this test, the actual content of PredictRequest might not matter if using global dummy data
        predict_payload = PredictRequest(
            user_id=test_admin_user.id,
            recent_activity_types=["login", "browse", "purchase", "logout", "idle"]
        ).model_dump()
        response = client.post("/predictive/predict", json=predict_payload)
    finally:
        # Clean up overrides
        if get_current_active_user in app.dependency_overrides:
            del app.dependency_overrides[get_current_active_user]
        if get_db in app.dependency_overrides:
            del app.dependency_overrides[get_db]

    # Verification:
    assert response.status_code == 200, \
        f"Expected status code 200, got {response.status_code}. Response: {response.json()}"
    
    response_data = response.json()
    assert "predicted_next_activity_type" in response_data, "Response JSON should contain a 'predicted_next_activity_type' key."
    assert isinstance(response_data["predicted_next_activity_type"], str), "Predicted activity type should be a string."
    # Verify the predicted activity type is one of the known activity types
    expected_activity_types = ['login', 'browse', 'edit', 'save', 'logout']
    assert response_data["predicted_next_activity_type"] in expected_activity_types, \
        f"Predicted activity type should be one of {expected_activity_types}, got {response_data['predicted_next_activity_type']}"


def test_predict_endpoint_handles_missing_model(client: TestClient, patched_model_path, test_admin_user, db_session):
    """
    Tests that the /predictive/predict endpoint returns a 409 error if the model file is missing.
    Requirement 4.
    """
    # Override authentication and database dependencies
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    app.dependency_overrides[get_db] = lambda: db_session
    
    try:
        # Ensure no model file exists at the patched_model_path
        if os.path.exists(str(patched_model_path)):
            os.remove(str(patched_model_path))
        
        assert not os.path.exists(str(patched_model_path)), "Model file should not exist for this test."

        # Action: Call the /predictive/predict endpoint
        predict_payload = PredictRequest(
            user_id=test_admin_user.id,
            recent_activity_types=["login", "browse", "purchase", "logout", "idle"]
        ).model_dump()
        response = client.post("/predictive/predict", json=predict_payload)
    finally:
        # Clean up overrides
        if get_current_active_user in app.dependency_overrides:
            del app.dependency_overrides[get_current_active_user]
        if get_db in app.dependency_overrides:
            del app.dependency_overrides[get_db]

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
