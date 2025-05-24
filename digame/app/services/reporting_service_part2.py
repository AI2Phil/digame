"""
Advanced Reporting Service - Part 2
Scheduling, templates, subscriptions, and advanced features
"""

from typing import Optional, List, Dict, Any, Tuple
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
import schedule
import time
from croniter import croniter

from ..models.reporting import (
    Report, ReportExecution, ReportSchedule, ReportSubscription,
    ReportTemplate, ReportAuditLog, ReportCache
)
from ..models.user import User
from ..models.tenant import Tenant


class ReportSchedulingService:
    """Service for managing report scheduling and automation"""

    def __init__(self, db: Session):
        self.db = db

    # Schedule Management
    def create_schedule(
        self,
        report_id: int,
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
        
        schedule = ReportSchedule(
            report_id=report_id,
            tenant_id=tenant_id,
            name=name,
            cron_expression=cron_expression,
            timezone=config.get("timezone", "UTC"),
            default_parameters=config.get("default_parameters", {}),
            default_filters=config.get("default_filters", {}),
            output_formats=config.get("output_formats", ["pdf"]),
            delivery_method=config.get("delivery_method", "email"),
            delivery_config=config.get("delivery_config", {}),
            next_run_at=next_run,
            created_by_user_id=created_by_user_id
        )
        
        self.db.add(schedule)
        self.db.commit()
        self.db.refresh(schedule)
        
        return schedule

    def get_due_schedules(self) -> List[ReportSchedule]:
        """Get schedules that are due to run"""
        
        now = datetime.utcnow()
        return self.db.query(ReportSchedule).filter(
            and_(
                ReportSchedule.is_active == True,
                ReportSchedule.next_run_at <= now
            )
        ).all()

    async def execute_scheduled_report(self, schedule: ReportSchedule) -> bool:
        """Execute a scheduled report"""
        
        try:
            # Get the report
            report = self.db.query(Report).filter(Report.id == schedule.report_id).first()
            if not report:
                schedule.update_execution_stats(False)
                self.db.commit()
                return False
            
            # Execute the report for each output format
            executions = []
            for output_format in schedule.output_formats:
                execution = await self._execute_report_for_schedule(
                    schedule, report, output_format
                )
                executions.append(execution)
            
            # Deliver the reports
            await self._deliver_scheduled_reports(schedule, executions)
            
            # Update schedule statistics
            schedule.update_execution_stats(True)
            
            # Calculate next run time
            schedule.next_run_at = self._calculate_next_run(
                schedule.cron_expression, 
                schedule.timezone
            )
            
            self.db.commit()
            return True
            
        except Exception as e:
            schedule.update_execution_stats(False)
            self.db.commit()
            
            # Log error
            self._log_audit_event(
                schedule.tenant_id,
                "scheduled_report_failed",
                "execution",
                report_id=schedule.report_id,
                details={"error": str(e), "schedule_id": schedule.id}
            )
            
            return False

    async def _execute_report_for_schedule(
        self,
        schedule: ReportSchedule,
        report: Report,
        output_format: str
    ) -> ReportExecution:
        """Execute report for scheduled delivery"""
        
        # Import the main reporting service
        from .reporting_service_part1 import ReportingService
        
        reporting_service = ReportingService(self.db)
        
        execution = await reporting_service.execute_report(
            report_id=report.id,
            tenant_id=report.tenant_id,
            parameters=schedule.default_parameters,
            filters=schedule.default_filters,
            output_format=output_format,
            user_id=None  # Scheduled execution
        )
        
        return execution

    async def _deliver_scheduled_reports(
        self,
        schedule: ReportSchedule,
        executions: List[ReportExecution]
    ):
        """Deliver scheduled reports via configured method"""
        
        delivery_method = schedule.delivery_method
        delivery_config = schedule.delivery_config
        
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
            if execution.is_completed:
                self._update_subscription_delivery_stats(schedule.report_id, recipients)

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
        try:
            croniter(cron_expr)
            return True
        except:
            return False

    def _calculate_next_run(self, cron_expr: str, timezone: str = "UTC") -> datetime:
        """Calculate next run time for cron expression"""
        try:
            cron = croniter(cron_expr, datetime.utcnow())
            return cron.get_next(datetime)
        except:
            # Fallback to 1 hour from now
            return datetime.utcnow() + timedelta(hours=1)

    def _update_subscription_delivery_stats(self, report_id: int, recipients: List[str]):
        """Update delivery statistics for subscriptions"""
        
        for email in recipients:
            subscription = self.db.query(ReportSubscription).filter(
                and_(
                    ReportSubscription.report_id == report_id,
                    ReportSubscription.delivery_address == email
                )
            ).first()
            
            if subscription:
                subscription.last_delivered_at = datetime.utcnow()
                subscription.delivery_count += 1
                self.db.commit()


class ReportTemplateService:
    """Service for managing report templates"""

    def __init__(self, db: Session):
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
        
        template = ReportTemplate(
            name=name,
            category=category,
            template_config=template_config,
            parameter_schema=template_config.get("parameter_schema", {}),
            is_public=tenant_id is None,  # Public if no tenant specified
            tenant_id=tenant_id,
            created_by_user_id=created_by_user_id
        )
        
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
                    ReportTemplate.is_public == True,
                    ReportTemplate.tenant_id == tenant_id
                )
            )
        else:
            query = query.filter(ReportTemplate.is_public == True)
        
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
    ) -> Report:
        """Create a new report from a template"""
        
        template = self.db.query(ReportTemplate).filter(
            ReportTemplate.id == template_id
        ).first()
        
        if not template:
            raise ValueError("Template not found")
        
        # Merge template config with provided parameters
        config = template.template_config.copy()
        config.update(parameters)
        
        # Import the main reporting service
        from .reporting_service_part1 import ReportingService
        
        reporting_service = ReportingService(self.db)
        
        report = reporting_service.create_report(
            tenant_id=tenant_id,
            name=name,
            category=template.category,
            report_type=config.get("report_type", "table"),
            data_source=config.get("data_source", "users"),
            config=config,
            created_by_user_id=created_by_user_id
        )
        
        # Update template usage statistics
        template.increment_usage()
        self.db.commit()
        
        return report

    def get_popular_templates(self, limit: int = 10) -> List[ReportTemplate]:
        """Get most popular templates by usage"""
        
        return self.db.query(ReportTemplate).filter(
            ReportTemplate.is_public == True
        ).order_by(desc(ReportTemplate.usage_count)).limit(limit).all()


class ReportSubscriptionService:
    """Service for managing report subscriptions"""

    def __init__(self, db: Session):
        self.db = db

    def create_subscription(
        self,
        report_id: int,
        user_id: int,
        tenant_id: int,
        config: Dict[str, Any]
    ) -> ReportSubscription:
        """Create a new report subscription"""
        
        subscription = ReportSubscription(
            report_id=report_id,
            user_id=user_id,
            tenant_id=tenant_id,
            delivery_method=config.get("delivery_method", "email"),
            delivery_address=config.get("delivery_address"),
            preferred_format=config.get("preferred_format", "pdf"),
            frequency_override=config.get("frequency_override"),
            custom_schedule=config.get("custom_schedule"),
            custom_parameters=config.get("custom_parameters", {}),
            custom_filters=config.get("custom_filters", {})
        )
        
        self.db.add(subscription)
        self.db.commit()
        self.db.refresh(subscription)
        
        return subscription

    def get_user_subscriptions(self, user_id: int, tenant_id: int) -> List[ReportSubscription]:
        """Get all subscriptions for a user"""
        
        return self.db.query(ReportSubscription).filter(
            and_(
                ReportSubscription.user_id == user_id,
                ReportSubscription.tenant_id == tenant_id,
                ReportSubscription.is_active == True
            )
        ).all()

    def get_report_subscribers(self, report_id: int) -> List[ReportSubscription]:
        """Get all subscribers for a report"""
        
        return self.db.query(ReportSubscription).filter(
            and_(
                ReportSubscription.report_id == report_id,
                ReportSubscription.is_active == True
            )
        ).all()


class ReportAnalyticsService:
    """Service for report usage analytics and insights"""

    def __init__(self, db: Session):
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

    def __init__(self, db: Session):
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

    def __init__(self, db: Session):
        self.db = db

    async def export_report_data(
        self,
        execution_id: int,
        export_format: str,
        options: Dict[str, Any] = None
    ) -> str:
        """Export report data in various formats"""
        
        execution = self.db.query(ReportExecution).filter(
            ReportExecution.id == execution_id
        ).first()
        
        if not execution or not execution.is_completed:
            raise ValueError("Execution not found or not completed")
        
        # Generate export based on format
        if export_format == "json":
            return await self._export_as_json(execution, options)
        elif export_format == "xml":
            return await self._export_as_xml(execution, options)
        elif export_format == "api":
            return await self._create_api_endpoint(execution, options)
        else:
            raise ValueError(f"Unsupported export format: {export_format}")

    async def _export_as_json(self, execution: ReportExecution, options: Dict[str, Any]) -> str:
        """Export report data as JSON"""
        
        # Mock JSON export
        export_data = {
            "report_id": execution.report_id,
            "execution_id": execution.id,
            "generated_at": execution.completed_at.isoformat() if execution.completed_at else None,
            "data": [
                {"id": 1, "name": "Sample Data", "value": 100},
                {"id": 2, "name": "More Data", "value": 200}
            ],
            "metadata": {
                "row_count": execution.row_count,
                "execution_time_ms": execution.execution_time_ms
            }
        }
        
        file_path = f"/tmp/export_{execution.execution_uuid}.json"
        with open(file_path, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        return file_path

    async def _export_as_xml(self, execution: ReportExecution, options: Dict[str, Any]) -> str:
        """Export report data as XML"""
        
        # Mock XML export
        xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<report>
    <metadata>
        <report_id>{execution.report_id}</report_id>
        <execution_id>{execution.id}</execution_id>
        <generated_at>{execution.completed_at.isoformat() if execution.completed_at else ''}</generated_at>
        <row_count>{execution.row_count}</row_count>
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
        
        file_path = f"/tmp/export_{execution.execution_uuid}.xml"
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
def get_reporting_services(db: Session) -> Dict[str, Any]:
    """Get all reporting service instances"""
    return {
        "scheduling": ReportSchedulingService(db),
        "templates": ReportTemplateService(db),
        "subscriptions": ReportSubscriptionService(db),
        "analytics": ReportAnalyticsService(db),
        "cache": ReportCacheService(db),
        "export": ReportExportService(db)
    }


# Background task runner for scheduled reports
class ReportScheduler:
    """Background scheduler for automated report execution"""
    
    def __init__(self, db: Session):
        self.db = db
        self.scheduling_service = ReportSchedulingService(db)
        self.running = False
    
    async def start(self):
        """Start the report scheduler"""
        self.running = True
        
        while self.running:
            try:
                # Check for due schedules every minute
                due_schedules = self.scheduling_service.get_due_schedules()
                
                for schedule in due_schedules:
                    await self.scheduling_service.execute_scheduled_report(schedule)
                
                # Wait 60 seconds before next check
                await asyncio.sleep(60)
                
            except Exception as e:
                print(f"Scheduler error: {e}")
                await asyncio.sleep(60)
    
    def stop(self):
        """Stop the report scheduler"""
        self.running = False


def _log_audit_event(
    tenant_id: int,
    event_type: str,
    event_category: str,
    report_id: Optional[int] = None,
    user_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None
):
    """Log audit event for reporting activities"""
    
    # This would be implemented in the main service
    pass