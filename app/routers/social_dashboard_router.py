"""
Social Dashboard API Router
Provides endpoints for the social networking dashboard including metrics, activity, and peer suggestions.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from ..models.social import UserConnection, PeerMatch, SocialMetrics  # UserSkill temporarily disabled
from ..models.user import User
from ..schemas.social import (
    SocialMetricsResponse,
    RecentActivityResponse,
    PeerSuggestionResponse,
    SocialDashboardResponse,
    EngagementLevel,
    ActivityType
)
from ..auth.dependencies import get_current_user
from ..database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/social", tags=["social-dashboard"])


def get_engagement_level(social_metrics) -> EngagementLevel:
    """Helper function to safely get engagement level from social metrics"""
    if not hasattr(social_metrics, 'engagement_level') or not social_metrics.engagement_level:
        return EngagementLevel.LOW
    
    engagement_str = str(social_metrics.engagement_level).lower()
    if engagement_str == "high":
        return EngagementLevel.HIGH
    elif engagement_str == "medium":
        return EngagementLevel.MEDIUM
    else:
        return EngagementLevel.LOW


@router.get("/dashboard", response_model=SocialDashboardResponse)
async def get_social_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive social dashboard data for the current user"""
    try:
        # Get or create social metrics
        social_metrics = db.query(SocialMetrics).filter(
            SocialMetrics.user_id == current_user.id
        ).first()
        
        if not social_metrics:
            # Create initial metrics if they don't exist
            social_metrics = SocialMetrics(
                user_id=current_user.id,
                total_connections=0,
                active_mentorships=0,
                learning_partnerships=0,
                knowledge_shared=0,
                collaboration_score=0,
                network_growth_rate=0.0,
                engagement_level="low"
            )
            db.add(social_metrics)
            db.commit()
            db.refresh(social_metrics)
        
        # Get recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Get recent connections
        recent_connections = db.query(UserConnection).filter(
            UserConnection.user_id == current_user.id,
            UserConnection.status == "connected",
            UserConnection.connected_at >= thirty_days_ago
        ).order_by(desc(UserConnection.connected_at)).limit(5).all()
        
        # Get peer suggestions (top matches not yet connected)
        existing_connections = db.query(UserConnection.connected_user_id).filter(
            UserConnection.user_id == current_user.id,
            UserConnection.status.in_(["connected", "pending"])
        ).subquery()
        
        peer_suggestions = db.query(PeerMatch).filter(
            PeerMatch.user_id == current_user.id,
            PeerMatch.status == "suggested",
            ~PeerMatch.matched_user_id.in_(existing_connections)
        ).order_by(desc(PeerMatch.compatibility_score)).limit(3).all()
        
        # Build response
        dashboard_data = SocialDashboardResponse(
            metrics=SocialMetricsResponse(
                total_connections=getattr(social_metrics, 'total_connections', 0),
                active_mentorships=getattr(social_metrics, 'active_mentorships', 0),
                learning_partnerships=getattr(social_metrics, 'learning_partnerships', 0),
                knowledge_shared=getattr(social_metrics, 'knowledge_shared', 0),
                collaboration_score=getattr(social_metrics, 'collaboration_score', 0),
                network_growth_rate=float(getattr(social_metrics, 'network_growth_rate', 0.0)),
                engagement_level=get_engagement_level(social_metrics),
                last_calculated=getattr(social_metrics, 'last_calculated', datetime.utcnow())
            ),
            recent_activity=[
                RecentActivityResponse(
                    id=str(conn.id),
                    type=ActivityType.CONNECTION,
                    title="New Connection",
                    description=f"Connected with {conn.connected_user.username}",
                    timestamp=conn.connected_at,
                    user_name=conn.connected_user.username,
                    user_avatar=None
                ) for conn in recent_connections
            ],
            peer_suggestions=[
                PeerSuggestionResponse(
                    id=str(match.id),
                    user_id=str(match.matched_user_id),
                    name=match.matched_user.username,
                    title=getattr(match.matched_user.profile, 'bio', 'Professional') if match.matched_user.profile else 'Professional',
                    company="TechCorp",  # TODO: Add company field to user profile
                    compatibility_score=float(match.compatibility_score),
                    shared_skills=match.match_factors.get('shared_skills', []) if match.match_factors else [],
                    avatar=None
                ) for match in peer_suggestions
            ]
        )
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Error fetching social dashboard data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch social dashboard data"
        )


@router.get("/metrics", response_model=SocialMetricsResponse)
async def get_social_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get social metrics for the current user"""
    try:
        social_metrics = db.query(SocialMetrics).filter(
            SocialMetrics.user_id == current_user.id
        ).first()
        
        if not social_metrics:
            # Return default metrics if none exist
            return SocialMetricsResponse(
                total_connections=0,
                active_mentorships=0,
                learning_partnerships=0,
                knowledge_shared=0,
                collaboration_score=0,
                network_growth_rate=0.0,
                engagement_level=EngagementLevel.LOW,
                last_calculated=datetime.utcnow()
            )
        
        return SocialMetricsResponse(
            total_connections=getattr(social_metrics, 'total_connections', 0),
            active_mentorships=getattr(social_metrics, 'active_mentorships', 0),
            learning_partnerships=getattr(social_metrics, 'learning_partnerships', 0),
            knowledge_shared=getattr(social_metrics, 'knowledge_shared', 0),
            collaboration_score=getattr(social_metrics, 'collaboration_score', 0),
            network_growth_rate=float(getattr(social_metrics, 'network_growth_rate', 0.0)),
            engagement_level=get_engagement_level(social_metrics),
            last_calculated=getattr(social_metrics, 'last_calculated', datetime.utcnow())
        )
        
    except Exception as e:
        logger.error(f"Error fetching social metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch social metrics"
        )


@router.get("/activity", response_model=List[RecentActivityResponse])
async def get_recent_activity(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent social activity for the current user"""
    try:
        # Get recent connections
        recent_connections = db.query(UserConnection).filter(
            UserConnection.user_id == current_user.id,
            UserConnection.status == "connected"
        ).order_by(desc(UserConnection.connected_at)).limit(limit).all()
        
        activity = []
        for conn in recent_connections:
            activity.append(RecentActivityResponse(
                id=str(conn.id),
                type=ActivityType.CONNECTION,
                title="New Connection",
                description=f"Connected with {conn.connected_user.username}",
                timestamp=conn.connected_at,
                user_name=conn.connected_user.username,
                user_avatar=None
            ))
        
        return activity
        
    except Exception as e:
        logger.error(f"Error fetching recent activity: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recent activity"
        )


@router.get("/peer-suggestions", response_model=List[PeerSuggestionResponse])
async def get_peer_suggestions(
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get peer suggestions for the current user"""
    try:
        # Get existing connections to exclude
        existing_connections = db.query(UserConnection.connected_user_id).filter(
            UserConnection.user_id == current_user.id,
            UserConnection.status.in_(["connected", "pending"])
        ).subquery()
        
        # Get peer suggestions
        peer_suggestions = db.query(PeerMatch).filter(
            PeerMatch.user_id == current_user.id,
            PeerMatch.status == "suggested",
            ~PeerMatch.matched_user_id.in_(existing_connections)
        ).order_by(desc(PeerMatch.compatibility_score)).limit(limit).all()
        
        suggestions = []
        for match in peer_suggestions:
            suggestions.append(PeerSuggestionResponse(
                id=str(match.id),
                user_id=str(match.matched_user_id),
                name=match.matched_user.username,
                title=getattr(match.matched_user.profile, 'bio', 'Professional') if match.matched_user.profile else 'Professional',
                company="TechCorp",  # TODO: Add company field to user profile
                compatibility_score=float(match.compatibility_score),
                shared_skills=match.match_factors.get('shared_skills', []) if match.match_factors else [],
                avatar=None
            ))
        
        return suggestions
        
    except Exception as e:
        logger.error(f"Error fetching peer suggestions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch peer suggestions"
        )


@router.post("/refresh-metrics")
async def refresh_social_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Refresh social metrics for the current user"""
    try:
        # Calculate current metrics
        total_connections = db.query(UserConnection).filter(
            UserConnection.user_id == current_user.id,
            UserConnection.status == "connected"
        ).count()
        
        # TODO: Add calculations for other metrics when mentorship and learning features are implemented
        active_mentorships = 0
        learning_partnerships = 0
        knowledge_shared = 0
        
        # Simple collaboration score calculation
        collaboration_score = min(100, (total_connections * 2) + (knowledge_shared * 5))
        
        # Calculate network growth rate (last 30 days vs previous 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        sixty_days_ago = datetime.utcnow() - timedelta(days=60)
        
        recent_connections = db.query(UserConnection).filter(
            UserConnection.user_id == current_user.id,
            UserConnection.status == "connected",
            UserConnection.connected_at >= thirty_days_ago
        ).count()
        
        previous_connections = db.query(UserConnection).filter(
            UserConnection.user_id == current_user.id,
            UserConnection.status == "connected",
            UserConnection.connected_at >= sixty_days_ago,
            UserConnection.connected_at < thirty_days_ago
        ).count()
        
        network_growth_rate = 0.0
        if previous_connections > 0:
            network_growth_rate = ((recent_connections - previous_connections) / previous_connections) * 100
        elif recent_connections > 0:
            network_growth_rate = 100.0
        
        # Determine engagement level
        engagement_level = "low"
        if collaboration_score >= 80:
            engagement_level = "high"
        elif collaboration_score >= 50:
            engagement_level = "medium"
        
        # Update or create metrics
        social_metrics = db.query(SocialMetrics).filter(
            SocialMetrics.user_id == current_user.id
        ).first()
        
        if social_metrics:
            social_metrics.total_connections = total_connections
            social_metrics.active_mentorships = active_mentorships
            social_metrics.learning_partnerships = learning_partnerships
            social_metrics.knowledge_shared = knowledge_shared
            social_metrics.collaboration_score = collaboration_score
            social_metrics.network_growth_rate = network_growth_rate
            social_metrics.engagement_level = engagement_level
            social_metrics.last_calculated = datetime.utcnow()
        else:
            social_metrics = SocialMetrics(
                user_id=current_user.id,
                total_connections=total_connections,
                active_mentorships=active_mentorships,
                learning_partnerships=learning_partnerships,
                knowledge_shared=knowledge_shared,
                collaboration_score=collaboration_score,
                network_growth_rate=network_growth_rate,
                engagement_level=engagement_level,
                last_calculated=datetime.utcnow()
            )
            db.add(social_metrics)
        
        db.commit()
        
        return {"message": "Social metrics refreshed successfully"}
        
    except Exception as e:
        logger.error(f"Error refreshing social metrics: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh social metrics"
        )