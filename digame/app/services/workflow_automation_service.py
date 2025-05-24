"""
Workflow Automation service layer for business process automation and workflow management
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import json
import uuid
import asyncio
from enum import Enum

from ..models.workflow_automation import (
    WorkflowTemplate, WorkflowInstance, WorkflowStepExecution,
    AutomationRule, WorkflowAction, WorkflowIntegration,
    WorkflowStatus, WorkflowStepType, WorkflowStepStatus, AutomationTriggerType
)
from ..database import get_db


class WorkflowAutomationService:
    """
    Core workflow automation service for managing business process automation
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_workflow_template(
        self,
        tenant_id: int,
        created_by: int,
        template_data: Dict[str, Any]
    ) -> WorkflowTemplate:
        """
        Create a new workflow template
        """
        # Validate workflow definition
        self._validate_workflow_definition(template_data["workflow_definition"])
        
        template = WorkflowTemplate(
            tenant_id=tenant_id,
            created_by=created_by,
            name=template_data["name"],
            description=template_data.get("description"),
            category=template_data["category"],
            version=template_data.get("version", "1.0"),
            workflow_definition=template_data["workflow_definition"],
            input_schema=template_data.get("input_schema", {}),
            output_schema=template_data.get("output_schema", {}),
            complexity_level=self._calculate_complexity(template_data["workflow_definition"]),
            estimated_duration=template_data.get("estimated_duration"),
            tags=template_data.get("tags", []),
            is_public=template_data.get("is_public", False),
            requires_approval=template_data.get("requires_approval", False)
        )
        
        self.db.add(template)
        self.db.commit()
        return template
    
    def get_workflow_templates(
        self,
        tenant_id: int,
        category: Optional[str] = None,
        is_active: bool = True,
        is_public: Optional[bool] = None
    ) -> List[WorkflowTemplate]:
        """
        Get workflow templates for a tenant
        """
        query = self.db.query(WorkflowTemplate).filter(
            WorkflowTemplate.tenant_id == tenant_id,
            WorkflowTemplate.is_active == is_active
        )
        
        if category:
            query = query.filter(WorkflowTemplate.category == category)
        
        if is_public is not None:
            query = query.filter(WorkflowTemplate.is_public == is_public)
        
        return query.order_by(WorkflowTemplate.created_at.desc()).all()
    
    def create_workflow_instance(
        self,
        tenant_id: int,
        template_id: int,
        instance_data: Dict[str, Any],
        triggered_by: str = "manual"
    ) -> WorkflowInstance:
        """
        Create a new workflow instance from a template
        """
        template = self.db.query(WorkflowTemplate).filter(
            WorkflowTemplate.id == template_id,
            WorkflowTemplate.tenant_id == tenant_id
        ).first()
        
        if not template:
            raise ValueError("Template not found")
        
        # Validate input data against template schema
        if template.input_schema:
            self._validate_input_data(instance_data.get("input_data", {}), template.input_schema)
        
        # Calculate total steps
        steps_total = self._count_workflow_steps(template.workflow_definition)
        
        instance = WorkflowInstance(
            tenant_id=tenant_id,
            template_id=template_id,
            name=instance_data["name"],
            description=instance_data.get("description"),
            input_data=instance_data.get("input_data", {}),
            context_data=instance_data.get("context_data", {}),
            triggered_by=triggered_by,
            priority=instance_data.get("priority", 5),
            steps_total=steps_total
        )
        
        self.db.add(instance)
        self.db.flush()
        
        # Initialize step executions
        self._initialize_step_executions(instance, template.workflow_definition)
        
        self.db.commit()
        return instance
    
    def execute_workflow_instance(self, instance_id: int) -> bool:
        """
        Execute a workflow instance
        """
        instance = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.id == instance_id
        ).first()
        
        if not instance:
            raise ValueError("Workflow instance not found")
        
        if instance.status != "draft":
            raise ValueError("Workflow instance is not in draft status")
        
        try:
            # Start execution
            instance.status = "active"
            instance.execution_start_time = datetime.utcnow()
            
            # Execute workflow steps
            success = self._execute_workflow_steps(instance)
            
            if success:
                instance.status = "completed"
                instance.progress_percentage = 100.0
            else:
                instance.status = "failed"
            
            instance.execution_end_time = datetime.utcnow()
            if instance.execution_start_time:
                duration = (instance.execution_end_time - instance.execution_start_time).total_seconds()
                instance.execution_duration = duration
            
            self.db.commit()
            return success
            
        except Exception as e:
            instance.status = "failed"
            instance.last_error = str(e)
            instance.error_count += 1
            instance.execution_end_time = datetime.utcnow()
            self.db.commit()
            return False
    
    def get_workflow_instances(
        self,
        tenant_id: int,
        template_id: Optional[int] = None,
        status: Optional[str] = None
    ) -> List[WorkflowInstance]:
        """
        Get workflow instances for a tenant
        """
        query = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.tenant_id == tenant_id
        )
        
        if template_id:
            query = query.filter(WorkflowInstance.template_id == template_id)
        
        if status:
            query = query.filter(WorkflowInstance.status == status)
        
        return query.order_by(WorkflowInstance.created_at.desc()).all()
    
    def create_automation_rule(
        self,
        tenant_id: int,
        created_by: int,
        rule_data: Dict[str, Any]
    ) -> AutomationRule:
        """
        Create a new automation rule
        """
        rule = AutomationRule(
            tenant_id=tenant_id,
            created_by=created_by,
            name=rule_data["name"],
            description=rule_data.get("description"),
            trigger_type=rule_data["trigger_type"],
            trigger_config=rule_data["trigger_config"],
            conditions=rule_data.get("conditions", []),
            workflow_template_id=rule_data["workflow_template_id"],
            action_config=rule_data.get("action_config", {}),
            priority=rule_data.get("priority", 5),
            rate_limit=rule_data.get("rate_limit", 100)
        )
        
        self.db.add(rule)
        self.db.commit()
        return rule
    
    def get_automation_rules(
        self,
        tenant_id: int,
        trigger_type: Optional[str] = None,
        is_active: bool = True
    ) -> List[AutomationRule]:
        """
        Get automation rules for a tenant
        """
        query = self.db.query(AutomationRule).filter(
            AutomationRule.tenant_id == tenant_id,
            AutomationRule.is_active == is_active
        )
        
        if trigger_type:
            query = query.filter(AutomationRule.trigger_type == trigger_type)
        
        return query.order_by(AutomationRule.priority.desc()).all()
    
    def trigger_automation_rule(
        self,
        rule_id: int,
        trigger_data: Dict[str, Any]
    ) -> Optional[WorkflowInstance]:
        """
        Trigger an automation rule
        """
        rule = self.db.query(AutomationRule).filter(
            AutomationRule.id == rule_id,
            AutomationRule.is_active == True
        ).first()
        
        if not rule:
            return None
        
        # Check rate limiting
        if not self._check_rate_limit(rule):
            return None
        
        # Evaluate conditions
        if not self._evaluate_conditions(rule.conditions, trigger_data):
            return None
        
        try:
            # Create workflow instance
            instance_data = {
                "name": f"Auto: {rule.name} - {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}",
                "description": f"Automatically triggered by rule: {rule.name}",
                "input_data": {**rule.action_config, **trigger_data},
                "priority": rule.priority
            }
            
            instance = self.create_workflow_instance(
                tenant_id=rule.tenant_id,
                template_id=rule.workflow_template_id,
                instance_data=instance_data,
                triggered_by=f"automation_rule_{rule.id}"
            )
            
            # Update rule statistics
            rule.total_executions += 1
            rule.last_execution = datetime.utcnow()
            
            # Execute workflow instance
            success = self.execute_workflow_instance(instance.id)
            
            if success:
                rule.successful_executions += 1
            else:
                rule.failed_executions += 1
            
            # Update success rate
            if rule.total_executions > 0:
                rule.success_rate = (rule.successful_executions / rule.total_executions) * 100
            
            self.db.commit()
            return instance
            
        except Exception as e:
            rule.failed_executions += 1
            self.db.commit()
            return None
    
    def create_workflow_action(
        self,
        tenant_id: int,
        created_by: Optional[int],
        action_data: Dict[str, Any]
    ) -> WorkflowAction:
        """
        Create a new workflow action
        """
        action = WorkflowAction(
            tenant_id=tenant_id,
            created_by=created_by,
            name=action_data["name"],
            description=action_data.get("description"),
            category=action_data["category"],
            action_type=action_data["action_type"],
            config_schema=action_data["config_schema"],
            default_config=action_data.get("default_config", {}),
            is_system_action=action_data.get("is_system_action", False),
            requires_auth=action_data.get("requires_auth", False),
            test_config=action_data.get("test_config", {})
        )
        
        self.db.add(action)
        self.db.commit()
        return action
    
    def get_workflow_actions(
        self,
        tenant_id: int,
        category: Optional[str] = None,
        action_type: Optional[str] = None,
        is_active: bool = True
    ) -> List[WorkflowAction]:
        """
        Get workflow actions for a tenant
        """
        query = self.db.query(WorkflowAction).filter(
            WorkflowAction.tenant_id == tenant_id,
            WorkflowAction.is_active == is_active
        )
        
        if category:
            query = query.filter(WorkflowAction.category == category)
        
        if action_type:
            query = query.filter(WorkflowAction.action_type == action_type)
        
        return query.order_by(WorkflowAction.name).all()
    
    def test_workflow_action(self, action_id: int, test_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Test a workflow action
        """
        action = self.db.query(WorkflowAction).filter(
            WorkflowAction.id == action_id
        ).first()
        
        if not action:
            raise ValueError("Action not found")
        
        try:
            # Execute test based on action type
            result = self._execute_action_test(action, test_config)
            
            # Update action test results
            action.last_tested = datetime.utcnow()
            action.test_success = result["success"]
            
            self.db.commit()
            return result
            
        except Exception as e:
            action.last_tested = datetime.utcnow()
            action.test_success = False
            self.db.commit()
            
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def get_workflow_analytics(
        self,
        tenant_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get workflow analytics for a tenant
        """
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()
        
        # Workflow instances analytics
        instances_query = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.tenant_id == tenant_id,
            WorkflowInstance.created_at >= start_date,
            WorkflowInstance.created_at <= end_date
        )
        
        total_instances = instances_query.count()
        completed_instances = instances_query.filter(WorkflowInstance.status == "completed").count()
        failed_instances = instances_query.filter(WorkflowInstance.status == "failed").count()
        
        # Automation rules analytics
        rules_query = self.db.query(AutomationRule).filter(
            AutomationRule.tenant_id == tenant_id,
            AutomationRule.last_execution >= start_date,
            AutomationRule.last_execution <= end_date
        )
        
        total_automations = rules_query.with_entities(func.sum(AutomationRule.total_executions)).scalar() or 0
        successful_automations = rules_query.with_entities(func.sum(AutomationRule.successful_executions)).scalar() or 0
        
        # Performance metrics
        avg_duration = instances_query.filter(
            WorkflowInstance.execution_duration.isnot(None)
        ).with_entities(func.avg(WorkflowInstance.execution_duration)).scalar() or 0
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "workflow_instances": {
                "total": total_instances,
                "completed": completed_instances,
                "failed": failed_instances,
                "success_rate": (completed_instances / total_instances * 100) if total_instances > 0 else 0
            },
            "automation_rules": {
                "total_executions": total_automations,
                "successful_executions": successful_automations,
                "success_rate": (successful_automations / total_automations * 100) if total_automations > 0 else 0
            },
            "performance": {
                "avg_execution_duration": avg_duration,
                "avg_execution_duration_minutes": avg_duration / 60 if avg_duration else 0
            }
        }
    
    def _validate_workflow_definition(self, workflow_definition: Dict[str, Any]) -> bool:
        """
        Validate workflow definition structure
        """
        required_fields = ["steps", "start_step"]
        for field in required_fields:
            if field not in workflow_definition:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate steps
        steps = workflow_definition["steps"]
        if not isinstance(steps, list) or len(steps) == 0:
            raise ValueError("Workflow must have at least one step")
        
        # Validate each step
        for step in steps:
            self._validate_workflow_step(step)
        
        return True
    
    def _validate_workflow_step(self, step: Dict[str, Any]) -> bool:
        """
        Validate individual workflow step
        """
        required_fields = ["id", "name", "type"]
        for field in required_fields:
            if field not in step:
                raise ValueError(f"Step missing required field: {field}")
        
        # Validate step type
        if step["type"] not in [e.value for e in WorkflowStepType]:
            raise ValueError(f"Invalid step type: {step['type']}")
        
        return True
    
    def _calculate_complexity(self, workflow_definition: Dict[str, Any]) -> str:
        """
        Calculate workflow complexity based on definition
        """
        steps = workflow_definition.get("steps", [])
        step_count = len(steps)
        
        # Count complex step types
        complex_types = ["condition", "loop", "parallel"]
        complex_steps = sum(1 for step in steps if step.get("type") in complex_types)
        
        if step_count <= 3 and complex_steps == 0:
            return "simple"
        elif step_count <= 10 and complex_steps <= 2:
            return "medium"
        else:
            return "complex"
    
    def _count_workflow_steps(self, workflow_definition: Dict[str, Any]) -> int:
        """
        Count total steps in workflow definition
        """
        return len(workflow_definition.get("steps", []))
    
    def _validate_input_data(self, input_data: Dict[str, Any], input_schema: Dict[str, Any]) -> bool:
        """
        Validate input data against schema
        """
        # Basic schema validation (in production, use jsonschema library)
        required_fields = input_schema.get("required", [])
        for field in required_fields:
            if field not in input_data:
                raise ValueError(f"Missing required input field: {field}")
        
        return True
    
    def _initialize_step_executions(self, instance: WorkflowInstance, workflow_definition: Dict[str, Any]):
        """
        Initialize step executions for workflow instance
        """
        steps = workflow_definition.get("steps", [])
        
        for i, step in enumerate(steps):
            step_execution = WorkflowStepExecution(
                workflow_instance_id=instance.id,
                step_id=step["id"],
                step_name=step["name"],
                step_type=step["type"],
                step_config=step.get("config", {}),
                execution_order=i + 1,
                status="pending"
            )
            self.db.add(step_execution)
    
    def _execute_workflow_steps(self, instance: WorkflowInstance) -> bool:
        """
        Execute workflow steps for an instance
        """
        # Get step executions in order
        step_executions = self.db.query(WorkflowStepExecution).filter(
            WorkflowStepExecution.workflow_instance_id == instance.id
        ).order_by(WorkflowStepExecution.execution_order).all()
        
        completed_steps = 0
        
        for step_execution in step_executions:
            try:
                # Execute step
                step_execution.status = "running"
                step_execution.start_time = datetime.utcnow()
                
                success = self._execute_single_step(step_execution, instance)
                
                step_execution.end_time = datetime.utcnow()
                if step_execution.start_time:
                    duration = (step_execution.end_time - step_execution.start_time).total_seconds()
                    step_execution.execution_duration = duration
                
                if success:
                    step_execution.status = "completed"
                    completed_steps += 1
                else:
                    step_execution.status = "failed"
                    return False
                
                # Update instance progress
                instance.steps_completed = completed_steps
                instance.progress_percentage = (completed_steps / instance.steps_total) * 100
                instance.current_step_id = step_execution.step_id
                
            except Exception as e:
                step_execution.status = "failed"
                step_execution.error_message = str(e)
                step_execution.end_time = datetime.utcnow()
                return False
        
        return True
    
    def _execute_single_step(self, step_execution: WorkflowStepExecution, instance: WorkflowInstance) -> bool:
        """
        Execute a single workflow step
        """
        step_type = step_execution.step_type
        
        if step_type == "action":
            return self._execute_action_step(step_execution, instance)
        elif step_type == "condition":
            return self._execute_condition_step(step_execution, instance)
        elif step_type == "notification":
            return self._execute_notification_step(step_execution, instance)
        elif step_type == "integration":
            return self._execute_integration_step(step_execution, instance)
        else:
            # For other step types, simulate execution
            return True
    
    def _execute_action_step(self, step_execution: WorkflowStepExecution, instance: WorkflowInstance) -> bool:
        """
        Execute an action step
        """
        # Simulate action execution
        step_execution.output_data = {"result": "Action executed successfully"}
        return True
    
    def _execute_condition_step(self, step_execution: WorkflowStepExecution, instance: WorkflowInstance) -> bool:
        """
        Execute a condition step
        """
        # Simulate condition evaluation
        step_execution.output_data = {"condition_result": True}
        return True
    
    def _execute_notification_step(self, step_execution: WorkflowStepExecution, instance: WorkflowInstance) -> bool:
        """
        Execute a notification step
        """
        # Simulate notification sending
        step_execution.output_data = {"notification_sent": True}
        return True
    
    def _execute_integration_step(self, step_execution: WorkflowStepExecution, instance: WorkflowInstance) -> bool:
        """
        Execute an integration step
        """
        # Simulate integration call
        step_execution.output_data = {"integration_result": "Success"}
        return True
    
    def _check_rate_limit(self, rule: AutomationRule) -> bool:
        """
        Check if automation rule is within rate limits
        """
        # Check executions in the last hour
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        recent_executions = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.triggered_by == f"automation_rule_{rule.id}",
            WorkflowInstance.created_at >= one_hour_ago
        ).count()
        
        return recent_executions < rule.rate_limit
    
    def _evaluate_conditions(self, conditions: List[Dict[str, Any]], trigger_data: Dict[str, Any]) -> bool:
        """
        Evaluate automation rule conditions
        """
        if not conditions:
            return True
        
        # Simple condition evaluation (in production, use a proper rule engine)
        for condition in conditions:
            field = condition.get("field")
            operator = condition.get("operator")
            value = condition.get("value")
            
            if field not in trigger_data:
                return False
            
            trigger_value = trigger_data[field]
            
            if operator == "equals" and trigger_value != value:
                return False
            elif operator == "greater_than" and trigger_value <= value:
                return False
            elif operator == "less_than" and trigger_value >= value:
                return False
            elif operator == "contains" and value not in str(trigger_value):
                return False
        
        return True
    
    def _execute_action_test(self, action: WorkflowAction, test_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute action test
        """
        # Simulate action test execution based on action type
        action_type = action.action_type
        
        if action_type == "email":
            return {
                "success": True,
                "message": "Email test successful",
                "timestamp": datetime.utcnow().isoformat()
            }
        elif action_type == "api_call":
            return {
                "success": True,
                "message": "API call test successful",
                "response_time": 150,
                "timestamp": datetime.utcnow().isoformat()
            }
        elif action_type == "database":
            return {
                "success": True,
                "message": "Database operation test successful",
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            return {
                "success": True,
                "message": f"Test successful for action type: {action_type}",
                "timestamp": datetime.utcnow().isoformat()
            }


class WorkflowTemplateService:
    """
    Service for managing workflow template operations
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def initialize_default_templates(self, tenant_id: int, created_by: int):
        """
        Initialize default workflow templates for a tenant
        """
        default_templates = [
            {
                "name": "Employee Onboarding",
                "description": "Standard employee onboarding workflow",
                "category": "hr",
                "workflow_definition": {
                    "start_step": "welcome",
                    "steps": [
                        {
                            "id": "welcome",
                            "name": "Send Welcome Email",
                            "type": "notification",
                            "config": {"template": "welcome_email"}
                        },
                        {
                            "id": "setup_accounts",
                            "name": "Setup User Accounts",
                            "type": "action",
                            "config": {"action": "create_user_accounts"}
                        },
                        {
                            "id": "assign_equipment",
                            "name": "Assign Equipment",
                            "type": "human_task",
                            "config": {"assignee_role": "it_admin"}
                        }
                    ]
                },
                "input_schema": {
                    "required": ["employee_name", "employee_email", "department"],
                    "properties": {
                        "employee_name": {"type": "string"},
                        "employee_email": {"type": "string"},
                        "department": {"type": "string"}
                    }
                }
            },
            {
                "name": "Invoice Approval",
                "description": "Invoice approval workflow with multiple approvers",
                "category": "finance",
                "workflow_definition": {
                    "start_step": "validate_invoice",
                    "steps": [
                        {
                            "id": "validate_invoice",
                            "name": "Validate Invoice Data",
                            "type": "condition",
                            "config": {"validation_rules": ["amount_positive", "vendor_exists"]}
                        },
                        {
                            "id": "manager_approval",
                            "name": "Manager Approval",
                            "type": "approval",
                            "config": {"approver_role": "manager", "timeout_hours": 48}
                        },
                        {
                            "id": "finance_approval",
                            "name": "Finance Approval",
                            "type": "approval",
                            "config": {"approver_role": "finance", "timeout_hours": 24}
                        }
                    ]
                },
                "input_schema": {
                    "required": ["invoice_amount", "vendor_id", "description"],
                    "properties": {
                        "invoice_amount": {"type": "number"},
                        "vendor_id": {"type": "string"},
                        "description": {"type": "string"}
                    }
                }
            },
            {
                "name": "Customer Support Ticket",
                "description": "Customer support ticket resolution workflow",
                "category": "support",
                "workflow_definition": {
                    "start_step": "categorize_ticket",
                    "steps": [
                        {
                            "id": "categorize_ticket",
                            "name": "Categorize Support Ticket",
                            "type": "action",
                            "config": {"action": "auto_categorize"}
                        },
                        {
                            "id": "assign_agent",
                            "name": "Assign Support Agent",
                            "type": "action",
                            "config": {"action": "assign_by_category"}
                        },
                        {
                            "id": "resolve_ticket",
                            "name": "Resolve Ticket",
                            "type": "human_task",
                            "config": {"assignee_field": "assigned_agent"}
                        }
                    ]
                },
                "input_schema": {
                    "required": ["customer_id", "subject", "description", "priority"],
                    "properties": {
                        "customer_id": {"type": "string"},
                        "subject": {"type": "string"},
                        "description": {"type": "string"},
                        "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"]}
                    }
                }
            }
        ]
        
        workflow_service = WorkflowAutomationService(self.db)
        
        for template_data in default_templates:
            existing = self.db.query(WorkflowTemplate).filter(
                WorkflowTemplate.tenant_id == tenant_id,
                WorkflowTemplate.name == template_data["name"]
            ).first()
            
            if not existing:
                workflow_service.create_workflow_template(
                    tenant_id=tenant_id,
                    created_by=created_by,
                    template_data=template_data
                )