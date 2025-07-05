"""
Advanced Reporting models for enterprise features
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

# Use the existing Base from the project
from ..database import Base

from .dashboard_custom import ReportDefinition # Import ReportDefinition

class Report(Base):  # type: ignore
    """
    Report definition and configuration
    """
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    report_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    
    # Report metadata
    name = Column(String(255), nullable=False)  # type: ignore
    description = Column(Text, nullable=True)  # type: ignore
    category = Column(String(100), nullable=False, index=True)  # type: ignore  # analytics, financial, operational, compliance
    report_type = Column(String(50), nullable=False)  # type: ignore  # dashboard, table, chart, pdf, excel
    
    # Report configuration
    data_source = Column(String(100), nullable=False)  # type: ignore  # users, analytics, activities, etc.
    query_config = Column(JSON, default={})  # type: ignore  # SQL query parameters, filters, etc.
    visualization_config = Column(JSON, default={})  # type: ignore  # Chart types, colors, layout, interactive elements (e.g., drilldown_fields)
    format_config = Column(JSON, default={})  # type: ignore  # PDF layout, Excel formatting, etc.
    export_config = Column(JSON, default={})  # type: ignore # Specific columns for export, data transformations, etc.
    
    # Filters and parameters
    default_filters = Column(JSON, default={})  # type: ignore
    parameter_schema = Column(JSON, default={})  # type: ignore  # Define user-configurable parameters (e.g., for interactive exploration)
    
    # Access control
    is_public = Column(Boolean, default=False)  # type: ignore  # Available to all tenant users
    allowed_roles = Column(JSON, default=[])  # type: ignore  # Specific roles that can access
    allowed_users = Column(JSON, default=[])  # type: ignore  # Specific users that can access
    
    # Scheduling
    is_scheduled = Column(Boolean, default=False)  # type: ignore
    schedule_config = Column(JSON, default={})  # type: ignore  # Cron expression, timezone, etc.
    
    # Status and metadata
    is_active = Column(Boolean, default=True)  # type: ignore
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))  # type: ignore
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))  # type: ignore
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # type: ignore
    last_generated_at = Column(DateTime, nullable=True)  # type: ignore
    generation_count = Column(Integer, default=0)  # type: ignore
    
    # Performance metrics
    avg_generation_time_ms = Column(Float, nullable=True)  # type: ignore
    last_generation_time_ms = Column(Float, nullable=True)  # type: ignore
    
    # Relationships
    executions = relationship("ReportExecution", back_populates="report", cascade="all, delete-orphan")
    schedules = relationship("ReportSchedule", back_populates="report", cascade="all, delete-orphan")
    subscriptions = relationship("ReportSubscription", back_populates="report", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Report(id={self.id}, name='{self.name}', category='{self.category}')>"

    @property
    def is_pdf_report(self):
        return self.report_type == "pdf"

    @property
    def is_excel_report(self):
        return self.report_type == "excel"

    @property
    def has_schedule(self):
        return self.is_scheduled and self.schedule_config

    def can_access(self, user_id: int, user_roles: list) -> bool:
        """Check if user can access this report"""
        if self.is_public:
            return True
        
        if user_id in self.allowed_users:
            return True
        
        if any(role in self.allowed_roles for role in user_roles):
            return True
        
        return False


class ReportExecution(Base):  # type: ignore
    """
    Report execution history and results
    """
    __tablename__ = "report_executions"

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    execution_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    
    # Execution context
    executed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # type: ignore  # Null for scheduled reports
    execution_type = Column(String(50), nullable=False)  # type: ignore  # manual, scheduled, api
    
    # Parameters and filters used
    parameters = Column(JSON, default={})  # type: ignore
    filters_applied = Column(JSON, default={})  # type: ignore
    date_range = Column(JSON, default={})  # type: ignore  # start_date, end_date
    
    # Execution details
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)  # type: ignore
    completed_at = Column(DateTime, nullable=True)  # type: ignore
    execution_time_ms = Column(Float, nullable=True)  # type: ignore
    
    # Results
    status = Column(String(50), default="running")  # type: ignore  # running, completed, failed, cancelled
    error_message = Column(Text, nullable=True)  # type: ignore
    row_count = Column(Integer, nullable=True)  # type: ignore
    file_size_bytes = Column(Integer, nullable=True)  # type: ignore
    
    # Output files
    output_format = Column(String(20), nullable=True)  # type: ignore  # pdf, excel, csv, json
    file_path = Column(String(500), nullable=True)  # type: ignore  # S3 path or local path
    download_url = Column(String(500), nullable=True)  # type: ignore  # Signed URL for download
    expires_at = Column(DateTime, nullable=True)  # type: ignore  # When download URL expires
    
    # Performance metrics
    query_time_ms = Column(Float, nullable=True)  # type: ignore
    render_time_ms = Column(Float, nullable=True)  # type: ignore
    upload_time_ms = Column(Float, nullable=True)  # type: ignore
    
    # Relationships
    report = relationship("Report", back_populates="executions")

    def __repr__(self):
        return f"<ReportExecution(id={self.id}, report_id={self.report_id}, status='{self.status}')>"

    @property
    def is_completed(self):
        return self.status == "completed"

    @property
    def is_failed(self):
        return self.status == "failed"

    @property
    def is_running(self):
        return self.status == "running"

    @property
    def duration_seconds(self):
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None


class ReportSchedule(Base):  # type: ignore
    """
    Report scheduling configuration
    """
    __tablename__ = "report_schedules"

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=True, index=True)  # type: ignore  # Nullable for new schedules
    report_definition_id = Column(Integer, ForeignKey("report_definitions.id"), nullable=True, index=True)  # type: ignore  # For new schedules
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    schedule_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    schedule_type = Column(String(50), default="report", nullable=False)  # type: ignore  # "report" or "report_definition"
    
    # Schedule configuration
    name = Column(String(255), nullable=False)  # type: ignore
    cron_expression = Column(String(100), nullable=False)  # type: ignore  # Standard cron format
    timezone = Column(String(50), default="UTC")  # type: ignore
    
    # Parameters for scheduled execution
    default_parameters = Column(JSON, default={})  # type: ignore
    default_filters = Column(JSON, default={})  # type: ignore
    
    # Output configuration
    output_formats = Column(JSON, default=["pdf"])  # type: ignore  # List of formats to generate
    delivery_method = Column(String(50), default="email")  # type: ignore  # email, s3, webhook
    delivery_config = Column(JSON, default={})  # type: ignore  # Email addresses, S3 bucket, webhook URL
    
    # Status and control
    is_active = Column(Boolean, default=True)  # type: ignore
    next_run_at = Column(DateTime, nullable=True, index=True)  # type: ignore
    last_run_at = Column(DateTime, nullable=True)  # type: ignore
    last_run_status = Column(String(50), nullable=True)  # type: ignore
    
    # Execution history
    total_executions = Column(Integer, default=0)  # type: ignore
    successful_executions = Column(Integer, default=0)  # type: ignore
    failed_executions = Column(Integer, default=0)  # type: ignore
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))  # type: ignore
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))  # type: ignore
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # type: ignore
    
    # Relationships
    report = relationship("Report", back_populates="schedules") # For legacy schedules
    report_definition = relationship("ReportDefinition", foreign_keys=[report_definition_id]) # For new schedules
    # Ensure ReportDefinition is imported if not already: from .dashboard_custom import ReportDefinition

    def __repr__(self):
        if self.schedule_type == "report_definition":
            return f"<ReportSchedule(id={self.id}, name='{self.name}', type='definition', def_id={self.report_definition_id})>"
        return f"<ReportSchedule(id={self.id}, name='{self.name}', type='legacy', report_id={self.report_id})>"

    @property
    def success_rate(self):
        if self.total_executions == 0:
            return 0.0
        return (self.successful_executions / self.total_executions) * 100

    def update_execution_stats(self, success: bool):
        """Update execution statistics"""
        self.total_executions += 1  # type: ignore
        if success:
            self.successful_executions += 1  # type: ignore
        else:
            self.failed_executions += 1  # type: ignore
        setattr(self, 'last_run_at', datetime.now(timezone.utc))  # type: ignore
        setattr(self, 'last_run_status', "success" if success else "failed")  # type: ignore


class ReportSubscription(Base):  # type: ignore
    """
    User subscriptions to scheduled reports
    """
    __tablename__ = "report_subscriptions"

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False, index=True)  # type: ignore
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    
    # Subscription preferences
    delivery_method = Column(String(50), default="email")  # type: ignore  # email, dashboard, webhook
    delivery_address = Column(String(255), nullable=True)  # type: ignore  # Email address or webhook URL
    preferred_format = Column(String(20), default="pdf")  # type: ignore  # pdf, excel, csv
    
    # Frequency preferences (can override report schedule)
    frequency_override = Column(String(50), nullable=True)  # type: ignore  # daily, weekly, monthly
    custom_schedule = Column(String(100), nullable=True)  # type: ignore  # Custom cron expression
    
    # Filters and parameters
    custom_parameters = Column(JSON, default={})  # type: ignore
    custom_filters = Column(JSON, default={})  # type: ignore
    
    # Status
    is_active = Column(Boolean, default=True)  # type: ignore
    last_delivered_at = Column(DateTime, nullable=True)  # type: ignore
    delivery_count = Column(Integer, default=0)  # type: ignore
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))  # type: ignore
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))  # type: ignore
    
    # Relationships
    report = relationship("Report", back_populates="subscriptions")

    def __repr__(self):
        return f"<ReportSubscription(id={self.id}, report_id={self.report_id}, user_id={self.user_id})>"


class ReportTemplate(Base):  # type: ignore
    """
    Reusable report templates
    """
    __tablename__ = "report_templates"

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    template_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    
    # Template metadata
    name = Column(String(255), nullable=False)  # type: ignore
    description = Column(Text, nullable=True)  # type: ignore
    category = Column(String(100), nullable=False, index=True)  # type: ignore
    tags = Column(JSON, default=[])  # type: ignore
    
    # Template configuration
    template_config = Column(JSON, nullable=False)  # type: ignore  # Complete report configuration
    parameter_schema = Column(JSON, default={})  # type: ignore  # Required parameters
    
    # Availability
    is_public = Column(Boolean, default=False)  # type: ignore  # Available to all tenants
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)  # type: ignore  # Tenant-specific template
    
    # Usage statistics
    usage_count = Column(Integer, default=0)  # type: ignore
    last_used_at = Column(DateTime, nullable=True)  # type: ignore
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))  # type: ignore
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))  # type: ignore
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # type: ignore
    
    # Version control
    version = Column(String(20), default="1.0")  # type: ignore
    parent_template_id = Column(Integer, ForeignKey("report_templates.id"), nullable=True)  # type: ignore

    def __repr__(self):
        return f"<ReportTemplate(id={self.id}, name='{self.name}', category='{self.category}')>"

    def increment_usage(self):
        """Increment usage statistics"""
        self.usage_count += 1  # type: ignore
        setattr(self, 'last_used_at', datetime.now(timezone.utc))  # type: ignore


class ReportAuditLog(Base):  # type: ignore
    """
    Audit log for report activities
    """
    __tablename__ = "report_audit_logs"

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=True, index=True)  # type: ignore
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # type: ignore
    
    # Event details
    event_type = Column(String(100), nullable=False, index=True)  # type: ignore  # created, executed, scheduled, shared, etc.
    event_category = Column(String(50), nullable=False, index=True)  # type: ignore  # management, execution, security
    
    # Context
    resource_type = Column(String(50), nullable=True)  # type: ignore  # report, schedule, subscription
    resource_id = Column(String(100), nullable=True)  # type: ignore
    
    # Event data
    details = Column(JSON, default={})  # type: ignore
    old_values = Column(JSON, default={})  # type: ignore  # For update operations
    new_values = Column(JSON, default={})  # type: ignore  # For update operations
    
    # Security context
    ip_address = Column(String(45), nullable=True)  # type: ignore
    user_agent = Column(Text, nullable=True)  # type: ignore
    
    # Timing
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)  # type: ignore

    def __repr__(self):
        return f"<ReportAuditLog(id={self.id}, event_type='{self.event_type}', tenant_id={self.tenant_id})>"


class ReportCache(Base):  # type: ignore
    """
    Cache for report results to improve performance
    """
    __tablename__ = "report_cache"

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    cache_key = Column(String(255), unique=True, nullable=False, index=True)  # type: ignore
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False, index=True)  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    
    # Cache metadata
    parameters_hash = Column(String(64), nullable=False)  # type: ignore  # MD5 hash of parameters
    data_hash = Column(String(64), nullable=False)  # type: ignore  # MD5 hash of result data
    
    # Cached data
    result_data = Column(JSON, nullable=False)  # type: ignore  # Serialized report data
    cache_metadata = Column(JSON, default={})  # type: ignore  # Row count, generation time, etc.
    
    # Cache control
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)  # type: ignore
    expires_at = Column(DateTime, nullable=False, index=True)  # type: ignore
    hit_count = Column(Integer, default=0)  # type: ignore
    last_accessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))  # type: ignore

    def __repr__(self):
        return f"<ReportCache(id={self.id}, cache_key='{self.cache_key}', report_id={self.report_id})>"

    @property
    def is_expired(self):
        return datetime.now(timezone.utc) > self.expires_at

    def increment_hit_count(self):
        """Increment cache hit statistics"""
        self.hit_count += 1  # type: ignore
        setattr(self, 'last_accessed_at', datetime.now(timezone.utc))  # type: ignore