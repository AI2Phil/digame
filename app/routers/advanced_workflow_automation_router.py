"""
Advanced Workflow Automation API router for enhanced automation capabilities
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, Path, Body
from fastapi import status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

from ..database import get_db
from ..services.workflow_automation_service import WorkflowAutomationService
from ..services.calendar_service import CalendarService, get_calendar_service
from ..services.process_optimization_service import ProcessOptimizationService, get_process_optimization_service
from ..services.task_prioritization_service import TaskPrioritizationService, get_task_prioritization_service
from ..models.workflow_automation import WorkflowTemplate, WorkflowInstance
from ..schemas.workflow_automation_schemas import (
    OptimizationRecommendationResponse,
    WorkflowReportConfigResponse
)
from ..crud import task_crud

router = APIRouter(prefix="/api/advanced-workflow", tags=["advanced-workflow-automation"])


# Advanced Workflow Analytics Models
class WorkflowPerformanceMetrics(BaseModel):
    template_id: int
    template_name: str
    total_instances: int
    success_rate: float
    avg_execution_time: float
    bottleneck_steps: List[Dict[str, Any]]
    optimization_score: float
    recommendations_count: int


class SmartSchedulingRequest(BaseModel):
    workflow_template_id: int
    priority: int = Field(default=5, gt=0, le=10)
    preferred_start_time: Optional[datetime] = None
    deadline: Optional[datetime] = None
    resource_requirements: Dict[str, Any] = Field(default_factory=dict)
    dependencies: List[int] = Field(default_factory=list)


class SmartSchedulingResponse(BaseModel):
    scheduled_instance_id: int
    recommended_start_time: datetime
    estimated_completion_time: datetime
    resource_allocation: Dict[str, Any]
    confidence_score: float
    scheduling_factors: List[str]


class WorkflowOptimizationSuggestion(BaseModel):
    suggestion_type: str
    description: str
    impact_score: float
    implementation_effort: str
    affected_components: List[str]


class IntelligentTaskPrioritizationRequest(BaseModel):
    workflow_instance_id: int
    context_factors: Dict[str, Any] = Field(default_factory=dict)
    business_rules: Dict[str, Any] = Field(default_factory=dict)


class IntelligentTaskPrioritizationResponse(BaseModel):
    prioritized_tasks: List[Dict[str, Any]]
    priority_reasoning: Dict[str, str]
    estimated_completion_order: List[int]
    resource_optimization_suggestions: List[str]


# Advanced Analytics Endpoints
@router.get("/analytics/performance-dashboard", response_model=List[WorkflowPerformanceMetrics])
async def get_workflow_performance_dashboard(
    tenant_id: int = Query(..., description="Tenant ID"),
    time_period_days: int = Query(30, ge=1, le=365, description="Analysis period in days"),
    include_recommendations: bool = Query(True, description="Include optimization recommendations"),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive workflow performance dashboard with analytics and optimization insights
    """
    try:
        # Initialize services
        task_prio_service = get_task_prioritization_service(db)
        optimization_service = get_process_optimization_service(db)
        
        # Get workflow templates for tenant
        templates = db.query(WorkflowTemplate).filter(
            WorkflowTemplate.tenant_id == tenant_id,
            WorkflowTemplate.is_active == True
        ).all()
        
        performance_metrics = []
        start_date = datetime.utcnow() - timedelta(days=time_period_days)
        
        for template in templates:
            # Get instances for this template in the time period
            instances = db.query(WorkflowInstance).filter(
                WorkflowInstance.template_id == template.id,
                WorkflowInstance.tenant_id == tenant_id,
                WorkflowInstance.created_at >= start_date
            ).all()
            
            if not instances:
                continue
                
            # Calculate performance metrics
            total_instances = len(instances)
            completed_instances = [i for i in instances if i.status == "completed"]
            success_rate = len(completed_instances) / total_instances if total_instances > 0 else 0
            
            avg_execution_time = 0
            if completed_instances:
                execution_times = [i.execution_duration for i in completed_instances if i.execution_duration]
                avg_execution_time = sum(execution_times) / len(execution_times) if execution_times else 0
            
            # Identify bottleneck steps (simplified analysis)
            bottleneck_steps = []
            if template.workflow_definition and "steps" in template.workflow_definition:
                for step in template.workflow_definition["steps"]:
                    bottleneck_steps.append({
                        "step_id": step.get("id", "unknown"),
                        "step_name": step.get("name", "Unknown Step"),
                        "avg_duration": avg_execution_time / len(template.workflow_definition["steps"]),
                        "failure_rate": 0.1  # Placeholder
                    })
            
            # Calculate optimization score (0-100)
            optimization_score = min(100, success_rate * 100 * (1 - min(avg_execution_time / 3600, 1)))
            
            # Get recommendations count if requested
            recommendations_count = 0
            if include_recommendations:
                recommendations = optimization_service.list_recommendations(
                    tenant_id=tenant_id,
                    workflow_template_id=template.id
                )
                recommendations_count = len(recommendations)
            
            performance_metrics.append(WorkflowPerformanceMetrics(
                template_id=template.id,
                template_name=template.name,
                total_instances=total_instances,
                success_rate=success_rate,
                avg_execution_time=avg_execution_time,
                bottleneck_steps=bottleneck_steps,
                optimization_score=optimization_score,
                recommendations_count=recommendations_count
            ))
        
        return performance_metrics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate performance dashboard: {str(e)}")


@router.post("/smart-scheduling", response_model=SmartSchedulingResponse)
async def smart_workflow_scheduling(
    scheduling_request: SmartSchedulingRequest,
    background_tasks: BackgroundTasks,
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """
    Intelligent workflow scheduling with resource optimization and dependency management
    """
    try:
        # Get workflow template
        template = db.query(WorkflowTemplate).filter(
            WorkflowTemplate.id == scheduling_request.workflow_template_id,
            WorkflowTemplate.tenant_id == tenant_id
        ).first()
        
        if not template:
            raise HTTPException(status_code=404, detail="Workflow template not found")
        
        # Analyze current system load and resource availability
        current_time = datetime.utcnow()
        
        # Calculate optimal start time based on various factors
        preferred_start = scheduling_request.preferred_start_time or current_time
        
        # Factor in system load (simplified)
        active_instances = db.query(WorkflowInstance).filter(
            WorkflowInstance.tenant_id == tenant_id,
            WorkflowInstance.status.in_(["active", "running"])
        ).count()
        
        # Adjust start time based on load
        load_factor = min(active_instances / 10, 1.0)  # Normalize to 0-1
        delay_minutes = load_factor * 30  # Up to 30 minutes delay for high load
        
        recommended_start_time = preferred_start + timedelta(minutes=delay_minutes)
        
        # Estimate completion time
        estimated_duration = template.estimated_duration or 60  # Default 60 minutes
        estimated_completion_time = recommended_start_time + timedelta(minutes=estimated_duration)
        
        # Check deadline constraints
        if scheduling_request.deadline and estimated_completion_time > scheduling_request.deadline:
            # Try to optimize by reducing estimated duration
            available_time = (scheduling_request.deadline - recommended_start_time).total_seconds() / 60
            if available_time > 0:
                estimated_completion_time = scheduling_request.deadline
            else:
                raise HTTPException(
                    status_code=400, 
                    detail="Cannot schedule workflow to meet deadline constraints"
                )
        
        # Create workflow instance with optimized scheduling
        instance_data = {
            "name": f"Smart Scheduled: {template.name} - {recommended_start_time.strftime('%Y-%m-%d %H:%M')}",
            "description": f"Intelligently scheduled workflow with optimization",
            "input_data": {
                "smart_scheduling": True,
                "scheduling_factors": {
                    "system_load": load_factor,
                    "resource_requirements": scheduling_request.resource_requirements,
                    "dependencies": scheduling_request.dependencies
                }
            },
            "priority": scheduling_request.priority
        }
        
        # Initialize services for workflow creation
        task_prio_service = get_task_prioritization_service(db)
        optimization_service = get_process_optimization_service(db)
        
        # Create a simplified reporting service for workflow automation service
        from ..services.analytics_service import AnalyticsService
        analytics_service = AnalyticsService(db=db)
        from ..services.dashboard_service_custom import CustomDashboardService
        custom_dashboard_service = CustomDashboardService(db=db, analytics_service=analytics_service)
        from ..services.reporting_service_part1 import ReportingService
        reporting_service = ReportingService(db=db, custom_dashboard_service=custom_dashboard_service)
        
        workflow_service = WorkflowAutomationService(db, task_prio_service, reporting_service)
        
        instance = workflow_service.create_workflow_instance(
            tenant_id=tenant_id,
            template_id=template.id,
            instance_data=instance_data,
            triggered_by="smart_scheduler"
        )
        
        # Schedule execution for the recommended start time
        if recommended_start_time <= current_time + timedelta(minutes=5):
            # Execute immediately if start time is within 5 minutes
            background_tasks.add_task(workflow_service.execute_workflow_instance, instance.id)
        
        # Calculate confidence score based on various factors
        confidence_factors = []
        confidence_score = 0.8  # Base confidence
        
        if template.success_rate > 0.9:
            confidence_score += 0.1
            confidence_factors.append("high_template_success_rate")
        
        if load_factor < 0.5:
            confidence_score += 0.05
            confidence_factors.append("low_system_load")
        
        if scheduling_request.deadline:
            time_buffer = (scheduling_request.deadline - estimated_completion_time).total_seconds() / 60
            if time_buffer > 60:  # More than 1 hour buffer
                confidence_score += 0.05
                confidence_factors.append("adequate_time_buffer")
        
        confidence_score = min(confidence_score, 1.0)
        
        return SmartSchedulingResponse(
            scheduled_instance_id=instance.id,
            recommended_start_time=recommended_start_time,
            estimated_completion_time=estimated_completion_time,
            resource_allocation={
                "cpu_priority": "normal" if load_factor < 0.7 else "low",
                "memory_allocation": "standard",
                "concurrent_limit": max(1, 5 - int(load_factor * 5))
            },
            confidence_score=confidence_score,
            scheduling_factors=confidence_factors
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Smart scheduling failed: {str(e)}")


@router.post("/intelligent-task-prioritization", response_model=IntelligentTaskPrioritizationResponse)
async def intelligent_task_prioritization(
    prioritization_request: IntelligentTaskPrioritizationRequest,
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """
    AI-powered task prioritization within workflow instances
    """
    try:
        # Get workflow instance
        instance = db.query(WorkflowInstance).filter(
            WorkflowInstance.id == prioritization_request.workflow_instance_id,
            WorkflowInstance.tenant_id == tenant_id
        ).first()
        
        if not instance:
            raise HTTPException(status_code=404, detail="Workflow instance not found")
        
        # Get all tasks related to this workflow instance
        # Note: This would need to be implemented in task_crud
        tasks = []  # Placeholder - would get tasks by workflow instance
        
        if not tasks:
            return IntelligentTaskPrioritizationResponse(
                prioritized_tasks=[],
                priority_reasoning={},
                estimated_completion_order=[],
                resource_optimization_suggestions=[]
            )
        
        # Initialize task prioritization service
        task_prio_service = get_task_prioritization_service(db)
        
        # Analyze and prioritize tasks
        prioritized_tasks = []
        priority_reasoning = {}
        
        for task in tasks:
            # Calculate intelligent priority score
            priority_factors = []
            base_score = task.priority_score or 0.5
            
            # Factor in workflow context
            if prioritization_request.context_factors:
                if prioritization_request.context_factors.get("urgent_deadline"):
                    base_score += 0.2
                    priority_factors.append("urgent_deadline")
                
                if prioritization_request.context_factors.get("high_business_impact"):
                    base_score += 0.15
                    priority_factors.append("high_business_impact")
                
                if prioritization_request.context_factors.get("blocking_other_tasks"):
                    base_score += 0.25
                    priority_factors.append("blocking_dependency")
            
            # Factor in business rules
            if prioritization_request.business_rules:
                customer_priority = prioritization_request.business_rules.get("customer_priority")
                if customer_priority == "enterprise":
                    base_score += 0.1
                    priority_factors.append("enterprise_customer")
                elif customer_priority == "premium":
                    base_score += 0.05
                    priority_factors.append("premium_customer")
            
            # Factor in estimated effort vs deadline
            if task.deadline and task.estimated_effort_hours:
                time_to_deadline = (task.deadline - datetime.utcnow()).total_seconds() / 3600
                effort_ratio = task.estimated_effort_hours / max(time_to_deadline, 1)
                if effort_ratio > 0.8:  # Tight deadline
                    base_score += 0.15
                    priority_factors.append("tight_deadline")
            
            # Normalize score
            final_score = min(base_score, 1.0)
            
            prioritized_tasks.append({
                "task_id": task.id,
                "description": task.description,
                "original_priority": task.priority_score,
                "intelligent_priority": final_score,
                "estimated_effort_hours": task.estimated_effort_hours,
                "deadline": task.deadline.isoformat() if task.deadline else None,
                "priority_factors": priority_factors
            })
            
            priority_reasoning[str(task.id)] = f"Priority adjusted based on: {', '.join(priority_factors)}"
        
        # Sort by intelligent priority
        prioritized_tasks.sort(key=lambda x: x["intelligent_priority"], reverse=True)
        
        # Generate completion order
        estimated_completion_order = [task["task_id"] for task in prioritized_tasks]
        
        # Generate resource optimization suggestions
        resource_suggestions = []
        
        high_priority_tasks = [t for t in prioritized_tasks if t["intelligent_priority"] > 0.8]
        if len(high_priority_tasks) > 3:
            resource_suggestions.append("Consider parallel execution for high-priority tasks")
        
        total_effort = sum(t.get("estimated_effort_hours", 1) for t in prioritized_tasks if t.get("estimated_effort_hours"))
        if total_effort > 40:  # More than 1 work week
            resource_suggestions.append("Consider additional resource allocation")
        
        tight_deadline_tasks = [t for t in prioritized_tasks if "tight_deadline" in t.get("priority_factors", [])]
        if tight_deadline_tasks:
            resource_suggestions.append("Focus immediate attention on tight deadline tasks")
        
        return IntelligentTaskPrioritizationResponse(
            prioritized_tasks=prioritized_tasks,
            priority_reasoning=priority_reasoning,
            estimated_completion_order=estimated_completion_order,
            resource_optimization_suggestions=resource_suggestions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Intelligent task prioritization failed: {str(e)}")


@router.get("/optimization-suggestions/{template_id}", response_model=List[WorkflowOptimizationSuggestion])
async def get_workflow_optimization_suggestions(
    template_id: int = Path(..., description="Workflow template ID"),
    tenant_id: int = Query(..., description="Tenant ID"),
    analysis_depth: str = Query("standard", regex="^(basic|standard|deep)$"),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered optimization suggestions for a specific workflow template
    """
    try:
        # Get workflow template
        template = db.query(WorkflowTemplate).filter(
            WorkflowTemplate.id == template_id,
            WorkflowTemplate.tenant_id == tenant_id
        ).first()
        
        if not template:
            raise HTTPException(status_code=404, detail="Workflow template not found")
        
        # Initialize optimization service
        optimization_service = get_process_optimization_service(db)
        
        # Get existing recommendations
        recommendations = optimization_service.list_recommendations(
            tenant_id=tenant_id,
            workflow_template_id=template_id
        )
        
        suggestions = []
        
        # Convert recommendations to optimization suggestions
        for rec in recommendations:
            impact_score = rec.potential_impact_score or 0.5
            
            # Determine implementation effort based on recommendation type
            effort_mapping = {
                "bottleneck_detected": "medium",
                "high_error_rate_step": "low",
                "new_automation_candidate": "high",
                "underutilized_feature": "low"
            }
            
            effort = effort_mapping.get(rec.recommendation_type, "medium")
            
            # Extract affected components
            affected_components = []
            if rec.affected_step_id:
                affected_components.append(f"Step: {rec.affected_step_id}")
            if rec.affected_workflow_template_id:
                affected_components.append(f"Template: {rec.affected_workflow_template_id}")
            
            suggestions.append(WorkflowOptimizationSuggestion(
                suggestion_type=rec.recommendation_type,
                description=rec.description,
                impact_score=impact_score,
                implementation_effort=effort,
                affected_components=affected_components
            ))
        
        # Add additional AI-generated suggestions based on analysis depth
        if analysis_depth in ["standard", "deep"]:
            # Analyze workflow definition for optimization opportunities
            if template.workflow_definition and "steps" in template.workflow_definition:
                steps = template.workflow_definition["steps"]
                
                # Suggest parallelization opportunities
                sequential_steps = [s for s in steps if s.get("type") != "parallel"]
                if len(sequential_steps) > 3:
                    step_names = [s.get('id', 'unknown') for s in sequential_steps[:3]]
                    suggestions.append(WorkflowOptimizationSuggestion(
                        suggestion_type="parallelization_opportunity",
                        description=f"Consider parallelizing {len(sequential_steps)} sequential steps to reduce execution time",
                        impact_score=0.7,
                        implementation_effort="medium",
                        affected_components=[f"Steps: {', '.join(step_names)}"]
                    ))
                
                # Suggest automation for manual steps
                manual_steps = [s for s in steps if s.get("type") == "human_task"]
                if manual_steps:
                    suggestions.append(WorkflowOptimizationSuggestion(
                        suggestion_type="automation_opportunity",
                        description=f"Consider automating {len(manual_steps)} manual steps to improve efficiency",
                        impact_score=0.8,
                        implementation_effort="high",
                        affected_components=[f"Manual steps: {len(manual_steps)}"]
                    ))
        
        if analysis_depth == "deep":
            # Deep analysis suggestions
            instances = db.query(WorkflowInstance).filter(
                WorkflowInstance.template_id == template_id,
                WorkflowInstance.tenant_id == tenant_id
            ).limit(50).all()
            
            if instances:
                # Analyze execution patterns
                execution_times = [i.execution_duration for i in instances if i.execution_duration]
                if execution_times:
                    avg_time = sum(execution_times) / len(execution_times)
                    if avg_time > 3600:  # More than 1 hour
                        suggestions.append(WorkflowOptimizationSuggestion(
                            suggestion_type="performance_optimization",
                            description=f"Average execution time of {avg_time/60:.1f} minutes suggests need for performance optimization",
                            impact_score=0.6,
                            implementation_effort="medium",
                            affected_components=["Overall workflow performance"]
                        ))
        
        return suggestions
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate optimization suggestions: {str(e)}")


@router.post("/calendar/smart-scheduling")
async def smart_calendar_scheduling(
    workflow_instance_id: int = Query(..., description="Workflow instance ID"),
    tenant_id: int = Query(..., description="Tenant ID"),
    calendar_service: CalendarService = Depends(get_calendar_service),
    db: Session = Depends(get_db)
):
    """
    Generate smart calendar events for workflow tasks with intelligent scheduling
    """
    try:
        # Get workflow instance
        instance = db.query(WorkflowInstance).filter(
            WorkflowInstance.id == workflow_instance_id,
            WorkflowInstance.tenant_id == tenant_id
        ).first()
        
        if not instance:
            raise HTTPException(status_code=404, detail="Workflow instance not found")
        
        # Get tasks related to this workflow
        # Note: This would need to be implemented in task_crud
        tasks = []  # Placeholder - would get tasks by workflow instance
        
        calendar_events = []
        
        for task in tasks:
            try:
                ics_content = calendar_service.generate_ics_for_task(task)
                calendar_events.append({
                    "task_id": task.id,
                    "task_description": task.description,
                    "ics_content": ics_content,
                    "priority": task.priority_score,
                    "estimated_duration": task.estimated_effort_hours
                })
            except Exception as e:
                # Log error but continue with other tasks
                continue
        
        return {
            "workflow_instance_id": workflow_instance_id,
            "calendar_events_generated": len(calendar_events),
            "events": calendar_events,
            "scheduling_summary": {
                "total_tasks": len(tasks),
                "events_created": len(calendar_events),
                "total_estimated_hours": sum(t.estimated_effort_hours or 0 for t in tasks)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Smart calendar scheduling failed: {str(e)}")


# Health check endpoint
@router.get("/health")
async def advanced_workflow_automation_health():
    """
    Health check for advanced workflow automation features
    """
    return {
        "status": "healthy",
        "service": "advanced-workflow-automation",
        "timestamp": datetime.utcnow().isoformat(),
        "features": [
            "smart_scheduling",
            "intelligent_task_prioritization", 
            "performance_analytics",
            "optimization_suggestions",
            "calendar_integration"
        ]
    }