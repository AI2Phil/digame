"""
Guest Experience Optimization Service
Phase 3: Advanced Personalization and Experience Enhancement
"""

import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from ..models.user import User
from ..models.guest_onboarding import GuestOnboardingProgress, DigitalTwinProfile
from ..services.digital_twin_onboarding_service import DigitalTwinOnboardingService


class GuestExperienceService:
    """Service for optimizing guest user experience with advanced personalization"""
    
    def __init__(self, db: Session):
        self.db = db
        self.onboarding_service = DigitalTwinOnboardingService(db)
    
    def get_personalized_dashboard(self, user_id: int) -> Dict[str, Any]:
        """
        Generate personalized dashboard content based on user profile and behavior
        
        Features:
        - Personalized recommendations
        - Progress insights
        - Next steps suggestions
        - Content curation
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        profile = self.db.query(DigitalTwinProfile).filter(
            DigitalTwinProfile.user_id == user_id
        ).first()
        
        progress = self.db.query(GuestOnboardingProgress).filter(
            GuestOnboardingProgress.user_id == user_id
        ).first()
        
        # Generate personalized content
        dashboard_data = {
            "user_context": self._get_user_context(user, profile, progress),
            "personalized_recommendations": self._generate_recommendations(user, profile),
            "learning_path": self._create_learning_path(profile),
            "progress_insights": self._analyze_progress(progress, profile),
            "next_actions": self._suggest_next_actions(user, profile, progress),
            "content_feed": self._curate_content_feed(profile),
            "achievement_tracking": self._track_achievements(user, profile, progress),
            "social_connections": self._suggest_connections(profile),
            "time_optimization": self._optimize_time_usage(user, progress)
        }
        
        return dashboard_data
    
    def _get_user_context(self, user: User, profile: Optional[DigitalTwinProfile], 
                         progress: Optional[GuestOnboardingProgress]) -> Dict[str, Any]:
        """Get comprehensive user context for personalization"""
        context = {
            "user_type": "guest" if getattr(user, 'is_guest', False) else "full",
            "days_since_registration": (datetime.utcnow() - getattr(user, 'created_at', datetime.utcnow())).days,
            "onboarding_completion": getattr(progress, 'completion_percentage', 0) if progress else 0,
            "profile_completeness": getattr(profile, 'profile_completeness_score', 0) if profile else 0,
            "engagement_level": self._calculate_engagement_level(user, progress),
            "preferred_learning_style": self._infer_learning_style(profile),
            "activity_pattern": self._analyze_activity_pattern(user),
            "goals_alignment": self._assess_goals_alignment(profile)
        }
        
        return context
    
    def _generate_recommendations(self, user: User, profile: Optional[DigitalTwinProfile]) -> List[Dict[str, Any]]:
        """Generate personalized recommendations based on user profile"""
        recommendations = []
        
        if not profile:
            recommendations.append({
                "type": "onboarding",
                "priority": "high",
                "title": "Complete Your Digital Twin Profile",
                "description": "Unlock personalized features by completing your profile setup",
                "action": "start_onboarding",
                "estimated_time": "10 minutes",
                "benefits": ["Personalized content", "Better recommendations", "Skill tracking"]
            })
            return recommendations
        
        # Skills-based recommendations
        technical_skills = getattr(profile, 'technical_skills', None)
        if technical_skills:
            try:
                skills = json.loads(technical_skills)
                recommendations.extend(self._recommend_skill_development(skills))
            except:
                pass
        
        # Career-based recommendations
        professional_title = getattr(profile, 'professional_title', None)
        industry = getattr(profile, 'industry', None)
        if professional_title and industry:
            recommendations.extend(self._recommend_career_content(
                professional_title, industry
            ))
        
        # Learning path recommendations
        learning_interests = getattr(profile, 'learning_interests', None)
        if learning_interests:
            try:
                interests = json.loads(learning_interests)
                recommendations.extend(self._recommend_learning_resources(interests))
            except:
                pass
        
        # Goal-based recommendations
        short_term_goals = getattr(profile, 'short_term_goals', None)
        if short_term_goals:
            try:
                goals = json.loads(short_term_goals)
                recommendations.extend(self._recommend_goal_actions(goals))
            except:
                pass
        
        return recommendations[:10]  # Limit to top 10 recommendations
    
    def _recommend_skill_development(self, skills: List[str]) -> List[Dict[str, Any]]:
        """Recommend skill development opportunities"""
        recommendations = []
        
        # Skill gap analysis
        skill_categories = {
            "Programming": ["Python", "JavaScript", "Java", "C++", "Go"],
            "Web Development": ["React", "Vue.js", "Angular", "Node.js", "HTML/CSS"],
            "Data Science": ["Machine Learning", "Data Analysis", "SQL", "R", "Pandas"],
            "Cloud": ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes"],
            "Mobile": ["React Native", "Flutter", "iOS", "Android", "Swift"]
        }
        
        for category, category_skills in skill_categories.items():
            user_skills_in_category = [s for s in skills if s in category_skills]
            if len(user_skills_in_category) > 0 and len(user_skills_in_category) < 3:
                missing_skills = [s for s in category_skills if s not in skills][:2]
                if missing_skills:
                    recommendations.append({
                        "type": "skill_development",
                        "priority": "medium",
                        "title": f"Expand Your {category} Skills",
                        "description": f"Learn {', '.join(missing_skills)} to complement your {category} expertise",
                        "action": "explore_courses",
                        "skills": missing_skills,
                        "category": category
                    })
        
        return recommendations
    
    def _recommend_career_content(self, title: str, industry: str) -> List[Dict[str, Any]]:
        """Recommend career-specific content"""
        recommendations = []
        
        # Industry trends
        recommendations.append({
            "type": "industry_insights",
            "priority": "medium",
            "title": f"Latest Trends in {industry}",
            "description": f"Stay updated with the latest developments in {industry}",
            "action": "read_insights",
            "category": "industry_trends"
        })
        
        # Role-specific content
        recommendations.append({
            "type": "role_development",
            "priority": "medium",
            "title": f"Advanced {title} Techniques",
            "description": f"Enhance your {title} skills with advanced techniques and best practices",
            "action": "explore_techniques",
            "category": "professional_development"
        })
        
        return recommendations
    
    def _recommend_learning_resources(self, interests: List[str]) -> List[Dict[str, Any]]:
        """Recommend learning resources based on interests"""
        recommendations = []
        
        learning_paths = {
            "Artificial Intelligence": {
                "title": "AI Fundamentals Learning Path",
                "description": "Master the basics of AI and machine learning",
                "modules": ["Introduction to AI", "Machine Learning Basics", "Neural Networks"]
            },
            "Web Development": {
                "title": "Full-Stack Web Development",
                "description": "Become a complete web developer",
                "modules": ["Frontend Frameworks", "Backend APIs", "Database Design"]
            },
            "Data Science": {
                "title": "Data Science Mastery",
                "description": "Learn data analysis and visualization",
                "modules": ["Data Analysis", "Statistical Modeling", "Data Visualization"]
            }
        }
        
        for interest in interests:
            if interest in learning_paths:
                path = learning_paths[interest]
                recommendations.append({
                    "type": "learning_path",
                    "priority": "high",
                    "title": path["title"],
                    "description": path["description"],
                    "action": "start_learning_path",
                    "modules": path["modules"],
                    "interest": interest
                })
        
        return recommendations
    
    def _recommend_goal_actions(self, goals: List[str]) -> List[Dict[str, Any]]:
        """Recommend actions based on user goals"""
        recommendations = []
        
        goal_actions = {
            "Learn new programming language": {
                "title": "Start Your Programming Journey",
                "description": "Choose a programming language and begin with fundamentals",
                "action": "select_language",
                "next_steps": ["Choose language", "Find resources", "Practice coding"]
            },
            "Get promoted": {
                "title": "Career Advancement Strategy",
                "description": "Develop skills and strategies for career growth",
                "action": "career_planning",
                "next_steps": ["Skill assessment", "Leadership training", "Network building"]
            },
            "Switch careers": {
                "title": "Career Transition Plan",
                "description": "Navigate your career change with structured planning",
                "action": "transition_planning",
                "next_steps": ["Skills gap analysis", "Industry research", "Portfolio building"]
            }
        }
        
        for goal in goals:
            if goal in goal_actions:
                action = goal_actions[goal]
                recommendations.append({
                    "type": "goal_action",
                    "priority": "high",
                    "title": action["title"],
                    "description": action["description"],
                    "action": action["action"],
                    "next_steps": action["next_steps"],
                    "goal": goal
                })
        
        return recommendations
    
    def _create_learning_path(self, profile: Optional[DigitalTwinProfile]) -> Dict[str, Any]:
        """Create personalized learning path"""
        if not profile:
            return {
                "status": "not_available",
                "message": "Complete your profile to get a personalized learning path"
            }
        
        learning_path = {
            "current_level": self._assess_skill_level(profile),
            "recommended_duration": "3-6 months",
            "milestones": self._generate_learning_milestones(profile),
            "weekly_commitment": "5-10 hours",
            "progress_tracking": {
                "completed_modules": 0,
                "total_modules": 12,
                "current_module": "Getting Started"
            }
        }
        
        return learning_path
    
    def _analyze_progress(self, progress: Optional[GuestOnboardingProgress], 
                         profile: Optional[DigitalTwinProfile]) -> Dict[str, Any]:
        """Analyze user progress and provide insights"""
        if not progress:
            return {"status": "no_progress", "message": "Start your onboarding to track progress"}
        
        insights = {
            "completion_rate": progress.completion_percentage,
            "time_spent": self._calculate_time_spent(progress),
            "engagement_score": self._calculate_engagement_score(progress),
            "strengths": self._identify_strengths(profile),
            "improvement_areas": self._identify_improvement_areas(profile),
            "comparison": self._compare_with_peers(profile),
            "predictions": self._predict_success_factors(progress, profile)
        }
        
        return insights
    
    def _suggest_next_actions(self, user: User, profile: Optional[DigitalTwinProfile], 
                            progress: Optional[GuestOnboardingProgress]) -> List[Dict[str, Any]]:
        """Suggest immediate next actions for the user"""
        actions = []
        
        # Onboarding completion
        if not progress or progress.completion_percentage < 100:
            actions.append({
                "type": "onboarding",
                "priority": "high",
                "title": "Complete Your Profile Setup",
                "description": "Finish setting up your digital twin profile",
                "action": "continue_onboarding",
                "estimated_time": "5 minutes"
            })
        
        # Profile enhancement
        if profile and getattr(profile, 'profile_completeness_score', 0) < 80:
            actions.append({
                "type": "profile_enhancement",
                "priority": "medium",
                "title": "Enhance Your Profile",
                "description": "Add more details to improve personalization",
                "action": "update_profile",
                "estimated_time": "10 minutes"
            })
        
        # Skill assessment
        if profile and not getattr(profile, 'skill_confidence_scores', None):
            actions.append({
                "type": "skill_assessment",
                "priority": "medium",
                "title": "Take Skill Assessment",
                "description": "Assess your skills to get better recommendations",
                "action": "start_assessment",
                "estimated_time": "15 minutes"
            })
        
        # Account upgrade (for guests)
        if getattr(user, 'is_guest', False):
            days_left = 30 - (datetime.utcnow() - getattr(user, 'created_at', datetime.utcnow())).days
            if days_left <= 7:
                actions.append({
                    "type": "account_upgrade",
                    "priority": "high",
                    "title": "Upgrade Your Account",
                    "description": f"Only {days_left} days left in your guest period",
                    "action": "upgrade_account",
                    "urgency": "high"
                })
        
        return actions
    
    def _curate_content_feed(self, profile: Optional[DigitalTwinProfile]) -> List[Dict[str, Any]]:
        """Curate personalized content feed"""
        content_feed = []
        
        # Default content for users without profiles
        if not profile:
            content_feed.extend([
                {
                    "type": "article",
                    "title": "Getting Started with Digital Twins",
                    "description": "Learn how digital twins can accelerate your career",
                    "category": "introduction",
                    "read_time": "5 min"
                },
                {
                    "type": "video",
                    "title": "Platform Overview",
                    "description": "Quick tour of platform features",
                    "category": "tutorial",
                    "duration": "3 min"
                }
            ])
            return content_feed
        
        # Personalized content based on profile
        technical_skills = getattr(profile, 'technical_skills', None)
        if technical_skills:
            try:
                skills = json.loads(technical_skills)
                for skill in skills[:3]:  # Top 3 skills
                    content_feed.append({
                        "type": "article",
                        "title": f"Advanced {skill} Techniques",
                        "description": f"Latest developments in {skill}",
                        "category": "skill_development",
                        "skill": skill,
                        "read_time": "8 min"
                    })
            except:
                pass
        
        # Industry-specific content
        industry = getattr(profile, 'industry', None)
        if industry:
            content_feed.append({
                "type": "report",
                "title": f"{industry} Industry Report 2024",
                "description": "Latest trends and insights",
                "category": "industry_insights",
                "read_time": "12 min"
            })
        
        return content_feed
    
    def _track_achievements(self, user: User, profile: Optional[DigitalTwinProfile], 
                          progress: Optional[GuestOnboardingProgress]) -> Dict[str, Any]:
        """Track user achievements and milestones"""
        achievements = {
            "unlocked": [],
            "available": [],
            "progress": {}
        }
        
        # Registration achievement
        first_achievement = {
            "id": "first_steps",
            "title": "First Steps",
            "description": "Successfully registered on the platform",
            "date_unlocked": getattr(user, 'created_at', datetime.utcnow()).isoformat(),
            "points": 10
        }
        getattr(achievements, 'get', lambda x, default: default)('unlocked', []).append(first_achievement)  # type: ignore
        
        # Onboarding achievements
        if progress and getattr(progress, 'completion_percentage', 0) >= 50:
            halfway_achievement = {
                "id": "halfway_there",
                "title": "Halfway There",
                "description": "Completed 50% of onboarding",
                "date_unlocked": getattr(progress, 'last_activity_at', datetime.utcnow()).isoformat(),
                "points": 25
            }
            getattr(achievements, 'get', lambda x, default: default)('unlocked', []).append(halfway_achievement)  # type: ignore
        
        if progress and getattr(progress, 'completion_percentage', 0) >= 100:
            completed_at = getattr(progress, 'completed_at', None)
            date_unlocked = completed_at.isoformat() if completed_at else datetime.utcnow().isoformat()
            complete_achievement = {
                "id": "onboarding_complete",
                "title": "Onboarding Master",
                "description": "Completed full onboarding process",
                "date_unlocked": date_unlocked,
                "points": 50
            }
            getattr(achievements, 'get', lambda x, default: default)('unlocked', []).append(complete_achievement)  # type: ignore
        
        # Profile achievements
        if profile and getattr(profile, 'profile_completeness_score', 0) >= 80:
            profile_achievement = {
                "id": "profile_expert",
                "title": "Profile Expert",
                "description": "Achieved 80% profile completeness",
                "points": 30
            }
            getattr(achievements, 'get', lambda x, default: default)('unlocked', []).append(profile_achievement)  # type: ignore
        
        # Available achievements
        if not progress or getattr(progress, 'completion_percentage', 0) < 100:
            available_achievement = {
                "id": "onboarding_complete",
                "title": "Onboarding Master",
                "description": "Complete the full onboarding process",
                "points": 50,
                "progress": getattr(progress, 'completion_percentage', 0) if progress else 0
            }
            getattr(achievements, 'get', lambda x, default: default)('available', []).append(available_achievement)  # type: ignore
        
        return achievements
    
    def _suggest_connections(self, profile: Optional[DigitalTwinProfile]) -> List[Dict[str, Any]]:
        """Suggest potential connections based on profile similarity"""
        if not profile:
            return []
        
        # Find users with similar profiles
        profile_id = getattr(profile, 'id', None)
        industry = getattr(profile, 'industry', None)
        
        # Simple query without and_() to avoid type issues
        if profile_id is not None and industry is not None:
            similar_users = self.db.query(DigitalTwinProfile).filter(
                DigitalTwinProfile.id != profile_id
            ).filter(
                DigitalTwinProfile.industry == industry
            ).limit(5).all()
        else:
            similar_users = []
        
        connections = []
        for similar_profile in similar_users:
            user_id = getattr(similar_profile, 'user_id', None)
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                first_name = getattr(user, 'first_name', '') or ''
                last_name = getattr(user, 'last_name', '') or ''
                username = getattr(user, 'username', '')
                connections.append({
                    "user_id": getattr(user, 'id', None),
                    "name": f"{first_name} {last_name}".strip() or username,
                    "title": getattr(similar_profile, 'professional_title', None),
                    "industry": getattr(similar_profile, 'industry', None),
                    "similarity_score": self._calculate_similarity_score(profile, similar_profile),
                    "connection_reason": "Similar industry and role"
                })
        
        return connections
    
    def _optimize_time_usage(self, user: User, progress: Optional[GuestOnboardingProgress]) -> Dict[str, Any]:
        """Provide time optimization suggestions"""
        optimization = {
            "daily_recommendation": "15-20 minutes",
            "best_times": ["9:00 AM", "2:00 PM", "7:00 PM"],
            "weekly_schedule": {
                "Monday": "Profile updates",
                "Wednesday": "Skill practice",
                "Friday": "Progress review"
            },
            "efficiency_tips": [
                "Set specific learning goals",
                "Use focused time blocks",
                "Track your progress regularly"
            ]
        }
        
        if progress:
            time_spent = self._calculate_time_spent(progress)
            optimization["current_pace"] = f"{time_spent} minutes/week"
            completion_percentage = getattr(progress, 'completion_percentage', 0)
            efficiency_calc = (completion_percentage / max(1, time_spent)) * 10
            setattr(optimization, 'efficiency_score', min(100.0, efficiency_calc))  # type: ignore
        
        return optimization
    
    # Helper methods
    def _calculate_engagement_level(self, user: User, progress: Optional[GuestOnboardingProgress]) -> str:
        """Calculate user engagement level"""
        if not progress:
            return "new"
        
        started_at = getattr(progress, 'started_at', datetime.utcnow())
        days_since_start = (datetime.utcnow() - started_at).days
        completion_percentage = getattr(progress, 'completion_percentage', 0)
        completion_rate = completion_percentage / max(1, days_since_start)
        
        if completion_rate > 20:
            return "high"
        elif completion_rate > 10:
            return "medium"
        else:
            return "low"
    
    def _infer_learning_style(self, profile: Optional[DigitalTwinProfile]) -> str:
        """Infer learning style from profile data"""
        if not profile:
            return "unknown"
        
        # Simple heuristic based on communication style
        communication_style = getattr(profile, 'communication_style', None)
        if communication_style:
            if "visual" in communication_style.lower():
                return "visual"
            elif "hands-on" in communication_style.lower():
                return "kinesthetic"
            else:
                return "auditory"
        
        return "mixed"
    
    def _analyze_activity_pattern(self, user: User) -> str:
        """Analyze user activity pattern"""
        # Simple pattern based on registration time
        created_at = getattr(user, 'created_at', datetime.utcnow())
        hour = created_at.hour
        if 6 <= hour < 12:
            return "morning"
        elif 12 <= hour < 18:
            return "afternoon"
        else:
            return "evening"
    
    def _assess_goals_alignment(self, profile: Optional[DigitalTwinProfile]) -> float:
        """Assess alignment between goals and current profile"""
        short_term_goals = getattr(profile, 'short_term_goals', None)
        if not profile or not short_term_goals:
            return 0.0
        
        # Simple alignment score based on profile completeness
        profile_completeness_score = getattr(profile, 'profile_completeness_score', 0)
        return min(1.0, profile_completeness_score / 100)
    
    def _assess_skill_level(self, profile: DigitalTwinProfile) -> str:
        """Assess overall skill level"""
        experience_level = getattr(profile, 'experience_level', None)
        if experience_level:
            if "senior" in experience_level.lower():
                return "advanced"
            elif "mid" in experience_level.lower():
                return "intermediate"
            else:
                return "beginner"
        return "beginner"
    
    def _generate_learning_milestones(self, profile: DigitalTwinProfile) -> List[Dict[str, Any]]:
        """Generate learning milestones"""
        milestones = [
            {"title": "Foundation Skills", "duration": "2 weeks", "status": "available"},
            {"title": "Intermediate Concepts", "duration": "4 weeks", "status": "locked"},
            {"title": "Advanced Techniques", "duration": "6 weeks", "status": "locked"},
            {"title": "Specialization", "duration": "4 weeks", "status": "locked"}
        ]
        return milestones
    
    def _calculate_time_spent(self, progress: GuestOnboardingProgress) -> int:
        """Calculate estimated time spent"""
        last_activity_at = getattr(progress, 'last_activity_at', datetime.utcnow())
        started_at = getattr(progress, 'started_at', datetime.utcnow())
        days_active = (last_activity_at - started_at).days + 1
        return days_active * 15  # Estimate 15 minutes per day
    
    def _calculate_engagement_score(self, progress: GuestOnboardingProgress) -> float:
        """Calculate engagement score"""
        started_at = getattr(progress, 'started_at', datetime.utcnow())
        days_since_start = (datetime.utcnow() - started_at).days + 1
        expected_progress = min(100, days_since_start * 10)  # 10% per day expected
        completion_percentage = getattr(progress, 'completion_percentage', 0)
        return min(1.0, completion_percentage / expected_progress)
    
    def _identify_strengths(self, profile: Optional[DigitalTwinProfile]) -> List[str]:
        """Identify user strengths"""
        if not profile:
            return []
        
        strengths = []
        if getattr(profile, 'technical_skills', None):
            strengths.append("Technical Skills")
        if getattr(profile, 'communication_style', None):
            strengths.append("Communication")
        if getattr(profile, 'profile_completeness_score', 0) > 70:
            strengths.append("Profile Completion")
        
        return strengths
    
    def _identify_improvement_areas(self, profile: Optional[DigitalTwinProfile]) -> List[str]:
        """Identify areas for improvement"""
        if not profile:
            return ["Complete profile setup"]
        
        areas = []
        if not getattr(profile, 'soft_skills', None):
            areas.append("Soft Skills Assessment")
        if not getattr(profile, 'learning_interests', None):
            areas.append("Learning Interests")
        if getattr(profile, 'profile_completeness_score', 0) < 80:
            areas.append("Profile Completeness")
        
        return areas
    
    def _compare_with_peers(self, profile: Optional[DigitalTwinProfile]) -> Dict[str, Any]:
        """Compare user with peers"""
        if not profile:
            return {}
        
        # Simple peer comparison
        avg_completeness = self.db.query(func.avg(DigitalTwinProfile.profile_completeness_score)).scalar() or 0
        
        return {
            "profile_completeness": {
                "user_score": getattr(profile, 'profile_completeness_score', 0),
                "peer_average": round(avg_completeness, 1),
                "percentile": 75 if getattr(profile, 'profile_completeness_score', 0) > avg_completeness else 25
            }
        }
    
    def _predict_success_factors(self, progress: Optional[GuestOnboardingProgress], 
                                profile: Optional[DigitalTwinProfile]) -> Dict[str, Any]:
        """Predict success factors"""
        predictions = {
            "completion_likelihood": 0.7,
            "engagement_trend": "stable",
            "success_factors": [
                "Regular activity",
                "Profile completeness",
                "Goal clarity"
            ]
        }
        
        if progress and getattr(progress, 'completion_percentage', 0) > 50:
            predictions["completion_likelihood"] = 0.9
            predictions["engagement_trend"] = "positive"
        
        return predictions
    
    def _calculate_similarity_score(self, profile1: DigitalTwinProfile, 
                                  profile2: DigitalTwinProfile) -> float:
        """Calculate similarity score between profiles"""
        score = 0.0
        
        # Industry match
        # Industry match
        if getattr(profile1, 'industry', None) == getattr(profile2, 'industry', None):
            score += 0.3
        
        # Title similarity
        if getattr(profile1, 'professional_title', None) == getattr(profile2, 'professional_title', None):
            score += 0.3
        
        # Experience level
        if getattr(profile1, 'experience_level', None) == getattr(profile2, 'experience_level', None):
            score += 0.2
        
        # Skills overlap (simplified)
        technical_skills1 = getattr(profile1, 'technical_skills', None)
        technical_skills2 = getattr(profile2, 'technical_skills', None)
        if technical_skills1 and technical_skills2:
            try:
                skills1 = set(json.loads(technical_skills1))
                skills2 = set(json.loads(technical_skills2))
                overlap = len(skills1.intersection(skills2))
                total = len(skills1.union(skills2))
                if total > 0:
                    score += 0.2 * (overlap / total)
            except:
                pass
        
        return round(score, 2)


def get_guest_experience_service(db: Session) -> GuestExperienceService:
    """Dependency to get GuestExperienceService instance"""
    return GuestExperienceService(db)