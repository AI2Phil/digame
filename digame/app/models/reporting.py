"""
Advanced Reporting models for enterprise features
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float
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

class Report(Base):
    """
    Report definition and configuration
    """
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    report_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # Report metadata
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)  # analytics, financial, operational, compliance
    report_type = Column(String(50), nullable=False)  # dashboard, table, chart, pdf, excel
    
    # Report configuration
    data_source = Column(String(100), nullable=False)  # users, analytics, activities, etc.
    query_config = Column(JSON, default={})  # SQL query parameters, filters, etc.
    visualization_config = Column(JSON, default={})  # Chart types, colors, layout
    format_config = Column(JSON, default={})  # PDF layout, Excel formatting, etc.
    
    # Filters and parameters
    default_filters = Column(JSON, default={})
    parameter_schema = Column(JSON, default={})  # Define user-configurable parameters
    
    # Access control
    is_public = Column(Boolean, default=False)  # Available to all tenant users
    allowed_roles = Column(JSON, default=[])  # Specific roles that can access
    allowed_users = Column(JSON, default=[])  # Specific users that can access
    
    # Scheduling
    is_scheduled = Column(Boolean, default=False)
    schedule_config = Column(JSON, default={})  # Cron expression, timezone, etc.
    
    # Status and metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    last_generated_at = Column(DateTime, nullable=True)
    generation_count = Column(Integer, default=0)
    
    # Performance metrics
    avg_generation_time_ms = Column(Float, nullable=True)
    last_generation_time_ms = Column(Float, nullable=True)
    
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


class ReportExecution(Base):
    """
    Report execution history and results
    """
    __tablename__ = "report_executions"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    execution_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # Execution context
    executed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null for scheduled reports
    execution_type = Column(String(50), nullable=False)  # manual, scheduled, api
    
    # Parameters and filters used
    parameters = Column(JSON, default={})
    filters_applied = Column(JSON, default={})
    date_range = Column(JSON, default={})  # start_date, end_date
    
    # Execution details
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)
    execution_time_ms = Column(Float, nullable=True)
    
    # Results
    status = Column(String(50), default="running")  # running, completed, failed, cancelled
    error_message = Column(Text, nullable=True)
    row_count = Column(Integer, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    
    # Output files
    output_format = Column(String(20), nullable=True)  # pdf, excel, csv, json
    file_path = Column(String(500), nullable=True)  # S3 path or local path
    download_url = Column(String(500), nullable=True)  # Signed URL for download
    expires_at = Column(DateTime, nullable=True)  # When download URL expires
    
    # Performance metrics
    query_time_ms = Column(Float, nullable=True)
    render_time_ms = Column(Float, nullable=True)
    upload_time_ms = Column(Float, nullable=True)
    
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


class ReportSchedule(Base):
    """
    Report scheduling configuration
    """
    __tablename__ = "report_schedules"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    schedule_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # Schedule configuration
    name = Column(String(255), nullable=False)
    cron_expression = Column(String(100), nullable=False)  # Standard cron format
    timezone = Column(String(50), default="UTC")
    
    # Parameters for scheduled execution
    default_parameters = Column(JSON, default={})
    default_filters = Column(JSON, default={})
    
    # Output configuration
    output_formats = Column(JSON, default=["pdf"])  # List of formats to generate
    delivery_method = Column(String(50), default="email")  # email, s3, webhook
    delivery_config = Column(JSON, default={})  # Email addresses, S3 bucket, webhook URL
    
    # Status and control
    is_active = Column(Boolean, default=True)
    next_run_at = Column(DateTime, nullable=True, index=True)
    last_run_at = Column(DateTime, nullable=True)
    last_run_status = Column(String(50), nullable=True)
    
    # Execution history
    total_executions = Column(Integer, default=0)
    successful_executions = Column(Integer, default=0)
    failed_executions = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    report = relationship("Report", back_populates="schedules")

    def __repr__(self):
        return f"<ReportSchedule(id={self.id}, name='{self.name}', cron='{self.cron_expression}')>"

    @property
    def success_rate(self):
        if self.total_executions == 0:
            return 0.0
        return (self.successful_executions / self.total_executions) * 100

    def update_execution_stats(self, success: bool):
        """Update execution statistics"""
        self.total_executions += 1
        if success:
            self.successful_executions += 1
        else:
            self.failed_executions += 1
        self.last_run_at = datetime.utcnow()
        self.last_run_status = "success" if success else "failed"


class ReportSubscription(Base):
    """
    User subscriptions to scheduled reports
    """
    __tablename__ = "report_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Subscription preferences
    delivery_method = Column(String(50), default="email")  # email, dashboard, webhook
    delivery_address = Column(String(255), nullable=True)  # Email address or webhook URL
    preferred_format = Column(String(20), default="pdf")  # pdf, excel, csv
    
    # Frequency preferences (can override report schedule)
    frequency_override = Column(String(50), nullable=True)  # daily, weekly, monthly
    custom_schedule = Column(String(100), nullable=True)  # Custom cron expression
    
    # Filters and parameters
    custom_parameters = Column(JSON, default={})
    custom_filters = Column(JSON, default={})
    
    # Status
    is_active = Column(Boolean, default=True)
    last_delivered_at = Column(DateTime, nullable=True)
    delivery_count = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    report = relationship("Report", back_populates="subscriptions")

    def __repr__(self):
        return f"<ReportSubscription(id={self.id}, report_id={self.report_id}, user_id={self.user_id})>"


class ReportTemplate(Base):
    """
    Reusable report templates
    """
    __tablename__ = "report_templates"

    id = Column(Integer, primary_key=True, index=True)
    template_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # Template metadata
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    tags = Column(JSON, default=[])
    
    # Template configuration
    template_config = Column(JSON, nullable=False)  # Complete report configuration
    parameter_schema = Column(JSON, default={})  # Required parameters
    
    # Availability
    is_public = Column(Boolean, default=False)  # Available to all tenants
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)  # Tenant-specific template
    
    # Usage statistics
    usage_count = Column(Integer, default=0)
    last_used_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Version control
    version = Column(String(20), default="1.0")
    parent_template_id = Column(Integer, ForeignKey("report_templates.id"), nullable=True)

    def __repr__(self):
        return f"<ReportTemplate(id={self.id}, name='{self.name}', category='{self.category}')>"

    def increment_usage(self):
        """Increment usage statistics"""
        self.usage_count += 1
        self.last_used_at = datetime.utcnow()


class ReportAuditLog(Base):
    """
    Audit log for report activities
    """
    __tablename__ = "report_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Event details
    event_type = Column(String(100), nullable=False, index=True)  # created, executed, scheduled, shared, etc.
    event_category = Column(String(50), nullable=False, index=True)  # management, execution, security
    
    # Context
    resource_type = Column(String(50), nullable=True)  # report, schedule, subscription
    resource_id = Column(String(100), nullable=True)
    
    # Event data
    details = Column(JSON, default={})
    old_values = Column(JSON, default={})  # For update operations
    new_values = Column(JSON, default={})  # For update operations
    
    # Security context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<ReportAuditLog(id={self.id}, event_type='{self.event_type}', tenant_id={self.tenant_id})>"


class ReportCache(Base):
    """
    Cache for report results to improve performance
    """
    __tablename__ = "report_cache"

    id = Column(Integer, primary_key=True, index=True)
    cache_key = Column(String(255), unique=True, nullable=False, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Cache metadata
    parameters_hash = Column(String(64), nullable=False)  # MD5 hash of parameters
    data_hash = Column(String(64), nullable=False)  # MD5 hash of result data
    
    # Cached data
    result_data = Column(JSON, nullable=False)  # Serialized report data
    metadata = Column(JSON, default={})  # Row count, generation time, etc.
    
    # Cache control
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    hit_count = Column(Integer, default=0)
    last_accessed_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<ReportCache(id={self.id}, cache_key='{self.cache_key}', report_id={self.report_id})>"

    @property
    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def increment_hit_count(self):
        """Increment cache hit statistics"""
        self.hit_count += 1
        self.last_accessed_at = datetime.utcnow()