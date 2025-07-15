"""
Workflow Automation models for business process automation and workflow management
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
from typing import Optional, Dict, Any, List
from datetime import datetime
import enum


class WorkflowStatus(enum.Enum):
    """Workflow execution status"""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class WorkflowStepType(enum.Enum):
    """Types of workflow steps"""
    ACTION = "action"
    CONDITION = "condition"
    LOOP = "loop"
    PARALLEL = "parallel"
    HUMAN_TASK = "human_task"
    INTEGRATION = "integration"
    APPROVAL = "approval"
    NOTIFICATION = "notification"


class WorkflowStepStatus(enum.Enum):
    """Workflow step execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    WAITING = "waiting"


class AutomationTriggerType(enum.Enum):
    """Types of automation triggers"""
    EVENT_BASED = "event_based"
    SCHEDULED = "scheduled"
    CONDITIONAL = "conditional"
    WEBHOOK = "webhook"
    API_CALL = "api_call"
    MANUAL = "manual"


class WorkflowTemplate(Base):  # type: ignore
    """
    Reusable workflow templates for business process automation
    """
    __tablename__ = "workflow_templates"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    
    # Template information
    name = Column(String(200), nullable=False, index=True)  # type: ignore
    description = Column(Text)  # type: ignore
    category = Column(String(100), nullable=False, index=True)  # type: ignore  # approval, data_processing, notification, etc.
    version = Column(String(20), default="1.0")  # type: ignore
    
    # Template configuration
    workflow_definition = Column(JSON, nullable=False)  # type: ignore  # Complete workflow structure
    input_schema = Column(JSON, default={})  # type: ignore  # Expected input parameters
    output_schema = Column(JSON, default={})  # type: ignore  # Expected output structure
    
    # Template metadata
    complexity_level = Column(String(20), default="simple")  # type: ignore  # simple, medium, complex
    estimated_duration = Column(Integer)  # type: ignore  # Estimated execution time in minutes
    tags = Column(JSON, default=[])  # type: ignore
    
    # Template settings
    is_public = Column(Boolean, default=False)  # type: ignore
    is_active = Column(Boolean, default=True)  # type: ignore
    requires_approval = Column(Boolean, default=False)  # type: ignore
    
    # Usage tracking
    usage_count = Column(Integer, default=0)  # type: ignore
    success_rate = Column(Float, default=0.0)  # type: ignore
    avg_execution_time = Column(Float, default=0.0)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  # type: ignore
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)  # type: ignore
    
    # Relationships
    # tenant = relationship("Tenant")  # Temporarily disabled due to registry conflicts
    creator = relationship("User")
    workflow_instances = relationship("WorkflowInstance", back_populates="template", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<WorkflowTemplate(id={self.id}, name='{self.name}', category='{self.category}')>"


class WorkflowInstance(Base):  # type: ignore
    """
    Individual workflow execution instances
    """
    __tablename__ = "workflow_instances"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    template_id = Column(Integer, ForeignKey("workflow_templates.id"), nullable=False, index=True)  # type: ignore
    
    # Instance information
    name = Column(String(200), nullable=False)  # type: ignore
    description = Column(Text)  # type: ignore
    status = Column(String(20), default="draft", index=True)  # type: ignore
    
    # Execution context
    input_data = Column(JSON, default={})  # type: ignore
    output_data = Column(JSON, default={})  # type: ignore
    context_data = Column(JSON, default={})  # type: ignore  # Runtime context and variables
    
    # Execution tracking
    current_step_id = Column(String(100))  # type: ignore
    progress_percentage = Column(Float, default=0.0)  # type: ignore
    steps_completed = Column(Integer, default=0)  # type: ignore
    steps_total = Column(Integer, default=0)  # type: ignore
    
    # Performance metrics
    execution_start_time = Column(DateTime(timezone=True))  # type: ignore
    execution_end_time = Column(DateTime(timezone=True))  # type: ignore
    execution_duration = Column(Float)  # type: ignore  # Duration in seconds
    
    # Error handling
    error_count = Column(Integer, default=0)  # type: ignore
    last_error = Column(Text)  # type: ignore
    retry_count = Column(Integer, default=0)  # type: ignore
    max_retries = Column(Integer, default=3)  # type: ignore
    
    # Execution metadata
    triggered_by = Column(String(100))  # type: ignore  # user_id, automation_rule_id, webhook, etc.
    priority = Column(Integer, default=5)  # type: ignore  # 1-10 priority scale
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  # type: ignore
    
    # Relationships
    # tenant = relationship("Tenant")  # Temporarily disabled due to registry conflicts
    template = relationship("WorkflowTemplate", back_populates="workflow_instances")
    step_executions = relationship("WorkflowStepExecution", back_populates="workflow_instance", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<WorkflowInstance(id={self.id}, name='{self.name}', status='{self.status}')>"


class WorkflowStepExecution(Base):  # type: ignore
    """
    Individual step execution within a workflow instance
    """
    __tablename__ = "workflow_step_executions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    workflow_instance_id = Column(Integer, ForeignKey("workflow_instances.id"), nullable=False, index=True)  # type: ignore
    
    # Step identification
    step_id = Column(String(100), nullable=False)  # type: ignore  # Unique step identifier within workflow
    step_name = Column(String(200), nullable=False)  # type: ignore
    step_type = Column(String(50), nullable=False)  # type: ignore
    
    # Step configuration
    step_config = Column(JSON, default={})  # type: ignore
    input_data = Column(JSON, default={})  # type: ignore
    output_data = Column(JSON, default={})  # type: ignore
    
    # Execution tracking
    status = Column(String(20), default="pending")  # type: ignore
    execution_order = Column(Integer, nullable=False)  # type: ignore
    
    # Performance metrics
    start_time = Column(DateTime(timezone=True))  # type: ignore
    end_time = Column(DateTime(timezone=True))  # type: ignore
    execution_duration = Column(Float)  # type: ignore  # Duration in seconds
    
    # Error handling
    error_message = Column(Text)  # type: ignore
    error_details = Column(JSON)  # type: ignore
    retry_count = Column(Integer, default=0)  # type: ignore
    
    # Step metadata
    assigned_to = Column(Integer, ForeignKey("users.id"))  # type: ignore  # For human tasks
    due_date = Column(DateTime(timezone=True))  # type: ignore  # For time-sensitive steps
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  # type: ignore
    
    # Relationships
    workflow_instance = relationship("WorkflowInstance", back_populates="step_executions")
    assignee = relationship("User")
    
    def __repr__(self):
        return f"<WorkflowStepExecution(id={self.id}, step_name='{self.step_name}', status='{self.status}')>"


class AutomationRule(Base):  # type: ignore
    """
    Automation rules for triggering workflows based on events or conditions
    """
    __tablename__ = "automation_rules"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    
    # Rule information
    name = Column(String(200), nullable=False)  # type: ignore
    description = Column(Text)  # type: ignore
    trigger_type = Column(String(50), nullable=False)  # type: ignore
    
    # Trigger configuration
    trigger_config = Column(JSON, nullable=False)  # type: ignore  # Event filters, conditions, schedule
    conditions = Column(JSON, default=[])  # type: ignore  # Additional conditions to evaluate
    
    # Action configuration
    workflow_template_id = Column(Integer, ForeignKey("workflow_templates.id"), nullable=False)  # type: ignore
    action_config = Column(JSON, default={})  # type: ignore  # Workflow input parameters
    
    # Rule settings
    is_active = Column(Boolean, default=True)  # type: ignore
    priority = Column(Integer, default=5)  # type: ignore
    rate_limit = Column(Integer, default=100)  # type: ignore  # Max executions per hour
    
    # Execution tracking
    total_executions = Column(Integer, default=0)  # type: ignore
    successful_executions = Column(Integer, default=0)  # type: ignore
    failed_executions = Column(Integer, default=0)  # type: ignore
    last_execution = Column(DateTime(timezone=True))  # type: ignore
    
    # Performance metrics
    avg_execution_time = Column(Float, default=0.0)  # type: ignore
    success_rate = Column(Float, default=0.0)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  # type: ignore
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)  # type: ignore
    
    # Relationships
    # tenant = relationship("Tenant")  # Temporarily disabled due to registry conflicts
    workflow_template = relationship("WorkflowTemplate")
    creator = relationship("User")
    
    def __repr__(self):
        return f"<AutomationRule(id={self.id}, name='{self.name}', trigger_type='{self.trigger_type}')>"


class WorkflowAction(Base):  # type: ignore
    """
    Predefined actions that can be used in workflows
    """
    __tablename__ = "workflow_actions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    
    # Action information
    name = Column(String(200), nullable=False)  # type: ignore
    description = Column(Text)  # type: ignore
    category = Column(String(100), nullable=False)  # type: ignore  # notification, data, integration, etc.
    action_type = Column(String(100), nullable=False)  # type: ignore  # email, api_call, database, etc.
    
    # Action configuration
    config_schema = Column(JSON, nullable=False)  # type: ignore  # JSON schema for configuration
    default_config = Column(JSON, default={})  # type: ignore
    
    # Action metadata
    is_system_action = Column(Boolean, default=False)  # type: ignore
    is_active = Column(Boolean, default=True)  # type: ignore
    requires_auth = Column(Boolean, default=False)  # type: ignore
    
    # Usage tracking
    usage_count = Column(Integer, default=0)  # type: ignore
    success_rate = Column(Float, default=0.0)  # type: ignore
    avg_execution_time = Column(Float, default=0.0)  # type: ignore
    
    # Validation and testing
    test_config = Column(JSON, default={})  # type: ignore  # Configuration for testing the action
    last_tested = Column(DateTime(timezone=True))  # type: ignore
    test_success = Column(Boolean, default=False)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  # type: ignore
    created_by = Column(Integer, ForeignKey("users.id"))  # type: ignore
    
    # Relationships
    # tenant = relationship("Tenant")  # Temporarily disabled due to registry conflicts
    creator = relationship("User")
    
    def __repr__(self):
        return f"<WorkflowAction(id={self.id}, name='{self.name}', action_type='{self.action_type}')>"


class WorkflowIntegration(Base):  # type: ignore
    """
    External system integrations for workflow automation
    """
    __tablename__ = "workflow_integrations"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    
    # Integration information
    name = Column(String(200), nullable=False)  # type: ignore
    description = Column(Text)  # type: ignore
    integration_type = Column(String(100), nullable=False)  # type: ignore  # api, database, file_system, etc.
    
    # Connection configuration
    connection_config = Column(JSON, nullable=False)  # type: ignore  # Connection parameters
    auth_config = Column(JSON, default={})  # type: ignore  # Authentication configuration
    
    # Integration settings
    is_active = Column(Boolean, default=True)  # type: ignore
    timeout_seconds = Column(Integer, default=30)  # type: ignore
    retry_attempts = Column(Integer, default=3)  # type: ignore
    
    # Health monitoring
    last_health_check = Column(DateTime(timezone=True))  # type: ignore
    health_status = Column(String(20), default="unknown")  # type: ignore  # healthy, unhealthy, unknown
    health_details = Column(JSON, default={})  # type: ignore
    
    # Performance metrics
    total_requests = Column(Integer, default=0)  # type: ignore
    successful_requests = Column(Integer, default=0)  # type: ignore
    failed_requests = Column(Integer, default=0)  # type: ignore
    avg_response_time = Column(Float, default=0.0)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  # type: ignore
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)  # type: ignore
    
    # Relationships
    # tenant = relationship("Tenant")  # Temporarily disabled due to registry conflicts
    creator = relationship("User")
    
    def __repr__(self):
        return f"<WorkflowIntegration(id={self.id}, name='{self.name}', integration_type='{self.integration_type}')>"


class WorkflowReportConfig(Base):  # type: ignore
    """
    Configuration for automatically generating reports based on workflow events.
    Links a WorkflowTemplate to a ReportDefinition.
    """
    __tablename__ = "workflow_report_configs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore

    name = Column(String(255), nullable=False)  # type: ignore
    description = Column(Text, nullable=True)  # type: ignore

    workflow_template_id = Column(Integer, ForeignKey("workflow_templates.id"), nullable=False, index=True)  # type: ignore
    report_definition_id = Column(Integer, ForeignKey("report_definitions.id"), nullable=False, index=True)  # type: ignore # From dashboard_custom.py

    # Triggering event for report generation
    # Examples: "on_workflow_completion", "on_workflow_failure", "on_step_completion", "on_step_failure"
    # Could also include specific step_ids if needed: {"event": "on_step_completion", "step_id": "xyz"}
    trigger_event_type = Column(String(100), nullable=False)  # type: ignore # e.g., on_workflow_completion
    trigger_event_config = Column(JSON, nullable=True)  # type: ignore # For more complex triggers, e.g. specific step_id or conditions

    # Report generation settings
    output_format_override = Column(String(50), nullable=True)  # type: ignore # e.g., pdf, csv. Overrides ReportDefinition default.
    # Delivery config can override ReportSchedule default delivery or provide ad-hoc delivery for this trigger.
    # Example: {"method": "email", "recipients": ["manager@example.com"], "subject": "Workflow {instance_name} Completed"}
    delivery_config_override = Column(JSON, nullable=True)  # type: ignore

    # Parameter mapping: How to map workflow instance data to report definition parameters
    # Example: {"report_param_name_1": "workflow_instance.input_data.customer_id",
    #           "report_param_name_2": "workflow_instance.id"}
    parameter_mapping = Column(JSON, nullable=True)  # type: ignore

    is_active = Column(Boolean, default=True)  # type: ignore
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  # type: ignore
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)  # type: ignore

    # Relationships
    # tenant = relationship("Tenant")  # Temporarily disabled due to registry conflicts
    workflow_template = relationship("WorkflowTemplate") # Add backref in WorkflowTemplate if needed
    # report_definition relationship needs to be established carefully if ReportDefinition is in a different model file.
    # Assuming ReportDefinition is imported and Base is shared, SQLAlchemy can handle this.
    # report_definition = relationship("ReportDefinition") # This might need explicit primaryjoin/foreign_keys if ambiguous
    creator = relationship("User")

    def __repr__(self):
        return f"<WorkflowReportConfig(id={self.id}, name='{self.name}', template_id={self.workflow_template_id}, report_def_id={self.report_definition_id})>"


class OptimizationRecommendation(Base):  # type: ignore
    """
    Stores recommendations for process optimization based on workflow analytics.
    """
    __tablename__ = "optimization_recommendations"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore

    recommendation_type = Column(String(100), nullable=False, index=True,  # type: ignore
                                 comment="e.g., bottleneck_detected, high_error_rate_step, new_automation_candidate, underutilized_feature")
    description = Column(Text, nullable=False, comment="Detailed description of the recommendation and the reasoning.")  # type: ignore

    # Context for the recommendation
    affected_workflow_template_id = Column(Integer, ForeignKey("workflow_templates.id"), nullable=True, index=True)  # type: ignore
    affected_workflow_instance_id = Column(Integer, ForeignKey("workflow_instances.id"), nullable=True, index=True)  # type: ignore # If specific to an instance
    affected_step_id = Column(String(100), nullable=True, comment="Specific step ID within a workflow if applicable.")  # type: ignore

    # Suggested actions and potential impact
    suggested_actions = Column(JSON, nullable=True, comment="List of suggested actions, e.g., ['review_step_config', 'add_error_handling', 'increase_timeout']")  # type: ignore
    potential_impact_score = Column(Float, nullable=True, comment="A score (e.g., 0-1) indicating potential positive impact if implemented.")  # type: ignore
    confidence_score = Column(Float, nullable=True, comment="Confidence in this recommendation (e.g., 0-1).")  # type: ignore

    # Status and metadata
    status = Column(String(50), default="new", index=True, comment="e.g., new, viewed, investigating, implemented, dismissed")  # type: ignore
    priority = Column(Integer, default=5, comment="Priority of the recommendation (1-10, 1 highest)")  # type: ignore

    generated_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    last_reviewed_at = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # type: ignore

    # Relationships
    # tenant = relationship("Tenant")  # Temporarily disabled due to registry conflicts
    workflow_template = relationship("WorkflowTemplate") # Use foreign_keys if multiple FKs to same table exist elsewhere
    workflow_instance = relationship("WorkflowInstance")
    reviewer = relationship("User") # User who reviewed the recommendation

    def __repr__(self):
        return f"<OptimizationRecommendation(id={self.id}, type='{self.recommendation_type}', tenant_id={self.tenant_id})>"