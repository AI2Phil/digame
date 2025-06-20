from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone

# Assuming schemas are in a sibling directory 'schemas'
from ..schemas.mobile_ai_schemas import (
    UserNotificationPrefsRequest,
    NotificationTrigger,
    VoiceCommandRequest,  # Added
    VoiceCommandResponse  # Added
)
import re # For simple keyword parsing

class MobileAIService:
    def __init__(self, db: Session):
        self.db = db

    async def save_user_notification_preferences(
        self,
        user_id: int,
        prefs: UserNotificationPrefsRequest
    ) -> bool:
        print(f"Received notification preferences for user {user_id}:")
        print(f"  Enabled Types: {prefs.notification_enabled_types}")
        print(f"  Preferred Times: {prefs.preferred_times}")
        print(f"  Behavior Summary: {prefs.behavior_summary}")
        return True

    async def get_ai_notification_triggers(
        self,
        user_id: int
    ) -> List[NotificationTrigger]:
        print(f"Generating AI notification triggers for user {user_id}")
        mock_triggers = []
        mock_triggers.append(NotificationTrigger(
            trigger_type="daily_summary",
            message_template="☀️ Here's your AI-powered daily summary to kickstart your day!",
            relative_schedule_info={"type": "daily_at", "time": "08:30"},
            presentation_options={"priority": "default"}
        ))
        mock_triggers.append(NotificationTrigger(
            trigger_type="task_completion_prompt",
            message_template="🚀 Great job on completing {task_name}! Ready for the next challenge?",
            condition={"type": "event_occurred", "event_name": "task_completed", "min_tasks_today_for_prompt": 1},
            presentation_options={"priority": "high", "sound": "positive_ping.caf"}
        ))
        if user_id % 2 == 0:
             mock_triggers.append(NotificationTrigger(
                trigger_type="productivity_tip",
                message_template="Pro Tip: Batch similar tasks together to improve focus!",
                relative_schedule_info={"type": "on_app_open", "frequency_cap_per_day": 1},
                presentation_options={"priority": "low"}
            ))
        return mock_triggers

    async def interpret_voice_command(
        self,
        user_id: int, # For potential personalization or context in the future
        command_request: VoiceCommandRequest
    ) -> VoiceCommandResponse:
        """
        Simulates NLU for interpreting voice commands using simple keyword matching.
        """
        text = command_request.text.lower()
        print(f"Interpreting voice command for user {user_id}: '{text}' (Lang: {command_request.language})")

        # Simple keyword-based intent recognition
        if re.search(r"\b(go to|navigate to|open)\b.*\b(analytics|dashboard)\b", text):
            screen_name = "Analytics" if "analytics" in text else "Dashboard"
            return VoiceCommandResponse(
                intent="navigate_to_screen",
                parameters={"screen_name": screen_name},
                responseText=f"Navigating to {screen_name}."
            )
        elif re.search(r"\b(show|display|what are|find)\b.*\b(my tasks|tasks)\b", text):
            return VoiceCommandResponse(
                intent="query_data",
                parameters={"data_type": "user_tasks", "status_filter": "pending"}, # Example parameter
                responseText="Fetching your pending tasks."
            )
        elif re.search(r"\b(create|add|new)\b.*\b(task|to-do|reminder)\b", text):
            # Try to extract task title if possible (very basic)
            task_title_match = re.search(r"\b(task|to-do|reminder)\b\s*(?:called|named|that says|is|for|to)\s*(.+)", text)
            task_title = task_title_match.group(2) if task_title_match else None
            return VoiceCommandResponse(
                intent="create_item",
                parameters={"item_type": "task", "title": task_title} if task_title else {"item_type": "task"},
                responseText=f"OK. Adding a new task." + (f" It's called '{task_title}'." if task_title else " What should it be called?")
            )
        elif re.search(r"\b(create|add|new)\b.*\b(note|document)\b", text):
            return VoiceCommandResponse(
                intent="create_item",
                parameters={"item_type": "note"},
                responseText="Okay, creating a new note. What would you like the note to say?"
            )
        elif re.search(r"\b(help|what can i say|what can you do)\b", text):
            return VoiceCommandResponse(
                intent="show_help",
                responseText="You can ask me to navigate to screens like Dashboard or Analytics, show your tasks, or create new tasks and notes. For example, say 'Go to Dashboard' or 'Create a new task called Buy Milk'."
            )
        else:
            return VoiceCommandResponse(
                intent="unknown_command",
                parameters={"original_text": command_request.text},
                responseText="Sorry, I didn't understand that. Can you try rephrasing?"
            )
```
