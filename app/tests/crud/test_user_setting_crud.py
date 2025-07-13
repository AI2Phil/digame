import json
import pytest
import random
import string
from sqlalchemy.orm import Session

# Assuming conftest.py is in digame/app/tests/ and provides db_session
from app.tests.conftest import db_session

from app.models.user import User as UserModel
from app.models.user_setting import UserSetting as UserSettingModel # Ensure this is imported
from app.schemas.user_setting_schemas import UserSettingCreate, UserSettingUpdate
from app.crud import user_setting_crud
# user_crud is not strictly needed if we create UserModel directly as per instructions

# Helper to create a unique user for each test function or case
def create_db_test_user(db: Session, username_prefix: str, email_prefix: str) -> UserModel:
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    test_user = UserModel()  # type: ignore
    setattr(test_user, 'username', f"{username_prefix}_{random_suffix}")  # type: ignore
    setattr(test_user, 'email', f"{email_prefix}_{random_suffix}@example.com")  # type: ignore
    setattr(test_user, 'hashed_password', "fake_hashed_password_crud")  # type: ignore
    setattr(test_user, 'is_active', True)  # type: ignore
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    return test_user


def test_create_user_setting(db_session: Session):
    """
    Test creating user settings:
    - With sample API keys.
    - With api_keys=None.
    """
    test_user = create_db_test_user(db_session, "crud_create_user", "crud_create_email")
    user_id = getattr(test_user, 'id')  # type: ignore

    # 1. Test creating with some API keys
    api_keys_data_1 = {"service1_create": "key_data_1", "service2_create": "key_data_2"}
    settings_in_1 = UserSettingCreate(api_keys=api_keys_data_1)
    
    created_settings_1 = user_setting_crud.create_user_setting(db=db_session, user_id=user_id, settings=settings_in_1)
    
    assert created_settings_1 is not None
    assert getattr(created_settings_1, 'user_id') == user_id  # type: ignore
    assert getattr(created_settings_1, 'api_keys') is not None  # type: ignore # Stored as JSON string
    
    retrieved_api_keys_1 = json.loads(getattr(created_settings_1, 'api_keys'))  # type: ignore
    assert retrieved_api_keys_1 == api_keys_data_1

    # 2. Test creating with api_keys = None (should store "{}")
    # UserSetting has a unique constraint on user_id. Need a new user or delete existing setting.
    test_user_2 = create_db_test_user(db_session, "crud_create_none_user", "crud_create_none_email")
    user_id_2 = getattr(test_user_2, 'id')  # type: ignore

    settings_in_2 = UserSettingCreate(api_keys=None)
    created_settings_2 = user_setting_crud.create_user_setting(db=db_session, user_id=user_id_2, settings=settings_in_2)
    
    assert created_settings_2 is not None
    assert getattr(created_settings_2, 'user_id') == user_id_2  # type: ignore
    assert getattr(created_settings_2, 'api_keys') is not None  # type: ignore # Stored as JSON string
    retrieved_api_keys_2 = json.loads(getattr(created_settings_2, 'api_keys'))  # type: ignore
    assert retrieved_api_keys_2 == {}

def test_get_user_setting(db_session: Session):
    """
    Test retrieving user settings:
    - For a user with existing settings.
    - For a user without settings (should return None).
    """
    # 1. User without settings
    test_user_no_settings = create_db_test_user(db_session, "crud_get_no_settings_user", "crud_get_no_settings_email")
    retrieved_settings_none = user_setting_crud.get_user_setting(db=db_session, user_id=getattr(test_user_no_settings, 'id'))  # type: ignore
    assert retrieved_settings_none is None

    # 2. User with existing settings
    test_user_with_settings = create_db_test_user(db_session, "crud_get_with_settings_user", "crud_get_with_settings_email")
    user_id_with_settings = getattr(test_user_with_settings, 'id')  # type: ignore
    api_keys_data = {"service_get_exist": "key_get_exist_val"}
    settings_in = UserSettingCreate(api_keys=api_keys_data)
    user_setting_crud.create_user_setting(db=db_session, user_id=user_id_with_settings, settings=settings_in)

    retrieved_settings_exists = user_setting_crud.get_user_setting(db=db_session, user_id=user_id_with_settings)
    assert retrieved_settings_exists is not None
    assert getattr(retrieved_settings_exists, 'user_id') == user_id_with_settings  # type: ignore
    stored_api_keys = json.loads(getattr(retrieved_settings_exists, 'api_keys'))  # type: ignore
    assert stored_api_keys == api_keys_data

def test_update_user_setting(db_session: Session):
    """
    Test updating user settings:
    - Update existing api_keys.
    - Set api_keys to None (should store "{}").
    - Set api_keys to an empty dict (should store "{}").
    """
    test_user = create_db_test_user(db_session, "crud_update_user", "crud_update_email")
    user_id = getattr(test_user, 'id')  # type: ignore

    # Initial creation
    initial_api_keys = {"initial_key_update": "initial_value_update"}
    settings_create = UserSettingCreate(api_keys=initial_api_keys)
    user_setting_crud.create_user_setting(db=db_session, user_id=user_id, settings=settings_create)

    # 1. Update existing api_keys
    updated_api_keys_1 = {"updated_key_1": "updated_value_1", "new_key_1": "new_value_1"}
    settings_update_1 = UserSettingUpdate(api_keys=updated_api_keys_1)
    updated_db_settings_1 = user_setting_crud.update_user_setting(db=db_session, user_id=user_id, settings=settings_update_1)
    assert updated_db_settings_1 is not None
    assert json.loads(getattr(updated_db_settings_1, 'api_keys')) == updated_api_keys_1  # type: ignore

    # 2. Set api_keys to None (should store "{}")
    settings_update_2 = UserSettingUpdate(api_keys=None)
    updated_db_settings_2 = user_setting_crud.update_user_setting(db=db_session, user_id=user_id, settings=settings_update_2)
    assert updated_db_settings_2 is not None
    assert json.loads(getattr(updated_db_settings_2, 'api_keys')) == {}  # type: ignore

    # 3. Set api_keys to an empty dict (should store "{}")
    settings_update_3 = UserSettingUpdate(api_keys={})
    updated_db_settings_3 = user_setting_crud.update_user_setting(db=db_session, user_id=user_id, settings=settings_update_3)
    assert updated_db_settings_3 is not None
    assert json.loads(getattr(updated_db_settings_3, 'api_keys')) == {}  # type: ignore

def test_delete_user_setting(db_session: Session):
    """
    Test deleting user settings:
    - Delete existing settings.
    - Test deleting non-existent settings (should return False).
    """
    test_user_del_existing = create_db_test_user(db_session, "crud_del_existing_user", "crud_del_existing_email")
    user_id_del_existing = getattr(test_user_del_existing, 'id')  # type: ignore

    # 1. Create and then delete settings
    api_keys_data = {"service_delete": "key_delete_val"}
    settings_in = UserSettingCreate(api_keys=api_keys_data)
    user_setting_crud.create_user_setting(db=db_session, user_id=user_id_del_existing, settings=settings_in)
    
    # Verify creation
    assert user_setting_crud.get_user_setting(db=db_session, user_id=user_id_del_existing) is not None
    
    delete_result_true = user_setting_crud.delete_user_setting(db=db_session, user_id=user_id_del_existing)
    assert delete_result_true is True
    assert user_setting_crud.get_user_setting(db=db_session, user_id=user_id_del_existing) is None

    # 2. Test deleting non-existent settings
    test_user_del_non_existent = create_db_test_user(db_session, "crud_del_non_existent_user", "crud_del_non_existent_email")
    user_id_del_non_existent = getattr(test_user_del_non_existent, 'id')  # type: ignore
    # Ensure no settings exist for this user
    assert user_setting_crud.get_user_setting(db=db_session, user_id=user_id_del_non_existent) is None
    
    delete_result_false = user_setting_crud.delete_user_setting(db=db_session, user_id=user_id_del_non_existent)
    assert delete_result_false is False
