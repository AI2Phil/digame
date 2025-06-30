"""
Advanced Report Generation Service for Analytics Module
Provides automated report generation, scheduling, and export capabilities
"""

import asyncio
import io
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Union
from pathlib import Path
import tempfile
import zipfile

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from fastapi import HTTPException, status
from pydantic import BaseModel
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
# Optional reportlab imports
try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    # Create mock objects for type checking
    colors = None
    A4 = None
    SimpleDocTemplate = None
    Table = None
    TableStyle = None
    Paragraph = None
    Spacer = None
    Image = None
    getSampleStyleSheet = None
    inch = 1
from jinja2 import Template
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import plotly.io as pio

from ..models.analytics import AnalyticsDashboard, DashboardWidgetConfig, PerformanceMetric
from ..schemas import analytics_schemas as schemas
from .analytics_service import AnalyticsService
from .dashboard_service_custom import CustomDashboardService


class ReportContentBlock(BaseModel):
    title: Optional[str] = None
    block_type: str  # "chart", "table", "kpi_summary", "text", "dashboard_snapshot"
    data_source: Optional[schemas.WidgetDataSourceConfig] = None
    display_options: Dict[str, Any] = {}
    text_content: Optional[str] = None


class ReportDefinition(BaseModel):
    name: str
    description: Optional[str] = None
    report_type: str = "analytics_summary"
    content_blocks: List[ReportContentBlock] = []
    global_filters: List[Dict[str, Any]] = []
    output_format: str = "pdf"
    template_style: str = "default"
    include_cover_page: bool = True
    include_summary: bool = True
    include_appendix: bool = False


class ReportSchedule(BaseModel):
    report_definition_id: int
    cron_schedule: str  # "0 9 * * MON" for weekly Monday 9 AM
    recipients: List[str] = []
    is_active: bool = True
    timezone: str = "UTC"
    delivery_method: str = "email"  # "email", "slack", "webhook"
    delivery_config: Dict[str, Any] = {}


class ReportGenerationService:
    """Service for generating, scheduling, and managing analytics reports"""

    def __init__(self, db: Session, analytics_service: AnalyticsService, dashboard_service: CustomDashboardService):
        self.db = db
        self.analytics_service = analytics_service
        self.dashboard_service = dashboard_service
        self.temp_dir = Path(tempfile.gettempdir()) / "digame_reports"
        self.temp_dir.mkdir(exist_ok=True)

    async def generate_report(
        self,
        report_definition: ReportDefinition,
        tenant_id: int,
        user_id: int,
        filters: Optional[Dict[str, Any]] = None,
        time_range: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate a report based on the definition"""
        
        report_id = str(uuid.uuid4())
        timestamp = datetime.utcnow()
        
        try:
            # Prepare report context
            context = {
                "report_id": report_id,
                "generated_at": timestamp,
                "tenant_id": tenant_id,
                "user_id": user_id,
                "filters": filters or {},
                "time_range": time_range or {},
                "report_definition": report_definition
            }

            # Generate content blocks
            content_data = await self._generate_content_blocks(
                report_definition.content_blocks,
                tenant_id,
                filters,
                time_range
            )

            # Generate report based on output format
            if report_definition.output_format.lower() == "pdf":
                file_path = await self._generate_pdf_report(report_definition, content_data, context)
            elif report_definition.output_format.lower() == "excel":
                file_path = await self._generate_excel_report(report_definition, content_data, context)
            elif report_definition.output_format.lower() == "html":
                file_path = await self._generate_html_report(report_definition, content_data, context)
            elif report_definition.output_format.lower() == "json":
                file_path = await self._generate_json_report(report_definition, content_data, context)
            else:
                raise ValueError(f"Unsupported output format: {report_definition.output_format}")

            return {
                "report_id": report_id,
                "file_path": str(file_path),
                "file_size": file_path.stat().st_size if file_path.exists() else 0,
                "generated_at": timestamp.isoformat(),
                "format": report_definition.output_format,
                "status": "completed"
            }

        except Exception as e:
            return {
                "report_id": report_id,
                "error": str(e),
                "generated_at": timestamp.isoformat(),
                "status": "failed"
            }

    async def _generate_content_blocks(
        self,
        content_blocks: List[ReportContentBlock],
        tenant_id: int,
        filters: Optional[Dict[str, Any]] = None,
        time_range: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Generate data for all content blocks"""
        
        content_data = []
        
        for block in content_blocks:
            try:
                if block.block_type == "text":
                    content_data.append({
                        "type": "text",
                        "title": block.title,
                        "content": block.text_content,
                        "display_options": block.display_options
                    })
                
                elif getattr(block, 'data_source', None):
                    try:
                        # Fetch data using dashboard service
                        data = await self.dashboard_service.get_data_for_source(
                            data_source_config=block.data_source,
                            tenant_id=tenant_id
                        )
                        
                        # Process data based on block type
                        processed_data = await self._process_block_data(
                            block.block_type,
                            data,
                            block.display_options,
                            filters,
                            time_range
                        )
                        
                        content_data.append({
                            "type": block.block_type,
                            "title": block.title,
                            "data": processed_data,
                            "display_options": block.display_options
                        })
                    except Exception as e:
                        content_data.append({
                            "type": "error",
                            "title": block.title or "Data Source Error",
                            "error": f"Failed to fetch data: {str(e)}",
                            "display_options": block.display_options
                        })
                
            except Exception as e:
                content_data.append({
                    "type": "error",
                    "title": block.title or "Error Block",
                    "error": str(e),
                    "display_options": block.display_options
                })
        
        return content_data

    async def _process_block_data(
        self,
        block_type: str,
        raw_data: Any,
        display_options: Dict[str, Any],
        filters: Optional[Dict[str, Any]] = None,
        time_range: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process raw data for specific block types"""
        
        if block_type == "chart":
            return await self._process_chart_data(raw_data, display_options)
        elif block_type == "table":
            return await self._process_table_data(raw_data, display_options)
        elif block_type == "kpi_summary":
            return await self._process_kpi_data(raw_data, display_options)
        elif block_type == "dashboard_snapshot":
            return await self._process_dashboard_snapshot_data(raw_data, display_options)
        else:
            return {"raw_data": raw_data}

    async def _process_chart_data(self, data: Any, options: Dict[str, Any]) -> Dict[str, Any]:
        """Process data for chart visualization"""
        
        chart_type = options.get("chart_type", "line")
        
        if isinstance(data, list) and len(data) > 0:
            df = pd.DataFrame(data)
            
            # Create chart based on type
            if chart_type == "line":
                fig = px.line(df, 
                    x=options.get("x_axis", df.columns[0]),
                    y=options.get("y_axis", df.columns[1]),
                    title=options.get("title", "Line Chart")
                )
            elif chart_type == "bar":
                fig = px.bar(df,
                    x=options.get("x_axis", df.columns[0]),
                    y=options.get("y_axis", df.columns[1]),
                    title=options.get("title", "Bar Chart")
                )
            elif chart_type == "pie":
                fig = px.pie(df,
                    names=options.get("names", df.columns[0]),
                    values=options.get("values", df.columns[1]),
                    title=options.get("title", "Pie Chart")
                )
            else:
                fig = px.scatter(df,
                    x=options.get("x_axis", df.columns[0]),
                    y=options.get("y_axis", df.columns[1]),
                    title=options.get("title", "Scatter Plot")
                )
            
            # Convert to image for PDF reports
            img_bytes = pio.to_image(fig, format="png", width=800, height=600)
            
            return {
                "chart_type": chart_type,
                "image_data": img_bytes,
                "data_summary": {
                    "rows": len(df),
                    "columns": list(df.columns)
                }
            }
        
        return {"error": "No valid data for chart"}

    async def _process_table_data(self, data: Any, options: Dict[str, Any]) -> Dict[str, Any]:
        """Process data for table display"""
        
        if isinstance(data, list):
            df = pd.DataFrame(data)
            
            # Apply table options
            max_rows = options.get("max_rows", 50)
            visible_columns = options.get("visible_columns")
            
            if visible_columns:
                df = df[visible_columns]
            
            if len(df) > max_rows:
                df = df.head(max_rows)
            
            return {
                "headers": list(df.columns),
                "rows": df.values.tolist(),
                "total_rows": len(data),
                "displayed_rows": len(df)
            }
        
        return {"error": "No valid data for table"}

    async def _process_kpi_data(self, data: Any, options: Dict[str, Any]) -> Dict[str, Any]:
        """Process data for KPI summary"""
        
        if isinstance(data, dict):
            return {
                "value": data.get("value", 0),
                "formatted_value": data.get("formatted_value"),
                "unit": data.get("unit"),
                "trend": data.get("trend"),
                "change_percent": data.get("change_percent"),
                "status": data.get("status", "normal")
            }
        elif isinstance(data, list) and len(data) > 0:
            # Aggregate multiple metrics
            total_value = sum(item.get("value", 0) for item in data if isinstance(item, dict))
            return {
                "value": total_value,
                "count": len(data),
                "status": "aggregated"
            }
        
        return {"error": "No valid data for KPI"}

    async def _process_dashboard_snapshot_data(self, data: Any, options: Dict[str, Any]) -> Dict[str, Any]:
        """Process data for dashboard snapshot"""
        
        if isinstance(data, dict):
            return {
                "snapshot_type": "dashboard",
                "widgets_count": data.get("widgets_count", 0),
                "last_updated": data.get("last_updated"),
                "summary": data.get("summary", "Dashboard snapshot")
            }
        
        return {"error": "No valid data for dashboard snapshot"}

    async def _generate_pdf_report(
        self,
        report_def: ReportDefinition,
        content_data: List[Dict[str, Any]],
        context: Dict[str, Any]
    ) -> Path:
        """Generate PDF report"""
        
        file_path = self.temp_dir / f"report_{context['report_id']}.pdf"
        
        # Check if reportlab is available and create PDF document
        if not REPORTLAB_AVAILABLE:
            raise ValueError("ReportLab is required for PDF generation but not installed")
        
        if SimpleDocTemplate and A4 and getSampleStyleSheet:
            doc = SimpleDocTemplate(str(file_path), pagesize=A4)
            styles = getSampleStyleSheet()
            story = []
        else:
            raise ValueError("ReportLab components not available")
        
        # Cover page
        if report_def.include_cover_page and Paragraph and Spacer:
            story.append(Paragraph(report_def.name, styles['Title']))
            story.append(Spacer(1, 12))
            story.append(Paragraph(f"Generated: {context['generated_at']}", styles['Normal']))
            if report_def.description:
                story.append(Spacer(1, 12))
                story.append(Paragraph(report_def.description, styles['Normal']))
            story.append(Spacer(1, 24))
        
        # Content blocks
        for block in content_data:
            if block["type"] == "text" and Paragraph and Spacer:
                if block.get("title"):
                    story.append(Paragraph(block["title"], styles['Heading2']))
                story.append(Paragraph(block.get("content", ""), styles['Normal']))
                story.append(Spacer(1, 12))
            
            elif block["type"] == "chart" and Paragraph:
                if block.get("title"):
                    story.append(Paragraph(block["title"], styles['Heading2']))
                
                block_data = block.get("data", {})
                if isinstance(block_data, dict) and "image_data" in block_data:
                    try:
                        # Save chart image temporarily
                        img_path = self.temp_dir / f"chart_{uuid.uuid4()}.png"
                        with open(img_path, "wb") as f:
                            f.write(block_data["image_data"])
                        
                        # Add image to PDF
                        if Image and Spacer:
                            img = Image(str(img_path), width=6*inch, height=4*inch)
                            story.append(img)
                            story.append(Spacer(1, 12))
                    except Exception:
                        # Skip images that can't be processed
                        story.append(Paragraph("Chart could not be rendered", styles['Normal']))
                        story.append(Spacer(1, 12))
            
            elif block["type"] == "table" and Paragraph:
                if block.get("title"):
                    story.append(Paragraph(block["title"], styles['Heading2']))
                
                block_data = block.get("data", {})
                if isinstance(block_data, dict) and "headers" in block_data and "rows" in block_data:
                    try:
                        if Table and TableStyle and colors and Spacer:
                            table_data = [block_data["headers"]] + block_data["rows"]
                            table = Table(table_data)
                            table.setStyle(TableStyle([
                                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                                ('FONTSIZE', (0, 0), (-1, 0), 14),
                                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                                ('GRID', (0, 0), (-1, -1), 1, colors.black)
                            ]))
                            story.append(table)
                            story.append(Spacer(1, 12))
                    except Exception:
                        # Skip tables that can't be processed
                        if Paragraph and Spacer:
                            story.append(Paragraph("Table could not be rendered", styles['Normal']))
                            story.append(Spacer(1, 12))
            
            elif block["type"] == "kpi_summary" and Paragraph:
                if block.get("title"):
                    story.append(Paragraph(block["title"], styles['Heading2']))
                
                block_data = block.get("data", {})
                if isinstance(block_data, dict):
                    kpi_text = f"Value: {block_data.get('formatted_value', block_data.get('value', 'N/A'))}"
                    change_percent = block_data.get("change_percent")
                    if change_percent is not None:
                        try:
                            kpi_text += f" ({float(change_percent):+.1f}%)"
                        except (ValueError, TypeError):
                            pass
                    
                    if Paragraph and Spacer:
                        story.append(Paragraph(kpi_text, styles['Normal']))
                        story.append(Spacer(1, 12))
        
        # Build PDF
        doc.build(story)
        
        return file_path

    async def _generate_excel_report(
        self,
        report_def: ReportDefinition,
        content_data: List[Dict[str, Any]],
        context: Dict[str, Any]
    ) -> Path:
        """Generate Excel report"""
        
        file_path = self.temp_dir / f"report_{context['report_id']}.xlsx"
        
        with pd.ExcelWriter(str(file_path), engine='openpyxl') as writer:
            # Summary sheet
            summary_data = {
                "Report Name": [report_def.name],
                "Generated": [context['generated_at']],
                "Description": [report_def.description or ""]
            }
            pd.DataFrame(summary_data).to_excel(writer, sheet_name='Summary', index=False)
            
            # Content sheets
            sheet_num = 1
            for block in content_data:
                block_data = block.get("data", {})
                if block.get("type") == "table" and isinstance(block_data, dict) and "headers" in block_data and "rows" in block_data:
                    try:
                        df = pd.DataFrame(block_data["rows"], columns=block_data["headers"])
                        sheet_name = block.get("title", f"Data_{sheet_num}")[:31]  # Excel sheet name limit
                        df.to_excel(writer, sheet_name=sheet_name, index=False)
                        sheet_num += 1
                    except Exception:
                        # Skip tables that can't be processed
                        continue
                
                elif block.get("type") == "kpi_summary" and isinstance(block_data, dict):
                    try:
                        kpi_df = pd.DataFrame([block_data])
                        sheet_name = block.get("title", f"KPI_{sheet_num}")[:31]
                        kpi_df.to_excel(writer, sheet_name=sheet_name, index=False)
                        sheet_num += 1
                    except Exception:
                        # Skip KPIs that can't be processed
                        continue
        
        return file_path

    async def _generate_html_report(
        self,
        report_def: ReportDefinition,
        content_data: List[Dict[str, Any]],
        context: Dict[str, Any]
    ) -> Path:
        """Generate HTML report"""
        
        file_path = self.temp_dir / f"report_{context['report_id']}.html"
        
        # HTML template
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>{{ report_name }}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                .content-block { margin-bottom: 30px; }
                .chart { text-align: center; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .kpi { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{{ report_name }}</h1>
                <p>Generated: {{ generated_at }}</p>
                {% if description %}
                <p>{{ description }}</p>
                {% endif %}
            </div>
            
            {% for block in content_blocks %}
            <div class="content-block">
                {% if block.title %}
                <h2>{{ block.title }}</h2>
                {% endif %}
                
                {% if block.type == 'text' %}
                <p>{{ block.content }}</p>
                
                {% elif block.type == 'table' %}
                <table>
                    <thead>
                        <tr>
                        {% for header in block.data.headers %}
                            <th>{{ header }}</th>
                        {% endfor %}
                        </tr>
                    </thead>
                    <tbody>
                        {% for row in block.data.rows %}
                        <tr>
                        {% for cell in row %}
                            <td>{{ cell }}</td>
                        {% endfor %}
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
                
                {% elif block.type == 'kpi_summary' %}
                <div class="kpi">
                    <h3>{{ block.data.formatted_value or block.data.value }}</h3>
                    {% if block.data.change_percent %}
                    <p>Change: {{ block.data.change_percent }}%</p>
                    {% endif %}
                </div>
                
                {% endif %}
            </div>
            {% endfor %}
        </body>
        </html>
        """
        
        template = Template(html_template)
        html_content = template.render(
            report_name=report_def.name,
            description=report_def.description,
            generated_at=context['generated_at'],
            content_blocks=content_data
        )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return file_path

    async def _generate_json_report(
        self,
        report_def: ReportDefinition,
        content_data: List[Dict[str, Any]],
        context: Dict[str, Any]
    ) -> Path:
        """Generate JSON report"""
        
        file_path = self.temp_dir / f"report_{context['report_id']}.json"
        
        report_data = {
            "report_metadata": {
                "name": report_def.name,
                "description": report_def.description,
                "generated_at": context['generated_at'],
                "report_id": context['report_id'],
                "format": "json"
            },
            "content_blocks": content_data,
            "context": context
        }
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, default=str)
        
        return file_path

    # Dashboard Export Methods
    async def export_dashboard_as_report(
        self,
        dashboard_id: int,
        tenant_id: int,
        export_format: str = "pdf",
        include_data: bool = True,
        filters: Optional[Dict[str, Any]] = None,
        time_range: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Export a dashboard as a report"""
        
        # Get dashboard
        dashboard = self.analytics_service.get_dashboard(dashboard_id, tenant_id, tenant_id)  # Using tenant_id as user_id for simplicity
        if not dashboard:
            raise HTTPException(status_code=404, detail="Dashboard not found")
        
        # Create report definition from dashboard
        content_blocks = []
        dashboard_widgets = getattr(dashboard, 'widgets', [])  # type: ignore
        for widget in dashboard_widgets:
            widget_title = getattr(widget, 'title', 'Untitled Widget')  # type: ignore
            widget_type = getattr(widget, 'widget_type', 'table')  # type: ignore
            data_source_config = getattr(widget, 'data_source_config', {})  # type: ignore
            display_options = getattr(widget, 'display_options', {})  # type: ignore
            
            try:
                content_blocks.append(ReportContentBlock(
                    title=widget_title,
                    block_type="chart" if widget_type in ["line_chart", "bar_chart", "pie_chart"] else "table",
                    data_source=schemas.WidgetDataSourceConfig(**data_source_config) if data_source_config else None,
                    display_options=display_options
                ))
            except Exception:
                # Skip widgets that can't be processed
                continue
        
        dashboard_name = getattr(dashboard, 'name', 'Untitled Dashboard')  # type: ignore
        dashboard_description = getattr(dashboard, 'description', None)  # type: ignore
        
        report_def = ReportDefinition(
            name=f"Dashboard Export: {dashboard_name}",
            description=dashboard_description,
            content_blocks=content_blocks,
            output_format=export_format
        )
        
        return await self.generate_report(report_def, tenant_id, tenant_id, filters, time_range)


def get_report_generation_service(
    db: Session,
    analytics_service: AnalyticsService,
    dashboard_service: CustomDashboardService
) -> ReportGenerationService:
    """Dependency for getting report generation service"""
    return ReportGenerationService(db, analytics_service, dashboard_service)