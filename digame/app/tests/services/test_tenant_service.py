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


# --- Tests for "communication_style_analysis" flag ---

def test_create_tenant_communication_style_flag_professional_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    subscription_tier = "professional"
    # Action
    created_tenant = tenant_service.create_tenant(
        name="CommPro Tenant", admin_email="commpro@example.com", admin_name="CommPro Admin", subscription_tier=subscription_tier
    )
    # Assertion
    assert created_tenant.features.get("communication_style_analysis") is True

def test_create_tenant_communication_style_flag_enterprise_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    subscription_tier = "enterprise"
    # Action
    created_tenant = tenant_service.create_tenant(
        name="CommEnt Tenant", admin_email="comment@example.com", admin_name="CommEnt Admin", subscription_tier=subscription_tier
    )
    # Assertion
    assert created_tenant.features.get("communication_style_analysis") is True

def test_create_tenant_communication_style_flag_basic_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    subscription_tier = "basic"
    # Action
    created_tenant = tenant_service.create_tenant(
        name="CommBasic Tenant", admin_email="commbasic@example.com", admin_name="CommBasic Admin", subscription_tier=subscription_tier
    )
    # Assertion
    assert created_tenant.features.get("communication_style_analysis") is False

def test_update_tenant_tier_updates_communication_style_flag(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    initial_tenant_id = 5 # New ID for this test
    initial_tier = "basic"
    mock_initial_tenant_comm = TenantModel(
        id=initial_tenant_id, name="CommUpdatable Tenant", subscription_tier=initial_tier,
        features={"communication_style_analysis": False, "writing_assistance": False, "other_feature": "test_value"},
        admin_email="commupdate@example.com", admin_name="CommUpdate Admin",
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant_comm

    # Action 1: Update to "enterprise"
    updates_to_ent = {"subscription_tier": "enterprise"}
    updated_tenant_ent = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates_to_ent, user_id=None)
    # Assertion 1
    assert updated_tenant_ent.subscription_tier == "enterprise"
    assert updated_tenant_ent.features.get("communication_style_analysis") is True
    assert updated_tenant_ent.features.get("writing_assistance") is True # Check other auto-updated flag
    assert updated_tenant_ent.features.get("other_feature") == "test_value"

    mock_db_session.commit.reset_mock()
    mock_db_session.refresh.reset_mock()

    # Action 2: Update back to "basic"
    updates_to_basic_comm = {"subscription_tier": "basic"}
    updated_tenant_basic_comm = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates_to_basic_comm, user_id=None)
    # Assertion 2
    assert updated_tenant_basic_comm.subscription_tier == "basic"
    assert updated_tenant_basic_comm.features.get("communication_style_analysis") is False
    assert updated_tenant_basic_comm.features.get("writing_assistance") is False # Check other auto-updated flag
    assert updated_tenant_basic_comm.features.get("other_feature") == "test_value"

def test_update_tenant_direct_feature_override_communication_style(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    initial_tenant_id = 6 # New ID
    initial_tier = "basic" # communication_style_analysis would be False by tier
    mock_initial_tenant_override_comm = TenantModel(
        id=initial_tenant_id, name="CommOverride Tenant", subscription_tier=initial_tier,
        features={"communication_style_analysis": False, "other_feature": True},
        admin_email="commoverride@example.com", admin_name="CommOverride Admin",
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant_override_comm

    # Action: Update features directly to set communication_style_analysis to True, against tier logic
    updates_comm_override = {"features": {"communication_style_analysis": True, "other_feature": True}}
    updated_tenant_override_comm = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates_comm_override, user_id=None)

    # Assertion
    assert updated_tenant_override_comm.subscription_tier == initial_tier # Tier didn't change
    assert updated_tenant_override_comm.features.get("communication_style_analysis") is True # Overridden
    assert updated_tenant_override_comm.features.get("other_feature") is True

def test_update_tenant_tier_change_and_direct_comm_style_override(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    initial_tenant_id = 7 # New ID
    initial_tier = "enterprise" # communication_style_analysis would be True
    mock_initial_tenant_complex_comm = TenantModel(
        id=initial_tenant_id, name="CommComplexUpdate Tenant", subscription_tier=initial_tier,
        features={"communication_style_analysis": True, "writing_assistance": True, "sso": True},
        admin_email="commcomplex@example.com", admin_name="CommComplex Admin",
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant_complex_comm

    # Action: Update tier to "basic" (would set comm_style=False)
    # AND also provide features update that sets comm_style=True (override)
    updates_complex_comm = {
        "subscription_tier": "basic",
        "features": {"communication_style_analysis": True, "writing_assistance": False, "sso": False, "new_flag": "active"}
    }
    updated_tenant_complex_comm = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates_complex_comm, user_id=None)

    # Assertion
    assert updated_tenant_complex_comm.subscription_tier == "basic" # Tier updated
    assert updated_tenant_complex_comm.features.get("communication_style_analysis") is True # Explicitly set to True, overriding tier
    assert updated_tenant_complex_comm.features.get("writing_assistance") is False # Explicitly set to False, overriding tier
    assert updated_tenant_complex_comm.features.get("sso") is False # From features update
    assert updated_tenant_complex_comm.features.get("new_flag") == "active"


# --- Tests for "meeting_insights" flag ---

def test_create_tenant_meeting_insights_flag_professional_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    subscription_tier = "professional"
    # Action
    created_tenant = tenant_service.create_tenant(
        name="MeetingPro Tenant", admin_email="meetpro@example.com", admin_name="MeetingPro Admin", subscription_tier=subscription_tier
    )
    # Assertion
    assert created_tenant.features.get("meeting_insights") is True
    assert created_tenant.features.get("writing_assistance") is True # Check other flags remain consistent
    assert created_tenant.features.get("communication_style_analysis") is True

def test_create_tenant_meeting_insights_flag_enterprise_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    subscription_tier = "enterprise"
    # Action
    created_tenant = tenant_service.create_tenant(
        name="MeetingEnt Tenant", admin_email="meetent@example.com", admin_name="MeetingEnt Admin", subscription_tier=subscription_tier
    )
    # Assertion
    assert created_tenant.features.get("meeting_insights") is True

def test_create_tenant_meeting_insights_flag_basic_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    subscription_tier = "basic"
    # Action
    created_tenant = tenant_service.create_tenant(
        name="MeetingBasic Tenant", admin_email="meetbasic@example.com", admin_name="MeetingBasic Admin", subscription_tier=subscription_tier
    )
    # Assertion
    assert created_tenant.features.get("meeting_insights") is False

def test_update_tenant_tier_updates_meeting_insights_flag(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    initial_tenant_id = 8 # New ID
    initial_tier = "basic"
    mock_initial_tenant_meeting = TenantModel(
        id=initial_tenant_id, name="MeetingUpdatable Tenant", subscription_tier=initial_tier,
        features={"meeting_insights": False, "writing_assistance": False, "communication_style_analysis": False, "other_data": "persists"},
        admin_email="meetupdate@example.com", admin_name="MeetUpdate Admin",
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant_meeting

    # Action 1: Update to "enterprise"
    updates_to_ent_meeting = {"subscription_tier": "enterprise"}
    updated_tenant_ent_meeting = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates_to_ent_meeting, user_id=None)
    # Assertion 1
    assert updated_tenant_ent_meeting.subscription_tier == "enterprise"
    assert updated_tenant_ent_meeting.features.get("meeting_insights") is True
    assert updated_tenant_ent_meeting.features.get("writing_assistance") is True
    assert updated_tenant_ent_meeting.features.get("communication_style_analysis") is True
    assert updated_tenant_ent_meeting.features.get("other_data") == "persists"

    mock_db_session.commit.reset_mock() # Reset for next call if checking calls per update
    mock_db_session.refresh.reset_mock()

    # Action 2: Update back to "basic"
    updates_to_basic_meeting = {"subscription_tier": "basic"}
    updated_tenant_basic_meeting = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates_to_basic_meeting, user_id=None)
    # Assertion 2
    assert updated_tenant_basic_meeting.subscription_tier == "basic"
    assert updated_tenant_basic_meeting.features.get("meeting_insights") is False
    assert updated_tenant_basic_meeting.features.get("writing_assistance") is False
    assert updated_tenant_basic_meeting.features.get("communication_style_analysis") is False
    assert updated_tenant_basic_meeting.features.get("other_data") == "persists"

def test_update_tenant_direct_feature_override_meeting_insights(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    initial_tenant_id = 9 # New ID
    initial_tier = "basic" # meeting_insights would be False by tier
    mock_initial_tenant_override_meeting = TenantModel(
        id=initial_tenant_id, name="MeetingOverride Tenant", subscription_tier=initial_tier,
        features={"meeting_insights": False, "writing_assistance": False, "communication_style_analysis": False, "other_data": "test"},
        admin_email="meetoverride@example.com", admin_name="MeetOverride Admin",
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant_override_meeting

    # Action: Update features directly to set meeting_insights to True, against tier logic
    # Also, ensure other tier-based flags are NOT auto-enabled if not specified in this direct update.
    updates_meeting_override = {"features": {"meeting_insights": True, "other_data": "updated_test"}}
    updated_tenant_override_meeting = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates_meeting_override, user_id=None)

    # Assertion
    assert updated_tenant_override_meeting.subscription_tier == initial_tier # Tier didn't change
    assert updated_tenant_override_meeting.features.get("meeting_insights") is True # Overridden
    # Check that other tier-dependent flags that were not part of the direct update remain based on the *original* tier logic if not specified
    # The current service logic for "features" update:
    # _features = tenant.features.copy()
    # _features.update(updates["features"])
    # if "flagX" not in updates["features"]: _features["flagX"] = current_tier in [pro, ent]
    # updates["features"] = _features
    # This means if a flag (e.g. writing_assistance) is NOT in updates["features"], it will be re-evaluated based on current_tier.
    # So, if current_tier is 'basic', writing_assistance should be False unless explicitly set True in updates["features"].
    assert updated_tenant_override_meeting.features.get("writing_assistance") is False # Should remain False (based on 'basic' tier)
    assert updated_tenant_override_meeting.features.get("communication_style_analysis") is False # Should remain False (based on 'basic' tier)
    assert updated_tenant_override_meeting.features.get("other_data") == "updated_test" # Explicitly updated


# --- Tests for "email_pattern_analysis" flag ---

def test_create_tenant_email_pattern_analysis_flag_professional_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    subscription_tier = "professional"
    # Action
    created_tenant = tenant_service.create_tenant(
        name="EmailPro Tenant", admin_email="emailpro@example.com", admin_name="EmailPro Admin", subscription_tier=subscription_tier
    )
    # Assertion
    assert created_tenant.features.get("email_pattern_analysis") is True
    assert created_tenant.features.get("meeting_insights") is True # Check other flags

def test_create_tenant_email_pattern_analysis_flag_enterprise_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    subscription_tier = "enterprise"
    # Action
    created_tenant = tenant_service.create_tenant(
        name="EmailEnt Tenant", admin_email="emailent@example.com", admin_name="EmailEnt Admin", subscription_tier=subscription_tier
    )
    # Assertion
    assert created_tenant.features.get("email_pattern_analysis") is True

def test_create_tenant_email_pattern_analysis_flag_basic_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    subscription_tier = "basic"
    # Action
    created_tenant = tenant_service.create_tenant(
        name="EmailBasic Tenant", admin_email="emailbasic@example.com", admin_name="EmailBasic Admin", subscription_tier=subscription_tier
    )
    # Assertion
    assert created_tenant.features.get("email_pattern_analysis") is False

def test_update_tenant_tier_updates_email_pattern_analysis_flag(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    initial_tenant_id = 10 # New ID
    initial_tier = "basic"
    mock_initial_tenant_email = TenantModel(
        id=initial_tenant_id, name="EmailUpdatable Tenant", subscription_tier=initial_tier,
        features={"email_pattern_analysis": False, "meeting_insights": False, "other_flag": "value"},
        admin_email="emailupdate@example.com", admin_name="EmailUpdate Admin",
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant_email

    # Action 1: Update to "professional"
    updates_to_pro_email = {"subscription_tier": "professional"}
    updated_tenant_pro_email = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates_to_pro_email, user_id=None)
    # Assertion 1
    assert updated_tenant_pro_email.subscription_tier == "professional"
    assert updated_tenant_pro_email.features.get("email_pattern_analysis") is True
    assert updated_tenant_pro_email.features.get("meeting_insights") is True # Also updated
    assert updated_tenant_pro_email.features.get("other_flag") == "value"

    mock_db_session.commit.reset_mock()
    mock_db_session.refresh.reset_mock()

    # Action 2: Update back to "basic"
    updates_to_basic_email = {"subscription_tier": "basic"}
    updated_tenant_basic_email = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates_to_basic_email, user_id=None)
    # Assertion 2
    assert updated_tenant_basic_email.subscription_tier == "basic"
    assert updated_tenant_basic_email.features.get("email_pattern_analysis") is False
    assert updated_tenant_basic_email.features.get("meeting_insights") is False # Also updated
    assert updated_tenant_basic_email.features.get("other_flag") == "value"

def test_update_tenant_direct_feature_override_email_pattern_analysis(tenant_service: TenantService, mock_db_session: MagicMock):
    # Arrange
    initial_tenant_id = 11 # New ID
    initial_tier = "professional" # email_pattern_analysis would be True by tier
    mock_initial_tenant_override_email = TenantModel(
        id=initial_tenant_id, name="EmailOverride Tenant", subscription_tier=initial_tier,
        features={"email_pattern_analysis": True, "meeting_insights": True, "other_data": "original"},
        admin_email="emailoverride@example.com", admin_name="EmailOverride Admin",
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant_override_email

    # Action: Update features directly to set email_pattern_analysis to False, against tier logic.
    # Ensure meeting_insights (also tier-dependent) remains True if not specified in this direct update.
    updates_email_override = {"features": {"email_pattern_analysis": False, "other_data": "changed_value"}}
    updated_tenant_override_email = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates_email_override, user_id=None)

    # Assertion
    assert updated_tenant_override_email.subscription_tier == initial_tier # Tier didn't change
    assert updated_tenant_override_email.features.get("email_pattern_analysis") is False # Overridden
    # meeting_insights was not in updates["features"], so it should be re-evaluated based on current_tier ("professional")
    assert updated_tenant_override_email.features.get("meeting_insights") is True # Should remain True (based on 'professional' tier)
    assert updated_tenant_override_email.features.get("other_data") == "changed_value" # Explicitly updated


# --- Tests for "language_learning_support" flag ---

def test_create_tenant_language_learning_flag_professional_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    created_tenant = tenant_service.create_tenant(name="LangPro Tenant", admin_email="langpro@example.com", admin_name="LangPro Admin", subscription_tier="professional")
    assert created_tenant.features.get("language_learning_support") is True
    assert created_tenant.features.get("email_pattern_analysis") is True # Check other flags

def test_create_tenant_language_learning_flag_enterprise_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    created_tenant = tenant_service.create_tenant(name="LangEnt Tenant", admin_email="langent@example.com", admin_name="LangEnt Admin", subscription_tier="enterprise")
    assert created_tenant.features.get("language_learning_support") is True

def test_create_tenant_language_learning_flag_basic_tier(tenant_service: TenantService, mock_db_session: MagicMock):
    created_tenant = tenant_service.create_tenant(name="LangBasic Tenant", admin_email="langbasic@example.com", admin_name="LangBasic Admin", subscription_tier="basic")
    assert created_tenant.features.get("language_learning_support") is False

def test_update_tenant_tier_updates_language_learning_flag(tenant_service: TenantService, mock_db_session: MagicMock):
    initial_tenant_id = 12
    initial_tier = "basic"
    mock_initial_tenant = TenantModel(
        id=initial_tenant_id, name="LangUpdate Tenant", subscription_tier=initial_tier,
        features={"language_learning_support": False, "email_pattern_analysis": False, "other_stuff": "persists"},
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant

    updated_tenant_pro = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates={"subscription_tier": "professional"}, user_id=None)
    assert updated_tenant_pro.subscription_tier == "professional"
    assert updated_tenant_pro.features.get("language_learning_support") is True
    assert updated_tenant_pro.features.get("email_pattern_analysis") is True
    assert updated_tenant_pro.features.get("other_stuff") == "persists"

    mock_db_session.commit.reset_mock()
    mock_db_session.refresh.reset_mock()

    updated_tenant_basic = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates={"subscription_tier": "basic"}, user_id=None)
    assert updated_tenant_basic.subscription_tier == "basic"
    assert updated_tenant_basic.features.get("language_learning_support") is False
    assert updated_tenant_basic.features.get("email_pattern_analysis") is False
    assert updated_tenant_basic.features.get("other_stuff") == "persists"

def test_update_tenant_direct_feature_override_language_learning_flag(tenant_service: TenantService, mock_db_session: MagicMock):
    initial_tenant_id = 13
    initial_tier = "enterprise" # language_learning_support would be True
    mock_initial_tenant = TenantModel(
        id=initial_tenant_id, name="LangOverride Tenant", subscription_tier=initial_tier,
        features={"language_learning_support": True, "email_pattern_analysis": True, "other_stuff": "original_value"},
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    mock_db_session.query(TenantModel).filter(TenantModel.id == initial_tenant_id).first.return_value = mock_initial_tenant

    updates = {"features": {"language_learning_support": False, "other_stuff": "new_value"}}
    updated_tenant = tenant_service.update_tenant(tenant_id=initial_tenant_id, updates=updates, user_id=None)

    assert updated_tenant.subscription_tier == initial_tier
    assert updated_tenant.features.get("language_learning_support") is False # Overridden
    # email_pattern_analysis was not in updates["features"], so it should be re-evaluated based on current_tier ("enterprise")
    assert updated_tenant.features.get("email_pattern_analysis") is True # Should remain True
    assert updated_tenant.features.get("other_stuff") == "new_value"


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
