from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import datetime

class OnboardingStep(BaseModel):
    step_id: str
    completed: bool = False
    data: Optional[Dict[str, Any]] = None # Data collected at this step

class UserOnboardingStatus(BaseModel):
    user_id: str
    current_step_id: Optional[str] = "welcome" # Default starting step
    completed_all: bool = False
    last_updated: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    steps: List[OnboardingStep] = []
    preferences: Dict[str, Any] = {} # General preferences

class OnboardingStepUpdate(BaseModel):
    step_id: str
    data: Optional[Dict[str, Any]] = None

class OnboardingPreferencesUpdate(BaseModel):
    preferences: Dict[str, Any]
