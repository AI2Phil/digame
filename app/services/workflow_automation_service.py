"""
Workflow Automation service layer for business process automation and workflow management
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta, timezone
import json
import uuid
import asyncio
from enum import Enum

from ..models.workflow_automation import (
    WorkflowTemplate, WorkflowInstance, WorkflowStepExecution,
    AutomationRule, WorkflowAction, WorkflowIntegration,
    WorkflowStatus, WorkflowStepType, WorkflowStepStatus, AutomationTriggerType,
    WorkflowReportConfig
)
from ..database import get_db # Renamed to avoid conflict with local get_db
from ..schemas.task_schemas import TaskCreate
from ..crud import task_crud
from .task_prioritization_service import TaskPrioritizationService
# CalendarService might be used later if events are directly created/updated here
# from .calendar_service import CalendarService
# Temporarily disabled to resolve Base class conflicts
# from .reporting_service_part1 import ReportingService # For triggering reports
# from ..models.dashboard_custom import ReportDefinition # To fetch ReportDefinition for reporting service


class WorkflowAutomationService:
    """
    Core workflow automation service for managing business process automation
    """
    
    def __init__(self, db: Session, task_prioritization_service: TaskPrioritizationService, reporting_service: Optional[Any] = None) -> None:
        self.db = db
        self.task_prioritization_service = task_prioritization_service
        self.reporting_service = reporting_service # Added ReportingService

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
        
        template = WorkflowTemplate()  # type: ignore
        setattr(template, 'tenant_id', tenant_id)  # type: ignore
        setattr(template, 'created_by', created_by)  # type: ignore
        setattr(template, 'name', template_data["name"])  # type: ignore
        setattr(template, 'description', template_data.get("description"))  # type: ignore
        setattr(template, 'category', template_data["category"])  # type: ignore
        setattr(template, 'version', template_data.get("version", "1.0"))  # type: ignore
        setattr(template, 'workflow_definition', template_data["workflow_definition"])  # type: ignore
        setattr(template, 'input_schema', template_data.get("input_schema", {}))  # type: ignore
        setattr(template, 'output_schema', template_data.get("output_schema", {}))  # type: ignore
        setattr(template, 'complexity_level', self._calculate_complexity(template_data["workflow_definition"]))  # type: ignore
        setattr(template, 'estimated_duration', template_data.get("estimated_duration"))  # type: ignore
        setattr(template, 'tags', template_data.get("tags", []))  # type: ignore
        setattr(template, 'is_public', template_data.get("is_public", False))  # type: ignore
        setattr(template, 'requires_approval', template_data.get("requires_approval", False))  # type: ignore
        
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
            WorkflowTemplate.tenant_id == tenant_id,  # type: ignore
            WorkflowTemplate.is_active == is_active  # type: ignore
        )
        
        if category:
            query = query.filter(WorkflowTemplate.category == category)  # type: ignore
        
        if is_public is not None:
            query = query.filter(WorkflowTemplate.is_public == is_public)  # type: ignore
        
        return query.order_by(WorkflowTemplate.created_at.desc()).all()  # type: ignore
    
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
            WorkflowTemplate.id == template_id,  # type: ignore
            WorkflowTemplate.tenant_id == tenant_id  # type: ignore
        ).first()
        
        if not template:
            raise ValueError("Template not found")
        
        # Validate input data against template schema
        template_input_schema = getattr(template, 'input_schema', None)
        if template_input_schema:
            self._validate_input_data(instance_data.get("input_data", {}), template_input_schema)
        
        # Calculate total steps
        steps_total = self._count_workflow_steps(getattr(template, 'workflow_definition', {}))
        
        instance = WorkflowInstance()  # type: ignore
        setattr(instance, 'tenant_id', tenant_id)  # type: ignore
        setattr(instance, 'template_id', template_id)  # type: ignore
        setattr(instance, 'name', instance_data["name"])  # type: ignore
        setattr(instance, 'description', instance_data.get("description"))  # type: ignore
        setattr(instance, 'input_data', instance_data.get("input_data", {}))  # type: ignore
        setattr(instance, 'context_data', instance_data.get("context_data", {}))  # type: ignore
        setattr(instance, 'triggered_by', triggered_by)  # type: ignore
        setattr(instance, 'priority', instance_data.get("priority", 5))  # type: ignore
        setattr(instance, 'steps_total', steps_total)  # type: ignore
        
        self.db.add(instance)
        self.db.flush()
        
        # Initialize step executions
        self._initialize_step_executions(instance, getattr(template, 'workflow_definition', {}))
        
        self.db.commit()
        return instance
    
    def execute_workflow_instance(self, instance_id: int) -> bool:
        """
        Execute a workflow instance
        """
        instance = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.id == instance_id  # type: ignore
        ).first()
        
        if not instance:
            raise ValueError("Workflow instance not found")
        
        if getattr(instance, 'status', None) != "draft":
            raise ValueError("Workflow instance is not in draft status")
        
        try:
            # Start execution
            setattr(instance, 'status', "active")  # type: ignore
            setattr(instance, 'execution_start_time', datetime.now(timezone.utc))  # type: ignore
            
            # Execute workflow steps
            success = self._execute_workflow_steps(instance)
            
            if success:
                setattr(instance, 'status', "completed")  # type: ignore
                setattr(instance, 'progress_percentage', 100.0)  # type: ignore
            else:
                setattr(instance, 'status', "failed")  # type: ignore
            
            setattr(instance, 'execution_end_time', datetime.now(timezone.utc))  # type: ignore
            execution_start = getattr(instance, 'execution_start_time', None)
            execution_end = getattr(instance, 'execution_end_time', None)
            if execution_start and execution_end:
                duration = (execution_end - execution_start).total_seconds()
                setattr(instance, 'execution_duration', duration)  # type: ignore
            
            # After main execution logic, try to trigger reports
            self._try_trigger_workflow_reports(instance, "on_workflow_completion" if success else "on_workflow_failure")

            self.db.commit() # Commit all changes including instance status and report triggers
            return success
            
        except Exception as e:
            setattr(instance, 'status', "failed")  # type: ignore
            setattr(instance, 'last_error', str(e))  # type: ignore
            current_error_count = getattr(instance, 'error_count', 0)
            setattr(instance, 'error_count', current_error_count + 1)  # type: ignore
            setattr(instance, 'execution_end_time', datetime.now(timezone.utc))  # type: ignore
            # Also attempt to trigger failure reports
            self._try_trigger_workflow_reports(instance, "on_workflow_failure")
            self.db.commit()
            return False

    def _try_trigger_workflow_reports(self, instance: WorkflowInstance, event_type: str):
        """
        Checks for and triggers any configured reports for the given workflow instance and event type.
        """
        if not self.reporting_service:
            # Log that reporting service is not available
            print("WorkflowAutomationService: ReportingService not available, skipping report trigger.")
            return

        try:
            report_configs = self.db.query(WorkflowReportConfig).filter(
                WorkflowReportConfig.workflow_template_id == getattr(instance, 'template_id', None),  # type: ignore
                WorkflowReportConfig.trigger_event_type == event_type,  # type: ignore
                WorkflowReportConfig.is_active == True  # type: ignore
            ).all()

            for config in report_configs:
                report_definition = self.db.query(ReportDefinition).get(getattr(config, 'report_definition_id', None))
                if not report_definition:
                    # Log missing report definition
                    print(f"WorkflowReportConfig {getattr(config, 'id', 'unknown')} references missing ReportDefinition {getattr(config, 'report_definition_id', 'unknown')}")
                    continue

                # Prepare parameters for the report
                # This is a simplified parameter mapping. Real-world might need a more robust templating/extraction.
                report_parameters = {}
                parameter_mapping = getattr(config, 'parameter_mapping', None)
                if parameter_mapping:
                    for report_param, instance_path in parameter_mapping.items():
                        # Example instance_path: "instance.id", "instance.input_data.some_key"
                        value = instance
                        try:
                            for part in instance_path.split('.')[1:]: # Skip "instance"
                                if isinstance(value, dict):
                                    value = value.get(part)
                                else:
                                    value = getattr(value, part)
                                if value is None: break
                            report_parameters[report_param] = value
                        except (AttributeError, KeyError):
                            # Log that a mapped parameter was not found
                            config_id = getattr(config, 'id', 'unknown')
                            print(f"Could not resolve parameter path {instance_path} for report config {config_id}")

                # Add default/contextual parameters
                report_parameters["workflow_instance_id"] = getattr(instance, 'id', None)
                report_parameters["workflow_instance_name"] = getattr(instance, 'name', '')
                report_parameters["workflow_status"] = getattr(instance, 'status', '')
                report_parameters["workflow_triggered_by"] = getattr(instance, 'triggered_by', '')

                # Fetch data for the report (this is the tricky part without direct data source for workflow instance)
                # generate_report_data in reporting_service uses CustomDashboardService.
                # We need a way for ReportDefinition to source data from a specific workflow instance.
                # This might require a new data source type in CustomDashboardService like "workflow_instance_data"
                # that accepts an instance_id.
                # For now, we assume `generate_report_data` can conceptually accept `report_parameters`
                # that include `workflow_instance_id`, and its data sources can use this.

                # This call to generate_report_data will use the existing mechanism, which relies on
                # ReportDefinition.content_blocks and their data_source configurations.
                # We must ensure that data_sources can be parameterized by workflow_instance_id.
                # This is a significant dependency on how CustomDashboardService and AnalyticsService are structured.
                # Let's assume `report_parameters` can be used by these services if the data_sources are designed for it.

                print(f"Attempting to generate report for workflow instance {getattr(instance, 'id', 'unknown')} based on config {getattr(config, 'id', 'unknown')}")
                # This will fetch data based on report_definition's configured blocks
                # The `report_parameters` might be used by those blocks if they are designed to accept them.
                # This is where the "Enhance ReportDefinition Data Sources" part of the plan is crucial.
                # For now, we proceed with the call.
                # Check if reporting service has the required method
                if hasattr(self.reporting_service, 'generate_report_data'):
                    generate_method = getattr(self.reporting_service, 'generate_report_data')
                    if callable(generate_method):
                        try:
                            # Try to call the method and handle both sync and async cases
                            result = generate_method(
                                report_definition_id=getattr(report_definition, 'id', 0),
                                tenant_id=getattr(instance, 'tenant_id', 0)
                            )
                            # Check if result is a coroutine
                            if hasattr(result, '__await__'):
                                report_data_payload = asyncio.run(result)  # type: ignore
                            else:
                                report_data_payload = result
                        except Exception as e:
                            print(f"Error calling generate_report_data: {e}")
                            report_data_payload = {}
                    else:
                        report_data_payload = {}
                else:
                    report_data_payload = {}

                # Extract tabular data from payload (simplification)
                data_for_file_generation: List[Dict[str, Any]] = []
                if report_data_payload and isinstance(report_data_payload, dict) and report_data_payload.get("content"):
                    content = report_data_payload.get("content", [])
                    if isinstance(content, list):
                        for block in content:
                            if isinstance(block, dict) and block.get("data") and isinstance(block["data"], list):
                                data_for_file_generation.extend(block["data"])

                output_format = getattr(config, 'output_format_override', None) or getattr(report_definition, 'output_format', None) or "pdf"

                # Generate the report file
                # This call creates and commits a ReportExecution
                # Check if reporting service has the required method
                if hasattr(self.reporting_service, 'execute_and_generate_for_definition'):
                    execute_method = getattr(self.reporting_service, 'execute_and_generate_for_definition')
                    if callable(execute_method):
                        try:
                            # Try to call the method and handle both sync and async cases
                            result = execute_method(
                                report_definition=report_definition,
                                report_data=data_for_file_generation,
                                output_format=output_format,
                                execution_type=f"workflow_triggered_{event_type}",
                                parameters=report_parameters,
                                user_id=getattr(config, 'created_by', None)
                            )
                            # Check if result is a coroutine
                            if hasattr(result, '__await__'):
                                execution_record = asyncio.run(result)  # type: ignore
                            else:
                                execution_record = result
                        except Exception as e:
                            print(f"Error calling execute_and_generate_for_definition: {e}")
                            execution_record = None
                    else:
                        execution_record = None
                else:
                    execution_record = None

                if execution_record and getattr(execution_record, 'status', None) == "completed" and getattr(execution_record, 'file_path', None):
                    print(f"Report {getattr(execution_record, 'id', 'unknown')} generated for workflow instance {getattr(instance, 'id', 'unknown')}. Path: {getattr(execution_record, 'file_path', 'unknown')}")
                    # Handle delivery if configured in WorkflowReportConfig
                    delivery_config = getattr(config, 'delivery_config_override', None)
                    if delivery_config:
                        # This part requires delivery logic, similar to ReportSchedulingService
                        # For now, just log the intent to deliver.
                        # A shared delivery service/helper would be ideal.
                        print(f"Delivery required for report {getattr(execution_record, 'id', 'unknown')}: {delivery_config}")
                        # Example: await self.shared_delivery_service.deliver_report(execution_record, config.delivery_config_override, report_definition)
                else:
                    # Log report generation failure
                    print(f"Failed to generate report for workflow instance {getattr(instance, 'id', 'unknown')} from config {getattr(config, 'id', 'unknown')}. Status: {getattr(execution_record, 'status', 'N/A') if execution_record else 'N/A'}")

        except Exception as e:
            # Log error during report triggering
            print(f"Error triggering workflow reports for instance {getattr(instance, 'id', 'unknown')}, event {event_type}: {str(e)}")
            # This should not prevent the workflow execution status from being saved.

    # --- WorkflowReportConfig CRUD ---
    def create_workflow_report_config(
        self,
        tenant_id: int,
        created_by_user_id: int,
        config_data: Dict[str, Any] # Comes from WorkflowReportConfigCreate schema
    ) -> WorkflowReportConfig:
        # Validate that workflow_template_id and report_definition_id exist for the tenant
        # (Simplified check here, could be more robust)
        template = self.db.query(WorkflowTemplate).filter(
            WorkflowTemplate.id == config_data["workflow_template_id"],  # type: ignore
            WorkflowTemplate.tenant_id == tenant_id  # type: ignore
        ).first()
        if not template:
            raise ValueError(f"WorkflowTemplate with id {config_data['workflow_template_id']} not found for tenant {tenant_id}")

        report_def = self.db.query(ReportDefinition).filter(
            ReportDefinition.id == config_data["report_definition_id"]  # type: ignore
            # ReportDefinition might not have tenant_id directly, or it's implicit via User/Dashboard
            # This needs to align with how ReportDefinition is scoped. Assuming it's globally accessible or tenant-scoped.
            # For now, let's assume ReportDefinition is accessible if it exists.
            # A proper multi-tenancy check for ReportDefinition would be needed here.
        ).first()
        if not report_def:
            raise ValueError(f"ReportDefinition with id {config_data['report_definition_id']} not found.")

        db_config = WorkflowReportConfig()  # type: ignore
        setattr(db_config, 'tenant_id', tenant_id)  # type: ignore
        setattr(db_config, 'created_by', created_by_user_id)  # type: ignore
        setattr(db_config, 'name', config_data["name"])  # type: ignore
        setattr(db_config, 'description', config_data.get("description"))  # type: ignore
        setattr(db_config, 'workflow_template_id', config_data["workflow_template_id"])  # type: ignore
        setattr(db_config, 'report_definition_id', config_data["report_definition_id"])  # type: ignore
        setattr(db_config, 'trigger_event_type', config_data["trigger_event_type"])  # type: ignore
        setattr(db_config, 'trigger_event_config', config_data.get("trigger_event_config"))  # type: ignore
        setattr(db_config, 'output_format_override', config_data.get("output_format_override"))  # type: ignore
        setattr(db_config, 'delivery_config_override', config_data.get("delivery_config_override"))  # type: ignore
        setattr(db_config, 'parameter_mapping', config_data.get("parameter_mapping"))  # type: ignore
        setattr(db_config, 'is_active', config_data.get("is_active", True))  # type: ignore
        self.db.add(db_config)
        self.db.commit()
        self.db.refresh(db_config)
        return db_config

    def get_workflow_report_config(self, config_id: int, tenant_id: int) -> Optional[WorkflowReportConfig]:
        return self.db.query(WorkflowReportConfig).filter(
            WorkflowReportConfig.id == config_id,
            WorkflowReportConfig.tenant_id == tenant_id
        ).first()

    def get_workflow_report_configs_for_template(self, workflow_template_id: int, tenant_id: int) -> List[WorkflowReportConfig]:
        return self.db.query(WorkflowReportConfig).filter(
            WorkflowReportConfig.workflow_template_id == workflow_template_id,
            WorkflowReportConfig.tenant_id == tenant_id
        ).order_by(WorkflowReportConfig.name).all()
    
    def get_all_workflow_report_configs(self, tenant_id: int, skip: int = 0, limit: int = 100) -> List[WorkflowReportConfig]:
        return self.db.query(WorkflowReportConfig).filter(
            WorkflowReportConfig.tenant_id == tenant_id
        ).order_by(WorkflowReportConfig.id.desc()).offset(skip).limit(limit).all()


    def update_workflow_report_config(
        self,
        config_id: int,
        tenant_id: int,
        update_data: Dict[str, Any] # Comes from WorkflowReportConfigUpdate schema
    ) -> Optional[WorkflowReportConfig]:
        db_config = self.get_workflow_report_config(config_id, tenant_id)
        if not db_config:
            return None

        for key, value in update_data.items():
            if hasattr(db_config, key) and value is not None: # Ensure value is not None before setting
                setattr(db_config, key, value)

        setattr(db_config, 'updated_at', datetime.now(timezone.utc))  # type: ignore # Manually update timestamp
        self.db.commit()
        self.db.refresh(db_config)
        return db_config

    def delete_workflow_report_config(self, config_id: int, tenant_id: int) -> bool:
        db_config = self.get_workflow_report_config(config_id, tenant_id)
        if not db_config:
            return False

        self.db.delete(db_config)
        self.db.commit()
        return True
    # --- End WorkflowReportConfig CRUD ---

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
        rule = AutomationRule()  # type: ignore
        setattr(rule, 'tenant_id', tenant_id)  # type: ignore
        setattr(rule, 'created_by', created_by)  # type: ignore
        setattr(rule, 'name', rule_data["name"])  # type: ignore
        setattr(rule, 'description', rule_data.get("description"))  # type: ignore
        setattr(rule, 'trigger_type', rule_data["trigger_type"])  # type: ignore
        setattr(rule, 'trigger_config', rule_data["trigger_config"])  # type: ignore
        setattr(rule, 'conditions', rule_data.get("conditions", []))  # type: ignore
        setattr(rule, 'workflow_template_id', rule_data["workflow_template_id"])  # type: ignore
        setattr(rule, 'action_config', rule_data.get("action_config", {}))  # type: ignore
        setattr(rule, 'priority', rule_data.get("priority", 5))  # type: ignore
        setattr(rule, 'rate_limit', rule_data.get("rate_limit", 100))  # type: ignore
        
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
        if not self._evaluate_conditions(getattr(rule, 'conditions', []), trigger_data):
            return None
        
        try:
            # Create workflow instance
            instance_data = {
                "name": f"Auto: {getattr(rule, 'name', 'Unknown')} - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}",
                "description": f"Automatically triggered by rule: {getattr(rule, 'name', 'Unknown')}",
                "input_data": {**getattr(rule, 'action_config', {}), **trigger_data},
                "priority": getattr(rule, 'priority', 5)
            }
            
            instance = self.create_workflow_instance(
                tenant_id=getattr(rule, 'tenant_id', 0),
                template_id=getattr(rule, 'workflow_template_id', 0),
                instance_data=instance_data,
                triggered_by=f"automation_rule_{getattr(rule, 'id', 0)}"
            )
            
            # Update rule statistics
            current_total = getattr(rule, 'total_executions', 0)
            setattr(rule, 'total_executions', current_total + 1)  # type: ignore
            setattr(rule, 'last_execution', datetime.now(timezone.utc))  # type: ignore
            
            # Execute workflow instance
            success = self.execute_workflow_instance(getattr(instance, 'id', 0))  # type: ignore
            
            if success:
                current_successful = getattr(rule, 'successful_executions', 0)
                setattr(rule, 'successful_executions', current_successful + 1)  # type: ignore
            else:
                current_failed = getattr(rule, 'failed_executions', 0)
                setattr(rule, 'failed_executions', current_failed + 1)  # type: ignore
            
            # Update success rate
            total_executions = getattr(rule, 'total_executions', 0)
            successful_executions = getattr(rule, 'successful_executions', 0)
            if total_executions > 0:
                setattr(rule, 'success_rate', (successful_executions / total_executions) * 100)  # type: ignore
            
            self.db.commit()
            return instance
            
        except Exception as e:
            current_failed = getattr(rule, 'failed_executions', 0)
            setattr(rule, 'failed_executions', current_failed + 1)  # type: ignore
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
        action = WorkflowAction()  # type: ignore
        setattr(action, 'tenant_id', tenant_id)  # type: ignore
        setattr(action, 'created_by', created_by)  # type: ignore
        setattr(action, 'name', action_data["name"])  # type: ignore
        setattr(action, 'description', action_data.get("description"))  # type: ignore
        setattr(action, 'category', action_data["category"])  # type: ignore
        setattr(action, 'action_type', action_data["action_type"])  # type: ignore
        setattr(action, 'config_schema', action_data["config_schema"])  # type: ignore
        setattr(action, 'default_config', action_data.get("default_config", {}))  # type: ignore
        setattr(action, 'is_system_action', action_data.get("is_system_action", False))  # type: ignore
        setattr(action, 'requires_auth', action_data.get("requires_auth", False))  # type: ignore
        setattr(action, 'test_config', action_data.get("test_config", {}))  # type: ignore
        
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
            setattr(action, 'last_tested', datetime.now(timezone.utc))  # type: ignore
            setattr(action, 'test_success', result["success"])  # type: ignore
            
            self.db.commit()
            return result
            
        except Exception as e:
            setattr(action, 'last_tested', datetime.now(timezone.utc))  # type: ignore
            setattr(action, 'test_success', False)  # type: ignore
            self.db.commit()
            
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
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
            start_date = datetime.now(timezone.utc) - timedelta(days=30)
        if not end_date:
            end_date = datetime.now(timezone.utc)
        
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
            AutomationRule.tenant_id == tenant_id
        )
        
        # Add date filters only if last_execution is not None
        if hasattr(AutomationRule, 'last_execution'):
            rules_query = rules_query.filter(
                AutomationRule.last_execution >= start_date,
                AutomationRule.last_execution <= end_date
            )
        
        total_automations_result = rules_query.with_entities(func.sum(AutomationRule.total_executions)).scalar()
        total_automations = total_automations_result if total_automations_result is not None else 0
        
        successful_automations_result = rules_query.with_entities(func.sum(AutomationRule.successful_executions)).scalar()
        successful_automations = successful_automations_result if successful_automations_result is not None else 0
        
        # Performance metrics
        avg_duration_result = instances_query.filter(
            WorkflowInstance.execution_duration.isnot(None)
        ).with_entities(func.avg(WorkflowInstance.execution_duration)).scalar()
        avg_duration = avg_duration_result if avg_duration_result is not None else 0
        
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
        try:
            valid_step_types = [e.value for e in WorkflowStepType]  # type: ignore
        except Exception:
            valid_step_types = ["action", "condition", "notification", "integration", "human_task", "loop", "parallel", "approval"]
        
        if step["type"] not in valid_step_types:
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
            step_execution = WorkflowStepExecution()  # type: ignore
            setattr(step_execution, 'workflow_instance_id', getattr(instance, 'id', None))  # type: ignore
            setattr(step_execution, 'step_id', step["id"])  # type: ignore
            setattr(step_execution, 'step_name', step["name"])  # type: ignore
            setattr(step_execution, 'step_type', step["type"])  # type: ignore
            setattr(step_execution, 'step_config', step.get("config", {}))  # type: ignore
            setattr(step_execution, 'execution_order', i + 1)  # type: ignore
            setattr(step_execution, 'status', "pending")  # type: ignore
            self.db.add(step_execution)
    
    def _execute_workflow_steps(self, instance: WorkflowInstance) -> bool:
        """
        Execute workflow steps for an instance
        """
        # Get step executions in order
        step_executions = self.db.query(WorkflowStepExecution).filter(
            WorkflowStepExecution.workflow_instance_id == getattr(instance, 'id', None)
        ).order_by(WorkflowStepExecution.execution_order).all()
        
        completed_steps = 0
        
        for step_execution in step_executions:
            try:
                # Execute step
                setattr(step_execution, 'status', "running")  # type: ignore
                setattr(step_execution, 'start_time', datetime.now(timezone.utc))  # type: ignore
                
                success = self._execute_single_step(step_execution, instance)
                
                setattr(step_execution, 'end_time', datetime.now(timezone.utc))  # type: ignore
                start_time = getattr(step_execution, 'start_time', None)
                end_time = getattr(step_execution, 'end_time', None)
                if start_time and end_time:
                    duration = (end_time - start_time).total_seconds()
                    setattr(step_execution, 'execution_duration', duration)  # type: ignore
                
                if success:
                    setattr(step_execution, 'status', "completed")  # type: ignore
                    completed_steps += 1
                else:
                    setattr(step_execution, 'status', "failed")  # type: ignore
                    return False
                
                # Update instance progress
                setattr(instance, 'steps_completed', completed_steps)  # type: ignore
                steps_total = getattr(instance, 'steps_total', 1)
                setattr(instance, 'progress_percentage', (completed_steps / steps_total) * 100)  # type: ignore
                setattr(instance, 'current_step_id', getattr(step_execution, 'step_id', None))  # type: ignore
                
            except Exception as e:
                setattr(step_execution, 'status', "failed")  # type: ignore
                setattr(step_execution, 'error_message', str(e))  # type: ignore
                setattr(step_execution, 'end_time', datetime.now(timezone.utc))  # type: ignore
                return False
        
        return True
    
    def _execute_single_step(self, step_execution: WorkflowStepExecution, instance: WorkflowInstance) -> bool:
        """
        Execute a single workflow step
        """
        step_type = getattr(step_execution, 'step_type', None)
        
        try:
            action_value = WorkflowStepType.ACTION.value if hasattr(WorkflowStepType, 'ACTION') else "action"
            condition_value = WorkflowStepType.CONDITION.value if hasattr(WorkflowStepType, 'CONDITION') else "condition"
            notification_value = WorkflowStepType.NOTIFICATION.value if hasattr(WorkflowStepType, 'NOTIFICATION') else "notification"
            integration_value = WorkflowStepType.INTEGRATION.value if hasattr(WorkflowStepType, 'INTEGRATION') else "integration"
            human_task_value = WorkflowStepType.HUMAN_TASK.value if hasattr(WorkflowStepType, 'HUMAN_TASK') else "human_task"
        except Exception:
            action_value = "action"
            condition_value = "condition"
            notification_value = "notification"
            integration_value = "integration"
            human_task_value = "human_task"
        
        if step_type == action_value:
            return self._execute_action_step(step_execution, instance)
        elif step_type == condition_value:
            return self._execute_condition_step(step_execution, instance)
        elif step_type == notification_value:
            return self._execute_notification_step(step_execution, instance)
        elif step_type == integration_value:
            return self._execute_integration_step(step_execution, instance)
        elif step_type == human_task_value:
            return self._execute_human_task_step(step_execution, instance)
        # Add other step types like LOOP, PARALLEL, APPROVAL as needed
        else:
            # For other step types, simulate execution for now
            setattr(step_execution, 'output_data', {"message": f"Step type '{step_type}' processed with default simulation."})  # type: ignore
            return True

    def _execute_human_task_step(self, step_execution: WorkflowStepExecution, instance: WorkflowInstance) -> bool:
        """
        Executes a human task step, creating a corresponding Task in the system.
        """
        try:
            config = getattr(step_execution, 'step_config', {})
            assignee_id = config.get("assignee_id") # Expecting user ID
            assignee_role = config.get("assignee_role") # Alternative way to assign

            if not assignee_id and assignee_role:
                # Future enhancement: look up user by role. For now, require assignee_id.
                # This might involve querying the User model for users with that role,
                # and then applying some logic (e.g., round-robin, least busy).
                # For now, if no direct assignee_id, we can't create a task for a specific person.
                # Fallback: assign to workflow instance creator or a default admin?
                # For this implementation, we'll assume assignee_id is preferred.
                # If not provided, we can log a warning or assign to instance.created_by if available.
                # instance.created_by is not directly on the model, but template.created_by is.
                # This logic needs to be robust based on how assignees are determined.
                # For now, let's assume assignee_id must be resolvable.
                # A simple approach: if assignee_id is not in config, this step might fail or be unassigned.
                # Let's assume step_execution.assigned_to can be pre-filled during step initialization
                # or that config must provide it.
                # For now, we'll require assignee_id from config or step_execution.assigned_to (if it were populated earlier)
                assignee_id = getattr(step_execution, 'assigned_to', None) # Check if it was set on the step execution record directly

            if not assignee_id:
                error_msg = "Human task requires an assignee_id in step_config or on step_execution."
                setattr(step_execution, 'error_message', error_msg)  # type: ignore
                setattr(step_execution, 'output_data', {"task_created": False, "error": error_msg})  # type: ignore
                return False

            task_description = config.get("task_description", getattr(step_execution, 'step_name', 'Unknown Step'))
            # Add workflow instance context to description
            task_description += f" (Workflow: {getattr(instance, 'name', 'Unknown')} - Step: {getattr(step_execution, 'step_name', 'Unknown Step')})"

            due_date_str = config.get("due_date")
            due_date = datetime.fromisoformat(due_date_str) if due_date_str else None

            estimated_effort = config.get("estimated_effort_hours")

            # Create TaskCreate schema object
            task_data = TaskCreate()  # type: ignore
            setattr(task_data, 'description', task_description)  # type: ignore
            setattr(task_data, 'source_type', "workflow_human_task")  # type: ignore
            setattr(task_data, 'source_identifier', f"wf_instance:{getattr(instance, 'id', 'unknown')}_step_exec:{getattr(step_execution, 'id', 'unknown')}")  # type: ignore
            setattr(task_data, 'status', "suggested")  # type: ignore
            setattr(task_data, 'notes', f"Generated from workflow instance {getattr(instance, 'id', 'unknown')}, step {getattr(step_execution, 'step_id', 'unknown')}. Config: {json.dumps(config)}")  # type: ignore
            setattr(task_data, 'due_date_inferred', due_date)  # type: ignore
            setattr(task_data, 'deadline', due_date)  # type: ignore
            setattr(task_data, 'estimated_effort_hours', estimated_effort)  # type: ignore
            setattr(task_data, 'assigned_resource_id', assignee_id)  # type: ignore

            # user_id for task_crud.create_task is the owner/creator of the task record,
            # which can be the assignee themselves or a system/initiator user.
            # Let's use assignee_id as the user_id for the task itself.
            if isinstance(assignee_id, int):
                created_task = task_crud.create_task(db=self.db, task=task_data, user_id=assignee_id)
            else:
                created_task = None

            if created_task:
                setattr(step_execution, 'output_data', {  # type: ignore
                    "task_created": True,
                    "task_id": getattr(created_task, 'id', None),
                    "task_assignee_id": assignee_id,
                    "task_due_date": str(getattr(created_task, 'deadline', None)) if getattr(created_task, 'deadline', None) else None
                })
                # Re-prioritize tasks for the assignee
                if self.task_prioritization_service and hasattr(self.task_prioritization_service, 'reprioritize_affected_tasks'):
                    reprioritize_method = getattr(self.task_prioritization_service, 'reprioritize_affected_tasks')
                    if isinstance(assignee_id, int) and callable(reprioritize_method):
                        reprioritize_method(user_id=assignee_id)

                # The task is created. The workflow step is considered "completed" once the task is generated.
                # The actual completion of the human work will be tracked by the Task's status.
                # The workflow might need a mechanism to wait for the task completion if subsequent steps depend on it.
                # This could be a `WorkflowStepStatus.WAITING` and an external trigger (e.g., webhook when task is done).
                # For now, generating the task means this step of the workflow is done.
                return True
            else:
                error_msg = "Failed to create task for human_task step."
                setattr(step_execution, 'error_message', error_msg)  # type: ignore
                setattr(step_execution, 'output_data', {"task_created": False, "error": error_msg})  # type: ignore
                return False

        except Exception as e:
            error_msg = f"Error executing human_task step: {str(e)}"
            setattr(step_execution, 'error_message', error_msg)  # type: ignore
            setattr(step_execution, 'output_data', {"task_created": False, "error": error_msg})  # type: ignore
            # Optionally, log the full traceback here
            return False

    def _execute_action_step(self, step_execution: WorkflowStepExecution, instance: WorkflowInstance) -> bool:
        """
        Execute an action step
        """
        # Simulate action execution
        setattr(step_execution, 'output_data', {"result": "Action executed successfully"})  # type: ignore
        return True
    
    def _execute_condition_step(self, step_execution: WorkflowStepExecution, instance: WorkflowInstance) -> bool:
        """
        Execute a condition step
        """
        # Simulate condition evaluation
        setattr(step_execution, 'output_data', {"condition_result": True})  # type: ignore
        return True
    
    def _execute_notification_step(self, step_execution: WorkflowStepExecution, instance: WorkflowInstance) -> bool:
        """
        Execute a notification step
        """
        # Simulate notification sending
        setattr(step_execution, 'output_data', {"notification_sent": True})  # type: ignore
        return True
    
    def _execute_integration_step(self, step_execution: WorkflowStepExecution, instance: WorkflowInstance) -> bool:
        """
        Execute an integration step
        """
        # Simulate integration call
        setattr(step_execution, 'output_data', {"integration_result": "Success"})  # type: ignore
        return True
    
    def _check_rate_limit(self, rule: AutomationRule) -> bool:
        """
        Check if automation rule is within rate limits
        """
        # Check executions in the last hour
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        recent_executions = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.triggered_by == f"automation_rule_{getattr(rule, 'id', 0)}",
            WorkflowInstance.created_at >= one_hour_ago
        ).count()
        
        return recent_executions < getattr(rule, 'rate_limit', 100)
    
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
            
            trigger_value = trigger_data.get(field) if field else None
            
            if operator == "equals" and trigger_value != value:
                return False
            elif operator == "greater_than" and (trigger_value is None or value is None or trigger_value <= value):
                return False
            elif operator == "less_than" and (trigger_value is None or value is None or trigger_value >= value):
                return False
            elif operator == "contains" and value is not None and value not in str(trigger_value or ''):
                return False
        
        return True
    
    def _execute_action_test(self, action: WorkflowAction, test_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute action test
        """
        # Simulate action test execution based on action type
        action_type = getattr(action, 'action_type', 'unknown')
        
        if action_type == "email":
            return {
                "success": True,
                "message": "Email test successful",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        elif action_type == "api_call":
            return {
                "success": True,
                "message": "API call test successful",
                "response_time": 150,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        elif action_type == "database":
            return {
                "success": True,
                "message": "Database operation test successful",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        else:
            return {
                "success": True,
                "message": f"Test successful for action type: {action_type}",
                "timestamp": datetime.now(timezone.utc).isoformat()
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
        
        # Create a minimal workflow service for template initialization
        # In production, proper service dependencies would be injected
        workflow_service = WorkflowAutomationService(self.db, None, None)  # type: ignore
        
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