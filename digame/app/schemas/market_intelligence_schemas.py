from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
import uuid

# --- Common Schemas ---
class OrmConfig(BaseModel):
    from_attributes: bool = True # Pydantic V2
    # orm_mode: bool = True # Pydantic V1

# --- MarketDataSource Schemas ---
class MarketDataSourceBase(BaseModel):
    source_name: str = Field(..., max_length=255)
    source_type: str = Field(..., max_length=100, description="e.g., api, rss, web_scraping, manual_report_upload, job_board")
    description: Optional[str] = None
    provider: Optional[str] = Field(None, max_length=255)
    endpoint_url: Optional[HttpUrl] = None
    authentication_method: Optional[str] = Field(None, max_length=100)
    headers: Optional[Dict[str, Any]] = Field(default_factory=dict)
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    data_format: str = Field(..., max_length=50, description="e.g., json, xml, csv, html, unstructured_text")
    extraction_rules: Optional[Dict[str, Any]] = Field(default_factory=dict)
    transformation_rules: Optional[Dict[str, Any]] = Field(default_factory=dict)
    update_frequency: str = Field(default="daily", max_length=50)
    reliability_score: Optional[float] = Field(default=0.0, ge=0, le=1)
    data_quality_score: Optional[float] = Field(default=0.0, ge=0, le=1)
    industries_covered: Optional[List[str]] = Field(default_factory=list)
    geographic_coverage: Optional[List[str]] = Field(default_factory=list)
    data_categories: Optional[List[str]] = Field(default_factory=list)
    is_active: bool = True
    is_automated: bool = True
    requires_approval: bool = False
    cost_per_request: Optional[Decimal] = None
    monthly_request_limit: Optional[int] = None

class MarketDataSourceCreate(MarketDataSourceBase):
    # api_key might be passed separately or handled by a secure vault system, not directly in create schema for general use.
    # For now, assuming it's not part of this generic schema.
    pass

class MarketDataSourceUpdate(BaseModel):
    source_name: Optional[str] = Field(None, max_length=255)
    source_type: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    provider: Optional[str] = Field(None, max_length=255)
    endpoint_url: Optional[HttpUrl] = None
    authentication_method: Optional[str] = Field(None, max_length=100)
    headers: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None
    data_format: Optional[str] = Field(None, max_length=50)
    extraction_rules: Optional[Dict[str, Any]] = None
    transformation_rules: Optional[Dict[str, Any]] = None
    update_frequency: Optional[str] = Field(None, max_length=50)
    reliability_score: Optional[float] = Field(None, ge=0, le=1)
    data_quality_score: Optional[float] = Field(None, ge=0, le=1)
    industries_covered: Optional[List[str]] = None
    geographic_coverage: Optional[List[str]] = None
    data_categories: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_automated: Optional[bool] = None
    requires_approval: Optional[bool] = None
    cost_per_request: Optional[Decimal] = None
    monthly_request_limit: Optional[int] = None
    # api_key typically wouldn't be updatable directly through a general update schema.

class MarketDataSourceResponse(MarketDataSourceBase):
    id: int
    source_uuid: uuid.UUID
    tenant_id: int
    # api_key should be excluded from responses for security.
    last_successful_fetch: Optional[datetime] = None
    last_fetch_attempt: Optional[datetime] = None
    consecutive_failures: int = 0
    requests_used_this_month: int = 0
    created_at: datetime
    updated_at: datetime
    created_by_user_id: int

    class Config(OrmConfig):
        pass

# --- MarketTrend Schemas ---
class MarketTrendBase(BaseModel):
    trend_name: str = Field(..., max_length=255)
    display_name: str = Field(..., max_length=255)
    description: Optional[str] = None
    industry: str = Field(..., max_length=100)
    category: str = Field(..., max_length=100, description="e.g., technology, market, consumer, regulatory")
    trend_type: str = Field(..., max_length=50, description="e.g., emerging, growing, mature, declining")
    impact_level: str = Field(..., max_length=50, description="e.g., low, medium, high, critical")
    confidence_score: float = Field(default=0.0, ge=0, le=1)
    growth_rate: Optional[float] = None
    market_size: Optional[Decimal] = None
    adoption_rate: Optional[float] = None
    maturity_stage: Optional[str] = Field(None, max_length=50)
    period_start: datetime
    period_end: datetime
    forecast_horizon: Optional[int] = Field(None, description="Days into future")
    data_sources: Optional[List[Any]] = Field(default_factory=list, description="Could be list of strings (source names) or dicts (source details/IDs)") # Flexible
    analysis_methods: Optional[List[str]] = Field(default_factory=list)
    key_indicators: Optional[Dict[str, Any]] = Field(default_factory=dict)
    supporting_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    geographic_scope: str = Field(default="global", max_length=100)
    regions: Optional[List[str]] = Field(default_factory=list)
    status: str = Field(default="active", max_length=50)
    is_validated: bool = False
    validation_notes: Optional[str] = None

class MarketTrendCreate(MarketTrendBase):
    pass

class MarketTrendUpdate(BaseModel):
    trend_name: Optional[str] = Field(None, max_length=255)
    display_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    industry: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    trend_type: Optional[str] = Field(None, max_length=50)
    impact_level: Optional[str] = Field(None, max_length=50)
    confidence_score: Optional[float] = Field(None, ge=0, le=1)
    growth_rate: Optional[float] = None
    market_size: Optional[Decimal] = None
    adoption_rate: Optional[float] = None
    maturity_stage: Optional[str] = Field(None, max_length=50)
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    forecast_horizon: Optional[int] = None
    data_sources: Optional[List[Any]] = None
    analysis_methods: Optional[List[str]] = None
    key_indicators: Optional[Dict[str, Any]] = None
    supporting_data: Optional[Dict[str, Any]] = None
    geographic_scope: Optional[str] = Field(None, max_length=100)
    regions: Optional[List[str]] = None
    status: Optional[str] = Field(None, max_length=50)
    is_validated: Optional[bool] = None
    validation_notes: Optional[str] = None
    validation_date: Optional[datetime] = None # Can be set on update

class MarketTrendResponse(MarketTrendBase):
    id: int
    trend_uuid: uuid.UUID
    tenant_id: int
    validation_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by_user_id: int
    # Calculated properties from model
    trend_strength: Optional[float] = None
    is_emerging: Optional[bool] = None
    requires_attention: Optional[bool] = None

    class Config(OrmConfig):
        pass

# --- CompetitiveAnalysis Schemas ---
class CompetitiveAnalysisBase(BaseModel):
    analysis_name: str = Field(..., max_length=255)
    description: Optional[str] = None
    industry: str = Field(..., max_length=100)
    analysis_type: str = Field(..., max_length=100, description="e.g., competitor, market_position, swot, porter_five")
    market_trend_id: Optional[int] = None
    primary_competitors: Optional[List[str]] = Field(default_factory=list) # Simplified to list of names/IDs
    secondary_competitors: Optional[List[str]] = Field(default_factory=list)
    emerging_competitors: Optional[List[str]] = Field(default_factory=list)
    market_position: Optional[str] = Field(None, max_length=50)
    market_share: Optional[float] = None
    competitive_advantage: Optional[List[str]] = Field(default_factory=list)
    competitive_threats: Optional[List[str]] = Field(default_factory=list)
    strengths: Optional[List[str]] = Field(default_factory=list)
    weaknesses: Optional[List[str]] = Field(default_factory=list)
    opportunities: Optional[List[str]] = Field(default_factory=list)
    threats: Optional[List[str]] = Field(default_factory=list)
    competitive_rivalry: Optional[float] = Field(None, ge=1, le=5)
    supplier_power: Optional[float] = Field(None, ge=1, le=5)
    buyer_power: Optional[float] = Field(None, ge=1, le=5)
    threat_of_substitution: Optional[float] = Field(None, ge=1, le=5)
    threat_of_new_entry: Optional[float] = Field(None, ge=1, le=5)
    revenue_comparison: Optional[Dict[str, Any]] = Field(default_factory=dict)
    profitability_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict)
    growth_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict)
    product_comparison: Optional[Dict[str, Any]] = Field(default_factory=dict)
    pricing_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict)
    innovation_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict)
    period_start: datetime
    period_end: datetime
    data_sources: Optional[List[str]] = Field(default_factory=list) # Simplified
    confidence_level: Optional[float] = Field(default=0.0, ge=0, le=1)
    data_completeness: Optional[float] = Field(default=0.0, ge=0, le=1)
    status: str = Field(default="draft", max_length=50)
    is_validated: bool = False

class CompetitiveAnalysisCreate(CompetitiveAnalysisBase):
    pass

class CompetitiveAnalysisUpdate(BaseModel):
    analysis_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    # industry, analysis_type, market_trend_id usually not changed after creation.
    primary_competitors: Optional[List[str]] = None
    secondary_competitors: Optional[List[str]] = None
    emerging_competitors: Optional[List[str]] = None
    market_position: Optional[str] = Field(None, max_length=50)
    market_share: Optional[float] = None
    # ... other fields similar to MarketTrendUpdate
    status: Optional[str] = Field(None, max_length=50)
    is_validated: Optional[bool] = None
    validation_date: Optional[datetime] = None

class CompetitiveAnalysisResponse(CompetitiveAnalysisBase):
    id: int
    analysis_uuid: uuid.UUID
    tenant_id: int
    analysis_date: datetime # This is default=utcnow in model, should be in response
    validation_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by_user_id: int
    # Calculated properties
    overall_competitive_intensity: Optional[float] = None
    competitive_position_strength: Optional[float] = None
    # swot_score: Optional[float] = None # Method exists in model, can be added

    class Config(OrmConfig):
        pass

# --- IntelligenceReport Schemas ---
class IntelligenceReportBase(BaseModel):
    report_name: str = Field(..., max_length=255)
    report_type: str = Field(..., max_length=100, description="e.g., market_overview, competitive_landscape, trend_analysis")
    description: Optional[str] = None
    industry: str = Field(..., max_length=100)
    market_trend_id: Optional[int] = None
    executive_summary: Optional[str] = None
    key_findings: Optional[List[str]] = Field(default_factory=list) # Simplified
    recommendations: Optional[List[str]] = Field(default_factory=list) # Simplified
    action_items: Optional[List[str]] = Field(default_factory=list) # Simplified
    market_insights: Optional[Dict[str, Any]] = Field(default_factory=dict)
    competitive_insights: Optional[Dict[str, Any]] = Field(default_factory=dict)
    trend_predictions: Optional[Dict[str, Any]] = Field(default_factory=dict)
    risk_assessment: Optional[Dict[str, Any]] = Field(default_factory=dict)
    strategic_recommendations: Optional[List[str]] = Field(default_factory=list) # Simplified
    investment_implications: Optional[List[str]] = Field(default_factory=list) # Simplified
    operational_impacts: Optional[List[str]] = Field(default_factory=list) # Simplified
    timeline_recommendations: Optional[Dict[str, Any]] = Field(default_factory=dict)
    confidence_score: float = Field(default=0.0, ge=0, le=1)
    impact_score: float = Field(default=0.0, ge=0, le=1)
    urgency_score: float = Field(default=0.0, ge=0, le=1)
    period_covered_start: datetime
    period_covered_end: datetime
    validity_period_days: int = Field(default=90, gt=0)
    data_sources: Optional[List[str]] = Field(default_factory=list) # Simplified
    analysis_methodology: Optional[Dict[str, Any]] = Field(default_factory=dict)
    limitations: Optional[List[str]] = Field(default_factory=list) # Simplified
    assumptions: Optional[List[str]] = Field(default_factory=list) # Simplified
    target_audience: Optional[List[str]] = Field(default_factory=list) # Simplified
    distribution_list: Optional[List[str]] = Field(default_factory=list) # Simplified
    access_level: str = Field(default="internal", max_length=50)
    status: str = Field(default="draft", max_length=50)
    approval_status: str = Field(default="pending", max_length=50)
    approved_by_user_id: Optional[int] = None
    approved_at: Optional[datetime] = None

class IntelligenceReportCreate(IntelligenceReportBase):
    pass

class IntelligenceReportUpdate(BaseModel):
    report_name: Optional[str] = Field(None, max_length=255)
    # ... other fields as needed for update
    status: Optional[str] = Field(None, max_length=50)
    approval_status: Optional[str] = Field(None, max_length=50)
    # Add more fields that can be updated

class IntelligenceReportResponse(IntelligenceReportBase):
    id: int
    report_uuid: uuid.UUID
    tenant_id: int
    report_date: datetime
    view_count: int
    download_count: int
    last_accessed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by_user_id: int
    # Calculated properties
    is_expired: Optional[bool] = None
    overall_priority_score: Optional[float] = None
    priority_level: Optional[str] = None

    class Config(OrmConfig):
        pass

# --- IndustryBenchmark Schemas ---
class IndustryBenchmarkBase(BaseModel):
    benchmark_name: str = Field(..., max_length=255)
    description: Optional[str] = None
    industry: str = Field(..., max_length=100)
    sub_industry: Optional[str] = Field(None, max_length=100)
    metric_name: str = Field(..., max_length=255)
    metric_type: str = Field(..., max_length=100, description="e.g., financial, operational, market, customer")
    measurement_unit: str = Field(..., max_length=50)
    calculation_method: Optional[str] = None
    median_value: float
    mean_value: Optional[float] = None
    percentile_25: Optional[float] = None
    percentile_75: Optional[float] = None
    percentile_90: Optional[float] = None
    best_in_class: Optional[float] = None
    sample_size: int = Field(..., gt=0)
    sample_description: Optional[str] = None
    geographic_scope: str = Field(default="global", max_length=100)
    company_size_range: Optional[str] = Field(None, max_length=100)
    period_start: datetime
    period_end: datetime
    confidence_level: Optional[float] = Field(default=0.0, ge=0, le=1)
    data_sources: Optional[List[str]] = Field(default_factory=list) # Simplified
    methodology: Optional[str] = None
    limitations: Optional[List[str]] = Field(default_factory=list) # Simplified
    status: str = Field(default="active", max_length=50)
    is_validated: bool = False

class IndustryBenchmarkCreate(IndustryBenchmarkBase):
    pass

class IndustryBenchmarkUpdate(BaseModel):
    benchmark_name: Optional[str] = Field(None, max_length=255)
    # ... other fields
    status: Optional[str] = Field(None, max_length=50)
    is_validated: Optional[bool] = None
    validation_date: Optional[datetime] = None

class IndustryBenchmarkResponse(IndustryBenchmarkBase):
    id: int
    benchmark_uuid: uuid.UUID
    tenant_id: int
    data_collection_date: datetime
    validation_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by_user_id: int
    # Calculated property
    is_current: Optional[bool] = None

    class Config(OrmConfig):
        pass

# --- SkillDemandForecast Schemas (New) ---
class SkillDemandEvidence(BaseModel):
    source_type: str # e.g., "job_posting_trend", "industry_report_trend"
    description: str # e.g., "Increased mention in X job postings over last 3 months", "Gartner report projects 20% growth"
    reference_id: Optional[str] = None # e.g., MarketTrend.id or a job source identifier
    score_contribution: Optional[float] = None # How much this evidence contributed to the overall score

class SkillDemandForecastResponse(BaseModel):
    skill_keywords_analyzed: List[str]
    demand_score: float = Field(..., ge=0, le=1, description="Overall demand score from 0 (low) to 1 (high)")
    demand_trend: str = Field(..., description="e.g., increasing, stable, decreasing, emerging_high, emerging_low")
    confidence: float = Field(..., ge=0, le=1, description="Confidence in the forecast")
    analysis_summary: str = Field(..., description="Brief summary of the findings.")
    evidence: List[SkillDemandEvidence] = Field(default_factory=list)
    forecast_date: datetime = Field(default_factory=datetime.utcnow)
    # Potential future fields:
    # projected_salary_range: Optional[str]
    # related_skills: List[str]
    # top_industries_demanding: List[str]

    class Config(OrmConfig): # Not strictly needed if not from ORM, but good practice
        pass
