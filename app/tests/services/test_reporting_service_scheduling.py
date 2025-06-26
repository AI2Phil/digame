"""
Tests for scheduling-related aspects of ReportingService,
specifically the execute_definition_schedule_job method.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch, call
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.services.reporting_service_part1 import ReportingService
from app.models.reporting import ReportSchedule, ReportDefinition, ReportExecution
from app.schemas import analytics_schemas as schemas

# Mock CustomDashboardService for ReportingService dependency
@pytest.fixture
def mock_custom_dashboard_service():
    return MagicMock()

@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

@pytest.fixture
def reporting_service(mock_db_session, mock_custom_dashboard_service) -> ReportingService:
    return ReportingService(db=mock_db_session, custom_dashboard_service=mock_custom_dashboard_service)

@pytest.fixture
def sample_report_definition_model() -> ReportDefinition:
    return ReportDefinition(
        id=1,
        tenant_id=1,
        user_id=1,
        name="Test Definition",
        description="A test report definition",
        report_type="performance_summary",
        content_blocks=[ # Store as dicts, as they would be from DB
            {
                "title": "Block 1",
                "block_type": "chart",
                "data_source": {"type": "analytics_performance", "query_params": {"metric_name": "Completion Rate"}},
                "display_options": {}
            }
        ],
        global_filters=[],
        output_format="pdf",
        export_config={"title": "Scheduled Test Report"},
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

@pytest.fixture
def sample_report_schedule_model(sample_report_definition_model) -> ReportSchedule:
    return ReportSchedule(
        id=100,
        tenant_id=1,
        created_by_user_id=1,
        name="Test Schedule for Definition",
        report_definition_id=sample_report_definition_model.id,
        schedule_type="report_definition",
        is_active=True,
        cron_expression="0 0 * * *", # Daily at midnight
        timezone="UTC",
        output_formats=["pdf", "csv"],
        delivery_method="email",
        delivery_config={"recipients": ["test@example.com"], "smtp_server": "mock_smtp"},
        next_run_at=datetime.now(timezone.utc) - timedelta(hours=1), # Due to run
        last_run_at=None,
        last_run_status=None,
        total_executions=0,
        successful_executions=0,
        failed_executions=0
    )

# --- Tests for execute_definition_schedule_job ---

@pytest.mark.asyncio
async def test_execute_schedule_job_success_email_delivery(
    reporting_service: ReportingService,
    mock_db_session,
    sample_report_schedule_model,
    sample_report_definition_model
):
    # Arrange
    mock_db_session.query(ReportSchedule).filter().first.return_value = sample_report_schedule_model
    reporting_service.get_report_definition = MagicMock(return_value=sample_report_definition_model)

    # Mock data generation and file generation
    reporting_service.generate_report_data = AsyncMock(return_value={
        "report_name": "Test Definition",
        "content": [{"data": [{"col1": "val1"}]}]
    })

    mock_execution_record = MagicMock(spec=ReportExecution)
    mock_execution_record.status = "completed"
    mock_execution_record.file_path = "/tmp/report_test_schedule.pdf"
    mock_execution_record.file_size_bytes = 1024
    mock_execution_record.download_url = "http://example.com/download/report.pdf"

    reporting_service.execute_and_generate_for_definition = AsyncMock(return_value=mock_execution_record)

    # Mock delivery
    reporting_service._deliver_via_email = AsyncMock()

    # Mock os.path.exists and os.remove for cleanup
    with patch("digame.app.services.reporting_service_part1.os.path.exists", return_value=True), \
         patch("digame.app.services.reporting_service_part1.os.remove") as mock_os_remove:

        # Act
        generated_files, overall_success = await reporting_service.execute_definition_schedule_job(sample_report_schedule_model.id)

        # Assert
        assert overall_success is True
        assert len(generated_files) == 2 # pdf and csv as per schedule output_formats

        reporting_service.generate_report_data.assert_called_once_with(
            report_definition_id=sample_report_definition_model.id,
            tenant_id=sample_report_schedule_model.tenant_id
        )

        # Check execute_and_generate_for_definition calls
        expected_calls = [
            call(
                report_definition=sample_report_definition_model,
                report_data=[{"col1": "val1"}], # Data extracted from generate_report_data mock
                output_format="pdf",
                execution_type="scheduled_definition",
                user_id=sample_report_schedule_model.created_by_user_id
            ),
            call(
                report_definition=sample_report_definition_model,
                report_data=[{"col1": "val1"}],
                output_format="csv",
                execution_type="scheduled_definition",
                user_id=sample_report_schedule_model.created_by_user_id
            )
        ]
        reporting_service.execute_and_generate_for_definition.assert_has_calls(expected_calls, any_order=True)
        assert reporting_service.execute_and_generate_for_definition.call_count == 2

        reporting_service._deliver_via_email.assert_called_once()
        # Could add more detailed assertions on args passed to _deliver_via_email

        assert sample_report_schedule_model.last_run_status == "success"
        assert sample_report_schedule_model.successful_executions == 1
        assert sample_report_schedule_model.total_executions == 1
        mock_db_session.commit.assert_called()

        # Check file cleanup
        assert mock_os_remove.call_count == 2 # For pdf and csv, assuming both generated same mock path for simplicity here


@pytest.mark.asyncio
async def test_execute_schedule_job_s3_delivery(
    reporting_service: ReportingService,
    mock_db_session,
    sample_report_schedule_model,
    sample_report_definition_model
):
    # Arrange
    sample_report_schedule_model.delivery_method = "s3"
    sample_report_schedule_model.delivery_config = {"bucket_name": "test-bucket"}
    mock_db_session.query(ReportSchedule).filter().first.return_value = sample_report_schedule_model
    reporting_service.get_report_definition = MagicMock(return_value=sample_report_definition_model)

    reporting_service.generate_report_data = AsyncMock(return_value={"content": [{"data": [{"id": 1}]}]})
    mock_execution_record = MagicMock(status="completed", file_path="/tmp/report.pdf")
    reporting_service.execute_and_generate_for_definition = AsyncMock(return_value=mock_execution_record)

    reporting_service._deliver_via_s3 = AsyncMock()

    with patch("digame.app.services.reporting_service_part1.os.path.exists", return_value=True), \
         patch("digame.app.services.reporting_service_part1.os.remove"):
        # Act
        _, overall_success = await reporting_service.execute_definition_schedule_job(sample_report_schedule_model.id)

        # Assert
        assert overall_success is True
        reporting_service._deliver_via_s3.assert_called_once()
        assert sample_report_schedule_model.last_run_status == "success"

@pytest.mark.asyncio
async def test_execute_schedule_job_webhook_delivery(
    reporting_service: ReportingService,
    mock_db_session,
    sample_report_schedule_model,
    sample_report_definition_model
):
    # Arrange
    sample_report_schedule_model.delivery_method = "webhook"
    sample_report_schedule_model.delivery_config = {"url": "http://localhost/webhook"}
    mock_db_session.query(ReportSchedule).filter().first.return_value = sample_report_schedule_model
    reporting_service.get_report_definition = MagicMock(return_value=sample_report_definition_model)

    reporting_service.generate_report_data = AsyncMock(return_value={"content": [{"data": [{"id": 1}]}]})
    mock_execution_record = MagicMock(status="completed", file_path="/tmp/report.pdf")
    reporting_service.execute_and_generate_for_definition = AsyncMock(return_value=mock_execution_record)

    reporting_service._deliver_via_webhook = AsyncMock()

    with patch("digame.app.services.reporting_service_part1.os.path.exists", return_value=True), \
         patch("digame.app.services.reporting_service_part1.os.remove"):
        # Act
        _, overall_success = await reporting_service.execute_definition_schedule_job(sample_report_schedule_model.id)

        # Assert
        assert overall_success is True
        reporting_service._deliver_via_webhook.assert_called_once()
        assert sample_report_schedule_model.last_run_status == "success"


@pytest.mark.asyncio
async def test_execute_schedule_job_generation_failure(
    reporting_service: ReportingService,
    mock_db_session,
    sample_report_schedule_model,
    sample_report_definition_model
):
    # Arrange
    mock_db_session.query(ReportSchedule).filter().first.return_value = sample_report_schedule_model
    reporting_service.get_report_definition = MagicMock(return_value=sample_report_definition_model)
    reporting_service.generate_report_data = AsyncMock(return_value={"content": [{"data": [{"id": 1}]}]})

    # Simulate failure in file generation
    reporting_service.execute_and_generate_for_definition = AsyncMock(side_effect=Exception("PDF generation error"))

    # Act
    _, overall_success = await reporting_service.execute_definition_schedule_job(sample_report_schedule_model.id)

    # Assert
    assert overall_success is False
    assert "PDF generation error" in sample_report_schedule_model.last_run_status
    assert sample_report_schedule_model.failed_executions == 1
    assert sample_report_schedule_model.total_executions == 1
    mock_db_session.commit.assert_called()

@pytest.mark.asyncio
async def test_execute_schedule_job_delivery_failure(
    reporting_service: ReportingService,
    mock_db_session,
    sample_report_schedule_model,
    sample_report_definition_model
):
    # Arrange
    mock_db_session.query(ReportSchedule).filter().first.return_value = sample_report_schedule_model
    reporting_service.get_report_definition = MagicMock(return_value=sample_report_definition_model)
    reporting_service.generate_report_data = AsyncMock(return_value={"content": [{"data": [{"id": 1}]}]})

    mock_execution_record = MagicMock(status="completed", file_path="/tmp/report.pdf")
    reporting_service.execute_and_generate_for_definition = AsyncMock(return_value=mock_execution_record)

    # Simulate failure in email delivery
    reporting_service._deliver_via_email = AsyncMock(side_effect=Exception("SMTP connection failed"))

    with patch("digame.app.services.reporting_service_part1.os.path.exists", return_value=True), \
         patch("digame.app.services.reporting_service_part1.os.remove"):
        # Act
        _, overall_success = await reporting_service.execute_definition_schedule_job(sample_report_schedule_model.id)

        # Assert
        assert overall_success is False
        assert "SMTP connection failed" in sample_report_schedule_model.last_run_status
        assert "Delivery Error" in sample_report_schedule_model.last_run_status
        assert sample_report_schedule_model.failed_executions == 1
        mock_db_session.commit.assert_called()

@pytest.mark.asyncio
async def test_execute_schedule_job_schedule_not_found(reporting_service: ReportingService, mock_db_session):
    # Arrange
    mock_db_session.query(ReportSchedule).filter().first.return_value = None

    # Act
    result = await reporting_service.execute_definition_schedule_job(999) # Non-existent ID

    # Assert
    assert result is None # Or based on actual return for not found
    # Check logs or however you handle "schedule not found"

@pytest.mark.asyncio
async def test_execute_schedule_job_schedule_inactive(
    reporting_service: ReportingService,
    mock_db_session,
    sample_report_schedule_model
):
    # Arrange
    sample_report_schedule_model.is_active = False
    mock_db_session.query(ReportSchedule).filter().first.return_value = sample_report_schedule_model

    # Act
    result = await reporting_service.execute_definition_schedule_job(sample_report_schedule_model.id)

    # Assert
    # Should not proceed with generation or delivery
    reporting_service.generate_report_data.assert_not_called()
    assert result is None # As it returns early

@pytest.mark.asyncio
async def test_execute_schedule_job_no_report_definition_id(
    reporting_service: ReportingService,
    mock_db_session,
    sample_report_schedule_model
):
    # Arrange
    sample_report_schedule_model.report_definition_id = None
    mock_db_session.query(ReportSchedule).filter().first.return_value = sample_report_schedule_model

    # Act
    await reporting_service.execute_definition_schedule_job(sample_report_schedule_model.id)

    # Assert
    assert sample_report_schedule_model.last_run_status == "failed" # Or specific message
    mock_db_session.commit.assert_called_once()


# Basic tests for delivery helpers (can be expanded)
@pytest.mark.asyncio
async def test_deliver_via_email_helper(reporting_service: ReportingService, sample_report_definition_model):
    files_info = [{"file_path": "/tmp/test.pdf", "format": "pdf"}]
    config = {"recipients": ["test@example.com"], "smtp_server": "localhost", "smtp_port": 1025, "from_email": "r@d.com"}

    with patch("smtplib.SMTP") as mock_smtp:
        with patch("digame.app.services.reporting_service_part1.os.path.exists", return_value=True), \
             patch("builtins.open", new_callable=MagicMock): # Mock open for reading file
            await reporting_service._deliver_via_email(files_info, config, sample_report_definition_model)
            mock_smtp.assert_called_with("localhost", 1025)
            # Further assertions on email content if needed by inspecting mock_smtp instance calls

@pytest.mark.asyncio
async def test_deliver_via_s3_helper(reporting_service: ReportingService, sample_report_definition_model):
    files_info = [{"file_path": "/tmp/test.pdf", "format": "pdf"}]
    config = {"bucket_name": "mybucket", "aws_access_key_id": "key", "aws_secret_access_key": "secret", "region_name": "us-east-1"}

    with patch("boto3.client") as mock_boto_client:
        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3
        with patch("digame.app.services.reporting_service_part1.os.path.exists", return_value=True):
            await reporting_service._deliver_via_s3(files_info, config, sample_report_definition_model)
            mock_s3.upload_file.assert_called_once()
            # Assert args of upload_file if needed

@pytest.mark.asyncio
async def test_deliver_via_webhook_helper(reporting_service: ReportingService, sample_report_definition_model):
    files_info = [{"file_path": "/tmp/test.pdf", "format": "pdf", "file_size_bytes": 100, "download_url": "http://d.co/f.pdf"}]
    config = {"url": "http://localhost/hook"}

    with patch("httpx.AsyncClient") as MockAsyncClient:
        mock_client_instance = AsyncMock()
        MockAsyncClient.return_value.__aenter__.return_value = mock_client_instance # Handle async context manager

        await reporting_service._deliver_via_webhook(files_info, config, sample_report_definition_model)

        mock_client_instance.post.assert_called_once()
        # Assert args of post (url, json payload)
        args, kwargs = mock_client_instance.post.call_args
        assert args[0] == "http://localhost/hook"
        assert kwargs["json"]["report_name"] == sample_report_definition_model.name
        assert len(kwargs["json"]["files"]) == 1
        assert kwargs["json"]["files"][0]["format"] == "pdf"

# TODO: Add tests for empty data scenarios, different output_formats combinations,
# error handling within loops (e.g., one format fails, others succeed).
# Test cleanup logic more thoroughly.
# Test specific error messages in last_run_status.
# Test what happens if delivery_config is missing required fields.
# Test behavior when os.path.exists returns False for a file to be attached/uploaded.
# Test cases where no files are generated (e.g., empty report_data) but it's not an error.
# Test the specific structure of data_for_file_generation based on raw_report_data_payload.
# Test the case where output_formats in schedule is None or empty, falling back to definition's format.
# Test the logic for "unimplemented delivery method".
# Test the case where no delivery method is specified.
# Test file cleanup when delivery fails.

# Add __init__.py if it's missing in tests/services
# Ensure conftest.py is set up if common fixtures are used across test files.
# Remember to install pytest-asyncio if not already.
# `pip install pytest pytest-asyncio boto3 httpx croniter` (croniter for next test file)
# For boto3 and httpx, you might want to use libraries like `moto` for S3 and `pytest-httpx` for more robust HTTP mocking.
# For SMTP, `aiosmtpd` could be used for a test server if needed for deeper integration tests.
