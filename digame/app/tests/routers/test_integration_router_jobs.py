import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from digame.app.main import app  # Assuming your FastAPI app instance is here
from digame.app.database import get_db
from digame.app.models.integration import IntegrationConnection, IntegrationProvider
from digame.app.schemas.job_schemas import JobSearchQuery, JobSchema

# Test client
client = TestClient(app)

# Mock database session for dependency override
@pytest.fixture
def mock_db_session_override():
    db = MagicMock(spec=Session)
    # Mock the query chain
    query_mock = MagicMock()
    db.query.return_value = query_mock
    filter_mock = MagicMock()
    query_mock.filter.return_value = filter_mock
    first_mock = MagicMock()
    filter_mock.first.return_value = first_mock
    return db

# Override the get_db dependency for tests
def override_get_db():
    mock_db = MagicMock(spec=Session)
    query_mock = MagicMock()
    mock_db.query.return_value = query_mock
    filter_mock = MagicMock()
    query_mock.filter.return_value = filter_mock
    # filter_mock.first.return_value will be set in individual tests
    try:
        yield mock_db
    finally:
        pass # No actual db session to close

app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def mock_active_connection():
    connection = MagicMock(spec=IntegrationConnection)
    connection.id = 1
    connection.status = "active"
    connection.provider_id = 1 # Ensure this matches a mock provider if needed
    return connection

@pytest.fixture
def mock_inactive_connection():
    connection = MagicMock(spec=IntegrationConnection)
    connection.id = 2
    connection.status = "inactive"
    return connection

@patch("digame.app.routers.integration_router.ThirdPartyAPIService")
def test_search_jobs_via_connection_success(
    mock_api_service_class,
    mock_active_connection
):
    # Arrange
    # Mock the ThirdPartyAPIService instance and its search_jobs method
    mock_service_instance = AsyncMock()
    mock_api_service_class.return_value = mock_service_instance

    mock_job_results = [
        {
            "id": "indeed_123", "title": "Developer", "company": "Indeed Co",
            "location": "Austin, TX", "description": "Job desc",
            "url": "http://example.com/job1", "source": "Indeed"
        }
    ]
    mock_service_instance.search_jobs = AsyncMock(return_value=mock_job_results)

    # Mock the database call to return the active connection
    # This requires access to the mock_db from override_get_db
    # A bit tricky with fixture scope, let's adjust override_get_db or patch directly

    with patch("digame.app.routers.integration_router.IntegrationService") as mock_integration_service_class:
        mock_integration_instance = MagicMock()
        mock_integration_service_class.return_value = mock_integration_instance
        mock_integration_instance.db.query(IntegrationConnection).filter().first.return_value = mock_active_connection

        search_payload = {"query": "Python Developer", "location": "Remote"}

        # Act
        response = client.post(
            f"/api/v1/integrations/connections/{mock_active_connection.id}/jobs/search",
            json=search_payload
        )

    # Assert
    assert response.status_code == 200
    response_data = response.json()
    assert len(response_data) == 1
    assert response_data[0]["title"] == "Developer"
    assert response_data[0]["source"] == "Indeed"

    mock_service_instance.search_jobs.assert_called_once_with(
        connection=mock_active_connection,
        query="Python Developer",
        location="Remote",
        limit=25 # Default limit from schema
    )


def test_search_jobs_connection_not_found():
    # Arrange
    with patch("digame.app.routers.integration_router.IntegrationService") as mock_integration_service_class:
        mock_integration_instance = MagicMock()
        mock_integration_service_class.return_value = mock_integration_instance
        # Simulate connection not found
        mock_integration_instance.db.query(IntegrationConnection).filter().first.return_value = None

        search_payload = {"query": "Test", "location": "Testville"}

        # Act
        response = client.post(
            "/api/v1/integrations/connections/999/jobs/search", # Non-existent ID
            json=search_payload
        )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Connection not found"


@patch("digame.app.routers.integration_router.ThirdPartyAPIService")
def test_search_jobs_inactive_connection(
    mock_api_service_class, # Not used directly but patches the class
    mock_inactive_connection
):
    # Arrange
    with patch("digame.app.routers.integration_router.IntegrationService") as mock_integration_service_class:
        mock_integration_instance = MagicMock()
        mock_integration_service_class.return_value = mock_integration_instance
        mock_integration_instance.db.query(IntegrationConnection).filter().first.return_value = mock_inactive_connection

        search_payload = {"query": "Manager", "location": "New York"}

        # Act
        response = client.post(
            f"/api/v1/integrations/connections/{mock_inactive_connection.id}/jobs/search",
            json=search_payload
        )

    # Assert
    assert response.status_code == 400
    assert response.json()["detail"] == f"Connection is not active. Current status: {mock_inactive_connection.status}"


@patch("digame.app.routers.integration_router.ThirdPartyAPIService")
def test_search_jobs_api_service_value_error(
    mock_api_service_class,
    mock_active_connection
):
    # Arrange
    mock_service_instance = AsyncMock()
    mock_api_service_class.return_value = mock_service_instance
    mock_service_instance.search_jobs = AsyncMock(side_effect=ValueError("API specific error"))

    with patch("digame.app.routers.integration_router.IntegrationService") as mock_integration_service_class:
        mock_integration_instance = MagicMock()
        mock_integration_service_class.return_value = mock_integration_instance
        mock_integration_instance.db.query(IntegrationConnection).filter().first.return_value = mock_active_connection

        search_payload = {"query": "Engineer"}

        # Act
        response = client.post(
            f"/api/v1/integrations/connections/{mock_active_connection.id}/jobs/search",
            json=search_payload
        )

    # Assert
    assert response.status_code == 400
    assert response.json()["detail"] == "API specific error"


@patch("digame.app.routers.integration_router.ThirdPartyAPIService")
def test_search_jobs_api_service_generic_exception(
    mock_api_service_class,
    mock_active_connection
):
    # Arrange
    mock_service_instance = AsyncMock()
    mock_api_service_class.return_value = mock_service_instance
    mock_service_instance.search_jobs = AsyncMock(side_effect=Exception("Unexpected API failure"))

    with patch("digame.app.routers.integration_router.IntegrationService") as mock_integration_service_class:
        mock_integration_instance = MagicMock()
        mock_integration_service_class.return_value = mock_integration_instance
        mock_integration_instance.db.query(IntegrationConnection).filter().first.return_value = mock_active_connection

        search_payload = {"query": "Data Scientist"}

        # Act
        response = client.post(
            f"/api/v1/integrations/connections/{mock_active_connection.id}/jobs/search",
            json=search_payload
        )

    # Assert
    assert response.status_code == 500
    assert response.json()["detail"] == "Job search failed"

# To run these tests:
# Ensure you have testing dependencies like pytest, httpx (for TestClient)
# From the root directory of your project:
# pytest digame/app/tests/routers/test_integration_router_jobs.py
