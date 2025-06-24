import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy.orm import Session

from digame.app.services.third_party_api_service import ThirdPartyAPIService
from digame.app.models.integration import IntegrationConnection, IntegrationProvider

# Mock database session
@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

# Mock IntegrationConnection
@pytest.fixture
def mock_integration_connection():
    connection = MagicMock(spec=IntegrationConnection)
    connection.provider_id = 1
    connection.auth_data = {'access_token': 'fake_token'} # Example auth data
    return connection

# Mock IntegrationProvider
@pytest.fixture
def mock_indeed_provider():
    provider = MagicMock(spec=IntegrationProvider)
    provider.id = 1
    provider.name = "indeed"
    provider.base_url = "https://api.indeed.com" # Example, adjust as needed
    return provider

@pytest.mark.asyncio
async def test_search_jobs_indeed_success(
    mock_db_session,
    mock_integration_connection,
    mock_indeed_provider
):
    # Arrange
    service = ThirdPartyAPIService(db=mock_db_session)

    # Mock the DB query for provider
    mock_db_session.query(IntegrationProvider).filter().first.return_value = mock_indeed_provider

    # Mock the make_api_request method
    mock_api_response = {
        "results": [
            {
                "jobkey": "123",
                "jobtitle": "Software Engineer",
                "company": "Tech Co",
                "formattedLocation": "San Francisco, CA",
                "snippet": "Develop cool stuff.",
                "url": "https://example.com/job/123",
                "date": "Mon, 01 Jul 2024 10:00:00 GMT"
            }
        ]
    }
    service.make_api_request = AsyncMock(return_value=mock_api_response)

    # Act
    jobs = await service.search_jobs(
        connection=mock_integration_connection,
        query="Software Engineer",
        location="San Francisco, CA"
    )

    # Assert
    assert len(jobs) == 1
    assert jobs[0]['title'] == "Software Engineer"
    assert jobs[0]['company'] == "Tech Co"
    assert jobs[0]['source'] == "Indeed"

    service.make_api_request.assert_called_once_with(
        mock_integration_connection,
        'GET',
        'ads/apisearch', # This should match the placeholder in the service
        params={'q': "Software Engineer", 'l': "San Francisco, CA", 'limit': 25}
    )

@pytest.mark.asyncio
async def test_search_jobs_provider_not_found(
    mock_db_session,
    mock_integration_connection
):
    # Arrange
    service = ThirdPartyAPIService(db=mock_db_session)
    mock_db_session.query(IntegrationProvider).filter().first.return_value = None # Simulate provider not found

    # Act & Assert
    with pytest.raises(ValueError, match="Provider not found"):
        await service.search_jobs(
            connection=mock_integration_connection,
            query="Test Query"
        )

@pytest.mark.asyncio
async def test_search_jobs_not_implemented_provider(
    mock_db_session,
    mock_integration_connection
):
    # Arrange
    service = ThirdPartyAPIService(db=mock_db_session)

    # Mock a provider for which job search is not implemented
    other_provider = MagicMock(spec=IntegrationProvider)
    other_provider.id = 2
    other_provider.name = "other_provider"
    mock_db_session.query(IntegrationProvider).filter().first.return_value = other_provider

    # Act & Assert
    with pytest.raises(ValueError, match="Job search not implemented for other_provider"):
        await service.search_jobs(
            connection=mock_integration_connection,
            query="Test Query"
        )

# Add more tests, e.g., for API errors, empty results, different parameters, etc.
