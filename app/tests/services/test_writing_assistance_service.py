import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from sqlalchemy.orm import Session

# Models to import for type hinting and creating mock instances
from app.models.user import User as UserModel
from app.models.tenant import Tenant as TenantModel

# Service to test
from app.services.writing_assistance_service import WritingAssistanceService

# Schemas
from app.schemas.writing_assistance_schemas import WritingSuggestionRequest, WritingSuggestionResponse


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
def writing_assistance_service(mock_db_session):
    return WritingAssistanceService(db=mock_db_session)

@pytest.fixture
def mock_user():
    return create_mock_model(UserModel, id=1, tenant_id=1, username="testuser", email="test@example.com")

@pytest.fixture
def mock_tenant():
    return create_mock_model(TenantModel, id=1, name="Test Tenant", features={"writing_assistance": True})

@pytest.fixture
def sample_writing_request():
    return WritingSuggestionRequest(
        text_input="This is a sample text that needs improvement.",
        context_type="email_reply",
        related_data={"subject": "Test Subject", "sender": "test@example.com"},
        language="en"
    )

# --- Tests for WritingAssistanceService ---
def create_mock_model(model_class, **kwargs):
    """Create a mock instance of a SQLAlchemy model with given attributes."""
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
            # Add common model attributes to avoid attribute errors
            if not hasattr(self, 'updated_at'):
                from datetime import datetime, timezone
                self.updated_at = datetime.now(timezone.utc)
        
        def __getattr__(self, name):
            # Return None for missing attributes instead of raising AttributeError
            # This helps with static analysis and test flexibility
            return None
        
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


class TestServiceInitialization:
    def test_service_initialization(self, mock_db_session):
        # Act
        service = WritingAssistanceService(db=mock_db_session)
        
        # Assert
        assert service.db == mock_db_session
        assert hasattr(service, 'ai_integration_service')
        assert service.openai_api_url == "https://api.openai.com/v1"
        assert service.openai_model == "gpt-3.5-turbo"


class TestUserAndAPIKeyValidation:
    @patch('app.crud.user_crud.get_user')
    @patch('app.crud.tenant_crud.get_tenant_by_id')
    @patch('app.crud.user_setting_crud.get_user_setting')
    @pytest.mark.asyncio
    async def test_get_user_and_api_key_success(self, mock_get_user_setting, mock_get_tenant, mock_get_user, 
                                               writing_assistance_service, mock_user, mock_tenant):
        # Arrange
        mock_get_user.return_value = mock_user
        mock_get_tenant.return_value = mock_tenant
        
        mock_user_setting = MagicMock()
        mock_user_setting.api_keys = '{"openai_api_key": "test-api-key"}'
        mock_get_user_setting.return_value = mock_user_setting
        
        # Act
        api_key = await writing_assistance_service._get_user_and_api_key(1, "writing_assistance")
        
        # Assert
        assert api_key == "test-api-key"
        mock_get_user.assert_called_once_with(writing_assistance_service.db, user_id=1)
        mock_get_tenant.assert_called_once_with(writing_assistance_service.db, 1)

    @patch('app.crud.user_crud.get_user')
    @pytest.mark.asyncio
    async def test_get_user_and_api_key_user_not_found(self, mock_get_user, writing_assistance_service):
        # Arrange
        mock_get_user.return_value = None
        
        # Act & Assert
        with pytest.raises(Exception):  # HTTPException in actual implementation
            await writing_assistance_service._get_user_and_api_key(1, "writing_assistance")


class TestWritingSuggestionGeneration:
    @patch('app.crud.user_crud.get_user')
    @patch('app.crud.tenant_crud.get_tenant_by_id')
    @patch('app.crud.user_setting_crud.get_user_setting')
    @pytest.mark.asyncio
    async def test_get_writing_suggestion_success(self, mock_get_user_setting, mock_get_tenant, mock_get_user,
                                                 writing_assistance_service, mock_user, mock_tenant):
        # Arrange
        mock_get_user.return_value = mock_user
        mock_get_tenant.return_value = mock_tenant
        
        mock_user_setting = MagicMock()
        mock_user_setting.api_keys = '{"openai_api_key": "test-api-key"}'
        mock_get_user_setting.return_value = mock_user_setting
        
        # Mock AI integration service
        mock_ai_response = {
            "choices": [
                {
                    "message": {
                        "content": '{"suggestion_text": "This is an improved version of your text."}'
                    }
                }
            ]
        }
        writing_assistance_service.ai_integration_service.make_request = AsyncMock(return_value=mock_ai_response)
        
        # Act
        result = await writing_assistance_service.get_writing_suggestion(
            current_user_id=1,
            text_input="This is a sample text that needs improvement.",
            context_type="email_reply",
            related_data={"subject": "Test Subject", "sender": "test@example.com"},
            language="en"
        )
        
        # Assert
        assert result == "This is an improved version of your text."
        writing_assistance_service.ai_integration_service.make_request.assert_called_once()

    @patch('app.crud.user_crud.get_user')
    @patch('app.crud.tenant_crud.get_tenant_by_id')
    @patch('app.crud.user_setting_crud.get_user_setting')
    @pytest.mark.asyncio
    async def test_get_writing_suggestion_feature_disabled(self, mock_get_user_setting, mock_get_tenant, mock_get_user,
                                                          writing_assistance_service, mock_user):
        # Arrange
        mock_get_user.return_value = mock_user
        
        # Mock tenant with feature disabled
        mock_tenant_disabled = create_mock_model(TenantModel, id=1, name="Test Tenant", features={"writing_assistance": False})
        mock_get_tenant.return_value = mock_tenant_disabled
        
        # Act & Assert
        with pytest.raises(Exception):  # HTTPException in actual implementation
            await writing_assistance_service.get_writing_suggestion(
                current_user_id=1,
                text_input="Test text",
                context_type="email_reply"
            )


class TestContextHandling:
    @pytest.mark.parametrize("context_type,expected_in_prompt", [
        ("email_reply", "email"),
        ("task_description", "task"),
        ("performance_review_feedback", "performance"),
        (None, "writing assistant")
    ])
    @patch('app.crud.user_crud.get_user')
    @patch('app.crud.tenant_crud.get_tenant_by_id')
    @patch('app.crud.user_setting_crud.get_user_setting')
    @pytest.mark.asyncio
    async def test_different_context_types(self, mock_get_user_setting, mock_get_tenant, mock_get_user,
                                          context_type, expected_in_prompt, writing_assistance_service, 
                                          mock_user, mock_tenant):
        # Arrange
        mock_get_user.return_value = mock_user
        mock_get_tenant.return_value = mock_tenant
        
        mock_user_setting = MagicMock()
        mock_user_setting.api_keys = '{"openai_api_key": "test-api-key"}'
        mock_get_user_setting.return_value = mock_user_setting
        
        # Mock AI integration service to capture the prompt
        captured_payload = {}
        async def capture_request(*args, **kwargs):
            captured_payload.update(kwargs.get('payload', {}))
            return {
                "choices": [
                    {
                        "message": {
                            "content": '{"suggestion_text": "Test suggestion"}'
                        }
                    }
                ]
            }
        
        writing_assistance_service.ai_integration_service.make_request = AsyncMock(side_effect=capture_request)
        
        # Act
        await writing_assistance_service.get_writing_suggestion(
            current_user_id=1,
            text_input="Test text",
            context_type=context_type
        )
        
        # Assert
        messages = captured_payload.get('messages', [])
        system_message = next((msg for msg in messages if msg['role'] == 'system'), {})
        assert expected_in_prompt.lower() in system_message.get('content', '').lower()


class TestErrorHandling:
    @patch('app.crud.user_crud.get_user')
    @patch('app.crud.tenant_crud.get_tenant_by_id')
    @patch('app.crud.user_setting_crud.get_user_setting')
    @pytest.mark.asyncio
    async def test_missing_api_key_raises_error(self, mock_get_user_setting, mock_get_tenant, mock_get_user,
                                               writing_assistance_service, mock_user, mock_tenant):
        # Arrange
        mock_get_user.return_value = mock_user
        mock_get_tenant.return_value = mock_tenant
        mock_get_user_setting.return_value = None  # No user settings
        
        # Act & Assert
        with pytest.raises(Exception):  # HTTPException in actual implementation
            await writing_assistance_service.get_writing_suggestion(
                current_user_id=1,
                text_input="Test text"
            )

    @patch('app.crud.user_crud.get_user')
    @patch('app.crud.tenant_crud.get_tenant_by_id')
    @patch('app.crud.user_setting_crud.get_user_setting')
    @pytest.mark.asyncio
    async def test_ai_service_error_propagates(self, mock_get_user_setting, mock_get_tenant, mock_get_user,
                                              writing_assistance_service, mock_user, mock_tenant):
        # Arrange
        mock_get_user.return_value = mock_user
        mock_get_tenant.return_value = mock_tenant
        
        mock_user_setting = MagicMock()
        mock_user_setting.api_keys = '{"openai_api_key": "test-api-key"}'
        mock_get_user_setting.return_value = mock_user_setting
        
        # Mock AI integration service to raise an error
        writing_assistance_service.ai_integration_service.make_request = AsyncMock(side_effect=Exception("AI service error"))
        
        # Act & Assert
        with pytest.raises(Exception):  # HTTPException in actual implementation
            await writing_assistance_service.get_writing_suggestion(
                current_user_id=1,
                text_input="Test text"
            )


class TestExtendedService:
    def test_extended_service_inheritance(self, mock_db_session):
        # Import the extended service
        from app.services.writing_assistance_service import WritingAssistanceServiceExtended
        
        # Act
        service = WritingAssistanceServiceExtended(db=mock_db_session)
        
        # Assert
        assert isinstance(service, WritingAssistanceService)
        assert hasattr(service, 'generate_text_from_template')
        assert hasattr(service, '_build_template_prompt')

    @pytest.mark.parametrize("template_type,expected_keywords", [
        ("project_update_summary", ["project", "completed", "milestones"]),
        ("meeting_minutes_outline", ["meeting", "attendees", "decisions"]),
        ("formal_request_email", ["formal", "email", "request"])
    ])
    def test_build_template_prompt_different_types(self, template_type, expected_keywords, mock_db_session):
        # Import the extended service
        from app.services.writing_assistance_service import WritingAssistanceServiceExtended
        
        # Arrange
        service = WritingAssistanceServiceExtended(db=mock_db_session)
        input_data = {
            "project_name": "Test Project",
            "meeting_title": "Test Meeting",
            "recipient_name": "Test Recipient"
        }
        
        # Act
        system_prompt, user_prompt = service._build_template_prompt(template_type, input_data, "professional", "en")
        
        # Assert
        combined_prompt = (system_prompt + " " + user_prompt).lower()
        for keyword in expected_keywords:
            assert keyword in combined_prompt
