import pytest
import json
from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session
from fastapi import HTTPException

# Models (assuming paths, adjust if your structure is different)
from digame.app.models.user import User as UserModel
from digame.app.models.tenant import Tenant as TenantModel
from digame.app.models.tenant_user import TenantUser as TenantUserModel # For linking user to tenant
from digame.app.models.user_setting import UserSetting as UserSettingModel

# Service to test
from digame.app.services.writing_assistance_service import WritingAssistanceService, MockExternalWritingServiceClient

# CRUDs that might be used by the service (to be mocked)
# from digame.app.crud import user_crud, user_setting_crud, tenant_crud # These will be mocked

# --- Test Data Fixtures (Conceptual, replace with actual fixture management if you have it) ---

@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

@pytest.fixture
def mock_user_model():
    user = UserModel(id=1, email="test@example.com", full_name="Test User", tenants=[])
    # The `tenants` attribute should be a list that can hold TenantUserModel instances
    # In a real SQLAlchemy setup, this relationship would be managed by the ORM.
    return user

@pytest.fixture
def mock_tenant_model():
    tenant = TenantModel(
        id=1,
        name="Test Tenant",
        admin_email="admin@tenant.com",
        features={"writing_assistance": True} # Default to enabled
    )
    return tenant

@pytest.fixture
def mock_user_setting_model():
    setting = UserSettingModel(
        id=1,
        user_id=1,
        api_keys=json.dumps({"writing_service_key": "valid_key_for_premium_suggestion"})
    )
    return setting

@pytest.fixture
def mock_tenant_user_link(mock_user_model, mock_tenant_model):
    # This object links a user to a tenant.
    # In SQLAlchemy, this might be an association object or part of a many-to-many relationship.
    link = TenantUserModel(user_id=mock_user_model.id, tenant_id=mock_tenant_model.id)
    link.user = mock_user_model # Relationship attribute
    link.tenant = mock_tenant_model # Relationship attribute
    mock_user_model.tenants.append(link) # Add the link to the user's collection of tenants
    return link


# --- Tests for WritingAssistanceService ---

def test_get_suggestion_success(mock_db_session, mock_user_model, mock_tenant_model, mock_user_setting_model, mock_tenant_user_link):
    # Arrange
    # Ensure the tenant_user_link correctly associates user with tenant
    # and that tenant.features has writing_assistance enabled.
    mock_tenant_model.features = {"writing_assistance": True}
    # mock_user_model.tenants = [mock_tenant_user_link] # Handled by mock_tenant_user_link fixture

    service = WritingAssistanceService(db=mock_db_session)

    with patch('digame.app.crud.user_crud.get_user', return_value=mock_user_model) as mock_get_user, \
         patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model) as mock_get_user_setting, \
         patch('digame.app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model) as mock_get_tenant_by_id:

        # Action
        suggestion = service.get_writing_suggestion(current_user=mock_user_model, text_input="Hello world")

        # Assertion
        assert suggestion == "Premium AI suggestion for: 'Hello world'"
        mock_get_user.assert_not_called() # User passed in should be sufficient if relationships are loaded
        mock_get_user_setting.assert_called_once_with(mock_db_session, user_id=mock_user_model.id)
        # get_tenant_by_id might be called if the tenant is not directly available on the user object's relationships
        # Depending on how current_user.tenants[0].tenant is resolved by SQLAlchemy or your mocks.
        # If user.tenants[0].tenant is directly accessible as mock_tenant_model, then get_tenant_by_id may not be called.
        # The fixture setup for mock_tenant_user_link implies .tenant is directly available.


def test_get_suggestion_feature_disabled(mock_db_session, mock_user_model, mock_tenant_model, mock_tenant_user_link):
    # Arrange
    mock_tenant_model.features = {"writing_assistance": False} # Feature disabled
    # mock_user_model.tenants = [mock_tenant_user_link]

    service = WritingAssistanceService(db=mock_db_session)

    with patch('digame.app.crud.user_crud.get_user', return_value=mock_user_model), \
         patch('digame.app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model):

        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_writing_suggestion(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 403
        assert "feature is not enabled" in exc_info.value.detail.lower()


def test_get_suggestion_no_user_settings(mock_db_session, mock_user_model, mock_tenant_model, mock_tenant_user_link):
    # Arrange
    mock_tenant_model.features = {"writing_assistance": True}
    # mock_user_model.tenants = [mock_tenant_user_link]

    service = WritingAssistanceService(db=mock_db_session)

    with patch('digame.app.crud.user_crud.get_user', return_value=mock_user_model), \
         patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=None) as mock_get_user_setting, \
         patch('digame.app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model):

        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_writing_suggestion(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 402 # As per service logic
        assert "api key for writing assistance not found" in exc_info.value.detail.lower()
        mock_get_user_setting.assert_called_once_with(mock_db_session, user_id=mock_user_model.id)


def test_get_suggestion_no_api_key_in_settings(mock_db_session, mock_user_model, mock_tenant_model, mock_user_setting_model, mock_tenant_user_link):
    # Arrange
    mock_tenant_model.features = {"writing_assistance": True}
    # mock_user_model.tenants = [mock_tenant_user_link]
    mock_user_setting_model.api_keys = json.dumps({}) # No "writing_service_key"

    service = WritingAssistanceService(db=mock_db_session)

    with patch('digame.app.crud.user_crud.get_user', return_value=mock_user_model), \
         patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model), \
         patch('digame.app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model):

        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_writing_suggestion(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 402
        assert "'writing_service_key' is missing" in exc_info.value.detail.lower()


def test_get_suggestion_empty_api_key_in_settings(mock_db_session, mock_user_model, mock_tenant_model, mock_user_setting_model, mock_tenant_user_link):
    # Arrange
    mock_tenant_model.features = {"writing_assistance": True}
    # mock_user_model.tenants = [mock_tenant_user_link]
    mock_user_setting_model.api_keys = json.dumps({"writing_service_key": ""}) # Empty key

    service = WritingAssistanceService(db=mock_db_session)

    with patch('digame.app.crud.user_crud.get_user', return_value=mock_user_model), \
         patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model), \
         patch('digame.app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model):

        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_writing_suggestion(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 400 # Mock client raises ValueError for empty key
        assert "api key must be provided" in exc_info.value.detail.lower()


def test_get_suggestion_invalid_api_key_external_service_error(mock_db_session, mock_user_model, mock_tenant_model, mock_user_setting_model, mock_tenant_user_link):
    # Arrange
    mock_tenant_model.features = {"writing_assistance": True}
    # mock_user_model.tenants = [mock_tenant_user_link]
    mock_user_setting_model.api_keys = json.dumps({"writing_service_key": "invalid_key"})

    service = WritingAssistanceService(db=mock_db_session)

    with patch('digame.app.crud.user_crud.get_user', return_value=mock_user_model), \
         patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model), \
         patch('digame.app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model):

        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_writing_suggestion(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 400
        assert "invalid api key provided" in exc_info.value.detail.lower()


def test_get_suggestion_user_not_in_tenant(mock_db_session, mock_user_model):
    # Arrange
    mock_user_model.tenants = [] # User is not associated with any tenant

    service = WritingAssistanceService(db=mock_db_session)

    # We need to mock get_user to return this user whose `tenants` list is empty.
    with patch('digame.app.crud.user_crud.get_user', return_value=mock_user_model) as mock_get_user_db:

        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_writing_suggestion(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 403
        assert "user not associated with any tenant" in exc_info.value.detail.lower()
        # The service tries to reload the user if current_user.tenants is empty initially.
        mock_get_user_db.assert_called_once_with(mock_db_session, user_id=mock_user_model.id)


def test_get_suggestion_tenant_features_is_string(mock_db_session, mock_user_model, mock_tenant_model, mock_user_setting_model, mock_tenant_user_link):
    # Arrange
    mock_tenant_model.features = json.dumps({"writing_assistance": True}) # Features stored as JSON string
    # mock_user_model.tenants = [mock_tenant_user_link]

    service = WritingAssistanceService(db=mock_db_session)

    with patch('digame.app.crud.user_crud.get_user', return_value=mock_user_model), \
         patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model), \
         patch('digame.app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model):

        suggestion = service.get_writing_suggestion(current_user=mock_user_model, text_input="Hello JSON features")
        assert suggestion == "Premium AI suggestion for: 'Hello JSON features'"


def test_get_suggestion_tenant_features_malformed_json_string(mock_db_session, mock_user_model, mock_tenant_model, mock_tenant_user_link):
    # Arrange
    mock_tenant_model.features = '{"writing_assistance": True' # Malformed JSON
    # mock_user_model.tenants = [mock_tenant_user_link]

    service = WritingAssistanceService(db=mock_db_session)

    with patch('digame.app.crud.user_crud.get_user', return_value=mock_user_model), \
         patch('digame.app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model):

        with pytest.raises(HTTPException) as exc_info:
            service.get_writing_suggestion(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 500
        assert "error parsing tenant features" in exc_info.value.detail.lower()


def test_get_suggestion_api_keys_malformed_json_string(mock_db_session, mock_user_model, mock_tenant_model, mock_user_setting_model, mock_tenant_user_link):
    # Arrange
    mock_tenant_model.features = {"writing_assistance": True}
    # mock_user_model.tenants = [mock_tenant_user_link]
    mock_user_setting_model.api_keys = '{"writing_service_key": "valid"' # Malformed JSON

    service = WritingAssistanceService(db=mock_db_session)

    with patch('digame.app.crud.user_crud.get_user', return_value=mock_user_model), \
         patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model), \
         patch('digame.app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model):

        with pytest.raises(HTTPException) as exc_info:
            service.get_writing_suggestion(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 500
        assert "error parsing your api key settings" in exc_info.value.detail.lower()

def test_get_suggestion_user_tenant_link_no_tenant_attribute(mock_db_session, mock_user_model, mock_tenant_model, mock_user_setting_model):
    # Scenario where user_tenant_link.tenant is None, but user_tenant_link.tenant_id exists
    # This tests the fallback to tenant_crud.get_tenant_by_id

    # Arrange
    mock_user_no_direct_tenant = UserModel(id=2, email="test2@example.com", full_name="Test User 2", tenants=[])

    # Create a mock TenantUser link that does *not* have the .tenant attribute directly populated
    # but *does* have tenant_id.
    mock_link_no_direct_tenant_obj = MagicMock(spec=TenantUserModel)
    mock_link_no_direct_tenant_obj.user_id = mock_user_no_direct_tenant.id
    mock_link_no_direct_tenant_obj.tenant_id = mock_tenant_model.id
    del mock_link_no_direct_tenant_obj.tenant # Ensure .tenant attribute is missing to trigger fallback

    mock_user_no_direct_tenant.tenants.append(mock_link_no_direct_tenant_obj)

    mock_tenant_model.features = {"writing_assistance": True}

    service = WritingAssistanceService(db=mock_db_session)

    with patch('digame.app.crud.user_crud.get_user', return_value=mock_user_no_direct_tenant) as mock_get_user, \
         patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model) as mock_get_user_setting, \
         patch('digame.app.crud.tenant_crud.get_tenant_by_id', return_value=mock_tenant_model) as mock_get_tenant_by_id_call:

        # Action
        suggestion = service.get_writing_suggestion(current_user=mock_user_no_direct_tenant, text_input="Hello fallback")

        # Assertion
        assert suggestion == "Premium AI suggestion for: 'Hello fallback'"
        mock_get_user.assert_not_called() # User provided, relationships being tested
        mock_get_user_setting.assert_called_once_with(mock_db_session, user_id=mock_user_no_direct_tenant.id)
        mock_get_tenant_by_id_call.assert_called_once_with(mock_db_session, mock_link_no_direct_tenant_obj.tenant_id)

def test_get_suggestion_user_tenant_link_no_tenant_id_either(mock_db_session, mock_user_model):
    # Scenario where user_tenant_link.tenant is None, AND tenant_id is also not on the link.
    # This should result in "Tenant information not found".

    # Arrange
    mock_user_no_tenant_info = UserModel(id=3, email="test3@example.com", full_name="Test User 3", tenants=[])

    mock_link_no_tenant_info_obj = MagicMock(spec=TenantUserModel)
    mock_link_no_tenant_info_obj.user_id = mock_user_no_tenant_info.id
    # Crucially, tenant_id is NOT set on this mock link object.
    # And .tenant attribute is also missing.
    if hasattr(mock_link_no_tenant_info_obj, 'tenant_id'): # defensive delete
        del mock_link_no_tenant_info_obj.tenant_id
    if hasattr(mock_link_no_tenant_info_obj, 'tenant'): # defensive delete
        del mock_link_no_tenant_info_obj.tenant

    mock_user_no_tenant_info.tenants.append(mock_link_no_tenant_info_obj)

    service = WritingAssistanceService(db=mock_db_session)

    with patch('digame.app.crud.user_crud.get_user', return_value=mock_user_no_tenant_info), \
         patch('digame.app.crud.tenant_crud.get_tenant_by_id', return_value=None) as mock_get_tenant_call: # get_tenant_by_id will be called but return None

        with pytest.raises(HTTPException) as exc_info:
            service.get_writing_suggestion(current_user=mock_user_no_tenant_info, text_input="Test")

        assert exc_info.value.status_code == 403
        assert "tenant information not found for user" in exc_info.value.detail.lower()
        # Because tenant_id is not on the link, get_tenant_by_id should NOT be called.
        # The service should detect this before trying to call tenant_crud.get_tenant_by_id
        # based on the code: `if hasattr(user_tenant_link, 'tenant_id'): tenant = tenant_crud.get_tenant_by_id(...) else: tenant = None`
        mock_get_tenant_call.assert_not_called()

def test_get_suggestion_no_user_tenants_after_reload(mock_db_session, mock_user_model):
    # Test the scenario where the initial current_user.tenants is empty,
    # and even after trying to reload the user from DB, the tenants list is still empty.

    # Arrange
    mock_user_model.tenants = [] # Initial user object has no tenants

    # Mock user_crud.get_user to return a user that also has no tenants
    reloaded_user_still_no_tenants = UserModel(id=mock_user_model.id, email=mock_user_model.email, tenants=[])

    service = WritingAssistanceService(db=mock_db_session)

    with patch('digame.app.crud.user_crud.get_user', return_value=reloaded_user_still_no_tenants) as mock_get_user_db:

        # Action & Assertion
        with pytest.raises(HTTPException) as exc_info:
            service.get_writing_suggestion(current_user=mock_user_model, text_input="Test")

        assert exc_info.value.status_code == 403
        assert "user not associated with any tenant or tenant info missing" in exc_info.value.detail.lower()
        mock_get_user_db.assert_called_once_with(mock_db_session, user_id=mock_user_model.id)

# Ensure all necessary imports for models and service are correct at the top of the file.
# The paths used like 'digame.app.crud.user_crud' assume that these modules can be found.
# If your project structure or import paths are different, these will need adjustment.
# For example, if crud modules are directly under 'digame.app.crud', then it's fine.
# If they are in sub-packages of crud, the patch paths might need to be more specific.
# e.g. from ..crud import user_crud (if tests are in a subpackage of app)
# or from app.crud import user_crud (if tests are outside app, and app is in PYTHONPATH)
# The current patch paths are typical for tests within an 'app' package.
# `from digame.app.models.user import User as UserModel` implies `digame` is a top-level package.
# If tests are run from the project root, this should work if `digame` is indeed the main package directory.
# This structure assumes `digame/app/tests/services` and `digame/app/services`.
# The patch target 'digame.app.crud.user_crud' means that *within the WritingAssistanceService file*,
# it's expected to find `user_crud` via an import that resolves to that path.
# So, `writing_assistance_service.py` should have something like `from digame.app.crud import user_crud`.
# If it has `from ..crud import user_crud`, then the patch path might need to be relative from the service's perspective or absolute.
# For simplicity and robustness, absolute patch paths like 'digame.app.crud.user_crud' are generally preferred if your PYTHONPATH is set up for it.
