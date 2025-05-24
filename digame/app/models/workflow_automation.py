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


class WorkflowTemplate(Base):
    """
    Reusable workflow templates for business process automation
    """
    __tablename__ = "workflow_templates"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Template information
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    category = Column(String(100), nullable=False, index=True)  # approval, data_processing, notification, etc.
    version = Column(String(20), default="1.0")
    
    # Template configuration
    workflow_definition = Column(JSON, nullable=False)  # Complete workflow structure
    input_schema = Column(JSON, default={})  # Expected input parameters
    output_schema = Column(JSON, default={})  # Expected output structure
    
    # Template metadata
    complexity_level = Column(String(20), default="simple")  # simple, medium, complex
    estimated_duration = Column(Integer)  # Estimated execution time in minutes
    tags = Column(JSON, default=[])
    
    # Template settings
    is_public = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    requires_approval = Column(Boolean, default=False)
    
    # Usage tracking
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    avg_execution_time = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant")
    creator = relationship("User")
    workflow_instances = relationship("WorkflowInstance", back_populates="template", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<WorkflowTemplate(id={self.id}, name='{self.name}', category='{self.category}')>"


class WorkflowInstance(Base):
    """
    Individual workflow execution instances
    """
    __tablename__ = "workflow_instances"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    template_id = Column(Integer, ForeignKey("workflow_templates.id"), nullable=False, index=True)
    
    # Instance information
    name = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(String(20), default="draft", index=True)
    
    # Execution context
    input_data = Column(JSON, default={})
    output_data = Column(JSON, default={})
    context_data = Column(JSON, default={})  # Runtime context and variables
    
    # Execution tracking
    current_step_id = Column(String(100))
    progress_percentage = Column(Float, default=0.0)
    steps_completed = Column(Integer, default=0)
    steps_total = Column(Integer, default=0)
    
    # Performance metrics
    execution_start_time = Column(DateTime(timezone=True))
    execution_end_time = Column(DateTime(timezone=True))
    execution_duration = Column(Float)  # Duration in seconds
    
    # Error handling
    error_count = Column(Integer, default=0)
    last_error = Column(Text)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    
    # Execution metadata
    triggered_by = Column(String(100))  # user_id, automation_rule_id, webhook, etc.
    priority = Column(Integer, default=5)  # 1-10 priority scale
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant")
    template = relationship("WorkflowTemplate", back_populates="workflow_instances")
    step_executions = relationship("WorkflowStepExecution", back_populates="workflow_instance", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<WorkflowInstance(id={self.id}, name='{self.name}', status='{self.status}')>"


class WorkflowStepExecution(Base):
    """
    Individual step execution within a workflow instance
    """
    __tablename__ = "workflow_step_executions"

    id = Column(Integer, primary_key=True, index=True)
    workflow_instance_id = Column(Integer, ForeignKey("workflow_instances.id"), nullable=False, index=True)
    
    # Step identification
    step_id = Column(String(100), nullable=False)  # Unique step identifier within workflow
    step_name = Column(String(200), nullable=False)
    step_type = Column(String(50), nullable=False)
    
    # Step configuration
    step_config = Column(JSON, default={})
    input_data = Column(JSON, default={})
    output_data = Column(JSON, default={})
    
    # Execution tracking
    status = Column(String(20), default="pending")
    execution_order = Column(Integer, nullable=False)
    
    # Performance metrics
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    execution_duration = Column(Float)  # Duration in seconds
    
    # Error handling
    error_message = Column(Text)
    error_details = Column(JSON)
    retry_count = Column(Integer, default=0)
    
    # Step metadata
    assigned_to = Column(Integer, ForeignKey("users.id"))  # For human tasks
    due_date = Column(DateTime(timezone=True))  # For time-sensitive steps
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workflow_instance = relationship("WorkflowInstance", back_populates="step_executions")
    assignee = relationship("User")
    
    def __repr__(self):
        return f"<WorkflowStepExecution(id={self.id}, step_name='{self.step_name}', status='{self.status}')>"


class AutomationRule(Base):
    """
    Automation rules for triggering workflows based on events or conditions
    """
    __tablename__ = "automation_rules"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Rule information
    name = Column(String(200), nullable=False)
    description = Column(Text)
    trigger_type = Column(String(50), nullable=False)
    
    # Trigger configuration
    trigger_config = Column(JSON, nullable=False)  # Event filters, conditions, schedule
    conditions = Column(JSON, default=[])  # Additional conditions to evaluate
    
    # Action configuration
    workflow_template_id = Column(Integer, ForeignKey("workflow_templates.id"), nullable=False)
    action_config = Column(JSON, default={})  # Workflow input parameters
    
    # Rule settings
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=5)
    rate_limit = Column(Integer, default=100)  # Max executions per hour
    
    # Execution tracking
    total_executions = Column(Integer, default=0)
    successful_executions = Column(Integer, default=0)
    failed_executions = Column(Integer, default=0)
    last_execution = Column(DateTime(timezone=True))
    
    # Performance metrics
    avg_execution_time = Column(Float, default=0.0)
    success_rate = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant")
    workflow_template = relationship("WorkflowTemplate")
    creator = relationship("User")
    
    def __repr__(self):
        return f"<AutomationRule(id={self.id}, name='{self.name}', trigger_type='{self.trigger_type}')>"


class WorkflowAction(Base):
    """
    Predefined actions that can be used in workflows
    """
    __tablename__ = "workflow_actions"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Action information
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)  # notification, data, integration, etc.
    action_type = Column(String(100), nullable=False)  # email, api_call, database, etc.
    
    # Action configuration
    config_schema = Column(JSON, nullable=False)  # JSON schema for configuration
    default_config = Column(JSON, default={})
    
    # Action metadata
    is_system_action = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    requires_auth = Column(Boolean, default=False)
    
    # Usage tracking
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    avg_execution_time = Column(Float, default=0.0)
    
    # Validation and testing
    test_config = Column(JSON, default={})  # Configuration for testing the action
    last_tested = Column(DateTime(timezone=True))
    test_success = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    tenant = relationship("Tenant")
    creator = relationship("User")
    
    def __repr__(self):
        return f"<WorkflowAction(id={self.id}, name='{self.name}', action_type='{self.action_type}')>"


class WorkflowIntegration(Base):
    """
    External system integrations for workflow automation
    """
    __tablename__ = "workflow_integrations"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Integration information
    name = Column(String(200), nullable=False)
    description = Column(Text)
    integration_type = Column(String(100), nullable=False)  # api, database, file_system, etc.
    
    # Connection configuration
    connection_config = Column(JSON, nullable=False)  # Connection parameters
    auth_config = Column(JSON, default={})  # Authentication configuration
    
    # Integration settings
    is_active = Column(Boolean, default=True)
    timeout_seconds = Column(Integer, default=30)
    retry_attempts = Column(Integer, default=3)
    
    # Health monitoring
    last_health_check = Column(DateTime(timezone=True))
    health_status = Column(String(20), default="unknown")  # healthy, unhealthy, unknown
    health_details = Column(JSON, default={})
    
    # Performance metrics
    total_requests = Column(Integer, default=0)
    successful_requests = Column(Integer, default=0)
    failed_requests = Column(Integer, default=0)
    avg_response_time = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant")
    creator = relationship("User")
    
    def __repr__(self):
        return f"<WorkflowIntegration(id={self.id}, name='{self.name}', integration_type='{self.integration_type}')>"