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
from app.services.meeting_insights_service import MeetingInsightsService



# --- Fixtures ---

@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

@pytest.fixture
def mock_ai_integration_service():
    from app.services.ai_integration_service import AIIntegrationService
    return MagicMock(spec=AIIntegrationService)

@pytest.fixture
def mock_user_model_insights(): # Renamed for clarity
    user = create_mock_model(UserModel, id=3, email="insights_user@example.com", full_name="Insights Test User", tenants=[])
    return user

@pytest.fixture
def mock_tenant_model_insights(): # Renamed
    tenant = create_mock_model(TenantModel, id=3,
        name="Insights Tenant",
        admin_email="admin@insightstenant.com",
        features={"meeting_insights": True}) # Default to enabled
    return tenant

@pytest.fixture
def mock_user_setting_model_insights(): # Renamed
    setting = create_mock_model(UserSettingModel, id=3,
        user_id=3, # Matches mock_user_model_insights.id
        api_keys=json.dumps({"meeting_insights_service_key": "valid_meeting_key_premium"})
    )
    return setting

@pytest.fixture
def mock_tenant_user_link_insights(mock_user_model_insights, mock_tenant_model_insights): # Renamed
    # Set up the direct relationship - user belongs to tenant
    mock_user_model_insights.tenant_id = mock_tenant_model_insights.id
    mock_user_model_insights.tenant = mock_tenant_model_insights
    link = mock_user_model_insights  # Return the user since there's no separate link object
    mock_user_model_insights.tenants.append(link)
    return link

# --- Tests for MeetingInsightsService ---
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


async def test_get_analysis_success(mock_db_session, mock_ai_integration_service, mock_user_model_insights, mock_tenant_model_insights, mock_user_setting_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    # Fix API key field name - service expects openai_api_key
    mock_user_setting_model_insights.api_keys = json.dumps({"openai_api_key": "valid_meeting_key_premium"})
    
    # Mock AI integration service to return proper OpenAI response
    from unittest.mock import AsyncMock
    mock_ai_integration_service.make_request = AsyncMock(return_value={
        "choices": [
            {
                "message": {
                    "content": '{"summary": "Meeting about project Alpha", "key_points": ["Discuss next steps", "Review progress"], "action_items": [{"action": "Complete task", "assignee": "John", "due_text": "next week"}]}'
                }
            }
        ]
    })
    
    service = MeetingInsightsService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    meeting_text = "This is a productive meeting about project Alpha. We need to decide on the next steps."

    with patch('app.crud.user_crud.get_user', return_value=mock_user_model_insights), \
         patch('app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model_insights), \
         patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_insights):
        # Action
        analysis = await service.get_meeting_analysis(current_user_id=mock_user_model_insights.id, meeting_text=meeting_text)

        # Assertion
        assert isinstance(analysis, dict)
        assert "summary" in analysis
        assert "key_points" in analysis
        assert "action_items" in analysis
        assert analysis.get("model_provider") == "openai"
        assert analysis.get("text_length") == len(meeting_text)

async def test_get_analysis_feature_disabled(mock_db_session, mock_ai_integration_service, mock_user_model_insights, mock_tenant_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": False}
    service = MeetingInsightsService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('app.crud.user_crud.get_user', return_value=mock_user_model_insights), \
         patch('app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model_insights):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            await service.get_meeting_analysis(current_user_id=mock_user_model_insights.id, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 403
        assert "feature" in exc_info.value.detail.lower() and "not enabled" in exc_info.value.detail.lower()

async def test_get_analysis_no_user_settings(mock_db_session, mock_ai_integration_service, mock_user_model_insights, mock_tenant_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    service = MeetingInsightsService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('app.crud.user_crud.get_user', return_value=mock_user_model_insights), \
         patch('app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model_insights), \
         patch('app.crud.user_setting_crud.get_user_setting', return_value=None) as mock_get_settings:
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            await service.get_meeting_analysis(current_user_id=mock_user_model_insights.id, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 402
        assert "api key" in exc_info.value.detail.lower() and "not found" in exc_info.value.detail.lower()
        mock_get_settings.assert_called_once_with(mock_db_session, user_id=mock_user_model_insights.id)

async def test_get_analysis_no_api_key_in_settings(mock_db_session, mock_ai_integration_service, mock_user_model_insights, mock_tenant_model_insights, mock_user_setting_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    mock_user_setting_model_insights.api_keys = json.dumps({}) # No specific key
    service = MeetingInsightsService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('app.crud.user_crud.get_user', return_value=mock_user_model_insights), \
         patch('app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model_insights), \
         patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_insights):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            await service.get_meeting_analysis(current_user_id=mock_user_model_insights.id, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 402
        assert "openai_api_key" in exc_info.value.detail.lower() and "missing" in exc_info.value.detail.lower()

async def test_get_analysis_empty_api_key(mock_db_session, mock_ai_integration_service, mock_user_model_insights, mock_tenant_model_insights, mock_user_setting_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    mock_user_setting_model_insights.api_keys = json.dumps({"openai_api_key": ""})
    service = MeetingInsightsService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('app.crud.user_crud.get_user', return_value=mock_user_model_insights), \
         patch('app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model_insights), \
         patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_insights):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            await service.get_meeting_analysis(current_user_id=mock_user_model_insights.id, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 402
        assert "openai_api_key" in exc_info.value.detail.lower() and "missing" in exc_info.value.detail.lower()

async def test_get_analysis_invalid_api_key_external_error(mock_db_session, mock_ai_integration_service, mock_user_model_insights, mock_tenant_model_insights, mock_user_setting_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    mock_user_setting_model_insights.api_keys = json.dumps({"openai_api_key": "invalid_meeting_key"})
    
    # Mock AI service to raise an HTTPException (invalid API key)
    from unittest.mock import AsyncMock
    from fastapi import HTTPException
    mock_ai_integration_service.make_request = AsyncMock(side_effect=HTTPException(status_code=401, detail="Invalid API key"))
    
    service = MeetingInsightsService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('app.crud.user_crud.get_user', return_value=mock_user_model_insights), \
         patch('app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model_insights), \
         patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_insights):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            await service.get_meeting_analysis(current_user_id=mock_user_model_insights.id, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 401
        assert "invalid api key" in exc_info.value.detail.lower()

async def test_get_analysis_user_not_in_tenant(mock_db_session, mock_ai_integration_service, mock_user_model_insights):
    # Arrange
    mock_user_model_insights.tenant_id = None
    mock_user_model_insights.tenant = None
    service = MeetingInsightsService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('app.crud.user_crud.get_user', return_value=mock_user_model_insights):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            await service.get_meeting_analysis(current_user_id=mock_user_model_insights.id, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 403
        assert "user not associated with" in exc_info.value.detail.lower() and "tenant" in exc_info.value.detail.lower()

async def test_get_analysis_corrupted_tenant_features_json(mock_db_session, mock_ai_integration_service, mock_user_model_insights, mock_tenant_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = '{"meeting_insights": True' # Malformed JSON
    service = MeetingInsightsService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('app.crud.user_crud.get_user', return_value=mock_user_model_insights), \
         patch('app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model_insights):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            await service.get_meeting_analysis(current_user_id=mock_user_model_insights.id, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 500
        assert "error parsing tenant features" in exc_info.value.detail.lower()

async def test_get_analysis_corrupted_user_settings_api_keys_json(mock_db_session, mock_ai_integration_service, mock_user_model_insights, mock_tenant_model_insights, mock_user_setting_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    mock_user_setting_model_insights.api_keys = '{"openai_api_key": "valid"' # Malformed JSON
    service = MeetingInsightsService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('app.crud.user_crud.get_user', return_value=mock_user_model_insights), \
         patch('app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model_insights), \
         patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_insights):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            await service.get_meeting_analysis(current_user_id=mock_user_model_insights.id, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 500
        assert "error parsing api key settings" in exc_info.value.detail.lower()

async def test_get_analysis_empty_input_text_error_from_client(mock_db_session, mock_ai_integration_service, mock_user_model_insights, mock_tenant_model_insights, mock_user_setting_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    mock_user_setting_model_insights.api_keys = json.dumps({"openai_api_key": "valid_key"})
    service = MeetingInsightsService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    meeting_text = "" # Empty text

    with patch('app.crud.user_crud.get_user', return_value=mock_user_model_insights), \
         patch('app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model_insights), \
         patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_insights):
        # Action
        with pytest.raises(HTTPException) as exc_info:
            await service.get_meeting_analysis(current_user_id=mock_user_model_insights.id, meeting_text=meeting_text)

        # Assertion
        assert exc_info.value.status_code == 400 # As per service logic for client error
        assert "meeting text cannot be empty" in exc_info.value.detail.lower()

async def test_get_analysis_tenant_link_missing_tenant_attr(mock_db_session, mock_ai_integration_service, mock_user_model_insights):
    # Arrange
    # Simulate a user with tenant_id but no tenant relationship loaded
    mock_user_model_insights.tenant_id = 1
    mock_user_model_insights.tenant = None  # Simulate missing tenant relationship
    service = MeetingInsightsService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)

    with patch('app.crud.user_crud.get_user', return_value=mock_user_model_insights), \
         patch('app.crud.tenant_crud.get_tenant_by_id', return_value=None):  # Tenant not found
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            await service.get_meeting_analysis(current_user_id=mock_user_model_insights.id, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 403
        assert "tenant information not found" in exc_info.value.detail.lower()
