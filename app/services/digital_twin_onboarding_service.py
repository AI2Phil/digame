"""
Digital Twin Onboarding Service
Phase 2: Guided Twin Setup and Skills Assessment
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import json

from ..models.user import User
from ..models.guest_onboarding import GuestOnboardingProgress, DigitalTwinProfile


class DigitalTwinOnboardingService:
    """Service for managing digital twin onboarding process"""
    
    def __init__(self, db: Session):
        self.db = db
        
        # Define the 6-step onboarding process
        self.onboarding_steps = {
            1: {
                "name": "Profile Setup",
                "title": "Tell us about yourself",
                "description": "Basic professional information to get started",
                "fields": ["professional_title", "industry", "experience_level"],
                "estimated_time": 2
            },
            2: {
                "name": "Skills Assessment",
                "title": "What are your skills?",
                "description": "Technical and soft skills with confidence levels",
                "fields": ["technical_skills", "soft_skills", "skill_confidence_scores"],
                "estimated_time": 5
            },
            3: {
                "name": "Personality Profile",
                "title": "How do you work?",
                "description": "Work style and personality preferences",
                "fields": ["personality_type", "work_style_preferences", "communication_style"],
                "estimated_time": 3
            },
            4: {
                "name": "Work Style",
                "title": "Your collaboration style",
                "description": "How you prefer to work with others",
                "fields": ["collaboration_preference", "work_style_preferences"],
                "estimated_time": 2
            },
            5: {
                "name": "Goals Setup",
                "title": "What are your goals?",
                "description": "Short-term and long-term career aspirations",
                "fields": ["short_term_goals", "long_term_goals", "learning_interests", "career_aspirations"],
                "estimated_time": 3
            },
            6: {
                "name": "Twin Preview",
                "title": "Review your digital twin",
                "description": "See your completed profile and make adjustments",
                "fields": ["ai_generated_summary"],
                "estimated_time": 2
            }
        }
        
        # Predefined skill categories and options
        self.skill_categories = {
            "technical": [
                "Python", "JavaScript", "React", "Node.js", "SQL", "AWS", "Docker", 
                "Kubernetes", "Machine Learning", "Data Analysis", "UI/UX Design",
                "Project Management", "Agile", "Scrum", "DevOps", "Git", "API Development"
            ],
            "soft": [
                "Leadership", "Communication", "Problem Solving", "Team Collaboration",
                "Critical Thinking", "Creativity", "Adaptability", "Time Management",
                "Mentoring", "Public Speaking", "Negotiation", "Strategic Planning"
            ]
        }
        
        # Industry options
        self.industries = [
            "Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing",
            "Consulting", "Media", "Government", "Non-profit", "Startup", "Other"
        ]
        
        # Experience levels
        self.experience_levels = [
            "Entry Level (0-2 years)", "Mid Level (3-5 years)", 
            "Senior Level (6-10 years)", "Executive Level (10+ years)"
        ]
        
        # Personality types (simplified)
        self.personality_types = [
            "Analytical", "Creative", "Collaborative", "Independent", 
            "Detail-oriented", "Big Picture", "People-focused", "Task-focused"
        ]
    
    def get_onboarding_status(self, user_id: int) -> Dict[str, Any]:
        """Get current onboarding status for user"""
        progress = self.db.query(GuestOnboardingProgress).filter(
            GuestOnboardingProgress.user_id == user_id
        ).first()
        
        if not progress:
            # Create initial progress record
            progress = GuestOnboardingProgress()
            setattr(progress, 'user_id', user_id)  # type: ignore
            setattr(progress, 'current_step', 1)  # type: ignore
            setattr(progress, 'total_steps', 6)  # type: ignore
            setattr(progress, 'completed_steps', [])  # type: ignore
            setattr(progress, 'started_at', datetime.utcnow())  # type: ignore
            setattr(progress, 'last_activity_at', datetime.utcnow())  # type: ignore
            self.db.add(progress)
            self.db.commit()
        
        current_step_info = self.onboarding_steps.get(getattr(progress, 'current_step', 1), {})
        
        return {
            "user_id": user_id,
            "current_step": getattr(progress, 'current_step', 1),
            "total_steps": getattr(progress, 'total_steps', 6),
            "completed_steps": getattr(progress, 'completed_steps', []) or [],
            "completion_percentage": getattr(progress, 'completion_percentage', 0),
            "estimated_time_remaining": getattr(progress, 'estimated_time_remaining', 0),
            "current_step_info": current_step_info,
            "is_completed": getattr(progress, 'completed_at', None) is not None,
            "started_at": (lambda dt: dt.isoformat() if dt and hasattr(dt, 'isoformat') else None)(getattr(progress, 'started_at', None)),
            "last_activity": (lambda dt: dt.isoformat() if dt and hasattr(dt, 'isoformat') else None)(getattr(progress, 'last_activity_at', None))
        }
    
    def get_step_data(self, user_id: int, step_number: int) -> Dict[str, Any]:
        """Get data and options for a specific onboarding step"""
        if step_number not in self.onboarding_steps:
            raise ValueError(f"Invalid step number: {step_number}")
        
        step_info = self.onboarding_steps[step_number]
        
        # Get current profile data
        profile = self.db.query(DigitalTwinProfile).filter(
            DigitalTwinProfile.user_id == user_id
        ).first()
        
        current_data = {}
        if profile:
            fields = step_info.get("fields", [])
            if isinstance(fields, list):
                for field in fields:
                    value = getattr(profile, field, None)  # type: ignore
                    if value and isinstance(value, str) and field in ["technical_skills", "soft_skills", "short_term_goals", "long_term_goals", "learning_interests"]:
                        try:
                            current_data[field] = json.loads(value) if value else []
                        except:
                            current_data[field] = []
                    elif value and isinstance(value, str) and field == "skill_confidence_scores":
                        try:
                            current_data[field] = json.loads(value) if value else {}
                        except:
                            current_data[field] = {}
                    else:
                        current_data[field] = value
        
        # Prepare step-specific options
        step_options = {}
        
        if step_number == 1:  # Profile Setup
            step_options = {
                "industries": self.industries,
                "experience_levels": self.experience_levels
            }
        elif step_number == 2:  # Skills Assessment
            step_options = {
                "technical_skills": self.skill_categories["technical"],
                "soft_skills": self.skill_categories["soft"],
                "confidence_levels": list(range(1, 11))  # 1-10 scale
            }
        elif step_number == 3:  # Personality Profile
            step_options = {
                "personality_types": self.personality_types,
                "communication_styles": ["Direct", "Collaborative", "Supportive", "Analytical"],
                "work_styles": {
                    "pace": ["Fast-paced", "Steady", "Deliberate"],
                    "environment": ["Quiet", "Collaborative", "Dynamic"],
                    "feedback": ["Frequent", "Regular", "As-needed"]
                }
            }
        elif step_number == 4:  # Work Style
            step_options = {
                "collaboration_preferences": ["Team-based", "Independent", "Hybrid", "Leadership"],
                "meeting_preferences": ["Frequent check-ins", "Weekly updates", "As-needed", "Minimal meetings"]
            }
        elif step_number == 5:  # Goals Setup
            step_options = {
                "goal_timeframes": ["3 months", "6 months", "1 year", "2+ years"],
                "learning_areas": [
                    "Technical Skills", "Leadership", "Communication", "Industry Knowledge",
                    "Certifications", "Management", "Entrepreneurship", "Networking"
                ]
            }
        
        return {
            "step_number": step_number,
            "step_info": step_info,
            "current_data": current_data,
            "options": step_options,
            "is_completed": step_number in (current_data.get("completed_steps", []) or [])
        }
    
    def save_step_data(self, user_id: int, step_number: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Save data for a specific onboarding step"""
        if step_number not in self.onboarding_steps:
            raise ValueError(f"Invalid step number: {step_number}")
        
        # Get or create profile
        profile = self.db.query(DigitalTwinProfile).filter(
            DigitalTwinProfile.user_id == user_id
        ).first()
        
        if not profile:
            profile = DigitalTwinProfile()
            setattr(profile, 'user_id', user_id)  # type: ignore
            self.db.add(profile)
        
        # Update profile based on step
        step_info = self.onboarding_steps[step_number]
        
        fields = step_info.get("fields", [])
        if isinstance(fields, list):
            for field in fields:
                if field in data:
                    value = data[field]
                    
                    # Convert lists and dicts to JSON strings for storage
                    if isinstance(value, (list, dict)):
                        value = json.dumps(value)
                    
                    setattr(profile, field, value)  # type: ignore
        
        setattr(profile, 'last_updated', datetime.utcnow())  # type: ignore
        
        # Update onboarding progress
        progress = self.db.query(GuestOnboardingProgress).filter(
            GuestOnboardingProgress.user_id == user_id
        ).first()
        
        if progress:
            completed_steps = getattr(progress, 'completed_steps', None) or []  # type: ignore
            if step_number not in completed_steps:
                completed_steps.append(step_number)
                setattr(progress, 'completed_steps', completed_steps)  # type: ignore
                total_steps = getattr(progress, 'total_steps', 6)  # type: ignore
                setattr(progress, 'completion_percentage', (len(completed_steps) / total_steps) * 100)  # type: ignore
                setattr(progress, 'last_activity_at', datetime.utcnow())  # type: ignore
                
                # Update current step to next incomplete step
                next_step = step_number + 1
                if next_step <= total_steps:
                    setattr(progress, 'current_step', next_step)  # type: ignore
                
                # Mark specific step as completed
                if step_number == 1:
                    setattr(progress, 'profile_setup_completed', True)  # type: ignore
                elif step_number == 2:
                    setattr(progress, 'skills_assessment_completed', True)  # type: ignore
                elif step_number == 3:
                    setattr(progress, 'personality_profile_completed', True)  # type: ignore
                elif step_number == 4:
                    setattr(progress, 'work_style_completed', True)  # type: ignore
                elif step_number == 5:
                    setattr(progress, 'goals_setup_completed', True)  # type: ignore
                elif step_number == 6:
                    setattr(progress, 'twin_preview_completed', True)  # type: ignore
                    setattr(progress, 'completed_at', datetime.utcnow())  # type: ignore
        
        # Calculate profile completeness
        self._calculate_profile_completeness(profile)
        
        self.db.commit()
        
        return {
            "success": True,
            "step_completed": step_number,
            "next_step": getattr(progress, 'current_step', step_number + 1) if progress else step_number + 1,  # type: ignore
            "completion_percentage": getattr(progress, 'completion_percentage', 0) if progress else 0,  # type: ignore
            "profile_completeness": getattr(profile, 'profile_completeness_score', 0)  # type: ignore
        }
    
    def _calculate_profile_completeness(self, profile: DigitalTwinProfile):
        """Calculate profile completeness score"""
        total_fields = 12
        completed_fields = 0
        
        if getattr(profile, 'professional_title', None): completed_fields += 1  # type: ignore
        if getattr(profile, 'industry', None): completed_fields += 1  # type: ignore
        if getattr(profile, 'experience_level', None): completed_fields += 1  # type: ignore
        if getattr(profile, 'technical_skills', None): completed_fields += 1  # type: ignore
        if getattr(profile, 'soft_skills', None): completed_fields += 1  # type: ignore
        if getattr(profile, 'personality_type', None): completed_fields += 1  # type: ignore
        if getattr(profile, 'work_style_preferences', None): completed_fields += 1  # type: ignore
        if getattr(profile, 'communication_style', None): completed_fields += 1  # type: ignore
        if getattr(profile, 'short_term_goals', None): completed_fields += 1  # type: ignore
        if getattr(profile, 'long_term_goals', None): completed_fields += 1  # type: ignore
        if getattr(profile, 'learning_interests', None): completed_fields += 1  # type: ignore
        if getattr(profile, 'career_aspirations', None): completed_fields += 1  # type: ignore
        
        completeness_score = (completed_fields / total_fields) * 100
        setattr(profile, 'profile_completeness_score', completeness_score)  # type: ignore
    
    def generate_twin_summary(self, user_id: int) -> Dict[str, Any]:
        """Generate AI summary of the digital twin profile"""
        profile = self.db.query(DigitalTwinProfile).filter(
            DigitalTwinProfile.user_id == user_id
        ).first()
        
        if not profile:
            raise ValueError("Profile not found")
        
        # Generate a summary based on the profile data
        summary_parts = []
        
        professional_title = getattr(profile, 'professional_title', None)  # type: ignore
        industry = getattr(profile, 'industry', None)  # type: ignore
        experience_level = getattr(profile, 'experience_level', None)  # type: ignore
        
        if professional_title and industry:
            summary_parts.append(f"A {experience_level or 'professional'} {professional_title} in the {industry} industry")
        
        technical_skills = getattr(profile, 'technical_skills', None)  # type: ignore
        if technical_skills:
            try:
                tech_skills = json.loads(str(technical_skills))
                if tech_skills:
                    summary_parts.append(f"with expertise in {', '.join(tech_skills[:3])}")
            except:
                pass
        
        personality_type = getattr(profile, 'personality_type', None)  # type: ignore
        if personality_type:
            summary_parts.append(f"Known for being {str(personality_type).lower()}")
        
        short_term_goals = getattr(profile, 'short_term_goals', None)  # type: ignore
        if short_term_goals:
            try:
                goals = json.loads(str(short_term_goals))
                if goals:
                    summary_parts.append(f"Currently focused on {goals[0].lower()}")
            except:
                pass
        
        ai_summary = ". ".join(summary_parts) + "."
        
        # Save the summary
        setattr(profile, 'ai_generated_summary', ai_summary)  # type: ignore
        setattr(profile, 'last_updated', datetime.utcnow())  # type: ignore
        
        # Calculate twin accuracy (simplified)
        completeness_score = getattr(profile, 'profile_completeness_score', 0)  # type: ignore
        accuracy_score = min(float(completeness_score) * 0.9, 95.0)
        setattr(profile, 'twin_accuracy_score', accuracy_score)  # type: ignore
        
        self.db.commit()
        
        return {
            "summary": ai_summary,
            "completeness_score": getattr(profile, 'profile_completeness_score', 0),  # type: ignore
            "accuracy_score": getattr(profile, 'twin_accuracy_score', 0),  # type: ignore
            "recommendations": self._generate_recommendations(profile)
        }
    
    def _generate_recommendations(self, profile: DigitalTwinProfile) -> List[str]:
        """Generate recommendations for profile improvement"""
        recommendations = []
        
        technical_skills = getattr(profile, 'technical_skills', None)  # type: ignore
        if not technical_skills:
            recommendations.append("Add technical skills to showcase your expertise")
        
        soft_skills = getattr(profile, 'soft_skills', None)  # type: ignore
        if not soft_skills:
            recommendations.append("Include soft skills to highlight your interpersonal abilities")
        
        short_term_goals = getattr(profile, 'short_term_goals', None)  # type: ignore
        if not short_term_goals:
            recommendations.append("Set short-term goals to track your progress")
        
        learning_interests = getattr(profile, 'learning_interests', None)  # type: ignore
        if not learning_interests:
            recommendations.append("Specify learning interests to get personalized recommendations")
        
        completeness_score = getattr(profile, 'profile_completeness_score', 0)  # type: ignore
        if float(completeness_score) < 80:
            recommendations.append("Complete more profile sections to improve your twin accuracy")
        
        return recommendations


def get_digital_twin_onboarding_service(db: Session) -> DigitalTwinOnboardingService:
    """Dependency to get DigitalTwinOnboardingService instance"""
    return DigitalTwinOnboardingService(db)