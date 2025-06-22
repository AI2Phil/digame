import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from sqlalchemy.orm import Session

# Models to import for type hinting and creating mock instances
from digame.app.models.tenant import User as UserModel, Tenant as TenantModel
# Note: WritingSuggestion model may not exist yet, commenting out for now
# from digame.app.models.writing_assistance import WritingSuggestion as WritingSuggestionModel

# Service to test
from digame.app.services.writing_assistance_service import WritingAssistanceService

# Schemas
from digame.app.schemas.writing_assistance_schemas import WritingSuggestionRequest, WritingSuggestionResponse

# --- Fixtures ---

@pytest.fixture
def mock_db_session():
    db = MagicMock(spec=Session)
    # Default mock for queries to avoid NoneType errors if not specifically overridden in a test
    query_mock = db.query.return_value
    query_mock.filter.return_value = query_mock
    query_mock.filter_by.return_value = query_mock
    query_mock.order_by.return_value = query_mock
    query_mock.limit.return_value = query_mock
    query_mock.offset.return_value = query_mock
    query_mock.first.return_value = None
    query_mock.all.return_value = []
    query_mock.count.return_value = 0
    return db

@pytest.fixture
def mock_tenant_service():
    tenant_service = MagicMock()
    tenant_service.check_feature_enabled.return_value = True
    tenant_service.get_tenant_setting.return_value = MagicMock(value="test-api-key")
    return tenant_service

@pytest.fixture
def writing_assistance_service(mock_db_session, mock_tenant_service):
    return WritingAssistanceService(db=mock_db_session, tenant_service=mock_tenant_service)

@pytest.fixture
def mock_user():
    return UserModel(id=1, tenant_id=1, username="testuser", email="test@example.com")

@pytest.fixture
def mock_tenant():
    return TenantModel(id=1, name="Test Tenant", features={"writing_assistance": True})

@pytest.fixture
def sample_writing_request():
    return WritingSuggestionRequest(
        text_input="This is a sample text that needs improvement.",
        suggestion_type="grammar",
        context="email"
    )

@pytest.fixture
def mock_writing_suggestion():
    # return WritingSuggestionModel(
    return type('MockWritingSuggestion', (), {
        id=1,
        user_id=1,
        original_text="This is a sample text that needs improvement.",
        suggestion="This is a sample text that needs improvement.",
        suggestion_type="grammar",
        context="email",
        confidence_score=0.95
    )

# --- Tests for WritingAssistanceService ---

class TestFeatureAccessControl:
    def test_feature_enabled_check_success(self, writing_assistance_service: WritingAssistanceService, mock_user, mock_tenant_service):
        # Arrange
        mock_tenant_service.check_feature_enabled.return_value = True
        
        # Act
        result = writing_assistance_service._check_feature_access(mock_user.tenant_id, "writing_assistance")
        
        # Assert
        assert result is True
        mock_tenant_service.check_feature_enabled.assert_called_once_with(mock_user.tenant_id, "writing_assistance")

    def test_feature_disabled_raises_error(self, writing_assistance_service: WritingAssistanceService, mock_user, mock_tenant_service):
        # Arrange
        mock_tenant_service.check_feature_enabled.return_value = False
        
        # Act & Assert
        with pytest.raises(ValueError, match="Writing assistance feature is not enabled"):
            writing_assistance_service._check_feature_access(mock_user.tenant_id, "writing_assistance")

class TestAPIKeyValidation:
    def test_get_api_key_success(self, writing_assistance_service: WritingAssistanceService, mock_user, mock_tenant_service):
        # Arrange
        mock_setting = MagicMock()
        mock_setting.value = "test-api-key"
        mock_tenant_service.get_tenant_setting.return_value = mock_setting
        
        # Act
        api_key = writing_assistance_service._get_api_key(mock_user.tenant_id, "openai")
        
        # Assert
        assert api_key == "test-api-key"
        mock_tenant_service.get_tenant_setting.assert_called_once_with(mock_user.tenant_id, "integrations", "openai_api_key")

    def test_missing_api_key_raises_error(self, writing_assistance_service: WritingAssistanceService, mock_user, mock_tenant_service):
        # Arrange
        mock_tenant_service.get_tenant_setting.return_value = None
        
        # Act & Assert
        with pytest.raises(ValueError, match="OpenAI API key not configured"):
            writing_assistance_service._get_api_key(mock_user.tenant_id, "openai")

class TestWritingSuggestionGeneration:
    @patch('digame.app.services.writing_assistance_service.openai')
    def test_generate_suggestion_success(self, mock_openai, writing_assistance_service: WritingAssistanceService, 
                                       mock_user, sample_writing_request, mock_db_session, mock_tenant_service):
        # Arrange
        mock_tenant_service.check_feature_enabled.return_value = True
        mock_setting = MagicMock()
        mock_setting.value = "test-api-key"
        mock_tenant_service.get_tenant_setting.return_value = mock_setting
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "This is a sample text that needs improvement."
        mock_openai.ChatCompletion.create.return_value = mock_response
        
        # Act
        result = writing_assistance_service.generate_suggestion(sample_writing_request, mock_user)
        
        # Assert
        assert isinstance(result, WritingSuggestionResponse)
        assert result.suggestion == "This is a sample text that needs improvement."
        assert result.original_text == sample_writing_request.text_input
        assert result.suggestion_type == sample_writing_request.suggestion_type
        
        # Verify database operations
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @patch('digame.app.services.writing_assistance_service.openai')
    def test_generate_suggestion_api_error(self, mock_openai, writing_assistance_service: WritingAssistanceService,
                                         mock_user, sample_writing_request, mock_tenant_service):
        # Arrange
        mock_tenant_service.check_feature_enabled.return_value = True
        mock_setting = MagicMock()
        mock_setting.value = "test-api-key"
        mock_tenant_service.get_tenant_setting.return_value = mock_setting
        
        mock_openai.ChatCompletion.create.side_effect = Exception("API Error")
        
        # Act & Assert
        with pytest.raises(Exception, match="API Error"):
            writing_assistance_service.generate_suggestion(sample_writing_request, mock_user)

class TestSuggestionHistory:
    def test_get_user_suggestions_success(self, writing_assistance_service: WritingAssistanceService,
                                        mock_user, mock_db_session, mock_writing_suggestion):
        # Arrange
        mock_db_session.query(WritingSuggestionModel).filter().order_by().limit().offset().all.return_value = [mock_writing_suggestion]
        
        # Act
        suggestions = writing_assistance_service.get_user_suggestions(mock_user.id, limit=10, offset=0)
        
        # Assert
        assert len(suggestions) == 1
        assert suggestions[0].id == mock_writing_suggestion.id
        assert suggestions[0].original_text == mock_writing_suggestion.original_text

    def test_get_user_suggestions_empty(self, writing_assistance_service: WritingAssistanceService,
                                      mock_user, mock_db_session):
        # Arrange
        mock_db_session.query(WritingSuggestionModel).filter().order_by().limit().offset().all.return_value = []
        
        # Act
        suggestions = writing_assistance_service.get_user_suggestions(mock_user.id, limit=10, offset=0)
        
        # Assert
        assert len(suggestions) == 0

class TestSuggestionTypes:
    @pytest.mark.parametrize("suggestion_type,expected_prompt_keyword", [
        ("grammar", "grammar"),
        ("style", "style"),
        ("tone", "tone"),
        ("clarity", "clarity"),
        ("conciseness", "concise")
    ])
    def test_different_suggestion_types(self, suggestion_type, expected_prompt_keyword,
                                      writing_assistance_service: WritingAssistanceService):
        # Act
        prompt = writing_assistance_service._build_prompt("Test text", suggestion_type, "email")
        
        # Assert
        assert expected_prompt_keyword.lower() in prompt.lower()
        assert "Test text" in prompt
        assert "email" in prompt

class TestContextHandling:
    @pytest.mark.parametrize("context,expected_context_keyword", [
        ("email", "email"),
        ("document", "document"),
        ("social_media", "social media"),
        ("presentation", "presentation"),
        ("academic", "academic")
    ])
    def test_different_contexts(self, context, expected_context_keyword,
                              writing_assistance_service: WritingAssistanceService):
        # Act
        prompt = writing_assistance_service._build_prompt("Test text", "grammar", context)
        
        # Assert
        assert expected_context_keyword.lower() in prompt.lower()

class TestErrorHandling:
    def test_empty_text_input_raises_error(self, writing_assistance_service: WritingAssistanceService, mock_user):
        # Arrange
        empty_request = WritingSuggestionRequest(
            text_input="",
            suggestion_type="grammar",
            context="email"
        )
        
        # Act & Assert
        with pytest.raises(ValueError, match="Text input cannot be empty"):
            writing_assistance_service.generate_suggestion(empty_request, mock_user)

    def test_invalid_suggestion_type_raises_error(self, writing_assistance_service: WritingAssistanceService, mock_user):
        # Arrange
        invalid_request = WritingSuggestionRequest(
            text_input="Test text",
            suggestion_type="invalid_type",
            context="email"
        )
        
        # Act & Assert
        with pytest.raises(ValueError, match="Invalid suggestion type"):
            writing_assistance_service.generate_suggestion(invalid_request, mock_user)

class TestTenantIsolation:
    def test_user_suggestions_filtered_by_user_id(self, writing_assistance_service: WritingAssistanceService,
                                                 mock_db_session):
        # Arrange
        user_id = 1
        
        # Act
        writing_assistance_service.get_user_suggestions(user_id, limit=10, offset=0)
        
        # Assert
        # Verify that the query was filtered by user_id
        mock_db_session.query.assert_called_with(WritingSuggestionModel)
        # The filter call should include user_id filtering
        filter_calls = mock_db_session.query.return_value.filter.call_args_list
        assert len(filter_calls) > 0  # At least one filter call should be made

class TestServiceIntegration:
    def test_service_initialization_with_dependencies(self, mock_db_session, mock_tenant_service):
        # Act
        service = WritingAssistanceService(db=mock_db_session, tenant_service=mock_tenant_service)
        
        # Assert
        assert service.db == mock_db_session
        assert service.tenant_service == mock_tenant_service

    def test_service_methods_require_authentication(self, writing_assistance_service: WritingAssistanceService,
                                                   sample_writing_request):
        # Act & Assert
        with pytest.raises(AttributeError):
            # This should fail because no user is provided
            writing_assistance_service.generate_suggestion(sample_writing_request, None)

class TestPerformanceAndLimits:
    def test_suggestion_text_length_validation(self, writing_assistance_service: WritingAssistanceService, mock_user):
        # Arrange
        long_text = "a" * 10000  # Very long text
        long_request = WritingSuggestionRequest(
            text_input=long_text,
            suggestion_type="grammar",
            context="email"
        )
        
        # Act & Assert
        with pytest.raises(ValueError, match="Text input too long"):
            writing_assistance_service.generate_suggestion(long_request, mock_user)

    def test_rate_limiting_check(self, writing_assistance_service: WritingAssistanceService, 
                               mock_user, mock_db_session, mock_tenant_service):
        # Arrange
        mock_tenant_service.check_feature_enabled.return_value = True
        # Mock that user has made many requests recently
        mock_db_session.query(WritingSuggestionModel).filter().count.return_value = 100
        
        sample_request = WritingSuggestionRequest(
            text_input="Test text",
            suggestion_type="grammar",
            context="email"
        )
        
        # Act & Assert
        with pytest.raises(ValueError, match="Rate limit exceeded"):
            writing_assistance_service.generate_suggestion(sample_request, mock_user)
