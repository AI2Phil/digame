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

    voice_nlu_service = VoiceNLUService(db=db)
    try:
        interpretation = await voice_nlu_service.interpret_voice_command(
            user_id=current_user.id,
            transcribed_text=voice_input.text,
            language=voice_input.language
        )
        return interpretation
    except HTTPException as e: # Catch HTTPExceptions raised by the service
        raise e
    except Exception as e: # Catch any other unexpected errors
        # Log the exception details here if possible
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during voice interpretation: {str(e)}")
