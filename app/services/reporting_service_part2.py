"""
Advanced Reporting Service - Part 2
Scheduling, templates, subscriptions, and advanced features
"""

from typing import Optional, List, Dict, Any, Tuple, Union
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
import uuid
import json
import hashlib
import asyncio
from concurrent.futures import ThreadPoolExecutor
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
try:
    import schedule
    SCHEDULE_AVAILABLE = True
except ImportError:
    schedule = None
    SCHEDULE_AVAILABLE = False
import time
try:
    from croniter import croniter
    CRONITER_AVAILABLE = True
except ImportError:
    croniter = None
    CRONITER_AVAILABLE = False

from ..models.reporting import (
    Report, ReportExecution, ReportSchedule, ReportSubscription,
    ReportTemplate, ReportAuditLog, ReportCache
)
from ..models.user import User
from ..models.tenant import Tenant
# Import schemas and the conceptual ReportDefinition model
from ..schemas import analytics_schemas as schemas
from ..models.dashboard_custom import ReportDefinition # Assuming ReportDefinition model is here
# ReportSchedule SQLAlchemy model is already imported from ..models.reporting
from .reporting_service_part1 import ReportingService # Import Part 1 service


class ReportSchedulingService:
    """Service for managing report scheduling and automation"""

    def __init__(self, db: Session, reporting_service_part1: ReportingService) -> None:
        self.db = db
        self.reporting_service_part1 = reporting_service_part1

    # --- Existing Schedule Management for old Report model ---
    def create_schedule(
        self,
        report_id: int, # This refers to the old Report model's ID
        tenant_id: int,
        name: str,
        cron_expression: str,
        config: Dict[str, Any],
        created_by_user_id: int
    ) -> ReportSchedule:
        """Create a new report schedule"""
        
        # Validate cron expression
        if not self._validate_cron_expression(cron_expression):
            raise ValueError("Invalid cron expression")
        
        # Calculate next run time
        next_run = self._calculate_next_run(cron_expression, config.get("timezone", "UTC"))
        
        schedule = ReportSchedule()
        setattr(schedule, 'report_id', report_id)  # type: ignore
        setattr(schedule, 'tenant_id', tenant_id)  # type: ignore
        setattr(schedule, 'name', name)  # type: ignore
        setattr(schedule, 'cron_expression', cron_expression)  # type: ignore
        setattr(schedule, 'timezone', config.get("timezone", "UTC"))  # type: ignore
        setattr(schedule, 'default_parameters', config.get("default_parameters", {}))  # type: ignore
        setattr(schedule, 'default_filters', config.get("default_filters", {}))  # type: ignore
        setattr(schedule, 'output_formats', config.get("output_formats", ["pdf"]))  # type: ignore
        setattr(schedule, 'delivery_method', config.get("delivery_method", "email"))  # type: ignore
        setattr(schedule, 'delivery_config', config.get("delivery_config", {}))  # type: ignore
        setattr(schedule, 'next_run_at', next_run)  # type: ignore
        setattr(schedule, 'created_by_user_id', created_by_user_id)  # type: ignore
        
        self.db.add(schedule)
        self.db.commit()
        self.db.refresh(schedule)
        
        return schedule

    def get_due_schedules(self) -> List[ReportSchedule]:
        """Get schedules that are due to run"""
        
        now = datetime.utcnow()
        return self.db.query(ReportSchedule).filter(
            and_(
                ReportSchedule.is_active.is_(True),  # type: ignore
                ReportSchedule.next_run_at <= now  # type: ignore
            )
        ).all()

    async def execute_scheduled_report(self, schedule: ReportSchedule) -> bool:
        """Execute a scheduled report based on its type."""
        try:
            schedule_type = getattr(schedule, 'schedule_type', None)
            if schedule_type == "report_definition" and getattr(schedule, 'report_definition_id', None) is not None:
                result = await self._execute_definition_schedule_logic(schedule)
            elif schedule_type == "report" and getattr(schedule, 'report_id', None) is not None: # Legacy report
                report_id = getattr(schedule, 'report_id', None)
                report = self.db.query(Report).filter(Report.id == report_id).first() if report_id else None
                if not report:
                    self._handle_schedule_failure(schedule, "Legacy report not found")
                    return False

                executions = []
                for output_format in schedule.output_formats:
                    execution = await self._execute_legacy_report_for_schedule(
                        schedule, report, str(output_format)
                    )
                    executions.append(execution)
                await self._deliver_scheduled_reports(schedule, executions)
                result = True # Assuming success if no exceptions
            else:
                self._handle_schedule_failure(schedule, f"Unknown or misconfigured schedule type: {schedule.schedule_type}")
                return False

            if result:
                getattr(schedule, 'update_execution_stats', lambda x: None)(True)  # type: ignore
                setattr(schedule, 'next_run_at', self._calculate_next_run(
                    getattr(schedule, 'cron_expression', ''),
                    getattr(schedule, 'timezone', 'UTC')
                ))  # type: ignore
            # If result is False, _handle_schedule_failure would have already updated stats

            self.db.commit()
            return result

        except Exception as e:
            self._handle_schedule_failure(schedule, f"Unhandled exception: {str(e)}")
            self.db.commit() # Ensure commit even on unhandled exception path
            return False

    def _handle_schedule_failure(self, schedule: ReportSchedule, error_message: str):
        """Handles common tasks for schedule failure."""
        getattr(schedule, 'update_execution_stats', lambda x: None)(False)  # type: ignore
        setattr(schedule, 'next_run_at', self._calculate_next_run(
            getattr(schedule, 'cron_expression', ''),
            getattr(schedule, 'timezone', 'UTC')
        ))  # type: ignore
        # Log the error
        _log_audit_event(
            getattr(schedule, 'tenant_id', 0),
            "scheduled_report_failed",
            "execution",
            report_id=getattr(schedule, 'report_id', None),  # This might be null for definition schedules
            report_definition_id=getattr(schedule, 'report_definition_id', None),
            details={"error": error_message, "schedule_id": getattr(schedule, 'id', None), "schedule_type": getattr(schedule, 'schedule_type', None)}
        )
        # Note: self.db.commit() is called by the main execute_scheduled_report method

    async def _execute_definition_schedule_logic(self, schedule: ReportSchedule) -> bool:
        """Specific logic to execute a schedule for a ReportDefinition."""
        if not self.reporting_service_part1:
            self._handle_schedule_failure(schedule, "ReportingService part1 not available.")
            return False

        report_def = getattr(self.reporting_service_part1, 'get_report_definition', lambda **kwargs: None)(
            report_definition_id=getattr(schedule, 'report_definition_id', None),  # type: ignore
            tenant_id=getattr(schedule, 'tenant_id', None)
        )

        if not report_def:
            self._handle_schedule_failure(schedule, f"ReportDefinition {getattr(schedule, 'report_definition_id', None)} not found.")
            return False

        try:
            # 1. Generate report data content
            # generate_report_data returns a Dict[str, Any] which might be complex.
            # We need to extract the List[Dict[str, Any]] for file generation.
            # This assumes the relevant data is in `content[0]['data']` or similar,
            # or that generate_report_data can be adapted or a helper can process its output.
            # For now, let's assume generate_report_data provides the flat list of dicts needed.
            # A more robust solution would inspect report_def.content_blocks.
            
            # This call is to ReportingService in part1
            raw_report_data_container = await getattr(self.reporting_service_part1, 'generate_report_data', lambda **kwargs: {})(
                report_definition_id=getattr(report_def, 'id', None),  # type: ignore
                tenant_id=getattr(schedule, 'tenant_id', None)
            )

            # Extract tabular data. This is a simplification.
            # Real implementation might need to find the correct block with tabular data.
            tabular_data: List[Dict[str, Any]] = []
            if raw_report_data_container and "content" in raw_report_data_container:
                for block in raw_report_data_container["content"]:
                    if isinstance(block.get("data"), list): # Found some list data
                        tabular_data = block["data"]
                        break
            
            if not tabular_data and report_def.report_type not in ["text_summary"]: # Allow empty data for some types
                 # Check if any data was expected
                content_blocks = getattr(report_def, 'content_blocks', [])
                is_data_expected = any(getattr(b, 'data_source', None) for b in content_blocks if getattr(b, 'block_type', None) != "text")
                if is_data_expected:
                    self._handle_schedule_failure(schedule, f"No suitable tabular data found in ReportDefinition {getattr(report_def, 'id', None)} content.")
                    return False


            generated_executions: List[ReportExecution] = []

            for output_format in schedule.output_formats:
                start_time = datetime.utcnow()
                # Create a ReportExecution object for this specific generation
                # WARNING: execution.report_id is being assigned report_definition_id.
                # This is semantically incorrect due to FK(reports.id) but done for code flow.
                # Ideally, ReportExecution should have a report_definition_id field or polymorphic relation.
                # For each output format, create a mock execution for delivery
                # Since we can't create proper ReportExecution objects due to FK constraints,
                # we'll create minimal mock objects for the delivery system
                class MockExecution:
                    def __init__(self) -> None:
                        self.execution_uuid = str(uuid.uuid4())
                        self.output_format = output_format
                        self.file_path = f"/tmp/mock_report_{uuid.uuid4()}.{output_format}"
                        self.is_completed = True
                        self.tenant_id = getattr(schedule, 'tenant_id', None)
                
                mock_execution = MockExecution()
                generated_executions.append(mock_execution)  # type: ignore

            if not generated_executions:
                self._handle_schedule_failure(schedule, "No files generated for schedule.")
                return False

            await self._deliver_scheduled_reports(schedule, generated_executions)
            return True

        except Exception as e_main:
            self._handle_schedule_failure(schedule, f"Core error in definition schedule logic: {str(e_main)}")
            return False


    # --- New Schedule Management for ReportDefinition ---

    def create_definition_schedule(
        self,
        schedule_data: schemas.ReportScheduleCreate, # Uses report_definition_id
        tenant_id: int,
        created_by_user_id: int
    ) -> ReportSchedule: # Still returns the same SQLAlchemy model for now
        """Create a new schedule for a ReportDefinition."""

        # Validate cron expression
        if not self._validate_cron_expression(getattr(schedule_data, 'cron_schedule', '')):
            raise ValueError("Invalid cron expression")

        # Calculate next run time
        next_run = self._calculate_next_run(
            getattr(schedule_data, 'cron_schedule', ''),
            getattr(schedule_data, 'timezone', "UTC")
        )

        # IMPORTANT: This assumes ReportSchedule model can store report_definition_id
        # or that report_id field is being repurposed. This needs DB model alignment.
        # For now, proceeding as if it's compatible or `report_definition_id` is an alias/new field.
        db_schedule = ReportSchedule()
        setattr(db_schedule, 'report_definition_id', getattr(schedule_data, 'report_definition_id', None))  # type: ignore
        setattr(db_schedule, 'schedule_type', "report_definition")  # type: ignore
        setattr(db_schedule, 'tenant_id', tenant_id)  # type: ignore
        setattr(db_schedule, 'name', getattr(schedule_data, 'name', None) if getattr(schedule_data, 'name', None) else f"Schedule for Report Definition {getattr(schedule_data, 'report_definition_id', None)}")  # type: ignore
        setattr(db_schedule, 'cron_expression', getattr(schedule_data, 'cron_schedule', ''))  # type: ignore
        setattr(db_schedule, 'timezone', getattr(schedule_data, 'timezone', "UTC"))  # type: ignore
        setattr(db_schedule, 'output_formats', getattr(schedule_data, 'output_formats', ["pdf"]))  # type: ignore
        setattr(db_schedule, 'delivery_method', getattr(schedule_data, 'delivery_method', "email"))  # type: ignore
        recipients = getattr(schedule_data, 'recipients', None)
        setattr(db_schedule, 'delivery_config', {"recipients": recipients} if recipients else {})  # type: ignore
        setattr(db_schedule, 'default_parameters', getattr(schedule_data, 'default_parameters', {}))  # type: ignore
        setattr(db_schedule, 'default_filters', getattr(schedule_data, 'default_filters', {}))  # type: ignore
        setattr(db_schedule, 'next_run_at', next_run)  # type: ignore
        setattr(db_schedule, 'is_active', getattr(schedule_data, 'is_active', True))  # type: ignore
        setattr(db_schedule, 'created_by_user_id', created_by_user_id)  # type: ignore

        self.db.add(db_schedule)
        self.db.commit()
        self.db.refresh(db_schedule)
        return db_schedule

    def get_definition_schedule(self, schedule_id: int, tenant_id: int) -> Optional[ReportSchedule]:
        """Get a specific schedule by its ID, ensuring tenant isolation and correct type."""
        return self.db.query(ReportSchedule).filter(
            ReportSchedule.id == schedule_id,
            ReportSchedule.tenant_id == tenant_id,
            ReportSchedule.schedule_type == "report_definition" # Ensure it's the correct type
        ).first()

    def list_definition_schedules(
        self,
        tenant_id: int,
        report_definition_id: Optional[int] = None
    ) -> List[ReportSchedule]:
        """List schedules for ReportDefinitions, optionally filtered by report_definition_id."""
        query = self.db.query(ReportSchedule).filter(
            ReportSchedule.tenant_id == tenant_id,
            ReportSchedule.schedule_type == "report_definition" # Ensure it's the correct type
        )
        if report_definition_id:
            query = query.filter(ReportSchedule.report_definition_id == report_definition_id)

        return query.order_by(ReportSchedule.next_run_at).all()

    def update_definition_schedule(
        self,
        schedule_id: int,
        schedule_update_data: Any, # Pydantic schema for update
        tenant_id: int
    ) -> Optional[ReportSchedule]:
        """Update an existing schedule for a ReportDefinition."""
        db_schedule = self.get_definition_schedule(schedule_id, tenant_id)
        if not db_schedule:
            return None

        model_dump_func = getattr(schedule_update_data, 'model_dump', None)
        if model_dump_func:
            try:
                update_data = model_dump_func(exclude_unset=True)
            except TypeError:
                update_data = model_dump_func()
        else:
            update_data = {}

        if "cron_schedule" in update_data or "timezone" in update_data:
            cron = update_data.get("cron_schedule", getattr(db_schedule, 'cron_expression', ''))
            tz = update_data.get("timezone", getattr(db_schedule, 'timezone', 'UTC'))
            setattr(db_schedule, 'next_run_at', self._calculate_next_run(cron, tz))  # type: ignore

        for key, value in update_data.items():
            if key == "recipients":
                delivery_config = getattr(db_schedule, 'delivery_config', {})
                if isinstance(delivery_config, dict):
                    delivery_config["recipients"] = value
                    setattr(db_schedule, 'delivery_config', delivery_config)  # type: ignore
            elif hasattr(db_schedule, key):
                setattr(db_schedule, key, value)  # type: ignore

        setattr(db_schedule, 'updated_at', datetime.utcnow())  # type: ignore
        self.db.commit()
        self.db.refresh(db_schedule)
        return db_schedule

    def delete_definition_schedule(self, schedule_id: int, tenant_id: int) -> bool:
        """Delete a schedule for a ReportDefinition."""
        db_schedule = self.get_definition_schedule(schedule_id, tenant_id)
        if not db_schedule:
            return False

        self.db.delete(db_schedule)
        self.db.commit()
        return True

    # --- End of New Schedule Management ---


    async def _execute_legacy_report_for_schedule(
        self,
        schedule: ReportSchedule,
        report: Report,
        output_format: str
    ) -> Optional[ReportExecution]:
        """Execute report for scheduled delivery"""
        
        # Use the existing reporting service instance
        if not self.reporting_service_part1:
            return None
        
        reporting_service = self.reporting_service_part1
        
        execute_report_func = getattr(reporting_service, 'execute_report', None)
        if execute_report_func:
            try:
                execution = await execute_report_func(
                    report_id=getattr(report, 'id', None),
                    tenant_id=getattr(report, 'tenant_id', None),
                    parameters=getattr(schedule, 'default_parameters', {}),
                    filters=getattr(schedule, 'default_filters', {}),
                    output_format=output_format,
                    user_id=None  # Scheduled execution
                )
            except Exception:
                execution = None
        else:
            execution = None
        
        return execution

    async def _deliver_scheduled_reports(
        self,
        schedule: ReportSchedule,
        executions: List[ReportExecution]
    ):
        """Deliver scheduled reports via configured method"""
        
        delivery_method = getattr(schedule, 'delivery_method', 'email')
        delivery_config = getattr(schedule, 'delivery_config', {})
        
        if delivery_method == "email":
            await self._deliver_via_email(schedule, executions, delivery_config)
        elif delivery_method == "s3":
            await self._deliver_via_s3(schedule, executions, delivery_config)
        elif delivery_method == "webhook":
            await self._deliver_via_webhook(schedule, executions, delivery_config)

    async def _deliver_via_email(
        self,
        schedule: ReportSchedule,
        executions: List[ReportExecution],
        config: Dict[str, Any]
    ):
        """Deliver reports via email"""
        
        # Mock email delivery for development
        recipients = config.get("recipients", [])
        subject = config.get("subject", f"Scheduled Report: {schedule.name}")
        
        # In production, this would use actual SMTP
        print(f"Mock email delivery:")
        print(f"  To: {recipients}")
        print(f"  Subject: {subject}")
        print(f"  Attachments: {len(executions)} files")
        
        # Update subscriptions
        for execution in executions:
            if getattr(execution, 'is_completed', False):
                report_id = getattr(schedule, 'report_id', None)
                if report_id is not None:
                    self._update_subscription_delivery_stats(int(report_id), recipients)

    async def _deliver_via_s3(
        self,
        schedule: ReportSchedule,
        executions: List[ReportExecution],
        config: Dict[str, Any]
    ):
        """Deliver reports to S3 bucket"""
        
        bucket = config.get("bucket")
        prefix = config.get("prefix", "reports/")
        
        # Mock S3 upload
        print(f"Mock S3 delivery:")
        print(f"  Bucket: {bucket}")
        print(f"  Files: {len(executions)}")

    async def _deliver_via_webhook(
        self,
        schedule: ReportSchedule,
        executions: List[ReportExecution],
        config: Dict[str, Any]
    ):
        """Deliver reports via webhook"""
        
        webhook_url = config.get("url")
        
        # Mock webhook delivery
        print(f"Mock webhook delivery:")
        print(f"  URL: {webhook_url}")
        print(f"  Reports: {len(executions)}")

    def _validate_cron_expression(self, cron_expr: str) -> bool:
        """Validate cron expression format"""
        if not CRONITER_AVAILABLE or croniter is None:
            return True  # Assume valid if croniter not available
        try:
            croniter(cron_expr)
            return True
        except Exception:
            return False

    def _calculate_next_run(self, cron_expr: str, timezone: str = "UTC") -> datetime:
        """Calculate next run time for cron expression"""
        if not CRONITER_AVAILABLE or croniter is None:
            return datetime.utcnow() + timedelta(hours=1)
        try:
            cron = croniter(cron_expr, datetime.utcnow())
            next_time = cron.get_next(datetime)
            return next_time if isinstance(next_time, datetime) else datetime.utcnow() + timedelta(hours=1)
        except Exception:
            # Fallback to 1 hour from now
            return datetime.utcnow() + timedelta(hours=1)

    def _update_subscription_delivery_stats(self, report_id: int, recipients: List[str]):
        """Update delivery statistics for subscriptions"""
        
        for email in recipients:
            subscription = self.db.query(ReportSubscription).filter(
                and_(
                    ReportSubscription.report_id == report_id,  # type: ignore
                    ReportSubscription.delivery_address == email  # type: ignore
                )
            ).first()
            
            if subscription:
                setattr(subscription, 'last_delivered_at', datetime.utcnow())  # type: ignore
                current_count = getattr(subscription, 'delivery_count', 0)
                setattr(subscription, 'delivery_count', current_count + 1)  # type: ignore
                self.db.commit()


class ReportTemplateService:
    """Service for managing report templates"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create_template(
        self,
        name: str,
        category: str,
        template_config: Dict[str, Any],
        tenant_id: Optional[int] = None,
        created_by_user_id: Optional[int] = None
    ) -> ReportTemplate:
        """Create a new report template"""
        
        template = ReportTemplate()
        setattr(template, 'name', name)  # type: ignore
        setattr(template, 'category', category)  # type: ignore
        setattr(template, 'template_config', template_config)  # type: ignore
        setattr(template, 'parameter_schema', template_config.get("parameter_schema", {}))  # type: ignore
        setattr(template, 'is_public', tenant_id is None)  # type: ignore
        setattr(template, 'tenant_id', tenant_id)  # type: ignore
        setattr(template, 'created_by_user_id', created_by_user_id)  # type: ignore
        
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        
        return template

    def get_available_templates(
        self,
        tenant_id: Optional[int] = None,
        category: Optional[str] = None
    ) -> List[ReportTemplate]:
        """Get available templates for a tenant"""
        
        query = self.db.query(ReportTemplate)
        
        # Include public templates and tenant-specific templates
        if tenant_id:
            query = query.filter(
                or_(
                    ReportTemplate.is_public.is_(True),  # type: ignore
                    ReportTemplate.tenant_id == tenant_id  # type: ignore
                )
            )
        else:
            query = query.filter(ReportTemplate.is_public.is_(True))  # type: ignore
        
        if category:
            query = query.filter(ReportTemplate.category == category)
        
        return query.all()

    def create_report_from_template(
        self,
        template_id: int,
        tenant_id: int,
        name: str,
        parameters: Dict[str, Any],
        created_by_user_id: int
    ) -> Any:
        """Create a new report from a template"""
        
        template = self.db.query(ReportTemplate).filter(
            ReportTemplate.id == template_id
        ).first()
        
        if not template:
            raise ValueError("Template not found")
        
        # Merge template config with provided parameters
        template_config = getattr(template, 'template_config', {})
        config = template_config.copy() if template_config else {}
        config.update(parameters)
        
        # Mock report creation for template service
        class MockReport:
            def __init__(self):
                self.id = 1
                self.name = name
                self.tenant_id = tenant_id
                self.category = getattr(template, 'category', 'general')
        
        report = MockReport()
        
        # Update template usage statistics
        getattr(template, 'increment_usage', lambda: None)()  # type: ignore
        self.db.commit()
        
        return report

    def get_popular_templates(self, limit: int = 10) -> List[ReportTemplate]:
        """Get most popular templates by usage"""
        
        return self.db.query(ReportTemplate).filter(
            ReportTemplate.is_public == True
        ).order_by(desc(ReportTemplate.usage_count)).limit(limit).all()


class ReportSubscriptionService:
    """Service for managing report subscriptions"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create_subscription(
        self,
        report_id: int,
        user_id: int,
        tenant_id: int,
        config: Dict[str, Any]
    ) -> ReportSubscription:
        """Create a new report subscription"""
        
        subscription = ReportSubscription()
        setattr(subscription, 'report_id', report_id)  # type: ignore
        setattr(subscription, 'user_id', user_id)  # type: ignore
        setattr(subscription, 'tenant_id', tenant_id)  # type: ignore
        setattr(subscription, 'delivery_method', config.get("delivery_method", "email"))  # type: ignore
        setattr(subscription, 'delivery_address', config.get("delivery_address"))  # type: ignore
        setattr(subscription, 'preferred_format', config.get("preferred_format", "pdf"))  # type: ignore
        setattr(subscription, 'frequency_override', config.get("frequency_override"))  # type: ignore
        setattr(subscription, 'custom_schedule', config.get("custom_schedule"))  # type: ignore
        setattr(subscription, 'custom_parameters', config.get("custom_parameters", {}))  # type: ignore
        setattr(subscription, 'custom_filters', config.get("custom_filters", {}))  # type: ignore
        
        self.db.add(subscription)
        self.db.commit()
        self.db.refresh(subscription)
        
        return subscription

    def get_user_subscriptions(self, user_id: int, tenant_id: int) -> List[ReportSubscription]:
        """Get all subscriptions for a user"""
        
        return self.db.query(ReportSubscription).filter(
            and_(
                ReportSubscription.user_id == user_id,  # type: ignore
                ReportSubscription.tenant_id == tenant_id,  # type: ignore
                ReportSubscription.is_active.is_(True)  # type: ignore
            )
        ).all()

    def get_report_subscribers(self, report_id: int) -> List[ReportSubscription]:
        """Get all subscribers for a report"""
        
        return self.db.query(ReportSubscription).filter(
            and_(
                ReportSubscription.report_id == report_id,  # type: ignore
                ReportSubscription.is_active.is_(True)  # type: ignore
            )
        ).all()


class ReportAnalyticsService:
    """Service for report usage analytics and insights"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_report_usage_stats(
        self,
        tenant_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get comprehensive report usage statistics"""
        
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()
        
        # Mock analytics data
        return {
            "total_reports": 25,
            "total_executions": 342,
            "successful_executions": 328,
            "failed_executions": 14,
            "success_rate": 95.9,
            "avg_execution_time_ms": 2450,
            "most_popular_reports": [
                {"name": "User Activity Report", "executions": 45},
                {"name": "Financial Summary", "executions": 38},
                {"name": "Performance Analytics", "executions": 32}
            ],
            "execution_trends": [
                {"date": "2025-05-20", "executions": 12, "avg_time_ms": 2100},
                {"date": "2025-05-21", "executions": 15, "avg_time_ms": 2300},
                {"date": "2025-05-22", "executions": 18, "avg_time_ms": 2600},
                {"date": "2025-05-23", "executions": 22, "avg_time_ms": 2400},
                {"date": "2025-05-24", "executions": 19, "avg_time_ms": 2200}
            ],
            "format_distribution": {
                "pdf": 45,
                "excel": 32,
                "csv": 18,
                "json": 5
            },
            "category_distribution": {
                "analytics": 35,
                "financial": 28,
                "operational": 22,
                "compliance": 15
            }
        }

    def get_report_performance_insights(self, report_id: int) -> Dict[str, Any]:
        """Get performance insights for a specific report"""
        
        # Mock performance data
        return {
            "report_id": report_id,
            "total_executions": 45,
            "avg_execution_time_ms": 2300,
            "min_execution_time_ms": 1200,
            "max_execution_time_ms": 4500,
            "cache_hit_rate": 0.35,
            "error_rate": 0.04,
            "most_common_parameters": {
                "date_range": "last_30_days",
                "format": "pdf",
                "include_charts": True
            },
            "performance_trends": [
                {"date": "2025-05-20", "avg_time_ms": 2100, "executions": 8},
                {"date": "2025-05-21", "avg_time_ms": 2400, "executions": 12},
                {"date": "2025-05-22", "avg_time_ms": 2200, "executions": 10},
                {"date": "2025-05-23", "avg_time_ms": 2500, "executions": 9},
                {"date": "2025-05-24", "avg_time_ms": 2000, "executions": 6}
            ],
            "recommendations": [
                "Consider adding more aggressive caching for this report",
                "Query optimization could reduce execution time by ~20%",
                "Most users prefer PDF format - consider making it default"
            ]
        }

    def get_user_report_activity(
        self,
        user_id: int,
        tenant_id: int,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get report activity for a specific user"""
        
        # Mock user activity data
        return {
            "user_id": user_id,
            "reports_created": 3,
            "reports_executed": 28,
            "favorite_formats": ["pdf", "excel"],
            "most_used_reports": [
                {"name": "Daily Analytics", "executions": 12},
                {"name": "Team Performance", "executions": 8},
                {"name": "Project Status", "executions": 5}
            ],
            "activity_timeline": [
                {"date": "2025-05-20", "executions": 4},
                {"date": "2025-05-21", "executions": 6},
                {"date": "2025-05-22", "executions": 3},
                {"date": "2025-05-23", "executions": 8},
                {"date": "2025-05-24", "executions": 7}
            ]
        }


class ReportCacheService:
    """Service for managing report result caching"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def cleanup_expired_cache(self):
        """Remove expired cache entries"""
        
        expired_entries = self.db.query(ReportCache).filter(
            ReportCache.expires_at < datetime.utcnow()
        ).all()
        
        for entry in expired_entries:
            self.db.delete(entry)
        
        self.db.commit()
        
        return len(expired_entries)

    def get_cache_statistics(self, tenant_id: Optional[int] = None) -> Dict[str, Any]:
        """Get cache performance statistics"""
        
        query = self.db.query(ReportCache)
        if tenant_id:
            query = query.filter(ReportCache.tenant_id == tenant_id)
        
        # Mock cache statistics
        return {
            "total_entries": 156,
            "active_entries": 142,
            "expired_entries": 14,
            "total_hits": 2847,
            "hit_rate": 0.68,
            "avg_hit_count": 18.3,
            "cache_size_mb": 245.7,
            "most_cached_reports": [
                {"report_name": "Daily Analytics", "hit_count": 245},
                {"report_name": "User Summary", "hit_count": 189},
                {"report_name": "Performance Report", "hit_count": 156}
            ]
        }

    def invalidate_report_cache(self, report_id: int):
        """Invalidate all cache entries for a specific report"""
        
        self.db.query(ReportCache).filter(
            ReportCache.report_id == report_id
        ).delete()
        
        self.db.commit()


class ReportExportService:
    """Service for advanced report export and sharing"""

    def __init__(self, db: Session) -> None:
        self.db = db

    async def export_report_data(
        self,
        execution_id: int,
        export_format: str,
        options: Optional[Dict[str, Any]] = None
    ) -> str:
        """Export report data in various formats"""
        
        execution = self.db.query(ReportExecution).filter(
            ReportExecution.id == execution_id
        ).first()
        
        if not execution or not getattr(execution, 'is_completed', False):
            raise ValueError("Execution not found or not completed")
        
        # Generate export based on format
        if export_format == "json":
            return await self._export_as_json(execution, options or {})
        elif export_format == "xml":
            return await self._export_as_xml(execution, options or {})
        elif export_format == "api":
            return await self._create_api_endpoint(execution, options or {})
        else:
            raise ValueError(f"Unsupported export format: {export_format}")

    async def _export_as_json(self, execution: ReportExecution, options: Dict[str, Any]) -> str:
        """Export report data as JSON"""
        
        # Mock JSON export
        export_data = {
            "report_id": getattr(execution, 'report_id', None),
            "execution_id": getattr(execution, 'id', None),
            "generated_at": (lambda dt: dt.isoformat() if dt and hasattr(dt, 'isoformat') else None)(getattr(execution, 'completed_at', None)),
            "data": [
                {"id": 1, "name": "Sample Data", "value": 100},
                {"id": 2, "name": "More Data", "value": 200}
            ],
            "metadata": {
                "row_count": getattr(execution, 'row_count', 0),
                "execution_time_ms": getattr(execution, 'execution_time_ms', 0)
            }
        }
        
        file_path = f"/tmp/export_{getattr(execution, 'execution_uuid', 'unknown')}.json"
        with open(file_path, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        return file_path

    async def _export_as_xml(self, execution: ReportExecution, options: Dict[str, Any]) -> str:
        """Export report data as XML"""
        
        # Mock XML export
        xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<report>
    <metadata>
        <report_id>{getattr(execution, 'report_id', '')}</report_id>
        <execution_id>{getattr(execution, 'id', '')}</execution_id>
        <generated_at>{(lambda dt: dt.isoformat() if dt and hasattr(dt, 'isoformat') else '')(getattr(execution, 'completed_at', None))}</generated_at>
        <row_count>{getattr(execution, 'row_count', 0)}</row_count>
    </metadata>
    <data>
        <row>
            <id>1</id>
            <name>Sample Data</name>
            <value>100</value>
        </row>
        <row>
            <id>2</id>
            <name>More Data</name>
            <value>200</value>
        </row>
    </data>
</report>"""
        
        file_path = f"/tmp/export_{getattr(execution, 'execution_uuid', 'unknown')}.xml"
        with open(file_path, 'w') as f:
            f.write(xml_content)
        
        return file_path

    async def _create_api_endpoint(self, execution: ReportExecution, options: Dict[str, Any]) -> str:
        """Create temporary API endpoint for report data"""
        
        # Mock API endpoint creation
        endpoint_id = str(uuid.uuid4())
        endpoint_url = f"https://api.digame.com/reports/data/{endpoint_id}"
        
        # In production, this would create a temporary API endpoint
        return endpoint_url

    def share_report(
        self,
        execution_id: int,
        share_config: Dict[str, Any],
        user_id: int
    ) -> Dict[str, Any]:
        """Create shareable link for report"""
        
        execution = self.db.query(ReportExecution).filter(
            ReportExecution.id == execution_id
        ).first()
        
        if not execution:
            raise ValueError("Execution not found")
        
        # Generate share token
        share_token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(
            days=share_config.get("expires_days", 7)
        )
        
        share_url = f"https://reports.digame.com/shared/{share_token}"
        
        # Mock share creation
        return {
            "share_token": share_token,
            "share_url": share_url,
            "expires_at": expires_at.isoformat(),
            "permissions": share_config.get("permissions", ["view"]),
            "password_protected": share_config.get("password_protected", False)
        }


# Utility function to get all services
# This function will now require more services to be passed in or constructed.
# For simplicity, we'll assume it can construct them or they are passed from a higher level context.
def get_reporting_services(
    db: Session,
    reporting_service_part1: ReportingService # Already requires CustomDashboardService
) -> Dict[str, Any]:
    """Get all reporting service instances"""
    # ReportingService (part1) is now passed in.
    # CustomDashboardService is already initialized within reporting_service_part1.
    # AnalyticsService is initialized within CustomDashboardService.

    return {
        "scheduling": ReportSchedulingService(db, reporting_service_part1=reporting_service_part1),
        "templates": ReportTemplateService(db), # Assuming this doesn't need reporting_service_part1
        "subscriptions": ReportSubscriptionService(db), # Assuming this doesn't need reporting_service_part1
        "analytics": ReportAnalyticsService(db),
        "cache": ReportCacheService(db),
        "export": ReportExportService(db)
    }


# Background task runner for scheduled reports
class ReportScheduler:
    """Background scheduler for automated report execution"""
    
    def __init__(self, db: Session, reporting_service_part1: ReportingService) -> None:
        self.db = db
        # Pass reporting_service_part1 to ReportSchedulingService constructor
        self.scheduling_service = ReportSchedulingService(db, reporting_service_part1=reporting_service_part1)
        self.running: bool = False
    
    async def start(self) -> None:
        """Start the report scheduler"""
        self.running = True
        
        while self.running:
            try:
                # Check for due schedules every minute
                due_schedules = self.scheduling_service.get_due_schedules() # This gets all types
                
                for schedule_item in due_schedules:
                    # The execute_scheduled_report method will handle different schedule types
                    await self.scheduling_service.execute_scheduled_report(schedule_item)
                
                # Wait 60 seconds before next check
                await asyncio.sleep(60)
                
            except Exception as e:
                print(f"Scheduler error: {e}")
                await asyncio.sleep(60)
    
    def stop(self) -> None:
        """Stop the report scheduler"""
        self.running = False


def _log_audit_event(
    tenant_id: int,
    event_type: str,
    event_category: str,
    report_id: Optional[int] = None,
    report_definition_id: Optional[int] = None, # Added this
    user_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None
):
    """Log audit event for reporting activities"""
    
    # This is a placeholder. Actual logging should use the ReportAuditLog model
    # and be saved to the database, likely via a shared logging service or utility.
    # For now, just printing.
    log_message = (
        f"AUDIT LOG: tenant_id={tenant_id}, event_type='{event_type}', category='{event_category}', "
        f"report_id={report_id}, report_definition_id={report_definition_id}, user_id={user_id}, details={details}"
    )
    print(log_message)

    # Example of how it might be implemented with ReportAuditLog model:
    # audit_log = ReportAuditLog(
    #     tenant_id=tenant_id,
    #     report_id=report_id,
    #     # report_definition_id=report_definition_id, # If ReportAuditLog model is updated
    #     user_id=user_id,
    #     event_type=event_type,
    #     event_category=event_category,
    #     details=details or {}
    # )
    # db_session_for_log.add(audit_log)
    # db_session_for_log.commit()
    pass