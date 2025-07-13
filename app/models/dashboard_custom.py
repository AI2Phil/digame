from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

# Import existing dashboard models to avoid duplicates
from .analytics import AnalyticsDashboard, DashboardWidgetConfig as DashboardWidget
from .enterprise_dashboard import DashboardWidget as EnterpriseDashboardWidget


class ReportDefinition(Base):  # type: ignore
    """
    Stores user-defined report configurations.
    """
    __tablename__ = "report_definitions"
    __table_args__ = {'extend_existing': True}

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
