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
from ..models.user import User
from ..models.tenant import Tenant


class MarketIntelligenceService:
    """Service for market intelligence and competitive analysis"""

    def __init__(self, db: Session):
        self.db = db

    # Market Trends Management
    def create_market_trend(
        self,
        tenant_id: int,
        trend_data: Dict[str, Any],
        created_by_user_id: int
    ) -> MarketTrend:
        """Create a new market trend"""
        
        trend = MarketTrend(
            tenant_id=tenant_id,
            trend_name=trend_data["trend_name"],
            display_name=trend_data["display_name"],
            description=trend_data.get("description"),
            industry=trend_data["industry"],
            category=trend_data["category"],
            trend_type=trend_data["trend_type"],
            impact_level=trend_data["impact_level"],
            confidence_score=trend_data.get("confidence_score", 0.0),
            growth_rate=trend_data.get("growth_rate"),
            market_size=Decimal(str(trend_data.get("market_size", 0))) if trend_data.get("market_size") else None,
            adoption_rate=trend_data.get("adoption_rate"),
            maturity_stage=trend_data.get("maturity_stage"),
            period_start=trend_data["period_start"],
            period_end=trend_data["period_end"],
            forecast_horizon=trend_data.get("forecast_horizon"),
            data_sources=trend_data.get("data_sources", []),
            analysis_methods=trend_data.get("analysis_methods", []),
            key_indicators=trend_data.get("key_indicators", {}),
            supporting_data=trend_data.get("supporting_data", {}),
            geographic_scope=trend_data.get("geographic_scope", "global"),
            regions=trend_data.get("regions", []),
            created_by_user_id=created_by_user_id
        )
        
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
        trend_strength = trend.trend_strength
        
        # Generate impact analysis
        impact_analysis = {
            "trend_id": trend_id,
            "trend_name": trend.trend_name,
            "trend_strength": trend_strength,
            "impact_level": trend.impact_level,
            "confidence_score": trend.confidence_score,
            "requires_attention": trend.requires_attention,
            "is_emerging": trend.is_emerging,
            "market_implications": self._generate_market_implications(trend),
            "strategic_recommendations": self._generate_strategic_recommendations(trend),
            "risk_assessment": self._assess_trend_risks(trend),
            "opportunity_analysis": self._analyze_trend_opportunities(trend)
        }
        
        return impact_analysis

    def _generate_market_implications(self, trend: MarketTrend) -> List[str]:
        """Generate market implications for a trend"""
        implications = []
        
        if trend.trend_type == "emerging":
            implications.append("Early market opportunity for first movers")
            implications.append("High uncertainty but potential for significant returns")
        
        if trend.impact_level == "critical":
            implications.append("Industry-wide disruption expected")
            implications.append("Immediate strategic response required")
        
        if trend.growth_rate and trend.growth_rate > 20:
            implications.append("Rapid market expansion anticipated")
            implications.append("Increased competition likely")
        
        return implications

    def _generate_strategic_recommendations(self, trend: MarketTrend) -> List[str]:
        """Generate strategic recommendations for a trend"""
        recommendations = []
        
        if trend.is_emerging and trend.confidence_score > 0.7:
            recommendations.append("Consider early investment in this trend")
            recommendations.append("Develop pilot programs to test market response")
        
        if trend.impact_level in ["high", "critical"]:
            recommendations.append("Conduct detailed competitive analysis")
            recommendations.append("Assess internal capabilities and gaps")
        
        if trend.maturity_stage == "innovation":
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
        
        if trend.confidence_score < 0.5:
            risks["key_risks"].append("High uncertainty in trend prediction")
            risks["mitigation_strategies"].append("Gather additional market data")
        
        if trend.trend_type == "emerging":
            risks["key_risks"].append("Technology or market adoption may fail")
            risks["mitigation_strategies"].append("Diversify investments across multiple trends")
        
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
        
        if trend.market_size and float(trend.market_size) > 1000000:
            opportunities["market_size_potential"] = "high"
            opportunities["key_opportunities"].append("Large addressable market")
        
        if trend.adoption_rate and trend.adoption_rate < 20:
            opportunities["key_opportunities"].append("Early market with room for growth")
            opportunities["success_factors"].append("Speed to market")
        
        return opportunities

    # Competitive Analysis Management
    def create_competitive_analysis(
        self,
        tenant_id: int,
        analysis_data: Dict[str, Any],
        created_by_user_id: int
    ) -> CompetitiveAnalysis:
        """Create a new competitive analysis"""
        
        analysis = CompetitiveAnalysis(
            tenant_id=tenant_id,
            market_trend_id=analysis_data.get("market_trend_id"),
            analysis_name=analysis_data["analysis_name"],
            description=analysis_data.get("description"),
            industry=analysis_data["industry"],
            analysis_type=analysis_data["analysis_type"],
            primary_competitors=analysis_data.get("primary_competitors", []),
            secondary_competitors=analysis_data.get("secondary_competitors", []),
            emerging_competitors=analysis_data.get("emerging_competitors", []),
            market_position=analysis_data.get("market_position"),
            market_share=analysis_data.get("market_share"),
            competitive_advantage=analysis_data.get("competitive_advantage", []),
            competitive_threats=analysis_data.get("competitive_threats", []),
            strengths=analysis_data.get("strengths", []),
            weaknesses=analysis_data.get("weaknesses", []),
            opportunities=analysis_data.get("opportunities", []),
            threats=analysis_data.get("threats", []),
            competitive_rivalry=analysis_data.get("competitive_rivalry"),
            supplier_power=analysis_data.get("supplier_power"),
            buyer_power=analysis_data.get("buyer_power"),
            threat_of_substitution=analysis_data.get("threat_of_substitution"),
            threat_of_new_entry=analysis_data.get("threat_of_new_entry"),
            revenue_comparison=analysis_data.get("revenue_comparison", {}),
            profitability_metrics=analysis_data.get("profitability_metrics", {}),
            growth_metrics=analysis_data.get("growth_metrics", {}),
            product_comparison=analysis_data.get("product_comparison", {}),
            pricing_analysis=analysis_data.get("pricing_analysis", {}),
            innovation_metrics=analysis_data.get("innovation_metrics", {}),
            period_start=analysis_data["period_start"],
            period_end=analysis_data["period_end"],
            data_sources=analysis_data.get("data_sources", []),
            confidence_level=analysis_data.get("confidence_level", 0.0),
            data_completeness=analysis_data.get("data_completeness", 0.0),
            created_by_user_id=created_by_user_id
        )
        
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
            "overall_intensity": analysis.overall_competitive_intensity,
            "forces": {
                "competitive_rivalry": {
                    "score": analysis.competitive_rivalry,
                    "level": self._get_intensity_level(analysis.competitive_rivalry),
                    "factors": ["High number of competitors", "Market fragmentation"]
                },
                "supplier_power": {
                    "score": analysis.supplier_power,
                    "level": self._get_intensity_level(analysis.supplier_power),
                    "factors": ["Limited suppliers", "High switching costs"]
                },
                "buyer_power": {
                    "score": analysis.buyer_power,
                    "level": self._get_intensity_level(analysis.buyer_power),
                    "factors": ["Price sensitivity", "Low switching costs"]
                },
                "threat_of_substitution": {
                    "score": analysis.threat_of_substitution,
                    "level": self._get_intensity_level(analysis.threat_of_substitution),
                    "factors": ["Alternative technologies", "Changing preferences"]
                },
                "threat_of_new_entry": {
                    "score": analysis.threat_of_new_entry,
                    "level": self._get_intensity_level(analysis.threat_of_new_entry),
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
        
        intensity = analysis.overall_competitive_intensity
        
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
        
        if analysis.competitive_rivalry and analysis.competitive_rivalry >= 4.0:
            recommendations.append("Develop unique value proposition")
            recommendations.append("Focus on customer loyalty programs")
        
        if analysis.supplier_power and analysis.supplier_power >= 3.0:
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
            and_(
                MarketTrend.tenant_id == tenant_id,
                MarketTrend.trend_type == "emerging"
            )
        ).count()
        
        high_impact_trends = self.db.query(MarketTrend).filter(
            and_(
                MarketTrend.tenant_id == tenant_id,
                MarketTrend.impact_level.in_(["high", "critical"])
            )
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
            and_(
                IntelligenceReport.tenant_id == tenant_id,
                IntelligenceReport.report_date >= datetime.utcnow() - timedelta(days=30)
            )
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
                    and_(
                        CompetitiveAnalysis.tenant_id == tenant_id,
                        CompetitiveAnalysis.analysis_date >= datetime.utcnow() - timedelta(days=30)
                    )
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
        emerging_trends = [t for t in trends if t.is_emerging]
        
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
        high_intensity_markets = [a for a in analyses if a.overall_competitive_intensity > 3.5]
        
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


def get_market_intelligence_service(db: Session) -> MarketIntelligenceService:
    """Get market intelligence service instance"""
    return MarketIntelligenceService(db)