import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

# Models to import for type hinting and creating mock instances
from digame.app.models.user import User as UserModel, UserProfile as UserProfileModel

# Service to test
from digame.app.services.social_collaboration_service import SocialCollaborationService
# CRUD module to mock
from digame.app.crud import user_crud

# --- Fixtures ---

@pytest.fixture
def mock_db_session():
    db = MagicMock(spec=Session)
    # Default query mocks if needed, though most interactions will be via user_crud mock
    query_mock = db.query.return_value
    query_mock.filter.return_value = query_mock
    query_mock.first.return_value = None
    query_mock.all.return_value = []
    return db

@pytest.fixture
def social_collaboration_service(mock_db_session):
    return SocialCollaborationService(db=mock_db_session)

@pytest.fixture
def mock_user_1():
    return UserModel(id=1, username="user1", email="user1@example.com")

@pytest.fixture
def mock_user_profile_1_skills():
    return UserProfileModel(
        user_id=1,
        skills=["Python", "FastAPI", "SQL"],
        learning_goals=["Docker", "Kubernetes"],
        mentorship_preferences={"willing_to_mentor": True, "topics": ["Python"]}
    )

@pytest.fixture
def mock_user_2():
    return UserModel(id=2, username="user2", email="user2@example.com")

@pytest.fixture
def mock_user_profile_2_skills_match():
    return UserProfileModel(
        user_id=2,
        skills=["Python", "SQL", "JavaScript"],
        learning_goals=["FastAPI"],
        mentorship_preferences={"willing_to_mentor": False}
    )

@pytest.fixture
def mock_user_3():
    return UserModel(id=3, username="user3", email="user3@example.com")

@pytest.fixture
def mock_user_profile_3_learning_match():
    return UserProfileModel(
        user_id=3,
        skills=["Docker", "AWS"],
        learning_goals=["React"],
        mentorship_preferences={"willing_to_mentor": True, "topics": ["Docker", "AWS"]}
    )

@pytest.fixture
def mock_user_4_no_profile():
    return UserModel(id=4, username="user4", email="user4@example.com")


# --- Tests for SocialCollaborationService ---

@patch('digame.app.crud.user_crud.get_user_profile')
@patch('digame.app.crud.user_crud.get_users')
def test_get_skill_based_matches_success(
    mock_get_users, mock_get_user_profile,
    social_collaboration_service: SocialCollaborationService,
    mock_user_1, mock_user_profile_1_skills,
    mock_user_2, mock_user_profile_2_skills_match,
    mock_user_3, mock_user_profile_3_learning_match, # No skill overlap with user1
    mock_user_4_no_profile
):
    # Arrange
    target_user_id = 1
    mock_get_user_profile.side_effect = lambda db, user_id: {
        1: mock_user_profile_1_skills,
        2: mock_user_profile_2_skills_match,
        3: mock_user_profile_3_learning_match,
        4: None # User 4 has no profile
    }.get(user_id)

    mock_get_users.return_value = [mock_user_1, mock_user_2, mock_user_3, mock_user_4_no_profile]

    # Act
    matches = social_collaboration_service.get_skill_based_matches(user_id=target_user_id, limit=5)

    # Assert
    assert len(matches) == 1 # Only user2 should match on skills with user1
    assert matches[0].id == mock_user_2.id

    # Check that get_user_profile was called for relevant users
    # At least for user1 (target) and user2 (potential match with skills)
    # Call count depends on implementation details (e.g., if profile fetched before filtering)
    assert mock_get_user_profile.call_count >= 2


@patch('digame.app.crud.user_crud.get_user_profile')
@patch('digame.app.crud.user_crud.get_users')
def test_get_skill_based_matches_target_no_skills(
    mock_get_users, mock_get_user_profile,
    social_collaboration_service: SocialCollaborationService,
    mock_user_1 # User 1 will be the target
):
    # Arrange
    target_user_id = 1
    mock_get_user_profile.return_value = UserProfileModel(user_id=1, skills=None) # Target has no skills
    mock_get_users.return_value = [] # No other users needed for this test

    # Act
    matches = social_collaboration_service.get_skill_based_matches(user_id=target_user_id)

    # Assert
    assert len(matches) == 0

@patch('digame.app.crud.user_crud.get_user_profile')
@patch('digame.app.crud.user_crud.get_users')
def test_get_learning_partner_recommendations_success(
    mock_get_users, mock_get_user_profile,
    social_collaboration_service: SocialCollaborationService,
    mock_user_1, mock_user_profile_1_skills, # Target: Learning Docker, Kubernetes; Skills: Python
    mock_user_2, mock_user_profile_2_skills_match, # Skills: Python; Learning FastAPI
    mock_user_3, mock_user_profile_3_learning_match # Skills: Docker; Mentors Docker
):
    # Arrange
    target_user_id = 1
    mock_get_user_profile.side_effect = lambda db, user_id: {
        1: mock_user_profile_1_skills, # Target user
        2: mock_user_profile_2_skills_match,
        3: mock_user_profile_3_learning_match
    }.get(user_id)

    mock_get_users.return_value = [mock_user_1, mock_user_2, mock_user_3]

    # Act
    recommendations = social_collaboration_service.get_learning_partner_recommendations(user_id=target_user_id, limit=5)

    # Assert
    # User 3 is a strong match: has 'Docker' skill (user1's goal) AND willing to mentor on 'Docker'.
    # User 2: No direct skill match for user1's goals (Docker, K8s). User1's skill Python matches User2's learning goal FastAPI.
    # The current algorithm:
    #   - Candidate skills match target's learning goals (score * 2)
    #   - Candidate willing to mentor on target's learning goals (score + 3)
    #   - Candidate has similar learning goals (score * 1)
    # User1 learning: Docker, Kubernetes. Skills: Python, FastAPI, SQL
    # User3 skills: Docker, AWS. Mentors: Docker, AWS. Score for User3:
    #   - Docker skill matches Docker goal: 1 * 2 = 2
    #   - Mentors Docker: +3 = 5
    # User2 skills: Python, SQL, JS. Learning: FastAPI. Score for User2:
    #   - No skills match U1's goals.
    #   - Not mentoring on U1's goals.
    #   - No common learning goals directly.
    # So User3 should be recommended.
    assert len(recommendations) > 0
    assert recommendations[0].id == mock_user_3.id # User 3 should be the top recommendation

@patch('digame.app.crud.user_crud.get_user_profile')
@patch('digame.app.crud.user_crud.get_users')
def test_get_learning_partner_recommendations_target_no_goals(
    mock_get_users, mock_get_user_profile,
    social_collaboration_service: SocialCollaborationService,
    mock_user_1 # Target user
):
    # Arrange
    target_user_id = 1
    mock_get_user_profile.return_value = UserProfileModel(user_id=1, learning_goals=None) # Target has no learning goals
    mock_get_users.return_value = []

    # Act
    recommendations = social_collaboration_service.get_learning_partner_recommendations(user_id=target_user_id)

    # Assert
    assert len(recommendations) == 0

# TODO: Add more tests:
# - Test 'limit' parameter for both service methods.
# - Test scenarios where no matches/recommendations are found.
# - Test different skill/goal data (e.g., empty lists, different casing).
# - Test if user_crud.get_users returns users without profiles gracefully.
# - Test parsing of skills if they are stored as list of objects (e.g. {"skill": "Python", "level": "Advanced"})
#   (current tests assume list of strings for skills/goals based on service impl).
```
