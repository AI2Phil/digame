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
from app.services.language_learning_service import LanguageLearningService



# --- Fixtures ---

@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

@pytest.fixture
def mock_ai_integration_service():
    from app.services.ai_integration_service import AIIntegrationService
    return MagicMock(spec=AIIntegrationService)

@pytest.fixture
def mock_user_model_lang_learn(): # Renamed for clarity
    user = create_mock_model(UserModel, id=5, email="lang_user@example.com", full_name="Language Test User", tenant_id=5)
    return user

@pytest.fixture
def mock_tenant_model_lang_learn(): # Renamed
    tenant = create_mock_model(TenantModel, id=5,
        name="Language Learning Tenant",
        admin_email="admin@langtenant.com",
        features={"language_learning_support": True} # Default to enabled
    )
    return tenant

@pytest.fixture
def mock_user_setting_model_lang_learn(): # Renamed
    setting = create_mock_model(UserSettingModel, id=5,
        user_id=5, # Matches mock_user_model_lang_learn.id
        api_keys=json.dumps({"language_learning_api_key": "valid_lang_key_mock"})
    )
    return setting

@pytest.fixture
def mock_tenant_user_link_lang_learn(mock_user_model_lang_learn, mock_tenant_model_lang_learn): # Renamed
    # Set up the direct relationship - user belongs to tenant
    mock_user_model_lang_learn.tenant_id = mock_tenant_model_lang_learn.id
    mock_user_model_lang_learn.tenant = mock_tenant_model_lang_learn
    return mock_user_model_lang_learn  # Return the user since there's no separate link object

# --- Tests for LanguageLearningService: Translation ---
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


@pytest.mark.asyncio
async def test_translate_success(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = {"language_learning_support": True}
    mock_user_setting_model_lang_learn.api_keys = json.dumps({"openai_api_key": "valid_lang_key_mock"})
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    text, target_lang, source_lang = "Hello", "es", "en"

    # Mock the AI integration service response
    mock_ai_integration_service.make_request.return_value = {
        "choices": [{
            "message": {
                "content": json.dumps({
                    "original_text": text,
                    "translated_text": "Hola",
                    "target_language": target_lang,
                    "detected_source_language": source_lang
                })
            }
        }]
    }

    with patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        # Action
        result = await service.translate_text(mock_user_model_lang_learn, text, target_lang, source_lang)
        # Assertion
        assert result["original_text"] == text
        assert result["translated_text"] == "Hola"
        assert result["target_language"] == target_lang
        assert result["source_language"] == source_lang

@pytest.mark.asyncio
async def test_translate_feature_disabled(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = {"language_learning_support": False}
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    # Action & Assertion
    with pytest.raises(HTTPException) as exc:
        await service.translate_text(mock_user_model_lang_learn, "text", "es")
    assert exc.value.status_code == 403
    assert "feature is not enabled" in exc.value.detail.lower()

@pytest.mark.asyncio
async def test_translate_no_user_settings(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with patch('app.crud.user_setting_crud.get_user_setting', return_value=None):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc:
            await service.translate_text(mock_user_model_lang_learn, "text", "es")
        assert exc.value.status_code == 402
        assert "openai_api_key" in exc.value.detail.lower()

@pytest.mark.asyncio
async def test_translate_no_api_key_in_settings(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = json.dumps({}) # Empty dict
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc:
            await service.translate_text(mock_user_model_lang_learn, "text", "es")
        assert exc.value.status_code == 402
        assert "openai_api_key" in exc.value.detail.lower()

@pytest.mark.asyncio
async def test_translate_empty_api_key(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = json.dumps({"openai_api_key": ""})
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc:
            await service.translate_text(mock_user_model_lang_learn, "text", "es")
        assert exc.value.status_code == 402
        assert "openai_api_key" in exc.value.detail.lower()

@pytest.mark.asyncio
async def test_translate_invalid_external_api_key(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = {"language_learning_support": True}
    mock_user_setting_model_lang_learn.api_keys = json.dumps({"openai_api_key": "invalid_lang_key"})
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    
    # Mock AI service to raise an exception for invalid API key
    mock_ai_integration_service.make_request.side_effect = Exception("Invalid API key")
    
    with patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc:
            await service.translate_text(mock_user_model_lang_learn, "text", "es")
        assert exc.value.status_code == 503
        assert "translation request to ai provider failed" in exc.value.detail.lower()

@pytest.mark.asyncio
async def test_translate_external_service_general_failure(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = {"language_learning_support": True}
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    
    # Mock AI service to raise a general exception
    mock_ai_integration_service.make_request.side_effect = Exception("Network Timeout")
    
    with patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc:
            await service.translate_text(mock_user_model_lang_learn, "text", "es")
        assert exc.value.status_code == 503
        assert "translation request to ai provider failed" in exc.value.detail.lower()

@pytest.mark.asyncio
async def test_translate_user_not_in_tenant(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn):
    # Arrange
    mock_user_model_lang_learn.tenant_id = None  # User not associated with any tenant
    mock_user_model_lang_learn.tenant = None
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    # Action & Assertion
    with pytest.raises(HTTPException) as exc:
        await service.translate_text(mock_user_model_lang_learn, "text", "es")
    assert exc.value.status_code == 403
    assert "user not associated with any tenant" in exc.value.detail.lower()

@pytest.mark.asyncio
async def test_translate_corrupted_tenant_features_json(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = '{"language_learning_support": True' # Malformed
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with pytest.raises(HTTPException) as exc:
        await service.translate_text(mock_user_model_lang_learn, "text", "es")
    assert exc.value.status_code == 500
    assert "error parsing tenant features" in exc.value.detail.lower()

@pytest.mark.asyncio
async def test_translate_corrupted_user_api_keys_json(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = {"language_learning_support": True}
    mock_user_setting_model_lang_learn.api_keys = '{"openai_api_key": "valid"' # Malformed
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        with pytest.raises(HTTPException) as exc:
            await service.translate_text(mock_user_model_lang_learn, "text", "es")
        assert exc.value.status_code == 500
        assert "error parsing your api key settings" in exc.value.detail.lower()

@pytest.mark.asyncio
async def test_translate_invalid_input_to_mock_client(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = {"language_learning_support": True}
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        # Action & Assertion
        with pytest.raises(HTTPException) as exc:
            await service.translate_text(mock_user_model_lang_learn, "", "es") # Empty text
        assert exc.value.status_code == 400
        assert "text to translate cannot be empty" in exc.value.detail.lower()

# --- Tests for LanguageLearningService: Definition ---

@pytest.mark.asyncio
async def test_define_success(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = {"language_learning_support": True}
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    word, language = "casa", "es"
    
    # Mock the AI integration service response
    mock_ai_integration_service.make_request.return_value = {
        "choices": [{
            "message": {
                "content": json.dumps({
                    "word": word,
                    "language": language,
                    "definition": "A house or home",
                    "example_sentence": "Mi casa es muy grande."
                })
            }
        }]
    }
    
    with patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        # Action
        result = await service.get_vocabulary_definition(mock_user_model_lang_learn, word, language)
        # Assertion
        assert result["word"] == word
        assert result["definition"] == "A house or home"
        assert result["language"] == language

@pytest.mark.asyncio
async def test_define_feature_disabled(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = {"language_learning_support": False}
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with pytest.raises(HTTPException) as exc:
        await service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
    assert exc.value.status_code == 403

@pytest.mark.asyncio
async def test_define_no_user_settings(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with patch('app.crud.user_setting_crud.get_user_setting', return_value=None):
        with pytest.raises(HTTPException) as exc:
            await service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
        assert exc.value.status_code == 402

@pytest.mark.asyncio
async def test_define_no_api_key_in_settings(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = json.dumps({})
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        with pytest.raises(HTTPException) as exc:
            await service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
        assert exc.value.status_code == 402

@pytest.mark.asyncio
async def test_define_empty_api_key(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = json.dumps({"openai_api_key": ""})
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with patch('app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        with pytest.raises(HTTPException) as exc:
            await service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
        assert exc.value.status_code == 402

def test_define_invalid_external_api_key(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = json.dumps({"openai_api_key": "invalid_lang_key"})
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        with pytest.raises(HTTPException) as exc:
            service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
        assert exc.value.status_code == 400

def test_define_external_service_general_failure(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn), \
         patch('digame.app.services.language_learning_service.MockExternalLanguageClient.define_word', side_effect=Exception("Definition service down")):
        with pytest.raises(HTTPException) as exc:
            service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
        assert exc.value.status_code == 503

def test_define_user_not_in_tenant(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn):
    # Arrange
    mock_user_model_lang_learn.tenant_id = None  # User not associated with any tenant
    mock_user_model_lang_learn.tenant = None
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with pytest.raises(HTTPException) as exc:
        service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
    assert exc.value.status_code == 403

def test_define_corrupted_tenant_features_json(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_tenant_model_lang_learn.features = '{"language_learning_support": True' # Malformed
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with pytest.raises(HTTPException) as exc:
        service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
    assert exc.value.status_code == 500

def test_define_corrupted_user_api_keys_json(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    mock_user_setting_model_lang_learn.api_keys = '{"openai_api_key": "valid"' # Malformed
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        with pytest.raises(HTTPException) as exc:
            service.get_vocabulary_definition(mock_user_model_lang_learn, "word", "en")
        assert exc.value.status_code == 500

def test_define_invalid_input_to_mock_client(mock_db_session, mock_ai_integration_service, mock_user_model_lang_learn, mock_tenant_model_lang_learn, mock_user_setting_model_lang_learn, mock_tenant_user_link_lang_learn):
    # Arrange
    service = LanguageLearningService(db=mock_db_session, ai_integration_service=mock_ai_integration_service)
    with patch('digame.app.crud.user_setting_crud.get_user_setting', return_value=mock_user_setting_model_lang_learn):
        with pytest.raises(HTTPException) as exc:
            service.get_vocabulary_definition(mock_user_model_lang_learn, "", "en") # Empty word
        assert exc.value.status_code == 400
        assert "word and language are required" in exc.value.detail.lower()
