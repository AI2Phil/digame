import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime

# Attempt to import the FastAPI app instance
try:
    from digame.app.main import app as fastAPI_app
except ImportError:
    # Fallback if main.py or app is structured differently
    # This might require adjusting if your app instance is elsewhere
    # For now, create a dummy FastAPI app for syntax purposes if main app fails
    from fastapi import FastAPI
    fastAPI_app = FastAPI()
    print("Warning: Could not import 'app' from 'digame.app.main'. Using a dummy FastAPI app for tests.")

# Schemas and potentially models (though models might be mocked)
from digame.app.schemas.project_schemas import ProjectMatchResponse, Project as ProjectSchema, ProjectMatch

# Mock User class for testing, as the actual User model might not have 'skills'
class MockUserWithSkills:
    def __init__(self, id: int, skills: list = None, email: str = "test@example.com", full_name: str = "Test User", **kwargs):
        self.id = id
        self.skills = skills if skills is not None else []
        self.email = email
        self.full_name = full_name
        # Allow other attributes that might be expected by the schema or code
        for key, value in kwargs.items():
            setattr(self, key, value)

@pytest.fixture
def client():
    # In a real setup, you might override dependencies here globally if needed,
    # but using patch or per-test overrides is often cleaner.
    return TestClient(fastAPI_app)

# Mock project data used within the endpoint itself (for reference in tests)
# This is the data defined inside the get_project_matches endpoint in social_collaboration.py
# We need to ensure our tests align with this data.
# Actual data from social_collaboration.py:
# mock_projects_data = [
#     {"id": 1, "name": "AI Chatbot", "description": "A chatbot for customer service", "required_skills": ["python", "nlp", "machine learning"], "owner_id": 1, "created_at": datetime.utcnow()},
#     {"id": 2, "name": "E-commerce Platform", "description": "Online shopping platform", "required_skills": ["react", "nodejs", "mongodb"], "owner_id": 2, "created_at": datetime.utcnow()},
#     {"id": 3, "name": "Data Analytics Dashboard", "description": "Dashboard for visualizing data", "required_skills": ["python", "pandas", "fastapi"], "owner_id": 1, "created_at": datetime.utcnow()},
#     {"id": 4, "name": "Mobile Game", "description": "A new mobile game", "required_skills": ["unity", "csharp"], "owner_id": 3, "created_at": datetime.utcnow()},
#     {"id": 5, "name": "NLP Research", "description": "Research project on NLP", "required_skills": ["python", "pytorch", "nlp"], "owner_id": 1, "created_at": datetime.utcnow()},
# ]

# Test cases will go here

# It's important that the patch target matches how `get_user` is imported and used in social_collaboration.py
# Based on previous subtask, it's imported as: from ..crud.user_crud import get_user
# And then called as: user_entity = get_user(db, user_id=user_id)
# So the patch target should be 'digame.app.routers.social_collaboration.get_user' if get_user is directly imported
# from user_crud. If it's from ..crud.user_crud import get_user, then it's digame.app.crud.user_crud.get_user,
# but the one *used* in the router file is what matters.
# Let's assume the direct import for now, as per the previous diff:
# `from ..crud.user_crud import get_user` in `social_collaboration.py` (within the try block)
# Then, `user_entity = get_user(db, user_id=user_id)`
# The patch target is `digame.app.routers.social_collaboration.get_user`
# (This means we're patching the 'get_user' that is now part of the social_collaboration module's namespace)

# If social_collaboration.py has this at the top:
# from ..crud import user_crud
# and then calls user_crud.get_user()
# Then the patch target is 'digame.app.routers.social_collaboration.user_crud.get_user'

# The previous analysis concluded the patch target should be:
# @patch('digame.app.routers.social_collaboration.get_user')
# This implies that `get_user` is directly available in the router's namespace.

# Test for successful project matches
@patch('digame.app.routers.social_collaboration.get_user')
def test_get_project_matches_success(mock_get_user_from_router, client):
    # Configure mock_get_user to return a user with specific skills
    mock_get_user_from_router.return_value = MockUserWithSkills(id=1, skills=["python", "fastapi", "nlp"])

    response = client.get("/social/project-matches?user_id=1")

    assert response.status_code == 200
    data = response.json()

    assert "matches" in data
    assert "total" in data

    # Expected matches based on user skills ["python", "fastapi", "nlp"] and endpoint's mock projects:
    # Project 1: AI Chatbot (python, nlp, machine learning) -> Matches: python, nlp. Missing: machine learning
    # Project 3: Data Analytics Dashboard (python, pandas, fastapi) -> Matches: python, fastapi. Missing: pandas
    # Project 5: NLP Research (python, pytorch, nlp) -> Matches: python, nlp. Missing: pytorch
    assert data["total"] == 3
    assert len(data["matches"]) == 3

    found_project_1 = False
    found_project_3 = False
    found_project_5 = False

    for match in data["matches"]:
        if match["project"]["name"] == "AI Chatbot":
            found_project_1 = True
            assert sorted(match["matching_skills"]) == sorted(["python", "nlp"])
            assert sorted(match["missing_skills"]) == sorted(["machine learning"])
        elif match["project"]["name"] == "Data Analytics Dashboard":
            found_project_3 = True
            assert sorted(match["matching_skills"]) == sorted(["python", "fastapi"])
            assert sorted(match["missing_skills"]) == sorted(["pandas"])
        elif match["project"]["name"] == "NLP Research":
            found_project_5 = True
            assert sorted(match["matching_skills"]) == sorted(["python", "nlp"])
            assert sorted(match["missing_skills"]) == sorted(["pytorch"])

    assert found_project_1 and found_project_3 and found_project_5

@patch('digame.app.routers.social_collaboration.get_user')
def test_get_project_matches_no_matches(mock_get_user_from_router, client):
    # User skills that don't match any project
    mock_get_user_from_router.return_value = MockUserWithSkills(id=1, skills=["java", "spring", "kafka"])

    response = client.get("/social/project-matches?user_id=1")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert len(data["matches"]) == 0

@patch('digame.app.routers.social_collaboration.get_user')
def test_get_project_matches_user_not_found(mock_get_user_from_router, client):
    # Configure mock_get_user to simulate user not found
    mock_get_user_from_router.return_value = None

    response = client.get("/social/project-matches?user_id=999") # Non-existent user ID

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "User not found"

@patch('digame.app.routers.social_collaboration.get_user')
def test_get_project_matches_partial_match(mock_get_user_from_router, client):
    # User skills partially matching "Data Analytics Dashboard"
    mock_get_user_from_router.return_value = MockUserWithSkills(id=1, skills=["python", "data analysis"]) # "python" matches, "pandas" and "fastapi" are missing.

    response = client.get("/social/project-matches?user_id=1")

    assert response.status_code == 200
    data = response.json()

    # Expected matches:
    # Project 1: AI Chatbot (python, nlp, machine learning) -> Match: python. Missing: nlp, machine learning
    # Project 3: Data Analytics Dashboard (python, pandas, fastapi) -> Match: python. Missing: pandas, fastapi
    # Project 5: NLP Research (python, pytorch, nlp) -> Match: python. Missing: pytorch, nlp
    assert data["total"] == 3 # All three projects require "python"

    dashboard_match = next((m for m in data["matches"] if m["project"]["name"] == "Data Analytics Dashboard"), None)
    assert dashboard_match is not None
    assert sorted(dashboard_match["matching_skills"]) == sorted(["python"])
    assert sorted(dashboard_match["missing_skills"]) == sorted(["pandas", "fastapi"])


@patch('digame.app.routers.social_collaboration.get_user')
def test_get_project_matches_case_insensitivity(mock_get_user_from_router, client):
    # Test case-insensitivity (e.g., "Python" vs "python")
    # The endpoint's mock projects use lowercase skills. User has mixed case.
    mock_get_user_from_router.return_value = MockUserWithSkills(id=1, skills=["PyThOn", "FaStApI"])

    response = client.get("/social/project-matches?user_id=1")

    assert response.status_code == 200
    data = response.json()

    # Expected:
    # Project 1: AI Chatbot (python, nlp, machine learning) -> Match: python.
    # Project 3: Data Analytics Dashboard (python, pandas, fastapi) -> Matches: python, fastapi.
    # Project 5: NLP Research (python, pytorch, nlp) -> Match: python.
    assert data["total"] == 3 # Project 1, 3, 5 match on "python" or "fastapi"

    dashboard_match = next((m for m in data["matches"] if m["project"]["name"] == "Data Analytics Dashboard"), None)
    assert dashboard_match is not None
    # The matching logic converts both user and project skills to lowercase for comparison
    assert sorted(dashboard_match["matching_skills"]) == sorted(["python", "fastapi"])
    assert sorted(dashboard_match["missing_skills"]) == sorted(["pandas"])

@patch('digame.app.routers.social_collaboration.get_user')
def test_get_project_matches_empty_user_skills(mock_get_user_from_router, client):
    # User with no skills
    mock_get_user_from_router.return_value = MockUserWithSkills(id=1, skills=[])

    response = client.get("/social/project-matches?user_id=1")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert len(data["matches"]) == 0

# Example of how to clear dependency overrides if they were set globally for the app
# This is not strictly needed here because @patch is used per-test.
# def teardown_function(function):
#     fastAPI_app.dependency_overrides = {}

# To run these tests, you'd typically use pytest:
# pytest digame/app/tests/routers/test_social_collaboration.py
# Ensure that PYTHONPATH is set up correctly if digame is not an installed package.
# e.g., export PYTHONPATH=$PYTHONPATH:/path/to/parent/of/digame
# Or run pytest from the directory containing 'digame'
# (e.g. if project root is /myproject/ and digame is /myproject/digame/, run pytest from /myproject/)
# Make sure __init__.py files are present in 'digame', 'app', 'tests', 'routers' directories.
# Also, make sure digame/app/main.py exists and 'app' is the FastAPI instance.
# The `social_collaboration.py` file has its own mock projects.
# The tests are written assuming those mock projects.
# The skills matching logic in `social_collaboration.py` is:
# project_req_skills_set = set(s.lower() for s in project.required_skills)
# user_skills_set = set(s.lower() for s in user_skills)
# matching_skills = list(user_skills_set.intersection(project_req_skills_set))
# This is case-insensitive, so "Python" and "python" will match.
# The test `test_get_project_matches_case_insensitivity` verifies this.
# The `MockUserWithSkills` class ensures that the `skills` attribute exists on the user object returned by the mocked `get_user`.
# The `datetime.utcnow()` in the mock project data means that `created_at` will be dynamic.
# The tests don't assert on `created_at` values, so this is fine.
# The `owner_id` is also part of the mock project data and is included in the `ProjectSchema`.
# The tests don't assert `owner_id` specifically in `ProjectMatch`, as it's part of the nested `ProjectSchema`.
# The `ProjectMatch` schema is: `project: ProjectSchema`, `matching_skills: List[str]`, `missing_skills: List[str]`.
# The `ProjectSchema` includes `id, name, description, required_skills, owner_id, created_at`.
# The tests correctly check for `project.name` and the `matching/missing_skills`.
# The `description` field in mock projects is not asserted, but it's good it's there.
# `print("Warning: Could not import 'app' from 'digame.app.main'. Using a dummy FastAPI app for tests.")`
# This warning is helpful for debugging test setup if `main.py` is not found.
# The tests assume the FastAPI app instance is named `app` in `digame.app.main`.
# If the main app import fails, tests might still run due to the dummy app, but they won't be testing the actual application routes correctly.
# It's crucial that `from digame.app.main import app as fastAPI_app` works.
# I will add __init__.py files for tests and tests/routers as good practice.
