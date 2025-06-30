"""
Calendar Service for generating calendar events for tasks.
"""
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional

from ..models.task import Task

# Using a third-party library for iCalendar generation might be good,
# but for now, let's do a basic manual generation.
# If using a library: from icalendar import Calendar, Event

class CalendarService:

    def _format_datetime_for_ical(self, dt: Optional[datetime]) -> str:
        """Formats a datetime object into iCalendar UTC format."""
        if not dt:
            # iCalendar requires dates; if not present, we can't make a valid event part
            # Or, use a default like now, but that might be misleading.
            # For now, returning an empty string and handling it in the calling function.
            return ""
        if dt.tzinfo is None:
            # Assume UTC if naive, though it's better if datetimes are timezone-aware upstream
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt.strftime("%Y%m%dT%H%M%SZ")

    def generate_ics_for_task(self, task: Task) -> str:
        """
        Generates an iCalendar (.ics) file content for a given task.
        """
        if not getattr(task, 'id', None) or not getattr(task, 'description', None):
            raise ValueError("Task must have an ID and description to generate an iCS file.")

        task_id = getattr(task, 'id', 0)
        created_at = getattr(task, 'created_at', datetime.utcnow())
        uid = f"task-{task_id}-{created_at.strftime('%Y%m%dT%H%M%S')}@digame.com"
        task_description = getattr(task, 'description', '')
        summary = task_description[:75] # Keep summary concise
        task_notes = getattr(task, 'notes', None)
        description = task_notes or task_description # Use notes if available, else full description

        # Determine DTSTART and DTEND
        # If task has a due_date_inferred or deadline, use it.
        # If it has estimated_effort_hours, we can calculate an end time from a start time.
        # For simplicity, if only a due date is present, make it an all-day event or a 1-hour event on that day.

        dtstart_str = ""
        dtend_str = ""

        # Prioritize deadline, then due_date_inferred
        deadline = getattr(task, 'deadline', None)
        due_date_inferred = getattr(task, 'due_date_inferred', None)
        event_date = deadline if deadline else due_date_inferred

        if event_date:
            # If it's just a date (no time), assume start of day or make it an all-day event
            if event_date.hour == 0 and event_date.minute == 0 and event_date.second == 0:
                 # All-day event: Use DATE format instead of DATETIME
                dtstart_str = f"DTSTART;VALUE=DATE:{event_date.strftime('%Y%m%d')}"
                # For all-day events, DTEND is typically the start of the next day
                dtend_str = f"DTEND;VALUE=DATE:{(event_date + timedelta(days=1)).strftime('%Y%m%d')}"
            else:
                # Event with specific time
                dtstart_obj = event_date
                estimated_effort_hours = getattr(task, 'estimated_effort_hours', None)
                if estimated_effort_hours and estimated_effort_hours > 0:
                    dtend_obj = dtstart_obj + timedelta(hours=estimated_effort_hours)
                else:
                    # Default to 1 hour duration if no effort is specified
                    dtend_obj = dtstart_obj + timedelta(hours=1)

                dtstart_str = f"DTSTART:{self._format_datetime_for_ical(dtstart_obj)}"
                dtend_str = f"DTEND:{self._format_datetime_for_ical(dtend_obj)}"
        else:
            # If no date, we can't create a timed event.
            # Optionally, create a VTODO component instead, but for now, we focus on VEVENT.
            # Or, default to today, 1 hour duration.
            # For now, let's skip event creation if no date is available.
            # However, the plan implies we should generate *something*.
            # Let's default to a 1-hour event starting now if no dates.
            dtstart_obj = datetime.utcnow()
            dtend_obj = dtstart_obj + timedelta(hours=1)
            dtstart_str = f"DTSTART:{self._format_datetime_for_ical(dtstart_obj)}"
            dtend_str = f"DTEND:{self._format_datetime_for_ical(dtend_obj)}"


        # Basic iCalendar structure
        # Using \r\n for line endings as per RFC 5545
        ics_content = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Digame//Task Management//EN",
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"SUMMARY:{summary}",
            f"DESCRIPTION:{description.replace(chr(10), chr(92) + 'n')}", # Escape newlines
        ]

        if dtstart_str:
            ics_content.append(dtstart_str)
        if dtend_str:
            ics_content.append(dtend_str)

        # Add created and last_modified timestamps
        ics_content.append(f"DTSTAMP:{self._format_datetime_for_ical(datetime.utcnow())}")
        if getattr(task, 'created_at', None):
            ics_content.append(f"CREATED:{self._format_datetime_for_ical(getattr(task, 'created_at', None))}")
        if getattr(task, 'updated_at', None):
            ics_content.append(f"LAST-MODIFIED:{self._format_datetime_for_ical(getattr(task, 'updated_at', None))}")

        # Add status if relevant (VTODO might be better for tasks with status)
        # For VEVENT, we can put it in description or use X-properties.
        # Example: ics_content.append(f"X-DIGAME-STATUS:{task.status}")

        priority_score = getattr(task, 'priority_score', None)
        if priority_score is not None:
            # Map priority score (0.0-1.0) to iCalendar priority (0-9)
            # 0: undefined, 1: highest, 9: lowest.
            # Our score: 1.0 is highest.
            ical_priority = 0
            if priority_score >= 0.9:
                ical_priority = 1
            elif priority_score >= 0.75:
                ical_priority = 2
            elif priority_score >= 0.6:
                ical_priority = 3
            elif priority_score >= 0.5:
                ical_priority = 5 # Medium
            elif priority_score >= 0.3:
                ical_priority = 7
            elif priority_score > 0:
                ical_priority = 8

            if ical_priority > 0:
                ics_content.append(f"PRIORITY:{ical_priority}")


        ics_content.append("END:VEVENT")
        ics_content.append("END:VCALENDAR")

        return "\r\n".join(ics_content)

    # Placeholder for more advanced calendar event management (e.g., via API)
    # def create_event_for_task_api(self, task: Task, user_calendar_preferences: Dict) -> Optional[str]:
    #     """
    #     Creates a calendar event in an external calendar system (e.g., Google Calendar)
    #     Returns the external event ID if successful.
    #     """
    #     # This would involve:
    #     # 1. Getting user's OAuth token for the calendar service.
    #     # 2. Formatting the request for the specific calendar API.
    #     # 3. Making the API call.
    #     # 4. Storing the returned event ID in task.calendar_event_id.
    #     pass

    # def update_event_for_task_api(self, task: Task, user_calendar_preferences: Dict) -> bool:
    #     """
    #     Updates an existing calendar event in an external system.
    #     """
    #     # Similar to create, but uses task.calendar_event_id to identify the event.
    #     pass

# Example Usage (conceptual):
# if __name__ == '__main__':
#     from app.models.task import Task as TaskModel # Adjust import based on actual structure
#     import pytz # For timezone aware datetime objects
#
#     # Create a dummy task
#     dummy_task = TaskModel(
#         id=123,
#         user_id=1,
#         description="This is a test task for iCalendar generation. It's important!",
#         notes="Detailed notes about the task: \n1. First item\n2. Second item.",
#         priority_score=0.95,
#         status='in_progress',
#         created_at=datetime.utcnow() - timedelta(days=2),
#         updated_at=datetime.utcnow() - timedelta(hours=1),
#         # due_date_inferred=datetime.utcnow() + timedelta(days=3, hours=2), # Specific time
#         deadline = (datetime.utcnow() + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0), # All-day
#         estimated_effort_hours=2.5
#     )
#
#     calendar_service = CalendarService()
#     ics_data = calendar_service.generate_ics_for_task(dummy_task)
#     print(ics_data)
#
#     # To save to a file:
#     # with open("task_event.ics", "w") as f:
#     #     f.write(ics_data)
#     print("\nICS data generated. To test, save it as a .ics file and import into a calendar application.")
#
#     dummy_task_no_date = TaskModel(
#         id=124,
#         user_id=1,
#         description="Task without a specific due date.",
#         created_at=datetime.utcnow(),
#         priority_score=0.3
#     )
#     ics_data_no_date = calendar_service.generate_ics_for_task(dummy_task_no_date)
#     print("\nICS for task with no date (defaults to now, 1hr):")
#     print(ics_data_no_date)

def get_calendar_service() -> CalendarService:
    """
    Factory function for FastAPI dependency injection.
    Provides an instance of CalendarService.
    """
    return CalendarService()
