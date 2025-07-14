"""
Service for managing the periodic execution of scheduled reports.
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timezone
from typing import List, Optional
import asyncio # Ensure asyncio is imported

from ..models.reporting import ReportSchedule
from .reporting_service_part1 import ReportingService # Assuming ReportingService is accessible
# It might be better to inject ReportingService instance or have a getter like get_reporting_service
from ..database import get_db # For session management if service is instantiated directly
from fastapi import Depends # For dependency injection if used in an API endpoint context

# Placeholder for cron expression parsing. In a real app, use a library like 'croniter'.
# For now, we'll mock its basic functionality or assume simple cron strings.
try:
    from croniter import croniter
except ImportError:
    print("croniter library not found. Next run time calculation will be basic or placeholder.")
    croniter = None


class ReportSchedulingService:
    def __init__(self, db: Session, reporting_service: ReportingService):
        self.db = db
        self.reporting_service = reporting_service

    def _calculate_next_run_time(self, cron_expr: str, tz_str: str = "UTC", last_run: Optional[datetime] = None) -> Optional[datetime]:
        """
        Calculates the next run time based on a cron expression.
        Uses croniter if available.
        """
        if not croniter:
            print(f"Cannot calculate next run time for '{cron_expr}' accurately without croniter. Skipping update.")
            return None # Or return a far future date, or handle error appropriately

        try:
            # Ensure current time is timezone-aware for croniter if tz_str is used
            # If last_run is provided and more recent than now, base next run on it.
            # Otherwise, base it on the current time.
            base_time = last_run if last_run and last_run > datetime.now(timezone.utc) else datetime.now(timezone.utc)

            # croniter works with naive datetime in UTC or timezone-aware datetime
            # For simplicity, let's assume cron expressions are in UTC if not specified otherwise.
            # The `ReportSchedule.timezone` field should be used.
            # This part needs to be robust regarding timezone handling.
            # For now, let's assume tz_str is a valid timezone string like 'Europe/London'.
            # If croniter is to handle timezones directly, it needs pytz or similar.

            # Simplified: Assume cron_expr is UTC based if tz_str="UTC"
            # A more robust solution would involve pytz for timezone localization with croniter.

            # If the schedule's timezone is not UTC, convert base_time to that timezone first,
            # then get the next run time, then convert back to UTC for storage.
            # This is complex. For now, let's assume croniter handles it or it's UTC.

            iter = croniter(cron_expr, base_time)
            next_run_timestamp = iter.get_next(datetime)
            
            # Convert to datetime if it's a timestamp
            if isinstance(next_run_timestamp, (int, float)):
                next_run_dt = datetime.fromtimestamp(next_run_timestamp, tz=timezone.utc)
            else:
                next_run_dt = next_run_timestamp

            # Ensure it's timezone-aware UTC for storage
            if hasattr(next_run_dt, 'tzinfo') and next_run_dt.tzinfo is None:
                next_run_dt = next_run_dt.replace(tzinfo=timezone.utc)
            elif hasattr(next_run_dt, 'astimezone'):
                next_run_dt = next_run_dt.astimezone(timezone.utc)

            return next_run_dt

        except Exception as e:
            print(f"Error calculating next run time for cron '{cron_expr}': {e}")
            return None

    async def process_due_schedules(self):
        """
        Finds all active report schedules that are due to run and executes them.
        This method would be called periodically (e.g., by a cron job or a background scheduler).
        """
        now_utc = datetime.now(timezone.utc)

        # Query schedules that are active and for report definitions
        base_query = self.db.query(ReportSchedule).filter(
            ReportSchedule.is_active == True,
            ReportSchedule.report_definition_id != None, # Ensure it's for new definitions
            ReportSchedule.schedule_type == "report_definition"
        )
        
        # Get schedules that have never run or are due to run
        never_run_schedules = base_query.filter(ReportSchedule.next_run_at.is_(None)).all()
        due_schedules_query = base_query.filter(ReportSchedule.next_run_at <= now_utc).all()
        
        # Combine results and remove duplicates
        due_schedules: List[ReportSchedule] = list(set(never_run_schedules + due_schedules_query))

        if not due_schedules:
            print(f"{datetime.now()}: No due report schedules to process.")
            return

        print(f"{datetime.now()}: Found {len(due_schedules)} due report schedules. Processing...")

        for schedule in due_schedules:
            schedule_id = getattr(schedule, 'id', 'unknown')
            report_def_id = getattr(schedule, 'report_definition_id', 'unknown')
            print(f"Processing schedule ID: {schedule_id} for ReportDefinition ID: {report_def_id}")

            # Lock the schedule row if possible to prevent concurrent processing in a distributed setup (e.g., SELECT FOR UPDATE)
            # For simplicity, not implemented here.

            original_next_run_at = getattr(schedule, 'next_run_at', None)

            try:
                # Execute the job using ReportingService
                # Use safe method access for execute_definition_schedule_job
                execute_method = getattr(self.reporting_service, 'execute_definition_schedule_job', None)
                if execute_method:
                    generated_files, overall_success = await execute_method(getattr(schedule, 'id', 0))
                else:
                    # Fallback method if execute_definition_schedule_job doesn't exist
                    print(f"execute_definition_schedule_job method not found, using fallback")
                    generated_files, overall_success = [], False

                if overall_success:
                    schedule_id = getattr(schedule, 'id', 'unknown')
                    print(f"Schedule {schedule_id} processed successfully. Files generated: {len(generated_files)}")
                else:
                    schedule_id = getattr(schedule, 'id', 'unknown')
                    print(f"Schedule {schedule_id} processing failed or partially failed.")

            except Exception as e:
                # This is a safety net; execute_definition_schedule_job should handle its own errors
                # and update the schedule status.
                schedule_id = getattr(schedule, 'id', 'unknown')
                print(f"Unhandled error processing schedule {schedule_id}: {e}")
                # Safe method access for update_execution_stats
                update_stats_method = getattr(schedule, 'update_execution_stats', None)
                if update_stats_method:
                    update_stats_method(success=False)
                # Set detailed error message after update_execution_stats to avoid overwriting
                setattr(schedule, 'last_run_status', f"failed: Scheduler error - {str(e)[:200]}")  # type: ignore
                setattr(schedule, 'last_run_at', datetime.now(timezone.utc))  # type: ignore
                # self.db.commit() # Commit this failure, then proceed to update next_run_at

            finally:
                # Calculate and update the next run time for this schedule
                # regardless of success or failure of the current run, unless it's a one-off.
                # (Assuming cron_expression implies recurring; one-off schedules would need different logic)
                cron_expression = getattr(schedule, 'cron_expression', None)
                if cron_expression:
                    timezone_str = getattr(schedule, 'timezone', 'UTC')
                    last_run_at = getattr(schedule, 'last_run_at', None)
                    new_next_run_time = self._calculate_next_run_time(
                        cron_expression,
                        timezone_str,
                        last_run=last_run_at or now_utc # Base on last actual run or now
                    )

                    if new_next_run_time:
                        # Avoid re-running too quickly if calculation is off or job was very fast
                        last_run_at = getattr(schedule, 'last_run_at', None)
                        if new_next_run_time <= (last_run_at or now_utc):
                            print(f"Warning: Calculated next run time {new_next_run_time} is not after last run {last_run_at or now_utc}. Advancing by one more step from new_next_run_time.")
                            if croniter and cron_expression:
                                iter_temp = croniter(cron_expression, new_next_run_time)
                                next_run_timestamp = iter_temp.get_next(datetime)
                                
                                # Convert to datetime if it's a timestamp
                                if isinstance(next_run_timestamp, (int, float)):
                                    new_next_run_time = datetime.fromtimestamp(next_run_timestamp, tz=timezone.utc)
                                else:
                                    new_next_run_time = next_run_timestamp
                                    
                                if hasattr(new_next_run_time, 'tzinfo') and new_next_run_time.tzinfo is None:
                                    new_next_run_time = new_next_run_time.replace(tzinfo=timezone.utc)
                                elif hasattr(new_next_run_time, 'astimezone'):
                                    new_next_run_time = new_next_run_time.astimezone(timezone.utc)


                        setattr(schedule, 'next_run_at', new_next_run_time)  # type: ignore
                        schedule_id = getattr(schedule, 'id', 'unknown')
                        print(f"Updated next_run_at for schedule {schedule_id} to {new_next_run_time}")
                    else:
                        schedule_id = getattr(schedule, 'id', 'unknown')
                        print(f"Could not calculate next run time for schedule {schedule_id}. It might not run again automatically.")
                        # Optionally deactivate the schedule or log a persistent error
                        # schedule.is_active = False # Example: deactivate if next run cannot be determined
                else:
                    # No cron expression, might be a one-time schedule. Deactivate it after running.
                    schedule_id = getattr(schedule, 'id', 'unknown')
                    print(f"Schedule {schedule_id} has no cron expression. Deactivating after this run.")
                    setattr(schedule, 'is_active', False)  # type: ignore

                try:
                    self.db.commit()
                except Exception as db_exc:
                    schedule_id = getattr(schedule, 'id', 'unknown')
                    print(f"Error committing schedule updates for {schedule_id}: {db_exc}")
                    self.db.rollback()


# Example of how this service might be instantiated and used (e.g., in a FastAPI dependency or a script)
# This is conceptual and depends on the broader application structure.

# def get_report_scheduling_service(
#     db: Session = Depends(get_db),
#     reporting_service: ReportingService = Depends(get_reporting_service) # Assuming get_reporting_service exists
# ) -> ReportSchedulingService:
#     return ReportSchedulingService(db=db, reporting_service=reporting_service)

# If running as a standalone script or a Celery task, instantiation would be direct:
# db_session = SessionLocal() # Assuming SessionLocal is your SQLAlchemy session factory
# reporting_service_instance = ReportingService(db=db_session, custom_dashboard_service=...)
# scheduler_service = ReportSchedulingService(db=db_session, reporting_service=reporting_service_instance)
# asyncio.run(scheduler_service.process_due_schedules())
# db_session.close()
