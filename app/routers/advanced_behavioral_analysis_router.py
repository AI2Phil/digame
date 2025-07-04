"""
Advanced Behavioral Analysis Router - Phase 3A Implementation
Priority 3: AI/ML Feature Finalization (90% → 95%)

RESTful API endpoints for advanced behavioral analysis capabilities
including deep learning insights, temporal pattern analysis, and predictive analytics.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
import logging

from ..database import get_db
from ..services.advanced_behavioral_analysis_service import AdvancedBehavioralAnalysisService
from ..auth.auth_dependencies import get_current_user
from ..models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/advanced-behavioral-analysis",
    tags=["Advanced Behavioral Analysis"]
)

def get_current_user_id(current_user: User = Depends(get_current_user)) -> int:
    """Extract user ID from current user."""
    return current_user.id

@router.post("/analyze")
async def analyze_deep_behavioral_patterns(
    analysis_depth: str = Query(
        default="comprehensive",
        description="Analysis depth level",
        regex="^(basic|standard|comprehensive)$"
    ),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """
    Perform comprehensive deep behavioral pattern analysis.
    
    This endpoint provides advanced behavioral insights including:
    - Deep learning behavioral models
    - Temporal pattern analysis (circadian, weekly, seasonal)
    - Behavioral cluster analysis with enhanced algorithms
    - Productivity pattern insights and optimization opportunities
    - Advanced anomaly detection with risk assessment
    - Predictive behavioral insights and forecasting
    - Behavioral evolution analysis over time
    - Context-aware pattern recognition
    - AI-powered behavioral recommendations
    
    Args:
        analysis_depth: Level of analysis depth
            - "basic": Core patterns and insights
            - "standard": Enhanced analysis with predictions
            - "comprehensive": Full deep learning analysis with all features
        
    Returns:
        Comprehensive behavioral analysis results with insights and recommendations
    """
    try:
        logger.info(f"Starting advanced behavioral analysis for user {current_user_id} with depth {analysis_depth}")
        
        # Initialize advanced behavioral analysis service
        analysis_service = AdvancedBehavioralAnalysisService(db)
        
        # Perform deep behavioral analysis
        analysis_results = await analysis_service.analyze_deep_behavioral_patterns(
            user_id=current_user_id,
            analysis_depth=analysis_depth
        )
        
        # Check for analysis errors
        if "error" in analysis_results:
            logger.error(f"Analysis failed for user {current_user_id}: {analysis_results['message']}")
            raise HTTPException(
                status_code=500,
                detail=f"Behavioral analysis failed: {analysis_results['message']}"
            )
        
        logger.info(f"Completed advanced behavioral analysis for user {current_user_id}")
        
        return {
            "success": True,
            "message": "Advanced behavioral analysis completed successfully",
            "analysis_results": analysis_results,
            "metadata": {
                "user_id": current_user_id,
                "analysis_depth": analysis_depth,
                "features_analyzed": [
                    "temporal_patterns",
                    "behavioral_clusters", 
                    "productivity_insights",
                    "anomaly_detection",
                    "predictive_insights",
                    "behavioral_evolution",
                    "context_awareness",
                    "ai_recommendations"
                ]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in advanced behavioral analysis for user {current_user_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during behavioral analysis"
        )

@router.get("/temporal-patterns")
async def get_temporal_patterns(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """
    Get detailed temporal pattern analysis including circadian rhythms,
    weekly patterns, and seasonal variations.
    
    Returns:
        Comprehensive temporal pattern analysis with insights
    """
    try:
        analysis_service = AdvancedBehavioralAnalysisService(db)
        
        # Get latest behavioral model
        from ..services.behavior_service import get_latest_behavior_model_for_user
        behavioral_model = get_latest_behavior_model_for_user(db, current_user_id)
        
        if not behavioral_model:
            raise HTTPException(
                status_code=404,
                detail="No behavioral model found. Please use the platform more to build behavioral patterns."
            )
        
        # Analyze temporal patterns
        temporal_analysis = await analysis_service._analyze_temporal_patterns(
            current_user_id, behavioral_model
        )
        
        return {
            "success": True,
            "temporal_patterns": temporal_analysis,
            "insights": temporal_analysis.get("temporal_insights", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting temporal patterns for user {current_user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze temporal patterns")

@router.get("/productivity-insights")
async def get_productivity_insights(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """
    Get advanced productivity pattern analysis with optimization recommendations.
    
    Returns:
        Detailed productivity insights and optimization opportunities
    """
    try:
        analysis_service = AdvancedBehavioralAnalysisService(db)
        
        # Analyze productivity patterns
        productivity_analysis = await analysis_service._analyze_productivity_patterns(current_user_id)
        
        return {
            "success": True,
            "productivity_insights": productivity_analysis,
            "optimization_score": productivity_analysis.get("optimization_potential", 0.0),
            "current_productivity": productivity_analysis.get("current_productivity_score", 0.0)
        }
        
    except Exception as e:
        logger.error(f"Error getting productivity insights for user {current_user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze productivity patterns")

@router.get("/anomaly-detection")
async def detect_behavioral_anomalies(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """
    Detect behavioral anomalies and assess risk levels.
    
    Returns:
        Anomaly detection results with risk assessment and insights
    """
    try:
        analysis_service = AdvancedBehavioralAnalysisService(db)
        
        # Detect behavioral anomalies
        anomaly_analysis = await analysis_service._detect_behavioral_anomalies(current_user_id)
        
        return {
            "success": True,
            "anomaly_detection": anomaly_analysis,
            "risk_level": "high" if anomaly_analysis.get("anomaly_risk_score", 0) > 0.7 else 
                         "medium" if anomaly_analysis.get("anomaly_risk_score", 0) > 0.3 else "low",
            "total_anomalies": anomaly_analysis.get("total_anomalies", 0)
        }
        
    except Exception as e:
        logger.error(f"Error detecting anomalies for user {current_user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to detect behavioral anomalies")

@router.get("/predictive-insights")
async def get_predictive_insights(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """
    Generate predictive insights and behavioral forecasts.
    
    Returns:
        Predictive analysis results with behavioral forecasts and recommendations
    """
    try:
        analysis_service = AdvancedBehavioralAnalysisService(db)
        
        # Generate predictive insights
        predictive_analysis = await analysis_service._generate_predictive_insights(current_user_id)
        
        return {
            "success": True,
            "predictive_insights": predictive_analysis,
            "prediction_confidence": predictive_analysis.get("prediction_confidence", 0.0),
            "actionable_predictions": predictive_analysis.get("actionable_predictions", [])
        }
        
    except Exception as e:
        logger.error(f"Error generating predictive insights for user {current_user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate predictive insights")

@router.get("/behavioral-evolution")
async def get_behavioral_evolution(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """
    Analyze how user behavior has evolved over time.
    
    Returns:
        Behavioral evolution analysis with maturity assessment and insights
    """
    try:
        analysis_service = AdvancedBehavioralAnalysisService(db)
        
        # Analyze behavioral evolution
        evolution_analysis = await analysis_service._analyze_behavioral_evolution(current_user_id)
        
        return {
            "success": True,
            "behavioral_evolution": evolution_analysis,
            "evolution_velocity": evolution_analysis.get("evolution_velocity", 0.0),
            "evolution_direction": evolution_analysis.get("evolution_direction", "stable"),
            "behavioral_maturity": evolution_analysis.get("behavioral_maturity", 0.0)
        }
        
    except Exception as e:
        logger.error(f"Error analyzing behavioral evolution for user {current_user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze behavioral evolution")

@router.get("/context-patterns")
async def get_context_patterns(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """
    Analyze context-aware behavioral patterns including context switching,
    project patterns, and multitasking behavior.
    
    Returns:
        Context pattern analysis with efficiency metrics and insights
    """
    try:
        analysis_service = AdvancedBehavioralAnalysisService(db)
        
        # Analyze context patterns
        context_analysis = await analysis_service._analyze_context_patterns(current_user_id)
        
        return {
            "success": True,
            "context_patterns": context_analysis,
            "context_efficiency": context_analysis.get("context_efficiency", 0.0),
            "context_insights": context_analysis.get("context_insights", [])
        }
        
    except Exception as e:
        logger.error(f"Error analyzing context patterns for user {current_user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze context patterns")

@router.get("/behavioral-recommendations")
async def get_behavioral_recommendations(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """
    Get AI-powered behavioral recommendations for optimization.
    
    Returns:
        Prioritized behavioral recommendations with reasoning and confidence scores
    """
    try:
        analysis_service = AdvancedBehavioralAnalysisService(db)
        
        # Generate behavioral recommendations
        recommendations = await analysis_service._generate_behavioral_recommendations(current_user_id)
        
        # Categorize recommendations
        high_priority = [r for r in recommendations if r.get("priority") == "high"]
        medium_priority = [r for r in recommendations if r.get("priority") == "medium"]
        low_priority = [r for r in recommendations if r.get("priority") == "low"]
        
        return {
            "success": True,
            "recommendations": recommendations,
            "summary": {
                "total_recommendations": len(recommendations),
                "high_priority_count": len(high_priority),
                "medium_priority_count": len(medium_priority),
                "low_priority_count": len(low_priority)
            },
            "top_recommendations": recommendations[:5]  # Top 5 recommendations
        }
        
    except Exception as e:
        logger.error(f"Error generating behavioral recommendations for user {current_user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate behavioral recommendations")

@router.get("/behavioral-health-score")
async def get_behavioral_health_score(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """
    Get overall behavioral health score and assessment.
    
    Returns:
        Behavioral health score with component breakdown and insights
    """
    try:
        analysis_service = AdvancedBehavioralAnalysisService(db)
        
        # Perform basic analysis to get health score
        analysis_results = await analysis_service.analyze_deep_behavioral_patterns(
            user_id=current_user_id,
            analysis_depth="basic"
        )
        
        health_score = analysis_results.get("behavioral_health_score", 0.5)
        
        # Determine health level
        if health_score >= 0.8:
            health_level = "excellent"
        elif health_score >= 0.6:
            health_level = "good"
        elif health_score >= 0.4:
            health_level = "fair"
        else:
            health_level = "needs_improvement"
        
        return {
            "success": True,
            "behavioral_health_score": health_score,
            "health_level": health_level,
            "score_breakdown": {
                "pattern_stability": analysis_results.get("temporal_patterns", {}).get("pattern_stability", {}).get("overall_stability", 0.5),
                "productivity_score": analysis_results.get("productivity_insights", {}).get("current_productivity_score", 0.5),
                "anomaly_risk": 1.0 - analysis_results.get("anomaly_detection", {}).get("anomaly_risk_score", 0.5)
            },
            "recommendations_count": len(analysis_results.get("recommendations", []))
        }
        
    except Exception as e:
        logger.error(f"Error calculating behavioral health score for user {current_user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to calculate behavioral health score")