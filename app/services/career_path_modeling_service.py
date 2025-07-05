"""
Advanced Career Path Modeling service for salary progression forecasting and career planning
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from decimal import Decimal
import statistics
import json

from ..models.market_intelligence import MarketTrend, IndustryBenchmark, MarketDataSource
from ..models.user import User
from ..models.tenant import Tenant
from ..services.market_intelligence_service import MarketIntelligenceService


class CareerPathModelingService:
    """Service for advanced career path modeling and salary progression forecasting"""
    
    def __init__(self, db: Session):
        self.db = db
        self.market_intelligence_service = MarketIntelligenceService(db)
    
    # Salary Progression Forecasting
    
    def forecast_salary_progression(
        self,
        tenant_id: int,
        current_role: str,
        current_salary: float,
        years_experience: int,
        industry: str,
        location: str,
        skills: List[str],
        target_roles: Optional[List[str]] = None,
        forecast_years: int = 5
    ) -> Dict[str, Any]:
        """
        Generate comprehensive salary progression forecast based on market data,
        industry trends, and career path analysis
        """
        
        # Get market data for salary benchmarking
        salary_benchmarks = self._get_salary_benchmarks(
            role=current_role,
            industry=industry,
            location=location,
            years_experience=years_experience
        )
        
        # Analyze skill market value
        skill_market_value = self._analyze_skill_market_value(
            skills=skills,
            industry=industry,
            tenant_id=tenant_id
        )
        
        # Get industry growth trends
        industry_trends = self._get_industry_growth_trends(
            industry=industry,
            tenant_id=tenant_id
        )
        
        # Calculate base progression model
        base_progression = self._calculate_base_salary_progression(
            current_salary=current_salary,
            years_experience=years_experience,
            industry=industry,
            location=location,
            forecast_years=forecast_years
        )
        
        # Apply skill premium adjustments
        skill_adjusted_progression = self._apply_skill_adjustments(
            base_progression=base_progression,
            skill_market_value=skill_market_value,
            forecast_years=forecast_years
        )
        
        # Apply industry trend adjustments
        trend_adjusted_progression = self._apply_industry_trend_adjustments(
            progression=skill_adjusted_progression,
            industry_trends=industry_trends,
            forecast_years=forecast_years
        )
        
        # Generate career path scenarios
        career_scenarios = self._generate_career_path_scenarios(
            current_role=current_role,
            target_roles=target_roles or [],
            current_salary=current_salary,
            industry=industry,
            location=location,
            skills=skills,
            forecast_years=forecast_years
        )
        
        # Calculate confidence intervals
        confidence_intervals = self._calculate_confidence_intervals(
            progression=trend_adjusted_progression,
            market_volatility=self._estimate_market_volatility(industry),
            forecast_years=forecast_years
        )
        
        return {
            "forecast_summary": {
                "current_salary": current_salary,
                "projected_salary_5_years": trend_adjusted_progression[-1]["salary"],
                "total_growth_percent": ((trend_adjusted_progression[-1]["salary"] - current_salary) / current_salary) * 100,
                "average_annual_growth": self._calculate_average_annual_growth(trend_adjusted_progression),
                "confidence_level": self._calculate_overall_confidence(salary_benchmarks, skill_market_value, industry_trends)
            },
            "yearly_progression": trend_adjusted_progression,
            "confidence_intervals": confidence_intervals,
            "salary_benchmarks": salary_benchmarks,
            "skill_market_analysis": skill_market_value,
            "industry_trends_impact": industry_trends,
            "career_path_scenarios": career_scenarios,
            "recommendations": self._generate_salary_recommendations(
                current_salary=current_salary,
                progression=trend_adjusted_progression,
                skill_analysis=skill_market_value,
                industry_trends=industry_trends
            ),
            "market_insights": self._generate_market_insights(
                industry=industry,
                location=location,
                skills=skills,
                tenant_id=tenant_id
            ),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    
    def _get_salary_benchmarks(
        self,
        role: str,
        industry: str,
        location: str,
        years_experience: int
    ) -> Dict[str, Any]:
        """Get salary benchmarks from industry data and job market APIs"""
        
        # Query industry benchmarks
        benchmarks = self.db.query(IndustryBenchmark).filter(
            IndustryBenchmark.industry == industry,
            IndustryBenchmark.metric_type == "financial",
            IndustryBenchmark.metric_name.like(f"%salary%"),
            IndustryBenchmark.status == "active"
        ).all()
        
        # Simulate job market data (in real implementation, use job board APIs)
        market_data = self._fetch_market_salary_data(role, industry, location)
        
        # Calculate experience-adjusted benchmarks
        experience_multiplier = self._calculate_experience_multiplier(years_experience)
        
        base_salary_ranges = {
            "entry_level": 50000,
            "mid_level": 75000,
            "senior_level": 100000,
            "executive_level": 150000
        }
        
        experience_level = self._determine_experience_level(years_experience)
        base_salary = base_salary_ranges.get(experience_level, 75000)
        
        # Apply location adjustment
        location_multiplier = self._get_location_salary_multiplier(location)
        
        # Apply industry adjustment
        industry_multiplier = self._get_industry_salary_multiplier(industry)
        
        adjusted_base = base_salary * location_multiplier * industry_multiplier * experience_multiplier
        
        return {
            "base_salary_estimate": adjusted_base,
            "market_percentiles": {
                "p25": adjusted_base * 0.85,
                "p50": adjusted_base,
                "p75": adjusted_base * 1.25,
                "p90": adjusted_base * 1.5
            },
            "location_adjustment": location_multiplier,
            "industry_adjustment": industry_multiplier,
            "experience_adjustment": experience_multiplier,
            "data_sources": [
                {"source": "industry_benchmarks", "count": len(benchmarks)},
                {"source": "job_market_data", "count": len(market_data)}
            ],
            "confidence_score": 0.8 if benchmarks and market_data else 0.6
        }
    
    def _analyze_skill_market_value(
        self,
        skills: List[str],
        industry: str,
        tenant_id: int
    ) -> Dict[str, Any]:
        """Analyze market value and demand for specific skills"""
        
        skill_analysis = {}
        total_premium = 0.0
        high_demand_skills = []
        
        for skill in skills:
            # Use market intelligence service for skill demand forecasting
            try:
                if hasattr(self.market_intelligence_service, 'forecast_skill_demand'):
                    forecast_method = getattr(self.market_intelligence_service, 'forecast_skill_demand')
                    if callable(forecast_method):
                        demand_forecast = forecast_method(
                            skill_keywords=[skill],
                            tenant_id=tenant_id,
                            time_horizon_months=12
                        )
                    else:
                        demand_forecast = None
                else:
                    demand_forecast = None
                
                # Calculate skill premium based on demand
                demand_score = getattr(demand_forecast, 'demand_score', 0.5)
                skill_premium = self._calculate_skill_premium(demand_score, skill, industry)
                
                skill_analysis[skill] = {
                    "demand_score": demand_score,
                    "demand_trend": getattr(demand_forecast, 'demand_trend', 'stable'),
                    "salary_premium_percent": skill_premium,
                    "market_confidence": getattr(demand_forecast, 'confidence', 0.5),
                    "growth_potential": self._assess_skill_growth_potential(demand_forecast)
                }
                
                total_premium += skill_premium
                
                if demand_score > 0.7:
                    high_demand_skills.append(skill)
                    
            except Exception as e:
                # Fallback to basic skill analysis
                skill_analysis[skill] = {
                    "demand_score": 0.5,
                    "demand_trend": "stable",
                    "salary_premium_percent": 2.0,
                    "market_confidence": 0.5,
                    "growth_potential": "moderate"
                }
                total_premium += 2.0
        
        return {
            "individual_skills": skill_analysis,
            "total_skill_premium_percent": min(total_premium, 25.0),  # Cap at 25%
            "high_demand_skills": high_demand_skills,
            "skill_portfolio_strength": self._assess_skill_portfolio_strength(skill_analysis),
            "recommendations": self._generate_skill_recommendations(skill_analysis, industry)
        }
    
    def _get_industry_growth_trends(
        self,
        industry: str,
        tenant_id: int
    ) -> Dict[str, Any]:
        """Get industry growth trends and their impact on salary progression"""
        
        # Query market trends for the industry
        trends = self.db.query(MarketTrend).filter(
            MarketTrend.industry == industry,
            MarketTrend.status == "active",
            MarketTrend.period_end >= datetime.now(timezone.utc) - timedelta(days=365)
        ).order_by(desc(MarketTrend.confidence_score)).all()
        
        if not trends:
            return {
                "growth_rate": 3.0,  # Default 3% annual growth
                "trend_direction": "stable",
                "confidence": 0.5,
                "factors": ["Limited industry data available"]
            }
        
        # Analyze trends for salary impact
        growth_indicators = []
        salary_impact_factors = []
        
        for trend in trends:
            growth_rate = getattr(trend, 'growth_rate', None)
            if growth_rate is not None:
                try:
                    growth_indicators.append(float(growth_rate))
                except (ValueError, TypeError):
                    pass
            
            # Analyze trend impact on salaries
            trend_type = getattr(trend, 'trend_type', 'stable')
            impact_level = getattr(trend, 'impact_level', 'medium')
            trend_name = getattr(trend, 'trend_name', 'Unknown trend')
            
            if trend_type == "emerging" and impact_level in ["high", "critical"]:
                salary_impact_factors.append({
                    "factor": trend_name,
                    "impact": "positive",
                    "magnitude": 5.0 if impact_level == "critical" else 3.0
                })
            elif trend_type == "declining":
                salary_impact_factors.append({
                    "factor": trend_name,
                    "impact": "negative",
                    "magnitude": -2.0
                })
        
        # Calculate overall industry growth rate
        if growth_indicators:
            avg_growth = statistics.mean(growth_indicators)
            valid_trends = [trend for trend in trends if getattr(trend, 'growth_rate', None) is not None]
            if valid_trends:
                numerator = sum(
                    float(getattr(trend, 'growth_rate', 0)) * float(getattr(trend, 'confidence_score', 0.5))
                    for trend in valid_trends
                )
                denominator = sum(float(getattr(trend, 'confidence_score', 0.5)) for trend in valid_trends)
                weighted_growth = numerator / denominator if denominator > 0 else 3.0
            else:
                weighted_growth = 3.0
        else:
            avg_growth = weighted_growth = 3.0
        
        # Determine trend direction
        positive_trends = len([t for t in trends if getattr(t, 'trend_type', 'stable') in ["emerging", "growing"]])
        negative_trends = len([t for t in trends if getattr(t, 'trend_type', 'stable') == "declining"])
        
        if positive_trends > negative_trends * 2:
            trend_direction = "growing"
        elif negative_trends > positive_trends:
            trend_direction = "declining"
        else:
            trend_direction = "stable"
        
        return {
            "growth_rate": weighted_growth,
            "trend_direction": trend_direction,
            "confidence": statistics.mean([float(getattr(t, 'confidence_score', 0.5)) for t in trends]) if trends else 0.5,
            "salary_impact_factors": salary_impact_factors,
            "key_trends": [
                {
                    "name": getattr(trend, 'trend_name', 'Unknown'),
                    "type": getattr(trend, 'trend_type', 'stable'),
                    "impact_level": getattr(trend, 'impact_level', 'medium'),
                    "confidence": float(getattr(trend, 'confidence_score', 0.5))
                }
                for trend in trends[:5]  # Top 5 trends
            ]
        }
    
    def _calculate_base_salary_progression(
        self,
        current_salary: float,
        years_experience: int,
        industry: str,
        location: str,
        forecast_years: int
    ) -> List[Dict[str, Any]]:
        """Calculate base salary progression without adjustments"""
        
        progression = []
        
        # Base annual growth rates by experience level
        experience_growth_rates = {
            "entry_level": 0.08,    # 8% for early career
            "mid_level": 0.05,      # 5% for mid-career
            "senior_level": 0.03,   # 3% for senior level
            "executive_level": 0.02 # 2% for executive level
        }
        
        current_experience_level = self._determine_experience_level(years_experience)
        
        for year in range(forecast_years + 1):
            if year == 0:
                # Current year
                progression.append({
                    "year": datetime.now(timezone.utc).year,
                    "years_experience": years_experience,
                    "salary": current_salary,
                    "growth_rate": 0.0,
                    "experience_level": current_experience_level
                })
            else:
                prev_year = progression[year - 1]
                new_experience = prev_year["years_experience"] + 1
                new_experience_level = self._determine_experience_level(new_experience)
                
                # Adjust growth rate based on experience progression
                base_growth_rate = experience_growth_rates.get(new_experience_level, 0.03)
                
                # Add inflation adjustment
                inflation_rate = 0.025  # 2.5% average inflation
                total_growth_rate = base_growth_rate + inflation_rate
                
                new_salary = prev_year["salary"] * (1 + total_growth_rate)
                
                progression.append({
                    "year": datetime.now(timezone.utc).year + year,
                    "years_experience": new_experience,
                    "salary": round(new_salary, 2),
                    "growth_rate": total_growth_rate,
                    "experience_level": new_experience_level
                })
        
        return progression
    
    def _apply_skill_adjustments(
        self,
        base_progression: List[Dict[str, Any]],
        skill_market_value: Dict[str, Any],
        forecast_years: int
    ) -> List[Dict[str, Any]]:
        """Apply skill-based salary adjustments to base progression"""
        
        adjusted_progression = []
        skill_premium_percent = skill_market_value["total_skill_premium_percent"]
        
        for i, year_data in enumerate(base_progression):
            if i == 0:
                # Current year - no skill adjustment yet
                adjusted_progression.append(year_data.copy())
            else:
                # Apply gradual skill premium over time
                years_elapsed = i
                skill_factor = min(1.0, years_elapsed / 3.0)  # Full premium after 3 years
                current_premium = skill_premium_percent * skill_factor / 100
                
                adjusted_salary = year_data["salary"] * (1 + current_premium)
                
                adjusted_year = year_data.copy()
                adjusted_year["salary"] = round(adjusted_salary, 2)
                adjusted_year["skill_premium_applied"] = current_premium * 100
                
                adjusted_progression.append(adjusted_year)
        
        return adjusted_progression
    
    def _apply_industry_trend_adjustments(
        self,
        progression: List[Dict[str, Any]],
        industry_trends: Dict[str, Any],
        forecast_years: int
    ) -> List[Dict[str, Any]]:
        """Apply industry trend adjustments to salary progression"""
        
        adjusted_progression = []
        industry_growth_rate = industry_trends["growth_rate"] / 100  # Convert to decimal
        trend_direction = industry_trends["trend_direction"]
        
        # Adjust growth rate based on trend direction
        trend_multipliers = {
            "growing": 1.2,
            "stable": 1.0,
            "declining": 0.8
        }
        
        trend_multiplier = trend_multipliers.get(trend_direction, 1.0)
        adjusted_industry_rate = industry_growth_rate * trend_multiplier
        
        for i, year_data in enumerate(progression):
            if i == 0:
                # Current year
                adjusted_progression.append(year_data.copy())
            else:
                # Apply industry trend adjustment
                base_salary = year_data["salary"]
                industry_adjustment = base_salary * adjusted_industry_rate * (i / forecast_years)
                
                adjusted_salary = base_salary + industry_adjustment
                
                adjusted_year = year_data.copy()
                adjusted_year["salary"] = round(adjusted_salary, 2)
                adjusted_year["industry_adjustment"] = round(industry_adjustment, 2)
                adjusted_year["industry_growth_applied"] = adjusted_industry_rate * 100
                
                adjusted_progression.append(adjusted_year)
        
        return adjusted_progression
    
    def _generate_career_path_scenarios(
        self,
        current_role: str,
        target_roles: List[str],
        current_salary: float,
        industry: str,
        location: str,
        skills: List[str],
        forecast_years: int
    ) -> List[Dict[str, Any]]:
        """Generate different career path scenarios with salary projections"""
        
        scenarios = []
        
        # Scenario 1: Current path (no role change)
        current_path_scenario = {
            "scenario_name": "Current Path",
            "description": f"Continue in {current_role} role with skill development",
            "probability": 0.7,
            "salary_progression": self._project_role_salary_progression(
                role=current_role,
                current_salary=current_salary,
                industry=industry,
                location=location,
                forecast_years=forecast_years
            ),
            "required_actions": [
                "Continue skill development in current domain",
                "Seek performance-based raises",
                "Consider lateral moves for experience"
            ]
        }
        scenarios.append(current_path_scenario)
        
        # Scenario 2: Promotion path
        promotion_role = self._get_promotion_role(current_role)
        if promotion_role:
            promotion_scenario = {
                "scenario_name": "Promotion Path",
                "description": f"Promotion to {promotion_role} within 2-3 years",
                "probability": 0.4,
                "salary_progression": self._project_promotion_salary_progression(
                    current_role=current_role,
                    target_role=promotion_role,
                    current_salary=current_salary,
                    industry=industry,
                    location=location,
                    forecast_years=forecast_years
                ),
                "required_actions": [
                    "Develop leadership and management skills",
                    "Take on high-visibility projects",
                    "Build internal network and mentorship"
                ]
            }
            scenarios.append(promotion_scenario)
        
        # Scenario 3: Career transition scenarios
        for target_role in target_roles:
            transition_scenario = {
                "scenario_name": f"Transition to {target_role}",
                "description": f"Career transition from {current_role} to {target_role}",
                "probability": 0.3,
                "salary_progression": self._project_transition_salary_progression(
                    current_role=current_role,
                    target_role=target_role,
                    current_salary=current_salary,
                    industry=industry,
                    location=location,
                    skills=skills,
                    forecast_years=forecast_years
                ),
                "required_actions": self._get_transition_requirements(current_role, target_role)
            }
            scenarios.append(transition_scenario)
        
        return scenarios
    
    def _calculate_confidence_intervals(
        self,
        progression: List[Dict[str, Any]],
        market_volatility: float,
        forecast_years: int
    ) -> Dict[str, Any]:
        """Calculate confidence intervals for salary projections"""
        
        confidence_intervals = {}
        
        for i, year_data in enumerate(progression):
            if i == 0:
                # Current year has 100% confidence
                confidence_intervals[year_data["year"]] = {
                    "lower_bound": year_data["salary"],
                    "upper_bound": year_data["salary"],
                    "confidence_level": 1.0
                }
            else:
                # Confidence decreases over time
                years_out = i
                confidence_decay = 0.9 ** years_out  # 10% confidence decay per year
                
                # Volatility increases uncertainty
                volatility_factor = market_volatility * years_out * 0.1
                
                salary = year_data["salary"]
                uncertainty_range = salary * volatility_factor
                
                confidence_intervals[year_data["year"]] = {
                    "lower_bound": round(salary - uncertainty_range, 2),
                    "upper_bound": round(salary + uncertainty_range, 2),
                    "confidence_level": round(confidence_decay, 2)
                }
        
        return confidence_intervals
    
    # Real-time Industry Trend Integration
    
    def get_real_time_industry_trends(
        self,
        industry: str,
        tenant_id: int,
        refresh_data: bool = False
    ) -> Dict[str, Any]:
        """Get real-time industry trends affecting career paths and salaries"""
        
        if refresh_data:
            # Refresh data from external sources
            self._refresh_industry_data(industry, tenant_id)
        
        # Get latest market trends
        recent_trends = self.db.query(MarketTrend).filter(
            MarketTrend.industry == industry,
            MarketTrend.status == "active",
            MarketTrend.created_at >= datetime.now(timezone.utc) - timedelta(days=30)
        ).order_by(desc(MarketTrend.confidence_score)).all()
        
        # Analyze trend impact on careers
        career_impact_analysis = self._analyze_career_impact_of_trends(recent_trends)
        
        # Get salary trend indicators
        salary_trends = self._get_salary_trend_indicators(industry, tenant_id)
        
        # Get skill demand changes
        skill_demand_changes = self._get_skill_demand_changes(industry, tenant_id)
        
        # Get job market indicators
        job_market_indicators = self._get_job_market_indicators(industry)
        
        return {
            "industry": industry,
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "trend_summary": {
                "total_trends": len(recent_trends),
                "emerging_trends": len([t for t in recent_trends if getattr(t, 'trend_type', 'stable') == "emerging"]),
                "high_impact_trends": len([t for t in recent_trends if getattr(t, 'impact_level', 'medium') in ["high", "critical"]])
            },
            "career_impact_analysis": career_impact_analysis,
            "salary_trends": salary_trends,
            "skill_demand_changes": skill_demand_changes,
            "job_market_indicators": job_market_indicators,
            "key_insights": self._generate_industry_insights(
                recent_trends, career_impact_analysis, salary_trends
            ),
            "recommendations": self._generate_industry_recommendations(
                recent_trends, career_impact_analysis
            )
        }
    
    def _refresh_industry_data(self, industry: str, tenant_id: int):
        """Refresh industry data from external sources"""
        
        # Get active data sources for the industry
        data_sources = self.db.query(MarketDataSource).filter(
            MarketDataSource.tenant_id == tenant_id,
            MarketDataSource.is_active == True
        ).all()
        
        # Filter by industry coverage if the field exists
        filtered_sources = []
        for source in data_sources:
            industries_covered = getattr(source, 'industries_covered', [])
            if isinstance(industries_covered, list) and industry in industries_covered:
                filtered_sources.append(source)
        data_sources = filtered_sources
        
        for source in data_sources:
            try:
                # Simulate data refresh (in real implementation, call actual APIs)
                self._simulate_data_refresh(source, industry)
                # Update source status
                setattr(source, 'consecutive_failures', 0)  # type: ignore
            except Exception as e:
                current_failures = getattr(source, 'consecutive_failures', 0)
                setattr(source, 'consecutive_failures', current_failures + 1)  # type: ignore
                if getattr(source, 'consecutive_failures', 0) >= 5:
                    setattr(source, 'is_active', False)  # type: ignore
        
        self.db.commit()
    
    def _analyze_career_impact_of_trends(self, trends: List[MarketTrend]) -> Dict[str, Any]:
        """Analyze how market trends impact career paths"""
        
        positive_impacts = []
        negative_impacts = []
        neutral_impacts = []
        
        positive_score = 0.0
        negative_score = 0.0
        
        for trend in trends:
            # Use the confidence score directly without conversion
            confidence_score = getattr(trend, 'confidence_score', None)
            confidence_val = float(confidence_score) if confidence_score is not None else 0.0
            impact_weight = self._get_trend_career_impact_weight(trend)
            impact_score = confidence_val * impact_weight
            
            trend_type = getattr(trend, 'trend_type', 'stable')
            impact_level = getattr(trend, 'impact_level', 'medium')
            trend_name = getattr(trend, 'trend_name', 'Unknown trend')
            category = getattr(trend, 'category', 'general')
            
            if trend_type in ["emerging", "growing"] and impact_level in ["high", "critical"]:
                positive_impacts.append({
                    "trend_name": trend_name,
                    "impact_description": f"Creates new opportunities in {category}",
                    "confidence": confidence_val,
                    "timeline": "1-3 years"
                })
                positive_score += impact_score
            elif trend_type == "declining":
                negative_impacts.append({
                    "trend_name": trend_name,
                    "impact_description": f"May reduce opportunities in traditional {category}",
                    "confidence": confidence_val,
                    "timeline": "2-5 years"
                })
                negative_score += impact_score
            else:
                neutral_impacts.append({
                    "trend_name": trend_name,
                    "impact_description": f"Gradual changes in {category}",
                    "confidence": confidence_val
                })
        
        # Determine overall outlook
        overall_career_outlook = "stable"
        if positive_score > negative_score * 1.5:
            overall_career_outlook = "very_positive"
        elif positive_score > negative_score:
            overall_career_outlook = "positive"
        elif negative_score > positive_score * 1.5:
            overall_career_outlook = "challenging"
        elif negative_score > positive_score:
            overall_career_outlook = "cautious"
        
        return {
            "positive_impacts": positive_impacts,
            "negative_impacts": negative_impacts,
            "neutral_impacts": neutral_impacts,
            "overall_career_outlook": overall_career_outlook
        }
    
    # Helper Methods
    
    def _fetch_market_salary_data(self, role: str, industry: str, location: str) -> List[Dict[str, Any]]:
        """Fetch salary data from job market APIs (simulated)"""
        # In real implementation, use job board APIs
        return [
            {"source": "indeed", "salary_range": {"min": 70000, "max": 90000}},
            {"source": "glassdoor", "salary_range": {"min": 75000, "max": 95000}},
            {"source": "linkedin", "salary_range": {"min": 72000, "max": 88000}}
        ]
    
    def _calculate_experience_multiplier(self, years_experience: int) -> float:
        """Calculate salary multiplier based on years of experience"""
        if years_experience <= 2:
            return 0.8
        elif years_experience <= 5:
            return 1.0
        elif years_experience <= 10:
            return 1.3
        elif years_experience <= 15:
            return 1.6
        else:
            return 1.8
    
    def _determine_experience_level(self, years_experience: int) -> str:
        """Determine experience level category"""
        if years_experience <= 2:
            return "entry_level"
        elif years_experience <= 7:
            return "mid_level"
        elif years_experience <= 15:
            return "senior_level"
        else:
            return "executive_level"
    
    def _get_location_salary_multiplier(self, location: str) -> float:
        """Get salary multiplier for location (cost of living adjustment)"""
        location_multipliers = {
            "san francisco": 1.4,
            "new york": 1.3,
            "seattle": 1.2,
            "austin": 1.1,
            "denver": 1.0,
            "atlanta": 0.9,
            "remote": 1.0
        }
        return location_multipliers.get(location.lower(), 1.0)
    
    def _get_industry_salary_multiplier(self, industry: str) -> float:
        """Get salary multiplier for industry"""
        industry_multipliers = {
            "technology": 1.2,
            "finance": 1.3,
            "healthcare": 1.1,
            "consulting": 1.2,
            "manufacturing": 0.9,
            "retail": 0.8,
            "education": 0.7
        }
        return industry_multipliers.get(industry.lower(), 1.0)
    
    def _calculate_skill_premium(self, demand_score: float, skill: str, industry: str) -> float:
        """Calculate salary premium for a specific skill"""
        base_premium = demand_score * 5.0  # 0-5% base premium
        
        # High-value skills get additional premium
        high_value_skills = ["ai", "machine learning", "cloud", "cybersecurity", "blockchain"]
        if any(hvs in skill.lower() for hvs in high_value_skills):
            base_premium *= 1.5
        
        return min(base_premium, 8.0)  # Cap at 8% per skill
    
    def _assess_skill_growth_potential(self, demand_forecast) -> str:
        """Assess growth potential of a skill"""
        demand_trend = getattr(demand_forecast, 'demand_trend', 'stable')
        if demand_trend in ["very_high_demand", "increasing"]:
            return "high"
        elif demand_trend in ["high_demand", "emerging_positive"]:
            return "moderate"
        elif demand_trend in ["decreasing", "very_low_demand"]:
            return "low"
        else:
            return "stable"
    
    def _assess_skill_portfolio_strength(self, skill_analysis: Dict[str, Any]) -> str:
        """Assess overall strength of skill portfolio"""
        high_demand_count = len([s for s in skill_analysis.values() if s["demand_score"] > 0.7])
        total_skills = len(skill_analysis)
        
        if total_skills == 0:
            return "developing"
        
        if high_demand_count / total_skills > 0.6:
            return "strong"
        elif high_demand_count / total_skills > 0.3:
            return "moderate"
        else:
            return "developing"
    
    def _generate_skill_recommendations(self, skill_analysis: Dict[str, Any], industry: str) -> List[str]:
        """Generate skill development recommendations"""
        recommendations = []
        
        # Find skills with declining demand
        declining_skills = [
            skill for skill, data in skill_analysis.items()
            if data["demand_trend"] in ["decreasing", "very_low_demand"]
        ]
        
        # Find high-growth skills
        growth_skills = [
            skill for skill, data in skill_analysis.items()
            if data["growth_potential"] == "high"
        ]
        
        if declining_skills:
            recommendations.append(f"Consider updating skills: {', '.join(declining_skills[:3])}")
        
        if growth_skills:
            recommendations.append(f"Focus on developing: {', '.join(growth_skills[:3])}")
        
        # Industry-specific recommendations
        if industry.lower() == "technology":
            recommendations.append("Consider cloud computing and AI/ML skills")
        elif industry.lower() == "finance":
            recommendations.append("Consider fintech and data analysis skills")
        
        return recommendations
    
    def _estimate_market_volatility(self, industry: str) -> float:
        """Estimate market volatility for the industry"""
        volatility_by_industry = {
            "technology": 0.15,
            "finance": 0.12,
            "healthcare": 0.08,
            "manufacturing": 0.10,
            "retail": 0.18,
            "energy": 0.20
        }
        return volatility_by_industry.get(industry.lower(), 0.12)
    
    def _calculate_average_annual_growth(self, progression: List[Dict[str, Any]]) -> float:
        """Calculate average annual growth rate"""
        if len(progression) < 2:
            return 0.0
        
        total_growth = 0.0
        years = 0
        
        for i in range(1, len(progression)):
            if progression[i]["growth_rate"] > 0:
                total_growth += progression[i]["growth_rate"]
                years += 1
        
        return (total_growth / years * 100) if years > 0 else 0.0
    
    def _calculate_overall_confidence(
        self,
        salary_benchmarks: Dict[str, Any],
        skill_market_value: Dict[str, Any],
        industry_trends: Dict[str, Any]
    ) -> float:
        """Calculate overall confidence in the forecast"""
        benchmark_confidence = salary_benchmarks.get("confidence_score", 0.5)
        skill_confidence = statistics.mean([
            skill["market_confidence"] for skill in skill_market_value["individual_skills"].values()
        ]) if skill_market_value["individual_skills"] else 0.5
        trend_confidence = industry_trends.get("confidence", 0.5)
        
        return round((benchmark_confidence + skill_confidence + trend_confidence) / 3, 2)
    
    def _generate_salary_recommendations(
        self,
        current_salary: float,
        progression: List[Dict[str, Any]],
        skill_analysis: Dict[str, Any],
        industry_trends: Dict[str, Any]
    ) -> List[str]:
        """Generate salary negotiation and career recommendations"""
        recommendations = []
        
        # Salary positioning recommendations
        final_salary = progression[-1]["salary"]
        growth_percent = ((final_salary - current_salary) / current_salary) * 100
        
        if growth_percent > 50:
            recommendations.append("Strong growth potential - consider aggressive career moves")
        elif growth_percent > 25:
            recommendations.append("Good growth trajectory - focus on skill development")
        else:
            recommendations.append("Consider role transition or skill upgrade for better growth")
        
        # Skill-based recommendations
        high_value_skills = [
            skill for skill, data in skill_analysis["individual_skills"].items()
            if data["salary_premium_percent"] > 5
        ]
        
        if high_value_skills:
            recommendations.append(f"Leverage high-value skills in negotiations: {', '.join(high_value_skills[:3])}")
        
        # Industry trend recommendations
        if industry_trends["trend_direction"] == "growing":
            recommendations.append("Industry growth supports salary increases - negotiate confidently")
        elif industry_trends["trend_direction"] == "declining":
            recommendations.append("Industry challenges - focus on transferable skills")
        
        return recommendations
    
    def _generate_market_insights(
        self,
        industry: str,
        location: str,
        skills: List[str],
        tenant_id: int
    ) -> List[Dict[str, Any]]:
        """Generate market insights for career planning"""
        insights = []
        
        # Industry insight
        insights.append({
            "type": "industry",
            "title": f"{industry.title()} Market Overview",
            "description": f"Current market conditions and trends in {industry}",
            "impact": "medium",
            "timeframe": "current"
        })
        
        # Location insight
        insights.append({
            "type": "location",
            "title": f"{location.title()} Job Market",
            "description": f"Salary and opportunity trends in {location}",
            "impact": "high",
            "timeframe": "current"
        })
        
        # Skills insight
        if skills:
            insights.append({
                "type": "skills",
                "title": "Skill Portfolio Analysis",
                "description": f"Market demand analysis for your {len(skills)} key skills",
                "impact": "high",
                "timeframe": "1-2 years"
            })
        
        return insights
    
    def _project_role_salary_progression(
        self,
        role: str,
        current_salary: float,
        industry: str,
        location: str,
        forecast_years: int
    ) -> List[Dict[str, Any]]:
        """Project salary progression for staying in current role"""
        progression = []
        annual_growth = 0.04  # 4% average for same role
        
        for year in range(forecast_years + 1):
            if year == 0:
                salary = current_salary
            else:
                salary = progression[year - 1]["salary"] * (1 + annual_growth)
            
            progression.append({
                "year": datetime.now(timezone.utc).year + year,
                "salary": round(salary, 2),
                "role": role,
                "growth_rate": annual_growth if year > 0 else 0.0
            })
        
        return progression
    
    def _get_promotion_role(self, current_role: str) -> Optional[str]:
        """Get typical promotion role for current role"""
        promotion_paths = {
            "software engineer": "senior software engineer",
            "senior software engineer": "staff engineer",
            "staff engineer": "principal engineer",
            "data analyst": "senior data analyst",
            "senior data analyst": "data scientist",
            "product manager": "senior product manager",
            "senior product manager": "director of product"
        }
        return promotion_paths.get(current_role.lower())
    
    def _project_promotion_salary_progression(
        self,
        current_role: str,
        target_role: str,
        current_salary: float,
        industry: str,
        location: str,
        forecast_years: int
    ) -> List[Dict[str, Any]]:
        """Project salary progression with promotion"""
        progression = []
        promotion_year = 2  # Assume promotion in year 2
        promotion_increase = 0.20  # 20% salary increase for promotion
        
        for year in range(forecast_years + 1):
            if year == 0:
                salary = current_salary
                role = current_role
            elif year < promotion_year:
                salary = progression[year - 1]["salary"] * 1.04  # 4% annual growth
                role = current_role
            elif year == promotion_year:
                salary = progression[year - 1]["salary"] * (1 + promotion_increase)
                role = target_role
            else:
                salary = progression[year - 1]["salary"] * 1.06  # 6% growth in new role
                role = target_role
            
            progression.append({
                "year": datetime.now(timezone.utc).year + year,
                "salary": round(salary, 2),
                "role": role,
                "growth_rate": 0.04 if year < promotion_year else (promotion_increase if year == promotion_year else 0.06)
            })
        
        return progression
    
    def _project_transition_salary_progression(
        self,
        current_role: str,
        target_role: str,
        current_salary: float,
        industry: str,
        location: str,
        skills: List[str],
        forecast_years: int
    ) -> List[Dict[str, Any]]:
        """Project salary progression with career transition"""
        progression = []
        transition_year = 1  # Assume transition in year 1
        transition_impact = -0.10  # 10% salary decrease initially
        
        for year in range(forecast_years + 1):
            if year == 0:
                salary = current_salary
                role = current_role
            elif year == transition_year:
                salary = current_salary * (1 + transition_impact)
                role = target_role
            else:
                # Higher growth after transition
                growth_rate = 0.08 if year > transition_year else 0.04
                salary = progression[year - 1]["salary"] * (1 + growth_rate)
                role = target_role if year >= transition_year else current_role
            
            progression.append({
                "year": datetime.now(timezone.utc).year + year,
                "salary": round(salary, 2),
                "role": role,
                "growth_rate": 0.04 if year < transition_year else (transition_impact if year == transition_year else 0.08)
            })
        
        return progression
    
    def _get_transition_requirements(self, current_role: str, target_role: str) -> List[str]:
        """Get requirements for role transition"""
        return [
            f"Develop skills specific to {target_role}",
            "Build portfolio demonstrating relevant experience",
            "Network with professionals in target field",
            "Consider certification or additional training",
            "Gain experience through side projects or volunteering"
        ]
    
    def _get_salary_trend_indicators(self, industry: str, tenant_id: int) -> Dict[str, Any]:
        """Get salary trend indicators for the industry"""
        return {
            "overall_trend": "increasing",
            "annual_growth_rate": 4.5,
            "regional_variations": {
                "high_growth_regions": ["San Francisco", "Seattle", "Austin"],
                "stable_regions": ["Chicago", "Atlanta", "Denver"],
                "declining_regions": ["Detroit", "Cleveland"]
            },
            "role_specific_trends": {
                "software_engineer": {"trend": "strong_growth", "rate": 6.2},
                "data_scientist": {"trend": "very_strong_growth", "rate": 8.1},
                "product_manager": {"trend": "moderate_growth", "rate": 4.8}
            }
        }
    
    def _get_skill_demand_changes(self, industry: str, tenant_id: int) -> Dict[str, Any]:
        """Get recent changes in skill demand"""
        return {
            "trending_up": [
                {"skill": "AI/Machine Learning", "growth_rate": 45.2},
                {"skill": "Cloud Computing", "growth_rate": 32.1},
                {"skill": "Cybersecurity", "growth_rate": 28.7}
            ],
            "trending_down": [
                {"skill": "Legacy Systems", "decline_rate": -15.3},
                {"skill": "Manual Testing", "decline_rate": -8.9}
            ],
            "stable": [
                {"skill": "Project Management", "change_rate": 2.1},
                {"skill": "Communication", "change_rate": 1.8}
            ]
        }
    
    def _get_job_market_indicators(self, industry: str) -> Dict[str, Any]:
        """Get job market indicators"""
        return {
            "job_openings_trend": "increasing",
            "competition_level": "moderate",
            "time_to_hire": "45 days",
            "remote_work_availability": 0.65,
            "salary_negotiation_success_rate": 0.72,
            "market_indicators": {
                "unemployment_rate": 3.2,
                "job_growth_rate": 5.8,
                "skills_gap_severity": "moderate"
            }
        }
    
    def _generate_industry_insights(
        self,
        recent_trends: List[MarketTrend],
        career_impact_analysis: Dict[str, Any],
        salary_trends: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate key industry insights"""
        insights = []
        
        if recent_trends:
            insights.append({
                "type": "trend",
                "title": f"{len(recent_trends)} New Industry Trends Identified",
                "description": "Recent market developments affecting career opportunities",
                "priority": "high"
            })
        
        if career_impact_analysis["overall_career_outlook"] == "very_positive":
            insights.append({
                "type": "opportunity",
                "title": "Strong Career Growth Outlook",
                "description": "Industry trends indicate excellent career advancement opportunities",
                "priority": "high"
            })
        
        if salary_trends["annual_growth_rate"] > 5.0:
            insights.append({
                "type": "salary",
                "title": "Above-Average Salary Growth",
                "description": f"Industry showing {salary_trends['annual_growth_rate']}% annual salary growth",
                "priority": "medium"
            })
        
        return insights
    
    def _generate_industry_recommendations(
        self,
        recent_trends: List[MarketTrend],
        career_impact_analysis: Dict[str, Any]
    ) -> List[str]:
        """Generate industry-specific recommendations"""
        recommendations = []
        
        if career_impact_analysis["overall_career_outlook"] == "very_positive":
            recommendations.append("Consider aggressive career advancement strategies")
            recommendations.append("Explore leadership and management opportunities")
        
        if len(career_impact_analysis["positive_impacts"]) > 2:
            recommendations.append("Focus on emerging technology trends")
            recommendations.append("Build skills in high-growth areas")
        
        if len(career_impact_analysis["negative_impacts"]) > 1:
            recommendations.append("Diversify skill portfolio to reduce risk")
            recommendations.append("Consider transitioning away from declining areas")
        
        return recommendations
    
    def _simulate_data_refresh(self, source: MarketDataSource, industry: str):
        """Simulate refreshing data from external source"""
        # In real implementation, this would make actual API calls
        # For now, just update the request count
        current_requests = getattr(source, 'requests_used_this_month', 0)
        setattr(source, 'requests_used_this_month', current_requests + 1)  # type: ignore
    
    def _get_trend_career_impact_weight(self, trend: MarketTrend) -> float:
        """Get weight for trend's impact on careers"""
        impact_weights = {
            "low": 0.25,
            "medium": 0.5,
            "high": 0.75,
            "critical": 1.0
        }
        impact_level_raw = getattr(trend, 'impact_level', 'medium')
        impact_level = str(impact_level_raw) if impact_level_raw is not None else "medium"
        return impact_weights.get(impact_level, 0.5)


def get_career_path_modeling_service(db: Session) -> CareerPathModelingService:
    """Get career path modeling service instance"""
    return CareerPathModelingService(db)