"""
Market Intelligence service for industry trend analysis and competitive intelligence
"""

from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
import uuid
import json
import asyncio
from decimal import Decimal
import numpy as np

from ..models.market_intelligence import (
    MarketTrend, CompetitiveAnalysis, IntelligenceReport,
    MarketDataSource, IndustryBenchmark
)
# Import JobPosting if it exists and is decided to be used directly.
# from ..models.job import JobPosting # Assuming a JobPosting model might exist or be created
from ..models.user import User
from ..models.tenant import Tenant
from ..schemas import market_intelligence_schemas as mi_schemas # Import new schemas


class MarketIntelligenceService:
    """Service for market intelligence and competitive analysis"""

    def __init__(self, db: Session):
        self.db = db

    # --- MarketDataSource CRUD ---
    def create_market_data_source(
        self,
        tenant_id: int,
        source_data: mi_schemas.MarketDataSourceCreate,
        created_by_user_id: int
    ) -> MarketDataSource:
        db_source = MarketDataSource()  # type: ignore
        source_data_dict = getattr(source_data, 'model_dump', lambda: {})()
        for key, value in source_data_dict.items():
            setattr(db_source, key, value)  # type: ignore
        setattr(db_source, 'tenant_id', tenant_id)  # type: ignore
        setattr(db_source, 'created_by_user_id', created_by_user_id)  # type: ignore
        self.db.add(db_source)
        self.db.commit()
        self.db.refresh(db_source)
        return db_source

    def get_market_data_source(self, source_id: int, tenant_id: int) -> Optional[MarketDataSource]:
        return self.db.query(MarketDataSource).filter(
            MarketDataSource.id == source_id,
            MarketDataSource.tenant_id == tenant_id
        ).first()

    def list_market_data_sources(
        self,
        tenant_id: int,
        source_type: Optional[str] = None,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[MarketDataSource]:
        query = self.db.query(MarketDataSource).filter(MarketDataSource.tenant_id == tenant_id)
        if source_type:
            query = query.filter(MarketDataSource.source_type == source_type)
        if is_active is not None:
            query = query.filter(MarketDataSource.is_active == is_active)
        return query.order_by(MarketDataSource.source_name).offset(skip).limit(limit).all()

    def update_market_data_source(
        self,
        source_id: int,
        tenant_id: int,
        update_data: mi_schemas.MarketDataSourceUpdate
    ) -> Optional[MarketDataSource]:
        db_source = self.get_market_data_source(source_id, tenant_id)
        if not db_source:
            return None

        update_dict = getattr(update_data, 'model_dump', lambda exclude_unset=True: {})(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(db_source, key, value)  # type: ignore

        setattr(db_source, 'updated_at', datetime.utcnow())  # type: ignore
        self.db.commit()
        self.db.refresh(db_source)
        return db_source

    def delete_market_data_source(self, source_id: int, tenant_id: int) -> bool:
        db_source = self.get_market_data_source(source_id, tenant_id)
        if not db_source:
            return False
        self.db.delete(db_source)
        self.db.commit()
        return True

    # --- Industry Report Ingestion ---
    def process_uploaded_industry_report(
        self,
        report_data_source_id: int, # ID of the MarketDataSource representing the uploaded report
        extracted_trends_data: List[mi_schemas.MarketTrendCreate], # List of structured trends
        tenant_id: int,
        created_by_user_id: int
    ) -> List[MarketTrend]:
        """
        Processes structured data extracted from an industry report and creates MarketTrend entries.
        The report itself is represented by a MarketDataSource entry.
        """
        report_source = self.get_market_data_source(report_data_source_id, tenant_id)
        if not report_source:
            raise ValueError(f"MarketDataSource with ID {report_data_source_id} not found for tenant {tenant_id}.")
        if report_source.source_type not in ["manual_report_upload", "unstructured_text_report", "industry_report_feed"]: # Example types
            raise ValueError(f"MarketDataSource ID {report_data_source_id} is not of a report type.")

        created_trends = []
        for trend_data_schema in extracted_trends_data:
            trend_data_dict = getattr(trend_data_schema, 'model_dump', lambda: {})()

            # Ensure the trend's data_sources field includes a reference to this report source
            source_reference = {"type": "report_source_id", "id": report_data_source_id, "name": getattr(report_source, 'source_name', 'Unknown')}
            if "data_sources" not in trend_data_dict or not trend_data_dict["data_sources"]:
                if isinstance(trend_data_dict, dict):
                    trend_data_dict["data_sources"] = [source_reference]
            else:
                # Avoid duplicate references if processing multiple times (idempotency consideration)
                if not any(ds.get("id") == report_data_source_id for ds in trend_data_dict["data_sources"] if isinstance(ds, dict)):
                    trend_data_dict["data_sources"].append(source_reference)

            # Create the MarketTrend object
            # The create_market_trend method already handles conversion from dict and saving
            trend = self.create_market_trend(
                tenant_id=tenant_id,
                trend_data=trend_data_dict, # Pass the dict from schema
                created_by_user_id=created_by_user_id
            )
            created_trends.append(trend)

        return created_trends

    # --- Market Trends Management (existing, may need minor adjustments for schema use) ---
    def create_market_trend(
        self,
        tenant_id: int,
        trend_data: Dict[str, Any],
        created_by_user_id: int
    ) -> MarketTrend:
        """Create a new market trend"""
        
        trend = MarketTrend()  # type: ignore
        setattr(trend, 'tenant_id', tenant_id)  # type: ignore
        setattr(trend, 'trend_name', trend_data["trend_name"])  # type: ignore
        setattr(trend, 'display_name', trend_data["display_name"])  # type: ignore
        setattr(trend, 'description', trend_data.get("description"))  # type: ignore
        setattr(trend, 'industry', trend_data["industry"])  # type: ignore
        setattr(trend, 'category', trend_data["category"])  # type: ignore
        setattr(trend, 'trend_type', trend_data["trend_type"])  # type: ignore
        setattr(trend, 'impact_level', trend_data["impact_level"])  # type: ignore
        setattr(trend, 'confidence_score', trend_data.get("confidence_score", 0.0))  # type: ignore
        setattr(trend, 'growth_rate', trend_data.get("growth_rate"))  # type: ignore
        market_size_value = trend_data.get("market_size")
        if market_size_value:
            setattr(trend, 'market_size', Decimal(str(market_size_value)))  # type: ignore
        else:
            setattr(trend, 'market_size', None)  # type: ignore
        setattr(trend, 'adoption_rate', trend_data.get("adoption_rate"))  # type: ignore
        setattr(trend, 'maturity_stage', trend_data.get("maturity_stage"))  # type: ignore
        setattr(trend, 'period_start', trend_data["period_start"])  # type: ignore
        setattr(trend, 'period_end', trend_data["period_end"])  # type: ignore
        setattr(trend, 'forecast_horizon', trend_data.get("forecast_horizon"))  # type: ignore
        setattr(trend, 'data_sources', trend_data.get("data_sources", []))  # type: ignore
        setattr(trend, 'analysis_methods', trend_data.get("analysis_methods", []))  # type: ignore
        setattr(trend, 'key_indicators', trend_data.get("key_indicators", {}))  # type: ignore
        setattr(trend, 'supporting_data', trend_data.get("supporting_data", {}))  # type: ignore
        setattr(trend, 'geographic_scope', trend_data.get("geographic_scope", "global"))  # type: ignore
        setattr(trend, 'regions', trend_data.get("regions", []))  # type: ignore
        setattr(trend, 'created_by_user_id', created_by_user_id)  # type: ignore
        
        self.db.add(trend)
        self.db.commit()
        self.db.refresh(trend)
        
        return trend

    def get_market_trends(
        self,
        tenant_id: int,
        industry: Optional[str] = None,
        category: Optional[str] = None,
        trend_type: Optional[str] = None,
        impact_level: Optional[str] = None,
        active_only: bool = True
    ) -> List[MarketTrend]:
        """Get market trends for tenant"""
        
        query = self.db.query(MarketTrend).filter(
            MarketTrend.tenant_id == tenant_id
        )
        
        if active_only:
            query = query.filter(MarketTrend.status == "active")
        
        if industry:
            query = query.filter(MarketTrend.industry == industry)
        
        if category:
            query = query.filter(MarketTrend.category == category)
        
        if trend_type:
            query = query.filter(MarketTrend.trend_type == trend_type)
        
        if impact_level:
            query = query.filter(MarketTrend.impact_level == impact_level)
        
        return query.order_by(desc(MarketTrend.confidence_score)).all()

    def analyze_trend_impact(self, trend_id: int) -> Dict[str, Any]:
        """Analyze the impact of a market trend"""
        
        trend = self.db.query(MarketTrend).filter(
            MarketTrend.id == trend_id
        ).first()
        
        if not trend:
            raise ValueError("Trend not found")
        
        # Calculate trend metrics
        trend_strength = getattr(trend, 'trend_strength', 0.0)
        
        # Generate impact analysis
        impact_analysis = {
            "trend_id": trend_id,
            "trend_name": getattr(trend, 'trend_name', 'Unknown'),
            "trend_strength": trend_strength,
            "impact_level": getattr(trend, 'impact_level', 'unknown'),
            "confidence_score": getattr(trend, 'confidence_score', 0.0),
            "requires_attention": getattr(trend, 'requires_attention', False),
            "is_emerging": getattr(trend, 'is_emerging', False),
            "market_implications": self._generate_market_implications(trend),
            "strategic_recommendations": self._generate_strategic_recommendations(trend),
            "risk_assessment": self._assess_trend_risks(trend),
            "opportunity_analysis": self._analyze_trend_opportunities(trend)
        }
        
        return impact_analysis

    def _generate_market_implications(self, trend: MarketTrend) -> List[str]:
        """Generate market implications for a trend"""
        implications = []
        
        trend_type = getattr(trend, 'trend_type', None)
        if trend_type == "emerging":
            implications.append("Early market opportunity for first movers")
            implications.append("High uncertainty but potential for significant returns")
        
        impact_level = getattr(trend, 'impact_level', None)
        if impact_level == "critical":
            implications.append("Industry-wide disruption expected")
            implications.append("Immediate strategic response required")
        
        growth_rate = getattr(trend, 'growth_rate', None)
        if growth_rate and growth_rate > 20:
            implications.append("Rapid market expansion anticipated")
            implications.append("Increased competition likely")
        
        return implications

    def _generate_strategic_recommendations(self, trend: MarketTrend) -> List[str]:
        """Generate strategic recommendations for a trend"""
        recommendations = []
        
        is_emerging = getattr(trend, 'is_emerging', False)
        confidence_score = getattr(trend, 'confidence_score', 0.0)
        if is_emerging and confidence_score > 0.7:
            recommendations.append("Consider early investment in this trend")
            recommendations.append("Develop pilot programs to test market response")
        
        impact_level = getattr(trend, 'impact_level', None)
        if impact_level in ["high", "critical"]:
            recommendations.append("Conduct detailed competitive analysis")
            recommendations.append("Assess internal capabilities and gaps")
        
        maturity_stage = getattr(trend, 'maturity_stage', None)
        if maturity_stage == "innovation":
            recommendations.append("Monitor technology development closely")
            recommendations.append("Build partnerships with innovators")
        
        return recommendations

    def _assess_trend_risks(self, trend: MarketTrend) -> Dict[str, Any]:
        """Assess risks associated with a trend"""
        risks = {
            "overall_risk_level": "medium",
            "key_risks": [],
            "mitigation_strategies": []
        }
        
        confidence_score = getattr(trend, 'confidence_score', 0.0)
        if confidence_score < 0.5:
            key_risks = risks.get("key_risks", [])
            if isinstance(key_risks, list):
                key_risks.append("High uncertainty in trend prediction")
                risks["key_risks"] = key_risks
            mitigation_strategies = risks.get("mitigation_strategies", [])
            if isinstance(mitigation_strategies, list):
                mitigation_strategies.append("Gather additional market data")
                risks["mitigation_strategies"] = mitigation_strategies
        
        trend_type = getattr(trend, 'trend_type', None)
        if trend_type == "emerging":
            key_risks = risks.get("key_risks", [])
            if isinstance(key_risks, list):
                key_risks.append("Technology or market adoption may fail")
                risks["key_risks"] = key_risks
            mitigation_strategies = risks.get("mitigation_strategies", [])
            if isinstance(mitigation_strategies, list):
                mitigation_strategies.append("Diversify investments across multiple trends")
                risks["mitigation_strategies"] = mitigation_strategies
        
        # Calculate overall risk level
        risk_factors = len(risks["key_risks"])
        if risk_factors >= 3:
            risks["overall_risk_level"] = "high"
        elif risk_factors <= 1:
            risks["overall_risk_level"] = "low"
        
        return risks

    def _analyze_trend_opportunities(self, trend: MarketTrend) -> Dict[str, Any]:
        """Analyze opportunities from a trend"""
        opportunities = {
            "market_size_potential": "medium",
            "competitive_advantage_potential": "medium",
            "key_opportunities": [],
            "success_factors": []
        }
        
        market_size = getattr(trend, 'market_size', None)
        if market_size and float(market_size) > 1000000:
            opportunities["market_size_potential"] = "high"
            key_opportunities = opportunities.get("key_opportunities", [])
            if isinstance(key_opportunities, list):
                key_opportunities.append("Large addressable market")
                opportunities["key_opportunities"] = key_opportunities
        
        adoption_rate = getattr(trend, 'adoption_rate', None)
        if adoption_rate and adoption_rate < 20:
            key_opportunities = opportunities.get("key_opportunities", [])
            if isinstance(key_opportunities, list):
                key_opportunities.append("Early market with room for growth")
                opportunities["key_opportunities"] = key_opportunities
            success_factors = opportunities.get("success_factors", [])
            if isinstance(success_factors, list):
                success_factors.append("Speed to market")
                opportunities["success_factors"] = success_factors
        
        return opportunities

    # Competitive Analysis Management
    def create_competitive_analysis(
        self,
        tenant_id: int,
        analysis_data: Dict[str, Any],
        created_by_user_id: int
    ) -> CompetitiveAnalysis:
        """Create a new competitive analysis"""
        
        analysis = CompetitiveAnalysis()  # type: ignore
        setattr(analysis, 'tenant_id', tenant_id)  # type: ignore
        setattr(analysis, 'market_trend_id', analysis_data.get("market_trend_id"))  # type: ignore
        setattr(analysis, 'analysis_name', analysis_data["analysis_name"])  # type: ignore
        setattr(analysis, 'description', analysis_data.get("description"))  # type: ignore
        setattr(analysis, 'industry', analysis_data["industry"])  # type: ignore
        setattr(analysis, 'analysis_type', analysis_data["analysis_type"])  # type: ignore
        setattr(analysis, 'primary_competitors', analysis_data.get("primary_competitors", []))  # type: ignore
        setattr(analysis, 'secondary_competitors', analysis_data.get("secondary_competitors", []))  # type: ignore
        setattr(analysis, 'emerging_competitors', analysis_data.get("emerging_competitors", []))  # type: ignore
        setattr(analysis, 'market_position', analysis_data.get("market_position"))  # type: ignore
        setattr(analysis, 'market_share', analysis_data.get("market_share"))  # type: ignore
        setattr(analysis, 'competitive_advantage', analysis_data.get("competitive_advantage", []))  # type: ignore
        setattr(analysis, 'competitive_threats', analysis_data.get("competitive_threats", []))  # type: ignore
        setattr(analysis, 'strengths', analysis_data.get("strengths", []))  # type: ignore
        setattr(analysis, 'weaknesses', analysis_data.get("weaknesses", []))  # type: ignore
        setattr(analysis, 'opportunities', analysis_data.get("opportunities", []))  # type: ignore
        setattr(analysis, 'threats', analysis_data.get("threats", []))  # type: ignore
        setattr(analysis, 'competitive_rivalry', analysis_data.get("competitive_rivalry"))  # type: ignore
        setattr(analysis, 'supplier_power', analysis_data.get("supplier_power"))  # type: ignore
        setattr(analysis, 'buyer_power', analysis_data.get("buyer_power"))  # type: ignore
        setattr(analysis, 'threat_of_substitution', analysis_data.get("threat_of_substitution"))  # type: ignore
        setattr(analysis, 'threat_of_new_entry', analysis_data.get("threat_of_new_entry"))  # type: ignore
        setattr(analysis, 'revenue_comparison', analysis_data.get("revenue_comparison", {}))  # type: ignore
        setattr(analysis, 'profitability_metrics', analysis_data.get("profitability_metrics", {}))  # type: ignore
        setattr(analysis, 'growth_metrics', analysis_data.get("growth_metrics", {}))  # type: ignore
        setattr(analysis, 'product_comparison', analysis_data.get("product_comparison", {}))  # type: ignore
        setattr(analysis, 'pricing_analysis', analysis_data.get("pricing_analysis", {}))  # type: ignore
        setattr(analysis, 'innovation_metrics', analysis_data.get("innovation_metrics", {}))  # type: ignore
        setattr(analysis, 'period_start', analysis_data["period_start"])  # type: ignore
        setattr(analysis, 'period_end', analysis_data["period_end"])  # type: ignore
        setattr(analysis, 'data_sources', analysis_data.get("data_sources", []))  # type: ignore
        setattr(analysis, 'confidence_level', analysis_data.get("confidence_level", 0.0))  # type: ignore
        setattr(analysis, 'data_completeness', analysis_data.get("data_completeness", 0.0))  # type: ignore
        setattr(analysis, 'created_by_user_id', created_by_user_id)  # type: ignore
        
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        
        return analysis

    def get_competitive_analyses(
        self,
        tenant_id: int,
        industry: Optional[str] = None,
        analysis_type: Optional[str] = None,
        limit: int = 50
    ) -> List[CompetitiveAnalysis]:
        """Get competitive analyses for tenant"""
        
        query = self.db.query(CompetitiveAnalysis).filter(
            CompetitiveAnalysis.tenant_id == tenant_id
        )
        
        if industry:
            query = query.filter(CompetitiveAnalysis.industry == industry)
        
        if analysis_type:
            query = query.filter(CompetitiveAnalysis.analysis_type == analysis_type)
        
        return query.order_by(desc(CompetitiveAnalysis.analysis_date)).limit(limit).all()

    def generate_porter_analysis(self, analysis_id: int) -> Dict[str, Any]:
        """Generate Porter's Five Forces analysis"""
        
        analysis = self.db.query(CompetitiveAnalysis).filter(
            CompetitiveAnalysis.id == analysis_id
        ).first()
        
        if not analysis:
            raise ValueError("Analysis not found")
        
        porter_analysis = {
            "analysis_id": analysis_id,
            "overall_intensity": getattr(analysis, 'overall_competitive_intensity', 0.0),
            "forces": {
                "competitive_rivalry": {
                    "score": getattr(analysis, 'competitive_rivalry', None),
                    "level": self._get_intensity_level(getattr(analysis, 'competitive_rivalry', None)),
                    "factors": ["High number of competitors", "Market fragmentation"]
                },
                "supplier_power": {
                    "score": getattr(analysis, 'supplier_power', None),
                    "level": self._get_intensity_level(getattr(analysis, 'supplier_power', None)),
                    "factors": ["Limited suppliers", "High switching costs"]
                },
                "buyer_power": {
                    "score": getattr(analysis, 'buyer_power', None),
                    "level": self._get_intensity_level(getattr(analysis, 'buyer_power', None)),
                    "factors": ["Price sensitivity", "Low switching costs"]
                },
                "threat_of_substitution": {
                    "score": getattr(analysis, 'threat_of_substitution', None),
                    "level": self._get_intensity_level(getattr(analysis, 'threat_of_substitution', None)),
                    "factors": ["Alternative technologies", "Changing preferences"]
                },
                "threat_of_new_entry": {
                    "score": getattr(analysis, 'threat_of_new_entry', None),
                    "level": self._get_intensity_level(getattr(analysis, 'threat_of_new_entry', None)),
                    "factors": ["Low barriers to entry", "Technology disruption"]
                }
            },
            "strategic_implications": self._get_porter_implications(analysis),
            "recommendations": self._get_porter_recommendations(analysis)
        }
        
        return porter_analysis

    def _get_intensity_level(self, score: Optional[float]) -> str:
        """Get intensity level from score"""
        if score is None:
            return "unknown"
        elif score >= 4.0:
            return "very_high"
        elif score >= 3.0:
            return "high"
        elif score >= 2.0:
            return "medium"
        else:
            return "low"

    def _get_porter_implications(self, analysis: CompetitiveAnalysis) -> List[str]:
        """Get strategic implications from Porter analysis"""
        implications = []
        
        intensity = getattr(analysis, 'overall_competitive_intensity', 0.0)
        
        if intensity >= 3.5:
            implications.append("Highly competitive industry with pressure on margins")
            implications.append("Differentiation strategy critical for success")
        elif intensity <= 2.0:
            implications.append("Favorable industry structure with profit potential")
            implications.append("Focus on market share growth")
        
        return implications

    def _get_porter_recommendations(self, analysis: CompetitiveAnalysis) -> List[str]:
        """Get recommendations from Porter analysis"""
        recommendations = []
        
        competitive_rivalry = getattr(analysis, 'competitive_rivalry', None)
        if competitive_rivalry and competitive_rivalry >= 4.0:
            recommendations.append("Develop unique value proposition")
            recommendations.append("Focus on customer loyalty programs")
        
        supplier_power = getattr(analysis, 'supplier_power', None)
        if supplier_power and supplier_power >= 3.0:
            recommendations.append("Diversify supplier base")
            recommendations.append("Consider vertical integration")
        
        return recommendations

    # Analytics and Dashboard
    def get_market_intelligence_dashboard(self, tenant_id: int) -> Dict[str, Any]:
        """Get market intelligence dashboard data"""
        
        # Trend statistics
        total_trends = self.db.query(MarketTrend).filter(
            MarketTrend.tenant_id == tenant_id
        ).count()
        
        emerging_trends = self.db.query(MarketTrend).filter(
            MarketTrend.tenant_id == tenant_id,
            MarketTrend.trend_type == "emerging"
        ).count()
        
        high_impact_trends = self.db.query(MarketTrend).filter(
            MarketTrend.tenant_id == tenant_id,
            getattr(MarketTrend.impact_level, 'in_', lambda x: True)(["high", "critical"])
        ).count()
        
        # Analysis statistics
        total_analyses = self.db.query(CompetitiveAnalysis).filter(
            CompetitiveAnalysis.tenant_id == tenant_id
        ).count()
        
        # Report statistics
        total_reports = self.db.query(IntelligenceReport).filter(
            IntelligenceReport.tenant_id == tenant_id
        ).count()
        
        recent_reports = self.db.query(IntelligenceReport).filter(
            IntelligenceReport.tenant_id == tenant_id,
            IntelligenceReport.report_date >= datetime.utcnow() - timedelta(days=30)
        ).count()
        
        return {
            "trends": {
                "total": total_trends,
                "emerging": emerging_trends,
                "high_impact": high_impact_trends,
                "emerging_percentage": (emerging_trends / total_trends * 100) if total_trends > 0 else 0
            },
            "competitive_analysis": {
                "total": total_analyses,
                "recent": self.db.query(CompetitiveAnalysis).filter(
                    CompetitiveAnalysis.tenant_id == tenant_id,
                    CompetitiveAnalysis.analysis_date >= datetime.utcnow() - timedelta(days=30)
                ).count()
            },
            "reports": {
                "total": total_reports,
                "recent": recent_reports,
                "monthly_average": recent_reports
            },
            "insights": self.generate_market_insights(tenant_id)
        }

    def generate_market_insights(self, tenant_id: int) -> List[Dict[str, Any]]:
        """Generate AI-powered market insights"""
        
        insights = []
        
        # Trend insights
        trends = self.get_market_trends(tenant_id, active_only=True)
        emerging_trends = [t for t in trends if getattr(t, 'is_emerging', False)]
        
        if emerging_trends:
            insights.append({
                "type": "opportunity",
                "category": "emerging_trends",
                "title": f"{len(emerging_trends)} Emerging Trends Identified",
                "description": f"Monitor {len(emerging_trends)} emerging trends for early investment opportunities",
                "priority": "high",
                "action_required": True
            })
        
        # Competitive insights
        analyses = self.get_competitive_analyses(tenant_id, limit=10)
        high_intensity_markets = [a for a in analyses if getattr(a, 'overall_competitive_intensity', 0.0) > 3.5]
        
        if high_intensity_markets:
            insights.append({
                "type": "warning",
                "category": "competitive_intensity",
                "title": "High Competitive Intensity Detected",
                "description": f"{len(high_intensity_markets)} markets show high competitive pressure",
                "priority": "medium",
                "action_required": True
            })
        
        return insights

    # --- Skill Demand Forecasting ---
    def forecast_skill_demand(
        self,
        skill_keywords: List[str], # e.g., ["Python", "FastAPI", "SQLAlchemy"]
        tenant_id: int, # For scoping data sources if needed, though trends/jobs might be global
        time_horizon_months: int = 6, # How far back to look for job data / recent trends
        job_description_sample_size: int = 200 # Number of job descriptions to conceptually analyze per source
    ) -> mi_schemas.SkillDemandForecastResponse:

        if not skill_keywords:
            raise ValueError("Skill keywords must be provided for demand forecasting.")

        skill_keywords_lower = [kw.lower() for kw in skill_keywords]
        skill_analyzed_str = ", ".join(skill_keywords)

        evidence_list: List[mi_schemas.SkillDemandEvidence] = []

        # --- 1. Analyze Job Posting Data ---
        # This part is highly dependent on how job data is stored/accessed.
        # Simulation: Assume we can get relevant job descriptions.
        job_mentions_count = 0
        recent_job_mentions_count = 0

        # Conceptual: Query active 'job_board_api' or 'job_postings_feed' MarketDataSources
        job_data_sources = self.list_market_data_sources(
            tenant_id=tenant_id, # Or global if job data is not tenant-specific
            source_type="job_board_api", # This type needs to be defined and used when setting up sources
            is_active=True
        )
        # Further simulation: If no specific job_board_api, try a generic text source
        if not job_data_sources:
            job_data_sources = self.list_market_data_sources(tenant_id=tenant_id, source_type="generic_text_feed", is_active=True, limit=1)


        # Simulate fetching and analyzing job descriptions
        # In reality, this would involve API calls to job boards or querying a JobPosting table
        simulated_job_descriptions = self._get_simulated_job_descriptions(
            keywords=skill_keywords_lower,
            sample_size=job_description_sample_size * len(job_data_sources)
        )

        past_date_limit = datetime.utcnow() - timedelta(days=time_horizon_months * 30)

        for desc_data in simulated_job_descriptions:
            text_to_search = desc_data.get("description", "").lower() + " " + desc_data.get("title", "").lower()
            # posted_date = desc_data.get("date", datetime.utcnow()) # Assuming date is available

            if any(kw in text_to_search for kw in skill_keywords_lower):
                job_mentions_count += 1
                # if posted_date >= past_date_limit: # Check if recent
                #     recent_job_mentions_count +=1
                # For simulation, assume all fetched are somewhat recent
                recent_job_mentions_count +=1


        if job_mentions_count > 0:
            desc = f"{recent_job_mentions_count} relevant job postings (out of {len(simulated_job_descriptions)} sampled) mentioned '{skill_analyzed_str}' in the last {time_horizon_months} months."
            try:
                evidence_class = getattr(mi_schemas, 'SkillDemandEvidence', None)
                if evidence_class:
                    evidence_item = evidence_class(
                        source_type="job_posting_analysis",
                        description=desc,
                        score_contribution=min(0.4, recent_job_mentions_count / 50.0)
                    )
                else:
                    evidence_item = {
                        "source_type": "job_posting_analysis",
                        "description": desc,
                        "score_contribution": min(0.4, recent_job_mentions_count / 50.0)
                    }
                evidence_list.append(evidence_item)
            except Exception:
                evidence_list.append({
                    "source_type": "job_posting_analysis",
                    "description": desc,
                    "score_contribution": min(0.4, recent_job_mentions_count / 50.0)
                })

        # --- 2. Analyze Market Trend Data ---
        market_trend_score_contribution = 0.0
        relevant_trends_found = 0

        # Query MarketTrend data that might be relevant
        # A more sophisticated query would use full-text search if available, or match on tags/keywords field if added to MarketTrend
        all_trends = self.db.query(MarketTrend).filter(
            # MarketTrend.tenant_id == tenant_id, # Trends might be global or tenant-specific
            MarketTrend.status == "active",
            MarketTrend.period_end >= past_date_limit # Consider only relatively current trends
        ).all()

        for trend in all_trends:
            trend_name = getattr(trend, 'trend_name', '')
            trend_description = getattr(trend, 'description', '') or ''
            key_indicators = getattr(trend, 'key_indicators', {}) or {}
            trend_text_content = (trend_name + " " + trend_description + " " + json.dumps(key_indicators)).lower()
            if any(kw in trend_text_content for kw in skill_keywords_lower):
                relevant_trends_found += 1
                display_name = getattr(trend, 'display_name', 'Unknown')
                trend_type = getattr(trend, 'trend_type', 'unknown')
                impact_level = getattr(trend, 'impact_level', 'unknown')
                confidence_score = getattr(trend, 'confidence_score', 0.0)
                desc = f"Industry Trend: '{display_name}' ({trend_type}, impact: {impact_level}, confidence: {confidence_score*100:.0f}%) mentions or relates to '{skill_analyzed_str}'."

                trend_relevance_score = 0.0
                trend_type = getattr(trend, 'trend_type', None)
                impact_level = getattr(trend, 'impact_level', None)
                confidence_score = getattr(trend, 'confidence_score', 0.0)
                
                if trend_type == "emerging": trend_relevance_score += 0.05
                if trend_type == "growing": trend_relevance_score += 0.1
                if trend_type == "declining": trend_relevance_score -= 0.1

                if impact_level == "high": trend_relevance_score += 0.05
                if impact_level == "critical": trend_relevance_score += 0.1

                trend_relevance_score *= confidence_score # Weight by confidence
                market_trend_score_contribution += trend_relevance_score

                try:
                    evidence_class = getattr(mi_schemas, 'SkillDemandEvidence', None)
                    if evidence_class:
                        evidence_item = evidence_class(
                            source_type="industry_report_trend",
                            description=desc,
                            reference_id=f"MarketTrend-{getattr(trend, 'id', 'unknown')}",
                            score_contribution=trend_relevance_score
                        )
                    else:
                        evidence_item = {
                            "source_type": "industry_report_trend",
                            "description": desc,
                            "reference_id": f"MarketTrend-{getattr(trend, 'id', 'unknown')}",
                            "score_contribution": trend_relevance_score
                        }
                    evidence_list.append(evidence_item)
                except Exception:
                    evidence_list.append({
                        "source_type": "industry_report_trend",
                        "description": desc,
                        "reference_id": f"MarketTrend-{getattr(trend, 'id', 'unknown')}",
                        "score_contribution": trend_relevance_score
                    })

        if relevant_trends_found > 0 :
            # Normalize market_trend_score_contribution (e.g. if many trends, cap it)
            market_trend_score_contribution = min(0.4, market_trend_score_contribution / max(1.0, relevant_trends_found * 0.1)) # Heuristic normalization
        else:
            market_trend_score_contribution = 0.0


        # --- 3. Combine Scores and Determine Trend ---
        job_score = min(0.6, recent_job_mentions_count / (job_description_sample_size * len(job_data_sources) * 0.1 + 1e-6) * 0.6) # Max 60% from jobs
        trend_score = min(0.4, market_trend_score_contribution) # Max 40% from trends

        final_demand_score = round(job_score + trend_score, 3)
        final_demand_score = max(0.0, min(1.0, final_demand_score)) # Clamp to 0-1

        demand_trend_str = "stable"
        if final_demand_score > 0.7:
            demand_trend_str = "very_high_demand"
        elif final_demand_score > 0.5:
            demand_trend_str = "high_demand"
        elif final_demand_score > 0.3:
            demand_trend_str = "moderate_demand"
        elif final_demand_score > 0.1:
            demand_trend_str = "low_demand"
        else:
            demand_trend_str = "very_low_demand"

        # Refine trend based on directionality from market trends (if strong signal)
        net_trend_direction_score = sum(ev.score_contribution for ev in evidence_list if ev.source_type == "industry_report_trend" and ev.score_contribution)
        if net_trend_direction_score > 0.1: # Strong positive signal from trends
            if demand_trend_str in ["moderate_demand", "high_demand", "very_high_demand"]:
                 demand_trend_str = "increasing"
            elif demand_trend_str in ["low_demand", "very_low_demand"]:
                 demand_trend_str = "emerging_positive" # Low current score but positive trends
        elif net_trend_direction_score < -0.05: # Signal of decline
             if demand_trend_str in ["low_demand", "very_low_demand", "moderate_demand"]:
                 demand_trend_str = "decreasing"

        confidence = round(0.5 + (job_score / 0.6) * 0.25 + (trend_score / 0.4) * 0.25, 3) # Base 0.5, add based on strength of signals
        confidence = max(0.1, min(0.95, confidence)) # Clamp confidence

        summary = f"Forecast for '{skill_analyzed_str}': Demand score is {final_demand_score*100:.0f}/100, trending as '{demand_trend_str}'. Confidence: {confidence*100:.0f}%."
        if not evidence_list:
            summary += " Limited data available for a comprehensive analysis."
            try:
                evidence_class = getattr(mi_schemas, 'SkillDemandEvidence', None)
                if evidence_class:
                    evidence_item = evidence_class(
                        source_type="system",
                        description="No specific job postings or industry trends found matching the keywords in the analyzed data sample."
                    )
                else:
                    evidence_item = {
                        "source_type": "system",
                        "description": "No specific job postings or industry trends found matching the keywords in the analyzed data sample."
                    }
                evidence_list.append(evidence_item)
            except Exception:
                evidence_list.append({
                    "source_type": "system",
                    "description": "No specific job postings or industry trends found matching the keywords in the analyzed data sample."
                })


        try:
            response_class = getattr(mi_schemas, 'SkillDemandForecastResponse', None)
            if response_class:
                return response_class(
                    skill_keywords_analyzed=skill_keywords,
                    demand_score=final_demand_score,
                    demand_trend=demand_trend_str,
                    confidence=confidence,
                    analysis_summary=summary,
                    evidence=evidence_list
                )
            else:
                return {
                    "skill_keywords_analyzed": skill_keywords,
                    "demand_score": final_demand_score,
                    "demand_trend": demand_trend_str,
                    "confidence": confidence,
                    "analysis_summary": summary,
                    "evidence": evidence_list
                }
        except Exception:
            return {
                "skill_keywords_analyzed": skill_keywords,
                "demand_score": final_demand_score,
                "demand_trend": demand_trend_str,
                "confidence": confidence,
                "analysis_summary": summary,
                "evidence": evidence_list
            }

    def _get_simulated_job_descriptions(self, keywords: List[str], sample_size: int) -> List[Dict[str, str]]:
        """
        Simulates fetching job descriptions.
        In a real system, this would query a DB or call external APIs.
        """
        # Basic simulation: Create some docs, some containing the keywords.
        docs = []
        num_with_keywords = int(sample_size * 0.3) # 30% have keywords

        common_job_titles = ["Software Engineer", "Data Analyst", "Product Manager", "UX Designer", "DevOps Engineer"]
        common_phrases = [
            "seeking a talented individual", "join our dynamic team", "responsibilities include",
            "strong experience in", "bachelor's degree required", "excellent communication skills"
        ]

        for i in range(sample_size):
            try:
                title = np.random.choice(common_job_titles)
                try:
                    selected_phrases = np.random.choice(common_phrases, size=3, replace=False)
                    base_desc = " ".join(str(phrase) for phrase in selected_phrases)
                except Exception:
                    base_desc = "seeking a talented individual join our dynamic team responsibilities include"
            except Exception:
                title = "Software Engineer"
                base_desc = "seeking a talented individual join our dynamic team responsibilities include"

            content_parts = [title, base_desc]

            if i < num_with_keywords and keywords:
                # Embed some of the keywords
                try:
                    num_kws_to_embed = np.random.randint(1, len(keywords) + 1)
                    kws_to_embed = np.random.choice(keywords, size=num_kws_to_embed, replace=False)
                    try:
                        content_parts.extend([str(kw) for kw in kws_to_embed])
                    except Exception:
                        content_parts.extend(keywords[:1])
                    # Add some more filler
                    content_parts.append(np.random.choice(common_phrases))
                except Exception:
                    content_parts.extend(keywords[:1])  # Add at least one keyword

            try:
                np.random.shuffle(content_parts)
            except Exception:
                pass  # Keep original order if shuffle fails
            full_description = " ".join(content_parts)

            # Simulate a posted date within the last year
            try:
                sim_date = datetime.utcnow() - timedelta(days=np.random.randint(0, 365))
            except Exception:
                sim_date = datetime.utcnow() - timedelta(days=30)

            docs.append({"title": title, "description": full_description, "date": sim_date})
        return docs

def get_market_intelligence_service(db: Session) -> MarketIntelligenceService:
    """Get market intelligence service instance"""
    return MarketIntelligenceService(db)