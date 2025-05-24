"""
Market Intelligence Reports and Data Collection service
"""

from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
import uuid
import json
import asyncio
import aiohttp
import requests
from bs4 import BeautifulSoup
import feedparser
from decimal import Decimal
import numpy as np

from ..models.market_intelligence import (
    IntelligenceReport, MarketDataSource, IndustryBenchmark,
    MarketTrend, CompetitiveAnalysis
)
from ..models.user import User
from ..models.tenant import Tenant


class MarketIntelligenceReportsService:
    """Service for intelligence reports and data collection"""

    def __init__(self, db: Session):
        self.db = db
        self.data_collectors = {
            "api": self._collect_api_data,
            "rss": self._collect_rss_data,
            "web_scraping": self._collect_web_data,
            "manual": self._collect_manual_data
        }

    # Intelligence Reports Management
    def create_intelligence_report(
        self,
        tenant_id: int,
        report_data: Dict[str, Any],
        created_by_user_id: int
    ) -> IntelligenceReport:
        """Create a new intelligence report"""
        
        report = IntelligenceReport(
            tenant_id=tenant_id,
            market_trend_id=report_data.get("market_trend_id"),
            report_name=report_data["report_name"],
            report_type=report_data["report_type"],
            description=report_data.get("description"),
            industry=report_data["industry"],
            executive_summary=report_data.get("executive_summary"),
            key_findings=report_data.get("key_findings", []),
            recommendations=report_data.get("recommendations", []),
            action_items=report_data.get("action_items", []),
            market_insights=report_data.get("market_insights", {}),
            competitive_insights=report_data.get("competitive_insights", {}),
            trend_predictions=report_data.get("trend_predictions", {}),
            risk_assessment=report_data.get("risk_assessment", {}),
            strategic_recommendations=report_data.get("strategic_recommendations", []),
            investment_implications=report_data.get("investment_implications", []),
            operational_impacts=report_data.get("operational_impacts", []),
            timeline_recommendations=report_data.get("timeline_recommendations", {}),
            confidence_score=report_data.get("confidence_score", 0.0),
            impact_score=report_data.get("impact_score", 0.0),
            urgency_score=report_data.get("urgency_score", 0.0),
            period_covered_start=report_data["period_covered_start"],
            period_covered_end=report_data["period_covered_end"],
            validity_period_days=report_data.get("validity_period_days", 90),
            data_sources=report_data.get("data_sources", []),
            analysis_methodology=report_data.get("analysis_methodology", {}),
            limitations=report_data.get("limitations", []),
            assumptions=report_data.get("assumptions", []),
            target_audience=report_data.get("target_audience", []),
            distribution_list=report_data.get("distribution_list", []),
            access_level=report_data.get("access_level", "internal"),
            created_by_user_id=created_by_user_id
        )
        
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        
        return report

    def get_intelligence_reports(
        self,
        tenant_id: int,
        report_type: Optional[str] = None,
        industry: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[IntelligenceReport]:
        """Get intelligence reports for tenant"""
        
        query = self.db.query(IntelligenceReport).filter(
            IntelligenceReport.tenant_id == tenant_id
        )
        
        if report_type:
            query = query.filter(IntelligenceReport.report_type == report_type)
        
        if industry:
            query = query.filter(IntelligenceReport.industry == industry)
        
        if status:
            query = query.filter(IntelligenceReport.status == status)
        
        return query.order_by(desc(IntelligenceReport.report_date)).limit(limit).all()

    def generate_automated_report(
        self,
        tenant_id: int,
        report_type: str,
        industry: str,
        created_by_user_id: int
    ) -> IntelligenceReport:
        """Generate an automated intelligence report"""
        
        # Gather data for the report
        trends = self._get_trends_for_report(tenant_id, industry)
        analyses = self._get_analyses_for_report(tenant_id, industry)
        
        # Generate report content
        report_content = self._generate_report_content(report_type, trends, analyses)
        
        # Create the report
        report_data = {
            "report_name": f"Automated {report_type.replace('_', ' ').title()} Report - {industry}",
            "report_type": report_type,
            "industry": industry,
            "executive_summary": report_content["executive_summary"],
            "key_findings": report_content["key_findings"],
            "recommendations": report_content["recommendations"],
            "market_insights": report_content["market_insights"],
            "competitive_insights": report_content["competitive_insights"],
            "confidence_score": report_content["confidence_score"],
            "impact_score": report_content["impact_score"],
            "urgency_score": report_content["urgency_score"],
            "period_covered_start": datetime.utcnow() - timedelta(days=90),
            "period_covered_end": datetime.utcnow(),
            "data_sources": ["market_trends", "competitive_analyses", "industry_benchmarks"]
        }
        
        return self.create_intelligence_report(tenant_id, report_data, created_by_user_id)

    def _get_trends_for_report(self, tenant_id: int, industry: str) -> List[MarketTrend]:
        """Get market trends for report generation"""
        return self.db.query(MarketTrend).filter(
            and_(
                MarketTrend.tenant_id == tenant_id,
                MarketTrend.industry == industry,
                MarketTrend.status == "active"
            )
        ).limit(10).all()

    def _get_analyses_for_report(self, tenant_id: int, industry: str) -> List[CompetitiveAnalysis]:
        """Get competitive analyses for report generation"""
        return self.db.query(CompetitiveAnalysis).filter(
            and_(
                CompetitiveAnalysis.tenant_id == tenant_id,
                CompetitiveAnalysis.industry == industry
            )
        ).limit(10).all()

    def _generate_report_content(
        self,
        report_type: str,
        trends: List[MarketTrend],
        analyses: List[CompetitiveAnalysis]
    ) -> Dict[str, Any]:
        """Generate content for automated reports"""
        
        content = {
            "executive_summary": "",
            "key_findings": [],
            "recommendations": [],
            "market_insights": {},
            "competitive_insights": {},
            "confidence_score": 0.0,
            "impact_score": 0.0,
            "urgency_score": 0.0
        }
        
        if report_type == "market_overview":
            content = self._generate_market_overview_content(trends, analyses)
        elif report_type == "competitive_landscape":
            content = self._generate_competitive_landscape_content(analyses)
        elif report_type == "trend_analysis":
            content = self._generate_trend_analysis_content(trends)
        
        return content

    def _generate_market_overview_content(
        self,
        trends: List[MarketTrend],
        analyses: List[CompetitiveAnalysis]
    ) -> Dict[str, Any]:
        """Generate market overview report content"""
        
        emerging_trends = [t for t in trends if t.trend_type == "emerging"]
        high_impact_trends = [t for t in trends if t.impact_level in ["high", "critical"]]
        
        content = {
            "executive_summary": f"Market analysis reveals {len(emerging_trends)} emerging trends and {len(high_impact_trends)} high-impact developments.",
            "key_findings": [
                f"Identified {len(trends)} market trends across the industry",
                f"{len(emerging_trends)} trends are in emerging stage with high growth potential",
                f"Average confidence score across trends: {np.mean([t.confidence_score for t in trends]):.2f}" if trends else "No trends available"
            ],
            "recommendations": [
                "Monitor emerging trends for early investment opportunities",
                "Develop strategic response to high-impact trends",
                "Increase market intelligence gathering frequency"
            ],
            "market_insights": {
                "total_trends": len(trends),
                "emerging_trends": len(emerging_trends),
                "high_impact_trends": len(high_impact_trends)
            },
            "competitive_insights": {
                "total_analyses": len(analyses),
                "average_competitive_intensity": np.mean([a.overall_competitive_intensity for a in analyses if a.overall_competitive_intensity]) if analyses else 0.0
            },
            "confidence_score": 0.8,
            "impact_score": 0.7,
            "urgency_score": 0.6
        }
        
        return content

    def _generate_competitive_landscape_content(self, analyses: List[CompetitiveAnalysis]) -> Dict[str, Any]:
        """Generate competitive landscape report content"""
        
        return {
            "executive_summary": f"Competitive analysis of {len(analyses)} market analyses reveals varying competitive intensity.",
            "key_findings": [
                f"Analyzed {len(analyses)} competitive scenarios",
                "Market position varies significantly across segments"
            ],
            "recommendations": [
                "Focus on differentiation strategies",
                "Monitor competitive moves closely"
            ],
            "market_insights": {},
            "competitive_insights": {
                "total_analyses": len(analyses)
            },
            "confidence_score": 0.75,
            "impact_score": 0.8,
            "urgency_score": 0.7
        }

    def _generate_trend_analysis_content(self, trends: List[MarketTrend]) -> Dict[str, Any]:
        """Generate trend analysis report content"""
        
        return {
            "executive_summary": f"Trend analysis of {len(trends)} market trends shows significant opportunities.",
            "key_findings": [
                f"Tracked {len(trends)} market trends",
                "Several trends show high growth potential"
            ],
            "recommendations": [
                "Invest in emerging trend research",
                "Develop trend monitoring capabilities"
            ],
            "market_insights": {
                "total_trends": len(trends)
            },
            "competitive_insights": {},
            "confidence_score": 0.7,
            "impact_score": 0.75,
            "urgency_score": 0.65
        }

    # Data Sources Management
    def create_data_source(
        self,
        tenant_id: int,
        source_data: Dict[str, Any],
        created_by_user_id: int
    ) -> MarketDataSource:
        """Create a new market data source"""
        
        source = MarketDataSource(
            tenant_id=tenant_id,
            source_name=source_data["source_name"],
            source_type=source_data["source_type"],
            description=source_data.get("description"),
            provider=source_data.get("provider"),
            endpoint_url=source_data.get("endpoint_url"),
            api_key=source_data.get("api_key"),
            authentication_method=source_data.get("authentication_method"),
            headers=source_data.get("headers", {}),
            parameters=source_data.get("parameters", {}),
            data_format=source_data["data_format"],
            extraction_rules=source_data.get("extraction_rules", {}),
            transformation_rules=source_data.get("transformation_rules", {}),
            update_frequency=source_data.get("update_frequency", "daily"),
            reliability_score=source_data.get("reliability_score", 0.0),
            data_quality_score=source_data.get("data_quality_score", 0.0),
            industries_covered=source_data.get("industries_covered", []),
            geographic_coverage=source_data.get("geographic_coverage", []),
            data_categories=source_data.get("data_categories", []),
            is_active=source_data.get("is_active", True),
            is_automated=source_data.get("is_automated", True),
            requires_approval=source_data.get("requires_approval", False),
            cost_per_request=Decimal(str(source_data.get("cost_per_request", 0))) if source_data.get("cost_per_request") else None,
            monthly_request_limit=source_data.get("monthly_request_limit"),
            created_by_user_id=created_by_user_id
        )
        
        self.db.add(source)
        self.db.commit()
        self.db.refresh(source)
        
        return source

    def get_data_sources(
        self,
        tenant_id: int,
        source_type: Optional[str] = None,
        active_only: bool = True
    ) -> List[MarketDataSource]:
        """Get market data sources for tenant"""
        
        query = self.db.query(MarketDataSource).filter(
            MarketDataSource.tenant_id == tenant_id
        )
        
        if active_only:
            query = query.filter(MarketDataSource.is_active == True)
        
        if source_type:
            query = query.filter(MarketDataSource.source_type == source_type)
        
        return query.order_by(desc(MarketDataSource.reliability_score)).all()

    # Data Collection
    async def collect_market_data(self, source_id: int) -> Dict[str, Any]:
        """Collect data from a market data source"""
        
        source = self.db.query(MarketDataSource).filter(
            MarketDataSource.id == source_id
        ).first()
        
        if not source or not source.is_active:
            raise ValueError("Data source not found or inactive")
        
        collector = self.data_collectors.get(source.source_type)
        if not collector:
            raise ValueError(f"Unsupported source type: {source.source_type}")
        
        try:
            data = await collector(source)
            source.record_fetch_attempt(True)
            self.db.commit()
            return data
            
        except Exception as e:
            source.record_fetch_attempt(False, str(e))
            self.db.commit()
            raise

    async def _collect_api_data(self, source: MarketDataSource) -> Dict[str, Any]:
        """Collect data from API source"""
        
        headers = source.headers or {}
        if source.api_key:
            headers["Authorization"] = f"Bearer {source.api_key}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                source.endpoint_url,
                headers=headers,
                params=source.parameters
            ) as response:
                if response.status == 200:
                    if source.data_format == "json":
                        return await response.json()
                    else:
                        return {"raw_data": await response.text()}
                else:
                    raise Exception(f"API request failed with status {response.status}")

    async def _collect_rss_data(self, source: MarketDataSource) -> Dict[str, Any]:
        """Collect data from RSS feed"""
        
        feed = feedparser.parse(source.endpoint_url)
        
        return {
            "feed_title": feed.feed.get("title", ""),
            "entries": [
                {
                    "title": entry.get("title", ""),
                    "summary": entry.get("summary", ""),
                    "link": entry.get("link", ""),
                    "published": entry.get("published", "")
                }
                for entry in feed.entries[:10]  # Limit to 10 entries
            ]
        }

    async def _collect_web_data(self, source: MarketDataSource) -> Dict[str, Any]:
        """Collect data from web scraping"""
        
        response = requests.get(source.endpoint_url)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Basic text extraction
        return {
            "title": soup.title.string if soup.title else "",
            "text_content": soup.get_text()[:1000],  # Limit text length
            "links": [a.get('href') for a in soup.find_all('a', href=True)][:10]
        }

    async def _collect_manual_data(self, source: MarketDataSource) -> Dict[str, Any]:
        """Handle manual data collection"""
        
        return {
            "message": "Manual data collection required",
            "source_name": source.source_name,
            "instructions": "Please manually input data for this source"
        }

    # Industry Benchmarks
    def create_industry_benchmark(
        self,
        tenant_id: int,
        benchmark_data: Dict[str, Any],
        created_by_user_id: int
    ) -> IndustryBenchmark:
        """Create a new industry benchmark"""
        
        benchmark = IndustryBenchmark(
            tenant_id=tenant_id,
            benchmark_name=benchmark_data["benchmark_name"],
            description=benchmark_data.get("description"),
            industry=benchmark_data["industry"],
            sub_industry=benchmark_data.get("sub_industry"),
            metric_name=benchmark_data["metric_name"],
            metric_type=benchmark_data["metric_type"],
            measurement_unit=benchmark_data["measurement_unit"],
            calculation_method=benchmark_data.get("calculation_method"),
            median_value=benchmark_data["median_value"],
            mean_value=benchmark_data.get("mean_value"),
            percentile_25=benchmark_data.get("percentile_25"),
            percentile_75=benchmark_data.get("percentile_75"),
            percentile_90=benchmark_data.get("percentile_90"),
            best_in_class=benchmark_data.get("best_in_class"),
            sample_size=benchmark_data["sample_size"],
            sample_description=benchmark_data.get("sample_description"),
            geographic_scope=benchmark_data.get("geographic_scope", "global"),
            company_size_range=benchmark_data.get("company_size_range"),
            period_start=benchmark_data["period_start"],
            period_end=benchmark_data["period_end"],
            confidence_level=benchmark_data.get("confidence_level", 0.0),
            data_sources=benchmark_data.get("data_sources", []),
            methodology=benchmark_data.get("methodology"),
            limitations=benchmark_data.get("limitations", []),
            created_by_user_id=created_by_user_id
        )
        
        self.db.add(benchmark)
        self.db.commit()
        self.db.refresh(benchmark)
        
        return benchmark

    def get_industry_benchmarks(
        self,
        tenant_id: int,
        industry: Optional[str] = None,
        metric_type: Optional[str] = None,
        active_only: bool = True
    ) -> List[IndustryBenchmark]:
        """Get industry benchmarks for tenant"""
        
        query = self.db.query(IndustryBenchmark).filter(
            IndustryBenchmark.tenant_id == tenant_id
        )
        
        if active_only:
            query = query.filter(IndustryBenchmark.status == "active")
        
        if industry:
            query = query.filter(IndustryBenchmark.industry == industry)
        
        if metric_type:
            query = query.filter(IndustryBenchmark.metric_type == metric_type)
        
        return query.order_by(desc(IndustryBenchmark.data_collection_date)).all()

    def compare_against_benchmark(
        self,
        benchmark_id: int,
        value: float
    ) -> Dict[str, Any]:
        """Compare a value against an industry benchmark"""
        
        benchmark = self.db.query(IndustryBenchmark).filter(
            IndustryBenchmark.id == benchmark_id
        ).first()
        
        if not benchmark:
            raise ValueError("Benchmark not found")
        
        return benchmark.compare_value(value)


def get_market_intelligence_reports_service(db: Session) -> MarketIntelligenceReportsService:
    """Get market intelligence reports service instance"""
    return MarketIntelligenceReportsService(db)