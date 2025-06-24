from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from ..db import get_db
from ..auth.auth_dependencies import get_current_active_user
from ..models.user import User as UserModel # Assuming this is the alias for the user model
from ..services.voice_nlu_service import VoiceNLUService

router = APIRouter(
    prefix="/voice",
    tags=["Voice NLU"]
)

class VoiceInput(BaseModel):
    text: str
    language: Optional[str] = "en-US"

@router.post("/interpret", response_model=Dict[str, Any])
async def interpret_command(
    voice_input: VoiceInput,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    if not current_user or not current_user.is_active:
        raise HTTPException(status_code=403, detail="User not authenticated or inactive.")

from ..services.voice_nlu_service import VoiceNLUService
from ..crud import task_crud
from ..schemas import task_schemas
from datetime import datetime

router = APIRouter(
    prefix="/voice",
    tags=["Voice NLU"]
)

class VoiceInput(BaseModel):
    text: str
    language: Optional[str] = "en-US"

from ..services.voice_action_helpers import map_priority_to_score, parse_date_string

@router.post("/interpret", response_model=Dict[str, Any])
async def interpret_command(
    voice_input: VoiceInput,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    if not current_user or not current_user.is_active:
        raise HTTPException(status_code=403, detail="User not authenticated or inactive.")

    voice_nlu_service = VoiceNLUService(db=db)
    try:
        interpretation = await voice_nlu_service.interpret_voice_command(
            user_id=current_user.id,
            transcribed_text=voice_input.text,
            language=voice_input.language
        )

        intent = interpretation.get("intent")
        entities = interpretation.get("entities", {})

        if intent == "CREATE_TASK":
            task_name = entities.get("task_name")
            due_date_str = entities.get("due_date")
            priority_str = entities.get("priority")

            if not task_name:
                return {"status": "error", "message": "Task name is required to create a task."}

            task_create_data = task_schemas.TaskCreate(
                description=task_name,
                due_date_inferred=parse_date_string(due_date_str),
                priority_score=map_priority_to_score(priority_str) if priority_str else 0.5, # Default priority
                status='suggested' # Default status for new tasks via voice
            )
            created_task = task_crud.create_task(db=db, task=task_create_data, user_id=current_user.id)
            return {"status": "success", "intent": intent, "message": "Task created successfully.", "task": task_schemas.TaskResponse.from_orm(created_task).model_dump()}

        elif intent == "FIND_TASK":
            keywords = entities.get("task_identifier_keywords")
            if not keywords:
                return {"status": "error", "message": "Keywords are required to find a task."}

            found_tasks = task_crud.search_tasks_by_keywords(db=db, user_id=current_user.id, keywords=keywords, limit=5)
            if not found_tasks:
                return {"status": "success", "intent": intent, "message": f"No tasks found matching '{keywords}'."}

            return {
                "status": "success",
                "intent": intent,
                "message": f"Found {len(found_tasks)} task(s) matching '{keywords}'.",
                "tasks": [task_schemas.TaskResponse.from_orm(task).model_dump() for task in found_tasks]
            }

        elif intent == "EDIT_TASK":
            keywords = entities.get("task_identifier_keywords")
            if not keywords:
                return {"status": "error", "message": "Keywords are required to identify the task to edit."}

            found_tasks = task_crud.search_tasks_by_keywords(db=db, user_id=current_user.id, keywords=keywords, limit=2) # Limit to 2 to check for ambiguity

            if not found_tasks:
                return {"status": "success", "intent": intent, "message": f"No task found matching '{keywords}' to edit."}
            if len(found_tasks) > 1:
                return {
                    "status": "clarification_needed",
                    "intent": intent,
                    "message": f"Multiple tasks match '{keywords}'. Please be more specific.",
                    "tasks": [task_schemas.TaskResponse.from_orm(task).model_dump(include={'id', 'description'}) for task in found_tasks]
                }

            task_to_edit = found_tasks[0]

            update_data = {}
            if "new_description" in entities and entities["new_description"]:
                update_data["description"] = entities["new_description"]
            if "new_due_date" in entities and entities["new_due_date"]:
                parsed_due_date = parse_date_string(entities["new_due_date"])
                if parsed_due_date: # Or handle parsing error
                    update_data["due_date_inferred"] = parsed_due_date
            if "new_priority" in entities and entities["new_priority"]:
                parsed_priority = map_priority_to_score(entities["new_priority"])
                if parsed_priority is not None: # Check for valid mapping
                     update_data["priority_score"] = parsed_priority
            if "new_status" in entities and entities["new_status"]:
                update_data["status"] = entities["new_status"]

            if not update_data:
                return {"status": "error", "intent": intent, "message": "No changes specified for the task."}

            task_update_schema = task_schemas.TaskUpdate(**update_data)
            updated_task = task_crud.update_task(db=db, task_id=task_to_edit.id, task_update=task_update_schema, user_id=current_user.id)

            if not updated_task:
                 return {"status": "error", "intent": intent, "message": "Failed to update the task."} # Should not happen if task was found

            return {"status": "success", "intent": intent, "message": "Task updated successfully.", "task": task_schemas.TaskResponse.from_orm(updated_task).model_dump()}

        elif intent == "COMPLETE_TASK":
            keywords = entities.get("task_identifier_keywords")
            if not keywords:
                return {"status": "error", "message": "Keywords are required to identify the task to complete."}

            found_tasks = task_crud.search_tasks_by_keywords(db=db, user_id=current_user.id, keywords=keywords, limit=2)

            if not found_tasks:
                return {"status": "success", "intent": intent, "message": f"No task found matching '{keywords}' to complete."}
            if len(found_tasks) > 1:
                 return {
                    "status": "clarification_needed",
                    "intent": intent,
                    "message": f"Multiple tasks match '{keywords}'. Please be more specific.",
                    "tasks": [task_schemas.TaskResponse.from_orm(task).model_dump(include={'id', 'description'}) for task in found_tasks]
                }

            task_to_complete = found_tasks[0]
            updated_task = task_crud.update_task_status(db=db, task_id=task_to_complete.id, new_status="completed", user_id=current_user.id)

            if not updated_task:
                return {"status": "error", "intent": intent, "message": "Failed to complete the task."} # Should not happen

            return {"status": "success", "intent": intent, "message": "Task marked as completed.", "task": task_schemas.TaskResponse.from_orm(updated_task).model_dump()}

        # Fallback for other intents or if NLU result is just returned directly
        return interpretation

    except HTTPException as e: # Catch HTTPExceptions raised by the service or previous logic
        raise e
    except Exception as e: # Catch any other unexpected errors
        # Log the exception details here if possible
        # Consider using a proper logger
        print(f"Unexpected error in /voice/interpret: {str(e)}") # Basic logging
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during voice interpretation: {str(e)}")
