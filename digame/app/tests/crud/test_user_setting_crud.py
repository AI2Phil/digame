import json
import pytest
import random
import string
from sqlalchemy.orm import Session

# Assuming conftest.py is in digame/app/tests/ and provides db_session_test
from digame.app.tests.conftest import db_session_test

from digame.app.models.user import User as UserModel
from digame.app.models.user_setting import UserSetting as UserSettingModel # Ensure this is imported
from digame.app.schemas.user_setting_schemas import UserSettingCreate, UserSettingUpdate
from digame.app.crud import user_setting_crud
# user_crud is not strictly needed if we create UserModel directly as per instructions

# Helper to create a unique user for each test function or case
def create_db_test_user(db: Session, username_prefix: str, email_prefix: str) -> UserModel:
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    test_user = UserModel(
        username=f"{username_prefix}_{random_suffix}",
        email=f"{email_prefix}_{random_suffix}@example.com",
        hashed_password="fake_hashed_password_crud", # Not used by these CRUD tests directly
        is_active=True
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    return test_user

def test_create_user_setting(db_session_test: Session):
    """
    Test creating user settings:
    - With sample API keys.
    - With api_keys=None.
    """
    test_user = create_db_test_user(db_session_test, "crud_create_user", "crud_create_email")
    user_id = test_user.id

    # 1. Test creating with some API keys
    api_keys_data_1 = {"service1_create": "key_data_1", "service2_create": "key_data_2"}
    settings_in_1 = UserSettingCreate(api_keys=api_keys_data_1)
    
    created_settings_1 = user_setting_crud.create_user_setting(db=db_session_test, user_id=user_id, settings=settings_in_1)
    
    assert created_settings_1 is not None
    assert created_settings_1.user_id == user_id
    assert created_settings_1.api_keys is not None # Stored as JSON string
    
    retrieved_api_keys_1 = json.loads(created_settings_1.api_keys)
    assert retrieved_api_keys_1 == api_keys_data_1

    # 2. Test creating with api_keys = None (should store "{}")
    # UserSetting has a unique constraint on user_id. Need a new user or delete existing setting.
    test_user_2 = create_db_test_user(db_session_test, "crud_create_none_user", "crud_create_none_email")
    user_id_2 = test_user_2.id

    settings_in_2 = UserSettingCreate(api_keys=None)
    created_settings_2 = user_setting_crud.create_user_setting(db=db_session_test, user_id=user_id_2, settings=settings_in_2)
    
    assert created_settings_2 is not None
    assert created_settings_2.user_id == user_id_2
    assert created_settings_2.api_keys is not None # Stored as JSON string
    retrieved_api_keys_2 = json.loads(created_settings_2.api_keys)
    assert retrieved_api_keys_2 == {}

def test_get_user_setting(db_session_test: Session):
    """
    Test retrieving user settings:
    - For a user with existing settings.
    - For a user without settings (should return None).
    """
    # 1. User without settings
    test_user_no_settings = create_db_test_user(db_session_test, "crud_get_no_settings_user", "crud_get_no_settings_email")
    retrieved_settings_none = user_setting_crud.get_user_setting(db=db_session_test, user_id=test_user_no_settings.id)
    assert retrieved_settings_none is None

    # 2. User with existing settings
    test_user_with_settings = create_db_test_user(db_session_test, "crud_get_with_settings_user", "crud_get_with_settings_email")
    user_id_with_settings = test_user_with_settings.id
    api_keys_data = {"service_get_exist": "key_get_exist_val"}
    settings_in = UserSettingCreate(api_keys=api_keys_data)
    user_setting_crud.create_user_setting(db=db_session_test, user_id=user_id_with_settings, settings=settings_in)

    retrieved_settings_exists = user_setting_crud.get_user_setting(db=db_session_test, user_id=user_id_with_settings)
    assert retrieved_settings_exists is not None
    assert retrieved_settings_exists.user_id == user_id_with_settings
    stored_api_keys = json.loads(retrieved_settings_exists.api_keys)
    assert stored_api_keys == api_keys_data

def test_update_user_setting(db_session_test: Session):
    """
    Test updating user settings:
    - Update existing api_keys.
    - Set api_keys to None (should store "{}").
    - Set api_keys to an empty dict (should store "{}").
    """
    test_user = create_db_test_user(db_session_test, "crud_update_user", "crud_update_email")
    user_id = test_user.id

    # Initial creation
    initial_api_keys = {"initial_key_update": "initial_value_update"}
    settings_create = UserSettingCreate(api_keys=initial_api_keys)
    user_setting_crud.create_user_setting(db=db_session_test, user_id=user_id, settings=settings_create)

    # 1. Update existing api_keys
    updated_api_keys_1 = {"updated_key_1": "updated_value_1", "new_key_1": "new_value_1"}
    settings_update_1 = UserSettingUpdate(api_keys=updated_api_keys_1)
    updated_db_settings_1 = user_setting_crud.update_user_setting(db=db_session_test, user_id=user_id, settings=settings_update_1)
    assert updated_db_settings_1 is not None
    assert json.loads(updated_db_settings_1.api_keys) == updated_api_keys_1

    # 2. Set api_keys to None (should store "{}")
    settings_update_2 = UserSettingUpdate(api_keys=None)
    updated_db_settings_2 = user_setting_crud.update_user_setting(db=db_session_test, user_id=user_id, settings=settings_update_2)
    assert updated_db_settings_2 is not None
    assert json.loads(updated_db_settings_2.api_keys) == {}

    # 3. Set api_keys to an empty dict (should store "{}")
    settings_update_3 = UserSettingUpdate(api_keys={})
    updated_db_settings_3 = user_setting_crud.update_user_setting(db=db_session_test, user_id=user_id, settings=settings_update_3)
    assert updated_db_settings_3 is not None
    assert json.loads(updated_db_settings_3.api_keys) == {}

def test_delete_user_setting(db_session_test: Session):
    """
    Test deleting user settings:
    - Delete existing settings.
    - Test deleting non-existent settings (should return False).
    """
    test_user_del_existing = create_db_test_user(db_session_test, "crud_del_existing_user", "crud_del_existing_email")
    user_id_del_existing = test_user_del_existing.id

    # 1. Create and then delete settings
    api_keys_data = {"service_delete": "key_delete_val"}
    settings_in = UserSettingCreate(api_keys=api_keys_data)
    user_setting_crud.create_user_setting(db=db_session_test, user_id=user_id_del_existing, settings=settings_in)
    
    # Verify creation
    assert user_setting_crud.get_user_setting(db=db_session_test, user_id=user_id_del_existing) is not None
    
    delete_result_true = user_setting_crud.delete_user_setting(db=db_session_test, user_id=user_id_del_existing)
    assert delete_result_true is True
    assert user_setting_crud.get_user_setting(db=db_session_test, user_id=user_id_del_existing) is None

    # 2. Test deleting non-existent settings
    test_user_del_non_existent = create_db_test_user(db_session_test, "crud_del_non_existent_user", "crud_del_non_existent_email")
    user_id_del_non_existent = test_user_del_non_existent.id
    # Ensure no settings exist for this user
    assert user_setting_crud.get_user_setting(db=db_session_test, user_id=user_id_del_non_existent) is None
    
    delete_result_false = user_setting_crud.delete_user_setting(db=db_session_test, user_id=user_id_del_non_existent)
    assert delete_result_false is False
