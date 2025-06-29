from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from .user import Base

class DashboardWidget(Base):  # type: ignore
    """
    Configuration for a single widget on a custom analytics dashboard.
    """
    __tablename__ = "dashboard_widgets"

    id = Column(Integer(), primary_key=True, index=True)  # type: ignore
    widget_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    tenant_id = Column(Integer(), ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    # user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Optional: if widgets can be user-specific beyond dashboard ownership

    title = Column(String(255), nullable=False)  # type: ignore
    widget_type = Column(String(100), nullable=False)  # type: ignore  # e.g., "kpi_card", "line_chart", "bar_chart", "table"

    # Data source configuration: specifies what data this widget displays
    # Example: {"type": "performance_metric", "query_params": {"metric_name": "tasks_completed", "entity_id": 1}}
    # Example: {"type": "analytics_prediction", "query_params": {"model_id": 5, "entity_type": "project"}}
    data_source_config = Column(JSON, nullable=False)  # type: ignore

    # Display options specific to the widget type
    # Example: {"color": "blue", "time_range": "last_7_days", "axes_labels": {"x": "Date", "y": "Value"}}
    display_options = Column(JSON, nullable=True, default=lambda: {})  # type: ignore

    created_at = Column(DateTime(), default=datetime.utcnow)  # type: ignore
    updated_at = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)  # type: ignore

    # Relationship to dashboards (a widget might appear on multiple dashboards, or be unique to one)
    # For simplicity here, let's assume a widget is defined once and can be referenced.
    # However, if widget configs are specific to a dashboard instance, this might be part of AnalyticsDashboard.layout directly.
    # The schemas suggested widget_id in layout, so separate widget definitions are assumed.

    def __repr__(self):
        return f"<DashboardWidget(id={self.id}, title='{self.title}', type='{self.widget_type}')>"


class AnalyticsDashboard(Base):  # type: ignore
    """
    Custom analytics dashboard configuration.
    """
    __tablename__ = "analytics_dashboards"

    id = Column(Integer(), primary_key=True, index=True)  # type: ignore
    dashboard_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    tenant_id = Column(Integer(), ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    user_id = Column(Integer(), ForeignKey("users.id"), nullable=False, index=True)  # type: ignore # Owner of the dashboard

    name = Column(String(255), nullable=False)  # type: ignore
    description = Column(Text(), nullable=True)  # type: ignore

    # Layout stores an array of objects, each defining a widget's position and reference.
    # Example: [{"widget_id": 1, "x": 0, "y": 0, "w": 4, "h": 2}, ...]
    # These widget_ids refer to DashboardWidget records.
    layout = Column(JSON, nullable=False, default=lambda: [])  # type: ignore

    tags = Column(JSON, nullable=True, default=lambda: [])  # type: ignore # For categorization/searching dashboards

    is_public = Column(Boolean(), default=False)  # type: ignore # If the dashboard can be viewed by others in the tenant

    created_at = Column(DateTime(), default=datetime.utcnow)  # type: ignore
    updated_at = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)  # type: ignore

    owner = relationship("User") # Relationship to the User model

    def __repr__(self):
        return f"<AnalyticsDashboard(id={self.id}, name='{self.name}', user_id={self.user_id})>"

# Remember to add these to digame/app/models/__init__.py:
# from .dashboard_custom import AnalyticsDashboard, DashboardWidget, ReportDefinition


class ReportDefinition(Base):  # type: ignore
    """
    Stores user-defined report configurations.
    """
    __tablename__ = "report_definitions"

    id = Column(Integer(), primary_key=True, index=True)  # type: ignore
    definition_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))  # type: ignore

    name = Column(String(255), nullable=False)  # type: ignore
    description = Column(Text(), nullable=True)  # type: ignore
    report_type = Column(String(100), default="generic", index=True)  # type: ignore # E.g., "performance_summary", "custom_dashboard_export"

    # Storing complex structures like content_blocks and global_filters as JSON
    # For PostgreSQL, JSONB is generally preferred over JSON for performance and functionality.
    # Using JSON here for broader compatibility if DB is not PostgreSQL, but JSONB is better if it is.
    content_blocks = Column(JSON, nullable=False, default=lambda: [])  # type: ignore
    global_filters = Column(JSON, nullable=True, default=lambda: [])  # type: ignore

    output_format = Column(String(50), default="pdf")  # type: ignore # Default output format

    tenant_id = Column(Integer(), ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    user_id = Column(Integer(), ForeignKey("users.id"), nullable=False, index=True)  # type: ignore # Creator/owner

    created_at = Column(DateTime(), default=datetime.utcnow)  # type: ignore
    updated_at = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)  # type: ignore

    # Relationships
    owner = relationship("User") # Relationship to the User model for user_id
    # schedules = relationship("ReportSchedule", back_populates="report_definition") # If ReportSchedule links back

    def __repr__(self):
        return f"<ReportDefinition(id={self.id}, name='{self.name}', tenant_id={self.tenant_id})>"
