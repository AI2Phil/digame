import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session
from datetime import datetime

# Models
from digame.app.models.tenant import Tenant as TenantModel

# Service to test
from digame.app.services.tenant_service import TenantService

# --- Fixtures ---

@pytest.fixture
def mock_db_session():
    db = MagicMock(spec=Session)
    # Mock the query filter first mechanism for slug uniqueness check
    db.query(TenantModel).filter().first.return_value = None
    return db

@pytest.fixture
def tenant_service(mock_db_session):
    # The TenantService constructor takes a db session
    return TenantService(db=mock_db_session)

# --- Tests for TenantService ---

def test_create_tenant_writing_assistance_flag_professional_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    tenant_name = "Pro Tenant"
    admin_email = "pro@example.com"
    admin_name = "Pro Admin"
    subscription_tier = "professional"

    # Action
    # The create_tenant method in the original code adds, commits, and refreshes.
    # We need to ensure our mock_db_session handles this.
    # `mock_db_session.add` and `commit` are already part of MagicMock.
    # `mock_db_session.refresh` needs to be available if called.
    
    # To simulate the tenant object being populated after db.add and db.commit,
    # we can have the service return a TenantModel instance.
    # The actual service creates a Tenant instance itself. We just need to check its properties.
    
    # The _generate_slug part uses db.query. Ensure it's mocked if it interferes.
    # mock_db_session.query(TenantModel).filter().first.return_value = None # Handled in fixture for uniqueness

    created_tenant = tenant_service.create_tenant(
        name=tenant_name,
        admin_email=admin_email,
        admin_name=admin_name,
        subscription_tier=subscription_tier
    )

    # Assertion
    assert created_tenant is not None
    assert created_tenant.name == tenant_name
    assert created_tenant.subscription_tier == subscription_tier
    assert isinstance(created_tenant.features, dict)
    assert created_tenant.features.get("writing_assistance") is True
    
    # Verify DB interactions (optional, but good for completeness)
    mock_db_session.add.assert_called_once_with(created_tenant)
    mock_db_session.commit.assert_called_once()
    mock_db_session.refresh.assert_called_once_with(created_tenant)


def test_create_tenant_writing_assistance_flag_enterprise_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    subscription_tier = "enterprise"

    # Action
    created_tenant = tenant_service.create_tenant(
        name="Enterprise Tenant",
        admin_email="ent@example.com",
        admin_name="Ent Admin",
        subscription_tier=subscription_tier
    )

    # Assertion
    assert created_tenant is not None
    assert created_tenant.subscription_tier == subscription_tier
    assert isinstance(created_tenant.features, dict)
    assert created_tenant.features.get("writing_assistance") is True


def test_create_tenant_writing_assistance_flag_basic_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    subscription_tier = "basic"

    # Action
    created_tenant = tenant_service.create_tenant(
        name="Basic Tenant",
        admin_email="basic@example.com",
        admin_name="Basic Admin",
        subscription_tier=subscription_tier
    )

    # Assertion
    assert created_tenant is not None
    assert created_tenant.subscription_tier == subscription_tier
    assert isinstance(created_tenant.features, dict)
    # For "basic" tier, the writing_assistance feature should be False.
    assert created_tenant.features.get("writing_assistance") is False


def test_update_tenant_tier_updates_writing_assistance_flag(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    # 1. Create a tenant (conceptually, or mock its retrieval)
    initial_tenant_id = 1
    initial_tier = "basic"
    mock_initial_tenant = TenantModel(
        id=initial_tenant_id,
        name="Updatable Tenant",
        subscription_tier=initial_tier,
        features={"writing_assistance": False, "other_feature": True}, # Initial state
        admin_email="update@example.com",
        admin_name="Update Admin",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Mock get_tenant_by_id to return this tenant
    mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant
    
    # Make tenant_service use this db session (already done by fixture)

    # Action 1: Update to "professional"
    updates_to_pro = {"subscription_tier": "professional"}
    updated_tenant_pro = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates_to_pro, user_id=None)

    # Assertion 1
    assert updated_tenant_pro is not None
    assert updated_tenant_pro.subscription_tier == "professional"
    assert updated_tenant_pro.features.get("writing_assistance") is True
    assert updated_tenant_pro.features.get("other_feature") is True # Ensure other features are not lost

    # Reset commit/refresh mocks for next call if needed, though MagicMock handles multiple calls.
    mock_db_session.commit.reset_mock()
    mock_db_session.refresh.reset_mock()

    # Action 2: Update back to "basic"
    updates_to_basic = {"subscription_tier": "basic"}
    updated_tenant_basic = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates_to_basic, user_id=None)

    # Assertion 2
    assert updated_tenant_basic is not None
    assert updated_tenant_basic.subscription_tier == "basic"
    assert updated_tenant_basic.features.get("writing_assistance") is False
    assert updated_tenant_basic.features.get("other_feature") is True # Ensure other features persist


def test_update_tenant_direct_features_override_writing_assistance(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    initial_tenant_id = 2
    initial_tier = "professional" # writing_assistance would be True by tier
    mock_initial_tenant = TenantModel(
        id=initial_tenant_id,
        name="Override Tenant",
        subscription_tier=initial_tier,
        features={"writing_assistance": True, "ai_insights": True},
        admin_email="override@example.com",
        admin_name="Override Admin",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant

    # Action: Update features directly to set writing_assistance to False, against tier logic
    updates = {"features": {"writing_assistance": False, "ai_insights": True, "new_feature": True}}
    updated_tenant = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates, user_id=None)

    # Assertion
    assert updated_tenant is not None
    assert updated_tenant.subscription_tier == initial_tier # Tier didn't change
    assert updated_tenant.features.get("writing_assistance") is False # Overridden
    assert updated_tenant.features.get("ai_insights") is True # Preserved from original
    assert updated_tenant.features.get("new_feature") is True # Added


def test_update_tenant_tier_change_and_direct_features_override(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    initial_tenant_id = 3
    initial_tier = "basic" # writing_assistance would be False by tier
    mock_initial_tenant = TenantModel(
        id=initial_tenant_id,
        name="Complex Update Tenant",
        subscription_tier=initial_tier,
        features={"writing_assistance": False, "sso": False},
        admin_email="complex@example.com",
        admin_name="Complex Admin",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant

    # Action: Update tier to "professional" (would set writing_assistance=True)
    # AND also provide features update that sets writing_assistance=False (override)
    updates = {
        "subscription_tier": "professional",
        "features": {"writing_assistance": False, "sso": True, "new_feature_complex": "yes"}
    }
    updated_tenant = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates, user_id=None)

    # Assertion
    assert updated_tenant is not None
    assert updated_tenant.subscription_tier == "professional" # Tier updated
    # writing_assistance should be False due to direct override in 'features' update,
    # even though the new tier "professional" would normally set it to True.
    # The logic in tenant_service.py prioritizes explicit 'features' updates for 'writing_assistance'.
    # Specifically: `_features.update(updates["features"])` happens, then `_features["writing_assistance"] = current_tier in [...]`
    # then `updates["features"] = _features`.
    # This means if "writing_assistance" is *not* in `updates["features"]`, it's set by tier.
    # If "writing_assistance" *is* in `updates["features"]`, that value is used.
    # Let's re-check the service code:
    # `if "writing_assistance" not in updates["features"]:` then tier logic applies.
    # `else` (meaning it IS in updates["features"]), the provided value in updates["features"] should stick.
    # The `setattr(tenant, key, value)` loop then applies `updates["features"]` to `tenant.features`.
    # So, the override should indeed take precedence.
    assert updated_tenant.features.get("writing_assistance") is False # Explicitly set to False
    assert updated_tenant.features.get("sso") is True # From features update
    assert updated_tenant.features.get("new_feature_complex") == "yes" # From features update

def test_update_tenant_tier_change_features_not_in_update(tenant_service: TenantService, mock_db_session: MagicMock):
    # Test when subscription_tier changes, but 'features' is NOT part of the updates dictionary.
    # writing_assistance should be updated based on the new tier.
    initial_tenant_id = 4
    initial_tier = "basic" # writing_assistance is False
    mock_initial_tenant = TenantModel(
        id=initial_tenant_id,
        name="TierOnlyUpdate Tenant",
        subscription_tier=initial_tier,
        features={"writing_assistance": False, "other_stuff": 123},
        admin_email="tieronly@example.com",
        admin_name="TierOnly Admin",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant

    updates = {"subscription_tier": "enterprise"} # writing_assistance should become True
    updated_tenant = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates, user_id=None)

    assert updated_tenant is not None
    assert updated_tenant.subscription_tier == "enterprise"
    assert updated_tenant.features.get("writing_assistance") is True # Updated by tier change
    assert updated_tenant.features.get("other_stuff") == 123 # Other features preserved

# Ensure that the TenantService is initialized with a mock DB session.
# The create_tenant method involves several DB operations: add, commit, refresh, and query for slug uniqueness.
# The mock_db_session in the fixture is set up to handle the slug uniqueness check by default.
# The update_tenant also does query, commit, refresh.
# The tests assume that TenantModel can be instantiated directly for setting up test data.
# If TenantModel has complex relationships or initialization, fixtures might need to be more elaborate.
# The patch for `_generate_slug` is not used here; instead, the underlying DB query for slug check is mocked.
# This is generally better as it tests more of the actual code path.
# The `tenant_service` fixture provides an instance of `TenantService` with the mocked DB.
# These tests cover the feature flag logic for "writing_assistance" during tenant creation and updates.
# Test names are descriptive of their intent.
# Remember that `mock_db_session.query(Model).filter().first()` is a common pattern to mock.
# If your service uses `filter_by()`, then `mock_db_session.query(Model).filter_by().first()`.
# The provided code for `TenantService` uses `filter(Tenant.id == tenant_id).first()`
# and `filter(Tenant.slug == slug).first()`.
# The `mock_db_session.query(TenantModel).filter().first.return_value = None` in the fixture handles the slug check for `create_tenant`.
# For `update_tenant`, `mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant` handles the tenant retrieval.
# This seems correct.I have created the following test files:
1.  `digame/app/tests/services/test_writing_assistance_service.py`
2.  `digame/app/tests/routers/test_writing_assistance_router.py`
3.  `digame/app/tests/services/test_tenant_service.py` (This file likely existed, but I've added the relevant tests for the feature flag logic here as per instructions. If it's a new file, that's also fine.)

I've populated these files with the test scenarios described in the subtask, including setting up mocks for database sessions, CRUD operations, external services, and FastAPI dependencies like `get_current_active_user`.

**Key aspects covered:**

*   **`test_writing_assistance_service.py`**:
    *   Tests successful suggestion retrieval.
    *   Tests cases where the feature is disabled via tenant settings.
    *   Tests scenarios involving missing user settings or API keys.
    *   Tests error handling for invalid API keys (mocked external service behavior).
    *   Tests behavior when a user is not associated with a tenant or tenant info is malformed.
    *   Mocked `user_crud`, `tenant_crud`, `user_setting_crud`, and `MockExternalWritingServiceClient`.

*   **`test_writing_assistance_router.py`**:
    *   Uses `FastAPI.TestClient`.
    *   Tests the `/suggest` endpoint for successful calls, leveraging a mocked `WritingAssistanceService`.
    *   Tests how the router handles `HTTPException`s raised by the service.
    *   Tests how the router handles unexpected generic exceptions from the service (should return 500).
    *   Tests input validation for the `/suggest` endpoint (e.g., empty input).
    *   Tests the `/health` endpoint.
    *   Uses `app.dependency_overrides` to inject mock dependencies for `get_current_active_user` and `get_writing_assistance_service`.

*   **`test_tenant_service.py`**:
    *   Tests the `create_tenant` method to ensure the `writing_assistance` flag in `tenant.features` is correctly set based on `subscription_tier` ("professional", "enterprise" -> True; "basic" -> False).
    *   Tests the `update_tenant` method to ensure:
        *   Changing `subscription_tier` correctly updates the `writing_assistance` flag.
        *   Directly updating `features` (including `writing_assistance`) overrides the tier-based logic.
        *   Complex updates involving both tier change and direct feature override behave as expected.
        *   Other features are preserved during updates.
    *   Mocked the `Session` object for database interactions.

I've also made sure to include necessary imports and basic pytest fixtures (like `mock_db_session`, `client`). The structure of the mock models and their relationships (`UserModel`, `TenantModel`, `TenantUserModel`) is conceptual and aligns with typical SQLAlchemy usage, which the service tests rely on for mocking data.

I have not created or modified `__init__.py` files in the test directories as pytest typically discovers test files based on naming conventions (`test_*.py`). If these are needed for specific configurations or plugins, that would be a separate step.

I am now ready to submit the report.
