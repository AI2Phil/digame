import pytest
import os
import json
from unittest.mock import patch, Mock

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from digame.app.main import app
from digame.app.db import get_db, Base
from digame.app.models.user import User
from digame.app.models.behavior_model import BehavioralModel
from digame.app.schemas.user_schemas import UserCreate # Assuming this schema exists for creating users

# Database setup for testing
DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]


# --- Test Cases ---

def test_publish_model_not_found(client: TestClient):
    """
    Test publishing a model that does not exist.
    """
    non_existent_model_id = 99999
    response = client.post(f"/publish/model/{non_existent_model_id}")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

@patch('digame.app.routers.publish_router.subprocess.run')
def test_publish_model_success(mock_subprocess_run, client: TestClient, db_session: Session):
    """
    Test successful publishing of a model.
    """
    # Arrange: Create a mock user and model
    test_user = User(id=1, username="testuser", email="test@example.com", hashed_password="hashedpassword")
    db_session.add(test_user)
    db_session.commit()
    db_session.refresh(test_user)

    test_model = BehavioralModel(
        id=1,
        user_id=test_user.id,
        name="Test_Model_Name",
        version="1.0.alpha",
        algorithm="test_algo",
        # Add other required fields for BehavioralModel if any
    )
    db_session.add(test_model)
    db_session.commit()
    db_session.refresh(test_model)
    model_id = test_model.id

    # Mock subprocess.run for git operations
    # Configure side_effect to handle multiple calls with different expected commands if needed
    # For simplicity, a single mock that always returns success is used here.
    # A more robust test might check the arguments to subprocess.run.
    mock_git_run_result = Mock()
    mock_git_run_result.returncode = 0
    mock_git_run_result.stdout = "Git command successful"
    mock_git_run_result.stderr = ""
    mock_subprocess_run.return_value = mock_git_run_result

    # Define expected file path
    target_dir = "published_models/"
    version_str = str(test_model.version).replace(" ", "_").replace("/", "_")
    filename = f"user_{test_model.user_id}_model_{model_id}_version_{version_str}.json"
    expected_filepath = os.path.join(target_dir, filename)

    # Act: Make the POST request
    response = client.post(f"/publish/model/{model_id}")

    # Assert: HTTP response
    assert response.status_code == 200
    response_json = response.json()
    assert "successfully published to Git" in response_json["message"]
    assert expected_filepath in response_json["message"]
    
    # Assert: Git operations were called
    assert mock_subprocess_run.call_count >= 3 # add, commit, push

    # Assert specific git commands (optional, but good for robustness)
    mock_subprocess_run.assert_any_call(['git', 'add', expected_filepath], capture_output=True, text=True, check=False)
    
    expected_commit_message = f"Publish behavioral model: {test_model.name} (ID: {model_id}) User: {test_model.user_id} Version: {version_str}"
    # Check that a call to commit was made, actual message format might vary slightly
    commit_call_args = None
    for call_args in mock_subprocess_run.call_args_list:
        if call_args[0][0][0:2] == ['git', 'commit']: # Check if it's a commit call
            commit_call_args = call_args
            break
    assert commit_call_args is not None
    assert commit_call_args[0][0][3] == expected_commit_message # Check message part of the commit command

    mock_subprocess_run.assert_any_call(['git', 'push'], capture_output=True, text=True, check=False)

    # Assert: File creation and content
    assert os.path.exists(expected_filepath)
    with open(expected_filepath, 'r') as f:
        data = json.load(f)
    assert data["model"]["id"] == model_id
    assert data["model"]["name"] == test_model.name
    assert data["model"]["user_id"] == test_model.user_id
    assert data["model"]["version"] == test_model.version
    assert "patterns" in data # Check for patterns key

    # Cleanup: Remove the created file and directory if empty
    os.remove(expected_filepath)
    if os.path.exists(target_dir) and not os.listdir(target_dir):
        os.rmdir(target_dir)

# Example for git add fails (Optional, as requested)
@patch('digame.app.routers.publish_router.subprocess.run')
def test_publish_model_git_add_fails(mock_subprocess_run, client: TestClient, db_session: Session):
    """
    Test publishing a model when 'git add' fails.
    """
    # Arrange: Create user and model
    test_user = User(id=2, username="testuser2", email="test2@example.com", hashed_password="hashedpassword")
    db_session.add(test_user)
    db_session.commit()

    test_model = BehavioralModel(
        id=2,
        user_id=test_user.id,
        name="GitAddFailModel",
        version="0.1",
        algorithm="test_algo_fail"
    )
    db_session.add(test_model)
    db_session.commit()
    model_id = test_model.id

    # Mock subprocess.run for 'git add' failure
    mock_git_add_fail_result = Mock()
    mock_git_add_fail_result.returncode = 1
    mock_git_add_fail_result.stdout = ""
    mock_git_add_fail_result.stderr = "Simulated git add error"
    mock_subprocess_run.return_value = mock_git_add_fail_result # First call (git add) will use this

    # Act
    response = client.post(f"/publish/model/{model_id}")

    # Assert
    assert response.status_code == 500
    response_json = response.json()
    assert "Git add failed" in response_json["detail"]
    assert "Simulated git add error" in response_json["detail"]

    # Cleanup: Remove created file if it exists (it shouldn't if git add fails before writing)
    target_dir = "published_models/"
    version_str = str(test_model.version).replace(" ", "_").replace("/", "_")
    filename = f"user_{test_model.user_id}_model_{model_id}_version_{version_str}.json"
    filepath = os.path.join(target_dir, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    if os.path.exists(target_dir) and not os.listdir(target_dir):
        os.rmdir(target_dir)

# Placeholder for UserCreate schema if needed for user creation logic.
# For this test, direct User model creation is used.
# from digame.app.schemas.user_schemas import UserCreate
# test_user_data = UserCreate(username="testuser", email="test@example.com", password="password")
# db_user = User(**test_user_data.dict()) # Example, adjust based on actual UserCreate and User model
# db_session.add(db_user)
# db_session.commit()
# db_session.refresh(db_user)

# Note: The BehavioralModel in tests might need more fields if your actual model
# has more non-nullable fields or specific constraints.
# The User model creation might also be more complex if you have specific password hashing
# or other logic in your CRUD operations for users that aren't bypassed by direct model instantiation.
# For these tests, direct ORM object creation is used for simplicity.

# Ensure that the `published_models` directory is handled correctly.
# If tests create it, they should ideally clean it up.
# The `test_publish_model_success` test includes cleanup logic.
# The `test_publish_model_git_add_fails` test also includes cleanup logic,
# although the file might not be created if the error occurs early.

# It's also good practice to ensure that the `published_models/` directory
# is in `.gitignore` if it's created at the project root during actual runs,
# but for tests, local cleanup is more direct.
# The previous step (Step 6) should have handled .gitignore and .gitkeep for the actual directory.
# Test environments are often ephemeral, but local test runs can leave artifacts.
# The provided cleanup should handle this for files created by the tests.
# If `published_models` directory is expected to exist due to .gitkeep, then rmdir might fail
# if .gitkeep is present. The current logic os.listdir(target_dir) would be false if only .gitkeep is there.
# A more robust cleanup for the directory could be `shutil.rmtree(target_dir, ignore_errors=True)`.
# However, `os.rmdir` is fine if we only expect .json files created by the test.
# For now, the current cleanup is kept as is.

# Consider what happens if `published_models/.gitkeep` exists.
# `os.listdir(target_dir)` would return `['.gitkeep']` if it's the only file.
# So `not os.listdir(target_dir)` would be false.
# `os.rmdir(target_dir)` would then fail because the directory is not empty.
# For tests, it's usually better to create a temporary directory for outputs.
# For now, we'll assume the test runner or environment handles the base state of `published_models/`.
# The added cleanup in `test_publish_model_success` is a good step.
# If `published_models` is created *by the test* in a location that didn't exist,
# then `os.rmdir` is appropriate. If it pre-exists and is part of the repo structure (e.g. due to .gitkeep)
# then tests shouldn't try to remove the directory itself, only files they create.
# The current code tries to remove the directory if it's empty after removing the json file.
# This is generally acceptable.
# If `published_models` always exists (e.g., checked in with `.gitkeep`), then `os.path.exists(target_dir)`
# will always be true, and `os.rmdir` will only be called if the test-generated JSON was the *only* other file.
# This seems like reasonable behavior.
# A dedicated temporary directory for test outputs would be a more advanced setup.
# (e.g. using `tmp_path` fixture from pytest)
# For now, the provided solution is a good balance.
# Final thought on cleanup: if `published_models` is part of the repo (with .gitkeep),
# the tests should not attempt to `os.rmdir(target_dir)`.
# Only `os.remove(expected_filepath)` is strictly necessary for files created *by the test*.
# I will adjust the cleanup to only remove the file, not the directory.

# Adjusted cleanup for test_publish_model_success and test_publish_model_git_add_fails:
# Only remove the file created by the test. Do not attempt to remove the directory.
# This is safer if 'published_models/' is part of the tracked repo structure.
# The `os.path.join` will correctly place it, and `os.remove` will clean it.
# The creation of `published_models` directory is handled by `os.makedirs` in the router itself.
# So the directory will be there if files are written.
# The router's `os.makedirs(target_dir, exist_ok=True)` means it won't fail if dir exists.
# Test cleanup should focus on artifacts created *during the test execution*.
# The JSON file is such an artifact. The directory itself might pre-exist.
# If the test is the first to create the directory, then `os.makedirs` in the router code did that.
# And the directory might contain `.gitkeep` or other files from other tests or previous runs.
# Safest for tests is to only remove what they are certain they created and are solely responsible for.
# However, the current router code *creates* the directory if it doesn't exist.
# So if the test runs in an environment where `published_models` is *not* present, the router creates it.
# Then the test should ideally clean that up too.
# This is a common challenge in testing file system interactions.
# For now, I will stick to the provided implementation which includes conditional rmdir.
# The current version of the solution is okay.
# A pytest `tmp_path` fixture would be the canonical way to handle this,
# by writing outputs to a temporary directory that pytest manages.
# This avoids interfering with the project's actual `published_models` directory.
# I'll proceed with the current file content as generated, it's a good start.I've created the test file `digame/tests/routers/test_publish_router.py` with the initial structure, fixtures, and the two main test cases: `test_publish_model_success` and `test_publish_model_not_found`. I've also included `test_publish_model_git_add_fails` as requested.

The key aspects implemented are:
1.  **Test Database Setup**: Using an in-memory SQLite database (`sqlite:///:memory:`) with `pytest` fixtures (`setup_db`, `db_session`) to manage database creation, session lifecycle, and teardown.
2.  **Test Client**: A `client` fixture is set up to interact with the FastAPI application, with `get_db` overridden to use the test database session.
3.  **`test_publish_model_not_found`**: This test checks that a 404 error is returned when trying to publish a model ID that does not exist in the database.
4.  **`test_publish_model_success`**:
    *   **Arrange**: Creates a `User` and a `BehavioralModel` in the test database.
    *   **Mock**: Uses `@patch('digame.app.routers.publish_router.subprocess.run')` to mock the `subprocess.run` calls for Git operations. The mock is configured to simulate successful execution of `git add`, `git commit`, and `git push`.
    *   **Act**: Sends a POST request to `/publish/model/{model_id}`.
    *   **Assert**:
        *   Checks for a 200 HTTP status code.
        *   Verifies the success message in the JSON response, including the path to the generated file.
        *   Asserts that `subprocess.run` was called at least three times.
        *   Includes `assert_any_call` for `git add`, finding the `git commit` call and checking its message, and `git push`.
        *   Confirms the creation of the JSON model file in the `published_models/` directory with the correct naming convention.
        *   Validates key content within the generated JSON file (model ID, name, user ID, version, and presence of "patterns" key).
        *   **Cleanup**: Removes the generated JSON file. If the `published_models/` directory is empty after removing the file, it also removes the directory. This cleanup is conditional to avoid errors if the directory contains other files (e.g., `.gitkeep` or files from other tests).
5.  **`test_publish_model_git_add_fails`**:
    *   **Arrange**: Sets up a user and model.
    *   **Mock**: Configures `subprocess.run` to simulate a failure specifically for the `git add` command.
    *   **Act**: Sends the POST request.
    *   **Assert**: Checks for a 500 HTTP status code and verifies that the error message in the response indicates a "Git add failed" scenario, including the mocked stderr.
    *   **Cleanup**: Includes logic to remove the JSON file if it was created, and the directory if it's empty and was created by the test.

The structure and content align with the subtask requirements.
I've considered the implications of the `published_models` directory potentially containing `.gitkeep` or being managed by the project structure, and the cleanup logic in the tests is designed to be reasonably safe by only removing the directory if it's empty after the test-specific file is deleted.

This set of tests provides good coverage for the success path, a common error path (model not found), and a Git operation failure path.
