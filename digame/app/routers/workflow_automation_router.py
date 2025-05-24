"""
Workflow Automation API router for business process automation and workflow management
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

from ..database import get_db
from ..services.workflow_automation_service import WorkflowAutomationService, WorkflowTemplateService
from ..models.workflow_automation import (
    WorkflowTemplate, WorkflowInstance, WorkflowStepExecution,
    AutomationRule, WorkflowAction, WorkflowIntegration
)

router = APIRouter(prefix="/api/workflow-automation", tags=["workflow-automation"])


# Pydantic models for request/response
class WorkflowTemplateCreate(BaseModel):
    name: str = Field(..., description="Template name")
    description: Optional[str] = None
    category: str = Field(..., description="Template category")
    version: str = Field(default="1.0", description="Template version")
    workflow_definition: Dict[str, Any] = Field(..., description="Workflow definition")
    input_schema: Dict[str, Any] = Field(default={}, description="Input schema")
    output_schema: Dict[str, Any] = Field(default={}, description="Output schema")
    estimated_duration: Optional[int] = None
    tags: List[str] = Field(default=[], description="Template tags")
    is_public: bool = Field(default=False, description="Is template public")
    requires_approval: bool = Field(default=False, description="Requires approval")


class WorkflowTemplateResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: str
    version: str
    complexity_level: str
    estimated_duration: Optional[int] = None
    tags: List[str]
    is_public: bool
    is_active: bool
    requires_approval: bool
    usage_count: int
    success_rate: float
    avg_execution_time: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WorkflowInstanceCreate(BaseModel):
    name: str = Field(..., description="Instance name")
    description: Optional[str] = None
    input_data: Dict[str, Any] = Field(default={}, description="Input data")
    context_data: Dict[str, Any] = Field(default={}, description="Context data")
    priority: int = Field(default=5, description="Priority (1-10)")


class WorkflowInstanceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    status: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    context_data: Dict[str, Any]
    current_step_id: Optional[str] = None
    progress_percentage: float
    steps_completed: int
    steps_total: int
    execution_start_time: Optional[datetime] = None
    execution_end_time: Optional[datetime] = None
    execution_duration: Optional[float] = None
    error_count: int
    last_error: Optional[str] = None
    retry_count: int
    max_retries: int
    triggered_by: Optional[str] = None
    priority: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WorkflowStepExecutionResponse(BaseModel):
    id: int
    step_id: str
    step_name: str
    step_type: str
    step_config: Dict[str, Any]
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    status: str
    execution_order: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    execution_duration: Optional[float] = None
    error_message: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = None
    retry_count: int
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AutomationRuleCreate(BaseModel):
    name: str = Field(..., description="Rule name")
    description: Optional[str] = None
    trigger_type: str = Field(..., description="Trigger type")
    trigger_config: Dict[str, Any] = Field(..., description="Trigger configuration")
    conditions: List[Dict[str, Any]] = Field(default=[], description="Rule conditions")
    workflow_template_id: int = Field(..., description="Workflow template ID")
    action_config: Dict[str, Any] = Field(default={}, description="Action configuration")
    priority: int = Field(default=5, description="Priority (1-10)")
    rate_limit: int = Field(default=100, description="Rate limit per hour")


class AutomationRuleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_config: Dict[str, Any]
    conditions: List[Dict[str, Any]]
    workflow_template_id: int
    action_config: Dict[str, Any]
    is_active: bool
    priority: int
    rate_limit: int
    total_executions: int
    successful_executions: int
    failed_executions: int
    last_execution: Optional[datetime] = None
    avg_execution_time: float
    success_rate: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WorkflowActionCreate(BaseModel):
    name: str = Field(..., description="Action name")
    description: Optional[str] = None
    category: str = Field(..., description="Action category")
    action_type: str = Field(..., description="Action type")
    config_schema: Dict[str, Any] = Field(..., description="Configuration schema")
    default_config: Dict[str, Any] = Field(default={}, description="Default configuration")
    is_system_action: bool = Field(default=False, description="Is system action")
    requires_auth: bool = Field(default=False, description="Requires authentication")
    test_config: Dict[str, Any] = Field(default={}, description="Test configuration")


class WorkflowActionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: str
    action_type: str
    config_schema: Dict[str, Any]
    default_config: Dict[str, Any]
    is_system_action: bool
    is_active: bool
    requires_auth: bool
    usage_count: int
    success_rate: float
    avg_execution_time: float
    test_config: Dict[str, Any]
    last_tested: Optional[datetime] = None
    test_success: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WorkflowAnalyticsResponse(BaseModel):
    period: Dict[str, str]
    workflow_instances: Dict[str, Any]
    automation_rules: Dict[str, Any]
    performance: Dict[str, Any]


# Workflow Template endpoints
@router.post("/templates", response_model=WorkflowTemplateResponse)
async def create_workflow_template(
    template_data: WorkflowTemplateCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: int = Query(..., description="Creator user ID"),
    db: Session = Depends(get_db)
):
    """
    Create a new workflow template
    """
    try:
        service = WorkflowAutomationService(db)
        template = service.create_workflow_template(
            tenant_id=tenant_id,
            created_by=created_by,
            template_data=template_data.dict()
        )
        return WorkflowTemplateResponse.from_orm(template)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/templates", response_model=List[WorkflowTemplateResponse])
async def get_workflow_templates(
    tenant_id: int = Query(..., description="Tenant ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    is_active: bool = Query(True, description="Filter by active status"),
    is_public: Optional[bool] = Query(None, description="Filter by public status"),
    db: Session = Depends(get_db)
):
    """
    Get workflow templates for a tenant
    """
    try:
        service = WorkflowAutomationService(db)
        templates = service.get_workflow_templates(
            tenant_id=tenant_id,
            category=category,
            is_active=is_active,
            is_public=is_public
        )
        return [WorkflowTemplateResponse.from_orm(template) for template in templates]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/templates/{template_id}", response_model=WorkflowTemplateResponse)
async def get_workflow_template(
    template_id: int,
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """
    Get a specific workflow template
    """
    try:
        template = db.query(WorkflowTemplate).filter(
            WorkflowTemplate.id == template_id,
            WorkflowTemplate.tenant_id == tenant_id
        ).first()
        
        if not template:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
        
        return WorkflowTemplateResponse.from_orm(template)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/templates/{template_id}/initialize-defaults")
async def initialize_default_templates(
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: int = Query(..., description="Creator user ID"),
    db: Session = Depends(get_db)
):
    """
    Initialize default workflow templates for a tenant
    """
    try:
        service = WorkflowTemplateService(db)
        service.initialize_default_templates(tenant_id=tenant_id, created_by=created_by)
        return {"message": "Default templates initialized successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Workflow Instance endpoints
@router.post("/templates/{template_id}/instances", response_model=WorkflowInstanceResponse)
async def create_workflow_instance(
    template_id: int,
    instance_data: WorkflowInstanceCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    triggered_by: str = Query("manual", description="Trigger source"),
    db: Session = Depends(get_db)
):
    """
    Create a new workflow instance from a template
    """
    try:
        service = WorkflowAutomationService(db)
        instance = service.create_workflow_instance(
            tenant_id=tenant_id,
            template_id=template_id,
            instance_data=instance_data.dict(),
            triggered_by=triggered_by
        )
        return WorkflowInstanceResponse.from_orm(instance)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/instances", response_model=List[WorkflowInstanceResponse])
async def get_workflow_instances(
    tenant_id: int = Query(..., description="Tenant ID"),
    template_id: Optional[int] = Query(None, description="Filter by template ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """
    Get workflow instances for a tenant
    """
    try:
        service = WorkflowAutomationService(db)
        instances = service.get_workflow_instances(
            tenant_id=tenant_id,
            template_id=template_id,
            status=status
        )
        return [WorkflowInstanceResponse.from_orm(instance) for instance in instances]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/instances/{instance_id}", response_model=WorkflowInstanceResponse)
async def get_workflow_instance(
    instance_id: int,
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """
    Get a specific workflow instance
    """
    try:
        instance = db.query(WorkflowInstance).filter(
            WorkflowInstance.id == instance_id,
            WorkflowInstance.tenant_id == tenant_id
        ).first()
        
        if not instance:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instance not found")
        
        return WorkflowInstanceResponse.from_orm(instance)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/instances/{instance_id}/execute")
async def execute_workflow_instance(
    instance_id: int,
    tenant_id: int = Query(..., description="Tenant ID"),
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Execute a workflow instance
    """
    try:
        # Verify instance exists and belongs to tenant
        instance = db.query(WorkflowInstance).filter(
            WorkflowInstance.id == instance_id,
            WorkflowInstance.tenant_id == tenant_id
        ).first()
        
        if not instance:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instance not found")
        
        # Execute in background
        service = WorkflowAutomationService(db)
        background_tasks.add_task(service.execute_workflow_instance, instance_id)
        
        return {"message": "Workflow execution started", "instance_id": instance_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/instances/{instance_id}/steps", response_model=List[WorkflowStepExecutionResponse])
async def get_workflow_instance_steps(
    instance_id: int,
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """
    Get workflow step executions for an instance
    """
    try:
        # Verify instance exists and belongs to tenant
        instance = db.query(WorkflowInstance).filter(
            WorkflowInstance.id == instance_id,
            WorkflowInstance.tenant_id == tenant_id
        ).first()
        
        if not instance:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instance not found")
        
        steps = db.query(WorkflowStepExecution).filter(
            WorkflowStepExecution.workflow_instance_id == instance_id
        ).order_by(WorkflowStepExecution.execution_order).all()
        
        return [WorkflowStepExecutionResponse.from_orm(step) for step in steps]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Automation Rule endpoints
@router.post("/automation-rules", response_model=AutomationRuleResponse)
async def create_automation_rule(
    rule_data: AutomationRuleCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: int = Query(..., description="Creator user ID"),
    db: Session = Depends(get_db)
):
    """
    Create a new automation rule
    """
    try:
        service = WorkflowAutomationService(db)
        rule = service.create_automation_rule(
            tenant_id=tenant_id,
            created_by=created_by,
            rule_data=rule_data.dict()
        )
        return AutomationRuleResponse.from_orm(rule)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/automation-rules", response_model=List[AutomationRuleResponse])
async def get_automation_rules(
    tenant_id: int = Query(..., description="Tenant ID"),
    trigger_type: Optional[str] = Query(None, description="Filter by trigger type"),
    is_active: bool = Query(True, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    """
    Get automation rules for a tenant
    """
    try:
        service = WorkflowAutomationService(db)
        rules = service.get_automation_rules(
            tenant_id=tenant_id,
            trigger_type=trigger_type,
            is_active=is_active
        )
        return [AutomationRuleResponse.from_orm(rule) for rule in rules]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/automation-rules/{rule_id}", response_model=AutomationRuleResponse)
async def get_automation_rule(
    rule_id: int,
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """
    Get a specific automation rule
    """
    try:
        rule = db.query(AutomationRule).filter(
            AutomationRule.id == rule_id,
            AutomationRule.tenant_id == tenant_id
        ).first()
        
        if not rule:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
        
        return AutomationRuleResponse.from_orm(rule)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/automation-rules/{rule_id}/trigger")
async def trigger_automation_rule(
    rule_id: int,
    trigger_data: Dict[str, Any],
    tenant_id: int = Query(..., description="Tenant ID"),
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Manually trigger an automation rule
    """
    try:
        # Verify rule exists and belongs to tenant
        rule = db.query(AutomationRule).filter(
            AutomationRule.id == rule_id,
            AutomationRule.tenant_id == tenant_id
        ).first()
        
        if not rule:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
        
        # Trigger in background
        service = WorkflowAutomationService(db)
        background_tasks.add_task(service.trigger_automation_rule, rule_id, trigger_data)
        
        return {"message": "Automation rule triggered", "rule_id": rule_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Workflow Action endpoints
@router.post("/actions", response_model=WorkflowActionResponse)
async def create_workflow_action(
    action_data: WorkflowActionCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: Optional[int] = Query(None, description="Creator user ID"),
    db: Session = Depends(get_db)
):
    """
    Create a new workflow action
    """
    try:
        service = WorkflowAutomationService(db)
        action = service.create_workflow_action(
            tenant_id=tenant_id,
            created_by=created_by,
            action_data=action_data.dict()
        )
        return WorkflowActionResponse.from_orm(action)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/actions", response_model=List[WorkflowActionResponse])
async def get_workflow_actions(
    tenant_id: int = Query(..., description="Tenant ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    action_type: Optional[str] = Query(None, description="Filter by action type"),
    is_active: bool = Query(True, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    """
    Get workflow actions for a tenant
    """
    try:
        service = WorkflowAutomationService(db)
        actions = service.get_workflow_actions(
            tenant_id=tenant_id,
            category=category,
            action_type=action_type,
            is_active=is_active
        )
        return [WorkflowActionResponse.from_orm(action) for action in actions]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/actions/{action_id}", response_model=WorkflowActionResponse)
async def get_workflow_action(
    action_id: int,
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """
    Get a specific workflow action
    """
    try:
        action = db.query(WorkflowAction).filter(
            WorkflowAction.id == action_id,
            WorkflowAction.tenant_id == tenant_id
        ).first()
        
        if not action:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")
        
        return WorkflowActionResponse.from_orm(action)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/actions/{action_id}/test")
async def test_workflow_action(
    action_id: int,
    test_config: Dict[str, Any],
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """
    Test a workflow action
    """
    try:
        # Verify action exists and belongs to tenant
        action = db.query(WorkflowAction).filter(
            WorkflowAction.id == action_id,
            WorkflowAction.tenant_id == tenant_id
        ).first()
        
        if not action:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")
        
        service = WorkflowAutomationService(db)
        result = service.test_workflow_action(action_id, test_config)
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Analytics endpoints
@router.get("/analytics", response_model=WorkflowAnalyticsResponse)
async def get_workflow_analytics(
    tenant_id: int = Query(..., description="Tenant ID"),
    start_date: Optional[datetime] = Query(None, description="Start date for analytics"),
    end_date: Optional[datetime] = Query(None, description="End date for analytics"),
    db: Session = Depends(get_db)
):
    """
    Get workflow analytics for a tenant
    """
    try:
        service = WorkflowAutomationService(db)
        analytics = service.get_workflow_analytics(
            tenant_id=tenant_id,
            start_date=start_date,
            end_date=end_date
        )
        return WorkflowAnalyticsResponse(**analytics)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Health check endpoint
@router.get("/health")
async def workflow_automation_health():
    """
    Health check for workflow automation service
    """
    return {
        "status": "healthy",
        "service": "workflow-automation",
        "timestamp": datetime.utcnow().isoformat(),
        "features": [
            "workflow_templates",
            "workflow_instances",
            "automation_rules",
            "workflow_actions",
            "analytics"
        ]
    }