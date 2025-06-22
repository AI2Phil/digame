from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

try:
    from ..database import Base
except ImportError:
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()

class ComparativeBenchmark(Base):
    """
    Stores industry or peer benchmark data for comparative analytics.
    """
    __tablename__ = "comparative_benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    benchmark_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True) # Nullable for global benchmarks

    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True) # e.g., industry, performance, user_segment
    source = Column(String(255), nullable=True) # e.g., "Industry Report XYZ 2024", "Internal Peer Group"

    # Benchmark scope and applicability
    metric_name = Column(String(255), nullable=False, index=True) # The specific metric being benchmarked
    entity_type = Column(String(100), nullable=True) # e.g., user, project, department. For context.
    industry_segment = Column(String(100), nullable=True, index=True) # e.g., "SaaS", "Healthcare", "Finance"
    region = Column(String(100), nullable=True, index=True) # e.g., "North America", "EMEA"
    company_size = Column(String(50), nullable=True) # e.g., "1-50", "51-200", "Enterprise"

    # Benchmark values
    benchmark_value = Column(Float, nullable=False) # The actual benchmark figure
    value_type = Column(String(50), default="average") # e.g., average, median, percentile_75, top_10_percent
    unit = Column(String(50), nullable=True) # e.g., "%", "USD", "hours"

    # Data period for the benchmark
    period_start_date = Column(DateTime, nullable=True)
    period_end_date = Column(DateTime, nullable=True)
    data_freshness_date = Column(DateTime, nullable=False, default=datetime.utcnow) # When this benchmark data was last updated/validated

    # Confidence and range (optional)
    confidence_level = Column(Float, nullable=True) # e.g., 0.95 for 95% confidence
    lower_bound = Column(Float, nullable=True)
    upper_bound = Column(Float, nullable=True)
    sample_size = Column(Integer, nullable=True) # If applicable, the size of the sample used for the benchmark

    # Dimensions for more granular benchmarks
    # e.g., {"role": "Software Engineer", "experience_level": "Senior"}
    dimensions = Column(JSON, nullable=True)

    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    # Nullable if system-generated or global

    def __repr__(self):
        return f"<ComparativeBenchmark(id={self.id}, name='{self.name}', metric='{self.metric_name}', value={self.benchmark_value})>"

# Example of how it might be related if a prediction directly uses a benchmark
# In AnalyticsPrediction model:
# benchmark_id = Column(Integer, ForeignKey("comparative_benchmarks.id"), nullable=True)
# benchmark = relationship("ComparativeBenchmark")

# Need to add this to __init__.py in models
# from .comparative_benchmark import ComparativeBenchmark
