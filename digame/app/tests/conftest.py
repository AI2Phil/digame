import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from digame.app.database import Base  # Adjust if your Base is elsewhere, e.g. app.models.user or app.db
from digame.app.models.user import User # Assuming User model is here
from digame.app.models.notification import Notification # Import Notification model as well

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
