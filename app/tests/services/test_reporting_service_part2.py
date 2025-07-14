import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

# Clear SQLAlchemy registry to prevent UserRoleAssignment conflicts
from sqlalchemy.orm import clear_mappers
clear_mappers()

from app.services.reporting_service_part1 import ReportingService
from app.services.reporting_service_part2 import ReportSchedulingService, ReportScheduler
from app.models.reporting import ReportSchedule, Report, ReportExecution
from app.models.dashboard_custom import ReportDefinition
from app.services.dashboard_service_custom import CustomDashboardService


@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

@pytest.fixture
def mock_reporting_service_part1():
    service = MagicMock(spec=ReportingService)
    service.get_report_definition = MagicMock()
    service.generate_report_data = AsyncMock()
    service.execute_and_generate_for_definition = AsyncMock()
    # Mock the _log_audit_event from part1 if it's called directly by part2,
    # but part2 has its own _log_audit_event.
    return service

@pytest.fixture
def scheduling_service(mock_db_session, mock_reporting_service_part1):
    return ReportSchedulingService(db=mock_db_session, reporting_service_part1=mock_reporting_service_part1)

@pytest.fixture
def sample_report_definition():
    rd = ReportDefinition()
    setattr(rd, 'id', 1)
    setattr(rd, 'tenant_id', 1)
    setattr(rd, 'name', "Test Definition")
    setattr(rd, 'user_id', 1)  # Required field
    setattr(rd, 'content_blocks', [  # Simplified content blocks
        {"data_source": True, "block_type": "chart"}  # Assumes this block has data
    ])
    setattr(rd, 'report_type', "dashboard")  # or other relevant type
    setattr(rd, 'output_format', "pdf")  # Default output format
    return rd

@pytest.fixture
def sample_schedule_for_definition(sample_report_definition):
    schedule = ReportSchedule()
    setattr(schedule, 'id', 1)
    setattr(schedule, 'tenant_id', 1)
    setattr(schedule, 'report_definition_id', sample_report_definition.id)
    setattr(schedule, 'schedule_type', "report_definition")
    setattr(schedule, 'name', "Daily Definition Report")
    setattr(schedule, 'cron_expression', "0 0 * * *")  # Daily at midnight
    setattr(schedule, 'output_formats', ["pdf", "csv"])
    setattr(schedule, 'default_parameters', {})
    setattr(schedule, 'default_filters', {})
    setattr(schedule, 'next_run_at', datetime.now(datetime.now().astimezone().tzinfo) - timedelta(minutes=1))  # Due to run
    setattr(schedule, 'is_active', True)
    setattr(schedule, 'created_by_user_id', 1)
    setattr(schedule, 'total_executions', 0)  # Initialize to avoid None + int error
    setattr(schedule, 'successful_executions', 0)  # Initialize to avoid None + int error
    setattr(schedule, 'failed_executions', 0)  # Initialize to avoid None + int error
    return schedule

@pytest.fixture
def sample_legacy_report():
    report = Report()
    setattr(report, 'id', 2)
    setattr(report, 'tenant_id', 1)
    setattr(report, 'name', "Legacy Report")
    setattr(report, 'category', "test")
    setattr(report, 'report_type', "pdf")
    setattr(report, 'data_source', "test")
    setattr(report, 'created_by_user_id', 1)
    return report

@pytest.fixture
def sample_schedule_for_legacy_report(sample_legacy_report):
    schedule = ReportSchedule()
    setattr(schedule, 'id', 2)
    setattr(schedule, 'tenant_id', 1)
    setattr(schedule, 'report_id', sample_legacy_report.id)
    setattr(schedule, 'schedule_type', "report")
    setattr(schedule, 'name', "Daily Legacy Report")
    setattr(schedule, 'cron_expression', "0 1 * * *")
    setattr(schedule, 'output_formats', ["pdf"])
    setattr(schedule, 'next_run_at', datetime.now(datetime.now().astimezone().tzinfo) - timedelta(minutes=1))
    setattr(schedule, 'is_active', True)
    setattr(schedule, 'created_by_user_id', 1)
    setattr(schedule, 'total_executions', 0)  # Initialize to avoid None + int error
    setattr(schedule, 'successful_executions', 0)  # Initialize to avoid None + int error
    setattr(schedule, 'failed_executions', 0)  # Initialize to avoid None + int error
    return schedule

@pytest.mark.asyncio
async def test_execute_definition_schedule_logic_success(
    scheduling_service, mock_reporting_service_part1, sample_schedule_for_definition, sample_report_definition
):
    mock_reporting_service_part1.get_report_definition.return_value = sample_report_definition
    mock_reporting_service_part1.generate_report_data.return_value = {
        "report_name": "Test Data",
        "content": [{"data": [{"col1": "val1", "col2": "val2"}]}] # Sample tabular data
    }

    # Mock delivery
    scheduling_service._deliver_scheduled_reports = AsyncMock()
    # Mock audit logging (it's a global function in part2)
    with patch('app.services.reporting_service_part2._log_audit_event') as mock_log_audit:
        result = await scheduling_service._execute_definition_schedule_logic(sample_schedule_for_definition)

    assert result is True
    mock_reporting_service_part1.get_report_definition.assert_called_once_with(
        report_definition_id=sample_schedule_for_definition.report_definition_id
    )
    mock_reporting_service_part1.generate_report_data.assert_called_once_with(
        report_definition_id=sample_report_definition.id
    )
    # The service creates mock executions instead of calling execute_and_generate_for_definition
    # So we check that the delivery method was called instead
    assert mock_reporting_service_part1.execute_and_generate_for_definition.call_count == 0  # Not called in current implementation

    scheduling_service._deliver_scheduled_reports.assert_called_once()
    delivered_executions = scheduling_service._deliver_scheduled_reports.call_args[0][1]
    assert len(delivered_executions) == 2  # pdf and csv
    # Check that the executions have the expected output formats
    output_formats = [getattr(exec, 'output_format', None) for exec in delivered_executions]
    assert 'pdf' in output_formats
    assert 'csv' in output_formats
    assert mock_log_audit.call_count == 0 # No failures logged

@pytest.mark.asyncio
async def test_execute_definition_schedule_logic_report_def_not_found(
    scheduling_service, mock_reporting_service_part1, sample_schedule_for_definition
):
    mock_reporting_service_part1.get_report_definition.return_value = None
    with patch('app.services.reporting_service_part2._log_audit_event') as mock_log_audit:
        result = await scheduling_service._execute_definition_schedule_logic(sample_schedule_for_definition)

    assert result is False
    mock_log_audit.assert_called_once()
    log_details = mock_log_audit.call_args[1]['details']
    assert "ReportDefinition 1 not found" in log_details['error']


@pytest.mark.asyncio
async def test_execute_definition_schedule_logic_no_tabular_data(
    scheduling_service, mock_reporting_service_part1, sample_schedule_for_definition, sample_report_definition
):
    mock_reporting_service_part1.get_report_definition.return_value = sample_report_definition
    # Return data that doesn't conform to expected tabular structure - no data source blocks
    mock_reporting_service_part1.generate_report_data.return_value = {"report_name": "Test Data", "content": [{"text": "Just text"}]}
    # Modify the report definition to expect data but not get it
    setattr(sample_report_definition, 'content_blocks', [
        MagicMock(data_source=True, block_type="chart")  # Expects data but won't get tabular data
    ])
    setattr(sample_report_definition, 'report_type', "dashboard")  # Not text_summary, so data is expected

    with patch('app.services.reporting_service_part2._log_audit_event') as mock_log_audit:
        result = await scheduling_service._execute_definition_schedule_logic(sample_schedule_for_definition)

    assert result is False
    mock_log_audit.assert_called_once()
    log_details = mock_log_audit.call_args[1]['details']
    assert "No suitable tabular data found" in log_details['error']


@pytest.mark.asyncio
async def test_execute_scheduled_report_handles_definition_type(
    scheduling_service, sample_schedule_for_definition
):
    # Mock the actual logic method to see if it's called
    scheduling_service._execute_definition_schedule_logic = AsyncMock(return_value=True)

    with patch.object(scheduling_service, '_calculate_next_run', return_value=datetime.now(datetime.now().astimezone().tzinfo) + timedelta(days=1)) as mock_calc_next:
        result = await scheduling_service.execute_scheduled_report(sample_schedule_for_definition)

    assert result is True
    scheduling_service._execute_definition_schedule_logic.assert_called_once_with(sample_schedule_for_definition)
    assert sample_schedule_for_definition.total_executions == 1
    assert sample_schedule_for_definition.successful_executions == 1
    mock_calc_next.assert_called_once()
    scheduling_service.db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_execute_scheduled_report_handles_legacy_report_type(
    scheduling_service, mock_reporting_service_part1, # mock_reporting_service_part1 needed by _execute_legacy_report_for_schedule
    sample_schedule_for_legacy_report, sample_legacy_report
):
    # Mock the DB query for the legacy report - updated to handle text() query pattern
    mock_query = MagicMock()
    mock_filter_query = MagicMock()
    scheduling_service.db.query.return_value = mock_query
    mock_query.filter.return_value = mock_filter_query
    mock_filter_query.params.return_value.first.return_value = sample_legacy_report
    
    # Mock the actual logic method for legacy reports
    scheduling_service._execute_legacy_report_for_schedule = AsyncMock(return_value=MagicMock(spec=ReportExecution))
    scheduling_service._deliver_scheduled_reports = AsyncMock()

    with patch.object(scheduling_service, '_calculate_next_run', return_value=datetime.now(datetime.now().astimezone().tzinfo) + timedelta(days=1)) as mock_calc_next:
        result = await scheduling_service.execute_scheduled_report(sample_schedule_for_legacy_report)

    assert result is True
    # Verify the query was called with the new text() pattern
    scheduling_service.db.query.assert_called_with(Report)
    mock_query.filter.assert_called_once()
    mock_filter_query.params.assert_called_once_with(report_id=sample_legacy_report.id)
    scheduling_service._execute_legacy_report_for_schedule.assert_called_once_with(
        sample_schedule_for_legacy_report, sample_legacy_report, "pdf" # Default output format
    )
    scheduling_service._deliver_scheduled_reports.assert_called_once()
    assert sample_schedule_for_legacy_report.total_executions == 1
    assert sample_schedule_for_legacy_report.successful_executions == 1
    mock_calc_next.assert_called_once()
    scheduling_service.db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_execute_scheduled_report_failure_updates_stats(
    scheduling_service, sample_schedule_for_definition
):
    scheduling_service._execute_definition_schedule_logic = AsyncMock(side_effect=Exception("Execution failed"))

    with patch.object(scheduling_service, '_calculate_next_run', return_value=datetime.now(datetime.now().astimezone().tzinfo) + timedelta(days=1)) as mock_calc_next, \
         patch('app.services.reporting_service_part2._log_audit_event') as mock_log_audit:
        result = await scheduling_service.execute_scheduled_report(sample_schedule_for_definition)

    assert result is False
    assert sample_schedule_for_definition.total_executions == 1
    assert sample_schedule_for_definition.failed_executions == 1
    assert sample_schedule_for_definition.successful_executions == 0
    mock_calc_next.assert_called_once() # Next run should still be calculated
    mock_log_audit.assert_called_once()
    log_details = mock_log_audit.call_args[1]['details']
    assert "Unhandled exception: Execution failed" in log_details['error']
    scheduling_service.db.commit.assert_called_once()


# ReportScheduler tests
@pytest.fixture
def mock_custom_dashboard_service(): # Required by ReportingService part1
    return MagicMock(spec=CustomDashboardService)

@pytest.fixture
def report_scheduler(mock_db_session, mock_custom_dashboard_service): # Need mock_custom_dashboard_service for ReportingService part1
    # Instantiate ReportingService part1 properly
    rs1 = ReportingService(db=mock_db_session, custom_dashboard_service=mock_custom_dashboard_service)
    return ReportScheduler(db=mock_db_session, reporting_service_part1=rs1)

@pytest.mark.asyncio
@patch('asyncio.sleep', new_callable=AsyncMock) # Mock asyncio.sleep
async def test_report_scheduler_runs_due_schedules(
    mock_asyncio_sleep, report_scheduler, sample_schedule_for_definition, sample_schedule_for_legacy_report
):
    due_schedules = [sample_schedule_for_definition, sample_schedule_for_legacy_report]
    report_scheduler.scheduling_service.get_due_schedules = MagicMock(return_value=due_schedules)
    report_scheduler.scheduling_service.execute_scheduled_report = AsyncMock(return_value=True)

    # Run the scheduler for a couple of iterations
    async def stop_scheduler_after_two_loops(*args):
        if report_scheduler.scheduling_service.execute_scheduled_report.call_count >= 2:
            report_scheduler.stop()
        # Call the original asyncio.sleep if needed, or just pass
        # For this test, we can just make it pass to speed up.
        # await asyncio.sleep(0.01) # Original behavior if needed
    mock_asyncio_sleep.side_effect = stop_scheduler_after_two_loops

    await report_scheduler.start()

    assert report_scheduler.scheduling_service.get_due_schedules.call_count >= 1 # Called at least once
    # execute_scheduled_report should be called for each due schedule
    assert report_scheduler.scheduling_service.execute_scheduled_report.call_count == len(due_schedules)
    calls = report_scheduler.scheduling_service.execute_scheduled_report.call_args_list
    assert calls[0][0][0] == sample_schedule_for_definition
    assert calls[1][0][0] == sample_schedule_for_legacy_report
    assert not report_scheduler.running # Scheduler should have stopped
