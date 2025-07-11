"""
Pydantic schemas for simulation and decision support features
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class SimulationTypeEnum(str, Enum):
    SCENARIO_PLANNING = "scenario_planning"
    DECISION_IMPACT = "decision_impact"
    RISK_ASSESSMENT = "risk_assessment"
    STRATEGIC_PLANNING = "strategic_planning"
    RESOURCE_OPTIMIZATION = "resource_optimization"
    PERFORMANCE_FORECASTING = "performance_forecasting"


class SimulationStatusEnum(str, Enum):
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class RiskLevelEnum(str, Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"
    CRITICAL = "critical"


# Base schemas
class SimulationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    simulation_type: SimulationTypeEnum
    base_scenario: Dict[str, Any] = Field(..., description="Current state/baseline scenario")
    simulation_parameters: Dict[str, Any] = Field(default_factory=dict)
    variables: List[Dict[str, Any]] = Field(default_factory=list)
    constraints: List[Dict[str, Any]] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    is_template: bool = False
    is_public: bool = False


class SimulationCreate(SimulationBase):
    pass


class SimulationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    simulation_parameters: Optional[Dict[str, Any]] = None
    variables: Optional[List[Dict[str, Any]]] = None
    constraints: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None
    is_template: Optional[bool] = None
    is_public: Optional[bool] = None


class SimulationResponse(SimulationBase):
    id: int
    tenant_id: int
    status: SimulationStatusEnum
    execution_start_time: Optional[datetime] = None
    execution_end_time: Optional[datetime] = None
    execution_duration: Optional[float] = None
    results: Dict[str, Any] = Field(default_factory=dict)
    insights: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    confidence_score: float = 0.0
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: int

    model_config = {"from_attributes": True}
class ScenarioBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    scenario_type: str = Field(default="alternative")
    parameters: Dict[str, Any] = Field(..., description="Scenario-specific parameters")
    assumptions: List[str] = Field(default_factory=list)
    variables: Dict[str, Any] = Field(default_factory=dict)
    probability: float = Field(default=0.0, ge=0.0, le=1.0)


class ScenarioCreate(ScenarioBase):
    simulation_id: int


class ScenarioResponse(ScenarioBase):
    id: int
    simulation_id: int
    outcomes: Dict[str, Any] = Field(default_factory=dict)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    opportunities: List[str] = Field(default_factory=list)
    threats: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
class DecisionAnalysisBase(BaseModel):
    decision_name: str = Field(..., min_length=1, max_length=200)
    decision_description: Optional[str] = None
    decision_category: Optional[str] = None
    options: List[Dict[str, Any]] = Field(..., description="Available decision options")
    criteria: List[Dict[str, Any]] = Field(default_factory=list)


class DecisionAnalysisCreate(DecisionAnalysisBase):
    simulation_id: int


class DecisionAnalysisResponse(DecisionAnalysisBase):
    id: int
    simulation_id: int
    impact_assessment: Dict[str, Any] = Field(default_factory=dict)
    impact_level: str = "moderate"
    affected_areas: List[str] = Field(default_factory=list)
    risks: List[Dict[str, Any]] = Field(default_factory=list)
    opportunities: List[Dict[str, Any]] = Field(default_factory=list)
    mitigation_strategies: List[Dict[str, Any]] = Field(default_factory=list)
    recommended_option: Optional[str] = None
    recommendation_rationale: Optional[str] = None
    implementation_plan: Dict[str, Any] = Field(default_factory=dict)
    success_metrics: List[str] = Field(default_factory=list)
    confidence_score: float = 0.0
    urgency_level: str = "medium"
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
class RiskAssessmentBase(BaseModel):
    risk_name: str = Field(..., min_length=1, max_length=200)
    risk_description: Optional[str] = None
    risk_category: Optional[str] = None
    probability: float = Field(default=0.0, ge=0.0, le=1.0)
    impact_score: float = Field(default=0.0, ge=0.0, le=1.0)
    risk_level: RiskLevelEnum = RiskLevelEnum.MEDIUM


class RiskAssessmentCreate(RiskAssessmentBase):
    simulation_id: int
    triggers: List[str] = Field(default_factory=list)
    consequences: List[str] = Field(default_factory=list)
    affected_objectives: List[str] = Field(default_factory=list)
    mitigation_strategies: List[Dict[str, Any]] = Field(default_factory=list)
    contingency_plans: List[Dict[str, Any]] = Field(default_factory=list)
    monitoring_indicators: List[str] = Field(default_factory=list)
    risk_owner: Optional[str] = None
    review_frequency: str = "monthly"


class RiskAssessmentResponse(RiskAssessmentBase):
    id: int
    simulation_id: int
    triggers: List[str] = Field(default_factory=list)
    consequences: List[str] = Field(default_factory=list)
    affected_objectives: List[str] = Field(default_factory=list)
    mitigation_strategies: List[Dict[str, Any]] = Field(default_factory=list)
    contingency_plans: List[Dict[str, Any]] = Field(default_factory=list)
    monitoring_indicators: List[str] = Field(default_factory=list)
    risk_owner: Optional[str] = None
    review_frequency: str = "monthly"
    current_status: str = "identified"
    last_review_date: Optional[datetime] = None
    next_review_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
class StrategicPlanBase(BaseModel):
    plan_name: str = Field(..., min_length=1, max_length=200)
    plan_description: Optional[str] = None
    plan_type: str = "strategic"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    planning_horizon_months: int = Field(default=12, gt=0, le=120)
    vision: Optional[str] = None
    mission: Optional[str] = None
    objectives: List[Dict[str, Any]] = Field(default_factory=list)
    key_results: List[Dict[str, Any]] = Field(default_factory=list)


class StrategicPlanCreate(StrategicPlanBase):
    swot_analysis: Dict[str, Any] = Field(default_factory=dict)
    competitive_analysis: Dict[str, Any] = Field(default_factory=dict)
    market_analysis: Dict[str, Any] = Field(default_factory=dict)
    initiatives: List[Dict[str, Any]] = Field(default_factory=list)
    resource_requirements: Dict[str, Any] = Field(default_factory=dict)
    timeline: Dict[str, Any] = Field(default_factory=dict)
    budget: Dict[str, Any] = Field(default_factory=dict)
    success_metrics: List[str] = Field(default_factory=list)
    review_schedule: Dict[str, Any] = Field(default_factory=dict)


class StrategicPlanResponse(StrategicPlanBase):
    id: int
    tenant_id: int
    swot_analysis: Dict[str, Any] = Field(default_factory=dict)
    competitive_analysis: Dict[str, Any] = Field(default_factory=dict)
    market_analysis: Dict[str, Any] = Field(default_factory=dict)
    initiatives: List[Dict[str, Any]] = Field(default_factory=list)
    resource_requirements: Dict[str, Any] = Field(default_factory=dict)
    timeline: Dict[str, Any] = Field(default_factory=dict)
    budget: Dict[str, Any] = Field(default_factory=dict)
    success_metrics: List[str] = Field(default_factory=list)
    review_schedule: Dict[str, Any] = Field(default_factory=dict)
    status: str = "draft"
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: int

    model_config = {"from_attributes": True}
class SimulationTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    simulation_type: SimulationTypeEnum
    template_config: Dict[str, Any] = Field(..., description="Template structure")
    default_parameters: Dict[str, Any] = Field(default_factory=dict)
    variable_definitions: List[Dict[str, Any]] = Field(default_factory=list)
    is_public: bool = False
    complexity_level: str = "medium"


class SimulationTemplateCreate(SimulationTemplateBase):
    pass


class SimulationTemplateResponse(SimulationTemplateBase):
    id: int
    tenant_id: int
    usage_count: int = 0
    success_rate: float = 0.0
    avg_execution_time: float = 0.0
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: int

    model_config = {"from_attributes": True}

class ScenarioPlanningRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    base_scenario: Dict[str, Any] = Field(..., description="Current state baseline")
    variables: List[Dict[str, Any]] = Field(..., description="Variables to analyze")
    num_alternative_scenarios: int = Field(default=2, ge=1, le=10)
    variable_weights: Dict[str, float] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)


class DecisionImpactRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    base_scenario: Dict[str, Any] = Field(..., description="Current state baseline")
    decision_options: List[Dict[str, Any]] = Field(..., description="Available options")
    criteria: List[Dict[str, Any]] = Field(..., description="Decision criteria with weights")
    tags: List[str] = Field(default_factory=list)


class RiskAssessmentRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    base_scenario: Dict[str, Any] = Field(..., description="Current state baseline")
    risk_categories: List[str] = Field(default_factory=list)
    assessment_scope: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)


class StrategicPlanningRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    base_scenario: Dict[str, Any] = Field(..., description="Current state baseline")
    objectives: List[Dict[str, Any]] = Field(..., description="Strategic objectives")
    time_horizon_months: int = Field(default=12, gt=0, le=120)
    vision: Optional[str] = None
    mission: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class ResourceOptimizationRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    base_scenario: Dict[str, Any] = Field(..., description="Current state baseline")
    resources: List[Dict[str, Any]] = Field(..., description="Available resources")
    objectives: List[Dict[str, Any]] = Field(..., description="Optimization objectives")
    constraints: List[Dict[str, Any]] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class PerformanceForecastingRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    base_scenario: Dict[str, Any] = Field(..., description="Current state baseline")
    historical_data: List[Dict[str, Any]] = Field(..., description="Historical performance data")
    metrics: List[Dict[str, Any]] = Field(..., description="Metrics to forecast")
    forecast_horizon_months: int = Field(default=12, gt=0, le=60)
    tags: List[str] = Field(default_factory=list)


# Simulation execution and results schemas
class SimulationExecutionRequest(BaseModel):
    simulation_id: int
    execution_parameters: Dict[str, Any] = Field(default_factory=dict)


class SimulationResults(BaseModel):
    simulation_id: int
    execution_time: float
    results: Dict[str, Any]
    insights: List[str]
    recommendations: List[str]
    confidence_score: float
    status: SimulationStatusEnum


class SimulationSummary(BaseModel):
    id: int
    name: str
    simulation_type: SimulationTypeEnum
    status: SimulationStatusEnum
    confidence_score: float
    created_at: datetime
    execution_duration: Optional[float] = None
    insights_count: int = 0
    recommendations_count: int = 0


class SimulationAnalytics(BaseModel):
    total_simulations: int
    completed_simulations: int
    average_execution_time: float
    success_rate: float
    simulation_types: Dict[str, int]
    recent_simulations: List[SimulationSummary]
    top_insights: List[str]
    common_recommendations: List[str]