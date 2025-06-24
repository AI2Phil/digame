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
from fastapi import APIRouter, Depends, HTTPException # Ensure HTTPException is imported
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from ..db import get_db
from ..auth.auth_dependencies import get_current_active_user
from ..models.user import User as UserModel
from ..services.voice_nlu_service import VoiceNLUService
from ..crud import task_crud
from ..schemas import task_schemas
from datetime import datetime
from ..services.voice_action_helpers import map_priority_to_score, parse_date_string

router = APIRouter(
    prefix="/voice",
    tags=["Voice NLU"]
)

class VoiceInput(BaseModel):
    text: str
    language: Optional[str] = "en-US"
    conversation_context: Optional[Dict[str, Any]] = None # Added for context

@router.post("/interpret", response_model=Dict[str, Any])
async def interpret_command(
    voice_input: VoiceInput,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    if not current_user or not current_user.is_active:
        raise HTTPException(status_code=403, detail="User not authenticated or inactive.")

    voice_nlu_service = VoiceNLUService(db=db)

    # Prepare new context for this turn - will be updated based on actions
    new_conversation_context: Dict[str, Any] = {}

    try:
        interpretation = await voice_nlu_service.interpret_voice_command(
            user_id=current_user.id,
            transcribed_text=voice_input.text,
            language=voice_input.language,
            conversation_context=voice_input.conversation_context # Pass received context to NLU service
        )

        intent = interpretation.get("intent")
        entities = interpretation.get("entities", {})

        # Store current intent and entities in context for potential use by next turn or response
        new_conversation_context["last_intent"] = intent
        new_conversation_context["last_entities"] = entities
        new_conversation_context["last_user_command"] = voice_input.text


        if intent == "CREATE_TASK":
            task_name = entities.get("task_name")
            due_date_str = entities.get("due_date")
            priority_str = entities.get("priority")

            if not task_name:
                return {"status": "error", "message": "Task name is required to create a task.", "conversation_context": new_conversation_context}

            task_create_data = task_schemas.TaskCreate(
                description=task_name,
                due_date_inferred=parse_date_string(due_date_str),
                priority_score=map_priority_to_score(priority_str) if priority_str else 0.5,
                status='suggested'
            )
            created_task = task_crud.create_task(db=db, task=task_create_data, user_id=current_user.id)
            new_conversation_context["last_action_result"] = {"task_id": created_task.id, "description": created_task.description}
            return {"status": "success", "intent": intent, "message": "Task created successfully.", "task": task_schemas.TaskResponse.from_orm(created_task).model_dump(), "conversation_context": new_conversation_context}

        elif intent == "FIND_TASK":
            keywords = entities.get("task_identifier_keywords")
            if not keywords:
                return {"status": "error", "message": "Keywords are required to find a task.", "conversation_context": new_conversation_context}

            found_tasks = task_crud.search_tasks_by_keywords(db=db, user_id=current_user.id, keywords=keywords, limit=5)
            if not found_tasks:
                new_conversation_context["last_action_result"] = {"tasks_found": 0}
                return {"status": "success", "intent": intent, "message": f"No tasks found matching '{keywords}'.", "conversation_context": new_conversation_context}

            task_list_for_context = [{"id": t.id, "description": t.description} for t in found_tasks]
            new_conversation_context["last_action_result"] = {"tasks_found": len(found_tasks), "tasks_summary": task_list_for_context}
            return {
                "status": "success",
                "intent": intent,
                "message": f"Found {len(found_tasks)} task(s) matching '{keywords}'.",
                "tasks": [task_schemas.TaskResponse.from_orm(task).model_dump() for task in found_tasks],
                "conversation_context": new_conversation_context
            }

        elif intent == "EDIT_TASK":
            task_to_process = None
            keywords = entities.get("task_identifier_keywords")
            referenced_task_index = entities.get("referenced_task_index") # e.g., 0 for "first", 1 for "second"

            # Try to use context first if an index is referenced
            if referenced_task_index is not None and \
               voice_input.conversation_context and \
               "last_action_result" in voice_input.conversation_context and \
               "tasks_summary" in voice_input.conversation_context["last_action_result"]:

                previous_tasks = voice_input.conversation_context["last_action_result"]["tasks_summary"]
                if 0 <= referenced_task_index < len(previous_tasks):
                    task_id_from_context = previous_tasks[referenced_task_index].get("id")
                    if task_id_from_context:
                        task_to_process = task_crud.get_task_by_id(db=db, task_id=task_id_from_context, user_id=current_user.id)
                        if not task_to_process:
                             return {"status": "error", "message": f"Referenced task (index {referenced_task_index}) not found or access denied.", "conversation_context": new_conversation_context}
                else:
                    return {"status": "error", "message": f"Invalid referenced task index: {referenced_task_index}.", "conversation_context": new_conversation_context}

            if not task_to_process: # Fallback to keyword search if no context reference or task not found by context
                if not keywords:
                    return {"status": "error", "message": "Keywords or contextual reference (e.g., 'the first one') are required to identify the task to edit.", "conversation_context": new_conversation_context}

                found_tasks_by_keyword = task_crud.search_tasks_by_keywords(db=db, user_id=current_user.id, keywords=keywords, limit=2)
                if not found_tasks_by_keyword:
                    return {"status": "success", "intent": intent, "message": f"No task found matching '{keywords}' to edit.", "conversation_context": new_conversation_context}
                if len(found_tasks_by_keyword) > 1:
                    task_list_for_context = [{"id": t.id, "description": t.description} for t in found_tasks_by_keyword]
                    new_conversation_context["clarification_needed_for_tasks"] = task_list_for_context
                    return {
                        "status": "clarification_needed",
                        "intent": intent,
                        "message": f"Multiple tasks match '{keywords}'. Please be more specific or use context (e.g. 'the first one' from a previous list).",
                        "tasks": [task_schemas.TaskResponse.from_orm(task).model_dump(include={'id', 'description'}) for task in found_tasks_by_keyword],
                        "conversation_context": new_conversation_context
                    }
                task_to_process = found_tasks_by_keyword[0]

            if not task_to_process: # Should be caught above, but as a safeguard
                 return {"status": "error", "message": "Could not identify the task to edit.", "conversation_context": new_conversation_context}

            task_to_edit = task_to_process # Use the identified task

            # ... (rest of the update logic for task_to_edit remains the same)
            update_data = {}
            if "new_description" in entities and entities["new_description"]:
                update_data["description"] = entities["new_description"]
            if "new_due_date" in entities and entities["new_due_date"]:
                parsed_due_date = parse_date_string(entities["new_due_date"])
                if parsed_due_date:
                    update_data["due_date_inferred"] = parsed_due_date
            if "new_priority" in entities and entities["new_priority"]:
                parsed_priority = map_priority_to_score(entities["new_priority"])
                if parsed_priority is not None:
                     update_data["priority_score"] = parsed_priority
            if "new_status" in entities and entities["new_status"]:
                update_data["status"] = entities["new_status"]

            if not update_data:
                return {"status": "error", "intent": intent, "message": "No changes specified for the task.", "conversation_context": new_conversation_context}

            task_update_schema = task_schemas.TaskUpdate(**update_data)
            updated_task = task_crud.update_task(db=db, task_id=task_to_edit.id, task_update=task_update_schema, user_id=current_user.id)

            if not updated_task:
                 return {"status": "error", "intent": intent, "message": "Failed to update the task.", "conversation_context": new_conversation_context}

            new_conversation_context["last_action_result"] = {"task_id": updated_task.id, "updated_fields": list(update_data.keys())}
            return {"status": "success", "intent": intent, "message": "Task updated successfully.", "task": task_schemas.TaskResponse.from_orm(updated_task).model_dump(), "conversation_context": new_conversation_context}

        elif intent == "COMPLETE_TASK":
            task_to_process = None
            keywords = entities.get("task_identifier_keywords")
            referenced_task_index = entities.get("referenced_task_index")

            if referenced_task_index is not None and \
               voice_input.conversation_context and \
               "last_action_result" in voice_input.conversation_context and \
               "tasks_summary" in voice_input.conversation_context["last_action_result"]:

                previous_tasks = voice_input.conversation_context["last_action_result"]["tasks_summary"]
                if 0 <= referenced_task_index < len(previous_tasks):
                    task_id_from_context = previous_tasks[referenced_task_index].get("id")
                    if task_id_from_context:
                        task_to_process = task_crud.get_task_by_id(db=db, task_id=task_id_from_context, user_id=current_user.id)
                        if not task_to_process:
                            return {"status": "error", "message": f"Referenced task (index {referenced_task_index}) not found or access denied.", "conversation_context": new_conversation_context}
                else:
                    return {"status": "error", "message": f"Invalid referenced task index: {referenced_task_index}.", "conversation_context": new_conversation_context}

            if not task_to_process:
                if not keywords:
                    return {"status": "error", "message": "Keywords or contextual reference are required to identify the task to complete.", "conversation_context": new_conversation_context}

                found_tasks_by_keyword = task_crud.search_tasks_by_keywords(db=db, user_id=current_user.id, keywords=keywords, limit=2)
                if not found_tasks_by_keyword:
                    return {"status": "success", "intent": intent, "message": f"No task found matching '{keywords}' to complete.", "conversation_context": new_conversation_context}
                if len(found_tasks_by_keyword) > 1:
                    task_list_for_context = [{"id": t.id, "description": t.description} for t in found_tasks_by_keyword]
                    new_conversation_context["clarification_needed_for_tasks"] = task_list_for_context
                    return {
                        "status": "clarification_needed",
                        "intent": intent,
                        "message": f"Multiple tasks match '{keywords}'. Please be more specific or use context.",
                        "tasks": [task_schemas.TaskResponse.from_orm(task).model_dump(include={'id', 'description'}) for task in found_tasks_by_keyword],
                        "conversation_context": new_conversation_context
                    }
                task_to_process = found_tasks_by_keyword[0]

            if not task_to_process:
                 return {"status": "error", "message": "Could not identify the task to complete.", "conversation_context": new_conversation_context}

            task_to_complete = task_to_process
            updated_task = task_crud.update_task_status(db=db, task_id=task_to_complete.id, new_status="completed", user_id=current_user.id)

            if not updated_task:
                return {"status": "error", "intent": intent, "message": "Failed to complete the task.", "conversation_context": new_conversation_context}

            new_conversation_context["last_action_result"] = {"task_id": updated_task.id, "status": "completed"}
            return {"status": "success", "intent": intent, "message": "Task marked as completed.", "task": task_schemas.TaskResponse.from_orm(updated_task).model_dump(), "conversation_context": new_conversation_context}

        # Fallback for other intents or if NLU result is just returned directly
        # Add conversation_context to the raw interpretation if no specific action taken
        interpretation["conversation_context"] = new_conversation_context
        return interpretation

    except HTTPException as e:
        # If context was being built, it might be useful to return it even on HTTP errors from services
        # However, for now, let's re-raise directly.
        raise e
    except Exception as e:
        # Log the exception details here
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Unexpected error in /voice/interpret for user {current_user.id}: {str(e)}", exc_info=True)
        # Return context even in generic error if possible
        error_response: Dict[str, Any] = {"status": "error", "message": f"An unexpected error occurred: {str(e)}"}
        if new_conversation_context: # Add context if it has been populated
            error_response["conversation_context"] = new_conversation_context
        # It's better to raise HTTPException to ensure proper error response format
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during voice interpretation: {str(e)}")
                return {
                    "status": "clarification_needed",
                    "intent": intent,
                    "message": f"Multiple tasks match '{keywords}'. Please be more specific.",
                    "tasks": [task_schemas.TaskResponse.from_orm(task).model_dump(include={'id', 'description'}) for task in found_tasks],
                    "conversation_context": new_conversation_context
                }

            task_to_edit = found_tasks[0]
            update_data = {}
            if "new_description" in entities and entities["new_description"]:
                update_data["description"] = entities["new_description"]
            if "new_due_date" in entities and entities["new_due_date"]:
                parsed_due_date = parse_date_string(entities["new_due_date"])
                if parsed_due_date:
                    update_data["due_date_inferred"] = parsed_due_date
            if "new_priority" in entities and entities["new_priority"]:
                parsed_priority = map_priority_to_score(entities["new_priority"])
                if parsed_priority is not None:
                     update_data["priority_score"] = parsed_priority
            if "new_status" in entities and entities["new_status"]:
                update_data["status"] = entities["new_status"]

            if not update_data:
                return {"status": "error", "intent": intent, "message": "No changes specified for the task.", "conversation_context": new_conversation_context}

            task_update_schema = task_schemas.TaskUpdate(**update_data)
            updated_task = task_crud.update_task(db=db, task_id=task_to_edit.id, task_update=task_update_schema, user_id=current_user.id)

            if not updated_task:
                 return {"status": "error", "intent": intent, "message": "Failed to update the task.", "conversation_context": new_conversation_context}

            new_conversation_context["last_action_result"] = {"task_id": updated_task.id, "updated_fields": list(update_data.keys())}
            return {"status": "success", "intent": intent, "message": "Task updated successfully.", "task": task_schemas.TaskResponse.from_orm(updated_task).model_dump(), "conversation_context": new_conversation_context}

        elif intent == "COMPLETE_TASK":
            keywords = entities.get("task_identifier_keywords")
            if not keywords:
                return {"status": "error", "message": "Keywords are required to identify the task to complete.", "conversation_context": new_conversation_context}

            found_tasks = task_crud.search_tasks_by_keywords(db=db, user_id=current_user.id, keywords=keywords, limit=2)

            if not found_tasks:
                return {"status": "success", "intent": intent, "message": f"No task found matching '{keywords}' to complete.", "conversation_context": new_conversation_context}
            if len(found_tasks) > 1:
                task_list_for_context = [{"id": t.id, "description": t.description} for t in found_tasks]
                new_conversation_context["clarification_needed_for_tasks"] = task_list_for_context
                return {
                    "status": "clarification_needed",
                    "intent": intent,
                    "message": f"Multiple tasks match '{keywords}'. Please be more specific.",
                    "tasks": [task_schemas.TaskResponse.from_orm(task).model_dump(include={'id', 'description'}) for task in found_tasks],
                    "conversation_context": new_conversation_context
                }

            task_to_complete = found_tasks[0]
            updated_task = task_crud.update_task_status(db=db, task_id=task_to_complete.id, new_status="completed", user_id=current_user.id)

            if not updated_task:
                return {"status": "error", "intent": intent, "message": "Failed to complete the task.", "conversation_context": new_conversation_context}

            new_conversation_context["last_action_result"] = {"task_id": updated_task.id, "status": "completed"}
            return {"status": "success", "intent": intent, "message": "Task marked as completed.", "task": task_schemas.TaskResponse.from_orm(updated_task).model_dump(), "conversation_context": new_conversation_context}

        # Fallback for other intents or if NLU result is just returned directly
        # Add conversation_context to the raw interpretation if no specific action taken
        interpretation["conversation_context"] = new_conversation_context
        return interpretation

    except HTTPException as e:
        # If context was being built, it might be useful to return it even on HTTP errors from services
        # However, for now, let's re-raise directly.
        raise e
    except Exception as e:
        # Log the exception details here
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Unexpected error in /voice/interpret for user {current_user.id}: {str(e)}", exc_info=True)
        # Return context even in generic error if possible
        error_response: Dict[str, Any] = {"status": "error", "message": f"An unexpected error occurred: {str(e)}"}
        if new_conversation_context: # Add context if it has been populated
            error_response["conversation_context"] = new_conversation_context
        # It's better to raise HTTPException to ensure proper error response format
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during voice interpretation: {str(e)}")
