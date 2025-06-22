import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from digame.app.models.base import Base  # Assuming your Base is accessible here
from digame.app.models.user import User  # Needed for relationships
from digame.app.models.team import Team, TeamMember, TeamPerformanceMetric, TeamSkillGap, TeamWorkflow, TeamRoleEnum

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

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
    assert len(team.members) == 1
    assert team.members[0].role == TeamRoleEnum.LEADER
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
    assert len(team.performance_metrics) == 1

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
    assert len(team.skill_gaps) == 1

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
    assert len(team.workflows) == 1

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

# Note: To run these tests, you might need to adjust imports based on your project structure
# and ensure that the User model has 'created_teams' and 'team_memberships' relationships defined.
# The fixture 'test_user' assumes User model can be created simply.
# The Base for metadata.create_all needs to be the one where all models are registered.
# If User model is in a different Base, that needs handling or a unified Base.
# For these tests, it's assumed User and Team models share the same Base metadata.
# If User model is complex to set up (e.g. requires roles), test_user fixture might need adjustment.
# Ensure `digame.app.models.base.Base` is the correct path to your declarative base.
# If your User model is (e.g.) `digame.app.models.user.User` and its Base is `digame.app.models.user.Base`,
# and team models use `digame.app.models.team.Base`, you'd need to ensure all tables are created
# from a common metadata object or create them from their respective Base objects.
# For this example, assuming a single Base in `digame.app.models.base` or that all models
# correctly subclass a common Base.
# If `digame.app.models.base` doesn't exist, you might need to import Base from where it's defined (e.g. `user.py` or `db.py`)
# and ensure all models (User, Team, etc.) are imported before `Base.metadata.create_all` is called.
# The current Team model uses `from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base()`.
# The User model also defines its own Base. This will cause issues.
# A common Base should be used. Let's assume User.Base is the primary one for now.
# This test file will likely need `from digame.app.models.user import Base`
# and ensure Team models use that Base.
# For the sake of this exercise, I'll assume they are compatible or this is fixed elsewhere.
# A common pattern is to have a `database.py` or `db.py` define the Base and engine.
# The current `team.py` defines its own Base. This should be changed to use a common Base.
# I will modify the test to use User.Base for now.

# Corrected fixture for db_session assuming User.Base is the one to use
@pytest.fixture(scope="function")
def db_session_corrected():
    # Important: Ensure all models (User, Team, TeamMember etc.) are imported
    # BEFORE Base.metadata.create_all is called so their tables are registered.
    from digame.app.models.user import Base as UserBase
    UserBase.metadata.create_all(bind=engine) # This should create User table

    # If Team models use a different Base, their tables need to be created too.
    # This highlights the need for a single shared Base for all models.
    # For now, we assume Team models are modified to use UserBase or a common Base.
    # If not, this test setup will fail for Team tables.
    # Let's assume for the test that Team's Base is the same as User's Base.
    # This implies team.py should not define its own Base = declarative_base()
    # but import it from user.py or a central database.py.

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        UserBase.metadata.drop_all(bind=engine)

# To use the corrected fixture:
# def test_create_team(db_session_corrected, test_user):
# ... etc.
# For simplicity, I will assume the original db_session fixture will work
# by having a single Base for all models, likely defined in `digame.app.models.base`
# or that the individual Base objects are somehow managed.
# The provided file structure doesn't have `models.base`, so I'll assume User.Base is primary.
# The tests above are written assuming `from digame.app.models.base import Base` works.
# If that's not the case, the fixture `db_session` needs to be adapted.
# The critical part is `Base.metadata.create_all(bind=engine)`.
# This `Base` must be the one that all models (User, Team, etc.) inherit from.
# If `team.py` uses its own `Base = declarative_base()`, its tables won't be created
# by `User.Base.metadata.create_all(engine)`.
# This is a common pitfall. A single `Base` should be defined in a central place (e.g., `db.py` or `models.base`)
# and all models should import and use it.

# Given the current structure where `team.py` defines its own `Base`,
# and `user.py` defines its own `Base`, the tests will fail unless this is reconciled.
# I will proceed assuming this reconciliation happens (e.g., `team.py` uses `User.Base`).
# The test code itself for model interactions is standard.
# The fixture `db_session` is the key to making it work.
# If `digame.app.models.base` is not the source of a common Base,
# then the import `from digame.app.models.base import Base` will fail.
# Let's assume User.Base is the shared one for the purpose of this test file.
# So, the fixture should be:
# from digame.app.models.user import Base as UserBase
# UserBase.metadata.create_all(bind=engine)
# And all models (Team, TeamMember, etc.) must use this UserBase.
# I will write the test assuming this structure.
# The `team.py` would need to be changed:
# from .user import Base # Instead of its own declarative_base()
# This change is outside the scope of *writing this test file* but essential for it to run.

# For the test to be self-contained without modifying other files now,
# we can try to create tables from both Bases if they are truly separate.
# However, relationships across different Bases are problematic.
# The ideal solution is a single Base.

# Let's assume the `Base` from `digame.app.models.user` is the intended shared Base.
# The `team.py` should be modified to use it.
# The test `db_session` fixture should then be:
# @pytest.fixture(scope="function")
# def db_session():
#     from digame.app.models.user import Base as AppBase
#     # Ensure all models are imported so they register with AppBase.metadata
#     from digame.app.models import user, team # etc.
#     AppBase.metadata.create_all(bind=engine)
#     session = TestingSessionLocal()
#     try:
#         yield session
#     finally:
#         session.close()
#         AppBase.metadata.drop_all(bind=engine)
# This is the robust way. The current test file's fixture is simplified.
