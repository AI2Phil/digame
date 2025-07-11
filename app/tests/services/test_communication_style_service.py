import pytest
import json
from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session
from fastapi import HTTPException

# Models
from app.models.user import User as UserModel
from app.models.tenant import Tenant as TenantModel
# TenantUser model doesn't exist - relationship is direct through User.tenant_id
from app.models.user_setting import UserSetting as UserSettingModel

# Service to test
from app.services.communication_style_service import CommunicationStyleService



# --- Fixtures (similar to test_writing_assistance_service.py) ---

@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

@pytest.fixture
def mock_ai_integration_service():
    from app.services.ai_integration_service import AIIntegrationService
    return MagicMock(spec=AIIntegrationService)

@pytest.fixture
def mock_user_model():
    user = create_mock_model(UserModel, id=1, email="comm_user@example.com", full_name="Comm Test User", tenant_id=1)
    return user

@pytest.fixture
def mock_tenant_model_comm_style(): # Renamed to avoid conflict if used in same scope as other test's tenant
    tenant = create_mock_model(TenantModel, id=1,
        name="Comm Style Tenant",
        admin_email="admin@commtenant.com",
        features={"communication_style_analysis": True} # Default to enabled
    )
    return tenant

@pytest.fixture
def mock_user_setting_model_comm_style(): # Renamed
    setting = create_mock_model(UserSettingModel, id=1,
        user_id=1,
        api_keys=json.dumps({"communication_style_service_key": "valid_comm_key_premium"})
    )
    return setting

@pytest.fixture
def mock_tenant_user_link_comm_style(mock_user_model, mock_tenant_model_comm_style): # Renamed
    # Set up the direct relationship - user belongs to tenant
    mock_user_model.tenant_id = mock_tenant_model_comm_style.id
    mock_user_model.tenant = mock_tenant_model_comm_style
    return mock_user_model  # Return the user since there's no separate link object

# --- Tests for CommunicationStyleService ---
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


def test_get_analysis_success(mock_db_session, mock_ai_integration_service, mock_user_model, mock_tenant_model_comm_style, mock_user_setting_model_comm_style, mock_tenant_user_link_comm_style):
    # Arrange
    mock_tenant_model_comm_style.features = {"communication_style_analysis": True}
    service = CommunicationStyleService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    text_input = "This is a test text, please analyze."

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_comm_style):
        # Action
        analysis = service.get_communication_style_analysis(current_user=mock_user_model, text_input=text_input)

        # Assertion
        assert isinstance(analysis, dict)
        assert analysis.get("style") is not None
        assert analysis.get("model_type") == "premium"
        assert analysis.get("raw_text_length") == len(text_input)

def test_get_analysis_feature_disabled(mock_db_session, mock_ai_integration_service, mock_user_model, mock_tenant_model_comm_style, mock_tenant_user_link_comm_style):
    # Arrange
    mock_tenant_model_comm_style.features = {"communication_style_analysis": False}
    service = CommunicationStyleService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    # Action & Assertion
    with pytest.raises(HTTPException) as exc_info:
        service.get_communication_style_analysis(current_user=mock_user_model, text_input="Test")

    assert exc_info.value.status_code == 403
    assert "feature is not enabled" in exc_info.value.detail.lower()

def test_get_analysis_no_user_settings(mock_db_session, mock_ai_integration_service, mock_user_model, mock_tenant_model_comm_style, mock_tenant_user_link_comm_style):
    # Arrange
    mock_tenant_model_comm_style.features = {"communication_style_analysis": True}
    service = CommunicationStyleService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=None) as mock_get_settings:
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_communication_style_analysis(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 402
        assert "api key for communication style analysis not found" in exc_info.value.detail.lower()
        mock_get_settings.assert_called_once_with(mock_db_session, user_id=mock_user_model.id)

def test_get_analysis_no_api_key_in_settings(mock_db_session, mock_ai_integration_service, mock_user_model, mock_tenant_model_comm_style, mock_user_setting_model_comm_style, mock_tenant_user_link_comm_style):
    # Arrange
    mock_tenant_model_comm_style.features = {"communication_style_analysis": True}
    mock_user_setting_model_comm_style.api_keys = json.dumps({}) # No specific key
    service = CommunicationStyleService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_comm_style):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_communication_style_analysis(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 402
        assert "'communication_style_service_key' is missing" in exc_info.value.detail.lower()

def test_get_analysis_empty_api_key(mock_db_session, mock_ai_integration_service, mock_user_model, mock_tenant_model_comm_style, mock_user_setting_model_comm_style, mock_tenant_user_link_comm_style):
    # Arrange
    mock_tenant_model_comm_style.features = {"communication_style_analysis": True}
    mock_user_setting_model_comm_style.api_keys = json.dumps({"openai_api_key": ""})
    service = CommunicationStyleService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_comm_style):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_communication_style_analysis(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 400
        assert "api key must be provided" in exc_info.value.detail.lower() # From mock client's ValueError

def test_get_analysis_invalid_api_key_external_error(mock_db_session, mock_ai_integration_service, mock_user_model, mock_tenant_model_comm_style, mock_user_setting_model_comm_style, mock_tenant_user_link_comm_style):
    # Arrange
    mock_tenant_model_comm_style.features = {"communication_style_analysis": True}
    mock_user_setting_model_comm_style.api_keys = json.dumps({"openai_api_key": "invalid_comm_key"})
    service = CommunicationStyleService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_comm_style):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_communication_style_analysis(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 400
        assert "invalid api key provided" in exc_info.value.detail.lower() # From mock client's ValueError

def test_get_analysis_user_not_in_tenant(mock_db_session, mock_ai_integration_service, mock_user_model):
    # Arrange
    mock_user_model.tenant_id = None  # User not associated with any tenant
    mock_user_model.tenant = None
    service = CommunicationStyleService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    # Action & Assertion
    with pytest.raises(HTTPException) as exc_info:
        service.get_communication_style_analysis(current_user=mock_user_model, text_input="Test")

    assert exc_info.value.status_code == 403
    assert "user not associated with any tenant" in exc_info.value.detail.lower()

def test_get_analysis_corrupted_tenant_features_json(mock_db_session, mock_ai_integration_service, mock_user_model, mock_tenant_model_comm_style, mock_tenant_user_link_comm_style):
    # Arrange
    mock_tenant_model_comm_style.features = '{"communication_style_analysis": True' # Malformed JSON
    service = CommunicationStyleService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    # Action & Assertion
    with pytest.raises(HTTPException) as exc_info:
        service.get_communication_style_analysis(current_user=mock_user_model, text_input="Test")

    assert exc_info.value.status_code == 500
    assert "error reading tenant configuration" in exc_info.value.detail.lower()

def test_get_analysis_corrupted_user_settings_api_keys_json(mock_db_session, mock_ai_integration_service, mock_user_model, mock_tenant_model_comm_style, mock_user_setting_model_comm_style, mock_tenant_user_link_comm_style):
    # Arrange
    mock_tenant_model_comm_style.features = {"communication_style_analysis": True}
    mock_user_setting_model_comm_style.api_keys = '{"openai_api_key": "valid"' # Malformed JSON
    service = CommunicationStyleService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_comm_style):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_communication_style_analysis(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 500
        assert "error parsing your api key settings" in exc_info.value.detail.lower()

def test_get_analysis_tenant_link_missing_tenant_attr(mock_db_session, mock_ai_integration_service, mock_user_model):
    # Arrange
    # Simulate a user with tenant_id but no tenant relationship loaded
    mock_user_model.tenant_id = 1
    mock_user_model.tenant = None  # Simulate missing tenant relationship
    service = CommunicationStyleService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    # Action & Assertion
    with pytest.raises(HTTPException) as exc_info:
        service.get_communication_style_analysis(current_user=mock_user_model, text_input="Test")

    assert exc_info.value.status_code == 500 # Or specific error based on implementation
    assert "tenant linkage error" in exc_info.value.detail.lower()

def test_get_analysis_tenant_features_none(mock_db_session, mock_ai_integration_service, mock_user_model, mock_tenant_model_comm_style, mock_tenant_user_link_comm_style):
    # Arrange
    mock_tenant_model_comm_style.features = None # Features is None
    service = CommunicationStyleService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    # Action & Assertion
    with pytest.raises(HTTPException) as exc_info:
        service.get_communication_style_analysis(current_user=mock_user_model, text_input="Test")

    assert exc_info.value.status_code == 403 # Because .get("communication_style_analysis") on {} will be None
    assert "feature is not enabled" in exc_info.value.detail.lower()

def test_get_analysis_input_text_empty_mock_client_error(mock_db_session, mock_ai_integration_service, mock_user_model, mock_tenant_model_comm_style, mock_user_setting_model_comm_style, mock_tenant_user_link_comm_style):
    # Test how the service handles an error from the mock client if text is empty
    # Arrange
    mock_tenant_model_comm_style.features = {"communication_style_analysis": True}
    service = CommunicationStyleService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    text_input = "" # Empty text

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_comm_style):
        # Action
        with pytest.raises(HTTPException) as exc_info:
            service.get_communication_style_analysis(current_user=mock_user_model, text_input=text_input)

        # Assertion
        assert exc_info.value.status_code == 400 # As per service logic for client error
        assert "input text cannot be empty" in exc_info.value.detail.lower()
