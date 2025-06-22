import pytest
from unittest.mock import MagicMock, patch, ANY
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

# Models to import for type hinting and creating mock instances
from digame.app.models.tenant import Tenant as TenantModel
from digame.app.models.tenant import User as UserModel
from digame.app.models.tenant import Role as RoleModel
from digame.app.models.tenant import UserRole as UserRoleModel
from digame.app.models.tenant import TenantSettings as TenantSettingsModel
from digame.app.models.tenant import TenantInvitation as TenantInvitationModel
from digame.app.models.tenant import TenantAuditLog as TenantAuditLogModel

# Service to test
from digame.app.services.tenant_service import TenantService, UserService

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
def tenant_service(mock_db_session):
    return TenantService(db=mock_db_session)

@pytest.fixture
def user_service(mock_db_session):
    return UserService(db=mock_db_session)

@pytest.fixture
def sample_tenant_data():
    return {
        "name": "Test Tenant",
        "slug": "test-tenant",
        "admin_email": "admin@test-tenant.com",
        "admin_name": "Test Admin",
        "admin_user_password": "securepassword123",
        "subscription_tier": "basic",
    }

@pytest.fixture
def mock_tenant_instance(sample_tenant_data):
    # Create a more complete mock tenant instance
    now = datetime.now(timezone.utc)
    return TenantModel(
        id=1,
        tenant_uuid="test-uuid",
        name=sample_tenant_data["name"],
        slug=sample_tenant_data["slug"],
        admin_email=sample_tenant_data["admin_email"],
        admin_name=sample_tenant_data["admin_name"],
        subscription_tier=sample_tenant_data["subscription_tier"],
        features={"analytics": True, "social_collaboration": True, "basic_reporting": True, "api_access": False, "sso": False, "audit_logs_access": False, "ai_insights": False, "advanced_reporting": False, "writing_assistance": False, "integrations_basic": True, "integrations_premium": False, "ai_features_standard": False, "workflow_automation_simple": False, "market_intelligence_overview": False, "advanced_security_options": False}, # Default basic features
        settings={},
        branding={},
        max_users=10,
        is_active=True,
        is_trial=True,
        trial_ends_at=now + timedelta(days=30),
        created_at=now,
        updated_at=now
    )

@pytest.fixture
def mock_user_instance():
    return UserModel(id=1, tenant_id=1, username="admin@test-tenant.com", email="admin@test-tenant.com", is_active=True)

@pytest.fixture
def mock_admin_role_instance():
    return RoleModel(id=1, tenant_id=1, name="Admin", permissions=["tenant:manage"])


# --- Tests for TenantService ---

class TestTenantCreation:
    def test_create_tenant_success(self, tenant_service: TenantService, mock_db_session: MagicMock, sample_tenant_data, mock_admin_role_instance):
        # Arrange
        mock_db_session.query(TenantModel).filter_by(slug=sample_tenant_data["slug"]).first.return_value = None
        mock_db_session.query(RoleModel).filter(RoleModel.tenant_id == ANY, RoleModel.name == "Admin").first.return_value = mock_admin_role_instance
        mock_db_session.query(RoleModel).filter(RoleModel.tenant_id == ANY, RoleModel.name == "User").first.return_value = RoleModel(id=2, name="User")


        # Act
        created_tenant = tenant_service.create_tenant(sample_tenant_data, current_user_id=None)

        # Assert
        assert created_tenant is not None
        assert created_tenant.name == sample_tenant_data["name"]
        assert created_tenant.slug == sample_tenant_data["slug"]
        assert created_tenant.admin_email == sample_tenant_data["admin_email"]
        assert created_tenant.subscription_tier == sample_tenant_data["subscription_tier"]
        assert "writing_assistance" in created_tenant.features # Check a sample feature

        mock_db_session.add.assert_any_call(created_tenant) # Tenant is added
        # Check if _create_default_roles was conceptually called (roles added)
        assert any(call_args[0][0].name == "Admin" for call_args in mock_db_session.add.call_args_list if isinstance(call_args[0][0], RoleModel))
        # Check if admin user was created and UserRole for admin
        assert any(call_args[0][0].email == sample_tenant_data["admin_email"] for call_args in mock_db_session.add.call_args_list if isinstance(call_args[0][0], UserModel))
        assert any(call_args[0][0].role_id == mock_admin_role_instance.id for call_args in mock_db_session.add.call_args_list if isinstance(call_args[0][0], UserRoleModel))

        # Check audit log call
        assert any(
            call_args[0][0].action == "tenant_created" and call_args[0][0].resource_type == "tenant"
            for call_args in mock_db_session.add.call_args_list if isinstance(call_args[0][0], TenantAuditLogModel)
        )
        mock_db_session.commit.assert_called_once()


    def test_create_tenant_missing_required_field(self, tenant_service: TenantService):
        with pytest.raises(ValueError, match="Missing required field: slug"):
            tenant_service.create_tenant({"name": "Test"})

class TestTenantUpdate:
    def test_update_tenant_success(self, tenant_service: TenantService, mock_db_session: MagicMock, mock_tenant_instance, mock_user_instance):
        mock_db_session.query(TenantModel).filter(TenantModel.id == mock_tenant_instance.id).first.return_value = mock_tenant_instance

        updates = {"name": "Updated Tenant Name", "subscription_tier": "professional"}
        updated_tenant = tenant_service.update_tenant(mock_tenant_instance.id, updates, current_user_id=mock_user_instance.id)

        assert updated_tenant.name == "Updated Tenant Name"
        assert updated_tenant.subscription_tier == "professional"
        assert updated_tenant.features.get("writing_assistance") is True # Assuming professional enables this
        mock_db_session.commit.assert_called_once()
        assert any(call_args[0][0].action == "tenant_updated" for call_args in mock_db_session.add.call_args_list if isinstance(call_args[0][0], TenantAuditLogModel))

class TestTenantSettingsManagement:
    def test_set_tenant_setting_create_new(self, tenant_service: TenantService, mock_db_session: MagicMock, mock_user_instance):
        tenant_id = 1
        mock_db_session.query(TenantSettingsModel).filter(
            TenantSettingsModel.tenant_id == tenant_id,
            TenantSettingsModel.category == "general",
            TenantSettingsModel.key == "timezone"
        ).first.return_value = None # Setting does not exist

        setting = tenant_service.set_tenant_setting(
            tenant_id, "general", "timezone", "UTC", "string", False, mock_user_instance.id
        )

        assert setting.category == "general"
        assert setting.key == "timezone"
        assert setting.value == "UTC"
        mock_db_session.add.assert_any_call(setting)
        mock_db_session.commit.assert_called_once()
        assert any(call_args[0][0].action == "tenant_setting_created" for call_args in mock_db_session.add.call_args_list if isinstance(call_args[0][0], TenantAuditLogModel))

    def test_get_tenant_setting_found(self, tenant_service: TenantService, mock_db_session: MagicMock):
        mock_setting = TenantSettingsModel(tenant_id=1, category="general", key="timezone", value="UTC")
        mock_db_session.query(TenantSettingsModel).filter(ANY, ANY, ANY).first.return_value = mock_setting

        setting = tenant_service.get_tenant_setting(1, "general", "timezone")
        assert setting is not None
        assert setting.value == "UTC"

    def test_delete_tenant_setting_success(self, tenant_service: TenantService, mock_db_session: MagicMock, mock_user_instance):
        mock_setting = TenantSettingsModel(tenant_id=1, category="general", key="timezone", value="UTC")
        mock_db_session.query(TenantSettingsModel).filter(ANY, ANY, ANY).first.return_value = mock_setting

        result = tenant_service.delete_tenant_setting(1, "general", "timezone", mock_user_instance.id)
        assert result is True
        mock_db_session.delete.assert_called_once_with(mock_setting)
        mock_db_session.commit.assert_called_once()
        assert any(call_args[0][0].action == "tenant_setting_deleted" for call_args in mock_db_session.add.call_args_list if isinstance(call_args[0][0], TenantAuditLogModel))

class TestTenantInvitationManagement:
    @patch('secrets.token_urlsafe')
    def test_create_invitation_success(self, mock_token_urlsafe, tenant_service: TenantService, mock_db_session: MagicMock, mock_user_instance):
        mock_token_urlsafe.return_value = "test_token"
        tenant_id = 1
        inviter_id = mock_user_instance.id
        email = "newuser@example.com"
        role = "User"

        mock_db_session.query(UserModel).filter(UserModel.id == inviter_id, UserModel.tenant_id == tenant_id).first.return_value = mock_user_instance
        mock_db_session.query(TenantInvitationModel).filter(ANY,ANY,ANY,ANY).first.return_value = None # No existing invitation

        invitation = tenant_service.create_invitation(tenant_id, inviter_id, email, role)

        assert invitation.email == email
        assert invitation.role == role
        assert invitation.invitation_token == "test_token"
        assert invitation.expires_at > datetime.now(timezone.utc)
        mock_db_session.add.assert_any_call(invitation)
        mock_db_session.commit.assert_called_once()
        assert any(call_args[0][0].action == "tenant_invitation_created" for call_args in mock_db_session.add.call_args_list if isinstance(call_args[0][0], TenantAuditLogModel))

    def test_accept_invitation_success(self, tenant_service: TenantService, mock_db_session: MagicMock, mock_user_instance):
        token = "valid_token"
        accepting_user_id = mock_user_instance.id
        mock_invitation = TenantInvitationModel(
            id=1, tenant_id=1, email="test@example.com", role="User",
            invitation_token=token, expires_at=datetime.now(timezone.utc) + timedelta(days=1),
            invited_by_user_id=2
        )
        mock_db_session.query(TenantInvitationModel).filter(TenantInvitationModel.invitation_token == token).first.return_value = mock_invitation
        mock_db_session.query(User).filter(User.id == accepting_user_id).first.return_value = mock_user_instance
        mock_db_session.query(Role).filter(Role.tenant_id == mock_invitation.tenant_id, Role.name == mock_invitation.role).first.return_value = RoleModel(id=1, name="User")


        invitation = tenant_service.accept_invitation(token, accepting_user_id)

        assert invitation.accepted_at is not None
        mock_db_session.commit.assert_called_once()
        assert any(call_args[0][0].action == "tenant_invitation_accepted" for call_args in mock_db_session.add.call_args_list if isinstance(call_args[0][0], TenantAuditLogModel))


class TestTenantAuditLogManagement:
    def test_log_audit_event_creates_log(self, tenant_service: TenantService, mock_db_session: MagicMock):
        tenant_id=1
        user_id=1
        action="test_action"
        tenant_service._log_audit_event(tenant_id, user_id, action)

        # Check that an TenantAuditLogModel instance was added to the session
        added_log = None
        for call in mock_db_session.add.call_args_list:
            if isinstance(call[0][0], TenantAuditLogModel):
                added_log = call[0][0]
                break
        assert added_log is not None
        assert added_log.tenant_id == tenant_id
        assert added_log.user_id == user_id
        assert added_log.action == action
        mock_db_session.flush.assert_called_once() # _log_audit_event calls flush

    def test_list_audit_logs_with_filters(self, tenant_service: TenantService, mock_db_session: MagicMock):
        mock_logs = [TenantAuditLogModel(action="test_action"), TenantAuditLogModel(action="another_action")]
        mock_db_session.query(TenantAuditLogModel).filter().order_by().limit().offset().all.return_value = mock_logs

        logs = tenant_service.list_audit_logs(tenant_id=1, action="test_action", limit=10, offset=0)

        assert len(logs) == 2 # Mock returns all, filter is part of the chained call
        # To test filtering properly, you'd need to inspect the filter() call args or have more specific mock setups.
        # For now, this confirms the method runs and returns what the mock provides.


class TestUserManagementAndLimits:
    def test_create_user_success_within_limits(self, tenant_service: TenantService, mock_db_session: MagicMock, mock_tenant_instance, mock_user_instance):
        tenant_id = mock_tenant_instance.id
        mock_tenant_instance.max_users = 5
        mock_db_session.query(TenantModel).filter(TenantModel.id == tenant_id).first.return_value = mock_tenant_instance
        mock_db_session.query(UserModel).filter(UserModel.tenant_id == tenant_id).count.return_value = 2 # Current users
        mock_db_session.query(RoleModel).filter(ANY, ANY).first.return_value = RoleModel(id=1, name="User")


        user_data = {"username": "newuser", "email": "new@example.com", "password": "password"}
        new_user = tenant_service.create_user(tenant_id, user_data, current_admin_id=mock_user_instance.id)

        assert new_user.username == "newuser"
        mock_db_session.add.assert_any_call(new_user)
        assert any(call_args[0][0].action == "user_created" for call_args in mock_db_session.add.call_args_list if isinstance(call_args[0][0], TenantAuditLogModel))

    def test_create_user_exceeds_max_users_limit(self, tenant_service: TenantService, mock_db_session: MagicMock, mock_tenant_instance):
        tenant_id = mock_tenant_instance.id
        mock_tenant_instance.max_users = 2
        mock_db_session.query(TenantModel).filter(TenantModel.id == tenant_id).first.return_value = mock_tenant_instance
        mock_db_session.query(UserModel).filter(UserModel.tenant_id == tenant_id).count.return_value = 2 # At limit

        user_data = {"username": "anotheruser", "email": "another@example.com", "password": "password"}
        with pytest.raises(ValueError, match=f"User limit ({mock_tenant_instance.max_users}) reached"):
            tenant_service.create_user(tenant_id, user_data)

# Basic tests for UserService to ensure it's tenant-aware where needed
class TestUserService:
    def test_authenticate_user_scoped_to_tenant(self, user_service: UserService, mock_db_session: MagicMock):
        mock_user = UserModel(username="testuser", tenant_id=1, hashed_password=UserService.pwd_context.hash("password"))
        mock_db_session.query(UserModel).filter(UserModel.username == "testuser", UserModel.is_active == True, UserModel.tenant_id == 1).first.return_value = mock_user

        authenticated_user = user_service.authenticate_user("testuser", "password", tenant_id=1)
        assert authenticated_user is not None
        assert authenticated_user.username == "testuser"

    def test_authenticate_user_wrong_tenant(self, user_service: UserService, mock_db_session: MagicMock):
        # Mock that user exists but not for the queried tenant_id
        mock_db_session.query(UserModel).filter(UserModel.username == "testuser", UserModel.is_active == True, UserModel.tenant_id == 2).first.return_value = None

        authenticated_user = user_service.authenticate_user("testuser", "password", tenant_id=2)
        assert authenticated_user is None
```
