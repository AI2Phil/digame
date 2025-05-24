"""
Market Intelligence models for industry trend analysis and competitive intelligence
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float, Numeric
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


class MarketTrend(Base):
    """
    Market trends and industry analysis data
    """
    __tablename__ = "market_trends"

    id = Column(Integer, primary_key=True, index=True)
    trend_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Trend metadata
    trend_name = Column(String(255), nullable=False, index=True)
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    industry = Column(String(100), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # technology, market, consumer, regulatory
    
    # Trend classification
    trend_type = Column(String(50), nullable=False)  # emerging, growing, mature, declining
    impact_level = Column(String(50), nullable=False)  # low, medium, high, critical
    confidence_score = Column(Float, nullable=False, default=0.0)  # 0-1 confidence in trend
    
    # Trend metrics
    growth_rate = Column(Float, nullable=True)  # Percentage growth rate
    market_size = Column(Numeric(15, 2), nullable=True)  # Market size in currency
    adoption_rate = Column(Float, nullable=True)  # Adoption percentage
    maturity_stage = Column(String(50), nullable=True)  # innovation, early_adoption, early_majority, etc.
    
    # Time period
    period_start = Column(DateTime, nullable=False, index=True)
    period_end = Column(DateTime, nullable=False, index=True)
    forecast_horizon = Column(Integer, nullable=True)  # Days into future
    
    # Data sources and analysis
    data_sources = Column(JSON, default=[])  # List of data sources
    analysis_methods = Column(JSON, default=[])  # Analysis techniques used
    key_indicators = Column(JSON, default={})  # Key performance indicators
    supporting_data = Column(JSON, default={})  # Supporting metrics and data
    
    # Geographic scope
    geographic_scope = Column(String(100), default="global")  # global, regional, national, local
    regions = Column(JSON, default=[])  # Specific regions if applicable
    
    # Status and validation
    status = Column(String(50), default="active")  # active, archived, deprecated
    is_validated = Column(Boolean, default=False)
    validation_date = Column(DateTime, nullable=True)
    validation_notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    competitive_analyses = relationship("CompetitiveAnalysis", back_populates="market_trend")
    intelligence_reports = relationship("IntelligenceReport", back_populates="market_trend")

    def __repr__(self):
        return f"<MarketTrend(id={self.id}, name='{self.trend_name}', industry='{self.industry}')>"

    @property
    def trend_strength(self):
        """Calculate trend strength based on confidence and impact"""
        impact_weights = {"low": 0.25, "medium": 0.5, "high": 0.75, "critical": 1.0}
        impact_weight = impact_weights.get(self.impact_level, 0.5)
        return self.confidence_score * impact_weight

    @property
    def is_emerging(self):
        """Check if trend is emerging"""
        return self.trend_type == "emerging" and self.confidence_score >= 0.7

    @property
    def requires_attention(self):
        """Check if trend requires immediate attention"""
        return (
            self.impact_level in ["high", "critical"] and
            self.confidence_score >= 0.8 and
            self.trend_type in ["emerging", "growing"]
        )


class CompetitiveAnalysis(Base):
    """
    Competitive intelligence and analysis data
    """
    __tablename__ = "competitive_analyses"

    id = Column(Integer, primary_key=True, index=True)
    analysis_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    market_trend_id = Column(Integer, ForeignKey("market_trends.id"), nullable=True, index=True)
    
    # Analysis metadata
    analysis_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    industry = Column(String(100), nullable=False, index=True)
    analysis_type = Column(String(100), nullable=False)  # competitor, market_position, swot, porter_five
    
    # Competitive landscape
    primary_competitors = Column(JSON, default=[])  # List of main competitors
    secondary_competitors = Column(JSON, default=[])  # List of secondary competitors
    emerging_competitors = Column(JSON, default=[])  # New market entrants
    
    # Market positioning
    market_position = Column(String(50), nullable=True)  # leader, challenger, follower, niche
    market_share = Column(Float, nullable=True)  # Market share percentage
    competitive_advantage = Column(JSON, default=[])  # List of competitive advantages
    competitive_threats = Column(JSON, default=[])  # List of threats
    
    # SWOT Analysis
    strengths = Column(JSON, default=[])
    weaknesses = Column(JSON, default=[])
    opportunities = Column(JSON, default=[])
    threats = Column(JSON, default=[])
    
    # Porter's Five Forces
    competitive_rivalry = Column(Float, nullable=True)  # 1-5 scale
    supplier_power = Column(Float, nullable=True)  # 1-5 scale
    buyer_power = Column(Float, nullable=True)  # 1-5 scale
    threat_of_substitution = Column(Float, nullable=True)  # 1-5 scale
    threat_of_new_entry = Column(Float, nullable=True)  # 1-5 scale
    
    # Financial metrics
    revenue_comparison = Column(JSON, default={})  # Revenue vs competitors
    profitability_metrics = Column(JSON, default={})  # Profit margins, ROI, etc.
    growth_metrics = Column(JSON, default={})  # Growth rates vs competitors
    
    # Product/Service analysis
    product_comparison = Column(JSON, default={})  # Feature comparisons
    pricing_analysis = Column(JSON, default={})  # Pricing strategies
    innovation_metrics = Column(JSON, default={})  # R&D, patents, etc.
    
    # Time period
    analysis_date = Column(DateTime, default=datetime.utcnow, index=True)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # Data quality and sources
    data_sources = Column(JSON, default=[])
    confidence_level = Column(Float, default=0.0)  # 0-1 confidence in analysis
    data_completeness = Column(Float, default=0.0)  # 0-1 data completeness
    
    # Status and validation
    status = Column(String(50), default="draft")  # draft, completed, validated, archived
    is_validated = Column(Boolean, default=False)
    validation_date = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    market_trend = relationship("MarketTrend", back_populates="competitive_analyses")

    def __repr__(self):
        return f"<CompetitiveAnalysis(id={self.id}, name='{self.analysis_name}', type='{self.analysis_type}')>"

    @property
    def overall_competitive_intensity(self):
        """Calculate overall competitive intensity from Porter's Five Forces"""
        forces = [
            self.competitive_rivalry,
            self.supplier_power,
            self.buyer_power,
            self.threat_of_substitution,
            self.threat_of_new_entry
        ]
        valid_forces = [f for f in forces if f is not None]
        return sum(valid_forces) / len(valid_forces) if valid_forces else 0.0

    @property
    def competitive_position_strength(self):
        """Calculate competitive position strength"""
        position_scores = {
            "leader": 1.0,
            "challenger": 0.75,
            "follower": 0.5,
            "niche": 0.6
        }
        base_score = position_scores.get(self.market_position, 0.5)
        
        # Adjust based on market share
        if self.market_share:
            share_bonus = min(self.market_share / 100, 0.3)  # Max 30% bonus
            base_score += share_bonus
        
        return min(base_score, 1.0)

    def calculate_swot_score(self):
        """Calculate SWOT analysis score"""
        strengths_count = len(self.strengths) if self.strengths else 0
        weaknesses_count = len(self.weaknesses) if self.weaknesses else 0
        opportunities_count = len(self.opportunities) if self.opportunities else 0
        threats_count = len(self.threats) if self.threats else 0
        
        positive_score = strengths_count + opportunities_count
        negative_score = weaknesses_count + threats_count
        total_items = positive_score + negative_score
        
        if total_items == 0:
            return 0.5
        
        return positive_score / total_items


class IntelligenceReport(Base):
    """
    Intelligence reports combining market trends and competitive analysis
    """
    __tablename__ = "intelligence_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    market_trend_id = Column(Integer, ForeignKey("market_trends.id"), nullable=True, index=True)
    
    # Report metadata
    report_name = Column(String(255), nullable=False)
    report_type = Column(String(100), nullable=False)  # market_overview, competitive_landscape, trend_analysis
    description = Column(Text, nullable=True)
    industry = Column(String(100), nullable=False, index=True)
    
    # Report content
    executive_summary = Column(Text, nullable=True)
    key_findings = Column(JSON, default=[])
    recommendations = Column(JSON, default=[])
    action_items = Column(JSON, default=[])
    
    # Analysis results
    market_insights = Column(JSON, default={})
    competitive_insights = Column(JSON, default={})
    trend_predictions = Column(JSON, default={})
    risk_assessment = Column(JSON, default={})
    
    # Strategic implications
    strategic_recommendations = Column(JSON, default=[])
    investment_implications = Column(JSON, default=[])
    operational_impacts = Column(JSON, default=[])
    timeline_recommendations = Column(JSON, default={})
    
    # Report metrics
    confidence_score = Column(Float, default=0.0)  # Overall confidence in report
    impact_score = Column(Float, default=0.0)  # Potential business impact
    urgency_score = Column(Float, default=0.0)  # Urgency of action required
    
    # Time period and validity
    report_date = Column(DateTime, default=datetime.utcnow, index=True)
    period_covered_start = Column(DateTime, nullable=False)
    period_covered_end = Column(DateTime, nullable=False)
    validity_period_days = Column(Integer, default=90)  # How long report remains valid
    
    # Data sources and methodology
    data_sources = Column(JSON, default=[])
    analysis_methodology = Column(JSON, default={})
    limitations = Column(JSON, default=[])
    assumptions = Column(JSON, default=[])
    
    # Distribution and access
    target_audience = Column(JSON, default=[])  # Who should see this report
    distribution_list = Column(JSON, default=[])  # User IDs or roles
    access_level = Column(String(50), default="internal")  # internal, confidential, restricted
    
    # Status and lifecycle
    status = Column(String(50), default="draft")  # draft, review, approved, published, archived
    approval_status = Column(String(50), default="pending")  # pending, approved, rejected
    approved_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Usage tracking
    view_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    last_accessed_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    market_trend = relationship("MarketTrend", back_populates="intelligence_reports")

    def __repr__(self):
        return f"<IntelligenceReport(id={self.id}, name='{self.report_name}', type='{self.report_type}')>"

    @property
    def is_expired(self):
        """Check if report has expired"""
        if not self.validity_period_days:
            return False
        
        from datetime import timedelta
        expiry_date = self.report_date + timedelta(days=self.validity_period_days)
        return datetime.utcnow() > expiry_date

    @property
    def overall_priority_score(self):
        """Calculate overall priority score"""
        return (self.confidence_score * 0.3 + 
                self.impact_score * 0.4 + 
                self.urgency_score * 0.3)

    @property
    def priority_level(self):
        """Get priority level based on scores"""
        score = self.overall_priority_score
        if score >= 0.8:
            return "critical"
        elif score >= 0.6:
            return "high"
        elif score >= 0.4:
            return "medium"
        else:
            return "low"

    def mark_accessed(self):
        """Mark report as accessed"""
        self.view_count += 1
        self.last_accessed_at = datetime.utcnow()


class MarketDataSource(Base):
    """
    External data sources for market intelligence
    """
    __tablename__ = "market_data_sources"

    id = Column(Integer, primary_key=True, index=True)
    source_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Source metadata
    source_name = Column(String(255), nullable=False)
    source_type = Column(String(100), nullable=False)  # api, rss, web_scraping, manual, third_party
    description = Column(Text, nullable=True)
    provider = Column(String(255), nullable=True)
    
    # Connection details
    endpoint_url = Column(String(500), nullable=True)
    api_key = Column(Text, nullable=True)  # Encrypted
    authentication_method = Column(String(100), nullable=True)  # api_key, oauth, basic, none
    headers = Column(JSON, default={})
    parameters = Column(JSON, default={})
    
    # Data configuration
    data_format = Column(String(50), nullable=False)  # json, xml, csv, html
    extraction_rules = Column(JSON, default={})  # Rules for extracting data
    transformation_rules = Column(JSON, default={})  # Data transformation rules
    update_frequency = Column(String(50), default="daily")  # hourly, daily, weekly, monthly
    
    # Quality and reliability
    reliability_score = Column(Float, default=0.0)  # 0-1 reliability rating
    data_quality_score = Column(Float, default=0.0)  # 0-1 data quality rating
    last_successful_fetch = Column(DateTime, nullable=True)
    last_fetch_attempt = Column(DateTime, nullable=True)
    consecutive_failures = Column(Integer, default=0)
    
    # Coverage and scope
    industries_covered = Column(JSON, default=[])
    geographic_coverage = Column(JSON, default=[])
    data_categories = Column(JSON, default=[])  # market_size, trends, competitors, etc.
    
    # Status and configuration
    is_active = Column(Boolean, default=True)
    is_automated = Column(Boolean, default=True)
    requires_approval = Column(Boolean, default=False)
    
    # Cost and usage
    cost_per_request = Column(Numeric(10, 4), nullable=True)
    monthly_request_limit = Column(Integer, nullable=True)
    requests_used_this_month = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    def __repr__(self):
        return f"<MarketDataSource(id={self.id}, name='{self.source_name}', type='{self.source_type}')>"

    @property
    def is_healthy(self):
        """Check if data source is healthy"""
        return (
            self.is_active and
            self.consecutive_failures < 5 and
            self.reliability_score >= 0.7
        )

    @property
    def usage_percentage(self):
        """Calculate usage percentage of monthly limit"""
        if not self.monthly_request_limit:
            return 0.0
        return (self.requests_used_this_month / self.monthly_request_limit) * 100

    def record_fetch_attempt(self, success: bool, error_message: str = None):
        """Record a fetch attempt"""
        self.last_fetch_attempt = datetime.utcnow()
        
        if success:
            self.last_successful_fetch = datetime.utcnow()
            self.consecutive_failures = 0
            self.requests_used_this_month += 1
        else:
            self.consecutive_failures += 1
            
            # Disable source if too many consecutive failures
            if self.consecutive_failures >= 10:
                self.is_active = False


class IndustryBenchmark(Base):
    """
    Industry benchmarks and performance metrics
    """
    __tablename__ = "industry_benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    benchmark_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Benchmark metadata
    benchmark_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    industry = Column(String(100), nullable=False, index=True)
    sub_industry = Column(String(100), nullable=True, index=True)
    
    # Metric details
    metric_name = Column(String(255), nullable=False)
    metric_type = Column(String(100), nullable=False)  # financial, operational, market, customer
    measurement_unit = Column(String(50), nullable=False)
    calculation_method = Column(Text, nullable=True)
    
    # Benchmark values
    median_value = Column(Float, nullable=False)
    mean_value = Column(Float, nullable=True)
    percentile_25 = Column(Float, nullable=True)
    percentile_75 = Column(Float, nullable=True)
    percentile_90 = Column(Float, nullable=True)
    best_in_class = Column(Float, nullable=True)
    
    # Sample information
    sample_size = Column(Integer, nullable=False)
    sample_description = Column(Text, nullable=True)
    geographic_scope = Column(String(100), default="global")
    company_size_range = Column(String(100), nullable=True)  # startup, sme, enterprise, all
    
    # Time period
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    data_collection_date = Column(DateTime, default=datetime.utcnow)
    
    # Data quality
    confidence_level = Column(Float, default=0.0)  # 0-1 confidence in benchmark
    data_sources = Column(JSON, default=[])
    methodology = Column(Text, nullable=True)
    limitations = Column(JSON, default=[])
    
    # Status
    status = Column(String(50), default="active")  # active, archived, deprecated
    is_validated = Column(Boolean, default=False)
    validation_date = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    def __repr__(self):
        return f"<IndustryBenchmark(id={self.id}, metric='{self.metric_name}', industry='{self.industry}')>"

    def compare_value(self, value: float) -> dict:
        """Compare a value against the benchmark"""
        if value is None:
            return {"error": "Value cannot be None"}
        
        percentile = None
        performance_level = "unknown"
        
        # Determine percentile
        if self.percentile_90 and value >= self.percentile_90:
            percentile = 90
            performance_level = "excellent"
        elif self.percentile_75 and value >= self.percentile_75:
            percentile = 75
            performance_level = "good"
        elif value >= self.median_value:
            percentile = 50
            performance_level = "average"
        elif self.percentile_25 and value >= self.percentile_25:
            percentile = 25
            performance_level = "below_average"
        else:
            percentile = 10
            performance_level = "poor"
        
        # Calculate gap to median
        gap_to_median = ((value - self.median_value) / self.median_value) * 100 if self.median_value != 0 else 0
        
        return {
            "value": value,
            "percentile": percentile,
            "performance_level": performance_level,
            "gap_to_median_percent": gap_to_median,
            "median_value": self.median_value,
            "best_in_class": self.best_in_class
        }

    @property
    def is_current(self):
        """Check if benchmark is current (less than 1 year old)"""
        from datetime import timedelta
        one_year_ago = datetime.utcnow() - timedelta(days=365)
        return self.data_collection_date >= one_year_ago