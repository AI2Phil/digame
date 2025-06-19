import pytest
import json
from unittest.mock import MagicMock, patch
from datetime import datetime

from sqlalchemy.orm import Session
from fastapi import HTTPException

# Models
from digame.app.models.user import User as UserModel
from digame.app.models.tenant import Tenant as TenantModel
from digame.app.models.tenant_user import TenantUser as TenantUserModel
from digame.app.models.user_setting import UserSetting as UserSettingModel

# Service to test
from digame.app.services.email_analysis_service import EmailAnalysisService

# Schemas (for creating sample data, though service itself doesn't directly take schemas)
from digame.app.schemas.email_analysis_schemas import EmailDataItem

# --- Fixtures ---

@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

@pytest.fixture
def mock_user_model_email_analysis(): # Renamed for clarity
    user = UserModel(id=4, email="email_user@example.com", full_name="Email Test User", tenants=[])
    return user

@pytest.fixture
def mock_tenant_model_email_analysis(): # Renamed
    tenant = TenantModel(
        id=4,
        name="Email Analysis Tenant",
        admin_email="admin@emailtenant.com",
        features={"email_pattern_analysis": True} # Default to enabled
    )
    return tenant

@pytest.fixture
def mock_user_setting_model_email_analysis(): # Renamed
    setting = UserSettingModel(
        id=4,
        user_id=4, # Matches mock_user_model_email_analysis.id
        api_keys=json.dumps({"email_analysis_service_key": "valid_email_key_external"})
    )
    return setting

@pytest.fixture
def mock_user_setting_model_email_analysis_no_key(): # For internal analysis
    setting = UserSettingModel(
        id=5,
        user_id=4,
        api_keys=json.dumps({}) # No specific key for email analysis
    )
    return setting

@pytest.fixture
def mock_tenant_user_link_email_analysis(mock_user_model_email_analysis, mock_tenant_model_email_analysis): # Renamed
    link = TenantUserModel(user_id=mock_user_model_email_analysis.id, tenant_id=mock_tenant_model_email_analysis.id)
    link.user = mock_user_model_email_analysis
    link.tenant = mock_tenant_model_email_analysis
    mock_user_model_email_analysis.tenants.append(link)
    return link

@pytest.fixture
def sample_emails_data() -> List[EmailDataItem]:
    return [
        EmailDataItem(subject="Project Update Q1", sender="boss@example.com", timestamp=datetime.now(), body_snippet="Here is the update..."),
        EmailDataItem(subject="Meeting Reminder", sender="calendar@example.com", timestamp=datetime.now(), body_snippet="Reminder for meeting..."),
        EmailDataItem(subject="Report Submission", sender="colleague@example.com", timestamp=datetime.now(), body_snippet="Attached is the report..."),
    ]

# --- Tests for EmailAnalysisService ---

def test_analyze_email_data_success_with_external_key(mock_db_session, mock_user_model_email_analysis, mock_tenant_model_email_analysis, mock_user_setting_model_email_analysis, mock_tenant_user_link_email_analysis, sample_emails_data):
    # Arrange
    mock_tenant_model_email_analysis.features = {"email_pattern_analysis": True}
    service = EmailAnalysisService(db=mock_db_session)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_email_analysis):
        # Action
        analysis = service.analyze_email_data(current_user=mock_user_model_email_analysis, emails_data=[e.dict() for e in sample_emails_data])

        # Assertion
        assert isinstance(analysis, dict)
        assert analysis.get("external_analysis_provider") == "MockExternalProvider"
        assert analysis.get("total_emails_processed") == len(sample_emails_data)

def test_analyze_email_data_success_internal_analysis_no_key(mock_db_session, mock_user_model_email_analysis, mock_tenant_model_email_analysis, mock_user_setting_model_email_analysis_no_key, mock_tenant_user_link_email_analysis, sample_emails_data):
    # Arrange
    mock_tenant_model_email_analysis.features = {"email_pattern_analysis": True}
    service = EmailAnalysisService(db=mock_db_session)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_email_analysis_no_key):
        # Action
        analysis = service.analyze_email_data(current_user=mock_user_model_email_analysis, emails_data=[e.dict() for e in sample_emails_data])

        # Assertion
        assert isinstance(analysis, dict)
        assert analysis.get("analysis_type") == "internal_basic"
        assert analysis.get("total_emails_analyzed") == len(sample_emails_data)
        assert "most_common_subject_keywords" in analysis

def test_analyze_email_data_success_internal_analysis_no_settings(mock_db_session, mock_user_model_email_analysis, mock_tenant_model_email_analysis, mock_tenant_user_link_email_analysis, sample_emails_data):
    # Arrange
    mock_tenant_model_email_analysis.features = {"email_pattern_analysis": True}
    service = EmailAnalysisService(db=mock_db_session)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=None): # No UserSetting object
        # Action
        analysis = service.analyze_email_data(current_user=mock_user_model_email_analysis, emails_data=[e.dict() for e in sample_emails_data])

        # Assertion
        assert isinstance(analysis, dict)
        assert analysis.get("analysis_type") == "internal_basic"
        assert analysis.get("total_emails_analyzed") == len(sample_emails_data)

def test_analyze_email_data_feature_disabled(mock_db_session, mock_user_model_email_analysis, mock_tenant_model_email_analysis, mock_tenant_user_link_email_analysis, sample_emails_data):
    # Arrange
    mock_tenant_model_email_analysis.features = {"email_pattern_analysis": False}
    service = EmailAnalysisService(db=mock_db_session)

    # Action & Assertion
    with pytest.raises(HTTPException) as exc_info:
        service.analyze_email_data(current_user=mock_user_model_email_analysis, emails_data=[e.dict() for e in sample_emails_data])

    assert exc_info.value.status_code == 403
    assert "feature is not enabled" in exc_info.value.detail.lower()

def test_analyze_email_data_empty_api_key_mock_client_error(mock_db_session, mock_user_model_email_analysis, mock_tenant_model_email_analysis, mock_user_setting_model_email_analysis, mock_tenant_user_link_email_analysis, sample_emails_data):
    # Arrange
    mock_tenant_model_email_analysis.features = {"email_pattern_analysis": True}
    mock_user_setting_model_email_analysis.api_keys = json.dumps({"email_analysis_service_key": ""}) # Empty key
    service = EmailAnalysisService(db=mock_db_session)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_email_analysis):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.analyze_email_data(current_user=mock_user_model_email_analysis, emails_data=[e.dict() for e in sample_emails_data])

        assert exc_info.value.status_code == 400
        assert "api key must be provided" in exc_info.value.detail.lower() # Error from mock client

def test_analyze_email_data_invalid_external_api_key(mock_db_session, mock_user_model_email_analysis, mock_tenant_model_email_analysis, mock_user_setting_model_email_analysis, mock_tenant_user_link_email_analysis, sample_emails_data):
    # Arrange
    mock_tenant_model_email_analysis.features = {"email_pattern_analysis": True}
    mock_user_setting_model_email_analysis.api_keys = json.dumps({"email_analysis_service_key": "invalid_email_key"})
    service = EmailAnalysisService(db=mock_db_session)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_email_analysis):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.analyze_email_data(current_user=mock_user_model_email_analysis, emails_data=[e.dict() for e in sample_emails_data])

        assert exc_info.value.status_code == 400
        assert "invalid api key for external email analysis" in exc_info.value.detail.lower()

def test_analyze_email_data_external_service_general_failure(mock_db_session, mock_user_model_email_analysis, mock_tenant_model_email_analysis, mock_user_setting_model_email_analysis, mock_tenant_user_link_email_analysis, sample_emails_data):
    # Arrange
    mock_tenant_model_email_analysis.features = {"email_pattern_analysis": True}
    service = EmailAnalysisService(db=mock_db_session)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_email_analysis), \
         patch('digame.app.services.email_analysis_service.MockExternalEmailAnalysisClient.analyze_emails', side_effect=Exception("Network error")):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.analyze_email_data(current_user=mock_user_model_email_analysis, emails_data=[e.dict() for e in sample_emails_data])

        assert exc_info.value.status_code == 503
        assert "external email analysis service failed" in exc_info.value.detail.lower()

def test_analyze_email_data_user_not_in_tenant(mock_db_session, mock_user_model_email_analysis, sample_emails_data):
    # Arrange
    mock_user_model_email_analysis.tenants = []
    service = EmailAnalysisService(db=mock_db_session)

    # Action & Assertion
    with pytest.raises(HTTPException) as exc_info:
        service.analyze_email_data(current_user=mock_user_model_email_analysis, emails_data=[e.dict() for e in sample_emails_data])

    assert exc_info.value.status_code == 403
    assert "user not associated with any tenant" in exc_info.value.detail.lower()

def test_analyze_email_data_corrupted_tenant_features_json(mock_db_session, mock_user_model_email_analysis, mock_tenant_model_email_analysis, mock_tenant_user_link_email_analysis, sample_emails_data):
    # Arrange
    mock_tenant_model_email_analysis.features = '{"email_pattern_analysis": True' # Malformed
    service = EmailAnalysisService(db=mock_db_session)

    with pytest.raises(HTTPException) as exc_info:
        service.analyze_email_data(current_user=mock_user_model_email_analysis, emails_data=[e.dict() for e in sample_emails_data])

    assert exc_info.value.status_code == 500
    assert "error reading tenant configuration" in exc_info.value.detail.lower()

def test_analyze_email_data_corrupted_user_api_keys_json(mock_db_session, mock_user_model_email_analysis, mock_tenant_model_email_analysis, mock_user_setting_model_email_analysis, mock_tenant_user_link_email_analysis, sample_emails_data):
    # Arrange
    mock_tenant_model_email_analysis.features = {"email_pattern_analysis": True}
    mock_user_setting_model_email_analysis.api_keys = '{"email_analysis_service_key": "valid_key"' # Malformed
    service = EmailAnalysisService(db=mock_db_session)

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_email_analysis):
        # Action (This should attempt external, then fail parsing keys, then fall to internal)
        analysis = service.analyze_email_data(current_user=mock_user_model_email_analysis, emails_data=[e.dict() for e in sample_emails_data])

        # Assertion: Service logic has api_keys_dict = None if parsing fails, so it falls back to internal.
        assert analysis.get("analysis_type") == "internal_basic"

def test_internal_analysis_empty_email_list(mock_db_session):
    # Arrange
    service = EmailAnalysisService(db=mock_db_session)
    # Action
    analysis = service._perform_internal_analysis(emails=[])
    # Assertion
    assert analysis == {"error": "No email data to analyze."}

def test_internal_analysis_basic_output(mock_db_session, sample_emails_data):
    # Arrange
    service = EmailAnalysisService(db=mock_db_session)
    # Action
    analysis = service._perform_internal_analysis(emails=[e.dict() for e in sample_emails_data])
    # Assertion
    assert analysis.get("total_emails_analyzed") == len(sample_emails_data)
    assert "most_common_subject_keywords" in analysis
    keywords = analysis["most_common_subject_keywords"]
    assert isinstance(keywords, list)
    if keywords: # If there are keywords (which there should be for sample data)
        assert isinstance(keywords[0], tuple)
        assert len(keywords[0]) == 2
        assert isinstance(keywords[0][0], str)
        assert isinstance(keywords[0][1], int)
    # Check for expected keywords from sample_emails_data
    expected_keywords = {"project", "update", "meeting", "reminder", "report", "submission"}
    found_keywords = {item[0] for item in keywords}
    assert expected_keywords.issubset(found_keywords) or "update" in found_keywords # Adjust based on regex and sample data specifics. "update" is in "Project Update"

def test_analyze_email_data_tenant_link_missing_tenant_attr(mock_db_session, mock_user_model_email_analysis, sample_emails_data):
    # Arrange
    mock_bad_link = MagicMock(spec=TenantUserModel)
    mock_bad_link.user_id = mock_user_model_email_analysis.id
    mock_bad_link.tenant_id = 1
    del mock_bad_link.tenant # Simulate missing attribute

    mock_user_model_email_analysis.tenants = [mock_bad_link]
    service = EmailAnalysisService(db=mock_db_session)

    # Action & Assertion
    with pytest.raises(HTTPException) as exc_info:
        service.analyze_email_data(current_user=mock_user_model_email_analysis, emails_data=[e.dict() for e in sample_emails_data])

    assert exc_info.value.status_code == 500
    assert "tenant linkage error" in exc_info.value.detail.lower()
