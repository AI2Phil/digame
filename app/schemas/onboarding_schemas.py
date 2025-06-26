from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class OnboardingStep(BaseModel):
    """
    Represents a single step in the onboarding process.
    """
    step_id: str = Field(..., description="Unique identifier for the onboarding step.")
    completed_at: Optional[datetime] = Field(None, description="Timestamp when the step was completed.")
    # metadata: Optional[Dict[str, Any]] = Field(None, description="Any additional data collected at this step.")

class OnboardingDataBase(BaseModel):
    """
    Base schema for user's onboarding data.
    This structure will be stored as a JSON string in User.onboarding_data.
    """
    current_step_id: Optional[str] = Field(None, description="The ID of the current or last visited onboarding step.")
    completed_steps: List[OnboardingStep] = Field([], description="List of completed onboarding steps.")
    user_preferences: Dict[str, Any] = Field({}, description="User preferences collected during onboarding (e.g., notification settings, content preferences).")
    goals: Optional[Dict[str, Any]] = Field(None, description="User-defined goals or objectives (e.g., learning targets, feature usage goals).")
    feature_exploration: Optional[Dict[str, bool]] = Field(None, description="Tracks if user has explored key features (e.g., {'feature_x_explored': True}).")
    is_completed: bool = Field(False, description="Flag indicating if the entire onboarding process has been completed.")
    
    # version: Optional[str] = "1.0" # To manage future changes to this schema

class OnboardingDataCreate(OnboardingDataBase):
    """
    Schema for creating new onboarding data.
    Typically used when a user starts onboarding or when data is first initialized.
    """
    pass

class OnboardingDataUpdate(BaseModel):
    """
    Schema for updating existing onboarding data.
    All fields are optional for partial updates.
    """
    current_step_id: Optional[str] = Field(None, description="The ID of the current or last visited onboarding step.")
    completed_steps: Optional[List[OnboardingStep]] = Field(None, description="List of completed onboarding steps. Send full list to update.")
    user_preferences: Optional[Dict[str, Any]] = Field(None, description="User preferences collected during onboarding.")
    goals: Optional[Dict[str, Any]] = Field(None, description="User-defined goals or objectives.")
    feature_exploration: Optional[Dict[str, bool]] = Field(None, description="Tracks if user has explored key features.")
    is_completed: Optional[bool] = Field(None, description="Flag indicating if the entire onboarding process has been completed.")

class OnboardingDataResponse(OnboardingDataBase):
    """
    Schema for returning onboarding data to the client.
    Includes all fields from OnboardingDataBase.
    """
    user_id: int # For context, linking back to the user

    class Config:
        orm_mode = True # Though this schema is not directly mapped from User.onboarding_data as a whole ORM object.
                        # It's constructed. Still, good practice.