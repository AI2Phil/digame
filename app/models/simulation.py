"""
Simulation and Decision Support models for scenario planning and strategic analysis
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
from typing import Optional, Dict, Any, List
from datetime import datetime
import enum


class SimulationType(enum.Enum):
    """Types of simulations"""
    SCENARIO_PLANNING = "scenario_planning"
    DECISION_IMPACT = "decision_impact"
    RISK_ASSESSMENT = "risk_assessment"
    STRATEGIC_PLANNING = "strategic_planning"
    RESOURCE_OPTIMIZATION = "resource_optimization"
    PERFORMANCE_FORECASTING = "performance_forecasting"


class SimulationStatus(enum.Enum):
    """Simulation execution status"""
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class RiskLevel(enum.Enum):
    """Risk assessment levels"""
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"
    CRITICAL = "critical"


class DecisionImpactLevel(enum.Enum):
    """Decision impact levels"""
    MINIMAL = "minimal"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class Simulation(Base):
    """
    Core simulation model for scenario planning and decision support
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "simulations"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Simulation metadata
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    simulation_type = Column(String(50), nullable=False, index=True)
    status = Column(String(20), default="draft", index=True)
    
    # Simulation configuration
    base_scenario = Column(JSON, nullable=False)  # Current state/baseline
    simulation_parameters = Column(JSON, default={})  # Simulation settings
    variables = Column(JSON, default=[])  # Variables to simulate
    constraints = Column(JSON, default=[])  # Constraints and limitations
    
    # Execution tracking
    execution_start_time = Column(DateTime(timezone=True))
    execution_end_time = Column(DateTime(timezone=True))
    execution_duration = Column(Float)  # Duration in seconds
    
    # Results and analysis
    results = Column(JSON, default={})  # Simulation results
    insights = Column(JSON, default=[])  # Generated insights
    recommendations = Column(JSON, default=[])  # Recommended actions
    confidence_score = Column(Float, default=0.0)  # Result confidence (0-1)
    
    # Metadata
    tags = Column(JSON, default=[])
    is_template = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    # tenant = relationship("Tenant")  # Temporarily disabled due to registry conflicts
    creator = relationship("app.models.user.User")
    scenarios = relationship("Scenario", back_populates="simulation", cascade="all, delete-orphan")
    decisions = relationship("DecisionAnalysis", back_populates="simulation", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="simulation", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Simulation(id={self.id}, name='{self.name}', type='{self.simulation_type}')>"


class Scenario(Base):
    """
    Individual scenarios within a simulation
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "scenarios"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    simulation_id = Column(Integer, ForeignKey("simulations.id"), nullable=False, index=True)
    
    # Scenario metadata
    name = Column(String(200), nullable=False)
    description = Column(Text)
    scenario_type = Column(String(50), default="alternative")  # baseline, optimistic, pessimistic, alternative
    
    # Scenario configuration
    parameters = Column(JSON, nullable=False)  # Scenario-specific parameters
    assumptions = Column(JSON, default=[])  # Key assumptions
    variables = Column(JSON, default={})  # Variable values for this scenario
    
    # Results
    outcomes = Column(JSON, default={})  # Predicted outcomes
    metrics = Column(JSON, default={})  # Key performance metrics
    probability = Column(Float, default=0.0)  # Likelihood of this scenario (0-1)
    
    # Analysis
    strengths = Column(JSON, default=[])  # Scenario strengths
    weaknesses = Column(JSON, default=[])  # Scenario weaknesses
    opportunities = Column(JSON, default=[])  # Opportunities identified
    threats = Column(JSON, default=[])  # Threats identified
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    simulation = relationship("Simulation", back_populates="scenarios")
    
    def __repr__(self):
        return f"<Scenario(id={self.id}, name='{self.name}', type='{self.scenario_type}')>"


class DecisionAnalysis(Base):
    """
    Decision impact analysis and recommendation engine
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "decision_analyses"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    simulation_id = Column(Integer, ForeignKey("simulations.id"), nullable=False, index=True)
    
    # Decision metadata
    decision_name = Column(String(200), nullable=False)
    decision_description = Column(Text)
    decision_category = Column(String(100))  # strategic, operational, tactical, financial
    
    # Decision options
    options = Column(JSON, nullable=False)  # Available decision options
    criteria = Column(JSON, default=[])  # Decision criteria and weights
    
    # Impact analysis
    impact_assessment = Column(JSON, default={})  # Impact on various dimensions
    impact_level = Column(String(20), default="moderate")  # Overall impact level
    affected_areas = Column(JSON, default=[])  # Areas affected by decision
    
    # Risk and opportunity analysis
    risks = Column(JSON, default=[])  # Associated risks
    opportunities = Column(JSON, default=[])  # Associated opportunities
    mitigation_strategies = Column(JSON, default=[])  # Risk mitigation approaches
    
    # Recommendations
    recommended_option = Column(String(200))  # Recommended decision option
    recommendation_rationale = Column(Text)  # Reasoning for recommendation
    implementation_plan = Column(JSON, default={})  # Implementation steps
    success_metrics = Column(JSON, default=[])  # Metrics to track success
    
    # Analysis metadata
    confidence_score = Column(Float, default=0.0)  # Confidence in analysis (0-1)
    urgency_level = Column(String(20), default="medium")  # Decision urgency
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    simulation = relationship("Simulation", back_populates="decisions")
    
    def __repr__(self):
        return f"<DecisionAnalysis(id={self.id}, decision='{self.decision_name}')>"


class RiskAssessment(Base):
    """
    Risk assessment and management for simulations and decisions
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "risk_assessments"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    simulation_id = Column(Integer, ForeignKey("simulations.id"), nullable=False, index=True)
    
    # Risk metadata
    risk_name = Column(String(200), nullable=False)
    risk_description = Column(Text)
    risk_category = Column(String(100))  # operational, financial, strategic, compliance, technical
    
    # Risk analysis
    probability = Column(Float, default=0.0)  # Likelihood of risk occurring (0-1)
    impact_score = Column(Float, default=0.0)  # Impact severity (0-1)
    risk_level = Column(String(20), default="medium")  # Overall risk level
    
    # Risk details
    triggers = Column(JSON, default=[])  # Risk triggers and indicators
    consequences = Column(JSON, default=[])  # Potential consequences
    affected_objectives = Column(JSON, default=[])  # Objectives at risk
    
    # Risk management
    mitigation_strategies = Column(JSON, default=[])  # Risk mitigation approaches
    contingency_plans = Column(JSON, default=[])  # Contingency planning
    monitoring_indicators = Column(JSON, default=[])  # Early warning indicators
    
    # Risk ownership
    risk_owner = Column(String(200))  # Person/role responsible for risk
    review_frequency = Column(String(50), default="monthly")  # Review schedule
    
    # Status tracking
    current_status = Column(String(50), default="identified")  # identified, assessed, mitigated, closed
    last_review_date = Column(DateTime(timezone=True))
    next_review_date = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    simulation = relationship("Simulation", back_populates="risk_assessments")
    
    def __repr__(self):
        return f"<RiskAssessment(id={self.id}, risk='{self.risk_name}', level='{self.risk_level}')>"


class StrategicPlan(Base):
    """
    Strategic planning and goal management
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "strategic_plans"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Plan metadata
    plan_name = Column(String(200), nullable=False)
    plan_description = Column(Text)
    plan_type = Column(String(50), default="strategic")  # strategic, operational, tactical
    
    # Planning horizon
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    planning_horizon_months = Column(Integer, default=12)
    
    # Strategic elements
    vision = Column(Text)  # Vision statement
    mission = Column(Text)  # Mission statement
    objectives = Column(JSON, default=[])  # Strategic objectives
    key_results = Column(JSON, default=[])  # Key results and KPIs
    
    # Analysis
    swot_analysis = Column(JSON, default={})  # SWOT analysis results
    competitive_analysis = Column(JSON, default={})  # Competitive landscape
    market_analysis = Column(JSON, default={})  # Market conditions
    
    # Implementation
    initiatives = Column(JSON, default=[])  # Strategic initiatives
    resource_requirements = Column(JSON, default={})  # Required resources
    timeline = Column(JSON, default={})  # Implementation timeline
    budget = Column(JSON, default={})  # Budget allocation
    
    # Monitoring
    success_metrics = Column(JSON, default=[])  # Success measurement criteria
    review_schedule = Column(JSON, default={})  # Review and update schedule
    
    # Status
    status = Column(String(20), default="draft")  # draft, active, completed, cancelled
    progress_percentage = Column(Float, default=0.0)  # Overall progress (0-100)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    # tenant = relationship("Tenant")  # Temporarily disabled due to registry conflicts
    creator = relationship("app.models.user.User")
    
    def __repr__(self):
        return f"<StrategicPlan(id={self.id}, name='{self.plan_name}', status='{self.status}')>"


class SimulationTemplate(Base):
    """
    Reusable simulation templates for common scenarios
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "simulation_templates"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Template metadata
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(100))  # business_planning, risk_management, resource_optimization
    simulation_type = Column(String(50), nullable=False)
    
    # Template configuration
    template_config = Column(JSON, nullable=False)  # Template structure
    default_parameters = Column(JSON, default={})  # Default parameter values
    variable_definitions = Column(JSON, default=[])  # Variable definitions
    
    # Usage tracking
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    avg_execution_time = Column(Float, default=0.0)
    
    # Template settings
    is_public = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    complexity_level = Column(String(20), default="medium")  # simple, medium, complex
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    # tenant = relationship("Tenant")  # Temporarily disabled due to registry conflicts
    creator = relationship("app.models.user.User")
    
    def __repr__(self):
        return f"<SimulationTemplate(id={self.id}, name='{self.name}', type='{self.simulation_type}')>"