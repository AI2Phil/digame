"""
Pydantic schemas for Digital Twin API endpoints
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class TwinStatusEnum(str, Enum):
    INITIALIZING = "initializing"
    LEARNING = "learning"
    ACTIVE = "active"
    PAUSED = "paused"
    ERROR = "error"

# Base schemas
class DigitalTwinBase(BaseModel):
    name: str = Field(..., description="Name of the digital twin")
    status: Optional[TwinStatusEnum] = Field(TwinStatusEnum.INITIALIZING, description="Current status of the twin")

class DigitalTwinCreate(DigitalTwinBase):
    """Schema for creating a new digital twin"""
    pass

class DigitalTwinUpdate(BaseModel):
    """Schema for updating a digital twin"""
    name: Optional[str] = None
    status: Optional[TwinStatusEnum] = None

class DigitalTwinResponse(DigitalTwinBase):
    """Schema for digital twin responses"""
    id: str
    user_id: int
    learning_progress: float = Field(..., description="Learning progress percentage (0-100)")
    accuracy_score: float = Field(..., description="Model accuracy score (0-100)")
    model_version: Optional[str] = None
    last_training_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Activity Pattern schemas
class ActivityPatternBase(BaseModel):
    pattern_type: str = Field(..., description="Type of activity pattern")
    pattern_data: Dict[str, Any] = Field(..., description="Pattern data as JSON")
    confidence_score: Optional[float] = Field(None, description="Confidence score (0-100)")
    frequency_score: Optional[float] = Field(None, description="Frequency score (0-100)")
    impact_score: Optional[float] = Field(None, description="Impact score (0-100)")

class ActivityPatternCreate(ActivityPatternBase):
    """Schema for creating activity patterns"""
    twin_id: str

class ActivityPatternResponse(ActivityPatternBase):
    """Schema for activity pattern responses"""
    id: str
    twin_id: str
    discovered_at: datetime
    validated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Twin Interaction schemas
class TwinInteractionBase(BaseModel):
    interaction_type: str = Field(..., description="Type of interaction")
    input_data: Optional[Dict[str, Any]] = Field(None, description="Input data as JSON")
    user_feedback: Optional[int] = Field(None, description="User feedback rating (1-5)")

class TwinInteractionCreate(TwinInteractionBase):
    """Schema for creating twin interactions"""
    pass

class TwinInteractionResponse(TwinInteractionBase):
    """Schema for twin interaction responses"""
    id: str
    twin_id: str
    response_data: Optional[Dict[str, Any]] = None
    processing_time_ms: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Twin Insights schemas
class TwinInsightsResponse(BaseModel):
    """Schema for comprehensive twin insights"""
    twin_status: Dict[str, Any] = Field(..., description="Current twin status information")
    discovered_patterns: List[ActivityPatternResponse] = Field(..., description="Recently discovered patterns")
    predictions: List[Dict[str, Any]] = Field(..., description="Recent predictions")
    recommendations: List[Dict[str, Any]] = Field(..., description="AI-generated recommendations")

# Activity Data schemas
class ActivityDataInput(BaseModel):
    """Schema for processing activity data"""
    activity_type: str = Field(..., description="Type of activity")
    activity_data: Dict[str, Any] = Field(..., description="Activity data as JSON")
    timestamp: Optional[datetime] = Field(None, description="Activity timestamp")

# Simulation schemas
class SimulationParametersBase(BaseModel):
    """Base schema for simulation parameters"""
    simulation_type: str = Field(..., description="Type of simulation to run")
    parameters: Dict[str, Any] = Field(..., description="Simulation parameters")

class SimulationRequest(SimulationParametersBase):
    """Schema for simulation requests"""
    pass

class SimulationResponse(BaseModel):
    """Schema for simulation responses"""
    id: str
    twin_id: str
    simulation_type: str
    input_parameters: Dict[str, Any]
    simulation_results: Dict[str, Any]
    confidence_score: Optional[float] = None
    execution_time_ms: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Prediction schemas
class PredictionRequest(BaseModel):
    """Schema for prediction requests"""
    prediction_type: str = Field(..., description="Type of prediction to generate")
    time_horizon_hours: int = Field(..., description="Prediction time horizon in hours")

class PredictionResponse(BaseModel):
    """Schema for prediction responses"""
    prediction_type: str
    time_horizon: str
    predictions: List[Dict[str, Any]]
    confidence_intervals: Dict[str, Any]
    model_accuracy: Optional[float] = None
    generated_at: datetime

# Chat/Conversation schemas
class TwinChatMessage(BaseModel):
    """Schema for twin chat messages"""
    message: str = Field(..., description="User message to the twin")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")

class TwinChatResponse(BaseModel):
    """Schema for twin chat responses"""
    query: str
    intent: Dict[str, Any]
    entities: List[Dict[str, Any]]
    response: Dict[str, Any]
    actions: List[Dict[str, Any]]
    confidence: float
    context_used: Dict[str, Any]

# Dashboard schemas
class TwinDashboardData(BaseModel):
    """Schema for twin dashboard data"""
    twin: DigitalTwinResponse
    recent_patterns: List[ActivityPatternResponse]
    recent_interactions: List[TwinInteractionResponse]
    learning_metrics: Dict[str, Any]
    performance_metrics: Dict[str, Any]

# List responses
class DigitalTwinListResponse(BaseModel):
    """Schema for listing digital twins"""
    twins: List[DigitalTwinResponse]
    total: int
    page: int
    size: int

class ActivityPatternListResponse(BaseModel):
    """Schema for listing activity patterns"""
    patterns: List[ActivityPatternResponse]
    total: int
    page: int
    size: int