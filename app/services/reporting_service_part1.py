"""
Advanced Reporting Service - Part 1
Core report management, execution, and data processing
"""

from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from fastapi import Depends
import uuid
import json
import hashlib
import asyncio
from concurrent.futures import ThreadPoolExecutor
import pandas as pd
import io
import base64
import os # For file operations
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import httpx # For webhooks
import boto3 # For S3


# PDF and Excel generation
try:
    from reportlab.lib.pagesizes import letter, A4  # type: ignore
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer  # type: ignore
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # type: ignore
    from reportlab.lib import colors  # type: ignore
    from reportlab.lib.units import inch  # type: ignore
    import openpyxl  # type: ignore
    from openpyxl.styles import Font, PatternFill, Alignment  # type: ignore
    from openpyxl.chart import BarChart, LineChart, PieChart, Reference  # type: ignore
    REPORTLAB_AVAILABLE = True
    OPENPYXL_AVAILABLE = True
except ImportError:
    # Mock imports for development
    REPORTLAB_AVAILABLE = False
    OPENPYXL_AVAILABLE = False
    # Create mock objects to prevent NameError
    letter = A4 = None
    SimpleDocTemplate = Table = TableStyle = Paragraph = Spacer = None
    getSampleStyleSheet = ParagraphStyle = None
    colors = inch = None
    openpyxl = None
    Font = PatternFill = Alignment = None
    BarChart = LineChart = PieChart = Reference = None

from ..models.reporting import (
    Report, ReportExecution, ReportSchedule, ReportSubscription,
    ReportTemplate, ReportAuditLog, ReportCache
)
from ..models.user import User
from ..models.tenant import Tenant
# Import CustomDashboardService and its getter, and the new ReportDefinition model
from ..models.dashboard_custom import ReportDefinition # Assuming ReportDefinition is in dashboard_custom
from .dashboard_service_custom import CustomDashboardService, get_custom_dashboard_service
from ..schemas import analytics_schemas  # type: ignore # For ReportDefinition schema types
from ..database import get_db


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
        
        report = Report()  # type: ignore
        setattr(report, 'tenant_id', tenant_id)  # type: ignore
        setattr(report, 'name', name)  # type: ignore
        setattr(report, 'category', category)  # type: ignore
        setattr(report, 'report_type', report_type)  # type: ignore
        setattr(report, 'data_source', data_source)  # type: ignore
        setattr(report, 'query_config', config.get("query_config", {}))  # type: ignore
        setattr(report, 'visualization_config', config.get("visualization_config", {}))  # type: ignore
        setattr(report, 'format_config', config.get("format_config", {}))  # type: ignore
        setattr(report, 'default_filters', config.get("default_filters", {}))  # type: ignore
        setattr(report, 'parameter_schema', config.get("parameter_schema", {}))  # type: ignore
        setattr(report, 'is_public', config.get("is_public", False))  # type: ignore
        setattr(report, 'allowed_roles', config.get("allowed_roles", []))  # type: ignore
        setattr(report, 'allowed_users', config.get("allowed_users", []))  # type: ignore
        setattr(report, 'created_by_user_id', created_by_user_id)  # type: ignore
        
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        
        # Log report creation
        self._log_audit_event(
            tenant_id,
            "report_created",
            "management",
            report_id=getattr(report, 'id', None),  # type: ignore
            user_id=created_by_user_id,
            details={"name": name, "category": category, "type": report_type}
        )
        
        return report

    def get_report(self, report_id: int, tenant_id: int) -> Optional[Report]:
        """Get report by ID with tenant validation"""
        return self.db.query(Report).filter(
            Report.id == report_id, Report.tenant_id == tenant_id
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
            Report.tenant_id == tenant_id, Report.is_active == True
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
                if getattr(report, 'can_access', lambda uid, roles: True)(user_id, user_roles):  # type: ignore
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
        
        setattr(report, 'updated_at', datetime.utcnow())  # type: ignore
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
        execution = ReportExecution()  # type: ignore
        setattr(execution, 'report_id', report_id)  # type: ignore
        setattr(execution, 'tenant_id', tenant_id)  # type: ignore
        setattr(execution, 'executed_by_user_id', user_id)  # type: ignore
        setattr(execution, 'execution_type', "manual" if user_id else "api")  # type: ignore
        setattr(execution, 'parameters', parameters or {})  # type: ignore
        setattr(execution, 'filters_applied', filters or {})  # type: ignore
        setattr(execution, 'output_format', output_format)  # type: ignore
        setattr(execution, 'status', "running")  # type: ignore
        
        self.db.add(execution)
        self.db.commit()
        self.db.refresh(execution)
        
        try:
            # Check cache first
            cache_key = self._generate_cache_key(report_id, parameters, filters)
            cached_result = self._get_cached_result(cache_key)
            
            if cached_result:
                setattr(execution, 'status', "completed")  # type: ignore
                setattr(execution, 'completed_at', datetime.utcnow())  # type: ignore
                setattr(execution, 'execution_time_ms', 50)  # type: ignore
                setattr(execution, 'row_count', cached_result.get("row_count", 0))  # type: ignore
                self.db.commit()
                
                # Generate output file if needed
                if output_format in ["pdf", "excel", "csv"]:
                    file_path = await self._generate_output_file(
                        execution, cached_result["data"], output_format
                    )
                    setattr(execution, 'file_path', file_path)  # type: ignore
                    setattr(execution, 'download_url', self._generate_download_url(file_path))  # type: ignore
                    setattr(execution, 'expires_at', datetime.utcnow() + timedelta(hours=24))  # type: ignore
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
            setattr(execution, 'status', "completed")  # type: ignore
            setattr(execution, 'completed_at', datetime.utcnow())  # type: ignore
            setattr(execution, 'execution_time_ms', query_time + render_time)  # type: ignore
            setattr(execution, 'query_time_ms', query_time)  # type: ignore
            setattr(execution, 'render_time_ms', render_time)  # type: ignore
            setattr(execution, 'row_count', len(processed_data) if isinstance(processed_data, list) else 0)  # type: ignore
            setattr(execution, 'file_path', file_path)  # type: ignore
            
            if file_path:
                setattr(execution, 'download_url', self._generate_download_url(file_path))  # type: ignore
                setattr(execution, 'expires_at', datetime.utcnow() + timedelta(hours=24))  # type: ignore
                setattr(execution, 'file_size_bytes', self._get_file_size(file_path))  # type: ignore
            
            self.db.commit()
            
            # Cache the result
            self._cache_result(cache_key, report_id, tenant_id, processed_data, getattr(execution, 'row_count', 0))  # type: ignore
            
            # Update report statistics
            setattr(report, 'last_generated_at', datetime.utcnow())  # type: ignore
            current_count = getattr(report, 'generation_count', 0)  # type: ignore
            setattr(report, 'generation_count', current_count + 1)  # type: ignore
            avg_time = getattr(report, 'avg_generation_time_ms', None)  # type: ignore
            exec_time = getattr(execution, 'execution_time_ms', 0)  # type: ignore
            if avg_time:
                setattr(report, 'avg_generation_time_ms', (avg_time + exec_time) / 2)  # type: ignore
            else:
                setattr(report, 'avg_generation_time_ms', exec_time)  # type: ignore
            setattr(report, 'last_generation_time_ms', exec_time)  # type: ignore
            self.db.commit()
            
            # Log execution
            self._log_audit_event(
                tenant_id,
                "report_executed",
                "execution",
                report_id=report_id,
                user_id=user_id,
                details={
                    "execution_id": getattr(execution, 'id', None),
                    "output_format": output_format,
                    "row_count": getattr(execution, 'row_count', 0),
                    "execution_time_ms": getattr(execution, 'execution_time_ms', 0)
                }
            )
            
            return execution
            
        except Exception as e:
            # Update execution with error
            setattr(execution, 'status', "failed")  # type: ignore
            setattr(execution, 'completed_at', datetime.utcnow())  # type: ignore
            setattr(execution, 'error_message', str(e))  # type: ignore
            self.db.commit()
            
            # Log error
            self._log_audit_event(
                tenant_id,
                "report_execution_failed",
                "execution",
                report_id=report_id,
                user_id=user_id,
                details={"error": str(e), "execution_id": getattr(execution, 'id', None)}
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
        
        data_source = getattr(report, 'data_source', 'unknown')
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
        visualization_config = getattr(report, 'visualization_config', {})
        
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
        report = self.db.query(Report).filter(Report.id == getattr(execution, 'report_id', 0)).first()
        export_config = getattr(report, 'export_config', {}) if report else {}

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

    async def _generate_pdf_report(self, execution: ReportExecution, data: List[Dict[str, Any]], export_config: Optional[Dict[str, Any]] = None) -> str:
        """Generate PDF report using ReportLab"""
        file_path = f"/tmp/report_{getattr(execution, 'execution_uuid', 'unknown')}.pdf"
        export_config = export_config or {}

        if not REPORTLAB_AVAILABLE:
            # Create a simple text file as fallback
            with open(file_path, 'w') as f:
                f.write("PDF Report (ReportLab not available)\n")
                f.write(f"Title: {export_config.get('title', 'Report')}\n")
                f.write(f"Data rows: {len(data)}\n")
                if data:
                    columns = export_config.get("columns") or list(data[0].keys())
                    f.write(",".join(columns) + "\n")
                    for row in data:
                        values = [str(row.get(col, "")) for col in columns]
                        f.write(",".join(values) + "\n")
            return file_path

        try:
            doc = SimpleDocTemplate(file_path, pagesize=letter)  # type: ignore
            styles = getSampleStyleSheet()  # type: ignore
            story = []

            # Title
            report_title_str = export_config.get("title", "Report")
            report_title = Paragraph(report_title_str, styles['h1'])  # type: ignore
            story.append(report_title)
            story.append(Spacer(1, 0.2 * inch))  # type: ignore

            if not data:
                story.append(Paragraph("No data available for this report.", styles['Normal']))  # type: ignore
                doc.build(story)  # type: ignore
                return file_path

            # Determine columns - use export_config or all keys from the first data item
            columns = export_config.get("columns")
            if not columns and data:
                columns = list(data[0].keys())
            
            if not columns: # Still no columns (e.g. data was empty or malformed)
                story.append(Paragraph("No columns defined for the report.", styles['Normal']))  # type: ignore
                doc.build(story)  # type: ignore
                return file_path

            # Prepare data for the table
            table_data = [columns] # Header row
            for row_dict in data:
                table_data.append([str(row_dict.get(col, "")) for col in columns])

            # Create table
            pdf_table = Table(table_data)  # type: ignore
            pdf_table.setStyle(TableStyle([  # type: ignore
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),  # type: ignore
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),  # type: ignore
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),  # type: ignore
                ('GRID', (0, 0), (-1, -1), 1, colors.black)  # type: ignore
            ]))
            story.append(pdf_table)

            doc.build(story)  # type: ignore
            return file_path
        except Exception as e:
            # Fallback to text file if PDF generation fails
            with open(file_path, 'w') as f:
                f.write(f"PDF Report (Generation failed: {str(e)})\n")
                f.write(f"Title: {export_config.get('title', 'Report')}\n")
                f.write(f"Data rows: {len(data)}\n")
                if data:
                    columns = export_config.get("columns") or list(data[0].keys())
                    f.write(",".join(columns) + "\n")
                    for row in data:
                        values = [str(row.get(col, "")) for col in columns]
                        f.write(",".join(values) + "\n")
            return file_path

    async def _generate_excel_report(self, execution: ReportExecution, data: List[Dict[str, Any]], export_config: Optional[Dict[str, Any]] = None) -> str:
        """Generate Excel report using openpyxl"""
        
        file_path = f"/tmp/report_{getattr(execution, 'execution_uuid', 'unknown')}.xlsx"
        export_config = export_config or {}
        
        if not OPENPYXL_AVAILABLE:
            # Create a simple CSV file as fallback
            custom_sheet_name = export_config.get("sheet_name", "Report Data")
            with open(file_path, 'w') as f:
                f.write(f"Excel Report (openpyxl not available) - Sheet: {custom_sheet_name}\nData rows: {len(data)}\n")
                if data:
                    columns_to_export = export_config.get("columns") or list(data[0].keys())
                    headers = [col for col in (columns_to_export or []) if data and col in data[0]]
                    f.write(",".join(headers) + "\n")
                    for row in data:
                        values = [str(row.get(header, "")) for header in headers]
                        f.write(",".join(values) + "\n")
            return file_path

        # Actual Excel generation would go here when openpyxl is available
        custom_sheet_name = export_config.get("sheet_name", "Report Data")
        with open(file_path, 'w') as f:
            f.write(f"Mock Excel Report - Sheet: {custom_sheet_name}\nData rows: {len(data)}\n")
            if data:
                columns_to_export = export_config.get("columns") or list(data[0].keys())
                headers = [col for col in (columns_to_export or []) if data and col in data[0]]
                f.write(",".join(headers) + "\n")
                for row in data:
                    values = [str(row.get(header, "")) for header in headers]
                    f.write(",".join(values) + "\n")
        
        return file_path

    async def _generate_csv_report(self, execution: ReportExecution, data: List[Dict[str, Any]], export_config: Optional[Dict[str, Any]] = None) -> str:
        """Generate CSV report using pandas"""
        file_path = f"/tmp/report_{getattr(execution, 'execution_uuid', 'unknown')}.csv"
        export_config = export_config or {}

        if not data:
            # Create an empty CSV with a header if no data but columns are specified
            # Or just an empty file, or a file with "No data available"
            columns = export_config.get("columns")
            if columns:
                df = pd.DataFrame(columns=columns)
                df.to_csv(file_path, index=False, sep=export_config.get("separator", ","))
            else:
                with open(file_path, 'w') as f:
                    f.write("No data available\n")
            return file_path

        # Convert data to DataFrame
        df = pd.DataFrame(data)

        # Select columns if specified in export_config
        columns_to_export = export_config.get("columns")
        if columns_to_export:
            # Ensure only existing columns are selected to avoid errors
            df = df[[col for col in columns_to_export if col in df.columns]]

        if df.empty and not columns_to_export: # Handles case where data was not empty but resulted in empty df after column selection
             with open(file_path, 'w') as f:
                f.write("No data available for selected columns\n")
             return file_path


        # Write to CSV
        df.to_csv(
            file_path,
            index=False, # Don't write pandas index
            sep=export_config.get("separator", ","),
            header=export_config.get("include_header", True)
        )
        
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
        
        if cache_entry and not getattr(cache_entry, 'is_expired', True):
            increment_method = getattr(cache_entry, 'increment_hit_count', lambda: None)  # type: ignore
            increment_method()
            self.db.commit()
            return getattr(cache_entry, 'result_data', {})
        
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
        cache_entry = ReportCache()  # type: ignore
        setattr(cache_entry, 'cache_key', cache_key)  # type: ignore
        setattr(cache_entry, 'report_id', report_id)  # type: ignore
        setattr(cache_entry, 'tenant_id', tenant_id)  # type: ignore
        setattr(cache_entry, 'parameters_hash', cache_key[:32])  # type: ignore
        setattr(cache_entry, 'data_hash', hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest())  # type: ignore
        setattr(cache_entry, 'result_data', data)  # type: ignore
        setattr(cache_entry, 'metadata', {"row_count": row_count})  # type: ignore
        setattr(cache_entry, 'expires_at', expires_at)  # type: ignore
        
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
        
        audit_log = ReportAuditLog()  # type: ignore
        setattr(audit_log, 'tenant_id', tenant_id)  # type: ignore
        setattr(audit_log, 'report_id', report_id)  # type: ignore
        setattr(audit_log, 'user_id', user_id)  # type: ignore
        setattr(audit_log, 'event_type', event_type)  # type: ignore
        setattr(audit_log, 'event_category', event_category)  # type: ignore
        setattr(audit_log, 'details', details or {})  # type: ignore
        
        self.db.add(audit_log)
        # Note: Commit is handled by the calling method


def get_reporting_service(
    db: Session = Depends(get_db), # Assuming get_db is available from ..database
    custom_dashboard_service: CustomDashboardService = Depends(get_custom_dashboard_service)
) -> ReportingService:
    """Get reporting service instance"""
    return ReportingService(db=db, custom_dashboard_service=custom_dashboard_service)

class ReportingServiceExtended(ReportingService):
    """Extended reporting service with ReportDefinition methods"""

    # --- New Methods for ReportDefinition ---

    def create_report_definition(
        self,
        report_def_create: Any,  # schemas.ReportDefinitionCreate,
        tenant_id: int,
        user_id: int
    ) -> ReportDefinition:
        """Create a new ReportDefinition."""
        # Ensure ReportDefinition model is correctly imported and defined as a SQLAlchemy model
        # from ..models.dashboard_custom import ReportDefinition (already imported at top)

        # The content_blocks in report_def_create are Pydantic models.
        # If ReportDefinition SQLAlchemy model stores content_blocks as JSON,
        # they need to be converted.
        content_blocks = getattr(report_def_create, 'content_blocks', [])
        content_blocks_as_dict = [block.model_dump() for block in content_blocks if hasattr(block, 'model_dump')]

        db_report_def = ReportDefinition()  # type: ignore
        setattr(db_report_def, 'name', report_def_create.name)  # type: ignore
        setattr(db_report_def, 'description', report_def_create.description)  # type: ignore
        setattr(db_report_def, 'report_type', report_def_create.report_type)  # type: ignore
        setattr(db_report_def, 'content_blocks', content_blocks_as_dict)  # type: ignore
        global_filters = getattr(report_def_create, 'global_filters', [])
        setattr(db_report_def, 'global_filters', [filter.model_dump() for filter in global_filters if hasattr(filter, 'model_dump')])  # type: ignore
        setattr(db_report_def, 'output_format', report_def_create.output_format)  # type: ignore
        setattr(db_report_def, 'tenant_id', tenant_id)  # type: ignore
        setattr(db_report_def, 'user_id', user_id)  # type: ignore
        self.db.add(db_report_def)
        self.db.commit()
        self.db.refresh(db_report_def)
        return db_report_def

    def get_report_definition(self, report_definition_id: int, tenant_id: int) -> Optional[ReportDefinition]:
        """Retrieve a ReportDefinition by its ID and tenant_id."""
        # Assuming ReportDefinition model has tenant_id and user_id fields similar to AnalyticsDashboard
        return self.db.query(ReportDefinition).filter(
            ReportDefinition.id == report_definition_id,
            ReportDefinition.tenant_id == tenant_id
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
        report_def_update: Any,  # schemas.ReportDefinitionUpdate,
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
        if hasattr(db_report_def, 'user_id') and getattr(db_report_def, 'user_id', None) != user_id:
             # Or raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this report definition")
            return None

        update_data = report_def_update.model_dump(exclude_unset=True) if hasattr(report_def_update, 'model_dump') else {}
        for key, value in update_data.items():
            if key == "content_blocks" and value is not None:
                setattr(db_report_def, key, [block.model_dump() for block in value if hasattr(block, 'model_dump')])
            elif key == "global_filters" and value is not None:
                setattr(db_report_def, key, [filter.model_dump() for filter in value if hasattr(filter, 'model_dump')])
            elif hasattr(db_report_def, key):
                setattr(db_report_def, key, value)

        if hasattr(db_report_def, 'updated_at'):
            setattr(db_report_def, 'updated_at', datetime.utcnow())
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

        if hasattr(db_report_def, 'user_id') and getattr(db_report_def, 'user_id', None) != user_id:
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
            "report_name": getattr(report_definition, 'name', 'Unknown Report'),
            "report_description": getattr(report_definition, 'description', ''),
            "report_type": getattr(report_definition, 'report_type', 'standard'),
            "generated_at": datetime.utcnow(),
            "content": []
        }

        content_blocks = getattr(report_definition, 'content_blocks', [])
        for block_config in content_blocks:
            block_data_payload = None
            block_type = getattr(block_config, 'block_type', 'unknown')
            if block_type == "text":
                text_content = getattr(block_config, 'text_content', '')
                block_data_payload = {"text": text_content}
            elif hasattr(block_config, 'data_source') and getattr(block_config, 'data_source', None):
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
                    # Call the new method in CustomDashboardService
                    data_source = getattr(block_config, 'data_source', None)
                    if data_source and hasattr(self.custom_dashboard_service, 'get_data_for_source'):
                        block_data_payload = await self.custom_dashboard_service.get_data_for_source(
                            data_source_config=data_source,
                            tenant_id=tenant_id
                        )
                    else:
                        block_data_payload = {"error": "Data source not available"}
                except Exception as e:
                    # Log the exception e
                    block_title = getattr(block_config, 'title', 'Unknown Block')
                    block_data_payload = {"error": f"Failed to fetch data for block '{block_title}': {str(e)}"}

            content_list = compiled_report_data.get("content", [])  # type: ignore
            if isinstance(content_list, list):
                content_list.append({
                "title": getattr(block_config, 'title', 'Untitled Block'),
                "block_type": getattr(block_config, 'block_type', 'unknown'),
                "display_options": getattr(block_config, 'display_options', {}),
                "data": block_data_payload
                })

        return compiled_report_data

    async def execute_and_generate_for_definition(
        self,
        report_definition: ReportDefinition,
        report_data: List[Dict[str, Any]],
        output_format: str,
        execution_type: str = "scheduled", # Or "manual_from_definition"
        parameters: Optional[Dict[str, Any]] = None,
        filters_applied: Optional[Dict[str, Any]] = None,
        user_id: Optional[int] = None
    ) -> ReportExecution:
        """
        Executes and generates a report file based on a ReportDefinition and its pre-fetched data.
        Handles ReportExecution creation and file generation.
        WARNING: This method assigns report_definition.id to ReportExecution.report_id,
        which is semantically incorrect due to ReportExecution.report_id being a ForeignKey to Report.id.
        This is a temporary workaround due to current schema constraints.
        A proper fix would involve schema changes to ReportExecution.
        """

        # Create execution record
        # TODO: Address the FK constraint: ReportExecution.report_id points to Report.id.
        # Using report_definition.id here is a placeholder and assumes it might work or
        # highlights the need for schema change (e.g., add report_definition_id to ReportExecution).
        execution = ReportExecution()  # type: ignore
        setattr(execution, 'report_id', getattr(report_definition, 'id', 0))  # type: ignore
        setattr(execution, 'tenant_id', getattr(report_definition, 'tenant_id', 0))  # type: ignore
        setattr(execution, 'executed_by_user_id', user_id)  # type: ignore
        setattr(execution, 'execution_type', execution_type)  # type: ignore
        setattr(execution, 'parameters', parameters or {})  # type: ignore
        setattr(execution, 'filters_applied', filters_applied or {})  # type: ignore
        setattr(execution, 'output_format', output_format)  # type: ignore
        setattr(execution, 'status', "running")  # type: ignore

        self.db.add(execution)
        self.db.commit()
        self.db.refresh(execution)

        file_path = None
        render_time_ms = 0
        start_time = datetime.utcnow()

        try:
            # Use report_definition.export_config for file generation
            export_cfg = getattr(report_definition, 'export_config', {}) or {}

            # Generate output file using the pre-fetched report_data
            # Note: _generate_output_file normally gets export_config from a Report object.
            # We are bypassing that by passing it directly.
            # The `_generate_output_file` itself calls specific _generate_pdf_report etc.
            # These specific methods already accept export_config.

            # We need to ensure _generate_output_file can work without a valid Report object if execution.report_id is -1 or similar
            # For now, we assume _generate_pdf_report etc. are called directly or _generate_output_file is adapted.
            # Based on current _generate_output_file, it does `report = self.db.query(Report).filter(Report.id == execution.report_id).first()`
            # This will fail if execution.report_id is not a valid Report.id.
            #
            # REVISED APPROACH:
            # Call the specific _generate_X_report methods directly from here.

            render_start = datetime.utcnow()
            if output_format == "pdf":
                file_path = await self._generate_pdf_report(execution, report_data, export_cfg)
            elif output_format == "csv":
                file_path = await self._generate_csv_report(execution, report_data, export_cfg)
            elif output_format == "excel": # Assuming excel generation might be added
                file_path = await self._generate_excel_report(execution, report_data, export_cfg)
            else:
                raise ValueError(f"Unsupported output format: {output_format} for definition-based report.")
            render_time_ms = (datetime.utcnow() - render_start).total_seconds() * 1000

            setattr(execution, 'status', "completed")  # type: ignore
            setattr(execution, 'completed_at', datetime.utcnow())  # type: ignore
            setattr(execution, 'execution_time_ms', (datetime.utcnow() - start_time).total_seconds() * 1000)  # type: ignore
            setattr(execution, 'query_time_ms', 0)  # type: ignore
            setattr(execution, 'render_time_ms', render_time_ms)  # type: ignore
            setattr(execution, 'row_count', len(report_data) if isinstance(report_data, list) else 0)  # type: ignore
            setattr(execution, 'file_path', file_path)  # type: ignore

            if file_path:
                setattr(execution, 'download_url', self._generate_download_url(file_path))  # type: ignore
                setattr(execution, 'expires_at', datetime.utcnow() + timedelta(hours=24))  # type: ignore
                setattr(execution, 'file_size_bytes', self._get_file_size(file_path))  # type: ignore

            self.db.commit()
            self.db.refresh(execution)

            # Log execution (optional, could be done by caller)
            self._log_audit_event(
                tenant_id=getattr(execution, 'tenant_id', 0),  # type: ignore
                event_type="report_definition_executed",
                event_category="execution",
                # report_id=execution.report_id, # This is currently report_definition.id
                details={
                    "execution_id": getattr(execution, 'id', None),
                    "report_definition_id": getattr(report_definition, 'id', None),
                    "output_format": output_format,
                    "row_count": getattr(execution, 'row_count', 0),
                    "execution_time_ms": getattr(execution, 'execution_time_ms', 0)
                }
            )
            return execution

        except Exception as e:
            setattr(execution, 'status', "failed")  # type: ignore
            setattr(execution, 'completed_at', datetime.utcnow())  # type: ignore
            setattr(execution, 'error_message', str(e))  # type: ignore
            self.db.commit()
            self.db.refresh(execution)
            # Log error (optional, could be done by caller)
            self._log_audit_event(
                tenant_id=getattr(execution, 'tenant_id', 0),  # type: ignore
                event_type="report_definition_execution_failed",
                event_category="execution",
                details={"error": str(e), "execution_id": getattr(execution, 'id', None), "report_definition_id": getattr(report_definition, 'id', None)}
            )
            raise # Re-raise the exception to be handled by the scheduler service

    async def execute_definition_schedule_job(self, report_schedule_id: int):
        """
        Executes a scheduled job for a ReportDefinition.
        Fetches data, generates report file(s), and handles basic status updates.
        Delivery mechanisms will be added in a subsequent step.
        """
        report_schedule = self.db.query(ReportSchedule).filter(ReportSchedule.id == report_schedule_id).first()

        if not report_schedule:
            # Log error or raise, depending on how the calling scheduler service handles this
            print(f"ReportSchedule with id {report_schedule_id} not found.")
            # Consider logging this to ReportAuditLog as a system event if appropriate
            return

        if not report_schedule.is_active:
            print(f"ReportSchedule with id {report_schedule_id} is not active. Skipping.")
            return

        if not getattr(report_schedule, 'report_definition_id', None):
            print(f"ReportSchedule with id {report_schedule_id} is not linked to a ReportDefinition. Skipping.")
            if hasattr(report_schedule, 'last_run_status'):
                setattr(report_schedule, 'last_run_status', "failed")
            if hasattr(report_schedule, 'last_run_at'):
                setattr(report_schedule, 'last_run_at', datetime.utcnow())
            # report_schedule.update_execution_stats(success=False) # This method might need adjustment for schedules
            self.db.commit()
            return

        report_definition = self.get_report_definition(
            getattr(report_schedule, 'report_definition_id', 0),
            getattr(report_schedule, 'tenant_id', 0)
        )

        if not report_definition:
            print(f"ReportDefinition with id {report_schedule.report_definition_id} not found for schedule {report_schedule_id}.")
            if hasattr(report_schedule, 'last_run_status'):
                setattr(report_schedule, 'last_run_status', "failed")
            if hasattr(report_schedule, 'last_run_at'):
                setattr(report_schedule, 'last_run_at', datetime.utcnow())
            # report_schedule.update_execution_stats(success=False)
            self.db.commit()
            return

        execution_succeeded_overall = False
        error_messages = []
        generated_files_info = [] # To store info about generated files for delivery

        try:
            # 1. Fetch data for the report definition
            # Assuming current_user is not strictly necessary for scheduled reports, or system user context is used.
            # generate_report_data expects content_blocks to have data_source.
            # The data is then fetched by custom_dashboard_service.get_data_for_source
            print(f"Generating data for ReportDefinition {report_definition.id} (Schedule: {report_schedule.id})")
            raw_report_data_payload = await self.generate_report_data(
                report_definition_id=getattr(report_definition, 'id', 0),  # type: ignore
                tenant_id=getattr(report_schedule, 'tenant_id', 0)
            )
            # generate_report_data returns a dict like {"report_name": ..., "content": [{"title": ..., "data": ...}]}
            # The actual data to be rendered into files is in raw_report_data_payload["content"][block_index]["data"]
            # For simplicity, we'll assume the current file generation methods can handle this structure
            # or that we pass the relevant part.
            # Let's assume `execute_and_generate_for_definition` expects the list of data items.
            # The `execute_and_generate_for_definition` method's `report_data` param expects List[Dict[str, Any]]
            # which should be the compiled data for the report, not the raw payload from generate_report_data.

            # Re-shaping data: The file generation methods (e.g., _generate_pdf_report) typically expect a list of dicts (rows).
            # The `raw_report_data_payload['content']` is a list of blocks.
            # If the report is a single table/chart, we might extract data from the first relevant block.
            # This part needs careful handling based on how `ReportDefinition` content maps to a single file output.
            # For now, let's assume the first block with data is the primary source for a simple file.
            # A more robust solution would iterate content_blocks and assemble data or generate multi-part files.

            data_for_file_generation = []
            if raw_report_data_payload and raw_report_data_payload.get("content"):
                for block in raw_report_data_payload["content"]:
                    if block.get("data") and isinstance(block["data"], list): # Assuming list data is typical for tables/charts
                        data_for_file_generation.extend(block["data"]) # Simple concatenation for now
                        # Or pick the first one: data_for_file_generation = block["data"]; break

            content_blocks = getattr(report_definition, 'content_blocks', [])
            if not data_for_file_generation and content_blocks:
                 print(f"Warning: No list-based data found in content blocks for ReportDefinition {getattr(report_definition, 'id', 'unknown')}")
                 # It could be a text-only report, or data structure is different.
                 # For now, file generation might produce an empty or minimal report.

            # 2. Generate report file(s) for each specified output format in the schedule
            schedule_formats = getattr(report_schedule, 'output_formats', None)
            definition_format = getattr(report_definition, 'output_format', 'pdf')
            output_formats = schedule_formats or [definition_format]
            if not isinstance(output_formats, list): # Ensure it's a list
                output_formats = [output_formats]

            for fmt in output_formats:
                try:
                    report_def_id = getattr(report_definition, 'id', 'unknown')
                    schedule_id = getattr(report_schedule, 'id', 'unknown')
                    print(f"Generating file in format {fmt} for ReportDefinition {report_def_id} (Schedule: {schedule_id})")
                    # `execute_and_generate_for_definition` creates a ReportExecution record.
                    # This might be okay, or we might want a single ReportExecution for the whole scheduled job.
                    # For now, let's use it. It returns a ReportExecution object.
                    report_execution_record = await self.execute_and_generate_for_definition(
                        report_definition=report_definition,
                        report_data=data_for_file_generation, # Pass the extracted data
                        output_format=str(fmt),  # type: ignore
                        execution_type="scheduled_definition", # New type to distinguish
                        user_id=getattr(report_schedule, 'created_by_user_id', None)
                    )

                    status = getattr(report_execution_record, 'status', 'unknown')
                    file_path = getattr(report_execution_record, 'file_path', None)
                    if status == "completed" and file_path:
                        generated_files_info.append({
                            "format": fmt,
                            "file_path": getattr(report_execution_record, 'file_path', ''),
                            "file_size_bytes": getattr(report_execution_record, 'file_size_bytes', 0),
                            "download_url": getattr(report_execution_record, 'download_url', ''),
                            "report_name": getattr(report_definition, 'name', 'Unknown Report')
                        })
                        print(f"Successfully generated {fmt} file: {getattr(report_execution_record, 'file_path', 'unknown')}")
                    else:
                        status = getattr(report_execution_record, 'status', 'unknown')
                        error_message = getattr(report_execution_record, 'error_message', 'No error message')
                        error_msg = f"File generation for format {fmt} failed or no file path produced. Status: {status}, Error: {error_message}"
                        print(error_msg)
                        error_messages.append(error_msg)

                except Exception as file_gen_exc:
                    error_msg = f"Error generating file format {fmt} for schedule {report_schedule_id}: {str(file_gen_exc)}"
                    print(error_msg)
                    error_messages.append(error_msg)
                    # Continue to try other formats if any

            if not generated_files_info and error_messages: # All formats failed or no formats specified and error occurred
                raise Exception("All file generation attempts failed or no data to generate. Errors: " + "; ".join(error_messages))
            elif not generated_files_info:
                 print(f"No files were generated for schedule {report_schedule_id}, possibly due to no data or configuration issues.")
                 # This might not be an error if the report was empty by design.

            # At this point, `generated_files_info` contains details of successfully generated files.
            # Delivery will be handled in the next step. For now, success means files were generated.
            if generated_files_info: # If at least one file was generated
                execution_succeeded_overall = True
            else: # No files generated, but also no critical errors during generation phase (e.g. empty report)
                if not error_messages: # No files, no errors means it might be an empty report, treat as "success" for scheduling purposes
                    execution_succeeded_overall = True
                else: # No files, but there were errors
                    execution_succeeded_overall = False


        except Exception as e:
            report_def_id = getattr(report_definition, 'id', 'unknown')
            schedule_id = getattr(report_schedule, 'id', 'unknown')
            error_msg = f"Failed to execute scheduled job for ReportDefinition {report_def_id} (Schedule: {schedule_id}): {str(e)}"
            print(error_msg)
            error_messages.append(error_msg)
            execution_succeeded_overall = False

        # 3. Update schedule statistics (basic update for now)
        if hasattr(report_schedule, 'last_run_at'):
            setattr(report_schedule, 'last_run_at', datetime.utcnow())
        if execution_succeeded_overall:
            if hasattr(report_schedule, 'last_run_status'):
                setattr(report_schedule, 'last_run_status', "success")
        else:
            if hasattr(report_schedule, 'last_run_status'):
                error_summary = "failed: " + "; ".join(error_messages)[:250]
                setattr(report_schedule, 'last_run_status', error_summary)

        if hasattr(report_schedule, 'update_execution_stats'):
            update_stats_method = getattr(report_schedule, 'update_execution_stats')
            if callable(update_stats_method):
                update_stats_method(success=execution_succeeded_overall)

        # TODO: Update next_run_at based on cron_expression (this should be handled by the scheduler service)

        self.db.commit()

        if execution_succeeded_overall:
            print(f"Report schedule {report_schedule_id} executed successfully. Files: {len(generated_files_info)}")
            # Placeholder for delivery:
            if generated_files_info:
                print(f"Files to deliver: {generated_files_info}")
        else:
            print(f"Report schedule {report_schedule_id} execution failed. Errors: {'; '.join(error_messages)}")

        # Return generated_files_info for the calling (scheduler) service to handle delivery,
        # or handle delivery directly here in the next step.
        # For now, this method's scope ends with generation and status update.
        # --- Delivery Step ---
        if execution_succeeded_overall and generated_files_info:
            delivery_method = getattr(report_schedule, 'delivery_method', None)
            delivery_config = getattr(report_schedule, 'delivery_config', {}) or {}
            delivery_successful = False
            delivery_error_msg = ""

            try:
                if delivery_method == "email":
                    print(f"Delivering via email for schedule {report_schedule_id}. Config: {delivery_config}")
                    await self._deliver_via_email(generated_files_info, delivery_config, report_definition)
                    delivery_successful = True
                elif delivery_method == "s3":
                    print(f"Delivering via S3 for schedule {report_schedule_id}. Config: {delivery_config}")
                    await self._deliver_via_s3(generated_files_info, delivery_config, report_definition)
                    delivery_successful = True
                elif delivery_method == "webhook":
                    print(f"Delivering via webhook for schedule {report_schedule_id}. Config: {delivery_config}")
                    await self._deliver_via_webhook(generated_files_info, delivery_config, report_definition)
                    delivery_successful = True
                elif delivery_method: # Some method specified but not implemented
                     delivery_error_msg = f"Delivery method '{delivery_method}' is not implemented for schedule {report_schedule_id}."
                     print(delivery_error_msg)
                     error_messages.append(delivery_error_msg) # Add to overall errors
                     execution_succeeded_overall = False # Mark overall execution as failed if delivery fails critically
                else: # No delivery method specified
                    print(f"No delivery method specified for schedule {report_schedule_id}. Skipping delivery.")
                    delivery_successful = True # No delivery attempted, so not a delivery failure

            except Exception as delivery_exc:
                delivery_error_msg = f"Error during {delivery_method} delivery for schedule {report_schedule_id}: {str(delivery_exc)}"
                print(delivery_error_msg)
                error_messages.append(delivery_error_msg)
                execution_succeeded_overall = False # Delivery failure means overall job failure

            if not delivery_successful and delivery_method:
                if hasattr(report_schedule, 'last_run_status'):
                    setattr(report_schedule, 'last_run_status', f"failed: Delivery Error - {delivery_error_msg[:200]}")
                if hasattr(report_schedule, 'update_execution_stats'):
                    update_stats_method = getattr(report_schedule, 'update_execution_stats')
                    if callable(update_stats_method):
                        update_stats_method(success=False)
                self.db.commit()
            elif delivery_successful and execution_succeeded_overall: # Ensure it was overall success before this point
                 # Status already set to "success" if generation was okay
                 pass


        # Cleanup generated local files after delivery attempt
        for file_info in generated_files_info:
            if file_info.get("file_path") and os.path.exists(file_info["file_path"]):
                try:
                    os.remove(file_info["file_path"])
                    print(f"Cleaned up local file: {file_info['file_path']}")
                except Exception as e:
                    print(f"Error cleaning up file {file_info['file_path']}: {e}")

        # Final update to status based on delivery outcome if it changed overall success
        last_run_status = getattr(report_schedule, 'last_run_status', '')
        if not execution_succeeded_overall and last_run_status.startswith("success"):
            final_error_summary = "; ".join(error_messages)
            if hasattr(report_schedule, 'last_run_status'):
                setattr(report_schedule, 'last_run_status', f"failed: {final_error_summary[:250]}")
            # Ensure stats reflect failure if delivery caused it
            # This might need careful thought if update_execution_stats was already called with True
            # For simplicity, assume the last call to update_execution_stats (if any) reflects the true final state.

        self.db.commit() # Commit any final status changes

        return generated_files_info, execution_succeeded_overall

    async def _deliver_via_email(self, generated_files_info: List[Dict], config: Dict, report_definition: ReportDefinition):
        """Helper to deliver reports via email."""
        recipients = config.get("recipients")
        if not recipients or not isinstance(recipients, list):
            raise ValueError("Email delivery config missing or invalid 'recipients' list.")

        smtp_server = config.get("smtp_server", "localhost") # Placeholder
        smtp_port = config.get("smtp_port", 25) # Placeholder
        smtp_user = config.get("smtp_user")
        smtp_password = config.get("smtp_password")
        from_email = config.get("from_email", "noreply@digame.com")

        report_name = getattr(report_definition, 'name', 'Unknown Report')
        subject = f"Scheduled Report: {report_name}"
        body = f"Please find attached your scheduled report: {report_name}.\n\n"
        body += "Generated files:\n"
        for f_info in generated_files_info:
            body += f"- {os.path.basename(f_info['file_path'])} ({f_info['format']})\n"
            if f_info.get('download_url'):
                 body += f"  Download link (if applicable): {f_info['download_url']}\n"


        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = ", ".join(recipients)
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        for file_info in generated_files_info:
            file_path = file_info["file_path"]
            if os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    part = MIMEApplication(f.read(), Name=os.path.basename(file_path))
                part['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
                msg.attach(part)
            else:
                print(f"Warning: File {file_path} not found for email attachment.")


        try:
            # This is a simplified example. Production email sending should be more robust.
            # E.g., use a dedicated email library or service (SendGrid, SES, etc.)
            # For local testing, you might need a local SMTP server like `python -m smtpd -c DebuggingServer -n localhost:1025`
            print(f"Attempting to send email via {smtp_server}:{smtp_port} to {recipients}")
            server = smtplib.SMTP(smtp_server, smtp_port)
            if smtp_user and smtp_password:
                server.starttls() # If your server supports TLS
                server.login(smtp_user, smtp_password)
            server.sendmail(from_email, recipients, msg.as_string())
            server.quit()
            print("Email sent successfully.")
        except Exception as e:
            raise Exception(f"SMTP error sending email: {e}")

    async def _deliver_via_s3(self, generated_files_info: List[Dict], config: Dict, report_definition: ReportDefinition):
        """Helper to deliver reports by uploading to S3."""
        bucket_name = config.get("bucket_name")
        s3_path_prefix = config.get("path_prefix", "scheduled_reports/")
        aws_access_key_id = config.get("aws_access_key_id") # Ideally use IAM roles
        aws_secret_access_key = config.get("aws_secret_access_key")
        region_name = config.get("region_name")

        if not bucket_name:
            raise ValueError("S3 delivery config missing 'bucket_name'.")

        s3_client = boto3.client(
            "s3",
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=region_name
        )

        uploaded_files = []
        for file_info in generated_files_info:
            file_path = file_info["file_path"]
            if os.path.exists(file_path):
                report_name = getattr(report_definition, 'name', 'unknown_report')
                s3_key = os.path.join(s3_path_prefix, report_name.replace(" ", "_"), os.path.basename(file_path))
                try:
                    print(f"Uploading {file_path} to S3 bucket {bucket_name} at key {s3_key}")
                    s3_client.upload_file(file_path, bucket_name, s3_key)
                    # Optionally generate presigned URL if needed for notification
                    # presigned_url = s3_client.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': s3_key}, ExpiresIn=3600*24)
                    uploaded_files.append({"s3_bucket": bucket_name, "s3_key": s3_key})
                    print(f"Successfully uploaded {s3_key} to S3.")
                except Exception as e:
                    raise Exception(f"S3 upload failed for {file_path}: {e}")
            else:
                 print(f"Warning: File {file_path} not found for S3 upload.")

        if not uploaded_files and generated_files_info : # Files were expected but none uploaded
             raise Exception("S3 Upload: No files were successfully uploaded, though some were generated.")
        elif not generated_files_info: # No files were generated in the first place
            print("S3 Upload: No files were generated, so nothing to upload.")


    async def _deliver_via_webhook(self, generated_files_info: List[Dict], config: Dict, report_definition: ReportDefinition):
        """Helper to deliver report notification via webhook."""
        webhook_url = config.get("url")
        if not webhook_url:
            raise ValueError("Webhook delivery config missing 'url'.")

        payload = {
            "report_name": getattr(report_definition, 'name', 'Unknown Report'),
            "report_definition_id": getattr(report_definition, 'id', None),
            "generated_at": datetime.utcnow().isoformat(),
            "files": []
        }

        for file_info in generated_files_info:
            file_data = {
                "format": file_info["format"],
                "filename": os.path.basename(file_info["file_path"]),
                "size_bytes": file_info.get("file_size_bytes"),
            }
            # Include download URL if available (e.g., from S3 upload or if served directly)
            # For local files, this URL might not be meaningful unless they are accessible publicly.
            # If files were uploaded to S3 and presigned URLs generated, those would be ideal here.
            # For now, using the mock download_url from ReportExecution.
            if file_info.get("download_url"):
                file_data["download_url"] = file_info["download_url"]
            elif file_info.get("s3_key"): # If S3 delivery happened before webhook
                 file_data["s3_location"] = f"s3://{config.get('bucket_name')}/{file_info['s3_key']}"

            files_list = payload.get("files", [])  # type: ignore
            if isinstance(files_list, list):
                files_list.append(file_data)

        if not payload["files"] and generated_files_info:
            raise Exception("Webhook: No file information to send, though files were generated.")
        elif not generated_files_info:
            print("Webhook: No files were generated, sending notification about empty/failed report generation.")
            payload["status_message"] = "Report generation resulted in no files or encountered issues."


        headers = config.get("headers", {})
        headers.setdefault("Content-Type", "application/json")

        timeout = config.get("timeout_seconds", 10)

        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                print(f"Sending webhook notification to {webhook_url}")
                response = await client.post(webhook_url, json=payload, headers=headers)
                response.raise_for_status()  # Raise an exception for HTTP 4xx or 5xx status codes
                print(f"Webhook notification sent successfully. Status: {response.status_code}")
            except httpx.HTTPStatusError as e:
                raise Exception(f"Webhook request failed with status {e.response.status_code}: {e.response.text}")
            except httpx.RequestError as e:
                raise Exception(f"Webhook request failed: {e}")
