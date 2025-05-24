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


class ReportingService:
    """Service for managing advanced reporting and PDF generation"""

    def __init__(self, db: Session):
        self.db = db
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
        """Execute the actual data query for the report"""
        
        # This is a mock implementation
        # In production, this would connect to actual data sources
        
        data_source = report.data_source
        query_config = report.query_config
        
        # Mock data based on data source
        if data_source == "users":
            return self._get_mock_user_data(parameters, filters)
        elif data_source == "analytics":
            return self._get_mock_analytics_data(parameters, filters)
        elif data_source == "activities":
            return self._get_mock_activity_data(parameters, filters)
        elif data_source == "financial":
            return self._get_mock_financial_data(parameters, filters)
        else:
            return []

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
        """Generate output file in specified format"""
        
        if output_format == "pdf":
            return await self._generate_pdf_report(execution, data)
        elif output_format == "excel":
            return await self._generate_excel_report(execution, data)
        elif output_format == "csv":
            return await self._generate_csv_report(execution, data)
        else:
            raise ValueError(f"Unsupported output format: {output_format}")

    async def _generate_pdf_report(self, execution: ReportExecution, data: List[Dict[str, Any]]) -> str:
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

    async def _generate_excel_report(self, execution: ReportExecution, data: List[Dict[str, Any]]) -> str:
        """Generate Excel report using openpyxl"""
        
        file_path = f"/tmp/report_{execution.execution_uuid}.xlsx"
        
        # Mock Excel generation
        # In production, this would use openpyxl to create actual Excel files
        with open(file_path, 'w') as f:
            f.write(f"Mock Excel Report\nData rows: {len(data)}\n")
            if data:
                # Write headers
                headers = list(data[0].keys())
                f.write(",".join(headers) + "\n")
                
                # Write data
                for row in data:
                    values = [str(row.get(header, "")) for header in headers]
                    f.write(",".join(values) + "\n")
        
        return file_path

    async def _generate_csv_report(self, execution: ReportExecution, data: List[Dict[str, Any]]) -> str:
        """Generate CSV report"""
        
        file_path = f"/tmp/report_{execution.execution_uuid}.csv"
        
        if not data:
            with open(file_path, 'w') as f:
                f.write("No data available\n")
            return file_path
        
        # Write CSV data
        with open(file_path, 'w') as f:
            # Write headers
            headers = list(data[0].keys())
            f.write(",".join(headers) + "\n")
            
            # Write data rows
            for row in data:
                values = [str(row.get(header, "")).replace(",", ";") for header in headers]
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


def get_reporting_service(db: Session) -> ReportingService:
    """Get reporting service instance"""
    return ReportingService(db)
