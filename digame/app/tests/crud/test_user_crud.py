import pytest
import random
import string
from typing import List, Optional, Dict, Any

from sqlalchemy.orm import Session

# Assuming conftest.py is in digame/app/tests/ and provides db_session_test
# This path might need adjustment if conftest is elsewhere relative to execution
try:
    from digame.app.tests.conftest import db_session_test
except ImportError:
    # Fallback for local execution if PYTHONPATH is not set ideally
    from ..conftest import db_session_test


from digame.app.models.user import User as UserModel
from digame.app.schemas.user_schemas import UserCreate, UserUpdate
from digame.app.crud import user_crud

# Helper to generate unique strings for usernames and emails
def random_lower_string(k: int = 8) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=k))

# Test data for new fields
TEST_SKILLS = ["python", "fastapi", "sqlalchemy"]
TEST_LEARNING_GOALS = ["kubernetes", "testing"]
TEST_INTERESTS = ["ai", "oss"]
TEST_PROJECTS = ["project_x", "project_y"]


@pytest.fixture(scope="function")
def test_user_data_full() -> Dict[str, Any]:
    suffix = random_lower_string()
    return {
        "username": f"cruduser_full_{suffix}",
        "email": f"cruduser_full_{suffix}@example.com",
        "password": "testpassword",
        "first_name": "Test",
        "last_name": "UserFull",
        "is_active": True,
        "skills": TEST_SKILLS.copy(),
        "learning_goals": TEST_LEARNING_GOALS.copy(),
        "interests": TEST_INTERESTS.copy(),
        "current_projects": TEST_PROJECTS.copy(),
        "is_seeking_mentor": True,
        "is_offering_mentorship": False,
    }

@pytest.fixture(scope="function")
def test_user_data_minimal() -> Dict[str, Any]:
    suffix = random_lower_string()
    return {
        "username": f"cruduser_min_{suffix}",
        "email": f"cruduser_min_{suffix}@example.com",
        "password": "testpassword",
        # skills is non-nullable in model, so it must be provided.
        # In schemas, it's Optional, so UserCreate allows omitting it.
        # This implies user_crud.create_user needs to handle this,
        # or the model's default/server_default for 'skills' must work.
        # For testing, let's provide it, assuming UserCreate requires it if model does.
        "skills": [],
    }

def test_create_user_with_all_new_fields(db_session_test: Session, test_user_data_full: Dict[str, Any]):
    """Test creating a user with all new fields populated."""
    user_in = UserCreate(**test_user_data_full)
    created_user = user_crud.create_user(db=db_session_test, user=user_in)

    assert created_user is not None
    assert created_user.username == test_user_data_full["username"]
    assert created_user.email == test_user_data_full["email"]
    assert created_user.first_name == test_user_data_full["first_name"]
    assert created_user.last_name == test_user_data_full["last_name"]
    assert created_user.is_active == test_user_data_full["is_active"]

    assert created_user.skills == test_user_data_full["skills"]
    assert created_user.learning_goals == test_user_data_full["learning_goals"]
    assert created_user.interests == test_user_data_full["interests"]
    assert created_user.current_projects == test_user_data_full["current_projects"]
    assert created_user.is_seeking_mentor == test_user_data_full["is_seeking_mentor"]
    assert created_user.is_offering_mentorship == test_user_data_full["is_offering_mentorship"]

    # Verify password hashing (optional here, but good practice)
    assert user_crud.verify_password(test_user_data_full["password"], created_user.hashed_password)

def test_create_user_with_minimal_new_fields(db_session_test: Session, test_user_data_minimal: Dict[str, Any]):
    """Test creating a user with only required fields and check defaults for new fields."""
    user_in = UserCreate(**test_user_data_minimal)
    created_user = user_crud.create_user(db=db_session_test, user=user_in)

    assert created_user is not None
    assert created_user.username == test_user_data_minimal["username"]
    assert created_user.email == test_user_data_minimal["email"]

    # Check defaults or provided values
    assert created_user.skills == [] # Provided as empty list
    assert created_user.learning_goals is None # Model: nullable, Schema: Optional
    assert created_user.interests is None      # Model: nullable, Schema: Optional
    assert created_user.current_projects is None # Model: nullable, Schema: Optional
    assert created_user.is_seeking_mentor is False # Model: default False, Schema: Optional
    assert created_user.is_offering_mentorship is False # Model: default False, Schema: Optional

def test_update_user_new_fields(db_session_test: Session, test_user_data_minimal: Dict[str, Any]):
    """Test updating the new fields on an existing user."""
    # 1. Create a user first
    user_in_create = UserCreate(**test_user_data_minimal)
    created_user = user_crud.create_user(db=db_session_test, user=user_in_create)
    assert created_user is not None
    user_id = created_user.id

    # 2. Define updates
    updated_skills = ["new_skill1", "new_skill2"]
    updated_learning_goals = ["goal1_updated"]
    updated_interests = ["interest1_updated"]
    updated_projects = [{"name": "proj_updated", "status": "active"}] # Example with object
    updated_is_seeking_mentor = True
    updated_is_offering_mentorship = True

    user_update_data = UserUpdate(
        skills=updated_skills,
        learning_goals=updated_learning_goals,
        interests=updated_interests,
        current_projects=updated_projects,
        is_seeking_mentor=updated_is_seeking_mentor,
        is_offering_mentorship=updated_is_offering_mentorship,
    )

    # 3. Perform update
    updated_user = user_crud.update_user(db=db_session_test, user_id=user_id, user=user_update_data)
    assert updated_user is not None

    # 4. Verify updated fields
    assert updated_user.skills == updated_skills
    assert updated_user.learning_goals == updated_learning_goals
    assert updated_user.interests == updated_interests
    assert updated_user.current_projects == updated_projects
    assert updated_user.is_seeking_mentor == updated_is_seeking_mentor
    assert updated_user.is_offering_mentorship == updated_is_offering_mentorship

    # Verify other fields remain unchanged (e.g., username)
    assert updated_user.username == test_user_data_minimal["username"]

def test_get_user_retrieves_new_fields(db_session_test: Session, test_user_data_full: Dict[str, Any]):
    """Ensure new fields are present when a user is fetched."""
    user_in_create = UserCreate(**test_user_data_full)
    created_user_instance = user_crud.create_user(db=db_session_test, user=user_in_create)
    user_id = created_user_instance.id

    fetched_user = user_crud.get_user(db=db_session_test, user_id=user_id)
    assert fetched_user is not None

    assert fetched_user.skills == test_user_data_full["skills"]
    assert fetched_user.learning_goals == test_user_data_full["learning_goals"]
    assert fetched_user.interests == test_user_data_full["interests"]
    assert fetched_user.current_projects == test_user_data_full["current_projects"]
    assert fetched_user.is_seeking_mentor == test_user_data_full["is_seeking_mentor"]
    assert fetched_user.is_offering_mentorship == test_user_data_full["is_offering_mentorship"]

# More specific tests could be added:
# - Test updating only one field at a time.
# - Test providing empty lists or None to nullable fields during update.
# - Test behavior if skills (non-nullable) is attempted to be set to None during update.
#   (This should ideally be caught by Pydantic validation in UserUpdate or by DB).

# Note: These tests assume that user_crud.create_user and user_crud.update_user
# have been updated to handle the new fields from UserCreate and UserUpdate schemas.
# If those CRUD functions only process the original set of fields, these tests will
# likely fail on the assertions for the new fields.
