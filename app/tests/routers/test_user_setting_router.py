import json
import pytest
import random
import string
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from fastapi import status

# Assuming conftest.py provides these fixtures
from app.tests.conftest import db_session

from app.models.user import User as UserModel
from app.models.user_setting import UserSetting as UserSettingModel
from app.schemas.user_setting_schemas import UserSetting as UserSettingSchema # For response validation
from app.crud import user_setting_crud # To setup data if needed
from app.auth.auth_dependencies import get_current_active_user


# Helper to create a unique user for API tests & for dependency override
# This user needs to exist in the DB for the test session
def create_and_get_test_user_for_api(db: Session, username_prefix: str) -> UserModel:
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"{username_prefix}_api_{random_suffix}@example.com"
    
    # Check if user exists, if not add them
    existing_user = db.query(UserModel).filter(UserModel.email == email).first()
    if not existing_user:
        mock_user_for_api = create_mock_model(UserModel, username=f"{username_prefix}_api_{random_suffix}",
            email=email,
            hashed_password="fake_api_password", # Not used for auth in these tests due to override
            is_active=True)
        db.add(mock_user_for_api)
        db.commit()
        db.refresh(mock_user_for_api)
        return mock_user_for_api
    return existing_user


@pytest.fixture(scope="function")
def client():
    """Create a test client for the FastAPI app."""
    from app.main import app
    return TestClient(app)

@pytest.fixture(scope="function")
def override_auth_for_settings_api(client: TestClient, db_session: Session):
    """Fixture to create a test user and override auth for settings API tests."""
    test_user = create_and_get_test_user_for_api(db_session, "settings_user")

    def override_get_current_active_user_for_settings():
        # Return a fresh instance from DB to ensure it has latest data if settings are created/updated
        return db_session.query(UserModel).filter(UserModel.id == test_user.id).first()

    client.app.dependency_overrides[get_current_active_user] = override_get_current_active_user_for_settings
    yield test_user # Provide the user to the test if needed
    client.app.dependency_overrides.clear()



def create_mock_model(model_class, **kwargs):
    """Create a mock instance of a SQLAlchemy model with given attributes."""
    # For testing purposes, we'll create a simple mock object
    # that behaves like the model but doesn't require database instantiation
    class MockModel:
        def __init__(self, **attrs):
            for key, value in attrs.items():
                setattr(self, key, value)
            # Set some default attributes that SQLAlchemy models typically have
            if not hasattr(self, 'id'):
                self.id = 1
            if not hasattr(self, 'created_at'):
                from datetime import datetime, timezone
                self.created_at = datetime.now(timezone.utc)
        
        def __repr__(self):
            attrs = []
            for key, value in self.__dict__.items():
                if not key.startswith('_'):
                    if isinstance(value, str) and len(value) > 20:
                        attrs.append(f"{key}='{value[:20]}...'")
                    else:
                        attrs.append(f"{key}={repr(value)}")
            return f"<{model_class.__name__}({', '.join(attrs)})>"
    
    return MockModel(**kwargs)


def test_get_api_keys_no_settings_exist(client: TestClient, override_auth_for_settings_api):
    """
    Test GET /settings/api-keys when no settings exist for the user.
    The endpoint should create default settings (empty api_keys dict).
    """
    response = client.get("/settings/api-keys")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["api_keys"] == {}
    assert data["user_id"] == override_auth_for_settings_api.id # User provided by fixture


def test_get_api_keys_existing_settings(client: TestClient, db_session: Session, override_auth_for_settings_api):
    """
    Test GET /settings/api-keys when settings already exist.
    """
    current_test_user = override_auth_for_settings_api
    
    # Create settings directly using CRUD for setup
    initial_keys = {"service_get_api": "key_get_api_val"}
    user_setting_crud.create_user_setting(
        db_session,
        user_id=current_test_user.id,
        settings=UserSettingSchema(api_keys=initial_keys) # UserSettingCreate schema
    )

    response = client.get("/settings/api-keys")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["api_keys"] == initial_keys
    assert data["user_id"] == current_test_user.id


def test_post_api_keys_create_and_update(client: TestClient, db_session: Session, override_auth_for_settings_api):
    """
    Test POST /settings/api-keys:
    - Scenario 1 (No settings): POST new API keys.
    - Scenario 2 (Existing settings): POST to update API keys.
    """
    current_test_user = override_auth_for_settings_api

    # Scenario 1: No settings exist, POST should create them
    keys_to_create = {"service_post_create": "key_post_create_val"}
    response_create = client.post("/settings/api-keys", json={"api_keys": keys_to_create})
    assert response_create.status_code == status.HTTP_200_OK
    data_create = response_create.json()
    assert data_create["api_keys"] == keys_to_create
    assert data_create["user_id"] == current_test_user.id

    # Verify in DB
    db_settings_after_create = user_setting_crud.get_user_setting(db_session, user_id=current_test_user.id)
    assert db_settings_after_create is not None
    assert json.loads(db_settings_after_create.api_keys) == keys_to_create

    # Scenario 2: Settings exist, POST should update them
    keys_to_update = {"service_post_update": "key_post_update_val", "another_key": "another_val"}
    response_update = client.post("/settings/api-keys", json={"api_keys": keys_to_update})
    assert response_update.status_code == status.HTTP_200_OK
    data_update = response_update.json()
    assert data_update["api_keys"] == keys_to_update
    assert data_update["user_id"] == current_test_user.id
    
    # Verify in DB
    db_settings_after_update = user_setting_crud.get_user_setting(db_session, user_id=current_test_user.id)
    assert db_settings_after_update is not None
    assert json.loads(db_settings_after_update.api_keys) == keys_to_update


def test_delete_api_key(client: TestClient, db_session: Session, override_auth_for_settings_api):
    """
    Test DELETE /settings/api-keys/{key_name}:
    - Delete an existing key.
    - Attempt to delete a non-existent key (should 404).
    """
    current_test_user = override_auth_for_settings_api

    # Setup: Create settings with multiple keys
    initial_keys_for_delete = {
        "key_to_delete": "delete_me_val",
        "key_to_keep": "keep_me_val"
    }
    # Use POST to create initial settings via API
    client.post("/settings/api-keys", json={"api_keys": initial_keys_for_delete})

    # Scenario 1: Delete an existing key
    key_name_to_delete = "key_to_delete"
    response_delete_existing = client.delete(f"/settings/api-keys/{key_name_to_delete}")
    assert response_delete_existing.status_code == status.HTTP_200_OK
    data_delete_existing = response_delete_existing.json()
    
    expected_keys_after_delete = {"key_to_keep": "keep_me_val"}
    assert data_delete_existing["api_keys"] == expected_keys_after_delete
    assert data_delete_existing["user_id"] == current_test_user.id

    # Verify in DB
    db_settings_after_delete = user_setting_crud.get_user_setting(db_session, user_id=current_test_user.id)
    assert db_settings_after_delete is not None
    assert json.loads(db_settings_after_delete.api_keys) == expected_keys_after_delete

    # Scenario 2: Attempt to delete a non-existent key
    non_existent_key_name = "non_existent_key_123"
    response_delete_non_existent = client.delete(f"/settings/api-keys/{non_existent_key_name}")
    assert response_delete_non_existent.status_code == status.HTTP_404_NOT_FOUND

def test_delete_api_key_no_settings_or_key_not_found(client: TestClient, db_session: Session, override_auth_for_settings_api):
    """
    Test DELETE /settings/api-keys/{key_name}:
    - When no settings exist for the user (endpoint logic might create them, then fail to find key -> 404).
    - When settings exist but api_keys field is empty or key not present.
    """
    current_test_user_no_keys = create_and_get_test_user_for_api(db_session, "settings_user_no_keys") # Fresh user

    def override_get_current_active_user_no_keys():
        return db_session.query(UserModel).filter(UserModel.id == current_test_user_no_keys.id).first()

    client.app.dependency_overrides[get_current_active_user] = override_get_current_active_user_no_keys
    
    # Scenario 1: No settings initially exist for the user.
    # The GET endpoint creates default empty settings. DELETE then tries to delete from empty.
    # First, ensure settings are created by a GET call or similar logic in DELETE endpoint if it exists
    # The router's delete logic fetches settings, if not found it raises 404 early.
    # So, if no settings, it should be 404.
    response_del_key_no_settings = client.delete("/settings/api-keys/some_key")
    assert response_del_key_no_settings.status_code == status.HTTP_404_NOT_FOUND # Because no settings or api_keys is empty

    # Scenario 2: Settings exist, but api_keys is empty
    user_setting_crud.create_user_setting(
        db_session,
        user_id=current_test_user_no_keys.id,
        settings=UserSettingSchema(api_keys={}) # UserSettingCreate schema
    )
    response_del_key_empty_dict = client.delete("/settings/api-keys/some_key")
    assert response_del_key_empty_dict.status_code == status.HTTP_404_NOT_FOUND

    client.app.dependency_overrides.clear() # Cleanup for this specific override

# Final cleanup if any test-specific override was not in a fixture
@pytest.fixture(autouse=True)
def cleanup_overrides(client: TestClient):
    yield
    client.app.dependency_overrides.clear()
