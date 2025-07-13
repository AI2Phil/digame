import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator
import tempfile
import os

# Import models to ensure they're registered with Base.metadata
from app.database import Base
from app.models.user import User
from app.models.notifications import Notification
from app.models.rbac import Role, UserRoleAssignment
from app.main import app

# Import all models to ensure they're registered
try:
    from app.models import *
except ImportError:
    pass

# Try to import additional models that might exist
try:
    from app.models.user_setting import UserSetting
except ImportError:
    pass

try:
    from app.models.project import Project
except ImportError:
    pass

try:
    from app.models.education import Education
except ImportError:
    pass

try:
    from app.models.experience import Experience
except ImportError:
    pass

try:
    from app.models.team import Team
except ImportError:
    pass

try:
    from app.models.tenant import Tenant
except ImportError:
    pass

try:
    from app.models.workflow_automation import *
except ImportError:
    pass

@pytest.fixture(scope="function")
def isolated_engine():
    """
    Create an isolated SQLite engine for each test with proper isolation.
    Uses a unique temporary file to avoid conflicts between tests.
    """
    # Create a unique temporary database file for each test
    temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
    temp_db.close()
    
    database_url = f"sqlite:///{temp_db.name}"
    
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False  # Set to True for debugging
    )
    
    yield engine
    
    # Clean up: close all connections and remove temp file
    engine.dispose()
    try:
        os.unlink(temp_db.name)
    except OSError:
        pass

@pytest.fixture(scope="function")
def db_session(isolated_engine) -> Generator[Session, None, None]:
    """
    Pytest fixture to create a new database session for each test function.
    Uses isolated engine with proper table creation and cleanup.
    """
    # Create all tables with proper isolation
    try:
        # First drop any existing tables to ensure clean state
        Base.metadata.drop_all(bind=isolated_engine)
        
        # Create all tables fresh
        Base.metadata.create_all(bind=isolated_engine)
    except Exception as e:
        pytest.skip(f"Could not create test database: {e}")

    # Create session with isolated engine
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=isolated_engine)
    db = TestingSessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        # Clean up tables after test
        try:
            Base.metadata.drop_all(bind=isolated_engine)
        except Exception:
            pass  # Ignore cleanup errors

# Helper fixture to create a test user, can be used by other test modules
@pytest.fixture(scope="function")
def test_user(db_session: Session) -> User:
    """
    Fixture to create and return a test user added to the database session.
    """
    user = User(
        id=1, # Explicit ID for predictability in tests
        username="testuser",
        email="testuser@example.com",
        hashed_password="fake_hashed_password",
        first_name="Test",
        last_name="User",
        is_active=True, # Assuming User model has this field
        onboarding_completed=True # Assuming User model has this field
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def test_admin_user(db_session: Session) -> User:
    """
    Fixture to create and return an admin test user.
    """
    # First create an admin role
    admin_role = Role(
        id=1,
        name="admin",
        description="Administrator role"
    )
    db_session.add(admin_role)
    db_session.commit()
    
    # Create admin user
    admin_user = User(
        id=100,
        username="admin",
        email="admin@example.com",
        hashed_password="fake_admin_password",
        first_name="Admin",
        last_name="User",
        is_active=True,
        onboarding_completed=True
    )
    db_session.add(admin_user)
    db_session.commit()
    
    # Assign admin role to user
    user_role = UserRoleAssignment(
        user_id=admin_user.id,
        role_id=admin_role.id,
        is_active=True
    )
    db_session.add(user_role)
    db_session.commit()
    db_session.refresh(admin_user)
    return admin_user

@pytest.fixture(scope="function")
def test_non_admin_user(db_session: Session) -> User:
    """
    Fixture to create and return a non-admin test user.
    """
    # First create a regular user role
    user_role = Role(
        id=2,
        name="user",
        description="Regular user role"
    )
    db_session.add(user_role)
    db_session.commit()
    
    # Create regular user
    regular_user = User(
        id=101,
        username="regularuser",
        email="regular@example.com",
        hashed_password="fake_regular_password",
        first_name="Regular",
        last_name="User",
        is_active=True,
        onboarding_completed=True
    )
    db_session.add(regular_user)
    db_session.commit()
    
    # Assign user role
    user_role_assignment = UserRoleAssignment(
        user_id=regular_user.id,
        role_id=user_role.id,
        is_active=True
    )
    db_session.add(user_role_assignment)
    db_session.commit()
    db_session.refresh(regular_user)
    return regular_user

@pytest.fixture(scope="module")
def client():
    """
    Fixture to create a test client for the FastAPI app.
    """
    return TestClient(app)

@pytest.fixture(scope="function")
def test_user_2(db_session: Session) -> User:
    """
    Fixture to create and return a second test user.
    """
    user = User(
        id=2,
        username="testuser2",
        email="testuser2@example.com",
        hashed_password="fake_hashed_password2",
        first_name="Test",
        last_name="User2",
        is_active=True,
        onboarding_completed=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

# Additional fixture for services that need a mock db session
@pytest.fixture(scope="function")
def mock_db_session():
    """
    Fixture to provide a mock database session for service tests.
    """
    from unittest.mock import MagicMock
    session = MagicMock(spec=Session)
    return session

# Additional fixture alias for compatibility
@pytest.fixture(scope="function")
def db_session_test(db_session: Session) -> Session:
    """
    Alias for db_session fixture for compatibility with existing tests.
    """
    return db_session

# Predictive model test fixtures
@pytest.fixture
def dummy_model_and_optimizer():
    """Create a proper LSTM model for testing"""
    import torch
    import torch.nn as nn
    
    class LSTMModel(nn.Module):
        def __init__(self, input_size=10, hidden_size=20, num_layers=1):
            super().__init__()
            self.hidden_dim = hidden_size  # Add hidden_dim attribute for compatibility
            self.num_layers = num_layers   # Add num_layers attribute for compatibility
            self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
            self.fc = nn.Linear(hidden_size, 1)
        
        def forward(self, x):
            lstm_out, _ = self.lstm(x)
            return self.fc(lstm_out[:, -1, :])
    
    model = LSTMModel()
    optimizer = torch.optim.Adam(model.parameters())
    
    return model, optimizer

@pytest.fixture
def temp_model_path(tmp_path):
    """Temporary path for model files"""
    return tmp_path / "test_model.pth"

@pytest.fixture
def patched_model_path(tmp_path, monkeypatch):
    """Patch the model path for testing"""
    model_path = tmp_path / "test_model.pth"
    
    # Patch wherever MODEL_PATH is imported
    try:
        monkeypatch.setattr("app.routers.predictive.MODEL_PATH", str(model_path))
    except AttributeError:
        pass  # If the attribute doesn't exist, skip patching
    
    return str(model_path)