import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.database import Base  # Adjust if your Base is elsewhere, e.g. app.models.user or app.db
from app.models.user import User # Assuming User model is here
from app.models.notifications import Notification # Import Notification model as well
from app.models.rbac import Role, UserRoleAssignment  # Import RBAC models
from app.main import app  # Import the FastAPI app

# In-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} # Needed only for SQLite
)

# Use sessionmaker for creating sessions
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """
    Pytest fixture to create a new database session for each test function.
    Creates all tables before the test and drops them afterwards.
    """
    # Drop all tables first to ensure clean state
    Base.metadata.drop_all(bind=engine)
    
    # Create all tables defined by Base's subclasses with checkfirst=True
    # Ensure all models that extend Base are imported before this line,
    # so Base.metadata knows about them. (User, Notification are imported above)
    Base.metadata.create_all(bind=engine, checkfirst=True)

    db = TestingSessionLocal()
    try:
        yield db  # Provide the session to the test
    finally:
        db.close()
        # Clean up by dropping all tables after test
        Base.metadata.drop_all(bind=engine)

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