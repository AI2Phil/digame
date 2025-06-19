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
from digame.app.services.language_learning_service import LanguageLearningService

# --- Fixtures ---

@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

@pytest.fixture
def mock_user_model_lang_learn(): # Renamed for clarity
    user = UserModel(id=5, email="lang_user@example.com", full_name="Language Test User", tenants=[])
    return user

@pytest.fixture
def mock_tenant_model_lang_learn(): # Renamed
    tenant = TenantModel(
        id=5,
        name="Language Learning Tenant",
        admin_email="admin@langtenant.com",
        features={"language_learning_support": True} # Default to enabled
    )
    return tenant

@pytest.fixture
def mock_user_setting_model_lang_learn(): # Renamed
    setting = UserSettingModel(
        id=5,
        user_id=5, # Matches mock_user_model_lang_learn.id
        api_keys=json.dumps({"language_learning_api_key": "valid_lang_key_mock"})
    )
    return setting

@pytest.fixture
def mock_tenant_user_link_lang_learn(mock_user_model_lang_learn, mock_tenant_model_lang_learn): # Renamed
    link = TenantUserModel(user_id=mock_user_model_lang_learn.id, tenant_id=mock_tenant_model_lang_learn.id)
    link.user = mock_user_model_lang_learn
    link.tenant = mock_tenant_model_lang_learn
    mock_user_model_lang_learn.tenants.append(link)
    return link

# --- Tests for LanguageLearningService: Translation ---

def test_translate_success(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    service = LanguageLearningService(db=mock_db_session)
    text, target_lang, source_lang = "Hello", "es", "en"

    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        # Action
        result = service.translate_text(mock_user_model_lang_learn, text, target_lang, source_lang)
        # Assertion
        assert result["original_text"] == text
        assert "Mock translated" in result["translated_text"]
        assert result["target_language"] == target_lang
        assert result["source_language"] == source_lang

def test_translate_feature_disabled(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = {"language_learning_support": False}
    service = LanguageLearningService(db=mock_db_session)
    # Action & Assertion
    with pytest.raises(HTTPException) as exc:
        service.translate_text(mock_user_model_lang_learn, "text", "es")
    assert exc.value.status_code == 403
    assert "feature is not enabled" in exc.value.detail.lower()

def test_translate_no_user_settings(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=None):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc:
            service.translate_text(mock_user_model_lang_learn, "text", "es")
        assert exc.value.status_code == 402
        assert "api key 'language_learning_api_key' not found" in exc.value.detail.lower()

def test_translate_no_api_key_in_settings(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = json.dumps({}) # Empty dict
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc:
            service.translate_text(mock_user_model_lang_learn, "text", "es")
        assert exc.value.status_code == 402
        assert "'language_learning_api_key' is missing" in exc.value.detail.lower()

def test_translate_empty_api_key(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = json.dumps({"language_learning_api_key": ""})
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc:
            service.translate_text(mock_user_model_lang_learn, "text", "es")
        assert exc.value.status_code == 400 # Mock client raises ValueError
        assert "api key must be provided" in exc.value.detail.lower()

def test_translate_invalid_external_api_key(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = json.dumps({"language_learning_api_key": "invalid_lang_key"})
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc:
            service.translate_text(mock_user_model_lang_learn, "text", "es")
        assert exc.value.status_code == 400
        assert "invalid api key" in exc.value.detail.lower()

def test_translate_external_service_general_failure(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn), \
         patch('digame.app.services.language_learning_service.MockExternalLanguageClient.translate', side_effect=Exception("Network Timeout")):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc:
            service.translate_text(mock_user_model_lang_learn, "text", "es")
        assert exc.value.status_code == 503
        assert "external language learning service failed" in exc.value.detail.lower()

def test_translate_user_not_in_tenant(mock_db_session, mock_user_model_lang_learn):
    # Arrange
    mock_user_model_lang_learn.tenants = []
    service = LanguageLearningService(db=mock_db_session)
    # Action & Assertion
    with pytest.raises(HTTPException) as exc:
        service.translate_text(mock_user_model_lang_learn, "text", "es")
    assert exc.value.status_code == 403
    assert "user not associated with any tenant" in exc.value.detail.lower()

def test_translate_corrupted_tenant_features_json(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = '{"language_learning_support": True' # Malformed
    service = LanguageLearningService(db=mock_db_session)
    with pytest.raises(HTTPException) as exc:
        service.translate_text(mock_user_model_lang_learn, "text", "es")
    assert exc.value.status_code == 500
    assert "error reading tenant configuration" in exc.value.detail.lower()

def test_translate_corrupted_user_api_keys_json(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = '{"language_learning_api_key": "valid"' # Malformed
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        with pytest.raises(HTTPException) as exc:
            service.translate_text(mock_user_model_lang_learn, "text", "es")
        assert exc.value.status_code == 500
        assert "error parsing your api key settings" in exc.value.detail.lower()

def test_translate_invalid_input_to_mock_client(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc:
            service.translate_text(mock_user_model_lang_learn, "", "es") # Empty text
        assert exc.value.status_code == 400
        assert "text and target language are required" in exc.value.detail.lower()

# --- Tests for LanguageLearningService: Definition ---

def test_define_success(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    service = LanguageLearningService(db=mock_db_session)
    word, language = "casa", "es"
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        # Action
        result = service.get_vocabulary_definition(mock_user_model_lang_learn, word, language)
        # Assertion
        assert result["word"] == word
        assert "Mock definition for" in result["definition"]
        assert result["language"] == language

def test_define_feature_disabled(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = {"language_learning_support": False}
    service = LanguageLearningService(db=mock_db_session)
    with pytest.raises(HTTPException) as exc:
        service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
    assert exc.value.status_code == 403

def test_define_no_user_settings(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=None):
        with pytest.raises(HTTPException) as exc:
            service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
        assert exc.value.status_code == 402

def test_define_no_api_key_in_settings(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = json.dumps({})
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        with pytest.raises(HTTPException) as exc:
            service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
        assert exc.value.status_code == 402

def test_define_empty_api_key(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = json.dumps({"language_learning_api_key": ""})
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        with pytest.raises(HTTPException) as exc:
            service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
        assert exc.value.status_code == 400

def test_define_invalid_external_api_key(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = json.dumps({"language_learning_api_key": "invalid_lang_key"})
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        with pytest.raises(HTTPException) as exc:
            service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
        assert exc.value.status_code == 400

def test_define_external_service_general_failure(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn), \
         patch('digame.app.services.language_learning_service.MockExternalLanguageClient.define_word', side_effect=Exception("Definition service down")):
        with pytest.raises(HTTPException) as exc:
            service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
        assert exc.value.status_code == 503

def test_define_user_not_in_tenant(mock_db_session, mock_user_model_lang_learn):
    # Arrange
    mock_user_model_lang_learn.tenants = []
    service = LanguageLearningService(db=mock_db_session)
    with pytest.raises(HTTPException) as exc:
        service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
    assert exc.value.status_code == 403

def test_define_corrupted_tenant_features_json(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = '{"language_learning_support": True' # Malformed
    service = LanguageLearningService(db=mock_db_session)
    with pytest.raises(HTTPException) as exc:
        service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
    assert exc.value.status_code == 500

def test_define_corrupted_user_api_keys_json(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = '{"language_learning_api_key": "valid"' # Malformed
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        with pytest.raises(HTTPException) as exc:
            service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
        assert exc.value.status_code == 500

def test_define_invalid_input_to_mock_client(mock_db_session, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    service = LanguageLearningService(db=mock_db_session)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        with pytest.raises(HTTPException) as exc:
            service.get_vocabulary_definition(mock_user_model_lang_learn, "", "en") # Empty word
        assert exc.value.status_code == 400
        assert "word and language are required" in exc.value.detail.lower()
