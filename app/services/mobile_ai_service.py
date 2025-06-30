from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone

# Assuming schemas are in a sibling directory 'schemas'
from ..schemas.mobile_ai_schemas import (
    UserNotificationPrefsRequest,
    NotificationTrigger,
    VoiceCommandRequest,  # Added
    VoiceCommandResponse,  # Added
    AIModelMetadataResponse, # Added
    AIModelListResponse # Added
)
import re # For simple keyword parsing
import os # For file system operations
from fastapi import HTTPException
from fastapi.responses import FileResponse
from pathlib import Path # For path manipulation

# Define a base directory for storing AI models on the server
# This should be configured appropriately in a real application
SERVER_AI_MODELS_DIR = Path(os.getenv("SERVER_AI_MODELS_DIR", "published_models"))

class MobileAIService:
    def __init__(self, db: Session):
        self.db = db
        # Ensure the server models directory exists
        SERVER_AI_MODELS_DIR.mkdir(parents=True, exist_ok=True)
        # Create a dummy model file for testing if it doesn't exist
        dummy_model_path = SERVER_AI_MODELS_DIR / "voice_rec_en_v1.0.0.model"
        if not dummy_model_path.exists():
            with open(dummy_model_path, "w") as f:
                f.write("This is a dummy voice recognition model for English v1.0.0")

        dummy_model_path_v2 = SERVER_AI_MODELS_DIR / "voice_rec_en_v1.0.1.model"
        if not dummy_model_path_v2.exists():
            with open(dummy_model_path_v2, "w") as f:
                f.write("This is a dummy voice recognition model for English v1.0.1 - updated")


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
        trigger_data = {
            "trigger_type": "daily_summary",
            "message_template": "☀️ Here's your AI-powered daily summary to kickstart your day!",
            "relative_schedule_info": {"type": "daily_at", "time": "08:30"},
            "presentation_options": {"priority": "default"}
        }
        mock_triggers.append(NotificationTrigger(**trigger_data))
        trigger = NotificationTrigger()  # type: ignore
        setattr(trigger, 'trigger_type', "task_completion_prompt")  # type: ignore
        setattr(trigger, 'message_template', "🚀 Great job on completing {task_name}! Ready for the next challenge?")  # type: ignore
        setattr(trigger, 'condition', {"type": "event_occurred", "event_name": "task_completed", "min_tasks_today_for_prompt": 1})  # type: ignore
        setattr(trigger, 'presentation_options', {"priority": "high", "sound": "positive_ping.caf"})  # type: ignore
        mock_triggers.append(trigger)
        if user_id % 2 == 0:
             trigger_data = {
                "trigger_type": "productivity_tip",
                "message_template": "Pro Tip: Batch similar tasks together to improve focus!",
                "relative_schedule_info": {"type": "on_app_open", "frequency_cap_per_day": 1},
                "presentation_options": {"priority": "low"}
            }
             mock_triggers.append(NotificationTrigger(**trigger_data))
        return mock_triggers

    async def interpret_voice_command(
        self,
        user_id: int, # For potential personalization or context in the future
        command_request: VoiceCommandRequest
    ) -> VoiceCommandResponse:
        """
        Simulates NLU for interpreting voice commands using simple keyword matching.
        """
        command_text = getattr(command_request, 'text', '')  # type: ignore
        command_language = getattr(command_request, 'language', 'en')  # type: ignore
        text = command_text.lower()
        print(f"Interpreting voice command for user {user_id}: '{text}' (Lang: {command_language})")

        # Simple keyword-based intent recognition
        if re.search(r"\b(go to|navigate to|open)\b.*\b(analytics|dashboard)\b", text):
            screen_name = "Analytics" if "analytics" in text else "Dashboard"
            response_data = {
                "intent": "navigate_to_screen",
                "parameters": {"screen_name": screen_name},
                "responseText": f"Navigating to {screen_name}."
            }
            return VoiceCommandResponse(**response_data)
        elif re.search(r"\b(show|display|what are|find)\b.*\b(my tasks|tasks)\b", text):
            response_data = {
                "intent": "query_data",
                "parameters": {"data_type": "user_tasks", "status_filter": "pending"}, # Example parameter
                "responseText": "Fetching your pending tasks."
            }
            return VoiceCommandResponse(**response_data)
        elif re.search(r"\b(create|add|new)\b.*\b(task|to-do|reminder)\b", text):
            # Try to extract task title if possible (very basic)
            task_title_match = re.search(r"\b(task|to-do|reminder)\b\s*(?:called|named|that says|is|for|to)\s*(.+)", text)
            task_title = task_title_match.group(2) if task_title_match else None
            response_data = {
                "intent": "create_item",
                "parameters": {"item_type": "task", "title": task_title} if task_title else {"item_type": "task"},
                "responseText": f"OK. Adding a new task." + (f" It's called '{task_title}'." if task_title else " What should it be called?")
            }
            return VoiceCommandResponse(**response_data)
        elif re.search(r"\b(create|add|new)\b.*\b(note|document)\b", text):
            response_data = {
                "intent": "create_item",
                "parameters": {"item_type": "note"},
                "responseText": "Okay, creating a new note. What would you like the note to say?"
            }
            return VoiceCommandResponse(**response_data)
        elif re.search(r"\b(help|what can i say|what can you do)\b", text):
            response_data = {
                "intent": "show_help",
                "responseText": "You can ask me to navigate to screens like Dashboard or Analytics, show your tasks, or create new tasks and notes. For example, say 'Go to Dashboard' or 'Create a new task called Buy Milk'."
            }
            return VoiceCommandResponse(**response_data)
        else:
            response_data = {
                "intent": "unknown_command",
                "parameters": {"original_text": getattr(command_request, 'text', '')},  # type: ignore
                "response_text": "Sorry, I didn't understand that. Can you try rephrasing?"
            }
            return VoiceCommandResponse(**response_data)

    # --- AI Model Management Endpoints ---

    async def list_available_ai_models(self) -> AIModelListResponse:
        """
        Lists available AI models that can be downloaded by the client.
        This implementation scans the SERVER_AI_MODELS_DIR.
        A more robust solution would use a database or configuration file.
        File naming convention: <model_type>_<language_code>_v<version>.model
        Example: voice_rec_en_v1.0.0.model
        """
        models = []
        try:
            if SERVER_AI_MODELS_DIR.exists():
                for item in SERVER_AI_MODELS_DIR.iterdir():
                    if item.is_file() and item.name.endswith(".model"):
                        try:
                            parts = item.stem.split('_v') # item.stem is filename without .model
                            if len(parts) == 2:
                                name_lang_part = parts[0]
                                version = parts[1]

                                # Try to split name_lang_part further for model_type and language
                                # This is a simple parser, might need more robust logic
                                name_parts = name_lang_part.split('_')
                                model_name = "_".join(name_parts[:-1]) if len(name_parts) > 1 else name_parts[0]
                                language = name_parts[-1] if len(name_parts) > 1 else "unknown"

                                # Safe file size access
                                try:
                                    file_size = item.stat().st_size
                                except (OSError, AttributeError):
                                    file_size = 0

                                model_metadata = AIModelMetadataResponse()  # type: ignore
                                setattr(model_metadata, 'model_name', model_name)  # type: ignore
                                setattr(model_metadata, 'version', version)  # type: ignore
                                setattr(model_metadata, 'language', language)  # type: ignore
                                setattr(model_metadata, 'description', f"{model_name.replace('_', ' ').title()} model for {language}, version {version}.")  # type: ignore
                                setattr(model_metadata, 'download_url', f"/api/mobile-ai/models/download/{item.name}")  # type: ignore
                                setattr(model_metadata, 'size_bytes', file_size)  # type: ignore
                                setattr(model_metadata, 'metadata', {"trained_on": "general_corpus", "format": "proprietary"})  # type: ignore
                                models.append(model_metadata)
                        except Exception as e:
                            # Skip files that can't be processed
                            print(f"Error processing model file {item.name}: {e}")
                            continue
        except Exception as e:
            print(f"Error listing AI models: {e}") # Replace with proper logging
            # Optionally re-raise or return an empty list with an error message
            raise HTTPException(status_code=500, detail=f"Could not list AI models: {str(e)}")

        response = AIModelListResponse()  # type: ignore
        setattr(response, 'models', models)  # type: ignore
        return response

    async def get_ai_model_file(self, file_name: str) -> FileResponse:
        """
        Serves an AI model file for download.
        """
        try:
            model_path = SERVER_AI_MODELS_DIR / file_name
            if not model_path.exists() or not model_path.is_file():
                raise HTTPException(status_code=404, detail=f"Model file '{file_name}' not found.")

            # Ensure path traversal is not possible (though Path helps here)
            try:
                # Resolve the path to ensure it's within the intended directory
                resolved_path = model_path.resolve()
                server_models_resolved = SERVER_AI_MODELS_DIR.resolve()
                if not str(resolved_path).startswith(str(server_models_resolved)):
                     raise HTTPException(status_code=403, detail="Access to this file is forbidden.")
            except Exception as e: # Catches potential errors during path resolution
                raise HTTPException(status_code=400, detail=f"Invalid file name: {str(e)}")

            return FileResponse(
                path=str(model_path),
                filename=file_name,
                media_type='application/octet-stream' # Generic binary file type
            )
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            # Handle any other unexpected errors
            raise HTTPException(status_code=500, detail=f"Error serving model file: {str(e)}")
