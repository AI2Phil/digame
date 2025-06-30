"""
Enhanced onboarding service with database persistence and analytics
"""

import datetime
from typing import Dict, Optional, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from app.models.onboarding_persistence import (
    UserOnboardingProgress, 
    OnboardingAnalytics, 
    OnboardingMetrics,
    OnboardingFeedback
)
from app.models.onboarding_models import (
    UserOnboardingStatus, 
    OnboardingStep, 
    OnboardingStepUpdate, 
    OnboardingPreferencesUpdate
)
from app.database import get_db


class EnhancedOnboardingService:
    """
    Enhanced onboarding service with database persistence and analytics
    """
    
    ONBOARDING_STEP_SEQUENCE = [
        "welcome", 
        "profile_info", 
        "goal_setting", 
        "preferences", 
        "features", 
        "final_summary"
    ]

    def __init__(self, db: Session) -> None:
        self.db = db

    async def get_user_onboarding_status(self, user_id: int) -> UserOnboardingStatus:
        """Get user onboarding status from database"""
        progress = self.db.query(UserOnboardingProgress).filter(
            UserOnboardingProgress.user_id == user_id  # type: ignore
        ).first()  # type: ignore
        
        if not progress:
            # Create new onboarding progress record
            progress = UserOnboardingProgress()  # type: ignore
            setattr(progress, 'user_id', user_id)  # type: ignore
            setattr(progress, 'current_step_id', self.ONBOARDING_STEP_SEQUENCE[0])  # type: ignore
            setattr(progress, 'completed_steps', [])  # type: ignore
            setattr(progress, 'step_data', {})  # type: ignore
            setattr(progress, 'preferences', {})  # type: ignore
            setattr(progress, 'onboarding_customizations', {})  # type: ignore
            
            self.db.add(progress)
            self.db.commit()
            self.db.refresh(progress)

        # Convert to Pydantic model
        steps = []
        completed_steps = getattr(progress, 'completed_steps', None) or []
        step_data = getattr(progress, 'step_data', None) or {}
        
        for step_id in self.ONBOARDING_STEP_SEQUENCE:
            is_completed = step_id in completed_steps
            current_step_data = step_data.get(step_id) if isinstance(step_data, dict) else None
            steps.append(OnboardingStep(
                step_id=step_id,
                completed=is_completed,
                data=current_step_data
            ))

        return UserOnboardingStatus(
            user_id=str(user_id),
            current_step_id=progress.current_step_id,
            completed_all=progress.completed_all,
            last_updated=progress.last_updated,
            steps=steps,
            preferences=progress.preferences or {}
        )

    async def update_onboarding_step(
        self, 
        user_id: int, 
        step_update: OnboardingStepUpdate,
        analytics_data: Optional[Dict[str, Any]] = None
    ) -> UserOnboardingStatus:
        """Update onboarding step with analytics tracking"""
        
        # Get or create progress record
        progress = self.db.query(UserOnboardingProgress).filter(
            UserOnboardingProgress.user_id == user_id
        ).first()
        
        if not progress:
            progress = UserOnboardingProgress()
            setattr(progress, 'user_id', user_id)  # type: ignore
            setattr(progress, 'current_step_id', self.ONBOARDING_STEP_SEQUENCE[0])  # type: ignore
            setattr(progress, 'completed_steps', [])  # type: ignore
            setattr(progress, 'step_data', {})  # type: ignore
            setattr(progress, 'preferences', {})  # type: ignore
            setattr(progress, 'onboarding_customizations', {})  # type: ignore
            self.db.add(progress)

        # Update step completion
        completed_steps = list(getattr(progress, 'completed_steps', None) or [])
        if step_update.step_id not in completed_steps:
            completed_steps.append(step_update.step_id)
            setattr(progress, 'completed_steps', completed_steps)  # type: ignore
        
        # Update step data
        if step_update.data:
            step_data = dict(getattr(progress, 'step_data', None) or {})  # type: ignore
            step_data[step_update.step_id] = step_update.data  # type: ignore
            setattr(progress, 'step_data', step_data)  # type: ignore

        # Calculate completion percentage
        completed_count = len([s for s in completed_steps if s in self.ONBOARDING_STEP_SEQUENCE])
        setattr(progress, 'completion_percentage', (completed_count / len(self.ONBOARDING_STEP_SEQUENCE)) * 100)  # type: ignore

        # Check if all steps completed
        all_completed = all(step in completed_steps for step in self.ONBOARDING_STEP_SEQUENCE)
        setattr(progress, 'completed_all', all_completed)  # type: ignore
        
        if all_completed and not progress.completed_at:
            setattr(progress, 'completed_at', datetime.datetime.utcnow())  # type: ignore

        # Update current step
        if not all_completed:
            try:
                current_idx = self.ONBOARDING_STEP_SEQUENCE.index(step_update.step_id)
                if current_idx + 1 < len(self.ONBOARDING_STEP_SEQUENCE):
                    next_step = self.ONBOARDING_STEP_SEQUENCE[current_idx + 1]
                    if next_step not in completed_steps:
                        setattr(progress, 'current_step_id', next_step)  # type: ignore
                    else:
                        # Find first incomplete step
                        for step_id in self.ONBOARDING_STEP_SEQUENCE:
                            if step_id not in completed_steps:
                                setattr(progress, 'current_step_id', step_id)  # type: ignore
                                break
                        else:
                            setattr(progress, 'current_step_id', None)  # type: ignore
                else:
                    setattr(progress, 'current_step_id', None)  # type: ignore
            except ValueError:
                pass
        else:
            setattr(progress, 'current_step_id', None)  # type: ignore

        setattr(progress, 'last_updated', datetime.datetime.utcnow())  # type: ignore
        
        # Track analytics
        await self._track_step_analytics(
            user_id=user_id,
            step_id=step_update.step_id,
            step_data=step_update.data,
            analytics_data=analytics_data
        )

        self.db.commit()
        self.db.refresh(progress)

        return await self.get_user_onboarding_status(user_id)

    async def update_user_preferences(
        self, 
        user_id: int, 
        preferences_update: OnboardingPreferencesUpdate
    ) -> UserOnboardingStatus:
        """Update user preferences during onboarding"""
        
        progress = self.db.query(UserOnboardingProgress).filter(
            UserOnboardingProgress.user_id == user_id
        ).first()
        
        if not progress:
            progress = UserOnboardingProgress()
            setattr(progress, 'user_id', user_id)  # type: ignore
            setattr(progress, 'preferences', preferences_update.preferences)  # type: ignore
            self.db.add(progress)
        else:
            # Merge preferences
            current_prefs = dict(progress.preferences or {})
            current_prefs.update(getattr(preferences_update, 'preferences', {}))
            setattr(progress, 'preferences', current_prefs)  # type: ignore
            setattr(progress, 'last_updated', datetime.datetime.utcnow())  # type: ignore

        self.db.commit()
        self.db.refresh(progress)

        return await self.get_user_onboarding_status(user_id)

    async def _track_step_analytics(
        self,
        user_id: int,
        step_id: str,
        step_data: Optional[Dict[str, Any]] = None,
        analytics_data: Optional[Dict[str, Any]] = None
    ):
        """Track analytics for onboarding step completion"""
        
        # Get or create analytics record for this step
        analytics = self.db.query(OnboardingAnalytics).filter(
            and_(
                OnboardingAnalytics.user_id == user_id,
                OnboardingAnalytics.step_id == step_id,
                OnboardingAnalytics.completed_successfully == False
            )
        ).first()

        if not analytics:
            analytics = OnboardingAnalytics()
            setattr(analytics, 'user_id', user_id)  # type: ignore
            setattr(analytics, 'step_id', step_id)  # type: ignore
            setattr(analytics, 'step_name', step_id.replace('_', ' ').title())  # type: ignore
            setattr(analytics, 'step_started_at', datetime.datetime.utcnow())  # type: ignore
            self.db.add(analytics)

        # Mark as completed
        setattr(analytics, 'step_completed_at', datetime.datetime.utcnow())  # type: ignore
        setattr(analytics, 'completed_successfully', True)  # type: ignore
        setattr(analytics, 'completion_method', 'completed')  # type: ignore
        
        if analytics.step_started_at:
            time_diff = analytics.step_completed_at - analytics.step_started_at
            setattr(analytics, 'time_spent_seconds', int(time_diff.total_seconds()))  # type: ignore

        # Add analytics data if provided
        if analytics_data:
            analytics.clicks_count = analytics_data.get('clicks_count', 0)
            analytics.form_submissions = analytics_data.get('form_submissions', 0)
            analytics.help_requests = analytics_data.get('help_requests', 0)
            analytics.skip_actions = analytics_data.get('skip_actions', 0)
            setattr(analytics, 'device_type', analytics_data.get('device_type'))  # type: ignore
            setattr(analytics, 'browser_info', analytics_data.get('browser_info'))  # type: ignore
            setattr(analytics, 'screen_resolution', analytics_data.get('screen_resolution'))  # type: ignore
            analytics.interaction_data = analytics_data.get('interaction_data', {})
            analytics.errors_encountered = analytics_data.get('errors_encountered', [])

        self.db.commit()

    async def get_onboarding_analytics(
        self, 
        user_id: Optional[int] = None,
        period_days: int = 30
    ) -> Dict[str, Any]:
        """Get onboarding analytics and metrics"""
        
        start_date = datetime.datetime.utcnow() - datetime.timedelta(days=period_days)
        
        query = self.db.query(OnboardingAnalytics).filter(
            OnboardingAnalytics.created_at >= start_date
        )
        
        if user_id:
            query = query.filter(OnboardingAnalytics.user_id == user_id)
        
        analytics_records = query.all()
        
        # Calculate metrics
        total_steps = len(analytics_records)
        completed_steps = len([a for a in analytics_records if a.completed_successfully])
        completion_rate = (completed_steps / total_steps) if total_steps > 0 else 0
        
        # Average time per step
        completed_with_time = [a for a in analytics_records if a.time_spent_seconds is not None]
        avg_time = sum(a.time_spent_seconds for a in completed_with_time) / len(completed_with_time) if completed_with_time else 0
        
        # Step-specific metrics
        step_metrics = {}
        for step_id in self.ONBOARDING_STEP_SEQUENCE:
            step_records = [a for a in analytics_records if a.step_id == step_id]
            step_completed = len([a for a in step_records if a.completed_successfully])
            step_total = len(step_records)
            
            step_metrics[step_id] = {
                'completion_rate': (step_completed / step_total) if step_total > 0 else 0,
                'total_attempts': step_total,
                'completed': step_completed,
                'average_time': sum(a.time_spent_seconds or 0 for a in step_records if a.completed_successfully) / step_completed if step_completed > 0 else 0
            }

        return {
            'period_days': period_days,
            'total_steps_attempted': total_steps,
            'total_steps_completed': completed_steps,
            'overall_completion_rate': completion_rate,
            'average_time_per_step_seconds': avg_time,
            'step_metrics': step_metrics,
            'user_count': len(set(a.user_id for a in analytics_records))
        }

    async def get_user_completion_metrics(self, user_id: int) -> Dict[str, Any]:
        """Get completion metrics for a specific user"""
        
        progress = self.db.query(UserOnboardingProgress).filter(
            UserOnboardingProgress.user_id == user_id
        ).first()
        
        if not progress:
            return {
                'user_id': user_id,
                'completion_percentage': 0,
                'completed_steps': 0,
                'total_steps': len(self.ONBOARDING_STEP_SEQUENCE),
                'is_completed': False,
                'time_to_complete': None
            }

        analytics = self.db.query(OnboardingAnalytics).filter(
            OnboardingAnalytics.user_id == user_id
        ).all()

        total_time = sum(a.time_spent_seconds or 0 for a in analytics)
        
        return {
            'user_id': user_id,
            'completion_percentage': progress.completion_percentage,
            'completed_steps': len(progress.completed_steps or []),
            'total_steps': len(self.ONBOARDING_STEP_SEQUENCE),
            'is_completed': progress.completed_all,
            'time_to_complete': total_time,
            'started_at': progress.started_at,
            'completed_at': progress.completed_at,
            'current_step': progress.current_step_id
        }

    async def save_user_feedback(
        self,
        user_id: int,
        rating: int,
        feedback_text: Optional[str] = None,
        step_id: Optional[str] = None,
        feedback_categories: Optional[Dict[str, Any]] = None
    ):
        """Save user feedback for onboarding experience"""
        
        feedback = OnboardingFeedback()
        setattr(feedback, 'user_id', user_id)  # type: ignore
        setattr(feedback, 'step_id', step_id)  # type: ignore
        setattr(feedback, 'rating', rating)  # type: ignore
        setattr(feedback, 'feedback_text', feedback_text)  # type: ignore
        
        if feedback_categories:
            setattr(feedback, 'ease_of_use', feedback_categories.get('ease_of_use'))  # type: ignore
            setattr(feedback, 'clarity', feedback_categories.get('clarity'))  # type: ignore
            setattr(feedback, 'usefulness', feedback_categories.get('usefulness'))  # type: ignore
            setattr(feedback, 'suggested_improvements', feedback_categories.get('suggested_improvements'))  # type: ignore
            setattr(feedback, 'would_recommend', feedback_categories.get('would_recommend'))  # type: ignore
        
        self.db.add(feedback)
        self.db.commit()
        self.db.refresh(feedback)
        
        return feedback

    async def get_dashboard_integration_data(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive dashboard data for onboarding integration"""
        
        # Get user progress
        progress = self.db.query(UserOnboardingProgress).filter(
            UserOnboardingProgress.user_id == user_id
        ).first()
        
        # Get user analytics
        analytics = self.db.query(OnboardingAnalytics).filter(
            OnboardingAnalytics.user_id == user_id
        ).all()
        
        # Get recent metrics
        recent_metrics = self.db.query(OnboardingMetrics).order_by(
            OnboardingMetrics.calculated_at.desc()
        ).first()
        
        # Calculate user-specific insights
        user_insights = {
            'onboarding_status': 'completed' if progress and progress.completed_all else 'in_progress' if progress else 'not_started',
            'completion_percentage': progress.completion_percentage if progress else 0,
            'current_step': progress.current_step_id if progress else None,
            'time_spent_total': sum(a.time_spent_seconds or 0 for a in analytics),
            'steps_completed': len(progress.completed_steps or []) if progress else 0,
            'total_steps': len(self.ONBOARDING_STEP_SEQUENCE),
            'user_preferences': progress.preferences if progress else {},
            'completion_date': progress.completed_at if progress else None,
            'started_date': progress.started_at if progress else None
        }
        
        # Platform-wide insights
        platform_insights = {
            'overall_completion_rate': recent_metrics.completion_rate if recent_metrics else 0,
            'average_completion_time': recent_metrics.average_completion_time_minutes if recent_metrics else 0,
            'most_challenging_step': None,
            'user_satisfaction': 0
        }
        
        if recent_metrics and recent_metrics.step_completion_rates:
            # Find step with lowest completion rate
            step_rates = recent_metrics.step_completion_rates
            if isinstance(step_rates, dict):
                min_step = min(step_rates.items(), key=lambda x: x[1], default=(None, 0))
                platform_insights['most_challenging_step'] = min_step[0]
        
        return {
            'user_insights': user_insights,
            'platform_insights': platform_insights,
            'recommendations': self._generate_recommendations(user_insights, platform_insights),
            'next_actions': self._get_next_actions(progress)
        }
    
    def _generate_recommendations(self, user_insights: Dict, platform_insights: Dict) -> List[str]:
        """Generate personalized recommendations based on user and platform data"""
        recommendations = []
        
        if user_insights['onboarding_status'] == 'not_started':
            recommendations.append("Start your onboarding journey to unlock all platform features")
        elif user_insights['onboarding_status'] == 'in_progress':
            if user_insights['completion_percentage'] < 50:
                recommendations.append("Continue your onboarding to access more features")
            else:
                recommendations.append("You're almost done! Complete the remaining steps")
        else:
            recommendations.append("Explore advanced features now that onboarding is complete")
            
        if platform_insights['most_challenging_step'] and user_insights['current_step'] == platform_insights['most_challenging_step']:
            recommendations.append("This step is commonly challenging - take your time and use help resources")
            
        return recommendations
    
    def _get_next_actions(self, progress) -> List[str]:
        """Get recommended next actions for the user"""
        if not progress:
            return ["Begin onboarding process"]
        
        if progress.completed_all:
            return ["Explore dashboard features", "Set up your first project", "Connect with peers"]
        
        if progress.current_step_id:
            step_name = progress.current_step_id.replace('_', ' ').title()
            return [f"Complete {step_name} step", "Save progress", "Continue to next step"]
        
        return ["Resume onboarding process"]


def get_enhanced_onboarding_service(db: Session = next(get_db())):
    """Dependency to get enhanced onboarding service"""
    return EnhancedOnboardingService(db)