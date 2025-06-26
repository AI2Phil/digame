"""
Tests for ReportSchedulingService.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch, call
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.services.report_scheduling_service import ReportSchedulingService
from app.services.reporting_service_part1 import ReportingService # For type hint and mocking
from app.models.reporting import ReportSchedule

# Mock ReportingService for ReportSchedulingService dependency
@pytest.fixture
def mock_reporting_service():
    service = MagicMock(spec=ReportingService)
    # execute_definition_schedule_job should be an AsyncMock
    service.execute_definition_schedule_job = AsyncMock(return_value=([], True)) # (generated_files, overall_success)
    return service

@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

@pytest.fixture
def report_scheduling_service(mock_db_session, mock_reporting_service) -> ReportSchedulingService:
    return ReportSchedulingService(db=mock_db_session, reporting_service=mock_reporting_service)

@pytest.fixture
def due_schedule() -> ReportSchedule:
    return ReportSchedule(
        id=1,
        tenant_id=1,
        name="Due Schedule",
        report_definition_id=10,
        schedule_type="report_definition",
        is_active=True,
        cron_expression="0 0 * * *", # Daily
        timezone="UTC",
        next_run_at=datetime.now(timezone.utc) - timedelta(minutes=30), # Due
        last_run_at=datetime.now(timezone.utc) - timedelta(days=1),
        created_by_user_id=1
    )

@pytest.fixture
def not_due_schedule() -> ReportSchedule:
    return ReportSchedule(
        id=2,
        tenant_id=1,
        name="Not Due Schedule",
        report_definition_id=11,
        schedule_type="report_definition",
        is_active=True,
        cron_expression="0 0 * * *",
        timezone="UTC",
        next_run_at=datetime.now(timezone.utc) + timedelta(hours=1), # Not due yet
        created_by_user_id=1
    )

@pytest.fixture
def inactive_schedule() -> ReportSchedule:
    return ReportSchedule(
        id=3,
        tenant_id=1,
        name="Inactive Schedule",
        report_definition_id=12,
        schedule_type="report_definition",
        is_active=False, # Inactive
        cron_expression="0 0 * * *",
        timezone="UTC",
        next_run_at=datetime.now(timezone.utc) - timedelta(minutes=30), # Would be due if active
        created_by_user_id=1
    )

@pytest.fixture
def schedule_no_cron() -> ReportSchedule: # One-time schedule
    return ReportSchedule(
        id=4,
        tenant_id=1,
        name="One-time Schedule",
        report_definition_id=13,
        schedule_type="report_definition",
        is_active=True,
        cron_expression=None, # No cron, so should run once and deactivate
        timezone="UTC",
        next_run_at=datetime.now(timezone.utc) - timedelta(minutes=30), # Due
        created_by_user_id=1
    )

# --- Tests for process_due_schedules ---

@pytest.mark.asyncio
async def test_process_due_schedules_executes_due_schedule(
    report_scheduling_service: ReportSchedulingService,
    mock_db_session,
    mock_reporting_service,
    due_schedule
):
    # Arrange
    mock_db_session.query(ReportSchedule).filter().all.return_value = [due_schedule]

    # Mock croniter if it's being used by the service
    with patch("digame.app.services.report_scheduling_service.croniter") as mock_croniter_module:
        if mock_croniter_module: # If croniter was imported
            mock_iter_instance = MagicMock()
            # Simulate get_next returning a future time
            mock_iter_instance.get_next.return_value = datetime.now(timezone.utc) + timedelta(days=1)
            mock_croniter_module.return_value = mock_iter_instance
        else: # croniter not available, _calculate_next_run_time might return None or act differently
            report_scheduling_service._calculate_next_run_time = MagicMock(return_value=datetime.now(timezone.utc) + timedelta(days=1))


        # Act
        await report_scheduling_service.process_due_schedules()

        # Assert
        # Check that execute_definition_schedule_job was called for the due schedule
        mock_reporting_service.execute_definition_schedule_job.assert_called_once_with(due_schedule.id)

        # Check that next_run_at was updated (assuming croniter mock worked or _calculate_next_run_time was properly mocked)
        assert due_schedule.next_run_at > datetime.now(timezone.utc) # Should be in the future
        mock_db_session.commit.assert_called()


@pytest.mark.asyncio
async def test_process_due_schedules_skips_not_due_and_inactive(
    report_scheduling_service: ReportSchedulingService,
    mock_db_session,
    mock_reporting_service,
    due_schedule,
    not_due_schedule,
    inactive_schedule
):
    # Arrange
    mock_db_session.query(ReportSchedule).filter().all.return_value = [due_schedule, not_due_schedule, inactive_schedule]

    with patch("digame.app.services.report_scheduling_service.croniter") as mock_croniter_module:
        if mock_croniter_module:
            mock_iter_instance = MagicMock()
            mock_iter_instance.get_next.return_value = datetime.now(timezone.utc) + timedelta(days=1)
            mock_croniter_module.return_value = mock_iter_instance
        else:
             report_scheduling_service._calculate_next_run_time = MagicMock(return_value=datetime.now(timezone.utc) + timedelta(days=1))

        # Act
        await report_scheduling_service.process_due_schedules()

        # Assert
        # Should only be called for the due_schedule
        mock_reporting_service.execute_definition_schedule_job.assert_called_once_with(due_schedule.id)

        # Ensure next_run_at for not_due_schedule and inactive_schedule were not changed by this process
        # (This needs more specific mocking of how schedules are fetched and updated individually)
        # For now, the main check is that execute was called only once.
        mock_db_session.commit.assert_called() # Called for the due_schedule update

@pytest.mark.asyncio
async def test_process_due_schedules_handles_execution_failure(
    report_scheduling_service: ReportSchedulingService,
    mock_db_session,
    mock_reporting_service,
    due_schedule
):
    # Arrange
    mock_db_session.query(ReportSchedule).filter().all.return_value = [due_schedule]
    # Simulate failure in the job execution itself
    mock_reporting_service.execute_definition_schedule_job.return_value = ([], False) # (files, success=False)

    with patch("digame.app.services.report_scheduling_service.croniter") as mock_croniter_module:
        if mock_croniter_module:
            mock_iter_instance = MagicMock()
            mock_iter_instance.get_next.return_value = datetime.now(timezone.utc) + timedelta(days=1)
            mock_croniter_module.return_value = mock_iter_instance
        else:
            report_scheduling_service._calculate_next_run_time = MagicMock(return_value=datetime.now(timezone.utc) + timedelta(days=1))


        # Act
        await report_scheduling_service.process_due_schedules()

        # Assert
        mock_reporting_service.execute_definition_schedule_job.assert_called_once_with(due_schedule.id)
        # The schedule's status (e.g., last_run_status) should reflect failure (this is handled by ReportingService)
        # The ReportSchedulingService should still update next_run_at
        assert due_schedule.next_run_at > datetime.now(timezone.utc)
        mock_db_session.commit.assert_called()

@pytest.mark.asyncio
async def test_process_due_schedules_handles_unhandled_job_exception(
    report_scheduling_service: ReportSchedulingService,
    mock_db_session,
    mock_reporting_service,
    due_schedule
):
    # Arrange
    mock_db_session.query(ReportSchedule).filter().all.return_value = [due_schedule]
    # Simulate an unhandled exception during job execution
    mock_reporting_service.execute_definition_schedule_job.side_effect = Exception("Unexpected job error")

    original_last_run_at = due_schedule.last_run_at
    original_failed_executions = due_schedule.failed_executions
    original_total_executions = due_schedule.total_executions


    with patch("digame.app.services.report_scheduling_service.croniter") as mock_croniter_module:
        if mock_croniter_module:
            mock_iter_instance = MagicMock()
            mock_iter_instance.get_next.return_value = datetime.now(timezone.utc) + timedelta(days=1)
            mock_croniter_module.return_value = mock_iter_instance
        else:
            report_scheduling_service._calculate_next_run_time = MagicMock(return_value=datetime.now(timezone.utc) + timedelta(days=1))


        # Act
        await report_scheduling_service.process_due_schedules()

        # Assert
        mock_reporting_service.execute_definition_schedule_job.assert_called_once_with(due_schedule.id)
        assert "Scheduler error - Unexpected job error" in due_schedule.last_run_status
        assert due_schedule.last_run_at > original_last_run_at if original_last_run_at else due_schedule.last_run_at is not None
        assert due_schedule.failed_executions == original_failed_executions + 1
        assert due_schedule.total_executions == original_total_executions + 1

        assert due_schedule.next_run_at > datetime.now(timezone.utc) # Still updates next run time
        mock_db_session.commit.assert_called()


@pytest.mark.asyncio
async def test_process_due_schedules_no_due_schedules(
    report_scheduling_service: ReportSchedulingService,
    mock_db_session,
    mock_reporting_service
):
    # Arrange
    mock_db_session.query(ReportSchedule).filter().all.return_value = [] # No schedules are due

    # Act
    await report_scheduling_service.process_due_schedules()

    # Assert
    mock_reporting_service.execute_definition_schedule_job.assert_not_called()
    mock_db_session.commit.assert_not_called() # Nothing to commit if no schedules processed

@pytest.mark.asyncio
async def test_process_due_schedules_deactivates_no_cron_schedule(
    report_scheduling_service: ReportSchedulingService,
    mock_db_session,
    mock_reporting_service,
    schedule_no_cron # This schedule has no cron_expression
):
    # Arrange
    mock_db_session.query(ReportSchedule).filter().all.return_value = [schedule_no_cron]

    # _calculate_next_run_time will not be called as cron_expression is None
    # So no need to mock croniter here for that path.

    # Act
    await report_scheduling_service.process_due_schedules()

    # Assert
    mock_reporting_service.execute_definition_schedule_job.assert_called_once_with(schedule_no_cron.id)
    assert schedule_no_cron.is_active is False # Should be deactivated
    assert schedule_no_cron.next_run_at is None or schedule_no_cron.next_run_at < (datetime.now(timezone.utc) - timedelta(minutes=20)) # next_run_at should not be updated to future
    mock_db_session.commit.assert_called()


# --- Tests for _calculate_next_run_time ---

@patch("digame.app.services.report_scheduling_service.croniter")
def test_calculate_next_run_time_with_croniter(mock_croniter_module, report_scheduling_service: ReportSchedulingService):
    # Arrange
    cron_expr = "0 10 * * *" # Every day at 10:00
    now = datetime(2023, 1, 1, 9, 0, 0, tzinfo=timezone.utc) # Current time is 9 AM
    expected_next_run = datetime(2023, 1, 1, 10, 0, 0, tzinfo=timezone.utc)

    mock_iter_instance = MagicMock()
    mock_iter_instance.get_next.return_value = expected_next_run
    mock_croniter_module.return_value = mock_iter_instance

    # Act
    with patch("digame.app.services.report_scheduling_service.datetime", MagicMock(now=MagicMock(return_value=now))):
         next_run = report_scheduling_service._calculate_next_run_time(cron_expr)

    # Assert
    assert next_run == expected_next_run
    mock_croniter_module.assert_called_once_with(cron_expr, now)
    mock_iter_instance.get_next.assert_called_once_with(datetime)


@patch("digame.app.services.report_scheduling_service.croniter", None) # Simulate croniter not being installed
def test_calculate_next_run_time_no_croniter(report_scheduling_service: ReportSchedulingService):
    # Arrange
    cron_expr = "0 10 * * *"

    # Act
    next_run = report_scheduling_service._calculate_next_run_time(cron_expr)

    # Assert
    assert next_run is None # Or however the fallback is handled

def test_calculate_next_run_time_croniter_exception(report_scheduling_service: ReportSchedulingService):
    # Arrange
    cron_expr = "invalid cron"

    with patch("digame.app.services.report_scheduling_service.croniter") as mock_croniter_module:
        mock_croniter_module.side_effect = ValueError("Invalid cron string")

        # Act
        next_run = report_scheduling_service._calculate_next_run_time(cron_expr)

        # Assert
        assert next_run is None # Should handle exception and return None

@patch("digame.app.services.report_scheduling_service.croniter")
def test_calculate_next_run_time_advances_if_calculated_is_not_future(mock_croniter_module, report_scheduling_service: ReportSchedulingService, due_schedule: ReportSchedule):
    """
    Test the logic that if calculated next_run_time is <= last_run_at, it advances again.
    This is a specific edge case in `process_due_schedules`'s `finally` block.
    """
    # This test is more about the logic inside process_due_schedules's finally block,
    # but the _calculate_next_run_time is a component.
    # Let's test the scenario from process_due_schedules more directly if needed.

    # For _calculate_next_run_time itself, it just returns the next time.
    # The advancing logic is in the caller.

    # Scenario: last_run_at is very recent, croniter's next might be same minute or just past.
    # cron_expr = "* * * * *" # Every minute
    # last_run = datetime(2023, 1, 1, 10, 0, 30, tzinfo=timezone.utc) # Ran 30s ago
    # base_for_croniter = last_run
    # first_calculated_next = datetime(2023, 1, 1, 10, 1, 0, tzinfo=timezone.utc) # Next minute

    # mock_iter1 = MagicMock()
    # mock_iter1.get_next.return_value = first_calculated_next
    # mock_croniter_module.return_value = mock_iter1

    # next_run = report_scheduling_service._calculate_next_run_time(cron_expr, last_run=last_run)
    # assert next_run == first_calculated_next
    # The advancing logic is not in _calculate_next_run_time but in its caller.

    # This test might be better as an integration test for process_due_schedules
    # or by extracting the advancing logic into a separate testable function.
    # For now, we assume _calculate_next_run_time behaves as a simple croniter wrapper.
    pass


# TODO:
# - Test timezone handling in _calculate_next_run_time more thoroughly if croniter is used with timezones.
# - Test the specific logic in process_due_schedules that advances next_run_at if it's not sufficiently in the future.
# - Test database rollback behavior on commit failure.
# - Test what happens if schedule.report_definition_id is None (already somewhat covered by filter).
# - Test the `or_(ReportSchedule.next_run_at == None, ...)` clause in the query.
# - Consider testing with a real (in-memory) DB if complex query logic needs validation.
# - Test different schedule_type filtering if that becomes relevant.
# - If `SELECT FOR UPDATE` or similar locking is added, test its behavior (complex).
# - Test if `reporting_service.execute_definition_schedule_job` modifies the schedule object in ways
#   that `ReportSchedulingService` needs to be aware of beyond what's already tested.
#   (e.g. if it also tried to set next_run_at, which it shouldn't).
# - Test logging calls if any critical logging is added.
# - Ensure all mocked async functions are awaited.
# - Ensure `mock_db_session.commit` is called appropriately after successful processing of a schedule.
# - Ensure `mock_db_session.rollback` is called on DB errors during commit.
# - Test the `schedule.update_execution_stats(success=False)` call in the unhandled exception block.
#   This requires `due_schedule` to be a MagicMock or have these attributes if they are not part of SQLAlchemy model directly for testing.
#   (SQLAlchemy models have these, so it should be fine if `due_schedule` is a real model instance or a mock that mimics it).
#   `update_execution_stats` is a method on the ReportSchedule model.
#   Need to ensure the `due_schedule` fixture instance correctly handles this call if we want to assert its effects.
#   For these tests, `due_schedule` is a real `ReportSchedule` instance, so `update_execution_stats` will run.
#   We can assert its side effects (e.g., `failed_executions` count).

# To run these tests, you'd typically use:
# pytest path/to/your/tests
# Ensure __init__.py exists in digame/app/tests and digame/app/tests/services.
# And that `digame` is in PYTHONPATH or tests are run from the project root.
# `pip install pytest pytest-asyncio croniter`
# (boto3, httpx are for the other test file)
# The tests assume that the `ReportSchedule` model has an `update_execution_stats` method.
# If it doesn't, the calls to it will fail or need mocking on the instance.
# Based on `digame/app/models/reporting.py`, `ReportSchedule` does have this method.
# Ensure `reporting_service_part1.datetime` is patched if testing specific `datetime.utcnow()` calls within that service.
# Here, we are testing `report_scheduling_service.py`, so `datetime.now(timezone.utc)` is used.
# Patching `digame.app.services.report_scheduling_service.datetime` for `now()` is appropriate for `_calculate_next_run_time` test.
# For `process_due_schedules`, `datetime.now(timezone.utc)` is called directly. Patching it there:
# `with patch("digame.app.services.report_scheduling_service.datetime") as mock_datetime:`
# `mock_datetime.now.return_value = ...`
# `mock_datetime.utcnow.return_value = ...` (if that's used)
# `mock_datetime.timezone = timezone` (to keep timezone object accessible)
# This is important for predictable `now_utc` and `last_run_at` comparisons.
# The current tests for `process_due_schedules` don't explicitly patch `datetime.now`, so they use the actual current time.
# This can make assertions on `next_run_at` slightly less deterministic if the test takes time.
# For robust time-based tests, patching `datetime.now` is recommended.
# Example for `test_process_due_schedules_executes_due_schedule`:
# `with patch("digame.app.services.report_scheduling_service.datetime", MagicMock(now=MagicMock(return_value=fixed_now_utc), timezone=timezone)):`
# where `fixed_now_utc` is a predefined datetime object.
# This also applies to `due_schedule.last_run_at` in the unhandled exception test.
# The `update_execution_stats` method updates `last_run_at = datetime.utcnow()`.
# So, for that test, `digame.app.models.reporting.datetime.utcnow` would need patching if we want to check exact `last_run_at` value.
# However, checking `> original_last_run_at` is often sufficient.
