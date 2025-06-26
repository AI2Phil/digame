"""
Pydantic schemas for Career Path Modeling and Salary Progression Forecasting
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from enum import Enum


class ExperienceLevel(str, Enum):
    """Experience level categories"""
    ENTRY_LEVEL = "entry_level"
    MID_LEVEL = "mid_level"
    SENIOR_LEVEL = "senior_level"
    EXECUTIVE_LEVEL = "executive_level"


class TrendDirection(str, Enum):
    """Industry trend directions"""
    GROWING = "growing"
    STABLE = "stable"
    DECLINING = "declining"


class CareerOutlook(str, Enum):
    """Career outlook categories"""
    VERY_POSITIVE = "very_positive"
    POSITIVE = "positive"
    STABLE = "stable"
    CAUTIOUS = "cautious"
    CHALLENGING = "challenging"


class SalaryProgressionRequest(BaseModel):
    """Request schema for salary progression forecasting"""
    current_role: str = Field(..., description="Current job role/title")
    current_salary: float = Field(..., description="Current annual salary")
    years_experience: int = Field(..., description="Years of professional experience")
    industry: str = Field(..., description="Industry sector")
    location: str = Field(..., description="Geographic location")
    skills: List[str] = Field(default=[], description="List of professional skills")
    target_roles: Optional[List[str]] = Field(default=None, description="Target roles for career transition")
    forecast_years: int = Field(default=5, description="Number of years to forecast")

    @validator('skills')
    def validate_skills(cls, v):
        if len(v) > 20:
            raise ValueError('Maximum 20 skills allowed')
        return v


class YearlyProgression(BaseModel):
    """Yearly salary progression data"""
    year: int
    years_experience: int
    salary: float
    growth_rate: float
    experience_level: ExperienceLevel
    skill_premium_applied: Optional[float] = None
    industry_adjustment: Optional[float] = None
    industry_growth_applied: Optional[float] = None


class ConfidenceInterval(BaseModel):
    """Confidence interval for salary projection"""
    lower_bound: float
    upper_bound: float
    confidence_level: float


class SalaryBenchmarks(BaseModel):
    """Salary benchmark data"""
    base_salary_estimate: float
    market_percentiles: Dict[str, float]
    location_adjustment: float
    industry_adjustment: float
    experience_adjustment: float
    data_sources: List[Dict[str, Any]]
    confidence_score: float


class SkillAnalysis(BaseModel):
    """Individual skill market analysis"""
    demand_score: float
    demand_trend: str
    salary_premium_percent: float
    market_confidence: float
    growth_potential: str


class SkillMarketValue(BaseModel):
    """Overall skill portfolio analysis"""
    individual_skills: Dict[str, SkillAnalysis]
    total_skill_premium_percent: float
    high_demand_skills: List[str]
    skill_portfolio_strength: str
    recommendations: List[str]


class IndustryTrends(BaseModel):
    """Industry growth trends analysis"""
    growth_rate: float
    trend_direction: TrendDirection
    confidence: float
    salary_impact_factors: List[Dict[str, Any]]
    key_trends: List[Dict[str, Any]]


class CareerScenario(BaseModel):
    """Career path scenario"""
    scenario_name: str
    description: str
    probability: float
    salary_progression: List[Dict[str, Any]]
    required_actions: List[str]


class ForecastSummary(BaseModel):
    """Summary of salary progression forecast"""
    current_salary: float
    projected_salary_5_years: float
    total_growth_percent: float
    average_annual_growth: float
    confidence_level: float


class MarketInsight(BaseModel):
    """Market insight for career planning"""
    type: str
    title: str
    description: str
    impact: str
    timeframe: str


class SalaryProgressionResponse(BaseModel):
    """Complete salary progression forecast response"""
    forecast_summary: ForecastSummary
    yearly_progression: List[YearlyProgression]
    confidence_intervals: Dict[str, ConfidenceInterval]
    salary_benchmarks: SalaryBenchmarks
    skill_market_analysis: SkillMarketValue
    industry_trends_impact: IndustryTrends
    career_path_scenarios: List[CareerScenario]
    recommendations: List[str]
    market_insights: List[MarketInsight]
    generated_at: str


class IndustryTrendsRequest(BaseModel):
    """Request schema for real-time industry trends"""
    industry: str = Field(..., description="Industry sector")
    refresh_data: bool = Field(default=False, description="Whether to refresh data from external sources")


class TrendImpact(BaseModel):
    """Trend impact on career"""
    trend_name: str
    impact_description: str
    confidence: float
    timeline: Optional[str] = None


class CareerImpactAnalysis(BaseModel):
    """Analysis of how trends impact careers"""
    positive_impacts: List[TrendImpact]
    negative_impacts: List[TrendImpact]
    neutral_impacts: List[TrendImpact]
    overall_career_outlook: CareerOutlook


class SalaryTrendIndicators(BaseModel):
    """Salary trend indicators"""
    overall_trend: str
    annual_growth_rate: float
    regional_variations: Dict[str, List[str]]
    role_specific_trends: Dict[str, Dict[str, Union[str, float]]]


class SkillDemandChange(BaseModel):
    """Skill demand change data"""
    skill: str
    growth_rate: Optional[float] = None
    decline_rate: Optional[float] = None
    change_rate: Optional[float] = None


class SkillDemandChanges(BaseModel):
    """Recent changes in skill demand"""
    trending_up: List[SkillDemandChange]
    trending_down: List[SkillDemandChange]
    stable: List[SkillDemandChange]


class JobMarketIndicators(BaseModel):
    """Job market indicators"""
    job_openings_trend: str
    competition_level: str
    time_to_hire: str
    remote_work_availability: float
    salary_negotiation_success_rate: float
    market_indicators: Dict[str, float]


class IndustryInsight(BaseModel):
    """Industry insight"""
    type: str
    title: str
    description: str
    priority: str


class TrendSummary(BaseModel):
    """Summary of industry trends"""
    total_trends: int
    emerging_trends: int
    high_impact_trends: int


class IndustryTrendsResponse(BaseModel):
    """Real-time industry trends response"""
    industry: str
    last_updated: str
    trend_summary: TrendSummary
    career_impact_analysis: CareerImpactAnalysis
    salary_trends: SalaryTrendIndicators
    skill_demand_changes: SkillDemandChanges
    job_market_indicators: JobMarketIndicators
    key_insights: List[IndustryInsight]
    recommendations: List[str]


# Error response schemas
class CareerPathError(BaseModel):
    """Error response for career path operations"""
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None


class ValidationError(BaseModel):
    """Validation error response"""
    error: str = "validation_error"
    message: str
    field_errors: List[Dict[str, str]]