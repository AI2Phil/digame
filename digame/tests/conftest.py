import pytest
import os
from unittest.mock import patch

import torch
import torch.nn as nn
import torch.optim as optim
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session as SQLAlchemySession

# --- Predictive Model Fixtures (from original conftest) ---
from digame.app.predictive import PredictiveModel # Assuming this path is correct
MODEL_FILENAME = "test_predictive_model.pth"
INPUT_SIZE_TEST = 5
HIDDEN_SIZE_TEST = 10
NUM_LAYERS_TEST = 1
OUTPUT_SIZE_TEST = 1

@pytest.fixture
def dummy_model_and_optimizer():
    model = PredictiveModel(
        input_size=INPUT_SIZE_TEST,
        hidden_size=HIDDEN_SIZE_TEST,
        num_layers=NUM_LAYERS_TEST,
        output_size=OUTPUT_SIZE_TEST
    )
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    return model, optimizer

@pytest.fixture
def temp_model_path(tmp_path):
    return tmp_path / MODEL_FILENAME

@pytest.fixture
def patched_model_path(temp_model_path):
    module_to_patch = 'digame.app.routers.predictive.MODEL_FILE_PATH'
    with patch(module_to_patch, str(temp_model_path)) as patched_path:
        yield patched_path

# --- Database Fixtures for Testing ---
# Using SQLite in-memory for tests
SQLALCHEMY_DATABASE_URL_TEST = "sqlite:///:memory:"

engine_test = create_engine(
    SQLALCHEMY_DATABASE_URL_TEST, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

# Import Base from your models. All models should share the same Base.
# Assuming user.py's Base is the one used by all SQLAlchemy models (User, Role, Permission)
from digame.app.models.user import Base as AppBase

@pytest.fixture(scope="session", autouse=True)
def create_test_tables():
    """Create all tables in the in-memory SQLite database once per session."""
    AppBase.metadata.create_all(bind=engine_test)
    yield
    # AppBase.metadata.drop_all(bind=engine_test) # Optional: drop tables after session

@pytest.fixture
def db_session_test() -> SQLAlchemySession:
    """Provides a SQLAlchemy session for tests."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- FastAPI Test Client Fixture ---
# This needs the main app instance and to override get_db dependency
from digame.app.main import app as fastapi_app # Main application
# The get_db dependency used in your routers, e.g., from admin_rbac_router or a common dependencies file.
# Adjust this import path to where your actual get_db for the app is defined.
# For this example, I'm assuming admin_rbac_router.py defines get_db,
# but ideally, it would be in a common dependencies.py or db/session.py.
from digame.app.routers.admin_rbac_router import get_db as app_get_db 
# Or, if get_db is in, for example, digame.app.dependencies:
# from digame.app.dependencies import get_db as app_get_db

def override_get_db_test():
    """Override for get_db dependency to use the test database."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Apply the override to the app for the test client
fastapi_app.dependency_overrides[app_get_db] = override_get_db_test

@pytest.fixture
def client(create_test_tables) -> TestClient: # Ensure tables are created before client is used
    """Provides a TestClient for the FastAPI application with DB override."""
    # The create_test_tables fixture is autouse=True and scope="session",
    # so tables are created once. Explicit dependency here ensures order if needed.
    with TestClient(fastapi_app) as c:
        yield c

# --- Mock User Fixtures for RBAC Tests ---
# (To be used when testing protected routes)
from digame.app.models.user import User as SQLAlchemyUser
from digame.app.models.rbac import Role as SQLAlchemyRole, Permission as SQLAlchemyPermission
from digame.app.auth.auth_dependencies import MANAGE_RBAC_PERMISSION # The permission string

@pytest.fixture
def test_admin_user(db_session_test: SQLAlchemySession) -> SQLAlchemyUser:
    """Creates an admin user with the MANAGE_RBAC_PERMISSION for testing."""
    # Define all permissions test_admin_user should have
    admin_permissions_names = [
        MANAGE_RBAC_PERMISSION, 
        "train_own_predictive_model", 
        "run_own_prediction",
        "log_own_digital_activity",
        "view_own_activity_logs",
        "train_own_behavior_model",
        "view_own_behavior_patterns",
        "trigger_own_process_discovery", # Added for Process Notes
        "view_own_process_notes",        # Added for Process Notes
        "add_feedback_own_process_notes", # Added for feedback endpoint
        "view_own_tasks",                # Added for Task Management
        "manage_own_tasks",              # Added for Task Management
        "trigger_own_task_suggestions"   # Added for Task Management
    ]
    
    created_permissions = []
    for perm_name in admin_permissions_names:
        perm = db_session_test.query(SQLAlchemyPermission).filter_by(name=perm_name).first()
        if not perm:
            perm = SQLAlchemyPermission(name=perm_name, description=f"Permission for {perm_name}")
            db_session_test.add(perm)
            db_session_test.commit()
            db_session_test.refresh(perm)
        created_permissions.append(perm)

    # Create Role if it doesn't exist
    admin_role = db_session_test.query(SQLAlchemyRole).filter_by(name="TestAdminRole").first()
    if not admin_role:
        admin_role = SQLAlchemyRole(name="TestAdminRole", description="Test role with broad permissions for testing.")
        db_session_test.add(admin_role)
        db_session_test.commit() # Commit to get role ID
        db_session_test.refresh(admin_role)
    
    # Add all defined permissions to the admin_role
    needs_commit = False
    for p in created_permissions:
        if p not in admin_role.permissions:
            admin_role.permissions.append(p)
            needs_commit = True
    if needs_commit:
        db_session_test.commit()
        db_session_test.refresh(admin_role)

    # Create User
    user = db_session_test.query(SQLAlchemyUser).filter_by(email="admin_test@example.com").first()
    if not user:
        user = SQLAlchemyUser(
            username="admin_test_user",
            email="admin_test@example.com",
            hashed_password="fake_hashed_password", # Not used by auth dependency directly if overridden
            is_active=True
        )
        db_session_test.add(user)
        db_session_test.commit() # Commit to get user ID
        db_session_test.refresh(user)

    if admin_role not in user.roles:
        user.roles.append(admin_role)
        db_session_test.commit()
        db_session_test.refresh(user)
        
    # Ensure relationships are loaded for the rbac_service.user_has_permission check
    # This might require detaching and re-fetching or specific loading options if the session is tricky.
    # For this fixture, we assume the relationships are correctly populated and accessible.
    # A re-query can ensure data is fresh from the DB with relationships.
    user = db_session_test.query(SQLAlchemyUser).filter_by(id=user.id).options(
        orm.joinedload(SQLAlchemyUser.roles).joinedload(SQLAlchemyRole.permissions)
    ).one()
    return user


@pytest.fixture
def test_non_admin_user(db_session_test: SQLAlchemySession) -> SQLAlchemyUser:
    """Creates a non-admin user for testing."""
    user = db_session_test.query(SQLAlchemyUser).filter_by(email="non_admin_test@example.com").first()
    if not user:
        user = SQLAlchemyUser(
            username="non_admin_test_user",
            email="non_admin_test@example.com",
            hashed_password="fake_hashed_password",
            is_active=True
        )
        db_session_test.add(user)
        db_session_test.commit()
        db_session_test.refresh(user)
    return user

# Add 'orm' import for the joinedload in test_admin_user
from sqlalchemy import orm
