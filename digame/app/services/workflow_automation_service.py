"""
Workflow Automation service for business process automation and workflow management
"""

from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
import uuid
import json
import asyncio
from decimal import Decimal

from ..models.workflow_automation import (
    WorkflowTemplate, WorkflowInstance, WorkflowStepExecution,
    AutomationRule, WorkflowAction, WorkflowIntegration
)
from ..models.user import User
from ..models.tenant import Tenant


class WorkflowAutomationService:
    """Service for workflow automation and business process management"""

    def __init__(self, db: Session):
        self.db = db
        self.step_executors = {
            "action": self._execute_action_step,
            "condition": self._execute_condition_step,
            "loop": self._execute_loop_step,
            "parallel": self._execute_parallel_step,
            "human_task": self._execute_human_task_step
        }

    # Workflow Template Management
    def create_workflow_template(
        self,
        tenant_id: int,
        template_data: Dict[str, Any],
        created_by_user_id: int
    ) -> WorkflowTemplate:
        """Create a new workflow template"""
        
        template = WorkflowTemplate(
            tenant_id=tenant_id,
            template_name=template_data["template_name"],
            display_name=template_data["display_name"],
            description=template_data.get("description"),
            category=template_data["category"],
            version=template_data.get("version", "1.0.0"),
            is_active=template_data.get("is_active", True),
            is_public=template_data.get("is_public", False),
            complexity_level=template_data.get("complexity_level", "medium"),
            workflow_definition=template_data.get("workflow_definition", {}),
            input_schema=template_data.get("input_schema", {}),
            output_schema=template_data.get("output_schema", {}),
            variables=template_data.get("variables", {}),
            steps=template_data.get("steps", []),
            conditions=template_data.get("conditions", {}),
            triggers=template_data.get("triggers", []),
            timeout_minutes=template_data.get("timeout_minutes", 60),
            retry_attempts=template_data.get("retry_attempts", 3),
            retry_delay_seconds=template_data.get("retry_delay_seconds", 30),
            parallel_execution=template_data.get("parallel_execution", False),
            estimated_duration_minutes=template_data.get("estimated_duration_minutes"),
            tags=template_data.get("tags", []),
            industry_tags=template_data.get("industry_tags", []),
            use_cases=template_data.get("use_cases", []),
            created_by_user_id=created_by_user_id
        )
        
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        
        return template

    def get_workflow_templates(
        self,
        tenant_id: int,
        category: Optional[str] = None,
        complexity_level: Optional[str] = None,
        active_only: bool = True,
        include_public: bool = True
    ) -> List[WorkflowTemplate]:
        """Get workflow templates for tenant"""
        
        query = self.db.query(WorkflowTemplate)
        
        # Filter by tenant or public templates
        if include_public:
            query = query.filter(
                or_(
                    WorkflowTemplate.tenant_id == tenant_id,
                    WorkflowTemplate.is_public == True
                )
            )
        else:
            query = query.filter(WorkflowTemplate.tenant_id == tenant_id)
        
        if active_only:
            query = query.filter(WorkflowTemplate.is_active == True)
        
        if category:
            query = query.filter(WorkflowTemplate.category == category)
        
        if complexity_level:
            query = query.filter(WorkflowTemplate.complexity_level == complexity_level)
        
        return query.order_by(desc(WorkflowTemplate.usage_count)).all()

    def validate_workflow_template(self, template_id: int) -> Dict[str, Any]:
        """Validate a workflow template"""
        
        template = self.db.query(WorkflowTemplate).filter(
            WorkflowTemplate.id == template_id
        ).first()
        
        if not template:
            raise ValueError("Template not found")
        
        validation_results = {
            "template_id": template_id,
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "suggestions": []
        }
        
        # Validate steps
        if not template.steps:
            validation_results["errors"].append("Template must have at least one step")
            validation_results["is_valid"] = False
        
        # Validate input/output schemas
        if not template.input_schema:
            validation_results["warnings"].append("No input schema defined")
        
        if not template.output_schema:
            validation_results["warnings"].append("No output schema defined")
        
        # Validate step references
        for i, step in enumerate(template.steps):
            if not step.get("name"):
                validation_results["errors"].append(f"Step {i+1} missing name")
                validation_results["is_valid"] = False
            
            if not step.get("type"):
                validation_results["errors"].append(f"Step {i+1} missing type")
                validation_results["is_valid"] = False
        
        # Check for circular dependencies
        if self._has_circular_dependencies(template.steps, template.conditions):
            validation_results["errors"].append("Circular dependencies detected in workflow")
            validation_results["is_valid"] = False
        
        # Performance suggestions
        if template.step_count > 20:
            validation_results["suggestions"].append("Consider breaking down complex workflow into smaller templates")
        
        if template.timeout_minutes > 240:
            validation_results["suggestions"].append("Long timeout may impact system performance")
        
        return validation_results

    def _has_circular_dependencies(self, steps: List[Dict], conditions: Dict) -> bool:
        """Check for circular dependencies in workflow"""
        # Simplified circular dependency check
        # In a real implementation, this would be more sophisticated
        visited = set()
        rec_stack = set()
        
        def has_cycle(step_name: str) -> bool:
            if step_name in rec_stack:
                return True
            if step_name in visited:
                return False
            
            visited.add(step_name)
            rec_stack.add(step_name)
            
            # Check dependencies (simplified)
            step_conditions = conditions.get(step_name, {})
            for next_step in step_conditions.get("next_steps", []):
                if has_cycle(next_step):
                    return True
            
            rec_stack.remove(step_name)
            return False
        
        for step in steps:
            step_name = step.get("name")
            if step_name and step_name not in visited:
                if has_cycle(step_name):
                    return True
        
        return False

    # Workflow Instance Management
    def create_workflow_instance(
        self,
        tenant_id: int,
        template_id: int,
        instance_data: Dict[str, Any],
        triggered_by_user_id: Optional[int] = None,
        triggered_by_automation_id: Optional[int] = None
    ) -> WorkflowInstance:
        """Create a new workflow instance"""
        
        template = self.db.query(WorkflowTemplate).filter(
            WorkflowTemplate.id == template_id
        ).first()
        
        if not template:
            raise ValueError("Template not found")
        
        instance = WorkflowInstance(
            tenant_id=tenant_id,
            template_id=template_id,
            instance_name=instance_data.get("instance_name"),
            description=instance_data.get("description"),
            priority=instance_data.get("priority", "medium"),
            execution_mode=instance_data.get("execution_mode", "automatic"),
            input_data=instance_data.get("input_data", {}),
            context_data=instance_data.get("context_data", {}),
            scheduled_at=instance_data.get("scheduled_at"),
            total_steps=len(template.steps),
            triggered_by_user_id=triggered_by_user_id,
            triggered_by_automation_id=triggered_by_automation_id,
            parent_instance_id=instance_data.get("parent_instance_id")
        )
        
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        
        # Update template usage stats
        template.update_usage_stats(True)  # Assume success for creation
        self.db.commit()
        
        return instance

    def execute_workflow_instance(self, instance_id: int) -> Dict[str, Any]:
        """Execute a workflow instance"""
        
        instance = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.id == instance_id
        ).first()
        
        if not instance:
            raise ValueError("Instance not found")
        
        if instance.status != "pending":
            raise ValueError(f"Instance is not in pending status: {instance.status}")
        
        # Start execution
        instance.status = "running"
        instance.started_at = datetime.utcnow()
        self.db.commit()
        
        try:
            # Execute workflow steps
            execution_result = self._execute_workflow_steps(instance)
            
            # Mark as completed
            instance.mark_completed(
                success=execution_result["success"],
                output_data=execution_result.get("output_data"),
                error_message=execution_result.get("error_message")
            )
            
            # Update template success rate
            instance.template.update_usage_stats(execution_result["success"])
            
            self.db.commit()
            
            return {
                "instance_id": instance_id,
                "success": execution_result["success"],
                "output_data": execution_result.get("output_data"),
                "execution_time": instance.execution_time,
                "steps_completed": instance.current_step
            }
            
        except Exception as e:
            # Mark as failed
            instance.mark_completed(
                success=False,
                error_message=str(e)
            )
            instance.template.update_usage_stats(False)
            self.db.commit()
            
            return {
                "instance_id": instance_id,
                "success": False,
                "error_message": str(e),
                "execution_time": instance.execution_time,
                "steps_completed": instance.current_step
            }

    def _execute_workflow_steps(self, instance: WorkflowInstance) -> Dict[str, Any]:
        """Execute all steps in a workflow instance"""
        
        template = instance.template
        context = instance.input_data.copy()
        context.update(instance.context_data)
        
        for i, step_config in enumerate(template.steps):
            try:
                # Update progress
                instance.update_progress(i + 1, len(template.steps), f"Executing step: {step_config.get('name')}")
                self.db.commit()
                
                # Execute step
                step_result = self._execute_workflow_step(instance, step_config, context)
                
                if not step_result["success"]:
                    return {
                        "success": False,
                        "error_message": step_result.get("error_message", "Step execution failed"),
                        "failed_step": step_config.get("name")
                    }
                
                # Update context with step output
                context.update(step_result.get("output_data", {}))
                
            except Exception as e:
                return {
                    "success": False,
                    "error_message": f"Error executing step {step_config.get('name')}: {str(e)}",
                    "failed_step": step_config.get("name")
                }
        
        return {
            "success": True,
            "output_data": context
        }

    def _execute_workflow_step(
        self,
        instance: WorkflowInstance,
        step_config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a single workflow step"""
        
        # Create step execution record
        step_execution = WorkflowStepExecution(
            workflow_instance_id=instance.id,
            step_name=step_config["name"],
            step_type=step_config["type"],
            step_order=step_config.get("order", 0),
            input_data=context,
            step_config=step_config,
            started_at=datetime.utcnow()
        )
        
        self.db.add(step_execution)
        self.db.commit()
        
        try:
            # Execute step based on type
            step_type = step_config["type"]
            executor = self.step_executors.get(step_type)
            
            if not executor:
                raise ValueError(f"Unknown step type: {step_type}")
            
            result = executor(step_config, context)
            
            # Mark step as completed
            step_execution.mark_completed(
                success=result["success"],
                output_data=result.get("output_data"),
                error_message=result.get("error_message")
            )
            
            self.db.commit()
            
            return result
            
        except Exception as e:
            # Mark step as failed
            step_execution.mark_completed(
                success=False,
                error_message=str(e)
            )
            self.db.commit()
            
            return {
                "success": False,
                "error_message": str(e)
            }

    def _execute_action_step(self, step_config: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an action step"""
        
        action_name = step_config.get("action")
        action_config = step_config.get("config", {})
        
        # Get action definition
        action = self.db.query(WorkflowAction).filter(
            WorkflowAction.action_name == action_name,
            WorkflowAction.is_active == True
        ).first()
        
        if not action:
            return {
                "success": False,
                "error_message": f"Action not found: {action_name}"
            }
        
        # Execute action based on implementation type
        if action.implementation_type == "internal":
            return self._execute_internal_action(action, action_config, context)
        elif action.implementation_type == "webhook":
            return self._execute_webhook_action(action, action_config, context)
        elif action.implementation_type == "api":
            return self._execute_api_action(action, action_config, context)
        else:
            return {
                "success": False,
                "error_message": f"Unsupported action implementation: {action.implementation_type}"
            }

    def _execute_internal_action(
        self,
        action: WorkflowAction,
        config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute an internal action"""
        
        # Mock internal action execution
        action_type = action.action_type
        
        if action_type == "email":
            return {
                "success": True,
                "output_data": {
                    "email_sent": True,
                    "recipient": config.get("recipient", "user@example.com"),
                    "subject": config.get("subject", "Workflow Notification")
                }
            }
        elif action_type == "database":
            return {
                "success": True,
                "output_data": {
                    "records_affected": 1,
                    "operation": config.get("operation", "insert")
                }
            }
        elif action_type == "file_operation":
            return {
                "success": True,
                "output_data": {
                    "file_processed": True,
                    "file_path": config.get("file_path", "/tmp/workflow_file.txt")
                }
            }
        else:
            return {
                "success": False,
                "error_message": f"Unknown internal action type: {action_type}"
            }

    def _execute_webhook_action(
        self,
        action: WorkflowAction,
        config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a webhook action"""
        
        # Mock webhook execution
        webhook_url = action.implementation_config.get("webhook_url")
        
        if not webhook_url:
            return {
                "success": False,
                "error_message": "Webhook URL not configured"
            }
        
        # In a real implementation, this would make an HTTP request
        return {
            "success": True,
            "output_data": {
                "webhook_called": True,
                "url": webhook_url,
                "response_status": 200
            }
        }

    def _execute_api_action(
        self,
        action: WorkflowAction,
        config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute an API action"""
        
        # Mock API execution
        api_endpoint = action.implementation_config.get("api_endpoint")
        
        if not api_endpoint:
            return {
                "success": False,
                "error_message": "API endpoint not configured"
            }
        
        # In a real implementation, this would make an API call
        return {
            "success": True,
            "output_data": {
                "api_called": True,
                "endpoint": api_endpoint,
                "response_data": {"result": "success"}
            }
        }

    def _execute_condition_step(self, step_config: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a condition step"""
        
        condition = step_config.get("condition")
        
        if not condition:
            return {
                "success": False,
                "error_message": "No condition specified"
            }
        
        # Evaluate condition (simplified)
        try:
            result = self._evaluate_condition(condition, context)
            
            return {
                "success": True,
                "output_data": {
                    "condition_result": result,
                    "condition": condition
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error_message": f"Condition evaluation failed: {str(e)}"
            }

    def _evaluate_condition(self, condition: Dict[str, Any], context: Dict[str, Any]) -> bool:
        """Evaluate a condition against context"""
        
        # Simplified condition evaluation
        field = condition.get("field")
        operator = condition.get("operator")
        value = condition.get("value")
        
        if not all([field, operator, value]):
            return False
        
        context_value = context.get(field)
        
        if operator == "equals":
            return context_value == value
        elif operator == "not_equals":
            return context_value != value
        elif operator == "greater_than":
            return context_value > value
        elif operator == "less_than":
            return context_value < value
        elif operator == "contains":
            return value in str(context_value)
        else:
            return False

    def _execute_loop_step(self, step_config: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a loop step"""
        
        loop_config = step_config.get("loop", {})
        iterations = loop_config.get("iterations", 1)
        loop_variable = loop_config.get("variable", "loop_index")
        
        results = []
        
        for i in range(iterations):
            loop_context = context.copy()
            loop_context[loop_variable] = i
            
            # Execute loop body (simplified)
            results.append({
                "iteration": i,
                "context": loop_context
            })
        
        return {
            "success": True,
            "output_data": {
                "loop_results": results,
                "iterations_completed": iterations
            }
        }

    def _execute_parallel_step(self, step_config: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a parallel step"""
        
        parallel_steps = step_config.get("parallel_steps", [])
        
        if not parallel_steps:
            return {
                "success": False,
                "error_message": "No parallel steps specified"
            }
        
        # Mock parallel execution
        results = []
        
        for step in parallel_steps:
            # In a real implementation, these would run in parallel
            step_result = {
                "step_name": step.get("name"),
                "success": True,
                "output": {"parallel_execution": True}
            }
            results.append(step_result)
        
        return {
            "success": True,
            "output_data": {
                "parallel_results": results,
                "steps_executed": len(parallel_steps)
            }
        }

    def _execute_human_task_step(self, step_config: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a human task step"""
        
        task_config = step_config.get("human_task", {})
        assigned_user_id = task_config.get("assigned_user_id")
        
        if not assigned_user_id:
            return {
                "success": False,
                "error_message": "No user assigned to human task"
            }
        
        # Create human task (simplified)
        return {
            "success": True,
            "output_data": {
                "human_task_created": True,
                "assigned_user_id": assigned_user_id,
                "task_description": task_config.get("description", "Human task"),
                "status": "pending_human_input"
            }
        }

    # Workflow Instance Queries
    def get_workflow_instances(
        self,
        tenant_id: int,
        template_id: Optional[int] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        limit: int = 50
    ) -> List[WorkflowInstance]:
        """Get workflow instances for tenant"""
        
        query = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.tenant_id == tenant_id
        )
        
        if template_id:
            query = query.filter(WorkflowInstance.template_id == template_id)
        
        if status:
            query = query.filter(WorkflowInstance.status == status)
        
        if priority:
            query = query.filter(WorkflowInstance.priority == priority)
        
        return query.order_by(desc(WorkflowInstance.created_at)).limit(limit).all()

    def get_workflow_instance_details(self, instance_id: int) -> Dict[str, Any]:
        """Get detailed information about a workflow instance"""
        
        instance = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.id == instance_id
        ).first()
        
        if not instance:
            raise ValueError("Instance not found")
        
        # Get step executions
        step_executions = self.db.query(WorkflowStepExecution).filter(
            WorkflowStepExecution.workflow_instance_id == instance_id
        ).order_by(WorkflowStepExecution.step_order).all()
        
        return {
            "instance": {
                "id": instance.id,
                "instance_uuid": instance.instance_uuid,
                "instance_name": instance.instance_name,
                "status": instance.status,
                "priority": instance.priority,
                "execution_mode": instance.execution_mode,
                "progress_percentage": instance.progress_percentage,
                "current_step": instance.current_step,
                "total_steps": instance.total_steps,
                "started_at": instance.started_at.isoformat() if instance.started_at else None,
                "completed_at": instance.completed_at.isoformat() if instance.completed_at else None,
                "duration_seconds": instance.duration_seconds,
                "execution_time": instance.execution_time,
                "input_data": instance.input_data,
                "output_data": instance.output_data,
                "error_message": instance.error_message,
                "execution_log": instance.execution_log
            },
            "template": {
                "id": instance.template.id,
                "template_name": instance.template.template_name,
                "display_name": instance.template.display_name,
                "category": instance.template.category,
                "version": instance.template.version
            },
            "step_executions": [
                {
                    "id": step.id,
                    "step_name": step.step_name,
                    "step_type": step.step_type,
                    "step_order": step.step_order,
                    "status": step.status,
                    "started_at": step.started_at.isoformat() if step.started_at else None,
                    "completed_at": step.completed_at.isoformat() if step.completed_at else None,
                    "duration_seconds": step.duration_seconds,
                    "execution_time": step.execution_time,
                    "input_data": step.input_data,
                    "output_data": step.output_data,
                    "error_message": step.error_message
                }
                for step in step_executions
            ]
        }

    # Dashboard and Analytics
    def get_workflow_dashboard(self, tenant_id: int) -> Dict[str, Any]:
        """Get workflow automation dashboard data"""
        
        # Template statistics
        total_templates = self.db.query(WorkflowTemplate).filter(
            WorkflowTemplate.tenant_id == tenant_id
        ).count()
        
        active_templates = self.db.query(WorkflowTemplate).filter(
            and_(
                WorkflowTemplate.tenant_id == tenant_id,
                WorkflowTemplate.is_active == True
            )
        ).count()
        
        # Instance statistics
        total_instances = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.tenant_id == tenant_id
        ).count()
        
        running_instances = self.db.query(WorkflowInstance).filter(
            and_(
                WorkflowInstance.tenant_id == tenant_id,
                WorkflowInstance.status.in_(["pending", "running", "paused"])
            )
        ).count()
        
        completed_instances = self.db.query(WorkflowInstance).filter(
            and_(
                WorkflowInstance.tenant_id == tenant_id,
                WorkflowInstance.status == "completed"
            )
        ).count()
        
        failed_instances = self.db.query(WorkflowInstance).filter(
            and_(
                WorkflowInstance.tenant_id == tenant_id,
                WorkflowInstance.status == "failed"
            )
        ).count()
        
        # Recent activity
        recent_instances = self.db.query(WorkflowInstance).filter(
            and_(
                WorkflowInstance.tenant_id == tenant_id,
                WorkflowInstance.created_at >= datetime.utcnow() - timedelta(days=7)
            )
        ).count()
        
        return {
            "templates": {
                "total": total_templates,
                "active": active_templates,
                "inactive": total_templates - active_templates
            },
            "instances": {
                "total": total_instances,
                "running": running_instances,
                "completed": completed_instances,
                "failed": failed_instances,
                "success_rate": (completed_instances / total_instances * 100) if total_instances > 0 else 0
            },
            "activity": {
                "recent_executions": recent_instances,
                "daily_average": recent_instances / 7 if recent_instances > 0 else 0
            },
            "performance": {
                "average_execution_time": self._calculate_average_execution_time(tenant_id),
                "most_used_templates": self._get_most_used_templates(tenant_id),
                "failure_analysis": self._get_failure_analysis(tenant_id)
            }
        }

    def _calculate_average_execution_time(self, tenant_id: int) -> float:
        """Calculate average execution time for completed workflows"""
        
        result = self.db.query(func.avg(WorkflowInstance.duration_seconds)).filter(
            and_(
                WorkflowInstance.tenant_id == tenant_id,
                WorkflowInstance.status == "completed",
                WorkflowInstance.duration_seconds.isnot(None)
            )
        ).scalar()
        
        return float(result) if result else 0.0

    def _get_most_used_templates(self, tenant_id: int) -> List[Dict[str, Any]]:
        """Get most frequently used workflow templates"""
        
        templates = self.db.query(WorkflowTemplate).filter(
            WorkflowTemplate.tenant_id == tenant_id
        ).order_by(desc(WorkflowTemplate.usage_count)).limit(5).all()
        
        return [
            {
                "template_id": template.id,
                "template_name": template.template_name,
                "usage_count": template.usage_count,
                "success_rate": template.success_rate
            }
            for template in templates
        ]

    def _get_failure_analysis(self, tenant_id: int) -> Dict[str, Any]:
        """Analyze workflow failures"""
        
        failed_instances = self.db.query(WorkflowInstance).filter(
            and_(
                WorkflowInstance.tenant_id == tenant_id,
                WorkflowInstance.status == "failed"
            )
        ).limit(10).all()
        
        failure_reasons = {}
        for instance in failed_instances:
            error = instance.error_message or "Unknown error"
            failure_reasons[error] = failure_reasons.get(error, 0) + 1
        
        return {
            "total_failures": len(failed_instances),
            "common_errors": failure_reasons,
            "failure_rate": len(failed_instances) / max(1, self.db.query(WorkflowInstance).filter(
                WorkflowInstance.tenant_id == tenant_id
            ).count()) * 100
        }


def get_workflow_automation_service(db: Session) -> WorkflowAutomationService:
    """Get workflow automation service instance"""
    return WorkflowAutomationService(db)