"""
Workflow Automation models for business process automation and workflow management
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

# Use the existing Base from the project
try:
    from ..database import Base
except ImportError:
    # Fallback for development
    Base = declarative_base()


class WorkflowTemplate(Base):
    """
    Workflow templates defining reusable business processes
    """
    __tablename__ = "workflow_templates"

    id = Column(Integer, primary_key=True, index=True)
    template_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Template metadata
    template_name = Column(String(255), nullable=False, index=True)
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)  # approval, notification, data_processing, integration
    
    # Template configuration
    version = Column(String(50), default="1.0.0")
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False)  # Available to all tenants
    complexity_level = Column(String(50), default="medium")  # simple, medium, complex, advanced
    
    # Workflow definition
    workflow_definition = Column(JSON, default={})  # Complete workflow structure
    input_schema = Column(JSON, default={})  # Expected input parameters
    output_schema = Column(JSON, default={})  # Expected output format
    variables = Column(JSON, default={})  # Template variables and defaults
    
    # Steps and flow
    steps = Column(JSON, default=[])  # Ordered list of workflow steps
    conditions = Column(JSON, default={})  # Conditional logic and branching
    triggers = Column(JSON, default=[])  # Trigger conditions and events
    
    # Execution settings
    timeout_minutes = Column(Integer, default=60)
    retry_attempts = Column(Integer, default=3)
    retry_delay_seconds = Column(Integer, default=30)
    parallel_execution = Column(Boolean, default=False)
    
    # Performance and usage
    estimated_duration_minutes = Column(Integer, nullable=True)
    success_rate = Column(Float, default=0.0)  # Historical success rate
    usage_count = Column(Integer, default=0)
    last_used_at = Column(DateTime, nullable=True)
    
    # Tags and categorization
    tags = Column(JSON, default=[])
    industry_tags = Column(JSON, default=[])
    use_cases = Column(JSON, default=[])
    
    # Validation and testing
    is_validated = Column(Boolean, default=False)
    validation_date = Column(DateTime, nullable=True)
    test_results = Column(JSON, default={})
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    workflow_instances = relationship("WorkflowInstance", back_populates="template")
    automation_rules = relationship("AutomationRule", back_populates="workflow_template")

    def __repr__(self):
        return f"<WorkflowTemplate(id={self.id}, name='{self.template_name}', category='{self.category}')>"

    @property
    def step_count(self):
        """Get number of steps in workflow"""
        return len(self.steps) if self.steps else 0

    @property
    def has_conditions(self):
        """Check if workflow has conditional logic"""
        return bool(self.conditions)

    @property
    def is_complex(self):
        """Check if workflow is complex"""
        return self.complexity_level in ["complex", "advanced"] or self.step_count > 10

    def update_usage_stats(self, success: bool):
        """Update usage statistics"""
        self.usage_count += 1
        self.last_used_at = datetime.utcnow()
        
        # Update success rate
        if self.usage_count == 1:
            self.success_rate = 1.0 if success else 0.0
        else:
            # Weighted average with recent executions having more weight
            weight = 0.1  # 10% weight for new execution
            self.success_rate = (1 - weight) * self.success_rate + weight * (1.0 if success else 0.0)


class WorkflowInstance(Base):
    """
    Individual workflow execution instances
    """
    __tablename__ = "workflow_instances"

    id = Column(Integer, primary_key=True, index=True)
    instance_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    template_id = Column(Integer, ForeignKey("workflow_templates.id"), nullable=False, index=True)
    
    # Instance metadata
    instance_name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    priority = Column(String(50), default="medium")  # low, medium, high, urgent
    
    # Execution details
    status = Column(String(50), default="pending")  # pending, running, completed, failed, cancelled, paused
    execution_mode = Column(String(50), default="automatic")  # automatic, manual, scheduled, triggered
    
    # Input and output
    input_data = Column(JSON, default={})
    output_data = Column(JSON, default={})
    context_data = Column(JSON, default={})  # Additional context and variables
    
    # Timing
    scheduled_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Progress tracking
    current_step = Column(Integer, default=0)
    total_steps = Column(Integer, default=0)
    progress_percentage = Column(Float, default=0.0)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    error_details = Column(JSON, default={})
    retry_count = Column(Integer, default=0)
    last_retry_at = Column(DateTime, nullable=True)
    
    # Execution log
    execution_log = Column(JSON, default=[])  # Step-by-step execution log
    performance_metrics = Column(JSON, default={})
    
    # User and automation
    triggered_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    triggered_by_automation_id = Column(Integer, ForeignKey("automation_rules.id"), nullable=True)
    parent_instance_id = Column(Integer, ForeignKey("workflow_instances.id"), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    template = relationship("WorkflowTemplate", back_populates="workflow_instances")
    step_executions = relationship("WorkflowStepExecution", back_populates="workflow_instance")
    child_instances = relationship("WorkflowInstance", backref="parent_instance", remote_side=[id])

    def __repr__(self):
        return f"<WorkflowInstance(id={self.id}, status='{self.status}', template_id={self.template_id})>"

    @property
    def is_running(self):
        """Check if workflow is currently running"""
        return self.status in ["pending", "running", "paused"]

    @property
    def is_completed(self):
        """Check if workflow is completed (success or failure)"""
        return self.status in ["completed", "failed", "cancelled"]

    @property
    def execution_time(self):
        """Get execution time in seconds"""
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        elif self.started_at:
            return (datetime.utcnow() - self.started_at).total_seconds()
        return 0

    def update_progress(self, step: int, total: int, message: str = None):
        """Update workflow progress"""
        self.current_step = step
        self.total_steps = total
        self.progress_percentage = (step / total * 100) if total > 0 else 0
        
        if message:
            self.execution_log.append({
                "timestamp": datetime.utcnow().isoformat(),
                "step": step,
                "message": message
            })

    def mark_completed(self, success: bool, output_data: dict = None, error_message: str = None):
        """Mark workflow as completed"""
        self.completed_at = datetime.utcnow()
        self.duration_seconds = int(self.execution_time)
        self.status = "completed" if success else "failed"
        
        if output_data:
            self.output_data = output_data
        
        if error_message:
            self.error_message = error_message


class WorkflowStepExecution(Base):
    """
    Individual step execution within a workflow instance
    """
    __tablename__ = "workflow_step_executions"

    id = Column(Integer, primary_key=True, index=True)
    execution_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    workflow_instance_id = Column(Integer, ForeignKey("workflow_instances.id"), nullable=False, index=True)
    
    # Step details
    step_name = Column(String(255), nullable=False)
    step_type = Column(String(100), nullable=False)  # action, condition, loop, parallel, human_task
    step_order = Column(Integer, nullable=False)
    
    # Execution details
    status = Column(String(50), default="pending")  # pending, running, completed, failed, skipped
    input_data = Column(JSON, default={})
    output_data = Column(JSON, default={})
    
    # Timing
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    error_details = Column(JSON, default={})
    retry_count = Column(Integer, default=0)
    
    # Step configuration
    step_config = Column(JSON, default={})
    conditions_met = Column(Boolean, nullable=True)
    
    # Human task details (if applicable)
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    human_task_data = Column(JSON, default={})
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    workflow_instance = relationship("WorkflowInstance", back_populates="step_executions")

    def __repr__(self):
        return f"<WorkflowStepExecution(id={self.id}, step='{self.step_name}', status='{self.status}')>"

    @property
    def execution_time(self):
        """Get step execution time in seconds"""
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        elif self.started_at:
            return (datetime.utcnow() - self.started_at).total_seconds()
        return 0

    def mark_completed(self, success: bool, output_data: dict = None, error_message: str = None):
        """Mark step as completed"""
        self.completed_at = datetime.utcnow()
        self.duration_seconds = int(self.execution_time)
        self.status = "completed" if success else "failed"
        
        if output_data:
            self.output_data = output_data
        
        if error_message:
            self.error_message = error_message


class AutomationRule(Base):
    """
    Automation rules for triggering workflows based on events or conditions
    """
    __tablename__ = "automation_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    workflow_template_id = Column(Integer, ForeignKey("workflow_templates.id"), nullable=False, index=True)
    
    # Rule metadata
    rule_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=100)  # Lower number = higher priority
    
    # Trigger configuration
    trigger_type = Column(String(100), nullable=False)  # event, schedule, condition, webhook, api
    trigger_config = Column(JSON, default={})
    
    # Event triggers
    event_types = Column(JSON, default=[])  # List of event types to listen for
    event_filters = Column(JSON, default={})  # Filters for event data
    
    # Schedule triggers
    schedule_type = Column(String(50), nullable=True)  # cron, interval, once
    schedule_config = Column(JSON, default={})  # Cron expression or interval config
    next_run_at = Column(DateTime, nullable=True)
    last_run_at = Column(DateTime, nullable=True)
    
    # Condition triggers
    conditions = Column(JSON, default=[])  # List of conditions to evaluate
    condition_logic = Column(String(50), default="AND")  # AND, OR
    
    # Input mapping
    input_mapping = Column(JSON, default={})  # How to map trigger data to workflow input
    default_input = Column(JSON, default={})  # Default input values
    
    # Execution settings
    max_concurrent_executions = Column(Integer, default=1)
    execution_timeout_minutes = Column(Integer, default=60)
    retry_failed_executions = Column(Boolean, default=True)
    
    # Rate limiting
    rate_limit_enabled = Column(Boolean, default=False)
    rate_limit_count = Column(Integer, nullable=True)
    rate_limit_period_minutes = Column(Integer, nullable=True)
    
    # Statistics
    execution_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    failure_count = Column(Integer, default=0)
    last_execution_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    workflow_template = relationship("WorkflowTemplate", back_populates="automation_rules")

    def __repr__(self):
        return f"<AutomationRule(id={self.id}, name='{self.rule_name}', trigger='{self.trigger_type}')>"

    @property
    def success_rate(self):
        """Calculate success rate"""
        if self.execution_count == 0:
            return 0.0
        return (self.success_count / self.execution_count) * 100

    @property
    def is_scheduled(self):
        """Check if rule is schedule-based"""
        return self.trigger_type == "schedule"

    @property
    def is_due(self):
        """Check if scheduled rule is due for execution"""
        if not self.is_scheduled or not self.next_run_at:
            return False
        return datetime.utcnow() >= self.next_run_at

    def update_execution_stats(self, success: bool):
        """Update execution statistics"""
        self.execution_count += 1
        self.last_execution_at = datetime.utcnow()
        
        if success:
            self.success_count += 1
        else:
            self.failure_count += 1

    def calculate_next_run(self):
        """Calculate next run time for scheduled rules"""
        if not self.is_scheduled:
            return
        
        # Implementation would depend on schedule_config
        # This is a simplified version
        if self.schedule_type == "interval":
            interval_minutes = self.schedule_config.get("interval_minutes", 60)
            self.next_run_at = datetime.utcnow() + timedelta(minutes=interval_minutes)


class WorkflowAction(Base):
    """
    Predefined actions that can be used in workflows
    """
    __tablename__ = "workflow_actions"

    id = Column(Integer, primary_key=True, index=True)
    action_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)  # Null for system actions
    
    # Action metadata
    action_name = Column(String(255), nullable=False, index=True)
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)  # communication, data, integration, logic
    
    # Action configuration
    action_type = Column(String(100), nullable=False)  # email, api_call, database, file_operation, etc.
    is_system_action = Column(Boolean, default=False)  # Built-in system action
    is_custom = Column(Boolean, default=False)  # Custom user-defined action
    
    # Input/Output schema
    input_schema = Column(JSON, default={})  # Expected input parameters
    output_schema = Column(JSON, default={})  # Expected output format
    configuration_schema = Column(JSON, default={})  # Configuration options
    
    # Implementation details
    implementation_type = Column(String(50), nullable=False)  # internal, webhook, api, script
    implementation_config = Column(JSON, default={})  # Implementation-specific config
    
    # Execution settings
    timeout_seconds = Column(Integer, default=300)
    retry_attempts = Column(Integer, default=3)
    retry_delay_seconds = Column(Integer, default=10)
    
    # Validation and testing
    is_validated = Column(Boolean, default=False)
    validation_date = Column(DateTime, nullable=True)
    test_results = Column(JSON, default={})
    
    # Usage statistics
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    average_duration_seconds = Column(Float, default=0.0)
    
    # Tags and categorization
    tags = Column(JSON, default=[])
    compatibility_tags = Column(JSON, default=[])  # Compatible systems/platforms
    
    # Status
    is_active = Column(Boolean, default=True)
    is_deprecated = Column(Boolean, default=False)
    deprecation_date = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    def __repr__(self):
        return f"<WorkflowAction(id={self.id}, name='{self.action_name}', type='{self.action_type}')>"

    @property
    def is_available(self):
        """Check if action is available for use"""
        return self.is_active and not self.is_deprecated and self.is_validated

    def update_usage_stats(self, duration_seconds: float, success: bool):
        """Update usage statistics"""
        self.usage_count += 1
        
        # Update average duration
        if self.usage_count == 1:
            self.average_duration_seconds = duration_seconds
        else:
            # Weighted average
            weight = 1.0 / self.usage_count
            self.average_duration_seconds = (1 - weight) * self.average_duration_seconds + weight * duration_seconds
        
        # Update success rate
        if self.usage_count == 1:
            self.success_rate = 1.0 if success else 0.0
        else:
            # Weighted average with recent executions having more weight
            weight = 0.1  # 10% weight for new execution
            self.success_rate = (1 - weight) * self.success_rate + weight * (1.0 if success else 0.0)


class WorkflowIntegration(Base):
    """
    External system integrations for workflow automation
    """
    __tablename__ = "workflow_integrations"

    id = Column(Integer, primary_key=True, index=True)
    integration_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Integration metadata
    integration_name = Column(String(255), nullable=False)
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    integration_type = Column(String(100), nullable=False)  # api, webhook, database, file_system, email
    
    # Connection details
    endpoint_url = Column(String(500), nullable=True)
    authentication_type = Column(String(100), nullable=True)  # api_key, oauth, basic, certificate
    credentials = Column(JSON, default={})  # Encrypted credentials
    connection_config = Column(JSON, default={})
    
    # Capabilities
    supported_actions = Column(JSON, default=[])  # List of supported actions
    supported_triggers = Column(JSON, default=[])  # List of supported triggers
    data_formats = Column(JSON, default=[])  # Supported data formats
    
    # Status and health
    is_active = Column(Boolean, default=True)
    connection_status = Column(String(50), default="unknown")  # connected, disconnected, error, unknown
    last_health_check = Column(DateTime, nullable=True)
    health_check_interval_minutes = Column(Integer, default=60)
    
    # Usage and performance
    request_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    average_response_time_ms = Column(Float, default=0.0)
    
    # Rate limiting
    rate_limit_enabled = Column(Boolean, default=False)
    rate_limit_requests_per_minute = Column(Integer, nullable=True)
    rate_limit_requests_per_hour = Column(Integer, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    def __repr__(self):
        return f"<WorkflowIntegration(id={self.id}, name='{self.integration_name}', type='{self.integration_type}')>"

    @property
    def is_healthy(self):
        """Check if integration is healthy"""
        return (
            self.is_active and
            self.connection_status == "connected" and
            self.success_rate >= 0.9
        )

    @property
    def success_rate(self):
        """Calculate success rate"""
        if self.request_count == 0:
            return 0.0
        return (self.success_count / self.request_count) * 100

    def update_performance_stats(self, response_time_ms: float, success: bool):
        """Update performance statistics"""
        self.request_count += 1
        
        if success:
            self.success_count += 1
        else:
            self.error_count += 1
        
        # Update average response time
        if self.request_count == 1:
            self.average_response_time_ms = response_time_ms
        else:
            # Weighted average
            weight = 1.0 / self.request_count
            self.average_response_time_ms = (1 - weight) * self.average_response_time_ms + weight * response_time_ms

    def mark_health_check(self, is_healthy: bool):
        """Mark health check result"""
        self.last_health_check = datetime.utcnow()
        self.connection_status = "connected" if is_healthy else "error"