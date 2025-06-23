"""
Advanced Reporting Service - Part 1
Core report management, execution, and data processing
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
import pandas as pd
import io
import base64

# PDF and Excel generation
try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment
    from openpyxl.chart import BarChart, LineChart, PieChart, Reference
except ImportError:
    # Mock imports for development
    pass

from ..models.reporting import (
    Report, ReportExecution, ReportSchedule, ReportSubscription,
    ReportTemplate, ReportAuditLog, ReportCache
)
from ..models.user import User
from ..models.tenant import Tenant
# Import CustomDashboardService and its getter, and the new ReportDefinition model
from ..models.dashboard_custom import ReportDefinition # Assuming ReportDefinition is in dashboard_custom
from .dashboard_service_custom import CustomDashboardService, get_custom_dashboard_service
from ..schemas import analytics_schemas # For ReportDefinition schema types


class ReportingService:
    """Service for managing advanced reporting and PDF generation"""

    def __init__(self, db: Session, custom_dashboard_service: CustomDashboardService):
        self.db = db
        self.custom_dashboard_service = custom_dashboard_service
        self.executor = ThreadPoolExecutor(max_workers=4)

    # Report Management
    def create_report(
        self,
        tenant_id: int,
        name: str,
        category: str,
        report_type: str,
        data_source: str,
        config: Dict[str, Any],
        created_by_user_id: int
    ) -> Report:
        """Create a new report definition"""
        
        report = Report(
            tenant_id=tenant_id,
            name=name,
            category=category,
            report_type=report_type,
            data_source=data_source,
            query_config=config.get("query_config", {}),
            visualization_config=config.get("visualization_config", {}),
            format_config=config.get("format_config", {}),
            default_filters=config.get("default_filters", {}),
            parameter_schema=config.get("parameter_schema", {}),
            is_public=config.get("is_public", False),
            allowed_roles=config.get("allowed_roles", []),
            allowed_users=config.get("allowed_users", []),
            created_by_user_id=created_by_user_id
        )
        
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        
        # Log report creation
        self._log_audit_event(
            tenant_id,
            "report_created",
            "management",
            report_id=report.id,
            user_id=created_by_user_id,
            details={"name": name, "category": category, "type": report_type}
        )
        
        return report

    def get_report(self, report_id: int, tenant_id: int) -> Optional[Report]:
        """Get report by ID with tenant validation"""
        return self.db.query(Report).filter(
            and_(Report.id == report_id, Report.tenant_id == tenant_id)
        ).first()

    def get_tenant_reports(
        self,
        tenant_id: int,
        category: Optional[str] = None,
        report_type: Optional[str] = None,
        user_id: Optional[int] = None,
        user_roles: Optional[List[str]] = None
    ) -> List[Report]:
        """Get reports for a tenant with access control"""
        
        query = self.db.query(Report).filter(
            and_(Report.tenant_id == tenant_id, Report.is_active == True)
        )
        
        if category:
            query = query.filter(Report.category == category)
        
        if report_type:
            query = query.filter(Report.report_type == report_type)
        
        reports = query.all()
        
        # Apply access control if user context provided
        if user_id is not None and user_roles is not None:
            accessible_reports = []
            for report in reports:
                if report.can_access(user_id, user_roles):
                    accessible_reports.append(report)
            return accessible_reports
        
        return reports

    def update_report(
        self,
        report_id: int,
        tenant_id: int,
        updates: Dict[str, Any],
        user_id: int
    ) -> Optional[Report]:
        """Update report configuration"""
        
        report = self.get_report(report_id, tenant_id)
        if not report:
            return None
        
        # Track changes for audit
        changes = {}
        for key, value in updates.items():
            if hasattr(report, key) and getattr(report, key) != value:
                changes[key] = {"old": getattr(report, key), "new": value}
                setattr(report, key, value)
        
        report.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(report)
        
        # Log changes
        if changes:
            self._log_audit_event(
                tenant_id,
                "report_updated",
                "management",
                report_id=report_id,
                user_id=user_id,
                details={"changes": changes}
            )
        
        return report

    def delete_report(self, report_id: int, tenant_id: int, user_id: int) -> bool:
        """Delete a report and all associated data"""
        
        report = self.get_report(report_id, tenant_id)
        if not report:
            return False
        
        # Delete associated data
        self.db.query(ReportExecution).filter(ReportExecution.report_id == report_id).delete()
        self.db.query(ReportSchedule).filter(ReportSchedule.report_id == report_id).delete()
        self.db.query(ReportSubscription).filter(ReportSubscription.report_id == report_id).delete()
        self.db.query(ReportCache).filter(ReportCache.report_id == report_id).delete()
        
        # Delete the report
        self.db.delete(report)
        self.db.commit()
        
        # Log deletion
        self._log_audit_event(
            tenant_id,
            "report_deleted",
            "management",
            report_id=report_id,
            user_id=user_id,
            details={"name": report.name}
        )
        
        return True

    # Report Execution
    async def execute_report(
        self,
        report_id: int,
        tenant_id: int,
        parameters: Optional[Dict[str, Any]] = None,
        filters: Optional[Dict[str, Any]] = None,
        output_format: str = "json",
        user_id: Optional[int] = None
    ) -> ReportExecution:
        """Execute a report and generate output"""
        
        report = self.get_report(report_id, tenant_id)
        if not report:
            raise ValueError("Report not found")
        
        # Create execution record
        execution = ReportExecution(
            report_id=report_id,
            tenant_id=tenant_id,
            executed_by_user_id=user_id,
            execution_type="manual" if user_id else "api",
            parameters=parameters or {},
            filters_applied=filters or {},
            output_format=output_format,
            status="running"
        )
        
        self.db.add(execution)
        self.db.commit()
        self.db.refresh(execution)
        
        try:
            # Check cache first
            cache_key = self._generate_cache_key(report_id, parameters, filters)
            cached_result = self._get_cached_result(cache_key)
            
            if cached_result:
                execution.status = "completed"
                execution.completed_at = datetime.utcnow()
                execution.execution_time_ms = 50  # Cache hit is fast
                execution.row_count = cached_result.get("row_count", 0)
                self.db.commit()
                
                # Generate output file if needed
                if output_format in ["pdf", "excel", "csv"]:
                    file_path = await self._generate_output_file(
                        execution, cached_result["data"], output_format
                    )
                    execution.file_path = file_path
                    execution.download_url = self._generate_download_url(file_path)
                    execution.expires_at = datetime.utcnow() + timedelta(hours=24)
                    self.db.commit()
                
                return execution
            
            # Execute report query
            start_time = datetime.utcnow()
            data = await self._execute_report_query(report, parameters, filters)
            query_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            # Process and format data
            processed_data = self._process_report_data(report, data)
            
            # Generate output file if needed
            file_path = None
            render_time = 0
            if output_format in ["pdf", "excel", "csv"]:
                render_start = datetime.utcnow()
                file_path = await self._generate_output_file(execution, processed_data, output_format)
                render_time = (datetime.utcnow() - render_start).total_seconds() * 1000
            
            # Update execution record
            execution.status = "completed"
            execution.completed_at = datetime.utcnow()
            execution.execution_time_ms = query_time + render_time
            execution.query_time_ms = query_time
            execution.render_time_ms = render_time
            execution.row_count = len(processed_data) if isinstance(processed_data, list) else 0
            execution.file_path = file_path
            
            if file_path:
                execution.download_url = self._generate_download_url(file_path)
                execution.expires_at = datetime.utcnow() + timedelta(hours=24)
                execution.file_size_bytes = self._get_file_size(file_path)
            
            self.db.commit()
            
            # Cache the result
            self._cache_result(cache_key, report_id, tenant_id, processed_data, execution.row_count)
            
            # Update report statistics
            report.last_generated_at = datetime.utcnow()
            report.generation_count += 1
            if report.avg_generation_time_ms:
                report.avg_generation_time_ms = (
                    report.avg_generation_time_ms + execution.execution_time_ms
                ) / 2
            else:
                report.avg_generation_time_ms = execution.execution_time_ms
            report.last_generation_time_ms = execution.execution_time_ms
            self.db.commit()
            
            # Log execution
            self._log_audit_event(
                tenant_id,
                "report_executed",
                "execution",
                report_id=report_id,
                user_id=user_id,
                details={
                    "execution_id": execution.id,
                    "output_format": output_format,
                    "row_count": execution.row_count,
                    "execution_time_ms": execution.execution_time_ms
                }
            )
            
            return execution
            
        except Exception as e:
            # Update execution with error
            execution.status = "failed"
            execution.completed_at = datetime.utcnow()
            execution.error_message = str(e)
            self.db.commit()
            
            # Log error
            self._log_audit_event(
                tenant_id,
                "report_execution_failed",
                "execution",
                report_id=report_id,
                user_id=user_id,
                details={"error": str(e), "execution_id": execution.id}
            )
            
            raise

    async def _execute_report_query(
        self,
        report: Report,
        parameters: Optional[Dict[str, Any]],
        filters: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Execute the actual data query for the report.
        Conceptually, this would use `parameters` and `filters` to build dynamic queries.
        The `report.query_config` might define base queries or allowable fields.
        For interactive exploration, `parameters` could include things like:
        - group_by: list of fields to group by
        - aggregations: dict of field -> aggregation_function (e.g. {"sales": "SUM", "users": "COUNT"})
        - sort_by: list of fields to sort by
        - dynamic_filters: additional filters applied at runtime
        """
        
        # This is a mock implementation
        # In production, this would connect to actual data sources and build dynamic queries
        
        data_source = report.data_source
        # query_config = report.query_config # Would be used to build the query
        
        # Simulate using parameters for filtering if provided (very basic example)
        print(f"Executing query for report {report.id} with parameters: {parameters}, filters: {filters}")

        # Mock data based on data source
        if data_source == "users":
            data = self._get_mock_user_data(parameters, filters)
        elif data_source == "analytics_performance": # New specific data source
            data = self._get_mock_advanced_performance_data(parameters, filters)
        elif data_source == "analytics_roi": # New specific data source
            data = self._get_mock_advanced_roi_data(parameters, filters)
        elif data_source == "analytics": # Existing generic analytics
            data = self._get_mock_analytics_data(parameters, filters)
        elif data_source == "activities":
            data = self._get_mock_activity_data(parameters, filters)
        elif data_source == "financial":
            data = self._get_mock_financial_data(parameters, filters)
        else:
            data = []

        # Conceptual: Apply dynamic aggregations/grouping based on `parameters` here
        # For mock, we just return the raw mock data subset.
        return data

    def _get_mock_advanced_performance_data(self, parameters: Optional[Dict], filters: Optional[Dict]) -> List[Dict]:
        """Generate mock advanced performance data for reports"""
        return [
            {"date": "2025-05-01", "metric": "User Engagement Score", "value": 78.5, "dimension1": "Region A", "dimension2": "Product X"},
            {"date": "2025-05-01", "metric": "Task Completion Rate", "value": 92.1, "dimension1": "Region A", "dimension2": "Product X"},
            {"date": "2025-05-02", "metric": "User Engagement Score", "value": 79.2, "dimension1": "Region B", "dimension2": "Product Y"},
            {"date": "2025-05-02", "metric": "Task Completion Rate", "value": 90.5, "dimension1": "Region B", "dimension2": "Product Y"},
        ]

    def _get_mock_advanced_roi_data(self, parameters: Optional[Dict], filters: Optional[Dict]) -> List[Dict]:
        """Generate mock advanced ROI data for reports"""
        return [
            {"project_name": "Project Alpha", "quarter": "Q1 2025", "investment": 50000, "returns": 75000, "roi_percent": 50.0, "benchmark_roi": 40.0},
            {"project_name": "Project Beta", "quarter": "Q1 2025", "investment": 120000, "returns": 150000, "roi_percent": 25.0, "benchmark_roi": 30.0},
        ]

    def _get_mock_user_data(self, parameters: Optional[Dict], filters: Optional[Dict]) -> List[Dict]:
        """Generate mock user data for reports"""
        return [
            {
                "user_id": 1,
                "email": "user1@demo.com",
                "full_name": "John Doe",
                "role": "admin",
                "created_at": "2025-01-15",
                "last_login": "2025-05-24",
                "status": "active",
                "login_count": 45
            },
            {
                "user_id": 2,
                "email": "user2@demo.com",
                "full_name": "Jane Smith",
                "role": "manager",
                "created_at": "2025-02-01",
                "last_login": "2025-05-23",
                "status": "active",
                "login_count": 32
            },
            {
                "user_id": 3,
                "email": "user3@demo.com",
                "full_name": "Bob Johnson",
                "role": "member",
                "created_at": "2025-03-10",
                "last_login": "2025-05-22",
                "status": "inactive",
                "login_count": 18
            }
        ]

    def _get_mock_analytics_data(self, parameters: Optional[Dict], filters: Optional[Dict]) -> List[Dict]:
        """Generate mock analytics data for reports"""
        return [
            {
                "date": "2025-05-20",
                "page_views": 1247,
                "unique_visitors": 342,
                "bounce_rate": 0.23,
                "avg_session_duration": 245,
                "conversion_rate": 0.034
            },
            {
                "date": "2025-05-21",
                "page_views": 1356,
                "unique_visitors": 389,
                "bounce_rate": 0.21,
                "avg_session_duration": 267,
                "conversion_rate": 0.041
            },
            {
                "date": "2025-05-22",
                "page_views": 1189,
                "unique_visitors": 298,
                "bounce_rate": 0.26,
                "avg_session_duration": 223,
                "conversion_rate": 0.029
            }
        ]

    def _get_mock_activity_data(self, parameters: Optional[Dict], filters: Optional[Dict]) -> List[Dict]:
        """Generate mock activity data for reports"""
        return [
            {
                "activity_id": 1,
                "user_id": 1,
                "activity_type": "login",
                "timestamp": "2025-05-24 09:30:00",
                "duration_minutes": 120,
                "productivity_score": 8.5,
                "category": "work"
            },
            {
                "activity_id": 2,
                "user_id": 2,
                "activity_type": "meeting",
                "timestamp": "2025-05-24 10:00:00",
                "duration_minutes": 60,
                "productivity_score": 7.2,
                "category": "collaboration"
            },
            {
                "activity_id": 3,
                "user_id": 1,
                "activity_type": "coding",
                "timestamp": "2025-05-24 11:30:00",
                "duration_minutes": 90,
                "productivity_score": 9.1,
                "category": "development"
            }
        ]

    def _get_mock_financial_data(self, parameters: Optional[Dict], filters: Optional[Dict]) -> List[Dict]:
        """Generate mock financial data for reports"""
        return [
            {
                "month": "2025-01",
                "revenue": 45000,
                "expenses": 32000,
                "profit": 13000,
                "customers": 120,
                "churn_rate": 0.05
            },
            {
                "month": "2025-02",
                "revenue": 48000,
                "expenses": 33500,
                "profit": 14500,
                "customers": 135,
                "churn_rate": 0.04
            },
            {
                "month": "2025-03",
                "revenue": 52000,
                "expenses": 35000,
                "profit": 17000,
                "customers": 148,
                "churn_rate": 0.03
            }
        ]

    def _process_report_data(self, report: Report, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process and transform raw data according to report configuration"""
        
        if not raw_data:
            return []
        
        # Apply any data transformations specified in the report config
        visualization_config = report.visualization_config
        
        # For now, return data as-is
        # In production, this would apply aggregations, calculations, etc.
        return raw_data

    # File Generation Methods
    async def _generate_output_file(
        self,
        execution: ReportExecution,
        data: List[Dict[str, Any]],
        output_format: str
    ) -> str:
        """Generate output file in specified format, considering report.export_config"""
        report = self.db.query(Report).filter(Report.id == execution.report_id).first()
        export_config = report.export_config if report else {}

        # Potentially filter/transform data based on export_config before generation
        # For example, if export_config specifies certain columns:
        # columns_to_export = export_config.get("columns")
        # if columns_to_export and data:
        #     data = [{col: row[col] for col in columns_to_export if col in row} for row in data]

        if output_format == "pdf":
            return await self._generate_pdf_report(execution, data, export_config)
        elif output_format == "excel":
            return await self._generate_excel_report(execution, data, export_config)
        elif output_format == "csv":
            return await self._generate_csv_report(execution, data, export_config)
        else:
            raise ValueError(f"Unsupported output format: {output_format}")

    async def _generate_pdf_report(self, execution: ReportExecution, data: List[Dict[str, Any]], export_config: Dict[str, Any] = None) -> str:
        """Generate PDF report using ReportLab"""
        
        # Mock PDF generation for development
        file_path = f"/tmp/report_{execution.execution_uuid}.pdf"
        
        # In production, this would use ReportLab to generate actual PDFs
        mock_pdf_content = f"""
        %PDF-1.4
        1 0 obj
        <<
        /Type /Catalog
        /Pages 2 0 R
        >>
        endobj
        
        2 0 obj
        <<
        /Type /Pages
        /Kids [3 0 R]
        /Count 1
        >>
        endobj
        
        3 0 obj
        <<
        /Type /Page
        /Parent 2 0 R
        /MediaBox [0 0 612 792]
        /Contents 4 0 R
        >>
        endobj
        
        4 0 obj
        <<
        /Length 44
        >>
        stream
        BT
        /F1 12 Tf
        72 720 Td
        (Report Data: {len(data)} rows) Tj
        ET
        endstream
        endobj
        
        xref
        0 5
        0000000000 65535 f 
        0000000009 00000 n 
        0000000058 00000 n 
        0000000115 00000 n 
        0000000206 00000 n 
        trailer
        <<
        /Size 5
        /Root 1 0 R
        >>
        startxref
        299
        %%EOF
        """
        
        # Write mock PDF content
        with open(file_path, 'w') as f:
            f.write(mock_pdf_content)
        
        return file_path

    async def _generate_excel_report(self, execution: ReportExecution, data: List[Dict[str, Any]], export_config: Dict[str, Any] = None) -> str:
        """Generate Excel report using openpyxl"""
        
        file_path = f"/tmp/report_{execution.execution_uuid}.xlsx"
        
        # Mock Excel generation
        # In production, this would use openpyxl to create actual Excel files
        # It would also use export_config to determine sheet names, specific columns, formatting, etc.
        custom_sheet_name = export_config.get("sheet_name", "Report Data") if export_config else "Report Data"

        with open(file_path, 'w') as f:
            f.write(f"Mock Excel Report - Sheet: {custom_sheet_name}\nData rows: {len(data)}\n")
            if data:
                columns_to_export = export_config.get("columns") if export_config else list(data[0].keys())
                headers = [col for col in columns_to_export if col in data[0]] # Ensure header exists in data

                f.write(",".join(headers) + "\n")
                
                for row in data:
                    values = [str(row.get(header, "")) for header in headers]
                    f.write(",".join(values) + "\n")
        
        return file_path

    async def _generate_csv_report(self, execution: ReportExecution, data: List[Dict[str, Any]], export_config: Dict[str, Any] = None) -> str:
        """Generate CSV report"""
        
        file_path = f"/tmp/report_{execution.execution_uuid}.csv"
        
        if not data:
            with open(file_path, 'w') as f:
                f.write("No data available\n")
            return file_path
        
        # Write CSV data
        # export_config could specify delimiter, quoting, specific columns etc.
        columns_to_export = export_config.get("columns") if export_config else list(data[0].keys())
        headers = [col for col in columns_to_export if col in data[0]]

        with open(file_path, 'w') as f:
            f.write(",".join(headers) + "\n")
            
            for row in data:
                values = [str(row.get(header, "")).replace(",", ";") for header in headers] # Basic CSV escape
                f.write(",".join(values) + "\n")
        
        return file_path

    # Utility Methods
    def _generate_cache_key(
        self,
        report_id: int,
        parameters: Optional[Dict[str, Any]],
        filters: Optional[Dict[str, Any]]
    ) -> str:
        """Generate cache key for report results"""
        
        cache_data = {
            "report_id": report_id,
            "parameters": parameters or {},
            "filters": filters or {}
        }
        
        cache_string = json.dumps(cache_data, sort_keys=True)
        return hashlib.md5(cache_string.encode()).hexdigest()

    def _get_cached_result(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached report result"""
        
        cache_entry = self.db.query(ReportCache).filter(
            ReportCache.cache_key == cache_key
        ).first()
        
        if cache_entry and not cache_entry.is_expired:
            cache_entry.increment_hit_count()
            self.db.commit()
            return cache_entry.result_data
        
        return None

    def _cache_result(
        self,
        cache_key: str,
        report_id: int,
        tenant_id: int,
        data: List[Dict[str, Any]],
        row_count: int
    ):
        """Cache report result"""
        
        # Calculate cache expiration (24 hours)
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        # Create cache entry
        cache_entry = ReportCache(
            cache_key=cache_key,
            report_id=report_id,
            tenant_id=tenant_id,
            parameters_hash=cache_key[:32],  # Use part of cache key
            data_hash=hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest(),
            result_data=data,
            metadata={"row_count": row_count},
            expires_at=expires_at
        )
        
        self.db.add(cache_entry)
        self.db.commit()

    def _generate_download_url(self, file_path: str) -> str:
        """Generate signed download URL for report file"""
        
        # Mock URL generation
        # In production, this would generate signed S3 URLs or similar
        filename = file_path.split("/")[-1]
        return f"https://reports.digame.com/download/{filename}?token=mock_token"

    def _get_file_size(self, file_path: str) -> int:
        """Get file size in bytes"""
        
        try:
            import os
            return os.path.getsize(file_path)
        except:
            return 0

    def _log_audit_event(
        self,
        tenant_id: int,
        event_type: str,
        event_category: str,
        report_id: Optional[int] = None,
        user_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """Log audit event for reporting activities"""
        
        audit_log = ReportAuditLog(
            tenant_id=tenant_id,
            report_id=report_id,
            user_id=user_id,
            event_type=event_type,
            event_category=event_category,
            details=details or {}
        )
        
        self.db.add(audit_log)
        # Note: Commit is handled by the calling method


def get_reporting_service(
    db: Session = Depends(get_db), # Assuming get_db is available from ..database
    custom_dashboard_service: CustomDashboardService = Depends(get_custom_dashboard_service)
) -> ReportingService:
    """Get reporting service instance"""
    # Need to import Depends and get_db
    from fastapi import Depends
    from ..database import get_db
    return ReportingService(db=db, custom_dashboard_service=custom_dashboard_service)

    # --- New Methods for ReportDefinition ---

    def create_report_definition(
        self,
        report_def_create: schemas.ReportDefinitionCreate,
        tenant_id: int,
        user_id: int
    ) -> ReportDefinition:
        """Create a new ReportDefinition."""
        # Ensure ReportDefinition model is correctly imported and defined as a SQLAlchemy model
        # from ..models.dashboard_custom import ReportDefinition (already imported at top)

        # The content_blocks in report_def_create are Pydantic models.
        # If ReportDefinition SQLAlchemy model stores content_blocks as JSON,
        # they need to be converted.
        content_blocks_as_dict = [block.dict() for block in report_def_create.content_blocks]

        db_report_def = ReportDefinition(
            name=report_def_create.name,
            description=report_def_create.description,
            report_type=report_def_create.report_type,
            content_blocks=content_blocks_as_dict, # Store as JSON
            global_filters=[filter.dict() for filter in report_def_create.global_filters], # Store as JSON
            output_format=report_def_create.output_format,
            tenant_id=tenant_id,
            user_id=user_id, # Assuming ReportDefinition model has user_id
            # definition_uuid=str(uuid.uuid4()) # Assuming model handles UUID
        )
        self.db.add(db_report_def)
        self.db.commit()
        self.db.refresh(db_report_def)
        return db_report_def

    def get_report_definition(self, report_definition_id: int, tenant_id: int) -> Optional[ReportDefinition]:
        """Retrieve a ReportDefinition by its ID and tenant_id."""
        # Assuming ReportDefinition model has tenant_id and user_id fields similar to AnalyticsDashboard
        return self.db.query(ReportDefinition).filter(
            ReportDefinition.id == report_definition_id,
            ReportDefinition.tenant_id == tenant_id # Ensure tenant isolation
        ).first()

    def list_report_definitions(
        self,
        tenant_id: int,
        user_id: Optional[int] = None, # For potential filtering by owner
        skip: int = 0,
        limit: int = 100
    ) -> List[ReportDefinition]:
        """List ReportDefinitions for a tenant, optionally filtered by user_id."""
        query = self.db.query(ReportDefinition).filter(ReportDefinition.tenant_id == tenant_id)
        if user_id:
            # This assumes ReportDefinition model has a 'user_id' field for ownership
            query = query.filter(ReportDefinition.user_id == user_id)
        return query.order_by(ReportDefinition.name).offset(skip).limit(limit).all()

    def update_report_definition(
        self,
        report_definition_id: int,
        report_def_update: schemas.ReportDefinitionUpdate,
        tenant_id: int,
        user_id: int # For ownership/permission check
    ) -> Optional[ReportDefinition]:
        """Update an existing ReportDefinition."""
        db_report_def = self.db.query(ReportDefinition).filter(
            ReportDefinition.id == report_definition_id,
            ReportDefinition.tenant_id == tenant_id
        ).first()

        if not db_report_def:
            return None

        # Add ownership check if ReportDefinition has user_id
        if hasattr(db_report_def, 'user_id') and db_report_def.user_id != user_id:
             # Or raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this report definition")
            return None

        update_data = report_def_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            if key == "content_blocks" and value is not None:
                setattr(db_report_def, key, [block.dict() for block in value])
            elif key == "global_filters" and value is not None:
                setattr(db_report_def, key, [filter.dict() for filter in value])
            elif hasattr(db_report_def, key):
                setattr(db_report_def, key, value)

        db_report_def.updated_at = datetime.utcnow() # Assuming model has updated_at
        self.db.commit()
        self.db.refresh(db_report_def)
        return db_report_def

    def delete_report_definition(
        self,
        report_definition_id: int,
        tenant_id: int,
        user_id: int # For ownership/permission check
    ) -> bool:
        """Delete a ReportDefinition."""
        db_report_def = self.db.query(ReportDefinition).filter(
            ReportDefinition.id == report_definition_id,
            ReportDefinition.tenant_id == tenant_id
        ).first()

        if not db_report_def:
            return False

        if hasattr(db_report_def, 'user_id') and db_report_def.user_id != user_id:
            return False # Not authorized

        # TODO: Consider deleting associated ReportSchedules if cascading delete is not set up in DB model
        # self.db.query(ReportSchedule).filter(ReportSchedule.report_definition_id == report_definition_id).delete()

        self.db.delete(db_report_def)
        self.db.commit()
        return True

    async def generate_report_data(
        self,
        report_definition_id: int,
        tenant_id: int,
        # current_user: User # Optional: if user-specific data within report is needed
    ) -> Dict[str, Any]:
        """
        Generates the data for a report based on its ReportDefinition.
        This method focuses on compiling the data, not on file generation (PDF, etc.).
        """
        report_definition = self.get_report_definition(report_definition_id, tenant_id)

        if not report_definition:
            raise ValueError(f"ReportDefinition with id {report_definition_id} not found for tenant {tenant_id}")

        compiled_report_data = {
            "report_name": report_definition.name,
            "report_description": report_definition.description,
            "report_type": report_definition.report_type,
            "generated_at": datetime.utcnow(),
            "content": []
        }

        for block_config in report_definition.content_blocks:
            block_data_payload = None
            if block_config.block_type == "text":
                block_data_payload = {"text": block_config.text_content}
            elif block_config.data_source:
                # Simulate the structure get_widget_data expects or refactor get_widget_data.
                # For now, we directly use the data_source from the block.
                # CustomDashboardService.get_widget_data needs a widget_id.
                # We need a way to get data based on data_source_config directly.
                #
                # Option A: Modify get_widget_data to accept data_source_config (more invasive for now)
                # Option B: Create a helper in CustomDashboardService or here.
                # Option C: For now, let's assume CustomDashboardService could have a method like:
                #   fetch_data_for_source(data_source: DashboardWidgetDataSource, tenant_id: int)
                # This is what get_widget_data essentially does after fetching the widget.
                #
                # For this step, let's construct what get_widget_data in CustomDashboardService
                # would effectively do with the block's data_source.
                # This is a temporary direct call structure to analytics_service for simplicity,
                # mimicking what an adapted get_widget_data would do.
                # Proper way: CustomDashboardService.get_data_for_source(block_config.data_source, tenant_id)

                # This part needs to call the logic now within CustomDashboardService.get_widget_data
                # We can't directly call get_widget_data as it expects a widget_id.
                #
                # Let's assume a refactoring of get_widget_data or a new helper method in CustomDashboardService.
                # For the purpose of this step, we'll outline the call.
                # The actual data fetching logic is already in CustomDashboardService.get_widget_data's `if/elif` block.
                # We need to pass `block_config.data_source.type` and `block_config.data_source.query_params`.

                # Simplified: we'll call a conceptual method on custom_dashboard_service
                # that processes a data_source directly.
                # This conceptual method encapsulates the if/elif logic from get_widget_data.

                # To make this runnable, we'll have to pass a mock widget_id or -1
                # and then have get_widget_data use the passed block_config if widget_id is -1.
                # This is a hack. A better way is to refactor get_widget_data.
                # Let's assume we have a (mocked for now) way to get data for a raw data_source.

                # For now, this is a placeholder for how data would be fetched.
                # The actual fetching logic is in self.custom_dashboard_service.get_widget_data,
                # but it's keyed by widget_id.
                # A direct call to the data fetching part of get_widget_data is needed.

                # Let's assume `self.custom_dashboard_service` has a new method:
                # `async def get_data_for_data_source(self, data_source: schemas.DashboardWidgetDataSource, tenant_id: int)`
                # which contains the core logic of `get_widget_data`'s if/elif block.

                # If CustomDashboardService.get_widget_data is not refactored,
                # ReportingService would have to replicate the data fetching logic
                # from CustomDashboardService based on block_config.data_source.type,
                # which is not ideal (code duplication).

                # For now, let's assume we will call a helper or refactored method.
                # This part is the conceptual link.
                try:
                    # This is where the call to the data fetching logic (now in CustomDashboardService) happens.
                    # We need to adapt this. For now, let's create a placeholder call.
                    # This will be refined when CustomDashboardService is confirmed.
                    # The `get_widget_data` in CustomDashboardService currently requires a widget_id.
                    # This is a structural challenge for calling it directly.
                    # We will simulate the data fetching part. This requires CustomDashboardService to be enhanced
                    # or to duplicate logic.

                    # For the current step, let's assume a method exists in CustomDashboardService
                    # that takes a data_source object.
                    # widget_data_response = await self.custom_dashboard_service.get_data_from_source_config(
                    # tenant_id=tenant_id,
                    # data_source_config=block_config.data_source.dict() # Pass as dict
                    # )
                    # block_data_payload = widget_data_response.get("data")

                    # Given the current structure of get_widget_data, this is hard to call directly.
                    # We will mock the outcome for now.
                    # In a real implementation, CustomDashboardService.get_widget_data would be refactored,
                    # or a new method exposed by it.

                    # For now, let's construct a simplified call to the analytics_service directly,
                    # similar to what get_widget_data does, to show the flow.
                    # This means some logic from CustomDashboardService.get_widget_data is being
                    # conceptually used here.
                    source_type = block_config.data_source.type
                    q_params = block_config.data_source.query_params

                    # This is a simplified replication of logic within CustomDashboardService.get_widget_data
                    if source_type == "performance_metric_list":
                         metrics = self.custom_dashboard_service.analytics_service.get_performance_metrics(
                            tenant_id=tenant_id, metric_type=q_params.get("metric_type"),
                            category=q_params.get("category"), entity_type=q_params.get("entity_type"),
                            entity_id=q_params.get("entity_id"), limit=q_params.get("limit", 50)
                        )
                         block_data_payload = [schemas.PerformanceMetricInDB.from_orm(m).dict() for m in metrics]
                    elif source_type == "prediction_list":
                        predictions = self.custom_dashboard_service.analytics_service.get_predictions(
                            tenant_id=tenant_id, model_id=q_params.get("model_id"),
                            entity_type=q_params.get("entity_type"), entity_id=q_params.get("entity_id"),
                            limit=q_params.get("limit", 50)
                        )
                        block_data_payload = [schemas.AnalyticsPredictionInDB.from_orm(p).dict() for p in predictions]
                    # Add other types as needed, mirroring CustomDashboardService.get_widget_data
                    else:
                        block_data_payload = {"error": f"Data source type '{source_type}' not yet supported in report generation."}

                except Exception as e:
                    block_data_payload = {"error": f"Failed to fetch data for block '{block_config.title}': {str(e)}"}

            compiled_report_data["content"].append({
                "title": block_config.title,
                "block_type": block_config.block_type,
                "display_options": block_config.display_options,
                "data": block_data_payload
            })

        return compiled_report_data
