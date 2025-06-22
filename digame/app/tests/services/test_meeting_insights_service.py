import pytest
import json
from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session
from fastapi import HTTPException

# Models
from digame.app.models.user import User as UserModel
from digame.app.models.tenant import Tenant as TenantModel
from digame.app.models.tenant_user import TenantUser as TenantUserModel
from digame.app.models.user_setting import UserSetting as UserSettingModel

# Service to test
from digame.app.services.meeting_insights_service import MeetingInsightsService

# --- Fixtures ---

@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

@pytest.fixture
def mock_user_model_insights(): # Renamed for clarity
    user = UserModel(id=3, email="insights_user@example.com", full_name="Insights Test User", tenants=[])
    return user

@pytest.fixture
def mock_tenant_model_insights(): # Renamed
    tenant = TenantModel(
        id=3,
        name="Insights Tenant",
        admin_email="admin@insightstenant.com",
        features={"meeting_insights": True} # Default to enabled
    )
    return tenant

@pytest.fixture
def mock_user_setting_model_insights(): # Renamed
    setting = UserSettingModel(
        id=3,
        user_id=3, # Matches mock_user_model_insights.id
        api_keys=json.dumps({"meeting_insights_service_key": "valid_meeting_key_premium"})
    )
    return setting

@pytest.fixture
def mock_tenant_user_link_insights(mock_user_model_insights, mock_tenant_model_insights): # Renamed
    link = TenantUserModel(user_id=mock_user_model_insights.id, tenant_id=mock_tenant_model_insights.id)
    link.user = mock_user_model_insights
    link.tenant = mock_tenant_model_insights
    mock_user_model_insights.tenants.append(link)
    return link

# --- Tests for MeetingInsightsService ---

def test_get_analysis_success(mock_db_session, mock_user_model_insights, mock_tenant_model_insights, mock_user_setting_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    service = MeetingInsightsService(db=mock_db_session)
    meeting_text = "This is a productive meeting about project Alpha. We need to decide on the next steps."

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_insights):
        # Action
        analysis = service.get_meeting_analysis(current_user=mock_user_model_insights, meeting_text=meeting_text)

        # Assertion
        assert isinstance(analysis, dict)
        assert "summary" in analysis
        assert "key_points" in analysis
        assert "action_items" in analysis
        assert analysis.get("analysis_level") == "premium"
        assert analysis.get("text_length") == len(meeting_text)

def test_get_analysis_feature_disabled(mock_db_session, mock_user_model_insights, mock_tenant_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": False}
    service = MeetingInsightsService(db=mock_db_session)

    # Action & Assertion
    with pytest.raises(HTTPException) as exc_info:
        service.get_meeting_analysis(current_user=mock_user_model_insights, meeting_text="Test meeting text.")

    assert exc_info.value.status_code == 403
    assert "feature is not enabled" in exc_info.value.detail.lower()

def test_get_analysis_no_user_settings(mock_db_session, mock_user_model_insights, mock_tenant_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    service = MeetingInsightsService(db=mock_db_session)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=None) as mock_get_settings:
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_meeting_analysis(current_user=mock_user_model_insights, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 402
        assert "api key for meeting insights not found" in exc_info.value.detail.lower()
        mock_get_settings.assert_called_once_with(mock_db_session, user_id=mock_user_model_insights.id)

def test_get_analysis_no_api_key_in_settings(mock_db_session, mock_user_model_insights, mock_tenant_model_insights, mock_user_setting_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    mock_user_setting_model_insights.api_keys = json.dumps({}) # No specific key
    service = MeetingInsightsService(db=mock_db_session)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_insights):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_meeting_analysis(current_user=mock_user_model_insights, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 402
        assert "'meeting_insights_service_key' is missing" in exc_info.value.detail.lower()

def test_get_analysis_empty_api_key(mock_db_session, mock_user_model_insights, mock_tenant_model_insights, mock_user_setting_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    mock_user_setting_model_insights.api_keys = json.dumps({"meeting_insights_service_key": ""})
    service = MeetingInsightsService(db=mock_db_session)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_insights):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_meeting_analysis(current_user=mock_user_model_insights, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 400
        assert "api key must be provided" in exc_info.value.detail.lower()

def test_get_analysis_invalid_api_key_external_error(mock_db_session, mock_user_model_insights, mock_tenant_model_insights, mock_user_setting_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    mock_user_setting_model_insights.api_keys = json.dumps({"meeting_insights_service_key": "invalid_meeting_key"})
    service = MeetingInsightsService(db=mock_db_session)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_insights):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_meeting_analysis(current_user=mock_user_model_insights, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 400
        assert "invalid api key provided" in exc_info.value.detail.lower()

def test_get_analysis_user_not_in_tenant(mock_db_session, mock_user_model_insights):
    # Arrange
    mock_user_model_insights.tenants = []
    service = MeetingInsightsService(db=mock_db_session)

    # Action & Assertion
    with pytest.raises(HTTPException) as exc_info:
        service.get_meeting_analysis(current_user=mock_user_model_insights, meeting_text="Test meeting text.")

    assert exc_info.value.status_code == 403
    assert "user not associated with any tenant" in exc_info.value.detail.lower()

def test_get_analysis_corrupted_tenant_features_json(mock_db_session, mock_user_model_insights, mock_tenant_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = '{"meeting_insights": True' # Malformed JSON
    service = MeetingInsightsService(db=mock_db_session)

    # Action & Assertion
    with pytest.raises(HTTPException) as exc_info:
        service.get_meeting_analysis(current_user=mock_user_model_insights, meeting_text="Test meeting text.")

    assert exc_info.value.status_code == 500
    assert "error reading tenant configuration" in exc_info.value.detail.lower()

def test_get_analysis_corrupted_user_settings_api_keys_json(mock_db_session, mock_user_model_insights, mock_tenant_model_insights, mock_user_setting_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    mock_user_setting_model_insights.api_keys = '{"meeting_insights_service_key": "valid"' # Malformed JSON
    service = MeetingInsightsService(db=mock_db_session)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_insights):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_meeting_analysis(current_user=mock_user_model_insights, meeting_text="Test meeting text.")

        assert exc_info.value.status_code == 500
        assert "error parsing your api key settings" in exc_info.value.detail.lower()

def test_get_analysis_empty_input_text_error_from_client(mock_db_session, mock_user_model_insights, mock_tenant_model_insights, mock_user_setting_model_insights, mock_tenant_user_link_insights):
    # Arrange
    mock_tenant_model_insights.features = {"meeting_insights": True}
    service = MeetingInsightsService(db=mock_db_session)
    meeting_text = "" # Empty text

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_insights):
        # Action
        with pytest.raises(HTTPException) as exc_info:
            service.get_meeting_analysis(current_user=mock_user_model_insights, meeting_text=meeting_text)

        # Assertion
        assert exc_info.value.status_code == 400 # As per service logic for client error
        assert "input meeting text cannot be empty" in exc_info.value.detail.lower()

def test_get_analysis_tenant_link_missing_tenant_attr(mock_db_session, mock_user_model_insights):
    # Arrange
    mock_bad_link = MagicMock(spec=TenantUserModel)
    mock_bad_link.user_id = mock_user_model_insights.id
    mock_bad_link.tenant_id = 1
    del mock_bad_link.tenant # Simulate missing attribute

    mock_user_model_insights.tenants = [mock_bad_link]
    service = MeetingInsightsService(db=mock_db_session)

    # Action & Assertion
    with pytest.raises(HTTPException) as exc_info:
        service.get_meeting_analysis(current_user=mock_user_model_insights, meeting_text="Test meeting text.")

    assert exc_info.value.status_code == 500
    assert "tenant linkage error" in exc_info.value.detail.lower()
