from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# Schemas for WorkflowReportConfig

class WorkflowReportConfigBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    workflow_template_id: int
    report_definition_id: int
    trigger_event_type: str = Field(..., description="e.g., on_workflow_completion, on_step_failure")
    trigger_event_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="e.g., {'step_id': 'xyz'}")
    output_format_override: Optional[str] = Field(None, description="e.g., pdf, csv. Overrides ReportDefinition default.")
    delivery_config_override: Optional[Dict[str, Any]] = Field(None, description="Overrides ReportSchedule or provides ad-hoc delivery.")
    parameter_mapping: Optional[Dict[str, str]] = Field(default_factory=dict, description="Maps workflow data to report params, e.g. {'report_param': 'instance.input_data.key'}")
    is_active: bool = True

class WorkflowReportConfigCreate(WorkflowReportConfigBase):
    pass

class WorkflowReportConfigUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    # workflow_template_id: Optional[int] = None # Typically not updatable to avoid confusion
    # report_definition_id: Optional[int] = None # Typically not updatable
    trigger_event_type: Optional[str] = None
    trigger_event_config: Optional[Dict[str, Any]] = None
    output_format_override: Optional[str] = None
    delivery_config_override: Optional[Dict[str, Any]] = None
    parameter_mapping: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None

class WorkflowReportConfigResponse(WorkflowReportConfigBase):
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: int

    class Config:
        from_attributes = True
        # Pydantic v1 used orm_mode = True
        # Pydantic v2 uses from_attributes = True, orm_mode is an alias.

# Schemas for OptimizationRecommendation

class OptimizationRecommendationBase(BaseModel):
    recommendation_type: str = Field(..., description="Type of recommendation, e.g., bottleneck_detected")
    description: str = Field(..., description="Detailed description of the recommendation.")
    affected_workflow_template_id: Optional[int] = None
    affected_workflow_instance_id: Optional[int] = None
    affected_step_id: Optional[str] = None
    suggested_actions: Optional[List[str]] = Field(default_factory=list)
    potential_impact_score: Optional[float] = Field(None, ge=0, le=1, description="Score from 0 to 1.")
    confidence_score: Optional[float] = Field(None, ge=0, le=1, description="Score from 0 to 1.")
    status: str = Field(default="new", description="e.g., new, viewed, implemented")
    priority: int = Field(default=5, ge=1, le=10, description="Priority from 1 (highest) to 10 (lowest).")

class OptimizationRecommendationCreate(OptimizationRecommendationBase):
    # tenant_id and generated_at will be set by the service/system.
    pass

class OptimizationRecommendationUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=10)
    # Other fields like description or suggested_actions could be updatable if needed.
    # For now, primarily status and priority.
    last_reviewed_at: Optional[datetime] = None # Will be set by system on update
    reviewed_by: Optional[int] = None # Will be set by system on update (user_id)


class OptimizationRecommendationResponse(OptimizationRecommendationBase):
    id: int
    tenant_id: int
    generated_at: datetime
    last_reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None # User ID of the reviewer

    class Config:
        from_attributes = True
