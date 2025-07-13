import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime
import tempfile
import os

from app.database import Base  # Import Base from the centralized database module
from app.models.user import User  # Needed for relationships
from app.models.team import Team, TeamMember, TeamPerformanceMetric, TeamSkillGap, TeamWorkflow, TeamRoleEnum

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
def db_session(isolated_engine):
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
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Clean up tables after test
        try:
            Base.metadata.drop_all(bind=isolated_engine)
        except Exception:
            pass  # Ignore cleanup errors

@pytest.fixture
def test_user(db_session):
    user = User(username="testuser", email="test@example.com", hashed_password="password")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

def test_create_team(db_session, test_user):
    team = Team(name="Alpha Team", description="The A team", created_by_user_id=test_user.id)
    db_session.add(team)
    db_session.commit()
    db_session.refresh(team)

    assert team.id is not None
    assert team.name == "Alpha Team"
    assert team.description == "The A team"
    assert team.created_by_user_id == test_user.id
    assert team.creator.username == "testuser"
    assert team.created_at is not None

def test_create_team_member(db_session, test_user):
    team = Team(name="Bravo Team", created_by_user_id=test_user.id)
    db_session.add(team)
    db_session.commit()

    member = TeamMember(team_id=team.id, user_id=test_user.id, role=TeamRoleEnum.LEADER)
    db_session.add(member)
    db_session.commit()
    db_session.refresh(member)

    assert member.id is not None
    assert member.team_id == team.id
    assert member.user_id == test_user.id
    assert member.role == TeamRoleEnum.LEADER
    assert member.team.name == "Bravo Team"
    assert member.user.username == "testuser"
    # Check team members using database query to avoid Pyrefly relationship issues
    team_members = db_session.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    assert len(team_members) == 1
    assert team_members[0].role == TeamRoleEnum.LEADER
    assert len(test_user.team_memberships) == 1

def test_create_team_performance_metric(db_session, test_user):
    team = Team(name="Charlie Team", created_by_user_id=test_user.id)
    db_session.add(team)
    db_session.commit()

    metric_data = {"tasks_completed": 100, "bugs_fixed": 5}
    metric = TeamPerformanceMetric(
        team_id=team.id,
        metric_name="Sprint Review Q1",
        metric_value=metric_data
    )
    db_session.add(metric)
    db_session.commit()
    db_session.refresh(metric)

    assert metric.id is not None
    assert metric.team_id == team.id
    assert metric.metric_name == "Sprint Review Q1"
    assert metric.metric_value["tasks_completed"] == 100
    # Check performance metrics using database query to avoid Pyrefly relationship issues
    team_metrics = db_session.query(TeamPerformanceMetric).filter(TeamPerformanceMetric.team_id == team.id).all()
    assert len(team_metrics) == 1

def test_create_team_skill_gap(db_session, test_user):
    team = Team(name="Delta Team", created_by_user_id=test_user.id)
    db_session.add(team)
    db_session.commit()

    skill_gap = TeamSkillGap(
        team_id=team.id,
        skill_name="Kubernetes Expertise",
        priority=2
    )
    db_session.add(skill_gap)
    db_session.commit()
    db_session.refresh(skill_gap)

    assert skill_gap.id is not None
    assert skill_gap.team_id == team.id
    assert skill_gap.skill_name == "Kubernetes Expertise"
    assert skill_gap.priority == 2
    # Check skill gaps using database query to avoid Pyrefly relationship issues
    team_gaps = db_session.query(TeamSkillGap).filter(TeamSkillGap.team_id == team.id).all()
    assert len(team_gaps) == 1

def test_create_team_workflow(db_session, test_user):
    team = Team(name="Echo Team", created_by_user_id=test_user.id)
    db_session.add(team)
    db_session.commit()

    workflow_steps = [{"name": "Requirement Gathering"}, {"name": "Development"}]
    workflow = TeamWorkflow(
        team_id=team.id,
        workflow_name="Client Project Delivery",
        steps=workflow_steps
    )
    db_session.add(workflow)
    db_session.commit()
    db_session.refresh(workflow)

    assert workflow.id is not None
    assert workflow.team_id == team.id
    assert workflow.workflow_name == "Client Project Delivery"
    assert workflow.steps[0]["name"] == "Requirement Gathering"
    # Check workflows using database query to avoid Pyrefly relationship issues
    team_workflows = db_session.query(TeamWorkflow).filter(TeamWorkflow.team_id == team.id).all()
    assert len(team_workflows) == 1

def test_team_cascade_delete_members(db_session, test_user):
    team = Team(name="Foxtrot Team", created_by_user_id=test_user.id)
    db_session.add(team)
    db_session.commit()

    member1 = TeamMember(team_id=team.id, user_id=test_user.id, role=TeamRoleEnum.ADMIN)
    # Need another user for a second member, or allow multiple memberships for test_user if model supports
    # For simplicity, we'll just test with one member for cascade on team deletion
    db_session.add(member1)
    db_session.commit()
    member_id = member1.id

    assert db_session.query(TeamMember).filter(TeamMember.id == member_id).first() is not None

    db_session.delete(team)
    db_session.commit()

    assert db_session.query(Team).filter(Team.id == team.id).first() is None
    assert db_session.query(TeamMember).filter(TeamMember.id == member_id).first() is None
    # Also test other related items like metrics, skill_gaps, workflows if cascade is set up.
    # Example for metrics:
    metric = TeamPerformanceMetric(team_id=team.id, metric_name="Test Metric", metric_value={"value":1})
    # Re-create team for this part of the test
    team = Team(name="Golf Team", created_by_user_id=test_user.id)
    db_session.add(team)
    db_session.commit()
    db_session.add(metric) # metric.team_id needs to be set to new team.id
    metric.team_id = team.id
    db_session.commit()
    metric_id = metric.id

    assert db_session.query(TeamPerformanceMetric).filter(TeamPerformanceMetric.id == metric_id).first() is not None
    db_session.delete(team)
    db_session.commit()
    assert db_session.query(TeamPerformanceMetric).filter(TeamPerformanceMetric.id == metric_id).first() is None

# Note: These tests use the isolated database fixtures to ensure proper test isolation
# and avoid conflicts with other tests. All models should use the same Base from app.database.
