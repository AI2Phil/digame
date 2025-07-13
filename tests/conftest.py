import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.database import Base  # Adjust if your Base is elsewhere, e.g. app.models.user or app.db
from app.models.user import User # Assuming User model is here
from app.models.notifications import Notification # Import Notification model as well
from app.models.rbac import Role, UserRole  # Import RBAC models
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
def db_session() -> Session:
    """
    Pytest fixture to create a new database session for each test function.
    Creates all tables before the test and drops them afterwards.
    """
    # Create all tables defined by Base's subclasses
    # Ensure all models that extend Base are imported before this line,
    # so Base.metadata knows about them. (User, Notification are imported above)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        yield db  # Provide the session to the test
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine) # Clean up by dropping all tables

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
    user_role = UserRole(
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
    user_role_assignment = UserRole(
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